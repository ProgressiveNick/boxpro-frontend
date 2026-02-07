import Image from "next/image";
import styles from "./FilterDrawer.module.scss";
import { FilterPrice } from "../filter-price/FilterPrice";
import { FilterCategory } from "../filter-category/FilterCategory";
import { FilterAttributes } from "../filter-attributes/FilterAttributes";
import { useEffect, useState, useMemo } from "react";

import { FilterProps, FilterState } from "../../model/types";
import {
  isFiltersChanged,
  hasActiveFilters as checkHasActiveFilters,
} from "@/widgets/products-catalog/lib/utils";

export function FilterDrawer({
  isOpen,
  onClose,
  onChange,
  categories,
  filters,
  reset,
  attributes,
}: FilterProps) {
  const [selectFilters, setSelectFilters] = useState<FilterState>(filters);
  const [filtersSelected, setFiltersSelected] = useState(false);

  // Фикс: синхронизация локального состояния с пропсом filters
  useEffect(() => {
    setSelectFilters(filters);
  }, [filters]);

  // Вычисляем изменения фильтров с использованием useMemo
  // Это предотвращает лишние пересчеты и бесконечные циклы
  const hasFiltersChanged = useMemo(() => {
    return isFiltersChanged(selectFilters, filters);
  }, [
    selectFilters.price.priceMin,
    selectFilters.price.priceMax,
    // Используем JSON.stringify для глубокого сравнения массивов и объектов
    JSON.stringify(selectFilters.categories),
    JSON.stringify(selectFilters.attributes),
    filters.price.priceMin,
    filters.price.priceMax,
    JSON.stringify(filters.categories),
    JSON.stringify(filters.attributes),
  ]);

  useEffect(() => {
    setFiltersSelected(hasFiltersChanged);
  }, [hasFiltersChanged]);

  function closeDrawer() {
    setSelectFilters(filters);
    setFiltersSelected(false);
    onClose();
  }

  function closeDrawerAndApply() {
    onChange(selectFilters);
    onClose();
  }

  return (
    <>
      <div className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
        <div className={styles.drawerContent}>
          <div className={styles.head}>
            <h3>Фильтры</h3>
            <Image
              src="/icons/close.svg"
              className={styles.closeButton}
              onClick={onClose}
              width={24}
              height={24}
              alt=""
            />
          </div>

          <div className={styles.filtersArea}>
            <FilterPrice
              filters={selectFilters}
              setFilters={setSelectFilters}
            />

            {categories.length > 0 && (
              <FilterCategory
                name="Категории"
                data={categories}
                searching={true}
                filters={selectFilters}
                setFilters={setSelectFilters}
              />
            )}

            {attributes && attributes.length > 0 && (
              <FilterAttributes
                attributes={attributes}
                filters={selectFilters}
                setFilters={setSelectFilters}
              />
            )}
          </div>

          <div className={styles.buttonsArea}>
            <button
              className={`${styles.applyButton} ${
                !filtersSelected ? styles.disabled : ""
              }`}
              onClick={() => (filtersSelected ? closeDrawerAndApply() : null)}
            >
              Применить
            </button>

            {checkHasActiveFilters(filters) && (
              <button className={styles.applyButton} onClick={reset}>
                Сбросить фильтры
              </button>
            )}
          </div>
        </div>
      </div>

      {isOpen && <div className={styles.drawerOverlay} onClick={closeDrawer} />}
    </>
  );
}
