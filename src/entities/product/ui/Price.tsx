"use client";

import { useMemo } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import styles from "./Price.module.scss";
import type { PriceHistoryItem } from "../model/types";

type PriceProps = {
  currentPrice: number | null;
  priceHistory?: PriceHistoryItem[];
  previousPrice?: number | null; // Deprecated, используйте priceHistory
};

export function Price({
  currentPrice,
  priceHistory,
  previousPrice,
}: PriceProps) {
  // Вычисляем динамику цены на основе price_history
  const priceChange = useMemo(() => {
    // Если есть price_history и записей >= 2, используем его
    if (priceHistory && priceHistory.length >= 2) {
      // Сортируем по дате (от старых к новым)
      const sorted = [...priceHistory].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Берем последнюю (самую новую) и предпоследнюю записи
      const last = sorted[sorted.length - 1];
      const previous = sorted[sorted.length - 2];

      if (last.price > previous.price) {
        return { direction: "up" as const, previousPrice: previous.price };
      } else if (last.price < previous.price) {
        return { direction: "down" as const, previousPrice: previous.price };
      }
      return null;
    }

    // Fallback на старый способ через previousPrice (для обратной совместимости)
    if (previousPrice && currentPrice) {
      if (currentPrice > previousPrice) {
        return { direction: "up" as const, previousPrice };
      } else if (currentPrice < previousPrice) {
        return { direction: "down" as const, previousPrice };
      }
    }

    return null;
  }, [priceHistory, previousPrice, currentPrice]);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u2009");
  };

  // Показываем старую цену и стрелку только если есть динамика и записей >= 2
  const shouldShowPriceChange =
    priceChange &&
    priceHistory &&
    priceHistory.length >= 2 &&
    priceChange.previousPrice !== currentPrice;

  return (
    <div className={styles.priceContainer}>
      <div className={styles.currentPriceWrapper}>
        {shouldShowPriceChange && (
          <span className={styles.oldPrice}>
            {formatPrice(priceChange.previousPrice)} ₽
          </span>
        )}
        <span className={styles.currentPrice}>
          {currentPrice ? (
            <>
              {formatPrice(currentPrice)}
              <span className={styles.rubleSign}> ₽</span>
            </>
          ) : (
            "По запросу"
          )}
        </span>
        {shouldShowPriceChange && (
          <span
            className={`${styles.priceArrow} ${
              priceChange.direction === "up" ? styles.priceUp : styles.priceDown
            }`}
          >
            {priceChange.direction === "up" ? (
              <ArrowUp size={20} />
            ) : (
              <ArrowDown size={20} />
            )}
          </span>
        )}
      </div>
    </div>
  );
}
