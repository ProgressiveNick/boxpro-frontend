import styles from "./SkeletonImage.module.scss";

type SkeletonImageProps = {
  width?: string;
  height?: string;
  className?: string;
  aspectRatio?: string;
};

export function SkeletonImage({
  width = "100%",
  height = "auto",
  aspectRatio,
  className,
}: SkeletonImageProps) {
  return (
    <div
      className={`${styles.skeletonImage} ${className || ""}`}
      style={{
        width,
        height,
        aspectRatio,
      }}
      aria-label="Загрузка изображения..."
      role="status"
    />
  );
}


