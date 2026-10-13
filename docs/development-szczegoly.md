# EQUENOR: development, testy i zakupy przed wdrożeniem

> Stan na 2026-10-13, po feedbacku ze stajni (erd.md pkt 2, 3 i 12–16 oraz „Otwarte kwestie”), z konfiguracją per stajnia (erd.md pkt 16: „Ustawienia stajni”, potwierdzenia flag zależne od ustawień stajni, widoczność per rola) i z decyzjami z 13.10 (sekcja 5, „Rozstrzygnięte”): logowanie telefonem albo e-mailem, konto firmy z NIP i admin konta, telewizor i tablety na kontach technicznych (Wyświetlacz, Tablet), Wsparcie IT jako zespół EQUENOR, język tablicy per tablet, boksy z ustawieniami przy tworzeniu, powiadomienia jako krok 2 zakładania stajni, publiczna strona www (sama prezentacja). Model danych i decyzje: [docs/erd.md](erd.md) (v3), paleta kolorów: [docs/paleta.md](paleta.md), wersja zwięzła: [docs/development.md](development.md). Z [docs/analiza.md](analiza.md) (nieaktualna v3) bierzemy tylko szczegóły tabletu. Dokument opisuje, co kupić, jakie konta założyć, co zbudować i jak przetestować system przed wdrożeniem. Nie podaje cen i nie wskazuje, gdzie ani u kogo stoją klaster i baza; o tym decyduje Dawid.

**Oznaczenia**
- **[niepotwierdzone]**: weryfikacja nie znalazła potwierdzenia w źródłach. Rozstrzyga test albo karta produktu sprawdzona przed zakupem.
- **[erd]**: wprost z `docs/erd.md`. **(propozycja)**: rozwiązanie developerskie, którego erd.md nie przesądza.
- **(B)**: punkt bramki sprzętowej. Dopóki nie przejdzie, nie kupujemy kolejnych tabletów.
- T-xx (tablet), K-xx (kolor na tablecie e-ink), W-xx (wyświetlacz), N-xx (sieć) i A-xx (scenariusze akceptacyjne) to identyfikatory testów z sekcji 4.

**Terminy, które już teraz wpływają na plan**
- Zmiana czasu z CEST na CET wypada w niedzielę 25.10.2026, czyli za 13 dni. Test ciągły obejmie ją tylko wtedy, gdy ruszy najpóźniej 24.10.2026, łącznie z dostawą i provisioningiem. Dlatego symulacja jest obowiązkowa: podstawiony zegar w backendzie i w `packages/rules`, `timedatectl` na Pi, ręcznie ustawiona strefa na tablecie. Najbliższa prawdziwa zmiana to 28.03.2027.
- Na konta sklepów (Apple, Google) i wyjście z sandboxów AWS czeka się dniami. Te sprawy trzeba zacząć pierwszego dnia (2.1).
- Weryfikacja deweloperów Androida obejmie certyfikowane urządzenia globalnie od 2027 r. (2.8, T-27).

## 1. Co kupić do prawdziwych testów

Zakupy idą w trzech etapach:
1. **Etap 0, bramka sprzętowa (1–2 tygodnie).** Zaczynamy od zestawu minimalnego do domu (1.0): jeden kolorowy tablet Boox Note Air6 C i jeden zestaw wyświetlacza na własnym telewizorze albo monitorze. Potem dochodzą kanarek wyświetlacza, telefony z kartami SIM i przyrządy. Drugi model tabletu dokupujemy tylko wtedy, gdy na Air6 C coś nie zadziała. Wynikiem są przejścia punktów (B) z 4.3 oraz testów koloru K-01 i K-05.
2. **Etap 1, stanowisko testowe (co najmniej 28 dni pracy ciągłej).** Dochodzą pozostałe tablety wybranego modelu, drugi zestaw wyświetlacza, prototypy obudów i sieć testowa.
3. **Etap 2, stajnia pilotażowa (4–6 tygodni, najlepiej z przymrozkami).** Tablety wybranego modelu na boksy jednej hali (albo jej części) i 2 zapasowe. Zasilanie i Wi-Fi zapewnia stajnia, a my je mierzymy.

Pełnych ilości nie kupujemy, dopóki wybrany model nie przejdzie T-01 i T-02, czyli Device Owner i Lock Task bez możliwości ucieczki. Przy panelu kolorowym musi też przejść K-01 (czytelność pól statusu) i K-05 (tryby odświeżania gubiące kolor).

### 1.0 Zestaw minimalny do domu

Pierwszy zakup, przed stanowiskiem testowym i bez stajni. Wystarcza na start etapu 0:
- development tabletu i provisioning (T-01…T-04);
- 72 h pracy ciągłej tabletu (T-11);
- pierwsze testy palety na Air6 C: K-06 na zrzutach ekranu bez dodatkowego sprzętu; pomiary K-01…K-04 i K-07 wymagają przyrządów z 1.5;
- wyświetlacz centralny na własnym ekranie.

Pozycje z 1.0 wliczają się w ilości z 1.1–1.4; nie kupujemy ich drugi raz.

| Pozycja | Ile | Po co | Uwagi |
|---|---|---|---|
| **Kupić** | | | |
| Boox Note Air6 C (kolorowy 10,3″, Kaleido 3, Android 16) | 1 | Biurko developera (ADB, build debug), provisioning z wielokrotnymi resetami i próby DPC (T-01, T-02), 72 h pracy (T-11), testy palety K-01…K-07. | Kandydat nr 1 (1.1). Numer firmware zapisać przed pierwszym połączeniem z Wi-Fi. Przed T-01 nie logować się ani do Google, ani do konta BOOX. Do ADB potrzebny kabel USB-C z transmisją danych (czy jest w pudełku: [niepotwierdzone]). |
| Zasilacz USB-C PD 20–30 W | 1 | Stałe zasilanie tabletu w pracy ciągłej, limit ładowania 80% (T-10). | Ładowarki w pudełku Boox nie zakładamy [niepotwierdzone]. Znak CE. Ten sam model co zasilacze na stanowisko (1.2) (propozycja). |
| Raspberry Pi 5, 4 GB | 1 | Wyświetlacz centralny: Chromium w kiosku, widok wszystkich hal (sekcje) i „Pełny ekran” jednej hali z przełącznikiem hal i przyciskiem „Wszystkie hale”. | To zestaw „korytarz” z 1.3, na razie na microSD. NVMe można dołożyć później. Wybór widoku i hali pamięta przeglądarka (trwały profil Chromium, 1.3). |
| Oficjalny zasilacz 27 W USB-C PD (5,1 V/5 A), wtyczka EU | 1 | Zasilanie Pi z profilem 5 A. | Nie zasilać z USB telewizora (1.3). |
| Oficjalna obudowa z wentylatorem | 1 | Chłodzenie Pi w pracy ciągłej. | — |
| Karta microSD 64 GB A2 | 1 | System Pi. | Najlepiej oficjalna karta Raspberry Pi (1.3). Po dołożeniu NVMe zostaje kartą ratunkową. |
| Kabel micro-HDMI → HDMI | 1 | Port HDMI0. | Jednoczęściowy, bez przejściówek i adapterów kątowych. |
| **Wykorzystać własne** | | | |
| Telewizor albo monitor z HDMI | 1 | Ekran wyświetlacza centralnego. | Auto-off po 4 h bez interakcji wyłączyć, jeśli się da (1.3). Jeśli to OLED, nie zostawiać statycznego obrazu na noc (wypalenie). Telewizora nie podłączać do internetu. |
| Domowe Wi-Fi | — | Sieć dla tabletu i Pi. | Bez portalu logowania. Pasma 2,4 i 5 GHz na Air6 C: [niepotwierdzone] (T-13). Osobny SSID i drugi AP do testów awarii sieci dopiero na stanowisku (1.2). |
| Własny telefon | 1 | Logowanie SMS-em (OTP z Cognito) w apce i na tablecie, SMS-y eskalacji. | Numer trzeba zweryfikować w SMS sandbox AWS (limit 10 numerów, 1.4). |
| Własna skrzynka e-mail (i kolejne do kont technicznych telewizora i tabletów) | 1–3 | Logowanie e-mailem (kod z Cognito przez SES) w apce, panelu, na TV i na tablecie, zaproszenia e-mailem. | Adresy trzeba zweryfikować w sandboxie SES (2.6). |
| Klawiatura i mysz USB | 1 + 1 | Konfiguracja Pi: logowanie kontem z rolą Wyświetlacz (e-mail i kod z e-maila), wybór hali, „Pełny ekran”, „Wszystkie hale”. | Bezprzewodowa klawiatura z 1.3 dopiero na stanowisko. |
| **Dokupić tylko, jeśli coś nie zadziała** | | | |
| Samsung Galaxy Tab Active5 (SM-X300, Wi-Fi) | 0 (warunkowo 1) | Wzorzec Device Owner i plan B. Odróżnia błąd naszego DPC od blokady w firmware Boox. | Dokupić, gdy T-01 albo T-02 nie przejdą na Air6 C (1.1). |
| Boox Go 10.3 Gen II Lumi | 0 (warunkowo 1) | Test prawdziwego czarno-białego ekranu (Carta) na tym samym firmware co Air6 C (K-06). | Warunki dokupienia w 1.1 (rekomendacja, pkt 2). |

### 1.1 Tablety e-ink

**Najważniejsze fakty (stan na 12.10.2026)**
- **Device Owner na e-ink nie jest publicznie potwierdzony u żadnego producenta** (Boox, Bigme, Meebook, PocketBook) [niepotwierdzone]. Strona [BOOX for Business](https://shop.boox.com/pages/business) nie wspomina o kiosku ani o MDM. Projekty społeczności na Boox, np. [BooxUltimatum](https://github.com/huuunleashed/BooxUltimatum), używają ADB i Shizuku, a nie DO. Rozstrzygnie to dopiero T-01 na sprzęcie.
- **Lock Task, apka jako HOME i cicha instalacja to standard AOSP.** Lock Task działa od Androida 5.0, a `setLockTaskFeatures` od 9 ([lock task](https://developer.android.com/work/dpc/dedicated-devices/lock-task-mode), [cookbook](https://developer.android.com/work/dpc/dedicated-devices/cookbook)). Wszyscy kandydaci mają Androida 13 lub nowszego. Niewiadomą są nakładki producenta.
- **Własny DPC da się w praktyce zainstalować tylko przez ADB.**
  - QR wymaga aparatu.
  - Ścieżka `afw#` pobiera DPC z managed Google Play, a Google nie przyjmuje już nowych rejestracji własnych DPC ([build DPC](https://developer.android.com/work/dpc/build-dpc)).
  - NFC na kandydatach: [niepotwierdzone]. Aparat w Note Air6 C: [niepotwierdzone]. Brak aparatu w Go 10.3 Gen II: [niepotwierdzone].
  - DO przez ADB wymaga tylko tego, żeby na urządzeniu nie było kont. Reset fabryczny nie jest konieczny ([cookbook](https://developer.android.com/work/dpc/dedicated-devices/cookbook)).
- **GMS nie jest potrzebne.** Tablet odpytuje REST, loguje się przez Cognito, a APK dostaje z serwisu `releases`. Android Management API i zero-touch odpadają, zostaje własny DPC w module Kotlin.
- **ADB na Boox z firmware 4.3** włącza się w Boox Settings › More Settings › USB Debug Mode, a nie przez numer kompilacji ([BooxUltimatum](https://github.com/huuunleashed/BooxUltimatum), [etutor-server](https://github.com/scottcowan/etutor-server/blob/main/docs/hardware-boox.md)). Procedurę trzeba spisać osobno dla każdego modelu.
- **Limit ładowania.**
  - Boox ma „Charging protection” ze stałym progiem 80%. Sprawdzono to na Note Air6 C (FW 4.3, Android 16): ustawienie zapisuje `charge_control_end_threshold`, a przełącznikiem jest `/sys/class/qcom-battery/charge_control_en` ([eksperymenty BooxUltimatum](https://github.com/huuunleashed/BooxUltimatum/blob/main/knowledge/experiments.md)).
  - Dla Go 10.3 Gen II, Meebook i Bigme: [niepotwierdzone], sprawdza to T-10.
- **Firmware Boox zabija aplikacje w tle.**
  - Przyczyny: App Freeze, ograniczone domyślnie „Stay active in the background”, zabijanie ok. 10 s po starcie, force-stop z `system_server`, wyłączanie pakietu przez `com.onyx` ([Palma 2 Pro tips](https://github.com/Kisuke-CZE/Palma_2_Pro-tips), [boox-tracker](https://github.com/otherguy/boox-tracker/blob/main/agents/verification.md)).
  - Zatrzymane odpytywanie oznacza, że flaga nie dotrze na tablet. Sprawdza to T-04.
- **Firmware Boox nie da się cofnąć** ([Good e-Reader](https://goodereader.com/blog/onyx-boox/some-older-boox-models-launched-years-back-still-getting-latest-update)). Dlatego:
  - zatwierdzamy pary model + firmware;
  - numer firmware zapisujemy przed pierwszym połączeniem z Wi-Fi;
  - blokujemy aktualizator OTA producenta (nazwa jego pakietu: [niepotwierdzone]).
- **Odświeżanie EPD.**
  - Boox: przez Onyx SDK (`onyxsdk-device` 1.1.11, `EpdController`, repozytorium Maven dostępne tylko po HTTP, [OnyxAndroidDemo](https://github.com/onyx-intl/OnyxAndroidDemo)) albo przez kontroler Onyx/Qualcomm, jak robi to KOReader ([DeviceInfo.kt](https://github.com/koreader/android-luajit-launcher/blob/master/app/src/main/java/org/koreader/launcher/device/DeviceInfo.kt)).
  - Meebook na RK3566 i Bigme nie mają oficjalnego SDK, ale da się to zrobić bez niego:
    - Meebook: refleksja wzorem KOReader;
    - Bigme: `XrzEinkManager` z [inżynierii wstecznej](https://github.com/imedwei/inksdk/blob/main/docs/bigme-sdk-reverse-engineered.md); aktualizacja OTA może to zepsuć.
  - Przy stałym obrazie pełne odświeżenie co najmniej raz na dobę ([Crystalfontz](https://www.crystalfontz.com/blog/?p=2698)).
  - Na panelu kolorowym pełne odświeżenie musi iść w trybie z kolorem, a szybkie tryby gubią kolor (niżej, K-04 i K-05).

**Kolorowe tablety e-ink (stan na 12.10.2026)**

- **Makiety tabletu są kolorowe** (paleta `t-*` w `docs/paleta.md`): kolor tylko w dużych polach, na kolorze tylko pogrubiony czarny albo biały tekst, a drabina jasności (papier 255, OK 204, uwaga 146, krytyczna 66, atrament 0) jest czytelna w szarości. Ekran musi działać także na czarno-białym e-inku. Kolorowe (Kaleido 3, Gallery 3) i czarno-białe (Carta) panele są równorzędnymi kandydatami.
- **Kaleido 3 to filtr barwny nałożony na czarno-białą folię Carta.**
  - 16 poziomów szarości i 4096 kolorów, 300 ppi w czerni i bieli, 150 ppi w kolorze ([E Ink](https://www.eink.com/brand/detail/Kaleido3)), czyli w kolorze połowa rozdzielczości ([zestawienie urządzeń PocketBook](https://github.com/dgalli1/EinkHome/blob/main/resources/pocketbook-devices.md)).
  - Kolor powstaje z poziomów szarości pod filtrem RGB: 16 poziomów na kanał, stąd 4096 kolorów ([Good e-Reader](https://goodereader.com/blog/?p=348641)).
  - Ekran jest ciemniejszy i bardziej szary niż mono, z lekko zielonym odcieniem. W większości warunków trzeba włączyć podświetlenie ([myereader](https://myereader.substack.com/p/kobo-libra-colour-review-e-ink-colour), [eWritable](https://ewritable.net/guides/color-vs-monochrome-eink-screens/), [Android Authority](https://www.androidauthority.com/color-e-ink-not-ready-yet-3624449)).
  - E Ink nie publikuje czasów odświeżania koloru dla Kaleido 3 ([myereader](https://myereader.substack.com/p/differences-between-e-ink-kaleido)). Czas pełnego odświeżenia z kolorem mierzymy sami (K-04).
- **Skala makiety (wyliczenie).** Makieta to pion 702×936, proporcje 3:4 jak 1404×1872. Ma dokładnie rozdzielczość koloru Kaleido 3 7,8″.
  - Note Air6 C (10,3″): 1 px makiety ≈ 2,65 px cz-b ≈ 1,32 px koloru ≈ 0,22 mm. Kafel 44 px ma ok. 9,8 mm, tekst 19 px ok. 4,2 mm, lewy pasek 10 px ok. 2,2 mm.
  - Note Mini C (8,52″): 1 px makiety ≈ 0,19 mm.
  - Go Color 7 Gen II (7″): 1 px makiety ≈ 0,15 mm. Siatka koloru 632×840 jest tu rzadsza niż siatka makiety.
- **Gallery 3 (ACeP, bez filtra barwnego).**
  - 300 ppi także w kolorze, ale wolniejsze odświeżanie: 350 ms w czerni i bieli, 500 ms w szybkim trybie koloru, 750–1000 ms w standardowym, 1500 ms w najlepszym. Praca w zakresie 0–50 °C ([E Ink](https://www.eink.com/brand/detail/Gallery_3)).
  - Recenzenci opisują kolory jako blade ([myereader](https://myereader.substack.com/p/differences-between-e-ink-kaleido)).
  - Jedyny znaleziony tablet z Androidem i Gallery 3 to Bigme Galy z Androidem 11, z 2023 r. ([Notebookcheck](https://www.notebookcheck.net/Bigme-Galy-8-inch-eReader-launches-with-colour-display-and-Google-Play-Store-access.669163.0.html)). Nowszego nie znaleziono [niepotwierdzone].
  - Profil Gallery 3 z palety nie ma więc na czym się sprawdzić.
- **Szybkie tryby gubią kolor.**
  - Według dokumentacji E Ink tryby DU i A2 przeprowadzają piksel tylko do czerni albo bieli ([Advantech, EPD](https://ess-wiki.advantech.com.tw/view/EPD-130_application_tech), [instrukcja E Ink](https://shopkits.eink.com/en/download/0223011714sy884942/User%20Manual%20-%207.8''ePaper%20Display%20%28VB3300-GHA%29.pdf)).
  - Pole koloru na Kaleido 3 wymaga pośrednich poziomów szarości, więc w A2 i DU kolor zniknie. To wniosek z zasady działania; zachowanie Note Air6 C: [niepotwierdzone], sprawdza to K-05.
  - Boox ustawia tryb odświeżania (HD, Balanced, Fast, Ultrafast, Regal) i wzmocnienie ciemnych kolorów osobno dla każdej aplikacji w E-Ink Center ([YesPress](https://yespress.io/products/boox-go-color-7-gen-ii)).
  - „Smooth Mode” z BSR na Note Air6 C działa także w aplikacjach zewnętrznych ([BOOX](https://shop.boox.com/blogs/news/introducing-boox-note-air6-c-a-refined-10-3-color-epaper-notebook-for-knowledge-workers)).
  - Dla naszej apki te ustawienia trzeba zamrozić. Czy da się to zrobić bez ręcznego klikania: [niepotwierdzone].
- **Device Owner i Lock Task na kolorowych Boox: to samo ryzyko co na mono.**
  - Jedyna znaleziona publiczna próba `dpm set-device-owner` na Boox ([r/Onyx_Boox, 02.2025](https://www.reddit.com/r/Onyx_Boox/comments/1ihrbpy/using_adb_to_setdeviceowner/)) skończyła się błędem. Autor podejrzewał blokadę Boox, ale przyczyny nie ustalono [niepotwierdzone].
  - Najczęstsza przyczyna takiego błędu to konto na urządzeniu ([OwnDroid](https://github.com/BinTianqi/OwnDroid)). Przed T-01 nie logujemy się więc ani do Google, ani do konta BOOX. Czy konto BOOX jest kontem Androida blokującym DO: [niepotwierdzone].
- **Aktualizacje Androida.**
  - Boox zwykle nie podnosi głównej wersji Androida. Wyjątkiem jest Go 6 Gen II, który w 09.2026 dostał Androida 13 ([Notebookcheck](https://www.notebookcheck.net/Onyx-rolls-out-Android-13-update-for-Boox-Go-6-Gen-II.1407708.0.html)).
  - Zakładamy, że Note Air6 C zostanie na Androidzie 16. Harmonogram poprawek bezpieczeństwa: [niepotwierdzone].
- **Zimno.**
  - Zakres pracy tabletów z Kaleido 3: [niepotwierdzone].
  - Kaleido 3 Outdoor (−15…65 °C) to panele do digital signage bez dotyku, a nie tablety ([E Ink](https://www.eink.com/news/detail/E-Ink-Launches-E-Ink-Kaleido-3-Outdoor-ePaper-Technology)).
  - T-22 obejmuje też pełne odświeżenie koloru i ghosting w zimnie.

**Kolorowi kandydaci**

| Model | Ekran | Android i aktualizacje | ADB, DO, Lock Task | Limit ładowania, praca 24/7 | Wi-Fi | Dostępność PL/UE | Rola |
|---|---|---|---|---|---|---|---|
| **Boox Note Air6 C**, 10,3″ (globalnie 15.09.2026, [BOOX](https://shop.boox.com/blogs/news/introducing-boox-note-air6-c-a-refined-10-3-color-epaper-notebook-for-knowledge-workers); w Japonii 21.09.2026, [smartwatchlife](https://www.smartwatchlife.jp/81239/)) | Kaleido 3, 2480×1860 (300 ppi) cz-b, 1240×930 (150 ppi) kolor ([Android Authority](https://www.androidauthority.com/boox-note-air6-c-3711609/)). Podświetlenie z regulacją barwy (CTM) ([Inet](https://www.inet.se/produkt/6613387/onyx-boox-note-air6-c)). BSR i „Smooth Mode”. Producent mówi tylko o „najszybszym ekranie BOOX” i o 40% szybszym otwieraniu i przewracaniu stron niż w Air5 C; czasu odświeżenia koloru nie podaje [niepotwierdzone]. | Android 16 ([BOOX](https://shop.boox.com/products/noteair6c)). Firmware nie da się cofnąć ([Good e-Reader](https://goodereader.com/blog/onyx-boox/some-older-boox-models-launched-years-back-still-getting-latest-update)); skok wersji Androida mało prawdopodobny. | ADB w FW 4.3: Boox Settings › More Settings › USB Debug Mode ([BooxUltimatum](https://github.com/huuunleashed/BooxUltimatum)). DO i Lock Task: [niepotwierdzone]. Aparat do provisioningu QR: [niepotwierdzone]. | Charging protection 80% potwierdzona na FW 4.3 ([eksperymenty](https://github.com/huuunleashed/BooxUltimatum/blob/main/knowledge/experiments.md)). Według BOOX ciągłe, jasne podświetlenie skraca czas pracy na baterii ([The Gadgeteer](https://the-gadgeteer.com/?p=527166)). 24/7: [niepotwierdzone] (T-11). | „Wi-Fi + BT 6.0” ([BOOX](https://shop.boox.com/products/noteair6c)); Wi-Fi 6 według [Komputronik](https://www.komputronik.pl/product/1032275/czytnik-e-book-onyx-boox-note-air-6-c-szary.html) i [Mobile-review](https://mobile-review.com/all/news/onyx-boox-privezla-v-rossiyu-note-air-6-c-i-palma-3/). Pasma 2,4 i 5 GHz: [niepotwierdzone] (T-13). | PL: [Komputronik](https://www.komputronik.pl/product/1032275/czytnik-e-book-onyx-boox-note-air-6-c-szary.html) (dostawa z oczekiwaniem). UE: [LDLC](https://www.ldlc.com/en/product/PB00754914.html), [Inet](https://www.inet.se/produkt/6613387/onyx-boox-note-air6-c). | **Kandydat nr 1: tablet do domu, etap 0 i dalej.** |
| **Boox Note Air5 C**, 10,3″ (10.2025, [The eBook Reader](https://blog.the-ebook-reader.com/2025/10/20/new-boox-note-air5-c-runs-android-15-and-supports-emr-stylus/)) | Kaleido 3, 300 i 150 ppi, CTM, BSR ([Parkablogs](https://parkablogs.com/content/boox-note-air5-c-tablet-review)). W biurze podświetlenie na ok. 50% ([Android Authority](https://www.androidauthority.com/color-e-ink-not-ready-yet-3624449)). „Duchy” przy obrazach ([TechRadar](https://www.techradar.com/tablets/ereaders/onyx-boox-note-air5-c-review)). | Android 15 | Ta sama rodzina firmware co Air6 C. DO: [niepotwierdzone]. | [niepotwierdzone] | 2,4 i 5 GHz, 802.11ac ([TechRadar](https://www.techradar.com/tablets/ereaders/onyx-boox-note-air5-c-review)) | PL: [x-kom](https://www.x-kom.pl/p/1542740-czytnik-ebook-onyx-boox-note-air-5-c-64gb-szary.html). UE: [Galaxus](https://www.galaxus.de/en/s1/product/onyx-boox-note-air5-c-1030-64-gb-ereader-64701965). | Rezerwa, gdyby Air6 C był niedostępny. Ten sam panel, starszy Android. |
| **Boox Note Mini C**, 8,52″ (zapowiedź 15.09.2026; w sprzedaży „wkrótce” według [Diario Estrategia](https://www.diarioestrategia.cl/texto-diario/mostrar/6017173/boox-actualiza-cuadernos-digitales-tinta-electronica-note-air6-c-note-mini-c-palma-3)) | Kaleido 3, 2048×1536 (300 ppi) cz-b, 1024×768 (150 ppi) kolor ([BOOX](https://shop.boox.com/products/noteminic)). Podświetlenie: [niepotwierdzone]. | Android 16 ([BOOX](https://shop.boox.com/products/noteminic)) | Jak Air6 C: [niepotwierdzone]. | [niepotwierdzone] | „Wi-Fi + BT 6.0” ([BOOX](https://shop.boox.com/products/noteminic)); pasma: [niepotwierdzone]. | [niepotwierdzone] | Rezerwa, gdyby 10,3″ nie mieścił się w obudowie przy boksie. Mniejsze pola, więc decyduje T-20. |
| **Boox Go Color 7 Gen II**, 7″ (04.2025, [BOOX przez Barchart](https://www.barchart.com/story/news/32065972/boox-unveils-go-7-series-portable-ereaders-for-immersive-reading-and-instant-idea-capture)); Gen III nie znaleziono [niepotwierdzone] | Kaleido 3, 1680×1264 cz-b, 840×632 kolor ([x-kom](https://www.x-kom.pl/p/1542815-czytnik-ebook-onyx-boox-go-7-color-ii-gen-64gb-czarny.html)). MOON Light 2 z CTM ([BOOX](https://onyxboox.com/boox_gocolor7g2)). Według TechRadar ekran jest żółtawy, podświetlenie słabsze, a „duchy” stałe ([TechRadar](https://www.techradar.com/tablets/ereaders/onyx-boox-go-color-7-gen-ii-review)). | Android 13 | Firmware Boox. DO: [niepotwierdzone]. | [niepotwierdzone] | dwa pasma ([BOOX](https://onyxboox.com/boox_gocolor7g2)) | PL: [x-kom](https://www.x-kom.pl/p/1542815-czytnik-ebook-onyx-boox-go-7-color-ii-gen-64gb-czarny.html), [Komputronik](https://www.komputronik.pl/product/968931/czytnik-e-book-onyx-boox-go-7-color-ii-gen-czarny.html). UE: [LDLC](https://www.ldlc.com/en/product/PB00684465.html). | Tylko gdy T-20 pokaże, że 7″ wystarcza. Siatka koloru jest rzadsza niż makieta. |
| **Boox Tab Mini C**, 7,8″ (2023) | Kaleido 3, 1872×1404 cz-b, 936×702 kolor ([Good e-Reader](https://goodereader.com/blog/?p=365481)) | Android 11 | — | — | — | Wycofany ze sprzedaży ([Notebookcheck](https://www.notebookcheck.net/Boox-planning-four-new-devices-including-Palma-3-and-a-likely-successor-to-the-Tab-Mini-C.1370054.0.html)) | Odrzucony. |
| **Bigme Galy**, 8″ (Kickstarter 2022, wysyłka 2023) | Gallery 3, 1920×1440, 300 ppi także w kolorze ([Notebookcheck](https://www.notebookcheck.net/Bigme-Galy-8-inch-eReader-launches-with-colour-display-and-Google-Play-Store-access.669163.0.html)). Czasy odświeżania i 0–50 °C według [E Ink](https://www.eink.com/brand/detail/Gallery_3). Podświetlenie z regulacją barwy ([Parkablogs](https://www.parkablogs.com/content/review-bigme-galy-worlds-first-e-ink-gallery-3-tablet)). | Android 11 | DO: [niepotwierdzone]. EPD tylko przez API z [inżynierii wstecznej](https://github.com/imedwei/inksdk/blob/main/docs/bigme-sdk-reverse-engineered.md). | [niepotwierdzone] | 2,4 i 5 GHz ([Parkablogs](https://www.parkablogs.com/content/review-bigme-galy-worlds-first-e-ink-gallery-3-tablet)) | [niepotwierdzone] | Jedyny Android z Gallery 3. Odrzucony: Android 11, wiek, niepewna dostępność. |
| **Bigme B10**, 10,3″ (01–02.2026, [Notebookcheck](https://www.notebookcheck.net/Bigme-B10-color-E-Ink-tablet-gets-a-12GB-RAM-version-in-China.1330521.0.html)) | Kaleido 3, podświetlenie z regulacją barwy. Rozdzielczość koloru podawana rozbieżnie ([Android Authority](https://www.androidauthority.com/bigme-b10-tablet-launch-3637013/), [Parkablogs](https://parkablogs.com/content/bigme-b10-e-paper-tablet-review)). | Android 14 ([Android Authority](https://www.androidauthority.com/bigme-b10-tablet-launch-3637013/)) | Aparat 20 MP ([Parkablogs](https://parkablogs.com/content/bigme-b10-e-paper-tablet-review), [Liliputing](https://liliputing.com/?p=196870)), więc provisioning QR jest teoretycznie możliwy [niepotwierdzone]. DO: [niepotwierdzone]. Mocno przerobiony firmware ([eWritable](https://ewritable.net/brands/bigme/firmware/4-6/)). | [niepotwierdzone] | Wi-Fi 6 i LTE ([Parkablogs](https://parkablogs.com/content/bigme-b10-e-paper-tablet-review), [Mezha](https://mezha.ua/en/news/bigme-b10-e-ink-tablet-308192/)) | [niepotwierdzone] | Warunkowo: inna rodzina firmware w 10,3″, gdyby Air6 C odpadł na DO. LTE jest zbędne. |
| **Bigme B1051C**, 10,3″ (2024/2025) | Kaleido 3, 300 i 150 ppi. Według recenzji ekran jest wyraźnie ciemniejszy od mono, a podświetlenie pomaga ([Parkablogs](https://www.parkablogs.com/index.php/content/review-bigme-b1051c-ereader-with-keyboard-case)). | Android 14 ([Notebookcheck](https://www.notebookcheck.net/Bigme-B1051C-Tablet-comes-with-Android-14-a-color-E-Ink-display-an-EMR-pencil-and-keyboard-support.904799.0.html)) | DO: [niepotwierdzone]. Aparat: [niepotwierdzone]. EPD przez API z inżynierii wstecznej. | [niepotwierdzone] | [niepotwierdzone] | [niepotwierdzone] | Zamiennik B10 bez LTE. |
| **Bigme B751C-S**, 7″ | Kaleido 3, 300 i 150 ppi, CTM ([Parkablogs](https://www.parkablogs.com/content/bigme-b751c-s-colour-e-ink-tablet-review)) | Android 14 | EPD przez API z inżynierii wstecznej. DO: [niepotwierdzone]. | [niepotwierdzone] | dwa pasma ([Parkablogs](https://www.parkablogs.com/content/bigme-b751c-s-colour-e-ink-tablet-review)) | Premiera w Chinach ([Notebookcheck](https://www.notebookcheck.net/Bigme-B751C-S-color-e-reader-with-stylus-support-launched-in-China.1190990.0.html)). UE: [niepotwierdzone]. | Tylko jako drugi producent w 7″. |
| **PocketBook InkPad Eo 2**, 10,3″ (zapowiedź 09.2026, [PocketBook](https://pocketbook.ch/en-ch/news/pocketbook-inkpad-eo-2-news-ch); targi we Frankfurcie według [ifeng](https://tech.ifeng.com/c/8x4yRMDUT2O)) | Kaleido 3, podświetlenie SMARTlight ([PocketBook](https://pocketbook.ch/en-ch/news/pocketbook-inkpad-eo-2-news-ch)) | Android 14 ([PocketBook](https://pocketbook.ch/en-ch/news/pocketbook-inkpad-eo-2-news-ch)). Poprzednik miał Androida 11 i „duchy” ([ComputerBase](https://www.computerbase.de/artikel/tablets/pocketbook-inkpad-eo-e-book-reader-test.88903/seite-3)). | ADB, DO, SDK do EPD: [niepotwierdzone] | [niepotwierdzone] | Wi-Fi 5, tylko według [comparisontabl.es](https://comparisontabl.es/e-readers/pocketbook-inkpad-eo-2/) [niepotwierdzone] | Data i sklepy w PL: [niepotwierdzone] | Obserwować po premierze jako trzecią rodzinę firmware. |

**Co kupujemy**

| Pozycja | Ile | Po co | Na co uważać / rekomendacja |
|---|---|---|---|
| **Boox Note Air6 C** (kandydat nr 1), etap 0 | 1 (z zestawu minimalnego, 1.0) | Biurko developera (ADB, build debug, wielokrotne resety, próby DPC), provisioning, kiosk, 72 h pracy, testy palety K-01…K-07. Po etapie 0 zostaje na biurku. | Kolorowy Kaleido 3 10,3″, Android 16, szybszy SoC niż Go 10.3 Gen II ([Notebookcheck](https://www.notebookcheck.net/Boox-Note-Air6-C-tablet-debuts-with-10-3-color-E-Ink-display-Android-16-faster-CPU-pen-and-AI-voice-transcription.1374349.0.html)). Ten sam firmware Boox i Onyx SDK co modele mono. Charging protection 80% potwierdzona na FW 4.3. Przed zamówieniem sprawdzić w ofercie: pasma Wi-Fi (pewne jest tylko „Wi-Fi + BT 6.0”; 2,4 i 5 GHz [niepotwierdzone], T-13) oraz sprzedaż i gwarancję w UE (w Polsce Komputronik, dostawa z oczekiwaniem). Ładowarki w pudełku nie zakładamy [niepotwierdzone]. Wszystkie sztuki z jednego źródła. Jedna relacja mówi, że po restarcie procesu systemowego ekran przestał usypiać (sprawdza to T-09). |
| Boox Note Air6 C, etap 1 | +6 (propozycja) | 4 sztuki do konfiguracji produkcyjnej: „Hala główna”, boks 4 (Sonata) i boks 7 (Kasztan); „Hala nowa”, boks 4 (Bella) i boks 6 (wolny). Tablet zapisuje id boksu, a ekran pokazuje halę razem z numerem. 1 sztuka do testów niszczących: komora zimna, rozładowanie do zera, setki cykli zasilania, przerwane aktualizacje. 1 sztuka referencyjna z zamrożonym firmware, zarazem zapas. | Kupić dopiero po zaliczeniu bramki (B) oraz K-01 i K-05. Firmware nowych sztuk może być nowszy niż zatwierdzony, a cofnąć go się nie da: numer sprawdzić przed pierwszym Wi-Fi. Wymiary, masę, pojemność baterii i moc ładowania wziąć z karty produktu przed zamówieniem ramek (1.2) [niepotwierdzone]. Boks 4 jest w obu halach, więc dwa tablety z tym samym numerem sprawdzają, że tablet wysyła id boksu, a nie numer (T-28, A-10). |
| Boox Go 10.3 Gen II Lumi (porównanie z mono, wariant czarno-biały) | 0 (warunkowo 1) | Prawdziwy panel Carta na tym samym firmware co Air6 C: K-06 oraz K-01…K-04 w tej samej formie. Dokupić tylko wtedy, gdy coś nie zadziała (rekomendacja, pkt 2). | Najnowszy monochromatyczny tablet Boox 10,3″ z podświetleniem i Androidem 15 (premiera 03.2026), proporcje 3:4 zgodne z makietami. Ryzyka: Device Owner, nakładki Boox, zabijanie aplikacji, pasmo 2,4 GHz, zawodny dotyk według recenzji [niepotwierdzone]. Przed zamówieniem sprawdzić w ofercie: podświetlenie (KOReader zna dla Gen II tylko `go103_2lumi`; czy jest wariant bez podświetlenia, [niepotwierdzone]); oba pasma Wi-Fi (pewne jest tylko „Wi-Fi 5”, [comparisontabl.es](https://comparisontabl.es/e-readers/boox-go-10-3-gen-ii/)); sprzedaż i gwarancja w UE (Gen II jest w [Galaxus DE](https://www.galaxus.de/en/s1/product/onyx-boox-go-103-gen-2-1030-64-gb-ereaders-69696534); Lumi w UE i w Polsce [niepotwierdzone]; Szwajcaria nie jest w UE). W zestawie nie ma ładowarki. Specyfikacje ze sklepów traktować jako orientacyjne: 235 × 183 × 4,6–4,8 mm, ok. 360 g, 3700 mAh, Android 15, ładowanie 5–18 W, a dla Lumi według części sklepów 5–15 W ([JB Hi-Fi](https://www.jbhifi.com.au/products/boox-go-10-3-gen-2-ereader-300ppi-monochrome-e-ink), [digitec Gen II](https://www.digitec.ch/en/s1/product/onyx-boox-go-103-gen-ii-1030-64-gb-ereaders-69696534), [digitec Lumi](https://www.digitec.ch/en/s1/product/onyx-boox-go-103-2nd-gen-lumi-1030-64-gb-ereaders-69291196)). |
| Meebook M8 | 0 (warunkowo 1) | Inny producent i firmware w czerni i bieli: sprawdza, czy DPC i apka nie są przywiązane do Onyx, oraz dolną granicę czytelności przy 7,8″. Nie służy do porównania panelu z Air6 C, bo różni się producentem, firmware i SoC. Poza zestawem minimalnym; dokupić, gdy Air6 C odpadnie na DO albo Lock Task przez firmware Boox (rekomendacja, pkt 4). | 7,8″ Carta HD mono, 300 ppi, podświetlenie, Android 14 z Play ([Notebookcheck](https://www.notebookcheck.net/M8-New-e-book-reader-comes-with-Android-and-stylus-support.1019867.0.html), [lx-music-eink](https://github.com/shellsec/lx-music-eink/blob/main/README.en.md)). Dostępność w UE: [niepotwierdzone]. SoC nieznany, więc pierwszy krok to `getprop ro.board.platform`. Zamiennik: Bigme B751C-S z Androidem 14 ([Parkablogs](https://www.parkablogs.com/content/bigme-b751c-s-colour-e-ink-tablet-review)), kolorowy 7″ Kaleido 3, ale odświeżanie działa tylko przez API z inżynierii wstecznej. |
| Wzorzec Device Owner i plan B: Samsung Galaxy Tab Active5 (SM-X300, Wi-Fi), do tego emulator AOSP | emulator; Tab Active5: 0 (warunkowo 1) | Pozwala odróżnić błąd naszego DPC od blokady w firmware e-ink (T-01, T-02, T-24). Plan B, gdy Air6 C nie przejdzie bramki (B), obok innej rodziny firmware e-ink (rekomendacja, pkt 4). | Najpierw emulator Androida 15/16 bez Play; dokumentacja [dedicated devices](https://developer.android.com/work/dpc/dedicated-devices) opisuje ADB jako ścieżkę developerską. Tab Active5 dokupić, gdy T-01 albo T-02 nie przejdą na Air6 C. Jako plan B przy boksie to ekran LCD, a nie e-ink: czytelność (T-20) i pracę 24/7 na zasilaczu (T-10, T-11) trzeba sprawdzić osobno. Jego No Battery Mode wymaga Knox Manage z KSP i licencją Knox ([KBA-489](https://docs.samsungknox.com/admin/knox-manage/kbas/kba-489-enable-no-battery-mode/)), więc w roli wzorca DO go nie testujemy. Poprawki bezpieczeństwa kończą się 01.2029 ([endoflife.date](https://github.com/endoflife-date/endoflife.date/blob/master/products/samsung-galaxy-tab.md)). |
| Tablety do stajni pilotażowej | po jednym na boks wybranej hali (albo jej części) + 2 | Etap 2. | Note Air6 C albo model, który go zastąpił po porównaniu, z tą samą zatwierdzoną wersją firmware. |

**Odrzucone i poza zakresem**
- Tab Mini C (7,8″, Kaleido 3): Android 11, wycofany ze sprzedaży.
- Tab Ultra C Pro (10,3″, Kaleido 3, Android 12, aparat 16 MP, 2023; [BOOX](https://onyxboox.com/boox_tabultracpro)): stary Android.
- Note Air4 C: poprzednia generacja z Androidem 13 ([Parkablogs](https://parkablogs.com/content/boox-note-air5-c-tablet-review)).
- Tab X C ([BOOX](https://onyxboox.com/boox_tabxc)): 13,3″, za duży i za ciężki.
- Note Max: bez podświetlenia.
- Bigme Galy (Gallery 3): Android 11, wiek, niepewna dostępność (rekomendacja, pkt 5).
- PocketBook InkPad Eo: Android 11. Następcę, InkPad Eo 2 z Androidem 14, obserwujemy po premierze (tabela kolorowych kandydatów).
- reMarkable Paper Pro (Gallery 3): system na Linuksie, bez Androida ([XP-Pen](https://www.xp-pen.com/blog/color-e-ink-tablet.html)).
- PocketBook Viva (Gallery 3, [Root Nation](https://root-nation.com/pl/news-pl/pl-pocketbook-viva/)): system PocketBook, a nie Android [niepotwierdzone].
- Hisense: brak aktualnego tabletu e-ink z Androidem.
- Panele e-paper do digital signage, także Kaleido 3 Outdoor: bez dotyku, więc nie da się zapisać szybkich akcji ani potwierdzić flagi (w stajni z potwierdzeniami).
- Palma 3, Palma 2 Pro (6,13″, [Notebookcheck](https://www.notebookcheck.net/Boox-Palma-2-Pro-hands-on-review-Colorful-5G-e-reader-with-Android.1253300.0.html)), Viwoods AiPaper Reader C (6,13″, Kaleido 3, Android 16; [heyupnow](https://heyupnow.com/en-de/products/viwoods-aipaper-reader-c)), Go 6 Gen II, Picco: za małe ekrany.
- Boox Go 7 (7″ mono, Android 13) zostaje w rezerwie na wypadek, gdyby M8 był niedostępny, a 7″ okazało się wystarczające w T-20. W kolorze tę rolę ma Go Color 7 Gen II (tabela kolorowych kandydatów).

**Rekomendacja: kolorowy Note Air6 C jako kandydat nr 1, mono i wzorzec DO warunkowo**
1. **Boox Note Air6 C: tablet do domu, etap 0 i dalej.**
   - Etap 0: 1 sztuka z zestawu minimalnego (1.0). Służy jako biurko developera, do provisioningu (wielokrotne resety) i do 72 h pracy, a także do testów palety K-01…K-07. Numer firmware zapisujemy przed pierwszym Wi-Fi, a przed T-01 nie zakładamy żadnych kont.
   - Za: Android 16; Kaleido 3 w 10,3″ i proporcjach 3:4 jak makiety; potwierdzony limit ładowania 80% i procedura ADB w FW 4.3; ten sam Onyx SDK co w modelach mono, przewidziany w module Kotlin; dostępny w Polsce.
   - Ryzyka:
     - DO i Lock Task [niepotwierdzone];
     - firmware zabija aplikacje w tle;
     - firmware nie da się cofnąć;
     - ciemniejszy ekran wymaga stałego podświetlenia;
     - pasma Wi-Fi [niepotwierdzone];
     - szybkie tryby i „Smooth Mode” mogą zgubić kolor.
   - Etap 1, po bramce (B) i po K-01 i K-05: +6 sztuk (propozycja).
     - 4 do konfiguracji produkcyjnej: Hala główna, boks 4 (Sonata) i boks 7 (Kasztan); Hala nowa, boks 4 (Bella) i boks 6 (wolny). Tablet zapisuje id boksu, a ekran pokazuje halę razem z numerem.
     - 1 do testów niszczących.
     - 1 referencyjna z zamrożonym firmware, zarazem zapas.
     - Sztuka z etapu 0 zostaje na biurku.
   - Etap 2: tablety tej samej pary model + firmware na boksy jednej hali stajni pilotażowej (albo jej części) i 2 zapasowe.
2. **Porównanie z mono: Boox Go 10.3 Gen II Lumi**, dokupowany tylko wtedy, gdy coś nie zadziała.
   - Dlaczego ten model: ten sam producent i rodzina firmware, 10,3″, Carta 300 ppi z podświetleniem, Android 15 ([digitec](https://www.digitec.ch/en/s1/product/onyx-boox-go-103-2nd-gen-lumi-1030-64-gb-ereaders-69291196), [JB Hi-Fi](https://www.jbhifi.com.au/products/boox-go-10-3-gen-2-ereader-300ppi-monochrome-e-ink)). Różni się od Air6 C głównie panelem, więc K-01…K-06 porównują kolor z czernią i bielą bez zmiany reszty.
   - Dokupić, gdy:
     - K-01 pokaże, że pola koloru są gorzej czytelne niż te same pola w szarości;
     - K-05 pokaże, że firmware wymusza tryb gubiący kolor;
     - K-06 na emulacji wypadnie na granicy progu;
     - albo przed etapem 2 trzeba potwierdzić wariant czarno-biały na prawdziwym panelu.
   - Meebook M8 nie służy do porównania panelu, bo różni się producentem, firmware i SoC. Zostaje poza zestawem minimalnym (pkt 4).
3. **Samsung Galaxy Tab Active5 jako wzorzec Device Owner i plan B.** Dokupić tylko wtedy, gdy T-01 albo T-02 nie przejdą na Air6 C. Pozwala odróżnić błąd naszego DPC od blokady w firmware.
4. **Gdy Air6 C odpadnie:**
   - na DO albo Lock Task przez firmware Boox: inne modele Boox (Air5 C, Note Mini C, Go Color 7 Gen II, Go 10.3 Gen II) mają prawdopodobnie ten sam problem [niepotwierdzone]. Dalej idą Tab Active5 jako plan B albo inna rodzina firmware: Bigme B10 lub B1051C, a po premierze PocketBook InkPad Eo 2; w czerni i bieli Meebook M8 (zamiennik: Bigme B751C-S);
   - na czytelności koloru (K-01) albo trybach odświeżania (K-05): Go 10.3 Gen II Lumi (ten sam firmware, panel Carta);
   - na wymiarach obudowy: Note Mini C, gdy wejdzie do sprzedaży.
5. **Gallery 3 nie kupujemy.** Bigme Galy ma Androida 11, a jego dostępność jest [niepotwierdzone]. Profil Gallery 3 w `packages/theme` zostaje nieprzetestowany na sprzęcie. Czy go utrzymywać, rozstrzyga sekcja 5.

Uwagi do wyboru:
- **Plan B to tablet z działającym Device Ownerem (Tab Active5 albo e-ink innej rodziny firmware), a nie rezygnacja z DO.** Cicha instalacja APK, autostart, blokada OTA i Lock Task wymagają DO.
- Równolegle zapytać Onyx na piśmie, przez kanał BOOX for Business, o Note Air6 C (i Go 10.3 Gen II):
  - obsługę DO i Lock Task;
  - czy konto BOOX blokuje ustawienie DO;
  - nazwę pakietu aktualizatora OTA i sposób jego blokady;
  - czy ustawienia E-Ink Center (tryb odświeżania, „Smooth Mode”, wzmocnienie ciemnych kolorów) da się ustawić z ADB albo DPC;
  - harmonogram firmware i poprawek bezpieczeństwa.

**Testy rozstrzygające wybór** (szczegóły w 4.3; progi liczbowe ustalić przed testem, sekcja 5):
- **Bramka (B), wszystkie punkty muszą przejść:**
  - T-01: Device Owner;
  - T-02: Lock Task bez możliwości ucieczki;
  - T-03: apka jako HOME i autostart;
  - T-04: ustawienia producenta i zabijanie apki;
  - T-08: autostart po rozładowaniu do zera (50 cykli, 100% udanych);
  - T-13: Wi-Fi w obu pasmach, bez usypiania;
  - T-24: cicha instalacja APK;
  - T-25: przerwana aktualizacja.
- **Kolor, przed zakupem etapu 1** (szczegóły w 4.3.1 D, testy K-01…K-07; rozszerzają T-20, T-21 i T-22):
  - K-01: czytelność pól statusu i drabina jasności;
  - K-05: tryby A2 i DU gubiące kolor.
- **Porównanie modeli, które przeszły bramkę** (Air6 C, a jeśli zostaną dokupione, także Go 10.3 Gen II Lumi albo zamiennik z pkt 4 rekomendacji):
  - T-10: limit ładowania;
  - T-11: praca ciągła (najpierw 72 h, potem 28 dni);
  - T-18: opóźnienie flagi w p95;
  - T-19: trafność dotyku w rękawicach i przez obudowę;
  - T-20: czytelność z 1,5–2 m;
  - T-21: „duchy” obrazu i odświeżanie;
  - T-22: praca w zimnie w komorze, także pełne odświeżenie koloru i ghosting w zimnie;
  - K-02: ditherowanie i ziarno;
  - K-03: ghosting koloru;
  - K-04: pełne odświeżenie przy zmianie statusu;
  - K-06: wariant czarno-biały;
  - K-07: podświetlenie w pracy ciągłej.
- **Wynik:** zatwierdzona para model + firmware, zablokowany aktualizator producenta i zamrożone ustawienia E-Ink Center dla naszej apki (K-02, K-05).

### 1.2 Montaż, zasilanie i sieć przy boksie

Zasilanie przy boksie i Wi-Fi zapewnia stajnia. Kupujemy więc tylko to, czego stanowisko testowe potrzebuje do ustalenia wymagań wobec stajni (lista w 4.5), oraz prototypy obudów i przyrządy. W stajni pilotażowej mierzymy jej zasilanie i sieć, zamiast budować własne.

**Założenia**
- **Montaż:**
  - od strony korytarza;
  - poza zasięgiem głowy konia (mierzymy go z atrapą obudowy);
  - nie na skrzydle drzwi;
  - kabel bez pętli, wprowadzony od dołu.
- **Obudowa:** prototyp w dwóch wersjach, bo od tego zależy, czy dotyk w ogóle działa: otwarty front z matową folią albo przednia szyba. Wybór po T-19.
- **Materiał: założenie ostrożne, do sprawdzenia próbkami w stajni pilotażowej.** Wszystkie źródła poniżej są [niepotwierdzone], bo przy weryfikacji ich nie otwarto.
  - Zwykły poliwęglan prawdopodobnie nie nadaje się do pracy w amoniaku ([tabela odporności PC](https://www.foxxlifesciences.in/pages/polycarbonate-chemical-compatibility-chart)).
  - HDPE i PP mają w tabelach wysokie oceny ([tabela odporności](https://www.globescientific.com//media/PDF/Library_PDF/Chemical%20Resistance%20Chart.pdf)).
  - Obudowy Spelsberg mają test DLG ([TK PC](https://www.dlg.org/en/tests/agricultural-technology-and-farm-inputs/test-reports/test-g-spelsberg-leergehaeuse-der-tk-pc-serie-mit-zubehoer), [Abox](https://pruefberichte.dlg.org/filestorage/7458.pdf)).
  - Przy podłodze amoniaku jest więcej niż wyżej ([TheHorse](https://thehorse.com/129872/ammonia-is-the-enemy/)), więc montujemy wysoko.
- **Odporność na uderzenie:** co najmniej IK08 (5 J), lepiej IK10 (20 J) ([EN 62262](https://en.wikipedia.org/wiki/EN_62262)) [niepotwierdzone].
- **Zimno:**
  - Akumulatora Li-ion nie należy ładować poniżej 0 °C ([REDARC](https://us.support.redarcelectronics.com/hc/en-us/articles/13856244101007-Why-you-should-not-charge-a-lithium-battery-below-0-C-or-32-F)) [niepotwierdzone]. Tablet, który w nieogrzewanej hali stale wisi na zasilaczu, to ryzyko do sprawdzenia w T-22.
  - Konsumencka elektronika przy boksie zwykle pracuje dopiero od 0 °C (np. [splitter U6115: 0–40 °C](https://www.welectron.com/mediafiles/productimg/arducam/Amazon/U6115_Manual.pdf)).

| Pozycja | Ile | Po co | Na co uważać / rekomendacja |
|---|---|---|---|
| Zasilacz USB-C PD 20–30 W | 1 na tablet + 2 (pierwszy z zestawu minimalnego, 1.0) | Stała praca tabletu; ładowarki w zestawie Boox nie zakładamy (Go 10.3 Gen II jej nie ma; Air6 C: [niepotwierdzone]). | Zakres temperatur pracy w karcie katalogowej, znak CE. Przy boksie trzymać w puszce, nie na wierzchu, bo kurz z siana osiada na ciepłym zasilaczu. |
| Zasilacz USB-C 5 V bez PD (np. 5 V/2,4 A) | 2 | Bilans ładowania bez PD (T-12). | Tylko na biurku albo powyżej 0 °C. |
| Kabel USB-C kątowy, 0,3–0,5 m, 3 A | 10 | Połączenie wewnątrz ramki. | Odciążenie w ramce. |
| Długie kable USB-C (długości jak przy boksie) i osłony (korytka, peszle) | według stanowiska | Odwzorowanie trasy kabla przy boksie. | Poza zasięgiem konia i gryzoni. |
| Ramka ścienna z zamkiem, otwarty front (Brateck PAD34-01) | 1 | Przymiarka wariantu A. | Zacisk 228–262 mm mieści długość 235 mm ([karta](https://www.computeralliance.com.au/brateck-anti-theft-wall-mounted-tablet-enclosure/)). Wymiary liczono dla Go 10.3 Gen II (235 × 183 mm); wymiary Note Air6 C: [niepotwierdzone], sprawdzić w karcie produktu przed zamówieniem ramki. Szerokość wnęki dla 183 mm, okno ekranu, materiał i dostępność w UE: [niepotwierdzone]. Jeśli tablet nie pasuje, wziąć inną ramkę 11″ z szerszą wnęką albo ramkę własną, nie 12,9″. |
| Prototyp ramki własnej z płyty HDPE albo PP: wersja z otwartym frontem i wersja z przednią szybą | 2 + 2 | T-19, T-29. | Szyba może zablokować dotyk pojemnościowy. Druk 3D tylko do przymiarek, bo odporność PETG i ASA na amoniak jest [niepotwierdzone]. |
| Matowa folia ochronna na ekran | 10 | Ochrona ekranu przy otwartym froncie. | Czułość dotyku przez folię, także w rękawicach. Na Kaleido 3 sprawdzić, czy folia nie obniża kontrastu pól koloru i odstępów drabiny jasności (K-01). |
| Wkręty zabezpieczające pin-in Torx, nierdzewne, z bitem i kotwami | komplet + zapas | Ochrona przed kradzieżą ([przykłady](https://www.albanycountyfasteners.com/screws-bolts/machine-screws/tamper-resistant-security-machine-screws)). | Bit tylko u serwisu; kotwy dobrane do ściany. |
| Puszka z testem DLG (np. Spelsberg TK PC) z membraną ePTFE i dławnicami od dołu | 2 | Zasilacz przy boksie w wariancie zamkniętym. | Membrana ogranicza kondensację ([Gore](https://gore.com/node/24906)). |
| Atrapa obudowy | 2 | 1–2 tygodnie przy boksie przed montażem tabletów: zasięg głowy, lizanie, gryzienie. | Może to być zapasowa ramka bez tabletu. |
| Próbki materiałów: zwykły PC, HDPE, PP, aluminium malowane proszkowo, stal nierdzewna | po 1 | Ekspozycja przy boksie przez cały pilotaż. | Ocena zmętnienia, pęknięć i korozji. |
| Opcjonalnie: zarządzalny switch PoE+ Teltonika TSW202 z zasilaczem DC na szynę DIN oraz splittery PoE+ na USB-C PD (PoE Texas GAT-USBC) | 1 + 2 | Tylko jeśli stajnia rozważa PoE zamiast gniazd przy boksie. Porównanie wariantów i test zaniku zasilania przez wyłączenie portu. | TSW202 potwierdzony: 8× PoE+, 30 W na port, 240 W łącznie, −40…75 °C, PoE włączane per port ([karta](https://teltonika-networks.com/cdn/products/2023/08/64e896612f9829-30532758/datasheet-pdf/tsw202-datasheet-v13.pdf)). GAT-USBC: PD 5–20 V, do 25,5 W ([oferta](https://reach.dog/shop/poe-texas/products/gat-usbc)); rewizja, temperatura pracy i dostawa do UE [niepotwierdzone]. Nie TL-SG1008P (PoE+ tylko na 4 portach, niezarządzalny). Nie U6115 do testu zimowego (0–40 °C). |

**Sieć stanowiska testowego**

| Pozycja | Ile | Po co | Na co uważać / rekomendacja |
|---|---|---|---|
| Router albo AP tylko dla stanowiska, 2,4 i 5 GHz | 1 | Osobny SSID. Wyłączanie radia i pasm, zmiana hasła, odcięcie WAN przy działającym Wi-Fi, ograniczenie mocy nadawania. | WPA2 i WPA3, 802.11k/v/r do włączania i wyłączania, bez portalu logowania. |
| Drugi AP (innego producenta albo zestaw mesh) | 1 | Roaming, „przyklejanie się” tabletu do dalszego AP po restarcie, limit klientów na AP. | Na stanowisku jeden kontroler. |
| Mały komputer z Linuxem (może to być dodatkowe Raspberry Pi) jako most z `tc netem` | 1 | Powtarzalne straty pakietów, opóźnienia i zerwania sterowane skryptem. | — |
| Oprogramowanie pomiarowe: [WiFiAnalyzer](https://apkmirror.com/apk/vrem-software-development/wifianalyzer-open-source/wifianalyzer-open-source-2-0-4-release), [NetSpot](https://netspotapp.com/android) ([pomiar na Androidzie](https://netspotapp.com/help/wifi-site-survey-on-android)), [iperf3](https://software.es.net/iperf) | — | RSSI i kanały na telefonie i na samym tablecie (przed włączeniem kiosku), mapa hali, przepustowość. | Od Androida 9 system dławi skany Wi-Fi; wyłączyć to w opcjach programisty. Orientacyjny cel w miejscu tabletu: RSSI ≥ −67 dBm i SNR ≥ 25 dB ([York University](https://facilities.info.yorku.ca/files/2018/11/27-21-33-Data-Comm-WIFI-AP-v3.2-20180726.pdf?x18178)) [niepotwierdzone]. |

### 1.3 Wyświetlacz centralny

**Najważniejsze fakty**
- **Raspberry Pi 5, nie Pi 4.** Ma RTC (podtrzymywany baterią), przycisk zasilania, PCIe 2.0 x1 na dysk NVMe i dwa wyjścia micro-HDMI 4Kp60 ([Raspberry Pi](https://www.raspberrypi.com/news/introducing-raspberry-pi-5/)).
- **Zasilanie:** zasilacz 27 W USB-C PD (5,1 V/5 A, [Core Electronics](https://core-electronics.com.au/raspberry-pi-5-power-supply-usb-c-pd-27w-black.html)). Bez profilu 5 A Pi ogranicza prąd portów USB do 600 mA i wyświetla ostrzeżenie ([whitepaper](https://pip-assets.raspberrypi.com/categories/685-app-notes-guides-whitepapers/documents/RP-009856-WP-1-USB%20Power%20delivery%20on%20Raspberry%20Pi%205.pdf)). Port USB telewizora się nie nadaje.
- **Trwały profil Chromium.** Wybór hali leży w localStorage, a sesja w profilu przeglądarki, więc odpadają overlay FS ([Adafruit](https://learn.adafruit.com/read-only-raspberry-pi)) i flaga `--incognito`.
- **Tylko LCD/LED, nie OLED**, bo OLED wypala się przy statycznym obrazie ([invidis](https://invidis.com/sixteen-nine/2018/10/16/long-term-tests-confirm-oleds-have-burn-in-issues-but-is-the-risk-real-in-digital-signage/)).
- **Automatyczne wyłączanie.** Telewizory w UE domyślnie przechodzą w standby po 4 h bez interakcji ([rozporządzenie 2019/2021](https://eur-lex.europa.eu/eli/reg/2019/2021/oj)); monitor signage bez tunera prawdopodobnie tej regule nie podlega [niepotwierdzone]. Monitory signage mają jawne ustawienie stanu po zaniku zasilania, np. „Power On Status” ([LG](https://manualslib.mx/manual/563119/Lg-49Xs2B.html?page=38)).
- **Czytelność:** ok. 25 mm wysokości liter na każde 3 m odległości ([WMU](https://wmich.edu/digital-accessibility/digital-signage)).
  - Na 50″ przy 1080p 1 px to ok. 0,58 mm.
  - Nazwa flagi czytana z 6 m potrzebuje więc wersalików ok. 85 px, czyli fontu ok. 120 px.
  - Pełny ekran hali musi mieć dużo większą typografię niż widok wszystkich hal.

| Pozycja | Ile | Po co | Na co uważać / rekomendacja |
|---|---|---|---|
| Raspberry Pi 5, 4 GB | 2 | Zestaw „korytarz” (wszystkie hale) i zestaw „hala” (pełny ekran jednej hali). | Etap 0: korytarz (Pi z zestawu minimalnego, 1.0, w domu na microSD i własnym telewizorze albo monitorze). Etap 1: hala. |
| Raspberry Pi 5, 2 GB | 1 | Kanarek na stanowisku: aktualizacje systemu i Chromium, test minimalnej pamięci (W-15). | Jeśli 2 GB nie wystarczy, kanarek nie zastąpi zestawu 4 GB jako zapas. Wersji 1 GB nie kupować. |
| Oficjalny zasilacz 27 W USB-C PD, wtyczka EU | 3 | Zasilanie z profilem 5 A. | Nie zasilać z USB telewizora ani zasilaczem bez profilu 5 A. |
| Oficjalna obudowa z wentylatorem | 2 | Zestaw „korytarz” (z NVMe) i kanarek. | Progi wentylatora odczytać na działającym systemie ([Raspberry Pi](https://www.raspberrypi.com/news/heating-and-cooling-raspberry-pi-5/)); wartości ze źródeł [niepotwierdzone]. |
| Pasywna obudowa aluminiowa (np. Flirc) | 1 | Zestaw „hala”; porównanie z wentylatorem na stanowisku. | Przy pełnym obciążeniu tylko opóźnia throttling ([bret.dk](https://bret.dk/flirc-raspberry-pi-5-case-review/)). Brak miejsca na M.2: [niepotwierdzone]. Porównanie tylko na stanowisku, bo w pilotażu zestawy wiszą w różnych miejscach. |
| M.2 HAT+ Compact | 1 | Dysk NVMe w zestawie „korytarz”. | Przed zamówieniem sprawdzić w product brief: czy mieści się w oficjalnej obudowie razem z jej wentylatorem przy zamkniętej pokrywie, czy przyjmuje tylko dyski 2230 i czy jest niezgodny z Active Cooler ([The Pi Hut](https://thepihut.com/products/raspberry-pi-m-2-hat-compact)) [niepotwierdzone]. Jeśli się nie mieści, nośniki porównujemy tylko na stanowisku. |
| SSD NVMe M.2 2230 z potwierdzoną zgodnością z Pi 5, najlepiej Raspberry Pi SSD | 1 | Nośnik zestawu „korytarz”. | Bez przypadkowych dysków bez raportów zgodności ([SSD Kit](https://www.raspberrypi.com/products/ssd-kit/)). |
| Oficjalna karta microSD A2, 32 lub 64 GB | 5 | System zestawu „hala” i kanarka, karta ratunkowa dla zestawu z NVMe, 2 zapasowe z gotowym obrazem (W-18). | ([Adafruit](https://www.adafruit.com/product/6011)). |
| Bateria RTC: akumulatorek ML-2020 z wtykiem JST | 3 | Poprawny zegar po zaniku prądu, także bez sieci. | Ładowanie włączyć wpisem `dtparam=rtc_bbat_vchg=3000000` ([dokumentacja](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)). Nie CR2032. Numer katalogowy SC1163: [niepotwierdzone] ([The Pi Hut](https://thepihut.com/products/rtc-battery-for-raspberry-pi-5)). |
| Oficjalny kabel micro-HDMI–HDMI: 3 × 1 m i 1 × 2 m | 4 | Port HDMI0. | Jednoczęściowy, bez przejściówek i adapterów kątowych, z odciążeniem ([Raspberry Pi](https://www.raspberrypi.com/products/micro-hdmi-to-standard-hdmi-a-cable/)). |
| Telewizor konsumencki LCD/LED 43–50″ | 1 | Zestaw „korytarz” na stanowisku testowym. W etapie 0 wystarcza własny telewizor albo monitor (1.0). | Sprawdzić w instrukcji modelu (wersja EU): stan po zaniku zasilania „On” albo „Last”; czy da się wyłączyć auto-off po 4 h i wyłączanie przy braku sygnału; HDMI-CEC z przekazywaniem klawiszy pilota; tryb bez overscanu; zakres temperatur i wilgotności; VESA; blokadę pilota; matową powłokę. Telewizora nie podłączać do internetu. |
| Monitor signage LCD 55″ lub większy, najlepiej do pracy 24/7 | 1 | Zestaw „hala”. | Power On Status, blokada przycisków, praca 24/7 i warunki pracy w europejskiej karcie produktu. CEC bywa tu okrojone; wtedy halę ustawiamy klawiaturą. Klasa 16/7 nie wystarczy, jeśli ekran ma działać całą dobę (sekcja 5). |
| Uchwyt ścienny VESA (stały albo uchylny) i mocowanie Pi z tyłu telewizora | 2 + 2 kpl. | Montaż zestawów. | Dostęp do przycisku Pi i slotu karty bez zdejmowania telewizora. Metalowe plecy telewizora mogą tłumić Wi-Fi (W-19). |
| Listwa z ochroną przeciwprzepięciową | 2 | Telewizor i zasilacz Pi z jednego miejsca. | — |
| Bezprzewodowa klawiatura z touchpadem (odbiornik USB 2,4 GHz) | 1 | Instalacja: logowanie kontem z rolą Wyświetlacz, wybór hali, „Pełny ekran”, „Wszystkie hale”. | Zostaje u osoby wdrażającej. W domu wystarczą własna klawiatura i mysz USB (1.0). |
| Czytnik kart microSD na USB i patchcordy Ethernet | 1 + 2 | Nagrywanie obrazów; porównanie LAN z Wi-Fi. | — |
| Emulator EDID | 0 | Dopiero gdy W-02 albo W-05 wykażą problem z HPD/EDID. | Sprawdzić, czy przepuszcza CEC. |
| Obudowa ochronna TV IP54+ z filtrowaną wentylacją | 0–1 | Tylko jeśli W-28 wypadnie źle. | IP54 nie chroni przed myciem ciśnieniowym. |

### 1.4 Telefony i karty SIM

| Pozycja | Ile | Po co | Na co uważać / rekomendacja |
|---|---|---|---|
| iPhone z najstarszą wersją iOS wspieraną przez wybrane Expo SDK, mały ekran | 1 | Dolna granica wydajności i układu ekranu. | — |
| iPhone najnowszy | 1 | TestFlight, Universal Links, autouzupełnianie kodu (`one-time-code`). | Każdego iPhone'a do dystrybucji ad hoc trzeba zarejestrować w EAS. |
| Android z najstarszą wspieraną wersją i małą ilością RAM | 1 | Dolna granica. | — |
| Samsung, aktualny | 1 | Najpopularniejsza nakładka systemowa. | — |
| Xiaomi albo Redmi | 1 | Agresywnie zamyka aplikacje w tle i inaczej uzupełnia kod z SMS. | — |
| Pixel, najnowszy | 1 | Czysty Android i najnowsze API. | Android 10 lub nowszy jest też potrzebny do weryfikacji urządzenia w Play Console, jeśli konto okaże się osobiste. |
| Karty SIM na kartę, z pakietem danych | ok. 12 + 2 zapasowe | Po jednej na osobę z danych przykładowych: admin konta firmy (Damian), obsługa (Paweł, Ola, Piotr), klienci (Anna, Karolina W., Tomasz L., Ewa K.), zaproszony klient (Marek Nowak), Marta (Instruktor, propozycja). Konta techniczne telewizora i tabletów logują się e-mailem, więc kart nie potrzebują. Damian, Ola, Anna i Marta mają jedno konto w obu stajniach (przełącznik stajni). | Sieci: Orange, Play, Plus i T-Mobile oraz 2–3 podmarki albo MVNO (np. nju mobile, Heyah, Virgin Mobile); jeden numer przeniesiony; opcjonalnie numer +380 (sekcja 5). Rejestracja na kartę wymaga danych osoby ([Antyweb](https://antyweb.pl/rejestracja-kart-sim-jak-to-zrobic)). Pilnować ważności kont. Nie używać tych numerów do 2FA kont Apple, Google i AWS. W SMS sandbox AWS mieści się tylko 10 zweryfikowanych numerów. |
| Modem USB LTE z kartą SIM albo telefon z Androidem przekazujący SMS-y do API testów | 1–2 | Automatyczny odczyt prawdziwych SMS-ów (OTP z Cognito, eskalacje) w przebiegu nocnym. | Custom SMS sender omija polskie sieci, więc tego testu nie zastąpi. |

### 1.5 Przyrządy na stanowisko testowe

| Pozycja | Ile | Po co | Na co uważać / rekomendacja |
|---|---|---|---|
| Gniazda albo listwa z przekaźnikami, sterowane skryptem przez lokalne API (bez chmury) | 6–8 | Cykle zaniku zasilania tabletów, AP, Pi i telewizorów (losowe przerwy 5 s–10 min, 100 cykli, log), mrugnięcia zasilania poniżej 1 s, ładowanie cykliczne modeli bez limitu ładowania. | Programowalny timer nie wystarczy (nie losuje przerw i nie prowadzi logu). Sprawdzić minimalny czas wyłączenia. Dla Shelly Plug S Gen3 ([dokumentacja](https://www.shelly.com/pl/blogs/documentation/shelly-plug-s-gen-3-device-smart-control)) wtyk typu E, zakres temperatur i 2,4 GHz są [niepotwierdzone]. |
| Tester USB-C PD z rejestracją (np. FNIRSI FNB58) | 1 | Pobór tabletu w spoczynku, przy odświeżaniu i z podświetleniem (T-12, K-07), negocjacja PD. | ([Elektor](https://www.elektor.com/products/fnirsi-fnb58-usb-tester-with-bluetooth)). |
| Komora klimatyczna albo zamrażarka z termostatem | 1 | Kontrolowany test w 0 °C i niżej przed wyborem modelu (T-22). Październik w stajni mrozu nie da. | Rejestrator w środku; po wyjęciu obserwować kondensację. |
| Rejestratory temperatury i wilgotności z pamięcią | 8 | Komora, stanowisko, nieogrzewane pomieszczenie, przy tabletach i telewizorach w stajni pilotażowej, na zewnątrz. | Zapis działa także bez Wi-Fi. |
| Elektrochemiczny miernik NH3, 0–100 ppm | 1 | Stężenie na wysokości montażu i przy podłodze, rano przed sprzątaniem i po nim. | Kalibracja. Model, np. [Forensics Detectors](https://forensicsdetectors.com/products/basic-ammonia-detector), [niepotwierdzone]. |
| Termometr na podczerwień (opcjonalnie kamera termowizyjna) | 1 | Temperatura tabletu i zasilacza w obudowie. | — |
| Luksomierz, ściemniana lampa i latarka czołowa | 1 + 1 + 1 | Czytelność przy zmierzonym oświetleniu (T-20, W-23), pola koloru i podświetlenie (K-01, K-07): półmrok hali, ciepłe światło sztuczne, światło dzienne z bramy, latarka czołowa. | Lampa o ciepłej barwie światła, jak sztuczne oświetlenie w hali. |
| Szara karta fotograficzna i aparat (może to być telefon) z ręczną ekspozycją i trybem makro | 1 | Pomiar jasności pól statusu na zdjęciach (K-01), zdjęcia makro ditherowania i ghostingu koloru (K-02, K-03). | Te same ustawienia ekspozycji w każdej serii. |
| Suwmiarka | 1 | Cotygodniowy pomiar grubości tabletów (puchnięcie baterii). | — |
| Kamera z lokalnym zapisem, do timelapse i zwolnionego tempa (może to być stary telefon) | 2 | Opóźnienie flagi (T-18), „duchy” obrazu, zawieszenia, moment pojawienia się pop-upu, pełne odświeżenie z kolorem i jego czas (K-04). | — |
| Rękawice: robocze skórzane, zimowe ocieplane, gumowe lub nitrylowe, z palcami dotykowymi; spryskiwacz | po 2 pary | T-19. | — |
| Płyta montażowa udająca korytarz, ze znacznikami 1,5 m i 2 m | 1 | Ściana z tabletami na wysokości wzroku. | — |

### 1.6 Komputery, provisioning i bezpieczeństwo kont

| Pozycja | Ile | Po co | Na co uważać / rekomendacja |
|---|---|---|---|
| Komputer z platform-tools (ADB) | 1 | Provisioning i diagnostyka tabletów. | — |
| Koncentrator USB z zasilaniem i kable USB-C z transmisją danych | 1 + 4 | Provisioning kilku tabletów naraz. | Kable tylko do ładowania nie przenoszą danych. |
| Komputer z macOS (Xcode, symulator iOS) albo runner macOS w CI | 1 | E2E na iOS: Detox działa na iOS tylko w symulatorze, a Maestro na iOS wymaga macOS. Do tego `eas build --local` dla iOS. | Runner w CI: decyzja Dawida. |
| Runner CI z wirtualizacją (KVM) | — | Emulator Androida do testów instrumentowanych modułu Kotlin. | Decyzja Dawida. |
| Klucze sprzętowe FIDO2 | 2 (główny i zapasowy) | Konto root AWS, Apple Account i konto Google właściciela kont. | — |

## 2. Konta i usługi do założenia

Czasy oczekiwania pochodzą z dokumentacji albo ze źródeł pośrednich. Gdzie nie ma potwierdzenia, punkt ma oznaczenie [niepotwierdzone]. Twierdzenia o Cognito i SMS opierają się na podlinkowanej dokumentacji AWS, ale nie przeszły niezależnej weryfikacji, więc potwierdza je spike Cognito w etapie 0 (3.6).

### 2.1 Najpierw (najdłuższe oczekiwanie)
- [ ] **Konta Apple Developer i Google Play.** Wybór rodzaju konta (organizacja czy osoba) nie należy do tego dokumentu, ale zmienia harmonogram:
  - konto organizacji wymaga numeru D-U-N-S. Według Apple jego nadanie trwa do 5 dni roboczych, a kolejne do 2 dni roboczych mijają, zanim Apple zobaczy dane ([Apple D-U-N-S](https://apple.co/308Ikbq), [wymagania](https://developer.apple.com/programs/enroll/)). Google uprzedzał, że może to trwać do 30 dni ([Android Developers Blog](https://android-developers.googleblog.com/2023/07/boosting-trust-and-transparency-in-google-play.html?hl=fr));
  - konto osobiste w Google założone po 13.11.2023 musi przed produkcją przejść test zamknięty: co najmniej 12 testerów zapisanych nieprzerwanie przez 14 dni ([wymagania](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)). Musi też potwierdzić dostęp do fizycznego urządzenia z Androidem 10 lub nowszym ([urządzenie](https://support.google.com/googleplay/android-developer/answer/14316361?hl=en)); w zestawie domowym najlepiej własny telefon z Androidem. Boox Note Air6 C (Android 16) nadaje się dopiero po testach Device Ownera, bo konto Google na urządzeniu blokuje `dpm set-device-owner` (1.1), a to, czy Google uzna Boox, jest [niepotwierdzone]. Że konta organizacji są z tego zwolnione, podają tylko źródła pośrednie [niepotwierdzone];
  - czas samej weryfikacji zgłoszenia w Apple i w Google: [niepotwierdzone].
- [ ] **Domena, DNS, strona www, skrzynki funkcyjne.**
  - Apple przy koncie organizacji wymaga publicznej strony i e-maila w domenie organizacji.
  - Ta sama domena posłuży do SES, Universal Links i App Links, polityki prywatności oraz strony usuwania konta.
  - Publiczna strona www przed logowaniem (prezentacja produktu, 3.5.5) spełnia wymóg publicznej strony; polityka prywatności i strona usuwania konta mogą być jej podstronami (propozycja).
  - Czas: godziny.
- [ ] **Wnioski w AWS, które czekają w kolejce:** wyjście z SMS sandbox, podniesienie miesięcznego limitu SMS, dostęp produkcyjny do SES. Pierwsza odpowiedź przychodzi do 24 h, decyzja bywa później ([SMS sandbox](https://docs.aws.amazon.com/sns/latest/dg/sns-sms-sandbox-moving-to-production.html), [SES FAQ](https://repost.aws/knowledge-center/ses-production-access-request-faq)).
- [ ] **Identyfikatory od nazwy produktu przed założeniem rekordów w sklepach.** Nazwa jest ustalona: EQUENOR (decyzja 13.10.2026; wcześniej robocza nazwa eKoniuszy). Repozytorium nadal nazywa się KonskaAppka, ale ta nazwa nie musi trafiać do identyfikatorów.
  - Z nazwy EQUENOR wywodzimy scope pakietów, bundle ID, `applicationId` (apka mobilna i APK tabletu) oraz nazwy w App Store i Google Play.
  - Bundle ID i `applicationId` są nieodwracalne, więc ich dokładną postać zapisujemy przed założeniem rekordów (sekcja 5).

### 2.2 Wspólne dla wszystkich kont
- [ ] Skrzynki funkcyjne w domenie (AWS root, Apple, Google), nie prywatne skrzynki jednej osoby.
- [ ] Stały numer telefonu do 2FA i kontaktów weryfikacyjnych, osobny od kart testowych.
  - W UE Apple pokazuje telefon i e-mail na stronie apki zgodnie z deklaracją DSA w App Store Connect ([pomoc](https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-eu-digital-services-act-compliance-information)).
  - Według źródła pośredniego weryfikacja trwa ok. 5 dni roboczych.
- [ ] Klucze FIDO2 (1.6) na konto root AWS, Apple Account i konto Google.
- [ ] Sejf na sekrety (narzędzie wybiera Dawid). Trafiają do niego:
  - klucz App Store Connect API;
  - klucz JSON konta usługi Google;
  - token CI do Expo;
  - keystore APK tabletu i jego kopia.

### 2.3 AWS: konto i środowiska
- [ ] Konto root z MFA i FIDO2. Ludzie pracują przez IAM Identity Center albo role. CloudTrail włączony od pierwszego dnia, alarm na nietypowy wolumen SMS. Czas: godziny.
- [ ] Osobne środowiska dev, test i prod.
  - SMS sandbox, limity SMS i sandbox SES działają per konto i per region, więc podział na konta i wybór regionu (decyzja Dawida) wyznaczają liczbę wniosków.
  - Cognito, SES i SMS mają działać w jednym regionie albo w regionie, który Cognito obsługuje.
- [ ] Dostęp serwisów i cronów z klastra do AWS bez kluczy statycznych. Mechanizm wybiera Dawid, np. [IAM Roles Anywhere](https://docs.aws.amazon.com/sdkref/latest/guide/access-rolesanywhere.html) albo federacja OIDC kont serwisowych. Każdy serwis i cron dostaje rolę z minimalnymi uprawnieniami:
  - `files`: S3;
  - `notifications`: SES i SMS;
  - konsument zdarzeń: tylko własna kolejka SQS.

### 2.4 Cognito
- [ ] Pula na każde środowisko, w planie Essentials albo Plus, bo `SMS_OTP` i `EMAIL_OTP` nie działają w planie Lite ([plany funkcji](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html)). W klientach aplikacji włączony `ALLOW_USER_AUTH` ([przepływy](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flows-selection-sdk.html)). Czas: godziny.
- [ ] Logowanie bez hasła numerem telefonu albo e-mailem, wszędzie tak samo: w apce, panelu, na tablecie i na TV.
  - Kod jednorazowy SMS-em (`SMS_OTP`) albo e-mailem (`EMAIL_OTP`); konta nie mają hasła.
  - Jedno konto może mieć telefon i e-mail. Kanał wybiera osoba przełącznikiem „Telefon | E-mail” przy logowaniu, a klient prosi Cognito o ten rodzaj kodu (propozycja).
  - Telefon i e-mail muszą być atrybutami logowania od utworzenia puli, bo potem nie da się tego zmienić (niżej).
  - E-maile z kodami wysyła SES (niżej i 2.6).
- [ ] Osobne klienty aplikacji: mobile, tablet i web (panel; przez niego loguje się też telewizor). Każdy ma własne ustawienia:
  - czas życia refresh tokenu: od 60 minut do 10 lat, domyślnie 30 dni; bez rotacji ważność liczy się od zalogowania ([refresh tokens](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-refresh-token.html));
  - decyzję o rotacji refresh tokenu (okno łaski do 60 s). Czy obsługuje ją Amplify albo SDK w React Native, trzeba sprawdzić.
- [ ] Klient tablet [erd]:
  - tablet loguje się kontem technicznym z rolą `tablet` (jedno konto tabletów na stajnię, propozycja; telefonem albo e-mailem i kodem), a nie kontem osoby, i zostaje zalogowany na stałe. Dlatego ten klient potrzebuje długiego refresh tokenu (wartość: sekcja 5). Klient tablet przyjmuje tylko konto z rolą `tablet`, a konto tabletów nie loguje się w apce ani w panelu (propozycja);
  - token wskazuje konto tabletów, a akcje z tabletu (potwierdzenie flagi w stajni, która wymaga potwierdzeń, „Ogarnięte”, „Podano śniadanie” i „Wyprowadzono na padok” dla hali tego boksu, „Woda” przy poidle ręcznym) zapisujemy bez autora: `source = tablet`, `user_id` NULL, `id` boksu i czas [erd]. Serwisy rozpoznają tablet po kliencie Cognito, nie po treści żądania (propozycja);
  - tablet wysyła `id` wybranego boksu, nie numer, bo numer (`boxes.label`) powtarza się w halach.
- [ ] Telewizor (klient web): otwiera zwykłą stronę logowania panelu, która nie rozpoznaje urządzenia, i loguje się kontem technicznym z rolą `display` (Wyświetlacz) w stajni, telefonem albo e-mailem i kodem, tak samo jak wszędzie; po zalogowaniu panel pokazuje widok tablicy, bo tak każe rola. Konto zaprasza admin przez „Zaproś osobę” → „Konto techniczne: Wyświetlacz”; osobnego formularza nie ma. W seedzie „Telewizor korytarz” loguje się e-mailem. Jedno konto na kilka telewizorów albo osobne na każdy, wybiera admin. Tylko odczyt wynika z roli. Czas życia refresh tokenu ustawia się per klient aplikacji, a strona nie rozpoznaje telewizora, więc telewizor ma czas sesji panelu (sekcja 5 pkt 4).
- [ ] Wysyłka SMS jedną z dwóch ścieżek ([ustawienia SMS](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-sms-settings.html)):
  - przez SNS: rola z `sns:Publish` i warunkiem `sts:ExternalId`;
  - bezpośrednio przez AWS End User Messaging SMS (`EumsSms`): rola z `sms-voice:SendTextMessage`, origination identity i configuration set.

  Ścieżki EUMS nie ma jeszcze w providerze Terraform ([#50066](https://github.com/hashicorp/terraform-provider-aws/issues/50066)).
- [ ] E-maile z Cognito przez SES w trybie `DEVELOPER` ([EmailConfiguration](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cognito-userpool-emailconfiguration.html)). Na tym opiera się `EMAIL_OTP`, więc kody e-mailem podlegają limitom SES i jego sandboxu (2.6).
- [ ] TOTP to w Cognito MFA typu software token. Logowanie bez hasła i MFA wykluczają się dla tego samego użytkownika ([MFA](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa.html)). Decyzja przed etapem 1 (sekcja 5).
- [ ] Atrybutów logowania nie da się zmienić po utworzeniu puli ([atrybuty](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html)), więc pule dev i test muszą dać się odtworzyć z kodu.
- [ ] Sesje i blokada konta:
  - global sign-out unieważnia wszystkie refresh tokeny konta ([unieważnianie tokenów](https://docs.aws.amazon.com/cognito/latest/developerguide/token-revocation.html)). Tablety mają własne konto techniczne, więc wylogowanie osoby ich nie dotyka; global sign-out konta tabletów wylogowuje wszystkie tablety stajni [erd]. Zgubiony tablet: admin blokuje konto techniczne tabletów (wylogowanie ze wszystkich urządzeń), a pozostałe tablety loguje ponownie kodem (propozycja, sekcja 5 pkt 5);
  - access token sprawdzany lokalnie działa aż do wygaśnięcia;
  - `AdminDisableUser` unieważnia access tokeny tylko dla wywołań do Cognito ([API](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminDisableUser.html)), dlatego blokadę sprawdzamy też w `stable_members`.
- [ ] Tylko dla pul dev i test, na decyzję Dawida: wyzwalacz custom SMS sender (Lambda + KMS, [dokumentacja](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-custom-sms-sender.html), [przykład AWS](https://github.com/aws-samples/amazon-cognito-user-pool-development-and-testing-with-sms-redirected-to-email)), który przekierowuje kody do skrzynki testowej. W produkcji nigdy, bo to logika poza mikroserwisami.

### 2.5 SMS do Polski
- [ ] Do 10 zweryfikowanych numerów testowych w sandboxie ([weryfikacja](https://docs.aws.amazon.com/sms-voice/latest/userguide/verify-destination-phone-number.html)), kilka minut na numer. Numery symulatora AWS działają tylko w USA ([symulator](https://docs.aws.amazon.com/sms-voice/latest/userguide/test-phone-numbers.html)).
  - W zestawie domowym pierwszym zweryfikowanym numerem jest własny telefon; kolejne karty testowe dochodzą w miarę potrzeby.
- [ ] Sender ID dla Polski.
  - Czy AWS obsługuje alfanumeryczny nadpis bez rejestracji: [niepotwierdzone]. Sprawdzić w [tabeli krajów](https://docs.aws.amazon.com/sms-voice/latest/userguide/phone-numbers-sms-by-country.html), przez `DescribeRegistrationTypeDefinitions` albo zgłoszeniem do Support ([Sender ID](https://docs.aws.amazon.com/sms-voice/latest/userguide/sender-id.html), [rejestracje](https://docs.aws.amazon.com/sms-voice/latest/userguide/registrations.html)).
  - Od 04.2025 AWS ma samoobsługową rejestrację numerów długich dla Polski ([AWS](https://aws.amazon.com/about-aws/whats-new/2025/04/aws-end-user-messaging-self-service-phone-number-registration)); to osobna ścieżka niż Sender ID.
  - Według Twilio w Polsce rejestracja nadpisu nie jest wymagana ([Twilio](https://www.twilio.com/en-us/guidelines/pl/sms)).
  - Nazwę marki trzeba przetestować w każdej sieci. Operatorzy filtrują nazwy ogólne oraz nadpisy z wykazu podmiotów publicznych ([NASK](https://cyberpolicy.nask.pl/ustawa-o-zwalczaniu-naduzyc-w-komunikacji-elektronicznej/)).
  - Czas: od razu albo do kilku tygodni, jeśli potrzebna jest rejestracja [niepotwierdzone].
- [ ] Protect configuration ustawiona jako domyślna dla konta, bo tylko wtedy obejmuje Cognito i SNS. Blokada krajów poza Polską ([protect configuration](https://docs.aws.amazon.com/sms-voice/latest/userguide/protect-configuration.html)).
- [ ] Limit wymuszony ustawiony nisko na dev i test. Limit konta podnosi się wnioskiem do Support ([limit](https://docs.aws.amazon.com/sms-voice/latest/userguide/spend-limit.html), [Support](https://docs.aws.amazon.com/sms-voice/latest/userguide/awssupport.html)).
- [ ] Wyjście z sandboxu osobno dla każdego konta i regionu, **przed stajnią pilotażową**.
- [ ] Treść SMS.
  - Polskie znaki skracają segment do 70 znaków ([limity znaków](https://docs.aws.amazon.com/sms-voice/latest/userguide/sms-limitations-character.html)).
  - Linki tylko pełne, w naszej domenie. SMS z adresem URL przetestować w każdej sieci.
  - Osobny configuration set dla Cognito i dla `notifications`.

### 2.6 SES, S3, SNS i SQS
- [ ] **SES.**
  - Domena: Easy DKIM, MAIL FROM i DMARC, osobno w każdym regionie.
  - Sandbox: wysyłka tylko na zweryfikowane adresy, 200 e-maili na dobę, 1 na sekundę. Odbicia i skargi testuje mailbox simulator.
  - E-mailem idą kody logowania (`EMAIL_OTP`), zaproszenia i powiadomienia. W sandboxie dochodzą tylko na zweryfikowane adresy, więc dostęp produkcyjny jest potrzebny przed recenzją sklepów (sekcja 5 pkt 2) i przed stajnią pilotażową.
  - Wniosek o dostęp produkcyjny składamy po wdrożeniu obsługi odbić i skarg. Odpowiedź do 24 h, bywa kilka dni, zdarzają się odmowy ([FAQ](https://repost.aws/knowledge-center/ses-production-access-request-faq)).
- [ ] **S3.**
  - Bucket na każde środowisko, Block Public Access, szyfrowanie, CORS dla uploadów.
  - Presigned URL podpisany rolą wygasa razem z jej sesją ([presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url)). Przy pobieraniu APK przez słabe Wi-Fi trzeba dobrać ważność albo wznawiać pobieranie z nowym URL.
- [ ] **SNS i SQS** z manifestu (3.1.5).
  - Temat na każdy typ zdarzenia, kolejka na każdego konsumenta z DLQ, raw message delivery.
  - Szyfrowana kolejka wymaga klucza KMS zarządzanego przez klienta, z uprawnieniem dla `sns.amazonaws.com`; klucz `aws/sqs` nie zadziała ([dokumentacja](https://docs.aws.amazon.com/sns/latest/dg/sns-enable-encryption-for-topic-sqs-queue-subscriptions.html)).

### 2.7 Apple
- [ ] Apple Developer Program ([pomoc](https://developer.apple.com/support/enrollment/)). Następnie App Store Connect: rekord apki, bundle ID, klucz API dla EAS Submit, role zespołu.
- [ ] TestFlight ([Expo](https://docs.expo.dev/submit/testflight.md)):
  - testerzy wewnętrzni: do 100 osób, bez recenzji;
  - testerzy zewnętrzni: do 10 000, po Beta App Review pierwszego buildu każdej wersji;
  - buildy wygasają po 90 dniach.
- [ ] Dystrybucja ad hoc przez EAS: każdego iPhone'a trzeba zarejestrować (`eas device:create`) i odświeżyć profil ([dystrybucja wewnętrzna](https://docs.expo.dev/build/internal-distribution/)).
- [ ] Universal Links ([Expo](https://docs.expo.dev/linking/ios-universal-links/)):
  - plik AASA z `appID` w postaci `<TEAM_ID>.<bundle>`;
  - Apple pobiera go przez własny CDN, więc zmiany dochodzą z opóźnieniem;
  - nie działają w Expo Go.
- [ ] Do recenzji ([wytyczne](https://developer.apple.com/app-store/review/guidelines/)):
  - działające konto demo (wytyczna 2.1); recenzent nie odbierze SMS, więc loguje się e-mailem i kodem z e-maila (sekcja 5 pkt 2, propozycja);
  - usuwanie konta w apce (5.1.1(v));
  - URL polityki prywatności i strony wsparcia.

  Klucz APNs nie jest potrzebny, bo push jest poza v1.

### 2.8 Google Play i weryfikacja deweloperów Androida
- [ ] Play Console. Dane i kontakt potwierdza się kodami, Google może zażądać dokumentów. Czas weryfikacji: [niepotwierdzone].
- [ ] Docelowe API: od 31.08.2026 nowe apki i aktualizacje muszą celować w Androida 16 (API 36); przedłużenie można dostać na wniosek do 1.11.2026 ([wymagania](https://developer.android.com/google/play/requirements/target-sdk)) [niepotwierdzone]. Pod to dobrać wersję Expo SDK.
  - APK tabletu idzie poza Play i tego wymogu nie ma, ale Boox Note Air6 C z zestawu domowego działa na Androidzie 16, więc ten sam `targetSdk` (API 36) w obu projektach upraszcza testy (propozycja).
- [ ] Play App Signing: klucz uploadu (EAS) i klucz podpisu Google. W `assetlinks.json` odciski SHA-256 obu kluczy i kluczy buildów testowych.
- [ ] EAS Submit z kontem usługi i kluczem JSON ([Expo](https://docs.expo.dev/submit/introduction)). Pierwszy build wgrać ręcznie na ścieżkę testów wewnętrznych.
- [ ] Do recenzji: formularz Data safety, link www do usuwania konta ([wymagania](https://support.google.com/googleplay/android-developer/answer/13327111)), instrukcje dostępu dla recenzentów (logowanie e-mailem, sekcja 5 pkt 2).
- [ ] APK tabletu poza Play.
  - Weryfikacja deweloperów obowiązuje od 30.09.2026 w Brazylii, Indonezji, Singapurze i Tajlandii, a globalnie od 2027 na certyfikowanych urządzeniach.
  - Instalacje przez ADB są zwolnione ([FAQ](https://developer.android.com/developer-verification/guides/faq), [przewodniki](https://developer.android.com/developer-verification/guides?hl=en), [Android Developer Console](https://support.google.com/android-developer-console/answer/16561738?hl=en)).
  - Cicha instalacja przez Device Ownera nie jest wymieniona [niepotwierdzone].
  - Pakiet rejestrujemy po bramce, jeśli wybrany model ma certyfikację Play Protect (T-27).
  - Kandydatami są modele kolorowe i czarno-białe. Status certyfikacji Play Protect dla Boox Note Air6 C (zestaw domowy) i Boox Go 10.3 Gen II Lumi: [niepotwierdzone], sprawdza T-27. Samsung Galaxy Tab Active5, dokupiony tylko wtedy, gdy coś nie zadziała, służy jako wzorzec Device Owner i plan B.

### 2.9 Expo EAS
- [ ] Organizacja w Expo i token robota dla CI. Czas: godziny.
- [ ] Dwa projekty: mobile (iOS i Android) oraz tablet (tylko APK na Androida, z modułem Kotlin). Obowiązkowo development builds, bo moduł natywny i Universal Links nie działają w Expo Go.
- [ ] Profile `development`, `preview` i `production`; zmienne per środowisko: adres API, ID puli i klientów Cognito.
- [ ] Credentials:
  - iOS: przez klucz App Store Connect API;
  - Android, apka mobilna: klucz uploadu;
  - tablet: osobny keystore. Bez niego zainstalowanych tabletów nie da się zaktualizować. Gdzie go trzymać i czy budować w EAS, czy lokalnie, decyduje Dawid.
    - Instalacja APK z innym kluczem wymaga odinstalowania, a to kasuje dane apki na tablecie: logowanie i zapamiętany wybór boksu. Każdy tablet trzeba wtedy ustawić od nowa („Zmień boks”).
- [ ] EAS Update tylko dla apki mobilnej: kanały i runtime version ([wdrażanie](https://docs.expo.dev/eas-update/deployment), [expo-updates](https://docs.expo.dev/versions/latest/sdk/updates)).
  - Polityka fingerprint jest według dokumentacji w becie.
  - Przed intensywnymi testami sprawdzić, czy konto ma podpisywanie aktualizacji, i jakie ma limity buildów.
  - Tablet dostaje wyłącznie APK z serwisu `releases`.

### 2.10 Domena i TLS
- [ ] Subdomeny na każde środowisko:
  - API;
  - panel, także dla telewizora: TV otwiera zwykłą stronę logowania panelu, a po zalogowaniu kontem `display` panel pokazuje widok wyświetlacza. Wybór widoku na telewizorze (wszystkie hale albo pełny ekran jednej hali) pamięta przeglądarka dla tej domeny, bez tabeli w bazie [erd]. Zmiana subdomeny panelu kasuje ten wybór na każdym telewizorze, więc subdomena musi być stała;
  - `.well-known` (AASA i `assetlinks.json`);
  - MAIL FROM;
  - publiczna strona www na domenie głównej (propozycja; 3.5.5).
- [ ] TLS przez ACME z automatycznym odnawianiem. Maksymalna ważność certyfikatu: 200 dni od 15.03.2026, 100 dni od 15.03.2027, 47 dni od 15.03.2029 ([SC-081](https://sslinsights.com/200-day-ssl-certificate-validity/)). Łańcuch sprawdzić na tabletach (Boox Note Air6 C, Android 16; po dokupieniu także Go 10.3 Gen II Lumi i Galaxy Tab Active5) i w Chromium na Raspberry Pi 5.
- [ ] Dostęp z internetu do środowiska testowego dla tabletów, telefonów w sieci komórkowej, Pi i webhooków. Sposób wybiera Dawid.
  - W zestawie domowym tablet i Pi łączą się przez domowe Wi-Fi, a telefon także przez sieć komórkową, więc środowisko testowe musi być osiągalne zarówno z domowego Wi-Fi, jak i z sieci komórkowej.

### 2.11 Płatności i faktury
- [ ] Dopóki dostawca nie jest wybrany, development pracuje na fałszywych adapterach `PaymentProvider` i `InvoiceSystem`. Sandbox dostawcy zakładamy dopiero po wyborze. Wymagania techniczne wobec sandboxu:
  - samoobsługowy;
  - webhooki z podpisem, ponowieniami i ręcznym ponownym wysłaniem, przez publiczny HTTPS;
  - klucze idempotencji;
  - zwroty, także częściowe, z mapowaniem statusów na `payments`;
  - dane testowe dla błędów: odmowa, timeout, 3DS;
  - osobne klucze na każde środowisko.
- [ ] Środowisko testowe KSeF 2.0 tylko wtedy, gdy `InvoiceSystem` w v1 ma prawdziwą integrację. API 2.0 nie jest zgodne z 1.0 ([KSeF](https://ksef.podatki.gov.pl/wyjasnienia/we-wrzesniu-zamiana-srodowisk-testowych-z-ksef-10-na-ksef-20/)).
- [ ] Na PoC płatności, faktur i KSeF nie rozbudowujemy: model `billing` zostaje jak jest, na poziomie stajni [erd]. Czy to nie za dużo na PoC, to otwarta kwestia (sekcja 5).

### 2.12 Narzędzie do błędów i logów (wybiera Dawid; tu tylko potrzeby)
- [ ] Crashe JS i natywne (Kotlin, iOS) z source maps i symbolami wgrywanymi przy każdym buildzie. W każdym zdarzeniu wersja apki albo `versionCode`.
- [ ] Diagnostyka tabletu i Pi z buforem offline: Wi-Fi, RSSI, BSSID, bateria, temperatura, pamięć, restarty, wybrany boks, wersja. Bez tabeli urządzeń trafia tylko do logów i metryk [erd].
  - Wybrany boks logujemy jako `id` boksu, a dla czytelności z halą i numerem („Hala nowa · boks 4”). Sam numer nie wystarcza, bo każda hala numeruje boksy od 1.
  - Wyświetlacz loguje wybrany widok: wszystkie hale albo pełny ekran hali (`id` hali). Ścieżka wysyłki do decyzji (sekcja 5).
- [ ] Logi JSON wszystkich serwisów i cronów, identyfikator korelacji przenoszony przez SNS i SQS, metryki. Alerty: niepusta DLQ, nieudany cron, opóźniona eskalacja, błędy 5xx w `board`.
- [ ] Błędy JS z panelu web i z wyświetlacza.
- [ ] Maskowanie telefonów, e-maili, kodów OTP i tokenów; ustalona retencja; osobne projekty dla dev, test i prod.

## 3. Development

Zasady wspólne:
- Ścieżki API (propozycja):
  - każdy serwis ma własny prefiks `/<serwis>/v1/...`;
  - `…` oznacza `/stables/{stableId}`;
  - `/internal/...` działa tylko wewnątrz klastra.
- Development dostarcza Dawidowi obrazy, manifest zasobów AWS i listę wymagań (3.1.13).
- Żaden punkt nie dodaje tabel.

### 3.1 Fundament

#### 3.1.1 Monorepo i narzędzia
- [ ] pnpm workspaces i Turborepo. Przypięte `packageManager` (corepack) i wersja Node (`.nvmrc`, `engines`). Każda zależność w jednej wersji (pnpm catalogs albo syncpack).
- [ ] Układ katalogów:
  - `apps/{mobile,tablet,web}`: `tablet` z `modules/kiosk` w Kotlinie, `web` to panel z widokiem wyświetlacza (dla roli `display`); statyczna strona www osobno (sekcja 5 pkt 51, propozycja: `apps/www`);
  - `services/{identity,access,stable,flags,care,health,rides,tasks,board,billing,files,releases,notifications,audit}`;
  - `crons/{escalation-scheduler,health-due-reminders,files-gc,billing-usage-snapshot,billing-invoicing,billing-dunning,horse-left-reconciler,retention-pruner}`, do tego `invitation-expiry-notifier` (propozycja z erd.md);
  - `packages/{db,contracts,api-client,service-kit,cron-kit,messaging,auth,authz,tenancy,audit,rules,i18n,theme,testing,eslint-config,tsconfig}`; `theme` to tokeny palety z `docs/paleta.md` (3.1.12);
  - `tools/{sql-gate,migrate,seed,synth-data,local,fake-sms,provision-tablet,display-kiosk,opctl}`.
- [ ] Generatory `turbo gen service` i `turbo gen cron` oparte na szablonach z 3.1.6 i 3.1.7.
- [ ] TypeScript w trybie `strict` z `noUncheckedIndexedAccess`; ESLint (flat config, reguły type-aware z typescript-eslint); Prettier.
- [ ] Reguły granic w lincie:
  - serwis nie importuje kodu innego serwisu, tylko `packages/*`;
  - aplikacje importują wyłącznie `contracts`, `api-client`, `rules`, `i18n` i `theme`;
  - kolory w kodzie apek tylko z `theme`: lint odrzuca literały kolorów (`#…`, `rgb()`) poza tym pakietem (propozycja);
  - klient bazy jest dostępny tylko w repozytoriach serwisu;
  - insert, update i delete tylko na tabelach tego serwisu, według `owners.ts`.

#### 3.1.2 CI (tu tylko kroki; system CI i runnery wybiera Dawid)
- [ ] Kroki przy każdym PR:
  1. `pnpm install --frozen-lockfile`;
  2. lint, sprawdzenie formatu, typecheck;
  3. testy jednostkowe;
  4. testy integracyjne (Testcontainers: Postgres i LocalStack);
  5. `sql-gate`;
  6. `drizzle-kit check` i test, że w schemacie nie ma niewygenerowanych migracji;
  7. porównanie kontraktów z migawkami;
  8. build obrazów tylko zmienionych serwisów (`turbo --filter=...[origin/main]`);
  9. SBOM i skan podatności;
  10. build APK tabletu i buildów mobilnych.
- [ ] Zgodność wstecz: testy integracyjne poprzedniego wydania puszczone na bazie po nowych migracjach.
- [ ] Meta-testy: każda trasa ma politykę dostępu, deklarację audytu i przypadek w macierzy izolacji.
- [ ] Testy instrumentowane modułu Kotlin na emulatorze Androida 15/16 bez Play: `dpm set-device-owner`, Lock Task, `PackageInstaller`, `SystemUpdatePolicy`. Wymagają runnera z KVM.
- [ ] Przebieg nocny:
  - klaster testowy z 2–3 replikami każdego serwisu (kind albo k3d);
  - prawdziwa pula Cognito;
  - prawdziwe SMS przez modem (1.4);
  - k6;
  - migracje na danych syntetycznych w skali.

#### 3.1.3 Bramka zakazanych obiektów w bazie
- [ ] **Warstwa 1: lint schematu Drizzle** (`no-restricted-syntax`). Zakazane:
  - wartości domyślne: `.default()`, `.defaultNow()`, `.defaultRandom()`;
  - sekwencje: `serial`, `bigserial`;
  - typy: `pgEnum`, `json`, `jsonb`, `.array()`;
  - ograniczenia i akcje: `check()`, `onDelete`, `onUpdate`, `generatedAlwaysAs*`;
  - `timestamp` bez strefy;
  - RLS: `pgPolicy`, `.enableRLS()`.
- [ ] **Warstwa 2: `tools/sql-gate`**, prawdziwy parser PostgreSQL (`libpg-query`), nie wyrażenia regularne. Odrzuca:
  - `CREATE FUNCTION`, `CREATE PROCEDURE`, `CREATE TRIGGER`, `CREATE RULE`, `CREATE POLICY` i `ENABLE ROW LEVEL SECURITY`;
  - `CHECK` i `DEFAULT`, także `SET DEFAULT`;
  - `CREATE SEQUENCE`, `serial`, `GENERATED … AS IDENTITY` i kolumny generowane;
  - `CREATE TYPE … AS ENUM` i `CREATE DOMAIN`;
  - typy `json`, `jsonb` i tablicowe;
  - akcje kluczy obcych inne niż domyślne;
  - `DO $$…$$`, `CREATE EXTENSION`, `LISTEN` i `NOTIFY`.
- [ ] **Warstwa 3: katalog bazy po migracjach** (Testcontainers, schematy `app` i `audit`). Każde trafienie zatrzymuje CI:
  - funkcje i procedury: `pg_proc`;
  - triggery: `pg_trigger` z `NOT tgisinternal`;
  - RLS: `pg_policy` i `relrowsecurity`;
  - reguły i widoki: `pg_rewrite` (czy widoki są zakazane, rozstrzyga sekcja 5);
  - `CHECK`: `pg_constraint.contype = 'c'`;
  - `DEFAULT`: `pg_attrdef`;
  - sekwencje: `relkind = 'S'`; identity i kolumny generowane: `attidentity`, `attgenerated`;
  - enumy i domeny: `pg_type.typtype IN ('e','d')`;
  - kolumny `json`, `jsonb` i tablicowe; kolumny `timestamp without time zone`;
  - akcje kluczy obcych: `confdeltype` albo `confupdtype` różne od `'a'`;
  - schematy aplikacji inne niż `app` i `audit`.

  Do tego testy pozytywne:
  - klucze obce do tabel stajni są wielokolumnowe, a tabele-rodzice mają `UNIQUE (stable_id, id)`;
  - role serwisów mają w `audit` wyłącznie `INSERT`.
- [ ] **Stan migracji:** własny migrator (`tools/migrate`) z tabelą stanu w schemacie `app`, bez sekwencji; kluczem jest nazwa pliku i hash. Domyślna tabela Drizzle leży w schemacie `drizzle` i ma `SERIAL`, więc bramka zablokowałaby już pierwsze wdrożenie. Bez listy wyjątków.
- [ ] squawk na każdej nowej migracji: blokady, indeksy bez `CONCURRENTLY`, `NOT NULL` bez uzupełnienia danych.

#### 3.1.4 `packages/db` (Drizzle)
- [ ] `pgSchema('app')` i `pgSchema('audit')`: tabele `app` według erd.md (z `stable_role_features`, `business_admins` i `notification_rules`, bez `stable_locales`) i 2 w `audit` [erd], pliki pogrupowane według serwisu-właściciela. Hierarchia `businesses` (konto firmy z NIP) → `stables` (`business_id`) → `buildings` → `boxes` [erd].
- [ ] `owners.ts` (tabela → serwis) to jedno źródło dla reguły lint o zapisie, generatora grantów i README serwisów.
- [ ] Konwencje [erd]:
  - identyfikatory UUIDv7 nadawane w kodzie;
  - czas w `timestamptz` (UTC), godziny lokalne w `time` ze strefą stajni;
  - statusy jako `text` walidowany zod;
  - `version` (`bigint`) i `updated_at` w tabelach edytowalnych;
  - `days_mask` jako `smallint`.
- [ ] Izolacja w schemacie [erd]: `UNIQUE (stable_id, id)` w tabelach-rodzicach i wielokolumnowe klucze obce `(stable_id, x_id)`, bez akcji kaskadowych.
- [ ] Spisana lista tabel bez `stable_id` i zasada dostępu do nich:
  - **tabele podrzędne:** `flag_template_labels`, `meal_slot_labels`, `feeding_plan_items`, `paddock_plan_companions`, `invoice_lines`. Dostęp tylko przez wiersz-rodzica, czyli złączenie z rodzicem w zakresie stajni;
  - **tabele globalne:** `users`, `businesses` i `business_admins` (konto firmy nad stajniami, z NIP; admin konta ma dostęp do wszystkich jego stajni, a dane, izolacja i płatności zostają na poziomie stajni), `stables` (kluczem jest samo `id`), `billing_plans`, `billing_plan_prices`, `app_releases`, `payment_provider_events`. Dostęp tylko przez jawne `crossTenant()`;
  - `audit.audit_log_changes`: tylko przez `audit_log`.
- [ ] Unikalności i indeksy [erd]:
  - `horses.box_id` (unikalne, dopuszcza `NULL`);
  - częściowe unikalne otwarte wpisy `horse_box_history` na konia i na boks;
  - `buildings (stable_id, name)`, `flag_templates (stable_id, code)`, `stable_members (stable_id, user_id)`;
  - NIP konta firmy (`businesses.tax_id`) [erd]: unikalny, bo jedno konto to jeden NIP. Kod zapisuje sam ciąg 10 cyfr, bez kresek, więc „123-456-32-18” i „1234563218” to ten sam NIP (propozycja);
  - `flag_escalations (flag_id, level)`;
  - `building_routines`: jedna akcja na halę, posiłek i dzień (`building_id`, `meal_slot_id`, `service_date` przy `kind = meal_served`) oraz jeden padok na halę i dzień (`building_id`, `service_date` przy `kind = paddock_out`) [erd]. Propozycja: dwa częściowe unikalne indeksy z warunkiem `cancelled_at IS NULL`, bo `meal_slot_id` padoku jest `NULL`, a po „Cofnij” akcję trzeba móc zapisać ponownie;
  - `notifications.dedupe_key`, `payment_provider_events.provider_event_id`;
  - `usage_snapshots (subscription_id, period_start, metric)`;
  - indeks `box_care_events (stable_id, box_id, kind, occurred_at)` do najnowszego „Ogarnięte” i najnowszej „Wody” (wpisów może być kilka dziennie) (propozycja);
  - `horse_flags.valid_from` i `valid_to` są `NOT NULL` (bez „do odwołania”) [erd];
  - `boxes.auto_waterer` jest `NOT NULL` bez `DEFAULT`: wartość wybiera admin w wierszu boksu przy tworzeniu, a bez wyboru kod nadaje `true` (poidło automatyczne) [erd];
  - ustawienia stajni [erd]: `stable_settings` 1:1 ze stajnią (klucz `stable_id`) z przełącznikami `flags_require_ack`, `soak_enabled`, `tidy_enabled`, `meal_served_enabled`, `paddock_out_enabled`; `stable_role_features` z kluczem `(stable_id, role, feature)` i kolumną `visible`. Kolumny `NOT NULL` bez `DEFAULT` (propozycja): wartości domyślne nowej stajni („wszystko włączone, łącznie z potwierdzeniami” [erd]) nadaje kod;
  - `horse_flags.requires_ack` (kopia `stable_settings.flags_require_ack` w chwili zapisu flagi [erd]) jest `NOT NULL` bez `DEFAULT` (propozycja); `flag_templates` nie ma już `requires_ack` [erd];
  - celowo **bez** unikalności numeru boksu: ani `(stable_id, label)`, ani `(building_id, label)` [erd]. Boksy numeruje się w obrębie hali, więc każda hala może mieć swój boks 1, a boks identyfikuje wyłącznie `boxes.id`. Test katalogu sprawdza, że na `boxes.label` nie ma unikalnego indeksu; zwykły indeks `boxes (stable_id, building_id)` do listy boksów hali (propozycja).
- [ ] `audit.audit_log.stable_id` bez klucza obcego do `app` [erd].
- [ ] Przepływ migracji:
  - `drizzle-kit generate`, potem review, squawk i `sql-gate`;
  - plików po scaleniu nie edytujemy;
  - `migrate` blokuje równoległe przebiegi, np. przez `pg_advisory_lock`;
  - `CREATE INDEX CONCURRENTLY` w osobnej fazie, poza transakcją;
  - gdzie i jak uruchamiać `migrate`, decyduje Dawid.
- [ ] Expand/contract, w tej kolejności:
  1. kolumna dodana jako `NULL`;
  2. kod zapisuje nową kolumnę;
  3. uzupełnienie danych kodem;
  4. `SET NOT NULL`;
  5. przełączenie odczytów we wszystkich serwisach;
  6. usunięcie starej kolumny w następnym wydaniu.

  Bez `RENAME` i bez zmiany typu w miejscu. Bez `DEFAULT` nie da się dodać kolumny `NOT NULL` do zapełnionej tabeli jednym krokiem, więc ta kolejność jest obowiązkowa.
- [ ] Generator grantów z `owners.ts`:
  - rola serwisu: `SELECT` na `app`, `INSERT`, `UPDATE` i `DELETE` tylko na własnych tabelach, w `audit` wyłącznie `INSERT` [erd];
  - rola `audit`: `SELECT` i `DELETE` na `audit`;
  - crony i `board`: tylko `SELECT`.

  Role i hasła zakłada Dawid, a development dostarcza ich listę i skrypt grantów.
- [ ] `/readyz` zwraca 503, gdy w bazie brakuje migracji wymaganej przez kod. Migracje nowsze, niż zna kod, są dopuszczalne (rolling update).

#### 3.1.5 Kontrakty API i zdarzeń (`packages/contracts`)
- [ ] Deskryptory tras w zod: metoda, ścieżka, parametry, body, odpowiedzi, polityka dostępu, dozwoleni klienci, deklaracja audytu.
- [ ] Z deskryptorów powstają OpenAPI 3.1 dla każdego serwisu oraz typowany `packages/api-client`.
- [ ] Błędy w `application/problem+json` z polem `code`:
  - `version_conflict` (412), `precondition_required` (428);
  - `id_conflict` (409);
  - `target_passed` (422);
  - `option_disabled` (409, propozycja): zapis opcji wyłączonej w ustawieniach stajni, np. flaga z nieaktywnego szablonu (`derka` w Stajni Brzozowej), „namoczyć” przy wyłączonym moczeniu, szybka akcja z wyłączonym przyciskiem;
  - `ack_not_required` (409, propozycja): potwierdzenie flagi z `requires_ack = false`;
  - `tax_id_taken` (409, propozycja): rejestracja konta firmy z NIP, który ma już konto („Ten NIP ma już konto w EQUENOR”);
  - `profile_missing`;
  - `client_upgrade_required`;
  - 404 dla obiektów innej stajni.
- [ ] Konwencje:
  - `/v1` w ścieżce, w obrębie wersji tylko zmiany addytywne;
  - klienci ignorują nieznane pola, a nieznane wartości mapują na `unknown`;
  - `If-Match` z `version` przy edycji; `ETag` i `If-None-Match` przy odpytywaniu;
  - id nadane przez klienta i `request_hash` (SHA-256 kanonicznej treści) dla flag, potwierdzeń, „Ogarnięte” i „Wody” (`box_care_events`) oraz akcji rutyny hali (`building_routines`). Zadania („Biorę”, „Zrobione”) to warunkowa zmiana wiersza `tasks`, bez id zdarzenia (propozycja).
- [ ] Nagłówki `X-Client` i `X-Client-Version`. Bramka minimalnej wersji nie obejmuje tras `releases`, żeby stary tablet zawsze mógł się zaktualizować.
- [ ] Zdarzenia:
  - koperta `{id, type, version, occurredAt, stableId, producer, payload}`;
  - payload niesie same identyfikatory [erd];
  - katalog zdarzeń z wersjami; konsument wersji N czyta zdarzenia N-1.
- [ ] Migawki OpenAPI każdej wydanej wersji apki, tabletu, panelu i wyświetlacza. CI odrzuca zmianę łamiącą zgodność: usunięte pole, zmieniony typ, nowe pole wymagane w żądaniu.
- [ ] Z katalogu zdarzeń powstaje manifest dla Dawida i dla LocalStack: tematy, kolejki z DLQ, subskrypcje i uprawnienia każdego serwisu.

#### 3.1.6 Szablon serwisu (`packages/service-kit`)
- [ ] HTTP na Fastify (propozycja): walidacja zod, limity rozmiaru body, CORS dla originu panelu.
- [ ] Konfiguracja z env walidowana zod. Przy brakach serwis nie startuje. Adaptery fałszywe i `console` blokują start w produkcji.
- [ ] Obserwowalność:
  - logi JSON (pino) z `request_id`, `trace_id`, `stable_id` i `user_id`, bez tokenów i kodów;
  - OpenTelemetry dla HTTP, pg oraz SNS/SQS (`traceparent` w atrybutach wiadomości);
  - metryki Prometheus.
- [ ] Sondy `/livez` i `/readyz`.
- [ ] Graceful shutdown po SIGTERM, w tej kolejności:
  1. zatrzymanie konsumentów SQS;
  2. dokończenie bieżących wiadomości;
  3. drenaż HTTP;
  4. zamknięcie puli połączeń.
- [ ] `unitOfWork(scope, tx => …)` łączy transakcję, audyt i bufor zdarzeń publikowanych po COMMIT.
- [ ] Wspólne wtyczki: auth, zakres stajni, błędy, `/internal/*` z uwierzytelnianiem serwis→serwis, `POST /internal/prune`.
- [ ] Obraz:
  - Dockerfile multi-stage (`pnpm deploy --filter <serwis> --prod`);
  - użytkownik inny niż root;
  - system plików tylko do odczytu.
- [ ] Harness testowy: Postgres po migracjach i grantach, LocalStack, fabryki danych, fałszywy zegar, `app.inject()`.
- [ ] Generowany README serwisu: tabele, trasy, zdarzenia, zmienne env, rola bazy, uprawnienia do S3, SNS i SQS.

#### 3.1.7 Szablon crona (`packages/cron-kit`)
- [ ] Jeden przebieg to jeden proces: start, praca z limitem czasu, kod wyjścia, podsumowanie w logu.
- [ ] Rola bazy tylko do odczytu. Zmiany cron zleca przez `/internal/...` albo kolejkę serwisu-właściciela [erd].
- [ ] Idempotencję zapewniają unikalności po stronie właściciela.
- [ ] Przełącznik `--now` i fałszywy zegar; lokalnie `pnpm cron <nazwa>`.
- [ ] Test szablonowy: dwa przebiegi po kolei i dwa równolegle dają ten sam stan.

#### 3.1.8 Zdarzenia: SNS, SQS, idempotencja, DLQ (`packages/messaging`)
- [ ] `publishAfterCommit`:
  - publikacja po COMMIT z ponowieniami i backoffem;
  - po wyczerpaniu prób log i metryka `events_publish_failed_total`;
  - bez outboxu zdarzenie może zginąć, dlatego ścieżki krytyczne domykają crony [erd].
- [ ] Temat SNS na każdy typ zdarzenia, nazwy z prefiksem środowiska, raw message delivery.
- [ ] Konsument:
  - kolejka na parę (serwis, zdarzenie), DLQ z `maxReceiveCount`;
  - long polling, partie do 10 wiadomości;
  - visibility timeout dłuższy niż obsługa i przedłużany w trakcie;
  - usunięcie wiadomości dopiero po sukcesie.
- [ ] Idempotencja bez tabeli `inbox` [erd]: unikalności i warunkowe aktualizacje. Handler jest wspólny z endpointem `/internal/...`, który woła cron uzgadniający.
- [ ] Nieznany typ albo wersja zdarzenia trafia do DLQ i wywołuje alert.
- [ ] Narzędzie `pnpm events dlq list|show|redrive`.

#### 3.1.9 Uwierzytelnianie i role (`packages/auth`, `packages/authz`)
- [ ] Weryfikacja access tokenu (`aws-jwt-verify` albo równoważna biblioteka):
  - sprawdza `iss`, `token_use = access`, `client_id` z listy klientów i `exp`;
  - JWKS w cache;
  - issuer i JWKS z konfiguracji, żeby lokalnie działał stub (3.2).
- [ ] Rodzaj klienta wynika z `client_id`, nie z nagłówka:
  - tablet: tylko konto z rolą `tablet` (inne konta: 403, na tablecie TabletBrakUprawnien, propozycja); `source = tablet` i `user_id = NULL` w potwierdzeniach flag, „Ogarnięte”, akcjach hali tego boksu (posiłek, padok) i „Wodzie” (poidło ręczne) [erd]; zadania z klienta tablet dają 403, a akcja dla innej hali niż hala boksu z `X-Box-Id` też 403 (propozycja);
  - telewizor nie ma osobnego klienta (loguje się przez web); tylko odczyt wynika z roli `display`.
- [ ] `sub` mapuje się na `users.id`. Gdy wiersza brak, serwis zwraca `409 profile_missing`, a klient woła `identity GET /me` [erd].
- [ ] Role [erd]: `admin` (Admin: właściciel albo zarządca; rola konta firmy, daje dostęp do wszystkich stajni firmy, także nowych, bez przypisywania; tabela `business_admins`). Role w stajni (`stable_members.role`; jedna osoba może być przypisana do kilku stajni): `staff` (Obsługa), `instructor` (Instruktor), `client` (Klient: właściciel albo dzierżawca konia) oraz role kont technicznych `display` (Wyświetlacz: telewizor) i `tablet` (Tablet: tablety przy boksach); konto techniczne ma jedną stajnię (propozycja). Wsparcie IT to zespół EQUENOR, nie rola stajni: dostęp operatora (sekcja 5 pkt 8, propozycja).
- [ ] Uprawnienia czytane z bazy przy każdym żądaniu: `business_admins` (admin konta firmy, dla stajni z jego `business_id`), `stable_members` oraz `horse_access` (rola `client`) z `valid_from`, `valid_to` i `revoked_at`. Dzięki temu blokada działa od razu, bez czekania na wygaśnięcie tokenu. Klient nie ma osobnego dostępu do boksu: widzi boks, w którym stoi jego koń (`horses.box_id`), i historię tego boksu od otwarcia wpisu konia w `horse_box_history` [erd].
- [ ] Polityki jako czyste funkcje: rola w stajni × dostęp do konia (boks wynika z konia). Macierz testów rola × akcja. Dla `display` DTO z listą dozwolonych pól.
- [ ] Widoczność per rola (`stable_role_features`) [erd] czytana z bazy przy każdym żądaniu, tak jak uprawnienia, więc zmiana w panelu działa przy najbliższym odpytaniu. Widoczność tylko zawęża to, na co pozwala rola, nigdy tego nie rozszerza (propozycja): klient z zaznaczonymi „Szybkimi akcjami i ich stanem” widzi stan, ale zapis dalej daje 403. Odpowiedzi złożone (`board`, lista dnia, karta konia) pomijają ukryte sekcje, a trasy funkcji ukrytej dla roli dają 403 (propozycja). `admin` nie ma wierszy w macierzy i widzi wszystko [erd]. Członkostwo i widoczność liczą się osobno w każdej stajni (Ola jest obsługą w dwóch stajniach o różnych ustawieniach).
- [ ] `X-Box-Id` z tabletu walidowany: boks stajni konta tabletów. Nagłówek niesie `boxes.id` (UUID), nigdy numer boksu, bo numer nie jest unikalny. Trafia do `box_id` w potwierdzeniach flag, „Ogarnięte” i „Wodzie”; przy akcji hali z tabletu wyznacza halę (`boxes.building_id`), bo `building_routines` nie ma `box_id`.
- [ ] Krótki czas życia access tokenu; długi refresh token dla klienta tablet. Telewizor używa klienta web, więc ma czas sesji panelu (sekcja 5 pkt 4).

#### 3.1.10 Izolacja stajni (`packages/tenancy`)
- [ ] `TenantScope` powstaje dopiero po sprawdzeniu dostępu do stajni: admin konta firmy ma każdą stajnię swojej firmy, pozostali tylko stajnie, do których są przypisani (albo w których stoi ich koń).
- [ ] `scoped(table)` dokłada `stable_id = $scope`; `joinScoped` dokłada równość `stable_id` po obu stronach złączenia; tabele podrzędne dostępne tylko przez rodzica.
- [ ] Obiekt stajni bez dostępu daje 404, nie 403; tak samo obiekt innej firmy (inne konto, inny NIP).
- [ ] Zapytania przekrojowe (crony, billing, releases) tylko przez `crossTenant()`, każde z testem.
- [ ] Strażnik w testach: parser SQL wymaga predykatu `stable_id` w każdym zapytaniu do tabeli stajni, zgodnie z listą z 3.1.4.
- [ ] Klucze S3 z prefiksem `stable_id/` [erd]. Presigned URL wydaje dopiero serwis-właściciel po sprawdzeniu uprawnień.

#### 3.1.11 Audyt (`packages/audit`)
- [ ] `audit.record(tx, …)` w tej samej transakcji co zmiana [erd]. Zapisuje:
  - `service`;
  - `actor_type` (`user`, `tablet`, `operator` albo `system`), `actor_id`, `client`;
  - `action`, `entity_type`, `entity_id`;
  - zmiany w `audit_log_changes`, z maskowaniem pól.
- [ ] Każda trasa zapisująca deklaruje akcję audytu (meta-test). Crony zapisują `actor_type = system`.
- [ ] Test: rola serwisu nie czyta, nie zmienia i nie usuwa wpisów w `audit`.

#### 3.1.12 Pakiety domenowe i dane testowe
- [ ] `packages/rules`: czyste funkcje czasu.
  - Wystąpienia posiłków w strefie stajni i według `days_mask`.
  - Okno flagi `valid_from`–`valid_to` (obowiązkowe, w strefie stajni) i podpowiedź z `flag_templates.default_window` [erd]: „Bez śniadania” dziś 06:00–10:00, „Nie na padok” w godzinach padoku konia, „Derka” 16:00–08:00 (przez północ).
  - `ack_deadline_at`, `warn_at` i `notify_at`, liczone od początku okna flagi i tylko dla flag z `requires_ack` [erd]; flaga bez potwierdzeń nie ma terminów (propozycja: `NULL`).
  - Konfiguracja stajni (propozycja): czysta funkcja `stableFeatures(settings, activeTemplates, roleFeatures, role)` zwraca, co pokazać danej roli: kafelki flag (aktywne szablony, „Inna flaga”), „namoczyć”, przyciski szybkich akcji, tryb potwierdzeń i widoczne funkcje. Używają jej serwisy (`board`, `care`, `flags`) i apki, więc tablet, apka, panel i wyświetlacz ukrywają to samo.
  - Skutki flag liczone z okna godzin [erd]:
    - `suspend_meal` wstrzymuje tylko posiłki, których godzina wypada w oknie;
    - `cancel_paddock` skraca albo odwołuje padok tylko w oknie (Kasztan: padok B 10:00–16:00 i „Nie na padok” 14:30–16:00 dają padok 10:00–14:30, czyli między wetem o 8:00 a kowalem o 15:00);
    - lista koni pominiętych przy akcjach zbiorczych hali: flagi obowiązujące w chwili posiłku albo wyprowadzenia, także niepotwierdzone (propozycja).
  - Etykiety godzin flagi: „06:00–10:00”, „od 14:30” (flaga, która zacznie się później), „16:00–08:00”, „dziś, cały dzień”. Etykieta statusu tylko dla flagi z `requires_ack`; flaga bez potwierdzeń ma „obowiązuje od razu” zamiast statusu.
  - Testy właściwości (fast-check) oraz nocy 25.10.2026 i 28.03.2027.
- [ ] `packages/i18n`: polski, ukraiński i angielski. Etykiety słowników pochodzą z tabel `*_labels` (opcjonalne tłumaczenia nazw, np. pory posiłków po ukraińsku). Stajnia nie ma listy języków (bez `stable_locales`): język tablicy ustawia każdy tablet osobno (3.5.2), a język apki i panelu każda osoba w profilu.
- [ ] `packages/theme`: tokeny palety z `docs/paleta.md`, jedno źródło dla apki, panelu, wyświetlacza TV i tabletu.
  - **Tokeny LCD** (apka, panel, TV): `bg`, `surface`, `sand`, `accent-soft`, `line`, `line-strong`, `line-input`, `ink`, `ink-2`, `accent`, `accent-strong`, `on-accent`, rodziny statusów `ok-*` (text, tint, line), `warn-*` (text, tint, tint-weak, line) i `crit-*` (text, tint, line), `crit-solid` z `on-crit`; do tego nakładka pod modalem i cień karty (cień tylko apka i panel).
  - **Tokeny tabletu** `t-*`: `t-paper`, `t-ok`, `t-line`, `t-warn`, `t-scrim`, `t-crit`, `t-ink-2`, `t-ink`, z wartością szarości przy każdym. Profil domyślny (Kaleido 3) i profil Gallery 3, który podmienia tylko `t-ok`, `t-warn` i `t-crit`.
  - Wyjścia: zmienne CSS (`:root`) dla panelu (także widoku wyświetlacza), obiekt TS dla React Native (apka i tablet).
  - Znak słowny „EQUENOR”: zawsze wersalikami, rozstrzelony 0,16 em, waga 700, cały w `ink` (na ciemnym tle `#FFFCF7`, na tablecie `t-ink`), bez akcentu. Hasło „Equestrian Management, Refined” tylko pod znakiem: ok. 0,45–0,55 jego rozmiaru (min. 11 px na LCD, 16 px na tablecie), waga 500, `ink-2`, odstęp 2–6 px; tylko na ekranach logowania i w nagłówku oraz stopce strony www, w kompaktowych nagłówkach sam znak (szczegóły w `docs/paleta.md`). Domyślny akcent to Koniak; pozostałe opcje akcentu z `docs/paleta.md` tylko jako warianty do decyzji.
  - Testy (CI):
    - wartości zgodne z tabelami w `docs/paleta.md` (test parsuje tabele, więc zmiana palety bez zmiany pakietu, albo odwrotnie, zatrzymuje CI) (propozycja);
    - kontrasty WCAG: tekst ≥ 4,5:1, duże elementy i obrysy kontrolek ≥ 3:1, dla każdej pary tekst–tło używanej w komponentach;
    - tablet: neutralne tokeny achromatyczne (R = G = B); drabina jasności papier 255, OK 204, uwaga 146, krytyczna 66, atrament 0, z odstępem co najmniej 3 poziomów na 16, w obu profilach;
    - tablet: tekst na kolorze tylko czarny (`t-ok`, `t-warn`) albo biały (`t-crit`).
- [ ] `packages/testing`: kontenery, fabryki, seed, fałszywy zegar, klienci HTTP z tokenami ze stuba.
- [ ] `tools/synth-data`: generator danych syntetycznych w skali (wiele stajni, setki boksów) do testów obciążenia i migracji.

#### 3.1.13 Wymagania wobec platformy (dla Dawida, bez wskazywania dostawcy)
- [ ] Development dostarcza:
  - obrazy;
  - manifest zasobów AWS (tematy, kolejki, DLQ, subskrypcje, bucket, role IAM);
  - listę ról bazy i skrypt grantów.
- [ ] Manifesty workloadów (kto je pisze i w jakim formacie: decyzja). Potrzebne:
  - **serwisy:** Deployment z co najmniej 2 replikami, sondy, PDB i limity zasobów;
  - **crony:** CronJob z `timeZone`, `concurrencyPolicy: Forbid` i `startingDeadlineSeconds`, z harmonogramem w pliku obok kodu;
  - **migracje:** Job uruchamiający `migrate`.
- [ ] PostgreSQL:
  - ta sama wersja główna lokalnie, w CI, na teście i w produkcji;
  - pooler i limit `max_connections` dla ok. 14 serwisów i 8 cronów razy liczba replik (tryb poolera wpływa na prepared statements w sterowniku);
  - kopie z PITR i próbne odtworzenie bazy przed pilotażem.
- [ ] Sieć klastra:
  - NetworkPolicy, np. `files` dostępny tylko dla serwisów-właścicieli;
  - ingress z routingiem po prefiksie `/<serwis>/` i limitami żądań na publicznych trasach odpytywania;
  - `/internal` niewystawione na zewnątrz.
- [ ] Uwierzytelnianie serwis→serwis dla `/internal` (mechanizm: decyzja).
- [ ] Środowisko testowe dostępne po HTTPS z sieci stanowiska i z sieci komórkowej; miejsce na generator k6 blisko klastra.
- [ ] Zgoda na wstrzykiwanie awarii: zabijanie podów, zmiana liczby replik, wstrzymanie CronJoba, odcięcie SNS.
- [ ] Logi, metryki i alerty (2.12); runnery CI: macOS i KVM (1.6).

### 3.2 Środowisko lokalne
- [ ] docker compose (`tools/local`):
  - **PostgreSQL** w wersji głównej docelowej, ze schematami `app` i `audit` oraz rolami i grantami jak w produkcji;
  - **LocalStack** z S3, SNS, SQS i SES. Przypiąć wersję i sprawdzić warunki obrazu, bo zasady wersji community zmieniały się w 2026. Skrypt startowy tworzy zasoby z manifestu (3.1.5);
  - **S3** w trybie path-style, z osobnym `S3_PUBLIC_ENDPOINT` w LAN, żeby presigned URL działał z telefonu i tabletu;
  - **reverse proxy** z prefiksami `/<serwis>/`, dostępny z LAN;
  - `fake-sms` i stub tokenów.
- [ ] **Cognito lokalnie, trzy warianty:**
  - **C, stub wystawcy tokenów** (propozycja): JWT w kształcie access tokenu Cognito, z własnym JWKS (`pnpm dev:token anna`).
    - Zastosowanie: CI i praca nad backendem.
    - Test porównuje jego claimy z prawdziwym tokenem z puli dev.
    - Nie startuje przy `NODE_ENV=production`.
  - **A, deweloperska pula Cognito:** do pracy nad apkami i do E2E. Kody SMS idą tylko na zweryfikowane numery, a kody e-mailem tylko na zweryfikowane adresy (sandbox SMS i SES). Opcjonalnie osobny klient „e2e” z hasłem, wyłącznie w puli dev.
  - **B, emulator** (cognito-local, moto, LocalStack): tylko jeśli spike pokaże wystarczającą zgodność. Wierne odwzorowanie `USER_AUTH`/`SMS_OTP`/`EMAIL_OTP`, TOTP i global sign-out jest [niepotwierdzone].
- [ ] **Spike Cognito (etap 0):**
  - logowanie SMS OTP i e-mail OTP; jedno konto z telefonem i e-mailem loguje się oboma kanałami; pula z telefonem i e-mailem jako atrybutami logowania;
  - zaproszenie e-mailem dopasowane do zweryfikowanego e-maila z tokenu;
  - TOTP obok logowania bez hasła;
  - global sign-out;
  - refresh token tabletu i wyświetlacza ważny tygodniami, z rotacją i bez, przy zrywanym Wi-Fi;
  - telewizor i tablet zalogowane kontami technicznymi z rolą `display` i `tablet` (e-mail i kod);
  - logowanie recenzentów sklepów e-mailem;
  - kod SMS w formacie SMS Retriever na Androidzie (z zapasem: SMS User Consent API).
- [ ] **`fake-sms`:**
  - adaptery `SmsSender` (`console`, `dev-inbox`) w `notifications`;
  - strona z wiadomościami pogrupowanymi według numeru;
  - `GET /messages?to=` dla E2E;
  - liczenie segmentów UCS-2 z ostrzeżeniem o zbyt długim szablonie.

  Obejmuje eskalacje, zaproszenia i przypomnienia; kody logowania (SMS i e-mail) wysyła Cognito. E-mail z `notifications` idzie przez SES w LocalStack.
- [ ] Fałszywe adaptery `PaymentProvider` i `InvoiceSystem`; ręczne wywołanie webhooka (`pnpm dev:webhook …`).
- [ ] **Seed z makiet** (`pnpm db:seed`).
  - Przechodzi przez API albo repozytoria właścicieli, razem z audytem.
  - Czas jest liczony względem „dziś” w strefie Europe/Warsaw. Tryb stałej daty (wt 13.10.2026, teraz 07:15, pop-up tabletu o 06:01, jak na makietach) służy do zrzutów ekranu.
  - **Konto firmy i dwie stajnie o różnych ustawieniach:**
    - konto firmy (`businesses`): „Stajnie Lipowe sp. z o.o.”, NIP 123-456-32-18 (fikcyjny), siedziba ul. Lipowa 12, 05-520 Konstancin-Jeziorna;
    - na tym koncie Stajnia Pod Lipami (pełna opcja, z potwierdzeniami; dane poniżej) i Stajnia Brzozowa (mała, bez derek, moczenia, padoku i potwierdzeń; osobny punkt na końcu seedu). Seed pokazuje, że ustawienia są per stajnia, a nie dla całego konta;
    - historia konta: Damian zarejestrował konto firmy w pn 07.09.2026 (PanelLogowanie → kod → PanelWitaj → PanelRejestracjaFirmy) i od razu założył Stajnię Pod Lipami; w czw 01.10.2026 dodał Stajnię Brzozową (PanelZalozStajnie → PanelZalozPowiadomienia → PanelPulpitStart → PanelZaprosOsobe), bez pytania o NIP;
    - Stajnia Pod Lipami: `warn_offset_min = 30`, `notify_offset_min = 15`; bez listy języków (język tablicy ustawia każdy tablet);
    - reguły powiadomień obu stajni (`notification_rules`) jak na makiecie PanelZalozPowiadomienia (propozycja);
    - **drugie konto firmy do testów izolacji** (fixture, propozycja, poza makietami): inna firma z innym NIP i jedną stajnią, np. Stajnia Olszynka, z własnym adminem i boksami 1–6.
  - **Ustawienia Stajni Pod Lipami** (`stable_settings`, `flag_templates.active`, `stable_role_features`) [erd]:
    - `flags_require_ack = true` (potwierdzenia włączone);
    - usługi: Derka (szablon `derka` aktywny) i moczenie (`soak_enabled = true`); flagi: wszystkie szablony aktywne; przyciski: „Ogarnięte”, posiłek i padok (`tidy_enabled`, `meal_served_enabled`, `paddock_out_enabled` = `true`);
    - widoczność per rola:
      - klient: `flags`, `feeding_plan`, `routine`, `box_history`, `health`, `rides`;
      - obsługa: wszystko;
      - wyświetlacz: `flags`, `feeding_plan`, `routine`, `tasks`;
      - instruktor: `flags` i `rides` (propozycja, jak na makiecie PanelUstawieniaStajni; arkusz zmian tego nie podaje).
  - **Hale** (każda z własnym adresem, boksy numerowane w obrębie hali od 1):
    - Hala główna (ul. Lipowa 12), boksy 1–8;
    - Hala nowa (ul. Polna 3), boksy 1–6.

    Numery 1–6 występują w obu halach, więc seed od razu sprawdza brak unikalności `boxes.label`. Seed, testy i fixture'y odwołują się do boksów po `id` (stałe UUID w seedzie), a nie po numerze.
  - **Konie, 13:**
    - Hala główna: Iskra 1, Dukat 2, Sonata 4, Wicher 5, Fala 6, Kasztan 7, Hetman 8;
    - Hala nowa: Grom 1, Mgła 2, Rumba 3, Bella 4, Bursztyn 5;
    - Luna bez boksu (dodana 12.10);
    - wolne boksy: Hala główna · boks 3 i Hala nowa · boks 6. W historii boksu 6 w Hali nowej Wicher stał do 01.10, potem został przeniesiony do boksu 5 w Hali głównej.
  - **Ludzie** (przypisania per stajnia; Stajnia Brzozowa niżej):
    - Damian: admin konta firmy (właściciel), dostęp do obu stajni bez przypisywania; telefon i e-mail (w interfejsie „+48 602 *** 145” i „d•••@stajnielipowe.pl”, propozycja);
    - Ola: obsługa przypisana do obu stajni (w interfejsie „+48 607 *** 218”); Piotr: obsługa tylko w Pod Lipami;
    - Marta (Instruktor): przypisana do obu stajni (propozycja); Kuba (Wsparcie IT) to zespół EQUENOR, poza seedem stajni: bez członkostwa, zaproszenia i wiersza w Ludziach; w seedzie dev najwyżej konto operatora do testów diagnostyki (propozycja);
    - klienci (rola `client`, dostęp przez `horse_access`): Anna (Kasztan i Bella), Karolina W. (Iskra), Tomasz L. (Grom), Ewa K. (Sonata);
    - Marek Nowak: oczekujące zaproszenie SMS jako klient do Luny (`invitations.horse_id`, bez boksu);
    - wygasłe zaproszenie dla obsługi;
    - konta techniczne Pod Lipami: „Telewizor korytarz”, e-mail tv.korytarz@stajnielipowe.pl (w interfejsie t•••@stajnielipowe.pl), rola Wyświetlacz (`display`), loguje się na TV e-mailem i kodem z e-maila; „Tablety Pod Lipami”, e-mail boksy@stajnielipowe.pl (w interfejsie b•••@stajnielipowe.pl), rola Tablet (`tablet`), zalogowane na wszystkich tabletach tej stajni (propozycja).

    Numery i adresy są fikcyjne; numery i adresy do puli dev leżą w lokalnym `.env`, poza repo.
  - **Słowniki:**
    - posiłki 06:30, 12:00 i 18:00;
    - pasze (m.in. owies, siano, suplement X, wysłodki, sieczka);
    - padoki A i B;
    - ujeżdżalnia kryta;
    - szablony flag z makiet z domyślnymi godzinami (`default_window`): `bez_sniadania`, `bez_kolacji`, `nie_na_padok`, `derka` (warianty `on` = zakładać, `off` = nie zakładać), `leki`, `wet` [erd].
  - **Flagi, wszystkie z godzinami** (`author_role`: `client | staff | admin`, z roli autora):
    - Kasztan, „Bez śniadania”: krytyczna, `suspend_meal`, dziś 06:00–10:00, notatka „Wet o 8:00, koń na czczo”; wstrzymane: owies, siano, suplement X. Utworzona o 03:14 przez Annę (`author_role = client`), potwierdzona o 06:02 na tablecie (`method = tablet`, `box_id` boksu 7 w Hali głównej, `user_id = NULL`);
    - Kasztan, „Nie na padok”: `cancel_paddock`, dziś 14:30–16:00, notatka „Kowal o 15:00”. Utworzona o 03:16 przez Annę, potwierdzona o 06:02 na tablecie;
    - Bella, „Nie na padok”: krytyczna, `cancel_paddock`, dziś, cały dzień (00:00–23:59), utworzona o 01:20, niepotwierdzona, z eskalacjami `board_warning` i `admin_notify` oraz wpisem w `notifications`;
    - Hetman, „Leki rano”: info, dziś 06:00–09:00, potwierdzona o 06:20;
    - Sonata, „Derka: zakładać” (`variant = on`): dziś 16:00 – jutro 08:00, notatka „przymrozek w nocy”, ustawiona przez klientkę Ewę K. (`author_role = client`) o 06:50, potwierdzona o 07:05; o 07:15 zaczyna się później, więc ma etykietę „Derka: zakładać · od 16:00”.
  - **Karmienie i padok:**
    - plan Kasztana: owies rano 1,5 kg i wieczorem 1,5 kg, siano rano, w południe i wieczorem bez ograniczeń, suplement X rano 1 miarka, wysłodki wieczorem 0,5 kg z `soak = true` i `soak_note` „w 2 l wody”; Hetman: sieczka 1 kg rano, „namoczyć w 3 l wody”;
    - padok A 10:00–14:00: Dukat, Sonata, Grom, Bursztyn; padok B 10:00–16:00: Fala, Kasztan (do 14:30 przez flagę), Rumba; w boksie zostają Iskra, Wicher, Hetman i Mgła; Bella nie wychodzi (flaga).
  - **Rutyna obsługi** (`building_routines`, `box_care_events`):
    - „Podano śniadanie”: Hala główna 06:40 (Ola, apka, pominięty Kasztan przez flagę), Hala nowa 06:50 (Piotr, apka, bez pominięć);
    - „Wyprowadzono na padok”: dziś jeszcze nie (o 10:00); wczoraj w Hali głównej o 10:05 (Piotr, apka, z Kasztanem);
    - „Podano kolację”: wczoraj w Hali głównej o 18:02 (Piotr, apka);
    - „Ogarnięte” dziś 7 z 14 boksów: Hala główna · 1 (07:02), 2 (06:50), 5 (07:05, Piotr, apka), 7 (07:10); Hala nowa · 2 (06:58), 3 (07:12), 5 (07:14); poza boksem 5 Hali głównej z tabletu, bez autora;
    - wcześniejsze „Ogarnięte”: Hala główna · 3 (wolny) wczoraj 16:10 (Piotr), 4, 6 i 8 wczoraj; Hala nowa · 1 wczoraj 16:10 (Piotr), 4 wczoraj 17:30 (Ola), 6 (wolny) 09.10 14:40 (Piotr);
    - poidło: wszystkie boksy `auto_waterer = true`, poza Hala nowa · boks 5 (Bursztyn, `auto_waterer = false`, bo automat czeka na wymianę; zadanie „Poidło w boksie 5 do wymiany”). „Woda” w tym boksie dziś o 06:55 z tabletu, bez autora (`box_care_events.kind = water`, `source = tablet`).
  - **Zadania jednorazowe** (dodał admin):
    - „Poidło w boksie 5 do wymiany” · Hala nowa · boks 5, dodane przez Damiana wczoraj 18:20, do wzięcia;
    - „Wymienić żarówkę w korytarzu” · Hala główna, wziął Piotr o 07:00, w toku;
    - „Przywieźć słomę z magazynu”, zrobione: Ola 06:30.
  - **Zdrowie, jazdy i billing** jak na makietach: wet 08:00 i kowal 15:00 (Kasztan), jazda 16:00 (Iskra, kryta ujeżdżalnia). Kwoty to wartości testowe.
  - **Wariant bez przycisków obsługi** (makiety BezAkcji i zrzuty A-19; np. flaga seedu albo fixture, propozycja): Stajnia Pod Lipami z danymi jak wyżej, ale z `tidy_enabled = meal_served_enabled = paddock_out_enabled = false`, bez wierszy `box_care_events.kind = tidy` i bez `building_routines`. Zostają flagi, plan karmienia, zadania i „Woda” 06:55 przy Hala nowa · boks 5.
  - **Druga stajnia: Stajnia Brzozowa** (to samo konto firmy, mała, prowadzona na co dzień przez Pawła, który sam obsługuje konie). Służy do pokazania innych ustawień, dostępu per stajnia (obsługa widzi tylko przypisane stajnie; te same numery boksów 1–6 co w Hali nowej, więc zapisy idą po `stable_id` i `boxes.id`) i interfejsu bez podziału na hale.
    - Adres ul. Brzozowa 5, 05-500 Piaseczno. Jedna hala „Hala główna”, której nazwy nie pokazujemy, bo jest jedna (nagłówek tabletu „BOKS 1 · KOMETA”, w apce „boks 1”). Boksy 1–6 z poidłem automatycznym: 1 Kometa, 2 Dąb, 3 Iga, 4 Lord, 5 wolny, 6 Nuta.
    - Ludzie: Damian, admin konta firmy, ma tu dostęp bez przypisania; Paweł, obsługa tylko w tej stajni (w interfejsie „+48 601 *** 377”; zaprosił go Damian 01.10 SMS-em), nie jest adminem; Ola, obsługa także w Pod Lipami (drugie przypisanie `staff`), przychodzi rano do pomocy; Anna, klientka także w Pod Lipami (`horse_access` do Komety). Przełącznik stajni mają Damian, Ola, Anna i Marta (każdy z dwiema stajniami); Paweł i Piotr widzą samą nazwę stajni. Marta z Pod Lipami także tutaj (propozycja). Wyświetlacza nie ma; tablety na koncie technicznym „Tablety Brzozowa” (rola `tablet`, e-mail np. boksy.brzozowa@stajnielipowe.pl, w interfejsie zamaskowany, propozycja); konto ma tylko tę stajnię, więc jego tablety widzą w „Zmień boks” tylko boksy 1–6 Brzozowej. Klienci pozostałych koni poza makietami (propozycja: bez kont).
    - Ustawienia (Damian zmienił je po założeniu, bo nowa stajnia ma wszystko włączone) [erd]:
      - `flags_require_ack = false` (potwierdzenia wyłączone);
      - Derka: nie (szablon `derka` nieaktywny); moczenie: nie (`soak_enabled = false`);
      - flagi: Bez śniadania, Bez kolacji, Nie na padok, Wet, Leki (aktywne szablony);
      - przyciski: „Ogarnięte” i posiłek; padok wyłączony (`paddock_out_enabled = false`), bo konie stoją w systemie padokowo-boksowym i wychodzą same;
      - widoczność per rola: klient `flags`, `routine`, `box_history`, `health` (bez planu karmienia i jazd); obsługa `flags`, `feeding_plan`, `routine`, `box_history`, `health` (bez zadań i jazd); wyświetlacz: nic (stajnia nie ma wyświetlacza); instruktor `flags` i `rides` (propozycja, jak na makiecie PanelUstawieniaBrzozowa).
    - Słowniki: posiłki jak w Pod Lipami, 06:30, 12:00 i 18:00; szablony flag jak wyżej. Plan karmienia Komety bez „namoczyć”: owies (rano, wieczorem 1 kg), siano (bez ograniczeń), musli wieczorem 0,5 kg (jak na makiecie TabletBoksBrzozowa).
    - Dziś (wt 13.10, 07:15):
      - Kometa: „Bez śniadania” 06:00–09:00, notatka „dentysta o 8:30”, ustawiona przez Annę (`author_role = client`) o 05:50, `requires_ack = false`: obowiązuje od razu, bez statusu, bez terminów potwierdzenia i bez eskalacji;
      - Lord: „Leki rano” 06:00–09:00, ustawił Paweł (`author_role = staff`), też bez potwierdzenia;
      - „Podano śniadanie” 06:35 (Paweł, apka), pominięta Kometa (flaga); jedna hala, więc „cała stajnia”;
      - „Ogarnięte” 3 z 6: boks 1 Kometa 07:00 (z tabletu, bez autora), 2 Dąb 06:55 (Ola, apka), 4 Lord 07:05; pozostałe wczoraj;
      - wczoraj: „Podano kolację” 18:00 i „Ogarnięte” boksu 1 o 16:30 (Paweł, apka), żeby „OSTATNIE AKCJE” tabletu boksu 1 miały 5 wpisów jak na makiecie;
      - bez zadań i jazd w seedzie tej stajni; dentysta jest tylko w notatce flagi.
- [ ] `pnpm setup` (compose, migracje, granty, LocalStack, seed) i `pnpm reset`; `.env.example` dla każdego serwisu; opis, jak podłączyć telefon i tablet z LAN.

### 3.3 Serwisy

**Katalog zdarzeń**
- `horse.left` [erd]: publikuje `stable`; konsumują `access`, `flags`, `care`, `tasks` i `rides`.
- `subscription.status_changed` [erd]: publikuje `billing`; konsumuje `stable`, które ustawia `stables.status`.
- `stable.created` (propozycja): publikuje `stable`; konsumują `flags` (szablony), `care` (słowniki) i `billing`.
- `invitation.created` (propozycja): publikuje `access`; konsumuje `notifications`.
- `user.deleted` (propozycja): publikuje `identity`; konsumują `access` i `notifications`.
- Eskalacji, przypomnień ani zmian widocznych na tablicy nie przekazujemy zdarzeniami. Crony wołają API właścicieli, a `board` czyta bazę przy każdym zapytaniu [erd].

**identity** (`users`)
- [ ] `GET /me`: upsert po `cognito_sub` i odświeżenie kopii telefonu i e-maila (`contact_synced_at`).
- [ ] `PATCH /me`: nazwa wyświetlana i język.
- [ ] `DELETE /me`: pseudonimizacja i usunięcie konta w Cognito. Blokada, gdy użytkownik jest jedynym adminem konta firmy.
- [ ] `POST /me/sign-out-everywhere`.
- [ ] Konta techniczne (telewizor z rolą `display`, tablety z rolą `tablet`) to zwykłe konta w `users` i Cognito, zaproszone przez `access`; bez osobnej tabeli.

**access** (`stable_members`, `horse_access`, `invitations`)
- [ ] `GET /me/memberships`: stajnie, role i dostępy. Admin konta firmy dostaje wszystkie stajnie firmy, także nową od razu po jej założeniu, bez przypisywania. Pozostałe role przypisuje się per stajnia, a osoba może być przypisana do kilku stajni z różnymi rolami albo tą samą rolą (w seedzie Ola jako obsługa, Marta jako instruktorka i Anna jako klientka w obu stajniach; Paweł tylko w Brzozowej, Piotr tylko w Pod Lipami); apka przełącza między nimi stajnię bez ponownego logowania. Konto techniczne ma członkostwo w jednej stajni; przypisanie go do drugiej `access` odrzuca (propozycja).
- [ ] Zarządzanie członkami: zmiana roli w stajni (`staff | instructor | client`; konta techniczne `display | tablet` bez zmiany roli, propozycja), `active`; rola Admin dotyczy całego konta firmy (`business_admins`), a dodawanie kolejnych adminów konta jest poza PoC (propozycja z erd.md); przypisanie osoby do kolejnej stajni firmy i jego odebranie (np. Ola do Brzozowej; propozycja: w Ludziach, bez nowego zaproszenia). W Ludziach konta techniczne („Telewizor korytarz · Wyświetlacz”, „Tablety Pod Lipami · Tablet”) są w filtrze „Konta techniczne”.
- [ ] Zaproszenia.
  - Kanał: telefon (SMS) albo e-mail (`invitations.channel`), wybór „Kanał: SMS | E-mail” jak na makiecie Zaproszenie.
  - Role do wyboru: Klient (z wyborem konia), Obsługa, Instruktor [erd]; w panelu („Zaproś osobę”) także osobna grupa „Konto techniczne”: Wyświetlacz i Tablet przy boksie. Wsparcia IT na liście nie ma. Osobnego „Dodaj wyświetlacz” i endpointu kont wyświetlaczy nie ma.
  - Zaproszenie klienta wskazuje konia (`horse_id`, wymagane dla klienta), bez boksu i bez osobnej roli dostępu [erd].
  - Wymagane `expires_at`, domyślnie 7 dni.
  - „Wyślij ponownie” tworzy nowe zaproszenie.
  - Zaakceptowanie zaproszenia dopasowuje się wyłącznie do zweryfikowanego telefonu albo e-maila z tokenu (e-mail bez rozróżniania wielkości liter, propozycja). Członkostwo i dostęp do konia powstają w jednej transakcji.
- [ ] Dostęp klienta do konia: `horse_access` z rolą `client` (właściciel albo dzierżawca konia), `valid_to` np. równe końcowi dzierżawy, `revoked_at`, gdy koń opuszcza stajnię. Osobnego dostępu do boksu nie ma: boks i jego historię (od dnia, w którym koń do niego trafił) klient widzi przez konia [erd].
- [ ] `/internal/horses/{id}/left`, `/internal/prune`. Pierwszego admina konta zapisuje `stable` przy rejestracji konta firmy, więc `access` nie ma do tego trasy.

**stable** (`businesses`, `business_admins`, `stables`, `stable_settings`, `stable_role_features`, `notification_rules`, `buildings`, `boxes`, `horses`, `horse_box_history`)
- [ ] Konto firmy (`businesses`) z kilkoma stajniami (`stables.business_id`): konto firmy → stajnie → hale → boksy [erd]. Tylko B2B: jedno konto to jeden NIP. Admin konta ma dostęp do wszystkich stajni firmy; dane, izolacja, płatności i ustawienia zostają na poziomie stajni.
- [ ] `POST /businesses` (propozycja): rejestracja konta firmy po pierwszym logowaniu (PanelWitaj → PanelRejestracjaFirmy): nazwa firmy, NIP, siedziba i e-mail do faktur (`invoice_email`). NIP podaje się tylko tutaj. Kod normalizuje NIP do 10 cyfr i sprawdza sumę kontrolną (propozycja); NIP, który ma już konto, daje `409 tax_id_taken` („Ten NIP ma już konto w EQUENOR”, propozycja) i nic nie zapisuje. Osoba rejestrująca zostaje adminem konta: `businesses` i `business_admins` zapisują się w jednej transakcji (propozycja z erd.md).
- [ ] `POST /stables`: „Załóż stajnię” w 2 krokach, jedno żądanie na końcu kroku 2 (propozycja).
  - Krok 1 „Stajnia” (PanelZalozStajnie): nazwa, adres, strefa, pierwsza hala z adresem stajni i boksy z ustawieniami (niżej). Bez NIP, bez wyboru działalności, bez języków i bez pytania o potwierdzenia flag.
  - Krok 2 „Powiadomienia” (PanelZalozPowiadomienia): które zdarzenia, do kogo (Admin, Obsługa stajni) i jakim kanałem (SMS, e-mail); zapis w `notification_rules`. Potem „Załóż stajnię” → PanelPulpitStart.
  - Stajnia trafia do konta firmy zalogowanego admina, więc admin ma do niej dostęp od razu; po COMMIT zdarzenie `stable.created`.
  - Nowa stajnia dostaje od kodu ustawienia domyślne: wszystko włączone, łącznie z potwierdzeniami [erd]; zmienia się je potem w „Ustawieniach stajni”. Domyślna macierz widoczności per rola: sekcja 5.
  - Stajnia, ustawienia, hala, boksy i reguły powiadomień zapisują się w jednej transakcji `stable`, z audytem [erd]; kod wstawia wiersz `notification_rules` dla każdej kombinacji zdarzenia, odbiorcy i kanału, z `enabled` według kroku 2.
- [ ] Ustawienia z `If-Match`: progi eskalacji, `author_display`, `owner_edits_feeding`, `rides_enabled`, okno instalacji APK.
- [ ] **„Ustawienia stajni”** (konfiguracja per stajnia, erd.md pkt 16), tylko admin konta firmy (Damian w obu stajniach); obsługa, klient, instruktor i konta techniczne tej stajni dostają 403, a osoba bez dostępu do stajni (Paweł w Pod Lipami) i admin innej firmy 404. Na PoC przełączniki gotowych opcji, bez własnych reguł:
  - `GET …/settings` i `PATCH …/settings` z `If-Match` i audytem: „Flagi wymagają potwierdzenia” (`flags_require_ack`), moczenie paszy (`soak_enabled`), przyciski „Ogarnięte” (`tidy_enabled`), posiłek (`meal_served_enabled`) i padok (`paddock_out_enabled`) [erd]. „Woda” nie ma przełącznika, zależy od poidła boksu [erd];
  - `GET …/role-features` i `PUT …/role-features` z `If-Match` i audytem: macierz ról `client | staff | instructor | display` × funkcji ze stałej listy `flags`, `feeding_plan`, `routine`, `box_history`, `tasks`, `health`, `rides` [erd]; `tablet` idzie za `staff` (propozycja). `admin` nie występuje w macierzy, bo widzi wszystko; nieznana rola albo funkcja daje 422 (propozycja);
  - flagi włącza się i wyłącza przez `flag_templates.active` (także Derkę, szablon `derka`) [erd]; tę tabelę zapisuje serwis `flags`, więc panel wysyła przełączniki flag do `flags`, a resztę do `stable`. Jeden przycisk „Zapisz” w panelu robi dwa żądania; przy błędzie jednego panel mówi, która część się nie zapisała (propozycja);
  - `GET …/features` (propozycja): efektywna konfiguracja dla roli zalogowanego użytkownika w tej stajni (`stableFeatures` z `packages/rules`): kafelki flag, „namoczyć”, przyciski, tryb potwierdzeń i widoczne funkcje. Apka czyta ją po wyborze stajni i przy odpytywaniu z ETag;
  - zmiana działa przy najbliższym odpytaniu apki, tabletów i wyświetlacza, bez zdarzeń [erd]; wpisy już zapisane zostają w historii; przełącznik potwierdzeń dotyczy tylko nowych flag (`horse_flags.requires_ack`, serwis `flags`).
- [ ] Hale (`buildings`) [erd]:
  - każda hala ma nazwę (unikalną w stajni), własny adres (`address_line1`, `address_line2`, `postal_code`, `city`, `country_code`), `sort_order` i `active`; adres pierwszej hali to adres podany przy zakładaniu stajni;
  - lista i edycja hal (nazwa, adres, kolejność) z `If-Match`;
  - dodanie hali przez admina w panelu web (Boksy i konie → „Dodaj halę”): nazwa i adres (z opcją skopiowania adresu innej hali), a potem jedno z trzech:
    - nowe boksy z zakresu numerów od–do, numerowane w obrębie tej hali (domyślnie od 1), niezależnie od numerów w innych halach, z ustawieniami każdego boksu od razu (niżej, „Boksy z ustawieniami przy tworzeniu”);
    - przeniesienie istniejących boksów;
    - pusta hala;
  - hala i boksy w jednej transakcji z audytem; innym serwisom nic nie wysyłamy, bo tablet i wyświetlacz widzą nową halę przy najbliższym odpytaniu;
  - usunąć można tylko pustą halę (inaczej 409);
  - wyłączenie przez `active = false`.
- [ ] Boksy z ustawieniami przy tworzeniu (Załóż stajnię i „Dodaj halę”), bo ustawień boksu będzie przybywać:
  - po podaniu zakresu („od 1 do 6”) od razu lista boksów; w wierszu numer (`label`), poidło automatyczne albo ręczne (`auto_waterer`) i „Więcej ustawień ›” jako miejsce na kolejne opcje;
  - akcja zbiorcza „Ustaw dla wszystkich”;
  - żądanie niesie listę boksów z ustawieniami; brak wartości poidła daje od kodu `true` (propozycja);
  - numer można zmienić w wierszu; powtórzone numery przechodzą, jak wszędzie.
- [ ] Boksy:
  - boks identyfikuje `id`; numer (`label`) nie jest unikalny ani w bazie, ani w kodzie: serwis nie sprawdza powtórzeń w hali ani w stajni;
  - `building_id` wymagane; zmiana `building_id` to przeniesienie boksu, a koń, historia i zdarzenia zostają przy boksie;
  - DTO boksu zawsze niesie `id`, `label`, halę (`buildingId`, nazwa) i `autoWaterer`, żeby klienci przy kilku halach pokazywali „Hala nowa · boks 4”;
  - poidło to ustawienie boksu (`boxes.auto_waterer`) [erd]: przełącznik „Automatyczne poidło: tak/nie” zmienia tylko admin w szczegółach boksu (apka BoksSzczegoly, panel), z `If-Match` i audytem; przy tworzeniu boksu admin wybiera poidło w wierszu boksu, a bez wyboru kod nadaje `true`.
- [ ] Konie: przypisanie, przeniesienie, zamiana (jedna transakcja z zamknięciem i otwarciem wpisów historii), wyjazd (`left`, zwolnienie boksu, `horse.left`). Przypisanie i przeniesienie przyjmują `boxId`, nie numer.
- [ ] Testy:
  - dwa równoległe przypisania do jednego boksu dają jedno 409;
  - zamiana koni przy współbieżnych zapisach;
  - dodanie hali z boksami 1–6 obok hali z boksami 1–8 przechodzi, a każdy boks dostaje własne `id`;
  - dwa boksy o tym samym numerze w jednej hali też przechodzą (kod nie blokuje powtórzeń);
  - przeniesienie boksu do innej hali zachowuje konia, historię i zdarzenia;
  - nowe boksy bez wybranego poidła mają `auto_waterer = true`, a boks z wybranym poidłem ręcznym `false`; „Ustaw dla wszystkich” ustawia każdy wiersz; przełącznik poidła zmienia tylko admin, obsługa dostaje 403;
  - usunięcie hali z boksami daje 409;
  - przy jednej hali interfejs nie pokazuje podziału na hale;
  - „Ustawienia stajni” i macierz widoczności zmienia tylko admin konta firmy (`If-Match`, audyt); obsługa, klient i konta techniczne dostają 403, osoba bez dostępu do stajni i admin innej firmy 404; zmiana w jednej stajni nie zmienia drugiej stajni tego samego konta;
  - nowa stajnia ma ustawienia domyślne z kodu (wszystko włączone, z potwierdzeniami) [erd];
  - rejestracja konta firmy: NIP z kreskami i bez to ten sam NIP; drugi raz ten sam NIP, także równolegle, daje jedno konto i jedno `409 tax_id_taken` (propozycja); zła suma kontrolna daje 422 (propozycja);
  - „Załóż stajnię” nie przyjmuje NIP ani działalności: stajnia zawsze trafia do konta firmy admina, a admin widzi ją od razu, bez przypisania; stajnia, hala, boksy z ustawieniami i reguły powiadomień zapisują się razem albo wcale;
  - przypisanie osoby (np. Oli) do drugiej stajni daje jej dostęp tylko do tej stajni; po odebraniu przypisania obiekty tej stajni dają 404.

**flags** (`flag_templates`, `flag_template_labels`, `horse_flags`, `flag_acknowledgements`, `flag_escalations`)
- [ ] Szablony flag z domyślnym oknem godzin (`default_window`), w tym `derka` z efektem `rug` [erd]. `flag-preview` (propozycja) zwraca podpowiedź okna i jej skutki, np. „dziś 06:00–10:00 · wstrzymane śniadanie 06:30”, liczone na serwerze.
- [ ] Włączanie i wyłączanie flag z ekranu „Ustawienia stajni”: `PATCH …/flag-templates/{id}` z `active`, tylko admin, `If-Match`, audyt [erd]. Derka to szablon `derka` (zakładanie derek jako usługa stajni). Kafelki klienta i obsługi pokazują tylko aktywne szablony i „Inna flaga”. Flagi z wyłączonego szablonu, które już trwają: sekcja 5 (propozycja: obowiązują i są widoczne do końca okna, znika tylko kafelek).
- [ ] Utworzenie flagi.
  - Id nadane przez klienta i `request_hash`.
  - Szablon albo `custom_text`.
  - Okno `valid_from`–`valid_to` obowiązkowe, w strefie stajni; „do odwołania” nie ma [erd]. Brak okna albo koniec przed początkiem daje 422 (propozycja). Przy flagach posiłkowych dodatkowo `meal_slot_id` i `service_date`.
  - `variant` dla szablonu `derka`: `on` (zakładać) albo `off` (nie zakładać); dla innych szablonów pusty (propozycja: 422 przy brakującym albo zbędnym wariancie).
  - `source` (`app` albo `on_behalf_*`) i `author_role` (`client | staff | admin`) z roli autora w stajni [erd].
  - Szablon nieaktywny w tej stajni (np. `derka` w Stajni Brzozowej) daje `409 option_disabled` (propozycja).
  - `requires_ack` kopiowane przy zapisie z `stable_settings.flags_require_ack` tej stajni [erd]; klient go nie wysyła. Zastąpienie flagi (`replaces_flag_id`, np. zmiana godzin) bierze bieżące ustawienie stajni, bo to nowy zapis (propozycja).
  - Przy zapisie wyliczane `ack_deadline_at`, `warn_at` i `notify_at`, od początku okna, tylko gdy `requires_ack = true` [erd]; przy `requires_ack = false` pola zostają puste (propozycja).
  - Gdy okno już minęło: `422 target_passed`.
- [ ] Odwołanie i zastąpienie (`replaces_flag_id`), także zmiana godzin. Status flagi to tylko „potwierdzona HH:MM” albo „niepotwierdzona” [erd], i tylko dla flagi z `requires_ack`; flaga bez potwierdzeń obowiązuje od razu i nie ma statusu.
- [ ] Potwierdzenia obsługi mogą wymagać wyłącznie flagi (wyjątki od rutyny); czy wymagają, zależy od ustawień stajni (`stable_settings.flags_require_ack`) [erd]. Szybkie akcje obsługi potwierdzenia nie mają.
  - Przełącznik włączony (Stajnia Pod Lipami): przepływ „Nowa flaga” → pop-up na tablecie → „Potwierdzono flagę” bez zmian, status „potwierdzona HH:MM” albo „niepotwierdzona”, eskalacje.
  - Przełącznik wyłączony (Stajnia Brzozowa): flaga obowiązuje od razu; nie ma pop-upu z POTWIERDZAM, statusu oczekiwania u klienta, sekcji „Wymaga potwierdzenia” u obsługi ani eskalacji [erd]. Na tablecie flaga od razu stoi w banerze (przed początkiem okna pod banerem z „od HH:MM”), bez plakietki „POTWIERDZONA”.
  - Zmiana przełącznika nie zmienia flag, które już trwają, bo każda ma własne `requires_ack` [erd]: niepotwierdzona flaga z czasu, gdy potwierdzenia były włączone, dalej czeka na potwierdzenie i eskaluje; flaga zapisana bez potwierdzeń nie dostaje statusu po ich włączeniu. Dlatego pop-up, status i sekcja „Wymaga potwierdzenia” idą za `requires_ack` flagi, a nie za bieżącym przełącznikiem stajni (propozycja).
- [ ] Potwierdzenie: `method` wynika z klienta tokenu, a `box_id` z nagłówka. Flaga zakończona albo odwołana daje `conflict` i nie wraca. Flaga z `requires_ack = false` daje `409 ack_not_required` (propozycja) i nie tworzy wiersza `flag_acknowledgements`.
- [ ] `/internal/flags/{id}/escalations`: w transakcji z blokadą wiersza flagi sprawdza, czy flaga ma `requires_ack` i czy nadal nie ma potwierdzenia; flagi bez `requires_ack` nigdy nie eskalują [erd].
- [ ] Konsumuje `horse.left`: odwołuje flagi konia.
- [ ] Testy:
  - wyścig potwierdzenia z eskalacją;
  - ten sam id z inną treścią daje `409 id_conflict`;
  - flaga bez `valid_to` jest odrzucana; flaga, która zacznie się później, ma etykietę „od 14:30” i nie wstrzymuje niczego przed początkiem okna;
  - „Derka: zakładać” 16:00–08:00 przechodzi przez północ i kończy się następnego dnia o 08:00;
  - noc zmiany czasu;
  - macierz uprawnień;
  - flaga w stajni bez potwierdzeń (Stajnia Brzozowa) ma `requires_ack = false`, puste terminy potwierdzenia i zero wierszy `flag_escalations`; jej potwierdzenie daje `409 ack_not_required` (propozycja);
  - przełączenie `flags_require_ack` w obie strony nie zmienia `requires_ack` flag już zapisanych (trwająca niepotwierdzona flaga dalej eskaluje, flaga bez potwierdzeń nie dostaje statusu); nowa flaga po przełączeniu bierze nowe ustawienie;
  - flaga z nieaktywnego szablonu (`derka` w Stajni Brzozowej, Derka wyłączona w Pod Lipami) daje `409 option_disabled` (propozycja), a „Inna flaga” (`custom_text`) przechodzi.

**care** (10 tabel karmienia, padoków, rutyny hali, „Ogarnięte” i „Wody”)
- [ ] Sloty posiłków, harmonogram dnia, pasze, padoki.
- [ ] Plan karmienia (klient edytuje tylko przy włączonym `owner_edits_feeding`) i plan padoku z towarzyszami. Pozycja planu może mieć „namoczyć” i ile (`soak`, `soak_note`, np. „w 2 l wody”), jeśli stajnia ma włączone moczenie paszy (`stable_settings.soak_enabled`); to wersja prosta, bo model karmienia jest otwartą kwestią [erd]. Przy wyłączonym moczeniu zapis z `soak = true` daje `409 option_disabled` (propozycja), a odczyty (apka, `board`) pomijają „namoczyć”; wpisy zostają w bazie.
- [ ] Wyłączone przyciski szybkich akcji (`tidy_enabled`, `meal_served_enabled`, `paddock_out_enabled` = `false`) [erd]: zapis takiej akcji z apki i z tabletu daje `409 option_disabled` (propozycja), np. „Wyprowadzono na padok” w Stajni Brzozowej. Wpisy zapisane przed wyłączeniem zostają w historii. „Woda” nie ma przełącznika, zależy od poidła boksu.
- [ ] Szybkie akcje obsługi zamiast odhaczania czynności [erd]:
  - **„Ogarnięte”** (sprzątanie i ścielenie razem): `box_care_events.kind = tidy`, jeden boks jednym tapnięciem z tabletu albo kilka zaznaczonych boksów jednym zapisem z apki (jedno żądanie, wiersz na boks). Kilka wpisów dziennie jest poprawne, a „Ogarnięte dziś 07:10” to najnowszy niecofnięty wpis;
  - **„Woda”** (tylko boks z poidłem ręcznym, `boxes.auto_waterer = false`) [erd]: `box_care_events.kind = water`, jednym tapnięciem z tabletu tego boksu albo z apki obsługi. Znacznik „Poidło ręczne · woda HH:MM” (w seedzie 06:55) to najnowszy niecofnięty wpis. Dla boksu z poidłem automatycznym zapis daje 409 (propozycja), a odpowiedzi nie mają żadnego pola wody;
  - **akcje całej hali** („Podano śniadanie / obiad / kolację”, „Wyprowadzono na padok”) zapisuje apka obsługi (z autorem) albo tablet przy dowolnym boksie tej hali (bez autora, `source = tablet`) [erd]. Zasada spójności: gdzie pokazujemy, kiedy coś zrobiono, obsługa ma przycisk, żeby to zapisać; klient i wyświetlacz tylko oglądają stan. Z tabletu hala wynika z boksu z `X-Box-Id`; akcja dla innej hali daje 403 (propozycja);
  - **„Podano śniadanie / obiad / kolację”** (każda pora ze słownika `meal_slots`, np. „Siano”; etykieta przycisku idzie za porą): jeden wiersz `building_routines` (`kind = meal_served`, `meal_slot_id`, `service_date`) na halę. Pominięte konie nie są zapisywane: wynikają z flag `suspend_meal`, których okno obejmuje godzinę posiłku, i wracają w odpowiedzi („bez Kasztana: flaga”);
  - **„Wyprowadzono na padok”**: jeden wiersz na halę i dzień (`kind = paddock_out`). Obejmuje konie z planem padoku na teraz i pomija konie z „Nie na padok” obowiązującą w tym czasie; odpowiedź podaje liczbę koni i pominiętych;
  - drugi zapis tej samej akcji hali tego dnia (np. z tabletu innego boksu tej hali albo z apki) daje `already_done` z godziną i autorem pierwszego, przy wpisie z tabletu bez autora (propozycja);
  - etykieta posiłku na tablecie idzie za porą z `meal_slots`: o 07:15 tablet Kasztana pokazuje „ŚNIADANIE · podane 06:40 · potem obiad 12:00”; od kiedy przycisk przechodzi na następną porę, erd.md nie przesądza (propozycja: od 30 min przed jej godziną);
  - **„Cofnij”** przez godzinę od zapisu ustawia `cancelled_at` (propozycja; później 409) [erd]; z tabletu akcja nie ma autora (`source = tablet`, `user_id = NULL`), z apki ma;
  - bez potwierdzania karmienia per koń i bez siana i karmy jako zdarzeń; woda tylko przy poidle ręcznym.
- [ ] `/internal/stables/{id}/defaults` (idempotentne).
- [ ] Konsumuje `horse.left` (zamyka plany, usuwa konia z towarzyszy) i `stable.created`.

**health** (`health_events`, `health_attachments`)
- [ ] Wpisy zdrowia z `visibility` (`stable` albo `owner_private`) i miękkim usuwaniem; lista wizyt według terminu.
- [ ] Załączniki przez `files`. Link do pobrania tylko po sprawdzeniu widoczności wpisu i dostępu do konia [erd].
- [ ] Wizyty i zdrowie widzi tylko rola z zaznaczonym `health` w `stable_role_features` (admin zawsze) [erd]; bez tej widoczności trasy odczytu dają 403 (propozycja).

**rides** (`arenas`, `rides`)
- [ ] Ujeżdżalnie i jazdy.
  - Kolizja konia, areny albo przekroczona pojemność daje 409.
  - Flaga `no_riding` daje ostrzeżenie.
  - Całość wyłącza `rides_enabled`.
  - Jazdy widzi tylko rola z zaznaczonym `rides` (w seedzie: klient w Pod Lipami tak, w Stajni Brzozowej nie) [erd].
- [ ] Konsumuje `horse.left`: anuluje przyszłe jazdy.

**tasks** (`tasks`)
- [ ] Zadania tylko jednorazowe, np. „Poidło w boksie 5 do wymiany” [erd]. Dodaje je wyłącznie admin (właściciel albo zarządca, rola konta firmy): tytuł, notatka, opcjonalnie hala, boks albo koń; odwołanie przez `cancelled_at`. Zadań cyklicznych nie ma, codzienną rutynę obsługują szybkie akcje `care`.
- [ ] Lista dla obsługi: „Do wzięcia”, „Moje”, „Zrobione dziś”. Widzi ją tylko rola z zaznaczonym `tasks` (w Pod Lipami obsługa i wyświetlacz; w Stajni Brzozowej nikt poza adminem, więc Ola nie ma tam zakładki „Zadania”) [erd]; bez tej widoczności trasy zadań dają 403 (propozycja).
- [ ] „Biorę”: stajenny sam bierze zadanie z listy (`taken_by`, `taken_at`), warunkową zmianą `taken_by IS NULL`; drugie „Biorę” na wzięte zadanie daje 409 z osobą, która je wzięła (propozycja).
- [ ] „Zrobione”: `done_by`, `done_at`; tylko osoba, która wzięła zadanie, albo admin (propozycja).
- [ ] Zadania obsługuje apka, bo potrzebna jest osoba; tablet ich nie pokazuje ani nie odhacza, a `board` nie zwraca ich dla tabletu [erd]. Admin dodaje zadania w apce (także w panelu: propozycja).
- [ ] Konsumuje `horse.left`: odwołuje otwarte zadania konia (propozycja).

**board** (bez tabel, rola tylko `SELECT`)
- [ ] `GET /boxes/{boxId}` (tablet). `boxId` to `boxes.id` (UUID) zapamiętany na tablecie, nigdy numer boksu, bo numer nie jest unikalny. Język tablicy przychodzi w zapytaniu z tabletu, bo to ustawienie tabletu, nie stajni (propozycja z erd.md). Odpowiedź:
  - halę (nazwa, liczba hal w stajni, żeby tablet wiedział, czy pokazać halę przy numerze), numer boksu i konia;
  - flagi z notatką, autorem flagi (według `author_display`), godzinami („06:00–10:00”; flaga, która zacznie się później, jako „od 14:30”), wariantem („Derka: zakładać”) i statusem: tylko „potwierdzona HH:MM” albo „niepotwierdzona”, i tylko dla flagi z `requires_ack`; flaga bez potwierdzeń (Stajnia Brzozowa) nie ma statusu, ma „obowiązuje od razu” i od razu stoi w banerze (przed początkiem okna pod banerem z „od HH:MM”), bez plakietki „POTWIERDZONA” [erd];
  - bez danych zalogowanego konta: tablica nie pokazuje, kto jest zalogowany;
  - znacznik pop-upu tylko dla flag `requires_ack` bez potwierdzenia; flaga zapisana w stajni bez potwierdzeń pop-upu nie ma [erd];
  - tabelę karmienia z planu, z oznaczeniem „NAMOCZYĆ” i ile przy pozycjach z `soak` (tylko przy `soak_enabled`; inaczej bez „namoczyć”), oraz posiłki wstrzymane przez flagi w ich oknie (WSTRZYMANE);
  - konfigurację stajni (`stableFeatures` z `packages/rules`) [erd]: wyłączona opcja nie trafia do odpowiedzi razem ze swoim stanem (zasada spójności), np. bez „NAMOCZYĆ”, bez przycisku „PADOK” i bez planu padoku (godziny, towarzysze) przy `paddock_out_enabled = false`, a przy wszystkich trzech przyciskach wyłączonych bez „SZYBKIE AKCJE” (TabletBoksBezAkcji); plan karmienia zostaje, bo to osobna funkcja (`feeding_plan`); sekcje filtrowane widocznością roli `staff`, bo konto `tablet` nie ma kolumny w macierzy (propozycja, sekcja 5);
  - „SZYBKIE AKCJE” (do trzech przycisków, tylko włączone w ustawieniach stajni; w Stajni Brzozowej „OGARNIĘTE” i posiłek) [erd]:
    - najnowsze „Ogarnięte” boksu („dziś 07:10”, ten boks);
    - posiłek hali: etykieta według pory z `meal_slots` („Śniadanie”, „Obiad”, „Kolacja”, np. „Siano”), stan („podane 06:40” z listą pominiętych) i następny posiłek („potem obiad 12:00”);
    - padok: plan padoku konia z godzinami skróconymi albo odwołanymi przez flagi (`packages/rules`; Kasztan „B 10:00–14:30”, z towarzyszami) i stan akcji „Wyprowadzono na padok” hali;
  - przy `auto_waterer = false` znacznik „Poidło ręczne · woda HH:MM” (najnowsza „Woda”) i dostępność akcji „Woda”; przy poidle automatycznym żadnego pola wody;
  - bez zadań: `board` nie zwraca ich dla tabletu [erd]; bez sekcji „PADOK / DZIŚ”: padok jest w przycisku, a wet i kowal tylko w banerze flagi (notatka flagi);
  - „OSTATNIE AKCJE”: najwyżej 5 najnowszych wpisów boksu i konia (flagi i zdarzenia z przycisków), bez pełnej historii [erd]; akcje z tabletu bez autora (`source = tablet`);
  - bez siana i karmy jako zdarzeń;
  - dla stajni zawieszonej: odpowiedź bez flag, z komunikatem.
- [ ] `GET …/boxes`: lista do „Zmień boks” i TabletPierwszyBoks: boksy stajni konta tabletów (jedna stajnia, bez wyboru stajni), pogrupowane po halach (aktywne hale według `sort_order`), w każdej hali boksy z `id`, numerem i koniem. Sortowanie numerów naturalne, czyli 2 przed 10 (propozycja).
- [ ] `GET …/display?buildingId=`: bez parametru wszystkie hale w sekcjach, z parametrem jedna hala (pełny ekran); DTO bez danych osobowych. Każdy kafel niesie halę razem z numerem boksu.
  - Na pełnym ekranie hali tylko flagi tej hali, w pasku pilnych także.
  - Skrót pozostałych hal pokazuje wyłącznie liczby, bez treści flag.
  - Kafel bez posiłków per koń: flagi z godzinami, „Ogarnięte HH:MM”, padok z godzinami, a przy poidle ręcznym „Poidło ręczne · woda HH:MM”; nagłówek hali z rutyną, np. „Śniadanie podane 06:40 · padok 10:00”.
  - Sekcje według widoczności roli `display` w `stable_role_features` (Stajnia Pod Lipami: flagi, plan karmienia, szybkie akcje i ich stan, zadania) i bez wyłączonych opcji razem z ich stanem: przy wyłączonych przyciskach bez „Ogarnięte HH:MM” i rutyny w nagłówku hali, przy wyłączonym padoku także bez planu padoku na kaflach i w „Dziś w stajni” [erd]; stan „niepotwierdzona” tylko dla flag z `requires_ack` [erd].
- [ ] Lista dnia obsługi (szybkie akcje per hala, tylko włączone przyciski; „Wymaga potwierdzenia” tylko z flagami z `requires_ack` bez potwierdzenia, więc w stajni bez potwierdzeń jej nie ma, chyba że trwa niepotwierdzona flaga sprzed wyłączenia przełącznika (A-20); skrót zadań, gdy obsługa ma widoczność `tasks`) i historia boksu (propozycja). Stajnia Brzozowa: „Podano śniadanie” i „Ogarnięte”, bez padoku, bez „Wymaga potwierdzenia”, bez zadań, bez hali.
- [ ] Konfiguracja i widoczność są częścią treści, więc ich zmiana zmienia ETag i tablet, apka i wyświetlacz widzą ją przy najbliższym odpytaniu [erd].
- [ ] `ETag` to hash treści.
  - Czas serwera idzie w nagłówku, nie w treści.
  - Treść zależy od upływu czasu, więc na start składamy całą odpowiedź przy każdym zapytaniu.

**billing** (9 tabel; na PoC bez rozbudowy, na fałszywych adapterach, poziom stajni [erd])
- [ ] Subskrypcja i zużycie, dane do faktury, faktury z `pdf-url`, sesja metody płatności przez adapter. NIP, nazwę i siedzibę konto rozliczeniowe stajni dostaje z konta firmy przy zakładaniu stajni; w płatnościach NIP-u się nie wpisuje (propozycja z erd.md).
- [ ] Webhook dostawcy:
  - weryfikacja podpisu;
  - surowe body do S3;
  - unikalny `provider_event_id`;
  - `processed_at`.
- [ ] Endpointy wewnętrzne: `/internal/usage-snapshots`, `/internal/invoices/issue`, `/internal/dunning/run`.
- [ ] Adaptery `PaymentProvider`, `InvoiceSystem` i generator PDF, każdy z implementacją fałszywą.
- [ ] Numer faktury nadaje kod, bez sekwencji. Cron wystawia faktury po kolei; unikalne `invoices.number` chroni przed duplikatem, a przy konflikcie cron ponawia.
- [ ] Publikuje `subscription.status_changed`.

**files** (`files`, tylko `/internal`)
- [ ] Plik `pending` z kluczem `stable_id/…` i presigned upload z warunkami typu i rozmiaru.
- [ ] `attach` sprawdza przez HeadObject rozmiar, typ i `sha256`.
- [ ] `download-url` z krótką ważnością; `delete`, `gc`.
- [ ] APK ma `stable_id = NULL`, więc trafia pod osobny prefiks. To wyjątek opisany w README serwisu.

**releases** (`app_releases`, `app_release_targets`)
- [ ] Endpointy operatora:
  - wydanie jako `draft` z `sha256`, `signing_cert_sha256`, `min_sdk` i `min_required_version_code`;
  - statusy `rolling` (z `rollout_percent`), `complete` i `halted`;
  - lista stajni docelowych.
- [ ] `GET /tablet/latest?versionCode=&stableId=&installId=`:
  - procent wdrożenia liczony z hasha lokalnego `installId`, bez tabeli urządzeń;
  - okno instalacji z ustawień stajni;
  - wymuszenie aktualizacji poniżej `min_required_version_code`;
  - presigned URL z obsługą `Range`.
- [ ] Klient operatora `tools/opctl` (CLI) dla wydań APK i planów billingu. Uwierzytelnianie operatora: sekcja 5.

**notifications** (`notifications`)
- [ ] `POST /internal/notifications`:
  - szablon i język;
  - odbiorca jako użytkownik albo adres;
  - `related_flag_id` i `related_invitation_id`;
  - unikalny `dedupe_key`;
  - treść renderowana przy tworzeniu.
- [ ] Wysyłka asynchroniczna (propozycja: własna kolejka SQS), z licznikiem prób. Przed wysyłką sprawdza, czy wiadomość ma jeszcze sens: dla flagi już potwierdzonej ustawia `cancelled`.
- [ ] Adaptery `SmsSender` (dostawca: sekcja 5) i `EmailSender` (SES).
- [ ] Reguły powiadomień stajni (`notification_rules`, z kroku 2 „Załóż stajnię”; tabela `stable`) [erd]: dla zdarzenia `notifications` bierze włączone wiersze tej stajni; odbiorca `admin` to admini konta firmy (`business_admins`), `staff` to aktywna obsługa tej stajni; kanał SMS albo e-mail. Eskalacja niepotwierdzonej flagi idzie według tych reguł, tylko dla flag z `requires_ack`. Lista zdarzeń: erd.md. Zaproszenie idzie kanałem wybranym w zaproszeniu.
- [ ] Konsumuje `invitation.created` i `user.deleted`.

**audit** (schemat `audit`)
- [ ] Odczyt historii obiektu (kto ma do niego dostęp: sekcja 5) i `prune`. Tylko ten serwis czyta i usuwa wpisy [erd].

### 3.4 Crony
- [ ] `escalation-scheduler`, co minutę.
  - Flagi z `requires_ack`, minionym `warn_at` albo `notify_at`, bez potwierdzenia i nieodwołane [erd]. Flag bez `requires_ack` (stajnia bez potwierdzeń, np. Stajnia Brzozowa) nie bierze wcale, także po późniejszym włączeniu potwierdzeń w stajni.
  - Woła `flags`, a przy `admin_notify` także `notifications`, które wysyła powiadomienie według reguł stajni (`notification_rules`: odbiorcy i kanał SMS albo e-mail, propozycja).
  - Klucze idempotencji: `(flag_id, level)` i `dedupe_key`.
- [ ] `health-due-reminders`, co godzinę. Wysyła o stałej godzinie lokalnej stajni. Klucz: `health:{eventId}:{rodzaj}`.
- [ ] `files-gc`, co godzinę. Najpierw usuwa obiekt w S3, potem zmienia wiersz.
- [ ] `billing-usage-snapshot`, na koniec okresu. Klucz: `(subscription_id, period_start, metric)`.
- [ ] `billing-invoicing`, 1. dnia miesiąca.
- [ ] `billing-dunning`, codziennie.
  - Przypomnienia, potem `past_due`, potem `suspended`.
  - Propozycja: przy rozjeździe `subscriptions.status` i `stables.status` ponawia zdarzenie.
- [ ] `horse-left-reconciler`, co godzinę. Woła ten sam handler co konsument `horse.left` w `access`, `flags`, `care`, `tasks` i `rides`.
- [ ] `retention-pruner`, co noc. Woła `POST /internal/prune` każdego serwisu i sam niczego nie usuwa.
- [ ] `invitation-expiry-notifier` (propozycja z erd.md): znajduje zaproszenia po `expires_at`, nieprzyjęte i nieodwołane, i zleca powiadomienie według reguł stajni (`notification_rules`).
- [ ] Każdy cron testujemy na cztery przypadki: powtórzony przebieg, przebieg równoległy, przerwanie w połowie, fałszywy zegar (w tym noc zmiany czasu).
- **Nie śledzimy wyświetleń flag na tabletach** [erd]: nie ma do tego ani tabeli, ani crona. Status flagi to tylko „potwierdzona HH:MM” albo „niepotwierdzona” (w stajni, która wymaga potwierdzeń; czy wymaga, zależy od ustawień stajni). Brak potwierdzenia w terminie, także przy martwym tablecie, obsługuje wyłącznie `escalation-scheduler` przez `flag_escalations` (scenariusz A-02).
- **Bez crona zadań i rutyny** [erd]: zadania są jednorazowe, więc nie ma generatora wystąpień. Rutyny dnia też nie generujemy z wyprzedzeniem: szybkie akcje zapisuje obsługa (apka albo tablet przy boksie), a pominięte konie i skutki flag liczy `packages/rules` przy zapisie i przy odczycie `board`.

### 3.5 Aplikacje

#### 3.5.1 Apka mobilna (klient, obsługa, admin)
- [ ] Szkielet:
  - Expo w development buildzie, Expo Router;
  - TanStack Query z trwałym cache;
  - `api-client` i i18n;
  - `react-native-get-random-values` jako pierwszy import, bo id nadaje klient.
- [ ] Logowanie: Cognito `USER_AUTH` z `SMS_OTP` albo `EMAIL_OTP`, tokeny w `expo-secure-store`. Wzorzec wspólny dla apki, panelu, tabletu i TV: nad polem przełącznik segmentowy „Telefon | E-mail” (w stylu „Kanał: SMS | E-mail” z makiety Zaproszenie), potem kod; bez dopisków. Autouzupełnianie kodu z SMS-a (`one-time-code`, SMS Retriever); kod z e-maila wpisuje się ręcznie albo wkleja. Po zalogowaniu `GET /me` i członkostwa, nawigacja według roli, przełącznik stajni.
- [ ] Przełącznik stajni w nagłówku („Stajnia Pod Lipami ▾”) dla osób z dostępem do kilku stajni (Damian jako admin konta firmy, Ola, Anna, Marta); Paweł i Piotr widzą samą nazwę stajni. Po przełączeniu apka pobiera konfigurację tej stajni (`stable GET …/features`) i pokazuje tylko włączone opcje i funkcje widoczne dla roli: kafelki aktywnych flag, „namoczyć” przy włączonym moczeniu, włączone przyciski, status tylko przy flagach z `requires_ack` (w praktyce: stajnia z potwierdzeniami). Cache i kolejka zapisów są osobne dla każdej stajni (propozycja). Przy jednej stajni przełącznika nie ma.
- [ ] Odpytywanie z ETag tylko na widocznym ekranie.
- [ ] Zapisy:
  - flaga wyłącznie online, z jawnym stanem „zapisano na serwerze”;
  - „Biorę” przy zadaniu wyłącznie online, bo zajęte zadanie trzeba pokazać od razu (409, gdy ktoś już wziął; propozycja);
  - pozostałe zapisy (potwierdzenia, „Ogarnięte”, „Woda”, akcje hali, „Cofnij” i „Zrobione”) przez lokalną kolejkę.
- [ ] Ekrany z makiet:
  - Logowanie (przełącznik „Telefon | E-mail”);
  - bez stajni: ZaproszeniePrzyjmij, gdy czeka zaproszenie (dopasowuje się samo po zalogowaniu), albo BrakDostepu: „Brak dostępu do stajni”, „Zaloguj się innym kontem”, „Wyloguj”; bez próśb do admina, bez pokazywania numeru i telefonu stajni;
  - Moje konie (Main), także MainBrzozowa (klientka Anna po przełączeniu na Stajnię Brzozową);
  - SzybkaFlaga, StatusFlagi, KartaKonia;
  - MojBoks;
  - ListaDnia, także ListaDniaBrzozowa (Ola po przełączeniu na Stajnię Brzozową), StajennyKonie, StajennyZadania;
  - BoksyAdmin, BoksSzczegoly;
  - wariant Stajni Pod Lipami z wyłączonymi przyciskami obsługi (Ogarnięte, posiłek, padok; A-19): MainBezAkcji, MojBoksBezAkcji, KartaKoniaBezAkcji, ListaDniaBezAkcji, BoksyAdminBezAkcji;
  - Zaproszenie.
- [ ] Klient (właściciel albo dzierżawca konia), widok maksymalnie prosty [erd]:
  - Main i SzybkaFlaga: kafelki flag włączonych w ustawieniach stajni (Stajnia Pod Lipami: Bez śniadania, Bez kolacji, Nie na padok, Derka, Wet, Leki, Inna flaga; Stajnia Brzozowa: te same bez Derki), godziny od–do podpowiedziane z możliwością zmiany, opcjonalna notatka i przycisk, bez innych pól i kroków; „Derka” z wyborem „zakładać / nie zakładać” tylko tam, gdzie stajnia oferuje derki [erd];
  - przy flagach godziny i status (status tylko dla flag z `requires_ack`, w praktyce: stajnia z potwierdzeniami; flaga bez potwierdzeń ma „obowiązuje od razu”); na liście koni najwyżej skrót z przycisków obsługi, bez linii posiłku per koń (MainBrzozowa: Kometa, „Bez śniadania 06:00–09:00 · dentysta o 8:30”, „Ogarnięte dziś 07:00 · śniadanie pominięte: flaga”; MainBezAkcji bez skrótu z przycisków: Bella bez „Podano śniadanie 06:50 · ogarnięte wczoraj 17:30”, a Kasztan przy „Nie na padok” ma „do 16:00 · kowal o 15:00” bez „padok do 14:30”);
  - StatusFlagi: godziny obowiązywania i oś Ustawiona → Potwierdzona (tylko dla flag z `requires_ack`; flaga bez potwierdzeń ma samo „Ustawiona · obowiązuje od razu”, propozycja);
  - KartaKonia: plan karmienia z „namoczyć” i ile (plan tylko przy widoczności `feeding_plan` dla klienta, „namoczyć” tylko przy włączonym moczeniu), „Dziś” (wet 8:00, padok B 10:00–14:30 tylko przy włączonym padoku, kowal 15:00), flagi z godzinami; KartaKoniaBezAkcji: „Dziś” bez padoku (Bez śniadania, wet 08:00, Nie na padok 14:30–16:00, kowal 15:00), plan karmienia z „namoczyć” bez zmian, w „Historii” najnowsze zdarzenie flagi zamiast „Ogarnięte”;
  - MojBoks: „Ostatnio” tylko zdarzenia z przycisków obsługi (Ogarnięte, Podano śniadanie/obiad/kolację z pominiętymi, Wyprowadzono na padok); dla Kasztana: Ogarnięte dziś 07:10, Podano śniadanie 06:40 (pominięty: flaga), Wyprowadzono na padok wczoraj 10:05 · Piotr. „Historia” tylko flagi (utworzenie, potwierdzenie przy flagach z `requires_ack`, odwołanie) i zdarzenia z przycisków, także wczorajsze (Podano kolację 18:02 · Piotr, padok 10:05 · Piotr). MojBoksBezAkcji (przyciski obsługi wyłączone): bez „Ostatnio”, z jedną neutralną linią, że w tej stajni obsługa nie zapisuje w aplikacji ogarnięcia, posiłków ani padoku; „Historia” to tylko 4 zdarzenia flag Kasztana z dziś (bez grupy „Wczoraj”);
  - sekcje według widoczności roli klienta w tej stajni (`stable_role_features`): w Stajni Brzozowej klientka nie ma planu karmienia ani jazd [erd].
- [ ] Obsługa i admin:
  - ListaDnia: na górze „Szybkie akcje” per hala (tylko przyciski włączone w ustawieniach stajni): „Podano śniadanie / obiad / kolację” (po zapisie „✓ 06:40”, pominięci, „Cofnij”), „Wyprowadzono na padok” z liczbą koni i pominiętymi, „Ogarnięte” z licznikiem (7 z 14) otwierające siatkę boksów z zaznaczaniem kilku naraz i jednym zapisem; „Wymaga potwierdzenia” tylko z flagami, i tylko z flagami z `requires_ack` bez potwierdzenia (w stajni bez potwierdzeń sekcji nie ma, chyba że trwa niepotwierdzona flaga sprzed wyłączenia przełącznika, A-20); bez listy karmienia per koń; skrót zadań (przy widoczności `tasks`); ListaDniaBezAkcji (wszystkie trzy przyciski wyłączone): bez sekcji „Szybkie akcje”, z „Wymaga potwierdzenia” (Bella), „Flagami dziś”, zadaniami i nawigacją;
  - ListaDniaBrzozowa (Ola po przełączeniu stajni): „Szybkie akcje” na całą stajnię: „Podano śniadanie” (✓ 06:35 · Paweł, pominięta Kometa) i „Ogarnięte 3 z 6”, bez padoku; bez sekcji „Wymaga potwierdzenia”; „Flagi dziś” bez statusu („obowiązują od razu”: Kometa, Lord); bez namaczania i bez zadań; bez hali przy numerze;
  - StajennyZadania (zakładka „Zadania”, tylko przy widoczności `tasks` dla obsługi): „Do wzięcia” z „Biorę”, „Moje” z „Zrobione”, „Zrobione dziś”; „+ Dodaj zadanie” widzi tylko admin;
  - StajennyKonie: kafelki szybkiej flagi włączonych w stajni (z Derką tylko tam, gdzie stajnia oferuje derki), godziny przy flagach;
  - BoksyAdmin i BoksSzczegoly: „Ogarnięte dziś 07:10” zamiast osobnych czynności, flagi z godzinami, klient przy koniu (Marek Nowak przy Lunie, „zaproszenie czeka”), przyciski „Ogarnięte” i „Przypisz konia”; przy poidle ręcznym (Hala nowa · boks 5) znacznik „Poidło ręczne · woda 06:55” i przycisk „Woda”, przy automatycznym bez znacznika wody; w BoksSzczegoly admin ma przełącznik „Automatyczne poidło: tak/nie” (wolny boks 6 w Hali nowej: „tak”); BoksyAdminBezAkcji bez linii „Ogarnięte …”, reszta bez zmian;
  - Zaproszenie: role Klient (z wyborem konia), Obsługa, Instruktor; bez Wsparcia IT; kanał „SMS | E-mail”.
- [ ] Ekrany bez makiet: profil (wyloguj wszędzie, usuń konto, język), dodawanie zadania przez admina, jazdy instruktora.
- [ ] Przy kilku halach zawsze „Hala nowa · boks 4”; przy jednej hali bez podziału. Nawigacja do boksu zawsze po `id`.
- [ ] Kolory i znak słowny „EQUENOR” z `packages/theme` (tokeny LCD z `docs/paleta.md`): akcent tylko na elementach klikalnych; status zawsze jako ikona, słowo i pole, nigdy sam kolor; flaga krytyczna jako jasny tint z lewym paskiem 4 px.

#### 3.5.2 Apka tabletu (kiosk e-ink, kolorowy albo czarno-biały)
- [ ] `apps/tablet`: Expo w development buildzie. Dystrybucja wyłącznie jako APK przez `releases`.
- [ ] Sprzęt do developmentu (zakupy: sekcja 1): Boox Note Air6 C (kolorowy 10,3", Android 16). Tylko jeśli coś nie zadziała: Samsung Galaxy Tab Active5 jako wzorzec Device Owner i plan B oraz Boox Go 10.3 Gen II Lumi do testu prawdziwego czarno-białego ekranu. Kolorowe i czarno-białe modele e-ink są równorzędnymi kandydatami.
- [ ] Moduł Kotlin `modules/kiosk` (Expo Modules API i config plugin):
  - `DeviceAdminReceiver` oraz odbiorniki `BOOT_COMPLETED`, `LOCKED_BOOT_COMPLETED` i `MY_PACKAGE_REPLACED`;
  - Lock Task z `setLockTaskFeatures(LOCK_TASK_FEATURE_NONE)`; `GLOBAL_ACTIONS` trzeba wyłączyć jawnie;
  - apka jako HOME, `setKeyguardDisabled`, `STAY_ON_WHILE_PLUGGED_IN`;
  - restrykcje: `DISALLOW_DEBUGGING_FEATURES`, blokada resetu fabrycznego z ustawień;
  - blokada aktualizatora OTA producenta (`setPackagesSuspended` albo `setApplicationHidden`) i `setSystemUpdatePolicy`;
  - cicha instalacja przez `PackageInstaller`, z kontrolą `sha256` i certyfikatu podpisu;
  - watchdog: restart procesu, gdy JS przez N minut nie zgłosi udanego odpytania;
  - limit ładowania tam, gdzie firmware go udostępnia (Boox: `charge_control_en`);
  - dodanie sieci Wi-Fi jako DO (`WifiManager.addNetwork`), sprawdzone pod kątem kolizji z `DISALLOW_CONFIG_WIFI`.
- [ ] Odświeżanie EPD przez wspólny interfejs `epdRefresh(full|partial)`, z czterema implementacjami:
  - Onyx SDK;
  - kontroler Onyx/Qualcomm jak w KOReader;
  - refleksja dla RK3566;
  - pełna klatka czarna i biała jako wariant awaryjny na każdym sprzęcie.

  Żadna implementacja nie może „nic nie robić”.

  Kolorowy e-ink i tablet bez e-inku:
  - Na kolorowym e-inku (Kaleido 3, Gallery 3) pole koloru zmienia się tylko przy zmianie statusu, jednym pełnym odświeżeniem w trybie z kolorem. Zegar, odliczanie i pasek ONLINE są czarno-białe i korzystają z szybkiego odświeżania, bo szybkie tryby gubią kolor. Czy Onyx SDK pozwala ustawić tryb dla fragmentu ekranu na Note Air6 C: [niepotwierdzone] (T-21, K-05).
  - Na tablecie LCD (Samsung Galaxy Tab Active5 jako wzorzec Device Owner i plan B, jeśli zostanie dokupiony) EPD nie istnieje: moduł wykrywa to jawnie i zapisuje w diagnostyce, zamiast po cichu pomijać odświeżanie (propozycja).
- [ ] Onyx SDK (repozytorium Maven tylko po HTTP):
  - artefakty w lustrze albo w repo (vendoring);
  - Gradle dependency verification z sumami;
  - `allowInsecureProtocol` najwyżej dla tego jednego repozytorium.
- [ ] `tools/provision-tablet`, w tej kolejności:
  1. rozpakowanie bez Wi-Fi i bez konta;
  2. zapis modelu, numeru firmware i `ro.board.platform`;
  3. włączenie ADB według procedury dla danego modelu;
  4. `adb install`;
  5. `dpm set-device-owner`;
  6. blokada aktualizatora OTA i nałożenie polityk oraz ustawień producenta;
  7. dopiero teraz dodanie sieci przez DPC;
  8. logowanie kontem technicznym tabletów i wybór boksu;
  9. wyłączenie ADB.
- [ ] Odzyskanie tabletu: reset fabryczny z ustawień jest zablokowany, ale reset z recovery (przyciski) zostaje jako ścieżka serwisowa, po której idzie ponowny provisioning. Czy FRP przeszkadza bez konta Google: [niepotwierdzone] (T-06).
- [ ] Ekrany:
  - **TabletBoks:**
    - nagłówek z numerem boksu i koniem, przy kilku halach zawsze z nazwą hali („Hala nowa · boks 4”), oraz przyciski „Zmień boks” i „Zablokuj ekran” (kłódka);
    - bez informacji, kto jest zalogowany (logowanie i wylogowanie tylko w ukrytych ustawieniach);
    - baner flagi z godzinami („BEZ ŚNIADANIA · 06:00–10:00”), a pod nim flagi, które zaczną się później, z etykietą „od HH:MM” („Później: Nie na padok od 14:30 (kowal 15:00)”; Sonata o 07:15: „Derka: zakładać · od 16:00”); plakietka „POTWIERDZONA HH:MM” tylko dla flag z `requires_ack` (w praktyce: stajnia z potwierdzeniami), a flaga bez potwierdzeń od razu stoi w banerze z etykietą „obowiązuje od razu” (przed początkiem okna pod banerem z „od HH:MM”) [erd];
    - KARMIENIE: tabela z planu ze stanem WSTRZYMANE, pozycje do namoczenia wyraźnie oznaczone („Wysłodki 0,5 kg · NAMOCZYĆ 2 l”, wieczór), tylko przy włączonym moczeniu paszy;
    - bez ramki „PADOK / DZIŚ”: padok jest w przycisku „PADOK”, a wet i kowal w banerze flagi;
    - SZYBKIE AKCJE (podpis „ogarnięte: ten boks · posiłek i padok: cała hala”), do trzech dużych przycisków, tylko włączonych w ustawieniach stajni; wyłączony przycisk znika razem ze swoim stanem [erd]:
      - „OGARNIĘTE”: ten boks, stan „dziś 07:10”, ponowne tapnięcie zapisuje ponownie;
      - posiłek dla całej hali tego boksu, z etykietą według pory z `meal_slots` („ŚNIADANIE”, „OBIAD”, „KOLACJA”, np. „SIANO”): stan „podane 06:40”, pod spodem „potem obiad 12:00”; tapnięcie zapisuje „Podano śniadanie” dla hali i pomija konie z flagą (Kasztan);
      - „PADOK”: „Wyprowadzono na padok” dla całej hali tego boksu; pokazuje padok konia po skutkach flag („B 10:00–14:30 z Falą i Rumbą”);
    - te same akcje hali są w apce obsługi (ListaDnia); zapis z tabletu nie ma autora (`source = tablet`), a stan widać na pozostałych tabletach hali, w apce i na wyświetlaczu przy najbliższym odpytaniu;
    - do tego POTWIERDZAM przy fladze z `requires_ack` (pop-up i baner; przy fladze bez potwierdzeń nie ma go wcale) oraz przy poidle ręcznym (Hala nowa · boks 5) znacznik „Poidło ręczne · woda 06:55” i przycisk „WODA”; przy automatycznym (prawie każdy boks) znacznika wody nie ma [erd];
    - bez zadań: tablet ich nie pokazuje ani nie odhacza;
    - OSTATNIE AKCJE: najwyżej 5 najnowszych wpisów (flagi i przyciski), bez przewijania i bez „Cała historia” [erd]; pełna historia w apce i panelu;
    - bez siana i ścielenia;
    - stopka „ONLINE · aktualne na HH:MM”, przełącznik PL i UA; wybrany język tablet pamięta lokalnie, jak boks.
  - **TabletEkranZablokowany** (blokada dotyku na czas mycia albo wycierania) [erd]:
    - „Zablokuj ekran” (kłódka) obok „Zmień boks” włącza blokadę;
    - tablica dalej się odświeża i jest czytelna, ale dotyk nic nie zmienia; pasek „EKRAN ZABLOKOWANY · przytrzymaj kłódkę 3 s, aby odblokować”, przy kłódce kółko postępu przytrzymania;
    - przyciski z przerywaną ramką zamiast wyszarzenia (e-ink), tylko czerń, biel i `t-*`;
    - pop-up nowej flagi (tylko dla flag z `requires_ack`, w praktyce: stajnia z potwierdzeniami) pojawia się mimo blokady, ale POTWIERDZAM działa dopiero po odblokowaniu; flaga bez potwierdzeń po prostu pojawia się w banerze;
    - blokada sama schodzi po 10 min (propozycja), żeby tablet nie został zablokowany na stałe;
    - stan tylko lokalnie na tablecie (w pamięci apki), bez API i tabel; po restarcie apki ekran jest odblokowany (propozycja);
    - to blokada dotyku, a nie blokada boksu (tej nie ma).
  - **TabletPopup** (tylko w stajni, która wymaga potwierdzeń; czy wymaga, zależy od ustawień stajni [erd]; tylko flagi z `requires_ack`):
    - kolejka pop-upów, krytyczne pierwsze;
    - godziny flagi („dziś 06:00–10:00”);
    - pop-up nowej flagi znika po POTWIERDZAM albo po odwołaniu flagi, czyli gdy flaga zniknie z odpowiedzi przy najbliższym odpytaniu (także po potwierdzeniu na innym tablecie albo w apce);
    - status flagi tylko „potwierdzona HH:MM” albo „niepotwierdzona”;
    - po restarcie wraca.
  - **TabletZmianaBoksu** (bez blokady boksu: zmienić może każdy, kto stoi przy tablecie):
    - lista z `board GET …/boxes`, w zakładkach hal; otwarta jest zakładka hali bieżącego boksu; przy jednej hali sama lista, bez zakładek;
    - konto tabletów należy do jednej stajni, więc wyboru stajni nie ma [erd]. Ta sama lista, bez powrotu po 30 s, jest pierwszym ekranem po zalogowaniu (TabletPierwszyBoks, nagłówek „WYBIERZ BOKS”);
    - przycisk boksu z numerem i koniem; wolny boks oznaczony;
    - przełączenie od razu po stuknięciu;
    - powrót do poprzedniego boksu po 30 s bez wyboru;
    - wybór, czyli `boxes.id` (nie numer), zapisany lokalnie na tablecie; przetrwa restart, aktualizację APK i ponowne logowanie, a serwer o nim nie wie;
    - nowy pop-up w trakcie wybierania: zachowanie sprawdza T-28.
  - **TabletBoksBrzozowa** (boks 1, Kometa, w stajni z jedną halą i bez potwierdzeń):
    - nagłówek „BOKS 1 · KOMETA” bez hali;
    - baner „BEZ ŚNIADANIA · 06:00–09:00 · dentysta o 8:30” z „obowiązuje od razu”, bez pop-upu i bez plakietki „POTWIERDZONA”;
    - SZYBKIE AKCJE tylko „OGARNIĘTE” (dziś 07:00) i „ŚNIADANIE” (podane 06:35, potem obiad 12:00; posiłek dla całej stajni), bez „PADOK”;
    - karmienie bez „NAMOCZYĆ”; OSTATNIE AKCJE: 5 wpisów (07:00 Ogarnięte, 06:35 Podano śniadanie bez Komety · Paweł, 05:50 nowa flaga · Anna, wczoraj 18:00 Podano kolację i 16:30 Ogarnięte · Paweł).
  - **TabletBoksBezAkcji** (Hala główna · boks 7, Kasztan, w Stajni Pod Lipami z wyłączonymi przyciskami Ogarnięte, posiłek i padok; A-19):
    - bez sekcji „SZYBKIE AKCJE” (OGARNIĘTE, ŚNIADANIE, PADOK) i bez planu padoku;
    - baner „BEZ ŚNIADANIA · 06:00–10:00” z „POTWIERDZONA 06:02” i „Później: Nie na padok od 14:30 (kowal 15:00)” oraz KARMIENIE z WSTRZYMANE i „NAMOCZYĆ” bez zmian;
    - OSTATNIE AKCJE: 4 zdarzenia flag (06:02 dwa potwierdzenia, 03:16 i 03:14 nowe flagi · Anna), nagłówek „ostatnie · boks i koń”, bo w makiecie stajnia nie ma zdarzeń z przycisków (A-19); tablet z poidłem ręcznym (Hala nowa · boks 5) dalej ma „Poidło ręczne · woda 06:55” i „WODA”.
- [ ] Ukryte ustawienia (długie przytrzymanie): KONTO („Tablety Pod Lipami · konto techniczne”, wylogowanie), BOKS („Hala główna · boks 7 · Kasztan”), JĘZYK TABLICY, SIEĆ (dodanie sieci Wi-Fi), DIAGNOSTYKA, EKRAN; bez osobnego wiersza stajni. Kto może zmienić sieć: sekcja 5.
- [ ] Logowanie tabletu (TabletLogowanie, TabletLogowanieKod): kontem technicznym tabletów (rola `tablet`; w seedzie b•••@stajnielipowe.pl i kod z e-maila), telefonem albo e-mailem; nad polem przełącznik „TELEFON | E-MAIL” w stylu e-ink (wersaliki, tylko czerń, biel i `t-*`), potem kod; bez dopisków. Konto bez roli `tablet` (osoba, Wyświetlacz): TabletBrakUprawnien.
- [ ] Język tablicy to ustawienie tego tabletu, nie stajni: każdy tablet ma własny (ukryte ustawienia albo PL | UA w stopce), zapisany lokalnie jak wybrany boks. Przetrwa restart, aktualizację APK i ponowne logowanie. Tablet wysyła go w zapytaniu do `board` (propozycja z erd.md), a serwer go nie zapisuje. Tłumaczenia nazw z `*_labels` (np. pory posiłków po ukraińsku) są opcjonalne; bez tłumaczenia tablet pokazuje nazwę polską (propozycja).
- [ ] Stany ekranu:
  - wylogowany, także po global sign-out konta tabletów; nigdy nie pokazuje wtedy starych flag;
  - bez wybranego boksu;
  - boks wolny;
  - ekran zablokowany (dotyk);
  - brak uprawnień (konto bez roli `tablet` albo zablokowane konto tabletów);
  - stajnia zawieszona;
  - brak sieci;
  - wymagana aktualizacja.
- [ ] Odpytywanie:
  - interwał według decyzji (sekcja 5), z `If-None-Match`, jitterem i backoffem;
  - sprawdzić, czy odpowiedź 304 dociera do JS;
  - czas brany z nagłówka serwera.
- [ ] Zapisy: tylko potwierdzenie flagi (z `requires_ack`), „Ogarnięte”, posiłek i padok dla hali tego boksu (tylko włączone przyciski), „Woda” (boks z poidłem ręcznym) i ich „Cofnij”; zadań tablet nie zapisuje [erd]:
  - kolejka w SQLite;
  - id nadane przez klienta i `request_hash`;
  - `occurred_at` i `time_quality`;
  - bez autora: `source = tablet`, `user_id = NULL`, `box_id` wybranego boksu z nagłówka `X-Box-Id`;
  - licznik niewysłanych.
- [ ] Zasady e-ink (paleta tabletu `t-*` z `docs/paleta.md`, przez `packages/theme`):
  - ten sam ekran działa na kolorowym e-inku (Kaleido 3, Gallery 3) i na czarno-białym, bez osobnej wersji interfejsu;
  - profil palety: domyślny (Kaleido 3) albo profil Gallery 3, który podmienia `t-ok`, `t-warn` i `t-crit`. Tablet wybiera profil po modelu urządzenia (lista model → profil w konfiguracji APK), z ręcznym przełącznikiem w ukrytych ustawieniach (propozycja). Czarno-biały ekran używa profilu domyślnego, bo drabina jasności jest czytelna w szarości;
  - kolor tylko w dużych polach: baner flagi, komórki tabeli, kafle (≥ 44 px), pasek popupu 16 px, lewy pasek ≥ 10 px. Bez kolorowego tekstu, ikon, cienkich linii i obrysów;
  - na kolorze tylko pogrubiony tekst czarny (`t-ok`, `t-warn`) albo biały (`t-crit`, ≥ 19 px); szary tekst wyłącznie `t-ink-2` ≥ 20 px na papierze;
  - neutralne kolory tylko achromatyczne; bez szarych wypełnień w roli struktury (nagłówki tabel i tło białe, sekcje oddziela czarna linia), więc szare pole zawsze oznacza status;
  - każdy status ma też słowo, ikonę i grubość obrysu: krytyczna to ciemne pole bez ramki, uwaga ramka 4 px, OK 2 px, do zrobienia 2 px przerywana; info (leki, wet) bez wypełnienia, z ramką 2 px i ikoną;
  - popup na nieprzezroczystym `t-scrim`;
  - bez animacji;
  - duże fonty, przyciski ok. 15 mm;
  - pełne odświeżenie po pop-upie, przy nowej fladze krytycznej, przy każdej zmianie pola koloru i co najmniej raz na dobę;
  - zegar odświeżany częściowo co minutę, czarno-biały.
- [ ] Testy zrzutów (propozycja): ekrany z fixture'ów renderowane w obu profilach i przeliczone na skalę szarości; statusy muszą się różnić jasnością i obrysem także bez koloru. Czytelność i kolejność jasności na prawdziwym Kaleido 3, Gallery 3 i czarno-białym ekranie: [niepotwierdzone], bo sterownik ma własną krzywą i dithering (T-20, T-21, K-01, K-06). Czarno-biały ekran sprawdzamy na sprzęcie tylko wtedy, gdy zostanie dokupiony Boox Go 10.3 Gen II Lumi.
- [ ] Aktualizacja APK:
  - sprawdzanie po starcie i co kilka godzin;
  - pobieranie ze wznawianiem;
  - instalacja w oknie serwisowym, przy pustej kolejce zapisów;
  - cofnięcie wersji to APK z wyższym `versionCode`.
- [ ] Diagnostyka (2.12) z buforem offline.

#### 3.5.3 Panel web
- [ ] SPA (propozycja: React, Vite, TanStack). Sposób przechowywania tokenów: sekcja 5.
- [ ] PanelBoksy:
  - liczniki;
  - alert o niepotwierdzonej fladze krytycznej (tylko dla flag z `requires_ack`, w praktyce: stajnia z potwierdzeniami; trwająca niepotwierdzona flaga zostaje w alercie także po wyłączeniu potwierdzeń, A-20);
  - filtry i wyszukiwarka;
  - tabela boksów z kolumnami: Boks, Koń, Klient (jedna kolumna: właściciel albo dzierżawca konia), Aktywne flagi (z godzinami), Ostatnio ogarnięte, Akcje; bez kolumn innych czynności; boks z poidłem ręcznym ma znacznik „Poidło ręczne · woda HH:MM” (bez osobnej kolumny), a szczegóły boksu przełącznik „Automatyczne poidło: tak/nie” (admin);
  - sekcje hal z adresem;
  - konie bez boksu (Luna, klient Marek Nowak, „zaproszenie czeka”).
- [ ] PanelBoksyBezAkcji (Damian, Stajnia Pod Lipami z wyłączonymi przyciskami Ogarnięte, posiłek i padok; A-19): tabela bez kolumny „Ostatnio ogarnięte” (Boks, Koń, Klient, Aktywne flagi, Akcje), alert o Belli zostaje; karta „Przyciski obsługi” ma tylko „Woda” (poidło ręczne) i linię „Ogarnięte, posiłek i padok są wyłączone w ustawieniach tej stajni.” z linkiem do PanelUstawieniaBezAkcji.
- [ ] PanelDodajHale: nazwa i adres hali (z kopiowaniem adresu innej hali), potem jedno z trzech: nowe boksy od–do (numeracja w tej hali, domyślnie od 1; numery mogą powtarzać się z innymi halami) z listą boksów i ustawieniami każdego (numer, poidło, „Więcej ustawień ›”, „Ustaw dla wszystkich”), przeniesienie istniejących boksów albo pusta hala.
- [ ] **Konto firmy i zakładanie stajni** (makiety; Damian, retrospekcja z pn 07.09.2026 i czw 01.10.2026):
  - PanelLogowanie z przełącznikiem „Telefon | E-mail” → PanelLogowanieKod → PanelWitaj (imię, język, „Załóż konto firmy”; bez „Czekasz na zaproszenie?”, bo zaproszenie dopasowuje się samo);
  - **PanelRejestracjaFirmy** (nowy, po PanelWitaj, tylko przy pierwszej rejestracji): nazwa firmy, NIP, siedziba i e-mail do faktur (NIP podaje się tylko tutaj), bez dopisków o NIP-ie; „Ten NIP ma już konto w EQUENOR” tylko jako błąd;
  - PanelZalozStajnie, krok 1 „Stajnia”: bez NIP, działalności, języków tabletów i pytania o potwierdzenia flag; hala i boksy z ustawieniami („Ustaw dla wszystkich”);
  - **PanelZalozPowiadomienia** (nowy), krok 2 „Powiadomienia”: zdarzenia, odbiorcy (Admin, Obsługa stajni), kanał SMS / e-mail; „Załóż stajnię” → PanelPulpitStart;
  - PanelPulpitStart → PanelZaprosOsobe: kanał SMS albo e-mail; role osób Klient, Obsługa, Instruktor i osobna grupa „Konto techniczne”: Wyświetlacz, Tablet przy boksie; bez Wsparcia IT;
  - druga stajnia (Brzozowa, 01.10) tą samą ścieżką od PanelZalozStajnie, bez rejestracji firmy i bez NIP;
  - w Ludziach konta techniczne („Telewizor korytarz · konto techniczne · Wyświetlacz”, „Tablety Pod Lipami · konto techniczne · Tablet”) to zwykłe wiersze w filtrze „Konta techniczne”, bez osobnej sekcji i instrukcji.
- [ ] PanelPlatnosci.
- [ ] **Ustawienia stajni** (PanelUstawieniaStajni dla Stajni Pod Lipami, PanelUstawieniaBrzozowa dla Stajni Brzozowej, PanelUstawieniaBezAkcji dla Stajni Pod Lipami z wyłączonymi przyciskami Ogarnięte, Posiłek i Padok, A-19; wszędzie Damian; erd.md pkt 16), tylko admin konta firmy:
  - zakładka „Ustawienia” w nawigacji panelu, w nagłówku przełącznik stajni („Stajnia Pod Lipami ▾”);
  - sekcja „Potwierdzenia flag”: przełącznik „Flagi wymagają potwierdzenia” (włączone: nowa flaga → pop-up na tablecie → „Potwierdzono flagę”, status u klienta, eskalacja do admina; wyłączone: flaga obowiązuje od razu i od razu stoi w banerze tabletu, bez pop-upu, statusu oczekiwania, sekcji „Wymaga potwierdzenia” i eskalacji); w interfejsie bez opisów trybów i dopisków;
  - sekcja „Usługi”: przełączniki derek (flaga „Derka”) i moczenia paszy („namoczyć” + ile), flag (Bez śniadania, Bez kolacji, Nie na padok, Wet, Leki) i szybkich przycisków (Ogarnięte, Posiłek, Padok z opisem „przycisk i plan padoku”, ten sam na wszystkich trzech ekranach ustawień); „Woda” bez przełącznika (ustawienie boksu); bez dopisków;
  - sekcja „Widoczność per rola”: macierz z checkboxami, funkcje Flagi, Plan karmienia, Szybkie akcje i ich stan, Historia boksu, Zadania, Zdrowie i wizyty, Jazdy × role Klient, Obsługa, Instruktor, Wyświetlacz (bez kolumny Wsparcia IT i wiersza diagnostyki); „Admin widzi wszystko”; w Stajni Brzozowej pusta kolumna Wyświetlacz; w PanelUstawieniaBezAkcji wiersz „Szybkie akcje i ich stan” z checkboxami jak w Pod Lipami;
  - przycisk „Zapisz”; zapis z `If-Match` do `stable` (ustawienia i widoczność) i `flags` (aktywne szablony), obsługa 412;
  - przełączniki i checkboxy jako `role="switch"` i `role="checkbox"` z etykietami, obsługiwane klawiaturą (propozycja).
- [ ] Przy kilku halach każdy boks w tabelach, filtrach, alertach i formularzach przypisania ma halę razem z numerem; wybór boksu w formularzach wysyła `boxId`.
- [ ] Plansze pierwszej fali (logowanie, PanelWitaj, Pulpit, zaproszenia, Ludzie) opisuje docs/makiety-plan.md. Ekrany bez makiet: Konie, Ludzie poza tym, co pokazują makiety (role Klient, Obsługa, Admin, Instruktor i konta techniczne Wyświetlacz i Tablet; przypisanie osoby do kolejnej stajni), pozostałe ustawienia stajni poza ekranem „Ustawienia stajni” (progi eskalacji, słowniki, sloty, domyślne godziny szablonów flag, okno APK).
- [ ] Edycje z `If-Match` i obsługą 412.
- [ ] Kolory i znak słowny „EQUENOR” z `packages/theme` (tokeny LCD z `docs/paleta.md`, zmienne CSS); flaga krytyczna jako pigułka z pełnym ciemnym polem (`crit-solid` z tekstem `on-crit`).

#### 3.5.4 Wyświetlacz (widok panelu dla roli `display`) i `tools/display-kiosk`
- [ ] Telewizor otwiera zwykłą stronę logowania panelu; strona nie rozpoznaje urządzenia. Logowanie kontem technicznym z rolą Wyświetlacz (`display`), tak jak wszędzie: WyswietlaczLogowanie i WyswietlaczKod to PanelLogowanie i PanelLogowanieKod (kod z SMS-a albo e-maila). Po zalogowaniu panel pokazuje widok tablicy, bo tak każe rola (routing po roli). W seedzie „Telewizor korytarz” loguje się e-mailem; ekran pokazuje adres tylko zamaskowany (t•••@stajnielipowe.pl). Bez nazw kont typu `wyswietlacz-korytarz` i adresu technicznego do kodu. Zablokowane konto pokazuje „wyświetlacz zablokowany”.
- [ ] WyswietlaczCentralny:
  - nagłówek z „Teraz”, następnym posiłkiem i zegarem;
  - pasek pilnych flag wszystkich hal;
  - sekcje hal z przyciskiem „Pełny ekran”, w nagłówku hali rutyna („Śniadanie podane 06:40 · padok 10:00”);
  - kafle boksów bez posiłków per koń: flagi z godzinami, „Ogarnięte HH:MM”, padok z godzinami; przy poidle ręcznym „Poidło ręczne · woda HH:MM”, przy automatycznym bez znacznika wody;
  - „Dziś w stajni”, ostatnie akcje z przycisków obsługi, zadania jednorazowe;
  - tylko sekcje widoczne dla roli `display` w ustawieniach stajni (Stajnia Pod Lipami: flagi, plan karmienia, szybkie akcje i ich stan, zadania) i bez opcji wyłączonych w stajni; stan „niepotwierdzona” i pasek pilnych z niepotwierdzonymi tylko dla flag z `requires_ack` (w praktyce: stajnia z potwierdzeniami) [erd]. Stajnia Brzozowa wyświetlacza nie ma.
- [ ] WyswietlaczHala (pełny ekran jednej hali):
  - większe kafle i większa typografia;
  - **tylko flagi tej hali**, także w pasku pilnych;
  - skrót pozostałych hal tylko liczbowy;
  - przełącznik hal (bez wracania do widoku wszystkich) i przycisk „Wszystkie hale”.
- [ ] WyswietlaczHalaBezAkcji (pełny ekran Hali nowej w Stajni Pod Lipami z wyłączonymi przyciskami obsługi; A-19):
  - kafle bez „Ogarnięte …” i bez padoku (także „w boksie” i „padok odwołany”); Bella „Nie na padok · dziś, cały dzień · NIEPOTWIERDZONA”, Bursztyn „Poidło ręczne · woda 06:55”;
  - nagłówek hali bez „✓ Śniadanie 06:50” i „Padok 10:00”, licznik „1 niepotwierdzona” zostaje; pasek niepotwierdzonej flagi bez „padok o 10:00”, z „admin powiadomiony”;
  - „Teraz: po śniadaniu · Następny posiłek: obiad 12:00” zostaje; „Dziś w stajni” tylko 06:30 Śniadanie, 12:00 Obiad i 18:00 Kolacja (po 5 koni, bez „podane”), bez wiersza „Padoki”;
  - ostatnie akcje: 06:55 Woda · boks 5 i 01:20 nowa flaga „Nie na padok” · boks 4.
- [ ] Przy jednej hali bez sekcji, bez „Pełny ekran” i bez przełącznika; przy kilku halach kafel zawsze pokazuje halę razem z numerem boksu.
- [ ] Wybór widoku (wszystkie hale albo `buildingId` jednej hali) pamięta lokalnie przeglądarka telewizora w `localStorage`, obsłużonym w try/catch, bez tabeli i bez wiedzy serwera. Ustawia się go raz, myszką przy instalacji albo pilotem przez HDMI-CEC. Bez zapisanego wyboru, przy niedostępnej pamięci albo gdy zapisana hala zniknęła lub jest wyłączona, strona pokazuje wszystkie hale.
- [ ] Kolory z `packages/theme` (tokeny LCD z `docs/paleta.md`): na TV bez pól w akcencie; kafel krytyczny jako pełne pole `crit-solid` z ramką 3 px `crit-line`, niepotwierdzony (tylko flaga z `requires_ack`) z ramką 3 px `warn-line` na `warn-tint-weak`, wolny z przerywaną ramką 2 px `line-strong` na `bg`; liczby i zegar z `tabular-nums`.
- [ ] Odpytywanie co 10 s z ETag. Przy błędzie zostaje ostatni stan z paskiem „Brak połączenia od HH:MM” i znacznikiem „ostatnia aktualizacja HH:MM:SS”. Po dłuższej awarii `location.reload()`.
- [ ] Przy wielu boksach kafle skrócone, a gdy dalej się nie mieszczą, strony przełączane co 20 s.
- [ ] Zegar liczony z przesunięcia względem nagłówka `Date` serwera. Fonty serwowane przez panel, bez zewnętrznego CDN (makiety ładują Figtree z Google Fonts).
- [ ] Opcjonalnie co kilka minut przesunięcie całego układu o 1–2 px przeciw retencji obrazu.
- [ ] `tools/display-kiosk` dla Raspberry Pi 5 4 GB z TV albo monitorem przez HDMI (obraz Raspberry Pi OS Trixie 64-bit, nie FullPageOS):
  1. Raspberry Pi Imager: host, użytkownik, klucz SSH, Wi-Fi, strefa Europe/Warsaw.
  2. Autologowanie do pulpitu.
  3. Chromium jako usługa `systemd --user` z `Restart=always`. Samo wpisanie do autostartu labwc nie restartuje przeglądarki po awarii.
  4. Flagi: `--kiosk --noerrdialogs --disable-infobars --no-first-run --password-store=basic --user-data-dir=<stały katalog>`. Bez `--incognito` i `--temp-profile`.
  5. Okno „Przywrócić strony?”: przed startem (`ExecStartPre`) poprawić `exit_type` i `exited_cleanly` w pliku Preferences. Przełącznik `--hide-crash-restore-bubble` sprawdzić w W-12.
  6. Wygaszanie ekranu całkowicie wyłączone (bez `swayidle` w autostarcie). Ukryty kursor.
  7. `HandlePowerKey=ignore` i brak skrótu wyłączania w labwc [niepotwierdzone].
  8. `RuntimeWatchdogSec` ≤ 15 s; limit sprawdzić przez `wdctl`; bez pakietu `watchdog`.
  9. Codzienny restart Chromium timerem, w porze ustalonej z obsługą.
  10. CEC (`v4l-utils`): `cec-ctl --playback`, `--image-view-on`, ustawienie Pi jako aktywnego źródła.
  11. Wymuszony tryb wyjścia `video=HDMI-A-1:1920x1080@60D` [niepotwierdzone].
  12. NTP i RTC.
  13. SSH tylko z kluczami.
  14. Aktualizacje najpierw na kanarku. W stajni `apt-mark hold chromium`, dopóki kanarek nie przejdzie testów.
  15. Nazwę pakietu (`chromium` czy `chromium-browser`) skrypt wykrywa sam.
  16. Overlay FS wyłączony.

#### 3.5.5 Strona www (przed logowaniem)
- [ ] Publiczna strona produktu: sama prezentacja, bez bloga i CMS (sekcja 5, „Rozstrzygnięte”). Makiety: StronaGlowna (1440), StronaGlownaTelefon (390).
- [ ] Treść: hero (nazwa, hasło, jedno zdanie, CTA), cztery ekrany (apka, tablet, telewizor, panel) z obrazem i jednym zdaniem, przykład flag z godzinami, kontakt i CTA, stopka; link „Zaloguj się” do panelu. Bez drobnych zalet, ogólników i treści instruktażowych. Bez danych stajni, bez logowania i bez API aplikacji.
- [ ] Kolory i znak „EQUENOR” (z hasłem pod spodem w nagłówku i stopce) z `docs/paleta.md` (tokeny LCD, przez `packages/theme`, propozycja); układ od 390 do 1440 px.
- [ ] Statyczna strona (sekcja 5 pkt 51). Propozycja: statyczny generator w monorepo (`apps/www`), build w CI, hosting statyczny na domenie głównej (2.10). Hosting wybiera Dawid.
- [ ] Na stronie mogą żyć polityka prywatności, strona wsparcia i strona usuwania konta, których wymagają Apple i Google (2.7, 2.8) (propozycja).
- [ ] Testy: Playwright w 1440 i 390, linki do panelu, brak zewnętrznych skryptów śledzących bez zgody (propozycja).

### 3.6 Kolejność prac
- [ ] **Etap 0, od pierwszego dnia, trzy tory równolegle:**
  - **A, fundament:** 3.1 i 3.2; najpierw stub tokenów i seed.
  - **B, bramka sprzętowa tabletu:** punkty (B) z 4.3.1 (T-01…T-04, T-08, T-13, T-24, T-25) oraz testy koloru K-01 i K-05 na Boox Note Air6 C, na sztucznych odpowiedziach `board`, z paletą `t-*` w profilu właściwym dla ekranu. Kończy się decyzją: model zostaje albo bierzemy plan B. Planem B jest Samsung Galaxy Tab Active5, dokupiony dopiero wtedy, gdy T-01 albo T-02 nie przejdą na Boox; ten sam moduł DO przechodzi na nim T-01…T-03, co oddziela błąd naszego kodu od ograniczeń firmware e-ink. Innym wyjściem jest kolejny model e-ink z działającym DO, kolorowy albo czarno-biały.
  - **C, spike Cognito:** lista z 3.2.
- [ ] **Etap 1, logowanie i konto firmy:** `identity`, `access` (role osób z `client`, konta techniczne `display` i `tablet`, admin konta firmy, przypisania per stajnia, zaproszenia SMS-em albo e-mailem), `auth` i `authz`, logowanie telefonem albo e-mailem w apce i w panelu, rejestracja konta firmy z NIP (`POST /businesses`).
  - Gotowe, gdy działa logowanie na puli dev oboma kanałami, rejestracja konta firmy z NIP przechodzi A-22, zaakceptowanie zaproszenia tworzy członkostwo (dla klienta także dostęp do konia), a macierz izolacji dla tych tras jest zielona, także między dwoma kontami firm.
- [ ] **Etap 2, stajnia, hale, boksy, konie:** `stable` (konto firmy → stajnie → hale → boksy), „Załóż stajnię” w 2 krokach z regułami powiadomień (`notification_rules`) i boksami z ustawieniami, ustawienia stajni i widoczność per rola (`stable_settings`, `stable_role_features`, `GET …/features`), panel (PanelRejestracjaFirmy, PanelZalozStajnie, PanelZalozPowiadomienia, Boksy i konie, Dodaj halę, Ustawienia stajni), apka admina, przełącznik stajni w apce.
  - Gotowe, gdy seed z dwiema halami (boksy 1–8 i 1–6) jest widoczny w panelu i w apce z halą przy numerze, dodanie hali z adresem i boksami od 1 działa, a przypisanie, przeniesienie i zamiana koni przechodzą testy współbieżności; obie stajnie z seedu mają swoje ustawienia, a ekran „Ustawienia stajni” zmienia je tylko admin konta firmy; druga stajnia bez NIP i przypisania per stajnia przechodzą A-23.
- [ ] **Etap 3, flagi:** `flags` z obowiązkowymi godzinami, skutkami z okna (`packages/rules`) i Derką, `requires_ack` kopiowanym z ustawień stajni, szablonami włączanymi w „Ustawieniach stajni”, `notifications` z `fake-sms`, `escalation-scheduler` (tylko flagi z `requires_ack`), ekrany klienta (kafelki flag) i obsługi.
  - Gotowe, gdy scenariusze A-01, A-02, A-12, A-18 i A-20 odtwarzają się od zera, a test wyścigu potwierdzenia z eskalacją jest zielony.
- [ ] **Etap 4, tablica i tablet:** `board` z ETag i konfiguracją stajni, kiosk, pop-up (dla flag z `requires_ack`), „Zmień boks”, blokada ekranu, kolejka zapisów, `releases`.
  - Gotowe, gdy flaga z telefonu pojawia się jako pop-up w ustalonym czasie (flaga bez potwierdzeń od razu w banerze), potwierdzenie i odwołanie usuwają pop-up, „Zmień boks” przełącza między halami i wraca do poprzedniego boksu po 30 s, zablokowany ekran nie reaguje na dotyk (T-30, A-15), tablet loguje się kontem technicznym tabletów, a język tablicy jest ustawieniem tabletu (A-25), a APK aktualizuje się bez dotykania tabletu.
- [ ] **Etap 5, wyświetlacz:** widok `board` dla wyświetlacza, widok wyświetlacza w panelu po zalogowaniu kontem `display` (pełny ekran hali i przełącznik hal), obraz Pi.
  - Gotowe, gdy telewizor loguje się w zwykłym panelu kontem technicznym z rolą Wyświetlacz, e-mailem i kodem, po czym od razu widzi tablicę (A-24), działa 72 h bez przerwy, wybór hali przetrwa restart, pełny ekran pokazuje tylko flagi tej hali, a w odpowiedziach nie ma danych osobowych.
- [ ] **Etap 6, karmienie, padok i rutyna obsługi:** `care`; szybkie akcje („Ogarnięte” per boks i kilka naraz, „Woda” przy poidle ręcznym, posiłek i padok dla hali z pominiętymi, z apki i z „SZYBKICH AKCJI” tabletu, „Cofnij”); przełącznik poidła w `stable`; wstrzymany posiłek i skrócony albo odwołany padok na tablicy z okna flag; „NAMOCZYĆ” w tabeli karmienia; ListaDnia i MojBoks; konsumenci `horse.left` i `horse-left-reconciler`.
  - Gotowe, gdy przechodzą A-13, A-16, A-17 i A-19 (przyciski i moczenie według ustawień stajni).
- [ ] **Etap 7, zdrowie, jazdy, zadania:** `health` z `files`, `rides`, `tasks` (zadania jednorazowe, „Biorę”, „Zrobione”, StajennyZadania); crony `health-due-reminders` i `files-gc`.
  - Gotowe, gdy przechodzą A-14 i A-21 (widoczność per rola obejmuje też zdrowie, jazdy i zadania).
- [ ] **Etap 8, płatności (bez rozbudowy na PoC):** `billing` na fałszywych adapterach, trzy crony billingu, przejście `subscription.status_changed` → `stables.status`, stan „zawieszona” na tablecie i wyświetlaczu.
- [ ] **Etap 9, przed stajnią pilotażową:**
  - `audit` i `retention-pruner`;
  - pełna macierz izolacji;
  - test obciążenia;
  - alerty;
  - przegląd bezpieczeństwa;
  - runbooki (4.5);
  - wyjście z sandboxów SMS i SES (kody logowania e-mailem).
- **Prace równoległe:**
  - `packages/theme` od etapu 0, zanim powstaną pierwsze ekrany;
  - po etapie 1 interfejsy apek, tabletu i wyświetlacza na fixture'ach z kontraktów;
  - `care` zaraz po etapie 2;
  - `health`, `rides` i `tasks` niezależnie od siebie;
  - adaptery `billing` w dowolnym momencie;
  - statyczna strona www (3.5.5, sekcja 5 pkt 51) niezależnie od reszty.

## 4. Testy

### 4.1 Testy automatyczne (CI przy każdym PR oraz przebieg nocny)
- [ ] **Jednostkowe (Vitest, fast-check).**
  - Reguły flag: obowiązkowe okno `valid_from`–`valid_to` i podpowiedź z `default_window`, `days_mask`, `suspend_meal` tylko dla posiłku w oknie, `cancel_paddock` skracający albo odwołujący padok tylko w oknie (Kasztan: padok B 10:00–14:30), lista pominiętych przy akcjach zbiorczych hali, etykiety „06:00–10:00”, „od 14:30”, „16:00–08:00” i „dziś, cały dzień”, wariant Derki, `replaces_flag_id`, `warn_at` i `notify_at` od początku okna.
  - Noce 25.10.2026 i 28.03.2027.
  - Składanie odpowiedzi `board`: ta sama treść daje ten sam ETag; w treści nie ma czasu serwera; listy mają deterministyczną kolejność (hale według `sort_order`, boksy w obrębie hali); przy `auto_waterer = true` odpowiedź nie ma żadnego pola wody; odpowiedź dla tabletu nie ma zadań ani sekcji „PADOK / DZIŚ”, a „OSTATNIE AKCJE” mają najwyżej 5 wpisów (bez pełnej historii); posiłek w „SZYBKIE AKCJE” ma etykietę pory z `meal_slots` (o 07:15 „Śniadanie · podane 06:40”, także dla pory spoza trzech podstawowych, np. „Siano”).
  - Koń i boks: przeniesienie, zamiana, wyjazd; przeniesienie boksu do innej hali (zmiana `building_id`), po którym koń, historia i zdarzenia zostają przy boksie [erd].
  - Hale i numery boksów:
    - boks rozpoznajemy tylko po `id`; żadna funkcja nie szuka boksu po numerze (`boxes.label`), bo numer powtarza się między halami [erd];
    - etykieta boksu: przy kilku halach zawsze hala razem z numerem („Hala nowa · boks 4”), przy jednej hali sam numer.
  - Status flagi: tylko „potwierdzona HH:MM” albo „niepotwierdzona”, w PL, UA i EN; test słownika tłumaczeń odrzuca każdą inną nazwę statusu (propozycja). Flaga z `requires_ack = false` nie ma statusu ani terminów potwierdzenia, tylko „obowiązuje od razu”.
  - Konfiguracja stajni (`stableFeatures`): dla ustawień obu stajni z seedu i każdej roli zwraca właściwe kafelki (Stajnia Brzozowa bez Derki), „namoczyć” tylko przy `soak_enabled`, przyciski (Brzozowa: „Ogarnięte” i posiłek, bez padoku), tryb potwierdzeń i widoczne funkcje zgodnie z macierzą; `admin` zawsze wszystko; widoczność nigdy nie dodaje uprawnień (testy właściwości, propozycja).
  - Składanie `board` z ustawieniami: przy wyłączonej opcji w odpowiedzi nie ma ani przycisku, ani jego stanu (np. bez planu padoku, czyli godzin i towarzyszy, i stanu „Wyprowadzono na padok” przy `paddock_out_enabled = false`, bez „NAMOCZYĆ” przy `soak_enabled = false`); przy wszystkich trzech przyciskach wyłączonych bez „SZYBKIE AKCJE”, a plan karmienia, flaga „Nie na padok” i „Woda” przy poidle ręcznym zostają; flaga bez `requires_ack` stoi w banerze bez znacznika pop-upu; zmiana ustawień zmienia ETag.
  - Widoczność: `display` bez danych osobowych; na tablet nie trafiają opisy wizyt; tablica tabletu nie pokazuje, kto jest zalogowany.
  - Billing: kwoty w groszach.
  - Normalizacja telefonu do E.164 i e-maila (wielkość liter, spacje; propozycja).
  - NIP: kreski i spacje usuwane, 10 cyfr, suma kontrolna (propozycja).
  - Komplet tłumaczeń PL, UA i EN.
  - Paleta (`packages/theme`): wartości zgodne z `docs/paleta.md`, kontrasty WCAG oraz drabina jasności tokenów `t-*` w profilu Kaleido 3 i Gallery 3 (testy z 3.1.12).
- [ ] **Integracyjne (Testcontainers: PostgreSQL i LocalStack; Cognito zastępuje stub, prawdziwa pula w przebiegu nocnym).**
  - Wielokolumnowe klucze obce: konia stajni A nie da się wstawić do boksu stajni B.
  - Unikalności przy równoległych zapisach.
  - Numer boksu bez unikalności [erd]:
    - dwa boksy o tym samym `label` w różnych halach, a także w tej samej hali, zapisują się bez błędu;
    - introspekcja schematu potwierdza, że na `boxes.label` nie ma indeksu unikalnego.
  - Dwie hale z tymi samymi numerami (seed z 3.2: boks 4 jest w obu halach, Sonata w Hali głównej, Bella w Hali nowej):
    - potwierdzenie flagi Belli z `X-Box-Id` boksu 4 Hali nowej zapisuje w `flag_acknowledgements.box_id` id tego boksu, nie boksu 4 Hali głównej;
    - „Ogarnięte” z `X-Box-Id` boksu 4 Hali głównej trafia do id tego boksu (Sonata), a nie do boksu Belli;
    - `board` dla każdego `id` zwraca właściwego konia i właściwe flagi; „OSTATNIE AKCJE” na tabletach i historia obu boksów w apce są rozdzielne.
  - Rutyna obsługi (serwis `care`):
    - „Podano śniadanie” dla Hali głównej zapisuje jeden wiersz `building_routines` i zwraca pominiętego Kasztana (flaga 06:00–10:00 obejmuje 06:30); dla Hali nowej bez pominięć;
    - drugi zapis tego samego posiłku tej hali tego dnia, także równoległy z drugiej repliki, nie tworzy drugiego wiersza; po „Cofnij” (`cancelled_at`) da się zapisać ponownie;
    - „Wyprowadzono na padok” dla Hali nowej pomija Bellę (flaga cały dzień), a Kasztan w Hali głównej jest na padoku do 14:30;
    - „Ogarnięte” dla kilku zaznaczonych boksów to jeden zapis z wierszem na boks; kolejne „Ogarnięte” tego samego dnia zmienia „ostatnio” na nowszą godzinę; „Cofnij” w ciągu godziny ustawia `cancelled_at`, a po godzinie daje 409 (propozycja);
    - z tabletu `user_id = NULL` i `source = tablet`, z apki osoba;
    - akcja całej hali z tabletu (`X-Box-Id` boksu 7 Hali głównej) zapisuje wiersz dla Hali głównej bez autora; ten sam posiłek zapisany potem z apki albo z tabletu innego boksu tej hali daje `already_done` i nie tworzy drugiego wiersza; akcja dla innej hali niż hala boksu daje 403 i nie tworzy wiersza (propozycja);
    - „Woda” dla Hala nowa · boks 5 (`auto_waterer = false`) zapisuje wiersz `kind = water`, a znacznik pokazuje najnowszy niecofnięty wpis; „Woda” dla boksu z poidłem automatycznym daje 409 (propozycja) i nie tworzy wiersza.
  - Przełącznik poidła (serwis `stable`, odczyt przez `board`): admin zmienia `boxes.auto_waterer` z `If-Match` i audytem; obsługa, klient i konta techniczne dostają 403; po ustawieniu `true` znacznik i akcja „Woda” znikają z odpowiedzi tabletu, apki, panelu i wyświetlacza przy najbliższym odpytaniu, a po ustawieniu `false` wracają; wpisy `box_care_events` zostają; nowe boksy (także z „Dodaj halę”) mają `true`.
  - Ustawienia stajni (serwisy `stable`, `flags`, `care`, odczyt przez `board`):
    - flaga zapisana w Stajni Brzozowej ma `requires_ack = false`, puste `ack_deadline_at`, `warn_at` i `notify_at`; `escalation-scheduler` jej nie bierze, a potwierdzenie daje `409 ack_not_required` (propozycja);
    - zmiana `flags_require_ack` w Stajni Pod Lipami po zapisie flagi Belli nie zmienia jej `requires_ack`: dalej jest niepotwierdzona i eskaluje; nowa flaga zapisana po wyłączeniu obowiązuje od razu; po ponownym włączeniu flagi zapisane bez potwierdzeń nie dostają statusu;
    - wyłączenie Derki (`flag_templates.active = false` dla `derka`) usuwa kafelek z `GET …/features` klienta i obsługi przy najbliższym odpytaniu, a zapis flagi z tego szablonu daje `409 option_disabled` (propozycja); trwająca Derka Sonaty: sekcja 5;
    - przy `paddock_out_enabled = false` „Wyprowadzono na padok”, przy `tidy_enabled = false` „Ogarnięte”, a przy `meal_served_enabled = false` „Podano śniadanie” dają `409 option_disabled` z apki i z tabletu (propozycja); przy `soak_enabled = false` pozycja planu z `soak = true` daje 409, a istniejące „namoczyć” znika z odczytów, ale zostaje w bazie;
    - macierz widoczności: dla każdej roli i funkcji w obu stajniach trasa odczytu i sekcja odpowiedzi złożonej są albo dostępne, albo pominięte (403 dla trasy, propozycja); zmiana macierzy działa przy najbliższym żądaniu;
    - ustawienia, macierz i szablony zmienia tylko admin konta firmy, z `If-Match` i audytem; zmiana w Stajni Pod Lipami nie zmienia Stajni Brzozowej.
  - Konto firmy i dostęp do stajni (serwisy `stable`, `access`, `notifications`):
    - rejestracja konta firmy z NIP tworzy konto i admina w jednej transakcji; drugi raz ten sam NIP (także z kreskami albo bez) daje `409 tax_id_taken` (propozycja) i niczego nie zapisuje;
    - druga stajnia bez NIP: `POST /stables` nie przyjmuje NIP ani działalności, stajnia trafia do konta firmy admina, a admin ma do niej dostęp bez przypisania;
    - zakładanie stajni w 2 krokach: stajnia, ustawienia (wszystko włączone, z potwierdzeniami), hala, boksy z ustawieniami (poidło per boks, „Ustaw dla wszystkich”) i reguły powiadomień (`notification_rules`) zapisują się razem; błąd wstrzyknięty w środku nie zostawia stajni bez reguł ani boksów;
    - eskalacja `admin_notify` trafia do odbiorców i kanałem z reguł stajni (propozycja);
    - Damian (admin konta) ma dostęp do obu stajni; Piotr dostaje 404 w Brzozowej, Paweł w Pod Lipami; przypisanie Oli do drugiej stajni działa przy najbliższym żądaniu, a po odebraniu daje 404;
    - drugie konto firmy (fixture z innym NIP, propozycja): każdy obiekt Stajni Pod Lipami i Brzozowej daje jego adminowi 404, a Damianowi obiekt tamtej firmy też 404.
  - Zadania (serwis `tasks`): dwa równoległe „Biorę” na to samo zadanie dają jedno wzięcie i jedno 409; „Zrobione” bez wzięcia albo przez inną osobę niż biorąca, poza adminem, jest odrzucane (propozycja); nie-admin nie doda zadania (403).
  - Dostęp klienta: Anna widzi boks 7 Hali głównej (Kasztan) i jego historię od dnia, w którym Kasztan do niego trafił; po przeniesieniu Kasztana widzi nowy boks od dnia przeniesienia, a starego już nie (dostęp do boksu wynika wyłącznie z konia).
  - Dodanie hali (serwis `stable`):
    - hala i jej boksy zapisują się w jednej transakcji razem z audytem; błąd wstrzyknięty w środku nie zostawia hali bez boksów ani boksów bez hali;
    - nowe boksy numerowane od 1 powtarzają numery innych hal bez błędu;
    - przeniesienie boksu z koniem do nowej hali zmienia tylko `building_id`;
    - usunięcie hali z boksami jest odrzucane, pustej przechodzi; wyłączenie hali (`active = false`).
  - Audyt: zapis w tej samej transakcji, brak wpisu po rollbacku, granty w `audit`.
  - Po rollbacku żadne zdarzenie nie wychodzi.
  - Awaria „po commicie, przed publikacją” (wstrzykiwana w buildzie testowym): skutki naprawia cron, np. `horse-left-reconciler`.
  - S3: ważność presigned URL, prefiks `stable_id/`, przejście `pending` → `attached`, `files-gc`.
- [ ] **Kontraktowe.**
  - Migawki OpenAPI (3.1.5).
  - Boks w API występuje tylko jako `boxId` (w ścieżce, w treści albo w nagłówku `X-Box-Id`); żaden kontrakt nie wybiera boksu po numerze (propozycja).
  - `horse_flags.requires_ack` nie występuje w żądaniu utworzenia flagi (ustawia go serwer); odpowiedzi flag niosą `requiresAck`, a pole statusu jest puste dla flag bez potwierdzeń (propozycja).
  - Schematy zdarzeń: producent waliduje, konsument ma fixture'y wersji N-1 i N (własne testy albo Pact message pacts).
  - **Kontrakt bazy:** CI z importów `packages/db` wylicza, kto czyta które kolumny, i blokuje migrację, która usuwa albo zmienia kolumnę używaną przez bieżącą lub poprzednią wersję dowolnego serwisu.
- [ ] **Idempotencja i DLQ.**
  - Ta sama wiadomość 2 i 10 razy, także równolegle do dwóch replik, daje jeden skutek.
  - Zamieniona kolejność zdarzeń daje poprawny stan końcowy.
  - Obsługa dłuższa niż visibility timeout nadal daje jeden skutek.
  - SIGTERM w trakcie obsługi nie zostawia częściowego zapisu.
  - Wiadomość trująca trafia do DLQ i wywołuje alert; redrive po poprawce działa.
- [ ] **Crony:** powtórzony przebieg, równoległy, nadrabianie po godzinnej przerwie bez dubli (jeden wiersz `flag_escalations` na flagę i poziom) i bez eskalacji flag już potwierdzonych lub odwołanych ani flag bez `requires_ack`, `spec.timeZone`, pomiar opóźnienia eskalacji (odstęp harmonogramu plus start poda).
- [ ] **Repliki (przebieg nocny w klastrze testowym).**
  - Żaden serwis nie trzyma stanu w pamięci.
  - ETag z różnych replik jest identyczny.
  - Rolling update pod obciążeniem przy wersjach N i N-1 działających naraz.
  - Zabita replika w trakcie zapisu: klient ponawia z tym samym id i powstaje jeden zapis.
- [ ] **Migracje:**
  - wszystkie migracje od zera, a introspekcja zgodna ze schematem w repo;
  - migracja na danych syntetycznych w skali;
  - serwisy w wersji N-1 przechodzą testy na schemacie N;
  - próba dodania `NOT NULL` jednym krokiem jest wyłapywana;
  - dwa równoległe `migrate`: migruje dokładnie jeden.
  - Bramka zakazanych obiektów: 3.1.3.
- [ ] **Wydajność (k6 z `If-None-Match`).**
  - Model obciążenia: S stajni, H hal i B boksów na stajnię, tablet przy każdym boksie odpytujący co P s, D wyświetlaczy odpytujących co 10 s (część w widoku wszystkich hal, część na pełnym ekranie jednej hali), do tego telefony. Parametry: sekcja 5.
  - Scenariusze:
    - stan ustalony (prawie same 304);
    - pora posiłku;
    - powrót wszystkich tabletów w tej samej sekundzie razem z odświeżeniem tokenów;
    - rolling deploy;
    - 24 h bez przerwy.
  - Mierzymy:
    - p50, p95 i p99 `board` osobno dla 200 i 304;
    - liczbę zapytań SQL na jedno odpytanie;
    - CPU bazy i sumę pul połączeń wobec limitu;
    - udział 304 (wyraźnie poniżej 100% oznacza niedeterministyczny ETag);
    - stabilność pamięci replik.

  Progi ustalamy po pierwszym pomiarze bazowym, a przebieg nocny pilnuje regresji.
- [ ] **Apka mobilna (Maestro, Detox na symulatorze iOS).**
  - Ścieżki klienta (kafelek flagi z podpowiedzianymi godzinami w najwyżej trzech stuknięciach do zapisu, propozycja), obsługi (szybkie akcje, siatka „Ogarnięte”, „Woda” przy poidle ręcznym, „Cofnij”, zadania) i admina z makiet (przełącznik „Automatyczne poidło” w BoksSzczegoly).
  - Flaga wysłana przy zrywanym połączeniu nie tworzy duplikatu, a apka pokazuje stan „nie wysłano”.
  - Języki, duża czcionka systemowa, mały i duży ekran.
  - Przy kilku halach lista boksów w grupach hal z filtrem, a każdy boks z halą przy numerze; wybór boksu wysyła `boxId`. Status flagi tylko „potwierdzona HH:MM” albo „niepotwierdzona”, i tylko dla flag z `requires_ack` (w praktyce: stajnia z potwierdzeniami).
  - Logowanie telefonem i e-mailem: przełącznik „Telefon | E-mail”, kod z SMS-a i kod z e-maila (skrzynka testowa), ten sam użytkownik oboma kanałami.
  - Przełącznik stajni (A-17): Anna i Ola przechodzą między Stajnią Pod Lipami a Stajnią Brzozową; Damian (admin konta) też, a Paweł i Piotr nie mają przełącznika; kafelki, status flag, plan karmienia, szybkie akcje, „Wymaga potwierdzenia” i zakładka „Zadania” zmieniają się według ustawień i widoczności wybranej stajni; zapis z kolejki trafia do stajni, w której powstał.
  - Na fizycznych iPhone'ach skrypt ręczny przez TestFlight (wsparcie Maestro dla fizycznych iPhone'ów: [niepotwierdzone]).
- [ ] **Panel web (Playwright: Chromium, Firefox, WebKit).**
  - Boksy i konie (kolumny Klient, Aktywne flagi z godzinami, Ostatnio ogarnięte; znacznik „Poidło ręczne · woda HH:MM” tylko przy Hala nowa · boks 5; przełącznik poidła w szczegółach boksu tylko dla admina). Przy kilku halach każdy boks w tabelach, filtrach, alertach i formularzach przypisania ma halę przy numerze; wyszukanie „4” zwraca dwa boksy z nazwami hal; formularze wysyłają `boxId`.
  - Dodawanie hali (Boksy i konie → „Dodaj halę”):
    - nazwa i adres, także skopiowany z innej hali; adres widać potem przy hali i w szczegółach boksu;
    - wariant „nowe boksy”: zakres od 1 (np. 1–4) zapisuje się bez błędu, choć numery powtarzają się z innymi halami;
    - wariant „przeniesienie”: wolny boks i boks z koniem przechodzą do nowej hali z historią;
    - wariant „pusta hala”;
    - usunięcia hali z boksami interfejs nie proponuje, a API je odrzuca; wyłączenie hali działa;
    - po dodaniu drugiej hali stajnia z jedną halą zaczyna pokazywać halę przy numerze w panelu.
  - Konto firmy i zakładanie stajni: logowanie e-mailem, PanelRejestracjaFirmy (NIP zajęty: komunikat „Ten NIP ma już konto w EQUENOR”), PanelZalozStajnie bez NIP, języków i potwierdzeń, boksy 1–6 z „Ustaw dla wszystkich” i jednym boksem z poidłem ręcznym, PanelZalozPowiadomienia, „Załóż stajnię” → PanelPulpitStart; druga stajnia bez rejestracji firmy; PanelWitaj bez „Czekasz na zaproszenie?”; zaproszenie z kanałem SMS albo e-mail, z rolą osoby (Klient, Obsługa, Instruktor) albo kontem technicznym (Wyświetlacz, Tablet przy boksie), bez Wsparcia IT na liście; w Ludziach konta techniczne w filtrze „Konta techniczne”.
  - Ustawienia stajni (PanelUstawieniaStajni, PanelUstawieniaBrzozowa): stan przełączników i macierzy obu stajni z seedu; „Zapisz” z `If-Match`, konflikt 412 pokazuje komunikat; wyłączenie Derki i włączenie z powrotem; zakładki nie widzi nikt poza adminem; przełącznik stajni w nagłówku przechodzi między stajniami.
  - Płatności na fałszywym adapterze: podwójny webhook daje jedną płatność, brak płatności daje `suspended`.
  - widok wyświetlacza w panelu (konto `display`):
    - sztuczny zegar i odpytywanie co 10 s;
    - `context.setOffline`;
    - widok wszystkich hal: sekcje hal z przyciskiem „Pełny ekran”, pasek pilnych flag wszystkich hal, kafel z halą przy numerze;
    - pełny ekran hali: tylko flagi tej hali, także w pasku pilnych; skrót pozostałych hal tylko liczbowy; przełącznik hal przechodzi na inną halę bez wracania do widoku wszystkich; „Wszystkie hale” wraca do widoku ogólnego;
    - wybór widoku zapamiętany w `localStorage`: przetrwa przeładowanie i nowy kontekst przeglądarki z tym samym profilem; bez zapisanego wyboru, przy wyjątku z `localStorage` albo gdy zapisana hala zniknęła lub jest wyłączona, strona pokazuje wszystkie hale;
    - logowanie kontem z rolą Wyświetlacz na zwykłej stronie logowania panelu: „Telefon | E-mail”, kod z e-maila, adres tylko zamaskowany, potem od razu widok tablicy; konto innej roli na tej samej stronie dostaje swój zwykły start;
    - jedna hala (Stajnia Brzozowa; w seedzie nie ma wyświetlacza, więc test zaprasza konto z rolą Wyświetlacz i zaznacza jego widoczność w fixture'ach, nie w seedzie): bez sekcji, bez „Pełny ekran” i bez przełącznika;
    - sekcje według widoczności roli `display` (w Stajni Pod Lipami bez zdrowia i historii boksu); stan „niepotwierdzona” tylko dla flag z `requires_ack`: flaga bez potwierdzeń go nie ma, a trwająca niepotwierdzona flaga ma go dalej po wyłączeniu potwierdzeń (A-20);
    - nowa hala dodana w panelu pojawia się w ciągu 10 s;
    - regresja wizualna przy 1920×1080 i 3840×2160, w widoku wszystkich hal i na pełnym ekranie każdej hali.
- [ ] **Tablet.**
  - Testy instrumentowane na emulatorze (3.1.2).
  - Testy zrzutów (propozycja, 3.5.2): ekrany z fixture'ów renderowane w profilu Kaleido 3 i Gallery 3 i przeliczone na skalę szarości. Statusy (papier, OK, uwaga, krytyczna) muszą się różnić jasnością i grubością obrysu także bez koloru; na polach koloru tylko czarny albo biały pogrubiony tekst.
  - „Zmień boks” na emulatorze ze sztucznym zegarem: zakładki hal (otwarta zakładka hali bieżącego boksu), przełączenie od razu po stuknięciu, powrót do poprzedniego boksu po 30 s bez wyboru, wybór (`boxes.id`) zachowany po zabiciu procesu; przy jednej hali lista bez zakładek.
  - Blokada ekranu na emulatorze ze sztucznym zegarem: seria stuknięć i przeciągnięć po zablokowanym ekranie nie wysyła żadnego zapisu; odblokowanie dopiero po 3 s przytrzymania kłódki; pop-up nowej flagi (stajnia z potwierdzeniami) pojawia się mimo blokady, a POTWIERDZAM działa po odblokowaniu; po 10 min blokada schodzi sama (propozycja).
  - Logowanie i język na emulatorze: kontem technicznym tabletów przez „TELEFON | E-MAIL” z kodem z SMS-a i z e-maila, po kodzie od razu lista boksów (bez wyboru stajni); konto osoby albo Wyświetlacz dostaje TabletBrakUprawnien; język tablicy zmieniony w ukrytych ustawieniach albo przełącznikiem PL | UA w stopce zostaje po zabiciu procesu i po ponownym logowaniu, a drugi tablet (emulator) ma swój język.
  - Konfiguracja stajni na emulatorze: tablet zalogowany kontem „Tablety Brzozowa”, boks 1 (TabletBoksBrzozowa); „Zmień boks” ma tylko boksy 1–6 Brzozowej, bez zakładek i bez stajni; nagłówek bez hali, baner bez plakietki „POTWIERDZONA” i bez pop-upu, „SZYBKIE AKCJE” tylko „OGARNIĘTE” i „ŚNIADANIE”, karmienie bez „NAMOCZYĆ”; zrzut porównany z makietą (propozycja).
  - Scenariusze UI na sztukach deweloperskich z ADB (Maestro albo UI Automator).
  - Na sztukach produkcyjnych (ADB wyłączone) obserwacja kamerą i w logach, a stuknięcia ręczne.
- [ ] **Prawdziwe SMS w przebiegu nocnym:** modem z kartą SIM odczytuje kod OTP i eskalację.
- [ ] **E-mail:** doręczalność kodów logowania (`EMAIL_OTP`), zaproszeń, powiadomień i przypomnień do skrzynek WP, Onet, Interia, o2 i Gmail (czas doręczenia kodu, folder spam); zgodność SPF, DKIM i DMARC w nagłówkach.
- [ ] **Strona www:** 3.5.5.

### 4.2 Bezpieczeństwo
- [ ] **Izolacja stajni.**
  - Każda trasa wywołana tokenem stajni A z identyfikatorami stajni B daje 404 (meta-test pilnuje nowych tras).
  - `board` i wyświetlacz nie widzą innej stajni.
  - Zdarzenie z cudzym `stable_id` jest odrzucane.
  - `X-Box-Id` albo `boxId` boksu stajni B (Stajnia Brzozowa ma te same numery boksów 1–6 co Hala nowa) daje 404 i nie tworzy zapisu. Lista „Zmień boks” zawiera tylko hale i boksy stajni konta tabletów.
  - Strażnik predykatu `stable_id`, w tym tabele podrzędne przez rodzica.
  - Dostęp w obrębie konta firmy: obie stajnie należą do konta „Stajnie Lipowe sp. z o.o.”. Admin konta (Damian) ma dostęp do obu, także do ustawień. Obsługa ma dostęp tylko do przypisanych stajni: Piotr dostaje 404 na każdym obiekcie Stajni Brzozowej, Paweł na każdym obiekcie Stajni Pod Lipami; Ola ma obie.
  - Izolacja między firmami: drugie konto firmy z innym NIP (fixture, np. Stajnia Olszynka, propozycja). Jego admin dostaje 404 na obiektach obu stajni Damiana, a Damian na obiektach tamtej firmy. Ten sam numer boksu (1–6) w trzech stajniach niczego nie miesza.
- [ ] **Role, macierz rola × akcja (to, co dozwolone, i to, co zabronione).**
  - client: flagi swoich koni (ustawienie, zmiana godzin, odwołanie), podgląd boksu, w którym stoi jego koń, i historii tego boksu od dnia, w którym koń do niego trafił; bez szybkich akcji obsługi i bez zadań (403); boks bez jego konia (np. wolny Hala główna · boks 3) daje 404; po `valid_to` albo `revoked_at` traci dostęp.
  - staff (tylko w stajniach, do których jest przypisany): wszystkie konie tej stajni, także Luna bez boksu; szybkie akcje obsługi (także „Woda” przy poidle ręcznym); „Biorę” i „Zrobione” przy zadaniach, ale bez dodawania zadań i bez przełącznika poidła (403).
  - admin (konta firmy, w każdej stajni firmy): zakładanie stajni, hale (z adresem), boksy (także przełącznik „Automatyczne poidło”), zaproszenia (także kont technicznych: Wyświetlacz, Tablet), przypisania osób do stajni, dodawanie i odwoływanie zadań, „Ustawienia stajni” (potwierdzenia, usługi, aktywne szablony flag, widoczność per rola). Dodać halę, założyć stajnię i zmienić ustawienia stajni może tylko admin konta firmy; staff, client, instructor, display i tablet dostają 403.
  - tablet (konto techniczne, tylko przez klient Cognito tablet; w apce i panelu brak dostępu, propozycja): tylko potwierdzenie flagi, „Ogarnięte” i „Woda” (poidło ręczne) dla boksu z `X-Box-Id` oraz posiłek i padok dla hali tego boksu [erd]; zadania i akcja dla innej hali dają 403, boks innej stajni 404 (propozycja); konto osoby albo `display` na kliencie tablet dostaje 403 (TabletBrakUprawnien).
  - display (konto techniczne telewizora): tylko GET, każdy zapis daje 403.
  - Wsparcie IT (zespół EQUENOR) nie jest rolą stajni: dostęp operatora do diagnostyki, bez danych osobowych klientów (propozycja).
  - Widoczność per rola (`stable_role_features`) tylko zawęża uprawnienia (propozycja): odznaczona funkcja daje 403 na trasach tej funkcji i znika z odpowiedzi złożonych, a zaznaczona nie daje roli prawa zapisu, którego rola nie ma (np. klient z widocznością „Szybkie akcje i ich stan” dalej dostaje 403 na zapis).
  - Opcje wyłączone w ustawieniach stajni: zapis daje `409 option_disabled` (propozycja) dla każdej roli, także admina i tabletu; potwierdzenie flagi bez `requires_ack` daje `409 ack_not_required` (propozycja).
  - Kombinacje ról: ta sama osoba jako client dwóch koni w różnych halach (Anna: Kasztan i Bella); ta sama osoba w dwóch stajniach o różnych ustawieniach (Ola: staff w obu, Anna: client w obu, Damian: admin konta), gdzie uprawnienia, widoczność i konfiguracja liczą się osobno dla każdej stajni; staff w jednej stajni i client w drugiej.
- [ ] **Wyświetlacz bez danych osobowych.** Dane-kanarki (unikalne telefony, e-maile, nazwiska) w seedzie. Skan każdej odpowiedzi dla `display` oraz HTML i JS widoku wyświetlacza w panelu nie może znaleźć kanarka ani wzorca E.164 czy e-maila.
- [ ] **Tablica tabletu nie pokazuje, kto jest zalogowany.** Tablet zalogowany kontem z danymi-kanarkami: na żadnym ekranie poza ukrytymi ustawieniami nie ma nazwy, telefonu ani e-maila zalogowanego konta. Akcje z tabletu zapisują się bez autora: `source = tablet` (przy potwierdzeniu flagi `method = tablet`), `user_id = NULL`, `audit_log.actor_type = tablet` [erd].
- [ ] **Presigned URL.**
  - `files` niedostępny z zewnątrz (ingress, NetworkPolicy).
  - Właściciel sprawdza uprawnienia przed wydaniem linku, np. `owner_private` nie trafia do obsługi.
  - Link po terminie daje 403; tokenem stajni A nie da się dostać linku do pliku stajni B.
  - Upload z ograniczonym typem i rozmiarem, z kontrolą `sha256`.
- [ ] **Zaproszenia.**
  - Nie da się ich zaakceptować po `expires_at` ani po `revoked_at`, ani zaakceptować drugi raz.
  - Dopasowanie tylko do zweryfikowanego kontaktu; formaty `+48 600…`, `600…` i `0048…` dają ten sam wynik, a e-mail pisany wielkimi i małymi literami też (propozycja).
  - Zaproszenie e-mailem nie daje dostępu osobie, która ma ten sam numer, ale inny e-mail, i odwrotnie.
  - Numer przydzielony przez operatora nowej osobie nie przejmuje dostępów poprzedniego właściciela.
- [ ] **Sesje.**
  - Po global sign-out zmierzyć czas do utraty dostępu na telefonie i w panelu (konto osoby), na tablecie (konto tabletów) i na wyświetlaczu (konto telewizora).
  - Wylogowanie osoby ze wszystkich urządzeń (np. Oli) nie wylogowuje żadnego tabletu ani telewizora.
  - Zgubiony tablet: admin blokuje konto techniczne tabletów w Ludziach („Zablokuj”: global sign-out i blokada w `stable_members`). Zmierzyć czas, po którym każdy tablet stajni pokazuje ekran logowania bez starych flag; po odblokowaniu pozostałe tablety logują się ponownie kodem i wracają do swoich boksów i języka, a zgubiony bez nowego kodu nie wraca (propozycja).
  - Skradziony tablet czyta tablicę najwyżej przez czas życia access tokenu.
  - Blokada konta telewizora (rola Wyświetlacz) przez admina: zmierzyć czas do zniknięcia danych; sprawdzane także w członkostwie.
  - Wygaśnięcie refresh tokenu (pula testowa ze skróconą ważnością) daje czytelny ekran logowania, bez zamrożonych danych.
  - Usunięcie konta: pseudonimizacja i usunięcie w Cognito.
- [ ] **Cognito i SMS na prawdziwych numerach.**
  - Na każdej karcie z 1.4: czy kod dochodzi, mediana i najgorszy czas, widoczna nazwa nadawcy.
  - Treść po polsku i ukraińsku, bez linków w SMS z kodem.
  - Autouzupełnianie kodu (iOS `one-time-code`, Android SMS Retriever).
  - Ponowne wysłanie kodu i limity Cognito.
  - Ważność kodu (makieta podaje 10 min) porównana z oknem sesji Cognito.
  - Zmiana numeru, numer przeniesiony, roaming, 5 minut bez zasięgu.
  - Kod e-mailem: czas doręczenia do skrzynek z 4.1, folder spam, ponowne wysłanie i limity, kod użyty drugi raz; konto z telefonem i e-mailem loguje się oboma kanałami.
- [ ] **TOTP (jeśli zostaje).**
  - Rejestracja przez QR i przez ręczne przepisanie sekretu w Google Authenticator, Microsoft Authenticator, Aegis i 1Password.
  - Zegar telefonu przesunięty o ±30 s i ±2 min.
  - Ponowne użycie kodu.
  - Utrata telefonu z TOTP: odzyskanie dostępu z wpisem w audycie. Jedyny admin bez dostępu: przećwiczona procedura.
- [ ] **Kiosk:** T-02 i W-26.
- [ ] **Pozostałe:** SBOM i skan zależności w CI, nagłówki bezpieczeństwa i CORS panelu, sekrety poza repo. Opcjonalnie zewnętrzny test penetracyjny przed wdrożeniem.

### 4.3 Testy na prawdziwym sprzęcie

#### 4.3.1 Tablet
**A. Provisioning i kiosk**
- [ ] **T-01 (B) Device Owner.**
  - Na tablecie bez kont: ADB według procedury dla modelu, potem `adb shell dpm set-device-owner`.
  - Zapisać komunikat i wynik `dumpsys device_policy`.
  - Kontrolnie spróbować na tablecie z kontem Google: ma się nie udać.
  - Najpierw na emulatorze, potem na Boox Note Air6 C.
  - Jeśli na Boox się nie uda: ten sam moduł DO na Samsung Galaxy Tab Active5 (dokupiony dopiero wtedy, wzorzec Device Owner i plan B) oddziela błąd naszego kodu od ograniczeń firmware e-ink.
- [ ] **T-02 (B) Lock Task z `setLockTaskFeatures(NONE)`.** Próby ucieczki:
  - krawędzie ekranu i panel producenta (Boox, prawa krawędź);
  - długie przytrzymanie przycisku zasilania;
  - Recents, powiadomienia, szybkie ustawienia, gesty;
  - podłączenie ładowarki i klawiatury USB.

  Żadna próba nie może się udać.
- [ ] **T-03 (B) HOME.** Po restarcie startuje nasza apka, bez launchera producenta. Do tego `setKeyguardDisabled` i `STAY_ON_WHILE_PLUGGED_IN`.
- [ ] **T-04 (B) Ustawienia producenta.**
  - App Freeze wyłączone, Autostart włączony, „Stay active in the background” na Unlimited, auto-uśpienie i auto-wyłączenie wyłączone, Wi-Fi aktywne w uśpieniu.
  - Obserwacja przez 72 h: czy firmware zabija apkę, robi force-stop, wyłącza pakiet albo kasuje alarmy.
  - DPC i HOME wracają same, a ustawienia po restarcie nie wracają do „Restricted”.
- [ ] **T-05 Aktualizator producenta.** Blokada `setPackagesSuspended` albo `setApplicationHidden` (ustalić nazwę pakietu) i sprawdzenie, czy firmware respektuje `setSystemUpdatePolicy`. Okres zamrożenia wynosi najwyżej 90 dni ([system updates](https://developer.android.com/work/dpc/system-updates)).
- [ ] **T-06 Restrykcje i odzyskanie.**
  - `DISALLOW_DEBUGGING_FEATURES`, zablokowany reset z ustawień i blokada zmiany daty nie przeszkadzają w cichej instalacji ani w dodaniu sieci przez DPC.
  - Reset z recovery, a potem ponowny provisioning, przywraca tablet. FRP go nie blokuje.
- [ ] **T-07 Provisioning.** Czas od rozpakowania do kiosku i powtarzalność `tools/provision-tablet`.

**B. Zasilanie i praca ciągła**
- [ ] **T-08 (B) Autostart po rozładowaniu.** Bateria spada do zera, prąd wraca. Tablet sam się włącza i wraca do Lock Task, zalogowany, na zapamiętanym boksie. 50 cykli z przekaźnika, 100% udanych. Do tego:
  - zanik samego zasilacza (zmierzyć czas pracy na baterii);
  - zanik prądu w całej stajni, czyli tabletu razem z AP.
- [ ] **T-09 Restart procesu systemowego (soft reboot).** Apka, Lock Task i odpytywanie wracają same, a ekran nie zostaje w złym stanie.
- [ ] **T-10 Limit ładowania.**
  - Czy model ma Charging protection.
  - Czy da się ją włączyć z modułu Kotlin.
  - Czy poziom zatrzymuje się na 80% przez cały test.
  - Bez limitu: ładowanie cykliczne z gniazda sterowanego i reakcja apki na zmianę zasilania.
- [ ] **T-11 Praca ciągła** (72 h w bramce, potem co najmniej 28 dni na stanowisku). Mierzymy:
  - crash i ANR, PSS i stertę JS (trend tygodniowy), restarty;
  - ponowne połączenia Wi-Fi;
  - temperaturę i stan baterii (`BatteryManager`) oraz temperaturę w obudowie;
  - grubość tabletu suwmiarką co tydzień;
  - liczbę interwencji człowieka (cel: zero);
  - czy diagnostyka w ogóle dociera do logów i metryk.
- [ ] **T-12 Zasilacz.** Bilans przy 5 V bez PD i z PD (zasilacz USB-C PD 20–30 W), pobór w spoczynku i przy odświeżaniu, osobno przy pełnym odświeżeniu w trybie z kolorem, długość kabla.

**C. Sieć i czas**
- [ ] **T-13 (B) Wi-Fi.** Pasma 2,4 i 5 GHz osobno, WPA2 i WPA3. Wi-Fi nie zasypia: zmierzyć opóźnienie odpytywania przy włączonym oszczędzaniu energii.
- [ ] **T-14 Awarie sieci.**
  - AP wyłączony na 1 min, 10 min i 2 h.
  - Wi-Fi działa, ale WAN jest odcięty.
  - Restart AP i roaming między AP.
  - `netem` z 5–30% strat.
  - 802.11k/v/r włączone i wyłączone.

  Stopka pokazuje „brak połączenia, dane z HH:MM”, a tablet wraca sam, bez dotykania.
- [ ] **T-15 Zmiana sieci w kiosku.** Ukryty ekran dodaje sieć przez DPC. Sprawdzić zgodność z `DISALLOW_CONFIG_WIFI` i zmierzyć czas przywrócenia wszystkich tabletów po zmianie hasła albo routera.
- [ ] **T-16 Czas.** NTP i strefa Europe/Warsaw; start bez sieci (`time_quality = unknown`); symulacja zmiany czasu.
- [ ] **T-17 Fala powrotów.** Wszystkie tablety wracają naraz: jitter rozkłada odpytywanie i odświeżanie tokenów w czasie.

**D. Ekran i dotyk**
- [ ] **T-18 Opóźnienie flagi.**
  - Od zapisu flagi w apce do widocznego pop-upu (stajnia z potwierdzeniami; w stajni bez nich do flagi w banerze): p95 z co najmniej 500 prób.
  - Pomiar kamerą w zwolnionym tempie i z logów.
  - Sprawdzić, czy 304 dociera do JS.
  - Na kolorowym e-inku pop-up z paskiem `t-crit` wymaga pełnego odświeżenia w trybie z kolorem: zmierzyć je osobno i doliczyć do progu.
  - Próg: interwał odpytywania plus render plus odświeżenie EPD.
- [ ] **T-19 Dotyk.** „POTWIERDZAM”, szybkie akcje („OGARNIĘTE”, posiłek, „PADOK”), „WODA” (boks z poidłem ręcznym), „Zmień boks”, kłódka „Zablokuj ekran” (także przytrzymanie 3 s) i kafle obsługiwane:
  - gołą, mokrą i brudną dłonią;
  - w każdej parze rękawic;
  - przez folię i przez szybę.

  Do tego przypadkowe dotknięcia (łokieć, koń). Mycie i wycieranie zablokowanego ekranu sprawdza T-30.
- [ ] **T-20 Czytelność.** Z 1,5 i 2 m, przy oświetleniu zmierzonym luksomierzem (dzień, światło sztuczne, zmierzch, noc), z podświetleniem i bez, przez obudowę. Ocenia kilka osób, także w okularach.
  - **Pola koloru `t-*` na kolorowym e-inku** (Boox Note Air6 C: według źródeł z 1.1 panel Kaleido 3, czyli profil domyślny; potwierdzić na sprzęcie, K-01):
    - baner flagi, WSTRZYMANE i pasek pop-upu w `t-crit` z białym pogrubionym tekstem ≥ 19 px: czytelne z 2 m, biel nie szarzeje od ditheringu;
    - pola `t-warn` i `t-ok` z czarnym pogrubionym tekstem: kafle ≥ 44 px, komórki tabeli, lewy pasek ≥ 10 px;
    - tekst `t-ink-2` (≥ 20 px) tylko na papierze i nadal czytelny;
    - neutralne pola (`t-paper`, `t-scrim`) i linie `t-line` bez kolorowego ziarna;
    - te same ekrany w profilu domyślnym i w profilu Gallery 3; wynik zapisuje parę model → profil w konfiguracji APK.
  - **Wariant czarno-biały:**
    - zdjęcia ekranu kolorowego przeliczone na szarość, a jeśli firmware Boox ma tryb czarno-biały, także w tym trybie [niepotwierdzone];
    - na prawdziwym czarno-białym panelu dopiero po dokupieniu Boox Go 10.3 Gen II Lumi;
    - kolejność jasności papier > OK > uwaga > krytyczna > atrament zachowana na sprzęcie mimo krzywej sterownika i ditheringu; pomiar na zdjęciu z kartą szarości (propozycja);
    - statusy rozróżnialne bez koloru: krytyczna to ciemne pole bez ramki, uwaga ramka 4 px, OK 2 px, do zrobienia 2 px przerywana; info bez wypełnienia, z ramką 2 px i ikoną.
- [ ] **T-21 Odświeżanie i „duchy”.**
  - Każda ścieżka EPD z 3.5.2.
  - Po odwołaniu flagi nie zostaje „duch” napisu „BEZ ŚNIADANIA” (zdjęcia makro przed i po).
  - Ocena po 24 h i po 7 dniach stałego obrazu.
  - **Kolorowy e-ink:**
    - każda zmiana statusu (nowa flaga, potwierdzenie, odwołanie, przejście w „niepotwierdzona”, początek i koniec okna flagi, „Ogarnięte”, posiłek i padok hali) zmienia pole koloru jednym pełnym odświeżeniem w trybie z kolorem; po zniknięciu pola `t-crit` albo `t-warn` nie zostaje kolorowy ślad;
    - zegar, odliczanie i pasek ONLINE są czarno-białe i idą szybkim trybem (A2 albo DU); sprawdzić, czy szybki tryb nie odbarwia ani nie przyciemnia sąsiednich pól koloru, bo szybkie tryby gubią kolor;
    - czy Onyx SDK pozwala ustawić tryb dla fragmentu ekranu na Note Air6 C: [niepotwierdzone]; jeśli nie, zmierzyć skutki odświeżania zegara dla całego ekranu;
    - liczba pełnych odświeżeń na dobę: po pop-upie, przy nowej fladze krytycznej, przy każdej zmianie pola koloru i co najmniej raz na dobę, bez animacji;
    - zmiana statusu w trakcie częściowego odświeżania zegara nie zostawia pola w starym kolorze.
  - **Czarno-biały e-ink** (tylko po dokupieniu Go 10.3 Gen II Lumi): te same ścieżki; pola statusu jako szarość bez „duchów” po zmianie statusu.
- [ ] **T-22 Zimno w komorze, 0 °C i niżej.** Sprawdzamy:
  - szybkość odświeżania i dotyk; na kolorowym e-inku osobno czas pełnego odświeżenia w trybie z kolorem i nasycenie pól `t-*`;
  - czy tablet ładuje się w zimnie (jeśli firmware wstrzymuje ładowanie, tablet rozładuje się mimo zasilacza);
  - kondensację po ogrzaniu.
- [ ] **T-30 Blokada ekranu przy myciu** (na sztuce, przy prawdziwym myciu):
  - „Zablokuj ekran” obok „Zmień boks”; pasek „EKRAN ZABLOKOWANY · przytrzymaj kłódkę 3 s, aby odblokować” i kółko postępu czytelne z 1,5 m;
  - mycie i wycieranie zablokowanego ekranu mokrą ścierką i spryskiwaczem: zero zapisów i zero zmian na ekranie; mokra ścierka i woda nie odblokowują ekranu (nie „przytrzymują” kłódki przez 3 s);
  - odblokowanie przytrzymaniem kłódki 3 s gołą dłonią i w rękawicach (propozycja);
  - zablokowana tablica dalej się odświeża (zegar, nowa flaga, „Ogarnięte” z apki), przyciski mają przerywaną ramkę, bez szarych wypełnień;
  - pop-up nowej flagi (stajnia z potwierdzeniami) pojawia się mimo blokady; POTWIERDZAM nie działa do odblokowania;
  - blokada schodzi sama po 10 min (propozycja), także po restarcie apki ekran jest odblokowany;
  - zmiana wyglądu przy blokadzie i odblokowaniu nie zostawia „duchów” ani kolorowego śladu (T-21).

**Testy koloru K-01…K-07** (rozszerzają T-20, T-21 i T-22; K-01 i K-05 przechodzą przed zakupem etapu 1; progi ustalić przed testem, sekcja 5):
- [ ] **K-01 Czytelność pól statusu i drabina jasności.**
  - Plansza testowa w ukrytych ustawieniach (propozycja): pola `t-paper`, `t-ok`, `t-warn`, `t-crit`, `t-ink` i `t-scrim` w rozmiarach z makiet (kafel 44 px, baner flagi, pasek popupu 16 px, lewy pasek 10 px). Tekst jak w apce: pogrubiony czarny na `t-ok` i `t-warn`, pogrubiony biały 19 px na `t-crit`, `t-ink-2` 20 px na papierze. Plansza w obu profilach: domyślnym (Kaleido 3) i Gallery 3.
  - Oświetlenie mierzone luksomierzem: półmrok hali, ciepłe światło sztuczne, światło dzienne z bramy, latarka czołowa. W domu warunki odtwarzamy, a potwierdzamy je w stajni pilotażowej (T-29).
  - Podświetlenie wyłączone, w połowie i na maksimum, przy skrajnych ustawieniach CTM.
  - Pomiar: zdjęcie z ręczną ekspozycją i szarą kartą, potem jasność każdego pola. Kolejność papier > OK > uwaga > krytyczna > atrament musi się utrzymać, a odstępy nie mogą spaść poniżej progu.
  - Ocena z 1,5 i 2 m przez kilka osób: czy da się odróżnić „niepotwierdzona” od OK bez czytania słowa i czy biały tekst na `t-crit` jest czytelny. Jeśli profil Gallery 3 wypadnie na Kaleido 3 lepiej niż domyślny, to sygnał do zmiany palety.
- [ ] **K-02 Ditherowanie i ziarno.**
  - Zdjęcia makro płaskich pól `t-ok`, `t-warn` i `t-crit` oraz neutralnego pola `t-scrim` i linii `t-line` (`t-line` nigdy nie jest wypełnieniem). Sprawdzamy, czy sterownik ditheruje pola (wzór, mora), czy krawędzie pól są postrzępione i czy neutralne R = G = B zostają bez kolorowego ziarna.
  - Białe litery na `t-crit`: kolorowe obwódki na krawędziach przy siatce koloru 150 ppi.
  - Ustawienia E-Ink Center dla naszego pakietu (tryb odświeżania, wzmocnienie ciemnych kolorów, suwaki koloru): zapisać wartości domyślne, zmierzyć ich wpływ i zamrozić je w `tools/provision-tablet`. Czy da się je ustawić z ADB albo DPC: [niepotwierdzone].
- [ ] **K-03 Ghosting koloru.**
  - Sekwencje: baner `t-crit` → papier (odwołanie flagi); `t-warn` → `t-ok` (potwierdzenie, „potwierdzona HH:MM”); pop-up na `t-scrim` → zamknięcie; „Zmień boks” → inny boks z innymi polami koloru, także między zakładkami hal.
  - Zdjęcia makro przed zmianą, po odświeżeniu częściowym i po pełnym. Po pełnym odświeżeniu nie może zostać czytelny ślad pola ani słowa.
  - Ocena po 24 h i po 7 dniach stałego obrazu, z pełnym odświeżeniem raz na dobę.
- [ ] **K-04 Pełne odświeżenie przy zmianie statusu.**
  - Każda zmiana pola koloru daje dokładnie jedno pełne odświeżenie w trybie z kolorem: log `epdRefresh(full)` i nagranie wideo.
  - Mierzymy czas od nowych danych do stabilnego obrazu (wchodzi do budżetu T-18) i widoczność błysku.
  - Bez zmiany statusu nie ma pełnych odświeżeń, poza jednym na dobę.
  - Częściowe odświeżanie zegara, odliczania i paska ONLINE nie narusza sąsiednich pól koloru (granice regionów).
- [ ] **K-05 Tryby A2 i DU gubiące kolor.**
  - Celowo narysować pole `t-warn` i `t-crit` w A2 i DU, a wynik udokumentować zdjęciem.
  - W normalnej pracy szybkim trybem idą tylko elementy czarno-białe: zegar, odliczanie i ONLINE.
  - Tryb naszej apki w E-Ink Center ustawić na jakościowy (HD albo Regal) i wyłączyć „Smooth Mode”. Sprawdzić, czy firmware nie przełącza apki w tryb szybki przy przewijaniu listy boksów w „Zmień boks” (OSTATNIE AKCJE się nie przewijają), i czy ustawienie przetrwa restart i rozładowanie.
  - Czy Onyx SDK pozwala ustawić tryb dla fragmentu ekranu: [niepotwierdzone] (3.5.2).
- [ ] **K-06 Wariant czarno-biały.**
  - Etap 0, bez dodatkowego sprzętu: zrzuty ekranu z Air6 C (`screencap`) w obu profilach, skwantowane do 16 poziomów szarości. Sprawdzamy kolejność i odstępy drabiny oraz grubości obrysów: uwaga 4 px, OK 2 px, do zrobienia 2 px przerywana, krytyczna bez ramki. Wynik jest tylko orientacyjny, bo zrzut pomija krzywą sterownika i dithering panelu.
  - Na panelu Carta (Go 10.3 Gen II Lumi, jeśli zostanie dokupiony): K-01…K-04 w tej samej formie. Dodatkowo sprawdzamy, czy szare pola 204, 146 i 66 nie ditherują się w sposób mylący z ramkami.
  - Kryterium: każdy status rozróżnialny bez koloru, po jasności, obrysie, słowie i ikonie.
- [ ] **K-07 Podświetlenie w pracy ciągłej.**
  - Najniższy poziom podświetlenia, przy którym K-01 przechodzi w półmroku.
  - Czy apka albo DPC ustawia jasność i barwę światła. Onyx ma osobne kanały ciepły i zimny, którymi steruje np. [Gentle Glow](https://apt.izzysoft.de/packages/com.onyx.darie.calin.gentleglowonyxboox/). Na Air6 C: [niepotwierdzone]. Ustawienie musi przetrwać restart i rozładowanie do zera.
  - Pobór prądu z podświetleniem w bilansie T-12, temperatura w obudowie w T-11. W T-22 dodatkowo czas pełnego odświeżenia z kolorem i ghosting w zimnie.

**E. Logowanie**
- [ ] **T-23 Sesja na tablecie.**
  - Logowanie kontem technicznym tabletów („Tablety Pod Lipami”, b•••@stajnielipowe.pl) przełącznikiem „TELEFON | E-MAIL”: kod z SMS-a i kod z e-maila; po kodzie od razu TabletPierwszyBoks, bez wyboru stajni.
  - Język tablicy ustawiony na tym tablecie zostaje po restarcie, rozładowaniu i ponownym logowaniu.
  - Odnawianie sesji przez cały test ciągły.
  - Wylogowanie osoby ze wszystkich urządzeń nie wylogowuje tabletu; blokada konta tabletów (zgubiony tablet, global sign-out): tablet pokazuje ekran logowania bez starych flag i pamięta boks.
  - Po ponownym zalogowaniu tablet wraca do tego samego boksu (to samo `id`); konto osoby albo Wyświetlacz dostaje TabletBrakUprawnien.
  - Tablica nie pokazuje, kto jest zalogowany; logowanie i wylogowanie tylko w ukrytych ustawieniach (długie przytrzymanie).
  - Tokeny w Keystore (sprzętowym czy programowym).

**F. Aktualizacje APK**
- [ ] **T-24 (B) Cicha instalacja.** `PackageInstaller` jako DO, restart przez `MY_PACKAGE_REPLACED` i powrót do Lock Task. Zły podpis albo uszkodzony plik jest odrzucany, a stara wersja działa dalej.
- [ ] **T-25 (B) Przerwana aktualizacja.**
  - Zerwane Wi-Fi w trakcie pobierania.
  - Presigned URL wygasa w trakcie pobierania.
  - Zanik prądu w trakcie instalacji.
  - Restart w trakcie instalacji.

  W każdym przypadku tablet kończy na działającej wersji i sam wraca do kiosku.
- [ ] **T-26 Wadliwa wersja.** Crash przy starcie uruchamia watchdog; naprawa przez status `halted` i APK z wyższym `versionCode`. Aktualizacja przy otwartym pop-upie: boks i sesja zostają.
- [ ] **T-27 Play Protect.** Status certyfikacji (Sklep Play › Informacje) i numer firmware. T-24 powtarzać po aktualizacjach Play services (weryfikacja deweloperów).

**G. Funkcje tabletu**
- [ ] **T-28 Pop-up i „Zmień boks”.**
  - **Pop-up** (tylko dla flag z `requires_ack`, w praktyce w stajni z potwierdzeniami; czy stajnia ich wymaga, zależy od jej ustawień):
    - kolejka pop-upów, krytyczne pierwsze;
    - godziny flagi w pop-upie („dziś 06:00–10:00”);
    - pop-up nowej flagi znika po POTWIERDZAM albo po odwołaniu flagi, przy najbliższym odpytaniu;
    - potwierdzenie na jednym tablecie (albo w apce) usuwa pop-up z drugiego tabletu na tym samym boksie przy najbliższym odpytaniu;
    - status tylko „potwierdzona HH:MM” albo „niepotwierdzona”;
    - w stajni bez potwierdzeń (Stajnia Brzozowa, A-18) pop-upu nie ma: nowa flaga przy najbliższym odpytaniu od razu stoi w banerze (przed początkiem okna pod banerem z „od HH:MM”), bez POTWIERDZAM i bez plakietki „POTWIERDZONA”;
    - zapis bez autora: `method = tablet`, `user_id = NULL`, `box_id` wybranego boksu z `X-Box-Id`.
  - **„Zmień boks”** (bez blokady boksu, zmienić może każdy przy tablecie):
    - lista w zakładkach hal; otwarta jest zakładka hali bieżącego boksu; przy jednej hali lista bez zakładek;
    - przyciski boksów z numerem i koniem; wolne boksy (Hala główna · boks 3, Hala nowa · boks 6) oznaczone;
    - stuknięcie przełącza od razu; nagłówek pokazuje halę z numerem („Hala nowa · boks 4”);
    - bez wyboru powrót do poprzedniego boksu po 30 s, z doliczonym odświeżeniem e-ink; to samo po przełączaniu zakładek bez wyboru boksu (od kiedy liczyć 30 s, erd.md nie przesądza; propozycja: od ostatniego dotknięcia listy);
    - nowy pop-up w trakcie wybierania;
    - wybór boksu (`boxes.id`) przetrwa restart, zanik prądu, aktualizację APK i ponowne logowanie;
    - boks przeniesiony w panelu do innej hali: tablet zostaje na tym samym `id`, a nagłówek i zakładka pokazują nową halę;
    - hala dodana w panelu pojawia się jako nowa zakładka przy najbliższym odpytaniu.
  - **Dwie hale, ten sam numer** (tablety na Hala główna · boks 4 i Hala nowa · boks 4; w zestawie domowym drugim tabletem jest emulator):
    - flaga Belli pojawia się tylko na tablecie Hala nowa · boks 4, a nie na tablecie Sonaty;
    - POTWIERDZAM zapisuje `box_id` boksu 4 Hali nowej;
    - „OGARNIĘTE” z tabletu Hala główna · boks 4 trafia do id boksu 4 Hali głównej (Sonata);
    - posiłek i „PADOK” z tabletu Hala nowa · boks 4 zapisują akcję dla Hali nowej, a nie dla Hali głównej;
    - nagłówki obu tabletów zawsze pokazują halę.
  - Blokada ekranu: T-30.

**H. Środowisko (stajnia pilotażowa)**
- [ ] **T-29 Warunki w stajni.**
  - Kilka tygodni pracy z rejestratorami.
  - Oględziny portu USB-C, styków i wnętrza ramki po 2, 4 i 8 tygodniach.
  - Ocena próbek materiałów.
  - Atrapy obudów przed montażem.
  - Mechanika: próba zdjęcia tabletu bez klucza, trzaskanie drzwiami boksu, uderzenie w ramkę.

#### 4.3.2 Wyświetlacz
- [ ] **W-01 Zimny start:** czas od podania prądu do widoku z danymi.
- [ ] **W-02 Wspólny zanik TV i Pi**, 100 cykli z losową przerwą od 5 s do 10 min.
  - Telewizor włącza się sam albo budzi go CEC.
  - Wraca ten sam widok (wszystkie hale albo pełny ekran zapamiętanej hali, W-29), a sesja jest ważna.
  - Journal i `fsck` bez błędów.
  - Porównanie NVMe z microSD.
- [ ] **W-03 Mrugnięcia zasilania** krótsze niż 1 s: Pi nie zawisa. Jeśli przekaźnik nie zejdzie poniżej 1 s, test robi się ręcznie wyłącznikiem listwy.
- [ ] **W-04 Zanik prądu samego telewizora:** obraz wraca bez ingerencji.
- [ ] **W-05 Restart samego Pi:** telewizor nie zostaje na ekranie „brak sygnału”. Sprawdzić HPD i EDID przy telewizorze w standby.
- [ ] **W-06 Przycisk zasilania Pi:** przypadkowe naciśnięcie nie pokazuje okna wyłączania i nie wyłącza Pi.
- [ ] **W-07 Doba bez dotykania pilota:** telewizor nie wyłącza się po 4 h i nie pokazuje komunikatu o wyłączeniu.
- [ ] **W-08 Trwałość ustawień telewizora** po zaniku zasilania i po świadomej aktualizacji jego firmware. Po włączeniu telewizor wraca na wejście HDMI z Pi, a nie na launcher.
- [ ] **W-09 Overscan:** ramka 1 px przy krawędziach jest widoczna w całości.
- [ ] **W-10 Retencja:** po 14 dniach statycznego widoku szara plansza nie pokazuje śladów.
- [ ] **W-11 Blokada pilota i przycisków** (jeśli model ją ma).
- [ ] **W-12 `kill -9` Chromium:** przeglądarka wraca w ≤ 10 s, bez okna „Przywrócić strony?”, paska infobar ani okna pęku kluczy.
- [ ] **W-13 Zawieszenie jądra:** watchdog sam restartuje Pi.
- [ ] **W-14 Wygaszanie i kursor:** 72 h ekran aktywny, kursor niewidoczny.
- [ ] **W-15 Praca ciągła** co najmniej 28 dni, razem z tabletami. Mierzymy:
  - pamięć Chromium i `free` bez rosnącego trendu (porównanie 2 GB z 4 GB);
  - `vcgencmd get_throttled` = `0x0`;
  - temperaturę z Pi zamocowanym za pracującym telewizorem;
  - obudowę pasywną wobec wentylatora (tylko na stanowisku);
  - ile GB dziennie zapisuje się na nośnik.

  Na koniec decyzja o nocnym przeładowaniu strony.
- [ ] **W-16 Aktualizacje:** pełna lista testów na kanarku przed każdą aktualizacją systemu albo Chromium w stajni.
- [ ] **W-17 Czas:** start bez sieci z RTC, symulacja zmiany czasu (NTP wyłączony, `timedatectl set-time`), zmiana daty po północy.
- [ ] **W-18 Odtworzenie zestawu:** podmiana karty na gotowy obraz, logowanie, wybór hali (nowy profil przeglądarki nie ma zapisanego wyboru, więc startuje od wszystkich hal). Zmierzyć czas i spisać procedurę.
- [ ] **W-19 Wi-Fi w miejscu montażu** z Pi za włączonym telewizorem (`nmcli` albo `iw`); porównanie z LAN.
- [ ] **W-20 AP wyłączony** na 1 min, 10 min i 1 h: pasek „Brak połączenia od…”, po powrocie strona odświeża się sama.
- [ ] **W-21 Błędy serwera** (500, 503, timeout, odpowiedź po 10 s): nigdy biały ekran, ostatni stan z informacją, ile ma lat.
- [ ] **W-22 ETag i 304:** odpowiedź 304 nie przerysowuje ekranu, ekran nie miga; zmierzyć transfer na dobę.
- [ ] **W-23 Czytelność:** 3 osoby z 2, 4, 6 i 10 m odczytują halę z numerem boksu, imię konia i nazwę flagi, w dzień przy otwartych wrotach i w nocy, w widoku wszystkich hal i na pełnym ekranie hali. Porównanie 1080p z 4K przy skali 2.
- [ ] **W-24 Układ** przy 1280×720, 1920×1080 i 3840×2160 (skala 2): bez przewijania i ucinania, także przy flagach we wszystkich 14 boksach obu hal (Hala główna 1–8, Hala nowa 1–6), w widoku wszystkich hal i na pełnym ekranie każdej hali.
- [ ] **W-25 Klawiatura i pilot przez CEC.**
  - Wejście w pełny ekran, przełącznik hal i powrót przyciskiem „Wszystkie hale” samymi strzałkami i OK, z widocznym fokusem.
  - Kody klawiszy przez `ir-keytable --test` albo `evtest`.
  - W razie potrzeby przemapować `KEY_OK` na `KEY_ENTER`.
- [ ] **W-26 Ucieczka z kiosku:** Alt+F4, Ctrl+W, F11 i skróty terminala nie dają dostępu do systemu, a Chromium wraca.
- [ ] **W-27 SSH:** tylko klucze, brak domyślnego hasła.
- [ ] **W-28 Pilotaż, 4–8 tygodni.**
  - Co 2 tygodnie oględziny kurzu i odczyt rejestratorów.
  - Poranek po mroźnej nocy.
  - Korozja złączy HDMI i USB-C oraz listew po pilotażu.
- [ ] **W-29 Pełny ekran hali i zapamiętany wybór.**
  - Telewizor ustawiony na pełny ekran Hali nowej wraca na ten sam widok po restarcie Pi, `kill -9` Chromium, zaniku prądu (W-02) i ponownym logowaniu konta telewizora (rola Wyświetlacz, e-mail i kod).
  - Na pełnym ekranie są tylko flagi tej hali, także w pasku pilnych; flaga Kasztana (Hala główna · boks 7) nie występuje, a skrót Hali głównej jest tylko liczbowy.
  - Przełącznik hal przechodzi na pełny ekran Hali głównej bez wracania do widoku wszystkich; „Wszystkie hale” wraca do sekcji wszystkich hal z paskiem pilnych obejmującym obie hale.
  - Zapisana hala wyłączona w panelu albo usunięta: po najbliższym odpytaniu strona pokazuje wszystkie hale. Wyczyszczony profil przeglądarki: wszystkie hale.
  - Dwa telewizory na jednym koncie z rolą Wyświetlacz pamiętają różne wybory niezależnie; serwer o wyborze nie wie.

#### 4.3.3 Sieć
- [ ] **N-01 Przed montażem w stajni pilotażowej:**
  - mapa Wi-Fi zrobiona telefonem i tabletem w każdym miejscu montażu;
  - RSSI i SNR mierzone na tablecie w obudowie i bez niej;
  - pasma.
- [ ] **N-02 Zmienne sezonowe:** konie w boksach i puste boksy, wrota otwarte i zamknięte, strych z sianem pełny i pusty.
- [ ] **N-03 Liczba klientów na AP i transfer na tablet na dobę.**
- [ ] **N-04 Brak portalu logowania i wyjście na port 443** do środowiska testowego z sieci stajni.
- [ ] **N-05 Amoniak:** NH3 na wysokości montażu i przy podłodze, rano przed sprzątaniem i po nim.
- [ ] **N-06 Przećwiczona zmiana Wi-Fi w stajni** według T-15.

### 4.4 Scenariusze akceptacyjne z makiet

Każdy scenariusz przechodzi automatycznie (backend, Playwright, Maestro, skrypt tabletu na sztuce z ADB) i ręcznie na stanowisku. Dane pochodzą z seedu z 3.2 (wt 13.10.2026, teraz 07:15): Hala główna, boksy 1–8 (Kasztan w boksie 7, wolny boks 3), i Hala nowa, boksy 1–6 (Grom 1, Mgła 2, Rumba 3, Bella 4, Bursztyn 5, wolny boks 6). Numery boksów powtarzają się między halami, więc skrypty i asercje odwołują się do boksów po `id` ze stałych UUID seedu, a interfejs zawsze pokazuje halę razem z numerem.

A-01…A-16 dzieją się w Stajni Pod Lipami, która ma włączone potwierdzenia flag. Pop-upy, POTWIERDZAM, status „potwierdzona / niepotwierdzona”, sekcja „Wymaga potwierdzenia” i eskalacje są w nich dlatego, że tak jest ustawiona ta stajnia: czy flagi wymagają potwierdzenia, zależy od ustawień stajni (erd.md pkt 12 i 16). A-17…A-21 sprawdzają konfigurację per stajnia na obu stajniach z seedu; Stajnia Brzozowa ma jedną halę (boksy 1–6, Kometa w boksie 1, wolny boks 5), więc tam interfejs pokazuje sam numer boksu. A-22…A-25 sprawdzają konto firmy z NIP, dostęp do stajni (admin konta i przypisania per stajnia), logowanie telefonem i e-mailem, telewizor i tablety na kontach technicznych i język tablicy per tablet.

1. **A-01 Kasztan (Hala główna · boks 7): wet o 8:00, kowal o 15:00.**
   - [ ] O 03:14 Anna wybiera kafelek „Bez śniadania”: godziny podpowiadają się jako dziś 06:00–10:00, dopisuje notatkę „Wet o 8:00, koń na czczo” i zapisuje. O 03:16 wybiera „Nie na padok”, zmienia podpowiedziane godziny padoku na 14:30–16:00 i dopisuje „Kowal o 15:00”.
   - [ ] Tablet z wybranym boksem Hala główna · boks 7 przy najbliższym odpytaniu pokazuje pop-upy „NOWA FLAGA · od Anny · 03:14” z godzinami „dziś 06:00–10:00” (krytyczny pierwszy) i „Nie na padok · 14:30–16:00”. Tablica nie pokazuje, kto jest zalogowany na tablecie.
   - [ ] O 06:02 ktoś stuka POTWIERDZAM przy obu pop-upach. Pop-upy znikają, baner pokazuje „BEZ ŚNIADANIA · 06:00–10:00” i „POTWIERDZONA 06:02”, a pod nim „Później: Nie na padok od 14:30 (kowal 15:00)”. Apka Anny pokazuje „Potwierdzona 06:02”, bez autora.
   - [ ] W bazie: `method = tablet`, `user_id` NULL, `box_id` boksu 7 Hali głównej (nie boksu 7 innej hali ani stajni), `audit_log.actor_type = tablet`.
   - [ ] Tabela karmienia: rano owies, siano i suplement X „WSTRZYMANE”; wieczorne wysłodki „0,5 kg · NAMOCZYĆ 2 l” bez wstrzymania, bo kolacja 18:00 jest poza oknem flagi.
   - [ ] O 06:40 Ola stuka „Podano śniadanie” dla Hali głównej: jeden wpis `building_routines` (Ola, apka), Kasztan wypisany jako pominięty („bez Kasztana: flaga”). Tablet boksu 7 w „SZYBKIE AKCJE” pokazuje „ŚNIADANIE · podane 06:40 · potem obiad 12:00” i „PADOK · B 10:00–14:30”.
   - [ ] Wyświetlacz pokazuje „Hala główna · boks 7”, „06:00–10:00 · potwierdzona 06:02” i „Nie na padok od 14:30”.
   - [ ] Historia boksu w MojBoks Anny ma tylko flagi (03:14, 03:16, potwierdzenia 06:02) i zdarzenia z przycisków: dziś „Podano śniadanie · Hala główna” 06:40 (pominięci: Kasztan) i „Ogarnięte” 07:10, wczoraj „Podano kolację · Hala główna” 18:02 (Piotr) i „Wyprowadzono na padok · Hala główna” 10:05 (Piotr); nic więcej.
   - [ ] Tablet boksu 7 o 07:15 w „OSTATNIE AKCJE” pokazuje dokładnie 5 wpisów, bez przewijania i bez „Cała historia”: 07:10 Ogarnięte; 06:40 Podano śniadanie (bez Kasztana: flaga) · Ola; 06:02 potwierdzono „Bez śniadania”; 06:02 potwierdzono „Nie na padok”; 03:16 nowa flaga „Nie na padok” · Anna.
   - [ ] Na kolorowym e-inku pole `t-crit` banera zmienia się jednym pełnym odświeżeniem przy potwierdzeniu, bez kolorowego śladu (T-21).
   - [ ] O 10:00 „Bez śniadania” kończy się sama: dane w bazie się nie zmieniają, zmienia się odpowiedź i ETag. Eskalacji nie ma. „Wyprowadzono na padok” dla Hali głównej obejmuje Kasztana (padok B); od 14:30 do 16:00 tablet pokazuje „NIE NA PADOK · 14:30–16:00”, więc koń jest na padoku między wizytami.
2. **A-02 Bella (Hala nowa · boks 4, martwy tablet).**
   - [ ] Flaga „Nie na padok” z 01:20 na dziś, cały dzień (00:00–23:59), Hala nowa · boks 4, tablet tego boksu wyłączony.
   - [ ] Tablet Hala główna · boks 4 (Sonata) tej flagi nie pokazuje.
   - [ ] Po `warn_at` „NIEPOTWIERDZONA” (jeden wiersz `flag_escalations` z `level = board_warning`) widać:
     - w pasku pilnych widoku wszystkich hal, z „Hala nowa · boks 4”;
     - na pełnym ekranie Hali nowej;
     - na liście dnia, w sekcji „Wymaga potwierdzenia”.

     Na pełnym ekranie Hali głównej flaga nie występuje; w skrócie Hali nowej jest najwyżej liczba.
   - [ ] Po `notify_at` admin dostaje dokładnie jedno powiadomienie (jeden wiersz `level = admin_notify`), także przy restarcie crona i dwóch replikach. Apka Anny pokazuje „Admin stajni dostał powiadomienie”.
   - [ ] „Wyprowadzono na padok” dla Hali nowej wypisuje Bellę jako pominiętą, także dopóki flaga jest niepotwierdzona.
   - [ ] Ola potwierdza w apce: status „potwierdzona HH:MM”, autorką w danych jest Ola, dalszych eskalacji nie ma.
3. **A-03 Odwołanie flagi przy otwartym pop-upie.**
   - [ ] Pop-up i baner znikają przy najbliższym odpytaniu, wstrzymany posiłek wraca do planu, a koń przestaje być pomijany w akcjach zbiorczych hali. Na ekranie e-ink nie zostaje „duch”, a na kolorowym e-inku także kolorowy ślad pola `t-crit`.
   - [ ] Wyświetlacz zmienia się najpóźniej po 10 s.
   - [ ] Eskalacja nie wychodzi, nawet gdy odwołanie przyszło tuż przed `notify_at`.
4. **A-04 Luna (koń bez boksu).**
   - [ ] Luna (dodana 12.10) jest widoczna w apce obsługi i w panelu, z klientem Markiem Nowakiem („zaproszenie czeka”) przy koniu, ale na żadnym tablecie.
   - [ ] W formularzu przypisania wolne boksy mają halę przy numerze („Hala główna · boks 3”, „Hala nowa · boks 6”), a zapis wysyła `boxId`.
   - [ ] Po przypisaniu do Hala nowa · boks 6 Luna pojawia się na tablecie tego boksu, a nie na tablecie Hala główna · boks 6 (Fala). Powstaje otwarty wpis w `horse_box_history`, a zużycie w billingu rośnie o 1.
5. **A-05 Wolne boksy: Hala główna · boks 3 i Hala nowa · boks 6.**
   - [ ] Szczegóły Hala nowa · boks 6: „Kto korzysta”: ostatni koń Wicher (do 01.10, przeniesiony do Hala główna · boks 5), klient nie dotyczy; „Ostatnio”: Ogarnięte 09.10 14:40 · Piotr; przyciski „Ogarnięte” i „Przypisz konia”.
   - [ ] Tablety obu boksów pokazują „wolny”, a w „Zmień boks” oba są oznaczone jako wolne w zakładkach swoich hal.
   - [ ] „OGARNIĘTE” stuknięte na tablecie Hala nowa · boks 6 nie ma autora i trafia do historii tylko tego boksu.
6. **A-06 Klient.**
   - [ ] Anna (klientka: Kasztan i Bella) widzi w MojBoks boks Kasztana, Hala główna · boks 7. „Ostatnio” ma tylko zdarzenia z przycisków obsługi: Ogarnięte dziś 07:10, Podano śniadanie 06:40 z „pominięty: flaga” i Wyprowadzono na padok wczoraj 10:05 · Piotr. „Historia” ma tylko flagi z potwierdzeniami i zdarzenia z przycisków, także wczorajsze: Podano kolację 18:02 · Piotr i Wyprowadzono na padok 10:05 · Piotr. Wpisy z apki mają osobę, wpisy z tabletu nie mają.
   - [ ] Historia zaczyna się od dnia, w którym Kasztan trafił do boksu 7. Wolnego boksu 3 Anna nie widzi (404), a szybkie akcje obsługi i zadania dają 403. Po `valid_to` albo `revoked_at` dostęp do konia i jego boksu znika.
   - [ ] Marek Nowak akceptuje zaproszenie jako Klient do Luny (`invitations.horse_id`) przed terminem i widzi Lunę; po terminie zaproszenia nie da się zaakceptować.
   - [ ] W Zaproszeniu admin wybiera rolę osoby: Klient (z wyborem konia), Obsługa albo Instruktor, a w panelu także konto techniczne (Wyświetlacz, Tablet przy boksie); test słownika odrzuca każdą inną nazwę roli, także Wsparcie IT (propozycja).
7. **A-07 Obsługa.**
   - [ ] Ola ustawia flagi dla Iskry (Hala główna · boks 1), Groma (Hala nowa · boks 1) i Luny, z godzinami, oraz zmienia plan karmienia (pozycja z „namoczyć” i ile). Klient widzi flagę, a tablet pokazuje pop-up: tablet Hala główna · boks 1 tylko dla Iskry, tablet Hala nowa · boks 1 tylko dla Groma. Flaga Luny bez boksu nie trafia na żaden tablet.
   - [ ] Klient bez dostępu do konia dostaje odmowę.
8. **A-08 Wyświetlacz z dwiema halami.**
   - [ ] Hala główna: 7 koni, 1 wolny boks (3), 1 flaga krytyczna. Hala nowa: 5 koni, 1 wolny boks (6), 1 flaga niepotwierdzona. Każdy kafel ma halę przy numerze.
   - [ ] Kafle bez posiłków per koń: flagi z godzinami („06:00–10:00”, „od 14:30”, „od 16:00”), „Ogarnięte HH:MM” i padok z godzinami. Tylko kafel Hala nowa · boks 5 ma „Poidło ręczne · woda 06:55”; pozostałe kafle nie mają znacznika wody. Nagłówek Hali głównej: „Śniadanie podane 06:40 · padok 10:00”. Zadania tylko jednorazowe.
   - [ ] Pełny ekran hali pokazuje tylko flagi tej hali. Przełącznik hal zmienia halę bez wracania do widoku ogólnego. „Wszystkie hale” wraca do widoku ogólnego. Wybór przetrwa restart i zanik prądu (W-29).
   - [ ] Nowa hala dodana w panelu pojawia się najpóźniej po 10 s, a tablety mają nową zakładkę w „Zmień boks” (A-11).
   - [ ] Na ekranie nie ma danych osobowych.
9. **A-09 Noc zmiany czasu (symulacja).** Śniadanie zostaje o 06:30 czasu lokalnego. Flaga „Derka: zakładać” 16:00–08:00 z 24.10 na 25.10 kończy się o 08:00 czasu lokalnego, choć okno trwa 17 h. „Bez śniadania” 06:00–10:00 z 25.10 wstrzymuje śniadanie 06:30, a „Podano śniadanie” zapisuje się z właściwą `service_date`. Eskalacje nie przesuwają się o godzinę.
10. **A-10 Ten sam numer w dwóch halach (boks 4).**
    - [ ] Tablety na Hala główna · boks 4 (Sonata) i Hala nowa · boks 4 (Bella), oba wybrane przez „Zmień boks”: zakładka hali, potem boks 4.
    - [ ] Anna ustawia flagę dla Belli: pop-up pojawia się tylko na tablecie Hala nowa · boks 4. „Derka: zakładać” Sonaty (dziś 16:00 – jutro 08:00, potwierdzona 07:05) jest tylko na tablecie Hala główna · boks 4, jako „od 16:00”.
    - [ ] POTWIERDZAM na tym tablecie: `flag_acknowledgements.box_id` to id boksu 4 Hali nowej.
    - [ ] „OGARNIĘTE” z tabletu Hala główna · boks 4 zapisuje się dla boksu 4 Hali głównej; historia boksu 4 Hali nowej go nie ma.
    - [ ] Apka, panel i wyświetlacz pokazują oba boksy zawsze z halą; wyszukanie „4” w panelu zwraca dwa boksy.
    - [ ] Na tablecie Hala główna · boks 4 „Zmień boks” bez wyboru wraca po 30 s do Hala główna · boks 4, a nie do boksu 4 drugiej hali.
11. **A-11 Dodanie hali w panelu.**
    - [ ] Admin w Boksy i konie → „Dodaj halę” podaje nazwę i adres (skopiowany z Hali nowej i poprawiony) i dodaje boksy 1–4. Hala i boksy zapisują się w jednej transakcji z wpisem audytu.
    - [ ] Numery 1–4 powtarzają się z obiema halami bez błędu. Adres nowej hali widać w panelu przy hali i w szczegółach jej boksów.
    - [ ] Najpóźniej po 10 s nowa hala ma sekcję na wyświetlaczu i zakładkę w „Zmień boks” na tabletach; telewizor na pełnym ekranie innej hali zostaje na swojej hali.
    - [ ] Drugi wariant: pusta hala, potem przeniesienie do niej wolnego Hala nowa · boks 6. Boks zachowuje `id` i historię (Wicher do 01.10); tablet z tym boksem pokazuje nową halę w nagłówku.
    - [ ] Usunięcie hali z boksami jest odrzucane; po przeniesieniu boksów z powrotem pustą halę da się usunąć albo wyłączyć.
    - [ ] Hali nie doda nikt poza adminem (403).
12. **A-12 Godziny flag i Derka.**
    - [ ] O 07:15 tablet Hala główna · boks 7 pokazuje „BEZ ŚNIADANIA · 06:00–10:00” i „Później: Nie na padok od 14:30 (kowal 15:00)”. Flaga wstrzymuje tylko śniadanie 06:30, a nie obiad 12:00 ani kolację 18:00; padok B Kasztana jest skrócony do 10:00–14:30, czyli między wetem o 08:00 a kowalem o 15:00.
    - [ ] Flaga bez `valid_to` albo z końcem przed początkiem jest odrzucana (422, propozycja); wariantu „do odwołania” nie ma.
    - [ ] Ewa K. (klientka Sonaty) o 06:50 wybiera kafelek „Derka”: podpowiedź 16:00–08:00 i wybór „zakładać / nie zakładać”; zapis z `variant = on` i `author_role = client`, notatka „przymrozek w nocy”. Pop-up na tablecie Hala główna · boks 4, potwierdzenie jak przy innych flagach: „potwierdzona 07:05”.
    - [ ] O 07:15 tablet, apka i wyświetlacz pokazują „Derka: zakładać · od 16:00”, a od 16:00 „Derka: zakładać · 16:00–08:00”; jutro o 08:00 flaga kończy się sama. `ack_deadline_at`, `warn_at` i `notify_at` liczą się od początku okna.
13. **A-13 Szybkie akcje obsługi.**
    - [ ] ListaDnia Oli o 07:15: na górze „Szybkie akcje” per hala. „Podano śniadanie” zrobione (✓ 06:40 Hala główna z pominiętym Kasztanem, ✓ 06:50 Hala nowa bez pominięć), z „Cofnij”. „Wyprowadzono na padok” jako następne o 10:00, z liczbą koni (Hala główna 4: Dukat, Sonata, Fala, Kasztan; Hala nowa 3: Grom, Bursztyn, Rumba) i pominiętą Bellą. „Ogarnięte” 7 z 14. „Wymaga potwierdzenia” ma tylko flagi. Listy karmienia per koń nie ma.
    - [ ] Piotr otwiera siatkę „Ogarnięte” Hali głównej, zaznacza boksy 4, 6 i 8 i zapisuje jednym przyciskiem: trzy wpisy `box_care_events` (`kind = tidy`) z Piotrem jako autorem, licznik 10 z 14; tablet Hala główna · boks 4 pokazuje „✓ dziś HH:MM” przy najbliższym odpytaniu.
    - [ ] Na tablecie Hala główna · boks 7 ktoś stuka „OGARNIĘTE” drugi raz tego dnia: nowy wpis bez autora (`source = tablet`), „Ogarnięte dziś” pokazuje nowszą godzinę, a MojBoks Anny ma oba wpisy.
    - [ ] O 10:00 Ola stuka „Wyprowadzono na padok” dla Hali nowej w apce: jeden wpis `building_routines` (`kind = paddock_out`) z Olą jako autorką, Bella wypisana jako pominięta. Drugi zapis tego dnia daje `already_done` (propozycja). „Cofnij” w ciągu godziny (propozycja) ustawia `cancelled_at` i przywraca stan „do zrobienia”; po godzinie daje 409.
    - [ ] Tablet Hala główna · boks 7 ma sekcję „SZYBKIE AKCJE” z trzema przyciskami: „OGARNIĘTE” (dziś 07:10), „ŚNIADANIE” (podane 06:40, potem obiad 12:00) i „PADOK” (B 10:00–14:30). O 10:00 ktoś stuka „PADOK”: jeden wpis „Wyprowadzono na padok” dla całej Hali głównej bez autora (`source = tablet`), obejmujący Dukata, Sonatę, Falę i Kasztana. ListaDnia Oli i tablet Hala główna · boks 4 (Sonata) pokazują stan przy najbliższym odpytaniu; „PADOK” stuknięty potem na tablecie Sonaty daje `already_done` (propozycja). Klient (MojBoks) i wyświetlacz tylko oglądają stan, bez przycisków.
    - [ ] W apce, na tablecie, w panelu i na wyświetlaczu nie ma siana i karmy jako zdarzeń ani posiłku odhaczanego per koń; nazwy pasz występują tylko w planie karmienia. Wody nie ma przy żadnym boksie z poidłem automatycznym (wyjątek: Hala nowa · boks 5, A-16).
14. **A-14 Zadania jednorazowe.**
    - [ ] Piotr w zakładce „Zadania” widzi: „Do wzięcia”: „Poidło w boksie 5 do wymiany” · Hala nowa · boks 5 (dodał Damian wczoraj 18:20); „Moje”: „Wymienić żarówkę w korytarzu” · Hala główna (wzięte 07:00); „Zrobione dziś”: „Przywieźć słomę z magazynu” (Ola 06:30). Przycisku „+ Dodaj zadanie” nie ma.
    - [ ] Piotr stuka „Biorę” przy pierwszym zadaniu (tylko online): zadanie przechodzi do „Moje” (`taken_by`, `taken_at`). Równoczesne „Biorę” Oli kończy się komunikatem, że zadanie wziął Piotr (409, propozycja).
    - [ ] „Zrobione” przy żarówce: `done_by`, `done_at`; zadanie jest w „Zrobione dziś” u obu osób.
    - [ ] Damian (admin) dodaje zadanie dla boksu; Ola (obsługa) nie może dodać zadania (403). Tablet zadań nie pokazuje (`board` nie zwraca ich dla tabletu). Zadań cyklicznych nie ma.
15. **A-15 Blokada ekranu tabletu (Hala główna · boks 7).**
    - [ ] Ktoś stuka kłódkę „Zablokuj ekran”: pasek „EKRAN ZABLOKOWANY · przytrzymaj kłódkę 3 s, aby odblokować”, przyciski z przerywaną ramką, treść dalej czytelna.
    - [ ] Wycieranie ekranu mokrą ścierką: żadnego zapisu (ani „Ogarnięte”, ani posiłku czy padoku hali, ani potwierdzenia), boks się nie zmienia, „Zmień boks” się nie otwiera.
    - [ ] Nowa flaga z apki: tablica się odświeża, a pop-up pojawia się mimo blokady; POTWIERDZAM działa dopiero po przytrzymaniu kłódki przez 3 s.
    - [ ] Bez odblokowania blokada schodzi sama po 10 min (propozycja). Blokowanie i odblokowanie nie wysyłają żadnego żądania; serwer o blokadzie nie wie.
16. **A-16 Poidło ręczne (Hala nowa · boks 5).**
    - [ ] O 07:15 tablet z wybranym Hala nowa · boks 5 (Bursztyn; wybrany przez „Zmień boks”, bo żaden z tabletów stanowiska nie stoi przy tym boksie) pokazuje „Poidło ręczne · woda 06:55” i przycisk „WODA”. Ten sam znacznik jest w apce (BoksyAdmin, BoksSzczegoly), w panelu i na wyświetlaczu. Wpis 06:55 ma `kind = water`, `source = tablet` i nie ma autora.
    - [ ] Piotr stuka „Woda” przy tym boksie w apce: nowy wpis z autorem, znacznik pokazuje nowszą godzinę. „Cofnij” w ciągu godziny (propozycja) przywraca „woda 06:55”.
    - [ ] Boksy z poidłem automatycznym (np. Hala nowa · boks 4, Hala główna · boks 7) nie mają znacznika wody ani przycisku „Woda” na tablecie, w apce, w panelu i na wyświetlaczu; „Woda” wysłana dla takiego boksu daje 409 (propozycja).
    - [ ] Zadanie „Poidło w boksie 5 do wymiany” jest w apce obsługi („Do wzięcia”), a na tablecie tego boksu go nie ma.
    - [ ] Przełącznik: po wymianie automatu Damian w BoksSzczegoly ustawia „Automatyczne poidło: tak”. Przy najbliższym odpytaniu znacznik i „Woda” znikają z tabletu, apki, panelu i wyświetlacza; wpisy `box_care_events` zostają w bazie, a audyt ma zmianę. Ola (obsługa) nie zmieni przełącznika (403). Nowy boks z „Dodaj halę” ma poidło automatyczne.
17. **A-17 Dwie stajnie: przełączenie stajni u Anny i u Oli.**
    - [ ] Anna (klientka w obu stajniach) o 07:15 w Stajni Pod Lipami widzi Kasztana i Bellę: kafelki z „Derką”, flagi ze statusem („potwierdzona 06:02”, Bella „niepotwierdzona”), plan karmienia z „namoczyć” i jazdy. Przełącza nagłówek na „Stajnia Brzozowa ▾” (MainBrzozowa): Kometa (boks 1, bez hali), „Bez śniadania 06:00–09:00 · dentysta o 8:30” bez statusu, z „obowiązuje od razu”, oraz „Ogarnięte dziś 07:00 · śniadanie pominięte: flaga”. Kafelki: Bez śniadania, Bez kolacji, Nie na padok, Wet, Leki, Inna flaga, bez „Derki”. Karta Komety nie ma planu karmienia ani jazd. Powrót do Pod Lipami przywraca poprzedni widok, bez ponownego logowania.
    - [ ] Ola (obsługa w obu stajniach) w Pod Lipami ma ListaDnia jak w A-13: „Szybkie akcje” per hala z padokiem, „Wymaga potwierdzenia” z Bellą, skrót zadań i zakładka „Zadania”. Po przełączeniu na Stajnię Brzozową (ListaDniaBrzozowa): „Podano śniadanie” ✓ 06:35 · Paweł z pominiętą Kometą i „Ogarnięte 3 z 6” (boksy 1, 2, 4), bez padoku; bez sekcji „Wymaga potwierdzenia”; „Flagi dziś” (Kometa, Lord) bez statusu; bez namaczania; bez zakładki „Zadania”; bez hali przy numerze.
    - [ ] Tablet boksu 1 Stajni Brzozowej (TabletBoksBrzozowa) jest zalogowany kontem „Tablety Brzozowa” i nie zmienia stajni: „Zmień boks” ma tylko boksy 1–6 Brzozowej, a tablety Pod Lipami nie widzą Komety. Nagłówek „BOKS 1 · KOMETA” bez hali, baner „BEZ ŚNIADANIA · 06:00–09:00 · dentysta o 8:30” bez plakietki „POTWIERDZONA”, „SZYBKIE AKCJE” tylko „OGARNIĘTE” (dziś 07:00) i „ŚNIADANIE” (podane 06:35), bez „PADOK”, karmienie bez „NAMOCZYĆ”. Tablet Hala główna · boks 7 w Pod Lipami w tym samym czasie ma trzy przyciski i „NAMOCZYĆ”.
    - [ ] Dane się nie mieszają: w Stajni Brzozowej Anna nie widzi Kasztana ani Belli, a Ola nie widzi koni Pod Lipami. Flaga ustawiona przez Olę w Stajni Brzozowej ma `requires_ack = false`, a w Pod Lipami `true`. Zapis z kolejki apki trafia do stajni, w której powstał, także gdy Ola w międzyczasie przełączy stajnię.
18. **A-18 Flaga bez potwierdzeń (Stajnia Brzozowa · boks 1, Kometa).**
    - [ ] O 05:50 Anna wybiera kafelek „Bez śniadania”, zmienia podpowiedziane godziny na 06:00–09:00 i dopisuje „dentysta o 8:30”. Zapis ma `requires_ack = false` i puste `ack_deadline_at`, `warn_at` i `notify_at`.
    - [ ] Tablet boksu 1 (konto „Tablety Brzozowa”) przy najbliższym odpytaniu (przed 06:00) pokazuje flagę bez pop-upu, bez POTWIERDZAM i bez plakietki jako „Później: Bez śniadania od 06:00”, a od 06:00 w banerze „BEZ ŚNIADANIA · 06:00–09:00 · dentysta o 8:30” z „obowiązuje od razu”. W tabeli karmienia poranny owies i siano są „WSTRZYMANE”.
    - [ ] U Anny flaga nie ma statusu oczekiwania. U Oli i Pawła nie ma sekcji „Wymaga potwierdzenia”. Nikt nie dostaje eskalacji (zero wierszy `flag_escalations`, zero powiadomień), także po czasie, po którym flaga w Pod Lipami byłaby „niepotwierdzona”. Potwierdzenie wysłane wprost przez API daje `409 ack_not_required` (propozycja).
    - [ ] O 06:35 Paweł stuka w apce „Podano śniadanie”: jeden wpis dla całej stajni, Kometa pominięta („bez Komety: flaga”), choć nikt flagi nie potwierdzał. Tablet boksu 1 pokazuje „ŚNIADANIE · podane 06:35 · potem obiad 12:00”, a o 07:15 „OSTATNIE AKCJE” to dokładnie 5 wpisów: 07:00 Ogarnięte; 06:35 Podano śniadanie (bez Komety: flaga) · Paweł; 05:50 nowa flaga „Bez śniadania” · Anna; wczoraj 18:00 Podano kolację · Paweł; wczoraj 16:30 Ogarnięte · Paweł.
    - [ ] „Leki rano” Lorda (Paweł, 06:00–09:00) też obowiązuje od razu, bez statusu. O 09:00 obie flagi kończą się same.
19. **A-19 Wyłączenie Derki i innych usług (Stajnia Pod Lipami).**
    - [ ] Damian w „Ustawieniach stajni” (PanelUstawieniaStajni) wyłącza „Derki” i zapisuje. Przy najbliższym odpytaniu kafelek „Derka” znika u klientów (Main i SzybkaFlaga Ewy K. i Anny) i u obsługi (StajennyKonie); flaga z szablonu `derka` wysłana przez API daje `409 option_disabled` (propozycja). Trwająca „Derka: zakładać” Sonaty (od 16:00): zachowanie według decyzji 48 z sekcji 5 (propozycja: obowiązuje do końca okna i dalej jest na tablecie Hala główna · boks 4 i w apce, znika tylko kafelek). Po ponownym włączeniu kafelek wraca.
    - [ ] Damian wyłącza moczenie paszy: „NAMOCZYĆ” znika z tabletu Kasztana (wysłodki) i z KartaKonia; pozycje planu z `soak` zostają w bazie i wracają po włączeniu.
    - [ ] Damian wyłącza przycisk „Padok”: „PADOK” znika z „SZYBKICH AKCJI” tabletów hali i z ListaDnia razem ze stanem, a plan padoku (godziny i towarzysze, np. „B 10:00–14:30 z Falą i Rumbą”) znika też z wyświetlacza, KartaKonia i Main („padok do 14:30” przy Kasztanie), bo stajnia nie prowadzi wtedy padoków w aplikacji [erd]. Flaga „Nie na padok” Kasztana (14:30–16:00, „Kowal o 15:00”) zostaje. „Wyprowadzono na padok” z apki i z tabletu daje `409 option_disabled` (propozycja). Wczorajszy wpis 10:05 zostaje w Historii MojBoks Anny (z „Ostatnio” znika), bo wpisy już zapisane zostają w historii [erd]. Po włączeniu przycisk i plan padoku wracają.
    - [ ] Damian wyłącza wszystkie trzy szybkie przyciski: „Ogarnięte”, posiłek i „Padok” (makiety wariantu z sufiksem BezAkcji; PanelUstawieniaBezAkcji). Przy najbliższym odpytaniu znika każdy przycisk razem ze stanem wykonania („Ogarnięte 07:10”, „podane 06:40”, licznik 7 z 14, „Cofnij”) i plan padoku [erd]:
      - klient: Main (MainBezAkcji) bez skrótu z przycisków, MojBoks (MojBoksBezAkcji) bez „Ostatnio”, KartaKonia (KartaKoniaBezAkcji) bez padoku w „Dziś”;
      - obsługa: ListaDnia (ListaDniaBezAkcji) bez „Szybkich akcji”, BoksyAdmin (BoksyAdminBezAkcji) bez „Ogarnięte …”; zapis każdej z trzech akcji z apki i z tabletu daje `409 option_disabled` (propozycja);
      - tablet Hala główna · boks 7 (TabletBoksBezAkcji): bez „SZYBKIE AKCJE”, baner flagi i KARMIENIE bez zmian;
      - wyświetlacz, pełny ekran Hali nowej (WyswietlaczHalaBezAkcji): kafle bez „Ogarnięte” i padoku, nagłówek hali bez rutyny, „Dziś w stajni” tylko z godzinami posiłków;
      - panel (PanelBoksyBezAkcji): bez kolumny „Ostatnio ogarnięte”, w karcie „Przyciski obsługi” tylko „Woda” z linkiem do ustawień stajni.

      Zostają flagi i potwierdzenia (Bella „niepotwierdzona” z eskalacją, „Nie na padok” Kasztana 14:30–16:00), plan karmienia z WSTRZYMANE i „NAMOCZYĆ” (osobna funkcja), godziny posiłków jako plan („Następny posiłek: obiad 12:00”), wizyty (wet 08:00, kowal 15:00), zadania oraz „Woda” przy Hala nowa · boks 5 („Poidło ręczne · woda 06:55”, „WODA” na jego tablecie), bo „Woda” nie ma przełącznika. Wpisy zapisane przed wyłączeniem zostają w „Historii” (apka, panel), ale „OSTATNIE AKCJE” tabletu, „Ostatnie akcje” wyświetlacza i „Ostatnio” w apce pomijają zdarzenia wyłączonych przycisków [erd]. Makiety pokazują stajnię, która tych przycisków nie używa (wariant seedu z 3.2), więc „Historia” Kasztana i „OSTATNIE AKCJE” jego tabletu to tylko 4 zdarzenia flag z dziś (06:02 dwa potwierdzenia, 03:16 i 03:14 nowe flagi · Anna), a ostatnie akcje Hali nowej na wyświetlaczu to 06:55 Woda · boks 5 i 01:20 nowa flaga Belli; zrzuty porównujemy z makietami na seedzie wariantu bez zdarzeń z tych przycisków (propozycja). Po włączeniu przyciski, ich stan i plan padoku wracają.
    - [ ] Ola (obsługa) i Ewa K. (klientka) nie mają ekranu „Ustawienia stajni”, a API daje im 403; Paweł (obsługa tylko w Brzozowej) dostaje 404 dla ustawień Stajni Pod Lipami. Zmiany w Pod Lipami nie zmieniają Stajni Brzozowej. Każda zmiana ma wpis audytu.
20. **A-20 Zmiana przełącznika potwierdzeń nie zmienia trwających flag.**
    - [ ] Stajnia Pod Lipami, 07:20: Damian wyłącza „Flagi wymagają potwierdzenia”. Flaga Belli (`requires_ack = true`) dalej jest „niepotwierdzona”, dalej ma pop-up na tablecie Hala nowa · boks 4 i jest w „Wymaga potwierdzenia”, a `escalation-scheduler` dalej ją eskaluje; TV (pasek pilnych, pełny ekran Hali nowej) i alert w panelu dalej pokazują Bellę jako niepotwierdzoną; potwierdzone flagi Kasztana zachowują „potwierdzona 06:02”.
    - [ ] O 07:25 Ola ustawia flagę dla Iskry (Hala główna · boks 1): `requires_ack = false`, obowiązuje od razu, bez pop-upu na tablecie i bez statusu u Karoliny W.
    - [ ] O 07:30 Damian włącza potwierdzenia z powrotem: flaga Iskry zostaje bez statusu i bez eskalacji; nowa flaga dla Groma (Hala nowa · boks 1) daje pop-up i „niepotwierdzona” do potwierdzenia.
    - [ ] Stajnia Brzozowa: Damian (admin konta) włącza potwierdzenia. Flaga Komety zostaje „obowiązuje od razu”, bez statusu i eskalacji; nowa flaga dla Lorda (boks 4) daje pop-up na tablecie i status „niepotwierdzona”. Po teście Damian wyłącza potwierdzenia (stan z seedu). Paweł (obsługa) nie ma ekranu „Ustawienia stajni” (403).
21. **A-21 Macierz widoczności per rola.**
    - [ ] W obu stajniach każda rola widzi w apce, panelu, na tablecie i na wyświetlaczu tylko funkcje zaznaczone w macierzy z seedu:
      - klient: w Pod Lipami Anna ma flagi, plan karmienia (KartaKonia), stan szybkich akcji, historię boksu (MojBoks), zdrowie (wet 08:00, kowal 15:00) i jazdy, bez zadań; w Stajni Brzozowej bez planu karmienia i jazd;
      - obsługa: Ola w Pod Lipami ma wszystko, z zadaniami; w Stajni Brzozowej (Ola i Paweł) bez zadań i jazd;
      - instruktor (Marta, w obu stajniach): flagi i jazdy (propozycja, jak na makietach);
      - wyświetlacz Pod Lipami: flagi, plan karmienia, szybkie akcje i ich stan, zadania, bez zdrowia i historii boksu; Stajnia Brzozowa wyświetlacza nie ma;
      - tablet: widoczność obsługi (propozycja, sekcja 5);
      - admin konta firmy (Damian, w obu stajniach): wszystko, niezależnie od macierzy.
    - [ ] Damian odznacza klientowi „Plan karmienia”: przy najbliższym odpytaniu KartaKonia Anny w Pod Lipami nie ma planu, a trasa planu daje jej 403 (propozycja); po zaznaczeniu plan wraca. Zaznaczenie klientowi „Zadania” pokazuje Annie listę zadań, ale „Biorę” dalej daje 403, bo widoczność nie dodaje uprawnień (propozycja).
    - [ ] Ustawienia Pod Lipami nie zmieniają widoku Anny i Oli w Stajni Brzozowej.
22. **A-22 Rejestracja konta firmy (Damian, retrospekcja z pn 07.09.2026).**
    - [ ] Damian w PanelLogowanie wybiera „Telefon”, dostaje kod SMS-em i loguje się (PanelLogowanieKod). Konto nie ma hasła.
    - [ ] PanelWitaj → PanelRejestracjaFirmy: „Stajnie Lipowe sp. z o.o.”, NIP 123-456-32-18, siedziba ul. Lipowa 12, 05-520 Konstancin-Jeziorna. Powstaje konto firmy, a Damian zostaje jego adminem. NIP zapisuje się jako 10 cyfr (propozycja).
    - [ ] PanelZalozStajnie, krok 1: Stajnia Pod Lipami bez pytania o NIP, działalność, języki tabletów i potwierdzenia flag. Hala główna z boksami 1–8: lista boksów pojawia się od razu po zakresie, „Ustaw dla wszystkich” ustawia poidło automatyczne.
    - [ ] PanelZalozPowiadomienia, krok 2: zdarzenia, odbiorcy (Admin, Obsługa stajni) i kanał SMS / e-mail; „Załóż stajnię” → PanelPulpitStart. W bazie stajnia, hala, boksy i `notification_rules` są zapisane razem; ustawienia stajni: wszystko włączone, z potwierdzeniami.
    - [ ] Inna osoba rejestruje konto firmy z NIP „1234563218”: dostaje „Ten NIP ma już konto w EQUENOR” (`409 tax_id_taken`, propozycja), nic się nie zapisuje, a konto Damiana się nie zmienia.
23. **A-23 Druga stajnia i dostęp per stajnia (Damian, czw 01.10.2026).**
    - [ ] Damian w panelu zakłada drugą stajnię (PanelZalozStajnie → PanelZalozPowiadomienia): Stajnia Brzozowa, ul. Brzozowa 5, 05-500 Piaseczno, jedna hala, boksy 1–6 z poidłem automatycznym. Nikt nie pyta o NIP ani o firmę: stajnia trafia do konta „Stajnie Lipowe sp. z o.o.”.
    - [ ] Damian od razu ma w nagłówku „▾” z obiema stajniami, bez przypisywania. Nowa stajnia ma wszystko włączone; Damian zmienia ustawienia na te z seedu (PanelUstawieniaBrzozowa).
    - [ ] Damian zaprasza Pawła SMS-em (PanelZaprosOsobe) jako Obsługę Stajni Brzozowej. Paweł po zalogowaniu widzi samą nazwę stajni, bez „▾”. Każdy obiekt Stajni Pod Lipami daje mu 404, a Piotrowi każdy obiekt Stajni Brzozowej.
    - [ ] Damian przypisuje Olę (obsługa Pod Lipami) także do Stajni Brzozowej. Przy najbliższym odświeżeniu Ola ma przełącznik stajni, bez ponownego logowania. Po odebraniu przypisania Brzozowa daje jej 404, a Pod Lipami działa bez zmian.
    - [ ] Admin drugiego konta firmy (fixture z innym NIP, propozycja) nie widzi żadnej stajni Damiana (404), a Damian jego stajni.
24. **A-24 Telewizor na koncie technicznym (Stajnia Pod Lipami).**
    - [ ] Damian w „Zaproś osobę” wybiera „Konto techniczne: Wyświetlacz” i kanał e-mail: tv.korytarz@stajnielipowe.pl, nazwa „Telewizor korytarz”. Osobnego formularza wyświetlacza nie ma.
    - [ ] Telewizor otwiera zwykłą stronę logowania panelu (WyswietlaczLogowanie): „Telefon | E-mail” → e-mail → WyswietlaczKod z kodem z e-maila. Ekran pokazuje adres tylko zamaskowany (t•••@stajnielipowe.pl); potem panel od razu pokazuje widok wszystkich hal (A-08), bo tak każe rola.
    - [ ] W Ludziach „Telewizor korytarz · konto techniczne · Wyświetlacz” jest w filtrze „Konta techniczne”. Blokada konta: przy najbliższym odpytaniu TV pokazuje „Wyświetlacz zablokowany” (WyswietlaczZablokowany), bez starych flag; odblokowanie w panelu → Ludzie.
    - [ ] Każdy zapis tym kontem daje 403; odpowiedzi nie mają danych osobowych. Stajnia Brzozowa nie ma wyświetlacza.
25. **A-25 Konto techniczne tabletów i język tablicy.**
    - [ ] Damian w „Zaproś osobę” wybiera „Konto techniczne: Tablet przy boksie” i kanał e-mail: boksy@stajnielipowe.pl, nazwa „Tablety Pod Lipami” (propozycja). W Ludziach „Tablety Pod Lipami · konto techniczne · Tablet” jest w filtrze „Konta techniczne”.
    - [ ] Tablet Hala nowa · boks 5 loguje się tym kontem przez „TELEFON | E-MAIL”: e-mail i kod z e-maila. Po kodzie od razu TabletPierwszyBoks z zakładkami hal, bez wyboru stajni; w ukrytych ustawieniach KONTO „Tablety Pod Lipami · konto techniczne”; tablica nie pokazuje konta. Konto Oli na tablecie dostaje TabletBrakUprawnien, a wylogowanie Oli ze wszystkich urządzeń nie dotyka tabletów.
    - [ ] Zgubiony tablet (propozycja): Damian w Ludziach blokuje „Tablety Pod Lipami”. Przy najbliższym odpytaniu wszystkie tablety stajni pokazują ekran logowania, bez starych flag. Po odblokowaniu pozostałe tablety logują się ponownie kodem i wracają do swoich boksów i języka; zapisy z zablokowanego konta dają 403.
    - [ ] W ukrytych ustawieniach tego tabletu ktoś wybiera język UA: tablica jest po ukraińsku (pory posiłków z etykiet `*_labels`, gdy są), a tablet Hala główna · boks 7 dalej po polsku. Język zostaje po restarcie i ponownym logowaniu; serwer o nim nie wie, a stajnia nie ma ustawienia języków.

### 4.5 Stanowisko testowe i kryteria gotowości do wdrożenia

**Zestaw domowy (minimalny, przed stanowiskiem)**
- Sprzęt (sekcja 1):
  - 1× Boox Note Air6 C (kolorowy 10,3", Android 16) z zasilaczem USB-C PD 20–30 W;
  - Raspberry Pi 5 4 GB z oficjalnym zasilaczem 27 W, obudową z wentylatorem, microSD 64 GB A2 i kablem micro-HDMI → HDMI;
  - własne: TV albo monitor z HDMI, domowe Wi-Fi, własny telefon (SMS), własna skrzynka e-mail (kody e-mailem, adres zweryfikowany w sandboxie SES), klawiatura i mysz USB.
- Co tu przechodzi:
  - bramka tabletu (punkty (B) z 4.3.1) i pozostałe testy T-xx na jednej sztuce, z paletą `t-*` w profilu właściwym dla ekranu; cykle zasilania (T-08) ręcznie wtyczką zasilacza, dopóki nie ma przekaźników, a testy wymagające komory albo dwóch AP (T-14, T-22) dopiero na stanowisku;
  - T-20, T-21 i K-01…K-05, K-07 w kolorze, a wariant czarno-biały (K-06) tylko na zrzutach przeliczonych na szarość;
  - T-28 i A-10 z jednym tabletem: drugim tabletem jest emulator albo skrypt odpytujący `board` z `X-Box-Id` drugiego boksu (propozycja); boks 4 obu hal wybiera się przez „Zmień boks”;
  - A-17 i A-18 na tablecie: tablet zalogowany kontem „Tablety Brzozowa” (boks 1) albo emulator (propozycja);
  - testy W na własnym TV albo monitorze, w tym W-29 (pełny ekran hali po restarcie); testy porównawcze (NVMe, obudowa pasywna, drugi telewizor) dopiero na stanowisku;
  - SMS OTP na własnym telefonie i e-mail OTP na własnej skrzynce (także logowanie TV e-mailem); pełna lista sieci z 1.4 i skrzynek z 4.1 dopiero na stanowisku.
- Dokupić tylko, jeśli coś nie zadziała:
  - Samsung Galaxy Tab Active5, gdy T-01 albo T-02 nie przejdą na Boox: wzorzec Device Owner i plan B;
  - Boox Go 10.3 Gen II Lumi do testu prawdziwego czarno-białego ekranu (K-06, T-20, T-21).

**Stanowisko testowe**
- Ściana „korytarza” z 4 tabletami wybranego modelu (kolorowego albo czarno-białego) w konfiguracji produkcyjnej, w prototypowych obudowach, ze znacznikami 1,5 i 2 m i ściemnianą lampą. Tablety stoją na boksach z seedu: Hala główna · boks 4 i boks 7, Hala nowa · boks 4 i wolny boks 6, więc ten sam numer boksu występuje na ścianie dwa razy (A-10). Obok drugi model, jeśli bramkę przeszły dwa, w pracy ciągłej, tablet do testów niszczących w komorze i sztuka deweloperska.
- Dwa telewizory z Raspberry Pi: jeden pokazuje wszystkie hale, drugi pełny ekran Hali nowej. Obok kanarek.
- Osobne Wi-Fi z dwoma AP, most z `netem`, możliwość odcięcia WAN.
- Przekaźniki na każdym urządzeniu i na AP. Skrypty scenariuszy awarii uruchamiane według harmonogramu, także w nocy.
- Kamery i rejestratory.
- Telefony z kartami różnych sieci i modem SMS.
- Środowisko testowe z seedem obu stajni (Stajnia Pod Lipami i Stajnia Brzozowa, różne ustawienia); k6 symuluje pozostałe tablety i stajnie. Do A-17 i A-18 jeden tablet stanowiska logujemy kontem „Tablety Brzozowa”, boks 1 (propozycja).
- Dziennik testów: każda interwencja ręczna, każdy zawieszony ekran, każdy „duch” i wynik każdego cyklu zasilania.

**Etapy:** bramka (1–2 tygodnie, punkty B oraz K-01 i K-05, w zestawie domowym), stanowisko (co najmniej 28 dni, całe 4.3 i 4.4, równolegle obciążenie z 4.1), stajnia pilotażowa (4–6 tygodni, prawdziwa obsługa w rękawicach, przećwiczona zmiana Wi-Fi, oględziny obudów).

**Wymagania wobec stajni pilotażowej** (zapewnia stajnia, my mierzymy):
- przy każdym boksie z tabletem: gniazdo 230 V z zasilaczem USB-C PD ≥ 20 W albo PoE+ z wydzieloną mocą ok. 25 W, jeśli taki wariant zostanie wybrany; kabel o ustalonej długości poza zasięgiem konia;
- RSSI i SNR w miejscu tabletu mierzone na samym tablecie, w obudowie;
- pasmo zgodne z wynikiem T-13;
- osobny SSID albo zgoda na dodanie urządzeń; brak portalu logowania; ruch wychodzący na port 443;
- przy telewizorze: gniazdo 230 V, a jeśli się da, gniazdo Ethernet;
- znana temperatura w miejscach montażu, z informacją, czy hale są ogrzewane;
- informacja, jak sprząta się korytarz i myje tablety (woda, myjka, środki dezynfekujące), bo od tego zależą klasa IP i to, jak często obsługa używa blokady ekranu (T-30, A-15);
- 230 V przy boksach montuje tylko elektryk z uprawnieniami ([IEC 60364-7-705](https://vde-verlag.de/iec-normen/212877/iec-60364-7-705-2006.html)); wymagania normy [niepotwierdzone].

**Kryteria gotowości do wdrożenia**
- [ ] **CI zielone:**
  - testy jednostkowe i integracyjne;
  - kontrakty API, zdarzeń i bazy;
  - bramka zakazanych obiektów;
  - migracje N-1 → N;
  - pełna macierz izolacji (stajnie bez dostępu i drugie konto firmy), bez żadnej trasy bez testu.
- [ ] Test obciążenia w docelowej skali przeszedł, a wyniki są zapisane jako linia bazowa.
- [ ] Wszystkie scenariusze A-01…A-25 przechodzą automatycznie i na stanowisku (z seedem obu stajni i fixture'em drugiego konta firmy); w stajni pilotażowej A-01…A-16 oraz te części A-17…A-25, które pasują do jej ustawień (propozycja).
- [ ] **Tablet:**
  - 100% autostartów do Lock Task w serii cykli zasilania;
  - 100% aktualizacji APK udanych albo bezpiecznie przerwanych;
  - zero wyjść z kiosku;
  - zero „duchów” odwołanej flagi, także kolorowych śladów pól `t-*`;
  - pola `t-*` czytelne z 1,5 i 2 m, a statusy rozróżnialne bez koloru (kolejność jasności zachowana na ekranie wybranego modelu, kolorowego albo czarno-białego);
  - „Zmień boks” wraca do poprzedniego boksu po 30 s bez wyboru, a zapisy z tabletu trafiają do `id` wybranego boksu także przy tych samych numerach w dwóch halach;
  - mycie i wycieranie zablokowanego ekranu w stajni pilotażowej nie daje żadnego przypadkowego zapisu ani zmiany boksu (T-30, A-15);
  - zero interwencji ręcznych w ostatnich 2 tygodniach testu ciągłego;
  - pamięć bez rosnącego trendu;
  - bateria bez puchnięcia;
  - temperatura w obudowie w zakresie producenta;
  - opóźnienie flagi w p95 i trafność dotyku w rękawicach w ustalonych progach;
  - działa w najniższej temperaturze zanotowanej w hali pilotażowej.
- [ ] Wyświetlacz pracuje tygodniami bez interwencji, po zaniku prądu sam wraca do zapamiętanego widoku (wszystkie hale albo pełny ekran hali, na którym są tylko flagi tej hali) i nie ma śladów retencji.
- [ ] SMS OTP dochodzi we wszystkich testowanych sieciach, a e-mail OTP do testowanych skrzynek, w ustalonym czasie. Odzyskiwanie dostępu działa. Global sign-out i blokada konta odbierają dostęp w zmierzonym czasie.
- [ ] Eskalacja działa przy martwym tablecie (A-02). Dla flag z `requires_ack` (w stajni, która wymaga potwierdzeń) to jedyne zabezpieczenie, bo stanu tabletów nie śledzimy; flaga zapisana w stajni bez potwierdzeń (zależy od ustawień stajni) obowiązuje od razu i nie eskaluje (A-18), a trwająca niepotwierdzona flaga eskaluje także po wyłączeniu przełącznika (A-20).
- [ ] Zmiana czasu przeszła bez błędów, w symulacji albo na stanowisku.
- [ ] **Przećwiczone runbooki:**
  - wymiana tabletu i jego provisioning;
  - odzyskanie zablokowanego tabletu;
  - zgubiony tablet: blokada konta technicznego tabletów w Ludziach, odblokowanie i ponowne logowanie pozostałych tabletów kodem (propozycja);
  - zmiana Wi-Fi w stajni;
  - ponowne logowanie tabletu i telewizora (telefonem albo e-mailem i kodem);
  - cofnięcie wydania APK;
  - redrive z DLQ;
  - odtworzenie bazy (po stronie platformy).
- [ ] Alerty działają: niepusta DLQ, nieudany cron, opóźniona eskalacja, 5xx w `board`.
- [ ] Zatwierdzona para model tabletu + firmware, z zablokowanym aktualizatorem producenta, oraz profil palety `t-*` dla tego modelu.

## 5. Decyzje do podjęcia przed startem

**Rozstrzygnięte 13.10.2026** (decyzje właściciela produktu; mają pierwszeństwo przed wcześniejszymi propozycjami)
- **Logowanie i e-mail.** Oprócz telefonów obsługujemy e-maile: logowanie w apce, panelu, na tablecie i TV numerem telefonu albo e-mailem, kod SMS-em albo e-mailem (`SMS_OTP`, `EMAIL_OTP`, e-maile przez SES), konta bez hasła; zaproszenia SMS-em albo e-mailem (2.4, 2.6, 3.5). TOTP bez zmian, dalej otwarte (pkt 1).
- **Tylko B2B.** Konto to konto firmy z NIP; jedno konto, jeden NIP. NIP podaje się raz, przy rejestracji (PanelRejestracjaFirmy), jako zwykłe pole formularza, bez objaśnień; „Ten NIP ma już konto w EQUENOR” tylko jako błąd. „Załóż stajnię” nie pyta o NIP ani o działalność (3.3 `stable`).
- **Admin konta firmy.** Admin ma dostęp do wszystkich stajni firmy, także nowych, bez przypisywania. Pozostałe role przypisuje się per stajnia; jedna osoba może mieć kilka stajni (3.1.9, 3.3 `access`). Zaproszenie dopasowuje się samo po zalogowaniu: PanelWitaj bez „Czekasz na zaproszenie?”, BrakDostepu bez próśb do admina i bez numeru (3.5.1, 3.5.3).
- **Telewizor.** Konto techniczne z rolą Wyświetlacz, telefon albo e-mail i kod, zaproszenie przez „Zaproś osobę” → „Konto techniczne: Wyświetlacz”; bez osobnego formularza (pkt 3). Telewizor otwiera zwykłą stronę logowania panelu, bez osobnego adresu; strona nie rozpoznaje urządzenia, a po zalogowaniu panel pokazuje widok tablicy według roli. W Ludziach zwykły wiersz w filtrze „Konta techniczne”, bez instrukcji podłączania. Wybór widoku dalej pamięta przeglądarka (3.5.4).
- **Interfejs bez objaśnień.** Zostają etykiety, wartości, przyciski i komunikaty stanu; zdania objaśniające i dopiski znikają (3.5).
- **Język tablicy per tablet.** Bez języków na poziomie stajni (bez `stable_locales`); tłumaczenia nazw zostają jako opcjonalne etykiety (3.5.2).
- **Tablet na koncie technicznym.** Tablet loguje się kontem technicznym z rolą Tablet (jedno na stajnię, propozycja), nie kontem osoby. Konto ma jedną stajnię, więc po zalogowaniu od razu wybór boksu, bez wyboru stajni (3.5.2, pkt 5).
- **Wsparcie IT poza stajnią.** Zespół EQUENOR, nie rola stajni: znika z zaproszeń, macierzy widoczności, listy członków i apki; zostaje dostęp do ukrytych ustawień i diagnostyki tabletu oraz diagnostyki w panelu (operator, pkt 8, propozycja). Czy rola w ogóle zostaje: do potwierdzenia.
- **Boksy z ustawieniami przy tworzeniu** (Załóż stajnię, „Dodaj halę”): lista boksów z numerem, poidłem i „Więcej ustawień ›”, akcja „Ustaw dla wszystkich” (3.3 `stable`).
- **Zakładanie stajni w 2 krokach.** Krok 1 bez pytania o potwierdzenia flag (nowa stajnia ma wszystko włączone, także potwierdzenia), krok 2 powiadomienia: zdarzenia, odbiorcy, kanał SMS albo e-mail (`notification_rules`).
- **Strona www przed logowaniem:** sama prezentacja, bez bloga i CMS (3.5.5, pkt 51).

**Blokują etap 1 (Cognito)**
1. **TOTP a logowanie bez hasła (SMS albo e-mail).** W Cognito oba wykluczają się dla tego samego użytkownika. Kto ma mieć TOTP i w jakim przepływie, np. tylko admin panelu z hasłem? Jak ma działać „Użyj aplikacji uwierzytelniającej” z makiety Logowanie? Nowe plansze logowania TOTP nie pokazują.
2. **Logowanie recenzentów Apple i Google.** Rozstrzygnięte (propozycja): recenzent nie odbierze SMS, więc loguje się na konto demo e-mailem i kodem z e-maila, tak samo jak inni użytkownicy, bez osobnego klienta i bez custom SMS sendera. Dostęp do skrzynki konta demo podajemy w notatce do recenzji. Czy Apple i Google akceptują kod z e-maila z udostępnionej skrzynki: [niepotwierdzone]; zapasem jest tryb demo uzgodniony z Apple.
3. **Konto `display`.** Rozstrzygnięte: telewizor loguje się kontem technicznym z rolą Wyświetlacz, telefonem albo e-mailem i kodem, tak samo jak wszędzie (w seedzie e-mailem). Konto zaprasza admin przez „Zaproś osobę”. Telewizor przy instalacji loguje osoba wdrażająca, a po wygaśnięciu sesji admin albo zespół EQUENOR (propozycja). Otwarte zostaje tylko zalecenie: jedno konto na kilka telewizorów czy osobne na każdy (erd.md dopuszcza oba).
4. **Czasy życia tokenów i rotacja dla klientów tabletu i web.** Decydują, jak szybko global sign-out i blokada konta zadziałają i jak często trzeba ponownie logować sprzęt na miejscu. Czas życia refresh tokenu ustawia się w Cognito per klient aplikacji, a strona nie rozpoznaje telewizora, więc TV ma czas sesji panelu. Do wyboru: (a) długa sesja panelu dla wszystkich, także przeglądarek adminów; (b) zwykła sesja panelu i ponowne logowanie TV co N dni.
5. **Global sign-out a tablety.** Rozstrzygnięte 13.10.2026: tablety logują się kontem technicznym tabletów (rola `tablet`, jedno na stajnię, propozycja), nie kontem osoby, więc wylogowanie osoby ich nie dotyka. Zgubiony tablet: admin blokuje konto techniczne tabletów w Ludziach (global sign-out i blokada w `stable_members`), odblokowuje je i loguje pozostałe tablety ponownie kodem (propozycja); skradziony czyta tablicę najwyżej przez czas życia access tokenu.

**Infrastruktura (Dawid)**

6. Regiony AWS i podział kont na środowiska; od tego zależy liczba wyjść z sandboxów.
7. Mechanizm poświadczeń z klastra do AWS; wpływa na ważność presigned URL.
8. Uwierzytelnianie serwis→serwis dla `/internal` oraz uwierzytelnianie i rola operatora (wydania APK, plany billingu, odczyt audytu, diagnostyka dla Wsparcia IT).
9. Kto pisze manifesty workloadów i w jakim formacie.
10. PostgreSQL: wersja, pooler, PITR. Do tego LocalStack w CI (warunki obrazu) albo konto dev AWS.
11. Narzędzie błędów i logów oraz ścieżka diagnostyki tabletu i Pi: publiczny endpoint uwierzytelniany tokenem konta technicznego albo SDK narzędzia, w obu przypadkach z buforem offline.
12. Keystore APK tabletu i jego kopia; build w EAS czy lokalnie; runnery macOS i KVM.
13. Środowisko stajni pilotażowej:
    - test, prod czy osobny pilot;
    - z jaką pulą Cognito;
    - czy SMS i SES są już poza sandboxem;
    - co dzieje się z danymi po wdrożeniu.
14. Zdalny dostęp do Pi (SSH, Raspberry Pi Connect albo inne narzędzie).
15. Sposób przechowywania tokenów w panelu i na wyświetlaczu: pamięć i storage przeglądarki albo cienki BFF z ciasteczkiem httpOnly.

**Zachowanie produktu, potrzebne developmentowi**

16. Czy koń bez boksu (Luna) jest widoczny na wyświetlaczu, a jeśli tak, to gdzie (propozycja: w osobnej sekcji obok sekcji hal, tylko w widoku wszystkich hal). Na pełnym ekranie hali go nie ma, bo nie należy do żadnej hali.
17. **„Cofnij” i blokada ekranu: czasy do potwierdzenia.** „Cofnij” szybkiej akcji obsługi działa przez godzinę od zapisu (`cancelled_at`, propozycja z erd.md pkt 3), a blokada ekranu tabletu sama schodzi po 10 min (propozycja z erd.md pkt 2). Oba czasy są do potwierdzenia; dane z pilotażu (T-30, A-13, A-15) pomogą w decyzji.
18. Wyświetlacz w nocy: praca całą dobę czy wygaszanie przez CEC. Od tego zależy klasa monitora (16/7 czy 24/7).
19. Tablet offline: kolejka zapisów (propozycja; wskazują na nią pola `time_quality` i `request_hash`) czy blokada akcji z komunikatem.
20. Brak makiet dla trzech stanów: wyświetlacz offline („dane z HH:MM”), stajnia `suspended`, odebrany dostęp. Trzeba ustalić ich wygląd.
21. `actor_id` w audycie dla akcji z tabletu (`actor_type = tablet`): `NULL` czy `box_id`. Nie `id` konta tabletów, bo akcje z tabletu nie mają autora (`source = tablet`) [erd]. Do tego: kto ma dostęp do odczytu audytu.
22. Złożone odczyty (lista dnia, historia boksu) w `board` (propozycja).
23. Zakładanie stajni: czy wystarczą idempotentne wywołania z ponowieniami i `stable.created`, czy potrzebny jest cron uzgadniający.
24. SMS z `notifications` (eskalacje, zaproszenia):
    - przez AWS, ze wspólnym limitem, Sender ID i protect configuration, czy przez innego dostawcę;
    - nazwa nadawcy;
    - czy dopuścić numery spoza Polski, np. +380.
25. Czy zakaz obiektów w bazie obejmuje widoki (`CREATE VIEW`).
26. Okresy retencji: audyt, `notifications`, pliki `deleted`, `payment_provider_events`.
27. Domyślne sloty posiłków i szablony flag dla nowej stajni (erd.md wymienia kody szablonów, w tym `derka`, ale nie ich domyślne okna godzin poza przykładami z makiet) oraz domyślna nazwa pierwszej hali, którą kod zakłada razem ze stajnią (adres bierze ze stajni [erd]). Kto dostaje `health-due-reminders`.
28. Parametry billingu potrzebne w kodzie: definicja metryki w `billing-usage-snapshot` (stan na koniec okresu czy maksimum w okresie) oraz to, czy `InvoiceSystem` w v1 ma prawdziwą integrację (KSeF 2.0). Zależy od otwartej kwestii pkt 47; do jej rozstrzygnięcia billing zostaje na fałszywych adapterach.
29. **Identyfikatory od nazwy EQUENOR.** Nazwa produktu jest ustalona (repozytorium nadal nazywa się KonskaAppka). Otwarta jest dokładna postać scope pakietów, bundle ID, `applicationId` i nazw w sklepach. Bundle ID i `applicationId` są nieodwracalne, więc muszą zapaść przed założeniem rekordów.
30. Kto może zmienić sieć Wi-Fi na tabletach przez ukryte ustawienia (np. Wsparcie IT z zespołu EQUENOR), jak się przy tym uwierzytelnia i kto zna hasło.
31. **Założenia tabletu do potwierdzenia** [erd, pkt 2]:
    - na tablecie jest zalogowane jedno konto naraz (pilnuje apka);
    - boks może zmienić każdy, kto stoi przy tablecie („Zmień boks” bez dodatkowego uwierzytelnienia);
    - ustawienia tabletu otwiera się dłuższym przytrzymaniem;
    - po wylogowaniu tablet pamięta wybrany boks i wraca do niego po kolejnym logowaniu.
32. **Zapamiętany boks albo hala, których nie da się pokazać.**
    - Co pokazuje tablet, gdy zapamiętany boks jest w wyłączonej hali (`active = false`) albo nowo zalogowane konto tabletów nie ma do niego dostępu (inna stajnia) (propozycja: tablet od razu otwiera listę „Zmień boks”, bez powrotu po 30 s).
    - Co pokazuje telewizor zapamiętany na pełnym ekranie hali, którą wyłączono albo usunięto (propozycja: wraca do widoku wszystkich hal).
    - Przeniesienie boksu do innej hali niczego tu nie zmienia, bo tablet pamięta `id` boksu, nie numer [erd].

**Parametry testów (progi go/no-go ustalić przed testem)**

33. Interwał odpytywania tabletu („kilka sekund”) i próg opóźnienia flagi w p95.
34. Minimalna trafność stuknięć w rękawicach.
35. Model obciążenia: liczba stajni, boksów i hal na stajnię, wyświetlaczy na stajnię, a wśród nich ile pokazuje wszystkie hale, a ile pełny ekran jednej hali.
36. Czas trwania pilotażu i to, czy musi objąć przymrozki.
37. Próg rozróżnialności statusów na ekranie tabletu (K-01, T-20): minimalna różnica jasności między sąsiednimi szczeblami drabiny (papier, OK, uwaga, krytyczna, atrament), zmierzona na zdjęciu z kartą szarości (propozycja). Paleta zakłada co najmniej 3 poziomy odstępu na 16; na sprzęcie krzywa sterownika i dithering mogą to zmienić.

**Sprzęt**

38. **Model tabletu i firmware** (po bramce (B)): zatwierdzona para model + firmware, z zablokowanym aktualizatorem OTA i statusem Play Protect z T-27. Modele kolorowe (Kaleido 3, Gallery 3) i czarno-białe są pełnoprawnymi kandydatami; ekran musi działać na obu rodzajach.
39. **Model kolorowego e-inka po testach.** Czy zostaje Boox Note Air6 C z zestawu domowego, czy wybieramy inny model, kolorowy albo czarno-biały. Rozstrzygają bramka (B), testy koloru K-01…K-07 oraz T-20, T-21 i T-22 (czytelność pól `t-*`, „duchy” i kolorowe ślady, nasycenie i czas pełnego odświeżenia z kolorem w zimnie). Gdy na Boox nie przejdą T-01 albo T-02, plan B to Samsung Galaxy Tab Active5 (dokupiony dopiero wtedy) albo inny e-ink z działającym DO, kolorowy albo czarno-biały.
40. **Profil palety `t-*`: Kaleido 3 czy Gallery 3.** Note Air6 C ma według źródeł z 1.1 panel Kaleido 3, więc dostaje profil domyślny; potwierdzić na sprzęcie (K-01, T-20). Profil Gallery 3 podmienia `t-ok`, `t-warn` i `t-crit` na mniej nasycone przy tej samej jasności. Wynik zapisujemy jako parę model → profil w konfiguracji APK. Do decyzji: czy utrzymywać profil Gallery 3, skoro nie kupujemy tabletu z Gallery 3 i nie da się go sprawdzić na sprzęcie (1.1, rekomendacja, pkt 5).
41. **Czy wymagać obsługi czarno-białych tabletów od pierwszej wersji.** Ekran i tak projektujemy tak, żeby działał na czarno-białym e-inku (drabina jasności i grubość obrysu, `docs/paleta.md`), a testy zrzutów sprawdzają go w szarości. Otwarte jest, czy v1 oficjalnie wspiera czarno-biały model:
    - tak: przed wdrożeniem dokupić Boox Go 10.3 Gen II Lumi, przejść K-06, T-20 i T-21 na prawdziwym czarno-białym panelu i zatwierdzić drugą parę model + firmware;
    - nie: w v1 wariant czarno-biały sprawdzamy tylko na zrzutach przeliczonych na szarość (K-06), a czarno-biały model dochodzi później, po tych samych testach.
42. Obudowa: otwarty front z folią czy szyba (po T-19); materiał (po próbkach).
43. Miejsce montażu tabletu (wysokość, odległość odczytu, zasięg konia). Od tego zależy wybór 10,3″ czy 7,8″.
44. Podświetlenie w nocy: czy włączone, a jeśli tak, to na jakim minimalnym poziomie.

**Otwarte kwestie z feedbacku ze stajni** (pełny opis: [erd.md, „Otwarte kwestie”](erd.md#otwarte-kwestie))

45. **Model karmienia:** pudełko (porcja przygotowana wcześniej), namaczanie (co, w ilu litrach wody, jak długo) i ile. Dziś jest tylko wersja prosta: „namoczyć” i ile przy pozycji planu (`feeding_plan_items.soak`, `soak_note`), a tablet pokazuje „NAMOCZYĆ” w tabeli karmienia. Przed rozbudową nie dodajemy pól ani tabel.
46. **Ekran dotykowy z blokadą czy zaprogramowany fizyczny przycisk przy boksie.** Dziś tablet ma blokadę dotyku na czas mycia (3.5.2, T-19, T-30, A-15). Alternatywą jest fizyczny przycisk, np. „Ogarnięte”, zamiast dotyku; wpłynąłby na obudowę i montaż (1.2) i na moduł `modules/kiosk` (obsługa przycisku). Do rozstrzygnięcia nic pod to nie kupujemy; dane z T-19, T-30 i A-15 w stajni pilotażowej pomogą w decyzji.
47. **Płatności, faktury, KSeF:** czy to nie za dużo na PoC. Na razie bez rozbudowy: `billing` zostaje jak jest, na poziomie stajni, na fałszywych adapterach (2.11, 3.3); sandbox dostawcy i środowisko KSeF dopiero po decyzji.

**Konfiguracja per stajnia** (erd.md pkt 16; do potwierdzenia przed etapem 2)

48. **Wyłączenie flagi przy flagach, które już trwają.** erd.md mówi, że wyłączona opcja znika razem ze swoim stanem. Propozycja: przy wyłączeniu szablonu (np. Derki) znika kafelek i nie da się zapisać nowej flagi, ale flagi, które już trwają, obowiązują i są widoczne do końca okna (bezpieczeństwo konia, np. trwająca „Bez śniadania” przed wetem). Alternatywa: ukrycie także trwających flag.
49. **Domyślna widoczność per rola dla nowej stajni.** erd.md: „wszystko włączone, łącznie z potwierdzeniami”; decyzja z 13.10 potwierdza to dla ustawień nowej stajni (zakładanie nie pyta o potwierdzenia), ale nie mówi o macierzy ról. Czy to dotyczy też macierzy ról (np. `display` widzi wszystkie funkcje; uprawnienia ról i tak ograniczają zapis), czy nowa stajnia dostaje węższą macierz, np. jak Stajnia Pod Lipami (propozycja do decyzji).
50. **Widoczność na tablecie.** Konto tabletów (`tablet`) nie ma kolumny w macierzy. Propozycja: tablet używa widoczności roli Obsługa (`staff`) w tej stajni. Do tego: widoczność instruktora w danych demo (arkusz jej nie podaje; propozycja: Flagi i Jazdy, jak na makietach).

**Konto firmy i strona www** (po decyzjach z 13.10.2026)

51. **Strona www** (3.5.5). **Rozstrzygnięte 13.10.2026:** bez bloga w PoC, sama prezentacja, więc bez CMS; statyczna strona. Propozycja: statyczny generator w monorepo (`apps/www`), build w CI, hosting statyczny na domenie głównej. Hosting i domenę wybiera Dawid.
52. **Sprawdzanie NIP przy rejestracji.** Propozycja na PoC: tylko format i suma kontrolna, bez sprawdzania w rejestrach (GUS, VIES). Do ustalenia: co, gdy NIP zajęło konto, do którego właściciel firmy nie ma dostępu (np. były pracownik); propozycja: przejęcie przez zespół EQUENOR po weryfikacji, bez UI na PoC.
53. **Reguły powiadomień** (`notification_rules`, erd.md pkt 17): które zdarzenia pokazać w kroku 2 i co zaznaczyć domyślnie w nowej stajni (propozycja: eskalacja niepotwierdzonej flagi do admina SMS-em i e-mailem, jak na makietach pulpitu).

## Źródła

Linki użyte w sekcjach 1, 2 i 4.

**Android, Device Owner, weryfikacja deweloperów**
- Android Developers, Lock task mode: https://developer.android.com/work/dpc/dedicated-devices/lock-task-mode
- Android Developers, Dedicated devices cookbook: https://developer.android.com/work/dpc/dedicated-devices/cookbook
- Android Developers, Dedicated devices: https://developer.android.com/work/dpc/dedicated-devices
- Android Developers, Build a DPC: https://developer.android.com/work/dpc/build-dpc
- Android Developers, System updates: https://developer.android.com/work/dpc/system-updates
- Android Developers, Developer verification FAQ: https://developer.android.com/developer-verification/guides/faq
- Android Developers, Developer verification guides: https://developer.android.com/developer-verification/guides?hl=en
- Android Developer Console Help, Understanding Android developer verification: https://support.google.com/android-developer-console/answer/16561738?hl=en
- Android Developers, Target API level requirements: https://developer.android.com/google/play/requirements/target-sdk

**Tablety e-ink**
- BOOX for Business: https://shop.boox.com/pages/business
- BooxUltimatum: https://github.com/huuunleashed/BooxUltimatum
- BooxUltimatum, eksperymenty (Charging protection): https://github.com/huuunleashed/BooxUltimatum/blob/main/knowledge/experiments.md
- etutor-server, hardware Boox: https://github.com/scottcowan/etutor-server/blob/main/docs/hardware-boox.md
- Palma 2 Pro tips: https://github.com/Kisuke-CZE/Palma_2_Pro-tips
- boox-tracker, weryfikacja: https://github.com/otherguy/boox-tracker/blob/main/agents/verification.md
- Good e-Reader, aktualizacje starszych Boox: https://goodereader.com/blog/onyx-boox/some-older-boox-models-launched-years-back-still-getting-latest-update
- EinkHome, urządzenia PocketBook (rozdzielczość Kaleido 3): https://github.com/dgalli1/EinkHome/blob/main/resources/pocketbook-devices.md
- OnyxAndroidDemo (Onyx SDK): https://github.com/onyx-intl/OnyxAndroidDemo
- KOReader, DeviceInfo.kt: https://github.com/koreader/android-luajit-launcher/blob/master/app/src/main/java/org/koreader/launcher/device/DeviceInfo.kt
- Bigme SDK, inżynieria wsteczna: https://github.com/imedwei/inksdk/blob/main/docs/bigme-sdk-reverse-engineered.md
- Crystalfontz, odświeżanie e-paper: https://www.crystalfontz.com/blog/?p=2698
- comparisontabl.es, Boox Go 10.3 Gen II: https://comparisontabl.es/e-readers/boox-go-10-3-gen-ii/
- Galaxus DE, Onyx Boox Go 10.3 Gen 2: https://www.galaxus.de/en/s1/product/onyx-boox-go-103-gen-2-1030-64-gb-ereaders-69696534
- JB Hi-Fi, Boox Go 10.3 Gen 2: https://www.jbhifi.com.au/products/boox-go-10-3-gen-2-ereader-300ppi-monochrome-e-ink
- digitec, Boox Go 10.3 Gen II: https://www.digitec.ch/en/s1/product/onyx-boox-go-103-gen-ii-1030-64-gb-ereaders-69696534
- digitec, Boox Go 10.3 2nd Gen Lumi: https://www.digitec.ch/en/s1/product/onyx-boox-go-103-2nd-gen-lumi-1030-64-gb-ereaders-69291196
- Notebookcheck, Meebook M8: https://www.notebookcheck.net/M8-New-e-book-reader-comes-with-Android-and-stylus-support.1019867.0.html
- lx-music-eink (Meebook M8, Android 14): https://github.com/shellsec/lx-music-eink/blob/main/README.en.md
- Parkablogs, Bigme B751C S: https://www.parkablogs.com/content/bigme-b751c-s-colour-e-ink-tablet-review
- Notebookcheck, Boox Note Air6 C: https://www.notebookcheck.net/Boox-Note-Air6-C-tablet-debuts-with-10-3-color-E-Ink-display-Android-16-faster-CPU-pen-and-AI-voice-transcription.1374349.0.html
- Samsung Knox KBA-489, No Battery Mode: https://docs.samsungknox.com/admin/knox-manage/kbas/kba-489-enable-no-battery-mode/
- endoflife.date, Samsung Galaxy Tab: https://github.com/endoflife-date/endoflife.date/blob/master/products/samsung-galaxy-tab.md

**Kolorowe tablety e-ink i testy koloru**
- E Ink, Kaleido 3: https://www.eink.com/brand/detail/Kaleido3
- E Ink, Gallery 3: https://www.eink.com/brand/detail/Gallery_3
- E Ink, Kaleido 3 Outdoor: https://www.eink.com/news/detail/E-Ink-Launches-E-Ink-Kaleido-3-Outdoor-ePaper-Technology
- E Ink, instrukcja wyświetlacza 7,8″ (tryby odświeżania): https://shopkits.eink.com/en/download/0223011714sy884942/User%20Manual%20-%207.8''ePaper%20Display%20%28VB3300-GHA%29.pdf
- Advantech, EPD (tryby DU i A2): https://ess-wiki.advantech.com.tw/view/EPD-130_application_tech
- Good e-Reader, kolory Kaleido 3: https://goodereader.com/blog/?p=348641
- Good e-Reader, Boox Tab Mini C: https://goodereader.com/blog/?p=365481
- myereader, Kaleido a Gallery: https://myereader.substack.com/p/differences-between-e-ink-kaleido
- myereader, recenzja Kobo Libra Colour: https://myereader.substack.com/p/kobo-libra-colour-review-e-ink-colour
- eWritable, kolor a czerń i biel: https://ewritable.net/guides/color-vs-monochrome-eink-screens/
- eWritable, firmware Bigme: https://ewritable.net/brands/bigme/firmware/4-6/
- Android Authority, kolorowy e-ink: https://www.androidauthority.com/color-e-ink-not-ready-yet-3624449
- BOOX, Note Air6 C (sklep): https://shop.boox.com/products/noteair6c
- BOOX, zapowiedź Note Air6 C: https://shop.boox.com/blogs/news/introducing-boox-note-air6-c-a-refined-10-3-color-epaper-notebook-for-knowledge-workers
- BOOX, Note Mini C: https://shop.boox.com/products/noteminic
- BOOX, Go Color 7 Gen II: https://onyxboox.com/boox_gocolor7g2
- BOOX, Tab Ultra C Pro: https://onyxboox.com/boox_tabultracpro
- BOOX, Tab X C: https://onyxboox.com/boox_tabxc
- Android Authority, Note Air6 C: https://www.androidauthority.com/boox-note-air6-c-3711609/
- smartwatchlife, Note Air6 C w Japonii: https://www.smartwatchlife.jp/81239/
- The Gadgeteer, Note Air6 C: https://the-gadgeteer.com/?p=527166
- Mobile-review, Note Air6 C: https://mobile-review.com/all/news/onyx-boox-privezla-v-rossiyu-note-air-6-c-i-palma-3/
- Diario Estrategia, Note Air6 C i Note Mini C: https://www.diarioestrategia.cl/texto-diario/mostrar/6017173/boox-actualiza-cuadernos-digitales-tinta-electronica-note-air6-c-note-mini-c-palma-3
- Komputronik, Note Air6 C: https://www.komputronik.pl/product/1032275/czytnik-e-book-onyx-boox-note-air-6-c-szary.html
- LDLC, Note Air6 C: https://www.ldlc.com/en/product/PB00754914.html
- Inet, Note Air6 C: https://www.inet.se/produkt/6613387/onyx-boox-note-air6-c
- The eBook Reader, Note Air5 C: https://blog.the-ebook-reader.com/2025/10/20/new-boox-note-air5-c-runs-android-15-and-supports-emr-stylus/
- Parkablogs, Note Air5 C: https://parkablogs.com/content/boox-note-air5-c-tablet-review
- TechRadar, Note Air5 C: https://www.techradar.com/tablets/ereaders/onyx-boox-note-air5-c-review
- x-kom, Note Air5 C: https://www.x-kom.pl/p/1542740-czytnik-ebook-onyx-boox-note-air-5-c-64gb-szary.html
- Galaxus, Note Air5 C: https://www.galaxus.de/en/s1/product/onyx-boox-note-air5-c-1030-64-gb-ereader-64701965
- BOOX przez Barchart, seria Go 7: https://www.barchart.com/story/news/32065972/boox-unveils-go-7-series-portable-ereaders-for-immersive-reading-and-instant-idea-capture
- TechRadar, Go Color 7 Gen II: https://www.techradar.com/tablets/ereaders/onyx-boox-go-color-7-gen-ii-review
- YesPress, Go Color 7 Gen II (E-Ink Center): https://yespress.io/products/boox-go-color-7-gen-ii
- x-kom, Go Color 7 Gen II: https://www.x-kom.pl/p/1542815-czytnik-ebook-onyx-boox-go-7-color-ii-gen-64gb-czarny.html
- Komputronik, Go Color 7 Gen II: https://www.komputronik.pl/product/968931/czytnik-e-book-onyx-boox-go-7-color-ii-gen-czarny.html
- LDLC, Go Color 7 Gen II: https://www.ldlc.com/en/product/PB00684465.html
- Notebookcheck, następca Tab Mini C: https://www.notebookcheck.net/Boox-planning-four-new-devices-including-Palma-3-and-a-likely-successor-to-the-Tab-Mini-C.1370054.0.html
- Notebookcheck, Android 13 dla Go 6 Gen II: https://www.notebookcheck.net/Onyx-rolls-out-Android-13-update-for-Boox-Go-6-Gen-II.1407708.0.html
- Notebookcheck, Palma 2 Pro: https://www.notebookcheck.net/Boox-Palma-2-Pro-hands-on-review-Colorful-5G-e-reader-with-Android.1253300.0.html
- Notebookcheck, Bigme Galy: https://www.notebookcheck.net/Bigme-Galy-8-inch-eReader-launches-with-colour-display-and-Google-Play-Store-access.669163.0.html
- Parkablogs, Bigme Galy: https://www.parkablogs.com/content/review-bigme-galy-worlds-first-e-ink-gallery-3-tablet
- Notebookcheck, Bigme B10: https://www.notebookcheck.net/Bigme-B10-color-E-Ink-tablet-gets-a-12GB-RAM-version-in-China.1330521.0.html
- Android Authority, Bigme B10: https://www.androidauthority.com/bigme-b10-tablet-launch-3637013/
- Parkablogs, Bigme B10: https://parkablogs.com/content/bigme-b10-e-paper-tablet-review
- Liliputing, Bigme B10: https://liliputing.com/?p=196870
- Mezha, Bigme B10: https://mezha.ua/en/news/bigme-b10-e-ink-tablet-308192/
- Notebookcheck, Bigme B1051C: https://www.notebookcheck.net/Bigme-B1051C-Tablet-comes-with-Android-14-a-color-E-Ink-display-an-EMR-pencil-and-keyboard-support.904799.0.html
- Parkablogs, Bigme B1051C: https://www.parkablogs.com/index.php/content/review-bigme-b1051c-ereader-with-keyboard-case
- Notebookcheck, Bigme B751C-S: https://www.notebookcheck.net/Bigme-B751C-S-color-e-reader-with-stylus-support-launched-in-China.1190990.0.html
- PocketBook, InkPad Eo 2: https://pocketbook.ch/en-ch/news/pocketbook-inkpad-eo-2-news-ch
- ifeng, InkPad Eo 2 na targach: https://tech.ifeng.com/c/8x4yRMDUT2O
- ComputerBase, PocketBook InkPad Eo: https://www.computerbase.de/artikel/tablets/pocketbook-inkpad-eo-e-book-reader-test.88903/seite-3
- comparisontabl.es, InkPad Eo 2: https://comparisontabl.es/e-readers/pocketbook-inkpad-eo-2/
- Root Nation, PocketBook Viva: https://root-nation.com/pl/news-pl/pl-pocketbook-viva/
- XP-Pen, kolorowe tablety e-ink: https://www.xp-pen.com/blog/color-e-ink-tablet.html
- heyupnow, Viwoods AiPaper Reader C: https://heyupnow.com/en-de/products/viwoods-aipaper-reader-c
- r/Onyx_Boox, próba Device Ownera na Boox: https://www.reddit.com/r/Onyx_Boox/comments/1ihrbpy/using_adb_to_setdeviceowner/
- OwnDroid (konto blokujące DO): https://github.com/BinTianqi/OwnDroid
- Gentle Glow (sterowanie podświetleniem Onyx): https://apt.izzysoft.de/packages/com.onyx.darie.calin.gentleglowonyxboox/

**Montaż, zasilanie, sieć, przyrządy**
- Tabela odporności poliwęglanu: https://www.foxxlifesciences.in/pages/polycarbonate-chemical-compatibility-chart
- Globe Scientific, tabela odporności chemicznej: https://www.globescientific.com//media/PDF/Library_PDF/Chemical%20Resistance%20Chart.pdf
- DLG, Spelsberg TK PC: https://www.dlg.org/en/tests/agricultural-technology-and-farm-inputs/test-reports/test-g-spelsberg-leergehaeuse-der-tk-pc-serie-mit-zubehoer
- DLG, raport 7458 (Spelsberg Abox): https://pruefberichte.dlg.org/filestorage/7458.pdf
- TheHorse, Ammonia is the Enemy: https://thehorse.com/129872/ammonia-is-the-enemy/
- EN 62262 (kody IK): https://en.wikipedia.org/wiki/EN_62262
- REDARC, ładowanie Li-ion poniżej 0 °C: https://us.support.redarcelectronics.com/hc/en-us/articles/13856244101007-Why-you-should-not-charge-a-lithium-battery-below-0-C-or-32-F
- UCTRONICS U6115, instrukcja: https://www.welectron.com/mediafiles/productimg/arducam/Amazon/U6115_Manual.pdf
- Brateck, ramka antykradzieżowa: https://www.computeralliance.com.au/brateck-anti-theft-wall-mounted-tablet-enclosure/
- Wkręty zabezpieczające: https://www.albanycountyfasteners.com/screws-bolts/machine-screws/tamper-resistant-security-machine-screws
- Gore, membrany wyrównujące ciśnienie: https://gore.com/node/24906
- Teltonika TSW202, karta katalogowa: https://teltonika-networks.com/cdn/products/2023/08/64e896612f9829-30532758/datasheet-pdf/tsw202-datasheet-v13.pdf
- PoE Texas GAT-USBC: https://reach.dog/shop/poe-texas/products/gat-usbc
- IEC 60364-7-705: https://vde-verlag.de/iec-normen/212877/iec-60364-7-705-2006.html
- WiFiAnalyzer: https://apkmirror.com/apk/vrem-software-development/wifianalyzer-open-source/wifianalyzer-open-source-2-0-4-release
- NetSpot dla Androida: https://netspotapp.com/android
- NetSpot, pomiar na Androidzie: https://netspotapp.com/help/wifi-site-survey-on-android
- iperf3: https://software.es.net/iperf
- York University, standard Wi-Fi: https://facilities.info.yorku.ca/files/2018/11/27-21-33-Data-Comm-WIFI-AP-v3.2-20180726.pdf?x18178
- Shelly Plug S Gen3: https://www.shelly.com/pl/blogs/documentation/shelly-plug-s-gen-3-device-smart-control
- FNIRSI FNB58: https://www.elektor.com/products/fnirsi-fnb58-usb-tester-with-bluetooth
- Forensics Detectors, miernik amoniaku: https://forensicsdetectors.com/products/basic-ammonia-detector

**Wyświetlacz**
- Raspberry Pi 5: https://www.raspberrypi.com/news/introducing-raspberry-pi-5/
- Core Electronics, zasilacz 27 W: https://core-electronics.com.au/raspberry-pi-5-power-supply-usb-c-pd-27w-black.html
- Raspberry Pi, USB Power Delivery na Pi 5: https://pip-assets.raspberrypi.com/categories/685-app-notes-guides-whitepapers/documents/RP-009856-WP-1-USB%20Power%20delivery%20on%20Raspberry%20Pi%205.pdf
- Raspberry Pi, chłodzenie Pi 5: https://www.raspberrypi.com/news/heating-and-cooling-raspberry-pi-5/
- bret.dk, obudowa Flirc: https://bret.dk/flirc-raspberry-pi-5-case-review/
- The Pi Hut, M.2 HAT+ Compact: https://thepihut.com/products/raspberry-pi-m-2-hat-compact
- Raspberry Pi, SSD Kit: https://www.raspberrypi.com/products/ssd-kit/
- Adafruit, karta microSD A2: https://www.adafruit.com/product/6011
- Raspberry Pi, dokumentacja (RTC): https://www.raspberrypi.com/documentation/computers/raspberry-pi.html
- The Pi Hut, bateria RTC: https://thepihut.com/products/rtc-battery-for-raspberry-pi-5
- Raspberry Pi, kabel micro-HDMI: https://www.raspberrypi.com/products/micro-hdmi-to-standard-hdmi-a-cable/
- Adafruit, Read-Only Raspberry Pi: https://learn.adafruit.com/read-only-raspberry-pi
- invidis, wypalanie OLED: https://invidis.com/sixteen-nine/2018/10/16/long-term-tests-confirm-oleds-have-burn-in-issues-but-is-the-risk-real-in-digital-signage/
- Rozporządzenie (UE) 2019/2021: https://eur-lex.europa.eu/eli/reg/2019/2021/oj
- LG 49XS2B, Power On Status: https://manualslib.mx/manual/563119/Lg-49Xs2B.html?page=38
- WMU, digital signage: https://wmich.edu/digital-accessibility/digital-signage

**Telefony i karty SIM**
- Antyweb, rejestracja kart SIM: https://antyweb.pl/rejestracja-kart-sim-jak-to-zrobic

**AWS: SMS, Cognito, SES, S3, SNS/SQS, IAM**
- SNS, wyjście z SMS sandbox: https://docs.aws.amazon.com/sns/latest/dg/sns-sms-sandbox-moving-to-production.html
- EUMS, weryfikacja numeru: https://docs.aws.amazon.com/sms-voice/latest/userguide/verify-destination-phone-number.html
- EUMS, numery symulatora: https://docs.aws.amazon.com/sms-voice/latest/userguide/test-phone-numbers.html
- EUMS, Sender ID: https://docs.aws.amazon.com/sms-voice/latest/userguide/sender-id.html
- EUMS, kraje: https://docs.aws.amazon.com/sms-voice/latest/userguide/phone-numbers-sms-by-country.html
- EUMS, rejestracje: https://docs.aws.amazon.com/sms-voice/latest/userguide/registrations.html
- AWS, rejestracja numerów w nowych krajach (w tym Polska): https://aws.amazon.com/about-aws/whats-new/2025/04/aws-end-user-messaging-self-service-phone-number-registration
- EUMS, limit wydatków: https://docs.aws.amazon.com/sms-voice/latest/userguide/spend-limit.html
- EUMS, wnioski do Support: https://docs.aws.amazon.com/sms-voice/latest/userguide/awssupport.html
- EUMS, protect configuration: https://docs.aws.amazon.com/sms-voice/latest/userguide/protect-configuration.html
- EUMS, limity znaków: https://docs.aws.amazon.com/sms-voice/latest/userguide/sms-limitations-character.html
- Twilio, Polska: https://www.twilio.com/en-us/guidelines/pl/sms
- NASK, ustawa o zwalczaniu nadużyć: https://cyberpolicy.nask.pl/ustawa-o-zwalczaniu-naduzyc-w-komunikacji-elektronicznej/
- Cognito, ustawienia SMS: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-sms-settings.html
- Terraform AWS provider, zgłoszenie #50066: https://github.com/hashicorp/terraform-provider-aws/issues/50066
- Cognito, przepływy uwierzytelniania: https://docs.aws.amazon.com/cognito/latest/developerguide/authentication-flows-selection-sdk.html
- Cognito, plany funkcji: https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html
- Cognito, MFA: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-mfa.html
- Cognito, refresh tokens: https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-refresh-token.html
- Cognito, unieważnianie tokenów: https://docs.aws.amazon.com/cognito/latest/developerguide/token-revocation.html
- Cognito, AdminDisableUser: https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminDisableUser.html
- Cognito, custom SMS sender: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-custom-sms-sender.html
- AWS sample, SMS przekierowany na e-mail: https://github.com/aws-samples/amazon-cognito-user-pool-development-and-testing-with-sms-redirected-to-email
- Cognito, atrybuty puli: https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html
- CloudFormation, Cognito EmailConfiguration: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cognito-userpool-emailconfiguration.html
- SES, FAQ dostępu produkcyjnego: https://repost.aws/knowledge-center/ses-production-access-request-faq
- S3, presigned URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url
- SNS, szyfrowanie z kolejką SQS: https://docs.aws.amazon.com/sns/latest/dg/sns-enable-encryption-for-topic-sqs-queue-subscriptions.html
- IAM Roles Anywhere: https://docs.aws.amazon.com/sdkref/latest/guide/access-rolesanywhere.html

**Apple, Google Play, Expo**
- Apple Developer Program, zapis: https://developer.apple.com/programs/enroll/
- Apple, pomoc dot. zapisu: https://developer.apple.com/support/enrollment/
- Apple, D-U-N-S: https://apple.co/308Ikbq
- App Store Connect, DSA: https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-eu-digital-services-act-compliance-information
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Expo, TestFlight: https://docs.expo.dev/submit/testflight.md
- Expo, dystrybucja wewnętrzna: https://docs.expo.dev/build/internal-distribution/
- Expo, iOS Universal Links: https://docs.expo.dev/linking/ios-universal-links/
- Play Console, wymagania testów dla kont osobistych: https://support.google.com/googleplay/android-developer/answer/14151465?hl=en
- Play Console, weryfikacja urządzenia: https://support.google.com/googleplay/android-developer/answer/14316361?hl=en
- Android Developers Blog, D-U-N-S w Google Play: https://android-developers.googleblog.com/2023/07/boosting-trust-and-transparency-in-google-play.html?hl=fr
- Play Console, usuwanie konta: https://support.google.com/googleplay/android-developer/answer/13327111
- Expo, EAS Submit: https://docs.expo.dev/submit/introduction
- Expo, EAS Update deployment: https://docs.expo.dev/eas-update/deployment
- Expo, expo-updates: https://docs.expo.dev/versions/latest/sdk/updates

**Domena, TLS, faktury**
- Ważność certyfikatów TLS (SC-081): https://sslinsights.com/200-day-ssl-certificate-validity/
- KSeF, środowiska testowe 2.0: https://ksef.podatki.gov.pl/wyjasnienia/we-wrzesniu-zamiana-srodowisk-testowych-z-ksef-10-na-ksef-20/
