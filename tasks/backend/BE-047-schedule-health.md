---
id: BE-047
title: "schedule: zdrowie i załączniki"
area: backend
stage: 7
size: M
status: todo
depends_on: [BE-006, BE-039, BE-032]
decisions: [DEC-03]
owner:
branch:
trello:
---
# BE-047 · schedule: zdrowie i załączniki

## Cel
Obsługa i admin wpisują wizyty i zdarzenia zdrowotne konia (weterynarz, kowal, dentysta, odrobaczanie, szczepienie) z terminem i załącznikami (np. wyniki badań). Klient widzi wpisy swojego konia, w tym prywatne („tylko właściciel”), a obsługa tylko wpisy stajenne. Powstaje serwis `schedule`.

## Kontekst
- **Stan kodu:** serwisu `schedule` nie ma. Wzór serwisu: `backend/src/services/auth/`; polityka tras (`stable {roles, feature: 'health'}`, `clients`), `resolveStable`, klient koń z `m[].h`: BE-006. Pliki: `files /internal` (`create`, `attach`, `download-url`, `delete`) i klient `backend/src/lib/files-client` (BE-039). Tabele `health_events`, `health_attachments`: BE-004. Konie w seedzie: BE-032.
- **Dokumenty:** docs/mikroserwisy.md 5.6 (tabela tras „Zdrowie”: kto czyta i zapisuje; `owner_private` widzi tylko klient z koniem, admin i `plt`; link do pliku dopiero po sprawdzeniu uprawnień), 8 (wiersz „Wizyty i wpisy zdrowia”); docs/development-szczegoly.md 3.3 `schedule` „Zdrowie”, 4.2 „Presigned URL” (`owner_private` nie trafia do obsługi); docs/erd.md tabele `health_events`, `health_attachments`, pkt 7, „Współpraca serwisów” (na tablet nie trafiają opisy wizyt).
- **Makiety:** KartaKonia.dc.html (zakładka „Zdrowie”: „Ostatnio · Wet · kontrola pt 02.10”; „Dziś”: „Wet · na czczo 08:00”, „Kowal 15:00”), AdminDzis.dc.html („Wizyty i jazdy”).
- **Decyzje:** DEC-03 A (funkcja `health` z `m[].f`; w Pod Lipami klient, obsługa i tablet ją mają, wyświetlacz i instruktor nie).
- **Dane demo:** Kasztan: wet dziś 08:00 („na czczo”), kowal 15:00, wet kontrola pt 02.10 (przeszła); Anna (klientka), Ola (obsługa), Damian (admin), Marta (instruktor, bez `health`), „Telewizor korytarz” (bez `health`).

## Zakres
- [ ] Serwis `backend/src/services/schedule/` (`main.ts`, `app.ts`, `env.ts`), skrypty `start:schedule`, `dev:schedule`; kontrakt `backend/src/contracts/schedule.ts` w `backend/src/contracts/index.ts`.
- [ ] Trasy (`/schedule/v1/stables/{stableId}`):
  - `GET …/horses/{horseId}/health-events` (klient: swój koń, obsługa, admin; funkcja `health`): wpisy niewyłączone, bez `owner_private` dla obsługi;
  - `POST …/horses/{horseId}/health-events` (obsługa, admin): `{id, type: vet | farrier | dentist | deworming | vaccination, occurredOn?, scheduledAt?, nextDueAt?, description?, visibility: stable | owner_private}`;
  - `DELETE …/health-events/{id}` (obsługa, admin; miękkie usuwanie `deleted_at`, audyt);
  - `GET …/health-events?date=` (obsługa, admin, wyświetlacz z funkcją `health`): wizyty dnia; dla wyświetlacza tylko typ, termin, koń, boks;
  - `POST …/health-events/{id}/attachments` (obsługa, admin): `{fileName, contentType, sizeBytes, sha256}` → `files create` (`ownerService = schedule`, `ownerId` = id załącznika) i link do wgrania; `POST …/health-attachments/{id}/confirm` → `files attach` (dodatek do tras z docs: drugi krok wgrywania); `DELETE …/health-attachments/{id}` (miękkie usuwanie i `files delete`);
  - `POST …/health-attachments/{id}/download-url` (jak odczyt wpisu): najpierw sprawdzenie widoczności wpisu i dostępu do konia, potem `files download-url`.
- [ ] Dozwolone typy plików i rozmiar (np. PDF, JPEG, PNG, do 10 MB) w konfiguracji serwisu; reszta 422.
- [ ] Audyt każdego zapisu; brak zdarzeń (przypomnienia wysyła cron BE-049).
- [ ] Seed: moduł w `backend/scripts/seed/` (BE-011, stałe UUID z `backend/src/lib/testing/demo.ts`): trzy wpisy Kasztana jak wyżej, widoczność `stable`.
- [ ] `npm run openapi`, `npm run gen:api`.

## Poza zakresem
- ujeżdżalnie i jazdy (BE-048); przypomnienia `health.due` (BE-049); wizyty w widokach `board` (BE-042, BE-045);
- pełne testy plików i `files-gc` (BE-051); ekrany (MOB-022, panel).

## Kryteria akceptacji
- [ ] A-21: Anna w Pod Lipami widzi wpisy Kasztana; Marta (bez `health`) dostaje `403 feature_hidden`; TV bez `health` dostaje 403 na `GET …/health-events`.
- [ ] Wpis `owner_private`: Anna i Damian go widzą, Ola nie (brak na liście, a link do załącznika daje 404).
- [ ] Klient na koniu spoza `h`: 404; obiekt innej stajni: 404; klient nie zapisuje (403).
- [ ] Link do załącznika powstaje tylko po sprawdzeniu uprawnień, wygasa po krótkim czasie i nie działa dla pliku innej stajni.
- [ ] Usunięty wpis znika z list, zostaje w bazie z `deleted_at`.

## Testy
- Integracyjne (Testcontainers PostgreSQL i MinIO, `app.inject`, tokeny z `mintToken`): kryteria wyżej, cały przepływ załącznika (create → PUT → confirm → download-url).
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/schedule.json` w repo, `npm run gen:api` we `frontend/`; README backendu: uruchomienie `schedule`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Zmiana zależności względem pierwotnej listy: dodane BE-032 (konie w seedzie i dane zasobu konia).
- `schedule` nie czyta tabel uprawnień; rola i konie klienta tylko z tokenu.
- Opisy wizyt nie trafiają na tablet ani TV (to pilnuje `board`); w odpowiedzi dla `display` tylko typ i termin.
