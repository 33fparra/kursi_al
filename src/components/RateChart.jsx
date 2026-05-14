import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const PAIRS = [
  { from: 'EUR', to: 'ALL', label: 'EUR → ALL' },
  { from: 'USD', to: 'ALL', label: 'USD → ALL' },
  { from: 'GBP', to: 'ALL', label: 'GBP → ALL' },
  { from: 'CHF', to: 'ALL', label: 'CHF → ALL' },
];

const UI = {
  sq: { loading: 'Po ngarkohet historiku…', error: 'Historiku nuk është i disponueshëm. Provo përsëri.', max: 'Maksimumi', min: 'Minimumi', change30d: 'Ndryshimi 30d', dailyValues: 'Vlerat ditore', date: 'Data', rate: 'Kursi', change: 'Ndryshimi' },
  en: { loading: 'Loading history…', error: 'History unavailable. Please try again.', max: 'Maximum', min: 'Minimum', change30d: '30d change', dailyValues: 'Daily values', date: 'Date', rate: 'Rate', change: 'Change' },
  it: { loading: 'Caricamento storico…', error: 'Storico non disponibile. Riprova.', max: 'Massimo', min: 'Minimo', change30d: 'Var. 30g', dailyValues: 'Valori giornalieri', date: 'Data', rate: 'Tasso', change: 'Variazione' },
  el: { loading: 'Φόρτωση ιστορικού…', error: 'Το ιστορικό δεν είναι διαθέσιμο. Δοκιμάστε ξανά.', max: 'Μέγιστο', min: 'Ελάχιστο', change30d: 'Μεταβολή 30η', dailyValues: 'Ημερήσιες τιμές', date: 'Ημερομηνία', rate: 'Ισοτιμία', change: 'Μεταβολή' },
};

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
    fetch(`/api/history.json?from=${pair.from}&to=${pair.to}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [pair.from, pair.to]);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

    const labels = data.series.map(s => fmtDate(s.date));
    const values = data.series.map(s => s.rate);
    const red    = cssVar('--red-albania');
    const muted  = cssVar('--ink-muted');
    const border = cssVar('--border-light');
    const bgCard = cssVar('--bg-card');
    const inkSec = cssVar('--ink-secondary');

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{ data: values, borderColor: red, backgroundColor: `${red}18`, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: red, pointHoverBorderColor: bgCard, pointHoverBorderWidth: 2, fill: true, tension: 0.35 }],
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
          <button key={`${p.from}_${p.to}`}
            onClick={() => setPair(p)}
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
            <thead>
              <tr>
                <th scope="col">{u.date}</th>
                <th scope="col" style={{ textAlign: 'right' }}>{u.rate}</th>
                <th scope="col" style={{ textAlign: 'right' }}>{u.change}</th>
              </tr>
            </thead>
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
