"use client";

import Link from "next/link";
import { useEffect } from "react";
import { OpenFavoritesButton } from "@/widgets/favorites-button";
import { OpenCartButton } from "@/widgets/cart-button";
import { SearchInput } from "@/features/product-search";
import { useUIStore } from "@/shared/store/useUIStore";
import styles from "./MobileBottomMenu.module.scss";

export function MobileBottomMenu() {
  const activeUI = useUIStore((s) => s.activeUI);
  const openSearch = useUIStore((s) => s.openSearch);
  const closeAll = useUIStore((s) => s.closeAll);

  const isSearchOpen = activeUI === "search";

  const handleSearchToggle = () => {
    if (isSearchOpen) closeAll();
    else openSearch();
  };

  useEffect(() => {
    if (!isSearchOpen) return;
    const scrollY = window.scrollY;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, scrollY);
    };
  }, [isSearchOpen]);

  return (
    <>
      <div className={styles.mobileBottomMenu}>
        <div className={styles.menuItem}>
          <Link
            href="/contacts"
            aria-label="Контакты"
            className={styles.contactsButton}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 16.92V20a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2 3.18 2 2 0 0 1 4 1h3.09a1 1 0 0 1 1 .75l1.21 5.05a1 1 0 0 1-.27.95L7.91 9.91a16 16 0 0 0 6.18 6.18l2.16-2.16a1 1 0 0 1 .95-.27l5.05 1.21a1 1 0 0 1 .75 1Z"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div className={styles.menuItem}>
          <OpenFavoritesButton />
        </div>

        <div className={styles.menuItem}>
          <button
            className={styles.searchButton}
            onClick={handleSearchToggle}
            aria-label="Поиск товаров"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.menuItem}>
          <OpenCartButton />
        </div>
      </div>

      {isSearchOpen && (
        <div
          className={styles.searchOverlay}
          data-ui-surface="search"
        >
          <div className={styles.searchContainer}>
            <div className={styles.searchHeader}>
              <h3>Поиск товаров</h3>
              <button
                className={styles.closeButton}
                onClick={closeAll}
                aria-label="Закрыть поиск"
              >
                <svg
                  width="24"
                  height="24"
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
            </div>
            <SearchInput variant="mobile" onClose={closeAll} />
          </div>
        </div>
      )}
    </>
  );
}
