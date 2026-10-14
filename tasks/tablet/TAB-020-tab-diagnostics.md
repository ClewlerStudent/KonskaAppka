---
id: TAB-020
title: Diagnostyka tabletu z buforem offline (TabletDiagnostyka)
area: tablet
stage: 9
size: M
status: todo
depends_on: [TAB-016, TAB-012, TAB-013, TAB-017]
decisions: [DEC-25]
needs: [emulator]
owner:
branch:
trello:
---
# TAB-020 · Diagnostyka tabletu z buforem offline (TabletDiagnostyka)

## Cel
Gdy tablet przy boksie zachowuje się dziwnie, osoba na miejscu widzi w ukrytych ustawieniach jego pełny stan (urządzenie, boks, sieć, czas, kolejka, bateria, EPD), a zespół EQUENOR dostaje logi i metryki, także z okresu bez sieci. Bez tabeli urządzeń w bazie: diagnostyka trafia tylko do logów i metryk.

## Kontekst
- **Stan kodu:** podstawowy `DiagnosticsScreen` w ukrytych ustawieniach (TAB-016), dane z modułu kiosku (`getStatus()`: DO, Lock Task, restrykcje, updater, restarty watchdoga; Wi-Fi: SSID, BSSID, pasmo, RSSI; bateria i temperatura; TAB-002, TAB-003), `epdInfo()` i licznik `full` (TAB-005), metryki odpytywania i offset zegara (TAB-012), licznik kolejki (TAB-013), znaczniki aktualizacji (TAB-004, TAB-017), wybór boksu (TAB-010).
- **Dokumenty:** `docs/development-szczegoly.md` 2.12 (diagnostyka tabletu z buforem offline: Wi-Fi, RSSI, BSSID, bateria, temperatura, pamięć, restarty, wybrany boks, wersja; bez tabeli urządzeń tylko logi i metryki; boks logujemy jako `id` i dla czytelności „Hala nowa · boks 4”; crashe JS i natywne z mapami źródeł i symbolami, w każdym zdarzeniu `versionCode`; maskowanie telefonów, e-maili, haseł, kodów i tokenów), 3.5.2 „Diagnostyka (2.12) z buforem offline”, 5 pkt 11 (ścieżka: zewnętrzna trasa z tokenem konta technicznego albo SDK narzędzia), 4.3.1 T-11 (czy diagnostyka w ogóle dociera do logów i metryk); `docs/erd.md` pkt 2 (bez telemetrii w bazie).
- **Makiety:** TabletDiagnostyka (`docs/makiety-plan.md` E): „DIAGNOSTYKA”, „← USTAWIENIA”, tabela 22 px z `tabular-nums`: URZĄDZENIE (Boox Note Air6 C, firmware, `ro.board.platform`, APK i `versionCode`, Device Owner TAK, Lock Task TAK), BOKS (Hala nowa · boks 5, id, Stajnia Pod Lipami), SIEĆ (SSID, BSSID, pasmo, RSSI −61 dBm, SNR, test portu 443 OK, ostatnie odpytanie 07:15:02), CZAS (różnica z serwerem +1 s, jakość „zsynchronizowany”), PRACA (niewysłane 0, bateria 78 % (limit 80 %), temperatura, restarty dziś 0, tryb EPD); „TEST POŁĄCZENIA”, „WYŚLIJ DIAGNOSTYKĘ”; stany: offline (wiersz sieci w `t-warn`), start bez sieci (jakość „nieznany”), tablet LCD bez EPD.
- **Decyzje:** DEC-25 A: SDK narzędzia błędów z buforem offline, narzędzie wybiera Dawid; na PoC lokalny ekran i bufor logów. Do wyboru narzędzia: adapter-zaślepka.
- **Dane demo:** tablet HN 5 (jak na makiecie), emulator LCD (`epdInfo().kind = 'lcd'`).

## Zakres
- [ ] `tablet/src/diagnostics/logger.ts`: logi strukturalne (JSON: czas serwera, `versionCode`, `boxId` + etykieta, poziom, zdarzenie, pola) do bufora pierścieniowego w SQLite (`diag_log`, limit np. 7 dni albo 5 MB, najstarsze usuwane); redakcja pól `password`, `code`, `token`, `refreshToken`, `authorization`, e-maili i telefonów (maskowanie jak w backendzie `kit/logger.ts`); test „hasło-kanarek”.
- [ ] Zdarzenia do logu: start apki (wersja, przyczyna: zwykły, po restarcie watchdoga, po aktualizacji), zmiana boksu, zmiana stanu sieci i sesji (bez tokenów), odrzucone zapisy z kolejki (TAB-013), wyniki aktualizacji, wywołania `epdRefresh('full')` z przyczyną (zagregowane co godzinę), błędy JS (`ErrorUtils.setGlobalHandler`) i natywne (moduł kiosku zapisuje ostatni crash do pliku, JS czyta go przy starcie).
- [ ] Metryki co 15 min do bufora (`diag_metrics`): RSSI, pasmo, liczba ponownych połączeń Wi-Fi, bateria, temperatura, stan ładowania, pamięć (PSS z `ActivityManager`, sterta JS), udział 304, błędy odpytań, opóźnienie odpowiedzi, niewysłane w kolejce, restarty watchdoga.
- [ ] `DiagnosticsScreen` (pełna wersja zgodna z makietą): sekcje URZĄDZENIE, BOKS, SIEĆ, CZAS, PRACA; „TEST POŁĄCZENIA” (`GET` tablicy bieżącego boksu z `If-None-Match`, czyli zwykłe odpytanie: kod odpowiedzi, czas, wynik TLS i DNS; `/livez` nie jest wystawione przez Ingress); stany offline (wiersz SIEĆ jako `StatusField` uwaga), „nieznany” czas, „EPD: brak (LCD)”.
- [ ] Wysyłka: interfejs `DiagnosticsSink` z implementacjami `local` (nic nie wysyła; eksport `adb pull` pliku JSONL z `filesDir/diagnostics/export-<data>.jsonl` po „WYŚLIJ DIAGNOSTYKĘ”) i szkieletem `sdk` (do podpięcia narzędzia wybranego przez Dawida: wysyła paczki z bufora, gdy jest sieć, i oznacza wysłane); wybór z `app.config.ts` (`extra.diagnosticsSink`), domyślnie `local`.
- [ ] Teksty PL i UA; liczby `tabular-nums`.

## Poza zakresem
- Wybór i konfiguracja narzędzia błędów (Dawid); trasa diagnostyki w `platform` (DEC-25 B, nie robimy).
- Długie testy ciągłe i raporty (TAB-021).

## Kryteria akceptacji
- [ ] [ręcznie] Ekran pokazuje wszystkie wiersze z makiety na emulatorze (z wartościami albo „brak danych”), w tym „EPD: brak (LCD)” i stan offline przy wyłączonej sieci.
- [ ] Bufor przetrwa restart i brak sieci; po przekroczeniu limitu usuwa najstarsze wpisy.
- [ ] W eksporcie nie ma haseł, kodów, tokenów ani pełnych e-maili i numerów (test z kanarkami).
- [ ] Wywołany celowo błąd JS i crash natywny (przycisk w buildzie dev) są w logu po ponownym starcie, z `versionCode`.

## Testy
- Jest: redakcja, bufor pierścieniowy, agregacja metryk, render ekranu w stanach z makiety.
- [ręcznie] Emulator: eksport po „WYŚLIJ DIAGNOSTYKĘ” i `adb pull`.

## Definicja gotowości
- `npm run check` w `tablet/` zielone; `tablet/docs/diagnostics.md` (co logujemy, gdzie leży bufor, jak go pobrać, jak podpiąć SDK); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Bez danych osobowych w diagnostyce: konto techniczne tylko z nazwy, bez e-maila.
- Boks zawsze jako `id` plus etykieta z halą; sam numer nie wystarcza.
- Diagnostyka nie może spowalniać odpytywania: zapisy do SQLite paczkami.
