export interface LoanInput {
  price: number;
  downPaymentPercent: number;
  interestRate: number;
  tenorMonths: number;
  adminFee: number;
  insuranceFee: number;
  /** Khusus KPR: lama masa bunga fixed (bulan). Setelah itu bunga floating berlaku. */
  fixedPeriodMonths?: number;
  /** Khusus KPR: bunga floating per tahun (%) setelah masa fixed berakhir. */
  floatingRate?: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface FloatingInfo {
  fixedMonths: number;
  floatingRate: number;
  monthlyAfterFixed: number;
  balanceAtSwitch: number;
}

export interface LoanResult {
  downPaymentAmount: number;
  totalDownPayment: number;
  principal: number;
  monthlyFlat: number;
  monthlyAnnuity: number;
  totalInterestFlat: number;
  totalInterestAnnuity: number;
  totalPaymentFlat: number;
  totalPaymentAnnuity: number;
  scheduleFlat: AmortizationRow[];
  scheduleAnnuity: AmortizationRow[];
  minIncome: number;
  floating: FloatingInfo | null;
}

// Anuitas: M = P * r / (1 - (1+r)^-n)
export const annuityPayment = (principal: number, monthlyRate: number, months: number): number => {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
};

export const calculateLoan = (input: LoanInput): LoanResult => {
  const { price, downPaymentPercent, interestRate, tenorMonths, adminFee, insuranceFee } = input;

  const dpAmount = (price * downPaymentPercent) / 100;
  const principal = price - dpAmount;
  const totalDownPayment = dpAmount + adminFee + insuranceFee;

  const monthlyRate = interestRate / 100 / 12;

  // Flat: total bunga = pokok * bunga/tahun * (tenor bulan / 12)
  const totalInterestFlat = principal * (interestRate / 100) * (tenorMonths / 12);
  const monthlyFlat = (principal + totalInterestFlat) / tenorMonths;
  const totalPaymentFlat = principal + totalInterestFlat;

  // Anuitas. Cicilan awal dihitung dari seluruh tenor dengan bunga fixed.
  const monthlyAnnuity = annuityPayment(principal, monthlyRate, tenorMonths);

  // KPR: setelah masa fixed, sisa pokok dihitung ulang dengan bunga floating
  const fixedMonths = input.fixedPeriodMonths ?? 0;
  const hasFloating =
    input.floatingRate !== undefined && fixedMonths > 0 && fixedMonths < tenorMonths;
  const floatingMonthlyRate = (input.floatingRate ?? 0) / 100 / 12;

  // Amortization schedule - Flat
  const scheduleFlat: AmortizationRow[] = [];
  const flatInterestPerMonth = totalInterestFlat / tenorMonths;
  const flatPrincipalPerMonth = principal / tenorMonths;
  let balanceFlat = principal;
  for (let m = 1; m <= tenorMonths; m++) {
    balanceFlat -= flatPrincipalPerMonth;
    scheduleFlat.push({
      month: m,
      payment: monthlyFlat,
      interest: flatInterestPerMonth,
      principal: flatPrincipalPerMonth,
      balance: Math.max(0, balanceFlat),
    });
  }

  // Amortization schedule - Annuity (dengan masa fixed dan floating bila ada)
  const scheduleAnnuity: AmortizationRow[] = [];
  let balanceAnnuity = principal;
  let currentPayment = monthlyAnnuity;
  let currentRate = monthlyRate;
  let monthlyAfterFixed = 0;
  let balanceAtSwitch = 0;
  for (let m = 1; m <= tenorMonths; m++) {
    if (hasFloating && m === fixedMonths + 1) {
      balanceAtSwitch = balanceAnnuity;
      currentRate = floatingMonthlyRate;
      currentPayment = annuityPayment(balanceAnnuity, currentRate, tenorMonths - fixedMonths);
      monthlyAfterFixed = currentPayment;
    }
    const interestPart = balanceAnnuity * currentRate;
    let principalPart = currentPayment - interestPart;
    balanceAnnuity -= principalPart;
    if (m === tenorMonths) {
      principalPart += balanceAnnuity;
      balanceAnnuity = 0;
    }
    scheduleAnnuity.push({
      month: m,
      payment: currentPayment,
      interest: interestPart,
      principal: principalPart,
      balance: Math.max(0, balanceAnnuity),
    });
  }

  const totalPaymentAnnuity = hasFloating
    ? monthlyAnnuity * fixedMonths + monthlyAfterFixed * (tenorMonths - fixedMonths)
    : monthlyAnnuity * tenorMonths;
  const totalInterestAnnuity = totalPaymentAnnuity - principal;

  // Financial health: cicilan <= 30% penghasilan bersih
  // penghasilan minimal = cicilan / 0.3. Untuk KPR dengan masa floating,
  // dipakai cicilan tertinggi agar perkiraan lebih aman.
  const highestMonthly = hasFloating ? Math.max(monthlyAnnuity, monthlyAfterFixed) : monthlyAnnuity;
  const minIncome = highestMonthly * (100 / 30);

  return {
    downPaymentAmount: dpAmount,
    totalDownPayment,
    principal,
    monthlyFlat,
    monthlyAnnuity,
    totalInterestFlat,
    totalInterestAnnuity,
    totalPaymentFlat,
    totalPaymentAnnuity,
    scheduleFlat,
    scheduleAnnuity,
    minIncome,
    floating: hasFloating
      ? {
          fixedMonths,
          floatingRate: input.floatingRate as number,
          monthlyAfterFixed,
          balanceAtSwitch,
        }
      : null,
  };
};
