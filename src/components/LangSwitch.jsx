const LANGS = [
  { code: 'sq', label: 'SQ', name: 'Shqip' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'it', label: 'IT', name: 'Italiano' },
  { code: 'el', label: 'EL', name: 'Ελληνικά' },
];

export default function LangSwitch({ currentLang = 'sq', pathname = '/' }) {
  function switchLang(targetLang) {
    if (targetLang === currentLang) return;

    let base = pathname;
    // Strip current lang prefix
    if (currentLang !== 'sq') {
      base = pathname.replace(new RegExp(`^/${currentLang}`), '') || '/';
    }
    // Build target URL
    const next = targetLang === 'sq'
      ? (base || '/')
      : `/${targetLang}${base === '/' ? '' : base}`;

    window.location.href = next || '/';
  }

  return (
    <div className="lang-switch" role="navigation" aria-label="Language / Gjuha / Lingua / Γλώσσα">
      {LANGS.map(({ code, label, name }) => (
        <button
          key={code}
          onClick={() => switchLang(code)}
          className={`lang-btn${currentLang === code ? ' lang-btn--active' : ''}`}
          aria-label={name}
          aria-current={currentLang === code ? 'true' : undefined}
          title={name}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
