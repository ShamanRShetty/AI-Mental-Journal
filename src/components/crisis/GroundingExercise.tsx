import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type TFn = (key: any) => any;

export default function GroundingExercise({ t }: { t: TFn }) {
  const STORAGE_KEY = "groundingProgress.v1";
  const [progress, setProgress] = useState<{see: number; touch: number; hear: number; smell: number; taste: number}>({
    see: 0, touch: 0, hear: 0, smell: 0, taste: 0
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setProgress({
          see: Number(parsed.see) || 0,
          touch: Number(parsed.touch) || 0,
          hear: Number(parsed.hear) || 0,
          smell: Number(parsed.smell) || 0,
          taste: Number(parsed.taste) || 0,
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  const makeButton = (key: keyof typeof progress, max: number, label: string) => {
    const value = progress[key];
    const done = value >= max;
    return (
      <div key={key} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setProgress((p) => ({ ...p, [key]: Math.min(max, (p[key] || 0) + 1) }))}
          onContextMenu={(e) => {
            e.preventDefault();
            setProgress((p) => ({ ...p, [key]: Math.max(0, (p[key] || 0) - 1) }));
          }}
          aria-pressed={done}
          aria-label={`${label}: ${value}/${max}`}
          className={[
            "px-3 py-2 rounded-md border text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring",
            done ? "bg-green-600 text-white border-green-700" : "bg-background",
          ].join(" ")}
        >
          {value}/{max}
        </button>
        <span className="text-sm">{label}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {t("grounding")}
        </CardTitle>
        <p className="text-sm text-gray-600">{t("groundingDesc")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {makeButton("see", 5, t('see5'))}
        {makeButton("touch", 4, t('touch4'))}
        {makeButton("hear", 3, t('hear3'))}
        {makeButton("smell", 2, t('smell2'))}
        {makeButton("taste", 1, t('taste1'))}
        <div className="pt-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setProgress({ see: 0, touch: 0, hear: 0, smell: 0, taste: 0 })
            }
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}