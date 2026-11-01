/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Power, 
  AlertTriangle,
  Plus,
  Sparkles,
  Check
} from 'lucide-react';
import { IndicatorData, IndicatorId, MacroPriceAlert, AlertType } from '../types/financial';

interface IndicatorAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  indicators: IndicatorData[];
  initialIndicatorId?: IndicatorId;
  alerts: MacroPriceAlert[];
  onSaveAlert: (alert: MacroPriceAlert) => void;
  onToggleAlert: (alertId: string) => void;
  onDeleteAlert: (alertId: string) => void;
}

export const IndicatorAlertModal: React.FC<IndicatorAlertModalProps> = ({
  isOpen,
  onClose,
  indicators,
  initialIndicatorId,
  alerts,
  onSaveAlert,
  onToggleAlert,
  onDeleteAlert,
}) => {
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<IndicatorId>('usd');
  const [alertType, setAlertType] = useState<AlertType>('ceiling');
  const [targetValue, setTargetValue] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  const currentIndicator = indicators.find((i) => i.id === selectedIndicatorId) || indicators[0];

  useEffect(() => {
    if (initialIndicatorId) {
      setSelectedIndicatorId(initialIndicatorId);
      const ind = indicators.find((i) => i.id === initialIndicatorId);
      if (ind) {
        // Suggest a realistic target (+2% for ceiling, -2% for floor)
        const factor = alertType === 'ceiling' ? 1.02 : 0.98;
        const suggested = ind.id === 'ibov' ? Math.round(ind.value * factor) : parseFloat((ind.value * factor).toFixed(2));
        setTargetValue(suggested);
      }
    }
  }, [initialIndicatorId, isOpen, indicators]);

  // When changing indicator or type, recalculate suggested value
  const handleIndicatorChange = (id: IndicatorId) => {
    setSelectedIndicatorId(id);
    const ind = indicators.find((i) => i.id === id);
    if (ind) {
      const factor = alertType === 'ceiling' ? 1.02 : 0.98;
      const suggested = ind.id === 'ibov' ? Math.round(ind.value * factor) : parseFloat((ind.value * factor).toFixed(2));
      setTargetValue(suggested);
    }
  };

  const handleTypeChange = (type: AlertType) => {
    setAlertType(type);
    if (currentIndicator) {
      const factor = type === 'ceiling' ? 1.02 : 0.98;
      const suggested = currentIndicator.id === 'ibov' 
        ? Math.round(currentIndicator.value * factor) 
        : parseFloat((currentIndicator.value * factor).toFixed(2));
      setTargetValue(suggested);
    }
  };

  if (!isOpen) return null;

  const currentVal = currentIndicator ? currentIndicator.value : 0;
  const deltaPct = currentVal > 0 ? ((targetValue - currentVal) / currentVal) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentIndicator || targetValue <= 0) return;

    const isTriggeredNow =
      alertType === 'ceiling' ? currentVal >= targetValue : currentVal <= targetValue;

    const newAlert: MacroPriceAlert = {
      id: `alert_${currentIndicator.id}_${Date.now()}`,
      indicatorId: currentIndicator.id,
      indicatorCode: currentIndicator.code,
      indicatorName: currentIndicator.name,
      type: alertType,
      targetValue: parseFloat(targetValue.toFixed(currentIndicator.id === 'ibov' ? 0 : 2)),
      note: note.trim() || undefined,
      createdAt: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isActive: true,
      isTriggered: isTriggeredNow,
      triggeredAt: isTriggeredNow ? new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : undefined,
      triggeredValue: currentVal,
    };

    onSaveAlert(newAlert);
    setNote('');
    setActiveTab('list');
  };

  const formatUnit = (id: IndicatorId, val: number) => {
    if (id === 'ibov') return `${Math.round(val).toLocaleString('pt-BR')} pts`;
    if (id === 'usd' || id === 'eur') return `R$ ${val.toFixed(2).replace('.', ',')}`;
    return `${val.toFixed(2).replace('.', ',')}% a.a.`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-[#0c1220] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Alertas de Teto e Piso Macroeconômicos</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Notificação visual ao atingir patamares configurados</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Create & Active Alerts */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/60 px-4 sm:px-5 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Configurar Novo Alerta
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Alertas Ativos</span>
            <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-mono">
              {alerts.length}
            </span>
          </button>
        </div>

        {activeTab === 'create' ? (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            {/* Indicator selection */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Indicador Macroeconômico
              </label>
              <select
                value={selectedIndicatorId}
                onChange={(e) => handleIndicatorChange(e.target.value as IndicatorId)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none cursor-pointer"
              >
                {indicators.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.code} - {ind.name} (Atual: {ind.formattedValue})
                  </option>
                ))}
              </select>
            </div>

            {/* Current Quote Badge */}
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-400">Cotação / Taxa Atual de Mercado:</span>
              <span className="font-mono font-bold text-white text-sm">
                {currentIndicator ? currentIndicator.formattedValue : '-'}
              </span>
            </div>

            {/* Threshold Type: Ceiling (Teto) vs Floor (Piso) */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Tipo de Limite de Disparo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange('ceiling')}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    alertType === 'ceiling'
                      ? 'bg-rose-500/10 border-rose-500/60 text-rose-400 ring-1 ring-rose-500/30 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  <span>Teto / Máxima (≥)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('floor')}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    alertType === 'floor'
                      ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400 ring-1 ring-emerald-500/30 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span>Piso / Mínima (≤)</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {alertType === 'ceiling'
                  ? 'Dispara quando o indicador subir e ultrapassar este teto de preço.'
                  : 'Dispara quando o indicador cair e atingir este piso de cotação.'}
              </p>
            </div>

            {/* Target Value Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Valor Limite ({currentIndicator ? currentIndicator.unit : ''})
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    deltaPct >= 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(2)}% em relação à cotação atual
                </span>
              </div>
              <input
                type="number"
                step={currentIndicator.id === 'ibov' ? '100' : '0.01'}
                required
                min="0.01"
                value={targetValue}
                onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-base text-white font-mono font-bold focus:outline-none"
              />
            </div>

            {/* Note Input */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Observação / Lembrete Estratégico (Opcional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Ponto para compra de moeda ou realizar proteção na bolsa"
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Salvar Alerta</span>
              </button>
            </div>
          </form>
        ) : (
          /* Active Alerts List */
          <div className="p-5 space-y-3 max-h-[380px] overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <Bell className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                <p>Nenhum alerta cadastrado no momento.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-3 text-cyan-400 hover:underline font-semibold cursor-pointer"
                >
                  Cadastrar o primeiro alerta
                </button>
              </div>
            ) : (
              alerts.map((alert) => {
                const isCeiling = alert.type === 'ceiling';

                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border transition-all ${
                      alert.isTriggered && alert.isActive
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-xs">
                            {alert.indicatorCode}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold ${
                              isCeiling
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {isCeiling ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{isCeiling ? 'Teto ≥' : 'Piso ≤'} {formatUnit(alert.indicatorId, alert.targetValue)}</span>
                          </span>

                          {alert.isTriggered && alert.isActive && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40 animate-pulse">
                              Atingido!
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {alert.indicatorName}
                        </span>

                        {alert.note && (
                          <span className="text-[10px] text-slate-500 italic block mt-0.5">
                            "{alert.note}"
                          </span>
                        )}
                      </div>

                      {/* Toggle & Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onToggleAlert(alert.id)}
                          title={alert.isActive ? 'Desativar alerta' : 'Ativar alerta'}
                          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            alert.isActive
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-800 border-slate-700 text-slate-500'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          title="Excluir alerta"
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('create')}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cadastrar Outro Alerta</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
