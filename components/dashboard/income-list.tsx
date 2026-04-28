"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, PiggyBank, Pencil } from "lucide-react";
import { Income, INCOME_TYPE_LABELS, MONTHS_PT, ExpensePeriod } from "@/lib/types";
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
import { Badge } from "@/components/ui/badge";
import { IncomeForm } from "./income-form";

interface IncomeListProps {
  incomes: Income[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Income, "id" | "createdAt">>) => void;
  title?: string;
}

export function IncomeList({ incomes, onRemove, onUpdate, title = "Entradas" }: IncomeListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const total = incomes.reduce((sum, i) => sum + i.value, 0);

  if (incomes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-success" />
            {title}
          </CardTitle>
          <CardDescription>Nenhuma entrada cadastrada</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Clique em &quot;Nova Entrada&quot; no cabeçalho para adicionar salário, investimentos ou outras fontes de renda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-success" />
              {title}
            </CardTitle>
            <CardDescription>
              {incomes.length} entrada{incomes.length !== 1 ? "s" : ""} cadastrada{incomes.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-success">{formatCurrency(total)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {incomes.map((income) => (
            <div
              key={income.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{income.name}</p>
                  <Badge variant="outline" className="text-xs border-success/50 text-success">
                    {INCOME_TYPE_LABELS[income.type]}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {income.period === ExpensePeriod.YEAR ? "Anual" : "Mensal"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {MONTHS_PT[income.month - 1]} de {income.year}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-success">{formatCurrency(income.value)}</span>

                {/* Edit */}
                <IncomeForm
                  editIncome={income}
                  open={editingId === income.id}
                  onOpenChange={(o) => setEditingId(o ? income.id : null)}
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar entrada</span>
                    </Button>
                  }
                  onSubmit={(data) => {
                    onUpdate(income.id, data);
                    setEditingId(null);
                  }}
                />

                {/* Delete */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remover entrada</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover entrada?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá remover permanentemente a entrada &quot;{income.name}&quot; de {formatCurrency(income.value)}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onRemove(income.id)}
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
