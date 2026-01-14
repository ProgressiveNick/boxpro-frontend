import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { cookieStorage } from "@/shared/lib/cookieStorage";
import { ProductType } from "./types";

export type RecentlyViewedItem = {
  documentId: string;
  slug: string;
  name: string;
  price: number;
  imagePath?: string;
};

type RecentlyViewedState = {
  items: RecentlyViewedItem[];
  addItem: (product: ProductType) => void;
  clearItems: () => void;
};

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          // Проверяем, что product существует и имеет необходимые поля
          if (!product || !product.documentId || !product.slug || !product.name) {
            return state;
          }

          // Убеждаемся, что items - это массив
          const currentItems = Array.isArray(state.items) ? state.items : [];

          // Проверяем, нет ли уже такого товара
          const existingIndex = currentItems.findIndex(
            (item) => item && item.documentId === product.documentId
          );

          if (existingIndex !== -1) {
            // Если товар уже есть, перемещаем его в начало
            const newItems = [...currentItems];
            const [existingItem] = newItems.splice(existingIndex, 1);
            return { items: [existingItem, ...newItems] };
          }

          // Добавляем новый товар в начало списка
          const newItem: RecentlyViewedItem = {
            documentId: product.documentId,
            slug: product.slug,
            name: product.name,
            price: product.price || 0,
            imagePath: product.pathsImgs?.[0]?.path,
          };

          // Ограничиваем список до 20 товаров
          const updatedItems = [newItem, ...currentItems].slice(0, 20);

          return { items: updatedItems };
        }),
      clearItems: () => set({ items: [] }),
    }),
    {
      name: "recently-viewed",
      storage: createJSONStorage(() => cookieStorage),
      // Обработка ошибок при десериализации
      onRehydrateStorage: () => (state) => {
        if (state && !Array.isArray(state.items)) {
          state.items = [];
        }
      },
    }
  )
);

