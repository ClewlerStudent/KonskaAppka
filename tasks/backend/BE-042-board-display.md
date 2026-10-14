---
id: BE-042
title: "board: widok wyświetlacza"
area: backend
stage: 5
size: M
status: todo
depends_on: [BE-041]
decisions: [DEC-14, DEC-03]
owner:
branch:
trello:
---
# BE-042 · board: widok wyświetlacza

## Cel
Telewizor w korytarzu stajni (konto techniczne z rolą `display`) pokazuje wszystkie hale albo jedną halę na pełnym ekranie: pasek pilnych flag, kafle boksów z flagami i godzinami, skrót pozostałych hal i plan dnia „Dziś w stajni”. Odpowiedź nie ma danych osobowych, bo ekran wisi publicznie.

## Kontekst
- **Stan kodu:** `board` z BE-033 i składanie flag z BE-038/BE-041 (`backend/src/services/board/compose/`). Plan dnia czyta `meal_slots`, `paddock_plans` (+`paddocks`), `health_events` (tylko typ, termin, koń, boks) i `rides` (termin, koń, ujeżdżalnia) wprost z tabel; dane zdrowia i jazd seedują BE-047 i BE-048, tu testy na fabrykach danych.
- **Dokumenty:** docs/mikroserwisy.md 5.4 (`GET …/display?buildingId=` dla wyświetlacza i admina; plan dnia należy do funkcji `routine`), 9.4 (telewizor), 10.2 pkt 7; docs/development-szczegoly.md 3.3 `board` „`GET …/display`”, 3.5.4 (WyswietlaczCentralny, WyswietlaczHala, BezAkcji, jedna hala), 4.1 „widok wyświetlacza”, 4.2 „Wyświetlacz bez danych osobowych” (dane-kanarki); docs/erd.md pkt 4.
- **Makiety:** WyswietlaczCentralny.dc.html („Teraz: po śniadaniu · Następny posiłek: obiad 12:00”, pasek „NIEPOTWIERDZONA Hala nowa · boks 4 · Bella · Nie na padok · dziś, cały dzień · ustawiona 01:20 · admin powiadomiony”, nagłówki hal „boksy 1–8 · 7 koni · 1 wolny · 1 krytyczna”, „Dziś w stajni”: 08:00 Weterynarz Kasztan · główna 7, 15:00 Kowal, 16:00 Jazda Iskra · kryta ujeżdżalnia), WyswietlaczHala.dc.html, WyswietlaczHalaBezAkcji.dc.html.
- **Decyzje:** DEC-14 A (wizyty i jazdy w „Dziś w stajni” jako część funkcji `routine`). DEC-03 A (sekcje według `m[].f` roli `display`: w Pod Lipami `flags`, `feeding_plan`, `routine`, `tasks`).
- **Dane demo:** „Telewizor korytarz” (Pod Lipami). Hala główna 7 koni, wolny boks 3, flaga krytyczna Kasztana; Hala nowa 5 koni, wolny boks 6, niepotwierdzona Bella. Stajnia Brzozowa nie ma wyświetlacza (testy jednej hali na fixture z kontem `display`).

## Zakres
- [ ] `GET /board/v1/stables/{stableId}/display?buildingId=&lang=` (rola `display`, admin, `plt`):
  - nagłówek: „Teraz” (po którym posiłku), następny posiłek z godziną (z `meal_slots` w strefie stajni);
  - `urgent`: flagi z `requires_ack` bez potwierdzenia po `warn_at` (z informacją o `admin_notify`) i flagi krytyczne niepotwierdzone; przy `buildingId` tylko flagi tej hali;
  - sekcje hal (wszystkie aktywne albo jedna): zakres numerów, liczba koni, wolnych, krytycznych, niepotwierdzonych; kafle boksów z numerem i halą, koniem, flagami z `hoursLabel` i statusem (tylko `requires_ack`), stanem „wolny”, znacznikiem „Poidło ręczne” przy `autoWaterer = false`;
  - `otherBuildings` przy `buildingId`: tylko liczby (konie, flagi, niepotwierdzone), bez treści flag;
  - `today` („Dziś w stajni”, funkcja `routine`): posiłki z godzinami i liczbą koni, wyjście na padoki z liczbą koni i pominiętymi (tylko przy `paddock_out_enabled`), wizyty (typ, godzina, koń, boks) i jazdy (godzina, koń, ujeżdżalnia), bez opisów i bez osób.
- [ ] Sekcje według `m[].f` i `stableFeatures`; przy wyłączonych opcjach bez ich stanu (np. bez padoków przy `paddock_out_enabled = false`).
- [ ] DTO bez danych osobowych: bez imion i nazwisk osób, telefonów, e-maili, autorów flag i jeźdźców; tylko konie, boksy, hale, godziny.
- [ ] Jedna hala: odpowiedź oznacza `singleBuilding`, a kafle bez nazwy hali.
- [ ] Kontrola dostępu: tylko odczyt; `buildingId` innej stajni albo nieaktywnej hali: 404.
- [ ] ETag i 304 jak w BE-041; nowa hala albo zmiana flagi zmienia ETag (TV odpytuje co 10 s).

## Poza zakresem
- „Boks gotowy HH:MM”, godzina wody, rutyna w nagłówkach hal, „Ostatnie akcje” i „podane” w planie dnia (BE-045);
- zadania na TV (aplikacja pobiera `GET /operations/v1/…/tasks`, BE-050; WEB-023);
- koń bez boksu na TV (docs/development-szczegoly.md 5 pkt 16, nierozstrzygnięte: na razie pomijamy);
- ekran w panelu (WEB-016…WEB-018), stan „zawieszona” (BE-054).

## Kryteria akceptacji
- [ ] A-08: liczniki hal jak na makiecie; każdy kafel ma halę przy numerze; tylko kafel Hala nowa · boks 5 ma znacznik poidła ręcznego.
- [ ] A-02: Bella w `urgent` w widoku wszystkich hal i na pełnym ekranie Hali nowej; na pełnym ekranie Hali głównej jej nie ma, a Hala nowa jest tylko liczbą w `otherBuildings`.
- [ ] A-24: skan odpowiedzi z danymi-kanarkami (unikalne nazwiska, telefony, e-maile w seedzie testu) nie znajduje kanarka ani wzorca E.164 czy e-maila.
- [ ] A-20: po wyłączeniu potwierdzeń Bella dalej „niepotwierdzona”; flaga zapisana bez potwierdzeń nie ma statusu.
- [ ] DEC-14: TV z `f` bez `health` i `rides` ma w `today` wizyty i jazdy (bez opisów), a bez `routine` nie ma `today`.
- [ ] A-11: nowa hala pojawia się w odpowiedzi przy następnym zapytaniu (nowy ETag).
- [ ] Każdy zapis kontem `display` w innych serwisach daje 403 (sprawdzane w BE-034/BE-044; tu test, że `display` ma tylko `GET`).

## Testy
- Jednostkowe: składanie sekcji z fixture’ów, filtr hali, skrót liczbowy, `today` z wyłączonym padokiem.
- Integracyjne (Testcontainers PostgreSQL z seedem, zegar 07:15): kryteria wyżej, skaner PII jako wspólny helper testowy (użyje go też WEB-018).
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/board.json` zaktualizowany, `npm run gen:api` we `frontend/`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Wybór widoku (wszystkie hale albo jedna) zna tylko przeglądarka TV; serwer dostaje `buildingId` w zapytaniu i niczego nie zapisuje.
- Bez danych osobowych także w etykietach (np. „Jazda Iskra”, nie „Jazda Karoliny W.”).
- Plan dnia liczony w strefie stajni przez `lib/rules`; noc zmiany czasu w testach.
