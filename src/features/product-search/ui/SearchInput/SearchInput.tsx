"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./SearchInput.module.scss";
import { SearchDropdown } from "../SearchDropdown/SearchDropdown";
import { searchProducts } from "../../model/api";
import { useUIStore } from "@/shared/store/useUIStore";

import Image from "next/image";
import { useDebounce } from "@/shared/lib/hooks/useDebounce";
import { ProductType } from "@/entities/product";

type SearchInputProps = {
  variant?: "desktop" | "mobile";
  onClose?: () => void;
  pageSize?: number;
};

export function SearchInput({
  variant = "desktop",
  onClose,
  pageSize: pageSizeProp,
}: SearchInputProps = {}) {
  const activeUI = useUIStore((s) => s.activeUI);
  const openSearch = useUIStore((s) => s.openSearch);
  const closeAll = useUIStore((s) => s.closeAll);

  const pageSize = pageSizeProp ?? (variant === "mobile" ? 10 : 5);
  const isMobile = variant === "mobile";

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSearchOpen = activeUI === "search";
  const showDropdown =
    isSearchOpen && (query.length >= 3 || products.length > 0);

  const loadProducts = useCallback(
    async (searchQuery: string, page: number, isNewSearch: boolean = false) => {
      if (searchQuery.length < 3) return;

      setIsLoading(true);
      try {
        const response = await searchProducts({
          searchQuery,
          page,
          pageSize,
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
        openSearch();
      } catch (error) {
        console.error("Error searching products:", error);
        if (isNewSearch || page === 1) {
          setProducts([]);
          setHasMore(false);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [openSearch, pageSize],
  );

  const debouncedSearch = useDebounce((searchQuery: unknown) => {
    if (typeof searchQuery === "string") {
      if (searchQuery.length >= 3) {
        // Только если запрос изменился, делаем новый поиск
        if (searchQuery !== currentSearchQuery) {
          loadProducts(searchQuery, 1, true);
        } else {
          setIsLoading(false);
        }
      } else {
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
      openSearch();
      if (query !== currentSearchQuery) {
        setIsLoading(true);
      }
    }
    debouncedSearch(query);
  }, [query, debouncedSearch, currentSearchQuery, openSearch]);

  useEffect(() => {
    function handleScroll() {
      if (activeUI !== "search") return;
      closeAll();
      setQuery("");
      setProducts([]);
      setCurrentPage(1);
      setHasMore(true);
      setCurrentSearchQuery("");
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeUI, closeAll]);

  const handleClear = useCallback(() => {
    setQuery("");
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    setCurrentSearchQuery("");
    if (!isMobile) closeAll();
  }, [closeAll, isMobile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClose = () => {
    if (isMobile && onClose) onClose();
    else closeAll();
  };

  // Mobile: focus on mount and Escape to close
  useEffect(() => {
    if (!isMobile) return;
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, onClose]);

  const placeholder =
    variant === "mobile" ? "Введите название товара..." : "Поиск товаров...";

  const inputEl = (
    <>
      <input
        ref={inputRef}
        type="text"
        className={isMobile ? styles.inputMobile : styles.input}
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={!isMobile ? openSearch : undefined}
      />
      {query && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => {
            handleClear();
            if (isMobile && inputRef.current) inputRef.current.focus();
          }}
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
        {!isMobile && (
          <Image
            src="/icons/search.svg"
            width={20}
            height={20}
            alt=""
            className={styles.searchIcon}
          />
        )}
        {isMobile && (
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
        )}
    </>
  );

  return (
    <div
      className={
        isMobile
          ? styles.wrapperMobile
          : `${styles.wrapper} ${query ? styles.hasQuery : ""}`
      }
      ref={wrapperRef}
      data-ui-surface={isSearchOpen ? "search" : undefined}
    >
      {isMobile ? (
        <div className={styles.containerMobile}>{inputEl}</div>
      ) : (
        inputEl
      )}
      {showDropdown && (
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
