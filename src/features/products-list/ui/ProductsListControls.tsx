"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./ProductsListControls.module.scss";

type SortOption = "price:asc" | "price:desc";
type PageSizeOption = "12" | "36" | "48";

type ProductsListControlsProps = {
  total: number;
  isLoading?: boolean; // Состояние загрузки для показа индикатора на кнопках
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "price:asc", label: "Сначала дешевле" },
  { value: "price:desc", label: "Сначала дороже" },
];

const PAGE_SIZE_OPTIONS: PageSizeOption[] = ["12", "36", "48"];

export function ProductsListControls({ total, isLoading = false }: ProductsListControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [pendingSort, setPendingSort] = useState<SortOption | null>(null);
  const [pendingPageSize, setPendingPageSize] = useState<PageSizeOption | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const pageSizeRef = useRef<HTMLDivElement>(null);

  // Получаем текущие значения из URL
  const currentSort = (searchParams.get("sort") as SortOption) || "price:desc";
  const currentPageSize = (searchParams.get("pageSize") as PageSizeOption) || "36";
  
  // Сбрасываем pending состояния когда значения совпадают (независимо от isLoading)
  useEffect(() => {
    if (pendingSort !== null && pendingSort === currentSort && !isLoading) {
      setPendingSort(null);
    }
  }, [currentSort, pendingSort, isLoading]);
  
  useEffect(() => {
    if (pendingPageSize !== null && pendingPageSize === currentPageSize && !isLoading) {
      setPendingPageSize(null);
    }
  }, [currentPageSize, pendingPageSize, isLoading]);
  
  // Определяем, какая кнопка должна показывать загрузку
  // Показываем загрузку если есть pending значение И идет загрузка
  const isSortLoading = pendingSort !== null && isLoading;
  const isPageSizeLoading = pendingPageSize !== null && isLoading;

  // Закрытие dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (pageSizeRef.current && !pageSizeRef.current.contains(event.target as Node)) {
        setIsPageSizeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const updateURL = (params: { sort?: SortOption; pageSize?: PageSizeOption }) => {
    const currentUrl = new URL(window.location.href);
    
    if (params.sort !== undefined) {
      currentUrl.searchParams.set("sort", params.sort);
    }
    if (params.pageSize !== undefined) {
      currentUrl.searchParams.set("pageSize", params.pageSize);
      // При изменении размера страницы сбрасываем на первую страницу
      currentUrl.searchParams.delete("page");
    }
    
    router.push(currentUrl.pathname + currentUrl.search);
  };

  const handleSortChange = (sort: SortOption) => {
    if (sort !== currentSort) {
      setPendingSort(sort);
    }
    setIsSortOpen(false);
    updateURL({ sort });
  };

  const handlePageSizeChange = (pageSize: PageSizeOption) => {
    if (pageSize !== currentPageSize) {
      setPendingPageSize(pageSize);
    }
    setIsPageSizeOpen(false);
    updateURL({ pageSize });
  };

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === currentSort)?.label ||
    "Сначала дороже";

  return (
    <div className={styles.controls}>
      <div className={styles.count}>
        <strong>Товаров: {total}</strong>
      </div>

      <div className={styles.actions}>
        <div className={styles.dropdown} ref={sortRef}>
          <button
            className={`${styles.dropdownButton} ${isSortOpen ? styles.open : ""} ${isSortLoading ? styles.loading : ""}`}
            onClick={() => setIsSortOpen(!isSortOpen)}
            type="button"
            disabled={isSortLoading}
          >
            {isSortLoading ? (
              <>
                <span className={styles.spinner} />
                <span className={styles.label} style={{ opacity: 0 }}>{currentSortLabel}</span>
              </>
            ) : (
              <>
                <span className={styles.label}>{currentSortLabel}</span>
                <span className={styles.arrow}>{isSortOpen ? "▲" : "▼"}</span>
              </>
            )}
          </button>
          {isSortOpen && (
            <div className={styles.dropdownMenu}>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`${styles.dropdownItem} ${currentSort === option.value ? styles.active : ""}`}
                  onClick={() => handleSortChange(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.dropdown} ref={pageSizeRef}>
          <button
            className={`${styles.dropdownButton} ${isPageSizeOpen ? styles.open : ""} ${isPageSizeLoading ? styles.loading : ""}`}
            onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
            type="button"
            disabled={isPageSizeLoading}
          >
            {isPageSizeLoading ? (
              <>
                <span className={styles.spinner} />
                <span className={styles.label} style={{ opacity: 0 }}>Показывать по {currentPageSize}</span>
              </>
            ) : (
              <>
                <span className={styles.label}>Показывать по {currentPageSize}</span>
                <span className={styles.arrow}>{isPageSizeOpen ? "▲" : "▼"}</span>
              </>
            )}
          </button>
          {isPageSizeOpen && (
            <div className={styles.dropdownMenu}>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <button
                  key={option}
                  className={`${styles.dropdownItem} ${currentPageSize === option ? styles.active : ""}`}
                  onClick={() => handlePageSizeChange(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

