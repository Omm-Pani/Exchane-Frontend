"use client";
import { MarketBar } from "@/app/components/MarketBar";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { useParams } from "next/navigation";

export default function Page() {
  const { market } = useParams();

  return (
    // On mobile screens, the layout is a single column (flex-col).
    // On large screens (lg), it becomes a row (lg:flex-row).
    <div className="flex flex-col lg:flex-row flex-1">
      {/* --- Main Content (Chart and Depth) --- */}
      <div className="flex flex-col flex-1">
        <MarketBar market={market as string} />
        {/* This container also stacks its children vertically on mobile */}
        <div className="flex flex-col lg:flex-row lg:h-[620px] gap-2 border-y border-slate-800">
          <div className="flex flex-col flex-1 min-h-[300px] lg:min-h-0">
            <TradeView market={market as string} />
          </div>
          {/* Depth chart is full-width on mobile and has a fixed width on desktop */}
          <div className="flex flex-col w-full lg:max-w-[300px] lg:min-w-[260px] overflow-hidden px-2 min-h-[300px] lg:min-h-0">
            <Depth market={market as string} />
          </div>
        </div>
      </div>

      {/* --- Sidebar (Swap UI) --- */}
      {/* This container holds the separator and SwapUI. It's full-width on mobile. */}
      <div className="flex w-full lg:w-auto">
        {/* The vertical separator line is hidden on mobile */}
        <div className="hidden lg:flex w-[10px] flex-col border-slate-800 border-l"></div>
        {/* SwapUI is full-width on mobile with padding, and fixed-width on desktop */}
        <div className="flex flex-col w-full p-4 lg:p-0 lg:w-[250px]">
          <SwapUI market={market as string} />
        </div>
      </div>
    </div>
  );
}
