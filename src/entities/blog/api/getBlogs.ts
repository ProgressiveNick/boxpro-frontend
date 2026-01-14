/**
 * Server-side функция для получения списка статей блога
 * Используется только в server components для SSR
 */

import { getStrapiRecords } from "@/shared/lib/api/strapi";
import type { BlogArticleType } from "../model/types";

type GetBlogsParams = {
  page?: number;
  pageSize?: number;
  sectionSlug?: string;
  search?: string;
  sort?: string;
};

type GetBlogsResponse = {
  data: BlogArticleType[];
  meta: {
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
};

export async function getBlogs(
  params: GetBlogsParams = {}
): Promise<GetBlogsResponse> {
  const { page = 1, pageSize = 12, sectionSlug, search, sort = "publish_date:desc" } = params;

  const apiParams: Record<string, string> = {
    publicationState: "live",
    populate: "*",
    "pagination[page]": String(page),
    "pagination[pageSize]": String(pageSize),
    sort,
  };

  if (sectionSlug) {
    apiParams["filters[blog_sections][slug][$eq]"] = sectionSlug;
  }

  if (search) {
    apiParams["filters[$or][0][name][$contains]"] = search;
    apiParams["filters[$or][1][description][$contains]"] = search;
    apiParams["filters[$or][2][article][$contains]"] = search;
  }

  return getStrapiRecords("blogs", apiParams);
}

