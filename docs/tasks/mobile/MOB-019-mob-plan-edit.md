---
id: MOB-019
title: EdycjaPlanuKonia (plan karmienia i padoku)
area: mobile
stage: 6
size: M
status: todo
depends_on: [MOB-018]
decisions: [DEC-20]
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/X4IsfyBq
---
# MOB-019 · EdycjaPlanuKonia (plan karmienia i padoku)

## Cel
Obsługa i admin (a klient przy włączonej opcji stajni) zmieniają plan karmienia konia (pasze, pory, ilości, namaczanie) i plan padoku (padok, dni, godziny, towarzysze) z telefonu, bez nadpisywania cudzych zmian.

## Kontekst
- Stan kodu: karta konia z „Edytuj plan” (MOB-018), konfiguracja stajni (`soak_enabled`, padok włączony, `owner_edits_feeding`, pory posiłków) (MOB-007). Trasy `operations` (BE-043): `GET`, `PUT /operations/v1/stables/{stableId}/horses/{horseId}/feeding-plan` (pory `mealSlotId` z pozycjami `{ feedId, quantity | null, unit, soak, soakNote, sortOrder }`; zapis: obsługa, admin, klient swojego konia tylko przy `owner_edits_feeding`, inaczej `409 option_disabled`; `If-Match` z wersją planu: `412 version_conflict`, bez nagłówka 428; `soak = true` przy wyłączonym moczeniu → `409 option_disabled`), `GET`, `PUT …/paddock-plan` (`{ paddockId, daysMask, startLocal, endLocal, companionHorseIds[] }`; zapis obsługa, admin; przy wyłączonym padoku 409), `GET`, `PUT …/feeds` i `…/paddocks` (pełna lista z `id` od klienta i `If-Match`; nazwa unikalna w stajni → 409), `GET …/meal-slots`. Nowy plan obowiązuje od dziś (serwer zamyka poprzednią wersję).
- Dokumenty: `docs/makiety-plan.md` G „EdycjaPlanuKonia” (Ola, Kasztan · Hala główna · boks 7, „← Konie”, bez paska; H1 „Plan · Kasztan”; „Karmienie” według `meal_slots`: Śniadanie 06:30: owies 1,5 kg, siano bez ograniczeń, suplement X 1 miarka; Obiad 12:00: siano; Kolacja 18:00: owies 1,5 kg, siano, wysłodki 0,5 kg z „Namoczyć” i „w 2 l wody”; wiersz: pasza (select ze słownika), ilość, jednostka, usuń; „+ Dodaj paszę”; „Padok”: Padok B · pn–pt · 10:00–16:00 · razem z: Fala, Rumba, „Dziś skrócony do 14:30 przez flagę „Nie na padok””; „Obowiązuje od: dziś”; „Zapisz plan”, „Anuluj”; stany: „+ Nowa pasza” (nazwa, rodzaj, jednostka) i „+ Nowy padok” w selectach, klient tylko odczyt bez `owner_edits_feeding`, 412 „Plan zmienił ktoś inny, odśwież”, 409 przy „Namoczyć” po wyłączeniu moczenia), docs/makiety-plan.md 5 pkt 34 (słowniki dopisują admin i obsługa). A-07 (Ola zmienia plan karmienia z „namoczyć” i ile).
- Makiety: brak pliku `.dc.html` (P1 z planu, jeszcze nienarysowana); układ według opisu wyżej.
- Decyzje: brak nowych.
- Dane demo: Ola i Kasztan (plan z seedu BE-043), Kometa w Brzozowej (bez moczenia i padoku: owies 1 kg rano i wieczorem, siano, musli 0,5 kg wieczorem), Anna (klient; `owner_edits_feeding` włączone w Pod Lipami według DEC-20).

## Zakres
- [ ] `mobile/app/(app)/horse/[horseId]/plan.tsx`: pobranie planu karmienia, planu padoku, słowników i pór (wersje do `If-Match`); edycja w stanie lokalnym; „Zapisz plan” wysyła zmienione części (`PUT feeding-plan`, `PUT paddock-plan`) tylko online; „Anuluj” z dialogiem przy niezapisanych zmianach.
- [ ] Sekcja „Karmienie”: pory z `meal-slots`, wiersze (select paszy, ilość, jednostka albo „bez ograniczeń”, usuń), „+ Dodaj paszę”; „Namoczyć” z polem „ile” tylko przy `soak_enabled`.
- [ ] Sekcja „Padok” tylko przy włączonym padoku: padok (select), dni tygodnia (`daysMask`), od–do w czasie stajni, towarzysze (konie tej stajni bez konia edytowanego), informacja o dzisiejszym skróceniu przez flagę (z `card`).
- [ ] „+ Nowa pasza” i „+ Nowy padok” w selectach: arkusz (nazwa, rodzaj i jednostka paszy) → `PUT …/feeds` / `…/paddocks` z pełną listą i nowym `id`; `409` przy powtórzonej nazwie → „Taka pasza już jest”.
- [ ] Błędy: `412` → „Plan zmienił ktoś inny, odśwież” z przyciskiem odświeżenia (lokalne zmiany odrzucane po potwierdzeniu); `409 option_disabled` → odświeżenie konfiguracji i komunikat; `403` (klient bez uprawnień) → widok tylko do odczytu.
- [ ] Po zapisie powrót do karty i odświeżenie `card` (plan obowiązuje od dziś).

## Poza zakresem
- Słowniki w panelu (PanelSlowniki, WEB-022); pory posiłków stajni (panel, WEB-022).

## Kryteria akceptacji
- [ ] A-07: Ola dodaje Kasztanowi do kolacji pozycję z „Namoczyć · w 2 l wody”; karta konia i tablet HG 7 pokazują ją przy najbliższym odpytaniu.
- [ ] Ola dodaje „+ Nowa pasza” „Marchew” i używa jej w planie; druga „Marchew” daje komunikat o powtórzeniu.
- [ ] Zapis równoległy z dwóch telefonów: drugi dostaje „Plan zmienił ktoś inny, odśwież”.
- [ ] Kometa w Brzozowej: bez „Namoczyć” i bez sekcji „Padok”.
- [ ] Anna widzi „Edytuj plan” tylko przy `owner_edits_feeding`; po wyłączeniu opcji w panelu zapis daje 409 i ekran przechodzi w odczyt.

## Testy
- Jest + RNTL: `plan-edit.test.tsx` (karmienie, padok, słowniki, 412, 409, klient tylko odczyt) na atrapie `operations`.
- [ręcznie] Maestro: `mobile/e2e/maestro/staff-plan.yaml` (A-07 na seedzie).

## Definicja gotowości
- `npm run check` w `mobile/` zielone (`gen:api` z `operations.json`); flow Maestro przechodzi [ręcznie]; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zapis planu nie idzie przez kolejkę offline (konflikty wersji wymagają decyzji osoby); przycisk offline nieaktywny z „tylko online”.
- Czas padoku w strefie stajni, bez przeliczeń w apce; pory i ich nazwy z `meal-slots`.
