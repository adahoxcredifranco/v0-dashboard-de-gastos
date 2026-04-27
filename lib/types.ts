// Enum para período do gasto
export enum ExpensePeriod {
  MONTH = "MONTH",
  YEAR = "YEAR",
}

// Interface para uma despesa
export interface Expense {
  id: string;
  name: string;
  value: number;
  period: ExpensePeriod;
  createdAt: string; // ISO date string
  month: number; // 1-12
  year: number;
}

// Interface para os dados armazenados
export interface StorageData {
  expenses: Expense[];
  version: string;
}

// Interface para resumo mensal
export interface MonthSummary {
  month: number;
  year: number;
  total: number;
  expenses: Expense[];
}

// Interface para cálculo de investimento
export interface InvestmentCalculation {
  initialValue: number;
  months: number;
  interestRate: number; // porcentagem mensal
}

export interface InvestmentResult {
  month: number;
  value: number;
  earnings: number;
}

// Meses em português
export const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
