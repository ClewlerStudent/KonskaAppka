# EQUENOR: plan brakujących makiet

> 2026-10-12, poprawki po decyzjach użytkownika z 13.10.2026 · [erd.md](erd.md) · [development.md](development.md) (pełna wersja [development-szczegoly.md](development-szczegoly.md)) · [paleta.md](paleta.md) · kanwa [claude.ai/artifact/SjdCnhTF5eqXy2vRaSMUtX](https://claude.ai/artifact/SjdCnhTF5eqXy2vRaSMUtX) · bez cen i infrastruktury.

**Oznaczenia**
- **P1:** rejestracja (konta firmy, stajni, osób, urządzeń), ekran główny roli, strona www, ekran wymagany przez kryterium gotowości etapów 1–6 (szcz. 3.6) albo cel linku z innej planszy P1. **P2:** domyka nawigację i stany przed pilotażem. **P3:** po PoC albo po decyzji, która może planszę usunąć.
- **Wariant:** kopia istniejącego pliku z innym stanem albo danymi. **(propozycja):** tego dokumenty nie przesądzają. **dec. N:** decyzja z sekcji 5. Oba dopiski są tylko w planie i notatkach kanwy, nigdy w UI. **●** przy stanie: osobna plansza; stan bez ● to fragment na planszy zbiorczej (2.1).
- Skróty: **erd**, **dev** (development.md), **szcz.** (development-szczegoly.md); numeracja §5 w dev i szcz. jest różna, więc zawsze podajemy plik. Testy A, T, K, W, N: szcz. 4. Po nazwie planszy: powierzchnia, rozmiar, priorytet, decyzje i źródła; szcz. 3.5.1–3.5.4 (ekrany apki, tabletu, panelu i TV) dotyczą każdej planszy swojej powierzchni, więc ich nie powtarzamy.

## 1. Zakres

- **Rejestracja:** konto firmy z NIP-em i stajnie w panelu (dec. 1, 3); zaproszenia SMS-em albo e-mailem i pierwsze logowanie (Klient, Obsługa, Instruktor, Wsparcie IT, Wyświetlacz); „rejestracja” urządzeń, czyli logowanie zwykłym kontem (telefon albo e-mail i kod) i lokalny wybór widoku TV albo boksu i języka tabletu (serwer urządzeń nie rejestruje, erd pkt 2 i 4).
- **Strona www:** publiczna strona przed logowaniem: prezentacja produktu i blog (grupa I).
- **Ekran główny:** start każdej roli w apce i panelu, pierwszy ekran tabletu i TV. Dziś są tylko Main, ListaDnia, TabletBoks i WyswietlaczCentralny.
- **„Itd. itp.”:** cele martwych linków i stany wymagane przez dokumenty i testy.
- **Poza zakresem:** zmiany układu zaakceptowanych makiet (tylko linki, 3.H; wyjątek: poprawki z decyzji 13.10, np. boksy w PanelDodajHale), pliki *BezAkcji, parowanie i rejestr urządzeń z analiza.md v3. W Stajni Brzozowej tylko pozycje z tabeli 2.2.

## Na start: pierwsza fala (29 plansz)

Prośba dotyczyła rejestracji i ekranów głównych, więc zaczynamy od ścieżek, które pokazują je od początku do końca. Reszta P1 (stany, flagi, codzienna praca) idzie kolejnymi paczkami z sekcji 4.

- **Stajnia od zera (panel):** PanelLogowanie → PanelLogowanieKod → PanelWitaj → PanelRejestracjaFirmy → PanelZalozStajnie → PanelZalozPowiadomienia → PanelPulpitStart → PanelZaprosOsobe.
- **Zaproszona osoba (apka):** WiadomosciSms → LogowanieNumer → ZaproszeniePrzyjmij → MainLuna; BrakDostepu dla numeru bez zaproszenia.
- **Ekrany główne ról:** MapaNawigacjiRol, AdminDzis, PanelPulpit, InstruktorJazdy, WsparcieITStart. Klient i Obsługa już je mają (Main, ListaDnia).
- **Telewizor:** PanelLudzieWyswietlacze → WyswietlaczLogowanie → WyswietlaczKod → WyswietlaczCentralny (jest); konto telewizora zaprasza się w PanelZaprosOsobe z rolą Wyświetlacz.
- **Tablet:** TabletLogowanie → TabletLogowanieKod → TabletWyborStajni → TabletPierwszyBoks → TabletBoks (jest); TabletUstawienia.
- **Strona www:** StronaGlowna (w telefonie StronaGlownaTelefon) → StronaWpis; logowanie → PanelLogowanie.

Rozstrzygnięte 13.10.2026: dec. 1, 2, 3, 7 (e-mail), 10, 11, 21, 28 (bez macierzy widoczności ról), 29 i nowa 35 (sekcja 5). Przed falą otwarte zostają już tylko dec. 12, 17 i 18. Bez odpowiedzi rysujemy według rekomendacji, z dopiskiem „(propozycja, dec. N)” w notatce kanwy.

**Stan 13.10.2026:** pierwsza fala (24 plansze) jest na kanwie (sekcja „Pierwsza fala”), narysowana według rekomendacji. Numery decyzji i linki tymczasowe (np. „[WWW]/app” → LogowanieNumer) są w notatkach rzędów. Po decyzjach z 13.10 poprawiamy jej plansze, dokładamy PanelRejestracjaFirmy, PanelZalozPowiadomienia i stronę www (5 plansz) i podmieniamy linki (3.H).

## 2. Zasady

### 2.1 Pliki, stany, linki, kanwa

- **Plik:** `.dc.html` obok istniejących, szkielet z pliku tej samej grupy: `<!doctype html>`, `<html lang="pl">`, `<title>`, `<script src="./support.js">`; `<x-dc>` z `<helmet>` (Google Fonts, `a{color:#8A5230}`); na końcu `<script type="text/x-dc" data-dc-script data-props=…>` z `Component extends DCLogic`; `data-props`: `accent` (#8A5230, #665A40, #744A5A, #5E5B40) i `$preview` z rozmiarem (tablet tylko `$preview`).

| Powierzchnia | Plansza | Korzeń | Font |
|---|---|---|---|
| Apka, www w telefonie | 390×844; dłuższe 390×960, 1000, 1160 | div w px, `overflow: hidden` | Figtree |
| Tablet e-ink | 702×936 | div w px, białe tło, tylko `t-*`, linki czarne | Atkinson Hyperlegible |
| Panel web, strona www | 1440×900, `"expand": "fill"`, rośnie w dół | width 100%, min-height 900, kontener 1280, padding 24/20 | Figtree |
| Wyświetlacz | 1600×900, `"expand": "fill"` | width 100%, min-height 900, padding 16/24 | Figtree |

- **Stany:** stan z ● to osobna plansza. Każdy inny stan z list „Stany” rysujemy jako fragment na planszy zbiorczej: **StanyApka** (4 kolumny po 390 px), **StanyTablet** (2 kolumny po 702 px), **StanyPanel** (1440 fill), **StanyWyswietlacz** (1600 fill); wysokość według treści, powyżej 3000 px kolejny plik. Fragment to zmieniony element w skali 1:1 z kawałkiem tła i podpisem „plik · stan · źródło albo test”. Żaden stan nie zostaje samym opisem.
- **Linki:** jedynym spisem jest 3.H. Link prowadzi do pliku tej samej powierzchni, chyba że ekran wprost otwiera inną (ProfilAdmin „w panelu web”, strona www → panel, instrukcja z ekranem TV albo tabletu). Plansza P1 nie linkuje do P2 ani P3, a P2 do P3: do czasu narysowania celu ma cel „(tymczasowo)” albo nie ma linku, a wymiana idzie w L2 i L3. Pliki Brzozowej linkują tylko do plików Brzozowej.
- **Zaakceptowane makiety:** nie zmieniamy układu (poza poprawkami z decyzji 13.10); nowe ekrany to nowe pliki; linki podmieniamy paczkami za zgodą (dec. 30); *BezAkcji nie ruszamy. WyswietlaczCentralny i WyswietlaczHala powstają z generatora; nowe pliki TV rysujemy według ich konwencji, bez ruszania tych dwóch.
- **Kanwa:** ostatnia plansza kończy się na y = 10536; pierwszy nowy tytuł (`title1`) na y = 10836, plansze na y = 11136; kolejny tytuł 300 px pod najniższą planszą rzędu. Odstęp 80 px: telefon co 470, tablet co 782, panel co 1520, TV co 1680. Każdy plik w `boards` i `order`, tytuł planszy zaczyna się od priorytetu („P1 · …”).
- **Rzędy = grupy z sekcji 3:** R1 A, R2 B, R3 C, R4 D, R5 E, R6 F, R7 G, R8 plansze zbiorcze, R9 P3, R10 I (strona www). P2 na końcu rzędu swojej grupy. Każdy rząd ma pomarańczową notatkę z numerami decyzji i źródeł; do tego notatki: R1 „Konto i odzyskanie” (utrata numeru: logowanie e-mailem, jeśli konto go ma; inaczej admin zaprasza nowy numer i dezaktywuje stare członkostwo, propozycja; jedyny admin konta nie usunie konta, a dodanie albo przekazanie admina konta jest poza PoC: dec. 33, 35, erd pkt 14), R5 „Zgubiony tablet” (dec. 12).

### 2.2 Dane

- **Moment:** wt 13.10.2026, 07:15, Europe/Warsaw (pop-up tabletu 06:01). Konie, flagi, posiłki, padoki, zadania, wizyty i Stajnia Brzozowa: seed (dev 3.2).
- **Konto firmy:** „Stajnie Lipowe sp. z o.o.”, NIP 123-456-32-18 (fikcyjny), siedziba ul. Lipowa 12, 05-520 Konstancin-Jeziorna; należą do niego obie stajnie. Damian to admin konta (właściciel): ma dostęp do obu stajni, +48 602 *** 145, d•••@stajnielipowe.pl.
- **Pod Lipami:** Damian (admin konta), Ola (Obsługa, także w Brzozowej), Piotr (Obsługa tylko tu), Anna (Kasztan, Bella), Karolina W. (Iskra), Tomasz L. (Grom), Ewa K. (Sonata), Marek Nowak (zaproszenie do Luny, wygasa czw 15.10); telewizor: konto „Telewizor korytarz” z rolą Wyświetlacz (t•••@stajnielipowe.pl), loguje się e-mailem i kodem z e-maila.
- **Brzozowa:** ul. Brzozowa 5, 05-500 Piaseczno; jedna hala „Hala główna” (nazwy nie pokazujemy), boksy 1–6 z poidłem automatycznym, posiłki 06:30, 12:00, 18:00. Damian (admin konta), Paweł (Obsługa tylko tu, prowadzi stajnię na co dzień i sam obsługuje konie, +48 601 *** 377), Ola (Obsługa), Anna (Kometa); bez wyświetlacza. Ustawienia jak PanelUstawieniaBrzozowa: Damian zmienił je po założeniu (potwierdzenia wyłączone, bez Derki, moczenia i padoku).
- **W obu stajniach:** Ola (Obsługa), Anna (Klient), Marta (Instruktor), Kuba (Wsparcie IT, zaproszony e-mailem k•••@stajnielipowe.pl). Przełącznik stajni „▾” ma każdy z dwiema stajniami: Damian, Ola, Anna, Marta i Kuba; Paweł i Piotr widzą samą nazwę stajni.
- **Sceny zakładania (retrospekcje, dec. 29):** pn 07.09.2026 Damian rejestruje konto firmy (PanelLogowanie → PanelLogowanieKod → PanelWitaj → PanelRejestracjaFirmy) i zakłada Stajnię Pod Lipami; czw 01.10.2026 dodaje Stajnię Brzozową bez pytania o NIP (PanelZalozStajnie → PanelZalozPowiadomienia → PanelPulpitStart → PanelZaprosOsobe: zaproszenie Pawła SMS-em; Olę przypisuje do Brzozowej w Ludziach, bez zaproszenia).
- Dane spoza seedu i sekcji M arkusza mają „(propozycja)” w notatce kanwy (dec. 29). Numery i e-maile zawsze zamaskowane: „+48 607 *** 218”, „d•••@stajnielipowe.pl”.

**Stajnia Brzozowa w nowych planszach** (jedyne miejsce z jej wariantami):

| Plansza | Wersja Brzozowej | Forma |
|---|---|---|
| PanelZalozStajnie, PanelZalozPowiadomienia, PanelPulpitStart, PanelZaprosOsobe | dodanie Brzozowej (Damian, 01.10; zaproszenie Pawła) | treść główna |
| ZaproszeniePrzyjmij | ZaproszenieNoweStajnia: Anna (Kometa); Ola przypisana w Ludziach, bez zaproszenia | ● P1 · stan |
| PanelDodajKonia | Kometa, „boks 1” bez hali, zaproszenie Anny | stan |
| AdminDzis · PanelPulpit | AdminDzisBrzozowa · PanelPulpitBrzozowa | ● P1 · plik P2 |
| AdminZadania | bez wyboru hali, „Obsługa nie widzi zadań w tej stajni” z linkiem do ustawień | stan |
| InstruktorJazdy · WsparcieITStart · PanelLudzieWyswietlacze | brak jazd · jedna hala · filtr „Wyświetlacz” pusty: „Stajnia nie ma wyświetlacza” (z „Zaproś osobę”) | stany |
| TabletWyborStajni, TabletPierwszyBoks | bez zakładek: 1 Kometa, 2 Dąb, 3 Iga, 4 Lord, 5 WOLNY, 6 Nuta | stan |
| TabletBoksWolny · ListaDniaOgarniete | boks 5 bez hali i padoku · lista 1–6 bez hal | stany |
| EdycjaPlanuKonia | Kometa: owies 1 kg wieczorem (rano wstrzymane), siano, musli 0,5 kg wieczorem; bez „Namoczyć” i padoku | stan |
| SzybkaFlaga · SzybkaFlagaObsluga | SzybkaFlagaBrzozowa · 6 kafelków, „obowiązuje od razu” | ● P1 · stan |
| KartaKonia · StajennyKonie · KartaKoniaObsluga | KartaKoniaKometa · StajennyKonieBrzozowa · Kometa bez namaczania i padoku | pliki P2 · stan |
| TabletEkranZablokowany · ListaDnia w dniu założenia | TabletEkranZablokowanyBrzozowa · ListaDniaPusta | pliki P3 |
| MainBrzozowa: Flagi, Historia; PanelUstawieniaBrzozowa: Boksy, Konie, Ludzie, Płatności, ustawienie boksu | poza zakresem | bez linku |

### 2.3 Słownictwo i wygląd

- **Role:** Klient, Obsługa, Admin, Instruktor, Wsparcie IT, Wyświetlacz. Admin to rola konta firmy (wszystkie stajnie firmy), pozostałe role przypisuje się per stajnia (dec. 35). Wsparcie IT dosłownie: „Wsparcie IT: techniczny dostęp do konfiguracji i diagnostyki tabletów i wyświetlaczy, bez zarządzania końmi i klientami.”
- **Flagi:** status „potwierdzona HH:MM” albo „niepotwierdzona” (nigdy „przyjęte”), tylko przy `requires_ack`, inaczej „obowiązuje od razu”; godziny „06:00–10:00”, „od 14:30”, „16:00–08:00”, „dziś, cały dzień”. „Przyjęte” wolno tylko przy zaproszeniach.
- **Akcje:** „Ogarnięte”, „Podano śniadanie / obiad / kolację”, „Wyprowadzono na padok”, „Woda” tylko przy poidle ręcznym. Bez „Najemca”, „Serwisant”, „Właściciel konia” jako roli, „Nakarmiony”, „Czyszczenie”, „Ścielenie”; „Siano” tylko jako pasza; znak „EQUENOR” zawsze wersalikami, a w zdaniach nieodmienny („w EQUENOR”, „do EQUENOR”); hasło „Equestrian Management, Refined” tylko pod znakiem (zasady: paleta.md).
- **Boks:** przy kilku halach „Hala nowa · boks 4”, w wąskich listach „Nowa 4”; w Brzozowej „boks 1”; formularze wysyłają `boxId`.
- **Logowanie** (apka, panel, tablet, TV; dec. 7): nad polem przełącznik segmentowy „Telefon | E-mail” w stylu „Kanał: SMS | E-mail” z Zaproszenie (tablet: „TELEFON | E-MAIL”, e-ink); „Wyślemy kod SMS-em albo e-mailem. Konto nie ma hasła.” Zaproszenia SMS-em albo e-mailem.
- **Adresy:** [PANEL] to subdomena panelu, TV otwiera [PANEL]/wyswietlacz, strona pobierania apki to [WWW]/app (dev 2).
- **Paleta:** tylko paleta.md, jak w istniejących makietach; błędy i offline w rodzinie „uwaga”, na TV bez pól w akcencie; na tablecie nieaktywny przycisk z przerywaną ramką, OFFLINE jako `t-warn`, ekran działa na czarno-białym e-inku.
- **Nagłówki:** jak w istniejących makietach (zakładka ze znakiem i stajnią, podstrona z „← Wróć” bez paska, logowanie z logo 60 px). Paski Klienta i Obsługi bez zmian, Admina według dec. 17, Instruktor i Wsparcie IT z 3 i 2 pozycjami (propozycja). Apka i panel: przełącznik stajni „▾” tylko przy kilku stajniach (admin konta, gdy firma ma kilka stajni; inni przy kilku członkostwach), inaczej sama nazwa (dec. 21, szcz. 3.5.1); bez dzwonka (dec. 22). Panel: „▾” jak w PanelUstawieniaStajni, menu 240 px, formularz jako `aside role=dialog` z prawej. Tablet i TV bez przełącznika.
- **Widoczność:** funkcja odznaczona dla roli w `stable_role_features` znika (sekcja, pozycja paska); Admin widzi wszystko; wyłączona opcja stajni znika razem ze stanem. Wyświetlacz Pod Lipami nie widzi zdrowia ani jazd.
- **Urządzenia i prywatność:** bez parowania QR, PIN-ów, kodów serwisowych, listy tabletów, telemetrii w bazie i zdalnych komend. Tablica nie pokazuje zalogowanej osoby (tylko ukryte ustawienia). TV bez danych osobowych, także przy logowaniu. Po wylogowaniu, blokadzie konta albo zawieszeniu stajni nie pokazujemy starych flag.

## 3. Makiety

### 3.0 Przegląd

Grupa = paczka z sekcji 4 (P1 grupy A to paczka 1 itd., grupa I to paczka „www”). Istniejące pliki poprawiane po decyzjach z 13.10 (np. PanelDodajHale) nie wchodzą do liczb.

| Plik | Powierzchnia | Prio | Po co |
|---|---|---|---|
| **A. Apka: logowanie, zaproszenia, konto** | | | |
| LogowanieNumer | apka | P1 | krok 1 logowania: telefon albo e-mail |
| LogowanieBlad | apka | P1 | zły albo wygasły kod, limit prób |
| BrakDostepu | apka | P1 | zalogowany bez stajni i zaproszenia |
| WiadomosciSms | apka | P1 | treść SMS: zaproszenie, kod, eskalacja |
| ZaproszenieStrona | www | P1 | strona z linku w SMS |
| ZaproszeniePrzyjmij | apka | P1 | przyjęcie zaproszenia z imieniem i językiem |
| ZaproszenieNoweStajnia | apka | P1 | zaproszenie do drugiej stajni |
| MainLuna | apka | P1 | pierwszy ekran klienta konia bez boksu |
| Profil | apka | P1 | język, sesje, usunięcie konta |
| ProfilAdmin | apka | P1 | profil admina z wejściami do panelu |
| PrzelacznikStajni | apka | P1 | wybór stajni przy kilku członkostwach |
| ZaproszenieObsluga | apka | P2 | zaproszenie obsługi, stan po wysłaniu |
| LudzieAdmin | apka | P2 | zakładka Ludzie admina |
| ProfilZmianaNumeru | apka | P2 | zmiana numeru telefonu |
| StronaUsunKonto | www | P2 | usunięcie konta, wymóg Google Play |
| MainBezKonia | apka | P2 | klient bez dostępu do konia |
| StajniaZawieszona | apka | P2 | stajnia `suspended` |
| **B. Panel: logowanie, stajnia, ludzie** | | | |
| PanelLogowanie | panel | P1 | wejście do panelu i rejestracji |
| PanelLogowanieKod | panel | P1 | kod z SMS-a albo e-maila w panelu |
| PanelWitaj | panel | P1 | imię, język, wybór drogi po pierwszym logowaniu |
| PanelRejestracjaFirmy | panel | P1 | konto firmy: NIP, nazwa, siedziba |
| PanelZalozStajnie | panel | P1 | krok 1: stajnia, adres, boksy z konfiguracją, pory posiłków |
| PanelZalozPowiadomienia | panel | P1 | krok 2: zdarzenia, odbiorcy, SMS albo e-mail |
| PanelPulpitStart | panel | P1 | pierwsze kroki nowej stajni |
| PanelDodajKonia | panel | P1 | dodanie konia i zaproszenie klienta |
| PanelZaprosOsobe | panel | P1 | zaproszenie z rolą i walidacją |
| PanelLudzie | panel | P1 | członkowie, zaproszenia, role |
| PanelPrzeniesKonia | panel | P1 | przeniesienie, zamiana, przypisanie, wyjazd konia |
| PanelPulpit | panel | P1 | start admina w panelu |
| PanelPulpitBrzozowa | panel | P2 | pulpit Brzozowej (Damian) |
| PanelMenuKonta | panel | P2 | konto firmy, stajnie, wylogowanie |
| PanelKonie | panel | P2 | lista koni |
| PanelEdytujHale | panel | P2 | edycja hali i boksów |
| PanelSlowniki | panel | P2 | pasze, padoki, ujeżdżalnie |
| PanelUstawieniaOgolne | panel | P2 | eskalacje, pory, okno APK i inne ustawienia |
| PanelUstawieniaZapis | panel | P2 | wyłączenie usługi z trwającą flagą, częściowy zapis |
| **C. Ekrany główne ról** | | | |
| MapaNawigacjiRol | panel | P1 | start i pasek każdej roli (paczka 0) |
| AdminDzis | apka | P1 | start admina: pilne, dziś, do załatwienia |
| AdminDzisBrzozowa | apka | P1 | start admina małej stajni |
| AdminZadania | apka | P1 | zadania z perspektywy admina |
| AdminZadaniaNowe | apka | P1 | dodanie zadania |
| InstruktorJazdy | apka | P1 | start instruktora |
| WsparcieITStart | apka | P1 | start Wsparcia IT bez rejestru urządzeń |
| PanelDiagnostyka | panel | P1 | Wsparcie IT w panelu |
| **D. Flagi** | | | |
| SzybkaFlagaGodziny | apka | P1 | zmiana podpowiedzianych godzin, „Inna flaga” |
| SzybkaFlagaObsluga | apka | P1 | flaga wpisana w imieniu klienta |
| SzybkaFlagaBrzozowa | apka | P1 | flaga w stajni bez potwierdzeń |
| StatusFlagiOdwolaj | apka | P1 | odwołanie flagi ze skutkami |
| KlientFlagi | apka | P2 | lista flag klienta |
| SzybkaFlagaNieWyslano | apka | P2 | flaga niewysłana, bez duplikatu |
| **E. Tablet** | | | |
| TabletLogowanie | tablet | P1 | logowanie tabletu |
| TabletLogowanieKod | tablet | P1 | kod z SMS-a albo e-maila na tablecie |
| TabletWylogowany | tablet | P1 | po wylogowaniu i global sign-out |
| TabletBrakUprawnien | tablet | P1 | konto bez prawa do tabletu |
| TabletWyborStajni | tablet | P1 | stajnia tabletu przy kilku członkostwach |
| TabletPierwszyBoks | tablet | P1 | pierwszy wybór boksu |
| TabletBoksNiedostepny | tablet | P1 | odzyskanie: zapamiętany boks niedostępny |
| TabletBoksWoda | tablet | P1 | tablica z poidłem ręcznym i WODA |
| TabletBoksWolny | tablet | P1 | tablica wolnego boksu |
| TabletUstawienia | tablet | P1 | ukryte ustawienia: konto, boks, język tablicy, sieć |
| TabletDiagnostyka | tablet | P1 | lokalna diagnostyka |
| TabletOffline | tablet | P1 | brak sieci, kolejka zapisów |
| TabletAktualizacja | tablet | P1 | instalacja APK bez dotykania |
| TabletPopupZablokowany | tablet | P1 | pop-up na zablokowanym ekranie |
| TabletZawieszona | tablet | P2 | stajnia zawieszona |
| TabletWifi | tablet | P2 | zmiana sieci Wi-Fi |
| **F. Wyświetlacz** | | | |
| PanelLudzieWyswietlacze | panel | P1 | Ludzie z filtrem roli Wyświetlacz, instrukcja TV |
| WyswietlaczLogowanie | TV | P1 | logowanie telewizora |
| WyswietlaczKod | TV | P1 | kod z e-maila albo SMS-a |
| WyswietlaczWylogowany | TV | P1 | utrata sesji, dane ukryte |
| WyswietlaczStart | TV | P1 | zimny start bez sieci |
| WyswietlaczZablokowany | TV | P1 | konto zablokowane, stajnia zawieszona |
| WyswietlaczOffline | TV | P1 | brak sieci, dane z HH:MM |
| WyswietlaczHalaGlowna | TV | P2 | pełny ekran Hali głównej |
| WyswietlaczDuzoBoksow | TV | P2 | kafle skrócone, strony co 20 s |
| **G. Codzienna praca** | | | |
| ListaDniaOgarniete | apka | P1 | zaznaczanie boksów „Ogarnięte” |
| BoksSzczegolyWoda | apka | P1 | boks z poidłem ręcznym, „Woda”, przełącznik |
| EdycjaPlanuKonia | apka | P1 | plan karmienia i padoku |
| KartaKoniaKometa | apka | P2 | karta bez planu i jazd (Brzozowa) |
| StajennyKonieBrzozowa | apka | P2 | konie obsługi w Brzozowej |
| KartaKoniaObsluga | apka | P2 | karta konia dla obsługi |
| PrzeniesKonia | apka | P2 | przeniesienie konia w apce admina |
| MojBoksWyborKonia | apka | P2 | historia przy dwóch koniach |
| ListaDniaOffline | apka | P2 | lista dnia offline |
| **I. Strona www** | | | |
| StronaGlowna | www | P1 | prezentacja produktu, blog, wejście do panelu |
| StronaGlownaTelefon | www w telefonie | P1 | ta sama strona w telefonie |
| StronaWpis | www | P1 | wpis bloga |
| **S. Plansze zbiorcze stanów** | | | |
| StanyApka · StanyPanel · StanyTablet · StanyWyswietlacz | wszystkie | P1 | stany bez ● (2.1) |
| **H. P3** | | | |
| Powiadomienia | apka, panel | P3 | SMS i e-maile admina, tylko przy dec. 22 b |
| DodajJazde | apka | P3 | dodanie jazdy po dec. 20 |
| ZdrowieWpis | apka | P3 | wpis wizyty |
| HistoriaBoksu | apka | P3 | cel „Cała historia” |
| PanelBoksSzczegoly | panel | P3 | szczegóły boksu w panelu |
| PanelSzczegolFlagi | panel | P3 | flaga dla admina w panelu |
| PanelSzablonyFlag | panel | P3 | szablony i własne flagi |
| PanelPlatnosciZmiana | panel | P3 | plan, dane do faktury, metoda płatności |
| PanelHistoriaZmian | panel | P3 | audyt |
| LogowanieTotp | apka, panel | P3 | TOTP, tylko przy dec. 7 c |
| KartaKoniaBella | apka | P3 | karta Belli |
| TabletEkranZablokowanyBrzozowa | tablet | P3 | blokada w Brzozowej |
| ListaDniaPusta | apka | P3 | lista dnia stajni bez koni |
| WyswietlaczPlanszeTestowe | TV | P3 | overscan i retencja (W-09, W-10) |

### A. Apka: logowanie, zaproszenia, konto

**LogowanieNumer** · apka, niezalogowany · 390×844 · P1 · erd pkt 6; szcz. 4.2; dev §5 pkt 1–2
- Treść: nagłówek jak Logowanie (logo 60 px na accent-soft, „EQUENOR” 28 px, pod nim hasło „Equestrian Management, Refined” ok. 14 px, `ink-2`), bez paska; H1 „Zaloguj się”; przełącznik „Telefon | E-mail” (2.3), wybrany Telefon: +48 „600 *** 412” (Anna); „Wyślemy kod SMS-em albo e-mailem. Konto nie ma hasła.”; „Wyślij kod”; „Masz zaproszenie ze stajni? Wpisz numer albo e-mail, na który przyszło.”; mniejszym „Prowadzisz stajnię? Załóż konto firmy w panelu web.” (dec. 1); Polityka prywatności.
- Stany: zły format („Wpisz 9 cyfr numeru”); numer spoza Polski (tekst zależy od szcz. 2.5 i §5 pkt 24; przy blokadzie krajów „Obsługujemy tylko numery z Polski (+48)”); limit wysyłek („Spróbuj ponownie za kilka minut”); brak sieci; E-mail (zły format: „Wpisz poprawny adres e-mail”). „600…”, „+48 600…”, „0048…” to ten sam numer, bez stanu.

**LogowanieBlad** · wariant Logowanie · 390×844 · P1 · szcz. 3.6 etap 1, 4.2
- Treść: układ Logowanie, numer zamaskowany, 6 pól z ramką „uwaga”: „Zły kod. Sprawdź SMS i wpisz go ponownie.”; „Wyślij kod ponownie”, „Zmień numer”.
- Stany: kod wygasł (po 10 min, aktywne „Wyślij nowy kod”); za dużo prób; „Nie dostałeś SMS? Sprawdź numer albo wyślij ponownie”.

**BrakDostepu** · apka, zalogowany bez członkostwa · 390×844 · P1 · erd pkt 3, 6; szcz. 3.3 access, 4.2, A-06, §5 pkt 20
- Treść: osoba z wygasłym zaproszeniem obsługi (+48 512 *** 908); logo, bez paska i przełącznika; H1 „Nie masz jeszcze dostępu do stajni”; karta „uwaga”: „Zaproszenie wygasło · Stajnia Pod Lipami · Obsługa · było ważne do czw 08.10”, „Poproś admina stajni o nowe zaproszenie na ten numer albo e-mail.”; „Prowadzisz stajnię? Załóż konto firmy w panelu web: [PANEL]” (dec. 1); „Sprawdź ponownie” (główny, `GET /me/memberships`), „Zaloguj się innym numerem albo e-mailem”, „Wyloguj”; bez telefonu stajni (dec. 25).
- Stany: brak zaproszenia na ten numer albo e-mail (także numer przejęty po innej osobie: dostęp idzie za kontem, szcz. 4.2); zaproszenie odwołane; członkostwo dezaktywowane („Twój dostęp do Stajni Pod Lipami zakończył się”).

**WiadomosciSms** · plansza z treścią SMS · 390×844 · P1 · erd pkt 6; szcz. 2.5, 3.3 notifications, 4.2, A-02, §5 pkt 24
- Treść: wątek od nadawcy „EQUENOR” (nazwa: szcz. §5 pkt 24); pod dymkiem liczba znaków i segmentów (polskie znaki: segment 70): zaproszenie Marka „Stajnia Pod Lipami zaprasza Cię do EQUENOR jako klienta (koń: Luna). Pobierz aplikację: [WWW]/app i zaloguj się tym numerem. Ważne do 15.10.” (bez tokenu); kod „Kod EQUENOR: 482913”, bez linku; eskalacja do Damiana (A-02) „EQUENOR: Bella · Hala nowa · boks 4 · „Nie na padok” niepotwierdzona. Sprawdź tablet albo potwierdź w aplikacji.”; obok wersja UA zaproszenia obsługi (dec. 8).
- Stany: ponowne zaproszenie (+48 512 *** 908); e-mail zaproszenia (Kuba, k•••@stajnielipowe.pl) i e-mail z kodem (dec. 7).

**ZaproszenieStrona** · www w telefonie · 390×844 · P1 · analiza 8.1; erd pkt 6; dev 2
- Treść: znak; H1 „Masz zaproszenie do stajni?”; kroki: pobierz EQUENOR (App Store, Google Play), zaloguj się numerem albo e-mailem, na który przyszło zaproszenie, przyjmij je w apce; „Zarządzasz stajnią? Panel: [PANEL]”; bez tokenu i danych zaproszenia.
- Stany: otwarcie na komputerze (QR do sklepów, propozycja).

**ZaproszeniePrzyjmij** · apka, pierwsze logowanie zaproszonej osoby · 390×844 · P1 · dec. 4, 6, 9 · erd pkt 3, 6, 14; szcz. 3.3 access, 4.2, A-06, A-17
- Treść: Marek Nowak; logo, bez paska; H1 „Masz zaproszenie”; karta „Stajnia Pod Lipami zaprasza Cię” · „Klient: widzisz konia i jego boks, ustawiasz flagi.” · „Koń: Luna · jeszcze bez boksu” · „Zaprosił: Damian (admin)” · „Ważne do czw 15.10”; „O Tobie” (tylko nowe konto): „Imię i nazwisko” = Marek Nowak (podpowiedź z zaproszenia), „Tak zobaczy Cię obsługa przy Twoich flagach.”, język Polski | Українська | English, polityka prywatności; „Przyjmij zaproszenie”; „To nie mój numer · Wyloguj”.
- Stany: Obsługa: Bartek (+48 512 *** 908, nowe zaproszenie), „Zobaczysz wszystkie konie, szybkie akcje i zadania.”; Instruktor (Marta) i Wsparcie IT (Kuba, opis z erd pkt 14); kilka zaproszeń (lista kart); „Przyjmuję…”; 409 „To zaproszenie zostało już przyjęte”; po terminie → BrakDostepu.
- ● **ZaproszenieNoweStajnia** (dec. 5): arkusz na ekranie startowym apki (logo na accent-soft, scena czw 01.10): „Stajnia Brzozowa zaprasza Cię jako Klient · Kometa · boks 1 · Zaprosił: Damian (admin) · ważne do czw 08.10”, „Przyjmij”, „Później”; po przyjęciu toast „Masz teraz 2 stajnie” i przełącznik w nagłówku. Stan: Ola, którą Damian przypisał do Brzozowej w Ludziach, bez zaproszenia (szcz. 3.3 access, A-23): przy najbliższym odświeżeniu toast „Masz teraz dostęp do Stajni Brzozowej” i przełącznik w nagłówku, bez arkusza i „Przyjmij” (propozycja).

**MainLuna** · wariant Main · 390×844 · P1 · erd pkt 1, 3; szcz. A-04, A-06
- Treść: „Stajnia Pod Lipami” bez ▾, bez dzwonka; H1 „Dzień dobry, Marek”; jednorazowa karta „Witaj w Stajni Pod Lipami” z „Zamknij”; „Luna · bez boksu · w stajni od pn 12.10”, „Brak aktywnych flag”, „Luna nie ma jeszcze boksu. Flagi Luny obsługa widzi w apce, a na tablecie przy boksie pojawią się po przypisaniu boksu.”; bez linii rutyny; „Szybka flaga · dla: Luna”, 7 kafelków z Derką; pasek klienta.
- Stany: po pierwszej fladze „Bez kolacji · dziś 17:00–20:00 · niepotwierdzona” (okno: propozycja, szcz. §5 pkt 27); po przypisaniu do Hala nowa · boks 6 (A-04) karta jak u Kasztana, historia od dnia przypisania, bez Wichra; Historia przed przypisaniem: „Historia boksu pojawi się, gdy Luna dostanie boks”.

**Profil** · apka, wszystkie role · 390×960 · P1 · dec. 12, 33 · erd pkt 2, 6; szcz. 2.1, 2.7, 2.8, 3.3 identity, 4.2, T-23; analiza 8.5
- Treść: Ola z paskiem obsługi; H1 „Profil”; „Ty”: Ola („Zmień”), „+48 607 *** 218” ze „Zmień numer”; „Język aplikacji”: Polski | Українська | English; „Moje stajnie”: Stajnia Pod Lipami · Obsługa (✓), Stajnia Brzozowa · Obsługa; „Sesja”: „Wyloguj”, „Wyloguj ze wszystkich urządzeń” („Wyloguje też tablety przy boksach zalogowane tym kontem.”), „Usuń konto” (tekst destrukcyjny); polityka prywatności, wersja.
- Stany: Anna (pasek klienta); ● **ProfilAdmin** (Damian): „Zarządzanie stajnią · w panelu web” (Pulpit, Konie, Ustawienia stajni, Płatności „Subskrypcja aktywna”), „Usuń konto” zablokowane: „Jesteś jedynym adminem konta firmy, więc nie możesz teraz usunąć konta.”; dialog „Wyloguj ze wszystkich urządzeń?”; dialog usunięcia „Twoje dane osobowe zostaną usunięte, a wpisy w historii stajni zostaną bez nazwiska.” (`DELETE /me`).

**PrzelacznikStajni** · apka, arkusz nad Main · 390×844 · P1 · dec. 21 · szcz. 3.3 access, stable, 4.2, A-17
- Treść: Anna; Main pod nakładką rgba(46,36,29,.40); „Twoje stajnie”, wiersze 64 px: „Stajnia Pod Lipami · Klient · Kasztan, Bella” (✓ teraz), „Stajnia Brzozowa · Klient · Kometa · flagi obowiązują od razu”; „Każda stajnia ma własne ustawienia. Po zmianie zobaczysz tylko to, co ta stajnia włączyła.”; „Zamknij”.
- Stany: Ola (Obsługa w obu, „bez zadań” przy Brzozowej); pierwsze logowanie (bez ✓ i „Zamknij”); „Wczytuję ustawienia Stajni Brzozowej…”; offline z „1 niewysłany zapis w Stajni Pod Lipami”.

**ZaproszenieObsluga** · wariant Zaproszenie · 390×844 · P2 · erd pkt 3; szcz. 3.3 access
- Treść: Damian; toast OK „Wysłano nowe zaproszenie SMS · ważne do wt 20.10”; SMS, „+48 512 *** 908”, Obsługa (bez konia), „Imię (widzi tylko admin)” = Bartek; „Wysłane zaproszenia”: „+48 512 *** 908 · Obsługa · czeka · ważne do 20.10” z „Odwołaj”, poprzednie „wygasło 08.10 · wysłano nowe”, „Marek Nowak · Klient · Luna · wygasa za 2 dni”.
- Stany: odwołane; przyjęte („przyjęte 13.10 07:24 · Bartek”); błąd wysyłki.

**LudzieAdmin** · apka admina · 390×960 · P2 · jak PanelLudzie
- Treść: Damian; H1 „Ludzie”, „+ Zaproś osobę”, chipy Wszyscy · Obsługa · Klienci · Inne; grupy jak PanelLudzie; „Telewizor korytarz · Wyświetlacz” z „zarządzanie w panelu”; „Zaproszenia”.

**ProfilZmianaNumeru** · apka · 390×844 · P2 · erd pkt 6; szcz. 4.2
- Treść: nowy numer, kod SMS na nowy numer, „Stary numer przestanie służyć do logowania. Stajnie i dostępy zostają przy koncie.”
- Stany: zły kod; numer należy do innego konta.

**StronaUsunKonto** · www w telefonie · 390×844 · P2 · szcz. 2.1; analiza 8.5; erd pkt 6
- Treść: „Usuń konto EQUENOR”: co usuwamy (dane osobowe, konto logowania), co zostaje (wpisy w historii stajni bez nazwiska); kroki: apka → Profil → Usuń konto; kontakt [E-MAIL]; formularz: numer albo e-mail i kod (propozycja).

**MainBezKonia** · wariant Main · 390×844 · P2 · dec. 24 · erd pkt 3; szcz. 4.2, §5 pkt 20
- Treść: Tomasz L., dostęp do Groma zakończony 12.10 (poza seedem); karta neutralna „Nie masz teraz dostępu do żadnego konia w tej stajni. Dostęp do Groma zakończył się 12.10.”; bez kafelków flag; pasek Konie | Profil (propozycja).
- Stany: dostęp odebrany przez admina („Admin stajni zakończył dostęp 13.10 07:00”); klient z drugą stajnią (przełącznik zostaje).

**StajniaZawieszona** · apka, wszystkie role · 390×844 · P2 · erd pkt 10; szcz. 3.3 board, §5 pkt 20
- Treść: Anna; karta krytyczna „Stajnia Pod Lipami jest teraz nieaktywna w EQUENOR. Flagi i plany nie są pokazywane. Nie polegaj na aplikacji, zadzwoń do stajni.”; bez koni i kafelków; przełącznik do Brzozowej działa; pasek tylko z Profilem (propozycja).
- Stany: admin („Płatność po terminie · zapłać w panelu web”); obsługa (bez szybkich akcji); „Zaktualizuj aplikację” (`client_upgrade_required`).

### B. Panel: logowanie, stajnia, ludzie

**PanelLogowanie** · panel, niezalogowany · 1440×900 fill · P1 · dec. 7, 18 · szcz. 3.6 etap 1, §5 pkt 1, 15; analiza §9
- Scena: Damian, pn 07.09 (rejestracja konta firmy).
- Treść: tło bg, bez menu; karta 440 px: logo, „EQUENOR” z hasłem „Equestrian Management, Refined” pod spodem, H1 „Zaloguj się do panelu stajni”; przełącznik „Telefon | E-mail” (2.3), +48 „602 *** 145”, „Wyślemy kod SMS-em albo e-mailem. Konto nie ma hasła.”, „Wyślij kod”; obok neutralnie „Panel web stajni: hale i boksy, konie, ludzie, ustawienia, płatności.”, a „Obsługa i klienci pracują w apce EQUENOR.” tylko przy dec. 18 a; Regulamin, Polityka prywatności.
- Stany: ● **PanelLogowanieKod** (6 pól, „Kod jest ważny 10 minut”, „Wyślij ponownie za 0:42”, „Zmień numer” albo „Zmień e-mail”); zły albo wygasły kod; limit prób.

**PanelWitaj** · panel, bez konta firmy i członkostwa · 1440×900 fill · P1 · dec. 1, 9, 18 · erd pkt 6, 15; szcz. 3.3 identity (`GET /me`, `PATCH /me`), access; analiza §9
- Treść: Damian przy pierwszym logowaniu, pn 07.09 (kod nie daje imienia); karta „Witaj w EQUENOR”: (1) „Jak się nazywasz?”: „Imię i nazwisko” = Damian, język Polski | Українська | English, „Zapisz”, link do polityki; (2) „Nie należysz jeszcze do żadnej stajni.”: „Załóż konto firmy” (główny, → PanelRejestracjaFirmy) i „Czekasz na zaproszenie?” („Poproś admina stajni o zaproszenie na +48 602 *** 145 i odśwież stronę.”); „Wyloguj”.
- Stany: oczekujące zaproszenie (karta jak ZaproszeniePrzyjmij z „Przyjmij”); profil uzupełniony (tylko część 2); przy dec. 18 a rola inna niż Admin (Ola): „Panel web jest dla admina stajni. Flagi, szybkie akcje i zadania masz w apce EQUENOR.” z linkami do sklepów.

**PanelRejestracjaFirmy** · panel · 1440×900 fill · P1 · dec. 1, 3, 35 · erd pkt 14, 15
- Treść: Damian, pn 07.09; nagłówek jak PanelZalozStajnie, bez menu; H1 „Załóż konto firmy”; „NIP” 123-456-32-18, „Nazwa firmy” Stajnie Lipowe sp. z o.o., „Adres siedziby” ul. Lipowa 12, 05-520 Konstancin-Jeziorna, „E-mail do faktur”; „NIP podajesz raz. Kolejne stajnie dodasz bez niego.”; „Zostaniesz adminem konta i będziesz mieć dostęp do wszystkich stajni firmy.”; „Dalej: załóż stajnię” → PanelZalozStajnie.
- Stany: „Ten NIP ma już konto w EQUENOR” (z podpowiedzią, żeby poprosić admina tego konta o zaproszenie, propozycja); zły NIP (cyfra kontrolna); „Zapisuję…”.

**PanelZalozStajnie** · panel, krok 1 z 2 · 1440×900 fill, wyższa w razie potrzeby · P1 · dec. 2, 3, 28 · analiza §5.5, §9; erd pkt 11, 15, 16, 17; szcz. 3.3 stable, §5 pkt 23, 27, 49
- Scena: Damian (admin konta) dodaje Stajnię Brzozową, czw 01.10; zapis dopiero na końcu kroku 2 (`POST /stables`), reszta w Ustawieniach stajni i „Dodaj halę”.
- Treść: nagłówek: znak, „Zakładasz stajnię”, „D Damian ▾”, bez menu; kroki „1 Stajnia · 2 Powiadomienia”; H1 „Załóż stajnię”; bez działalności i NIP-u (są w koncie firmy), języków tabletów (ustawia każdy tablet) i potwierdzeń flag; **Stajnia:** „Stajnia Brzozowa”, strefa „Europa/Warszawa”; **Adres:** „ul. Brzozowa 5, 05-500 Piaseczno”, „To adres pierwszej hali. Kolejne hale dodasz w Boksy i konie → Dodaj halę.”; **Boksy:** „od 1 do 6” i od razu lista 6 wierszy: numer, poidło automatyczne | ręczne, „Więcej ustawień ›”; „Ustaw dla wszystkich”; hala „Hala główna”, „Przy jednej hali nie pokazujemy podziału na hale.”, opcja „Bez boksów na razie”; **Pory posiłków:** 06:30, 12:00, 18:00 „codziennie”, „+ Dodaj porę”, etykiety UA i EN zwinięte; „Nowa stajnia ma włączone wszystkie usługi i potwierdzenia flag. Zmienisz je w Ustawieniach stajni.” (erd pkt 16); kolumna „Co dalej”: konie, zaproszenia, tablety, wyświetlacz (opcjonalnie); stopka „Dalej: powiadomienia” → PanelZalozPowiadomienia.
- Stany: walidacja (brak nazwy albo adresu, „od” większe niż „do”); „Ustaw dla wszystkich” (np. poidło ręczne w każdym wierszu); pierwsza stajnia zaraz po PanelRejestracjaFirmy (Pod Lipami, 07.09).

**PanelZalozPowiadomienia** · panel, krok 2 z 2 · 1440×900 fill · P1 · dec. 2, 7 · erd pkt 16, 17
- Treść: Damian, Stajnia Brzozowa, czw 01.10; nagłówek i kroki jak w kroku 1 („2 Powiadomienia”); H1 „Powiadomienia”; tabela: zdarzenia (flaga niepotwierdzona na czas, nowa flaga od klienta, przyjęte i wygasłe zaproszenie, faktura i nieudana płatność) × odbiorcy (Admin, Obsługa stajni) × kanał (SMS, e-mail), z checkboxami; przy eskalacji „Działa, gdy flagi wymagają potwierdzenia.”; „Zmienisz to później w Ustawieniach stajni.”; „← Wstecz”, „Załóż stajnię” → PanelPulpitStart.
- Stany: „Zakładamy stajnię…”; błąd „Nie udało się. Spróbuj ponownie, druga kopia nie powstanie.”

**PanelPulpitStart** · wariant PanelPulpit · 1440×900 fill · P1 · erd pkt 11, 16, 17; analiza §9
- Treść: Damian w dniu dodania Brzozowej (czw 01.10); nagłówek panelu („Stajnia Brzozowa ▾”, „D Damian (admin) ▾”), menu z Pulpitem; baner OK „Stajnia Brzozowa założona.”; „Pierwsze kroki”: ✓ Stajnia (ul. Brzozowa 5, Piaseczno); ✓ Boksy 1–6; ✓ Powiadomienia; ✓ Ustawienia „wszystko włączone, także potwierdzenia flag” z „Sprawdź”; ○ „Dodaj konia” (0 z 6 boksów zajętych); ○ „Zaproś osobę” (kto już jest w firmie, np. Ola, przypisuje się w Ludziach); ○ zaloguj tablety (3 kroki); ○ wyświetlacz (opcjonalnie, „Pomiń”; konto zaprasza się z rolą Wyświetlacz); kafle 6 boksów · 0 koni · osoby; puste karty, np. „Flagi pojawią się, gdy dodasz konie i klientów.”
- Stany: w połowie (5 koni, zaproszenia Pawła i Anny „czeka”, Ola „przypisana”); wszystko zrobione (karta znika: PanelPulpitBrzozowa).

**PanelDodajKonia** · panel, dialog · 1440×900 fill · P1 · dec. 6 · erd pkt 1, 3; szcz. 3.3 stable, access; A-04
- Treść: dialog nad „Boksy i konie” Pod Lipami, Damian dodaje Lunę (pn 12.10): „Imię” Luna; rasa, data urodzenia, zdjęcie (opcjonalne); „Boks”: „Bez boksu na razie” (wybrane) albo „Wolny boks”: „Hala główna · boks 3” / „Hala nowa · boks 6”, „Koń bez boksu nie pojawi się na tablecie. Obsługa widzi go w apce.”; „Klient”: „Zaproś klienta teraz” (SMS, numer, „Imię (widzi tylko admin)” = Marek Nowak, „Ważne do” czw 15.10 zamiast domyślnych 7 dni), „Później” albo „Koń bez klienta”; „Plan karmienia ustawisz w karcie konia.”; „Anuluj”, „Dodaj konia i wyślij zaproszenie”.
- Stany: zapisano (Luna w „Konie bez boksu”, „Klient: Marek Nowak · zaproszenie czeka”); 409 „Boks zajął inny koń, wybierz inny”.

**PanelZaprosOsobe** · panel, dialog · 1440×900 fill · P1 · dec. 6, 7, 8, 11, 33, 35 · erd pkt 3, 4, 6, 14; szcz. 3.3 access, 4.2, §5 pkt 24
- Treść: dialog nad PanelPulpitStart (Damian zaprasza Pawła do Brzozowej, czw 01.10); „Kanał: SMS | E-mail” jak w Zaproszenie (SMS); „+48 601 *** 377”; rola jako radio z opisami: Klient (wymaga konia), Obsługa (zaznaczona, „widzi wszystkie konie, robi szybkie akcje”), Instruktor, Wsparcie IT (opis z erd pkt 14), Wyświetlacz (konto telewizora); bez roli Admin (rola konta firmy, dec. 35); „Imię (widzi tylko admin)” = Paweł; „Język wiadomości” PL | UA; „Ważne do” czw 08.10 (domyślnie 7 dni); podgląd SMS; „Wyślij zaproszenie”; „Ola jest już w firmie? Przypisz ją do tej stajni w zakładce „Ludzie”.”
- Stany: Klient (wymagany „Koń”: Anna · Kometa); Instruktor; Wsparcie IT (Kuba, e-mail k•••@stajnielipowe.pl); Wyświetlacz (Pod Lipami, „Telewizor korytarz”, e-mail); wysłano (toast „Wysłano zaproszenie SMS · ważne do 08.10”); błąd wysyłki („Nie wysłano, spróbuj ponownie”); walidacja na jednym fragmencie: zły format numeru, „Ważne do” w przeszłości, Klient bez konia, na ten numer czeka już zaproszenie („Wyślij ponownie” zamiast nowego), osoba jest już członkiem z inną rolą („Zmień rolę w Ludzie”); klient już w stajni: „Nadaj dostęp do konia” (propozycja, dec. 33).

**PanelLudzie** · panel · 1440×900 fill · P1 · dec. 33 · erd pkt 3, 14; szcz. 3.3 access
- Treść: Damian; H1 „Ludzie · Stajnia Pod Lipami”, „Zaproś osobę”; zakładki Członkowie | Zaproszenia 2; filtr roli (chipy, także „Wyświetlacz”), wyszukiwarka; tabela (Osoba, Rola, Konie, Kontakt zamaskowany, Status, Akcje): Damian · Admin konta (wszystkie stajnie); Ola, Piotr · Obsługa; Anna · Klient · Kasztan, Bella; Karolina W. · Iskra; Tomasz L. · Grom; Ewa K. · Sonata; Marta · Instruktor, Kuba · Wsparcie IT; Telewizor korytarz · Wyświetlacz · t•••@stajnielipowe.pl; akcje „Zmień rolę”, „Dezaktywuj”, u klienta „Konie i dostęp” (`valid_to`, `revoked_at`).
- Stany: zakładka Zaproszenia (Marek Nowak „wygasa za 2 dni” z „Odwołaj”; +48 512 *** 908 „wygasło 08.10” z „Wyślij ponownie”; filtr przyjętych i odwołanych); dezaktywacja („Dostęp znika od razu. Tablety zalogowane tym kontem pokażą brak uprawnień.”); nadanie dostępu do kolejnego konia; przypisanie do tej stajni osoby, która jest już w firmie (Ola do Brzozowej, bez zaproszenia, szcz. 3.3 access, A-23; propozycja); nowa stajnia (pusta lista, admin konta tylko w nagłówku).

**PanelPrzeniesKonia** · panel, dialog · 1440×900 fill · P1 · erd pkt 1; szcz. 3.3 stable, 3.6 etap 2, A-04
- Treść: „Przenieś konia · Wicher” nad PanelBoksy: wolne boksy z halą („Hala główna · boks 3”, „Hala nowa · boks 6”), „Zamień z…”, „Wyjazd ze stajni” ze skutkami (zamyka flagi, plany, dostępy i jazdy; koń zostaje w historii, `horse.left`).
- Stany: 409 przy wyścigu o boks; „Przypisz konia” do wolnego boksu (lista koni bez boksu: Luna); „Przypisz boks” Luny do „Hala nowa · boks 6” (A-04).

**PanelPulpit** · panel · 1440×900 fill · P1 · erd pkt 3, 12, 13; szcz. 3.2, A-02, A-14
- Treść: Damian, nagłówek „Stajnia Pod Lipami ▾”; H1 „Pulpit · Stajnia Pod Lipami · stan na wt 13.10.2026, 07:15”; alert „uwaga” „Bella · Hala nowa · boks 4 · Nie na padok · dziś, cały dzień · niepotwierdzona od 01:20 · wysłano SMS i e-mail”, „Zobacz flagę”; kafle 2 hale · 14 boksów · 13 koni · 1 koń bez boksu; „Dziś w halach”: Hala główna (śniadanie ✓ 06:40 · Ola bez Kasztana, padok 10:00 · 4 konie, Ogarnięte 4 z 8), Hala nowa (✓ 06:50 · Piotr, padok 10:00 · 3 konie bez Belli, Ogarnięte 3 z 6, „Poidło ręczne · boks 5 · woda 06:55”); „Flagi dziś” (5); „Wizyty i jazdy”; „Zadania” do odczytu z „Zadania dodajesz w apce”; „Ludzie” (zaproszenia); „Subskrypcja: Aktywna · plan Stajnia · następna faktura 01.11.2026”.
- Stany: bez pilnych flag; przyciski obsługi wyłączone (jak PanelBoksyBezAkcji); pusta stajnia → PanelPulpitStart; płatność po terminie albo zawieszenie (baner).

**PanelPulpitBrzozowa** · wariant PanelPulpit · 1440×900 fill · P2 · dev 3.2
- Treść: Damian po przełączeniu na Brzozową; bez alertów i hal; śniadanie ✓ 06:35 · Paweł bez Komety; Ogarnięte 3 z 6; flagi Komety i Lorda „obowiązują od razu”; „Stajnia nie ma wyświetlacza” z „Zaproś osobę”.

**PanelMenuKonta** · panel, popover · 1440×900 fill · P2 · dec. 1, 3 · erd pkt 15; szcz. 3.3 stable, 4.2
- Treść: popover 320 px nad PanelPulpit: „Damian · admin konta · Stajnie Lipowe sp. z o.o.”, telefon i e-mail zamaskowane, „Profil i język”, „Konto firmy” (NIP, siedziba; na PoC do odczytu, propozycja), „Stajnie firmy” (Stajnia Pod Lipami ✓, Stajnia Brzozowa), „Załóż stajnię” (→ PanelZalozStajnie, bez NIP-u), „Wyloguj”, „Wyloguj ze wszystkich urządzeń” z dopiskiem o tabletach.

**PanelKonie** · panel · 1440×900 fill · P2 · erd pkt 1; szcz. 3.3 stable
- Treść: Damian; H1 „Konie · 13 koni · 1 bez boksu”, „Dodaj konia”; filtr hali, chipy Wszystkie · Z flagą · Bez boksu · Odeszły, wyszukiwarka; kolumny Koń, Boks z halą, Klient, Aktywne flagi z godzinami, Plan karmienia, Najbliższa wizyta, Akcje (Karta, Flaga, Przenieś); np. Kasztan · Główna 7 · Anna · Bez śniadania 06:00–10:00, Nie na padok od 14:30 · wet 08:00; Bella · Nowa 4 · Anna · niepotwierdzona; Luna · bez boksu · Marek Nowak (zaproszenie czeka) · „Przypisz boks”.
- Stany: filtr „Bez boksu” (Luna); pusta stajnia („Dodaj pierwszego konia”); „Odeszły” pusty w seedzie.

**PanelDodajHale** (jest, poprawka po decyzji 13.10) · panel · 1440×900 fill · erd pkt 11
- Boksy jak w PanelZalozStajnie: po zakresie („od 1 do 6”) od razu lista boksów, w wierszu numer, poidło automatyczne | ręczne i „Więcej ustawień ›”; „Ustaw dla wszystkich”.

**PanelEdytujHale** · wariant PanelDodajHale · 1440×900 fill · P2 · erd pkt 11; szcz. 3.3 stable, A-11
- Treść: Hala nowa: nazwa, adres ul. Polna 3, kolejność, „Aktywna”, „Usuń halę” nieaktywne z „Hala ma 6 boksów”; „+ Dodaj boks” (wiersz jak w PanelDodajHale: numer, poidło, „Więcej ustawień ›”).
- Stany: przeniesienie boksu do innej hali (zachowuje `id` i historię, A-11); wyłączenie hali (`active = false`); usunięcie pustej hali; 409 przy hali z boksami.

**PanelSlowniki** · panel, zakładka ustawień · 1440×900 fill · P2 · dec. 34 · erd pkt 9; szcz. 3.3 (`stable.created`)
- Treść: zakładki Pasze | Padoki | Ujeżdżalnie; pasze z rodzajem (`feed | supplement | medicine`) i jednostką (`kg | g | miarka | szt`): owies, siano, suplement X, wysłodki, sieczka; Padok A, Padok B; kryta ujeżdżalnia z pojemnością; „+ Dodaj”; pozycja użyta w planach tylko „Wyłącz” (`active`, propozycja).
- Stany: 412; nowa stajnia (słowniki z `stable.created`).

**PanelUstawieniaOgolne** · panel, zakładka ustawień · 1440×900 fill · P2 · dec. 28 · erd `stables`, `stable_settings`, `meal_slots`; szcz. 3.3 stable
- Treść: Damian: nazwa i strefa stajni (bez języków: język ustawia każdy tablet); „Eskalacje”: ostrzeżenie na tablicy 30 min, powiadomienie admina 15 min; „Powiadomienia”: tabela jak w PanelZalozPowiadomienia; „Autor flagi na tablecie”: rola, inicjał albo imię; „Klient edytuje plan karmienia”; „Jazdy” (`rides_enabled`); pory posiłków 06:30, 12:00, 18:00; „Okno instalacji aktualizacji tabletów”.
- Stany: 412 przy równoległej edycji.

**PanelUstawieniaZapis** · wariant PanelUstawieniaStajni · 1440×900 fill · P2 · szcz. 3.3 stable, flags, A-19, §5 pkt 48
- Treść: Damian wyłącza Derkę; dialog „Wyłączyć Derkę? Trwa 1 flaga: Sonata · Derka: zakładać · 16:00–08:00. Zostanie do końca okna, zniknie tylko kafelek.” (propozycja z szcz. §5 pkt 48).
- Stany: częściowy zapis dwóch żądań („Zapisano ustawienia, flag nie. Spróbuj ponownie.”); 412 („Ustawienia zmienił ktoś inny, odśwież”).

### C. Ekrany główne ról

**MapaNawigacjiRol** · plansza dokumentacyjna w stylu panelu · 1440×900 fill · P1 (paczka 0) · erd pkt 14, 16; szcz. A-17, A-21
- Treść (jedyny opis nawigacji ról):
  - „Po zalogowaniu”: LogowanieNumer → Logowanie → 0 członkostw: ZaproszeniePrzyjmij albo BrakDostepu; 1 stajnia: start roli; kilka: ostatnio używana, przy pierwszym logowaniu PrzelacznikStajni;
  - Klient: Main; Konie → Main, Flagi → KlientFlagi [flags], Historia → MojBoks albo MojBoksWyborKonia [box_history], Profil; jazdy w „Dziś” karty konia [rides];
  - Obsługa: ListaDnia; Konie → StajennyKonie, Zadania → StajennyZadania [tasks], Profil;
  - Admin w apce: AdminDzis; Boksy → BoksyAdmin, Zadania → AdminZadania, Ludzie → LudzieAdmin, Profil → ProfilAdmin (dec. 17);
  - Admin w panelu: PanelPulpit; Boksy, Konie → PanelKonie, Ludzie → PanelLudzie, Płatności, Ustawienia, konto → PanelMenuKonta;
  - Instruktor: InstruktorJazdy [rides + `rides_enabled`]; Flagi [flags]; Profil. Wsparcie IT: WsparcieITStart [device_diagnostics], Profil; w panelu PanelDiagnostyka;
  - Wyświetlacz (zwykłe konto z rolą Wyświetlacz): WyswietlaczLogowanie → WyswietlaczKod → WyswietlaczCentralny (domyślnie wszystkie hale) ⇄ „Pełny ekran” WyswietlaczHala albo WyswietlaczHalaGlowna;
  - Tablet: TabletLogowanie → (TabletWyborStajni) → TabletPierwszyBoks → TabletBoks; przytrzymanie „ONLINE · aktualne na …” → TabletUstawienia;
  - legenda: ✓ istnieje, ● P1, ○ P2 i P3; [funkcja] znika, gdy jest odznaczona dla roli; „Admin widzi wszystko”;
  - dopisek: Admin to rola konta firmy (wszystkie stajnie firmy, dec. 35), a pozostałe role są per stajnia, jedna w stajni (`stable_members`), więc zmiana stajni może zmienić nawigację; przypadku „staff w jednej, client w drugiej” z szcz. 4.2 dane demo nie mają.

**AdminDzis** · apka admina, wariant ListaDnia · 390×1160 · P1 · dec. 17, 22, 23 · erd pkt 3, 12, 13, 16; szcz. A-02, A-14, A-18; dev 3.2
- Dlaczego nie sama ListaDnia: szcz. 3.5.1 daje ją obsłudze i adminowi, ale admin dostaje eskalację (A-02) i ma sprawy do załatwienia. Plik kopiuje układ ListaDnia („Szybkie akcje”, „Flagi dziś”) i dokłada „Pilne”, „Wizyty”, „Do załatwienia” i pasek admina.
- Treść: Damian; „Stajnia Pod Lipami ▾” (2 stajnie firmy, dec. 21), „Damian · Admin”; H1 „Dziś · wt 13.10”; „Pilne”: „Bella · Hala nowa · boks 4 · Nie na padok · dziś, cały dzień · niepotwierdzona od 01:20 · dostałeś SMS i e-mail”, „Potwierdzam”, „Zadzwoń do klienta (Anna)”; „Szybkie akcje” jak ListaDnia (śniadanie Główna 06:40 · Ola bez Kasztana, Nowa 06:50 · Piotr, „Cofnij”; padok 10:00: Główna 4 konie, Nowa 3 bez Belli; „Ogarnięte 7 z 14 · Zaznacz boksy”); „Flagi dziś”: Kasztan (dwie), Bella, Hetman, Sonata; „Wizyty”: wet 08:00 i kowal 15:00 · Kasztan, jazda 16:00 · Iskra; „Zadania”: 1 do wzięcia · 1 w toku (Piotr) · 1 zrobione, „+ Dodaj zadanie”; „Do załatwienia”: Luna bez boksu („Przypisz boks”), Marek Nowak · zaproszenie wygasa czw 15.10, +48 512 *** 908 · zaproszenie wygasło 08.10 („Wyślij ponownie”); pasek Dziś · Boksy · Zadania · Ludzie · Profil.
- Stany: ● **AdminDzisBrzozowa** (Damian po przełączeniu na Brzozową, 390×960: bez „Pilne”, padoku i hal; „Podano śniadanie ✓ 06:35 · Paweł”, pominięta Kometa; „Ogarnięte 3 z 6”; flagi Komety i Lorda „obowiązują od razu”; „Zadania: brak”, „Obsługa nie widzi zadań w tej stajni”); bez pilnych flag; przyciski obsługi wyłączone (jak ListaDniaBezAkcji); pusta stajnia (karta „Pierwsze kroki” z linkami do panelu); offline; subskrypcja po terminie (baner „uwaga”).

**AdminZadania** · apka admina · 390×960 · P1 · erd pkt 13; szcz. 3.3 tasks, 4.2, A-14
- Treść: Damian; H1 „Zadania”, „+ Dodaj zadanie”; „Do wzięcia”: „Poidło w boksie 5 do wymiany · Hala nowa · boks 5 · dodał Damian wczoraj 18:20”, „Odwołaj”; „W toku”: „Wymienić żarówkę w korytarzu · Hala główna · Piotr od 07:00”; „Zrobione dziś”: „Przywieźć słomę z magazynu · Ola 06:30”; „Obsługa bierze zadania w apce. Tablet ich nie pokazuje.”; pasek admina.
- Stany: ● **AdminZadaniaNowe** (arkusz: tytuł „Sprawdzić zasuwę w boksie 3” (propozycja), notatka, „Dotyczy”: Cała stajnia | Hala | Boks | Koń, wybrany „Hala główna · boks 3”, „Dodaj zadanie”, „Anuluj”); odwołanie z potwierdzeniem („Zniknie z listy obsługi.”); brak zadań.

**InstruktorJazdy** · apka instruktora · 390×844 · P1 · dec. 20 · erd pkt 9, 14; szcz. 3.2, 3.3 rides, A-21, §5 pkt 50
- Treść: konto `instructor` „Marta”, w obu stajniach: „Stajnia Pod Lipami ▾”, „Zalogowana: Marta · Instruktor”; H1 „Jazdy · wt 13.10”; „Dziś”: „16:00 · Iskra · Hala główna · boks 1 · kryta ujeżdżalnia · jeździec: Karolina W. (propozycja) · bez flag”; „Jutro i dalej: brak jazd”; „Flagi koni dziś” tylko do odczytu (propozycja): Kasztan, Bella, Hetman, Sonata; bez kontaktów do klientów; pasek Jazdy | Flagi | Profil.
- Stany: koń z flagą o skutku `no_riding` (ostrzeżenie „uwaga” przy jeździe); pusty dzień; `rides_enabled = false` albo odznaczone `rides` (start na Flagach).

**WsparcieITStart** · apka Wsparcia IT · 390×960 · P1 · dec. 13, 19 · erd pkt 2, 14; szcz. 2.12, 4.2, A-21, §5 pkt 11, 30, 50
- Treść: konto `it_support` „Kuba”, „Stajnia Pod Lipami ▾”; H1 „Wsparcie IT” i opis roli dosłownie; „Tablety”: „EQUENOR nie prowadzi listy tabletów. Stan tabletu sprawdzisz na miejscu: przytrzymaj 5 s „ONLINE · aktualne na …” w stopce → Diagnostyka.”; „Hale i boksy”: same numery (Hala główna 1–8, Hala nowa 1–6); „Aktualizacje tabletów”: [WERSJA], rollout, okno [OD–DO] (`app_releases`, `maintenance_from`/`to`); „Wyświetlacze”: „Telewizor korytarz” · aktywne (blokuje admin); „Instrukcje”: przygotowanie tabletu, zmiana Wi-Fi, instalacja telewizora; „Logi i błędy” [LINK]; pasek Start | Profil.
- Stany: odznaczone `device_diagnostics` („W tej stajni nie masz dostępu do diagnostyki”).

**PanelDiagnostyka** · wariant WsparcieITStart w panelu · 1440×900 fill · P1 · jak WsparcieITStart
- Treść: te same karty w dwóch kolumnach; menu z jedną pozycją „Diagnostyka”; konta wyświetlaczy w podglądzie, bez akcji.

### D. Flagi

**SzybkaFlagaGodziny** · arkusz nad SzybkaFlaga · 390×844 · P1 · erd pkt 12; szcz. 3.3 flags, A-01, A-12, A-18
- Treść: Anna o 03:16, Kasztan, kafel „Nie na padok” z podpowiedzią „dziś 10:00–16:00” (padok B); arkusz „Kiedy”: Dziś | Jutro | data; „Od” 14:30, „Do” 16:00 (A-01); „Wariantu „do odwołania” nie ma.”; „Zapisz godziny”.
- Stany: koniec przed początkiem (422, „Koniec musi być po początku”); okno przez północ (Derka 16:00–08:00, „do śr 14.10”); Brzozowa 06:00–09:00 (A-18); „Inna flaga” w SzybkaFlaga: wymagane pole „Nazwa flagi” (`custom_text`), godziny bez podpowiedzi (propozycja: od teraz do 23:59).

**SzybkaFlagaObsluga** · wariant SzybkaFlaga · 390×844 · P1 · dec. 32 · erd pkt 12, Słowniki; analiza §1.2; szcz. 3.6 etap 3, A-07, A-20
- Treść: Ola, „← Konie”; select „Dla konia: Iskra · Hala główna · boks 1”; 7 kafelków; „Klient prosił: telefon | SMS | osobiście” (`on_behalf_phone | on_behalf_sms | on_behalf_in_person`; flaga bez prośby klienta dopiero po dec. 32); „Klient: Karolina W.”; „Kiedy” z podpowiedzią; „Karolina W. zobaczy flagę z adnotacją „wpisała obsługa: Ola”.”
- Stany: Luna („Luna nie ma boksu, flaga nie trafi na tablet”, A-07); 07:25 po wyłączeniu potwierdzeń („obowiązuje od razu”, A-20); wejście admina z PanelBoksy.

**SzybkaFlagaBrzozowa** · wariant SzybkaFlaga · 390×844 · P1 · erd pkt 12, 16; dev 3.2; A-18
- Treść: Anna, 05:50; „Kometa · boks 1” bez hali; 6 kafelków, wybrany „Bez śniadania”; Od „dziś 06:00”, Do „dziś 09:00” (zmienione z podpowiedzi 06:00–10:00); notatka „dentysta o 8:30”; „W tej stajni flaga obowiązuje od razu, bez potwierdzania.”; „Wyślij flagę”.

**StatusFlagiOdwolaj** · wariant StatusFlagi, arkusz · 390×844 · P1 · erd pkt 12; szcz. 3.3 flags, 3.6 etap 4, A-03
- Treść: 07:16; „Odwołać flagę „Bez śniadania” · Kasztan?”; skutki: „Tablet i wyświetlacz zaktualizują się w kilka sekund. Śniadanie Hali głównej podano już o 06:40 bez Kasztana, odwołanie tego nie zmieni.”; „Odwołaj”, „Zostaw”.
- Stany: odwołanie przed podaniem posiłku („Wstrzymane śniadanie wraca do planu”, A-03); po odwołaniu „Odwołana 07:16” w historii; „Zmień” otwiera SzybkaFlaga z danymi flagi (nowa flaga z `replaces_flag_id`).

**KlientFlagi** · apka klienta · 390×960 · P2 · erd pkt 12
- StatusFlagi ma już „Inne flagi” (Bella, druga flaga Kasztana); dochodzi lista jako cel zakładki Flagi, chipy koni, historia zakończonych i odwołanych oraz „Nowa flaga”.
- Treść: Anna; H1 „Flagi”; chipy Wszystkie · Kasztan · Bella; „Teraz”: Bella · Nie na padok · dziś, cały dzień · niepotwierdzona („Admin stajni dostał powiadomienie”), Kasztan · Bez śniadania · 06:00–10:00 · potwierdzona 06:02; „Później dziś”: Kasztan · Nie na padok · od 14:30 · potwierdzona 06:02; „Zakończone i odwołane · 7 dni”: brak; pasek klienta.
- Stany: brak flag; bez widoczności `flags` zakładki nie ma.

**SzybkaFlagaNieWyslano** · wariant SzybkaFlaga · 390×844 · P2 · dec. 25 · szcz. 3.3 flags, 4.1, A-01
- Treść: Anna o 03:14, Kasztan, „Bez śniadania”, dziś 06:00–10:00, „Wet o 8:00, koń na czczo”; w stopce pole „uwaga” „Nie wysłano. Brak połączenia z serwerem. Flaga nie obowiązuje, dopóki jej nie zapiszemy.”; „Wyślij ponownie”, „Zadzwoń do stajni”; wpisane dane zostają.
- Stany: „Wysyłanie…”; „Zapisano na serwerze 03:14”; `422 target_passed` („Ten czas już minął, zmień godziny”); `409 option_disabled` („Stajnia wyłączyła tę flagę”).

### E. Tablet

„Rejestracja” tabletu to provisioning (`tools/provision-tablet`), logowanie i lokalny wybór stajni i boksu.

**TabletLogowanie** · tablet e-ink · 702×936 · P1 · dec. 12 · erd pkt 2; szcz. 2.4, 4.2, T-07, T-23, §5 pkt 5, 31; dev §5 pkt 5
- Treść: „EQUENOR”, pod nim hasło „Equestrian Management, Refined” (≥ 16 px, waga 500) · „tablet przy boksie”; H1 42 px „ZALOGUJ TABLET”; 22 px „Zaloguj się kontem obsługi albo admina stajni. Tablica nie pokaże, kto jest zalogowany.”; przełącznik „TELEFON | E-MAIL” (wybrany: czarne pole, biały pogrubiony tekst); „NUMER TELEFONU” +48 (64 px, ramka 2 px #000), klawiatura 3×4 (przy E-MAIL klawiatura QWERTY); „Wyślemy kod SMS-em albo e-mailem. Konto nie ma hasła.”; „WYŚLIJ KOD” (czarne pole, biały pogrubiony tekst); stopka „ONLINE · 07:15”, PL | UA; bez kłódki, „Zmień boks” i flag.
- Stany: ● **TabletLogowanieKod** („WPISZ KOD Z SMS”, „Wysłaliśmy kod na +48 607 *** 218”, 6 pól, „ZALOGUJ”, „WYŚLIJ PONOWNIE ZA 0:42” z ramką przerywaną, „ZMIEŃ NUMER”; zły kod: pole `t-warn`, ramka 4 px, „ZŁY KOD”); ● **TabletWylogowany** (H1 „TABLET WYLOGOWANY”, „Po zalogowaniu wróci: Hala główna · boks 7”, przyczyna: wylogowano tutaj, ze wszystkich urządzeń albo sesja wygasła; bez starych flag); ● **TabletBrakUprawnien** („TO KONTO NIE OBSŁUGUJE TABLETU · Zaloguj się kontem obsługi albo admina” dla Klienta, Instruktora i Wyświetlacza; stan „TO KONTO NIE MA JUŻ DOSTĘPU DO TEJ STAJNI · zaloguj się innym kontem” po dezaktywacji); brak sieci (stopka `t-warn` „BRAK POŁĄCZENIA · połącz Wi-Fi w ustawieniach”).

**TabletWyborStajni** · tablet · 702×936 · P1 · dec. 15 · dev 3.5; szcz. A-17, A-18
- Treść: Ola; H1 „WYBIERZ STAJNIĘ TEGO TABLETU”; kafle „STAJNIA POD LIPAMI · 2 hale · 14 boksów” i „STAJNIA BRZOZOWA · 6 boksów”; „Tablet pokaże tylko boksy wybranej stajni, z jej ustawieniami. Zmienisz to w ustawieniach.”
- Stany: wejście z ustawień (z „ANULUJ”); konto z jedną stajnią (ekran pominięty).

**TabletPierwszyBoks** · wariant TabletZmianaBoksu · 702×936 · P1 · erd pkt 2, 11; szcz. 4.2, T-07, §5 pkt 32; dev §5 pkt 16
- Treść: „WYBIERZ BOKS DLA TEGO TABLETU”, „Stajnia Pod Lipami”; zakładki HALA GŁÓWNA 1–8 i HALA NOWA 1–6 (wybrana); kafle 1 Grom, 2 Mgła, 3 Rumba, 4 Bella, 5 Bursztyn, 6 WOLNY (ramka przerywana); „Wybór zapisze się tylko na tym tablecie.”; bez „Anuluj” i powrotu po 30 s; stopka ONLINE, PL | UA.
- Stany: zakładka Hala główna (1 Iskra … 8 Hetman, 3 WOLNY); ● **TabletBoksNiedostepny** (odzyskanie: zapamiętany boks w wyłączonej hali albo bez dostępu konta; linia `t-warn` „Hala główna · boks 7 jest niedostępny dla tego konta. Wybierz inny.”; lista od razu, bez powrotu po 30 s; propozycja z szcz. §5 pkt 32).

**TabletBoksWoda** · wariant TabletBoks · 702×936 · P1 · erd pkt 2, 3, 16; szcz. 4.1, A-16
- Treść: „BOKS 5 · BURSZTYN”, „Hala nowa · wt 13.10 · 07:15”, kłódka, „Zmień boks”; bez flag: neutralna ramka „DZIŚ BEZ FLAG” (propozycja); KARMIENIE: plan Bursztyna (dec. 29); ramka 2 px „POIDŁO RĘCZNE · woda 06:55”; SZYBKIE AKCJE 2×2: OGARNIĘTE (dziś 07:14), ŚNIADANIE (podane 06:50), PADOK (A 10:00–14:00), WODA (06:55); OSTATNIE AKCJE „ostatnie · boks i koń”: 07:14 Ogarnięte; 06:55 Woda; 06:50 Podano śniadanie · Piotr (seed ma tylko te 3); bez zadania „Poidło w boksie 5 do wymiany”; stopka ONLINE, PL | UA.
- Stany: po WODA („woda 07:16”, „COFNIJ”); poidło przełączone na automatyczne (bez pola i WODA); przyciski obsługi wyłączone (SZYBKIE AKCJE tylko z WODA).

**TabletBoksWolny** · wariant TabletBoks · 702×936 · P1 · erd pkt 1, 3; szcz. 3.2, A-04, A-05
- Treść: „BOKS 6 · WOLNY”, „Hala nowa · wt 13.10 · 07:15”; bez banera flag i karmienia; SZYBKIE AKCJE: OGARNIĘTE (ostatnio 09.10 14:40), ŚNIADANIE (podane 06:50 · cała hala), PADOK (Hala nowa 10:00); OSTATNIE AKCJE „ostatnie · boks”: 06:50 Podano śniadanie · Piotr, 09.10 14:40 Ogarnięte · Piotr; kłódka, „Zmień boks”.
- Stany: po OGARNIĘTE (wpis „07:16 Ogarnięte” bez autora, A-05); po przypisaniu Luny („BOKS 6 · LUNA”, A-04).
- Stany TabletBoks (fragmenty): drugi PADOK tego dnia na innym tablecie hali (`already_done`, „Padok już wyprowadzony 10:00”, A-13); akcja wyłączona w międzyczasie (`409 option_disabled`, „Stajnia wyłączyła tę akcję”, A-19, propozycja); nowa zakładka hali w „Zmień boks” po „Dodaj halę” (A-08, A-11); boks przeniesiony do innej hali z nową halą w nagłówku (A-11).

**TabletUstawienia** · tablet, ukryte ustawienia · 702×936 · P1 · dec. 12, 13, 14, 28 · erd pkt 2; dev 3.5; szcz. 2.12, K-01, T-23, A-17, A-18, §5 pkt 30, 31, 40
- Treść: Ola, Hala nowa · boks 5; „USTAWIENIA TABLETU”, „ZAMKNIJ” (64 px); wiersze 80 px z czarną linią: KONTO „Zalogowano: Ola · Obsługa” → „WYLOGUJ”; STAJNIA „Stajnia Pod Lipami” → „ZMIEŃ” (tylko przy kilku stajniach); BOKS „Hala nowa · boks 5 · Bursztyn” → „ZMIEŃ BOKS”; JĘZYK TABLICY „Polski” → „PL | UA” („Tylko na tym tablecie.”; zapamiętany jak boks, przełącznik PL | UA w stopce tablicy zostaje); SIEĆ „Stajnia-PodLipami · 5 GHz · sygnał dobry” → „ZMIEŃ SIEĆ”; DIAGNOSTYKA → „OTWÓRZ”; EKRAN: profil palety „Kaleido 3 (automatycznie)” i „PLANSZA TESTOWA” (propozycja); stopka: wersja [WERSJA], „Ustawienia zamkną się po 2 min bez dotyku” (propozycja). Wejście: przytrzymanie 5 s samego tekstu „ONLINE · aktualne na …” w stopce tablicy (nie przycisków PL i UA), bez etykiety; opis w notatce kanwy.
- Stany: dialog „WYLOGOWAĆ? Tablica zniknie do ponownego logowania. Boks 5 zostanie zapamiętany.”; bez zalogowanego konta (tylko SIEĆ i DIAGNOSTYKA); konto Wsparcia IT („TRYB WSPARCIA IT”, same ustawienia, bez tablicy); zablokowany ekran (wejście nie działa).

**TabletDiagnostyka** · tablet, ukryte ustawienia · 702×936 · P1 · erd pkt 2; szcz. 2.12, T-10, T-11, T-13, T-16, N-01, N-04, §5 pkt 11
- Treść: „DIAGNOSTYKA”, „← USTAWIENIA”; tabela 22 px z `tabular-nums` (liczby: propozycja): URZĄDZENIE: Boox Note Air6 C, firmware [WERSJA], `ro.board.platform`, APK [WERSJA] (versionCode), Device Owner TAK, Lock Task TAK; BOKS: Hala nowa · boks 5, id [UUID…], Stajnia Pod Lipami; SIEĆ: SSID, BSSID, pasmo, RSSI −61 dBm, SNR, test portu 443 OK, ostatnie odpytanie 07:15:02; CZAS: różnica z serwerem +1 s, jakość czasu „zsynchronizowany” (`synced`); PRACA: niewysłane 0, bateria 78 % (limit 80 %), temperatura, restarty dziś 0, tryb EPD; „TEST POŁĄCZENIA”, „WYŚLIJ DIAGNOSTYKĘ” (propozycja).
- Stany: offline (ostatnie odpytanie 07:05, kolejka 1, wiersz sieci w `t-warn`); start bez sieci (jakość czasu „nieznany”, `unknown`); tablet LCD bez EPD.

**TabletOffline** · wariant TabletBoks · 702×936 · P1 · dec. 16 · szcz. T-14, T-16, §5 pkt 19, 20; dev §5 pkt 10
- Treść: Kasztan, boks 7, dane z 07:05; stopka na pełną szerokość `t-warn`, czarny pogrubiony tekst, ramka 4 px: „BRAK POŁĄCZENIA · DANE Z 07:05 · NIEWYSŁANE: 1”; w OSTATNICH AKCJACH „07:12 Ogarnięte · czeka na wysłanie”; „Nowe flagi pojawią się po powrocie sieci.”; zegar idzie; przyciski aktywne, zapisy w kolejce.
- Stany: po progu „DANE NIEAKTUALNE” na pełną szerokość (próg do ustalenia); start bez sieci („czas niepotwierdzony”); powrót sieci (ONLINE bez dotykania); przy dec. 16 b przyciski z przerywaną ramką.

**TabletAktualizacja** · tablet · 702×936 · P1 · szcz. 3.6 etap 4, T-24, T-25, T-26
- Treść: okno serwisowe, pusta kolejka: pełny ekran „INSTALUJĘ AKTUALIZACJĘ · [WERSJA]”, „Tablica wróci sama za około minutę. Nie odłączaj zasilania.” (propozycja); bez flag; zegar.
- Stany: pasek `t-warn` „WYMAGANA AKTUALIZACJA” na tablicy (`client_upgrade_required`); po instalacji ten sam boks i sesja, także przy otwartym pop-upie (T-26); przerwana aktualizacja kończy się na działającej wersji (T-25).

**TabletPopupZablokowany** · wariant TabletPopup · 702×936 · P1 · erd pkt 2; szcz. 3.6 etap 4, T-28, T-30, A-15
- Treść: pop-up Kasztana na zablokowanym ekranie; POTWIERDZAM z przerywaną ramką i „Przytrzymaj kłódkę 3 s, aby odblokować, potem POTWIERDZAM”; licznik „1 z 2”, krytyczny pierwszy.
- Stany: nowy pop-up w trakcie „Zmień boks” (T-28).

**TabletZawieszona** · tablet · 702×936 · P2 · erd pkt 10; szcz. 3.6 etap 8, §5 pkt 20
- Treść: pełny ekran bez flag i karmienia: „SYSTEM NIEAKTYWNY · tablica wyłączona. Skontaktuj się z adminem stajni.”

**TabletWifi** · wariant TabletUstawienia · 702×936 · P2 · dec. 14 · szcz. 4.5, T-15, N-04, N-06, §5 pkt 30; dev §5 pkt 15
- Treść: „ZMIEŃ SIEĆ”, „ANULUJ”; Stajnia-PodLipami 5 GHz (POŁĄCZONO), Stajnia-PodLipami 2,4 GHz, inna sieć (nazwy: propozycja); wybrana sieć: hasło z klawiaturą QWERTY i „pokaż hasło”, WPA2 albo WPA3, „POŁĄCZ”; „Sieć bez strony logowania, z wyjściem na port 443. Zmiana dotyczy tylko tego tabletu.”
- Stany: łączenie; złe hasło (ramka 4 px `t-warn`); połączono („odpytanie 07:16 OK”); sieć bez internetu; brak uprawnień (dec. 14 b).

### F. Wyświetlacz (TV)

Pierwszy start prowadzi od razu do WyswietlaczCentralny z wszystkimi halami; osobnego ekranu wyboru widoku nie ma (szcz. 3.5.4, W-18, erd pkt 4).

**PanelLudzieWyswietlacze** · wariant PanelLudzie z filtrem roli „Wyświetlacz” · 1440×900 fill · P1 · dec. 10, 11 · erd pkt 4, 14; szcz. 2.4, 3.3 access, identity, 4.2, §5 pkt 3–4
- Treść: Damian, „Ludzie · Stajnia Pod Lipami” z wybranym filtrem „Wyświetlacz” (bez osobnej zakładki i sekcji kont technicznych); wiersz „Telewizor korytarz” · Wyświetlacz · t•••@stajnielipowe.pl · Aktywne · „Zablokuj”; „Telewizor loguje się zwykłym kontem z rolą Wyświetlacz. Jedno konto obsłuży kilka telewizorów, a osobne pozwala zablokować telewizor pojedynczo.”; „Zaproś osobę” → PanelZaprosOsobe z rolą Wyświetlacz; karta „Jak podłączyć telewizor”: (1) Raspberry Pi z obrazem EQUENOR do HDMI; (2) telewizor otwiera [PANEL]/wyswietlacz; (3) zaloguj się telefonem albo e-mailem konta wyświetlacza i kodem, jak wszędzie; (4) telewizor pokazuje wszystkie hale, a żeby pokazywał jedną, kliknij przy niej „Pełny ekran” (mysz albo pilot) i telewizor to zapamięta. „Panel nie wie, który telewizor co pokazuje.”
- Stany: konto zablokowane („Zablokowane od 07:20 · Odblokuj”) z dialogiem „Telewizory na tym koncie pokażą „Wyświetlacz zablokowany”.”; zaproszenie czeka (zakładka Zaproszenia, e-mail); Brzozowa: „Stajnia nie ma wyświetlacza” z „Zaproś osobę”. Formularza „Dodaj wyświetlacz” nie ma (dec. 11).

**WyswietlaczLogowanie** · TV, kiosk [PANEL]/wyswietlacz · 1600×900 fill · P1 · dec. 7, 10 · erd pkt 4, 6; szcz. 1.3, 4.2, W-18, W-25, W-29, §5 pkt 3, 4, 15
- Treść: logowanie jak wszędzie (2.3), w konwencji TV: tło bg, bez pól w akcencie; „EQUENOR · wyświetlacz” (pod znakiem hasło „Equestrian Management, Refined”), zegar 07:15, „wtorek, 13 października”; karta: H1 „Zaloguj ten telewizor”, „Zaloguj się kontem z rolą Wyświetlacz. Zaprasza je admin w panelu: Ludzie → Zaproś osobę.”; przełącznik „Telefon | E-mail” (wybrany E-mail) z fokusem 3 px (klawiatura, pilot CEC), „Wyślemy kod SMS-em albo e-mailem. Konto nie ma hasła.”, „Wyślij kod”; bez danych stajni i flag.
- Stany: ● **WyswietlaczKod** (6 dużych pól, „Wysłaliśmy kod na t•••@stajnielipowe.pl”, „Zły kod. Wpisz ponownie.”, „Zaloguj”, „Wyślij nowy kod”, „Zmień e-mail”); ● **WyswietlaczWylogowany** (ten układ z paskiem „uwaga” „Wyświetlacz wylogowany o 06:40 · dane są ukryte do ponownego logowania”; sesja wygasła albo global sign-out, szcz. 4.2 Sesje); konto bez roli Wyświetlacz („To konto nie ma dostępu do wyświetlacza”, propozycja); brak sieci.

**WyswietlaczStart** · TV · 1600×900 fill · P1 · szcz. W-01, W-17
- Treść: zimny start bez sieci i bez zapisanego stanu: znak, zegar z RTC, „Łączenie z serwerem…”, bez danych; po minucie „Brak połączenia. Sprawdź sieć telewizora.” (propozycja).

**WyswietlaczZablokowany** · TV · 1600×900 fill · P1 · erd pkt 4, 10; szcz. 3.3 board, 4.2, §5 pkt 20
- Treść: znak, „Stajnia Pod Lipami”, zegar; kłódka, „WYŚWIETLACZ ZABLOKOWANY”, „Konto tego wyświetlacza zablokował admin stajni. Dane są ukryte.”, „Odblokowanie: panel web → Ludzie.”; bez flag i kafli; neutralne tło, status ikoną i słowem.
- Stany: stajnia zawieszona („System nieaktywny w tej stajni”).

**WyswietlaczOffline** · wariant WyswietlaczCentralny · 1600×900 fill · P1 · szcz. W-20, W-21, W-22, §5 pkt 20
- Treść: wszystkie hale z danymi z 07:05; pod nagłówkiem pasek „uwaga” „Brak połączenia od 07:05 · ostatnia aktualizacja 07:04:52 · dane mogą być nieaktualne”; zegar liczony lokalnie; pasek pilnych z Bellą zostaje; kafle bez wyszarzenia.
- Stany: 500, 503 i przekroczony czas (ten sam pasek); przeładowanie po dłuższej awarii; pełny ekran hali z tym paskiem.
- Stany WyswietlaczCentralny (fragmenty, P2): koń bez boksu (sekcja „Bez boksu: Luna” tylko w widoku wszystkich hal, szcz. §5 pkt 16, propozycja); zapamiętana hala wyłączona albo usunięta: widok wszystkich hal bez komunikatu (szcz. 3.5.4, §5 pkt 32).

**WyswietlaczHalaGlowna** · wariant WyswietlaczHala · 1600×900 fill · P2 · erd pkt 4; szcz. W-24, W-29, A-08
- Treść: H1 „Hala główna”; kafle 1–8: Kasztan (BEZ ŚNIADANIA 06:00–10:00, krytyczna, potwierdzona 06:02, później Nie na padok od 14:30), Sonata (Derka: zakładać · od 16:00), Hetman (Leki rano 06:00–09:00), 3 wolny z przerywaną ramką; nagłówek „Śniadanie podane 06:40 · padok 10:00”; pasek pilnych tylko tej hali; Hala nowa tylko liczbami; przełącznik hal z `aria-current` na Hali głównej.

**WyswietlaczDuzoBoksow** · wariant WyswietlaczCentralny · 1600×900 fill · P2 · erd pkt 4; szcz. W-24
- Treść: fixture z wieloma boksami (propozycja: 3 hale po 20); kafle skrócone (numer z halą, koń, flaga); „strona 1 z 2 · zmiana co 20 s”; pasek pilnych zawsze na górze.

### G. Codzienna praca

**ListaDniaOgarniete** · apka obsługi, arkusz nad ListaDnia · 390×960 · P1 · erd pkt 3, 16; szcz. 3.3 care, 4.1, A-13
- Treść: tło ListaDnia z „Zalogowany: Piotr” (A-13); arkusz „Ogarnięte · zaznacz boksy”, „Dziś 7 z 14”; zakładki Hala główna (wybrana) | Hala nowa; ogarnięte dziś (ikona OK i godzina): 1 Iskra 07:02, 2 Dukat 06:50, 5 Wicher 07:05 · Piotr, 7 Kasztan 07:10; do zrobienia (ramka przerywana): 3 wolny, 4 Sonata, 6 Fala, 8 Hetman; zaznaczone 4, 6, 8 (✓ w akcencie); „Zapisz: Ogarnięte · 3 boksy”, „Anuluj”, „Po zapisie 10 z 14. Cofniesz przez godzinę (propozycja).”
- Stany: Hala nowa (2 Mgła 06:58, 3 Rumba 07:12, 5 Bursztyn 07:14; do zrobienia 1, 4, 6); po zapisie ListaDnia „10 z 14” z „Cofnij”; offline („Zapis czeka na sieć”); ponowne „Ogarnięte” ogarniętego boksu (nowy wpis); drugie „Wyprowadzono na padok” tego dnia (`already_done`, „Padok już wyprowadzony 10:00”, A-13); „Ogarnięte” wyłączone (arkusza nie ma).

**BoksSzczegolyWoda** · wariant BoksSzczegoly · 390×960 · P1 · dec. 26 · erd pkt 3, 16; szcz. 3.3 care, 4.1, 4.2, A-16
- Treść: Damian, „← Boksy”; H1 „Hala nowa · boks 5”, „Nowa 5”, ul. Polna 3, Konstancin-Jeziorna; Bursztyn („Karta konia”), klient: nie dodano; „Poidło ręczne · woda 06:55 (tablet)” z „Woda”; „Ostatnio przy boksie”: Ogarnięte 07:14 (tablet), Woda 06:55 (tablet), Podano śniadanie 06:50 · Piotr (cała hala); „Zadania”: „Poidło w boksie 5 do wymiany · do wzięcia”; „Ustawienia boksu” (admin): „Automatyczne poidło: nie”, „Po włączeniu znacznik i „Woda” znikną z tabletu, apki, panelu i wyświetlacza. Wpisy zostają w historii.”; stopka „Ogarnięte”, „Przenieś konia”.
- Stany: widok Piotra (bez „Ustawień boksu”); po „Woda” („woda 07:16 · Piotr”, „Cofnij”); poidło „tak” (bez znacznika i akcji); przyciski obsługi wyłączone („Woda” zostaje); zajęty boks z poidłem automatycznym (Hala główna · boks 7).

**EdycjaPlanuKonia** · apka obsługi i admina · 390×1160 · P1 · dec. 27, 28, 34 · erd pkt 3, 16, Otwarte kwestie 1; szcz. 3.2, 3.3 care, 3.6 etap 6; dev §5 pkt 23
- Treść: Ola, Kasztan (Hala główna · boks 7), „← Konie”, bez paska; H1 „Plan · Kasztan”; „Karmienie” według `meal_slots`: Śniadanie 06:30: owies 1,5 kg, siano bez ograniczeń, suplement X 1 miarka; Obiad 12:00: siano bez ograniczeń; Kolacja 18:00: owies 1,5 kg, siano bez ograniczeń, wysłodki 0,5 kg z „Namoczyć” i „w 2 l wody” (tylko przy włączonym moczeniu); wiersz: pasza (select ze słownika), ilość, jednostka, usuń; „+ Dodaj paszę”; „Padok” (przy włączonym Padoku): Padok B · pn–pt · 10:00–16:00 · razem z: Fala, Rumba, „Dziś skrócony do 14:30 przez flagę „Nie na padok””; „Obowiązuje od: dziś”; „Zapisz plan”, „Anuluj”.
- Stany: w selectach „+ Nowa pasza” (nazwa, rodzaj, jednostka) i „+ Nowy padok” (propozycja); klient tylko odczyt, gdy `owner_edits_feeding` jest wyłączone; 412 („Plan zmienił ktoś inny, odśwież”); 409 przy „Namoczyć” po wyłączeniu moczenia.

**KartaKoniaKometa** · wariant KartaKonia · 390×1000 · P2 · dev 3.2; szcz. A-17
- Treść: Anna w Brzozowej; „Kometa · boks 1 · klacz”; „Dziś”: „Bez śniadania 06:00–09:00 · dentysta o 8:30 · obowiązuje od razu”; bez planu karmienia i jazd; Zdrowie, Historia.
- Stan KartaKonia (fragment, P2, dec. 20): karta Iskry u Karoliny W. z „Jazda 16:00 · kryta ujeżdżalnia” w „Dziś” (A-17, A-21).

**StajennyKonieBrzozowa** · wariant StajennyKonie · 390×960 · P2 · dev 3.2; szcz. A-17
- Treść: Ola w Brzozowej; 5 koni bez hal; 6 kafelków bez Derki; pasek z 3 pozycjami.

**KartaKoniaObsluga** · wariant KartaKonia · 390×1000 · P2 · dec. 27 · erd pkt 3; szcz. 3.2
- Treść: Ola; Kasztan · Hala główna · boks 7, chip „Obsługa”, „← Konie”; „Klient: Anna” z „Zadzwoń”; sekcje jak KartaKonia; „Edytuj plan” i „Flaga” (w imieniu klienta); pasek obsługi z Końmi.
- Stany: obsługa bez widoczności `feeding_plan` (sekcja znika); admin (pasek admina).

**PrzeniesKonia** · apka admina, arkusz · 390×844 · P2 · jak PanelPrzeniesKonia
- Treść: mobilna wersja PanelPrzeniesKonia: te same pola i stany w arkuszu nad BoksyAdmin.

**MojBoksWyborKonia** · wariant MojBoks · 390×960 · P2 · erd pkt 3; szcz. 3.2
- Treść: chipy „Kasztan · Główna 7” | „Bella · Nowa 4” (wybrany); „Boks 4 · Hala nowa”; „Ostatnio”: Podano śniadanie dziś 06:50 · Piotr, Ogarnięte wczoraj 17:30 · Ola; „Historia”: dziś Podano śniadanie 06:50 · Piotr, flaga „Nie na padok” ustawiona 01:20 · Anna · niepotwierdzona; wczoraj Ogarnięte 17:30 · Ola.
- Stany: jeden koń (bez chipów); koń bez boksu (tylko flagi).

**ListaDniaOffline** · wariant ListaDnia · 390×960 · P2 · szcz. A-13, A-14
- Treść: nagłówek „offline · dane z 07:05 · 2 zapisy czekają”; „Biorę” nieaktywne z „tylko online”.
- Stany: 409 „Zadanie wziął już Piotr” (A-14).

### I. Strona www

Publiczna strona przed logowaniem: prezentacja produktu i pseudo-blog (prośba użytkownika z 13.10). Panelowa konwencja (Figtree, paleta, 1440 rosnące w dół), bez menu panelu i danych stajni. Treść stron to propozycja.

**StronaGlowna** · www · 1440×900 fill, rośnie w dół · P1 · dev 2
- Treść: nagłówek ze znakiem „EQUENOR” (pod nim hasło „Equestrian Management, Refined”) i „Zaloguj się” (→ PanelLogowanie); prezentacja: dla kogo (stajnie, obsługa, klienci), co robi (flagi z potwierdzeniem, szybkie akcje obsługi, tablet przy boksie, telewizor w korytarzu, panel stajni), jak zacząć (konto firmy z NIP-em, stajnia, zaproszenia); sekcja bloga z kilkoma wpisami (→ StronaWpis); stopka: znak z hasłem pod spodem, [WWW]/app, Regulamin, Polityka prywatności.

**StronaGlownaTelefon** · www w telefonie · 390×844 i dłuższe · P1
- Treść: ta sama strona w jednej kolumnie, te same linki.

**StronaWpis** · www · 1440×900 fill, rośnie w dół · P1
- Treść: wpis bloga (tytuł, data, autor, treść ze zdjęciem), „← Blog” → StronaGlowna, pod wpisem zachęta do założenia konta (→ PanelLogowanie).

### H. P3 (po PoC albo po decyzji)

- **Powiadomienia** (apka i panel, 390×844): SMS i e-maile wysłane do admina (eskalacja Belli, wygasające zaproszenie), tylko przy dec. 22 b; erd `notifications`.
- **DodajJazde** (apka instruktora i admina, 390×844): koń, ujeżdżalnia, od–do, jeździec; 409 przy kolizji konia, areny albo pojemności; ostrzeżenie przy `no_riding`; po dec. 20; erd `rides`, `arenas`.
- **ZdrowieWpis** (apka, 390×960): wizyta (wet, kowal, dentysta), data, następny termin, opis, „tylko dla mnie” (`owner_private`), załącznik; erd `health_events`, `health_attachments`.
- **HistoriaBoksu** (apka, 390×960): grupy dni, flagi i zdarzenia z przycisków, filtr dni; erd pkt 3.
- **PanelBoksSzczegoly**, **PanelSzczegolFlagi** (flaga z autorem, eskalacją i akcjami, `flag_escalations`), **PanelSzablonyFlag** (okna godzin, waga, skutek, kolejność, własne flagi z etykietami PL, UA, EN; szcz. §5 pkt 27, 48), **PanelPlatnosciZmiana** (dane do faktury, plan, metoda płatności; bez rozbudowy na PoC, dev §5 pkt 25), **PanelHistoriaZmian** (audyt; kto go czyta, szcz. §5 pkt 21): panel, 1440×900 fill.
- **LogowanieTotp** (apka i panel, 390×844): tylko przy dec. 7 c.
- **KartaKoniaBella** (wariant KartaKonia, 390×1000); **TabletEkranZablokowanyBrzozowa** (Kometa, boks 1, bez hali); **ListaDniaPusta** (Ola w stajni bez koni w dniu założenia: „Ogarnięte 0 z 6”, „Flagi dziś: brak”, „Admin stajni dodaje konie w panelu web.”).
- **WyswietlaczPlanszeTestowe** (TV, 1600×900 fill): ramka 1 px przy krawędziach (W-09) i szara plansza retencji (W-10), bez danych.

### 3.H Linki

Jedyny spis linków. **L1** wykonujemy po paczkach P1, **L2** po P2, **L3** po P3. „(tymczasowo X)” to cel do czasu narysowania docelowego, „bez linku” to element bez `href`. Podmiany w istniejących plikach robimy za zgodą (dec. 30).

**Nowe plansze.** Domyślnie: „← Wróć”, „Anuluj”, X i zapis wracają do ekranu wejścia; pasek i menu według MapaNawigacjiRol; „Wyloguj” → LogowanieNumer (apka) albo PanelLogowanie (panel); tablice tabletu mają linki jak TabletBoks (kłódka, „Zmień boks”, stopka → TabletUstawienia). Poza tym:
- **A:** LogowanieNumer „Wyślij kod” → Logowanie; BrakDostepu „Sprawdź ponownie” → ZaproszeniePrzyjmij; WiadomosciSms link → ZaproszenieStrona → „Panel” → PanelLogowanie; ZaproszeniePrzyjmij „Przyjmij” → MainLuna, ListaDnia, InstruktorJazdy albo WsparcieITStart (według roli); ZaproszenieNoweStajnia „Przyjmij” → MainBrzozowa, „Później” → Main (toast Oli bez linku); MainLuna kafelki → SzybkaFlaga, „Karta” → KartaKonia (tymczasowo), Flagi → StatusFlagi (tymczasowo); Profil stajnia → PrzelacznikStajni, „Zmień numer” bez linku; ProfilAdmin → PanelPulpit, PanelUstawieniaStajni, PanelPlatnosci, „Konie” → PanelBoksy (tymczasowo); PrzelacznikStajni → Main, MainBrzozowa (Ola: ListaDnia, ListaDniaBrzozowa).
- **B:** PanelLogowanie → PanelLogowanieKod → PanelPulpit (Admin), PanelWitaj (bez konta firmy i członkostwa, zaproszenie, inna rola) albo PanelDiagnostyka (Wsparcie IT); PanelWitaj „Załóż konto firmy” → PanelRejestracjaFirmy → PanelZalozStajnie → PanelZalozPowiadomienia („← Wstecz” → PanelZalozStajnie) → PanelPulpitStart; PanelPulpitStart „Dodaj konia” → PanelDodajKonia, „Zaproś osobę” → PanelZaprosOsobe, „Sprawdź” → PanelUstawieniaBrzozowa (stan docelowy po zmianach Damiana, nie z dnia założenia), wyświetlacz → PanelLudzieWyswietlacze; PanelDodajKonia i PanelPrzeniesKonia → PanelBoksy; PanelLudzie i PanelLudzieWyswietlacze „Zaproś osobę” → PanelZaprosOsobe, filtr roli wszyscy ⇄ „Wyświetlacz” → PanelLudzie ⇄ PanelLudzieWyswietlacze; PanelPulpit Konie → PanelBoksy (tymczasowo), „Zobacz flagę” → PanelBoksy (tymczasowo, alert Belli), konto bez linku.
- **C:** MapaNawigacjiRol: nazwy ✓ i ● to linki do plików, nazwy ○ bez linku do L2 i L3; AdminDzis „+ Dodaj zadanie” → AdminZadaniaNowe, Ludzie → Zaproszenie (tymczasowo), „Zaznacz boksy” → ListaDniaOgarniete, Bella i „Przypisz boks” → BoksyAdmin (tymczasowo; szczegółu flagi dla admina w apce nie ma); InstruktorJazdy Flagi → ta sama makieta; WsparcieITStart instrukcje → TabletUstawienia, TabletDiagnostyka, WyswietlaczLogowanie.
- **D:** SzybkaFlagaGodziny „Zapisz godziny” → SzybkaFlaga; SzybkaFlagaObsluga wysłanie → StatusFlagi (tymczasowo); SzybkaFlagaBrzozowa → MainBrzozowa; StatusFlagiOdwolaj → StatusFlagi; KlientFlagi wiersz → StatusFlagi, „Nowa flaga” → SzybkaFlaga.
- **E:** TabletLogowanie „WYŚLIJ KOD” → TabletLogowanieKod, „ZALOGUJ” → TabletBoks (zapamiętany boks), TabletWyborStajni (kilka stajni) albo TabletPierwszyBoks; TabletWyborStajni → TabletPierwszyBoks; TabletPierwszyBoks i TabletBoksNiedostepny: Hala nowa · 5 → TabletBoksWoda, Hala nowa · 6 → TabletBoksWolny, pozostałe → TabletBoks (tymczasowo; tablice są tylko dla Hala główna · 7 i Hala nowa · 5 i 6); TabletUstawienia „WYLOGUJ” → TabletWylogowany, stajnia → TabletWyborStajni, „ZMIEŃ BOKS” → TabletZmianaBoksu, „ZMIEŃ SIEĆ” bez linku, „OTWÓRZ” → TabletDiagnostyka, „ZAMKNIJ” → TabletBoksWoda.
- **F:** PanelLudzieWyswietlacze instrukcja → WyswietlaczLogowanie; WyswietlaczLogowanie i WyswietlaczWylogowany → WyswietlaczKod → WyswietlaczCentralny; pozostałe plansze TV pasywne.
- **I:** StronaGlowna i StronaGlownaTelefon: wpisy → StronaWpis, „Zaloguj się” → PanelLogowanie; StronaWpis „← Blog” → StronaGlowna, zachęta → PanelLogowanie.
- **G:** BoksSzczegolyWoda „Karta konia” → KartaKonia (tymczasowo), „Przenieś konia” bez linku; EdycjaPlanuKonia → StajennyKonie; KartaKoniaObsluga „Edytuj plan” → EdycjaPlanuKonia, „Flaga” → SzybkaFlagaObsluga; PanelKonie „Przenieś” → PanelPrzeniesKonia, „Karta” i „Flaga” bez linku (brak planszy panelu); KartaKoniaKometa i StajennyKonieBrzozowa → MainBrzozowa i ListaDniaBrzozowa.

**L1: podmiany w istniejących plikach po P1**
- **Wszystkie paski apki:** „Profil” → Profil (u admina ProfilAdmin).
- **Dzwonek** (dec. 22 a): usunąć w apce (BoksyAdmin, Main, MainBrzozowa, MojBoks, StatusFlagi, Zaproszenie) i w panelu (PanelBoksy, PanelDodajHale, PanelPlatnosci, PanelUstawieniaStajni, PanelUstawieniaBrzozowa).
- **Logowanie:** „Zmień numer” → LogowanieNumer; „Zaloguj się” → start według MapaNawigacjiRol (w makiecie Main). „Numerem lub e-mailem” zostaje (dec. 7); link TOTP do decyzji o TOTP.
- **Admin w apce (BoksyAdmin, Zaproszenie):** pasek Dziś | Boksy | Zadania | Ludzie | Profil (dec. 17); nazwa stajni z ▾ → PrzelacznikStajni (Damian ma 2 stajnie, dec. 21); przełącznik „Kanał: SMS | E-mail” w Zaproszenie zostaje (dec. 7); BoksyAdmin „Szczegóły” wolnego Hala główna · boks 3 → BoksSzczegoly (tymczasowo, makieta boksu 6).
- **Przełącznik stajni w apce** (Main, ListaDnia, MainBrzozowa, ListaDniaBrzozowa) → PrzelacznikStajni. W panelu „▾” zostaje (dec. 21).
- **Obsługa:** ListaDnia „Zaznacz boksy” → ListaDniaOgarniete i nowa linia „Poidło ręczne · Hala nowa · boks 5 · woda 06:55” → BoksSzczegolyWoda (dec. 26; BoksyAdmin nie ma wiersza tego boksu); StajennyKonie „Plan” → EdycjaPlanuKonia, „Flaga” i kafelki → SzybkaFlagaObsluga.
- **Klient:** SzybkaFlaga „Od … zmień” i „Do … zmień” → SzybkaFlagaGodziny; StatusFlagi „Odwołaj flagę” → StatusFlagiOdwolaj, „Zadzwoń do stajni” → `tel:` (dec. 25).
- **Brzozowa:** MainBrzozowa kafelki → SzybkaFlagaBrzozowa; „Karta”, Flagi i Historia w MainBrzozowa, Konie i „Zaznacz boksy” w ListaDniaBrzozowa, Pulpit, Boksy, Konie, Ludzie, Płatności i ustawienie boksu w PanelUstawieniaBrzozowa oraz kłódka i „Zmień boks” w TabletBoksBrzozowa: bez linku.
- **Panel Pod Lipami** (PanelBoksy, PanelDodajHale, PanelPlatnosci, PanelUstawieniaStajni): Pulpit → PanelPulpit, Ludzie → PanelLudzie, „Dodaj konia” → PanelDodajKonia, „Przenieś” i „Przypisz konia” → PanelPrzeniesKonia.
- **Tablet:** TabletBoks tekst „ONLINE · aktualne na …” → TabletUstawienia z adnotacją „przytrzymaj 5 s” (dec. 13); TabletPopup POTWIERDZAM → TabletBoks; TabletZmianaBoksu zakładka „Hala nowa” → TabletPierwszyBoks (tymczasowo, ta sama siatka), kafel 7 → TabletBoks, pozostałe zostają na TabletBoks (tymczasowo).
- **BoksSzczegoly:** „Cała historia” i „Przypisz konia” bez linku; „Ogarnięte” to akcja w miejscu.

**L2: po P2**
- Klient: Flagi (pasek i pigułka w KartaKonia, także MainLuna) → KlientFlagi; Historia → MojBoksWyborKonia; MainBrzozowa „Karta” → KartaKoniaKometa.
- Obsługa: StajennyKonie „Szczegóły” → KartaKoniaObsluga; ListaDniaBrzozowa Konie → StajennyKonieBrzozowa; BoksSzczegolyWoda „Karta konia” → KartaKoniaObsluga.
- Admin w apce: Ludzie → LudzieAdmin; „Przenieś”, „Przypisz konia”, „Przypisz boks” (BoksyAdmin, BoksSzczegoly, BoksSzczegolyWoda, AdminDzis) → PrzeniesKonia; „Szczegóły” zajętych boksów → KartaKoniaObsluga (tymczasowo; szczegółów zajętych boksów poza Hala nowa · 5 nie rysujemy); Zaproszenie „Wyślij zaproszenie” i „Wyślij ponownie” → ZaproszenieObsluga.
- Panel: Konie → PanelKonie (też ProfilAdmin, PanelPulpit); „D Damian (admin) ▾” → PanelMenuKonta, tam „Załóż stajnię” → PanelZalozStajnie; „Edytuj halę” i „Dodaj boks” → PanelEdytujHale; nowe zakładki ustawień → PanelUstawieniaOgolne, PanelSlowniki; PanelUstawieniaBrzozowa Pulpit → PanelPulpitBrzozowa.
- Konto i tablet: Profil „Zmień numer” → ProfilZmianaNumeru; TabletUstawienia „ZMIEŃ SIEĆ” → TabletWifi.
- Wyświetlacz (pliki z generatora): „Pełny ekran” Hali głównej i „Hala główna” w przełączniku → WyswietlaczHalaGlowna.

**L3: po P3**
- Main „Karta” Belli → KartaKoniaBella; BoksSzczegoly „Cała historia” → HistoriaBoksu; PanelBoksy „Szczegóły” (dziś MojBoks Anny) → PanelBoksSzczegoly; „Zobacz flagę” (PanelBoksy, PanelPulpit) → PanelSzczegolFlagi; PanelPlatnosci „Zmień plan”, „Zmień”, „Edytuj” → PanelPlatnosciZmiana, „Pobierz” to pobranie PDF; TabletBoksBrzozowa kłódka → TabletEkranZablokowanyBrzozowa; Logowanie TOTP → LogowanieTotp tylko przy dec. 7 c.
- Pliki *BezAkcji: po ich ukończeniu i za osobną zgodą.

## 4. Kolejność prac i liczby

**Makiety (pliki): 66 P1, 25 P2, 14 P3, razem 105.** P1 obejmuje 11 plansz stanów z ● i 4 plansze zbiorcze stanów. Zmiana 13.10: +PanelRejestracjaFirmy, PanelZalozPowiadomienia, StronaGlowna, StronaGlownaTelefon, StronaWpis; −PanelDodajWyswietlacz (dec. 11).

| Paczka | Zawartość | Liczba | Po co |
|---|---|---|---|
| 0 | MapaNawigacjiRol; zatwierdzenie dec. 12, 17, 18 (pozostałe potrzebne do pierwszej fali rozstrzygnięte 13.10) | 1 P1 | decyzje, od których zależy, czy plansza powstaje |
| 1 | P1 z grupy A | 11 | etap 1: logowanie i zaproszenie tworzące członkostwo |
| 2 | P1 z grupy B | 12 | etapy 1–2: konto firmy i stajnia pilotażowa powstają bez nas |
| 3 | P1 z grupy C (bez mapy) | 7 | start każdej roli, A-02, A-14, A-21 |
| 4 | P1 z grupy D | 4 | etap 3 (A-01, A-12, A-18, A-20), odwołanie z etapu 4 |
| 5 | P1 z grupy E | 14 | etap 4, T-07, T-23…T-26, A-15 |
| 6 | P1 z grupy F | 7 | etap 5, W-01, W-17, W-18, W-29 |
| 7 | P1 z grupy G | 3 | etap 6 (A-13, A-16, A-17), dane stajni pilotażowej |
| www | P1 z grupy I | 3 | strona przed logowaniem: prezentacja i blog (w pierwszej fali) |
| 1–7 | StanyApka, StanyPanel, StanyTablet, StanyWyswietlacz | 4 | każda paczka dokłada swoje fragmenty |
| L1 | podmiany z 3.H | — | makiety przestają prowadzić do zaślepek |
| 8 | P2 ze wszystkich grup i fragmenty ich stanów | 25 | domyka nawigację i stany przed pilotażem |
| L2 | podmiany z 3.H | — | cele P2 zamiast zastępczych |
| 9 | grupa H | 14 | po PoC albo po dec. 7 (TOTP), 20, 22 |
| L3 | podmiany z 3.H | — | cele P3 |

P1 rysujemy według rekomendacji z sekcji 5; plansza zależna od decyzji ma w notatce „(propozycja, dec. N)”. Pozostałe decyzje i zmiany w dokumentach uzgadniamy równolegle z rysowaniem; zmiana decyzji to poprawka planszy przed L1.

## 5. Decyzje do podjęcia

Format: opcje, **Rek.** (rekomendacja) i **Dok.** (co zmienić w dokumentach; uzgadniamy równolegle z makietami). Decyzje rozstrzygnięte przez użytkownika 13.10.2026 (sekcja L arkusza) mają zamiast opcji **Rozstrzygnięte 13.10.2026**. Otwarte przed pierwszą falą zostają dec. 12, 17 i 18.

**Rejestracja, zaproszenia, logowanie**

1. **Kto zakłada stajnię?** **Rozstrzygnięte 13.10.2026:** samoobsługa, wyłącznie B2B: pierwsze logowanie (telefon albo e-mail i kod), PanelWitaj, konto firmy z NIP-em (PanelRejestracjaFirmy), potem PanelZalozStajnie. **Dok.:** erd pkt 15; `POST /stables` (szcz. 3.3) woła admin konta.
2. **Kreator czy jedna strona?** **Rozstrzygnięte 13.10.2026:** dwa kroki: „Stajnia” (PanelZalozStajnie: bez pytania o potwierdzenia flag, boksy z konfiguracją każdego boksu) i „Powiadomienia” (PanelZalozPowiadomienia: zdarzenia, odbiorcy Admin i Obsługa, kanał SMS albo e-mail); zapis na końcu kroku 2, potem PanelPulpitStart. Bez kroku płatności: subskrypcję zakłada billing po `stable.created` (dev §5 pkt 25). **Dok.:** erd pkt 11, 17 (`notification_rules`).
3. **Działalność = konto firmy.** **Rozstrzygnięte 13.10.2026:** konto firmy (`businesses`) z NIP-em, 1 konto = 1 NIP (drugi raz: „Ten NIP ma już konto w EQUENOR”); NIP podaje się raz, przy rejestracji (PanelRejestracjaFirmy); „Załóż stajnię” nie pyta o działalność ani NIP; stajnie konta widzi admin konta (dec. 35). **Dok.:** erd pkt 14, 15; NIP do faktur z konta firmy (erd pkt 10).
4. **Przyjęcie zaproszenia.** (a) automatycznie (brzmienie erd pkt 6); (b) ekran „Przyjmij”; (c) „Przyjmij” i „Odrzuć”. **Rek.:** (b): przyjęcie nadaje rolę i dostęp do konia, a nieprzyjęte samo wygasa. **Dok.:** ujednolicić erd pkt 6 („dopasowuje”) z A-06 i szcz. 4.2 („akceptuje”).
5. **Zaproszenie dla osoby już zalogowanej.** (a) widać je po ponownym logowaniu; (b) `GET /me/memberships` zwraca też oczekujące zaproszenia, apka pokazuje arkusz na starcie i przy odświeżeniu. **Rek.:** (b). **Dok.:** szcz. 3.3 access.
6. **Imię zaproszonej osoby** (makiety: „Marek Nowak · zaproszenie czeka”). (a) opcjonalne `invitations.invitee_name` („Imię (widzi tylko admin)”), po przyjęciu nadpisane przez `users.display_name`; (b) tylko zamaskowany numer. **Rek.:** (a), imię jako podpowiedź w ZaproszeniePrzyjmij. **Dok.:** kolumna w `invitations`.
7. **E-mail i TOTP** (dev §5 pkt 1–2; szcz. §5 pkt 1–2). **Rozstrzygnięte 13.10.2026 (e-mail):** logowanie w apce, panelu, na tablecie i TV telefonem albo e-mailem, kod SMS-em albo e-mailem (Cognito `SMS_OTP` i `EMAIL_OTP`, e-maile przez SES), konta bez hasła; zaproszenia SMS-em albo e-mailem („Kanał: SMS | E-mail” jak w Zaproszenie); wzorzec ekranu w 2.3. **Otwarte:** TOTP dla admina panelu; nowe plansze go nie pokazują, LogowanieTotp zostaje w P3. **Dok.:** erd pkt 6, szcz. 4.2.
8. **Język SMS zaproszenia** (szcz. §5 pkt 24). (a) zawsze PL; (b) PL i UA w jednym SMS; (c) pole „Język wiadomości” przekazywane do `notifications`, bez kolumny w `invitations`. **Rek.:** (c), domyślnie PL; SMS bez tokenu: link do pobrania, stajnia, rola, termin. Podpowiedź UA przy +380 tylko, gdy szcz. §5 pkt 24 dopuści numery spoza Polski (szcz. 2.5 zakłada blokadę krajów).
9. **Zgody i imię przy pierwszym logowaniu.** (a) checkbox regulaminu i polityki z datą (pole w `users`); (b) link do polityki. **Rek.:** (b) na PoC, checkbox po ocenie prawnej. **Dok.:** kod (SMS albo e-mail) nie daje imienia: w erd pkt 6 dopisać, że `display_name` uzupełnia formularz (PanelWitaj, ZaproszeniePrzyjmij).

**Urządzenia**

10. **Logowanie telewizora** (dev i szcz. §5 pkt 3). **Rozstrzygnięte 13.10.2026:** telewizor to zwykłe konto z rolą Wyświetlacz; loguje się telefonem albo e-mailem i kodem, tak jak wszędzie (demo: „Telewizor korytarz”, e-mail i kod z e-maila). Bez kont technicznych, nazw kont i adresu technicznego. **Dok.:** erd pkt 4.
11. **Konta wyświetlaczy.** **Rozstrzygnięte 13.10.2026:** konto zaprasza admin przez „Zaproś osobę” z rolą Wyświetlacz; w Ludzie to członek z tą rolą (filtr roli, PanelLudzieWyswietlacze); bez sekcji kont technicznych i formularza „Dodaj wyświetlacz” (PanelDodajWyswietlacz znika). Blokada jak przy każdym członkostwie; jedno konto na kilka telewizorów albo osobne na każdy. Zdalne wylogowanie TV dopiero po zmianie ERD (erd pkt 2 wyklucza zdalne komendy). **Dok.:** erd pkt 4, szcz. 3.5.3.
12. **Czyim kontem loguje się tablet** (dev §5 pkt 5; szcz. §5 pkt 5, 31, 50). (a) osobiste konto Admina albo Obsługi; (b) wspólne konto obsługi na stajnię albo halę; (c) dowolna rola. **Rek.:** (a) („zawsze zalogowany konkretny użytkownik”); Wsparcie IT tylko ustawienia i diagnostyka; Klient, Instruktor i Wyświetlacz: TabletBrakUprawnien; (b) wraca, jeśli pilotaż pokaże kłopot z odchodzącymi osobami. Zgubiony tablet (notatka R5): tablica nie pokazuje konta, więc admin robi „Wyloguj ze wszystkich urządzeń” na kontach obsługi, które logowały tablety; skradziony czyta tablicę najwyżej przez czas życia access tokenu (szcz. 4.2). **Dok.:** które role logują tablet; skutki global sign-out i dezaktywacji dla tabletów.
13. **Wejście w ukryte ustawienia.** (a) przytrzymanie 5 s tekstu „ONLINE · aktualne na …” (bez PL i UA); (b) nagłówka; (c) ukrytego rogu. **Rek.:** (a): rzadko dotykane, bez kolizji z kłódką (3 s) i „Zmień boks”, bez wskazówki, nie działa przy blokadzie. **Dok.:** element i czas w erd pkt 2.
14. **Kto zmienia Wi-Fi** (dev §5 pkt 15; szcz. §5 pkt 30). (a) każdy w ustawieniach; (b) tylko konto Admina albo Wsparcia IT. **Rek.:** (a) na PoC, ocena po pilotażu i T-30; (b) wylogowuje Olę przy każdej zmianie sieci.
15. **Wybór stajni na tablecie.** (a) przy pierwszym logowaniu konta z kilkoma stajniami i w ustawieniach; (b) boksy wszystkich stajni. **Rek.:** (a) (A-17, A-18). **Dok.:** erd pkt 2 (dziś tylko propozycja dev).
16. **Tablet bez sieci** (dev §5 pkt 10; szcz. §5 pkt 19). (a) kolejka z licznikiem; (b) blokada akcji. **Rek.:** (a), na co wskazują `time_quality` i `request_hash`.

**Nawigacja i role**

17. **Pasek i start admina w apce** (dziś Boksy, Ludzie, Płatności, Ustawienia; dwie ostatnie otwierają plansze 1440 px). (a) Dziś | Boksy | Zadania | Ludzie | Profil, Płatności i Ustawienia jako linki do panelu w ProfilAdmin; (b) obecny pasek z „Dziś”; (c) cztery pozycje i „Więcej”. **Rek.:** (a): Ustawienia są w panelu (erd pkt 16), Profil jest ostatni u każdej roli. **Dok.:** start i pasek każdej roli, routing po zalogowaniu i mapowanie na `stable_role_features` (MapaNawigacjiRol) do szcz. 3.5.1.
18. **Panel dla ról innych niż Admin** (erd pkt 3: obsługa „z apki i panelu web”). (a) na PoC tylko Admin i Wsparcie IT, pozostali widzą PanelWitaj z odesłaniem do apki; (b) menu filtrowane rolą (kilkanaście plansz). **Rek.:** (a); do decyzji PanelLogowanie ma tekst neutralny. **Dok.:** w erd pkt 3 dopisać, że panel obsługi to dalszy etap.
19. **Wsparcie IT bez rejestru urządzeń.** (a) ekran informacyjny w apce i panelu (hale i boksy bez koni, wydania APK, okno instalacji, podgląd kont TV, instrukcje, logi), na tablecie ustawienia i diagnostyka; (b) tylko tablet; (c) „ostatnio widziane tablety” z logów (zmiana erd pkt 2). **Rek.:** (a); admin nie zobaczy martwego tabletu, zostaje eskalacja (A-02). **Dok.:** pkt 14 daje „diagnostykę”, pkt 2 usuwa telemetrię; dopisać, co rola widzi, czy zarządza `display` i czy loguje tablety.
20. **Jazdy i instruktor.** Jazdy tworzy (a) admin i instruktor; (b) tylko admin; (c) także klient. **Rek.:** na PoC jazdy z seedu i podgląd: InstruktorJazdy z flagami tylko do odczytu (propozycja), klient widzi jazdy swojego konia w „Dziś” karty konia (A-17, A-21); DodajJazde w (a) po decyzji. **Dok.:** kto tworzy jazdy i `arenas`; `rides_enabled` a widoczność `rides`; czy instruktor widzi imiona jeźdźców i ustawia flagi.
21. **Przełącznik stajni.** **Rozstrzygnięte 13.10.2026:** „▾” w apce i panelu tylko przy kilku stajniach: admin konta ma go, gdy firma ma kilka stajni (Damian), inni przy kilku członkostwach (Ola, Anna, Marta, Kuba); przy jednej stajni sama nazwa (Paweł, Piotr). Apka otwiera ostatnio używaną stajnię, przy pierwszym logowaniu arkusz (szcz. 3.5.1). PanelUstawieniaStajni ↔ PanelUstawieniaBrzozowa to już prawdziwe przejście, bo Damian ma obie stajnie. **Dok.:** szcz. 3.5.1, 3.5.3.
22. **Dzwonek** (11 makiet; `notifications` to tylko SMS i e-mail). (a) usunąć; (b) lista liczona z istniejących danych; (c) skrzynka z nową tabelą. **Rek.:** (a) na PoC: eskalację admin dostaje SMS-em albo e-mailem (reguły powiadomień, dec. 2) i widzi w „Pilne”; Powiadomienia (P3) tylko przy (b).
23. **Potwierdzanie flag przez admina** (`flag_acknowledgements.method`: `tablet | app`). (a) w apce, w panelu podgląd; (b) `web` i „Potwierdzam” w panelu; (c) tylko obsługa i tablet. **Rek.:** (a).
24. **Klient po końcu ostatniego dostępu do konia.** (a) członkostwo zostaje (MainBezKonia), admin może je dezaktywować; (b) automatyczna dezaktywacja (BrakDostepu). **Rek.:** (a): kolejny koń nie wymaga nowego członkostwa. **Dok.:** członkostwo po ostatnim `valid_to` albo `revoked_at`.

**Codzienna praca i dane**

25. **Numer dla „Zadzwoń do stajni”** (`stables` nie ma telefonu). (a) `stables.phone`; (b) numer pierwszego aktywnego admina. **Rek.:** (b) na PoC.
26. **„Woda” w apce** (A-16). (a) ListaDnia; (b) szczegóły boksu; (c) karta konia. **Rek.:** (b) BoksSzczegolyWoda z wejściem z nowej linii w ListaDnia (zmiana zaakceptowanej makiety, za zgodą).
27. **Obsługa: plany i kontakt do klienta.** (a) „Edytuj plan” i „Zadzwoń”; (b) plan do odczytu, bez kontaktu. **Rek.:** (a): obsługa robi to samo co klient (erd pkt 3), a telefon przydaje się przy fladze w imieniu klienta.
28. **Wartości domyślne nowej stajni** (szcz. §5 pkt 27, 49; dev §5 pkt 13, 27). **Rozstrzygnięte 13.10.2026:** nowa stajnia ma wszystko włączone, także potwierdzenia flag (zmiana w Ustawieniach stajni). Język tablicy ustawia każdy tablet osobno (TabletUstawienia; przełącznik PL | UA w stopce zostaje); języków stajni nie ma (`stable_locales` znika), tłumaczenia nazw zostają jako opcjonalne etykiety. **Otwarte:** domyślna macierz widoczności ról (dev §5 pkt 27, szcz. §5 pkt 49): (a) wszystko włączone dla każdej roli, także Wyświetlacza i Wsparcia IT; (b) węższa, jak Pod Lipami. **Rek.:** (b): telewizor w korytarzu nie pokazuje zdrowia ani jazd, a Wsparcie IT widzi tylko diagnostykę. Do potwierdzenia razem z nią (propozycja; dev §5 pkt 13, szcz. §5 pkt 27): „Hala główna” i posiłki 06:30, 12:00, 18:00 z edycją w PanelZalozStajnie, okna szablonów jak Pod Lipami, `owner_edits_feeding` włączone. **Dok.:** erd pkt 2, 16; stan subskrypcji przed pierwszą płatnością.
29. **Nowe dane demo.** **Rozstrzygnięte 13.10.2026** (sekcja M arkusza, opis w 2.2): konto firmy „Stajnie Lipowe sp. z o.o.” (NIP 123-456-32-18, fikcyjny) z obiema stajniami; Damian to admin konta, rejestruje konto pn 07.09 i dodaje Brzozową czw 01.10 bez NIP-u; Paweł to Obsługa tylko w Brzozowej (+48 601 *** 377), zaproszony SMS-em 01.10; Ola Obsługa w obu, Piotr tylko Pod Lipami; Marta i Kuba w obu (Kuba zaproszony e-mailem); „Telewizor korytarz” (e-mail, Wyświetlacz, Pod Lipami). Znikają „Gospodarstwo Brzozowa” i `wyswietlacz-hala-nowa`, a „Stajnia Olszynka” znika z makiet; w testach zostaje jako nazwa drugiego konta firmy (fixture, dev 3.2, szcz. 3.2). Zostają (propozycja): Bartek, nowa Obsługa (+48 512 *** 908), Marek Nowak zamaskowany, Tomasz L. bez dostępu do Groma (tylko MainBezKonia), plan Bursztyna (owies 1 kg rano i wieczorem, siano bez ograniczeń). Osób z różnymi rolami w dwóch stajniach (szcz. 4.2) dane demo nie mają. Seed nadal trzyma obie stajnie w jednym koncie firmy, więc problem sceny zakładania znika; test izolacji (szcz. 3.3 stable, 4.2): Piotr (tylko Pod Lipami) nie widzi Brzozowej, a admin innego konta firmy nie widzi żadnej z nich (fixture, propozycja). **Dok.:** seed (dev 3.2, szcz. 3.2) i test izolacji.
30. **Podmiana linków.** (a) paczkami L1, L2, L3 według 3.H; (b) przy każdej planszy; (c) wcale. **Rek.:** (a) za zgodą; *BezAkcji po ukończeniu; linki w plikach TV zmieniamy w generatorze.
31. **Plansze TV** (rozstrzygnięte, bez decyzji): nowe plansze TV rysujemy według konwencji istniejących plików; WyswietlaczCentralny i WyswietlaczHala zmieniamy tylko w generatorze.
32. **Źródło flagi z decyzji stajni.** `horse_flags.source` ma `app` („właściciel w apce”) i `on_behalf_*`, a obsługa i admin ustawiają też flagi bez prośby klienta (seed: „Leki rano” Lorda od Pawła). (a) nowa wartość, np. `stable`; (b) `app` z `author_role = staff | admin` i opisem `app` „wpisana w apce”. **Rek.:** (b); do decyzji SzybkaFlagaObsluga pokazuje tylko `on_behalf_*`.
33. **Zmiana roli, kolejny koń, admin konta.** Zmiana roli nie ma opisu UI, zaproszenie ma jeden `horse_id`. (a) w PanelLudzie „Zmień rolę” i „Nadaj dostęp do konia” członkowi, z `valid_to`; (b) tylko zaproszenia (osobne zaproszenie na konia). **Rek.:** (a). „Zmień rolę” obejmuje tylko role stajni (Obsługa, Instruktor, Wsparcie IT, Wyświetlacz, Klient). Admin to rola konta firmy (dec. 35): zaproszenie ani „Zmień rolę” jej nie nadają, a dodanie albo przekazanie admina konta jest poza PoC (erd pkt 14). Jedyny admin konta nie usunie konta (ProfilAdmin, `DELETE /me`, szcz. 3.3 identity; notatka R1). **Dok.:** zarządzanie członkami w erd pkt 3 i 14; czy rola inna niż `client` może mieć `horse_access`.
34. **Słowniki pasz, padoków, ujeżdżalni** (szcz. 3.5.3: „słowniki” bez makiet). (a) na PoC z seedu i `stable.created`, dopisywanie przez „+ Nowa pasza” i „+ Nowy padok” w EdycjaPlanuKonia, PanelSlowniki w P2; (b) od razu tylko PanelSlowniki. **Rek.:** (a); dopisują admin i obsługa (propozycja).
35. **Admin to rola konta firmy** (nowa reguła, rozstrzygnięte 13.10.2026). Admin (właściciel albo zarządca) ma dostęp do wszystkich stajni konta firmy, także nowych, bez przypisywania. Pozostałe role (Obsługa, Instruktor, Wsparcie IT, Wyświetlacz, Klient) przypisuje się per stajnia, a jedna osoba może być przypisana do kilku stajni (Ola). Zaproszenie nie nadaje roli Admin. **Dok.:** erd pkt 14 (`business_admins`, propozycja), szcz. 3.3 access, 4.2.

**Marka**

36. **Nazwa produktu.** **Rozstrzygnięte 13.10.2026:** produkt nazywa się EQUENOR (wcześniej robocza nazwa eKoniuszy), hasło „Equestrian Management, Refined” mniejszym tekstem pod znakiem, nie obok. **Dok.:** README, paleta.md (zasady znaku i hasła), erd „Zmiany”, dev i szcz.

**Zmiany w dokumentach bez osobnej decyzji**
- **Zdrowie:** kto wpisuje wizyty; czy dzierżawca widzi `owner_private` właściciela; wet i kowal są w notatce flagi i w `health_events`, bez jednego źródła na tablicy i TV.
- **Seed:** Hala nowa · boks 5 ma tylko 3 wpisy, Bursztyn nie ma planu karmienia (dec. 29); `instructor` i `it_support` bez imion; brak reguły, czy „OSTATNIE AKCJE” wolnego boksu obejmują akcje hali i przeniesienia koni (`horse_box_history`).
- **analiza.md v3:** oznaczyć jako nieaktualne parowanie QR, PIN-y, tryb serwisowy i wyjście z kiosku, listę urządzeń z komendami, link zaproszenia z tokenem, status „wyświetlono”; ustalić, czy zostaje wydruk awaryjny (§8.2, §15.1.9).
- **Spójność:** numeracja §5 w dev i szcz. jest różna; po narysowaniu zaktualizować „Ekrany z makiet” i „Ekrany bez makiet” w szcz. 3.5.1–3.5.4.
