"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin, X } from "lucide-react";
import styles from "./LocationSelector.module.scss";

const POPULAR_CITIES = [
  "Москва",
  "Санкт-Петербург",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Нижний Новгород",
  "Челябинск",
  "Самара",
  "Омск",
  "Ростов-на-Дону",
  "Уфа",
  "Красноярск",
  "Воронеж",
  "Пермь",
  "Волгоград",
  "Краснодар",
  "Саратов",
  "Тюмень",
  "Тольятти",
  "Ижевск",
];

export function LocationSelector() {
  const [currentCity, setCurrentCity] = useState<string>("Москва");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Загружаем сохраненный город из localStorage
    const savedCity = localStorage.getItem("selectedCity");
    if (savedCity) {
      setCurrentCity(savedCity);
    }
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCities = POPULAR_CITIES.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCitySelect = (city: string) => {
    setCurrentCity(city);
    localStorage.setItem("selectedCity", city);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      alert("Геолокация не поддерживается вашим браузером");
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `/api/geolocation?lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data.city) {
            handleCitySelect(data.city);
          } else {
            alert("Не удалось определить город");
          }
        } catch (error) {
          console.error("Error detecting location:", error);
          alert("Ошибка при определении местоположения");
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Не удалось получить ваше местоположение");
        setIsDetecting(false);
      }
    );
  };

  return (
    <>
      <div className={styles.container} onClick={() => setIsOpen(true)}>
        <MapPin size={16} className={styles.icon} />
        <span className={styles.city}>{currentCity}</span>
      </div>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <h3 className={styles.popupTitle}>Выберите город</h3>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.popupContent}>
              <div className={styles.searchContainer}>
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.searchInput}
                  placeholder="Введите название города"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button
                className={styles.detectButton}
                onClick={handleDetectLocation}
                disabled={isDetecting}
              >
                {isDetecting ? "Определение..." : "Определить по геопозиции"}
              </button>

              <div className={styles.citiesList}>
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <button
                      key={city}
                      className={`${styles.cityOption} ${
                        currentCity === city ? styles.selected : ""
                      }`}
                      onClick={() => handleCitySelect(city)}
                    >
                      {city}
                    </button>
                  ))
                ) : (
                  <div className={styles.noResults}>Город не найден</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
