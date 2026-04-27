"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthSummary, MONTHS_PT, Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { MonthDetailModal } from "./month-detail-modal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Paleta de cores distintas para cada despesa
const EXPENSE_COLORS = [
  "oklch(0.55 0.2 250)",   // Azul primário
  "oklch(0.65 0.18 220)",  // Azul claro
  "oklch(0.45 0.2 260)",   // Azul escuro
  "oklch(0.6 0.15 200)",   // Ciano
  "oklch(0.55 0.18 280)",  // Roxo azulado
  "oklch(0.7 0.12 230)",   // Azul pastel
  "oklch(0.5 0.2 240)",    // Azul médio
  "oklch(0.6 0.16 190)",   // Turquesa
  "oklch(0.55 0.14 270)",  // Lavanda
  "oklch(0.65 0.2 210)",   // Azul céu
  "oklch(0.5 0.18 300)",   // Violeta
  "oklch(0.6 0.12 180)",   // Verde azulado
];

interface MonthlyChartProps {
  data: MonthSummary[];
  currentMonth: number;
}

export function MonthlyChart({ data, currentMonth }: MonthlyChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<{
    month: number;
    year: number;
    expenses: Expense[];
  } | null>(null);

  // Pega todas as despesas únicas de todos os meses
  const allExpenseNames = useMemo(() => {
    const names = new Set<string>();
    data.forEach((month) => {
      month.expenses.forEach((expense) => {
        names.add(expense.name);
      });
    });
    return Array.from(names);
  }, [data]);

  // Mapeia cores para cada despesa
  const expenseColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    allExpenseNames.forEach((name, index) => {
      map[name] = EXPENSE_COLORS[index % EXPENSE_COLORS.length];
    });
    return map;
  }, [allExpenseNames]);

  // Transforma os dados para o gráfico empilhado
  const chartData = useMemo(() => {
    return data.map((item) => {
      const monthData: Record<string, number | string> = {
        name: MONTHS_PT[item.month - 1].substring(0, 3),
        month: item.month,
      };
      
      // Agrupa despesas por nome e soma valores
      item.expenses.forEach((expense) => {
        const currentValue = (monthData[expense.name] as number) || 0;
        monthData[expense.name] = currentValue + expense.value;
      });
      
      return monthData;
    });
  }, [data]);

  // Handler para clique no gráfico
  const handleBarClick = (chartData: Record<string, unknown>) => {
    const monthNumber = chartData.month as number;
    const monthData = data.find((d) => d.month === monthNumber);
    if (monthData) {
      setSelectedMonth({
        month: monthData.month,
        year: monthData.year,
        expenses: monthData.expenses,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Mês</CardTitle>
        <CardDescription>Clique em uma barra para ver detalhes - {data[0]?.year}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                onClick={(e) => e?.activePayload?.[0]?.payload && handleBarClick(e.activePayload[0].payload)}
                style={{ cursor: "pointer" }}
              >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value}`}
                className="fill-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const total = payload.reduce((sum, entry) => sum + (entry.value as number || 0), 0);
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <p className="font-medium mb-2">{label}</p>
                        <div className="space-y-1">
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="flex-1">{entry.name}:</span>
                              <span className="font-medium">{formatCurrency(entry.value as number)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-1 mt-2 flex justify-between text-sm font-bold">
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconType="circle"
                iconSize={10}
              />
              {allExpenseNames.map((expenseName) => (
                <Bar
                  key={expenseName}
                  dataKey={expenseName}
                  stackId="expenses"
                  fill={expenseColorMap[expenseName]}
                  radius={allExpenseNames.indexOf(expenseName) === allExpenseNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
