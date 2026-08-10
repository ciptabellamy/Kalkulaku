import { Car, Bike, Home, type LucideIcon } from "lucide-react";

export type CreditType = "mobil" | "motor" | "kpr";

export interface TabConfig {
  id: CreditType;
  label: string;
  icon: LucideIcon;
  priceLabel: string;
  pricePlaceholder: string;
  defaultPrice: number;
  defaultDP: number;
  defaultRate: number;
  defaultTenorMonths: number;
  tenorOptions: { value: number; label: string }[];
  accentFrom: string;
  accentTo: string;
  accentRing: string;
  accentText: string;
  accentSoft: string;
  accentSoftText: string;
  accentBorder: string;
  whatsappMessage: string;
}

export const TAB_CONFIGS: TabConfig[] = [
  {
    id: "mobil",
    label: "Kredit Mobil",
    icon: Car,
    priceLabel: "Harga Mobil",
    pricePlaceholder: "Contoh: 200.000.000",
    defaultPrice: 200000000,
    defaultDP: 20,
    defaultRate: 5,
    defaultTenorMonths: 48,
    tenorOptions: [
      { value: 12, label: "1 Tahun (12 Bulan)" },
      { value: 24, label: "2 Tahun (24 Bulan)" },
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
    whatsappMessage:
      "Halo, saya tertarik dengan simulasi kredit mobil. Bisa dibantu untuk info lebih lanjut?",
  },
  {
    id: "motor",
    label: "Kredit Motor",
    icon: Bike,
    priceLabel: "Harga Motor",
    pricePlaceholder: "Contoh: 25.000.000",
    defaultPrice: 25000000,
    defaultDP: 25,
    defaultRate: 8,
    defaultTenorMonths: 24,
    tenorOptions: [
      { value: 12, label: "1 Tahun (12 Bulan)" },
      { value: 18, label: "1,5 Tahun (18 Bulan)" },
      { value: 24, label: "2 Tahun (24 Bulan)" },
      { value: 30, label: "2,5 Tahun (30 Bulan)" },
      { value: 36, label: "3 Tahun (36 Bulan)" },
    ],
    accentFrom: "from-emerald-500",
    accentTo: "to-teal-600",
    accentRing: "ring-emerald-500/30",
    accentText: "text-emerald-600",
    accentSoft: "bg-emerald-50",
    accentSoftText: "text-emerald-700",
    accentBorder: "border-emerald-200",
    whatsappMessage:
      "Halo, saya tertarik dengan simulasi kredit motor. Bisa dibantu untuk info lebih lanjut?",
  },
  {
    id: "kpr",
    label: "Kredit KPR",
    icon: Home,
    priceLabel: "Harga Properti",
    pricePlaceholder: "Contoh: 700.000.000",
    defaultPrice: 700000000,
    defaultDP: 20,
    defaultRate: 6,
    defaultTenorMonths: 120,
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
    whatsappMessage:
      "Halo, saya tertarik dengan simulasi KPR. Bisa dibantu untuk info lebih lanjut?",
  },
];
