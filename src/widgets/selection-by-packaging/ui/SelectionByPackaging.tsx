"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./SelectionByPackaging.module.scss";
import { packagingGroups, packagingTabs } from "../model/data";
import { PackagingGroup } from "../model/types";

export function SelectionByPackaging() {
  const [activeGroupId, setActiveGroupId] = useState<number>(1);

  const activeGroup: PackagingGroup | undefined = packagingGroups.find(
    (group) => group.id === activeGroupId
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Упаковочное оборудование по типу необходимой упаковки
      </h2>

      <div className={styles.tabsContainer}>
        {packagingTabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${
              activeGroupId === tab.groupId ? styles.tabActive : ""
            }`}
            onClick={() => setActiveGroupId(tab.groupId)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.divider}></div>

      <div className={styles.cardsContainer}>
        {activeGroup?.cards.map((card) => (
          <Link key={card.id} href={card.link} className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.cardText}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardDescription}>{card.description}</p>
              </div>
              <div className={styles.cardImage}>
                <Image
                  src={card.imagePath}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  quality={80}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
