---
id: BE-038
title: "board: widok klienta i karta konia (flagi)"
area: backend
stage: 3
size: M
status: todo
depends_on: [BE-033, BE-034]
decisions: [DEC-23, DEC-03, DEC-31]
owner:
branch:
trello:
---
# BE-038 · board: widok klienta i karta konia (flagi)

## Cel
Klient po zalogowaniu widzi „Moje konie”: swoje konie w wybranej stajni, ich boksy i flagi z godzinami oraz statusem („Potwierdzona 06:02”, „niepotwierdzona”, „Obowiązuje od razu”). Obsługa i admin widzą flagi w listach koni i boksów, a admin dostaje alert niepotwierdzonej flagi krytycznej. To zadanie dokłada flagi do ekranów złożonych w `board`.

## Kontekst
- **Stan kodu:** serwis `board` (`backend/src/services/board/`, rola bazy tylko `SELECT`, ETag = hash treści, 304, czas w nagłówku `Date`) oraz `GET …/boxes-overview`, `GET …/horses-overview`, `GET …/setup-checklist` powstają w BE-033. Flagi (`horse_flags`, `flag_acknowledgements`, `flag_escalations`) i ich DTO: BE-034 (`backend/src/services/operations/domain/flags/`). Etykiety godzin, skutki flag i `stableFeatures`: `backend/src/lib/rules` (BE-007). Polityka tras i `resolveStable`: BE-006.
- **Dokumenty:** docs/mikroserwisy.md 5.4 (tabela tras `board`: `client-home` dla klienta, `horses/{h}/card` dla klienta ze swoim koniem, obsługi i admina; dane o ludziach aplikacja dociąga z `auth`), 3.6 (klient: koń spoza `h` i koń `left` dają 404), 3.2 (klient bez ważnego konia nie ma stajni w tokenie); docs/development-szczegoly.md 3.3 `board`, 3.1.9 (widoczność tylko zawęża), 4.1 („Status flagi”, „Widoczność”); docs/erd.md pkt 3 (widok klienta), pkt 12.
- **Makiety:** Main.dc.html, MainLuna.dc.html, MainBrzozowa.dc.html, KartaKonia.dc.html (zakładka Flagi i „Dziś”), StajennyKonie.dc.html, BoksyAdmin.dc.html, PanelBoksy.dc.html, AdminDzis.dc.html (sekcja „Pilne”).
- **Decyzje:** DEC-23 A (klient bez ważnego konia traci stajnię w tokenie: `client-home` dla stajni spoza `m` daje 404, MainBezKonia nie powstaje). DEC-03 A (sekcje według `m[].f`).
- **Dane demo:** Anna (Kasztan HG 7 z dwiema potwierdzonymi flagami, Bella HN 4 z niepotwierdzoną; w Brzozowej Kometa z flagą bez potwierdzeń), Marek Nowak (Luna bez boksu, brak flag), Ola (obsługa), Damian (admin).

## Zakres
- [ ] Kontrakty `client-home` i `card` są już w `backend/src/contracts/board.ts` z przykładami (BE-064): implementuj je; zmiany tylko addytywne i razem z przykładami. Zakres pól:
  - `GET /board/v1/stables/{stableId}/client-home?lang=` (rola `client`): konie z `m[].h` w tej stajni (także bez boksu, jak Luna), każdy z `horseId`, nazwą, płcią i rasą, boksem (`boxId`, numer, hala z `showBuilding` gdy stajnia ma więcej niż jedną halę) albo `null`, flagami aktywnymi i dzisiejszymi;
  - `GET /board/v1/stables/{stableId}/horses/{horseId}/card?lang=` (klient: swój koń; obsługa; admin; `plt`): nagłówek konia (nazwa, boks z halą, rasa, wiek), zakładka flag z godzinami i skutkami („Wstrzymuje śniadanie 06:30, obiad bez zmian”), sekcja „Dziś” z flagami.
- [ ] DTO flagi w widokach: etykieta, `hoursLabel` („06:00–10:00”, „od 14:30”, „dziś, cały dzień”), notatka, wariant („Derka: zakładać”), `requiresAck`, `status` (`acknowledged` z godziną, `unacknowledged`, albo brak i „obowiązuje od razu”), `createdAt`, informacja o eskalacji `admin_notify` („Admin stajni dostał powiadomienie”), skutki z `lib/rules`.
- [ ] Flagi w `boxes-overview` i `horses-overview` (BE-033): przy boksie i koniu aktywne flagi z godzinami i statusem; liczniki niepotwierdzonych.
- [ ] Alert niepotwierdzonej flagi krytycznej (`severity = critical`, `requires_ack = true`, bez potwierdzenia) w `boxes-overview` dla admina (także po wyłączeniu potwierdzeń w stajni, A-20).
- [ ] Sekcje według `m[].f` roli i `stableFeatures`: bez funkcji `flags` brak sekcji flag; admin i `plt` widzą wszystko.
- [ ] Klient: koń spoza `m[].h` albo ze `status = left` daje 404 od razu; w `client-home` takich koni nie ma.
- [ ] Deterministyczna kolejność (konie po hali i numerze boksu, bez boksu na końcu; flagi po `valid_from`), bez czasu serwera w treści, ETag i 304 jak w BE-033.

## Poza zakresem
- rutyna („Boks gotowy”, posiłek, padok), plan karmienia i „Dziś” z wizytami i jazdami w karcie oraz w `client-home` (BE-045);
- tablica tabletu (BE-041), widok wyświetlacza (BE-042), kafelki szybkiej flagi (dane z `GET /stables/v1/…/features`, BE-030);
- imiona klientów przy koniach i zaproszenia (aplikacja dociąga z `auth`, BE-024 `horse-clients`).

## Kryteria akceptacji
- [ ] Main Anny o 07:15: Kasztan „Bez śniadania 06:00–10:00 · Potwierdzona 06:02” i „Nie na padok od 14:30 do 16:00 · Potwierdzona 06:02”; Bella „Nie na padok · niepotwierdzona · dziś, cały dzień · ustawiona 01:20”.
- [ ] MainBrzozowa: Kometa „boks 1” bez hali, „Bez śniadania 06:00–09:00 · Obowiązuje od razu”, bez statusu.
- [ ] MainLuna: Luna bez boksu, brak aktywnych flag.
- [ ] A-06: Anna na koniu innego klienta i na wolnym boksie dostaje 404; po `valid_to` albo `revoked_at` (nowy token) koń znika.
- [ ] A-21: przy odznaczonym `flags` dla klienta sekcja flag znika z odpowiedzi (sprawdzone tokenem z innym `f`).
- [ ] A-20: po wyłączeniu potwierdzeń Bella dalej „niepotwierdzona”, a alert w `boxes-overview` zostaje.
- [ ] Ta sama treść daje ten sam ETag, zmiana flagi zmienia ETag; `If-None-Match` daje 304.

## Testy
- Jednostkowe: składanie DTO z fixture’ów (flagi z potwierdzeniem, bez potwierdzeń, zaczynające się później), kolejność, brak czasu serwera w treści.
- Integracyjne (Testcontainers PostgreSQL z seedem, `app.inject`, tokeny z `mintToken` BE-010): kryteria wyżej, izolacja (token Brzozowej na koniach Pod Lipami: 404).
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/board.json` zaktualizowany, `npm run gen:api` we `frontend/` wykonany.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- `board` tylko czyta (rola bez zapisu) i nie woła `auth` ani `operations`; dane flag bierze wprost z tabel.
- Nie dekodujemy tokenu w aplikacjach; sekcje wynikają z `m[].f` po stronie serwera.
- Autor flagi w widoku klienta: zgodnie z makietą bez autora przy potwierdzeniu; `author_role = operator` pokazujemy jako „Zespół EQUENOR”.
- Status tylko „potwierdzona HH:MM” albo „niepotwierdzona” (słownik PL/UA/EN), i tylko przy `requires_ack`.
