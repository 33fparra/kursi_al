import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const PAIRS = [
  { from: 'EUR', to: 'ALL', label: 'EUR → ALL' },
  { from: 'USD', to: 'ALL', label: 'USD → ALL' },
  { from: 'GBP', to: 'ALL', label: 'GBP → ALL' },
  { from: 'CHF', to: 'ALL', label: 'CHF → ALL' },
];

const CDN = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api';

const UI = {
  sq: { loading: 'Po ngarkohet historiku…', error: 'Historiku nuk është i disponueshëm. Provo përsëri.', max: 'Maksimumi', min: 'Minimumi', change30d: 'Ndryshimi 30d', dailyValues: 'Vlerat ditore', date: 'Data', rate: 'Kursi', change: 'Ndryshimi' },
  en: { loading: 'Loading history…', error: 'History unavailable. Please try again.', max: 'Maximum', min: 'Minimum', change30d: '30d change', dailyValues: 'Daily values', date: 'Date', rate: 'Rate', change: 'Change' },
  it: { loading: 'Caricamento storico…', error: 'Storico non disponibile. Riprova.', max: 'Massimo', min: 'Minimo', change30d: 'Var. 30g', dailyValues: 'Valori giornalieri', date: 'Data', rate: 'Tasso', change: 'Variazione' },
  el: { loading: 'Φόρτωση ιστορικού…', error: 'Το ιστορικό δεν είναι διαθέσιμο. Δοκιμάστε ξανά.', max: 'Μέγιστο', min: 'Ελάχιστο', change30d: 'Μεταβολή 30η', dailyValues: 'Ημερήσιες τιμές', date: 'Ημερομηνία', rate: 'Ισοτιμία', change: 'Μεταβολή' },
};

function buildRateMap({ all, usd, gbp, chf }) {
  return {
    EUR_ALL: all,       ALL_EUR: 1 / all,
    USD_ALL: all / usd, ALL_USD: usd / all,
    GBP_ALL: all / gbp, ALL_GBP: gbp / all,
    CHF_ALL: all / chf, ALL_CHF: chf / all,
    EUR_USD: usd,       USD_EUR: 1 / usd,
    EUR_GBP: gbp,       GBP_EUR: 1 / gbp,
    EUR_CHF: chf,       CHF_EUR: 1 / chf,
    USD_GBP: gbp / usd, GBP_USD: usd / gbp,
    USD_CHF: chf / usd, CHF_USD: usd / chf,
    GBP_CHF: chf / gbp, CHF_GBP: gbp / chf,
  };
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('sq-AL', { month: 'short', day: 'numeric' });
}

function fmtRate(val, to) {
  if (!val && val !== 0) return '—';
  const dec = to === 'ALL' ? 2 : 4;
  return val.toLocaleString('sq-AL', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

async function fetchDay(date) {
  try {
    const res = await fetch(`${CDN}@${date}/v1/currencies/eur.json`);
    if (!res.ok) return null;
    const json = await res.json();
    const { all, usd, gbp, chf } = json.eur ?? {};
    if (!all || !usd || !gbp || !chf) return null;
    return { date: json.date ?? date, raw: { all, usd, gbp, chf } };
  } catch { return null; }
}

export default function RateChart({ lang = 'sq' }) {
  const u = UI[lang] ?? UI.sq;
  const [pair, setPair]       = useState(PAIRS[0]);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const canvasRef             = useRef(null);
  const chartRef              = useRef(null);

  useEffect(() => {
    setLoading(true); setError(false); setData(null);

    // Fetch 35 días en paralelo desde el browser (sin límite de subrequests)
    const today = new Date();
    const dates = Array.from({ length: 35 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    Promise.allSettled(dates.map(fetchDay))
      .then(results => {
        const days = results
          .filter(r => r.status === 'fulfilled' && r.value !== null)
          .map(r => r.value)
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-30);

        if (days.length === 0) { setError(true); return; }

        const series = days.map((day, i) => {
          const map  = buildRateMap(day.raw);
          const rate = pair.from === pair.to ? 1 : (map[`${pair.from}_${pair.to}`] ?? 0);
          const prev = i === 0 ? null : (() => {
            const pm = buildRateMap(days[i - 1].raw);
            return pair.from === pair.to ? 1 : (pm[`${pair.from}_${pair.to}`] ?? 0);
          })();
          const change = prev ? ((rate - prev) / prev) * 100 : null;
          return { date: day.date, rate: parseFloat(rate.toFixed(6)), change };
        });

        const values = series.map(s => s.rate);
        const max = Math.max(...values), min = Math.min(...values);
        setData({ series, stats: { max, min, maxDate: series.find(s => s.rate === max)?.date, minDate: series.find(s => s.rate === min)?.date } });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [pair.from, pair.to]);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const { series } = data;
    const red = cssVar('--red-albania'), muted = cssVar('--ink-muted');
    const border = cssVar('--border-light'), bgCard = cssVar('--bg-card'), inkSec = cssVar('--ink-secondary');

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: series.map(s => fmtDate(s.date)),
        datasets: [{ data: series.map(s => s.rate), borderColor: red, backgroundColor: `${red}18`, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: red, pointHoverBorderColor: bgCard, pointHoverBorderWidth: 2, fill: true, tension: 0.35 }],
      },
      options: {
        responsive: true, maintainAspectRatio: true, aspectRatio: 2.2,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false, backgroundColor: bgCard, titleColor: inkSec, bodyColor: muted, borderColor: border, borderWidth: 1, padding: 10, callbacks: { title: items => items[0]?.label ?? '', label: ctx => `${fmtRate(ctx.parsed.y, pair.to)} ${pair.to}` } },
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: muted, font: { family: "'DM Sans', sans-serif", size: 11 }, maxTicksLimit: 7, maxRotation: 0 } },
          y: { position: 'right', grid: { color: border }, border: { display: false }, ticks: { color: muted, font: { family: "'DM Sans', sans-serif", size: 11 }, callback: val => fmtRate(val, pair.to), maxTicksLimit: 5 } },
        },
        interaction: { mode: 'index', intersect: false },
      },
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [data]);

  useEffect(() => () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } }, []);

  const { stats, series } = data ?? {};

  return (
    <div>
      <div className="pair-selector" role="group">
        {PAIRS.map(p => (
          <button key={`${p.from}_${p.to}`} onClick={() => setPair(p)}
            className={`pair-btn${pair.from === p.from && pair.to === p.to ? ' pair-btn--active' : ''}`}
            aria-pressed={pair.from === p.from && pair.to === p.to}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="chart-card">
        {loading && <div className="chart-placeholder"><i className="ti ti-loader-2" aria-hidden="true" /><p>{u.loading}</p></div>}
        {error   && <div className="chart-placeholder"><i className="ti ti-wifi-off" aria-hidden="true" /><p>{u.error}</p></div>}
        {!loading && !error && data && (
          <>
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">{u.max}</span>
                <span className="stat-value stat-value--high">
                  {fmtRate(stats.max, pair.to)}
                  <span className="stat-date">{stats.maxDate ? fmtDate(stats.maxDate) : ''}</span>
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{u.min}</span>
                <span className="stat-value stat-value--low">
                  {fmtRate(stats.min, pair.to)}
                  <span className="stat-date">{stats.minDate ? fmtDate(stats.minDate) : ''}</span>
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{u.change30d}</span>
                {(() => {
                  const first = series[0]?.rate, last = series[series.length - 1]?.rate;
                  const pct = first ? ((last - first) / first) * 100 : 0;
                  const cls = pct > 0.01 ? 'change-positive' : pct < -0.01 ? 'change-negative' : 'change-neutral';
                  return <span className={`stat-value ${cls}`}>{pct > 0 ? '+' : ''}{pct.toFixed(2)}%</span>;
                })()}
              </div>
            </div>
            <canvas ref={canvasRef} role="img" aria-label={`${pair.from}/${pair.to} — 30 ${u.dailyValues}`} />
          </>
        )}
      </div>

      {!loading && !error && data && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <p className="rates-summary-title">
            <i className="ti ti-table" aria-hidden="true" />
            {u.dailyValues} — {pair.from}/{pair.to}
          </p>
          <table className="rates-table">
            <thead><tr>
              <th scope="col">{u.date}</th>
              <th scope="col" style={{ textAlign: 'right' }}>{u.rate}</th>
              <th scope="col" style={{ textAlign: 'right' }}>{u.change}</th>
            </tr></thead>
            <tbody>
              {[...series].reverse().map(({ date, rate, change }) => {
                const cls = change === null ? 'change-neutral' : change > 0.005 ? 'change-positive' : change < -0.005 ? 'change-negative' : 'change-neutral';
                return (
                  <tr key={date}>
                    <td>{date}</td>
                    <td className="rate-val">{fmtRate(rate, pair.to)}</td>
                    <td className={`rate-val ${cls}`}>{change === null ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(2)}%`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
