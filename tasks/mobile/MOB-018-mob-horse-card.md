---
id: MOB-018
title: KartaKonia (plan karmienia, Dziś, historia) dla klienta, obsługi i admina
area: mobile
stage: 6
size: M
status: todo
depends_on: [BE-043, BE-045, MOB-012, BE-024]
decisions: []
needs: [emulator]
owner:
branch:
trello:
---
# MOB-018 · KartaKonia (plan karmienia, Dziś, historia) dla klienta, obsługi i admina

## Cel
Karta konia mówi w jednym miejscu, co koń dziś ma (flagi, padok, wizyty), jak jest karmiony (z „namoczyć”) i co się działo. Klient widzi swoje konie, obsługa i admin każdego konia stajni, z wejściem do edycji planu i flagi w imieniu klienta.

## Kontekst
- Stan kodu: szkielet `mobile/app/(app)/horse/[horseId].tsx` z nagłówkiem i flagami (MOB-012), `FlagCard`, konfiguracja (moczenie, padok, funkcje roli) (MOB-007). Trasy: `GET /board/v1/stables/{stableId}/horses/{horseId}/card?lang=` (klient: swój koń; obsługa; admin) po BE-045 z planem karmienia (funkcja `feeding_plan`, „namoczyć” tylko przy `soak_enabled`), sekcją „Dziś” (flagi, padok skrócony flagą, wizyty i jazdy według `health` i `rides`, wpis `owner_private` tylko dla klienta z koniem i admina) i skrótem historii; `GET /operations/v1/stables/{stableId}/horses/{horseId}/feeding-plan` i `…/paddock-plan` (wersja do edycji, BE-043); `GET /auth/v1/stables/{stableId}/horse-clients` (imię klienta; telefon tylko dla admina, BE-024).
- Dokumenty: `docs/development-szczegoly.md` 3.5.1 („KartaKonia: plan karmienia z „namoczyć” i ile (plan tylko przy widoczności `feeding_plan` dla klienta, „namoczyć” tylko przy włączonym moczeniu), „Dziś” (wet 8:00, padok B 10:00–14:30 tylko przy włączonym padoku, kowal 15:00), flagi z godzinami; KartaKoniaBezAkcji: „Dziś” bez padoku…, w „Historii” najnowsze zdarzenie flagi zamiast „Boks gotowy””). `docs/makiety-plan.md` G „KartaKoniaKometa” (Anna w Brzozowej: „Kometa · boks 1 · klacz”, „Dziś”: „Bez śniadania 06:00–09:00 · dentysta o 8:30 · obowiązuje od razu”; bez planu karmienia i jazd), „KartaKoniaObsluga” (Ola; chip „Obsługa”, „← Konie”; „Klient: Anna” z „Zadzwoń”; „Edytuj plan” i „Flaga”; stany: obsługa bez `feeding_plan`, admin). `docs/mikroserwisy.md` 8 (imiona klientów: obsługa R; telefon tylko admin i admin globalny). A-12 (padok B skrócony do 10:00–14:30), A-17, A-19, A-21.
- Makiety: `mockups/project/KartaKonia.dc.html` (nagłówek „Kasztan · Klient · Boks 7 · Hala główna · wałach, 12 lat”; zakładki Flagi | Karmienie | Zdrowie | Historia; „Dziś · wt 13.10”: „Bez śniadania 06:00–10:00 · Wstrzymuje śniadanie 06:30, obiad bez zmian · Potwierdzona 06:02”, „Wet · na czczo · 08:00”, „Padok B · z: Fala, Rumba · plan pn–pt 10:00–16:00, dziś krócej · 10:00–14:30”, „Nie na padok · 14:30–16:00”, „Kowal 15:00”; „Plan karmienia”: Śniadanie 06:30 Owies 1,5 kg, Siano bez ograniczeń, Suplement X 1 miarka; Obiad 12:00; Kolacja 18:00 … Wysłodki 0,5 kg „Namoczyć · w 2 l wody”; „Historia · Dziś 07:10 · Boks gotowy”), `KartaKoniaBezAkcji.dc.html`.
- Decyzje: brak nowych.
- Dane demo: Anna (Kasztan, Kometa), Ola (obsługa, Kasztan), Damian (admin), wariant BezAkcji.

## Zakres
- [ ] Rozszerzenie `mobile/app/(app)/horse/[horseId].tsx` o sekcje widoczne według funkcji roli i opcji stajni: „Dziś” (flagi z godzinami i skutkami, padok z towarzyszami i informacją o skróceniu, wizyty i jazdy z `card`, jeśli są), „Plan karmienia” (pory z `meal_slots`, pozycje: pasza, ilość albo „bez ograniczeń”, „Namoczyć · w 2 l wody” przy `soak_enabled`), skrót „Historia” z wejściem do MojBoks (klient) albo historii boksu.
- [ ] Zakładki-kotwice „Flagi | Karmienie | Zdrowie | Historia” tylko dla widocznych sekcji („Zdrowie” wypełnia MOB-022).
- [ ] Wariant obsługi i admina (KartaKoniaObsluga): wejście ze StajennyKonie i BoksyAdmin, chip roli, „Klient: Anna” z `horse-clients`; „Zadzwoń” (`tel:`) tylko gdy API podaje telefon (admin); „Edytuj plan” (→ `/horse/[horseId]/plan`, MOB-019; ukryte bez uprawnień zapisu) i „Flaga” (→ SzybkaFlagaObsluga, MOB-015).
- [ ] Klient edytuje plan tylko przy `owner_edits_feeding` (z konfiguracji stajni) — wtedy widzi „Edytuj plan”.
- [ ] Odpytywanie karty na widocznym ekranie; 404 jak w MOB-012.

## Poza zakresem
- Formularz edycji planu (MOB-019); lista wizyt w sekcji „Zdrowie”, jazdy i `owner_private` (MOB-022).

## Kryteria akceptacji
- [ ] Anna o 07:15: karta Kasztana jak na makiecie KartaKonia (Dziś z wetem 08:00, padok B 10:00–14:30 z Falą i Rumbą, kowal 15:00; plan z wysłodkami „Namoczyć · w 2 l wody”).
- [ ] A-19: po wyłączeniu moczenia „Namoczyć” znika; po wyłączeniu padoku znika padok z „Dziś”, a flaga „Nie na padok” zostaje; KartaKoniaBezAkcji ma w „Historii” najnowsze zdarzenie flagi.
- [ ] A-17: Kometa w Brzozowej bez planu karmienia i jazd, z „obowiązuje od razu”.
- [ ] A-21: po odznaczeniu klientowi `feeding_plan` sekcja planu znika przy najbliższym odpytaniu.
- [ ] Ola widzi „Klient: Anna” bez telefonu, z „Edytuj plan” i „Flaga”; Damian widzi „Zadzwoń”.

## Testy
- Jest + RNTL: `horse-card.test.tsx` (klient, obsługa, admin, Kometa, BezAkcji, bez `feeding_plan`) na fixture'ach z `backend/openapi/board.json`.
- [ręcznie] Maestro: `mobile/e2e/maestro/horse-card.yaml` (Anna i Ola na seedzie).

## Definicja gotowości
- `npm run check` w `mobile/` zielone; flow Maestro przechodzi [ręcznie]; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Nazwy pasz pojawiają się tylko w planie karmienia, nigdy jako zdarzenia (A-13).
- Zmiana względem makiety-plan (docs/makiety-plan.md 5 pkt 27): „Zadzwoń” do klienta w karcie obsługi pokazujemy tylko adminowi, bo docs/mikroserwisy.md 8 (pierwszeństwo) daje obsłudze same imiona klientów, bez telefonu.
