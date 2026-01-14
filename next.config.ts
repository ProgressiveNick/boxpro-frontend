import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["boxpro.moscow"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "strapi", // Имя сервиса Strapi внутри Docker
        port: "1337",
        pathname: "**",
      },
      {
        protocol: "http", // Если ты используешь внешний IP/домен
        hostname: "195.133.25.30", // Замени на свой внешний IP или домен Nginx
        port: "1337", // Если Strapi доступен на 1337 снаружи
        pathname: "**",
      },
      {
        protocol: "http", // Если ты используешь внешний IP/домен
        hostname: "localhost", // Замени на свой внешний IP или домен Nginx
        port: "1337", // Если Strapi доступен на 1337 снаружи
        pathname: "**",
      },
    ],
    // Отключаем оптимизацию изображений в dev режиме для уменьшения ошибок
    // Это предотвратит попытки Next.js оптимизировать несуществующие изображения
    unoptimized: process.env.NODE_ENV === "development",
    // Минимальное время кеширования для уменьшения повторных запросов
    minimumCacheTTL: 60,
    // Разрешаем SVG изображения
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
