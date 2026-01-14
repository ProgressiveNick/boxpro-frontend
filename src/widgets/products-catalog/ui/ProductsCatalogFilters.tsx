"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./ProductsCatalogFilters.module.scss";
import { FilterPrice } from "@/widgets/filters";
import { FilterAttributes } from "@/widgets/filters/ui/filter-attributes";
import { ProductsCatalogFiltersProps } from "../model/types";
import { DEFAULT_FILTERS } from "../lib/constants";
import {
  hasActiveFilters,
  isFiltersChanged,
  initializeFilters,
} from "../lib/utils";
import { createFiltersQueryString } from "../lib/url-utils";
import { FilterState } from "@/widgets/filters";

export function ProductsCatalogFilters({
  initialFilters,
  attributes,
  onFilterApply,
}: Omit<ProductsCatalogFiltersProps, "categories" | "currentCategoryId">) {
  const router = useRouter();
  const [appliedFilters, setAppliedFilters] = useState(() =>
    initializeFilters(initialFilters)
  );
  const [tempFilters, setTempFilters] = useState(() =>
    initializeFilters(initialFilters)
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const applyFilters = () => {
    setAppliedFilters(tempFilters);
    if (onFilterApply) {
      onFilterApply();
    }
    updateURL(tempFilters);
  };

  const updateURL = (filtersToApply: FilterState) => {
    const queryString = createFiltersQueryString(filtersToApply);
    const currentUrl = new URL(window.location.href);
    currentUrl.search = queryString ? `?${queryString}` : "";
    currentUrl.searchParams.delete("page");
    router.push(currentUrl.pathname + currentUrl.search);
  };

  const handleFilterReset = () => {
    setTempFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    if (typeof window !== "undefined") {
      router.push(window.location.pathname);
    }
  };
  const handleFiltersChangeAndApply = (nextFilters: FilterState) => {
    setTempFilters(nextFilters);
    setAppliedFilters(nextFilters);
    updateURL(nextFilters);
  };

  const activeChips: { id: string; label: string; onRemove: () => void }[] = [];

  // Цена
  if (
    appliedFilters.price.priceMin !== DEFAULT_FILTERS.price.priceMin ||
    appliedFilters.price.priceMax !== DEFAULT_FILTERS.price.priceMax
  ) {
    activeChips.push({
      id: "price",
      label: `Цена: ${appliedFilters.price.priceMin}–${appliedFilters.price.priceMax} ₽`,
      onRemove: () => {
        const next = {
          ...appliedFilters,
          price: {
            priceMin: DEFAULT_FILTERS.price.priceMin,
            priceMax: DEFAULT_FILTERS.price.priceMax,
          },
        };
        handleFiltersChangeAndApply(next);
      },
    });
  }

  // Атрибуты
  if (attributes && appliedFilters.attributes) {
    for (const attr of attributes) {
      const current = appliedFilters.attributes[attr.id];
      if (!current) continue;

      // numberValues и stringValues – группируем по значению, а не по external_id
      if (current.numberValues && current.numberValues.length > 0) {
        // Группируем выбранные external_id по значению
        const valueGroups = new Map<number, string[]>(); // value -> [external_ids]

        current.numberValues.forEach((valId) => {
          // Ищем valueMeta, учитывая что v.id может содержать несколько id через запятую
          const valueMeta = attr.values.find((v) => {
            if (v.id === valId) return true;
            if (v.id.includes(",")) {
              return v.id.split(",").includes(valId);
            }
            return false;
          });

          if (valueMeta && valueMeta.value !== undefined) {
            const value = valueMeta.value;
            if (!valueGroups.has(value)) {
              valueGroups.set(value, []);
            }
            const ids = valueGroups.get(value)!;
            if (!ids.includes(valId)) {
              ids.push(valId);
            }
          }
        });

        // Создаем один чип для каждого уникального значения
        valueGroups.forEach((externalIds, value) => {
          const valueLabel = String(value);

          activeChips.push({
            id: `attr-${attr.id}-num-${value}`,
            label: `${attr.name}: ${valueLabel}${
              attr.unit ? ` ${attr.unit}` : ""
            }`,
            onRemove: () => {
              const nextAttributes = { ...appliedFilters.attributes };
              const nextValue = {
                ...nextAttributes[attr.id],
                // Удаляем все external_id, связанные с этим значением
                numberValues: (
                  nextAttributes[attr.id].numberValues || []
                ).filter((id) => !externalIds.includes(id)),
              };
              if (
                !nextValue.numberValues ||
                nextValue.numberValues.length === 0
              ) {
                delete nextAttributes[attr.id];
              } else {
                nextAttributes[attr.id] = nextValue;
              }

              const next = {
                ...appliedFilters,
                attributes: nextAttributes,
              };
              handleFiltersChangeAndApply(next);
            },
          });
        });
      }

      if (current.stringValues && current.stringValues.length > 0) {
        current.stringValues.forEach((valId) => {
          // Ищем valueMeta, учитывая что v.id может содержать несколько id через запятую
          const valueMeta = attr.values.find((v) => {
            if (v.id === valId) return true;
            if (v.id.includes(",")) {
              return v.id.split(",").includes(valId);
            }
            return false;
          });
          const valueLabel = valueMeta?.label ?? String(valId);

          activeChips.push({
            id: `attr-${attr.id}-str-${valId}`,
            label: `${attr.name}: ${valueLabel}`,
            onRemove: () => {
              const nextAttributes = { ...appliedFilters.attributes };
              const nextValue = {
                ...nextAttributes[attr.id],
                stringValues: (
                  nextAttributes[attr.id].stringValues || []
                ).filter((id) => id !== valId),
              };
              if (
                !nextValue.stringValues ||
                nextValue.stringValues.length === 0
              ) {
                delete nextAttributes[attr.id];
              } else {
                nextAttributes[attr.id] = nextValue;
              }

              const next = {
                ...appliedFilters,
                attributes: nextAttributes,
              };
              handleFiltersChangeAndApply(next);
            },
          });
        });
      }

      if (current.rangeMin !== undefined || current.rangeMax !== undefined) {
        activeChips.push({
          id: `attr-${attr.id}-range`,
          label: `${attr.name}: ${current.rangeMin ?? ""}–${
            current.rangeMax ?? ""
          }${attr.unit ? ` ${attr.unit}` : ""}`,
          onRemove: () => {
            const nextAttributes = { ...appliedFilters.attributes };
            const nextValue = {
              ...nextAttributes[attr.id],
              rangeMin: undefined,
              rangeMax: undefined,
            };

            // Если после очистки нет других значений, убираем весь атрибут
            if (
              !nextValue.numberValues &&
              !nextValue.stringValues &&
              nextValue.rangeMin === undefined &&
              nextValue.rangeMax === undefined
            ) {
              delete nextAttributes[attr.id];
            } else {
              nextAttributes[attr.id] = nextValue;
            }

            const next = {
              ...appliedFilters,
              attributes: nextAttributes,
            };
            handleFiltersChangeAndApply(next);
          },
        });
      }
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Фильтры</h3>
        <button
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          type="button"
        >
          <span className={styles.toggleButtonText}>Фильтры</span>
          {isExpanded ? (
            <ChevronUp className={styles.toggleIcon} size={20} />
          ) : (
            <ChevronDown className={styles.toggleIcon} size={20} />
          )}
        </button>

        {activeChips.length > 0 && (
          <div className={styles.activeFilters}>
            {activeChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                className={styles.chip}
                onClick={chip.onRemove}
              >
                <span className={styles.chipLabel}>{chip.label}</span>
                <X className={styles.chipIcon} size={14} />
              </button>
            ))}
          </div>
        )}

        <div className={styles.headerActions}>
          {hasActiveFilters(appliedFilters) && (
            <button className={styles.resetButton} onClick={handleFilterReset}>
              Сбросить фильтры
            </button>
          )}
          {isFiltersChanged(appliedFilters, tempFilters) && (
            <button className={styles.applyButton} onClick={applyFilters}>
              Применить
            </button>
          )}
        </div>
      </div>

      <div
        className={`${styles.filters} ${
          isExpanded ? styles.filtersExpanded : ""
        }`}
      >
        <FilterPrice filters={tempFilters} setFilters={setTempFilters} />

        {attributes && attributes.length > 0 && (
          <FilterAttributes
            attributes={attributes}
            filters={tempFilters}
            setFilters={setTempFilters}
          />
        )}
      </div>
    </div>
  );
}
