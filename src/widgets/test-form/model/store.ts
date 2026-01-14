import { create } from "zustand";

type TestFormState = {
  isOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
  toggleForm: () => void;
};

export const useTestFormStore = create<TestFormState>((set) => ({
  isOpen: false,
  openForm: () => set({ isOpen: true }),
  closeForm: () => set({ isOpen: false }),
  toggleForm: () => set((state) => ({ isOpen: !state.isOpen })),
}));
