import { Expense, ExpensePeriod, StorageData, MonthSummary, Income } from "./types";

const STORAGE_KEY = "expense-manager-data";
const CURRENT_VERSION = "1.0.0";

// Camada de abstração para persistência de dados
class StorageService {
  private getStorageData(): StorageData {
    if (typeof window === "undefined") {
      return { expenses: [], incomes: [], version: CURRENT_VERSION };
    }

    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { expenses: [], incomes: [], version: CURRENT_VERSION };
    }

    try {
      const parsed = JSON.parse(data) as StorageData;
      // Garante compatibilidade com versões antigas sem incomes
      if (!parsed.incomes) {
        parsed.incomes = [];
      }
      return parsed;
    } catch {
      return { expenses: [], incomes: [], version: CURRENT_VERSION };
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

  // Marcar/desmarcar despesa como paga em um mês específico
  setExpensePaidForMonth(id: string, year: number, month: number, paid: boolean): Expense | null {
    const data = this.getStorageData();
    const index = data.expenses.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const key = `${year}-${month}`;
    const paidMonths = { ...(data.expenses[index].paidMonths ?? {}), [key]: paid };
    data.expenses[index] = { ...data.expenses[index], paidMonths };
    this.saveStorageData(data);
    return data.expenses[index];
  }

  // ==================== INCOMES ====================

  // Obter todas as entradas
  getAllIncomes(): Income[] {
    return this.getStorageData().incomes;
  }

  // Adicionar nova entrada
  addIncome(income: Omit<Income, "id" | "createdAt">): Income {
    const data = this.getStorageData();
    const newIncome: Income = {
      ...income,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    data.incomes.push(newIncome);
    this.saveStorageData(data);
    return newIncome;
  }

  // Remover entrada
  removeIncome(id: string): void {
    const data = this.getStorageData();
    data.incomes = data.incomes.filter((i) => i.id !== id);
    this.saveStorageData(data);
  }

  // Atualizar entrada
  updateIncome(id: string, updates: Partial<Omit<Income, "id" | "createdAt">>): Income | null {
    const data = this.getStorageData();
    const index = data.incomes.findIndex((i) => i.id === id);
    if (index === -1) return null;
    data.incomes[index] = { ...data.incomes[index], ...updates };
    this.saveStorageData(data);
    return data.incomes[index];
  }

  // Obter entradas do mês (inclui entradas anuais vigentes)
  getIncomesForMonth(month: number, year: number): Income[] {
    const incomes = this.getAllIncomes();
    return incomes.filter((income) => {
      if (income.period === ExpensePeriod.MONTH) {
        return income.month === month && income.year === year;
      }
      if (income.period === ExpensePeriod.YEAR) {
        return income.year === year && month >= income.month && month <= 12;
      }
      return false;
    });
  }

  // Obter total de entradas do mês
  getMonthIncomeTotal(month: number, year: number): number {
    const incomes = this.getIncomesForMonth(month, year);
    return incomes.reduce((sum, i) => sum + i.value, 0);
  }

  // ==================== EXPENSES ====================

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

  // Importar dados de JSON (suporta formato antigo sem paidMonths)
  importFromJSON(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString) as Record<string, unknown>;

      if (!data.expenses || !Array.isArray(data.expenses)) {
        return { success: false, message: "Arquivo inválido: campo 'expenses' não encontrado." };
      }

      // Normaliza despesas — formato antigo tem `paid?: boolean`, novo tem `paidMonths`
      const expenses = (data.expenses as Record<string, unknown>[]).map((e) => {
        const expense = { ...e } as Record<string, unknown>;
        // Migra `paid` global para `paidMonths` se necessário
        if (typeof expense.paid === "boolean" && !expense.paidMonths) {
          if (expense.paid && typeof expense.month === "number" && typeof expense.year === "number") {
            expense.paidMonths = { [`${expense.year}-${expense.month}`]: true };
          }
          delete expense.paid;
        }
        // Se não tiver categoria, define como "OTHER"
        if (!expense.category) {
          expense.category = "OTHER";
        }
        return expense;
      });

      const incomes = Array.isArray(data.incomes)
        ? (data.incomes as Record<string, unknown>[]).map((i) => {
            const income = { ...i } as Record<string, unknown>;
            delete income.paid; // remove campo legado se existir
            return income;
          })
        : [];

      const normalized: StorageData = {
        expenses: expenses as unknown as Expense[],
        incomes: incomes as unknown as Income[],
        version: (data.version as string) ?? "1.0.0",
      };

      this.saveStorageData(normalized);
      return { success: true, message: `${expenses.length} despesa(s) e ${incomes.length} entrada(s) importadas.` };
    } catch {
      return { success: false, message: "Erro ao ler o arquivo. Verifique se é um JSON válido." };
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
