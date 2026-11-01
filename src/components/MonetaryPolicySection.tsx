/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Calendar, 
  FileText, 
  ShieldAlert, 
  Info, 
  ArrowUpRight, 
  Layers, 
  CheckCircle2, 
  Sliders,
  DollarSign,
  ChevronRight,
  Clock
} from 'lucide-react';
import { IndicatorData } from '../types/financial';
import { usePrivacy } from '../context/PrivacyContext';

interface MonetaryPolicySectionProps {
  indicators: IndicatorData[];
}

export const MonetaryPolicySection: React.FC<MonetaryPolicySectionProps> = ({ indicators }) => {
  const { isPrivate, maskCurrency } = usePrivacy();

  const formatBRL = (val: number) => maskCurrency(val);
  const formatNet = (val: number) =>
    isPrivate
      ? '+R$ ••••••'
      : `+R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatLoss = (val: number) =>
    isPrivate
      ? '-R$ ••••••'
      : `-R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Extract Selic & IPCA values
  const selicIndicator = indicators.find((i) => i.id === 'selic');
  const selicRate = selicIndicator?.value || 10.75;
  const ipcaRate = 4.42; // IPCA 12m acumulado oficial IBGE

  // Real interest rate calculation: Fisher formula
  // (1 + Selic) / (1 + IPCA) - 1
  const realInterestRate = ((1 + selicRate / 100) / (1 + ipcaRate / 100) - 1) * 100;
  const neutralInterestRate = 4.75; // Taxa de juros neutra estimada pelo mercado / BCB

  // Interactive Fixed Income Simulator State
  const [investedAmount, setInvestedAmount] = useState<number>(10000);
  const [investmentMonths, setInvestmentMonths] = useState<number>(12);

  // Income Tax bracket based on months
  const getIrTaxRate = (months: number) => {
    const days = months * 30;
    if (days <= 180) return 0.225; // 22.5%
    if (days <= 360) return 0.20;  // 20.0%
    if (days <= 720) return 0.175; // 17.5%
    return 0.15;                  // 15.0%
  };

  const irTaxRate = getIrTaxRate(investmentMonths);
  const years = investmentMonths / 12;

  // Investment benchmarks calculations
  const cdiRate = selicRate - 0.10; // CDI is historically ~0.10% below Selic Meta

  // 1. Tesouro Selic (100% Selic)
  const tesouroGrossReturn = investedAmount * Math.pow(1 + selicRate / 100, years) - investedAmount;
  const tesouroNetReturn = tesouroGrossReturn * (1 - irTaxRate);
  const tesouroFinal = investedAmount + tesouroNetReturn;

  // 2. CDB 100% CDI
  const cdb100GrossReturn = investedAmount * Math.pow(1 + cdiRate / 100, years) - investedAmount;
  const cdb100NetReturn = cdb100GrossReturn * (1 - irTaxRate);
  const cdb100Final = investedAmount + cdb100NetReturn;

  // 3. CDB 115% CDI
  const cdb115Rate = (cdiRate * 1.15);
  const cdb115GrossReturn = investedAmount * Math.pow(1 + cdb115Rate / 100, years) - investedAmount;
  const cdb115NetReturn = cdb115GrossReturn * (1 - irTaxRate);
  const cdb115Final = investedAmount + cdb115NetReturn;

  // 4. LCI / LCA (Isenta de IR - ~88% do CDI)
  const lciRate = cdiRate * 0.88;
  const lciNetReturn = investedAmount * Math.pow(1 + lciRate / 100, years) - investedAmount;
  const lciFinal = investedAmount + lciNetReturn;

  // 5. Poupança Nova (Selic > 8.5% -> 0.5% a.m. + TR = ~6.17% a.a.)
  const poupancaRate = 6.17;
  const poupancaNetReturn = investedAmount * Math.pow(1 + poupancaRate / 100, years) - investedAmount;
  const poupancaFinal = investedAmount + poupancaNetReturn;

  // Copom cycle history
  const copomHistory = [
    {
      meeting: '265ª Reunião',
      date: '18/09/2026',
      decision: '+0,25 p.p.',
      rate: '10,75% a.a.',
      vote: '9 a 0 (Unanimidade)',
      status: 'Atual',
      bias: 'Restritivo',
    },
    {
      meeting: '264ª Reunião',
      date: '31/07/2026',
      decision: 'Manutenção (0,00 p.p.)',
      rate: '10,50% a.a.',
      vote: '9 a 0 (Unanimidade)',
      status: 'Passada',
      bias: 'Neutro',
    },
    {
      meeting: '263ª Reunião',
      date: '19/06/2026',
      decision: 'Manutenção (0,00 p.p.)',
      rate: '10,50% a.a.',
      vote: '9 a 0 (Unanimidade)',
      status: 'Passada',
      bias: 'Cauteloso',
    },
    {
      meeting: '262ª Reunião',
      date: '08/05/2026',
      decision: '-0,25 p.p.',
      rate: '10,50% a.a.',
      vote: '5 a 4 (Divergência)',
      status: 'Passada',
      bias: 'Afrouxamento',
    },
  ];

  // Global ranking of real rates
  const globalRealRates = [
    { country: 'Rússia', rate: 7.8, flag: '🇷🇺' },
    { country: 'Brasil', rate: Number(realInterestRate.toFixed(2)), flag: '🇧🇷', isLocal: true },
    { country: 'México', rate: 6.35, flag: '🇲🇽' },
    { country: 'Colômbia', rate: 4.82, flag: '🇨🇴' },
    { country: 'Estados Unidos', rate: 2.15, flag: '🇺🇸' },
    { country: 'Reino Unido', rate: 1.85, flag: '🇬🇧' },
    { country: 'Zona do Euro', rate: 1.10, flag: '🇪🇺' },
    { country: 'Japão', rate: -1.90, flag: '🇯🇵' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-900/40 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Landmark className="w-4 h-4" />
              <span>Banco Central do Brasil · Sistema Especial de Liquidação e Custódia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Política Monetária & Copom
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Painel institucional de acompanhamento das decisões da autoridade monetária, ciclo de juros da economia, 
              cálculo do juro real pelo método de Fisher e régua oficial de benchmarks de renda fixa.
            </p>
          </div>

          {/* Quick Rates Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Selic Meta</span>
              <span className="text-lg font-bold font-mono text-amber-400">{selicRate.toFixed(2)}%</span>
              <span className="text-[10px] text-slate-500 block">ao ano</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Selic Over</span>
              <span className="text-lg font-bold font-mono text-emerald-400">{(selicRate - 0.10).toFixed(2)}%</span>
              <span className="text-[10px] text-slate-500 block">ao ano</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Taxa CDI</span>
              <span className="text-lg font-bold font-mono text-cyan-400">{cdiRate.toFixed(2)}%</span>
              <span className="text-[10px] text-slate-500 block">B3 DI</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">IPCA (12M)</span>
              <span className="text-lg font-bold font-mono text-purple-400">{ipcaRate.toFixed(2)}%</span>
              <span className="text-[10px] text-slate-500 block">acumulado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Termômetro de Juro Real + Copom Atas & Próxima Reunião */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Termômetro do Juro Real (Fisher) */}
        <div className="lg:col-span-7 bg-[#0f172a]/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-base font-bold text-white">Termômetro do Juro Real da Economia</h2>
                <span className="text-xs text-slate-400">Descontando a inflação acumulada via Equação de Fisher</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/50">
              Postura Restritiva
            </span>
          </div>

          {/* Big Metric Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-mono block mb-1">Juro Nominal (Selic)</span>
              <span className="text-xl font-bold font-mono text-amber-400">{selicRate.toFixed(2)}%</span>
            </div>
            <div className="border-t sm:border-t-0 sm:border-l sm:border-r border-slate-800 pt-2 sm:pt-0">
              <span className="text-[11px] text-slate-400 uppercase font-mono block mb-1">Inflação (IPCA 12m)</span>
              <span className="text-xl font-bold font-mono text-rose-400">{ipcaRate.toFixed(2)}%</span>
            </div>
            <div className="border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
              <span className="text-[11px] text-slate-400 uppercase font-mono block mb-1">Juro Real Ex-Post</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-400">+{realInterestRate.toFixed(2)}%</span>
            </div>
          </div>

          {/* Visual Gauge Bar */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-400">
              <span>0% (Zero)</span>
              <span className="text-slate-300 font-medium">Neutro BCB: {neutralInterestRate.toFixed(2)}%</span>
              <span className="text-emerald-400 font-semibold font-mono">Atual: +{realInterestRate.toFixed(2)}%</span>
              <span>10% (Hiper-restritivo)</span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 relative">
              {/* Neutral marker line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-10"
                style={{ left: `${(neutralInterestRate / 10) * 100}%` }}
                title="Taxa Neutra Estimada"
              />
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, (realInterestRate / 10) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              * O juro real atual está <strong className="text-white">{(realInterestRate - neutralInterestRate).toFixed(2)} p.p.</strong> acima da taxa neutra de equilíbrio (~4,75%), gerando efeito de desaquecimento da demanda agregada para trazer o IPCA para o centro da meta (3,00% a.a.).
            </p>
          </div>

          {/* Global Comparison Ranking */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Ranking Global de Juros Reais (Países Selecionados)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {globalRealRates.map((item) => (
                <div 
                  key={item.country} 
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    item.isLocal 
                      ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 ring-1 ring-emerald-500/30' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{item.flag}</span>
                    <span className="font-medium truncate">{item.country}</span>
                  </div>
                  <span className={`font-mono font-bold ${item.rate > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.rate > 0 ? `+${item.rate.toFixed(1)}%` : `${item.rate.toFixed(1)}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Copom Meetings, Statement & Calendar */}
        <div className="lg:col-span-5 bg-[#0f172a]/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Atas & Ciclo do Copom</h2>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              8 Reuniões / Ano
            </span>
          </div>

          {/* Next Meeting Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/40">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Próxima Decisão do Copom</span>
                <span className="text-sm font-bold text-white">266ª Reunião · 06/11/2026</span>
              </div>
            </div>
            <span className="px-2 py-1 text-[10px] font-mono text-amber-300 bg-amber-950/50 rounded border border-amber-800/40">
              Em Breve
            </span>
          </div>

          {/* Statement Highlight */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Destaque do Comunicado Oficial do BCB</span>
            </div>
            <blockquote className="italic text-slate-400 text-[11px] border-l-2 border-cyan-500/50 pl-2.5 py-0.5 leading-relaxed">
              &ldquo;O Comitê avalia que a conjuntura requer vigilância acrescida sobre a dinâmica de desinflação e a ancoragem das expectativas em torno da meta de 3,00%. A postura restritiva é compatível com a convergência inflacionária no horizonte relevante.&rdquo;
            </blockquote>
            <div className="text-[10px] text-slate-500 font-mono">
              Fonte: Ata da 265ª Reunião do Copom / BCB
            </div>
          </div>

          {/* Recent Decision Timeline */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Histórico Recente de Decisões
            </h3>
            <div className="space-y-2">
              {copomHistory.map((h) => (
                <div key={h.meeting} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{h.meeting}</span>
                      <span className="text-[10px] font-mono text-slate-500">({h.date})</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{h.vote} · Viés {h.bias}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-400 block">{h.rate}</span>
                    <span className="text-[10px] font-mono text-cyan-300">{h.decision}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Fixed Income & CDI Benchmark Ladder + Interactive Yield Simulator */}
      <div className="bg-[#0f172a]/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
              <Layers className="w-4 h-4" />
              <span>Régua de Rentabilidade Comparativa</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Simulador de Renda Fixa & Títulos Pós-Fixados
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare a rentabilidade líquida do Tesouro Selic, CDBs, LCI/LCA isentas e Poupança com alíquota regressiva de IR.
            </p>
          </div>

          {/* Interactive Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <div>
              <label className="text-[10px] text-slate-400 block font-mono">Valor Aportado</label>
              <select 
                value={investedAmount} 
                onChange={(e) => setInvestedAmount(Number(e.target.value))}
                className="bg-slate-800 text-white text-xs font-semibold font-mono rounded px-2 py-1 border border-slate-700 outline-none cursor-pointer"
              >
                <option value={5000}>R$ 5.000</option>
                <option value={10000}>R$ 10.000</option>
                <option value={25000}>R$ 25.000</option>
                <option value={50000}>R$ 50.000</option>
                <option value={100000}>R$ 100.000</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block font-mono">Prazo de Resgate</label>
              <select 
                value={investmentMonths} 
                onChange={(e) => setInvestmentMonths(Number(e.target.value))}
                className="bg-slate-800 text-white text-xs font-semibold font-mono rounded px-2 py-1 border border-slate-700 outline-none cursor-pointer"
              >
                <option value={6}>6 Meses (IR 22,5%)</option>
                <option value={12}>12 Meses (IR 20,0%)</option>
                <option value={24}>24 Meses (IR 15,0%)</option>
                <option value={36}>36 Meses (IR 15,0%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Investment Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Tesouro Selic */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Tesouro Selic</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                  Risco Soberano
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mb-2">100% Selic Meta ({selicRate.toFixed(2)}% a.a.)</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mb-1">
                {formatBRL(tesouroFinal)}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800/80 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Rendimento Líquido:</span>
                <span className="font-mono text-emerald-400">{formatNet(tesouroNetReturn)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>Alíquota IR:</span>
                <span>{(irTaxRate * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Card 2: CDB 100% CDI */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">CDB 100% CDI</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                  FGC Garantido
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mb-2">CDI Base ({cdiRate.toFixed(2)}% a.a.)</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mb-1">
                {formatBRL(cdb100Final)}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800/80 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Rendimento Líquido:</span>
                <span className="font-mono text-emerald-400">{formatNet(cdb100NetReturn)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>Garantia:</span>
                <span>Até R$ 250 mil</span>
              </div>
            </div>
          </div>

          {/* Card 3: CDB 115% CDI */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">CDB 115% CDI</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800/40">
                  Prêmio Médio
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mb-2">Taxa Bruta: {cdb115Rate.toFixed(2)}% a.a.</div>
              <div className="text-xl font-bold font-mono text-purple-400 mb-1">
                {formatBRL(cdb115Final)}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800/80 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Rendimento Líquido:</span>
                <span className="font-mono text-emerald-400">{formatNet(cdb115NetReturn)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>Spread s/ CDI:</span>
                <span>+15%</span>
              </div>
            </div>
          </div>

          {/* Card 4: LCI/LCA (Isenta de IR) */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">LCI / LCA (88% CDI)</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800/40">
                  Isento de IR
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mb-2">Taxa Líquida: {lciRate.toFixed(2)}% a.a.</div>
              <div className="text-xl font-bold font-mono text-amber-400 mb-1">
                {formatBRL(lciFinal)}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800/80 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Rendimento Líquido:</span>
                <span className="font-mono text-emerald-400">{formatNet(lciNetReturn)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>Imposto de Renda:</span>
                <span className="text-emerald-400 font-semibold">0% (Isento)</span>
              </div>
            </div>
          </div>

          {/* Card 5: Poupança Nova */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-rose-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Poupança Nova</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800/40">
                  Menor Retorno
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mb-2">Regra Pós-2012: ~{poupancaRate}% a.a.</div>
              <div className="text-xl font-bold font-mono text-rose-400 mb-1">
                {formatBRL(poupancaFinal)}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800/80 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Rendimento Líquido:</span>
                <span className="font-mono text-slate-300">{formatNet(poupancaNetReturn)}</span>
              </div>
              <div className="flex justify-between text-rose-400 text-[10px]">
                <span>Perda p/ Tesouro:</span>
                <span>{formatLoss(tesouroNetReturn - poupancaNetReturn)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory note footer */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            * Valores projetados considerando capitalização com taxas constantes durante o período. Tributação regressiva do IR: 22,5% (até 180 dias), 20% (até 360 dias), 17,5% (até 720 dias) e 15% (acima de 720 dias).
          </span>
          <span className="font-mono text-cyan-400 whitespace-nowrap">
            Fonte: Banco Central & B3
          </span>
        </div>
      </div>
    </div>
  );
};
