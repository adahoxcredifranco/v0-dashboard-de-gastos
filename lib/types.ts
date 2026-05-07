// Enum para período do gasto
export enum ExpensePeriod {
  MONTH = "MONTH",
  YEAR = "YEAR",
}

// Categorias de despesa
export enum ExpenseCategory {
  HOUSING = "HOUSING",
  FOOD = "FOOD",
  TRANSPORT = "TRANSPORT",
  HEALTH = "HEALTH",
  EDUCATION = "EDUCATION",
  ENTERTAINMENT = "ENTERTAINMENT",
  CLOTHING = "CLOTHING",
  UTILITIES = "UTILITIES",
  DEBT = "DEBT",
  OTHER = "OTHER",
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.HOUSING]: "Moradia",
  [ExpenseCategory.FOOD]: "Alimentação",
  [ExpenseCategory.TRANSPORT]: "Transporte",
  [ExpenseCategory.HEALTH]: "Saúde",
  [ExpenseCategory.EDUCATION]: "Educação",
  [ExpenseCategory.ENTERTAINMENT]: "Lazer",
  [ExpenseCategory.CLOTHING]: "Vestuário",
  [ExpenseCategory.UTILITIES]: "Contas & Serviços",
  [ExpenseCategory.DEBT]: "Dívidas & Acordos",
  [ExpenseCategory.OTHER]: "Outros",
};

export const EXPENSE_CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.HOUSING]: "🏠",
  [ExpenseCategory.FOOD]: "🍽️",
  [ExpenseCategory.TRANSPORT]: "🚗",
  [ExpenseCategory.HEALTH]: "❤️",
  [ExpenseCategory.EDUCATION]: "📚",
  [ExpenseCategory.ENTERTAINMENT]: "🎬",
  [ExpenseCategory.CLOTHING]: "👕",
  [ExpenseCategory.UTILITIES]: "💡",
  [ExpenseCategory.DEBT]: "💳",
  [ExpenseCategory.OTHER]: "📦",
};

// Interface para uma despesa
export interface Expense {
  id: string;
  name: string;
  value: number;
  period: ExpensePeriod;
  category?: ExpenseCategory;
  createdAt: string; // ISO date string
  month: number; // 1-12
  year: number;
  /** Mapa de pagamento por mês: chave = "YYYY-M", valor = true se pago */
  paidMonths?: Record<string, boolean>;
}

/** Retorna a chave de pagamento para um mês/ano específico */
export function paidKey(year: number, month: number): string {
  return `${year}-${month}`;
}

/** Verifica se uma despesa está paga em um mês/ano específico */
export function isExpensePaid(expense: Expense, year: number, month: number): boolean {
  return expense.paidMonths?.[paidKey(year, month)] ?? false;
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
  paid?: boolean; // Se a entrada foi recebida
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
