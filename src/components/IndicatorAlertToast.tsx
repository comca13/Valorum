/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BellRing, 
  X, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Check
} from 'lucide-react';
import { MacroPriceAlert, IndicatorId } from '../types/financial';

interface IndicatorAlertToastProps {
  alerts: MacroPriceAlert[];
  onDismiss: (alertId: string) => void;
  onDismissAll: () => void;
  onOpenAlertModal: (indicatorId: IndicatorId) => void;
}

export const IndicatorAlertToast: React.FC<IndicatorAlertToastProps> = ({
  alerts,
  onDismiss,
  onDismissAll,
  onOpenAlertModal,
}) => {
  // Only display active & triggered alerts
  const triggeredAlerts = alerts.filter((a) => a.isActive && a.isTriggered);

  if (triggeredAlerts.length === 0) return null;

  const formatUnit = (id: IndicatorId, val: number) => {
    if (id === 'ibov') return `${Math.round(val).toLocaleString('pt-BR')} pts`;
    if (id === 'usd' || id === 'eur') return `R$ ${val.toFixed(2).replace('.', ',')}`;
    return `${val.toFixed(2).replace('.', ',')}%`;
  };

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-5 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md sm:w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Multi-alert header if more than 1 triggered */}
      {triggeredAlerts.length > 1 && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border border-amber-500/40 rounded-xl text-xs backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-2 text-amber-400 font-semibold font-mono">
            <BellRing className="w-4 h-4 animate-bounce" />
            <span>{triggeredAlerts.length} limites macroeconômicos atingidos</span>
          </div>
          <button
            onClick={onDismissAll}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px] underline"
          >
            Dispensar todos
          </button>
        </div>
      )}

      {/* Up to 3 visible toasts */}
      {triggeredAlerts.slice(0, 3).map((alert) => {
        const isCeiling = alert.type === 'ceiling';

        return (
          <div
            key={alert.id}
            className="bg-[#0b1322] border-2 border-amber-500/80 shadow-2xl shadow-amber-950/50 rounded-xl p-4 text-xs backdrop-blur-md relative overflow-hidden"
          >
            {/* Top gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <BellRing className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <span className="font-mono font-bold text-sm text-white flex items-center gap-1.5">
                    {alert.indicatorCode}
                    <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {isCeiling ? 'Teto Atingido' : 'Piso Atingido'}
                    </span>
                  </span>
                  <span className="text-slate-400 block text-[11px]">
                    {alert.indicatorName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onDismiss(alert.id)}
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                title="Dispensar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Threshold condition & current value */}
            <div className="my-2.5 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  {isCeiling ? 'Limite de Teto' : 'Limite de Piso'}
                </span>
                <span className="font-mono font-semibold text-slate-300 flex items-center gap-1">
                  {isCeiling ? (
                    <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {isCeiling ? '≥' : '≤'} {formatUnit(alert.indicatorId, alert.targetValue)}
                </span>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  Nível Atual
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {alert.triggeredValue !== undefined ? formatUnit(alert.indicatorId, alert.triggeredValue) : '-'}
                </span>
              </div>
            </div>

            {alert.note && (
              <div className="text-[11px] text-slate-400 italic mb-2.5 truncate">
                "{alert.note}"
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono">
                {alert.triggeredAt ? `Disparado às ${alert.triggeredAt}` : 'Disparado recentemente'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAlertModal(alert.indicatorId)}
                  className="px-2 py-0.5 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                >
                  Gerenciar
                </button>
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  Reconhecer
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
