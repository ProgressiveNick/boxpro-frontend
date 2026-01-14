import { AttributeValue } from "@/entities/product-attributes";

export function getAvailabilityCities(
  characteristics: AttributeValue[]
): string[] {
  return characteristics
    .filter((char) => {
      const name = char.harakteristica?.name?.toLowerCase() || "";
      const type = char.harakteristica?.type;
      if (type !== "boolean") return false;
      return name.includes("наличие") || name.includes("склад");
    })
    .filter((char) => {
      const boolValue = (char as AttributeValue & { boolean_value?: boolean })
        .boolean_value;
      return boolValue === true;
    })
    .map((char) => {
      const charName = char.harakteristica?.name || "";
      let cityName = charName;
      cityName = cityName.replace(/^наличие\s*(в|на)?\s*/i, "").trim();
      if (!cityName || cityName.length < 2) {
        cityName = charName;
      }
      return cityName;
    })
    .filter((city) => city.length > 0);
}




