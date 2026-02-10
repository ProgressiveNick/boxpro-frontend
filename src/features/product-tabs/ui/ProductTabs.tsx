"use client";

import { TABS_MAP, TabKey } from "@/widgets/product-card-buy/constants/tabs";
import { scrollToProductReviews } from "../lib/scrollToProductReviews";
import { ReviewsTab } from "./ReviewsTab";
import { QuestionTab } from "./QuestionTab";
import { ReliabilityBadge } from "./ReliabilityBadge";
import { ProductType } from "@/entities/product";
import styles from "./ProductTabs.module.scss";

type ProductTabsProps = {
  tabs: TabKey[];
  className?: string;
  product?: ProductType;
};

export function ProductTabs({ tabs, className, product }: ProductTabsProps) {
  const handleTabClick = (key: TabKey) => {
    if (key === "questions") {
      scrollToProductReviews("questions");
    }

    if (key === "reviews") {
      scrollToProductReviews("reviews");
    }
  };

  // Вычисляем данные для отзывов
  const reviews = product?.reviews || [];
  const reviewsCount = reviews.length;
  const averageRating =
    reviewsCount > 0
      ? reviews.reduce((sum, review) => sum + review.score, 0) / reviewsCount
      : 0;

  return (
    <div className={`${styles.wrapper} ${className || ""}`}>
      {tabs.map((key) => {
        const tabData = TABS_MAP[key];
        if (!tabData) {
          return null;
        }

        if (key === "reviews") {
          return (
            <ReviewsTab
              key={key}
              rating={averageRating}
              reviewsCount={reviewsCount}
              onClick={() => handleTabClick(key)}
              className={styles.tab}
            />
          );
        }

        if (key === "questions") {
          return (
            <QuestionTab
              key={key}
              label={tabData.label}
              onClick={() => handleTabClick(key)}
              className={`${styles.tab} ${styles.tabInline}`}
            />
          );
        }

        if (key === "reliability") {
          return (
            <ReliabilityBadge
              key={key}
              label={tabData.label}
              tooltip={tabData.tooltip}
              className={styles.tab}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
