import React from "react";
import { getProducts } from "@/entities/product/server";
import {
  parseCatalogParams,
  createApiFilters,
  createPropsFilters,
} from "@/shared/lib/parseCatalogParams";
import { FilterState } from "@/widgets/filters";
import type { Category } from "@/entities/categories";
import type { ProductType } from "@/entities/product";
import { ProductsCatalog } from "@/widgets/products-catalog";
import { OfferCatalogJsonLd } from "@/shared/components/JsonLd/JsonLd";

type CatalogRootProductsBlockProps = {
  menuData: Category[];
  searchParams: { [key: string]: string | string[] | undefined };
};

/**
 * Асинхронный блок каталога товаров для корневой страницы /catalog.
 * Загружает товары без фильтра по категории, рендерит ProductsCatalog и JSON-LD.
 */
export async function CatalogRootProductsBlock({
  menuData,
  searchParams,
}: CatalogRootProductsBlockProps) {
  const parsedParams = parseCatalogParams(searchParams);

  const res = await getProducts({
    page: parsedParams.currentPage,
    pageSize: parsedParams.pageSize,
    sort: parsedParams.sort,
    filters: createApiFilters(parsedParams),
    allCategories: menuData,
  }).then(
    (r) => r,
    () => ({
      data: [] as ProductType[],
      meta: {
        pagination: {
          total: 0,
          page: parsedParams.currentPage,
          pageSize: parsedParams.pageSize ?? 36,
          pageCount: 0,
        },
      },
    }),
  );

  const products = res.data ?? [];
  const total = res.meta?.pagination?.total ?? 0;
  const initialFilters: FilterState = createPropsFilters(parsedParams);

  const catalogDescription =
    "Каталог упаковочного и производственного оборудования BoxPro. Большой выбор товаров с фильтрацией по категориям и цене. Доставка по всей России.";
  const catalogImage = products[0]?.pathsImgs?.[0]?.path ?? "/img/logo.svg";

  return (
    <>
      <OfferCatalogJsonLd
        name="Каталог оборудования"
        description={catalogDescription}
        image={catalogImage}
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
        products={products}
        total={total}
        currentPage={parsedParams.currentPage}
        pageSize={parsedParams.pageSize}
        initialFilters={initialFilters}
        hasActiveFilters={parsedParams.hasActiveFilters}
        hideFilters
        containerPadding
      />
    </>
  );
}
