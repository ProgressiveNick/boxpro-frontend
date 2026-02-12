/**
 * Server-side функции для запросов к блогу (для SSR)
 * Используются только в server components
 */

export {
  getBlogSections,
} from "./getBlogSections";

export {
  getBlogSectionBySlug,
} from "./getBlogSectionBySlug";

export {
  getBlogs,
} from "./getBlogs";

export {
  getBlogBySlug,
} from "./getBlogBySlug";

export {
  getAllBlogArticlePaths,
} from "./getAllBlogArticlePaths";
export type { BlogArticlePath } from "./getAllBlogArticlePaths";


