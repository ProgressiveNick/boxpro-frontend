import Link from "next/link";
import styles from "./CategoriesCards.module.scss";
import { CategoryCard } from "@/entities/categories";
import { getCategoryCardsData } from "../model/getCategoryCardsData";

export async function CategoriesCards() {
  const cards = await getCategoryCardsData();

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Каталог оборудования</h2>
        <Link href="/catalog" className={styles.viewAllLink}>
          Смотреть всё
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
      <div className={styles.categoriesWrapper}>
        {cards.map((card, index) => (
          <CategoryCard card={card} key={index} index={index} />
        ))}
      </div>
    </section>
  );
}
