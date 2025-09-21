import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Heart, Save, AlertTriangle, Globe } from 'lucide-react';
import { toast } from 'sonner';
import ImmediateHelpSection from "@/components/crisis/support/ImmediateHelpSection";
import CopingToolsSection from "@/components/crisis/support/CopingToolsSection";
import SafetyPlanSection from "@/components/crisis/support/SafetyPlanSection";
import ResourcesSection from "@/components/crisis/support/ResourcesSection";
import SettingsSection from "@/components/crisis/support/SettingsSection";
import { STRINGS, COUNTRIES } from "@/components/crisis/support/constants";

 // Internationalization strings moved to constants. Using imported STRINGS.

 // Country presets moved to constants. Using imported COUNTRIES.

interface CrisisSupportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emergencyMode?: boolean;
  langCode?: 'en' | 'es' | 'hi';
}

interface SafetyPlan {
  warningSigns: string[];
  copingStrategies: string[];
  supportContacts: string[];
  professionals: string[];
  environmentSafety: string[];
  emergencyContacts: string[];
}

export default function CrisisSupport({ open, onOpenChange, emergencyMode = false, langCode }: CrisisSupportProps) {
  const [currentSection, setCurrentSection] = useState(emergencyMode ? 'immediate' : 'immediate');
  const [selectedCountry, setSelectedCountry] = useState<keyof typeof COUNTRIES>('IN');
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof STRINGS>('en');
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan>({
    warningSigns: [],
    copingStrategies: [],
    supportContacts: [],
    professionals: [],
    environmentSafety: [],
    emergencyContacts: []
  });

  // Add: settings state (persisted locally)
  const [serverStorageEnabled, setServerStorageEnabled] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [reviewDate, setReviewDate] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  // Replace the explicit US-based typing with a generic derived from COUNTRIES
  const [countryOverrides, setCountryOverrides] = useState<
    Record<string, Partial<(typeof COUNTRIES)[keyof typeof COUNTRIES]>>
  >({});

  // (removed) local breathing exercise state moved into BreathingExercise component

  // (removed) local grounding state moved into GroundingExercise component

  // (removed) unused label key maps

  type Messages = typeof STRINGS.en;
  const t = <K extends keyof Messages>(key: K): Messages[K] => {
    const dict = STRINGS[selectedLanguage] as Messages;
    return (dict[key] ?? STRINGS.en[key]) as Messages[K];
  };

  // Replace direct country usage with effective overrides
  const baseCountry = COUNTRIES[selectedCountry];
  const overrides = countryOverrides[selectedCountry] || {};
  const activeCountry = { ...baseCountry, ...overrides };

  // Sync language from parent prop if provided
  useEffect(() => {
    if (langCode && (langCode in STRINGS)) {
      setSelectedLanguage(langCode);
    }
  }, [langCode]);

  // Auto-detect country and language on mount (prefer saved 'lang' first)
  useEffect(() => {
    try {
      // Prefer stored language if present
      const storedLang = localStorage.getItem('lang') as keyof typeof STRINGS | null;
      if (storedLang && STRINGS[storedLang]) {
        setSelectedLanguage(storedLang);
      } else {
        const locale = navigator.language || 'en-US';
        const langCode = locale.split('-')[0] as keyof typeof STRINGS;
        if (STRINGS[langCode]) {
          setSelectedLanguage(langCode);
        }
      }

      const locale = navigator.language || 'en-US';
      const countryCode = locale.split('-')[1];

      // Only set India explicitly; otherwise fall back to International
      if (countryCode === 'IN') {
        setSelectedCountry('IN');
      } else {
        setSelectedCountry('OTHER');
      }
    } catch (error) {
      console.log('Auto-detection failed, using defaults');
    }
  }, []);

  // Ensure country stays aligned with Hindi selection
  useEffect(() => {
    if (selectedLanguage === 'hi' && selectedCountry !== 'IN') {
      setSelectedCountry('IN');
    }
  }, [selectedLanguage, selectedCountry]);

  // Load settings & safety plan from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('safetyPlan');
      if (saved) setSafetyPlan(JSON.parse(saved));
    } catch {}
    try {
      const raw = localStorage.getItem('crisisSettings');
      if (raw) {
        const parsed = JSON.parse(raw);
        setServerStorageEnabled(!!parsed.serverStorageEnabled);
        setAnalyticsEnabled(!!parsed.analyticsEnabled);
        setReviewDate(parsed.reviewDate || '');
        setReviewerName(parsed.reviewerName || '');
        setCountryOverrides(parsed.countryOverrides || {});
      }
    } catch {}
  }, []);

  // Helper: check if a value is a dialable phone number
  const isDialable = (value: string) => {
    const digits = (value || "").replace(/\s|-/g, "");
    return /^\d{2,}$/.test(digits);
  };

  // Add: device-aware call launcher with desktop confirmation
  const isMobile = () =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const callNumber = (raw: string) => {
    const cleaned = (raw || '').replace(/\s|-/g, '');
    if (!isDialable(cleaned)) {
      window.open('https://findahelpline.com', '_blank', 'noopener');
      return;
    }
    const telHref = `tel:${cleaned}`;
    if (isMobile()) {
      window.location.href = telHref;
    } else {
      const confirmCall = window.confirm(`Call ${cleaned}?`);
      if (confirmCall) window.location.href = telHref;
    }
  };

  // (removed) breathing logic moved to BreathingExercise component

  // (removed)

  // (removed)

  // (removed)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('copiedToClipboard'));
    } catch (error) {
      toast.error('Copy failed. Please select the number and copy it manually.');
    }
  };

  const shareWithContact = async () => {
    const message = `${t('shareMessage')}\n\nEmergency: ${activeCountry.emergencyNumber}\nCrisis Line: ${activeCountry.crisisPhone}\n\nGlobal helplines: https://findahelpline.com`;
    const shareUrl = 'https://findahelpline.com';

    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: t('title'),
            text: message,
            url: shareUrl,
          });
          return;
        } catch {
          // fall through to other options
        }
      }
      // Fallback to email share
      const subject = 'I need support';
      const body = encodeURIComponent(message);
      const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
      const opened = window.open(mailto, '_self');
      if (!opened) {
        await copyToClipboard(message);
      }
    } catch {
      await copyToClipboard(message);
    }
  };

  const saveSafetyPlan = () => {
    try {
      localStorage.setItem('safetyPlan', JSON.stringify(safetyPlan));
      toast.success(t('planSaved'));
    } catch (error) {
      toast.error('Failed to save plan');
    }
  };

  const exportSafetyPlan = () => {
    try {
      const dataStr = JSON.stringify(safetyPlan, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'safety-plan.json';
      link.click();
      URL.revokeObjectURL(url);
      toast.success(t('planExported'));
    } catch (error) {
      toast.error('Failed to export plan');
    }
  };

  const printSafetyPlan = () => {
    window.print();
  };

  const clearSafetyPlan = () => {
    setSafetyPlan({
      warningSigns: [],
      copingStrategies: [],
      supportContacts: [],
      professionals: [],
      environmentSafety: [],
      emergencyContacts: []
    });
    try {
      localStorage.removeItem('safetyPlan');
      toast.success(t('planCleared'));
    } catch (error) {
      toast.error('Failed to clear plan');
    }
  };

  const updateSafetyPlanField = (field: keyof SafetyPlan, index: number, value: string) => {
    setSafetyPlan(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addSafetyPlanItem = (field: keyof SafetyPlan) => {
    setSafetyPlan(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeSafetyPlanItem = (field: keyof SafetyPlan, index: number) => {
    setSafetyPlan(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Persist settings helper
  const saveSettings = () => {
    try {
      const data = {
        serverStorageEnabled,
        analyticsEnabled,
        reviewDate,
        reviewerName,
        countryOverrides,
      };
      localStorage.setItem('crisisSettings', JSON.stringify(data));
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  // (removed breathing interval cleanup)

  const sections = [
    { id: 'immediate', label: t('immediateHelp'), icon: AlertTriangle },
    { id: 'coping', label: t('copingTools'), icon: Heart },
    { id: 'safety', label: t('safetyPlan'), icon: Save },
    { id: 'resources', label: t('resources'), icon: ExternalLink },
    { id: 'settings', label: t('settings'), icon: Globe }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              {t('title')}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Emergency Banner */}
        {emergencyMode && (
          <Alert className="border-red-200 bg-red-50" role="alert" aria-live="assertive">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              {t('emergencyBanner')} <strong>{activeCountry.emergencyNumber}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Headline + subtext */}
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            You're Not Alone. Help Is Available 24/7.
          </h2>
          <p className="mt-2 text-base text-gray-600">
            {t('notAlone')}
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
          {sections.map(section => (
            <Button
              key={section.id}
              variant={currentSection === section.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentSection(section.id)}
              className="flex items-center gap-2 whitespace-normal break-words text-center flex-wrap"
              aria-pressed={currentSection === section.id}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </Button>
          ))}
        </div>

        {/* Immediate Help Section */}
        {currentSection === 'immediate' && (
          <ImmediateHelpSection
            t={t}
            activeCountry={activeCountry}
            callNumber={callNumber}
            copyToClipboard={copyToClipboard}
            shareWithContact={shareWithContact}
          />
        )}

        {/* Coping Tools Section */}
        {currentSection === 'coping' && (
          <CopingToolsSection t={t} />
        )}

        {/* Safety Plan Section */}
        {currentSection === 'safety' && (
          <SafetyPlanSection
            t={t}
            safetyPlan={safetyPlan}
            saveSafetyPlan={saveSafetyPlan}
            exportSafetyPlan={exportSafetyPlan}
            printSafetyPlan={printSafetyPlan}
            clearSafetyPlan={clearSafetyPlan}
            updateSafetyPlanField={updateSafetyPlanField}
            addSafetyPlanItem={addSafetyPlanItem}
            removeSafetyPlanItem={removeSafetyPlanItem}
          />
        )}

        {/* Resources Section */}
        {currentSection === 'resources' && (
          <ResourcesSection t={t} activeCountry={activeCountry} />
        )}

        {/* Settings Section */}
        {currentSection === 'settings' && (
          <SettingsSection
            t={t}
            COUNTRIES={COUNTRIES as any}
            baseCountry={baseCountry as any}
            activeCountry={activeCountry as any}
            selectedCountry={selectedCountry}
            setSelectedCountry={(value) => setSelectedCountry(value as keyof typeof COUNTRIES)}
            selectedLanguage={selectedLanguage as "en" | "es" | "hi"}
            setSelectedLanguage={(value: "en" | "es" | "hi") => setSelectedLanguage(value)}
            countryOverrides={countryOverrides as any}
            setCountryOverrides={setCountryOverrides as any}
            serverStorageEnabled={serverStorageEnabled}
            setServerStorageEnabled={setServerStorageEnabled}
            analyticsEnabled={analyticsEnabled}
            setAnalyticsEnabled={setAnalyticsEnabled}
            reviewDate={reviewDate}
            setReviewDate={setReviewDate}
            reviewerName={reviewerName}
            setReviewerName={setReviewerName}
            saveSettings={saveSettings}
          />
        )}

        {/* Privacy notice banner (persistent in modal) */}
        <div className="mt-6 rounded-lg border bg-muted p-3 text-xs text-muted-foreground">
          {t('privacyNotice')}
        </div>
      </DialogContent>
    </Dialog>
  );
}