"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import styles from "./CatalogMenu.module.scss";
import mobileMenuStyles from "./MobileMenu.module.scss";
import { Category, CategoryMenuItem } from "@/entities/categories";
import { useUIStore } from "@/shared/store/useUIStore";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

type CatalogMenuProps = {
  categories: Category[];
};

export function CatalogMenu({ categories }: CatalogMenuProps) {
  const activeUI = useUIStore((s) => s.activeUI);
  const closeAll = useUIStore((s) => s.closeAll);
  const openConsultationForm = useUIStore((s) => s.openConsultationForm);
  const isOpen = activeUI === "catalog";
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [hoveredSubCategory, setHoveredSubCategory] = useState<Category | null>(
    null,
  );
  const [openCategory, setOpenCategory] = useState<Category | null>(null);
  const [openSubCategory, setOpenedSubCategory] = useState<Category | null>(
    null,
  );
  const isMobile = useMediaQuery(640);

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isMobile]);

  const handleMouseLeave = () => {
    setHoveredCategory(null);
    setHoveredSubCategory(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {!isMobile ? (
        <div
          className={styles.overlay}
          data-ui-surface="catalog"
          onClick={() => closeAll()}
        >
          <nav className={styles.menu} onClick={(e) => e.stopPropagation()}>
            <div className={styles.content}>
              {/* Первый уровень */}
              <div className={styles.primaryLevel}>
                {categories?.map((category) => (
                  <CategoryMenuItem
                    key={category.id}
                    category={category}
                    allCategories={categories}
                    onHover={() => setHoveredCategory(category)}
                    onClick={() => closeAll()}
                  />
                ))}
              </div>

              {/* Второй уровень */}
              {hoveredCategory && (
                <div
                  className={styles.secondaryLevel}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className={styles.subCategories}>
                    <h2 className={styles.levelTitle}>
                      {hoveredCategory.name}
                    </h2>
                    <div className={styles.listSubCategories}>
                      {hoveredCategory.childs?.map((subCategory: Category) => (
                        <CategoryMenuItem
                          key={subCategory.id}
                          category={subCategory}
                          allCategories={categories}
                          onHover={() => setHoveredSubCategory(subCategory)}
                          onClick={() => closeAll()}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Третий уровень */}
                  {hoveredSubCategory &&
                    hoveredSubCategory.childs &&
                    hoveredSubCategory.childs?.length > 0 && (
                      <div className={styles.tertiaryLevel}>
                        <h3 className={styles.levelTitle}>
                          {hoveredSubCategory.name}
                        </h3>
                        <div className={styles.listSubCategories}>
                          {hoveredSubCategory.childs.map((item: Category) => (
                            <CategoryMenuItem
                              key={item.id}
                              category={item}
                              allCategories={categories}
                              type="secondary"
                              onClick={() => closeAll()}
                              className={styles.tertiaryCustum}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Блок помощи */}
                  <div className={styles.helpBlock}>
                    <div className={styles.helpContent}>
                      <h4 className={styles.helpTitle}>
                        Не знаете какое оборудование выбрать?
                      </h4>
                      <p className={styles.helpText}>
                        Оставьте заявку и наши специалисты помогут подобрать
                        оборудование под ваше производство
                      </p>
                    </div>
                    <button
                      className={styles.helpButton}
                      onClick={() => {
                        closeAll();
                        openConsultationForm();
                      }}
                    >
                      Оставить заявку
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      ) : (
        <div
          className={mobileMenuStyles.overlay}
          data-ui-surface="catalog"
        >
          <div className={mobileMenuStyles.content}>
            {!openCategory && !openSubCategory && (
              <h2 className={mobileMenuStyles.title}>Каталог</h2>
            )}

            {openCategory && !openSubCategory && (
              <>
                <div
                  className={mobileMenuStyles.resetButton}
                  onClick={() => {
                    setOpenCategory(null);
                    setOpenedSubCategory(null);
                  }}
                >
                  <Image
                    src="/icons/ArrowLeft.svg"
                    width={32}
                    height={32}
                    alt=""
                  />
                  <p>Назад</p>
                </div>
                <h2 className={mobileMenuStyles.title}>{openCategory.name}</h2>
              </>
            )}

            {openSubCategory && (
              <>
                <div
                  className={mobileMenuStyles.resetButton}
                  onClick={() => setOpenedSubCategory(null)}
                >
                  <Image
                    src="/icons/ArrowLeft.svg"
                    width={32}
                    height={32}
                    alt=""
                  />
                  <p>Назад</p>
                </div>
                <h2 className={mobileMenuStyles.title}>
                  {openSubCategory.name}
                </h2>
              </>
            )}
            <div className={mobileMenuStyles.categoryList}>
              {!openCategory &&
                !openSubCategory &&
                categories.map((category) => (
                  <div
                    className={mobileMenuStyles.categoryItem}
                    key={category.id}
                  >
                    <CategoryMenuItem
                      category={category}
                      allCategories={categories}
                      className={mobileMenuStyles.customCard}
                      showArrow={
                        category.childs && category.childs?.length > 0
                      }
                      onArrowClick={() => setOpenCategory(category)}
                      onClick={closeAll}
                    />
                  </div>
                ))}

              {openCategory &&
                !openSubCategory &&
                openCategory.childs?.map((category) => (
                  <div
                    className={mobileMenuStyles.categoryItem}
                    key={category.id}
                  >
                    <CategoryMenuItem
                      category={category}
                      allCategories={categories}
                      className={mobileMenuStyles.customCard}
                      showArrow={
                        category.childs && category.childs?.length > 0
                      }
                      onArrowClick={() => setOpenedSubCategory(category)}
                      onClick={closeAll}
                    />
                  </div>
                ))}

              {openCategory &&
                openSubCategory &&
                openSubCategory.childs?.map((category) => (
                  <div
                    className={mobileMenuStyles.categoryItem}
                    key={category.id}
                  >
                    <CategoryMenuItem
                      category={category}
                      allCategories={categories}
                      className={mobileMenuStyles.customCard}
                      showArrow={
                        category.childs && category.childs?.length > 0
                      }
                      onArrowClick={() => setOpenedSubCategory(category)}
                      onClick={closeAll}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
