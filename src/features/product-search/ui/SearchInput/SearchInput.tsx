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
  // На десктопе дропдаун виден по локальному состоянию (без открытия глобального «поиска»);
  // на мобильном — только когда открыт оверлей поиска (activeUI === "search").
  const [desktopDropdownVisible, setDesktopDropdownVisible] = useState(false);
  const showDropdown = isMobile
    ? isSearchOpen && (query.length >= 3 || products.length > 0)
    : desktopDropdownVisible && (query.length >= 3 || products.length > 0);

  // Единая функция полного сброса десктопного поиска (закрыть + обнулить)
  const closeAndResetDesktopSearch = useCallback(() => {
    setDesktopDropdownVisible(false);
    setQuery("");
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    setCurrentSearchQuery("");
  }, []);
  const closeAndResetDesktopSearchRef = useRef(closeAndResetDesktopSearch);
  closeAndResetDesktopSearchRef.current = closeAndResetDesktopSearch;

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
        if (isMobile) openSearch();
        else setDesktopDropdownVisible(true);
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
    [isMobile, openSearch, pageSize],
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
      if (isMobile) openSearch();
      else setDesktopDropdownVisible(true);
      if (query !== currentSearchQuery) {
        setIsLoading(true);
      }
    } else if (!isMobile) {
      setDesktopDropdownVisible(false);
    }
    debouncedSearch(query);
  }, [query, debouncedSearch, currentSearchQuery, isMobile, openSearch]);

  // Ref для актуального состояния дропдауна (для обработчика из замыкания)
  const desktopDropdownVisibleRef = useRef(desktopDropdownVisible);
  desktopDropdownVisibleRef.current = desktopDropdownVisible;

  // Десктоп: сворачивать и обнулять поиск при открытии меню, модалок
  useEffect(() => {
    if (isMobile) return;
    if (activeUI !== null && activeUI !== "search") {
      closeAndResetDesktopSearch();
    }
  }, [activeUI, isMobile, closeAndResetDesktopSearch]);

  // Десктоп: подписка на store — при открытии другого UI закрывать и обнулять поиск
  const prevActiveUIRef = useRef<typeof activeUI>(activeUI);
  useEffect(() => {
    if (isMobile) return;
    prevActiveUIRef.current = activeUI;
  }, [activeUI, isMobile]);
  useEffect(() => {
    if (isMobile) return;
    const unsub = useUIStore.subscribe(() => {
      const current = useUIStore.getState().activeUI;
      const prev = prevActiveUIRef.current;
      prevActiveUIRef.current = current;
      if (prev !== current && current !== null && current !== "search") {
        closeAndResetDesktopSearchRef.current();
      }
    });
    return unsub;
  }, [isMobile]);

  // Десктоп: клик вне — всегда вешаем слушатель, внутри проверяем по ref
  useEffect(() => {
    if (isMobile) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!desktopDropdownVisibleRef.current) return;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const target = e.target as Node;
      if (!wrapper.contains(target)) {
        closeAndResetDesktopSearchRef.current();
      }
    };
    document.addEventListener("mousedown", handleMouseDown, true);
    return () => document.removeEventListener("mousedown", handleMouseDown, true);
  }, [isMobile]);

  useEffect(() => {
    function handleScroll() {
      if (isMobile && activeUI !== "search") return;
      if (isMobile) {
        closeAll();
        setQuery("");
        setProducts([]);
        setCurrentPage(1);
        setHasMore(true);
        setCurrentSearchQuery("");
      } else {
        closeAndResetDesktopSearch();
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeUI, closeAll, isMobile, closeAndResetDesktopSearch]);

  const handleClear = useCallback(() => {
    setQuery("");
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    setCurrentSearchQuery("");
    if (isMobile) closeAll();
    else setDesktopDropdownVisible(false);
  }, [closeAll, isMobile]);

  const handleCloseDropdown = useCallback(() => {
    if (isMobile && onClose) onClose();
    else closeAndResetDesktopSearch();
  }, [isMobile, onClose, closeAndResetDesktopSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
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
        onFocus={isMobile ? undefined : () => setDesktopDropdownVisible(true)}
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
      data-ui-surface={
        isMobile && isSearchOpen ? "search" : undefined
      }
    >
      {isMobile ? (
        <div className={styles.containerMobile}>{inputEl}</div>
      ) : (
        inputEl
      )}
      {showDropdown && (
        <SearchDropdown
          products={products}
          onClose={handleCloseDropdown}
          onLoadMore={handleLoadMore}
          isLoading={isLoading}
          hasMore={hasMore}
        />
      )}
    </div>
  );
}
