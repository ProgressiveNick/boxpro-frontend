"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "./recently-viewed-store";
import { ProductType } from "./types";

/**
 * Хук для отслеживания просмотра товара
 * Сохраняет товар в список просмотренных при монтировании компонента
 */
export function useTrackProductView(product: ProductType | null | undefined) {
  const { addItem } = useRecentlyViewedStore();

  useEffect(() => {
    if (product && product.documentId && product.slug && product.name) {
      addItem(product);
    }
  }, [product, addItem]);
}

