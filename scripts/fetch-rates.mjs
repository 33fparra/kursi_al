/**
 * scripts/fetch-rates.mjs
 * Corre diariamente (ej. 06:00) y guarda las tasas en public/data/
 *
 * Fuente: fawazahmed0 currency API (gratis, sin key, incluye ALL)
 *   Hoy:      https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json
 *   Histórico: https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@YYYY-MM-DD/v1/currencies/eur.json
 *
 * Ejecución:  node scripts/fetch-rates.mjs
 * npm script: npm run fetch-rates
 */

import { mkdir, writeFile, readFile } from 'fs/promises';
import { join, dirname }               from 'path';
import { fileURLToPath }               from 'url';
import { createClient }                from '@supabase/supabase-js';

const __dirname    = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const DATA_DIR     = join(PROJECT_ROOT, 'public', 'data');

// ── Cargar .env manualmente (sin dotenv) ─────────────────────
try {
  const env = await readFile(join(PROJECT_ROOT, '.env'), 'utf-8');
  for (const line of env.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch { /* .env opcional */ }

// ── Cliente Supabase (service role, solo para este script) ───
const SUPABASE_URL  = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY;
const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const BASE_URL  = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api';
const FALLBACK  = 'https://latest.currency-api.pages.dev/v1/currencies/eur.json';
const CURRENCIES = ['all', 'usd', 'gbp', 'chf']; // lowercase en esta API

const ts = () => new Date().toISOString();

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildRateMap({ all: ALL, usd: USD, gbp: GBP, chf: CHF }) {
  if (!ALL || !USD || !GBP || !CHF) {
    throw new Error(`Valores inválidos: ALL=${ALL} USD=${USD} GBP=${GBP} CHF=${CHF}`);
  }
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
    ALL_ALL: 1, EUR_EUR: 1, USD_USD: 1, GBP_GBP: 1, CHF_CHF: 1,
  };
}

async function fetchDay(date) {
  const url = date === 'latest'
    ? `${BASE_URL}@latest/v1/currencies/eur.json`
    : `${BASE_URL}@${date}/v1/currencies/eur.json`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} para ${url}`);
  const json = await res.json();
  // Extraer solo las 4 monedas que necesitamos
  const picked = Object.fromEntries(CURRENCIES.map(c => [c, json.eur?.[c]]));
  return { date: json.date ?? date, rates: picked };
}

function getLast40Dates() {
  const dates = [];
  for (let i = 1; i <= 40; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`[${ts()}] Iniciando scraping de tasas...`);

  // 1. Tasas de hoy
  console.log(`Fetching: hoy (latest)`);
  const today = await fetchDay('latest');
  console.log(`  → fecha: ${today.date} | ALL=${today.rates.all} USD=${today.rates.usd}`);

  // 2. Últimos 40 días en paralelo (luego tomamos los 30 más recientes con datos)
  console.log(`Fetching: últimos 40 días en paralelo...`);
  const pastDates  = getLast40Dates();
  const pastResults = await Promise.allSettled(pastDates.map(fetchDay));

  // Combinar todo: hoy + días pasados exitosos, ordenado desc → asc
  const allDays = [today];
  for (const r of pastResults) {
    if (r.status === 'fulfilled') allDays.push(r.value);
  }
  // Dedup por fecha y ordenar ascendente
  const byDate = new Map(allDays.map(d => [d.date, d.rates]));
  const sortedDates = [...byDate.keys()].sort(); // YYYY-MM-DD ordena bien lexicográficamente

  if (sortedDates.length < 2) throw new Error('Datos insuficientes para calcular cambios.');

  const latestDate = sortedDates[sortedDates.length - 1];
  const prevDate   = sortedDates[sortedDates.length - 2];

  // ── rates.json ─────────────────────────────────────────────────────────────
  const rates   = buildRateMap(byDate.get(latestDate));
  const changes = {};
  const prev    = buildRateMap(byDate.get(prevDate));
  const TRACKED = ['EUR_ALL', 'USD_ALL', 'GBP_ALL', 'CHF_ALL', 'EUR_USD', 'EUR_GBP', 'EUR_CHF'];
  for (const pair of TRACKED) {
    const curr = rates[pair], p = prev[pair];
    if (curr && p && p !== 0) changes[pair] = ((curr - p) / p) * 100;
  }

  const ratesData = {
    date: latestDate,
    rates,
    changes,
    source: 'fawazahmed0',
    updatedAt: new Date().toISOString(),
  };

  // ── history.json ────────────────────────────────────────────────────────────
  // Guarda la serie cruda (base EUR) para que el endpoint calcule cualquier par
  const KEEP = sortedDates.slice(-35); // hasta 35 días de buffer
  const historyData = {
    updatedAt: new Date().toISOString(),
    dates: KEEP,
    rates: Object.fromEntries(KEEP.map(d => [d, byDate.get(d)])),
  };

  // ── Escribir ────────────────────────────────────────────────────────────────
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(join(DATA_DIR, 'rates.json'),   JSON.stringify(ratesData, null, 2), 'utf-8');
  await writeFile(join(DATA_DIR, 'history.json'), JSON.stringify(historyData, null, 2), 'utf-8');

  const ok = pastResults.filter(r => r.status === 'fulfilled').length;
  console.log(`[${ts()}] ✓ public/data/rates.json   → ${latestDate}`);
  console.log(`[${ts()}] ✓ public/data/history.json → ${KEEP.length} días (${ok}/40 históricos OK)`);
  console.log(`  EUR → ALL : ${rates.EUR_ALL.toFixed(4)}`);
  console.log(`  USD → ALL : ${rates.USD_ALL.toFixed(4)}`);
  console.log(`  GBP → ALL : ${rates.GBP_ALL.toFixed(4)}`);
  console.log(`  CHF → ALL : ${rates.CHF_ALL.toFixed(4)}`);
  // ── Guardar en Supabase (si está configurado) ──────────────
  if (supabase) {
    // Construir filas: una por par (base EUR) por cada fecha
    const rows = [];
    for (const date of KEEP) {
      const day = byDate.get(date);
      if (!day) continue;
      rows.push(
        { date, base: 'EUR', target: 'ALL', rate: day.all, source: 'fawazahmed0' },
        { date, base: 'EUR', target: 'USD', rate: day.usd, source: 'fawazahmed0' },
        { date, base: 'EUR', target: 'GBP', rate: day.gbp, source: 'fawazahmed0' },
        { date, base: 'EUR', target: 'CHF', rate: day.chf, source: 'fawazahmed0' },
      );
    }

    const { error } = await supabase
      .from('daily_rates')
      .upsert(rows, { onConflict: 'date,base,target' });

    if (error) {
      console.warn(`[${ts()}] ⚠ Supabase error:`, error.message);
    } else {
      console.log(`[${ts()}] ✓ Supabase daily_rates → ${rows.length} filas guardadas`);
    }
  } else {
    console.log(`[${ts()}] ℹ Supabase no configurado — saltando insert`);
  }

  console.log(`[${ts()}] Listo.`);
}

main().catch(err => {
  console.error(`[${ts()}] ERROR:`, err.message);
  process.exit(1);
});
