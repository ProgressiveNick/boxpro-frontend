"use client";

import React, { useState, useEffect } from "react";
import styles from "./PhoneInput.module.scss";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
}

// Утилита для получения полного номера с кодом страны
export const getFullPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `8${digits}`;
  }
  return phone;
};

export function PhoneInput({
  value,
  onChange,
  className,
  error,
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value) {
      const formatted = formatPhoneNumber(value);
      setDisplayValue(formatted);
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const formatPhoneNumber = (phone: string): string => {
    const digits = phone.replace(/\D/g, "");

    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length <= 8)
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    if (digits.length <= 10)
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
        6,
        8
      )}-${digits.slice(8)}`;

    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      8
    )}-${digits.slice(8, 10)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const inputValue = input.value;
    const digits = inputValue.replace(/\D/g, "");

    if (digits.length <= 10) {
      onChange(digits);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const digits = value.replace(/\D/g, "");
      if (digits.length > 0) {
        const newDigits = digits.slice(0, -1);
        onChange(newDigits);
      }
    } else if (e.key === "Delete") {
      e.preventDefault();
      const digits = value.replace(/\D/g, "");
      if (digits.length > 0) {
        const newDigits = digits.slice(0, -1);
        onChange(newDigits);
      }
    } else if (/\d/.test(e.key)) {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 10) {
        const newDigits = digits + e.key;
        onChange(newDigits);
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPos = input.selectionStart || 0;

    // Если кликнули на пустое место, перемещаем курсор к первому свободному символу
    if (cursorPos < 1) {
      const digits = value.replace(/\D/g, "");
      const nextPosition = digits.length;
      input.setSelectionRange(nextPosition, nextPosition);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const digits = value.replace(/\D/g, "");
    const nextPosition = digits.length;
    input.setSelectionRange(nextPosition, nextPosition);
  };

  return (
    <div className={styles.container}>
      <div className={styles.phoneInputContainer}>
        <span className={styles.countryCode}>+7</span>
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
          onFocus={handleFocus}
          className={`${styles.phoneInput} ${error ? styles.error : ""} ${
            className || ""
          }`}
          placeholder=""
          inputMode="numeric"
          autoComplete="tel"
        />
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
