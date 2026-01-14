"use client";

import { useState } from "react";

import styles from "./CatalogMenu.module.scss";
import { Category, CategoryMenuItem } from "@/entities/categories";
import { useCatalogMenuStore } from "../model";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { MobileMenu } from "./MobileMenu";
import { useConsultationFormStore } from "@/widgets/consultation-form";

type CatalogMenuProps = {
  categories: Category[];
};

export function CatalogMenu({ categories }: CatalogMenuProps) {
  const { isOpen, setIsOpen } = useCatalogMenuStore();
  const { openForm } = useConsultationFormStore();
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [hoveredSubCategory, setHoveredSubCategory] = useState<Category | null>(
    null
  );
  const isMobile = useMediaQuery(640);

  const handleMouseLeave = () => {
    setHoveredCategory(null);
    setHoveredSubCategory(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {!isMobile ? (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
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
                    onClick={() => setIsOpen(false)}
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
                          onClick={() => setIsOpen(false)}
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
                              onClick={() => setIsOpen(false)}
                              className={styles.tertiaryCustum}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Блок помощи */}
                  <div className={styles.helpBlock}>
                    <h4 className={styles.helpTitle}>
                      Не знаете какое оборудование выбрать?
                    </h4>
                    <p className={styles.helpText}>
                      Оставьте заявку и наши специалисты помогут подобрать
                      оборудование под ваше производство
                    </p>
                    <button
                      className={styles.helpButton}
                      onClick={() => {
                        setIsOpen(false);
                        openForm();
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
        <MobileMenu categories={categories} />
      )}
    </>
  );
}
