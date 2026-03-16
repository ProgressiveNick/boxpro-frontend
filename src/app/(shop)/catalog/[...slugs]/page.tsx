import React, { Suspense } from "react";
import styles from "./Catalog.module.scss";
import type { Metadata } from "next";

import { CoverCategory } from "@/widgets/client-widgets";
import { getCategoryByPath } from "@/entities/categories/lib/getCategoryByPath";
import { getAllCategoryPaths } from "@/entities/categories/api/getCatalogMenu";
import {
  getCategoryMap,
  getChildDocumentIds,
  getBreadcrumbOverridesFromMap,
  getNodeByPath,
  getChildCategoriesFromMap,
} from "@/entities/categories/lib/categoryMap";
import { getCatalogMenu } from "@/entities/categories/api/getCatalogMenu";
import { CategoryTree } from "@/entities/categories/lib/CategoryTree";
import { notFound } from "next/navigation";
import { parseCatalogParams } from "@/shared/lib/parseCatalogParams";
import { isSparePartsSection } from "@/shared/lib/catalog-constants";
import { generateSEO, generateCategorySEO } from "@/shared/lib/seo-utils";
import { Breadcrumbs } from "@/widgets/breadcrumbs";
import type { Category } from "@/entities/categories";
import { CatalogCategorySlider } from "@/widgets/catalog-category-slider";
import { CatalogProductsBlock } from "./CatalogProductsBlock";
import { CatalogProductsPlaceholder } from "./CatalogProductsPlaceholder";

// ISR: ревалидация каждые 90 минут (5400 секунд)
export const revalidate = 5400;

type Params = Promise<{ slugs: string[] }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * Генерирует статические параметры для всех категорий
 */
export async function generateStaticParams() {
  try {
    const paths = await getAllCategoryPaths();
    const popularPaths = paths.slice(0, 200);
    return popularPaths.map((path) => ({ slugs: path }));
  } catch (error) {
    console.error(
      "[generateStaticParams] Error fetching category paths:",
      error,
    );
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slugs } = await params;
  try {
    const currentCategory = await getCategoryByPath(slugs);
    if (currentCategory) {
      return generateSEO(generateCategorySEO(currentCategory.name));
    }
    return generateSEO({
      title: "Категория не найдена | BoxPro",
      description: "Запрашиваемая категория не найдена в каталоге BoxPro.",
      noIndex: true,
    });
  } catch {
    return generateSEO({
      title: "Категория не найдена | BoxPro",
      description: "Запрашиваемая категория не найдена в каталоге BoxPro.",
      noIndex: true,
    });
  }
}

/**
 * Страница каталога: верхняя часть (крошки, обложка, слайдер подкатегорий) рендерится сразу
 * из карты категорий; блок товаров загружается асинхронно и показывается в Suspense с плейсхолдером.
 */
export default async function CatalogSectionPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slugs = params.slugs || [];

  if (slugs.length === 0) {
    notFound();
  }

  const currentSlug = slugs[slugs.length - 1];
  const parsedParams = parseCatalogParams(searchParams);

  // Только данные категорий (карта + меню) — без запросов к Strapi за категориями, отдаём сразу
  const [categoryResult, menuResult, mapResult] = await Promise.all([
    getCategoryByPath(slugs),
    getCatalogMenu(),
    getCategoryMap(),
  ]);

  const currentCategory = categoryResult;
  if (!currentCategory) {
    notFound();
  }

  const menuData = menuResult ?? [];
  const categoryMap = mapResult ?? null;
  const tree = new CategoryTree(menuData);
  const categorySlug = currentCategory.slug || currentSlug;
  const includeParts = isSparePartsSection(slugs);

  // Дочерние категории сразу из карты (не ждём отдельный запрос)
  const childCategories =
    categoryMap && currentCategory.documentId
      ? getChildCategoriesFromMap(categoryMap, currentCategory.documentId)
      : [];

  const categoryInMap =
    categoryMap?.tree?.length &&
    currentCategory.documentId &&
    categoryMap.byDocumentId[currentCategory.documentId];
  const categoryDocumentIds = categoryInMap
    ? getChildDocumentIds(categoryMap, currentCategory.documentId!)
    : undefined;

  const categoryNodeFromMap =
    categoryMap?.tree?.length && getNodeByPath(categoryMap, slugs);
  const breadcrumbOverrides = categoryNodeFromMap
    ? getBreadcrumbOverridesFromMap(categoryMap!, slugs)
    : tree.getBreadcrumbOverrides(slugs);
  if (currentCategory.slug && !breadcrumbOverrides[currentCategory.slug]) {
    breadcrumbOverrides[currentCategory.slug] = currentCategory.name;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.breadcrumbsWrapper}>
          <Breadcrumbs
            name={currentCategory.name}
            pathOverrides={breadcrumbOverrides}
          />
        </div>
        <CoverCategory headlineText={` ${currentCategory.name}`} deskText="" />
        <CatalogCategorySlider
          categories={childCategories}
          allCategories={menuData}
          excludeId={currentCategory.documentId || String(currentCategory.id)}
          variant="nested"
        />
        <Suspense fallback={<CatalogProductsPlaceholder />}>
          <CatalogProductsBlock
            parsedParams={parsedParams}
            categoryDocumentIds={categoryDocumentIds}
            categorySlug={categorySlug}
            menuData={menuData}
            includeParts={includeParts}
            currentCategory={currentCategory}
            childCategories={childCategories}
          />
        </Suspense>
      </div>
    </div>
  );
}
