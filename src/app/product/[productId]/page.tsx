import styles from "./ProductPage.module.scss";
import React from "react";
import Link from "next/link";
import breadcrumbStyles from "@/widgets/breadcrumbs/ui/Breadcrumbs.module.scss";

import {
  Breadcrumbs,
  ProductCardBuy,
  ProductInfoBlock,
  ProductReviewsBlock,
} from "@/widgets/client-widgets";

import {
  getProducts,
  getProductsBySlug,
  getAllProductSlugs,
} from "@/entities/product/api/server";
import { ProductsSlider } from "@/features/product-slider";
import { getSku } from "@/entities/product/lib/getSku";
import type { Metadata } from "next";
import { generateSEO, generateProductSEO } from "@/shared/lib/seo-utils";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/shared/components/JsonLd/JsonLd";
import { AvailabilityStatusTab } from "@/widgets/product-card-buy/ui/AvailabilityStatusTab";
import Image from "next/image";
import { ProductViewTracker } from "@/widgets/product-view-tracker";
import { RecentlyViewedSlider } from "@/features/recently-viewed-slider";
import { getAvailabilityCities } from "@/widgets/product-card-buy/lib/getAvailabilityCities";
import { getCatalogMenu } from "@/entities/categories/api/getCatalogMenu";
import { CategoryTree } from "@/entities/categories/lib/CategoryTree";

// ISR: ревалидация каждые 60 минут (3600 секунд)
export const revalidate = 3600;

type Params = Promise<{ productId: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * Генерирует статические параметры для всех товаров
 * Используется для предварительной генерации популярных страниц товаров
 */
export async function generateStaticParams() {
  try {
    // Получаем все slugs товаров
    const slugs = await getAllProductSlugs();
    
    // Ограничиваем количество для build time (можно увеличить при необходимости)
    // Для популярных товаров генерируем первые 500
    const popularSlugs = slugs.slice(0, 500);
    
    return popularSlugs.map((slug) => ({
      productId: slug,
    }));
  } catch (error) {
    console.error("[generateStaticParams] Error fetching product slugs:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { productId } = await params;

  try {
    const product = await getProductsBySlug(productId);
    const sku = getSku(product.harakteristici);

    return generateSEO({
      ...generateProductSEO(
        product.name,
        product.description || undefined,
        sku,
        product.price
      ),
      canonical: `/product/${productId}`, // Основной canonical URL для продукта
    });
  } catch {
    return generateSEO({
      title: "Товар не найден | BoxPro",
      description: "Запрашиваемый товар не найден в каталоге BoxPro.",
      noIndex: true,
    });
  }
}

export default async function ProductPage({ 
  params,
  searchParams,
}: { 
  params: Params;
  searchParams: SearchParams;
}) {
  const { productId } = await params;
  const search = await searchParams;
  
  // Получаем categoryPath из query параметров
  const categoryPathParam = search.categoryPath;
  const categoryPath = typeof categoryPathParam === "string" 
    ? categoryPathParam.split("/").filter(Boolean)
    : [];

  const data = await getProductsBySlug(productId);
  const seeMoreProducts = await getProducts({
    filters: { categories: [] },
    kategoria: data.kategoria.slug,
  });

  const sku = getSku(data.harakteristici);
  const availabilityCities = getAvailabilityCities(data.harakteristici);
  const warehousesCount = availabilityCities.length;

  // Если передан categoryPath, формируем breadcrumbs с учетом категорий
  let breadcrumbOverrides: Record<string, string> = {};
  let breadcrumbItems: Array<{ position: number; name: string; item: string }> = [];
  
  if (categoryPath.length > 0) {
    const menuData = await getCatalogMenu();
    const tree = new CategoryTree(menuData);
    breadcrumbOverrides = tree.getBreadcrumbOverrides(categoryPath);
    
    // Формируем breadcrumbs для JSON-LD
    const baseUrl = "https://boxpro.moscow";
    breadcrumbItems = [
      {
        position: 1,
        name: "Главная",
        item: baseUrl,
      },
      {
        position: 2,
        name: "Каталог",
        item: `${baseUrl}/catalog`,
      },
    ];

    // Добавляем категории из пути
    categoryPath.forEach((slug, index) => {
      const categoryName = breadcrumbOverrides[slug] || slug;
      const categoryPathStr = categoryPath.slice(0, index + 1).join("/");
      breadcrumbItems.push({
        position: index + 3,
        name: categoryName,
        item: `${baseUrl}/catalog/${categoryPathStr}`,
      });
    });

    // Добавляем продукт
    breadcrumbItems.push({
      position: breadcrumbItems.length + 1,
      name: data.name,
      item: `${baseUrl}/product/${productId}`,
    });
  }

  return (
    <>
      <ProductJsonLd
        product={{
          name: data.name,
          description: data.description || undefined,
          sku,
          price: data.price,
          category: data.kategoria?.name,
          image: data.pathsImgs?.[0]?.path,
          url: `https://boxpro.moscow/product/${productId}`, // Основной URL продукта
        }}
      />
      {breadcrumbItems.length > 0 && (
        <BreadcrumbJsonLd
          breadcrumbs={{
            itemListElement: breadcrumbItems.map((item) => ({
              "@type": "ListItem",
              position: item.position,
              name: item.name,
              item: item.item,
            })),
          }}
        />
      )}

      <div className={styles.container}>
        {categoryPath.length > 0 ? (
          // Кастомные breadcrumbs с категориями
          <div className={breadcrumbStyles.container}>
            <div className={breadcrumbStyles.wrapper}>
              <nav aria-label="breadcrumb" className={breadcrumbStyles.nav}>
                <ol className={breadcrumbStyles.breadcrumbs}>
                  <li className={breadcrumbStyles.item}>
                    <Link href="/" className={breadcrumbStyles.link}>
                      Главная
                    </Link>
                  </li>
                  <li className={breadcrumbStyles.item}>
                    <span className={breadcrumbStyles.separator}> / </span>
                    <Link href="/catalog" className={breadcrumbStyles.link}>
                      Каталог
                    </Link>
                  </li>
                  {categoryPath.map((slug, index) => {
                    const categoryName = breadcrumbOverrides[slug] || slug.replace(/-/g, " ");
                    const categoryPathStr = categoryPath.slice(0, index + 1).join("/");
                    return (
                      <li key={slug} className={breadcrumbStyles.item}>
                        <span className={breadcrumbStyles.separator}> / </span>
                        <Link 
                          href={`/catalog/${categoryPathStr}`}
                          className={breadcrumbStyles.link}
                        >
                          {categoryName}
                        </Link>
                      </li>
                    );
                  })}
                  <li className={breadcrumbStyles.item}>
                    <span className={breadcrumbStyles.separator}> / </span>
                    <span className={breadcrumbStyles.active}>
                      {data.name}
                    </span>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        ) : (
          <Breadcrumbs name={data.name} />
        )}
        <ProductViewTracker product={data} />
        <div className={styles.wrapper}>
          <div className={styles.productCardFull}>
            <div className={styles.productCardTop}>
              <div className={styles.productCardTopLeft}>
                <h1 className={styles.productTitle}>
                  {data.name}
                  <span className={styles.productTitleTabs}>
                    {/* <PromoTab /> */}
                    <AvailabilityStatusTab
                      warehousesCount={warehousesCount}
                    />
                  </span>
                </h1>
              </div>
              <div className={styles.productCardTopRight}>
                <Image
                  src="/img/logoHM.svg"
                  alt="BoxPro Logo"
                  width={320}
                  height={137}
                  className={styles.productLogo}
                />
              </div>
            </div>

            <ProductCardBuy product={data} />
            <ProductInfoBlock product={data} />
            <ProductReviewsBlock product={data} />

            <div className={styles.productInfo}>
              <h3 className={styles.productInfoTitle}>Аналоги</h3>
              <div className={styles.productInfoSubWrapper}>
                <ProductsSlider data={seeMoreProducts.data} />
              </div>
            </div>

            <RecentlyViewedSlider currentProductSlug={data.slug} />
          </div>
        </div>
      </div>
    </>
  );
}
