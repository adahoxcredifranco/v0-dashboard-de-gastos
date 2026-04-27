"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthSummary, MONTHS_PT } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface MonthlyChartProps {
  data: MonthSummary[];
  currentMonth: number;
}

export function MonthlyChart({ data, currentMonth }: MonthlyChartProps) {
  const chartData = data.map((item) => ({
    name: MONTHS_PT[item.month - 1].substring(0, 3),
    total: item.total,
    month: item.month,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Mês</CardTitle>
        <CardDescription>Comparativo mensal de despesas em {data[0]?.year}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-1">
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
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.month === currentMonth ? "hsl(var(--primary))" : "hsl(var(--chart-2))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
