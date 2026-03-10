/**
 * Обратное геокодирование (координаты -> город). Для использования из Server Actions.
 */

export interface GeolocationResult {
  city: string;
  address: Record<string, unknown>;
}

export async function getGeolocationLogic(
  lat: number,
  lon: number
): Promise<GeolocationResult> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
    {
      headers: {
        "User-Agent": "BoxPro/1.0",
      },
      next: { revalidate: 86400 },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch location data");
  }

  const data = (await response.json()) as {
    address?: {
      city?: string;
      town?: string;
      village?: string;
      [key: string]: unknown;
    };
  };

  const city =
    data.address?.city ||
    data.address?.town ||
    data.address?.village ||
    "Не определен";

  return {
    city,
    address: (data.address ?? {}) as Record<string, unknown>,
  };
}
