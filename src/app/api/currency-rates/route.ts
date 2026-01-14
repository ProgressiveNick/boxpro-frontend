import { NextResponse } from "next/server";

type CurrencyRate = {
  code: string;
  name: string;
  value: number;
  nominal: number;
};

function parseXML(xmlText: string): CurrencyRate[] {
  const rates: CurrencyRate[] = [];
  
  // Регулярное выражение для поиска блоков Valute
  const valuteRegex = /<Valute[^>]*>([\s\S]*?)<\/Valute>/g;
  let match;

  while ((match = valuteRegex.exec(xmlText)) !== null) {
    const valuteBlock = match[1];
    
    const charCodeMatch = valuteBlock.match(/<CharCode>([^<]*)<\/CharCode>/);
    const valueMatch = valuteBlock.match(/<Value>([^<]*)<\/Value>/);
    const nominalMatch = valuteBlock.match(/<Nominal>([^<]*)<\/Nominal>/);
    const nameMatch = valuteBlock.match(/<Name>([^<]*)<\/Name>/);

    if (charCodeMatch && valueMatch && nominalMatch && nameMatch) {
      rates.push({
        code: charCodeMatch[1],
        name: nameMatch[1],
        value: parseFloat(valueMatch[1].replace(",", ".")),
        nominal: parseInt(nominalMatch[1]),
      });
    }
  }

  return rates;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const today = new Date();
    const date = searchParams.get("date") || 
      `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1).toString().padStart(2, "0")}/${today.getFullYear()}`;

    // Получаем курсы валют с ЦБ РФ
    const response = await fetch(
      `https://www.cbr.ru/scripts/XML_daily.asp?date_req=${date}`,
      {
        next: { revalidate: 3600 }, // Кешируем на 1 час
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch currency rates");
    }

    const xmlText = await response.text();
    const rates = parseXML(xmlText);

    // Фильтруем только нужные валюты
    const requestedCodes = searchParams.get("codes")?.split(",") || ["USD", "CNY"];
    const filteredRates = rates.filter((rate) =>
      requestedCodes.includes(rate.code)
    );

    return NextResponse.json({
      date,
      rates: filteredRates,
    });
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch currency rates" },
      { status: 500 }
    );
  }
}

