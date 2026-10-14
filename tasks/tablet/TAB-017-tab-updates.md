---
id: TAB-017
title: Aktualizacje APK w aplikacji tabletu (bez dotykania urządzenia)
area: tablet
stage: 4
size: M
status: todo
depends_on: [BE-040, TAB-004, TAB-012, TAB-013]
decisions: []
owner:
branch:
trello:
---
# TAB-017 · Aktualizacje APK w aplikacji tabletu (bez dotykania urządzenia)

## Cel
Tablety w stajni same pobierają i instalują nową wersję apki, którą zespół EQUENOR wypuścił w `platform`: stopniowo, w oknie serwisowym stajni (np. w nocy) i tylko gdy nie czekają żadne zapisy. Przerwane pobieranie wznawia się, uszkodzony plik jest odrzucany, a po instalacji tablet wraca na ten sam boks z tą samą sesją.

## Kontekst
- **Stan kodu:** BE-040: `GET /platform/v1/tablet/latest?versionCode=&installId=` (tylko aplikacja `tablet`; odpowiedź `available`, `versionCode`, `versionName`, `sha256`, `signingCertSha256`, `sizeBytes`, `downloadUrl` (presigned GET z obsługą `Range`), `mandatory`, okno instalacji w strefie stajni); procent wdrożenia liczony z `installId`. TAB-004: `verifyApk`, `installApk`, znacznik „instalacja w toku”, powrót przez `MY_PACKAGE_REPLACED`. TAB-013: `useOutbox().isEmpty()`, `local_kv` (na `installId`). TAB-012: stan `upgradeRequired` i pasek „WYMAGANA AKTUALIZACJA”, czas serwera.
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 „Aktualizacja APK” (sprawdzanie po starcie i co kilka godzin; pobieranie ze wznawianiem; instalacja w oknie serwisowym przy pustej kolejce zapisów; cofnięcie wersji = APK z wyższym `versionCode`), 3.1.5 (bramka minimalnej wersji nie obejmuje tras wydań), 4.3.1 T-24 (cicha instalacja), T-25 (zerwane Wi-Fi, wygasły presigned URL, zanik prądu i restart w trakcie instalacji: zawsze działająca wersja i powrót do kiosku), T-26 (wadliwa wersja: watchdog; naprawa przez `halted` i wyższy `versionCode`; aktualizacja przy otwartym pop-upie zachowuje boks i sesję), 3.6 Etap 4 („APK aktualizuje się bez dotykania tabletu”).
- **Makiety:** TabletAktualizacja (`docs/makiety-plan.md` E): pełny ekran „INSTALUJĘ AKTUALIZACJĘ · [WERSJA]”, „NIE ODŁĄCZAJ ZASILANIA”, bez flag, zegar; stan: pasek `t-warn` „WYMAGANA AKTUALIZACJA” na tablicy.
- **Decyzje:** brak.
- **Dane demo:** okno instalacji w seedzie (np. 02:00–04:00, BE-040); wydania testowe N i N+1 (`tablet/scripts/build-test-apks.sh`, TAB-004).

## Zakres
- [ ] `installId`: losowy UUID przy pierwszym starcie w `local_kv` (przetrwa aktualizacje i ponowne logowanie; reset fabryczny = nowy).
- [ ] `tablet/src/update/useUpdates.ts`: sprawdzenie po starcie (z losowym opóźnieniem 0–10 min) i co 3 h ± 30 min jitteru; zapytanie z `versionCode` bieżącej apki; wynik w stanie `{ available, mandatory, window, release }`; `mandatory` ustawia stan `upgradeRequired` (TAB-012).
- [ ] Pobieranie (natywnie w module kiosku, `downloadApk(url, dest, sizeBytes)`): do `filesDir/updates/<versionCode>.apk.part`, wznawianie nagłówkiem `Range: bytes=<rozmiar>-` po przerwie; gdy URL wygasł (403/400 z magazynu), nowe `GET /tablet/latest` po świeży `downloadUrl` i wznowienie tego samego pliku; po pełnym rozmiarze zmiana nazwy na `.apk` i `verifyApk` (TAB-004); błąd weryfikacji = usunięcie pliku i ponowne pobranie od zera najwyżej raz na dobę dla tego wydania. Pobieranie idzie w tle niezależnie od ekranu (także przy otwartym pop-upie i blokadzie), z ograniczeniem do jednego pobierania naraz.
- [ ] Decyzja o instalacji: plik zweryfikowany i (`mandatory` albo teraz w oknie instalacji w czasie serwera) i kolejka zapisów pusta (`isEmpty()`), i brak otwartego pop-upu z niewysłanym potwierdzeniem; przy `mandatory` instalacja od razu po opróżnieniu kolejki (bez czekania na okno).
- [ ] Ekran `UpdatingScreen` (TabletAktualizacja) na czas `installApk`: „INSTALUJĘ AKTUALIZACJĘ · <versionName>”, „NIE ODŁĄCZAJ ZASILANIA”, zegar; pełne odświeżenie EPD.
- [ ] Po starcie nowej wersji: boks, język, sesja i kolejka z pamięci lokalnej (bez zmian w tym zadaniu, tylko test); wynik „zaktualizowano z X do Y” i „instalacja przerwana” do diagnostyki (TAB-020).
- [ ] Teksty PL i UA.

## Poza zakresem
- Serwer wydań, rollout i `halted` (BE-040), publikacja wydań z `opctl` (BE-056).
- Weryfikacja podpisu i instalacja w Kotlinie (TAB-004); watchdog przy wadliwej wersji (TAB-003).

## Kryteria akceptacji
- [ ] Emulator na stosie dev (SH-002 + `platform`): wydanie N+1 w `rolling` 100% dla Pod Lipami; tablet z N pobiera, czeka na okno (zegar seedu ustawiony w oknie) i instaluje bez dotykania; po starcie ten sam boks, język i sesja (T-24).
- [ ] Zerwanie sieci w połowie pobierania i powrót: pobieranie kończy się wznowieniem (`Range`), a nie od zera; wygasły URL: nowe zapytanie o link i wznowienie (T-25).
- [ ] Niepusta kolejka zapisów wstrzymuje instalację do opróżnienia; `mandatory` instaluje poza oknem po opróżnieniu kolejki i pokazuje wcześniej pasek „WYMAGANA AKTUALIZACJA”.
- [ ] Uszkodzony plik albo zła suma: odrzucony, stara wersja działa, w diagnostyce powód (T-24).
- [ ] Wydanie skierowane tylko do innej stajni nie jest pobierane (`available = false`).

## Testy
- Jest: harmonogram sprawdzeń (jitter), decyzja o instalacji (okno w strefie stajni, kolejka, `mandatory`), obsługa wygasłego URL (atrapa modułu).
- Instrumentowane/emulator: pobieranie z serwera testowego z przerwaniem (np. MinIO z SH-002 i `adb shell svc wifi disable` w trakcie), instalacja N → N+1.

## Definicja gotowości
- `npm run check` w `tablet/` zielone; scenariusz aktualizacji przechodzi na emulatorze; `tablet/docs/kiosk.md` „Aktualizacja APK” uzupełniony o przepływ w apce; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Trasy wydań nie są objęte bramką minimalnej wersji: stary tablet zawsze może zapytać o nową wersję.
- Okno instalacji porównuj z czasem serwera w strefie stajni (offset z `Date`), nie z zegarem tabletu.
- Nie instaluj przy otwartym pop-upie z potwierdzeniem czekającym na wysłanie; po instalacji pop-up wraca z odpowiedzi `board` (TAB-014).
