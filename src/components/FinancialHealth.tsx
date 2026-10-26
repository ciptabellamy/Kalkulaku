import { ShieldCheck, Wallet, AlertTriangle } from "lucide-react";
import { formatRupiah } from "@/lib/format";

interface FinancialHealthProps {
  minIncome: number;
  monthlyPayment: number;
}

export default function FinancialHealth({ minIncome, monthlyPayment }: FinancialHealthProps) {
  const ratio = 30;

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Kesehatan Keuangan (Ideal Ratio)</h3>
          <p className="text-xs text-slate-500">Analisis kemampuan finansial Anda</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
            <Wallet className="h-4 w-4 text-emerald-500" />
            Min. Penghasilan Bersih / Bulan
          </div>
          <p className="text-xl font-bold text-slate-900 sm:text-2xl">{formatRupiah(minIncome)}</p>
          <p className="mt-1 text-[11px] text-slate-400">Agar rasio cicilan tetap di 30%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Rasio Cicilan terhadap Penghasilan
          </div>
          <p className="text-xl font-bold text-slate-900 sm:text-2xl">{ratio}%</p>
          <p className="mt-1 text-[11px] text-slate-400">Batas aman ideal dari penghasilan bersih</p>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
        <p className="text-sm leading-relaxed text-slate-700">
          Agar kondisi finansial tetap stabil, idealnya total cicilan tidak melebihi <span className="font-bold text-emerald-700">30% dari penghasilan bersih bulanan</span>. Disarankan memiliki pendapatan bersih minimal <span className="font-bold text-emerald-700">{formatRupiah(minIncome)}</span> per bulan sebelum mengambil kredit ini.
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-emerald-500" style={{ width: `${ratio}%` }} />
        </div>
        <span className="shrink-0 font-semibold text-emerald-600">{ratio}%</span>
      </div>
    </section>
  );
}
