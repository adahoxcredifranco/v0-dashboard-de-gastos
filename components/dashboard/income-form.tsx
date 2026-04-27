"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { ExpensePeriod, IncomeType, INCOME_TYPE_LABELS, MONTHS_PT } from "@/lib/types";

interface IncomeFormProps {
  onSubmit: (income: {
    name: string;
    value: number;
    type: IncomeType;
    period: ExpensePeriod;
    month: number;
    year: number;
  }) => void;
}

export function IncomeForm({ onSubmit }: IncomeFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState<IncomeType>(IncomeType.SALARY);
  const [period, setPeriod] = useState<ExpensePeriod>(ExpensePeriod.MONTH);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !value) return;

    onSubmit({
      name: name.trim(),
      value: parseFloat(value),
      type,
      period,
      month,
      year,
    });

    // Reset form
    setName("");
    setValue("");
    setType(IncomeType.SALARY);
    setPeriod(ExpensePeriod.MONTH);
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setOpen(false);
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-success text-success hover:bg-success hover:text-success-foreground">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Entrada
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Cadastrar Entrada</DialogTitle>
            <DialogDescription>
              Adicione uma nova fonte de renda como salário ou investimento.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="income-name">Nome</Label>
              <Input
                id="income-name"
                placeholder="Ex: Salário, Freelance, Dividendos..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="income-value">Valor (R$)</Label>
              <Input
                id="income-value"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="income-type">Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as IncomeType)}>
                <SelectTrigger id="income-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(IncomeType).map((t) => (
                    <SelectItem key={t} value={t}>
                      {INCOME_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="income-period">Período</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as ExpensePeriod)}>
                <SelectTrigger id="income-period">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ExpensePeriod.MONTH}>Mensal (somente este mês)</SelectItem>
                  <SelectItem value={ExpensePeriod.YEAR}>Anual (até dezembro)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="income-month">Mês</Label>
                <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                  <SelectTrigger id="income-month">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS_PT.map((m, i) => (
                      <SelectItem key={i} value={(i + 1).toString()}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="income-year">Ano</Label>
                <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                  <SelectTrigger id="income-year">
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-success hover:bg-success/90 text-success-foreground">
              Adicionar Entrada
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
