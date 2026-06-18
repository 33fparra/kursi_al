import { useState, useEffect, useRef, useCallback } from 'react';

const CURRENCIES = ['ALL', 'EUR', 'USD', 'GBP', 'CHF'];
const CURRENCY_META = {
  ALL: { name: 'Lek',    flag: 'al' },
  EUR: { name: 'Euro',   flag: 'eu' },
  USD: { name: 'Dollar', flag: 'us' },
  GBP: { name: 'Paund',  flag: 'gb' },
  CHF: { name: 'Frank',  flag: 'ch' },
};
const QUICK = [100, 500, 1000, 5000];
const CDN   = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json';
const MAX_INT_DIGITS = 13;

const UI = {
  sq: { from: 'Dërgoj',   to: 'Merr',        loading: 'Duke ngarkuar…', swap: 'Ndrysho' },
  en: { from: 'I send',   to: 'They receive', loading: 'Loading…',       swap: 'Swap'    },
  it: { from: 'Invio',    to: 'Riceve',       loading: 'Caricamento…',   swap: 'Scambia' },
  el: { from: 'Αποστολή', to: 'Λαμβάνει',     loading: 'Φόρτωση…',       swap: 'Αλλαγή'  },
};

function buildRates({ all, usd, gbp, chf }) {
  return {
    EUR_ALL: all,       ALL_EUR: 1/all,
    USD_ALL: all/usd,   ALL_USD: usd/all,
    GBP_ALL: all/gbp,   ALL_GBP: gbp/all,
    CHF_ALL: all/chf,   ALL_CHF: chf/all,
    EUR_USD: usd,       USD_EUR: 1/usd,
    EUR_GBP: gbp,       GBP_EUR: 1/gbp,
    EUR_CHF: chf,       CHF_EUR: 1/chf,
    USD_GBP: gbp/usd,   GBP_USD: usd/gbp,
    USD_CHF: chf/usd,   CHF_USD: usd/chf,
    GBP_CHF: chf/gbp,   CHF_GBP: gbp/chf,
    ALL_ALL:1, EUR_EUR:1, USD_USD:1, GBP_GBP:1, CHF_CHF:1,
  };
}

/* ─── Albanian number format: dot=thousands, comma=decimal ─────────────── */
function addDots(intStr) {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function displayRaw(raw) {
  if (!raw) return '';
  const [int, dec] = raw.split(',');
  return dec !== undefined ? addDots(int) + ',' + dec : addDots(int);
}
function fmtResult(amount, currency) {
  if (!isFinite(amount) || isNaN(amount)) return '—';
  if (currency === 'ALL') return addDots(Math.round(amount).toString());
  // de-DE: same convention as Albanian (. thousands, , decimal)
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(amount);
}

/* ─── iPhone-style auto font size based on digit count ─────────────────── */
function autoSize(displayStr) {
  const digits = (displayStr.match(/\d/g) || []).length;
  if (digits <= 4)  return '3.2rem';
  if (digits <= 6)  return '2.8rem';
  if (digits <= 8)  return '2.2rem';
  if (digits <= 10) return '1.75rem';
  if (digits <= 12) return '1.35rem';
  return '1.05rem';
}

/* ─── Currency picker ───────────────────────────────────────────────────── */
function CurrencyPicker({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const meta = CURRENCY_META[value] ?? CURRENCY_META.EUR;

  return (
    <div ref={ref} className="cv-picker" style={{ flexShrink: 0 }}>
      <button
        type="button"
        className={`cv-picker-btn${open ? ' cv-picker-btn--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
      >
        <span className={`fi fi-${meta.flag} cv-flag`} aria-hidden="true" />
        <span className="cv-code">{value}</span>
        <i className={`ti ti-chevron-down cv-chevron${open ? ' cv-chevron--open' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <ul className="cv-picker-menu" role="listbox">
          {CURRENCIES.map(c => {
            const m = CURRENCY_META[c];
            return (
              <li key={c} role="option" aria-selected={c === value}>
                <button
                  type="button"
                  className={`cv-picker-option${c === value ? ' cv-picker-option--active' : ''}`}
                  onClick={() => { onChange(c); setOpen(false); }}
                >
                  <span className={`fi fi-${m.flag} cv-flag`} aria-hidden="true" />
                  <span className="cv-code">{c}</span>
                  <span className="cv-name">{m.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────────── */
export default function Converter({ initialRates = {}, lang = 'sq' }) {
  const u = UI[lang] ?? UI.sq;

  const [rawAmount, setRawAmount] = useState('100');
  const [from, setFrom]   = useState('EUR');
  const [to, setTo]       = useState('ALL');
  const [rates, setRates]       = useState(initialRates);
  const [date, setDate]         = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading]   = useState(Object.keys(initialRates).length === 0);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    async function load() {
      try {
        // Try cached rates.json first (written by GitHub Action trigger)
        const rj = await fetch('/data/rates.json').then(r => r.ok ? r.json() : null).catch(() => null);
        if (rj?.rates && rj?.date) {
          setRates(rj.rates);
          setDate(rj.date);
          setUpdatedAt(rj.updatedAt ?? null);
          setLoading(false);
          return;
        }
      } catch {}
      // Fall back to live fawazahmed0
      try {
        const json = await fetch(CDN).then(r => r.json());
        const { all, usd, gbp, chf } = json.eur ?? {};
        if (!all || !usd || !gbp || !chf) return;
        setRates(buildRates({ all, usd, gbp, chf }));
        setDate(json.date);
        setUpdatedAt(new Date().toISOString());
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const handleInput = useCallback(e => {
    // Strip thousands dots user may copy-paste; keep digits and one comma
    const stripped  = e.target.value.replace(/\./g, '');
    const clean     = stripped.replace(/[^\d,]/g, '');
    const parts     = clean.split(',');
    const normalized = parts.length > 2 ? parts[0] + ',' + parts.slice(1).join('') : clean;
    const [intP]    = normalized.split(',');
    if (intP && intP.length > MAX_INT_DIGITS) return;
    setRawAmount(normalized);
  }, []);

  if (!mounted) return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-line" style={{ height: '90px' }} />
      <div className="skeleton-line" style={{ marginTop: '8px', height: '12px', width: '50%' }} />
      <div className="skeleton-line" style={{ marginTop: '12px', height: '90px' }} />
    </div>
  );

  const numAmount     = parseFloat(rawAmount.replace(',', '.')) || 0;
  const rate          = rates[`${from}_${to}`] ?? 0;
  const result        = numAmount * rate;
  const displayInput  = displayRaw(rawAmount);
  const displayResult = loading ? u.loading : fmtResult(result, to);
  const rateLabel     = rate > 0 ? `1 ${from} = ${fmtResult(rate, to)} ${to}` : '…';

  return (
    <div className="cv-wrap">
      <div className="converter-card">

        {/* ── FROM block ─────────────────────────────────────────────── */}
        <div className="currency-block cv-block">
          <p className="cv-block-label">
            <i className="ti ti-send" aria-hidden="true" />
            {u.from}
          </p>

          {/* Number + picker in ONE flex row ── this is the key layout */}
          <div className="cv-row">
            <input
              type="text"
              inputMode="decimal"
              value={displayInput}
              onChange={handleInput}
              className="cv-input"
              style={{ fontSize: autoSize(displayInput) }}
              aria-label={`${u.from} — ${from}`}
              placeholder="0"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <CurrencyPicker value={from} onChange={setFrom} label={u.from} />
          </div>
        </div>

        {/* ── Swap ──────────────────────────────────────────────────── */}
        <button onClick={() => { setFrom(to); setTo(from); }} className="swap-btn" aria-label={u.swap}>
          <i className="ti ti-arrows-up-down" style={{ fontSize: '18px' }} aria-hidden="true" />
        </button>

        {/* ── TO / Result block ──────────────────────────────────────── */}
        <div className="currency-block currency-block--result cv-block">
          <p className="cv-block-label" style={{ color: 'var(--blue-info)' }}>
            <i className="ti ti-home" aria-hidden="true" />
            {u.to}
          </p>

          <div className="cv-row">
            <p
              className={`cv-result${loading ? ' cv-result--loading' : ''}`}
              style={{ fontSize: autoSize(displayResult) }}
              aria-live="polite"
              suppressHydrationWarning
            >
              {displayResult}
            </p>
            <CurrencyPicker value={to} onChange={setTo} label={u.to} />
          </div>
        </div>

        {/* ── Rate / date ────────────────────────────────────────────── */}
        <div className="converter-meta">
          <span className="rate-badge">
            <i className="ti ti-info-circle" style={{ fontSize: '13px' }} aria-hidden="true" />
            {rateLabel}
          </span>
          {(date || updatedAt) && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-muted)' }}>
              <i className="ti ti-clock" style={{ fontSize: '12px', verticalAlign: '-1px' }} aria-hidden="true" />
              {' '}{date}
              {updatedAt && (
                <> · {new Date(updatedAt).toLocaleTimeString(lang === 'en' ? 'en-GB' : 'sq-AL', { hour: '2-digit', minute: '2-digit' })}</>
              )}
            </span>
          )}
        </div>
      </div>

      {/* ── Quick amounts ──────────────────────────────────────────────── */}
      <div className="quick-amounts" role="group">
        {QUICK.map(q => (
          <button
            key={q}
            onClick={() => setRawAmount(String(q))}
            className={`quick-btn${rawAmount === String(q) ? ' quick-btn--active' : ''}`}
            aria-pressed={rawAmount === String(q)}
          >
            {addDots(String(q))}
          </button>
        ))}
      </div>
    </div>
  );
}
