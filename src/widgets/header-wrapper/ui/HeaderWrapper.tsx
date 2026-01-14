import { getCatalogMenu } from "@/entities/categories/api/getCatalogMenu";
import { CatalogMenu, Header } from "@/widgets/client-widgets";

export async function HeaderWrapper() {
  const categories = await getCatalogMenu();
  const primaryCategories = categories.filter(
    (category) => category.childs && category.childs.length > 0
  );

  return (
    <>
      <Header />
      <CatalogMenu categories={primaryCategories} />
    </>
  );
}
