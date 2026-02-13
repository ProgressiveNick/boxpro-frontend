import {
  getAbsoluteUrl,
  getAbsoluteImageUrl,
} from "@/shared/lib/helpers/absoluteUrl";

/** Санитизация JSON-LD для защиты от XSS (рекомендация Next.js). */
function safeJsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

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
  brand: {
    "@type": "Brand";
    name: string;
  };
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
  url?: string;
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

/** Элемент каталога по схеме Offer (строгая микроразметка Яндекса). */
export interface OfferCatalogItem {
  url: string;
  name: string;
  description: string;
  image?: string | null;
  availability?: string;
  price: number | string;
  priceCurrency?: string;
}

interface OfferCatalogSchema {
  "@context": string;
  "@type": "OfferCatalog";
  name: string;
  description: string;
  image: string;
  itemListElement: Array<{
    "@type": "Offer";
    url: string;
    name: string;
    description: string;
    image: string;
    availability: string;
    price: number | string;
    priceCurrency: string;
  }>;
}

export type OfferCatalogJsonLdProps = {
  name: string;
  description: string;
  image: string;
  itemListElement: OfferCatalogItem[];
};

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
    <script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export type ProductJsonLdProps = Omit<
  ProductSchema,
  "@context" | "@type" | "offers" | "brand"
> & {
  /** Бренд для строгой микроразметки (Яндекс). По умолчанию BoxPro. */
  brand?: { "@type": "Brand"; name: string };
  /** Относительный или абсолютный URL страницы товара (будет приведён к абсолютному). */
  url?: string;
  /** Относительный или абсолютный путь к изображению (будет приведён к абсолютному URL). */
  image?: string;
  /** URL доступности по schema.org (например https://schema.org/InStock). По умолчанию InStock. */
  availability?: string;
};

export function ProductJsonLd({ product }: { product: ProductJsonLdProps }) {
  const absoluteUrl = product.url ? getAbsoluteUrl(product.url) : undefined;
  const absoluteImage = product.image
    ? getAbsoluteImageUrl(product.image)
    : undefined;
  const availability =
    product.availability || "https://schema.org/InStock";

  const schema: ProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    price: product.price,
    priceCurrency: product.priceCurrency,
    brand: product.brand ?? { "@type": "Brand", name: "BoxPro" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.priceCurrency || "RUB",
      availability,
      seller: {
        "@type": "Organization",
        name: "BoxPro",
      },
    },
    image: absoluteImage,
    category: product.category,
    url: absoluteUrl,
  };

  return (
    <script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
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
    <script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export function OfferCatalogJsonLd({
  name,
  description,
  image,
  itemListElement,
}: OfferCatalogJsonLdProps) {
  const catalogImage = getAbsoluteImageUrl(image);
  const offers = itemListElement.map((item) => ({
    "@type": "Offer" as const,
    url: getAbsoluteUrl(item.url),
    name: item.name,
    description: item.description,
    image: getAbsoluteImageUrl(item.image ?? null),
    availability: item.availability ?? "https://schema.org/InStock",
    price: item.price,
    priceCurrency: item.priceCurrency ?? "RUB",
  }));

  const schema: OfferCatalogSchema = {
    "@context": "https://schema.org/",
    "@type": "OfferCatalog",
    name,
    description,
    image: catalogImage,
    itemListElement: offers,
  };

  return (
    <script
      id="offer-catalog-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
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
    <script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
