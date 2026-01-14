"use client";

import React from "react";
import styles from "./ProductImage.module.scss";
import Image from "next/image";

type ProductImageProps = {
  primaryImagePath: string | undefined;
  secondImagePath: string | undefined;
  alt: string | undefined;
  hovering: boolean;
};

export function ProductImage({
  primaryImagePath,
  secondImagePath,
  alt,
  hovering,
}: ProductImageProps) {
  const [imageError, setImageError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState("/img/products/empty.jpg");

  React.useEffect(() => {
    // Сбрасываем ошибку при изменении пути изображения
    setImageError(false);
    
    if (primaryImagePath) {
      if (hovering && secondImagePath) {
        setCurrentSrc(secondImagePath);
      } else {
        setCurrentSrc(primaryImagePath);
      }
    } else {
      setCurrentSrc("/img/products/empty.jpg");
    }
  }, [primaryImagePath, secondImagePath, hovering]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== "/img/products/empty.jpg" && !imageError) {
      setImageError(true);
      setCurrentSrc("/img/products/empty.jpg");
    }
  };

  return (
    <Image
      className={styles.img}
      style={{ objectFit: "contain" }}
      src={currentSrc}
      onError={handleError}
      alt={alt ? alt : "empty product image"}
      width={200}
      height={200}
      priority
      unoptimized={currentSrc.startsWith("/storage/")} // Отключаем оптимизацию для локальных изображений
    />
  );
}
