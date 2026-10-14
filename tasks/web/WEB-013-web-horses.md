---
id: WEB-013
title: Konie w panelu
area: web
stage: 2
size: M
status: todo
depends_on: [BE-024, BE-032, WEB-011, WEB-006]
decisions: [DEC-27, DEC-32]
owner:
branch:
trello: https://trello.com/c/ivRWu2mQ
---
# WEB-013 · Konie w panelu

## Cel
Admin dodaje konia (z boksem albo bez, z zaproszeniem klienta albo dostępem dla istniejącego klienta), przypisuje, przenosi i zamienia konie między boksami oraz zgłasza wyjazd konia ze stajni. Lista „Konie” pokazuje wszystkie konie z boksem, klientem i stanem.

## Kontekst
- **Stan kodu:** PanelBoksy (WEB-011: akcje „Przypisz konia”, „Przenieś”, sekcja „Konie bez boksu”), `InviteForm` i `HorsePicker` (WEB-006), `SidePanel`, `ConfirmDialog`, `DataTable` (WEB-004); zaślepka `/stables/$stableId/horses`.
- **Dokumenty:** docs/mikroserwisy.md 5.3, 3.8 (wyjazd konia: dostęp klienta zamknięty od razu). BE-032: `POST /stables/v1/stables/{stableId}/horses` (`{ name, breed?, birthDate?, boxId? }`), `GET`/`PATCH …/horses/{horseId}` (`If-Match`), `POST …/horses/{horseId}/box` (`{ boxId }`, `409 box_occupied` także przy wyścigu), `POST …/horses/swap` (`{ horseIdA, horseIdB }`), `POST …/horses/{horseId}/leave` (`{ leftAt? }`). BE-024: `POST /auth/v1/stables/{stableId}/horses/{horseId}/access` (`{ userId, validFrom?, validTo? }`), `GET …/horse-clients`. BE-033: `GET /board/v1/stables/{stableId}/horses-overview`. docs/development-szczegoly.md A-04, A-05, 4.1 (formularze wysyłają `boxId`).
- **Makiety:** makiety-plan.md B „PanelDodajKonia” (dialog: „Imię” Luna; rasa, data urodzenia, zdjęcie opcjonalne; „Boks”: „Bez boksu na razie” albo „Wolny boks” z halą; „Klient”: „Zaproś klienta teraz” (SMS, numer, „Imię” Marek Nowak, „Ważne do”), „Później”, „Koń bez klienta”; „Anuluj”, „Dodaj konia i wyślij zaproszenie”; stany: zapisano, 409 „Boks zajął inny koń, wybierz inny”), „PanelPrzeniesKonia” („Przenieś konia · Wicher”: wolne boksy z halą, „Zamień z…”, „Wyjazd ze stajni” ze skutkami; stany: 409, „Przypisz konia” do wolnego boksu, „Przypisz boks” Luny do „Hala nowa · boks 6”), „PanelKonie” (H1 „Konie · 13 koni · 1 bez boksu”, filtr hali, chipy „Wszystkie · Z flagą · Bez boksu · Odeszły”, kolumny Koń, Boks z halą, Klient, Aktywne flagi, Plan karmienia, Najbliższa wizyta, Akcje).
- **Decyzje:** brak.
- **Dane demo:** Luna (bez boksu, klient Marek Nowak, zaproszenie czeka), Wicher (Hala główna · boks 5), wolne Hala główna · boks 3 i Hala nowa · boks 6, Anna jako istniejąca klientka (Kometa w Brzozowej).

## Zakres
- [ ] `web/src/features/horses/AddHorsePanel.tsx` (z PanelBoksy „Dodaj konia”, PanelKonie i PanelPulpitStart `?add=horse`): imię, rasa, data urodzenia, boks („Bez boksu na razie” | wolny boks z halą), klient: „Zaproś klienta teraz” (`InviteForm` z presetem `client` + `horseId` po zapisie konia), „Istniejący klient” (lista klientów stajni z `GET …/members?role=client` → `POST …/horses/{id}/access`), „Później”, „Koń bez klienta”. Kolejność: koń, potem zaproszenie albo dostęp; gdy drugi krok zawiedzie, koń zostaje, a panel pokazuje „Koń dodany, zaproszenie nie wysłane. Wyślij ponownie.” (bez drugiego konia).
- [ ] `MoveHorsePanel.tsx` („Przenieś”, „Przypisz konia”, „Przypisz boks”): wolne boksy z halą → `POST …/box`; „Zamień z…” (zajęte boksy z koniem) → `POST …/horses/swap`; „Wyjazd ze stajni” → `ConfirmDialog` ze skutkami („Zamknie flagi, plany, dostępy klientów i jazdy. Koń zostanie w historii.”) → `POST …/leave`. `409 box_occupied` → „Boks zajął inny koń, wybierz inny” i odświeżenie listy wolnych.
- [ ] W PanelBoksy: inline „Wybierz boks” + „Przypisz boks” w sekcji „Konie bez boksu”, akcje „Przypisz konia” (lista koni bez boksu) i „Przenieś” w wierszach.
- [ ] `web/src/features/horses/HorsesScreen.tsx` na `/stables/$stableId/horses` (PanelKonie): dane z `horses-overview` + `horse-clients` + zaproszenia; kolumny Koń, Boks z halą, Klient, Akcje („Przenieś”); filtr hali, chipy „Wszystkie”, „Bez boksu”, wyszukiwarka; pusta stajnia: „Dodaj pierwszego konia”. Kolumny „Aktywne flagi”, „Plan karmienia”, „Najbliższa wizyta” i chip „Z flagą” dodają zadania tych danych (WEB-015 i późniejsze); „Karta” i „Flaga” bez akcji (brak planszy panelu).
- [ ] Po zapisach unieważnienie `boxes-overview`, `horses-overview` i `horse-clients`.

## Poza zakresem
- Zdjęcie konia (po PoC według DEC-32: na PoC bez tras i pola w dialogu); chip „Odeszły” (brak trasy listy koni `left`; pusty w seedzie); karta konia i flaga z panelu (P3).

## Kryteria akceptacji
- [ ] A-04: Luna dodana „Bez boksu na razie” z zaproszeniem Marka Nowaka SMS-em, „Ważne do” czw 15.10; w PanelBoksy „Konie bez boksu: Luna · Klient: Marek Nowak · zaproszenie czeka”; „Przypisz boks” do „Hala nowa · boks 6” wysyła `boxId` tego boksu.
- [ ] Dwa równoległe przypisania do tego samego boksu: jedno przechodzi, drugie pokazuje „Boks zajął inny koń, wybierz inny”.
- [ ] Zamiana Wichra z koniem z innej hali i wyjazd konia aktualizują PanelBoksy bez przeładowania.
- [ ] „Istniejący klient” dla Anny tworzy dostęp bez zaproszenia.
- [ ] 1440 i 390 px bez poziomego przewijania.

## Testy
- Vitest: sekwencja koń → zaproszenie (błąd drugiego kroku), budowa body, obsługa 409.
- Playwright na atrapie: A-04, wyścig 409 (atrapa zwraca 409 przy drugim żądaniu), PanelKonie z filtrem „Bez boksu”.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-032; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Wybór boksu wysyła `boxId`; etykiety z `boxLabel` (hala przy numerze przy kilku halach).
- Zmiana zależności względem listy: dodane WEB-006 („Zaproś klienta teraz” używa `InviteForm`).
