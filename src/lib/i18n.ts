import sqData from '../i18n/sq.json';
import enData from '../i18n/en.json';
import itData from '../i18n/it.json';
import elData from '../i18n/el.json';

export type Lang = 'sq' | 'en' | 'it' | 'el';

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  sq: sqData,
  en: enData,
  it: itData,
  el: elData,
};

export function t(lang: Lang, key: string): string {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.sq[key] ?? key;
}

export function localePath(lang: Lang, path: string): string {
  if (lang === 'sq') return path;
  return `/${lang}${path === '/' ? '' : path}`;
}

export const LANGS = [
  { code: 'sq' as Lang, label: 'SQ', name: 'Shqip' },
  { code: 'en' as Lang, label: 'EN', name: 'English' },
  { code: 'it' as Lang, label: 'IT', name: 'Italiano' },
  { code: 'el' as Lang, label: 'EL', name: 'Ελληνικά' },
] as const;
