---
id: WEB-020
title: PanelPulpit
area: web
stage: 6
size: M
status: todo
depends_on: [BE-045, WEB-015, WEB-010]
decisions: []
owner:
branch:
trello: https://trello.com/c/XRHQKWty
---
# WEB-020 · PanelPulpit

## Cel
Ekran startowy admina w panelu odpowiada na pytanie „co dziś w stajni i co wymaga mojej uwagi”: pilne niepotwierdzone flagi (z informacją, że dostał SMS i e-mail), rutyna hal, flagi dziś, wizyty i jazdy, zadania i sprawy do załatwienia (koń bez boksu, zaproszenia).

## Kontekst
- **Stan kodu:** trasa `/stables/$stableId` z PanelPulpitStart i przekierowaniem po ukończeniu „Pierwszych kroków” (WEB-010); `FlagPill`, alert i stan wysyłek (WEB-015); `StatCard`, `formatInStableTz` (WEB-004); zaproszenia (WEB-006).
- **Dokumenty:** docs/mikroserwisy.md 5.4 (`GET …/admin-today`: AdminDzis i część PanelPulpit; dane o ludziach aplikacja bierze z `auth`). BE-045: `GET /board/v1/stables/{stableId}/admin-today` (pilne: niepotwierdzone flagi i eskalacje; szybkie akcje per hala jak `…/day`; flagi dziś z licznikiem; wizyty i jazdy dziś; skrót zadań; „Do załatwienia”: konie bez boksu i liczba wolnych boksów). BE-036: `…/deliveries?flagId=`. BE-022: zaproszenia. docs/development-szczegoly.md A-02, A-13, A-14, A-19.
- **Makiety:** mockups/project/PanelPulpit.dc.html: H1 „Pulpit · Stajnia Pod Lipami”, „stan na wt 13.10.2026, 07:15”; alert „Bella · Hala nowa · boks 4 · Nie na padok · dziś, cały dzień · Niepotwierdzona od 01:20 · wysłano Ci SMS i e-mail · Zobacz flagę”; kafle „Hale 2 | Boksy 14 · 2 wolne | Konie 13 · 12 w boksach | Konie bez boksu 1 · Luna”; „Dziś w halach · następny posiłek: obiad 12:00”: „Hala główna · boksy 1–8 · 7 koni · Podano śniadanie 06:40 · Ola · pominięty Kasztan (Główna 7): flaga „Bez śniadania” · Wyprowadzono na padok · następne 10:00 · 4 konie · Gotowe boksy 4 z 8”, „Hala nowa … · Poidło ręczne · boks 5 · Bursztyn · woda 06:55”; „Flagi dziś · 5 flag · 1 niepotwierdzona” (tabela Koń, Flaga, Godziny, Status); „Zadania · 3 dziś”; „Wizyty i jazdy · dziś” (08:00 Wet · Kasztan, 15:00 Kowal · Kasztan, 16:00 Jazda · Iskra · kryta ujeżdżalnia); „Ludzie · zaproszenia: 1 czeka · 1 wygasło”, liczby ról, „Marek Nowak · Klient · Luna · czeka · ważne do czw 15.10”, „+48 512 *** 908 · Obsługa · wygasło 08.10 · Wyślij ponownie”, „Zaproś osobę”. makiety-plan.md B „PanelPulpit”, „PanelPulpitBrzozowa” (bez alertów i hal, „śniadanie ✓ 06:35 · Paweł bez Komety”, „Boks gotowy 3 z 6”, flagi Komety i Lorda „obowiązują od razu”, bez karty wyświetlacza).
- **Decyzje:** brak.
- **Dane demo:** Pod Lipami o 07:15 (seed), Brzozowa, wariant BezAkcji (seed `--variant=bez-akcji`).

## Zakres
- [ ] `web/src/features/dashboard/DashboardScreen.tsx`: `/stables/$stableId` pokazuje PanelPulpit, gdy „Pierwsze kroki” są ukończone (decyzja z WEB-010 zamiast przekierowania na Boksy); odpytywanie `admin-today` co 30 s z ETag przy widocznej karcie.
- [ ] Alert pilnych: każda niepotwierdzona flaga z `requiresAck` (także po wyłączeniu potwierdzeń), kanały z `deliveries` („wysłano Ci SMS i e-mail”), „Zobacz flagę” → PanelBoksy z podświetlonym boksem (jak WEB-015).
- [ ] Kafle liczników; „Dziś w halach” per hala: posiłek („Podano śniadanie 06:40 · Ola”, pominięte konie z boksem i flagą), padok (następne HH:MM, liczba koni, pominięte), „Gotowe boksy X z Y”, „Poidło ręczne · boks N · koń · woda HH:MM”; przy jednej hali bez nazw hal; elementy wyłączonych przycisków nie występują (BezAkcji).
- [ ] „Flagi dziś” (tabela z boksem i halą, godzinami, statusem tylko przy `requiresAck`, „obowiązuje od razu” bez potwierdzeń), „Wizyty i jazdy” (z `admin-today`), „Zadania” do odczytu (do wzięcia, w toku z osobą, zrobione) z linkiem „Wszystkie zadania” dodanym w WEB-023.
- [ ] „Ludzie”: liczby ról z `GET …/members`, zaproszenia oczekujące i wygasłe z `GET …/invitations` z „Wyślij ponownie” (akcja z WEB-006) i „Zaproś osobę”.
- [ ] „Do załatwienia”: konie bez boksu z „Przypisz boks” (panel z WEB-013).
- [ ] Brak pilnych: bez alertu; pusta stajnia: PanelPulpitStart (WEB-010).

## Poza zakresem
- Kafel „Subskrypcja” (WEB-024); baner płatności po terminie i zawieszenia (WEB-025); pełna lista zadań z dodawaniem (WEB-023); potwierdzanie flagi z panelu (P3).

## Kryteria akceptacji
- [ ] A-02: alert Belli z „Niepotwierdzona od 01:20 · wysłano Ci SMS i e-mail”; po potwierdzeniu (atrapa) alert znika przy następnym odpytaniu.
- [ ] Pod Lipami zgodny z makietą: „pominięty Kasztan (Główna 7)”, „pominięta Bella (Nowa 4)”, „Gotowe boksy 4 z 8”, woda boksu 5.
- [ ] Brzozowa (PanelPulpitBrzozowa): bez alertów i nazw hal, „bez Komety”, flagi „obowiązują od razu”.
- [ ] BezAkcji: bez posiłku, padoku i „Gotowe boksy”, woda zostaje.
- [ ] 1440 i 390 px bez poziomego przewijania.

## Testy
- Vitest: składanie sekcji z fixture'ów `admin-today` (Pod Lipami, Brzozowa, BezAkcji), wybór Start/Pulpit.
- Playwright na atrapie: trzy warianty, wzorce `toHaveScreenshot` 1440 tworzone w tym zadaniu (PanelPulpit.dc.html tylko do ręcznego przeglądu w PR).
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-045; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Daty i godziny w strefie stajni; liczby z `tabular-nums`.
- Zmiana zależności względem listy: dodane WEB-010 (ta sama trasa pulpitu i decyzja Start/Pulpit).
