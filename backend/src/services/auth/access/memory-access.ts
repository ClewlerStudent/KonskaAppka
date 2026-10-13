import { NO_ACCESS, type AccessGrants, type AccessRepository } from './access-repository.js';

/** Tabel firm i członkostw jeszcze nie ma: domyślnie brak dostępu; testy mogą go nadać. */
export class MemoryAccessRepository implements AccessRepository {
  private readonly grants = new Map<string, AccessGrants>();

  forUser(userId: string): Promise<AccessGrants> {
    return Promise.resolve(this.grants.get(userId) ?? NO_ACCESS);
  }

  set(userId: string, grants: AccessGrants): void {
    this.grants.set(userId, grants);
  }
}
