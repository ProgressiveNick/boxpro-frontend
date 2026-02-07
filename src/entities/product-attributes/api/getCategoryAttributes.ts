import { cache } from "react";
import {
  attributesValuesServerService,
  productsServerService,
} from "@/shared/api/server";
import { getAllCategoryIds } from "@/entities/categories/api/getCategories";
import { categoriesService } from "@/shared/api/server";
import { getServerCache, setServerCache } from "@/shared/lib/server-cache";
import type { Category } from "@/entities/categories";

const CACHE_KEY_PREFIX = "category_attributes";
const CACHE_VERSION = "8.0"; // Увеличили версию для получения всех товаров через пагинацию (не только первые 1000)
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

export type AttributeFilter = {
  id: string; // documentId характеристики или "availability" для объединенных boolean
  name: string;
  type: "number" | "range" | "string" | "boolean";
  unit?: string;
  values: AttributeFilterValueItem[];
};

export type AttributeFilterValueItem = {
  id: string; // external_id значения
  value?: number; // для number
  label?: string; // для string и boolean
  min?: number; // для range
  max?: number; // для range
};

export type GetCategoryAttributesOptions = {
  allCategories?: Category[];
  /** true = запасные части (part=true), false/undefined = только оборудование */
  includeParts?: boolean;
};

/**
 * Получить фильтры по характеристикам для категории
 * Возвращает только те характеристики, которые встречаются более 2 раз с разными значениями
 * @param categorySlug - slug категории
 * @param allCategoriesOrOptions - опционально: уже загруженные категории или объект с опциями
 */
export const getCategoryAttributes = cache(
  async (
    categorySlug: string,
    allCategoriesOrOptions?: Category[] | GetCategoryAttributesOptions,
  ): Promise<AttributeFilter[]> => {
    const allCategories = Array.isArray(allCategoriesOrOptions)
      ? allCategoriesOrOptions
      : allCategoriesOrOptions?.allCategories;
    const includeParts = !Array.isArray(allCategoriesOrOptions)
      ? allCategoriesOrOptions?.includeParts
      : false;
    if (!categorySlug) {
      return [];
    }

    // Для запасных частей характеристики не загружаем (избегаем 414 Request-URI Too Large)
    if (includeParts) {
      return [];
    }

    const cacheKey = `${CACHE_KEY_PREFIX}_${categorySlug}_${includeParts}`;

    // Проверяем кэш
    const cached = await getServerCache<AttributeFilter[]>(
      cacheKey,
      CACHE_VERSION,
    );
    if (cached && Array.isArray(cached) && cached.length > 0) {
      console.log(
        `[getCategoryAttributes] Cache hit for ${categorySlug}: ${cached.length} attributes`,
      );
      return cached;
    }
    console.log(
      `[getCategoryAttributes] Cache miss for ${categorySlug}, fetching from API...`,
    );

    try {
      // Получаем родительскую категорию
      const parentCategory = await Promise.race([
        categoriesService.find({
          filters: {
            slug: categorySlug,
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 5000),
        ),
      ]);

      if (!parentCategory.data?.length) {
        return [];
      }

      // Получаем все ID категорий (включая дочерние)
      // Используем уже загруженные категории для оптимизации (быстро, без API запросов)
      const targetCategoryIds = await getAllCategoryIds(
        parentCategory.data[0].documentId,
        allCategories,
      );

      console.log(
        `[getCategoryAttributes] Category ${categorySlug} (${parentCategory.data[0].documentId}) has ${targetCategoryIds.length} total categories (including children)`,
      );

      if (targetCategoryIds.length === 0) {
        return [];
      }

      // Получаем все товары в категории (только ID для фильтрации)
      // Используем пагинацию, чтобы получить все товары, а не только первые 1000
      const productIds: string[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const pageSize = 1000;

      while (hasMorePages) {
        const productsResponse = await Promise.race([
          productsServerService.find({
            filters: {
              kategoria: {
                documentId: {
                  $in: targetCategoryIds,
                },
              },
              ...(includeParts
                ? { part: { $eq: true } }
                : { part: { $ne: true } }),
            },
            fields: ["documentId"], // Загружаем только ID
            pagination: {
              page: currentPage,
              pageSize: pageSize,
            },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), 5000),
          ),
        ]);

        const products = productsResponse.data || [];
        const batchIds = products
          .map((p: { documentId?: string }) => p.documentId)
          .filter((id): id is string => Boolean(id));
        productIds.push(...batchIds);

        const total = productsResponse.meta?.pagination?.total || 0;
        const pageCount = productsResponse.meta?.pagination?.pageCount || 0;
        hasMorePages = currentPage < pageCount;
        currentPage++;

        if (currentPage % 10 === 0) {
          console.log(
            `[getCategoryAttributes] Fetched ${productIds.length} of ${total} products...`,
          );
        }
      }

      console.log(
        `[getCategoryAttributes] Found ${productIds.length} products for category ${categorySlug}`,
      );

      if (productIds.length === 0) {
        return [];
      }

      // Получаем все значения характеристик для этих товаров
      // Делаем запросы порциями, если товаров много
      // Увеличили размер батча для уменьшения количества запросов
      const BATCH_SIZE = 500; // Увеличено с 100 до 500 для уменьшения количества запросов
      const allAttributeValues: Array<{
        id?: number;
        external_id?: string;
        harakteristica?: {
          documentId?: string;
          id?: number;
          name?: string;
          type?: string;
          unit?: string;
        };
        string_value?: string | null;
        number_value?: number | null;
        boolean_value?: boolean | null;
        range_min?: number;
        range_max?: number;
        [key: string]: unknown;
      }> = [];

      for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
        const batch = productIds.slice(i, i + BATCH_SIZE);

        try {
          const valuesResponse = await Promise.race([
            attributesValuesServerService.find({
              filters: {
                tovary: {
                  documentId: {
                    $in: batch,
                  },
                },
              },
              // Оптимизированный populate - загружаем только нужные поля
              populate: {
                harakteristica: {
                  fields: ["name", "type", "unit", "documentId"], // Только нужные поля характеристики
                },
              },
              // Загружаем только нужные поля значения характеристики
              fields: [
                "external_id",
                "string_value",
                "number_value",
                "boolean_value",
                "range_min",
                "range_max",
              ],
              pagination: {
                page: 1,
                pageSize: 2000, // Увеличено с 1000 до 2000 для уменьшения количества запросов
              },
            }),
            new Promise<never>(
              (_, reject) =>
                setTimeout(() => reject(new Error("Request timeout")), 10000), // Увеличено с 5 до 10 секунд для больших батчей
            ),
          ]);

          allAttributeValues.push(...(valuesResponse.data || []));
        } catch (error) {
          // Обрабатываем разные типы ошибок
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          const errorName = error instanceof Error ? error.name : "";

          // Игнорируем ошибки "aborted" - они возникают при отмене запросов Next.js
          if (
            errorMessage.toLowerCase().includes("aborted") ||
            errorMessage.toLowerCase().includes("abort") ||
            errorName === "AbortError" ||
            (error instanceof DOMException && error.name === "AbortError")
          ) {
            console.warn(
              `[getCategoryAttributes] Request was aborted for batch ${i}-${i + BATCH_SIZE}, skipping`,
            );
            continue; // Пропускаем этот батч и продолжаем
          }

          // Для таймаутов логируем и продолжаем
          if (errorMessage.toLowerCase().includes("timeout")) {
            console.warn(
              `[getCategoryAttributes] Request timeout for batch ${i}-${i + BATCH_SIZE}, skipping`,
            );
            continue; // Пропускаем этот батч и продолжаем
          }

          // Для других ошибок логируем и продолжаем
          console.warn(
            `[getCategoryAttributes] Error fetching attribute values for batch ${i}-${i + BATCH_SIZE}:`,
            error,
          );
          // Продолжаем работу даже если один батч не загрузился
        }
      }

      console.log(
        `[getCategoryAttributes] Fetched ${allAttributeValues.length} attribute values`,
      );

      // Обрабатываем характеристики
      const attributesMap = new Map<
        string,
        {
          id: string;
          name: string;
          type: "number" | "range" | "string" | "boolean";
          unit?: string;
          values: Map<string, AttributeFilterValueItem>;
        }
      >();

      // Специальный ключ для объединенных boolean характеристик "Наличие"
      const AVAILABILITY_KEY = "availability";

      for (const attrValue of allAttributeValues) {
        const harakteristica = attrValue?.harakteristica;
        if (!harakteristica) continue;

        const attrId =
          harakteristica.documentId || String(harakteristica.id || "");
        if (!attrId) continue;
        const attrType = harakteristica.type;
        const originalAttrName = harakteristica.name || "";
        let attrName = originalAttrName;

        // Исключаем "Артикул", "Вес брутто (кг)" и "Вес нетто (кг)"
        if (
          attrName === "Артикул" ||
          attrName === "Вес брутто (кг)" ||
          attrName === "Вес нетто (кг)"
        ) {
          continue;
        }

        // Исключаем характеристики с "Габариты" в названии, но без "(Ширина)", "(Высота)" или "(Длина)"
        const isDimensionsAttribute = attrName.includes("Габариты");
        const hasWidth = attrName.includes("(Ширина)");
        const hasHeight = attrName.includes("(Высота)");
        const hasLength = attrName.includes("(Длина)");

        if (isDimensionsAttribute) {
          if (!hasWidth && !hasHeight && !hasLength) {
            continue; // Исключаем эту характеристику
          }

          // Для характеристик с шириной, высотой или длиной - удаляем "Д×Ш×В" или "ДхШхВ" из названия
          // Удаляем запятую и "ДхШхВ" в конце названия (в любом регистре и варианте написания)
          // Используем более простой и надежный паттерн
          attrName = attrName
            .replace(/,\s*[Дд][×хХX][Шш][×хХX][Вв]\s*$/i, "")
            .trim();
          attrName = attrName
            .replace(/\s*[Дд][×хХX][Шш][×хХX][Вв]\s*$/i, "")
            .trim();
          // Дополнительная проверка для точного совпадения
          if (
            attrName.endsWith("ДхШхВ") ||
            attrName.endsWith("Д×Ш×В") ||
            attrName.endsWith("ДХШХВ")
          ) {
            attrName = attrName.slice(0, -6).trim();
          }
          // Удаляем запятую в конце, если осталась
          attrName = attrName.replace(/,\s*$/, "").trim();
        }

        // Нас интересуют number, range, string и boolean
        if (
          attrType !== "number" &&
          attrType !== "range" &&
          attrType !== "string" &&
          attrType !== "boolean"
        ) {
          continue;
        }

        // Для boolean с "Наличие" в названии - объединяем в один фильтр
        let targetKey = attrId;
        if (
          attrType === "boolean" &&
          attrName.toLowerCase().includes("наличие")
        ) {
          targetKey = AVAILABILITY_KEY;
        }

        if (!attributesMap.has(targetKey)) {
          // Очищаем unit от "ДхШхВ" для характеристик с габаритами
          let unit = harakteristica.unit;
          if (
            isDimensionsAttribute &&
            (hasWidth || hasHeight || hasLength) &&
            unit
          ) {
            unit = String(unit)
              .replace(/[Дд][×хХX][Шш][×хХX][Вв]/gi, "")
              .trim();
            unit = unit.replace(/,\s*$/, "").trim();
            if (!unit) unit = undefined;
          }

          attributesMap.set(targetKey, {
            id: targetKey,
            name: targetKey === AVAILABILITY_KEY ? "Наличие" : attrName,
            type: attrType,
            unit: unit,
            values: new Map(),
          });
        }

        const attr = attributesMap.get(targetKey)!;

        // Логирование для отладки габаритов
        if (isDimensionsAttribute && (hasWidth || hasHeight || hasLength)) {
          console.log(
            `[getCategoryAttributes] Processing dimension attribute: "${originalAttrName}" -> "${attrName}", type: ${attrType}, number_value: ${attrValue.number_value}, string_value: "${attrValue.string_value}"`,
          );
        }

        // Обрабатываем значения в зависимости от типа
        if (attrType === "number") {
          // Для number типа может быть как number_value, так и string_value (если в БД хранится строка)
          let numberValue: number | null = null;
          let displayValue: string = "";

          if (attrValue.number_value != null) {
            numberValue = attrValue.number_value;
            displayValue = String(attrValue.number_value);
          } else if (attrValue.string_value) {
            // Если пришло строковое значение, пытаемся извлечь число
            let stringValue = String(attrValue.string_value);

            // Для характеристик с габаритами удаляем "Д×Ш×В" или "ДхШхВ" из значений
            if (isDimensionsAttribute && (hasWidth || hasHeight || hasLength)) {
              const originalValue = stringValue;
              stringValue = stringValue
                .replace(/\s+[Дд][×хХX][Шш][×хХX][Вв]\s+/gi, " ")
                .trim();
              stringValue = stringValue
                .replace(/\s*[Дд][×хХX][Шш][×хХX][Вв]\s*/gi, "")
                .trim();
              if (stringValue.includes("ДхШхВ")) {
                stringValue = stringValue.replace(/ДхШхВ/gi, "").trim();
              }
              if (stringValue.includes("Д×Ш×В")) {
                stringValue = stringValue.replace(/Д×Ш×В/g, "").trim();
              }
              stringValue = stringValue.replace(/\s+/g, " ").trim();

              if (originalValue !== stringValue) {
                console.log(
                  `[getCategoryAttributes] Cleaned number value: "${originalValue}" -> "${stringValue}"`,
                );
              }
            }

            // Извлекаем число из строки (берем первое число)
            const match = stringValue.match(/\d+/);
            if (match) {
              numberValue = parseFloat(match[0]);
              displayValue = String(numberValue);
            } else {
              // Если не удалось извлечь число, пропускаем это значение
              console.warn(
                `[getCategoryAttributes] Could not extract number from: "${stringValue}"`,
              );
              continue;
            }
          }

          if (numberValue != null || displayValue) {
            const valueKey = displayValue || String(numberValue);
            const externalId =
              attrValue.external_id || String(attrValue.id || "");

            const existing = attr.values.get(valueKey);
            if (existing) {
              // Накапливаем все external_id, чтобы фильтр по одному значению
              // (например, 380 В) охватывал все товары с этим значением
              if (existing.id) {
                // Избегаем дубликатов
                const existingIds = existing.id.split(",").filter(Boolean);
                if (!existingIds.includes(externalId)) {
                  existingIds.push(externalId);
                  existing.id = existingIds.join(",");
                  // Логирование для отладки накопления
                  if (existingIds.length > 5 && existingIds.length % 10 === 0) {
                    console.log(
                      `[getCategoryAttributes] Accumulated ${existingIds.length} external_ids for "${attrName}" value "${valueKey}"`,
                    );
                  }
                }
              } else {
                existing.id = externalId;
              }
            } else {
              attr.values.set(valueKey, {
                id: externalId,
                value: numberValue || parseFloat(displayValue) || 0,
              });
            }
          }
        } else if (
          attrType === "range" &&
          attrValue.range_min != null &&
          attrValue.range_max != null
        ) {
          const valueKey = `${attrValue.range_min}-${attrValue.range_max}`;
          if (!attr.values.has(valueKey)) {
            attr.values.set(valueKey, {
              id: attrValue.external_id || String(attrValue.id || ""),
              min: attrValue.range_min,
              max: attrValue.range_max,
            });
          }
        } else if (attrType === "string" && attrValue.string_value) {
          let stringValue = String(attrValue.string_value);
          const originalValue = stringValue;

          // Для характеристик с габаритами удаляем "Д×Ш×В" или "ДхШхВ" из значений
          // Удаляем в любом месте строки (не только в конце)
          if (isDimensionsAttribute && (hasWidth || hasHeight || hasLength)) {
            // Используем более простой и надежный паттерн
            // Удаляем с пробелами вокруг
            stringValue = stringValue
              .replace(/\s+[Дд][×хХX][Шш][×хХX][Вв]\s+/gi, " ")
              .trim();
            stringValue = stringValue
              .replace(/\s*[Дд][×хХX][Шш][×хХX][Вв]\s*/gi, "")
              .trim();
            // Дополнительная проверка для точного совпадения
            if (stringValue.includes("ДхШхВ")) {
              stringValue = stringValue.replace(/ДхШхВ/gi, "").trim();
            }
            if (stringValue.includes("Д×Ш×В")) {
              stringValue = stringValue.replace(/Д×Ш×В/g, "").trim();
            }
            // Удаляем лишние пробелы
            stringValue = stringValue.replace(/\s+/g, " ").trim();

            // Логирование для отладки
            if (originalValue !== stringValue) {
              console.log(
                `[getCategoryAttributes] Cleaned value: "${originalValue}" -> "${stringValue}"`,
              );
            }
          }

          const valueKey = stringValue;
          if (!attr.values.has(valueKey)) {
            attr.values.set(valueKey, {
              id: attrValue.external_id || String(attrValue.id || ""),
              label: stringValue,
            });
          }
        } else if (
          attrType === "boolean" &&
          attrValue.boolean_value !== undefined
        ) {
          // Для boolean создаем значения "Да" и "Нет"
          const valueKey = String(attrValue.boolean_value);
          const label = attrValue.boolean_value ? "Да" : "Нет";
          if (!attr.values.has(valueKey)) {
            attr.values.set(valueKey, {
              id: attrValue.external_id || String(attrValue.id || ""),
              label: label,
            });
          }
        }
      }

      // Фильтруем: оставляем только те характеристики, у которых более 2 уникальных значений
      const result: AttributeFilter[] = [];

      for (const attr of attributesMap.values()) {
        // Изменено: теперь показываем характеристики с 2+ уникальными значениями (вместо >2)
        if (attr.values.size >= 2) {
          result.push({
            id: attr.id,
            name: attr.name,
            type: attr.type,
            unit: attr.unit,
            values: Array.from(attr.values.values()),
          });
        }
      }

      // Сортируем значения
      for (const attr of result) {
        if (attr.type === "number") {
          attr.values.sort((a, b) => (a.value || 0) - (b.value || 0));
        } else if (attr.type === "range") {
          // Для range сортируем по min
          attr.values.sort((a, b) => (a.min || 0) - (b.min || 0));
        } else if (attr.type === "string" || attr.type === "boolean") {
          // Для string и boolean сортируем по label
          attr.values.sort((a, b) =>
            (a.label || "").localeCompare(b.label || ""),
          );
        }
      }

      // Сохраняем в кэш
      setServerCache(cacheKey, result, CACHE_TTL, CACHE_VERSION).catch(
        (error) => {
          console.warn("Failed to cache category attributes:", error);
        },
      );

      // Логирование для отладки
      if (result.length === 0) {
        console.log(
          `[getCategoryAttributes] No attributes found for category ${categorySlug}. Products: ${productIds.length}, Attributes in map: ${attributesMap.size}`,
        );
      } else {
        console.log(
          `[getCategoryAttributes] Found ${result.length} attributes for category ${categorySlug}:`,
          result.map((a) => `${a.name} (${a.type}, ${a.values.length} values)`),
        );
        // Логирование для отладки number фильтров
        result
          .filter((a) => a.type === "number")
          .forEach((attr) => {
            attr.values.forEach((val) => {
              const idCount = val.id.split(",").filter(Boolean).length;
              console.log(
                `[getCategoryAttributes] Attribute "${attr.name}" value "${val.value}" has ${idCount} external_ids`,
              );
              if (idCount > 1) {
                const ids = val.id.split(",").filter(Boolean);
                console.log(
                  `[getCategoryAttributes] First 5 external_ids:`,
                  ids.slice(0, 5),
                );
                if (ids.length > 5) {
                  console.log(
                    `[getCategoryAttributes] ... and ${ids.length - 5} more`,
                  );
                }
              }
            });
          });
      }

      return result;
    } catch (error) {
      // Обрабатываем разные типы ошибок
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : "";

      // Игнорируем ошибки "aborted" и "timeout" - они возникают при отмене запросов Next.js
      if (
        errorMessage.toLowerCase().includes("aborted") ||
        errorMessage.toLowerCase().includes("abort") ||
        errorName === "AbortError" ||
        (error instanceof DOMException && error.name === "AbortError") ||
        errorMessage.toLowerCase().includes("timeout")
      ) {
        // Не логируем как ошибку - это нормальное поведение при отмене запросов
        return [];
      }

      // Для других ошибок логируем предупреждение
      console.warn("Error fetching category attributes:", error);
      return [];
    }
  },
);
