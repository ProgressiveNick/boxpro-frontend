import styles from "./SkeletonText.module.scss";

type SkeletonTextProps = {
  width?: string;
  height?: string;
  lines?: number;
  className?: string;
};

export function SkeletonText({
  width = "100%",
  height = "16px",
  lines = 1,
  className,
}: SkeletonTextProps) {
  return (
    <div className={className} aria-label="Загрузка..." role="status">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={styles.skeletonLine}
          style={{
            width: i === lines - 1 ? "80%" : width,
            height,
            marginBottom: i < lines - 1 ? "8px" : "0",
          }}
        />
      ))}
    </div>
  );
}


