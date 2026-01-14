import styles from "./FavoriteItem.module.scss";
import Image from "next/image";
import {
  type FavoriteItem,
  useFavoritesStore,
} from "@/entities/favorites/model/store";
import { useRouter } from "next/navigation";
import { getProductImageUrl } from "@/shared/lib/helpers/imageUrl";

export function FavoriteItem({ id, item }: { id: string; item: FavoriteItem }) {
  const router = useRouter();
  const deleteItemToFavorites = useFavoritesStore((state) => state.removeItem);

  const handleCardClick = () => {
    if (item.slug) {
      router.push(`/product/${item.slug}`);
    }
  };

  return (
    <div
      className={styles.container}
      onClick={handleCardClick}
      style={{ cursor: item.slug ? "pointer" : "default" }}
    >
      <div className={styles.info}>
        <h4 className={styles.title}>{item.title}</h4>
        <Image
          className={styles.trash}
          src="/icons/trash.svg"
          width={24}
          height={24}
          alt=""
          onClick={(e) => {
            e.stopPropagation();
            deleteItemToFavorites(id);
          }}
        />
      </div>
      <div className={styles.wrapper}>
        <Image
          src={
            item?.imageURL
              ? getProductImageUrl(item.imageURL)
              : "/img/products/empty.jpg"
          }
          alt="empty img"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== "/img/products/empty.jpg") {
              target.src = "/img/products/empty.jpg";
            }
          }}
          width={130}
          height={100}
          className={styles.image}
        />
        {item.description && (
          <p className={styles.description}>{item.description}</p>
        )}
        <div className={styles.actions}>
          <p className={styles.finalyPrice}>
            <b>Цена:</b>
            {` ${item.price}  руб.`}
          </p>
        </div>
      </div>
      <p className={styles.article}>Артикул: {item.SKU}</p>
    </div>
  );
}
