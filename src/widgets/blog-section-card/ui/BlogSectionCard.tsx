import Link from "next/link";
import styles from "./BlogSectionCard.module.scss";
import type { BlogSectionType } from "@/entities/blog";

type BlogSectionCardProps = {
  section: BlogSectionType;
};

export function BlogSectionCard({ section }: BlogSectionCardProps) {
  return (
    <Link href={`/blog/${section.slug}`} className={styles.wrapper}>
      <h3 className={styles.title}>{section.name}</h3>
      {section.description && (
        <p className={styles.description}>{section.description}</p>
      )}
    </Link>
  );
}


