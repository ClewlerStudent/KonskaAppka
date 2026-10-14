---
id: BE-037
title: Cron invitation-expiry-notifier
area: backend
stage: 3
size: S
status: todo
depends_on: [BE-009, BE-022]
decisions: []
owner:
branch:
trello:
---
# BE-037 · Cron invitation-expiry-notifier

## Cel
Admin (i obsługa, jeśli tak mówią reguły stajni) dowiaduje się SMS-em albo e-mailem, że zaproszenie wygasło nieprzyjęte, więc może wysłać nowe. Cron raz na godzinę wykrywa wygasłe zaproszenia i publikuje zdarzenie; wysyłką zajmuje się `notifications` (W3).

## Kontekst
- **Stan kodu:** zaproszenia (`invitations`, trasy `…/invitations`, dopasowanie w kroku MFA) robi BE-022 w `backend/src/services/auth/`. Szablon crona: BE-009 (`backend/src/jobs/<cron>/`, `npm run cron -- <nazwa>`, `publishBeforeCommit`, rola bazy z manifestu). Wąski grant kolumnowy dla tego crona: BE-003 (`SELECT (id, stable_id, role, display_name, locale, horse_id, expires_at, accepted_at, revoked_at)` na `invitations`, bez `target`). Konsument po stronie `notifications`: BE-036 (reguła `invitation_expired`).
- **Dokumenty:** docs/mikroserwisy.md 1.5 (wąskie granty cronów na tabelach `auth`), 6 (tabela cronów), 7.3 (`invitation.expired`); docs/development-szczegoly.md 3.4 `invitation-expiry-notifier` (`dedupe_key` `invitation_expired:{invitationId}:{userId}:{channel}`); docs/erd.md tabela `invitations`, manifest cronów.
- **Makiety:** AdminDzis.dc.html („Do załatwienia”: „+48 512 *** 908 Obsługa · zaproszenie wygasło 08.10 · Wyślij ponownie”).
- **Decyzje:** brak.
- **Dane demo:** w seedzie wygasłe zaproszenie dla obsługi (wygasło 08.10) i oczekujące zaproszenie Marka Nowaka do Luny (wygasa czw 15.10).

## Zakres
- [ ] Funkcja domeny `auth` czytająca wyłącznie kolumny z grantu, np. `backend/src/services/auth/domain/invitations/expired.ts`: zaproszenia z `expires_at` w oknie `(teraz − 24 h, teraz]`, `accepted_at IS NULL`, `revoked_at IS NULL`.
- [ ] Punkt wejścia `backend/src/jobs/invitation-expiry-notifier/` według BE-009 i wpis w rejestrze `backend/src/jobs/index.ts` (co godzinę); dla każdego zaproszenia w osobnej transakcji `publishBeforeCommit` zdarzenia `invitation.expired` (`invitationId`, `stableId`, `role`, `displayName`, `locale`, `horseId`, `expiresAt`), bez `target` i bez zapisu w bazie; podsumowanie w logu.
- [ ] Schemat `invitation.expired` w katalogu zdarzeń (BE-008), jeśli go nie ma.
- [ ] Wpis crona w manifeście `owners.ts` (BE-003): zapis brak, zdarzenie `invitation.expired`; skrypt `start:cron:invitation-expiry-notifier`.

## Poza zakresem
- treść, odbiorcy i wysyłka (BE-036); „Wyślij ponownie” (trasa `resend` w BE-022, ekrany WEB-006, MOB-010).

## Kryteria akceptacji
- [ ] Zaproszenie, które wygasło godzinę temu, daje publikację; przyjęte, odwołane albo wygasłe ponad dobę temu nie.
- [ ] Kolejne przebiegi w ciągu doby publikują to samo zdarzenie ponownie, a `notifications` wysyła jedną wiadomość na (zaproszenie, odbiorca, kanał) dzięki `dedupe_key` (test z BE-036 albo atrapą konsumenta).
- [ ] Rola bazy crona nie może czytać `invitations.target` ani niczego zapisać (meta-test grantów).
- [ ] Dwa przebiegi równoległe i przerwany przebieg nie psują stanu (cron nic nie pisze, więc tylko publikacje).

## Testy
- Integracyjne (Testcontainers PostgreSQL, adapter brokera w pamięci, fałszywy zegar `--now`): okno 24 h, statusy zaproszeń, granty kolumnowe.
- Uruchomienie: `cd backend && npm run check`; lokalnie `npm run cron -- invitation-expiry-notifier --now=2026-10-15T12:00:00Z`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; cron w rejestrze `backend/src/jobs/index.ts`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Grant na tabeli prywatnej `auth` jest kolumnowy (bez `target`) i nie służy autoryzacji (W2 zostaje); podobne wąskie granty mają tylko `horse-left-reconciler` i `retention-pruner`.
- Cron nie zna adresów (bez `target`); adres zaproszenia zna tylko `auth`, a powiadomienie o wygaśnięciu idzie do admina i obsługi według `notification_rules`, nie do zaproszonego.
- Bez tokenów i bez wywołań serwisów (W3).
