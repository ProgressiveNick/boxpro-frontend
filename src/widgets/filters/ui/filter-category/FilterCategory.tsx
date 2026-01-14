import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./FilterCategory.module.scss";
import { FilterState } from "../../model/types";

type FilterCategoryProps = {
  name: string;
  data: unknown[];
  searching: boolean;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  // Для характеристик: если указан attrId, значения сохраняются в attributes, а не в categories
  attrId?: string;
  // Для характеристик: маппинг значений на external_id
  valueToExternalIdMap?: Map<string, string>;
};

export function FilterCategory({
  name,
  data,
  searching,
  filters,
  setFilters,
  attrId,
  valueToExternalIdMap,
}: FilterCategoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  function handleCheckboxChange(category: unknown) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      
      // Если это характеристика (указан attrId), работаем с attributes
      if (attrId) {
        const value = typeof category === "string" ? category : String(category);
        // Находим external_id для этого значения
        // Сначала пробуем точное совпадение, затем нормализованное
        let externalId = valueToExternalIdMap?.get(value);
        if (!externalId) {
          const normalizedValue = value.trim().toLowerCase();
          externalId = valueToExternalIdMap?.get(normalizedValue);
        }
        // Если не нашли, используем само значение (fallback)
        if (!externalId) {
          externalId = value;
        }
        
        setFilters((prev: FilterState) => {
          const currentAttr = prev.attributes?.[attrId] || {};
          const currentValues = currentAttr.stringValues || [];
          
          let newValues: string[];
          if (checked) {
            if (!currentValues.includes(externalId)) {
              newValues = [...currentValues, externalId];
            } else {
              newValues = currentValues;
            }
          } else {
            newValues = currentValues.filter((v: string) => v !== externalId);
          }

          return {
            ...prev,
            attributes: {
              ...prev.attributes,
              [attrId]: {
                ...currentAttr,
                stringValues: newValues.length > 0 ? newValues : undefined,
              },
            },
          };
        });
        return;
      }
      
      // Иначе работаем с categories (для категорий)
      const isString = typeof category === "string";
      const categoryData = isString 
        ? null 
        : (category as { documentId?: string; id?: number });
      
      // Для строк используем саму строку как ID, для объектов - documentId или id
      const categoryId = isString 
        ? category as string
        : (categoryData?.documentId || String(categoryData?.id || ""));

      if (!categoryId) {
        return;
      }

      setFilters((prev: FilterState) => {
        const categories = prev.categories || [];

        let newCategories: string[];
        if (checked) {
          if (!categories.includes(categoryId)) {
            newCategories = [...categories, categoryId];
          } else {
            newCategories = categories;
          }
        } else {
          newCategories = categories.filter((id: string) => id !== categoryId);
        }

        return {
          ...prev,
          categories: newCategories,
        };
      });
    };
  }

  const filteredCategories = data.filter((category) => {
    const categoryData = category as { name?: string };
    return searching
      ? categoryData.name?.toLowerCase().includes(searchValue.toLowerCase())
      : true;
  });

  const toggleOpen = () => setIsOpen((prevState) => !prevState);

  return (
    <div className={styles.categoryFilter}>
      <div className={styles.header} onClick={toggleOpen}>
        <span>{name}</span>
        <span
          className={`${styles.toggleIcon} ${isOpen ? styles.open : ""}`}
        >
          <ChevronDown size={16} />
        </span>
      </div>

      {isOpen && (
        <div className={styles.content}>
          {searching && (
            <input
              type="text"
              placeholder="Найти в списке"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={styles.searchInput}
            />
          )}

          <div className={styles.categoryList}>
            {filteredCategories.map((category, index) => {
              // Определяем тип данных: объект (категория) или строка (значение характеристики)
              const isString = typeof category === "string";
              const categoryData = isString 
                ? null 
                : (category as {
                    documentId?: string;
                    id?: number;
                    name?: string;
                  });
              
              // Для строк используем саму строку как ID, для объектов - documentId или id
              const categoryId = isString 
                ? (category as string)
                : (categoryData?.documentId || String(categoryData?.id || ""));
              
              // Для отображения: для строк используем саму строку, для объектов - name
              const displayName = isString 
                ? (category as string)
                : (categoryData?.name || String(category));

              // Определяем, выбран ли элемент
              // Для характеристик нужно проверить по external_id
              const isChecked = attrId
                ? (() => {
                    // Находим external_id для этого значения
                    let externalId = valueToExternalIdMap?.get(categoryId);
                    if (!externalId) {
                      const normalizedValue = categoryId.trim().toLowerCase();
                      externalId = valueToExternalIdMap?.get(normalizedValue);
                    }
                    if (!externalId) {
                      externalId = categoryId;
                    }
                    return (filters.attributes?.[attrId]?.stringValues || []).includes(externalId);
                  })()
                : (categoryId ? filters.categories.includes(categoryId) : false);

              return (
                <label
                  key={categoryId || `item-${index}`}
                  className={styles.categoryItem}
                >
                  <input
                    type="checkbox"
                    onChange={handleCheckboxChange(category)}
                    checked={isChecked}
                  />
                  <span>{displayName}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
