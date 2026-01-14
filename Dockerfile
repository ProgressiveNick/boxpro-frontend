

FROM node:22.15.0-alpine

WORKDIR /usr/src/app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости для production
RUN npm ci --omit=dev

# Копируем исходный код
COPY . .


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