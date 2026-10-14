---
id: TAB-011
title: "TabletBoks: tablica boksu (flagi, karmienie, ostatnie akcje)"
area: tablet
stage: 4
size: L
status: todo
depends_on: [TAB-010]
decisions: []
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/hJwD1Re1
---
# TAB-011 · TabletBoks: tablica boksu (flagi, karmienie, ostatnie akcje)

## Cel
Obsługa przy boksie widzi z 1,5–2 m, co dziś obowiązuje dla tego konia: flagi z godzinami (np. „BEZ ŚNIADANIA · 06:00–10:00”), co jest wstrzymane w karmieniu, co namoczyć i co ostatnio zrobiono. Ekran pokazuje tylko to, co włączyła stajnia i co widzi rola tabletu, w języku wybranym na tym tablecie.

## Kontekst
- **Stan kodu:** wybór boksu i `selection.ts` z TAB-010, sesja z TAB-009, komponenty e-ink (`Banner`, `StatusField`, `Table`, `Footer`, `IconButton`) i podpis koloru z TAB-008, `epdRefresh` z TAB-005. Dane: `GET /board/v1/stables/{stableId}/boxes/{boxId}?lang=pl|uk` z BE-041 (`building` z `showBuilding`, `box` z `autoWaterer`, `horse` albo `null`, `flags.banner` i `flags.later` z `hoursLabel`, wariantem, notatką, autorem, `requiresAck`, statusem i znacznikiem `popup`; `feeding` z porami z `meal_slots`, `WSTRZYMANE`, `soak`/`soakNote` przy włączonym moczeniu; `config` z `stableFeatures`; `recentActions` ≤ 5; stan `suspended`). Po BE-041 usuń tymczasowe `tablet/src/board/types.ts` z TAB-001 na rzecz `src/api/board.d.ts` (`npm run gen:api`). Rutyna w `recentActions`, znacznik „Poidło ręczne · woda HH:MM” i stany szybkich akcji dokłada BE-045 (tu: wyświetlenie, gdy pola są w odpowiedzi).
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 „TabletBoks” (nagłówek z numerem boksu i koniem, przy kilku halach z halą; przyciski „Zmień boks” i „Zablokuj ekran”; bez informacji, kto zalogowany; baner flagi z godzinami i „Później: … od HH:MM”; plakietka „POTWIERDZONA HH:MM” tylko dla `requires_ack`, inaczej „obowiązuje od razu”; KARMIENIE z WSTRZYMANE i „NAMOCZYĆ” tylko przy włączonym moczeniu; bez ramki „PADOK / DZIŚ”; bez zadań; OSTATNIE AKCJE ≤ 5 bez przewijania; stopka „ONLINE · aktualne na HH:MM” i PL | UA), „TabletBoksBrzozowa”, „TabletBoksBezAkcji”, język tablicy (lokalnie, w zapytaniu do `board`, serwer go nie zapisuje), 4.4 A-01, A-10, A-12, A-17, A-18, A-19, A-25; `docs/erd.md` pkt 2, 3, 16.
- **Makiety:** `mockups/project/TabletBoks.dc.html` (BOKS 7 · KASZTAN, „Hala główna · wt 13.10 · 07:15”, baner „BEZ ŚNIADANIA · POTWIERDZONA 06:02 · 06:00 – 10:00 · Wet o 8:00, koń na czczo · Anna, 03:14”, „Później: Nie na padok od 14:30 (kowal 15:00)”, KARMIENIE „rano wstrzymane przez flagę”, kolumny Pasza | Rano | Południe | Wieczór, „Wysłodki … 0,5 kg NAMOCZYĆ 2 l”, OSTATNIE AKCJE „5 ostatnich · boks i koń”), `TabletBoksBrzozowa.dc.html` (BOKS 1 · KOMETA, „Stajnia Brzozowa · wt 13.10”, „obowiązuje od razu”, bez NAMOCZYĆ), `TabletBoksBezAkcji.dc.html` (bez SZYBKICH AKCJI, „ostatnie · boks i koń”); z `docs/makiety-plan.md` E: TabletBoksWolny („BOKS 6 · WOLNY”, bez banera i karmienia), TabletBoksWoda („POIDŁO RĘCZNE · woda 06:55”, „DZIŚ BEZ FLAG” w neutralnej ramce).
- **Decyzje:** brak (szybkie akcje: TAB-018; pop-up: TAB-014).
- **Dane demo:** HG 7 Kasztan o 07:15 (A-01), HG 4 Sonata „Derka: zakładać · od 16:00” (A-12), HN 4 Bella (niepotwierdzona, cały dzień), HN 5 Bursztyn (poidło ręczne), HN 6 wolny, Brzozowa 1 Kometa (A-18), wariant BezAkcji.

## Zakres
- [ ] `tablet/src/screens/board/BoardScreen.tsx` z sekcjami w `tablet/src/screens/board/`:
  - `Header`: „BOKS 7 · KASZTAN” (wolny: „BOKS 6 · WOLNY”), pod spodem „Hala główna · wt 13.10 · 07:15” (bez hali przy jednej hali: nazwa stajni, jak na makiecie Brzozowej), data i zegar ze strefy stajni i `Date` serwera; po prawej `IconButton` kłódka (TAB-015 podpina blokadę) i „Zmień boks” (TAB-010);
  - `FlagBanner`: flagi z `flags.banner` jako pola koloru według ważności (krytyczna `t-crit` z białym tekstem, inne według `StatusField`); w polu: nazwa flagi wersalikami, `hoursLabel`, notatka, autor i godzina (według `author_display` z odpowiedzi); plakietka „POTWIERDZONA HH:MM” tylko gdy `requiresAck` i potwierdzona; „NIEPOTWIERDZONA” gdy `requiresAck` bez potwierdzenia; „obowiązuje od razu” gdy `requiresAck = false`; brak flag: neutralna ramka „DZIŚ BEZ FLAG”;
  - `LaterFlags`: „Później: Nie na padok od 14:30 (kowal 15:00)” dla `flags.later`;
  - `Feeding` (gdy sekcja jest w odpowiedzi): `Table` pasza × pory z etykiet `meal_slots` w języku tablicy (z polskim zapasem), komórki „WSTRZYMANE” jako `StatusField` krytyczna, „bez ogr.”, „—”, „NAMOCZYĆ 2 l” tylko gdy `soak` w odpowiedzi; podpis „rano wstrzymane przez flagę”;
  - `WaterMarker`: „POIDŁO RĘCZNE · woda HH:MM” (ramka 2 px) tylko gdy `box.autoWaterer = false`;
  - `RecentActions`: ≤ 5 wpisów (godzina, opis, autor albo bez autora dla tabletu, „wczoraj · pn 12.10” jako separator), nagłówek „5 ostatnich · boks i koń” albo „ostatnie · boks i koń”; bez przewijania i bez „Cała historia”;
  - miejsce na `QuickActions` (TAB-018) między karmieniem a ostatnimi akcjami, renderowane tylko gdy `config` ma włączone przyciski;
  - `Footer`: „ONLINE · aktualne na HH:MM” (stany sieci: TAB-012), przełącznik PL | UA zmienia język lokalnie i od razu odpytuje z nowym `lang`.
- [ ] Wolny boks: bez banera flag i karmienia, ostatnie akcje „ostatnie · boks”.
- [ ] Podpis koloru ekranu (`useColorSignature`) z listy pól koloru (flagi, WSTRZYMANE, pola statusu); zmiana = jedno pełne odświeżenie EPD.
- [ ] Teksty stałe w `pl.json` i `uk.json`; treści z serwera (nazwy flag, pasz, pór) w języku z odpowiedzi.

## Poza zakresem
- Pętla odpytywania, ETag, stany offline/nieaktualne/zawieszona/aktualizacja (TAB-012); pop-up i POTWIERDZAM (TAB-014); blokada ekranu (TAB-015); SZYBKIE AKCJE i WODA (TAB-018); ukryte ustawienia (TAB-016).

## Kryteria akceptacji
- [ ] A-01 o 07:15 (fixture i stos dev): „BEZ ŚNIADANIA · 06:00–10:00”, „POTWIERDZONA 06:02”, „Później: Nie na padok od 14:30 (kowal 15:00)”; rano owies, siano, suplement X „WSTRZYMANE”, wysłodki wieczorem „0,5 kg · NAMOCZYĆ 2 l”; 5 ostatnich akcji jak w A-01.
- [ ] A-18/A-17 (Brzozowa boks 1): nagłówek „BOKS 1 · KOMETA” bez hali, baner „obowiązuje od razu” bez plakietki, karmienie bez NAMOCZYĆ.
- [ ] A-12: tablet HG 4 o 07:15 pokazuje „Derka: zakładać · od 16:00” w „Później”.
- [ ] A-10: tablety HG 4 i HN 4 pokazują różne konie i flagi; nagłówki zawsze z halą.
- [ ] A-19: po wyłączeniu moczenia „NAMOCZYĆ” znika przy najbliższym odpytaniu; wariant BezAkcji bez sekcji szybkich akcji, z bannerem i karmieniem bez zmian.
- [ ] [ręcznie] A-25: przełącznik UA zmienia teksty stałe i etykiety z serwera; drugi tablet (emulator) zostaje po polsku; tablica nie pokazuje nazwy konta.
- [ ] Zrzuty w obu profilach (TAB-008) dla HG 7, HN 5, HN 6, Brzozowa 1 i BezAkcji zgodne z makietami (porównanie wzrokowe w raporcie zrzutów).

## Testy
- Jest + RNTL na fixture'ach: każda sekcja w wariantach (z potwierdzeniami, bez, wolny, woda, BezAkcji, UA), brak elementów wyłączonych opcji, etykiety statusów tylko „potwierdzona HH:MM” / „niepotwierdzona”.
- Zrzuty: `npm run screens` (galeria z TAB-008 rozszerzona o tablice).

## Definicja gotowości
- `npm run check` w `tablet/` zielone; typy z `src/api/board.d.ts` zamiast tymczasowych; wzorce zrzutów zaktualizowane; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Status flagi to tylko „potwierdzona HH:MM” albo „niepotwierdzona”, i tylko przy `requiresAck`; żadnych innych nazw statusów.
- Bez siana i ścielenia jako zdarzeń, bez zadań i bez ramki „PADOK / DZIŚ” (padok jest w przycisku PADOK, TAB-018).
- Nie licz niczego z reguł domeny na tablecie (okna, wstrzymania): wszystko przychodzi gotowe z `board`.
<!-- dep-ok: BE-045 (pola rutyny są w kontrakcie BE-064; ekran pokazuje je, gdy są w odpowiedzi) -->
