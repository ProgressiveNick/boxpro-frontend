"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import styles from "./ProductsSlider.module.scss";
import type { ProductsSliderRef } from "./ProductsSliderContent";
import type { ProductType } from "@/entities/product";

const ProductsSliderContent = dynamic(
  () => import("./ProductsSliderContent").then((mod) => ({
    default: mod.ProductsSliderContent,
  })),
  {
    ssr: false,
    loading: () => (
      <div className={styles.container}>
        <div className={styles.swiper} style={{ minHeight: "300px" }} />
      </div>
    ),
  }
);

type Props = {
  data: ProductType[];
  showAllCharacteristics?: boolean;
  categoryPath?: string[]; // Путь категории для сохранения вложенности в URL продукта
};

export type { ProductsSliderRef };

export const ProductsSlider = forwardRef<ProductsSliderRef, Props>(
  (props, ref) => {
    return <ProductsSliderContent {...props} ref={ref} />;
  }
);

ProductsSlider.displayName = "ProductsSlider";
