import { formatRupiah } from "@/lib/format";
import type { LoanResult, AmortizationRow } from "@/lib/calc";
import type { TabConfig } from "@/lib/tabs";

export interface SummaryData {
  config: TabConfig;
  result: LoanResult;
  method: "flat" | "anuitas";
  price: number;
  downPaymentPercent: number;
  interestRate: number;
  tenorMonths: number;
  adminFee: number;
  insuranceFee: number;
}

export const SITE_NAME = "Kalkulaku";
export const SITE_TAGLINE = "Kalkulator Simulasi Kredit Kendaraan, Multiguna & KPR Terpercaya";
export const SITE_URL = "kalkulaku.id";

export const getPrimaryMonthly = (result: LoanResult, method: "flat" | "anuitas") =>
  method === "anuitas" ? result.monthlyAnnuity : result.monthlyFlat;

export const getPrimaryInterest = (result: LoanResult, method: "flat" | "anuitas") =>
  method === "anuitas" ? result.totalInterestAnnuity : result.totalInterestFlat;

export const getPrimaryTotal = (result: LoanResult, method: "flat" | "anuitas") =>
  method === "anuitas" ? result.totalPaymentAnnuity : result.totalPaymentFlat;

export const getSchedule = (result: LoanResult, method: "flat" | "anuitas"): AmortizationRow[] =>
  method === "anuitas" ? result.scheduleAnnuity : result.scheduleFlat;

export interface SummaryLine {
  label: string;
  value: string;
}

export const buildSummaryLines = (data: SummaryData): SummaryLine[] => {
  const { config, result, method, price, downPaymentPercent, interestRate, tenorMonths, adminFee, insuranceFee } = data;
  const primaryMonthly = getPrimaryMonthly(result, method);
  const primaryInterest = getPrimaryInterest(result, method);
  const primaryTotal = getPrimaryTotal(result, method);
  const totalPaymentPlusDP = primaryTotal + result.totalDownPayment;
  const totalFeesAndInsurance = adminFee + insuranceFee;
  const hasDP = config.hasDownPayment;

  return [
    { label: "Jenis Kredit", value: config.label },
    { label: hasDP ? "Harga" : "Jumlah Pinjaman", value: formatRupiah(price) },
    ...(hasDP
      ? [{ label: `Uang Muka / DP (${downPaymentPercent}%)`, value: formatRupiah(result.downPaymentAmount) }]
      : []),
    { label: config.adminFeeLabel, value: formatRupiah(adminFee) },
    { label: "Biaya Asuransi", value: formatRupiah(insuranceFee) },
    { label: "Total Biaya & Asuransi", value: formatRupiah(totalFeesAndInsurance) },
    { label: config.upfrontLabel, value: formatRupiah(result.totalDownPayment) },
    { label: "Pokok Pinjaman", value: formatRupiah(result.principal) },
    { label: "Suku Bunga", value: `${interestRate}% / thn` },
    { label: "Tenor", value: `${tenorMonths} bulan (${Math.floor(tenorMonths / 12)} tahun${tenorMonths % 12 ? " " + (tenorMonths % 12) + " bulan" : ""})` },
    { label: "Metode Bunga", value: method === "anuitas" ? "Anuitas" : "Flat" },
    { label: "Cicilan / Bulan", value: formatRupiah(primaryMonthly) },
    { label: "Total Bunga", value: formatRupiah(primaryInterest) },
    { label: "Total Pembayaran", value: formatRupiah(primaryTotal) },
    { label: hasDP ? "Total Pembayaran + DP" : "Total Pembayaran + Biaya di Muka", value: formatRupiah(totalPaymentPlusDP) },
    { label: "Min. Penghasilan Bersih", value: formatRupiah(result.minIncome) },
  ];
};

export const buildCopyText = (data: SummaryData): string => {
  const lines = buildSummaryLines(data);
  const body = lines.map((l) => `${l.label}: ${l.value}`).join("\n");
  return (
    `=== Ringkasan Simulasi ${data.config.label} ===\n` +
    `${body}\n` +
    `================================\n` +
    `${SITE_NAME} — ${SITE_TAGLINE}\n` +
    `${SITE_URL}`
  );
};
