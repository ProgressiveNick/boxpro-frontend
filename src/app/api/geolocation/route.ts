import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Используем Nominatim API для обратного геокодирования
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "BoxPro/1.0",
        },
        next: { revalidate: 86400 }, // Кешируем на 24 часа
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }

    const data = await response.json();
    const city = data.address?.city || data.address?.town || data.address?.village || "Не определен";

    return NextResponse.json({
      city,
      address: data.address,
    });
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}












