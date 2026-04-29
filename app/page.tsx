"use client";

import { useMemo } from "react";
import { useExpenses } from "@/hooks/use-expenses";
import { DashboardHeader } from "@/components/dashboard/header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ExpenseForm } from "@/components/dashboard/expense-form";
import { ExpenseList } from "@/components/dashboard/expense-list";
import { IncomeList } from "@/components/dashboard/income-list";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { ExpensePieChart } from "@/components/dashboard/expense-pie-chart";
import { InvestmentCalculator } from "@/components/dashboard/investment-calculator";
import { NationalIndicators } from "@/components/dashboard/national-indicators";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardPage() {
  const {
    expenses,
    incomes,
    isLoading,
    addExpense,
    removeExpense,
    updateExpense,
    addIncome,
    removeIncome,
    updateIncome,
    getExpensesForMonth,
    getIncomesForMonth,
    getMonthlySummary,
    exportData,
    clearAll,
  } = useExpenses();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentMonthExpenses = useMemo(
    () => getExpensesForMonth(currentMonth, currentYear),
    [getExpensesForMonth, currentMonth, currentYear]
  );

  const previousMonthExpenses = useMemo(() => {
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    return getExpensesForMonth(prevMonth, prevYear);
  }, [getExpensesForMonth, currentMonth, currentYear]);

  const monthlySummary = useMemo(
    () => getMonthlySummary(currentYear),
    [getMonthlySummary, currentYear]
  );

  const currentMonthTotal = useMemo(
    () => currentMonthExpenses.reduce((sum, e) => sum + e.value, 0),
    [currentMonthExpenses]
  );

  const previousMonthTotal = useMemo(
    () => previousMonthExpenses.reduce((sum, e) => sum + e.value, 0),
    [previousMonthExpenses]
  );

  const currentMonthIncomes = useMemo(
    () => getIncomesForMonth(currentMonth, currentYear),
    [getIncomesForMonth, currentMonth, currentYear]
  );

  const currentMonthIncome = useMemo(
    () => currentMonthIncomes.reduce((sum, i) => sum + i.value, 0),
    [currentMonthIncomes]
  );

  const yearTotal = useMemo(
    () => monthlySummary.reduce((sum, m) => sum + m.total, 0),
    [monthlySummary]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onExport={exportData} onClearAll={clearAll} onAddIncome={addIncome} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <ExpenseForm onSubmit={addExpense} />
        </div>

        <SummaryCards
          currentMonthTotal={currentMonthTotal}
          previousMonthTotal={previousMonthTotal}
          yearTotal={yearTotal}
          expenseCount={expenses.length}
          currentMonthIncome={currentMonthIncome}
        />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="investment">Investimentos</TabsTrigger>
            <TabsTrigger value="national">Nacional</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <MonthlyChart data={monthlySummary} currentMonth={currentMonth} onAddExpense={addExpense} />
              <ExpensePieChart
                expenses={currentMonthExpenses}
                month={currentMonth}
                year={currentYear}
              />
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <IncomeList
                  incomes={currentMonthIncomes}
                  onRemove={removeIncome}
                  onUpdate={updateIncome}
                  title="Entradas do Mês Atual"
                />
                {incomes.length > currentMonthIncomes.length && (
                  <IncomeList
                    incomes={incomes.filter(
                      (i) => !currentMonthIncomes.find((ci) => ci.id === i.id)
                    )}
                    onRemove={removeIncome}
                    onUpdate={updateIncome}
                    title="Outras Entradas"
                  />
                )}
              </div>
              <div className="space-y-4">
                <ExpenseList
                  expenses={currentMonthExpenses}
                  onRemove={removeExpense}
                  onUpdate={updateExpense}
                  title="Despesas do Mês Atual"
                />
                {expenses.length > currentMonthExpenses.length && (
                  <ExpenseList
                    expenses={expenses.filter(
                      (e) => !currentMonthExpenses.find((ce) => ce.id === e.id)
                    )}
                    onRemove={removeExpense}
                    onUpdate={updateExpense}
                    title="Outras Despesas"
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="investment" className="space-y-4">
            <InvestmentCalculator />
          </TabsContent>

          <TabsContent value="national" className="space-y-4">
            <NationalIndicators />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
