"use client";

import styles from "./Catalog.module.scss";
import CatalogHeader from "./catalog-header/CatalogHeader";

import Pagination from "./pagination/Pagination";
import { useRouter } from "next/navigation";
import { ProductCard, ProductType } from "@/entities/product";
import { FilterState } from "@/widgets/filters";
import { Category } from "@/entities/categories";
// import { AttributeValue } from "@/entities/product-attributes";

const ITEMS_PER_PAGE = 24;

export function Catalog({
  propsFilters,
  products,
  categories,
  total,
  hasActiveFilters,
  // attributes,
  currentPage = 1,
}: {
  propsFilters?: FilterState;
  categories: Category[];
  products: ProductType[];
  total?: number;
  hasActiveFilters?: boolean;
  currentPage?: number;
  // attributes: AttributeValue[];
}) {
  const router = useRouter();
  const totalPages = total ? Math.ceil(total / ITEMS_PER_PAGE) : 1;

  const handlePageChange = (page: number) => {
    router.push(`?page=${page}`);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <CatalogHeader
            propsFilters={propsFilters}
            total={total || 0}
            attributes={[]}
            categories={categories}
          />
          <div className={styles.resultWrapper}>
            {products && products.length > 0 ? (
              products.map((product: ProductType) => (
                <ProductCard product={product} key={product.documentId} />
              ))
            ) : (
              <p>
                {hasActiveFilters
                  ? "Товары с указанными фильтрами не найдены! Попробуйте выбрать другие фильтры или сделать поиск по названию"
                  : "Нет доступных продуктов."}
              </p>
            )}
          </div>
        </div>
      </div>

      <Pagination
        total={totalPages}
        current={currentPage}
        onChange={handlePageChange}
        loading={false}
      />

      {/* {isDrawerOpen ? (
                <FilterDrawer
                    filters={{
                        price: filtredPrice,
                        categories: filtredCategories,
                    }}
                    isOpen={isDrawerOpen}
                    onClose={toggleDrawer}
                    onChange={handleFilterChange}
                    data={dataProduct}
                    categories={
                        Array.isArray(categoriesList) ? categoriesList : []
                    }
                    reset={resetUrlParams}
                />
            ) : (
                <></>
            )} */}
    </>
  );
}
