/**
 * Генерация статической карты категорий из src/data/category-mapping.json.
 * Результат: public/data/category-map.json (tree + byDocumentId).
 * Источник истины — плоский массив; корни — записи с parent === null (14 штук).
 * Запуск: npx tsx scripts/generate-category-map.ts (или при билде).
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INPUT_FILE = path.join(__dirname, "../src/data/category-mapping.json");
const OUTPUT_DIR = path.join(__dirname, "../public/data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "category-map.json");

// --- Типы (совпадают с форматом JSON и entities/categories) ---

export interface CategoryMapNodeFlat {
  documentId: string;
  name: string;
  slug: string;
  url: string;
  image: string | null;
  parentDocumentId: string | null;
}

export interface CategoryMapTreeNode {
  documentId: string;
  name: string;
  slug: string;
  url: string;
  image: string | null;
  children: CategoryMapTreeNode[];
}

export interface CategoryMapOutput {
  tree: CategoryMapTreeNode[];
  byDocumentId: Record<string, CategoryMapNodeFlat>;
}

interface CategoryMappingEntry {
  documentId: string;
  name: string;
  slug: string;
  img_menu?: { url?: string } | null;
  parent: string | null;
  external_id?: string;
}

function buildTreeFromMapping(
  entries: CategoryMappingEntry[],
): CategoryMapOutput {
  const byDocumentId: Record<string, CategoryMapNodeFlat> = {};
  const byId = new Map<string, CategoryMappingEntry>();
  for (const e of entries) {
    if (e.documentId) byId.set(e.documentId, e);
  }

  function buildNode(
    entry: CategoryMappingEntry,
    pathSlugs: string[],
    parentDocumentId: string | null,
  ): CategoryMapTreeNode {
    const slug = entry.slug ?? "";
    const pathSoFar = [...pathSlugs, slug].filter(Boolean);
    const url =
      pathSoFar.length > 0 ? `/catalog/${pathSoFar.join("/")}` : "/catalog";
    const image = entry.img_menu?.url ?? null;

    const flat: CategoryMapNodeFlat = {
      documentId: entry.documentId,
      name: entry.name ?? "",
      slug,
      url,
      image,
      parentDocumentId,
    };
    byDocumentId[entry.documentId] = flat;

    const childrenEntries = entries.filter(
      (e) => e.parent === entry.documentId,
    );
    const children = childrenEntries
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
      .map((child) => buildNode(child, pathSoFar, entry.documentId));

    return {
      documentId: entry.documentId,
      name: flat.name,
      slug: flat.slug,
      url: flat.url,
      image: flat.image,
      children,
    };
  }

  const roots = entries.filter((e) => e.parent === null);
  const tree = roots
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
    .map((root) => buildNode(root, [], null));

  return { tree, byDocumentId };
}

function main(): void {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error("[generate-category-map] Input file not found:", INPUT_FILE);
    process.exit(1);
  }

  const raw = fs.readFileSync(INPUT_FILE, "utf-8");
  let entries: CategoryMappingEntry[];
  try {
    const parsed = JSON.parse(raw);
    entries = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("[generate-category-map] Invalid JSON in", INPUT_FILE, e);
    process.exit(1);
  }

  const { tree, byDocumentId } = buildTreeFromMapping(entries);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify({ tree, byDocumentId }, null, 0),
    "utf-8",
  );
  console.log(
    `[generate-category-map] Saved ${tree.length} root nodes, ${Object.keys(byDocumentId).length} total in byDocumentId -> ${OUTPUT_FILE}`,
  );
}

main();
