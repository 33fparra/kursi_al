// ─── Mortgage / Loan Amortization ───────────────────────────────────────────

export interface MortgageResult {
  monthly: number;
  totalPaid: number;
  totalInterest: number;
}

export function calcMortgage(
  amount: number,
  annualRatePct: number,
  years: number
): MortgageResult {
  if (amount <= 0 || years <= 0) return { monthly: 0, totalPaid: 0, totalInterest: 0 };
  if (annualRatePct === 0) {
    const monthly = amount / (years * 12);
    return { monthly, totalPaid: amount, totalInterest: 0 };
  }
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  const monthly = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPaid = monthly * n;
  return { monthly, totalPaid, totalInterest: totalPaid - amount };
}

export function calcLoan(
  amount: number,
  annualRatePct: number,
  months: number
): MortgageResult {
  return calcMortgage(amount, annualRatePct, months / 12);
}

// ─── Albania Salary (ALL) ────────────────────────────────────────────────────

export interface SalaryResult {
  gross: number;
  net: number;
  incomeTax: number;
  socialDeduction: number;
  healthDeduction: number;
  pensionDeduction: number;
  totalDeductions: number;
  currency: string;
}

export function calcNetSalaryAL(grossMonthly: number): SalaryResult {
  const gross = grossMonthly;
  const socialEmployee = 0.095;
  const healthEmployee = 0.017;

  // Monthly brackets (progressive)
  let incomeTax = 0;
  if (gross <= 30000) {
    incomeTax = 0;
  } else if (gross <= 150000) {
    incomeTax = (gross - 30000) * 0.13;
  } else {
    incomeTax = (150000 - 30000) * 0.13 + (gross - 150000) * 0.23;
  }

  const socialDeduction = gross * socialEmployee;
  const healthDeduction = gross * healthEmployee;
  const totalDeductions = incomeTax + socialDeduction + healthDeduction;
  const net = gross - totalDeductions;

  return {
    gross,
    net,
    incomeTax,
    socialDeduction,
    healthDeduction,
    pensionDeduction: 0,
    totalDeductions,
    currency: 'ALL',
  };
}

// ─── Kosovo Salary (EUR) ─────────────────────────────────────────────────────

export function calcNetSalaryXK(grossMonthly: number): SalaryResult {
  const gross = grossMonthly;
  const pensionEmployee = 0.05;

  // Monthly brackets
  let incomeTax = 0;
  if (gross <= 80) {
    incomeTax = 0;
  } else if (gross <= 250) {
    incomeTax = (gross - 80) * 0.04;
  } else if (gross <= 450) {
    incomeTax = (250 - 80) * 0.04 + (gross - 250) * 0.08;
  } else {
    incomeTax = (250 - 80) * 0.04 + (450 - 250) * 0.08 + (gross - 450) * 0.10;
  }

  const pensionDeduction = gross * pensionEmployee;
  const totalDeductions = incomeTax + pensionDeduction;
  const net = gross - totalDeductions;

  return {
    gross,
    net,
    incomeTax,
    socialDeduction: 0,
    healthDeduction: 0,
    pensionDeduction,
    totalDeductions,
    currency: 'EUR',
  };
}

// ─── Formatting ──────────────────────────────────────────────────────────────

export function fmtALL(value: number): string {
  return new Intl.NumberFormat('sq-AL', { maximumFractionDigits: 0 }).format(Math.round(value)) + ' L';
}

export function fmtEUR(value: number): string {
  return '€' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(value));
}

export function fmtCurrency(value: number, currency: 'ALL' | 'EUR'): string {
  return currency === 'ALL' ? fmtALL(value) : fmtEUR(value);
}

export function fmtPct(value: number): string {
  return value.toFixed(2) + '%';
}
