export interface LoanInput {
  price: number;
  downPaymentPercent: number;
  interestRate: number;
  tenorMonths: number;
}

export interface LoanResult {
  downPaymentAmount: number;
  principal: number;
  monthlyFlat: number;
  monthlyAnnuity: number;
  totalInterestFlat: number;
  totalInterestAnnuity: number;
  totalPaymentFlat: number;
  totalPaymentAnnuity: number;
}

export const calculateLoan = (input: LoanInput): LoanResult => {
  const { price, downPaymentPercent, interestRate, tenorMonths } = input;

  const dpAmount = (price * downPaymentPercent) / 100;
  const principal = price - dpAmount;

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

  return {
    downPaymentAmount: dpAmount,
    principal,
    monthlyFlat,
    monthlyAnnuity,
    totalInterestFlat,
    totalInterestAnnuity,
    totalPaymentFlat,
    totalPaymentAnnuity,
  };
};
