import type { Metadata } from "next";

import { getCatalogMenu } from "@/entities/categories/api/getCatalogMenu";
import { getProducts } from "@/entities/product/server";
import { FilterState } from "@/widgets/filters";
import { Breadcrumbs } from "@/widgets/breadcrumbs";
import { ProductsCatalog } from "@/widgets/products-catalog";
import { CatalogCategorySlider } from "@/widgets/catalog-category-slider";
import { OfferCatalogJsonLd } from "@/shared/components/JsonLd/JsonLd";
import styles from "./[...slugs]/Catalog.module.scss";

// ISR: ревалидация каждые 90 минут (5400 секунд)
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

export default async function CatalogPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const menuData = await getCatalogMenu();

  const pageParam = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;
  const currentPage = pageParam ? parseInt(pageParam) : 1;

  const priceMinParam = Array.isArray(searchParams.priceMin)
    ? parseInt(searchParams.priceMin[0])
    : searchParams.priceMin
      ? parseInt(searchParams.priceMin)
      : undefined;
  const priceMaxParam = Array.isArray(searchParams.priceMax)
    ? parseInt(searchParams.priceMax[0])
    : searchParams.priceMax
      ? parseInt(searchParams.priceMax)
      : undefined;

  // Парсим параметры сортировки и размера страницы
  const sortParam = Array.isArray(searchParams.sort)
    ? searchParams.sort[0]
    : searchParams.sort;
  const sortValue = sortParam || "price:desc";
  const pageSizeParam = Array.isArray(searchParams.pageSize)
    ? parseInt(searchParams.pageSize[0])
    : searchParams.pageSize
      ? parseInt(searchParams.pageSize)
      : undefined;

  const res = await getProducts({
    page: currentPage,
    pageSize: pageSizeParam,
    sort: sortValue,
    filters: {
      categories: [],
      minPrice: priceMinParam,
      maxPrice: priceMaxParam,
    },
    allCategories: menuData, // Передаем уже загруженные категории для оптимизации
  });

  // const resAttributes = await getAllAttributes();
  // const resAttributesValues = await getAllProductsAttributes();

  const products = res.data || [];
  const total = res.meta?.pagination?.total || 0;

  const initialFilters: FilterState = {
    price: {
      priceMin: priceMinParam || 0,
      priceMax: priceMaxParam || 1000000,
    },
    categories: [],
  };

  const hasActiveFilters =
    (priceMinParam !== undefined && priceMinParam > 0) ||
    (priceMaxParam !== undefined && priceMaxParam < 1000000);

  const catalogDescription =
    "Каталог упаковочного и производственного оборудования BoxPro. Большой выбор товаров с фильтрацией по категориям и цене. Доставка по всей России.";
  const catalogImage =
    products[0]?.pathsImgs?.[0]?.path ?? "/img/logo.svg";

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
      {/* Ограничиваем только хлебные крошки таким же контейнером, как на страницах категорий */}
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <Breadcrumbs name="Оборудование" />
          <h1>Каталог оборудования</h1>
          <CatalogCategorySlider
            categories={menuData}
            allCategories={menuData}
          />
        </div>
      </div>

      {/* Каталог остаётся в своём собственном контейнере из ProductsCatalog */}
      <ProductsCatalog
        categories={menuData}
        products={products}
        total={total}
        currentPage={currentPage}
        initialFilters={initialFilters}
        hasActiveFilters={hasActiveFilters}
        hideFilters
        containerPadding
      />
    </>
  );
}
