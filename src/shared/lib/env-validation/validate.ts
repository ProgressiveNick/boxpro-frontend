import { envValidationConfig, type Environment } from "./config";

export interface ValidationError {
  variable: string;
  message: string;
  side: "server" | "client";
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

/**
 * Получает текущее окружение из переменных окружения
 */
function getCurrentEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV;
  
  if (nodeEnv === "production") {
    return "production";
  }
  
  return "development";
}

/**
 * Проверяет наличие переменной окружения
 */
function isEnvVariableSet(variable: string): boolean {
  const value = process.env[variable];
  return value !== undefined && value !== null && value.trim() !== "";
}

/**
 * Валидирует переменные окружения для текущего окружения
 * @param environment - Окружение для валидации (если не указано, определяется автоматически)
 * @returns Результат валидации
 */
export function validateEnvVariables(
  environment?: Environment
): ValidationResult {
  const currentEnv = environment || getCurrentEnvironment();
  const config = envValidationConfig[currentEnv];
  
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // Валидация серверных переменных (только на сервере)
  if (typeof window === "undefined") {
    config.server.forEach((variable) => {
      if (!isEnvVariableSet(variable)) {
        errors.push({
          variable,
          message: `Переменная ${variable} обязательна для серверной стороны в окружении ${currentEnv}`,
          side: "server",
        });
      }
    });
  }

  // Валидация клиентских переменных
  config.client.forEach((variable) => {
    if (!isEnvVariableSet(variable)) {
      // Если есть опциональное значение, выдаем предупреждение
      if (config.optional && config.optional[variable]) {
        warnings.push(
          `Переменная ${variable} не установлена, используется значение по умолчанию: ${config.optional[variable]}`
        );
      } else {
        errors.push({
          variable,
          message: `Переменная ${variable} обязательна для клиентской стороны в окружении ${currentEnv}`,
          side: "client",
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Валидирует переменные окружения и выбрасывает ошибку, если валидация не прошла
 * @param environment - Окружение для валидации (если не указано, определяется автоматически)
 * @throws Error если валидация не прошла
 */
export function validateEnvVariablesOrThrow(
  environment?: Environment
): void {
  const result = validateEnvVariables(environment);

  if (result.warnings.length > 0) {
    console.warn("⚠️  Предупреждения переменных окружения:");
    result.warnings.forEach((warning) => {
      console.warn(`  - ${warning}`);
    });
  }

  if (!result.isValid) {
    const errorMessages = [
      `❌ Ошибки валидации переменных окружения (${environment || getCurrentEnvironment()}):`,
      ...result.errors.map(
        (error) => `  [${error.side}] ${error.variable}: ${error.message}`
      ),
      "",
      "💡 Убедитесь, что все обязательные переменные окружения установлены.",
      "💡 Для Docker используйте переменные окружения в docker-compose.yml или Dockerfile.",
    ];

    throw new Error(errorMessages.join("\n"));
  }

  if (typeof window === "undefined") {
    console.log(
      `✅ Все переменные окружения валидированы для окружения: ${environment || getCurrentEnvironment()}`
    );
  }
}
