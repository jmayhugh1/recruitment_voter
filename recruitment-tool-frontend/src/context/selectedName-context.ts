import { createContext } from "react";

export const LOCAL_STORAGE_KEY = "recruitment:selectedName";

export type SelectedNameContextValue = {
  selectedName: string | null;
  setSelectedName: (name: string | null) => void;
  clearSelectedName: () => void;
};

export const SelectedNameContext = createContext<
  SelectedNameContextValue | undefined
>(undefined);
