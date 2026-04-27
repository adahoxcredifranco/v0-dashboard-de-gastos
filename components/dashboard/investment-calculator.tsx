"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { calculateInvestment, formatCurrency } from "@/lib/calculations";
import { InvestmentResult } from "@/lib/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calculator, TrendingUp } from "lucide-react";

export function InvestmentCalculator() {
  const [initialValue, setInitialValue] = useState("");
  const [months, setMonths] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [results, setResults] = useState<InvestmentResult[] | null>(null);

  const handleCalculate = () => {
    const value = parseFloat(initialValue);
    const m = parseInt(months);
    const rate = parseFloat(interestRate);

    if (isNaN(value) || isNaN(m) || isNaN(rate) || value <= 0 || m <= 0 || rate <= 0) {
      return;
    }

    const calculatedResults = calculateInvestment({
      initialValue: value,
      months: m,
      interestRate: rate,
    });

    setResults(calculatedResults);
  };

  const handleClear = () => {
    setInitialValue("");
    setMonths("");
    setInterestRate("");
    setResults(null);
  };

  const finalResult = results ? results[results.length - 1] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculadora de Investimento
        </CardTitle>
        <CardDescription>
          Simule o crescimento do seu investimento com juros compostos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="initial-value">Valor Inicial (R$)</Label>
            <Input
              id="initial-value"
              type="number"
              step="0.01"
              min="0"
              placeholder="1000,00"
              value={initialValue}
              onChange={(e) => setInitialValue(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="months">Quantidade de Meses</Label>
            <Input
              id="months"
              type="number"
              min="1"
              max="360"
              placeholder="12"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="interest-rate">Taxa de Juros (% ao mês)</Label>
            <Input
              id="interest-rate"
              type="number"
              step="0.01"
              min="0"
              placeholder="1,00"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleCalculate} className="flex-1">
            <TrendingUp className="mr-2 h-4 w-4" />
            Calcular
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Limpar
          </Button>
        </div>

        {results && finalResult && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Valor Final</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(finalResult.value)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-success/10 border-success/20">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Total em Juros</p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(finalResult.earnings)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Rendimento Total</p>
                  <p className="text-2xl font-bold">
                    {((finalResult.earnings / parseFloat(initialValue)) * 100).toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={results}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                    label={{ value: "Meses", position: "insideBottomRight", offset: -5 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as InvestmentResult;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-sm">
                            <div className="grid gap-1">
                              <span className="text-sm text-muted-foreground">
                                Mês {data.month}
                              </span>
                              <span className="text-sm font-bold">
                                Valor: {formatCurrency(data.value)}
                              </span>
                              <span className="text-sm text-success">
                                Juros: {formatCurrency(data.earnings)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
