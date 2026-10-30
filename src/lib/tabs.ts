import { Car, Wallet, Home, RefreshCw, type LucideIcon } from "lucide-react";

export type CreditType = "kendaraan" | "multiguna" | "kpr" | "refinancing";

// Asumsi spread KPR floating di atas BI-Rate (dalam persen)
export const KPR_FLOATING_SPREAD = 6.25;

export interface TabConfig {
  id: CreditType;
  label: string;
  shortLabel: string;
  allowFlat: boolean;
  hasFloating: boolean;
  rateLabel: string;
  defaultFixedYears: number;
  icon: LucideIcon;
  hasDownPayment: boolean;
  priceLabel: string;
  pricePlaceholder: string;
  adminFeeLabel: string;
  upfrontLabel: string;
  defaultPrice: number;
  defaultDP: number;
  defaultRate: number;
  defaultTenorMonths: number;
  defaultAdminFee: number;
  defaultInsuranceFee: number;
  tenorOptions: { value: number; label: string }[];
  accentFrom: string;
  accentTo: string;
  accentRing: string;
  accentText: string;
  accentSoft: string;
  accentSoftText: string;
  accentBorder: string;
}

export const TAB_CONFIGS: TabConfig[] = [
  {
    id: "kendaraan",
    label: "Kendaraan Bermotor",
    shortLabel: "Kendaraan",
    allowFlat: true,
    hasFloating: false,
    rateLabel: "Suku bunga per tahun",
    defaultFixedYears: 0,
    icon: Car,
    hasDownPayment: true,
    priceLabel: "Harga Kendaraan",
    pricePlaceholder: "Contoh: 150.000.000",
    adminFeeLabel: "Biaya Admin",
    upfrontLabel: "Total DP + Biaya",
    defaultPrice: 150000000,
    defaultDP: 20,
    defaultRate: 6,
    defaultTenorMonths: 36,
    defaultAdminFee: 500000,
    defaultInsuranceFee: 0,
    tenorOptions: [
      { value: 12, label: "1 Tahun (12 Bulan)" },
      { value: 18, label: "1,5 Tahun (18 Bulan)" },
      { value: 24, label: "2 Tahun (24 Bulan)" },
      { value: 30, label: "2,5 Tahun (30 Bulan)" },
      { value: 36, label: "3 Tahun (36 Bulan)" },
      { value: 48, label: "4 Tahun (48 Bulan)" },
      { value: 60, label: "5 Tahun (60 Bulan)" },
    ],
    accentFrom: "from-sky-500",
    accentTo: "to-blue-600",
    accentRing: "ring-sky-500/30",
    accentText: "text-sky-600",
    accentSoft: "bg-sky-50",
    accentSoftText: "text-sky-700",
    accentBorder: "border-sky-200",
  },
  {
    id: "multiguna",
    label: "Kredit Multiguna",
    shortLabel: "Multiguna",
    allowFlat: true,
    hasFloating: false,
    rateLabel: "Suku bunga per tahun",
    defaultFixedYears: 0,
    icon: Wallet,
    hasDownPayment: false,
    priceLabel: "Jumlah Pinjaman",
    pricePlaceholder: "Contoh: 50.000.000",
    adminFeeLabel: "Biaya Admin / Provisi",
    upfrontLabel: "Total Biaya di Muka",
    defaultPrice: 50000000,
    defaultDP: 0,
    defaultRate: 12,
    defaultTenorMonths: 36,
    defaultAdminFee: 1000000,
    defaultInsuranceFee: 0,
    tenorOptions: [
      { value: 12, label: "1 Tahun (12 Bulan)" },
      { value: 24, label: "2 Tahun (24 Bulan)" },
      { value: 36, label: "3 Tahun (36 Bulan)" },
      { value: 48, label: "4 Tahun (48 Bulan)" },
      { value: 60, label: "5 Tahun (60 Bulan)" },
    ],
    accentFrom: "from-violet-500",
    accentTo: "to-purple-600",
    accentRing: "ring-violet-500/30",
    accentText: "text-violet-600",
    accentSoft: "bg-violet-50",
    accentSoftText: "text-violet-700",
    accentBorder: "border-violet-200",
  },
  {
    id: "kpr",
    label: "Kredit KPR",
    shortLabel: "KPR",
    allowFlat: false,
    hasFloating: true,
    rateLabel: "Bunga fixed per tahun",
    defaultFixedYears: 3,
    icon: Home,
    hasDownPayment: true,
    priceLabel: "Harga Properti",
    pricePlaceholder: "Contoh: 700.000.000",
    adminFeeLabel: "Biaya Admin",
    upfrontLabel: "Total DP + Biaya",
    defaultPrice: 700000000,
    defaultDP: 20,
    defaultRate: 6,
    defaultTenorMonths: 120,
    defaultAdminFee: 1000000,
    defaultInsuranceFee: 0,
    tenorOptions: [
      { value: 60, label: "5 Tahun (60 Bulan)" },
      { value: 120, label: "10 Tahun (120 Bulan)" },
      { value: 180, label: "15 Tahun (180 Bulan)" },
      { value: 240, label: "20 Tahun (240 Bulan)" },
      { value: 300, label: "25 Tahun (300 Bulan)" },
    ],
    accentFrom: "from-amber-500",
    accentTo: "to-orange-600",
    accentRing: "ring-amber-500/30",
    accentText: "text-amber-600",
    accentSoft: "bg-amber-50",
    accentSoftText: "text-amber-700",
    accentBorder: "border-amber-200",
  },
  {
    id: "refinancing",
    label: "Refinancing",
    shortLabel: "Refinancing",
    allowFlat: true,
    hasFloating: false,
    rateLabel: "Suku bunga per tahun",
    defaultFixedYears: 0,
    icon: RefreshCw,
    hasDownPayment: false,
    priceLabel: "Sisa Pokok",
    pricePlaceholder: "Contoh: 75.000.000",
    adminFeeLabel: "Biaya Admin",
    upfrontLabel: "Total Biaya",
    defaultPrice: 0,
    defaultDP: 0,
    defaultRate: 0,
    defaultTenorMonths: 12,
    defaultAdminFee: 0,
    defaultInsuranceFee: 0,
    tenorOptions: [{ value: 12, label: "12 Bulan" }],
    accentFrom: "from-emerald-500",
    accentTo: "to-teal-600",
    accentRing: "ring-emerald-500/30",
    accentText: "text-emerald-600",
    accentSoft: "bg-emerald-50",
    accentSoftText: "text-emerald-700",
    accentBorder: "border-emerald-200",
  },
];
