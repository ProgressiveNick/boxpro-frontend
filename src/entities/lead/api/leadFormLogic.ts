/**
 * Бизнес-логика формы заявки (консультация). Для использования из Server Actions.
 */

import { sendTelegramMessage } from "@/shared/lib/api/telegram";
import { createStrapiRecord } from "@/shared/lib/api/strapi";

export interface LeadFormData {
  name: string;
  phone: string;
  message?: string;
  urlPage?: string;
}

async function sendLeadFormTelegramMessage(
  formData: LeadFormData
): Promise<boolean> {
  const message = `
🔔 *Новая заявка с сайта*

👤 *Имя:* ${formData.name}
📞 *Телефон:* +7 ${formData.phone}
${formData.message ? `📝 *Сообщение:* ${formData.message}` : ""}
*Отправлено со страницы:* ${formData.urlPage ?? ""}
📅 *Дата заявки:* ${new Date().toLocaleString("ru-RU")}
  `;

  return sendTelegramMessage(message, { parse_mode: "Markdown" });
}

async function saveLeadToStrapi(
  formData: LeadFormData
): Promise<{ id?: number } | null> {
  try {
    const result = await createStrapiRecord("lidies", {
      lead_type: "Консультация",
      statuses: "Ожидает обработки",
      contact: {
        name: formData.name,
        phone: `+7${formData.phone}`,
        comment: formData.message || "",
      },
    });
    return result?.data ?? null;
  } catch (error) {
    console.error("Ошибка сохранения заявки в Strapi:", error);
    return null;
  }
}

export async function submitLeadFormLogic(
  formData: LeadFormData
): Promise<{
  success: boolean;
  message?: string;
  strapiId?: number;
  error?: string;
}> {
  const telegramSuccess = await sendLeadFormTelegramMessage(formData);
  if (!telegramSuccess) {
    return { success: false, error: "Ошибка отправки уведомления" };
  }

  const strapiResult = await saveLeadToStrapi(formData);
  if (!strapiResult) {
    return { success: false, error: "Ошибка сохранения данных" };
  }

  return {
    success: true,
    message:
      "Заявка успешно отправлена! Менеджер уже спешит связаться с вами!",
    strapiId: strapiResult.id,
  };
}
