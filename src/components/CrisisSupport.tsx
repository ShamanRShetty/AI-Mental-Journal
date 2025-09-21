import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, 
  MessageSquare, 
  Copy, 
  Share2, 
  ExternalLink, 
  Heart, 
  Download, 
  Printer, 
  Save, 
  Trash2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Languages
} from 'lucide-react';
import { toast } from 'sonner';
import BreathingExercise from '@/components/crisis/BreathingExercise';
import GroundingExercise from '@/components/crisis/GroundingExercise';
import { Switch } from '@/components/ui/switch';
import TrustedContactCard from '@/components/TrustedContactCard';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import ImmediateHelpSection from "@/components/crisis/support/ImmediateHelpSection";
import CopingToolsSection from "@/components/crisis/support/CopingToolsSection";
import SafetyPlanSection from "@/components/crisis/support/SafetyPlanSection";
import ResourcesSection from "@/components/crisis/support/ResourcesSection";
import SettingsSection from "@/components/crisis/support/SettingsSection";

// Internationalization strings
const STRINGS = {
  en: {
    title: "Crisis Support & Safety",
    emergencyBanner: "If you are in immediate danger, call emergency services now:",
    notAlone: "You're not alone. Help is available 24/7.",
    immediateHelp: "Immediate Help",
    copingTools: "Coping Tools",
    safetyPlan: "Safety Plan",
    resources: "Resources",
    settings: "Settings",
    callEmergency: "Call Emergency",
    callCrisis: "Call Crisis Line",
    textCrisis: "Text Crisis Line",
    copyNumber: "Copy Number",
    shareContact: "Share with Trusted Contact",
    findCenter: "Find Local Center",
    breathing: "4-7-8 Breathing",
    breathingDesc: "A calming breathing technique",
    grounding: "5-4-3-2-1 Grounding",
    groundingDesc: "Focus on your senses to stay present",
    quickTips: "Quick Coping Tips",
    breathingInhale: "Inhale 4",
    breathingHold: "Hold 7",
    breathingExhale: "Exhale 8",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    groundingPrompt: "Name items you notice:",
    see5: "5 things you can see",
    touch4: "4 things you can touch",
    hear3: "3 things you can hear",
    smell2: "2 things you can smell",
    taste1: "1 thing you can taste",
    warningSignsTitle: "Personal Warning Signs",
    warningSignsDesc: "What tells you that you might be struggling?",
    copingStrategiesTitle: "Coping Strategies",
    copingStrategiesDesc: "What helps you feel better?",
    supportContactsTitle: "People to Contact",
    supportContactsDesc: "Friends, family, or trusted people",
    professionalsTitle: "Professional Contacts",
    professionalsDesc: "Therapists, doctors, counselors",
    environmentTitle: "Environment Safety",
    environmentDesc: "Steps to make your space safer",
    emergencyContactsTitle: "Emergency Contacts",
    emergencyContactsDesc: "Crisis lines and emergency numbers",
    saveLocal: "Save Locally",
    exportPlan: "Export Plan",
    printPlan: "Print Plan",
    clearPlan: "Clear Plan",
    privacyNotice: "Your safety plan is stored locally on your device unless you choose to export it.",
    country: "Country",
    language: "Language",
    copiedToClipboard: "Copied to clipboard",
    planSaved: "Safety plan saved locally",
    planExported: "Safety plan exported",
    planCleared: "Safety plan cleared",
    shareMessage: "I'm going through a difficult time and could use your support. Here are some crisis resources:",
    quickCopingTips: [
      "Take slow, deep breaths",
      "Drink a glass of cold water",
      "Call or text someone you trust",
      "Listen to calming music",
      "Go for a short walk if safe",
      "Write down three things you're grateful for"
    ]
  },
  es: {
    title: "Apoyo en Crisis y Seguridad",
    emergencyBanner: "Si estás en peligro inmediato, llama a servicios de emergencia ahora:",
    notAlone: "No estás solo. La ayuda está disponible 24/7.",
    immediateHelp: "Ayuda Inmediata",
    copingTools: "Herramientas de Afrontamiento",
    safetyPlan: "Plan de Seguridad",
    resources: "Recursos",
    settings: "Configuración",
    callEmergency: "Llamar Emergencia",
    callCrisis: "Llamar Línea de Crisis",
    textCrisis: "Enviar Texto a Crisis",
    copyNumber: "Copiar Número",
    shareContact: "Compartir con Contacto de Confianza",
    findCenter: "Encontrar Centro Local",
    breathing: "Respiración 4-7-8",
    breathingDesc: "Una técnica de respiración calmante",
    grounding: "Conexión a Tierra 5-4-3-2-1",
    groundingDesc: "Enfócate en tus sentidos para mantenerte presente",
    quickTips: "Consejos Rápidos",
    breathingInhale: "Inhalar 4",
    breathingHold: "Mantener 7",
    breathingExhale: "Exhalar 8",
    start: "Iniciar",
    pause: "Pausar",
    reset: "Reiniciar",
    groundingPrompt: "Nombra elementos que notes:",
    see5: "5 cosas que puedes ver",
    touch4: "4 cosas que puedes tocar",
    hear3: "3 cosas que puedes escuchar",
    smell2: "2 cosas que puedes oler",
    taste1: "1 cosa que puedes saborear",
    country: "País",
    language: "Idioma",
    copiedToClipboard: "Copiado al portapapeles",
    planSaved: "Plan de seguridad guardado localmente",
    planExported: "Plan de seguridad exportado",
    planCleared: "Plan de seguridad borrado",
    shareMessage: "Estoy pasando por un momento difícil y podría usar tu apoyo. Aquí hay algunos recursos de crisis:",
    quickCopingTips: [
      "Respira lenta y profundamente",
      "Bebe un vaso de agua fría",
      "Llama o envía un mensaje a alguien de confianza",
      "Escucha música relajante",
      "Sal a caminar si es seguro",
      "Escribe tres cosas por las que estés agradecido"
    ]
  },
  hi: {
    title: "संकट सहायता और सुरक्षा",
    emergencyBanner: "यदि आप तत्काल खतरे में हैं, तो अभी आपातकालीन सेवाओं को कॉल करें:",
    notAlone: "आप अकेले नहीं हैं। सहायता 24/7 उपलब्ध है।",
    immediateHelp: "तत्काल सहायता",
    copingTools: "सामना करने के उपकरण",
    safetyPlan: "सुरक्षा योजना",
    resources: "संसाधन",
    settings: "सेटिंग्स",
    callEmergency: "आपातकालीन कॉल करें",
    callCrisis: "संकट हेल्पलाइन कॉल करें",
    textCrisis: "संकट हेल्पलाइन को टेक्स्ट करें",
    copyNumber: "नंबर कॉपी करें",
    shareContact: "विश्वसनीय संपर्क के साथ साझा करें",
    findCenter: "स्थानीय केंद्र खोजें",
    breathing: "4-7-8 श्वास",
    breathingDesc: "एक शांत करने वाली श्वास तकनीक",
    grounding: "5-4-3-2-1 ग्राउंडिंग",
    groundingDesc: "वर्तमान में रहने के लिए अपनी इंद्रियों पर ध्यान दें",
    quickTips: "त्वरित सुझाव",
    breathingInhale: "सांस लें 4",
    breathingHold: "रोकें 7",
    breathingExhale: "छोड़ें 8",
    start: "शुरू करें",
    pause: "रोकें",
    reset: "रीसेट करें",
    groundingPrompt: "उन चीजों का नाम बताएं जिन्हें आप नोटिस करते हैं:",
    see5: "5 चीजें जो आप देख सकते हैं",
    touch4: "4 चीजें जिन्हें आप छू सकते हैं",
    hear3: "3 चीजें जो आप सुन सकते हैं",
    smell2: "2 चीजें जिन्हें आप सूंघ सकते हैं",
    taste1: "1 चीज़ जिसका आप स्वाद ले सकते हैं",
    country: "देश",
    language: "भाषा",
    copiedToClipboard: "क्लिपबोर्ड पर कॉपी किया गया",
    planSaved: "सुरक्षा योजना स्थानीय रूप से सहेजी गई",
    planExported: "सुरक्षा योजना निर्यात की गई",
    planCleared: "सुरक्षा योजना साफ़ की गई",
    shareMessage: "मैं एक कठिन समय से गुजर रहा हूं और आपके समर्थन का उपयोग कर सकता हूं। यहां कुछ संकट संसाधन हैं:",
    quickCopingTips: [
      "धीमी, गहरी सांस लें",
      "एक गिलास ठंडा पानी पिएं",
      "किसी भरोसेमंद व्यक्ति को कॉल या टेक्स्ट करें",
      "शांत संगीत सुनें",
      "यदि सुरक्षित है तो थोड़ी देर टहलने जाएं",
      "तीन चीजें लिखें जिनके लिए आप आभारी हैं"
    ]
  }
};

// Country presets
const COUNTRIES = {
  US: {
    code: 'US',
    name: 'United States',
    emergencyNumber: '911',
    crisisPhone: '988',
    crisisTextKeyword: 'HOME',
    crisisTextNumber: '741741',
    smsBody: 'HOME',
    links: [
      { name: '988 Suicide & Crisis Lifeline', url: 'https://988lifeline.org' },
      { name: 'Crisis Text Line', url: 'https://crisistextline.org' }
    ]
  },
  IN: {
    code: 'IN',
    name: 'India',
    emergencyNumber: '112',
    crisisPhone: '9152987821',
    crisisTextKeyword: 'Not available',
    crisisTextNumber: '',
    smsBody: '',
    links: [
      { name: 'AASRA', url: 'http://www.aasra.info' },
      { name: 'Vandrevala Foundation', url: 'https://www.vandrevalafoundation.com' }
    ]
  },
  OTHER: {
    code: 'OTHER',
    name: 'International',
    emergencyNumber: 'Local emergency number',
    crisisPhone: 'See resources below',
    crisisTextKeyword: 'Varies by country',
    crisisTextNumber: '',
    smsBody: '',
    links: [
      { name: 'Find a Helpline (IASP)', url: 'https://findahelpline.com' },
      { name: 'International Association for Suicide Prevention', url: 'https://www.iasp.info' }
    ]
  }
};

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
  const [countryOverrides, setCountryOverrides] = useState<Record<string, Partial<typeof COUNTRIES.US>>>({});

  // Breathing exercise state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Grounding exercise state
  const [groundingChecked, setGroundingChecked] = useState({
    see: 0,
    touch: 0,
    hear: 0,
    smell: 0,
    taste: 0
  });

  // Add: label key maps to satisfy t() typing for dynamic labels
  const breathingLabelKeyByPhase: Record<'inhale' | 'hold' | 'exhale', 'breathingInhale' | 'breathingHold' | 'breathingExhale'> = {
    inhale: 'breathingInhale',
    hold: 'breathingHold',
    exhale: 'breathingExhale',
  };
  const groundingLabelByKey: Record<'see' | 'touch' | 'hear' | 'smell' | 'taste', 'see5' | 'touch4' | 'hear3' | 'smell2' | 'taste1'> = {
    see: 'see5',
    touch: 'touch4',
    hear: 'hear3',
    smell: 'smell2',
    taste: 'taste1',
  };

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

  // Breathing exercise logic
  const startBreathing = () => {
    if (breathingActive) return;
    
    setBreathingActive(true);
    setBreathingPhase('inhale');
    setBreathingCount(4);
    
    playChime();
    
    breathingIntervalRef.current = setInterval(() => {
      setBreathingCount(prev => {
        if (prev <= 1) {
          setBreathingPhase(current => {
            if (current === 'inhale') {
              setBreathingCount(7);
              return 'hold';
            } else if (current === 'hold') {
              setBreathingCount(8);
              return 'exhale';
            } else {
              setBreathingCount(4);
              playChime();
              return 'inhale';
            }
          });
          return prev;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseBreathing = () => {
    setBreathingActive(false);
    if (breathingIntervalRef.current) {
      clearInterval(breathingIntervalRef.current);
      breathingIntervalRef.current = null;
    }
  };

  const resetBreathing = () => {
    pauseBreathing();
    setBreathingPhase('inhale');
    setBreathingCount(4);
  };

  const playChime = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio not available');
    }
  };

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

  // Clean up breathing interval on unmount
  useEffect(() => {
    return () => {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, []);

  const { flags } = useFeatureFlags();

  const sections = [
    { id: 'immediate', label: t('immediateHelp'), icon: AlertTriangle },
    { id: 'coping', label: t('copingTools'), icon: Heart },
    { id: 'safety', label: t('safetyPlan'), icon: Save },
    { id: 'resources', label: t('resources'), icon: ExternalLink },
    { id: 'settings', label: t('settings'), icon: Globe }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" showCloseButton={!emergencyMode}>
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
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={(value) => setSelectedLanguage(value)}
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