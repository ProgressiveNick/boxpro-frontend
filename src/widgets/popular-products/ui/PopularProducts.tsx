"use client";

import { useRef } from "react";
import {
  ProductsSlider,
  type ProductsSliderRef,
  SliderNavigationButtons,
} from "@/features/product-slider";
import styles from "./PopularProducts.module.scss";
import type { ProductType } from "@/entities/product";

type PopularProductsProps = {
  products: ProductType[];
};

export function PopularProducts({ products }: PopularProductsProps) {
  const sliderRef = useRef<ProductsSliderRef>(null);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={styles.container}>
      <div className={styles.blockWrapper}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>Популярное оборудование</h3>
          <SliderNavigationButtons sliderRef={sliderRef} />
        </div>
        <div className={styles.sliderWrapper}>
          <ProductsSlider ref={sliderRef} data={products} />
        </div>
      </div>
    </section>
  );
}
