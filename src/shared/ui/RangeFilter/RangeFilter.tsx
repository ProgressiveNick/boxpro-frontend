 "use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./RangeFilter.module.scss";
import { RangeLine } from "../RangeLine";

type RangeFilterProps = {
  name: string;
  unit?: string;
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
};

export function RangeFilter({
  name,
  unit = "",
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: RangeFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), valueMax - 1);
    onChange(newMin, valueMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), valueMin + 1);
    onChange(valueMin, newMax);
  };

  return (
    <div className={styles.rangeFilter}>
      <div className={styles.header} onClick={toggleExpand}>
        <span className={styles.title}>
          {name}
          {unit && `, ${unit}`}
        </span>
        <span
          className={`${styles.toggleIcon} ${
            isExpanded ? styles.open : ""
          }`}
        >
          <ChevronDown size={16} />
        </span>
      </div>
      {isExpanded && (
        <div className={styles.content}>
          <RangeLine
            min={min}
            max={max}
            valueMin={valueMin}
            valueMax={valueMax}
            onChange={onChange}
            unit={unit}
          />
          <div className={styles.inputGroup}>
            <div className={styles.inputItem}>
              <label className={styles.label} htmlFor={`${name}-min`}>
                От
              </label>
              <input
                id={`${name}-min`}
                type="number"
                value={valueMin}
                min={min}
                max={valueMax - 1}
                onChange={handleMinChange}
                className={styles.input}
              />
            </div>
            <div className={styles.inputItem}>
              <label className={styles.label} htmlFor={`${name}-max`}>
                До
              </label>
              <input
                id={`${name}-max`}
                type="number"
                value={valueMax}
                min={valueMin + 1}
                max={max}
                onChange={handleMaxChange}
                className={styles.input}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


