/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Landmark, 
  PieChart as PieIcon, 
  ArrowRight, 
  Bell, 
  BellRing, 
  ShieldCheck, 
  Activity, 
  Globe, 
  Sparkles,
  Layers,
  Percent,
  Smartphone
} from 'lucide-react';
import { IndicatorData, IndicatorId, MacroPriceAlert } from '../types/financial';
import { IndicatorCard } from './IndicatorCard';
import { PWAInstallButton } from './PWAInstallButton';

interface OverviewSectionProps {
  indicators: IndicatorData[];
  selectedIndicatorId: IndicatorId;
  onSelectIndicator: (id: IndicatorId) => void;
  alerts: MacroPriceAlert[];
  onOpenAlertModal: (id?: IndicatorId) => void;
  onNavigateTab: (tab: string) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  indicators,
  selectedIndicatorId,
  onSelectIndicator,
  alerts,
  onOpenAlertModal,
  onNavigateTab,
}) => {
  const selicData = indicators.find((i) => i.id === 'selic');
  const usdData = indicators.find((i) => i.id === 'usd');
  const ibovData = indicators.find((i) => i.id === 'ibov');

  const selicVal = selicData?.value || 10.75;
  const ipcaVal = 4.42;
  const realRate = ((1 + selicVal / 100) / (1 + ipcaVal / 100) - 1) * 100;

  const triggeredAlerts = alerts.filter((a) => a.isActive && a.isTriggered);

  return (
    <div className="space-y-6">
      {/* 5 Core Macro Indicators Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Principais Indicadores Macroeconômicos Brasileiros</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAlertModal()}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Gerenciar Alertas de Teto / Piso</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {indicators.map((indicator) => (
            <IndicatorCard
              key={indicator.id}
              indicator={indicator}
              isSelected={selectedIndicatorId === indicator.id}
              onSelect={(id) => onSelectIndicator(id)}
              alerts={alerts}
              onOpenAlertModal={(id) => onOpenAlertModal(id)}
            />
          ))}
        </div>
      </div>

      {/* Planejador Familiar 50/30/20 Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-purple-950/50 border border-cyan-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-900/40 text-cyan-300 border border-cyan-700/50 shrink-0">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Planejador 50/30/20 & Inteligência Financeira</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                Ativo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Termômetro 50/30/20 em tempo real, gestão de renda familiar e motor de recomendações inteligentes para cortar excessos orçamentários.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('planejador')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-sm shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <span>Abrir Planejador Familiar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Dedicated Modules Hub Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Módulos Especializados da Plataforma Valorum
          </h2>
          <span className="text-[11px] text-slate-500">
            Clique em um módulo para abrir seu painel dedicado
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Câmbio */}
          <div 
            onClick={() => onNavigateTab('mercados')}
            className="group p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg hover:shadow-emerald-950/20"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span>PTAX {usdData?.formattedValue || 'R$ 5,64'}</span>
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors mb-1">
                Mercado & Câmbio Global
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulador VET oficial com IOF e spread bancário, cotações de 7 moedas globais e análise da B3.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Acessar Câmbio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Gráficos */}
          <div 
            onClick={() => onNavigateTab('graficos')}
            className="group p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg hover:shadow-cyan-950/20"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-cyan-400">
                  Eixos Duplos & Pearson
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
                Tendências & Gráficos
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Análise técnica interativa, comparação simultânea de 2 indicadores e variação percentual normalizada.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Abrir Gráficos</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Copom */}
          <div 
            onClick={() => onNavigateTab('monetaria')}
            className="group p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg hover:shadow-amber-950/20"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40">
                  <Landmark className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-amber-400">
                  Juro Real +{realRate.toFixed(2)}%
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors mb-1">
                Política Monetária (BCB)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Painel do Copom com histórico Selic, atas do BCB, fórmula de Fisher e simulador completo de Renda Fixa.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>Ver Política BCB</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Planejador */}
          <div 
            onClick={() => onNavigateTab('planejador')}
            className="group p-4 rounded-2xl bg-[#0f172a]/80 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg hover:shadow-purple-950/20"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/40">
                  <PieIcon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-purple-400">
                  Regra 50/30/20
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors mb-1">
                Planejador Familiar
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gestão orçamentária com termômetro em tempo real, simulação Selic e IA de corte de gastos.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-400">
              <span>Planejar Finanças</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Install PWA / Add Shortcut Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0e1628] to-cyan-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Atalho na Tela Inicial (Celular, Tablet ou PC)</h3>
              <span className="px-2 py-0.2 rounded text-[10px] font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                PWA Nativo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instale como um app nativo para abrir instantaneamente em tela cheia com acesso rápido a cotações e ao planejador.
            </p>
          </div>
        </div>

        <PWAInstallButton variant="prominent" className="shrink-0 self-start sm:self-auto" />
      </div>

      {/* Macro Economic Context Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1.5">
            <Landmark className="w-4 h-4 text-amber-400" />
            <span>Política Monetária & Taxa Selic</span>
          </div>
          <p className="text-slate-400 leading-relaxed mb-2">
            A Taxa Selic Meta em {selicVal.toFixed(2)}% a.a. ancora o custo de oportunidade no Brasil, garantindo juro real atrativo de +{realRate.toFixed(2)}% a.a. para títulos públicos.
          </p>
          <div className="font-mono text-[11px] text-slate-500">
            Fonte Oficial: Banco Central do Brasil (SGS 432)
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Câmbio Efetivo, Spread & IOF</span>
          </div>
          <p className="text-slate-400 leading-relaxed mb-2">
            O VET (Valor Efetivo Total) consolida a cotação comercial pura somada ao spread bancário e às alíquotas de IOF regulamentadas pelo Banco Central.
          </p>
          <div className="font-mono text-[11px] text-slate-500">
            Regulamentação: Resolução CMN 3.691
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Ibovespa & Renda Variável</span>
          </div>
          <p className="text-slate-400 leading-relaxed mb-2">
            O principal índice acionário da B3 sintetiza o apetite a risco corporativo frente à curva de juros doméstica e à dinâmica de liquidez dos mercados globais.
          </p>
          <div className="font-mono text-[11px] text-slate-500">
            Fonte Oficial: B3 Bolsa de Valores / Brapi
          </div>
        </div>
      </div>
    </div>
  );
};
