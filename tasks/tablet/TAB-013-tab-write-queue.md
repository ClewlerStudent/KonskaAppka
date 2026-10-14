---
id: TAB-013
title: Kolejka zapisów tabletu w SQLite
area: tablet
stage: 4
size: M
status: todo
depends_on: [BE-034, TAB-009]
decisions: [DEC-13]
owner:
branch:
trello:
---
# TAB-013 · Kolejka zapisów tabletu w SQLite

## Cel
Potwierdzenie flagi albo szybka akcja stuknięta przy boksie nie ginie, gdy Wi-Fi akurat nie działa: trafia do lokalnej kolejki, tablet pokazuje licznik niewysłanych i wysyła je sam po powrocie sieci, bez duplikatów i zawsze dla boksu, przy którym je zrobiono. Zapis z tabletu nie ma autora.

## Kontekst
- **Stan kodu:** sesja i klient API z TAB-009 (`Authorization`, `X-Client-Version`, odświeżanie tokenu), wybór boksu z TAB-010 (`boxId`, `stableId`), stany sieci z TAB-012 (stopka „NIEWYSŁANE: N”). Trasy zapisu w `operations`: `POST /operations/v1/stables/{stableId}/flags/{flagId}/acks` (`{id, occurredAt, timeQuality}`, nagłówek `X-Box-Id`; BE-034), `POST …/box-care-events` (`{kind: tidy | water, items: [{id, boxId}], occurredAt, timeQuality}`), `POST …/building-routines` (`{id, kind: meal_served | paddock_out, mealSlotId?, occurredAt, timeQuality}`), `POST …/box-care-events/{id}/undo`, `POST …/building-routines/{id}/undo` (BE-044). Serwer liczy `request_hash` z kanonicznej treści: ten sam `id` z tą samą treścią = ten sam wynik, z inną `409 id_conflict`.
- **Dokumenty:** `docs/development-szczegoly.md` 3.5.2 „Zapisy” (tylko potwierdzenie flagi z `requires_ack`, „Boks gotowy”, posiłek i padok dla hali tego boksu, „Woda” przy poidle ręcznym i ich „Cofnij”; kolejka w SQLite; id nadane przez klienta i `request_hash`; `occurred_at` i `time_quality`; bez autora: `source = tablet`, `user_id = NULL`, `box_id` z `X-Box-Id`; licznik niewysłanych), 3.1.5 (kody błędów: `id_conflict`, `target_passed`, `option_disabled`, `ack_not_required`, `other_building`), `docs/mikroserwisy.md` 3.6 (tablet z `X-Box-Id`: stajnia ze ścieżki = stajnia z tokenu, boks w tej stajni, inaczej 404 bez zapisu; akcja hali innej niż hala boksu → `403 other_building`), 9.3 pkt 6; 4.3.1 T-16 (start bez sieci: `time_quality = unknown`).
- **Makiety:** TabletOffline (`docs/makiety-plan.md` E): „BRAK POŁĄCZENIA · DANE Z 07:05 · NIEWYSŁANE: 1”, w OSTATNICH AKCJACH „07:12 Boks gotowy · czeka na wysłanie”.
- **Decyzje:** DEC-13 A (kolejka zapisów w SQLite z licznikiem, nie blokada akcji).
- **Dane demo:** HG 7 Kasztan (potwierdzenia flag Anny), HN 5 Bursztyn (Woda), Brzozowa 1 (bez potwierdzeń: `ack_not_required`).

## Zakres
- [ ] `tablet/src/queue/db.ts` (`expo-sqlite`): tabela `outbox(id TEXT PRIMARY KEY, stable_id, box_id, method, path, body_json, created_at, attempts, next_attempt_at, last_error, state)`; tabela `local_kv` dla małych ustawień (boks, język, profil palety, `installId`), jeśli TAB-010 jeszcze trzyma je w `AsyncStorage`, przenieś tutaj z migracją. Wersjonowanie schematu przez `PRAGMA user_version`.
- [ ] `tablet/src/queue/outbox.ts`: `enqueue({ kind, path, body })` nadaje `id` (UUIDv7) do treści, `occurredAt` z czasu serwera (offset z TAB-012) albo z zegara tabletu i `timeQuality = synced | unknown`, zapisuje `X-Box-Id` wybranego boksu w chwili akcji (zmiana boksu potem nie zmienia zapisu); zwraca od razu (UI pokazuje stan „czeka na wysłanie”).
- [ ] Wysyłka: jeden wysyłacz FIFO, uruchamiany po `enqueue`, po każdym udanym odpytaniu tablicy i co 15 s, gdy kolejka niepusta; żądanie z identyczną treścią przy każdej próbie (stały `body_json`); wyniki:
  - 2xx (także odpowiedź „już zapisane” dla tego samego `id`) i `already_done` → usunięcie, zdarzenie dla UI (godzina z odpowiedzi);
  - `409 id_conflict`, `409 option_disabled`, `409 ack_not_required`, `422 target_passed`, `403 other_building`, `403 forbidden_role`, `404` → usunięcie z wpisem do logu diagnostyki i komunikatem dla UI (np. „Stajnia wyłączyła tę akcję”); bez ponowień;
  - `401` → odświeżenie tokenu (TAB-009) i powtórka; `access_revoked`/`session_revoked` → kolejka zostaje, wysyłka czeka na ponowne zalogowanie tym samym kontem tabletów (po zalogowaniu innym kontem albo w innej stajni wpisy są odrzucane z logiem);
  - błąd sieci, 429, 5xx → `attempts + 1`, `next_attempt_at` z backoffem (5 s → 5 min maks.) i jitterem.
- [ ] `useOutbox()`: licznik niewysłanych (do stopki TAB-012 i diagnostyki), lista oczekujących dla boksu (OSTATNIE AKCJE dopisują „czeka na wysłanie”), `isEmpty()` (warunek instalacji aktualizacji, TAB-017).
- [ ] „Cofnij”: jeśli oryginał jeszcze w kolejce, oba wpisy znikają lokalnie (bez wysyłki); inaczej `enqueue` trasy `…/undo` z `id` oryginału.
- [ ] Odporność: kolejka przetrwa zabicie procesu, restart, zanik prądu i aktualizację APK (SQLite w `filesDir`); wysyłka po restarcie wznawia się sama.

## Poza zakresem
- Przyciski i ekrany, które wołają kolejkę: POTWIERDZAM (TAB-014), SZYBKIE AKCJE i WODA (TAB-018).
- Zapisy zadań (tablet ich nie robi) i flag (tablet nie tworzy flag).

## Kryteria akceptacji
- [ ] Potwierdzenie bez sieci: licznik „NIEWYSŁANE: 1”, po włączeniu sieci jedno wywołanie `acks` i licznik 0; w bazie `method = tablet`, `user_id = NULL`, `box_id` wybranego boksu (A-01).
- [ ] Ta sama akcja wysłana dwa razy (zgubiona odpowiedź, ponowienie) daje jeden zapis na serwerze (ten sam `id`).
- [ ] Zmiana boksu między stuknięciem a wysyłką: zapis idzie z `X-Box-Id` boksu, przy którym go zrobiono (A-10).
- [ ] `409 ack_not_required` (Brzozowa) i `option_disabled` usuwają wpis bez ponowień i dają komunikat w UI.
- [ ] Zabicie procesu z 3 wpisami w kolejce: po starcie wpisy są wysłane; po `adb install -r` też.
- [ ] Start bez sieci: wpis ma `timeQuality = unknown`; po pierwszej odpowiedzi serwera nowe wpisy mają `synced`.

## Testy
- Jest z atrapą `expo-sqlite` albo `better-sqlite3` w testach (adapter): klasyfikacja odpowiedzi, backoff, „Cofnij” w kolejce, przenoszenie `X-Box-Id`, licznik.
- Emulator na stosie dev (SH-002): potwierdzenie offline i online, sprawdzenie wiersza w bazie (skrypt `psql`).

## Definicja gotowości
- `npm run check` w `tablet/` zielone; `tablet/docs/queue.md` (tabela odpowiedzi → akcja); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- `X-Box-Id` niesie `boxes.id` (UUID), nigdy numer boksu.
- Nie dodawaj autora do zapisów z tabletu; konto tabletów nie jest osobą.
- Treść żądania musi być bajt w bajt ta sama przy ponowieniu (serwer porównuje `request_hash`): zapisuj gotowy JSON, nie obiekt do ponownego zserializowania.
