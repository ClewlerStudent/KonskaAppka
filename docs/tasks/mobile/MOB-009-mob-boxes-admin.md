---
id: MOB-009
title: BoksyAdmin i BoksSzczegoly w apce admina
area: mobile
stage: 2
size: M
status: todo
depends_on: [BE-022, BE-024, BE-031, BE-033, MOB-007]
decisions: [DEC-15]
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/dnpHXEDI
---
# MOB-009 · BoksyAdmin i BoksSzczegoly w apce admina

## Cel
Admin (Damian) w zakładce Boksy widzi wszystkie boksy stajni w grupach hal, wolne boksy, konie bez boksu i klientów przy koniach, a w szczegółach boksu przełącza „Automatyczne poidło”. To wejście do przypisywania i przenoszenia koni (MOB-010).

## Kontekst
- Stan kodu: pasek admina z pozycją Boksy (MOB-005, trasa `mobile/app/(app)/(admin)/boxes.tsx`), konfiguracja i odpytywanie z ETag, `boxLabel` (MOB-007). Trasy: `GET /board/v1/stables/{stableId}/boxes-overview` (admin: `buildingCount`, liczniki, hale z adresem i zakresem boksów, boksy z DTO `{ id, label, building, autoWaterer, active, version }` i koniem, konie bez boksu; pola flag i „Boks gotowy” opcjonalne) — BE-033; `PATCH /stables/v1/stables/{stableId}/boxes/{boxId}` (`{ autoWaterer }`, `If-Match` z `version`, tylko admin) — BE-031; `GET /auth/v1/stables/{stableId}/horse-clients` (klienci przy koniach, telefon tylko dla admina) — BE-024; `GET /auth/v1/stables/{stableId}/invitations` (zaproszenie klienta z `horseId`, status `pending`) — BE-022.
- Dokumenty: `docs/development-szczegoly.md` 3.5.1 „Obsługa i admin” (BoksyAdmin i BoksSzczegoly: flagi z godzinami, klient przy koniu „Marek Nowak przy Lunie, zaproszenie czeka”, przyciski „Boks gotowy” i „Przypisz konia”, przy poidle ręcznym znacznik „Poidło ręczne · woda 06:55”, w BoksSzczegoly przełącznik „Automatyczne poidło: tak/nie” dla admina), 4.1 „Apka mobilna” (lista boksów w grupach hal z filtrem; wybór boksu wysyła `boxId`). `docs/makiety-plan.md` 3.H L1 („Admin w apce”: pasek Dziś | Boksy | Zadania | Ludzie | Profil, bez dzwonka; „Szczegóły” wolnego boksu → BoksSzczegoly). A-04 (Luna bez boksu, klient „zaproszenie czeka”), A-05 (wolne boksy Hala główna · boks 3 i Hala nowa · boks 6), A-10 (ten sam numer w dwóch halach), A-16 (przełącznik poidła tylko admin).
- Makiety: `docs/mockups/project/BoksyAdmin.dc.html` (wyszukiwarka „Szukaj boksu, konia lub osoby”, chipy „Wszystkie · 14 | Z koniem · 12 | Wolne · 2 | Koń bez boksu · 1”, „Boksy · wg hal i numerów”, nagłówek hali „Hala główna · boksy 1–8 · ul. Lipowa 12, Konstancin-Jeziorna”, wiersze „Boks 1 · Iskra · Przenieś · Szczegóły”, „Boks 3 · Wolny · Przypisz konia · Szczegóły”, „Konie bez boksu · 2 wolne boksy”, „Luna · Nowy koń · Klient: Marek Nowak · zaproszenie czeka · Dodana 12.10 · Przypisz boks”), `BoksSzczegoly.dc.html` (H1 „Boks 6”, „Wolny”, „Hala nowa · ul. Polna 3, Konstancin-Jeziorna”, „Ustawienia boksu · Automatyczne poidło”). Stary pasek z makiety (Boksy | Ludzie | Płatności | Ustawienia) i opis pod przełącznikiem poidła nie obowiązują (DEC-15, docs/makiety-plan.md 2.3 i 5 pkt 38).
- Decyzje: brak nowych.
- Dane demo: Damian; Pod Lipami (14 boksów, wolne HG 3 i HN 6, Luna bez boksu z zaproszeniem Marka), Brzozowa (boksy 1–6 bez hal, wolny 5).

## Zakres
- [ ] `mobile/app/(app)/(admin)/boxes.tsx` (BoksyAdmin): `GET …/boxes-overview` przez `use-polled-query` (MOB-007); równolegle `horse-clients` i `invitations` (statusy `pending` z `horseId`) do linii „Klient: …” i „zaproszenie czeka”.
- [ ] Wyszukiwarka po numerze boksu, nazwie konia i imieniu klienta (lokalnie); chipy filtrów z licznikami; grupy hal według `sortOrder` z adresem i zakresem; przy jednej hali bez grup i bez hali przy numerze (Brzozowa).
- [ ] Wiersz boksu: numer, koń albo „Wolny”, akcje „Przenieś” / „Przypisz konia” (prowadzą do arkusza z MOB-010; do tego czasu ukryte) i „Szczegóły” (→ `/box/[boxId]`); znacznik „Poidło ręczne · woda HH:MM” przy `autoWaterer = false` (bez godziny, dopóki `board` jej nie poda); sekcja „Konie bez boksu” z „Przypisz boks”.
- [ ] `mobile/app/(app)/box/[boxId].tsx` (BoksSzczegoly) w wersji etapu 2: nagłówek z numerem, halą i adresem, koń albo „Wolny”, klient przy koniu; sekcja „Ustawienia boksu” tylko dla admina z przełącznikiem „Automatyczne poidło” → `PATCH …/boxes/{boxId}` z `If-Match`; `412` → odświeżenie i komunikat „Ktoś zmienił ten boks. Odśwież i spróbuj ponownie.”; przycisk „Przypisz konia” przy wolnym boksie.
- [ ] Komponenty wielokrotnego użytku: `BoxRow`, `HallSection`, `FilterChips`, `SearchField` w `mobile/src/components/` (użyją ich MOB-010, MOB-015, MOB-020).
- [ ] Obsługa zawieszonej stajni i braku uprawnień: obsługa nie ma tej zakładki (403 nie powinien wystąpić; jeśli wystąpi, komunikat ogólny).

## Poza zakresem
- Flagi przy boksach i potwierdzanie (MOB-015); linia „Boks gotowy dziś 07:10”, wariant BoksyAdminBezAkcji, sekcje „Ostatnio przy boksie”, „Kto korzysta z boksu” i „Historia” w BoksSzczegoly oraz przycisk „Boks gotowy” i „Woda” (MOB-020; dane z BE-044/BE-045).
- Przypisanie, przeniesienie, zamiana koni i zaproszenie (MOB-010).

## Kryteria akceptacji
- [ ] Damian w Pod Lipami widzi dwie hale z adresami, chipy z liczbami 14 / 12 / 2 / 1, oba „boks 4” z różnymi halami; wyszukanie „4” zwraca dwa boksy z nazwami hal.
- [ ] Luna jest w „Koniach bez boksu” z „Klient: Marek Nowak · zaproszenie czeka” (A-04); wolne HG 3 i HN 6 mają „Przypisz konia” (A-05).
- [ ] W szczegółach HN 5 przełącznik pokazuje „nie”, a po włączeniu znacznik „Poidło ręczne” znika z listy przy najbliższym odpytaniu (A-16); jednoczesna zmiana z panelu daje 412 i komunikat.
- [ ] W Brzozowej lista bez hal: „boks 1 … boks 6”.
- [ ] Ekran nie ma dzwonka ani pozycji Płatności i Ustawienia w pasku.

## Testy
- Jest + RNTL: `boxes.test.tsx` (filtry, wyszukiwanie, jedna i dwie hale, klient i zaproszenie), `box-details.test.tsx` (przełącznik, 412, rola obsługi bez sekcji ustawień) na odpowiedziach zgodnych z `backend/openapi/board.json`, `stables.json`, `auth.json`.
- [ręcznie] Maestro: `mobile/e2e/maestro/admin-boxes.yaml` (Damian: filtr, szczegóły HN 5, przełącznik poidła) na seedzie.

## Definicja gotowości
- `npm run check` w `mobile/` zielone (`gen:api` z `board.json` i `stables.json`); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- `board` nie woła `auth`: imiona klientów i zaproszenia apka dociąga sama (docs/mikroserwisy.md 5.4).
- Boks zawsze po `id`; etykieta przez `boxLabel` (MOB-007).
- Zmiana względem listy: dodane zależności BE-022 i BE-024 (klient i „zaproszenie czeka” pochodzą z `auth`); linia „Boks gotowy”, wariant BezAkcji i sekcje historii boksu przeniesione do MOB-020, bo ich dane (`…/boxes/{b}/details`, rutyna) powstają dopiero w BE-045.
