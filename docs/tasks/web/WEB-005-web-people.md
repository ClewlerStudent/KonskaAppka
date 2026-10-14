---
id: WEB-005
title: PanelLudzie i konta techniczne
area: web
stage: 1
size: M
status: todo
depends_on: [BE-023, BE-024, WEB-004]
decisions: []
owner:
branch:
trello: https://trello.com/c/EJ4Wuubo
---
# WEB-005 · PanelLudzie i konta techniczne

## Cel
Admin konta zarządza ludźmi stajni w jednym miejscu: widzi członków z rolami i kontami technicznymi (telewizor, tablety), zmienia rolę, usuwa ze stajni, przypisuje osobę z firmy do kolejnej stajni, blokuje konto tabletów albo wylogowuje wszystkie tablety i ustawia klientom dostęp do koni z terminem.

## Kontekst
- **Stan kodu:** układ, `DataTable`, `FilterChips`, `SearchField`, `SidePanel`, `ConfirmDialog`, `useEditable`, `FlagPill`/plakietki z WEB-004; trasa-zaślepka `/stables/$stableId/people`.
- **Dokumenty:** docs/mikroserwisy.md 5.2 „Ludzie” i „Dostęp do koni”, 3.8 (skutek do 5 min), 4.3 (`granted_via = platform` → „nadane przez zespół EQUENOR”), 9.5 (Ola traci Brzozową; kradzież tabletu). BE-023: `GET /auth/v1/stables/{stableId}/members?role=&technical=`, `POST …/members` (`{ userId, role }`; `409 account_kind_mismatch`, `409 already_member`, `409 target_in_use`), `PATCH …/members/{memberId}` (`{ role?, active? }`, `If-Match`, tylko osoby), `POST …/members/{id}/block|unblock|sign-out` (tylko konta techniczne), `DELETE …/members/{id}`. BE-024: `GET`/`POST …/horses/{horseId}/access`, `PATCH …/horse-access/{accessId}` (`{ validTo?, revoke? }`, `If-Match`), `GET …/horse-clients`. docs/development-szczegoly.md 3.5.3 (konta techniczne jako zwykłe wiersze w filtrze), A-23, A-24, A-25.
- **Makiety:** docs/mockups/project/PanelLudzieWyswietlacze.dc.html: H1 „Ludzie · Stajnia Pod Lipami”, „10 członków · 2 zaproszenia · stan na wt 13.10.2026, 07:15”, „Zaproś osobę”, zakładki „Członkowie 10 | Zaproszenia 2”, „Szukaj osoby, konia lub kontaktu”, chipy „Wszyscy · 10 | Admin · 1 | Obsługa · 2 | Klient · 4 | Instruktor · 1 | Konta techniczne · 2”, kolumny „Osoba | Rola | Konie | Kontakt | Status | Akcje”, wiersze „Telewizor korytarz · konto techniczne · Wyświetlacz · — · t•••@stajnielipowe.pl · aktywne · Zablokuj · Usuń ze stajni”. makiety-plan.md B „PanelLudzie” (wiersze osób, akcje „Zmień rolę”, „Dezaktywuj”, „Konie i dostęp”; stany: blokada „Zablokowane od 07:20 · Odblokuj”, „Wyloguj wszystkie tablety”, przypisanie Oli do Brzozowej, nowa stajnia z pustą listą) i F „PanelLudzieWyswietlacze”.
- **Decyzje:** brak.
- **Dane demo:** Pod Lipami: Damian (admin konta), Ola, Piotr (obsługa), Anna (Kasztan, Bella), Karolina W. (Iskra), Tomasz L. (Grom), Ewa K. (Sonata), Marta (instruktor), „Telewizor korytarz”, „Tablety Pod Lipami”; Brzozowa: Paweł, Ola, Anna (Kometa), Marta, „Tablety Brzozowa”.

## Zakres
- [ ] `web/src/features/people/PeopleScreen.tsx` na `/stables/$stableId/people`: zakładka „Członkowie” (zakładkę „Zaproszenia” i „Zaproś osobę” dokłada WEB-006; do tego czasu przycisk ukryty), licznik w podtytule, wyszukiwarka po imieniu, koniu i zamaskowanym kontakcie, chipy ról z licznikami (filtr po stronie klienta; „Konta techniczne” = `technical=true`).
- [ ] Wiersze: osoba (imię; oznaczenie „nadane przez zespół EQUENOR” przy `grantedVia = platform`), rola („Admin konta (wszystkie stajnie)”, „Obsługa”, „Klient”, „Instruktor”, „konto techniczne · Wyświetlacz/Tablet”), konie klienta, kontakt zamaskowany, status („aktywne”, „nieaktywne”, „Zablokowane od HH:MM”). Admin konta: wiersz bez akcji (z `GET …/members`, jeśli kontrakt go zwraca; inaczej z `GET /me` dla zalogowanego admina).
- [ ] Akcje osoby: „Zmień rolę” (SidePanel z Obsługa | Instruktor | Klient, `PATCH` z `If-Match`), „Dezaktywuj”/„Aktywuj” (`PATCH active`, dialog bez dopisków), „Usuń ze stajni” (dialog ze skutkiem: „Ola straci dostęp do Stajni Brzozowej w ciągu 5 minut.”), u klienta „Konie i dostęp”.
- [ ] „Konie i dostęp” (SidePanel): dostępy klienta (koń, od, do, odwołany), zmiana „Ważne do” i „Odbierz dostęp” (`PATCH …/horse-access/{id}`), „Nadaj dostęp do konia” (`POST …/horses/{horseId}/access` z wyborem konia stajni i opcjonalnym „Ważne do”).
- [ ] Konta techniczne: „Zablokuj” (dialog „Zablokować konto Telewizor korytarz?”) / „Odblokuj”, „Usuń ze stajni”, przy koncie tabletów „Wyloguj wszystkie tablety” (dialog bez dopisków) → `block`/`unblock`/`sign-out`.
- [ ] „Przypisz z firmy” (A-23): SidePanel z osobami z innych stajni firmy (suma `GET …/members` pozostałych stajni z `GET /me`, bez kont technicznych i bez obecnych członków), wybór roli → `POST …/members`; `409 already_member`/`account_kind_mismatch` → komunikat.
- [ ] Odświeżenie listy po każdym zapisie (unieważnienie zapytań); 412 przez `useEditable`.
- [ ] Nowa stajnia: pusta lista z „Zaproś osobę” / „Przypisz z firmy”.

## Poza zakresem
- Zaproszenia: formularz i zakładka „Zaproszenia” (WEB-006); stan wysyłek zaproszeń (WEB-015); Ludzie w apce (MOB-011); dodanie kolejnego admina konta (zespół EQUENOR, WEB-026).

## Kryteria akceptacji
- [ ] Filtr „Konta techniczne · 2” pokazuje tylko „Telewizor korytarz” i „Tablety Pod Lipami”; w Brzozowej tylko „Tablety Brzozowa”.
- [ ] A-23: Damian przypisuje Olę do Brzozowej („Przypisz z firmy”, Obsługa); Ola pojawia się na liście Brzozowej; „Usuń ze stajni” usuwa ją z listy.
- [ ] A-24: „Zablokuj” przy „Telewizor korytarz” zmienia status na „Zablokowane od HH:MM” z „Odblokuj”; „Wyloguj wszystkie tablety” tylko przy koncie tabletów.
- [ ] Klient: zmiana „Ważne do” Komety zapisuje się z `If-Match`; równoległa zmiana daje komunikat 412.
- [ ] Obsługa, klient i konta techniczne nie widzą sekcji (nawigacja ukryta przez WEB-004, API 403).
- [ ] 390 px: lista jako karty, bez poziomego przewijania.

## Testy
- Vitest: filtry i wyszukiwarka (czyste funkcje), akcje wierszy na fałszywym API, dialogi i 412.
- Playwright na atrapie (`e2e/helpers/mock-api.ts` z WEB-004, fixture'y Pod Lipami i Brzozowej w `frontend/web/src/test/fixtures/`): filtr kont technicznych, blokada, przypisanie Oli; zrzuty 1440 i 390.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-023/BE-024; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Kontakty tylko zamaskowane w tabeli; pełny telefon klienta (z `horse-clients`) admin widzi tylko w „Konie i dostęp”, nie w logach.
- Bez listy tabletów i sesji: jednego tabletu nie da się odłączyć (W4); jest tylko „Wyloguj wszystkie tablety” i blokada.
- Bez roli „Wsparcie IT” i bez objaśnień ról (docs/makiety-plan.md 5 pkt 19 i 38).
