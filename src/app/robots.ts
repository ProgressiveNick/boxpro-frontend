import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/", "/admin/", "/private/", "/test-products/"],
    },
    sitemap: "https://boxpro.moscow/sitemap.xml",
  };
}

