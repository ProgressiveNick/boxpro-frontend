"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCartStore } from "@/entities/cart/model/store";
import styles from "./OpenCartButton.module.scss";

export function OpenCartButton() {
  const [mounted, setMounted] = useState(false);
  const totalCount = useCartStore((state) => state.totalCount);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link className={styles.iconsContainer__item} href="/cart">
      <div className={styles.shopIcon}>
        <div className={styles.shopCounter}>
          <p suppressHydrationWarning>{mounted ? totalCount : 0}</p>
        </div>
      </div>
    </Link>
  );
}
