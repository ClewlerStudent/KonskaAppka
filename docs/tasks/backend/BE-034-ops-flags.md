---
id: BE-034
title: "operations: flagi i potwierdzenia"
area: backend
stage: 3
size: L
status: todo
depends_on: [BE-028, BE-030, BE-032]
decisions: [DEC-21, DEC-03, DEC-26]
owner:
branch:
trello: https://trello.com/c/rYE1MvEJ
---
# BE-034 · operations: flagi i potwierdzenia

## Cel
Flagi to wyjątki od rutyny konia („Bez śniadania”, „Nie na padok”, „Derka”, „Leki”, „Wet”, „Inna flaga”) z obowiązkowymi godzinami od–do. Klient ustawia je dla swojego konia, a obsługa i admin dla każdego konia. W stajni z potwierdzeniami tablet przy boksie, obsługa albo admin potwierdzają flagę. To zadanie daje API flag w serwisie `operations`, z którego korzystają tablet, apka, panel, wyświetlacz, eskalacje (BE-035) i powiadomienia (BE-036).

## Kontekst
- **Stan kodu:** serwis `operations` (`backend/src/services/operations/`, `npm run start:operations`), kontrakt `backend/src/contracts/operations.ts`, szablony flag i pory posiłków powstają w BE-028. Tabele `horse_flags`, `flag_acknowledgements`, `flag_escalations`, `flag_templates`, `flag_template_labels` są w `backend/src/lib/db` (BE-004). Czyste funkcje czasu (okno, `default_window`, terminy `ack_deadline_at`/`warn_at`/`notify_at`, etykiety „06:00–10:00”, „od 14:30”, skutki `suspend_meal`/`cancel_paddock`) daje `backend/src/lib/rules` (BE-007). Polityka w deskryptorze trasy (`clients`, `stable {roles, feature, write}`), `resolveStable` i walidacja `X-Box-Id`: `backend/src/lib/tenancy` i `backend/src/lib/authz` (BE-006). `unitOfWork` z audytem i buforem zdarzeń: BE-005, katalog zdarzeń i `publishAfterCommit`: `backend/src/lib/messaging` (BE-008). Wzór rejestracji tras i testów: `backend/src/services/auth/app.ts`, `backend/src/services/auth/app.test.ts`.
- **Dokumenty:**
  - docs/mikroserwisy.md 5.5 (tabela tras „Flagi”, kto może co), 3.6 (tablet z `X-Box-Id`, koń klienta spoza `h` i koń `left` dają 404), 4.4 (`author_role = operator` dla admina globalnego, `method`: `tablet | app | web | ops`), 8 (macierz uprawnień i kody odmowy);
  - docs/development-szczegoly.md 3.3 `operations` „Flagi” (wszystkie reguły zapisu, potwierdzeń i testy), 3.1.5 (id nadane przez klienta i `request_hash`, kody `id_conflict`, `target_passed`, `option_disabled`, `ack_not_required`), 4.1 „Ustawienia stajni”, 4.2 „Role”;
  - docs/erd.md: tabele `horse_flags`, `flag_acknowledgements`, pkt 12 (godziny i potwierdzenia), słowniki `horse_flags.source`, `author_role`, `flag_acknowledgements.method`.
- **Makiety:** docs/mockups/project/SzybkaFlaga.dc.html (kafelki, podpowiedź „Derka: zakładać · 16:00–08:00”), StatusFlagi.dc.html (Ustawiona → Potwierdzona, „Admin stajni dostał powiadomienie”), TabletPopup.dc.html, TabletBoks.dc.html.
- **Decyzje:** DEC-21 wariant A (flaga z wyłączonego szablonu obowiązuje i jest widoczna do końca okna; znika tylko kafelek, nowy zapis daje 409). DEC-03 wariant A (funkcja `flags` z claimu `m[].f`).
- **Dane demo:** Stajnia Pod Lipami (`flags_require_ack = true`, Derka aktywna), Stajnia Brzozowa (potwierdzenia wyłączone, `derka` nieaktywna). Anna (klientka: Kasztan HG 7, Bella HN 4, Kometa w Brzozowej), Ewa K. (Sonata HG 4), Ola (obsługa w obu), Paweł (obsługa Brzozowa), Marta (instruktor), Damian (admin konta), Kuba (`plt = admin`, aplikacja `ops`), konta „Tablety Pod Lipami” i „Tablety Brzozowa”. Boksy zawsze po `id` ze stałych UUID seedu.

## Zakres
- [ ] Kontrakty w `backend/src/contracts/operations.ts` (prefiks `/operations/v1/stables/{stableId}`), z polityką w deskryptorze:
  - `POST …/flag-preview` (klient: swój koń, obsługa, admin; funkcja `flags`): `{horseId, templateId | customText, validFrom?, validTo?, variant?}` → podpowiedziane okno, etykieta („dziś 06:00–10:00”), skutki („wstrzymane śniadanie 06:30”, skrócony padok), `requiresAck` stajni. Dla „Nie na padok” okno z planu padoku konia, a bez planu „dziś, cały dzień” (plany padoku dochodzą w BE-043).
  - `POST …/horses/{horseId}/flags`: `{id, templateId? | customText?, validFrom, validTo, variant?, note?, mealSlotId?, serviceDate?, source?, clientCreatedAt?}`.
  - `POST …/flags/{flagId}/replace` (nowa flaga z `replaces_flag_id`, stara z `cancelled_at`, jedna transakcja) i `POST …/flags/{flagId}/cancel` (`{reason?}`).
  - `POST …/flags/{flagId}/acks`: `{id, occurredAt, timeQuality: synced | unknown}`; tablet z nagłówkiem `X-Box-Id`.
  - `GET …/flags?date=&horseId=` albo z zakresem `?from=&to=&horseId=` (daty lokalne stajni, zakres najwyżej 31 dni, flagi, których okno nachodzi na zakres, także odwołane i zakończone; potrzebne apce do grupy „Zakończone i odwołane · 7 dni”, MOB-014) i `GET …/flags/{flagId}` (role z funkcją `flags`; klient tylko konie z `m[].h`), z eskalacjami (`flag_escalations.level`).
- [ ] Moduł domeny `backend/src/services/operations/domain/flags/` z funkcjami `createFlag`, `replaceFlag`, `cancelFlag`, `acknowledgeFlag` przyjmującymi transakcję (użyją ich BE-035 i BE-046).
- [ ] Reguły zapisu flagi:
  - `request_hash` = SHA-256 kanonicznej treści; ten sam `id` z tym samym hashem zwraca istniejący zapis (powtórzenie z kolejki), z innym `409 id_conflict`;
  - `requires_ack` kopiowane z `stable_settings.flags_require_ack` (klient go nie wysyła); terminy z `lib/rules` tylko przy `requires_ack = true`, inaczej `NULL`;
  - brak `validFrom` albo `validTo` (pola wymagane w schemacie): 400 `validation_failed` z walidacji kit, zanim żądanie dojdzie do domeny; koniec nie później niż początek (`validTo <= validFrom`): 422 `invalid_window` (reguła domeny); okno już minęło: `422 target_passed`; `variant` wymagany dla `derka` (`on | off`) i zakazany dla innych szablonów (422);
  - nieaktywny szablon: `409 option_disabled`; `customText` („Inna flaga”) przechodzi zawsze;
  - `author_role` z tokenu (`client | staff | admin`, `operator` dla `plt`), `created_by = sub`, `source` `on_behalf_*` tylko dla obsługi i admina; `severity` i `effect` kopiowane z szablonu.
- [ ] `occurredAt` potwierdzenia (czas urządzenia, także z kolejki offline) najwyżej czas serwera + 2 min, inaczej 422 `validation_failed` z polem `occurredAt`; starszy `occurredAt` jest dozwolony (wpis z kolejki), zapis ma też `created_at` z zegara serwera.
- [ ] Reguły potwierdzenia: `method` z `client_id` (`tablet → tablet`, `mobile → app`, `web → web`, `ops → ops`); z tabletu `user_id = NULL`, `box_id` z `X-Box-Id`, a koń flagi musi stać w tym boksie (inaczej 404, bez zapisu); `requires_ack = false` daje `409 ack_not_required` bez wiersza; flaga odwołana albo zakończona: wiersz z `conflict = flag_cancelled | flag_ended`, odpowiedź 200 z polem `conflict`, flaga nie dostaje `acknowledged_at`; pierwsze potwierdzenie ustawia `horse_flags.acknowledged_at` pod blokadą wiersza (`SELECT … FOR UPDATE`, ten sam porządek blokad co cron w BE-035). Potwierdza tablet, obsługa (apka) i admin (apka, panel, `ops`); klient, instruktor i wyświetlacz dostają `403 forbidden_role`.
- [ ] DTO flagi: `id`, `horseId`, `templateCode`, `label`, `severity`, `effect`, `variant`, `note`, `authorRole`, `validFrom`, `validTo`, `hoursLabel`, `requiresAck`, `status` (`acknowledged | unacknowledged | null` gdy bez potwierdzeń), `acknowledgedAt`, `cancelledAt`, `replacesFlagId`, `escalations[]`.
- [ ] Audyt każdego zapisu (`actor_type` `user | tablet | operator`, `client`, `session_id`); zdarzenie `flag.created` po COMMIT dla flagi z `author_role = client` (reguła `flag_created_by_client`), z danymi do treści powiadomienia (stajnia, koń, boks z halą, etykieta, godziny); schemat w katalogu zdarzeń BE-008.
- [ ] Brakujące kody w `backend/src/contracts/common.ts` (`ERRORS`): `target_passed` (422), `invalid_window` (422), `option_disabled` (409), `ack_not_required` (409); `id_conflict` (409) jest już z BE-021; BE-006 dodaje tylko kody polityki (`forbidden_role`, `feature_hidden`, `forbidden_platform`, `other_building`, `step_up_required`).
- [ ] Seed: moduł w `backend/scripts/seed/` (BE-011, `npm run db:seed`, stałe UUID z `backend/src/lib/testing/demo.ts`): flagi z docs/development-szczegoly.md 3.2 (Kasztan ×2 potwierdzone o 06:02 z tabletu HG 7, Bella niepotwierdzona od 01:20, Hetman „Leki rano” potwierdzona 06:20, Sonata „Derka: zakładać” Ewy K. potwierdzona 07:05, Kometa i Lord w Brzozowej bez potwierdzeń). Wariant `bez-flag-a01` (opcja `--variant` z BE-011): bez flag Anny z 03:14 i 03:16, żeby A-01 dało się odtworzyć w E2E (MOB-013, TAB-014). Eskalacje Belli dopisuje BE-035.
- [ ] `npm run openapi` w `backend/`, `npm run gen:api` we `frontend/`.

## Poza zakresem
- eskalacje i cron (BE-035), wysyłka powiadomień (BE-036), widoki `board` (BE-038, BE-041, BE-042);
- CRUD szablonów i pory posiłków (BE-028), plany padoku (BE-043), konsument `horse.left` (BE-046);
- ekrany: apka (MOB-013…MOB-015), tablet (TAB-013, TAB-014), panel (WEB-015).

## Kryteria akceptacji
- [ ] `GET …/flags?from=2026-10-07&to=2026-10-13` dla Anny zwraca jej flagi z tych dni łącznie z odwołanymi; zakres dłuższy niż 31 dni daje 400.
- [ ] A-01 (backend): flagi Anny z 03:14 i 03:16; potwierdzenie tabletu HG 7 o 06:02 zapisuje `method = tablet`, `user_id = NULL`, `box_id` boksu 7 Hali głównej, `audit_log.actor_type = tablet`.
- [ ] A-12: podpowiedź „Bez śniadania” to dziś 06:00–10:00; flaga bez `validTo` daje 400 `validation_failed`, a z `validTo` przed `validFrom` 422 `invalid_window`; „Derka: zakładać” 16:00–08:00 przechodzi przez północ; terminy liczone od początku okna.
- [ ] A-18: flaga Komety ma `requires_ack = false` i puste terminy; potwierdzenie daje `409 ack_not_required` i nie tworzy wiersza.
- [ ] A-20: zmiana `flags_require_ack` nie zmienia `requires_ack` flag już zapisanych.
- [ ] A-19 i DEC-21: flaga z nieaktywnego szablonu daje `409 option_disabled`, „Inna flaga” przechodzi, a trwająca Derka Sonaty dalej jest w `GET …/flags`.
- [ ] A-10: potwierdzenie flagi Belli z `X-Box-Id` boksu 4 Hali nowej zapisuje id tego boksu; z `X-Box-Id` boksu 4 Hali głównej daje 404; z boksu Brzozowej 404 bez zapisu.
- [ ] Ten sam `id` z inną treścią: `409 id_conflict`; z tą samą: jeden wiersz.
- [ ] Klient na koniu spoza `h` i na koniu `left`: 404; Paweł w Pod Lipami: 404; wyświetlacz przy każdym zapisie: 403; Kuba (`ops`) potwierdza z `method = ops`, a jego flaga ma `author_role = operator`.

## Testy
- Jednostkowe (Vitest): kanoniczny `request_hash`, mapowanie `client_id → method`, składanie DTO i statusu.
- Integracyjne (Testcontainers PostgreSQL + harness `backend/src/lib/testing` z BE-010, `app.inject`, `mintToken` dla osób z demo): wszystkie kryteria wyżej, dwa równoległe potwierdzenia dają jedno `acknowledged_at`, dwa równoległe zapisy z tym samym `id` dają jeden wiersz.
- Uruchomienie: `cd backend && npm run check` (typecheck, lint, format, test, openapi:check); pojedynczo `npx vitest run src/services/operations`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/operations.json` zaktualizowany, `npm run gen:api` we `frontend/` wykonany.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Zwykły npm, bez pnpm i `packages/*`; wspólny kod tylko w `backend/src/lib/*`, `backend/src/kit`, `backend/src/contracts` (reguła ESLint `equenor/service-boundaries`).
- Czas wyłącznie przez `Clock` (`backend/src/kit/clock.ts`) i `lib/rules` w strefie stajni; nigdy `new Date()` w logice.
- Bez `DEFAULT` w bazie: każdą wartość (`requires_ack`, `version`, `updated_at`) ustawia kod; UUIDv7 nadaje kod.
- Boks tylko po `boxes.id`, nigdy po numerze. Status flagi to wyłącznie „potwierdzona HH:MM” albo „niepotwierdzona”, i tylko przy `requires_ack`.
- `operations` nie czyta tabel uprawnień `auth`; kim jest użytkownik, wie tylko z tokenu (W2).
