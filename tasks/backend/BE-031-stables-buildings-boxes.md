---
id: BE-031
title: "stables: hale i boksy"
area: backend
stage: 2
size: M
status: todo
depends_on: [BE-029]
decisions: []
owner:
branch:
trello:
---
# BE-031 · stables: hale i boksy

## Cel
Admin dodaje kolejne hale (z własnym adresem) z nowymi boksami, przenosi boksy między halami, zmienia numer i poidło boksu, wyłącza albo usuwa pustą halę. Tablety i wyświetlacz widzą zmiany przy najbliższym odpytaniu; boks zawsze rozpoznajemy po `id`, bo numery powtarzają się między halami.

## Kontekst
- Stan kodu: serwis `stables` (BE-029: `backend/src/services/stables/`, `contracts/stables.ts`, pierwsza hala i boksy przy zakładaniu); tabele `buildings` (UK `(stable_id, name)`, adres, `sort_order`, `active`, `version`), `boxes` (`building_id`, `label` bez unikalności, `auto_waterer`, `active`) z BE-004; polityka, `TenantScope`, `If-Match` (BE-006).
- Dokumenty: `docs/mikroserwisy.md` 5.3 (tabela: `POST …/buildings`, `PATCH`, `DELETE …/buildings/{id}` tylko pustej (409), `POST …/buildings/{id}/boxes`, `PATCH …/boxes/{id}` numer, poidło, hala w obrębie stajni; `GET /platform/stables/{s}/boxes` dla `plt = admin` i `support`), 4.6; `docs/erd.md` pkt 11 (hale, adres, „Dodaj halę”: nowe boksy od–do, przeniesienie, pusta; numer bez unikalności; przy kilku halach „Hala nowa · boks 4”); `docs/development-szczegoly.md` 3.3 stables „Hale”, „Boksy z ustawieniami przy tworzeniu”, „Boksy” (DTO z halą i `autoWaterer`, poidło tylko admin, `If-Match`), „Testy”.
- Makiety: `PanelDodajHale.dc.html` (Nazwa hali *, „Taki sam adres jak inna hala”, Ulica i numer *, Kod *, Miejscowość *, „Dodaj nowe boksy” od–do z listą Numer/Poidło i „Ustaw dla wszystkich”, „Przenieś istniejące boksy”, „Bez boksów na razie”, „Dodaj halę i 8 boksów”), `BoksSzczegoly.dc.html` („Automatyczne poidło: Włączone…”), `PanelBoksy.dc.html` (sekcje hal z adresem, „Edytuj halę”).
- Scenariusze: A-10 (boks 4 w dwóch halach), A-11 (dodanie hali, przeniesienie Hala nowa · boks 6 z historią Wichra, usunięcie tylko pustej, 403 dla nie-admina).
- Dane demo: Pod Lipami: Hala główna (ul. Lipowa 12) boksy 1–8, Hala nowa (ul. Polna 3) boksy 1–6, Hala nowa · boks 5 z poidłem ręcznym; Brzozowa: jedna hala, boksy 1–6; Olszynka: boksy 1–6.

## Zakres
- [ ] `GET /stables/v1/stables/{stableId}/buildings` (admin; hale z adresem, `sortOrder`, `active`, `version`, liczbą boksów) — dla formularzy edycji i „Taki sam adres jak inna hala”.
- [ ] `POST …/buildings` (`{ name, address, sortOrder?, boxes: { mode: 'new', items: [{ label, autoWaterer? }] } | { mode: 'move', boxIds } | { mode: 'empty' } }`): hala i boksy (albo przeniesienie) w jednej transakcji z audytem; nazwa zajęta → 409 `name_taken`; boks spoza stajni → 404.
- [ ] `PATCH …/buildings/{buildingId}` (`{ name?, address?, sortOrder?, active? }`, `If-Match`), `DELETE …/buildings/{buildingId}` (z boksami → 409 `building_not_empty`).
- [ ] `POST …/buildings/{buildingId}/boxes` (`{ items: [{ label, autoWaterer? }] }`), `PATCH …/boxes/{boxId}` (`{ label?, autoWaterer?, buildingId?, active? }`, `If-Match`; przeniesienie zachowuje konia, historię i zdarzenia).
- [ ] DTO boksu wspólne dla `stables` i `board`: `{ id, label, building: { id, name }, autoWaterer, active, version }`; brak wartości poidła przy tworzeniu → `true`; powtórzony numer przechodzi.
- [ ] `GET /stables/v1/platform/stables/{stableId}/boxes` (`plt = admin`, `support`): numery boksów i hale, bez koni.
- [ ] Wszystkie zapisy tylko admin (obsługa i klient 403, konta techniczne 403); kody błędów `name_taken`, `building_not_empty` do `ERRORS`.
- [ ] Moduł seedu `stables-structure`: hale i boksy trzech stajni ze stałymi UUID z `lib/testing/demo.ts`, poidło ręczne w Hala nowa · boks 5.

## Poza zakresem
- Konie i historia boksów (BE-032); widoki list boksów (BE-033); ekrany (WEB-011, WEB-012, MOB-009).

## Kryteria akceptacji
- [ ] A-11: hala „Hala trzecia” z adresem skopiowanym z Hali nowej i boksami 1–4 zapisuje się w jednej transakcji z audytem; numery 1–4 powtarzają się bez błędu, każdy boks ma własne `id`.
- [ ] Pusta hala + przeniesienie Hala nowa · boks 6: boks zachowuje `id` i historię; usunięcie hali z boksami → 409, po przeniesieniu z powrotem → 204.
- [ ] Dwa boksy „4” w jednej hali przechodzą; przełącznik poidła przez Olę → 403, przez Damiana z `If-Match` → 200.
- [ ] Kuba (`ops`) i `plt = support` widzą `platform/…/boxes` bez koni; obsługa → 403.

## Testy
- `backend/src/services/stables/buildings.test.ts` na harnessie z seedem: A-10, A-11, poidło, `If-Match`, izolacja (admin Olszynki 404). `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- `GET …/buildings` to propozycja spoza tabeli tras mikroserwisy.md 5.3 (formularze potrzebują `version` do `If-Match`); dopisz ją do kontraktu i README serwisu.
- Nigdy nie szukaj boksu po numerze: tylko `boxes.id` (UUID).
- Innym serwisom nic nie wysyłamy: tablet i TV widzą nową halę przy odpytaniu `board`.
