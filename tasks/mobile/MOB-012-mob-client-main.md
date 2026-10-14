---
id: MOB-012
title: "Klient: Moje konie (Main, MainLuna, MainBrzozowa) i karta konia z flagami"
area: mobile
stage: 3
size: M
status: todo
depends_on: [BE-038, MOB-007]
decisions: []
needs: [emulator]
owner:
branch:
trello:
---
# MOB-012 · Klient: Moje konie (Main, MainLuna, MainBrzozowa) i karta konia z flagami

## Cel
Klient (właściciel albo dzierżawca) po otwarciu apki widzi swoje konie w wybranej stajni, aktywne flagi z godzinami i — tylko w stajni z potwierdzeniami — czy obsługa je potwierdziła. Z tego ekranu jednym stuknięciem zaczyna nową flagę.

## Kontekst
- Stan kodu: start klienta i pasek Konie | Flagi | Historia | Profil (MOB-005, trasa `mobile/app/(app)/(client)/index.tsx` jako szkielet), konfiguracja stajni z kafelkami i trybem potwierdzeń, odpytywanie z ETag, `boxLabel` (MOB-007). Trasy `board` (BE-038): `GET /board/v1/stables/{stableId}/client-home?lang=` (konie z `m[].h`, także bez boksu; każdy z `horseId`, nazwą, płcią, boksem z halą albo `null`, flagami aktywnymi i dzisiejszymi) i `GET …/horses/{horseId}/card?lang=` (nagłówek konia, flagi z godzinami i skutkami, sekcja „Dziś” z flagami); DTO flagi: `label`, `hoursLabel`, `note`, `variant`, `requiresAck`, `status` (`acknowledged` z godziną, `unacknowledged` albo brak), informacja o eskalacji, `createdAt`, skutki. Koń spoza `h` albo `left` → 404.
- Dokumenty: `docs/development-szczegoly.md` 3.5.1 „Klient” (Main i SzybkaFlaga: kafelki flag włączonych w stajni — Pod Lipami: Bez śniadania, Bez kolacji, Nie na padok, Derka, Wet, Leki, Inna flaga; Brzozowa bez Derki; przy flagach godziny i status tylko dla `requires_ack`, inaczej „obowiązuje od razu”; na liście koni najwyżej skrót z przycisków obsługi, bez linii posiłku per koń; sekcje według widoczności roli klienta). `docs/makiety-plan.md` A „MainLuna” („Luna · bez boksu · w stajni od pn 12.10”, „Brak aktywnych flag”, „Szybka flaga · dla: Luna”, 7 kafelków; bez karty powitalnej i dopisków; stany: pierwsza flaga, przypisanie do boksu), 2.3 „Flagi” (status „potwierdzona HH:MM” albo „niepotwierdzona”, nigdy „przyjęte”). A-06, A-17 (Anna przełącza stajnie), A-18.
- Makiety: `mockups/project/Main.dc.html` (H1 „Dzień dobry, Anna”; karta „Kasztan · Hala główna · boks 7 · wałach · Karta”; flaga krytyczna „Bez śniadania · 06:00–10:00 · wet o 8:00, koń na czczo · Potwierdzona 06:02”; „Nie na padok · od 14:30 · do 16:00 · kowal o 15:00 · Potwierdzona 06:02”; „Bella · Hala nowa · boks 4 · klacz”, „Nie na padok · niepotwierdzona · dziś, cały dzień · ustawiona 01:20”; „Szybka flaga · dla: Kasztan” z kafelkami), `MainLuna.dc.html`, `MainBrzozowa.dc.html` („Kometa · boks 1 · klacz”, „Bez śniadania · 06:00–09:00 · dentysta o 8:30 · Obowiązuje od razu · ustawiona 05:50”; zdanie „W tej stajni flagi obowiązują od razu…” pomijamy, docs/makiety-plan.md 2.3 i 5 pkt 38), `KartaKonia.dc.html` (nagłówek i zakładka Flagi).
- Decyzje: brak nowych.
- Dane demo: Anna (Kasztan, Bella w Pod Lipami; Kometa w Brzozowej), Marek Nowak (Luna bez boksu), Ewa K. (Sonata, Derka).

## Zakres
- [ ] `mobile/app/(app)/(client)/index.tsx` (Main): powitanie „Dzień dobry, {imię}”, karty koni z `client-home` (kolejność z serwera), linia boksu przez `boxLabel` albo „bez boksu · w stajni od …”, flagi z `hoursLabel`, notatką i statusem; „Brak aktywnych flag”; przycisk „Karta” (→ `/horse/[horseId]`).
- [ ] `mobile/src/components/FlagCard.tsx` (wspólny dla klienta, obsługi i admina): flaga krytyczna jako jasny tint `crit-tint` z lewym paskiem 4 px `crit-line`; status zawsze jako ikona, słowo i pole (nigdy sam kolor): „Potwierdzona 06:02” (`ok-*`), „niepotwierdzona” (`warn-*`), „Obowiązuje od razu” bez pola, gdy `requiresAck = false`; „Derka: zakładać / nie zakładać” z `variant`.
- [ ] Sekcja „Szybka flaga · dla: {koń}”: wybór konia (chipy przy kilku koniach), kafelki z aktywnych szablonów z konfiguracji stajni (MOB-007) i „Inna flaga”; stuknięcie → `/flag/new?horseId=&templateId=` (ekran z MOB-013); bez sekcji, gdy rola nie ma funkcji `flags`.
- [ ] Skrót z przycisków obsługi pod koniem („Podano śniadanie 06:50 · boks gotowy wczoraj 17:30”) renderowany tylko, gdy odpowiedź `client-home` ma to pole (dochodzi w BE-045); bez linii posiłku per koń.
- [ ] `mobile/app/(app)/horse/[horseId].tsx` (KartaKonia, wersja etapu 3): nagłówek („Kasztan · Klient · Boks 7 · Hala główna · wałach, 12 lat”), zakładki sekcji z widoczną tylko „Flagi” (pozostałe dokłada MOB-018), lista flag z „Wstrzymuje śniadanie 06:30, obiad bez zmian” z `card`; 404 → powrót do listy z komunikatem „Nie masz już dostępu do tego konia.” i odświeżenie `GET /me`.
- [ ] Odpytywanie `client-home` przez `use-polled-query`; przełączenie stajni podmienia dane bez mieszania (A-17).

## Poza zakresem
- Ekran nowej flagi i wysyłka (MOB-013), status i odwołanie, lista KlientFlagi (MOB-014), karta konia z planem karmienia, „Dziś”, zdrowiem i historią (MOB-018, MOB-022), MojBoks (MOB-017), stan zawieszonej stajni (MOB-023).
- Weryfikacja skrótu z przycisków i wariantu MainBezAkcji (MOB-017, po BE-045).

## Kryteria akceptacji
- [ ] Anna o 07:15 w Pod Lipami widzi Kasztana i Bellę jak na makiecie Main (godziny, notatki, „Potwierdzona 06:02”, Bella „niepotwierdzona”); w Brzozowej Kometę z „Obowiązuje od razu” i 6 kafelków bez Derki (A-17, A-18).
- [ ] Marek Nowak widzi MainLuna: „Luna · bez boksu · w stajni od pn 12.10”, „Brak aktywnych flag”, 7 kafelków.
- [ ] Nigdzie nie pada słowo „przyjęte”; status nie występuje przy flagach bez `requiresAck`.
- [ ] Po odebraniu dostępu do konia (A-06) koń znika przy najbliższym odpytaniu, a otwarta karta daje komunikat i powrót.

## Testy
- Jest + RNTL: `FlagCard.test.tsx` (krytyczna, statusy, Derka, bez potwierdzeń; ikonka + słowo), `client-home.test.tsx` (Main, MainLuna, MainBrzozowa na fixture'ach zgodnych z `backend/openapi/board.json`), `horse-card.test.tsx` (404).
- [ręcznie] Maestro: `mobile/e2e/maestro/client-main.yaml` (Anna, przełączenie stajni) na seedzie.

## Definicja gotowości
- `npm run check` w `mobile/` zielone (`gen:api` z `board.json`); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Godziny i skutki flag biorą się z serwera (`hoursLabel`, skutki z `lib/rules`); apka ich nie liczy.
- Kolor nigdy nie jest jedynym nośnikiem statusu (paleta.md, WCAG); akcent tylko na elementach klikalnych.
- Zmiana względem listy: dodany szkielet KartaKonia z flagami (dane z BE-038), żeby „Karta” działała od etapu 3; resztę karty robi MOB-018. Skrót z przycisków obsługi i MainBezAkcji sprawdza MOB-017 (dane z BE-045).
