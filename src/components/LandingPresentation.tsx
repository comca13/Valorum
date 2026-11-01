/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  EyeOff, 
  Sparkles, 
  Landmark, 
  DollarSign, 
  PieChart as PieIcon, 
  Activity, 
  Cloud, 
  RefreshCw, 
  ArrowUpRight,
  Layers,
  ChevronRight,
  Calculator,
  Lock,
  Globe2,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { IndicatorData } from '../types/financial';

interface LandingPresentationProps {
  indicators: IndicatorData[];
  onExplore: (tabName?: string) => void;
  onInstallPWA?: () => void;
  canInstallPWA?: boolean;
}

export const LandingPresentation: React.FC<LandingPresentationProps> = ({
  indicators,
  onExplore,
  onInstallPWA,
  canInstallPWA
}) => {
  const { user, loginWithGoogle, isLoading, cloudSync } = useAuth();
  const [activeFeatureTab, setActiveFeatureTab] = useState<number>(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        // Redireciona para o dashboard após login com sucesso
        onExplore('visao-geral');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const selicIndicator = indicators.find((i) => i.id === 'selic');
  const usdIndicator = indicators.find((i) => i.id === 'usd');
  const cdiIndicator = indicators.find((i) => i.id === 'cdi');
  const ibovIndicator = indicators.find((i) => i.id === 'ibov');

  const features = [
    {
      id: 'indicadores',
      title: 'Monitor Macro em Tempo Real',
      subtitle: 'Dólar, Euro, Selic, IPCA e Ibovespa atualizados com alertas automáticos',
      icon: Activity,
      color: 'from-blue-600 to-indigo-600',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      targetTab: 'visao-geral',
      preview: {
        headline: 'Conexão direta com dados do Banco Central e B3',
        description: 'Acompanhe as oscilações cambiais, taxas de juros e inflação sem atrasos. Configure alertas de teto e piso para ser notificado na tela com som de alerta quando os preços atingirem suas metas.',
        bullets: [
          'Alertas visuais e sonoros de teto e piso configuráveis',
          'Histórico gráfico interativo de 7 dias a 1 ano',
          'Status de atualização contínua e cache automático offline'
        ],
        stats: [
          { label: 'Dólar Comercial', value: usdIndicator ? `R$ ${usdIndicator.value.toFixed(2)}` : 'R$ 5.76', change: usdIndicator ? `${usdIndicator.change >= 0 ? '+' : ''}${usdIndicator.change.toFixed(2)}%` : '+0.32%' },
          { label: 'Taxa Selic Meta', value: selicIndicator ? `${selicIndicator.value.toFixed(2)}% a.a.` : '10.75% a.a.', change: 'Copom' },
          { label: 'Ibovespa', value: ibovIndicator ? `${ibovIndicator.value.toLocaleString('pt-BR')} pts` : '131.200 pts', change: '+0.85%' },
        ]
      }
    },
    {
      id: 'planejador',
      title: 'Planejador Familiar 50/30/20 & IA',
      subtitle: 'Controle de despesas, metas familiares e diagnóstico inteligente de gastos',
      icon: Wallet,
      color: 'from-emerald-600 to-teal-600',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      targetTab: 'planejador',
      preview: {
        headline: 'Equilíbrio financeiro baseado na comprovada regra 50/30/20',
        description: 'Cadastre múltiplas rendas familiares (titular, parceiro(a) e rendas extras) e veja automaticamente se seus gastos estão dentro dos limites recomendados de 50% Necessidades, 30% Desejos e 20% Futuro.',
        bullets: [
          'Gráfico de rosca dinâmico com limites de segurança por categoria',
          'Módulo de Inteligência Financeira que detecta gargalos de gastos',
          'Simulação de economia reinvestida a juros compostos da Selic'
        ],
        stats: [
          { label: 'Necessidades (50%)', value: 'Aluguel, Mercado, Saúde', change: 'Essenciais' },
          { label: 'Desejos (30%)', value: 'Lazer, Delivery, Viagens', change: 'Estilo de Vida' },
          { label: 'Investimentos (20%)', value: 'Reserva & Futuro', change: 'Rentabilidade' },
        ]
      }
    },
    {
      id: 'cambio',
      title: 'Mercado & Câmbio com Simulador VET',
      subtitle: 'Moedas globais, cálculo do Valor Efetivo Total com IOF e spread bancário',
      icon: DollarSign,
      color: 'from-amber-600 to-orange-600',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      targetTab: 'mercados',
      preview: {
        headline: 'Transparência total para viagens, compras e remessas internacionais',
        description: 'Descubra exatamente quanto você vai pagar em cada operação cambial. O simulador calcula o VET considerando IOF de cartão (4.38%) vs espécie/conta global (1.1%) e spread bancário ajustável.',
        bullets: [
          'Monitor de moedas: USD, EUR, GBP, JPY, CHF e Bitcoin',
          'Comparador de economia entre cartão de crédito e contas internacionais',
          'Análise de suporte, resistência e correlação cambial com a B3'
        ],
        stats: [
          { label: 'IOF Conta Global', value: '1.10%', change: 'Economia de 3.28%' },
          { label: 'IOF Cartão Crédito', value: '4.38%', change: 'Tributação Padrão' },
          { label: 'Moedas Globais', value: '6 Pares Ativos', change: 'Tempo Real' },
        ]
      }
    },
    {
      id: 'copom',
      title: 'Política Monetária & Copom (BCB)',
      subtitle: 'Cálculo de Juro Real pela Equação de Fisher e rentabilidade de Renda Fixa',
      icon: Landmark,
      color: 'from-purple-600 to-pink-600',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      targetTab: 'monetaria',
      preview: {
        headline: 'Análise de ponta das decisões do Banco Central do Brasil',
        description: 'Entenda o impacto da inflação no seu poder de compra. Calculamos o juro real exato expurgando a inflação da Selic, além de comparar a rentabilidade líquida do Tesouro Selic, CDBs, LCIs isentas e Poupança.',
        bullets: [
          'Fórmula de Fisher: (1 + Selic) / (1 + IPCA) - 1 calculada ao vivo',
          'Calendário e atas oficiais das reuniões do Copom',
          'Régua comparativa de investimentos de renda fixa com e sem IR'
        ],
        stats: [
          { label: 'Juro Real Líquido', value: '~6.35% a.a.', change: 'Alto Retorno' },
          { label: 'Próxima Reunião Copom', value: 'Acompanhamento', change: 'Decisão Selic' },
          { label: 'Comparador Renda Fixa', value: 'Tesouro vs CDI vs Poupança', change: 'Atualizado' },
        ]
      }
    },
    {
      id: 'graficos',
      title: 'Gráficos Técnicos & Correlação',
      subtitle: 'Análise técnica estatística, médias móveis e matriz de correlação histórica',
      icon: TrendingUp,
      color: 'from-cyan-600 to-blue-600',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      targetTab: 'graficos',
      preview: {
        headline: 'Visão quantitativa e correlação entre bolsa e câmbio',
        description: 'Cruze dados de diferentes indicadores na mesma escala percentual. Identifique se o Ibovespa sobe quando o dólar cai e visualize volatilidade calculada e amplitude de preços.',
        bullets: [
          'Comparação de dois indicadores simultâneos em escala normalizada',
          'Indicadores de volatilidade e amplitude mínima/máxima',
          'Exportação e alternância entre períodos de 7 dias a 12 meses'
        ],
        stats: [
          { label: 'Correlação Dólar x Bolsa', value: 'Inversa (-0.68)', change: 'Hedge Ativo' },
          { label: 'Janelas Temporais', value: '7D • 30D • 90D • 1A', change: 'Flexível' },
          { label: 'Análise Quantitativa', value: 'Média Móvel & Desvio', change: 'Precisão' },
        ]
      }
    }
  ];

  const currentFeature = features[activeFeatureTab];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Banner / Welcome Ribbon */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border-b border-emerald-500/20 py-2.5 px-4 text-xs font-medium text-center text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold border border-emerald-500/30">
            <Sparkles className="w-3 h-3" /> NOVO
          </span>
          <span>Sincronização em Nuvem com Google e Instalador PWA em qualquer tela.</span>
          <button 
            onClick={() => onExplore('visao-geral')} 
            className="text-emerald-400 hover:text-emerald-300 underline font-semibold transition ml-1"
          >
            Acessar Dashboard Direto &rarr;
          </button>
        </div>
      </div>

      {/* Main Hero Container */}
      <div className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-800/80">
        {/* Glow ambient background lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-12 left-10 w-72 h-72 bg-emerald-500/5 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 text-xs sm:text-sm font-medium mb-6 shadow-lg shadow-black/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Valorum Brasil • Hub Financeiro & Macroeconômico</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-semibold">100% Gratuito</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Inteligência Macroeconômica e{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Planejamento Familiar
            </span>{' '}
            em Suas Mãos
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Acompanhe indicadores do mercado brasileiro em tempo real, calcule o Juro Real do Copom com rigor matemático e estruture seu orçamento com a regra 50/30/20. Acesse seus dados sincronizados no celular, tablet ou computador.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            {user ? (
              <div className="w-full flex flex-col items-center gap-2">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs text-slate-300 w-full justify-center">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'Usuário'} className="w-6 h-6 rounded-full border border-emerald-400" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span>Conectado como <strong className="text-white">{user.displayName || user.email}</strong></span>
                </div>
                <button
                  onClick={() => onExplore('visao-geral')}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
                >
                  <span>Ir para meu Painel</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn || isLoading}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold shadow-xl shadow-white/10 flex items-center justify-center gap-3 transition active:scale-[0.98] border border-slate-200"
                >
                  {isLoggingIn ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-700" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  <span>Entrar com Google</span>
                </button>

                <button
                  onClick={() => onExplore('visao-geral')}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-slate-900/90 hover:bg-slate-850 text-slate-200 hover:text-white font-semibold border border-slate-700/80 transition flex items-center justify-center gap-2 hover:border-slate-600 active:scale-[0.98]"
                >
                  <span>Explorar sem Login</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </>
            )}
          </div>

          {/* Social Proof / Security Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Dados protegidos pelo Google Firebase</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span>Sincronizado entre celular e PC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Instalável como Aplicativo (PWA)</span>
            </div>
          </div>

          {/* Mini Live Indicators Bar */}
          <div className="mt-10 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-left">
              <div className="text-[10px] text-slate-400 font-medium">Dólar Comercial</div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                {usdIndicator ? `R$ ${usdIndicator.value.toFixed(2)}` : 'R$ 5.76'}
              </div>
              <div className={`text-[11px] font-semibold mt-0.5 ${usdIndicator && usdIndicator.change >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {usdIndicator ? `${usdIndicator.change >= 0 ? '+' : ''}${usdIndicator.change.toFixed(2)}%` : '+0.32%'}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-left">
              <div className="text-[10px] text-slate-400 font-medium">Taxa Selic Copom</div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                {selicIndicator ? `${selicIndicator.value.toFixed(2)}%` : '10.75%'}
              </div>
              <div className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                Meta Oficial BCB
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-left">
              <div className="text-[10px] text-slate-400 font-medium">Taxa DI (CDI Over)</div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                {cdiIndicator ? `${cdiIndicator.value.toFixed(2)}%` : '10.65%'}
              </div>
              <div className="text-[11px] font-semibold text-cyan-400 mt-0.5">
                Benchmark Renda Fixa
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-left">
              <div className="text-[10px] text-slate-400 font-medium">Ibovespa (B3)</div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                {ibovIndicator ? `${ibovIndicator.value.toLocaleString('pt-BR')} pts` : '131.200 pts'}
              </div>
              <div className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                Bolsa Brasileira
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Feature Explorer Showcase */}
      <div className="py-16 md:py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20 mb-3">
            <Layers className="w-3.5 h-3.5" /> RECURSOS DA PLATAFORMA
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white">
            Uma suíte completa para suas decisões financeiras
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Navegue pelas ferramentas abaixo para ver um resumo interativo do que cada módulo oferece.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar scroll-smooth">
          {features.map((f, index) => {
            const Icon = f.icon;
            const isSelected = activeFeatureTab === index;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFeatureTab(index)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap border shrink-0 ${
                  isSelected
                    ? 'bg-slate-800 text-white border-slate-600 shadow-md shadow-black/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{f.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Feature Showcase Box */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Description & Value Props */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${currentFeature.badgeColor}">
                <currentFeature.icon className="w-3.5 h-3.5" />
                <span>{currentFeature.title}</span>
              </div>

              <h3 className="text-xl sm:text-3xl font-extrabold text-white">
                {currentFeature.preview.headline}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {currentFeature.preview.description}
              </p>

              <div className="space-y-2.5 pt-2">
                {currentFeature.preview.bullets.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onExplore(currentFeature.targetTab)}
                  className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-[0.98]"
                >
                  <span>Abrir {currentFeature.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Live Mockup / Mini Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-xl bg-slate-950/80 border border-slate-700/60 p-5 shadow-inner space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">valorum-preview // {currentFeature.id}</span>
                </div>

                <div className="space-y-3">
                  {currentFeature.preview.stats.map((st, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">{st.label}</div>
                        <div className="text-sm font-bold text-white mt-0.5">{st.value}</div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {st.change}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Dados sincronizados em tempo real com o motor Valorum
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Cloud Sync & Google Advantage Section */}
      <div className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Cloud className="w-5 h-5" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Acesse em Qualquer Lugar</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Comece organizando o orçamento da sua família no computador e confira as metas no celular enquanto estiver no supermercado. Seus dados acompanham você.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <EyeOff className="w-5 h-5" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Modo Privacidade Instantâneo</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Use o botão ou atalho no topo para ocultar imediatamente todos os saldos e valores em reais por asteriscos (*), garantindo sigilo em locais públicos ou cafés.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Instale na Tela Inicial (PWA)</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Adicione o ícone do Valorum na tela do seu celular ou tablet sem precisar da Play Store ou App Store. Funciona offline e com carregamento instantâneo.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom CTA Box */}
      <div className="py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center w-full">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Pronto para colocar suas finanças no controle total?
          </h3>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Conecte sua conta Google para salvar suas metas e acessar de qualquer lugar, ou explore livremente sem necessidade de cadastro.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {!user ? (
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn || isLoading}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-white/10 transition active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>Conectar com Google</span>
              </button>
            ) : null}

            <button
              onClick={() => onExplore('visao-geral')}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-[0.98]"
            >
              <span>Acessar Painel Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-900 bg-slate-950 text-slate-400 text-xs text-center px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">VALORUM BRASIL</span>
            <span className="text-slate-600">|</span>
            <span>Inteligência Econômica & Orçamento Familiar</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <span>Fontes: Banco Central do Brasil • B3 • AwesomeAPI</span>
            <button 
              onClick={() => onExplore('visao-geral')} 
              className="text-emerald-400 hover:underline"
            >
              Ir ao Painel Principal
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
