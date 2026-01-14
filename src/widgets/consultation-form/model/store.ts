import { create } from "zustand";

type ConsultationFormState = {
  isOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
  toggleForm: () => void;
};

export const useConsultationFormStore = create<ConsultationFormState>(
  (set) => ({
    isOpen: false,
    openForm: () => set({ isOpen: true }),
    closeForm: () => set({ isOpen: false }),
    toggleForm: () => set((state) => ({ isOpen: !state.isOpen })),
  })
);





