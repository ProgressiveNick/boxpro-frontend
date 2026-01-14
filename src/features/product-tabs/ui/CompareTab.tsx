"use client";

import { Square } from "lucide-react";
import styles from "./CompareTab.module.scss";

type CompareTabProps = {
  label?: string;
  onClick?: () => void;
  className?: string;
};

export function CompareTab({
  label = "Сравнить",
  onClick,
  className,
}: CompareTabProps) {
  return (
    <div className={`${styles.compareTab} ${className || ""}`} onClick={onClick}>
      <Square className={styles.checkboxIcon} size={16} strokeWidth={2} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
















