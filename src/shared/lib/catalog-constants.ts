/**
 * Slug категории "Запасные части и расходные материалы".
 * В этом разделе каталога показываются товары с part=true (запасные части),
 * в отличие от общего каталога, где показывается только оборудование (part=false).
 */
export const SPARE_PARTS_CATEGORY_SLUG =
  "zapasnye-chasti-i-rashodnye-materialy";

/**
 * Проверяет, находится ли пользователь в разделе запасных частей.
 * @param categoryPath - путь категории из URL (например, ["zapasnye-chasti-i-rashodnye-materialy"] или ["zapasnye-chasti-i-rashodnye-materialy", "subcategory"])
 */
export function isSparePartsSection(categoryPath: string[]): boolean {
  return categoryPath.includes(SPARE_PARTS_CATEGORY_SLUG);
}
