---
id: WEB-017
title: WyswietlaczHala i wybór widoku
area: web
stage: 5
size: M
status: todo
depends_on: [WEB-016]
decisions: [DEC-14]
owner:
branch:
trello: https://trello.com/c/ai1qmBFv
---
# WEB-017 · WyswietlaczHala i wybór widoku

## Cel
Telewizor może pokazywać jedną halę na pełnym ekranie (większe kafle, tylko flagi tej hali, pozostałe hale jako liczby) i przełączać się między halami albo wrócić do wszystkich hal. Wybór pamięta przeglądarka telewizora, więc przetrwa restart, zanik prądu i ponowne logowanie.

## Kontekst
- **Stan kodu:** `DisplayScreen`, `usePolledBoard`, kafle i przycisk „Pełny ekran” z WEB-016 (`web/src/features/display/`).
- **Dokumenty:** docs/development-szczegoly.md 3.5.4 „WyswietlaczHala” (większe kafle i typografia, tylko flagi tej hali także w pasku pilnych, skrót pozostałych hal tylko liczbowy, przełącznik hal bez wracania do widoku wszystkich, „Wszystkie hale”), „WyswietlaczHalaBezAkcji”, wybór widoku w `localStorage` w try/catch, bez wiedzy serwera; bez zapisanego wyboru, przy niedostępnej pamięci albo gdy hala zniknęła lub jest wyłączona: wszystkie hale; 4.3.2 W-25 (strzałki i OK, widoczny fokus), W-29; 5 pkt 32. BE-042: `GET …/display?buildingId=` (`urgent` tylko tej hali, `otherBuildings` z liczbami; `buildingId` innej stajni albo nieaktywnej hali → 404).
- **Makiety:** docs/mockups/project/WyswietlaczHala.dc.html: „EQUENOR · Stajnia Pod Lipami · pełny ekran hali · Hala nowa”, pasek pilnych z Bellą, „Hala nowa · boksy 1–6 · 5 koni · 1 wolny · 1 niepotwierdzona”, przełącznik „Hala główna | Hala nowa | Wszystkie hale”, kafle 1–6, „Dziś w stajni” tylko tej hali; WyswietlaczHalaBezAkcji.dc.html (bez rutyny); makiety-plan.md F „WyswietlaczHalaGlowna” (przełącznik z `aria-current`).
- **Decyzje:** brak (DEC-14 jak w WEB-016).
- **Dane demo:** „Telewizor korytarz” na pełnym ekranie Hali nowej; Hala główna z flagą Kasztana (nie może się pojawić na ekranie Hali nowej).

## Zakres
- [ ] Stan widoku: `{ stableId, buildingId | null }` w `localStorage` pod `eq.display.view` (odczyt i zapis w try/catch); zapis przy „Pełny ekran”, zmianie hali i „Wszystkie hale”; po zalogowaniu innym kontem albo do innej stajni wybór ignorowany.
- [ ] Widok hali: `…/display?buildingId=<id>`; większe kafle i typografia; pasek pilnych tylko z tej hali; pasek „pozostałe hale” z liczbami (konie, flagi, niepotwierdzone) bez treści flag; „Dziś w stajni” z odpowiedzi.
- [ ] Przełącznik hal (lista z odpowiedzi, `aria-current` na bieżącej) i „Wszystkie hale”; przejście między halami bez wracania do widoku ogólnego.
- [ ] Odporność wyboru: odpowiedź 404 dla zapisanej hali albo brak hali w liście aktywnych → usunięcie wyboru i widok wszystkich hal bez komunikatu; wyjątek `localStorage` → wszystkie hale.
- [ ] Sterowanie klawiaturą i pilotem (CEC → strzałki i Enter): kolejność fokusu „Pełny ekran” sekcji → przełącznik → „Wszystkie hale”, widoczny fokus 3 px, Enter aktywuje; obsługa `KEY_OK` jako Enter, jeśli przeglądarka tak go zgłasza.
- [ ] Wariant BezAkcji wynika z odpowiedzi (brak rutyny); jedna hala: brak przełącznika i „Pełny ekran” (WEB-016).

## Poza zakresem
- Paski braku połączenia, stronicowanie, przesunięcie anty-retencja (WEB-018); rutyna w nagłówku hali (WEB-021); konfiguracja Pi (WEB-019).

## Kryteria akceptacji
- [ ] A-08/W-29: pełny ekran Hali nowej pokazuje Bellę w pasku pilnych, a flagi Kasztana nie ma nigdzie; Hala główna jest tylko liczbami.
- [ ] Przełącznik przechodzi na pełny ekran Hali głównej bez widoku wszystkich; „Wszystkie hale” wraca do sekcji z paskiem pilnych obu hal.
- [ ] Wybór przetrwa przeładowanie i nowy kontekst Playwright z tym samym profilem (`storageState`); wyczyszczony profil → wszystkie hale.
- [ ] Zapisana hala wyłączona albo usunięta w atrapie → po najbliższym odpytaniu wszystkie hale.
- [ ] `localStorage` rzucający wyjątek (nadpisany w teście) → wszystkie hale, bez błędu na ekranie.
- [ ] Całość obsługiwana strzałkami i Enter z widocznym fokusem.

## Testy
- Vitest: moduł stanu widoku (odczyt, zapis, wyjątki, inna stajnia), wybór po 404.
- Playwright projekt `tv`: W-29 (przeładowanie, nowy kontekst z `storageState`), przełącznik i „Wszystkie hale”, nawigacja klawiaturą, zrzuty pełnego ekranu obu hal.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Serwer nic nie wie o wyborze: żadnych zapisów do API; dwa telewizory na jednym koncie pamiętają różne hale.
- `localStorage` tylko jako wygoda przeglądarki (bez stanu, który musi przetrwać na serwerze).
