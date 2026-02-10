"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SearchDropdown } from "@/features/product-search/ui/SearchDropdown/SearchDropdown";
import { searchProducts } from "@/features/product-search/model/api";
import { useDebounce } from "@/shared/lib/hooks/useDebounce";
import { ProductType } from "@/entities/product";
import styles from "./MobileBottomMenu.module.scss";

type MobileSearchInputProps = {
  onClose?: () => void;
};

export function MobileSearchInput({ onClose }: MobileSearchInputProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(
    async (searchQuery: string, page: number, isNewSearch: boolean = false) => {
      if (searchQuery.length < 3) {
        setProducts([]);
        setIsDropdownVisible(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await searchProducts({
          searchQuery,
          page,
          pageSize: 10,
        });

        if (isNewSearch || page === 1) {
          setProducts(response.data);
          setCurrentPage(1);
          setCurrentSearchQuery(searchQuery);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.documentId));
            const newProducts = response.data.filter(
              (p) => !existingIds.has(p.documentId),
            );
            return [...prev, ...newProducts];
          });
        }

        setHasMore(page < response.meta.pagination.pageCount);
        setIsDropdownVisible(true);
      } catch (error) {
        console.error("Error searching products:", error);
        if (page === 1) {
          setProducts([]);
          setHasMore(false);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const debouncedSearch = useDebounce((searchQuery: unknown) => {
    if (typeof searchQuery === "string") {
      if (searchQuery.length >= 3) {
        // Только если запрос изменился — делаем новый поиск (не перезаписываем при load more)
        if (searchQuery !== currentSearchQuery) {
          loadProducts(searchQuery, 1, true);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsDropdownVisible(false);
        setIsLoading(false);
        setProducts([]);
        setCurrentPage(1);
        setHasMore(true);
        setCurrentSearchQuery("");
      }
    }
  }, 300);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore && currentSearchQuery.length >= 3) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadProducts(currentSearchQuery, nextPage, false);
    }
  }, [isLoading, hasMore, currentPage, currentSearchQuery, loadProducts]);

  useEffect(() => {
    if (query.length >= 3) {
      setIsDropdownVisible(true);
      // loading только при ожидании нового поиска (не перезаписываем после получения результатов)
      if (query !== currentSearchQuery) {
        setIsLoading(true);
      }
    }
    debouncedSearch(query);
  }, [query, debouncedSearch, currentSearchQuery]);

  // Фокус на поле ввода при открытии и обработка Escape
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (onClose) {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClose = () => {
    setIsDropdownVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const handleClear = () => {
    setQuery("");
    setProducts([]);
    setIsDropdownVisible(false);
    setCurrentPage(1);
    setHasMore(true);
    setCurrentSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={styles.mobileSearchWrapper} ref={wrapperRef}>
      <div className={styles.mobileSearchInputContainer}>
        <input
          ref={inputRef}
          type="text"
          className={styles.mobileSearchInput}
          placeholder="Введите название товара..."
          value={query}
          onChange={handleInputChange}
        />
        {query && (
          <button
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Очистить поиск"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <div className={styles.searchIcon}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {isDropdownVisible && (
        <SearchDropdown
          products={products}
          onClose={handleClose}
          onLoadMore={handleLoadMore}
          isLoading={isLoading}
          hasMore={hasMore}
        />
      )}
    </div>
  );
}
