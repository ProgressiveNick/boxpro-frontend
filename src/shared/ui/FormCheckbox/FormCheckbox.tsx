import React from "react";
import styles from "./FormCheckbox.module.scss";

interface FormCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export function FormCheckbox({
  checked,
  onChange,
  label,
  className,
}: FormCheckboxProps) {
  return (
    <label className={`${styles.checkboxLabel} ${className || ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={styles.checkbox}
      />
      <span className={styles.checkboxText}>{label}</span>
    </label>
  );
}
