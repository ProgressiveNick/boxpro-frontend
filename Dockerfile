

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
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_SECURE
ARG SMTP_USER
ARG SMTP_PASSWORD
ARG SMTP_FROM_EMAIL
ARG SMTP_TO_EMAIL

# Устанавливаем переменные окружения для сборки
ENV STRAPI_API_BASE_URL=$STRAPI_API_BASE_URL
ENV STRAPI_API_TOKEN=$STRAPI_API_TOKEN
ENV TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
ENV TELEGRAM_CHAT_ID=$TELEGRAM_CHAT_ID
ENV NEXT_PUBLIC_STRAPI_API_URL=$NEXT_PUBLIC_STRAPI_API_URL
ENV NEXT_PUBLIC_STRAPI_URL=$NEXT_PUBLIC_STRAPI_URL
ENV SMTP_HOST=$SMTP_HOST
ENV SMTP_PORT=$SMTP_PORT
ENV SMTP_SECURE=$SMTP_SECURE
ENV SMTP_USER=$SMTP_USER
ENV SMTP_PASSWORD=$SMTP_PASSWORD
ENV SMTP_FROM_EMAIL=$SMTP_FROM_EMAIL
ENV SMTP_TO_EMAIL=$SMTP_TO_EMAIL
# Отладочный вывод для проверки передачи переменных
RUN echo "DEBUG: STRAPI_API_BASE_URL=$STRAPI_API_BASE_URL" && \
    echo "DEBUG: STRAPI_API_TOKEN is set: $([ -n "$STRAPI_API_TOKEN" ] && echo yes || echo no)" && \
    echo "DEBUG: NEXT_PUBLIC_STRAPI_API_URL=$NEXT_PUBLIC_STRAPI_API_URL" && \
    echo "DEBUG: SMTP_HOST=$SMTP_HOST" && \
    echo "DEBUG: SMTP_PORT=$SMTP_PORT" && \
    echo "DEBUG: SMTP_SECURE=$SMTP_SECURE" && \
    echo "DEBUG: SMTP_USER=$SMTP_USER" && \
    echo "DEBUG: SMTP_PASSWORD is set: $([ -n "$SMTP_PASSWORD" ] && echo yes || echo no)" && \
    echo "DEBUG: SMTP_FROM_EMAIL=$SMTP_FROM_EMAIL" && \
    echo "DEBUG: SMTP_TO_EMAIL=$SMTP_TO_EMAIL"

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