export function formattedPrice(value: number | undefined): string {
  return value
    ? value
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, "\u2009")
        .concat(" ₽")
    : "По запросу";
}
