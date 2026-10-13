/**
 * Konfiguracja czasu wykonania z <meta> w web/index.html. W dev wstawia ją Vite (%VITE_*%),
 * w obrazie nginx podmienia znaczniki __EQ_*__ z env kontenera. Kod nie czyta import.meta.env.
 */
export interface PanelConfig {
  /** Adres API; pusty = ten sam origin (proxy). */
  apiBaseUrl: string;
  /** Adres strony www (stopka: strona, regulamin, polityka prywatności). */
  wwwUrl: string;
}

const unresolved = /^(%VITE_[A-Z0-9_]+%|__EQ_[A-Z0-9_]+__)$/;

function readMeta(doc: Document, name: string): string {
  const value = doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content')?.trim() ?? '';
  return unresolved.test(value) ? '' : value.replace(/\/+$/, '');
}

export function readConfig(doc: Document = document): PanelConfig {
  return {
    apiBaseUrl: readMeta(doc, 'eq-api-base'),
    wwwUrl: readMeta(doc, 'eq-www-url'),
  };
}

export function wwwLinks(wwwUrl: string) {
  const base = wwwUrl || '';
  return {
    home: base || '/',
    terms: `${base}/regulamin.html`,
    privacy: `${base}/polityka-prywatnosci.html`,
  };
}
