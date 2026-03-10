/**
 * Бизнес-логика формы заявки на тестирование. Для использования из Server Actions.
 */

import {
  sendTelegramMessageWithFiles,
} from "@/shared/lib/api/telegram";
import { createStrapiRecord } from "@/shared/lib/api/strapi";

export interface TestFormFile {
  name: string;
  type: string;
  size: number;
  buffer: Buffer;
}

export interface TestFormData {
  name: string;
  company: string;
  phone: string;
  message: string;
  urlPage?: string;
  files: TestFormFile[];
}

async function sendTestFormTelegramMessage(
  formData: TestFormData
): Promise<boolean> {
  const message = `
🔔 *Новая заявка на бесплатное тестирование оборудования*

👤 *Имя:* ${formData.name}
🏢 *Компания:* ${formData.company}
📞 *Телефон:* ${formData.phone}
📝 *Описание продукта:* ${formData.message}
*Отправлено со страницы:* ${formData.urlPage ?? ""}
📅 *Дата заявки:* ${new Date().toLocaleString("ru-RU")}
  `;

  const files =
    formData.files?.length > 0
      ? formData.files.map((file) => ({
          buffer: file.buffer,
          name: file.name,
          type: file.type,
        }))
      : undefined;

  return sendTelegramMessageWithFiles(message, files, {
    parse_mode: "Markdown",
  });
}

async function saveTestFormToStrapi(
  formData: TestFormData
): Promise<{ id?: number } | null> {
  try {
    const result = await createStrapiRecord("zayavki-na-testirovanies", {
      name: formData.name,
      companyName: formData.company,
      phone: `+7${formData.phone}`,
      msg: formData.message,
      sostoyanie: "new",
      urlPage: formData.urlPage || "website",
    });
    return result?.data ?? null;
  } catch (error) {
    console.error("Ошибка сохранения заявки на тест в Strapi:", error);
    return null;
  }
}

export async function submitTestFormLogic(
  formData: TestFormData
): Promise<{
  success: boolean;
  message?: string;
  strapiId?: number;
  error?: string;
}> {
  const telegramSuccess = await sendTestFormTelegramMessage(formData);
  if (!telegramSuccess) {
    return { success: false, error: "Ошибка отправки уведомления в Telegram" };
  }

  const strapiResult = await saveTestFormToStrapi(formData);
  if (!strapiResult) {
    return { success: false, error: "Ошибка сохранения данных" };
  }

  return {
    success: true,
    message: "Заявка успешно отправлена",
    strapiId: strapiResult.id,
  };
}
