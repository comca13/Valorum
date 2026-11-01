/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Sparkles, 
  ArrowRightLeft, 
  Activity, 
  Zap, 
  HelpCircle,
  Percent
} from 'lucide-react';
import { IndicatorData, IndicatorId } from '../types/financial';
import { ChartSection } from './ChartSection';

interface TechnicalChartsSectionProps {
  selectedIndicatorId: IndicatorId;
  onSelectIndicator: (id: IndicatorId) => void;
  indicators: IndicatorData[];
}

export const TechnicalChartsSection: React.FC<TechnicalChartsSectionProps> = ({
  selectedIndicatorId,
  onSelectIndicator,
  indicators,
}) => {
  const currentIndicator = indicators.find((i) => i.id === selectedIndicatorId) || indicators[0];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-900/40 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <BarChart3 className="w-4 h-4" />
              <span>Bancada de Análise Técnica & Séries Temporais</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tendências & Gráficos Interativos
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Explore o comportamento histórico dos preços, compare dois indicadores em eixos duplos simultâneos, 
              analise a variação percentual normalizada e o coeficiente de correlação de Pearson.
            </p>
          </div>

          {/* Quick Indicator Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {indicators.map((ind) => (
              <button
                key={ind.id}
                onClick={() => onSelectIndicator(ind.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                  selectedIndicatorId === ind.id
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/80 shadow-sm ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{ind.name}</span>
                <span className="font-mono text-[11px] text-slate-400">({ind.formattedValue})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <ChartSection
        selectedIndicatorId={selectedIndicatorId}
        onSelectIndicator={onSelectIndicator}
        indicators={indicators}
      />

      {/* Educational Guide on Macro Financial Correlation */}
      <div className="bg-[#0f172a]/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Zap className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Guia de Correlação & Interpretação de Séries</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-cyan-400 font-bold">
              <span>Dólar (USD) vs Ibovespa (IBOV)</span>
              <span className="font-mono text-[11px] bg-rose-950/80 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800/40">
                Correlação Negativa (-0,6 a -0,8)
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Historicamente, quando o apetite global a risco diminui, investidores estrangeiros retiram capital da B3 (queda do Ibov) e compram dólares (alta da cotação USD/BRL).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>Dólar (USD) vs Euro (EUR)</span>
              <span className="font-mono text-[11px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/40">
                Correlação Positiva (+0,7 a +0,9)
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Frente ao Real brasileiro (BRL), moedas fortes de reserva costumam oscilar na mesma direção contra o risco fiscal ou conjuntural doméstico do Brasil.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-purple-400 font-bold">
              <span>Taxa Selic vs Ibovespa</span>
              <span className="font-mono text-[11px] bg-amber-950/80 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800/40">
                Custo de Oportunidade
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Juros reais elevados atraem recursos para o Tesouro Selic e CDBs, exigindo prêmios de risco mais altos das ações corporativas para justificar alocação na bolsa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
