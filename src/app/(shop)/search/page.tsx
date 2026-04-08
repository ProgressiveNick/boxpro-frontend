import { searchProducts } from "@/entities/product/api/actions";
import { Breadcrumbs } from "@/widgets/breadcrumbs";
import { SearchResultsList } from "./SearchResultsList";
import type { ProductType } from "@/entities/product";
import Link from "next/link";
import styles from "./SearchPage.module.scss";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const DEFAULT_PAGE_SIZE = 24;

function getParamValue(
  value: string | string[] | undefined,
  fallback = "",
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export default async function SearchPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const query = getParamValue(searchParams.q).trim();
  const currentPage = Math.max(1, Number.parseInt(getParamValue(searchParams.page, "1"), 10) || 1);
  const pageSize = Math.max(
    1,
    Number.parseInt(
      getParamValue(searchParams.pageSize, String(DEFAULT_PAGE_SIZE)),
      10,
    ) || DEFAULT_PAGE_SIZE,
  );

  let products: ProductType[] = [];
  let total = 0;

  if (query.length >= 3) {
    const result = await searchProducts({
      q: query,
      type: "products",
      page: currentPage,
      pageSize,
    });
    const productsData = result.data?.products;
    products = (productsData?.data ?? []) as ProductType[];
    total = productsData?.meta?.pagination?.total ?? 0;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.breadcrumbsWrapper}>
          <Breadcrumbs name="Поиск" />
        </div>
        <h1 className={styles.title}>
          Результаты поиска{query.length >= 3 ? `: ${query}` : ""}
        </h1>

        {query.length === 0 && (
          <p className={styles.message}>Введите запрос для поиска товаров.</p>
        )}

        {query.length > 0 && query.length < 3 && (
          <p className={styles.message}>Введите минимум 3 символа.</p>
        )}

        {query.length >= 3 && (
          <>
            {products.length > 0 ? (
              <SearchResultsList
                products={products}
                total={total}
                currentPage={currentPage}
                pageSize={pageSize}
              />
            ) : (
              <div className={styles.emptyMessage}>
                <p className={styles.emptyText}>
                  По запросу <b>{query}</b> ничего не найдено. Попробуйте написать
                  по-другому или найти необходимое оборудование в каталоге.
                </p>
                <Link href="/catalog" className={styles.catalogButton}>
                  В каталог
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
