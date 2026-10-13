/**
 * Tokeny kolorów EQUENOR z docs/paleta.md. To jedyne miejsce (razem z theme.css) z literałami
 * kolorów; reszta kodu używa zmiennych CSS `--eq-<token>` albo tych stałych.
 * Klucze = nazwy tokenów z palety, więc `lcd['ink-2']` ↔ `var(--eq-ink-2)`.
 */

/** Ekrany LCD: apka, panel web, wyświetlacz TV, strona www. */
export const lcd = {
  bg: '#F3ECE2',
  surface: '#FFFCF7',
  sand: '#EDE3D5',
  'accent-soft': '#F3E2D0',
  line: '#E0D3C2',
  'line-strong': '#B9A791',
  'line-input': '#907D6A',
  ink: '#2E241D',
  'ink-2': '#5C4E43',
  accent: '#8A5230',
  'accent-strong': '#6B3A1E',
  'on-accent': '#FFFCF7',
  'ok-text': '#2D523D',
  'ok-tint': '#D4EADC',
  'ok-line': '#407658',
  'warn-text': '#664810',
  'warn-tint': '#F6E3B7',
  'warn-tint-weak': '#FCF4E2',
  'warn-line': '#8C6014',
  'crit-text': '#71251A',
  'crit-tint': '#EFCBBF',
  'crit-line': '#86301F',
  'crit-solid': '#86301F',
  'on-crit': '#FFFCF7',
} as const;

/** Tablet e-ink, profil Kaleido 3 (na stronie www: miniatura tabletu). */
export const tablet = {
  't-paper': '#FFFFFF',
  't-ok': '#ACDA9D',
  't-line': '#ABABAB',
  't-warn': '#D28A21',
  't-scrim': '#6E6E6E',
  't-crit': '#9E2A1C',
  't-ink-2': '#404040',
  't-ink': '#000000',
} as const;

/** Profil Gallery 3, który podmienia apka tabletu. */
export const tabletGallery3 = {
  't-ok': '#B4D6A9',
  't-warn': '#C5904E',
  't-crit': '#8F3C30',
} as const;

/** Nakładka pod modalem. */
export const scrim = 'rgba(46,36,29,0.40)';

/** Cień karty (apka i panel). */
export const shadowCard = '0 1px 2px rgba(46,36,29,.06), 0 4px 12px -6px rgba(46,36,29,.14)';

/** Opcje akcentu (tweak), z kolorem hover; pierwsza jest domyślna. */
export const accentOptions = [
  { id: 'koniak', name: 'Koniak', accent: '#8A5230', accentStrong: '#6B3A1E' },
  { id: 'orzech', name: 'Orzech', accent: '#665A40', accentStrong: '#52462D' },
  { id: 'wrzos', name: 'Wrzos', accent: '#744A5A', accentStrong: '#623949' },
  { id: 'porost', name: 'Porost', accent: '#5E5B40', accentStrong: '#464329' },
] as const;

export type LcdToken = keyof typeof lcd;
export type TabletToken = keyof typeof tablet;
export type ColorToken = LcdToken | TabletToken;

/** `cssVar('ink-2')` → `var(--eq-ink-2)` */
export const cssVar = (token: ColorToken | 'scrim' | 'shadow-card'): string => `var(--eq-${token})`;

/** Znak słowny i hasło (docs/paleta.md, „Zasady”). */
export const brand = {
  wordmark: 'EQUENOR',
  tagline: 'Equestrian Management, Refined',
} as const;
