import { useState, useEffect, useCallback } from 'react';

// ── i18n ─────────────────────────────────────────────────────────────────────
const TR = {
  sq: {
    title: 'Sa mund të marr me hipotekë?',
    subtitle: 'Zbulo nëse kualifikohesh dhe sa të mëdha janë shanset tua sipas çdo banke.',
    step: 'Hapi',
    of: 'nga',
    // Step 1
    s1title: 'Kush jeni?',
    pRezident: 'Banor/e lokal/e',
    pRezidentDesc: 'Jetoj dhe punoj në Shqipëri/Kosovë',
    pDiaspora: 'Diaspora',
    pDiasporaDesc: 'Shqiptar/Kosovar që jeton jashtë vendit',
    pForeigner: 'Shtetas/e i/e huaj',
    pForeignerDesc: 'Jo-shtetas shqiptar/kosovar',
    // Step 2
    s2title: 'Financat tuaja',
    grossLabel: 'Paga bruto mujore',
    obligLabel: 'Detyrime mujore ekzistuese',
    obligHint: 'Kredi, liza ose shlyerje të tjera mujore',
    downLabel: 'Paradhënie e disponueshme (PIE)',
    downHint: 'Sa para keni gati për pagesën fillestare',
    termLabel: 'Afati i dëshiruar i hipotekës',
    termYears: 'vjet',
    residencyLabel: 'A keni leje qëndrimi të vlefshme?',
    yes: 'Po', no: 'Jo',
    // Step 3
    s3title: 'Punësimi',
    contractLabel: 'Lloji i kontratës',
    cIndefinite: 'Kontratë e pacaktuar (pa afat)',
    cFixed: 'Kontratë me afat të caktuar',
    cSelf: 'Vetëpunësim / Biznes',
    monthsLabel: 'Sa muaj në punën aktuale?',
    // Results
    rTitle: 'Rezultati i vlerësimit',
    rMax: 'Hipoteka maksimale',
    rProperty: 'Çmimi maks. i pronës',
    rMonthly: 'Kësti mujor i vlerësuar',
    rDown: 'Paradhënie e nevojshme',
    rNetSalary: 'Paga neto e vlerësuar',
    rMaxPayment: 'Pagesa maks. mujore e lejuar',
    yes_el: '✅ E mundshme',
    cond_el: '⚠️ Me kusht',
    no_el: '❌ E pamundur',
    bankNote: 'Kushte specifike',
    diasporaNote: 'Monedha e huaj e pranuar',
    disclaimer: 'Ky vlerësim është indikativ dhe nuk përbën ofertë bankare. Kontaktoni bankën për ofertë zyrtare.',
    next: 'Vazhdoni →',
    back: '← Kthehu',
    calculate: 'Llogarit →',
    restart: 'Fillo nga fillimi',
    checksPassed: 'Kushtet e plotësuara',
    checksFailed: 'Kushtet e mungura',
    netApprox: '(e llogaritur automatikisht)',
    foreignNetNote: 'Për të ardhura të huaja, paga neto llogaritet si 75% e brutos (vlerësim konservator).',
  },
  en: {
    title: 'How much mortgage can I get?',
    subtitle: 'Find out if you qualify and what your chances are at each bank.',
    step: 'Step',
    of: 'of',
    s1title: 'Who are you?',
    pRezident: 'Local resident',
    pRezidentDesc: 'I live and work in Albania/Kosovo',
    pDiaspora: 'Diaspora',
    pDiasporaDesc: 'Albanian/Kosovar citizen living abroad',
    pForeigner: 'Foreign national',
    pForeignerDesc: 'Non-Albanian/Kosovar citizen',
    s2title: 'Your finances',
    grossLabel: 'Monthly gross salary',
    obligLabel: 'Existing monthly obligations',
    obligHint: 'Loans, leases or other monthly repayments',
    downLabel: 'Available down payment',
    downHint: 'How much you have ready for the initial payment',
    termLabel: 'Desired mortgage term',
    termYears: 'years',
    residencyLabel: 'Do you have a valid residency permit?',
    yes: 'Yes', no: 'No',
    s3title: 'Employment',
    contractLabel: 'Contract type',
    cIndefinite: 'Indefinite (permanent) contract',
    cFixed: 'Fixed-term contract',
    cSelf: 'Self-employed / Business owner',
    monthsLabel: 'How many months at current job?',
    rTitle: 'Eligibility assessment',
    rMax: 'Maximum mortgage',
    rProperty: 'Max. property price',
    rMonthly: 'Estimated monthly payment',
    rDown: 'Required down payment',
    rNetSalary: 'Estimated net salary',
    rMaxPayment: 'Max. allowed monthly payment',
    yes_el: '✅ Eligible',
    cond_el: '⚠️ Conditional',
    no_el: '❌ Not eligible',
    bankNote: 'Specific conditions',
    diasporaNote: 'Foreign currency accepted',
    disclaimer: 'This assessment is indicative and does not constitute a bank offer. Contact the bank for an official quote.',
    next: 'Continue →',
    back: '← Back',
    calculate: 'Calculate →',
    restart: 'Start over',
    checksPassed: 'Requirements met',
    checksFailed: 'Missing requirements',
    netApprox: '(automatically calculated)',
    foreignNetNote: 'For foreign income, net salary is estimated at 75% of gross (conservative estimate).',
  },
};

const TERM_OPTIONS = [10, 15, 20, 25, 30];
const MONTHS_OPTIONS = [1, 3, 6, 9, 12, 24, 36, 60];

// ── Salary calculation ────────────────────────────────────────────────────────
function calcNetSalary(gross, country) {
  if (!gross || gross <= 0) return 0;
  if (country === 'al') {
    const social = gross * 0.095;
    const health = gross * 0.017;
    let tax = 0;
    if (gross <= 30000) tax = 0;
    else if (gross <= 150000) tax = (gross - 30000) * 0.13;
    else tax = (150000 - 30000) * 0.13 + (gross - 150000) * 0.23;
    return Math.max(0, gross - social - health - tax);
  } else {
    const pension = gross * 0.05;
    let tax = 0;
    if (gross <= 80) tax = 0;
    else if (gross <= 250) tax = (gross - 80) * 0.04;
    else if (gross <= 450) tax = (250 - 80) * 0.04 + (gross - 250) * 0.08;
    else tax = (250 - 80) * 0.04 + (450 - 250) * 0.08 + (gross - 450) * 0.10;
    return Math.max(0, gross - pension - tax);
  }
}

function maxLoanFromPayment(monthlyPayment, annualRatePct, years) {
  if (!monthlyPayment || monthlyPayment <= 0 || years <= 0) return 0;
  if (annualRatePct === 0) return monthlyPayment * years * 12;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  return monthlyPayment * ((Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));
}

function calcMonthly(loan, annualRatePct, years) {
  if (!loan || loan <= 0 || years <= 0) return 0;
  if (annualRatePct === 0) return loan / (years * 12);
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  return (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function addDots(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function fmtC(amount, currency) {
  const r = Math.round(amount);
  return currency === 'ALL' ? addDots(r) + ' L' : '€' + addDots(r);
}

// ── Bank evaluation per profile ───────────────────────────────────────────────
function evaluateBank(bank, profile, netSalary, obligations, downPayment, contractType, monthsEmployed, hasResidency, term, tr) {
  const p = bank.profiles?.[profile];
  if (!p) return { eligible: 'no', reason: 'Profile not supported', maxLoan: 0, maxProperty: 0 };
  if (p.eligible === 'no') return { eligible: 'no', note: p.note, maxLoan: 0, maxProperty: 0, checks: [] };

  const checks = [];
  let eligible = 'yes';

  // Employment months
  if (monthsEmployed < (p.minMonthsEmployed ?? 0)) {
    checks.push({ ok: false, text: `≥ ${p.minMonthsEmployed} muaj punësim (${tr.checksFailed})` });
    eligible = 'conditional';
  } else if (p.minMonthsEmployed > 0) {
    checks.push({ ok: true, text: `${p.minMonthsEmployed}+ muaj punësim` });
  }

  // Contract type
  if (contractType === 'fixed' && !p.acceptsFixed) {
    checks.push({ ok: false, text: 'Kontratë e pacaktuar e nevojshme' });
    eligible = 'conditional';
  }
  if (contractType === 'self' && !p.acceptsSelf) {
    checks.push({ ok: false, text: 'Nuk pranon vetëpunësimin' });
    eligible = 'conditional';
  }

  // Residency (foreigners)
  if (profile === 'foreigner' && p.requiresResidency && !hasResidency) {
    checks.push({ ok: false, text: 'Leje qëndrimi e nevojshme' });
    eligible = 'conditional';
  } else if (profile === 'foreigner' && p.requiresResidency) {
    checks.push({ ok: true, text: 'Leje qëndrimi ✓' });
  }

  // Financial calculation
  const dti = p.maxDTI ?? 0.35;
  const minDown = p.minDownPct ?? 0.20;
  const maxPayment = Math.max(0, netSalary * dti - (obligations || 0));
  const maxLoanByPayment = maxLoanFromPayment(maxPayment, bank.mortgageRatePct, term);

  // Down payment limits property price
  const maxPropertyByDown = (downPayment || 0) > 0 ? (downPayment / minDown) : Infinity;
  const maxLoanByDown = maxPropertyByDown < Infinity ? maxPropertyByDown * (1 - minDown) : Infinity;

  const maxLoan = Math.min(maxLoanByPayment, maxLoanByDown < Infinity ? maxLoanByDown : maxLoanByPayment);
  const maxProperty = maxLoan / (1 - minDown);
  const requiredDown = maxProperty * minDown;
  const estimatedMonthly = calcMonthly(maxLoan, bank.mortgageRatePct, term);

  // Check if salary is too low
  if (maxPayment <= 0 || maxLoan <= 0) {
    eligible = 'no';
  }

  return {
    eligible,
    checks,
    note: p.note,
    diasporaNote: p.foreignCurrencies ? p.foreignCurrencies.join(', ') : null,
    maxLoan,
    maxProperty,
    requiredDown,
    estimatedMonthly,
    rate: bank.mortgageRatePct,
    dti,
    minDown,
    maxPayment,
  };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MortgageEligibility({ country = 'al', currency = 'ALL', eligibilityData = {}, lang = 'sq' }) {
  const tr = TR[lang] ?? TR.sq;
  const banks = eligibilityData.banks ?? [];

  const [mounted, setMounted] = useState(false);
  const [step, setStep]       = useState(0); // 0=profile 1=finance 2=employment 3=results
  const [profile, setProfile] = useState(null);      // rezident | diaspora | foreigner
  const [gross, setGross]     = useState('');
  const [oblig, setOblig]     = useState('');
  const [down, setDown]       = useState('');
  const [term, setTerm]       = useState(20);
  const [contract, setContract] = useState('indefinite');
  const [months, setMonths]   = useState(12);
  const [residency, setResidency] = useState(null);  // null | true | false

  useEffect(() => setMounted(true), []);
  if (!mounted) return (
    <div className="skeleton-card" style={{ minHeight: '260px' }} aria-hidden="true">
      <div className="skeleton-line" /><div className="skeleton-line skeleton-line--lg" />
      <div className="skeleton-line skeleton-line--sm" />
    </div>
  );

  const grossNum = parseFloat(String(gross).replace(/\./g, '').replace(',', '.')) || 0;
  const obligNum = parseFloat(String(oblig).replace(/\./g, '').replace(',', '.')) || 0;
  const downNum  = parseFloat(String(down).replace(/\./g, '').replace(',', '.')) || 0;

  // Net salary: diaspora/foreigner get ~75% approximation (unknown foreign tax)
  const netSalary = (profile === 'diaspora' || profile === 'foreigner')
    ? grossNum * 0.75
    : calcNetSalary(grossNum, country);

  // Compute results
  const results = banks.map(b => ({
    bank: b,
    eval: evaluateBank(b, profile ?? 'rezident', netSalary, obligNum, downNum, contract, months, residency, term, tr),
  }));

  const bestResult = results
    .filter(r => r.eval.eligible !== 'no' && r.eval.maxLoan > 0)
    .sort((a, b) => b.eval.maxLoan - a.eval.maxLoan)[0];

  const canNext0 = !!profile;
  const canNext1 = grossNum > 0 && downNum >= 0 && (profile !== 'foreigner' || residency !== null);
  const canCalc  = grossNum > 0;

  const STEPS_COUNT = 3;

  function handleNumber(setter) {
    return e => {
      const raw = e.target.value.replace(/\./g, '').replace(/[^\d,]/g, '');
      setter(raw);
    };
  }

  function fmtInput(raw) {
    const [int, dec] = String(raw).split(',');
    return dec !== undefined ? addDots(int || '0') + ',' + dec : (int ? addDots(int) : '');
  }

  // ── STEP 0: Profile ─────────────────────────────────────────────────────────
  if (step === 0) return (
    <div className="elig-wrap">
      <div className="elig-steps">
        {[0,1,2,3].map(i => <div key={i} className={`elig-step-dot${i === step ? ' elig-step-dot--active' : i < step ? ' elig-step-dot--done' : ''}`} />)}
      </div>
      <h2 className="elig-step-title">{tr.s1title}</h2>
      <div className="elig-profile-grid">
        {[
          { key: 'rezident',  icon: 'ti-home-2',     label: tr.pRezident,  desc: tr.pRezidentDesc },
          { key: 'diaspora',  icon: 'ti-plane',       label: tr.pDiaspora,  desc: tr.pDiasporaDesc },
          { key: 'foreigner', icon: 'ti-passport',    label: tr.pForeigner, desc: tr.pForeignerDesc },
        ].map(p => (
          <button
            key={p.key}
            type="button"
            className={`elig-profile-card${profile === p.key ? ' elig-profile-card--active' : ''}`}
            onClick={() => setProfile(p.key)}
          >
            <i className={`ti ${p.icon} elig-profile-icon`} aria-hidden="true" />
            <span className="elig-profile-label">{p.label}</span>
            <span className="elig-profile-desc">{p.desc}</span>
          </button>
        ))}
      </div>
      <button className="elig-next-btn" disabled={!canNext0} onClick={() => setStep(1)}>
        {tr.next}
      </button>
    </div>
  );

  // ── STEP 1: Finance ─────────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="elig-wrap">
      <div className="elig-steps">
        {[0,1,2,3].map(i => <div key={i} className={`elig-step-dot${i === step ? ' elig-step-dot--active' : i < step ? ' elig-step-dot--done' : ''}`} />)}
      </div>
      <h2 className="elig-step-title">{tr.s2title}</h2>

      <div className="elig-fields">
        {/* Gross salary */}
        <div className="elig-field">
          <label className="elig-label">{tr.grossLabel}</label>
          {(profile === 'diaspora' || profile === 'foreigner') && (
            <p className="elig-hint">{tr.foreignNetNote}</p>
          )}
          <div className="elig-input-row">
            <span className="elig-symbol">{currency === 'ALL' ? 'L' : '€'}</span>
            <input
              type="text" inputMode="decimal"
              className="elig-input"
              value={fmtInput(gross)}
              onChange={handleNumber(setGross)}
              placeholder={currency === 'ALL' ? '60.000' : '1.200'}
            />
          </div>
          {grossNum > 0 && (
            <p className="elig-net-preview">
              ≈ {fmtC(netSalary, currency)} neto/muaj {tr.netApprox}
            </p>
          )}
        </div>

        {/* Existing obligations */}
        <div className="elig-field">
          <label className="elig-label">{tr.obligLabel}</label>
          <p className="elig-hint">{tr.obligHint}</p>
          <div className="elig-input-row">
            <span className="elig-symbol">{currency === 'ALL' ? 'L' : '€'}</span>
            <input
              type="text" inputMode="decimal"
              className="elig-input"
              value={fmtInput(oblig)}
              onChange={handleNumber(setOblig)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Down payment */}
        <div className="elig-field">
          <label className="elig-label">{tr.downLabel}</label>
          <p className="elig-hint">{tr.downHint}</p>
          <div className="elig-input-row">
            <span className="elig-symbol">{currency === 'ALL' ? 'L' : '€'}</span>
            <input
              type="text" inputMode="decimal"
              className="elig-input"
              value={fmtInput(down)}
              onChange={handleNumber(setDown)}
              placeholder={currency === 'ALL' ? '1.500.000' : '15.000'}
            />
          </div>
        </div>

        {/* Term */}
        <div className="elig-field">
          <label className="elig-label">{tr.termLabel}</label>
          <div className="mc-years-grid">
            {TERM_OPTIONS.map(y => (
              <button key={y} type="button"
                className={`mc-year-btn${term === y ? ' mc-year-btn--active' : ''}`}
                onClick={() => setTerm(y)}>
                {y} {tr.termYears}
              </button>
            ))}
          </div>
        </div>

        {/* Residency — foreigners only */}
        {profile === 'foreigner' && (
          <div className="elig-field">
            <label className="elig-label">{tr.residencyLabel}</label>
            <div className="elig-radio-row">
              <button type="button"
                className={`elig-radio-btn${residency === true ? ' elig-radio-btn--active' : ''}`}
                onClick={() => setResidency(true)}>{tr.yes}</button>
              <button type="button"
                className={`elig-radio-btn${residency === false ? ' elig-radio-btn--active' : ''}`}
                onClick={() => setResidency(false)}>{tr.no}</button>
            </div>
          </div>
        )}
      </div>

      <div className="elig-btn-row">
        <button className="elig-back-btn" onClick={() => setStep(0)}>{tr.back}</button>
        <button className="elig-next-btn" disabled={!canNext1} onClick={() => setStep(2)}>{tr.next}</button>
      </div>
    </div>
  );

  // ── STEP 2: Employment ──────────────────────────────────────────────────────
  if (step === 2) return (
    <div className="elig-wrap">
      <div className="elig-steps">
        {[0,1,2,3].map(i => <div key={i} className={`elig-step-dot${i === step ? ' elig-step-dot--active' : i < step ? ' elig-step-dot--done' : ''}`} />)}
      </div>
      <h2 className="elig-step-title">{tr.s3title}</h2>

      <div className="elig-fields">
        {/* Contract type */}
        <div className="elig-field">
          <label className="elig-label">{tr.contractLabel}</label>
          <div className="elig-contract-grid">
            {[
              { key: 'indefinite', label: tr.cIndefinite, icon: 'ti-file-check' },
              { key: 'fixed',      label: tr.cFixed,      icon: 'ti-file-time' },
              { key: 'self',       label: tr.cSelf,       icon: 'ti-briefcase' },
            ].map(c => (
              <button key={c.key} type="button"
                className={`elig-contract-btn${contract === c.key ? ' elig-contract-btn--active' : ''}`}
                onClick={() => setContract(c.key)}>
                <i className={`ti ${c.icon}`} aria-hidden="true" />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Months employed */}
        <div className="elig-field">
          <label className="elig-label">{tr.monthsLabel}</label>
          <div className="mc-years-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {MONTHS_OPTIONS.map(m => (
              <button key={m} type="button"
                className={`mc-year-btn${months === m ? ' mc-year-btn--active' : ''}`}
                onClick={() => setMonths(m)}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="elig-btn-row">
        <button className="elig-back-btn" onClick={() => setStep(1)}>{tr.back}</button>
        <button className="elig-next-btn" onClick={() => setStep(3)}>{tr.calculate}</button>
      </div>
    </div>
  );

  // ── STEP 3: Results ─────────────────────────────────────────────────────────
  const eligibleCount    = results.filter(r => r.eval.eligible === 'yes').length;
  const conditionalCount = results.filter(r => r.eval.eligible === 'conditional').length;

  return (
    <div className="elig-wrap">
      <div className="elig-steps">
        {[0,1,2,3].map(i => <div key={i} className={`elig-step-dot${i === step ? ' elig-step-dot--active' : i < step ? ' elig-step-dot--done' : ''}`} />)}
      </div>
      <h2 className="elig-step-title">{tr.rTitle}</h2>

      {/* Summary card */}
      {bestResult && bestResult.eval.maxLoan > 0 && (
        <div className="elig-summary-card">
          <div className="elig-summary-row">
            <div className="elig-summary-item">
              <span className="elig-summary-label">{tr.rMax}</span>
              <span className="elig-summary-value">{fmtC(bestResult.eval.maxLoan, currency)}</span>
            </div>
            <div className="elig-summary-item">
              <span className="elig-summary-label">{tr.rProperty}</span>
              <span className="elig-summary-value">{fmtC(bestResult.eval.maxProperty, currency)}</span>
            </div>
          </div>
          <div className="elig-summary-row">
            <div className="elig-summary-item">
              <span className="elig-summary-label">{tr.rMonthly}</span>
              <span className="elig-summary-value elig-summary-value--blue">
                {fmtC(bestResult.eval.estimatedMonthly, currency)}/muaj
              </span>
            </div>
            <div className="elig-summary-item">
              <span className="elig-summary-label">{tr.rDown}</span>
              <span className="elig-summary-value">{fmtC(bestResult.eval.requiredDown, currency)}</span>
            </div>
          </div>
          <div className="elig-summary-footer">
            <span className="elig-summary-net">{tr.rNetSalary}: {fmtC(netSalary, currency)}</span>
            <span className="elig-summary-net">{tr.rMaxPayment}: {fmtC(bestResult.eval.maxPayment, currency)}/muaj</span>
          </div>
        </div>
      )}

      {/* Per bank results */}
      <div className="elig-bank-list">
        {results
          .sort((a, b) => {
            const order = { yes: 0, conditional: 1, no: 2 };
            return (order[a.eval.eligible] || 2) - (order[b.eval.eligible] || 2);
          })
          .map(({ bank, eval: ev }) => (
            <div key={bank.name} className={`elig-bank-row elig-bank-row--${ev.eligible}`}>
              <div className="elig-bank-header">
                <div className="elig-bank-info">
                  <span className="elig-bank-name">{bank.shortName ?? bank.name}</span>
                  <span className={`elig-badge elig-badge--${ev.eligible}`}>
                    {ev.eligible === 'yes' ? tr.yes_el : ev.eligible === 'conditional' ? tr.cond_el : tr.no_el}
                  </span>
                </div>
                {ev.maxLoan > 0 && (
                  <span className="elig-bank-max">{fmtC(ev.maxLoan, currency)}</span>
                )}
              </div>

              {ev.eligible !== 'no' && ev.maxLoan > 0 && (
                <div className="elig-bank-details">
                  <span>{fmtC(ev.estimatedMonthly, currency)}/muaj</span>
                  <span>{ev.rate?.toFixed(2)}% norm.</span>
                  <span>PIE: {(ev.minDown * 100).toFixed(0)}%</span>
                </div>
              )}

              {ev.checks && ev.checks.length > 0 && (
                <ul className="elig-checks">
                  {ev.checks.map((c, i) => (
                    <li key={i} className={`elig-check elig-check--${c.ok ? 'pass' : 'fail'}`}>
                      <i className={`ti ${c.ok ? 'ti-check' : 'ti-x'}`} aria-hidden="true" />
                      {c.text}
                    </li>
                  ))}
                </ul>
              )}

              {ev.note && (
                <p className="elig-bank-note">
                  <i className="ti ti-info-circle" aria-hidden="true" />
                  {ev.note}
                </p>
              )}

              {ev.diasporaNote && (
                <p className="elig-bank-note elig-bank-note--green">
                  <i className="ti ti-currency-euro" aria-hidden="true" />
                  {tr.diasporaNote}: {ev.diasporaNote}
                </p>
              )}

              {bank.url && ev.eligible !== 'no' && (
                <a href={bank.url} target="_blank" rel="noopener noreferrer sponsored" className="elig-visit-btn">
                  <i className="ti ti-external-link" aria-hidden="true" />
                  {bank.name}
                </a>
              )}
            </div>
          ))
        }
      </div>

      <p className="elig-disclaimer">
        <i className="ti ti-shield" aria-hidden="true" />
        {tr.disclaimer}
      </p>

      <div className="elig-btn-row">
        <button className="elig-back-btn" onClick={() => setStep(2)}>{tr.back}</button>
        <button className="elig-back-btn" onClick={() => { setStep(0); setProfile(null); setGross(''); setOblig(''); setDown(''); }}>
          {tr.restart}
        </button>
      </div>
    </div>
  );
}
