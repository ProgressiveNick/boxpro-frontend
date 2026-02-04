"use client";

import { useFavoritesStore } from "@/entities/favorites/model/store";
import { FavoriteItem } from "@/entities/favorite-item";
import { Breadcrumbs } from "@/widgets/breadcrumbs";
import styles from "./FavoritesPage.module.scss";

export function FavoritesPageContent() {
  const items = useFavoritesStore((state) => state.items);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.breadcrumbsWrapper}>
          <Breadcrumbs name="Избранное" />
        </div>
        <h1 className={styles.title}>Избранное</h1>

        {items.length > 0 ? (
          <div className={styles.itemsGrid}>
            {items.map((item, index) => (
              <FavoriteItem key={index} id={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>В избранном ничего нет</p>
          </div>
        )}
      </div>
    </div>
  );
}
