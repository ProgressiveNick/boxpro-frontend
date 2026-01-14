"use client";

import dynamic from "next/dynamic";
import styles from "./PromoBanner.module.scss";
import { SelectionByPackaging } from "@/widgets/selection-by-packaging";

const PromoBannerSlider = dynamic(() => import("./PromoBannerSlider"), {
  ssr: false,
  loading: () => (
    <div className={styles.slider}>
      <div className={styles.slide}>
        <div style={{ width: "100%", height: "100%", minHeight: "400px" }} />
      </div>
    </div>
  ),
});

export function PromoBanner() {
  return (
    <section className={styles.container}>
      <div className={styles.wrapper}>
        <PromoBannerSlider />

        <SelectionByPackaging />
      </div>
    </section>
  );
}
