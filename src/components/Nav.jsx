import { useState, useEffect, useRef } from 'react';
import LangSwitch from './LangSwitch';

import sqData from '../i18n/sq.json';
import enData from '../i18n/en.json';
import itData from '../i18n/it.json';
import elData from '../i18n/el.json';

const TRANSLATIONS = { sq: sqData, en: enData, it: itData, el: elData };
function t(lang, key) { return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.sq[key] ?? key; }

// ── Section detection ──────────────────────────────────────────────────────────
function getSection(pathname) {
  const p = pathname.replace(/^\/(en|it|el)/, '') || '/';
  if (p === '/' || p === '' || p === '/home') return 'home';
  if (p.startsWith('/kursi') || p.startsWith('/historiku') ||
      p.startsWith('/tabela') || p.startsWith('/remitanca')) return 'change';
  if (p.startsWith('/albania') || p.startsWith('/kosova') || p.startsWith('/blog')) return 'country';
  return 'home';
}

function getActiveCountry(pathname) {
  if (pathname.includes('/albania')) return 'al';
  if (pathname.includes('/kosova')) return 'xk';
  return null;
}

// ── Navigation data ────────────────────────────────────────────────────────────

// Top-level links for HOME section nav
const HOME_LINKS = {
  sq: [
    { path: '/',        label: 'Kreu',        icon: 'ti-home-2' },
    { path: '/albania', label: 'Shqipëria',   flag: 'al' },
    { path: '/kosova',  label: 'Kosova',       flag: 'xk' },
    { path: '/kursi',  label: 'Konvertuesi', icon: 'ti-arrows-up-down' },
    { path: '/blog',    label: 'Blog',         icon: 'ti-notebook' },
  ],
  en: [
    { path: '/',           label: 'Home',      icon: 'ti-home-2' },
    { path: '/en/albania', label: 'Albania',   flag: 'al' },
    { path: '/en/kosova',  label: 'Kosovo',    flag: 'xk' },
    { path: '/en/kursi',  label: 'Converter', icon: 'ti-arrows-up-down' },
    { path: '/en/blog',    label: 'Blog',      icon: 'ti-notebook' },
  ],
  it: [
    { path: '/',              label: 'Home',         icon: 'ti-home-2' },
    { path: '/it/kursi',     label: 'Convertitore', icon: 'ti-arrows-up-down' },
  ],
  el: [
    { path: '/',              label: 'Αρχική',  icon: 'ti-home-2' },
    { path: '/el/kursi',     label: 'Μετατροπή', icon: 'ti-arrows-up-down' },
  ],
};

// Change section nav (all 4 languages)
const CHANGE_LINKS = {
  sq: [
    { path: '/kursi',           label: 'Konvertuesi', icon: 'ti-arrows-up-down' },
    { path: '/kursi/tabela',    label: 'Tabela',      icon: 'ti-table' },
    { path: '/kursi/historiku', label: 'Historiku',   icon: 'ti-chart-line' },
    { path: '/kursi/remitanca', label: 'Remitanca',   icon: 'ti-send' },
  ],
  en: [
    { path: '/en/kursi',           label: 'Converter',  icon: 'ti-arrows-up-down' },
    { path: '/en/kursi/tabela',    label: 'Rates',      icon: 'ti-table' },
    { path: '/en/kursi/historiku', label: 'History',    icon: 'ti-chart-line' },
    { path: '/en/kursi/remitanca', label: 'Remittance', icon: 'ti-send' },
  ],
  it: [
    { path: '/it/kursi',           label: 'Convertitore', icon: 'ti-arrows-up-down' },
    { path: '/it/kursi/tabela',    label: 'Tassi',        icon: 'ti-table' },
    { path: '/it/kursi/historiku', label: 'Storico',      icon: 'ti-chart-line' },
    { path: '/it/kursi/remitanca', label: 'Rimesse',      icon: 'ti-send' },
  ],
  el: [
    { path: '/el/kursi',           label: 'Μετατροπή',   icon: 'ti-arrows-up-down' },
    { path: '/el/kursi/tabela',    label: 'Ισοτιμίες',   icon: 'ti-table' },
    { path: '/el/kursi/historiku', label: 'Ιστορικό',    icon: 'ti-chart-line' },
    { path: '/el/kursi/remitanca', label: 'Εμβάσματα',   icon: 'ti-send' },
  ],
};

// Country section — top links (only sq/en)
const COUNTRY_TOP = {
  sq: [
    { path: '/',        label: 'Kreu',      icon: 'ti-arrow-left' },
    { path: '/albania', label: 'Shqipëria', flag: 'al' },
    { path: '/kosova',  label: 'Kosova',    flag: 'xk' },
    { path: '/blog',    label: 'Blog',      icon: 'ti-notebook' },
  ],
  en: [
    { path: '/',          label: 'Home',    icon: 'ti-arrow-left' },
    { path: '/en/albania', label: 'Albania', flag: 'al' },
    { path: '/en/kosova',  label: 'Kosovo',  flag: 'xk' },
    { path: '/en/blog',    label: 'Blog',    icon: 'ti-notebook' },
  ],
};

// Country sub-tabs (tools per country)
const COUNTRY_TOOLS = {
  al: {
    sq: [
      { path: '/albania/paga',        label: 'Paga',        icon: 'ti-wallet' },
      { path: '/albania/bankat',      label: 'Bankat',      icon: 'ti-building-bank' },
      { path: '/albania/hipoteka',    label: 'Hipoteka',    icon: 'ti-home' },
      { path: '/albania/kredia',      label: 'Kredia',      icon: 'ti-credit-card' },
      { path: '/albania/kualifikim',  label: 'Kualifikim',  icon: 'ti-user-check' },
    ],
    en: [
      { path: '/en/albania/paga',        label: 'Salary',      icon: 'ti-wallet' },
      { path: '/en/albania/bankat',      label: 'Banks',       icon: 'ti-building-bank' },
      { path: '/en/albania/hipoteka',    label: 'Mortgage',    icon: 'ti-home' },
      { path: '/en/albania/kredia',      label: 'Loan',        icon: 'ti-credit-card' },
      { path: '/en/albania/kualifikim',  label: 'Eligibility', icon: 'ti-user-check' },
    ],
  },
  xk: {
    sq: [
      { path: '/kosova/paga',        label: 'Paga',        icon: 'ti-wallet' },
      { path: '/kosova/bankat',      label: 'Bankat',      icon: 'ti-building-bank' },
      { path: '/kosova/hipoteka',    label: 'Hipoteka',    icon: 'ti-home' },
      { path: '/kosova/kredia',      label: 'Kredia',      icon: 'ti-credit-card' },
      { path: '/kosova/kualifikim',  label: 'Kualifikim',  icon: 'ti-user-check' },
    ],
    en: [
      { path: '/en/kosova/paga',        label: 'Salary',      icon: 'ti-wallet' },
      { path: '/en/kosova/bankat',      label: 'Banks',       icon: 'ti-building-bank' },
      { path: '/en/kosova/hipoteka',    label: 'Mortgage',    icon: 'ti-home' },
      { path: '/en/kosova/kredia',      label: 'Loan',        icon: 'ti-credit-card' },
      { path: '/en/kosova/kualifikim',  label: 'Eligibility', icon: 'ti-user-check' },
    ],
  },
};

function ThemeIcon() {
  return (
    <>
      <i className="ti ti-sun  theme-toggle__icon theme-toggle__icon--light" aria-hidden="true" />
      <i className="ti ti-moon theme-toggle__icon theme-toggle__icon--dark"  aria-hidden="true" />
    </>
  );
}

export default function Nav({ lang = 'sq', currentPath = '/', pathname = '/' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef(null);

  const section       = getSection(pathname);
  const activeCountry = section === 'country' ? getActiveCountry(pathname) : null;
  const ctxLang       = (lang === 'en') ? 'en' : 'sq';

  // Which links to show in topbar based on section
  const topLinks = section === 'change'
    ? (CHANGE_LINKS[lang] ?? CHANGE_LINKS.sq)
    : section === 'country'
      ? (COUNTRY_TOP[ctxLang] ?? COUNTRY_TOP.sq)
      : (HOME_LINKS[lang] ?? HOME_LINKS.sq);

  // Sub-tabs for country section
  const subTabs = (section === 'country' && activeCountry)
    ? (COUNTRY_TOOLS[activeCountry]?.[ctxLang] ?? [])
    : [];

  // Language filter: country section → only sq + en
  const allowedLangs = section === 'country' ? ['sq', 'en'] : null;

  // Sync subnav height to CSS so app-shell margin adjusts
  useEffect(() => {
    const hasSubnav = subTabs.length > 0;
    document.documentElement.style.setProperty('--subnav-h', hasSubnav ? '48px' : '0px');
    document.body.classList.toggle('has-subnav', hasSubnav);
  }, [subTabs.length]);

  // Close mobile on outside click
  useEffect(() => {
    const handler = e => {
      if (mobileOpen && headerRef.current && !headerRef.current.contains(e.target))
        setMobileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('kursi-theme', next);
  }

  function isActive(path) {
    if (!path) return false;
    if (path === '/' || path === '/en/' || path === '/en') return pathname === '/' || pathname === '/en/' || pathname === '/en';
    return pathname === path || pathname.startsWith(path.endsWith('/') ? path : path + '/') ||
           pathname.startsWith(path);
  }

  function renderLink(link) {
    const active = isActive(link.path);
    return (
      <a
        key={link.path}
        href={link.path}
        className={`topbar-link${active ? ' topbar-link--active' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-current={active ? 'page' : undefined}
      >
        {link.flag
          ? <span className={`fi fi-${link.flag} topbar-flag`} aria-hidden="true" />
          : link.icon
            ? <i className={`ti ${link.icon} topbar-link-icon`} aria-hidden="true" />
            : null
        }
        {link.label}
      </a>
    );
  }

  return (
    <div ref={headerRef}>
      {/* ═══════════════════ TOP BAR ═══════════════════ */}
      <header className="topbar">
        <div className="topbar-inner">
          {/* Logo */}
          <a href="/" className="topbar-logo" aria-label="leku.al">
            <img src="/logo.svg" alt="leku.al" className="topbar-logo-img" />
          </a>

          {/* Section badge (change only) */}
          {section === 'change' && (
            <span className="topbar-section-badge">
              <i className="ti ti-arrows-up-down" aria-hidden="true" />
              {lang === 'en' ? 'Exchange' : lang === 'it' ? 'Cambio' : lang === 'el' ? 'Ισοτιμίες' : 'Konvertuesi'}
            </span>
          )}

          {/* Desktop nav links */}
          <nav className="topbar-nav" aria-label="Main navigation">
            {topLinks.map(link => renderLink(link))}
          </nav>

          {/* Right controls */}
          <div className="topbar-controls">
            <LangSwitch
              currentLang={lang}
              pathname={pathname}
              ariaLabel={t(lang, 'nav.selectLanguage')}
              allowedLangs={allowedLangs}
            />
            <button
              className="topbar-icon-btn"
              onClick={toggleTheme}
              aria-label={t(lang, 'nav.toggleTheme')}
              title={t(lang, 'nav.toggleTheme')}
            >
              <ThemeIcon />
            </button>
            <button
              className="topbar-hamburger"
              onClick={() => setMobileOpen(v => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? t(lang, 'nav.closeMenu') : t(lang, 'nav.openMenu')}
            >
              <i className={`ti ${mobileOpen ? 'ti-x' : 'ti-menu-2'}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-list">
              {topLinks.map(link => (
                <a
                  key={link.path}
                  href={link.path}
                  className={`mobile-menu-link${isActive(link.path) ? ' mobile-menu-link--active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.flag
                    ? <span className={`fi fi-${link.flag} mobile-flag`} aria-hidden="true" />
                    : link.icon ? <i className={`ti ${link.icon}`} aria-hidden="true" /> : null
                  }
                  {link.label}
                </a>
              ))}
            </div>

            {/* Sub-tools in mobile */}
            {subTabs.length > 0 && (
              <>
                <div className="mobile-menu-divider" />
                <div className="mobile-menu-list">
                  {subTabs.map(tab => (
                    <a
                      key={tab.path}
                      href={tab.path}
                      className={`mobile-menu-link${isActive(tab.path) ? ' mobile-menu-link--active' : ''}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <i className={`ti ${tab.icon}`} aria-hidden="true" />
                      {tab.label}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* ═══════════════════ SUB-TAB BAR (Country section only) ═══════════════════ */}
      {subTabs.length > 0 && (
        <nav className="subnav" aria-label="Tools navigation">
          <div className="subnav-inner">
            {/* Country flag + name */}
            {activeCountry && (
              <div className="subnav-country">
                <span className={`fi fi-${activeCountry} subnav-flag`} aria-hidden="true" />
                <span className="subnav-country-name">
                  {activeCountry === 'al'
                    ? (ctxLang === 'en' ? 'Albania' : 'Shqipëria')
                    : (ctxLang === 'en' ? 'Kosovo' : 'Kosova')
                  }
                </span>
              </div>
            )}

            <div className="subnav-tabs" role="tablist">
              {subTabs.map(tab => {
                const active = isActive(tab.path);
                return (
                  <a
                    key={tab.path}
                    href={tab.path}
                    role="tab"
                    className={`subnav-tab${active ? ' subnav-tab--active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <i className={`ti ${tab.icon} subnav-tab-icon`} aria-hidden="true" />
                    <span className="subnav-tab-label">{tab.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
