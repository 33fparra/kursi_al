import { useState, useEffect } from 'react';

const TR = {
  sq: { bank: 'Banka', mortgage: 'Hipoteka/vit', loan: 'Kredi personale', visit: 'Vizito', best: '★ Më e mira', diff: 'diferencë', note: 'Normat janë indikative. Kontaktoni bankën për kushtet e sakta.', sortMortgage: 'Hipoteka', sortLoan: 'Kredia', sortBy: 'Rendit:' },
  en: { bank: 'Bank', mortgage: 'Mortgage/yr', loan: 'Personal loan', visit: 'Visit', best: '★ Best', diff: 'difference', note: 'Rates are indicative. Contact the bank for exact terms.', sortMortgage: 'Mortgage', sortLoan: 'Loan', sortBy: 'Sort:' },
  it: { bank: 'Banca', mortgage: 'Mutuo/anno', loan: 'Prestito', visit: 'Visita', best: '★ Migliore', diff: 'differenza', note: 'I tassi sono indicativi.', sortMortgage: 'Mutuo', sortLoan: 'Prestito', sortBy: 'Ordina:' },
};

/** @param {{ banks: Record<string,any>[], lang?: string }} props */
export default function BankTable({ banks = [], lang = 'sq' }) {
  const [sortBy, setSortBy] = useState('mortgage');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="skeleton-card" aria-hidden="true">
      {[1,2,3,4].map(i => <div key={i} className="skeleton-line" style={{marginBottom:'12px'}} />)}
    </div>
  );

  const tr = TR[lang] ?? TR.sq;
  const sorted = [...banks].sort((a, b) =>
    sortBy === 'mortgage' ? a.mortgageRatePct - b.mortgageRatePct : a.loanRatePct - b.loanRatePct
  );
  const bestMortgage = Math.min(...banks.map(b => b.mortgageRatePct));
  const bestLoan     = Math.min(...banks.map(b => b.loanRatePct));

  return (
    <div className="bt-wrap">
      {/* Sort toggle */}
      <div className="bt-sort">
        <span className="bt-sort-label">{tr.sortBy}</span>
        <button className={`bt-sort-btn${sortBy === 'mortgage' ? ' active' : ''}`} onClick={() => setSortBy('mortgage')}>{tr.sortMortgage}</button>
        <button className={`bt-sort-btn${sortBy === 'loan'     ? ' active' : ''}`} onClick={() => setSortBy('loan')}>{tr.sortLoan}</button>
      </div>

      {/* Compact comparison table */}
      <div className="bt-table-wrap">
        <table className="bt-table">
          <thead>
            <tr>
              <th className="bt-th bt-th-bank">{tr.bank}</th>
              <th className={`bt-th${sortBy === 'mortgage' ? ' bt-th--sorted' : ''}`}>{tr.mortgage}</th>
              <th className={`bt-th${sortBy === 'loan'     ? ' bt-th--sorted' : ''}`}>{tr.loan}</th>
              <th className="bt-th bt-th-action"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((bank) => {
              const isBestMortgage = bank.mortgageRatePct === bestMortgage;
              const isBestLoan     = bank.loanRatePct     === bestLoan;
              const diffM = (bank.mortgageRatePct - bestMortgage).toFixed(2);
              const diffL = (bank.loanRatePct     - bestLoan).toFixed(2);

              return (
                <tr key={bank.name} className={`bt-row${bank.featured ? ' bt-row--featured' : ''}`}>
                  <td className="bt-td bt-td-bank">
                    <span className="bt-bank-name">{bank.shortName ?? bank.name}</span>
                    {bank.featured && <span className="bt-featured-dot" title={tr.best} />}
                  </td>

                  <td className={`bt-td bt-td-rate${isBestMortgage ? ' bt-td--best' : ''}`}>
                    <span className="bt-rate">{bank.mortgageRatePct.toFixed(2)}%</span>
                    {isBestMortgage
                      ? <span className="bt-badge-best">{tr.best}</span>
                      : <span className="bt-diff">+{diffM}%</span>
                    }
                  </td>

                  <td className={`bt-td bt-td-rate${isBestLoan ? ' bt-td--best' : ''}`}>
                    <span className="bt-rate">{bank.loanRatePct.toFixed(2)}%</span>
                    {isBestLoan
                      ? <span className="bt-badge-best">{tr.best}</span>
                      : <span className="bt-diff">+{diffL}%</span>
                    }
                  </td>

                  <td className="bt-td bt-td-action">
                    {bank.url && (
                      <a href={bank.url} target="_blank" rel="noopener noreferrer sponsored" className="bt-visit">
                        <i className="ti ti-external-link" aria-hidden="true" />
                        <span className="bt-visit-label">{tr.visit}</span>
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="bt-note">
        <i className="ti ti-info-circle" aria-hidden="true" />
        {tr.note}
      </p>
    </div>
  );
}
