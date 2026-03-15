import type { NextConfig } from "next";
import { readFile } from "fs/promises";
import path from "path";

const nextConfig: NextConfig = {
  async redirects() {
    try {
      const filePath = path.join(process.cwd(), "public/data/category-map.json");
      const raw = await readFile(filePath, "utf-8");
      const data = JSON.parse(raw) as {
        byDocumentId?: Record<
          string,
          { slug?: string; url?: string; parentDocumentId?: string | null }
        >;
      };
      if (!data?.byDocumentId || typeof data.byDocumentId !== "object") {
        return [];
      }
      const redirects: Array<{
        source: string;
        destination: string;
        permanent: boolean;
      }> = [];
      for (const node of Object.values(data.byDocumentId)) {
        if (node.parentDocumentId != null && node.slug && node.url) {
          const destination = node.url.startsWith("/")
            ? node.url
            : `/${node.url}`;
          redirects.push({
            source: `/catalog/${node.slug}`,
            destination,
            permanent: true,
          });
        }
      }
      return redirects;
    } catch {
      return [];
    }
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
