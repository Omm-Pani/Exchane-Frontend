"use client";

import { getTrades } from "@/app/utils/httpClient";
import { SignalingManager } from "@/app/utils/SignalingManager";
import { useEffect, useState } from "react";

type TradeData = {
  price: string;
  quantity: string;
  timestamp: number;
};

export function TradesTable({ market }: { market: string }) {
  const [trades, setTrades] = useState<TradeData[]>([]);

  useEffect(() => {
    const callbackId = `TRADE-${market}`;
    SignalingManager.getInstance().registerCallback(
      "trade",
      (trade: TradeData) => {
        setTrades((prevTrades) => [trade, ...prevTrades].slice(0, 50)); // Keep list to a reasonable size
      },
      callbackId
    );

    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`trade.${market}`],
    });

    getTrades(market).then((initialTrades) =>
      setTrades(
        initialTrades.map((trade) => ({
          price: trade.price,
          quantity: trade.quantity,
          timestamp: trade.timestamp,
        }))
      )
    );

    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`trade.${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback("trade", callbackId);
    };
  }, [market]);

  return (
    <div className="px-2 h-full flex flex-col">
      {/* This header is now full-width and includes all 3 column titles */}
      <div className="flex justify-between flex-row w-full text-xs text-slate-500 px-1 py-1">
        <p className="w-1/3 text-left">Price</p>
        <p className="w-1/3 text-right">Quantity</p>
        <p className="w-1/3 text-right">Time</p>
      </div>
      <div className="flex flex-col no-scrollbar overflow-y-auto">
        {trades.map((trade, i) => {
          const tradePrice = parseFloat(trade.price);
          const prevPrice =
            i === trades.length - 1
              ? tradePrice
              : parseFloat(trades[i + 1]?.price);

          const priceClass =
            tradePrice > prevPrice
              ? "text-green-500"
              : tradePrice < prevPrice
              ? "text-red-500"
              : "text-slate-200";

          return (
            <div
              key={i}
              className="flex flex-row w-full text-sm hover:bg-white/5"
            >
              <div
                className={`w-1/3 py-1 text-left tabular-nums ${priceClass}`}
              >
                {trade.price}
              </div>
              <div className="w-1/3 py-1 text-right tabular-nums text-slate-200">
                {trade.quantity}
              </div>
              <div className="w-1/3 py-1 text-right tabular-nums text-slate-500">
                {new Date(trade.timestamp).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
