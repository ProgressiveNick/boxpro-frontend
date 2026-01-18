"use client";

import { useCartStore } from "@/entities/cart/model/store";
import styles from "./ProductQuantityCounter.module.scss";
import { useCallback, useState, useEffect } from "react";

type ProductQuantityCounterProps = {
  id: string;
  quantity: number;
  onRemove?: () => void;
  isProductPage?: boolean;
};

export function ProductQuantityCounter({
  id,
  quantity,
  onRemove,
  isProductPage = false,
}: ProductQuantityCounterProps) {
  const [mounted, setMounted] = useState(false);
  const updateQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDecrement = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (quantity > 1) {
        updateQuantity(id, quantity - 1);
      } else {
        removeItem(id);
        onRemove?.();
      }
    },
    [updateQuantity, removeItem, id, quantity, onRemove]
  );

  const handleIncrement = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      updateQuantity(id, quantity + 1);
    },
    [updateQuantity, id, quantity]
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.counter}>
      <button className={styles.counterBtn} onClick={handleDecrement}>
        -
      </button>
      <span className={styles.counterDisplay}>
        {isProductPage ? `Уже в корзине ${quantity}шт.` : quantity}
      </span>
      <button className={styles.counterBtn} onClick={handleIncrement}>
        +
      </button>
    </div>
  );
}
