"use client";

import { RecentlyViewedSlider } from "@/features/recently-viewed-slider";
import styles from "./RecentlyViewedBlock.module.scss";

export function RecentlyViewedBlock() {
  return (
    <section className={styles.container}>
      <div className={styles.blockWrapper}>
        <RecentlyViewedSlider />
      </div>
    </section>
  );
}
