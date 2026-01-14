"use client";

import { useEffect } from "react";
import ym from "react-yandex-metrika";

type ProductPageTrackerProps = {
  productName: string;
  productId: string;
  price: number;
};

export function ProductPageTracker({
  productName,
  productId,
  price,
}: ProductPageTrackerProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && typeof ym === "function") {
        ym("hit", window.location.href, productName);

        // Дополнительно можно отправить событие просмотра товара
        ym("reachGoal", "view_item", {
          product_id: productId,
          product_name: productName,
          price: price,
          currency: "RUB",
        });
      }
    } catch (error) {
      console.warn("Yandex Metrika error:", error);
    }
  }, [productName, productId, price]);

  return null; // Компонент не рендерит ничего
}
