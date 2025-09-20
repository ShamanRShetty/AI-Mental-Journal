import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type TFn = (key: any) => any;

export default function GroundingExercise({ t }: { t: TFn }) {
  const [groundingChecked, setGroundingChecked] = useState({
    see: 0,
    touch: 0,
    hear: 0,
    smell: 0,
    taste: 0,
  });

  const groundingLabelByKey: Record<"see" | "touch" | "hear" | "smell" | "taste", "see5" | "touch4" | "hear3" | "smell2" | "taste1"> = {
    see: "see5",
    touch: "touch4",
    hear: "hear3",
    smell: "smell2",
    taste: "taste1",
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
      <CardContent>
        <p className="mb-4 font-medium">{t("groundingPrompt")}</p>
        <div className="space-y-3">
          {([
            { key: "see", max: 5 },
            { key: "touch", max: 4 },
            { key: "hear", max: 3 },
            { key: "smell", max: 2 },
            { key: "taste", max: 1 },
          ] as const).map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              <div className="flex gap-1">
                {Array.from({ length: item.max }, (_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={i < groundingChecked[item.key] ? "default" : "outline"}
                    onClick={() =>
                      setGroundingChecked((prev) => ({
                        ...prev,
                        [item.key]: i < prev[item.key] ? i : i + 1,
                      }))
                    }
                    className="w-8 h-8 p-0"
                    aria-label={`Check item ${i + 1} for ${item.key}`}
                  >
                    {i < groundingChecked[item.key] ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </Button>
                ))}
              </div>
              <span className="text-sm">{t(groundingLabelByKey[item.key] as any)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}