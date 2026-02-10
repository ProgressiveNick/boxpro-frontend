"use client";

import React, { useState, useCallback } from "react";
import styles from "./TabMenu.module.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import Link from "next/link";
import { Navigation } from "swiper/modules";
import { useTestFormStore } from "@/widgets/test-form/model/store";

const tabsData = [
  {
    label: "Сервисный центр",
    url: "/services",
  },

  {
    label: "Лизинг",
    url: "/lizing",
  },
  {
    label: "Доставка",
    url: "/delivery",
  },
  {
    label: "Гарантия",
    url: "/garant-and-remont",
  },

  {
    label: "Контакты",
    url: "/contacts",
  },
];

export function TabMenuContent() {
  const [hasOverflow, setHasOverflow] = useState(false);

  const updateNavVisibility = useCallback((swiper: SwiperType) => {
    const overflow = !swiper.isBeginning || !swiper.isEnd;
    setHasOverflow(overflow);
  }, []);

  React.useEffect(() => {
    const nextButton = document.querySelector(
      `.${styles.customSwiperButtonNext}`,
    ) as HTMLElement;
    const prevButton = document.querySelector(
      `.${styles.customSwiperButtonPrev}`,
    ) as HTMLElement;

    const clickNextButton = () => (nextButton ? nextButton.click() : null);
    const clickPrevButton = () => (prevButton ? prevButton.click() : null);

    nextButton?.addEventListener("mouseover", clickNextButton);
    prevButton?.addEventListener("mouseover", clickPrevButton);

    return () => {
      nextButton?.removeEventListener("mouseover", clickNextButton);
      prevButton?.removeEventListener("mouseover", clickPrevButton);
    };
  }, []);

  return (
    <section
      className={`${styles.container} ${hasOverflow ? styles.hasOverflow : ""}`}
    >
      <Swiper
        modules={[Navigation]}
        className={styles.tabMenuContainer}
        slidesPerView="auto"
        navigation={{
          nextEl: `.${styles.customSwiperButtonNext}`,
          prevEl: `.${styles.customSwiperButtonPrev}`,
        }}
        spaceBetween={10}
        allowTouchMove={true}
        grabCursor={true}
        onSwiper={(swiper) => {
          updateNavVisibility(swiper);
          swiper.on("resize", () => updateNavVisibility(swiper));
          swiper.on("slideChange", () => updateNavVisibility(swiper));
        }}
        onResize={(swiper) => updateNavVisibility(swiper)}
        onSlideChange={(swiper) => updateNavVisibility(swiper)}
        breakpoints={{
          320: {
            slidesPerView: 2.5,
            spaceBetween: 8,
          },
          480: {
            slidesPerView: 3.5,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: 4.5,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 6,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 8,
            spaceBetween: 10,
          },
          1280: {
            slidesPerView: 9,
            spaceBetween: 10,
          },
        }}
      >
        <div
          className={`${styles.customSwiperButtonNext} ${styles.navigationButton}`}
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
        </div>
        <div
          className={`${styles.customSwiperButtonPrev} ${styles.navigationButton}`}
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
        </div>

        {/* Promo TAB "Бесплатное тестирование" */}
        <SwiperSlide className={styles.slideTab}>
          <div
            className={`${styles.tablineTab} ${styles.promoTab}`}
            onClick={() => {
              useTestFormStore.setState({ isOpen: true });
            }}
          >
            Бесплатное тестирование
          </div>
        </SwiperSlide>

        {/* "Каталог" после "Бесплатное тестирование" */}
        <SwiperSlide className={styles.slideTab}>
          <Link href="/catalog">
            <p className={styles.tablineTab}>Каталог</p>
          </Link>
        </SwiperSlide>

        {tabsData.map((tab, index) => (
          <SwiperSlide key={index} className={styles.slideTab}>
            <Link href={tab.url}>
              <p className={styles.tablineTab}>{tab.label}</p>
            </Link>
          </SwiperSlide>
          //swiper navigation button
        ))}
      </Swiper>
    </section>
  );
}
