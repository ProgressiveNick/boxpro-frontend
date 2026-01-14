export type BlogSectionType = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  headline?: string;
  articles?: BlogArticleType[];
};

export type BlogArticleType = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  article?: string; // HTML контент
  publish_date?: string; // Дата публикации
  preview?: {
    data?: {
      attributes?: {
        url: string;
        alternativeText?: string;
        width?: number;
        height?: number;
      };
    };
  };
  blog_sections?: BlogSectionType[];
};


