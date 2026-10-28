import { useState } from "react";
import {
  ArrowLeftRight,
  Banknote,
  Calculator,
  CircleDollarSign,
  Copy,
  Check,
  Download,
  ArrowDown,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { formatNumber, formatRupiah } from "@/lib/format";
import type { LoanResult, AmortizationRow } from "@/lib/calc";
import type { TabConfig } from "@/lib/tabs";
import AmortizationTable from "@/components/AmortizationTable";
import { buildCopyText, type SummaryData } from "@/lib/summary";
import { generatePDF } from "@/lib/pdf";

export type CalcMethod = "flat" | "anuitas";

const fixedLabel = (months: number) => (months % 12 === 0 ? `${months / 12} tahun` : `${months} bulan`);

interface ResultCardProps {
  result: LoanResult;
  config: TabConfig;
  method: CalcMethod;
  onToggleMethod: () => void;
  price: number;
  downPaymentPercent: number;
  interestRate: number;
  tenorMonths: number;
  adminFee: number;
  insuranceFee: number;
  floatingSource?: string;
}

export default function ResultCard({ result, config, method, onToggleMethod, price, downPaymentPercent, interestRate, tenorMonths, adminFee, insuranceFee, floatingSource }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const isAnuitas = method === "anuitas";
  const primaryMonthly = isAnuitas ? result.monthlyAnnuity : result.monthlyFlat;
  const primaryTotal = isAnuitas ? result.totalPaymentAnnuity : result.totalPaymentFlat;
  const primaryInterest = isAnuitas ? result.totalInterestAnnuity : result.totalInterestFlat;
  const schedule: AmortizationRow[] = isAnuitas ? result.scheduleAnnuity : result.scheduleFlat;

  const summaryData: SummaryData = {
    config, result, method, price, downPaymentPercent, interestRate, tenorMonths, adminFee, insuranceFee, floatingSource,
  };

  const handleCopy = () => {
    const text = buildCopyText(summaryData);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadPDF = () => {
    generatePDF(summaryData);
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
      {/* Header */}
      <div className={`bg-gradient-to-br ${config.accentFrom} ${config.accentTo} px-5 py-6 text-white sm:px-7 sm:py-7`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 text-sm font-medium text-white/75">Estimasi cicilan per bulan</p>
            <p className="truncate text-3xl font-bold tracking-tight sm:text-4xl">{formatRupiah(primaryMonthly)}</p>
            <p className="mt-2 text-xs text-white/70">
              {result.floating ? `Selama masa fixed (${fixedLabel(result.floating.fixedMonths)})` : `Metode bunga ${method}`}
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            <Calculator className="h-6 w-6" />
          </div>
        </div>
        {config.allowFlat && (
        <button
          onClick={onToggleMethod}
          className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/25 active:scale-[0.99]"
        >
          <ArrowLeftRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
          Konversi ke {isAnuitas ? "Bunga Flat" : "Bunga Anuitas"}
        </button>
        )}
      </div>

      {/* Metrics */}
      <div className="divide-y divide-slate-100">
        <div className="grid grid-cols-2 gap-4 px-5 py-5 sm:px-7">
          <Metric icon={<ArrowDown className="h-4 w-4" />} label={config.upfrontLabel} value={formatRupiah(result.totalDownPayment)} accent={config.accentText} />
          <Metric icon={<Banknote className="h-4 w-4" />} label="Pokok Pinjaman" value={formatRupiah(result.principal)} accent={config.accentText} />
        </div>

        {result.floating && (
          <div className="px-5 py-5 sm:px-7">
            <div className={`rounded-xl border p-4 ${config.accentBorder} ${config.accentSoft}`}>
              <p className={`mb-3 text-sm font-bold ${config.accentSoftText}`}>Cicilan masa fixed dan floating</p>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-500">Masa fixed ({fixedLabel(result.floating.fixedMonths)}, bunga {formatNumber(interestRate)}%)</dt>
                  <dd className="shrink-0 font-bold text-slate-800">{formatRupiah(result.monthlyAnnuity)}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-500">Setelah masa fixed (bunga floating {formatNumber(result.floating.floatingRate)}%)</dt>
                  <dd className="shrink-0 font-bold text-slate-800">≈ {formatRupiah(result.floating.monthlyAfterFixed)}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-500">Sisa pokok saat masa fixed berakhir</dt>
                  <dd className="shrink-0 font-bold text-slate-800">{formatRupiah(result.floating.balanceAtSwitch)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Cicilan setelah masa fixed adalah estimasi dan bisa berubah mengikuti suku bunga pasar.
                {floatingSource ? ` Bunga floating dihitung dari: ${floatingSource}.` : ""}
              </p>
            </div>
          </div>
        )}

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

        {/* Financial Health Summary */}
        <div className="px-5 py-5 sm:px-7">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Kesehatan Keuangan</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
            <Wallet className="h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <p className="text-xs text-slate-500">Min. Penghasilan Bersih / Bulan</p>
              <p className="text-base font-bold text-slate-900">{formatRupiah(result.minIncome)}</p>
            </div>
          </div>
        </div>

        {/* Amortization Schedule */}
        <div className="px-5 py-5 sm:px-7">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Jadwal Angsuran</p>
          <AmortizationTable schedule={schedule} />
        </div>

        {/* Action Buttons */}
        <div className="px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleDownloadPDF}
              className="group flex flex-1 items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0"
            >
              <Download className="h-4 w-4 transition-transform group-hover:scale-110" />
              Download PDF
            </button>
            <button
              onClick={handleCopy}
              className="group flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 active:translate-y-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 transition-transform group-hover:scale-110" />
                  Salin Ringkasan
                </>
              )}
            </button>
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
