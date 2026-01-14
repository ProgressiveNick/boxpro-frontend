"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./RangeLine.module.scss";

type RangeLineProps = {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  unit?: string;
};

export function RangeLine({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  unit = "",
}: RangeLineProps) {
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const getValueFromPercentage = useCallback(
    (percentage: number) => {
      return min + (percentage / 100) * (max - min);
    },
    [min, max]
  );

  const handleMouseDown = (type: "min" | "max") => {
    setIsDragging(type);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );
      const value = Math.round(getValueFromPercentage(percentage));

      if (isDragging === "min") {
        const newMin = Math.min(value, valueMax - 1);
        onChange(newMin, valueMax);
      } else {
        const newMax = Math.max(value, valueMin + 1);
        onChange(valueMin, newMax);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    valueMin,
    valueMax,
    min,
    max,
    onChange,
    getValueFromPercentage,
  ]);

  const minPercentage = getPercentage(valueMin);
  const maxPercentage = getPercentage(valueMax);

  return (
    <div className={styles.rangeLine} ref={sliderRef}>
      <div className={styles.track}>
        <div
          className={styles.activeTrack}
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />
        <div
          className={styles.handle}
          style={{ left: `${minPercentage}%` }}
          onMouseDown={() => handleMouseDown("min")}
        >
          <span className={styles.tooltip}>
            {valueMin}
            {unit}
          </span>
        </div>
        <div
          className={styles.handle}
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={() => handleMouseDown("max")}
        >
          <span className={styles.tooltip}>
            {valueMax}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
