import { TradingEngine } from "@/utils/engine";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orders } = body;

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json(
        { message: "Invalid or missing orders data" },
        { status: 400 }
      );
    }

    const engine = new TradingEngine();
    engine.processOrders(orders);

    const orderBook = engine.getOrderBook();
    const trades = engine.getTrades();

    return NextResponse.json({ orderBook, trades }, { status: 200 });
  } catch (error) {
    console.error("Error processing orders:", error);
    return NextResponse.json(
      { message: "Error processing orders" },
      { status: 500 }
    );
  }
}
