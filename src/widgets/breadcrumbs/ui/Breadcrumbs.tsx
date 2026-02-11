"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./Breadcrumbs.module.scss";
import PATH_TITLES from "@/shared/lib/path-titles";

type BreadcrumbsProps = {
  name?: string;
  pathOverrides?: Record<string, string>;
};

export function Breadcrumbs({ name, pathOverrides }: BreadcrumbsProps) {
  const pathname = usePathname();
  const paths = pathname.split("/").filter((path) => path);
  const titles: Record<string, string> = PATH_TITLES as Record<string, string>;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <nav aria-label="breadcrumb" className={styles.nav}>
          <ol className={styles.breadcrumbs}>
            {/* Главная страница: ссылка и "/" в конце (при переносе "/" остаётся на прошлой строке) */}
            <li className={styles.item}>
              <Link href="/" className={styles.link}>
                Главная
              </Link>
              {paths.length > 0 && (
                <span className={styles.separator}> / </span>
              )}
            </li>
            {/* Остальные сегменты: ссылка/название и "/" в конце */}
            {paths.map((path, index) => {
              const href = "/" + paths.slice(0, index + 1).join("/");
              const isLast = index === paths.length - 1;
              const title =
                pathOverrides?.[path] ||
                titles[path] ||
                path.replace(/-/g, " ");

              return (
                <li key={href} className={styles.item}>
                  {isLast ? (
                    <span className={styles.active}>{name ? name : title}</span>
                  ) : (
                    <Link href={href} className={styles.link}>
                      {title}
                    </Link>
                  )}
                  {!isLast && <span className={styles.separator}> / </span>}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
