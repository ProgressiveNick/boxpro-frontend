/**
 * Генерация товарного фида для Google Merchant Center (XML / RSS 2.0 + g: namespace).
 *
 * Спецификация атрибутов:
 * - https://support.google.com/merchants/answer/12374301
 */

import type { ProductType } from "@/entities/product";
import { SITE_URL } from "@/shared/config/site";
import { getAbsoluteImageUrl, getAbsoluteUrl } from "@/shared/lib/helpers/absoluteUrl";
import { getSku } from "@/entities/product/lib/getSku";

const SHOP_TITLE = "BoxPro";
const SHOP_DESCRIPTION = "BoxPro — каталог товаров";
const DEFAULT_BRAND = "Hualian Machinery";

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

function cdata(text: string): string {
  const cleaned = stripControlChars(text);
  // Защита от разрыва CDATA
  return cleaned.replace(/]]>/g, "]]]]><![CDATA[>");
}

function formatPriceRUB(value: number): string {
  const price = Number(value);
  if (!Number.isFinite(price)) return "0.00 RUB";
  return `${price.toFixed(2)} RUB`;
}

export type BuildGoogleMerchantFeedParams = {
  products: ProductType[];
};

export function buildGoogleMerchantFeed({
  products,
}: BuildGoogleMerchantFeedParams): string {
  const nowRfc822 = new Date().toUTCString();
  const channelLink = escapeXml(SITE_URL);

  const itemsXml: string[] = [];

  for (const p of products) {
    const id = (p.documentId || p.slug || "").trim();
    const title = (p.name || "").trim();
    const link = getAbsoluteUrl(`/product/${p.slug}`);
    const imageLink = getAbsoluteImageUrl(p.pathsImgs?.[0]?.path ?? null);
    const price = p.price;

    if (!id || !title || !p.slug || price == null) continue;
    if (!link || !imageLink) continue;

    const description = (p.description || p.name || "").trim();
    const brand = DEFAULT_BRAND;
    const mpn = getSku(p.harakteristici) || "";
    const productType = p.kategoria?.name?.trim() || "";
    // TODO: маппинг availability из остатков/статуса Strapi (in_stock|out_of_stock|preorder|backorder)

    itemsXml.push(
      [
        "    <item>",
        `      <g:id>${escapeXml(id)}</g:id>`,
        `      <title>${escapeXml(stripControlChars(title))}</title>`,
        `      <description><![CDATA[${cdata(description)}]]></description>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <g:image_link>${escapeXml(imageLink)}</g:image_link>`,
        `      <g:availability>in_stock</g:availability>`,
        `      <g:condition>new</g:condition>`,
        `      <g:price>${escapeXml(formatPriceRUB(price))}</g:price>`,
        `      <g:brand>${escapeXml(stripControlChars(brand))}</g:brand>`,
        ...(mpn
          ? [`      <g:mpn>${escapeXml(stripControlChars(mpn))}</g:mpn>`]
          : []),
        ...(productType
          ? [
              `      <g:product_type>${escapeXml(
                stripControlChars(productType),
              )}</g:product_type>`,
            ]
          : []),
        "    </item>",
      ].join("\n"),
    );
  }

  const items = itemsXml.join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SHOP_TITLE)}</title>
    <link>${channelLink}</link>
    <description><![CDATA[${cdata(SHOP_DESCRIPTION)}]]></description>
    <lastBuildDate>${escapeXml(nowRfc822)}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

