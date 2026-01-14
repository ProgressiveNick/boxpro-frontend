"use client";

import { Star } from "lucide-react";
import styles from "./ReviewsTab.module.scss";

type ReviewsTabProps = {
  rating?: number;
  reviewsCount?: number;
  onClick?: () => void;
  className?: string;
};

export function ReviewsTab({
  rating = 4.77,
  reviewsCount = 268,
  onClick,
  className,
}: ReviewsTabProps) {
  return (
    <div className={`${styles.reviewsTab} ${className || ""}`} onClick={onClick}>
      <Star className={styles.starIcon} size={16} fill="#FC7B08" color="#FC7B08" />
      <span className={styles.rating}>{rating}</span>
      <span className={styles.separator}>|</span>
      <span className={styles.reviewsCount}>{reviewsCount} отзывов</span>
    </div>
  );
}

