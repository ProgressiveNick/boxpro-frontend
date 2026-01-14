"use client";

import { useState, useEffect } from "react";
import styles from "./ProductInfoBlock.module.scss";
import { ProductType } from "@/entities/product";
import { AttributeValue } from "@/entities/product-attributes";

export function ProductInfoBlock({ product }: { product: ProductType }) {
    const [activeTab, setActiveTab] = useState("description");

    useEffect(() => {
        const handleSwitchTab = (event: Event) => {
            const customEvent = event as CustomEvent<{ tab?: string }>;
            const tab = customEvent.detail?.tab;
            if (tab === "characteristics") {
                setActiveTab("characteristics");
            }
        };

        window.addEventListener(
            "product-info:switch-tab",
            handleSwitchTab as EventListener
        );

        return () => {
            window.removeEventListener(
                "product-info:switch-tab",
                handleSwitchTab as EventListener
            );
        };
    }, []);

    const characteristicsList = (product: ProductType): AttributeValue[] => {
        return product.harakteristici.filter(
            (item: AttributeValue) =>
                !item.harakteristica.name.includes("Наличие")
        );
    };

    return (
        <div className={styles.productInfo}>
            <div className={styles.productInfoHead}>
                <h3
                    className={`${styles.productInfoTitle} ${
                        activeTab === "description" && styles.activeTab
                    }`}
                    onClick={() => setActiveTab("description")}
                >
                    Описание
                </h3>

                <h3
                    className={`${styles.productInfoTitle} ${
                        activeTab === "characteristics" && styles.activeTab
                    }`}
                    onClick={() => setActiveTab("characteristics")}
                >
                    Характеристики
                </h3>

                <h3
                    className={`${styles.productInfoTitle} ${
                        activeTab === "payment" && styles.activeTab
                    }`}
                    onClick={() => setActiveTab("payment")}
                >
                    Оплата
                </h3>

                <h3
                    className={`${styles.productInfoTitle} ${
                        activeTab === "delivery" && styles.activeTab
                    }`}
                    onClick={() => setActiveTab("delivery")}
                >
                    Доставка
                </h3>
            </div>

            {activeTab === "description" && (
                <div
                    className={styles.productInfoDescription}
                    dangerouslySetInnerHTML={{
                        __html: product.description as string,
                    }}
                />
            )}

            {activeTab === "characteristics" && (
                <div id="product-characteristics" className={styles.charsWrapper}>
                    {characteristicsList(product).map((item, index) => {
                        return (
                            <div className={styles.charItem} key={index}>
                                <p className={styles.charTitel}>
                                    {item.harakteristica.name}
                                </p>
                                <p className={styles.charValue}>
                                    {item.harakteristica.type === "string"
                                        ? item.string_value
                                        : item.number_value}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === "payment" && (
                <div className={styles.infoTextBlock}>
                    <p>
                        Мы принимаем любые удобные способы оплаты: наличные,
                        безналичный расчёт с р/с компании с выставлением счёта,
                        лизинг и кредитные программы.
                    </p>
                    <p>
                        Оставьте заявку — подготовим все документы и подскажем
                        оптимальный способ оплаты для ваших задач.
                    </p>
                </div>
            )}

            {activeTab === "delivery" && (
                <div className={styles.infoTextBlock}>
                    <p>
                        Помогаем подобрать транспортную компанию и организовать
                        доставку до нужного места.
                    </p>
                    <p>
                        Возможна отправка до нашего склада, откуда вы сможете
                        забрать заказ в удобное время или организовать выдачу
                        своему перевозчику.
                    </p>
                </div>
            )}
        </div>
    );
}
