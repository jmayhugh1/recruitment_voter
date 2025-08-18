import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LOCAL_STORAGE_KEY, SelectedNameContext } from "./selectedName-context";
import type { SelectedNameContextValue } from "./selectedName-context";

export default function SelectedNameProvider({ children }: { children: ReactNode }) {
  const [selectedName, setSelectedNameState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(LOCAL_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (selectedName) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, selectedName);
      } else {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch {
      /* ignore storage errors */
    }
  }, [selectedName]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY) setSelectedNameState(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setSelectedName = (name: string | null) => setSelectedNameState(name);
  const clearSelectedName = () => setSelectedNameState(null);

  const value: SelectedNameContextValue = useMemo(
    () => ({ selectedName, setSelectedName, clearSelectedName }),
    [selectedName]
  );

  return (
    <SelectedNameContext.Provider value={value}>
      {children}
    </SelectedNameContext.Provider>
  );
}
