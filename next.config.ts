import type { NextConfig } from "next";

// Директивы CSP для работы Яндекс.Метрики (script-src, connect-src, img-src, frame-src, child-src)
// https://yandex.com/support/metrica/en/code/install-counter-csp.html
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru https://yastatic.net",
  "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru https://yastatic.net",
  "connect-src 'self' https://mc.yandex.ru wss://mc.yandex.ru https://yastatic.net",
  "img-src 'self' data: blob: https: https://mc.yandex.ru https://yandex.ru",
  "child-src 'self' blob: https://mc.yandex.ru",
  "frame-src 'self' blob: https://mc.yandex.ru",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "boxpro.moscow",
        port: "",
        pathname: "**",
      },
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
