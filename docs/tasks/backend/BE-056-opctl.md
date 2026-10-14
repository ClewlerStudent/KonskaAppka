---
id: BE-056
title: CLI opctl
area: backend
stage: 9
size: M
status: todo
depends_on: [BE-026, BE-009, BE-040, BE-052]
decisions: [DEC-10, DEC-05, DEC-08]
owner:
branch:
trello: https://trello.com/c/iXtl5rTs
---
# BE-056 · CLI opctl

## Cel
Zespół EQUENOR ma narzędzie wiersza poleceń do operacji, których nie robi się z panelu: założenie pierwszych adminów globalnych, kont zespołu, nadawanie i odbieranie ról platformowych we dwie osoby, wydania APK, plany billingu i ręczny przebieg crona. CLI loguje się jak każdy (hasło i kod) i działa tylko przez trasy `auth` i serwisów.

## Kontekst
- **Stan kodu:** admin globalny (`plt` z `platform_roles`, trasy `/auth/v1/ops/login`, `/ops/login/mfa`, step-up, `business-admin-requests`): BE-026 w `backend/src/services/auth/`. Wydania: `/platform/v1/platform/releases` (BE-040). Plany: `/billing/v1/platform/plans` (BE-052). Crony i ich nazwy: BE-009. Klucz podpisu: sekret z pliku (`SIGNING_KEY_FILE`, `backend/src/services/auth/tokens/signer.ts`).
- **Dokumenty:** docs/mikroserwisy.md 4.1 (`opctl`: `client_id = opctl`, bez `Origin`, tokeny w treści odpowiedzi; tylko `opctl` przechodzi trasy ról: `clients: ['opctl']`), 4.5 (role we dwie osoby, min. 2 aktywnych adminów, wygasanie po 90 dniach, bootstrap), 5.2 „Platforma” (`POST /platform/role-requests`, `…/{id}/approve`, `POST /platform/team-accounts`), 3.4 (`opctl` 30 min / 1 h); docs/development-szczegoly.md 3.3 `platform` „CLI”.
- **Makiety:** brak (CLI).
- **Decyzje:** DEC-10 A (host `[OPS]`, `opctl`, role we dwie osoby; konta zespołu to wiersz `platform_roles` w tej samej organizacji ZITADEL, bez `identity_pool`; support później). DEC-05 B (dwa klucze z sekretów, bez tabeli `signing_keys`: rotacja to wymiana sekretu przez Dawida, więc `opctl keys rotate` i `POST /platform/keys/rotate` nie powstają). DEC-08 C (ZITADEL: PAT w dev, private key JWT w test i prod).
- **Dane demo:** Kuba (admin globalny), drugi admin globalny z seedu dev (zasada dwóch osób).

## Zakres
- [ ] Trasy w `auth` (`clients: ['opctl']`, `plt = admin`, step-up `auth_time` ≤ 5 min, audyt `actor_type = operator`, `client = opctl`):
  - `POST /auth/v1/platform/role-requests` (`{kind: role_grant | role_revoke, targetUserId, role: admin | support, reason}`) i `POST /auth/v1/platform/role-requests/{id}/approve` (`approved_by ≠ requested_by`; odmowa, gdy zostałoby mniej niż 2 aktywnych adminów; odebranie: `revoked_at` i `token_version + 1`; własną rolę można oddać od razu);
  - `POST /auth/v1/platform/team-accounts` (`{displayName, email, phone, codeChannel}`): konto w ZITADEL z zweryfikowanym kontaktem, metodą OTP i losowym hasłem (nowa osoba ustawia hasło przez „Nie pamiętam hasła”), bez roli (rolę daje wniosek).
- [ ] Bootstrap: skrypt `npm run opctl:bootstrap` (uruchamiany jako Job, z rolą bazy `auth`): tylko gdy nie ma aktywnej roli admina; zakłada dwóch imiennych adminów (konto w ZITADEL + `platform_roles`, wygasa po 24 h bez logowania z MFA); zawsze wypisuje alert w logu.
- [ ] CLI `backend/scripts/opctl/` (`npm run opctl -- <komenda>`): `login` (login, hasło bez echa, kod; nagłówek bez `Origin`; tokeny tylko w pamięci procesu albo w pliku `~/.config/equenor/opctl.json` z prawami 600, wygasają według okien `opctl`), `whoami`, `operators create`, `platform grant|revoke|approve|list`, `business-admin request|approve` (trasy z BE-026), `releases create|upload|rollout|complete|halt|list` (BE-040), `plans get|set` (BE-052), `cron run <nazwa>` (lokalnie `npm run cron -- <nazwa>`, w klastrze wypisuje polecenie utworzenia Joba z CronJoba; uruchomienie zależy od dostępu do klastra).
- [ ] Odpowiedzi `401 step_up_required` CLI obsługuje ponownym logowaniem i powtórzeniem polecenia.
- [ ] `backend/README.md`: sekcja „opctl” z przykładami i wymaganiami (adres `[OPS]`, zmienne env CLI).
- [ ] Runbooki `docs/runbooki/apk-cofniecie.md` i `cron-reczny-przebieg.md` (SH-006): dopisz wariant z `opctl` obok kroków przez `/platform/*` i `npm run cron`.

## Poza zakresem
- rotacja klucza podpisu (DEC-05 B: wymiana sekretu `SIGNING_KEY_FILE` / `SIGNING_KEY_NEXT_FILE` przez Dawida, runbook SH-006); konto awaryjne `break_glass` (po PoC); Wsparcie IT (`support`, DEC-10: później).

## Kryteria akceptacji
- [ ] Trasy ról z aplikacji `ops` dają `403 client_not_allowed`; `client_id = opctl` z nagłówkiem `Origin` jest odrzucany.
- [ ] Wniosek i zatwierdzenie przez tę samą osobę: odmowa; przez drugą: rola aktywna z `expires_at` + 90 dni.
- [ ] Zapis 6 min po logowaniu (także po odświeżeniu tokenu) daje `401 step_up_required`.
- [ ] Odebranie roli: odświeżenie tokenu tej osoby daje `401 session_revoked`; nie da się zejść poniżej 2 aktywnych adminów.
- [ ] Bootstrap przy istniejącym aktywnym adminie nic nie robi i kończy się błędem.

## Testy
- Integracyjne (Testcontainers PostgreSQL, fałszywy IdP z `backend/src/services/auth/identity/fake-idp.ts` albo ZITADEL z compose): trasy ról i kont zespołu, step-up, zasada dwóch osób.
- CLI: testy jednostkowe parsera poleceń i klienta HTTP na atrapie serwera.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/auth.json` bez nowych tras publicznych spoza `/platform`; `backend/README.md` zaktualizowany.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Zmiana zależności względem pierwotnej listy: dodane BE-009, BE-040 i BE-052, bo CLI obsługuje crony, wydania i plany.
- Nie loguj haseł ani kodów; plik z tokenami tylko z prawami 600.
- Bez osobnej organizacji zespołu (decyzja właściciela): uprawnienie platformowe to tylko wiersz `platform_roles`.
