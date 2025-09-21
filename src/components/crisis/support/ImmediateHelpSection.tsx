import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, MessageSquare, Phone, Share2 } from "lucide-react";
import TrustedContactCard from "@/components/TrustedContactCard";
import { useFeatureFlags } from "@/hooks/use-feature-flags";

type TFn = (key: any) => any;

type CountryInfo = {
  emergencyNumber: string;
  crisisPhone: string;
  crisisTextNumber?: string;
  smsBody?: string;
};

export default function ImmediateHelpSection({
  t,
  activeCountry,
  callNumber,
  copyToClipboard,
  shareWithContact,
}: {
  t: TFn;
  activeCountry: CountryInfo;
  callNumber: (raw: string) => void;
  copyToClipboard: (text: string) => Promise<void>;
  shareWithContact: () => Promise<void>;
}) {
  const { flags } = useFeatureFlags();

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Button
          size="lg"
          className="min-h-16 py-4 px-6 text-lg bg-red-600 hover:bg-red-700 whitespace-normal break-words text-center flex-wrap leading-snug flex items-center justify-center text-balance focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600"
          onClick={() => callNumber(String(activeCountry.emergencyNumber))}
          aria-label={`${t("callEmergency")} ${activeCountry.emergencyNumber}`}
          type="button"
        >
          <Phone className="w-6 h-6 mr-2" />
          {t("callEmergency")}
        </Button>

        <Button
          size="lg"
          className="min-h-16 py-4 px-6 text-lg bg-blue-600 hover:bg-blue-700 whitespace-normal break-words text-center flex-wrap leading-snug flex items-center justify-center text-balance focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
          onClick={() => callNumber(String(activeCountry.crisisPhone))}
          aria-label={`${t("callCrisis")} ${activeCountry.crisisPhone}`}
          type="button"
        >
          <Phone className="w-6 h-6 mr-2" />
          {t("callCrisis")}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {activeCountry.crisisTextNumber && (
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                `sms:${activeCountry.crisisTextNumber}?&body=${encodeURIComponent(activeCountry.smsBody || "")}`
              )
            }
            aria-label={`${t("textCrisis")} ${activeCountry.crisisTextNumber}`}
            className="w-full min-h-12 py-3 px-4 whitespace-normal break-words text-center flex-wrap leading-snug flex items-center justify-center text-balance focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {t("textCrisis")}
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => copyToClipboard(String(activeCountry.crisisPhone))}
          className="w-full min-h-12 py-3 px-4 whitespace-normal break-words text-center flex-wrap leading-snug flex items-center justify-center text-balance focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
        >
          <Copy className="w-4 h-4 mr-2" />
          {t("copyNumber")}
        </Button>

        <Button
          variant="outline"
          onClick={shareWithContact}
          className="w-full min-h-12 py-3 px-4 whitespace-normal break-words text-center flex-wrap leading-snug flex items-center justify-center text-balance focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
          title={t("shareContact")}
          aria-label={t("shareContact")}
        >
          <Share2 className="w-4 h-4 mr-2" />
          {t("shareContact")}
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full min-h-12 py-3 px-4 whitespace-normal break-words text-center flex-wrap leading-snug flex items-center justify-center text-balance focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
        onClick={() => window.open("https://findahelpline.com", "_blank", "noopener")}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        {t("findCenter")}
      </Button>

      {flags.trustedContacts && <TrustedContactCard />}
    </div>
  );
}
