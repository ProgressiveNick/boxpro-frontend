export default function getPagination(current: number, total: number) {
  const delta = 2;
  const pages = [];

  // Добавляем всегда 1-3 страницы сначала
  for (let i = 1; i <= Math.min(3, total); i++) {
    pages.push(i);
  }

  // Добавляем диапазон вокруг текущей страницы
  for (
    let i = Math.max(4, current - delta);
    i <= Math.min(total - 3, current + delta);
    i++
  ) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }

  // Добавляем 2-3 последних страницы
  for (let i = total - 2; i <= total; i++) {
    if (i > 3 && i <= total && !pages.includes(i)) {
      pages.push(i);
    }
  }

  // Сортируем и проставляем троеточия
  pages.sort((a, b) => a - b);

  const result = [];
  let prev;

  for (const page of pages) {
    if (prev) {
      if (page - prev === 2) {
        result.push(prev + 1);
      } else if (page - prev > 2) {
        result.push("...");
      }
    }
    result.push(page);
    prev = page;
  }

  return result;
}
