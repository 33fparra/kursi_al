import { useState, useEffect } from 'react';

const CURRENCIES = ['ALL', 'EUR', 'USD', 'GBP', 'CHF'];
const CURRENCY_NAMES = {
  ALL: 'Lek shqiptar', EUR: 'Euro', USD: 'Dollar amerikan',
  GBP: 'Paund britanik', CHF: 'Frank zviceran',
};
const QUICK_AMOUNTS = [100, 200, 500, 1000];

const UI = {
  sq: { from: 'Dërgoj',     to: 'Familja merr',            loading: 'Duke ngarkuar…', source: 'BCE' },
  en: { from: 'I send',     to: 'Family receives',          loading: 'Loading…',       source: 'ECB' },
  it: { from: 'Invio',      to: 'La famiglia riceve',       loading: 'Caricamento…',   source: 'BCE' },
  el: { from: 'Αποστολή',   to: 'Η οικογένεια λαμβάνει',   loading: 'Φόρτωση…',       source: 'ΕΚΤ' },
};

function fmt(amount, currency) {
  if (!isFinite(amount) || isNaN(amount)) return '—';
  return new Intl.NumberFormat('sq-AL', {
    minimumFractionDigits: currency === 'ALL' ? 0 : 2,
    maximumFractionDigits: currency === 'ALL' ? 0 : 4,
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
    fetch('/api/rates.json')
      .then(r => r.json())
      .then(data => { if (data.rates) { setRates(data.rates); setDate(data.date); } })
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
        {/* FROM */}
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

        {/* Swap */}
        <button onClick={swap} className="swap-btn" aria-label="Swap currencies">
          <i className="ti ti-arrows-up-down" style={{ fontSize: '18px' }} aria-hidden="true" />
        </button>

        {/* TO / result */}
        <div className="currency-block currency-block--result">
          <p className="currency-label" style={{ color: 'var(--green-trend)' }}>
            <i className="ti ti-home" aria-hidden="true" />
            {u.to}
          </p>
          <p className={`result-amount${loading ? ' result-amount--loading' : ''}`}
            aria-live="polite">
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

        {/* Meta */}
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
