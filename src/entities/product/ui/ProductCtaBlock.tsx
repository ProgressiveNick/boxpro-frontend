import styles from "./ProductCtaBlock.module.scss";
import { formattedPrice } from "../lib/formattedPrice";
import { AddProductToCartButton } from "@/features/add-product-to-cart";
import { ProductType } from "../model";

export function ProductCtaBlock({ product }: { product: ProductType }) {
  return (
    <div className={styles.ctaWrapper}>
      <div className={styles.priceWrapper}>
        <h4 className={styles.price}>{formattedPrice(product.price)}</h4>
      </div>

      <AddProductToCartButton
        product={product}
        className={styles.cta}
        quantityBlockClassName={styles.ctaQuantity}
      />
    </div>
  );
}
