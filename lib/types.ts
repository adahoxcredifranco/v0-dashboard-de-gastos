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

// Enum para tipo de entrada
export enum IncomeType {
  SALARY = "SALARY",
  INVESTMENT = "INVESTMENT",
  OTHER = "OTHER",
}

// Interface para uma entrada (salário, investimento, etc.)
export interface Income {
  id: string;
  name: string;
  value: number;
  type: IncomeType;
  period: ExpensePeriod;
  createdAt: string;
  month: number;
  year: number;
}

// Interface para os dados armazenados
export interface StorageData {
  expenses: Expense[];
  incomes: Income[];
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
  monthlyContribution?: number; // aporte mensal recorrente
}

export interface InvestmentResult {
  month: number;
  value: number;
  earnings: number;
}

// Labels para tipos de entrada
export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  [IncomeType.SALARY]: "Salário",
  [IncomeType.INVESTMENT]: "Investimento",
  [IncomeType.OTHER]: "Outros",
};

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
