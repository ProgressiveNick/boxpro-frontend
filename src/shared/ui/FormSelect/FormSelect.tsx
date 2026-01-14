import React from "react";
import styles from "./FormSelect.module.scss";

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
}

export function FormSelect({
  value,
  onChange,
  options,
  placeholder,
  error,
  className,
}: FormSelectProps) {
  return (
    <div className={styles.container}>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${styles.select} ${error ? styles.error : ""} ${
          className || ""
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
