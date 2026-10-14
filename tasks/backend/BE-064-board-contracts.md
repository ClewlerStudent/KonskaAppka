---
id: BE-064
title: "board: kontrakty widoków tabletu, wyświetlacza i klienta z przykładami"
area: backend
stage: 0
size: M
status: todo
depends_on: [SH-004, BE-063]
decisions: [DEC-14, DEC-29]
owner:
branch:
trello:
---
# BE-064 · board: kontrakty widoków tabletu, wyświetlacza i klienta z przykładami

## Cel
Tablet, telewizor i apka klienta budują ekrany na jednym, docelowym kształcie odpowiedzi `board`, zanim powstanie serwis: kontrakty zod tras odczytu trafiają do `backend/openapi/board.json` razem z przykładami odpowiedzi z danych demo. Aplikacje generują z nich typy i fixture'y, a zadania backendu (BE-033, BE-038, BE-041, BE-042, BE-045, BE-054) implementują gotowy kontrakt zamiast go wymyślać.

## Kontekst
- **Stan kodu:** kontrakty i generowanie OpenAPI: `backend/src/contracts/{auth,common,registry,openapi,index}.ts`, `backend/scripts/openapi.ts` (`npm run openapi`, `openapi:check`; plik na serwis z mapy `services` w `contracts/index.ts`), `defineRoute` w `backend/src/kit/route.ts`. Kontrakt jest niezależny od implementacji: trasa w `contracts/board.ts` może istnieć, zanim serwis `board` ją zarejestruje (BE-033). Generatory typów i ich `--check`: `tools/codegen/gen-api.mjs` (SH-004). Stałe UUID demo: `backend/src/lib/demo/ids.ts` (BE-063). Tryb `fake` tabletu w TAB-001 ma serwować fixture'y z tego zadania.
- **Dokumenty:** docs/mikroserwisy.md 5.4 (tabela tras `board`, ETag = hash treści, 304, język w zapytaniu, bez danych o ludziach poza autorem flagi według ustawień), 8 (kto widzi co); docs/development-szczegoly.md 3.3 `board` (pełna lista pól odpowiedzi tabletu, `GET …/boxes`, `GET …/display`, widoki klienta), 3.2 (seed: wt 13.10.2026 07:15, Hala główna 1–8, Hala nowa 1–6, Brzozowa 1–6, konie i flagi), 3.5.2 (stany ekranu tabletu), 3.5.4 (WyswietlaczCentralny, WyswietlaczHala, BezAkcji, jedna hala), 4.1 „Składanie odpowiedzi board”; docs/erd.md pkt 2, 3, 12, 16. Szczegóły pól: Zakres BE-041 (tablica), BE-042 (wyświetlacz), BE-038 (klient), BE-045 (rutyna w tych widokach), BE-054 (stan `suspended`).
- **Makiety:** `mockups/project/TabletBoks.dc.html`, `TabletPopup.dc.html`, `TabletBoksBrzozowa.dc.html`, `TabletBoksBezAkcji.dc.html`, `WyswietlaczCentralny.dc.html`, `WyswietlaczHala.dc.html`, `Main.dc.html`, `KartaKonia.dc.html`; stany z docs/makiety-plan.md E (TabletBoksWoda, TabletBoksWolny, TabletOffline).
- **Decyzje:** DEC-14 A (wizyty i jazdy w „Dziś w stajni” na TV są częścią funkcji `routine`).
- **Dane demo:** Kasztan HG 7 o 07:15 i pop-up flagi Anny o 06:01, Bella HN 4 (niepotwierdzona „Nie na padok” od 01:20), Bursztyn HN 5 (poidło ręczne, woda 06:55), wolne HG 3 i HN 6, Brzozowa boks 1 (Kometa, bez potwierdzeń), wariant BezAkcji; TV Pod Lipami (wszystkie hale i Hala nowa), Brzozowa (jedna hala); Anna (Kasztan, Bella), karta Kasztana.

## Zakres
- [ ] `backend/src/contracts/board.ts`: schematy zod i trasy (prefiks `/board/v1/stables/{stableId}`), wszystkie `GET`, `lang=pl|uk|en`, nagłówki `ETag`, `Date`, odpowiedź 304:
  - `GET …/boxes/{boxId}` (tablica tabletu i boksu): `building`, `box`, `horse | null`, `state: 'ok' | 'free' | 'suspended'`, `flags.banner[]`, `flags.later[]` (etykieta, `hoursLabel`, wariant, notatka, autor według ustawień, `requiresAck`, status, `popup`), `feeding | null` (pasze × pory, `soak`, `WSTRZYMANE`), `quickActions` (stan „Boks gotowy”, bieżący albo następny posiłek z „podane HH:MM”, padok konia po skutkach flag, woda przy poidle ręcznym; pola opcjonalne, wypełnia BE-045), `config` (przyciski i tryb potwierdzeń), `recentActions[]` (≤ 5);
  - `GET …/boxes` (wybór boksu): hale według `sort_order` z boksami (`id`, numer, koń albo wolny);
  - `GET …/display?buildingId=` (wyświetlacz): nagłówek posiłków, `urgent[]`, sekcje hal z kaflami, `otherBuildings`, `today` (posiłki, padoki, wizyty, jazdy), `singleBuilding`, `state` (`ok | suspended`), opcjonalne `horsesWithoutBox` (DEC-29; do decyzji puste); bez danych osobowych;
  - `GET …/client-home` i `GET …/horses/{horseId}/card` (apka klienta): konie z `m[].h` z boksem albo bez, flagi aktywne i dzisiejsze, sekcja „Dziś”, `state`.
  Schematy nazwane w `boardSchemas`, serwis `board` w mapie `services` (`contracts/index.ts`), więc `npm run openapi` tworzy `backend/openapi/board.json`.
- [ ] Polityka tras według mikroserwisy.md 5.4 i 8 w deskryptorach (role, aplikacje, funkcja). Jeśli BE-006 jest już `done`, jego meta-test jej wymaga; jeśli nie, BE-006 dopisze ją razem z politykami tras `auth`.
- [ ] Przykłady odpowiedzi: `backend/src/contracts/examples/board.ts` (obiekty typowane schematami, UUID z `lib/demo/ids.ts`; tu dopisz stałe hal, boksów i pozostałych koni z seedu 3.2): `tablet-HG7-0715`, `tablet-HG7-0601-popup`, `tablet-HN4-bella`, `tablet-HN5-woda`, `tablet-HN6-wolny`, `tablet-brzozowa-1`, `tablet-HG7-bezakcji`, `tablet-suspended`, `boxes-podlipami`, `boxes-brzozowa`, `display-podlipami`, `display-podlipami-hala-nowa`, `display-brzozowa`, `display-suspended`, `client-home-anna-podlipami`, `card-kasztan`. Test: każdy przykład przechodzi `schema.parse`. `npm run openapi` zapisuje je do `backend/openapi/examples/board/<nazwa>.json` (deterministycznie), `openapi:check` sprawdza aktualność.
- [ ] `tools/codegen/gen-api.mjs` (mała addytywna zmiana w SH-004): opcja `--examples <katalog>` kopiuje `backend/openapi/examples/**` do pakietu (np. `src/api/examples/`), z `--check` i usuwaniem przykładów, których już nie ma; opis w `tools/codegen/README.md`. `frontend/`: `npm run gen:api` z tą opcją.
- [ ] Opis w `backend/README.md` (albo README.md „Kod”): kontrakt `board` jest źródłem kształtu, zmiany po tym zadaniu tylko addytywne razem z przykładami.

## Poza zakresem
- Serwis `board` i składanie odpowiedzi z bazy (BE-033, BE-038, BE-041, BE-042, BE-045, BE-054); widoki admina (`boxes-overview`, `horses-overview`, `setup-checklist`: BE-033), lista dnia i pulpit (`…/day`, `…/admin-today`: BE-045).
- Ekrany (TAB-001 i dalej, WEB-016, MOB-012).

## Kryteria akceptacji
- [ ] `backend/openapi/board.json` zawiera pięć tras z tego zakresu, a `backend/openapi/examples/board/` szesnaście przykładów; `npm run openapi:check` zielone.
- [ ] Przykład `tablet-HG7-0715` odpowiada makiecie TabletBoks (Kasztan, „Bez śniadania” 06:00–10:00 potwierdzona, „Później: …”, karmienie z WSTRZYMANE, szybkie akcje „podane 06:40”); `display-brzozowa` ma `singleBuilding = true`; `display-*` nie zawiera imion osób ani kontaktów (test na kanarkach z danych demo).
- [ ] `cd frontend && npm run gen:api` tworzy `src/api/board.d.ts` i `src/api/examples/board/*.json`; drugi przebieg z `--check` nic nie zmienia.

## Testy
- Vitest: `backend/src/contracts/board.test.ts` (przykłady zgodne ze schematami, brak PII w `display-*`), istniejące `contracts.test.ts`. `cd backend && npm run check`.
- `node --test tools/codegen` (opcja `--examples`).

## Definicja gotowości
- `npm run check` i `npm run build` zielone w `backend/` i `frontend/`; `board.json`, przykłady i typy w repo; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Powstało z uwagi do kolejki: tablet (TAB-001, TAB-007, TAB-008) budował fixture'y wcześniej niż kontrakt z BE-041, co gwarantowało rozjazd kształtów (docs/development-szczegoly.md 3.6 „Prace równoległe”: interfejsy na fixture'ach z kontraktów).
- Zadania implementujące mogą kontrakt rozszerzać tylko addytywnie i aktualizują przykłady w tym samym PR.
- Etykiety (np. „Hala nowa · boks 4”) składa aplikacja z `buildingCount`/`showBuilding`; w przykładach są dane, nie gotowe teksty, poza etykietami z serwera (`hoursLabel`, nazwy pór).
