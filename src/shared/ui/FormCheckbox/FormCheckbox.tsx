import React from "react";
import styles from "./FormCheckbox.module.scss";

interface FormCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
  error?: string;
}

export function FormCheckbox({
  checked,
  onChange,
  label,
  className,
  error,
}: FormCheckboxProps) {
  return (
    <div className={styles.container}>
      <label className={`${styles.checkboxLabel} ${className || ""}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={`${styles.checkbox} ${error ? styles.error : ""}`}
        />
        <span className={styles.checkboxText}>{label}</span>
      </label>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
