"use server";

import { getCitiesLogic } from "@/shared/lib/cities";
import { getGeolocationLogic } from "@/shared/lib/geolocation";

export async function getCities(options?: {
  q?: string;
  offset?: number;
  count?: number;
}) {
  return getCitiesLogic(options);
}

export async function getGeolocation(lat: number, lon: number) {
  return getGeolocationLogic(lat, lon);
}
