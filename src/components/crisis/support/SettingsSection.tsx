import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Globe, Languages, Save } from "lucide-react";

type TFn = (key: any) => any;

type CountriesMap = Record<
  string,
  {
    code: string;
    name: string;
    emergencyNumber: string;
    crisisPhone: string;
    crisisTextNumber?: string;
    smsBody?: string;
    links: Array<{ name: string; url: string }>;
  }
>;

export default function SettingsSection({
  t,
  COUNTRIES,
  baseCountry,
  activeCountry,
  selectedCountry,
  setSelectedCountry,
  selectedLanguage,
  setSelectedLanguage,
  countryOverrides,
  setCountryOverrides,
  serverStorageEnabled,
  setServerStorageEnabled,
  analyticsEnabled,
  setAnalyticsEnabled,
  reviewDate,
  setReviewDate,
  reviewerName,
  setReviewerName,
  saveSettings,
}: {
  t: TFn;
  COUNTRIES: CountriesMap;
  baseCountry: CountriesMap[string];
  activeCountry: CountriesMap[string];
  selectedCountry: keyof CountriesMap;
  setSelectedCountry: (code: keyof CountriesMap) => void;
  selectedLanguage: "en" | "es" | "hi";
  setSelectedLanguage: (lang: "en" | "es" | "hi") => void;
  countryOverrides: Record<string, Partial<CountriesMap[string]>>;
  setCountryOverrides: React.Dispatch<React.SetStateAction<Record<string, Partial<CountriesMap[string]>>>>;
  serverStorageEnabled: boolean;
  setServerStorageEnabled: (v: boolean) => void;
  analyticsEnabled: boolean;
  setAnalyticsEnabled: (v: boolean) => void;
  reviewDate: string;
  setReviewDate: (v: string) => void;
  reviewerName: string;
  setReviewerName: (v: string) => void;
  saveSettings: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t("country")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedCountry as string} onValueChange={(value: string) => setSelectedCountry(value as keyof CountriesMap)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COUNTRIES)
                .filter(([code]) => code !== "US")
                .map(([code, c]) => (
                  <SelectItem key={code} value={code}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p>
              <strong>Emergency:</strong> {activeCountry.emergencyNumber}
            </p>
            <p>
              <strong>Crisis Line:</strong> {activeCountry.crisisPhone}
            </p>
            {activeCountry.crisisTextNumber && (
              <p>
                <strong>Crisis Text:</strong> {activeCountry.crisisTextNumber}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            {t("language")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedLanguage} onValueChange={(value: "en" | "es" | "hi") => setSelectedLanguage(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyNumber">Emergency Number Override</Label>
              <Input
                id="emergencyNumber"
                value={(countryOverrides[selectedCountry as string]?.emergencyNumber as any) ?? ""}
                placeholder={String(baseCountry.emergencyNumber)}
                onChange={(e) =>
                  setCountryOverrides((prev) => ({
                    ...prev,
                    [selectedCountry as string]: {
                      ...(prev[selectedCountry as string] || {}),
                      emergencyNumber: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crisisPhone">Crisis Line Override</Label>
              <Input
                id="crisisPhone"
                value={(countryOverrides[selectedCountry as string]?.crisisPhone as any) ?? ""}
                placeholder={String(baseCountry.crisisPhone)}
                onChange={(e) =>
                  setCountryOverrides((prev) => ({
                    ...prev,
                    [selectedCountry as string]: {
                      ...(prev[selectedCountry as string] || {}),
                      crisisPhone: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crisisTextNumber">Crisis Text Number Override</Label>
              <Input
                id="crisisTextNumber"
                value={(countryOverrides[selectedCountry as string]?.crisisTextNumber as any) ?? ""}
                placeholder={String(baseCountry.crisisTextNumber || "")}
                onChange={(e) =>
                  setCountryOverrides((prev) => ({
                    ...prev,
                    [selectedCountry as string]: {
                      ...(prev[selectedCountry as string] || {}),
                      crisisTextNumber: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smsBody">SMS Body</Label>
              <Input
                id="smsBody"
                value={(countryOverrides[selectedCountry as string]?.smsBody as any) ?? ""}
                placeholder={String(baseCountry.smsBody || "")}
                onChange={(e) =>
                  setCountryOverrides((prev) => ({
                    ...prev,
                    [selectedCountry as string]: {
                      ...(prev[selectedCountry as string] || {}),
                      smsBody: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Enable server-side safety plan storage</p>
                <p className="text-sm text-muted-foreground">Default OFF. Displays consent modal before saving.</p>
              </div>
              <Switch checked={serverStorageEnabled} onCheckedChange={setServerStorageEnabled} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-muted-foreground">Toggle basic usage events (no PII).</p>
              </div>
              <Switch checked={analyticsEnabled} onCheckedChange={setAnalyticsEnabled} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reviewDate">Content review date</Label>
              <Input id="reviewDate" type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewerName">Reviewer name</Label>
              <Input id="reviewerName" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Name" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveSettings}>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              Accessibility: All buttons are keyboard-focusable with visible focus rings. Emergency banner uses role="alert" with assertive
              announcements.
            </p>
            <p>Privacy: Your privacy matters — this feature does not store what you type unless you explicitly choose to save or send it.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}