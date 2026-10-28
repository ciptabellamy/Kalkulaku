import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BadgePercent,
  ChevronDown,
  Info,
  Sparkles,
  Landmark,
} from "lucide-react";

interface BiRateData {
  bi_rate: number;
  deposit_facility: number;
  lending_facility: number;
  meeting_date: string;
  source: string;
}
import Field from "@/components/Field";
import ResultCard from "@/components/ResultCard";
import TabBar from "@/components/TabBar";
import BiRateBanner from "@/components/BiRateBanner";
import FinancialHealth from "@/components/FinancialHealth";
import { calculateLoan } from "@/lib/calc";
import { formatRupiah, formatRupiahInput, parseRupiahInput } from "@/lib/format";
import { TAB_CONFIGS, type CreditType } from "@/lib/tabs";

const getConfig = (id: CreditType) => TAB_CONFIGS.find((tab) => tab.id === id) ?? TAB_CONFIGS[0];

function App() {
  const [activeType, setActiveType] = useState<CreditType>("kendaraan");
  const config = getConfig(activeType);
  const ConfigIcon = config.icon;
  const [price, setPrice] = useState(config.defaultPrice);
  const [downPayment, setDownPayment] = useState(config.defaultDP);
  const [interestRate, setInterestRate] = useState(config.defaultRate);
  const [tenorMonths, setTenorMonths] = useState(config.defaultTenorMonths);
  const [adminFee, setAdminFee] = useState(config.defaultAdminFee);
  const [insuranceFee, setInsuranceFee] = useState(config.defaultInsuranceFee);
  const [method, setMethod] = useState<"flat" | "anuitas">("anuitas");
  const [showFees, setShowFees] = useState(false);
  const [biRate, setBiRate] = useState<number>(6.5);

  const effectiveDP = config.hasDownPayment ? downPayment : 0;

  const result = useMemo(
    () => calculateLoan({ price, downPaymentPercent: effectiveDP, interestRate, tenorMonths, adminFee, insuranceFee }),
    [price, effectiveDP, interestRate, tenorMonths, adminFee, insuranceFee],
  );

  const switchType = (type: CreditType) => {
    const next = getConfig(type);
    setActiveType(type);
    setPrice(next.defaultPrice);
    setDownPayment(next.defaultDP);
    setInterestRate(next.defaultRate);
    setTenorMonths(next.defaultTenorMonths);
    setAdminFee(next.defaultAdminFee);
    setInsuranceFee(next.defaultInsuranceFee);
  };

  const toggleMethod = () => setMethod((prev) => (prev === "flat" ? "anuitas" : "flat"));

  const primaryMonthly = method === "anuitas" ? result.monthlyAnnuity : result.monthlyFlat;
  return (
    <div className="min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute -right-20 top-56 h-96 w-96 rounded-full bg-emerald-100/35 blur-3xl" />
      </div>

      <header className="relative border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-300 sm:h-11 sm:w-11">
              <span className="text-lg font-black tracking-tight">K</span>
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-slate-950 sm:text-lg">Kalku<span className="text-sky-600">laku</span></p>
              <p className="hidden text-[11px] font-medium tracking-wide text-slate-400 sm:block">Kalkulator Simulasi Kredit Kendaraan, Multiguna & KPR Terpercaya</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Simulasi mudah & transparan
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-5 pb-14 pt-9 sm:px-8 sm:pt-12">
        {/* 1. BI Rate Banner */}
        <BiRateBanner onUseRate={(rate) => setInterestRate(rate)} onDataLoaded={(d) => setBiRate(d.lending_facility)} />

        {/* Hero */}
        <div className="mb-8 mt-10 max-w-2xl sm:mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Simulasi kredit online</p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">Kalkulaku – Kalkulator Simulasi Kredit Kendaraan Bermotor, Multiguna & KPR Terpercaya</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Hitung estimasi angsuran bulanan, DP, bunga kredit kendaraan bermotor, multiguna, dan KPR, serta analisis kesehatan finansial secara akurat tanpa ribet.</p>
        </div>

        <TabBar active={activeType} onChange={switchType} />

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)] lg:gap-7">
          {/* 2. Form Input */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7">
            <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${config.accentSoft} ${config.accentSoftText}`}>
                <ConfigIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Detail pembiayaan</h2>
                <p className="text-xs text-slate-400">Isi data berikut untuk melihat estimasi</p>
              </div>
            </div>

            <div className="space-y-6">
              <Field label={config.priceLabel} hint="Wajib diisi" suffix="Rp">
                <input
                  inputMode="numeric"
                  value={formatRupiahInput(price)}
                  onChange={(event) => setPrice(parseRupiahInput(event.target.value))}
                  placeholder={config.pricePlaceholder}
                  className="h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-12 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </Field>

              <div className={config.hasDownPayment ? "grid gap-5 sm:grid-cols-2" : "grid gap-5"}>
                {config.hasDownPayment && (
                <Field label="Uang muka / DP" hint="Min. 10%" suffix="%">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={downPayment}
                    onChange={(event) => setDownPayment(Math.min(100, Math.max(0, Number(event.target.value))))}
                    className="h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-12 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                  <div className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${config.accentText}`}>
                    <BadgePercent className="h-3.5 w-3.5" />
                    {formatRupiah(result.downPaymentAmount)}
                  </div>
                </Field>
                )}

                <Field label="Suku bunga per tahun" hint="Estimasi" suffix="% / thn">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={interestRate}
                    onChange={(event) => setInterestRate(Math.min(100, Math.max(0, Number(event.target.value))))}
                    className="h-[52px] w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-[4.5rem] text-sm font-semibold text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                  <button
                    onClick={() => setInterestRate(biRate)}
                    className="mt-2 flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-100"
                  >
                    <Landmark className="h-3 w-3" />
                    Gunakan Bunga Acuan BI ({biRate.toFixed(2)}%)
                  </button>
                </Field>
              </div>

              <Field label="Tenor / durasi pinjaman" hint="Pilih durasi">
                <div className="relative">
                  <select
                    value={tenorMonths}
                    onChange={(event) => setTenorMonths(Number(event.target.value))}
                    className="h-[52px] w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-10 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  >
                    {config.tenorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              {/* Optional Additional Fees */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <button
                  onClick={() => setShowFees(!showFees)}
                  className="flex w-full items-center justify-between text-sm font-semibold text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-slate-400" />
                    Biaya Tambahan (Opsional)
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${showFees ? "rotate-180" : ""}`} />
                </button>
                {showFees && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label={config.adminFeeLabel} suffix="Rp">
                      <input
                        inputMode="numeric"
                        value={formatRupiahInput(adminFee)}
                        onChange={(event) => setAdminFee(parseRupiahInput(event.target.value))}
                        placeholder="Contoh: 500.000"
                        className="h-[52px] w-full rounded-xl border border-slate-200 bg-white pl-4 pr-12 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </Field>
                    <Field label="Biaya Asuransi" suffix="Rp">
                      <input
                        inputMode="numeric"
                        value={formatRupiahInput(insuranceFee)}
                        onChange={(event) => setInsuranceFee(parseRupiahInput(event.target.value))}
                        placeholder="Contoh: 1.000.000"
                        className="h-[52px] w-full rounded-xl border border-slate-200 bg-white pl-4 pr-12 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </Field>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-7 flex gap-2.5 rounded-2xl bg-slate-50 px-4 py-3.5 text-xs leading-5 text-slate-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              Hasil simulasi merupakan estimasi dan dapat berbeda dengan penawaran resmi dari lembaga pembiayaan.
            </div>
          </section>

          {/* 3. Result Card */}
          <ResultCard result={result} config={config} method={method} onToggleMethod={toggleMethod} price={price} downPaymentPercent={effectiveDP} interestRate={interestRate} tenorMonths={tenorMonths} adminFee={adminFee} insuranceFee={insuranceFee} />
        </div>

        {/* 4. Financial Health Education Section */}
        <div className="mt-7">
          <FinancialHealth minIncome={result.minIncome} monthlyPayment={primaryMonthly} />
        </div>

      </main>
    </div>
  );
}

export default App;
