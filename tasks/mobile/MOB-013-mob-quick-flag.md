---
id: MOB-013
title: SzybkaFlaga (nowa flaga klienta z podpowiedzianymi godzinami)
area: mobile
stage: 3
size: M
status: todo
depends_on: [BE-034, BE-062, MOB-012, MOB-008, SH-002]
decisions: [DEC-21, DEC-15]
needs: [emulator]
owner:
branch:
trello:
---
# MOB-013 · SzybkaFlaga (nowa flaga klienta z podpowiedzianymi godzinami)

## Cel
Klient ustawia flagę dla swojego konia w najwyżej trzech stuknięciach: kafelek, podpowiedziane godziny (z możliwością zmiany), „Wyślij flagę”. Apka mówi jasno, czy flaga jest zapisana na serwerze; przy zerwanym połączeniu nie powstaje duplikat.

## Kontekst
- Stan kodu: kafelki i wejście `/flag/new?horseId=&templateId=` z Main (MOB-012), konfiguracja stajni (szablony aktywne, `requiresAck`, Derka) (MOB-007), wzorzec zapisu tylko online `online-only.ts` (MOB-008), `newId()` (MOB-001). Trasy `operations` (BE-034): `POST /operations/v1/stables/{stableId}/flag-preview` (`{ horseId, templateId | customText, validFrom?, validTo?, variant? }` → okno, etykieta „dziś 06:00–10:00”, skutki „wstrzymane śniadanie 06:30”, `requiresAck`), `POST …/horses/{horseId}/flags` (`{ id, templateId? | customText?, validFrom, validTo, variant?, note?, clientCreatedAt? }`; ten sam `id` z tą samą treścią zwraca istniejący zapis, inna treść `409 id_conflict`; `422 target_passed`; `409 option_disabled` dla wyłączonego szablonu; `variant` wymagany dla Derki).
- Dokumenty: `docs/development-szczegoly.md` 3.5.1 „Klient” (godziny od–do podpowiedziane z możliwością zmiany, opcjonalna notatka i przycisk, bez innych pól i kroków; „Derka” z wyborem „zakładać / nie zakładać” tylko tam, gdzie stajnia oferuje derki; flaga wyłącznie online, z jawnym stanem „zapisano na serwerze”), 4.1 („kafelek flagi z podpowiedzianymi godzinami w najwyżej trzech stuknięciach do zapisu”; „flaga wysłana przy zrywanym połączeniu nie tworzy duplikatu”). `docs/makiety-plan.md` D „SzybkaFlagaGodziny” (arkusz „Kiedy”: Dziś | Jutro | data; „Od” 14:30, „Do” 16:00; bez wariantu „do odwołania”; „Zapisz godziny”; stany: 422 „Koniec musi być po początku”, okno przez północ „16:00–08:00 · do śr 14.10”, „Inna flaga” z wymaganym polem „Nazwa flagi”, godziny od teraz do 23:59), „SzybkaFlagaBrzozowa” (Kometa · boks 1, 6 kafelków, 06:00–09:00, notatka „dentysta o 8:30”, „obowiązuje od razu”), „SzybkaFlagaNieWyslano” (stopka „Nie wysłano. Flaga nie obowiązuje.”, „Wyślij ponownie”, „Zadzwoń do stajni”; stany „Wysyłanie…”, „Zapisano na serwerze 03:14”, `422 target_passed` „Ten czas już minął, zmień godziny”, `409 option_disabled` „Stajnia wyłączyła tę flagę”). A-01, A-12, A-18, A-19.
- Makiety: `mockups/project/SzybkaFlaga.dc.html` („Nowa flaga”, „Kasztan · Hala główna · boks 7”, „Rodzaj”, kafelki, „Derka: Zakładać | Nie zakładać”, „Kiedy”, „Od dziś 16:00”, „Do jutro 08:00”, „Derka: zakładać · 16:00–08:00 · do śr 14.10”, „Notatka (opcjonalnie)”, „Wyślij flagę”; zdania „Notatka będzie widoczna…”, „Obsługa zobaczy flagę…” i „podpowiedź, możesz zmienić” pomijamy, docs/makiety-plan.md 2.3 i 5 pkt 38).
- Decyzje: DEC-21 wariant A (wyłączony szablon: trwająca flaga obowiązuje do końca okna, znika tylko kafelek).
- Dane demo: Anna (Kasztan, A-01: „Bez śniadania” dziś 06:00–10:00 z notatką „Wet o 8:00, koń na czczo”; „Nie na padok” zmienione na 14:30–16:00, „Kowal o 15:00”), Ewa K. (Sonata, Derka 16:00–08:00, „przymrozek w nocy”), Anna w Brzozowej (Kometa, 06:00–09:00).

## Zakres
- [ ] `mobile/app/(app)/flag/new.tsx` (SzybkaFlaga): nagłówek „Nowa flaga” z „← Wróć”, koń z `boxLabel`, „Rodzaj” (kafelki aktywnych szablonów; wybrany z parametru), Derka: „Zakładać | Nie zakładać” tylko dla szablonu `derka`; „Kiedy” z podpowiedzią z `flag-preview` (wywołanie przy zmianie rodzaju, konia albo godzin; pokazuje etykietę i skutki, np. „Wstrzymuje śniadanie 06:30”); „Notatka (opcjonalnie)”; „Wyślij flagę”.
- [ ] `mobile/app/(app)/flag/hours.tsx` (SzybkaFlagaGodziny, arkusz): Dziś | Jutro | data, „Od”, „Do” (wybór godzin w strefie stajni z odpowiedzi), walidacja „Koniec musi być po początku” (lokalnie i przy odpowiedzi `422 invalid_window`), okno przez północ, „Zapisz godziny”.
- [ ] „Inna flaga”: wymagane pole „Nazwa flagi” (`customText`), godziny bez podpowiedzi: od teraz do 23:59 (propozycja).
- [ ] Wysyłka tylko online według `online-only.ts`: `id` nadany przy otwarciu ekranu i trzymany do sukcesu; „Wysyłanie…”, potem „Zapisano na serwerze HH:MM” i powrót do Main; przy błędzie sieci stopka „Nie wysłano. Flaga nie obowiązuje.” z „Wyślij ponownie” (ten sam `id`, ta sama treść) i „Zadzwoń do stajni” (tylko gdy znany numer stajni, patrz Uwagi); wpisane dane zostają.
- [ ] Błędy: `422 target_passed` → „Ten czas już minął, zmień godziny”; `409 option_disabled` → „Stajnia wyłączyła tę flagę” i odświeżenie konfiguracji; `409 id_conflict` (zmieniona treść po nieudanej wysyłce) → nowy `id` tylko po świadomej zmianie formularza; 404 konia → komunikat i powrót.
- [ ] Po zapisie odświeżenie `client-home` i karty konia; flaga w stajni bez potwierdzeń pokazuje „Obowiązuje od razu”.

## Poza zakresem
- Flaga w imieniu klienta przez obsługę (SzybkaFlagaObsluga, MOB-015); status, zmiana godzin i odwołanie istniejącej flagi (MOB-014).

## Kryteria akceptacji
- [ ] A-01: Anna o 03:14 ustawia „Bez śniadania” z podpowiedzią dziś 06:00–10:00 i notatką w ≤ 3 stuknięciach od Main (bez notatki); o 03:16 „Nie na padok” ze zmianą godzin na 14:30–16:00; obie flagi są w Main ze statusem „niepotwierdzona”.
- [ ] A-12: Ewa K. wybiera „Derka”, „Zakładać”, podpowiedź 16:00–08:00 z „do śr 14.10”; zapis ma `variant = on`.
- [ ] A-18: w Brzozowej Anna zmienia godziny na 06:00–09:00; po zapisie flaga „Obowiązuje od razu”, bez statusu oczekiwania.
- [ ] Zerwane połączenie w chwili wysyłki (odpowiedź zgubiona): „Wyślij ponownie” nie tworzy drugiej flagi (jeden wiersz w bazie).
- [ ] Wyłączenie Derki w panelu (A-19) przy otwartym ekranie: wysyłka daje „Stajnia wyłączyła tę flagę”, kafelek znika.

## Testy
- Jest + RNTL: `flag-new.test.tsx` (podpowiedź, Derka, „Inna flaga”, błędy, ponowienie z tym samym `id`), `flag-hours.test.tsx` (północ, walidacja) na atrapie `operations`.
- Maestro [ręcznie]: `mobile/e2e/maestro/client-flag.yaml` (A-01 i A-18) oraz wariant z trybem samolotowym w trakcie wysyłki; przygotowanie stosu: `npm --prefix backend run db:reset -- --fixed-date --variant <wariant>` (wariant seedu bez zdarzeń, które flow tworzy, albo inne konie i godziny niż w seedzie, żeby powtórka nie dała duplikatów ani `alreadyDone`), `npm run clock -- set <czas>` i restart usług (SH-002), dopiero potem flow: seed z wariantem `bez-flag-a01` (BE-034) i zegar `2026-10-13T03:14:00+02:00`. SH-002 daje `db:reset` i `npm run clock`.

## Definicja gotowości
- `npm run check` w `mobile/` zielone (`gen:api` z `operations.json`); flow Maestro przechodzą [ręcznie]; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Flaga nigdy nie idzie przez kolejkę offline (MOB-008): osoba musi wiedzieć, czy obowiązuje.
- `requires_ack` ustala serwer z ustawień stajni; apka go nie wysyła.
- Numer do „Zadzwoń do stajni” (DEC-15: telefon pierwszego aktywnego admina) daje `GET /me` w `stables[].contactPhone` (BE-062, zależność); gdy pole jest `null`, przycisk się nie pokazuje.
