import sqData from '../i18n/sq.json';
import enData from '../i18n/en.json';

export type Lang = 'sq' | 'en';

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  sq: sqData,
  en: enData,
};

export function t(lang: Lang, key: string): string {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.sq[key] ?? key;
}

export const LANGS = [
  { code: 'sq' as Lang, label: 'SQ', name: 'Shqip' },
  { code: 'en' as Lang, label: 'EN', name: 'English' },
] as const;
