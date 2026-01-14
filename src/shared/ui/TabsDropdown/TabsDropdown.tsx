"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./TabsDropdown.module.scss";

type TabsDropdownOption = {
  id: string;
  label: string;
  value: number | undefined;
};

type TabsDropdownProps = {
  name: string;
  unit?: string;
  options: TabsDropdownOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
};

export function TabsDropdown({
  name,
  unit = "",
  options,
  selectedIds,
  onChange,
}: TabsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (id: string) => {
    // Разбиваем id на массив, если он содержит запятые (для number фильтров)
    const idArray = id.includes(",") ? id.split(",").filter(Boolean) : [id];

    // Логирование для отладки
    if (id.includes(",")) {
      console.log(
        `[TabsDropdown] Toggling option with multiple ids: ${id}, split into:`,
        idArray
      );
    }

    // Проверяем, выбрана ли опция (хотя бы один id из массива присутствует)
    const isSelected = idArray.some((singleId) =>
      selectedIds.includes(singleId)
    );

    if (isSelected) {
      // Удаляем все id из выбранных
      const newSelectedIds = selectedIds.filter(
        (selectedId) => !idArray.includes(selectedId)
      );
      console.log(
        `[TabsDropdown] Removing ids, new selectedIds:`,
        newSelectedIds
      );
      onChange(newSelectedIds);
    } else {
      // Добавляем все id в выбранные
      const newIds = [...selectedIds];
      idArray.forEach((singleId) => {
        if (!newIds.includes(singleId)) {
          newIds.push(singleId);
        }
      });
      console.log(`[TabsDropdown] Adding ids, new selectedIds:`, newIds);
      onChange(newIds);
    }
  };

  return (
    <div className={styles.tabsDropdown} ref={dropdownRef}>
      <div
        className={`${styles.header} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.title}>
          {name}
          {unit && `, ${unit}`}
        </span>
        <span className={`${styles.arrow} ${isOpen ? styles.open : ""}`}>
          <ChevronDown size={16} />
        </span>
      </div>

      {isOpen && (
        <div className={styles.content}>
          <div className={styles.selectedText}>
            {selectedIds.length > 0
              ? `Выбрано: ${selectedIds.length}`
              : "Ничего не выбрано"}
          </div>
          <div className={styles.tabs}>
            {options.map((option) => {
              // Проверяем, выбрана ли опция (хотя бы один id из массива присутствует)
              const optIdArray = option.id.includes(",")
                ? option.id.split(",").filter(Boolean)
                : [option.id];
              const isSelected = optIdArray.some((singleId) =>
                selectedIds.includes(singleId)
              );
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.tab} ${
                    isSelected ? styles.selected : ""
                  }`}
                  onClick={() => toggleOption(option.id)}
                >
                  {option.label}
                  {unit && ` ${unit}`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
