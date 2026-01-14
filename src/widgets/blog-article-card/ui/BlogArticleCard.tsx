import Link from "next/link";
import styles from "./BlogArticleCard.module.scss";
import type { BlogArticleType } from "@/entities/blog";

type BlogArticleCardProps = {
  article: BlogArticleType;
  sectionSlug: string;
};

export function BlogArticleCard({ article, sectionSlug }: BlogArticleCardProps) {
  return (
    <Link
      href={`/blog/${sectionSlug}/${article.slug}`}
      className={styles.wrapper}
    >
      <h3 className={styles.title}>{article.name}</h3>
      {article.description && (
        <p className={styles.description}>{article.description}</p>
      )}
      {article.publish_date && (
        <time className={styles.date}>
          {new Date(article.publish_date).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      )}
    </Link>
  );
}


