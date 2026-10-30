import { useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Check, Copy, Info } from "lucide-react";
import Field from "@/components/Field";
import { formatNumber, formatRupiah, formatRupiahInput, parseRupiahInput } from "@/lib/format";
import { buildRefinanceCopyText, calculateRefinance, type InterestType } from "@/lib/refinance";
import { SITE_NAME, SITE_URL } from "@/lib/summary";
import type { TabConfig } from "@/lib/tabs";

const LOAN_KINDS = [
  { value: "kendaraan", label: "Kendaraan Bermotor", defaultType: "flat" },
  { value: "multiguna", label: "Kredit Multiguna", defaultType: "flat" },
  { value: "kpr", label: "KPR", defaultType: "efektif" },
] as const;

type LoanKind = (typeof LOAN_KINDS)[number]["value"];

const inputBase =
  "h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:font-medium placeholder:text-slate-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";
const inputCls = `${inputBase} pr-12`;
const inputWideCls = `${inputBase} pr-[4.5rem]`;

const typeLabel = (t: InterestType) => (t === "flat" ? "Flat" : "Efektif");

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  activeText: string;
}

function Segmented<T extends string>({ value, options, onChange, activeText }: SegmentedProps<T>) {
  return (
    <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={[
              "flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
              active ? `bg-white shadow-sm ${activeText}` : "text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface RefinanceCalculatorProps {
  config: TabConfig;
}

export default function RefinanceCalculator({ config }: RefinanceCalculatorProps) {
  // Pinjaman lama
  const [kind, setKind] = useState<LoanKind>("kendaraan");
  const [originalPrincipal, setOriginalPrincipal] = useState(100000000);
  const [originalTenor, setOriginalTenor] = useState(48);
  const [oldType, setOldType] = useState<InterestType>("flat");
  const [oldRate, setOldRate] = useState(9);
  const [penaltyPercent, setPenaltyPercent] = useState(2);
  const [paidInstallments, setPaidInstallments] = useState(12);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [differentialInput, setDifferentialInput] = useState("");

  // Pinjaman baru
  const [newType, setNewType] = useState<InterestType>("efektif");
  const [newRate, setNewRate] = useState(11);
  const [newTenorInput, setNewTenorInput] = useState("");
  const [newAdminFee, setNewAdminFee] = useState(500000);
  const [financeCosts, setFinanceCosts] = useState(true);

  const [copied, setCopied] = useState(false);

  const input = {
    originalPrincipal,
    originalTenorMonths: originalTenor,
    oldRate,
    oldType,
    penaltyPercent,
    remainingMode: currentBalance > 0 ? ("balance" as const) : ("paid" as const),
    paidInstallments,
    currentBalance,
    differentialOverride: differentialInput === "" ? null : Number(differentialInput),
    newRate,
    newType,
    newTenorMonths: newTenorInput === "" ? null : Number(newTenorInput),
    newAdminFee,
    financeCosts,
  };

  const result = useMemo(
    () => calculateRefinance(input),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [originalPrincipal, originalTenor, oldRate, oldType, penaltyPercent, paidInstallments, currentBalance, differentialInput, newRate, newType, newTenorInput, newAdminFee, financeCosts],
  );

  const kindLabel = LOAN_KINDS.find((k) => k.value === kind)?.label ?? "";
  const usingBalance = currentBalance > 0;

  const changeKind = (next: LoanKind) => {
    setKind(next);
    const found = LOAN_KINDS.find((k) => k.value === next);
    if (found) setOldType(found.defaultType);
  };

  const handleCopy = () => {
    const text = buildRefinanceCopyText(input, result, kindLabel, SITE_NAME, SITE_URL);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-5 lg:space-y-7">
      <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-7">
        {/* ── Pinjaman lama ── */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7">
          <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <span className="text-sm font-black">1</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Pinjaman saat ini</h2>
              <p className="text-xs text-slate-400">Data pinjaman yang ingin Anda refinancing</p>
            </div>
          </div>

          <div className="space-y-6">
            <Field label="Jenis pinjaman" hint="Pilih salah satu">
              <select
                value={kind}
                onChange={(event) => changeKind(event.target.value as LoanKind)}
                className="h-[52px] w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-10 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              >
                {LOAN_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Pokok pinjaman awal" hint="Wajib diisi" suffix="Rp">
                <input
                  inputMode="numeric"
                  value={formatRupiahInput(originalPrincipal)}
                  onChange={(event) => setOriginalPrincipal(parseRupiahInput(event.target.value))}
                  placeholder="Contoh: 100.000.000"
                  className={inputCls}
                />
              </Field>
              <Field label="Tenor awal" hint="Total angsuran" suffix="bulan">
                <input
                  type="number"
                  min="1"
                  value={originalTenor}
                  onChange={(event) => setOriginalTenor(Math.max(0, Math.round(Number(event.target.value))))}
                  className={inputWideCls}
                />
              </Field>
            </div>

            <Field label="Jenis bunga">
              <Segmented
                value={oldType}
                onChange={setOldType}
                activeText="text-emerald-600"
                options={[
                  { value: "flat", label: "Flat" },
                  { value: "efektif", label: "Efektif (anuitas)" },
                ]}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Bunga per tahun" hint="Bunga sebelumnya" suffix="% / thn">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={oldRate}
                  onChange={(event) => setOldRate(Math.min(100, Math.max(0, Number(event.target.value))))}
                  className={inputWideCls}
                />
              </Field>
              <Field label="Pinalti pelunasan" hint="% dari sisa pokok" suffix="%">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={penaltyPercent}
                  onChange={(event) => setPenaltyPercent(Math.min(100, Math.max(0, Number(event.target.value))))}
                  className={inputCls}
                />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Posisi angsuran saat ini</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Sudah dibayar" hint="Angsuran ke-" suffix="kali">
                  <input
                    type="number"
                    min="0"
                    value={paidInstallments}
                    disabled={usingBalance}
                    onChange={(event) => setPaidInstallments(Math.max(0, Math.round(Number(event.target.value))))}
                    className={`${inputWideCls} disabled:cursor-not-allowed disabled:opacity-50`}
                  />
                </Field>
                <Field label="Atau sisa pokok" hint="Jika lupa angsuran ke-" suffix="Rp">
                  <input
                    inputMode="numeric"
                    value={formatRupiahInput(currentBalance)}
                    onChange={(event) => setCurrentBalance(parseRupiahInput(event.target.value))}
                    placeholder="Opsional"
                    className={inputCls}
                  />
                </Field>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {usingBalance
                  ? "Yang dipakai: sisa pokok. Kosongkan kolom sisa pokok untuk kembali memakai angsuran ke-."
                  : "Kalau kolom sisa pokok diisi, kolom itulah yang dipakai."}
                {result.valid &&
                  ` Perkiraan: sudah dibayar ${result.paidInstallments} dari ${originalTenor} angsuran, sisa ${result.remainingMonths} bulan.`}
              </p>
            </div>

            {oldType === "flat" && (
              <Field label="Biaya selisih bunga flat vs efektif" hint="Opsional" suffix="Rp">
                <input
                  inputMode="numeric"
                  value={differentialInput === "" ? "" : formatRupiahInput(Number(differentialInput))}
                  onChange={(event) => setDifferentialInput(event.target.value.replace(/[^\d]/g, ""))}
                  placeholder={result.valid ? `Otomatis ${formatRupiah(result.differentialAuto)}` : "Otomatis"}
                  className={inputCls}
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Kosongkan untuk memakai estimasi otomatis. Isi bila lembaga pembiayaan menyebut nilainya.
                </p>
              </Field>
            )}
          </div>
        </section>

        {/* ── Pinjaman baru ── */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7">
          <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${config.accentSoft} ${config.accentSoftText}`}>
              <span className="text-sm font-black">2</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Penawaran pinjaman baru</h2>
              <p className="text-xs text-slate-400">Isi dari penawaran refinancing yang Anda dapat</p>
            </div>
          </div>

          <div className="space-y-6">
            <Field label="Jenis bunga">
              <Segmented
                value={newType}
                onChange={setNewType}
                activeText="text-emerald-600"
                options={[
                  { value: "efektif", label: "Efektif (anuitas)" },
                  { value: "flat", label: "Flat" },
                ]}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Bunga per tahun" hint="Penawaran baru" suffix="% / thn">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newRate}
                  onChange={(event) => setNewRate(Math.min(100, Math.max(0, Number(event.target.value))))}
                  className={inputWideCls}
                />
              </Field>
              <Field label="Tenor baru" hint="Opsional" suffix="bulan">
                <input
                  inputMode="numeric"
                  value={newTenorInput}
                  onChange={(event) => setNewTenorInput(event.target.value.replace(/[^\d]/g, ""))}
                  placeholder={result.valid ? `Otomatis ${result.remainingMonths}` : "Otomatis"}
                  className={inputWideCls}
                />
              </Field>
            </div>
            <p className="-mt-3 text-xs leading-5 text-slate-500">
              Tenor kosong berarti sama dengan sisa tenor lama. Tenor lebih panjang menurunkan angsuran, tetapi total bunga cenderung naik.
            </p>

            <Field label="Biaya admin / provisi pinjaman baru" suffix="Rp">
              <input
                inputMode="numeric"
                value={formatRupiahInput(newAdminFee)}
                onChange={(event) => setNewAdminFee(parseRupiahInput(event.target.value))}
                placeholder="Contoh: 500.000"
                className={inputCls}
              />
            </Field>

            <Field label="Cara membayar biaya pelunasan" hint="Pinalti, selisih bunga, admin">
              <Segmented
                value={financeCosts ? "financed" : "cash"}
                onChange={(v) => setFinanceCosts(v === "financed")}
                activeText="text-emerald-600"
                options={[
                  { value: "financed", label: "Ditambah ke pinjaman baru" },
                  { value: "cash", label: "Dibayar tunai di muka" },
                ]}
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {financeCosts
                  ? "Biaya masuk ke pokok pinjaman baru, jadi angsuran baru sudah memperhitungkannya."
                  : "Biaya dibayar sekarang. Di tabel, biaya itu diratakan ke angsuran sebagai angsuran efektif."}
              </p>
            </Field>

            <div className={`flex gap-2.5 rounded-2xl border px-4 py-3.5 text-xs leading-5 ${config.accentBorder} ${config.accentSoft} ${config.accentSoftText}`}>
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Refinancing menguntungkan bila penghematan bunga lebih besar daripada pinalti, selisih bunga, dan biaya baru. Bandingkan bunga dalam ukuran yang sama, yaitu bunga efektif setara.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── Hasil ── */}
      {!result.valid ? (
        <div className="flex gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-6 text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{result.warnings.join(" ")}</p>
        </div>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className={`bg-gradient-to-br ${config.accentFrom} ${config.accentTo} px-5 py-6 text-white sm:px-7 sm:py-7`}>
            <p className="mb-1 text-sm font-medium text-white/75">
              {result.totalSaving >= 0 ? "Estimasi penghematan bersih" : "Estimasi tambahan biaya bersih"}
            </p>
            <p className="text-3xl font-bold tracking-tight sm:text-4xl">{formatRupiah(Math.abs(result.totalSaving))}</p>
            <p className="mt-2 text-sm text-white/85">
              {result.totalSaving > 0
                ? "Refinancing berpotensi menguntungkan pada skenario ini."
                : result.totalSaving < 0
                  ? "Refinancing belum menguntungkan pada skenario ini."
                  : "Refinancing impas pada skenario ini."}
            </p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
              <Chip label="Angsuran per bulan" value={signedMoney(result.monthlyDiffNet)} />
              <Chip label="Total bunga" value={signedMoney(result.interestDiff)} />
              <Chip
                label="Titik impas biaya tunai"
                value={result.breakEvenMonths ? `± ${Math.ceil(result.breakEvenMonths)} bulan` : "—"}
              />
            </div>
          </div>

          {/* Tabel perbandingan */}
          <div className="px-5 py-6 sm:px-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Perbandingan pinjaman</p>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead className="bg-slate-100/80 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Rincian</th>
                    <th className="px-4 py-3 text-right font-semibold">Pinjaman lama (lanjut)</th>
                    <th className="px-4 py-3 text-right font-semibold">Pinjaman baru</th>
                    <th className="px-4 py-3 text-right font-semibold">Selisih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <Row
                    label="Jenis dan bunga"
                    oldValue={`${typeLabel(oldType)} ${formatNumber(oldRate)}% / thn`}
                    newValue={`${typeLabel(newType)} ${formatNumber(newRate)}% / thn`}
                  />
                  <Row
                    label="Bunga efektif setara"
                    oldValue={`${formatNumber(result.oldRateEquivalent)}% / thn`}
                    newValue={`${formatNumber(result.newRateEquivalent)}% / thn`}
                    diff={rateDiff(result.oldRateEquivalent - result.newRateEquivalent)}
                  />
                  <Row
                    label="Sisa tenor"
                    oldValue={`${result.remainingMonths} bulan`}
                    newValue={`${result.newTenorMonths} bulan`}
                    diff={
                      <span className="text-slate-500">
                        {result.newTenorMonths === result.remainingMonths
                          ? "Sama"
                          : `${result.newTenorMonths > result.remainingMonths ? "+" : "-"}${Math.abs(result.newTenorMonths - result.remainingMonths)} bulan`}
                      </span>
                    }
                  />
                  <Row
                    label="Pokok pinjaman"
                    oldValue={formatRupiah(result.oldBalance)}
                    newValue={formatRupiah(result.newPrincipal)}
                    diff={
                      <span className="text-slate-500">
                        {result.financedCosts > 0 ? `+${formatRupiah(result.financedCosts)} biaya` : "—"}
                      </span>
                    }
                  />
                  <Row
                    label="Angsuran per bulan"
                    oldValue={formatRupiah(result.oldMonthly)}
                    newValue={formatRupiah(result.newMonthly)}
                    diff={moneyDiff(result.monthlyDiff)}
                  />
                  <Row
                    label="Angsuran efektif per bulan (setelah netting biaya)"
                    oldValue={formatRupiah(result.oldMonthly)}
                    newValue={formatRupiah(result.newEffectiveMonthly)}
                    diff={moneyDiff(result.monthlyDiffNet)}
                    strong
                  />
                  <Row
                    label="Total bunga sisa masa pinjaman"
                    oldValue={formatRupiah(result.oldRemainingInterest)}
                    newValue={formatRupiah(result.newTotalInterest)}
                    diff={moneyDiff(result.interestDiff)}
                  />
                  <Row
                    label="Total pembayaran sisa (termasuk semua biaya)"
                    oldValue={formatRupiah(result.oldRemainingPayments)}
                    newValue={formatRupiah(result.newTotalPayments)}
                    diff={moneyDiff(result.totalSaving)}
                    strong
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* Rincian biaya */}
          <div className="border-t border-slate-100 px-5 py-6 sm:px-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Rincian biaya pelunasan dan pinjaman baru</p>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full border-collapse text-left text-sm">
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <CostRow label="Sisa pokok pinjaman lama" value={formatRupiah(result.oldBalance)} />
                  {oldType === "flat" && (
                    <CostRow
                      label={`Selisih bunga flat vs efektif${result.differentialIsOverride ? " (sesuai input)" : " (estimasi)"}`}
                      value={formatRupiah(result.differential)}
                    />
                  )}
                  <CostRow label={`Pinalti (${formatNumber(penaltyPercent)}% dari sisa pokok)`} value={formatRupiah(result.penalty)} />
                  <CostRow label="Total pelunasan ke lembaga lama" value={formatRupiah(result.payoffTotal)} strong />
                  <CostRow label="Biaya admin / provisi pinjaman baru" value={formatRupiah(newAdminFee)} />
                  <CostRow label="Total biaya sekali bayar" value={formatRupiah(result.oneOffCosts)} strong />
                  <CostRow label="Dibayar tunai di muka" value={formatRupiah(result.upfrontCash)} />
                  <CostRow label="Ditambahkan ke pokok pinjaman baru" value={formatRupiah(result.financedCosts)} />
                </tbody>
              </table>
            </div>
          </div>

          {/* Peringatan dan catatan */}
          <div className="space-y-3 border-t border-slate-100 px-5 py-6 sm:px-7">
            {result.warnings.map((warning) => (
              <div key={warning} className="flex gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{warning}</p>
              </div>
            ))}
            <div className="flex gap-2.5 rounded-2xl bg-slate-50 px-4 py-3.5 text-xs leading-5 text-slate-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <p>
                Hasil simulasi merupakan estimasi. Pinalti dihitung dari sisa pokok. Selisih bunga flat vs efektif diperkirakan dari bunga efektif setara, dan cara hitung tiap lembaga bisa berbeda. Minta rincian pelunasan resmi dari lembaga pembiayaan lama sebelum memutuskan.
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 active:translate-y-0 sm:w-auto sm:px-8"
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
        </section>
      )}
    </div>
  );
}

/* ───────── Komponen kecil ───────── */

const signedMoney = (value: number): string => {
  if (Math.abs(value) < 1) return "Tidak berubah";
  return value > 0 ? `Hemat ${formatRupiah(value)}` : `Naik ${formatRupiah(-value)}`;
};

const moneyDiff = (value: number): ReactNode => {
  if (Math.abs(value) < 1) return <span className="text-slate-400">—</span>;
  return value > 0 ? (
    <span className="font-bold text-emerald-600">Hemat {formatRupiah(value)}</span>
  ) : (
    <span className="font-bold text-rose-500">Naik {formatRupiah(-value)}</span>
  );
};

const rateDiff = (value: number): ReactNode => {
  if (Math.abs(value) < 0.005) return <span className="text-slate-400">—</span>;
  return value > 0 ? (
    <span className="font-bold text-emerald-600">Lebih rendah {formatNumber(value)} poin</span>
  ) : (
    <span className="font-bold text-rose-500">Lebih tinggi {formatNumber(-value)} poin</span>
  );
};

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
      <p className="text-[11px] font-medium text-white/70">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}

interface RowProps {
  label: string;
  oldValue: string;
  newValue: string;
  diff?: ReactNode;
  strong?: boolean;
}

function Row({ label, oldValue, newValue, diff, strong }: RowProps) {
  return (
    <tr className={strong ? "bg-slate-50/70" : ""}>
      <td className={`px-4 py-3 ${strong ? "font-semibold text-slate-900" : ""}`}>{label}</td>
      <td className="px-4 py-3 text-right tabular-nums">{oldValue}</td>
      <td className="px-4 py-3 text-right tabular-nums">{newValue}</td>
      <td className="px-4 py-3 text-right tabular-nums">{diff ?? <span className="text-slate-300">—</span>}</td>
    </tr>
  );
}

function CostRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <tr className={strong ? "bg-slate-50/70" : ""}>
      <td className={`px-4 py-3 ${strong ? "font-semibold text-slate-900" : ""}`}>{label}</td>
      <td className={`px-4 py-3 text-right tabular-nums ${strong ? "font-bold text-slate-900" : ""}`}>{value}</td>
    </tr>
  );
}
