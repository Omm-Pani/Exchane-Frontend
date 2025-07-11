"use client";

import { useEffect, useState } from "react";
import { getDepth, getTicker, getTrades } from "../../utils/httpClient";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";
import { SignalingManager } from "@/app/utils/SignalingManager";
import { TradesTable } from "./TradesTable";
import { Ticker } from "@/app/utils/types";

export type DepthData = {
  bids: [string, string][];
  asks: [string, string][];
};

export function Depth({ market }: { market: string }) {
  const [bids, setBids] = useState<[string, string][]>([]);
  const [asks, setAsks] = useState<[string, string][]>([]);

  const [isBookOpen, setIsOpenBook] = useState<boolean>(true);
  const [isTradeOpen, setIsTradeOpen] = useState<boolean>(false);

  const [ticker, setTicker] = useState<Ticker | null>(null);

  useEffect(() => {
    SignalingManager.getInstance().registerCallback(
      "depth",
      (data: DepthData) => {
        setBids((originalBids) => {
          if (!originalBids) return [];

          const bidUpdates = new Map(
            data.bids.map(([price, quantity]: [string, string]) => [
              price,
              quantity,
            ])
          );

          const updatedBids: [string, string][] = originalBids
            .map(([price, quantity]): [string, string] => {
              const newQuantity = bidUpdates.get(price);

              return [
                price,
                newQuantity !== undefined
                  ? String(newQuantity)
                  : String(quantity),
              ];
            })
            .filter(([_, quantity]) => quantity !== "0.00");

          return updatedBids;
        });

        setAsks((originalAsks) => {
          if (!originalAsks) return [];

          const askUpdates = new Map(
            data.asks.map(([price, quantity]: [string, string]) => [
              price,
              quantity,
            ])
          );

          const updatedAsks: [string, string][] = originalAsks
            .map(([price, quantity]): [string, string] => {
              const newQuantity = askUpdates.get(price);

              return [
                price,
                newQuantity !== undefined
                  ? String(newQuantity)
                  : String(quantity),
              ];
            })
            .filter(([_, quantity]) => quantity !== "0.00");

          return updatedAsks;
        });
      },
      `DEPTH-${market}`
    );

    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`depth.200ms.${market}`],
    });

    getDepth(market).then((d) => {
      setBids(d.bids.reverse());
      setAsks(d.asks);
    });

    // getKlines(market, "1h", 1640099200, 1640100800).then(t => setPrice(t[0].close));
    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`depth.200ms.${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        "depth",
        `DEPTH-${market}`
      );
    };
  }, [market]);

  useEffect(() => {
    getTicker(market).then(setTicker);
    SignalingManager.getInstance().registerCallback(
      "ticker",
      (data: Partial<Ticker>) =>
        setTicker((prevTicker) => ({
          firstPrice: data?.firstPrice ?? prevTicker?.firstPrice ?? "",
          high: data?.high ?? prevTicker?.high ?? "",
          lastPrice: data?.lastPrice ?? prevTicker?.lastPrice ?? "",
          low: data?.low ?? prevTicker?.low ?? "",
          priceChange: data?.priceChange ?? prevTicker?.priceChange ?? "",
          priceChangePercent:
            data?.priceChangePercent ?? prevTicker?.priceChangePercent ?? "",
          quoteVolume: data?.quoteVolume ?? prevTicker?.quoteVolume ?? "",
          symbol: data?.symbol ?? prevTicker?.symbol ?? "",
          trades: data?.trades ?? prevTicker?.trades ?? "",
          volume: data?.volume ?? prevTicker?.volume ?? "",
        })),
      `TICKER1-${market}`
    );
    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`ticker.${market}`],
    });

    return () => {
      SignalingManager.getInstance().deRegisterCallback(
        "ticker",
        `TICKER1-${market}`
      );
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`ticker.${market}`],
      });
    };
  }, [market]);

  return (
    <div>
      <div className="flex flex-col h-full">
        <div className="px-4 py-4">
          <div className="items-center justify-start flex-row flex gap-2 gap-x-2">
            <div
              onClick={() => {
                setIsOpenBook(true);
                setIsTradeOpen(false);
              }}
              className={`flex justify-center flex-col cursor-pointer rounded-lg py-1 font-medium outline-hidden text-high-emphasis px-3 text-sm h-8 bg-base-background-l2 ${
                isBookOpen
                  ? "bg-blue-600 "
                  : "bg-base-background-l2 text-high-emphasis"
              }`}
            >
              Book
            </div>
            <div
              onClick={() => {
                setIsTradeOpen(true);
                setIsOpenBook(false);
              }}
              className={`flex justify-center flex-col cursor-pointer rounded-lg py-1 font-medium outline-hidden text-high-emphasis px-3 text-sm h-8 bg-base-background-l2 ${
                isTradeOpen
                  ? "bg-blue-600"
                  : "bg-base-background-l2 text-high-emphasis"
              }`}
            >
              Trades
            </div>
          </div>
        </div>
        {isBookOpen && (
          <div>
            <TableHeader />
            {asks && <AskTable asks={asks} />}
            {ticker && (
              <div
                className={`${
                  Number(ticker?.priceChange) > 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {ticker.lastPrice}
              </div>
            )}
            {bids && <BidTable bids={bids} />}
          </div>
        )}
        {isTradeOpen && <TradesTable market={market} />}
      </div>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="flex justify-between text-xs">
      <div className="text-white">Price</div>
      <div className="text-slate-500">Size</div>
      <div className="text-slate-500">Total</div>
    </div>
  );
}
