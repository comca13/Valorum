/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IndicatorId = 'ibov' | 'usd' | 'eur' | 'selic' | 'cdi';

export interface CurrencyConversionDetails {
  bidRaw: number;          // Cotação comercial interbancária de compra pura
  askRaw: number;          // Cotação comercial interbancária de venda pura
  spreadPct: number;       // Taxa de conversão da instituição (ex: 1.5%)
  iofBuyPct: number;       // Encargo IOF na compra de moeda (ex: 1.1% conta global ou 4.38% cartão)
  iofSellPct: number;      // Encargo IOF na venda de moeda (ex: 0.38% repatriação)
  spreadBuyValue: number;  // Valor em R$ da taxa de conversão na compra
  iofBuyValue: number;     // Valor em R$ dos encargos (IOF) na compra
  vetBuy: number;          // Resultado Final Efetivo na Compra (VET Compra em R$)
  spreadSellValue: number; // Valor em R$ da taxa de conversão na venda
  iofSellValue: number;    // Valor em R$ dos encargos (IOF) na venda
  vetSell: number;         // Resultado Final Efetivo na Venda (VET Venda em R$)
}

export interface IndicatorData {
  id: IndicatorId;
  name: string;
  code: string;
  value: number;
  formattedValue: string;
  change: number;
  changePct: number;
  high?: number;
  low?: number;
  subValue?: string;
  subLabel?: string;
  lastUpdated: string;
  source: 'live' | 'cache' | 'mock';
  unit: string;
  currencyDetails?: CurrencyConversionDetails;
}

export interface HistoricalPoint {
  date: string;
  label: string;
  timestamp: number;
  value: number;
}

export type ChartDisplayMode = 'dual-axis' | 'normalized-pct';

export interface DualHistoricalPoint {
  date: string;
  label: string;
  timestamp: number;
  val1: number;
  val2?: number;
  pct1?: number;
  pct2?: number;
}

export type AlertType = 'ceiling' | 'floor'; // Teto (>=) ou Piso (<=)

export interface MacroPriceAlert {
  id: string;
  indicatorId: IndicatorId;
  indicatorCode: string;
  indicatorName: string;
  type: AlertType;
  targetValue: number;
  note?: string;
  createdAt: string;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  triggeredValue?: number;
}

// ==========================================
// Personal Planner & 50/30/20 Rule Types
// ==========================================

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  notes?: string;
}

export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  subCategory?: string;
}

export interface BudgetGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate?: string;
}

export interface PlannerData {
  incomeSources: IncomeSource[];
  fixedExpenses: BudgetItem[];      // 50% Necessidades (Essenciais)
  unexpectedExpenses: BudgetItem[]; // 30% Desejos (Imprevistos / Reserva de emergência imediata)
  leisureExpenses: BudgetItem[];    // 30% Desejos (Lazer / Estilo de vida / Gastos variáveis)
  investments: BudgetItem[];        // 20% Futuro (Aportes em investimentos)
  goals: BudgetGoal[];              // 20% Futuro (Aportes mensais em metas de médio/longo prazo)
}

export interface Rule503020Metrics {
  totalIncome: number;
  // Necessidades (50%)
  needsTotal: number;
  needsPct: number;
  needsTargetPct: number;
  needsTargetAmount: number;
  needsDifference: number;
  needsIsExceeded: boolean;

  // Desejos (30%)
  wantsTotal: number;
  wantsPct: number;
  wantsTargetPct: number;
  wantsTargetAmount: number;
  wantsDifference: number;
  wantsIsExceeded: boolean;

  // Futuro (20%)
  futureTotal: number;
  futurePct: number;
  futureTargetPct: number;
  futureTargetAmount: number;
  futureDifference: number;
  futureIsUnderFunded: boolean;

  // Saldo Geral
  totalCommitted: number;
  freeBalance: number;
  freeBalancePct: number;
}
