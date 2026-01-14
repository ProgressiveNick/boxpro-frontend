"use client";

import { useState } from "react";
import styles from "./ProductCard.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ProductCtaBlock,
  ProductDetails,
  ProductImage,
  ProductSku,
  ProductType,
} from "@/entities/product";

import { getSku } from "@/entities/product/lib/getSku";
import { AddProductToFavoriteButton } from "@/features/add-product-to-favorite";
import { getProductImageUrl } from "@/shared/lib/helpers/imageUrl";

type Props = {
  product: ProductType;
  showAllCharacteristics?: boolean;
  categoryPath?: string[]; // Опциональный путь категории для сохранения вложенности
  isLoadingAttributes?: boolean; // Флаг загрузки характеристик
};

export function ProductCard({
  product,
  showAllCharacteristics = false,
  categoryPath,
  isLoadingAttributes = false,
}: Props) {
  const [hoverImg, setHoverImg] = useState<boolean>(false);
  const pathname = usePathname();
  const sku = getSku(product.harakteristici);

  // Определяем URL продукта с учетом вложенности
  const getProductUrl = (): string => {
    // Если передан categoryPath, добавляем его как query параметр
    if (categoryPath && categoryPath.length > 0) {
      return `/product/${product.slug}?categoryPath=${categoryPath.join("/")}`;
    }

    // Если находимся в каталоге (pathname начинается с /catalog/), сохраняем вложенность
    if (pathname && pathname.startsWith("/catalog/")) {
      // Извлекаем путь категории из текущего URL
      const catalogPath = pathname.replace("/catalog/", "").split("/").filter(Boolean);
      
      if (catalogPath.length > 0) {
        return `/product/${product.slug}?categoryPath=${catalogPath.join("/")}`;
      }
    }

    // Во всех остальных случаях используем простой путь
    return `/product/${product.slug}`;
  };

  const handleCardClick = () => {
    // Скроллим вверх перед переходом
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <>
      <div
        className={styles.wrapper}
        onMouseEnter={() => setHoverImg(true)}
        onMouseLeave={() => setHoverImg(false)}
      >
        <Link
          href={getProductUrl()}
          onClick={handleCardClick}
          scroll={true}
        >
          <ProductImage
            primaryImagePath={
              product?.pathsImgs?.[0]?.path
                ? getProductImageUrl(product.pathsImgs[0].path)
                : undefined
            }
            secondImagePath={
              product?.pathsImgs?.[1]?.path
                ? getProductImageUrl(product.pathsImgs[1].path)
                : undefined
            }
            alt={product.name}
            hovering={hoverImg}
          />

          <ProductSku sku={sku} />

          <h4 className={styles.title}>{product.name}</h4>

          <AddProductToFavoriteButton product={product} />

          <ProductDetails
            attributes={product.harakteristici}
            showAll={showAllCharacteristics}
            isLoading={isLoadingAttributes}
          />

          <ProductCtaBlock product={product} />
        </Link>
      </div>
    </>
  );
}
