import { useState, useEffect } from 'react';

const CURRENCIES = ['ALL', 'EUR', 'USD', 'GBP', 'CHF'];
const CURRENCY_NAMES = {
  ALL: 'Lek shqiptar', EUR: 'Euro', USD: 'Dollar amerikan',
  GBP: 'Paund britanik', CHF: 'Frank zviceran',
};
const QUICK_AMOUNTS = [100, 200, 500, 1000];
const CDN = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json';

const UI = {
  sq: { from: 'Dërgoj',   to: 'Familja merr',          loading: 'Duke ngarkuar…', source: 'leku.al' },
  en: { from: 'I send',   to: 'Family receives',        loading: 'Loading…',       source: 'leku.al' },
  it: { from: 'Invio',    to: 'La famiglia riceve',     loading: 'Caricamento…',   source: 'leku.al' },
  el: { from: 'Αποστολή', to: 'Η οικογένεια λαμβάνει', loading: 'Φόρτωση…',       source: 'leku.al' },
};

function buildRates({ all, usd, gbp, chf }) {
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
    ALL_ALL: 1, EUR_EUR: 1, USD_USD: 1, GBP_GBP: 1, CHF_CHF: 1,
  };
}

// Formateo consistente entre Node y browser (evita hydration mismatch)
function fmt(amount, currency) {
  if (!isFinite(amount) || isNaN(amount)) return '—';
  if (currency === 'ALL') {
    return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  return new Intl.NumberFormat('sq-AL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}

export default function Converter({ initialRates = {}, lang = 'sq' }) {
  const u = UI[lang] ?? UI.sq;
  const [amount, setAmount] = useState('100');
  const [from, setFrom]     = useState('EUR');
  const [to, setTo]         = useState('ALL');
  const [rates, setRates]   = useState(initialRates);
  const [date, setDate]     = useState(null);
  const [loading, setLoading] = useState(Object.keys(initialRates).length === 0);

  useEffect(() => {
    fetch(CDN)
      .then(r => r.json())
      .then(json => {
        const { all, usd, gbp, chf } = json.eur ?? {};
        if (!all || !usd || !gbp || !chf) return;
        setRates(buildRates({ all, usd, gbp, chf }));
        setDate(json.date);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const numAmount = parseFloat(amount.replace(',', '.')) || 0;
  const rate      = rates[`${from}_${to}`] ?? 0;
  const result    = numAmount * rate;

  function swap() { setFrom(to); setTo(from); }
  function handleAmountChange(e) {
    const v = e.target.value;
    if (/^[\d.,]*$/.test(v)) setAmount(v);
  }

  const rateLabel = rate > 0 ? `1 ${from} = ${fmt(rate, to)} ${to}` : '…';

  return (
    <div>
      <div className="converter-card">
        <div className="currency-block">
          <p className="currency-label">
            <i className="ti ti-building-bank" aria-hidden="true" />
            {u.from}
          </p>
          <input
            type="text" inputMode="decimal" value={amount}
            onChange={handleAmountChange} className="amount-input"
            aria-label={`${u.from} — ${from}`} placeholder="100" autoComplete="off"
          />
          <select value={from} onChange={e => setFrom(e.target.value)}
            className="currency-select" aria-label={u.from}>
            {CURRENCIES.map(c => (
              <option key={c} value={c}>{c} — {CURRENCY_NAMES[c]}</option>
            ))}
          </select>
        </div>

        <button onClick={swap} className="swap-btn" aria-label="Swap currencies">
          <i className="ti ti-arrows-up-down" style={{ fontSize: '18px' }} aria-hidden="true" />
        </button>

        <div className="currency-block currency-block--result">
          <p className="currency-label" style={{ color: 'var(--green-trend)' }}>
            <i className="ti ti-home" aria-hidden="true" />
            {u.to}
          </p>
          <p className={`result-amount${loading ? ' result-amount--loading' : ''}`}
            aria-live="polite" suppressHydrationWarning>
            {loading ? u.loading : fmt(result, to)}
          </p>
          <select value={to} onChange={e => setTo(e.target.value)}
            className="currency-select" aria-label={u.to}
            style={{ color: 'var(--green-trend)', marginTop: '8px' }}>
            {CURRENCIES.map(c => (
              <option key={c} value={c}>{c} — {CURRENCY_NAMES[c]}</option>
            ))}
          </select>
        </div>

        <div className="converter-meta">
          <span className="rate-badge">
            <i className="ti ti-info-circle" style={{ fontSize: '13px' }} aria-hidden="true" />
            {rateLabel} · {u.source}
          </span>
          {date && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
              <i className="ti ti-clock" style={{ fontSize: '12px', verticalAlign: '-1px' }} aria-hidden="true" />
              {' '}{date}
            </span>
          )}
        </div>
      </div>

      <div className="quick-amounts" role="group">
        {QUICK_AMOUNTS.map(q => (
          <button key={q} onClick={() => setAmount(String(q))}
            className={`quick-btn${amount === String(q) ? ' quick-btn--active' : ''}`}
            aria-pressed={amount === String(q)}>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
