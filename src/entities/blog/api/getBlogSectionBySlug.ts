/**
 * Server-side функция для получения раздела блога по slug
 * Используется только в server components для SSR
 */

import { getStrapiRecords } from "@/shared/lib/api/strapi";
import type { BlogSectionType } from "../model/types";

export async function getBlogSectionBySlug(
  slug: string
): Promise<BlogSectionType | null> {
  const params: Record<string, string> = {
    publicationState: "live",
    populate: "*",
    "filters[slug][$eq]": slug,
  };

  const result = await getStrapiRecords("blog-sections", params);
  
  if (!result.data || result.data.length === 0) {
    return null;
  }

  return result.data[0] as BlogSectionType;
}

