import { Car, Wallet, Home, type LucideIcon } from "lucide-react";

export type CreditType = "kendaraan" | "multiguna" | "kpr";

export interface TabConfig {
  id: CreditType;
  label: string;
  shortLabel: string;
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
];
