import type { Metadata } from "next";
import { generateSEO, generateBlogSEO } from "@/shared/lib/seo-utils";
import { getBlogSections, getBlogs } from "@/entities/blog";
import type { BlogSectionType, BlogArticleType } from "@/entities/blog";
import { BlogSectionCard } from "@/widgets/blog-section-card";
import { BlogArticleCard } from "@/widgets/blog-article-card";
import { Breadcrumbs } from "@/widgets/client-widgets";
import styles from "./Blog.module.scss";

export const metadata: Metadata = generateSEO(
  generateBlogSEO(
    "Блог BoxPro",
    "Полезные статьи и новости о упаковочном оборудовании"
  )
);

export default async function BlogPage() {
  let sections: BlogSectionType[] = [];
  let articles: BlogArticleType[] = [];

  try {
    const sectionsResponse = await getBlogSections();
    sections = sectionsResponse.data || [];
  } catch (error) {
    console.error("Ошибка получения разделов блога:", error);
    // Продолжаем выполнение, даже если разделы не загрузились
  }

  try {
    const blogsResponse = await getBlogs({ page: 1, pageSize: 12 });
    articles = blogsResponse.data || [];
  } catch (error) {
    console.error("Ошибка получения статей блога:", error);
    // Продолжаем выполнение, даже если статьи не загрузились
  }

  return (
    <>
      <Breadcrumbs />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h1 className={styles.title}>Блог</h1>

          {/* Секция разделов */}
          {sections.length > 0 && (
            <section className={styles.sectionsSection}>
              <h2 className={styles.sectionTitle}>Разделы</h2>
              <div className={styles.sectionsGrid}>
                {sections.map((section) => (
                  <BlogSectionCard key={section.documentId} section={section} />
                ))}
              </div>
            </section>
          )}

          {/* Секция статей */}
          {articles.length > 0 && (
            <section className={styles.articlesSection}>
              <h2 className={styles.sectionTitle}>Все статьи</h2>
              <div className={styles.articlesGrid}>
                {articles.map((article) => {
                  const sectionSlug =
                    article.blog_sections?.[0]?.slug || "uncategorized";
                  return (
                    <BlogArticleCard
                      key={article.documentId}
                      article={article}
                      sectionSlug={sectionSlug}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {sections.length === 0 && articles.length === 0 && (
            <p className={styles.empty}>Статьи пока отсутствуют</p>
          )}
        </div>
      </div>
    </>
  );
}
