import { create } from "zustand";

type CatalogMenuState = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    toggle: () => void;
};

export const useCatalogMenuStore = create<CatalogMenuState>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
