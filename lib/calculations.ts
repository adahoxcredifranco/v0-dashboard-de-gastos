import { InvestmentCalculation, InvestmentResult } from "./types";

// Calculadora de investimento com juros compostos
export function calculateInvestment(params: InvestmentCalculation): InvestmentResult[] {
  const { initialValue, months, interestRate, monthlyContribution = 0 } = params;
  const results: InvestmentResult[] = [];

  let currentValue = initialValue;
  const monthlyRate = interestRate / 100;
  // Total aportado (inicial + aportes recorrentes)
  let totalContributed = initialValue;

  results.push({ month: 0, value: initialValue, earnings: 0 });

  for (let month = 1; month <= months; month++) {
    // Juros sobre o saldo atual
    currentValue = currentValue * (1 + monthlyRate);
    // Aporte recorrente entra após os juros do mês
    if (monthlyContribution > 0) {
      currentValue += monthlyContribution;
      totalContributed += monthlyContribution;
    }
    results.push({
      month,
      value: currentValue,
      earnings: currentValue - totalContributed,
    });
  }

  return results;
}

// Formatar valor para moeda brasileira
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Formatar porcentagem
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Gerar nome do arquivo para exportação
export function generateExportFilename(): string {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
  return `${date}_${time}.json`;
}
