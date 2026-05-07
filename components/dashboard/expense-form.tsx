"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import {
  Expense,
  ExpenseCategory,
  ExpensePeriod,
  EXPENSE_CATEGORY_ICONS,
  EXPENSE_CATEGORY_LABELS,
  MONTHS_PT,
} from "@/lib/types";

type ExpensePayload = {
  name: string;
  value: number;
  period: ExpensePeriod;
  category?: ExpenseCategory;
  month: number;
  year: number;
};

interface ExpenseFormProps {
  onSubmit: (expense: ExpensePayload) => void;
  editExpense?: Expense;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Pré-define e trava o mês/ano (usado ao adicionar pelo gráfico) */
  defaultMonth?: number;
  defaultYear?: number;
  /** Pré-preenche campos via QR code */
  defaultValues?: Partial<{ name: string; value: number; period: ExpensePeriod; category: ExpenseCategory }>;
}

export function ExpenseForm({
  onSubmit,
  editExpense,
  trigger,
  open: controlledOpen,
  onOpenChange,
  defaultMonth,
  defaultYear,
  defaultValues,
}: ExpenseFormProps) {
  const isEditMode = !!editExpense;
  const isLockedMonth = defaultMonth !== undefined && defaultYear !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [name, setName] = useState(defaultValues?.name ?? "");
  const [value, setValue] = useState(defaultValues?.value?.toString() ?? "");
  const [period, setPeriod] = useState<ExpensePeriod>(defaultValues?.period ?? ExpensePeriod.MONTH);
  const [category, setCategory] = useState<ExpenseCategory | "">(defaultValues?.category ?? "");
  const [month, setMonth] = useState((defaultMonth ?? new Date().getMonth() + 1).toString());
  const [year, setYear] = useState((defaultYear ?? new Date().getFullYear()).toString());

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  useEffect(() => {
    if (open && editExpense) {
      setName(editExpense.name);
      setValue(editExpense.value.toString());
      setPeriod(editExpense.period);
      setCategory(editExpense.category ?? "");
      setMonth(editExpense.month.toString());
      setYear(editExpense.year.toString());
    } else if (open && defaultValues && !isEditMode) {
      setName(defaultValues.name ?? "");
      setValue(
        defaultValues.value !== undefined && defaultValues.value !== null
          ? String(defaultValues.value)
          : "",
      );
      setPeriod(defaultValues.period ?? ExpensePeriod.MONTH);
      setCategory(defaultValues.category ?? "");
    } else if (open && isLockedMonth) {
      setMonth(defaultMonth!.toString());
      setYear(defaultYear!.toString());
    }
  }, [open, editExpense, defaultValues, isLockedMonth, defaultMonth, defaultYear]);

  const resetForm = () => {
    setName(defaultValues?.name ?? "");
    setValue(defaultValues?.value?.toString() ?? "");
    setPeriod(defaultValues?.period ?? ExpensePeriod.MONTH);
    setCategory(defaultValues?.category ?? "");
    setMonth((defaultMonth ?? new Date().getMonth() + 1).toString());
    setYear((defaultYear ?? new Date().getFullYear()).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value || parseFloat(value) <= 0) return;

    onSubmit({
      name: name.trim(),
      value: parseFloat(value),
      period,
      category: category !== "" ? category : undefined,
      month: parseInt(month),
      year: parseInt(year),
    });

    if (!isEditMode) resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o && !isEditMode) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Despesa" : "Adicionar Despesa"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Altere os dados da despesa e salve."
              : "Cadastre uma nova despesa. Escolha se é um gasto mensal ou anual."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da Despesa</Label>
            <Input
              id="name"
              placeholder="Ex: Netflix, Aluguel, Mercado..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="value">Valor (R$)</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as ExpenseCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ExpenseCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      <span>{EXPENSE_CATEGORY_ICONS[cat]}</span>
                      <span>{EXPENSE_CATEGORY_LABELS[cat]}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Período</Label>
            <ToggleGroup
              type="single"
              value={period}
              onValueChange={(v) => { if (v) setPeriod(v as ExpensePeriod); }}
              className="grid grid-cols-2"
            >
              <ToggleGroupItem value={ExpensePeriod.MONTH} className="w-full">
                Mensal
              </ToggleGroupItem>
              <ToggleGroupItem value={ExpensePeriod.YEAR} className="w-full">
                Anual
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="month">Mês</Label>
              <Select value={month} onValueChange={setMonth} disabled={isLockedMonth}>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS_PT.map((m, idx) => (
                    <SelectItem key={idx} value={(idx + 1).toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="year">Ano</Label>
              <Select value={year} onValueChange={setYear} disabled={isLockedMonth}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditMode ? "Salvar Alterações" : "Adicionar Despesa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
