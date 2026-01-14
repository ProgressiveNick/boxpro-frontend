"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useFavoritesStore } from "@/entities/favorites/model/store";
import styles from "./OpenFavoritesButton.module.scss";

export function OpenFavoritesButton() {
  const [mounted, setMounted] = useState(false);
  const items = useFavoritesStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link className={styles.iconsContainer__item} href="/favorites">
      <div className={styles.favoritesIcon}>
        <div className={styles.favoritesCounter}>
          <p suppressHydrationWarning>{mounted ? items.length : 0}</p>
        </div>
      </div>
    </Link>
  );
}
