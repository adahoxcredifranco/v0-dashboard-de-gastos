"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, CalendarDays, Pencil } from "lucide-react";
import {
  Expense,
  ExpenseCategory,
  ExpensePeriod,
  EXPENSE_CATEGORY_ICONS,
  EXPENSE_CATEGORY_LABELS,
  MONTHS_PT,
} from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExpenseForm } from "./expense-form";

interface ExpenseListProps {
  expenses: Expense[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>) => void;
  title?: string;
}

export function ExpenseList({ expenses, onRemove, onUpdate, title = "Despesas" }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma despesa cadastrada. Adicione sua primeira despesa!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expenses.map((expense) => {
            const currentCategory = (expense.category as ExpenseCategory) ?? ExpenseCategory.OTHER;

            return (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {expense.period === ExpensePeriod.YEAR ? (
                    <CalendarDays className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{expense.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap mt-0.5">
                      <span>{MONTHS_PT[expense.month - 1]} {expense.year}</span>

                      {/* Dropdown inline de período */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/40 px-1.5 py-0.5 text-xs hover:border-primary hover:text-primary transition-colors">
                            {expense.period === ExpensePeriod.YEAR ? "Anual" : "Mensal"}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-36">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Alterar período
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {[
                            { value: ExpensePeriod.MONTH, label: "Mensal" },
                            { value: ExpensePeriod.YEAR, label: "Anual" },
                          ].map(({ value, label }) => (
                            <DropdownMenuItem
                              key={value}
                              className={`gap-2 cursor-pointer ${expense.period === value ? "bg-accent" : ""}`}
                              onClick={() => onUpdate(expense.id, { period: value })}
                            >
                              {label}
                              {expense.period === value && (
                                <span className="ml-auto text-primary text-xs">✓</span>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Dropdown inline de categoria */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/40 px-1.5 py-0.5 text-xs hover:border-primary hover:text-primary transition-colors">
                            <span>{EXPENSE_CATEGORY_ICONS[currentCategory]}</span>
                            <span>{EXPENSE_CATEGORY_LABELS[currentCategory]}</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Alterar categoria
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {Object.values(ExpenseCategory).map((cat) => (
                            <DropdownMenuItem
                              key={cat}
                              className={`gap-2 cursor-pointer ${cat === currentCategory ? "bg-accent" : ""}`}
                              onClick={() => onUpdate(expense.id, { category: cat })}
                            >
                              <span>{EXPENSE_CATEGORY_ICONS[cat]}</span>
                              <span>{EXPENSE_CATEGORY_LABELS[cat]}</span>
                              {cat === currentCategory && (
                                <span className="ml-auto text-primary text-xs">✓</span>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="font-bold text-base">{formatCurrency(expense.value)}</span>

                  {/* Edit */}
                  <ExpenseForm
                    editExpense={expense}
                    open={editingId === expense.id}
                    onOpenChange={(o) => setEditingId(o ? expense.id : null)}
                    trigger={
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar despesa</span>
                      </Button>
                    }
                    onSubmit={(data) => {
                      onUpdate(expense.id, data);
                      setEditingId(null);
                    }}
                  />

                  {/* Delete */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remover despesa</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover despesa?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover &quot;{expense.name}&quot;? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onRemove(expense.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
