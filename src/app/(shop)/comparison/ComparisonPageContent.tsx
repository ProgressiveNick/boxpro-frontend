"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  useComparisonStore,
  type ComparisonItem,
} from "@/entities/comparison/model/store";
import { formattedPrice } from "@/entities/product/lib/formattedPrice";
import { getProductImageUrl } from "@/shared/lib/helpers/imageUrl";
import { Breadcrumbs } from "@/widgets/breadcrumbs";
import styles from "./ComparisonPage.module.scss";

function getUniqueCharacteristicNames(items: ComparisonItem[]): string[] {
  const names = new Set<string>();
  for (const item of items) {
    item.characteristics?.forEach((c) => {
      if (c.name && c.name.trim()) names.add(c.name.trim());
    });
  }
  return Array.from(names);
}

function getCharacteristicValue(
  item: ComparisonItem,
  characteristicName: string
): string | number | undefined {
  const c = item.characteristics?.find(
    (x) => x.name?.trim() === characteristicName.trim()
  );
  return c?.value;
}

export function ComparisonPageContent() {
  const items = useComparisonStore((s) => s.items);
  const removeItem = useComparisonStore((s) => s.removeItem);
  const clearComparison = useComparisonStore((s) => s.clearComparison);

  const characteristicNames = useMemo(
    () => getUniqueCharacteristicNames(items),
    [items]
  );

  const rows = useMemo(() => {
    const r: { key: string; label: string; type: "price" | "characteristic" }[] =
      [{ key: "price", label: "Цена", type: "price" }];
    characteristicNames.forEach((name) => {
      r.push({ key: `attr-${name}`, label: name, type: "characteristic" });
    });
    return r;
  }, [characteristicNames]);

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.breadcrumbsWrapper}>
            <Breadcrumbs name="Сравнение" />
          </div>
          <h1 className={styles.title}>Сравнение товаров</h1>
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              В сравнении ничего нет. Добавляйте товары из каталога.
            </p>
            <Link href="/catalog" className={styles.catalogLink}>
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.breadcrumbsWrapper}>
          <Breadcrumbs name="Сравнение" />
        </div>
        <h1 className={styles.title}>Сравнение товаров</h1>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={clearComparison}
            aria-label="Удалить список"
          >
            <span className={styles.actionIcon} aria-hidden />
            Удалить список
          </button>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colCharacteristic}>Характеристика</th>
                {items.map((item) => (
                  <th key={item.id} className={styles.colProduct}>
                    <div className={styles.productHeader}>
                      <Link
                        href={item.slug ? `/product/${item.slug}` : "#"}
                        className={styles.productName}
                      >
                        {item.title}
                      </Link>
                      <div className={styles.productImageWrapper}>
                        <Image
                          src={getProductImageUrl(item.imageURL)}
                          alt=""
                          width={80}
                          height={80}
                          className={styles.productImage}
                        />
                      </div>
                      <button
                        type="button"
                        className={styles.removeProduct}
                        onClick={() => removeItem(item.id)}
                        aria-label={`Удалить ${item.title} из сравнения`}
                      >
                        Удалить
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className={styles.colCharacteristic}>{row.label}</td>
                  {items.map((item) => (
                    <td key={item.id} className={styles.colProduct}>
                      {row.type === "price"
                        ? formattedPrice(item.price)
                        : String(
                            getCharacteristicValue(item, row.label) ?? "—"
                          )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
