"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Calendar, PiggyBank, ArrowDownUp } from "lucide-react";
import { formatCurrency } from "@/lib/calculations";
import { MONTHS_PT } from "@/lib/types";

interface SummaryCardsProps {
  currentMonthTotal: number;
  previousMonthTotal: number;
  yearTotal: number;
  expenseCount: number;
  currentMonthIncome: number;
}

export function SummaryCards({
  currentMonthTotal,
  previousMonthTotal,
  yearTotal,
  expenseCount,
  currentMonthIncome,
}: SummaryCardsProps) {
  const now = new Date();
  const currentMonth = MONTHS_PT[now.getMonth()];
  
  const percentChange = previousMonthTotal > 0
    ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
    : 0;

  const isIncrease = percentChange > 0;

  // Saldo = Entradas - Despesas
  const balance = currentMonthIncome - currentMonthTotal;
  const isPositiveBalance = balance >= 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entradas em {currentMonth}</CardTitle>
          <PiggyBank className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{formatCurrency(currentMonthIncome)}</div>
          <p className="text-xs text-muted-foreground">
            Total de rendimentos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gastos em {currentMonth}</CardTitle>
          <Wallet className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(currentMonthTotal)}</div>
          <p className="text-xs text-muted-foreground">
            Somente despesas pagas
          </p>
        </CardContent>
      </Card>

      <Card className={isPositiveBalance ? "border-success/50" : "border-destructive/50"}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
          <ArrowDownUp className={`h-4 w-4 ${isPositiveBalance ? "text-success" : "text-destructive"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositiveBalance ? "text-success" : "text-destructive"}`}>
            {isPositiveBalance ? "+" : ""}{formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">
            {isPositiveBalance ? "Saldo positivo (despesas pagas)" : "Saldo negativo (despesas pagas)"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comparativo Mensal</CardTitle>
          {isIncrease ? (
            <TrendingUp className="h-4 w-4 text-destructive" />
          ) : (
            <TrendingDown className="h-4 w-4 text-success" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isIncrease ? "text-destructive" : "text-success"}`}>
            {isIncrease ? "+" : ""}{percentChange.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Em relação ao mês anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Anual</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(yearTotal)}</div>
          <p className="text-xs text-muted-foreground">
            Acumulado em {now.getFullYear()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{expenseCount}</div>
          <p className="text-xs text-muted-foreground">
            Despesas cadastradas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
