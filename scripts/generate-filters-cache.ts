/**
 * Генерация статического кэша фильтров при билде.
 * Читает public/data/category-map.json и public/data/filters-by-category.json,
 * для каждой категории объединяет её фильтры с фильтрами всех дочерних категорий,
 * записывает public/data/filters-cache.json ({ byDocumentId }).
 * Запускается из prebuild после generate-category-map.
 * Для актуального filters-by-category.json предварительно выполните: npx tsx scripts/export-products-for-filters.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, "..");

const CATEGORY_MAP_PATH = path.join(ROOT_DIR, "public/data/category-map.json");
const FILTERS_BY_CATEGORY_PATH = path.join(ROOT_DIR, "public/data/filters-by-category.json");
const FILTERS_CACHE_PATH = path.join(ROOT_DIR, "public/data/filters-cache.json");

// Формат совпадает с getCategoryAttributes.AttributeFilter + slug для SEO-URL
type AttributeFilterValueItem = {
  id: string;
  value?: number;
  label?: string;
  min?: number;
  max?: number;
  slug?: string;
};

type AttributeFilter = {
  id: string;
  name: string;
  type: "number" | "range" | "string" | "boolean";
  unit?: string;
  values: AttributeFilterValueItem[];
  slug?: string;
};

/** Транслитерация кириллицы в латиницу для SEO-slug */
const RU_TO_LAT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((char) => RU_TO_LAT[char] ?? (char >= "a" && char <= "z" ? char : char >= "0" && char <= "9" ? char : ""))
    .join("");
}

function toSlug(text: string): string {
  const t = transliterate(text.trim());
  return t
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "filter";
}

type CategoryMapTreeNode = {
  documentId: string;
  name: string;
  slug: string;
  url: string;
  image: string | null;
  children: CategoryMapTreeNode[];
};

type CategoryMap = {
  tree: CategoryMapTreeNode[];
  byDocumentId: Record<string, { documentId: string; name: string; slug: string; url: string; image: string | null; parentDocumentId: string | null }>;
};

function findNodeInTree(nodes: CategoryMapTreeNode[], documentId: string): CategoryMapTreeNode | null {
  for (const node of nodes) {
    if (node.documentId === documentId) return node;
    const found = findNodeInTree(node.children, documentId);
    if (found) return found;
  }
  return null;
}

function getChildDocumentIds(map: CategoryMap, documentId: string): string[] {
  const result: string[] = [];
  const node = findNodeInTree(map.tree, documentId);
  if (!node) {
    result.push(documentId);
    return result;
  }
  function collect(n: CategoryMapTreeNode) {
    result.push(n.documentId);
    for (const child of n.children) collect(child);
  }
  collect(node);
  return result;
}

function valueKey(item: AttributeFilterValueItem, type: string): string {
  if (type === "number" && item.value !== undefined) return `n:${item.value}`;
  if ((type === "string" || type === "boolean") && item.label !== undefined) return `s:${item.label}`;
  if (type === "range" && item.min !== undefined && item.max !== undefined) return `r:${item.min}-${item.max}`;
  return `raw:${item.id}`;
}

/** Ключ объединения: имя + unit (без типа), чтобы не было двух блоков для одной характеристики с разными типами */
function attributeMergeKey(attr: AttributeFilter): string {
  return `${attr.name}|${attr.unit ?? ""}`;
}

function mergeAttributeFilters(arrays: AttributeFilter[][]): AttributeFilter[] {
  // Объединяем по имени + unit. Один и тот же название+unit может приходить с типами range и string/number —
  // оставляем один блок, выбирая тип с максимальным числом значений.
  type Entry = {
    ids: string[];
    name: string;
    unit?: string;
    byType: Map<AttributeFilter["type"], { values: Map<string, AttributeFilterValueItem> }>;
  };
  const byMergeKey = new Map<string, Entry>();

  for (const arr of arrays) {
    for (const attr of arr) {
      const key = attributeMergeKey(attr);
      let entry = byMergeKey.get(key);
      if (!entry) {
        entry = {
          ids: [],
          name: attr.name,
          unit: attr.unit,
          byType: new Map(),
        };
        byMergeKey.set(key, entry);
      }
      if (!entry.ids.includes(attr.id)) {
        entry.ids.push(attr.id);
      }
      let typeMap = entry.byType.get(attr.type);
      if (!typeMap) {
        typeMap = { values: new Map() };
        entry.byType.set(attr.type, typeMap);
      }
      for (const v of attr.values) {
        const k = valueKey(v, attr.type);
        const prev = typeMap.values.get(k);
        if (prev) {
          const prevIds = prev.id.split(",").filter(Boolean);
          const newIds = v.id.split(",").filter(Boolean);
          prev.id = [...new Set([...prevIds, ...newIds])].join(",");
        } else {
          typeMap.values.set(k, { ...v });
        }
      }
    }
  }

  const typeOrder: AttributeFilter["type"][] = ["range", "number", "string", "boolean"];
  const result: AttributeFilter[] = [];
  for (const entry of byMergeKey.values()) {
    if (
      entry.name.includes("(Длина)") ||
      entry.name.includes("(Ширина)") ||
      entry.name.includes("(Высота)")
    )
      continue;
    // Выбираем тип с максимальным числом значений; при равенстве — range > number > string > boolean
    let bestType: AttributeFilter["type"] = "string";
    let bestCount = 0;
    for (const t of typeOrder) {
      const typeMap = entry.byType.get(t);
      if (!typeMap) continue;
      const count = typeMap.values.size;
      if (count > bestCount) {
        bestCount = count;
        bestType = t;
      }
    }
    const typeMap = entry.byType.get(bestType);
    if (!typeMap || typeMap.values.size < 2) continue;

    const values = Array.from(typeMap.values.values());
    if (bestType === "number") {
      values.sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
    } else if (bestType === "range") {
      values.sort((a, b) => (a.min ?? 0) - (b.min ?? 0));
    } else {
      values.sort((a, b) => (a.label ?? "").localeCompare(b.label ?? ""));
    }
    const attrSlug = toSlug(entry.name);
    const seenSlugs = new Set<string>();
    const valuesWithSlug = values.map((v) => {
      let slug: string;
      if (bestType === "number" && v.value !== undefined) {
        slug = String(v.value);
      } else if (bestType === "range" && v.min !== undefined && v.max !== undefined) {
        slug = `${v.min}-${v.max}`;
      } else {
        slug = toSlug(v.label ?? "");
      }
      if (!slug) slug = v.id.slice(0, 12);
      if (seenSlugs.has(slug)) {
        slug = `${slug}-${v.id.replace(/,/g, "-").slice(0, 8)}`;
      }
      seenSlugs.add(slug);
      return { ...v, slug };
    });
    result.push({
      id: entry.ids.join(","),
      name: entry.name,
      type: bestType,
      unit: entry.unit,
      slug: attrSlug,
      values: valuesWithSlug,
    });
  }
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

function main(): void {
  if (!fs.existsSync(CATEGORY_MAP_PATH)) {
    console.error("[generate-filters-cache] Не найден файл:", CATEGORY_MAP_PATH);
    process.exit(1);
  }
  if (!fs.existsSync(FILTERS_BY_CATEGORY_PATH)) {
    console.warn("[generate-filters-cache] Не найден", FILTERS_BY_CATEGORY_PATH, "- записываю пустой кэш. Запустите export-products-for-filters для генерации.");
    const outDir = path.dirname(FILTERS_CACHE_PATH);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(FILTERS_CACHE_PATH, JSON.stringify({ byDocumentId: {} }, null, 0), "utf-8");
    console.log("[generate-filters-cache] Записан пустой filters-cache.json");
    return;
  }

  const categoryMap = JSON.parse(fs.readFileSync(CATEGORY_MAP_PATH, "utf-8")) as CategoryMap;
  const { byDocumentId: filtersByCategory } = JSON.parse(fs.readFileSync(FILTERS_BY_CATEGORY_PATH, "utf-8")) as {
    byDocumentId: Record<string, AttributeFilter[]>;
  };

  const byDocumentId: Record<string, AttributeFilter[]> = {};
  const docIds = Object.keys(categoryMap.byDocumentId ?? {});

  for (const documentId of docIds) {
    const childIds = getChildDocumentIds(categoryMap, documentId);
    const arrays: AttributeFilter[][] = [];
    for (const id of childIds) {
      const arr = filtersByCategory[id];
      if (arr && arr.length > 0) arrays.push(arr);
    }
    byDocumentId[documentId] = mergeAttributeFilters(arrays);
  }

  const outDir = path.dirname(FILTERS_CACHE_PATH);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(FILTERS_CACHE_PATH, JSON.stringify({ byDocumentId }, null, 0), "utf-8");
  console.log(
    `[generate-filters-cache] Записано ${Object.keys(byDocumentId).length} категорий в ${FILTERS_CACHE_PATH}`
  );
}

main();
