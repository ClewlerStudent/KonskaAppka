---
id: BE-032
title: "stables: konie (przypisanie, przeniesienie, zamiana, wyjazd)"
area: backend
stage: 2
size: L
status: todo
depends_on: [BE-025, BE-031]
decisions: []
owner:
branch:
trello:
---
# BE-032 · stables: konie (przypisanie, przeniesienie, zamiana, wyjazd)

## Cel
Admin dodaje konia (także bez boksu, jak Luna), przypisuje go do boksu, przenosi, zamienia dwa konie miejscami i zapisuje wyjazd. Historia boksów zawsze się zgadza, dwa równoległe przypisania do jednego boksu dają jedno 409, a po wyjeździe klienci tracą dostęp do konia od razu.

## Kontekst
- Stan kodu: serwis `stables` (BE-029, BE-031), klient `/internal` (`backend/src/lib/internal-client`, BE-029), trasa `auth` `POST /auth/v1/internal/horses/{id}/left` na porcie `horses` (BE-025), zdarzenie `horse.left` w katalogu (BE-008). Tabele `horses` (`box_id` unikalny z NULL, `status`, `left_at`, `photo_file_id`), `horse_box_history` (częściowe unikalne otwarte wpisy na konia i na boks, `reason`, `moved_by`) z BE-004.
- Dokumenty: `docs/mikroserwisy.md` 5.3 (`POST …/horses`, `PATCH …/horses/{id}`, `POST …/horses/{id}/box`, `POST …/horses/swap`, `POST …/horses/{id}/leave`; po COMMIT wyjazdu synchronicznie `auth /internal/horses/{id}/left` do 3 prób, potem `horse.left`), 3.6 (koń `left` daje 404 od razu), 3.8; `docs/erd.md` pkt 1 (0..1 : 0..1, zamiana w jednej transakcji: A bez boksu, B do boksu A, A do boksu B; historia: jeden otwarty wpis na konia i na boks); `docs/development-szczegoly.md` 3.3 stables „Konie” (przypisanie i przeniesienie po `boxId`) i „Testy” (równoległe przypisanie, zamiana przy współbieżnych zapisach).
- Makiety: `PanelBoksy.dc.html` („Konie bez boksu”: Luna, „Klient: Marek Nowak · zaproszenie czeka”, „Wolny boks dla Luny: Boks 3 · Hala główna, Boks 6 · Hala nowa”, „Przypisz boks”), `BoksSzczegoly.dc.html` („Ostatni koń Wicher · do 01.10, przeniesiony: Hala główna · boks 5”), plan PanelDodajKonia i PanelPrzeniesKonia (`docs/makiety-plan.md` B).
- Scenariusze: A-04 (Luna do Hala nowa · boks 6 po `boxId`, otwarty wpis historii), A-05 (wolne boksy, historia Wichra).
- Dane demo: 13 koni Pod Lipami (Hala główna: Iskra 1, Dukat 2, Sonata 4, Wicher 5, Fala 6, Kasztan 7, Hetman 8; Hala nowa: Grom 1, Mgła 2, Rumba 3, Bella 4, Bursztyn 5) i Luna bez boksu; Brzozowa: Kometa 1, Dąb 2, Iga 3, Lord 4, Nuta 6.

## Zakres
- [ ] `POST /stables/v1/stables/{stableId}/horses` (`{ name, breed?, birthDate?, boxId? }`, admin), `GET …/horses/{horseId}` (admin, obsługa; z `version`; propozycja do edycji), `PATCH …/horses/{horseId}` (`{ name?, breed?, birthDate? }`, `If-Match`).
- [ ] `POST …/horses/{horseId}/box` (`{ boxId }`): przypisanie albo przeniesienie; zamyka otwarty wpis historii (`to_at`) i otwiera nowy (`reason`: `arrival` albo `move`, `moved_by`); boks zajęty → 409 `box_occupied` (także przy wyścigu: błąd unikalnego indeksu `horses.box_id` mapowany na 409); boks albo koń innej stajni → 404; koń `left` → 409.
- [ ] `POST …/horses/swap` (`{ horseIdA, horseIdB }`): jedna transakcja według erd.md pkt 1, wpisy `reason = swap`; blokada wierszy obu koni (`SELECT … FOR UPDATE` w stałej kolejności id), żeby współbieżne zapisy nie zakleszczyły się.
- [ ] `POST …/horses/{horseId}/leave` (`{ leftAt? }`): `status = left`, `left_at`, zwolnienie boksu, zamknięcie historii (`reason = left`), audyt; po COMMIT wywołanie `auth` `/internal/horses/{id}/left` (3 próby, błąd logowany jako `alert`, nie cofa wyjazdu), potem `horse.left` (`stableId`, `horseId`).
- [ ] Zapisy tylko admin; obsługa 403; kody `box_occupied` do `ERRORS`.
- [ ] Moduł seedu `horses`: konie, historia boksów (w tym Wicher w Hala nowa · boks 6 do 01.10, potem Hala główna · boks 5), `horse_access` klientów (Anna: Kasztan, Bella, Kometa; Karolina W.: Iskra; Tomasz L.: Grom; Ewa K.: Sonata) i zaproszenie Marka Nowaka (SMS, klient do Luny, ważne do 15.10).

## Poza zakresem
- Zdjęcie konia (`POST …/horses/{id}/photo` przez `files`, BE-051); konsumenci `horse.left` (BE-046, BE-048); widoki koni w `board` (BE-033); ekrany (WEB-013, MOB-010); zużycie w billingu (BE-053).

## Kryteria akceptacji
- [ ] A-04: Luna przypisana do Hala nowa · boks 6 po `boxId`; powstaje otwarty wpis historii; Hala główna · boks 6 (Fala) bez zmian.
- [ ] Dwa równoległe przypisania różnych koni do jednego boksu: jedno 200, jedno 409 `box_occupied`; stan historii spójny.
- [ ] Zamiana Iskry i Dukata: każdy w boksie drugiego, po jednym otwartym wpisie na konia i boks; równoległa zamiana i przeniesienie nie łamią unikalności.
- [ ] Wyjazd Kasztana: `status = left`, boks 7 wolny, dostęp Anny zamknięty (przez `auth`), `horse.left` opublikowane; przy wyłączonym `auth` wyjazd i tak się zapisuje, a log ma `alert`.

## Testy
- `backend/src/services/stables/horses.test.ts` na harnessie z seedem: scenariusze wyżej, równoległość (dwie transakcje), serwer testowy `auth /internal`, adapter wiadomości w pamięci. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Przypisanie i przeniesienie przyjmują wyłącznie `boxId`, nigdy numer boksu.
- Zgubione skutki wyjazdu (flagi, plany, zadania, jazdy, dostęp) domyka cron `horse-left-reconciler` (BE-046); tu tylko synchroniczne `auth` i zdarzenie.
- `GET …/horses/{horseId}` to propozycja spoza tabeli 5.3 (edycja wymaga `version`).
