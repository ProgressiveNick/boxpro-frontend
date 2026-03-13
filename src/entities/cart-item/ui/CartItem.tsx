import { useCartStore, type CartItem } from "@/entities/cart/model/store";
import styles from "./CartItem.module.scss";
import Image from "next/image";
import { useEffect, useRef, useState, startTransition } from "react";
import { formattedPrice } from "@/entities/product/lib/formattedPrice";
import { useRouter } from "next/navigation";
import { getProductImageUrl } from "@/shared/lib/helpers/imageUrl";
import {
  pushEcommerceEvent,
  ECOMMERCE_CURRENCY,
  type EcommerceProduct,
} from "@/shared/lib/analytics/yandexEcommerce";

const REMOVE_DELAY_SEC = 2;

export function CartItem({ id, item }: { id: string; item: CartItem }) {
  const router = useRouter();
  const changeQuantity = useCartStore((state) => state.updateItemQuantity);
  const deleteItemToShop = useCartStore((state) => state.removeItem);
  const [pendingRemove, setPendingRemove] = useState(false);
  const [countdown, setCountdown] = useState(REMOVE_DELAY_SEC);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const performRemove = () => {
    const p: EcommerceProduct = {
      id: item.id,
      name: item.title,
      price: item.price,
      quantity: item.quantity,
      list: "Корзина",
    };
    pushEcommerceEvent({
      currencyCode: ECOMMERCE_CURRENCY,
      remove: { products: [p] },
    });
    deleteItemToShop(id);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingRemove(true);
    setCountdown(REMOVE_DELAY_SEC);
  };

  const handleCancelRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingRemove(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!pendingRemove) return;
    timerRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          if (mountedRef.current) {
            setTimeout(() => performRemove(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pendingRemove]);

  const handleCardClick = () => {
    if (item.slug) {
      startTransition(() => {
        router.push(`/product/${item.slug}`);
      });
    }
  };

  if (pendingRemove) {
    return (
      <div
        className={`${styles.container} ${styles.containerPendingRemove}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.pendingRemoveBlock}>
          <span className={styles.countdown}>
            Товар будет удален через {countdown} с
          </span>
          <button
            type="button"
            className={styles.cancelRemoveBtn}
            onClick={handleCancelRemove}
          >
            Отменить
          </button>
        </div>
      </div>
    );
  }

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
          onClick={handleRemoveClick}
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

          <p className={styles.finalyPrice}>{formattedPrice(item.price)}</p>
        </div>
      </div>
      <p className={styles.article}>Артикул: {item.SKU}</p>
    </div>
  );
}
