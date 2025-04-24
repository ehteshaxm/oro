"use client";
import { useState } from "react";
import Head from "next/head";
import { useDropzone } from "react-dropzone";
import { OrderBook, Trade } from "../utils/types";
import { ArrowDownToLine, BookOpen, LineChart } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [orderBook, setOrderBook] = useState<OrderBook>();
  const [trades, setTrades] = useState<Trade[]>();
  const [activeTab, setActiveTab] = useState<"orderbook" | "trades">(
    "orderbook"
  );

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast.error("Please upload a JSON file");
      return;
    }

    setIsLoading(true);

    try {
      const text = await file.text();
      const orders = JSON.parse(text);

      const response = await fetch("/api/process-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orders }),
      });

      if (!response.ok) {
        throw new Error("Failed to process orders");
      }

      const data = await response.json();
      setOrderBook(data.orderBook);
      setTrades(data.trades);

      toast.success("Orders processed successfully!");
    } catch (error) {
      console.error("Error processing orders:", error);
      toast.error(
        "Error processing orders. Please check file format and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
    },
    multiple: false,
    disabled: isLoading,
  });

  const downloadJSON = (data: OrderBook | Trade[], filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
      <Head>
        <title>Trading Engine</title>
        <meta name="description" content="Trading Engine Web Client" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Trading Engine
          </h1>
          <p className="text-gray-600 mt-3 max-w-lg mx-auto">
            Upload your orders.json file to process trades and view the order
            book
          </p>
        </header>

        <main>
          {!orderBook && !trades && (
            <div className="mb-10">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all transform hover:scale-[1.01] ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400"
                } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-blue-100 p-4 rounded-full">
                      <ArrowDownToLine className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-blue-600 font-medium">
                      Drop the file here...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-gray-100 p-4 rounded-full">
                      <ArrowDownToLine className="h-8 w-8 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium mb-2">
                        Drag & drop your orders.json file here, or click to
                        select a file
                      </p>
                      <p className="text-sm text-gray-500">
                        Only JSON files are accepted
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {isLoading && (
                <div className="text-center py-6">
                  <div className="inline-block h-12 w-12 relative">
                    <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-t-blue-500 border-blue-200/30 rounded-full animate-spin"></div>
                    <div className="absolute top-2 left-2 right-2 bottom-2 border-4 border-t-indigo-500 border-indigo-200/30 rounded-full animate-spin animation-delay-150"></div>
                  </div>
                  <p className="mt-4 text-gray-600">Processing orders...</p>
                </div>
              )}
            </div>
          )}

          {orderBook && trades && (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
              <div className="flex border-b border-gray-200">
                <button
                  className={`py-4 px-6 flex-1 text-center flex items-center justify-center space-x-2 transition-colors ${
                    activeTab === "orderbook"
                      ? "bg-blue-50 text-blue-600 font-medium border-b-2 border-blue-500"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("orderbook")}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Order Book</span>
                </button>
                <button
                  className={`py-4 px-6 flex-1 text-center flex items-center justify-center space-x-2 transition-colors ${
                    activeTab === "trades"
                      ? "bg-blue-50 text-blue-600 font-medium border-b-2 border-blue-500"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab("trades")}
                >
                  <LineChart className="h-4 w-4" />
                  <span>Trades</span>
                </button>
              </div>

              <div className="p-6">
                {activeTab === "orderbook" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Order Book</h2>
                      <button
                        onClick={() =>
                          downloadJSON(orderBook, "orderbook.json")
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                      >
                        <ArrowDownToLine className="h-4 w-4" />
                        <span>Download orderbook.json</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-700 mb-3 pb-2 border-b border-gray-200">
                          Bids (Buy Orders)
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="text-left">
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Price
                                </th>
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Order ID
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {orderBook.bids.map((bid) => (
                                <tr
                                  key={bid.order_id}
                                  className="hover:bg-gray-100 transition-colors"
                                >
                                  <td className="px-4 py-3 text-sm font-medium text-green-600">
                                    {bid.limit_price}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {bid.amount}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                    {bid.order_id}
                                  </td>
                                </tr>
                              ))}
                              {orderBook.bids.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={3}
                                    className="px-4 py-4 text-sm text-gray-500 text-center italic"
                                  >
                                    No buy orders
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-700 mb-3 pb-2 border-b border-gray-200">
                          Asks (Sell Orders)
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="text-left">
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Price
                                </th>
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Order ID
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {orderBook.asks.map((ask) => (
                                <tr
                                  key={ask.order_id}
                                  className="hover:bg-gray-100 transition-colors"
                                >
                                  <td className="px-4 py-3 text-sm font-medium text-red-600">
                                    {ask.limit_price}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {ask.amount}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                    {ask.order_id}
                                  </td>
                                </tr>
                              ))}
                              {orderBook.asks.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={3}
                                    className="px-4 py-4 text-sm text-gray-500 text-center italic"
                                  >
                                    No sell orders
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "trades" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Trades</h2>
                      <button
                        onClick={() => downloadJSON(trades, "trades.json")}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                      >
                        <ArrowDownToLine className="h-4 w-4" />
                        <span>Download trades.json</span>
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="text-left border-b border-gray-200">
                              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Buyer ID
                              </th>
                              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Seller ID
                              </th>
                              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Timestamp
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {trades.map((trade, index) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-100 transition-colors"
                              >
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                  {trade.price}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {trade.amount}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                  {trade.buyer_account_id}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                  {trade.seller_account_id}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {new Date(trade.timestamp).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                            {trades.length === 0 && (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="px-4 py-4 text-sm text-gray-500 text-center italic"
                                >
                                  No trades executed
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
