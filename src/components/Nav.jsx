import { useState, useEffect, useRef } from 'react';
import LangSwitch from './LangSwitch';

// Importar todos los JSON de i18n directamente (Vite lo soporta nativamente)
import sqData from '../i18n/sq.json';
import enData from '../i18n/en.json';
import itData from '../i18n/it.json';
import elData from '../i18n/el.json';

const TRANSLATIONS = { sq: sqData, en: enData, it: itData, el: elData };

function t(lang, key) {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.sq[key] ?? key;
}

function localePath(lang, path) {
  if (lang === 'sq') return path;
  return `/${lang}${path === '/' ? '' : path}`;
}

const NAV_LINKS = [
  { path: '/', key: 'nav.home' },
  { path: '/historiku', key: 'nav.history' },
  { path: '/remitanca', key: 'nav.remittance' },
  { path: '/tabela', key: 'nav.table' },
];

function ThemeToggleIcon() {
  return (
    <>
      <i className="ti ti-sun  theme-toggle__icon theme-toggle__icon--light" aria-hidden="true" />
      <i className="ti ti-moon theme-toggle__icon theme-toggle__icon--dark"  aria-hidden="true" />
    </>
  );
}

export default function Nav({ lang = 'sq', currentPath = '/', pathname = '/' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);

  // Cerrar menú móvil al hacer click fuera del nav
  useEffect(() => {
    const handler = e => {
      if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ESC cierra el menú móvil
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Toggle de tema: manipulación directa del DOM (el CSS lo gestiona con data-theme)
  function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('kursi-theme', next);
  }

  return (
    <nav ref={navRef} className="nav" role="navigation" aria-label={t(lang, 'nav.home')}>

      {/* ── Logo ── */}
      <a href={localePath(lang, '/')} className="nav-logo" aria-label="leku.al">
        leku<span>.</span>al
      </a>

      {/* ── Links desktop (ocultos en móvil via CSS) ── */}
      <ul className="nav-links" role="list">
        {NAV_LINKS.map(({ path, key }) => (
          <li key={path}>
            <a
              href={localePath(lang, path)}
              className={`nav-link${currentPath === path ? ' nav-link--active' : ''}`}
            >
              {t(lang, key)}
            </a>
          </li>
        ))}
      </ul>

      {/* ── Controles: dropdown idioma + toggle tema (desktop) + hamburger (móvil) ── */}
      <div className="nav-controls">
        <LangSwitch
          currentLang={lang}
          pathname={pathname}
          ariaLabel={t(lang, 'nav.selectLanguage')}
        />

        {/* Toggle tema — solo desktop (aparece también en el panel móvil) */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={t(lang, 'nav.toggleTheme')}
          title={t(lang, 'nav.toggleTheme')}
        >
          <ThemeToggleIcon />
        </button>

        {/* Botón hamburger — solo móvil */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(v => !v)}
          aria-expanded={menuOpen}
          aria-controls="nav-mobile-panel"
          aria-label={menuOpen ? t(lang, 'nav.closeMenu') : t(lang, 'nav.openMenu')}
        >
          <i className={`ti ${menuOpen ? 'ti-x' : 'ti-menu-2'}`} aria-hidden="true" />
        </button>
      </div>

      {/* ── Panel móvil desplegable ── */}
      {menuOpen && (
        <div id="nav-mobile-panel" className="nav-mobile-panel" role="dialog" aria-modal="false">
          <ul className="nav-mobile-links" role="list">
            {NAV_LINKS.map(({ path, key }) => (
              <li key={path}>
                <a
                  href={localePath(lang, path)}
                  className={`nav-mobile-link${currentPath === path ? ' nav-mobile-link--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(lang, key)}
                </a>
              </li>
            ))}
          </ul>

          {/* Toggle tema dentro del panel móvil */}
          <div className="nav-mobile-footer">
            <button
              className="theme-toggle-mobile"
              onClick={toggleTheme}
              aria-label={t(lang, 'nav.toggleTheme')}
            >
              <span className="theme-toggle-mobile__icon">
                <ThemeToggleIcon />
              </span>
              <span className="theme-toggle-mobile__label">{t(lang, 'nav.toggleTheme')}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
