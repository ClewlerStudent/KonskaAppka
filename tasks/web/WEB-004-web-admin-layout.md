---
id: WEB-004
title: "Panel admina: układ i komponenty"
area: web
stage: 1
size: M
status: todo
depends_on: [WEB-001, WEB-003, BE-019]
decisions: [DEC-15]
owner:
branch:
trello: https://trello.com/c/MbyLg3D4
---
# WEB-004 · Panel admina: układ i komponenty

## Cel
Szkielet panelu admina konta firmy, na którym powstaną wszystkie ekrany stajni: nagłówek z przełącznikiem stajni i menu konta, nawigacja, oraz wspólne komponenty (tabele, formularze w panelu bocznym, przełączniki, dialogi, obsługa `If-Match` i 412). Dzięki temu kolejne zadania budują tylko treść ekranów.

## Kontekst
- **Stan kodu:** `frontend/web/src/components/AppLayout.tsx` (nagłówek z „Zalogowano” i „Wyloguj”), `Button`, `fields.tsx` (`TextField`, `PhoneField`, `PasswordField`, `SegmentedControl`), `Notice`, `Icon` (`src/theme/icons.ts`), `cx.ts`; CSS Modules; tokeny `frontend/src/theme/tokens.ts` i `theme.css` (`--eq-*`); klient API, `useApi`, sesja i `homePath` z WEB-001; trasa `/business` z WEB-003.
- **Dokumenty:** docs/development-szczegoly.md 3.5.3 (przełącznik stajni w nagłówku, `role="switch"`/`role="checkbox"` z klawiaturą, edycje z `If-Match` i 412, hala przy numerze, `crit-solid` z `on-crit` dla flagi krytycznej); docs/makiety-plan.md 2.3 „Nagłówki” (panel: „▾” tylko przy kilku stajniach, menu 240 px, formularz jako `aside role=dialog` z prawej, bez dzwonka), „Boks” („Hala nowa · boks 4”, w wąskich listach „Nowa 4”, przy jednej hali sam numer), „Teksty, bez objaśnień” (docs/makiety-plan.md 2.3 i 5 pkt 38); B „PanelMenuKonta”. docs/mikroserwisy.md 5.2 `POST /me/sign-out-everywhere` (BE-019).
- **Makiety:** nagłówek i nawigacja z mockups/project/PanelBoksy.dc.html, PanelPulpit.dc.html, PanelUstawieniaStajni.dc.html: „EQUENOR · Stajnia Pod Lipami ▾ · D Damian (admin) ▾” i menu „Pulpit | Boksy | Konie | Ludzie | Płatności | Ustawienia”; MapaNawigacjiRol.dc.html (Admin w panelu). PanelMenuKonta (P2, opis w makiety-plan.md B): „Damian · admin konta · Stajnie Lipowe sp. z o.o.”, telefon i e-mail zamaskowane, „Profil i język”, „Konto firmy”, „Stajnie firmy” (✓ przy bieżącej), „Załóż stajnię”, „Wyloguj”, „Wyloguj ze wszystkich urządzeń”.
- **Decyzje:** DEC-15 A (panel tylko admin konta i wyświetlacz).
- **Dane demo:** Damian (Pod Lipami z dwiema halami, Brzozowa z jedną), Kuba później w WEB-026 (ten sam układ z paskiem `[OPS]`).

## Zakres
- [ ] `web/src/layout/AdminLayout.tsx` dla tras `/stables/$stableId/*`: nagłówek (znak „EQUENOR”, nazwa stajni; „▾” z listą stajni firmy z `GET /me` tylko przy więcej niż jednej, zmiana zachowuje bieżącą sekcję i zapisuje `eq.panel.lastStableId`), nawigacja „Pulpit | Boksy | Konie | Ludzie | Płatności | Ustawienia” z `aria-current`, kontener 1280 px, wersja 390 px (menu zwijane, bez poziomego przewijania). Strażnik trasy: stajnia spoza `GET /me` → ekran „Nie ma takiej strony”; osoba bez roli admina → `homePath`.
- [ ] Trasy-zaślepki sekcji (każda z H1 i tytułem karty): `boxes`, `horses`, `people`, `billing`, `settings`; treść dają WEB-005, WEB-011, WEB-013, WEB-014, WEB-024.
- [ ] PanelMenuKonta (popover 320 px, fokus i Esc): pozycje jak wyżej; „Profil i język” → `/account` (zaślepka do WEB-007), „Konto firmy” → `/business` (WEB-003), „Załóż stajnię” → `/stables/new`, „Wyloguj ze wszystkich urządzeń” z dialogiem „Wyloguj ze wszystkich urządzeń?” → `POST /auth/v1/me/sign-out-everywhere`, potem wylogowanie lokalne.
- [ ] Komponenty w `web/src/components/`: `DataTable` (nagłówki, sekcje grup np. hal, wiersz pusty, na 390 px karty), `Toolbar` z `FilterChips` (licznik w chipie) i `SearchField`, `SidePanel` (`aside role="dialog"` z prawej, pułapka fokusu, Esc, powrót fokusu), `ConfirmDialog` (skutki w treści), `Switch` (`role="switch"`, Space/Enter), `Checkbox` (także `aria-disabled` z wyjaśnieniem dla czytnika), `RadioGroup`, `Select`, `DateField`, `TimeField`, `Toast`, `StatCard` (liczniki), `FlagPill` (warianty: krytyczna `crit-solid`/`on-crit`, uwaga, info; status „potwierdzona HH:MM” albo „niepotwierdzona” tylko przy `requiresAck`), `EmptyState`, `Skeleton`.
- [ ] Narzędzia: `boxLabel(box, buildingCount, { short })` („Hala nowa · boks 4”, „Nowa 4”, „boks 1”); `formatInStableTz(date, tz)` (Intl, „wt 13.10.2026, 07:15”); `useEditable` (pobiera `ETag`, wysyła `If-Match`; 412 → komunikat „Dane zmienił ktoś inny. Odśwież.” z przyciskiem „Odśwież”, 428 jako błąd programisty w konsoli dev).
- [ ] Atrapa API dla Playwright: `e2e/helpers/mock-api.ts` (`mockApi(page, { 'GET /board/v1/stables/:stableId/boxes-overview': fixture, … })`: przechwytuje trasy serwisów innych niż `auth` przez `page.route`, odpowiada JSON-em z `ETag`, obsługuje 304, 412 i opóźnienie; nieobsłużona trasa = błąd testu) i fixture'y widoków w `frontend/web/src/test/fixtures/` (stałe UUID z `fixtures/demo.ts` z WEB-001; Pod Lipami i Brzozowa), wspólne dla Vitest i Playwright. Z helpera korzystają WEB-005, WEB-011 i kolejne zadania panelu.
- [ ] Mapowanie kodów odmowy na komunikaty w `web/src/errors.ts`: `forbidden_role`, `feature_hidden`, `option_disabled`, `not_found`, `version_conflict`/412, `rate_limited`, `network_error`.

## Poza zakresem
- Treść sekcji (zadania WEB-005…WEB-027); profil (WEB-007); widok wyświetlacza (WEB-016, bez tego układu); pasek `[OPS]` (WEB-026).

## Kryteria akceptacji
- [ ] Damian widzi „▾” z Pod Lipami i Brzozową; przełączenie z `/stables/A/boxes` prowadzi do `/stables/B/boxes`; osoba z jedną stajnią widzi samą nazwę.
- [ ] `boxLabel`: przy dwóch halach „Hala nowa · boks 4”, przy jednej „boks 4”; test na obu stajniach z fixture'ów.
- [ ] `useEditable` przy 412 pokazuje komunikat i po „Odśwież” ładuje nowy `ETag`.
- [ ] „Wyloguj ze wszystkich urządzeń” wymaga potwierdzenia i kończy sesję na tym urządzeniu.
- [ ] Wszystkie komponenty obsługiwane klawiaturą; axe (Playwright `@axe-core/playwright` albo test ról ARIA) bez naruszeń krytycznych na zaślepkach.
- [ ] 390 px: brak poziomego przewijania na każdej zaślepce.

## Testy
- Vitest + Testing Library dla każdego komponentu (klawiatura, ARIA, stany) i narzędzi (`boxLabel`, `formatInStableTz` z nocą 25.10.2026, `useEditable` z 412).
- Playwright `e2e/panel.spec.ts`: nawigacja, przełącznik stajni, menu konta (atrapa API), zrzuty 1440 i 390.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Bez dzwonka i bez dopisków objaśniających; teksty tylko etykiety i komunikaty stanu.
- Nawigacja ma osobno „Boksy” i „Konie” (jak w plikach makiet), a nie „Boksy i konie”.
- Zmiana zależności względem listy: dodane WEB-003 (pozycja „Konto firmy” w PanelMenuKonta prowadzi do `/business` z WEB-003; admin istnieje dopiero po rejestracji firmy).
- Kolory tylko z `--eq-*`; liczby i godziny z klasą `eq-num` (`tabular-nums`).
- CSP panelu (`nginx/default.conf.template`, sprawdzane w `e2e/panel.spec.ts` na buildzie): bez `<style>` i atrybutów `style` w HTML, bez `innerHTML` (Trusted Types). Prop `style` w React idzie przez CSSOM i CSP go nie blokuje, ale kolory i tak tylko z tokenów.
