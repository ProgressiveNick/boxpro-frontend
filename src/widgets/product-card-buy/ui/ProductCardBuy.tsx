"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import styles from "./ProductCardBuy.module.scss";

import { ProductType, Price } from "@/entities/product";
import { AddProductToCartButton } from "@/features/add-product-to-cart";
import { AddProductToFavoriteButton } from "@/features/add-product-to-favorite";
import { OrderOneClickButton } from "@/features/order-one-click";
import { ProductTabs } from "@/features/product-tabs/ui/ProductTabs";
import { getProductImageUrl } from "@/shared/lib/helpers/imageUrl";

import { getSku } from "@/entities/product/lib/getSku";

import { AvailabilityCard } from "./AvailabilityCard";
import { getAvailabilityCities } from "../lib/getAvailabilityCities";
import { DeliveryCard } from "./DeliveryCard";
import { ProductInfoCards } from "./ProductInfoCards";
import { ProductMainCharacteristics } from "./ProductMainCharacteristics";
import type { TabKey } from "../constants/tabs";

type ProductCardBuyProps = {
  product: ProductType;
};

export function ProductCardBuy(props: ProductCardBuyProps) {
  const { product } = props;

  const availableCities = getAvailabilityCities(product.harakteristici);
  const isInStock = availableCities.length > 0;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showCopyPopover, setShowCopyPopover] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopyPopover(true);
    } catch (err) {
      console.error("Ошибка копирования:", err);
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShowCopyPopover(true);
    }
  };

  const handleViewAllCharacteristics = (
    e: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    e.preventDefault();
    // Отправляем событие для переключения вкладки
    window.dispatchEvent(
      new CustomEvent("product-info:switch-tab", {
        detail: { tab: "characteristics" },
      }),
    );
    // Небольшая задержка для переключения вкладки, затем скролл
    setTimeout(() => {
      const element = document.getElementById("product-characteristics");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  useEffect(() => {
    if (showCopyPopover) {
      const timer = setTimeout(() => {
        setShowCopyPopover(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showCopyPopover]);

  return (
    <div className={styles.productCard}>
      <div className={styles.productGallery}>
        <div className={styles.gallerySlider}>
          {product.pathsImgs?.length > 0 &&
            product.pathsImgs.map((image, index) => {
              const isActive = index === selectedImageIndex;
              return (
                <div
                  className={`${styles.productMiniatureWrapper} ${
                    isActive ? styles.activeMiniature : ""
                  }`}
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    className={styles.productImgMiniature}
                    src={getProductImageUrl(image.path)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== "/img/products/empty.jpg") {
                        target.src = "/img/products/empty.jpg";
                      }
                    }}
                    alt={`Миниатюра товара ${index + 1}`}
                    width={80}
                    height={80}
                    unoptimized={getProductImageUrl(image.path).startsWith(
                      "/storage/",
                    )}
                  />
                </div>
              );
            })}
        </div>
        <Image
          className={styles.productImgMain}
          src={
            product?.pathsImgs?.[selectedImageIndex]?.path
              ? getProductImageUrl(product.pathsImgs[selectedImageIndex].path)
              : "/img/products/empty.jpg"
          }
          alt={product.name || "Изображение товара"}
          width={520}
          height={480}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== "/img/products/empty.jpg") {
              target.src = "/img/products/empty.jpg";
            }
          }}
          unoptimized={
            product?.pathsImgs?.[selectedImageIndex]?.path
              ? getProductImageUrl(
                  product.pathsImgs[selectedImageIndex].path,
                ).startsWith("/storage/")
              : false
          }
        />
      </div>

      <div className={styles.productCardActionsWrapper}>
        <div className={styles.productBuyWrapperMain}>
          <div className={styles.productMainCharacteristicsWrapper}>
            <div className={styles.characteristicsColumn}>
              <ProductMainCharacteristics
                characteristics={product.harakteristici}
              />
              <a
                className={styles.viewAllCharacteristics}
                href="#product-characteristics"
                onClick={handleViewAllCharacteristics}
              >
                Смотреть все
              </a>
            </div>
            <p className={styles.productArticle}>
              арт.: {getSku(product.harakteristici) || "—"}
            </p>
          </div>

          <div className={styles.productBuyWrapper}>
            <ProductTabs
              tabs={
                // Кнопку "Сравнить" временно скрываем до реализации
                // Скрываем таб отзывов, если у товара нет отзывов
                // Таб "Отличная надежность" закомментирован
                (() => {
                  const baseTabs: TabKey[] = ["questions"]; // "reliability" закомментирован
                  const reviews = product.reviews || [];
                  if (reviews.length > 0) {
                    baseTabs.unshift("reviews");
                  }
                  return baseTabs;
                })()
              }
              className={styles.productTabs}
              product={product}
            />
          </div>
          <div className={styles.productBuyWrapper}>
            <Price
              currentPrice={product.price || 125000}
              priceHistory={product.price_history}
              previousPrice={product.previousPrice}
            />

            <div className={styles.actionsRow}>
              <AddProductToCartButton
                product={product}
                className={styles.customAddToCart}
                isProductPage={true}
              />
              <div className={styles.actionsRowMobile}>
                {isInStock && (
                  <OrderOneClickButton
                    product={product}
                    className={styles.customOneClick}
                  />
                )}
                <div className={styles.actionButtons}>
                  <AddProductToFavoriteButton
                    product={product}
                    className={styles.customFavorite}
                  />
                  <button
                    className={styles.actionButton}
                    onClick={handleCopyLink}
                    type="button"
                    aria-label="Копировать ссылку"
                  />
                  {showCopyPopover && (
                    <div className={styles.copyPopover}>Ссылка скопирована</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.infoCardsWrapper}>
            <AvailabilityCard characteristics={product.harakteristici} />
            <DeliveryCard />
          </div>

          <ProductInfoCards />
        </div>

        <div className={styles.promoBannerWrapper}></div>
      </div>
    </div>
  );
}
