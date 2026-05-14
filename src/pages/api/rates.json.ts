export const prerender = false;

import { fetchRates } from '../../lib/rates';

export async function GET() {
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
    },
  });
}
