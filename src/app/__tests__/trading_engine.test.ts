import { Order } from "@/utils/types";
import { TradingEngine } from "../../utils/engine";

describe("TradingEngine", () => {
  test("should match a simple buy and sell order at the same price", () => {
    const engine = new TradingEngine();

    const buyOrder: Order = {
      type_op: "CREATE",
      account_id: "1",
      amount: "1.0",
      order_id: "1",
      pair: "BTC/USDC",
      limit_price: "50000.00",
      side: "BUY",
    };

    const sellOrder: Order = {
      type_op: "CREATE",
      account_id: "2",
      amount: "1.0",
      order_id: "2",
      pair: "BTC/USDC",
      limit_price: "50000.00",
      side: "SELL",
    };

    engine.processOrder(buyOrder);
    engine.processOrder(sellOrder);

    const trades = engine.getTrades();
    expect(trades.length).toBe(1);
    expect(trades[0].buyer_order_id).toBe("1");
    expect(trades[0].seller_order_id).toBe("2");
    expect(trades[0].amount).toBe("1.00000");
    expect(trades[0].price).toBe("50000.00");

    const orderBook = engine.getOrderBook();
    expect(orderBook.bids.length).toBe(0);
    expect(orderBook.asks.length).toBe(0);
  });

  test("should match a buy order with a lower priced sell order", () => {
    const engine = new TradingEngine();

    const buyOrder: Order = {
      type_op: "CREATE",
      account_id: "1",
      amount: "1.0",
      order_id: "1",
      pair: "BTC/USDC",
      limit_price: "51000.00",
      side: "BUY",
    };

    const sellOrder: Order = {
      type_op: "CREATE",
      account_id: "2",
      amount: "1.0",
      order_id: "2",
      pair: "BTC/USDC",
      limit_price: "50000.00",
      side: "SELL",
    };

    engine.processOrder(sellOrder);
    engine.processOrder(buyOrder);

    const trades = engine.getTrades();
    expect(trades.length).toBe(1);
    expect(trades[0].price).toBe("50000.00");

    const orderBook = engine.getOrderBook();
    expect(orderBook.bids.length).toBe(0);
    expect(orderBook.asks.length).toBe(0);
  });

  test("should handle partial order fills", () => {
    const engine = new TradingEngine();

    const buyOrder: Order = {
      type_op: "CREATE",
      account_id: "1",
      amount: "2.0",
      order_id: "1",
      pair: "BTC/USDC",
      limit_price: "50000.00",
      side: "BUY",
    };

    const sellOrder: Order = {
      type_op: "CREATE",
      account_id: "2",
      amount: "1.0",
      order_id: "2",
      pair: "BTC/USDC",
      limit_price: "50000.00",
      side: "SELL",
    };

    engine.processOrder(buyOrder);
    engine.processOrder(sellOrder);

    const trades = engine.getTrades();
    expect(trades.length).toBe(1);
    expect(trades[0].amount).toBe("1.00000");

    const orderBook = engine.getOrderBook();
    expect(orderBook.bids.length).toBe(1);
    expect(orderBook.asks.length).toBe(0);
    expect(orderBook.bids[0].amount).toBe("1.00000");
  });

  test("should properly delete orders", () => {
    const engine = new TradingEngine();

    const buyOrder: Order = {
      type_op: "CREATE",
      account_id: "1",
      amount: "1.0",
      order_id: "1",
      pair: "BTC/USDC",
      limit_price: "50000.00",
      side: "BUY",
    };

    const deleteOrder: Order = {
      type_op: "DELETE",
      account_id: "1",
      amount: "1.0",
      order_id: "1",
      pair: "BTC/USDC",
      limit_price: "50000.00",
      side: "BUY",
    };

    engine.processOrder(buyOrder);

    expect(engine.getOrderBook().bids.length).toBe(1);

    engine.processOrder(deleteOrder);

    expect(engine.getOrderBook().bids.length).toBe(0);
  });
});
