import { useCartStore, type CartItem } from "@/entities/cart/model/store";
import styles from "./CartItem.module.scss";
import Image from "next/image";
import { formattedPrice } from "@/entities/product/lib/formattedPrice";
import { useRouter } from "next/navigation";
import { getProductImageUrl } from "@/shared/lib/helpers/imageUrl";

export function CartItem({ id, item }: { id: string; item: CartItem }) {
  const router = useRouter();
  const changeQuantity = useCartStore((state) => state.updateItemQuantity);
  const deleteItemToShop = useCartStore((state) => state.removeItem);

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
            deleteItemToShop(id);
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
          <div className={styles.counter}>
            <button
              className={`${styles.counterBtn} ${
                item.quantity <= 1 && styles.disabledCounterBtn
              }`}
              onClick={(e) => {
                e.stopPropagation();
                changeQuantity(id, item.quantity - 1);
              }}
            >
              -
            </button>
            <span className={styles.counterDisplay}>{item.quantity}</span>
            <button
              className={styles.counterBtn}
              onClick={(e) => {
                e.stopPropagation();
                changeQuantity(id, item.quantity + 1);
              }}
            >
              +
            </button>
          </div>

          <p className={styles.finalyPrice}>
            <b>Итого:</b>
            {` ${formattedPrice(item.price * item.quantity)}`}
          </p>
        </div>
      </div>
      <p className={styles.article}>Артикул: {item.SKU}</p>
    </div>
  );
}
