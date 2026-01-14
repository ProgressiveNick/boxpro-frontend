import React from "react";
import styles from "./FormInput.module.scss";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  className?: string;
}

export function FormInput({ error, className, ...props }: FormInputProps) {
  return (
    <div className={styles.container}>
      <input
        {...props}
        className={`${styles.input} ${error ? styles.error : ""} ${
          className || ""
        }`}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
