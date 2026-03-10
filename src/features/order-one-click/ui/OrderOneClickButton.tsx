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

      const { createOrderDraft } = await import("@/entities/order");
      const result = await createOrderDraft([orderItem]);

      if (!result.success) {
        console.error("Ошибка создания заказа:", result.error);
        alert(result.error ?? "Ошибка создания заказа. Попробуйте еще раз.");
        setIsCreating(false);
        return;
      }

      if (result.documentId) {
        router.push(`/order/${result.documentId}`);
      } else {
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
