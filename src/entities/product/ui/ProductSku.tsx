import styles from "./ProductSku.module.scss";

type ProductSkuProps = {
    sku: string | undefined;
};

export function ProductSku({ sku }: ProductSkuProps) {
    return <p className={styles.article}>{sku ? `Артикул: ${sku}` : ""}</p>;
}
