import { create } from "zustand";

export type UIPanelId =
  | "catalog"
  | "search"
  | "consultation"
  | "returnCall"
  | "test";

type UIStoreState = {
  activeUI: UIPanelId | null;
  /** Верхняя панель шапки скрыта, т.к. пользователь проскроллил вниз (через Intersection Observer) */
  scrollPastThreshold: boolean;
  setScrollPastThreshold: (value: boolean) => void;
  openCatalog: () => void;
  openSearch: () => void;
  openConsultationForm: () => void;
  openReturnCallForm: () => void;
  openTestForm: () => void;
  closeAll: () => void;
};

export const useUIStore = create<UIStoreState>((set) => ({
  activeUI: null,
  scrollPastThreshold: false,
  setScrollPastThreshold: (value) => set({ scrollPastThreshold: value }),

  openCatalog: () => set({ activeUI: "catalog" }),
  openSearch: () => set({ activeUI: "search" }),
  openConsultationForm: () => set({ activeUI: "consultation" }),
  openReturnCallForm: () => set({ activeUI: "returnCall" }),
  openTestForm: () => set({ activeUI: "test" }),
  closeAll: () => set({ activeUI: null }),
}));
