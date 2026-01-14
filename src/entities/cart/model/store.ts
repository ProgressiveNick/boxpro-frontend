import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  SKU: string;
  imageURL: string;
  quantity: number;
  description?: string;
  slug?: string;
};

type CartState = {
  items: CartItem[];
  totalPrice: number;
  totalCount: number;
  currentOrderDocumentId: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  getItemQuantity: (id: string) => number;
  setCurrentOrderDocumentId: (documentId: string | null) => void;
};

const calculateTotalCount = (items: CartItem[]): number => {
  return items.reduce((acc, item) => acc + item.quantity, 0);
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalPrice: 0,
      totalCount: calculateTotalCount([]),
      currentOrderDocumentId: null,
      addItem: (item: CartItem) =>
        set((state) => ({
          items: [...state.items, item],
          totalPrice: state.totalPrice + item.price,
          totalCount: calculateTotalCount([...state.items, item]),
        })),
      removeItem: (id: string) =>
        set((state) => {
          const index = state.items.findIndex((item) => item.id === id);
          if (index === -1) return state;
          const item = state.items[index];
          const newItems = [...state.items];
          newItems.splice(index, 1);
          return {
            items: newItems,
            totalPrice: state.totalPrice - item.price * item.quantity,
            totalCount: calculateTotalCount(newItems),
          };
        }),
      clearCart: () =>
        set({
          items: [],
          totalPrice: 0,
          totalCount: 0,
          currentOrderDocumentId: null,
        }),
      updateItemQuantity: (id: string, quantity: number) =>
        set((state) => {
          if (quantity < 1) {
            return state;
          }

          const index = state.items.findIndex((item) => item.id === id);
          if (index === -1) return state;

          const item = state.items[index];
          const newItems = [...state.items];
          const priceDifference = (quantity - item.quantity) * item.price;
          newItems[index] = { ...item, quantity };

          return {
            items: newItems,
            totalPrice: state.totalPrice + priceDifference,
            totalCount: calculateTotalCount(newItems),
          };
        }),
      getItemQuantity: (id: string) => {
        const item = get().items.find((item) => item.id === id);
        return item ? item.quantity : 0;
      },
      setCurrentOrderDocumentId: (documentId: string | null) =>
        set({ currentOrderDocumentId: documentId }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
