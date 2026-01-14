import { Category } from "../model";

/**
 * Класс для работы с деревом категорий
 * Предоставляет единый источник истины для работы с вложенностью категорий,
 * построения путей, поиска родительских категорий и формирования slug'ов
 */
export class CategoryTree {
  private readonly mapBySlug: Map<string, Category>;
  private readonly mapById: Map<string, Category>;
  private readonly rootCategories: Category[];

  /**
   * Создает экземпляр CategoryTree из массива категорий
   * @param categories - массив корневых категорий (или все категории)
   */
  constructor(categories: Category[]) {
    this.rootCategories = categories;
    this.mapBySlug = new Map<string, Category>();
    this.mapById = new Map<string, Category>();

    this.buildIndexes(categories);
  }

  /**
   * Рекурсивно строит индексы для быстрого поиска категорий
   */
  private buildIndexes(categories: Category[]): void {
    for (const category of categories) {
      if (category.slug) {
        this.mapBySlug.set(category.slug, category);
      }
      if (category.documentId) {
        this.mapById.set(category.documentId, category);
      }
      if (category.childs && category.childs.length > 0) {
        this.buildIndexes(category.childs);
      }
    }
  }

  /**
   * Получить категорию по slug
   */
  getBySlug(slug: string): Category | undefined {
    return this.mapBySlug.get(slug);
  }

  /**
   * Получить категорию по documentId
   */
  getById(id: string): Category | undefined {
    return this.mapById.get(id);
  }

  /**
   * Получить все категории
   */
  getAllCategories(): Category[] {
    return this.rootCategories;
  }

  /**
   * Получить все категории как плоский массив
   */
  getAllCategoriesFlat(): Category[] {
    const result: Category[] = [];
    const traverse = (categories: Category[]) => {
      for (const category of categories) {
        result.push(category);
        if (category.childs && category.childs.length > 0) {
          traverse(category.childs);
        }
      }
    };
    traverse(this.rootCategories);
    return result;
  }

  /**
   * Извлекает documentId из parent (может быть объектом или строкой)
   */
  private extractParentId(parent: Category | string | undefined): string | undefined {
    if (!parent) return undefined;
    if (typeof parent === "string") return parent;
    return parent.documentId;
  }

  /**
   * Находит родительскую категорию для данной категории
   * Единообразно обрабатывает разные форматы parent
   */
  private findParent(category: Category): Category | undefined {
    if (!category.parent) return undefined;

    const parentId = this.extractParentId(category.parent);

    // Если parent - объект с полной информацией, используем его
    if (typeof category.parent === "object" && category.parent.slug) {
      // Но предпочитаем полную версию из индекса, если она есть
      const parentFromIndex = parentId ? this.mapById.get(parentId) : undefined;
      if (parentFromIndex) {
        return parentFromIndex;
      }
      // Если не нашли в индексе, используем объект напрямую
      return category.parent;
    }

    // Если parent - строка (documentId), ищем в индексе
    if (parentId) {
      return this.mapById.get(parentId);
    }

    return undefined;
  }

  /**
   * Получить полный путь категории (массив slug'ов от корня до категории)
   * @param category - категория, для которой нужно построить путь
   * @returns массив slug'ов от корня до категории
   */
  getPath(category: Category): string[] {
    const path: string[] = [category.slug];
    let currentCategory: Category | undefined = category;
    const visited = new Set<string>(); // Защита от циклических ссылок

    while (currentCategory) {
      const parent = this.findParent(currentCategory);
      if (!parent) break;

      const parentId = this.extractParentId(parent);
      if (!parentId || visited.has(parentId)) {
        break;
      }

      visited.add(parentId);
      path.unshift(parent.slug);
      currentCategory = parent;
    }

    return path;
  }

  /**
   * Получить URL категории с полным путем
   * @param category - категория
   * @returns URL вида /catalog/parent-slug/child-slug
   */
  getUrl(category: Category): string {
    const path = this.getPath(category);
    return `/catalog/${path.join("/")}`;
  }

  /**
   * Получить категорию по полному пути (массив slug'ов)
   * @param slugs - массив slug'ов от корня до категории
   * @returns категория или null, если путь неверный
   */
  getByPath(slugs: string[]): Category | null {
    if (!slugs || slugs.length === 0) {
      return null;
    }

    // Последний slug - это искомая категория
    const targetSlug = slugs[slugs.length - 1];
    const category = this.mapBySlug.get(targetSlug);

    if (!category) {
      return null;
    }

    // Проверяем, что путь совпадает
    const actualPath = this.getPath(category);
    const expectedPath = slugs;

    if (actualPath.length !== expectedPath.length) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[CategoryTree] Path length mismatch. Expected: ${expectedPath.join("/")}, Actual: ${actualPath.join("/")}`
        );
      }
      return null;
    }

    // Проверяем, что каждый slug совпадает
    for (let i = 0; i < expectedPath.length; i++) {
      if (actualPath[i] !== expectedPath[i]) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[CategoryTree] Path mismatch at index ${i}. Expected: ${expectedPath.join("/")}, Actual: ${actualPath.join("/")}`
          );
        }
        return null;
      }
    }

    return category;
  }

  /**
   * Получить breadcrumb overrides для хлебных крошек
   * @param slugs - массив slug'ов пути
   * @returns объект с переопределениями названий для breadcrumbs
   */
  getBreadcrumbOverrides(slugs: string[]): Record<string, string> {
    const overrides: Record<string, string> = {};

    for (const slug of slugs) {
      const category = this.mapBySlug.get(slug);
      if (category) {
        overrides[slug] = category.name;
      }
    }

    return overrides;
  }

  /**
   * Получить все пути категорий для generateStaticParams
   * @returns массив массивов slug'ов (пути категорий)
   */
  getAllPaths(): string[][] {
    const paths: string[][] = [];

    const collectPaths = (categories: Category[], currentPath: string[] = []) => {
      for (const category of categories) {
        if (!category.slug) continue;

        const categoryPath = [...currentPath, category.slug];
        paths.push(categoryPath);

        if (category.childs && category.childs.length > 0) {
          collectPaths(category.childs, categoryPath);
        }
      }
    };

    collectPaths(this.rootCategories);
    return paths;
  }

  /**
   * Получить все documentId дочерних категорий (рекурсивно)
   * @param categoryId - documentId родительской категории
   * @returns массив documentId всех дочерних категорий (включая саму категорию)
   */
  getAllChildIds(categoryId: string): string[] {
    const category = this.mapById.get(categoryId);
    if (!category) {
      return [categoryId]; // Если категория не найдена, возвращаем только её ID
    }

    const result: string[] = [categoryId];

    // Рекурсивно собираем все дочерние категории
    const collectChildren = (cat: Category) => {
      if (cat.childs && cat.childs.length > 0) {
        for (const child of cat.childs) {
          if (child.documentId && !result.includes(child.documentId)) {
            result.push(child.documentId);
            collectChildren(child);
          }
        }
      }
    };

    collectChildren(category);
    return result;
  }
}
