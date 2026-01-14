"use client";

import { useEffect, useState } from "react";
import type { ProductsSliderRef } from "./ProductsSlider";
import styles from "./ProductsSlider.module.scss";

type SliderNavigationButtonsProps = {
  sliderRef: React.RefObject<ProductsSliderRef | null>;
};

export function SliderNavigationButtons({
  sliderRef,
}: SliderNavigationButtonsProps) {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    const checkState = () => {
      if (sliderRef.current) {
        setIsBeginning(sliderRef.current.isBeginning);
        setIsEnd(sliderRef.current.isEnd);
      }
    };

    // Подписываемся на события слайдера
    const swiper = sliderRef.current?.swiper;
    if (swiper) {
      swiper.on("slideChange", checkState);
      checkState();
    }

    // Проверяем состояние периодически на случай, если слайдер еще не инициализирован
    const interval = setInterval(checkState, 100);

    return () => {
      if (swiper) {
        swiper.off("slideChange", checkState);
      }
      clearInterval(interval);
    };
  }, [sliderRef]);

  const handleNext = () => {
    if (!isEnd && sliderRef.current?.swiper) {
      sliderRef.current.swiper.slideNext();
    }
  };

  const handlePrev = () => {
    if (!isBeginning && sliderRef.current?.swiper) {
      sliderRef.current.swiper.slidePrev();
    }
  };

  return (
    <div className={styles.navigationButtons}>
      <button
        className={`${styles.customSwiperButtonPrev} ${
          isBeginning ? styles.disabled : ""
        }`}
        onClick={handlePrev}
        type="button"
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
        className={`${styles.customSwiperButtonNext} ${
          isEnd ? styles.disabled : ""
        }`}
        onClick={handleNext}
        type="button"
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
    </div>
  );
}




