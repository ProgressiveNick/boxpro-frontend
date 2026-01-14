import styles from "./ProductPage.module.scss";
import { SkeletonCard, SkeletonText, SkeletonImage } from "@/shared/ui/skeleton";

export default function Loading() {
  return (
    <div className={styles.container}>
      {/* Скелетон Breadcrumbs */}
      <div className={styles.breadcrumbsSkeleton}>
        <div className={styles.skeletonBreadcrumb} />
        <div className={styles.skeletonBreadcrumb} />
        <div className={styles.skeletonBreadcrumb} />
      </div>

      <div className={styles.wrapper}>
        <div className={styles.productCardFull}>
          {/* Скелетон заголовка товара */}
          <div className={styles.productCardTop}>
            <div className={styles.productCardTopLeft}>
              <div className={styles.skeletonProductTitle} />
            </div>
            <div className={styles.productCardTopRight}>
              <SkeletonImage
                className={styles.skeletonLogo}
                width="110px"
                height="47px"
              />
            </div>
          </div>

          {/* Скелетон ProductCardBuy */}
          <div className={styles.productCardBuySkeleton}>
            {/* Скелетон галереи изображений */}
            <div className={styles.imagesSkeleton}>
              <div className={styles.gallerySliderSkeleton}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonImage
                    key={i}
                    className={styles.thumbnailSkeleton}
                    width="80px"
                    height="80px"
                  />
                ))}
              </div>
              <SkeletonImage
                className={styles.mainImageSkeleton}
                width="100%"
                height="480px"
              />
            </div>

            {/* Скелетон информации о товаре */}
            <div className={styles.productInfoSkeleton}>
              {/* Скелетон основных характеристик */}
              <div className={styles.productBuyWrapperMainSkeleton}>
                <div className={styles.productMainCharacteristicsWrapperSkeleton}>
                  <div className={styles.characteristicsColumnSkeleton}>
                    <SkeletonText lines={3} height="16px" />
                    <div className={styles.skeletonViewAllLink} />
                  </div>
                  <div className={styles.skeletonProductArticle} />
                </div>

                {/* Скелетон табов */}
                <div className={styles.productTabsSkeleton}>
                  <div className={styles.skeletonTab} />
                  <div className={styles.skeletonTab} />
                  <div className={styles.skeletonTab} />
                </div>

                {/* Скелетон цены и кнопок */}
                <div className={styles.productBuyWrapperSkeleton}>
                  <div className={styles.skeletonPrice} />
                  <div className={styles.actionsRowSkeleton}>
                    <div className={styles.skeletonButton} />
                    <div className={styles.actionsRowMobileSkeleton}>
                      <div className={styles.skeletonButton} />
                      <div className={styles.actionButtonsSkeleton}>
                        <div className={styles.skeletonIconButton} />
                        <div className={styles.skeletonIconButton} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Скелетон карточек информации */}
                <div className={styles.infoCardsWrapperSkeleton}>
                  <div className={styles.skeletonInfoCard} />
                  <div className={styles.skeletonInfoCard} />
                </div>

                {/* Скелетон дополнительных карточек */}
                <div className={styles.skeletonProductInfoCards} />
              </div>
            </div>
          </div>

          {/* Скелетон ProductInfoBlock */}
          <div className={styles.productInfoBlockSkeleton}>
            <div className={styles.productInfoHeadSkeleton}>
              <div className={styles.skeletonInfoTab} />
              <div className={styles.skeletonInfoTab} />
              <div className={styles.skeletonInfoTab} />
              <div className={styles.skeletonInfoTab} />
            </div>
            <div className={styles.productInfoContentSkeleton}>
              <SkeletonText lines={5} height="16px" />
            </div>
          </div>

          {/* Скелетон ProductReviewsBlock */}
          <div className={styles.productReviewsBlockSkeleton}>
            <div className={styles.tabsHeadSkeleton}>
              <div className={styles.skeletonReviewTab} />
              <div className={styles.skeletonReviewTab} />
            </div>
            <div className={styles.reviewsContentSkeleton}>
              <div className={styles.summaryCardSkeleton}>
                <div className={styles.summaryRatingSkeleton} />
                <div className={styles.summaryProgressSkeleton} />
              </div>
              <div className={styles.reviewsListSkeleton}>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className={styles.reviewCardSkeleton}>
                    <div className={styles.reviewHeaderSkeleton} />
                    <SkeletonText lines={3} height="14px" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Скелетон "Аналоги" */}
          <div className={styles.productInfo}>
            <div className={styles.skeletonSectionTitle} />
            <div className={styles.productInfoSubWrapper}>
              <div className={styles.relatedProductsSkeleton}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} width="250px" />
                ))}
              </div>
            </div>
          </div>

          {/* Скелетон RecentlyViewedSlider */}
          <div className={styles.recentlyViewedSkeleton}>
            <div className={styles.recentlyViewedProductsSkeleton}>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} width="250px" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
