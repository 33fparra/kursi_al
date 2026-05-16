import { useState, useEffect, useRef } from 'react';

const LANGS = [
  { code: 'sq', flag: 'al', name: 'Shqip' },
  { code: 'en', flag: 'gb', name: 'English' },
  { code: 'it', flag: 'it', name: 'Italiano' },
  { code: 'el', flag: 'gr', name: 'Ελληνικά' },
];

export default function LangSwitch({ currentLang = 'sq', pathname = '/', ariaLabel = 'Select language' }) {
  const [open, setOpen]       = useState(false);
  const wrapRef               = useRef(null);
  const triggerRef            = useRef(null);
  const optionRefs            = useRef([]);
  const current               = LANGS.find(l => l.code === currentLang) ?? LANGS[0];
  const others                = LANGS.filter(l => l.code !== currentLang);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ESC cierra y devuelve foco al trigger
  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape' && open) { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Al abrir, hacer foco en la primera opción
  useEffect(() => {
    if (open) setTimeout(() => optionRefs.current[0]?.focus(), 30);
  }, [open]);

  function switchLang(targetLang) {
    if (targetLang === currentLang) { setOpen(false); return; }
    let base = pathname;
    if (currentLang !== 'sq') {
      base = pathname.replace(new RegExp(`^/${currentLang}`), '') || '/';
    }
    const next = targetLang === 'sq'
      ? (base || '/')
      : `/${targetLang}${base === '/' ? '' : base}`;
    window.location.href = next || '/';
  }

  function handleTriggerKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  }

  function handleOptionKeyDown(e, idx) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      optionRefs.current[(idx + 1) % others.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx === 0) { setOpen(false); triggerRef.current?.focus(); }
      else optionRefs.current[idx - 1]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      switchLang(others[idx].code);
    }
  }

  return (
    <div ref={wrapRef} className="lang-dropdown">
      <button
        ref={triggerRef}
        className={`lang-dropdown__trigger${open ? ' lang-dropdown__trigger--open' : ''}`}
        onClick={() => setOpen(!open)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${ariaLabel}: ${current.name}`}
      >
        <span className={`fi fi-${current.flag}`} aria-hidden="true" />
        <i
          className={`ti ti-chevron-down lang-dropdown__chevron${open ? ' lang-dropdown__chevron--open' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul className="lang-dropdown__menu" role="listbox" aria-label={ariaLabel}>
          {others.map((lang, i) => (
            <li key={lang.code} role="option" aria-selected={false}>
              <button
                ref={el => { optionRefs.current[i] = el; }}
                className="lang-dropdown__option"
                onClick={() => switchLang(lang.code)}
                onKeyDown={e => handleOptionKeyDown(e, i)}
                aria-label={lang.name}
              >
                <span className={`fi fi-${lang.flag}`} aria-hidden="true" />
                <span className="lang-option-name">{lang.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
