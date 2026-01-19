"use client";

import styles from "./AvailabilityStatusTab.module.scss";

type AvailabilityStatusTabProps = {
  warehousesCount: number;
};

export function AvailabilityStatusTab({
  warehousesCount,
}: AvailabilityStatusTabProps) {
  const isInStock = warehousesCount > 0;

  return (
    <span className={isInStock ? styles.tab : styles.tabOutOfStock}>
      {isInStock ? "В наличии" : "Под заказ"}
    </span>
  );
}
