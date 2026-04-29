"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { TrendingUp, DollarSign, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// SGS Banco Central
const SGS_BASE = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";
const SELIC_CODE = 11;   // Taxa Selic
const DOLLAR_CODE = 1;   // Dólar (PTAX)
const RECORDS = 10;
const SELIC_RECORDS = 20; // máximo permitido pela API do BCB

interface SGSEntry {
  data: string;  // "DD/MM/AAAA"
  valor: string;
}

interface Indicator {
  date: string;   // já formatado DD/MM/AAAA
  value: number;
}

interface IndicatorsState {
  selic: Indicator[];       // filtrada de 15 em 15 dias
  selicRaw: Indicator[];    // últimos 10 para o gráfico combinado
  dollar: Indicator[];
}

async function fetchSGS(code: number, records = RECORDS): Promise<Indicator[]> {
  const url = `${SGS_BASE}.${code}/dados/ultimos/${records}?formato=json`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Erro ao buscar série ${code}: ${res.status}`);
  const data: SGSEntry[] = await res.json();
  return data.map((entry) => ({
    date: entry.data,
    value: parseFloat(entry.valor.replace(",", ".")),
  }));
}

// Filtra registros mantendo apenas um a cada ~15 dias (sempre inclui o último)
function filterEvery15Days(data: Indicator[]): Indicator[] {
  if (data.length === 0) return [];

  // Converte "DD/MM/AAAA" → Date para comparação
  const toDate = (str: string) => {
    const [d, m, y] = str.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const result: Indicator[] = [];
  let lastDate: Date | null = null;

  for (const entry of data) {
    const current = toDate(entry.date);
    if (
      lastDate === null ||
      (current.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24) >= 15
    ) {
      result.push(entry);
      lastDate = current;
    }
  }

  // Garante que o último registro sempre aparece
  const last = data[data.length - 1];
  if (result[result.length - 1]?.date !== last.date) {
    result.push(last);
  }

  return result;
}

// Mescla selic e dollar pelo índice para o gráfico combinado
function mergeForChart(selic: Indicator[], dollar: Indicator[]) {
  const len = Math.max(selic.length, dollar.length);
  return Array.from({ length: len }, (_, i) => ({
    date: selic[i]?.date ?? dollar[i]?.date ?? `#${i + 1}`,
    selic: selic[i]?.value ?? null,
    dollar: dollar[i]?.value ?? null,
  }));
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function IndicatorTable({
  title,
  icon: Icon,
  color,
  data,
  unit,
  showPctChange = false,
  description,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  data: Indicator[];
  unit: string;
  showPctChange?: boolean;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" style={{ color }} />
          {title}
        </CardTitle>
        <CardDescription>
          {description ?? `Últimos ${RECORDS} registros — Banco Central do Brasil`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">#</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Data</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Valor ({unit})</th>
                {showPctChange && (
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Variação</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const prev = data[i - 1];
                const pct = prev ? ((row.value - prev.value) / prev.value) * 100 : null;
                const isUp = pct !== null && pct > 0;
                const isDown = pct !== null && pct < 0;

                return (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{row.date}</td>
                    <td className="px-4 py-2 text-right tabular-nums" style={{ color }}>
                      {row.value.toFixed(2)}
                    </td>
                    {showPctChange && (
                      <td className="px-4 py-2 text-right tabular-nums">
                        {pct === null ? (
                          <span className="text-muted-foreground text-xs">—</span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                              isUp
                                ? "text-green-500"
                                : isDown
                                ? "text-red-600 dark:text-green-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            {isUp ? "▲" : isDown ? "▼" : "●"}
                            {Math.abs(pct).toFixed(2)}%
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryBadge({
  label,
  value,
  unit,
  delta,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  delta: number;
  color: string;
}) {
  const isPositive = delta >= 0;
  return (
    <div className="rounded-lg border p-4 space-y-1 bg-white dark:bg-zinc-900">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tabular-nums" style={{ color }}>
        {value.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
      </p>
      <p className={`text-xs font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
        {isPositive ? "▲" : "▼"} {Math.abs(delta).toFixed(2)} vs anterior
      </p>
    </div>
  );
}

// ─── Dollar Carousel ─────────────────────────────────────────────────────────

const DOLLAR_COLOR = "oklch(0.6 0.2 145)";
const AUTO_REFRESH_INTERVAL = 60_000; // 60 segundos

function DollarCarousel({ data: initialData }: { data: Indicator[] }) {
  const [data, setData] = useState<Indicator[]>(initialData);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const fresh = await fetchSGS(DOLLAR_CODE);
      setData(fresh);
      setLastUpdated(new Date());
    } catch {
      // silencia — mantém dados anteriores
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh a cada 60s quando ativo
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(refresh, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [autoRefresh]);

  // Sincroniza se o pai atualizar os dados iniciais
  useEffect(() => { setData(initialData); }, [initialData]);
  // Estatísticas derivadas
  const values = data.map((d) => d.value);
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const totalPct = ((last.value - data[0].value) / data[0].value) * 100;
  const lastPct = prev ? ((last.value - prev.value) / prev.value) * 100 : 0;

  const areaData = data.map((d, i) => {
    const p = data[i - 1];
    return {
      date: d.date,
      value: d.value,
      pct: p ? ((d.value - p.value) / p.value) * 100 : 0,
    };
  });

  const StatCard = ({
    label,
    value,
    sub,
    highlight,
  }: {
    label: string;
    value: string;
    sub?: string;
    highlight?: "up" | "down" | "neutral";
  }) => (
    <div className="rounded-lg border p-3 space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-lg font-bold tabular-nums ${
          highlight === "up"
            ? "text-green-500"
            : highlight === "down"
            ? "text-red-600 dark:text-green-400"
            : ""
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4" style={{ color: DOLLAR_COLOR }} />
            Dólar PTAX
            {refreshing && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Auto</span>
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                aria-label="Atualização automática"
              />
            </div>
          </div>
        </div>
        <CardDescription>
          {autoRefresh
            ? "Atualizando a cada 60 segundos — Banco Central do Brasil"
            : `Últimos ${RECORDS} registros — Banco Central do Brasil`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <Carousel opts={{ loop: false }}>
          <CarouselContent>

            {/* ── Slide 1: Tabela ── */}
            <CarouselItem>
              <div className="overflow-x-auto px-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Data</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Valor (R$)</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Variação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => {
                      const p = data[i - 1];
                      const pct = p ? ((row.value - p.value) / p.value) * 100 : null;
                      const isUp = pct !== null && pct > 0;
                      const isDown = pct !== null && pct < 0;
                      return (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                          <td className="px-3 py-2 font-medium">{row.date}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-medium" style={{ color: DOLLAR_COLOR }}>
                            {row.value.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {pct === null ? (
                              <span className="text-muted-foreground text-xs">—</span>
                            ) : (
                              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? "text-red-500" : isDown ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                                {isUp ? "▲" : isDown ? "▼" : "●"}
                                {Math.abs(pct).toFixed(2)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CarouselItem>

            {/* ── Slide 2: Dashboard ── */}
            <CarouselItem>
              <div className="px-2 space-y-4">
                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <StatCard
                    label="Último valor"
                    value={`R$ ${last.value.toFixed(2)}`}
                    sub={last.date}
                    highlight={lastPct > 0 ? "up" : lastPct < 0 ? "down" : "neutral"}
                  />
                  <StatCard
                    label="Variação (período)"
                    value={`${totalPct >= 0 ? "+" : ""}${totalPct.toFixed(2)}%`}
                    sub={`${data[0].date} → ${last.date}`}
                    highlight={totalPct > 0 ? "up" : totalPct < 0 ? "down" : "neutral"}
                  />
                  <StatCard label="Mínimo" value={`R$ ${min.toFixed(2)}`} highlight="down" />
                  <StatCard label="Máximo" value={`R$ ${max.toFixed(2)}`} highlight="up" />
                </div>

                {/* Média */}
                <div className="rounded-lg border px-4 py-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Média do período</span>
                  <span className="font-bold tabular-nums">R$ {avg.toFixed(2)}</span>
                </div>

                {/* Gráfico de área */}
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={areaData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dollarGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={DOLLAR_COLOR} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={DOLLAR_COLOR} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                        className="fill-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `R$${v.toFixed(2)}`}
                        className="fill-muted-foreground"
                        width={60}
                        domain={["auto", "auto"]}
                      />
                      <ReferenceLine
                        y={avg}
                        stroke="oklch(0.6 0.1 60)"
                        strokeDasharray="4 2"
                        label={{ value: "Média", position: "insideTopRight", fontSize: 10 }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm text-xs space-y-0.5">
                              <p className="font-medium">{label}</p>
                              <p>R$ <span className="font-bold">{d.value.toFixed(2)}</span></p>
                              {d.pct !== 0 && (
                                <p className={d.pct > 0 ? "text-red-500" : "text-green-600 dark:text-green-400"}>
                                  {d.pct > 0 ? "▲" : "▼"} {Math.abs(d.pct).toFixed(2)}%
                                </p>
                              )}
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={DOLLAR_COLOR}
                        strokeWidth={2}
                        fill="url(#dollarGrad)"
                        dot={{ r: 3, fill: DOLLAR_COLOR }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CarouselItem>

          </CarouselContent>
          <CarouselPrevious className="-left-3" />
          <CarouselNext className="-right-3" />
        </Carousel>
      </CardContent>
    </Card>
  );
}



export function NationalIndicators() {
  const [data, setData] = useState<IndicatorsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [selicAll, dollar] = await Promise.all([
        fetchSGS(SELIC_CODE, SELIC_RECORDS),
        fetchSGS(DOLLAR_CODE),
      ]);
      const selicRaw = selicAll.slice(-RECORDS); // últimos 10 para o gráfico combinado
      const selic = filterEvery15Days(selicAll);
      setData({ selic, selicRaw, dollar });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
        <Spinner className="h-8 w-8" />
        <p className="text-sm">Buscando dados do Banco Central...</p>
      </div>
    );
  }

  // ── Erro ──
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="text-center space-y-1">
          <p className="font-medium text-foreground">Não foi possível carregar os dados</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button variant="outline" onClick={load} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  const lastSelic = data.selic[data.selic.length - 1];
  const prevSelic = data.selic[data.selic.length - 2];
  const lastDollar = data.dollar[data.dollar.length - 1];
  const prevDollar = data.dollar[data.dollar.length - 2];

  const chartData = mergeForChart(data.selicRaw, data.dollar);

  return (
    <div className="space-y-6">

      {/* Header com refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Indicadores Nacionais</h3>
          <p className="text-sm text-muted-foreground">
            Dados em tempo real via SGS — Banco Central do Brasil
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryBadge
          label="Taxa Selic (último registro)"
          value={lastSelic.value}
          unit="% a.a."
          delta={lastSelic.value - prevSelic.value}
          color="oklch(0.55 0.2 250)"
        />
        <SummaryBadge
          label="Dólar PTAX (último registro)"
          value={lastDollar.value}
          unit="R$"
          delta={lastDollar.value - prevDollar.value}
          color="oklch(0.6 0.2 145)"
        />
      </div>

      {/* Gráfico combinado */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Oscilação nos últimos {RECORDS} registros</CardTitle>
          <CardDescription>Selic (% a.a.) e Dólar PTAX (R$) — eixos independentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                  interval="preserveStartEnd"
                />
                {/* Eixo esquerdo: Selic */}
                <YAxis
                  yAxisId="selic"
                  orientation="left"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v.toFixed(2)}%`}
                  className="fill-muted-foreground"
                  width={55}
                />
                {/* Eixo direito: Dólar */}
                <YAxis
                  yAxisId="dollar"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${v.toFixed(2)}`}
                  className="fill-muted-foreground"
                  width={65}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm space-y-1 min-w-44">
                        <p className="text-xs font-medium text-muted-foreground">{label}</p>
                        {payload.map((entry, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: entry.color as string }}
                            />
                            <span className="flex-1">{entry.name === "selic" ? "Selic" : "Dólar"}:</span>
                            <span className="font-medium tabular-nums">
                              {entry.name === "selic"
                                ? `${(entry.value as number).toFixed(2)}%`
                                : `R$ ${(entry.value as number).toFixed(2)}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={(v) => (v === "selic" ? "Selic (% a.a.)" : "Dólar PTAX (R$)")}
                />
                <Line
                  yAxisId="selic"
                  dataKey="selic"
                  name="selic"
                  type="monotone"
                  stroke="oklch(0.55 0.2 250)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
                <Line
                  yAxisId="dollar"
                  dataKey="dollar"
                  name="dollar"
                  type="monotone"
                  stroke="oklch(0.6 0.2 145)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabelas detalhadas */}
      <div className="grid gap-4 lg:grid-cols-2">
        <IndicatorTable
          title="Taxa Selic"
          icon={TrendingUp}
          color="oklch(0.55 0.2 250)"
          data={data.selic}
          unit="% a.a."
          description="Registros de 15 em 15 dias — Banco Central do Brasil"
        />
        <DollarCarousel data={data.dollar} />
      </div>
    </div>
  );
}
