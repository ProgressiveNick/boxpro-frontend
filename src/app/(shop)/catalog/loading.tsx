import styles from "./[...slugs]/Catalog.module.scss";
import { SkeletonCard } from "@/shared/ui/skeleton";

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Скелетон хлебных крошек */}
        <div className={styles.breadcrumbsWrapper}>
          <div className={styles.skeletonBreadcrumbs}>
            <div className={styles.skeletonBreadcrumb} />
            <div className={styles.skeletonBreadcrumb} />
            <div className={styles.skeletonBreadcrumb} />
          </div>
        </div>

        {/* Скелетон обложки/заголовка категории (или h1 на главной каталога) */}
        <div className={styles.skeletonCover} aria-hidden />

        {/* Скелетон слайдера категорий */}
        <div className={styles.skeletonSliderRow}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeletonSliderCard} aria-hidden />
          ))}
        </div>

        {/* Скелетон ProductsCatalog: контролы, фильтры, сетка */}
        <div className={styles.catalogSkeleton}>
          {/* Строка контролов (сортировка, кол-во) */}
          <div className={styles.skeletonControlsRow}>
            <div className={styles.skeletonControlsCount} />
            <div className={styles.skeletonControlsActions}>
              <div className={styles.skeletonControlsDropdown} />
              <div className={styles.skeletonControlsDropdown} />
            </div>
          </div>

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
