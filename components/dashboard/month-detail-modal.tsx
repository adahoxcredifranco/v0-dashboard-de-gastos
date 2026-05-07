"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, MONTHS_PT, isExpensePaid, ExpenseCategory, EXPENSE_CATEGORY_ICONS, EXPENSE_CATEGORY_LABELS } from "@/lib/types";
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
import { Calendar, Receipt, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// Paleta de 52 cores bem distintas para o gráfico de pizza
const PIE_COLORS = [
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

interface MonthDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: number;
  year: number;
  expenses: Expense[];
  onUpdateExpense?: (id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>) => void;
  onSetExpensePaid?: (id: string, year: number, month: number, paid: boolean) => void;
}

export function MonthDetailModal({
  isOpen,
  onClose,
  month,
  year,
  expenses,
  onUpdateExpense,
  onSetExpensePaid,
}: MonthDetailModalProps) {
  const monthName = MONTHS_PT[month - 1];

  // Estado local para resposta imediata na UI (chave = id da despesa)
  const [paidOverride, setPaidOverride] = useState<Record<string, boolean>>({});

  // Resolve se está pago: override local tem prioridade, depois paidMonths, depois false
  const isPaid = (expense: Expense) =>
    paidOverride[expense.id] !== undefined
      ? paidOverride[expense.id]
      : isExpensePaid(expense, year, month);

  const handleTogglePaid = (expense: Expense, checked: boolean) => {
    setPaidOverride((prev) => ({ ...prev, [expense.id]: checked }));
    onSetExpensePaid?.(expense.id, year, month, checked);
  };

  const total = expenses.reduce((sum, e) => sum + e.value, 0);
  const paidTotal = expenses
    .filter((e) => isPaid(e))
    .reduce((sum, e) => sum + e.value, 0);
  const pendingTotal = total - paidTotal;
  const paidCount = expenses.filter((e) => isPaid(e)).length;

  // Agrupa despesas por categoria para o gráfico de pizza
  const pieData = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach((expense) => {
      const key = expense.category
        ? `${EXPENSE_CATEGORY_ICONS[expense.category as ExpenseCategory]} ${EXPENSE_CATEGORY_LABELS[expense.category as ExpenseCategory]}`
        : `${EXPENSE_CATEGORY_ICONS[ExpenseCategory.OTHER]} ${EXPENSE_CATEGORY_LABELS[ExpenseCategory.OTHER]}`;
      grouped[key] = (grouped[key] || 0) + expense.value;
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
      <DialogContent className="!w-[90vw] !max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Detalhes de {monthName} {year}
          </DialogTitle>
          <DialogDescription>
            Total: {formatCurrency(total)} em {expenses.length} despesa(s)
          </DialogDescription>
        </DialogHeader>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Receipt className="h-12 w-12 mb-4" />
            <p>Nenhuma despesa registrada neste mês</p>
          </div>
        ) : (
          <>
            {/* Resumo de pagamento */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-card p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="font-bold text-base">{formatCurrency(total)}</p>
              </div>
              <div className="rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 p-3 text-center">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Pago</p>
                <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(paidTotal)}
                </p>
              </div>
              <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 p-3 text-center">
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Pendente</p>
                <p className="font-bold text-base text-amber-600 dark:text-amber-400">
                  {formatCurrency(pendingTotal)}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Gráfico de Pizza */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Distribuição de Gastos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
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
                          formatter={(value) => {
                            const data = pieData.find((d) => d.name === value);
                            return `${value} (${data?.percentage}%)`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Despesas com switch de pago */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Listagem Detalhada
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {paidCount}/{expenses.length} pagos
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-72 px-4">
                    <div className="space-y-1 pb-4 pt-1">
                      {sortedExpenses.map((expense) => {
                        const paid = isPaid(expense);
                        const percentage =
                          total > 0
                            ? ((expense.value / total) * 100).toFixed(1)
                            : "0";

                        return (
                          <div
                            key={expense.id}
                            className={`flex items-center gap-3 py-2.5 px-1 rounded-lg border transition-colors ${
                              paid
                                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900"
                                : "bg-card border-transparent"
                            }`}
                          >
                            {/* Indicador de cor baseado na categoria */}
                            <span
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{
                                backgroundColor: (() => {
                                  const categoryLabel = expense.category
                                    ? `${EXPENSE_CATEGORY_ICONS[expense.category as ExpenseCategory]} ${EXPENSE_CATEGORY_LABELS[expense.category as ExpenseCategory]}`
                                    : `${EXPENSE_CATEGORY_ICONS[ExpenseCategory.OTHER]} ${EXPENSE_CATEGORY_LABELS[ExpenseCategory.OTHER]}`;
                                  const categoryIndex = pieData.findIndex((p) => p.name === categoryLabel);
                                  return PIE_COLORS[categoryIndex % PIE_COLORS.length];
                                })(),
                              }}
                            />

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-medium text-sm truncate ${
                                  paid ? "line-through text-muted-foreground" : ""
                                }`}
                              >
                                {expense.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {expense.period === "YEAR" ? "Anual" : "Mensal"} · {percentage}%
                                {expense.category && (
                                  <span className="ml-1">
                                    · {EXPENSE_CATEGORY_ICONS[expense.category as ExpenseCategory]} {EXPENSE_CATEGORY_LABELS[expense.category as ExpenseCategory]}
                                  </span>
                                )}
                              </p>
                            </div>

                            {/* Valor */}
                            <span
                              className={`text-sm font-semibold shrink-0 ${
                                paid ? "text-muted-foreground line-through" : ""
                              }`}
                            >
                              {formatCurrency(expense.value)}
                            </span>

                            {/* Switch pago */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {paid && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              )}
                              <Switch
                                checked={paid}
                                onCheckedChange={(checked) =>
                                  handleTogglePaid(expense, checked)
                                }
                                aria-label={`Marcar ${expense.name} como ${paid ? "não pago" : "pago"}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

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
                    {pieData.map((item, index) => {
                      // Verifica se todas as despesas dessa categoria estão pagas
                      const itemExpenses = expenses.filter((e) => {
                        const key = e.category
                          ? `${EXPENSE_CATEGORY_ICONS[e.category as ExpenseCategory]} ${EXPENSE_CATEGORY_LABELS[e.category as ExpenseCategory]}`
                          : `${EXPENSE_CATEGORY_ICONS[ExpenseCategory.OTHER]} ${EXPENSE_CATEGORY_LABELS[ExpenseCategory.OTHER]}`;
                        return key === item.name;
                      });
                      const allPaid = itemExpenses.every((e) => isPaid(e));
                      return (
                        <div
                          key={item.name}
                          className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                            allPaid
                              ? "bg-emerald-50 dark:bg-emerald-950/30"
                              : "bg-muted/50"
                          }`}
                        >
                          <span
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{
                              backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold">{formatCurrency(item.value)}</p>
                            <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                          </div>
                          {allPaid && (
                            <Badge
                              variant="outline"
                              className="text-xs border-emerald-300 text-emerald-600 dark:text-emerald-400 shrink-0"
                            >
                              Pago
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
