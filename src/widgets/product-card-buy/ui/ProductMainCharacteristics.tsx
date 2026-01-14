"use client";

import { AttributeValue } from "@/entities/product-attributes";
import styles from "./ProductMainCharacteristics.module.scss";

type ProductMainCharacteristicsProps = {
  characteristics: AttributeValue[];
};

export function ProductMainCharacteristics({
  characteristics,
}: ProductMainCharacteristicsProps) {
  // Фильтруем основные характеристики (первые 3-4 важные)
  const mainCharacteristics = characteristics
    .filter(
      (item) =>
        item?.harakteristica.name &&
        !item.harakteristica.name.includes("Наличие") &&
        item.harakteristica.name !== "Артикул"
    )
    .slice(0, 4);

  if (mainCharacteristics.length === 0) {
    return null;
  }

  return (
    <div className={styles.productMainCharacteristics}>
      {mainCharacteristics.map((item, index) => (
        <div
          className={styles.productMainCharacteristicsItem}
          key={item.id || index}
        >
          <span className={styles.productMainCharacteristicsName}>
            {item.harakteristica.name}:{" "}
          </span>
          <span className={styles.productMainCharacteristicsValue}>
            {item.harakteristica.type === "string"
              ? item.string_value || item.number_value
              : item.number_value || item.string_value}
          </span>
        </div>
      ))}
    </div>
  );
}
