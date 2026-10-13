# EQUENOR: makiety, stan prac

Makiety (design canvas) są w `mockups/project/` (`*.dc.html` + `canvas.json`). Opublikowana kanwa: https://claude.ai/artifact/SjdCnhTF5eqXy2vRaSMUtX
Decyzje użytkownika i dane kanoniczne: `mockups/decyzje-spec.md` (sekcje L, M i N są najnowsze i nadrzędne; sekcja O: mikroserwisy i autoryzacja; sekcja P, nadrzędna wobec O: 11 serwisów, sesje w JWT, crony, SMS i e-mail).
Narzędzia: `mockups/tools/` (render przez puppeteer: `render.cjs`, `render-full.cjs`, `render_all.cjs`; generator wyświetlacza `gen/`; skrypty zmiany nazw `rename.py`, `gotowy.py`).

## Zrobione (13.10.2026)
- Nazwa EQUENOR, hasło „Equestrian Management, Refined” pod znakiem.
- Pierwsza fala P1: konto firmy (B2B, NIP), zakładanie stajni w 2 krokach (stajnia, powiadomienia), ekrany główne ról, logowanie telefonem albo e-mailem.
- Komentarze z kanwy (N1–N15): telewizor i tablety jako konta techniczne (zwykłe logowanie, od razu swój widok), bez ekranu wyboru stajni na tablecie, Wsparcie IT jako zespół EQUENOR, bez objaśnień w UI, bez tłumaczenia NIP-u, bez „Czekasz na zaproszenie?”, strona www jako sama prezentacja (bez bloga).
- Rozpiska mikroserwisów `docs/mikroserwisy.md` (wymagania z 13.10: admin globalny z dostępem wszędzie, jeden serwis autoryzacyjny `auth`), po recenzji; zsynchronizowane erd.md (z diagramem ERD, 52 tabele), development.md, development-szczegoly.md, makiety-plan.md i arkusz decyzji (sekcja O).
- Decyzje 13.10 (W3–W5 i podział na 11 serwisów): crony piszą do bazy bezpośrednio, bez tokenów serwisowych; sesje tylko w JWT (bez `auth_sessions` i `auth_revocations`, ERD 50 tabel, odebranie dostępu do 5 min, jednego tabletu nie odłączamy); `sms` i `email` bez tabel, z kolejki od `notifications`; `dzien`, `terminarz`, `platform`, `files` osobno. Zsynchronizowane mikroserwisy.md, erd.md, development*.md, makiety-plan.md, README i arkusz (sekcja P).

## Do zrobienia
0. Zrobione 13.10: „Ogarnięte” → „Boks gotowy” (N16) w makietach, kanwie, generatorze i docs.
2. Dokończyć recenzję grup, które przerwał limit: mapa, tablet, ustawienia, apka (verify/fix) i krytyk całości.
3. Opublikować kanwę (usunięte plansze: TabletWyborStajni, StronaWpis, WsparcieITStart).
4. Odpowiedzieć i rozwiązać 15 wątków komentarzy na kanwie.
5. Makiety po rozpisce mikroserwisów (docs/mikroserwisy.md 11.4; .dc.html jeszcze niezmienione):
   - Zaproszenie.dc.html: usunąć rolę „Wsparcie IT” i jej opis;
   - PanelUstawieniaStajni i PanelUstawieniaBezAkcji: w kolumnie Tablet „Zadania” i „Historia boksu” nieaktywne (bez zaznaczenia, erd pkt 16), „Jazdy” odznaczone; PanelUstawieniaBrzozowa: u Tabletu „Historia boksu” nieaktywna;
   - ZaproszeniePrzyjmij: przycisk „Dalej” zamiast „Przyjmij zaproszenie”;
   - stany bez nowych plansz: PanelPulpitStart z pozycją „Dokończ zakładanie stajni” (`setupPending`), PanelLudzieWyswietlacze z kontem zablokowanym i „Odblokuj” oraz akcją „Wyloguj wszystkie tablety” przy koncie tabletów (bez listy tabletów i sesji, bez „Odłącz to urządzenie”), PanelLudzie z oznaczeniem „nadane przez zespół EQUENOR”;
   - nowa plansza P2 PanelOps (konsola admina globalnego na `[OPS]`: logowanie passkeyem, powód wejścia, wybór firmy i stajni, pasek „EQUENOR · pełny dostęp”, historia powiadomień); PanelDiagnostyka (P3) też w `[OPS]`.
6. Decyzje właściciela produktu przed implementacją: docs/mikroserwisy.md 10.2 pkt 1–8 (macierz w tokenie, `businesses` w `auth`, wartości czasów sesji, logowanie admina globalnego, KMS, domena panelu i `[OPS]`, plan dnia na TV, DPoP). Od planu dnia na TV zależą makiety ustawień albo WyswietlaczCentralny. Lista unieważnień i odłączenie jednego tabletu odpadły (W4).
