import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type FavoriteItem = {
  id: string;
  title: string;
  price: number;
  SKU: string;
  imageURL: string;
  description?: string;
  slug?: string;
};

type FavoritesState = {
  items: FavoriteItem[];
  addItem: (item: FavoriteItem) => void;
  removeItem: (id: string) => void;
  clearFavorites: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          // Проверяем, нет ли уже такого товара
          if (state.items.some((i) => i.id === item.id)) {
            return state;
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearFavorites: () => set({ items: [] }),
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
