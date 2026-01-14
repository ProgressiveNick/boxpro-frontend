import React from "react";
import styles from "./CoverCategory.module.scss";

export function CoverCategory({
  headlineText,
  deskText,
}: {
  headlineText: string;
  deskText: string;
  classes?: string;
}) {
  return (
    <div className={styles.cover}>
      <h1 className={styles.title}>{headlineText}</h1>
      <p className={styles.desk}>{deskText}</p>
    </div>
  );
}
