"use client";

import styles from "./AvailabilityStatusTab.module.scss";

type AvailabilityStatusTabProps = {
  warehousesCount: number;
};

export function AvailabilityStatusTab({
  warehousesCount,
}: AvailabilityStatusTabProps) {
  if (warehousesCount <= 0) {
    return null;
  }

  return (
    <span className={styles.tab}>В наличии</span>
  );
}

