"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import styles from "./ProductsSlider.module.scss";
import { useState, useImperativeHandle, forwardRef } from "react";
import "swiper/scss";
import "swiper/scss/navigation";
import type { Swiper as SwiperType } from "swiper";

import { ProductCard, ProductType } from "@/entities/product";

type Props = {
  data: ProductType[];
  showAllCharacteristics?: boolean;
  categoryPath?: string[]; // Путь категории для сохранения вложенности в URL продукта
};

export type ProductsSliderRef = {
  swiper: SwiperType | null;
  isBeginning: boolean;
  isEnd: boolean;
};

export const ProductsSliderContent = forwardRef<ProductsSliderRef, Props>(
  ({ data, showAllCharacteristics = false, categoryPath }, ref) => {
    const [swiper, setSwiper] = useState<SwiperType | null>(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);

    useImperativeHandle(ref, () => ({
      swiper,
      isBeginning,
      isEnd,
    }));

    const handleSlideChange = (swiper: SwiperType) => {
      setIsBeginning(swiper.isBeginning);
      setIsEnd(swiper.isEnd);
    };

    return (
      <div className={styles.container}>
        <Swiper
          className={styles.swiper}
          modules={[Navigation]}
          onSwiper={(swiper) => {
            setSwiper(swiper);
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={handleSlideChange}
          slidesPerView="auto"
          spaceBetween={15}
          allowTouchMove={true}
          grabCursor={true}
          breakpoints={{
            1600: {
              slidesPerView: 4,
              spaceBetween: 10,
            },

            1200: {
              slidesPerView: 3,
              spaceBetween: 10,
            },

            768: {
              slidesPerView: 2,
              spaceBetween: 10,
              allowTouchMove: true,
            },

            // Переход на 1.2 карточки раньше, чтобы карточка не сужалась меньше 280px
            // 2 * 280 + 10 ≈ 570
            570: {
              slidesPerView: 1.6,
              spaceBetween: 15,
              allowTouchMove: true,
            },

            320: {
              slidesPerView: 1.2,
              spaceBetween: 15,
              allowTouchMove: true,
            },
          }}
        >
          {data.map((product, index) => (
            <SwiperSlide key={index} className={styles.swiperSlide}>
              <ProductCard
                product={product}
                showAllCharacteristics={showAllCharacteristics}
                categoryPath={categoryPath}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  },
);

ProductsSliderContent.displayName = "ProductsSliderContent";
