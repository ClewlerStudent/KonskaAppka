---
id: WEB-023
title: Zadania w panelu i na TV
area: web
stage: 7
size: S
status: todo
depends_on: [BE-050, WEB-004, WEB-016, WEB-020]
decisions: [DEC-27]
owner:
branch:
trello:
---
# WEB-023 · Zadania w panelu i na TV

## Cel
Admin dodaje w panelu jednorazowe zadania dla obsługi (np. „Poidło w boksie 5 do wymiany”), widzi, kto je wziął i zrobił, i odwołuje niepotrzebne. Telewizor pokazuje zadania obsługi, gdy rola Wyświetlacz ma je w macierzy widoczności.

## Kontekst
- **Stan kodu:** karta „Zadania” (do odczytu) na PanelPulpit (WEB-020), `SidePanel`, `RadioGroup`, `ConfirmDialog`, `DataTable` (WEB-004), `HorsePicker` (WEB-006); TV: `DisplayScreen` i odpytywanie (WEB-016).
- **Dokumenty:** docs/mikroserwisy.md 5.5 „Zadania” (lista: obsługa, admin, wyświetlacz z funkcją `tasks`; dodaj i odwołaj: admin; „Biorę”: obsługa; „Zrobione”: biorący albo admin). BE-050: `GET /operations/v1/stables/{stableId}/tasks?view=` (grupy „do wzięcia”, „w toku”, „zrobione dziś”; pozycja z tytułem, notatką, halą/boksem/koniem z etykietą, kto dodał, wziął, zrobił i kiedy; dla wyświetlacza bez nazwisk: „bierze Piotr”), `POST …/tasks` (`{ id, title, note?, buildingId?, boxId?, horseId? }`), `POST …/tasks/{id}/cancel`, `POST …/tasks/{id}/done` (admin też). docs/development-szczegoly.md A-14.
- **Makiety:** apka: makiety-plan.md C „AdminZadania” i „AdminZadaniaNowe” (tytuł, notatka, „Dotyczy: Cała stajnia | Hala | Boks | Koń”, „Dodaj zadanie”, odwołanie „Odwołać zadanie?”). Panel: karta „Zadania · 3 dziś” w PanelPulpit.dc.html („Poidło w boksie 5 do wymiany · do wzięcia · Hala nowa · boks 5”, „Wymienić żarówkę w korytarzu · w toku · Piotr 07:00 · Hala główna”, „Przywieźć słomę z magazynu · zrobione 06:30 · Ola”). TV: sekcja „Zadania obsługi” w WyswietlaczCentralny.dc.html („Hala nowa · do wzięcia”, „Hala główna · bierze Piotr”, „zrobione 06:30”).
- **Decyzje:** brak.
- **Dane demo:** trzy zadania z seedu (BE-050); TV Pod Lipami z funkcją `tasks`; Brzozowa bez `tasks` u ról (admin widzi zawsze).

## Zakres
- [ ] `web/src/features/tasks/TasksScreen.tsx` na `/stables/$stableId/tasks` (wejście: link „Wszystkie zadania” w karcie „Zadania” na PanelPulpit; bez nowej pozycji w nawigacji): grupy „Do wzięcia”, „W toku”, „Zrobione dziś”; pozycja z tytułem, miejscem (`boxLabel`), kto dodał i kiedy, kto wziął od kiedy, kto zrobił.
- [ ] „+ Dodaj zadanie” (`SidePanel`): tytuł, notatka, „Dotyczy: Cała stajnia | Hala | Boks | Koń” z wyborem obiektu (boks z halą, koń z `HorsePicker`) → `POST …/tasks` z `id` z `newId()` (ponowienie bez duplikatu).
- [ ] „Odwołaj” przy „Do wzięcia” i „W toku” z dialogiem „Odwołać zadanie?”; „Zrobione” przy „W toku” (admin może zamknąć).
- [ ] TV: sekcja „Zadania obsługi” przy funkcji `tasks` roli `display` — `GET …/tasks` co 30 s (z ETag, jeśli trasa go zwraca), tytuł, miejsce i stan („do wzięcia”, „bierze Piotr”, „zrobione 06:30”), bez nazwisk.

## Poza zakresem
- „Biorę” (tylko obsługa w apce, MOB-021); zadania cykliczne (nie ma); zadania na tablecie (nie pokazujemy).

## Kryteria akceptacji
- [ ] A-14: Damian dodaje zadanie dla „Hala główna · boks 3”; zadanie widać w „Do wzięcia” w panelu i na TV przy najbliższym odpytaniu.
- [ ] Odwołanie usuwa zadanie z list panelu i TV.
- [ ] TV bez funkcji `tasks` nie pokazuje sekcji; w DOM TV nie ma nazwisk.
- [ ] 1440 i 390 px bez poziomego przewijania.

## Testy
- Vitest: grupowanie i formatowanie pozycji, formularz „Dotyczy”, sekcja TV z i bez funkcji.
- Playwright na atrapie: dodanie i odwołanie w panelu, sekcja na TV (projekt `tv`, `page.clock`).
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-050; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zmiana zależności względem listy: dodane WEB-020 (wejście do listy zadań jest w karcie „Zadania” na pulpicie, bo nawigacja panelu nie ma pozycji „Zadania”).
