import { ArrowDown, ArrowLeftRight, Banknote, Calculator, CircleDollarSign } from "lucide-react";
import type { ReactNode } from "react";
import { formatRupiah } from "@/lib/format";
import type { LoanResult } from "@/lib/calc";
import type { TabConfig } from "@/lib/tabs";

export type CalcMethod = "flat" | "anuitas";

interface ResultCardProps {
  result: LoanResult;
  config: TabConfig;
  method: CalcMethod;
  onToggleMethod: () => void;
}

export default function ResultCard({ result, config, method, onToggleMethod }: ResultCardProps) {
  const isAnuitas = method === "anuitas";
  const primaryMonthly = isAnuitas ? result.monthlyAnnuity : result.monthlyFlat;
  const primaryTotal = isAnuitas ? result.totalPaymentAnnuity : result.totalPaymentFlat;
  const primaryInterest = isAnuitas ? result.totalInterestAnnuity : result.totalInterestFlat;
  const secondaryMonthly = isAnuitas ? result.monthlyFlat : result.monthlyAnnuity;
  const secondaryLabel = isAnuitas ? "Bunga flat" : "Bunga anuitas";
  const secondaryNote = isAnuitas ? "Cicilan tetap setiap bulan" : "Umum digunakan bank";
  const secondaryClasses = isAnuitas
    ? "bg-slate-50 text-slate-800"
    : `${config.accentSoft} ${config.accentSoftText}`;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
      <div className={`bg-gradient-to-br ${config.accentFrom} ${config.accentTo} px-5 py-6 text-white sm:px-7 sm:py-7`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 text-sm font-medium text-white/75">Estimasi cicilan per bulan</p>
            <p className="truncate text-3xl font-bold tracking-tight sm:text-4xl">{formatRupiah(primaryMonthly)}</p>
            <p className="mt-2 text-xs text-white/70">Metode bunga {method}</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            <Calculator className="h-6 w-6" />
          </div>
        </div>
        <button
          onClick={onToggleMethod}
          className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/25 active:scale-[0.99]"
        >
          <ArrowLeftRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
          Konversi ke {isAnuitas ? "Bunga Flat" : "Bunga Anuitas"}
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        <div className="grid grid-cols-2 gap-4 px-5 py-5 sm:px-7">
          <Metric icon={<ArrowDown className="h-4 w-4" />} label="Uang muka (DP)" value={formatRupiah(result.downPaymentAmount)} accent={config.accentText} />
          <Metric icon={<Banknote className="h-4 w-4" />} label="Pokok pinjaman" value={formatRupiah(result.principal)} accent={config.accentText} />
        </div>

        <div className="px-5 py-5 sm:px-7">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Perbandingan metode bunga</p>
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-2xl p-3.5 ring-2 ring-inset ${isAnuitas ? `bg-white ${config.accentBorder}` : "bg-slate-50 ring-transparent"}`}>
              <div className="mb-1 flex items-center gap-1.5">
                <p className="text-xs text-slate-500">Bunga anuitas</p>
                {!isAnuitas && <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">aktif</span>}
              </div>
              <p className="text-base font-bold text-slate-800 sm:text-lg">{formatRupiah(result.monthlyAnnuity)}</p>
              <p className="mt-1 text-[11px] text-slate-400">Umum digunakan bank</p>
            </div>
            <div className={`rounded-2xl p-3.5 ring-2 ring-inset ${!isAnuitas ? `bg-white ${config.accentBorder}` : "bg-slate-50 ring-transparent"}`}>
              <div className="mb-1 flex items-center gap-1.5">
                <p className="text-xs text-slate-500">Bunga flat</p>
                {isAnuitas && <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">aktif</span>}
              </div>
              <p className="text-base font-bold text-slate-800 sm:text-lg">{formatRupiah(result.monthlyFlat)}</p>
              <p className="mt-1 text-[11px] text-slate-400">Cicilan tetap setiap bulan</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CircleDollarSign className="h-4 w-4 text-slate-400" />
              Total bunga
            </div>
            <p className="text-sm font-bold text-slate-800">{formatRupiah(primaryInterest)}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Banknote className="h-4 w-4 text-slate-400" />
              Total pembayaran
            </div>
            <p className="text-sm font-bold text-slate-800">{formatRupiah(primaryTotal)}</p>
          </div>
        </div>

        <div className="px-5 pb-6 pt-2 sm:px-7">
          <p className="text-center text-[11px] leading-relaxed text-slate-400">Hasil simulasi merupakan estimasi. Hubungi lembaga pembiayaan untuk penawaran resmi.</p>
        </div>
      </div>
    </section>
  );
}

interface MetricProps {
  icon: ReactNode;
  label: string;
  value: string;
  accent: string;
}

function Metric({ icon, label, value, accent }: MetricProps) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
        <span className={accent}>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <p className="truncate text-sm font-bold text-slate-800 sm:text-base">{value}</p>
    </div>
  );
}
