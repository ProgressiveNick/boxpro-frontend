import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/shared/lib/api/telegram";
import { createStrapiRecord } from "@/shared/lib/api/strapi";

interface FormData {
  phone: string;
  urlPage?: string;
}

// Функция для отправки сообщения в Telegram
async function sendReturnCallTelegramMessage(formData: FormData) {
  const message = `
📞 *Новая заявка на обратный звонок*

📞 *Телефон:* ${formData.phone}
*Отправлено со страницы:* ${formData.urlPage}
📅 *Дата заявки:* ${new Date().toLocaleString("ru-RU")}
  `;

  console.log("Попытка отправки сообщения в Telegram...");
  const success = await sendTelegramMessage(message, { parse_mode: "Markdown" });
  if (success) {
    console.log("Сообщение успешно отправлено в Telegram");
  }
  return success;
}

// Функция для сохранения в Strapi
async function saveToStrapi(formData: FormData) {
  try {
    const result = await createStrapiRecord("lidies", {
      lead_type: "Консультация", // Для обратного звонка используем тип "Консультация"
      statuses: "Ожидает обработки",
      contact: {
        name: "Обратный звонок",
        phone: `+7${formData.phone}`,
        comment: `Заявка на обратный звонок со страницы: ${
          formData.urlPage || "website"
        }`,
      },
    });

    return result;
  } catch (error) {
    console.error("Ошибка сохранения в Strapi:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Получен запрос на /api/return-call");

    // Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init

    const formData = await request.formData();

    const phone = formData.get("phone") as string;
    const urlPage = formData.get("urlPage") as string;

    // Валидация данных
    if (!phone) {
      return NextResponse.json(
        { error: "Не все обязательные поля заполнены" },
        { status: 400 }
      );
    }

    // Подготовка данных для отправки
    const formDataForProcessing: FormData = {
      phone,
      urlPage,
    };

    // Отправка в Telegram
    const telegramSuccess = await sendReturnCallTelegramMessage(formDataForProcessing);

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
