/**
 * Server-side функция для получения всех разделов блога
 * Используется только в server components для SSR
 */

import { getStrapiRecords } from "@/shared/lib/api/strapi";
import type { BlogSectionType } from "../model/types";

type GetBlogSectionsResponse = {
  data: BlogSectionType[];
};

export async function getBlogSections(): Promise<GetBlogSectionsResponse> {
  const params: Record<string, string> = {
    publicationState: "live",
    populate: "*",
  };

  return getStrapiRecords("blog-sections", params);
}

