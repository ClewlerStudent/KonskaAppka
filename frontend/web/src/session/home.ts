import type { MeResponse } from '../../../src/api/auth-api';

/**
 * Ekran startowy po zalogowaniu według `startView` z GET /me. Na razie jest tylko `welcome`;
 * nowe wartości dochodzą addytywnie, a nieznana prowadzi do PanelWitaj.
 */
export function homePath(_me: MeResponse | null): '/welcome' {
  return '/welcome';
}
