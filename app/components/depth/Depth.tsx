"use client";

import { useEffect, useState } from "react";
import { getDepth, getTicker } from "../../utils/httpClient";
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
  const [ticker, setTicker] = useState<Ticker | null>(null);

  const [isBookOpen, setIsOpenBook] = useState<boolean>(true);
  const [isTradeOpen, setIsTradeOpen] = useState<boolean>(false);

  useEffect(() => {
    // Initial data fetch
    getDepth(market).then((d) => {
      setBids(d.bids.reverse());
      setAsks(d.asks);
    });
    getTicker(market).then(setTicker);

    // Subscribe to depth updates
    const depthCallbackId = `DEPTH-${market}`;
    SignalingManager.getInstance().registerCallback(
      "depth",
      (data: DepthData) => {
        setBids((currentBids) => {
          const updates = new Map(data.bids);
          const newBids = currentBids.map(
            ([p, q]) => [p, updates.get(p) ?? q] as [string, string]
          );
          updates.forEach((q, p) => {
            if (!newBids.find(([price]) => price === p)) {
              newBids.push([p, q]);
            }
          });
          return newBids
            .filter(([, q]) => parseFloat(q) !== 0)
            .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
        });

        setAsks((currentAsks) => {
          const updates = new Map(data.asks);
          const newAsks = currentAsks.map(
            ([p, q]) => [p, updates.get(p) ?? q] as [string, string]
          );
          updates.forEach((q, p) => {
            if (!newAsks.find(([price]) => price === p)) {
              newAsks.push([p, q]);
            }
          });
          return newAsks
            .filter(([, q]) => parseFloat(q) !== 0)
            .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
        });
      },
      depthCallbackId
    );

    // Subscribe to ticker updates
    const tickerCallbackId = `TICKER-${market}`;
    SignalingManager.getInstance().registerCallback(
      "ticker",
      (data: Partial<Ticker>) => {
        setTicker((prev) => ({ ...prev, ...data } as Ticker));
      },
      tickerCallbackId
    );

    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`depth.200ms.${market}`, `ticker.${market}`],
    });

    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`depth.200ms.${market}`, `ticker.${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        "depth",
        depthCallbackId
      );
      SignalingManager.getInstance().deRegisterCallback(
        "ticker",
        tickerCallbackId
      );
    };
  }, [market]);

  return (
    <div className="flex flex-col h-full text-white">
      <div className="px-4 py-4">
        <div className="flex flex-row gap-2">
          <button
            onClick={() => {
              setIsOpenBook(true);
              setIsTradeOpen(false);
            }}
            className={`px-3 py-1 text-sm font-medium rounded-lg ${
              isBookOpen
                ? "bg-blue-600 text-white"
                : "bg-[#202127] text-slate-400"
            }`}
          >
            Book
          </button>
          <button
            onClick={() => {
              setIsTradeOpen(true);
              setIsOpenBook(false);
            }}
            className={`px-3 py-1 text-sm font-medium rounded-lg ${
              isTradeOpen
                ? "bg-blue-600 text-white"
                : "bg-[#202127] text-slate-400"
            }`}
          >
            Trades
          </button>
        </div>
      </div>
      {isBookOpen && (
        <div className="px-2">
          <TableHeader />
          {asks && <AskTable asks={asks} />}
          {ticker && (
            <div className="py-2 text-lg font-bold text-center">
              <div
                className={`${
                  Number(ticker?.priceChange) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {ticker.lastPrice}
              </div>
            </div>
          )}
          {bids && <BidTable bids={bids} />}
        </div>
      )}
      {isTradeOpen && <TradesTable market={market} />}
    </div>
  );
}

function TableHeader() {
  return (
    <div className="flex justify-between text-xs text-slate-500 px-2">
      <span>Price</span>
      <span className="text-right">Size</span>
      {/* Total column header is hidden on small screens */}
      <span className="text-right hidden sm:block">Total</span>
    </div>
  );
}
