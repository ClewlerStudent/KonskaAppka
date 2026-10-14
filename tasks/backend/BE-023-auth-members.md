---
id: BE-023
title: "auth: członkowie stajni i konta techniczne"
area: backend
stage: 1
size: M
status: todo
depends_on: [BE-006, BE-008, BE-013]
decisions: [DEC-15]
owner:
branch:
trello:
---
# BE-023 · auth: członkowie stajni i konta techniczne

## Cel
Admin w „Ludziach” widzi członków stajni (także konta techniczne), zmienia rolę, przypisuje osobę z firmy do kolejnej stajni, usuwa ze stajni, blokuje i odblokowuje konto tabletów albo telewizora i wylogowuje wszystkie tablety. Osoba sama może opuścić stajnię. Zmiana działa przy najbliższym odświeżeniu tokenu (do 5 min).

## Kontekst
- Stan kodu: tabele `stable_members` (UK `stable_id`+`user_id`, `role`, `active`, `deactivated_at`, `granted_via`, `granted_session_id`), `horse_access`, `users.token_version` (BE-004, BE-001); polityka tras i `TenantScope` (BE-006); `member.removed` w katalogu `lib/messaging` (BE-008); claimy i kolejność sprawdzeń przy odświeżeniu z `403 access_revoked` (BE-013).
- Dokumenty: `docs/mikroserwisy.md` 5.2 „Ludzie” (`GET …/members?role=&technical=`, `POST …/members`, `PATCH …/members/{id}`, `block`/`unblock`, `sign-out`, `DELETE`; konto techniczne: blokada zamiast `active`; osoba: 409 przy blokadzie i sign-out), `DELETE /me/memberships/{stableId}`, 2 (konto techniczne: jedna stajnia, bez ról osób), 3.8 (tabela: usunięcie, przypisanie, blokada, „Wyloguj wszystkie tablety”), 9.5 (Ola traci Brzozową; kradzież tabletu), 4.3 (`granted_via = platform`); `docs/development-szczegoly.md` 3.3 auth „Zarządzanie członkami”; `docs/erd.md` pkt 14 („Zablokuj”: `active = false` + `token_version + 1`).
- Makiety: `PanelLudzieWyswietlacze.dc.html` (filtr ról „Wszyscy · Admin · Obsługa · Klient · Instruktor · Konta techniczne”, kolumny Osoba, Rola, Konie, Kontakt, Status, Akcje: „Zablokuj”, „Usuń ze stajni”; stan zablokowany z „Odblokuj” i „Wyloguj wszystkie tablety” wg `mockups/STAN.md` pkt 5), oznaczenie „nadane przez zespół EQUENOR”.
- Scenariusze: A-23 (Damian przypisuje Olę do Brzozowej i odbiera; Paweł i Piotr widzą tylko swoje stajnie), A-24 i A-25 (blokada TV i tabletów, „Wyloguj wszystkie tablety”).
- Decyzje: DEC-15 („Opuść stajnię” w Profilu apki).

## Zakres
- [ ] Kontrakty (polityka: admin; `audit`): `GET /auth/v1/stables/{stableId}/members?role=&technical=` (osoba: imię, rola, aktywność, konie klienta z nazwami, kontakt: admin widzi telefon osoby, konta techniczne zamaskowane, `grantedVia`), `POST …/members` (`{ userId, role }`: osoba będąca członkiem innej stajni tej firmy; konto techniczne → 409 `account_kind_mismatch`; konto zespołu → 409 `target_in_use`; już członek → 409 `already_member`), `PATCH …/members/{memberId}` (`{ role?: 'staff' | 'instructor' | 'client', active? }`, tylko osoby; `If-Match`), `POST …/members/{id}/block` i `/unblock` (tylko konta techniczne), `POST …/members/{id}/sign-out` (tylko konta techniczne: `token_version + 1`), `DELETE …/members/{id}`.
- [ ] `DELETE /auth/v1/me/memberships/{stableId}` („Opuść stajnię”, osoba, nie konto techniczne) na tej samej funkcji domeny co usunięcie przez admina.
- [ ] Funkcja `removeMembership(tx, stableId, userId, actor)`: usunięcie wiersza, odwołanie `horse_access` tej osoby w tej stajni, audyt; po COMMIT `member.removed` (`stableId`, `userId`).
- [ ] Blokada: `active = false`, `deactivated_at`, `token_version + 1` w jednej transakcji; odblokowanie: `active = true` (urządzenia logują się ponownie, bo `tv` się zmieniło).
- [ ] Uprawnienie admina sprawdzane w bazie w tej samej transakcji (`business_admins` dla `stables.business_id` albo aktywny `platform_roles`), nie tylko w tokenie; przy `plt` zapis `granted_via = platform` i `granted_session_id = sid`.
- [ ] Kody błędów do `ERRORS`: `account_kind_mismatch`, `already_member` (409).

## Poza zakresem
- Zaproszenia (BE-022), dostęp do koni i macierz widoczności (BE-024), ekrany (WEB-005, MOB-011), „Opuść stajnię” w apce (MOB-006).
- Zwolnienie „Biorę” po `member.removed` (konsument w `operations`, BE-050).

## Kryteria akceptacji
- [ ] Damian przypisuje Olę do Brzozowej: przy odświeżeniu token Oli ma obie stajnie; po „Usuń ze stajni” Brzozowa znika z kolejnego tokenu (do 5 min), Pod Lipami bez zmian; `member.removed` opublikowane.
- [ ] Blokada „Tablety Pod Lipami”: odświeżenie tabletu daje `403 access_revoked`; po odblokowaniu stary refresh token daje `401 session_revoked` (nowe logowanie).
- [ ] „Wyloguj wszystkie tablety”: odświeżenie daje `401 session_revoked`; konto Oli bez zmian. Te same akcje na osobie: 409 `account_kind_mismatch`.
- [ ] Zmiana roli konta technicznego i przypisanie go do drugiej stajni: 409; obsługa i klient wołający te trasy: 403; admin Olszynki: 404.
- [ ] Admin odebrany przed chwilą (wiersz `business_admins` usunięty), z ważnym tokenem: zapis daje 404/403, nic się nie zmienia.

## Testy
- `backend/src/services/auth/members.test.ts` na harnessie (seed albo fabryki, FAKE IdP): scenariusze wyżej, przebieg odświeżenia z fałszywym zegarem, zdarzenia na adapterze w pamięci. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; `cd frontend && npm run gen:api`; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zmiana względem listy: dodana zależność BE-008 (`member.removed`) i przejęta trasa `DELETE /me/memberships/{stableId}` z BE-019.
- Jednego tabletu nie da się odłączyć (W4): bez listy sesji i bez „Odłącz to urządzenie”.
- `token_version` podbijają tylko: wylogowanie wszędzie, blokada, usunięcie konta, odebranie roli platformowej, „Wyloguj wszystkie tablety”, reset i zmiana hasła (3.8). Zmiana roli i usunięcie ze stajni go nie ruszają.
