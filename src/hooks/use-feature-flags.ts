import { useEffect, useState } from "react";
import { FeatureFlags, getFlags, setFlags } from "@/lib/flags";

export function useFeatureFlags() {
  const [flags, set] = useState<FeatureFlags>(() => getFlags());

  useEffect(() => {
    set(getFlags());
  }, []);

  const update = (next: Partial<FeatureFlags>) => {
    setFlags(next);
    set((prev) => ({ ...prev, ...next }));
  };

  return { flags, update };
}
