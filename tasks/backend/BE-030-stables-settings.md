---
id: BE-030
title: "stables: ustawienia stajni, features, reguły powiadomień"
area: backend
stage: 2
size: M
status: todo
depends_on: [BE-029]
decisions: [DEC-20]
owner:
branch:
trello:
---
# BE-030 · stables: ustawienia stajni, features, reguły powiadomień

## Cel
Admin konta zmienia „Ustawienia stajni” (potwierdzenia flag, usługi, szybkie przyciski, progi eskalacji, okno instalacji APK) i reguły powiadomień, a każda aplikacja jednym wywołaniem `GET …/features` wie, co pokazać danej roli w tej stajni. Zmiana działa przy najbliższym odpytaniu, bez zdarzeń.

## Kontekst
- Stan kodu: serwis `stables` z BE-029 (`backend/src/services/stables/`, `contracts/stables.ts`); tabele `stable_settings` (kolumny z `docs/erd.md`), `notification_rules`; `flag_templates` (BE-028, czytane jako dane zasobu); `stableFeatures(settings, activeTemplates, features, role)` w `lib/rules/features.ts` (BE-007); `If-Match` i polityka (BE-006).
- Dokumenty: `docs/mikroserwisy.md` 5.3 (tabela tras: `GET`, `PATCH …/settings` z `If-Match` admin; `GET …/features` każda rola w stajni; `GET`, `PUT …/notification-rules` admin), 5.3 „Czyta: flag_templates”; `docs/development-szczegoly.md` 3.3 stables („Ustawienia z If-Match”, „Ustawienia stajni”: tylko admin konta, obsługa i konta techniczne 403, osoba bez dostępu i admin innej firmy 404; „Zapisz” w panelu to trzy żądania: `stables`, `operations`, `auth`), 3.1.12 (`stableFeatures`); `docs/erd.md` pkt 16 (przełączniki, wyłączona opcja znika razem ze stanem), pkt 17 (reguły).
- Makiety: `PanelUstawieniaStajni.dc.html`, `PanelUstawieniaBrzozowa.dc.html` (Potwierdzenia: „Flagi wymagają potwierdzenia”; Opieka: Derki, Moczenie paszy; Szybkie przyciski obsługi: Boks gotowy, Posiłek, Padok), `PanelUstawieniaBezAkcji.dc.html`; „PanelUstawieniaOgolne” z planu (`docs/makiety-plan.md` B: progi, `author_display`, `owner_edits_feeding`, `rides_enabled`, okno APK).
- Scenariusze: A-19 (wyłączenie Derki i usług), A-20 (przełącznik potwierdzeń nie zmienia trwających flag), A-17 (konfiguracja per stajnia).
- Decyzje: DEC-20 (słownik reguł z `health_due`, `payment_overdue`).
- Dane demo: Pod Lipami (wszystko włączone), Brzozowa (bez potwierdzeń, moczenia, padoku), Ola i Paweł (obsługa), Anna (klient), tablet.

## Zakres
- [ ] `GET /stables/v1/stables/{stableId}/settings` (admin; `ETag` z `version`) i `PATCH …/settings` (admin, `If-Match`, audyt zmian pól): `flagsRequireAck`, `soakEnabled`, `tidyEnabled`, `mealServedEnabled`, `paddockOutEnabled`, `warnOffsetMin`, `notifyOffsetMin`, `lateMarginMin`, `authorDisplay` (`role | initial | name`), `ownerEditsFeeding`, `ridesEnabled`, `maintenanceFrom`, `maintenanceTo` (walidacja zakresów, np. offsety 0–240 min, propozycja).
- [ ] `GET …/features` (każda rola w stajni, także tablet i wyświetlacz): wynik `stableFeatures` dla roli z tokenu (`m[].r`, `m[].f`; admin i `plt`: wszystko) i aktywnych szablonów z `flag_templates` (etykiety w języku z `?locale=`); `ETag` = skrót treści, `If-None-Match` → 304 (apka odpytuje).
- [ ] `GET`, `PUT …/notification-rules` (admin, `If-Match` na skrócie zestawu, audyt): pełna lista kombinacji (zdarzenie × odbiorca × kanał) z `enabled`; kombinacje niedozwolone (płatności dla obsługi) → 422.
- [ ] Uprawnienie admina konta: obsługa, klient, instruktor, tablet, wyświetlacz → 403 `forbidden_role`; Paweł w Pod Lipami i admin Olszynki → 404.
- [ ] Moduł seedu: ustawienia Brzozowej i wariant BezAkcji jako przełącznik seedu (`--variant=bez-akcji`: `tidy`, `mealServed`, `paddockOut` = `false` w Pod Lipami), jeśli BE-011 tego nie robi.

## Poza zakresem
- Włączanie szablonów flag (`operations`, BE-028) i macierz widoczności (`auth`, BE-024); skutki ustawień w zapisach (`409 option_disabled` w BE-034, BE-043, BE-044) i w `board` (BE-033 i dalej); ekrany (WEB-014, WEB-022).

## Kryteria akceptacji
- [ ] Damian wyłącza w Pod Lipami „Padok”: `GET …/features` Oli w Pod Lipami nie ma przycisku padoku, w Brzozowej bez zmian (zmiana jednej stajni nie rusza drugiej).
- [ ] `PATCH` ze starym `If-Match` → 412; bez → 428; wartości spoza zakresu → 422.
- [ ] Tablet w Brzozowej: `features` bez trybu potwierdzeń, bez moczenia, bez padoku, bez `tasks` i `box_history`.
- [ ] Drugi `GET …/features` z `If-None-Match` bez zmian → 304.

## Testy
- `backend/src/services/stables/settings.test.ts` na harnessie z seedem: uprawnienia (macierz ról), `If-Match`, `features` dla każdej roli w obu stajniach, 304, reguły. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- `stableFeatures` liczy `lib/rules` (jedno źródło); trasa tylko składa wejście.
- `stables` czyta `flag_templates` jako dane zasobu, a rolę i funkcje bierze z tokenu; nie czyta `stable_role_features` (W2, DEC-03).
- Przełącznik `flagsRequireAck` dotyczy tylko nowych flag (kopia w `horse_flags.requires_ack`, BE-034).
