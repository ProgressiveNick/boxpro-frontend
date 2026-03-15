"use client";

import { useState, useEffect } from "react";
import { useComparisonStore } from "@/entities/comparison/model/store";
import { AttributeValue } from "@/entities/product-attributes";
import { ProductType } from "@/entities/product";
import styles from "./AddProductToComparisonButton.module.scss";

export function AddProductToComparisonButton({
  product,
  className,
}: {
  product: ProductType;
  className?: string;
}) {
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

  const characteristics =
    product.harakteristici?.map((item: AttributeValue) => ({
      name: item.harakteristica?.name ?? "",
      value:
        item.harakteristica?.type === "string"
          ? item.string_value ?? item.number_value
          : item.number_value ?? item.string_value,
    })) ?? [];

  const [mounted, setMounted] = useState(false);
  const { items, addItem, removeItem } = useComparisonStore();
  const isInComparison = items.some((item) => item.id === id);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleComparisonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInComparison) {
      removeItem(id);
    } else {
      addItem({
        id,
        title,
        price,
        SKU,
        imageURL,
        description: product.description ?? undefined,
        slug: product.slug,
        characteristics,
      });
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`${styles.comparisonBtn} ${
        isInComparison ? styles.active : ""
      } ${className ?? ""}`}
      onClick={handleComparisonClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleComparisonClick(e as unknown as React.MouseEvent);
        }
      }}
      aria-label={isInComparison ? "Убрать из сравнения" : "Добавить в сравнение"}
    />
  );
}
