"use client";
import { useEffect, useState } from "react";
import type { Ticker } from "../utils/types";
import { getTicker } from "../utils/httpClient";
import { SignalingManager } from "../utils/SignalingManager";

export const MarketBar = ({ market }: { market: string }) => {
  const [ticker, setTicker] = useState<Ticker | null>(null);

  useEffect(() => {
    // Initial fetch
    getTicker(market).then(setTicker);

    // WebSocket subscription
    const callbackId = `TICKER-${market}`;
    SignalingManager.getInstance().registerCallback(
      "ticker",
      (data: Partial<Ticker>) =>
        setTicker((prevTicker) => ({ ...prevTicker, ...data } as Ticker)),
      callbackId
    );
    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`ticker.${market}`],
    });

    // Cleanup
    return () => {
      SignalingManager.getInstance().deRegisterCallback("ticker", callbackId);
    };
  }, [market]);

  const isPriceChangePositive = Number(ticker?.priceChange) >= 0;

  return (
    <div>
      <div className="flex items-center flex-row relative w-full overflow-hidden border-b border-slate-800">
        <div className="flex items-center justify-between flex-row w-full no-scrollbar overflow-x-auto p-2">
          <Ticker market={market} />
          {/* Stats Container */}
          <div className="flex items-center flex-row space-x-4 sm:space-x-6 lg:space-x-8 pl-4">
            {/* Last Price */}
            <div className="flex flex-col h-full justify-center">
              <p className="font-medium text-xs text-slate-400">Last Price</p>
              <p
                className={`font-medium tabular-nums text-md ${
                  isPriceChangePositive ? "text-green-500" : "text-red-500"
                }`}
              >
                ${ticker?.lastPrice}
              </p>
            </div>
            {/* 24H Change */}
            <div className="flex flex-col">
              <p className="font-medium text-xs text-slate-400">24H Change</p>
              <p
                className={`font-medium tabular-nums leading-5 text-sm ${
                  isPriceChangePositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {isPriceChangePositive ? "+" : ""}
                {ticker?.priceChange} (
                {Number(ticker?.priceChangePercent)?.toFixed(2)}%)
              </p>
            </div>
            {/* 24H High - HIDDEN on smaller screens */}
            <div className="hidden lg:flex flex-col">
              <p className="font-medium text-xs text-slate-400">24H High</p>
              <p className="text-sm font-medium tabular-nums leading-5 text-white">
                {ticker?.high}
              </p>
            </div>
            {/* 24H Low - HIDDEN on smaller screens */}
            <div className="hidden lg:flex flex-col">
              <p className="font-medium text-xs text-slate-400">24H Low</p>
              <p className="text-sm font-medium tabular-nums leading-5 text-white">
                {ticker?.low}
              </p>
            </div>
            {/* 24H Volume - HIDDEN on smaller screens */}
            <div className="hidden lg:flex flex-col">
              <p className="font-medium text-xs text-slate-400">24H Volume</p>
              <p className="mt-1 font-medium tabular-nums leading-5 text-sm text-white">
                {ticker?.volume}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Ticker({ market }: { market: string }) {
  // Simple display component for the market ticker
  return (
    <div className="flex items-center h-[60px] shrink-0 space-x-2">
      <div className="flex flex-row relative">
        <img
          alt="Base Asset"
          className="z-10 rounded-full h-6 w-6 outline-baseBackgroundL1"
          src="/sol.webp"
        />
        <img
          alt="Quote Asset"
          className="h-6 w-6 -ml-2 rounded-full"
          src="/usdc.webp"
        />
      </div>
      <div className="flex items-center justify-between flex-row rounded-lg">
        <div className="flex items-center flex-row gap-2">
          <p className="font-medium text-sm text-white">
            {market.replace("_", " / ")}
          </p>
        </div>
      </div>
    </div>
  );
}
