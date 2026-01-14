import { useCartStore } from "@/entities/cart/model/store";
import styles from "./CartDrawer.module.scss";
import Image from "next/image";
import { CartItem } from "@/entities/cart-item";
import { formattedPrice } from "@/entities/product/lib/formattedPrice";
import { OrderDrawer } from "@/features/order-form";
import { useState } from "react";

export function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

  const handleOrderClick = () => {
    if (items.length > 0) {
      setIsOrderFormOpen(true);
    }
  };

  const handleOrderClose = () => {
    setIsOrderFormOpen(false);
  };

  const handleOrderSuccess = () => {
    // Закрываем форму заказа
    setIsOrderFormOpen(false);
    // Закрываем корзину
    onClose();
  };

  return (
    <>
      <div className={`${styles.drawer} ${isOpen ? `${styles.open}` : ""}`}>
        <div className={styles.drawerContent}>
          <div className={styles.head}>
            <h3 className={styles.title}>Корзина</h3>
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
              items.map((item) => {
                return <CartItem key={item.id} id={item.id} item={item} />;
              })
            ) : (
              <p>Корзина пуста</p>
            )}
          </div>
          <div className={styles.bottomWrapper}>
            <div className={styles.totalPrice}>
              Сумма заказа: <b> {formattedPrice(totalPrice)}</b>
            </div>
          </div>
          <button
            className={`${styles.applyButton} ${
              !items.length ? `${styles.disabled}` : ""
            }`}
            onClick={handleOrderClick}
          >
            Оформить заказ
          </button>
        </div>
      </div>

      {isOpen && <div className={styles.drawerOverlay} onClick={onClose}></div>}

      <OrderDrawer
        isOpen={isOrderFormOpen}
        onClose={handleOrderClose}
        onSuccess={handleOrderSuccess}
      />
    </>
  );
}
