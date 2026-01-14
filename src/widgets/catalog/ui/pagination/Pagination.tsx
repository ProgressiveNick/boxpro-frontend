import getPagination from "@/shared/lib/GetPagination";
import styles from "./Pagination.module.scss"; // стили пример ниже

export default function Pagination({
  total,
  current,
  onChange,
  loading,
}: {
  total: number;
  current: number;
  onChange: (selectedPage: number) => void;
  loading?: boolean;
}) {
  const pages = getPagination(current, total);

  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1 || loading}
        className={styles.arrowBtn}
      >
        {"<"}
      </button>
      {pages.map((num) =>
        num === "..." ? (
          <span key={num} className={styles.dots}>
            ...
          </span>
        ) : (
          <button
            key={num}
            className={
              current === num ? styles.activePage : styles.paginationBtn
            }
            onClick={() => onChange(Number(num))}
            disabled={current === num || loading}
          >
            {num}
          </button>
        )
      )}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total || loading}
        className={styles.arrowBtn}
      >
        {">"}
      </button>
    </div>
  );
}
