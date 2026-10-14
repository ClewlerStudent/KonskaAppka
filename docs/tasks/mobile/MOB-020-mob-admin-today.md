---
id: MOB-020
title: AdminDzis, BoksSzczegoly z historią i „Woda”, rutyna w BoksyAdmin
area: mobile
stage: 6
size: M
status: todo
depends_on: [BE-044, BE-045, MOB-008, MOB-009, MOB-010, MOB-016]
decisions: [DEC-15, DEC-16, DEC-18]
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/bFJGw0qp
---
# MOB-020 · AdminDzis, BoksSzczegoly z historią i „Woda”, rutyna w BoksyAdmin

## Cel
Admin zaczyna dzień od ekranu „Dziś”: pilne niepotwierdzone flagi (z informacją o wysłanym SMS-ie i e-mailu), szybkie akcje jak obsługa, flagi, wizyty, zadania i sprawy do załatwienia. W szczegółach boksu widzi historię i przy poidle ręcznym zapisuje „Woda”.

## Kontekst
- Stan kodu: szkielet `mobile/app/(app)/(admin)/index.tsx` (MOB-005), `QuickActions` i siatka „Boks gotowy” (MOB-016), BoksyAdmin i BoksSzczegoly etapu 2 (MOB-009), `InvitationList` i PrzeniesKonia (MOB-010), kolejka (MOB-008), `FlagCard` i potwierdzanie (MOB-015). Trasy `board` (BE-045): `GET /board/v1/stables/{stableId}/admin-today` (pilne: niepotwierdzone flagi i eskalacje; szybkie akcje jak `…/day`; flagi dziś z licznikiem „4 z 5 potwierdzone”; wizyty i jazdy dziś; skrót zadań; „Do załatwienia”: konie bez boksu i liczba wolnych boksów — zaproszenia apka bierze z `auth`), `GET …/boxes/{boxId}/details` (boks, hala z adresem, `autoWaterer`, ostatnie zdarzenia, obecny albo ostatni koń z datą i miejscem przeniesienia, skrót historii), `boxes-overview` z „Boks gotowy” i godziną wody. Trasy `operations` (BE-044): `POST …/box-care-events` (`kind: water` tylko przy `autoWaterer = false`, inaczej 409; `tidy`), `…/undo`. `GET /auth/v1/stables/{stableId}/horse-clients` (telefon klienta dla admina), `GET …/invitations` (BE-022).
- Dokumenty: `docs/makiety-plan.md` C „AdminDzis” (Damian; „Pilne”: „Bella · Hala nowa · boks 4 · Nie na padok · dziś, cały dzień · niepotwierdzona od 01:20 · dostałeś SMS i e-mail”, „Potwierdzam”, „Zadzwoń do klienta (Anna)”; „Szybkie akcje” jak ListaDnia; „Flagi dziś”; „Wizyty”: wet 08:00 i kowal 15:00 · Kasztan, jazda 16:00 · Iskra; „Zadania”: 1 do wzięcia · 1 w toku (Piotr) · 1 zrobione, „+ Dodaj zadanie”; „Do załatwienia”: Luna bez boksu („Przypisz boks”), Marek Nowak · zaproszenie wygasa czw 15.10, +48 512 *** 908 · zaproszenie wygasło 08.10 („Wyślij ponownie”); stany: ● AdminDzisBrzozowa (bez „Pilne”, padoku i hal; „Podano śniadanie ✓ 06:35 · Paweł”, „Boks gotowy 3 z 6”, „Zadania: brak”), bez pilnych flag, przyciski wyłączone, pusta stajnia, offline, subskrypcja po terminie), G „BoksSzczegolyWoda” (H1 „Hala nowa · boks 5”, Bursztyn, „Poidło ręczne · woda 06:55 (tablet)” z „Woda”; „Ostatnio przy boksie”: Boks gotowy 07:14 (tablet), Woda 06:55 (tablet), Podano śniadanie 06:50 · Piotr (cała hala); „Zadania”: „Poidło w boksie 5 do wymiany · do wzięcia”; „Ustawienia boksu”: „Automatyczne poidło: nie”; stopka „Boks gotowy”, „Przenieś konia”; stany: widok Piotra bez ustawień, po „Woda” „woda 07:16 · Piotr” z „Cofnij”, poidło „tak” bez znacznika, przyciski wyłączone („Woda” zostaje)), docs/makiety-plan.md 5 pkt 26 (wejście do „Woda” z linii w ListaDnia). `docs/development-szczegoly.md` 3.5.1 (BoksyAdmin: „Boks gotowy dziś 07:10” zamiast osobnych czynności; BoksyAdminBezAkcji bez tej linii). A-02, A-05, A-16, A-19.
- Makiety: `docs/mockups/project/AdminDzis.dc.html`, `BoksSzczegoly.dc.html` („Ostatnio przy boksie”, „Kto korzysta z boksu · Ostatni koń · Wicher · do 01.10 · przeniesiony: Hala główna · boks 5”, „Historia · Cała historia”), `BoksyAdmin.dc.html` i `BoksyAdminBezAkcji.dc.html`.
- Decyzje: DEC-15 A (pasek admina), DEC-16 A (bez dzwonka: eskalacje SMS/e-mail i sekcja „Pilne”), DEC-18 A („Cofnij” 1 h).
- Dane demo: Damian o 07:15 w Pod Lipami i Brzozowej, HN 5 (Bursztyn, poidło ręczne, woda 06:55 z tabletu), HN 6 (wolny, ostatni koń Wicher), Piotr (obsługa w BoksSzczegolyWoda), wariant BezAkcji.

## Zakres
- [ ] `mobile/app/(app)/(admin)/index.tsx` (AdminDzis): „Pilne” (`FlagCard` z „niepotwierdzona od 01:20 · dostałeś SMS i e-mail” przy eskalacji, „Potwierdzam” przez kolejkę, „Zadzwoń do klienta (Anna)” z telefonem z `horse-clients`), `QuickActions` (MOB-016), „Flagi dziś” z licznikiem, „Wizyty i jazdy”, „Zadania” (skrót, „+ Dodaj zadanie” → `/tasks/new` z MOB-021, ukryte do tego czasu), „Do załatwienia” (konie bez boksu z „Przypisz boks” → PrzeniesKonia; zaproszenia wygasające i wygasłe z `InvitationList` i „Wyślij ponownie”); sekcje bez danych znikają; baner „uwaga” przy subskrypcji po terminie, jeśli `board` poda stan (etap 8).
- [ ] AdminDzisBrzozowa: ten sam ekran na danych Brzozowej (bez hal, bez padoku i „Pilne”).
- [ ] `mobile/app/(app)/box/[boxId].tsx` — rozszerzenie z MOB-009 o `GET …/boxes/{boxId}/details`: „Ostatnio przy boksie” (z tabletu oznaczone „(tablet)”), „Kto korzysta z boksu” (koń albo ostatni koń z datą i miejscem przeniesienia), skrót „Historia”, „Zadania” boksu (gdy `tasks`), stopka „Boks gotowy” (`enqueueBoxCare` `tidy` dla jednego boksu) i „Przenieś konia” (MOB-010); dostęp także dla obsługi (bez sekcji ustawień); linia „Poidło ręczne · Hala nowa · boks 5 · woda 06:55” w ListaDnia (MOB-016) dostaje link do `/box/[boxId]` (docs/makiety-plan.md 5 pkt 26).
- [ ] „Woda” (BoksSzczegolyWoda): przy `autoWaterer = false` znacznik „Poidło ręczne · woda 06:55 (tablet)” i przycisk „Woda” → `enqueueBoxCare` `water`, po zapisie „woda 07:16 · Piotr” z „Cofnij”; przy poidle automatycznym ani znacznika, ani przycisku; „Woda” zostaje przy wyłączonych przyciskach obsługi.
- [ ] BoksyAdmin (MOB-009): linia „Boks gotowy dziś 07:10” / „wczoraj 16:10 · Piotr” przy boksach i godzina wody przy poidle ręcznym; w wariancie BezAkcji bez linii „Boks gotowy”.

## Poza zakresem
- Zadania (lista i dodawanie: MOB-021), jazdy (MOB-022), stan zawieszonej stajni (MOB-023), pełny ekran „Cała historia” (P3).

## Kryteria akceptacji
- [ ] A-02: Damian o 07:15 ma w „Pilne” Bellę „niepotwierdzona od 01:20 · dostałeś SMS i e-mail”; „Potwierdzam” z apki potwierdza flagę (`method = app`) i Bella znika z „Pilne”.
- [ ] AdminDzis Pod Lipami i AdminDzisBrzozowa zgodne z makiety-plan (szybkie akcje, flagi, wizyty, „Do załatwienia” z Luną i zaproszeniami).
- [ ] A-16: HN 5 ma „Poidło ręczne · woda 06:55 (tablet)” i „Woda”; Piotr zapisuje „Woda”, znacznik pokazuje nowszą godzinę, „Cofnij” w ciągu godziny przywraca 06:55; HG 7 i HN 4 nie mają znacznika ani przycisku.
- [ ] A-05: szczegóły HN 6: ostatni koń Wicher do 01.10, przeniesiony do „Hala główna · boks 5”, „Boks gotowy 09.10 14:40 · Piotr”.
- [ ] A-19: BoksyAdminBezAkcji bez linii „Boks gotowy …”; reszta listy bez zmian.

## Testy
- Jest + RNTL: `admin-today.test.tsx` (Pod Lipami, Brzozowa, bez pilnych, BezAkcji), `box-details-full.test.tsx` (woda, poidło automatyczne, widok obsługi, ostatni koń) na fixture'ach z `backend/openapi/board.json`.
- [ręcznie] Maestro: `mobile/e2e/maestro/admin-today.yaml` (A-02, A-16 na seedzie).

## Definicja gotowości
- `npm run check` w `mobile/` zielone; flow Maestro przechodzi [ręcznie]; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Bez dzwonka i skrzynki powiadomień (DEC-16): o eskalacji admin wie z SMS-a, e-maila i „Pilne”.
- Szybkie akcje, potwierdzenia, „Boks gotowy” i „Woda” idą przez kolejkę (MOB-008).
- Zmiana względem listy: dodane zależności MOB-016 (wspólny komponent szybkich akcji) i MOB-010 (PrzeniesKonia, lista zaproszeń w „Do załatwienia”); przejęte z MOB-009 sekcje historii w BoksSzczegoly, linia „Boks gotowy” w BoksyAdmin i wariant BoksyAdminBezAkcji.
