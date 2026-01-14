"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import styles from "./ReliabilityBadge.module.scss";

type ReliabilityBadgeProps = {
  label?: string;
  tooltip?: string;
  className?: string;
};

export function ReliabilityBadge({
  label = "Отличная надежность",
  tooltip = "Информация о надежности товара",
  className,
}: ReliabilityBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`${styles.reliabilityBadge} ${className || ""}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <ShieldCheck className={styles.shieldIcon} size={16} color="#22c55e" />
      <span className={styles.label}>{label}</span>
      {showTooltip && tooltip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipContent}>
            <p className={styles.tooltipText}>{tooltip}</p>
          </div>
          <div className={styles.tooltipArrow} />
        </div>
      )}
    </div>
  );
}

