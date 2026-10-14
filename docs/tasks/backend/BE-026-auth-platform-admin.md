---
id: BE-026
title: "Admin globalny: plt, logowanie /ops/* i trasy /platform w auth"
area: backend
stage: 1
size: L
status: todo
depends_on: [BE-006, BE-008, BE-013]
decisions: [DEC-10, DEC-07, DEC-05]
owner:
branch:
trello: https://trello.com/c/EsHyg1Jz
---
# BE-026 · Admin globalny: plt, logowanie /ops/* i trasy /platform w auth

## Cel
Zespół EQUENOR (w demo Kuba) loguje się na osobnym hoście `[OPS]` hasłem, kodem i powodem wejścia, dostaje token z `plt = admin` i wchodzi do każdej firmy i stajni jak admin konta (W1). W `auth` działają trasy platformowe: lista firm, użytkownicy (wylogowanie, odblokowanie), konta techniczne i kolejny admin konta we dwie osoby.

## Kontekst
- Stan kodu: `ClientIdSchema` w `backend/src/contracts/common.ts` ma tylko `web`, `mobile`, `tablet` (claimy w `lib/auth/claims.ts` znają już `ops`, `opctl`); logowanie i krok MFA w `services/auth/routes/login.ts`, odświeżenie i ciasteczko `__Secure-eq_rt` w `routes/session.ts`, okna sesji w `tokens/lifetimes.ts` (bez `ops`/`opctl`), Origin i `X-Equenor-Client` w `kit/origin.ts`. `plt` z `platform_roles` (BE-013), polityka `platform` i `stepUp` w deskryptorze (BE-006), `business_admin.changed` w katalogu (BE-008), audyt `actor_type = operator` (BE-005).
- Dokumenty: `docs/mikroserwisy.md` 4.1 (logowanie na `[OPS]`, `reason`, wpis `ops_login`, `opctl` bez `Origin`, step-up: `auth_time` ≤ 5 min), 4.2–4.5 (co może, czego nie, audyt i log odczytów, role we dwie osoby, alerty, testy), 3.4 (okna: `ops` 30 min / 10 h, `opctl` 30 min / 1 h), 3.7 (`[OPS]/auth/v1/ops/token` i ciasteczko `__Secure-eq_rt_ops`, `Path=/auth/v1/ops/token`), 5.2 „Platforma” (trasy), 9.6 (Kuba, powód ZGL-123); `docs/development-szczegoly.md` 4.2 (role, tokeny).
- Decyzje: DEC-10 wariant A z rekomendacją (osobny host `[OPS]`; konta zespołu = wiersz `platform_roles` w tej samej organizacji ZITADEL, bez `identity_pool`; `plt = support` na PoC nienadawane), DEC-07 (panel, API i `[OPS]` w jednej domenie rejestrowalnej, np. `ops.<domena>`), DEC-05 (klucz z sekretu: trasy `/platform/keys/rotate` nie ma).
- Dane demo: Kuba i drugi admin globalny (BE-011), firmy Lipowe i Olszynka.

## Zakres
- [ ] `ClientIdSchema` + `ops`, `opctl`; okna sesji w `lifetimes.ts`; `isClientAllowed`: `ops`/`opctl` tylko konto z aktywnym `platform_roles`, konto z wierszem `platform_roles` nigdy `mobile`/`web`/`tablet` (`403 wrong_client`).
- [ ] Trasy otwarte (do `open-routes.txt`, limity po IP i loginie): `POST /auth/v1/ops/login`, `/ops/login/mfa` (wymagane `reason`, 3–200 znaków), `/ops/token`, `/ops/logout`, `/ops/password/forgot`, `/ops/password/reset` (handlery z BE-018 na ścieżce `/ops`). Origin tylko z `OPS_ORIGINS` (env); `opctl` tylko bez nagłówka `Origin` (z `Origin` → 403).
- [ ] Krok MFA `ops`: jak zwykły, plus aktywna rola platformowa (inaczej `403 wrong_client`, alert), wpis audytu `action = ops_login`, `entity_type = user`, `session_id = sid`, `audit_log_changes` z `field = reason`; log `alert: ops_login` (kto, powód). `break_glass`: `first_used_at` przy pierwszym logowaniu, rola wygasa 4 h później.
- [ ] Odświeżenie `ops`/`opctl`: aktywna rola sprawdzana przy każdym (`401 session_revoked`), `auth_time` bez zmian (step-up po 5 min od logowania mimo odświeżeń); ciasteczko `__Secure-eq_rt_ops` dla `ops`, tokeny w treści dla `opctl`.
- [ ] Trasy `/auth/v1/platform/*` (polityka `platform`): `GET /platform/businesses` (admin, support: firmy z NIP i stajnie ze statusem), `GET /platform/stables/{stableId}/technical-accounts` (admin, support: bez kontaktów), `GET /platform/users?q=` (admin), `POST /platform/users/{userId}/sign-out` (`token_version + 1`), `POST /platform/users/{userId}/unlock` (`unlockUser` u dostawcy, BE-012).
- [ ] `POST /platform/business-admin-requests` (`{ kind: 'add' | 'remove', businessId, targetUserId, reason }`, step-up) → `platform_requests`; `POST /platform/business-admin-requests/{id}/approve` (inny admin: `approved_by ≠ requested_by`, step-up, przed `expires_at`) → `business_admins` z `granted_via = platform` albo usunięcie (ostatniego admina firmy nie usuwa: 409 `sole_business_admin`), audyt, po COMMIT `business_admin.changed`. Konto zespołu jako cel → 409 `target_in_use`.
- [ ] Meta-test (BE-006): każda trasa z `admin` przechodzi dla Kuby z `ops`; `plt = support` na trasach danych stajni: 404, na trasach tylko admina: `403 forbidden_platform`.

## Poza zakresem
- `opctl` i trasy ról platformowych oraz kont zespołu (`/platform/role-requests`, `/platform/team-accounts`, bootstrap; BE-056); panel `[OPS]` (WEB-026); historia i retencja audytu (BE-055).

## Kryteria akceptacji
- [ ] Kuba: `ops/login` + `ops/login/mfa` z `reason = ZGL-123` → token z `plt = admin`, `amr: ["pwd","otp"]`, wpis `ops_login` z powodem; bez `reason` → 400.
- [ ] Ola na `/ops/login/mfa` → `403 wrong_client`; Kuba na `/auth/v1/login` z `mobile` → `403 wrong_client`.
- [ ] Zapis wrażliwy 6 min po logowaniu (także po odświeżeniu tokenu) → `401 step_up_required`.
- [ ] Odebranie roli (`revoked_at` w bazie) → następne odświeżenie `401 session_revoked`.
- [ ] Wniosek o admina konta zatwierdzony przez tę samą osobę → 403; przez drugiego admina → wiersz `business_admins` z `granted_via = platform` i zdarzenie `business_admin.changed`.

## Testy
- `backend/src/services/auth/ops.test.ts` i `platform.test.ts` na harnessie (FAKE IdP, fałszywy zegar): testy z mikroserwisy.md 4.5 i development-szczegoly.md 4.2 „Jeden serwis autoryzacyjny”. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; `open-routes.txt` zaktualizowany; `backend/README.md` (env `OPS_ORIGINS`, logowanie zespołu w dev); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Bez osobnej organizacji ZITADEL i bez `identity_pool` (DEC-10), mimo opisu w mikroserwisy.md 4.1.
- Admin globalny nie omija reguł biznesowych (`409 option_disabled`, `If-Match`, 422) i nie nadaje ról z `[OPS]` (tylko `opctl`, BE-056).
- Każdy dostęp nadany tokenem z `plt` ma `granted_via = platform` i `granted_session_id = sid` (dotyczy też BE-022, BE-023, BE-024).
