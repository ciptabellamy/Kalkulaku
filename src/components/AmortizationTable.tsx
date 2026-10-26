import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import type { AmortizationRow } from "@/lib/calc";

interface AmortizationTableProps {
  schedule: AmortizationRow[];
}

export default function AmortizationTable({ schedule }: AmortizationTableProps) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? schedule : schedule.slice(0, 12);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50">
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-sm">
            <tr className="text-slate-500">
              <th className="px-3 py-3 font-semibold first:pl-4 sm:px-4">Bln</th>
              <th className="px-3 py-3 text-right font-semibold sm:px-4">Cicilan</th>
              <th className="px-3 py-3 text-right font-semibold sm:px-4">Bunga</th>
              <th className="px-3 py-3 text-right font-semibold sm:px-4">Pokok</th>
              <th className="px-3 py-3 text-right font-semibold last:pr-4 sm:px-4">Sisa Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.month} className="text-slate-700 transition-colors hover:bg-sky-50/60">
                <td className="px-3 py-2.5 font-semibold first:pl-4 sm:px-4">{row.month}</td>
                <td className="px-3 py-2.5 text-right tabular-nums sm:px-4">{formatRupiah(row.payment)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-rose-500 sm:px-4">{formatRupiah(row.interest)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-emerald-600 sm:px-4">{formatRupiah(row.principal)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-slate-500 last:pr-4 sm:px-4">{formatRupiah(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {schedule.length > 12 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-2 border-t border-slate-200 bg-white py-3 text-sm font-semibold text-sky-600 transition-colors hover:bg-sky-50"
        >
          {expanded ? "Sembunyikan" : `Lihat semua (${schedule.length} bulan)`}
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}
