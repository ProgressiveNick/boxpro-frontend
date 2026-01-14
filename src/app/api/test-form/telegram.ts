/**
 * Утилиты для работы с Telegram в контексте test-form
 * Использует централизованные функции из @/shared/lib/api/telegram
 * 
 * @deprecated Используйте функции напрямую из @/shared/lib/api/telegram
 * Этот файл оставлен для обратной совместимости
 */

import { bot, sendTelegramFile } from "@/shared/lib/api/telegram";
import type TelegramBot from "node-telegram-bot-api";

// Реэкспорт для обратной совместимости
export { bot };

// Функция для отправки сообщения (использует централизованный бот)
export async function sendMessage(
  chatId: string,
  message: string,
  options?: TelegramBot.SendMessageOptions
) {
  try {
    return await bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error("Ошибка отправки сообщения в Telegram:", error);
    throw error;
  }
}

// Функция для отправки файла (использует централизованную функцию)
export async function sendFile(
  chatId: string,
  fileBuffer: Buffer,
  fileName: string,
  fileType: string
) {
  try {
    // Используем централизованную функцию, но с кастомным chatId
    // В будущем можно расширить sendTelegramFile для поддержки кастомного chatId
    if (fileType.startsWith("image/")) {
      return await bot.sendPhoto(chatId, fileBuffer, { caption: fileName });
    } else if (fileType.startsWith("video/")) {
      return await bot.sendVideo(chatId, fileBuffer, { caption: fileName });
    } else {
      return await bot.sendDocument(chatId, fileBuffer, { caption: fileName });
    }
  } catch (error) {
    console.error("Ошибка отправки файла в Telegram:", error);
    throw error;
  }
}
