import { NextRequest, NextResponse } from "next/server";
import {
  sendTelegramMessageWithFiles,
} from "@/shared/lib/api/telegram";
import { createStrapiRecord } from "@/shared/lib/api/strapi";

interface FormFile {
  name: string;
  type: string;
  size: number;
  buffer: Buffer;
}

interface FormData {
  name: string;
  company: string;
  phone: string;
  message: string;
  urlPage?: string;
  files: FormFile[];
}

// Функция для отправки сообщения в Telegram
async function sendTestFormTelegramMessage(formData: FormData) {
  const message = `
🔔 *Новая заявка на бесплатное тестирование оборудования*

👤 *Имя:* ${formData.name}
🏢 *Компания:* ${formData.company}
📞 *Телефон:* ${formData.phone}
📝 *Описание продукта:* ${formData.message}
*Отправлено со страницы:* ${formData.urlPage}
📅 *Дата заявки:* ${new Date().toLocaleString("ru-RU")}
  `;

  console.log("Попытка отправки сообщения в Telegram...");

  // Подготавливаем файлы для отправки
  const files =
    formData.files && formData.files.length > 0
      ? formData.files.map((file) => ({
          buffer: file.buffer,
          name: file.name,
          type: file.type,
        }))
      : undefined;

  const success = await sendTelegramMessageWithFiles(
    message,
    files,
    { parse_mode: "Markdown" }
  );

  if (success) {
    console.log("Сообщение успешно отправлено в Telegram");
  }

  return success;
}

// Функция для сохранения в Strapi
async function saveToStrapi(formData: FormData) {
  try {
    const result = await createStrapiRecord("zayavki-na-testirovanies", {
      name: formData.name,
      companyName: formData.company,
      phone: `+7${formData.phone}`,
      msg: formData.message,
      sostoyanie: "new",
      urlPage: formData.urlPage || "website",
    });

    return result;
  } catch (error) {
    console.error("Ошибка сохранения в Strapi:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Получен запрос на /api/test-form");

    // Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;
    const urlPage = formData.get("urlPage") as string;
    // const needEquipmentSelection =
    //   formData.get("needEquipmentSelection") === "true";

    const files = formData.getAll("files") as File[];

    // Валидация данных
    if (!name || !company || !phone || !message) {
      return NextResponse.json(
        { error: "Не все обязательные поля заполнены" },
        { status: 400 }
      );
    }

    // Подготовка данных для отправки
    const formDataForProcessing: FormData = {
      name,
      company,
      phone,
      message,
      urlPage,
      // needEquipmentSelection,
      files: [],
    };

    // Обработка файлов
    if (files.length > 0) {
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        formDataForProcessing.files.push({
          name: file.name,
          type: file.type,
          size: file.size,
          buffer,
        });
      }
    }

    // Отправка в Telegram
    const telegramSuccess = await sendTestFormTelegramMessage(formDataForProcessing);

    // Сохранение в Strapi
    const strapiResult = await saveToStrapi(formDataForProcessing);

    // Проверяем успешность операций
    if (!telegramSuccess) {
      console.error("Ошибка отправки в Telegram");
      return NextResponse.json(
        { error: "Ошибка отправки уведомления в Telegram" },
        { status: 500 }
      );
    }

    if (!strapiResult) {
      console.error("Ошибка сохранения в Strapi");
      return NextResponse.json(
        { error: "Ошибка сохранения данных" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Заявка успешно отправлена",
        strapiId: strapiResult?.data?.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка обработки формы:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
