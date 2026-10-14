---
id: BE-013
title: "auth: users i uprawnienia z bazy, claimy z tabel"
area: backend
stage: 1
size: L
status: todo
depends_on: [BE-001, BE-004, BE-005, BE-007, BE-010, BE-011]
decisions: [DEC-03, DEC-05, DEC-06, DEC-10, DEC-23]
owner:
branch:
trello: https://trello.com/c/hZjjvuTf
---
# BE-013 · auth: users i uprawnienia z bazy, claimy z tabel

## Cel
`auth` trzyma konta i uprawnienia w PostgreSQL zamiast w pamięci i liczy z nich prawdziwe claimy (`biz`, `m` z `f` i `h`, `plt`) przy logowaniu i każdym odświeżeniu. Od tego zadania restart `auth` nikogo nie wylogowuje, a zmiany uprawnień działają do 5 min.

## Kontekst
- Stan kodu: seed kont, firm i stajni `npm run db:seed` (BE-011), dane demo w pamięci i `GET /me` v1 z `StableDirectory` (BE-063, `AUTH_STORE=memory`). `backend/src/services/auth/users/user-repository.ts` (`User` z `identityPool`, `upsertOnLogin`), `memory-users.ts`, `access/access-repository.ts` (`AccessGrants`), `memory-access.ts` (zawsze brak dostępu), `tokens/claims.ts` (`computeAccessClaims`, `isClientAllowed`, `sessionKindOf`), `tokens/issue.ts` (`issueSession`, `verifyRefreshToken`), `tokens/signer.ts` (jeden klucz, `publicJwks`), `routes/session.ts` (odświeżenie: konto, `tv`, zgodność z aplikacją), `routes/login.ts` (upsert przy kroku MFA z `identityPool: 'customer'`), `main.ts` (repozytoria w pamięci). Tabele: `users`, `businesses`, `business_admins`, `platform_roles` (BE-001), `stable_members`, `horse_access`, `stable_role_features`, `stables`, `horses` (BE-004). Macierz domyślna: `lib/rules/features.ts` (BE-007). Stałe demo: `lib/testing/demo.ts` (BE-010).
- Dokumenty: `docs/mikroserwisy.md` 3.2 (reguły wyliczania: `m` bez stajni z `biz`, `h` ważne teraz, klient bez konia bez stajni, `exp` na granicy dzierżawy, `f` z macierzy, konto techniczne dokładnie jedno `m`, budżet 4 KB, twarde limity 20 członkostw i 100 koni), 3.3 (wzorce claimów), 3.4 (okna sesji), 3.5 (JWKS), 3.7 (kolejność sprawdzeń przy odświeżeniu), 3.8.
- Decyzje: DEC-03 A (funkcje w `m[].f`), DEC-05 B (`SIGNING_KEY_FILE` + opcjonalny `SIGNING_KEY_NEXT_FILE`; oba w JWKS, podpisuje tylko pierwszy; refresh token przyjmowany tylko kluczami z konfiguracji), DEC-06 A (okna z 3.4, bez DPoP), DEC-10 (konto zespołu = konto z wierszem `platform_roles`, bez `identity_pool`), DEC-23 A (klient bez ważnego konia traci stajnię w tokenie).
- Dane demo: Damian (`biz`), Ola (dwie stajnie, różne `f`), Anna (Kasztan, Bella; Kometa), Marta, „Tablety Pod Lipami”, „Telewizor korytarz”, Kuba.

## Zakres
- [ ] `users/pg-users.ts`: `findByIdp(idpUserId)`, `getById`, `upsertOnLogin` (nowy wiersz: `account_kind = person`, `token_version = 0`, imię i język z dostawcy; istniejący: tylko kopia zweryfikowanych kontaktów i `contact_synced_at`; brak wiersza po `idp_user_id`, a jest wiersz o `id = username` → ponowne powiązanie z audytem i logiem `alert`), `bumpTokenVersion(tx, userId)`. Usunąć `identityPool` z modelu `User`.
- [ ] `access/pg-access.ts`: `forUser(userId, now)` → `biz` (z `business_admins`), `m` (aktywne `stable_members` poza stajniami firm z `biz`; `f` z `stable_role_features` albo `roleFeatures` z `lib/rules`; `h` z `horse_access` ważnych teraz i koni bez `status = left`; klient bez konia → bez tej stajni), `plt` (aktywny `platform_roles`: zatwierdzony, nieodwołany, `expires_at` w przyszłości), najbliższa granica okna dostępu klienta (`exp` tokenu ≤ granica).
- [ ] Limity: najwyżej 20 członkostw, 100 koni w `h` na stajnię (nadmiar pominięty, log `alert`); test budżetu 4 KB (klient z 60 końmi, konto w 20 stajniach).
- [ ] Konto techniczne: zawsze dokładnie jedno `m`, nigdy `biz` ani `plt`. Konto zespołu (jest wiersz `platform_roles`): `isClientAllowed` odrzuca `mobile`, `web`, `tablet` (`403 wrong_client`).
- [ ] `routes/session.ts`: kolejność z 3.7: klucz i `exp`; konto istnieje i nieusunięte (`401 session_revoked`); konto techniczne z aktywnym członkostwem (inaczej `403 access_revoked`, kod do `ERRORS`); `token_version = tv` (`401 session_revoked`); zgodność z aplikacją (`403 wrong_client`); claimy od nowa (`auth_time` z `sst`). Ta sama kontrola `access_revoked` przy logowaniu.
- [ ] Drugi klucz (DEC-05): `signer.ts` przyjmuje klucz główny i opcjonalny `SIGNING_KEY_NEXT_FILE`; JWKS publikuje oba, podpisuje główny; `verifyRefreshToken` przyjmuje oba. Env w `env.ts`, opis rotacji w `backend/README.md` (dodać NEXT → po dobie zamienić miejscami → po 30 dniach usunąć stary; awaryjnie: usunąć stary od razu).
- [ ] `main.ts` i `env.ts`: `DATABASE_URL`, `AUTH_STORE=postgres|memory` (`memory` tylko poza prod, żeby E2E frontendu działały bez bazy do czasu SH-003); `/readyz` z `checkMigrations`.
- [ ] `scripts/dev-token.ts` (BE-010): przy dostępnej bazie claimy liczone przez `pg-access`, nie ze wzorca.

## Poza zakresem
- Dopasowanie zaproszeń przy logowaniu i odświeżeniu (BE-022), `GET /me` z listą stajni (BE-019), okna i `plt` dla `ops`/`opctl` (BE-026), token zawężony `resource` przy przekroczeniu budżetu (mikroserwisy.md 10.2 pkt 19; na razie tylko limity i alert).

## Kryteria akceptacji
- [ ] Claimy każdej osoby z seedu (BE-011 + konie z fabryk; konie z seedu dochodzą w BE-032) zgadzają się ze wzorcem z mikroserwisy.md 3.3; Damian bez `m`; tablet bez `tasks` i `box_history`.
- [ ] Logowanie Oli z FAKE IdP przy `AUTH_STORE=postgres` trafia w wiersz `users` z seedu (to samo `id`, `idp_user_id = id`), a nie zakłada nowego.
- [ ] Dostęp Anny do Komety z `valid_to` za 2 min: token ma `exp` równy granicy, a następny token nie ma Brzozowej.
- [ ] Zablokowane konto techniczne przy odświeżeniu dostaje `403 access_revoked`, a nie `401 session_revoked`; po podbiciu `token_version` osoby stary refresh token daje `401 session_revoked`.
- [ ] Restart `auth` z `AUTH_STORE=postgres` nie wylogowuje (ten sam refresh token działa).
- [ ] Token podpisany kluczem spoza konfiguracji daje `401 session_revoked` przy odświeżeniu.

## Testy
- Integracyjne na harnessie (`lib/testing`): repozytoria, claimy względem wzorca, kolejność sprawdzeń przy odświeżeniu, granica dzierżawy (fałszywy zegar), limity i budżet, dwa klucze. Istniejące `app.test.ts` przechodzą na obu magazynach. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; `backend/README.md` (env `auth`, rotacja klucza); E2E frontendu (`cd frontend && npm run e2e`) dalej zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Bez KMS i bez tabeli `signing_keys` (DEC-05), mimo opisu w mikroserwisy.md 3.5.
- Zmiana względem listy: dodane zależności BE-004 (tabele `stable_members`, `horse_access`, `stable_role_features`) i BE-005 (zapis z audytem).
- `tv` w refresh tokenie porównuj z `users.token_version` w bazie przy każdym odświeżeniu; odświeżenie nie woła ZITADEL.
