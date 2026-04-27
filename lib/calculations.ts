import { InvestmentCalculation, InvestmentResult } from "./types";

// Calculadora de investimento com juros compostos
export function calculateInvestment(params: InvestmentCalculation): InvestmentResult[] {
  const { initialValue, months, interestRate } = params;
  const results: InvestmentResult[] = [];
  
  let currentValue = initialValue;
  const monthlyRate = interestRate / 100;

  for (let month = 0; month <= months; month++) {
    if (month === 0) {
      results.push({
        month: 0,
        value: initialValue,
        earnings: 0,
      });
    } else {
      const earnings = currentValue * monthlyRate;
      currentValue = currentValue + earnings;
      results.push({
        month,
        value: currentValue,
        earnings: currentValue - initialValue,
      });
    }
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
