import styles from "./SkeletonCard.module.scss";

type SkeletonCardProps = {
  width?: string;
  height?: string;
  className?: string;
};

export function SkeletonCard({
  width = "100%",
  height = "auto",
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={`${styles.skeletonCard} ${className || ""}`}
      style={{ width, height }}
      aria-label="Загрузка..."
      role="status"
    >
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonText} />
        <div className={styles.skeletonPrice} />
      </div>
    </div>
  );
}


