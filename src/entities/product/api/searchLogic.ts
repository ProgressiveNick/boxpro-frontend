/**
 * Логика поиска по товарам и блогу. Для использования из Server Actions.
 */

import { getStrapiRecords } from "@/shared/lib/api/strapi";

export type SearchType = "all" | "products" | "blogs";

export interface SearchParams {
  q: string;
  type?: SearchType;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  data: {
    products?: {
      data: unknown[];
      meta: {
        pagination: {
          total: number;
          page: number;
          pageSize: number;
          pageCount: number;
        };
      };
    };
    blogs?: unknown;
  };
  query: string;
}

export async function searchProductsLogic(
  params: SearchParams
): Promise<SearchResult> {
  const { q: query, type = "all", page = 1, pageSize = 24 } = params;

  const results: SearchResult["data"] = {};

  if (type === "all" || type === "products") {
    const pageNum = Math.max(1, page);
    const pageSizeNum = Math.min(100, Math.max(1, pageSize));
    const offset = (pageNum - 1) * pageSizeNum;

    const searchFilters = {
      "filters[$or][0][name][$contains]": query,
      "filters[$or][1][description][$contains]": query,
      "filters[$or][2][slug][$contains]": query,
    };

    const baseParams = {
      publicationState: "live",
      populate: "*",
      ...searchFilters,
    };

    const [equipmentCountRes, partsCountRes] = await Promise.all([
      getStrapiRecords("tovaries", {
        ...baseParams,
        "filters[part][$ne]": "true",
        "pagination[start]": "0",
        "pagination[limit]": "1",
      }),
      getStrapiRecords("tovaries", {
        ...baseParams,
        "filters[part][$eq]": "true",
        "pagination[start]": "0",
        "pagination[limit]": "1",
      }),
    ]);

    const equipmentTotal = equipmentCountRes?.meta?.pagination?.total ?? 0;
    const partsTotal = partsCountRes?.meta?.pagination?.total ?? 0;
    const total = equipmentTotal + partsTotal;

    let productsData: unknown[] = [];

    if (offset < equipmentTotal) {
      const equipmentLimit = Math.min(pageSizeNum, equipmentTotal - offset);
      const equipmentRes = await getStrapiRecords("tovaries", {
        ...baseParams,
        "filters[part][$ne]": "true",
        "pagination[start]": String(offset),
        "pagination[limit]": String(equipmentLimit),
        sort: "name:asc",
      });
      productsData = (equipmentRes?.data ?? []) as unknown[];

      if (equipmentLimit < pageSizeNum) {
        const partsLimit = pageSizeNum - equipmentLimit;
        const partsRes = await getStrapiRecords("tovaries", {
          ...baseParams,
          "filters[part][$eq]": "true",
          "pagination[start]": "0",
          "pagination[limit]": String(partsLimit),
          sort: "name:asc",
        });
        productsData = [
          ...productsData,
          ...((partsRes?.data ?? []) as unknown[]),
        ];
      }
    } else {
      const partsStart = offset - equipmentTotal;
      const partsRes = await getStrapiRecords("tovaries", {
        ...baseParams,
        "filters[part][$eq]": "true",
        "pagination[start]": String(partsStart),
        "pagination[limit]": String(pageSizeNum),
        sort: "name:asc",
      });
      productsData = (partsRes?.data ?? []) as unknown[];
    }

    const pageCount = Math.ceil(total / pageSizeNum);

    results.products = {
      data: productsData,
      meta: {
        pagination: {
          total,
          page: pageNum,
          pageSize: pageSizeNum,
          pageCount,
        },
      },
    };
  }

  if (type === "all" || type === "blogs") {
    const blogsResult = await getStrapiRecords("blogs", {
      publicationState: "live",
      populate: "*",
      "populate[blog_sections]": "*",
      "populate[preview]": "*",
      "pagination[page]": String(params.page ?? 1),
      "pagination[pageSize]": String(params.pageSize ?? 24),
      "filters[$or][0][name][$contains]": query,
      "filters[$or][1][description][$contains]": query,
      "filters[$or][2][article][$contains]": query,
      sort: "publish_date:desc",
    });
    results.blogs = blogsResult;
  }

  return { data: results, query };
}
