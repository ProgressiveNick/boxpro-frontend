import type { Metadata } from "next";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  canonical?: string; // Канонический URL (относительный путь)
  /** Абсолютный URL страницы для Open Graph (превью ссылки) */
  openGraphUrl?: string;
}

export function generateSEO(config: SEOConfig): Metadata {
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    robots: config.noIndex ? { index: false, follow: false } : undefined,
    alternates: config.canonical
      ? {
          canonical: config.canonical,
        }
      : undefined,
    openGraph: {
      title: config.title,
      description: config.description,
      type: config.type || "website",
      locale: "ru_RU",
      ...(config.openGraphUrl && { url: config.openGraphUrl }),
      images: config.image
        ? [
            {
              url: config.image,
              width: 1200,
              height: 630,
              alt: config.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: config.image ? [config.image] : undefined,
    },
  };
}

export function generateProductSEO(
  productName: string,
  description?: string,
  sku?: string,
  price?: number
): SEOConfig {
  return {
    title: `${productName} | BoxPro - упаковочное оборудование`,
    description:
      description ||
      `Купить ${productName} в BoxPro${sku ? `. Артикул: ${sku}` : ""}${
        price ? `. Цена: ${price}₽` : ""
      }. Доставка по всей России.`,
    keywords: `${productName}, упаковочное оборудование, купить оборудование${
      sku ? `, ${sku}` : ""
    }`,
    type: "website",
  };
}

export function generateCategorySEO(categoryName: string): SEOConfig {
  return {
    title: `${categoryName} | Каталог BoxPro - упаковочное оборудование`,
    description: `Купить ${categoryName} в каталоге BoxPro. Большой выбор упаковочного оборудования. Фильтрация по параметрам, доставка по всей России.`,
    keywords: `${categoryName}, упаковочное оборудование, каталог, фильтр товаров, купить оборудование`,
    type: "website",
  };
}

export function generateServiceSEO(serviceName: string): SEOConfig {
  return {
    title: `${serviceName} упаковочного оборудования | Услуги BoxPro`,
    description: `Профессиональные услуги ${serviceName.toLowerCase()} упаковочного оборудования по всей России. Выезд специалистов, диагностика, ремонт, обслуживание.`,
    keywords: `${serviceName.toLowerCase()}, упаковочное оборудование, услуги, диагностика, ремонт, обслуживание, выезд специалистов`,
    type: "website",
  };
}

export function generateBlogSEO(
  title: string,
  description?: string
): SEOConfig {
  return {
    title: `${title} | Блог BoxPro`,
    description:
      description || "Полезные статьи о упаковочном оборудовании",
    keywords: "блог, статьи, упаковочное оборудование, новости, полезные материалы",
    type: "website",
  };
}

export function generateBlogSectionSEO(
  sectionName: string,
  description?: string
): SEOConfig {
  return {
    title: `${sectionName} | Блог BoxPro`,
    description:
      description || `Статьи раздела ${sectionName}`,
    keywords: `${sectionName}, блог, статьи, упаковочное оборудование`,
    type: "website",
  };
}

export function generateBlogArticleSEO(
  articleName: string,
  description?: string
): SEOConfig {
  return {
    title: `${articleName} | Блог BoxPro`,
    description: description || articleName,
    keywords: `${articleName}, блог, статья, упаковочное оборудование`,
    type: "article",
  };
}