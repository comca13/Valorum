/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { 
  IndicatorData, 
  IndicatorId, 
  ChartDisplayMode,
  DualHistoricalPoint 
} from '../types/financial';
import { fetchHistoricalData } from '../services/api';
import { 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  ArrowRightLeft,
  Layers,
  Sparkles,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface ChartSectionProps {
  selectedIndicatorId: IndicatorId;
  onSelectIndicator: (id: IndicatorId) => void;
  indicators: IndicatorData[];
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  selectedIndicatorId,
  onSelectIndicator,
  indicators,
}) => {
  const [timeRange, setTimeRange] = useState<number>(30); // 7, 15, 30, 90 days
  const [comparisonIndicatorId, setComparisonIndicatorId] = useState<IndicatorId | 'none'>('usd');
  const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('dual-axis'); // 'dual-axis' | 'normalized-pct'
  const [chartData, setChartData] = useState<DualHistoricalPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // If primary and secondary are same, adjust secondary to another one
  useEffect(() => {
    if (comparisonIndicatorId === selectedIndicatorId) {
      const alternative = indicators.find((i) => i.id !== selectedIndicatorId);
      if (alternative) {
        setComparisonIndicatorId(alternative.id);
      }
    }
  }, [selectedIndicatorId, comparisonIndicatorId, indicators]);

  const fallbackIndicator = (id: IndicatorId): IndicatorData => ({
    id,
    name:
      id === 'ibov'
        ? 'Ibovespa'
        : id === 'usd'
        ? 'Dólar Comercial'
        : id === 'eur'
        ? 'Euro Comercial'
        : id === 'selic'
        ? 'Taxa Selic'
        : 'Taxa CDI',
    code: id.toUpperCase(),
    value: 0,
    formattedValue: '-',
    change: 0,
    changePct: 0,
    unit: id === 'ibov' ? 'pts' : id === 'usd' || id === 'eur' ? 'R$' : '%',
    source: 'cache',
    lastUpdated: '',
  });

  const primaryIndicator = indicators.find((i) => i.id === selectedIndicatorId) || indicators[0] || fallbackIndicator(selectedIndicatorId);
  const secondaryIndicator = comparisonIndicatorId !== 'none'
    ? indicators.find((i) => i.id === comparisonIndicatorId) || fallbackIndicator(comparisonIndicatorId)
    : null;

  // Fetch both historical datasets and merge
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const promises = [fetchHistoricalData(selectedIndicatorId, timeRange)];
    if (comparisonIndicatorId !== 'none') {
      promises.push(fetchHistoricalData(comparisonIndicatorId, timeRange));
    }

    Promise.all(promises)
      .then(([primarySeries, secondarySeries]) => {
        if (!isMounted) return;

        if (!primarySeries || primarySeries.length === 0) {
          setChartData([]);
          setIsLoading(false);
          return;
        }

        const baseVal1 = primarySeries[0]?.value || 1;
        const baseVal2 = secondarySeries && secondarySeries[0]?.value ? secondarySeries[0].value : 1;

        const merged: DualHistoricalPoint[] = primarySeries.map((item, idx) => {
          const secItem = secondarySeries ? secondarySeries[idx] : undefined;
          const val1 = item.value;
          const val2 = secItem ? secItem.value : undefined;

          const pct1 = baseVal1 !== 0 ? parseFloat((((val1 - baseVal1) / baseVal1) * 100).toFixed(2)) : 0;
          const pct2 = val2 !== undefined && baseVal2 !== 0 ? parseFloat((((val2 - baseVal2) / baseVal2) * 100).toFixed(2)) : undefined;

          return {
            date: item.date,
            label: item.label,
            timestamp: item.timestamp,
            val1,
            val2,
            pct1,
            pct2,
          };
        });

        setChartData(merged);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load chart series:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedIndicatorId, comparisonIndicatorId, timeRange]);

  // Compute Pearson Correlation Coefficient between series 1 and series 2
  const correlation = useMemo(() => {
    if (!secondaryIndicator || chartData.length < 5) return null;

    const pairs = chartData
      .filter((d) => d.val1 !== undefined && d.val2 !== undefined)
      .map((d) => [d.val1, d.val2 as number]);

    if (pairs.length === 0) return null;

    const n = pairs.length;
    const meanX = pairs.reduce((sum, [x]) => sum + x, 0) / n;
    const meanY = pairs.reduce((sum, [, y]) => sum + y, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (const [x, y] of pairs) {
      const dx = x - meanX;
      const dy = y - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    const denominator = Math.sqrt(denomX * denomY);
    if (denominator === 0) return 0;

    const r = numerator / denominator;
    return parseFloat(r.toFixed(2));
  }, [chartData, secondaryIndicator]);

  // Descriptive text for correlation
  const getCorrelationBadge = (r: number) => {
    if (r >= 0.7) {
      return { label: `Forte Correlação Positiva (+${r})`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
    if (r >= 0.3) {
      return { label: `Correlação Positiva Moderada (+${r})`, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
    }
    if (r > -0.3) {
      return { label: `Correlação Baixa ou Neutra (${r >= 0 ? '+' : ''}${r})`, color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
    if (r > -0.7) {
      return { label: `Correlação Inversa Moderada (${r})`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    }
    return { label: `Forte Correlação Inversa (${r})`, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  // Format nominal values
  const formatIndicatorVal = (id: IndicatorId, val: number) => {
    if (id === 'ibov') return `${Math.round(val).toLocaleString('pt-BR')} pts`;
    if (id === 'usd' || id === 'eur') return `R$ ${val.toFixed(4).replace('.', ',')}`;
    return `${val.toFixed(2).replace('.', ',')}%`;
  };

  // Period stats for primary indicator
  const vals1 = chartData.map((d) => d.val1).filter(Boolean);
  const minVal1 = vals1.length > 0 ? Math.min(...vals1) : 0;
  const maxVal1 = vals1.length > 0 ? Math.max(...vals1) : 0;
  const first1 = vals1[0] || 0;
  const last1 = vals1[vals1.length - 1] || 0;
  const diffPct1 = first1 !== 0 ? ((last1 - first1) / first1) * 100 : 0;

  // Period stats for secondary indicator
  const vals2 = chartData.map((d) => d.val2).filter((v): v is number => v !== undefined);
  const first2 = vals2[0] || 0;
  const last2 = vals2[vals2.length - 1] || 0;
  const diffPct2 = first2 !== 0 ? ((last2 - first2) / first2) * 100 : 0;

  const primaryColor = '#22d3ee'; // cyan-400
  const secondaryColor = '#34d399'; // emerald-400

  return (
    <div className="bg-[#0f172a]/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl relative backdrop-blur-sm space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Análise Técnica Histórica</span>
            <span>·</span>
            <span className="font-mono text-cyan-400">{primaryIndicator.name}</span>
            {secondaryIndicator && (
              <>
                <span>vs</span>
                <span className="font-mono text-emerald-400">{secondaryIndicator.name}</span>
              </>
            )}
            <span>·</span>
            <span>{timeRange} dias</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Tendência & Correlação de Preços</span>
          </h2>
        </div>

        {/* Controls toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Display Mode Toggle */}
          {secondaryIndicator && (
            <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
              <button
                onClick={() => setDisplayMode('dual-axis')}
                title="Exibir com dois eixos Y independentes em valores nominais"
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  displayMode === 'dual-axis'
                    ? 'bg-slate-700 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Eixos Duplos
              </button>
              <button
                onClick={() => setDisplayMode('normalized-pct')}
                title="Exibir evolução percentual relativa normalizada (Base 0% no dia inicial)"
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  displayMode === 'normalized-pct'
                    ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Percent className="w-3 h-3" />
                <span>Variação %</span>
              </button>
            </div>
          )}

          {/* Timeframe Buttons */}
          <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
            {[7, 15, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer ${
                  timeRange === days
                    ? 'bg-slate-700 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dual Indicator Selectors & Correlation Pill */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary Indicator Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              <span>Indicador 1:</span>
            </span>
            <select
              value={selectedIndicatorId}
              onChange={(e) => onSelectIndicator(e.target.value as IndicatorId)}
              className="bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-medium focus:outline-none cursor-pointer"
            >
              {indicators.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.code} ({ind.name})
                </option>
              ))}
            </select>
          </div>

          {/* Comparison Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span>Comparar com:</span>
            </span>
            <select
              value={comparisonIndicatorId}
              onChange={(e) => setComparisonIndicatorId(e.target.value as IndicatorId | 'none')}
              className="bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-white font-mono font-medium focus:outline-none cursor-pointer"
            >
              <option value="none">Sem comparação (Único)</option>
              {indicators
                .filter((ind) => ind.id !== selectedIndicatorId)
                .map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.code} ({ind.name})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Correlation Badge */}
        {correlation !== null && secondaryIndicator && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-sans">Correlação Pearson:</span>
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${
                getCorrelationBadge(correlation).color
              }`}
            >
              {getCorrelationBadge(correlation).label}
            </span>
          </div>
        )}
      </div>

      {/* KPI Performance Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-b border-slate-800/60 text-xs">
        <div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>{primaryIndicator.code} Atual</span>
          </div>
          <div className="text-base font-bold font-mono tabular-nums text-white mt-0.5">
            {primaryIndicator.formattedValue}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>{primaryIndicator.code} ({timeRange}D)</span>
          </div>
          <div
            className={`text-base font-bold font-mono tabular-nums mt-0.5 flex items-center gap-1 ${
              diffPct1 >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {diffPct1 >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{diffPct1 >= 0 ? '+' : ''}{diffPct1.toFixed(2).replace('.', ',')}%</span>
          </div>
        </div>

        {secondaryIndicator ? (
          <>
            <div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{secondaryIndicator.code} Atual</span>
              </div>
              <div className="text-base font-bold font-mono tabular-nums text-white mt-0.5">
                {secondaryIndicator.formattedValue}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{secondaryIndicator.code} ({timeRange}D)</span>
              </div>
              <div
                className={`text-base font-bold font-mono tabular-nums mt-0.5 flex items-center gap-1 ${
                  diffPct2 >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {diffPct2 >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{diffPct2 >= 0 ? '+' : ''}{diffPct2.toFixed(2).replace('.', ',')}%</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="text-[11px] text-slate-400">Mínima ({timeRange}D)</div>
              <div className="text-base font-bold font-mono tabular-nums text-slate-300 mt-0.5">
                {formatIndicatorVal(selectedIndicatorId, minVal1)}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Máxima ({timeRange}D)</div>
              <div className="text-base font-bold font-mono tabular-nums text-slate-300 mt-0.5">
                {formatIndicatorVal(selectedIndicatorId, maxVal1)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recharts Area/Line Container */}
      <div className="h-[300px] sm:h-[350px] w-full pt-2">
        {isLoading ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">Carregando dados históricos...</span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-slate-500 text-xs">
            Nenhum dado disponível para o período selecionado.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradient-primary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradient-secondary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="date"
                stroke="#475569"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickMargin={8}
                fontFamily="JetBrains Mono"
              />

              {/* In Dual Axis mode: Left Axis for Primary, Right Axis for Secondary */}
              {displayMode === 'dual-axis' || !secondaryIndicator ? (
                <>
                  <YAxis
                    yAxisId="left"
                    domain={['auto', 'auto']}
                    stroke="#06b6d4"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#0891b2' }}
                    tickFormatter={(val) => {
                      if (selectedIndicatorId === 'ibov') return `${(val / 1000).toFixed(0)}k`;
                      if (selectedIndicatorId === 'usd' || selectedIndicatorId === 'eur') return `R$${val.toFixed(2)}`;
                      return `${val}%`;
                    }}
                    orientation="left"
                    fontFamily="JetBrains Mono"
                    width={52}
                  />

                  {secondaryIndicator && (
                    <YAxis
                      yAxisId="right"
                      domain={['auto', 'auto']}
                      stroke="#10b981"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#059669' }}
                      tickFormatter={(val) => {
                        if (comparisonIndicatorId === 'ibov') return `${(val / 1000).toFixed(0)}k`;
                        if (comparisonIndicatorId === 'usd' || comparisonIndicatorId === 'eur') return `R$${val.toFixed(2)}`;
                        return `${val}%`;
                      }}
                      orientation="right"
                      fontFamily="JetBrains Mono"
                      width={52}
                    />
                  )}
                </>
              ) : (
                /* In Normalized % mode: Single Y-Axis in percentage */
                <YAxis
                  yAxisId="normalized"
                  domain={['auto', 'auto']}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`}
                  orientation="right"
                  fontFamily="JetBrains Mono"
                  width={52}
                />
              )}

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DualHistoricalPoint;
                    return (
                      <div className="bg-[#0b1120] border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs font-mono space-y-2 min-w-[210px]">
                        <div className="text-slate-400 flex items-center justify-between pb-1.5 border-b border-slate-800">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{data.date}</span>
                          </span>
                          <span className="text-[10px] text-slate-500">Fechamento</span>
                        </div>

                        {/* Primary Indicator Info */}
                        <div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5 font-sans font-medium">
                              <span className="w-2 h-2 rounded-full bg-cyan-400" />
                              <span>{primaryIndicator.code}:</span>
                            </span>
                            <span className="font-bold text-white">
                              {formatIndicatorVal(selectedIndicatorId, data.val1)}
                            </span>
                          </div>
                          {data.pct1 !== undefined && (
                            <div className="text-[10px] text-right font-semibold text-cyan-400">
                              {data.pct1 >= 0 ? '+' : ''}{data.pct1.toFixed(2)}% no período
                            </div>
                          )}
                        </div>

                        {/* Secondary Indicator Info */}
                        {secondaryIndicator && data.val2 !== undefined && (
                          <div className="pt-1.5 border-t border-slate-800">
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="flex items-center gap-1.5 font-sans font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span>{secondaryIndicator.code}:</span>
                              </span>
                              <span className="font-bold text-white">
                                {formatIndicatorVal(comparisonIndicatorId as IndicatorId, data.val2)}
                              </span>
                            </div>
                            {data.pct2 !== undefined && (
                              <div className="text-[10px] text-right font-semibold text-emerald-400">
                                {data.pct2 >= 0 ? '+' : ''}{data.pct2.toFixed(2)}% no período
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Primary Series */}
              {displayMode === 'dual-axis' || !secondaryIndicator ? (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="val1"
                  name={primaryIndicator.code}
                  stroke={primaryColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradient-primary)"
                  animationDuration={500}
                />
              ) : (
                <Area
                  yAxisId="normalized"
                  type="monotone"
                  dataKey="pct1"
                  name={`${primaryIndicator.code} (%)`}
                  stroke={primaryColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gradient-primary)"
                  animationDuration={500}
                />
              )}

              {/* Secondary Series if enabled */}
              {secondaryIndicator && (
                displayMode === 'dual-axis' ? (
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="val2"
                    name={secondaryIndicator.code}
                    stroke={secondaryColor}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradient-secondary)"
                    animationDuration={500}
                  />
                ) : (
                  <Area
                    yAxisId="normalized"
                    type="monotone"
                    dataKey="pct2"
                    name={`${secondaryIndicator.code} (%)`}
                    stroke={secondaryColor}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradient-secondary)"
                    animationDuration={500}
                  />
                )
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
