"use client";

import Link from "next/link";
import styles from "./PromoBanner.module.scss";
import Image from "next/image";

function PromoBannerSliderContent() {
  return (
    <div className={styles.slider}>
      <div className={styles.slide}>
        <Image
          alt=""
          src="/img/mainMenu/promoBanners/banner-1.png"
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          quality={85}
        />
        <h1 className={styles.headline}>
          BoxPro - ваш надежный партнер в мире упаковочного и производственного
          оборудования
        </h1>

        <div className={styles.content}>
          <p className={styles.description}>
            Изучим ваш продукт и текущую производственную линию, подберем
            наилучший вариант оборудования и организуем доставку
          </p>
          <Link href="/catalog">
            <div className={styles.link}>В каталог</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export { PromoBannerSliderContent };
export default PromoBannerSliderContent;
