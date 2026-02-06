import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const DEFAULT_COUNT = 25;
const MAX_COUNT = 100;

type City = { id: number; title: string };

async function getCachedCities(): Promise<City[]> {
  const filePath = path.join(process.cwd(), "src/data/cities.json");
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content);
}

export async function GET(request: Request) {
  try {
    const cities = await getCachedCities();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim().toLowerCase();
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));
    const count = Math.min(
      MAX_COUNT,
      Math.max(
        1,
        parseInt(searchParams.get("count") || String(DEFAULT_COUNT), 10),
      ),
    );

    let filtered = cities;
    if (q) {
      filtered = cities.filter((city) => city.title.toLowerCase().includes(q));
    }

    filtered.sort((a, b) => a.title.localeCompare(b.title, "ru"));

    const total = filtered.length;
    const page = filtered.slice(offset, offset + count);

    return NextResponse.json({
      data: page,
      meta: {
        count: page.length,
        offset,
        total,
        hasMore: offset + page.length < total,
      },
    });
  } catch (error) {
    console.error("[api/cities] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 },
    );
  }
}
