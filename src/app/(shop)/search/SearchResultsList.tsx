"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductCard, ProductType } from "@/entities/product";
import Pagination from "@/widgets/catalog/ui/pagination/Pagination";
import styles from "./SearchResultsList.module.scss";

type SearchResultsListProps = {
  products: ProductType[];
  total: number;
  currentPage: number;
  pageSize: number;
};

export function SearchResultsList({
  products,
  total,
  currentPage,
  pageSize,
}: SearchResultsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;
  const normalizedCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <ProductCard product={product} key={product.documentId} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationWrapper}>
          <Pagination
            total={totalPages}
            current={normalizedCurrentPage}
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
