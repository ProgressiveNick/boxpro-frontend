

FROM node:22.15.0-alpine

WORKDIR /usr/src/app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости для production
RUN npm ci --omit=dev

# Копируем исходный код
COPY . .

# Build arguments для переменных окружения
ARG STRAPI_API_BASE_URL
ARG STRAPI_API_TOKEN
ARG TELEGRAM_BOT_TOKEN
ARG TELEGRAM_CHAT_ID
ARG NEXT_PUBLIC_STRAPI_API_URL
ARG NEXT_PUBLIC_STRAPI_URL

# Устанавливаем переменные окружения для сборки
ENV STRAPI_API_BASE_URL=$STRAPI_API_BASE_URL
ENV STRAPI_API_TOKEN=$STRAPI_API_TOKEN
ENV TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
ENV TELEGRAM_CHAT_ID=$TELEGRAM_CHAT_ID
ENV NEXT_PUBLIC_STRAPI_API_URL=$NEXT_PUBLIC_STRAPI_API_URL
ENV NEXT_PUBLIC_STRAPI_URL=$NEXT_PUBLIC_STRAPI_URL

# Отладочный вывод (удалить после проверки)
RUN echo "DEBUG: STRAPI_API_BASE_URL=$STRAPI_API_BASE_URL" && \
    echo "DEBUG: STRAPI_API_TOKEN length: ${#STRAPI_API_TOKEN}" && \
    echo "DEBUG: NEXT_PUBLIC_STRAPI_API_URL=$NEXT_PUBLIC_STRAPI_API_URL"

# Собираем приложение
RUN npm run build

# Создаем пустую public папку для volume mount
RUN mkdir -p /usr/src/app/public

# Устанавливаем права для пользователя node
RUN chown -R node:node /usr/src/app \
    && chmod -R 775 /usr/src/app/.next \
    && chmod -R 775 /usr/src/app/public

USER node

EXPOSE 3000

CMD ["npm", "start"]