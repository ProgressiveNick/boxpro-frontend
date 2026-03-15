"use client";

import { useState } from "react";
import styles from "./ProductCard.module.scss";
import Link from "next/link";
import {
  ProductCtaBlock,
  ProductDetails,
  ProductImage,
  ProductSku,
  ProductType,
} from "@/entities/product";

import { getSku } from "@/entities/product/lib/getSku";
import { AddProductToComparisonButton } from "@/features/add-product-to-comparison";
import { AddProductToFavoriteButton } from "@/features/add-product-to-favorite";
import { getProductImageUrl } from "@/shared/lib/helpers/imageUrl";
import { getAvailabilityCities } from "@/widgets/product-card-buy/lib/getAvailabilityCities";
import { AvailabilityStatusTab } from "@/widgets/product-card-buy/ui/AvailabilityStatusTab";

type Props = {
  product: ProductType;
  showAllCharacteristics?: boolean;
  isLoadingAttributes?: boolean; // Флаг загрузки характеристик
};

export function ProductCard({
  product,
  showAllCharacteristics = false,
  isLoadingAttributes = false,
}: Props) {
  const [hoverImg, setHoverImg] = useState<boolean>(false);
  const sku = getSku(product.harakteristici);
  const warehousesCount = getAvailabilityCities(product.harakteristici ?? []).length;

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
          href={`/product/${product.slug}`}
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

          <h3 className={styles.title}>{product.name}</h3>

          <ProductSku sku={sku} />

          <div className={styles.availabilityTabWrapper}>
            <AvailabilityStatusTab warehousesCount={warehousesCount} />
          </div>
          <AddProductToComparisonButton product={product} />
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
