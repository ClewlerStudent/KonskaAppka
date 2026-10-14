---
id: BE-051
title: "files: twarde reguły, bezpieczne linki i cron files-gc"
area: backend
stage: 7
size: M
status: todo
depends_on: [BE-009, BE-039, BE-047]
decisions: [DEC-24, DEC-32]
owner:
branch:
trello: https://trello.com/c/5E7gHuGZ
---
# BE-051 · files: twarde reguły, bezpieczne linki i cron files-gc

## Cel
Pliki działają bezpiecznie dla wszystkich właścicieli (na PoC: załączniki zdrowia, PDF faktur, APK): linki do pobrania wydaje tylko serwis-właściciel po sprawdzeniu uprawnień i są krótko ważne, a niewgrane i usunięte pliki sprząta cron, żeby magazyn nie rósł bez końca.

## Kontekst
- **Stan kodu:** `files` minimum (BE-039: `/files/v1/internal/files`, `attach`, `download-url`, `delete`, klient `backend/src/lib/files-client`), załączniki zdrowia (BE-047), konie i trasy `stables` (BE-032, `horses.photo_file_id`). Szablon crona: BE-009.
- **Dokumenty:** docs/mikroserwisy.md 5.9 (`files`, cron `files-gc`), 5.3 (`POST …/horses/{id}/photo` w `stables` przez `files`), 6 (`files-gc`: `pending` > 24 h, `deleted` po retencji; najpierw S3, potem wiersz); docs/development-szczegoly.md 3.3 `files`, 3.4 `files-gc`, 4.1 „S3”, 4.2 „Presigned URL”; docs/erd.md tabela `files`, pkt 7.
- **Makiety:** KartaKonia.dc.html (avatar konia; zdjęcie opcjonalne), PanelKonie (plansza z planu makiet, bez pliku `.dc.html`).
- **Decyzje:** DEC-24 A (pliki `deleted` usuwane po 30 dniach). DEC-32 A (na PoC bez ekranów zdjęcia konia, wpisu wizyty i jazdy: dane z seedu i API), więc trasy zdjęcia konia z mikroserwisy.md 5.3 nie powstają w tym zadaniu.
- **Dane demo:** wpisy zdrowia Kasztana z seedu (BE-047); załącznik i wpis `owner_private` test tworzy trasami z BE-047; seed bez zdjęć koni.

## Zakres
- [ ] Twarde reguły w `files`: dozwolone typy i maks. rozmiar per `ownerService` w konfiguracji; `attach` wymaga zgodnego `sha256`, rozmiaru i typu; `download-url` tylko dla `attached` i tylko z pasującym `ownerService`; domyślny TTL linku 5 min.
- [ ] Cron `backend/src/jobs/files-gc/` (co godzinę, według BE-009; kod domeny `files`): pliki `pending` starsze niż 24 h i `deleted` starsze niż retencja z DEC-24 (konfiguracja, domyślnie 30 dni): najpierw usunięcie obiektu (brak obiektu to sukces), potem wiersza; partie z limitem; podsumowanie w logu. Uprawnienia: rola bazy z `DELETE` na `files` (manifest `owners.ts`) i usuwanie obiektów w magazynie.
- [ ] Testy bezpieczeństwa linków (docs/development-szczegoly.md 4.2): ważność, izolacja stajni (tokenem stajni A nie da się dostać linku do pliku stajni B), `owner_private` z BE-047 nie trafia do obsługi, upload z innym typem albo rozmiarem odrzucony.

## Poza zakresem
- PDF faktur i body webhooków (BE-052); APK (BE-040).
- Zdjęcie konia: trasy `POST …/horses/{horseId}/photo`, `…/photo/confirm`, `…/photo-url` w `stables` i ekrany (po PoC według DEC-32; przy wariancie B nowe zadania backendu i panelu).

## Kryteria akceptacji
- [ ] Link do załącznika wizyty Kasztana (BE-047) dostaje Anna i obsługa; do załącznika konia innego klienta Anna dostaje 404; wpis `owner_private` nie daje linku obsłudze; upload z innym typem albo rozmiarem niż w konfiguracji `ownerService = schedule` odrzucony.
- [ ] Link po terminie daje 403 z magazynu; plik `pending` po 24 h znika z magazynu i z bazy; plik `deleted` po 30 dniach też.
- [ ] Przerwany przebieg `files-gc` (obiekt usunięty, wiersz nie) kończy się przy następnym przebiegu bez błędu.
- [ ] Rola crona nie ma zapisu poza `files` (meta-test grantów).

## Testy
- Integracyjne (Testcontainers PostgreSQL i MinIO, fałszywy zegar): kryteria wyżej, powtórzony i równoległy przebieg crona.
- Uruchomienie: `cd backend && npm run check`; lokalnie `npm run cron -- files-gc`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; skrypt `start:cron:files-gc`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Zmiana względem pierwotnej wersji: bez tras zdjęcia konia (DEC-32 A); zależność od BE-047 (załączniki zdrowia to jedyne pliki z uprawnieniami użytkownika na PoC) zamiast BE-032.
- Uprawnienia użytkownika sprawdza zawsze serwis-właściciel, zanim zawoła `files`; `files` nie zna użytkownika.
- Z magazynem rozmawia tylko `files` i jego cron.
