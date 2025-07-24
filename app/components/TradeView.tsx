import { useEffect, useRef } from "react";
import { ChartManager } from "../utils/ChartManager";
import { getKlines } from "../utils/httpClient";
import { KLine } from "../utils/types";

export function TradeView({ market }: { market: string }) {
  const chartRef = useRef<HTMLDivElement>(null);
  // Using a more specific type for the ref to avoid @ts-ignore
  const chartManagerRef = useRef<ChartManager | null>(null);

  useEffect(() => {
    const init = async () => {
      let klineData: KLine[] = [];
      try {
        klineData = await getKlines(
          market,
          "1h",
          // Get data for the last 7 days
          Math.floor((Date.now() - 1000 * 60 * 60 * 24 * 7) / 1000),
          Math.floor(Date.now() / 1000)
        );
      } catch (e) {
        console.error("Error fetching KLines:", e);
      }

      if (!chartRef.current) return;

      // If a chart instance already exists, destroy it before creating a new one
      if (chartManagerRef.current) {
        chartManagerRef.current.destroy();
      }

      const chartManager = new ChartManager(
        chartRef.current,
        klineData
          ?.map((x) => ({
            close: parseFloat(x.close),
            high: parseFloat(x.high),
            low: parseFloat(x.low),
            open: parseFloat(x.open),
            // Ensure timestamp is a Date object
            timestamp: new Date(x.end),
          }))
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) || [],
        {
          background: "#0e0f14",
          color: "white",
        }
      );
      chartManagerRef.current = chartManager;
    };
    init();

    return () => {
      chartManagerRef.current?.destroy();
    };
  }, [market]);

  return (
    <>
      <div ref={chartRef} className="w-full h-[400px] lg:h-[520px] mt-1"></div>
    </>
  );
}
