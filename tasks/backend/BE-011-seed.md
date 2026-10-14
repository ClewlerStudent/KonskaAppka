---
id: BE-011
title: "Seed z makiet: szkielet, konta, firmy i stajnie"
area: backend
stage: 0
size: M
status: todo
depends_on: [BE-004, BE-005, BE-010, BE-063]
decisions: [DEC-10, DEC-20]
owner:
branch:
trello:
---
# BE-011 · Seed z makiet: szkielet, konta, firmy i stajnie

## Cel
`npm run db:seed` stawia lokalnie i w testach dane z makiet: firmę Stajnie Lipowe z dwiema stajniami o różnych ustawieniach, wszystkie osoby i konta techniczne z demo, admina globalnego i drugą firmę do testów izolacji. Kolejne zadania domenowe dopisują swoje moduły seedu (hale, konie, flagi, rutyna).

## Kontekst
- Stan kodu: FAKE IdP ma konta demo w `backend/src/services/auth/identity/demo-users.ts` (Damian, Ola, Anna, Marta, a po BE-063 także „Telewizor korytarz”, „Tablety Pod Lipami” i „Tablety Brzozowa”; stałe `username`), ale `id` konta u dostawcy jest losowe (`randomUUID()` w `fake-idp.ts`). Stałe UUID danych demo: `backend/src/lib/demo/ids.ts` (osoby, firmy, stajnie: BE-063; hale, boksy, konie: BE-064) i `backend/src/lib/testing/demo.ts` (BE-010, wzorce claimów). Członkostwa demo w pamięci (`services/auth/access/demo-access.ts`, BE-063) to ta sama macierz, którą ten seed zapisuje w bazie. Zapisy z audytem: `unitOfWork` (BE-005).
- Dokumenty: `docs/development-szczegoly.md` 3.2 „Seed z makiet” (konto firmy z NIP 123-456-32-18, siedziba ul. Lipowa 12, 05-520 Konstancin-Jeziorna; ludzie per stajnia; konta techniczne; Kuba; Olszynka; ustawienia i macierz obu stajni; tryb stałej daty wt 13.10.2026 07:15, pop-up 06:01); `docs/mikroserwisy.md` 2 (tabela danych demo) i 3.3 (funkcje według seedu); README „Konta demo”.
- Decyzje: DEC-10 (Kuba to zwykłe konto z wierszem `platform_roles`, bez `identity_pool`), DEC-20 (macierz Pod Lipami = domyślna).
- Dane demo do zapisania tutaj: firmy „Stajnie Lipowe sp. z o.o.” i druga firma z innym NIP (Stajnia Olszynka, własny admin); stajnie Pod Lipami, Brzozowa (ul. Brzozowa 5, 05-500 Piaseczno), Olszynka.

## Zakres
- [ ] `backend/scripts/seed/main.ts` i `npm run db:seed [-- --fixed-date | --today]`: moduły w ustalonej kolejności (`accounts`, potem dopisywane przez inne zadania: `stables-structure`, `horses`, `operations`…), każdy idempotentny (stałe UUID, `ON CONFLICT DO NOTHING`), każdy przez `unitOfWork` z audytem `actor_type = system`, `action = seed`. Tryb `--fixed-date` (13.10.2026 07:15 Europe/Warsaw) albo względem dziś; czasy liczone od punktu odniesienia. Opcja `--variant <nazwa>` (domyślnie `demo`): moduł może zdefiniować warianty, które pomijają albo zmieniają jego dane (np. `bez-akcji` z BE-044, `bez-flag-a01` z BE-034), żeby flow E2E (Maestro, Playwright) dało się powtarzać bez duplikatów; lista wariantów w README „Konta demo”. Te same opcje ma `npm run db:reset`.
- [ ] `npm run db:reset` (tylko poza prod): czyści schematy `app` i `audit`, migruje i seeduje.
- [ ] FAKE IdP: `id` konta = `username` (tak samo jak ZITADEL z `user_id` nadanym przez `auth`, BE-012), więc `users.idp_user_id = users.id` dla kont demo. Rozszerz `DEMO_USERS` (konta TV i tabletów dodał BE-063) o Piotra, Pawła, Karolinę W., Tomasza L., Ewę K., Kubę i drugiego admina globalnego, admina Olszynki; UUID dopisz do `lib/demo/ids.ts`. `npm run dev:zitadel-seed` (BE-012) czyta listę z `DEMO_USERS`, więc nowe konta trafią też do lokalnego ZITADEL bez zmian w skrypcie. Marek Nowak nie ma konta (ma tylko zaproszenie, BE-032). Kontakty fikcyjne, hasło z `DEV_DEMO_PASSWORD`.
- [ ] Moduł `accounts`: `users` (wszyscy powyżej; `account_kind = technical` dla TV i tabletów; `token_version = 0`; kopie kontaktów), `businesses` (NIP jako 10 cyfr), `business_admins` (Damian → Lipowe, admin Olszynki → Olszynka), `stables` z `stable_settings` (Pod Lipami: wszystko włączone, `warn_offset_min = 30`, `notify_offset_min = 15`; Brzozowa: `flags_require_ack = false`, `soak_enabled = false`, `paddock_out_enabled = false`, reszta włączona; Olszynka: domyślne z `lib/rules`), `stable_members` (Ola staff w obu, Piotr Pod Lipami, Paweł Brzozowa, Marta instructor w obu, TV `display` Pod Lipami, tablety `tablet` w swoich stajniach, klienci `client`), `stable_role_features` (macierze Pod Lipami i Brzozowej z 3.2), `platform_roles` (Kuba i drugi admin: `admin`, `named`, zatwierdzone, `expires_at` +90 dni), wygasłe zaproszenie dla obsługi (+48 512 *** 908, wygasło 08.10).
- [ ] README: sekcja „Konta demo” z pełną listą kont i ról.

## Poza zakresem
- Hale i boksy (BE-031), konie, historia boksów, `horse_access`, zaproszenie Marka do Luny (BE-032), reguły powiadomień (BE-029), szablony i pory (BE-028), flagi i dalsze dane (zadania etapów 3–8).
- Konta demo w lokalnym ZITADEL (BE-012).

## Kryteria akceptacji
- [ ] `npm run db:reset` na bazie z compose kończy się sukcesem; drugi `npm run db:seed` nic nie dubluje.
- [ ] Każdy zapis seedu ma wpis w `audit.audit_log` (`actor_type = system`, `action = seed`).
- [ ] Liczby: 3 stajnie, 2 firmy, macierz Brzozowej bez planu karmienia u klienta i bez zadań u obsługi.

## Testy
- `backend/scripts/seed/seed.test.ts` na harnessie: idempotencja, liczności, ustawienia obu stajni, brak `identity_pool`. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; README zaktualizowane; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zmiana względem pierwotnej listy: zależność od BE-010 (stałe UUID w `lib/testing/demo.ts`).
- Docs mówią „przez API albo repozytoria właścicieli”: na etapie 0 repozytoriów jeszcze nie ma, więc moduły piszą przez Drizzle w `unitOfWork`; zadania, które dodają repozytorium domeny, przepinają swój moduł seedu na nie.
- Numery i adresy są fikcyjne; w repo żadnych prawdziwych danych ani haseł.
- `scripts/seed/main.ts` z tego zadania to jedyny punkt wejścia seedu: zadania domenowe (np. BE-028…BE-052) dopisują swój moduł do listy modułów w `main.ts` w ustalonej kolejności, nie tworzą własnych skryptów. Wszystkie zadania po BE-013 zależą od seedu przez BE-013.
- Sprawdzenie, że logowanie Oli trafia w wiersz `users` z seedu, jest w BE-013 (tu `auth` jeszcze nie ma bazy).
