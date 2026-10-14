---
id: MOB-025
title: Publikacja apki (TestFlight, testy wewnętrzne Google Play, konto demo dla recenzentów)
area: mobile
stage: 9
size: M
status: todo
depends_on: [MOB-024, WEB-008]
decisions: [DEC-19, DEC-22]
needs: [macos, device, owner]
owner:
branch:
trello:
---
# MOB-025 · Publikacja apki (TestFlight, testy wewnętrzne Google Play, konto demo dla recenzentów)

## Cel
Apka trafia do testerów stajni pilotażowej przez TestFlight i ścieżkę testów wewnętrznych Google Play, z kompletem danych wymaganych przez sklepy (polityka prywatności, usuwanie konta, konto demo z kodem MFA), tak żeby recenzja nie zatrzymała pilotażu.

## Kontekst
- Stan kodu: `mobile/app.config.ts` z wariantami i `mobile/eas.json` z profilami `development`, `preview`, `production` (MOB-001); usuwanie konta w apce (MOB-006); E2E zielone (MOB-024); strony www: polityka prywatności, regulamin, wsparcie, StronaUsunKonto i ZaproszenieStrona (WEB-008; dziś są `frontend/www/polityka-prywatnosci.html` i `regulamin.html`).
- Dokumenty: `docs/development-szczegoly.md` 2.7 (Apple: App Store Connect, bundle ID, klucz API dla EAS Submit; TestFlight: wewnętrzni do 100 osób bez recenzji, zewnętrzni po Beta App Review, buildy wygasają po 90 dniach; do recenzji: działające konto demo logujące się hasłem i kodem MFA, usuwanie konta w apce (5.1.1(v)), URL polityki prywatności i wsparcia; bez APNs, push poza v1), 2.8 (Play Console; `targetSdk` API 36 od 31.08.2026; Play App Signing; `assetlinks.json` z odciskami; EAS Submit z kontem usługi; pierwszy build ręcznie na ścieżkę testów wewnętrznych; Data safety, link www do usuwania konta, instrukcje dla recenzentów), 2.9 (EAS: organizacja, token robota dla CI, profile, credentials; EAS Update tylko dla apki mobilnej z kanałami i runtime version), 2.2 (z nazwy EQUENOR scope pakietów, bundle ID, `applicationId`, nazwy w sklepach). `docs/mikroserwisy.md` 10.1 pkt 13 i 10.2 pkt 25 (recenzent musi dostać kod MFA konta demo).
- Decyzje: DEC-19 wariant A (kod MFA e-mailem na skrzynkę konta demo, do której dostęp podajemy w notatce do recenzji). DEC-22 wariant A (`pl.equenor.app`; identyfikatory nieodwracalne: przed założeniem rekordów w sklepach i EAS potwierdzenie Dawida w arkuszu decyzji).
- Dane demo: osobna stajnia demo dla recenzentów (propozycja: kopia danych Pod Lipami w osobnej firmie, bez danych prawdziwych osób) i konto demo z e-mailem na skrzynce dostępnej przez webmail.

## Zakres
- [ ] Lista kontrolna w `mobile/STORE.md`: kto zakłada konta (Apple Developer, Play Console, Expo — Dawid), które identyfikatory zatwierdzono (DEC-22), gdzie leżą credentials (EAS, poza repo).
- [ ] `app.config.ts` i `eas.json`: wersjonowanie (`version`, `buildNumber`, `versionCode` z `autoIncrement` w EAS), `runtimeVersion` dla EAS Update (polityka `appVersion`, propozycja), kanały `preview` i `production`, `ios.config.usesNonExemptEncryption: false` (jeśli dotyczy), iOS Privacy Manifest (`PrivacyInfo.xcprivacy` przez config Expo) z deklaracją używanych API, Android `targetSdk` 36, uprawnienia ograniczone do potrzebnych (bez lokalizacji, kamery, kontaktów).
- [ ] Universal Links / App Links (opcjonalnie na PoC): `associatedDomains` i intent filter dla `[WWW]/app` z plikami AASA i `assetlinks.json` po stronie www (koordynacja z WEB-008).
- [ ] Metadane sklepów w `mobile/store/` (PL i EN): nazwa „EQUENOR”, krótki opis, słowa kluczowe, zrzuty ekranów z E2E (MOB-024) w wymaganych rozmiarach, URL polityki prywatności, wsparcia i usuwania konta (WEB-008), kategoria, kontakt.
- [ ] Formularz Data safety (Google) i App Privacy (Apple): zbierane dane (imię, telefon, e-mail, identyfikatory konta, dane koni i stajni wpisywane przez osobę), cel, brak śledzenia i reklam, szyfrowanie w transmisji, możliwość usunięcia konta.
- [ ] Konto demo wg DEC-19: rejestracja w środowisku produkcyjnym (albo testowym dla recenzji) na skrzynkę demo, przypisanie do stajni demo z koniem; notatka do recenzji z krokami: login, hasło, adres webmaila z kodem, co sprawdzić (flaga, status, profil, usunięcie konta na koncie zapasowym).
- [ ] Pierwsze buildy: `eas build --profile preview` na obie platformy, `eas submit` na TestFlight (testerzy wewnętrzni) i ścieżkę testów wewnętrznych Google Play (pierwszy upload ręcznie, potem EAS Submit); kanał EAS Update `preview` przypięty do buildu.
- [ ] Instrukcja dla testerów pilotażu (`mobile/store/testers.md`): instalacja z TestFlight i Google Play, logowanie, zgłaszanie błędów.

## Poza zakresem
- Zakładanie kont i płatności w Apple, Google i Expo oraz przechowywanie keystore (Dawid); strony www (WEB-008); APK tabletu (poza Play, TAB-017).

## Kryteria akceptacji
- [ ] [ręcznie] Build `preview` jest dostępny w TestFlight dla testerów wewnętrznych i na ścieżce testów wewnętrznych Google Play; instaluje się i loguje do środowiska testowego.
- [ ] Recenzent (symulacja: osoba spoza zespołu) loguje się kontem demo według notatki, odbiera kod MFA ze skrzynki demo i przechodzi przez flagę i usunięcie konta zapasowego.
- [ ] Formularze Data safety i App Privacy są wypełnione zgodnie z faktycznym działaniem apki; linki do polityki prywatności i usuwania konta działają.
- [ ] Aktualizacja przez EAS Update na kanale `preview` dociera do zainstalowanego buildu bez reinstalacji.

## Testy
- [ręcznie] Ręczne: lista kontrolna instalacji i logowania na fizycznym iPhonie i telefonie z Androidem; smoke z MOB-024 na buildzie `preview`.

## Definicja gotowości
- Buildy w obu sklepach na ścieżkach testowych, `mobile/STORE.md` i `mobile/store/` w repo (bez sekretów), notatka dla recenzentów gotowa, status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Bundle ID i `applicationId` zmieniają się tylko przed pierwszym rekordem w sklepie; nie zakładaj rekordów przed potwierdzeniem DEC-22.
- Konto demo nie omija MFA (W9): kod zawsze przychodzi e-mailem na skrzynkę demo.
- Żadnych sekretów (klucze API, keystore, hasło konta demo) w repo; notatkę z hasłem przekazuje Dawid w formularzu sklepu.
