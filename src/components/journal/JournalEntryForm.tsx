import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mic, Send, Square } from "lucide-react";
import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  language: "en" | "hi" | "kn" | "ta" | "te" | "ml";
  setLanguage: (l: "en" | "hi" | "kn" | "ta" | "te" | "ml") => void;
  journalText: string;
  setJournalText: (v: string) => void;
  isSubmitting: boolean;
  isRecording: boolean;
  interimTranscript: string;
  startRecording: () => void;
  stopRecording: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
};

export default function JournalEntryForm({
  language,
  setLanguage,
  journalText,
  setJournalText,
  isSubmitting,
  isRecording,
  interimTranscript,
  startRecording,
  stopRecording,
  handleSubmit,
  textareaRef,
}: Props) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <span>How are you feeling today?</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs font-semibold text-muted-foreground"
                  aria-label="About privacy and how it works"
                >
                  i
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs text-sm leading-relaxed">
                100% private. Nothing is saved or stored unless you sign in. Made for you, by youth who care.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
              onValueChange={(val) =>
                setLanguage(val as "en" | "hi" | "kn" | "ta" | "te" | "ml")
              }
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
            ref={textareaRef}
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="I'm feeling overwhelmed with exams and expectations today..."
            className="min-h-[300px] resize-none text-base leading-relaxed"
            disabled={isSubmitting}
            aria-label="Journal input"
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
              aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
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
              aria-label="Send for AI reflection"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI is reflecting…
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
  );
}