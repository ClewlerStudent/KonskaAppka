# eKoniuszy: zmiany według feedbacku ze stajni (jedyne źródło prawdy)

Feedback pochodzi od osoby, która zna pracę stajni od środka. Zmieniamy TYLKO to, co jest opisane niżej. Reszta makiet i wymagań jest zaakceptowana i ma zostać bez zmian (układ, paleta z docs/paleta.md, hale, numeracja boksów w hali, „Zmień boks”, pełny ekran hali, status flagi „potwierdzona/niepotwierdzona”).

## A. Wymagania (co ma działać)

### 1. Rutynowe czynności: mniej klikania
- **Woda:** poidło to ustawienie boksu („Automatyczne poidło: tak/nie”, admin w szczegółach boksu).
  - Przy poidle automatycznym znacznik wody NIE wyświetla się nigdzie, bo zawsze jest w porządku. Tak jest domyślnie i tak ma prawie każdy boks.
  - Tylko boks z poidłem ręcznym pokazuje znacznik „Poidło ręczne · woda HH:MM” i ma szybką akcję „Woda”.
  - W danych makiet poidło ręczne ma wyłącznie Hala nowa · boks 5 (Bursztyn), bo automat czeka na wymianę: woda dolana dziś 06:55, z tabletu.
  - Wszędzie indziej wodę usuwamy (Ostatnio, Historia, przyciski, zadania, plan dnia).
- **„Ogarnięte”** zastępuje „Czyszczenie” i „Ścielenie”:
  - jedno tapnięcie na boks;
  - klient nadal widzi, kiedy boks był ogarnięty („Ogarnięte dziś 07:10”);
  - ogarnianie robi się codziennie, czasem 2–3 razy dziennie, więc można je zapisać kilka razy dziennie i liczy się ostatnie.
- **Bez potwierdzania karmienia per koń:** znikają „Siano”, „Karma”, „Siano i karma”, „Nakarmiony” i odhaczanie posiłku przy każdym koniu.
- **Szybkie przyciski obsługi:**
  - **„Podano śniadanie”** (i analogicznie inne posiłki):
    - akcja ZBIORCZA dla całej hali, jedno tapnięcie;
    - konie z aktywną flagą wstrzymującą ten posiłek są pomijane automatycznie i wypisane jako „pominięte” (np. „bez Kasztana: flaga”).
  - **„Wyprowadzono na padok”:**
    - akcja zbiorcza dla całej hali;
    - obejmuje konie z planem padoku na teraz;
    - pomija konie z flagą „Nie na padok” obowiązującą w tym czasie i wypisuje je.
  - **„Ogarnięte”:**
    - per boks: jedno tapnięcie na tablecie przy boksie albo w siatce boksów w apce obsługi;
    - w apce zaznacza się kilka boksów naraz i zapisuje jednym przyciskiem.
  - Każdą akcję można cofnąć przez godzinę od zapisu („Cofnij”, propozycja). Na tablecie akcja nie ma autora (`source = tablet`); w apce ma autora.

- **Zasada spójności (decyzja użytkownika):** jeśli ekran obsługi pokazuje, kiedy coś zrobiono (posiłek, padok, ogarnięcie), to ma też przycisk, żeby to zapisać.
  - Tablet przy boksie ma sekcję „SZYBKIE AKCJE” z trzema przyciskami: „Ogarnięte” (ten boks), posiłek, czyli „Śniadanie / Obiad / Kolacja / Siano” zależnie od pory, oraz „Padok” (cała hala tego boksu).
  - Klient i wyświetlacz TV tylko oglądają stan.

### 2. Flagi: jedyne, co wymaga potwierdzenia
- **Potwierdzenia obsługi wymagają wyłącznie flagi** (wyjątki): „Bez śniadania”, „Bez kolacji”, „Nie na padok”, „Derka”, „Leki”, „Wet” itp. Przepływ „Nowa flaga” → pop-up na tablecie → „Potwierdzono flagę” zostaje bez zmian.
- **Nowa flaga „Derka”** z wyborem: „zakładać” albo „nie zakładać” (np. „Derka: zakładać · 16:00–08:00”).
- **Godziny to MUST HAVE i muszą realnie działać:**
  - każda flaga ma początek i koniec (data + godzina, strefa stajni); „do odwołania” nie ma;
  - kafelek flagi podpowiada godziny, które można zmienić:
    - Bez śniadania: dziś 06:00–10:00;
    - Nie na padok: godziny padoku;
    - Derka: 16:00–08:00;
  - system liczy skutki z godzin:
    - flaga wstrzymuje tylko posiłki, które wypadają w jej oknie;
    - „Nie na padok” skraca albo odwołuje padok tylko w swoim oknie. Przykład: wet o 8:00, kowal o 15:00, a między wizytami koń idzie na padok;
  - tablet, wyświetlacz i apka pokazują przy fladze godziny („06:00–10:00”), a flagę, która zacznie się później, oznaczają jako „od 14:30”.
- **Namaczanie paszy:**
  - przy pozycji planu karmienia jest informacja „namoczyć” + ile, np. „Wysłodki 0,5 kg · namoczyć w 2 l wody”;
  - to wersja prosta, bo model karmienia (pudełko, namaczanie, ile) jest otwartą kwestią;
  - tablet pokazuje to w tabeli karmienia wyraźnym oznaczeniem „NAMOCZYĆ”.

### 3. Widok klienta (właściciela albo dzierżawcy konia)
- Maksymalnie prosty: kafelki flag do kliknięcia, opcjonalna notatka, godziny podpowiedziane z możliwością zmiany. Bez dodatkowych pól i kroków.
- „Mój boks”:
  - „Ostatnio” pokazuje tylko zdarzenia z przycisków obsługi: Ogarnięte, Podano śniadanie/obiad/kolację, Wyprowadzono na padok;
  - „Historia” pokazuje tylko flagi (utworzenie, potwierdzenie, odwołanie) i zdarzenia z przycisków obsługi.

### 4. Zadania
- Usunąć „Wymienić wodę w poidle” i wszystkie zadania cykliczne (np. „Czyszczenie boksów” jako zadanie).
- Zadanie to jednorazowa sprawa wpisana przez zarządcę albo właściciela stajni (rola `admin`), np. „Poidło w boksie 5 do wymiany”. Może dotyczyć hali albo boksu.
- Stajenny sam wybiera zadanie z listy („Biorę”), bierze je na siebie i oznacza jako zrobione („Zrobione”).
- Zadania obsługuje apka (potrzebna osoba). Tablet ich nie odhacza.

### 5. Role
- **„Klient”** zastępuje „Właściciela konia” i „Najemcę miejsca”: to jedna rola.
  - Klient to osoba, która przyprowadza konia do stajni (koń własny albo dzierżawiony).
  - Klient ma dostęp do swojego konia i do boksu, w którym ten koń stoi: podgląd, flagi, „Mój boks”.
  - Osobnego najmu boksu bez konia nie ma.
- **„Wsparcie IT”** zastępuje „Serwisanta”, bo ta nazwa myliła się z weterynarzem. Opis jednym zdaniem: „Wsparcie IT: techniczny dostęp do konfiguracji i diagnostyki tabletów i wyświetlaczy, bez zarządzania końmi i klientami.”

### 6. Tablet przy boksie: blokada ekranu
- Ekran jest dotykowy. Przycisk „Zablokuj ekran” (ikona kłódki) włącza blokadę, żeby przy myciu albo wycieraniu nic się nie przestawiło.
- Gdy ekran jest zablokowany:
  - tablica dalej się odświeża i jest czytelna;
  - dotyk nic nie zmienia;
  - widać pasek „EKRAN ZABLOKOWANY · przytrzymaj kłódkę 3 s, aby odblokować”.
- Pop-up nowej flagi pojawia się mimo blokady. Żeby potwierdzić flagę, trzeba najpierw odblokować ekran.
- Blokada sama zdejmuje się po 10 minutach, żeby tablet nie został zablokowany na stałe (propozycja).
- Blokadę trzyma tylko tablet (stan lokalny), bez tabel.
- Uwaga: to blokada DOTYKU. Nadal nie ma „blokady boksu” (tę usunęliśmy wcześniej).

### 7. Bez zmian (potwierdzone)
- Podział na hale zostaje: „Hala główna”, „Hala nowa”.
- Model: działalność → stajnie → hale → boksy. Jedna działalność (firma) może mieć kilka stajni. Dochodzi tabela `businesses`; płatności zostają na poziomie stajni, bo ich nie rozbudowujemy.

### 8. Otwarte kwestie (do sekcji w wymaganiach)
- model karmienia: pudełko, namaczanie, ile;
- ekran dotykowy z blokadą czy zaprogramowany fizyczny przycisk przy boksie;
- płatności, faktury, KSeF: czy to nie za dużo na PoC (na razie bez rozbudowy).

## B. Dane kanoniczne makiet (po zmianach)

- **Czas i ludzie:**
  - teraz jest wt 13.10.2026, 07:15 (pop-up tabletu: 06:01);
  - Stajnia Pod Lipami; admin (zarządca) Damian; obsługa Ola i Piotr;
  - klienci:
    - Anna: Kasztan i Bella;
    - Karolina W.: Iskra;
    - Tomasz L.: Grom;
    - Marek Nowak: Luna, zaproszenie czeka; Luna jest bez boksu, dodana 12.10.
    - Ewa K.: Sonata (ustawiła flagę „Derka”).
- **Hale:**
  - Hala główna (ul. Lipowa 12, Konstancin-Jeziorna): 1 Iskra, 2 Dukat, 3 wolny, 4 Sonata, 5 Wicher, 6 Fala, 7 Kasztan, 8 Hetman;
  - Hala nowa (ul. Polna 3, Konstancin-Jeziorna): 1 Grom, 2 Mgła, 3 Rumba, 4 Bella, 5 Bursztyn, 6 wolny.
- **Posiłki:** śniadanie 06:30, obiad 12:00, kolacja 18:00.
  - Hala główna: „Podano śniadanie” 06:40 (Ola, apka), pominięty Kasztan (flaga „Bez śniadania”).
  - Hala nowa: „Podano śniadanie” 06:50 (Piotr, apka), bez pominięć.
- **Padok dziś** (plan):
  - padok A 10:00–14:00: Dukat (główna 2), Sonata (główna 4), Grom (nowa 1), Bursztyn (nowa 5);
  - padok B 10:00–16:00: Fala (główna 6), Kasztan (główna 7; do 14:30, bo od 14:30 ma flagę), Rumba (nowa 3);
  - zostają w boksie: Iskra, Wicher, Hetman, Mgła; Bella nie wychodzi (flaga).
  - „Wyprowadzono na padok”: jeszcze nie, o 10:00. Wczoraj było o 10:05.
- **Ogarnięte:**
  - dziś: główna 1 Iskra 07:02, główna 2 Dukat 06:50, główna 5 Wicher 07:05 (Piotr, apka), główna 7 Kasztan 07:10, nowa 2 Mgła 06:58, nowa 3 Rumba 07:12, nowa 5 Bursztyn 07:14. To 7 z 14. Pozostałe z tabletu, bez autora.
  - wcześniej: główna 3 (wolny) wczoraj 16:10 (Piotr), główna 4 Sonata wczoraj, główna 6 Fala wczoraj, główna 8 Hetman wczoraj, nowa 1 Grom wczoraj 16:10 (Piotr), nowa 4 Bella wczoraj 17:30 (Ola), nowa 6 (wolny) 09.10 14:40 (Piotr).
- **Flagi, wszystkie z godzinami:**
  - Kasztan (Hala główna · boks 7):
    - „Bez śniadania” dziś 06:00–10:00. Notatka „Wet o 8:00, koń na czczo”. Wstrzymane: owies, siano, suplement X. Anna 03:14, potwierdzona 06:02, krytyczna.
    - „Nie na padok” dziś 14:30–16:00. Notatka „Kowal o 15:00”. Anna 03:16, potwierdzona 06:02. Dzięki temu Kasztan idzie na padok B 10:00–14:30, czyli między wizytami.
  - Bella (Hala nowa · boks 4): „Nie na padok” dziś, cały dzień (00:00–23:59). Ustawiona 01:20, NIEPOTWIERDZONA, admin powiadomiony. Krytyczna.
  - Hetman (Hala główna · boks 8): „Leki rano” dziś 06:00–09:00, potwierdzona 06:20 (info).
  - Sonata (Hala główna · boks 4): „Derka: zakładać” dziś 16:00 – jutro 08:00. Notatka „przymrozek w nocy”. Ewa K. 06:50, potwierdzona 07:05.
- **Karmienie Kasztana** (plan; tablet pokazuje tabelę):
  - owies: rano 1,5 kg, wieczór 1,5 kg;
  - siano: rano, w południe i wieczór bez ograniczeń;
  - suplement X: rano 1 miarka;
  - wysłodki: wieczór 0,5 kg, NAMOCZYĆ w 2 l wody.
  - Rano wstrzymane przez flagę.
  - Hetman ma „Sieczka 1 kg · namoczyć w 3 l wody” (rano).
- **Zadania** (jednorazowe):
  1. „Poidło w boksie 5 do wymiany” · Hala nowa · boks 5. Dodał Damian wczoraj 18:20. Do wzięcia.
  2. „Wymienić żarówkę w korytarzu” · Hala główna. Wziął Piotr 07:00. W toku.
  3. „Przywieźć słomę z magazynu”. Zrobione: Ola 06:30.
- **Wizyty dziś:** wet 08:00 (Kasztan), kowal 15:00 (Kasztan), jazda 16:00 (Iskra, kryta ujeżdżalnia).

## C. Słownictwo (obowiązkowe)
- Akcje obsługi: „Ogarnięte”, „Podano śniadanie”, „Podano obiad”, „Podano kolację”, „Wyprowadzono na padok”. W historii: „Ogarnięte”, „Podano śniadanie · Hala główna” (pominięci: …), „Wyprowadzono na padok · Hala nowa”.
- Status flagi: „potwierdzona HH:MM” albo „niepotwierdzona”. Bez „przyjęte”.
- Godziny flagi: „06:00–10:00”, „od 14:30”, „16:00–08:00”, „dziś, cały dzień”.
- Rola: „Klient”, „Obsługa”, „Admin” (zarządca), „Instruktor”, „Wsparcie IT”, „Wyświetlacz” (konto TV). Bez: „Właściciel konia” jako roli, „Najemca”, „najemca miejsca”, „Serwisant”.
- ZAKAZANE w makietach: „Woda”, „poidło” jako czynność (wyjątek: zadanie naprawcze „Poidło w boksie 5 do wymiany”), „Czyszczenie”, „Ścielenie”, „Siano i karma” jako zdarzenie, „Nakarmiony/Nakarmiona”, „R 06:35” (posiłek per koń), „Wymienić wodę w poidle”, „Czyszczenie boksów” jako zadanie.
  - „Siano” może zostać WYŁĄCZNIE jako nazwa paszy w planie karmienia.

## D. Zmiany per ekran (makiety w scratchpad/mockups/project)

Właściciel / klient:
- **Main** (Moje konie):
  - przy flagach godziny i status;
  - kafelki szybkiej flagi z „Derką” (np. siatka 4 × 2: Bez śniadania, Bez kolacji, Nie na padok, Derka, Wet, Leki, Inna flaga);
  - bez zbędnych linii, np. „Śniadanie podane 06:40 · Ola” per koń: pokazujemy najwyżej skrót z przycisków obsługi.
- **SzybkaFlaga:** maksymalnie prosto, czyli kafelki, wybrana flaga, godziny „od–do” (podpowiedziane, z możliwością zmiany), opcjonalna notatka i przycisk. Derka ma wybór „zakładać / nie zakładać”.
- **StatusFlagi:** godziny obowiązywania flagi; oś: Ustawiona → Potwierdzona; Bella niepotwierdzona.
- **KartaKonia:**
  - plan karmienia z „namoczyć”;
  - „Dziś”: wet 8:00, padok B 10:00–14:30, kowal 15:00;
  - flagi z godzinami;
  - bez wody, siana i karmy jako zdarzeń.
- **MojBoks:**
  - rola Klient;
  - Ostatnio: Ogarnięte, Podano śniadanie (pominięty: flaga), Wyprowadzono na padok;
  - Historia: tylko flagi i zdarzenia z przycisków.

Obsługa / admin:
- **ListaDnia** (Dziś):
  - na górze „Szybkie akcje” per hala:
    - „Podano śniadanie” w stanie zrobionym (✓ 06:40 i 06:50, pominięty Kasztan), z „Cofnij”;
    - „Wyprowadzono na padok” jako następne o 10:00, z liczbą koni i pominiętymi;
    - „Ogarnięte” 7 z 14, otwiera siatkę boksów;
  - „Wymaga potwierdzenia”: tylko flagi;
  - bez listy karmienia per koń; skrót zadań.
- **StajennyZadania** (NOWY ekran 390×960, zakładka „Zadania” w nawigacji obsługi):
  - „Do wzięcia” z przyciskiem „Biorę”;
  - „Moje” z „Zrobione”;
  - „Zrobione dziś”;
  - widok Piotra (obsługa); przycisk „+ Dodaj zadanie” widzi tylko admin, więc tu go nie ma albo jest dopisek, że dodaje admin.
- **StajennyKonie:** kafelki szybkiej flagi z Derką; godziny przy flagach w liście.
- **BoksyAdmin:**
  - wiersze boksów: „Ogarnięte dziś 07:10” zamiast czyszczenia, wody, siana i karmy;
  - flagi z godzinami;
  - klient Marek Nowak przy Lunie („zaproszenie czeka”), a nie przy boksie 3.
- **BoksSzczegoly** (wolny boks 6 w Hali nowej):
  - Ostatnio: Ogarnięte 09.10 14:40 · Piotr;
  - „Kto korzysta”: ostatni koń Wicher (przeniesiony 01.10); klient nie dotyczy, bo boks jest wolny;
  - bez „Udostępnij najemcy”;
  - przyciski „Ogarnięte” i „Przypisz konia”.
- **Zaproszenie:**
  - role: Klient (wybór konia, np. Luna), Obsługa, Instruktor, Wsparcie IT (z opisem jednym zdaniem);
  - bez „Właściciel konia”, „Najemca miejsca” i „Serwisant”;
  - oczekujące zaproszenie Marka Nowaka do Luny.

Tablet:
- **TabletBoks:**
  - baner flagi z godzinami: „BEZ ŚNIADANIA · 06:00–10:00”, a pod nim linia „Później: Nie na padok od 14:30 (kowal 15:00)”;
  - tabela karmienia z wierszem wysłodków „0,5 kg · NAMOCZYĆ 2 l” (wieczór);
  - sekcja BOKS:
    - jeden duży przycisk „OGARNIĘTE” (stan: „✓ dziś 07:10”, ponowne tapnięcie zapisze ponownie);
    - linia rutyny hali: „Śniadanie podane 06:40 (bez Kasztana) · Padok B 10:00–14:30”;
  - zamiast HISTORII sekcja „OSTATNIE AKCJE”: dokładnie 5 najnowszych wpisów (flagi i przyciski), bez „Cała historia” (decyzja użytkownika);
  - nowy przycisk „Zablokuj ekran” (kłódka) obok „Zmień boks”;
  - bez wody, siana i ścielenia.
- **TabletPopup:** godziny flagi „dziś 06:00–10:00”.
- **TabletEkranZablokowany** (NOWY ekran 702×936):
  - TabletBoks w stanie zablokowanym;
  - pasek „EKRAN ZABLOKOWANY · przytrzymaj kłódkę 3 s” i przycisk kłódki z kółkiem postępu;
  - treść dalej czytelna, przyciski wyszarzone, a raczej z przerywaną ramką, bo to e-ink;
  - zgodnie z paletą tabletu: tylko czerń, biel, `t-*`.

Panel web:
- **PanelBoksy:**
  - kolumny: Boks, Koń, Klient (scalone), Aktywne flagi (z godzinami), Ostatnio ogarnięte, Akcje;
  - bez „Właściciel”, „Najemca” i „Ostatnio siano”;
  - klient Luny Marek Nowak, zaproszenie czeka.

Wyświetlacze (generuje lead, agentom nie ruszać): WyswietlaczCentralny, WyswietlaczHala.
- Kafle bez posiłków per koń (R/P/W); zamiast tego flagi z godzinami, „Ogarnięte HH:MM” i padok z godzinami.
- W nagłówku hali: „Śniadanie podane 06:40 · padok 10:00”.
- Zadania jednorazowe.

## E. Paleta i format
- Kolory WYŁĄCZNIE z docs/paleta.md (LCD: tokeny bg, surface, sand, line…, accent tylko na elementach klikalnych; tablet: `t-*`, kolor tylko w dużych polach).
- Nowe elementy mają przypominać istniejące elementy tego samego ekranu.
- Format design canvas: zachowaj `<x-dc>`, `<helmet>`, `<script src="./support.js">`, data-props z `$preview` i `{{accent}}`. Nowe pliki rób na wzór istniejącego pliku z tej samej grupy (skopiuj szkielet).

# UZUPEŁNIENIE: konfiguracja per stajnia (decyzja użytkownika)

## F. Wymagania
- **„Ustawienia stajni”** to nowy ekran w panelu web admina (właściciel albo zarządca stajni). Ustawienia są per stajnia, nie dla całej działalności. Na PoC to przełączniki gotowych opcji.
- **Usługi do włączenia i wyłączenia:**
  - zakładanie derek (flaga „Derka”);
  - moczenie paszy („namoczyć” + ile);
  - pozostałe flagi, każda osobno: Bez śniadania, Bez kolacji, Nie na padok, Wet, Leki;
  - szybkie przyciski obsługi: Ogarnięte, Posiłek, Padok. „Woda” zależy od poidła boksu.
  - Wyłączona opcja znika z kafelków klienta, z widoku obsługi i z tabletu. Znika też jej stan, zgodnie z zasadą spójności.
- **Przełącznik „Flagi wymagają potwierdzenia”:**
  - włączony: obecny przepływ „Nowa flaga” → pop-up na tablecie → „Potwierdzono flagę”, status potwierdzona/niepotwierdzona;
  - wyłączony: flaga obowiązuje od razu. Nie ma kroku potwierdzenia, pop-upu „POTWIERDZAM”, statusu oczekiwania u klienta, sekcji „Wymaga potwierdzenia” u obsługi ani eskalacji. Na tablecie flaga od razu stoi w banerze, bez plakietki „POTWIERDZONA”.
- **Widoczność per rola:**
  - macierz funkcji (Flagi, Plan karmienia, Szybkie akcje i ich stan, Historia boksu, Zadania, Zdrowie i wizyty, Jazdy, Diagnostyka tabletów i wyświetlaczy) i ról (Klient, Obsługa, Instruktor, Wsparcie IT, Wyświetlacz), z checkboxami;
  - admin widzi wszystko.
- **Wszędzie, gdzie jest mowa, że flagi wymagają potwierdzenia, dopisujemy: „zależy od ustawień stajni”.**

## G. Dane demo: dwie stajnie
1. **Stajnia Pod Lipami** (dotychczasowe dane, sekcja B): pełna opcja.
   - Potwierdzenia: WŁĄCZONE.
   - Derka: tak. Moczenie: tak.
   - Flagi: wszystkie.
   - Przyciski: Ogarnięte, Posiłek, Padok.
   - Widoczność: klient widzi Flagi, Plan karmienia, Szybkie akcje i ich stan, Historię boksu, Zdrowie i Jazdy; obsługa widzi wszystko poza Diagnostyką; Wsparcie IT widzi tylko Diagnostykę; Wyświetlacz widzi Flagi, Plan karmienia, Szybkie akcje i Zadania.
   - Admin: Damian.
2. **Stajnia Brzozowa** (mała, prowadzona przez właściciela, który sam jest stajennym).
   - Adres ul. Brzozowa 5, Piaseczno. Jedna hala, więc nigdzie nie pokazujemy podziału na hale. Boksy 1–6.
   - Admin i właściciel: Paweł (sam też obsługuje). Do pomocy rano przychodzi Ola, która jest obsługą także w Pod Lipami. Dzięki temu Ola może przełączać stajnie w apce.
   - Konie:
     - 1 Kometa (klientka Anna, ta sama Anna co w Pod Lipami, więc może przełączać stajnie);
     - 2 Dąb;
     - 3 Iga;
     - 4 Lord;
     - 5 wolny;
     - 6 Nuta.
   - Ustawienia:
     - Potwierdzenia: WYŁĄCZONE.
     - Derka: NIE. Moczenie: NIE.
     - Flagi: Bez śniadania, Bez kolacji, Nie na padok, Wet, Leki.
     - Przyciski: Ogarnięte i Posiłek. Padok: WYŁĄCZONY, bo konie stoją w systemie padokowo-boksowym i wychodzą same.
     - Widoczność: klient widzi Flagi, Szybkie akcje i ich stan, Historię boksu i Zdrowie (bez planu karmienia i jazd); obsługa widzi Flagi, Plan karmienia, Szybkie akcje, Historię boksu i Zdrowie (bez zadań i jazd); wyświetlacza nie ma (wszystko odznaczone); Wsparcie IT widzi Diagnostykę.
   - Dziś (wt 13.10, 07:15):
     - Kometa ma flagę „Bez śniadania” 06:00–09:00 z notatką „dentysta o 8:30”. Ustawiła ją Anna o 05:50 i obowiązuje od razu, bez statusu.
     - Lord ma „Leki rano” 06:00–09:00 (ustawił Paweł).
     - Śniadanie podane 06:35 (Paweł, apka), pominięta Kometa (flaga).
     - Ogarnięte: boks 1 Kometa 07:00, 2 Dąb 06:55 (Ola), 4 Lord 07:05; pozostałe wczoraj.

## H. Makiety do zrobienia (nowe pliki)
- **PanelUstawieniaStajni.dc.html** (Pod Lipami, 1440 px, panel web, aktywna zakładka „Ustawienia”, w nagłówku przełącznik „Stajnia Pod Lipami ▾”, użytkownik Damian (admin)):
  - sekcja „Potwierdzenia flag” z przełącznikiem i opisem obu trybów;
  - sekcja „Usługi”: przełączniki derek, moczenia, flag i szybkich przycisków;
  - sekcja „Widoczność per rola”: macierz z checkboxami;
  - przycisk „Zapisz” z dopiskiem „Zmiany działają przy najbliższym odświeżeniu apki, tabletów i wyświetlacza”.
- **PanelUstawieniaBrzozowa.dc.html**: ten sam układ dla Stajni Brzozowej, z jej ustawieniami; użytkownik Paweł (admin).
- **MainBrzozowa.dc.html** (390×844): widok klientki Anny po przełączeniu na Stajnię Brzozową.
  - Koń Kometa (boks 1), flaga „Bez śniadania 06:00–09:00” BEZ statusu potwierdzenia, z dopiskiem „obowiązuje od razu”.
  - Kafelki: Bez śniadania, Bez kolacji, Nie na padok, Wet, Leki, Inna flaga, czyli BEZ Derki.
  - Krótki dopisek „W tej stajni flagi obowiązują od razu, bez potwierdzania”.
- **ListaDniaBrzozowa.dc.html** (390×960): widok Oli (obsługa) po przełączeniu na Stajnię Brzozową.
  - Szybkie akcje: „Podano śniadanie” (✓ 06:35 · Paweł, pominięta Kometa) i „Ogarnięte 3 z 6”. Bez padoku.
  - Bez sekcji „Wymaga potwierdzenia”; flagi dziś bez statusu; bez namaczania; bez zadań.
- **TabletBoksBrzozowa.dc.html** (702×936): tablet boksu 1 (Kometa) w Stajni Brzozowej.
  - Baner „BEZ ŚNIADANIA · 06:00–09:00 · dentysta o 8:30” BEZ plakietki „POTWIERDZONA”.
  - Szybkie akcje: tylko OGARNIĘTE i ŚNIADANIE, bez PADOKU.
  - Karmienie bez „NAMOCZYĆ”; 5 ostatnich akcji.
  - Nagłówek bez hali.
- **W istniejących makietach Pod Lipami:**
  - przełącznik stajni w nagłówku Main i ListaDnia linkuje do wersji Brzozowej i z powrotem;
  - w nawigacji panelu „Ustawienia” linkuje do PanelUstawieniaStajni.dc.html;
  - teksty mówiące, że potwierdzenia „zawsze” są wymagane, dostają dopisek o ustawieniach stajni.

# UZUPEŁNIENIE 2: wariant „przyciski obsługi wyłączone” (prośba użytkownika: „Daj makietę gdzie opcje ogarniania itd są wyłączone”)

## I. Definicja wariantu
- **Stajnia i moment:** Stajnia Pod Lipami, te same dane co w sekcji B (wt 13.10.2026, 07:15; Damian admin, Ola i Piotr obsługa, Anna klientka; te same konie, boksy, hale, flagi, plan karmienia, zadania).
- **Różnica:** w „Ustawieniach stajni” → „Usługi” → „Szybkie przyciski obsługi” WYŁĄCZONE są: Ogarnięte (`tidy_enabled`), Posiłek (`meal_served_enabled`) i Padok (`paddock_out_enabled`). Stajnia ich nie używa (wariant ustawień, więc w historii nie ma żadnych zdarzeń z tych przycisków).
- **Bez zmian:** potwierdzenia flag WŁĄCZONE (pop-up, „potwierdzona 06:02”, „niepotwierdzona”, eskalacja), Derka i moczenie włączone, wszystkie flagi włączone, macierz widoczności jak w Pod Lipami (sekcja G).
- **Reguła znikania:**
  - znika przycisk i STAN WYKONANIA: „Ogarnięte HH:MM” / „ogarnięte wczoraj …”, „Podano śniadanie 06:40”, „podane 06:50”, „✓ Śniadanie 06:50”, „Wyprowadzono na padok …”, liczniki „Ogarnięte: 7 z 14”, „Cofnij”, sekcje „Szybkie akcje” / „SZYBKIE AKCJE”, kolumna „Ostatnio ogarnięte”;
  - wyłączony Padok chowa też PLAN PADOKU (stajnia nie prowadzi padoków w aplikacji): „padok A 10–14”, „Padok B · z: Fala, Rumba”, „10:00–14:30”, „Padoki 10:00 …”, „w boksie” (jako plan padoku), „padok odwołany”, „padok do 14:30”, „padok o 10:00”;
  - ZOSTAJE: flagi (także „Nie na padok” z godzinami i notatką „kowal o 15:00”), plan karmienia z WSTRZYMANE i NAMOCZYĆ, godziny posiłków jako plan („Następny posiłek: obiad 12:00”, „06:30 Śniadanie · 5 koni” bez „podane”), wizyty (wet 08:00, kowal 15:00), zadania, potwierdzenia;
  - „Woda” NIE ma przełącznika: zostaje tylko przy poidle ręcznym (Hala nowa · boks 5, Bursztyn: „Poidło ręczne · woda 06:55”, akcja „Woda”). Boks 7 Kasztana ma poidło automatyczne, więc u niego nic o wodzie.
- **Historia i „ostatnie akcje”:** tylko zdarzenia flag (nowa flaga, potwierdzenie) i „Woda” przy poidle ręcznym. Dla Kasztana (boks 7) dziś: 06:02 Potwierdzono flagę „Nie na padok”, 06:02 Potwierdzono flagę „Bez śniadania”, 03:16 Nowa flaga „Nie na padok” · dziś 14:30–16:00 · Anna, 03:14 Nowa flaga „Bez śniadania” · dziś 06:00–10:00 · Anna. Wczoraj nic (nie pokazujemy pustej grupy „Wczoraj”). Na tablecie „OSTATNIE AKCJE” = te 4 wiersze (limit to 5, więc nagłówek „ostatnie · boks i koń”, nie „5 ostatnich”).
- **Hala nowa, ostatnie akcje dziś:** 06:55 Woda · boks 5 (Bursztyn, z tabletu), 01:20 Nowa flaga „Nie na padok” · boks 4 Bella.

## J. Makiety wariantu (nowe pliki, sufiks „BezAkcji”)
Każdy plik to kopia oryginału z sekcji B/D (ten sam szkielet, format, rozmiar planszy), z usuniętym tym, co znika wg sekcji I. NIE dokładamy nowych funkcji. Wolne miejsce po usuniętych sekcjach ma wyglądać naturalnie (treść podjeżdża do góry, odstępy jak w oryginale), bez rozciągania na siłę.
1. **MainBezAkcji** (z Main, 390×844): karta Belli bez linii „Podano śniadanie 06:50 · ogarnięte wczoraj 17:30”; karta Kasztana: przy „Nie na padok” zostaje „do 16:00 · kowal o 15:00” bez „padok do 14:30”.
2. **MojBoksBezAkcji** (z MojBoks, 390×844): bez sekcji „Ostatnio”; „Historia” tylko z 4 zdarzeniami flag z sekcji I (grupa „Dziś · wt 13.10”), bez grupy „Wczoraj”. Jedna neutralna linia informacyjna (ink-2, bez koloru statusu), np. „W tej stajni obsługa nie zapisuje w aplikacji ogarnięcia, posiłków ani padoku.” Stopka „Dane wpisuje obsługa stajni” zostaje.
3. **KartaKoniaBezAkcji** (z KartaKonia, 390×1000): w „Dziś” bez wpisu padoku (Padok B, z: Fala, Rumba, plan pn–pt, 10:00–14:30); zostają Bez śniadania, Wet 08:00, Nie na padok 14:30–16:00, Kowal 15:00. Plan karmienia bez zmian (z „Namoczyć”). W „Historia” zamiast „Dziś 07:10 · Ogarnięte” najnowsze zdarzenie flagi: „Dziś 06:02 · Potwierdzono flagę „Bez śniadania”” (albo krótszy zapis w stylu ekranu).
4. **ListaDniaBezAkcji** (z ListaDnia, Ola, 390×960): bez sekcji „Szybkie akcje” (śniadanie, padok, Ogarnięte, Cofnij, Zaznacz boksy). Zostają: „Wymaga potwierdzenia” (Bella), „Flagi dziś”, „Zadania”, nawigacja.
5. **BoksyAdminBezAkcji** (z BoksyAdmin, 390×1160): bez linii „Ogarnięte …” przy boksach; reszta bez zmian (flagi, Przenieś, Szczegóły, Konie bez boksu).
6. **TabletBoksBezAkcji** (z TabletBoks, boks 7 Kasztan, 702×936): bez sekcji „SZYBKIE AKCJE” (OGARNIĘTE, ŚNIADANIE, PADOK). Baner flagi z „POTWIERDZONA 06:02” i „Później: Nie na padok od 14:30 (kowal 15:00)” bez zmian, KARMIENIE bez zmian. „OSTATNIE AKCJE”: 4 wiersze flag z sekcji I, nagłówek „ostatnie · boks i koń”. Zasady e-ink z docs/paleta.md (kolor tylko w dużych polach, tekst czarny/biały pogrubiony na kolorze).
7. **WyswietlaczHalaBezAkcji** (z WyswietlaczHala, Hala nowa, pełny ekran, 1920×1080, korzeń 1920×900): kafle bez „Ogarnięte …” i bez padoku (także „w boksie”, „padok odwołany”); Bella: flaga „Nie na padok · dziś, cały dzień · NIEPOTWIERDZONA”; Bursztyn: „Poidło ręczne · woda 06:55”. Nagłówek hali bez chipów rutyny („✓ Śniadanie 06:50”, „Padok 10:00”), licznik „1 niepotwierdzona” zostaje. Pasek niepotwierdzonej flagi bez „padok o 10:00” (zostaje „admin powiadomiony”). „Teraz: po śniadaniu · Następny posiłek: obiad 12:00 · za 4 h 45 min” zostaje. „Dziś w stajni”: 06:30 Śniadanie · 5 koni (bez „podane”), 12:00 Obiad · 5 koni, 18:00 Kolacja · 5 koni, bez wiersza „Padoki”. „Ostatnie akcje”: 06:55 Woda · boks 5; 01:20 Nowa flaga „Nie na padok” · boks 4.
8. **PanelBoksyBezAkcji** (z PanelBoksy, Damian, 1440×900, plansza „fill”): tabela bez kolumny „Ostatnio ogarnięte” (kolumny: Boks, Koń, Klient, Aktywne flagi, Akcje); alert o Belli zostaje. Karta „Przyciski obsługi”: zostaje tylko „Woda” (poidło ręczne) i linia „Ogarnięte, posiłek i padok są wyłączone w ustawieniach tej stajni.” z linkiem „Ustawienia stajni” (→ PanelUstawieniaBezAkcji.dc.html). „Każdą akcję można cofnąć przez godzinę…” może zostać (dotyczy „Wody”).
9. **PanelUstawieniaBezAkcji** (z PanelUstawieniaStajni, Damian, 1440×900): przełączniki Ogarnięte, Posiłek, Padok WYŁĄCZONE (ten sam styl wyłączonego przełącznika co w PanelUstawieniaBrzozowa); reszta jak w Pod Lipami (potwierdzenia włączone, Derki i moczenie włączone, wszystkie flagi). Opis przy Padoku: „przycisk i plan padoku” (ten sam opis wpisz też w PanelUstawieniaStajni i PanelUstawieniaBrzozowa, żeby trzy ekrany miały ten sam układ). W macierzy widoczności wiersz „Szybkie akcje i ich stan” bez zmian w checkboxach, z dopiskiem „teraz tylko „Woda” przy poidle ręcznym” (styl dopisku jak inne opisy na ekranie).

## K. Linki w makietach wariantu
- Link do X.dc.html, dla którego istnieje XBezAkcji.dc.html, prowadzi do XBezAkcji.dc.html (PanelUstawieniaStajni.dc.html → PanelUstawieniaBezAkcji.dc.html). Pozostałe linki bez zmian.
- Przełącznik stajni w MainBezAkcji i ListaDniaBezAkcji prowadzi tam, gdzie w oryginale (wersje Brzozowej).
- `<title>` pliku i ewentualny tytuł w `$preview` dostają dopisek „· bez przycisków obsługi”.

# UZUPEŁNIENIE 3: uwagi użytkownika do pierwszej fali (13.10.2026) — NADRZĘDNE wobec planu i wcześniejszych sekcji

## L. Decyzje użytkownika (dosłownie i jak je rozumiemy)
1. „oprócz telefonów obsługujemy również maile” → logowanie w apce, panelu, na tablecie i TV numerem telefonu ALBO e-mailem; kod jednorazowy SMS-em albo e-mailem (Cognito USER_AUTH: SMS_OTP i EMAIL_OTP, e-maile przez SES); konta bez hasła. Zaproszenia na telefon (SMS) albo e-mail; wybór kanału jak w zaakceptowanej makiecie Zaproszenie.dc.html („Kanał: SMS | E-mail”). TOTP bez zmian (otwarte, nowe plansze go nie pokazują).
2. „zakładamy wyłącznie B2B. Podczas rejestracji podawany jest NIP. 1 konto, jeden NIP. Przy zakładaniu stajni już się o to nie pytamy.” → konto = konto firmy (`businesses`) z NIP (unikalny: drugi raz ten sam NIP → „Ten NIP ma już konto w eKoniuszy”). NIP podaje się raz, przy rejestracji konta firmy (nowy ekran PanelRejestracjaFirmy po PanelWitaj). „Załóż stajnię” nie pyta o działalność ani NIP.
3. „Języki tabletów to konfiguracja per tablet. Nie bawimy się w globalne.” → język tablicy ustawia się na każdym tablecie osobno (ukryte ustawienia tabletu; zapamiętany na tablecie, jak boks; przełącznik PL | UA w stopce zostaje). Żadnych języków na poziomie stajni: z „Załóż stajnię” znika „Języki tabletów”, z ERD znika `stable_locales`. Tłumaczenia nazw (np. pory posiłków po ukraińsku) zostają jako opcjonalne etykiety.
4. „Przy tworzeniu boksów od razu możliwość konfiguracji (bo w przyszłości się rozrośnie)” → po podaniu zakresu („od 1 do 6”) od razu lista boksów, każdy wiersz z ustawieniami: numer (label), poidło automatyczne/ręczne, „Więcej ustawień ›” (miejsce na kolejne). Akcja zbiorcza „Ustaw dla wszystkich”. Dotyczy „Załóż stajnię” i „Dodaj halę” (PanelDodajHale).
5. „Potwierdzenia flag - nie. Jako krok drugi konfiguracja powiadomień” → zakładanie stajni ma 2 kroki: Krok 1 „Stajnia” (bez pytania o potwierdzenia flag; nowa stajnia ma wszystko włączone, także potwierdzenia — zmienia się w Ustawieniach stajni), Krok 2 „Powiadomienia” (nowy ekran PanelZalozPowiadomienia): które zdarzenia, do kogo (Admin, Obsługa stajni), kanał SMS / e-mail; potem „Załóż stajnię” → PanelPulpitStart.
6. „Telewizor. To konto które ma specjalną rolę. Nie bawimy się w takie myki” → telewizor loguje się ZWYKŁYM kontem z rolą Wyświetlacz (`display`): telefon albo e-mail + kod, tak samo jak wszędzie. Konto zaprasza się przez „Zaproś osobę” z rolą „Wyświetlacz”. Znikają: „konta techniczne”, nazwy kont typu „wyswietlacz-korytarz”, adres techniczny do kodu, osobny formularz „Dodaj wyświetlacz”. W Ludzie wyświetlacz to członek z rolą Wyświetlacz (filtr po roli).
7. „Tylko admin ma dostęp do obu stajni z defaultu, Ola - pracownik ma dostęp tylko do stajni, do której jest przypisana (może do obu)” → Admin to rola KONTA FIRMY: ma dostęp do wszystkich stajni firmy, także nowych, bez przypisywania. Pozostałe role (Obsługa, Instruktor, Wsparcie IT, Wyświetlacz, Klient) przypisuje się per stajnia; jedna osoba może być przypisana do kilku stajni.
8. „przyda się też strona główna - przed login, gdzie poprowadzimy pseudo-blog, a przynajmniej prezentację” → publiczna strona www przed logowaniem: prezentacja produktu + blog. Nowe plansze: StronaGlowna (1440), StronaGlownaTelefon (390), StronaWpis (1440, wpis bloga).

## M. Dane demo po zmianach (kanoniczne)
- **Konto firmy:** „Stajnie Lipowe sp. z o.o.”, NIP 123-456-32-18 (fikcyjny), siedziba ul. Lipowa 12, 05-520 Konstancin-Jeziorna. Obie stajnie (Pod Lipami i Brzozowa) należą do tego konta.
- **Damian:** admin konta (właściciel) — dostęp do obu stajni; telefon +48 602 *** 145, e-mail d•••@stajnielipowe.pl (propozycja). Zarejestrował konto firmy w pn 07.09.2026 (retrospekcja: PanelLogowanie → Kod → PanelWitaj → PanelRejestracjaFirmy) i założył Stajnię Pod Lipami. W czw 01.10.2026 dodał drugą stajnię, Brzozową (PanelZalozStajnie → PanelZalozPowiadomienia → PanelPulpitStart → PanelZaprosOsobe), bez pytania o NIP.
- **Paweł:** Obsługa tylko w Stajni Brzozowej (prowadzi ją na co dzień, sam obsługuje konie); +48 601 *** 377. Nie jest już adminem. Zaprasza go Damian 01.10 (SMS).
- **Ola:** Obsługa przypisana do obu stajni (+48 607 *** 218). **Piotr:** Obsługa tylko Pod Lipami.
- **Anna:** Klientka w obu stajniach (Kasztan, Bella; Kometa). Pozostali klienci jak w sekcji B.
- **Marta** (Instruktor) i **Kuba** (Wsparcie IT): przypisani do obu stajni (propozycja). Kuba zaproszony e-mailem k•••@stajnielipowe.pl.
- **Telewizor:** konto „Telewizor korytarz”, e-mail tv.korytarz@stajnielipowe.pl (w UI zamaskowany t•••@stajnielipowe.pl), rola Wyświetlacz w Stajni Pod Lipami. Loguje się na TV e-mailem i kodem z e-maila. Brzozowa nie ma wyświetlacza.
- **Stajnia Brzozowa:** ul. Brzozowa 5, 05-500 Piaseczno; jedna hala „Hala główna” (nazwa nie jest pokazywana, bo jedna hala); boksy 1–6 z poidłem automatycznym; posiłki 06:30, 12:00, 18:00. Ustawienia (Damian zmienił je po założeniu): potwierdzenia wyłączone, bez Derki, moczenia i padoku (jak PanelUstawieniaBrzozowa).
- Przełącznik stajni: Damian i Ola mają „▾” (2 stajnie); Paweł, Piotr — sama nazwa stajni.
- Zamaskowane e-maile: „d•••@stajnielipowe.pl”. Domena serwisu nieznana: [WWW], [PANEL].

# UZUPEŁNIENIE 4: komentarze użytkownika na kanwie (13.10.2026, 11:00) — NADRZĘDNE
## N. Decyzje
1. **Telewizor** („ni chuja nie będziesz wiedzieć, że to telewizor”): strona nie wie, że to telewizor. TV otwiera ZWYKŁĄ stronę logowania panelu ([PANEL], bez osobnego adresu /wyswietlacz i bez ekranu „Zaloguj telewizor”). Loguje się kontem z rolą Wyświetlacz (e-mail albo telefon + kod), a po zalogowaniu panel sam pokazuje widok tablicy (WyswietlaczCentralny), bo tak każe rola. Plansze WyswietlaczLogowanie i WyswietlaczKod = ta sama strona co PanelLogowanie / PanelLogowanieKod, tylko z wybranym E-mail i kontem t•••@stajnielipowe.pl (bez słowa „telewizor”).
2. **Wybór stajni na tablecie** („po co to”): osobny ekran TabletWyborStajni znika. Po zalogowaniu od razu wybór boksu; gdy konto jest przypisane do kilku stajni, lista boksów jest pogrupowana: najpierw stajnia (np. przełącznik „STAJNIA POD LIPAMI | STAJNIA BRZOZOWA”), potem hale. Stajnia tabletu wynika z wybranego boksu. W ukrytych ustawieniach nie ma osobnego wiersza „STAJNIA”.
3. **Bez komentarzy objaśniających w interfejsie** („po co te komentarze”; wcześniej też „na chuj te komentarze pod spodem”): żadnych dopisków typu „nie widać na tablicy”, „zapisany tylko na tym tablecie”, „tylko ten tablet”, „Wybór zapisze się…”, „Boks zmienisz potem…”. Zostają tylko etykiety i wartości potrzebne do działania.
4. **Bez bloga** („od razu implikuje jakiś pseudo CMS — poza scope”): strona www to sama prezentacja produktu. StronaWpis znika, z StronaGlowna i StronaGlownaTelefon znika sekcja „Blog” i pozycja „Blog” w menu.
5. **Bez drobnych „zalet” w hero** („po co to — nikogo to nie obchodzi”): z hero strony www znikają plakietki typu „konto firmy z NIP-em”, „kilka stajni na jednym koncie”, „logowanie kodem, bez hasła” (także w wersji na telefon). Ogólnie na stronie www mniej drobnego tekstu, więcej konkretu.
6. **Bez pustych zdań marketingowych** („bez sensu w chuj” przy „Każdy widzi to, czego potrzebuje w swojej pracy…”): na stronie www wycinamy ogólniki i wstępy do sekcji. Zostają krótkie, konkretne nagłówki i treść o tym, co produkt robi (flagi z godzinami, tablet przy boksie, telewizor, panel).
7. **Bez treści instruktażowych na www** („po co to — to bardziej tutorialki w ramach CMS dodamy” przy „NIP podajesz raz, przy rejestracji…”; „PO CO TO” przy „Tablet e-ink przy boksie: czytelny jak…”): strona www nie tłumaczy, jak działa rejestracja, NIP, konta, tablety ani e-ink. Takie rzeczy będą kiedyś tutorialami w CMS (poza zakresem). Zostaje: hero (nazwa, hasło, jedno zdanie, CTA), krótka prezentacja czterech ekranów (apka, tablet, telewizor, panel) z obrazem i jednym zdaniem każdy, przykład flag z godzinami, kontakt/CTA, stopka.
8. **Strona www ma być prosta i czytelna** („To nie wygląda jak Z ŻYCIA STAJNI. Ogólnie zbyt skomplikowana strona. Ma być prosto, czytelnie.”): radykalne uproszczenie. Maksymalnie 4 bloki: (1) hero: EQUENOR + hasło, jedno zdanie, przycisk „Załóż konto firmy” i „Zaloguj się”, jeden duży obraz produktu; (2) cztery ekrany: apka, tablet przy boksie, telewizor, panel — każdy obraz + nazwa + jedno krótkie zdanie; (3) jeden przykład „flaga z godzinami” (prosty, wizualny); (4) stopka z kontaktem. Bez sekcji „Z życia stajni”, „Dla kogo”, osi czasu, list zalet, FAQ. Duże fonty, dużo powietrza, mało słów.
9. **Bez instrukcji podłączania telewizora** („Jak rozmawialiśmy — konto techniczne od razu będzie miało odrębny widok” przy karcie „Jak podłączyć telewizor” w PanelLudzieWyswietlacze): karta z krokami znika. Konto z rolą Wyświetlacz po zalogowaniu od razu dostaje swój widok tablicy; w Ludziach to zwykły członek z rolą Wyświetlacz (wiersz w liście, filtr roli), bez osobnej sekcji, instrukcji i objaśnień.
10. **Wsparcie IT bez ekranu w apce** („Raczej rola IT nie ma zbytnio zastosowania tutaj” przy WsparcieITStart): plansza WsparcieITStart znika. Wsparcie IT pracuje na tablecie (ukryte ustawienia, diagnostyka) i w panelu web (diagnostyka); w apce ta rola nie ma własnego widoku. (Do potwierdzenia u użytkownika: czy rola Wsparcie IT ma w ogóle zostać.)
11. **Nazwa: „Konto techniczne — Wyświetlacz”** („KONTO TECHNICZNE - Wyswietlacz” przy roli „Wyświetlacz” w PanelZaprosOsobe): konto telewizora nazywamy w interfejsie „konto techniczne” z rolą Wyświetlacz. W wyborze roli przy zaproszeniu to osobna pozycja/grupa „Konto techniczne: Wyświetlacz” (widok tablicy, tylko odczyt), oddzielona od ról osób (Klient, Obsługa, Instruktor, Wsparcie IT). W Ludziach wiersz „Telewizor korytarz · konto techniczne · Wyświetlacz”. Mechanika bez zmian (N1, N9): zwykłe logowanie, po zalogowaniu od razu odrębny widok tablicy. To koryguje L6 tylko w nazewnictwie: słowo „konto techniczne” jest pożądane; nadal bez osobnego ekranu logowania TV, bez adresu technicznego do kodu i bez instrukcji.
12. **Wsparcie IT to nie rola po stronie klienta** („Raczej niepotrzebne od strony Klienta” przy „Wsparcie IT” w liście ról zaproszenia): stajnia (nasz klient B2B) nie zaprasza Wsparcia IT i go nie konfiguruje. Wsparcie IT to zespół EQUENOR (dostęp nadajemy my, narzędziem operatora, propozycja). Znika z: listy ról w zaproszeniach (PanelZaprosOsobe, apka Zaproszenie przy następnej okazji), macierzy widoczności w Ustawieniach stajni (kolumna „Wsparcie IT” w PanelUstawieniaStajni, PanelUstawieniaBrzozowa, PanelUstawieniaBezAkcji), listy członków stajni. Zostaje: dostęp zespołu EQUENOR do ukrytych ustawień i diagnostyki tabletu oraz diagnostyki w panelu.
13. **Nie tłumaczymy NIP-u** („rynek B2B — każdy ma NIP”, przy „Konto firmy z NIP-em. Zostaniesz adminem…” w PanelWitaj): NIP to zwykłe pole w formularzu konta firmy (PanelRejestracjaFirmy), bez dopisków. Usuwamy wszędzie zdania typu „konto firmy z NIP-em”, „potem podasz NIP”, „NIP podajesz raz…”, „Jedno konto na jeden NIP…” (to ostatnie zostaje tylko jako komunikat błędu przy próbie drugiej rejestracji, nie jako stała ramka). Ogólnie (N3): w całej pierwszej fali wycinamy objaśnienia i dopiski — zostają etykiety, wartości, przyciski i komunikaty stanu.
14. **Bez ścieżki „Czekasz na zaproszenie?”** („Nope — w żadnym wypadku nie wyświetlamy czegoś takiego” przy „Poproś admina stajni o zaproszenie na +48…” w PanelWitaj): PanelWitaj nie ma bloku „Czekasz na zaproszenie?” ani próśb do admina z pokazanym numerem. Zaproszona osoba po zalogowaniu po prostu ma dostęp (zaproszenie dopasowuje się samo). PanelWitaj = imię, język, „Załóż konto firmy”. W apce BrakDostepu bez instrukcji „poproś admina…” i bez pokazywania numeru w takim kontekście: krótko „Brak dostępu do stajni” + „Zaloguj się innym kontem”.
15. **Tablety też na koncie technicznym** („konto techniczne boxów — raczej nie będziemy się logować jako Ola”): tablet przy boksie loguje się KONTEM TECHNICZNYM z rolą „Tablet” (jak telewizor z rolą „Wyświetlacz”), nie kontem osoby. Propozycja: jedno konto techniczne tabletów na stajnię, np. „Tablety Pod Lipami”, e-mail boksy@stajnielipowe.pl (w UI b•••@stajnielipowe.pl); zaprasza je admin przez „Zaproś osobę” → „Konto techniczne: Tablet przy boksie”. Skutki: TabletLogowanie/Kod logują tym kontem (E-mail wybrany); konto należy do jednej stajni, więc TabletPierwszyBoks NIE ma przełącznika stajni (tylko zakładki hal); TabletUstawienia w wierszu konta pokazuje „Tablety Pod Lipami · konto techniczne” zamiast Oli; w Ludziach konta techniczne (Telewizor korytarz · Wyświetlacz, Tablety Pod Lipami · Tablet) są w filtrze „Konta techniczne”. Akcje z tabletu nadal bez autora (`source = tablet`). Wylogowanie osoby nie dotyka tabletów; zgubiony tablet = zablokuj konto techniczne tabletów i zaloguj pozostałe ponownie (propozycja). Rozstrzyga dec. 12 (tablet nie loguje się kontem osoby).
16. **„Ogarnięte” → „Boks gotowy”** („zmień to Ogarnięte na coś lepiej brzmiącego”): akcja i stan sprzątania boksu (czyszczenie + ścielenie) nazywa się „Boks gotowy” (tablet: „BOKS GOTOWY”). Formy: przycisk i przełącznik w ustawieniach „Boks gotowy”; stan „Boks gotowy dziś 07:10” / „boks gotowy wczoraj 17:30”; licznik „Gotowe boksy: 7 z 14”; kolumna „Boks gotowy”; wpis w historii „Boks gotowy”; rzeczownik w zdaniach „sprzątanie boksów”. Kod bez zmian (`box_care_events.kind = tidy`).
