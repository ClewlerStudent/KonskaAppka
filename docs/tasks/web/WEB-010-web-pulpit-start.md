---
id: WEB-010
title: PanelPulpitStart
area: web
stage: 2
size: M
status: todo
depends_on: [BE-033, WEB-009, WEB-005, WEB-006]
decisions: [DEC-27]
owner:
branch:
trello: https://trello.com/c/O5BULrg9
---
# WEB-010 · PanelPulpitStart

## Cel
Zaraz po założeniu stajni admin widzi „Pierwsze kroki”: co już jest gotowe (stajnia, boksy, powiadomienia, ustawienia) i co zostało (konie, ludzie, tablety, wyświetlacz), z przyciskami prowadzącymi do tych czynności. Gdy domyślne dane w `operations` się nie zapisały, widzi „Dokończ zakładanie stajni” i ponawia jednym kliknięciem.

## Kontekst
- **Stan kodu:** trasa `/stables/$stableId` (pulpit; zaślepka z WEB-001), `AdminLayout`, `StatCard`, `Toast` z WEB-004; `pendingSetup[stableId]` (pory posiłków z kreatora) i baner po założeniu z WEB-009; `InviteForm` z presetem roli (WEB-006); „Przypisz z firmy” (WEB-005).
- **Dokumenty:** docs/mikroserwisy.md 5.3 („Dokończ zakładanie stajni”: `POST /stables/v1/stables/{id}/setup/retry` z porami z formularza, a bez formularza bez pór — `operations` zakłada 06:30, 12:00, 18:00), 10.2 pkt 22 (stan „Pomiń” bez miejsca na serwerze). BE-033: `GET /board/v1/stables/{stableId}/setup-checklist` (dane stajni i hala z adresem i strefą, boksy z poidłem, skrót reguł powiadomień, ustawienia, „N z M boksów zajętych”, `operationsDefaults: missing`, plan dnia z `meal_slots`; pozycje o ludziach, tabletach i wyświetlaczu panel liczy z `auth`). BE-022/BE-023: zaproszenia i członkowie (konta techniczne `technical=true`).
- **Makiety:** mockups/project/PanelPulpitStart.dc.html: H1 „Pulpit · Stajnia Brzozowa”, „6 boksów · 0 koni · czw 01.10.2026”, baner „Stajnia Brzozowa założona.”, „Pierwsze kroki · 3 z 8”: ✓ „Stajnia · ul. Brzozowa 5, 05-500 Piaseczno · Europa/Warszawa”, ✓ „Boksy 1–6 · Poidło automatyczne”, ✓ „Powiadomienia · Flagi: SMS · zaproszenia i płatności: e-mail”, ✓ „Ustawienia stajni · Usługi i potwierdzenia flag: włączone · Sprawdź”, ○ „Dodaj konia · 0 z 6 boksów zajętych · Dodaj konia”, ○ „Ludzie w tej stajni · Przypisz z firmy · Zaproś osobę”, ○ „Tablety przy boksach · Zaproś konto techniczne”, ○ „Wyświetlacz · Pomiń · Zaproś konto techniczne”; kafle „Boksy 6 · wszystkie wolne”, „Konie 0”, „Osoby 1 · Ty, admin konta”; „Dziś w stajni · 06:30 · 12:00 · 18:00 · Brak wpisów”; „Flagi dziś · Brak flag”. makiety-plan.md B „PanelPulpitStart” (stany: w połowie, wszystko zrobione → karta znika).
- **Decyzje:** brak (luka „Pomiń”: propozycja w zakresie).
- **Dane demo:** Brzozowa w dniu założenia (czw 01.10.2026); Pod Lipami po etapie 2 (wszystko zrobione).

## Zakres
- [ ] `web/src/features/dashboard/SetupChecklist.tsx`: dane z `setup-checklist` (board) + `GET /auth/v1/stables/{id}/members` (osoby poza adminem, konta techniczne `tablet`/`display`) + `GET …/invitations?status=pending` (zaproszenie liczy pozycję jako „czeka”); licznik „N z 8”.
- [ ] Trasa `/stables/$stableId`: dopóki lista ma otwarte pozycje (bez „Pomiń”), pokazuje PanelPulpitStart; gdy wszystko zrobione — do czasu WEB-020 przekierowanie na `/stables/$stableId/boxes`, potem PanelPulpit (WEB-020 przejmuje decyzję).
- [ ] Pozycje i akcje: „Sprawdź” → `/stables/$id/settings` (WEB-014; przed nim zaślepka WEB-004); „Dodaj konia” → `/stables/$id/boxes?add=horse` (WEB-013 otwiera dialog; przed nim lista boksów); „Zaproś osobę” → `InviteForm`; „Przypisz z firmy” → panel z WEB-005; „Zaproś konto techniczne” → `InviteForm` z presetem `tablet` albo `display`.
- [ ] „Pomiń” przy wyświetlaczu: zapis w `localStorage` (`eq.panel.setupSkipped.<stableId>`, try/catch); bez pamięci pozycja wraca (propozycja; luka 10.2 pkt 22).
- [ ] „Dokończ zakładanie stajni” przy `operationsDefaults = missing`: `POST /stables/v1/stables/{id}/setup/retry` z porami z `pendingSetup[stableId]`, a bez nich bez treści; stan „Kończę zakładanie…”, sukces → odświeżenie listy, błąd → „Nie udało się. Spróbuj ponownie.”.
- [ ] Baner OK „Stajnia X założona.” tylko po przejściu z kreatora (stan nawigacji), zamykany.
- [ ] Kafle i karty „Dziś w stajni” (pory z listy) i „Flagi dziś” („Brak flag” do czasu flag z WEB-015/WEB-020).

## Poza zakresem
- Pełny PanelPulpit z alertami, rutyną i flagami (WEB-020); formularze, do których prowadzą pozycje (WEB-005, WEB-006, WEB-013, WEB-014).

## Kryteria akceptacji
- [ ] A-23: po założeniu Brzozowej „Pierwsze kroki · 3 z 8” z czterema ✓ jak na makiecie; po zaproszeniu Pawła pozycja „Ludzie” ma stan „czeka”, po dodaniu konia „1 z 6 boksów zajętych”.
- [ ] Odpowiedź `setup-checklist` z `operationsDefaults: missing` pokazuje „Dokończ zakładanie stajni”; po udanym ponowieniu pozycja znika; ponowienie bez `pendingSetup` (nowa karta) wysyła żądanie bez pór.
- [ ] „Pomiń” chowa pozycję wyświetlacza; z `localStorage` rzucającym wyjątek pozycja zostaje, a strona działa.
- [ ] Pod Lipami (wszystko zrobione) nie pokazuje listy.
- [ ] Bez instrukcji i „Jak podłączyć telewizor” (docs/makiety-plan.md 5 pkt 11, 38); 1440 i 390 px bez poziomego przewijania.

## Testy
- Vitest: wyliczenie pozycji i licznika z odpowiedzi (fixture'y: dzień założenia, w połowie, komplet), „Pomiń” z wyjątkiem storage, ponowienie z porami i bez.
- Playwright na atrapie: kreator → PanelPulpitStart z banerem; `setupPending` → „Dokończ zakładanie stajni”; zrzuty 1440 i 390.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- `board` nie zna ludzi: pozycje o osobach, tabletach i wyświetlaczu liczy aplikacja z `auth` (5.4).
- Zmiana zależności względem listy: dodane WEB-005 i WEB-006 (akcje „Przypisz z firmy” i „Zaproś osobę” to ich komponenty).
