"use client";

import Image from "next/image";
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
import { useCatalogMenuStore } from "@/widgets/catalog-menu/model";
import { OpenFavoritesButton } from "@/widgets/favorites-button";
import {
  ReturnCallFormModal,
  useReturnCallFormStore,
} from "@/widgets/return-call-form";
import styles from "./Header.module.scss";

export function Header() {
  const { isOpen, toggle, isSearchOpen } = useCatalogMenuStore();
  const { openForm } = useReturnCallFormStore();

  return (
    <>
      <header className={styles.wrapper}>
        <div className={styles.container}>
          <Logo className={styles.logo} />

          <div className={styles.locationAndCurrency}>
            <CurrencyRates />
            <LocationSelector />
          </div>
          <CatalogButton
            isOpen={isOpen}
            onClick={toggle}
            className={`${styles.catalogButton} ${isSearchOpen ? styles.catalogButtonAboveSearch : ""}`}
          />
          <div className={styles.searchWrapper}>
            <SearchInput />
          </div>

          <div className={styles.rightPanel}>
            <OpenFavoritesButton />
            <OpenCartButton />
          </div>

          <div className={styles.contactWrapper}>
            <div className={styles.contactRow}>
              <div className={styles.contactInfo}>
                <Link href="tel:+78004444753">
                  <p className={styles.number}>8(800)444-47-53</p>
                </Link>
                <p className={styles.jobTime}>Пн-пт: 10:00 — 20:00</p>
              </div>
              <div className={styles.actionsContainer}>
                <button className={styles.returnCallButton} onClick={openForm}>
                  Обратный звонок
                </button>
                <div className={styles.socialIcons}>
                  <Link
                    href="https://t.me/boxpro_moscow"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIcon}
                    aria-label="Telegram"
                  >
                    <Image
                      src="/icons/Telegram_black.svg"
                      alt="Telegram"
                      width={20}
                      height={20}
                    />
                  </Link>
                  <Link
                    href="https://wa.me/79265198808"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialIcon}
                    aria-label="WhatsApp"
                  >
                    <Image
                      src="/icons/WhatsApp_black.svg"
                      alt="WhatsApp"
                      width={20}
                      height={20}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <TabMenu />
      <ReturnCallFormModal />
    </>
  );
}
