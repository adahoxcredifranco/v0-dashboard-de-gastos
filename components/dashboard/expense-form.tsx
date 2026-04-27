"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ExpensePeriod, MONTHS_PT } from "@/lib/types";

interface ExpenseFormProps {
  onSubmit: (expense: {
    name: string;
    value: number;
    period: ExpensePeriod;
    month: number;
    year: number;
  }) => void;
}

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [period, setPeriod] = useState<ExpensePeriod>(ExpensePeriod.MONTH);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !value || parseFloat(value) <= 0) {
      return;
    }

    onSubmit({
      name: name.trim(),
      value: parseFloat(value),
      period,
      month: parseInt(month),
      year: parseInt(year),
    });

    // Reset form
    setName("");
    setValue("");
    setPeriod(ExpensePeriod.MONTH);
    setMonth((new Date().getMonth() + 1).toString());
    setYear(new Date().getFullYear().toString());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Despesa</DialogTitle>
          <DialogDescription>
            Cadastre uma nova despesa. Escolha se é um gasto mensal ou anual.
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
            <Label htmlFor="period">Período</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as ExpensePeriod)}>
              <SelectTrigger id="period">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ExpensePeriod.MONTH}>
                  Mensal (apenas este mês)
                </SelectItem>
                <SelectItem value={ExpensePeriod.YEAR}>
                  Anual (até dezembro)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="month">Mês</Label>
              <Select value={month} onValueChange={setMonth}>
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
              <Select value={year} onValueChange={setYear}>
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

          <Button type="submit" className="mt-4">
            Adicionar Despesa
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
