"use client";

import { useState, useEffect, useCallback } from "react";
import { Expense, ExpensePeriod, MonthSummary, Income, IncomeType } from "@/lib/types";
import { storageService } from "@/lib/storage";
import { generateExportFilename } from "@/lib/calculations";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados ao montar
  useEffect(() => {
    const loadedExpenses = storageService.getAllExpenses();
    const loadedIncomes = storageService.getAllIncomes();
    setExpenses(loadedExpenses);
    setIncomes(loadedIncomes);
    setIsLoading(false);
  }, []);

  // Adicionar despesa
  const addExpense = useCallback(
    (expense: { name: string; value: number; period: ExpensePeriod; month: number; year: number }) => {
      const newExpense = storageService.addExpense(expense);
      setExpenses((prev) => [...prev, newExpense]);
      return newExpense;
    },
    []
  );

  // Remover despesa
  const removeExpense = useCallback((id: string) => {
    storageService.removeExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Atualizar despesa
  const updateExpense = useCallback(
    (id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>) => {
      const updated = storageService.updateExpense(id, updates);
      if (updated) {
        setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      }
      return updated;
    },
    []
  );

  // ==================== INCOMES ====================

  // Adicionar entrada
  const addIncome = useCallback(
    (income: { name: string; value: number; type: IncomeType; period: ExpensePeriod; month: number; year: number }) => {
      const newIncome = storageService.addIncome(income);
      setIncomes((prev) => [...prev, newIncome]);
      return newIncome;
    },
    []
  );

  // Remover entrada
  const removeIncome = useCallback((id: string) => {
    storageService.removeIncome(id);
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Obter entradas do mês
  const getIncomesForMonth = useCallback(
    (month: number, year: number): Income[] => {
      return incomes.filter((income) => {
        if (income.period === ExpensePeriod.MONTH) {
          return income.month === month && income.year === year;
        }
        if (income.period === ExpensePeriod.YEAR) {
          return income.year === year && month >= income.month && month <= 12;
        }
        return false;
      });
    },
    [incomes]
  );

  // Total de entradas do mês
  const getMonthIncomeTotal = useCallback(
    (month: number, year: number): number => {
      const monthIncomes = getIncomesForMonth(month, year);
      return monthIncomes.reduce((sum, i) => sum + i.value, 0);
    },
    [getIncomesForMonth]
  );

  // ==================== EXPENSES ====================

  // Obter despesas do mês
  const getExpensesForMonth = useCallback(
    (month: number, year: number): Expense[] => {
      return expenses.filter((expense) => {
        if (expense.period === ExpensePeriod.MONTH) {
          return expense.month === month && expense.year === year;
        }
        if (expense.period === ExpensePeriod.YEAR) {
          return expense.year === year && month >= expense.month && month <= 12;
        }
        return false;
      });
    },
    [expenses]
  );

  // Obter resumo mensal
  const getMonthlySummary = useCallback(
    (year: number): MonthSummary[] => {
      const summaries: MonthSummary[] = [];
      for (let month = 1; month <= 12; month++) {
        const monthExpenses = getExpensesForMonth(month, year);
        const total = monthExpenses.reduce((sum, e) => sum + e.value, 0);
        summaries.push({ month, year, total, expenses: monthExpenses });
      }
      return summaries;
    },
    [getExpensesForMonth]
  );

  // Total do mês atual
  const getCurrentMonthTotal = useCallback(() => {
    const now = new Date();
    const monthExpenses = getExpensesForMonth(now.getMonth() + 1, now.getFullYear());
    return monthExpenses.reduce((sum, e) => sum + e.value, 0);
  }, [getExpensesForMonth]);

  // Exportar dados
  const exportData = useCallback(() => {
    const jsonData = storageService.exportToJSON();
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = generateExportFilename();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Limpar tudo
  const clearAll = useCallback(() => {
    storageService.clearAll();
    setExpenses([]);
    setIncomes([]);
  }, []);

  return {
    expenses,
    incomes,
    isLoading,
    addExpense,
    removeExpense,
    updateExpense,
    addIncome,
    removeIncome,
    getExpensesForMonth,
    getIncomesForMonth,
    getMonthIncomeTotal,
    getMonthlySummary,
    getCurrentMonthTotal,
    exportData,
    clearAll,
  };
}
