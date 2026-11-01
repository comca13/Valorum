/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IndicatorData, HistoricalPoint, CurrencyConversionDetails } from '../types/financial';

const AWESOME_API_BASE = 'https://economia.awesomeapi.com.br';
const BCB_SGS_BASE = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';
const BRAPI_BASE = 'https://brapi.dev/api';

/**
 * Computes exact charges (IOF) and conversion fee (spread) for FX buy and sell
 */
export function computeCurrencyConversionDetails(
  bidRaw: number,
  askRaw: number,
  spreadPct: number = 1.5,
  iofBuyPct: number = 1.1,
  iofSellPct: number = 0.38
): CurrencyConversionDetails {
  // Compra (Usuário comprando moeda estrangeira com BRL): Base é o ask
  const spreadBuyValue = askRaw * (spreadPct / 100);
  const subtotalBuy = askRaw + spreadBuyValue;
  const iofBuyValue = subtotalBuy * (iofBuyPct / 100);
  const vetBuy = subtotalBuy + iofBuyValue;

  // Venda (Usuário vendendo moeda estrangeira e recebendo BRL): Base é o bid
  const spreadSellValue = bidRaw * (spreadPct / 100);
  const subtotalSell = bidRaw - spreadSellValue;
  const iofSellValue = subtotalSell * (iofSellPct / 100);
  const vetSell = subtotalSell - iofSellValue;

  return {
    bidRaw,
    askRaw,
    spreadPct,
    iofBuyPct,
    iofSellPct,
    spreadBuyValue,
    iofBuyValue,
    vetBuy,
    spreadSellValue,
    iofSellValue,
    vetSell,
  };
}

// Fallback baseline realistic market figures
export const DEFAULT_INDICATORS: IndicatorData[] = [
  {
    id: 'ibov',
    name: 'Ibovespa',
    code: 'IBOV',
    value: 129840,
    formattedValue: '129.840 pts',
    change: 890,
    changePct: 0.69,
    high: 130250,
    low: 128910,
    subValue: 'Máx: 130.250 · Mín: 128.910',
    subLabel: 'Volume: R$ 24,1 bi',
    lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    source: 'cache',
    unit: 'pts',
  },
  {
    id: 'usd',
    name: 'Dólar Comercial',
    code: 'USD/BRL',
    value: 5.642,
    formattedValue: 'R$ 5,642',
    change: -0.018,
    changePct: -0.32,
    high: 5.671,
    low: 5.628,
    subValue: 'VET Compra: R$ 5,79 · VET Venda: R$ 5,53',
    subLabel: 'Com encargos (IOF + Spread)',
    lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    source: 'cache',
    unit: 'R$',
    currencyDetails: computeCurrencyConversionDetails(5.641, 5.643, 1.5, 1.1, 0.38),
  },
  {
    id: 'eur',
    name: 'Euro Comercial',
    code: 'EUR/BRL',
    value: 6.084,
    formattedValue: 'R$ 6,084',
    change: 0.012,
    changePct: 0.20,
    high: 6.102,
    low: 6.065,
    subValue: 'VET Compra: R$ 6,24 · VET Venda: R$ 5,97',
    subLabel: 'Com encargos (IOF + Spread)',
    lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    source: 'cache',
    unit: 'R$',
    currencyDetails: computeCurrencyConversionDetails(6.082, 6.086, 1.5, 1.1, 0.38),
  },
  {
    id: 'selic',
    name: 'Taxa Selic',
    code: 'SELIC',
    value: 10.75,
    formattedValue: '10,75% a.a.',
    change: 0.25,
    changePct: 2.38,
    subValue: 'Meta Copom vigência atual',
    subLabel: 'Próxima reunião: Copom BCB',
    lastUpdated: new Date().toLocaleDateString('pt-BR'),
    source: 'cache',
    unit: '%',
  },
  {
    id: 'cdi',
    name: 'Taxa CDI',
    code: 'CDI',
    value: 10.65,
    formattedValue: '10,65% a.a.',
    change: 0.00,
    changePct: 0.00,
    subValue: '0,84% a.m. (mês vigente)',
    subLabel: 'Base 252 dias úteis',
    lastUpdated: new Date().toLocaleDateString('pt-BR'),
    source: 'cache',
    unit: '%',
  },
];

/**
 * Fetch latest quotes for USD and EUR from AwesomeAPI
 */
export async function fetchCurrencyQuotes(): Promise<{
  usd?: { value: number; changePct: number; high: number; low: number; bid: number; ask: number };
  eur?: { value: number; changePct: number; high: number; low: number; bid: number; ask: number };
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${AWESOME_API_BASE}/last/USD-BRL,EUR-BRL`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`AwesomeAPI returned ${res.status}`);
    const data = await res.json();

    const result: {
      usd?: { value: number; changePct: number; high: number; low: number; bid: number; ask: number };
      eur?: { value: number; changePct: number; high: number; low: number; bid: number; ask: number };
    } = {};

    if (data.USDBRL) {
      result.usd = {
        value: parseFloat(data.USDBRL.bid),
        changePct: parseFloat(data.USDBRL.pctChange),
        high: parseFloat(data.USDBRL.high),
        low: parseFloat(data.USDBRL.low),
        bid: parseFloat(data.USDBRL.bid),
        ask: parseFloat(data.USDBRL.ask),
      };
    }

    if (data.EURBRL) {
      result.eur = {
        value: parseFloat(data.EURBRL.bid),
        changePct: parseFloat(data.EURBRL.pctChange),
        high: parseFloat(data.EURBRL.high),
        low: parseFloat(data.EURBRL.low),
        bid: parseFloat(data.EURBRL.bid),
        ask: parseFloat(data.EURBRL.ask),
      };
    }

    return result;
  } catch (err) {
    console.warn('Currency API error, using baseline fallback:', err);
    return {};
  }
}

/**
 * Fetch Selic meta rate from Banco Central do Brasil SGS (Series 432)
 */
export async function fetchBCBSelicRate(): Promise<{ value: number; date: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${BCB_SGS_BASE}.432/dados/ultimos/1?formato=json`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`BCB API error ${res.status}`);
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0 && data[0].valor) {
      const val = parseFloat(data[0].valor.replace(',', '.'));
      return {
        value: val,
        date: data[0].data,
      };
    }
    return null;
  } catch (err) {
    console.warn('BCB Selic API error, using baseline fallback:', err);
    return null;
  }
}

/**
 * Fetch CDI Rate from Banco Central do Brasil SGS (Series 4389 - taxa mensal ou base anual)
 */
export async function fetchBCBCDIRate(): Promise<{ monthly: number; annual: number } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${BCB_SGS_BASE}.4389/dados/ultimos/1?formato=json`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`BCB CDI error ${res.status}`);
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0 && data[0].valor) {
      const monthlyVal = parseFloat(data[0].valor.replace(',', '.'));
      const annualVal = (Math.pow(1 + monthlyVal / 100, 12) - 1) * 100;
      return {
        monthly: monthlyVal,
        annual: parseFloat(annualVal.toFixed(2)),
      };
    }
    return null;
  } catch (err) {
    console.warn('BCB CDI API error, using baseline fallback:', err);
    return null;
  }
}

/**
 * Fetch B3 Ibovespa quote via Brapi free API
 */
export async function fetchBrapiQuote(ticker: string): Promise<{
  price: number;
  changePct: number;
  high?: number;
  low?: number;
} | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${BRAPI_BASE}/quote/${ticker}?range=1d&interval=1d`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();

    if (data?.results?.[0]) {
      const item = data.results[0];
      return {
        price: item.regularMarketPrice,
        changePct: item.regularMarketChangePercent,
        high: item.regularMarketDayHigh,
        low: item.regularMarketDayLow,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Aggregate all Indicators into unified structure with live data and currency charges
 */
export async function fetchAllIndicators(): Promise<IndicatorData[]> {
  const result: IndicatorData[] = [...DEFAULT_INDICATORS];
  const nowStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // 1. Currencies (USD & EUR) with charges & conversion rate calculations
  const currencies = await fetchCurrencyQuotes();
  if (currencies.usd) {
    const idx = result.findIndex((i) => i.id === 'usd');
    if (idx !== -1) {
      const details = computeCurrencyConversionDetails(currencies.usd.bid, currencies.usd.ask, 1.5, 1.1, 0.38);
      result[idx] = {
        ...result[idx],
        value: currencies.usd.value,
        formattedValue: `R$ ${currencies.usd.value.toFixed(4).replace('.', ',')}`,
        changePct: currencies.usd.changePct,
        change: currencies.usd.value * (currencies.usd.changePct / 100),
        high: currencies.usd.high,
        low: currencies.usd.low,
        subValue: `VET Compra: R$ ${details.vetBuy.toFixed(2).replace('.', ',')} · VET Venda: R$ ${details.vetSell.toFixed(2).replace('.', ',')}`,
        subLabel: `Com encargos (IOF 1,1% + Spread 1,5%)`,
        lastUpdated: nowStr,
        source: 'live',
        currencyDetails: details,
      };
    }
  }

  if (currencies.eur) {
    const idx = result.findIndex((i) => i.id === 'eur');
    if (idx !== -1) {
      const details = computeCurrencyConversionDetails(currencies.eur.bid, currencies.eur.ask, 1.5, 1.1, 0.38);
      result[idx] = {
        ...result[idx],
        value: currencies.eur.value,
        formattedValue: `R$ ${currencies.eur.value.toFixed(4).replace('.', ',')}`,
        changePct: currencies.eur.changePct,
        change: currencies.eur.value * (currencies.eur.changePct / 100),
        high: currencies.eur.high,
        low: currencies.eur.low,
        subValue: `VET Compra: R$ ${details.vetBuy.toFixed(2).replace('.', ',')} · VET Venda: R$ ${details.vetSell.toFixed(2).replace('.', ',')}`,
        subLabel: `Com encargos (IOF 1,1% + Spread 1,5%)`,
        lastUpdated: nowStr,
        source: 'live',
        currencyDetails: details,
      };
    }
  }

  // 2. Selic from BCB
  const selicData = await fetchBCBSelicRate();
  if (selicData) {
    const idx = result.findIndex((i) => i.id === 'selic');
    if (idx !== -1) {
      result[idx] = {
        ...result[idx],
        value: selicData.value,
        formattedValue: `${selicData.value.toFixed(2).replace('.', ',')}% a.a.`,
        subValue: `Atualizado pelo BCB (${selicData.date})`,
        lastUpdated: nowStr,
        source: 'live',
      };
    }
  }

  // 3. CDI from BCB
  const cdiData = await fetchBCBCDIRate();
  if (cdiData) {
    const idx = result.findIndex((i) => i.id === 'cdi');
    if (idx !== -1) {
      result[idx] = {
        ...result[idx],
        value: cdiData.annual,
        formattedValue: `${cdiData.annual.toFixed(2).replace('.', ',')}% a.a.`,
        subValue: `${cdiData.monthly.toFixed(2).replace('.', ',')}% a.m. (mês vigente)`,
        lastUpdated: nowStr,
        source: 'live',
      };
    }
  }

  // 4. Ibovespa from Brapi or calculation
  const ibovQuote = await fetchBrapiQuote('^BVSP');
  if (ibovQuote) {
    const idx = result.findIndex((i) => i.id === 'ibov');
    if (idx !== -1) {
      result[idx] = {
        ...result[idx],
        value: Math.round(ibovQuote.price),
        formattedValue: `${Math.round(ibovQuote.price).toLocaleString('pt-BR')} pts`,
        changePct: parseFloat(ibovQuote.changePct.toFixed(2)),
        change: Math.round((ibovQuote.price * ibovQuote.changePct) / 100),
        high: ibovQuote.high ? Math.round(ibovQuote.high) : undefined,
        low: ibovQuote.low ? Math.round(ibovQuote.low) : undefined,
        subValue:
          ibovQuote.high && ibovQuote.low
            ? `Máx: ${Math.round(ibovQuote.high).toLocaleString('pt-BR')} · Mín: ${Math.round(ibovQuote.low).toLocaleString('pt-BR')}`
            : result[idx].subValue,
        lastUpdated: nowStr,
        source: 'live',
      };
    }
  }

  return result;
}

/**
 * Fetch 30-90 days historical series for an indicator
 */
export async function fetchHistoricalData(
  indicatorId: string,
  days: number = 30
): Promise<HistoricalPoint[]> {
  if (indicatorId === 'usd' || indicatorId === 'eur') {
    const pair = indicatorId === 'usd' ? 'USD-BRL' : 'EUR-BRL';
    try {
      const res = await fetch(`${AWESOME_API_BASE}/json/daily/${pair}/${days}`);
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw) && raw.length > 0) {
          const points: HistoricalPoint[] = raw
            .slice(0, days)
            .reverse()
            .map((item) => {
              const ts = parseInt(item.timestamp, 10) * 1000;
              const date = new Date(ts);
              const label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              return {
                timestamp: ts,
                date: label,
                label,
                value: parseFloat(parseFloat(item.bid).toFixed(4)),
              };
            });
          return points;
        }
      }
    } catch (e) {
      console.warn(`Historical currency error for ${indicatorId}, generating modeled series:`, e);
    }
  }

  const points: HistoricalPoint[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  let baseVal = 129840;
  let volatility = 0.008;

  if (indicatorId === 'ibov') {
    baseVal = 129840;
    volatility = 0.007;
  } else if (indicatorId === 'usd') {
    baseVal = 5.642;
    volatility = 0.006;
  } else if (indicatorId === 'eur') {
    baseVal = 6.084;
    volatility = 0.005;
  } else if (indicatorId === 'selic') {
    baseVal = 10.75;
    volatility = 0.0005;
  } else if (indicatorId === 'cdi') {
    baseVal = 10.65;
    volatility = 0.0005;
  }

  let current = baseVal;
  const tempValues: number[] = [current];

  for (let i = 1; i < days; i++) {
    if (indicatorId === 'selic' || indicatorId === 'cdi') {
      const step = i > 22 ? -0.25 : 0;
      current = baseVal + step;
    } else {
      const seed = Math.sin(i * 1.7) * 0.7 + Math.cos(i * 0.9) * 0.3;
      const change = current * volatility * seed;
      current = current - change;
    }
    tempValues.push(current);
  }

  tempValues.reverse();

  for (let i = 0; i < days; i++) {
    const pointTime = now - (days - 1 - i) * dayMs;
    const dateObj = new Date(pointTime);
    const label = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const val = tempValues[i];

    points.push({
      timestamp: pointTime,
      date: label,
      label,
      value:
        indicatorId === 'ibov'
          ? Math.round(val)
          : parseFloat(val.toFixed(indicatorId === 'usd' || indicatorId === 'eur' ? 4 : 2)),
    });
  }

  return points;
}
