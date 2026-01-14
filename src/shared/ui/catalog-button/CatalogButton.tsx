import styles from "./CatalogButton.module.scss";

interface CatalogButtonProps {
  onClick?: () => void;
  isOpen?: boolean;
  className?: string;
}

export function CatalogButton({
  onClick,
  isOpen,
  className,
}: CatalogButtonProps) {
  const handleClick = () => {
    onClick?.();
  };

  return (
    <>
      <div className={`${styles.wrapper} ${className}`} onClick={handleClick}>
        <svg
          className={`${styles.ham7} ${isOpen ? styles.active : ""}`}
          viewBox="0 0 100 100"
          width="51"
        >
          <path
            className={styles.top}
            d="m 70,33 h -40 c 0,0 -6,1.368796 -6,8.5 0,7.131204 6,8.5013 6,8.5013 l 20,-0.0013"
          ></path>
          <path className={styles.middle} d="m 70,50 h -40"></path>
          <path
            className={styles.bottom}
            d="m 69.575405,67.073826 h -40 c -5.592752,0 -6.873604,-9.348582 1.371031,-9.348582 8.244634,0 19.053564,21.797129 19.053564,12.274756 l 0,-40"
          ></path>
        </svg>
      </div>
    </>
  );
}
