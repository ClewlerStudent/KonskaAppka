import type { Locale } from '../../../contracts/common.js';

/** Wiersz `users` (docs/erd.md); powstaje przy pierwszym logowaniu potwierdzonego konta. */
export interface User {
  readonly id: string;
  readonly identityPool: 'customer' | 'team';
  readonly idpUserId: string;
  readonly accountKind: 'person' | 'technical';
  /** Claim `tv` w refresh tokenie; podbicie wylogowuje wszystkie urządzenia. */
  readonly tokenVersion: number;
  readonly displayName: string;
  readonly phoneE164: string | null;
  readonly email: string | null;
  readonly locale: Locale;
  readonly contactSyncedAt: Date;
  readonly deletedAt: Date | null;
}

export interface UpsertOnLoginInput {
  /** `users.id` nadany przy rejestracji (username u dostawcy tożsamości). */
  readonly id: string;
  readonly identityPool: User['identityPool'];
  readonly idpUserId: string;
  readonly displayName: string;
  readonly locale: Locale;
  /** Kopie zweryfikowanych kontaktów. */
  readonly phoneE164: string | null;
  readonly email: string | null;
  readonly now: Date;
}

export interface UserRepository {
  findByIdp(identityPool: User['identityPool'], idpUserId: string): Promise<User | null>;
  getById(id: string): Promise<User | null>;
  /** Pierwsze logowanie tworzy wiersz; kolejne odświeżają tylko kopię kontaktów. */
  upsertOnLogin(input: UpsertOnLoginInput): Promise<User>;
}
