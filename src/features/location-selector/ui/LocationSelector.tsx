"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MapPin, X } from "lucide-react";
import styles from "./LocationSelector.module.scss";

const PAGE_SIZE = 25;

export function LocationSelector() {
  const [currentCity, setCurrentCity] = useState<string>("Москва");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cities, setCities] = useState<{ id: number; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
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

  const fetchCities = useCallback(
    async (q: string, offsetValue: number, append: boolean) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          offset: String(offsetValue),
          count: String(PAGE_SIZE),
        });
        if (q) params.set("q", q);

        const response = await fetch(`/api/cities?${params}`);
        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Ошибка загрузки");

        if (append) {
          setCities((prev) => [...prev, ...result.data]);
        } else {
          setCities(result.data);
        }
        setHasMore(result.meta.hasMore);
        setOffset(offsetValue + result.data.length);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) return;

    setSearchQuery("");
    setOffset(0);
    setHasMore(true);
    fetchCities("", 0, false);
  }, [isOpen, fetchCities]);

  const handleScroll = useCallback(() => {
    const list = listRef.current;
    if (!list || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = list;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      fetchCities(searchQuery, offset, true);
    }
  }, [isLoading, hasMore, searchQuery, offset, fetchCities]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    list.addEventListener("scroll", handleScroll);
    return () => list.removeEventListener("scroll", handleScroll);
  }, [handleScroll, isOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setOffset(0);
      setHasMore(true);
      fetchCities(value, 0, false);
      searchTimeoutRef.current = null;
    }, 300);
  };

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
            `/api/geolocation?lat=${latitude}&lon=${longitude}`,
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
      },
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
                  onChange={handleSearchChange}
                />
              </div>

              <button
                className={styles.detectButton}
                onClick={handleDetectLocation}
                disabled={isDetecting}
              >
                {isDetecting ? "Определение..." : "Определить по геопозиции"}
              </button>

              <div
                ref={listRef}
                className={styles.citiesList}
                onScroll={handleScroll}
              >
                {isLoading && cities.length === 0 ? (
                  <div className={styles.noResults}>Загрузка...</div>
                ) : cities.length > 0 ? (
                  <>
                    {cities.map((city, index) => (
                      <button
                        key={`${city.id}-${city.title}-${index}`}
                        className={`${styles.cityOption} ${
                          currentCity === city.title ? styles.selected : ""
                        }`}
                        onClick={() => handleCitySelect(city.title)}
                      >
                        {city.title}
                      </button>
                    ))}
                    {isLoading && hasMore && (
                      <div className={styles.noResults}>Загрузка...</div>
                    )}
                  </>
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
