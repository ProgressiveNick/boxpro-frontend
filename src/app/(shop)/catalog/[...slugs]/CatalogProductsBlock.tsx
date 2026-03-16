import React from "react";
import { getProducts } from "@/entities/product/server";
import { getCategoryAttributes } from "@/entities/product-attributes/api/getCategoryAttributes";
import {
  createApiFilters,
  createPropsFilters,
} from "@/shared/lib/parseCatalogParams";
import { FilterState } from "@/widgets/filters";
import type { Category } from "@/entities/categories";
import type { ParsedCatalogParams } from "@/shared/lib/parseCatalogParams";
import { ProductsCatalog } from "@/widgets/products-catalog";
import { resolveAttributeSlugsToIds } from "@/widgets/products-catalog/lib/url-utils";
import { OfferCatalogJsonLd } from "@/shared/components/JsonLd/JsonLd";
import type { ProductType } from "@/entities/product";

type CatalogProductsBlockProps = {
  parsedParams: ParsedCatalogParams;
  categoryDocumentIds: string[] | undefined;
  categorySlug: string;
  menuData: Category[];
  includeParts: boolean;
  currentCategory: Category;
  childCategories: Category[];
};

/**
 * Асинхронный блок каталога товаров: загружает товары и атрибуты, рендерит ProductsCatalog и JSON-LD.
 * Используется внутри Suspense — верхняя часть страницы (крошки, обложка, слайдер) показывается сразу.
 */
export async function CatalogProductsBlock({
  parsedParams,
  categoryDocumentIds,
  categorySlug,
  menuData,
  includeParts,
  currentCategory,
  childCategories,
}: CatalogProductsBlockProps) {
  const attributesResult = await getCategoryAttributes(categorySlug, {
    allCategories: menuData,
    includeParts,
  }).catch(() => []);
  const attributes = Array.isArray(attributesResult) ? attributesResult : [];
  const idBasedAttributes = resolveAttributeSlugsToIds(
    attributes,
    parsedParams.attributes,
  );
  const paramsForApi: ParsedCatalogParams = {
    ...parsedParams,
    attributes: idBasedAttributes ?? parsedParams.attributes,
  };

  const productsSettled = await getProducts({
    page: parsedParams.currentPage,
    pageSize: parsedParams.pageSize,
    sort: parsedParams.sort,
    kategoria: categoryDocumentIds ? undefined : categorySlug,
    filters: createApiFilters(paramsForApi),
    allCategories: menuData,
    categoryDocumentIds,
    includeParts,
  }).then(
    (r) => r,
    () => null,
  );

  const productsResponse = productsSettled ?? {
    data: [] as ProductType[],
    meta: {
      pagination: {
        total: 0,
        page: parsedParams.currentPage,
        pageSize: parsedParams.pageSize ?? 36,
        pageCount: 0,
      },
    },
  };
  const res = productsResponse;

  const products = res.data ?? [];
  const total = res.meta?.pagination?.total ?? 0;

  const initialFilters: FilterState = createPropsFilters(paramsForApi);

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
    </>
  );
}
