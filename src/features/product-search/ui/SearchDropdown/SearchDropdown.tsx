"use client";

import styles from "./SearchDropdown.module.scss";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { ProductType } from "@/entities/product";
import { getProductImageUrl } from "@/shared/lib/helpers/imageUrl";
import { stripHtml } from "@/shared/lib/helpers/stripHtml";

/** Разбивает текст на сегменты: совпадения с запросом и остальной текст (для подсветки) */
function getHighlightSegments(
  text: string,
  query: string,
): Array<{ text: string; match: boolean }> {
  const q = query.trim();
  if (!q) return [{ text, match: false }];
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const segments: Array<{ text: string; match: boolean }> = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, m.index),
        match: false,
      });
    }
    segments.push({ text: m[0], match: true });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), match: false });
  }
  return segments.length ? segments : [{ text, match: false }];
}

interface SearchDropdownProps {
  products: ProductType[];
  query?: string;
  onClose: () => void;
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
}

export function SearchDropdown({
  products,
  query = "",
  onClose,
  onLoadMore,
  isLoading,
  hasMore,
}: SearchDropdownProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useRef<HTMLDivElement | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Дедупликация товаров по documentId
  const uniqueProducts = useMemo(() => {
    const seen = new Set<string>();
    return products.filter((product) => {
      if (seen.has(product.documentId)) {
        return false;
      }
      seen.add(product.documentId);
      return true;
    });
  }, [products]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore],
  );

  // Создаем и настраиваем observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const options = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver(handleObserver, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  // Подключаем observer к последнему элементу
  useEffect(() => {
    const currentLastProduct = lastProductRef.current;
    if (observerRef.current && currentLastProduct && hasMore && !isLoading) {
      observerRef.current.observe(currentLastProduct);
    }

    return () => {
      if (observerRef.current && currentLastProduct) {
        observerRef.current.unobserve(currentLastProduct);
      }
    };
  }, [uniqueProducts, hasMore, isLoading]);

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => new Set(prev).add(productId));
  };

  const getImageSrc = (product: ProductType): string => {
    if (imageErrors.has(product.documentId)) {
      return "/img/products/empty.jpg";
    }

    if (product.pathsImgs && product.pathsImgs.length > 0) {
      const imagePath = product.pathsImgs[0];
      if (typeof imagePath === "object" && imagePath.path) {
        return getProductImageUrl(imagePath.path);
      }
    }

    return "/img/products/empty.jpg";
  };

  // Скрываем только когда нет ни загрузки, ни товаров, ни ожидания первого поиска
  const showNoResults = uniqueProducts.length === 0 && !isLoading;

  return (
    <div className={styles.dropdown}>
      {uniqueProducts.map((product, index) => {
        const imageSrc = getImageSrc(product);
        const isLastElement = index === uniqueProducts.length - 1;

        return (
          <Link
            href={`/product/${product.slug}`}
            key={`${product.documentId}-${index}`}
            onClick={onClose}
          >
            <div
              className={styles.item}
              ref={isLastElement ? lastProductRef : null}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  sizes="60px"
                  style={{ objectFit: "cover" }}
                  onError={() => handleImageError(product.documentId)}
                  priority={index < 3}
                />
              </div>
              <div className={styles.content}>
                <h3 className={styles.title}>
                  {getHighlightSegments(product.name, query).map((seg, i) =>
                    seg.match ? (
                      <mark key={i} className={styles.highlight}>
                        {seg.text}
                      </mark>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    ),
                  )}
                </h3>
                <p className={styles.description}>
                  {getHighlightSegments(
                    stripHtml(product.description) || "Описание отсутствует",
                    query,
                  ).map((seg, i) =>
                    seg.match ? (
                      <mark key={i} className={styles.highlight}>
                        {seg.text}
                      </mark>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    ),
                  )}
                </p>
                <div className={styles.meta}>
                  <span className={styles.price}>
                    {product.price.toLocaleString()} ₽
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}

      {isLoading && (
        <div className={styles.loader}>
          <div className={styles.loaderSpinner}></div>
          Загрузка...
        </div>
      )}

      {!hasMore && uniqueProducts.length > 0 && (
        <div className={styles.noMore}>Больше товаров не найдено</div>
      )}

      {showNoResults && <div className={styles.noMore}>Ничего не найдено</div>}
    </div>
  );
}
