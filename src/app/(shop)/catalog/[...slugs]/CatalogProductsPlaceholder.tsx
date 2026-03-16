import styles from "./Catalog.module.scss";
import { SkeletonCard } from "@/shared/ui/skeleton";

/**
 * Плейсхолдер блока каталога товаров (фильтры + сетка) для Suspense.
 * Показывается пока загружаются товары и атрибуты.
 */
export function CatalogProductsPlaceholder() {
  return (
    <div className={styles.catalogSkeleton} aria-busy="true" aria-label="Загрузка каталога">
      <div className={styles.skeletonControlsRow}>
        <div className={styles.skeletonControlsCount} />
        <div className={styles.skeletonControlsActions}>
          <div className={styles.skeletonControlsDropdown} />
          <div className={styles.skeletonControlsDropdown} />
        </div>
      </div>
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
      <main className={styles.contentSkeleton}>
        <div className={styles.resultWrapper}>
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} aria-hidden />
          ))}
        </div>
        <div className={styles.paginationSkeleton}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonPageButton} aria-hidden />
          ))}
        </div>
      </main>
    </div>
  );
}
