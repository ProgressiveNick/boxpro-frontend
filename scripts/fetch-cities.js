/**
 * Скрипт загрузки списка городов России из VK API.
 * Выполняется при сборке (prebuild). Результат кэшируется в src/data/cities.json.
 *
 * Требует VK_ACCESS_TOKEN в .env для загрузки из VK API.
 * Без токена создаёт минимальный список популярных городов.
 */

const fs = require("fs");
const path = require("path");

// Загрузка .env (Node.js не загружает .env автоматически)
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

const VK_API_VERSION = "5.199";
const RUSSIA_COUNTRY_ID = 1;
const BATCH_SIZE = 1000;
const OUTPUT_PATH = path.join(__dirname, "../src/data/cities.json");

const FALLBACK_CITIES = [
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
  "Барнаул",
  "Ульяновск",
  "Иркутск",
  "Хабаровск",
  "Ярославль",
  "Владивосток",
  "Махачкала",
  "Томск",
  "Оренбург",
  "Кемерово",
  "Новокузнецк",
  "Рязань",
  "Астрахань",
  "Набережные Челны",
  "Пенза",
  "Калининград",
  "Липецк",
  "Тула",
  "Киров",
  "Чебоксары",
  "Курск",
  "Сочи",
  "Ставрополь",
  "Улан-Удэ",
  "Тверь",
  "Магнитогорск",
  "Иваново",
  "Брянск",
  "Белгород",
  "Сургут",
  "Владимир",
  "Нижний Тагил",
  "Архангельск",
  "Чита",
  "Калуга",
  "Смоленск",
  "Волжский",
  "Курган",
  "Череповец",
  "Вологда",
  "Мурманск",
  "Саранск",
  "Якутск",
  "Владикавказ",
  "Тамбов",
  "Грозный",
  "Кострома",
  "Петрозаводск",
  "Нижневартовск",
  "Йошкар-Ола",
  "Новороссийск",
  "Комсомольск-на-Амуре",
  "Стерлитамак",
];

async function fetchVKCities(accessToken) {
  const allCities = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      country_id: String(RUSSIA_COUNTRY_ID),
      count: String(BATCH_SIZE),
      offset: String(offset),
      need_all: "1",
      v: VK_API_VERSION,
      access_token: accessToken,
    });

    const url = `https://api.vk.com/method/database.getCities?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.error_msg || "VK API error");
    }

    const items = data.response?.items ?? [];
    const totalCount = data.response?.count ?? 0;

    for (const item of items) {
      allCities.push({ id: item.id, title: item.title });
    }

    offset += items.length;
    hasMore = items.length === BATCH_SIZE && offset < totalCount;

    process.stdout.write(`\rЗагружено городов: ${allCities.length}`);
  }

  return allCities;
}

function createFallbackCities() {
  return FALLBACK_CITIES.map((title, index) => ({
    id: index + 1,
    title,
  }));
}

async function main() {
  const accessToken = process.env.VK_ACCESS_TOKEN;
  let cities;

  if (accessToken) {
    try {
      console.log("Загрузка городов из VK API...");
      cities = await fetchVKCities(accessToken);
      console.log(`\nЗагружено ${cities.length} городов`);
    } catch (error) {
      console.error("\nОшибка VK API:", error.message);
      console.log("Используется резервный список городов");
      cities = createFallbackCities();
    }
  } else {
    console.log(
      "VK_ACCESS_TOKEN не задан. Используется резервный список городов",
    );
    cities = createFallbackCities();
  }

  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cities, null, 0), "utf-8");
  console.log(`Сохранено в ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
