import { AttributeValue } from "@/entities/product-attributes";

export const getSku = (attributes: AttributeValue[]): string | undefined => {
  const skuAttribute = attributes?.find(
    (attr) => attr.harakteristica?.name === "Артикул"
  );
  const value =
    skuAttribute?.harakteristica?.type === "string"
      ? skuAttribute?.string_value
      : skuAttribute?.number_value;
  return typeof value === "string" ? value : undefined;
};
