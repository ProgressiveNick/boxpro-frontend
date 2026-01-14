"use client";

import { useState, useEffect } from "react";
import styles from "./ProductsCatalog.module.scss";
import { ProductsCatalogFilters } from "./ProductsCatalogFilters";
import { ProductsList, ProductsListControls } from "@/features/products-list";
import { ProductsCatalogProps } from "../model/types";
import { useLoadingState } from "../model/useLoadingState";
import { FilterDrawer } from "@/widgets/filters/ui/filter-drawer";
import { FilterState } from "@/widgets/filters";
import { DEFAULT_FILTERS } from "../lib/constants";
import { initializeFilters } from "../lib/utils";
import { createFiltersQueryString } from "../lib/url-utils";
import { useRouter } from "next/navigation";
import { Category } from "@/entities/categories";

export function ProductsCatalog({
  products,
  categories,
  total,
  currentPage,
  pageSize,
  currentCategoryId,
  initialFilters,
  hasActiveFilters,
  attributes,
  hideFilters,
  categoryPath,
}: ProductsCatalogProps) {
  const { isLoading, startLoading } = useLoadingState();
  const router = useRouter();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState<FilterState>(() =>
    initializeFilters(initialFilters)
  );

  const handleMobileFilterChange = (newFilters: FilterState) => {
    setMobileFilters(newFilters);
    const queryString = createFiltersQueryString(newFilters);
    const currentUrl = new URL(window.location.href);
    currentUrl.search = queryString ? `?${queryString}` : "";
    currentUrl.searchParams.delete("page");
    router.push(currentUrl.pathname + currentUrl.search);
    setIsMobileFilterOpen(false);
    startLoading();
  };

  const handleMobileFilterReset = () => {
    setMobileFilters(DEFAULT_FILTERS);
    router.push(window.location.pathname);
    setIsMobileFilterOpen(false);
    startLoading();
  };

  // Синхронизируем mobileFilters с initialFilters при изменении
  useEffect(() => {
    if (initialFilters) {
      setMobileFilters(initializeFilters(initialFilters));
    }
  }, [initialFilters]);

  // Функция для получения всех категорий (включая вложенные)
  const getAllCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    const addedIds = new Set<number>();

    const traverse = (cats: Category[]) => {
      cats.forEach((cat) => {
        if (!addedIds.has(cat.id)) {
          result.push(cat);
          addedIds.add(cat.id);
        }
        if (cat.childs && cat.childs.length > 0) {
          traverse(cat.childs);
        }
      });
    };

    traverse(categories);
    return result;
  };

  return (
    <div className={styles.container}>
      {/* Мобильная кнопка фильтров */}
      <button
        className={styles.mobileFilterButton}
        onClick={() => setIsMobileFilterOpen(true)}
        type="button"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Фильтры
      </button>

      <div
        className={`${styles.wrapper} ${
          hideFilters ? styles.wrapperFullWidth : ""
        }`}
      >
        {!hideFilters && (
          <aside className={styles.filtersColumn}>
            <ProductsCatalogFilters
              initialFilters={initialFilters}
              attributes={attributes}
              onFilterApply={startLoading}
            />
          </aside>
        )}

        <main className={styles.contentColumn}>
          <ProductsListControls total={total} isLoading={isLoading} />
          <ProductsList
            products={products}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            hasActiveFilters={hasActiveFilters}
            isLoading={isLoading}
            categoryPath={categoryPath}
          />
        </main>
      </div>

      {/* Мобильный FilterDrawer */}
      <FilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        onChange={handleMobileFilterChange}
        categories={getAllCategories(categories)}
        data={products}
        filters={mobileFilters}
        reset={handleMobileFilterReset}
        attributes={attributes}
      />
    </div>
  );
}
