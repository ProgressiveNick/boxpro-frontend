/**
 * Инициализация валидации переменных окружения
 * Этот файл должен быть импортирован в самом начале приложения
 */

import { validateEnvVariablesOrThrow } from "./validate";

try {
  // Валидация выполняется только на сервере
  // На клиенте Next.js автоматически предоставляет NEXT_PUBLIC_* переменные
  if (typeof window === "undefined") {
    validateEnvVariablesOrThrow();
  }
} catch (error) {
  // В production режиме выводим понятное сообщение об ошибке и завершаем процесс
  if (process.env.NODE_ENV === "production") {
    console.error(
      "\n❌ КРИТИЧЕСКАЯ ОШИБКА: Приложение не может быть запущено из-за отсутствия обязательных переменных окружения.\n",
    );
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    console.error(
      "\n💡 Убедитесь, что все обязательные переменные окружения установлены в Docker контейнере.\n",
    );
    process.exit(1);
  }
  // В development режиме выбрасываем ошибку для отладки
  throw error;
}
