import { create } from "zustand";

type ReturnCallFormState = {
  isOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
  toggleForm: () => void;
};

export const useReturnCallFormStore = create<ReturnCallFormState>((set) => ({
  isOpen: false,
  openForm: () => set({ isOpen: true }),
  closeForm: () => set({ isOpen: false }),
  toggleForm: () => set((state) => ({ isOpen: !state.isOpen })),
}));












