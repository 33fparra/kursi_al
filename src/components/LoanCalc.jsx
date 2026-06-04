import { useState, useCallback, useEffect } from 'react';

const TR = {
  sq: {
    amount: 'Shuma e kredisë', rate: 'Norma vjetore (%)', months: 'Afati (muaj)',
    selectBank: 'Zgjidhni bankën', customRate: 'Normë manuale',
    monthly: 'Kësti mujor', total: 'Totali i paguar', interest: 'Interesi total',
    compare: 'Krahasim i bankave',
    morePerMonth: '/muaj më shumë', best: 'Më e mira',
    note: 'Llogaritja është indikative. NKAP (norma efektive) mund të jetë më e lartë.',
  },
  en: {
    amount: 'Loan amount', rate: 'Annual rate (%)', months: 'Term (months)',
    selectBank: 'Select bank', customRate: 'Custom rate',
    monthly: 'Monthly payment', total: 'Total paid', interest: 'Total interest',
    compare: 'Bank comparison',
    morePerMonth: '/month more', best: 'Best',
    note: 'Calculation is indicative. APR (effective rate) may be higher.',
  },
  it: {
    amount: 'Importo prestito', rate: 'Tasso annuo (%)', months: 'Durata (mesi)',
    selectBank: 'Seleziona banca', customRate: 'Tasso manuale',
    monthly: 'Rata mensile', total: 'Totale pagato', interest: 'Interessi totali',
    compare: 'Confronto banche',
    morePerMonth: '/mese in più', best: 'Migliore',
    note: 'Il calcolo è indicativo. Il TAEG può essere più alto.',
  },
};

function calcLoan(amount, annualRatePct, months) {
  if (!amount || !months) return null;
  if (annualRatePct === 0) {
    const m = amount / months;
    return { monthly: m, totalPaid: amount, totalInterest: 0 };
  }
  const r = annualRatePct / 100 / 12;
  const n = months;
  const monthly = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPaid = monthly * n;
  return { monthly, totalPaid, totalInterest: totalPaid - amount };
}

function fmt(v, currency) {
  const r = Math.round(v);
  return currency === 'ALL'
    ? new Intl.NumberFormat('sq-AL').format(r) + ' L'
    : '€' + new Intl.NumberFormat('de-DE').format(r);
}

const MONTH_OPTIONS = [6, 12, 24, 36, 48, 60, 84];

/** @param {{ banks?: Record<string,any>[], currency?: string, lang?: string }} props */
export default function LoanCalc({ banks = [], currency = 'ALL', lang = 'sq' }) {
  const tr = TR[lang] ?? TR.sq;
  const defaultAmount = currency === 'ALL' ? 500000 : 5000;

  // ── ALL HOOKS BEFORE ANY RETURN ──────────────────────
  const [amount, setAmount]             = useState(defaultAmount);
  const [rate, setRate]                 = useState(banks[0]?.loanRatePct ?? 12);
  const [months, setMonths]             = useState(36);
  const [selectedBank, setSelectedBank] = useState(banks[0]?.name ?? '');
  const [mounted, setMounted]           = useState(false);

  useEffect(() => setMounted(true), []);

  const handleBankChange = useCallback((name) => {
    setSelectedBank(name);
    const bank = banks.find(b => b.name === name);
    if (bank) setRate(bank.loanRatePct);
  }, [banks]);

  const MAX_LOAN = 50_000_000_000; // 50 billion
  const handleAmountInput = useCallback((e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    const n = Number(raw) || 0;
    setAmount(Math.min(n, MAX_LOAN));
  }, []);
  // ─────────────────────────────────────────────────────

  if (!mounted) return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-line" /><div className="skeleton-line skeleton-line--lg" />
      <div className="skeleton-line" /><div className="skeleton-line skeleton-line--lg" />
    </div>
  );

  const result = calcLoan(amount, rate, months);
  const bestRate = banks.length ? Math.min(...banks.map(b => b.loanRatePct)) : rate;

  return (
    <div className="mc-wrap">
      {/* ── Inputs ── */}
      <div className="mc-inputs">
        <div className="mc-field">
          <label className="mc-label">{tr.amount}</label>
          <div className="mc-amount-wrap">
            <span className="mc-symbol">{currency === 'ALL' ? 'L' : '€'}</span>
            <input
              type="text"
              inputMode="numeric"
              className="mc-amount-input"
              value={amount.toLocaleString('de-DE')}
              onChange={handleAmountInput}
              aria-label={tr.amount}
            />
          </div>
        </div>

        {/* Bank pills */}
        {banks.length > 0 && (
          <div className="mc-field">
            <label className="mc-label">{tr.selectBank}</label>
            <div className="mc-bank-pills">
              {banks.map(b => (
                <button
                  key={b.name}
                  className={`mc-bank-pill${selectedBank === b.name ? ' mc-bank-pill--active' : ''}`}
                  onClick={() => handleBankChange(b.name)}
                >
                  <span className="mc-bank-pill-name">{b.shortName ?? b.name}</span>
                  <span className="mc-bank-pill-rate">{b.loanRatePct.toFixed(2)}%</span>
                </button>
              ))}
              <button
                className={`mc-bank-pill${!banks.find(b => b.name === selectedBank) ? ' mc-bank-pill--active' : ''}`}
                onClick={() => setSelectedBank('')}
              >
                <span className="mc-bank-pill-name">{tr.customRate}</span>
              </button>
            </div>
            {!banks.find(b => b.name === selectedBank) && (
              <input
                type="number"
                step="0.1"
                min="1"
                max="50"
                className="mc-rate-input"
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
              />
            )}
          </div>
        )}

        {/* Months */}
        <div className="mc-field">
          <label className="mc-label">{tr.months}</label>
          <div className="mc-years-grid">
            {MONTH_OPTIONS.map(m => (
              <button
                key={m}
                className={`mc-year-btn${months === m ? ' mc-year-btn--active' : ''}`}
                onClick={() => setMonths(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Result ── */}
      {result && (
        <div className="mc-result-panel">
          <div className="mc-result-main">
            <span className="mc-result-label">{tr.monthly}</span>
            <span className="mc-result-amount">{fmt(result.monthly, currency)}</span>
          </div>

          <div className="mc-breakdown">
            <div className="mc-breakdown-row">
              <span>{tr.total}</span>
              <strong>{fmt(result.totalPaid, currency)}</strong>
            </div>
            <div className="mc-breakdown-row">
              <span>{tr.interest}</span>
              <strong className="mc-interest">{fmt(result.totalInterest, currency)}</strong>
            </div>
          </div>

          {result.totalPaid > 0 && (
            <div className="mc-bar-wrap">
              <div className="mc-bar-principal" style={{ width: `${(amount / result.totalPaid * 100).toFixed(1)}%` }} />
              <div className="mc-bar-interest" />
            </div>
          )}
          <div className="mc-bar-legend">
            <span className="mc-legend-dot mc-legend-dot--principal" />
            <span>{fmt(amount, currency)} principal</span>
            <span className="mc-legend-dot mc-legend-dot--interest" />
            <span>{fmt(result.totalInterest, currency)} {tr.interest.toLowerCase()}</span>
          </div>

          {banks.length > 1 && (
            <div className="mc-compare">
              <p className="mc-compare-title">{tr.compare}</p>
              <div className="mc-compare-list">
                {banks.map(b => {
                  const r = calcLoan(amount, b.loanRatePct, months);
                  const diff = r ? r.monthly - result.monthly : 0;
                  const isBest = b.loanRatePct === bestRate;
                  const isCurrent = b.name === selectedBank;
                  return (
                    <button
                      key={b.name}
                      className={`mc-compare-row${isCurrent ? ' mc-compare-row--current' : ''}`}
                      onClick={() => handleBankChange(b.name)}
                    >
                      <span className="mc-cmp-name">
                        {b.shortName ?? b.name}
                        {isBest && <span className="mc-cmp-best"> ★</span>}
                      </span>
                      <span className="mc-cmp-rate">{b.loanRatePct.toFixed(2)}%</span>
                      {r && (
                        <span className={`mc-cmp-diff${diff > 0 ? ' mc-cmp-diff--worse' : diff < 0 ? ' mc-cmp-diff--better' : ''}`}>
                          {diff === 0 ? '—' : diff > 0 ? `+${fmt(diff, currency)}${tr.morePerMonth}` : `${fmt(-diff, currency)} ${tr.best}`}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="mc-note">
        <i className="ti ti-info-circle" aria-hidden="true" />
        {tr.note}
      </p>
    </div>
  );
}
