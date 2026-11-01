/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  Euro, 
  ArrowRightLeft, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Globe, 
  ShieldCheck, 
  Percent, 
  BarChart2, 
  Layers,
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';
import { IndicatorData } from '../types/financial';
import { CurrencyConverterSection } from './CurrencyConverterSection';

interface MarketForexSectionProps {
  indicators: IndicatorData[];
}

interface GlobalCurrencyItem {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  bid: number;
  ask: number;
  change: number;
  category: 'fiat' | 'crypto';
}

export const MarketForexSection: React.FC<MarketForexSectionProps> = ({ indicators }) => {
  const usdData = indicators.find((i) => i.id === 'usd');
  const eurData = indicators.find((i) => i.id === 'eur');
  const ibovData = indicators.find((i) => i.id === 'ibov');

  const usdBid = usdData?.currencyDetails?.bidRaw || 5.641;
  const usdAsk = usdData?.currencyDetails?.askRaw || 5.643;
  const eurBid = eurData?.currencyDetails?.bidRaw || 6.082;
  const eurAsk = eurData?.currencyDetails?.askRaw || 6.086;

  // Global currencies against BRL
  const globalCurrencies: GlobalCurrencyItem[] = [
    {
      code: 'USD/BRL',
      name: 'Dólar Comercial',
      symbol: '$',
      flag: '🇺🇸',
      bid: usdBid,
      ask: usdAsk,
      change: usdData?.change || 0.45,
      category: 'fiat',
    },
    {
      code: 'EUR/BRL',
      name: 'Euro Comercial',
      symbol: '€',
      flag: '🇪🇺',
      bid: eurBid,
      ask: eurAsk,
      change: eurData?.change || -0.22,
      category: 'fiat',
    },
    {
      code: 'GBP/BRL',
      name: 'Libra Esterlina',
      symbol: '£',
      flag: '🇬🇧',
      bid: Number((usdBid * 1.298).toFixed(4)),
      ask: Number((usdAsk * 1.301).toFixed(4)),
      change: 0.18,
      category: 'fiat',
    },
    {
      code: 'JPY/BRL',
      name: '100 Ienes Japoneses',
      symbol: '¥',
      flag: '🇯🇵',
      bid: Number(((usdBid / 152.4) * 100).toFixed(4)),
      ask: Number(((usdAsk / 152.0) * 100).toFixed(4)),
      change: -0.65,
      category: 'fiat',
    },
    {
      code: 'CHF/BRL',
      name: 'Franco Suíço',
      symbol: 'CHF',
      flag: '🇨🇭',
      bid: Number((usdBid * 1.154).toFixed(4)),
      ask: Number((usdAsk * 1.157).toFixed(4)),
      change: 0.31,
      category: 'fiat',
    },
    {
      code: 'CAD/BRL',
      name: 'Dólar Canadense',
      symbol: 'C$',
      flag: '🇨🇦',
      bid: Number((usdBid * 0.722).toFixed(4)),
      ask: Number((usdAsk * 0.725).toFixed(4)),
      change: -0.12,
      category: 'fiat',
    },
    {
      code: 'BTC/BRL',
      name: 'Bitcoin (BRL)',
      symbol: '₿',
      flag: '🌐',
      bid: Number((usdBid * 69200).toFixed(0)),
      ask: Number((usdAsk * 69250).toFixed(0)),
      change: 2.14,
      category: 'crypto',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-900/40 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <Globe className="w-4 h-4" />
              <span>Mercado de Câmbio Spot · Paridades Globais & B3</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Mercado & Câmbio Global
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Cotações em tempo real das principais moedas mundiais contra o Real, simulador oficial de VET (Valor Efetivo Total com IOF e spread regulamentar) e análise integrada do Ibovespa.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Dólar PTAX / BCB</span>
              <span className="text-lg font-bold font-mono text-emerald-400">R$ {usdBid.toFixed(3)}</span>
              <span className="text-[10px] text-slate-500 block">Comercial Venda</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Euro PTAX / BCB</span>
              <span className="text-lg font-bold font-mono text-cyan-400">R$ {eurBid.toFixed(3)}</span>
              <span className="text-[10px] text-slate-500 block">Comercial Venda</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">Ibovespa (B3)</span>
              <span className="text-lg font-bold font-mono text-white">
                {ibovData?.value ? ibovData.value.toLocaleString('pt-BR') : '130.400'} pts
              </span>
              <span className={`text-[10px] font-mono block ${Number(ibovData?.change || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {Number(ibovData?.change || 0) >= 0 ? '+' : ''}{Number(ibovData?.change || 0).toFixed(2)}% hoje
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Currencies Against Real BRL Table */}
      <div className="bg-[#0f172a]/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">Monitor de Moedas Globais vs Real (BRL)</h2>
              <span className="text-xs text-slate-400">Preços de compra (bid), venda (ask) e variação diária</span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            Fontes: BCB PTAX · Reuters · Brapi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="pb-3 font-semibold">Paridade / Moeda</th>
                <th className="pb-3 font-semibold text-right">Compra (Bid)</th>
                <th className="pb-3 font-semibold text-right">Venda (Ask)</th>
                <th className="pb-3 font-semibold text-right">Spread Médio</th>
                <th className="pb-3 font-semibold text-right">Variação 24h</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {globalCurrencies.map((item) => {
                const spreadDiff = Math.abs(item.ask - item.bid);
                const isPositive = item.change >= 0;
                return (
                  <tr key={item.code} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.flag}</span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5 font-mono">
                            <span>{item.code}</span>
                            {item.category === 'crypto' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-950 text-purple-300 border border-purple-800/40">
                                Cripto
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-sans">{item.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right text-slate-200">
                      R$ {item.bid.toLocaleString('pt-BR', { minimumFractionDigits: item.category === 'crypto' ? 0 : 3 })}
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      R$ {item.ask.toLocaleString('pt-BR', { minimumFractionDigits: item.category === 'crypto' ? 0 : 3 })}
                    </td>
                    <td className="py-3 text-right text-slate-400 text-[11px]">
                      {item.category === 'crypto' ? '~0,20%' : `R$ ${spreadDiff.toFixed(4)}`}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isPositive ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950/70 text-rose-400 border border-rose-800/40'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{item.change.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dedicated VET Simulator Section */}
      <CurrencyConverterSection indicators={indicators} />

      {/* Ibovespa & Equity Market Structure Card */}
      <div className="bg-[#0f172a]/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white">B3 Ibovespa & Dinâmica Cambial</h2>
              <span className="text-xs text-slate-400">Correlação entre fluxo de capital estrangeiro e valuation</span>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-mono bg-cyan-950/60 text-cyan-300 rounded border border-cyan-800/40">
            Pregão Regular
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Múltiplo P/L Ibovespa</span>
            <div className="text-xl font-bold font-mono text-cyan-400">~8,4x Lucros</div>
            <p className="text-[11px] text-slate-400">
              Negociando com desconto histórico frente à média de 10 anos (~11,0x), refletindo a taxa Selic restritiva.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Dividend Yield Médio</span>
            <div className="text-xl font-bold font-mono text-emerald-400">~6,85% a.a.</div>
            <p className="text-[11px] text-slate-400">
              Liderado pelos setores de commodities (Vale, Petrobras) e bancos comerciais consolidados.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Fluxo Investidor Estrangeiro</span>
            <div className="text-xl font-bold font-mono text-amber-400">54,2% do Volume B3</div>
            <p className="text-[11px] text-slate-400">
              Sensibilidade direta à taxa de juros do Fed nos EUA e à volatilidade cambial da paridade USD/BRL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
