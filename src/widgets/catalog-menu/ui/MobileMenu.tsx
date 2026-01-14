"use client";

import { Category, CategoryMenuItem } from "@/entities/categories";
import styles from "./MobileMenu.module.scss";
import Image from "next/image";
import { useState } from "react";
import { useCatalogMenuStore } from "../model";

export function MobileMenu({ categories }: { categories: Category[] }) {
  const { setIsOpen } = useCatalogMenuStore();
  const [openCategory, setOpenCategory] = useState<Category | null>(null);
  const [openSubCategory, setOpenedSubCategory] = useState<Category | null>(
    null
  );

  const resetOpenCategory = () => {
    setOpenCategory(null);
    setOpenedSubCategory(null);
  };

  const resetOpenSubCategory = () => {
    setOpenedSubCategory(null);
  };

  const handleCategoryClick = () => {
    setIsOpen(false);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        {!openCategory && !openSubCategory && (
          <h2 className={styles.title}>Каталог</h2>
        )}

        {openCategory && !openSubCategory && (
          <>
            <div
              className={styles.resetButton}
              onClick={() => resetOpenCategory()}
            >
              <Image
                src={"/icons/ArrowLeft.svg"}
                width={32}
                height={32}
                alt=""
              />
              <p>Назад</p>
            </div>
            <h2 className={styles.title}>{openCategory.name}</h2>
          </>
        )}

        {openSubCategory && (
          <>
            <div
              className={styles.resetButton}
              onClick={() => resetOpenSubCategory()}
            >
              <Image
                src={"/icons/ArrowLeft.svg"}
                width={32}
                height={32}
                alt=""
              />
              <p>Назад</p>
            </div>
            <h2 className={styles.title}>{openSubCategory.name}</h2>
          </>
        )}
        <div className={styles.categoryList}>
          {!openCategory &&
            !openSubCategory &&
            categories.map((category) => (
              <div className={styles.categoryItem} key={category.id}>
                <CategoryMenuItem
                  category={category}
                  allCategories={categories}
                  className={styles.customCard}
                  showArrow={category.childs && category.childs?.length > 0}
                  onArrowClick={() => setOpenCategory(category)}
                  onClick={handleCategoryClick}
                />
              </div>
            ))}

          {openCategory &&
            !openSubCategory &&
            openCategory.childs?.map((category) => (
              <div className={styles.categoryItem} key={category.id}>
                <CategoryMenuItem
                  category={category}
                  allCategories={categories}
                  className={styles.customCard}
                  showArrow={category.childs && category.childs?.length > 0}
                  onArrowClick={() => setOpenedSubCategory(category)}
                  onClick={handleCategoryClick}
                />
              </div>
            ))}

          {openCategory &&
            openSubCategory &&
            openSubCategory.childs?.map((category) => (
              <div className={styles.categoryItem} key={category.id}>
                <CategoryMenuItem
                  category={category}
                  allCategories={categories}
                  className={styles.customCard}
                  showArrow={category.childs && category.childs?.length > 0}
                  onArrowClick={() => setOpenedSubCategory(category)}
                  onClick={handleCategoryClick}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
