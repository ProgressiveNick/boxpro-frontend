"use client";

import { useRef, useState, useEffect } from "react";
import {
  Category,
  CategoryCard,
  CategoryCards,
  getCategoryUrl,
} from "@/entities/categories";
import { getImageUrl } from "@/shared/lib/helpers/imageUrl";
import styles from "./CatalogCategorySlider.module.scss";

type CatalogCategorySliderProps = {
  categories: Category[];
  allCategories?: Category[]; // Все категории из меню для построения полного пути
  excludeId?: string;
  variant?: "root" | "nested";
};

export function CatalogCategorySlider({
  categories,
  allCategories,
  excludeId,
  variant = "root",
}: CatalogCategorySliderProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // useEffect должен быть вызван до любых ранних return
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.style.cursor = "grab";
    }
  }, []);

  if (!categories || categories.length === 0) {
    return null;
  }

  const filteredCategories = excludeId
    ? categories.filter((category) => {
        const id = category.documentId || String(category.id);
        return id !== excludeId;
      })
    : categories;

  if (filteredCategories.length === 0) {
    return null;
  }

  // Используем allCategories для построения полного пути, если они переданы
  // Иначе используем только categories (для обратной совместимости)
  const categoriesForPath =
    allCategories && allCategories.length > 0 ? allCategories : categories;

  const cards: CategoryCards[] = filteredCategories.map((category) => {
    const url = getCategoryUrl(category, categoriesForPath);
    // Логирование для отладки
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[CatalogCategorySlider] Category: ${category.name} (${
          category.slug
        }), parent: ${
          category.parent
            ? typeof category.parent === "object"
              ? category.parent.slug
              : category.parent
            : "none"
        }, URL: ${url}`
      );
    }
    return {
      name: category.name,
      url,
      imgSrc: category.img_menu?.url
        ? getImageUrl(category.img_menu.url, "strapi")
        : "/img/mainMenu/default.png",
    };
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollerRef.current) return;
    // Проверяем, что клик не на ссылке
    const target = e.target as HTMLElement;
    if (target.closest("a")) {
      return;
    }
    setIsDragging(true);
    setStartX(e.pageX - scrollerRef.current.offsetLeft);
    setScrollLeft(scrollerRef.current.scrollLeft);
    scrollerRef.current.style.cursor = "grabbing";
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollerRef.current) {
      scrollerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollerRef.current) {
      scrollerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollerRef.current) return;
    const x = e.pageX - scrollerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Скорость прокрутки

    // Если перемещение больше 5px, считаем это drag
    if (Math.abs(walk) > 5) {
      e.preventDefault();
      scrollerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <section
      className={`${styles.container} ${
        variant === "nested" ? styles.containerNested : styles.containerRoot
      }`}
    >
      <div
        ref={scrollerRef}
        className={styles.scroller}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {cards.map((card, index) => (
          <div key={card.url} className={styles.slide}>
            <CategoryCard
              card={card}
              size="small"
              hideImage={false}
              index={index}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
