/**
 * Удаляет HTML-теги из строки, возвращая обычный текст.
 * Используется для отображения HTML-контента (например, из CKEditor) как plain text.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html || typeof html !== "string") {
    return "";
  }
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
