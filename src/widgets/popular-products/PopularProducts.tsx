import { ProductsSlider } from "@/features/product-slider";
import styles from "./PopularProducts.module.scss";
import type { ProductType } from "@/entities/product";

type PopularProductsProps = {
  products: ProductType[];
};

export function PopularProducts({ products }: PopularProductsProps) {
  return (
    <section className={styles.container}>
      <div className={styles.blockWrapper}>
        <h2>Популярное оборудование</h2>
        <ProductsSlider data={products} />
      </div>
    </section>
  );
}
