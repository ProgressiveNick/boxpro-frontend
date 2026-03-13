"use client";

import { useEffect } from "react";
import ym from "react-yandex-metrika";
import {
  pushEcommerceEvent,
  ECOMMERCE_CURRENCY,
  type EcommerceProduct,
} from "@/shared/lib/analytics/yandexEcommerce";

type ProductPageTrackerProps = {
  productName: string;
  productId: string;
  price: number;
  category?: string;
  variant?: string;
  list?: string;
};

export function ProductPageTracker({
  productName,
  productId,
  price,
  category,
  variant,
  list = "Карточка товара",
}: ProductPageTrackerProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && typeof ym === "function") {
        ym("hit", window.location.href, productName);

        ym("reachGoal", "view_item", {
          product_id: productId,
          product_name: productName,
          price: price,
          currency: "RUB",
        });
      }

      const product: EcommerceProduct = {
        id: productId,
        name: productName,
        price,
        category,
        variant,
        list,
        position: 1,
      };
      pushEcommerceEvent({
        currencyCode: ECOMMERCE_CURRENCY,
        detail: { products: [product] },
      });
    } catch (error) {
      console.warn("Yandex Metrika error:", error);
    }
  }, [productName, productId, price, category, variant, list]);

  return null;
}
