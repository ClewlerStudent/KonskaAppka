---
id: TAB-016
title: "Ukryte ustawienia tabletu (konto, boks, język, sieć, diagnostyka, ekran)"
area: tablet
stage: 4
size: M
status: todo
depends_on: [TAB-003, TAB-011, TAB-007, TAB-015]
decisions: [DEC-18]
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/vJ0Q2npt
---
# TAB-016 · Ukryte ustawienia tabletu (konto, boks, język, sieć, diagnostyka, ekran)

## Cel
Osoba wdrażająca albo obsługa może bez narzędzi wylogować tablet, zmienić boks i język tablicy, podłączyć tablet do nowej sieci Wi-Fi, zajrzeć w stan urządzenia i przełączyć profil kolorów, ale nikt nie trafi w te ustawienia przypadkiem przy codziennej pracy.

## Kontekst
- **Stan kodu:** `BoardScreen` ze stopką „ONLINE · aktualne na …” (TAB-011, TAB-012), wylogowanie w sesji (TAB-009), lista boksów (TAB-010), język lokalny i profil palety (TAB-001), moduł kiosku z Wi-Fi (`listNetworks`, `scanNetworks`, `addNetwork`, zdarzenia stanu), baterią i `getStatus()` (TAB-002, TAB-003), plansza testowa K-01 (`tablet/src/gate/TestPattern.tsx`, TAB-007), blokada ekranu (TAB-015, przy blokadzie wejście nie działa).
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 „Ukryte ustawienia (długie przytrzymanie)”: KONTO („Tablety Pod Lipami · konto techniczne”, wylogowanie), BOKS („Hala główna · boks 7 · Kasztan”), JĘZYK TABLICY, SIEĆ (dodanie sieci Wi-Fi), DIAGNOSTYKA, EKRAN; bez wiersza stajni; język tablicy lokalny (przetrwa restart, APK i logowanie); profil palety: wybór po modelu z ręcznym przełącznikiem; 4.3.1 T-15 (zmiana sieci w kiosku, czas przywrócenia), K-01 (plansza testowa w ukrytych ustawieniach), 5 pkt 30 (kto zmienia sieć); `docs/erd.md` pkt 2 (ustawienia otwiera się dłuższym przytrzymaniem).
- **Makiety:** `mockups/project/TabletUstawienia.dc.html` („USTAWIENIA TABLETU”, „ZAMKNIJ”; wiersze z czarną linią: „KONTO TECHNICZNE · Tablety Pod Lipami · WYLOGUJ”, „BOKS · Hala główna · boks 7 · Kasztan · ZMIEŃ BOKS”, „JĘZYK TABLICY · Polski · ZMIEŃ”, „SIEĆ · Stajnia-PodLipami · ZMIEŃ SIEĆ”, „DIAGNOSTYKA · Bateria 82 % · sygnał dobry · OTWÓRZ”, „EKRAN · Profil kolorów: Kaleido 3 · PLANSZA TESTOWA”, stopka „Wersja 1.0.3”); stany z `docs/makiety-plan.md` E: dialog „WYLOGOWAĆ TABLET?” z „WYLOGUJ” i „ANULUJ”, bez zalogowanego konta tylko SIEĆ i DIAGNOSTYKA; TabletWifi („ZMIEŃ SIEĆ”, „ANULUJ”, lista sieci z „POŁĄCZONO”, hasło z klawiaturą QWERTY i „pokaż hasło”, WPA2/WPA3, „POŁĄCZ”; stany: łączenie, złe hasło z ramką 4 px `t-warn`, połączono „odpytanie HH:MM OK”, sieć bez internetu).
- **Decyzje:** DEC-18 A: wejście przytrzymaniem 5 s samego tekstu „ONLINE · aktualne na …” w stopce (nie przycisków PL | UA), Wi-Fi zmienia każdy na PoC.
- **Dane demo:** konto „Tablety Pod Lipami”, boks HG 7, sieć emulatora `AndroidWifi`.

## Zakres
- [ ] Wejście: `LongPressArea` na tekście stopki, 5 s stabilnego przytrzymania (bez wizualnego licznika poza ostatnią sekundą, bez etykiety); nie działa przy blokadzie ekranu i przy otwartym pop-upie; działa też na ekranach logowania i wylogowania (wtedy tylko SIEĆ i DIAGNOSTYKA).
- [ ] `SettingsScreen` (`tablet/src/screens/settings/`): wiersze 80 px z czarną linią jak na makiecie; KONTO z nazwą konta z `GET /me` i „konto techniczne”, „WYLOGUJ” → dialog „WYLOGOWAĆ TABLET?” → wylogowanie z TAB-009 (boks i język zostają); BOKS → `ChangeBoxScreen` (TAB-010); JĘZYK TABLICY → wybór Polski/Українська (zapis lokalny, ten sam co przełącznik PL | UA w stopce); SIEĆ → `WifiScreen`; DIAGNOSTYKA (skrót: bateria i sygnał) → `DiagnosticsScreen` (wersja podstawowa: model, firmware, wersja APK i `versionCode`, Device Owner, Lock Task, boks z `id`, SSID i RSSI, ostatnie odpytanie, niewysłane, bateria; pełna wersja: TAB-020); EKRAN: „Profil kolorów: Kaleido 3 | Gallery 3 | automatycznie (według modelu)” i „PLANSZA TESTOWA” (`TestPattern` z TAB-007; jeśli TAB-007 jeszcze go nie dostarczył, utwórz go tutaj według opisu K-01 z TAB-007 i przenieś z `src/gate/` do `src/screens/settings/`); stopka „Wersja X.Y.Z”; „ZAMKNIJ” wraca do tablicy; automatyczne zamknięcie po 2 min bezczynności.
- [ ] `WifiScreen` (TabletWifi): lista z `scanNetworks()` i bieżąca sieć z „POŁĄCZONO”; wybór sieci → hasło z `QwertyKeyboard` (TAB-008) i „pokaż hasło”, typ WPA2/WPA3 z wyniku skanu; „POŁĄCZ” → `addNetwork`; stany: „ŁĄCZENIE…”, „ZŁE HASŁO” (`StatusField` uwaga), „POŁĄCZONO · odpytanie HH:MM OK” (po udanym odpytaniu `board`), „SIEĆ BEZ INTERNETU” (połączono, ale odpytanie nie przechodzi); stara sieć zostaje zapisana, dopóki nowa nie zadziała.
- [ ] Teksty PL i UA; ekran ustawień bez danych osobowych poza nazwą konta technicznego.

## Poza zakresem
- Pełna diagnostyka, wysyłka logów i bufor offline (TAB-020); logika Wi-Fi w Kotlinie (TAB-003).
- Uwierzytelnianie dostępu do ustawień i rola „Wsparcie IT” (po PoC; DEC-18 A: każdy na PoC).

## Kryteria akceptacji
- [ ] Przytrzymanie tekstu stopki 5 s otwiera ustawienia; 4 s, przytrzymanie PL | UA i przytrzymanie przy zablokowanym ekranie nie otwierają.
- [ ] „WYLOGUJ” z potwierdzeniem daje TabletWylogowany z wierszem „BOKS: …”; po ponownym logowaniu ten sam boks i język (A-25).
- [ ] Zmiana języka na UA w ustawieniach zmienia tablicę i zostaje po restarcie; stopka PL | UA pokazuje ten sam wybór.
- [ ] [ręcznie] Na emulatorze z DO: dodanie sieci przez `WifiScreen` przechodzi; złe hasło daje „ZŁE HASŁO” bez zawieszenia ekranu; po połączeniu „odpytanie HH:MM OK”.
- [ ] Przełączenie profilu kolorów zmienia pola `t-ok`/`t-warn`/`t-crit` od razu (jedno pełne odświeżenie) i zostaje po restarcie; „automatycznie” wraca do mapy model → profil.

## Testy
- Jest + RNTL: wejście przytrzymaniem (fałszywe timery), dialog wylogowania, wiersze przy braku konta, stany `WifiScreen` z atrapą modułu kiosku.
- [ręcznie] Emulator: flow Maestro `tablet/e2e/maestro/settings.yaml` (wejście, język, wylogowanie, Wi-Fi).

## Definicja gotowości
- `npm run check` w `tablet/` zielone; flow Maestro przechodzi [ręcznie]; zrzuty TabletUstawienia i TabletWifi w galerii; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Bez wiersza STAJNIA: konto tabletów ma jedną stajnię.
- Hasło Wi-Fi nie trafia do logów ani do diagnostyki.
- „Pokaż hasło” pokazuje znaki tylko do opuszczenia ekranu.
