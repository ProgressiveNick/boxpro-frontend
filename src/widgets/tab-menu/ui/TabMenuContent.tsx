"use client";

import { useState, useCallback } from "react";
import styles from "./TabMenu.module.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "swiper/modules";
import { useUIStore } from "@/shared/store/useUIStore";
import { tabsData } from "../model/const";

export function TabMenuContent() {
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);

  const updateNavVisibility = useCallback((swiper: SwiperType) => {
    setCanGoPrev(!swiper.isBeginning);
    setCanGoNext(!swiper.isEnd);
  }, []);

  return (
    <section
      className={`${styles.container} ${canGoPrev ? styles.canGoPrev : ""} ${canGoNext ? styles.canGoNext : ""}`}
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
          <Image src="/icons/ArrowRight.svg" alt="" width={24} height={24} />
        </div>
        <div
          className={`${styles.customSwiperButtonPrev} ${styles.navigationButton}`}
        >
          <Image src="/icons/ArrowLeft.svg" alt="" width={24} height={24} />
        </div>

        {/* Promo TAB "Бесплатное тестирование" */}
        <SwiperSlide className={styles.slideTab}>
          <div
            className={`${styles.tablineTab} ${styles.promoTab}`}
            onClick={() => useUIStore.getState().openTestForm()}
          >
            Бесплатное тестирование
          </div>
        </SwiperSlide>

        {tabsData.map((tab, index) => (
          <SwiperSlide key={index} className={styles.slideTab}>
            <Link href={tab.url}>
              <p className={styles.tablineTab}>{tab.label}</p>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
