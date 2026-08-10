import { useMemo, useState } from "react";
import { ArrowLeftRight, BadgePercent, ChevronDown, Info, Percent, Sparkles } from "lucide-react";
import Field from "@/components/Field";
import ResultCard from "@/components/ResultCard";
import TabBar from "@/components/TabBar";
import { calculateLoan } from "@/lib/calc";
import { formatRupiahInput, parseRupiahInput } from "@/lib/format";
import { TAB_CONFIGS, type CreditType } from "@/lib/tabs";

const getConfig = (id: CreditType) => TAB_CONFIGS.find((tab) => tab.id === id) ?? TAB_CONFIGS[0];

function App() {
  const [activeType, setActiveType] = useState<CreditType>("mobil");
  const config = getConfig(activeType);
  const ConfigIcon = config.icon;
  const [price, setPrice] = useState(config.defaultPrice);
  const [downPayment, setDownPayment] = useState(config.defaultDP);
  const [interestRate, setInterestRate] = useState(config.defaultRate);
  const [tenorMonths, setTenorMonths] = useState(config.defaultTenorMonths);
  const [method, setMethod] = useState<"flat" | "anuitas">("anuitas");

  const result = useMemo(
    () => calculateLoan({ price, downPaymentPercent: downPayment, interestRate, tenorMonths }),
    [price, downPayment, interestRate, tenorMonths],
  );

  const switchType = (type: CreditType) => {
    const next = getConfig(type);
    setActiveType(type);
    setPrice(next.defaultPrice);
    setDownPayment(next.defaultDP);
    setInterestRate(next.defaultRate);
    setTenorMonths(next.defaultTenorMonths);
  };

  const toggleMethod = () => setMethod((prev) => (prev === "flat" ? "anuitas" : "flat"));

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
              <p className="hidden text-[11px] font-medium tracking-wide text-slate-400 sm:block">Rencanakan hari esok dengan lebih pasti</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Simulasi mudah & transparan
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-5 pb-14 pt-9 sm:px-8 sm:pt-14">
        <div className="mb-8 max-w-2xl sm:mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Simulasi kredit online</p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">Wujudkan impianmu,<br className="hidden sm:block" /> mulai dari sini.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Hitung estimasi cicilan yang sesuai dengan kemampuanmu. Cepat, mudah, dan tanpa biaya.</p>
        </div>

        <TabBar active={activeType} onChange={switchType} />

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)] lg:gap-7">
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Uang muka / DP" hint="Min. 10%" suffix="%">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={downPayment}
                      onChange={(event) => setDownPayment(Math.min(100, Math.max(0, Number(event.target.value))))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    />
                    <Percent className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  <div className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${config.accentText}`}>
                    <BadgePercent className="h-3.5 w-3.5" />
                    {formatRupiahInput(result.downPaymentAmount) || "0"} Rupiah
                  </div>
                </Field>

                <Field label="Suku bunga per tahun" hint="Estimasi" suffix="% / thn">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={interestRate}
                    onChange={(event) => setInterestRate(Math.min(100, Math.max(0, Number(event.target.value))))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-20 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </Field>
              </div>

              <Field label="Tenor / durasi pinjaman" hint="Pilih durasi">
                <div className="relative">
                  <select
                    value={tenorMonths}
                    onChange={(event) => setTenorMonths(Number(event.target.value))}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  >
                    {config.tenorOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>
            </div>

            <div className="mt-7 flex gap-2.5 rounded-2xl bg-slate-50 px-4 py-3.5 text-xs leading-5 text-slate-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              Hasil simulasi merupakan estimasi dan dapat berbeda dengan penawaran resmi dari lembaga pembiayaan.
            </div>
          </section>

          <ResultCard result={result} config={config} method={method} onToggleMethod={toggleMethod} />
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">* Suku bunga, biaya administrasi, dan ketentuan dapat berubah sesuai kebijakan lembaga pembiayaan.</p>
      </main>
    </div>
  );
}

export default App;
