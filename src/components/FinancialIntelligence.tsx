/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sliders,
  DollarSign,
  Wallet,
  PiggyBank,
  RotateCcw,
  Check,
  Percent,
  Copy,
  Zap,
  ShieldCheck,
  ChevronRight,
  Flame,
  Clock,
  Target
} from 'lucide-react';
import {
  PlannerData,
  BudgetItem,
  Rule503020Metrics
} from '../types/financial';
import { usePrivacy } from '../context/PrivacyContext';

interface FinancialIntelligenceProps {
  plannerData: PlannerData;
  metrics: Rule503020Metrics;
  selicRate: number;
  onUpdatePlannerData?: (updated: PlannerData) => void;
}

export interface OptimizationSuggestion {
  id: string;
  category: 'needs' | 'wants' | 'future' | 'general';
  title: string;
  targetItemName?: string;
  currentAmount?: number;
  suggestedSavingAmount: number;
  impactLevel: 'alto' | 'medio' | 'baixo';
  difficulty: 'facil' | 'moderada' | 'estrutural';
  explanation: string;
  actionableStep: string;
  isQuickWin?: boolean;
}

const CHECKLIST_STORAGE_KEY = 'valorum_financial_intelligence_tasks_v1';

export const FinancialIntelligence: React.FC<FinancialIntelligenceProps> = ({
  plannerData,
  metrics,
  selicRate,
  onUpdatePlannerData,
}) => {
  const { maskCurrency } = usePrivacy();

  const formatBRL = (val: number): string => maskCurrency(val);

  // Checklist de ações concluídas salvas no LocalStorage
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(completedTaskIds));
    } catch (e) {
      console.warn('Erro ao salvar tarefas concluídas:', e);
    }
  }, [completedTaskIds]);

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  // Filtro de visualização das dicas
  const [activeFilter, setActiveFilter] = useState<'all' | 'needs' | 'wants' | 'future' | 'quickWins'>('all');

  // Estado do simulador interativo de economia
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatedSavings, setSimulatedSavings] = useState<{ [suggestionId: string]: boolean }>({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  // -------------------------------------------------------------
  // MOTOR DE INTELIGÊNCIA: ANÁLISE DE GASTOS E RECOMENDAÇÕES
  // -------------------------------------------------------------
  const { suggestions, overallStatus, totalPotentialSavings, annualCompoundedValue } = useMemo(() => {
    const list: OptimizationSuggestion[] = [];
    const totalIncome = metrics.totalIncome || 1;

    // 1. Diagnóstico de NECESSIDADES (> 50%)
    if (metrics.needsIsExceeded) {
      const excessNeeds = metrics.needsDifference;

      // Ordena despesas fixas da maior para a menor
      const sortedFixed = [...plannerData.fixedExpenses].sort((a, b) => b.amount - a.amount);

      sortedFixed.forEach((item) => {
        const itemNameLower = item.name.toLowerCase();
        const itemPctOfIncome = (item.amount / totalIncome) * 100;

        // Moradia / Aluguel / Condomínio / Financiamento
        if (
          itemNameLower.includes('aluguel') ||
          itemNameLower.includes('condom') ||
          itemNameLower.includes('habit') ||
          itemNameLower.includes('casa') ||
          itemNameLower.includes('moradia') ||
          itemNameLower.includes('financiamento')
        ) {
          if (itemPctOfIncome > 28) {
            const savingTarget = Math.min(item.amount * 0.1, excessNeeds * 0.4);
            list.push({
              id: `sug_housing_${item.id}`,
              category: 'needs',
              title: `Otimização de Custos de Moradia (${item.name})`,
              targetItemName: item.name,
              currentAmount: item.amount,
              suggestedSavingAmount: Math.round(savingTarget),
              impactLevel: 'alto',
              difficulty: 'estrutural',
              explanation: `Seu custo com ${item.name} consome ${itemPctOfIncome.toFixed(1)}% da renda familiar total (acima do teto saudável de 25-28%). Isso sobrecarrega a margem das despesas essenciais.`,
              actionableStep:
                'Solicite renegociação do índice de reajuste do contrato (propor IPCA ao invés de IGP-M), audite a taxa de condomínio em assembleia ou avalie portabilidade de crédito imobiliário para taxas de juros mais competitivas.',
            });
          }
        }

        // Supermercado / Alimentação básica
        else if (
          itemNameLower.includes('supermercado') ||
          itemNameLower.includes('mercado') ||
          itemNameLower.includes('feira') ||
          itemNameLower.includes('aliment') ||
          itemNameLower.includes('compras')
        ) {
          const savingTarget = Math.round(item.amount * 0.15);
          list.push({
            id: `sug_groceries_${item.id}`,
            category: 'needs',
            title: `Estratégia dos 3 Níveis no Supermercado (${item.name})`,
            targetItemName: item.name,
            currentAmount: item.amount,
            suggestedSavingAmount: savingTarget,
            impactLevel: 'alto',
            difficulty: 'facil',
            isQuickWin: true,
            explanation: `Gastos de alimentação básica frequentemente sofrem com compras por impulso e falta de substituição inteligente de marcas brancas. Uma redução de 15% alivia ${formatBRL(savingTarget)}/mês.`,
            actionableStep:
              'Faça lista fechada com cardápio semanal prévio; adote marcas próprias de redes varejistas para itens de limpeza e grãos; e utilize programas de cashback e fidelidade do mercado local.',
          });
        }

        // Telecom / Internet / Celular
        else if (
          itemNameLower.includes('internet') ||
          itemNameLower.includes('celular') ||
          itemNameLower.includes('telefone') ||
          itemNameLower.includes('tv') ||
          itemNameLower.includes('telecom')
        ) {
          const savingTarget = Math.min(Math.round(item.amount * 0.25), 90);
          list.push({
            id: `sug_telecom_${item.id}`,
            category: 'needs',
            title: `Renegociação Anual de Telecomunicações (${item.name})`,
            targetItemName: item.name,
            currentAmount: item.amount,
            suggestedSavingAmount: savingTarget,
            impactLevel: 'medio',
            difficulty: 'facil',
            isQuickWin: true,
            explanation: `Planos de internet e celular tendem a ficar defasados e mais caros após o período promocional. No Brasil, clientes que solicitam cotação da concorrência obtêm descontos imediatos de 20% a 30%.`,
            actionableStep:
              `Ligue para o setor de retenção da operadora de ${item.name} mencionando uma oferta atual do concorrente e peça equiparação de plano.`,
          });
        }

        // Energia Elétrica / Luz / Água / Gás
        else if (
          itemNameLower.includes('luz') ||
          itemNameLower.includes('energia') ||
          itemNameLower.includes('água') ||
          itemNameLower.includes('agua') ||
          itemNameLower.includes('gás') ||
          itemNameLower.includes('gas')
        ) {
          const savingTarget = Math.round(item.amount * 0.12);
          list.push({
            id: `sug_utilities_${item.id}`,
            category: 'needs',
            title: `Eficiência Energética e Tarifária (${item.name})`,
            targetItemName: item.name,
            currentAmount: item.amount,
            suggestedSavingAmount: savingTarget,
            impactLevel: 'medio',
            difficulty: 'facil',
            isQuickWin: true,
            explanation: `Pequenas fugas de corrente, aparelhos em stand-by contínuo e uso de chuveiro elétrico no horário de ponta aumentam a fatura de ${item.name} desnecessariamente.`,
            actionableStep:
              'Considere assinar energia solar por assinatura (cooperativas com desconto direto na conta de 10% a 15% sem investimento) e verifique vazamentos hidráulicos ocultos.',
          });
        }

        // Planos de Saúde / Seguros
        else if (
          itemNameLower.includes('saúde') ||
          itemNameLower.includes('saude') ||
          itemNameLower.includes('seguro') ||
          itemNameLower.includes('médic')
        ) {
          const savingTarget = Math.round(item.amount * 0.1);
          list.push({
            id: `sug_health_${item.id}`,
            category: 'needs',
            title: `Auditoria de Seguros e Coparticipação (${item.name})`,
            targetItemName: item.name,
            currentAmount: item.amount,
            suggestedSavingAmount: savingTarget,
            impactLevel: 'medio',
            difficulty: 'moderada',
            explanation: `Planos de saúde sem coparticipação têm mensalidades muito mais elevadas. Para famílias com baixa frequência hospitalar, migrar para coparticipação reduz até 25% a fatura fixa.`,
            actionableStep:
              'Consulte corretores para comparar planos com coparticipação ou avalie cotações de seguros veiculares e residenciais com franquia ajustada.',
          });
        }

        // Outros itens fixos genéricos de alto valor
        else if (item.amount > totalIncome * 0.05) {
          const savingTarget = Math.round(item.amount * 0.1);
          list.push({
            id: `sug_fixed_generic_${item.id}`,
            category: 'needs',
            title: `Revisão do Contrato/Gasto: ${item.name}`,
            targetItemName: item.name,
            currentAmount: item.amount,
            suggestedSavingAmount: savingTarget,
            impactLevel: 'medio',
            difficulty: 'moderada',
            explanation: `Este item consome ${formatBRL(item.amount)} por mês (${itemPctOfIncome.toFixed(1)}% do orçamento familiar). Qualquer economia aqui tem peso expressivo.`,
            actionableStep: `Avalie alternativas de mercado mais enxutas para ${item.name} ou busque descontos para pagamento antecipado em cota única anual.`,
          });
        }
      });
    }

    // 2. Diagnóstico de DESEJOS / ESTILO DE VIDA (> 30%)
    if (metrics.wantsIsExceeded) {
      const allWants = [...plannerData.leisureExpenses, ...plannerData.unexpectedExpenses].sort(
        (a, b) => b.amount - a.amount
      );

      allWants.forEach((item) => {
        const itemNameLower = item.name.toLowerCase();

        // Delivery / Restaurantes / iFood
        if (
          itemNameLower.includes('delivery') ||
          itemNameLower.includes('ifood') ||
          itemNameLower.includes('restaurante') ||
          itemNameLower.includes('lanche') ||
          itemNameLower.includes('fast food') ||
          itemNameLower.includes('uber eats') ||
          itemNameLower.includes('rappi')
        ) {
          const savingTarget = Math.round(item.amount * 0.4);
          list.push({
            id: `sug_delivery_${item.id}`,
            category: 'wants',
            title: `Teto Semanal de Delivery & Alimentação Fora (${item.name})`,
            targetItemName: item.name,
            currentAmount: item.amount,
            suggestedSavingAmount: savingTarget,
            impactLevel: 'alto',
            difficulty: 'facil',
            isQuickWin: true,
            explanation: `Pedidos de delivery recorrentes possuem taxas de entrega, gorjetas e markup de cardápio de 25% a 35%. Reduzir a frequência para ocasiões especiais recupera ${formatBRL(savingTarget)}/mês.`,
            actionableStep:
              'Estabeleça a regra de 1 único pedido por semana aos finais de semana e prepare marmitas gourmet ou lanches congelados com antecedência para dias de cansaço.',
          });
        }

        // Assinaturas / Streaming / Jogos
        else if (
          itemNameLower.includes('netflix') ||
          itemNameLower.includes('spotify') ||
          itemNameLower.includes('streaming') ||
          itemNameLower.includes('assinatura') ||
          itemNameLower.includes('amazon prime') ||
          itemNameLower.includes('disney') ||
          itemNameLower.includes('hbo') ||
          itemNameLower.includes('game')
        ) {
          const savingTarget = Math.round(item.amount * 0.5);
          list.push({
            id: `sug_streaming_${item.id}`,
            category: 'wants',
            title: `Rodízio de Plataformas de Streaming (${item.name})`,
            targetItemName: item.name,
            currentAmount: item.amount,
            suggestedSavingAmount: savingTarget,
            impactLevel: 'medio',
            difficulty: 'facil',
            isQuickWin: true,
            explanation: `A maioria das famílias mantém de 3 a 5 assinaturas simultâneas, mas consome ativamente apenas uma por mês. O rodízio mensal economiza até metade do valor sem perder séries.`,
            actionableStep:
              'Mantenha apenas 1 serviço de vídeo ativo por mês, cancele os demais e assine o próximo quando concluir as produções que deseja assistir.',
          });
        }

        // Lazer / Baladas / Happy Hour / Viagens curtas
        else if (
          itemNameLower.includes('lazer') ||
          itemNameLower.includes('bar') ||
          itemNameLower.includes('balada') ||
          itemNameLower.includes('happy hour') ||
          itemNameLower.includes('festa') ||
          itemNameLower.includes('passeio')
        ) {
          const savingTarget = Math.round(item.amount * 0.3);
          list.push({
            id: `sug_leisure_${item.id}`,
            category: 'wants',
            title: `Envelope Digital de Lazer (${item.name})`,
            targetItemName: item.name,
            currentAmount: item.amount,
            suggestedSavingAmount: savingTarget,
            impactLevel: 'alto',
            difficulty: 'moderada',
            explanation: `Gastos de lazer sem um limite rígido tendem a transbordar para o cartão de crédito e gerar surpresas no fechamento da fatura.`,
            actionableStep:
              `Defina um limite mensal pré-pago de ${formatBRL(item.amount - savingTarget)} para saídas familiares em uma conta digital separada com cartão de débito. Ao acabar o saldo, priorize opções gratuitas como parques e centros culturais.`,
          });
        }

        // Imprevistos / Despesas não planejadas recorrentes
        else if (
          itemNameLower.includes('imprevisto') ||
          itemNameLower.includes('emergência') ||
          itemNameLower.includes('reserva') ||
          itemNameLower.includes('manutenção')
        ) {
          const savingTarget = Math.round(item.amount * 0.35);
          list.push({
            id: `sug_unexpected_${item.id}`,
            category: 'wants',
            title: `Previsibilidade de Gastos Recorrentes (${item.name})`,
            targetItemName: item.name,
            currentAmount: item.amount,
            suggestedSavingAmount: savingTarget,
            impactLevel: 'alto',
            difficulty: 'moderada',
            explanation: `Se a categoria de imprevistos consome mais de 5% da renda todo mês, a maior parte desses gastos são despesas periódicas previsíveis (IPVA, manutenção de carro, presentes) que não foram provisionadas.`,
            actionableStep:
              'Liste todos os gastos sazonais do ano, divida o valor total por 12 e transfira esse montante para uma caixinha com liquidez diária exclusiva para manutenção.',
          });
        }

        // Compras pessoais / Roupas / Eletrônicos
        else {
          const savingTarget = Math.round(item.amount * 0.35);
          list.push({
            id: `sug_wants_generic_${item.id}`,
            category: 'wants',
            title: `Regra das 72 Horas para Compras (${item.name})`,
            targetItemName: item.name,
            currentAmount: item.amount,
            suggestedSavingAmount: savingTarget,
            impactLevel: 'medio',
            difficulty: 'facil',
            isQuickWin: true,
            explanation: `Compras pontuais e desejos repentinos respondem por grande parte do estouro dos 30% recomendados.`,
            actionableStep:
              'Antes de adquirir qualquer item não essencial acima de R$ 100, aguarde obrigatoriamente 72 horas para esfriar o impulso de compra e reavaliar se é estritamente necessário.',
          });
        }
      });
    }

    // 3. Diagnóstico de FUTURO / LIBERDADE FINANCEIRA (< 20%)
    if (metrics.futureIsUnderFunded) {
      const shortfall = metrics.futureDifference;
      list.push({
        id: 'sug_future_pay_yourself_first',
        category: 'future',
        title: 'Princípio do "Pague-se Primeiro" (Automatização)',
        suggestedSavingAmount: Math.round(shortfall),
        impactLevel: 'alto',
        difficulty: 'facil',
        isQuickWin: true,
        explanation: `Atualmente seu futuro recebe ${metrics.futurePct.toFixed(1)}% da renda (ideal: 20%). A maioria das pessoas poupa apenas o que sobra no fim do mês — e raramente sobra.`,
        actionableStep:
          `Programe um agendamento automático na sua conta para o dia seguinte ao recebimento do salário: transfira ${formatBRL(metrics.futureTargetAmount)} direto para Tesouro Selic ou CDB de liquidez diária antes de pagar qualquer outra conta.`,
      });
    }

    // 4. Se o orçamento estiver equilibrado (nenhuma categoria excedida)
    if (!metrics.needsIsExceeded && !metrics.wantsIsExceeded && !metrics.futureIsUnderFunded) {
      list.push({
        id: 'sug_balanced_emergency_fund',
        category: 'general',
        title: 'Blindagem Patrimonial: Reserva de Emergência de 6 Meses',
        suggestedSavingAmount: 0,
        impactLevel: 'alto',
        difficulty: 'facil',
        isQuickWin: false,
        explanation: `Parabéns! Sua distribuição segue as melhores práticas da regra 50/30/20. O próximo passo de elite financeira é garantir que sua reserva cubra 6 meses de gastos essenciais (${formatBRL(metrics.needsTotal * 6)}).`,
        actionableStep:
          'Aloque sua reserva em ativos de liquidez imediata com rendimento igual ou superior a 100% do CDI (ex: Tesouro Selic no Tesouro Direto ou CDBs de bancos sólidos).',
      });

      list.push({
        id: 'sug_balanced_ipca_protection',
        category: 'future',
        title: 'Proteção contra Inflação: Aporte em Tesouro IPCA+',
        suggestedSavingAmount: 0,
        impactLevel: 'medio',
        difficulty: 'moderada',
        explanation:
          'Com suas metas e despesas equilibradas, diversifique a parcela de longo prazo em títulos atrelados ao IPCA para garantir ganho real acima da inflação até a aposentadoria.',
        actionableStep:
          'Avalie títulos do Tesouro IPCA+ com vencimentos alinhados aos seus projetos de longo prazo (5 a 10 anos) para travar rentabilidade real.',
      });
    }

    // Calcula economia total das sugestões identificadas
    const totalPotentialSavings = list.reduce((acc, it) => acc + it.suggestedSavingAmount, 0);

    // Projeção a valor futuro de 12 meses rendendo à taxa Selic
    // Fórmula de anuidade com aportes mensais: FV = PMT * [ ((1 + r)^n - 1) / r ]
    const monthlySelicRate = Math.pow(1 + selicRate / 100, 1 / 12) - 1;
    let annualCompoundedValue = 0;
    if (totalPotentialSavings > 0 && monthlySelicRate > 0) {
      annualCompoundedValue =
        totalPotentialSavings * ((Math.pow(1 + monthlySelicRate, 12) - 1) / monthlySelicRate);
    } else {
      annualCompoundedValue = totalPotentialSavings * 12;
    }

    // Status geral
    let overallStatus: 'critical' | 'warning' | 'healthy' = 'healthy';
    if (metrics.freeBalance < 0 || (metrics.needsIsExceeded && metrics.wantsIsExceeded)) {
      overallStatus = 'critical';
    } else if (metrics.needsIsExceeded || metrics.wantsIsExceeded || metrics.futureIsUnderFunded) {
      overallStatus = 'warning';
    }

    return {
      suggestions: list,
      overallStatus,
      totalPotentialSavings,
      annualCompoundedValue,
    };
  }, [plannerData, metrics, selicRate]);

  // Filtra as sugestões conforme a seleção da aba
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((sug) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'needs') return sug.category === 'needs';
      if (activeFilter === 'wants') return sug.category === 'wants';
      if (activeFilter === 'future') return sug.category === 'future';
      if (activeFilter === 'quickWins') return sug.isQuickWin === true;
      return true;
    });
  }, [suggestions, activeFilter]);

  // Contadores para os filtros
  const counts = useMemo(() => {
    return {
      all: suggestions.length,
      needs: suggestions.filter((s) => s.category === 'needs').length,
      wants: suggestions.filter((s) => s.category === 'wants').length,
      future: suggestions.filter((s) => s.category === 'future').length,
      quickWins: suggestions.filter((s) => s.isQuickWin).length,
    };
  }, [suggestions]);

  // -------------------------------------------------------------
  // SIMULADOR DE IMPACTO: CÁLCULO DE ANTES VS DEPOIS
  // -------------------------------------------------------------
  const simulatedImpact = useMemo(() => {
    let simulatedNeedsCut = 0;
    let simulatedWantsCut = 0;
    let simulatedFutureBoost = 0;

    suggestions.forEach((sug) => {
      // Por padrão consideramos ativas as sugestões marcadas no simulador
      const isActive = simulatedSavings[sug.id] ?? true;
      if (isActive && sug.suggestedSavingAmount > 0) {
        if (sug.category === 'needs') {
          simulatedNeedsCut += sug.suggestedSavingAmount;
        } else if (sug.category === 'wants') {
          simulatedWantsCut += sug.suggestedSavingAmount;
        } else if (sug.category === 'future') {
          simulatedFutureBoost += sug.suggestedSavingAmount;
        }
      }
    });

    const totalIncome = metrics.totalIncome || 1;
    const newNeedsTotal = Math.max(metrics.needsTotal - simulatedNeedsCut, 0);
    const newNeedsPct = (newNeedsTotal / totalIncome) * 100;

    const newWantsTotal = Math.max(metrics.wantsTotal - simulatedWantsCut, 0);
    const newWantsPct = (newWantsTotal / totalIncome) * 100;

    // Se sobrou economia de necessidades e desejos, redirecionamos para o Futuro!
    const totalFreedMoney = simulatedNeedsCut + simulatedWantsCut;
    const newFutureTotal = metrics.futureTotal + totalFreedMoney;
    const newFuturePct = (newFutureTotal / totalIncome) * 100;

    return {
      simulatedNeedsCut,
      simulatedWantsCut,
      totalFreedMoney,
      newNeedsTotal,
      newNeedsPct,
      newWantsTotal,
      newWantsPct,
      newFutureTotal,
      newFuturePct,
    };
  }, [suggestions, simulatedSavings, metrics]);

  // Ação de copiar relatório para o clipboard
  const handleCopyReport = () => {
    const reportText = `📋 RELATÓRIO DE INTELIGÊNCIA FINANCEIRA - REGRA 50/30/20 (VALORUM)
Data: ${new Date().toLocaleDateString('pt-BR')}
Renda Total Analisada: ${formatBRL(metrics.totalIncome)}

DIAGNÓSTICO ATUAL:
- Necessidades (50%): ${metrics.needsPct.toFixed(1)}% (${formatBRL(metrics.needsTotal)}) -> ${
      metrics.needsIsExceeded ? '⚠️ ACIMA DA META' : '✅ DENTRO DA META'
    }
- Desejos (30%): ${metrics.wantsPct.toFixed(1)}% (${formatBRL(metrics.wantsTotal)}) -> ${
      metrics.wantsIsExceeded ? '⚠️ ACIMA DA META' : '✅ DENTRO DA META'
    }
- Futuro (20%): ${metrics.futurePct.toFixed(1)}% (${formatBRL(metrics.futureTotal)}) -> ${
      metrics.futureIsUnderFunded ? '⚠️ ABAIXO DA META' : '✅ DENTRO DA META'
    }

POTENCIAL DE ECONOMIA MENSAL: ${formatBRL(totalPotentialSavings)}
ACÚMULO ESTIMADO EM 12 MESES (SELIC ${selicRate.toFixed(2)}% a.a.): ${formatBRL(annualCompoundedValue)}

PRINCIPAIS DICAS DE AÇÃO RECOMENDADAS:
${suggestions
  .map(
    (s, i) =>
      `${i + 1}. [${s.category.toUpperCase()}] ${s.title}\n   Economia Sugerida: ${formatBRL(
        s.suggestedSavingAmount
      )}\n   Ação Prática: ${s.actionableStep}\n`
  )
  .join('\n')}
Gerado automaticamente pelo Valorum Finance`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    });
  };

  // Aplica as sugestões no orçamento real caso fornecido o callback
  const handleApplySimulatedChanges = () => {
    if (!onUpdatePlannerData) return;

    const newPlanner: PlannerData = JSON.parse(JSON.stringify(plannerData));

    suggestions.forEach((sug) => {
      const isSelected = simulatedSavings[sug.id] ?? true;
      if (!isSelected || sug.suggestedSavingAmount <= 0) return;

      if (sug.category === 'needs' && sug.targetItemName) {
        const item = newPlanner.fixedExpenses.find((f) => f.name === sug.targetItemName);
        if (item) {
          item.amount = Math.max(item.amount - sug.suggestedSavingAmount, 0);
        }
      } else if (sug.category === 'wants' && sug.targetItemName) {
        const leisureItem = newPlanner.leisureExpenses.find((l) => l.name === sug.targetItemName);
        if (leisureItem) {
          leisureItem.amount = Math.max(leisureItem.amount - sug.suggestedSavingAmount, 0);
        } else {
          const unexpItem = newPlanner.unexpectedExpenses.find((u) => u.name === sug.targetItemName);
          if (unexpItem) {
            unexpItem.amount = Math.max(unexpItem.amount - sug.suggestedSavingAmount, 0);
          }
        }
      }
    });

    // Se houve dinheiro liberado, cria ou incrementa aporte em investimentos para cumprir os 20%
    if (simulatedImpact.totalFreedMoney > 0) {
      const selicInv = newPlanner.investments.find((i) => i.name.toLowerCase().includes('selic'));
      if (selicInv) {
        selicInv.amount += simulatedImpact.totalFreedMoney;
      } else {
        newPlanner.investments.push({
          id: `inv_auto_${Date.now()}`,
          name: 'Tesouro Selic (Economia Inteligente)',
          amount: simulatedImpact.totalFreedMoney,
          subCategory: 'Renda Fixa',
        });
      }
    }

    onUpdatePlannerData(newPlanner);
    setIsSimulatorOpen(false);
  };

  const completedCount = completedTaskIds.filter((id) =>
    suggestions.some((s) => s.id === id)
  ).length;

  return (
    <div className="bg-[#0c1220]/95 border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-sm space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* CABEÇALHO DO MÓDULO DE INTELIGÊNCIA FINANCEIRA                */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-cyan-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Inteligência Financeira 50/30/20
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                <Lightbulb className="w-3 h-3 text-indigo-400" />
                Diagnóstico em Tempo Real
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditoria algorítmica de despesas com estratégias práticas para enquadrar seu orçamento no padrão 50/30/20.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              isSimulatorOpen
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            {isSimulatorOpen ? 'Ocultar Simulador' : 'Simulador de Impacto'}
          </button>

          <button
            type="button"
            onClick={handleCopyReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all"
            title="Copiar relatório completo com recomendações"
          >
            {copiedNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar Plano</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CARDS DE RESUMO DO DIAGNÓSTICO E POTENCIAL DE ECONOMIA        */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Diagnóstico de Saúde */}
        <div
          className={`p-4 rounded-xl border ${
            overallStatus === 'critical'
              ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
              : overallStatus === 'warning'
              ? 'bg-amber-950/20 border-amber-900/40 text-amber-300'
              : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
              Status do Orçamento
            </span>
            {overallStatus === 'critical' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : overallStatus === 'warning' ? (
              <Flame className="w-4 h-4 text-amber-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="text-base font-bold text-white mb-1">
            {overallStatus === 'critical'
              ? 'Atenção Crítica: Limites Excedidos'
              : overallStatus === 'warning'
              ? 'Desbalanceamento Detectado'
              : 'Orçamento 100% Equilibrado'}
          </div>
          <p className="text-xs leading-relaxed opacity-85">
            {overallStatus === 'critical'
              ? `Suas despesas essenciais e variáveis ultrapassam o teto recomendado, comprometendo a saúde financeira e sua reserva.`
              : overallStatus === 'warning'
              ? `Identificamos ${
                  (metrics.needsIsExceeded ? 1 : 0) + (metrics.wantsIsExceeded ? 1 : 0)
                } categoria(s) fora da meta recomendada da regra 50/30/20.`
              : `Parabéns! Gastos essenciais estão abaixo de 50%, desejos sob controle e aportes de futuro atingiram a meta de 20%.`}
          </p>
        </div>

        {/* Card 2: Potencial de Economia Mensal */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Economia Mensal Identificada
            </span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mb-1">
            {formatBRL(totalPotentialSavings)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {((totalPotentialSavings / (metrics.totalIncome || 1)) * 100).toFixed(1)}% da renda
            </span>
            <span className="text-slate-300 font-medium">
              {suggestions.length} ações mapeadas
            </span>
          </div>
        </div>

        {/* Card 3: Impacto em 12 Meses com Taxa Selic */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Potencial em 12M (Selic {selicRate.toFixed(2)}%)
            </span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums mb-1">
            {formatBRL(annualCompoundedValue)}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Se a economia mensal for integralmente revertida para aportes no Tesouro Selic.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SIMULADOR INTERATIVO: ANTES VS DEPOIS                         */}
      {/* ------------------------------------------------------------- */}
      {isSimulatorOpen && (
        <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/40 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Simulador de Reequilíbrio do Orçamento
              </h4>
              <p className="text-xs text-slate-300">
                Veja em tempo real como a regra 50/30/20 se ajusta caso você aplique as reduções sugeridas.
              </p>
            </div>

            {onUpdatePlannerData && (
              <button
                type="button"
                onClick={handleApplySimulatedChanges}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950 transition-all"
              >
                <Check className="w-4 h-4" />
                Aplicar Ajustes no Meu Planejador
              </button>
            )}
          </div>

          {/* Comparativo de Barras: Antes vs Depois */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bloco 1: Necessidades (Essencial) */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Necessidades (50%)</span>
                <span
                  className={`font-mono font-bold ${
                    simulatedImpact.newNeedsPct <= 50 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {metrics.needsPct.toFixed(1)}% → {simulatedImpact.newNeedsPct.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    simulatedImpact.newNeedsPct <= 50 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(simulatedImpact.newNeedsPct, 100)}%` }}
                />
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/60" style={{ left: '50%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Antes: {formatBRL(metrics.needsTotal)}</span>
                <span className="text-emerald-400">
                  Depois: {formatBRL(simulatedImpact.newNeedsTotal)}
                </span>
              </div>
            </div>

            {/* Bloco 2: Desejos (30%) */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Desejos (30%)</span>
                <span
                  className={`font-mono font-bold ${
                    simulatedImpact.newWantsPct <= 30 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {metrics.wantsPct.toFixed(1)}% → {simulatedImpact.newWantsPct.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    simulatedImpact.newWantsPct <= 30 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(simulatedImpact.newWantsPct, 100)}%` }}
                />
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/60" style={{ left: '30%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Antes: {formatBRL(metrics.wantsTotal)}</span>
                <span className="text-emerald-400">
                  Depois: {formatBRL(simulatedImpact.newWantsTotal)}
                </span>
              </div>
            </div>

            {/* Bloco 3: Futuro (20%) */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Futuro (20%)</span>
                <span
                  className={`font-mono font-bold ${
                    simulatedImpact.newFuturePct >= 20 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {metrics.futurePct.toFixed(1)}% → {simulatedImpact.newFuturePct.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    simulatedImpact.newFuturePct >= 20 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(simulatedImpact.newFuturePct, 100)}%` }}
                />
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/60" style={{ left: '20%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Antes: {formatBRL(metrics.futureTotal)}</span>
                <span className="text-cyan-400">
                  Depois: {formatBRL(simulatedImpact.newFutureTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FILTROS E PROGRESSO DAS AÇÕES                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
        {/* Abas de filtro */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            Todas ({counts.all})
          </button>

          {counts.needs > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('needs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'needs'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              Necessidades ({counts.needs})
            </button>
          )}

          {counts.wants > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('wants')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'wants'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              Desejos ({counts.wants})
            </button>
          )}

          {counts.future > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('future')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'future'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              Futuro ({counts.future})
            </button>
          )}

          {counts.quickWins > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilter('quickWins')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                activeFilter === 'quickWins'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-900/50'
              }`}
            >
              <Zap className="w-3 h-3 text-purple-400" />
              Ações Rápidas ({counts.quickWins})
            </button>
          )}
        </div>

        {/* Progresso de implementação */}
        <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono">
          <span>Progresso do Plano:</span>
          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{
                width: `${suggestions.length > 0 ? (completedCount / suggestions.length) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="font-semibold text-slate-200">
            {completedCount}/{suggestions.length}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LISTA DE CARDS DE DICAS PERSONALIZADAS                        */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-3.5">
        {filteredSuggestions.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">
              Nenhuma recomendação pendente para este filtro.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Seu planejamento nesta categoria está equilibrado.
            </p>
          </div>
        ) : (
          filteredSuggestions.map((suggestion) => {
            const isCompleted = completedTaskIds.includes(suggestion.id);
            const isSimulatedActive = simulatedSavings[suggestion.id] ?? true;

            const categoryBadge =
              suggestion.category === 'needs'
                ? { label: '50% Necessidades', bg: 'bg-cyan-950/80', text: 'text-cyan-300', border: 'border-cyan-800/40' }
                : suggestion.category === 'wants'
                ? { label: '30% Desejos', bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-800/40' }
                : suggestion.category === 'future'
                ? { label: '20% Futuro', bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-800/40' }
                : { label: 'Geral', bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };

            return (
              <div
                key={suggestion.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700/90 shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${categoryBadge.bg} ${categoryBadge.text} ${categoryBadge.border}`}
                      >
                        {categoryBadge.label}
                      </span>

                      {suggestion.isQuickWin && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-purple-400" />
                          Ação Rápida
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          suggestion.impactLevel === 'alto'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        Impacto {suggestion.impactLevel.toUpperCase()}
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-bold transition-colors ${
                        isCompleted ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {suggestion.title}
                    </h4>
                  </div>

                  {/* Valor de economia sugerido & Botão de Conclusão */}
                  <div className="flex items-center gap-3 self-end sm:self-start">
                    {suggestion.suggestedSavingAmount > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-slate-400 block font-medium">
                          Economia Estimada
                        </span>
                        <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                          -{formatBRL(suggestion.suggestedSavingAmount)}
                          <span className="text-[10px] text-slate-400 font-normal">/mês</span>
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleTaskCompletion(suggestion.id)}
                      className={`p-2 rounded-xl transition-all border ${
                        isCompleted
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border-slate-700'
                      }`}
                      title={isCompleted ? 'Desmarcar como concluída' : 'Marcar ação como concluída'}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Explicação detalhada */}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {suggestion.explanation}
                </p>

                {/* Passo de Ação Prática com destaque */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
                  <div className="p-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/40 mt-0.5 shrink-0">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed">
                    <span className="font-bold text-indigo-300 mr-1">Como agir:</span>
                    {suggestion.actionableStep}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* NOTA METODOLÓGICA & BASE LEGAL                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
        <span>
          Base de cálculo: Regra 50/30/20 & Projeção com Selic Meta Vigente ({selicRate.toFixed(2)}% a.a.).
        </span>
        <span className="text-slate-400">
          Valorum Financial Intelligence Engine • Versão 2.4
        </span>
      </div>
    </div>
  );
};
