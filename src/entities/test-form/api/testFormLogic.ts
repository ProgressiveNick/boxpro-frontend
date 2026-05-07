/**
 * Бизнес-логика формы заявки на тестирование. Для использования из Server Actions.
 */

import {
  sendEmailMessageWithFiles,
} from "@/shared/lib/api/email";
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

async function sendTestFormEmailMessage(
  formData: TestFormData
): Promise<boolean> {
  const message = [
    "Новая заявка на бесплатное тестирование оборудования",
    "",
    `Имя: ${formData.name}`,
    `Компания: ${formData.company}`,
    `Телефон: ${formData.phone}`,
    `Описание продукта: ${formData.message}`,
    `Отправлено со страницы: ${formData.urlPage ?? ""}`,
    `Дата заявки: ${new Date().toLocaleString("ru-RU")}`,
  ].join("\n");

  const files =
    formData.files?.length > 0
      ? formData.files.map((file) => ({
          content: file.buffer,
          filename: file.name,
          contentType: file.type,
        }))
      : undefined;

  return sendEmailMessageWithFiles(
    "Новая заявка на бесплатное тестирование оборудования",
    message,
    files
  );
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
  const emailSuccess = await sendTestFormEmailMessage(formData);
  if (!emailSuccess) {
    return { success: false, error: "Ошибка отправки уведомления" };
  }

  const strapiResult = await saveTestFormToStrapi(formData);
  if (!strapiResult) {
    // Не блокируем пользователя, если уведомление ушло, но Strapi временно недоступен.
    return {
      success: true,
      message: "Заявка успешно отправлена",
    };
  }

  return {
    success: true,
    message: "Заявка успешно отправлена",
    strapiId: strapiResult.id,
  };
}
