# eKoniuszy: development, testy i zakupy

> data 2026-10-12; pełna wersja ze źródłami: [development-szczegoly.md](development-szczegoly.md); model danych [erd.md](erd.md); paleta [paleta.md](paleta.md); bez cen, bez umiejscowienia infrastruktury (Dawid).

**Oznaczenia:** **(B)** to punkt bramki sprzętowej; dopóki nie przejdzie, nie kupujemy kolejnych tabletów. **[niepotwierdzone]** rozstrzyga test albo karta produktu przed zakupem. **(propozycja)** to rozwiązanie, którego erd.md nie przesądza. Testy: T-xx tablet, K-xx kolor na tablecie, W-xx wyświetlacz, N-xx sieć, A-xx scenariusze akceptacyjne.

**Terminy:** zmiana czasu 25.10.2026. Test ciągły obejmie ją tylko przy starcie do 24.10, więc symulacja jest obowiązkowa: zegar w backendzie i `packages/rules`, `timedatectl` na Pi, strefa na tablecie (następna zmiana 28.03.2027). Konta sklepów i wyjście z sandboxów AWS trwają dniami, więc zaczynamy je pierwszego dnia.

## 0. Zestaw minimalny do domu

Wystarcza na start etapu 0: development i provisioning tabletu (T-01…T-04), 72 h pracy (T-11), K-06 na zrzutach, wyświetlacz na własnym ekranie. Wlicza się w ilości z sekcji 1.

| Pozycja | Ile | Uwagi |
|---|---|---|
| **Kupić** | | |
| [Boox Note Air6 C](https://shop.boox.com/products/noteair6c) (kolorowy 10,3″, Kaleido 3, Android 16), w PL np. [Komputronik](https://www.komputronik.pl/product/1032275/czytnik-e-book-onyx-boox-note-air-6-c-szary.html) | 1 | Kandydat nr 1. Numer firmware zapisać przed pierwszym Wi-Fi; przed T-01 bez logowania do Google i BOOX. |
| Zasilacz USB-C PD 20–30 W | 1 | Ładowarki w pudełku nie zakładamy [niepotwierdzone]. |
| [Raspberry Pi 5](https://www.raspberrypi.com/news/introducing-raspberry-pi-5/) 4 GB | 1 | Chromium w kiosku. |
| Oficjalny [zasilacz 27 W USB-C PD](https://core-electronics.com.au/raspberry-pi-5-power-supply-usb-c-pd-27w-black.html), wtyczka EU | 1 | Profil 5 A, nie z USB telewizora. |
| Oficjalna obudowa z wentylatorem | 1 | Praca ciągła. |
| [microSD 64 GB A2](https://www.adafruit.com/product/6011) | 1 | Później karta ratunkowa. |
| [Kabel micro-HDMI → HDMI](https://www.raspberrypi.com/products/micro-hdmi-to-standard-hdmi-a-cable/) | 1 | HDMI0, bez przejściówek. |
| **Wykorzystać własne** | | |
| TV albo monitor z HDMI | 1 | Wyłączyć auto-off po 4 h; TV bez internetu. |
| Domowe Wi-Fi | — | Bez portalu logowania. Pasma Air6 C: [niepotwierdzone] (T-13). |
| Własny telefon | 1 | SMS OTP i eskalacje; numer zweryfikowany w SMS sandbox AWS. |
| Klawiatura i mysz USB | 1 + 1 | Konto `display`, wybór hali. |
| **Dokupić tylko, jeśli coś nie zadziała** | | |
| Samsung Galaxy Tab Active5 (SM-X300, Wi-Fi) | 0–1 | Gdy T-01 albo T-02 nie przejdą na Air6 C: wzorzec Device Owner i plan B. |
| [Boox Go 10.3 Gen II Lumi](https://www.digitec.ch/en/s1/product/onyx-boox-go-103-2nd-gen-lumi-1030-64-gb-ereaders-69291196) | 0–1 | Test prawdziwego czarno-białego ekranu na tym samym firmware (K-06). |

## 1. Zakupy w etapach

Kolorowe (Kaleido 3, Gallery 3) i czarno-białe (Carta) tablety są równorzędnymi kandydatami; ekran z paletą `t-*` działa na obu. Pełnych ilości nie kupujemy przed bramką (B), a przy panelu kolorowym także przed K-01 i K-05.

### Etap 0: bramka sprzętowa (1–2 tygodnie)

| Pozycja | Ile | Po co |
|---|---|---|
| Zestaw minimalny (sekcja 0), emulator Androida 15/16 bez Play | — | Bramka (B), K-01…K-07; DPC najpierw na emulatorze. |
| Kanarek: Pi 5 2 GB z zasilaczem 27 W, obudową i microSD | 1 kpl. | Aktualizacje i minimum pamięci (W-15, W-16). |
| Telefony: iPhone ze starym iOS i najnowszy; Android stary z małą RAM, Samsung, Xiaomi, Pixel | 6 | Dolne granice, nakładki, autouzupełnianie kodu. |
| Karty SIM na kartę (Orange, Play, Plus, T-Mobile, 2–3 MVNO); modem USB LTE | ok. 9 + 2; 1–2 | Role z seedu; prawdziwe SMS nocą. Nie do 2FA kont. |
| Gniazda z przekaźnikami na lokalne API, np. [Shelly Plug S Gen3](https://www.shelly.com/pl/blogs/documentation/shelly-plug-s-gen-3-device-smart-control) (wtyk E [niepotwierdzone]) | 6–8 | Cykle zasilania z logiem (T-08, W-02). |
| Tester USB-C PD, np. [FNIRSI FNB58](https://www.elektor.com/products/fnirsi-fnb58-usb-tester-with-bluetooth) | 1 | T-12, K-07. |
| Komora albo zamrażarka z termostatem; rejestratory temp. i wilgotności | 1; 8 | T-22, pilotaż. |
| Luksomierz, ściemniana ciepła lampa, latarka czołowa, szara karta, aparat z makro, 2 kamery, suwmiarka, rękawice | kpl. | T-18…T-20, K-01…K-04, W-23. |
| Miernik NH3 0–100 ppm, np. [Forensics Detectors](https://forensicsdetectors.com/products/basic-ammonia-detector) | 1 | N-05. |
| Komputer z ADB, hub USB, kable USB-C z danymi; Mac albo runner macOS; klucze FIDO2 | 1; 1; 2 | Provisioning, E2E na iOS, konta. |

- Device Owner na e-ink nie jest publicznie potwierdzony u żadnego producenta [niepotwierdzone]. DPC instalujemy tylko przez ADB, na urządzeniu bez kont.
- Firmware Boox zabija apki w tle (T-04) i nie da się go cofnąć: zatwierdzamy pary model + firmware i blokujemy OTA (pakiet [niepotwierdzone]). Limit ładowania 80% jest potwierdzony na Air6 C.
- Tryby A2 i DU gubią kolor (K-05); ustawienia E-Ink Center zamrażamy (z ADB/DPC: [niepotwierdzone]). Onyx pytamy na piśmie o DO, OTA i E-Ink Center.
- Gdy Air6 C odpadnie: na DO → Tab Active5 albo inna rodzina firmware (Bigme B10/B1051C, [PocketBook InkPad Eo 2](https://pocketbook.ch/en-ch/news/pocketbook-inkpad-eo-2-news-ch) po premierze, czarno-biały Meebook M8); na K-01/K-05 → Lumi; na wymiarach → [Note Mini C](https://shop.boox.com/products/noteminic); przy braku w sprzedaży → [Note Air5 C](https://www.x-kom.pl/p/1542740-czytnik-ebook-onyx-boox-note-air-5-c-64gb-szary.html). Gallery 3 nie kupujemy (jedyny Android to Bigme Galy z Androidem 11).

### Etap 1: stanowisko testowe (co najmniej 28 dni pracy ciągłej)

| Pozycja | Ile | Po co |
|---|---|---|
| Tablety wybranego modelu | +6 (propozycja) | 4 produkcyjne (Hala główna · boks 4 i 7, Hala nowa · boks 4 i 6), 1 do testów niszczących, 1 referencyjny i zapas. |
| Zasilacze USB-C PD 20–30 W; 5 V bez PD; kable kątowe 0,3–0,5 m | 1/tablet + 2; 2; 10 | Praca ciągła, T-12. |
| Ramka [Brateck PAD34-01](https://www.computeralliance.com.au/brateck-anti-theft-wall-mounted-tablet-enclosure/); prototypy z HDPE/PP (otwarty front i szyba); folia matowa; wkręty pin-in Torx | 1; 2 + 2; 10; kpl. | T-19, T-29. Wymiary Air6 C: [niepotwierdzone]. |
| Puszka z testem DLG, np. [Spelsberg TK PC](https://www.dlg.org/en/tests/agricultural-technology-and-farm-inputs/test-reports/test-g-spelsberg-leergehaeuse-der-tk-pc-serie-mit-zubehoer); atrapy obudów; próbki materiałów | 2; 2; kpl. | Zasilacz przy boksie, amoniak, gryzienie. |
| Opcjonalnie [Teltonika TSW202](https://teltonika-networks.com/cdn/products/2023/08/64e896612f9829-30532758/datasheet-pdf/tsw202-datasheet-v13.pdf) i [GAT-USBC](https://reach.dog/shop/poe-texas/products/gat-usbc) | 1 + 2 | Tylko gdy stajnia rozważa PoE+. |
| AP 2,4/5 GHz, drugi AP, mostek z `tc netem` | 1 + 1 + 1 | T-14, roaming. |
| Pi 5 4 GB (zestaw „hala”) z zasilaczem 27 W i obudową pasywną | 1 | Pełny ekran jednej hali. |
| [M.2 HAT+ Compact](https://thepihut.com/products/raspberry-pi-m-2-hat-compact) i [Raspberry Pi SSD](https://www.raspberrypi.com/products/ssd-kit/) 2230; microSD; [bateria RTC](https://thepihut.com/products/rtc-battery-for-raspberry-pi-5) | 1 + 1; 5; 3 | NVMe w „korytarzu” (zgodność z obudową [niepotwierdzone]); obrazy (W-18); zegar. |
| TV LCD/LED 43–50″ (nie OLED); monitor signage ≥ 55″ 24/7; kable micro-HDMI, uchwyty VESA, listwy, klawiatura z touchpadem | 1; 1; kpl. | „Korytarz” i „hala”. TV: stan po zaniku prądu, auto-off, CEC. |

Montaż: od korytarza, poza zasięgiem głowy konia, kabel od dołu; IK08+, HDPE/PP zamiast poliwęglanu; Li-ion nie ładuje się poniżej 0 °C (wszystko [niepotwierdzone], T-22).

### Etap 2: stajnia pilotażowa (4–6 tygodni, najlepiej z przymrozkami)

| Pozycja | Ile | Po co |
|---|---|---|
| Tablety tej samej pary model + firmware, z zasilaczami, ramkami i folią | 1 na boks jednej hali (albo jej części) + 2 | Praca z obsługą. |
| Zestawy wyświetlacza i rejestratory z etapu 1 | — | W-28, T-29, N-01…N-06. |

Zasilanie przy boksie i Wi-Fi zapewnia stajnia, my je mierzymy (4.5).

## 2. Konta i usługi

- [ ] **Apple Developer i Google Play.** D-U-N-S dla organizacji: do 5 + 2 dni roboczych (Apple), do 30 dni (Google). Konto osobiste Google: test zamknięty 12 testerów × 14 dni. Weryfikacja zgłoszeń: [niepotwierdzone].
- [ ] **Wnioski AWS:** wyjście z SMS sandbox, limit SMS, produkcja SES; odpowiedź do 24 h, decyzja bywa później; osobno na konto i region.
- [ ] **Domena, DNS, www, skrzynki funkcyjne:** godziny. Subdomeny: API, panel z `/wyswietlacz` (stała, bo wybór widoku TV leży w przeglądarce), `.well-known`, MAIL FROM. TLS przez ACME (200 dni od 15.03.2026, 100 od 15.03.2027).
- [ ] **Identyfikatory od nazwy eKoniuszy** (scope, bundle ID, `applicationId`, nazwy w sklepach): nieodwracalne, przed rekordami w sklepach.
- [ ] Stały numer do 2FA (nie z kart testowych), klucze FIDO2, sejf na sekrety (Dawid).
- [ ] **AWS:** root z MFA, IAM Identity Center, CloudTrail (godziny); dev, test, prod; dostęp z klastra bez kluczy statycznych, minimalne role.
- [ ] **Cognito** (godziny; potwierdza spike): plan Essentials albo Plus (`SMS_OTP` nie w Lite), `ALLOW_USER_AUTH`; klienty mobile, tablet, web, display. Tablet zalogowany na stałe, długi refresh token, akcje bez autora (`source = tablet`), wysyła `id` boksu. `display` tylko odczyt. TOTP i logowanie bez hasła wykluczają się. Global sign-out wylogowuje też tablety użytkownika; blokadę sprawdzamy w `stable_members`.
- [ ] **SMS do Polski:** sandbox do 10 numerów (minuty na numer); Sender ID: [niepotwierdzone], od razu do kilku tygodni; protect configuration z blokadą krajów; wyjście z sandboxu przed stajnią pilotażową; polskie znaki = 70 znaków na segment.
- [ ] **SES** (DKIM, DMARC, sandbox 200/dobę; produkcja do 24 h albo kilka dni), **S3** (Block Public Access, CORS), **SNS/SQS** z manifestu (DLQ, klucz KMS klienta).
- [ ] **Apple:** App Store Connect, TestFlight (buildy 90 dni), Universal Links, recenzja (konto demo bez SMS, usuwanie konta).
- [ ] **Google Play:** API 36 od 31.08.2026 [niepotwierdzone], Play App Signing, `assetlinks.json`, Data safety. APK tabletu poza Play: ADB zwolnione z weryfikacji deweloperów, cicha instalacja przez DO i Play Protect na Air6 C/Lumi: [niepotwierdzone] (T-27).
- [ ] **Expo EAS** (godziny): projekty mobile i tablet, development builds; keystore tabletu (zmiana klucza kasuje logowanie i boks); EAS Update tylko dla apki.
- [ ] **Płatności:** fałszywe adaptery do wyboru dostawcy; KSeF 2.0 tylko przy prawdziwej integracji. Na PoC bez rozbudowy: płatności, faktury i KSeF to otwarta kwestia (sekcja 5).
- [ ] **Błędy i logi** (narzędzie: Dawid): crashe z symbolami, diagnostyka tabletu i Pi z buforem offline (boks jako `id` i „Hala nowa · boks 4”), alerty (DLQ, cron, opóźniona eskalacja, 5xx `board`), maskowanie.

## 3. Development

Prefiks `/<serwis>/v1/` (propozycja), `/internal` tylko w klastrze. Żaden punkt nie dodaje tabel. Dawid dostaje obrazy, manifest AWS, role bazy i skrypt grantów.

### 3.1 Fundament
- [ ] pnpm i Turborepo: `apps/{mobile,tablet,web}`, 14 serwisów, 8 cronów, `packages/*` (m.in. `db`, `contracts`, `auth`, `tenancy`, `audit`, `rules`, `theme`), `tools/*`.
- [ ] TS `strict`, ESLint z regułami granic: serwis nie importuje innego serwisu, apki tylko z `contracts`, `api-client`, `rules`, `i18n`, `theme`, kolory tylko z `theme`, zapis tylko do własnych tabel (`owners.ts`).
- [ ] CI: lint, typy, testy, Testcontainers, `sql-gate`, kontrakty, obrazy, SBOM, APK; emulator z KVM. Nocny: klaster z replikami, prawdziwe Cognito i SMS, k6.
- [ ] Bramka zakazanych obiektów (lint Drizzle, `sql-gate` na `libpg-query`, katalog bazy): funkcje, triggery, RLS, `CHECK`, `DEFAULT`, sekwencje, enumy, `jsonb`, tablice, akcje FK. Własny migrator; squawk.
- [ ] `packages/db`: 45 tabel `app` + 2 `audit` (erd.md), UUIDv7 z kodu, `timestamptz`, `version`, wielokolumnowe FK z `stable_id`. Hierarchia `businesses` → `stables` → `buildings` → `boxes`. **Bez unikalności `boxes.label`** (ani w stajni, ani w hali), test katalogu to pilnuje. Unikalność `building_routines`: jedna akcja na halę, posiłek i dzień, padok na halę i dzień. `horse_flags.valid_from` i `valid_to` są `NOT NULL`.
- [ ] Migracje expand/contract, generator grantów (w `audit` tylko `INSERT`), `/readyz` 503 przy brakującej migracji.
- [ ] `contracts` (zod → OpenAPI, `problem+json`, `If-Match`, `ETag`, id klienta i `request_hash`), `service-kit`, `cron-kit`, `messaging` (publikacja po COMMIT, DLQ, idempotencja bez `inbox`).
- [ ] `auth`/`authz`: klient z `client_id`, uprawnienia z bazy przy każdym żądaniu. `X-Box-Id` niesie `boxes.id`, nigdy numer. `tenancy`: obiekt innej stajni daje 404. `audit` w tej samej transakcji (`actor_type` także `tablet`).
- [ ] `rules`: skutki flag z okna godzin (`suspend_meal` tylko dla posiłku, którego godzina wypada w oknie; `cancel_paddock` skraca albo odwołuje padok tylko w oknie; lista koni pominiętych przy akcjach zbiorczych hali; „od HH:MM” dla flagi, która zacznie się później), noce 25.10.2026 i 28.03.2027; `i18n` (pl, uk, en), `theme`: tokeny LCD i `t-*` z paleta.md, profile Kaleido 3 i Gallery 3, znak „eKoniuszy”; testy zgodności z paleta.md, WCAG i drabiny 255/204/146/66/0.
- [ ] Dla Dawida: ≥ 2 repliki, CronJob z `timeZone` i `Forbid`, Job migracji, PostgreSQL z PITR, NetworkPolicy, `/internal` niewystawione.

### 3.2 Środowisko lokalne i seed
- [ ] docker compose: PostgreSQL, LocalStack (S3, SNS, SQS, SES), proxy z LAN, `fake-sms`, stub tokenów (nie startuje w produkcji); pula Cognito dev dla apek i E2E.
- [ ] Spike Cognito (etap 0): SMS OTP, TOTP, global sign-out, refresh tabletu tygodniami przy zrywanym Wi-Fi, konto `display`, recenzenci.
- [ ] Seed z makiet (stała data wt 13.10.2026, teraz 07:15), boksy po stałych UUID, nie po numerze:
  - działalność (`businesses`) ze Stajnią Pod Lipami;
  - Hala główna (ul. Lipowa 12): Iskra 1, Dukat 2, wolny 3, Sonata 4, Wicher 5, Fala 6, Kasztan 7, Hetman 8;
  - Hala nowa (ul. Polna 3): Grom 1, Mgła 2, Rumba 3, Bella 4, Bursztyn 5, wolny 6 (Wicher do 01.10); Luna bez boksu (dodana 12.10);
  - Damian (admin), Ola i Piotr (obsługa), konto `wyswietlacz-korytarz`; klienci (`client`, dostęp przez `horse_access`): Anna (Kasztan, Bella), Karolina W. (Iskra), Tomasz L. (Grom), Marek Nowak (zaproszenie do Luny czeka); konto `it_support` do macierzy ról (propozycja, poza makietami);
  - flagi z godzinami: Kasztan „Bez śniadania” dziś 06:00–10:00 (wet 08:00) i „Nie na padok” 14:30–16:00 (kowal 15:00), obie potwierdzone 06:02 na tablecie; Bella „Nie na padok” dziś, cały dzień (00:00–23:59), niepotwierdzona; Hetman „Leki rano” 06:00–09:00, potwierdzona 06:20; Sonata „Derka: zakładać” (`variant = on`) dziś 16:00 – jutro 08:00, potwierdzona 07:05;
  - posiłki 06:30, 12:00, 18:00; „Podano śniadanie”: Hala główna 06:40 (Ola, apka, pominięty Kasztan), Hala nowa 06:50 (Piotr, apka, bez pominięć); padok A 10:00–14:00 (Dukat, Sonata, Grom, Bursztyn), padok B 10:00–16:00 (Fala, Kasztan do 14:30, Rumba), „Wyprowadzono na padok” jeszcze nie;
  - „Ogarnięte” dziś 7 z 14 boksów: Hala główna · 1, 2, 5 (Wicher 07:05, Piotr, apka), 7 (Kasztan 07:10); Hala nowa · 2, 3, 5; poza Wichrem z tabletu, bez autora. Pozostałe boksy wcześniej (wolny Hala nowa · 6: 09.10 14:40, Piotr);
  - plan karmienia Kasztana z wysłodkami „0,5 kg · namoczyć w 2 l wody” (wieczór); Hetman „Sieczka 1 kg · namoczyć w 3 l wody” (rano);
  - zadania jednorazowe: „Poidło w boksie 5 do wymiany” (Hala nowa · boks 5, do wzięcia), „Wymienić żarówkę w korytarzu” (Hala główna, wziął Piotr 07:00), „Przywieźć słomę z magazynu” (zrobione, Ola 06:30);
  - druga stajnia tej samej działalności z jedną halą i tymi samymi numerami (izolacja po `stable_id`, nie po działalności).

### 3.3 Serwisy
- [ ] `identity`, `access`: role `admin | staff | instructor | it_support | display | client`; zaproszenie klienta wskazuje konia (`horse_id`, bez boksu), z `expires_at`; dostęp klienta przez `horse_access` (`valid_to`, `revoked_at`). Boks klient widzi przez konia: tylko boks, w którym koń stoi, i jego historię od dnia, w którym koń do niego trafił. Wsparcie IT (`it_support`): konfiguracja i diagnostyka tabletów i wyświetlaczy, bez zarządzania końmi i klientami.
- [ ] `stable`: działalność (`businesses`) z kilkoma stajniami (`stables.business_id`); uprawnienia, izolacja i płatności zostają na poziomie stajni. Hale z nazwą, adresem, `sort_order`, `active`; „Dodaj halę” tylko admin (nowe boksy od 1 / przeniesienie / pusta) w jednej transakcji z audytem; usunąć można tylko pustą halę (409). Boks: `label` nieunikalny, kod nie sprawdza powtórzeń; zmiana `building_id` przenosi boks z koniem i historią; DTO zawsze z halą. Konie przypisywane po `boxId`.
- [ ] `flags`: utworzenie (`422 target_passed`), odwołanie, potwierdzenie (`method` z klienta, `box_id` z nagłówka). Potwierdzenia wymagają tylko flagi. Okno `valid_from`–`valid_to` obowiązkowe (bez „do odwołania”; brak okna daje 422, propozycja), podpowiedź z `flag_templates.default_window`; szablon `derka` z `variant` (`on` zakładać, `off` nie zakładać); termin potwierdzenia i eskalacje od początku okna. Status tylko „potwierdzona HH:MM” albo „niepotwierdzona”.
- [ ] `board` (bez tabel): `GET /boxes/{boxId}` bez danych zalogowanego użytkownika; flagi z godzinami („06:00–10:00”, „od 14:30”) i skutkami z okna (`rules`); plan karmienia z „NAMOCZYĆ”; najnowsze „Ogarnięte” i rutyna hali (posiłek, padok); lista boksów w halach dla „Zmień boks”; `display?buildingId=` (na pełnym ekranie tylko flagi tej hali, inne hale tylko w liczbach, bez danych osobowych); `ETag` = hash treści.
- [ ] `care`: szybkie akcje obsługi zamiast odhaczania czynności:
  - „Ogarnięte” (sprzątanie i ścielenie razem) per boks z tabletu albo kilka zaznaczonych boksów jednym zapisem z apki (`box_care_events.kind = tidy`); kilka wpisów dziennie, liczy się najnowszy;
  - „Podano śniadanie / obiad / kolację” i „Wyprowadzono na padok” jedną akcją na halę (`building_routines`); pominięte konie wynikają z flag obowiązujących w tym czasie (także niepotwierdzonych) i wracają w odpowiedzi;
  - „Cofnij” przez kilka minut (`cancelled_at`); z tabletu bez autora;
  - bez potwierdzania karmienia per koń i bez wody; plan karmienia z `soak` i `soak_note` („namoczyć” + ile).
- [ ] `tasks`: zadania jednorazowe; dodaje tylko admin (tytuł, notatka, opcjonalnie hala, boks, koń); stajenny bierze zadanie z listy („Biorę”: `taken_by`, `taken_at`; drugi „Biorę” na wzięte zadanie daje 409, propozycja) i oznacza „Zrobione” (`done_by`, `done_at`). Tylko apka, bez tabletu i bez zadań cyklicznych.
- [ ] `health`, `rides`, `billing` (fałszywe adaptery, bez rozbudowy na PoC), `files`, `releases` (APK z rolloutem po `installId`), `notifications` (`dedupe_key`), `audit`.

### 3.4 Crony
- [ ] `escalation-scheduler` co minutę (klucz `(flag_id, level)`), `health-due-reminders`, `files-gc`, trzy crony billingu, `horse-left-reconciler`, `retention-pruner`. Każdy testujemy na przebieg powtórzony, równoległy, przerwany i fałszywy zegar.
- Wyświetleń flag na tabletach nie śledzimy. Brak potwierdzenia w terminie, także przy martwym tablecie, obsługuje tylko `escalation-scheduler` przez `flag_escalations` (A-02).

### 3.5 Aplikacje
- [ ] **Apka mobilna:** Expo, logowanie `USER_AUTH` z SMS OTP, flaga tylko online, reszta zapisów przez lokalną kolejkę; ekrany z makiet; przy kilku halach „Hala nowa · boks 4”; status zawsze ikoną, słowem i polem.
  - Klient: maksymalnie prosto, czyli kafelki flag (Bez śniadania, Bez kolacji, Nie na padok, Derka z wyborem „zakładać / nie zakładać”, Wet, Leki, Inna flaga), godziny od–do podpowiedziane z możliwością zmiany, opcjonalna notatka i przycisk, bez innych pól. „Mój boks”: „Ostatnio” tylko zdarzenia z przycisków obsługi, „Historia” tylko flagi (z potwierdzeniami) i zdarzenia z przycisków.
  - Obsługa: „Szybkie akcje” per hala na liście dnia („Podano śniadanie / obiad / kolację”, „Wyprowadzono na padok” z liczbą koni i pominiętymi, „Ogarnięte” z siatką boksów i zaznaczaniem kilku naraz, „Cofnij”); „Wymaga potwierdzenia” tylko z flagami; bez listy karmienia per koń. Zakładka „Zadania”: „Do wzięcia” („Biorę”), „Moje” („Zrobione”), „Zrobione dziś”; „+ Dodaj zadanie” tylko admin.
  - Zaproszenie: role Klient (z wyborem konia), Obsługa, Instruktor, Wsparcie IT (z opisem jednym zdaniem).
- [ ] **Tablet, moduł Kotlin** `modules/kiosk`: Device Owner, Lock Task bez funkcji, HOME, autostart, blokada OTA, cicha instalacja ze sprawdzeniem `sha256` i podpisu, watchdog, limit ładowania, Wi-Fi przez DO. `epdRefresh(full|partial)` w czterech implementacjach (Onyx SDK, kontroler jak w KOReader, RK3566, pełna klatka). `tools/provision-tablet`: bez Wi-Fi i kont → firmware → ADB → DO → blokady → sieć → logowanie → wyłączenie ADB.
- [ ] **Tablet, ekrany:**
  - TabletBoks: hala przy numerze przy kilku halach, „Zmień boks”, **bez informacji, kto jest zalogowany**; baner flagi z godzinami („BEZ ŚNIADANIA · 06:00–10:00”, „Później: Nie na padok od 14:30”); tabela karmienia z „NAMOCZYĆ”; jeden przycisk „OGARNIĘTE” (ponowne tapnięcie zapisuje ponownie) i linia rutyny hali; HISTORIA tylko flagi i zdarzenia z przycisków; bez wody, siana i ścielenia;
  - TabletPopup: godziny flagi; znika po POTWIERDZAM albo po odwołaniu flagi przy najbliższym odpytaniu;
  - TabletEkranZablokowany: przycisk „Zablokuj ekran” (kłódka) obok „Zmień boks”; tablica dalej się odświeża, dotyk nic nie zmienia, pasek „EKRAN ZABLOKOWANY · przytrzymaj kłódkę 3 s, aby odblokować”; pop-up nowej flagi pojawia się mimo blokady, POTWIERDZAM dopiero po odblokowaniu; blokada sama schodzi po 10 min (propozycja); stan tylko lokalnie na tablecie, bez API i tabel; to nie blokada boksu;
  - TabletZmianaBoksu: bez blokady boksu, zakładki hal, przełączenie od razu, powrót do poprzedniego boksu po 30 s bez wyboru; wybór (`boxes.id`) pamięta tablet, serwer o nim nie wie;
  - ukryte ustawienia (długie przytrzymanie): logowanie, Wi-Fi, diagnostyka (także dla Wsparcia IT).
- [ ] **Tablet, zapisy i e-ink:** kolejka SQLite, `source = tablet`, `user_id = NULL`, `X-Box-Id`. Paleta `t-*`: jeden ekran dla koloru i czerni-bieli, kolor tylko w dużych polach, na kolorze tylko pogrubiony czarny albo biały tekst, status także obrysem (krytyczna bez ramki, uwaga 4 px, OK 2 px). Pole koloru zmienia się jednym pełnym odświeżeniem, zegar idzie szybkim trybem czarno-białym (tryb dla fragmentu ekranu: [niepotwierdzone]).
- [ ] **Panel web:** PanelBoksy z sekcjami hal i adresami (kolumny: Boks, Koń, Klient, Aktywne flagi z godzinami, Ostatnio ogarnięte, Akcje), PanelDodajHale, PanelPlatnosci; boks zawsze z halą, formularze wysyłają `boxId`.
- [ ] **Wyświetlacz:** widok wszystkich hal (sekcje, pasek pilnych wszystkich hal) i „Pełny ekran” hali (**tylko flagi tej hali**, przełącznik hal, „Wszystkie hale”). Kafle bez posiłków per koń: flagi z godzinami, „Ogarnięte HH:MM”, padok z godzinami; w nagłówku hali rutyna („Śniadanie podane 06:40 · padok 10:00”). Wybór w `localStorage` telewizora, bez tabeli; brak wyboru albo zniknięta hala daje widok wszystkich. Odpytywanie co 10 s z ETag.
- [ ] **Obraz Pi** (Raspberry Pi OS Trixie): Chromium jako usługa z restartem i trwałym profilem (bez `--incognito`), bez wygaszania, watchdog, CEC, RTC, SSH z kluczami, aktualizacje przez kanarka.

### 3.6 Kolejność prac
- [ ] **Etap 0:** fundament i seed; bramka tabletu na Air6 C (na sztucznych odpowiedziach `board`); spike Cognito.
- [ ] **1, logowanie:** pula dev, zaproszenie klienta do konia tworzy członkostwo (`client`) i `horse_access`, macierz izolacji zielona.
- [ ] **2, stajnia i hale:** dwie hale w panelu i apce, „Dodaj halę” działa.
- [ ] **3, flagi:** A-01, A-02 i A-12 (godziny, Derka) od zera, wyścig potwierdzenia z eskalacją zielony.
- [ ] **4, tablica i tablet:** pop-up w ustalonym czasie, „Zmień boks” z powrotem po 30 s, blokada ekranu (A-15), APK bez dotykania.
- [ ] **5, wyświetlacz:** 72 h pracy, wybór hali przetrwa restart.
- [ ] **6–9:** `care` (szybkie akcje obsługi, A-13); `health`, `rides`, `tasks` (zadania jednorazowe, A-14); `billing` (bez rozbudowy); przed pilotażem audyt, pełna izolacja, obciążenie, alerty, runbooki, wyjście z SMS sandbox.

## 4. Testy

### 4.1 Automatyczne
- [ ] Jednostkowe: reguły flag i noce zmiany czasu, okna flag (skutki tylko w oknie, „od HH:MM”, Derka `on`/`off`), pominięte konie w akcjach zbiorczych hali, deterministyczny ETag, boks tylko po `id`, etykieta z halą, dwie nazwy statusu flagi (PL, UA, EN), paleta.
- [ ] Integracyjne: wielokolumnowe FK, brak unikalnego indeksu na `boxes.label`, unikalność `building_routines` (hala, posiłek, dzień), „Ogarnięte” kilka razy dziennie (liczy się najnowszy), „Cofnij” (`cancelled_at`), flaga bez `valid_to` odrzucona, zapisy na boks 4 Hali nowej (Bella) i Hali głównej (Sonata) trafiają do właściwego `box_id`, „Dodaj halę” atomowo.
- [ ] Kontrakty (boks tylko jako `boxId`), idempotencja i DLQ, crony bez dubli w `flag_escalations`, repliki, migracje N-1 → N.
- [ ] Wydajność k6: model obciążenia z sekcji 5, p95 `board` dla 200 i 304, udział 304.
- [ ] Apka (Maestro, Detox: kafelek flagi z godzinami, „Ogarnięte” kilku boksów jednym zapisem, „Biorę” i „Zrobione”), panel (Playwright: wyszukanie „4” zwraca dwa boksy z halami), `/wyswietlacz` (pełny ekran tylko z flagami hali, `localStorage`, nowa hala w ≤ 10 s), tablet na emulatorze (zrzuty w szarości, „Zmień boks” i blokada ekranu ze sztucznym zegarem).

### 4.2 Bezpieczeństwo
- [ ] Izolacja: id i `X-Box-Id` innej stajni dają 404 bez zapisu. Macierz rola × akcja (halę i zadania dodaje tylko admin; szybkie akcje i zadania wykonuje obsługa; `client` tylko swój koń i boks, w którym koń stoi, z historią od dnia przypisania; `it_support` bez zarządzania końmi i klientami; `display` bez zapisu).
- [ ] Wyświetlacz bez danych osobowych (dane-kanarki). Tablica tabletu nie pokazuje zalogowanej osoby; akcje z `source = tablet`, `user_id = NULL`, `actor_type = tablet`.
- [ ] Presigned URL, zaproszenia, czas utraty dostępu po global sign-out, SMS na każdej karcie, kiosk (T-02, W-26).

### 4.3 Sprzęt
**Tablet**
- [ ] **(B):** T-01 Device Owner (emulator, potem Air6 C; przy porażce Tab Active5), T-02 Lock Task bez ucieczki, T-03 HOME, T-04 ustawienia producenta (72 h), T-08 autostart po rozładowaniu (50 cykli, 100%), T-13 Wi-Fi w obu pasmach, T-24 cicha instalacja, T-25 przerwana aktualizacja.
- [ ] Pozostałe: T-05 aktualizator, T-06 odzyskanie, T-07 provisioning, T-09 soft reboot, T-10 limit 80%, T-11 praca ciągła (72 h, potem 28 dni), T-12 zasilacz, T-14 awarie sieci, T-15 zmiana Wi-Fi, T-16 czas, T-17 fala powrotów, T-23 sesja, T-26 wadliwa wersja, T-27 Play Protect.
- [ ] Ekran: T-18 opóźnienie flagi (p95 z ≥ 500 prób), T-19 dotyk w rękawicach, T-20 czytelność z 1,5 i 2 m (Air6 C według źródeł ma Kaleido 3, czyli profil domyślny; potwierdzić na sprzęcie), T-21 „duchy”, T-22 zimno ≤ 0 °C, T-30 blokada ekranu przy myciu: mokra ścierka i woda na zablokowanym ekranie nic nie zapisują ani nie przełączają, odblokowanie przytrzymaniem 3 s także w rękawicach (propozycja).
- [ ] Kolor: **K-01** czytelność pól i drabina jasności, **K-05** A2 i DU gubiące kolor (obie przed etapem 1); K-02 dithering, K-03 ghosting koloru, K-04 jedno pełne odświeżenie na zmianę statusu, K-06 wariant czarno-biały (zrzuty, Carta po dokupieniu Lumi), K-07 podświetlenie.
- [ ] T-28 pop-up i „Zmień boks” (powrót po 30 s, boks 4 w obu halach do właściwego `id`); T-29 warunki w stajni pilotażowej.

**Wyświetlacz:** W-01…W-14 (zaniki prądu, restarty, `kill -9`, auto-off 4 h, overscan, retencja, watchdog), W-15 praca 28 dni, W-16…W-22 (aktualizacje, czas, odtworzenie, sieć, błędy, 304), W-23 czytelność z 2–10 m, W-24 układ przy 14 boksach, W-25 pilot przez CEC, W-26 ucieczka z kiosku, W-27 SSH, W-28 pilotaż, W-29 pełny ekran Hali nowej wraca po restarcie i zaniku prądu, bez flagi Kasztana; dwa TV na jednym koncie pamiętają różne wybory.

**Sieć:** N-01 mapa Wi-Fi z tabletu w obudowie, N-02 zmienne sezonowe, N-03 klienci na AP, N-04 brak portalu i port 443, N-05 amoniak, N-06 zmiana Wi-Fi.

### 4.4 Scenariusze akceptacyjne
Każdy automatycznie i ręcznie na stanowisku. Asercje po `id` boksów z seedu; interfejs zawsze z halą przy numerze.
- [ ] **A-01 Kasztan (Hala główna · boks 7):** flaga „Bez śniadania” dziś 06:00–10:00 od Anny o 03:14 → pop-up z godzinami i WSTRZYMANE (owies, siano, suplement X) → POTWIERDZAM o 06:02: pop-up znika, „potwierdzona 06:02” bez autora; w bazie `method = tablet`, `user_id` NULL, `box_id` tego boksu; „Podano śniadanie” Hali głównej o 06:40 pomija Kasztana („bez Kasztana: flaga”); o 10:00 flaga znika bez eskalacji.
- [ ] **A-02 Bella (Hala nowa · boks 4, martwy tablet):** tablet Sonaty jej nie pokazuje. Po `warn_at` jeden `board_warning` i „niepotwierdzona” w pasku pilnych i na pełnym ekranie Hali nowej (nie Hali głównej); po `notify_at` dokładnie jedno powiadomienie admina, także przy dwóch replikach. „Nie na padok” (dziś, cały dzień) działa mimo braku potwierdzenia: „Wyprowadzono na padok” Hali nowej o 10:00 pomija Bellę.
- [ ] **A-03 Odwołanie przy otwartym pop-upie:** pop-up znika bez „ducha” i kolorowego śladu, TV zmienia się w ≤ 10 s, eskalacja nie wychodzi.
- [ ] **A-04 Luna:** bez boksu nie ma jej na tablecie; po przypisaniu do Hala nowa · boks 6 jest tylko na tym tablecie (nie u Fali w Hali głównej).
- [ ] **A-05 Wolne boksy** (Hala główna · 3, Hala nowa · 6): „wolny” na tabletach i w „Zmień boks”, „Ogarnięte” z tabletu bez autora.
- [ ] **A-06 Klient:** Anna widzi Kasztana i Bellę oraz ich boksy (Hala główna · 7, Hala nowa · 4), ustawia i odwołuje ich flagi; szybka akcja obsługi i zadanie dają 403; Karolina W. nie widzi Kasztana. „Mój boks” Kasztana: „Ostatnio” to „Ogarnięte dziś 07:10” i „Podano śniadanie · Hala główna” (pominięty: flaga), „Historia” tylko flagi z potwierdzeniami i zdarzenia z przycisków. Zaproszenie Marka Nowaka do Luny działa tylko przed `expires_at`; po przypisaniu Luny do Hala nowa · boks 6 Marek widzi historię boksu dopiero od tego dnia (bez „Ogarnięte 09.10” i Wichra).
- [ ] **A-07 Obsługa:** flagi Oli dla Iskry (Hala główna · 1) i Groma (Hala nowa · 1) trafiają tylko na właściwe tablety.
- [ ] **A-08 Wyświetlacz z dwiema halami:** liczniki hal, pełny ekran tylko z flagami hali, przełącznik i „Wszystkie hale”, wybór po zaniku prądu, bez danych osobowych.
- [ ] **A-09 Noc zmiany czasu** (symulacja): śniadanie zostaje o 06:30, eskalacje się nie przesuwają, „Derka” 16:00–08:00 przez tę noc kończy się o 08:00 czasu lokalnego.
- [ ] **A-10 Boks 4 w dwóch halach:** flaga Belli tylko na tablecie Hali nowej; „Ogarnięte” z tabletu Sonaty trafia do boksu 4 Hali głównej; powrót po 30 s do właściwego boksu.
- [ ] **A-11 Dodanie hali:** boksy 1–4 z audytem; sekcja na TV i zakładka na tabletach w ≤ 10 s; przeniesiony boks 6 zachowuje `id` i historię; hali z boksami nie da się usunąć; nie-admin dostaje 403.
- [ ] **A-12 Godziny flag i Derka:** o 07:15 tablet Kasztana pokazuje „BEZ ŚNIADANIA · 06:00–10:00” i „Później: Nie na padok od 14:30”; flaga wstrzymuje tylko śniadanie 06:30, nie obiad 12:00; padok B Kasztana skrócony do 10:00–14:30 (między wetem 08:00 a kowalem 15:00); flaga bez `valid_to` odrzucona. Sonata: kafelek „Derka” podpowiada 16:00–08:00, zapis z `variant = on`, na tablecie i TV „Derka: zakładać · 16:00–08:00”, potwierdzenie jak przy innych flagach.
- [ ] **A-13 Szybkie akcje obsługi:** „Podano śniadanie” Hali głównej (Ola, apka, 06:40) to jeden wpis `building_routines` z pominiętym Kasztanem, Hali nowej (Piotr, 06:50) bez pominięć; ponowne „Podano śniadanie” tej hali i dnia nie tworzy drugiego wpisu; „Cofnij” w kilka minut ustawia `cancelled_at`. „Wyprowadzono na padok” o 10:00: Hala główna Dukat, Sonata, Fala, Kasztan; Hala nowa Grom, Bursztyn, Rumba, pominięta Bella. „Ogarnięte” 7 z 14: kilka boksów zaznaczonych w apce zapisuje jeden przycisk, drugie tapnięcie na tablecie Kasztana dodaje wpis, a „Ogarnięte dziś” pokazuje najnowszy. Nigdzie nie ma wody, siana, karmy ani odhaczania posiłku per koń.
- [ ] **A-14 Zadania jednorazowe:** Damian dodaje „Poidło w boksie 5 do wymiany” (Hala nowa · boks 5); Piotr „Biorę” → „Moje”, u Oli zadanie znika z „Do wzięcia”, a jej „Biorę” daje 409 (propozycja); „Zrobione” → „Zrobione dziś”; obsługa nie doda zadania (403); tablet zadań nie pokazuje.
- [ ] **A-15 Blokada ekranu (tablet Kasztana):** po „Zablokuj ekran” tapnięcia w „OGARNIĘTE” i „Zmień boks” nic nie zapisują ani nie przełączają, a tablica dalej się odświeża; nowa flaga pokazuje pop-up, POTWIERDZAM działa dopiero po przytrzymaniu kłódki 3 s; po 10 min blokada sama schodzi (propozycja); dopóki ekran jest zablokowany, serwer nie dostaje żadnego zapisu.

### 4.5 Kryteria gotowości
- **W domu:** bramka na jednej sztuce (T-08 ręcznie wtyczką; T-14 i T-22 dopiero na stanowisku), wariant czarno-biały na zrzutach, w T-28 i A-10 drugim tabletem jest emulator albo skrypt, testy W na własnym TV razem z W-29.
- **Stanowisko (≥ 28 dni):** 4 tablety (Hala główna · 4 i 7, Hala nowa · 4 i 6), dwa TV (wszystkie hale; pełny ekran Hali nowej) i kanarek, dwa AP z `netem`, przekaźniki, kamery, dziennik każdej interwencji.
- **Od stajni pilotażowej** (my mierzymy): 230 V przy boksie z zasilaczem PD ≥ 20 W albo PoE+; RSSI i SNR na tablecie w obudowie; pasmo według T-13; Wi-Fi bez portalu, wyjście na 443; 230 V przy TV; temperatury i sposób sprzątania; instalacja tylko przez elektryka z uprawnieniami.
- [ ] CI zielone (kontrakty, bramka bazy, migracje N-1 → N, pełna macierz izolacji); test obciążenia jako linia bazowa; A-01…A-15 na stanowisku i w stajni pilotażowej.
- [ ] Tablet: 100% autostartów i aktualizacji, zero wyjść z kiosku, zero „duchów” i kolorowych śladów, statusy czytelne bez koloru z 1,5 i 2 m, zero interwencji przez ostatnie 2 tygodnie, bateria bez puchnięcia, praca w najniższej temperaturze hali, zero przypadkowych zapisów przy myciu zablokowanego ekranu (T-30).
- [ ] Wyświetlacz tygodniami bez interwencji, po zaniku prądu wraca do zapamiętanego widoku.
- [ ] SMS OTP w każdej testowanej sieci; global sign-out i blokada konta w zmierzonym czasie; eskalacja przy martwym tablecie (A-02) to jedyne zabezpieczenie; zmiana czasu bez błędów.
- [ ] Runbooki: wymiana i odzyskanie tabletu, zmiana Wi-Fi, ponowne logowanie tabletu i TV, cofnięcie APK, redrive z DLQ, odtworzenie bazy.
- [ ] Zatwierdzona para model + firmware z zablokowanym aktualizatorem i profilem `t-*`.

## 5. Decyzje do podjęcia

**Blokują etap 1 (Cognito)**
1. TOTP a logowanie SMS bez hasła: kto ma TOTP i w jakim przepływie.
2. Logowanie recenzentów Apple i Google, którzy nie odbiorą SMS.
3. Konto `display`: sposób logowania, kto loguje TV, jedno konto czy osobne na każdy telewizor.
4. Czasy życia i rotacja tokenów tabletu i wyświetlacza.
5. Czy global sign-out ma wylogowywać tablety, czy tablety dostają osobne konto obsługi.

**Infrastruktura (Dawid)**

6. Regiony i podział kont AWS, poświadczenia z klastra, uwierzytelnianie `/internal` i operatora, manifesty workloadów, PostgreSQL (wersja, pooler, PITR), narzędzie logów, keystore tabletu i runnery, środowisko stajni pilotażowej, zdalny dostęp do Pi, tokeny w panelu i na TV.

**Produkt**

7. Poprawki erd.md: pkt 4 (pełny ekran hali tylko z flagami tej hali, także w pasku pilnych), pkt 9 (`arenas` należą do `rides`), „FK” przy `audit_log.stable_id`.
8. Luna na wyświetlaczu (propozycja: osobna sekcja tylko w widoku wszystkich hal).
9. Czas na „Cofnij” szybkich akcji obsługi i czas, po którym blokada ekranu tabletu sama schodzi (blokada: propozycja 10 min).
10. Wyświetlacz w nocy: 24 h czy wygaszanie przez CEC (monitor 16/7 czy 24/7).
11. Tablet offline: kolejka zapisów (propozycja) czy blokada akcji; wygląd stanów bez makiet.
12. `actor_id` dla akcji z tabletu (`NULL` czy `box_id`) i dostęp do audytu.
13. SMS z `notifications`: dostawca, nazwa nadawcy, numery spoza Polski (+380); retencja danych.
14. Domyślne sloty, szablony flag (z oknami godzin) i nazwa pierwszej hali; metryka billingu (KSeF: otwarte kwestie niżej).
15. Dokładna postać identyfikatorów od nazwy eKoniuszy.
16. Kto zmienia Wi-Fi na tabletach; założenia tabletu z erd.md (jeden zalogowany naraz, „Zmień boks” bez uwierzytelnienia).
17. Boks w wyłączonej hali albo bez dostępu (propozycja: od razu lista „Zmień boks”); TV na usuniętej hali (propozycja: wszystkie hale).

**Progi testów (przed testem)**

18. Interwał odpytywania tabletu i p95 opóźnienia flagi; trafność dotyku w rękawicach; model obciążenia; długość pilotażu; minimalny odstęp drabiny jasności (K-01, T-20).

**Sprzęt**

19. Para model + firmware po (B); kolorowe i czarno-białe modele są pełnoprawnymi kandydatami.
20. Czy zostaje Air6 C, czy inny model (kolorowy albo czarno-biały); plan B przy braku DO: Tab Active5 albo inny e-ink.
21. Profil palety: Air6 C według źródeł ma Kaleido 3 (profil domyślny), potwierdza K-01; czy utrzymywać profil Gallery 3, którego nie sprawdzimy na sprzęcie.
22. Czy v1 oficjalnie wspiera czarno-biały tablet (tak: dokupić Lumi i przejść K-06, T-20, T-21 na Carta; nie: tylko zrzuty w szarości, K-06).
23. Obudowa (folia czy szyba, po T-19), materiał, miejsce montażu i wielkość ekranu, podświetlenie w nocy.

**Otwarte kwestie z feedbacku ze stajni** (pełny opis: [erd.md, „Otwarte kwestie”](erd.md#otwarte-kwestie))

24. Model karmienia: pudełko (porcja przygotowana wcześniej), namaczanie, ile. Dziś tylko „namoczyć” i ile przy pozycji planu (`soak`, `soak_note`).
25. Ekran dotykowy z blokadą czy zaprogramowany fizyczny przycisk przy boksie (np. „Ogarnięte”); dane do decyzji da T-30 i pilotaż.
26. Płatności, faktury, KSeF: czy to nie za dużo na PoC. Na razie bez rozbudowy: `billing` na poziomie stajni, fałszywe adaptery.
