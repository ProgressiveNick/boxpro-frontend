/**
 * Разовый скрипт: выгрузка товаров из Strapi (part != true) в 2.json,
 * затем преобразование в структуру фильтров по категориям каталога:
 * - src/data/filtres-data.json (упрощённый формат, znachenya без external_id)
 * - public/data/filters-by-category.json (полный формат { byDocumentId } для генерации кэша при билде; значения с id для API)
 * Запуск: npx tsx scripts/export-products-for-filters.ts (из корня проекта).
 * Требуется .env.local с STRAPI_API_BASE_URL и STRAPI_API_TOKEN.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, "..");

const OUTPUT_2_JSON = path.join(ROOT_DIR, "public/data/experement/2.json");
const OUTPUT_FILTRES = path.join(ROOT_DIR, "src/data/filtres-data.json");
const OUTPUT_FILTERS_BY_CATEGORY = path.join(ROOT_DIR, "public/data/filters-by-category.json");

const PAGE_SIZE = 200;

// --- Загрузка .env.local или .env без внешних зависимостей ---
function loadEnv(): void {
  const envLocal = path.join(ROOT_DIR, ".env.local");
  const env = path.join(ROOT_DIR, ".env");
  const envPath = fs.existsSync(envLocal) ? envLocal : fs.existsSync(env) ? env : null;
  if (!envPath) {
    console.warn("[export-products-for-filters] .env.local и .env не найдены, используются переменные окружения процесса.");
    return;
  }
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value.replace(/^["']|["']$/g, "");
    }
  }
}

// --- Типы ---
type HarakteristicaStub = {
  documentId?: string;
  id?: number;
  name?: string;
  type?: string;
  unit?: string;
};

type HarakteristiciItemRaw = {
  documentId?: string;
  id?: number;
  string_value?: string | null;
  number_value?: number | null;
  range_min?: number;
  range_max?: number;
  boolean_value?: boolean | null;
  external_id?: string | null;
  harakteristica?: HarakteristicaStub | null;
  tovary?: unknown;
};

type ProductRaw = {
  documentId?: string;
  id?: number;
  name?: string;
  slug?: string;
  kategoria?: { documentId?: string; id?: number } | null;
  harakteristici?: HarakteristiciItemRaw[] | null;
};

type ProductNormalized = {
  documentId: string;
  name: string;
  slug: string;
  kategoria: { documentId: string };
  harakteristici: Array<{
    documentId: string;
    string_value?: string | null;
    number_value?: number | null;
    range_min?: number;
    range_max?: number;
    boolean_value?: boolean | null;
    external_id?: string | null;
    harakteristica: { documentId: string; name: string; type: string; unit?: string };
  }>;
};

type FilterValueNumber = { id: string; value: number };
type FilterValueString = { id: string; label: string };
type FilterValueRange = { id: string; min: number; max: number };
type FilterAttribute = {
  id: string;
  name: string;
  type: "number" | "range" | "string" | "boolean";
  unit?: string;
  values: (FilterValueNumber | FilterValueString | FilterValueRange)[];
};

/** Элемент выходного массива filtres-data.json */
type FiltresCategoryItem = {
  name: string;
  documentId: string;
  harakteristics: Array<{
    name: string;
    documentId: string;
    type: string;
    unit?: string;
    znachenya: string[];
  }>;
};

// --- Запросы к Strapi ---
function getStrapiBaseUrl(): string {
  const url = process.env.STRAPI_API_BASE_URL;
  if (!url) throw new Error("STRAPI_API_BASE_URL не задан (добавьте в .env.local)");
  return url.replace(/\/$/, "");
}

function getStrapiToken(): string {
  const token = process.env.STRAPI_API_TOKEN;
  if (!token) throw new Error("STRAPI_API_TOKEN не задан (добавьте в .env.local)");
  return token;
}

async function fetchTovaries(start: number, limit: number): Promise<{
  data: ProductRaw[];
  meta?: { pagination?: { total?: number; start?: number; limit?: number } };
}> {
  const baseUrl = getStrapiBaseUrl();
  const token = getStrapiToken();
  const params = new URLSearchParams({
    "filters[part][$ne]": "true",
    "pagination[start]": String(start),
    "pagination[limit]": String(limit),
    publicationState: "live",
    "populate[0]": "kategoria",
    "populate[1]": "harakteristici",
    "populate[2]": "harakteristici.harakteristica",
  });
  const url = `${baseUrl}/tovaries?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Strapi: ${res.status} ${res.statusText}`);
  return res.json() as Promise<{ data: ProductRaw[]; meta?: { pagination?: { total?: number; start?: number; limit?: number } } }>;
}

// --- Нормализация товара ---
function normalizeProduct(p: ProductRaw): ProductNormalized {
  const docId = p.documentId ?? String(p.id ?? "");
  const kategoria = p.kategoria;
  const kategoriaDocumentId = kategoria?.documentId ?? String(kategoria?.id ?? "");

  const harakteristici: ProductNormalized["harakteristici"] = [];
  const list = Array.isArray(p.harakteristici) ? p.harakteristici : [];
  for (const h of list) {
    const har = h.harakteristica;
    if (!har) continue;
    const attrId = har.documentId ?? String(har.id ?? "");
    const attrName = har.name ?? "";
    const attrType = har.type ?? "string";
    harakteristici.push({
      documentId: h.documentId ?? String(h.id ?? ""),
      string_value: h.string_value,
      number_value: h.number_value,
      range_min: h.range_min,
      range_max: h.range_max,
      boolean_value: h.boolean_value,
      external_id: h.external_id,
      harakteristica: {
        documentId: attrId,
        name: attrName,
        type: attrType,
        unit: har.unit,
      },
    });
  }

  return {
    documentId: docId,
    name: p.name ?? "",
    slug: p.slug ?? "",
    kategoria: { documentId: kategoriaDocumentId },
    harakteristici,
  };
}

// --- Шаг 1: выгрузка в 2.json ---
async function exportTo2Json(): Promise<ProductNormalized[]> {
  const all: ProductNormalized[] = [];
  let start = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await fetchTovaries(start, PAGE_SIZE);
    const data = (res.data ?? []) as ProductRaw[];
    const received = data.length;
    for (const p of data) {
      all.push(normalizeProduct(p));
    }
    const total = res.meta?.pagination?.total ?? 0;
    console.log(`[export] загружено ${all.length} / ${total} товаров`);
    if (received === 0) break;
    start += received;
    if (total > 0 && all.length >= total) break;
  }

  const outDir = path.dirname(OUTPUT_2_JSON);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUTPUT_2_JSON, JSON.stringify(all, null, 2), "utf-8");
  console.log(`[export] записано ${all.length} товаров в ${OUTPUT_2_JSON}`);
  return all;
}

// --- Вспомогательные проверки для фильтров (как в getCategoryAttributes) ---
function shouldSkipAttributeName(attrName: string): boolean {
  if (
    attrName === "Артикул" ||
    attrName === "Вес брутто (кг)" ||
    attrName === "Вес нетто (кг)"
  )
    return true;
  // Исключаем все фильтры с габаритами: (Длина), (Ширина), (Высота)
  if (
    attrName.includes("(Длина)") ||
    attrName.includes("(Ширина)") ||
    attrName.includes("(Высота)")
  )
    return true;
  const isDimensions = attrName.includes("Габариты");
  if (isDimensions) {
    const hasWidth = attrName.includes("(Ширина)");
    const hasHeight = attrName.includes("(Высота)");
    const hasLength = attrName.includes("(Длина)");
    if (!hasWidth && !hasHeight && !hasLength) return true;
  }
  return false;
}

function normalizeAttrName(attrName: string): string {
  let name = attrName
    .replace(/,\s*[Дд][×хХX][Шш][×хХX][Вв]\s*$/i, "")
    .trim()
    .replace(/\s*[Дд][×хХX][Шш][×хХX][Вв]\s*$/i, "")
    .trim();
  if (name.endsWith("ДхШхВ") || name.endsWith("Д×Ш×В") || name.endsWith("ДХШХВ"))
    name = name.slice(0, -6).trim();
  return name.replace(/,\s*$/, "").trim();
}

function normalizeUnitForDimensions(unit: string | undefined, isDimensions: boolean, hasSub: boolean): string | undefined {
  if (!unit || !isDimensions || !hasSub) return unit;
  let u = String(unit).replace(/[Дд][×хХX][Шш][×хХX][Вв]/gi, "").trim();
  u = u.replace(/,\s*$/, "").trim();
  return u || undefined;
}

/** Результат построения: массив для filtres-data.json и byDocumentId для filters-by-category.json */
type BuildFiltresResult = {
  filtres: FiltresCategoryItem[];
  byDocumentId: Record<string, FilterAttribute[]>;
};

// --- Шаг 2: построение фильтров по категориям ---
function buildFiltresByCategory(products: ProductNormalized[]): BuildFiltresResult {
  const byCategory: Record<string, Map<string, FilterAttribute>> = {};

  for (const product of products) {
    const catId = product.kategoria?.documentId ?? "";
    if (!catId) continue;

    if (!byCategory[catId]) {
      byCategory[catId] = new Map();
    }
    const attrMap = byCategory[catId];
    const AVAILABILITY_KEY = "availability";

    for (const hv of product.harakteristici) {
      const har = hv.harakteristica;
      if (!har) continue;
      const attrId = har.documentId || "";
      if (!attrId) continue;
      const attrType = har.type;
      const originalName = har.name || "";
      if (shouldSkipAttributeName(originalName)) continue;

      let attrName = normalizeAttrName(originalName);
      const isDimensions = originalName.includes("Габариты");
      const hasWidth = originalName.includes("(Ширина)");
      const hasHeight = originalName.includes("(Высота)");
      const hasLength = originalName.includes("(Длина)");

      if (
        attrType !== "number" &&
        attrType !== "range" &&
        attrType !== "string" &&
        attrType !== "boolean"
      )
        continue;

      let targetKey = attrId;
      if (attrType === "boolean" && attrName.toLowerCase().includes("наличие")) {
        targetKey = AVAILABILITY_KEY;
        attrName = "Наличие";
      }

      if (!attrMap.has(targetKey)) {
        const unit = normalizeUnitForDimensions(
          har.unit,
          isDimensions,
          hasWidth || hasHeight || hasLength
        );
        attrMap.set(targetKey, {
          id: targetKey,
          name: attrName,
          type: attrType as FilterAttribute["type"],
          unit,
          values: [],
        });
      }
      const attr = attrMap.get(targetKey)!;
      const valueMap = new Map<string, FilterValueNumber | FilterValueString | FilterValueRange>();

      const pushNumber = (value: number, externalId: string) => {
        const key = String(value);
        if (!valueMap.has(key))
          valueMap.set(key, { id: externalId, value });
      };
      const pushString = (label: string, externalId: string) => {
        if (!valueMap.has(label))
          valueMap.set(label, { id: externalId, label });
      };
      const pushRange = (min: number, max: number, externalId: string) => {
        const key = `${min}-${max}`;
        if (!valueMap.has(key))
          valueMap.set(key, { id: externalId, min, max });
      };

      if (attrType === "number") {
        let num: number | null = null;
        if (hv.number_value != null) {
          num = hv.number_value;
        } else if (hv.string_value) {
          const match = String(hv.string_value).match(/\d+/);
          if (match) num = parseFloat(match[0]);
        }
        if (num != null) {
          const extId = hv.external_id ?? String(hv.documentId ?? "");
          pushNumber(num, extId);
        }
      } else if (attrType === "range" && hv.range_min != null && hv.range_max != null) {
        pushRange(hv.range_min, hv.range_max, hv.external_id ?? String(hv.documentId ?? ""));
      } else if (attrType === "string" && hv.string_value) {
        let s = String(hv.string_value).trim();
        if (isDimensions && (hasWidth || hasHeight || hasLength)) {
          s = s.replace(/\s+[Дд][×хХX][Шш][×хХX][Вв]\s+/gi, " ").replace(/\s*[Дд][×хХX][Шш][×хХX][Вв]\s*/gi, "").trim();
          s = s.replace(/ДхШхВ/gi, "").replace(/Д×Ш×В/g, "").trim().replace(/\s+/g, " ").trim();
        }
        if (s) pushString(s, hv.external_id ?? String(hv.documentId ?? ""));
      } else if (attrType === "boolean" && hv.boolean_value !== undefined) {
        const label = hv.boolean_value ? "Да" : "Нет";
        pushString(label, hv.external_id ?? String(hv.documentId ?? ""));
      }

      // Merge into attr.values (unique by value; при совпадении значения накапливаем id через запятую)
      for (const v of valueMap.values()) {
        const existing = attr.values.find(
          (x) =>
            ("value" in x && "value" in v && x.value === v.value) ||
            ("label" in x && "label" in v && x.label === v.label) ||
            ("min" in x && "min" in v && x.min === v.min && x.max === v.max)
        );
        if (existing) {
          const newId = "id" in v ? v.id : "";
          if (newId && existing.id && !existing.id.split(",").includes(newId))
            existing.id = existing.id + "," + newId;
        } else {
          attr.values.push(v);
        }
      }
    }
  }

  // Карта названий категорий: documentId -> name (из category-map.json)
  const categoryNames: Record<string, string> = {};
  const categoryMapPath = path.join(ROOT_DIR, "public/data/category-map.json");
  if (fs.existsSync(categoryMapPath)) {
    try {
      const mapJson = JSON.parse(fs.readFileSync(categoryMapPath, "utf-8"));
      const byDocumentId = mapJson.byDocumentId as Record<string, { name?: string }> | undefined;
      if (byDocumentId) {
        for (const [docId, node] of Object.entries(byDocumentId)) {
          if (node?.name) categoryNames[docId] = node.name;
        }
      }
    } catch {
      // игнорируем, названия останутся documentId
    }
  }

  // Преобразуем в массив категорий: { name, documentId, harakteristics: [{ name, documentId, type, unit, znachenya: string[] }] }
  const result: FiltresCategoryItem[] = [];

  for (const [catId, attrMap] of Object.entries(byCategory)) {
    const harakteristics: FiltresCategoryItem["harakteristics"] = [];

    for (const attr of attrMap.values()) {
      if (attr.values.length < 2) continue;

      if (attr.type === "number") {
        attr.values.sort((a, b) => ("value" in a && "value" in b ? a.value - b.value : 0));
      } else if (attr.type === "range") {
        attr.values.sort((a, b) => ("min" in a && "min" in b ? a.min - b.min : 0));
      } else {
        attr.values.sort((a, b) =>
          ("label" in a && "label" in b ? a.label.localeCompare(b.label) : 0)
        );
      }

      const znachenya: string[] = [];
      for (const v of attr.values) {
        if ("value" in v) znachenya.push(String(v.value));
        else if ("label" in v) znachenya.push(v.label);
        else if ("min" in v && "max" in v) znachenya.push(`${v.min} - ${v.max}`);
      }

      harakteristics.push({
        name: attr.name,
        documentId: attr.id,
        type: attr.type,
        unit: attr.unit,
        znachenya,
      });
    }

    harakteristics.sort((a, b) => a.name.localeCompare(b.name));

    result.push({
      name: categoryNames[catId] ?? catId,
      documentId: catId,
      harakteristics,
    });
  }

  result.sort((a, b) => a.name.localeCompare(b.name));

  // byDocumentId для filters-by-category.json (полная структура с id у значений для API)
  const byDocumentId: Record<string, FilterAttribute[]> = {};
  for (const [catId, attrMap] of Object.entries(byCategory)) {
    const arr: FilterAttribute[] = [];
    for (const attr of attrMap.values()) {
      if (attr.values.length < 2) continue;
      if (attr.type === "number") {
        attr.values.sort((a, b) => ("value" in a && "value" in b ? a.value - b.value : 0));
      } else if (attr.type === "range") {
        attr.values.sort((a, b) => ("min" in a && "min" in b ? a.min - b.min : 0));
      } else {
        attr.values.sort((a, b) =>
          ("label" in a && "label" in b ? a.label.localeCompare(b.label) : 0)
        );
      }
      arr.push({ ...attr, values: [...attr.values] });
    }
    arr.sort((a, b) => a.name.localeCompare(b.name));
    byDocumentId[catId] = arr;
  }

  return { filtres: result, byDocumentId };
}

function writeFiltresData(products: ProductNormalized[]): void {
  const { filtres, byDocumentId } = buildFiltresByCategory(products);

  const srcDataDir = path.dirname(OUTPUT_FILTRES);
  if (!fs.existsSync(srcDataDir)) fs.mkdirSync(srcDataDir, { recursive: true });
  fs.writeFileSync(OUTPUT_FILTRES, JSON.stringify(filtres, null, 2), "utf-8");
  console.log(`[export] записано ${filtres.length} категорий с фильтрами в ${OUTPUT_FILTRES}`);

  const publicDataDir = path.dirname(OUTPUT_FILTERS_BY_CATEGORY);
  if (!fs.existsSync(publicDataDir)) fs.mkdirSync(publicDataDir, { recursive: true });
  fs.writeFileSync(
    OUTPUT_FILTERS_BY_CATEGORY,
    JSON.stringify({ byDocumentId }, null, 0),
    "utf-8"
  );
  console.log(`[export] записано ${Object.keys(byDocumentId).length} категорий в ${OUTPUT_FILTERS_BY_CATEGORY}`);
}

// --- Main ---
async function main(): Promise<void> {
  loadEnv();

  console.log("[export] шаг 1: выгрузка товаров из Strapi (part != true)...");
  const products = await exportTo2Json();

  console.log("[export] шаг 2: построение фильтров по категориям каталога...");
  writeFiltresData(products);

  console.log("[export] готово.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
