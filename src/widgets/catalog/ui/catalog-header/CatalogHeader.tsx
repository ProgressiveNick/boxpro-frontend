import styles from "./CatalogHeader.module.scss";
import Image from "next/image";
import { useEffect, useState } from "react";

// import { AttributeValue } from "@/entities/product-attributes";

import { useRouter } from "next/navigation";
import { Category } from "@/entities/categories";
import { FilterDrawer, FilterState } from "@/widgets/filters";
import { AttributeValue } from "@/entities/product-attributes";

type Props = {
  propsFilters?: FilterState;
  total: number;
  attributes: AttributeValue[];
  categories: Category[];
};

export default function CatalogHeader({
  propsFilters,
  total,
  // attributes,
  categories,
}: Props) {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(
    propsFilters
      ? propsFilters
      : {
          price: {
            priceMin: 0,
            priceMax: 1000000,
          },
          categories: [],
        }
  );
  const [isFirstRender, setIsFirsRender] = useState(true);

  const allCategories = (categories: Category[]): Category[] => {
    const res: Category[] = [];
    const addedIds = new Set<number>();

    function mappingCategories(category: Category) {
      // Добавляем категорию только если её ID ещё не добавлен
      if (!addedIds.has(category.id)) {
        res.push(category);
        addedIds.add(category.id);
      }

      // Рекурсивно обрабатываем дочерние категории
      if (category.childs) {
        category.childs.forEach((child) => {
          mappingCategories(child);
        });
      }
    }

    categories.forEach((category) => {
      mappingCategories(category);
    });

    return res;
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters({
      price: {
        priceMin: 0,
        priceMax: 10000000,
      },
      categories: [],
    });
    router.push("");
    setIsFilterOpen(false);
  };

  useEffect(() => {
    let params: string[] = [];

    if (filters.categories && filters.categories.length > 0) {
      const categoryParams = filters.categories.map(
        (documentId: string) => `categories=${documentId}`
      );
      params = params.concat(categoryParams);
    }

    // Цена
    if (filters.price) {
      params.push(`priceMin=${filters.price.priceMin}`);
      params.push(`priceMax=${filters.price.priceMax}`);
    }

    const queryString = params.join("&");

    if (!isFirstRender) {
      router.push(`?${queryString}`);
    } else {
      setIsFirsRender(false);
    }
  }, [filters, isFirstRender, router]);

  return (
    <div className={styles.resultHead}>
      <p className={styles.countProducts}>Товаров: {total}</p>
      <Image
        src="/icons/filter.svg"
        width={32}
        height={32}
        alt=""
        className={styles.icon}
        onClick={() => setIsFilterOpen(true)}
      />

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onChange={handleFilterChange}
        categories={allCategories(categories)} // TODO: Добавить категории
        data={[]} // TODO: Добавить данные о товарах
        filters={filters}
        reset={handleFilterReset}
      />
    </div>
  );
}
