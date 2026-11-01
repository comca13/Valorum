/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  RefreshCw, 
  ShieldCheck, 
  Clock,
  Bell,
  BellRing,
  Eye,
  EyeOff,
  Sparkles,
  Cloud,
  LogOut,
  User as UserIcon,
  HelpCircle
} from 'lucide-react';
import { MacroPriceAlert } from '../types/financial';
import { usePrivacy } from '../context/PrivacyContext';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lastUpdated: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
  liveStatus: 'connected' | 'updating' | 'cached';
  alerts?: MacroPriceAlert[];
  onOpenAlertModal?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  lastUpdated,
  isRefreshing,
  onRefresh,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  liveStatus,
  alerts = [],
  onOpenAlertModal,
}) => {
  const triggeredCount = alerts.filter((a) => a.isActive && a.isTriggered).length;
  const activeAlertCount = alerts.filter((a) => a.isActive).length;
  const { isPrivate, togglePrivacy } = usePrivacy();
  const { user, loginWithGoogle, logout, cloudSync } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginClick = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar - Strict 3-zone contract with responsive density */}
      <header className="sticky top-0 z-40 bg-[#0c1220]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 md:gap-8">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20 shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <button
            onClick={() => setActiveTab('visao-geral')}
            className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
          >
            VALORUM <span className="text-cyan-400 font-medium text-[10px] sm:text-xs ml-0.5 sm:ml-1 tracking-widest uppercase">BRL</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('apresentacao')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
              activeTab === 'apresentacao'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold'
                : 'text-indigo-400/90 hover:text-indigo-300 border-indigo-500/20 bg-indigo-500/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Apresentação</span>
          </button>

          <button
            onClick={() => setActiveTab('visao-geral')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeTab === 'visao-geral' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Visão Geral
          </button>

          <button
            onClick={() => setActiveTab('planejador')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'planejador' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            <span>Planejador 50/30/20</span>
          </button>

          <button
            onClick={() => setActiveTab('mercados')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeTab === 'mercados' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Mercados & Câmbio
          </button>

          <button
            onClick={() => setActiveTab('graficos')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeTab === 'graficos' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Tendências & Gráficos
          </button>

          <button
            onClick={() => setActiveTab('monetaria')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white cursor-pointer ${
              activeTab === 'monetaria' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Política Monetária (BCB)
          </button>
        </nav>

        {/* Zone 3: Primary Action + Real-time Controls + User Google Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 font-mono tabular-nums mr-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{lastUpdated ? `Atualizado ${lastUpdated}` : 'Sincronizando...'}</span>
          </div>

          {/* Privacy Mode Toggle */}
          <button
            onClick={togglePrivacy}
            title={
              isPrivate
                ? "Modo Privacidade ATIVO (Valores sensíveis ocultos). Clique ou pressione 'H' para exibir valores"
                : "Modo Privacidade DESATIVADO. Clique ou pressione 'H' para ocultar valores sensíveis em locais públicos"
            }
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer min-h-[36px] ${
              isPrivate
                ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/30'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
            }`}
          >
            {isPrivate ? (
              <EyeOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className="hidden sm:inline">
              {isPrivate ? 'Oculto' : 'Privacidade'}
            </span>
            <span
              className={`hidden md:inline px-1 py-0.2 text-[9px] font-mono rounded border ${
                isPrivate
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700/50'
                  : 'bg-slate-900/70 text-slate-400 border-slate-700/50'
              }`}
            >
              H
            </span>
          </button>

          {/* Alert Center Trigger */}
          {onOpenAlertModal && (
            <button
              onClick={onOpenAlertModal}
              title={
                triggeredCount > 0
                  ? `${triggeredCount} alerta(s) de meta atingido(s)! Clique para ver`
                  : activeAlertCount > 0
                  ? `${activeAlertCount} alerta(s) de meta ativo(s)`
                  : 'Configurar alertas de teto ou piso'
              }
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer min-h-[36px] ${
                triggeredCount > 0
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 ring-1 ring-amber-500/40'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
              }`}
            >
              {triggeredCount > 0 ? (
                <BellRing className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              ) : (
                <Bell className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <span className="hidden sm:inline">Alertas</span>
              {triggeredCount > 0 ? (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold font-mono flex items-center justify-center animate-pulse">
                  {triggeredCount}
                </span>
              ) : activeAlertCount > 0 ? (
                <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[10px] font-mono flex items-center justify-center">
                  {activeAlertCount}
                </span>
              ) : null}
            </button>
          )}

          {/* Auto Refresh Toggle */}
          <button
            onClick={onToggleAutoRefresh}
            title={autoRefreshEnabled ? 'Atualização automática ativa (a cada 60s)' : 'Atualização automática pausada'}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer min-h-[36px] ${
              autoRefreshEnabled
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                autoRefreshEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span className="whitespace-nowrap">Auto 60s</span>
          </button>

          {/* Create Shortcut / Install PWA Button */}
          <PWAInstallButton />

          {/* Refresh Data Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700/80 rounded-lg transition-all shadow-sm disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer min-h-[36px]"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-cyan-400 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>

          {/* Google Login & User Cloud Sync Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-500/80 transition cursor-pointer min-h-[36px]"
                title={`Conectado como ${user.displayName || user.email} (Sincronizado na Nuvem)`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-6 h-6 rounded-full border border-emerald-400 shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[11px] font-bold text-white max-w-[100px] truncate leading-tight">
                    {user.displayName?.split(' ')[0] || 'Usuário'}
                  </span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1 leading-tight">
                    <Cloud className="w-2.5 h-2.5" />
                    <span>Nuvem Ativa</span>
                  </span>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="border-b border-slate-800 pb-2.5 mb-2.5">
                    <div className="text-xs font-bold text-white truncate">
                      {user.displayName || 'Usuário Google'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {user.email}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                      <Cloud className="w-3 h-3" />
                      <span>Dados sincronizados em tempo real</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => {
                        setActiveTab('apresentacao');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-2 cursor-pointer transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Ver Apresentação do Site</span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-950/40 text-rose-300 flex items-center gap-2 cursor-pointer transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Desconectar Conta Google</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLoginClick}
              disabled={isLoggingIn}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition active:scale-[0.98] border border-slate-200 cursor-pointer min-h-[36px]"
              title="Faça login com sua Conta Google para acessar seus dados em qualquer celular, tablet ou PC"
            >
              {isLoggingIn ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-700" />
              ) : (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span className="hidden sm:inline">Entrar</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}

        </div>
      </header>

      {/* Sub-header Market Status Bar */}
      <div className="bg-[#0f172a]/60 border-b border-slate-800/60 px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">B3 & Mercados:</span>
            <span className="text-slate-300 font-mono">Bolsa Aberta (10h-17h BSB)</span>
          </div>
          <span className="hidden md:inline text-slate-600">·</span>
          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>APIs Oficiais: AwesomeAPI, Banco Central SGS & Brapi</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          {user && (
            <span className="text-[11px] text-emerald-400/90 font-medium hidden sm:flex items-center gap-1">
              <Cloud className="w-3 h-3" />
              <span>Sincronizado na Nuvem</span>
            </span>
          )}
          <span className="text-slate-500 font-mono">Status da Conexão:</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {liveStatus === 'connected' ? 'Tempo Real Ativo' : liveStatus === 'updating' ? 'Sincronizando' : 'Dados em Cache'}
          </span>
        </div>
      </div>

      {/* Privacy Mode Active Notification Banner */}
      {isPrivate && (
        <div className="bg-amber-950/40 border-b border-amber-800/50 px-3 sm:px-6 md:px-8 py-2 flex items-center justify-between gap-2.5 text-xs text-amber-200 animate-in fade-in transition-all">
          <div className="flex items-center gap-2 min-w-0">
            <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate sm:whitespace-normal">
              <strong>Modo Privacidade:</strong> Valores sensíveis ocultos por asteriscos.
            </span>
            <span className="hidden md:inline text-amber-400/80 font-mono text-[11px]">
              (Atalho: <strong>H</strong>)
            </span>
          </div>
          <button
            onClick={togglePrivacy}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40 text-[11px] cursor-pointer whitespace-nowrap transition-colors shrink-0"
          >
            Exibir (H)
          </button>
        </div>
      )}

      {/* Mobile Tab Navigation Bar - Segmented Control with Touch Target Math */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto px-3 sm:px-6 py-2 bg-[#0c1220] border-b border-slate-800 text-xs font-medium text-slate-400 no-scrollbar touch-pan-x">
        <button
          onClick={() => setActiveTab('apresentacao')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer min-h-[36px] flex items-center gap-1 ${
            activeTab === 'apresentacao' 
              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/80 shadow-sm font-semibold' 
              : 'text-indigo-400 hover:text-indigo-200 hover:bg-indigo-900/30'
          }`}
        >
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Apresentação</span>
        </button>
        <button
          onClick={() => setActiveTab('visao-geral')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer min-h-[36px] flex items-center ${
            activeTab === 'visao-geral' 
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm font-semibold' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('planejador')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer min-h-[36px] flex items-center ${
            activeTab === 'planejador' 
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm font-semibold' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          Planejador 50/30/20
        </button>
        <button
          onClick={() => setActiveTab('mercados')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer min-h-[36px] flex items-center ${
            activeTab === 'mercados' 
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm font-semibold' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          Mercados & Câmbio
        </button>
        <button
          onClick={() => setActiveTab('graficos')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer min-h-[36px] flex items-center ${
            activeTab === 'graficos' 
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm font-semibold' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          Tendências
        </button>
        <button
          onClick={() => setActiveTab('monetaria')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-all cursor-pointer min-h-[36px] flex items-center ${
            activeTab === 'monetaria' 
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm font-semibold' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          Política BCB
        </button>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {children}
      </main>

      {/* Clean quiet footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-6 px-3 sm:px-6 lg:px-8 mt-12 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <span className="text-slate-400 font-semibold tracking-wide">VALORUM</span>
          <span>·</span>
          <span>Painel Financeiro BRL</span>
          <span>·</span>
          <span>Indicadores Macroeconômicos & Mercado Financeiro</span>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-4 text-slate-500">
          <button 
            onClick={() => setActiveTab('apresentacao')} 
            className="text-indigo-400 hover:underline cursor-pointer"
          >
            Apresentação da Plataforma
          </button>
          <span>·</span>
          <span>AwesomeAPI (Câmbio)</span>
          <span>·</span>
          <span>BCB SGS (Selic & CDI)</span>
          <span>·</span>
          <span>B3 / Brapi</span>
        </div>
      </footer>

      {/* Connectivity & Offline State Indicator */}
      <OfflineIndicator />
    </div>
  );
};
