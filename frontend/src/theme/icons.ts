/**
 * Ikony z makiet (mockups/project/*.dc.html): viewBox 0 0 24 24, obrys `currentColor`,
 * bez wypełnienia, zaokrąglone końce. Komponent ikony rysuje te kształty jako <path>,
 * <rect> i <circle>; statyczne strony www mają te same kształty wpisane w HTML.
 */

export type IconShape =
  | { readonly kind: 'path'; readonly d: string }
  | {
      readonly kind: 'rect';
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
      readonly rx: number;
      readonly transform?: string;
    }
  | { readonly kind: 'circle'; readonly cx: number; readonly cy: number; readonly r: number };

export interface IconDef {
  readonly shapes: readonly IconShape[];
  /** Grubość obrysu z makiety (domyślnie 1,8). */
  readonly strokeWidth?: number;
}

const path = (d: string): IconShape => ({ kind: 'path', d });
const circle = (cx: number, cy: number, r: number): IconShape => ({ kind: 'circle', cx, cy, r });

export const ICON_VIEWBOX = '0 0 24 24';
export const ICON_STROKE_WIDTH = 1.8;

export const icons = {
  /** Podkowa: znak EQUENOR w kole. */
  horseshoe: {
    shapes: [
      path('M7 20.5C5.1 18.6 4 15.6 4 12.5a8 8 0 0 1 16 0c0 3.1-1.1 6.1-3 8'),
      path('M5 20.5h3.5M15.5 20.5H19'),
      path('M7.5 9.5v.5M16.5 9.5v.5M6.8 14v.5M17.2 14v.5'),
    ],
  },
  phone: {
    shapes: [{ kind: 'rect', x: 6.5, y: 3, width: 11, height: 18, rx: 2 }, path('M11 17.5h2')],
  },
  mail: {
    shapes: [
      { kind: 'rect', x: 3, y: 5, width: 18, height: 14, rx: 2 },
      path('M3.5 6.5L12 13l8.5-6.5'),
    ],
  },
  message: { shapes: [path('M4 5h16v11H9l-5 4z')] },
  /** Stoper przy „Wyślij kod ponownie”. */
  timer: { shapes: [circle(12, 13, 8), path('M12 9v4l2.5 1.5'), path('M10 2.5h4')] },
  logout: {
    shapes: [
      path('M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4'),
      path('M14 16l4-4-4-4'),
      path('M18 12H9'),
    ],
  },
  plus: { shapes: [path('M12 5v14M5 12h14')] },
  check: { shapes: [path('M5 12.5l4.5 4.5L19 7.5')], strokeWidth: 3 },
  checkCircle: { shapes: [circle(12, 12, 9), path('M8 12.5l2.5 2.5L16 9.5')], strokeWidth: 2 },
  ban: { shapes: [circle(12, 12, 9), path('M5.6 5.6l12.8 12.8')] },
  /** Komunikat błędu w panelu. */
  alert: { shapes: [circle(12, 12, 9), path('M12 7.5v5.5'), path('M12 16.5v.5')] },
  clock: { shapes: [circle(12, 12, 9), path('M12 7v5l3 2')] },
  home: { shapes: [path('M4 10l8-6 8 6v10H4z'), path('M9 20v-6h6v6')] },
  flag: { shapes: [path('M5 21V4h11l-2 4 2 4H5')] },
  user: { shapes: [circle(12, 8, 4), path('M4 21a8 8 0 0 1 16 0')] },
  /** Kafle szybkiej flagi. */
  noBreakfast: { shapes: [path('M4 11h16a8 8 0 0 1-16 0z'), path('M3 3l18 18')] },
  noPaddock: { shapes: [path('M5 20V6l2-2 2 2v14M15 20V6l2-2 2 2v14M3 10h18M3 15h18')] },
  blanket: { shapes: [path('M3 5h18'), path('M6 5v12c2 1.5 4 1.5 6 0s4-1.5 6 0V5')] },
  vet: {
    shapes: [path('M6 3v6a4 4 0 0 0 8 0V3'), path('M10 13v3a5 5 0 0 0 10 0v-2'), circle(20, 12, 2)],
  },
  meds: {
    shapes: [
      { kind: 'rect', x: 3, y: 8.5, width: 18, height: 7, rx: 3.5, transform: 'rotate(-45 12 12)' },
      path('M9.5 9.5l5 5'),
    ],
  },
} as const satisfies Record<string, IconDef>;

export type IconName = keyof typeof icons;
