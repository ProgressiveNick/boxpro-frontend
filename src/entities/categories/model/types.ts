// export type CategoryType = {
//   name: string;
//   imgSrc?: string;
//   url: string;
//   text?: string;
// };

export type Category = {
  id: number;
  documentId?: string; // Strapi автоматически добавляет это поле
  /**
   * ID категории из внешнего прайс-листа (external_id в Strapi).
   * В YML-фиде используем именно его как category id, чтобы удовлетворять требованиям Яндекса.
   */
  external_id?: string;
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
