"use client";

import { useState, useEffect, useRef } from "react";
import { OpenFavoritesButton } from "@/widgets/favorites-button";
import { OpenCartButton } from "@/widgets/cart-button";
import { MobileSearchInput } from "./MobileSearchInput";
import styles from "./MobileBottomMenu.module.scss";

export function MobileBottomMenu() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isSearchOpen]);

  return (
    <>
      <div className={styles.mobileBottomMenu}>
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
                strokeWidth="2"
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
        <div className={styles.searchOverlay}>
          <div className={styles.searchContainer} ref={searchContainerRef}>
            <div className={styles.searchHeader}>
              <h3>Поиск товаров</h3>
              <button
                className={styles.closeButton}
                onClick={handleCloseSearch}
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
            <MobileSearchInput onClose={handleCloseSearch} />
          </div>
        </div>
      )}
    </>
  );
}
