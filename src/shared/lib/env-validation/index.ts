/**
 * Библиотека для валидации переменных окружения
 * 
 * Использование:
 * ```typescript
 * import { validateEnvVariablesOrThrow } from "@/shared/lib/env-validation";
 * 
 * // В начале приложения (например, в layout.tsx или отдельном файле)
 * validateEnvVariablesOrThrow();
 * ```
 */

export { validateEnvVariables, validateEnvVariablesOrThrow } from "./validate";
export type { ValidationResult, ValidationError } from "./validate";
export { envValidationConfig } from "./config";
export type { Environment, EnvValidationConfig } from "./config";
