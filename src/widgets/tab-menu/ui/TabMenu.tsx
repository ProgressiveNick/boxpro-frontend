"use client";

import dynamic from "next/dynamic";
import styles from "./TabMenu.module.scss";

const TabMenuContent = dynamic(() => import("./TabMenuContent").then((mod) => ({ default: mod.TabMenuContent })), {
  ssr: false,
  loading: () => (
    <section className={styles.container}>
      <div className={styles.tabMenuContainer} style={{ minHeight: "40px" }} />
    </section>
  ),
});

export function TabMenu() {
  return <TabMenuContent />;
}
