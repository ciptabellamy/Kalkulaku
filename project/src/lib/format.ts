export const formatRupiah = (value: number): string => {
  if (!isFinite(value) || isNaN(value)) return "Rp 0";
  const rounded = Math.round(value);
  return "Rp " + rounded.toLocaleString("id-ID");
};

export const parseRupiahInput = (text: string): number => {
  const digits = text.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
};

export const formatRupiahInput = (value: number): string => {
  if (!value) return "";
  return value.toLocaleString("id-ID");
};

export const formatNumber = (value: number, digits = 2): string => {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};
