import { useState, useEffect } from 'react';

const PAIRS = [
  { from: 'EUR', to: 'ALL' }, { from: 'USD', to: 'ALL' },
  { from: 'GBP', to: 'ALL' }, { from: 'CHF', to: 'ALL' },
  { from: 'EUR', to: 'USD' }, { from: 'EUR', to: 'GBP' }, { from: 'EUR', to: 'CHF' },
];

const UI = {
  sq: { loading: 'Po ngarkohen kurset…', error: 'Kurset nuk janë të disponueshme. Provo përsëri.', pair: 'Çifti', buy: 'Blerje', sell: 'Shitje', change24h: 'Ndryshimi 24h', updated: 'E përditësuar', disclaimer: 'Kurset e blerjes dhe shitjes janë orientuese (spread ±0.25–0.8%). Kursi real ndryshon sipas bankës.' },
  en: { loading: 'Loading rates…', error: 'Rates unavailable. Please try again.', pair: 'Pair', buy: 'Buy', sell: 'Sell', change24h: '24h change', updated: 'Updated', disclaimer: 'Buy and sell rates are indicative (spread ±0.25–0.8%). Actual rates vary by bank.' },
  it: { loading: 'Caricamento tassi…', error: 'Tassi non disponibili. Riprova.', pair: 'Coppia', buy: 'Acquisto', sell: 'Vendita', change24h: 'Var. 24h', updated: 'Aggiornato', disclaimer: 'I tassi di acquisto e vendita sono indicativi (spread ±0,25–0,8%). Il tasso reale varia per banca.' },
  el: { loading: 'Φόρτωση ισοτιμιών…', error: 'Οι ισοτιμίες δεν είναι διαθέσιμες. Δοκιμάστε ξανά.', pair: 'Ζεύγος', buy: 'Αγορά', sell: 'Πώληση', change24h: 'Μεταβολή 24ω', updated: 'Ενημερώθηκε', disclaimer: 'Οι τιμές αγοράς και πώλησης είναι ενδεικτικές (spread ±0,25–0,8%). Η πραγματική ισοτιμία διαφέρει ανά τράπεζα.' },
};

function fmtRate(val, to) {
  if (!val) return '—';
  const dec = to === 'ALL' ? 2 : 4;
  return val.toLocaleString('sq-AL', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function fmtChange(pct) {
  if (pct === undefined || pct === null) return { text: '—', cls: 'change-neutral' };
  const sign = pct > 0 ? '+' : '';
  return { text: `${sign}${pct.toFixed(2)}%`, cls: pct > 0.005 ? 'change-positive' : pct < -0.005 ? 'change-negative' : 'change-neutral' };
}

export default function RateTable({ lang = 'sq' }) {
  const u = UI[lang] ?? UI.sq;
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch('/api/rates.json')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-muted)' }}>
      <i className="ti ti-loader-2" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }} aria-hidden="true" />
      <p style={{ fontSize: 'var(--text-small)' }}>{u.loading}</p>
    </div>
  );

  if (error || !data?.rates) return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-muted)' }}>
      <i className="ti ti-wifi-off" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }} aria-hidden="true" />
      <p style={{ fontSize: 'var(--text-small)' }}>{u.error}</p>
    </div>
  );

  const { rates, changes = {}, date } = data;

  return (
    <div>
      {date && (
        <p className="update-info" style={{ marginBottom: 'var(--space-4)' }}>
          <i className="ti ti-clock" aria-hidden="true" />
          {' '}{u.updated}: {date} · Frankfurter API / BCE
        </p>
      )}
      <table className="rates-table rates-table--full" aria-label={u.pair}>
        <thead>
          <tr>
            <th scope="col">{u.pair}</th>
            <th scope="col" style={{ textAlign: 'right' }}>{u.buy}</th>
            <th scope="col" style={{ textAlign: 'right' }}>{u.sell}</th>
            <th scope="col" style={{ textAlign: 'right' }}>{u.change24h}</th>
          </tr>
        </thead>
        <tbody>
          {PAIRS.map(({ from, to }) => {
            const mid    = rates[`${from}_${to}`] ?? 0;
            const spread = to === 'ALL' ? 0.008 : 0.0025;
            const change = fmtChange(changes[`${from}_${to}`]);
            return (
              <tr key={`${from}_${to}`}>
                <td className="pair">{from} / {to}</td>
                <td className="rate-val">{fmtRate(mid * (1 - spread), to)}</td>
                <td className="rate-val">{fmtRate(mid * (1 + spread), to)}</td>
                <td className={`rate-val ${change.cls}`}>{change.text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)', marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <i className="ti ti-info-circle" style={{ fontSize: '12px' }} aria-hidden="true" />
        {u.disclaimer}
      </p>
    </div>
  );
}
