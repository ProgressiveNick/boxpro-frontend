/**
 * Генерация статической карты категорий из Strapi при билде.
 * Результат: public/data/category-map.json (tree + byDocumentId).
 * Требует STRAPI_API_BASE_URL и STRAPI_API_TOKEN в .env.
 * При ошибке или недоступности Strapi не перезаписывает существующий файл.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import qs from "qs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnv(path.join(__dirname, "../.env"));
loadEnv(path.join(__dirname, "../.env.local"));

const BASE_URL = process.env.STRAPI_API_BASE_URL?.replace(/\/$/, "");
const TOKEN = process.env.STRAPI_API_TOKEN;
const OUTPUT_DIR = path.join(__dirname, "../public/data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "category-map.json");

const COLLECTION = "kategorii-tovarovs";

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

interface StrapiCategoryRaw {
  documentId?: string;
  id?: number;
  slug?: string;
  name?: string;
  img_menu?: { url?: string; data?: { attributes?: { url?: string } } };
  childs?: StrapiCategoryRaw[];
  children?: StrapiCategoryRaw[];
}

interface TransformResult {
  node: CategoryMapTreeNode;
  flat: CategoryMapNodeFlat;
  children: CategoryMapTreeNode[];
}

/**
 * Строим query в формате Strapi 5 (как @strapi/client).
 * Используем qs, чтобы сериализация совпадала с ожиданиями API.
 */
function buildQuery(): string {
  const query = {
    filters: {
      parent: {
        $null: true,
      },
    },
    populate: {
      img_menu: { populate: "*" },
      childs: {
        populate: {
          img_menu: { populate: "*" },
          childs: {
            populate: {
              img_menu: { populate: "*" },
              childs: {
                populate: {
                  img_menu: { populate: "*" },
                  childs: {
                    populate: {
                      img_menu: { populate: "*" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  return qs.stringify(query, {
    encodeValuesOnly: true,
    arrayFormat: "indices",
  });
}

function transformNode(
  raw: StrapiCategoryRaw,
  pathSlugs: string[] = [],
  parentDocumentId: string | null = null
): TransformResult | null {
  const documentId = raw.documentId ?? raw.id?.toString?.();
  if (!documentId) return null;

  const slug = raw.slug ?? "";
  const pathSoFar = [...pathSlugs, slug].filter(Boolean);
  const url =
    pathSoFar.length > 0 ? `/catalog/${pathSoFar.join("/")}` : "/catalog";
  const image =
    raw.img_menu?.url ?? raw.img_menu?.data?.attributes?.url ?? null;

  const flat: CategoryMapNodeFlat = {
    documentId,
    name: raw.name ?? "",
    slug,
    url,
    image,
    parentDocumentId,
  };

  const childList = raw.childs ?? raw.children ?? [];
  const children: CategoryMapTreeNode[] = childList
    .map((child) => {
      const res = transformNode(child, pathSoFar, documentId);
      return res?.node ?? null;
    })
    .filter((n): n is CategoryMapTreeNode => n !== null);

  return {
    node: {
      documentId: flat.documentId,
      name: flat.name,
      slug: flat.slug,
      url: flat.url,
      image: flat.image,
      children,
    },
    flat,
    children,
  };
}

function collectFlatInto(
  node: CategoryMapTreeNode,
  byDocumentId: Record<string, CategoryMapNodeFlat>,
  parentDocumentId: string | null
): void {
  byDocumentId[node.documentId] = {
    documentId: node.documentId,
    name: node.name,
    slug: node.slug,
    url: node.url,
    image: node.image,
    parentDocumentId,
  };
  for (const child of node.children) {
    collectFlatInto(child, byDocumentId, node.documentId);
  }
}

function buildMap(data: { data?: StrapiCategoryRaw[] } | StrapiCategoryRaw[]): CategoryMapOutput {
  const byDocumentId: Record<string, CategoryMapNodeFlat> = {};
  const tree: CategoryMapTreeNode[] = [];

  const list = Array.isArray(data) ? data : data?.data ?? [];
  for (const raw of list) {
    const result = transformNode(raw, [], null);
    if (!result) continue;

    tree.push(result.node);
    collectFlatInto(result.node, byDocumentId, null);
  }

  return { tree, byDocumentId };
}

function getCategoriesApiUrl(): string {
  // STRAPI_API_BASE_URL часто уже с /api (как в доке: http://localhost:1337/api)
  const base = BASE_URL!.replace(/\/$/, "");
  const path = base.endsWith("/api") ? `${base}/${COLLECTION}` : `${base}/api/${COLLECTION}`;
  return `${path}?${buildQuery()}`;
}

async function fetchCatalogFromStrapi(): Promise<unknown> {
  const url = getCategoriesApiUrl();
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const safeUrl = url.replace(/\?.*/, "?...");
    throw new Error(
      `Strapi API ${response.status}: ${response.statusText}. URL: ${safeUrl}`
    );
  }

  return response.json();
}

async function main(): Promise<void> {
  if (!BASE_URL || !TOKEN) {
    console.warn(
      "[generate-category-map] STRAPI_API_BASE_URL or STRAPI_API_TOKEN not set. Skip generation."
    );
    return;
  }

  let data: unknown;
  try {
    console.log("[generate-category-map] Fetching categories from Strapi...");
    data = await fetchCatalogFromStrapi();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[generate-category-map] Strapi request failed:", message);
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log("[generate-category-map] Keeping existing category-map.json");
    } else {
      const empty: CategoryMapOutput = { tree: [], byDocumentId: {} };
      if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      }
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(empty), "utf-8");
      console.log("[generate-category-map] Created empty category-map.json");
    }
    return;
  }

  const { tree, byDocumentId } = buildMap(
    data as { data?: StrapiCategoryRaw[] } | StrapiCategoryRaw[]
  );

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify({ tree, byDocumentId }, null, 0),
    "utf-8"
  );
  console.log(
    `[generate-category-map] Saved ${tree.length} root nodes, ${Object.keys(byDocumentId).length} total in byDocumentId -> ${OUTPUT_FILE}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
