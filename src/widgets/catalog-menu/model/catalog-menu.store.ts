import { create } from "zustand";

type CatalogMenuState = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  closeSearchCallbacks: Set<() => void>;
  registerCloseSearch: (cb: () => void) => () => void;
};

export const useCatalogMenuStore = create<CatalogMenuState>((set, get) => ({
  isOpen: false,
  isSearchOpen: false,
  closeSearchCallbacks: new Set(),

  setSearchOpen: (open) => set({ isSearchOpen: open }),

  setIsOpen: (isOpen) => {
    if (isOpen) {
      get().closeSearchCallbacks.forEach((cb) => cb());
      set({ isSearchOpen: false });
    }
    set({ isOpen });
  },

  toggle: () => {
    const willOpen = !get().isOpen;
    if (willOpen) {
      get().closeSearchCallbacks.forEach((cb) => cb());
      set({ isSearchOpen: false });
    }
    set((state) => ({ isOpen: !state.isOpen }));
  },

  registerCloseSearch: (cb) => {
    set((state) => {
      const next = new Set(state.closeSearchCallbacks);
      next.add(cb);
      return { closeSearchCallbacks: next };
    });
    return () => {
      set((state) => {
        const next = new Set(state.closeSearchCallbacks);
        next.delete(cb);
        return { closeSearchCallbacks: next };
      });
    };
  },
}));
