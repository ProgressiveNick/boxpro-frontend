"use client";

import Link from "next/link";
import Image from "next/image";

import { ComparisonLink } from "@/features/comparison-link";
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
  const isCatalogOpen = activeUI === "catalog";
  const closeAll = useUIStore((s) => s.closeAll);

  const openReturnCallForm = useUIStore((s) => s.openReturnCallForm);
  const isSearchOpen = activeUI === "search";

  const isScrolled = useUIStore((s) => s.scrollPastThreshold);

  const handleCatalogClick = () => {
    if (isCatalogOpen) closeAll();
    else openCatalog();
  };

  return (
    <>
      <header className={styles.wrapper}>
        <div
          className={`${styles.topPanel} ${styles.container}${isScrolled ? ` ${styles.topPanelHidden}` : ""}`}
        >
          <div className={styles.locationAndCurrency}>
            <LocationSelector />
            <CurrencyRates />
          </div>
          <div className={styles.topPanelRight}>
            <p className={styles.link}> Пн-пт: 10:00 - 20:00 </p>
            <span>|</span>
            <Link
              href="mailto:mail@boxpro.moscow"
              className={`${styles.link} ${styles.mailLink}`}
            >
              <Image
                src="/icons/mail.svg"
                alt=""
                width={18}
                height={18}
                className={styles.phoneIcon}
              />
              mail@boxpro.moscow
            </Link>
            <span>|</span>
            <Link href="/about" className={styles.link}>
              О компании
            </Link>
            <Link href="/requisites" className={styles.link}>
              Реквизиты
            </Link>
            <Link href="/contacts" className={styles.link}>
              Контакты
            </Link>
          </div>
        </div>
        <div className={styles.container}>
          <Logo className={styles.logo} />

          <div
            data-ui-trigger="catalog"
            className={styles.catalogButtonWrapper}
          >
            <CatalogButton
              isOpen={isCatalogOpen}
              onClick={handleCatalogClick}
              className={`${styles.catalogButton} ${isSearchOpen ? styles.catalogButtonAboveSearch : ""}`}
            >
              {" "}
              <p>Каталог</p>
            </CatalogButton>
          </div>

          <div className={styles.searchWrapper}>
            <SearchInput />
          </div>

          <div className={styles.contactWrapper}>
            <div className={styles.contactRow}>
              <div className={styles.socialIcons}>
                <Link
                  href="https://max.ru/u/f9LHodD0cOJHpcYWXaRdKe81AlVNCBoq3RgSFAkQCYU82Uv-pCMrjfTxreo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIconBox}
                  aria-label="MAX"
                >
                  <Image
                    src="/icons/max.svg"
                    alt=""
                    width={20}
                    height={20}
                    className={styles.socialIconImg}
                  />
                </Link>
                <Link
                  href="https://t.me/mshvarc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIconBox}
                  aria-label="Telegram"
                >
                  <Image
                    src="/icons/telegram.svg"
                    alt=""
                    width={18}
                    height={18}
                    className={`${styles.socialIconImg} ${styles.socialIconImgTg}`}
                  />
                </Link>
              </div>
              <div className={styles.phoneBlock}>
                <Link
                  href="tel:+78004444753"
                  className={`${styles.socialIconBox} ${styles.phoneIconBox}`}
                  aria-label="Позвонить"
                >
                  <Image
                    src="/icons/Iconly/Bold/Calling.svg"
                    alt=""
                    width={18}
                    height={18}
                    className={styles.socialIconImg}
                  />
                </Link>
                <div className={styles.contactInfo}>
                  <Link href="tel:+78004444753" className={styles.phoneLink}>
                    <p className={styles.number}>{`8 (800) 444-47-53`}</p>
                  </Link>
                  <button
                    className={styles.returnCallButton}
                    onClick={openReturnCallForm}
                  >
                    Обратный звонок
                  </button>
                </div>
              </div>
              <div className={styles.actionsContainer}></div>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <ComparisonLink />
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
