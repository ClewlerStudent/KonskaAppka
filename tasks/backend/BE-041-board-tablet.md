---
id: BE-041
title: "board: tablica tabletu"
area: backend
stage: 4
size: L
status: todo
depends_on: [BE-033, BE-034]
decisions: [DEC-13, DEC-03]
owner:
branch:
trello:
---
# BE-041 · board: tablica tabletu

## Cel
Tablet e-ink przy boksie co kilka sekund pyta `board` o stan swojego boksu i dostaje gotową tablicę: halę, numer i konia, flagi z godzinami (z pop-upem dla flag do potwierdzenia), tabelę karmienia z „WSTRZYMANE” i „NAMOCZYĆ” oraz ostatnie akcje. Przy braku zmian dostaje 304, więc ruch jest tani. Druga trasa daje listę boksów do „Zmień boks”.

## Kontekst
- **Stan kodu:** `board` z BE-033 (`backend/src/services/board/`, rola tylko `SELECT`, ETag z hasha treści, 304, nagłówek `Date`); flagi i ich DTO: BE-034; `client-home`/`card`: BE-038 (wspólne składanie flag warto wydzielić, np. `backend/src/services/board/compose/flags.ts`). `backend/src/lib/rules` (BE-007): skutki `suspend_meal` w oknie, etykiety godzin, `stableFeatures`. Tabele czytane: `stables`, `buildings`, `boxes`, `horses`, `horse_flags`, `flag_acknowledgements`, `flag_templates` (+`_labels`), `meal_slots` (+`_labels`), `feeding_plans`, `feeding_plan_items`, `feeds`, `stable_settings`, `users` (`display_name`).
- **Dokumenty:** docs/mikroserwisy.md 5.4 (tabela tras: `GET …/boxes/{b}` dla tabletu, klienta ze swoim koniem, obsługi i admina; `GET …/boxes` dla tabletu, obsługi i admina; język to parametr zapytania), 9.3 (tablet przy boksie); docs/development-szczegoly.md 3.3 `board` (pełna lista pól odpowiedzi tabletu i `GET …/boxes`), 3.5.2 (stany ekranu, odpytywanie), 4.1 „Składanie odpowiedzi board”; docs/erd.md pkt 2 (tablet), pkt 3 (ostatnie akcje ≤ 5), pkt 12, pkt 16.
- **Makiety:** TabletBoks.dc.html („BOKS 7 · KASZTAN”, „Hala główna · wt 13.10 · 07:15”, baner „BEZ ŚNIADANIA · POTWIERDZONA 06:02 · 06:00 – 10:00 · Wet o 8:00, koń na czczo · Anna, 03:14”, „Później: Nie na padok od 14:30 (kowal 15:00)”, tabela KARMIENIE, OSTATNIE AKCJE), TabletBoksBrzozowa.dc.html („obowiązuje od razu”, bez hali), TabletPopup.dc.html, TabletPierwszyBoks.dc.html, TabletZmianaBoksu.dc.html.
- **Decyzje:** DEC-13 A (tablet odpytuje co 5 s z jitterem; serwer musi wytrzymać takie tempo, więc 304 bez składania zbędnych danych). DEC-03 A (sekcje według `m[].f` roli `tablet`).
- **Dane demo:** tablet HG 7 (Kasztan), HG 4 (Sonata, Derka od 16:00), HN 4 (Bella, niepotwierdzona), HN 5 (Bursztyn, poidło ręczne), wolne HG 3 i HN 6; Brzozowa boks 1 (Kometa). Plany karmienia seeduje BE-043; tu testy na fabrykach danych.

## Zakres
- [ ] `GET /board/v1/stables/{stableId}/boxes/{boxId}?lang=pl|uk|en` (tablet, klient ze swoim koniem w tym boksie, obsługa, admin, `plt`):
  - `building` (`id`, nazwa, `showBuilding` gdy aktywnych hal > 1), `box` (`id`, `label`, `autoWaterer`), `horse` (`id`, nazwa) albo `null` i stan `free`;
  - `flags.banner` (obowiązujące teraz) i `flags.later` (dziś później, „od 14:30”), każda z etykietą w języku tabletu, `hoursLabel`, wariantem, notatką, autorem według `stable_settings.author_display` (`role | initial | name`; przy `author_role = operator` „Zespół EQUENOR”), godziną utworzenia, `requiresAck`, statusem i znacznikiem `popup` (tylko `requires_ack` bez potwierdzenia i bez odwołania);
  - `feeding` (gdy funkcja `feeding_plan`): wiersze pasz × pory z `meal_slots` (etykiety z `*_labels` z polskim zapasem), ilości („bez ogr.” przy pustej ilości), `soak` i `soakNote` tylko przy `soak_enabled`, pory wstrzymane przez flagi w oknie (`WSTRZYMANE`) z `lib/rules`;
  - `config`: wynik `stableFeatures` dla roli (przyciski szybkich akcji, tryb potwierdzeń);
  - `recentActions` (≤ 5, boks i koń): na tym etapie zdarzenia flag (nowa, potwierdzona, odwołana) z autorem albo bez (tablet); rutynę dokłada BE-045;
  - stan `suspended` przy `stables.status = suspended`: bez flag i karmienia, z komunikatem (pełne przejście ze `billing`: BE-054).
- [ ] `GET /board/v1/stables/{stableId}/boxes` (tablet, obsługa, admin): aktywne hale według `sort_order`, w każdej boksy z `id`, numerem, koniem albo „wolny”, sortowanie naturalne numerów (2 przed 10).
- [ ] Dostęp: boks musi należeć do stajni ze ścieżki (inaczej 404); tablet widzi każdy boks swojej stajni; klient tylko boks, w którym stoi jego koń z `m[].h` (wolny boks i cudzy: 404).
- [ ] Odpowiedź bez danych zalogowanego konta (tablica nie pokazuje, kto jest zalogowany) i bez opisów wizyt.
- [ ] ETag z kanonicznej treści (z językiem), `If-None-Match` → 304 bez treści, czas serwera tylko w `Date`; zmiana ustawień stajni albo macierzy (`m[].f`) zmienia treść i ETag.
- [ ] Wydajność: stała liczba zapytań SQL na odpytanie (bez N+1), pomiar w teście.

## Poza zakresem
- „SZYBKIE AKCJE”, znacznik „Poidło ręczne · woda HH:MM” z godziną, rutyna w ostatnich akcjach (BE-045); zapis potwierdzeń (BE-034) i akcji (BE-044);
- widok wyświetlacza (BE-042); ekrany tabletu (TAB-010…TAB-014).

## Kryteria akceptacji
- [ ] A-01 o 07:15 (tablet HG 7): baner „BEZ ŚNIADANIA · 06:00–10:00 · POTWIERDZONA 06:02”, „Później: Nie na padok od 14:30”, karmienie rano wstrzymane (owies, siano, suplement X), wysłodki wieczorem „NAMOCZYĆ 2 l”.
- [ ] A-01 przed 06:02 (zegar 06:01): dwa znaczniki `popup`, krytyczny pierwszy.
- [ ] A-03: odwołana flaga znika z banera i z `popup`, wstrzymany posiłek wraca, ETag się zmienia.
- [ ] A-10: boks 4 Hali głównej i boks 4 Hali nowej dają różne konie i flagi; lista `GET …/boxes` ma oba z halami.
- [ ] A-17 i A-18: tablet Brzozowej boks 1 bez hali, flaga „obowiązuje od razu” bez `popup`, karmienie bez „NAMOCZYĆ”; przed 06:00 flaga jest w `later`.
- [ ] Tablet z tokenem innej stajni na boksie Pod Lipami: 404; sekcja karmienia znika przy `f` bez `feeding_plan`.
- [ ] Dwa zapytania z tą samą treścią dają ten sam ETag także z dwóch instancji serwisu.

## Testy
- Jednostkowe: składanie odpowiedzi z fixture’ów (deterministyczna kolejność, brak czasu w treści, brak pola wody przy `autoWaterer = true`, ≤ 5 ostatnich akcji).
- Integracyjne (Testcontainers PostgreSQL z seedem, zegar 07:15 i 06:01): kryteria wyżej, 304, liczba zapytań SQL.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/board.json` zaktualizowany, `npm run gen:api` we `frontend/`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Boks tylko po `boxes.id`; numer nie jest unikalny ani w stajni, ani w hali.
- Język tablicy to parametr zapytania tabletu; serwer go nie zapisuje.
- Treść zależy od upływu czasu, więc składamy ją przy każdym zapytaniu; bez cache stanu w pamięci (wolno trzymać tylko niezmienne `stables.business_id`, `boxes.stable_id`).
- Status flagi tylko przy `requires_ack`; w stajni bez potwierdzeń flaga od razu w banerze, bez plakietki.
