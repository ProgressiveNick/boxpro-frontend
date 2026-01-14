/**
 * API для получения курса валют с сайта Центрального Банка России
 * Документация: https://www.cbr.ru/development/SXML/
 */

const CBR_API_BASE = "https://www.cbr.ru/scripts";

export type CurrencyRate = {
  id: string;
  numCode: string;
  charCode: string;
  nominal: number;
  name: string;
  value: number; // курс в рублях
};

/**
 * Получить курс валюты по её коду
 * @param currencyId - код валюты (R01235 для USD, R01375 для CNY)
 * @returns курс валюты или null в случае ошибки
 */
export async function getCurrencyRate(currencyId: string = "R01235"): Promise<CurrencyRate | null> {
  try {
    // Получаем курсы валют на текущую дату
    const response = await fetch(`${CBR_API_BASE}/XML_daily.asp`, {
      cache: "no-store", // Не кэшируем на сервере, так как это server-side функция
    });

    if (!response.ok) {
      console.error("Failed to fetch currency rates:", response.statusText);
      return null;
    }

    const xmlText = await response.text();
    
    // Парсим XML используя регулярные выражения (так как DOMParser может не работать на сервере)
    // Ищем валюту по коду
    const currencyMatch = xmlText.match(new RegExp(`<Valute ID="${currencyId}">([\\s\\S]*?)<\\/Valute>`));
    
    if (!currencyMatch) {
      console.error(`Currency with ID ${currencyId} not found in response`);
      return null;
    }

    const currencyXml = currencyMatch[1];
    
    const numCodeMatch = currencyXml.match(/<NumCode>(\d+)<\/NumCode>/);
    const charCodeMatch = currencyXml.match(/<CharCode>([A-Z]+)<\/CharCode>/);
    const nominalMatch = currencyXml.match(/<Nominal>(\d+)<\/Nominal>/);
    const nameMatch = currencyXml.match(/<Name>([^<]+)<\/Name>/);
    const valueMatch = currencyXml.match(/<Value>([^<]+)<\/Value>/);

    const numCode = numCodeMatch ? numCodeMatch[1] : "";
    const charCode = charCodeMatch ? charCodeMatch[1] : "";
    const nominal = nominalMatch ? parseInt(nominalMatch[1], 10) : 1;
    const name = nameMatch ? nameMatch[1] : "";
    const valueText = valueMatch ? valueMatch[1] : "0";
    const value = parseFloat(valueText.replace(",", "."));

    if (isNaN(value) || value === 0) {
      console.error("Invalid currency value");
      return null;
    }

    return {
      id: currencyId,
      numCode,
      charCode,
      nominal,
      name,
      value,
    };
  } catch (error) {
    console.error("Error fetching currency rate:", error);
    return null;
  }
}

/**
 * Получить текущий курс доллара США
 * @returns курс доллара или null в случае ошибки
 */
export async function getUSDRate(): Promise<CurrencyRate | null> {
  return getCurrencyRate("R01235");
}

/**
 * Получить текущий курс китайского юаня
 * @returns курс юаня или null в случае ошибки
 */
export async function getCNYRate(): Promise<CurrencyRate | null> {
  return getCurrencyRate("R01375");
}

