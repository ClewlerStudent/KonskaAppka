---
id: MOB-014
title: StatusFlagi, zmiana i odwołanie flagi, KlientFlagi
area: mobile
stage: 3
size: M
status: todo
depends_on: [MOB-013]
decisions: []
owner:
branch:
trello:
---
# MOB-014 · StatusFlagi, zmiana i odwołanie flagi, KlientFlagi

## Cel
Klient sprawdza, czy obsługa potwierdziła jego flagę (w stajni z potwierdzeniami), zmienia jej godziny albo ją odwołuje ze świadomością skutków. Zakładka Flagi zbiera wszystkie flagi jego koni.

## Kontekst
- Stan kodu: `FlagCard` i KartaKonia z flagami (MOB-012), ekran nowej flagi i arkusz godzin (MOB-013), wzorzec zapisu tylko online (MOB-008), pozycja paska „Flagi” klienta (MOB-005, trasa `mobile/app/(app)/(client)/flags.tsx`). Trasy `operations` (BE-034): `GET /operations/v1/stables/{stableId}/flags/{flagId}` (status z eskalacjami), `GET …/flags?date=&horseId=` (klient: tylko konie z `m[].h`), `POST …/flags/{flagId}/replace` (nowa flaga z `replaces_flag_id`, stara odwołana, jedna transakcja; `{ id, … }` jak przy tworzeniu), `POST …/flags/{flagId}/cancel` (`{ reason? }`).
- Dokumenty: `docs/development-szczegoly.md` 3.5.1 („StatusFlagi: godziny obowiązywania i oś Ustawiona → Potwierdzona (tylko dla flag z `requires_ack`; flaga bez potwierdzeń ma samo „Ustawiona · obowiązuje od razu”)”). `docs/makiety-plan.md` D „StatusFlagiOdwolaj” (arkusz o 07:16: „Odwołać flagę „Bez śniadania” · Kasztan?”; skutki „Śniadanie Hali głównej podano już o 06:40 bez Kasztana.”; „Odwołaj”, „Zostaw”; stany: odwołanie przed posiłkiem „Wstrzymane śniadanie wraca do planu”, po odwołaniu „Odwołana 07:16” w historii, „Zmień” otwiera SzybkaFlaga z danymi flagi i tworzy nową z `replaces_flag_id`), „KlientFlagi” (H1 „Flagi”, chipy Wszystkie · Kasztan · Bella, „Teraz”: Bella · Nie na padok · dziś, cały dzień · niepotwierdzona („Admin stajni dostał powiadomienie”), Kasztan · Bez śniadania · 06:00–10:00 · potwierdzona 06:02; „Później dziś”: Kasztan · Nie na padok · od 14:30; „Zakończone i odwołane · 7 dni”; stany: brak flag, bez funkcji `flags` zakładki nie ma). A-03 (odwołanie przy otwartym pop-upie: wstrzymany posiłek wraca, eskalacja nie wychodzi).
- Makiety: `mockups/project/StatusFlagi.dc.html` („Bez śniadania · Kasztan · Krytyczna · Hala główna · boks 7”, oś „Ustawiona 03:14 → Potwierdzona 06:02”, „Godziny: dziś 06:00–10:00 · wt 13.10”, „Wstrzymuje: śniadanie 06:30”, „Notatka”, „Zmień”, „Odwołaj flagę”, „Inne flagi” z Bellą „NIEPOTWIERDZONA” i „Zadzwoń do stajni”; zdanie „Nikt z obsługi jeszcze jej nie potwierdził.” pomijamy, dec. 38).
- Decyzje: brak nowych.
- Dane demo: Anna (Kasztan: dwie flagi potwierdzone 06:02; Bella: niepotwierdzona od 01:20 z eskalacją do Damiana), Anna w Brzozowej (Kometa, bez potwierdzeń).

## Zakres
- [ ] `mobile/app/(app)/flag/[flagId].tsx` (StatusFlagi): nagłówek z etykietą, koniem, wagą („Krytyczna”) i `boxLabel`; oś: „Ustawiona HH:MM” → „Potwierdzona HH:MM” albo „niepotwierdzona” tylko przy `requiresAck`, inaczej „Ustawiona HH:MM · obowiązuje od razu”; „Godziny”, „Wstrzymuje …” (skutki z serwera), „Notatka”; przy eskalacji `admin_notify` linia „Admin stajni dostał powiadomienie”; „Inne flagi” koni klienta.
- [ ] „Zmień”: otwiera ekran z MOB-013 z danymi flagi (rodzaj, godziny, wariant, notatka) w trybie `replace` → `POST …/flags/{flagId}/replace` z nowym `id`; po sukcesie przejście do statusu nowej flagi.
- [ ] `mobile/app/(app)/flag/cancel.tsx` (StatusFlagiOdwolaj, arkusz): pytanie, skutki (z `flag-preview`/`card` albo pola skutków w `GET …/flags/{id}`), „Odwołaj” → `POST …/cancel` (tylko online), „Zostaw”; po sukcesie „Odwołana HH:MM” i odświeżenie `client-home`.
- [ ] `mobile/app/(app)/(client)/flags.tsx` (KlientFlagi): chipy koni, grupy „Teraz”, „Później dziś”, „Zakończone i odwołane · 7 dni” (jeśli `GET …/flags` nie przyjmuje zakresu dat, na PoC tylko dziś — patrz Uwagi), „Nowa flaga” (→ MOB-013); pusty stan „Brak flag”; zakładka tylko z funkcją `flags`.
- [ ] Odpytywanie statusu na widocznym ekranie (MOB-007), żeby „Potwierdzona 06:02” pojawiała się sama.
- [ ] Wejścia: karta konia i Main (stuknięcie flagi → status), pozycja paska „Flagi”.

## Poza zakresem
- Potwierdzanie flag przez obsługę i admina (MOB-015); flagi instruktora tylko do odczytu (MOB-022).

## Kryteria akceptacji
- [ ] Anna widzi status Kasztana „Ustawiona 03:14 → Potwierdzona 06:02” bez autora potwierdzenia; Bella „niepotwierdzona” z „Admin stajni dostał powiadomienie”.
- [ ] A-03: odwołanie „Bez śniadania” przed 06:30 pokazuje skutek „Wstrzymane śniadanie wraca do planu”; po 06:40 skutek „Śniadanie Hali głównej podano już o 06:40 bez Kasztana.”; po odwołaniu flaga ma „Odwołana HH:MM” i znika z „Teraz”.
- [ ] „Zmień” godzin „Nie na padok” tworzy nową flagę z `replaces_flag_id`, a stara jest odwołana (jedna flaga aktywna w Main).
- [ ] Kometa w Brzozowej ma „obowiązuje od razu”, bez osi potwierdzenia.

## Testy
- Jest + RNTL: `flag-status.test.tsx` (warianty `requiresAck`, eskalacja), `flag-cancel.test.tsx` (skutki, błąd sieci), `client-flags.test.tsx` (grupy, chipy, brak funkcji) na atrapie `operations`.
- Maestro: `mobile/e2e/maestro/client-flag-status.yaml` (zmiana i odwołanie na seedzie).

## Definicja gotowości
- `npm run check` w `mobile/` zielone; flow Maestro przechodzi; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Autora potwierdzenia klient nie widzi (A-01: „Potwierdzona 06:02”, bez autora).
- „Zadzwoń do stajni” tylko, gdy apka zna numer (patrz MOB-013 „Uwagi”).
- Grupa „Zakończone i odwołane · 7 dni” korzysta z zakresu dat `GET …/flags?from=&to=` (dopisany do BE-034 przy domykaniu kolejki). Jeśli BE-034 zamknięto bez niego, dopisz go addytywnie w `backend/src/contracts/operations.ts` w osobnym PR.
