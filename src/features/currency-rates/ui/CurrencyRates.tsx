"use client";

import { useEffect, useState } from "react";
import styles from "./CurrencyRates.module.scss";

type CurrencyRate = {
  code: string;
  name: string;
  value: number;
  nominal: number;
};

type CurrencyRatesResponse = {
  date: string;
  rates: CurrencyRate[];
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  CNY: "¥",
};

const AVAILABLE_CURRENCIES = ["USD", "CNY"];

export function CurrencyRates() {
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [currentRate, setCurrentRate] = useState<CurrencyRate | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/currency-rates?codes=${selectedCurrency}`
        );
        const data: CurrencyRatesResponse = await response.json();
        if (data.rates && data.rates.length > 0) {
          setCurrentRate(data.rates[0]);
        }
      } catch (error) {
        console.error("Error fetching currency rates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
    // Обновляем курсы каждый час
    const interval = setInterval(fetchRates, 3600000);
    return () => clearInterval(interval);
  }, [selectedCurrency]);

  const handleRateClick = () => {
    setIsOpen(true);
  };

  const handleCurrencyClick = (code: string) => {
    setSelectedCurrency(code);
    setIsOpen(false);
  };

  const formatRate = (rate: CurrencyRate) => {
    const ratePerUnit = rate.value / rate.nominal;
    return ratePerUnit.toFixed(2);
  };

  if (isLoading && !currentRate) {
    return (
      <div className={styles.container}>
        <div className={styles.rates}>Загрузка...</div>
      </div>
    );
  }

  if (!currentRate) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.rates} onClick={handleRateClick}>
        <div className={styles.rateItem}>
          <span className={styles.symbol}>
            {CURRENCY_SYMBOLS[currentRate.code] || currentRate.code}
          </span>
          <span className={styles.value}>{formatRate(currentRate)}</span>
        </div>
      </div>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.dropdown}>
            {AVAILABLE_CURRENCIES.map((code) => (
              <button
                key={code}
                className={`${styles.currencyOption} ${
                  selectedCurrency === code ? styles.selected : ""
                }`}
                onClick={() => handleCurrencyClick(code)}
              >
                <span className={styles.optionSymbol}>
                  {CURRENCY_SYMBOLS[code] || code}
                </span>
                <span className={styles.optionCode}>{code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
