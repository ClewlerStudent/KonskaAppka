---
id: TAB-005
title: "epdRefresh: odświeżanie e-ink w czterech implementacjach"
area: tablet
stage: 0
size: L
status: todo
depends_on: [TAB-001]
decisions: [DEC-30]
needs: [emulator, device]
owner:
branch:
trello:
---
# TAB-005 · epdRefresh: odświeżanie e-ink w czterech implementacjach

## Cel
Tablica na e-inku nie zostawia „duchów” odwołanej flagi ani kolorowych śladów pól statusu: każda zmiana pola koloru idzie jednym pełnym odświeżeniem w trybie z kolorem, a zegar i pasek ONLINE odświeżają się szybko w czerni i bieli. Jeden interfejs działa na Boox, innych e-inkach i na LCD (plan B), a na LCD jawnie mówi, że EPD nie ma.

## Kontekst
- **Stan kodu:** szkielet `tablet/` z TAB-001; osobny moduł natywny `tablet/modules/epd/` (niezależny od modułu kiosku z TAB-002, który powstaje równolegle).
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 „Odświeżanie EPD” (wspólny interfejs `epdRefresh(full|partial)` w czterech implementacjach: Onyx SDK; kontroler Onyx/Qualcomm jak w KOReader; refleksja dla RK3566; pełna klatka czarna i biała jako wariant awaryjny; „żadna implementacja nie może nic nie robić”; na kolorowym e-inku pole koloru zmienia się tylko przy zmianie statusu jednym pełnym odświeżeniem, zegar i ONLINE czarno-białe szybkim trybem; na LCD moduł wykrywa brak EPD jawnie i zapisuje w diagnostyce), „Onyx SDK” (repozytorium Maven tylko po HTTP: artefakty w lustrze albo w repo, Gradle dependency verification z sumami, `allowInsecureProtocol` najwyżej dla tego jednego repozytorium), 1.1 („Odświeżanie EPD”: `onyxsdk-device` 1.1.11, `EpdController`, przykład OnyxAndroidDemo; kontroler jak w KOReader: `koreader/android-luajit-launcher`, `app/src/main/java/org/koreader/launcher/device/`; Meebook RK3566: refleksja wzorem KOReader; pełne odświeżenie co najmniej raz na dobę), 4.3.1 T-21 (każda ścieżka EPD, „duchy”, kolorowe ślady), K-04 (dokładnie jedno pełne odświeżenie na zmianę pola koloru, log `epdRefresh(full)`), K-05 (A2 i DU gubią kolor; tryb apki w E-Ink Center na jakościowy).
- **Decyzje:** brak; czy Onyx SDK pozwala ustawić tryb dla fragmentu ekranu na Note Air6 C: [niepotwierdzone], sprawdza TAB-007.
- **Dane demo:** nie dotyczy (plansza testowa z polami `t-*`).

## Zakres
- [ ] Interfejs TS `tablet/src/epd/index.ts`: `epdRefresh(mode: 'full' | 'partial', region?: {x, y, w, h})`, `epdInfo(): { kind: 'onyx-sdk' | 'onyx-controller' | 'rk3566' | 'bw-frame' | 'lcd', colorPanel: boolean, regionSupported: boolean, details }`, `setDefaultMode('quality' | 'fast')`; każde wywołanie `full` zapisywane w liczniku i logu (`epd_full_total`, przyczyna) do diagnostyki (TAB-020) i K-04.
- [ ] Natywnie (Kotlin, `EpdController` w module): wybór implementacji przy starcie po `Build.MANUFACTURER`, `Build.MODEL`, `ro.board.platform` (odczyt przez `SystemProperties` refleksją) i próbie załadowania klas; kolejność: Onyx SDK → kontroler Onyx/Qualcomm → RK3566 → `bw-frame`; brak EPD (LCD) → `lcd`:
  - **Onyx SDK:** `com.onyx.android.sdk:onyxsdk-device` 1.1.11 (i wymagane `onyxsdk-base`), `EpdController.invalidate(view, UpdateMode.GC)` dla `full`, `UpdateMode.DU`/`A2` tylko dla regionów czarno-białych (`partial`), `EpdController.setViewDefaultUpdateMode`; artefakty AAR w repo w `tablet/vendor/maven/` (lokalne repozytorium Maven) z `gradle/verification-metadata.xml` (sumy SHA-256), bez pobierania po HTTP w buildzie;
  - **kontroler Onyx/Qualcomm:** refleksja na klasach systemowych Onyx, wzorem `koreader/android-luajit-launcher` (`device/epd/*`); przed skopiowaniem czegokolwiek sprawdź licencję tego repozytorium, a jeśli nie pozwala na użycie w zamkniętej apce, napisz własną implementację na podstawie nazw klas i wywołań;
  - **RK3566:** refleksja jak w KOReader dla urządzeń Rockchip (np. Meebook); tylko gdy klasa/metoda istnieje;
  - **`bw-frame`:** nakładka natywna na całe okno: klatka czarna, klatka biała, potem treść (dwa `invalidate` z odstępem jednej klatki); działa na każdym ekranie, także jako zapas, gdy wywołanie SDK rzuci wyjątek;
  - **`lcd`:** `full` = zwykłe `invalidate()` + wpis „EPD brak (LCD)” w diagnostyce; nie jest cichym pominięciem.
- [ ] Ustawienie trybu jakościowego dla naszego pakietu (odpowiednik E-Ink Center: HD/Regal, bez „Smooth Mode”), jeśli SDK to umożliwia; w przeciwnym razie instrukcja w `tablet/docs/epd.md` dla provisioningu (TAB-006, K-02/K-05).
- [ ] Hook `useEpdOnChange(key)` w `tablet/src/epd/`: gdy zmienia się „podpis koloru” ekranu (lista pól koloru i ich statusów, liczona przez ekrany w TAB-008/TAB-011), po renderze woła jedno `epdRefresh('full')`; zegar i pasek ONLINE wołają `partial` w swoim regionie; dobowy `full` (np. 03:00 czasu stajni) przez timer.
- [ ] Ekran deweloperski „EPD” (dostępny w buildzie dev i z planszy testowej TAB-007): przyciski `full`, `partial` region, pętla zmian `t-crit` → papier → `t-warn` → `t-ok`, licznik i czas trwania wywołań.
- [ ] `tablet/docs/epd.md`: która implementacja na którym modelu, jak zaktualizować artefakty Onyx (skąd, jak policzyć sumy, jak odświeżyć `verification-metadata.xml`), znane ograniczenia.

## Poza zakresem
- Komponenty i reguły kiedy ekran woła pełne odświeżenie (TAB-008: pop-up, zmiana koloru, raz na dobę), pomiary T-21, K-01…K-05 na sprzęcie (TAB-007 i testy po bramce).
- Bigme (`XrzEinkManager`): nie kupujemy, poza zakresem.

## Kryteria akceptacji
- [ ] [ręcznie] Na emulatorze `epdInfo().kind = 'lcd'`, `epdRefresh('full')` nie rzuca, licznik rośnie, diagnostyka pokazuje „EPD brak (LCD)”.
- [ ] Build nie pobiera nic po HTTP (`./gradlew --offline` po jednorazowym pobraniu zależności przechodzi); `verification-metadata.xml` odrzuca podmieniony AAR (test: zmieniony bajt w AAR → błąd weryfikacji).
- [ ] [ręcznie] Na Boox (sztuka deweloperska, wykonuje osoba z urządzeniem): `kind` to `onyx-sdk` albo `onyx-controller`; pętla zmian kolorów z ekranu „EPD” nie zostawia kolorowego śladu po `full` (zdjęcie do raportu TAB-007).
- [ ] Gdy wywołanie SDK rzuca wyjątek, implementacja przechodzi na `bw-frame` i zapisuje przyczynę.

## Testy
- Jest: wybór implementacji z atrapą `epdInfo`, `useEpdOnChange` woła `full` dokładnie raz na zmianę podpisu koloru i nie woła przy tej samej treści.
- [ręcznie] Instrumentowane na emulatorze: `lcd` i `bw-frame` (wymuszony flagą testową).
- [ręcznie] Na sprzęcie: scenariusz z ekranu „EPD” w raporcie bramki (TAB-007).

## Definicja gotowości
- `npm run check` w `tablet/` zielone, build offline działa; `tablet/docs/epd.md` gotowy; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Szybkie tryby (A2, DU) gubią kolor na Kaleido 3: nigdy nie rysuj nimi pól `t-ok`, `t-warn`, `t-crit` (K-05).
- `allowInsecureProtocol` tylko, jeśli vendoring w repo się nie da; wtedy jedno repozytorium i tylko w `tablet/android` przez config plugin.
- Bez animacji w całej apce; pełne odświeżenie to jedyny „efekt” na ekranie.
<!-- dep-ok: TAB-002 (moduł kiosku tylko wspomniany; epd to osobny moduł natywny) -->
