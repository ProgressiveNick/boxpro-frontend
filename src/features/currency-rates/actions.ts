"use server";

import {
  getCurrencyRate,
  getCurrencyRatesByCodes,
} from "@/shared/api/cbr";

export async function getCurrencyRates(codes?: string[]) {
  return getCurrencyRatesByCodes(codes ?? ["USD", "CNY"]);
}

export async function getCurrencyRateById(currencyId: string) {
  return getCurrencyRate(currencyId);
}
