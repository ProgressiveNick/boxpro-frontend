import React from "react";
import styles from "./Button.module.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  loading?: boolean;
  text?: string;
  children?: React.ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  children,
  text,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${styles.button} ${styles[variant]} ${
        loading ? styles.loading : ""
      } ${className || ""}`}
    >
      {loading && <span className={styles.spinner} />}
      {text || children}
    </button>
  );
}
