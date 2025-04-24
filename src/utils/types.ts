export interface OrderBook {
  bids: {
    order_id: string;
    account_id: string;
    amount: string;
    limit_price: string;
    pair: string;
    side: "BUY";
  }[];
  asks: {
    order_id: string;
    account_id: string;
    amount: string;
    limit_price: string;
    pair: string;
    side: "SELL";
  }[];
}

export interface Order {
  type_op: "CREATE" | "DELETE";
  account_id: string;
  amount: string;
  order_id: string;
  pair: string;
  limit_price: string;
  side: "BUY" | "SELL";
}

export interface Trade {
  buyer_order_id: string;
  seller_order_id: string;
  buyer_account_id: string;
  seller_account_id: string;
  amount: string;
  price: string;
  pair: string;
  timestamp: string;
}
