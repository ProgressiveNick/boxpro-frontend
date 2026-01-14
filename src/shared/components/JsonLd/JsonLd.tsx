import Script from "next/script";

interface OrganizationSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo: string;
  description: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint: {
    telephone: string;
    contactType: string;
    email: string;
  };
  sameAs: string[];
}

interface ProductSchema {
  "@context": string;
  "@type": string;
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  priceCurrency?: string;
  offers: {
    "@type": string;
    price?: number;
    priceCurrency: string;
    availability: string;
    seller: {
      "@type": string;
      name: string;
    };
  };
  image?: string;
  category?: string;
  url?: string; // URL продукта для SEO
}

interface BreadcrumbSchema {
  "@context": string;
  "@type": string;
  itemListElement: Array<{
    "@type": string;
    position: number;
    name: string;
    item: string;
  }>;
}

interface WebsiteSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  description: string;
  potentialAction: {
    "@type": string;
    target: string;
    "query-input": string;
  };
}

export function OrganizationJsonLd() {
  const schema: OrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BoxPro",
    url: "https://boxpro.moscow",
    logo: "https://boxpro.moscow/logo.svg",
    description:
      "Упаковочное и производственное оборудование. Большой каталог товаров, услуги по обслуживанию и ремонту оборудования.",
    address: {
      streetAddress: "пл. Новая, д. 8, стр. 2, помещ. ¼",
      addressLocality: "Москва",
      postalCode: "127000",
      addressCountry: "RU",
    },
    contactPoint: {
      telephone: "+79265198808",
      contactType: "customer service",
      email: "mail@boxpro.moscow",
    },
    sameAs: ["https://boxpro.moscow"],
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductJsonLd({
  product,
}: {
  product: Omit<ProductSchema, "@context" | "@type" | "offers">;
}) {
  const schema: ProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    price: product.price,
    priceCurrency: product.priceCurrency,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.priceCurrency || "RUB",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "BoxPro",
      },
    },
    image: product.image,
    category: product.category,
    url: product.url, // URL продукта для SEO
  };

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  breadcrumbs,
}: {
  breadcrumbs: Omit<BreadcrumbSchema, "@context" | "@type">;
}) {
  const schema: BreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.itemListElement,
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteJsonLd() {
  const schema: WebsiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BoxPro",
    url: "https://boxpro.moscow",
    description: "Упаковочное и производственное оборудование",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://boxpro.moscow/catalog?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
