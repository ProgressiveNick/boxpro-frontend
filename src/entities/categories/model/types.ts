// export type CategoryType = {
//   name: string;
//   imgSrc?: string;
//   url: string;
//   text?: string;
// };

export type Category = {
  id: number;
  documentId?: string; // Strapi автоматически добавляет это поле
  name: string;
  slug: string;
  description?: string;
  img_menu?: {
    url: string;
  };
  childs?: Category[];
  parent?: Category;
};

export type CategoryCards = {
  name: string;
  imgSrc?: string;
  url?: string;
  isPromo?: boolean;
  links?: Array<{
    name: string;
    url: string;
  }>;
};
