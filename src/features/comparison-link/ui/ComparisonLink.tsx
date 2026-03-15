"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useComparisonStore } from "@/entities/comparison/model/store";
import styles from "./ComparisonLink.module.scss";

export function ComparisonLink() {
  const [mounted, setMounted] = useState(false);
  const items = useComparisonStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      className={styles.iconsContainer__item}
      href="/comparison"
      aria-label="Сравнение"
    >
      <div className={styles.comparisonIcon}>
        <div className={styles.comparisonCounter}>
          <p suppressHydrationWarning>{mounted ? items.length : 0}</p>
        </div>
      </div>
    </Link>
  );
}
