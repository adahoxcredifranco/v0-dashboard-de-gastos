"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { calculateInvestment, formatCurrency } from "@/lib/calculations";
import { InvestmentResult } from "@/lib/types";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Calculator, Plus, Trash2, TrendingUp } from "lucide-react";

const MAX_SIMULATIONS = 5;

const SIM_COLORS = [
  "oklch(0.55 0.2 250)",
  "oklch(0.6 0.2 145)",
  "oklch(0.65 0.2 30)",
  "oklch(0.55 0.2 320)",
  "oklch(0.6 0.18 280)",
];

interface Simulation {
  id: number;
  label: string;
  initialValue: string;
  months: string;
  interestRate: string;
  recurring: boolean;
}

function emptySimulation(id: number): Simulation {
  return { id, label: `Simulação ${id}`, initialValue: "", months: "", interestRate: "", recurring: false };
}

function buildChartData(
  simulations: Simulation[],
  results: Record<number, InvestmentResult[]>
): Record<string, number | string>[] {
  const maxMonths = Math.max(
    ...simulations.filter((s) => results[s.id]).map((s) => results[s.id].length - 1),
    0
  );
  return Array.from({ length: maxMonths + 1 }, (_, month) => {
    const point: Record<string, number | string> = { month };
    simulations.forEach((sim) => {
      const r = results[sim.id];
      if (r && r[month] !== undefined) {
        point[`sim_${sim.id}`] = r[month].value;
        // dados para o gráfico de barras
        const totalInvested =
          parseFloat(sim.initialValue) * (sim.recurring ? month + 1 : 1);
        point[`bar_principal_${sim.id}`] = totalInvested;
        point[`bar_juros_${sim.id}`] = r[month].earnings;
      }
    });
    return point;
  });
}

function buildBarData(simulations: Simulation[], results: Record<number, InvestmentResult[]>) {
  return simulations
    .filter((s) => results[s.id])
    .map((sim) => {
      const final = results[sim.id][results[sim.id].length - 1];
      const totalInvested =
        parseFloat(sim.initialValue) * (sim.recurring ? parseInt(sim.months) + 1 : 1);
      return {
        id: sim.id,
        name: sim.label,
        principal: totalInvested,
        juros: final.earnings,
        total: final.value,
      };
    });
}


export function InvestmentCalculator() {
  const [simulations, setSimulations] = useState<Simulation[]>([emptySimulation(1)]);
  const [nextId, setNextId] = useState(2);
  const [results, setResults] = useState<Record<number, InvestmentResult[]>>({});

  const addSimulation = () => {
    if (simulations.length >= MAX_SIMULATIONS) return;
    setSimulations((prev) => [...prev, emptySimulation(nextId)]);
    setNextId((n) => n + 1);
  };

  const removeSimulation = (id: number) => {
    setSimulations((prev) => prev.filter((s) => s.id !== id));
    setResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateSimulation = (id: number, field: keyof Simulation, value: string | boolean) => {
    setSimulations((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleCalculate = () => {
    const newResults: Record<number, InvestmentResult[]> = {};
    simulations.forEach((sim) => {
      const v = parseFloat(sim.initialValue);
      const m = parseInt(sim.months);
      const r = parseFloat(sim.interestRate);
      if (!isNaN(v) && !isNaN(m) && !isNaN(r) && v > 0 && m > 0 && r > 0) {
        newResults[sim.id] = calculateInvestment({
          initialValue: v,
          months: m,
          interestRate: r,
          monthlyContribution: sim.recurring ? v : 0,
        });
      }
    });
    setResults(newResults);
  };

  const handleClear = () => {
    setSimulations([emptySimulation(1)]);
    setNextId(2);
    setResults({});
  };

  const hasResults = Object.keys(results).length > 0;
  const simulationsWithResults = simulations.filter((s) => results[s.id]);

  const chartData = useMemo(
    () => buildChartData(simulationsWithResults, results),
    [simulationsWithResults, results]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculadora de Investimento
        </CardTitle>
        <CardDescription>
          Compare até {MAX_SIMULATIONS} cenários de investimento com juros compostos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Lista de simulações */}
        <div className="space-y-3">
          {simulations.map((sim, index) => {
            const color = SIM_COLORS[index % SIM_COLORS.length];
            return (
              <div
                key={sim.id}
                className="rounded-lg border p-4 space-y-3"
                style={{ borderLeftColor: color, borderLeftWidth: 3 }}
              >
                <div className="flex items-center justify-between">
                  <Input
                    value={sim.label}
                    onChange={(e) => updateSimulation(sim.id, "label", e.target.value)}
                    className="h-7 text-sm font-medium border-none shadow-none px-0 w-auto focus-visible:ring-0 max-w-50"
                  />
                  {simulations.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSimulation(sim.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Valor Inicial (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="1.000,00"
                      value={sim.initialValue}
                      onChange={(e) => updateSimulation(sim.id, "initialValue", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Qtd. de Meses</Label>
                    <Input
                      type="number"
                      min="1"
                      max="360"
                      placeholder="12"
                      value={sim.months}
                      onChange={(e) => updateSimulation(sim.id, "months", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Taxa de Juros (% a.m.)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="1,00"
                      value={sim.interestRate}
                      onChange={(e) => updateSimulation(sim.id, "interestRate", e.target.value)}
                    />
                  </div>
                </div>
                {/* Aporte recorrente */}
                <div className="flex items-center justify-between rounded-md border px-3 py-2 bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">Aporte recorrente</p>
                    <p className="text-xs text-muted-foreground">
                      {sim.recurring
                        ? `+${sim.initialValue ? formatCurrency(parseFloat(sim.initialValue)) : "R$ 0,00"} por mês`
                        : "Sem aporte mensal adicional"}
                    </p>
                  </div>
                  <Switch
                    checked={sim.recurring}
                    onCheckedChange={(checked) => updateSimulation(sim.id, "recurring", checked)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Ações */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={addSimulation}
            disabled={simulations.length >= MAX_SIMULATIONS}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar cenário
            <span className="text-muted-foreground text-xs">
              ({simulations.length}/{MAX_SIMULATIONS})
            </span>
          </Button>
          <Button onClick={handleCalculate} className="flex-1 gap-2">
            <TrendingUp className="h-4 w-4" />
            Calcular
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Limpar
          </Button>
        </div>

        {/* Resultados */}
        {hasResults && (
          <>
            {/* Cards de resumo */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {simulationsWithResults.map((sim, index) => {
                const simResults = results[sim.id];
                const final = simResults[simResults.length - 1];
                const color = SIM_COLORS[index % SIM_COLORS.length];
                const totalInvested =
                  parseFloat(sim.initialValue) * (sim.recurring ? parseInt(sim.months) + 1 : 1);
                const pct = ((final.earnings / totalInvested) * 100).toFixed(2);
                return (
                  <Card key={sim.id} className="overflow-hidden">
                    <div className="h-1 w-full" style={{ backgroundColor: color }} />
                    <CardContent className="pt-3 pb-4 space-y-2">
                      <p className="text-sm font-semibold truncate">{sim.label}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Valor final</span>
                          <span className="font-bold">{formatCurrency(final.value)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Juros ganhos</span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            +{formatCurrency(final.earnings)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rendimento</span>
                          <span className="font-medium">+{pct}%</span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground pt-1 border-t">
                          <div className="flex justify-between">
                            <span>{sim.months} meses · {sim.interestRate}% a.m.</span>
                            <span>Inicial: {formatCurrency(parseFloat(sim.initialValue))}</span>
                          </div>
                          {sim.recurring && (
                            <div className="flex justify-between">
                              <span>Aporte recorrente</span>
                              <span>+{formatCurrency(parseFloat(sim.initialValue))}/mês</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Gráfico de linhas — evolução mês a mês */}
            <div>
              <p className="text-sm font-medium mb-3 text-muted-foreground">Evolução mês a mês</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      className="fill-muted-foreground"
                      label={{ value: "Meses", position: "insideBottomRight", offset: -5, fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`}
                      className="fill-muted-foreground"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-sm min-w-45">
                            <p className="text-sm font-medium mb-2">Mês {label}</p>
                            <div className="space-y-1">
                              {payload.map((entry, i) => {
                                const sim = simulations.find((s) => `sim_${s.id}` === entry.dataKey);
                                return (
                                  <div key={i} className="flex items-center gap-2 text-sm">
                                    <span
                                      className="h-2 w-2 rounded-full shrink-0"
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="flex-1 truncate">{sim?.label ?? entry.dataKey}:</span>
                                    <span className="font-medium">{formatCurrency(entry.value as number)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px" }}
                      formatter={(value) => {
                        const sim = simulations.find((s) => `sim_${s.id}` === value);
                        return sim?.label ?? value;
                      }}
                    />
                    {simulationsWithResults.map((sim, index) => (
                      <Line
                        key={sim.id}
                        dataKey={`sim_${sim.id}`}
                        name={`sim_${sim.id}`}
                        type="monotone"
                        stroke={SIM_COLORS[index % SIM_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de barras — principal vs juros por mês */}
            <div>
              <p className="text-sm font-medium mb-3 text-muted-foreground">
                Principal vs juros por mês
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    barCategoryGap="20%"
                    barGap={2}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      className="fill-muted-foreground"
                      label={{ value: "Meses", position: "insideBottomRight", offset: -5, fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`}
                      className="fill-muted-foreground"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        // Agrupa por simulação: pega pares principal+juros
                        const simEntries = simulationsWithResults.map((sim, index) => {
                          const principalEntry = payload.find((p) => p.dataKey === `bar_principal_${sim.id}`);
                          const jurosEntry = payload.find((p) => p.dataKey === `bar_juros_${sim.id}`);
                          const principal = (principalEntry?.value as number) ?? 0;
                          const juros = (jurosEntry?.value as number) ?? 0;
                          return { sim, index, principal, juros, total: principal + juros };
                        }).filter((e) => e.principal > 0 || e.juros > 0);

                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-sm min-w-52">
                            <p className="text-sm font-medium mb-2">Mês {label}</p>
                            <div className="space-y-2">
                              {simEntries.map(({ sim, index, principal, juros, total }) => (
                                <div key={sim.id} className="space-y-0.5">
                                  <p className="text-xs font-semibold" style={{ color: SIM_COLORS[index % SIM_COLORS.length] }}>
                                    {sim.label}
                                  </p>
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Principal:</span>
                                    <span>{formatCurrency(principal)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-green-600 dark:text-green-400">
                                    <span>Juros:</span>
                                    <span>+{formatCurrency(juros)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs font-bold">
                                    <span>Total:</span>
                                    <span>{formatCurrency(total)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px" }}
                      formatter={(value: string) => {
                        if (value.startsWith("bar_principal_")) {
                          const id = parseInt(value.replace("bar_principal_", ""));
                          const sim = simulations.find((s) => s.id === id);
                          return `${sim?.label ?? id} — Principal`;
                        }
                        if (value.startsWith("bar_juros_")) {
                          const id = parseInt(value.replace("bar_juros_", ""));
                          const sim = simulations.find((s) => s.id === id);
                          return `${sim?.label ?? id} — Juros`;
                        }
                        return value;
                      }}
                    />
                    {simulationsWithResults.flatMap((sim, index) => [
                      <Bar
                        key={`principal_${sim.id}`}
                        dataKey={`bar_principal_${sim.id}`}
                        name={`bar_principal_${sim.id}`}
                        stackId={`stack_${sim.id}`}
                        fill={SIM_COLORS[index % SIM_COLORS.length]}
                        fillOpacity={0.4}
                        radius={[0, 0, 4, 4]}
                      />,
                      <Bar
                        key={`juros_${sim.id}`}
                        dataKey={`bar_juros_${sim.id}`}
                        name={`bar_juros_${sim.id}`}
                        stackId={`stack_${sim.id}`}
                        fill={SIM_COLORS[index % SIM_COLORS.length]}
                        fillOpacity={1}
                        radius={[4, 4, 0, 0]}
                      />,
                    ])}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
