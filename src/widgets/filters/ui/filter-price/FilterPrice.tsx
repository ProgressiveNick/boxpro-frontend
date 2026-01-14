import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { RangeLine } from "@/shared/ui/RangeLine";
import styles from "./FilterPrice.module.scss";
import { FilterState } from "../../model/types";

type FilterPriceProps = {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
};

export function FilterPrice({ filters, setFilters }: FilterPriceProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const MIN_PRICE = 0;
    const MAX_PRICE = 1000000;

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={styles.priceFilter}>
            <div className={styles.header} onClick={toggleExpand}>
              <span className={styles.title}>Цена (₽)</span>
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
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        valueMin={filters.price.priceMin}
                        valueMax={filters.price.priceMax}
                        unit="₽"
                        onChange={(min, max) =>
                            setFilters({
                                ...filters,
                                price: {
                                    ...filters.price,
                                    priceMin: min,
                                    priceMax: max,
                                },
                            })
                        }
                    />
                    <div className={styles.inputGroup}>
                        <div className={styles.inputItem}>
                            <label className={styles.label} htmlFor="minPrice">
                                От
                            </label>
                            <input
                                id="minPrice"
                                type="number"
                                value={filters.price.priceMin}
                                min={0}
                                onChange={(e) => {
                                    setFilters({
                                        ...filters,
                                        price: {
                                            ...filters.price,
                                            priceMin: Number(e.target.value),
                                        },
                                    });
                                }}
                                placeholder="0"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputItem}>
                            <label className={styles.label} htmlFor="maxPrice">
                                До
                            </label>
                            <input
                                id="maxPrice"
                                type="number"
                                value={filters.price.priceMax}
                                onChange={(e) => {
                                    setFilters({
                                        ...filters,
                                        price: {
                                            ...filters.price,
                                            priceMax: Number(e.target.value),
                                        },
                                    });
                                }}
                                min={1}
                                max={1000000}
                                placeholder="1.000.000"
                                className={styles.input}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
