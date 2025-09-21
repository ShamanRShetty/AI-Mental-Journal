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

  // Add: reduced motion preference & live region / keyboard controls
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  // Add: keyboard handlers for start/stop/reset (Enter/Space)
  const onKeyActivate = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!breathingActive) {
        startBreathing();
      } else {
        pauseBreathing();
      }
    }
  };

  // Announce phase/count via ARIA live
  useEffect(() => {
    try {
      if (liveRegionRef.current) {
        const phaseLabel = t(breathingLabelKeyByPhase[breathingPhase]) as string;
        liveRegionRef.current.textContent = `${phaseLabel}: ${breathingCount}s`;
      }
    } catch {}
  }, [breathingPhase, breathingCount, t]);

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

  const startBreathing = () => {
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

  const pauseBreathing = () => {
    setBreathingActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetBreathing = () => {
    pauseBreathing();
    setBreathingPhase("inhale");
    setBreathingCount(4);
  };

  return (
    <Card role="region" aria-label="Breathing visualizer">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('breathing')}</span>
          {!prefersReducedMotion && (
            <span className="text-xs text-muted-foreground">
              Press Enter/Space to {breathingActive ? t('pause') : t('start')}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Live region for screen readers */}
        <div
          ref={liveRegionRef}
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Animated visualizer */}
        <div
          tabIndex={0}
          onKeyDown={onKeyActivate}
          className="mx-auto mb-4 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring rounded-lg"
        >
          <div
            aria-hidden="true"
            className={[
              "h-28 w-28 rounded-full bg-blue-200/70 dark:bg-blue-300/30 transition-transform",
              prefersReducedMotion
                ? ""
                : breathingPhase === "inhale"
                ? "scale-110"
                : breathingPhase === "hold"
                ? "scale-100"
                : "scale-90",
            ].join(" ")}
            style={{
              transitionDuration: prefersReducedMotion
                ? "0ms"
                : breathingPhase === "inhale"
                ? "1000ms"
                : breathingPhase === "hold"
                ? "700ms"
                : "1000ms",
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" onClick={startBreathing} aria-pressed={breathingActive}>
            <Play className="w-4 h-4 mr-2" />
            {t('start')}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={pauseBreathing}>
            <Pause className="w-4 h-4 mr-2" />
            {t('pause')}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={resetBreathing}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('reset')}
          </Button>
        </div>

        {/* Phase and countdown for text users */}
        <div className="mt-3 text-sm text-muted-foreground">
          <span className="font-medium">
            {t(breathingLabelKeyByPhase[breathingPhase])}
          </span>
          : {breathingCount}s
        </div>

        {/* Motion preference hint */}
        {prefersReducedMotion && (
          <p className="mt-2 text-xs text-muted-foreground">
            Animations are reduced per your system settings.
          </p>
        )}
      </CardContent>
    </Card>
  );
}