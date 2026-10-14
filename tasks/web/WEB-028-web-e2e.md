---
id: WEB-028
title: E2E panelu i TV w trzech przeglądarkach
area: web
stage: 9
size: M
status: todo
depends_on: [WEB-012, WEB-013, WEB-018, WEB-021, WEB-022, WEB-023, WEB-024, WEB-025, SH-002]
decisions: []
owner:
branch:
trello:
---
# WEB-028 · E2E panelu i TV w trzech przeglądarkach

## Cel
Jeden zestaw testów Playwright przechodzi przez panel i widok telewizora na pełnym stosie (prawdziwe serwisy, baza z seedem, broker, MinIO) w Chromium, Firefox i WebKit. To warunek gotowości panelu przed stajnią pilotażową i wkład do harnessu scenariuszy A-01…A-25 (SH-005).

## Kontekst
- **Stan kodu:** `frontend/playwright.config.ts` (projekty `desktop` 1440 i `phone` 390, Chromium, `webServer` dla `auth`, panelu i www, porty E2E 4110/5273/5274/5275), `e2e/auth.spec.ts`, `e2e/panel.spec.ts`, `e2e/www.spec.ts`, helpery `e2e/helpers/inbox.ts`, `mock-auth.ts`, `mock-api.ts` (WEB-005), `pii.ts` (WEB-018); projekty `tv` i `ops` z WEB-016/WEB-026. Środowisko lokalne z SH-002 (`docker compose` z bazą, brokerem, MinIO, Mailpit, fake-sms; `npm run setup` i `reset` z migracjami i seedem), `dev:webhook` w `billing` (BE-052), `npm run cron <nazwa> --now` (BE-009).
- **Dokumenty:** docs/development-szczegoly.md 4.1 „Panel web (Playwright: Chromium, Firefox, WebKit)” (Boksy i konie, dodawanie hali, konto firmy i zakładanie stajni, ustawienia z 412, płatności: podwójny webhook daje jedną płatność, brak płatności daje `suspended`; widok wyświetlacza: sztuczny zegar, `setOffline`, pełny ekran, `localStorage`, logowanie TV, jedna hala, sekcje według widoczności, nowa hala w ≤ 10 s, regresja wizualna), 4.4 (A-02, A-04, A-08, A-10, A-11, A-19, A-20, A-21, A-22, A-23, A-24), 3.2 (seed ze stałą datą wt 13.10.2026 07:15).
- **Makiety:** wszystkie plansze panelu i TV (zrzuty porównawcze już w testach WEB-0xx).
- **Decyzje:** brak.
- **Dane demo:** pełny seed (Pod Lipami, Brzozowa, Olszynka do izolacji), konta demo z hasłem `DEV_DEMO_PASSWORD`, kody z dev-inbox albo Mailpit/fake-sms (`GET /messages?to=`).

## Zakres
- [ ] `frontend/playwright.full.config.ts` i skrypt `npm run e2e:full`: `globalSetup` stawia stos (`docker compose --profile infra up -d` z SH-002, `npm --prefix ../backend run setup`, seed w trybie stałej daty), `webServer` dla serwisów `auth`, `stables`, `operations`, `board`, `notifications`, `billing`, `files`, `platform`, `schedule` (`serve:<serwis>`) i panelu; projekty `chromium`, `firefox`, `webkit` (1440) oraz `tv-chromium` (1920×1080); `globalTeardown` z `reset`.
- [ ] Helper kodów: odczyt kodu MFA i potwierdzenia z dev-inbox / Mailpit / fake-sms dla danego kontaktu.
- [ ] Scenariusze (`e2e/full/*.spec.ts`), każdy niezależny (reset danych przez `npm run db:seed` albo transakcyjne fixture'y z SH-002):
  - konto firmy i stajnia: rejestracja e-mailem z potwierdzeniem, logowanie hasłem i kodem, PanelWitaj, PanelRejestracjaFirmy (zajęty NIP: „Ten NIP ma już konto w EQUENOR”), PanelZalozStajnie (boksy 1–6, „Ustaw dla wszystkich”, jeden boks z poidłem ręcznym), PanelZalozPowiadomienia → PanelPulpitStart; druga stajnia bez rejestracji firmy (A-22, A-23);
  - Ludzie i zaproszenia: zaproszenie SMS (Obsługa) i e-mail (Wyświetlacz), filtr „Konta techniczne”, przypisanie Oli do Brzozowej, blokada konta TV (A-23, A-24);
  - Boksy i hale: liczniki, wyszukanie „4”, dodanie hali z boksami 1–4 i adresem skopiowanym, pusta hala i przeniesienie boksu, przełącznik poidła tylko u admina, Luna → „Hala nowa · boks 6” (A-04, A-10, A-11, A-16);
  - ustawienia: stan obu stajni, wyłączenie i włączenie Derki, 412 z dwóch kart, macierz (A-19, A-21), wyłączenie potwierdzeń przy niepotwierdzonej Belli (A-20);
  - płatności: podwójny webhook (`dev:webhook` dwa razy) daje jedną płatność; brak płatności + `npm run cron billing-dunning --now` → baner „Stajnia zawieszona” i TV „System nieaktywny w tej stajni”;
  - TV: logowanie kontem „Telewizor korytarz” (e-mail, hasło, kod), widok wszystkich hal (A-08), pełny ekran hali i `localStorage` po przeładowaniu, `context.setOffline` i pasek, nowa hala dodana w panelu widoczna w ≤ 10 s (`page.clock` albo realny czas z limitem), skan PII odpowiedzi i DOM (A-24).
- [ ] Raport: lista scenariuszy A-xx pokrytych automatycznie (plik `frontend/e2e/full/COVERAGE.md` albo sekcja w README), do wykorzystania przez SH-005.
- [ ] README frontendu: wymagania (Docker, przeglądarki: `PLAYWRIGHT_BROWSERS_PATH` albo `npx playwright install chromium firefox webkit`), uruchomienie `npm run e2e:full`, czas trwania.

## Poza zakresem
- Harness wszystkich scenariuszy A-01…A-25 przez apki i tablet (SH-005); testy na sprzęcie (W-xx); konfiguracja systemu CI (SH-003; tu tylko komenda).

## Kryteria akceptacji
- [ ] `npm run e2e:full` przechodzi w Chromium, Firefox i WebKit na czystym stosie (dwa przebiegi pod rząd bez ręcznego sprzątania).
- [ ] Każdy scenariusz z listy ma asercje na tekstach z makiet i na skutkach w API (np. liczba płatności, stan subskrypcji).
- [ ] Testy nie zależą od kolejności; flaki: 3 przebiegi z rzędu bez błędu.
- [ ] Brak żądań poza localhost w trakcie testów (nasłuch `page.on('request')`).

## Testy
- To zadanie samo jest testem: `cd frontend && npm run e2e:full` (lokalnie po `npm ci` w `backend/` i `frontend/` i z Dockerem).
- Szybkie E2E na atrapach (`npm run e2e`) zostają bez zmian i muszą dalej przechodzić.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` i `npm run e2e:full` we `frontend/` zielone; README i lista pokrycia A-xx zaktualizowane; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Stała data seedu (13.10.2026 07:15) po stronie serwerów; w przeglądarce `page.clock` ustawiony na ten sam moment, inaczej etykiety „dziś” się rozjadą.
- Infrastrukturę stosu (compose) dostarcza SH-002; nie dopisuj tu własnych kontenerów.
- Zmiana zależności względem listy: dodane WEB-012, WEB-013, WEB-022, WEB-025 (ekrany objęte testami) i SH-002 (pełny stos lokalny).
