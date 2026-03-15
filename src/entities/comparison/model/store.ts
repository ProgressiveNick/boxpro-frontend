import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Минимальное представление характеристики для таблицы сравнения */
export type ComparisonCharacteristic = {
  name: string;
  value: string | number | undefined;
};

export type ComparisonItem = {
  id: string;
  title: string;
  price: number;
  SKU: string;
  imageURL: string;
  description?: string;
  slug?: string;
  /** Характеристики для отображения в таблице (имя + значение) */
  characteristics?: ComparisonCharacteristic[];
};

type ComparisonState = {
  items: ComparisonItem[];
  addItem: (item: ComparisonItem) => void;
  removeItem: (id: string) => void;
  clearComparison: () => void;
};

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) {
            return state;
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearComparison: () => set({ items: [] }),
    }),
    {
      name: "comparison-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
