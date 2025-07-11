"use client";

import { getTrades } from "@/app/utils/httpClient";
import { SignalingManager } from "@/app/utils/SignalingManager";
import { useEffect, useState } from "react";

type TradeData = {
  price: string;
  quantity: string;
  timestamp: number;
  marketMaker: boolean;
};

export function TradesTable({ market }: { market: string }) {
  const [trades, setTrades] = useState<TradeData[]>([]);

  useEffect(() => {
    SignalingManager.getInstance().registerCallback(
      "trade",
      (trade: TradeData) => {
        setTrades((prevTrades) => [trade, ...prevTrades]);
      },
      `TRADE-${market}`
    );

    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`trade.${market}`],
    });

    getTrades(market).then((trades) =>
      setTrades(
        trades.map((trade) => ({
          price: trade.price,
          quantity: trade.quantity,
          timestamp: trade.timestamp,
          marketMaker: trade.marketMaker,
        }))
      )
    );

    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`trade.${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        "trade",
        `TRADE-${market}`
      );
    };
  }, [market]);

  return (
    <div className="">
      <div className="flex flex-col h-full px-3">
        <div className="flex justify-between flex-row w-2/3">
          <p className="text-med-emphasis px-1 text-left text-xs font-semibold">
            Price
          </p>
          <p className="text-med-emphasis px-1 text-left text-xs font-semibold">
            Quantity
          </p>
        </div>
        <div className="flex flex-col no-scrollbar overflow-y-auto">
          {trades.map((trade, i) => {
            const tradePrice = parseFloat(trade.price);
            const prevPrice =
              i === trades.length - 1
                ? tradePrice
                : parseFloat(trades[i + 1]?.price);

            const priceClass =
              tradePrice >= prevPrice
                ? "text-green-500"
                : tradePrice < prevPrice
                ? "text-red-600"
                : "text-neutral-text";

            return (
              <div
                key={i}
                className="flex flex-row w-full cursor-default bg-transparent hover:bg-white/4"
              >
                <div className="flex items-center flex-row w-[33.3%] py-1">
                  <div
                    className={`w-full text-sm font-normal capitalize tabular-nums ${priceClass} px-1 text-left`}
                  >
                    {trade.price}
                  </div>
                </div>
                <div className="flex items-center flex-row w-[33.3%] py-1">
                  <div className="w-full text-sm font-normal capitalize tabular-nums text-green-text px-1 text-right">
                    {trade.quantity}
                  </div>
                </div>
                <div className="flex items-center flex-row w-[33.3%] py-1">
                  <div className="w-full text-sm font-normal capitalize tabular-nums text-green-text px-1 text-right">
                    {new Date(trade.timestamp).toLocaleTimeString()}{" "}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
