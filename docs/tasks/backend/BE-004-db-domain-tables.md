---
id: BE-004
title: "Migracje tabel ze stable_id (domenowe i auth)"
area: backend
stage: 0
size: L
status: todo
depends_on: [BE-001]
decisions: [DEC-10, DEC-05]
owner:
branch:
trello: https://trello.com/c/Yrv48wxL
---
# BE-004 · Migracje tabel ze stable_id (domenowe i auth)

## Cel
W bazie są wszystkie pozostałe tabele z `docs/erd.md`, z izolacją stajni w schemacie (wielokolumnowe FK), tak żeby serwisy `auth`, `stables`, `operations`, `schedule`, `billing`, `notifications`, `files` i `platform` mogły pisać kod domeny bez czekania na migracje.

## Kontekst
- Stan kodu: BE-001 daje `backend/src/lib/db` (helpery kolumn, `schema/auth.ts` z `users`, `businesses`, `business_admins`, `platform_roles`, `platform_requests`, schemat `audit`, migrator, harness).
- Dokumenty: `docs/erd.md` diagram ERD (kolumny każdej tabeli), „Zasady wspólne” i „Słowniki wartości”; `docs/development-szczegoly.md` 3.1.4 „Unikalności i indeksy” i „Izolacja w schemacie”; `docs/mikroserwisy.md` 11.1 (zmiany: `rides.rider_user_id`/`instructor_user_id`, `payment_provider_events.payload_file_id`, wartości `source`/`method`/`author_role`, `notifications.stable_id` puste dla konta firmy, `granted_via`, `granted_session_id`).
- Decyzje: DEC-10 (bez `identity_pool`); DEC-05 (bez `signing_keys`). Razem z BE-001 daje to 49 tabel w `app` (50 z erd minus `signing_keys`) i 2 w `audit`.
- Zmiana względem pierwotnej listy: tabele `auth` ze `stable_id` (`stable_members`, `horse_access`, `invitations`, `stable_role_features`) są tutaj, a nie w BE-001, bo mają FK do `stables` i `horses`.

## Zakres
- [ ] `schema/stables.ts`: `stables` (`business_id` FK, `name`, `timezone`, `status`), `stable_settings` (PK `stable_id`, wszystkie przełączniki i progi z ERD, `NOT NULL` bez `DEFAULT`), `notification_rules` (PK `stable_id`, `event`, `recipient_role`, `channel`; `enabled`), `buildings` (adres, `sort_order`, `active`), `boxes` (`building_id`, `label`, `auto_waterer` NOT NULL, `active`), `horses` (`box_id` unikalny z NULL, `status`, `photo_file_id`, `left_at`), `horse_box_history`.
- [ ] `schema/auth.ts` (dopisać): `stable_members` (UK `stable_id`+`user_id`, `role`, `active`, `deactivated_at`, `granted_via`, `granted_session_id`), `horse_access`, `invitations` (z `display_name`, `locale`, `target`), `stable_role_features` (PK `stable_id`, `role`, `feature`; `visible`).
- [ ] `schema/operations.ts` (16 tabel): `flag_templates`, `flag_template_labels`, `horse_flags`, `flag_acknowledgements`, `flag_escalations`, `meal_slots`, `meal_slot_labels`, `feeds`, `paddocks`, `feeding_plans`, `feeding_plan_items`, `building_routines`, `box_care_events`, `paddock_plans`, `paddock_plan_companions`, `tasks`.
- [ ] `schema/schedule.ts`: `health_events`, `health_attachments`, `arenas`, `rides` (z `rider_user_id`, `instructor_user_id`). `schema/billing.ts` (9 tabel, kwoty `bigint` w groszach, `payment_provider_events.payload_file_id`). `schema/notifications.ts`: `notifications` (`stable_id` NULL dozwolone). `schema/files.ts`: `files` (`stable_id` NULL dla APK). `schema/platform.ts`: `app_releases`, `app_release_targets`.
- [ ] Izolacja: `UNIQUE (stable_id, id)` w tabelach-rodzicach (m.in. `buildings`, `boxes`, `horses`, `flag_templates`, `horse_flags`, `meal_slots`, `feeds`, `paddocks`, `feeding_plans`, `paddock_plans`, `health_events`, `arenas`, `files`, `subscriptions`, `invoices`, `billing_accounts`) i FK `(stable_id, x_id)` w dzieciach, bez akcji kaskadowych. Tabele podrzędne bez `stable_id` (`*_labels`, `feeding_plan_items`, `paddock_plan_companions`, `invoice_lines`) tylko FK do rodzica.
- [ ] Unikalności (3.1.4): `horses.box_id`; częściowe otwarte `horse_box_history` na konia i na boks (`to_at IS NULL`); `buildings (stable_id, name)`; `flag_templates (stable_id, code)`; `flag_escalations (flag_id, level)`; `building_routines`: dwa częściowe indeksy przy `cancelled_at IS NULL` (`meal_served`: `building_id, meal_slot_id, service_date`; `paddock_out`: `building_id, service_date`); `meal_slots (stable_id, code)` przy `valid_to IS NULL`; `feeds (stable_id, name)`, `paddocks (stable_id, name)`; `horse_flags.replaces_flag_id`; `notifications.dedupe_key`; `payment_provider_events.provider_event_id`; `usage_snapshots (subscription_id, period_start, metric)`; `invoices (subscription_id, period_start)` przy `status <> 'void'`, `invoices.number`; `files.s3_key`; `app_releases.version_code`, `file_id`; `health_attachments.file_id`; `billing_accounts.stable_id`; `payments.provider_payment_id`. Indeksy: `box_care_events (stable_id, box_id, kind, occurred_at)`, `boxes (stable_id, building_id)`. Celowo bez unikalności `boxes.label`.
- [ ] Jedna migracja na grupę właściciela (`npm run db:generate`), przejrzana ręcznie; wpisy w `owners.ts`, jeśli BE-003 już jest.

## Poza zakresem
- Kod domeny, repozytoria i seed (zadania serwisów, BE-011).
- Kolumny spoza ERD; zmiany ERD wymagają decyzji właściciela produktu.

## Kryteria akceptacji
- [ ] `npm run migrate` tworzy wszystkie tabele; test katalogu z BE-002 (jeśli już jest) zielony.
- [ ] Koń stajni A wstawiony do boksu stajni B daje błąd FK; to samo flaga z szablonem innej stajni i potwierdzenie z boksem innej stajni.
- [ ] Dwa konie w jednym boksie i dwa otwarte wpisy historii jednego konia dają błąd unikalności; dwa boksy o numerze „4” w jednej hali przechodzą.
- [ ] Drugi aktywny `meal_slot` o tym samym `code` daje błąd, a po ustawieniu `valid_to` starego przechodzi.

## Testy
- `backend/src/lib/db/domain-schema.test.ts`: FK między stajniami (kilka par), unikalności częściowe (`building_routines` po „Cofnij”, `invoices` z `void`, `meal_slots`), NULL w `horses.box_id`. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; migracje w repo; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Statusy i słowniki (`active | left`, `tidy | water`, `tablet | app | web | ops`…) to `text` bez `CHECK`; walidacja w kodzie (zod) w zadaniach serwisów.
- `days_mask` to `smallint` (pn = 1 … nd = 64); godziny lokalne w `time`, reszta czasu w `timestamptz`.
- Złożona FK z kolumną NULL (np. `horses (stable_id, box_id)`) nie jest sprawdzana przy NULL; to zamierzone.
- Nie dodawaj `DEFAULT` nawet dla `version` i booleanów: wartość nowej stajni nadaje kod (BE-029).
