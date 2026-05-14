export type Currency = 'ALL' | 'EUR' | 'USD' | 'GBP' | 'CHF';

export const CURRENCIES: Currency[] = ['ALL', 'EUR', 'USD', 'GBP', 'CHF'];

export const CURRENCY_NAMES: Record<Currency, string> = {
  ALL: 'Lek shqiptar',
  EUR: 'Euro',
  USD: 'Dollar amerikan',
  GBP: 'Paund britanik',
  CHF: 'Frank zviceran',
};

export interface RatesData {
  date: string;
  rates: Record<string, number>;
  changes: Record<string, number>;
  source: string;
  updatedAt: string;
}

// Frankfurter no soporta ALL (Lek albanés). Se usa fawazahmed0 currency API
// que incluye ALL y 150+ monedas, gratis y sin key.
const API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json';

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
    ALL_ALL: 1, EUR_EUR: 1, USD_USD: 1, GBP_GBP: 1, CHF_CHF: 1,
  };
}

export async function fetchRates(): Promise<RatesData | null> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return null;

    const json = await res.json() as { date: string; eur: Record<string, number> };
    const { all, usd, gbp, chf } = json.eur;
    if (!all || !usd || !gbp || !chf) return null;

    const today = buildRateMap({ all, usd, gbp, chf });

    // Para cambio 24h pedimos ayer
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().split('T')[0];

    let changes: Record<string, number> = {};
    try {
      const yRes = await fetch(
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${yDate}/v1/currencies/eur.json`
      );
      if (yRes.ok) {
        const yJson = await yRes.json() as { eur: Record<string, number> };
        const prev  = buildRateMap({
          all: yJson.eur.all, usd: yJson.eur.usd,
          gbp: yJson.eur.gbp, chf: yJson.eur.chf,
        });
        const TRACKED = ['EUR_ALL', 'USD_ALL', 'GBP_ALL', 'CHF_ALL', 'EUR_USD', 'EUR_GBP', 'EUR_CHF'];
        for (const pair of TRACKED) {
          const curr = today[pair], p = prev[pair];
          if (curr && p && p !== 0) changes[pair] = ((curr - p) / p) * 100;
        }
      }
    } catch { /* cambio 24h opcional */ }

    return {
      date: json.date,
      rates: today,
      changes,
      source: 'fawazahmed0',
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function getRate(rates: Record<string, number>, from: Currency, to: Currency): number {
  if (from === to) return 1;
  return rates[`${from}_${to}`] ?? 0;
}
