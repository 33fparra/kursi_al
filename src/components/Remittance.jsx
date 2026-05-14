import { useState, useEffect } from 'react';

const SEND_CURRENCIES = ['EUR', 'GBP', 'USD'];
const QUICK_AMOUNTS   = [100, 200, 500, 1000];

const UI = {
  sq: { sendLabel: 'Shuma që dërgon', rateReal: 'Kursi real', arrives: 'Familja merr', fee: 'Komisioni', hiddenCost: 'Kosto e fshehur (spread)', appliedRate: 'Kursi i aplikuar', best: '★ Më e mira', tagWise: 'Kursi real', tagRemitly: 'Komision i ulët', tagBank: 'Spread i lartë', btnWise: 'Dërgo me Wise', btnRemitly: 'Dërgo me Remitly', legal: 'Tarifat janë orientuese dhe mund të ndryshojnë. Kurset dhe komisionet verifikohen çdo javë. Kursi.al nuk mban përgjegjësi për diferencat ndërmjet tarifave të paraqitura dhe atyre reale.' },
  en: { sendLabel: 'Amount I send', rateReal: 'Mid-market rate', arrives: 'Family receives', fee: 'Fee', hiddenCost: 'Hidden cost (spread)', appliedRate: 'Applied rate', best: '★ Best deal', tagWise: 'Mid-market rate', tagRemitly: 'Low fee', tagBank: 'High spread', btnWise: 'Send with Wise', btnRemitly: 'Send with Remitly', legal: 'Rates are indicative and may change. Fees are verified weekly. Kursi.al is not responsible for differences between displayed and actual rates.' },
  it: { sendLabel: 'Importo che invio', rateReal: 'Tasso di mercato', arrives: 'La famiglia riceve', fee: 'Commissione', hiddenCost: 'Costo nascosto (spread)', appliedRate: 'Tasso applicato', best: '★ Migliore', tagWise: 'Tasso di mercato', tagRemitly: 'Commissione bassa', tagBank: 'Spread elevato', btnWise: 'Invia con Wise', btnRemitly: 'Invia con Remitly', legal: 'Le tariffe sono indicative e possono variare. Le commissioni vengono verificate ogni settimana. Kursi.al non è responsabile per le differenze tra le tariffe mostrate e quelle reali.' },
  el: { sendLabel: 'Ποσό που στέλνω', rateReal: 'Ισοτιμία αγοράς', arrives: 'Η οικογένεια λαμβάνει', fee: 'Προμήθεια', hiddenCost: 'Κρυφό κόστος (spread)', appliedRate: 'Εφαρμοσμένη ισοτιμία', best: '★ Καλύτερο', tagWise: 'Ισοτιμία αγοράς', tagRemitly: 'Χαμηλή προμήθεια', tagBank: 'Υψηλό spread', btnWise: 'Αποστολή με Wise', btnRemitly: 'Αποστολή με Remitly', legal: 'Οι τιμές είναι ενδεικτικές και ενδέχεται να αλλάξουν. Οι προμήθειες επαληθεύονται εβδομαδιαία. Το kursi.al δεν φέρει ευθύνη για τυχόν διαφορές μεταξύ των εμφανιζόμενων και των πραγματικών τιμών.' },
};

const PROVIDERS = [
  { id: 'wise',    nameKey: 'Wise',    tagCls: 'tag-green', fees: { EUR: { pct: 0.0095, fixed: 0 }, GBP: { pct: 0.0085, fixed: 0 }, USD: { pct: 0.012, fixed: 0 } }, rateSpread: 0,     affiliateUrl: 'https://wise.com',      btnKey: 'btnWise',    tagKey: 'tagWise'    },
  { id: 'remitly', nameKey: 'Remitly', tagCls: 'tag-blue',  fees: { EUR: { pct: 0, fixed: 3.99 }, GBP: { pct: 0, fixed: 2.99 }, USD: { pct: 0, fixed: 3.99 } }, rateSpread: 0.003, affiliateUrl: 'https://www.remitly.com', btnKey: 'btnRemitly', tagKey: 'tagRemitly' },
  { id: 'bank',    nameKey: 'Banka',   tagCls: 'tag-muted', fees: { EUR: { pct: 0, fixed: 0 }, GBP: { pct: 0, fixed: 0 }, USD: { pct: 0, fixed: 0 } },         rateSpread: 0.035, affiliateUrl: null,                    btnKey: null,         tagKey: 'tagBank'    },
];

function fmt(val, currency) {
  if (!isFinite(val) || isNaN(val)) return '—';
  return new Intl.NumberFormat('sq-AL', { minimumFractionDigits: currency === 'ALL' ? 0 : 2, maximumFractionDigits: currency === 'ALL' ? 0 : 2 }).format(val);
}

function calcArrives(provider, numAmount, currency, midRate) {
  const { pct, fixed } = provider.fees[currency];
  const effectiveRate  = midRate * (1 - provider.rateSpread);
  const feeAmount      = numAmount * pct + fixed;
  return { arrives: Math.max(0, (numAmount - feeAmount) * effectiveRate), feeAmount, effectiveRate };
}

export default function Remittance({ lang = 'sq' }) {
  const u = UI[lang] ?? UI.sq;
  const [amount, setAmount]   = useState('200');
  const [currency, setCurrency] = useState('EUR');
  const [rates, setRates]     = useState(null);

  useEffect(() => {
    fetch('/api/rates.json')
      .then(r => r.json())
      .then(d => { if (d.rates) setRates(d.rates); })
      .catch(() => {});
  }, []);

  const numAmount = parseFloat(amount.replace(',', '.')) || 0;
  const midRate   = rates ? (rates[`${currency}_ALL`] ?? 0) : 0;
  const results   = PROVIDERS.map(p => ({ ...p, ...calcArrives(p, numAmount, currency, midRate) }));
  const bestVal   = Math.max(...results.map(r => r.arrives));

  function openAffiliate(url) {
    // TODO: POST /api/track-click { provider, amount, currency } once Supabase is wired
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div>
      <div className="converter-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="currency-block" style={{ marginBottom: 0 }}>
          <p className="currency-label">
            <i className="ti ti-building-bank" aria-hidden="true" />
            {u.sendLabel}
          </p>
          <input type="text" inputMode="decimal" value={amount}
            onChange={e => { const v = e.target.value; if (/^[\d.,]*$/.test(v)) setAmount(v); }}
            className="amount-input" placeholder="200" autoComplete="off" aria-label={u.sendLabel} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {SEND_CURRENCIES.map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                className={`currency-pill${currency === c ? ' currency-pill--active' : ''}`}
                aria-pressed={currency === c}>{c}</button>
            ))}
          </div>
          <div className="quick-amounts" style={{ marginTop: 'var(--space-3)' }}>
            {QUICK_AMOUNTS.map(q => (
              <button key={q} onClick={() => setAmount(String(q))}
                className={`quick-btn${amount === String(q) ? ' quick-btn--active' : ''}`}
                aria-pressed={amount === String(q)}>{q}</button>
            ))}
          </div>
        </div>
      </div>

      {midRate > 0 && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <span className="rate-badge">
            <i className="ti ti-info-circle" style={{ fontSize: '13px' }} aria-hidden="true" />
            {u.rateReal}: 1 {currency} = {fmt(midRate, 'ALL')} ALL · BCE
          </span>
        </div>
      )}

      <div className="remit-table-wrap" role="list">
        {results.map(provider => {
          const isWinner = provider.arrives === bestVal && bestVal > 0;
          return (
            <div key={provider.id} className={`remit-row${isWinner ? ' remit-row--best' : ''}`} role="listitem">
              <div className="remit-row-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="remit-provider-name">{provider.nameKey}</span>
                  <span className={`remit-tag ${provider.tagCls}`}>{u[provider.tagKey]}</span>
                  {isWinner && <span className="remit-tag tag-best">{u.best}</span>}
                </div>
                {provider.affiliateUrl && (
                  <button className={`btn-affiliate btn-affiliate--${provider.id}`}
                    onClick={() => openAffiliate(provider.affiliateUrl)}>
                    {u[provider.btnKey]}
                    <i className="ti ti-external-link" style={{ fontSize: '14px' }} aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="remit-details">
                <div className="remit-detail-row">
                  <span>{u.appliedRate}</span>
                  <span>1 {currency} = {rates ? fmt(provider.effectiveRate, 'ALL') : '…'} ALL</span>
                </div>
                {provider.feeAmount > 0 && (
                  <div className="remit-detail-row">
                    <span>{u.fee}</span>
                    <span style={{ color: 'var(--ink-muted)' }}>−{fmt(provider.feeAmount, currency)} {currency}</span>
                  </div>
                )}
                {provider.id === 'bank' && (
                  <div className="remit-detail-row">
                    <span>{u.hiddenCost}</span>
                    <span style={{ color: 'var(--ink-muted)' }}>~3.5%</span>
                  </div>
                )}
                <div className="remit-detail-row remit-detail-row--total">
                  <span>{u.arrives}</span>
                  <span className={isWinner ? 'remit-arrives--best' : 'remit-arrives'}>
                    {rates ? fmt(provider.arrives, 'ALL') : '…'} ALL
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="legal-note">
        <i className="ti ti-shield" style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }} aria-hidden="true" />
        {u.legal}
      </p>
    </div>
  );
}
