"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, CalendarDays } from "lucide-react";
import { Expense, ExpensePeriod, MONTHS_PT } from "@/lib/types";
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

interface ExpenseListProps {
  expenses: Expense[];
  onRemove: (id: string) => void;
  title?: string;
}

export function ExpenseList({ expenses, onRemove, title = "Despesas" }: ExpenseListProps) {
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
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expense.period === ExpensePeriod.YEAR ? (
                  <CalendarDays className="h-5 w-5 text-primary" />
                ) : (
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{expense.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{MONTHS_PT[expense.month - 1]} {expense.year}</span>
                    <Badge variant={expense.period === ExpensePeriod.YEAR ? "default" : "secondary"}>
                      {expense.period === ExpensePeriod.YEAR ? "Anual" : "Mensal"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">{formatCurrency(expense.value)}</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
