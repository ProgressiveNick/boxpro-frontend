import React from "react";
import styles from "./Catalog.module.scss";
import type { Metadata } from "next";

import { CoverCategory } from "@/widgets/client-widgets";
import { ProductsCatalog } from "@/widgets/products-catalog";
import { getProducts } from "@/entities/product/server";
import { getChildsCategory } from "@/entities/categories/api/getCategories";
import { getCategoryByPath } from "@/entities/categories/lib/getCategoryByPath";
import { getAllCategoryPaths } from "@/entities/categories/api/getCatalogMenu";
import {
  getCategoryMap,
  getChildDocumentIds,
  getBreadcrumbOverridesFromMap,
  getNodeByPath,
} from "@/entities/categories/lib/categoryMap";
import { getCatalogMenu } from "@/entities/categories/api/getCatalogMenu";
import { CategoryTree } from "@/entities/categories/lib/CategoryTree";
import { getCategoryAttributes } from "@/entities/product-attributes/api/getCategoryAttributes";
import { notFound } from "next/navigation";
import {
  parseCatalogParams,
  createApiFilters,
  createPropsFilters,
} from "@/shared/lib/parseCatalogParams";
import { isSparePartsSection } from "@/shared/lib/catalog-constants";
import { generateSEO, generateCategorySEO } from "@/shared/lib/seo-utils";
import { FilterState } from "@/widgets/filters";
import { Breadcrumbs } from "@/widgets/breadcrumbs";
import type { Category } from "@/entities/categories";
import { CatalogCategorySlider } from "@/widgets/catalog-category-slider";
import { OfferCatalogJsonLd } from "@/shared/components/JsonLd/JsonLd";

// ISR: ревалидация каждые 90 минут (5400 секунд)
export const revalidate = 5400;

type Params = Promise<{ slugs: string[] }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * Генерирует статические параметры для всех категорий
 * Используется для предварительной генерации популярных страниц категорий
 */
export async function generateStaticParams() {
  try {
    // Получаем все пути категорий
    const paths = await getAllCategoryPaths();

    // Ограничиваем количество для build time (можно увеличить при необходимости)
    // Для популярных категорий генерируем первые 200
    const popularPaths = paths.slice(0, 200);

    return popularPaths.map((path) => ({
      slugs: path,
    }));
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

export default async function CatalogSectionPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slugs = params.slugs || [];

  // Если slugs пустой, редиректим на главную каталога
  if (slugs.length === 0) {
    notFound();
  }

  // Последний slug - это текущая категория
  const currentSlug = slugs[slugs.length - 1];

  // Используем новую утилиту для парсинга параметров
  const parsedParams = parseCatalogParams(searchParams);

  const [categoryResult, menuResult, mapResult] = await Promise.allSettled([
    getCategoryByPath(slugs),
    getCatalogMenu(),
    getCategoryMap(),
  ]);

  const currentCategory =
    categoryResult.status === "fulfilled" ? categoryResult.value : null;
  if (!currentCategory) {
    notFound();
  }

  const menuData = menuResult.status === "fulfilled" ? menuResult.value : [];
  const categoryMap = mapResult.status === "fulfilled" ? mapResult.value : null;

  const tree = new CategoryTree(menuData);
  const categorySlug = currentCategory.slug || currentSlug;
  const includeParts = isSparePartsSection(slugs);

  // Используем карту только если она заполнена и в ней есть текущая категория (иначе товары и крошки — через API/меню)
  const categoryInMap =
    categoryMap?.tree?.length &&
    currentCategory.documentId &&
    categoryMap.byDocumentId[currentCategory.documentId];
  const categoryDocumentIds = categoryInMap
    ? getChildDocumentIds(categoryMap!, currentCategory.documentId!)
    : undefined;

  const [productsResult, childsResult] = await Promise.allSettled([
    getProducts({
      page: parsedParams.currentPage,
      pageSize: parsedParams.pageSize,
      sort: parsedParams.sort,
      kategoria: categoryDocumentIds ? undefined : categorySlug,
      filters: createApiFilters(parsedParams),
      allCategories: menuData,
      categoryDocumentIds,
      includeParts,
    }),
    getChildsCategory(categorySlug, menuData),
  ]);

  // Загружаем атрибуты отдельно (неблокирующе) - они нужны только для фильтров
  const attributesPromise = getCategoryAttributes(categorySlug, {
    allCategories: menuData,
    includeParts,
  }).catch((error) => {
    // Игнорируем ошибки загрузки атрибутов - фильтры могут работать и без них
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      !errorMessage.toLowerCase().includes("aborted") &&
      !errorMessage.toLowerCase().includes("timeout")
    ) {
      console.warn("[CatalogSectionPage] Error loading attributes:", error);
    }
    return [];
  });

  // Обрабатываем результат получения товаров
  const res =
    productsResult.status === "fulfilled"
      ? productsResult.value
      : {
          data: [],
          meta: {
            pagination: {
              total: 0,
              page: parsedParams.currentPage,
              pageSize: 24,
              pageCount: 0,
            },
          },
        };

  // Логирование для отладки
  if (productsResult.status === "rejected") {
    console.error(
      "[CatalogSectionPage] Error fetching products:",
      productsResult.reason,
    );
  } else {
    console.log(
      `[CatalogSectionPage] Products loaded: ${
        res.data?.length || 0
      } for category ${currentSlug}`,
    );
  }

  const products = res.data || [];
  const total = res.meta?.pagination?.total || 0;

  // Обрабатываем результат получения дочерних категорий для текущей
  const childCategories =
    childsResult.status === "fulfilled" ? childsResult.value : [];

  // Получаем атрибуты (неблокирующе)
  const attributes = await attributesPromise;

  if (!products || products.length === 0) {
    if (!parsedParams.hasActiveFilters) {
      // Не показываем 404, если есть ошибки подключения - показываем пустую страницу
      // notFound();
    }
  }

  const initialFilters: FilterState = createPropsFilters(parsedParams);

  // Хлебные крошки из карты только если по пути slugs в карте найден узел (полный маршрут)
  const categoryNodeFromMap =
    categoryMap?.tree?.length &&
    getNodeByPath(categoryMap, slugs);
  const breadcrumbOverrides = categoryNodeFromMap
    ? getBreadcrumbOverridesFromMap(categoryMap!, slugs)
    : tree.getBreadcrumbOverrides(slugs);
  if (currentCategory.slug && !breadcrumbOverrides[currentCategory.slug]) {
    breadcrumbOverrides[currentCategory.slug] = currentCategory.name;
  }

  const categoryCatalogDescription =
    currentCategory.description?.replace(/<[^>]*>/g, "").trim() ||
    `Каталог упаковочного и производственного оборудования BoxPro. Категория: ${currentCategory.name}.`;
  const categoryCatalogImage =
    currentCategory.img_menu?.url ??
    products[0]?.pathsImgs?.[0]?.path ??
    "/img/logo.svg";

  return (
    <>
      <OfferCatalogJsonLd
        name={currentCategory.name}
        description={categoryCatalogDescription}
        image={categoryCatalogImage}
        itemListElement={products.map((p) => ({
          url: `/product/${p.slug}`,
          name: p.name,
          description: p.description?.replace(/<[^>]*>/g, "").trim() || p.name,
          image: p.pathsImgs?.[0]?.path ?? undefined,
          price: p.price,
          priceCurrency: "RUB",
        }))}
      />
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
        <ProductsCatalog
          categories={menuData}
          childCategories={childCategories}
          products={products}
          total={total}
          currentPage={parsedParams.currentPage}
          pageSize={parsedParams.pageSize}
          currentCategoryId={currentCategory.documentId}
          initialFilters={initialFilters}
          hasActiveFilters={parsedParams.hasActiveFilters}
          attributes={attributes}
          hideMobileFilterButton={includeParts}
        />
      </div>
    </div>
    </>
  );
}
