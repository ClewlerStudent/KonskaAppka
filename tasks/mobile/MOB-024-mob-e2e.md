---
id: MOB-024
title: E2E apki na pełnym stosie (Maestro na Androidzie, Detox na iOS)
area: mobile
stage: 9
size: M
status: todo
depends_on: [MOB-004, MOB-006, MOB-011, MOB-014, MOB-016, MOB-017, MOB-019, MOB-020, MOB-021, MOB-022, MOB-023]
decisions: []
owner:
branch:
trello:
---
# MOB-024 · E2E apki na pełnym stosie (Maestro na Androidzie, Detox na iOS)

## Cel
Przed pilotażem ścieżki klienta, obsługi, admina i instruktora przechodzą automatycznie na prawdziwym backendzie z seedem, na Androidzie i iOS, w trzech językach i z dużą czcionką. Jeden przebieg pokazuje, czy apka spełnia scenariusze akceptacyjne z makiet.

## Kontekst
- Stan kodu: każde zadanie MOB-003…MOB-023 dodało własny flow w `mobile/e2e/maestro/*.yaml` (uruchamiany lokalnie); szkielet Detox z MOB-001. Backend: seed z makiet (`npm run db:seed`, stała data wt 13.10.2026 07:15, BE-011), lokalne środowisko z reverse proxy i fake-sms/Mailpit (SH-002), kody w dev-inbox (`backend/.local/inbox.jsonl`) albo `GET /messages?to=` fake-sms; wzorzec odczytu kodów w `frontend/e2e/helpers/inbox.ts`. Kroki CI definiuje SH-003 (emulator z KVM, runner macOS dla iOS — wybór Dawida).
- Dokumenty: `docs/development-szczegoly.md` 4.1 „Apka mobilna (Maestro, Detox na symulatorze iOS)”: ścieżki klienta (kafelek flagi z podpowiedzianymi godzinami w najwyżej trzech stuknięciach), obsługi (szybkie akcje, siatka „Boks gotowy”, „Woda” przy poidle ręcznym, „Cofnij”, zadania) i admina (przełącznik „Automatyczne poidło” w BoksSzczegoly); flaga przy zrywanym połączeniu bez duplikatu i ze stanem „nie wysłano”; języki, duża czcionka systemowa, mały i duży ekran; boksy w grupach hal z filtrem, wybór wysyła `boxId`; status tylko „potwierdzona HH:MM” albo „niepotwierdzona” i tylko przy `requires_ack`; rejestracja telefonem i e-mailem z potwierdzeniem, logowanie hasłem i kodem MFA z SMS-a i e-maila, „Nie pamiętam hasła”, niepotwierdzone konto do potwierdzenia, zmiana kanału kodu w profilu; przełącznik stajni (A-17): Anna i Ola przechodzą między stajniami, Damian też, Paweł i Piotr bez przełącznika, kafelki, status flag, plan karmienia, szybkie akcje, „Wymaga potwierdzenia” i „Zadania” zmieniają się według stajni, zapis z kolejki trafia do stajni, w której powstał; fizyczne iPhone'y ręcznie przez TestFlight. 4.4 (A-01…A-25; dane z seedu, boksy po stałych UUID). 1.0 (Detox na iOS tylko w symulatorze, Maestro na iOS wymaga macOS).
- Decyzje: brak nowych.
- Dane demo: wszystkie osoby z seedu (Damian, Ola, Piotr, Paweł, Anna, Marta, Karolina W., Ewa K., Marek Nowak), obie stajnie, wariant BezAkcji.

## Zakres
- [ ] `mobile/e2e/README.md` i skrypt `mobile/e2e/run-stack.sh` (albo `npm run e2e:stack`): podniesienie lokalnego stosu (SH-002), `db:seed` ze stałą datą, build apki `development` z `EXPO_PUBLIC_API_BASE_URL` na reverse proxy, instalacja na emulatorze.
- [ ] `mobile/e2e/helpers/`: odczyt kodów (dev-inbox, fake-sms, Mailpit API), reset danych między flow (`npm run db:seed` albo `reset`), ustawianie zegara seedu, przełączanie trybu samolotowego (`adb`).
- [ ] Zestawienie flow per rola w `mobile/e2e/maestro/suites/`: `client.yaml` (A-01, A-06, A-12, A-17, A-18), `staff.yaml` (A-07, A-13, A-14, A-16, A-17), `admin.yaml` (A-02, A-04, A-05, A-16 przełącznik poidła, Ludzie, zaproszenie), `instructor.yaml` (A-21), `auth.yaml` (rejestracja telefonem i e-mailem, logowanie SMS i e-mail, reset, konto niepotwierdzone, zmiana kanału kodu), `settings-variants.yaml` (A-19 na wariancie BezAkcji, A-20, A-21 po zmianie macierzy przez API panelu).
- [ ] Scenariusze przekrojowe: flaga przy zrywanym połączeniu (brak duplikatu, „Nie wysłano”), kolejka offline z przełączeniem stajni (zapis trafia do stajni pochodzenia), języki `pl`, `uk`, `en` (zrzuty ekranów kluczowych), duża czcionka systemowa (`adb shell settings put system font_scale 1.3`) i mały ekran (np. 360×640 dp) bez obciętych przycisków.
- [ ] Detox na symulatorze iOS: `mobile/e2e/detox/*.test.ts` — co najmniej logowanie, Main klienta z flagą, ListaDnia z szybką akcją, przełącznik stajni.
- [ ] Raport: wynik per scenariusz A-xx (przechodzi automatycznie / wymaga ręcznego) w `mobile/e2e/REPORT.md` generowanym przez skrypt, do SH-005.
- [ ] Skrypt ręczny dla fizycznych iPhone'ów przez TestFlight (lista kroków) w `mobile/e2e/manual-ios.md`.

## Poza zakresem
- Harness wszystkich scenariuszy A-01…A-25 przez backend, panel i tablet (SH-005); definicja kroków CI i runnerów (SH-003); publikacja w sklepach (MOB-025).

## Kryteria akceptacji
- [ ] Wszystkie suity Maestro przechodzą na emulatorze Androida (API 36) na świeżym seedzie, dwa przebiegi pod rząd bez ręcznego sprzątania.
- [ ] Detox przechodzi na symulatorze iOS dla czterech ścieżek z zakresu.
- [ ] Ścieżka klienta „kafelek → wysłana flaga” mieści się w 3 stuknięciach (bez notatki).
- [ ] Flaga przy zrywanym połączeniu daje jeden wiersz w bazie i stan „Nie wysłano”/„Zapisano na serwerze”.
- [ ] Zrzuty w `uk` i `en` nie mają brakujących kluczy ani polskich tekstów; przy `font_scale 1.3` żaden przycisk nie jest obcięty.

## Testy
- Same testy E2E: `npm run e2e:android` i `npm run e2e:ios` w `mobile/`; w CI przebieg nocny na pełnym stosie (kroki: SH-003).

## Definicja gotowości
- Suity zielone lokalnie i w przebiegu nocnym CI; `mobile/e2e/README.md` opisuje uruchomienie; raport A-xx przekazany do SH-005; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Selektory po `testID` (dodawaj w komponentach, nie po tekście), bo teksty są w trzech językach.
- Boksy i konie identyfikuj po stałych UUID z `backend/src/lib/testing/demo.ts`, nigdy po numerze (dwa „boks 4”).
- Zmiana względem listy: zależności rozszerzone o wszystkie zadania ekranów, które E2E sprawdza (MOB-004 rejestracja i reset, MOB-006 profil i kanał kodu, MOB-011 Ludzie, MOB-014 status flagi, MOB-017 MojBoks, MOB-019 plan, MOB-020 AdminDzis i „Woda”, MOB-023 stany); wcześniej było tylko MOB-016, MOB-021, MOB-022, przez co część ścieżek nie byłaby gotowa.
