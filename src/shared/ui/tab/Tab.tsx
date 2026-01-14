"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./Tab.module.scss";

export type TabData = {
  label: string;
  icon?: React.ReactNode;
  iconPath?: string;
  tooltip?: string;
  onClick?: () => void;
};

type TabProps = {
  data: TabData;
  className?: string;
};

export function Tab({ data, className }: TabProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`${styles.tab} ${className || ""}`}
      onClick={data.onClick}
      onMouseEnter={() => data.tooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={styles.tabContent}>
        {data.iconPath && (
          <div className={styles.iconWrapper}>
            <Image
              src={data.iconPath}
              alt=""
              width={16}
              height={16}
              style={{ objectFit: "contain" }}
            />
          </div>
        )}
        {data.icon && <div className={styles.iconWrapper}>{data.icon}</div>}
        <span className={styles.text}>{data.label}</span>
      </div>
      {showTooltip && data.tooltip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipContent}>
            <p className={styles.tooltipText}>{data.tooltip}</p>
          </div>
          <div className={styles.tooltipArrow} />
        </div>
      )}
    </div>
  );
}

