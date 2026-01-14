import { AttributeValue } from "@/entities/product-attributes";
import styles from "./ProductDetails.module.scss";

type ProductDetailsProps = {
    attributes: AttributeValue[];
    showAll?: boolean;
    isLoading?: boolean; // Флаг загрузки характеристик
};

export function ProductDetails({ attributes, showAll = false, isLoading = false }: ProductDetailsProps) {
    // Показываем placeholder во время загрузки
    if (isLoading) {
        return (
            <div className={styles.characteristics}>
                <div className={styles.placeholder}>
                    <p>Характеристики</p>
                </div>
            </div>
        );
    }

    if (!attributes || !Array.isArray(attributes)) {
        return null;
    }

    const filteredArray = attributes.filter(
        (chrctr) =>
            chrctr?.harakteristica?.name &&
            !chrctr.harakteristica.name.includes("Наличие") &&
            chrctr.harakteristica.name !== "Артикул"
    );
    
    const filtered = showAll ? filteredArray : filteredArray.slice(0, 4);

    if (filtered.length === 0) {
        return null;
    }

    return (
        <div className={styles.characteristics}>
            <ul>
                {filtered.map((chrctr, index) => (
                    <li
                        key={chrctr.id || index}
                        className={styles.charLine}
                    >
                        <p>{chrctr.harakteristica?.name || ""}</p>
                        <span>
                            ...................................................................................
                        </span>
                        <p className={styles.charValue}>
                            {chrctr.harakteristica?.type === "string"
                                ? chrctr.string_value ||
                                  chrctr.number_value
                                : chrctr.number_value ||
                                  chrctr.string_value}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
