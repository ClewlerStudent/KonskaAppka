---
id: MOB-008
title: Kolejka zapisów offline w apce
area: mobile
stage: 2
size: M
status: todo
depends_on: [MOB-007]
decisions: [DEC-18, DEC-27]
owner:
branch:
trello: https://trello.com/c/sxmI3H8R
---
# MOB-008 · Kolejka zapisów offline w apce

## Cel
Obsługa w stajni często traci zasięg. Potwierdzenia flag, „Boks gotowy”, „Woda”, akcje hali, „Cofnij” i „Zrobione” zapisują się lokalnie od razu i same dochodzą na serwer po powrocie sieci, bez duplikatów i zawsze do tej stajni, w której powstały. Flaga i „Biorę” działają tylko online i mówią wprost, czy zapis jest na serwerze.

## Kontekst
- Stan kodu: klient API z sesją (MOB-002), konfiguracja stajni, `serverTimeOffset` z nagłówka `Date` i status online (MOB-007), `newId()` UUIDv7 (MOB-001). Trasy docelowe (`/operations/v1/stables/{stableId}`): `POST …/flags/{flagId}/acks` (`{ id, occurredAt, timeQuality }`, BE-034), `POST …/box-care-events` (`{ kind: tidy | water, items: [{ id, boxId }], occurredAt, timeQuality }`), `POST …/building-routines` (`{ id, kind: meal_served | paddock_out, buildingId?, mealSlotId?, occurredAt, timeQuality }`), `POST …/box-care-events/{id}/undo`, `POST …/building-routines/{id}/undo` (BE-044), `POST …/tasks/{id}/done` (BE-050). Serwer liczy `request_hash`: ten sam `id` z tą samą treścią zwraca istniejący zapis, z inną `409 id_conflict`; „Cofnij” po 1 h `409 undo_expired`.
- Dokumenty: `docs/development-szczegoly.md` 3.5.1 „Zapisy” (flaga wyłącznie online, z jawnym stanem „zapisano na serwerze”; „Biorę” wyłącznie online, 409 gdy ktoś już wziął; pozostałe zapisy przez lokalną kolejkę; „Cache i kolejka zapisów są osobne dla każdej stajni”), 4.1 „Apka mobilna” (flaga przy zrywanym połączeniu bez duplikatu; „zapis z kolejki trafia do stajni, w której powstał”), A-17 (Ola przełącza stajnię w trakcie). `docs/makiety-plan.md` G „ListaDniaOffline” (nagłówek „offline · dane z 07:05 · 2 zapisy czekają”; „Biorę” nieaktywne z „tylko online”; stan 409 „Zadanie wziął już Piotr”), A „PrzelacznikStajni” (stan offline „1 niewysłany zapis w Stajni Pod Lipami”), G „ListaDniaGotoweBoksy” (stan offline „Zapis czeka na sieć”).
- Decyzje: DEC-18 wariant A („Cofnij” do 1 h od `occurredAt`).
- Dane demo: Ola i Piotr (Pod Lipami), Ola w Brzozowej (przełączanie stajni z niewysłanym zapisem).

## Zakres
- [ ] `mobile/src/queue/store.ts`: trwała kolejka w `expo-sqlite` (tabela `write_queue`: `id`, `user_id`, `stable_id`, `kind`, `method`, `path`, `body` JSON, `created_at`, `attempts`, `next_attempt_at`, `status: pending | sending | failed`, `last_error`), migracja schematu przy starcie, transakcje przy zmianie stanu.
- [ ] `mobile/src/queue/enqueue.ts`: typowane funkcje `enqueueAck`, `enqueueBoxCare`, `enqueueBuildingRoutine`, `enqueueUndo`, `enqueueTaskDone`; ścieżka ze `stableId` budowana w chwili dodania (przełączenie stajni niczego nie zmienia); `occurredAt` = czas urządzenia skorygowany o `serverTimeOffset`, `timeQuality = synced`, gdy offset zmierzono w ostatnich 24 h, inaczej `unknown` (propozycja).
- [ ] `mobile/src/queue/worker.ts`: wysyłka FIFO per stajnia przez `session.authorized`; wyzwalacze: dodanie wpisu, powrót sieci (`@react-native-community/netinfo`), powrót apki na pierwszy plan, timer backoffu (1, 2, 4… do 60 s z rozrzutem); powtórka zawsze z tym samym `id` i treścią.
- [ ] Klasyfikacja odpowiedzi (kształty z BE-034 i BE-044): `201` i powtórka tego samego `id` → usunięcie wpisu i odświeżenie zapytań stajni; `200` z polem `alreadyDone` → usunięcie wpisu i komunikat dla UI z `alreadyDone.occurredAt` i `authorName` (to nie błąd); `undoUntil` z odpowiedzi zapamiętany przy wpisie do „Cofnij”; `401 token_expired` → odświeżenie i ponowienie; `session_revoked` → wpisy zostają do ponownego logowania tego samego `userId` (innego konta: usunięte); 408, 429, 5xx, brak sieci → ponowienie; pozostałe 4xx (`403`, `404`, `409 option_disabled`, `409 undo_expired`, `409 ack_not_required`, `422`) → `failed` z komunikatem, bez ponowień; „Cofnij” wpisu, który się nie zapisał, usuwa oba bez wysyłki.
- [ ] Optymistyczny stan w UI: hook `usePendingWrites(stableId)` zwraca oczekujące wpisy (np. boks z „✓ 07:16 · czeka na sieć”), które ekrany nakładają na dane z `board` do czasu odświeżenia.
- [ ] UI wspólne: w `OnlineStatus` (MOB-007) dopisek „· 2 zapisy czekają”; arkusz „Nie wysłano” z listą wpisów `failed` (opis akcji, powód, „Usuń”); licznik w przełączniku stajni („1 niewysłany zapis w Stajni Pod Lipami”); przy „Wyloguj” z niepustą kolejką dialog skutków („1 zapis nie został wysłany i zostanie usunięty.”).
- [ ] `mobile/src/queue/online-only.ts`: wzorzec dla zapisów tylko online (flaga, „Biorę”): przycisk nieaktywny offline z etykietą „tylko online”, stan „Wysyłanie…” → „Zapisano na serwerze HH:MM” albo „Nie wysłano” z „Wyślij ponownie” tym samym `id` (bez duplikatu).
- [ ] Plansza stanów (StanyApka) jako ekran deweloperski `mobile/app/(dev)/states.tsx` tylko w buildzie `development`: offline, czeka, nie wysłano, tylko online.

## Poza zakresem
- Ekrany, które dodają wpisy (MOB-015, MOB-016, MOB-020, MOB-021) i zapis flagi (MOB-013) — tu tylko mechanizm i wspólne komponenty.
- Kolejka tabletu (TAB-013: osobna implementacja w TypeScript na `expo-sqlite` w pakiecie `tablet/`; pakiety nie dzielą kodu).
- Przebieg na prawdziwym serwerze (stos z SH-002): A-13 w MOB-016, kolejka offline z przełączeniem stajni w MOB-024.

## Kryteria akceptacji
Kryteria sprawdza się w Jest na atrapie serwera (fake `fetch` albo MSW z licznikiem żądań i zapamiętanymi `id`), bez emulatora i bez backendu:
- [ ] Offline (atrapa NetInfo) Piotr zapisuje „Boks gotowy” dla 3 boksów i potwierdzenie flagi; `usePendingWrites` zwraca je od razu z „czeka na sieć”; po powrocie sieci atrapa dostaje jedno żądanie `box-care-events` z 3 elementami i jedno `acks`; gdy pierwsza odpowiedź „zginie” (atrapa zrywa połączenie po zapisie), powtórka idzie z tymi samymi `id` i treścią, a atrapa ma dokładnie 3 wpisy i jedno potwierdzenie.
- [ ] Ola dodaje zapis w Pod Lipami offline, przełącza się na Brzozową i wraca do sieci: żądanie idzie na ścieżkę Pod Lipami (A-17); FIFO zachowane osobno w każdej stajni.
- [ ] Odpowiedź `409 option_disabled` z atrapy daje wpis „Nie wysłano” z powodem i nie jest ponawiana; `200` z `alreadyDone` usuwa wpis i daje komunikat z godziną.
- [ ] Zmiana użytkownika: wpisy Piotra nie wychodzą z tokenem Oli (po zalogowaniu Oli są usuwane, po ponownym zalogowaniu Piotra wysyłane).
- [ ] „Biorę” i „Wyślij flagę” offline są nieaktywne z etykietą „tylko online”.
- [ ] Ponowne utworzenie `store` na tej samej bazie (symulacja zabicia apki) zachowuje wpisy, a worker wysyła je po starcie.

## Testy
- Jest: `store.test.ts` (na `expo-sqlite` w trybie testowym albo atrapie z tym samym interfejsem), `worker.test.ts` (klasyfikacja odpowiedzi, backoff na fałszywym zegarze, FIFO per stajnia, zgubiona odpowiedź, zmiana użytkownika), `enqueue.test.ts` (ścieżka ze stajnią, `occurredAt`, `timeQuality`).
- Atrapa serwera w `mobile/src/test/fake-server.ts` (wspólna dla kolejnych zadań: rejestr tras, zgubiona odpowiedź, kody błędów). Flow Maestro z trybem samolotowym powstaje w MOB-016 i MOB-024.

## Definicja gotowości
- `npm run check` w `mobile/` zielone (wszystkie kryteria w Jest); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Id nadaje klient (UUIDv7) i jest kluczem idempotencji; nigdy nie generuj nowego `id` przy ponowieniu.
- Kolejka nie przechowuje tokenów; autoryzacja dopiero przy wysyłce.
- Wpisy innego użytkownika nie mogą wyjść z jego tokenem: kolejka jest filtrowana po `userId`.
<!-- dep-ok: BE-034, BE-044, BE-050 (kształty tras z ich zakresów; kryteria na atrapie serwera, przebieg na serwerze w MOB-016 i MOB-024) -->
