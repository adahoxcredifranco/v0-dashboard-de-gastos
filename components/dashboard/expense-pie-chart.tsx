"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, MONTHS_PT } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ExpensePieChartProps {
  expenses: Expense[];
  month: number;
  year: number;
}

const COLORS = [
  // Blues
  "#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd",
  // Oranges & Reds
  "#c2410c", "#f97316", "#fb923c", "#ef4444", "#dc2626", "#fca5a5",
  // Greens
  "#15803d", "#22c55e", "#4ade80", "#86efac", "#84cc16", "#bef264",
  // Purples & Pinks
  "#7e22ce", "#a855f7", "#c084fc", "#ec4899", "#f472b6", "#db2777",
  // Yellows & Ambers
  "#b45309", "#f59e0b", "#fbbf24", "#fde047", "#eab308",
  // Cyans & Teals
  "#0e7490", "#06b6d4", "#22d3ee", "#14b8a6", "#2dd4bf", "#0d9488",
  // Indigos & Violets
  "#4338ca", "#6366f1", "#818cf8", "#7c3aed", "#8b5cf6",
  // Rose & Fuchsia
  "#be123c", "#fb7185", "#e11d48", "#d946ef", "#e879f9", "#a21caf",
  // Lime & Emerald
  "#4d7c0f", "#65a30d", "#16a34a", "#059669",
  // Slate & Zinc accents
  "#0f766e", "#0369a1", "#7c2d12", "#713f12",
];

export function ExpensePieChart({ expenses, month, year }: ExpensePieChartProps) {
  const pieData = expenses.map((expense, index) => ({
    name: expense.name,
    value: expense.value,
    color: COLORS[index % COLORS.length],
  }));

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Gastos</CardTitle>
          <CardDescription>{MONTHS_PT[month - 1]} de {year}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-12">
            Nenhuma despesa cadastrada para exibir o gráfico.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Gastos</CardTitle>
        <CardDescription>{MONTHS_PT[month - 1]} de {year}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={160}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-1">
                          <span className="text-sm font-medium">{payload[0].name}</span>
                          <span className="text-sm font-bold">
                            {formatCurrency(payload[0].value as number)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
