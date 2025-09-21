import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Printer, Save, Trash2 } from "lucide-react";

type TFn = (key: any) => any;

type SafetyPlan = {
  warningSigns: string[];
  copingStrategies: string[];
  supportContacts: string[];
  professionals: string[];
  environmentSafety: string[];
  emergencyContacts: string[];
};

export default function SafetyPlanSection({
  t,
  safetyPlan,
  saveSafetyPlan,
  exportSafetyPlan,
  printSafetyPlan,
  clearSafetyPlan,
  updateSafetyPlanField,
  addSafetyPlanItem,
  removeSafetyPlanItem,
}: {
  t: TFn;
  safetyPlan: SafetyPlan;
  saveSafetyPlan: () => void;
  exportSafetyPlan: () => void;
  printSafetyPlan: () => void;
  clearSafetyPlan: () => void;
  updateSafetyPlanField: (field: keyof SafetyPlan, index: number, value: string) => void;
  addSafetyPlanItem: (field: keyof SafetyPlan) => void;
  removeSafetyPlanItem: (field: keyof SafetyPlan, index: number) => void;
}) {
  const groups = [
    { key: "warningSigns", title: t("warningSignsTitle"), desc: t("warningSignsDesc") },
    { key: "copingStrategies", title: t("copingStrategiesTitle"), desc: t("copingStrategiesDesc") },
    { key: "supportContacts", title: t("supportContactsTitle"), desc: t("supportContactsDesc") },
    { key: "professionals", title: t("professionalsTitle"), desc: t("professionalsDesc") },
    { key: "environmentSafety", title: t("environmentTitle"), desc: t("environmentDesc") },
    { key: "emergencyContacts", title: t("emergencyContactsTitle"), desc: t("emergencyContactsDesc") },
  ] as Array<{ key: keyof SafetyPlan; title: string; desc: string }>;

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{t("privacyNotice")}</div>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={saveSafetyPlan} size="sm">
          <Save className="w-4 h-4 mr-2" />
          {t("saveLocal")}
        </Button>
        <Button onClick={exportSafetyPlan} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          {t("exportPlan")}
        </Button>
        <Button onClick={printSafetyPlan} variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-2" />
          {t("printPlan")}
        </Button>
        <Button onClick={clearSafetyPlan} variant="destructive" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          {t("clearPlan")}
        </Button>
      </div>

      {groups.map((field) => (
        <Card key={field.key}>
          <CardHeader>
            <CardTitle className="text-lg">{field.title}</CardTitle>
            <p className="text-sm text-gray-600">{field.desc}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {safetyPlan[field.key].map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateSafetyPlanField(field.key, index, e.target.value)}
                  placeholder={`${field.title} ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  onClick={() => removeSafetyPlanItem(field.key, index)}
                  variant="outline"
                  size="sm"
                  aria-label={`Remove ${field.title} ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button onClick={() => addSafetyPlanItem(field.key)} variant="outline" size="sm" className="w-full">
              Add {field.title}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
