"use client";

import { useState, useEffect } from "react";
import { useFavoritesStore } from "@/entities/favorites/model/store";
import styles from "./AddProductToFavoriteButton.module.scss";
import { AttributeValue } from "@/entities/product-attributes";
import { ProductType } from "@/entities/product";
import ym from "react-yandex-metrika";

export function AddProductToFavoriteButton({
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

  const [mounted, setMounted] = useState(false);
  const { items, addItem, removeItem } = useFavoritesStore();
  const isInFavorites = items.some((item) => item.id === id);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFavoritesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInFavorites) {
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
      });

      ym("reachGoal", "add_to_favorites", {
        product_id: id,
        product_name: title,
        price: price,
        currency: "RUB",
      });
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`${styles.favoritesBtn} ${
        isInFavorites ? styles.active : ""
      } ${className || ""}`}
      onClick={handleFavoritesClick}
    ></div>
  );
}
