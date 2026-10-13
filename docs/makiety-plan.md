# EQUENOR: plan brakujących makiet

> 2026-10-12, poprawki po decyzjach i komentarzach użytkownika z 13.10.2026 (także logowanie hasłem z kodem MFA i rejestracja z potwierdzeniem konta, W6–W9 z mikroserwisy.md; dostawca tożsamości ZITADEL self-hosted, W10, ekranów nie zmienia) · [erd.md](erd.md) · [development.md](development.md) (pełna wersja [development-szczegoly.md](development-szczegoly.md)) · [paleta.md](paleta.md) · kanwa [claude.ai/artifact/SjdCnhTF5eqXy2vRaSMUtX](https://claude.ai/artifact/SjdCnhTF5eqXy2vRaSMUtX) · bez cen i infrastruktury.

**Oznaczenia**
- **P1:** rejestracja (konta firmy, stajni, osób i kont technicznych), ekran główny roli, strona www, ekran wymagany przez kryterium gotowości etapów 1–6 (szcz. 3.6) albo cel linku z innej planszy P1. **P2:** domyka nawigację i stany przed pilotażem. **P3:** po PoC albo po decyzji, która może planszę usunąć.
- **Wariant:** kopia istniejącego pliku z innym stanem albo danymi. **(propozycja):** tego dokumenty nie przesądzają. **dec. N:** decyzja z sekcji 5. Oba dopiski są tylko w planie i notatkach kanwy, nigdy w UI. **●** przy stanie: osobna plansza; stan bez ● to fragment na planszy zbiorczej (2.1).
- Skróty: **erd**, **dev** (development.md), **szcz.** (development-szczegoly.md); numeracja §5 w dev i szcz. jest różna, więc zawsze podajemy plik. Testy A, T, K, W, N: szcz. 4. Po nazwie planszy: powierzchnia, rozmiar, priorytet, decyzje i źródła; szcz. 3.5.1–3.5.4 (ekrany apki, tabletu, panelu i TV) dotyczą każdej planszy swojej powierzchni, więc ich nie powtarzamy.

## 1. Zakres

- **Rejestracja:** konto firmy z NIP-em i stajnie w panelu (dec. 1, 3); zaproszenia SMS-em albo e-mailem, rejestracja z hasłem i potwierdzeniem kodem i pierwsze logowanie (Klient, Obsługa, Instruktor; konta techniczne Wyświetlacz i Tablet); „rejestracja” urządzeń, czyli zwykła rejestracja konta technicznego na kontakt z zaproszenia i logowanie nim (e-mail albo telefon, hasło i kod MFA), po którym urządzenie od razu ma swój widok (TV: tablica; tablet: przy pierwszym logowaniu wybór boksu, potem tablica); lokalnie zapamiętane są tylko widok TV, boks i język tabletu (serwer urządzeń nie rejestruje, erd pkt 2 i 4).
- **Strona www:** publiczna strona przed logowaniem, sama prezentacja produktu w 4 blokach, bez bloga i CMS (grupa I, dec. 37).
- **Ekran główny:** start każdej roli w apce i panelu, pierwszy ekran tabletu i TV. Dziś są tylko Main, ListaDnia, TabletBoks i WyswietlaczCentralny.
- **„Itd. itp.”:** cele martwych linków i stany wymagane przez dokumenty i testy.
- **Poza zakresem:** zmiany układu zaakceptowanych makiet (tylko linki, 3.H; wyjątek: poprawki z decyzji 13.10, np. boksy w PanelDodajHale, macierz z kolumną Tablet zamiast Wsparcia IT), pliki *BezAkcji (poza PanelUstawieniaBezAkcji, dec. 19), parowanie i rejestr urządzeń z analiza.md v3. W Stajni Brzozowej tylko pozycje z tabeli 2.2.

## Na start: pierwsza fala (29 plansz)

Prośba dotyczyła rejestracji i ekranów głównych, więc zaczynamy od ścieżek, które pokazują je od początku do końca. Reszta P1 (stany, flagi, codzienna praca) idzie kolejnymi paczkami z sekcji 4.

- **Stajnia od zera (panel):** PanelRejestracja → PanelRejestracjaKod → PanelLogowanie → PanelLogowanieKod → PanelWitaj → PanelRejestracjaFirmy → PanelZalozStajnie → PanelZalozPowiadomienia → PanelPulpitStart → PanelZaprosOsobe.
- **Zaproszona osoba (apka):** WiadomosciSms → Rejestracja → RejestracjaKod → LogowanieNumer (hasło) → Logowanie (jest, kod MFA) → MainLuna; BrakDostepu dla konta bez zaproszenia („Zaloguj się innym kontem” → LogowanieNumer).
- **Ekrany główne ról:** MapaNawigacjiRol, AdminDzis, PanelPulpit, InstruktorJazdy. Klient i Obsługa już je mają (Main, ListaDnia), konta techniczne niżej (TV, tablet). Wsparcie IT to zespół EQUENOR: poza stajnią, bez ekranu w apce (dec. 19).
- **Telewizor:** WyswietlaczLogowanie → WyswietlaczKod (ta sama strona co PanelLogowanie i PanelLogowanieKod: wybrany E-mail, hasło, potem kod MFA; konto techniczne „Telewizor korytarz”, t•••@stajnielipowe.pl, założone wcześniej w PanelRejestracja) → WyswietlaczCentralny (jest; widok tablicy wynika z roli Wyświetlacz). Konto zaprasza admin w PanelZaprosOsobe („Konto techniczne: Wyświetlacz”), w Ludziach jest w filtrze „Konta techniczne” (PanelLudzieWyswietlacze).
- **Tablet:** TabletLogowanie (e-mail i hasło) → TabletLogowanieKod (kod MFA; konto techniczne „Tablety Pod Lipami”, b•••@stajnielipowe.pl, wybrany E-MAIL) → TabletPierwszyBoks (od razu wybór boksu, zakładki hal, bez wyboru stajni) → TabletBoks (jest); TabletUstawienia (KONTO „Tablety Pod Lipami · konto techniczne”). Konto zaprasza admin w PanelZaprosOsobe („Konto techniczne: Tablet przy boksie”).
- **Strona www:** StronaGlowna (w telefonie StronaGlownaTelefon), 4 bloki; „Zaloguj się” → PanelLogowanie, „Załóż konto firmy” → PanelRejestracja.

Rozstrzygnięte 13.10.2026: dec. 1, 2, 3, 4, 7 (e-mail; potem hasło z kodem MFA, W8, W9), 10, 11, 12, 15, 19, 21, 28 (bez macierzy widoczności ról), 29 i nowe 35, 36, 37, 38 (sekcja 5; komentarze z kanwy N1–N15 arkusza). Przed falą otwarte zostają już tylko dec. 17 i 18. Bez odpowiedzi rysujemy według rekomendacji, z dopiskiem „(propozycja, dec. N)” w notatce kanwy.

**Stan 13.10.2026:** pierwsza fala (24 plansze) jest na kanwie (sekcja „Pierwsza fala”), narysowana według rekomendacji. Numery decyzji i linki tymczasowe (np. „[WWW]/app” → LogowanieNumer) są w notatkach rzędów. Po decyzjach z 13.10 poprawiamy jej plansze według 2.3, dokładamy PanelRejestracjaFirmy, PanelZalozPowiadomienia, StronaGlowna i StronaGlownaTelefon i podmieniamy linki (3.H). Dwie plansze pierwszej fali znikają z kanwy (dec. 15, 19) i żaden link do nich nie prowadzi.

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
- **Linki:** jedynym spisem jest 3.H. Link prowadzi do pliku tej samej powierzchni, chyba że ekran wprost otwiera inną (ProfilAdmin „w panelu web”, strona www → panel). Plansza P1 nie linkuje do P2 ani P3, a P2 do P3: do czasu narysowania celu ma cel „(tymczasowo)” albo nie ma linku, a wymiana idzie w L2 i L3. Pliki Brzozowej linkują tylko do plików Brzozowej.
- **Zaakceptowane makiety:** nie zmieniamy układu (poza poprawkami z decyzji 13.10); nowe ekrany to nowe pliki; linki podmieniamy paczkami za zgodą (dec. 30); *BezAkcji nie ruszamy, poza macierzą w PanelUstawieniaBezAkcji (dec. 19). WyswietlaczCentralny i WyswietlaczHala powstają z generatora; nowe pliki TV rysujemy według ich konwencji, bez ruszania tych dwóch.
- **Kanwa:** ostatnia plansza kończy się na y = 10536; pierwszy nowy tytuł (`title1`) na y = 10836, plansze na y = 11136; kolejny tytuł 300 px pod najniższą planszą rzędu. Odstęp 80 px: telefon co 470, tablet co 782, panel co 1520, TV co 1680. Każdy plik w `boards` i `order`, tytuł planszy zaczyna się od priorytetu („P1 · …”).
- **Rzędy = grupy z sekcji 3:** R1 A, R2 B, R3 C, R4 D, R5 E, R6 F, R7 G, R8 plansze zbiorcze, R9 P3, R10 I (strona www). P2 na końcu rzędu swojej grupy. Każdy rząd ma pomarańczową notatkę z numerami decyzji i źródeł; do tego notatki: R1 „Konto i odzyskanie” (utrata numeru: logowanie e-mailem i kod na e-mail, jeśli konto go ma; zapomniane hasło: „Nie pamiętam hasła”; inaczej admin zaprasza nowy numer i dezaktywuje stare członkostwo, propozycja; jedyny admin konta nie usunie konta, a dodanie albo przekazanie admina konta jest poza PoC: dec. 33, 35, erd pkt 14), R5 „Zgubiony tablet” (dec. 12).

### 2.2 Dane

- **Moment:** wt 13.10.2026, 07:15, Europe/Warsaw (pop-up tabletu 06:01). Konie, flagi, posiłki, padoki, zadania, wizyty i Stajnia Brzozowa: seed (dev 3.2).
- **Konto firmy:** „Stajnie Lipowe sp. z o.o.”, NIP 123-456-32-18 (fikcyjny), siedziba ul. Lipowa 12, 05-520 Konstancin-Jeziorna; należą do niego obie stajnie. Damian to admin konta (właściciel): ma dostęp do obu stajni, +48 602 *** 145, d•••@stajnielipowe.pl.
- **Pod Lipami:** Damian (admin konta), Ola (Obsługa, także w Brzozowej), Piotr (Obsługa tylko tu), Anna (Kasztan, Bella), Karolina W. (Iskra), Tomasz L. (Grom), Ewa K. (Sonata), Marek Nowak (zaproszenie do Luny, wygasa czw 15.10); konta techniczne: „Telewizor korytarz” (Wyświetlacz, t•••@stajnielipowe.pl) i „Tablety Pod Lipami” (Tablet, b•••@stajnielipowe.pl), logują się e-mailem, hasłem i kodem z e-maila.
- **Brzozowa:** ul. Brzozowa 5, 05-500 Piaseczno; jedna hala „Hala główna” (nazwy nie pokazujemy), boksy 1–6 z poidłem automatycznym, posiłki 06:30, 12:00, 18:00. Damian (admin konta), Paweł (Obsługa tylko tu, prowadzi stajnię na co dzień i sam obsługuje konie, +48 601 *** 377), Ola (Obsługa), Anna (Kometa); bez wyświetlacza; tablety na koncie technicznym „Tablety Brzozowa” (propozycja). Ustawienia jak PanelUstawieniaBrzozowa: Damian zmienił je po założeniu (potwierdzenia wyłączone, bez Derki, moczenia i padoku).
- **W obu stajniach:** Ola (Obsługa), Anna (Klient), Marta (Instruktor). Przełącznik stajni „▾” ma każdy z dwiema stajniami: Damian, Ola, Anna i Marta; Paweł i Piotr widzą samą nazwę stajni. Kuba to admin globalny zespołu EQUENOR (`plt = admin`, propozycja z mikroserwisy.md), nie członek stajni (dec. 19).
- **Sceny zakładania (retrospekcje, dec. 29):** pn 07.09.2026 Damian zakłada konto i konto firmy (PanelRejestracja → PanelRejestracjaKod → PanelLogowanie → PanelLogowanieKod → PanelWitaj → PanelRejestracjaFirmy) i zakłada Stajnię Pod Lipami; czw 01.10.2026 dodaje Stajnię Brzozową bez pytania o NIP (PanelZalozStajnie → PanelZalozPowiadomienia → PanelPulpitStart → PanelZaprosOsobe: zaproszenie Pawła SMS-em; Olę przypisuje do Brzozowej w Ludziach, bez zaproszenia).
- Dane spoza seedu i sekcji M arkusza mają „(propozycja)” w notatce kanwy (dec. 29). Numery i e-maile zawsze zamaskowane: „+48 607 *** 218”, „d•••@stajnielipowe.pl”.

**Stajnia Brzozowa w nowych planszach** (jedyne miejsce z jej wariantami):

| Plansza | Wersja Brzozowej | Forma |
|---|---|---|
| PanelZalozStajnie, PanelZalozPowiadomienia, PanelPulpitStart, PanelZaprosOsobe | dodanie Brzozowej (Damian, 01.10; zaproszenie Pawła) | treść główna |
| ZaproszenieNoweStajnia (dawny stan ZaproszeniePrzyjmij) | Anna (Kometa); Ola przypisana w Ludziach, bez zaproszenia | ● P1 · stan |
| PanelDodajKonia | Kometa, „boks 1” bez hali, zaproszenie Anny | stan |
| AdminDzis · PanelPulpit | AdminDzisBrzozowa · PanelPulpitBrzozowa | ● P1 · plik P2 |
| AdminZadania | bez wyboru hali | stan |
| InstruktorJazdy · PanelLudzieWyswietlacze | brak jazd · filtr „Konta techniczne”: tylko „Tablety Brzozowa” | stany |
| TabletPierwszyBoks | konto „Tablety Brzozowa”, bez zakładek hal: 1 Kometa, 2 Dąb, 3 Iga, 4 Lord, 5 WOLNY, 6 Nuta | stan |
| TabletBoksWolny · ListaDniaGotoweBoksy | boks 5 bez hali i padoku · lista 1–6 bez hal | stany |
| EdycjaPlanuKonia | Kometa: owies 1 kg wieczorem (rano wstrzymane), siano, musli 0,5 kg wieczorem; bez „Namoczyć” i padoku | stan |
| SzybkaFlaga · SzybkaFlagaObsluga | SzybkaFlagaBrzozowa · 6 kafelków, „obowiązuje od razu” | ● P1 · stan |
| KartaKonia · StajennyKonie · KartaKoniaObsluga | KartaKoniaKometa · StajennyKonieBrzozowa · Kometa bez namaczania i padoku | pliki P2 · stan |
| TabletEkranZablokowany · ListaDnia w dniu założenia | TabletEkranZablokowanyBrzozowa · ListaDniaPusta | pliki P3 |
| MainBrzozowa: Flagi, Historia; PanelUstawieniaBrzozowa: Boksy, Konie, Ludzie, Płatności, ustawienie boksu | poza zakresem | bez linku |

### 2.3 Słownictwo i wygląd

- **Role:** Klient, Obsługa, Admin, Instruktor. Admin to rola konta firmy (wszystkie stajnie firmy), pozostałe role i konta techniczne przypisuje się per stajnia (dec. 35).
- **Konta techniczne** (dec. 10, 11, 12): telewizor i tablety logują się kontem technicznym, nie kontem osoby. Nazwa w UI: „konto techniczne” z rolą Wyświetlacz albo Tablet. W „Zaproś osobę” osobna grupa „Konto techniczne”: „Wyświetlacz” i „Tablet przy boksie”, oddzielona od ról osób. W Ludziach zwykłe wiersze w filtrze „Konta techniczne”: „Telewizor korytarz · konto techniczne · Wyświetlacz”, „Tablety Pod Lipami · konto techniczne · Tablet” (jedno konto tabletów na stajnię, propozycja). Konto zakłada się zwykłą rejestracją na kontakt z zaproszenia (hasło, kod weryfikacyjny), logowanie jest zwykłe (e-mail albo telefon, hasło i kod MFA na ten kontakt), a po nim od razu własny widok: TV tablica, tablet wybór boksu (przy zapamiętanym boksie od razu tablica). „Zablokuj” w Ludziach to `stable_members.active = false` i podbicie `token_version` konta (erd pkt 14): urządzenie najpóźniej po 5 min, przy odświeżeniu tokenu, pokazuje ekran blokady (TabletBrakUprawnien, WyswietlaczZablokowany), a po „Odblokuj” ekran logowania. Konto tabletów ma też „Wyloguj wszystkie tablety” (tylko podbicie `token_version`); jednego urządzenia nie odłączamy. TV używa zwykłej strony logowania panelu (bez osobnego adresu i ekranu „Zaloguj telewizor”), tablet ekranu logowania w swojej apce według wzorca z punktu „Logowanie”. Bez adresów technicznych do kodu, wyboru stajni na tablecie i instrukcji podłączania.
- **Wsparcie IT** (dec. 19): zespół EQUENOR, poza stajnią. Nie ma go w zaproszeniach (PanelZaprosOsobe, Zaproszenie), Ludziach, macierzy widoczności (PanelUstawieniaStajni, PanelUstawieniaBrzozowa, PanelUstawieniaBezAkcji) ani w apce; w danych demo nie jest członkiem stajni.
- **Flagi:** status „potwierdzona HH:MM” albo „niepotwierdzona” (nigdy „przyjęte”), tylko przy `requires_ack`, inaczej „obowiązuje od razu”; godziny „06:00–10:00”, „od 14:30”, „16:00–08:00”, „dziś, cały dzień”. „Przyjęte” wolno tylko przy zaproszeniach.
- **Akcje:** „Boks gotowy”, „Podano śniadanie / obiad / kolację”, „Wyprowadzono na padok”, „Woda” tylko przy poidle ręcznym. Bez „Najemca”, „Serwisant”, „Właściciel konia” jako roli, „Nakarmiony”, „Czyszczenie”, „Ścielenie”; „Siano” tylko jako pasza; znak „EQUENOR” zawsze wersalikami, a w zdaniach nieodmienny („w EQUENOR”, „do EQUENOR”); hasło „Equestrian Management, Refined” tylko pod znakiem (zasady: paleta.md).
- **Boks:** przy kilku halach „Hala nowa · boks 4”, w wąskich listach „Nowa 4”; w Brzozowej „boks 1”; formularze wysyłają `boxId`.
- **Logowanie** (apka, panel, tablet, TV; dec. 7, W6–W9): pierwszy ekran: przełącznik segmentowy „Telefon | E-mail” w stylu „Kanał: SMS | E-mail” z Zaproszenie (tablet: „TELEFON | E-MAIL”, e-ink), pole kontaktu, „Hasło” i link „Nie pamiętam hasła”; potem zawsze krok MFA, czyli obecne ekrany z kodem („Kod wysłaliśmy na …”, 6 pól, więc generator kodów ZITADEL ustawiamy na 6 cyfr, bo domyślny kod MFA ma 8 [S]; „Wyślij kod ponownie”, który wraca do pierwszego ekranu z wpisanym kontaktem, bo aplikacja nie trzyma hasła; mikroserwisy.md 3.1). Rejestracja: kontakt, hasło, imię, język, „Załóż konto” → potwierdzenie kodem → logowanie (bez automatycznego logowania; rejestracja samym telefonem zależy od spike'u ZITADEL, mikroserwisy.md 3.1 [S]). Reset hasła: kontakt → kod (tym samym kanałem co kod MFA) i nowe hasło. Bez dopisków, także bez reguł hasła pod polem (błąd dopiero po wpisaniu). Bez TOTP i passkey. Zaproszenia SMS-em albo e-mailem.
- **Teksty, bez objaśnień w UI** (dec. 38): tylko etykiety, wartości, przyciski i komunikaty stanu potrzebne do działania. Bez komentarzy objaśniających, dopisków pod polami, wstępów i instrukcji (np. „Wybór zapisze się…”, „Boks zmienisz potem…”, „tylko ten tablet”, „nie widać na tablicy”, „Zmienisz to później w Ustawieniach”). Wyjątek: zdanie, bez którego ekran jest niezrozumiały, i skutki w dialogu potwierdzenia. Po usunięciu tekstu układ się domyka, bez pustych miejsc. Zasada ma pierwszeństwo przed cytatami w opisach plansz.
- **NIP** (dec. 38): zwykłe pole „NIP” w PanelRejestracjaFirmy, bez tłumaczenia. Nigdzie zdań typu „konto firmy z NIP-em”, „potem podasz NIP”, „NIP podajesz raz…”, „Jedno konto na jeden NIP…”; jedyny tekst o NIP-ie to błąd „Ten NIP ma już konto w EQUENOR”.
- **Brak dostępu** (dec. 38): bez „Czekasz na zaproszenie?”, próśb „poproś admina…” i pokazywania numeru w takim kontekście. Zaproszona osoba po zalogowaniu po prostu ma dostęp (zaproszenie dopasowuje się samo, bez „Przyjmij”, dec. 4); bez dostępu: „Brak dostępu do stajni” i „Zaloguj się innym kontem”.
- **Strona www** (dec. 37): tylko prezentacja produktu, statyczna, maksymalnie 4 bloki: (1) hero: „EQUENOR” z hasłem pod spodem, jedno zdanie, „Załóż konto firmy” i „Zaloguj się”, jeden duży obraz produktu; (2) cztery ekrany: apka, tablet przy boksie, telewizor, panel, każdy obraz, nazwa i jedno krótkie zdanie; (3) jeden przykład flagi z godzinami; (4) stopka z kontaktem. Bez bloga i CMS, plakietek zalet w hero, ogólników, wstępów do sekcji, „Z życia stajni”, „Dla kogo”, osi czasu, list zalet, FAQ i treści instruktażowych (NIP, konta, tablety, e-ink). Duże fonty, dużo powietrza, mało słów.
- **Adresy:** [PANEL] to subdomena panelu; TV otwiera zwykłą stronę logowania [PANEL], a po zalogowaniu kontem z rolą Wyświetlacz panel pokazuje widok tablicy (dec. 10). Strona pobierania apki to [WWW]/app (dev 2).
- **Paleta:** tylko paleta.md, jak w istniejących makietach; błędy i offline w rodzinie „uwaga”, na TV bez pól w akcencie; na tablecie nieaktywny przycisk z przerywaną ramką, OFFLINE jako `t-warn`, ekran działa na czarno-białym e-inku.
- **Nagłówki:** jak w istniejących makietach (zakładka ze znakiem i stajnią, podstrona z „← Wróć” bez paska, logowanie z logo 60 px). Paski Klienta i Obsługi bez zmian, Admina według dec. 17, Instruktora z 3 pozycjami (propozycja). Apka i panel: przełącznik stajni „▾” tylko przy kilku stajniach (admin konta, gdy firma ma kilka stajni; inni przy kilku członkostwach), inaczej sama nazwa (dec. 21, szcz. 3.5.1); bez dzwonka (dec. 22). Panel: „▾” jak w PanelUstawieniaStajni, menu 240 px, formularz jako `aside role=dialog` z prawej. Tablet i TV bez przełącznika.
- **Widoczność:** funkcja odznaczona dla roli w `stable_role_features` znika (sekcja, pozycja paska); Admin widzi wszystko; konto tabletów ma w macierzy kolumnę „Tablet” (Zadania i Historia boksu nieaktywne, erd pkt 16); wyłączona opcja stajni znika razem ze stanem. Wyświetlacz Pod Lipami nie widzi zdrowia ani jazd.
- **Urządzenia i prywatność:** bez parowania QR, PIN-ów, kodów serwisowych, listy tabletów, telemetrii w bazie i zdalnych komend. Tablica nie pokazuje zalogowanego konta (tylko ukryte ustawienia). TV bez danych osobowych, także przy logowaniu. Po wylogowaniu, blokadzie konta albo zawieszeniu stajni nie pokazujemy starych flag.

## 3. Makiety

### 3.0 Przegląd

Grupa = paczka z sekcji 4 (P1 grupy A to paczka 1 itd., grupa I to paczka „www”). Istniejące pliki poprawiane po decyzjach z 13.10 (np. PanelDodajHale) nie wchodzą do liczb.

| Plik | Powierzchnia | Prio | Po co |
|---|---|---|---|
| **A. Apka: logowanie, zaproszenia, konto** | | | |
| LogowanieNumer | apka | P1 | krok 1 logowania: telefon albo e-mail i hasło |
| LogowanieBlad | apka | P1 | zły albo wygasły kod MFA, limit prób |
| ResetHasla | apka | P1 | „Nie pamiętam hasła”: kod i nowe hasło |
| BrakDostepu | apka | P1 | zalogowany bez stajni i zaproszenia |
| WiadomosciSms | apka | P1 | treść SMS: zaproszenie, kod, eskalacja |
| ZaproszenieStrona | www | P1 | strona z linku w SMS: pobranie apki |
| Rejestracja | apka | P1 | nowe konto: telefon albo e-mail, hasło, imię, język (zastępuje ZaproszeniePrzyjmij); ● RejestracjaKod |
| ZaproszenieNoweStajnia | apka | P1 | dostęp do drugiej stajni po dopasowaniu zaproszenia |
| MainLuna | apka | P1 | pierwszy ekran klienta konia bez boksu |
| Profil | apka | P1 | język, wylogowanie, usunięcie konta |
| ProfilAdmin | apka | P1 | profil admina z wejściami do panelu |
| PrzelacznikStajni | apka | P1 | wybór stajni przy kilku członkostwach |
| ZaproszenieObsluga | apka | P2 | zaproszenie obsługi, stan po wysłaniu |
| LudzieAdmin | apka | P2 | zakładka Ludzie admina |
| ProfilZmianaNumeru | apka | P2 | zmiana numeru telefonu |
| StronaUsunKonto | www | P2 | usunięcie konta, wymóg Google Play |
| MainBezKonia | apka | P2 | klient bez dostępu do konia |
| StajniaZawieszona | apka | P2 | stajnia `suspended` |
| **B. Panel: logowanie, stajnia, ludzie** | | | |
| PanelLogowanie | panel | P1 | telefon albo e-mail i hasło; wejście do rejestracji |
| PanelLogowanieKod | panel | P1 | krok MFA: kod z SMS-a albo e-maila |
| PanelRejestracja | panel | P1 | nowe konto (także konta techniczne); ● PanelRejestracjaKod |
| PanelResetHasla | panel | P1 | „Nie pamiętam hasła” w panelu i na TV |
| PanelWitaj | panel | P1 | „Załóż konto firmy” po pierwszym logowaniu |
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
| PanelOps | panel zespołu EQUENOR (`[OPS]`) | P2 | admin globalny: logowanie hasłem i kodem, powód wejścia, wybór firmy i stajni, pasek „EQUENOR · pełny dostęp”, historia powiadomień (mikroserwisy.md, sekcja 4) |
| **C. Ekrany główne ról** | | | |
| MapaNawigacjiRol | panel | P1 | start i pasek każdej roli (paczka 0) |
| AdminDzis | apka | P1 | start admina: pilne, dziś, do załatwienia |
| AdminDzisBrzozowa | apka | P1 | start admina małej stajni |
| AdminZadania | apka | P1 | zadania z perspektywy admina |
| AdminZadaniaNowe | apka | P1 | dodanie zadania |
| InstruktorJazdy | apka | P1 | start instruktora |
| **D. Flagi** | | | |
| SzybkaFlagaGodziny | apka | P1 | zmiana podpowiedzianych godzin, „Inna flaga” |
| SzybkaFlagaObsluga | apka | P1 | flaga wpisana w imieniu klienta |
| SzybkaFlagaBrzozowa | apka | P1 | flaga w stajni bez potwierdzeń |
| StatusFlagiOdwolaj | apka | P1 | odwołanie flagi ze skutkami |
| KlientFlagi | apka | P2 | lista flag klienta |
| SzybkaFlagaNieWyslano | apka | P2 | flaga niewysłana, bez duplikatu |
| **E. Tablet** | | | |
| TabletLogowanie | tablet | P1 | e-mail albo telefon i hasło konta technicznego tabletów |
| TabletLogowanieKod | tablet | P1 | krok MFA: kod na skrzynkę albo telefon konta |
| TabletWylogowany | tablet | P1 | po wylogowaniu, „Wyloguj wszystkie tablety”, odblokowaniu konta i wygaśnięciu sesji |
| TabletBrakUprawnien | tablet | P1 | konto bez roli Tablet |
| TabletPierwszyBoks | tablet | P1 | pierwszy wybór boksu (zakładki hal) |
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
| PanelLudzieWyswietlacze | panel | P1 | Ludzie z filtrem „Konta techniczne” |
| WyswietlaczLogowanie | TV | P1 | zwykłe logowanie panelu (e-mail i hasło) kontem technicznym z rolą Wyświetlacz |
| WyswietlaczKod | TV | P1 | krok MFA: kod z e-maila albo SMS-a |
| WyswietlaczWylogowany | TV | P1 | utrata sesji, dane ukryte |
| WyswietlaczStart | TV | P1 | zimny start bez sieci |
| WyswietlaczZablokowany | TV | P1 | konto zablokowane, stajnia zawieszona |
| WyswietlaczOffline | TV | P1 | brak sieci, dane z HH:MM |
| WyswietlaczHalaGlowna | TV | P2 | pełny ekran Hali głównej |
| WyswietlaczDuzoBoksow | TV | P2 | kafle skrócone, strony co 20 s |
| **G. Codzienna praca** | | | |
| ListaDniaGotoweBoksy | apka | P1 | zaznaczanie boksów „Boks gotowy” |
| BoksSzczegolyWoda | apka | P1 | boks z poidłem ręcznym, „Woda”, przełącznik |
| EdycjaPlanuKonia | apka | P1 | plan karmienia i padoku |
| KartaKoniaKometa | apka | P2 | karta bez planu i jazd (Brzozowa) |
| StajennyKonieBrzozowa | apka | P2 | konie obsługi w Brzozowej |
| KartaKoniaObsluga | apka | P2 | karta konia dla obsługi |
| PrzeniesKonia | apka | P2 | przeniesienie konia w apce admina |
| MojBoksWyborKonia | apka | P2 | historia przy dwóch koniach |
| ListaDniaOffline | apka | P2 | lista dnia offline |
| **I. Strona www** | | | |
| StronaGlowna | www | P1 | prezentacja produktu, wejście do panelu |
| StronaGlownaTelefon | www w telefonie | P1 | ta sama strona w telefonie |
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
| KartaKoniaBella | apka | P3 | karta Belli |
| TabletEkranZablokowanyBrzozowa | tablet | P3 | blokada w Brzozowej |
| ListaDniaPusta | apka | P3 | lista dnia stajni bez koni |
| WyswietlaczPlanszeTestowe | TV | P3 | overscan i retencja (W-09, W-10) |
| PanelDiagnostyka | panel zespołu EQUENOR (`[OPS]`) | P3 | diagnostyka dla zespołu EQUENOR, poza panelem stajni (admin globalny i Wsparcie IT, `plt`, dec. 19) |

### A. Apka: logowanie, zaproszenia, konto

**LogowanieNumer** · apka, niezalogowany · 390×844 · P1 · erd pkt 6; szcz. 4.2; dev §5 pkt 1–2
- Treść: nagłówek jak Logowanie (logo 60 px na accent-soft, „EQUENOR” 28 px, pod nim hasło „Equestrian Management, Refined” ok. 14 px, `ink-2`), bez paska; H1 „Zaloguj się”; przełącznik „Telefon | E-mail” (2.3), wybrany Telefon: +48 „600 *** 412” (Anna); „Hasło” (z „pokaż”); „Nie pamiętam hasła” (→ ResetHasla); „Zaloguj się” (→ Logowanie, krok MFA); mniejszym „Załóż konto” (→ Rejestracja) i „Załóż konto firmy” (panel web, dec. 1); Polityka prywatności; bez dopisków („Masz zaproszenie ze stajni?…”, „Prowadzisz stajnię?…”, dec. 38).
- Stany: zły format („Wpisz 9 cyfr numeru”); numer spoza Polski (tekst zależy od szcz. 2.5 i §5 pkt 24; przy blokadzie krajów „Obsługujemy tylko numery z Polski (+48)”); złe hasło albo nieistniejące konto (jeden komunikat „Zły numer, e-mail albo hasło”); konto niepotwierdzone (→ RejestracjaKod z nowym kodem); limit prób („Spróbuj ponownie za kilka minut”); brak sieci; E-mail (zły format: „Wpisz poprawny adres e-mail”). „600…”, „+48 600…”, „0048…” to ten sam numer, bez stanu.

**LogowanieBlad** · wariant Logowanie · 390×844 · P1 · szcz. 3.6 etap 1, 4.2
- Treść: układ Logowanie, numer zamaskowany, 6 pól z ramką „uwaga”: „Zły kod”; „Wyślij kod ponownie”, „Zmień numer”.
- Stany: kod wygasł („Kod wygasł”, po końcu sesji logowania, propozycja 5 min zamiast 10, mikroserwisy.md 3.1; „Zaloguj się ponownie”); za dużo prób („Za dużo prób”; po 5 złych kodach konto jest zablokowane do resetu hasła, więc komunikat prowadzi do „Nie pamiętam hasła”, propozycja).

**BrakDostepu** · apka, zalogowany bez członkostwa · 390×844 · P1 · erd pkt 3, 6; szcz. 3.3 auth, 4.2, A-06, §5 pkt 20
- Treść: scena: osoba bez członkostwa (+48 512 *** 908, wygasłe zaproszenie obsługi; numeru nie pokazujemy); logo, bez paska i przełącznika; H1 „Brak dostępu do stajni”; jeden przycisk „Zaloguj się innym kontem”; bez próśb do admina, numeru, karty zaproszenia, telefonu stajni, „Sprawdź ponownie” i „Prowadzisz stajnię?” (dec. 25, 38).
- Stany: ten sam ekran przy braku zaproszenia (także numer przejęty po innej osobie: dostęp idzie za kontem, szcz. 4.2), zaproszeniu wygasłym albo odwołanym i dezaktywowanym członkostwie.

**WiadomosciSms** · plansza z treścią SMS · 390×844 · P1 · erd pkt 6; szcz. 2.5, 3.3 notifications i sms, 4.2, A-02, §5 pkt 24
- Treść: wątek od nadawcy „EQUENOR” (nazwa: szcz. §5 pkt 24); pod dymkiem liczba znaków i segmentów (polskie znaki: segment 70): zaproszenie Marka „Stajnia Pod Lipami zaprasza Cię do EQUENOR jako klienta (koń: Luna). Pobierz aplikację: [WWW]/app i załóż konto na ten numer. Ważne do 15.10.” (bez tokenu); kod „Kod EQUENOR: 482913”, bez linku; eskalacja do Damiana (A-02) „EQUENOR: Bella · Hala nowa · boks 4 · „Nie na padok” niepotwierdzona. Sprawdź tablet albo potwierdź w aplikacji.”; obok wersja UA zaproszenia obsługi (dec. 8).
- Stany: ponowne zaproszenie (+48 512 *** 908); e-mail zaproszenia konta technicznego („Telewizor korytarz”, t•••@stajnielipowe.pl; „załóż konto tym adresem”) i e-mail z kodem (dec. 7); kody potwierdzenia konta i resetu hasła w tej samej formie co kod logowania (nadawca „EQUENOR”, wysyła nasz `sms` albo `email`, W7).

**ZaproszenieStrona** · www w telefonie · 390×844 · P1 · analiza 8.1; erd pkt 6; dev 2
- Treść: [WWW]/app; znak z hasłem pod spodem; H1 „Pobierz EQUENOR”; App Store, Google Play; link „Panel web” ([PANEL]); bez kroków i objaśnień (dec. 37, 38), bez tokenu i danych zaproszenia.
- Stany: otwarcie na komputerze (QR do sklepów, propozycja).

**Rejestracja** (zastępuje plan ZaproszeniePrzyjmij; makietę ZaproszeniePrzyjmij przerobić) · apka, niezalogowany · 390×844 · P1 · dec. 4, 9 · erd pkt 3, 6, 14; szcz. 2.4, 3.3 auth, 3.5.1, 4.2, A-06, A-17; mikroserwisy.md 3.1 (W8)
- Treść: Marek Nowak po linku z SMS-a (konta jeszcze nie ma); logo, bez paska; H1 „Załóż konto”; przełącznik „Telefon | E-mail” (2.3), wybrany Telefon: +48 „…”; „Hasło”; z dawnej sekcji „O Tobie”: „Imię i nazwisko” (Marek Nowak, wpisuje sam: rejestracja nie zna zaproszenia), język Polski | Українська | English; polityka prywatności; „Załóż konto”; mniejszym „Mam już konto” (→ LogowanieNumer); bez karty zaproszenia, „Przyjmij zaproszenie”, reguł hasła pod polem i innych dopisków (dec. 4, 38).
- Stany: ● **RejestracjaKod** (układ Logowanie: H1 „Potwierdź konto”, „Kod wysłaliśmy na +48 … ”, 6 pól, „Potwierdź”, „Wyślij kod ponownie za 0:42”; po potwierdzeniu LogowanieNumer z komunikatem „Konto potwierdzone. Zaloguj się.”, bez automatycznego logowania); zły albo wygasły kod; kontakt ma już konto („To konto już istnieje. Zaloguj się.”); za krótkie hasło (komunikat błędu; propozycja: min. 10 znaków); Bartek (Obsługa, +48 512 *** 908). Po pierwszym logowaniu (hasło i kod) zaproszenie dopasowuje się samo (dec. 4) i od razu start roli (MainLuna); wygasłe albo odwołane → BrakDostepu.
- ● **ZaproszenieNoweStajnia** (dec. 5): Anna, już zalogowana (scena czw 01.10): zaproszenie do Brzozowej dopasowuje się przy najbliższym odświeżeniu; Main z toastem „Masz teraz dostęp do Stajni Brzozowej” i przełącznikiem „▾” w nagłówku; bez arkusza, „Przyjmij” i „Później”. Stan: Ola, którą Damian przypisał do Brzozowej w Ludziach, bez zaproszenia (szcz. 3.3 auth, A-23): ten sam toast i przełącznik (propozycja).

**ResetHasla** · apka, niezalogowany · 390×844 · P1 · szcz. 2.4, 4.2; mikroserwisy.md 3.1 (W7, W8)
- Treść: Anna z LogowanieNumer („Nie pamiętam hasła”); logo, bez paska; H1 „Nowe hasło”; przełącznik „Telefon | E-mail”, +48 „600 *** 412”, „Wyślij kod”; potem na tej samej planszy: „Kod wysłaliśmy na +48 600 *** 412”, 6 pól, „Nowe hasło”, „Zapisz hasło” → LogowanieNumer z komunikatem „Hasło zmienione. Zaloguj się.”; bez dopisków; ta sama odpowiedź dla nieistniejącego konta.
- Stany: zły albo wygasły kod; limit prób; za krótkie hasło.

**MainLuna** · wariant Main · 390×844 · P1 · erd pkt 1, 3; szcz. A-04, A-06
- Treść: „Stajnia Pod Lipami” bez ▾, bez dzwonka; H1 „Dzień dobry, Marek”; „Luna · bez boksu · w stajni od pn 12.10”, „Brak aktywnych flag”; bez karty powitalnej, objaśnień o boksie i tablecie (dec. 38) i linii rutyny; „Szybka flaga · dla: Luna”, 7 kafelków z Derką; pasek klienta.
- Stany: po pierwszej fladze „Bez kolacji · dziś 17:00–20:00 · niepotwierdzona” (okno: propozycja, szcz. §5 pkt 27); po przypisaniu do Hala nowa · boks 6 (A-04) karta jak u Kasztana, historia od dnia przypisania, bez Wichra; Historia przed przypisaniem: pusta, „Luna · bez boksu”.

**Profil** · apka, wszystkie role · 390×960 · P1 · dec. 12, 33 · erd pkt 2, 6; szcz. 2.1, 2.7, 2.8, 3.3 auth, 4.2, T-23; analiza 8.5
- Treść: Ola z paskiem obsługi; H1 „Profil”; „Ty”: Ola („Zmień”), „+48 607 *** 218” ze „Zmień numer”, „Hasło” ze „Zmień hasło” (stan ProfilZmianaNumeru), „Kod logowania: SMS | E-mail” (tylko przy obu potwierdzonych kontaktach); „Język aplikacji”: Polski | Українська | English; „Moje stajnie”: Stajnia Pod Lipami · Obsługa (✓), Stajnia Brzozowa · Obsługa; „Sesja”: „Wyloguj”, „Wyloguj ze wszystkich urządzeń” (bez dopisku; tabletów nie dotyka, bo mają konto techniczne, dec. 12), „Usuń konto” (tekst destrukcyjny); polityka prywatności, wersja.
- Stany: Anna (pasek klienta); ● **ProfilAdmin** (Damian): „Zarządzanie stajnią · w panelu web” (Pulpit, Konie, Ustawienia stajni, Płatności „Subskrypcja aktywna”), „Usuń konto” zablokowane z „Jesteś jedynym adminem konta firmy”; dialog „Wyloguj ze wszystkich urządzeń?”; dialog usunięcia „Twoje dane osobowe zostaną usunięte, a wpisy w historii stajni zostaną bez nazwiska.” (`DELETE /me`).

**PrzelacznikStajni** · apka, arkusz nad Main · 390×844 · P1 · dec. 21 · szcz. 3.3 auth, stables, 4.2, A-17
- Treść: Anna; Main pod nakładką rgba(46,36,29,.40); „Twoje stajnie”, wiersze 64 px: „Stajnia Pod Lipami · Klient · Kasztan, Bella” (✓ teraz), „Stajnia Brzozowa · Klient · Kometa”; „Zamknij”; bez dopisków (dec. 38).
- Stany: Ola (Obsługa w obu); pierwsze logowanie (bez ✓ i „Zamknij”); „Wczytuję ustawienia Stajni Brzozowej…”; offline z „1 niewysłany zapis w Stajni Pod Lipami”.

**ZaproszenieObsluga** · wariant Zaproszenie · 390×844 · P2 · erd pkt 3; szcz. 3.3 auth
- Treść: Damian; toast OK „Wysłano nowe zaproszenie SMS · ważne do wt 20.10”; SMS, „+48 512 *** 908”, Obsługa (bez konia), „Imię” = Bartek; „Wysłane zaproszenia”: „+48 512 *** 908 · Obsługa · czeka · ważne do 20.10” z „Odwołaj”, poprzednie „wygasło 08.10 · wysłano nowe”, „Marek Nowak · Klient · Luna · wygasa za 2 dni”.
- Stany: odwołane; przyjęte („przyjęte 13.10 07:24 · Bartek”); błąd wysyłki.

**LudzieAdmin** · apka admina · 390×960 · P2 · jak PanelLudzie
- Treść: Damian; H1 „Ludzie”, „+ Zaproś osobę”, chipy Wszyscy · Obsługa · Klienci · Inne; grupy jak PanelLudzie; konta techniczne („Telewizor korytarz · konto techniczne · Wyświetlacz”, „Tablety Pod Lipami · konto techniczne · Tablet”) bez akcji (zarządza nimi panel); „Zaproszenia”.

**ProfilZmianaNumeru** · apka · 390×844 · P2 · erd pkt 6; szcz. 4.2; mikroserwisy.md 5.2
- Treść: nowy numer i „Hasło”, „Dalej”; potem dwa pola kodu: z SMS-a na nowy numer i kod MFA („Kod wysłaliśmy na …”, dotychczasowy kanał), „Zmień numer”; bez dopisków (dec. 38).
- Stany: złe hasło; zły kod; numer należy do innego konta; „Zmień hasło” z Profil: „Obecne hasło”, potem kod MFA i „Nowe hasło”, „Zapisz hasło” (StanyApka).

**StronaUsunKonto** · www w telefonie · 390×844 · P2 · szcz. 2.1; analiza 8.5; erd pkt 6
- Treść (wymóg Google Play, wyjątek od 2.3): „Usuń konto EQUENOR”: co usuwamy (dane osobowe, konto logowania), co zostaje (wpisy w historii stajni bez nazwiska); kroki: apka → Profil → Usuń konto; kontakt [E-MAIL]; formularz: numer albo e-mail, hasło i kod (propozycja).

**MainBezKonia** · wariant Main · 390×844 · P2 · dec. 24 · erd pkt 3; szcz. 4.2, §5 pkt 20
- Treść: Tomasz L., dostęp do Groma zakończony 12.10 (poza seedem); karta neutralna „Dostęp do Groma zakończył się 12.10”; bez kafelków flag; pasek Konie | Profil (propozycja).
- Stany: dostęp odebrany przez admina („Dostęp zakończony 13.10 07:00”); klient z drugą stajnią (przełącznik zostaje).

**StajniaZawieszona** · apka, wszystkie role · 390×844 · P2 · erd pkt 10; szcz. 3.3 board, §5 pkt 20
- Treść: Anna; karta krytyczna „Stajnia Pod Lipami jest nieaktywna” z „Zadzwoń do stajni”; bez koni i kafelków; przełącznik do Brzozowej działa; pasek tylko z Profilem (propozycja).
- Stany: admin („Płatność po terminie” z linkiem do Płatności w panelu web); obsługa (bez szybkich akcji); „Zaktualizuj aplikację” (`client_upgrade_required`).

### B. Panel: logowanie, stajnia, ludzie

**PanelLogowanie** · panel, niezalogowany · 1440×900 fill · P1 · dec. 7, 18 · szcz. 3.6 etap 1, §5 pkt 1, 15; analiza §9
- Scena: Damian, pn 07.09 (rejestracja konta firmy).
- Treść: tło bg, bez menu; karta 440 px: logo, „EQUENOR” z hasłem „Equestrian Management, Refined” pod spodem, H1 „Zaloguj się do panelu stajni”; przełącznik „Telefon | E-mail” (2.3), +48 „602 *** 145”, „Hasło”, „Nie pamiętam hasła” (→ PanelResetHasla), „Zaloguj się”, mniejszym „Załóż konto” (→ PanelRejestracja); Regulamin, Polityka prywatności; bez dopisków, bloku „Pierwszy raz?” z NIP-em i kolumny z opisem panelu (dec. 38). Tę samą stronę otwiera telewizor (WyswietlaczLogowanie), więc bez słowa „telewizor” i bez osobnego wejścia dla TV (dec. 10).
- Stany: ● **PanelLogowanieKod** (krok MFA: „Kod wysłaliśmy na …”, 6 pól, „Wyślij ponownie za 0:42”, „Zmień numer” albo „Zmień e-mail”; bez dopisków); złe hasło albo nieistniejące konto (jeden komunikat); konto niepotwierdzone (→ PanelRejestracjaKod); zły albo wygasły kod; limit prób.

**PanelRejestracja** · panel, niezalogowany · 1440×900 fill · P1 · dec. 1 · szcz. 2.4, 3.5.3; mikroserwisy.md 3.1 (W8)
- Scena: Damian, pn 07.09, przed rejestracją konta firmy.
- Treść: karta 440 px jak PanelLogowanie; H1 „Załóż konto”; przełącznik „Telefon | E-mail”, +48 „602 *** 145”, „Hasło”, „Imię i nazwisko” Damian, język Polski | Українська | English; „Załóż konto”; mniejszym „Mam już konto” (→ PanelLogowanie); bez dopisków o koncie firmy, NIP-ie i regułach hasła (dec. 38).
- Stany: ● **PanelRejestracjaKod** („Potwierdź konto”, „Kod wysłaliśmy na +48 602 *** 145”, 6 pól, „Potwierdź”, „Wyślij kod ponownie za 0:42”; po potwierdzeniu PanelLogowanie z komunikatem „Konto potwierdzone. Zaloguj się.”, bez automatycznego logowania); kontakt ma już konto; zły kod; za krótkie hasło. Tym samym ekranem osoba wdrażająca zakłada konta techniczne na kontakt z zaproszenia (tv.korytarz@…, boksy@…).

**PanelResetHasla** · panel (także TV) · 1440×900 fill · P1 · szcz. 2.4, 4.2; mikroserwisy.md 3.1
- Treść: jak ResetHasla w apce, w karcie 440 px: kontakt, „Wyślij kod”, potem kod i „Nowe hasło”, „Zapisz hasło” → PanelLogowanie z komunikatem „Hasło zmienione. Zaloguj się.”; bez słowa „telewizor”.
- Stany: jak ResetHasla.

**PanelWitaj** · panel, bez konta firmy i członkostwa · 1440×900 fill · P1 · dec. 1, 9, 18 · erd pkt 6, 15; szcz. 3.3 auth (`GET /me`, `PATCH /me`); analiza §9
- Treść: Damian przy pierwszym logowaniu, pn 07.09; imię i język podał przy rejestracji (PanelRejestracja), więc karta „Witaj w EQUENOR, Damian” ma tylko „Załóż konto firmy” (główny, → PanelRejestracjaFirmy) i „Wyloguj”; bez pól imienia i języka (w makiecie do usunięcia), opisu konta firmy i NIP-u. Bez „Czekasz na zaproszenie?” i próśb do admina z numerem: zaproszona osoba po zalogowaniu od razu ma dostęp (dec. 38).
- Stany: przy dec. 18 a rola inna niż Admin (Ola): komunikat „Panel jest dla admina konta firmy” i linki do apki (App Store, Google Play), bez innych objaśnień.

**PanelRejestracjaFirmy** · panel · 1440×900 fill · P1 · dec. 1, 3, 35 · erd pkt 14, 15
- Treść: Damian, pn 07.09; nagłówek jak PanelZalozStajnie, bez menu; H1 „Załóż konto firmy”; „NIP” 123-456-32-18, „Nazwa firmy” Stajnie Lipowe sp. z o.o., „Adres siedziby” ul. Lipowa 12, 05-520 Konstancin-Jeziorna, „E-mail do faktur”; bez dopisków o NIP-ie i koncie (dec. 38); „Dalej: załóż stajnię” → PanelZalozStajnie.
- Stany: „Ten NIP ma już konto w EQUENOR” (tylko komunikat błędu, bez stałej ramki, dec. 38); zły NIP (cyfra kontrolna); „Zapisuję…”.

**PanelZalozStajnie** · panel, krok 1 z 2 · 1440×900 fill, wyższa w razie potrzeby · P1 · dec. 2, 3, 28 · analiza §5.5, §9; erd pkt 11, 15, 16, 17; szcz. 3.3 stables, §5 pkt 23, 27, 49
- Scena: Damian (admin konta) dodaje Stajnię Brzozową, czw 01.10; zapis dopiero na końcu kroku 2 (`POST /stables`), reszta w Ustawieniach stajni i „Dodaj halę”.
- Treść: nagłówek: znak, „Zakładasz stajnię”, „D Damian ▾”, bez menu; kroki „1 Stajnia · 2 Powiadomienia”; H1 „Załóż stajnię”; **Stajnia:** „Stajnia Brzozowa”, strefa „Europa/Warszawa”; **Adres:** „ul. Brzozowa 5, 05-500 Piaseczno”; **Boksy:** hala „Hala główna”, „od 1 do 6” i od razu lista 6 wierszy: numer, poidło automatyczne | ręczne, „Więcej ustawień ›”; „Ustaw dla wszystkich”, opcja „Bez boksów na razie”; **Pory posiłków:** 06:30, 12:00, 18:00 „codziennie”, „+ Dodaj porę”, etykiety UA i EN zwinięte; stopka „Dalej: powiadomienia” → PanelZalozPowiadomienia. Bez pól: działalność i NIP (są w koncie firmy), języki tabletów (ustawia każdy tablet), potwierdzenia flag (nowa stajnia ma wszystko włączone, erd pkt 16). Bez dopisków (o adresie hali, jednej hali, ustawieniach) i kolumny „Co dalej” (dec. 38); układ bez pustej kolumny (2.3).
- Stany: walidacja (brak nazwy albo adresu, „od” większe niż „do”); „Ustaw dla wszystkich” (np. poidło ręczne w każdym wierszu); pierwsza stajnia zaraz po PanelRejestracjaFirmy (Pod Lipami, 07.09).

**PanelZalozPowiadomienia** · panel, krok 2 z 2 · 1440×900 fill · P1 · dec. 2, 7 · erd pkt 16, 17
- Treść: Damian, Stajnia Brzozowa, czw 01.10; nagłówek i kroki jak w kroku 1 („2 Powiadomienia”); H1 „Powiadomienia”; tabela: zdarzenia (flaga niepotwierdzona na czas, nowa flaga od klienta, przyjęte i wygasłe zaproszenie, faktura i nieudana płatność) × odbiorcy (Admin, Obsługa stajni) × kanał (SMS, e-mail), z checkboxami; „← Wstecz”, „Załóż stajnię” → PanelPulpitStart; bez dopisków (dec. 38).
- Stany: „Zakładamy stajnię…”; błąd „Nie udało się. Spróbuj ponownie.” (ponowienie nie tworzy drugiej stajni).

**PanelPulpitStart** · wariant PanelPulpit · 1440×900 fill · P1 · erd pkt 11, 16, 17; analiza §9
- Treść: Damian w dniu dodania Brzozowej (czw 01.10); nagłówek panelu („Stajnia Brzozowa ▾”, „D Damian (admin) ▾”), menu z Pulpitem; baner OK „Stajnia Brzozowa założona.”; „Pierwsze kroki”: ✓ Stajnia (ul. Brzozowa 5, Piaseczno); ✓ Boksy 1–6; ✓ Powiadomienia; ✓ Ustawienia „wszystko włączone” z „Sprawdź”; ○ „Dodaj konia” (0 z 6 boksów zajętych); ○ „Zaproś osobę”; ○ „Konto techniczne: Tablet przy boksie”; ○ „Konto techniczne: Wyświetlacz” z „Pomiń” (dec. 11, 12); bez instrukcji i „Jak podłączyć telewizor”; kafle 6 boksów · 0 koni · osoby; puste karty z „Brak flag”, „Brak koni”.
- Stany: w połowie (5 koni, zaproszenia Pawła i Anny „czeka”, Ola „przypisana”); wszystko zrobione (karta znika: PanelPulpitBrzozowa).

**PanelDodajKonia** · panel, dialog · 1440×900 fill · P1 · dec. 6 · erd pkt 1, 3; szcz. 3.3 stables, auth; A-04
- Treść: dialog nad „Boksy i konie” Pod Lipami, Damian dodaje Lunę (pn 12.10): „Imię” Luna; rasa, data urodzenia, zdjęcie (opcjonalne); „Boks”: „Bez boksu na razie” (wybrane) albo „Wolny boks”: „Hala główna · boks 3” / „Hala nowa · boks 6”; „Klient”: „Zaproś klienta teraz” (SMS, numer, „Imię” = Marek Nowak, „Ważne do” czw 15.10 zamiast domyślnych 7 dni), „Później” albo „Koń bez klienta”; „Anuluj”, „Dodaj konia i wyślij zaproszenie”; bez dopisków o tablecie i planie karmienia (dec. 38).
- Stany: zapisano (Luna w „Konie bez boksu”, „Klient: Marek Nowak · zaproszenie czeka”); 409 „Boks zajął inny koń, wybierz inny”.

**PanelZaprosOsobe** · panel, dialog · 1440×900 fill · P1 · dec. 6, 7, 8, 11, 33, 35 · erd pkt 3, 4, 6, 14; szcz. 3.3 auth, 4.2, §5 pkt 24
- Treść: dialog nad PanelPulpitStart (Damian zaprasza Pawła do Brzozowej, czw 01.10); „Kanał: SMS | E-mail” jak w Zaproszenie (SMS); „+48 601 *** 377”; rola jako radio: Klient (wybór pokazuje pole „Koń”), Obsługa (zaznaczona), Instruktor; osobna grupa „Konto techniczne”: Wyświetlacz i Tablet przy boksie (dec. 11, 12); bez Wsparcia IT (dec. 19), roli Admin (rola konta firmy, dec. 35) i opisów ról; „Imię” = Paweł; „Język wiadomości” PL | UA; „Ważne do” czw 08.10 (domyślnie 7 dni); podgląd SMS; „Wyślij zaproszenie”; bez podpowiedzi „Ola jest już w firmie?…” (dec. 38).
- Stany: Klient (wymagany „Koń”: Anna · Kometa); Instruktor; „Konto techniczne: Wyświetlacz” (Pod Lipami, „Telewizor korytarz”, e-mail); „Konto techniczne: Tablet przy boksie” (Pod Lipami, „Tablety Pod Lipami”, e-mail); wysłano (toast „Wysłano zaproszenie SMS · ważne do 08.10”); błąd wysyłki („Nie wysłano, spróbuj ponownie”); walidacja na jednym fragmencie: zły format numeru, „Ważne do” w przeszłości, Klient bez konia, na ten numer czeka już zaproszenie („Wyślij ponownie” zamiast nowego), osoba jest już członkiem z inną rolą („Zmień rolę w Ludzie”); klient już w stajni: „Nadaj dostęp do konia” (propozycja, dec. 33).

**PanelLudzie** · panel · 1440×900 fill · P1 · dec. 33 · erd pkt 3, 14; szcz. 3.3 auth
- Treść: Damian; H1 „Ludzie · Stajnia Pod Lipami”, „Zaproś osobę”; zakładki Członkowie | Zaproszenia 2; filtr roli (chipy, także „Konta techniczne”), wyszukiwarka; tabela (Osoba, Rola, Konie, Kontakt zamaskowany, Status, Akcje): Damian · Admin konta (wszystkie stajnie); Ola, Piotr · Obsługa; Anna · Klient · Kasztan, Bella; Karolina W. · Iskra; Tomasz L. · Grom; Ewa K. · Sonata; Marta · Instruktor; Telewizor korytarz · konto techniczne · Wyświetlacz · t•••@stajnielipowe.pl; Tablety Pod Lipami · konto techniczne · Tablet · b•••@stajnielipowe.pl; akcje „Zmień rolę”, „Dezaktywuj”, u klienta „Konie i dostęp” (`valid_to`, `revoked_at`).
- Stany: zakładka Zaproszenia (Marek Nowak „wygasa za 2 dni” z „Odwołaj”; +48 512 *** 908 „wygasło 08.10” z „Wyślij ponownie”; filtr przyjętych i odwołanych); dezaktywacja (dialog bez dopisków); „Zablokuj” konta tabletów (erd pkt 14): najpóźniej po 5 min (odświeżenie tokenu) tablety pokazują TabletBrakUprawnien, a po „Odblokuj” TabletWylogowany; „Wyloguj wszystkie tablety” przy koncie tabletów (dialog bez dopisków): tablety pokazują TabletWylogowany; nadanie dostępu do kolejnego konia; przypisanie do tej stajni osoby, która jest już w firmie (Ola do Brzozowej, bez zaproszenia, szcz. 3.3 auth, A-23; propozycja); nowa stajnia (pusta lista, admin konta tylko w nagłówku).

**PanelPrzeniesKonia** · panel, dialog · 1440×900 fill · P1 · erd pkt 1; szcz. 3.3 stables, 3.6 etap 2, A-04
- Treść: „Przenieś konia · Wicher” nad PanelBoksy: wolne boksy z halą („Hala główna · boks 3”, „Hala nowa · boks 6”), „Zamień z…”, „Wyjazd ze stajni” ze skutkami (zamyka flagi, plany, dostępy i jazdy; koń zostaje w historii, `horse.left`).
- Stany: 409 przy wyścigu o boks; „Przypisz konia” do wolnego boksu (lista koni bez boksu: Luna); „Przypisz boks” Luny do „Hala nowa · boks 6” (A-04).

**PanelPulpit** · panel · 1440×900 fill · P1 · erd pkt 3, 12, 13; szcz. 3.2, A-02, A-14
- Treść: Damian, nagłówek „Stajnia Pod Lipami ▾”; H1 „Pulpit · Stajnia Pod Lipami · stan na wt 13.10.2026, 07:15”; alert „uwaga” „Bella · Hala nowa · boks 4 · Nie na padok · dziś, cały dzień · niepotwierdzona od 01:20 · wysłano SMS i e-mail”, „Zobacz flagę”; kafle 2 hale · 14 boksów · 13 koni · 1 koń bez boksu; „Dziś w halach”: Hala główna (śniadanie ✓ 06:40 · Ola bez Kasztana, padok 10:00 · 4 konie, Boks gotowy 4 z 8), Hala nowa (✓ 06:50 · Piotr, padok 10:00 · 3 konie bez Belli, Boks gotowy 3 z 6, „Poidło ręczne · boks 5 · woda 06:55”); „Flagi dziś” (5); „Wizyty i jazdy”; „Zadania” do odczytu, bez dopisku; „Ludzie” (zaproszenia); „Subskrypcja: Aktywna · plan Stajnia · następna faktura 01.11.2026”.
- Stany: bez pilnych flag; przyciski obsługi wyłączone (jak PanelBoksyBezAkcji); pusta stajnia → PanelPulpitStart; płatność po terminie albo zawieszenie (baner).

**PanelPulpitBrzozowa** · wariant PanelPulpit · 1440×900 fill · P2 · dev 3.2
- Treść: Damian po przełączeniu na Brzozową; bez alertów i hal; śniadanie ✓ 06:35 · Paweł bez Komety; Boks gotowy 3 z 6; flagi Komety i Lorda „obowiązują od razu”; bez karty wyświetlacza (Brzozowa go nie ma).

**PanelMenuKonta** · panel, popover · 1440×900 fill · P2 · dec. 1, 3 · erd pkt 15; szcz. 3.3 stables, 4.2
- Treść: popover 320 px nad PanelPulpit: „Damian · admin konta · Stajnie Lipowe sp. z o.o.”, telefon i e-mail zamaskowane, „Profil i język”, „Konto firmy” (NIP, siedziba; na PoC do odczytu, propozycja), „Stajnie firmy” (Stajnia Pod Lipami ✓, Stajnia Brzozowa), „Załóż stajnię” (→ PanelZalozStajnie, bez NIP-u), „Wyloguj”, „Wyloguj ze wszystkich urządzeń” (bez dopisku; tabletów nie dotyka, dec. 12).

**PanelKonie** · panel · 1440×900 fill · P2 · erd pkt 1; szcz. 3.3 stables
- Treść: Damian; H1 „Konie · 13 koni · 1 bez boksu”, „Dodaj konia”; filtr hali, chipy Wszystkie · Z flagą · Bez boksu · Odeszły, wyszukiwarka; kolumny Koń, Boks z halą, Klient, Aktywne flagi z godzinami, Plan karmienia, Najbliższa wizyta, Akcje (Karta, Flaga, Przenieś); np. Kasztan · Główna 7 · Anna · Bez śniadania 06:00–10:00, Nie na padok od 14:30 · wet 08:00; Bella · Nowa 4 · Anna · niepotwierdzona; Luna · bez boksu · Marek Nowak (zaproszenie czeka) · „Przypisz boks”.
- Stany: filtr „Bez boksu” (Luna); pusta stajnia („Dodaj pierwszego konia”); „Odeszły” pusty w seedzie.

**PanelDodajHale** (jest, poprawka po decyzji 13.10) · panel · 1440×900 fill · erd pkt 11
- Boksy jak w PanelZalozStajnie: po zakresie („od 1 do 6”) od razu lista boksów, w wierszu numer, poidło automatyczne | ręczne i „Więcej ustawień ›”; „Ustaw dla wszystkich”.

**PanelUstawieniaStajni, PanelUstawieniaBrzozowa, PanelUstawieniaBezAkcji** (są, poprawka po decyzji 13.10) · panel · 1440×900 fill · dec. 19
- Macierz widoczności: w miejscu kolumny „Wsparcie IT” kolumna „Tablet” (konto techniczne tabletów, erd pkt 16): Flagi, Plan karmienia, Szybkie akcje i ich stan, Zdrowie i wizyty zaznaczone, Jazdy odznaczone, Zadania i Historia boksu nieaktywne (tablet ich nie pokazuje; seed dev 3.2); bez wiersza diagnostyki; kolumny Klient, Obsługa, Instruktor i Wyświetlacz bez zmian; tabela domknięta, bez pustej kolumny.

**PanelEdytujHale** · wariant PanelDodajHale · 1440×900 fill · P2 · erd pkt 11; szcz. 3.3 stables, A-11
- Treść: Hala nowa: nazwa, adres ul. Polna 3, kolejność, „Aktywna”, „Usuń halę” nieaktywne z „Hala ma 6 boksów”; „+ Dodaj boks” (wiersz jak w PanelDodajHale: numer, poidło, „Więcej ustawień ›”).
- Stany: przeniesienie boksu do innej hali (zachowuje `id` i historię, A-11); wyłączenie hali (`active = false`); usunięcie pustej hali; 409 przy hali z boksami.

**PanelSlowniki** · panel, zakładka ustawień · 1440×900 fill · P2 · dec. 34 · erd pkt 9; szcz. 3.3 (`stable.created`)
- Treść: zakładki Pasze | Padoki | Ujeżdżalnie; pasze z rodzajem (`feed | supplement | medicine`) i jednostką (`kg | g | miarka | szt`): owies, siano, suplement X, wysłodki, sieczka; Padok A, Padok B; kryta ujeżdżalnia z pojemnością; „+ Dodaj”; pozycja użyta w planach tylko „Wyłącz” (`active`, propozycja).
- Stany: 412; nowa stajnia (słowniki z `stable.created`).

**PanelUstawieniaOgolne** · panel, zakładka ustawień · 1440×900 fill · P2 · dec. 28 · erd `stables`, `stable_settings`, `meal_slots`; szcz. 3.3 stables
- Treść: Damian: nazwa i strefa stajni (bez języków: język ustawia każdy tablet); „Eskalacje”: ostrzeżenie na tablicy 30 min, powiadomienie admina 15 min; „Powiadomienia”: tabela jak w PanelZalozPowiadomienia; „Autor flagi na tablecie”: rola, inicjał albo imię; „Klient edytuje plan karmienia”; „Jazdy” (`rides_enabled`); pory posiłków 06:30, 12:00, 18:00; „Okno instalacji aktualizacji tabletów”.
- Stany: 412 przy równoległej edycji.

**PanelUstawieniaZapis** · wariant PanelUstawieniaStajni · 1440×900 fill · P2 · szcz. 3.3 stables, operations, A-19, §5 pkt 48
- Treść: Damian wyłącza Derkę; dialog „Wyłączyć Derkę? Trwa 1 flaga: Sonata · Derka: zakładać · 16:00–08:00. Zostanie do końca okna, zniknie tylko kafelek.” (propozycja z szcz. §5 pkt 48).
- Stany: częściowy zapis dwóch żądań („Zapisano ustawienia, flag nie. Spróbuj ponownie.”); 412 („Ustawienia zmienił ktoś inny, odśwież”).

### C. Ekrany główne ról

**MapaNawigacjiRol** · plansza dokumentacyjna w stylu panelu · 1440×900 fill · P1 (paczka 0) · erd pkt 14, 16; szcz. A-17, A-21
- Treść (jedyny opis nawigacji ról):
  - „Przed zalogowaniem”: nowe konto Rejestracja → RejestracjaKod; LogowanieNumer (hasło) → Logowanie (kod MFA); „Nie pamiętam hasła” → ResetHasla; „Po zalogowaniu”: zaproszenie dopasowuje się samo (dec. 4); bez członkostwa i ważnego zaproszenia: BrakDostepu; 1 stajnia: start roli; kilka: ostatnio używana, przy pierwszym logowaniu PrzelacznikStajni;
  - Klient: Main; Konie → Main, Flagi → KlientFlagi [flags], Historia → MojBoks albo MojBoksWyborKonia [box_history], Profil; jazdy w „Dziś” karty konia [rides];
  - Obsługa: ListaDnia; Konie → StajennyKonie, Zadania → StajennyZadania [tasks], Profil;
  - Admin w apce: AdminDzis; Boksy → BoksyAdmin, Zadania → AdminZadania, Ludzie → LudzieAdmin, Profil → ProfilAdmin (dec. 17);
  - Admin w panelu: PanelPulpit; Boksy, Konie → PanelKonie, Ludzie → PanelLudzie, Płatności, Ustawienia, konto → PanelMenuKonta;
  - Instruktor: InstruktorJazdy [rides + `rides_enabled`]; Flagi [flags]; Profil;
  - Wyświetlacz (konto techniczne, zwykłe logowanie panelu): WyswietlaczLogowanie (e-mail i hasło) → WyswietlaczKod (kod MFA) → WyswietlaczCentralny (panel po roli od razu pokazuje widok tablicy, domyślnie wszystkie hale) ⇄ „Pełny ekran” WyswietlaczHala albo WyswietlaczHalaGlowna;
  - Tablet (konto techniczne „Tablety Pod Lipami”; konto bez roli Tablet → TabletBrakUprawnien): TabletLogowanie (e-mail i hasło) → TabletLogowanieKod (kod MFA) → od razu TabletPierwszyBoks (zakładki hal, bez wyboru stajni) albo zapamiętany TabletBoks; przytrzymanie „ONLINE · aktualne na …” → TabletUstawienia;
  - legenda: ✓ istnieje, ● P1, ○ P2 i P3; [funkcja] znika, gdy jest odznaczona dla roli; „Admin widzi wszystko”; bez Wsparcia IT (zespół EQUENOR, poza stajnią, dec. 19);
  - dopisek: Admin to rola konta firmy (wszystkie stajnie firmy, dec. 35), a pozostałe role są per stajnia, jedna w stajni (`stable_members`), więc zmiana stajni może zmienić nawigację; przypadku „staff w jednej, client w drugiej” z szcz. 4.2 dane demo nie mają.

**AdminDzis** · apka admina, wariant ListaDnia · 390×1160 · P1 · dec. 17, 22, 23 · erd pkt 3, 12, 13, 16; szcz. A-02, A-14, A-18; dev 3.2
- Dlaczego nie sama ListaDnia: szcz. 3.5.1 daje ją obsłudze i adminowi, ale admin dostaje eskalację (A-02) i ma sprawy do załatwienia. Plik kopiuje układ ListaDnia („Szybkie akcje”, „Flagi dziś”) i dokłada „Pilne”, „Wizyty”, „Do załatwienia” i pasek admina.
- Treść: Damian; „Stajnia Pod Lipami ▾” (2 stajnie firmy, dec. 21), „Damian · Admin”; H1 „Dziś · wt 13.10”; „Pilne”: „Bella · Hala nowa · boks 4 · Nie na padok · dziś, cały dzień · niepotwierdzona od 01:20 · dostałeś SMS i e-mail”, „Potwierdzam”, „Zadzwoń do klienta (Anna)”; „Szybkie akcje” jak ListaDnia (śniadanie Główna 06:40 · Ola bez Kasztana, Nowa 06:50 · Piotr, „Cofnij”; padok 10:00: Główna 4 konie, Nowa 3 bez Belli; „Boks gotowy 7 z 14 · Zaznacz boksy”); „Flagi dziś”: Kasztan (dwie), Bella, Hetman, Sonata; „Wizyty”: wet 08:00 i kowal 15:00 · Kasztan, jazda 16:00 · Iskra; „Zadania”: 1 do wzięcia · 1 w toku (Piotr) · 1 zrobione, „+ Dodaj zadanie”; „Do załatwienia”: Luna bez boksu („Przypisz boks”), Marek Nowak · zaproszenie wygasa czw 15.10, +48 512 *** 908 · zaproszenie wygasło 08.10 („Wyślij ponownie”); pasek Dziś · Boksy · Zadania · Ludzie · Profil.
- Stany: ● **AdminDzisBrzozowa** (Damian po przełączeniu na Brzozową, 390×960: bez „Pilne”, padoku i hal; „Podano śniadanie ✓ 06:35 · Paweł”, pominięta Kometa; „Boks gotowy 3 z 6”; flagi Komety i Lorda „obowiązują od razu”; „Zadania: brak”); bez pilnych flag; przyciski obsługi wyłączone (jak ListaDniaBezAkcji); pusta stajnia (karta „Pierwsze kroki” z linkami do panelu); offline; subskrypcja po terminie (baner „uwaga”).

**AdminZadania** · apka admina · 390×960 · P1 · erd pkt 13; szcz. 3.3 operations, 4.2, A-14
- Treść: Damian; H1 „Zadania”, „+ Dodaj zadanie”; „Do wzięcia”: „Poidło w boksie 5 do wymiany · Hala nowa · boks 5 · dodał Damian wczoraj 18:20”, „Odwołaj”; „W toku”: „Wymienić żarówkę w korytarzu · Hala główna · Piotr od 07:00”; „Zrobione dziś”: „Przywieźć słomę z magazynu · Ola 06:30”; pasek admina; bez dopisków (dec. 38).
- Stany: ● **AdminZadaniaNowe** (arkusz: tytuł „Sprawdzić zasuwę w boksie 3” (propozycja), notatka, „Dotyczy”: Cała stajnia | Hala | Boks | Koń, wybrany „Hala główna · boks 3”, „Dodaj zadanie”, „Anuluj”); odwołanie z potwierdzeniem („Odwołać zadanie?”); brak zadań.

**InstruktorJazdy** · apka instruktora · 390×844 · P1 · dec. 20 · erd pkt 9, 14; szcz. 3.2, 3.3 schedule, A-21, §5 pkt 50
- Treść: konto `instructor` „Marta”, w obu stajniach: „Stajnia Pod Lipami ▾”, „Zalogowana: Marta · Instruktor”; H1 „Jazdy · wt 13.10”; „Dziś”: „16:00 · Iskra · Hala główna · boks 1 · kryta ujeżdżalnia · jeździec: Karolina W. (propozycja) · bez flag”; „Jutro i dalej: brak jazd”; „Flagi koni dziś” tylko do odczytu (propozycja): Kasztan, Bella, Hetman, Sonata; bez kontaktów do klientów; pasek Jazdy | Flagi | Profil.
- Stany: koń z flagą o skutku `no_riding` (ostrzeżenie „uwaga” przy jeździe); pusty dzień; `rides_enabled = false` albo odznaczone `rides` (start na Flagach).

### D. Flagi

**SzybkaFlagaGodziny** · arkusz nad SzybkaFlaga · 390×844 · P1 · erd pkt 12; szcz. 3.3 operations, A-01, A-12, A-18
- Treść: Anna o 03:16, Kasztan, kafel „Nie na padok” z podpowiedzią „dziś 10:00–16:00” (padok B); arkusz „Kiedy”: Dziś | Jutro | data; „Od” 14:30, „Do” 16:00 (A-01); bez wariantu „do odwołania” i bez dopisku o nim; „Zapisz godziny”.
- Stany: koniec przed początkiem (422, „Koniec musi być po początku”); okno przez północ (Derka 16:00–08:00, „do śr 14.10”); Brzozowa 06:00–09:00 (A-18); „Inna flaga” w SzybkaFlaga: wymagane pole „Nazwa flagi” (`custom_text`), godziny bez podpowiedzi (propozycja: od teraz do 23:59).

**SzybkaFlagaObsluga** · wariant SzybkaFlaga · 390×844 · P1 · dec. 32 · erd pkt 12, Słowniki; analiza §1.2; szcz. 3.6 etap 3, A-07, A-20
- Treść: Ola, „← Konie”; select „Dla konia: Iskra · Hala główna · boks 1”; 7 kafelków; „Klient prosił: telefon | SMS | osobiście” (`on_behalf_phone | on_behalf_sms | on_behalf_in_person`; flaga bez prośby klienta dopiero po dec. 32); „Klient: Karolina W.”; „Kiedy” z podpowiedzią; bez dopisku o adnotacji dla klienta (dec. 38).
- Stany: Luna („Luna · bez boksu”, A-07); 07:25 po wyłączeniu potwierdzeń („obowiązuje od razu”, A-20); wejście admina z PanelBoksy.

**SzybkaFlagaBrzozowa** · wariant SzybkaFlaga · 390×844 · P1 · erd pkt 12, 16; dev 3.2; A-18
- Treść: Anna, 05:50; „Kometa · boks 1” bez hali; 6 kafelków, wybrany „Bez śniadania”; Od „dziś 06:00”, Do „dziś 09:00” (zmienione z podpowiedzi 06:00–10:00); notatka „dentysta o 8:30”; status „obowiązuje od razu”; „Wyślij flagę”.

**StatusFlagiOdwolaj** · wariant StatusFlagi, arkusz · 390×844 · P1 · erd pkt 12; szcz. 3.3 operations, 3.6 etap 4, A-03
- Treść: 07:16; „Odwołać flagę „Bez śniadania” · Kasztan?”; skutki: „Śniadanie Hali głównej podano już o 06:40 bez Kasztana.”; „Odwołaj”, „Zostaw”.
- Stany: odwołanie przed podaniem posiłku („Wstrzymane śniadanie wraca do planu”, A-03); po odwołaniu „Odwołana 07:16” w historii; „Zmień” otwiera SzybkaFlaga z danymi flagi (nowa flaga z `replaces_flag_id`).

**KlientFlagi** · apka klienta · 390×960 · P2 · erd pkt 12
- StatusFlagi ma już „Inne flagi” (Bella, druga flaga Kasztana); dochodzi lista jako cel zakładki Flagi, chipy koni, historia zakończonych i odwołanych oraz „Nowa flaga”.
- Treść: Anna; H1 „Flagi”; chipy Wszystkie · Kasztan · Bella; „Teraz”: Bella · Nie na padok · dziś, cały dzień · niepotwierdzona („Admin stajni dostał powiadomienie”), Kasztan · Bez śniadania · 06:00–10:00 · potwierdzona 06:02; „Później dziś”: Kasztan · Nie na padok · od 14:30 · potwierdzona 06:02; „Zakończone i odwołane · 7 dni”: brak; pasek klienta.
- Stany: brak flag; bez widoczności `flags` zakładki nie ma.

**SzybkaFlagaNieWyslano** · wariant SzybkaFlaga · 390×844 · P2 · dec. 25 · szcz. 3.3 operations, 4.1, A-01
- Treść: Anna o 03:14, Kasztan, „Bez śniadania”, dziś 06:00–10:00, „Wet o 8:00, koń na czczo”; w stopce pole „uwaga” „Nie wysłano. Flaga nie obowiązuje.”; „Wyślij ponownie”, „Zadzwoń do stajni”; wpisane dane zostają.
- Stany: „Wysyłanie…”; „Zapisano na serwerze 03:14”; `422 target_passed` („Ten czas już minął, zmień godziny”); `409 option_disabled` („Stajnia wyłączyła tę flagę”).

### E. Tablet

„Rejestracja” tabletu to provisioning (`tools/provision-tablet`), logowanie kontem technicznym tabletów (konto zakłada się raz w PanelRejestracja; hasło i kod MFA na skrzynkę konta) i lokalny wybór boksu; konto ma jedną stajnię, więc tablet nie wybiera stajni (dec. 12, 15).

**TabletLogowanie** · tablet e-ink · 702×936 · P1 · dec. 12 · erd pkt 2; szcz. 2.4, 4.2, T-07, T-23, §5 pkt 5, 31; dev §5 pkt 5
- Treść: „EQUENOR”, pod nim hasło „Equestrian Management, Refined” (≥ 16 px, waga 500); H1 42 px „ZALOGUJ TABLET”; przełącznik „TELEFON | E-MAIL” (wybrany E-MAIL: czarne pole, biały pogrubiony tekst); „ADRES E-MAIL” b•••@stajnielipowe.pl (konto techniczne „Tablety Pod Lipami”; 64 px, ramka 2 px #000), „HASŁO” (zamaskowane), klawiatura QWERTY z „WYCZYŚĆ” (przy TELEFON: „NUMER TELEFONU” +48 i klawiatura 3×4); „ZALOGUJ” (czarne pole, biały pogrubiony tekst), „NIE PAMIĘTAM HASŁA” (reset kodem jako stan na StanyTablet, propozycja); stopka „ONLINE · 07:15”, PL | UA; bez dopisków, kłódki, „Zmień boks” i flag.
- Stany: ● **TabletLogowanieKod** (krok MFA po haśle: „WPISZ KOD Z E-MAILA”, „Wysłaliśmy kod na b•••@stajnielipowe.pl”, 6 pól, klawiatura 3×4, „ZALOGUJ”, „WYŚLIJ KOD PONOWNIE ZA 0:42” z ramką przerywaną, „ZMIEŃ E-MAIL”; zły kod: pole `t-warn`, ramka 4 px, „ZŁY KOD”); ● **TabletWylogowany** (H1 „TABLET WYLOGOWANY”, wiersz „BOKS: Hala główna · boks 7”, przyczyna jako komunikat stanu: „WYLOGOWANO”, „WYLOGOWANO ZE WSZYSTKICH URZĄDZEŃ” albo „SESJA WYGASŁA”; „ZALOGUJ”; bez starych flag); ● **TabletBrakUprawnien** („TO KONTO NIE OBSŁUGUJE TABLETU” i „ZALOGUJ INNYM KONTEM” dla konta bez roli Tablet: osób i Wyświetlacza; stan „TO KONTO NIE MA JUŻ DOSTĘPU DO TEJ STAJNI” najpóźniej 5 min po zablokowaniu konta tabletów (odświeżenie tokenu), po odblokowaniu TabletWylogowany „WYLOGOWANO ZE WSZYSTKICH URZĄDZEŃ”, erd pkt 14); brak sieci (stopka `t-warn` „BRAK POŁĄCZENIA”).

**TabletPierwszyBoks** · wariant TabletZmianaBoksu · 702×936 · P1 · dec. 12, 15 · erd pkt 2, 11; szcz. 4.2, T-07, A-17, A-18, §5 pkt 32; dev §5 pkt 16
- Treść: konto „Tablety Pod Lipami”, od razu po zalogowaniu; „WYBIERZ BOKS”; zakładki HALA GŁÓWNA 1–8 (wybrana) i HALA NOWA 1–6, bez przełącznika stajni (konto ma jedną stajnię, dec. 12); kafle 1 Iskra, 2 Dukat, 3 WOLNY (ramka przerywana), 4 Sonata, 5 Wicher, 6 Fala, 7 Kasztan, 8 Hetman; bez „Anuluj” i powrotu po 30 s; stopka ONLINE, PL | UA.
- Stany: zakładka Hala nowa (1 Grom, 2 Mgła, 3 Rumba, 4 Bella, 5 Bursztyn, 6 WOLNY); Stajnia Brzozowa (konto „Tablety Brzozowa”, 2.2); ● **TabletBoksNiedostepny** (odzyskanie: zapamiętany boks w wyłączonej hali albo w innej stajni; linia `t-warn` „HALA GŁÓWNA · BOKS 7 NIEDOSTĘPNY”; lista od razu, bez powrotu po 30 s; propozycja z szcz. §5 pkt 32).

**TabletBoksWoda** · wariant TabletBoks · 702×936 · P1 · erd pkt 2, 3, 16; szcz. 4.1, A-16
- Treść: „BOKS 5 · BURSZTYN”, „Hala nowa · wt 13.10 · 07:15”, kłódka, „Zmień boks”; bez flag: neutralna ramka „DZIŚ BEZ FLAG” (propozycja); KARMIENIE: plan Bursztyna (dec. 29); ramka 2 px „POIDŁO RĘCZNE · woda 06:55”; SZYBKIE AKCJE 2×2: BOKS GOTOWY (dziś 07:14), ŚNIADANIE (podane 06:50), PADOK (A 10:00–14:00), WODA (06:55); OSTATNIE AKCJE „ostatnie · boks i koń”: 07:14 Boks gotowy; 06:55 Woda; 06:50 Podano śniadanie · Piotr (seed ma tylko te 3); bez zadania „Poidło w boksie 5 do wymiany”; stopka ONLINE, PL | UA.
- Stany: po WODA („woda 07:16”, „COFNIJ”); poidło przełączone na automatyczne (bez pola i WODA); przyciski obsługi wyłączone (SZYBKIE AKCJE tylko z WODA).

**TabletBoksWolny** · wariant TabletBoks · 702×936 · P1 · erd pkt 1, 3; szcz. 3.2, A-04, A-05
- Treść: „BOKS 6 · WOLNY”, „Hala nowa · wt 13.10 · 07:15”; bez banera flag i karmienia; SZYBKIE AKCJE: BOKS GOTOWY (ostatnio 09.10 14:40), ŚNIADANIE (podane 06:50 · cała hala), PADOK (Hala nowa 10:00); OSTATNIE AKCJE „ostatnie · boks”: 06:50 Podano śniadanie · Piotr, 09.10 14:40 Boks gotowy · Piotr; kłódka, „Zmień boks”.
- Stany: po BOKS GOTOWY (wpis „07:16 Boks gotowy” bez autora, A-05); po przypisaniu Luny („BOKS 6 · LUNA”, A-04).
- Stany TabletBoks (fragmenty): drugi PADOK tego dnia na innym tablecie hali (`already_done`, „Padok już wyprowadzony 10:00”, A-13); akcja wyłączona w międzyczasie (`409 option_disabled`, „Stajnia wyłączyła tę akcję”, A-19, propozycja); nowa zakładka hali w „Zmień boks” po „Dodaj halę” (A-08, A-11); boks przeniesiony do innej hali z nową halą w nagłówku (A-11).

**TabletUstawienia** · tablet, ukryte ustawienia · 702×936 · P1 · dec. 12, 13, 14, 15, 28 · erd pkt 2; dev 3.5; szcz. 2.12, K-01, T-23, A-17, A-18, §5 pkt 30, 31, 40
- Treść: tablet Hala główna · boks 7; „USTAWIENIA TABLETU”, „ZAMKNIJ” (64 px); wiersze 80 px z czarną linią: KONTO „Tablety Pod Lipami · konto techniczne” → „WYLOGUJ”; BOKS „Hala główna · boks 7 · Kasztan” → „ZMIEŃ BOKS” (bez osobnego wiersza STAJNIA, konto ma jedną stajnię); JĘZYK TABLICY „Polski” → „ZMIEŃ” (przełącznik PL | UA w stopce tablicy zostaje); SIEĆ „Stajnia-PodLipami” → „ZMIEŃ SIEĆ”; DIAGNOSTYKA „Stan tabletu” → „OTWÓRZ”; EKRAN: „Profil kolorów: Kaleido 3” i „PLANSZA TESTOWA” (propozycja); stopka: wersja [WERSJA]; bez dopisków. Wejście: przytrzymanie 5 s samego tekstu „ONLINE · aktualne na …” w stopce tablicy (nie przycisków PL i UA), bez etykiety; opis w notatce kanwy.
- Stany: dialog „WYLOGOWAĆ TABLET?” z „WYLOGUJ” i „ANULUJ”; bez zalogowanego konta (tylko SIEĆ i DIAGNOSTYKA); zablokowany ekran (wejście nie działa).

**TabletDiagnostyka** · tablet, ukryte ustawienia · 702×936 · P1 · erd pkt 2; szcz. 2.12, T-10, T-11, T-13, T-16, N-01, N-04, §5 pkt 11
- Treść: „DIAGNOSTYKA”, „← USTAWIENIA”; tabela 22 px z `tabular-nums` (liczby: propozycja): URZĄDZENIE: Boox Note Air6 C, firmware [WERSJA], `ro.board.platform`, APK [WERSJA] (versionCode), Device Owner TAK, Lock Task TAK; BOKS: Hala nowa · boks 5, id [UUID…], Stajnia Pod Lipami; SIEĆ: SSID, BSSID, pasmo, RSSI −61 dBm, SNR, test portu 443 OK, ostatnie odpytanie 07:15:02; CZAS: różnica z serwerem +1 s, jakość czasu „zsynchronizowany” (`synced`); PRACA: niewysłane 0, bateria 78 % (limit 80 %), temperatura, restarty dziś 0, tryb EPD; „TEST POŁĄCZENIA”, „WYŚLIJ DIAGNOSTYKĘ” (propozycja).
- Stany: offline (ostatnie odpytanie 07:05, kolejka 1, wiersz sieci w `t-warn`); start bez sieci (jakość czasu „nieznany”, `unknown`); tablet LCD bez EPD.

**TabletOffline** · wariant TabletBoks · 702×936 · P1 · dec. 16 · szcz. T-14, T-16, §5 pkt 19, 20; dev §5 pkt 10
- Treść: Kasztan, boks 7, dane z 07:05; stopka na pełną szerokość `t-warn`, czarny pogrubiony tekst, ramka 4 px: „BRAK POŁĄCZENIA · DANE Z 07:05 · NIEWYSŁANE: 1”; w OSTATNICH AKCJACH „07:12 Boks gotowy · czeka na wysłanie”; zegar idzie; przyciski aktywne, zapisy w kolejce.
- Stany: po progu „DANE NIEAKTUALNE” na pełną szerokość (próg do ustalenia); start bez sieci („czas niepotwierdzony”); powrót sieci (ONLINE bez dotykania); przy dec. 16 b przyciski z przerywaną ramką.

**TabletAktualizacja** · tablet · 702×936 · P1 · szcz. 3.6 etap 4, T-24, T-25, T-26
- Treść: okno serwisowe, pusta kolejka: pełny ekran „INSTALUJĘ AKTUALIZACJĘ · [WERSJA]”, „NIE ODŁĄCZAJ ZASILANIA” (propozycja); bez flag; zegar.
- Stany: pasek `t-warn` „WYMAGANA AKTUALIZACJA” na tablicy (`client_upgrade_required`); po instalacji ten sam boks i sesja, także przy otwartym pop-upie (T-26); przerwana aktualizacja kończy się na działającej wersji (T-25).

**TabletPopupZablokowany** · wariant TabletPopup · 702×936 · P1 · erd pkt 2; szcz. 3.6 etap 4, T-28, T-30, A-15
- Treść: pop-up Kasztana na zablokowanym ekranie; POTWIERDZAM z przerywaną ramką i „Przytrzymaj kłódkę 3 s, aby odblokować, potem POTWIERDZAM” (wyjątek z 2.3: bez tego ekran jest niezrozumiały); licznik „1 z 2”, krytyczny pierwszy.
- Stany: nowy pop-up w trakcie „Zmień boks” (T-28).

**TabletZawieszona** · tablet · 702×936 · P2 · erd pkt 10; szcz. 3.6 etap 8, §5 pkt 20
- Treść: pełny ekran bez flag i karmienia: „SYSTEM NIEAKTYWNY”; bez instrukcji i próśb do admina (dec. 38).

**TabletWifi** · wariant TabletUstawienia · 702×936 · P2 · dec. 14 · szcz. 4.5, T-15, N-04, N-06, §5 pkt 30; dev §5 pkt 15
- Treść: „ZMIEŃ SIEĆ”, „ANULUJ”; Stajnia-PodLipami 5 GHz (POŁĄCZONO), Stajnia-PodLipami 2,4 GHz, inna sieć (nazwy: propozycja); wybrana sieć: hasło z klawiaturą QWERTY i „pokaż hasło”, WPA2 albo WPA3, „POŁĄCZ”; bez dopisków (wymóg sieci bez strony logowania i z portem 443 tylko w notatce kanwy).
- Stany: łączenie; złe hasło (ramka 4 px `t-warn`); połączono („odpytanie 07:16 OK”); sieć bez internetu; brak uprawnień (dec. 14 b).

### F. Wyświetlacz (TV)

Telewizor otwiera zwykłą stronę logowania panelu; strona nie wie, że to telewizor, a po zalogowaniu kontem technicznym z rolą Wyświetlacz panel pokazuje widok tablicy (dec. 10). Pierwszy start prowadzi od razu do WyswietlaczCentralny z wszystkimi halami; osobnego ekranu wyboru widoku nie ma (szcz. 3.5.4, W-18, erd pkt 4).

**PanelLudzieWyswietlacze** · wariant PanelLudzie z filtrem „Konta techniczne” · 1440×900 fill · P1 · dec. 10, 11, 12 · erd pkt 4, 14; szcz. 2.4, 3.3 auth, 4.2, §5 pkt 3–4
- Treść: Damian, „Ludzie · Stajnia Pod Lipami” z wybranym filtrem „Konta techniczne · 2” (chipy roli: Wszyscy, Admin, Obsługa, Klient, Instruktor, Konta techniczne; bez osobnej zakładki i sekcji); wiersze „Tablety Pod Lipami · konto techniczne · Tablet · b•••@stajnielipowe.pl · aktywne” i „Telewizor korytarz · konto techniczne · Wyświetlacz · t•••@stajnielipowe.pl · aktywne”, akcje „Zablokuj” i „Usuń ze stajni”, a przy koncie tabletów także „Wyloguj wszystkie tablety” (erd pkt 2; bez listy tabletów i sesji); „Zaproś osobę” → PanelZaprosOsobe; bez karty „Jak podłączyć telewizor” i innych instrukcji (dec. 11).
- Stany: konto zablokowane („Zablokowane od 07:20 · Odblokuj”) z dialogiem „Zablokować konto Telewizor korytarz?”; zaproszenie czeka (zakładka Zaproszenia, e-mail); Brzozowa: tylko „Tablety Brzozowa”. Formularza „Dodaj wyświetlacz” nie ma (dec. 11).

**WyswietlaczLogowanie** · TV, kiosk, zwykła strona logowania [PANEL] · 1600×900 fill · P1 · dec. 7, 10 · erd pkt 4, 6; szcz. 1.3, 4.2, W-18, W-25, W-29, §5 pkt 3, 4, 15
- Treść: ta sama strona co PanelLogowanie, w 1600×900: wybrany E-mail, konto t•••@stajnielipowe.pl, hasło (zamaskowane), fokus 3 px (klawiatura, pilot CEC); bez słowa „telewizor”, bez danych stajni i flag.
- Stany: ● **WyswietlaczKod** (ta sama strona co PanelLogowanieKod, kod wysłany na t•••@stajnielipowe.pl; po zalogowaniu panel pokazuje WyswietlaczCentralny); ● **WyswietlaczWylogowany** (ta sama strona logowania z paskiem „uwaga” „Wylogowano o 06:40”, bez danych stajni i słowa „wyświetlacz”; sesja wygasła albo podbity `token_version` (np. po „Odblokuj”), szcz. 4.2 Sesje); brak sieci.

**WyswietlaczStart** · TV · 1600×900 fill · P1 · szcz. W-01, W-17
- Treść: zimny start bez sieci i bez zapisanego stanu: znak, zegar z RTC, „Łączenie z serwerem…”, bez danych; po minucie „Brak połączenia” (propozycja).

**WyswietlaczZablokowany** · TV · 1600×900 fill · P1 · erd pkt 4, 10; szcz. 3.3 board, 4.2, §5 pkt 20
- Treść: znak, „Stajnia Pod Lipami”, zegar; kłódka, „WYŚWIETLACZ ZABLOKOWANY”, bez objaśnień i instrukcji odblokowania; bez flag i kafli; neutralne tło, status ikoną i słowem. Pojawia się najpóźniej 5 min po „Zablokuj” (odświeżenie tokenu); po „Odblokuj” WyswietlaczWylogowany i logowanie hasłem i kodem (erd pkt 14).
- Stany: stajnia zawieszona („System nieaktywny w tej stajni”).

**WyswietlaczOffline** · wariant WyswietlaczCentralny · 1600×900 fill · P1 · szcz. W-20, W-21, W-22, §5 pkt 20
- Treść: wszystkie hale z danymi z 07:05; pod nagłówkiem pasek „uwaga” „Brak połączenia od 07:05 · dane z 07:04:52”; zegar liczony lokalnie; pasek pilnych z Bellą zostaje; kafle bez wyszarzenia.
- Stany: 500, 503 i przekroczony czas (ten sam pasek); przeładowanie po dłuższej awarii; pełny ekran hali z tym paskiem.
- Stany WyswietlaczCentralny (fragmenty, P2): koń bez boksu (sekcja „Bez boksu: Luna” tylko w widoku wszystkich hal, szcz. §5 pkt 16, propozycja); zapamiętana hala wyłączona albo usunięta: widok wszystkich hal bez komunikatu (szcz. 3.5.4, §5 pkt 32).

**WyswietlaczHalaGlowna** · wariant WyswietlaczHala · 1600×900 fill · P2 · erd pkt 4; szcz. W-24, W-29, A-08
- Treść: H1 „Hala główna”; kafle 1–8: Kasztan (BEZ ŚNIADANIA 06:00–10:00, krytyczna, potwierdzona 06:02, później Nie na padok od 14:30), Sonata (Derka: zakładać · od 16:00), Hetman (Leki rano 06:00–09:00), 3 wolny z przerywaną ramką; nagłówek „Śniadanie podane 06:40 · padok 10:00”; pasek pilnych tylko tej hali; Hala nowa tylko liczbami; przełącznik hal z `aria-current` na Hali głównej.

**WyswietlaczDuzoBoksow** · wariant WyswietlaczCentralny · 1600×900 fill · P2 · erd pkt 4; szcz. W-24
- Treść: fixture z wieloma boksami (propozycja: 3 hale po 20); kafle skrócone (numer z halą, koń, flaga); „strona 1 z 2 · zmiana co 20 s”; pasek pilnych zawsze na górze.

### G. Codzienna praca

**ListaDniaGotoweBoksy** · apka obsługi, arkusz nad ListaDnia · 390×960 · P1 · erd pkt 3, 16; szcz. 3.3 operations, 4.1, A-13
- Treść: tło ListaDnia z „Zalogowany: Piotr” (A-13); arkusz „Boks gotowy · zaznacz boksy”, „Dziś 7 z 14”; zakładki Hala główna (wybrana) | Hala nowa; boks gotowy dziś (ikona OK i godzina): 1 Iskra 07:02, 2 Dukat 06:50, 5 Wicher 07:05 · Piotr, 7 Kasztan 07:10; do zrobienia (ramka przerywana): 3 wolny, 4 Sonata, 6 Fala, 8 Hetman; zaznaczone 4, 6, 8 (✓ w akcencie); „Zapisz: Boks gotowy · 3 boksy”, „Anuluj”; cofnięcie przez godzinę (propozycja) bez dopisku.
- Stany: Hala nowa (2 Mgła 06:58, 3 Rumba 07:12, 5 Bursztyn 07:14; do zrobienia 1, 4, 6); po zapisie ListaDnia „10 z 14” z „Cofnij”; offline („Zapis czeka na sieć”); ponowne „Boks gotowy” boks gotowygo boksu (nowy wpis); drugie „Wyprowadzono na padok” tego dnia (`already_done`, „Padok już wyprowadzony 10:00”, A-13); „Boks gotowy” wyłączone (arkusza nie ma).

**BoksSzczegolyWoda** · wariant BoksSzczegoly · 390×960 · P1 · dec. 26 · erd pkt 3, 16; szcz. 3.3 operations, 4.1, 4.2, A-16
- Treść: Damian, „← Boksy”; H1 „Hala nowa · boks 5”, „Nowa 5”, ul. Polna 3, Konstancin-Jeziorna; Bursztyn („Karta konia”), klient: nie dodano; „Poidło ręczne · woda 06:55 (tablet)” z „Woda”; „Ostatnio przy boksie”: Boks gotowy 07:14 (tablet), Woda 06:55 (tablet), Podano śniadanie 06:50 · Piotr (cała hala); „Zadania”: „Poidło w boksie 5 do wymiany · do wzięcia”; „Ustawienia boksu” (admin): „Automatyczne poidło: nie”, bez dopisku o skutkach (dec. 38); stopka „Boks gotowy”, „Przenieś konia”.
- Stany: widok Piotra (bez „Ustawień boksu”); po „Woda” („woda 07:16 · Piotr”, „Cofnij”); poidło „tak” (bez znacznika i akcji); przyciski obsługi wyłączone („Woda” zostaje); zajęty boks z poidłem automatycznym (Hala główna · boks 7).

**EdycjaPlanuKonia** · apka obsługi i admina · 390×1160 · P1 · dec. 27, 28, 34 · erd pkt 3, 16, Otwarte kwestie 1; szcz. 3.2, 3.3 operations, 3.6 etap 6; dev §5 pkt 23
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
- Treść: chipy „Kasztan · Główna 7” | „Bella · Nowa 4” (wybrany); „Boks 4 · Hala nowa”; „Ostatnio”: Podano śniadanie dziś 06:50 · Piotr, Boks gotowy wczoraj 17:30 · Ola; „Historia”: dziś Podano śniadanie 06:50 · Piotr, flaga „Nie na padok” ustawiona 01:20 · Anna · niepotwierdzona; wczoraj Boks gotowy 17:30 · Ola.
- Stany: jeden koń (bez chipów); koń bez boksu (tylko flagi).

**ListaDniaOffline** · wariant ListaDnia · 390×960 · P2 · szcz. A-13, A-14
- Treść: nagłówek „offline · dane z 07:05 · 2 zapisy czekają”; „Biorę” nieaktywne z „tylko online”.
- Stany: 409 „Zadanie wziął już Piotr” (A-14).

### I. Strona www

Publiczna strona przed logowaniem według zasady „Strona www” z 2.3 (dec. 37). Panelowa konwencja (Figtree, paleta, 1440 rosnące w dół), bez menu panelu i danych stajni. Treść stron to propozycja.

**StronaGlowna** · www · 1440×900 fill, rośnie w dół · P1 · dec. 37 · dev 2
- Treść: (1) hero z nagłówkiem: znak „EQUENOR” z hasłem „Equestrian Management, Refined” pod spodem, jedno zdanie o produkcie, „Załóż konto firmy” (→ PanelRejestracja) i „Zaloguj się” (→ PanelLogowanie), jeden duży obraz produktu; (2) cztery ekrany: apka, tablet przy boksie, telewizor, panel, każdy obraz, nazwa i jedno krótkie zdanie; (3) jeden przykład flagi z godzinami (prosty, wizualny); (4) stopka z kontaktem: znak z hasłem pod spodem, [E-MAIL], [WWW]/app, Regulamin, Polityka prywatności. W menu bez pozycji „Blog”; bez plakietek zalet w hero, wstępów do sekcji, ogólników i treści instruktażowych.

**StronaGlownaTelefon** · www w telefonie · 390×844 i dłuższe · P1
- Treść: te same 4 bloki w jednej kolumnie, te same linki.

### H. P3 (po PoC albo po decyzji)

- **Powiadomienia** (apka i panel, 390×844): SMS i e-maile wysłane do admina (eskalacja Belli, wygasające zaproszenie), tylko przy dec. 22 b; erd `notifications`.
- **DodajJazde** (apka instruktora i admina, 390×844): koń, ujeżdżalnia, od–do, jeździec; 409 przy kolizji konia, areny albo pojemności; ostrzeżenie przy `no_riding`; po dec. 20; erd `rides`, `arenas`.
- **ZdrowieWpis** (apka, 390×960): wizyta (wet, kowal, dentysta), data, następny termin, opis, „tylko dla mnie” (`owner_private`), załącznik; erd `health_events`, `health_attachments`.
- **HistoriaBoksu** (apka, 390×960): grupy dni, flagi i zdarzenia z przycisków, filtr dni; erd pkt 3.
- **PanelBoksSzczegoly**, **PanelSzczegolFlagi** (flaga z autorem, eskalacją i akcjami, `flag_escalations`), **PanelSzablonyFlag** (okna godzin, waga, skutek, kolejność, własne flagi z etykietami PL, UA, EN; szcz. §5 pkt 27, 48), **PanelPlatnosciZmiana** (dane do faktury, plan, metoda płatności; bez rozbudowy na PoC, dev §5 pkt 25), **PanelHistoriaZmian** (audyt; kto go czyta, szcz. §5 pkt 21): panel, 1440×900 fill.
- **KartaKoniaBella** (wariant KartaKonia, 390×1000); **TabletEkranZablokowanyBrzozowa** (Kometa, boks 1, bez hali); **ListaDniaPusta** (Ola w stajni bez koni w dniu założenia: „Boks gotowy 0 z 6”, „Flagi dziś: brak”, bez dopisków).
- **WyswietlaczPlanszeTestowe** (TV, 1600×900 fill): ramka 1 px przy krawędziach (W-09) i szara plansza retencji (W-10), bez danych.
- **PanelDiagnostyka** (diagnostyka dla zespołu EQUENOR w panelu `[OPS]`, dla `plt = admin` i `plt = support` (mikroserwisy.md 4.6), poza panelem stajni, 1440×900 fill; dec. 13, 19 · erd pkt 2, 14; szcz. 2.12, 4.2, §5 pkt 8, 11, 30): w panelu `[OPS]` (propozycja); wybór stajni; „Hale i boksy”: same numery; „Aktualizacje tabletów”: [WERSJA], rollout, okno [OD–DO] (`app_releases`, `maintenance_from`/`to`); „Konta techniczne”: „Tablety Pod Lipami”, „Telewizor korytarz” · aktywne, bez akcji; „Logi i błędy” [LINK]; bez listy tabletów (erd pkt 2), danych koni i klientów i instrukcji. Żadna plansza stajni do niej nie linkuje.

### 3.H Linki

Jedyny spis linków. **L1** wykonujemy po paczkach P1, **L2** po P2, **L3** po P3. „(tymczasowo X)” to cel do czasu narysowania docelowego, „bez linku” to element bez `href`. Podmiany w istniejących plikach robimy za zgodą (dec. 30).

**Nowe plansze.** Domyślnie: „← Wróć”, „Anuluj”, X i zapis wracają do ekranu wejścia; pasek i menu według MapaNawigacjiRol; „Wyloguj” → LogowanieNumer (apka) albo PanelLogowanie (panel); tablice tabletu mają linki jak TabletBoks (kłódka, „Zmień boks”, stopka → TabletUstawienia). Plansze usunięte 13.10 (dec. 15, 19, 37) nie są celem żadnego linku, także tymczasowo; PanelDiagnostyka (P3, poza stajnią) też nie. Poza tym:
- **A:** LogowanieNumer „Zaloguj się” → Logowanie (kod MFA), „Nie pamiętam hasła” → ResetHasla, „Załóż konto” → Rejestracja, „Załóż konto firmy” → PanelRejestracja; Rejestracja → RejestracjaKod → LogowanieNumer; ResetHasla → LogowanieNumer; BrakDostepu „Zaloguj się innym kontem” → LogowanieNumer; WiadomosciSms link → ZaproszenieStrona → „Panel web” → PanelLogowanie; Logowanie (kod) → start roli według MapaNawigacjiRol (Marek: MainLuna, Bartek: ListaDnia); ZaproszenieNoweStajnia: toast bez linku, „▾” → PrzelacznikStajni; MainLuna kafelki → SzybkaFlaga, „Karta” → KartaKonia (tymczasowo), Flagi → StatusFlagi (tymczasowo); Profil stajnia → PrzelacznikStajni, „Zmień numer” bez linku; ProfilAdmin → PanelPulpit, PanelUstawieniaStajni, PanelPlatnosci, „Konie” → PanelBoksy (tymczasowo); PrzelacznikStajni → Main, MainBrzozowa (Ola: ListaDnia, ListaDniaBrzozowa).
- **B:** PanelLogowanie „Załóż konto” → PanelRejestracja → PanelRejestracjaKod → PanelLogowanie, „Nie pamiętam hasła” → PanelResetHasla → PanelLogowanie; PanelLogowanie „Zaloguj się” → PanelLogowanieKod → PanelPulpit (Admin), PanelWitaj (bez konta firmy i członkostwa albo inna rola, dec. 18) albo WyswietlaczCentralny (konto techniczne Wyświetlacz, od razu po zalogowaniu); PanelWitaj „Załóż konto firmy” → PanelRejestracjaFirmy → PanelZalozStajnie → PanelZalozPowiadomienia („← Wstecz” → PanelZalozStajnie) → PanelPulpitStart; PanelPulpitStart „Dodaj konia” → PanelDodajKonia, „Zaproś osobę” → PanelZaprosOsobe, „Sprawdź” → PanelUstawieniaBrzozowa (stan docelowy po zmianach Damiana, nie z dnia założenia), „Konto techniczne: Tablet przy boksie” i „Konto techniczne: Wyświetlacz” → PanelZaprosOsobe, „Pomiń” bez linku; PanelDodajKonia i PanelPrzeniesKonia → PanelBoksy; PanelLudzie i PanelLudzieWyswietlacze „Zaproś osobę” → PanelZaprosOsobe, filtr roli wszyscy ⇄ „Konta techniczne” → PanelLudzie ⇄ PanelLudzieWyswietlacze; PanelPulpit Konie → PanelBoksy (tymczasowo), „Zobacz flagę” → PanelBoksy (tymczasowo, alert Belli), konto bez linku.
- **C:** MapaNawigacjiRol: nazwy ✓ i ● to linki do plików, nazwy ○ bez linku do L2 i L3; AdminDzis „+ Dodaj zadanie” → AdminZadaniaNowe, Ludzie → Zaproszenie (tymczasowo), „Zaznacz boksy” → ListaDniaGotoweBoksy, Bella i „Przypisz boks” → BoksyAdmin (tymczasowo; szczegółu flagi dla admina w apce nie ma); InstruktorJazdy Flagi → ta sama makieta.
- **D:** SzybkaFlagaGodziny „Zapisz godziny” → SzybkaFlaga; SzybkaFlagaObsluga wysłanie → StatusFlagi (tymczasowo); SzybkaFlagaBrzozowa → MainBrzozowa; StatusFlagiOdwolaj → StatusFlagi; KlientFlagi wiersz → StatusFlagi, „Nowa flaga” → SzybkaFlaga.
- **E:** TabletLogowanie „ZALOGUJ” → TabletLogowanieKod; TabletLogowanieKod „ZALOGUJ” → TabletPierwszyBoks (pierwsze logowanie) albo TabletBoks (zapamiętany boks), „ZMIEŃ E-MAIL” → TabletLogowanie; TabletWylogowany „ZALOGUJ” i TabletBrakUprawnien „ZALOGUJ INNYM KONTEM” → TabletLogowanie; TabletPierwszyBoks i TabletBoksNiedostepny: Hala nowa · 5 → TabletBoksWoda, Hala nowa · 6 → TabletBoksWolny, pozostałe → TabletBoks (tymczasowo; tablice są tylko dla Hala główna · 7 i Hala nowa · 5 i 6); TabletUstawienia „WYLOGUJ” → TabletWylogowany, „ZMIEŃ BOKS” → TabletZmianaBoksu, „ZMIEŃ SIEĆ” bez linku, „OTWÓRZ” → TabletDiagnostyka, „ZAMKNIJ” → TabletBoks.
- **F:** WyswietlaczLogowanie i WyswietlaczWylogowany → WyswietlaczKod → WyswietlaczCentralny; pozostałe plansze TV pasywne; PanelLudzieWyswietlacze bez linku do plansz TV.
- **I:** StronaGlowna i StronaGlownaTelefon: „Zaloguj się” → PanelLogowanie, „Załóż konto firmy” → PanelRejestracja; reszta bez linku (bloga nie ma).
- **G:** BoksSzczegolyWoda „Karta konia” → KartaKonia (tymczasowo), „Przenieś konia” bez linku; EdycjaPlanuKonia → StajennyKonie; KartaKoniaObsluga „Edytuj plan” → EdycjaPlanuKonia, „Flaga” → SzybkaFlagaObsluga; PanelKonie „Przenieś” → PanelPrzeniesKonia, „Karta” i „Flaga” bez linku (brak planszy panelu); KartaKoniaKometa i StajennyKonieBrzozowa → MainBrzozowa i ListaDniaBrzozowa.

**L1: podmiany w istniejących plikach po P1**
- **Wszystkie paski apki:** „Profil” → Profil (u admina ProfilAdmin).
- **Dzwonek** (dec. 22 a): usunąć w apce (BoksyAdmin, Main, MainBrzozowa, MojBoks, StatusFlagi, Zaproszenie) i w panelu (PanelBoksy, PanelDodajHale, PanelPlatnosci, PanelUstawieniaStajni, PanelUstawieniaBrzozowa).
- **Logowanie:** „Zmień numer” → LogowanieNumer; „Zaloguj się” → start według MapaNawigacjiRol (w makiecie Main). dopisek „Masz zaproszenie?…” znika (dec. 38); link TOTP znika (W9), a „Kod jest ważny 10 minut” zależy od sesji logowania (propozycja 5 min).
- **Admin w apce (BoksyAdmin, Zaproszenie):** pasek Dziś | Boksy | Zadania | Ludzie | Profil (dec. 17); nazwa stajni z ▾ → PrzelacznikStajni (Damian ma 2 stajnie, dec. 21); przełącznik „Kanał: SMS | E-mail” w Zaproszenie zostaje (dec. 7), a z listy ról w Zaproszenie znika Wsparcie IT (dec. 19); BoksyAdmin „Szczegóły” wolnego Hala główna · boks 3 → BoksSzczegoly (tymczasowo, makieta boksu 6).
- **Przełącznik stajni w apce** (Main, ListaDnia, MainBrzozowa, ListaDniaBrzozowa) → PrzelacznikStajni. W panelu „▾” zostaje (dec. 21).
- **Obsługa:** ListaDnia „Zaznacz boksy” → ListaDniaGotoweBoksy i nowa linia „Poidło ręczne · Hala nowa · boks 5 · woda 06:55” → BoksSzczegolyWoda (dec. 26; BoksyAdmin nie ma wiersza tego boksu); StajennyKonie „Plan” → EdycjaPlanuKonia, „Flaga” i kafelki → SzybkaFlagaObsluga.
- **Klient:** SzybkaFlaga „Od … zmień” i „Do … zmień” → SzybkaFlagaGodziny; StatusFlagi „Odwołaj flagę” → StatusFlagiOdwolaj, „Zadzwoń do stajni” → `tel:` (dec. 25).
- **Brzozowa:** MainBrzozowa kafelki → SzybkaFlagaBrzozowa; „Karta”, Flagi i Historia w MainBrzozowa, Konie i „Zaznacz boksy” w ListaDniaBrzozowa, Pulpit, Boksy, Konie, Ludzie, Płatności i ustawienie boksu w PanelUstawieniaBrzozowa oraz kłódka i „Zmień boks” w TabletBoksBrzozowa: bez linku.
- **Panel Pod Lipami** (PanelBoksy, PanelDodajHale, PanelPlatnosci, PanelUstawieniaStajni): Pulpit → PanelPulpit, Ludzie → PanelLudzie, „Dodaj konia” → PanelDodajKonia, „Przenieś” i „Przypisz konia” → PanelPrzeniesKonia.
- **Tablet:** TabletBoks tekst „ONLINE · aktualne na …” → TabletUstawienia z adnotacją „przytrzymaj 5 s” (dec. 13); TabletPopup POTWIERDZAM → TabletBoks; TabletZmianaBoksu zakładka „Hala nowa” → TabletPierwszyBoks (tymczasowo, ta sama siatka), kafel 7 → TabletBoks, pozostałe zostają na TabletBoks (tymczasowo).
- **BoksSzczegoly:** „Cała historia” i „Przypisz konia” bez linku; „Boks gotowy” to akcja w miejscu.

**L2: po P2**
- Klient: Flagi (pasek i pigułka w KartaKonia, także MainLuna) → KlientFlagi; Historia → MojBoksWyborKonia; MainBrzozowa „Karta” → KartaKoniaKometa.
- Obsługa: StajennyKonie „Szczegóły” → KartaKoniaObsluga; ListaDniaBrzozowa Konie → StajennyKonieBrzozowa; BoksSzczegolyWoda „Karta konia” → KartaKoniaObsluga.
- Admin w apce: Ludzie → LudzieAdmin; „Przenieś”, „Przypisz konia”, „Przypisz boks” (BoksyAdmin, BoksSzczegoly, BoksSzczegolyWoda, AdminDzis) → PrzeniesKonia; „Szczegóły” zajętych boksów → KartaKoniaObsluga (tymczasowo; szczegółów zajętych boksów poza Hala nowa · 5 nie rysujemy); Zaproszenie „Wyślij zaproszenie” i „Wyślij ponownie” → ZaproszenieObsluga.
- Panel: Konie → PanelKonie (też ProfilAdmin, PanelPulpit); „D Damian (admin) ▾” → PanelMenuKonta, tam „Załóż stajnię” → PanelZalozStajnie; „Edytuj halę” i „Dodaj boks” → PanelEdytujHale; nowe zakładki ustawień → PanelUstawieniaOgolne, PanelSlowniki; PanelUstawieniaBrzozowa Pulpit → PanelPulpitBrzozowa.
- Konto i tablet: Profil „Zmień numer” → ProfilZmianaNumeru; TabletUstawienia „ZMIEŃ SIEĆ” → TabletWifi.
- Wyświetlacz (pliki z generatora): „Pełny ekran” Hali głównej i „Hala główna” w przełączniku → WyswietlaczHalaGlowna.

**L3: po P3**
- Main „Karta” Belli → KartaKoniaBella; BoksSzczegoly „Cała historia” → HistoriaBoksu; PanelBoksy „Szczegóły” (dziś MojBoks Anny) → PanelBoksSzczegoly; „Zobacz flagę” (PanelBoksy, PanelPulpit) → PanelSzczegolFlagi; PanelPlatnosci „Zmień plan”, „Zmień”, „Edytuj” → PanelPlatnosciZmiana, „Pobierz” to pobranie PDF; TabletBoksBrzozowa kłódka → TabletEkranZablokowanyBrzozowa.
- Pliki *BezAkcji: po ich ukończeniu i za osobną zgodą.

## 4. Kolejność prac i liczby

**Makiety (pliki): 67 P1, 26 P2, 14 P3, razem 107.** P1 obejmuje 13 plansz stanów z ● i 4 plansze zbiorcze stanów. Zmiana 13.10: +PanelRejestracjaFirmy, PanelZalozPowiadomienia, StronaGlowna, StronaGlownaTelefon; −PanelDodajWyswietlacz (dec. 11) i dwie plansze pierwszej fali (dec. 15, 19); wpisu bloga nie ma (dec. 37); PanelDiagnostyka z P1 do P3 jako narzędzie zespołu EQUENOR (dec. 19); +PanelOps (P2, admin globalny, mikroserwisy.md). Logowanie (W6–W9): ZaproszeniePrzyjmij → Rejestracja, +RejestracjaKod, ResetHasla, PanelRejestracja, PanelRejestracjaKod, PanelResetHasla; −LogowanieTotp.

| Paczka | Zawartość | Liczba | Po co |
|---|---|---|---|
| 0 | MapaNawigacjiRol; zatwierdzenie dec. 17, 18 (pozostałe potrzebne do pierwszej fali rozstrzygnięte 13.10) | 1 P1 | decyzje, od których zależy, czy plansza powstaje |
| 1 | P1 z grupy A | 13 | etap 1: rejestracja, logowanie z kodem MFA, reset hasła i zaproszenie tworzące członkostwo |
| 2 | P1 z grupy B | 15 | etapy 1–2: konto firmy i stajnia pilotażowa powstają bez nas |
| 3 | P1 z grupy C (bez mapy) | 5 | start każdej roli, A-02, A-14, A-21 |
| 4 | P1 z grupy D | 4 | etap 3 (A-01, A-12, A-18, A-20), odwołanie z etapu 4 |
| 5 | P1 z grupy E | 13 | etap 4, T-07, T-23…T-26, A-15 |
| 6 | P1 z grupy F | 7 | etap 5, W-01, W-17, W-18, W-29 |
| 7 | P1 z grupy G | 3 | etap 6 (A-13, A-16, A-17), dane stajni pilotażowej |
| www | P1 z grupy I | 2 | strona przed logowaniem: prezentacja (w pierwszej fali) |
| 1–7 | StanyApka, StanyPanel, StanyTablet, StanyWyswietlacz | 4 | każda paczka dokłada swoje fragmenty |
| L1 | podmiany z 3.H | — | makiety przestają prowadzić do zaślepek |
| 8 | P2 ze wszystkich grup i fragmenty ich stanów | 26 | domyka nawigację i stany przed pilotażem |
| L2 | podmiany z 3.H | — | cele P2 zamiast zastępczych |
| 9 | grupa H | 14 | po PoC albo po dec. 20, 22; PanelDiagnostyka w panelu `[OPS]` zespołu EQUENOR |
| L3 | podmiany z 3.H | — | cele P3 |

P1 rysujemy według rekomendacji z sekcji 5; plansza zależna od decyzji ma w notatce „(propozycja, dec. N)”. Pozostałe decyzje i zmiany w dokumentach uzgadniamy równolegle z rysowaniem; zmiana decyzji to poprawka planszy przed L1.

## 5. Decyzje do podjęcia

Format: opcje, **Rek.** (rekomendacja) i **Dok.** (co zmienić w dokumentach; uzgadniamy równolegle z makietami). Decyzje rozstrzygnięte przez użytkownika 13.10.2026 (sekcje L i N arkusza; N to komentarze z kanwy, 11:00) mają zamiast opcji **Rozstrzygnięte 13.10.2026**. Otwarte przed pierwszą falą zostają dec. 17 i 18.

**Rejestracja, zaproszenia, logowanie**

1. **Kto zakłada stajnię?** **Rozstrzygnięte 13.10.2026:** samoobsługa, wyłącznie B2B: rejestracja z hasłem i potwierdzeniem kodem, pierwsze logowanie (hasło i kod), PanelWitaj, konto firmy z NIP-em (PanelRejestracjaFirmy), potem PanelZalozStajnie. **Dok.:** erd pkt 15; `POST /stables` (szcz. 3.3) woła admin konta.
2. **Kreator czy jedna strona?** **Rozstrzygnięte 13.10.2026:** dwa kroki: „Stajnia” (PanelZalozStajnie: bez pytania o potwierdzenia flag, boksy z konfiguracją każdego boksu) i „Powiadomienia” (PanelZalozPowiadomienia: zdarzenia, odbiorcy Admin i Obsługa, kanał SMS albo e-mail); zapis na końcu kroku 2, potem PanelPulpitStart. Bez kroku płatności: subskrypcję zakłada billing po `stable.created` (dev §5 pkt 25). **Dok.:** erd pkt 11, 17 (`notification_rules`).
3. **Działalność = konto firmy.** **Rozstrzygnięte 13.10.2026:** konto firmy (`businesses`) z NIP-em, 1 konto = 1 NIP (drugi raz: „Ten NIP ma już konto w EQUENOR”); NIP podaje się raz, przy rejestracji (PanelRejestracjaFirmy); „Załóż stajnię” nie pyta o działalność ani NIP; stajnie konta widzi admin konta (dec. 35). **Dok.:** erd pkt 14, 15; NIP do faktur z konta firmy (erd pkt 10).
4. **Przyjęcie zaproszenia.** **Rozstrzygnięte 13.10.2026** (N14: „zaproszona osoba po zalogowaniu po prostu ma dostęp”): automatycznie. Po zalogowaniu `auth` dopasowuje zweryfikowany telefon albo e-mail do ważnego zaproszenia i od razu zapisuje członkostwo (klientowi także dostęp do konia) z `accepted_at`; bez ekranu „Przyjmij” i „Odrzuć”. Wygasłe albo odwołane zaproszenie się nie dopasowuje (BrakDostepu). Imię i język nowa osoba podaje przy rejestracji (Rejestracja; dec. 9), więc po pierwszym logowaniu od razu start roli. **Dok.:** erd pkt 3, 6; dev 3.5, A-06; szcz. 3.3 auth, 3.5.1, 4.2, A-06.
5. **Zaproszenie dla osoby już zalogowanej.** (a) dopasowuje się dopiero przy ponownym logowaniu; (b) `GET /me/memberships` dopasowuje je przy najbliższym odświeżeniu. **Rek.:** (b), bez arkusza „Przyjmij” (dec. 4): toast i przełącznik stajni (ZaproszenieNoweStajnia). **Dok.:** szcz. 3.3 auth.
6. **Imię zaproszonej osoby** (makiety: „Marek Nowak · zaproszenie czeka”). (a) opcjonalne `invitations.invitee_name` (pole „Imię”, widoczne tylko dla admina, bez dopisku w UI), po dopasowaniu nadpisane przez `users.display_name`; (b) tylko zamaskowany numer. **Rek.:** (a); w Rejestracja osoba wpisuje imię sama (rejestracja nie zna zaproszenia). **Dok.:** kolumna w `invitations`.
7. **E-mail, hasło, MFA i TOTP** (dev §5 pkt 1–2; szcz. §5 pkt 1–2; mikroserwisy.md W6–W9). **Rozstrzygnięte 13.10.2026:** logowanie w apce, panelu, na tablecie i TV e-mailem albo telefonem i hasłem, potem zawsze kod e-mailem albo SMS-em (MFA dla każdego konta, W8, W9); rejestracja z potwierdzeniem konta kodem, reset hasła kodem; kody wysyłają nasze `email` i `sms` (W7); aplikacje rozmawiają tylko z `auth` (W6); zaproszenia SMS-em albo e-mailem („Kanał: SMS | E-mail” jak w Zaproszenie); wzorzec ekranu w 2.3. TOTP znika, więc LogowanieTotp wypada z P3. **Dok.:** erd pkt 6, szcz. 2.4, 4.2.
8. **Język SMS zaproszenia** (szcz. §5 pkt 24). (a) zawsze PL; (b) PL i UA w jednym SMS; (c) pole „Język wiadomości” przekazywane do `notifications`, bez kolumny w `invitations`. **Rek.:** (c), domyślnie PL; SMS bez tokenu: link do pobrania, stajnia, rola, termin. Podpowiedź UA przy +380 tylko, gdy szcz. §5 pkt 24 dopuści numery spoza Polski (szcz. 2.5 zakłada blokadę krajów).
9. **Zgody i imię przy rejestracji.** (a) checkbox regulaminu i polityki z datą (pole w `users`); (b) link do polityki. **Rek.:** (b) na PoC, checkbox po ocenie prawnej. **Dok.:** imię i język podaje formularz rejestracji (Rejestracja, PanelRejestracja), a `display_name` trafia do `users` przy pierwszym logowaniu (erd pkt 6).

**Urządzenia**

10. **Logowanie telewizora** (dev i szcz. §5 pkt 3). **Rozstrzygnięte 13.10.2026:** telewizor to konto techniczne z rolą Wyświetlacz („Konto techniczne: Wyświetlacz”); loguje się e-mailem albo telefonem, hasłem i kodem, tak jak wszędzie (demo: „Telewizor korytarz”, e-mail, hasło i kod z e-maila). Bez nazw kont typu `wyswietlacz-korytarz` i adresu technicznego. Telewizor otwiera zwykłą stronę logowania panelu (bez osobnego adresu i ekranu „Zaloguj telewizor”); strona nie rozpoznaje urządzenia, a po zalogowaniu panel pokazuje widok tablicy, bo tak każe rola. Wybór widoku (wszystkie hale albo pełny ekran) dalej pamięta przeglądarka. **Dok.:** erd pkt 4; dev 3.5, szcz. 3.5.4.
11. **Konta wyświetlaczy.** **Rozstrzygnięte 13.10.2026:** konto zaprasza admin przez „Zaproś osobę” → „Konto techniczne: Wyświetlacz” (osobna grupa, oddzielona od ról osób); w Ludziach wiersz „Telewizor korytarz · konto techniczne · Wyświetlacz” w filtrze „Konta techniczne” (PanelLudzieWyswietlacze), bez osobnej sekcji, karty „Jak podłączyć telewizor” i instrukcji; bez formularza „Dodaj wyświetlacz” (PanelDodajWyswietlacz znika). Blokada przez „Zablokuj” (`stable_members.active = false` i podbicie `token_version`, erd pkt 14): najpóźniej po 5 min WyswietlaczZablokowany, po „Odblokuj” strona logowania; jedno konto na kilka telewizorów albo osobne na każdy. Innych zdalnych komend do TV nie ma (erd pkt 2). **Dok.:** erd pkt 4, szcz. 3.5.3.
12. **Czyim kontem loguje się tablet** (dev §5 pkt 5; szcz. §5 pkt 5, 31, 50). **Rozstrzygnięte 13.10.2026:** kontem technicznym z rolą Tablet, nie kontem osoby. Propozycja: jedno konto tabletów na stajnię („Tablety Pod Lipami”, b•••@stajnielipowe.pl; „Tablety Brzozowa”), zapraszane przez „Zaproś osobę” → „Konto techniczne: Tablet przy boksie”. Konto ma jedną stajnię, więc TabletPierwszyBoks nie ma przełącznika stajni; TabletUstawienia: KONTO „Tablety Pod Lipami · konto techniczne”; konto bez roli Tablet (osoby, Wyświetlacz): TabletBrakUprawnien. Akcje z tabletu bez autora (`source = tablet`). Wylogowanie osoby nie dotyka tabletów; zgubiony tablet (notatka R5): jednego tabletu nie odłączamy (bez listy tabletów i sesji, W4); admin klika w Ludziach „Wyloguj wszystkie tablety” (podbija `token_version` konta) albo blokuje konto tabletów („Zablokuj”: `stable_members.active = false` i podbicie `token_version`, erd pkt 2, 14); najpóźniej po 5 min tablety pokazują TabletWylogowany albo TabletBrakUprawnien, a pozostałe loguje się ponownie hasłem i kodem (propozycja); skradziony czyta tablicę najwyżej przez czas życia access tokenu, 5 min (szcz. 4.2). **Dok.:** erd pkt 2, 14; dev 3.3, 3.5, §5 pkt 5; szcz. 2.4, 3.1.9, 3.5.2, A-25, §5 pkt 5.
13. **Wejście w ukryte ustawienia.** (a) przytrzymanie 5 s tekstu „ONLINE · aktualne na …” (bez PL i UA); (b) nagłówka; (c) ukrytego rogu. **Rek.:** (a): rzadko dotykane, bez kolizji z kłódką (3 s) i „Zmień boks”, bez wskazówki, nie działa przy blokadzie. **Dok.:** element i czas w erd pkt 2.
14. **Kto zmienia Wi-Fi** (dev §5 pkt 15; szcz. §5 pkt 30). (a) każdy w ustawieniach; (b) tylko admin konta albo Wsparcie IT (zespół EQUENOR). **Rek.:** (a) na PoC, ocena po pilotażu i T-30; (b) wymaga przy każdej zmianie sieci zalogowania innym kontem, a potem ponownego logowania konta tabletów.
15. **Wybór stajni na tablecie.** **Rozstrzygnięte 13.10.2026:** bez ekranu wyboru stajni (TabletWyborStajni znika). Konto tabletów ma jedną stajnię (dec. 12), więc po zalogowaniu od razu wybór boksu w zakładkach hal (TabletPierwszyBoks, „WYBIERZ BOKS”), bez przełącznika stajni; w ukrytych ustawieniach nie ma wiersza „STAJNIA”. **Dok.:** erd pkt 2; dev 3.5, szcz. 3.5.2, A-17, A-25.
16. **Tablet bez sieci** (dev §5 pkt 10; szcz. §5 pkt 19). (a) kolejka z licznikiem; (b) blokada akcji. **Rek.:** (a), na co wskazują `time_quality` i `request_hash`.

**Nawigacja i role**

17. **Pasek i start admina w apce** (dziś Boksy, Ludzie, Płatności, Ustawienia; dwie ostatnie otwierają plansze 1440 px). (a) Dziś | Boksy | Zadania | Ludzie | Profil, Płatności i Ustawienia jako linki do panelu w ProfilAdmin; (b) obecny pasek z „Dziś”; (c) cztery pozycje i „Więcej”. **Rek.:** (a): Ustawienia są w panelu (erd pkt 16), Profil jest ostatni u każdej roli. **Dok.:** start i pasek każdej roli, routing po zalogowaniu i mapowanie na `stable_role_features` (MapaNawigacjiRol) do szcz. 3.5.1.
18. **Panel dla ról innych niż Admin** (erd pkt 3: obsługa „z apki i panelu web”). (a) na PoC tylko Admin i konto techniczne Wyświetlacz (widok tablicy), pozostali widzą PanelWitaj z linkami do apki; (b) menu filtrowane rolą (kilkanaście plansz). **Rek.:** (a); PanelLogowanie i tak jest bez opisu panelu (dec. 38). Diagnostyka dla zespołu EQUENOR jest w panelu `[OPS]`, poza panelem stajni (dec. 19; mikroserwisy.md 4). **Dok.:** w erd pkt 3 dopisać, że panel obsługi to dalszy etap.
19. **Wsparcie IT.** **Rozstrzygnięte 13.10.2026:** Wsparcie IT to zespół EQUENOR, a nie rola po stronie stajni: stajnia go nie zaprasza ani nie konfiguruje (dostęp nadajemy jako rolę platformową `plt = support`, propozycja z mikroserwisy.md). Znika z listy ról w zaproszeniach (PanelZaprosOsobe, apka Zaproszenie), z macierzy widoczności (kolumna „Wsparcie IT” i wiersz diagnostyki w PanelUstawieniaStajni, PanelUstawieniaBrzozowa, PanelUstawieniaBezAkcji; w jej miejscu kolumna „Tablet”, erd pkt 16) i z listy członków; WsparcieITStart znika. W apce Wsparcie IT nie ma ekranu, a w danych demo Kuba nie jest członkiem stajni. Zostają: dostęp zespołu EQUENOR do ukrytych ustawień i diagnostyki tabletu (TabletUstawienia, TabletDiagnostyka) i diagnostyka dla zespołu EQUENOR w panelu `[OPS]` (poza panelem stajni; PanelDiagnostyka w P3); admin globalny Kuba ma osobną planszę PanelOps (P2); bez rejestru urządzeń (admin nie zobaczy martwego tabletu, zostaje eskalacja, A-02). W ERD `it_support` znika ze `stable_members.role`, `invitations.role` i `stable_role_features.role`, a `device_diagnostics` z funkcji macierzy (erd pkt 14, „Zmiany”). **Dok.:** erd pkt 14, Słowniki; dev 3.3, §5; szcz. 3.1.9, 3.3 auth, §5; mikroserwisy.md 4.
20. **Jazdy i instruktor.** Jazdy tworzy (a) admin i instruktor; (b) tylko admin; (c) także klient. **Rek.:** na PoC jazdy z seedu i podgląd: InstruktorJazdy z flagami tylko do odczytu (propozycja), klient widzi jazdy swojego konia w „Dziś” karty konia (A-17, A-21); DodajJazde w (a) po decyzji. **Dok.:** kto tworzy jazdy i `arenas`; `rides_enabled` a widoczność `rides`; czy instruktor widzi imiona jeźdźców i ustawia flagi.
21. **Przełącznik stajni.** **Rozstrzygnięte 13.10.2026:** „▾” w apce i panelu tylko przy kilku stajniach: admin konta ma go, gdy firma ma kilka stajni (Damian), inni przy kilku członkostwach (Ola, Anna, Marta); przy jednej stajni sama nazwa (Paweł, Piotr). Apka otwiera ostatnio używaną stajnię, przy pierwszym logowaniu arkusz (szcz. 3.5.1). PanelUstawieniaStajni ↔ PanelUstawieniaBrzozowa to już prawdziwe przejście, bo Damian ma obie stajnie. **Dok.:** szcz. 3.5.1, 3.5.3.
22. **Dzwonek** (11 makiet; `notifications` to tylko SMS i e-mail). (a) usunąć; (b) lista liczona z istniejących danych; (c) skrzynka z nową tabelą. **Rek.:** (a) na PoC: eskalację admin dostaje SMS-em albo e-mailem (reguły powiadomień, dec. 2) i widzi w „Pilne”; Powiadomienia (P3) tylko przy (b).
23. **Potwierdzanie flag przez admina** (`flag_acknowledgements.method`: `tablet | app`). (a) w apce, w panelu podgląd; (b) `web` i „Potwierdzam” w panelu; (c) tylko obsługa i tablet. **Rek.:** (a).
24. **Klient po końcu ostatniego dostępu do konia.** (a) członkostwo zostaje (MainBezKonia), admin może je dezaktywować; (b) automatyczna dezaktywacja (BrakDostepu). **Rek.:** (a): kolejny koń nie wymaga nowego członkostwa. **Dok.:** członkostwo po ostatnim `valid_to` albo `revoked_at`.

**Codzienna praca i dane**

25. **Numer dla „Zadzwoń do stajni”** (`stables` nie ma telefonu). (a) `stables.phone`; (b) numer pierwszego aktywnego admina. **Rek.:** (b) na PoC.
26. **„Woda” w apce** (A-16). (a) ListaDnia; (b) szczegóły boksu; (c) karta konia. **Rek.:** (b) BoksSzczegolyWoda z wejściem z nowej linii w ListaDnia (zmiana zaakceptowanej makiety, za zgodą).
27. **Obsługa: plany i kontakt do klienta.** (a) „Edytuj plan” i „Zadzwoń”; (b) plan do odczytu, bez kontaktu. **Rek.:** (a): obsługa robi to samo co klient (erd pkt 3), a telefon przydaje się przy fladze w imieniu klienta.
28. **Wartości domyślne nowej stajni** (szcz. §5 pkt 27, 49; dev §5 pkt 13, 27). **Rozstrzygnięte 13.10.2026:** nowa stajnia ma wszystko włączone, także potwierdzenia flag (zmiana w Ustawieniach stajni). Język tablicy ustawia każdy tablet osobno (TabletUstawienia; przełącznik PL | UA w stopce zostaje); języków stajni nie ma (`stable_locales` znika), tłumaczenia nazw zostają jako opcjonalne etykiety. **Otwarte:** domyślna macierz widoczności ról (dev §5 pkt 27, szcz. §5 pkt 49): (a) wszystko włączone dla każdej roli, także Tabletu (bez Zadań i Historii boksu, które go nie dotyczą) i Wyświetlacza; (b) węższa, jak Pod Lipami. **Rek.:** (b): telewizor w korytarzu nie pokazuje zdrowia ani jazd. Do potwierdzenia razem z nią (propozycja; dev §5 pkt 13, szcz. §5 pkt 27): „Hala główna” i posiłki 06:30, 12:00, 18:00 z edycją w PanelZalozStajnie, okna szablonów jak Pod Lipami, `owner_edits_feeding` włączone. **Dok.:** erd pkt 2, 16; stan subskrypcji przed pierwszą płatnością.
29. **Nowe dane demo.** **Rozstrzygnięte 13.10.2026** (sekcja M arkusza, opis w 2.2): konto firmy „Stajnie Lipowe sp. z o.o.” (NIP 123-456-32-18, fikcyjny) z obiema stajniami; Damian to admin konta, rejestruje konto pn 07.09 i dodaje Brzozową czw 01.10 bez NIP-u; Paweł to Obsługa tylko w Brzozowej (+48 601 *** 377), zaproszony SMS-em 01.10; Ola Obsługa w obu, Piotr tylko Pod Lipami; Marta w obu; konta techniczne „Telewizor korytarz” (e-mail, Wyświetlacz, Pod Lipami), „Tablety Pod Lipami” (b•••@stajnielipowe.pl) i „Tablety Brzozowa” (propozycja, dec. 12); Kuba to admin globalny zespołu EQUENOR (dec. 19; propozycja z mikroserwisy.md). Znikają „Gospodarstwo Brzozowa” i `wyswietlacz-hala-nowa`, a „Stajnia Olszynka” znika z makiet; w testach zostaje jako nazwa drugiego konta firmy (fixture, dev 3.2, szcz. 3.2). Zostają (propozycja): Bartek, nowa Obsługa (+48 512 *** 908), Marek Nowak zamaskowany, Tomasz L. bez dostępu do Groma (tylko MainBezKonia), plan Bursztyna (owies 1 kg rano i wieczorem, siano bez ograniczeń). Osób z różnymi rolami w dwóch stajniach (szcz. 4.2) dane demo nie mają. Seed nadal trzyma obie stajnie w jednym koncie firmy, więc problem sceny zakładania znika; test izolacji (szcz. 3.3 stables, 4.2): Piotr (tylko Pod Lipami) nie widzi Brzozowej, a admin innego konta firmy nie widzi żadnej z nich (fixture, propozycja). **Dok.:** seed (dev 3.2, szcz. 3.2) i test izolacji.
30. **Podmiana linków.** (a) paczkami L1, L2, L3 według 3.H; (b) przy każdej planszy; (c) wcale. **Rek.:** (a) za zgodą; *BezAkcji po ukończeniu; linki w plikach TV zmieniamy w generatorze.
31. **Plansze TV** (rozstrzygnięte, bez decyzji): nowe plansze TV rysujemy według konwencji istniejących plików; WyswietlaczCentralny i WyswietlaczHala zmieniamy tylko w generatorze.
32. **Źródło flagi z decyzji stajni.** `horse_flags.source` ma `app` („właściciel w apce”) i `on_behalf_*`, a obsługa i admin ustawiają też flagi bez prośby klienta (seed: „Leki rano” Lorda od Pawła). (a) nowa wartość, np. `stable`; (b) `app` z `author_role = staff | admin` i opisem `app` „wpisana w apce”. **Rek.:** (b); do decyzji SzybkaFlagaObsluga pokazuje tylko `on_behalf_*`.
33. **Zmiana roli, kolejny koń, admin konta.** Zmiana roli nie ma opisu UI, zaproszenie ma jeden `horse_id`. (a) w PanelLudzie „Zmień rolę” i „Nadaj dostęp do konia” członkowi, z `valid_to`; (b) tylko zaproszenia (osobne zaproszenie na konia). **Rek.:** (a). „Zmień rolę” obejmuje tylko role osób w stajni (Obsługa, Instruktor, Klient); konta techniczne (Wyświetlacz, Tablet) roli nie zmieniają (propozycja). Admin to rola konta firmy (dec. 35): zaproszenie ani „Zmień rolę” jej nie nadają, a dodanie albo przekazanie admina konta jest poza PoC (erd pkt 14). Jedyny admin konta nie usunie konta (ProfilAdmin, `DELETE /me`, szcz. 3.3 auth; notatka R1). **Dok.:** zarządzanie członkami w erd pkt 3 i 14; czy rola inna niż `client` może mieć `horse_access`.
34. **Słowniki pasz, padoków, ujeżdżalni** (szcz. 3.5.3: „słowniki” bez makiet). (a) na PoC z seedu i `stable.created`, dopisywanie przez „+ Nowa pasza” i „+ Nowy padok” w EdycjaPlanuKonia, PanelSlowniki w P2; (b) od razu tylko PanelSlowniki. **Rek.:** (a); dopisują admin i obsługa (propozycja).
35. **Admin to rola konta firmy** (nowa reguła, rozstrzygnięte 13.10.2026). Admin (właściciel albo zarządca) ma dostęp do wszystkich stajni konta firmy, także nowych, bez przypisywania. Pozostałe role (Obsługa, Instruktor, Klient i konta techniczne Wyświetlacz, Tablet) przypisuje się per stajnia, a jedna osoba może być przypisana do kilku stajni (Ola). Zaproszenie nie nadaje roli Admin. **Dok.:** erd pkt 14 (`business_admins`, propozycja), szcz. 3.3 auth, 4.2.

**Marka**

36. **Nazwa produktu.** **Rozstrzygnięte 13.10.2026:** produkt nazywa się EQUENOR (wcześniej robocza nazwa eKoniuszy), hasło „Equestrian Management, Refined” mniejszym tekstem pod znakiem, nie obok. **Dok.:** README, paleta.md (zasady znaku i hasła), erd „Zmiany”, dev i szcz.

**Strona www**

37. **Strona www.** **Rozstrzygnięte 13.10.2026:** sama prezentacja produktu, statyczna strona w maksymalnie 4 blokach, prosta i czytelna (zasada „Strona www” w 2.3). Bez bloga i CMS (poza zakresem; tutoriale o NIP-ie, kontach i tabletach może kiedyś dać CMS), więc plansza wpisu znika, a z menu pozycja „Blog”. **Dok.:** dev 3.5 i §5 pkt 29, szcz. 3.5.5 i §5 pkt 51, erd „Zmiany”.

**Teksty w interfejsie**

38. **Bez objaśnień i bez „Czekasz na zaproszenie?”.** **Rozstrzygnięte 13.10.2026:** w interfejsie zostają etykiety, wartości, przyciski i komunikaty stanu, bez dopisków i objaśnień (2.3). NIP to zwykłe pole w PanelRejestracjaFirmy; zdania o NIP-ie („NIP podajesz raz…”, „potem podasz NIP”, „Konto firmy z NIP-em…”) znikają, a „Ten NIP ma już konto w EQUENOR” zostaje tylko jako komunikat błędu. PanelWitaj: imię, język, „Załóż konto firmy”, bez „Czekasz na zaproszenie?” i próśb do admina z numerem; zaproszona osoba po zalogowaniu po prostu ma dostęp. BrakDostepu: „Brak dostępu do stajni” i „Zaloguj się innym kontem”. **Dok.:** 2.3; szcz. 3.5.1, 3.5.3.

**Zmiany w dokumentach bez osobnej decyzji**
- **Zdrowie:** kto wpisuje wizyty; czy dzierżawca widzi `owner_private` właściciela; wet i kowal są w notatce flagi i w `health_events`, bez jednego źródła na tablicy i TV.
- **Seed:** Hala nowa · boks 5 ma tylko 3 wpisy, Bursztyn nie ma planu karmienia (dec. 29); brak reguły, czy „OSTATNIE AKCJE” wolnego boksu obejmują akcje hali i przeniesienia koni (`horse_box_history`).
- **analiza.md v3:** oznaczyć jako nieaktualne parowanie QR, PIN-y, tryb serwisowy i wyjście z kiosku, listę urządzeń z komendami, link zaproszenia z tokenem, status „wyświetlono”; ustalić, czy zostaje wydruk awaryjny (§8.2, §15.1.9).
- **Spójność:** numeracja §5 w dev i szcz. jest różna; po narysowaniu zaktualizować „Ekrany z makiet” i „Ekrany bez makiet” w szcz. 3.5.1–3.5.4.
