"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthSummary, MONTHS_PT, Expense, ExpensePeriod } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { MonthDetailModal } from "./month-detail-modal";
import { ChartContextMenu } from "./chart-context-menu";
import { ExpenseForm } from "./expense-form";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Paleta de cores distintas para cada despesa
const EXPENSE_COLORS = [
  "oklch(0.55 0.2 250)",
  "oklch(0.65 0.18 220)",
  "oklch(0.45 0.2 260)",
  "oklch(0.6 0.15 200)",
  "oklch(0.55 0.18 280)",
  "oklch(0.7 0.12 230)",
  "oklch(0.5 0.2 240)",
  "oklch(0.6 0.16 190)",
  "oklch(0.55 0.14 270)",
  "oklch(0.65 0.2 210)",
  "oklch(0.5 0.18 300)",
  "oklch(0.6 0.12 180)",
];

const AVG_LINE_COLOR = "oklch(0.75 0.18 45)";

interface MonthlyChartProps {
  data: MonthSummary[];
  currentMonth: number;
  onAddExpense: (expense: {
    name: string;
    value: number;
    period: ExpensePeriod;
    month: number;
    year: number;
  }) => void;
}

export function MonthlyChart({ data, currentMonth, onAddExpense }: MonthlyChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<{
    month: number;
    year: number;
    expenses: Expense[];
  } | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    month: number;
    year: number;
    expenses: Expense[];
  } | null>(null);

  const [addExpenseTarget, setAddExpenseTarget] = useState<{
    month: number;
    year: number;
  } | null>(null);

  // Nomes únicos de todas as despesas
  const allExpenseNames = useMemo(() => {
    const names = new Set<string>();
    data.forEach((m) => m.expenses.forEach((e) => names.add(e.name)));
    return Array.from(names);
  }, [data]);

  // Mapa de cores por despesa
  const expenseColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    allExpenseNames.forEach((name, i) => {
      map[name] = EXPENSE_COLORS[i % EXPENSE_COLORS.length];
    });
    return map;
  }, [allExpenseNames]);

  // Dados do gráfico com média acumulada
  const chartData = useMemo(() => {
    let runningSum = 0;
    let monthsWithData = 0;

    return data.map((item) => {
      const monthData: Record<string, number | string | null> = {
        name: MONTHS_PT[item.month - 1].substring(0, 3),
        month: item.month,
      };

      let monthTotal = 0;
      item.expenses.forEach((expense) => {
        const current = (monthData[expense.name] as number) || 0;
        monthData[expense.name] = current + expense.value;
        monthTotal += expense.value;
      });

      // Média acumulada só conta meses com gastos
      if (monthTotal > 0) {
        runningSum += monthTotal;
        monthsWithData += 1;
      }
      monthData["_avg"] = monthsWithData > 0 ? runningSum / monthsWithData : null;

      return monthData;
    });
  }, [data]);

  const handleBarClick = (
    payload: Record<string, unknown>,
    event?: React.MouseEvent
  ) => {
    const monthNumber = payload.month as number;
    const monthData = data.find((d) => d.month === monthNumber);
    if (monthData && event) {
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        month: monthData.month,
        year: monthData.year,
        expenses: monthData.expenses,
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Mês</CardTitle>
          <CardDescription>
            Clique em uma barra para ver detalhes — {data[0]?.year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                onClick={(e: { activePayload?: { payload: Record<string, unknown> }[] }, nativeEvent: React.MouseEvent) => {
                  if (e?.activePayload?.[0]?.payload) {
                    handleBarClick(e.activePayload[0].payload, nativeEvent);
                  }
                }}
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
                  tickFormatter={(v) => `R${v}`}
                  className="fill-muted-foreground"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const bars = payload.filter((p) => p.dataKey !== "_avg");
                    const avgEntry = payload.find((p) => p.dataKey === "_avg");
                    const total = bars.reduce(
                      (sum, e) => sum + (e.value as number || 0),
                      0
                    );
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm min-w-[180px]">
                        <p className="font-medium mb-2">{label}</p>
                        <div className="space-y-1">
                          {bars.map((entry, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span
                                className="h-3 w-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="flex-1 truncate">{entry.name}:</span>
                              <span className="font-medium">
                                {formatCurrency(entry.value as number)}
                              </span>
                            </div>
                          ))}
                          <div className="border-t pt-1 mt-1 flex justify-between text-sm font-bold">
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                          </div>
                          {avgEntry?.value != null && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-1 mt-1">
                              <span
                                className="h-0.5 w-4 inline-block rounded flex-shrink-0"
                                style={{ backgroundColor: AVG_LINE_COLOR }}
                              />
                              <span className="flex-1">Média acumulada:</span>
                              <span className="font-medium">
                                {formatCurrency(avgEntry.value as number)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) =>
                    value === "_avg" ? "Média acumulada" : value
                  }
                />
                {allExpenseNames.map((expenseName) => (
                  <Bar
                    key={expenseName}
                    dataKey={expenseName}
                    stackId="expenses"
                    fill={expenseColorMap[expenseName]}
                    radius={
                      allExpenseNames.indexOf(expenseName) ===
                      allExpenseNames.length - 1
                        ? [4, 4, 0, 0]
                        : [0, 0, 0, 0]
                    }
                  />
                ))}
                <Line
                  dataKey="_avg"
                  name="_avg"
                  type="monotone"
                  stroke={AVG_LINE_COLOR}
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Context menu ao clicar na barra */}
      {contextMenu && (
        <ChartContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          month={contextMenu.month}
          year={contextMenu.year}
          onViewDetails={() =>
            setSelectedMonth({
              month: contextMenu.month,
              year: contextMenu.year,
              expenses: contextMenu.expenses,
            })
          }
          onAddExpense={() =>
            setAddExpenseTarget({
              month: contextMenu.month,
              year: contextMenu.year,
            })
          }
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Modal de detalhes do mês */}
      {selectedMonth && (
        <MonthDetailModal
          isOpen={!!selectedMonth}
          onClose={() => setSelectedMonth(null)}
          month={selectedMonth.month}
          year={selectedMonth.year}
          expenses={selectedMonth.expenses}
        />
      )}

      {/* Form de adicionar despesa com mês/ano pré-definidos */}
      {addExpenseTarget && (
        <ExpenseForm
          onSubmit={onAddExpense}
          open={!!addExpenseTarget}
          onOpenChange={(o) => {
            if (!o) setAddExpenseTarget(null);
          }}
          defaultMonth={addExpenseTarget.month}
          defaultYear={addExpenseTarget.year}
          trigger={<span />}
        />
      )}
    </>
  );
}
