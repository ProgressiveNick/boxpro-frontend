import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/shared/lib/api/telegram";
import { createStrapiRecord } from "@/shared/lib/api/strapi";

interface FormData {
  name: string;
  phone: string;
  message?: string;
  urlPage?: string;
}

// Функция для отправки сообщения в Telegram
async function sendLeadFormTelegramMessage(formData: FormData) {
  const message = `
🔔 *Новая заявка с сайта*

👤 *Имя:* ${formData.name}
📞 *Телефон:* +7 ${formData.phone}
${formData.message ? `📝 *Сообщение:* ${formData.message}` : ""}
*Отправлено со страницы:* ${formData.urlPage}
📅 *Дата заявки:* ${new Date().toLocaleString("ru-RU")}
  `;

  return await sendTelegramMessage(message, { parse_mode: "Markdown" });
}

// Функция для сохранения в Strapi
async function saveToStrapi(formData: FormData) {
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

    return result;
  } catch (error) {
    console.error("Ошибка сохранения в Strapi:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;
    const urlPage = formData.get("urlPage") as string;

    // Валидация данных
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Не все обязательные поля заполнены" },
        { status: 400 }
      );
    }

    // Подготовка данных для отправки
    const formDataForProcessing: FormData = {
      name,
      phone,
      message,
      urlPage,
    };

    // Отправка в Telegram
    const telegramSuccess = await sendLeadFormTelegramMessage(formDataForProcessing);

    // Сохранение в Strapi
    const strapiResult = await saveToStrapi(formDataForProcessing);

    if (!telegramSuccess) {
      return NextResponse.json(
        { error: "Ошибка отправки уведомления" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Заявка успешно отправлена! Менеджер уже спешит связаться с вами!",
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
