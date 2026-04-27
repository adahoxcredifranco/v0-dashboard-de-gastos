import { Expense, ExpensePeriod, StorageData, MonthSummary } from "./types";

const STORAGE_KEY = "expense-manager-data";
const CURRENT_VERSION = "1.0.0";

// Camada de abstração para persistência de dados
class StorageService {
  private getStorageData(): StorageData {
    if (typeof window === "undefined") {
      return { expenses: [], version: CURRENT_VERSION };
    }

    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { expenses: [], version: CURRENT_VERSION };
    }

    try {
      const parsed = JSON.parse(data) as StorageData;
      return parsed;
    } catch {
      return { expenses: [], version: CURRENT_VERSION };
    }
  }

  private saveStorageData(data: StorageData): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Gerar ID único
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Obter todas as despesas
  getAllExpenses(): Expense[] {
    return this.getStorageData().expenses;
  }

  // Adicionar nova despesa
  addExpense(expense: Omit<Expense, "id" | "createdAt">): Expense {
    const data = this.getStorageData();
    const newExpense: Expense = {
      ...expense,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    data.expenses.push(newExpense);
    this.saveStorageData(data);
    return newExpense;
  }

  // Remover despesa
  removeExpense(id: string): void {
    const data = this.getStorageData();
    data.expenses = data.expenses.filter((e) => e.id !== id);
    this.saveStorageData(data);
  }

  // Atualizar despesa
  updateExpense(id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>): Expense | null {
    const data = this.getStorageData();
    const index = data.expenses.findIndex((e) => e.id === id);
    if (index === -1) return null;

    data.expenses[index] = { ...data.expenses[index], ...updates };
    this.saveStorageData(data);
    return data.expenses[index];
  }

  // Obter despesas do mês atual (inclui gastos anuais vigentes)
  getExpensesForMonth(month: number, year: number): Expense[] {
    const expenses = this.getAllExpenses();
    return expenses.filter((expense) => {
      if (expense.period === ExpensePeriod.MONTH) {
        return expense.month === month && expense.year === year;
      }
      // Para gastos anuais, mostrar até dezembro do ano vigente
      if (expense.period === ExpensePeriod.YEAR) {
        return expense.year === year && month >= expense.month && month <= 12;
      }
      return false;
    });
  }

  // Obter resumo por mês
  getMonthlySummary(year: number): MonthSummary[] {
    const summaries: MonthSummary[] = [];
    
    for (let month = 1; month <= 12; month++) {
      const expenses = this.getExpensesForMonth(month, year);
      const total = expenses.reduce((sum, e) => sum + e.value, 0);
      summaries.push({
        month,
        year,
        total,
        expenses,
      });
    }

    return summaries;
  }

  // Obter total do mês
  getMonthTotal(month: number, year: number): number {
    const expenses = this.getExpensesForMonth(month, year);
    return expenses.reduce((sum, e) => sum + e.value, 0);
  }

  // Exportar dados para JSON
  exportToJSON(): string {
    const data = this.getStorageData();
    return JSON.stringify(data, null, 2);
  }

  // Importar dados de JSON
  importFromJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as StorageData;
      if (data.expenses && Array.isArray(data.expenses)) {
        this.saveStorageData(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Limpar todos os dados
  clearAll(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Exportar instância singleton
export const storageService = new StorageService();
