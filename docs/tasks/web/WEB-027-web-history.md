---
id: WEB-027
title: Historia zmian obiektu
area: web
stage: 9
size: S
status: todo
depends_on: [BE-055, WEB-011, WEB-012, WEB-013, WEB-014]
decisions: [DEC-24, DEC-31]
owner:
branch:
trello: https://trello.com/c/D9u9qNew
---
# WEB-027 · Historia zmian obiektu

## Cel
Admin konta (i zespół EQUENOR) sprawdza w panelu, kto i kiedy zmienił boks, konia, halę albo ustawienia stajni i co dokładnie się zmieniło. Pomaga wyjaśniać spory („kto wyłączył potwierdzenia?”) bez sięgania do bazy.

## Kontekst
- **Stan kodu:** `BoxDetailsPanel` i `EditBuildingPanel` (WEB-012), `MoveHorsePanel` i PanelKonie (WEB-013), ekran ustawień (WEB-014), `SidePanel`, `formatInStableTz` (WEB-004).
- **Dokumenty:** docs/mikroserwisy.md 5.9 (`GET /platform/v1/…/entities/{type}/{id}/history`: admin), 4.4 (autor z zespołu jako „Zespół EQUENOR”). BE-055: `GET /platform/v1/stables/{stableId}/entities/{type}/{id}/history?before=` (typy m.in. `box`, `horse`, `building`, `stable_settings`, `flag`, `task`; wpisy z `action`, czasem, autorem: `display_name`, „Zespół EQUENOR” dla `operator`, „Tablet” dla tabletu, „System” dla cronów; zmiany pól już maskowane; obiekt innej stajni 404; stronicowanie). docs/development-szczegoly.md 5 pkt 21.
- **Makiety:** brak planszy (PanelHistoriaZmian P3, makiety-plan.md H): panel boczny w stylu PanelUstawieniaStajni.dc.html.
- **Decyzje:** DEC-24 A (audyt przechowywany 2 lata; starsze wpisy znikają).
- **Dane demo:** seed (przeniesienie Wichra z Hala nowa · boks 6 do Hala główna · boks 5 01.10; zmiany ustawień Brzozowej przez Damiana; zapis Kuby z `[OPS]` w scenariuszu 9.6).

## Zakres
- [ ] `web/src/features/history/HistoryPanel.tsx` (`SidePanel`, „Historia zmian · Hala nowa · boks 6”): wpisy pogrupowane po dniach (strefa stajni), w każdym godzina, autor, czynność po polsku (słownik `action` → etykieta, np. `box_moved` → „Przeniesienie boksu”; nieznana: nazwa techniczna) i lista zmian „pole: stara → nowa” z polskimi nazwami pól; „Pokaż starsze” (`before`); pusty stan „Brak zmian”.
- [ ] Wejścia: „Historia” w `BoxDetailsPanel` (typ `box`), w edycji hali (`building`), przy koniu w PanelKonie/`MoveHorsePanel` (`horse`), na ekranie „Ustawienia stajni” (`stable_settings`).
- [ ] Wartości pokazywane dokładnie tak, jak przyszły (maskowanie po stronie serwera); bez dodatkowego rozwijania danych osobowych.

## Poza zakresem
- Audyt platformy dla zespołu (`/platform/audit-entries`; ewentualnie w WEB-026 później); historia boksu dla obsługi i klienta (`board …/history`, apka MOB-017).

## Kryteria akceptacji
- [ ] Historia Hala nowa · boks 6 pokazuje przeniesienie Wichra 01.10 z autorem.
- [ ] Zmiana ustawień przez Kubę z `[OPS]` ma autora „Zespół EQUENOR”; wpis z tabletu „Tablet”; z crona „System”.
- [ ] Obiekt innej stajni (podmieniony `id` w atrapie) daje komunikat „Nie ma takiej strony”, bez danych.
- [ ] Stronicowanie „Pokaż starsze” dokleja kolejne dni bez duplikatów.

## Testy
- Vitest: grupowanie po dniach w strefie stajni, słownik czynności i pól, stronicowanie.
- Playwright na atrapie: historia boksu i ustawień, autor zespołu.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-055; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zmiana zależności względem listy: dodane WEB-012, WEB-013 i WEB-014 (to ich ekrany są punktami wejścia do historii).
