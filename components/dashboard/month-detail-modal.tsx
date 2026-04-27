"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, MONTHS_PT } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Receipt } from "lucide-react";

// Paleta de cores para o gráfico de pizza
const PIE_COLORS = [
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
];

interface MonthDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: number;
  year: number;
  expenses: Expense[];
}

export function MonthDetailModal({
  isOpen,
  onClose,
  month,
  year,
  expenses,
}: MonthDetailModalProps) {
  const monthName = MONTHS_PT[month - 1];
  const total = expenses.reduce((sum, e) => sum + e.value, 0);

  // Agrupa despesas por nome para o gráfico de pizza
  const pieData = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach((expense) => {
      grouped[expense.name] = (grouped[expense.name] || 0) + expense.value;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, total]);

  // Lista de despesas ordenada por valor
  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.value - a.value),
    [expenses]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalhes de {monthName} {year}
          </DialogTitle>
          <DialogDescription>
            Total de gastos: {formatCurrency(total)} em {expenses.length} despesa(s)
          </DialogDescription>
        </DialogHeader>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Receipt className="h-12 w-12 mb-4" />
            <p>Nenhuma despesa registrada neste mês</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico de Pizza */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Distribuição de Gastos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className="font-medium">{data.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(data.value)} ({data.percentage}%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: "11px" }}
                        formatter={(value, entry) => {
                          const data = pieData.find((d) => d.name === value);
                          return `${value} (${data?.percentage}%)`;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Despesas */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Listagem Detalhada
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[250px] px-4">
                  <div className="space-y-2 pb-4">
                    {sortedExpenses.map((expense, index) => {
                      const percentage =
                        total > 0
                          ? ((expense.value / total) * 100).toFixed(1)
                          : "0";
                      return (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3 w-3 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  PIE_COLORS[
                                    pieData.findIndex((p) => p.name === expense.name) %
                                      PIE_COLORS.length
                                  ],
                              }}
                            />
                            <div>
                              <p className="font-medium text-sm">{expense.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {expense.period === "YEAR" ? "Anual" : "Mensal"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">
                              {formatCurrency(expense.value)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {percentage}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resumo por Categoria */}
        {pieData.length > 0 && (
          <Card className="mt-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Resumo por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {pieData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                  >
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(item.value)}</p>
                      <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
