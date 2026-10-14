---
id: WEB-018
title: "Wyświetlacz: odporność i stany"
area: web
stage: 5
size: M
status: todo
depends_on: [WEB-016]
decisions: []
owner:
branch:
trello:
---
# WEB-018 · Wyświetlacz: odporność i stany

## Cel
Telewizor działa tygodniami bez dotykania: przy braku sieci albo błędzie serwera zostaje ostatni stan z informacją, od kiedy nie ma połączenia; po długiej awarii sam się przeładowuje; przy wielu boksach przełącza strony; ma czytelne ekrany startu bez sieci, wylogowania i blokady konta. Widok jest sprawdzony wizualnie w 1080p i 4K i nie zawiera danych osobowych.

## Kontekst
- **Stan kodu:** `DisplayScreen`, `usePolledBoard` (czas ostatniej udanej odpowiedzi) z WEB-016, wybór hali z WEB-017; sesja ze statusem `blocked` i znacznikiem „wylogowano zdalnie” oraz trasa `/blocked` z WEB-001; strona logowania `screens/LoginScreen.tsx`.
- **Dokumenty:** docs/development-szczegoly.md 3.5.4 (przy błędzie ostatni stan z paskiem „Brak połączenia od HH:MM” i „ostatnia aktualizacja HH:MM:SS”; po dłuższej awarii `location.reload()`; przy wielu boksach kafle skrócone, potem strony co 20 s; przesunięcie układu o 1–2 px co kilka minut), 4.1 „widok wyświetlacza” (regresja wizualna 1920×1080 i 3840×2160), 4.2 „Wyświetlacz bez danych osobowych”, 4.3.2 W-17, W-20, W-21, W-22, W-24; 5 pkt 20. docs/mikroserwisy.md 3.7 (`access_revoked` → ekran blokady, ponowienie co 5 min; po odblokowaniu `session_revoked` → logowanie).
- **Makiety:** makiety-plan.md F: „WyswietlaczOffline” (pasek „uwaga” „Brak połączenia od 07:05 · dane z 07:04:52”, zegar lokalnie, pasek pilnych zostaje, kafle bez wyszarzenia), „WyswietlaczStart” (znak, zegar, „Łączenie z serwerem…”, po minucie „Brak połączenia”), „WyswietlaczZablokowany” (znak, nazwa stajni, zegar, kłódka, „WYŚWIETLACZ ZABLOKOWANY”, bez objaśnień), „WyswietlaczWylogowany” (strona logowania z paskiem „uwaga” „Wylogowano o 06:40”, bez danych stajni), „WyswietlaczDuzoBoksow” (3 hale po 20 boksów, „strona 1 z 2 · zmiana co 20 s”, pasek pilnych zawsze na górze).
- **Decyzje:** brak.
- **Dane demo:** „Telewizor korytarz” (Pod Lipami); fixture 3 hale × 20 boksów (propozycja); dane-kanarki do skanu PII (helper z BE-042).

## Zakres
- [ ] Pasek offline: po pierwszym nieudanym odpytaniu (błąd sieci, 500, 503, przekroczony czas 8 s) pasek „Brak połączenia od HH:MM · dane z HH:MM:SS”; dane i pasek pilnych zostają, zegar liczony lokalnie z ostatniego przesunięcia; po udanej odpowiedzi pasek znika. Nigdy biały ekran.
- [ ] Przeładowanie po awarii: gdy przerwa trwała dłużej niż 15 min (propozycja), `location.reload()` dopiero po pierwszym udanym odpytaniu (żeby nie załadować strony błędu przeglądarki).
- [ ] Stronicowanie: gdy kafle po skróceniu (numer z halą, koń, flaga) nie mieszczą się w oknie, podział na strony przełączane co 20 s z „strona 1 z 2 · zmiana co 20 s”; pasek pilnych i nagłówek zawsze widoczne; liczenie przez pomiar układu (`ResizeObserver`).
- [ ] Anty-retencja: co 5 min przesunięcie całego układu o 1–2 px w cyklu (klasa CSS, bez stylów inline w HTML).
- [ ] `WyswietlaczStart`: zimny start bez sieci (pierwsze `init()` sesji nie odpowiada): znak, zegar z urządzenia, „Łączenie z serwerem…”, po 60 s „Brak połączenia”; ponawianie co 10 s.
- [ ] `/blocked` dla TV (WyswietlaczZablokowany): znak, nazwa stajni (ostatnia znana z `GET /me` zapamiętana w `localStorage` `eq.display.stableName`, w try/catch; bez niej sam znak), zegar, kłódka, „WYŚWIETLACZ ZABLOKOWANY”; bez flag; ponowienie odświeżenia co 5 min (sesja z WEB-001).
- [ ] WyswietlaczWylogowany: na stronie logowania pasek „uwaga” „Wylogowano o HH:MM”, gdy sesja skończyła się zdalnie (`session_revoked`), bez danych stajni i słowa „wyświetlacz”; po zalogowaniu powrót do zapamiętanego widoku (WEB-017).
- [ ] Regresja wizualna: Playwright `toHaveScreenshot` dla widoku wszystkich hal i pełnego ekranu każdej hali w 1920×1080 i 3840×2160 (`deviceScaleFactor: 2` przy 1920×1080 albo okno 3840×2160), oraz offline, start, blokada; zrzuty wzorcowe w repo, generowane na Chromium w CI.
- [ ] Skan PII: test odpowiedzi atrapy i HTML strony na kanarki (nazwiska, telefony, e-maile z fixture'u) oraz wzorce E.164 i e-mail (wspólny helper z BE-042, skopiowany do `frontend/e2e/helpers/pii.ts` bez importu z `backend/`).

## Poza zakresem
- Stan „stajnia zawieszona” (WEB-025); system i przeglądarka na Pi, watchdog, restart Chromium (WEB-019); testy na sprzęcie W-01…W-29 (stanowisko Dawida).

## Kryteria akceptacji
- [ ] W-20/W-21: `context.setOffline(true)` → po ≤ 10 s pasek „Brak połączenia od …”, dane zostają; atrapa 500/503/opóźnienie 10 s daje ten sam pasek; po powrocie sieci pasek znika; po przerwie > 15 min strona przeładowuje się raz po powrocie sieci.
- [ ] W-22: seria 304 nie zmienia DOM (MutationObserver w teście).
- [ ] WyswietlaczDuzoBoksow: 3 hale × 20 boksów w 1920×1080 dają strony co 20 s (`page.clock`), pasek pilnych na każdej stronie.
- [ ] A-24: blokada konta → w ≤ 5 min ekran „WYŚWIETLACZ ZABLOKOWANY” bez flag; po odblokowaniu → logowanie z paskiem „Wylogowano o …”.
- [ ] W-24: brak przewijania i ucinania w 1280×720, 1920×1080 i 3840×2160 przy flagach we wszystkich 14 boksach.
- [ ] Skan PII nie znajduje kanarków ani wzorców w DOM i odpowiedziach.

## Testy
- Vitest: logika stanów połączenia (sztuczny zegar), decyzja o przeładowaniu, podział na strony (czysta funkcja z wymiarami).
- Playwright projekt `tv`: kryteria wyżej, zrzuty wzorcowe; `npm run e2e -- --project=tv`.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; zrzuty wzorcowe w repo; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- `localStorage` tylko na wygody (nazwa stajni, widok); strona musi działać bez niego.
- Po wylogowaniu, blokadzie i zawieszeniu nie pokazujemy starych flag (makiety-plan.md 2.3 „Urządzenia i prywatność”): przy `blocked` czyścić dane tablicy z pamięci.
