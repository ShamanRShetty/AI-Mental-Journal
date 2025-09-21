export type FeatureFlags = {
  breathingVisualizer: boolean;
  groundingChecklist: boolean;
  trustedContacts: boolean;
  clientJournalReflection: boolean;
  darkModeToggle: boolean;
  i18nToggle: boolean;
};

const STORAGE_KEY = "featureFlags.v1";

const defaults: FeatureFlags = {
  breathingVisualizer: true,
  groundingChecklist: true,
  trustedContacts: true,
  clientJournalReflection: true,
  darkModeToggle: true,
  i18nToggle: true,
};

export const getFlags = (): FeatureFlags => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw) as Partial<FeatureFlags>;
    return { ...defaults, ...parsed };
  } catch {
    return { ...defaults };
  }
};

export const setFlags = (next: Partial<FeatureFlags>) => {
  try {
    const current = getFlags();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...next }));
  } catch {}
};
