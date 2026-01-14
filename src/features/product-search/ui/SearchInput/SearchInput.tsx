"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./SearchInput.module.scss";
import { SearchDropdown } from "../SearchDropdown/SearchDropdown";
import { searchProducts } from "../../model/api";

import Image from "next/image";
import { useDebounce } from "@/shared/lib/hooks/useDebounce";
import { ProductType } from "@/entities/product";

export function SearchInput() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const loadProducts = useCallback(
    async (searchQuery: string, page: number, isNewSearch: boolean = false) => {
      if (searchQuery.length < 3) return;

      setIsLoading(true);
      try {
        const response = await searchProducts({
          searchQuery,
          page,
          pageSize: 5,
        });

        if (isNewSearch || page === 1) {
          // Новый поиск или первая страница - заменяем все товары
          setProducts(response.data);
          setCurrentPage(1);
          setCurrentSearchQuery(searchQuery);
        } else {
          // Последующие страницы - добавляем только новые товары
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.documentId));
            const newProducts = response.data.filter(
              (p) => !existingIds.has(p.documentId)
            );
            return [...prev, ...newProducts];
          });
        }

        setHasMore(page < response.meta.pagination.pageCount);
        setIsDropdownVisible(true);
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
    []
  );

  const debouncedSearch = useDebounce((searchQuery: unknown) => {
    if (typeof searchQuery === "string") {
      if (searchQuery.length >= 3) {
        // Только если запрос изменился, делаем новый поиск
        if (searchQuery !== currentSearchQuery) {
          loadProducts(searchQuery, 1, true);
        }
      } else {
        // Если запрос слишком короткий, скрываем дропдаун
        setIsDropdownVisible(false);
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

  // Добавляем отладочную информацию
  useEffect(() => {
    console.log(
      "Debug - hasMore:",
      hasMore,
      "currentPage:",
      currentPage,
      "products.length:",
      products.length
    );
  }, [hasMore, currentPage, products.length]);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClose = () => {
    setIsDropdownVisible(false);
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <input
        type="text"
        className={styles.input}
        placeholder="Поиск товаров..."
        value={query}
        onChange={handleInputChange}
      />
      <Image
        src="/icons/search.svg"
        width={20}
        height={20}
        alt=""
        className={styles.searchIcon}
      />
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
