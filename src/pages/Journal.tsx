import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Heart, Loader2, ArrowLeft, LifeBuoy } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useAction, useQuery } from "convex/react";
import { toast } from "sonner";
import CrisisSupport from "@/components/CrisisSupport";
import JournalEntryForm from "@/components/journal/JournalEntryForm";
import ReflectionPanel from "@/components/journal/ReflectionPanel";
import RecentEntries from "@/components/journal/RecentEntries";
import CrisisAlertBanner from "@/components/journal/CrisisAlertBanner";

export default function Journal() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [journalText, setJournalText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentReflection, setCurrentReflection] = useState<string | null>(null);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [crisisSupportOpen, setCrisisSupportOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState(""); // optional short preview
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Array<BlobPart>>([]);
  const [language, setLanguage] = useState<"en" | "hi" | "kn" | "ta" | "te" | "ml">("en");
  // Add: textarea ref to restore focus after submit
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // Add: session mood scores for simple summary
  const [sessionMoods, setSessionMoods] = useState<number[]>([]);
  // Add: last failed text to enable retry inline
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  // Map Journal language to CrisisSupport-supported languages
  const crisisLang: "en" | "es" | "hi" = language === "hi" ? "hi" : "en";
  const transcribeAudio = useAction(api.ai.transcribeAudio);

  const analyzeEntry = useAction(api.ai.analyzeJournalEntry);
  const entries = useQuery(api.journals.getUserEntries, {});

  // Add: simple detector for Hindi (Devanagari) characters
  const isHindiText = (text: string) => /[\u0900-\u097F]/.test(text);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }
      } catch {}
      mediaRecorderRef.current = null;
      chunksRef.current = [];
    };
  }, []);

  // Add: mark that the user has visited the Journal page for this session
  useEffect(() => {
    try {
      sessionStorage.setItem("visitedJournal", "true");
    } catch {}
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
        setIsRecording(false);
        setInterimTranscript("");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const startRecording = async () => {
    if (isRecording) return;

    // Request mic permission and start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mr.onstart = () => {
        setIsRecording(true);
        setInterimTranscript("Listening...");
        toast("Listening... Speak your journal entry.");
      };

      mr.onstop = async () => {
        setIsRecording(false);
        setInterimTranscript("");
        try {
          const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
          chunksRef.current = [];

          // Stop all tracks
          stream.getTracks().forEach((t) => t.stop());

          const arrayBuffer = await blob.arrayBuffer();
          const base64 = btoa(
            String.fromCharCode(...new Uint8Array(arrayBuffer))
          );

          const result = await transcribeAudio({
            audioBase64: base64,
            mimeType: blob.type || "audio/webm",
          });

          const transcriptText = (result as any)?.transcript?.trim();
          if (transcriptText) {
            setJournalText((prev) => (prev ? `${prev.trim()} ${transcriptText}` : transcriptText));
            toast.success("Transcribed and added to your entry.");
          } else {
            toast.error("No transcription received. Please try again.");
          }
        } catch (err) {
          console.error("Transcription error:", err);
          toast.error("Failed to transcribe audio. Please try again.");
        } finally {
          mediaRecorderRef.current = null;
        }
      };

      mr.start();
      mediaRecorderRef.current = mr;
    } catch (err: any) {
      console.error("Microphone error:", err);
      if (err?.name === "NotAllowedError") {
        toast.error("Microphone permission denied. Please allow mic access in your browser settings.");
      } else if (err?.name === "NotFoundError") {
        toast.error("No microphone found. Please connect a mic and try again.");
      } else if (location.protocol !== "https:" && location.hostname !== "localhost") {
        toast.error("Voice input requires HTTPS (or localhost). Please switch to a secure context.");
      } else {
        toast.error("Could not start recording. Please try again.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
        toast("Stopped listening.");
      } catch {}
    }
  };

  // Extract core processing so we can reuse for retry
  const processEntry = async (textToUse: string) => {
    // Auto-detect Hindi if user typed in Devanagari, but allow manual override
    let targetLang: "en" | "hi" | "kn" | "ta" | "te" | "ml" = language;
    if (isHindiText(textToUse) && language !== "hi") {
      targetLang = "hi";
      toast("Detected Hindi text — generating reflection in Hindi.");
    }

    const result = await analyzeEntry({ text: textToUse, language: targetLang });
    setCurrentReflection(result.reflection);

    if ((result as any).saved === false) {
      toast("You're in guest mode — entries aren't saved.", {
        description: "Sign in with email to save your reflections.",
      });
    }

    if (result.moodScore < -0.6) {
      setShowCrisisAlert(true);
    }

    // Track simple session mood trend (keep last 5)
    setSessionMoods((prev) => {
      const next = [...prev, result.moodScore];
      return next.slice(-5);
    });

    // Clear input and refocus
    setJournalText("");
    setLastFailedText(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
    toast.success("Journal entry processed.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) {
      toast.error("Please share a thought or feeling first.");
      return;
    }

    setIsSubmitting(true);
    try {
      await processEntry(journalText);
    } catch (error) {
      console.error("Error submitting journal entry:", error);
      setLastFailedText(journalText);
      toast.error("Hmm, something went wrong. Try again?");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">Journal</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCrisisSupportOpen(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 whitespace-normal break-words text-center flex-wrap"
                aria-label="Open crisis support resources"
              >
                <LifeBuoy className="w-4 h-4 mr-2" />
                Help
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Guest Mode Banner */}
        {user && user.isAnonymous && (
          <div className="mb-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    You're in guest mode — entries are not saved.
                  </p>
                  <p className="text-xs text-blue-800">
                    Sign in with email to securely save your reflections and mood history.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="whitespace-normal break-words text-center flex-wrap"
                  onClick={() => {
                    try {
                      sessionStorage.setItem("fromSignInToSave", "true");
                    } catch {}
                    navigate("/auth");
                  }}
                >
                  Sign in to save
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Crisis Alert */}
        {showCrisisAlert && (
          <CrisisAlertBanner
            onOpenCrisisSupport={() => setCrisisSupportOpen(true)}
            onDismiss={() => setShowCrisisAlert(false)}
          />
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Journal Entry Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <JournalEntryForm
              language={language}
              setLanguage={setLanguage}
              journalText={journalText}
              setJournalText={setJournalText}
              isSubmitting={isSubmitting}
              isRecording={isRecording}
              interimTranscript={interimTranscript}
              startRecording={startRecording}
              stopRecording={stopRecording}
              handleSubmit={handleSubmit}
              textareaRef={textareaRef}
            />
            {/* Inline retry helper if last attempt failed */}
            {lastFailedText && (
              <Card className="mt-3">
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    We couldn't process your last entry.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setJournalText(lastFailedText)}
                      aria-label="Restore last entry"
                    >
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        setIsSubmitting(true);
                        try {
                          await processEntry(lastFailedText);
                        } catch {
                          toast.error("Still having trouble — please try again.");
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      aria-label="Retry sending last entry"
                    >
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* AI Reflection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ReflectionPanel currentReflection={currentReflection} />

            {/* Simple session summary after a few entries */}
            {sessionMoods.length >= 3 && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Want a quick takeaway for today?
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        const avg =
                          sessionMoods.reduce((a, b) => a + b, 0) / sessionMoods.length;
                        const sentence =
                          avg > 0.2
                            ? "Today's reflections suggest an overall positive mood with moments of strength."
                            : avg < -0.2
                            ? "Today felt challenging — you showed courage by putting feelings into words."
                            : "Your mood seems balanced today — steady and reflective.";
                        setCurrentReflection(sentence);
                      }}
                      aria-label="Summarize how you're feeling today"
                    >
                      Summarize Today
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <RecentEntries entries={entries} />
          </motion.div>
        </div>
      </div>

      {/* Crisis Support Modal */}
      <CrisisSupport
        open={crisisSupportOpen}
        onOpenChange={setCrisisSupportOpen}
        emergencyMode={showCrisisAlert}
        langCode={crisisLang}
      />
    </div>
  );
}