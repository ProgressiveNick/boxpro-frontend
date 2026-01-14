import styles from "./[...slugs]/Catalog.module.scss";
import { SkeletonCard } from "@/shared/ui/skeleton";

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Скелетон ProductsCatalog */}
        <div className={styles.catalogSkeleton}>
          {/* Скелетон фильтров */}
          <aside className={styles.filtersSkeleton}>
            <div className={styles.skeletonFilterHeader}>
              <div className={styles.skeletonFilterTitle} />
              <div className={styles.skeletonFilterCount} />
            </div>
            <div className={styles.skeletonFilterContent}>
              <div className={styles.skeletonFilterItem} />
              <div className={styles.skeletonFilterItem} />
            </div>
            <div className={styles.skeletonFilterActions}>
              <div className={styles.skeletonButton} />
            </div>
          </aside>

          {/* Сетка скелетонов карточек */}
          <main className={styles.contentSkeleton}>
            <div className={styles.resultWrapper}>
              {Array.from({ length: 24 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>

            {/* Скелетон пагинации */}
            <div className={styles.paginationSkeleton}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={styles.skeletonPageButton} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
