import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateSEO, generateBlogSectionSEO } from "@/shared/lib/seo-utils";
import {
  getBlogSectionBySlug,
  getBlogs,
} from "@/entities/blog";
import { BlogArticleCard } from "@/widgets/blog-article-card";
import { Breadcrumbs } from "@/widgets/client-widgets";
import { BlogSectionPagination } from "./BlogSectionPagination";
import styles from "./BlogSection.module.scss";

type Params = Promise<{ sectionSlug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { sectionSlug } = await params;
  const section = await getBlogSectionBySlug(sectionSlug);

  if (!section) {
    return generateSEO({
      title: "Раздел не найден | Блог BoxPro",
      description: "Запрашиваемый раздел блога не найден",
      noIndex: true,
    });
  }

  return generateSEO(
    generateBlogSectionSEO(section.name, section.description || undefined)
  );
}

export default async function BlogSectionPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { sectionSlug } = await params;
  const resolvedSearchParams = await searchParams;

  const pageParam = Array.isArray(resolvedSearchParams.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams.page;
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const section = await getBlogSectionBySlug(sectionSlug);
  if (!section) {
    notFound();
  }

  const blogsResponse = await getBlogs({
    sectionSlug,
    page: currentPage,
    pageSize: 12,
  });

  const articles = blogsResponse.data || [];
  const totalPages = blogsResponse.meta?.pagination?.pageCount || 1;

  return (
    <>
      <Breadcrumbs name={section.name} />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h1 className={styles.title}>{section.name}</h1>
          {section.description && (
            <p className={styles.description}>{section.description}</p>
          )}

          {articles.length > 0 ? (
            <>
              <div className={styles.articlesGrid}>
                {articles.map((article) => (
                  <BlogArticleCard
                    key={article.documentId}
                    article={article}
                    sectionSlug={sectionSlug}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                  <BlogSectionPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    sectionSlug={sectionSlug}
                  />
                </div>
              )}
            </>
          ) : (
            <p className={styles.empty}>Статьи в этом разделе отсутствуют</p>
          )}
        </div>
      </div>
    </>
  );
}

