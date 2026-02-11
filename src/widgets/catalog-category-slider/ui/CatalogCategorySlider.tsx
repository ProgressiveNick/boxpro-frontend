"use client";

import { useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import {
  Category,
  CategoryCard,
  CategoryCards,
  getCategoryUrl,
} from "@/entities/categories";
import { getImageUrl } from "@/shared/lib/helpers/imageUrl";
import styles from "./CatalogCategorySlider.module.scss";

import "swiper/scss";

type CatalogCategorySliderProps = {
  categories: Category[];
  allCategories?: Category[];
  excludeId?: string;
  variant?: "root" | "nested";
};

export function CatalogCategorySlider({
  categories,
  allCategories,
  excludeId,
  variant = "root",
}: CatalogCategorySliderProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(
    null
  );
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateNavState = useCallback((swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
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

  const categoriesForPath =
    allCategories && allCategories.length > 0 ? allCategories : categories;

  const cards: CategoryCards[] = filteredCategories.map((category) => {
    const url = getCategoryUrl(category, categoriesForPath);
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

  const hasOverflow = !isBeginning || !isEnd;

  return (
    <section
      className={`${styles.container} ${
        variant === "nested" ? styles.containerNested : styles.containerRoot
      } ${hasOverflow ? styles.hasOverflow : ""}`}
    >
      <div className={styles.wrapper}>
        <button
          type="button"
          className={`${styles.navPrev} ${styles.navButton}`}
          aria-label="Предыдущие категории"
          disabled={isBeginning}
          onClick={() => swiperInstance?.slidePrev()}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 4l-8 8 8 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.navNext} ${styles.navButton}`}
          aria-label="Следующие категории"
          disabled={isEnd}
          onClick={() => swiperInstance?.slideNext()}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 4l8 8-8 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <Swiper
          className={styles.swiper}
          slidesPerView="auto"
          spaceBetween={16}
          allowTouchMove={true}
          grabCursor={true}
          onSwiper={(swiper) => {
            setSwiperInstance(swiper);
            updateNavState(swiper);
            swiper.on("resize", () => updateNavState(swiper));
            swiper.on("slideChange", () => updateNavState(swiper));
          }}
          onResize={updateNavState}
          onSlideChange={updateNavState}
        >
          {cards.map((card, index) => (
            <SwiperSlide
              key={card.url}
              className={styles.slide}
              style={{ width: "220px" }}
            >
              <CategoryCard
                card={card}
                size="small"
                hideImage={false}
                index={index}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
