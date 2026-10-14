---
id: WEB-015
title: Flagi w panelu
area: web
stage: 3
size: M
status: todo
depends_on: [BE-034, BE-036, BE-038, WEB-006, WEB-011, WEB-013, WEB-014]
decisions: [DEC-21]
owner:
branch:
trello:
---
# WEB-015 · Flagi w panelu

## Cel
Admin widzi w panelu aktywne flagi koni z godzinami i statusem, dostaje wyraźny alert o niepotwierdzonej fladze krytycznej (z informacją, że powiadomienie wyszło SMS-em i e-mailem) oraz stan wysyłek zaproszeń. Dzięki temu panel pokazuje to samo co tablet i apka, bez ustawiania flag z panelu.

## Kontekst
- **Stan kodu:** PanelBoksy i PanelKonie (WEB-011, WEB-013) z miejscem na dodatkowe kolumny i chip „Z flagą”, `FlagPill` (WEB-004), zakładka „Zaproszenia” (WEB-006), dialog wyłączenia szablonu (WEB-014).
- **Dokumenty:** docs/development-szczegoly.md 3.5.3 „PanelBoksy” (alert tylko dla flag z `requires_ack`; trwająca niepotwierdzona flaga zostaje w alercie także po wyłączeniu potwierdzeń, A-20), makiety-plan.md 2.3 „Flagi” (status tylko „potwierdzona HH:MM” albo „niepotwierdzona”, i tylko przy `requires_ack`; godziny „06:00–10:00”, „od 14:30”, „16:00–08:00”, „dziś, cały dzień”). BE-038: flagi w `boxes-overview` i `horses-overview` (godziny, status, liczniki niepotwierdzonych) i alert niepotwierdzonej flagi krytycznej. BE-034: DTO flagi (`label`, `severity`, `hoursLabel`, `requiresAck`, `status`, `acknowledgedAt`, `escalations[]`), `GET /operations/v1/stables/{stableId}/flags?date=`. BE-036: `GET /notifications/v1/stables/{stableId}/deliveries?flagId=&invitationId=` (kanał, odbiorca `display_name`, status, `sentAt`, `attempts`; bez treści i adresu).
- **Makiety:** mockups/project/PanelBoksy.dc.html: alert „Flaga krytyczna dla Belli (boks 4 · Hala nowa) jest niepotwierdzona · Nie na padok · dziś, cały dzień · ustawiona 01:20 · admin powiadomiony · Zobacz flagę”; komórki „Bez śniadania · 06:00–10:00 · potwierdzona 06:02”, „Nie na padok · od 14:30 · do 16:00 · potwierdzona 06:02”, „Nie na padok · dziś, cały dzień · ustawiona 01:20 · niepotwierdzona”; chip „Z flagą · 4”. PanelPulpit.dc.html (alert z „wysłano Ci SMS i e-mail”). makiety-plan.md B „PanelUstawieniaZapis” (dialog „Wyłączyć Derkę? Trwa 1 flaga: Sonata · Derka: zakładać · 16:00–08:00. Zostanie do końca okna, zniknie tylko kafelek.”), „PanelLudzie” (zaproszenia).
- **Decyzje:** DEC-21 A (trwające flagi zostają do końca okna).
- **Dane demo:** Kasztan („Bez śniadania” 06:00–10:00 i „Nie na padok” od 14:30, potwierdzone 06:02), Bella („Nie na padok”, dziś, cały dzień, niepotwierdzona od 01:20, eskalacja SMS do Damiana), Hetman („Leki rano”), Sonata („Derka: zakładać”, od 16:00); Brzozowa: Kometa i Lord bez potwierdzeń („obowiązuje od razu”).

## Zakres
- [ ] Kolumna „Aktywne flagi” w PanelBoksy i PanelKonie: `FlagPill` z etykietą (wariant Derki: „Derka: zakładać”), `hoursLabel`, „ustawiona HH:MM” przy niepotwierdzonych, status tylko przy `requiresAck` („potwierdzona HH:MM” / „niepotwierdzona”); krytyczna jako pełne pole `crit-solid` z `on-crit`; brak flag: „Brak”. Chip „Z flagą · N” i licznik w filtrach.
- [ ] Alert nad tabelą PanelBoksy dla każdej niepotwierdzonej flagi krytycznej z `requiresAck` (z odpowiedzi BE-038): koń, boks z halą, etykieta, godziny, „ustawiona HH:MM”, „admin powiadomiony” gdy `escalations` ma `admin_notify`; kanały z `deliveries?flagId=` („wysłano SMS i e-mail”); „Zobacz flagę” przewija do wiersza boksu i podświetla go (cel tymczasowy do P3 PanelSzczegolFlagi).
- [ ] Zakładka „Zaproszenia” (WEB-006): kolumna „Wysyłka” z `deliveries?invitationId=` („SMS wysłany 07:21”, „e-mail w kolejce”, „nie dostarczono”); bez ponowienia (to robi zespół EQUENOR, WEB-026).
- [ ] Dialog wyłączenia szablonu (WEB-014): lista trwających i przyszłych flag tego szablonu z `GET …/flags?date=` (dziś i jutro), np. „Trwa 1 flaga: Sonata · Derka: zakładać · 16:00–08:00. Zostanie do końca okna, zniknie tylko kafelek.”.
- [ ] Odświeżanie: PanelBoksy odpytuje `boxes-overview` co 30 s z ETag, gdy karta jest widoczna (propozycja), żeby alert pojawił się bez przeładowania.

## Poza zakresem
- Ustawianie, zmiana, odwołanie i potwierdzanie flagi z panelu (brak planszy; P3 PanelSzczegolFlagi); flagi na pulpicie (WEB-020); flagi na TV (WEB-016).

## Kryteria akceptacji
- [ ] Pod Lipami: alert o Belli z „admin powiadomiony” i kanałami; Kasztan z dwiema flagami i „potwierdzona 06:02”; chip „Z flagą · 4”.
- [ ] A-20: po wyłączeniu potwierdzeń alert o Belli zostaje, a nowa flaga Iskry nie ma statusu; po potwierdzeniu flagi Belli (z tabletu) alert znika przy następnym odpytaniu.
- [ ] Brzozowa: flagi Komety i Lorda bez statusu, bez alertu.
- [ ] Dialog wyłączenia Derki wymienia Sonatę z godzinami.
- [ ] Zaproszenie Marka Nowaka pokazuje stan wysyłki SMS.

## Testy
- Vitest: formatowanie komórek flag (z i bez `requiresAck`, krytyczna, Derka), wybór flag do alertu, mapowanie stanów wysyłek.
- Playwright na atrapie: alert Belli, A-20 (zmiana odpowiedzi atrapy), chip „Z flagą”; wzorzec `toHaveScreenshot` PanelBoksy 1440 tworzony w tym zadaniu (makieta tylko do ręcznego przeglądu w PR).
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-034/BE-036/BE-038; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Nigdy „przyjęte” przy flagach (to słowo tylko dla zaproszeń).
- Zdania objaśniające z makiety pod alertem („Obsługa widzi ją przy boksie…”) pomijamy (docs/makiety-plan.md 2.3 i 5 pkt 38).
- Zmiana zależności względem listy: dodane BE-038 (flagi i alert w `boxes-overview` dostarcza BE-038, nie BE-034).
