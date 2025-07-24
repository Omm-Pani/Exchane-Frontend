"use client";
import { useEffect, useState } from "react";
import { getOpenInterest, getTickers } from "../utils/httpClient";
import { useRouter } from "next/navigation";

const coinImages: { [key: string]: string } = {
  "SOL-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fsol.png&w=96&q=95",
  "ETH-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Feth.png&w=96&q=95",
  "HYPE-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fhype.png&w=96&q=95",
  "SUI-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fsui.png&w=96&q=95",
  "XRP-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fxrp.png&w=96&q=95",
  "TRUMP-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Ftrump.png&w=96&q=95",
  "FARTCOIN-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Ffartcoin.png&w=96&q=95",
  "JUP-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fjup.png&w=96&q=95",
  "BNB-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fbnb.png&w=96&q=95",
  "DOGE-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fdoge.png&w=96&q=95",
  "KAITO-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fkaito.png&w=96&q=95",
  "AAVE-PERP": "https://backpack.exchange/coins/aave.svg",
  "ENA-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fena.png&w=96&q=95",
  "BERA-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fbera.png&w=96&q=95",
  "ONDO-PERP": "https://backpack.exchange/coins/ondo.svg",
  "LINK-PERP": "https://backpack.exchange/coins/link.svg",
  "AVAX-PERP": "https://backpack.exchange/trade/AVAX_USD_PERP",
  "S-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fs.png&w=96&q=95",
  "LTC-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fltc.png&w=96&q=95",
  "IP-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fip.png&w=96&q=95",
  "WIF-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fwif.png&w=96&q=95",
  "ADA-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fada.png&w=96&q=95",
  "ARB-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Farb.png&w=96&q=95",
  "DOT-PERP":
    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fdot.png&w=96&q=95",
};

type Market = {
  name: string;
  price: string;
  cap: string;
  volume: string;
  change: string;
};

export default function Page() {
  let cachedTickers: any[] | null = null;
  let cachedOpenInterest: any[] | null = null;
  const [perpMarkets, setPerpMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const tickerData = async () => {
    setLoading(true);
    try {
      const [data, openInterestList] = await Promise.all([
        cachedTickers ? Promise.resolve(cachedTickers) : getTickers(),
        cachedOpenInterest
          ? Promise.resolve(cachedOpenInterest)
          : getOpenInterest(),
      ]);

      cachedTickers = data;
      cachedOpenInterest = openInterestList;

      const openInterestMap = new Map(
        openInterestList.map((oi: any) => [oi.symbol, oi.openInterest])
      );

      const perpMarket = data
        .filter((coin) => coin.symbol.includes("PERP"))
        .map((coin) => {
          const openInterest = openInterestMap.get(coin.symbol);

          return {
            name: coin.symbol.replace("_USDC_", "-"),
            price: coin.lastPrice,
            change: coin.priceChangePercent,
            cap: openInterest
              ? `${Number(coin.lastPrice) * Number(openInterest)}`
              : "0",
            volume: coin.quoteVolume,
          };
        })
        .sort((a, b) => Number(b.cap) - Number(a.cap));

      setPerpMarkets(perpMarket);
    } catch (error) {
      console.error("Failed to fetch ticker data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    tickerData();
  }, []);

  const handleRowClick = (marketName: string) => {
    router?.push(`/trade/${marketName.replace("-", "_USDC_")}`);
  };

  return (
    <div className="flex flex-row flex-1">
      {/* Changed w-3/4 to be responsive */}
      <div className="flex flex-col flex-1 pt-[100px] w-full px-4 sm:px-6 lg:max-w-7xl lg:mx-auto">
        <div className="w-full flex flex-col bg-[#14151b] flex-1 gap-3 rounded-xl p-4">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-[300px] text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mr-3" />
                Loading markets...
              </div>
            ) : (
              <>
                {/* ---- Desktop Table (Hidden on mobile) ---- */}
                <table className="min-w-full hidden md:table">
                  <thead>
                    <tr>
                      <th className="border-b border-[#202127] px-1 py-3 text-sm font-normal text-[#969faf] first:pl-2 last:pr-6">
                        <div className="flex flex-row items-center px-1 first:pl-0 cursor-pointer select-none justify-start text-left">
                          Name
                        </div>
                      </th>
                      <th className="border-b border-[#202127] px-1 py-3 text-sm font-normal text-[#969faf] first:pl-2 last:pr-6">
                        <div className="flex flex-row items-center px-1 first:pl-0 cursor-pointer select-none justify-end text-right">
                          Price
                        </div>
                      </th>
                      <th className="border-b border-[#202127] px-1 py-3 text-sm font-normal text-[#969faf] first:pl-2 last:pr-6">
                        <div className="flex flex-row items-center px-1 first:pl-0 cursor-pointer select-none justify-end text-right">
                          24h Change
                        </div>
                      </th>
                      <th className="border-b border-[#202127] px-1 py-3 text-sm font-normal text-[#969faf] first:pl-2 last:pr-6">
                        <div className="flex flex-row items-center px-1 first:pl-0 cursor-pointer select-none justify-end text-right">
                          24h Volume
                        </div>
                      </th>
                      <th className="border-b border-[#202127] px-1 py-3 text-sm font-normal text-[#969faf] first:pl-2 last:pr-6">
                        <div className="flex flex-row items-center px-1 first:pl-0 cursor-pointer select-none justify-end text-right">
                          Open Interest
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#202127]">
                    {perpMarkets.map((market) => (
                      <tr
                        key={market.name}
                        className="group hover:bg-[#202127] cursor-pointer"
                        onClick={() => handleRowClick(market.name)}
                      >
                        <td className="tabular-nums px-2 py-3 last:pr-7">
                          <div className="flex items-center">
                            <div className="relative">
                              <div
                                style={{ width: "40px", height: "40px" }}
                                className="relative flex-none overflow-hidden rounded-full border-[#ffffff26] border"
                              >
                                <img
                                  src={
                                    coinImages[market.name] ||
                                    "https://backpack.exchange/_next/image?url=%2Fcoins%2Fbtc.png&w=96&q=95"
                                  }
                                  alt={`${market.name} logo`}
                                  loading="lazy"
                                  width="40"
                                  height="40"
                                  decoding="async"
                                  style={{ color: "transparent" }}
                                />
                              </div>
                            </div>
                            <div className="ml-2 flex flex-col">
                              <div className="flex items-center justify-start flex-row gap-2">
                                <div className="text-base font-medium">
                                  {market.name}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="tabular-nums px-2 py-3 text-right">
                          <div className="text-base font-medium tabular-nums">
                            ${Number(market.price).toFixed(2)}
                          </div>
                        </td>
                        <td className="tabular-nums px-2 py-3 text-right">
                          <div
                            className={`text-base font-medium tabular-nums ${
                              Number(market.change) >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {Number(market.change).toFixed(2)}%
                          </div>
                        </td>
                        <td className="tabular-nums px-2 py-3 text-right">
                          <div className="text-base font-medium tabular-nums">
                            ${Number(market.volume).toLocaleString()}
                          </div>
                        </td>
                        <td className="tabular-nums px-2 py-3 text-right">
                          <div className="text-base font-medium tabular-nums">
                            ${Number(market.cap).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ---- Mobile Card Layout (Visible on mobile only) ---- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                  {perpMarkets.map((market) => (
                    <div
                      key={market.name}
                      className="bg-[#202127] p-4 rounded-lg cursor-pointer flex flex-col gap-4"
                      onClick={() => handleRowClick(market.name)}
                    >
                      {/* --- Top Row: Name, Price, Change --- */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              coinImages[market.name] ||
                              "https://backpack.exchange/_next/image?url=%2Fcoins%2Fbtc.png&w=96&q=95"
                            }
                            alt={`${market.name} logo`}
                            loading="lazy"
                            className="w-10 h-10 rounded-full border border-[#ffffff26]"
                          />
                          <div className="font-medium text-base">
                            {market.name}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="font-medium text-base tabular-nums">
                            ${Number(market.price).toFixed(2)}
                          </div>
                          <div
                            className={`text-sm font-medium tabular-nums ${
                              Number(market.change) >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {Number(market.change).toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      {/* --- Bottom Row: Volume and Open Interest --- */}
                      <div className="flex justify-between items-center text-sm text-[#969faf]">
                        <div className="flex flex-col items-start">
                          <div>24h Volume</div>
                          <div className="font-medium text-white tabular-nums">
                            ${Number(market.volume).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div>Open Interest</div>
                          <div className="font-medium text-white tabular-nums">
                            ${Number(market.cap).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
