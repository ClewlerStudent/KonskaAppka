---
id: TAB-014
title: "TabletPopup: nowa flaga do potwierdzenia i POTWIERDZAM"
area: tablet
stage: 4
size: M
status: todo
depends_on: [TAB-012, TAB-013]
decisions: []
needs: [emulator]
owner:
branch:
trello:
---
# TAB-014 · TabletPopup: nowa flaga do potwierdzenia i POTWIERDZAM

## Cel
Gdy klient albo obsługa ustawi flagę wymagającą potwierdzenia (np. „Bez śniadania” przed wetem), tablet jego konia pokazuje duży pop-up z godzinami, a osoba przy boksie stuka POTWIERDZAM. Pop-up znika po potwierdzeniu (także na innym tablecie albo w apce) i po odwołaniu flagi. W stajni bez potwierdzeń pop-upów nie ma: flaga od razu stoi w banerze.

## Kontekst
- **Stan kodu:** odpowiedź `board` z BE-041 ma przy flagach `popup` (tylko `requires_ack` bez potwierdzenia i bez odwołania), `requiresAck`, `hoursLabel`, wariant, notatkę, autora i godzinę; tablica `BoardScreen` (TAB-011), odpytywanie co 5 s (TAB-012), kolejka zapisów z `enqueue` i trasą `POST /operations/v1/stables/{stableId}/flags/{flagId}/acks` z `X-Box-Id` (TAB-013, BE-034), komponent `Modal` na `t-scrim` z paskiem 16 px (TAB-008), `epdRefresh` (TAB-005).
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 „TabletPopup” (tylko w stajni z potwierdzeniami i tylko flagi z `requires_ack`; kolejka pop-upów, krytyczne pierwsze; godziny „dziś 06:00–10:00”; znika po POTWIERDZAM albo gdy flaga zniknie z odpowiedzi przy odpytaniu; status tylko „potwierdzona HH:MM” albo „niepotwierdzona”; po restarcie wraca), „Zasady e-ink” (pełne odświeżenie po pop-upie i przy nowej fladze krytycznej), 4.3.1 T-28 (kolejka, krytyczne pierwsze, znikanie po potwierdzeniu na innym tablecie, brak pop-upu w Brzozowej, zapis bez autora z `method = tablet`), T-18 (opóźnienie flagi do pop-upu), 4.4 A-01, A-03, A-18, A-20.
- **Makiety:** `mockups/project/TabletPopup.dc.html` („NOWA FLAGA”, „od Anny · 03:14”, „BEZ ŚNIADANIA”, „Kasztan · boks 7 · Hala główna”, „Ważna”, „dziś 06:00 – 10:00”, „Wstrzymane: śniadanie: owies, siano, suplement X”, „Notatka: Wet o 8:00, koń na czczo”, „POTWIERDZAM”, „Okno zniknie po potwierdzeniu albo gdy flaga zostanie odwołana.”); TabletPopupZablokowany (`docs/makiety-plan.md` E: licznik „1 z 2”, krytyczny pierwszy; obsługa przy blokadzie w TAB-015).
- **Decyzje:** brak.
- **Dane demo:** Kasztan HG 7: dwie flagi Anny z 03:14 i 03:16 (zegar 06:01: dwa pop-upy, krytyczny pierwszy); Bella HN 4 (niepotwierdzona, cały dzień); Brzozowa 1 Kometa (bez potwierdzeń: brak pop-upu).

## Zakres
- [ ] `tablet/src/popup/usePopupQueue.ts`: z każdej odpowiedzi tablicy bierze flagi z `popup = true`, sortuje: krytyczne pierwsze, potem według czasu utworzenia; odejmuje flagi potwierdzone lokalnie i czekające w kolejce zapisów (zbiór `pendingAcks` w SQLite, TAB-013), więc po stuknięciu pop-up nie wraca przy kolejnym odpytaniu ani po restarcie; flaga, która zniknęła z odpowiedzi albo straciła `popup` (potwierdzona gdzie indziej, odwołana, zakończona), znika z kolejki przy najbliższym odpytaniu.
- [ ] `PopupScreen` (`tablet/src/popup/`): pełny ekran na `t-scrim`, karta jak na makiecie: „NOWA FLAGA”, „od <autor> · HH:MM”, nazwa flagi wersalikami, „<Koń> · boks N · <Hala>” (bez hali przy jednej hali), ważność, „dziś 06:00–10:00” (albo `hoursLabel` z „od HH:MM” / przez północ), wstrzymane posiłki (z sekcji karmienia, gdy jest), notatka, przycisk POTWIERDZAM, licznik „1 z 2” przy kilku; pasek 16 px w kolorze ważności.
- [ ] POTWIERDZAM: `enqueue` potwierdzenia (`{id, occurredAt, timeQuality}`, `X-Box-Id` bieżącego boksu), dopisanie do `pendingAcks`, przejście do następnego pop-upu albo tablicy; wynik z kolejki: sukces czyści `pendingAcks`, `ack_not_required` (przełącznik zmieniony w międzyczasie) i 404 też czyszczą bez komunikatu na ekranie (log diagnostyki).
- [ ] Wyświetlanie: pop-up przykrywa tablicę i „Zmień boks” (otwarta lista zostaje pod spodem i wraca po zamknięciu kolejki, T-28); przy blokadzie ekranu pop-up też się pokazuje, ale POTWIERDZAM obsługuje TAB-015; pełne odświeżenie EPD przy pokazaniu pierwszego i po zamknięciu ostatniego pop-upu oraz przy nowej fladze krytycznej.
- [ ] Po restarcie apki: kolejka odtwarza się z pierwszej odpowiedzi tablicy (serwer wie, co niepotwierdzone) minus `pendingAcks`.
- [ ] Stajnia bez potwierdzeń: brak `popup` w odpowiedzi = brak pop-upów (żadnej logiki po stronie tabletu na podstawie ustawień).

## Poza zakresem
- Blokada ekranu i POTWIERDZAM po odblokowaniu (TAB-015); baner i plakietka „POTWIERDZONA HH:MM” na tablicy (TAB-011).
- Eskalacje i powiadomienia admina (BE-035, BE-036).

## Kryteria akceptacji
- [ ] A-01: zegar seedu 06:01, tablet HG 7: dwa pop-upy, „Bez śniadania” (krytyczny) pierwszy, „dziś 06:00–10:00”; POTWIERDZAM na obu → tablica z „POTWIERDZONA 06:02”; w bazie dwa wiersze `flag_acknowledgements` z `method = tablet`, `user_id = NULL`, `box_id` boksu 7 Hali głównej.
- [ ] A-03: odwołanie flagi w apce przy otwartym pop-upie → pop-up znika przy najbliższym odpytaniu, bez „ducha” (pełne odświeżenie).
- [ ] [ręcznie] T-28: potwierdzenie na drugim tablecie (emulator) albo w apce usuwa pop-up z pierwszego przy najbliższym odpytaniu.
- [ ] A-18: w Brzozowej nowa flaga dla Komety nie daje pop-upu.
- [ ] A-20: po wyłączeniu potwierdzeń trwająca niepotwierdzona flaga Belli dalej ma pop-up na tablecie HN 4.
- [ ] Potwierdzenie offline: pop-up znika od razu, nie wraca po restarcie, a potwierdzenie wychodzi po powrocie sieci.

## Testy
- Jest z fixture'ami: sortowanie kolejki, odejmowanie `pendingAcks`, znikanie po zmianie odpowiedzi, licznik „1 z 2”, wywołania `epdRefresh('full')`.
- [ręcznie] Emulator na stosie dev: A-01 (skrypt ustawia zegar seedu 06:01 przez `npm run clock` z SH-002), flow Maestro `tablet/e2e/maestro/popup.yaml`.

## Definicja gotowości
- `npm run check` w `tablet/` zielone; flow Maestro przechodzi [ręcznie]; zrzuty pop-upu w obu profilach w galerii; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Nie śledzimy, czy pop-up się wyświetlił, i nie wysyłamy tego na serwer (erd.md pkt 2).
- Autor na pop-upie pochodzi z odpowiedzi `board` (według ustawienia stajni `author_display`); nie pokazuj nic o koncie tabletu.
