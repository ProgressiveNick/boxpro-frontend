import React from "react";
import styles from "./FormTextarea.module.scss";

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  className?: string;
}

export function FormTextarea({
  error,
  className,
  ...props
}: FormTextareaProps) {
  return (
    <div className={styles.container}>
      <textarea
        {...props}
        className={`${styles.textarea} ${error ? styles.error : ""} ${
          className || ""
        }`}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
