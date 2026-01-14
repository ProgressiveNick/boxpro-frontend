import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateSEO, generateBlogArticleSEO } from "@/shared/lib/seo-utils";
import { getBlogBySlug, getBlogs } from "@/entities/blog";
import { BlogArticleCard } from "@/widgets/blog-article-card";
import { Breadcrumbs } from "@/widgets/client-widgets";
import styles from "./BlogArticle.module.scss";

type Params = Promise<{ sectionSlug: string; articleSlug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { articleSlug } = await params;
  const article = await getBlogBySlug(articleSlug);

  if (!article) {
    return generateSEO({
      title: "Статья не найдена | Блог BoxPro",
      description: "Запрашиваемая статья не найдена",
      noIndex: true,
    });
  }

  return generateSEO(
    generateBlogArticleSEO(article.name, article.description || undefined)
  );
}

export default async function BlogArticlePage({ params }: { params: Params }) {
  const { sectionSlug, articleSlug } = await params;

  const article = await getBlogBySlug(articleSlug);
  if (!article) {
    notFound();
  }

  // Проверяем, что статья относится к указанному разделу
  const section = article.blog_sections?.find((s) => s.slug === sectionSlug);
  if (!section) {
    // Если статья не относится к указанному разделу, но существует,
    // перенаправляем на правильный раздел или показываем 404
    const firstSection = article.blog_sections?.[0];
    if (firstSection) {
      // Можно сделать редирект, но для простоты показываем 404
      notFound();
    } else {
      notFound();
    }
  }

  // Получаем другие статьи из того же раздела для блока "Смотрите также"
  const relatedArticlesResponse = await getBlogs({
    sectionSlug,
    page: 1,
    pageSize: 4,
  });

  // Исключаем текущую статью
  const relatedArticles = (relatedArticlesResponse.data || []).filter(
    (a) => a.slug !== articleSlug
  );

  return (
    <>
      <Breadcrumbs name={article.name} />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <article className={styles.article}>
            <h1 className={styles.title}>{article.name}</h1>

            {article.publish_date && (
              <time className={styles.publishDate}>
                {new Date(article.publish_date).toLocaleDateString("ru-RU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}

            {article.description && (
              <p className={styles.description}>{article.description}</p>
            )}

            {article.article && (
              <div
                className={styles.content}
                dangerouslySetInnerHTML={{ __html: article.article }}
              />
            )}
          </article>

          {/* Блок "Смотрите также" */}
          {relatedArticles.length > 0 && (
            <section className={styles.relatedSection}>
              <h2 className={styles.relatedTitle}>Смотрите также</h2>
              <div className={styles.relatedGrid}>
                {relatedArticles.map((relatedArticle) => (
                  <BlogArticleCard
                    key={relatedArticle.documentId}
                    article={relatedArticle}
                    sectionSlug={sectionSlug}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}


