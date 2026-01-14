"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function FooterNavBlock({
  title,
  items,
}: {
  title: string;
  items: Array<{
    label: string;
    link: string;
  }>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleList = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="footer-nav-block">
      <div className="footer-nav-block-head" onClick={toggleList}>
        <h4> {title}</h4>
        <div className={`toogleIcon ${isOpen ? "visible" : "hidden"}`}></div>
      </div>

      <ul
        className={`footer-nav-block-navlist ${isOpen ? "visible" : "hidden"}`}
      >
        {items.map((item, index) => (
          <li key={index} className="footer-nav-block-navlist-item">
            <Link href={item.link}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
