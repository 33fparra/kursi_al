export const prerender = false;

import type { APIRoute } from 'astro';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CACHE_PATH = join(process.cwd(), 'public', 'data', 'history.json');
const MAX_AGE_MS = 25 * 60 * 60 * 1000;
const VALID      = new Set(['ALL', 'EUR', 'USD', 'GBP', 'CHF']);

function buildRateMap(r: Record<string, number>): Record<string, number> {
  const { ALL, USD, GBP, CHF } = r;
  return {
    EUR_ALL: ALL,       ALL_EUR: 1 / ALL,
    USD_ALL: ALL / USD, ALL_USD: USD / ALL,
    GBP_ALL: ALL / GBP, ALL_GBP: GBP / ALL,
    CHF_ALL: ALL / CHF, ALL_CHF: CHF / ALL,
    EUR_USD: USD,       USD_EUR: 1 / USD,
    EUR_GBP: GBP,       GBP_EUR: 1 / GBP,
    EUR_CHF: CHF,       CHF_EUR: 1 / CHF,
    USD_GBP: GBP / USD, GBP_USD: USD / GBP,
    USD_CHF: CHF / USD, CHF_USD: USD / CHF,
    GBP_CHF: CHF / GBP, CHF_GBP: GBP / CHF,
  };
}

function buildSeries(
  dates: string[],
  ratesByDate: Record<string, Record<string, number>>,
  from: string,
  to: string,
) {
  const slice = dates.slice(-30);
  return slice.map((date, i) => {
    const map  = buildRateMap(ratesByDate[date]);
    const rate = from === to ? 1 : (map[`${from}_${to}`] ?? 0);
    const prev = i === 0 ? null : (() => {
      const pm = buildRateMap(ratesByDate[slice[i - 1]]);
      return from === to ? 1 : (pm[`${from}_${to}`] ?? 0);
    })();
    const change = prev ? ((rate - prev) / prev) * 100 : null;
    return { date, rate: parseFloat(rate.toFixed(6)), change };
  });
}

export const GET: APIRoute = async ({ request }) => {
  const url  = new URL(request.url);
  const from = (url.searchParams.get('from') || 'EUR').toUpperCase();
  const to   = (url.searchParams.get('to')   || 'ALL').toUpperCase();

  if (!VALID.has(from) || !VALID.has(to)) {
    return new Response(JSON.stringify({ error: 'Çift i pavlefshëm.' }), { status: 400 });
  }

  // 1. Servir desde el archivo generado por scripts/fetch-rates.mjs
  try {
    if (existsSync(CACHE_PATH)) {
      const raw   = readFileSync(CACHE_PATH, 'utf-8');
      const cache = JSON.parse(raw) as {
        updatedAt: string;
        dates: string[];
        rates: Record<string, Record<string, number>>;
      };
      const age = Date.now() - new Date(cache.updatedAt).getTime();
      if (age < MAX_AGE_MS) {
        const series = buildSeries(cache.dates, cache.rates, from, to);
        const values = series.map(s => s.rate);
        const max    = Math.max(...values);
        const min    = Math.min(...values);
        return new Response(JSON.stringify({
          from, to, series,
          stats: {
            max, min,
            maxDate: series.find(s => s.rate === max)?.date ?? null,
            minDate: series.find(s => s.rate === min)?.date ?? null,
          },
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            'X-Source': 'file-cache',
          },
        });
      }
    }
  } catch {
    // archivo no existe o está corrupto → fallback a fetch live
  }

  // 2. Fallback: fetch en vivo desde Frankfurter
  try {
    const end   = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 45);
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const res = await fetch(
      `https://api.frankfurter.app/${fmt(start)}..${fmt(end)}?from=EUR&to=ALL,USD,GBP,CHF`
    );
    if (!res.ok) throw new Error('Frankfurter error');

    const timeseries = await res.json() as {
      rates: Record<string, Record<string, number>>;
    };
    const dates  = Object.keys(timeseries.rates).sort();
    const series = buildSeries(dates, timeseries.rates, from, to);
    const values = series.map(s => s.rate);
    const max    = Math.max(...values);
    const min    = Math.min(...values);

    return new Response(JSON.stringify({
      from, to, series,
      stats: {
        max, min,
        maxDate: series.find(s => s.rate === max)?.date ?? null,
        minDate: series.find(s => s.rate === min)?.date ?? null,
      },
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-Source': 'live',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Nuk mund të merret historiku.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
