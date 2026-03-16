import type { Metadata } from "next";
import { Suspense } from "react";

import { getCatalogMenu } from "@/entities/categories/api/getCatalogMenu";
import { Breadcrumbs } from "@/widgets/breadcrumbs";
import { CatalogCategorySlider } from "@/widgets/catalog-category-slider";
import styles from "./[...slugs]/Catalog.module.scss";
import { CatalogRootProductsBlock } from "./CatalogRootProductsBlock";
import { CatalogProductsPlaceholder } from "./[...slugs]/CatalogProductsPlaceholder";

export const revalidate = 5400;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const metadata: Metadata = {
  title: "Каталог упаковочного оборудования BoxPro | Купить оборудование",
  description:
    "Каталог упаковочного и производственного оборудования BoxPro. Большой выбор товаров с фильтрацией по категориям и цене. Доставка по всей России.",
  keywords:
    "каталог упаковочного оборудования, производственное оборудование, фильтр товаров, купить оборудование",
  openGraph: {
    title: "Каталог упаковочного оборудования BoxPro",
    description:
      "Каталог упаковочного и производственного оборудования BoxPro. Большой выбор товаров с фильтрацией.",
    type: "website",
    locale: "ru_RU",
  },
};

/**
 * Корневая страница /catalog: крошки, заголовок и слайдер категорий рендерятся сразу
 * из меню (карта категорий); блок товаров загружается в Suspense с плейсхолдером.
 */
export default async function CatalogPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const menuData = await getCatalogMenu();

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Breadcrumbs name="Оборудование" />
        <h1>Каталог оборудования</h1>
        <CatalogCategorySlider
          categories={menuData}
          allCategories={menuData}
        />
        <Suspense fallback={<CatalogProductsPlaceholder />}>
          <CatalogRootProductsBlock
            menuData={menuData}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </div>
  );
}
