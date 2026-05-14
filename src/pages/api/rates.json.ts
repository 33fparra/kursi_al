export const prerender = false;

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fetchRates } from '../../lib/rates';

const CACHE_PATH = join(process.cwd(), 'public', 'data', 'rates.json');
const MAX_AGE_MS = 25 * 60 * 60 * 1000; // 25 horas

export async function GET() {
  // 1. Intentar servir desde el archivo generado por scripts/fetch-rates.mjs
  try {
    if (existsSync(CACHE_PATH)) {
      const raw    = readFileSync(CACHE_PATH, 'utf-8');
      const cached = JSON.parse(raw);
      const age    = Date.now() - new Date(cached.updatedAt).getTime();
      if (age < MAX_AGE_MS) {
        return new Response(raw, {
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

  // 2. Fallback: fetch en vivo desde Frankfurter API
  const data = await fetchRates();
  if (!data) {
    return new Response(JSON.stringify({ error: 'Nuk mund të merren kurset.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'X-Source': 'live',
    },
  });
}
