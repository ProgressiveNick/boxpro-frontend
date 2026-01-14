"use client";

import { useState } from "react";
import styles from "./Dropdown.module.scss"; // Импорт модуля SCSS

interface DropdownProps {
  options: string[]; // Массив опций для выпадающего списка
  placeholder?: string; // Текст заглушки
  onSelect: (selected: string) => void; // Callback при выборе опции
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  placeholder = "Select an option",
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false); // Состояние: открыт ли дропдаун
  const [selected, setSelected] = useState<string | null>(null); // Выбранный элемент

  const handleSelect = (option: string) => {
    setSelected(option);
    onSelect(option);
    setIsOpen(false); // Закрыть после выбора
  };

  return (
    <div className={styles.wrapper}>
      {/* Заголовок Dropdown */}
      <div
        className={`${styles.header} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selected || placeholder}</span>
        <span className={styles.arrow}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {/* Список опций */}
      {isOpen && (
        <ul className={styles.options}>
          {options.map((option, index) => (
            <li
              key={index}
              className={styles.option}
              onClick={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
