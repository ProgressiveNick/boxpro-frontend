"use client";

import Link from "next/link";

import "swiper/css/pagination";
import "swiper/scss";
import "swiper/scss/navigation";

import { CurrencyRates } from "@/features/currency-rates";
import { SearchInput } from "@/features/product-search";
import { LocationSelector } from "@/features/location-selector";
import { CatalogButton } from "@/shared/ui";
import Logo from "@/shared/ui/logo/Logo";
import { OpenCartButton } from "@/widgets/cart-button";
import { TabMenu } from "@/widgets/client-widgets";
import { useUIStore } from "@/shared/store/useUIStore";
import { OpenFavoritesButton } from "@/widgets/favorites-button";
import { ReturnCallFormModal } from "@/widgets/return-call-form";
import styles from "./Header.module.scss";

export function Header() {
  const activeUI = useUIStore((s) => s.activeUI);
  const openCatalog = useUIStore((s) => s.openCatalog);
  const closeAll = useUIStore((s) => s.closeAll);
  const openReturnCallForm = useUIStore((s) => s.openReturnCallForm);

  const isCatalogOpen = activeUI === "catalog";
  const isSearchOpen = activeUI === "search";

  const handleCatalogClick = () => {
    if (isCatalogOpen) closeAll();
    else openCatalog();
  };

  return (
    <>
      <header className={styles.wrapper}>
        <div className={styles.container}>
          <Logo className={styles.logo} />

          <div className={styles.locationAndCurrency}>
            <CurrencyRates />
            <LocationSelector />
          </div>
          <div
            data-ui-trigger="catalog"
            className={styles.catalogButtonWrapper}
          >
            <CatalogButton
              isOpen={isCatalogOpen}
              onClick={handleCatalogClick}
              className={`${styles.catalogButton} ${isSearchOpen ? styles.catalogButtonAboveSearch : ""}`}
            />
          </div>
          <div className={styles.searchWrapper}>
            <SearchInput />
          </div>

          <div className={styles.contactWrapper}>
            <div className={styles.contactRow}>
              <div className={styles.contactInfo}>
                <Link href="tel:+78004444753">
                  <p className={styles.number}>{`8 (800) 444-47-53`}</p>
                </Link>
              </div>
              <div className={styles.actionsContainer}>
                <button className={styles.returnCallButton} onClick={openReturnCallForm}>
                  Обратный звонок
                </button>
              </div>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <OpenFavoritesButton />
            <OpenCartButton />
          </div>
        </div>
      </header>
      <TabMenu />
      <ReturnCallFormModal />
    </>
  );
}
