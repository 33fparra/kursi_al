export const prerender = false;

import type { APIRoute } from 'astro';

const VALID   = new Set(['ALL', 'EUR', 'USD', 'GBP', 'CHF']);
const CDN     = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api';

function buildRateMap(r: { all: number; usd: number; gbp: number; chf: number }): Record<string, number> {
  const { all: ALL, usd: USD, gbp: GBP, chf: CHF } = r;
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

async function fetchDay(date: string): Promise<{ date: string; r: { all: number; usd: number; gbp: number; chf: number } } | null> {
  try {
    const res = await fetch(`${CDN}@${date}/v1/currencies/eur.json`);
    if (!res.ok) return null;
    const json = await res.json() as { date: string; eur: Record<string, number> };
    const { all, usd, gbp, chf } = json.eur ?? {};
    if (!all || !usd || !gbp || !chf) return null;
    return { date: json.date ?? date, r: { all, usd, gbp, chf } };
  } catch {
    return null;
  }
}

export const GET: APIRoute = async ({ request }) => {
  const url  = new URL(request.url);
  const from = (url.searchParams.get('from') || 'EUR').toUpperCase();
  const to   = (url.searchParams.get('to')   || 'ALL').toUpperCase();

  if (!VALID.has(from) || !VALID.has(to)) {
    return new Response(JSON.stringify({ error: 'Çift i pavlefshëm.' }), { status: 400 });
  }

  // Últimos 35 días en paralelo (35 < límite de 50 subrequests de Cloudflare Workers)
  const today = new Date();
  const dates = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const settled = await Promise.allSettled(dates.map(fetchDay));

  const days = settled
    .filter((r): r is PromiseFulfilledResult<NonNullable<Awaited<ReturnType<typeof fetchDay>>>> =>
      r.status === 'fulfilled' && r.value !== null
    )
    .map(r => r.value)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  if (days.length === 0) {
    return new Response(JSON.stringify({ error: 'Nuk mund të merret historiku.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const series = days.map((day, i) => {
    const map  = buildRateMap(day.r);
    const rate = from === to ? 1 : (map[`${from}_${to}`] ?? 0);
    const prev = i === 0 ? null : (() => {
      const pm = buildRateMap(days[i - 1].r);
      return from === to ? 1 : (pm[`${from}_${to}`] ?? 0);
    })();
    const change = prev ? ((rate - prev) / prev) * 100 : null;
    return { date: day.date, rate: parseFloat(rate.toFixed(6)), change };
  });

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
    },
  });
};
