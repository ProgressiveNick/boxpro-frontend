"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./CurrencyRate.module.scss";

type CurrencyRateData = {
  value: number;
  nominal: number;
  charCode: string;
};

type CurrencyOption = {
  id: string;
  code: string;
  symbol: string;
  name: string;
};

const CURRENCY_OPTIONS: CurrencyOption[] = [
  { id: "R01235", code: "USD", symbol: "$", name: "Доллар США" },
  { id: "R01375", code: "CNY", symbol: "¥", name: "Китайский юань" },
];

export function CurrencyRate() {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(CURRENCY_OPTIONS[0]);
  const [rate, setRate] = useState<CurrencyRateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRate = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/currency/${selectedCurrency.id}`);
        if (response.ok) {
          const data = await response.json();
          setRate({
            value: data.value,
            nominal: data.nominal,
            charCode: data.charCode,
          });
        }
      } catch (error) {
        console.error("Failed to fetch currency rate:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRate();
    
    // Обновляем курс каждый час
    const interval = setInterval(fetchRate, 3600000);
    
    return () => clearInterval(interval);
  }, [selectedCurrency.id]);

  // Закрытие dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCurrencyChange = (currency: CurrencyOption) => {
    setSelectedCurrency(currency);
    setIsDropdownOpen(false);
  };

  if (isLoading && !rate) {
    return (
      <div className={styles.widget}>
        <div 
          className={styles.selector}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className={styles.label}>{selectedCurrency.symbol}</span>
          <span className={styles.value}>...</span>
          <span className={styles.arrow}>{isDropdownOpen ? "▲" : "▼"}</span>
        </div>
      </div>
    );
  }

  if (!rate) {
    return null;
  }

  // Форматируем курс: если nominal > 1, показываем за 1 единицу
  const displayValue = rate.nominal > 1 
    ? (rate.value / rate.nominal).toFixed(2)
    : rate.value.toFixed(2);

  return (
    <div className={styles.widget} ref={dropdownRef}>
      <div 
        className={styles.selector}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span className={styles.label}>{selectedCurrency.symbol}</span>
        <span className={styles.value}>{displayValue} ₽</span>
        <span className={styles.arrow}>{isDropdownOpen ? "▲" : "▼"}</span>
      </div>
      
      {isDropdownOpen && (
        <div className={styles.dropdown}>
          {CURRENCY_OPTIONS.map((currency) => (
            <button
              key={currency.id}
              className={`${styles.dropdownItem} ${
                selectedCurrency.id === currency.id ? styles.active : ""
              }`}
              onClick={() => handleCurrencyChange(currency)}
              type="button"
            >
              <span className={styles.itemSymbol}>{currency.symbol}</span>
              <span className={styles.itemName}>{currency.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

