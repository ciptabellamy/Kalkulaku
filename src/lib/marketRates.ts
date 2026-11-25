import { useEffect, useState } from "react";
import { KPR_FLOATING_SPREAD } from "@/lib/tabs";

export type MarketRateKey = "kendaraan" | "multiguna" | "kpr";

export interface MarketRate {
  average: number; // % per tahun
  low: number;
  high: number;
  basis: string;
}

export interface MarketRates {
  updatedAt: string; // YYYY-MM-DD
  biRate: { value: number; asOf: string; source: string };
  floatingSpread: number;
  rates: Record<MarketRateKey, MarketRate>;
}

// Data cadangan bila /market-rates.json gagal dimuat. Samakan dengan public/market-rates.json.
export const FALLBACK_MARKET_RATES: MarketRates = {
  updatedAt: "2026-11-25",
  biRate: { value: 6.0, asOf: "2026-11-18", source: "Bank Indonesia, RDG 17-18 November 2026" },
  floatingSpread: KPR_FLOATING_SPREAD,
  rates: {
    kendaraan: { average: 10, low: 5, high: 15, basis: "efektif per tahun" },
    multiguna: { average: 15, low: 10, high: 24, basis: "efektif per tahun" },
    kpr: { average: 5, low: 2.6, high: 9, basis: "bunga fixed di tahun-tahun awal" },
  },
};

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

const isRate = (v: unknown): v is MarketRate => {
  const r = v as MarketRate | null;
  return !!r && isNum(r.average) && isNum(r.low) && isNum(r.high) && typeof r.basis === "string";
};

export const isValidMarketRates = (data: unknown): data is MarketRates => {
  const d = data as MarketRates | null;
  return (
    !!d &&
    typeof d.updatedAt === "string" &&
    !!d.biRate &&
    isNum(d.biRate.value) &&
    typeof d.biRate.asOf === "string" &&
    isNum(d.floatingSpread) &&
    !!d.rates &&
    isRate(d.rates.kendaraan) &&
    isRate(d.rates.multiguna) &&
    isRate(d.rates.kpr)
  );
};

export const useMarketRates = (): MarketRates => {
  const [data, setData] = useState<MarketRates>(FALLBACK_MARKET_RATES);

  useEffect(() => {
    let cancelled = false;
    fetch("/market-rates.json", { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: unknown) => {
        if (!cancelled && isValidMarketRates(json)) setData(json);
      })
      .catch(() => {
        // tetap memakai data cadangan
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
};

export const formatDateId = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};
