/**
 * Server-side функция для получения статьи блога по slug
 * Используется только в server components для SSR
 */

import { getStrapiRecords } from "@/shared/lib/api/strapi";
import type { BlogArticleType } from "../model/types";

export async function getBlogBySlug(slug: string): Promise<BlogArticleType | null> {
  const params: Record<string, string> = {
    "filters[slug][$eq]": slug,
    populate: "*",
    publicationState: "live",
  };

  const result = await getStrapiRecords("blogs", params);

  if (!result.data || result.data.length === 0) {
    return null;
  }

  return result.data[0] as BlogArticleType;
}

