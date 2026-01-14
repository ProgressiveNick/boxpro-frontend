"use client";

import Link from "next/link";
import Image from "next/image";
import { CategoryCards } from "@/entities/categories";
import styles from "./CategoryCard.module.scss";
import { getImageUrl } from "@/shared/lib/helpers/imageUrl";

type CategoryCardProps = {
  card: CategoryCards;
  index?: number;
  size?: "default" | "small";
  hideImage?: boolean;
};

export function CategoryCard({
  card,
  index = 0,
  size = "default",
  hideImage = false,
}: CategoryCardProps) {
  const cardUrl = card.url || "/catalog";
  const imageUrl =
    !hideImage && card.imgSrc
      ? card.imgSrc.startsWith("/img/")
        ? card.imgSrc
        : getImageUrl(card.imgSrc, "strapi")
      : null;

  return (
    <Link
      href={cardUrl}
      className={`${styles.card} ${size === "small" ? styles.cardSmall : ""}`}
    >
      <div className={styles.cardImageWrapper}>
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={card.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            quality={80}
            style={{ objectFit: "contain", objectPosition: "top" }}
          />
        )}
      </div>
      <div className={styles.cardLabel}>
        <span className={styles.cardLabelText}>{card.name}</span>
      </div>
    </Link>
  );
}
