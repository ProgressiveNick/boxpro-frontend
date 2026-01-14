"use client";

import { useCartStore } from "@/entities/cart/model/store";

import { ProductQuantityCounter } from "./ProductQuantityCounter";
import { useCallback, useState, useEffect } from "react";
import { ProductType } from "@/entities/product";
import { AttributeValue } from "@/entities/product-attributes";
import { Button } from "@/shared/ui";
import ym from "react-yandex-metrika";

type AddProductToCartButtonType = {
  product: ProductType;
  className?: string;
  isProductPage?: boolean;
};

export function AddProductToCartButton({
  product,
  className,
  isProductPage = false,
}: AddProductToCartButtonType) {
  const id = product.documentId;
  const title = product.name;
  const price = product.price;
  const SKU =
    product.harakteristici?.filter((item: AttributeValue) => {
      return (
        item.harakteristica?.name?.includes("Артикул") && item.string_value
      );
    })[0]?.string_value || "";

  const imageURL =
    product.pathsImgs && product.pathsImgs.length > 0
      ? product.pathsImgs[0].path
      : "";

  const [mounted, setMounted] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const quantity = useCartStore((state) => state.getItemQuantity(id));
  //const { items } = useCartStore();
  useEffect(() => {
    setMounted(true);
    setShowButton(quantity === 0);
  }, [quantity]);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (quantity === 0) {
        addItem({
          id,
          title: title ?? "",
          price: price ?? 0,
          SKU: SKU ?? "",
          imageURL: imageURL ?? "",
          quantity: 1,
          description: product.description ?? undefined,
          slug: product.slug,
        });

        ym("reachGoal", "add_to_cart", {
          product_id: id,
          product_name: title,
          price: price,
          currency: "RUB",
        });

        setShowButton(false);
      }
    },
    [
      addItem,
      id,
      price,
      title,
      SKU,
      imageURL,
      quantity,
      product.description,
      product.slug,
    ]
  );

  const handleRemove = useCallback(() => {
    setShowButton(true);
  }, []);

  if (!mounted) {
    return (
      <div className={className}>
        <Button
          className={className}
          text="Добавить к заказу"
          variant="primary"
        />
      </div>
    );
  }

  if (!showButton && quantity > 0) {
    return (
      <div
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <ProductQuantityCounter
          id={id}
          quantity={quantity}
          onRemove={handleRemove}
          isProductPage={isProductPage}
        />
      </div>
    );
  }

  return (
    <div className={className} onClick={handleAddToCart}>
      <Button className={className} text="В корзину" variant="primary" />
    </div>
  );
}
