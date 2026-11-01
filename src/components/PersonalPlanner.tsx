/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  Users, 
  Plus, 
  Trash2, 
  Info, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Home, 
  Sparkles, 
  PiggyBank, 
  ShieldAlert, 
  HelpCircle,
  RotateCcw,
  Wallet,
  ArrowUpRight,
  Target,
  Cloud,
  Check
} from 'lucide-react';
import { 
  PlannerData, 
  IncomeSource, 
  BudgetItem, 
  BudgetGoal, 
  Rule503020Metrics, 
  IndicatorData 
} from '../types/financial';
import { FinancialIntelligence } from './FinancialIntelligence';
import { usePrivacy } from '../context/PrivacyContext';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'valorum_personal_planner_v1';

// Dados padrão realistas de uma família brasileira
const DEFAULT_PLANNER_DATA: PlannerData = {
  incomeSources: [
    { id: 'inc_1', name: 'Salário Titular (Líquido)', amount: 5500, notes: 'Empresa CLT' },
    { id: 'inc_2', name: 'Renda Cônjuge / Parceiro(a)', amount: 3200, notes: 'PJ / Mensal' },
    { id: 'inc_3', name: 'Renda Extra & Freelances', amount: 800, notes: 'Projetos adicionais' },
  ],
  fixedExpenses: [
    { id: 'fix_1', name: 'Aluguel / Financiamento & Condomínio', amount: 2300, subCategory: 'Moradia' },
    { id: 'fix_2', name: 'Supermercado Essencial & Feira', amount: 1200, subCategory: 'Alimentação' },
    { id: 'fix_3', name: 'Energia, Água, Gás & Internet', amount: 550, subCategory: 'Utilidades' },
    { id: 'fix_4', name: 'Plano de Saúde & Medicamentos Contínuos', amount: 480, subCategory: 'Saúde' },
    { id: 'fix_5', name: 'Transporte / Combustível Essencial', amount: 350, subCategory: 'Mobilidade' },
  ],
  leisureExpenses: [
    { id: 'lei_1', name: 'Restaurantes, Delivery & Happy Hour', amount: 850, subCategory: 'Alimentação Fora' },
    { id: 'lei_2', name: 'Streaming, Games & Assinaturas', amount: 180, subCategory: 'Lazer Digital' },
    { id: 'lei_3', name: 'Passeios, Cinema & Compras Pessoais', amount: 650, subCategory: 'Estilo de Vida' },
    { id: 'lei_4', name: 'Academia & Cuidados Pessoais', amount: 220, subCategory: 'Bem-estar' },
  ],
  unexpectedExpenses: [
    { id: 'unx_1', name: 'Reserva para Manutenção Residencial & Carro', amount: 400, subCategory: 'Manutenção' },
    { id: 'unx_2', name: 'Imprevistos Médicos / Farmácia Eventual', amount: 250, subCategory: 'Emergências' },
  ],
  investments: [
    { id: 'inv_1', name: 'Aporte Mensal Tesouro Selic / CDB 100% CDI', amount: 1100, subCategory: 'Renda Fixa' },
    { id: 'inv_2', name: 'Ações & Fundos Imobiliários (FIIs)', amount: 450, subCategory: 'Renda Variável' },
  ],
  goals: [
    { 
      id: 'goal_1', 
      name: 'Reserva de Emergência (6 Meses)', 
      targetAmount: 30000, 
      currentAmount: 18500, 
      monthlyContribution: 400, 
      targetDate: '12/2026' 
    },
  ],
};

interface PersonalPlannerProps {
  indicators?: IndicatorData[];
}

export const PersonalPlanner: React.FC<PersonalPlannerProps> = ({ indicators = [] }) => {
  const { isPrivate, maskCurrency } = usePrivacy();
  const { user, cloudSync, syncDataToCloud, remotePlannerData, loginWithGoogle } = useAuth();

  // Formata valores em Reais (BRL) respeitando o Modo Privacidade
  const formatBRL = (val: number): string => maskCurrency(val);

  // Carrega ou inicializa dados do LocalStorage
  const [plannerData, setPlannerData] = useState<PlannerData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do PersonalPlanner:', e);
    }
    return DEFAULT_PLANNER_DATA;
  });

  // Salva no LocalStorage e sincroniza com a nuvem quando o usuario esta logado
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plannerData));
    } catch (e) {
      console.error('Falha ao salvar no localStorage:', e);
    }

    if (user) {
      const timer = setTimeout(() => {
        syncDataToCloud(plannerData, []);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [plannerData, user, syncDataToCloud]);

  // Aplica dados remotos da nuvem quando atualizados em outro dispositivo
  useEffect(() => {
    if (remotePlannerData) {
      setPlannerData(remotePlannerData);
    }
  }, [remotePlannerData]);

  // Taxa Selic e CDI atuais para projeção
  const selicRate = useMemo(() => {
    const s = indicators.find((i) => i.id === 'selic');
    return s && s.value > 0 ? s.value : 10.75;
  }, [indicators]);

  // Estado para adicionar nova fonte de renda
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newIncomeNotes, setNewIncomeNotes] = useState('');

  // Estado para adicionar nova despesa
  const [activeCategoryModal, setActiveCategoryModal] = useState<
    'fixed' | 'leisure' | 'unexpected' | 'investment' | null
  >(null);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseSubCat, setNewExpenseSubCat] = useState('');

  // Estado para adicionar meta
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [newGoalMonthly, setNewGoalMonthly] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');

  // Estados de Tooltip Ativo (para acessibilidade no clique e hover)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Cálculos da Regra 50/30/20
  const metrics: Rule503020Metrics = useMemo(() => {
    const totalIncome = plannerData.incomeSources.reduce((acc, src) => acc + (src.amount || 0), 0);

    // 50% Necessidades (Essenciais) = Soma dos Gastos Fixos
    const needsTotal = plannerData.fixedExpenses.reduce((acc, it) => acc + (it.amount || 0), 0);
    const needsTargetPct = 50;
    const needsTargetAmount = (totalIncome * needsTargetPct) / 100;
    const needsPct = totalIncome > 0 ? (needsTotal / totalIncome) * 100 : 0;
    const needsDifference = needsTotal - needsTargetAmount;
    const needsIsExceeded = needsPct > needsTargetPct;

    // 30% Desejos (Estilo de vida) = Soma dos Imprevistos + Lazer/Variáveis
    const leisureTotal = plannerData.leisureExpenses.reduce((acc, it) => acc + (it.amount || 0), 0);
    const unexpectedTotal = plannerData.unexpectedExpenses.reduce((acc, it) => acc + (it.amount || 0), 0);
    const wantsTotal = leisureTotal + unexpectedTotal;
    const wantsTargetPct = 30;
    const wantsTargetAmount = (totalIncome * wantsTargetPct) / 100;
    const wantsPct = totalIncome > 0 ? (wantsTotal / totalIncome) * 100 : 0;
    const wantsDifference = wantsTotal - wantsTargetAmount;
    const wantsIsExceeded = wantsPct > wantsTargetPct;

    // 20% Futuro (Liberdade Financeira) = Investimentos + Aportes nas Metas
    const directInvestments = plannerData.investments.reduce((acc, it) => acc + (it.amount || 0), 0);
    const goalsContributions = plannerData.goals.reduce((acc, g) => acc + (g.monthlyContribution || 0), 0);
    const futureTotal = directInvestments + goalsContributions;
    const futureTargetPct = 20;
    const futureTargetAmount = (totalIncome * futureTargetPct) / 100;
    const futurePct = totalIncome > 0 ? (futureTotal / totalIncome) * 100 : 0;
    const futureDifference = futureTargetAmount - futureTotal;
    const futureIsUnderFunded = futurePct < futureTargetPct;

    // Totais e Saldo
    const totalCommitted = needsTotal + wantsTotal + futureTotal;
    const freeBalance = totalIncome - totalCommitted;
    const freeBalancePct = totalIncome > 0 ? (freeBalance / totalIncome) * 100 : 0;

    return {
      totalIncome,
      needsTotal,
      needsPct,
      needsTargetPct,
      needsTargetAmount,
      needsDifference,
      needsIsExceeded,
      wantsTotal,
      wantsPct,
      wantsTargetPct,
      wantsTargetAmount,
      wantsDifference,
      wantsIsExceeded,
      futureTotal,
      futurePct,
      futureTargetPct,
      futureTargetAmount,
      futureDifference,
      futureIsUnderFunded,
      totalCommitted,
      freeBalance,
      freeBalancePct,
    };
  }, [plannerData]);

  // Dados para o Gráfico Donut de Rosca
  const donutData = useMemo(() => {
    const list = [
      {
        name: 'Necessidades (50%)',
        value: Math.max(metrics.needsTotal, 0),
        color: '#06b6d4', // Cyan
        target: 'Meta: 50%',
        actualPct: metrics.needsPct.toFixed(1),
      },
      {
        name: 'Desejos (30%)',
        value: Math.max(metrics.wantsTotal, 0),
        color: '#a855f7', // Purple
        target: 'Meta: 30%',
        actualPct: metrics.wantsPct.toFixed(1),
      },
      {
        name: 'Futuro (20%)',
        value: Math.max(metrics.futureTotal, 0),
        color: '#10b981', // Emerald
        target: 'Meta: 20%',
        actualPct: metrics.futurePct.toFixed(1),
      },
    ];

    // Se sobrar saldo positivo livre, exibe no gráfico
    if (metrics.freeBalance > 0) {
      list.push({
        name: 'Saldo Livre Disponível',
        value: metrics.freeBalance,
        color: '#38bdf8', // Light sky blue
        target: 'Disponível',
        actualPct: metrics.freeBalancePct.toFixed(1),
      });
    }

    return list.filter((item) => item.value > 0);
  }, [metrics]);

  // Manipuladores de Fontes de Renda
  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newIncomeAmount.replace(',', '.'));
    if (!newIncomeName.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const newSource: IncomeSource = {
      id: `inc_${Date.now()}`,
      name: newIncomeName.trim(),
      amount: amountNum,
      notes: newIncomeNotes.trim() || undefined,
    };

    setPlannerData((prev) => ({
      ...prev,
      incomeSources: [...prev.incomeSources, newSource],
    }));

    setNewIncomeName('');
    setNewIncomeAmount('');
    setNewIncomeNotes('');
    setIsAddingIncome(false);
  };

  const handleDeleteIncome = (id: string) => {
    setPlannerData((prev) => ({
      ...prev,
      incomeSources: prev.incomeSources.filter((src) => src.id !== id),
    }));
  };

  // Manipuladores de Despesas / Aportes
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newExpenseAmount.replace(',', '.'));
    if (!newExpenseName.trim() || isNaN(amountNum) || amountNum <= 0 || !activeCategoryModal) return;

    const newItem: BudgetItem = {
      id: `item_${Date.now()}`,
      name: newExpenseName.trim(),
      amount: amountNum,
      subCategory: newExpenseSubCat.trim() || undefined,
    };

    setPlannerData((prev) => {
      if (activeCategoryModal === 'fixed') {
        return { ...prev, fixedExpenses: [...prev.fixedExpenses, newItem] };
      }
      if (activeCategoryModal === 'leisure') {
        return { ...prev, leisureExpenses: [...prev.leisureExpenses, newItem] };
      }
      if (activeCategoryModal === 'unexpected') {
        return { ...prev, unexpectedExpenses: [...prev.unexpectedExpenses, newItem] };
      }
      if (activeCategoryModal === 'investment') {
        return { ...prev, investments: [...prev.investments, newItem] };
      }
      return prev;
    });

    setNewExpenseName('');
    setNewExpenseAmount('');
    setNewExpenseSubCat('');
    setActiveCategoryModal(null);
  };

  const handleDeleteExpense = (
    category: 'fixed' | 'leisure' | 'unexpected' | 'investment',
    id: string
  ) => {
    setPlannerData((prev) => {
      if (category === 'fixed') {
        return { ...prev, fixedExpenses: prev.fixedExpenses.filter((i) => i.id !== id) };
      }
      if (category === 'leisure') {
        return { ...prev, leisureExpenses: prev.leisureExpenses.filter((i) => i.id !== id) };
      }
      if (category === 'unexpected') {
        return { ...prev, unexpectedExpenses: prev.unexpectedExpenses.filter((i) => i.id !== id) };
      }
      if (category === 'investment') {
        return { ...prev, investments: prev.investments.filter((i) => i.id !== id) };
      }
      return prev;
    });
  };

  // Manipuladores de Metas
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(newGoalTarget.replace(',', '.'));
    const currentNum = parseFloat(newGoalCurrent.replace(',', '.')) || 0;
    const monthlyNum = parseFloat(newGoalMonthly.replace(',', '.'));

    if (!newGoalName.trim() || isNaN(targetNum) || isNaN(monthlyNum) || targetNum <= 0) return;

    const newGoal: BudgetGoal = {
      id: `goal_${Date.now()}`,
      name: newGoalName.trim(),
      targetAmount: targetNum,
      currentAmount: currentNum,
      monthlyContribution: monthlyNum,
      targetDate: newGoalDate.trim() || undefined,
    };

    setPlannerData((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));

    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalCurrent('');
    setNewGoalMonthly('');
    setNewGoalDate('');
    setIsAddingGoal(false);
  };

  const handleDeleteGoal = (id: string) => {
    setPlannerData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar os dados de exemplo do planejador 50/30/20?')) {
      setPlannerData(DEFAULT_PLANNER_DATA);
    }
  };

  return (
    <div className="space-y-8">
      {/* ======================================================== */}
      {/* BANNER HEADER DO PLANEJADOR FAMILIAR                    */}
      {/* ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Planejador Orçamentário Familiar
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/80">
              Metodologia 50/30/20
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Equilibre necessidades essenciais, estilo de vida e independência financeira com visualização analítica em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            title="Restaurar orçamento de exemplo para demonstração"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Exemplo Padrão</span>
          </button>
        </div>
      </div>

      {/* Cloud Synchronization Status Indicator */}
      {user ? (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
          <div className="flex items-center gap-2 min-w-0">
            <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">
              <strong>Sincronização em Nuvem Ativa:</strong> Orçamento familiar vinculado à conta <strong>{user.displayName || user.email}</strong>.
            </span>
          </div>
          <span className="text-[11px] text-emerald-400/80 font-mono hidden sm:inline whitespace-nowrap">
            Tempo Real (Firestore)
          </span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong>Modo Local:</strong> Seus dados estão salvos apenas neste navegador. Faça login com o Google para acessar em qualquer celular, tablet ou PC.
            </span>
          </div>
          <button
            onClick={() => loginWithGoogle()}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
            <span>Conectar Google</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* SEÇÃO 1: TERMÔMETRO 50/30/20 EM TEMPO REAL (NO TOPO)     */}
      {/* ======================================================== */}
      <div className="bg-[#0c1220]/95 border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                Termômetro da Regra 50/30/20
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Distribuição percentual da Renda Total Familiar ({formatBRL(metrics.totalIncome)})
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-cyan-500"></span>
              <span className="text-slate-300">50% Essencial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-purple-500"></span>
              <span className="text-slate-300">30% Desejos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
              <span className="text-slate-300">20% Futuro</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Donut Chart com Recharts */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[260px]">
            {metrics.totalIncome > 0 ? (
              <div className="w-full h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={96}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="#0c1220"
                      strokeWidth={3}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: any) => [formatBRL(Number(val) || 0), 'Valor']}
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centro da Rosca: Total Comprometido ou Saldo Livre */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {metrics.freeBalance >= 0 ? 'Saldo Livre' : 'Déficit'}
                  </span>
                  <span
                    className={`text-xl font-bold font-mono tabular-nums ${
                      metrics.freeBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatBRL(Math.abs(metrics.freeBalance))}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {metrics.totalIncome > 0
                      ? `${((metrics.totalCommitted / metrics.totalIncome) * 100).toFixed(0)}% comprometido`
                      : 'Sem renda'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                Cadastre suas fontes de renda para gerar o gráfico.
              </div>
            )}
          </div>

          {/* Barras de Progresso e Métricas Detalhadas (3 Blocos) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Bloco 1: Necessidades (Essenciais) - Meta 50% */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">Necessidades (Essencial)</span>
                      {/* Tooltip com Explicação */}
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip('needs')}
                          onMouseLeave={() => setActiveTooltip(null)}
                          onClick={() => setActiveTooltip(activeTooltip === 'needs' ? null : 'needs')}
                          className="text-slate-400 hover:text-cyan-400 transition-colors p-0.5 cursor-help"
                          title="Clique ou passe o mouse para detalhes da fatia de Necessidades"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                        {activeTooltip === 'needs' && (
                          <div
                            role="tooltip"
                            className="absolute left-0 sm:left-auto sm:right-0 md:left-0 bottom-full mb-2 w-[calc(100vw-48px)] sm:w-72 max-w-xs p-3 bg-slate-900 border border-cyan-700/60 rounded-xl text-xs text-slate-200 shadow-2xl z-50 animate-in fade-in"
                          >
                            <p className="font-semibold text-cyan-300 mb-1">O que compõe os 50% Essenciais?</p>
                            <p className="leading-relaxed text-slate-300">
                              Gastos fundamentais para viver e trabalhar: moradia (aluguel, financiamento, condomínio),
                              supermercado básico, luz, água, gás, internet, plano de saúde e transporte regular.
                            </p>
                            <div className="mt-2 text-[10px] text-cyan-400 font-mono">
                              Composição: Soma de todos os Gastos Fixos.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Soma dos Gastos Fixos
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span
                      className={`text-base font-bold font-mono tabular-nums ${
                        metrics.needsIsExceeded ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {metrics.needsPct.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      (Ideal: 50%)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-300 tabular-nums">
                    {formatBRL(metrics.needsTotal)}
                  </span>
                </div>
              </div>

              {/* Barra de Progresso Comparativa */}
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      metrics.needsIsExceeded ? 'bg-rose-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(metrics.needsPct, 100)}%` }}
                  />
                  {/* Linha Guia da Meta de 50% */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/70 shadow-sm"
                    style={{ left: '50%' }}
                    title="Meta Recomendada: 50%"
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-500">
                    Limite Ideal: {formatBRL(metrics.needsTargetAmount)}
                  </span>
                  <span
                    className={
                      metrics.needsIsExceeded ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'
                    }
                  >
                    {metrics.needsIsExceeded
                      ? `Excedido em +${formatBRL(metrics.needsDifference)}`
                      : `Dentro da meta (${formatBRL(Math.abs(metrics.needsDifference))} de folga)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Bloco 2: Desejos (Estilo de Vida) - Meta 30% */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-800/40">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">Desejos (Estilo de Vida)</span>
                      {/* Tooltip com Explicação */}
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip('wants')}
                          onMouseLeave={() => setActiveTooltip(null)}
                          onClick={() => setActiveTooltip(activeTooltip === 'wants' ? null : 'wants')}
                          className="text-slate-400 hover:text-purple-400 transition-colors p-0.5 cursor-help"
                          title="Clique ou passe o mouse para detalhes da fatia de Desejos"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                        {activeTooltip === 'wants' && (
                          <div
                            role="tooltip"
                            className="absolute left-0 sm:left-auto sm:right-0 md:left-0 bottom-full mb-2 w-[calc(100vw-48px)] sm:w-72 max-w-xs p-3 bg-slate-900 border border-purple-700/60 rounded-xl text-xs text-slate-200 shadow-2xl z-50 animate-in fade-in"
                          >
                            <p className="font-semibold text-purple-300 mb-1">O que compõe os 30% Desejos?</p>
                            <p className="leading-relaxed text-slate-300">
                              Gastos voltados a lazer, bem-estar e flexibilidade familiar: restaurantes, pedidos delivery,
                              viagens, hobbies, compras pessoais, somados à margem para imprevistos e reparos do dia a dia.
                            </p>
                            <div className="mt-2 text-[10px] text-purple-400 font-mono">
                              Composição: Lazer/Variáveis + Reserva para Imprevistos.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Lazer/Variáveis + Imprevistos
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span
                      className={`text-base font-bold font-mono tabular-nums ${
                        metrics.wantsIsExceeded ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {metrics.wantsPct.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      (Ideal: 30%)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-300 tabular-nums">
                    {formatBRL(metrics.wantsTotal)}
                  </span>
                </div>
              </div>

              {/* Barra de Progresso Comparativa */}
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      metrics.wantsIsExceeded ? 'bg-rose-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(metrics.wantsPct, 100)}%` }}
                  />
                  {/* Linha Guia da Meta de 30% */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/70 shadow-sm"
                    style={{ left: '30%' }}
                    title="Meta Recomendada: 30%"
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-500">
                    Limite Ideal: {formatBRL(metrics.wantsTargetAmount)}
                  </span>
                  <span
                    className={
                      metrics.wantsIsExceeded ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'
                    }
                  >
                    {metrics.wantsIsExceeded
                      ? `Excedido em +${formatBRL(metrics.wantsDifference)}`
                      : `Dentro do teto (${formatBRL(Math.abs(metrics.wantsDifference))} livres)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Bloco 3: Futuro (Liberdade Financeira) - Meta 20% */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">Futuro (Liberdade Financeira)</span>
                      {/* Tooltip com Explicação */}
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip('future')}
                          onMouseLeave={() => setActiveTooltip(null)}
                          onClick={() => setActiveTooltip(activeTooltip === 'future' ? null : 'future')}
                          className="text-slate-400 hover:text-emerald-400 transition-colors p-0.5 cursor-help"
                          title="Clique ou passe o mouse para detalhes da fatia de Futuro & Investimentos"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                        {activeTooltip === 'future' && (
                          <div
                            role="tooltip"
                            className="absolute left-0 sm:left-auto sm:right-0 md:left-0 bottom-full mb-2 w-[calc(100vw-48px)] sm:w-72 max-w-xs p-3 bg-slate-900 border border-emerald-700/60 rounded-xl text-xs text-slate-200 shadow-2xl z-50 animate-in fade-in"
                          >
                            <p className="font-semibold text-emerald-300 mb-1">O que compõe os 20% Futuro?</p>
                            <p className="leading-relaxed text-slate-300">
                              Poupança e construção de patrimônio a longo prazo: aportes em títulos públicos (Selic/IPCA),
                              CDBs, previdência privada, amortização de dívidas e aportes mensais para metas como reserva de emergência.
                            </p>
                            <div className="mt-2 text-[10px] text-emerald-400 font-mono">
                              Composição: Soma dos Investidos + Aportes nas Metas.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Investimentos + Aportes em Metas
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span
                      className={`text-base font-bold font-mono tabular-nums ${
                        metrics.futureIsUnderFunded ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {metrics.futurePct.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      (Ideal: 20%)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-300 tabular-nums">
                    {formatBRL(metrics.futureTotal)}
                  </span>
                </div>
              </div>

              {/* Barra de Progresso Comparativa */}
              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      metrics.futureIsUnderFunded ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(metrics.futurePct, 100)}%` }}
                  />
                  {/* Linha Guia da Meta de 20% */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/70 shadow-sm"
                    style={{ left: '20%' }}
                    title="Meta Mínima: 20%"
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-500">
                    Aporte Mínimo Ideal: {formatBRL(metrics.futureTargetAmount)}
                  </span>
                  <span
                    className={
                      metrics.futureIsUnderFunded ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'
                    }
                  >
                    {metrics.futureIsUnderFunded
                      ? `Faltam ${formatBRL(metrics.futureDifference)} para atingir 20%`
                      : `Meta de poupança superada (+${formatBRL(Math.abs(metrics.futureDifference))})`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEÇÃO: INTELIGÊNCIA FINANCEIRA & DICAS PERSONALIZADAS   */}
      {/* ======================================================== */}
      <FinancialIntelligence
        plannerData={plannerData}
        metrics={metrics}
        selicRate={selicRate}
        onUpdatePlannerData={setPlannerData}
      />

      {/* ======================================================== */}
      {/* SEÇÃO 2: RENDA FAMILIAR FLEXÍVEL (LISTA DINÂMICA)         */}
      {/* ======================================================== */}
      <div className="bg-[#0c1220]/95 border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Fontes de Renda Familiar
              </h3>
              <p className="text-xs text-slate-400">
                Cadastre as receitas de cada membro ou fontes extras para cálculo automático da Renda Total Líquida.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center gap-2">
              <span className="text-xs text-slate-400">Renda Total Familiar:</span>
              <span className="text-base font-bold font-mono text-cyan-400 tabular-nums">
                {formatBRL(metrics.totalIncome)}
              </span>
            </div>

            <button
              onClick={() => setIsAddingIncome((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Fonte</span>
            </button>
          </div>
        </div>

        {/* Formulário inline para adicionar fonte de renda */}
        {isAddingIncome && (
          <form
            onSubmit={handleAddIncome}
            className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end animate-in fade-in"
          >
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Nome da Fonte de Renda
              </label>
              <input
                type="text"
                placeholder="Ex: Renda 2 / Cônjuge, Renda Extra, etc."
                value={newIncomeName}
                onChange={(e) => setNewIncomeName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
                autoFocus
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Valor Líquido Mensal (R$)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0,00"
                value={newIncomeAmount}
                onChange={(e) => setNewIncomeAmount(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Obs / Origem
              </label>
              <input
                type="text"
                placeholder="Ex: CLT, PJ"
                value={newIncomeNotes}
                onChange={(e) => setNewIncomeNotes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsAddingIncome(false)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista de Fontes de Renda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {plannerData.incomeSources.map((source) => (
            <div
              key={source.id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  {source.name}
                </span>
                <span className="text-base font-bold font-mono text-white tabular-nums block mt-0.5">
                  {formatBRL(source.amount)}
                </span>
                {source.notes && (
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {source.notes}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleDeleteIncome(source.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-40 group-hover:opacity-100 transition-all cursor-pointer"
                title="Excluir fonte de renda"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {plannerData.incomeSources.length === 0 && (
            <div className="col-span-full py-6 text-center text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
              Nenhuma fonte de renda cadastrada. Clique em "Adicionar Fonte" para começar.
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEÇÃO 3: CATEGORIAS DETALHADAS DE DESPESAS & INVESTIMENTOS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Coluna 1: 50% Gastos Fixos (Necessidades) */}
        <div className="bg-[#0c1220]/95 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <h4 className="text-sm font-bold text-white">
                  Gastos Fixos (50%)
                </h4>
              </div>
              <span className="text-xs font-mono font-semibold text-cyan-400 tabular-nums">
                {formatBRL(metrics.needsTotal)}
              </span>
            </div>

            <div className="space-y-2 mb-4 max-h-[380px] overflow-y-auto pr-1">
              {plannerData.fixedExpenses.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between group hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-xs font-medium text-slate-300 block truncate">
                      {item.name}
                    </span>
                    {item.subCategory && (
                      <span className="text-[10px] text-slate-500 block">
                        {item.subCategory}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-white tabular-nums">
                      {formatBRL(item.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense('fixed', item.id)}
                      className="text-slate-600 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                      title="Excluir gasto fixo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveCategoryModal('fixed')}
            className="w-full py-2 px-3 rounded-lg border border-dashed border-cyan-800/80 hover:border-cyan-500 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Gasto Fixo</span>
          </button>
        </div>

        {/* Coluna 2: 30% Lazer / Variáveis & Imprevistos (Desejos) */}
        <div className="bg-[#0c1220]/95 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <h4 className="text-sm font-bold text-white">
                  Lazer & Imprevistos (30%)
                </h4>
              </div>
              <span className="text-xs font-mono font-semibold text-purple-400 tabular-nums">
                {formatBRL(metrics.wantsTotal)}
              </span>
            </div>

            {/* Subseção A: Lazer / Estilo de Vida */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span>Lazer & Gastos Variáveis</span>
                <button
                  onClick={() => setActiveCategoryModal('leisure')}
                  className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1 text-[10px] normal-case font-medium"
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>

              <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                {plannerData.leisureExpenses.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between group hover:border-slate-700 transition-colors"
                  >
                    <span className="text-xs text-slate-300 truncate max-w-[140px]">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-white tabular-nums">
                        {formatBRL(item.amount)}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense('leisure', item.id)}
                        className="text-slate-600 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subseção B: Imprevistos */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 pt-2 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-purple-400" />
                  <span>Reserva para Imprevistos</span>
                </span>
                <button
                  onClick={() => setActiveCategoryModal('unexpected')}
                  className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1 text-[10px] normal-case font-medium"
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {plannerData.unexpectedExpenses.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between group hover:border-slate-700 transition-colors"
                  >
                    <span className="text-xs text-slate-300 truncate max-w-[140px]">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-white tabular-nums">
                        {formatBRL(item.amount)}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense('unexpected', item.id)}
                        className="text-slate-600 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
            <span>Desejos Totais:</span>
            <span className="font-mono text-purple-300 font-semibold">
              {formatBRL(metrics.wantsTotal)}
            </span>
          </div>
        </div>

        {/* Coluna 3: 20% Investimentos & Metas (Futuro) */}
        <div className="bg-[#0c1220]/95 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between md:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <h4 className="text-sm font-bold text-white">
                  Futuro & Metas (20%)
                </h4>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-400 tabular-nums">
                {formatBRL(metrics.futureTotal)}
              </span>
            </div>

            {/* Subseção A: Investimentos Regulares */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span>Aportes em Investimentos</span>
                <button
                  onClick={() => setActiveCategoryModal('investment')}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1 text-[10px] normal-case font-medium"
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {plannerData.investments.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between group hover:border-slate-700 transition-colors"
                  >
                    <span className="text-xs text-slate-300 truncate max-w-[140px]">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-white tabular-nums">
                        {formatBRL(item.amount)}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense('investment', item.id)}
                        className="text-slate-600 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subseção B: Metas Financeiras com Aporte Mensal */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 pt-2 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-emerald-400" />
                  <span>Metas Financeiras</span>
                </span>
                <button
                  onClick={() => setIsAddingGoal(true)}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1 text-[10px] normal-case font-medium"
                >
                  <Plus className="w-3 h-3" /> Nova Meta
                </button>
              </div>

              <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                {plannerData.goals.map((goal) => {
                  const progressPct = goal.targetAmount > 0 
                    ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) 
                    : 0;

                  return (
                    <div
                      key={goal.id}
                      className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white truncate max-w-[130px]">
                          {goal.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-emerald-400 font-medium">
                            +{formatBRL(goal.monthlyContribution)}/mês
                          </span>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-slate-600 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Progresso da Meta */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>{formatBRL(goal.currentAmount)}</span>
                        <span>Alvo: {formatBRL(goal.targetAmount)} ({progressPct.toFixed(0)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Projeção do Futuro ancorada na Taxa Selic Atual */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                Potencial Selic ({selicRate}% a.a.):
              </span>
              <span className="font-mono text-emerald-400 font-semibold">
                +{formatBRL(metrics.futureTotal * 12 * (1 + selicRate / 100))} em 1 ano
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Aportando {formatBRL(metrics.futureTotal)}/mês a 100% da Selic com juros compostos.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL / FORMULÁRIO DE ADIÇÃO DE GASTOS                   */}
      {/* ======================================================== */}
      {activeCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                {activeCategoryModal === 'fixed' && 'Adicionar Gasto Fixo (Necessidades 50%)'}
                {activeCategoryModal === 'leisure' && 'Adicionar Lazer / Variável (Desejos 30%)'}
                {activeCategoryModal === 'unexpected' && 'Adicionar Reserva Imprevisto (Desejos 30%)'}
                {activeCategoryModal === 'investment' && 'Adicionar Investimento (Futuro 20%)'}
              </h4>
              <button
                onClick={() => setActiveCategoryModal(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descrição do Item
                </label>
                <input
                  type="text"
                  placeholder="Ex: Condomínio, Jantar Fora, Manutenção Carro, etc."
                  value={newExpenseName}
                  onChange={(e) => setNewExpenseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Valor Mensal (R$)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0,00"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Subcategoria (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Moradia, Alimentação, Streaming, etc."
                  value={newExpenseSubCat}
                  onChange={(e) => setNewExpenseSubCat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveCategoryModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors shadow-md cursor-pointer"
                >
                  Confirmar e Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL DE ADIÇÃO DE METAS FINANCEIRAS                    */}
      {/* ======================================================== */}
      {isAddingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <span>Nova Meta Financeira Familiar</span>
              </h4>
              <button
                onClick={() => setIsAddingGoal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Título da Meta
                </label>
                <input
                  type="text"
                  placeholder="Ex: Reserva 6 Meses, Viagem, Entrada Imóvel"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Meta Total (R$)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="20000"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Valor Atual Salvo (R$)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="5000"
                    value={newGoalCurrent}
                    onChange={(e) => setNewGoalCurrent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Aporte Mensal (R$)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="500"
                    value={newGoalMonthly}
                    onChange={(e) => setNewGoalMonthly(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Previsão (mês/ano)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 12/2026"
                    value={newGoalDate}
                    onChange={(e) => setNewGoalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-md cursor-pointer"
                >
                  Criar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
