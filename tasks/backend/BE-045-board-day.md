---
id: BE-045
title: "board: lista dnia, historia, widoki admina z rutyną"
area: backend
stage: 6
size: L
status: todo
depends_on: [BE-041, BE-043, BE-044, BE-038, BE-042]
decisions: [DEC-14, DEC-18]
owner:
branch:
trello:
---
# BE-045 · board: lista dnia, historia, widoki admina z rutyną

## Cel
Obsługa rano otwiera ListaDnia: szybkie akcje per hala, flagi do potwierdzenia, flagi dziś i skrót zadań. Admin ma „Dziś” z pilnymi sprawami, klient widzi w MojBoks „Ostatnio” i „Historię”, a tablet, TV i karta konia pokazują stan rutyny („Boks gotowy dziś 07:10”, „ŚNIADANIE · podane 06:40 · potem obiad 12:00”, „PADOK · B 10:00–14:30”, „Poidło ręczne · woda 06:55”). Wyłączone przyciski znikają wszędzie razem ze stanem.

## Kontekst
- **Stan kodu:** `board` z BE-033, flagi w widokach (BE-038), tablica tabletu (BE-041), widok TV (BE-042), plany (BE-043), zapis rutyny (BE-044). Tabele czytane dodatkowo: `box_care_events`, `building_routines`, `horse_box_history`, `paddock_plans`, `paddock_plan_companions`, `health_events`, `rides`, `arenas`, `tasks`, `users.display_name`. `backend/src/lib/rules`: pominięci, padok po skutkach flag, etykieta pory i następna pora.
- **Dokumenty:** docs/mikroserwisy.md 5.4 (trasy `…/day`, `…/admin-today`, `…/boxes/{b}/history` „od dnia przypisania konia”, `…/boxes/{b}/details`; dane o ludziach i zaproszenia aplikacja dociąga z `auth`); docs/development-szczegoly.md 3.3 `board` („SZYBKIE AKCJE”, kafel TV, lista dnia, „Konfiguracja i widoczność są częścią treści”), 4.1 „Składanie odpowiedzi board z ustawieniami”; docs/erd.md pkt 3 (historia boksu, ≤ 5 ostatnich akcji), pkt 16 (wyłączona opcja znika ze stanem; „Historia” zostaje, „Ostatnio” i „OSTATNIE AKCJE” pomijają zdarzenia wyłączonych przycisków).
- **Makiety:** ListaDnia.dc.html, ListaDniaBrzozowa.dc.html, ListaDniaBezAkcji.dc.html, AdminDzis.dc.html („Pilne 1 flaga”, „Flagi dziś 4 z 5 potwierdzone”, „Wizyty i jazdy 08:00 Wet · Kasztan, 15:00 Kowal, 16:00 Jazda · Iskra”, „Do załatwienia: Luna bez boksu · 2 wolne boksy”), MojBoks.dc.html, MojBoksBezAkcji.dc.html, BoksSzczegoly.dc.html („Ostatni koń Wicher · do 01.10 przeniesiony: Hala główna · boks 5”), KartaKonia.dc.html, KartaKoniaBezAkcji.dc.html, TabletBoks.dc.html, TabletBoksBezAkcji.dc.html, WyswietlaczCentralny.dc.html, WyswietlaczHalaBezAkcji.dc.html, Main.dc.html, MainBezAkcji.dc.html.
- **Decyzje:** DEC-14 A (wizyty i jazdy w planie dnia TV w funkcji `routine`); DEC-18 A („Cofnij” 1 h: lista dnia pokazuje „Cofnij” tylko w tym oknie).
- **Dane demo:** stan o 07:15 z seedu (BE-044, BE-043, BE-034); wariant BezAkcji; Stajnia Brzozowa (jedna hala, bez padoku i potwierdzeń). Wizyty i jazdy seedują BE-047/BE-048, tu testy na fabrykach danych.

## Zakres
- [ ] `GET …/day` (obsługa, admin): szybkie akcje per hala (tylko włączone; posiłek bieżący albo następny z „podane HH:MM · autor” i pominiętymi, „Cofnij” w oknie 1 h; padok z godziną, liczbą koni per hala i pominiętymi; „Boks gotowy X z Y” razem i per hala, a do siatki ListaDniaGotoweBoksy lista boksów per hala: `boxId`, etykieta, koń, ostatnie `tidy` dziś z godziną i autorem albo brak; MOB-016), „Wymaga potwierdzenia” (flagi `requires_ack` bez potwierdzenia, także sprzed wyłączenia potwierdzeń), „Flagi dziś”, skrót zadań (gdy `m[].f` ma `tasks`: do wzięcia, w toku), boksy z poidłem ręcznym i godziną wody.
- [ ] `GET …/boxes/{b}/history?before=` (klient od `horse_box_history.from_at` swojego konia w tym boksie, obsługa, admin; funkcja `box_history`): flagi (nowa, potwierdzona, odwołana) i zdarzenia przycisków boksu i jego hali, z osobą (`display_name`) albo bez (tablet), pogrupowane po dniach, stronicowane; wpisy wyłączonych przycisków zostają.
- [ ] `GET …/boxes/{b}/details` (obsługa, admin): boks, hala z adresem, `autoWaterer`, ostatnie zdarzenie, obecny koń albo ostatni koń z `horse_box_history` (do kiedy, dokąd przeniesiony), skrót historii.
- [ ] `GET …/admin-today` (admin): pilne (niepotwierdzone flagi, eskalacje), szybkie akcje jak w `…/day`, flagi dziś z licznikiem „4 z 5 potwierdzone”, wizyty i jazdy dziś (typ, godzina, koń), skrót zadań, „Do załatwienia”: konie bez boksu i liczba wolnych boksów (zaproszenia aplikacja bierze z `auth`).
- [ ] Rozszerzenia istniejących widoków:
  - tablet (BE-041): `quickActions` (tylko włączone): „BOKS GOTOWY” z najnowszym niecofniętym wpisem boksu, posiłek hali z etykietą pory z `meal_slots`, stanem i następną porą (przełączenie na następną porę 30 min przed jej godziną, propozycja), „PADOK” z planem po skutkach flag i towarzyszami („B 10:00–14:30 z Falą i Rumbą”) oraz stanem hali; „WODA” i „Poidło ręczne · woda HH:MM” przy `autoWaterer = false`; `recentActions` łączy flagi i przyciski (≤ 5, bez zdarzeń wyłączonych przycisków);
  - TV (BE-042): na kaflu „Boks gotowy HH:MM”, padok z godzinami, godzina wody; w nagłówku hali rutyna („✓ Śniadanie 06:40 · Padok 10:00”); „Ostatnie akcje”; w „Dziś w stajni” „podane HH:MM”;
  - `client-home` i `card` (BE-038): skrót „Ostatnio” z przycisków, w karcie plan karmienia (funkcja `feeding_plan`, „namoczyć” tylko przy `soak_enabled`), „Dziś” z padokiem skróconym flagą oraz wizytami i jazdami według `health` i `rides` (wpis `owner_private` tylko dla klienta z koniem i admina).
- [ ] Wszystko według `stableFeatures` i `m[].f`: przy wyłączonym przycisku brak przycisku i jego stanu, przy wyłączonym padoku brak planu padoku wszędzie (flaga „Nie na padok” zostaje); zmiana ustawień zmienia ETag.

## Poza zakresem
- zapis akcji (BE-044), zadania i ich trasy (BE-050), API zdrowia i jazd (BE-047, BE-048); ekrany apki, tabletu i panelu (MOB-016…MOB-020, TAB-018, WEB-020, WEB-021).

## Kryteria akceptacji
- [ ] `…/day` Oli zawiera stan każdego z 14 boksów Pod Lipami (7 „gotowy” z godziną i autorem, 7 bez wpisu dziś), zgodny z licznikami.
- [ ] A-13: `…/day` Oli o 07:15 jak na makiecie ListaDnia (śniadanie ✓ 06:40 HG z pominiętym Kasztanem, ✓ 06:50 HN; padok 10:00: Główna 4, Nowa 3 z pominiętą Bellą; „Boks gotowy” 7 z 14, Główna 4 z 8, Nowa 3 z 6).
- [ ] A-17: ListaDniaBrzozowa (śniadanie ✓ 06:35 · Paweł z pominiętą Kometą, „Boks gotowy” 3 z 6, bez padoku, bez „Wymaga potwierdzenia”, bez zadań, bez hali).
- [ ] A-01 i A-18: `recentActions` tabletu HG 7 i Brzozowa boks 1 to dokładnie 5 wpisów z makiet TabletBoks i TabletBoksBrzozowa.
- [ ] A-06: historia boksu HG 7 dla Anny zaczyna się od przypisania Kasztana; po przeniesieniu konia stary boks daje 404.
- [ ] A-05: szczegóły HN 6: ostatni koń Wicher do 01.10, przeniesiony do HG 5; „Boks gotowy 09.10 14:40 · Piotr”.
- [ ] A-16: tylko HN 5 ma „Poidło ręczne · woda 06:55” na tablecie, w `boxes-overview`, na TV i w szczegółach.
- [ ] A-19: wariant BezAkcji: brak szybkich akcji i ich stanu na tablecie, w liście dnia, TV, MojBoks („Ostatnio” znika) i karcie (bez padoku); „Historia” zachowuje stare wpisy; „Woda” przy HN 5 zostaje.

## Testy
- Jednostkowe: składanie każdego widoku z fixture’ów (Pod Lipami, Brzozowa, BezAkcji), deterministyczny ETag, brak czasu serwera w treści.
- Integracyjne (Testcontainers PostgreSQL z seedem, zegar 07:15): kryteria wyżej, porównanie z tekstami makiet.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/board.json` zaktualizowany, `npm run gen:api` we `frontend/`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- `board` nie czyta tabel uprawnień ani zaproszeń (`invitations` to tabela prywatna `auth`); imiona klientów i zaproszenia aplikacja pobiera z `auth`.
- Zmiana zależności względem pierwotnej listy: dodane BE-038 i BE-042, bo to zadanie rozszerza `client-home`, `card` i widok TV.
- Tablet nigdy nie dostaje zadań ani pełnej historii; TV bez danych osobowych (autorów w „Ostatnich akcjach” nie pokazujemy).
