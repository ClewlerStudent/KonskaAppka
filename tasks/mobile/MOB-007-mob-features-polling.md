---
id: MOB-007
title: Konfiguracja wybranej stajni, odpytywanie z ETag i etykiety boksów
area: mobile
stage: 2
size: M
status: todo
depends_on: [BE-030, MOB-005]
decisions: [DEC-27]
owner:
branch:
trello:
---
# MOB-007 · Konfiguracja wybranej stajni, odpytywanie z ETag i etykiety boksów

## Cel
Po wyborze stajni apka zna jej konfigurację (kafelki flag, moczenie, włączone przyciski obsługi, tryb potwierdzeń, funkcje widoczne dla roli) i pokazuje tylko to, co włączone. Ekrany odświeżają się same, tanio (ETag, 304) i tylko wtedy, gdy są widoczne. Boks zawsze ma halę przy numerze, gdy stajnia ma kilka hal.

## Kontekst
- Stan kodu: wybrana stajnia i pasek ról (MOB-005), klient API z sesją (MOB-002). Trasa `GET /stables/v1/stables/{stableId}/features?locale=` (każda rola w stajni; wynik `stableFeatures` dla roli z tokenu i aktywnych szablonów flag; `ETag`, 304) — BE-030; kształt odpowiedzi w `backend/openapi/stables.json` po `npm run gen:api`. Widoki `board` mają `ETag` = skrót treści, 304 i czas tylko w nagłówku `Date` (BE-033).
- Dokumenty: `docs/development-szczegoly.md` 3.5.1 („Po przełączeniu apka pobiera konfigurację tej stajni (`stables GET …/features`) i pokazuje tylko włączone opcje i funkcje widoczne dla roli: kafelki aktywnych flag, „namoczyć” przy włączonym moczeniu, włączone przyciski, status tylko przy flagach z `requires_ack`”; „Cache i kolejka zapisów są osobne dla każdej stajni”; „Odpytywanie z ETag tylko na widocznym ekranie”; „Przy kilku halach zawsze „Hala nowa · boks 4”; przy jednej hali bez podziału. Nawigacja do boksu zawsze po `id`”), 4.1 „Apka mobilna” (A-17). `docs/makiety-plan.md` 2.3 „Boks” (w wąskich listach „Nowa 4”, w Brzozowej „boks 1”, formularze wysyłają `boxId`), „Widoczność”. Nagłówek makiet: „online · aktualne na 07:15” (`ListaDnia.dc.html`).
- Decyzje: brak nowych (DEC-13 dotyczy tabletu; dla apki interwał jest propozycją niżej).
- Dane demo: Pod Lipami (dwie hale: Hala główna 1–8, Hala nowa 1–6; potwierdzenia, Derka, moczenie, wszystkie przyciski), Brzozowa (jedna hala, bez potwierdzeń, Derki, moczenia i padoku), wariant BezAkcji seedu (`tidy`, `meal_served`, `paddock_out` wyłączone).

## Zakres
- [ ] `mobile/src/api/etag-fetch.ts`: owijka `fetch` dla tras GET `board` i `features`: pamięta `ETag` i treść per URL (w cache TanStack Query), wysyła `If-None-Match`, przy 304 zwraca poprzednie dane; zapisuje różnicę zegara z nagłówka `Date` (`serverTimeOffset`, użyje MOB-008).
- [ ] `mobile/src/stable/use-stable-config.ts`: `GET …/features?locale=` po wyborze stajni i przy powrocie na pierwszy plan; hooki `useFeature('tasks')`, `useOption('soak')`, `useFlagTemplates()`, `useRequiresAck()`, `useQuickButtons()`; zmiana konfiguracji zmienia od razu pasek (MOB-005) i sekcje ekranów.
- [ ] `mobile/src/polling/use-polled-query.ts`: `refetchInterval` tylko gdy ekran ma fokus (`useIsFocused`) i apka jest `active` (AppState); interwał 15 s z losowym rozrzutem ±2 s (propozycja, stała w jednym miejscu); po przełączeniu stajni zapytania poprzedniej stajni przestają się odpytywać.
- [ ] Klucze zapytań zawsze `[userId, stableId, …]`; persister TanStack Query zachowuje dane per stajnia (start offline pokazuje ostatnie dane z godziną).
- [ ] `mobile/src/components/OnlineStatus.tsx`: linia „online · aktualne na 07:15” (czas z `Date` ostatniej udanej odpowiedzi) albo „offline · dane z 07:05” w rodzinie kolorów „uwaga”; w nagłówku ekranów obsługi, admina i instruktora (MOB-005 `StableHeader`).
- [ ] `mobile/src/format/box-label.ts`: `boxLabel(box, { narrow })` → „Hala nowa · boks 4” / „Nowa 4” przy kilku halach, „boks 1” przy jednej (liczba hal z odpowiedzi `board`, np. `buildingCount` albo `showBuilding`); `horseLabel`; testy dla obu stajni.
- [ ] Trasa szczegółu boksu i konia zawsze po `id` (`/box/[boxId]`, `/horse/[horseId]`); zakaz wyszukiwania boksu po numerze (komentarz i test).
- [ ] Obsługa `409 option_disabled` w jednym miejscu: odświeżenie konfiguracji i komunikat „Stajnia wyłączyła tę opcję.”

## Poza zakresem
- Ekrany korzystające z konfiguracji (MOB-009 i dalej); kolejka zapisów (MOB-008); wybór stajni (MOB-005).

## Kryteria akceptacji
- [ ] Anna w Pod Lipami ma 7 kafelków z Derką, w Brzozowej 6 bez Derki; po wyłączeniu Derki w panelu (A-19) kafelek znika przy najbliższym odpytaniu, bez restartu.
- [ ] Odpytywanie: na widocznym ekranie co ok. 15 s, odpowiedzi bez zmian to 304; na ekranie w tle i przy apce w tle brak żądań (test na fałszywym zegarze i liczniku żądań).
- [ ] Ola w Pod Lipami widzi „Hala główna · boks 7” / „Główna 7”, w Brzozowej „boks 1”; dwa „boks 4” w Pod Lipami prowadzą do różnych ekranów (po `id`).
- [ ] Przełączenie Oli z Pod Lipami na Brzozową i z powrotem pokazuje dane z cache od razu, bez mieszania danych stajni (A-17).

## Testy
- Jest: `etag-fetch.test.ts` (304, zapis `Date`), `use-polled-query.test.ts` (fokus, AppState, zmiana stajni), `box-label.test.ts`, `use-stable-config.test.ts` na odpowiedziach z kontraktu.
- Ręcznie: Flipper/proxy albo logi żądań na emulatorze z lokalnym `stables` i `board`.

## Definicja gotowości
- `npm run check` w `mobile/` zielone (`gen:api` z `stables.json`); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Apka nie liczy sama skutków flag ani godzin: etykiety („06:00–10:00”, „od 14:30”, „dziś, cały dzień”) przychodzą z serwera (`hoursLabel`).
- Tablet ma własne odpytywanie (DEC-13); nie kopiuj jego interwału 5 s do apki, bo telefon i tak odświeża się przy wejściu na ekran.
