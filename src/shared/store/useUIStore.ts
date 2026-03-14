import { create } from "zustand";

export type UIPanelId =
  | "catalog"
  | "search"
  | "consultation"
  | "returnCall"
  | "test";

type UIStoreState = {
  activeUI: UIPanelId | null;
  openCatalog: () => void;
  openSearch: () => void;
  openConsultationForm: () => void;
  openReturnCallForm: () => void;
  openTestForm: () => void;
  closeAll: () => void;
};

export const useUIStore = create<UIStoreState>((set) => ({
  activeUI: null,

  openCatalog: () => set({ activeUI: "catalog" }),
  openSearch: () => set({ activeUI: "search" }),
  openConsultationForm: () => set({ activeUI: "consultation" }),
  openReturnCallForm: () => set({ activeUI: "returnCall" }),
  openTestForm: () => set({ activeUI: "test" }),
  closeAll: () => set({ activeUI: null }),
}));
