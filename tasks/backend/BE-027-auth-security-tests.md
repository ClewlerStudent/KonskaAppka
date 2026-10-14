---
id: BE-027
title: "Testy bezpieczeństwa auth i macierz izolacji etapu 1"
area: backend
stage: 1
size: M
status: todo
depends_on: [BE-011, BE-018, BE-019, BE-020, BE-021, BE-022, BE-024, BE-025, BE-026]
decisions: []
owner:
branch:
trello:
---
# BE-027 · Testy bezpieczeństwa auth i macierz izolacji etapu 1

## Cel
Jeden zestaw testów, który potwierdza warunek gotowości etapu 1: tokeny i logowanie są bezpieczne (MFA zawsze, równe odpowiedzi, blokady, kanarki), claimy każdej osoby z demo zgadzają się ze wzorcem, a trasy `auth` nie mieszają danych dwóch firm (Stajnie Lipowe i Olszynka).

## Kontekst
- Stan kodu: testy `auth` w `backend/src/services/auth/*.test.ts` (wzór: `app.test.ts`), seed z kontami i stajniami (BE-011), tokeny person i harness (`backend/src/lib/testing`, BE-010), trasy etapu 1: logowanie i rejestracja (istniejące), reset (BE-018), `/me` (BE-019), profil (BE-020), firmy (BE-021), zaproszenia (BE-022), członkowie (BE-023), konie i macierz (BE-024), `/internal` (BE-025), `/ops` i `/platform` (BE-026).
- Dokumenty: `docs/development-szczegoly.md` 4.2 („Jeden serwis autoryzacyjny i tokeny”, „Logowanie, MFA i ZITADEL tylko w auth”, „Trasy otwarte”, „Zaproszenia”, „Sesje”, „Izolacja stajni”), 3.6 „Etap 1” (warunek gotowości: rejestracja, logowanie oboma kanałami, reset, A-22, zaproszenie dopasowane po zalogowaniu, macierz izolacji zielona także między dwoma kontami firm); `docs/mikroserwisy.md` 3.2–3.3 (wzorce claimów, budżet 4 KB), 4.5 (testy admina globalnego), 8 (kody odmowy).
- Decyzje: brak nowych.
- Dane demo: wszystkie persony z mikroserwisy.md 2 i admin Olszynki.

## Zakres
- [ ] `backend/src/services/auth/security/claims.test.ts`: claimy każdej osoby z seedu wobec wzorca 3.3 (bez `av`, `scope`); konto techniczne nigdy z `biz`/`plt` (także przy próbie zaproszenia do drugiej stajni); konto bez roli platformowej nigdy z `plt`; budżet 4 KB: klient z 60 końmi, konto zaproszone przez 50 firm (limit 20 członkostw).
- [ ] `login.test.ts`: MFA zawsze (`amr: ["pwd","otp"]` dla Anny, Oli, Damiana, Marty, TV, tabletów, Kuby); sesja bez hasła albo bez kodu nie daje tokenu i daje log `alert`; token logowania: zły podpis, inny `client_id`, po `exp`, na trasie innego serwisu → 401; złe hasło i nieznane konto: ten sam kod, treść i czas; po 5 złych kodach `403 account_locked`, reset odblokowuje; niepotwierdzone konto `409 account_not_confirmed` i bez wiersza `users`; rejestracja na zajęty kontakt wygląda jak sukces.
- [ ] `tokens.test.ts`: `alg: none`, zły podpis, `iss`, `aud`, `typ`, `iat` z przyszłości, `exp − iat` > 5 min, `kid` spoza JWKS, refresh token na trasie zewnętrznej → 401; refresh: `tv` ≠ `token_version`, usunięte konto, zablokowane konto techniczne (`403 access_revoked` przed `tv`), odebrana rola platformowa; okno bezczynności przesuwa się, `exp` nie wychodzi poza `sst` + maksimum; zgubiona odpowiedź (ten sam refresh token działa ponownie); `POST /token` z ciasteczkiem bez dozwolonego `Origin` albo bez `X-Equenor-Client` → 403.
- [ ] `canary.test.ts`: unikalne hasło i kod w przepływach logowania, rejestracji, resetu i zmiany hasła; przechwycone logi `auth`, wiadomości w kolejkach (poza treścią kodu w kolejce kodów) i baza (`users`, `audit_log_changes`) nie zawierają hasła; kod nie występuje w logach ani odpowiedziach HTTP.
- [ ] `isolation.test.ts`: każda trasa `auth` z `{stableId}` albo `{businessId}` wołana tokenem admina Olszynki na obiektach Lipowych (i odwrotnie) → 404, bez zapisu; Piotr na Brzozowej, Paweł na Pod Lipami → 404; `plt = support` na danych stajni → 404. Lista tras brana z `services.auth.routes` (nowa trasa bez przypadku = czerwony test).
- [ ] `invitations-security.test.ts`: przypadki z 4.2 „Zaproszenia” (wygasłe, odwołane, podwójne dopasowanie, formaty numerów, e-mail a telefon, numer po nowym abonencie).
- [ ] `open-routes`: test istniejący w `contracts.test.ts` + sprawdzenie, że każda trasa otwarta ma limit po IP, a trasy wysyłające albo sprawdzające kod także po loginie albo tokenie logowania.

## Poza zakresem
- Pełna generowana macierz izolacji wszystkich serwisów (BE-057), testy na prawdziwym ZITADEL w CI (SH-003), kody na prawdziwych numerach (BE-059).

## Kryteria akceptacji
- [ ] Wszystkie testy wyżej zielone na FAKE IdP; zestaw logowania uruchamia się także na ZITADEL, gdy ustawiony `ZITADEL_TEST_URL` (BE-012).
- [ ] Dodanie trasy `auth` z `{stableId}` bez przypadku izolacji zatrzymuje `npm test`.
- [ ] Warunek etapu 1 (3.6) spisany jako checklista w README albo w tym pliku z odnośnikami do testów i A-22.

## Testy
- Zestaw w `backend/src/services/auth/security/` na harnessie bazy z seedem; `cd backend && npm test`; opcjonalnie `ZITADEL_TEST_URL=… npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; E2E frontendu (`cd frontend && npm run e2e`) zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zmiana względem listy: zależności rozszerzone o BE-011 (seed do claimów i izolacji), BE-019, BE-020, BE-021 i BE-025, bo testy obejmują ich trasy.
- Ponownego użycia refresh tokenu nie wykrywamy (W4): test dokumentuje, że skopiowany token działa do `exp` albo do podbicia `token_version`.
- Błąd znaleziony przez test naprawiaj w zadaniu, z którego pochodzi trasa, albo tutaj z opisem w PR; nie wyłączaj testu.
