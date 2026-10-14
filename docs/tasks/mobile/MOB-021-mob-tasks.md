---
id: MOB-021
title: Zadania (StajennyZadania, AdminZadania, AdminZadaniaNowe)
area: mobile
stage: 7
size: M
status: todo
depends_on: [BE-050, MOB-016, MOB-020]
decisions: []
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/QHrRH6gq
---
# MOB-021 · Zadania (StajennyZadania, AdminZadania, AdminZadaniaNowe)

## Cel
Admin wpisuje jednorazowe zadania (np. „Poidło w boksie 5 do wymiany”), obsługa bierze je na siebie („Biorę”, tylko online, żeby dwie osoby nie wzięły tego samego) i oznacza jako zrobione, także bez zasięgu.

## Kontekst
- Stan kodu: pozycje paska „Zadania” obsługi (z funkcją `tasks`) i admina (MOB-005; trasy `mobile/app/(app)/(staff)/tasks.tsx`, `mobile/app/(app)/(admin)/tasks.tsx`), skrót zadań w ListaDnia (MOB-016) i AdminDzis (MOB-020), kolejka z `enqueueTaskDone` i wzorzec tylko online (MOB-008). Trasy `operations` (BE-050): `GET /operations/v1/stables/{stableId}/tasks?view=` (obsługa z `tasks`, admin; grupy „do wzięcia”, „w toku” z „moje”, „zrobione dziś”; pozycja z tytułem, notatką, halą, boksem albo koniem z etykietą, kto dodał i kiedy, kto wziął, kto zrobił), `POST …/tasks` (admin: `{ id, title, note?, buildingId?, boxId?, horseId? }`), `POST …/tasks/{id}/cancel` (admin), `POST …/tasks/{id}/take` (obsługa; `409 task_taken` z imieniem biorącego), `POST …/tasks/{id}/done` (biorący albo admin; inni 403); klient i tablet 403.
- Dokumenty: `docs/development-szczegoly.md` 3.5.1 (StajennyZadania tylko przy widoczności `tasks` dla obsługi: „Do wzięcia” z „Biorę”, „Moje” z „Zrobione”, „Zrobione dziś”; „+ Dodaj zadanie” widzi tylko admin; „Biorę” wyłącznie online). `docs/makiety-plan.md` C „AdminZadania” (H1 „Zadania”, „+ Dodaj zadanie”; „Do wzięcia”: „Poidło w boksie 5 do wymiany · Hala nowa · boks 5 · dodał Damian wczoraj 18:20”, „Odwołaj”; „W toku”: „Wymienić żarówkę w korytarzu · Hala główna · Piotr od 07:00”; „Zrobione dziś”: „Przywieźć słomę z magazynu · Ola 06:30”; stany: ● AdminZadaniaNowe — arkusz: tytuł, notatka, „Dotyczy”: Cała stajnia | Hala | Boks | Koń, „Dodaj zadanie”, „Anuluj”; odwołanie „Odwołać zadanie?”; brak zadań; w Brzozowej bez wyboru hali), G „ListaDniaOffline” („Biorę” nieaktywne z „tylko online”; 409 „Zadanie wziął już Piotr”). A-14.
- Makiety: `mockups/project/StajennyZadania.dc.html` („Do wzięcia · 1 zadanie”, „Poidło w boksie 5 do wymiany · Hala nowa · boks 5 · dodał Damian · wczoraj 18:20 · Biorę”, „Moje · 1 w toku”, „Wymienić żarówkę w korytarzu · Hala główna · w toku · wziąłeś 07:00 · Zrobione”, „Zrobione dziś · Przywieźć słomę z magazynu · Zrobione 06:30 · zrobiła Ola”; zdania „Zadania jednorazowe wpisuje admin…” i „Zadania odhacza się w apce…” pomijamy, docs/makiety-plan.md 2.3 i 5 pkt 38).
- Decyzje: brak nowych.
- Dane demo: Piotr i Ola (obsługa Pod Lipami), Damian (admin), trzy zadania z seedu; Brzozowa bez zadań i bez funkcji `tasks` dla obsługi.

## Zakres
- [ ] `mobile/src/features/tasks/TaskList.tsx` (wspólny): grupy z makiety, pozycja z tytułem, miejscem (`boxLabel` albo hala albo koń), kto dodał i kiedy, kto wziął, kto zrobił; odpytywanie na widocznym ekranie (MOB-007).
- [ ] `mobile/app/(app)/(staff)/tasks.tsx` (StajennyZadania): „Biorę” tylko online (`online-only.ts`) → `POST …/take`; `409 task_taken` → „Zadanie wziął już Piotr” i odświeżenie; „Zrobione” przy własnych → `enqueueTaskDone` z optymistycznym przeniesieniem do „Zrobione dziś”.
- [ ] `mobile/app/(app)/(admin)/tasks.tsx` (AdminZadania): „+ Dodaj zadanie”, „Odwołaj” z dialogiem „Odwołać zadanie?” → `POST …/cancel` (online), „Zrobione” przy dowolnym zadaniu (admin).
- [ ] `mobile/app/(app)/tasks/new.tsx` (AdminZadaniaNowe, arkusz): tytuł (wymagany), notatka, „Dotyczy”: Cała stajnia | Hala | Boks | Koń (selekty z danymi stajni; przy jednej hali bez „Hala”), „Dodaj zadanie” → `POST …/tasks` z `id` klienta (online, z ponowieniem tym samym `id`), „Anuluj”.
- [ ] Podłączenie „Biorę” w skrócie zadań ListaDnia (MOB-016) i „+ Dodaj zadanie” w AdminDzis (MOB-020).
- [ ] Stan pusty „Brak zadań”; zakładka znika bez funkcji `tasks` (obsługa), admin widzi zawsze.

## Poza zakresem
- Zadania na wyświetlaczu i w panelu (WEB-023); zadania cykliczne (nie ma ich w PoC).

## Kryteria akceptacji
- [ ] A-14: Piotr widzi trzy grupy jak na makiecie, bez „+ Dodaj zadanie”; „Biorę” przenosi zadanie do „Moje”; równoczesne „Biorę” Oli kończy się „Zadanie wziął już Piotr”.
- [ ] „Zrobione” przy żarówce w trybie samolotowym pokazuje zadanie w „Zrobione dziś” od razu, a po powrocie sieci zapis ma `done_by` Piotra; zadanie jest „zrobione” u obu osób.
- [ ] Damian dodaje zadanie „Sprawdzić zasuwę w boksie 3” dla „Hala główna · boks 3”; Ola nie ma przycisku dodawania (API dałoby 403).
- [ ] „Biorę” offline jest nieaktywne z „tylko online”.
- [ ] Ola w Brzozowej nie ma zakładki „Zadania”.

## Testy
- Jest + RNTL: `tasks-staff.test.tsx` (grupy, `task_taken`, offline), `tasks-admin.test.tsx` (dodawanie, odwołanie), `task-new.test.tsx` (wybór „Dotyczy”) na atrapie `operations`.
- [ręcznie] Maestro: `mobile/e2e/maestro/tasks.yaml` (A-14 na seedzie, dwa urządzenia albo drugi klient przez API dla wyścigu „Biorę”).

## Definicja gotowości
- `npm run check` w `mobile/` zielone (`gen:api` z `operations.json`); flow Maestro przechodzi [ręcznie]; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- „Biorę” nigdy przez kolejkę offline: zajęte zadanie trzeba pokazać od razu (docs/development-szczegoly.md 3.5.1).
- Widoczność `tasks` nie daje uprawnień (A-21): klient z zaznaczonymi „Zadaniami” może widzieć listę, ale „Biorę” dostaje 403 — w apce klienta zakładki zadań nie dodajemy.
