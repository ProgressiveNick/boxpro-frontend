import { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/config/site";
import { getAllProductSlugs } from "@/entities/product/server";
import { getAllCategoryPaths } from "@/entities/categories";
import {
  getBlogSections,
  getAllBlogArticlePaths,
} from "@/entities/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/catalog`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/services`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/delivery`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/garant-and-remont`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/lizing`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/requisites`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/return`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contacts`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];

  // Сервисы
  const serviceSlugs = [
    "field-diagnostics",
    "computer-analysis",
    "manual-diagnostics",
    "replacement",
    "overhaul",
    "remont",
    "naladka",
    "obsluzhivanie",
  ];
  const services: MetadataRoute.Sitemap = serviceSlugs.map((service) => ({
    url: `${SITE_URL}/services/${service}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Динамические данные: параллельно с устойчивостью к сбоям
  const [productsResult, categoriesResult, blogSectionsResult, blogArticlesResult] =
    await Promise.allSettled([
      getAllProductSlugs(),
      getAllCategoryPaths(),
      getBlogSections(),
      getAllBlogArticlePaths(),
    ]);

  const productSlugs = productsResult.status === "fulfilled" ? productsResult.value : [];
  if (productsResult.status === "rejected") {
    console.warn("[sitemap] getAllProductSlugs failed:", productsResult.reason);
  }

  const categoryPaths = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  if (categoriesResult.status === "rejected") {
    console.warn("[sitemap] getAllCategoryPaths failed:", categoriesResult.reason);
  }

  const blogSections = blogSectionsResult.status === "fulfilled"
    ? blogSectionsResult.value?.data ?? []
    : [];
  if (blogSectionsResult.status === "rejected") {
    console.warn("[sitemap] getBlogSections failed:", blogSectionsResult.reason);
  }

  const blogArticlePaths = blogArticlesResult.status === "fulfilled"
    ? blogArticlesResult.value
    : [];
  if (blogArticlesResult.status === "rejected") {
    console.warn("[sitemap] getAllBlogArticlePaths failed:", blogArticlesResult.reason);
  }

  // Категории каталога
  const categoryPages: MetadataRoute.Sitemap = categoryPaths.map((path) => ({
    url: `${SITE_URL}/catalog/${path.join("/")}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Товары
  const productPages: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${SITE_URL}/product/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Блог: главная
  const blogMain: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: "weekly", priority: 0.7 },
  ];

  // Блог: разделы
  const blogSectionPages: MetadataRoute.Sitemap = blogSections
    .filter((s) => s.slug)
    .map((section) => ({
      url: `${SITE_URL}/blog/${section.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // Блог: статьи
  const blogArticlePages: MetadataRoute.Sitemap = blogArticlePaths.map(
    ({ sectionSlug, articleSlug }) => ({
      url: `${SITE_URL}/blog/${sectionSlug}/${articleSlug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })
  );

  return [
    ...staticPages,
    ...services,
    ...categoryPages,
    ...productPages,
    ...blogMain,
    ...blogSectionPages,
    ...blogArticlePages,
  ];
}
