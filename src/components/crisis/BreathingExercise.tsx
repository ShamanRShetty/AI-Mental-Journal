import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Play, Pause, RotateCcw } from "lucide-react";

type TFn = (key: any) => any;

export default function BreathingExercise({ t }: { t: TFn }) {
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathingCount, setBreathingCount] = useState(4);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const breathingLabelKeyByPhase: Record<"inhale" | "hold" | "exhale", "breathingInhale" | "breathingHold" | "breathingExhale"> = {
    inhale: "breathingInhale",
    hold: "breathingHold",
    exhale: "breathingExhale",
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const playChime = () => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioContext = new AudioCtx();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch {
      // no-op
    }
  };

  const start = () => {
    if (breathingActive) return;
    setBreathingActive(true);
    setBreathingPhase("inhale");
    setBreathingCount(4);
    playChime();

    intervalRef.current = setInterval(() => {
      setBreathingCount((prev) => {
        if (prev <= 1) {
          setBreathingPhase((current) => {
            if (current === "inhale") {
              setBreathingCount(7);
              return "hold";
            }
            if (current === "hold") {
              setBreathingCount(8);
              return "exhale";
            }
            setBreathingCount(4);
            playChime();
            return "inhale";
          });
          return prev;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pause = () => {
    setBreathingActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const reset = () => {
    pause();
    setBreathingPhase("inhale");
    setBreathingCount(4);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          {t("breathing")}
        </CardTitle>
        <p className="text-sm text-gray-600">{t("breathingDesc")}</p>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className="text-6xl font-bold text-blue-600" aria-live="polite">
            {breathingCount}
          </div>
          <div className="text-xl font-medium" aria-live="polite">
            {t(breathingLabelKeyByPhase[breathingPhase] as any)}
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={breathingActive ? pause : start} variant={breathingActive ? "destructive" : "default"} aria-label={breathingActive ? t("pause") : t("start")}>
              {breathingActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {breathingActive ? t("pause") : t("start")}
            </Button>
            <Button onClick={reset} variant="outline" aria-label={t("reset")}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t("reset")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}