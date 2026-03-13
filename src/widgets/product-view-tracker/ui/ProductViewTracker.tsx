"use client";

import { useEffect } from "react";
import { useTrackProductView } from "@/entities/product/model/use-track-product-view";
import { ProductType } from "@/entities/product";
import {
  pushEcommerceEvent,
  ECOMMERCE_CURRENCY,
  type EcommerceProduct,
} from "@/shared/lib/analytics/yandexEcommerce";

type ProductViewTrackerProps = {
  product: ProductType | null | undefined;
};

export function ProductViewTracker({ product }: ProductViewTrackerProps) {
  useTrackProductView(product);

  useEffect(() => {
    if (!product) return;
    const p: EcommerceProduct = {
      id: product.documentId,
      name: product.name,
      price: product.price,
      category: product.kategoria?.name,
      list: "Карточка товара",
      position: 1,
    };
    pushEcommerceEvent({
      currencyCode: ECOMMERCE_CURRENCY,
      detail: { products: [p] },
    });
  }, [product]);

  return null;
}
