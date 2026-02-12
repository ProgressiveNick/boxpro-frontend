/**
 * Получить все пути статей блога для sitemap: пары (sectionSlug, articleSlug).
 * Обходит все разделы и пагинирует статьи в каждом.
 */

import { getBlogSections } from "./getBlogSections";
import { getBlogs } from "./getBlogs";

const PAGE_SIZE = 100;

export type BlogArticlePath = {
  sectionSlug: string;
  articleSlug: string;
};

export async function getAllBlogArticlePaths(): Promise<BlogArticlePath[]> {
  const result: BlogArticlePath[] = [];

  try {
    const sectionsResponse = await getBlogSections();
    const sections = sectionsResponse.data || [];

    for (const section of sections) {
      const sectionSlug = section.slug;
      if (!sectionSlug) continue;

      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getBlogs({
          sectionSlug,
          page,
          pageSize: PAGE_SIZE,
        });

        const articles = response.data || [];
        for (const article of articles) {
          if (article.slug) {
            result.push({ sectionSlug, articleSlug: article.slug });
          }
        }

        const pageCount = response.meta?.pagination?.pageCount ?? 1;
        hasMore = page < pageCount;
        page += 1;
      }
    }

    return result;
  } catch (error) {
    console.error("[getAllBlogArticlePaths] Error:", error);
    return [];
  }
}
