import { NextResponse } from "next/server";
import { getCurrencyRate } from "@/shared/api/cbr";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ currencyId: string }> }
) {
  try {
    const { currencyId } = await params;
    const rate = await getCurrencyRate(currencyId);
    
    if (!rate) {
      return NextResponse.json(
        { error: "Failed to fetch currency rate" },
        { status: 500 }
      );
    }

    return NextResponse.json(rate, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error in currency API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


