"use client";

import { useRouter } from "next/navigation";
import Pagination from "@/widgets/catalog/ui/pagination/Pagination";

type BlogSectionPaginationProps = {
  currentPage: number;
  totalPages: number;
  sectionSlug: string;
};

export function BlogSectionPagination({
  currentPage,
  totalPages,
  sectionSlug,
}: BlogSectionPaginationProps) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    router.push(`/blog/${sectionSlug}?page=${page}`);
  };

  return (
    <Pagination
      total={totalPages}
      current={currentPage}
      onChange={handlePageChange}
      loading={false}
    />
  );
}


