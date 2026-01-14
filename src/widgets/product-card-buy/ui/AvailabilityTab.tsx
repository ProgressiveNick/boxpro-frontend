"use client";

import styles from "./AvailabilityTab.module.scss";

type AvailabilityTabProps = {
  cities: string[];
};

export function AvailabilityTab({ cities }: AvailabilityTabProps) {
  return (
    <span className={styles.tab}>
      Наличие в {cities.length > 0 ? cities.join(", ") : "городах"}
    </span>
  );
}

