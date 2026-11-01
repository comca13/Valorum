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
  ShieldAlert, 
  Info, 
  Percent, 
  Calculator,
  Receipt,
  HelpCircle
} from 'lucide-react';
import { IndicatorData } from '../types/financial';
import { usePrivacy } from '../context/PrivacyContext';

interface CurrencyConverterSectionProps {
  indicators: IndicatorData[];
}

export const CurrencyConverterSection: React.FC<CurrencyConverterSectionProps> = ({
  indicators,
}) => {
  const { isPrivate, maskCurrency } = usePrivacy();
  const [selectedCurrency, setSelectedCurrency] = useState<'usd' | 'eur'>('usd');
  const [operationType, setOperationType] = useState<'buy' | 'sell'>('buy'); // 'buy' = Compra de moeda estrangeira; 'sell' = Venda de moeda estrangeira
  const [foreignAmount, setForeignAmount] = useState<number>(1000); // 1000 USD ou EUR
  const [spreadPct, setSpreadPct] = useState<number>(1.5); // 1.5% spread padrão mercado
  const [iofType, setIofType] = useState<'global_account' | 'credit_card' | 'repatriation'>('global_account');

  // Find active currency indicator
  const currencyData = indicators.find((i) => i.id === selectedCurrency) || indicators.find((i) => i.id === 'usd');

  // Market quotes (fallback if live hasn't arrived)
  const bidRaw = currencyData?.currencyDetails?.bidRaw || (selectedCurrency === 'usd' ? 5.641 : 6.082);
  const askRaw = currencyData?.currencyDetails?.askRaw || (selectedCurrency === 'usd' ? 5.643 : 6.086);

  // IOF rate based on selection
  let currentIofPct = 1.1; // default conta global
  if (operationType === 'sell') {
    currentIofPct = 0.38; // retorno de recursos para o Brasil
  } else {
    if (iofType === 'global_account') currentIofPct = 1.1;
    if (iofType === 'credit_card') currentIofPct = 4.38;
  }

  // Exact Brazilian FX VET Calculation (Banco Central do Brasil standard):
  // 1. Operação de Compra (Usuário entrega BRL e adquire Moeda Estrangeira):
  // Base é a cotação Ask (Venda da Instituição)
  const buyBaseRate = askRaw;
  const buySpreadPerUnit = buyBaseRate * (spreadPct / 100);
  const buySubtotalPerUnit = buyBaseRate + buySpreadPerUnit;
  const buyIofPerUnit = buySubtotalPerUnit * (currentIofPct / 100);
  const vetBuy = buySubtotalPerUnit + buyIofPerUnit;

  const totalBuyBase = buyBaseRate * foreignAmount;
  const totalBuySpread = buySpreadPerUnit * foreignAmount;
  const totalBuyIof = buyIofPerUnit * foreignAmount;
  const totalBuyFinal = vetBuy * foreignAmount;

  // 2. Operação de Venda (Usuário entrega Moeda Estrangeira e recebe BRL):
  // Base é a cotação Bid (Compra da Instituição)
  const sellBaseRate = bidRaw;
  const sellSpreadPerUnit = sellBaseRate * (spreadPct / 100);
  const sellSubtotalPerUnit = sellBaseRate - sellSpreadPerUnit;
  const sellIofPerUnit = sellSubtotalPerUnit * (0.38 / 100);
  const vetSell = sellSubtotalPerUnit - sellIofPerUnit;

  const totalSellBase = sellBaseRate * foreignAmount;
  const totalSellSpread = sellSpreadPerUnit * foreignAmount;
  const totalSellIof = sellIofPerUnit * foreignAmount;
  const totalSellFinal = vetSell * foreignAmount;

  const currencySymbol = selectedCurrency === 'usd' ? 'US$' : '€';
  const currencyName = selectedCurrency === 'usd' ? 'Dólar Comercial' : 'Euro Comercial';

  return (
    <div className="bg-[#0f172a]/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Câmbio Comercial & VET</span>
            <span>·</span>
            <span className="font-mono text-cyan-400">Encargos & Taxas Regulatórias</span>
            <span>·</span>
            <span>Banco Central do Brasil</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>Detalhamento de Compra e Venda de Câmbio</span>
          </h2>
        </div>

        {/* Currency Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
            <button
              onClick={() => setSelectedCurrency('usd')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                selectedCurrency === 'usd'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Dólar (USD)</span>
            </button>

            <button
              onClick={() => setSelectedCurrency('eur')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                selectedCurrency === 'eur'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Euro className="w-3.5 h-3.5" />
              <span>Euro (EUR)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Quick Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        {/* Operation Selector */}
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">
            Tipo de Operação
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setOperationType('buy')}
              className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                operationType === 'buy'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Comprar {selectedCurrency.toUpperCase()}</span>
            </button>
            <button
              type="button"
              onClick={() => setOperationType('sell')}
              className={`py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                operationType === 'sell'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Vender {selectedCurrency.toUpperCase()}</span>
            </button>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {operationType === 'buy'
              ? 'Você envia Reais (BRL) e recebe moeda estrangeira.'
              : 'Você envia moeda estrangeira e recebe Reais (BRL).'}
          </span>
        </div>

        {/* Foreign Currency Amount */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300">
              Quantia Simulada ({selectedCurrency.toUpperCase()})
            </label>
            <span className="text-[10px] font-mono text-cyan-400">
              Mín: {currencySymbol} 100
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
              {currencySymbol}
            </span>
            <input
              type="number"
              step="100"
              min="1"
              value={foreignAmount}
              onChange={(e) => setForeignAmount(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg pl-10 pr-3 py-1.5 text-sm font-mono font-bold text-white focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5 mt-1.5">
            {[500, 1000, 3000, 5000].map((amt) => (
              <button
                key={amt}
                onClick={() => setForeignAmount(amt)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                  foreignAmount === amt
                    ? 'bg-slate-700 text-white border-slate-600'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {currencySymbol} {amt.toLocaleString('pt-BR')}
              </button>
            ))}
          </div>
        </div>

        {/* Spread / Conversion Fee Configuration */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300">
              Taxa de Conversão (Spread Cambial)
            </label>
            <span className="text-xs font-mono font-bold text-amber-400">
              {spreadPct.toFixed(2)}%
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4.5"
            step="0.1"
            value={spreadPct}
            onChange={(e) => setSpreadPct(parseFloat(e.target.value) || 1.5)}
            className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
          />
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
            <button
              onClick={() => setSpreadPct(1.1)}
              className={`hover:text-cyan-400 cursor-pointer ${spreadPct === 1.1 ? 'text-cyan-300 font-bold' : ''}`}
            >
              1,1% (Fintech)
            </button>
            <button
              onClick={() => setSpreadPct(1.8)}
              className={`hover:text-cyan-400 cursor-pointer ${spreadPct === 1.8 ? 'text-cyan-300 font-bold' : ''}`}
            >
              1,8% (Bancos)
            </button>
            <button
              onClick={() => setSpreadPct(3.5)}
              className={`hover:text-cyan-400 cursor-pointer ${spreadPct === 3.5 ? 'text-cyan-300 font-bold' : ''}`}
            >
              3,5% (Cartão)
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Operação de Compra (BRL -> Moeda) */}
        <div
          className={`p-5 rounded-xl border transition-all duration-200 ${
            operationType === 'buy'
              ? 'bg-[#0b1322] border-emerald-500/60 shadow-lg shadow-emerald-950/30'
              : 'bg-slate-900/50 border-slate-800/80 opacity-90'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Resultado da Operação de Compra</h4>
                <span className="text-[11px] text-slate-400">
                  Adquirindo {currencySymbol} {foreignAmount.toLocaleString('pt-BR')} com Reais
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold">
              VET COMPRA
            </span>
          </div>

          {/* Breakdown Rows */}
          <div className="py-3 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-sans">1. Cotação Comercial Base (Venda Ask)</span>
              <span className="text-slate-200">
                R$ {buyBaseRate.toFixed(4).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="font-sans">
                2. Taxa de Conversão da Instituição (+{spreadPct.toFixed(2)}% Spread)
              </span>
              <span className="text-amber-400">
                +R$ {buySpreadPerUnit.toFixed(4).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
              <span className="font-sans text-[11px] text-slate-500">Subtotal com Taxa de Conversão</span>
              <span className="text-slate-300">
                R$ {buySubtotalPerUnit.toFixed(4).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="font-sans">
                3. Encargos Tributários (+{currentIofPct.toFixed(2)}% IOF)
              </span>
              <span className="text-rose-400">
                +R$ {buyIofPerUnit.toFixed(4).replace('.', ',')}
              </span>
            </div>

            {/* VET Final Unit Cost */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-800">
              <span className="font-sans font-semibold text-white">
                VET Compra Final (Custo Efetivo por {currencySymbol} 1):
              </span>
              <span className="text-base font-bold text-emerald-400">
                R$ {vetBuy.toFixed(4).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Total Payable Box */}
          <div className="mt-3 p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold block">
                Total Final a Pagar em Reais
              </span>
              <span className="text-xs text-slate-400 font-sans">
                Para receber {currencySymbol} {foreignAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-xl font-extrabold font-mono text-white tabular-nums">
              {maskCurrency(totalBuyFinal)}
            </div>
          </div>
        </div>

        {/* Card 2: Operação de Venda (Moeda -> BRL) */}
        <div
          className={`p-5 rounded-xl border transition-all duration-200 ${
            operationType === 'sell'
              ? 'bg-[#0b1322] border-cyan-500/60 shadow-lg shadow-cyan-950/30'
              : 'bg-slate-900/50 border-slate-800/80 opacity-90'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Resultado da Operação de Venda</h4>
                <span className="text-[11px] text-slate-400">
                  Vendendo {currencySymbol} {isPrivate ? '••••••' : foreignAmount.toLocaleString('pt-BR')} para receber Reais
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
              VET VENDA
            </span>
          </div>

          {/* Breakdown Rows */}
          <div className="py-3 space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-sans">1. Cotação Comercial Base (Compra Bid)</span>
              <span className="text-slate-200">
                R$ {sellBaseRate.toFixed(4).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="font-sans">
                2. Taxa de Conversão da Instituição (-{spreadPct.toFixed(2)}% Spread)
              </span>
              <span className="text-amber-400">
                -R$ {sellSpreadPerUnit.toFixed(4).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
              <span className="font-sans text-[11px] text-slate-500">Subtotal após Taxa de Conversão</span>
              <span className="text-slate-300">
                R$ {sellSubtotalPerUnit.toFixed(4).replace('.', ',')}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="font-sans">
                3. Encargos Tributários (-0,38% IOF Retorno)
              </span>
              <span className="text-rose-400">
                -R$ {sellIofPerUnit.toFixed(4).replace('.', ',')}
              </span>
            </div>

            {/* VET Final Unit Rate */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-800">
              <span className="font-sans font-semibold text-white">
                VET Venda Final (Valor Líquido por {currencySymbol} 1):
              </span>
              <span className="text-base font-bold text-cyan-400">
                R$ {vetSell.toFixed(4).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Total Receivable Box */}
          <div className="mt-3 p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-cyan-300 font-bold block">
                Total Líquido a Receber em Reais
              </span>
              <span className="text-xs text-slate-400 font-sans">
                Ao liquidar {currencySymbol} {isPrivate ? '••••••' : foreignAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-xl font-extrabold font-mono text-white tabular-nums">
              {maskCurrency(totalSellFinal)}
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory Regulatory Footnote */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="text-slate-200 font-semibold block mb-0.5">
            O que é o VET (Valor Efetivo Total)?
          </span>
          De acordo com a regulamentação do Banco Central do Brasil (Resolução CMN nº 3.691), o VET representa o custo ou recebimento real de uma operação de câmbio por unidade de moeda estrangeira, consolidando a **taxa de câmbio comercial**, a **taxa de conversão (spread cambial da instituição)** e as **despesas com encargos fiscais (IOF)**.
        </div>
      </div>
    </div>
  );
};
