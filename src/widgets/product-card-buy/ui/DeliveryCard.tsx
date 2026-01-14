"use client";

import Image from "next/image";
import styles from "./DeliveryCard.module.scss";

export function DeliveryCard() {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <p className={styles.label}>Доставим в любую точку России</p>
      </div>
      <div className={styles.icon}>
        <Image
          src="/img/delivery/one.png"
          alt="Доставка"
          width={48}
          height={48}
        />
      </div>
    </div>
  );
}
