---
id: WEB-029
title: "Słowniki: zakładka Ujeżdżalnie"
area: web
stage: 7
size: S
status: todo
depends_on: [BE-048, WEB-022]
decisions: [DEC-17]
owner:
branch:
trello:
---
# WEB-029 · Słowniki: zakładka Ujeżdżalnie

## Cel
Admin widzi i dodaje ujeżdżalnie stajni w panelu, w tym samym ekranie „Słowniki” co pasze i padoki. Bez tego jazdy (BE-048) nie mają gdzie się odbywać w nowej stajni, bo żaden ekran nie zakłada ujeżdżalni.

## Kontekst
- **Stan kodu:** ekran „Słowniki” z zakładkami „Pasze” i „Padoki” (`frontend/web/src/features/settings/DictionariesScreen.tsx`, WEB-022), wspólne `DataTable`, `useApi`, `newId()` (WEB-001), klient API z typów `schedule` po `npm run gen:api` (SH-004).
- **Trasy (BE-048):** `GET /schedule/v1/stables/{stableId}/arenas` (role z funkcją `rides`; admin zawsze) i `POST …/arenas` (admin) z `{ id, name, capacity }`. Tabela `arenas` ma tylko `id`, `stable_id`, `name`, `capacity` (docs/erd.md), bez `version` i `active`, więc nie ma edycji ani wyłączania.
- **Dokumenty:** docs/makiety-plan.md B „PanelSlowniki” (zakładki Pasze | Padoki | Ujeżdżalnie, „+ Dodaj”, wygląd jak PanelUstawieniaStajni), docs/development-szczegoly.md 3.3 `schedule` „Jazdy” (pojemność areny: kolizje 409).
- **Makiety:** brak osobnej planszy; wygląd jak `mockups/project/PanelUstawieniaStajni.dc.html` i zakładki z WEB-022.
- **Decyzje:** DEC-17 A (jazdy tworzą admin i instruktor; ujeżdżalnie zakłada admin).
- **Dane demo:** Pod Lipami: „Kryta ujeżdżalnia” (pojemność z seedu BE-048); Brzozowa bez ujeżdżalni (`rides` wyłączone dla klienta i obsługi).

## Zakres
- [ ] Zakładka „Ujeżdżalnie” w `DictionariesScreen.tsx`: tabela Nazwa | Pojemność (liczba jeźdźców naraz); pusty stan „Brak ujeżdżalni” z „+ Dodaj”.
- [ ] „+ Dodaj”: wiersz z nazwą i pojemnością (1–20), `id` z `newId()`, zapis `POST …/arenas`; po błędzie sieci najpierw odświeżenie listy: jeśli wiersz z tym `id` już jest, zapis się udał, w przeciwnym razie ponowienie z tym samym `id`.
- [ ] Zakładka widoczna tylko adminowi; gdy w ustawieniach stajni jazdy są wyłączone (`rides_enabled = false`, BE-030), zakładka dalej działa, ale z jedną linią „Jazdy są wyłączone w ustawieniach ogólnych” i linkiem do „Ogólne”.
- [ ] Testy i atrapa `schedule` w fixture'ach E2E.

## Poza zakresem
- Zmiana nazwy, pojemności i usuwanie ujeżdżalni (tabela nie ma `version`; jeśli będzie potrzebne, najpierw zadanie BE z migracją i `PATCH`).
- Lista i dodawanie jazd w panelu (brak planszy; jazdy tworzy instruktor przez API, w apce tylko podgląd, MOB-022).

## Kryteria akceptacji
- [ ] Damian w Pod Lipami widzi „Kryta ujeżdżalnia”; dodaje „Lonżownik” (pojemność 1), który po odświeżeniu jest na liście i w `GET …/arenas`.
- [ ] Dwukrotne kliknięcie „Zapisz” przy wolnej sieci i ponowienie po zerwanym połączeniu dają jeden wiersz.
- [ ] Ola (obsługa) nie widzi zakładki; na 1440 i 390 px bez poziomego przewijania.

## Testy
- Vitest + Testing Library: zakładka, walidacja pojemności, ponowienie z tym samym `id`.
- Playwright na atrapie: dodanie ujeżdżalni. `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build` i `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-048; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Bez dopisków objaśniających pod polami (docs/makiety-plan.md 2.3 i 5 pkt 38), poza jedną linią o wyłączonych jazdach.
- Zadanie dopisane przy domykaniu kolejki (luka zgłoszona w WEB-022 „Poza zakresem”).
