---
id: WEB-014
title: Ustawienia stajni
area: web
stage: 2
size: L
status: todo
depends_on: [BE-024, BE-028, BE-030, WEB-004]
decisions: [DEC-03, DEC-21]
owner:
branch:
trello:
---
# WEB-014 · Ustawienia stajni

## Cel
Admin konta ustawia stajnię w jednym ekranie: czy flagi wymagają potwierdzenia, które usługi działają (derki, moczenie paszy, szablony flag, szybkie przyciski obsługi) i co widzi każda rola (macierz widoczności). Jedno „Zapisz” zapisuje zmiany w trzech serwisach, a częściowy zapis albo konflikt są jasno komunikowane.

## Kontekst
- **Stan kodu:** zaślepka `/stables/$stableId/settings` (WEB-004), `Switch`, `Checkbox` (`aria-disabled`), `useEditable`, `ConfirmDialog`, `Toast`.
- **Dokumenty:** docs/development-szczegoly.md 3.5.3 „Ustawienia stajni” (sekcje, zapis z `If-Match` do `stables`, `auth`, `operations`, obsługa 412, przełączniki i checkboxy z rolami ARIA), 4.1 „Ustawienia stajni”, 5 pkt 48. docs/mikroserwisy.md 3.8 (zmiana macierzy działa do 5 min). BE-030: `GET`/`PATCH /stables/v1/stables/{stableId}/settings` (`flagsRequireAck`, `soakEnabled`, `tidyEnabled`, `mealServedEnabled`, `paddockOutEnabled`, …; `ETag` z `version`). BE-028: `GET /operations/v1/stables/{stableId}/flag-templates?locale=` (admin widzi też nieaktywne), `PATCH …/flag-templates/{templateId}` (`{ active }`, `If-Match`). BE-024: `GET`/`PUT /auth/v1/stables/{stableId}/role-features` (macierz 5 ról × 7 funkcji, `ETag` = skrót, `422 feature_not_applicable` dla tabletu z `tasks`/`box_history`).
- **Makiety:** mockups/project/PanelUstawieniaStajni.dc.html, PanelUstawieniaBrzozowa.dc.html, PanelUstawieniaBezAkcji.dc.html: H1 „Ustawienia · Stajnia Pod Lipami”, „Zapisz”; „Usługi”: „Potwierdzenia — Flagi wymagają potwierdzenia”, „Opieka — Derki, Moczenie paszy”, „Flagi — Bez śniadania, Bez kolacji, Nie na padok, Wet, Leki”, „Szybkie przyciski obsługi — Boks gotowy, Posiłek, Padok”; „Widoczność per rola”: wiersze „Flagi, Plan karmienia, Szybkie akcje i ich stan, Historia boksu, Zadania, Zdrowie i wizyty, Jazdy”, kolumny „Klient, Obsługa, Instruktor” i „Konta techniczne: Tablet, Wyświetlacz” (Tablet: Zadania i Historia boksu nieaktywne). makiety-plan.md B „PanelUstawieniaZapis” (dialog Derki, „Zapisano ustawienia, flag nie. Spróbuj ponownie.”, 412 „Ustawienia zmienił ktoś inny, odśwież”).
- **Decyzje:** DEC-03 A (macierz w tokenie: zmiana działa po odświeżeniu, do 5 min). DEC-21 A (wyłączony szablon: trwające flagi obowiązują do końca okna, znika kafelek).
- **Dane demo:** Pod Lipami (wszystko włączone, macierz z docs/mikroserwisy.md 3.3), Brzozowa (potwierdzenia wyłączone, bez Derki, moczenia i padoku; pusta kolumna Wyświetlacz), wariant BezAkcji (Pod Lipami bez Boks gotowy, Posiłek, Padok).

## Zakres
- [ ] `web/src/features/settings/StableSettingsScreen.tsx` na `/stables/$stableId/settings` (zakładka „Ustawienia stajni”; zakładki „Ogólne” i „Słowniki” dokłada WEB-022): trzy zapytania (settings, flag-templates, role-features), każde z własnym `ETag`; stan formularza lokalny, „Zapisz” aktywne przy zmianach, ostrzeżenie przy opuszczaniu z niezapisanymi zmianami.
- [ ] Mapowanie: „Flagi wymagają potwierdzenia” → `flagsRequireAck`; „Derki” → szablon `derka`; „Moczenie paszy” → `soakEnabled`; „Bez śniadania”, „Bez kolacji”, „Nie na padok”, „Wet”, „Leki” → szablony `bez_sniadania`, `bez_kolacji`, `nie_na_padok`, `wet`, `leki`; „Boks gotowy”, „Posiłek”, „Padok” → `tidyEnabled`, `mealServedEnabled`, `paddockOutEnabled`. Etykiety szablonów z odpowiedzi (`locale=pl`).
- [ ] Macierz: funkcje `flags`, `feeding_plan`, `routine`, `box_history`, `tasks`, `health`, `rides` × role `client`, `staff`, `instructor`, `tablet`, `display`; komórki tabletu `tasks` i `box_history` z `aria-disabled` i bez zaznaczenia; dopisek „Admin widzi wszystko” przy tabeli; obsługa klawiaturą (strzałki w siatce, Space).
- [ ] „Zapisz”: zmienione części po kolei: `PATCH settings` → `PATCH flag-templates/{id}` dla każdej zmiany → `PUT role-features`, każde z `If-Match`. Sukces wszystkich: toast „Zapisano.”. Częściowy błąd: komunikat, co się zapisało, a co nie (np. „Zapisano ustawienia, flag nie. Spróbuj ponownie.”), formularz trzyma niezapisane zmiany i ponawia tylko je. 412 w dowolnej części: „Ustawienia zmienił ktoś inny, odśwież” z „Odśwież” (zachowuje niezapisane zmiany pozostałych części).
- [ ] Wyłączenie aktywnego szablonu (np. Derki): `ConfirmDialog` „Wyłączyć Derkę? Trwające flagi zostaną do końca okna, zniknie tylko kafelek.” (listę trwających flag dokłada WEB-015).
- [ ] Tylko admin konta i `plt`: inni nie widzą zakładki (WEB-004), API 403; obiekt innej stajni 404.

## Poza zakresem
- Ustawienia ogólne (eskalacje, autor flagi, pory, okno APK) i słowniki (WEB-022); reguły powiadomień po założeniu (WEB-022); lista trwających flag w dialogu (WEB-015); szablony flag z godzinami (P3, PanelSzablonyFlag).

## Kryteria akceptacji
- [ ] Stan przełączników i macierzy Pod Lipami i Brzozowej zgodny z seedem i makietami; w Brzozowej Derka, moczenie i padok wyłączone, kolumna Wyświetlacz pusta.
- [ ] A-19: wyłączenie Derki i zapis → przy następnym odczycie szablon nieaktywny; włączenie z powrotem przywraca.
- [ ] A-21: odznaczenie klientowi „Plan karmienia” zapisuje macierz; w kolumnie Tablet „Zadania” i „Historia boksu” nie da się zaznaczyć.
- [ ] Zmiana w Pod Lipami nie zmienia Brzozowej; 412 z równoległej zmiany pokazuje komunikat; wymuszony błąd `PUT role-features` daje komunikat częściowego zapisu.
- [ ] A-20: wyłączenie „Flagi wymagają potwierdzenia” zapisuje się bez dodatkowych pytań.
- [ ] Bez opisów trybów i dopisków (docs/makiety-plan.md 2.3 i 5 pkt 38); przełączniki z `role="switch"` i etykietami, 390 px bez poziomego przewijania.

## Testy
- Vitest: diff formularza → lista żądań, częściowy zapis i ponowienie, 412, macierz z komórkami nieaktywnymi, dialog Derki.
- Playwright na atrapie: Pod Lipami i Brzozowa (zrzuty vs PanelUstawieniaStajni/Brzozowa), wyłączenie Derki, 412.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-024/BE-028/BE-030; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- „Woda” nie ma przełącznika (ustawienie boksu, WEB-012).
- Bez kolumny Wsparcia IT i bez wiersza diagnostyki (docs/makiety-plan.md 5 pkt 19).
- Kolejność zapisu stała, żeby komunikat częściowego zapisu był przewidywalny.
