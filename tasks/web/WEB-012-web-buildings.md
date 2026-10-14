---
id: WEB-012
title: PanelDodajHale i edycja hali/boksu
area: web
stage: 2
size: M
status: todo
depends_on: [WEB-011, WEB-009]
decisions: []
owner:
branch:
trello: https://trello.com/c/CbcJ2GrO
---
# WEB-012 · PanelDodajHale i edycja hali/boksu

## Cel
Admin dodaje halę z adresem i boksami (nowe boksy od–do, przeniesienie istniejących albo pusta hala), edytuje i wyłącza hale, dodaje boksy do hali i zmienia ustawienia boksu, w tym „Automatyczne poidło”. Boks przeniesiony do innej hali zachowuje konia i historię.

## Kontekst
- **Stan kodu:** PanelBoksy z WEB-011 (przyciski „Dodaj halę”, „Dodaj boks”, „Edytuj halę”, „Szczegóły”, sekcje hal); `SidePanel`, `RadioGroup`, `Switch`, `useEditable` (If-Match, 412), generator wierszy boksów z kreatora stajni (WEB-009, `web/src/features/create-stable/`), do ponownego użycia.
- **Dokumenty:** docs/mikroserwisy.md 5.3. BE-031: `GET /stables/v1/stables/{stableId}/buildings` (hale z adresem, `sortOrder`, `active`, `version`, liczbą boksów), `POST …/buildings` (`{ name, address, sortOrder?, boxes: { mode: 'new', items: [{ label, autoWaterer? }] } | { mode: 'move', boxIds } | { mode: 'empty' } }`; `409 name_taken`), `PATCH …/buildings/{buildingId}` (`{ name?, address?, sortOrder?, active? }`, `If-Match`), `DELETE …/buildings/{buildingId}` (`409 building_not_empty`), `POST …/buildings/{buildingId}/boxes` (`{ items }`), `PATCH …/boxes/{boxId}` (`{ label?, autoWaterer?, buildingId?, active? }`, `If-Match`); DTO boksu `{ id, label, building: { id, name }, autoWaterer, active, version }`. docs/development-szczegoly.md 3.5.3 „PanelDodajHale”, 4.1 „Dodawanie hali”, A-11, A-16 (przełącznik poidła tylko admin).
- **Makiety:** mockups/project/PanelDodajHale.dc.html: „Nowa hala · Stajnia Pod Lipami”, „Nazwa hali *”, „Adres hali” z „Taki sam adres jak inna hala”, „Ulica i numer *”, „Kod pocztowy *”, „Miejscowość *”; „Boksy w hali”: „Dodaj nowe boksy” („Od numeru *”, „Do numeru *”, wiersze „Numer | Poidło: Automatyczne | Ręczne | Więcej ustawień”, „Ustaw dla wszystkich”), „Przenieś istniejące boksy”, „Bez boksów na razie”; „Anuluj”, „Dodaj halę i 8 boksów”. makiety-plan.md B „PanelEdytujHale” (nazwa, adres ul. Polna 3, kolejność, „Aktywna”, „Usuń halę” nieaktywne z „Hala ma 6 boksów”, „+ Dodaj boks”; stany: przeniesienie boksu, wyłączenie, usunięcie pustej, 409).
- **Decyzje:** brak.
- **Dane demo:** Pod Lipami: Hala główna (ul. Lipowa 12), Hala nowa (ul. Polna 3), Hala nowa · boks 5 z poidłem ręcznym (Bursztyn), wolny Hala nowa · boks 6 (historia: Wicher do 01.10).

## Zakres
- [ ] `web/src/features/boxes/AddBuildingPanel.tsx` (`SidePanel`): nazwa, adres z opcją „Taki sam adres jak inna hala” (wybór hali kopiuje pola, dalej edytowalne), wariant boksów: nowe (od–do, domyślnie od 1, wiersze z poidłem i „Więcej ustawień” = numer; „Ustaw dla wszystkich”), przeniesienie (lista boksów innych hal z halą przy numerze i koniem, wielokrotny wybór), bez boksów; przycisk z liczbą („Dodaj halę i 4 boksy”). `409 name_taken` → „Hala o tej nazwie już jest.”.
- [ ] `EditBuildingPanel.tsx` („Edytuj halę”): nazwa, adres, kolejność, „Aktywna” (`Switch`), „+ Dodaj boks” (wiersze jak wyżej → `POST …/boxes`), „Usuń halę” (aktywne tylko przy 0 boksów, inaczej wyłączone z „Hala ma N boksów”; `409 building_not_empty` też obsłużony), zapis z `If-Match`.
- [ ] `BoxDetailsPanel.tsx` („Szczegóły” w PanelBoksy): numer, hala z adresem, koń, „Automatyczne poidło: tak/nie” (`Switch`, `PATCH …/boxes/{id}` z `If-Match`), „Przenieś do hali” (wybór hali → `buildingId`), „Aktywny”; po zapisie odświeżenie `boxes-overview`.
- [ ] „Dodaj boks” w nagłówku PanelBoksy: wybór hali, potem wiersze jak wyżej.
- [ ] Po każdym zapisie unieważnienie `boxes-overview` i `buildings`; toast „Hala dodana.” / „Zapisano.”.

## Poza zakresem
- Historia boksu i „Cała historia” (P3; audyt w WEB-027); stan „Boks gotowy” i woda (WEB-021); konie (WEB-013).

## Kryteria akceptacji
- [ ] A-11: „Dodaj halę” z adresem skopiowanym z Hali nowej i poprawionym, boksy 1–4 → nowa sekcja w PanelBoksy z adresem, numery 1–4 bez błędu mimo powtórzeń.
- [ ] A-11 wariant 2: pusta hala, potem przeniesienie wolnego Hala nowa · boks 6 do niej; boks zachowuje `id` (historia w audycie, WEB-027).
- [ ] Usunięcia hali z boksami interfejs nie proponuje; pusta hala daje się usunąć albo wyłączyć.
- [ ] A-16: przełącznik „Automatyczne poidło” przy Hala nowa · boks 5 zmienia się tylko u admina; równoległa zmiana daje komunikat 412.
- [ ] Po dodaniu drugiej hali do stajni z jedną halą panel zaczyna pokazywać halę przy numerze.

## Testy
- Vitest: budowa body dla trzech wariantów, kopiowanie adresu, blokada „Usuń halę”, 412 w szczegółach boksu.
- Playwright na atrapie: A-11 (oba warianty), przełącznik poidła; zrzut PanelDodajHale 1440.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Wybór boksu zawsze wysyła `boxId`; numer to tylko etykieta.
- Nowe boksy domyślnie z poidłem automatycznym (`autoWaterer = true`).
- Generator wierszy boksów wydziel do wspólnego modułu z kreatorem (WEB-009), bez kopiowania kodu.
