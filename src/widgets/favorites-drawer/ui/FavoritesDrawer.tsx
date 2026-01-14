import { useFavoritesStore } from "@/entities/favorites/model/store";
import styles from "./FavoritesDrawer.module.scss";
import Image from "next/image";
import { FavoriteItem } from "@/entities/favorite-item";

export function FavoritesDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const items = useFavoritesStore((state) => state.items);

  return (
    <>
      <div className={`${styles.drawer} ${isOpen ? `${styles.open}` : ""}`}>
        <div className={styles.drawerContent}>
          <div className={styles.head}>
            <h3 className={styles.title}>Избранное</h3>
            <Image
              src={"/icons/close.svg"}
              className={styles.closeButton}
              onClick={onClose}
              width={24}
              height={24}
              alt=""
            />
          </div>
          <div className={styles.body}>
            {items.length > 0 ? (
              items.map((item, index) => {
                return <FavoriteItem key={index} id={item.id} item={item} />;
              })
            ) : (
              <p>В избранном ничего нет </p>
            )}
          </div>
        </div>
      </div>
      {isOpen && <div className={styles.drawerOverlay} onClick={onClose}></div>}
    </>
  );
}
