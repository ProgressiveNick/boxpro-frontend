"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductType } from "@/entities/product";
import { Button } from "@/shared/ui/button";

type OrderOneClickButtonProps = {
  product: ProductType;
  className?: string;
};

export function OrderOneClickButton({
  product,
  className,
}: OrderOneClickButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleClick = async () => {
    if (isCreating) return;

    setIsCreating(true);

    try {
      // Создаем заказ с одним товаром
      const orderItem = {
        name: product.name,
        documentId: product.documentId,
        count: 1,
        sum: product.price || 0,
      };

      const response = await fetch("/api/order/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order: [orderItem],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Ошибка создания заказа:", error);
        alert("Ошибка создания заказа. Попробуйте еще раз.");
        setIsCreating(false);
        return;
      }

      const result = await response.json();

      if (result.success && result.documentId) {
        // Перенаправляем на страницу созданного заказа
        router.push(`/order/${result.documentId}`);
      } else {
        console.error("Не получен documentId заказа:", result);
        alert("Ошибка создания заказа. Попробуйте еще раз.");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Ошибка создания заказа:", error);
      alert("Ошибка создания заказа. Попробуйте еще раз.");
      setIsCreating(false);
    }
  };

  return (
    <Button
      className={className}
      text={isCreating ? "Создание заказа..." : "Заказать в 1 клик"}
      variant="secondary"
      onClick={handleClick}
      disabled={isCreating}
    />
  );
}
