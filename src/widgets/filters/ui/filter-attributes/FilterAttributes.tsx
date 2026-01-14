 "use client";

import styles from "./FilterAttributes.module.scss";
import { RangeFilter, TabsDropdown } from "@/shared/ui";
import type { AttributeFilter } from "@/entities/product-attributes/api/getCategoryAttributes";
import type { FilterState } from "@/widgets/filters/model/types";

type FilterAttributesProps = {
  attributes: AttributeFilter[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
};

export function FilterAttributes({
  attributes,
  filters,
  setFilters,
}: FilterAttributesProps) {
  if (!attributes || attributes.length === 0) {
    return null;
  }

  const handleNumberFilterChange = (attrId: string, selectedIds: string[]) => {
    setFilters({
      ...filters,
      attributes: {
        ...filters.attributes,
        [attrId]: {
          ...filters.attributes?.[attrId],
          numberValues: selectedIds,
        },
      },
    });
  };

  const handleRangeFilterChange = (
    attrId: string,
    min: number,
    max: number
  ) => {
    setFilters({
      ...filters,
      attributes: {
        ...filters.attributes,
        [attrId]: {
          ...filters.attributes?.[attrId],
          rangeMin: min,
          rangeMax: max,
        },
      },
    });
  };

  const handleStringFilterChange = (attrId: string, selectedIds: string[]) => {
    setFilters({
      ...filters,
      attributes: {
        ...filters.attributes,
        [attrId]: {
          ...filters.attributes?.[attrId],
          stringValues: selectedIds,
        },
      },
    });
  };

  return (
    <div className={styles.filterAttributes}>
      {attributes.map((attr) => {
        const currentFilter = filters.attributes?.[attr.id] || {};

        if (attr.type === "number") {
          // Для number используем TabsDropdown
          const options = attr.values.map((val) => ({
            id: val.id,
            label: String(val.value),
            value: val.value,
          }));

          return (
            <TabsDropdown
              key={attr.id}
              name={attr.name}
              unit={attr.unit}
              options={options}
              selectedIds={currentFilter.numberValues || []}
              onChange={(selectedIds) =>
                handleNumberFilterChange(attr.id, selectedIds)
              }
            />
          );
        } else if (attr.type === "range") {
          // Для range используем RangeFilter
          const minValue = Math.min(...attr.values.map((v) => v.min || 0));
          const maxValue = Math.max(...attr.values.map((v) => v.max || 0));
          const currentMin = currentFilter.rangeMin ?? minValue;
          const currentMax = currentFilter.rangeMax ?? maxValue;

          return (
            <RangeFilter
              key={attr.id}
              name={attr.name}
              unit={attr.unit}
              min={minValue}
              max={maxValue}
              valueMin={currentMin}
              valueMax={currentMax}
              onChange={(min, max) =>
                handleRangeFilterChange(attr.id, min, max)
              }
            />
          );
        } else if (attr.type === "string" || attr.type === "boolean") {
          // Для string и boolean используем TabsDropdown в том же стиле, что и number
          const options = attr.values.map((val) => ({
            id: val.id,
            label: val.label || "",
            value: 0,
          }));

          return (
            <TabsDropdown
              key={attr.id}
              name={attr.name}
              unit={attr.unit}
              options={options}
              selectedIds={currentFilter.stringValues || []}
              onChange={(selectedIds) =>
                handleStringFilterChange(attr.id, selectedIds)
              }
            />
          );
        }

        return null;
      })}
    </div>
  );
}
