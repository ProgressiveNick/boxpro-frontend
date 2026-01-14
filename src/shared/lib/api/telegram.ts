/**
 * Утилиты для работы с Telegram ботом
 * Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init
 * Все конфигурации берутся из централизованного конфига @/shared/config/api
 */

import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_CONFIG } from "@/shared/config/api";

// Единый экземпляр бота для всего приложения
export const bot = new TelegramBot(TELEGRAM_CONFIG.botToken, {
  polling: false,
});

/**
 * Отправляет сообщение в Telegram
 * @param message - Текст сообщения
 * @param options - Опции отправки (parse_mode, и т.д.)
 * @returns true если успешно, false в случае ошибки
 */
export async function sendTelegramMessage(
  message: string,
  options?: TelegramBot.SendMessageOptions
): Promise<boolean> {
  try {
    await bot.sendMessage(TELEGRAM_CONFIG.chatId, message, options);
    return true;
  } catch (error) {
    console.error("Ошибка отправки сообщения в Telegram:", error);
    return false;
  }
}

/**
 * Отправляет файл в Telegram
 * @param fileBuffer - Буфер файла
 * @param fileName - Имя файла
 * @param fileType - MIME тип файла
 * @param caption - Подпись к файлу (опционально)
 * @returns true если успешно, false в случае ошибки
 */
export async function sendTelegramFile(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
  caption?: string
): Promise<boolean> {
  try {
    const fileCaption = caption || fileName;

    if (fileType.startsWith("image/")) {
      await bot.sendPhoto(TELEGRAM_CONFIG.chatId, fileBuffer, {
        caption: fileCaption,
      });
    } else if (fileType.startsWith("video/")) {
      await bot.sendVideo(TELEGRAM_CONFIG.chatId, fileBuffer, {
        caption: fileCaption,
      });
    } else {
      await bot.sendDocument(TELEGRAM_CONFIG.chatId, fileBuffer, {
        caption: fileCaption,
      });
    }

    return true;
  } catch (error) {
    console.error("Ошибка отправки файла в Telegram:", error);
    return false;
  }
}

/**
 * Отправляет несколько файлов в Telegram
 * @param files - Массив файлов с буферами, именами и типами
 * @returns true если все файлы отправлены успешно, false в случае ошибки
 */
export async function sendTelegramFiles(
  files: Array<{
    buffer: Buffer;
    name: string;
    type: string;
  }>
): Promise<boolean> {
  try {
    for (const file of files) {
      await sendTelegramFile(file.buffer, file.name, file.type);
    }
    return true;
  } catch (error) {
    console.error("Ошибка отправки файлов в Telegram:", error);
    return false;
  }
}

/**
 * Отправляет сообщение с файлами в Telegram
 * @param message - Текст сообщения
 * @param files - Массив файлов (опционально)
 * @param options - Опции отправки сообщения (parse_mode, и т.д.)
 * @returns true если успешно, false в случае ошибки
 */
export async function sendTelegramMessageWithFiles(
  message: string,
  files?: Array<{
    buffer: Buffer;
    name: string;
    type: string;
  }>,
  options?: TelegramBot.SendMessageOptions
): Promise<boolean> {
  try {
    // Сначала отправляем сообщение
    const messageSent = await sendTelegramMessage(message, options);
    if (!messageSent) {
      return false;
    }

    // Затем отправляем файлы, если они есть
    if (files && files.length > 0) {
      return await sendTelegramFiles(files);
    }

    return true;
  } catch (error) {
    console.error("Ошибка отправки сообщения с файлами в Telegram:", error);
    return false;
  }
}

