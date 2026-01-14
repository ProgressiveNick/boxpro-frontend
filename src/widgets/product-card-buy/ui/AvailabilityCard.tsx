"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./AvailabilityCard.module.scss";
import { AttributeValue } from "@/entities/product-attributes";
import { getAvailabilityCities } from "../lib/getAvailabilityCities";

type AvailabilityCardProps = {
  characteristics: AttributeValue[];
};

export function AvailabilityCard({ characteristics }: AvailabilityCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const availableCities = getAvailabilityCities(characteristics);

  const warehousesCount = availableCities.length;

  // Если не нашли склады, не показываем компонент
  if (warehousesCount === 0) {
    return null;
  }

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={styles.content}>
        <p className={styles.label}>В наличии</p>
        <p className={styles.value}>на {warehousesCount} складах</p>
      </div>
      <div className={styles.icon}>
        <Image src="/img/delivery/two.png" alt="Склад" width={48} height={48} />
      </div>
      {showTooltip && availableCities.length > 0 && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipContent}>
            <p className={styles.tooltipTitle}>Доступно в городах:</p>
            <ul className={styles.tooltipList}>
              {availableCities.map((city, index) => (
                <li key={index} className={styles.tooltipItem}>
                  {city}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.tooltipArrow} />
        </div>
      )}
    </div>
  );
}
