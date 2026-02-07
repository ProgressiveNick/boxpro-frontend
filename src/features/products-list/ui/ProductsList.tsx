"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./ProductsList.module.scss";
import { ProductCard, ProductType } from "@/entities/product";
import Pagination from "@/widgets/catalog/ui/pagination/Pagination";
import { useRouter } from "next/navigation";
import { SkeletonCard } from "@/shared/ui/skeleton";
import { ProductsListProps } from "../model/types";
import { DEFAULT_PAGE_SIZE } from "../lib/constants";

export function ProductsList({
  products,
  total,
  currentPage,
  pageSize = DEFAULT_PAGE_SIZE,
  hasActiveFilters,
  isLoading = false,
  categoryPath,
}: ProductsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Убеждаемся, что pageSize всегда имеет значение
  const effectivePageSize = pageSize || DEFAULT_PAGE_SIZE;

  // Кэш всех загруженных товаров для оптимистичного обновления при изменении pageSize
  const [cachedProducts, setCachedProducts] = useState<ProductType[]>(
    products || [],
  );
  const [isAttributesLoading, setIsAttributesLoading] = useState(false);
  const prevSortRef = useRef<string | null>(null);
  const prevPageSizeRef = useRef<number | null>(null);

  // Получаем текущие параметры
  const currentSort = searchParams.get("sort");
  const currentPageSize = parseInt(
    searchParams.get("pageSize") || String(effectivePageSize),
  );

  // Обновляем кэш при получении новых товаров (для оптимистичного pageSize)
  useEffect(() => {
    if (products && products.length > 0) {
      setCachedProducts(products);
    } else if (products && products.length === 0) {
      // Очищаем кэш при пустом результате (смена фильтров), чтобы не показывать старые данные
      setCachedProducts([]);
    }
  }, [products]);

  // Отслеживаем изменение сортировки для показа placeholder характеристик
  useEffect(() => {
    if (prevSortRef.current !== null && prevSortRef.current !== currentSort) {
      // Сортировка изменилась - показываем placeholder
      setIsAttributesLoading(true);
    }
    prevSortRef.current = currentSort;
  }, [currentSort]);

  // Скрываем placeholder после загрузки новых данных
  useEffect(() => {
    if (isAttributesLoading && !isLoading && products && products.length > 0) {
      const timer = setTimeout(() => {
        setIsAttributesLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAttributesLoading, isLoading, products]);

  // Для оптимистичного обновления при изменении pageSize:
  // Если изменился только pageSize (не сортировка), используем кэшированные товары
  const pageSizeChanged =
    prevPageSizeRef.current !== null &&
    prevPageSizeRef.current !== currentPageSize;
  const onlyPageSizeChanged =
    pageSizeChanged && prevSortRef.current === currentSort;

  // Обновляем prevPageSizeRef
  useEffect(() => {
    prevPageSizeRef.current = currentPageSize;
  }, [currentPageSize]);

  // Для оптимистичного обновления: используем товары из кэша только при изменении pageSize
  const displayProducts = (() => {
    // Если изменился только pageSize и идет загрузка, используем кэшированные товары
    if (onlyPageSizeChanged && cachedProducts.length > 0) {
      return cachedProducts.slice(0, currentPageSize);
    }
    // Всегда используем актуальные товары с сервера (включая пустой массив при 0 результатов)
    // Не показываем кэш при смене фильтров — иначе отображались бы старые товары при total=0
    return products ?? [];
  })();

  // Рассчитываем общее количество страниц
  const totalPages = total > 0 ? Math.ceil(total / effectivePageSize) : 1;

  // Нормализуем currentPage - должен быть в диапазоне [1, totalPages]
  const normalizedCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  // Проверяем, что текущая страница валидна
  // Если невалидна - перенаправляем на правильную страницу
  useEffect(() => {
    if (
      !isLoading &&
      (currentPage < 1 || currentPage > totalPages) &&
      totalPages > 0
    ) {
      const currentUrl = new URL(window.location.href);
      const targetPage = currentPage < 1 ? 1 : totalPages;
      currentUrl.searchParams.set("page", String(targetPage));
      router.replace(currentUrl.pathname + currentUrl.search);
    }
  }, [currentPage, totalPages, router, isLoading]);

  const handlePageChange = (page: number) => {
    if (typeof window === "undefined") {
      return;
    }
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("page", String(page));
    router.push(currentUrl.pathname + currentUrl.search);
  };

  // Определяем, нужно ли показывать placeholder для характеристик
  // Показываем при загрузке, если изменилась сортировка
  const showAttributesPlaceholder = isAttributesLoading;

  return (
    <div className={styles.wrapper}>
      <div className={styles.productsGrid}>
        {isLoading && displayProducts.length === 0 ? (
          // Показываем скелетоны при загрузке, если нет кэшированных товаров
          Array.from({ length: currentPageSize }).map((_, i) => (
            <SkeletonCard key={i} aria-label="Загрузка товаров..." />
          ))
        ) : displayProducts && displayProducts.length > 0 ? (
          displayProducts.map((product: ProductType) => (
            <ProductCard
              product={product}
              key={product.documentId}
              categoryPath={categoryPath}
              isLoadingAttributes={showAttributesPlaceholder}
            />
          ))
        ) : (
          <p className={styles.empty}>
            {hasActiveFilters
              ? "Товары с указанными фильтрами не найдены! Попробуйте выбрать другие фильтры или сделать поиск по названию"
              : "Нет доступных продуктов."}
          </p>
        )}
      </div>

      {totalPages > 1 && !isLoading && (
        <div className={styles.paginationWrapper}>
          <Pagination
            total={totalPages}
            current={normalizedCurrentPage}
            onChange={handlePageChange}
            loading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
