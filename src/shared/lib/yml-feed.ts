/**
 * Генерация товарного фида в формате YML для Яндекс Товаров.
 * @see https://yandex.ru/support/merchants/ru/connect/form-feed.html
 */

import { SITE_URL } from "@/shared/config/site";
import { getAbsoluteUrl, getAbsoluteImageUrl } from "@/shared/lib/helpers/absoluteUrl";
import type { Category } from "@/entities/categories";
import type { ProductType } from "@/entities/product";
import { getSku } from "@/entities/product/lib/getSku";
import { CategoryTree } from "@/entities/categories/lib/CategoryTree";

/** Экранирование символов для XML (вне CDATA): " & < > ' */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Удаление непечатаемых символов (ASCII 0–31 кроме 9, 10, 13). */
function stripControlChars(text: string): string {
  return text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");
}

/** Идентификатор категории для YML (Strapi 5 отдаёт documentId, v4 — id). */
function getCategoryId(cat: Category | undefined | null): string | null {
  if (!cat) return null;
  if (cat.documentId) return cat.documentId;
  if (cat.id != null) return String(cat.id);
  return null;
}

function buildCategoriesXml(categories: Category[]): string {
  const tree = new CategoryTree(categories);
  const flat = tree.getAllCategoriesFlat();
  const lines: string[] = [];
  for (const cat of flat) {
    const catId = getCategoryId(cat);
    if (!catId || !cat.name) continue;
    const name = escapeXml(stripControlChars(cat.name));
    const parentCatId = cat.parent ? getCategoryId(cat.parent) : null;
    const parentId = parentCatId ? ` parentId="${escapeXml(parentCatId)}"` : "";
    lines.push(`    <category id="${escapeXml(catId)}"${parentId}>${name}</category>`);
  }
  return lines.join("\n");
}

const DEFAULT_VENDOR = "Hualian Machinery";
const SHOP_NAME = "BoxPro";
const SHOP_COMPANY = "ООО «БОКСПРО»";

function buildOffersXml(products: ProductType[]): string {
  const lines: string[] = [];
  for (const p of products) {
    const id = p.documentId || p.slug;
    if (!id || !p.name || p.price == null) continue;

    const categoryId = getCategoryId(p.kategoria);
    if (categoryId == null) continue;

    const name = escapeXml(stripControlChars(p.name));
    const vendor = escapeXml(DEFAULT_VENDOR);
    const vendorCode = getSku(p.harakteristici);
    const url = getAbsoluteUrl(`/product/${p.slug}`);
    const price = Math.round(Number(p.price));
    const oldprice =
      p.previousPrice != null && p.previousPrice > 0
        ? `\n      <oldprice>${Math.round(Number(p.previousPrice))}</oldprice>`
        : "";
    const picture = getAbsoluteImageUrl(
      p.pathsImgs?.[0]?.path ?? null
    );
    const pictureEscaped = escapeXml(picture);

    let descriptionContent = (p.description || p.name || "").trim();
    descriptionContent = stripControlChars(descriptionContent);
    if (descriptionContent.includes("<") || descriptionContent.includes(">")) {
      descriptionContent = descriptionContent.replace(/]]>/g, "]]]]><![CDATA[>");
    }
    const descriptionXml = `      <description><![CDATA[${descriptionContent}]]></description>`;

    const vendorCodeXml = vendorCode
      ? `\n      <vendorCode>${escapeXml(vendorCode)}</vendorCode>`
      : "";

    lines.push(`    <offer id="${escapeXml(String(id))}">
      <name>${name}</name>
      <vendor>${vendor}</vendor>${vendorCodeXml}
      <url>${escapeXml(url)}</url>
      <price>${price}</price>${oldprice}
      <currencyId>RUR</currencyId>
      <categoryId>${categoryId}</categoryId>
      <picture>${pictureEscaped}</picture>
${descriptionXml}
    </offer>`);
  }
  return lines.join("\n");
}

export type BuildYmlFeedParams = {
  categories: Category[];
  products: ProductType[];
};

/**
 * Собирает XML фида YML по данным магазина, категорий и товаров.
 * Дата в атрибуте date — момент генерации (RFC 3339).
 */
export function buildYmlFeed({ categories, products }: BuildYmlFeedParams): string {
  const date = new Date().toISOString();
  const categoriesXml = buildCategoriesXml(categories);
  const offersXml = buildOffersXml(products);

  return `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${date}">
  <shop>
    <name>${escapeXml(SHOP_NAME)}</name>
    <company>${escapeXml(SHOP_COMPANY)}</company>
    <url>${escapeXml(SITE_URL)}</url>
    <platform>Next.js</platform>
    <categories>
${categoriesXml}
    </categories>
    <offers>
${offersXml}
    </offers>
  </shop>
</yml_catalog>`;
}
