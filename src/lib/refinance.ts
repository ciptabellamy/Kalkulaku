import { annuityPayment } from "@/lib/calc";
import { formatNumber, formatRupiah } from "@/lib/format";

export type InterestType = "flat" | "efektif";
export type RemainingMode = "paid" | "balance";

export interface RefinanceInput {
  // Pinjaman lama
  originalPrincipal: number;
  originalTenorMonths: number;
  oldRate: number; // % per tahun
  oldType: InterestType;
  penaltyPercent: number; // % dari sisa pokok
  remainingMode: RemainingMode;
  paidInstallments: number;
  currentBalance: number;
  differentialOverride: number | null; // Rp, bila lembaga menyebut nilainya
  // Pinjaman baru
  newRate: number; // % per tahun
  newType: InterestType;
  newTenorMonths: number | null; // null = sama dengan sisa tenor lama
  newAdminFee: number;
  financeCosts: boolean; // true: biaya ditambahkan ke pokok pinjaman baru
}

export interface RefinanceResult {
  valid: boolean;
  warnings: string[];

  // Pinjaman lama (bila dilanjutkan)
  paidInstallments: number;
  remainingMonths: number;
  oldMonthly: number;
  oldBalance: number;
  oldRateEquivalent: number; // % per tahun, setara efektif
  oldRemainingInterest: number;
  oldRemainingPayments: number;

  // Biaya pelunasan
  differential: number;
  differentialIsOverride: boolean;
  differentialAuto: number;
  penalty: number;
  payoffTotal: number;
  oneOffCosts: number; // selisih bunga + pinalti + admin baru
  upfrontCash: number; // bagian biaya yang dibayar tunai
  financedCosts: number; // bagian biaya yang masuk pokok baru

  // Pinjaman baru
  newPrincipal: number;
  newTenorMonths: number;
  newMonthly: number;
  newEffectiveMonthly: number; // angsuran + biaya tunai yang diratakan
  newRateEquivalent: number;
  newTotalInterest: number;
  newTotalPayments: number; // termasuk biaya tunai

  // Selisih (positif = hemat)
  monthlyDiff: number;
  monthlyDiffNet: number;
  interestDiff: number;
  totalSaving: number;
  breakEvenMonths: number | null;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Saldo anuitas setelah k kali bayar
const annuityBalance = (principal: number, monthlyRate: number, payment: number, k: number, n: number): number => {
  if (monthlyRate === 0) return Math.max(0, principal - (principal / n) * k);
  const f = Math.pow(1 + monthlyRate, k);
  return Math.max(0, principal * f - (payment * (f - 1)) / monthlyRate);
};

// Bunga bulanan setara efektif (IRR) dari pinjaman dengan cicilan tetap
const solveMonthlyRate = (principal: number, payment: number, months: number): number => {
  if (months <= 0 || principal <= 0 || payment * months <= principal) return 0;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const pv = (payment * (1 - Math.pow(1 + mid, -months))) / mid;
    if (pv > principal) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

// Nilai kini cicilan tetap yang tersisa
const presentValue = (payment: number, monthlyRate: number, months: number): number =>
  monthlyRate === 0 ? payment * months : (payment * (1 - Math.pow(1 + monthlyRate, -months))) / monthlyRate;

const invalidResult = (warnings: string[]): RefinanceResult => ({
  valid: false,
  warnings,
  paidInstallments: 0,
  remainingMonths: 0,
  oldMonthly: 0,
  oldBalance: 0,
  oldRateEquivalent: 0,
  oldRemainingInterest: 0,
  oldRemainingPayments: 0,
  differential: 0,
  differentialIsOverride: false,
  differentialAuto: 0,
  penalty: 0,
  payoffTotal: 0,
  oneOffCosts: 0,
  upfrontCash: 0,
  financedCosts: 0,
  newPrincipal: 0,
  newTenorMonths: 0,
  newMonthly: 0,
  newEffectiveMonthly: 0,
  newRateEquivalent: 0,
  newTotalInterest: 0,
  newTotalPayments: 0,
  monthlyDiff: 0,
  monthlyDiffNet: 0,
  interestDiff: 0,
  totalSaving: 0,
  breakEvenMonths: null,
});

export const calculateRefinance = (input: RefinanceInput): RefinanceResult => {
  const P = input.originalPrincipal;
  const n = Math.round(input.originalTenorMonths);

  if (!(P > 0) || !(n > 0)) {
    return invalidResult(["Isi pokok pinjaman awal dan tenor awal pinjaman lama."]);
  }
  if (input.remainingMode === "balance" && !(input.currentBalance > 0)) {
    return invalidResult(["Isi sisa pokok saat ini."]);
  }

  const warnings: string[] = [];
  const oldMonthlyRate = input.oldRate / 100 / 12;

  // Angsuran pinjaman lama
  const oldMonthly =
    input.oldType === "flat"
      ? (P + P * (input.oldRate / 100) * (n / 12)) / n
      : annuityPayment(P, oldMonthlyRate, n);

  // Posisi pinjaman saat ini (angsuran ke-k)
  let k: number;
  if (input.remainingMode === "paid") {
    k = clamp(Math.round(input.paidInstallments), 0, n);
  } else if (input.oldType === "flat") {
    k = clamp(Math.round(n * (1 - input.currentBalance / P)), 0, n);
  } else {
    let bestDiff = Infinity;
    k = 0;
    for (let j = 0; j <= n; j++) {
      const d = Math.abs(annuityBalance(P, oldMonthlyRate, oldMonthly, j, n) - input.currentBalance);
      if (d < bestDiff) {
        bestDiff = d;
        k = j;
      }
    }
  }
  const m = n - k;
  if (m <= 0) {
    return invalidResult(["Angsuran yang sudah dibayar sudah mencapai tenor awal, jadi pinjaman lama sudah lunas."]);
  }

  // Sisa pokok
  const nominalBalance = P - (P / n) * k; // lurus, dipakai pada bunga flat
  let oldBalance: number;
  if (input.remainingMode === "balance") {
    oldBalance = input.currentBalance;
    if (oldBalance > P) warnings.push("Sisa pokok lebih besar dari pokok pinjaman awal. Periksa kembali isian Anda.");
  } else {
    oldBalance = input.oldType === "flat" ? nominalBalance : annuityBalance(P, oldMonthlyRate, oldMonthly, k, n);
  }
  oldBalance = Math.max(0, oldBalance);

  // Bunga setara efektif pinjaman lama
  const oldIrr = input.oldType === "flat" ? solveMonthlyRate(P, oldMonthly, n) : oldMonthlyRate;
  const oldRateEquivalent = input.oldType === "flat" ? oldIrr * 12 * 100 : input.oldRate;

  // Selisih bunga flat vs efektif: saldo efektif sebenarnya dikurangi sisa pokok lurus
  let differentialAuto = 0;
  let differential = 0;
  let differentialIsOverride = false;
  if (input.oldType === "flat") {
    differentialAuto = Math.max(0, presentValue(oldMonthly, oldIrr, m) - nominalBalance);
    if (input.differentialOverride !== null && input.differentialOverride >= 0) {
      differential = input.differentialOverride;
      differentialIsOverride = true;
    } else {
      differential = differentialAuto;
    }
  }

  const penalty = (clamp(input.penaltyPercent, 0, 100) / 100) * oldBalance;
  const payoffTotal = oldBalance + differential + penalty;

  // Bila pinjaman lama dilanjutkan
  const oldRemainingPayments = oldMonthly * m;
  const oldRemainingInterest =
    input.oldType === "flat"
      ? m * ((P * input.oldRate) / 100 / 12)
      : Math.max(0, oldRemainingPayments - oldBalance);

  // Pinjaman baru
  const N = input.newTenorMonths && input.newTenorMonths > 0 ? Math.round(input.newTenorMonths) : m;
  const oneOffCosts = differential + penalty + input.newAdminFee;
  const newPrincipal = input.financeCosts ? oldBalance + oneOffCosts : oldBalance;
  const upfrontCash = input.financeCosts ? 0 : oneOffCosts;
  const financedCosts = input.financeCosts ? oneOffCosts : 0;

  const newMonthlyRate = input.newRate / 100 / 12;
  let newMonthly: number;
  let newTotalInterest: number;
  if (input.newType === "flat") {
    newTotalInterest = newPrincipal * (input.newRate / 100) * (N / 12);
    newMonthly = (newPrincipal + newTotalInterest) / N;
  } else {
    newMonthly = annuityPayment(newPrincipal, newMonthlyRate, N);
    newTotalInterest = newMonthly * N - newPrincipal;
  }
  const newRateEquivalent =
    input.newType === "flat" ? solveMonthlyRate(newPrincipal, newMonthly, N) * 12 * 100 : input.newRate;
  const newTotalPayments = newMonthly * N + upfrontCash;
  const newEffectiveMonthly = newMonthly + upfrontCash / N;

  // Selisih
  const monthlyDiff = oldMonthly - newMonthly;
  const monthlyDiffNet = oldMonthly - newEffectiveMonthly;
  const interestDiff = oldRemainingInterest - newTotalInterest;
  const totalSaving = oldRemainingPayments - newTotalPayments;
  const breakEvenMonths = upfrontCash > 0 && monthlyDiff > 0 ? upfrontCash / monthlyDiff : null;

  if (N > m) {
    warnings.push("Tenor baru lebih panjang dari sisa tenor lama. Angsuran bisa turun, tetapi total bunga cenderung naik.");
  }
  if (newRateEquivalent >= oldRateEquivalent) {
    warnings.push("Bunga baru (setara efektif) tidak lebih rendah dari bunga lama, sehingga refinancing kecil kemungkinan menghemat.");
  }

  return {
    valid: true,
    warnings,
    paidInstallments: k,
    remainingMonths: m,
    oldMonthly,
    oldBalance,
    oldRateEquivalent,
    oldRemainingInterest,
    oldRemainingPayments,
    differential,
    differentialIsOverride,
    differentialAuto,
    penalty,
    payoffTotal,
    oneOffCosts,
    upfrontCash,
    financedCosts,
    newPrincipal,
    newTenorMonths: N,
    newMonthly,
    newEffectiveMonthly,
    newRateEquivalent,
    newTotalInterest,
    newTotalPayments,
    monthlyDiff,
    monthlyDiffNet,
    interestDiff,
    totalSaving,
    breakEvenMonths,
  };
};

const typeLabel = (t: InterestType) => (t === "flat" ? "Flat" : "Efektif (anuitas)");

export const buildRefinanceCopyText = (
  input: RefinanceInput,
  result: RefinanceResult,
  kindLabel: string,
  siteName: string,
  siteUrl: string,
): string => {
  const signed = (v: number) => (v >= 0 ? `Hemat ${formatRupiah(v)}` : `Naik ${formatRupiah(-v)}`);
  const lines = [
    `=== Simulasi Refinancing ${kindLabel} ===`,
    "-- Pinjaman lama --",
    `Bunga: ${typeLabel(input.oldType)} ${formatNumber(input.oldRate)}% / thn (setara efektif ${formatNumber(result.oldRateEquivalent)}%)`,
    `Sudah dibayar: ${result.paidInstallments} angsuran, sisa ${result.remainingMonths} bulan`,
    `Sisa pokok: ${formatRupiah(result.oldBalance)}`,
    ...(input.oldType === "flat"
      ? [`Selisih bunga flat vs efektif${result.differentialIsOverride ? "" : " (estimasi)"}: ${formatRupiah(result.differential)}`]
      : []),
    `Pinalti (${formatNumber(input.penaltyPercent)}% dari sisa pokok): ${formatRupiah(result.penalty)}`,
    `Total pelunasan: ${formatRupiah(result.payoffTotal)}`,
    `Angsuran / bulan: ${formatRupiah(result.oldMonthly)}`,
    "-- Pinjaman baru --",
    `Bunga: ${typeLabel(input.newType)} ${formatNumber(input.newRate)}% / thn (setara efektif ${formatNumber(result.newRateEquivalent)}%)`,
    `Pokok pinjaman: ${formatRupiah(result.newPrincipal)}`,
    `Tenor: ${result.newTenorMonths} bulan`,
    `Biaya admin: ${formatRupiah(input.newAdminFee)} (${input.financeCosts ? "ditambah ke pinjaman baru" : "dibayar tunai"})`,
    `Angsuran / bulan: ${formatRupiah(result.newMonthly)}`,
    `Angsuran efektif / bulan (setelah netting biaya): ${formatRupiah(result.newEffectiveMonthly)}`,
    "-- Selisih --",
    `Angsuran / bulan: ${signed(result.monthlyDiff)}`,
    `Angsuran efektif / bulan: ${signed(result.monthlyDiffNet)}`,
    `Total bunga: ${signed(result.interestDiff)}`,
    `Total pembayaran (setelah semua biaya): ${signed(result.totalSaving)}`,
    "Catatan: estimasi. Pinalti dihitung dari sisa pokok dan selisih bunga flat vs efektif diperkirakan; minta rincian pelunasan resmi dari lembaga pembiayaan.",
    "================================",
    siteName,
    siteUrl,
  ];
  return lines.join("\n");
};
