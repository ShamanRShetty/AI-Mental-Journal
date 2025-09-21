import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import BreathingExercise from "@/components/crisis/BreathingExercise";
import GroundingExercise from "@/components/crisis/GroundingExercise";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

type TFn = (key: any) => any;

export default function CopingToolsSection({ t }: { t: TFn }) {
  const { flags } = useFeatureFlags();

  return (
    <div className="space-y-8">
      {flags.breathingVisualizer && <BreathingExercise t={t} />}
      {flags.groundingChecklist && <GroundingExercise t={t} />}

      <Card>
        <CardHeader>
          <CardTitle>{t("quickTips")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {t("quickCopingTips").map((tip: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
