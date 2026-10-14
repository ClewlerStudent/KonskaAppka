---
id: TAB-010
title: "Wybór boksu: TabletPierwszyBoks, TabletZmianaBoksu, TabletBoksNiedostepny"
area: tablet
stage: 4
size: M
status: todo
depends_on: [BE-041, TAB-009]
decisions: []
owner:
branch:
trello:
---
# TAB-010 · Wybór boksu: TabletPierwszyBoks, TabletZmianaBoksu, TabletBoksNiedostepny

## Cel
Każdy, kto stoi przy tablecie, może wskazać, który boks ten tablet pokazuje: pierwszy raz po zalogowaniu i potem przyciskiem „Zmień boks”. Wybór to `id` boksu zapisane tylko na tablecie; przetrwa restart, aktualizację APK i ponowne logowanie, a przy dwóch halach z tymi samymi numerami nigdy nie pomyli boksów.

## Kontekst
- **Stan kodu:** sesja i `GET /me` z TAB-009 (stajnia konta tabletów w `stableId`), klient API i tryb `fake` z TAB-001 (fixture'y `boxes-podlipami.json`, `boxes-brzozowa.json`), komponenty z TAB-008. `GET /board/v1/stables/{stableId}/boxes` z BE-041: aktywne hale według `sort_order`, w każdej boksy z `id`, numerem, koniem albo „wolny”, sortowanie naturalne.
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 „TabletZmianaBoksu” (lista z `board GET …/boxes` w zakładkach hal; otwarta zakładka hali bieżącego boksu; jedna hala = lista bez zakładek; konto tabletów ma jedną stajnię, bez wyboru stajni; ta sama lista bez powrotu po 30 s to TabletPierwszyBoks z nagłówkiem „WYBIERZ BOKS”; przycisk boksu z numerem i koniem, wolny oznaczony; przełączenie od razu po stuknięciu; powrót do poprzedniego boksu po 30 s bez wyboru; wybór `boxes.id` lokalnie), 4.3.1 T-28 („Zmień boks”: 30 s liczone od ostatniego dotknięcia listy, propozycja; nowy pop-up w trakcie wybierania; boks przeniesiony do innej hali zostaje na tym samym `id`; nowa hala = nowa zakładka przy najbliższym odpytaniu), 5 pkt 32 (zapamiętany boks w wyłączonej hali albo niedostępny dla konta: od razu lista, bez powrotu po 30 s), 4.4 A-05, A-10, A-11, A-17; `docs/erd.md` pkt 2.
- **Makiety:** `mockups/project/TabletPierwszyBoks.dc.html` („WYBIERZ BOKS”, zakładki „Hala główna · boksy 1–8” i „Hala nowa · boksy 1–6”, kafle „Boks 1 · Iskra”, „Boks 3 · wolny” z ramką przerywaną; stopka ONLINE, PL | UA), `TabletZmianaBoksu.dc.html` („Zmień boks”, „Teraz: boks 7 · Kasztan”, „Anuluj”, kafel bieżący z „TERAZ”, „Stuknij boks, a tablet od razu pokaże jego tablicę. Wybór zapisuje się tylko na tym tablecie.”, „Bez wyboru powrót do boksu 7 za 30 s”); TabletBoksNiedostepny z `docs/makiety-plan.md` E (linia `t-warn` „HALA GŁÓWNA · BOKS 7 NIEDOSTĘPNY”, lista od razu).
- **Decyzje:** brak.
- **Dane demo:** Pod Lipami: Hala główna 1 Iskra, 2 Dukat, 3 wolny, 4 Sonata, 5 Wicher, 6 Fala, 7 Kasztan, 8 Hetman; Hala nowa 1 Grom, 2 Mgła, 3 Rumba, 4 Bella, 5 Bursztyn, 6 wolny; Brzozowa (konto „Tablety Brzozowa”): 1 Kometa, 2 Dąb, 3 Iga, 4 Lord, 5 wolny, 6 Nuta, bez zakładek.

## Zakres
- [ ] `tablet/src/box/selection.ts`: zapis `{ stableId, boxId, buildingId, label }` w pamięci lokalnej (SQLite z TAB-013 albo `AsyncStorage` z try/catch; przetrwa `adb install -r`), odczyt przy starcie; wybór należy do stajni z `GET /me`, inaczej traktowany jak niedostępny.
- [ ] `useBoxes()` (`GET …/boxes`, ETag/304, odświeżanie przy otwarciu listy i przy każdym odpytaniu tablicy co kilka minut), grupowanie po halach; kolejność hal i boksów z odpowiedzi (bez własnego sortowania po numerze).
- [ ] `FirstBoxScreen` (TabletPierwszyBoks): nagłówek „WYBIERZ BOKS”, zakładki hal (pierwsza otwarta; jedna hala = bez zakładek), siatka kafli (numer, koń albo „WOLNY” z ramką przerywaną), bez „Anuluj” i bez powrotu po 30 s; stuknięcie zapisuje wybór i przechodzi do tablicy.
- [ ] `ChangeBoxScreen` (TabletZmianaBoksu), otwierany przyciskiem „Zmień boks” z tablicy: „Teraz: boks N · Koń”, „Anuluj”, zakładka hali bieżącego boksu otwarta, kafel bieżący z „TERAZ”, opis z makiety, licznik „Bez wyboru powrót do boksu N za 30 s” (30 s od ostatniego dotknięcia listy, także przełączenia zakładki; zegar z `Date` serwera nie jest potrzebny, wystarczy monotoniczny), po upływie powrót do poprzedniego boksu bez zapisu; pełne odświeżenie EPD przy wejściu i wyjściu (TAB-005).
- [ ] `BoxUnavailable` (TabletBoksNiedostepny): gdy `GET …/boxes/{b}` daje 404 albo boksu nie ma na liście (wyłączona hala, inna stajnia po zalogowaniu innym kontem): linia `StatusField` uwaga „HALA GŁÓWNA · BOKS 7 NIEDOSTĘPNY” i od razu lista jak TabletPierwszyBoks (bez powrotu po 30 s).
- [ ] Etykieta boksu wszędzie: przy kilku halach „Hala nowa · boks 4”, przy jednej sam numer („BOKS 1”); funkcja `boxLabel(box, buildingsCount)` z testami.
- [ ] Nowy pop-up w trakcie wybierania (T-28): lista zostaje otwarta, pop-up pokazuje się po wyborze albo po powrocie (stan kolejki pop-upów to TAB-014; tu tylko punkt zaczepienia `onSelectionClosed`).

## Poza zakresem
- Tablica boksu (TAB-011), pop-upy (TAB-014), blokada ekranu (TAB-015, przy blokadzie „Zmień boks” się nie otwiera).
- Wybór stajni (nie ma: konto tabletów ma jedną stajnię).

## Kryteria akceptacji
- [ ] A-10: na tablecie wybranie „Hala nowa” → „Boks 4” zapisuje `id` boksu 4 Hali nowej; po 30 s bez wyboru na liście otwartej z Hala główna · boks 4 tablet wraca do Hala główna · boks 4, nie do boksu 4 drugiej hali.
- [ ] A-05: „Boks 3 · wolny” i „Boks 6 · wolny” oznaczone w zakładkach swoich hal.
- [ ] A-11: nowa hala dodana w panelu pojawia się jako zakładka przy najbliższym odpytaniu listy; boks przeniesiony do nowej hali zostaje wybrany (to samo `id`), a zakładka i etykieta pokazują nową halę.
- [ ] A-17: konto „Tablety Brzozowa” widzi tylko boksy 1–6 bez zakładek i bez nazwy hali.
- [ ] Wybór przetrwa zabicie procesu, `adb install -r` i wylogowanie z ponownym logowaniem (T-28); zapamiętany boks w wyłączonej hali daje TabletBoksNiedostepny.

## Testy
- Jest + RNTL z fixture'ami: grupowanie, etykiety, powrót po 30 s z fałszywymi timerami (`jest.useFakeTimers`), reset licznika po dotknięciu, BoxUnavailable.
- Emulator: flow Maestro `tablet/e2e/maestro/change-box.yaml` (rozbudowa w TAB-019).

## Definicja gotowości
- `npm run check` w `tablet/` zielone; zrzuty ekranów w galerii (TAB-008) zaktualizowane; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Nigdy nie szukaj boksu po numerze: tylko po `id` (numery powtarzają się między halami).
- Serwer o wyborze nie wie; nie wysyłaj go nigdzie poza nagłówkiem `X-Box-Id` przy zapisach (TAB-013).
- Bez przewijania z animacją; przy wielu boksach strony siatki zamiast przewijania płynnego (K-05: szybki tryb przy przewijaniu gubi kolor).
