import { useEffect, useState } from "react";
import { Landmark, TrendingDown, Zap, Loader2 } from "lucide-react";

interface BiRateData {
  bi_rate: number;
  deposit_facility: number;
  lending_facility: number;
  meeting_date: string;
  source: string;
}

const FALLBACK_DATA: BiRateData = {
  bi_rate: 5.75,
  deposit_facility: 4.75,
  lending_facility: 6.50,
  meeting_date: "22 Juli 2026",
  source: "fallback",
};

interface BiRateBannerProps {
  onUseRate: (rate: number) => void;
  onDataLoaded?: (data: BiRateData) => void;
}

export default function BiRateBanner({ onUseRate, onDataLoaded }: BiRateBannerProps) {
  const [data, setData] = useState<BiRateData>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    fetch(`${supabaseUrl}/functions/v1/bi-rate`, {
      headers: {
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: BiRateData) => {
        if (json && typeof json.bi_rate === "number") {
          setData(json);
          onDataLoaded?.(json);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch BI rate:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg shadow-slate-300/50">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-300">Informasi Suku Bunga Acuan</p>
            <p className="mt-1 text-sm font-semibold text-white">BI-Rate & Lending Facility</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Memuat data terbaru...
                </span>
              ) : (
                <>Data {data.meeting_date} — Bank Indonesia</>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-emerald-300" />
              <p className="text-[11px] font-medium text-slate-300">BI-Rate</p>
            </div>
            <p className="text-lg font-bold text-white">
              {loading ? "—" : `${data.bi_rate.toFixed(2)}%`}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              <p className="text-[11px] font-medium text-slate-300">Lending Facility</p>
            </div>
            <p className="text-lg font-bold text-white">
              {loading ? "—" : `${data.lending_facility.toFixed(2)}%`}
            </p>
          </div>
          <button
            onClick={() => onUseRate(data.lending_facility)}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-900/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-400 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            Gunakan Bunga Acuan BI
          </button>
        </div>
      </div>
    </div>
  );
}
