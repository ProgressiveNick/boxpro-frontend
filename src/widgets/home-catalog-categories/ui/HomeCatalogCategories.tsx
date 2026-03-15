import Link from "next/link";
import Image from "next/image";
import styles from "./HomeCatalogCategories.module.scss";
import { catalogSectionsData } from "../model/catalogSectionsData";

const ArrowIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path
      d="M6 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function HomeCatalogCategories() {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Разделы каталога</h2>
        <Link href="/catalog" className={styles.viewAllLink}>
          Смотреть всё
          <ArrowIcon />
        </Link>
      </div>
      <div className={styles.sectionsList}>
        {catalogSectionsData.map((section, index) => (
          <article key={index} className={styles.sectionCard}>
            <div className={styles.sectionTitleWrapper}>
              <Link
                href={section.url}
                className={styles.sectionTitleLink}
                aria-label={`Перейти в категорию ${section.name}`}
              >
                <span className={styles.sectionTitleText}>{section.name}</span>
                <span className={styles.sectionTitleArrowBox} aria-hidden>
                  <ArrowIcon className={styles.sectionTitleArrow} />
                </span>
              </Link>
            </div>
            <div className={styles.sectionContent}>
              <Link
                href={section.url}
                className={styles.sectionImageLink}
                aria-label={`Перейти в категорию ${section.name}`}
              >
                <div className={styles.sectionImageWrapper}>
                  {section.imgSrc ? (
                    <Image
                      src={section.imgSrc}
                      alt=""
                      fill
                      sizes="(max-width: 720px) 100vw, 280px"
                      className={styles.sectionImage}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", minHeight: 140 }} />
                  )}
                </div>
              </Link>
              <div className={styles.subcategoriesBlock}>
                <ul className={styles.subcategoryList}>
                  {section.subcategories.map((sub, subIndex) => (
                    <li key={subIndex} className={styles.subcategoryItem}>
                      <Link
                        href={sub.url}
                        className={styles.subcategoryLink}
                      >
                        {sub.name}
                        <span className={styles.subcategoryArrow} aria-hidden>
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
