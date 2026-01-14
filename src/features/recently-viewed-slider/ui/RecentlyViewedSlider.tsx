"use client";

import { useRef } from "react";
import {
  ProductsSlider,
  type ProductsSliderRef,
  SliderNavigationButtons,
} from "@/features/product-slider";
import { useRecentlyViewedProducts } from "../model/useRecentlyViewedProducts";
import styles from "./RecentlyViewedSlider.module.scss";

type RecentlyViewedSliderProps = {
  currentProductSlug?: string;
};

export function RecentlyViewedSlider({
  currentProductSlug,
}: RecentlyViewedSliderProps) {
  const sliderRef = useRef<ProductsSliderRef>(null);
  const { products, isLoading } = useRecentlyViewedProducts(currentProductSlug);

  if (isLoading || products.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleWrapper}>
        <h3 className={styles.title}>Вы недавно смотрели</h3>
        <SliderNavigationButtons sliderRef={sliderRef} />
      </div>
      <div className={styles.sliderWrapper}>
        <ProductsSlider ref={sliderRef} data={products} />
      </div>
    </div>
  );
}
