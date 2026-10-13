# EQUENOR: makiety, stan prac

Makiety (design canvas) są w `mockups/project/` (`*.dc.html` + `canvas.json`). Opublikowana kanwa: https://claude.ai/artifact/SjdCnhTF5eqXy2vRaSMUtX
Decyzje użytkownika i dane kanoniczne: `mockups/decyzje-spec.md` (sekcje L, M i N są najnowsze i nadrzędne; sekcja O: mikroserwisy i autoryzacja; sekcja P, nadrzędna wobec O: 11 serwisów, sesje w JWT, crony, SMS i e-mail; sekcja Q, nadrzędna wobec O i P: logowanie hasłem i zawsze kodem, Cognito tylko w `auth`, kody przez nasze `email` i `sms`, nazwy serwisów `stables`, `operations`, `schedule`).
Narzędzia: `mockups/tools/` (render przez puppeteer: `render.cjs`, `render-full.cjs`, `render_all.cjs`; generator wyświetlacza `gen/`; skrypty zmiany nazw `rename.py`, `gotowy.py`).

## Zrobione (13.10.2026)
- Nazwa EQUENOR, hasło „Equestrian Management, Refined” pod znakiem.
- Pierwsza fala P1: konto firmy (B2B, NIP), zakładanie stajni w 2 krokach (stajnia, powiadomienia), ekrany główne ról, logowanie telefonem albo e-mailem (w makietach jeszcze bez hasła, pkt 7 niżej).
- Komentarze z kanwy (N1–N15): telewizor i tablety jako konta techniczne (zwykłe logowanie, od razu swój widok), bez ekranu wyboru stajni na tablecie, Wsparcie IT jako zespół EQUENOR, bez objaśnień w UI, bez tłumaczenia NIP-u, bez „Czekasz na zaproszenie?”, strona www jako sama prezentacja (bez bloga).
- Rozpiska mikroserwisów `docs/mikroserwisy.md` (wymagania z 13.10: admin globalny z dostępem wszędzie, jeden serwis autoryzacyjny `auth`), po recenzji; zsynchronizowane erd.md (z diagramem ERD, 52 tabele; po W4: 50), development.md, development-szczegoly.md, makiety-plan.md i arkusz decyzji (sekcja O).
- Decyzje 13.10 (W3–W5 i podział na 11 serwisów): crony piszą do bazy bezpośrednio, bez tokenów serwisowych; sesje tylko w JWT (bez `auth_sessions` i `auth_revocations`, ERD 50 tabel, odebranie dostępu do 5 min, jednego tabletu nie odłączamy); `sms` i `email` bez tabel, z kolejki od `notifications`; `operations`, `schedule`, `platform`, `files` osobno. Zsynchronizowane mikroserwisy.md, erd.md, development*.md, makiety-plan.md, README i arkusz (sekcja P).
- Decyzje 13.10 (W6–W9 i nazwy serwisów, arkusz Q): aplikacje rozmawiają tylko z `auth`, który jedyny woła Cognito; logowanie e-mailem albo telefonem i hasłem, zawsze z kodem MFA e-mailem albo SMS-em; rejestracja z potwierdzeniem konta kodem i reset hasła; kody dostarczają nasze `email` i `sms` przez wyzwalacz Cognito w `auth`; TOTP i passkey znikają; serwisy `stables`, `operations`, `schedule`. Zsynchronizowane mikroserwisy.md (z diagramem), erd.md (z diagramem ERD), development.md, development-szczegoly.md, makiety-plan.md, README i arkusz (sekcja Q).

## Do zrobienia
0. Zrobione 13.10: „Ogarnięte” → „Boks gotowy” (N16) w makietach, kanwie, generatorze i docs.
2. Dokończyć recenzję grup, które przerwał limit: mapa, tablet, ustawienia, apka (verify/fix) i krytyk całości.
3. Opublikować kanwę (usunięte plansze: TabletWyborStajni, StronaWpis, WsparcieITStart).
4. Odpowiedzieć i rozwiązać 15 wątków komentarzy na kanwie.
5. Makiety po rozpisce mikroserwisów (docs/mikroserwisy.md 11.4; .dc.html jeszcze niezmienione):
   - Zaproszenie.dc.html: usunąć rolę „Wsparcie IT” i jej opis;
   - PanelUstawieniaStajni i PanelUstawieniaBezAkcji: w kolumnie Tablet „Zadania” i „Historia boksu” nieaktywne (bez zaznaczenia, erd pkt 16), „Jazdy” odznaczone; PanelUstawieniaBrzozowa: u Tabletu „Historia boksu” nieaktywna;
   - stany bez nowych plansz: PanelPulpitStart z pozycją „Dokończ zakładanie stajni” (`setupPending`), PanelLudzieWyswietlacze z kontem zablokowanym i „Odblokuj” oraz akcją „Wyloguj wszystkie tablety” przy koncie tabletów (bez listy tabletów i sesji, bez „Odłącz to urządzenie”), PanelLudzie z oznaczeniem „nadane przez zespół EQUENOR”;
   - nowa plansza P2 PanelOps (konsola admina globalnego na `[OPS]`: logowanie hasłem i kodem, powód wejścia, wybór firmy i stajni, pasek „EQUENOR · pełny dostęp”, historia powiadomień); PanelDiagnostyka (P3) też w `[OPS]`.
6. Decyzje właściciela produktu przed implementacją: docs/mikroserwisy.md 10.2 pkt 1–8 (macierz w tokenie, `businesses` w `auth`, wartości czasów sesji, dostęp do `[OPS]`, KMS, domena panelu i `[OPS]`, plan dnia na TV, DPoP). Od planu dnia na TV zależą makiety ustawień albo WyswietlaczCentralny. Lista unieważnień i odłączenie jednego tabletu odpadły (W4). Do tego logowanie: pkt 24 (reset hasła konta z jednym kontaktem, bo Cognito nie wysyła kodu resetu kanałem kodu MFA) i pkt 25 (jak recenzent sklepu dostanie kod MFA konta demo, development.md §5 pkt 2); wartości z pkt 17 (polityka haseł, `AuthSessionValidity`, kolejki kodów) mają propozycje.
7. Makiety logowania po decyzjach 13.10 (W6–W9, arkusz Q, docs/makiety-plan.md; .dc.html jeszcze niezmienione). Pierwszy ekran to e-mail albo telefon i hasło z „Nie pamiętam hasła”, a obecne ekrany z kodem zostają jako krok MFA:
   - LogowanieNumer: pod przełącznikiem „Telefon | E-mail” pole „Hasło” i link „Nie pamiętam hasła”; „Zaloguj się” zamiast „Wyślij kod”; obok „Załóż konto firmy” mniejszy link „Załóż konto” (→ Rejestracja);
   - Logowanie (krok MFA): „Wysłaliśmy kod SMS na …” → „Kod wysłaliśmy na …”; usunąć „albo · Użyj aplikacji uwierzytelniającej (kod TOTP)” i dopisek „Masz zaproszenie? Zaloguj się numerem lub e-mailem…”; „Kod jest ważny 10 minut” usunąć albo zgrać z sesją logowania (propozycja 5 min); tytuł na kanwie „Logowanie kodem SMS” → „Apka: kod MFA”;
   - PanelLogowanie i WyswietlaczLogowanie (ta sama strona): pole „Hasło”, „Nie pamiętam hasła”, „Zaloguj się” zamiast „Wyślij kod”, link „Załóż konto” (→ PanelRejestracja);
   - PanelLogowanieKod i WyswietlaczKod: treść bez zmian (krok MFA); w tytule kanwy „kod logowania” → „krok MFA”;
   - na każdym ekranie kroku MFA „Wyślij kod ponownie” wraca do pierwszego ekranu z wpisanym kontaktem (hasło jeszcze raz; aplikacja go nie trzyma, mikroserwisy.md 3.1);
   - TabletLogowanie: pod „ADRES E-MAIL” pole „HASŁO” (zamaskowane) i „NIE PAMIĘTAM HASŁA”; „WYŚLIJ KOD” → „ZALOGUJ”; TabletLogowanieKod bez zmian (krok MFA);
   - PanelWitaj: usunąć pola „Imię *” i „Język aplikacji” (są w rejestracji); zostają „Witaj w EQUENOR, Damian”, „Zalogowano: +48 602 *** 145”, „Wyloguj” i „Załóż konto firmy”;
   - ZaproszeniePrzyjmij → Rejestracja (apka): usunąć kartę „Masz zaproszenie” (stajnia, rola, koń, zaprosił, ważne do), „Przyjmij zaproszenie” i „To nie moje konto · Wyloguj”; dodać przełącznik „Telefon | E-mail”, kontakt i „Hasło”; z „O Tobie” zostają „Imię i nazwisko” i „Język aplikacji”; przycisk „Załóż konto”, link „Mam już konto”;
   - Zaproszenie: logowanie go nie zmienia (zostaje pkt 5: bez Wsparcia IT);
   - ProfilZmianaNumeru (P2): nowy numer i „Hasło”, potem kod z SMS-a na nowy numer i kod MFA dotychczasowym kanałem; „Zmień hasło” z Profil: obecne hasło, potem kod MFA i nowe hasło (stan na StanyApka; mikroserwisy.md 5.2);
   - poza listą: WiadomosciSms i podgląd SMS w PanelZaprosOsobe („i zaloguj się tym numerem” → „i załóż konto na ten numer”; e-mail konta technicznego „Zaloguj się tym adresem e-mail na tablecie” → „Załóż konto tym adresem e-mail”), MapaNawigacjiRol (kroki: rejestracja, kod, hasło, kod MFA; PanelWitaj bez imienia i języka), StronaGlowna i StronaGlownaTelefon („Załóż konto firmy” → PanelRejestracja), notatki rzędów kanwy o logowaniu kodem i TOTP;
   - nowe plansze P1: RejestracjaKod i ResetHasla (apka), PanelRejestracja z ● PanelRejestracjaKod i PanelResetHasla (panel, także TV); reset hasła na tablecie jako stan na StanyTablet (propozycja); LogowanieTotp (P3) wypada.
