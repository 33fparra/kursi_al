import { useState, useEffect } from 'react';

const TRANSLATIONS = {
  sq: {
    gross: 'Paga bruto (mujore)',
    net: 'Paga neto',
    incomeTax: 'Tatimi mbi të ardhura',
    social: 'Kontribut shoqëror',
    health: 'Kontribut shëndetësor',
    pension: 'Kontribut pensional',
    deductions: 'Zbritjet totale',
    calculate: 'Llogarit',
    brackets: 'Fashët tatimore',
    byProfession: 'Paga sipas profesionit',
    gross_short: 'Bruto',
    net_short: 'Neto',
    note: 'Llogaritja është indikative bazuar në legjislacionin tatimor aktual.',
    minWage: 'Paga minimale',
    avgWage: 'Paga mesatare',
    quickFill: 'Plotëso shpejt',
  },
  en: {
    gross: 'Gross salary (monthly)',
    net: 'Net salary',
    incomeTax: 'Income tax',
    social: 'Social contribution',
    health: 'Health contribution',
    pension: 'Pension contribution',
    deductions: 'Total deductions',
    calculate: 'Calculate',
    brackets: 'Tax brackets',
    byProfession: 'Salary by profession',
    gross_short: 'Gross',
    net_short: 'Net',
    note: 'Calculation is indicative based on current tax legislation.',
    minWage: 'Minimum wage',
    avgWage: 'Average wage',
    quickFill: 'Quick fill',
  },
  it: {
    gross: 'Stipendio lordo (mensile)',
    net: 'Stipendio netto',
    incomeTax: 'Imposta sul reddito',
    social: 'Contributo sociale',
    health: 'Contributo sanitario',
    pension: 'Contributo pensionistico',
    deductions: 'Detrazioni totali',
    calculate: 'Calcola',
    brackets: 'Scaglioni fiscali',
    byProfession: 'Stipendio per professione',
    gross_short: 'Lordo',
    net_short: 'Netto',
    note: 'Il calcolo è indicativo basato sulla legislazione fiscale vigente.',
    minWage: 'Salario minimo',
    avgWage: 'Salario medio',
    quickFill: 'Riempimento rapido',
  },
};

function calcSalaryAL(gross) {
  const social = gross * 0.095;
  const health = gross * 0.017;
  let tax = 0;
  if (gross <= 30000) tax = 0;
  else if (gross <= 150000) tax = (gross - 30000) * 0.13;
  else tax = (150000 - 30000) * 0.13 + (gross - 150000) * 0.23;
  const deductions = social + health + tax;
  return { net: gross - deductions, incomeTax: tax, social, health, pension: 0, deductions };
}

function calcSalaryXK(gross) {
  const pension = gross * 0.05;         // Trusti: 5% e pagës bruto
  const taxBase = gross - pension;      // TAP llogaritet mbi bruto minus Trusti

  let tax = 0;
  if (taxBase <= 250) {
    tax = 0;
  } else if (taxBase <= 450) {
    tax = (taxBase - 250) * 0.04;
  } else {
    tax = (450 - 250) * 0.04 + (taxBase - 450) * 0.10;
  }

  const deductions = pension + tax;
  return { net: gross - deductions, incomeTax: tax, social: 0, health: 0, pension, deductions };
}

function fmt(value, currency) {
  const rounded = Math.round(value);
  if (currency === 'ALL') return new Intl.NumberFormat('sq-AL').format(rounded) + ' L';
  return '€' + new Intl.NumberFormat('de-DE').format(rounded);
}

function pct(value, gross) {
  if (!gross) return '0%';
  return ((value / gross) * 100).toFixed(1) + '%';
}

/**
 * @param {{ country?: string, currency?: string, lang?: string, minWage?: number, avgWage?: number, professions?: Record<string,any>[] }} props
 */
export default function SalaryCalc({
  country = 'al',
  currency = 'ALL',
  lang = 'sq',
  minWage = 45000,
  avgWage = 62000,
  professions = [],
}) {
  const tr = TRANSLATIONS[lang] ?? TRANSLATIONS.sq;
  const [gross, setGross] = useState(minWage);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-line" /><div className="skeleton-line skeleton-line--lg" />
      <div className="skeleton-line" /><div className="skeleton-line skeleton-line--lg" />
    </div>
  );

  const calc = country === 'al' ? calcSalaryAL : calcSalaryXK;
  const result = calc(gross);
  const netPct = gross > 0 ? ((result.net / gross) * 100).toFixed(1) : 0;

  const MAX_SALARY = currency === 'ALL' ? 20_000_000_000 : 200_000_000;
  const handleInput = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setGross(Math.min(Number(raw) || 0, MAX_SALARY));
  };

  return (
    <div className="calc-card">
      {/* Quick fill buttons */}
      <div className="salary-quick">
        <span className="calc-label">{tr.quickFill}:</span>
        <button className="salary-quick-btn" onClick={() => setGross(minWage)}>
          {tr.minWage} ({fmt(minWage, currency)})
        </button>
        <button className="salary-quick-btn" onClick={() => setGross(avgWage)}>
          {tr.avgWage} ({fmt(avgWage, currency)})
        </button>
      </div>

      {/* Input */}
      <div className="calc-field">
        <label className="calc-label">{tr.gross}</label>
        <div className="calc-input-wrap">
          <span className="calc-symbol">{currency === 'ALL' ? 'L' : '€'}</span>
          <input
            type="text"
            inputMode="numeric"
            className="calc-input"
            value={gross.toLocaleString('de-DE')}
            onChange={handleInput}
          />
        </div>
      </div>

      {/* Result */}
      {gross > 0 && (
        <div className="calc-result">
          <div className="calc-result-main">
            <span className="calc-result-label">{tr.net}</span>
            <span className="calc-result-amount">{fmt(result.net, currency)}</span>
            <span className="salary-net-pct">{netPct}% {tr.net_short}</span>
          </div>

          <div className="salary-breakdown">
            {result.incomeTax > 0 && (
              <div className="salary-row">
                <span>{tr.incomeTax}</span>
                <span>
                  <span className="salary-val-neg">{fmt(result.incomeTax, currency)}</span>
                  <span className="salary-pct-label"> ({pct(result.incomeTax, gross)})</span>
                </span>
              </div>
            )}
            {result.social > 0 && (
              <div className="salary-row">
                <span>{tr.social}</span>
                <span>
                  <span className="salary-val-neg">{fmt(result.social, currency)}</span>
                  <span className="salary-pct-label"> (9.5%)</span>
                </span>
              </div>
            )}
            {result.health > 0 && (
              <div className="salary-row">
                <span>{tr.health}</span>
                <span>
                  <span className="salary-val-neg">{fmt(result.health, currency)}</span>
                  <span className="salary-pct-label"> (1.7%)</span>
                </span>
              </div>
            )}
            {result.pension > 0 && (
              <div className="salary-row">
                <span>{tr.pension}</span>
                <span>
                  <span className="salary-val-neg">{fmt(result.pension, currency)}</span>
                  <span className="salary-pct-label"> (5%)</span>
                </span>
              </div>
            )}
            <div className="salary-row salary-row--total">
              <span>{tr.deductions}</span>
              <span className="salary-val-neg">{fmt(result.deductions, currency)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Professions table */}
      {professions.length > 0 && (
        <div className="salary-professions">
          <p className="salary-prof-title">{tr.byProfession}</p>
          <div className="salary-prof-list">
            {professions.map(p => {
              const profResult = calc(p.avgSalary);
              return (
                <button
                  key={p.id}
                  className="salary-prof-item"
                  onClick={() => setGross(p.avgSalary)}
                >
                  <span className="salary-prof-name">{p[lang] ?? p.sq}</span>
                  <span className="salary-prof-gross">{fmt(p.avgSalary, currency)}</span>
                  <span className="salary-prof-net">{fmt(profResult.net, currency)} neto</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="calc-note">
        <i className="ti ti-info-circle" aria-hidden="true" />
        {tr.note}
      </p>
    </div>
  );
}
