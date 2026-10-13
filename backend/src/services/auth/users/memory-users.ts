import type { UpsertOnLoginInput, User, UserRepository } from './user-repository.js';

/** `users` w pamięci procesu, do czasu bazy (restart = ponowne logowanie). */
export class MemoryUserRepository implements UserRepository {
  private readonly rows = new Map<string, User>();

  findByIdp(identityPool: User['identityPool'], idpUserId: string): Promise<User | null> {
    for (const user of this.rows.values()) {
      if (user.identityPool === identityPool && user.idpUserId === idpUserId) {
        return Promise.resolve(user);
      }
    }
    return Promise.resolve(null);
  }

  getById(id: string): Promise<User | null> {
    return Promise.resolve(this.rows.get(id) ?? null);
  }

  async upsertOnLogin(input: UpsertOnLoginInput): Promise<User> {
    const existing = await this.findByIdp(input.identityPool, input.idpUserId);
    const user: User = existing
      ? {
          ...existing,
          phoneE164: input.phoneE164,
          email: input.email,
          contactSyncedAt: input.now,
        }
      : {
          id: input.id,
          identityPool: input.identityPool,
          idpUserId: input.idpUserId,
          accountKind: 'person',
          tokenVersion: 0,
          displayName: input.displayName,
          phoneE164: input.phoneE164,
          email: input.email,
          locale: input.locale,
          contactSyncedAt: input.now,
          deletedAt: null,
        };
    this.rows.set(user.id, user);
    return user;
  }

  /** Zmiana wiersza poza logowaniem (testy: token_version, deleted_at). */
  update(id: string, patch: Partial<Omit<User, 'id'>>): void {
    const user = this.rows.get(id);
    if (!user) throw new Error(`no user ${id}`);
    this.rows.set(id, { ...user, ...patch });
  }
}
