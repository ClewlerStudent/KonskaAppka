---
id: WEB-022
title: Ustawienia ogólne i słowniki
area: web
stage: 6
size: M
status: todo
depends_on: [BE-030, BE-043, WEB-014, WEB-009]
decisions: [DEC-20]
owner:
branch:
trello: https://trello.com/c/9B9yifRq
---
# WEB-022 · Ustawienia ogólne i słowniki

## Cel
Admin zmienia pozostałe ustawienia stajni, które nie mieszczą się na ekranie „Ustawienia stajni”: nazwę i strefę, progi eskalacji, sposób podpisu autora flagi na tablecie, edycję planu karmienia przez klienta, jazdy, pory posiłków, reguły powiadomień i okno aktualizacji tabletów; a w słownikach pasze i padoki używane w planach.

## Kontekst
- **Stan kodu:** ekran ustawień z zakładką „Ustawienia stajni” (WEB-014, `web/src/features/settings/`), `NotificationRulesTable` z kreatora (WEB-009), `useEditable`, `TimeField`, `Select`, `Switch`, `DataTable`.
- **Dokumenty:** docs/development-szczegoly.md 3.5.3 (ekrany bez makiet: progi eskalacji, słowniki, sloty, okno APK). BE-030: `GET`/`PATCH /stables/v1/stables/{stableId}/settings` (`warnOffsetMin`, `notifyOffsetMin`, `lateMarginMin`, `authorDisplay` `role | initial | name`, `ownerEditsFeeding`, `ridesEnabled`, `maintenanceFrom`, `maintenanceTo`; walidacja zakresów), `GET`/`PUT …/notification-rules` (`If-Match`, 422 dla niedozwolonych kombinacji); BE-029: `PATCH /stables/v1/stables/{stableId}` (`{ name?, timezone? }`, `If-Match`); BE-028: `GET`/`PUT /operations/v1/stables/{stableId}/meal-slots` (zmiana pory = zamknięcie starej i nowa; `HH:MM`, `daysMask` 1–127); BE-043: `GET`/`PUT …/feeds` i `…/paddocks` (pełna lista z `id` od klienta, `If-Match`; nazwa unikalna → 409; pasza użyta w planie tylko `active = false`; padok użyty w planie → 409).
- **Makiety:** brak plansz; opisy w docs/makiety-plan.md B „PanelUstawieniaOgolne” (nazwa i strefa; „Eskalacje”: ostrzeżenie na tablicy 30 min, powiadomienie admina 15 min; „Powiadomienia” jak w kreatorze; „Autor flagi na tablecie”: rola, inicjał albo imię; „Klient edytuje plan karmienia”; „Jazdy”; pory 06:30, 12:00, 18:00; „Okno instalacji aktualizacji tabletów”; stan 412) i „PanelSlowniki” (zakładki Pasze | Padoki | Ujeżdżalnie; pasze z rodzajem `feed | supplement | medicine` i jednostką `kg | g | miarka | szt`; „+ Dodaj”; pozycja użyta w planach tylko „Wyłącz”; 412; nowa stajnia ze słownikami domyślnymi). Wygląd jak PanelUstawieniaStajni.dc.html.
- **Decyzje:** DEC-20 A (reguły `health_due` i `payment_overdue` w tabeli powiadomień).
- **Dane demo:** Pod Lipami (`warn_offset_min = 30`, `notify_offset_min = 15`, pory 06:30/12:00/18:00, pasze: owies, siano, suplement X, wysłodki, sieczka, musli; padoki A i B), Brzozowa.

## Zakres
- [ ] Zakładki w `/stables/$stableId/settings`: „Ustawienia stajni” (WEB-014) | „Ogólne” | „Słowniki” (trasy `…/settings/general`, `…/settings/dictionaries`).
- [ ] „Ogólne” (`GeneralSettingsScreen.tsx`), sekcje z osobnym „Zapisz” i własnym `If-Match`: „Stajnia” (nazwa, strefa → `PATCH /stables/{id}`); „Eskalacje” (minuty do ostrzeżenia na tablicy i do powiadomienia admina, liczone od początku okna flagi); „Autor flagi na tablecie” (Rola | Inicjał | Imię); „Klient edytuje plan karmienia” i „Jazdy” (`Switch`); „Okno instalacji aktualizacji tabletów” (od–do); „Pory posiłków” (tabela nazwa, godzina, dni, etykiety UA/EN, „Dodaj porę”, usunięcie → `PUT meal-slots`); „Powiadomienia” (`NotificationRulesTable` → `PUT notification-rules`).
- [ ] „Słowniki” (`DictionariesScreen.tsx`): zakładki „Pasze” (nazwa, rodzaj, jednostka, aktywna) i „Padoki” (nazwa, aktywny); „+ Dodaj” dodaje wiersz z `newId()`; zapis całej listy `PUT` z `If-Match`; pozycja użyta w planach: zamiast usunięcia „Wyłącz” (dla padoku 409 → „Padok jest w planie konia. Wyłącz go zamiast usuwać.”); 409 nazwy → komunikat przy polu.
- [ ] 412 w każdej sekcji: „Ustawienia zmienił ktoś inny, odśwież” bez utraty zmian w innych sekcjach; tylko admin (inne role nie widzą zakładek).

## Poza zakresem
- Zakładka „Ujeżdżalnie” (`schedule …/arenas`, BE-048, etap 7): osobne zadanie WEB-029; szablony flag z domyślnymi godzinami (P3, PanelSzablonyFlag); zmiana planów konia (apka, MOB-019).

## Kryteria akceptacji
- [ ] Zmiana progu powiadomienia admina z 15 na 20 min zapisuje się z `If-Match`; równoległa zmiana daje 412.
- [ ] Zmiana pory obiadu na 12:30 zapisuje nową porę (stara zamknięta), a TV i tablet pokazują nową godzinę przy następnym odczycie.
- [ ] Reguły powiadomień: płatności dla obsługi niedostępne; zapis zgodny z kreatorem.
- [ ] Słowniki: dodanie paszy „Marchew” (`feed`, `kg`); próba usunięcia padoku A (używany w planach) kończy się propozycją „Wyłącz”.
- [ ] Nowa stajnia ma słowniki domyślne z `operations`; 1440 i 390 px bez poziomego przewijania.

## Testy
- Vitest: formularze sekcji (walidacja minut, godzin, okna APK), diff słowników → body `PUT`, 409/412.
- Playwright na atrapie: zmiana progu, pory, dodanie paszy, 412.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-030/BE-043; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Bez języków tablicy (język ustawia każdy tablet) i bez dopisków pod polami.
- Zmiana zależności względem listy: dodane WEB-009 (tabela reguł powiadomień jest komponentem kreatora).
