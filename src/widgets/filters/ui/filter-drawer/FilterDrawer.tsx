import Image from "next/image";
import styles from "./FilterDrawer.module.scss";
import { FilterPrice } from "../filter-price/FilterPrice";
import { FilterCategory } from "../filter-category/FilterCategory";
import { useEffect, useState, useMemo } from "react";

import { FilterProps, FilterState } from "../../model/types";
import { ProductType } from "@/entities/product";
import { isFiltersChanged } from "@/widgets/products-catalog/lib/utils";

export function FilterDrawer({
  isOpen,
  onClose,
  onChange,
  categories,
  data,
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

  const groupCharacteristics = (
    products: ProductType[]
  ): Record<string, string[]> => {
    const grouped: Record<string, Set<string>> = {};

    products.forEach((product) => {
      if (!product.harakteristici) return;

      product.harakteristici.forEach((attributeValue) => {
        // Проверяем, что harakteristica существует и не null
        if (!attributeValue.harakteristica || !attributeValue.harakteristica.name) {
          return; // Пропускаем, если нет характеристики или её названия
        }
        
        const characteristicName = attributeValue.harakteristica.name;
        const characteristicValue =
          attributeValue.string_value ||
          attributeValue.number_value?.toString() ||
          "";

        if (!grouped[characteristicName]) {
          grouped[characteristicName] = new Set();
        }
        if (characteristicValue) {
          grouped[characteristicName].add(characteristicValue);
        }
      });
    });

    const groupedArray: Record<string, string[]> = {};
    for (const [key, values] of Object.entries(grouped)) {
      if (values.size > 1) {
        groupedArray[key] = Array.from(values);
      }
    }

    return groupedArray;
  };

  function closeDrawer() {
    setSelectFilters(filters);
    setFiltersSelected(false);
    onClose();
  }

  function closeDrawerAndApply() {
    onChange(selectFilters);
    onClose();
  }

  function hasActiveFilters(filters: FilterState) {
    const hasCategories = filters.categories?.length > 0;
    const hasPrice =
      filters.price.priceMin !== 0 || filters.price.priceMax !== 10000000;

    return hasCategories || hasPrice;
  }

  const groupedCharacteristics = groupCharacteristics(
    data as unknown as ProductType[]
  );

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
            <FilterPrice filters={selectFilters} setFilters={setSelectFilters} />

            <FilterCategory
              name="Категории"
              data={categories}
              searching={true}
              filters={selectFilters}
              setFilters={setSelectFilters}
            />

            {Object.entries(groupedCharacteristics).map(
              ([name, values], index) => {
                // Находим attrId по названию характеристики
                const attr = attributes?.find((a) => a.name === name);
                const attrId = attr?.id;

                // Создаем маппинг значений на external_id
                const valueToExternalIdMap = new Map<string, string>();
                if (attr && attr.values) {
                  attr.values.forEach((val) => {
                    // Для string используем label, для number - value
                    const valueKey = val.label || String(val.value || "");
                    if (valueKey && val.id) {
                      // Сохраняем маппинг для точного совпадения
                      valueToExternalIdMap.set(valueKey, val.id);
                      // Также сохраняем нормализованную версию (trim, lowercase)
                      const normalizedKey = valueKey.trim().toLowerCase();
                      if (normalizedKey !== valueKey) {
                        valueToExternalIdMap.set(normalizedKey, val.id);
                      }
                      // Для number также сохраняем числовое значение как строку
                      if (val.value !== undefined && typeof val.value === 'number') {
                        const numKey = String(val.value);
                        valueToExternalIdMap.set(numKey, val.id);
                      }
                    }
                  });
                }

                return (
                  <FilterCategory
                    key={attrId || `attr-${index}`}
                    name={name}
                    data={values}
                    searching={false}
                    filters={selectFilters}
                    setFilters={setSelectFilters}
                    attrId={attrId}
                    valueToExternalIdMap={valueToExternalIdMap}
                  />
                );
              }
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

            {hasActiveFilters(filters) && (
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
