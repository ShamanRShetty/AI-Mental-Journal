import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Heart, Send, Loader2, ArrowLeft, AlertTriangle, Mic, Square, LifeBuoy } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useAction, useQuery } from "convex/react";
import { toast } from "sonner";
import CrisisSupport from "@/components/CrisisSupport";

export default function Journal() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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
  const transcribeAudio = useAction(api.ai.transcribeAudio);

  const analyzeEntry = useAction(api.ai.analyzeJournalEntry);
  const entries = useQuery(api.journals.getUserEntries);
  // Add: current user for guest-mode banner
  const user = useQuery(api.users.currentUser, {});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) {
      toast.error("Please write something before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Auto-detect Hindi if user typed in Devanagari, but allow manual override
      // Expand targetLang to include all supported languages
      let targetLang: "en" | "hi" | "kn" | "ta" | "te" | "ml" = language;
      if (isHindiText(journalText) && language !== "hi") {
        targetLang = "hi";
        toast("Detected Hindi text — generating reflection in Hindi.");
      }

      const result = await analyzeEntry({ text: journalText, language: targetLang });
      setCurrentReflection(result.reflection);

      if ((result as any).saved === false) {
        toast("You're in guest mode — entries aren't saved.", {
          description: "Sign in with email to save your reflections.",
        });
      }

      if (result.moodScore < -0.6) {
        setShowCrisisAlert(true);
      }

      setJournalText("");
      toast.success("Journal entry processed.");
    } catch (error) {
      console.error("Error submitting journal entry:", error);
      toast.error("Failed to save journal entry. Please try again.");
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 mb-2">We're here for you</h3>
                    <p className="text-orange-800 mb-4">
                      It sounds like you're going through a difficult time. Remember that you're not alone, and help is available.
                    </p>
                    <div className="space-y-2 text-sm mb-4">
                      <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                      <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
                      <p><strong>Teen Line:</strong> 1-800-852-8336</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => setCrisisSupportOpen(true)}
                        className="bg-red-600 hover:bg-red-700 whitespace-normal break-words text-center flex-wrap"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Open Crisis Support
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('tel:988')}
                        className="whitespace-normal break-words text-center flex-wrap"
                      >
                        Call 988 (US)
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowCrisisAlert(false)}
                        className="whitespace-normal break-words text-center flex-wrap"
                      >
                        I understand
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Journal Entry Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  How are you feeling today?
                </CardTitle>
                <p className="text-gray-600">
                  Take a moment to express your thoughts and emotions. This is your safe space.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Reflection language:</span>
                    <Select
                      value={language}
                      onValueChange={(val) => setLanguage(val as "en" | "hi" | "kn" | "ta" | "te" | "ml")}
                    >
                      <SelectTrigger className="w-[260px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                        <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                        <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                        <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                        <SelectItem value="ml">മലയാളം (Malayalam)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Write about your day, your feelings, your thoughts... anything that's on your mind."
                    className="min-h-[300px] resize-none text-base leading-relaxed"
                    disabled={isSubmitting}
                  />
                  {isRecording && interimTranscript && (
                    <p className="text-sm text-gray-500">
                      Listening: <span className="italic">{interimTranscript}</span>
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isSubmitting}
                      className="mr-2"
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Stop Voice
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Start Voice
                        </>
                      )}
                    </Button>

                    <Button
                      type="submit"
                      className="ml-auto"
                      size="lg"
                      disabled={isSubmitting || !journalText.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Entry
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Reflection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-lg h-fit">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  AI Reflection
                </CardTitle>
                <p className="text-gray-600">
                  Receive empathetic insights about your journal entry.
                </p>
              </CardHeader>
              <CardContent>
                {currentReflection ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg"
                  >
                    <p className="text-gray-800 leading-relaxed">{currentReflection}</p>
                  </motion.div>
                ) : (
                  <div className="p-6 bg-gray-50 rounded-lg text-center">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Submit a journal entry to receive your personalized reflection.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Entries */}
            {entries && entries.length > 0 && (
              <Card className="shadow-lg mt-8">
                <CardHeader>
                  <CardTitle className="text-xl font-bold tracking-tight">
                    Recent Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {entries.slice(0, 5).map((entry) => (
                      <div key={entry._id} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(entry._creationTime).toLocaleDateString()}
                        </p>
                        <p className="text-gray-800 text-sm line-clamp-3">
                          {entry.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Crisis Support Modal */}
      <CrisisSupport
        open={crisisSupportOpen}
        onOpenChange={setCrisisSupportOpen}
        emergencyMode={showCrisisAlert}
      />
    </div>
  );
}