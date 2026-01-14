import { NextRequest, NextResponse } from "next/server";
import {
  sendTelegramMessage,
} from "@/shared/lib/api/telegram";
import {
  getStrapiRecords,
  updateStrapiRecord,
  createStrapiRecord,
  uploadStrapiFiles,
} from "@/shared/lib/api/strapi";
import { STRAPI_API_CONFIG } from "@/shared/config/api";

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

// POST - создать отзыв для заказа
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    // id здесь - это documentId заказа
    const documentId = params.id;

    // Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init

    // Получаем заказ по documentId
    // Загружаем только нужные поля товара (name, documentId, price), без harakteristici
    // Не загружаем review, проверяем только по статусу заказа
    let orderResult;
    try {
      orderResult = await getStrapiRecords("zakazies", {
        "filters[documentId][$eq]": documentId,
        "populate[tovary][populate][tovar][fields][0]": "name",
        "populate[tovary][populate][tovar][fields][1]": "documentId",
        "populate[tovary][populate][tovar][fields][2]": "price",
        "populate[contact]": "*",
        publicationState: "live",
      });
    } catch (error) {
      console.error("Ошибка поиска заказа (live):", error);
      // Пробуем без publicationState (для черновиков)
      try {
        orderResult = await getStrapiRecords("zakazies", {
          "filters[documentId][$eq]": documentId,
          "populate[tovary][populate][tovar][fields][0]": "name",
          "populate[tovary][populate][tovar][fields][1]": "documentId",
          "populate[tovary][populate][tovar][fields][2]": "price",
          "populate[contact]": "*",
        });
      } catch (draftError) {
        console.error("Ошибка поиска заказа (draft):", draftError);
        return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
      }
    }

    if (!orderResult.data || orderResult.data.length === 0) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }

    const order = orderResult.data[0];

    // Проверяем статус заказа - отзыв можно оставить только если статус "Завершен"
    if (order.statuses !== "Завершен") {
      // Если заказ уже в статусе "Оставлен отзыв" - возвращаем 404
      if (order.statuses === "Оставлен отзыв") {
        return NextResponse.json(
          { error: "Отзыв для этого заказа уже оставлен" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Отзыв можно оставить только для завершенных заказов" },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    // Получаем данные отзыва
    const reviewsData = formData.get("reviews") as string;
    if (!reviewsData) {
      return NextResponse.json(
        { error: "Данные отзывов не предоставлены" },
        { status: 400 }
      );
    }

    const reviews = JSON.parse(reviewsData) as Array<{
      productId: string;
      dignities?: string;
      disadvantages?: string;
      cooperation?: string;
      score: number;
    }>;

    // Валидация данных
    for (const review of reviews) {
      if (!review.productId || !review.score) {
        return NextResponse.json(
          { error: "Не все обязательные поля заполнены" },
          { status: 400 }
        );
      }

      if (review.score < 1 || review.score > 5) {
        return NextResponse.json(
          { error: "Оценка должна быть от 1 до 5" },
          { status: 400 }
        );
      }
    }

    // Получаем или создаем buyer
    let buyerId: number | null = null;
    const buyerEmail = order.contact?.email;

    if (buyerEmail) {
      try {
        // Ищем существующего buyer по email
        const buyerResult = await getStrapiRecords("buyers", {
          "filters[email][$eq]": buyerEmail,
          publicationState: "live",
        });

        if (buyerResult.data && buyerResult.data.length > 0) {
          buyerId = buyerResult.data[0].id;
        } else {
          // Создаем нового buyer
          const buyerName = generateBuyerName();
          try {
            const createBuyerResult = await createStrapiRecord("buyers", {
              name: buyerName,
              email: buyerEmail,
              publishedAt: new Date().toISOString(), // Публикуем сразу
            });
            buyerId = createBuyerResult.data.id;
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
        console.log(
          `Создан новый buyer без email: ${buyerName} (ID: ${buyerId})`
        );
      } catch (error) {
        console.error("Ошибка создания buyer:", error);
      }
    }

    // Создаем отзывы для каждого товара
    const createdReviews = [];

    for (let i = 0; i < reviews.length; i++) {
      const reviewData = reviews[i];

      // Получаем файлы для этого товара из formData
      let uploadedFileIds: number[] = [];
      const productFiles = formData.getAll(`product_${i}_files`);

      if (productFiles && productFiles.length > 0) {
        // Создаем FormData для загрузки файлов в Strapi
        const uploadFormData = new FormData();
        for (const fileEntry of productFiles) {
          if (fileEntry instanceof File) {
            // В Next.js File можно напрямую использовать в FormData
            uploadFormData.append("files", fileEntry);
          }
        }

        try {
          uploadedFileIds = await uploadStrapiFiles(uploadFormData);
        } catch (error) {
          console.error("Ошибка загрузки файлов:", error);
        }
      }

      // Получаем ID товара по documentId
      let productId: number;
      try {
        const productResult = await getStrapiRecords("tovaries", {
          "filters[documentId][$eq]": reviewData.productId,
          publicationState: "live",
        });

        if (productResult.data && productResult.data.length > 0) {
          productId = productResult.data[0].id;
        } else {
          console.error(`Товар с documentId ${reviewData.productId} не найден`);
          continue;
        }
      } catch (error) {
        console.error("Ошибка поиска товара:", error);
        continue;
      }

      // Создаем отзыв
      // Получаем documentId для товара и заказа для связей
      let productDocumentId: string;
      try {
        const productResult = await getStrapiRecords("tovaries", {
          "filters[id][$eq]": productId,
          publicationState: "live",
        });
        if (productResult.data && productResult.data.length > 0) {
          productDocumentId = productResult.data[0].documentId;
        } else {
          console.error(
            `Товар с id ${productId} не найден для получения documentId`
          );
          continue;
        }
      } catch (error) {
        console.error("Ошибка получения documentId товара:", error);
        continue;
      }

      // Получаем documentId для buyer, если есть
      let buyerDocumentId: string | null = null;
      if (buyerId) {
        try {
          const buyerResult = await getStrapiRecords("buyers", {
            "filters[id][$eq]": buyerId,
            publicationState: "live",
          });
          if (buyerResult.data && buyerResult.data.length > 0) {
            buyerDocumentId = buyerResult.data[0].documentId;
          }
        } catch (error) {
          console.error("Ошибка получения documentId buyer:", error);
        }
      }

      // В Strapi v5 для связей можно использовать documentId напрямую
      const reviewPayload: {
        dignities: string | null;
        disadvantages: string | null;
        cooperation: string | null;
        score: number;
        product: string;
        order: string;
        buyer?: string;
        files?: number[];
        publishedAt?: string;
      } = {
        dignities: reviewData.dignities || null,
        disadvantages: reviewData.disadvantages || null,
        cooperation: reviewData.cooperation || null,
        score: reviewData.score,
        product: productDocumentId,
        order: order.documentId,
        publishedAt: new Date().toISOString(), // Публикуем сразу
      };

      if (buyerDocumentId) {
        reviewPayload.buyer = buyerDocumentId;
      }

      if (uploadedFileIds.length > 0) {
        reviewPayload.files = uploadedFileIds;
      }

      try {
        console.log(
          "Создание отзыва с данными:",
          JSON.stringify(
            {
              productId: productId,
              productDocumentId: productDocumentId,
              orderId: order.id,
              orderDocumentId: order.documentId,
              buyerId: buyerId,
              buyerDocumentId: buyerDocumentId,
              files: uploadedFileIds.length,
              payload: reviewPayload,
            },
            null,
            2
          )
        );
        const reviewResult = await createStrapiRecord("reviews", reviewPayload);
        console.log(
          "Результат создания отзыва:",
          JSON.stringify(reviewResult, null, 2)
        );

        // Проверяем, что отзыв создан и получаем его с populate для проверки связей
        if (reviewResult.data?.id) {
          try {
            const populatedReview = await getStrapiRecords("reviews", {
              "filters[id][$eq]": reviewResult.data.id,
              "populate[product]": "*",
              "populate[buyer]": "*",
              "populate[order]": "*",
              publicationState: "live",
            });

            console.log("Проверка связей созданного отзыва:", {
              reviewId: reviewResult.data.id,
              product: populatedReview.data?.[0]?.product,
              buyer: populatedReview.data?.[0]?.buyer,
              order: populatedReview.data?.[0]?.order,
            });
          } catch (populateError) {
            console.error("Ошибка проверки связей отзыва:", populateError);
          }
        }

        createdReviews.push(reviewResult.data);
        console.log(`Отзыв успешно создан для товара ${productId}`, {
          reviewId: reviewResult.data.id,
          product: reviewResult.data.product,
          buyer: reviewResult.data.buyer,
          order: reviewResult.data.order,
        });
      } catch (error) {
        console.error("Ошибка создания отзыва:", error);
        if (error instanceof Error) {
          console.error("Детали ошибки:", error.message, error.stack);
        }
        return NextResponse.json(
          { error: "Ошибка создания отзыва" },
          { status: 500 }
        );
      }
    }

    // Обновляем статус заказа на "Оставлен отзыв"
    console.log(`Проверка созданных отзывов: ${createdReviews.length} отзывов`);
    if (createdReviews.length > 0) {
      console.log(
        `Попытка обновления статуса заказа ${order.documentId} (ID: ${order.id}) на "Оставлен отзыв"`
      );

      // Пробуем обновить через documentId (предпочтительно для Strapi v5)
      try {
        console.log(`Попытка обновления через documentId: ${order.documentId}`);
        const directUpdateResponse = await updateStrapiRecord(
          "zakazies",
          order.documentId,
          {
            statuses: "Оставлен отзыв",
            publishedAt: new Date().toISOString(),
          }
        );

        console.log(
          `Ответ обновления через documentId: ${directUpdateResponse.status} ${directUpdateResponse.statusText}`
        );

        if (directUpdateResponse.ok) {
          const directUpdateResult = await directUpdateResponse.json();
          console.log(
            `Статус заказа ${documentId} обновлен через documentId на "Оставлен отзыв"`,
            {
              documentId: order.documentId,
              numericId: order.id,
              status: directUpdateResult?.data?.statuses,
            }
          );
        } else {
          const errorText = await directUpdateResponse.text();
          console.error("Ошибка обновления через documentId:", errorText);

          // Пробуем через числовой ID
          try {
            console.log(`Попытка обновления через числовой ID: ${order.id}`);
            const updateResult = await updateStrapiRecord(
              "zakazies",
              order.id,
              {
                statuses: "Оставлен отзыв",
                publishedAt: new Date().toISOString(),
              }
            );
            console.log(
              `Статус заказа ${documentId} обновлен через числовой ID на "Оставлен отзыв"`,
              {
                orderId: order.id,
                updateResult: updateResult?.data?.statuses,
              }
            );
          } catch (numericError) {
            console.error("Ошибка обновления через числовой ID:", numericError);
          }
        }
      } catch (directError) {
        console.error("Ошибка обновления через documentId:", directError);
        // Пробуем через числовой ID
        try {
          console.log(`Попытка обновления через числовой ID: ${order.id}`);
          const updateResult = await updateStrapiRecord("zakazies", order.id, {
            statuses: "Оставлен отзыв",
            publishedAt: new Date().toISOString(),
          });
          console.log(
            `Статус заказа ${documentId} обновлен через числовой ID на "Оставлен отзыв"`,
            {
              orderId: order.id,
              updateResult: updateResult?.data?.statuses,
            }
          );
        } catch (numericError) {
          console.error("Ошибка обновления через числовой ID:", numericError);
        }
      }

      // Отправляем уведомление в Telegram о новых отзывах
      try {
        await sendReviewTelegramNotification(
          documentId,
          order,
          createdReviews,
          buyerId
        );
      } catch (error) {
        console.error("Ошибка отправки уведомления в Telegram:", error);
        // Не прерываем выполнение, так как отзывы уже созданы
      }
    } else {
      console.error("Нет созданных отзывов, статус заказа не обновляется");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Отзывы успешно созданы",
        reviews: createdReviews,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка обработки отзывов:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// Функция для отправки уведомления о новых отзывах в Telegram
async function sendReviewTelegramNotification(
  orderDocumentId: string,
  order: {
    id: number;
    documentId: string;
    contact?: {
      phone?: string;
      email?: string;
    } | null;
    tovary?: Array<{
      tovar?: {
        name: string;
        documentId: string;
      };
    }>;
  },
  reviews: Array<{
    id: number;
    score?: number;
    attributes?: {
      score?: number;
    };
    product?:
      | number
      | {
          data?: {
            id: number;
          };
        };
  }>,
  buyerId: number | null
) {

  // Получаем информацию о buyer, если есть
  let buyerName = "Анонимный пользователь";
  if (buyerId) {
    try {
      const buyerResult = await getStrapiRecords("buyers", {
        "filters[id][$eq]": buyerId,
        publicationState: "live",
      });
      if (buyerResult.data && buyerResult.data.length > 0) {
        buyerName = buyerResult.data[0].name || buyerName;
      }
    } catch (error) {
      console.error("Ошибка получения информации о buyer:", error);
    }
  }

  // Формируем список товаров с отзывами
  // Получаем информацию о товарах из отзывов
  const reviewsTextArray = await Promise.all(
    reviews.map(async (review) => {
      let productId: number | null = null;
      if (typeof review.product === "number") {
        productId = review.product;
      } else if (
        typeof review.product === "object" &&
        review.product &&
        "data" in review.product &&
        review.product.data &&
        typeof review.product.data === "object" &&
        "id" in review.product.data
      ) {
        productId = review.product.data.id as number;
      }

      const score = review.score || review.attributes?.score || "N/A";

      let productName = "Товар";
      if (productId) {
        try {
          const productResult = await getStrapiRecords("tovaries", {
            "filters[id][$eq]": productId,
            publicationState: "live",
          });
          if (productResult.data && productResult.data.length > 0) {
            productName = productResult.data[0].name || productName;
          }
        } catch (error) {
          console.error("Ошибка получения информации о товаре:", error);
        }
      }

      return `• ${productName} - Оценка: ${score}/5`;
    })
  );

  const reviewsText = reviewsTextArray.join("\n");

  const message = `
⭐ *Новый отзыв о заказе* (ID: ${orderDocumentId})

👤 *Автор:* ${buyerName}
📋 *Заказ:* #${orderDocumentId}
${order.contact?.phone ? `📞 *Телефон:* ${order.contact.phone}` : ""}
${order.contact?.email ? `📧 *Email:* ${order.contact.email}` : ""}

📝 *Отзывы о товарах:*
${reviewsText}

📊 *Всего отзывов:* ${reviews.length}
📅 *Дата:* ${new Date().toLocaleString("ru-RU")}
  `;

  console.log("Отправка уведомления о отзывах в Telegram...");
  const success = await sendTelegramMessage(message, { parse_mode: "Markdown" });
  if (success) {
    console.log("Уведомление успешно отправлено в Telegram");
  }
  return success;
}
