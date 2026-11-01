/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  Euro, 
  Percent, 
  Activity, 
  Landmark, 
  ChevronRight,
  Bell,
  BellRing
} from 'lucide-react';
import { IndicatorData, MacroPriceAlert } from '../types/financial';

interface IndicatorCardProps {
  indicator: IndicatorData;
  isSelected: boolean;
  onSelect: (id: IndicatorData['id']) => void;
  alerts?: MacroPriceAlert[];
  onOpenAlertModal?: (id: IndicatorData['id']) => void;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({
  indicator,
  isSelected,
  onSelect,
  alerts = [],
  onOpenAlertModal,
}) => {
  const isPositive = indicator.changePct > 0;
  const isNegative = indicator.changePct < 0;
  const isZero = indicator.changePct === 0;

  // Find alerts configured for this specific indicator
  const indicatorAlerts = alerts.filter((a) => a.indicatorId === indicator.id && a.isActive);
  const triggeredAlert = indicatorAlerts.find((a) => a.isTriggered);
  const hasActiveAlert = indicatorAlerts.length > 0;

  // Icon selector based on indicator id
  const renderIcon = () => {
    switch (indicator.id) {
      case 'ibov':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'usd':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'eur':
        return <Euro className="w-4 h-4 text-blue-400" />;
      case 'selic':
        return <Landmark className="w-4 h-4 text-amber-400" />;
      case 'cdi':
        return <Percent className="w-4 h-4 text-purple-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(indicator.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(indicator.id);
        }
      }}
      className={`group relative text-left p-4 sm:p-5 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        triggeredAlert
          ? 'bg-amber-950/20 border-amber-500/80 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50'
          : isSelected
          ? 'bg-slate-900/90 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
          : 'bg-[#0f172a]/70 hover:bg-[#131d33] border-slate-800/80 hover:border-slate-700/90'
      }`}
    >
      {/* Top Header: Title, Icon and Alert Action */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
            {renderIcon()}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-300 block leading-tight">
              {indicator.name}
            </span>
            <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">
              {indicator.code}
            </span>
          </div>
        </div>

        {/* Right Header: Alert Bell & Live/Cache Status */}
        <div className="flex items-center gap-1.5">
          {onOpenAlertModal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAlertModal(indicator.id);
              }}
              title={
                triggeredAlert
                  ? `Alerta disparado: ${triggeredAlert.type === 'ceiling' ? 'Teto ≥' : 'Piso ≤'} ${triggeredAlert.targetValue}`
                  : hasActiveAlert
                  ? `${indicatorAlerts.length} alerta(s) de preço configurado(s)`
                  : `Configurar alerta de teto ou piso para ${indicator.code}`
              }
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                triggeredAlert
                  ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                  : hasActiveAlert
                  ? 'bg-cyan-500/10 text-cyan-300'
                  : 'text-slate-500 hover:text-slate-300 opacity-60 group-hover:opacity-100 hover:bg-slate-800'
              }`}
            >
              {triggeredAlert ? (
                <BellRing className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              ) : (
                <Bell className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Live or Cache source marker */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                indicator.source === 'live' ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span className="text-[10px] text-slate-400">
              {indicator.source === 'live' ? 'Live' : 'B3/BCB'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-2.5">
        <div className="text-2xl sm:text-[26px] font-bold text-white tracking-tight font-mono tabular-nums leading-none">
          {indicator.formattedValue}
        </div>
      </div>

      {/* Variation & Sub-indicators */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/70 text-xs">
        {/* Daily Change Badge */}
        <div
          className={`flex items-center gap-1 font-mono tabular-nums text-xs font-semibold ${
            isPositive
              ? 'text-emerald-400'
              : isNegative
              ? 'text-rose-400'
              : 'text-slate-400'
          }`}
        >
          {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
          {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
          {isZero && <Minus className="w-3.5 h-3.5" />}
          <span>
            {indicator.changePct > 0 ? '+' : ''}
            {indicator.changePct.toFixed(2).replace('.', ',')}%
          </span>
          <span className="text-slate-500 text-[11px] font-normal font-sans ml-0.5">hoje</span>
        </div>

        {/* Selected indication trigger */}
        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-cyan-400 transition-colors">
          <span>{isSelected ? 'Em foco' : 'Gráfico'}</span>
          <ChevronRight className={`w-3 h-3 transition-transform ${isSelected ? 'rotate-90 text-cyan-400' : ''}`} />
        </div>
      </div>

      {/* Triggered or Active Alert Status Banner */}
      {triggeredAlert ? (
        <div className="mt-2.5 pt-2 border-t border-amber-500/30 flex items-center justify-between text-[11px] font-mono text-amber-300">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>{triggeredAlert.type === 'ceiling' ? 'Teto Atingido:' : 'Piso Atingido:'}</span>
          </span>
          <span className="font-bold">
            {triggeredAlert.type === 'ceiling' ? '≥' : '≤'} {triggeredAlert.targetValue}
          </span>
        </div>
      ) : hasActiveAlert ? (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Bell className="w-3 h-3 text-cyan-400" />
            <span>Alerta Ativo:</span>
          </span>
          <span className="text-slate-300">
            {indicatorAlerts[0].type === 'ceiling' ? 'Teto ≥' : 'Piso ≤'} {indicatorAlerts[0].targetValue}
          </span>
        </div>
      ) : null}

      {/* If currency, show exact buy/sell with charges and conversion fee */}
      {indicator.currencyDetails && !triggeredAlert ? (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 font-sans text-[10px]">Compra (c/ Encargos):</span>
            <span className="font-bold text-emerald-400">
              R$ {indicator.currencyDetails.vetBuy.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 font-sans text-[10px]">Venda (c/ Encargos):</span>
            <span className="font-bold text-cyan-400">
              R$ {indicator.currencyDetails.vetSell.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-sans truncate">
            Base: {indicator.currencyDetails.bidRaw.toFixed(3)} / {indicator.currencyDetails.askRaw.toFixed(3)} · IOF+Taxa
          </div>
        </div>
      ) : !triggeredAlert && !hasActiveAlert && indicator.subValue ? (
        <div className="mt-2 text-[11px] text-slate-400 truncate font-mono">
          {indicator.subValue}
        </div>
      ) : null}
    </div>
  );
};
