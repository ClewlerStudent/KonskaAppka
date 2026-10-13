# EQUENOR: model danych (ERD) do zatwierdzenia

> Wersja robocza v3 · 2026-10-13, po feedbacku ze stajni i uwagach z 13.10. Uwzględnia decyzje:
> - wyłącznie B2B: konto firmy z NIP (`businesses`, 1 konto = 1 NIP), NIP podaje się raz, przy rejestracji; admin konta ma dostęp do wszystkich stajni firmy;
> - każdy moduł i każdy cron to osobny mikroserwis w monorepo;
> - płatności (serwis `billing`);
> - Cognito jako serwer autoryzacji (OTP przez SMS albo e-mail i TOTP z RFC 6238);
> - pliki w S3;
> - koń i boks w relacji 0..1 do 0..1 (koń może stać bez boksu, boks bez konia);
> - bez WebSocketów i bez outboxów; zdarzenia między serwisami idą przez SNS + SQS;
> - tablet loguje się kontem technicznym z rolą Tablet (jedno na stajnię, propozycja), nie kontem osoby; boks wybiera się na tablecie przyciskiem „Zmień boks”, a wybór jest zapamiętany na tablecie (bez blokady i bez tabeli urządzeń); język tablicy też ustawia się na każdym tablecie osobno;
> - telewizor loguje się w zwykłym panelu kontem technicznym z rolą Wyświetlacz; widok tablicy wynika z roli;
> - stajnia może mieć kilka hal z boksami (`buildings`), każda z własnym adresem;
> - status flagi to tylko „potwierdzona” albo „niepotwierdzona” (w stajni, która wymaga potwierdzeń), bez śledzenia wyświetleń na tablecie;
> - boks jako kontener: obsługa zapisuje „Boks gotowy” jednym tapnięciem, a posiłki i padok jedną akcją dla całej hali; klient widzi boks swojego konia;
> - flagi mają godziny od–do i tylko one mogą wymagać potwierdzenia obsługi; czy wymagają, zależy od ustawień stajni;
> - ustawienia per stajnia: usługi (np. derki, moczenie paszy, szybkie przyciski), potwierdzenia flag, widoczność per rola i powiadomienia;
> - zakładanie stajni w 2 krokach: stajnia (z konfiguracją każdego boksu), potem powiadomienia;
> - role: Admin to rola konta firmy (wszystkie stajnie firmy); w stajni: Klient (właściciel albo dzierżawca konia), Obsługa, Instruktor oraz konta techniczne z rolą Wyświetlacz albo Tablet; Wsparcie IT to zespół EQUENOR, nie rola stajni;
> - konto firmy → stajnie → hale → boksy (`businesses`);
> - sesje tylko w Cognito, bez tabel sesji w bazie.

## Do zatwierdzenia

1. **Koń ↔ boks: najwyżej jeden do najwyżej jednego.**
   - `horses.box_id` ma unikalny indeks i dopuszcza `NULL`, więc jeden boks ma najwyżej jednego konia, a koń jest w najwyżej jednym boksie.
   - Koń może stać bez boksu, np. nowo kupiony i jeszcze nieprzypisany. Taki koń nie pojawia się na żadnym tablecie, a jego flagi widać w apce i na liście dnia obsługi.
   - Boks może stać pusty.
   - Koń, który opuścił stajnię (`status = left`), zwalnia boks. Zostaje w bazie razem z historią flag i zdrowia.
   - Zamiana dwóch koni to jedna transakcja w kodzie: koń A na chwilę bez boksu, koń B do boksu A, koń A do boksu B.
   - Każda zmiana zamyka i otwiera wpisy w `horse_box_history`. Unikalne indeksy pilnują, żeby otwarty był najwyżej jeden wpis na konia i jeden na boks.
   - Relacji pilnuje baza kluczem obcym i unikalnością, bez logiki w bazie.
2. **Tablet: konto techniczne tabletów i wybór boksu, bez tabeli urządzeń.**
   - Tablet loguje się kontem technicznym z rolą `tablet` w `stable_members` (pkt 14), nie kontem osoby. Propozycja: jedno konto tabletów na stajnię, np. „Tablety Pod Lipami” z e-mailem boksy@stajnielipowe.pl. Zaprasza je admin przez „Zaproś osobę” → „Konto techniczne: Tablet przy boksie” (`invitations.role = tablet`), a loguje się jak każde konto (pkt 6): przy pierwszym logowaniu od razu wybór boksu, potem tablica boksu; przy zapamiętanym boksie od razu tablica. Samo urządzenie nie ma wiersza w bazie; sesja i tokeny są w Cognito.
   - Jedno konto tabletów jest zalogowane na wszystkich tabletach stajni naraz.
   - Tablet pokazuje jeden boks. Wybrany boks zapamiętuje apka na tablecie. Serwer o tym wyborze nie wie, a jeden boks może być pokazywany na kilku tabletach.
   - Nie ma blokady boksu. Na tablicy jest przycisk „Zmień boks”, który otwiera listę boksów stajni konta tabletów pogrupowaną po halach. Stuknięcie w boks od razu przełącza tablet. Bez wyboru tablet po 30 s wraca do poprzedniego boksu.
   - Konto tabletów należy do jednej stajni, więc tablet nie wybiera stajni (bez osobnego ekranu wyboru stajni i bez przełącznika stajni): od razu po pierwszym zalogowaniu wybiera się boks.
   - **Język tablicy to ustawienie lokalne tabletu**, tak jak wybrany boks: ustawia się go w ustawieniach tabletu, osobno na każdym tablecie, a przełącznik PL | UA w stopce tablicy zostaje. Wybór zapamiętuje apka na tablecie i wysyła go w zapytaniu do `board` (propozycja). Bez tabeli i bez języków na poziomie stajni. Tłumaczenia nazw (np. pory posiłków po ukraińsku) to opcjonalne etykiety `*_labels` z `locale`; gdy etykiety w danym języku nie ma, tablica pokazuje nazwę po polsku (propozycja).
   - Tablica boksu nie pokazuje, kto jest zalogowany. Logowanie i wylogowanie są w ustawieniach tabletu.
   - Wylogowanie osoby, także ze wszystkich urządzeń, nie dotyka tabletów. Zgubiony tablet: admin blokuje konto tabletów w Ludziach („Zablokuj”, pkt 14), potem je odblokowuje i loguje pozostałe tablety ponownie kodem; zgubiony tablet bez nowego kodu nie wraca (propozycja).
   - Na tablecie jest zalogowane konto techniczne, a nie osoba, więc akcji z tabletu (potwierdzenie flagi, „Boks gotowy”, „Woda” przy poidle ręcznym, „Podano śniadanie” i „Wyprowadzono na padok” dla hali tego boksu) nie przypisujemy nikomu. Zapisujemy `source = tablet`, boks i czas. Osobę zapisujemy tylko przy akcjach z apki albo panelu.
   - Status flagi to tylko „potwierdzona” (z godziną) albo „niepotwierdzona”. Tak pokazują go apka, panel, tablet i wyświetlacz. Dotyczy to stajni, która wymaga potwierdzeń (pkt 16). W stajni bez potwierdzeń flaga obowiązuje od razu i nie ma statusu. Nie śledzimy, czy flaga wyświetliła się na tablecie, ani tego, czy tablet działa. Skąd przyszło potwierdzenie (`flag_acknowledgements.method`, `box_id`), zostaje tylko w danych do audytu.
   - **Blokada ekranu (dotyku).**
     - Ekran jest dotykowy, więc przycisk „Zablokuj ekran” (kłódka) włącza blokadę na czas mycia albo wycierania tabletu.
     - Zablokowana tablica dalej się odświeża i jest czytelna, ale dotyk nic nie zmienia. Pasek mówi: „przytrzymaj kłódkę 3 s, aby odblokować”.
     - Pop-up nowej flagi (tylko w stajni z potwierdzeniami) pojawia się mimo blokady; żeby ją potwierdzić, trzeba odblokować ekran.
     - Blokada sama zdejmuje się po 10 minutach (propozycja), żeby tablet nie został zablokowany na stałe.
     - Stan trzyma tylko tablet, bez tabel. To blokada dotyku, a nie blokada boksu (tej nie ma).
   - Bez tabeli urządzeń nie ma zdalnych komend, telemetrii (bateria, Wi-Fi) ani listy tabletów w panelu. Diagnostyka tabletów, jeśli będzie potrzebna, trafia do logów i metryk, nie do bazy.
   - Założenia do potwierdzenia:
     - na tablecie jest zalogowane jedno konto naraz (pilnuje apka);
     - boks może zmienić każdy, kto stoi przy tablecie;
     - ustawienia tabletu otwiera się dłuższym przytrzymaniem, żeby nikt nie trafił w nie przypadkiem;
     - po wylogowaniu tablet pamięta wybrany boks i język i wraca do nich po kolejnym logowaniu.
3. **Boks jako kontener, rutyna obsługi i widok klienta.**
   - Boks ma tylko podstawowe dane. Codzienna rutyna obsługi to trzy szybkie akcje, żeby było jak najmniej klikania:
     - **„Boks gotowy”** (sprzątanie i ścielenie razem): per boks, jedno tapnięcie na tablecie przy boksie albo zaznaczenie kilku boksów w apce i jeden zapis. Wpis trafia do `box_care_events` (`kind = tidy`). Boks ogarnia się codziennie, czasem 2–3 razy dziennie, więc wpisów może być kilka, a „Boks gotowy dziś 07:10” to najnowszy.
     - **„Podano śniadanie”** (tak samo obiad, kolację i każdą porę ze słownika `meal_slots`, np. „Siano 21:00”): jedna akcja dla całej hali w `building_routines` (`kind = meal_served`), z apki obsługi albo z tabletu przy dowolnym boksie tej hali. Etykieta przycisku idzie za porą posiłku. Koń z flagą, która wstrzymuje ten posiłek w jego godzinie, jest pomijany i wypisany jako pominięty. Nie ma potwierdzania karmienia per koń.
     - **„Wyprowadzono na padok”**: jedna akcja dla całej hali (`kind = paddock_out`), też z apki albo z tabletu. Obejmuje konie z planem padoku na teraz i pomija konie z flagą „Nie na padok” obowiązującą w tym czasie.
     - Zasada spójności: gdzie pokazujemy, kiedy coś zrobiono (posiłek, padok, sprzątanie boksu), obsługa ma też przycisk, żeby to zapisać. Tablet przy boksie ma więc trzy szybkie akcje: „Boks gotowy” (ten boks), posiłek i padok (cała hala), o ile stajnia ich nie wyłączyła (pkt 16). Klient i wyświetlacz tylko je oglądają.
     - Każdą akcję można cofnąć przez godzinę od zapisu (`cancelled_at`, propozycja), np. gdy ktoś stuknął niewłaściwą halę. Z tabletu akcja nie ma autora, z apki ma.
   - **Poidło to ustawienie boksu** (`boxes.auto_waterer`). Ustawia je admin już przy tworzeniu boksów (pkt 11) albo później w szczegółach boksu. Formularz podpowiada poidło automatyczne (wartość nadaje kod).
     - Przy automatycznym poidle znacznik wody nie wyświetla się nigdzie, bo zawsze jest w porządku.
     - Boks z poidłem ręcznym (np. wiadro, gdy automat czeka na wymianę) pokazuje na tablecie, wyświetlaczu, w apce i panelu znacznik „Poidło ręczne” z godziną ostatniego dolania. Ma też szybką akcję „Woda” (`box_care_events.kind = water`), dostępną tylko dla takiego boksu.
   - Nie ma osobnych wpisów „siano” i „karma”.
   - Pozycja planu karmienia może mieć informację „namoczyć” i ile (`feeding_plan_items.soak`, `soak_note`, np. „w 2 l wody”), jeśli stajnia ma włączone moczenie paszy (pkt 16). To wersja prosta: model karmienia jest otwartą kwestią.
   - **Historia boksu** to flagi konia (utworzenie, potwierdzenie, odwołanie) i zdarzenia z przycisków obsługi. Widzi ją klient konia, który stoi w boksie (od dnia, w którym koń do niego trafił), obsługa i admin.
   - **Tablet nie pokazuje historii**, tylko „Ostatnie akcje”: najwyżej 5 najnowszych wpisów boksu i konia, bez przewijania i bez przycisku „Cała historia”. Pełną historię widać w apce i panelu web.
   - **Klient** (rola `client`) to osoba, która przyprowadza konia do stajni: właściciel albo dzierżawca konia. Dla stajni to ten sam klient.
     - Dostęp ma przez `horse_access` (rola `client`), także przez zaproszenie (`invitations.horse_id`).
     - Widzi swojego konia i boks, w którym koń stoi, oraz ustawia i odwołuje jego flagi.
     - Osobnego najmu boksu bez konia nie ma, więc tabela `box_access` odpada.
   - **Widok klienta jest maksymalnie prosty:** kafelki flag włączonych w ustawieniach stajni, opcjonalna notatka i godziny podpowiedziane przez szablon, które można zmienić. Na ekranie „Mój boks” sekcja „Ostatnio” pokazuje tylko zdarzenia z przycisków obsługi (gdy stajnia je wyłączyła, sekcji nie ma), a „Historia” flagi (z potwierdzeniami) i zdarzenia z przycisków obsługi.
   - **Obsługa** (`staff`) może z apki i panelu web robić to samo co klient, ale dla wszystkich koni w stajni, oraz wykonuje szybkie akcje i zadania.
   - Dostęp ma ramy czasowe (`valid_from`, `valid_to`) i można go odebrać (`revoked_at`), np. gdy koń opuszcza stajnię albo kończy się dzierżawa.
   - Każde zaproszenie ma obowiązkowy termin ważności (`invitations.expires_at`, domyślny czas ustawia kod). Wygasłe zaproszenie nie dopasowuje się (pkt 6), a admin może wysłać nowe.
4. **Wyświetlacz centralny (TV z Raspberry Pi).**
   - Telewizor z Raspberry Pi otwiera w przeglądarce, w trybie kiosku, zwykłą stronę logowania panelu web, bez osobnego adresu. Strona nie wie, że to telewizor: po zalogowaniu kontem z rolą `display` panel sam pokazuje widok tablicy (wszystkie boksy), bo tak każe rola (routing po roli). Strona sama odpytuje serwer co kilka sekund, tak jak tablet.
   - Wyświetlacz loguje się kontem technicznym z rolą `display` w `stable_members`: numerem telefonu albo e-mailem i kodem z SMS-a albo e-maila, tak jak każde konto (pkt 6). Konto zaprasza admin przez „Zaproś osobę” → „Konto techniczne: Wyświetlacz” (`invitations.role = display`). Bez osobnego ekranu logowania, adresu technicznego do kodu i formularza wyświetlacza. Sesję podtrzymuje Cognito, a admin blokuje konto w Ludziach („Zablokuj”, pkt 14).
   - Rola `display` daje tylko odczyt widoku wszystkich boksów: konie, flagi, posiłki, zdarzenia przy boksie. Bez danych osobowych (telefony, e-maile) i bez zapisu.
   - Przy kilku halach strona pokazuje wszystkie hale, każdą w osobnej sekcji.
   - Każda sekcja hali ma przycisk „Pełny ekran”. Hala zajmuje wtedy cały ekran, większymi kaflami, a pasek pilnych flag i panel boczny pokazują tylko tę halę. Przycisk „Wszystkie hale” wraca do widoku wszystkich.
   - Wybór widoku zapamiętuje przeglądarka na tym telewizorze, tak jak tablet pamięta wybrany boks. Telewizor w hali głównej ustawia się więc raz na pełny ekran tej hali (myszką przy instalacji albo pilotem przez HDMI-CEC). Serwer o tym nie wie i nie potrzeba tabeli wyświetlaczy.
   - Jedno konto `display` może obsłużyć wszystkie telewizory stajni. Admin może też zaprosić osobne konto na każdy telewizor (np. osobny e-mail), jeśli chce blokować je pojedynczo.
   - Gdy boksów jest dużo, strona zmniejsza kafle do wersji skróconej (numer, koń, flaga, posiłki). Jeśli dalej się nie mieszczą, przełącza strony co 20 s. Pasek pilnych flag zostaje zawsze na górze. W widoku wszystkich hal obejmuje wszystkie hale, a na pełnym ekranie tylko tę halę.
   - Nie potrzeba nowych tabel.
5. **Jedna baza: schemat `app` dla wszystkich serwisów i osobny schemat `audit`.**
   - Każda tabela ma jeden serwis-właściciela (tabela niżej). Tylko właściciel do niej pisze; pozostałe serwisy mogą ją czytać.
   - Klucze obce są normalne, także między tabelami różnych serwisów.
   - Dzięki temu nie ma replik ani synchronizacji danych między serwisami. Na przykład `board` składa stan tablicy, czytając wprost konie, flagi i plany karmienia.
   - Serwisy czytają te same tabele, więc mają jeden schemat `app`. Definicja tabel i migracje leżą w jednym pakiecie monorepo (`packages/db`), a serwisy importują z niego typy tabel.
   - Audit jest w osobnym schemacie `audit` (`audit_log`, `audit_log_changes`), bez kluczy obcych do `app`.
     - Każdy serwis dopisuje wpis audytu w tej samej transakcji co zmiana, więc nie da się zmienić danych bez śladu i nie potrzeba do tego kolejki.
     - Role bazy serwisów mają w schemacie `audit` tylko `INSERT`, bez odczytu, zmiany i usuwania.
     - Czytać i sprzątać po okresie retencji może tylko serwis `audit`.
   - Koszt: zmiana kolumny czytanej przez inne serwisy musi być zgodna wstecz (najpierw dodać, potem usunąć).
6. **Tożsamość w Cognito.**
   - `users.cognito_sub` wiąże nasz profil z kontem w puli Cognito.
   - Kody OTP (SMS, e-mail, TOTP), sesje i tokeny trzyma Cognito; konta nie mają hasła. Cognito jest też źródłem prawdy dla telefonu i e-maila, a `users` trzyma ich kopię do powiadomień.
   - Logowanie numerem telefonu albo e-mailem, bez hasła: kod jednorazowy przychodzi SMS-em albo e-mailem. Zaproszenie idzie na numer telefonu (SMS) albo na e-mail (`invitations.channel`).
   - Serwis `identity` tworzy wiersz `users` przy pierwszym uwierzytelnionym żądaniu (upsert po `cognito_sub`).
   - Usunięcie konta to pseudonimizacja w `users` i usunięcie konta w Cognito.
   - Zaproszenie nie ma własnego tokenu ani ekranu „Przyjmij”: po zalogowaniu przez Cognito serwis `access` dopasowuje zweryfikowany telefon albo e-mail z tokenu do `invitations.target` i od razu zapisuje członkostwo (klientowi także dostęp do konia) oraz `accepted_at`. Wygasłe (`expires_at`) albo odwołane (`revoked_at`) zaproszenie się nie dopasowuje. Nowe konto podaje potem tylko imię i język.
   - Tablet wysyła token konta tabletów, identyfikator (`id`) wybranego boksu i język tablicy (pkt 2).
   - Rejestracja konta firmy to pierwsze logowanie (telefon albo e-mail i kod) i formularz z NIP-em (pkt 15).
7. **Pliki w S3.**
   - `files` trzyma metadane, `s3_key` (z prefiksem `stable_id/`) i właściciela (`owner_service`, `owner_id`).
   - Link do pobrania wydaje tylko serwis-właściciel po sprawdzeniu uprawnień. Na przykład `health` sprawdza widoczność wpisu i dostęp do konia, a dopiero potem prosi `files` o krótko ważny presigned URL.
8. **Bez WebSocketów.**
   - Tablet sam regularnie, co kilka sekund, pyta serwis `board` o stan wybranego boksu. Serwer nie trzyma żadnego stanu tablic.
   - `board` nie ma własnych tabel: przy każdym zapytaniu składa odpowiedź z danych w bazie. `ETag` to hash odpowiedzi, więc gdy nic się nie zmieniło, tablet dostaje `304`.
   - Między serwisami: kolejki **SNS + SQS**, bez outboxów.
     - Serwis po zatwierdzeniu transakcji publikuje zdarzenie do tematu SNS (jeden temat na rodzaj zdarzenia).
     - Każdy konsument ma własną kolejkę SQS z kolejką błędów (DLQ).
     - SQS może dostarczyć wiadomość więcej niż raz, więc obsługa jest idempotentna: zapisy opierają się na unikalnych kluczach w tabelach docelowych, bez osobnej tabeli `inbox`.
   - Bez outboxu zdarzenie może zginąć, gdy serwis padnie między zapisem w bazie a publikacją. Dlatego żadna krytyczna ścieżka nie opiera się wyłącznie na zdarzeniu:
     - eskalacje liczy cron prosto z bazy;
     - `board` przy odpytywaniu porównuje wersje w bazie;
     - cron uzgadniający poprawia skutki `horse.left`.
   - E-maile z `notifications` mogą iść przez SES (adapter `EmailSender`).
9. **Sloty posiłków i padoki należą do `care`, a kryte ujeżdżalnie (`arenas`) do `rides`**, bo te serwisy z nich korzystają. Ujeżdżalnie to co innego niż hale z boksami (`buildings`).
10. **Płatności (`billing`).**
   - Płaci stajnia: ma konto rozliczeniowe (dane do faktury) i subskrypcję planu. Czy zamiast niej ma płacić konto firmy, zob. „Otwarte kwestie”.
   - NIP pochodzi z konta firmy: kod kopiuje `businesses.tax_id` do `billing_accounts.tax_id` przy zakładaniu stajni, razem z nazwą, adresem siedziby i e-mailem do faktur (propozycja). NIP-u nie wpisuje się w stajni ani w płatnościach.
   - Comiesięczny cron zapisuje zużycie (np. boksy z koniem). Z niego powstaje faktura z pozycjami, a płatności przychodzą od dostawcy przez webhooki.
   - Kwoty są w groszach (`bigint`).
   - Status subskrypcji steruje `stables.status`: brak płatności daje `suspended`.
   - Dostawca płatności i system faktur (KSeF) są do wyboru; w modelu są tylko identyfikatory zewnętrzne.
11. **Hale, czyli budynki z boksami.**
   - Stajnia może mieć kilka hal. Hala to wiersz w `buildings` (nazwa nadana przez admina, kolejność, aktywność). Każdy boks należy do jednej hali (`boxes.building_id`, wymagane).
   - Hala ma własny adres (`address_line1`, `address_line2`, `postal_code`, `city`, `country_code`), bo hale jednej stajni mogą stać pod różnymi adresami. Adres widać w panelu przy hali i w szczegółach boksu.
   - Nowa stajnia dostaje od kodu jedną halę. Dopóki stajnia ma jedną halę, apka, panel, tablet i wyświetlacz nie pokazują podziału na hale.
   - Adres pierwszej hali to adres podany przy zakładaniu stajni, a jej boksy podaje się w pierwszym kroku „Załóż stajnię” (pkt 17).
   - **Boksy konfiguruje się od razu przy tworzeniu** („Załóż stajnię” i „Dodaj halę”):
     - po podaniu zakresu numerów („od 1 do 6”) widać listę boksów, a każdy wiersz ma swoje ustawienia: numer (`boxes.label`) i poidło automatyczne albo ręczne (`boxes.auto_waterer`); akcja „Ustaw dla wszystkich” zmienia ustawienie we wszystkich wierszach;
     - „Więcej ustawień” to miejsce na kolejne ustawienia boksu. Dojdą jako kolumny `boxes` i będą w tym samym wierszu przy tworzeniu i w szczegółach boksu.
   - Nową halę dodaje admin w panelu web: Boksy i konie → „Dodaj halę”.
     - Podaje nazwę i adres (może skopiować adres innej hali).
     - Potem wybiera jedno: dodaje nowe boksy z zakresu numerów i od razu konfiguruje każdy (wyżej; każda hala numeruje boksy od siebie, np. od 1), przenosi istniejące boksy albo zostawia halę pustą.
     - Serwis `stable` zapisuje halę i boksy w jednej transakcji i dopisuje audyt.
     - Innym serwisom nic nie trzeba wysyłać: tablet („Zmień boks”) i wyświetlacz widzą nową halę przy najbliższym odpytaniu.
   - Usunąć można tylko pustą halę. Halę z boksami trzeba najpierw opróżnić (przenieść boksy) albo wyłączyć (`active = false`).
   - Boksy numeruje się w obrębie hali, więc każda hala może mieć swój boks 1. Numer (`boxes.label`) nie jest unikalny: baza tego nie pilnuje, a kod nie blokuje powtórzeń. Boks rozpoznajemy po `id`. Gdy stajnia ma więcej niż jedną halę, interfejs zawsze pokazuje halę razem z numerem, np. „Hala nowa · boks 4”.
   - Przeniesienie boksu do innej hali (np. po przebudowie) to zmiana `building_id`. Koń, historia i zdarzenia zostają przy boksie.
   - Hale widać na liście boksów w apce i panelu (grupy i filtr), przy wyborze boksu na tablecie (zakładki hal) i na wyświetlaczu centralnym (sekcje hal, każda z opcją pełnego ekranu).
   - Hale z boksami to co innego niż kryte ujeżdżalnie do jazd (`arenas` w serwisie `rides`).
12. **Flagi: godziny i potwierdzenia.**
   - Potwierdzenia obsługi mogą wymagać wyłącznie flagi, czyli wyjątki od rutyny („Bez śniadania”, „Nie na padok”, „Derka”, „Leki” itd.). Czy wymagają, zależy od ustawień stajni: przełącznik „Flagi wymagają potwierdzenia” (`stable_settings.flags_require_ack`, pkt 16).
     - Włączony (np. duża stajnia z wieloma stajennymi): przepływ nowa flaga → pop-up na tablecie → potwierdzona.
     - Wyłączony (np. właściciel sam jest stajennym): flaga obowiązuje od razu. Nie ma pop-upu do potwierdzenia, statusu oczekiwania u klienta ani eskalacji. Flaga od razu stoi na tablicy boksu.
     - Przy zapisie flagi kod kopiuje bieżące ustawienie do `horse_flags.requires_ack`, więc zmiana przełącznika nie zmienia flag, które już trwają.
   - **Godziny są obowiązkowe i działają naprawdę:**
     - każda flaga ma początek i koniec: `horse_flags.valid_from` i `valid_to`, oba wymagane, czas w strefie stajni. „Do odwołania” nie ma;
     - szablon podpowiada okno (`flag_templates.default_window`): „Bez śniadania” dziś 06:00–10:00, „Nie na padok” w godzinach padoku, „Derka” 16:00–08:00. Klient może je zmienić;
     - skutki liczy kod z godzin, przy każdym zapytaniu `board` i przy akcjach zbiorczych. `suspend_meal` wstrzymuje tylko posiłki, których godzina wypada w oknie flagi. `cancel_paddock` skraca albo odwołuje padok tylko w oknie flagi;
     - przykład: wet o 8:00 i kowal o 15:00, więc flagi „Bez śniadania 06:00–10:00” i „Nie na padok 14:30–16:00” pozwalają koniowi wyjść na padok między wizytami (10:00–14:30);
     - tablet, wyświetlacz i apka pokazują godziny przy fladze, a flagę, która zacznie się później, oznaczają „od 14:30”.
   - **Flaga „Derka”** (szablon `derka`) ma wariant `horse_flags.variant`: `on` znaczy zakładać, `off` nie zakładać. Jest tylko w stajni, która oferuje zakładanie derek (szablon aktywny, pkt 16).
   - Termin potwierdzenia i eskalacje (`ack_deadline_at`, `warn_at`, `notify_at`) liczy się od początku okna flagi i tylko dla flag z `requires_ack`.
13. **Zadania jednorazowe.**
   - Zadanie wpisuje admin (zarządca albo właściciel, rola konta firmy z pkt 14), np. „Poidło w boksie 5 do wymiany”. Może wskazać halę, boks albo konia.
   - Stajenny w apce sam wybiera zadanie z listy i bierze je na siebie („Biorę”: `taken_by`, `taken_at`), a potem oznacza jako zrobione (`done_by`, `done_at`). Tablet zadań nie obsługuje, bo potrzebna jest osoba.
   - Zadań cyklicznych nie ma, więc odpadają `task_occurrences` i cron `task-occurrence-generator`. Codzienną rutynę obsługują szybkie akcje z pkt 3.
14. **Role.**
   - **Admin to rola konta firmy**, a nie stajni: tabela `business_admins` (`business_id`, `user_id`, `created_at`; PK złożony `business_id`, `user_id`) (propozycja).
     - Admin konta (właściciel albo zarządca) ma dostęp do wszystkich stajni firmy, także nowych, bez przypisywania. Nie potrzebuje wiersza w `stable_members`.
     - Wszystko, co jest „tylko dla admina” (ustawienia stajni, reguły powiadomień, hale, poidło, zadania, zaproszenia), może admin konta, do którego należy stajnia (`stables.business_id`). Admin innego konta firmy tej stajni nie widzi.
     - Pierwszego admina zapisuje rejestracja konta firmy (pkt 15). Dodawanie kolejnych adminów konta jest poza PoC (propozycja).
   - Pozostałe role przypisuje się per stajnia w `stable_members.role`: role osób `staff` (obsługa), `instructor`, `client` (klient, pkt 3) oraz role kont technicznych `display` (telewizor, pkt 4) i `tablet` (tablety przy boksach, pkt 2). Jedna osoba może mieć członkostwa w kilku stajniach (jedno na stajnię: `stable_id` z `user_id` są unikalne), np. obsługa w dwóch stajniach tej samej firmy; apka przełącza wtedy stajnię.
   - **Konto techniczne** to konto z rolą `display` albo `tablet`: w zaproszeniu osobna grupa ról, w Ludziach filtr „Konta techniczne”. Osobnej tabeli nie ma, to zwykłe konto w Cognito i `users`. Loguje się jak każde konto (pkt 6), a po zalogowaniu od razu ma swój widok według roli: `display` tablicę wszystkich boksów (pkt 4), `tablet` wybór boksu przy pierwszym logowaniu, potem tablicę boksu, a przy zapamiętanym boksie od razu tablicę (pkt 2). Ma członkostwo w jednej stajni i nie łączy się z rolami osób (propozycja).
   - **„Zablokuj” przy koncie technicznym** (Ludzie, tylko admin konta) znaczy to samo dla telewizora i tabletów: `stable_members.active = false` i global sign-out tego konta w Cognito (unieważnia refresh tokeny na wszystkich urządzeniach). Przy najbliższym odpytaniu urządzenie dostaje 403 i pokazuje ekran blokady bez starych danych (tablet: „TO KONTO NIE MA JUŻ DOSTĘPU DO TEJ STAJNI”, telewizor: „WYŚWIETLACZ ZABLOKOWANY”), a gdy access token wygaśnie, ekran logowania. „Odblokuj” przywraca `active`; urządzenia trzeba zalogować ponownie kodem, a potem wracają do zapamiętanego boksu, języka albo widoku (propozycja).
   - **Wsparcie IT** (dawniej „serwisant”) to wewnętrzny zespół EQUENOR, a nie rola stajni: stajnia go nie zaprasza ani nie konfiguruje, więc nie ma go w `stable_members`, `invitations` ani `stable_role_features`. Dostęp nadaje EQUENOR narzędziem operatora, bez tabeli w schemacie `app` (propozycja); w audycie to `actor_type = operator`. Zakres: ukryte ustawienia i diagnostyka tabletu oraz diagnostyka w panelu web dla zespołu EQUENOR (narzędzie operatora, poza panelem stajni), bez danych koni i klientów; w apce Wsparcie IT nie ma widoku.
15. **Konto firmy (B2B) → stajnie → hale → boksy.**
   - Zakładamy wyłącznie konta firm. Konto firmy to wiersz w `businesses`:
     - `tax_id`: NIP, z unikalnym indeksem, więc 1 konto = 1 NIP. Drugą rejestrację z tym samym NIP-em odrzuca indeks, a panel mówi „Ten NIP ma już konto w EQUENOR”;
     - `name`: nazwa firmy;
     - adres siedziby: `address_line1`, `address_line2`, `postal_code`, `city`, `country_code` (jak adres hali);
     - `invoice_email`: e-mail do faktur.
   - Konto firmy zakłada się samodzielnie przy rejestracji: po pierwszym logowaniu osoba podaje NIP i dane firmy, a serwis `stable` zapisuje w jednej transakcji `businesses` i ją jako admina konta (`business_admins`). NIP podaje się raz.
   - Stajnie dodaje admin konta („Załóż stajnię”, pkt 17) bez ponownego pytania o NIP i dane firmy: nowa stajnia dostaje `business_id` konta.
   - Jedno konto firmy może mieć kilka stajni (`stables.business_id`). Dane i izolacja zostają na poziomie stajni (`stable_id`); wyjątkiem jest admin konta, który ma dostęp do wszystkich stajni firmy (pkt 14). Płatności zostają przy stajni, a NIP pochodzi z konta firmy (pkt 10, „Otwarte kwestie”).
16. **Ustawienia stajni (konfiguracja per stajnia).**
   - Stajnie działają różnie: jedna nie oferuje derek ani moczenia paszy, inna ma pełną opcję. Właściciel, który sam jest stajennym, nie potwierdza flag, a stajnia ze 100 boksami i 10 stajennymi tego wymaga. Dlatego część zachowania aplikacji ustawia admin konta (właściciel albo zarządca) na ekranie „Ustawienia stajni” w panelu web.
   - Ustawienia są per stajnia (`stable_id`), a nie dla całego konta firmy. Na PoC są to przełączniki gotowych opcji, bez własnych reguł:
     - **Potwierdzenia:** „Flagi wymagają potwierdzenia” (`stable_settings.flags_require_ack`), skutki w pkt 12;
     - **Usługi:**
       - zakładanie derek, czyli flaga „Derka” (`flag_templates.active` szablonu `derka`);
       - moczenie paszy, czyli „namoczyć” i ile (`stable_settings.soak_enabled`);
       - pozostałe flagi, każda osobno (`flag_templates.active`);
       - szybkie przyciski obsługi: „Boks gotowy” (`tidy_enabled`), posiłek (`meal_served_enabled`) i padok (`paddock_out_enabled`). „Woda” zależy od poidła boksu (pkt 3);
     - **Widoczność per rola** (`stable_role_features`): admin zaznacza, co widzą role `client`, `staff`, `instructor`, `tablet` i `display`. Funkcje to stała lista (sekcja „Słowniki”). Admin widzi wszystko. `tasks` i `box_history` nie dotyczą tabletu, bo tablet nie pokazuje zadań (pkt 13) ani historii (pkt 3): w macierzy te pola tabletu są nieaktywne, a w `stable_role_features` nie ma dla nich wierszy roli `tablet`.
     - **Powiadomienia** (`notification_rules`): które zdarzenia, do kogo i jakim kanałem; ustawia się je w drugim kroku zakładania stajni (pkt 17).
   - **Wyłączona opcja znika:** kafelek flagi, „namoczyć”, przycisk albo sekcja nie pokazują się klientowi, obsłudze, na tablecie ani na wyświetlaczu. Zgodnie z zasadą spójności z pkt 3 znika też stan tego, czego nie da się zapisać.
     - Wyłączony szybki przycisk znika razem ze stanem wykonania, np. „Boks gotowy dziś 07:10”, „podane 06:40” albo „Wyprowadzono na padok wczoraj 10:05”. Plan karmienia zostaje, bo to osobna funkcja (widoczność `feeding_plan`), a godziny posiłków zostają jako plan dnia (np. „Następny posiłek: obiad 12:00”).
     - Wyłączony „Padok” chowa też plan padoku (godziny i towarzyszy) wszędzie: na tablecie, wyświetlaczu i w apce (lista koni, karta konia), bo stajnia nie prowadzi wtedy padoków w aplikacji. Flaga „Nie na padok” zostaje, jeśli jest włączona; podpowiada wtedy okno „dziś, cały dzień” (propozycja).
     - „Woda” przy poidle ręcznym zostaje, bo nie ma przełącznika (pkt 3). Sekcja „Szybkie akcje” na tablecie znika, gdy nie ma w niej żadnego przycisku; w boksie z poidłem ręcznym zostaje z samą „Wodą”.
   - Zmiana działa przy najbliższym odpytaniu (apka, tablet, wyświetlacz). Wpisy już zapisane zostają w „Historii” (apka, panel web), ale „Ostatnie akcje” na tablecie i wyświetlaczu oraz „Ostatnio” w apce pomijają zdarzenia wyłączonych przycisków, bo to też stan wykonania.
   - Nowa stajnia dostaje od kodu ustawienia domyślne: wszystko włączone, łącznie z potwierdzeniami. „Załóż stajnię” nie pyta o potwierdzenia flag; zmienia się je potem w „Ustawieniach stajni”. Domyślna widoczność per rola jest otwarta: wszystko także dla tabletu (poza `tasks` i `box_history`, które go nie dotyczą) i wyświetlacza czy węższa, np. jak w Stajni Pod Lipami (development.md §5 pkt 27).
17. **Zakładanie stajni i powiadomienia.**
   - „Załóż stajnię” (panel web, admin konta) ma 2 kroki, a zapis jest na końcu drugiego:
     - Krok 1 „Stajnia”: dane stajni, adres pierwszej hali i boksy z konfiguracją każdego boksu (pkt 11). Bez pytania o NIP i dane firmy (są w koncie firmy), języki tabletów (pkt 2) i potwierdzenia flag (pkt 16).
     - Krok 2 „Powiadomienia”: które zdarzenia, do kogo (Admin, Obsługa stajni) i jakim kanałem (SMS, e-mail).
     - „Załóż stajnię” zapisuje w jednej transakcji serwisu `stable` stajnię, ustawienia domyślne (pkt 16), halę, boksy i reguły powiadomień, z audytem. Potem panel otwiera pulpit nowej stajni.
   - **Reguły powiadomień** to tabela `notification_rules` (propozycja): `stable_id`, `event`, `recipient_role` (`admin` | `staff`), `channel` (`sms` | `email`), `enabled`; PK (`stable_id`, `event`, `recipient_role`, `channel`).
     - Kod wstawia przy zakładaniu stajni wiersz dla każdej kombinacji, z `enabled` według wyboru z kroku 2 (bez `DEFAULT`). Później reguły zmienia admin konta w „Ustawieniach stajni” (propozycja).
     - Zdarzenia (`event`) to stała lista z sekcji „Słowniki”. `flag_unacknowledged` (eskalacja) działa tylko dla flag z `requires_ack`, więc w stajni bez potwierdzeń nic nie wysyła.
     - Termin eskalacji zostaje w `stable_settings.notify_offset_min`; reguła mówi tylko, do kogo i jakim kanałem.
     - Tabela należy do `stable`, bo powstaje w tej samej transakcji co stajnia, tak jak `stable_settings`.
   - **`notifications` wysyła według reguł:** dla zdarzenia bierze włączone wiersze tej stajni i wyznacza odbiorców: `admin` to admini konta firmy, do którego należy stajnia (`business_admins`), a `staff` to aktywni członkowie z rolą `staff` w tej stajni. Adres bierze z kopii w `users` (`phone_e164` albo `email`); osobę bez adresu dla danego kanału pomija (propozycja). `dedupe_key` pilnuje, żeby ta sama wiadomość nie poszła dwa razy.
     - Źródła zdarzeń: eskalację liczy cron `escalation-scheduler`, flagę od klienta, przyjęte zaproszenie, wystawioną fakturę i nieudaną płatność publikują serwisy-właściciele (SNS + SQS), a wygasłe zaproszenia znajduje cron `invitation-expiry-notifier` (propozycja).

## Otwarte kwestie

1. **Model karmienia:** pudełko (porcja przygotowana wcześniej), namaczanie (co, w ilu litrach wody, jak długo), ile. Dziś jest tylko „namoczyć” i ile przy pozycji planu karmienia.
2. **Ekran dotykowy z blokadą czy zaprogramowany fizyczny przycisk przy boksie.** Dziś tablet ma blokadę dotyku na czas mycia (pkt 2). Alternatywą jest fizyczny przycisk, np. „Boks gotowy”, zamiast dotyku.
3. **Płatności, faktury, KSeF:** czy to nie za dużo na PoC. Na razie bez rozbudowy: model `billing` zostaje jak jest, na poziomie stajni, a NIP pochodzi z konta firmy (pkt 10). Kto płaci: stajnia (osobna subskrypcja i faktura za każdą stajnię, jak dziś) czy konto firmy (jedna subskrypcja i faktura na NIP za wszystkie stajnie)?

## Zasady wspólne

- **Identyfikatory i typy:**
  - identyfikatory UUIDv7 nadaje kod;
  - czas w `timestamptz` (UTC), godziny lokalne w `time` ze strefą stajni;
  - statusy jako `text` walidowany w kodzie.
- **Izolacja stajni:** każda tabela danych stajni ma `stable_id`, a filtruje po nim kod. Tabele-rodzice mają `UNIQUE (stable_id, id)`, a klucze obce są wielokolumnowe (`stable_id`, `x_id`), więc koń nie trafi do boksu innej stajni. Tabele konta firmy (`businesses`, `business_admins`) nie mają `stable_id`; admin konta widzi stajnie swojej firmy przez `stables.business_id`.
- **Wersje:** tabele edytowalne mają `version` (`bigint`, zwiększany w kodzie) i `updated_at`. Wersja służy do `If-Match` przy edycji i do `ETag` tablicy.
- **Czego nie rysujemy:** `version`, `created_at` i `updated_at` pomijamy na diagramach.
- **Dozwolone w bazie:**
  - PK;
  - FK bez akcji kaskadowych (zależne wiersze usuwa kod);
  - `NOT NULL`;
  - unikalności, także częściowe;
  - indeksy.
- **Zakazane w bazie:** RLS, triggery, funkcje, `CHECK`, `DEFAULT`, sekwencje i identity, kolumny generowane, enumy, `jsonb` i tablice.
- **Dane wielowartościowe w osobnych tabelach**, np. etykiety w językach (`*_labels`), pozycje planu karmienia, towarzysze na padoku, ceny planu, zmienione pola w audycie. Dni tygodnia zapisujemy jako maskę bitową `days_mask` (`smallint`, pn = 1 … nd = 64).

## Mikroserwisy i tabele, które do nich należą

| Mikroserwis | Kolor na ERD | Tabele (tylko ten serwis do nich pisze) |
|---|---|---|
| `identity` | różowy | `users` |
| `access` | fioletowy | `stable_members`, `horse_access`, `invitations` |
| `stable` | niebieski | `businesses`, `business_admins`, `stables`, `stable_settings`, `stable_role_features`, `notification_rules`, `buildings`, `boxes`, `horses`, `horse_box_history` |
| `board` | — (bez tabel) | brak; składa stan tablicy z tabel innych serwisów przy każdym zapytaniu tabletu |
| `flags` | czerwony | `flag_templates`, `flag_template_labels`, `horse_flags`, `flag_acknowledgements`, `flag_escalations` |
| `care` | zielony | `meal_slots`, `meal_slot_labels`, `feeds`, `paddocks`, `feeding_plans`, `feeding_plan_items`, `building_routines`, `box_care_events`, `paddock_plans`, `paddock_plan_companions` |
| `health` | limonkowy | `health_events`, `health_attachments` |
| `rides` | bursztynowy | `arenas`, `rides` |
| `tasks` | pomarańczowy | `tasks` |
| `billing` | żółty | `billing_accounts`, `billing_plans`, `billing_plan_prices`, `subscriptions`, `usage_snapshots`, `invoices`, `invoice_lines`, `payments`, `payment_provider_events` |
| `files` | szary | `files` (metadane; treść w S3) |
| `releases` | grafitowy | `app_releases`, `app_release_targets` |
| `notifications` | purpurowy | `notifications` |
| `audit` | — (osobny diagram) | `audit_log`, `audit_log_changes` (schemat `audit`; wpisy dodają wszystkie serwisy, czyta i usuwa tylko `audit`) |

**Crony to osobne mikroserwisy bez własnych tabel.** Czytać mogą wprost z bazy, ale zmiany zlecają serwisom-właścicielom przez API albo kolejki. Idempotencję zapewniają unikalności po stronie tych serwisów, np. `notifications.dedupe_key`.

| Cron | Serwisy | Co robi |
|---|---|---|
| `escalation-scheduler` | `flags`, `notifications` | Znajduje flagi z `requires_ack`, minionym `warn_at` albo `notify_at` i bez potwierdzenia; powiadomienie idzie według reguły `flag_unacknowledged` |
| `invitation-expiry-notifier` (propozycja) | `access`, `notifications` | Znajduje zaproszenia po `expires_at`, nieprzyjęte i nieodwołane, i zleca powiadomienie według reguły `invitation_expired` |
| `health-due-reminders` | `health`, `notifications` | Przypomnienia o zbliżających się wizytach |
| `files-gc` | `files` | Usuwa z S3 pliki `pending` starsze niż 24 h i pliki `deleted` po retencji |
| `billing-usage-snapshot` | `billing` (czyta `horses`) | Raz w okresie zapisuje zużycie: boksy z koniem |
| `billing-invoicing` | `billing`, `files` | Wystawia faktury z pozycjami, PDF do S3, przekazuje do systemu faktur |
| `billing-dunning` | `billing`, `notifications` | Przypomnienia o zaległych płatnościach, po terminie `past_due`, potem `suspended` |
| `horse-left-reconciler` | `access`, `flags`, `care`, `tasks`, `rides` | Szuka koni `left` z otwartymi dostępami, flagami albo planami i zleca ich zamknięcie właścicielom (na wypadek zgubionego zdarzenia) |
| `retention-pruner` | wszystkie | Woła endpoint `prune` każdego serwisu, bo usuwać może tylko właściciel tabeli |

## Współpraca serwisów

- **Odczyt:** każdy serwis może czytać tabele innych serwisów. `board` składa stan tablicy z `stables`, `buildings`, `boxes`, `horses`, `horse_flags`, `feeding_plans` z pozycjami, `building_routines`, `box_care_events`, `paddock_plans` i `health_events` (sam typ i termin). Uprawnienia sprawdza w `business_admins`, `stable_members` i `horse_access`.
- **Zapis:** tylko przez serwis-właściciela, czyli przez jego REST albo jego kolejkę SQS. Zapisy z tabletu i apki (potwierdzenia flag, szybkie akcje obsługi) idą synchronicznym REST, bo klient potrzebuje wyniku dla każdego zdarzenia.
- **Zdarzenia** (SNS + SQS, publikowane po zatwierdzeniu transakcji) służą reakcjom, a nie kopiowaniu danych:
  - `horse.left` zamyka flagi, plany i dostępy w serwisach-właścicielach;
  - `subscription.status_changed` zmienia `stables.status`;
  - `flag.created` (flaga od klienta), `invitation.accepted`, `invoice.issued` i `payment.failed` konsumuje `notifications` i wysyła według `notification_rules` (pkt 17, propozycja).
- **Widoczność:** notatki flag są widoczne wszędzie, gdzie widać boks albo konia (tablet, apka, panel), bez podziału na „tylko w apce”. Na tablet nie trafiają tylko opisy wizyt z historii zdrowia; pilnuje tego kod `board`.

## Legenda

- **Jeden ERD aplikacji:** wszystkie tabele schematu `app` na jednym diagramie. Audit ma osobny, mały diagram, bo leży w schemacie `audit` i nie ma kluczy obcych do `app`.
- **Kolor tabeli** to jej serwis-właściciel (kolumna „Kolor na ERD” w tabeli serwisów).
- **Kolumny:** `PK` to klucz główny, `FK` klucz obcy, `UK` unikalność. Komentarz przy `FK` podaje tabelę docelową.
- **Linie:** relacje między tabelami. Dla czytelności nie rysujemy dwóch rodzajów linii; ich klucze obce są zaznaczone w kolumnach:
  - linii do `stables` (kolumna `stable_id` jest prawie w każdej tabeli);
  - linii do `users` z pól atrybucji (`created_by`, `granted_by`, `uploaded_by`, `moved_by` i podobnych).
- **Krotności.** Znacznik przy tabeli mówi, ile jej wierszy przypada na jeden wiersz tabeli po drugiej stronie:
  - `||` dokładnie jeden;
  - `o|` (zapisane po lewej stronie jako `|o`) zero albo jeden;
  - `o{` (po lewej `}o`) zero lub wiele.

  Przykład: `boxes |o--o| horses` znaczy, że koń ma zero albo jeden boks, a boks ma zero albo jednego konia.
- **Pliki:** PNG do szybkiego podglądu, SVG do powiększania (tekst zostaje ostry).

## ERD aplikacji (schemat `app`)

![ERD aplikacji, schemat app](erd/app.png)

Wersja do powiększania: [erd/app.svg](erd/app.svg). Diagram ma 47 tabel i 62 relacje.

<details>
<summary>Źródło mermaid</summary>

```mermaid
erDiagram
    businesses {
        uuid id PK
        text tax_id UK "NIP, 1 konto = 1 NIP"
        text name "nazwa firmy"
        text address_line1 "siedziba"
        text address_line2
        text postal_code
        text city
        text country_code "PL"
        text invoice_email "e-mail do faktur"
    }
    business_admins {
        uuid business_id PK, FK "businesses"
        uuid user_id PK, FK "users, admin konta: wszystkie stajnie firmy"
    }
    stables {
        uuid id PK
        uuid business_id FK "businesses"
        text name
        text timezone "IANA, np. Europe/Warsaw"
        text status "active | suspended"
    }
    stable_settings {
        uuid stable_id PK, FK "1:1 ze stajnią"
        int warn_offset_min "baner NIEPOTWIERDZONE, np. 30"
        int notify_offset_min "powiadomienie admina, np. 15"
        int late_margin_min "flaga po czasie"
        text author_display "role | initial | name"
        boolean owner_edits_feeding
        boolean rides_enabled
        boolean flags_require_ack "Flagi wymagają potwierdzenia"
        boolean soak_enabled "moczenie paszy"
        boolean tidy_enabled "przycisk Boks gotowy"
        boolean meal_served_enabled "przycisk posiłku"
        boolean paddock_out_enabled "przycisk padoku"
        time maintenance_from "okno instalacji APK"
        time maintenance_to
    }
    stable_role_features {
        uuid stable_id PK, FK "stables"
        text role PK "client | staff | instructor | tablet | display"
        text feature PK "stała lista, np. feeding_plan, tasks"
        boolean visible
    }
    notification_rules {
        uuid stable_id PK, FK "stables"
        text event PK "lista pod diagramem"
        text recipient_role PK "admin | staff"
        text channel PK "sms | email"
        boolean enabled
    }
    buildings {
        uuid id PK
        uuid stable_id FK
        text name "unikalna w stajni"
        text address_line1
        text address_line2
        text postal_code
        text city
        text country_code "PL"
        int sort_order
        boolean active
    }
    boxes {
        uuid id PK
        uuid stable_id FK
        uuid building_id FK "buildings, hala"
        text label "numer w hali, bez unikalności"
        boolean auto_waterer "automatyczne poidło"
        boolean active
    }
    horses {
        uuid id PK
        uuid stable_id FK
        uuid box_id FK, UK "najwyżej jeden koń w boksie; NULL = bez boksu"
        text status "active | left"
        text name
        text breed
        date birth_date
        uuid photo_file_id FK "files"
        timestamptz left_at
    }
    horse_box_history {
        uuid id PK
        uuid stable_id FK
        uuid horse_id FK "jeden otwarty wpis na konia"
        uuid box_id FK "jeden otwarty wpis na boks"
        text reason "arrival | move | swap | left"
        uuid moved_by FK "users"
        timestamptz from_at
        timestamptz to_at "NULL = obecnie"
    }
    users {
        uuid id PK
        text cognito_sub UK
        text display_name
        text phone_e164 "kopia z Cognito"
        text email "kopia z Cognito"
        text locale
        timestamptz contact_synced_at
        timestamptz deleted_at
    }
    stable_members {
        uuid id PK
        uuid stable_id FK "stables"
        uuid user_id FK "users, unikalne ze stable_id"
        text role "staff | instructor | client | display | tablet"
        boolean active
        timestamptz deactivated_at
    }
    horse_access {
        uuid id PK
        uuid stable_id FK "stables"
        uuid horse_id FK "horses"
        uuid user_id FK "users"
        text role "client: właściciel albo dzierżawca konia"
        timestamptz valid_from
        timestamptz valid_to
        timestamptz revoked_at
        uuid granted_by FK "users"
    }
    invitations {
        uuid id PK
        uuid stable_id FK "stables"
        text channel "sms | email"
        text target "porównywany z claimem z Cognito"
        text role "jak stable_members.role"
        uuid horse_id FK "horses, wymagane dla klienta"
        uuid created_by FK "users"
        timestamptz expires_at "wymagane"
        timestamptz accepted_at
        uuid accepted_by FK "users"
        timestamptz revoked_at
    }
    flag_templates {
        uuid id PK
        uuid stable_id FK "stables"
        text code "unikalny w stajni"
        text icon
        text severity "info | warning | critical"
        text effect "suspend_meal | cancel_paddock | no_riding | rug | none"
        text meal_slot_code
        text default_window "np. 06:00-10:00, paddock, 16:00-08:00"
        boolean active
        int sort_order
    }
    horse_flags {
        uuid id PK "z klienta"
        uuid stable_id FK "stables"
        uuid horse_id FK "horses"
        uuid template_id FK "opcjonalnie"
        text custom_text
        text severity
        text effect
        text note
        text author_role "client | staff | admin"
        timestamptz valid_from "wymagane"
        timestamptz valid_to "wymagane, bez do odwołania"
        text variant "Derka: on | off"
        boolean requires_ack "kopia ustawienia stajni przy zapisie"
        uuid meal_slot_id FK "meal_slots"
        date service_date
        timestamptz ack_deadline_at
        timestamptz warn_at "liczone przy zapisie"
        timestamptz notify_at "liczone przy zapisie"
        text source "app | on_behalf_*, lista pod diagramem"
        uuid replaces_flag_id FK, UK
        uuid created_by FK "users"
        timestamptz client_created_at
        text request_hash
        timestamptz cancelled_at
        uuid cancelled_by FK "users"
        text cancel_reason
        timestamptz acknowledged_at
    }
    flag_template_labels {
        uuid template_id PK, FK
        text locale PK "pl | uk | en"
        text label
    }
    flag_acknowledgements {
        uuid id PK "id zdarzenia z klienta"
        uuid stable_id FK "stables"
        uuid flag_id FK
        uuid user_id FK "users; NULL, gdy z tabletu"
        uuid box_id FK "boxes, gdzie potwierdzono"
        text method "tablet | app"
        timestamptz occurred_at
        text time_quality "synced | unknown"
        timestamptz received_at
        text conflict "none | flag_ended | flag_cancelled"
        text request_hash
    }
    flag_escalations {
        uuid id PK
        uuid stable_id FK "stables"
        uuid flag_id FK "unikalne z level"
        text level "board_warning | admin_notify"
        timestamptz escalated_at
    }
    meal_slots {
        uuid id PK
        uuid stable_id FK "stables"
        text code "np. breakfast"
        time local_time
        smallint days_mask "bity: pn=1 ... nd=64"
        date valid_from
        date valid_to
        int sort_order
    }
    meal_slot_labels {
        uuid meal_slot_id PK, FK
        text locale PK "pl | uk | en"
        text label
    }
    feeds {
        uuid id PK
        uuid stable_id FK "stables"
        text name "np. owies, siano, suplement X"
        text kind "feed | supplement | medicine"
        text default_unit "kg | g | miarka | szt"
        boolean active
    }
    paddocks {
        uuid id PK
        uuid stable_id FK "stables"
        text name
    }
    feeding_plans {
        uuid id PK
        uuid stable_id FK "stables"
        uuid horse_id FK "horses"
        uuid meal_slot_id FK
        date valid_from
        date valid_to
        timestamptz deleted_at
    }
    feeding_plan_items {
        uuid id PK
        uuid feeding_plan_id FK
        uuid feed_id FK
        numeric quantity
        text unit
        boolean soak "namoczyć"
        text soak_note "ile, np. w 2 l wody"
        int sort_order
    }
    box_care_events {
        uuid id PK "z klienta"
        uuid stable_id FK "stables"
        uuid box_id FK "boxes"
        text kind "tidy: Boks gotowy | water: tylko poidło ręczne"
        timestamptz occurred_at
        uuid user_id FK "users; NULL, gdy z tabletu"
        text source "tablet | app"
        text time_quality "synced | unknown"
        timestamptz received_at
        text request_hash
        timestamptz cancelled_at "cofnięcie"
    }
    building_routines {
        uuid id PK "z klienta"
        uuid stable_id FK "stables"
        uuid building_id FK "buildings"
        text kind "meal_served | paddock_out"
        uuid meal_slot_id FK "meal_slots, dla posiłku"
        date service_date "unikalne z building_id, kind, meal_slot_id"
        timestamptz occurred_at
        uuid user_id FK "users; NULL, gdy z tabletu"
        text source "tablet | app | web"
        text time_quality "synced | unknown"
        timestamptz received_at
        text request_hash
        timestamptz cancelled_at "cofnięcie"
    }
    paddock_plans {
        uuid id PK
        uuid stable_id FK "stables"
        uuid horse_id FK "horses"
        uuid paddock_id FK
        smallint days_mask "bity: pn=1 ... nd=64"
        time start_local
        time end_local
        date valid_from
        date valid_to
        timestamptz deleted_at
    }
    paddock_plan_companions {
        uuid paddock_plan_id PK, FK
        uuid horse_id PK, FK "horses"
    }
    health_events {
        uuid id PK
        uuid stable_id FK "stables"
        uuid horse_id FK "horses"
        text type "vet | farrier | dentist | deworming | vaccination"
        date occurred_on
        timestamptz scheduled_at
        timestamptz next_due_at
        text description
        text visibility "stable | owner_private"
        uuid created_by FK "users"
        timestamptz deleted_at
    }
    health_attachments {
        uuid id PK
        uuid stable_id FK "stables"
        uuid health_event_id FK
        uuid file_id UK, FK "files"
        text file_name
        uuid created_by FK "users"
        timestamptz deleted_at
    }
    arenas {
        uuid id PK
        uuid stable_id FK "stables"
        text name
        int capacity
    }
    rides {
        uuid id PK
        uuid stable_id FK "stables"
        uuid horse_id FK "horses"
        uuid rider_member_id FK "stable_members, opcjonalnie"
        text rider_name
        uuid instructor_member_id FK "stable_members"
        uuid arena_id FK
        timestamptz starts_at
        timestamptz ends_at
        text status
        timestamptz deleted_at
    }
    tasks {
        uuid id PK
        uuid stable_id FK "stables"
        text title "np. Poidło w boksie 5 do wymiany"
        text note
        uuid building_id FK "buildings, opcjonalnie"
        uuid box_id FK "boxes, opcjonalnie"
        uuid horse_id FK "horses, opcjonalnie"
        uuid created_by FK "users, admin"
        uuid taken_by FK "users, kto wziął"
        timestamptz taken_at
        uuid done_by FK "users"
        timestamptz done_at
        timestamptz cancelled_at
    }
    files {
        uuid id PK
        uuid stable_id FK "stables, NULL dla APK"
        text s3_key UK "prefiks stable_id/"
        text owner_service "np. health, stable, releases"
        uuid owner_id
        text original_name
        text content_type
        bigint size_bytes
        text sha256
        text status "pending | attached | deleted"
        uuid uploaded_by FK "users"
        timestamptz deleted_at
    }
    app_releases {
        uuid id PK
        int version_code UK
        text version_name
        uuid file_id UK, FK "files"
        text sha256
        text signing_cert_sha256
        int min_sdk
        int min_required_version_code
        text status "draft | rolling | complete | halted"
        smallint rollout_percent
    }
    app_release_targets {
        uuid id PK
        uuid release_id FK
        uuid stable_id FK "stables"
    }
    notifications {
        uuid id PK
        uuid stable_id FK "stables"
        text channel "sms | email"
        uuid recipient_user_id FK "users, NULL dla zaproszeń"
        text recipient_address "E.164 albo e-mail w chwili wysyłki"
        text template
        text subject "wyrenderowane przy tworzeniu"
        text body
        uuid related_flag_id FK "horse_flags"
        uuid related_invitation_id FK "invitations"
        text dedupe_key UK
        text status "pending | sent | failed | cancelled"
        text provider_message_id
        int attempts
        timestamptz sent_at
    }
    billing_accounts {
        uuid id PK
        uuid stable_id FK, UK "jedno konto na stajnię"
        text legal_name
        text tax_id "NIP, kopia z businesses.tax_id"
        text address_line1
        text address_line2
        text postal_code
        text city
        text country_code "PL"
        text invoice_email
        text payment_provider "do wyboru"
        text provider_customer_id
    }
    billing_plans {
        uuid id PK
        text code UK
        text name
        text currency "PLN"
        text period "month | year"
        bigint minimum_minor "minimalna kwota w okresie"
        boolean active
    }
    billing_plan_prices {
        uuid plan_id PK, FK
        text metric PK "np. boxes_with_horse"
        bigint unit_price_minor "grosze za jednostkę"
    }
    subscriptions {
        uuid id PK
        uuid stable_id FK
        uuid billing_account_id FK
        uuid plan_id FK
        text status "trial | active | past_due | suspended | canceled"
        timestamptz trial_ends_at
        timestamptz current_period_start
        timestamptz current_period_end
        timestamptz cancel_at
        timestamptz canceled_at
        text provider_subscription_id
    }
    usage_snapshots {
        uuid id PK
        uuid stable_id FK
        uuid subscription_id FK "unikalne z period_start i metric"
        timestamptz period_start
        timestamptz period_end
        text metric "np. boxes_with_horse"
        int quantity
    }
    invoices {
        uuid id PK
        uuid stable_id FK
        uuid subscription_id FK
        text number UK
        timestamptz period_start
        timestamptz period_end
        text currency
        bigint net_minor "grosze"
        bigint vat_minor
        bigint gross_minor
        text status "draft | issued | paid | overdue | void"
        timestamptz issued_at
        timestamptz due_at
        timestamptz paid_at
        uuid file_id FK "PDF w S3"
        text external_ref "system faktur, KSeF"
    }
    invoice_lines {
        uuid id PK
        uuid invoice_id FK
        text description
        text metric
        int quantity
        bigint unit_price_minor
        bigint net_minor
        text vat_rate
    }
    payments {
        uuid id PK
        uuid stable_id FK
        uuid invoice_id FK
        text provider
        text provider_payment_id UK
        text method "karta | BLIK | przelew"
        bigint amount_minor
        text currency
        text status "pending | succeeded | failed | refunded"
        timestamptz paid_at
    }
    payment_provider_events {
        uuid id PK
        text provider
        text provider_event_id UK "idempotencja webhooków"
        text type
        text payload_s3_key "surowe body webhooka w S3"
        timestamptz received_at
        timestamptz processed_at
    }
    businesses ||--o{ stables : "stajnie"
    businesses ||--o{ business_admins : "admini konta"
    users ||--o{ business_admins : "jest adminem"
    stables ||--|| stable_settings : "ustawienia"
    stables ||--o{ stable_role_features : "widoczność per rola"
    stables ||--o{ notification_rules : "powiadomienia"
    stables ||--o{ buildings : "hale"
    buildings ||--o{ boxes : "boksy w hali"
    stables ||--o{ horses : "ma"
    boxes |o--o| horses : "zajmuje (0..1 : 0..1)"
    horses ||--o{ horse_box_history : "historia"
    boxes ||--o{ horse_box_history : "historia"
    users ||--o{ stable_members : "jest członkiem"
    stables ||--o{ stable_members : "członkowie"
    users ||--o{ horse_access : "ma dostęp"
    horses ||--o{ horse_access : "dostęp"
    stables ||--o{ invitations : "zaprasza"
    horses |o--o{ invitations : "do konia"
    flag_templates ||--o{ flag_template_labels : "etykiety"
    flag_templates |o--o{ horse_flags : "szablon"
    horse_flags |o--o| horse_flags : "zastępuje"
    horse_flags ||--o{ flag_acknowledgements : "potwierdzenia"
    horse_flags ||--o{ flag_escalations : "eskalacje"
    horses ||--o{ horse_flags : "flagi"
    meal_slots |o--o{ horse_flags : "cel: posiłek"
    users ||--o{ flag_acknowledgements : "kto potwierdził"
    meal_slots ||--o{ meal_slot_labels : "etykiety"
    meal_slots ||--o{ feeding_plans : "posiłek"
    feeding_plans ||--o{ feeding_plan_items : "pozycje"
    feeds ||--o{ feeding_plan_items : "pasza"
    meal_slots |o--o{ building_routines : "posiłek"
    buildings ||--o{ building_routines : "rutyna hali"
    paddocks ||--o{ paddock_plans : "gdzie"
    paddock_plans ||--o{ paddock_plan_companions : "z kim"
    horses ||--o{ paddock_plan_companions : "towarzysz"
    horses ||--o{ feeding_plans : "plan"
    horses ||--o{ paddock_plans : "padok"
    horses ||--o{ health_events : "zdrowie"
    health_events ||--o{ health_attachments : "załączniki"
    files ||--o| health_attachments : "plik w S3"
    arenas |o--o{ rides : "miejsce"
    horses ||--o{ rides : "jazdy"
    buildings |o--o{ tasks : "dotyczy"
    horses |o--o{ tasks : "dotyczy"
    boxes |o--o{ tasks : "dotyczy"
    files ||--o| app_releases : "APK w S3"
    app_releases ||--o{ app_release_targets : "do kogo"
    users |o--o{ notifications : "odbiorca"
    horse_flags |o--o{ notifications : "dotyczy"
    invitations |o--o{ notifications : "zaproszenie"
    stables ||--o| billing_accounts : "płaci"
    billing_accounts ||--o{ subscriptions : "subskrypcje"
    billing_plans ||--o{ billing_plan_prices : "ceny"
    billing_plans ||--o{ subscriptions : "plan"
    stables ||--o{ subscriptions : "abonament"
    subscriptions ||--o{ usage_snapshots : "zużycie"
    subscriptions ||--o{ invoices : "faktury"
    invoices ||--o{ invoice_lines : "pozycje"
    invoices ||--o{ payments : "płatności"
    files |o--o| invoices : "PDF"
    boxes ||--o{ box_care_events : "zdarzenia"
    boxes |o--o{ flag_acknowledgements : "potwierdzono przy boksie"
    classDef svc_stable fill:#dbeafe,stroke:#1d4ed8
    classDef svc_access fill:#ede9fe,stroke:#6d28d9
    classDef svc_identity fill:#fce7f3,stroke:#be185d
    classDef svc_flags fill:#fee2e2,stroke:#b91c1c
    classDef svc_care fill:#dcfce7,stroke:#15803d
    classDef svc_health fill:#ecfccb,stroke:#4d7c0f
    classDef svc_rides fill:#fef3c7,stroke:#b45309
    classDef svc_tasks fill:#ffedd5,stroke:#c2410c
    classDef svc_billing fill:#fef9c3,stroke:#a16207
    classDef svc_files fill:#e5e7eb,stroke:#374151
    classDef svc_releases fill:#f1f5f9,stroke:#475569
    classDef svc_notifications fill:#fae8ff,stroke:#a21caf
    class businesses,business_admins,stables,stable_settings,stable_role_features,notification_rules,buildings,boxes,horses,horse_box_history svc_stable
    class stable_members,horse_access,invitations svc_access
    class users svc_identity
    class flag_templates,flag_template_labels,horse_flags,flag_acknowledgements,flag_escalations svc_flags
    class meal_slots,meal_slot_labels,feeds,paddocks,feeding_plans,feeding_plan_items,building_routines,box_care_events,paddock_plans,paddock_plan_companions svc_care
    class health_events,health_attachments svc_health
    class arenas,rides svc_rides
    class tasks svc_tasks
    class billing_accounts,billing_plans,billing_plan_prices,subscriptions,usage_snapshots,invoices,invoice_lines,payments,payment_provider_events svc_billing
    class files svc_files
    class app_releases,app_release_targets svc_releases
    class notifications svc_notifications
```

</details>

## ERD audytu (schemat `audit`)

![ERD audytu, schemat audit](erd/audit.png)

<details>
<summary>Źródło mermaid</summary>

```mermaid
erDiagram
    audit_log {
        uuid id PK "schemat audit"
        uuid stable_id "bez FK do app"
        text service
        text actor_type "user | tablet | operator | system"
        uuid actor_id
        text client "tablet | app | web"
        text action
        text entity_type
        uuid entity_id
        timestamptz created_at
    }
    audit_log_changes {
        uuid audit_log_id PK, FK "schemat audit"
        text field PK
        text old_value "bez sekretów"
        text new_value
    }
    audit_log ||--o{ audit_log_changes : "zmienione pola"
```

</details>

## Słowniki wartości

- `box_care_events.kind`: `tidy` („Boks gotowy”, czyli sprzątanie i ścielenie razem) i `water` („Woda”, tylko w boksie z poidłem ręcznym, `boxes.auto_waterer = false`). Siana i karmy nie odnotowujemy.
- `building_routines.kind`: `meal_served` („Podano śniadanie / obiad / kolację”, z `meal_slot_id`), `paddock_out` („Wyprowadzono na padok”).
- `flag_templates`: domyślne szablony wstawiane przez kod: `bez_sniadania`, `bez_kolacji`, `nie_na_padok`, `derka` (warianty `on` = zakładać, `off` = nie zakładać), `leki`, `wet`. Admin może dodać własne.
- `stable_role_features.feature` (stała lista na PoC): `flags` (flagi i kafelki), `feeding_plan` (plan karmienia), `routine` (szybkie akcje i ich stan), `box_history` (historia boksu), `tasks` (zadania), `health` (wizyty i zdrowie), `rides` (jazdy).
- `stable_role_features.role`: `client`, `staff`, `instructor`, `tablet`, `display`. Rola `tablet` nie ma wierszy `tasks` i `box_history` (pkt 16). Admin konta widzi wszystko i nie ma wierszy w macierzy.
- `stable_members.role` (i `invitations.role`): role osób `staff` (Obsługa), `instructor` (Instruktor), `client` (Klient); role kont technicznych `display` (Wyświetlacz: telewizor) i `tablet` (Tablet: tablety przy boksach), które logują się jak każde konto i od razu mają swój widok. Wsparcie IT nie jest rolą stajni (zespół EQUENOR, pkt 14). Admin (zarządca albo właściciel) nie jest rolą w stajni, tylko rolą konta firmy (`business_admins`).
- `notification_rules.event` (stała lista na PoC): `flag_unacknowledged` (flaga niepotwierdzona w terminie, czyli eskalacja; tylko flagi z `requires_ack`), `flag_created_by_client` (klient ustawił flagę), `invitation_accepted` (zaproszenie przyjęte, czyli dopasowane po zalogowaniu), `invitation_expired` (zaproszenie wygasło nieprzyjęte), `invoice_issued` (wystawiona faktura), `payment_failed` (nieudana płatność).
- `notification_rules.recipient_role`: `admin` (admini konta firmy, do którego należy stajnia), `staff` (obsługa tej stajni). `notification_rules.channel`: `sms`, `email`.
- `horse_flags.source`: `app` (właściciel w apce) albo flaga wpisana w imieniu właściciela: `on_behalf_phone`, `on_behalf_sms`, `on_behalf_in_person`.

## Zmiany względem modelu z analizy v3

- **Przejmuje Cognito:** `otp_challenges`, `auth_sessions`, `access_tokens`, `refresh_tokens`, `device_auth_challenges`, `rate_limit_buckets`, a także `invitations.token_hash` (zaproszenie dopasowuje się samo do zweryfikowanego telefonu albo e-maila, bez ekranu „Przyjmij”).
- **E-mail obok telefonu (13.10.2026):** logowanie numerem telefonu albo e-mailem (kod SMS-em albo e-mailem) i zaproszenia na telefon albo e-mail; bez nowych tabel i kolumn, bo `users.email` i `invitations.channel` już są.
- **Tylko B2B, konto firmy z NIP (13.10.2026):** `businesses` to konto firmy: dochodzą `tax_id` (NIP, unikalny indeks), adres siedziby i `invoice_email`. NIP podaje się raz, przy rejestracji; „Załóż stajnię” nie pyta o NIP ani działalność. `billing_accounts.tax_id` zostaje jako kopia z `businesses.tax_id` (propozycja).
- **Języki tabletów per tablet (13.10.2026):** odpada `stable_locales`. Język tablicy to ustawienie lokalne tabletu, bez tabeli; etykiety `*_labels` z `locale` zostają jako opcjonalne tłumaczenia nazw.
- **Konfiguracja boksów przy tworzeniu (13.10.2026):** w „Załóż stajnię” i „Dodaj halę” każdy boks od razu ma numer i poidło; kolejne ustawienia boksu dojdą jako kolumny `boxes`. Bez zmian w tabelach.
- **Zakładanie stajni w 2 krokach (13.10.2026):** bez pytania o potwierdzenia flag (nowa stajnia ma je włączone, zmienia się je w „Ustawieniach stajni”); drugi krok to powiadomienia, nowa tabela `notification_rules` (propozycja) w serwisie `stable` i cron `invitation-expiry-notifier` (propozycja). Termin eskalacji zostaje w `stable_settings.notify_offset_min`.
- **Telewizor na zwykłej stronie logowania (13.10.2026):** telewizor loguje się w zwykłym panelu kontem technicznym z rolą `display` (telefon albo e-mail i kod), a widok tablicy wynika z roli; bez osobnego adresu strony telewizora, ekranu logowania telewizora i adresu technicznego do kodu. Bez zmian w tabelach.
- **Tablet bez wyboru stajni (13.10.2026):** po pierwszym zalogowaniu od razu wybór boksu ze stajni konta tabletów (przy zapamiętanym boksie od razu tablica); bez osobnego ekranu wyboru stajni. Bez zmian w tabelach.
- **Wsparcie IT poza stajnią (13.10.2026):** `it_support` znika ze `stable_members.role`, `invitations.role` i `stable_role_features.role`, a `device_diagnostics` z listy funkcji `stable_role_features`; Wsparcie IT to zespół EQUENOR z dostępem nadawanym narzędziem operatora, bez tabeli w `app` (propozycja).
- **Tablety na koncie technicznym (13.10.2026):** nowa wartość `tablet` w `stable_members.role`, `invitations.role` i `stable_role_features.role` (kolumna „Tablet” w macierzy, bez `tasks` i `box_history`); jedno konto tabletów na stajnię (propozycja), zapraszane przez „Zaproś osobę”, zamiast konta osoby. Akcje z tabletu dalej bez autora (`source = tablet`). Bez nowych tabel.
- **Admin to rola konta firmy (13.10.2026):** nowa tabela `business_admins` (propozycja) w serwisie `stable`; admin konta ma dostęp do wszystkich stajni firmy, także nowych. `stable_members.role` traci `admin`, a pozostałe role przypisuje się per stajnia (osoba może być w kilku stajniach).
- **Nazwa produktu (13.10.2026):** EQUENOR (wcześniej robocza nazwa eKoniuszy), hasło „Equestrian Management, Refined”; bez zmian w tabelach.
- **Strona główna przed logowaniem (13.10.2026):** publiczna strona www, sama prezentacja produktu (statyczna strona, bez bloga i CMS); bez tabel w `app`.
- **Tablety:**
  - nie ma parowania (`device_pairing_requests`) ani PIN-ów obsługi (`stable_members.pin_verifier`, `stables.service_pin_verifier`): na tablecie jest zalogowane konto techniczne tabletów;
  - nie ma tabel urządzeń (`devices`, `device_boxes`, `device_presence`, komendy, alerty): wybrany boks jest zapamiętany na tablecie, bez blokady, a sesje są w Cognito;
- **Hale:** tekstowe `boxes.building` zastępuje tabela `buildings` (z adresem hali) i klucz `boxes.building_id`.
- **Feedback ze stajni:**
  - rutyna obsługi to szybkie akcje: „Boks gotowy” per boks (`box_care_events.kind = tidy`) oraz posiłek i padok dla całej hali (`building_routines`). Odpadają `feeding_checks` (karmienie per koń), `box_care_types` i `box_care_type_labels` (osobne czyszczenie, ścielenie, siano i karma); woda zostaje tylko dla boksów z poidłem ręcznym (`boxes.auto_waterer`);
  - flagi mają wymagane godziny od–do i wariant (`horse_flags.variant`, flaga „Derka”); `feeding_plan_items` dostaje „namoczyć” i ile;
  - jedna rola Klient zamiast właściciela konia i najemcy miejsca: odpada `box_access`, a `invitations` traci `box_id` i `access_role`; „serwisant” to teraz Wsparcie IT, zespół EQUENOR poza rolami stajni;
  - zadania są jednorazowe: odpadają `task_occurrences` i cron `task-occurrence-generator`;
  - dochodzi `businesses` (konto firmy → stajnie → hale → boksy);
  - ustawienia per stajnia: nowe kolumny w `stable_settings` (potwierdzenia, moczenie, szybkie przyciski), nowa tabela `stable_role_features` (widoczność per rola), `horse_flags.requires_ack` zamiast `flag_templates.requires_ack`.
- **Bez śledzenia wyświetleń flag:** odpadają `flag_displays` i cron `flag-display-check`. Status flagi to tylko potwierdzona albo niepotwierdzona (w stajni, która wymaga potwierdzeń), a brak potwierdzenia w terminie obsługuje `escalation-scheduler`.
- **Przejmuje S3:** `stored_files` i `stored_file_chunks`.
- **Serwisy:** dochodzi `billing` (płatności). Każda tabela ma serwis-właściciela; wszystko jest w schemacie `app`, poza audytem w schemacie `audit`.
- **Odpada razem z WebSocketami i monolitem:**
  - `outbox_seq` i `outbox_events`; zdarzenia idą wprost do SNS + SQS, bez outboxów;
  - `jobs`, bo crony są serwisami;
  - `boxes.board_version` znika razem z cache tablic: serwis `board` nie trzyma stanu.
- **Bez jsonb:** ustawienia stajni, reguły powiadomień, etykiety w językach, pozycje karmienia, towarzysze na padoku, rollout APK, ceny planów, adres do faktury i zmiany w audycie mają własne kolumny albo tabele.
- **Załączniki:** ogólne `attachments` zastępuje `health_attachments`, bo w v1 załączniki są tylko w zdrowiu.
- **Poza v1, do decyzji:**
  - eksporty danych (`data_exports`, w przyszłości osobny serwis `exports`, który czyta dane wprost z bazy);
  - błędy klientów (`client_errors`, albo zewnętrzne narzędzie wybrane przez Dawida);
