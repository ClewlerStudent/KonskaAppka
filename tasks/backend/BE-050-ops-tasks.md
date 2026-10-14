---
id: BE-050
title: "operations: zadania"
area: backend
stage: 7
size: M
status: todo
depends_on: [BE-023, BE-028, BE-046]
decisions: [DEC-03, DEC-27]
owner:
branch:
trello:
---
# BE-050 · operations: zadania

## Cel
Admin wpisuje jednorazowe zadania dla obsługi (np. „Poidło w boksie 5 do wymiany”), a stajenny sam bierze zadanie („Biorę”) i oznacza je jako zrobione. Telewizor pokazuje listę zadań, jeśli rola wyświetlacza ma funkcję „Zadania”. Tablet zadań nie obsługuje.

## Kontekst
- **Stan kodu:** `operations` (BE-028), konsument `horse.left` i cron `horse-left-reconciler` (BE-046), zdarzenie `member.removed` publikowane przez `auth` przy „Usuń ze stajni” (BE-023). Tabela `tasks`: BE-004. Polityka tras z funkcją `tasks` i `clients` (tablet: `403 client_not_allowed`): BE-006.
- **Dokumenty:** docs/mikroserwisy.md 5.5 tabela „Zadania” (`GET …/tasks`: obsługa, admin, wyświetlacz z `tasks`; `POST …/tasks`, `…/cancel`: admin; `…/take`: obsługa; `…/done`: biorący albo admin), 7.3 (`member.removed` → zwolnienie „Biorę”), 8 (wiersz „Zadania”); docs/development-szczegoly.md 3.3 `operations` „Zadania” (warunkowa zmiana `taken_by IS NULL`, drugie „Biorę” 409 z osobą), 4.1 „Zadania”; docs/erd.md tabela `tasks`, pkt 13.
- **Makiety:** StajennyZadania.dc.html („Do wzięcia: Poidło w boksie 5 do wymiany · Hala nowa · boks 5 · dodał Damian · wczoraj 18:20 · Biorę”, „Moje: Wymienić żarówkę w korytarzu · Hala główna · wziąłeś 07:00”, „Zrobione dziś: Przywieźć słomę z magazynu · zrobiła Ola 06:30”), WyswietlaczCentralny.dc.html („Zadania obsługi”), AdminDzis.dc.html, ListaDnia.dc.html (skrót zadań).
- **Decyzje:** DEC-03 A (funkcja `tasks`: w Pod Lipami obsługa i wyświetlacz; w Brzozowej nikt poza adminem).
- **Dane demo:** Damian (dodaje), Piotr i Ola (obsługa Pod Lipami), „Telewizor korytarz”, „Tablety Pod Lipami”, Anna (klientka).

## Zakres
- [ ] Trasy (`/operations/v1/stables/{stableId}`):
  - `GET …/tasks?view=` (obsługa z `tasks`, admin, wyświetlacz z `tasks`; tablet: `403 client_not_allowed`; klient: `403 forbidden_role`): grupy „do wzięcia”, „w toku” (z rozróżnieniem „moje” dla obsługi), „zrobione dziś”; pozycja z tytułem, notatką, halą, boksem albo koniem (z etykietą „Hala nowa · boks 5”), kto dodał, kto wziął i kiedy, kto zrobił i kiedy;
  - `POST …/tasks` (admin): `{id, title, note?, buildingId?, boxId?, horseId?}` (obiekty z tej samej stajni, inaczej 404);
  - `POST …/tasks/{id}/cancel` (admin);
  - `POST …/tasks/{id}/take` (obsługa): warunkowe `UPDATE … WHERE taken_by IS NULL AND done_at IS NULL AND cancelled_at IS NULL`; zadanie już wzięte: `409 task_taken` (nowy kod w `ERRORS`) z `display_name` biorącego;
  - `POST …/tasks/{id}/done` (biorący albo admin; inni 403).
- [ ] Dla wyświetlacza DTO bez nazwisk: tylko pierwsze słowo `display_name` biorącego („bierze Piotr”, jak na makiecie; propozycja) albo sam stan.
- [ ] Konsument `member.removed` w `operations` (przeniesiony tu z BE-046): zwalnia `taken_by` niezrobionych zadań tej osoby w tej stajni (idempotentnie, audyt `system`).
- [ ] Rozszerzenie konsumenta `horse.left` (BE-046) o odwołanie otwartych zadań konia (`cancelled_at`) i to samo w `horse-left-reconciler` (wpis `tasks.cancelled_at` w manifeście `owners.ts`).
- [ ] Audyt każdego zapisu; seed (BE-011): trzy zadania z makiety StajennyZadania.
- [ ] `npm run openapi`, `npm run gen:api`.

## Poza zakresem
- ekrany: apka (MOB-021), panel i TV (WEB-023); skrót zadań w `board` (BE-045 czyta tabelę `tasks`).

## Kryteria akceptacji
- [ ] A-14: Piotr widzi trzy grupy jak na makiecie i nie ma „+ Dodaj zadanie” (POST daje 403); „Biorę” przenosi zadanie do „Moje”; równoczesne „Biorę” Oli daje 409 z „Piotr”; „Zrobione” ustawia `done_by` i `done_at`.
- [ ] Damian dodaje zadanie dla boksu; Ola nie może (403); tablet dostaje 403 na każdej trasie zadań.
- [ ] A-16: zadanie „Poidło w boksie 5 do wymiany” jest w „Do wzięcia” obsługi.
- [ ] A-21: Ola w Brzozowej (bez `tasks`) dostaje `403 feature_hidden`; klient z zaznaczonym `tasks` widzi listę, ale „Biorę” daje 403 (widoczność nie dodaje uprawnień).
- [ ] Usunięcie Oli ze stajni zwalnia jej „Biorę” w tej stajni; wyjazd konia odwołuje jego otwarte zadania.
- [ ] Odpowiedź dla wyświetlacza przechodzi skan danych-kanarków (bez nazwisk, telefonów, e-maili).

## Testy
- Integracyjne (Testcontainers PostgreSQL, adapter brokera w pamięci, `app.inject`): kryteria wyżej, dwa równoległe „Biorę” dają jedno wzięcie i jedno 409.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/operations.json` zaktualizowany, `npm run gen:api` we `frontend/`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Zmiana zależności względem pierwotnej listy: dodane BE-046, bo zadanie rozszerza konsumenta `horse.left` i cron uzgadniający.
- Zadania są tylko jednorazowe: bez cykli i bez generatora wystąpień.
- „Biorę” i „Zrobione” to warunkowa zmiana wiersza, bez id zdarzenia z klienta; „Biorę” tylko online.
