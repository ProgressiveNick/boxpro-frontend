/**
 * Бизнес-логика формы обратного звонка. Для использования из Server Actions.
 */

import { sendTelegramMessage } from "@/shared/lib/api/telegram";
import { createStrapiRecord } from "@/shared/lib/api/strapi";

export interface ReturnCallFormData {
  phone: string;
  urlPage?: string;
}

async function sendReturnCallTelegramMessage(
  formData: ReturnCallFormData
): Promise<boolean> {
  const message = `
📞 *Новая заявка на обратный звонок*

📞 *Телефон:* ${formData.phone}
*Отправлено со страницы:* ${formData.urlPage ?? ""}
📅 *Дата заявки:* ${new Date().toLocaleString("ru-RU")}
  `;

  return sendTelegramMessage(message, { parse_mode: "Markdown" });
}

async function saveReturnCallToStrapi(
  formData: ReturnCallFormData
): Promise<{ id?: number } | null> {
  try {
    const result = await createStrapiRecord("lidies", {
      lead_type: "Консультация",
      statuses: "Ожидает обработки",
      contact: {
        name: "Обратный звонок",
        phone: `+7${formData.phone}`,
        comment: `Заявка на обратный звонок со страницы: ${formData.urlPage || "website"}`,
      },
    });
    return result?.data ?? null;
  } catch (error) {
    console.error("Ошибка сохранения заявки на обратный звонок в Strapi:", error);
    return null;
  }
}

export async function submitReturnCallLogic(
  formData: ReturnCallFormData
): Promise<{
  success: boolean;
  message?: string;
  strapiId?: number;
  error?: string;
}> {
  const telegramSuccess = await sendReturnCallTelegramMessage(formData);
  if (!telegramSuccess) {
    return { success: false, error: "Ошибка отправки уведомления в Telegram" };
  }

  const strapiResult = await saveReturnCallToStrapi(formData);
  if (!strapiResult) {
    return { success: false, error: "Ошибка сохранения данных" };
  }

  return {
    success: true,
    message: "Заявка успешно отправлена",
    strapiId: strapiResult.id,
  };
}
