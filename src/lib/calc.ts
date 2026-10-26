export interface LoanInput {
  price: number;
  downPaymentPercent: number;
  interestRate: number;
  tenorMonths: number;
  adminFee: number;
  insuranceFee: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
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
}

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

  // Anuitas: M = P * r / (1 - (1+r)^-n)
  let monthlyAnnuity: number;
  if (monthlyRate === 0) {
    monthlyAnnuity = principal / tenorMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenorMonths);
    monthlyAnnuity = (principal * monthlyRate * factor) / (factor - 1);
  }
  const totalPaymentAnnuity = monthlyAnnuity * tenorMonths;
  const totalInterestAnnuity = totalPaymentAnnuity - principal;

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

  // Amortization schedule - Annuity
  const scheduleAnnuity: AmortizationRow[] = [];
  let balanceAnnuity = principal;
  for (let m = 1; m <= tenorMonths; m++) {
    const interestPart = balanceAnnuity * monthlyRate;
    let principalPart = monthlyAnnuity - interestPart;
    balanceAnnuity -= principalPart;
    if (m === tenorMonths) {
      principalPart += balanceAnnuity;
      balanceAnnuity = 0;
    }
    scheduleAnnuity.push({
      month: m,
      payment: monthlyAnnuity,
      interest: interestPart,
      principal: principalPart,
      balance: Math.max(0, balanceAnnuity),
    });
  }

  // Financial health: cicilan <= 30% penghasilan bersih
  // penghasilan minimal = cicilan / 0.3 = cicilan * 3.333...
  const minIncome = monthlyAnnuity * (100 / 30);

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
  };
};
