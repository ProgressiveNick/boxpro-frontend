"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./CategoryMenuItem.module.scss";
import { Category } from "../model";
import { getCategoryUrl } from "../lib/getCategoryPath";
import { getImageUrl } from "@/shared/lib/helpers/imageUrl";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

export interface CategoryMenuItemProps {
  category: Category;
  allCategories?: Category[]; // Все категории для построения полного пути
  type?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  onHover?: () => void;
  showArrow?: boolean;
  onArrowClick?: (e: React.MouseEvent) => void;
}

export function CategoryMenuItem({
  category,
  allCategories = [],
  type = "primary",
  className,
  onClick,
  onHover,
  showArrow = false,
  onArrowClick,
}: CategoryMenuItemProps) {
  const imageUrl = category.img_menu?.url
    ? getImageUrl(category.img_menu.url, "strapi")
    : "/img/mainMenu/default.png";
  const isMobile = useMediaQuery(640);

  // Используем полный путь, если есть allCategories, иначе просто slug
  const categoryUrl =
    allCategories.length > 0
      ? getCategoryUrl(category, allCategories)
      : `/catalog/${category.slug}`;

  return (
    <Link
      href={categoryUrl}
      className={`${styles.categoryItem} ${className ? className : ""}`}
      onClick={onClick}
      onMouseEnter={onHover}
    >
      {imageUrl && type === "primary" && (
        <div
          className={`${styles.imageWrapper} ${
            isMobile ? styles.mobleImg : ""
          }`}
        >
          <Image
            src={imageUrl}
            alt={category.name}
            width={64}
            height={64}
            className={styles.image}
          />
        </div>
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{category.name}</h3>
        {category.description && !isMobile && (
          <p className={styles.description}>{category.description}</p>
        )}
      </div>
      {showArrow && (
        <button
          className={styles.arrowButton}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onArrowClick?.(e);
          }}
        >
          <Image src={"/icons/ArrowRight.svg"} width={32} height={32} alt="" />
        </button>
      )}
    </Link>
  );
}
