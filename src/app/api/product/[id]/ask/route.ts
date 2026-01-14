import { NextRequest, NextResponse } from "next/server";
import { getStrapiRecords, createStrapiRecord } from "@/shared/lib/api/strapi";

// Функция для генерации имени buyer в формате "Инженер-AB12345"
function generateBuyerName(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  // Генерируем 2 случайные буквы
  const randomLetters = Array.from(
    { length: 2 },
    () => letters[Math.floor(Math.random() * letters.length)]
  ).join("");

  // Генерируем 5 случайных цифр
  const randomNumbers = Array.from(
    { length: 5 },
    () => numbers[Math.floor(Math.random() * numbers.length)]
  ).join("");

  return `Инженер-${randomLetters}${randomNumbers}`;
}

// POST - создать вопрос для товара
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productDocumentId } = await props.params;

    if (!productDocumentId) {
      return NextResponse.json(
        { error: "ID товара не предоставлен" },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    // Получаем данные вопроса
    const title = formData.get("title") as string;
    const question = formData.get("question") as string;
    const email = formData.get("email") as string | null;

    // Валидация данных
    if (!title || !question) {
      return NextResponse.json(
        { error: "Не все обязательные поля заполнены" },
        { status: 400 }
      );
    }

    // Получаем товар по documentId
    const productResult = await getStrapiRecords("tovaries", {
      "filters[documentId][$eq]": productDocumentId,
      publicationState: "live",
    });

    if (!productResult.data || productResult.data.length === 0) {
      return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
    }

    const product = productResult.data[0];
    const productDocumentIdForRelation = product.documentId;

    // Получаем или создаем buyer
    let buyerId: number | null = null;
    let buyerDocumentId: string | null = null;

    if (email) {
      try {
        // Ищем существующего buyer по email
        const buyerResult = await getStrapiRecords("buyers", {
          "filters[email][$eq]": email,
          publicationState: "live",
        });

        if (buyerResult.data && buyerResult.data.length > 0) {
          buyerId = buyerResult.data[0].id;
          buyerDocumentId = buyerResult.data[0].documentId;
        } else {
          // Создаем нового buyer
          const buyerName = generateBuyerName();
          try {
            const createBuyerResult = await createStrapiRecord("buyers", {
              name: buyerName,
              email: email,
              publishedAt: new Date().toISOString(), // Публикуем сразу
            });
            buyerId = createBuyerResult.data.id;
            buyerDocumentId = createBuyerResult.data.documentId;
            console.log(`Создан новый buyer: ${buyerName} (ID: ${buyerId})`);
          } catch (error) {
            console.error("Ошибка создания buyer:", error);
            // Продолжаем без buyer
          }
        }
      } catch (error) {
        console.error("Ошибка работы с buyer:", error);
        // Продолжаем без buyer
      }
    } else {
      // Если нет email, создаем buyer без email (только с именем)
      try {
        const buyerName = generateBuyerName();
        const createBuyerResult = await createStrapiRecord("buyers", {
          name: buyerName,
          publishedAt: new Date().toISOString(), // Публикуем сразу
        });
        buyerId = createBuyerResult.data.id;
        buyerDocumentId = createBuyerResult.data.documentId;
        console.log(
          `Создан новый buyer без email: ${buyerName} (ID: ${buyerId})`
        );
      } catch (error) {
        console.error("Ошибка создания buyer:", error);
      }
    }

    // Создаем вопрос
    const askPayload: {
      ask: string;
      ask_text: string;
      product: string;
      buyer?: string;
      publishedAt?: string;
    } = {
      ask: title,
      ask_text: question,
      product: productDocumentIdForRelation,
      publishedAt: new Date().toISOString(), // Публикуем сразу
    };

    if (buyerDocumentId) {
      askPayload.buyer = buyerDocumentId;
    }

    try {
      console.log(
        "Создание вопроса с данными:",
        JSON.stringify(
          {
            productDocumentId: productDocumentIdForRelation,
            buyerId: buyerId,
            buyerDocumentId: buyerDocumentId,
            payload: askPayload,
          },
          null,
          2
        )
      );
      const askResult = await createStrapiRecord("asks", askPayload);
      console.log(
        "Результат создания вопроса:",
        JSON.stringify(askResult, null, 2)
      );

      return NextResponse.json(
        {
          success: true,
          message: "Вопрос успешно создан",
          ask: askResult.data,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Ошибка создания вопроса:", error);
      if (error instanceof Error) {
        console.error("Детали ошибки:", error.message, error.stack);
      }
      return NextResponse.json(
        { error: "Ошибка создания вопроса" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Ошибка обработки вопроса:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}




