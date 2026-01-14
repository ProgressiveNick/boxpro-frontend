import { Category } from "@/entities/categories";
import { AttributeValue } from "@/entities/product-attributes";

export type ProductType = {
  documentId: string;
  name: string;
  price: number;
  previousPrice?: number | null; // Предыдущая цена для отображения изменений (deprecated, используйте price_history)
  price_history?: PriceHistoryItem[];
  slug: string;
  description: string | null;
  part?: boolean; // Флаг детали (true = деталь, false/null = товар)
  pathsImgs: PathsImg[];
  kategoria: Category;
  harakteristici: AttributeValue[];
  reviews?: Review[];
  asks?: Ask[];
  //   [key: string]: any;
};

export type PriceHistoryItem = {
  id?: number;
  price: number;
  currency_usd?: number | null;
  currency_cny?: number | null;
  date: string;
};

type PathsImg = {
  path: string;
};

export type Review = {
  id: number;
  documentId: string;
  dignities?: string | null;
  disadvantages?: string | null;
  cooperation?: string | null;
  score: number;
  files?: ReviewFile[];
  buyer?: {
    id: number;
    documentId: string;
    name?: string;
    email?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

type ReviewFile = {
  id: number;
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
};

export type Ask = {
  id: number;
  documentId: string;
  ask: string; // Заголовок вопроса
  ask_text: string; // Текст вопроса
  unswer?: string | null; // Ответ от BoxPro
  buyer?: {
    id: number;
    documentId: string;
    name?: string;
    email?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};
