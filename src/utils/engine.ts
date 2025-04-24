import { Order, OrderBook, Trade } from "./types";

export class TradingEngine {
  private orderBook: OrderBook = {
    bids: [],
    asks: [],
  };
  private trades: Trade[] = [];

  processOrders(orders: Order[]): void {
    orders.forEach((order) => this.processOrder(order));
  }

  processOrder(order: Order): void {
    if (order.type_op === "CREATE") {
      this.addOrder(order);
    } else if (order.type_op === "DELETE") {
      this.removeOrder(order);
    }
  }

  private addOrder(order: Order): void {
    const amount = parseFloat(order.amount);
    const price = parseFloat(order.limit_price);

    if (order.side === "BUY") {
      let remainingAmount = amount;

      const sortedAsks = [...this.orderBook.asks].sort(
        (a, b) => parseFloat(a.limit_price) - parseFloat(b.limit_price)
      );

      for (let i = 0; i < sortedAsks.length && remainingAmount > 0; i++) {
        const ask = sortedAsks[i];
        const askPrice = parseFloat(ask.limit_price);

        if (price >= askPrice) {
          const askAmount = parseFloat(ask.amount);
          const tradeAmount = Math.min(remainingAmount, askAmount);

          this.trades.push({
            buyer_order_id: order.order_id,
            seller_order_id: ask.order_id,
            buyer_account_id: order.account_id,
            seller_account_id: ask.account_id,
            amount: tradeAmount.toFixed(5),
            price: askPrice.toFixed(2),
            pair: order.pair,
            timestamp: new Date().toISOString(),
          });

          remainingAmount -= tradeAmount;

          if (tradeAmount < askAmount) {
            ask.amount = (askAmount - tradeAmount).toFixed(5);
          } else {
            this.orderBook.asks = this.orderBook.asks.filter(
              (a) => a.order_id !== ask.order_id
            );
          }
        }
      }

      if (remainingAmount > 0) {
        this.orderBook.bids.push({
          order_id: order.order_id,
          account_id: order.account_id,
          amount: remainingAmount.toFixed(5),
          limit_price: order.limit_price,
          pair: order.pair,
          side: order.side,
        });

        this.orderBook.bids.sort(
          (a, b) => parseFloat(b.limit_price) - parseFloat(a.limit_price)
        );
      }
    } else if (order.side === "SELL") {
      let remainingAmount = amount;

      const sortedBids = [...this.orderBook.bids].sort(
        (a, b) => parseFloat(b.limit_price) - parseFloat(a.limit_price)
      );

      for (let i = 0; i < sortedBids.length && remainingAmount > 0; i++) {
        const bid = sortedBids[i];
        const bidPrice = parseFloat(bid.limit_price);

        if (price <= bidPrice) {
          const bidAmount = parseFloat(bid.amount);
          const tradeAmount = Math.min(remainingAmount, bidAmount);

          this.trades.push({
            buyer_order_id: bid.order_id,
            seller_order_id: order.order_id,
            buyer_account_id: bid.account_id,
            seller_account_id: order.account_id,
            amount: tradeAmount.toFixed(5),
            price: bidPrice.toFixed(2),
            pair: order.pair,
            timestamp: new Date().toISOString(),
          });

          remainingAmount -= tradeAmount;

          if (tradeAmount < bidAmount) {
            bid.amount = (bidAmount - tradeAmount).toFixed(5);
          } else {
            this.orderBook.bids = this.orderBook.bids.filter(
              (b) => b.order_id !== bid.order_id
            );
          }
        }
      }

      if (remainingAmount > 0) {
        this.orderBook.asks.push({
          order_id: order.order_id,
          account_id: order.account_id,
          amount: remainingAmount.toFixed(5),
          limit_price: order.limit_price,
          pair: order.pair,
          side: order.side,
        });

        this.orderBook.asks.sort(
          (a, b) => parseFloat(a.limit_price) - parseFloat(b.limit_price)
        );
      }
    }
  }

  private removeOrder(order: Order): void {
    if (order.side === "BUY") {
      this.orderBook.bids = this.orderBook.bids.filter(
        (bid) => bid.order_id !== order.order_id
      );
    } else if (order.side === "SELL") {
      this.orderBook.asks = this.orderBook.asks.filter(
        (ask) => ask.order_id !== order.order_id
      );
    }
  }

  getOrderBook(): OrderBook {
    return this.orderBook;
  }

  getTrades(): Trade[] {
    return this.trades;
  }
}
