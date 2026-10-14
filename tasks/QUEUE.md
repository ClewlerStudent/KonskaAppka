# Kolejka zadań EQUENOR

> Plik generowany przez `node tasks/queue.mjs index` z nagłówków plików zadań. Nie edytuj go ręcznie:
> zmieniaj pliki zadań (najlepiej komendami `claim` i `set`) i uruchom `index`.
> Protokół pracy agentów: [README.md](README.md). Decyzje właściciela: [decisions.md](decisions.md).

## Podsumowanie

| Obszar | Katalog | todo | in_progress | review | done | blocked | Razem |
|---|---|--:|--:|--:|--:|--:|--:|
| Backend (mikroserwisy i crony) | [backend/](backend/) | 62 | 0 | 0 | 0 | 0 | 62 |
| Web: panel admina, wyświetlacz TV, strona www | [web/](web/) | 29 | 0 | 0 | 0 | 0 | 29 |
| Aplikacja mobilna | [mobile/](mobile/) | 25 | 0 | 0 | 0 | 0 | 25 |
| Tablet e-ink przy boksie | [tablet/](tablet/) | 21 | 0 | 0 | 0 | 0 | 21 |
| Wspólne: docs, środowisko, CI, akceptacja | [shared/](shared/) | 6 | 0 | 0 | 0 | 0 | 6 |
| **Razem** | | **143** | **0** | **0** | **0** | **0** | **143** |

Rozmiary: S: 19, M: 96, L: 28. Decyzje otwarte: 27 z 27.

## Gotowe do wzięcia (8)

Status `todo` i wszystkie zależności `done`. Kolejność: etap, potem ID. Komenda: `node tasks/queue.mjs next --area <obszar>`.

| ID | Zadanie | Obszar | Etap | Rozmiar | Decyzje (rekomendacja obowiązuje do rozstrzygnięcia) |
|---|---|---|--:|---|---|
| BE-001 | [lib/db: Drizzle, migrator, tabele globalne auth i audit](backend/BE-001-db-migrator.md) | backend | 0 | L | DEC-09, DEC-04, DEC-05, DEC-10 |
| BE-007 | [lib/rules: czas, flagi, konfiguracja stajni](backend/BE-007-rules.md) | backend | 0 | L | DEC-20 |
| BE-012 | [Adapter ZITADEL i konfiguracja jako kod](backend/BE-012-zitadel-adapter.md) | backend | 0 | L | DEC-08, DEC-10 |
| SH-001 | [Docs zgodne z decyzjami i kodem](shared/SH-001-docs-decyzje.md) | shared | 0 | M | DEC-01, DEC-02, DEC-05, DEC-10 |
| SH-003 | [CI dla wszystkich pakietów (kroki niezależne od systemu CI)](shared/SH-003-ci.md) | shared | 0 | M | DEC-02 |
| SH-004 | [Generowanie typów API i tokenów palety dla frontend, mobile i tablet](shared/SH-004-gen-api-theme.md) | shared | 0 | S | DEC-02 |
| BE-014 | [lib/i18n: szablony wiadomości SMS i e-mail](backend/BE-014-i18n-messages.md) | backend | 1 | S |  |
| WEB-008 | [Strona www: dokumenty i strony sklepowe](web/WEB-008-www-legal.md) | web | 1 | S |  |

## W toku, do przeglądu i zablokowane (0)

Brak.

## Backend (mikroserwisy i crony) (BE, 62)

| ID | Zadanie | Etap | Rozmiar | Status | Zależności | Decyzje |
|---|---|--:|---|---|---|---|
| BE-001 | [lib/db: Drizzle, migrator, tabele globalne auth i audit](backend/BE-001-db-migrator.md) | 0 | L | todo |  | DEC-09, DEC-04, DEC-05, DEC-10 |
| BE-002 | [Bramka zakazanych obiektów w bazie](backend/BE-002-db-gate.md) | 0 | M | todo | BE-001 | DEC-09 |
| BE-003 | [owners.ts, role bazy i granty](backend/BE-003-db-grants.md) | 0 | M | todo | BE-001 |  |
| BE-004 | [Migracje tabel ze stable_id (domenowe i auth)](backend/BE-004-db-domain-tables.md) | 0 | L | todo | BE-001 | DEC-10 |
| BE-005 | [unitOfWork i lib/audit](backend/BE-005-uow-audit.md) | 0 | M | todo | BE-001 | DEC-26 |
| BE-006 | [lib/tenancy, lib/authz i polityka w deskryptorze trasy](backend/BE-006-tenancy-authz.md) | 0 | L | todo | BE-004, BE-005 | DEC-03 |
| BE-007 | [lib/rules: czas, flagi, konfiguracja stajni](backend/BE-007-rules.md) | 0 | L | todo |  | DEC-20 |
| BE-008 | [lib/messaging: zdarzenia i kolejki](backend/BE-008-messaging.md) | 0 | L | todo | BE-005, SH-002 | DEC-01 |
| BE-009 | [Szablon crona (src/jobs)](backend/BE-009-cron-kit.md) | 0 | M | todo | BE-003, BE-008 |  |
| BE-010 | [lib/testing, stałe danych demo i dev:token](backend/BE-010-testing-kit.md) | 0 | S | todo | BE-001, BE-004 |  |
| BE-011 | [Seed z makiet: szkielet, konta, firmy i stajnie](backend/BE-011-seed.md) | 0 | M | todo | BE-004, BE-005, BE-010 | DEC-10, DEC-20 |
| BE-012 | [Adapter ZITADEL i konfiguracja jako kod](backend/BE-012-zitadel-adapter.md) | 0 | L | todo |  | DEC-08, DEC-10 |
| BE-013 | [auth: users i uprawnienia z bazy, claimy z tabel](backend/BE-013-auth-db-repos.md) | 1 | L | todo | BE-001, BE-004, BE-005, BE-007, BE-010 | DEC-03, DEC-05, DEC-06, DEC-10, DEC-23 |
| BE-014 | [lib/i18n: szablony wiadomości SMS i e-mail](backend/BE-014-i18n-messages.md) | 1 | S | todo |  |  |
| BE-015 | [auth: kody przez kolejki sms i email](backend/BE-015-auth-code-queues.md) | 1 | M | todo | BE-008, BE-014 | DEC-01 |
| BE-016 | [Serwis sms](backend/BE-016-svc-sms.md) | 1 | M | todo | BE-008 | DEC-11, DEC-01 |
| BE-017 | [Serwis email](backend/BE-017-svc-email.md) | 1 | M | todo | BE-008 | DEC-11, DEC-01 |
| BE-018 | [auth: reset hasła](backend/BE-018-auth-password-reset.md) | 1 | M | todo | BE-012, BE-013 | DEC-08, DEC-27 |
| BE-019 | [auth: GET /me, profil podstawowy i widok startowy](backend/BE-019-auth-me.md) | 1 | M | todo | BE-013 | DEC-15 |
| BE-020 | [auth: kontakt, hasło, kanał kodu, usunięcie konta](backend/BE-020-auth-profile-changes.md) | 1 | L | todo | BE-012, BE-013, BE-015 | DEC-08 |
| BE-021 | [auth: konto firmy z NIP](backend/BE-021-auth-businesses.md) | 1 | M | todo | BE-005, BE-013 | DEC-04, DEC-27 |
| BE-022 | [auth: zaproszenia i dopasowanie po zalogowaniu](backend/BE-022-auth-invitations.md) | 1 | L | todo | BE-006, BE-008, BE-013 | DEC-10 |
| BE-023 | [auth: członkowie stajni i konta techniczne](backend/BE-023-auth-members.md) | 1 | M | todo | BE-006, BE-008, BE-013 | DEC-15 |
| BE-024 | [auth: dostęp do koni i macierz widoczności](backend/BE-024-auth-horse-access-matrix.md) | 1 | M | todo | BE-023 | DEC-03 |
| BE-025 | [auth: trasy /internal (odbiorcy powiadomień, wyjazd konia)](backend/BE-025-auth-internal.md) | 1 | M | todo | BE-021, BE-023 |  |
| BE-026 | [Admin globalny: plt, logowanie /ops/* i trasy /platform w auth](backend/BE-026-auth-platform-admin.md) | 1 | L | todo | BE-006, BE-008, BE-013 | DEC-10, DEC-07, DEC-05 |
| BE-027 | [Testy bezpieczeństwa auth i macierz izolacji etapu 1](backend/BE-027-auth-security-tests.md) | 1 | M | todo | BE-011, BE-018, BE-019, BE-020, BE-021, BE-022, BE-024, BE-025, BE-026 |  |
| BE-061 | [kit: bramka minimalnej wersji klienta (X-Client-Version)](backend/BE-061-client-version-gate.md) | 1 | S | todo | BE-006 |  |
| BE-028 | [operations: szkielet serwisu, domyślne dane stajni, szablony flag, pory posiłków](backend/BE-028-ops-defaults.md) | 2 | M | todo | BE-006, BE-007, BE-008 | DEC-20, DEC-21 |
| BE-029 | [stables: szkielet serwisu i zakładanie stajni](backend/BE-029-stables-create.md) | 2 | L | todo | BE-021, BE-028 | DEC-20, DEC-27 |
| BE-030 | [stables: ustawienia stajni, features, reguły powiadomień](backend/BE-030-stables-settings.md) | 2 | M | todo | BE-029 | DEC-20 |
| BE-031 | [stables: hale i boksy](backend/BE-031-stables-buildings-boxes.md) | 2 | M | todo | BE-029 |  |
| BE-032 | [stables: konie (przypisanie, przeniesienie, zamiana, wyjazd)](backend/BE-032-stables-horses.md) | 2 | L | todo | BE-025, BE-031 |  |
| BE-033 | [board: szkielet serwisu i widoki admina (boksy, konie, pierwsze kroki)](backend/BE-033-board-skeleton.md) | 2 | M | todo | BE-030, BE-032 |  |
| BE-062 | [auth: GET /me z telefonem stajni i końmi klienta](backend/BE-062-me-stable-contact-horses.md) | 2 | S | todo | BE-019, BE-032 | DEC-15 |
| BE-034 | [operations: flagi i potwierdzenia](backend/BE-034-ops-flags.md) | 3 | L | todo | BE-028, BE-030, BE-032 | DEC-21, DEC-03, DEC-26 |
| BE-035 | [Cron escalation-scheduler](backend/BE-035-cron-escalation.md) | 3 | M | todo | BE-009, BE-034 | DEC-01, DEC-27 |
| BE-036 | [Serwis notifications (router)](backend/BE-036-svc-notifications.md) | 3 | L | todo | BE-014, BE-025, BE-029 | DEC-16, DEC-20, DEC-01 |
| BE-037 | [Cron invitation-expiry-notifier](backend/BE-037-cron-invitation-expiry.md) | 3 | S | todo | BE-009, BE-022 |  |
| BE-038 | [board: widok klienta i karta konia (flagi)](backend/BE-038-board-client.md) | 3 | M | todo | BE-033, BE-034 | DEC-23, DEC-03 |
| BE-039 | [Serwis files: minimum](backend/BE-039-svc-files-min.md) | 4 | M | todo | BE-006, SH-002 |  |
| BE-040 | [platform: wydania APK](backend/BE-040-platform-apk.md) | 4 | M | todo | BE-039 | DEC-10 |
| BE-041 | [board: tablica tabletu](backend/BE-041-board-tablet.md) | 4 | L | todo | BE-033, BE-034 | DEC-13, DEC-03 |
| BE-042 | [board: widok wyświetlacza](backend/BE-042-board-display.md) | 5 | M | todo | BE-041 | DEC-14, DEC-03 |
| BE-043 | [operations: karmienie, padoki, słowniki](backend/BE-043-ops-feeding.md) | 6 | M | todo | BE-028, BE-032 |  |
| BE-044 | [operations: szybkie akcje](backend/BE-044-ops-quick-actions.md) | 6 | L | todo | BE-030, BE-043 | DEC-18, DEC-26 |
| BE-045 | [board: lista dnia, historia, widoki admina z rutyną](backend/BE-045-board-day.md) | 6 | L | todo | BE-041, BE-043, BE-044, BE-038, BE-042 | DEC-14, DEC-18 |
| BE-046 | [horse.left: konsumenci i horse-left-reconciler](backend/BE-046-horse-left.md) | 6 | M | todo | BE-009, BE-032, BE-034, BE-043 | DEC-01 |
| BE-047 | [schedule: zdrowie i załączniki](backend/BE-047-schedule-health.md) | 7 | M | todo | BE-006, BE-039, BE-032 | DEC-03 |
| BE-048 | [schedule: ujeżdżalnie i jazdy](backend/BE-048-schedule-rides.md) | 7 | M | todo | BE-046, BE-047 | DEC-17, DEC-03, DEC-27 |
| BE-049 | [Cron health-due-reminders](backend/BE-049-cron-health-due.md) | 7 | S | todo | BE-009, BE-036, BE-047 | DEC-20, DEC-27 |
| BE-050 | [operations: zadania](backend/BE-050-ops-tasks.md) | 7 | M | todo | BE-023, BE-028, BE-046 | DEC-03, DEC-27 |
| BE-051 | [files: pełna wersja i files-gc](backend/BE-051-files-full.md) | 7 | M | todo | BE-009, BE-039, BE-032 | DEC-24 |
| BE-052 | [Serwis billing na fałszywych adapterach](backend/BE-052-svc-billing.md) | 8 | L | todo | BE-008, BE-029, BE-039 | DEC-12 |
| BE-053 | [Crony billingu](backend/BE-053-cron-billing.md) | 8 | M | todo | BE-009, BE-052, BE-036 | DEC-12, DEC-20, DEC-27 |
| BE-054 | [Zawieszenie stajni](backend/BE-054-stable-suspended.md) | 8 | S | todo | BE-041, BE-053, BE-042, BE-038 | DEC-12 |
| BE-055 | [Audyt w platform i retention-pruner](backend/BE-055-audit-retention.md) | 9 | M | todo | BE-005, BE-009, BE-040 | DEC-24, DEC-10 |
| BE-056 | [CLI opctl](backend/BE-056-opctl.md) | 9 | M | todo | BE-026, BE-009, BE-040, BE-052 | DEC-10, DEC-05, DEC-08 |
| BE-057 | [Pełna macierz izolacji i meta-testy](backend/BE-057-isolation-matrix.md) | 9 | M | todo | BE-045, BE-048, BE-050, BE-052 | DEC-03, DEC-10 |
| BE-058 | [Obserwowalność i test obciążenia](backend/BE-058-observability-k6.md) | 9 | M | todo | BE-045 | DEC-13, DEC-01 |
| BE-059 | [Prawdziwe adaptery SMS i e-mail](backend/BE-059-real-senders.md) | 9 | M | todo | BE-016, BE-017 | DEC-11 |
| BE-060 | [Manifesty dla platformy](backend/BE-060-platform-manifests.md) | 9 | M | todo | BE-003, BE-008, BE-025, BE-009 | DEC-01 |

## Web: panel admina, wyświetlacz TV, strona www (WEB, 29)

| ID | Zadanie | Etap | Rozmiar | Status | Zależności | Decyzje |
|---|---|--:|---|---|---|---|
| WEB-001 | [Panel: klient API i sesja według ról](web/WEB-001-web-session.md) | 1 | M | todo | BE-019, SH-004 | DEC-07, DEC-15 |
| WEB-002 | [PanelResetHasla](web/WEB-002-web-reset-password.md) | 1 | S | todo | BE-018, WEB-001 | DEC-27 |
| WEB-003 | [PanelRejestracjaFirmy](web/WEB-003-web-business-signup.md) | 1 | M | todo | BE-021, WEB-001 | DEC-04 |
| WEB-004 | [Panel admina: układ i komponenty](web/WEB-004-web-admin-layout.md) | 1 | M | todo | WEB-001, WEB-003 | DEC-15 |
| WEB-005 | [PanelLudzie i konta techniczne](web/WEB-005-web-people.md) | 1 | M | todo | BE-023, BE-024, WEB-004 |  |
| WEB-006 | [PanelZaprosOsobe i lista zaproszeń](web/WEB-006-web-invite.md) | 1 | M | todo | BE-022, WEB-004 | DEC-27 |
| WEB-007 | [Panel: profil konta](web/WEB-007-web-profile.md) | 1 | M | todo | BE-020, WEB-004 |  |
| WEB-008 | [Strona www: dokumenty i strony sklepowe](web/WEB-008-www-legal.md) | 1 | S | todo |  |  |
| WEB-009 | [PanelZalozStajnie i PanelZalozPowiadomienia](web/WEB-009-web-create-stable.md) | 2 | L | todo | BE-029, BE-030, WEB-004 | DEC-20 |
| WEB-010 | [PanelPulpitStart](web/WEB-010-web-pulpit-start.md) | 2 | M | todo | BE-033, WEB-009, WEB-005, WEB-006 | DEC-27 |
| WEB-011 | [PanelBoksy](web/WEB-011-web-boxes.md) | 2 | L | todo | BE-031, BE-033, BE-022, BE-024, WEB-004 |  |
| WEB-012 | [PanelDodajHale i edycja hali/boksu](web/WEB-012-web-buildings.md) | 2 | M | todo | WEB-011 |  |
| WEB-013 | [Konie w panelu](web/WEB-013-web-horses.md) | 2 | M | todo | BE-024, BE-032, WEB-011, WEB-006 | DEC-27 |
| WEB-014 | [Ustawienia stajni](web/WEB-014-web-stable-settings.md) | 2 | L | todo | BE-024, BE-028, BE-030, WEB-004 | DEC-03, DEC-21 |
| WEB-015 | [Flagi w panelu](web/WEB-015-web-flags.md) | 3 | M | todo | BE-034, BE-036, BE-038, WEB-006, WEB-011 | DEC-21 |
| WEB-016 | [Wyświetlacz: WyswietlaczCentralny](web/WEB-016-tv-central.md) | 5 | L | todo | BE-042, WEB-001 | DEC-14 |
| WEB-017 | [WyswietlaczHala i wybór widoku](web/WEB-017-tv-hall.md) | 5 | M | todo | WEB-016 |  |
| WEB-018 | [Wyświetlacz: odporność i stany](web/WEB-018-tv-resilience.md) | 5 | M | todo | WEB-016 |  |
| WEB-019 | [tools/display-kiosk (Raspberry Pi)](web/WEB-019-display-kiosk.md) | 5 | M | todo | WEB-016 |  |
| WEB-020 | [PanelPulpit](web/WEB-020-web-pulpit.md) | 6 | M | todo | BE-045, WEB-015, WEB-010 |  |
| WEB-021 | [Rutyna obsługi w panelu i na TV](web/WEB-021-web-tv-routine.md) | 6 | M | todo | BE-044, BE-045, WEB-011, WEB-016 |  |
| WEB-022 | [Ustawienia ogólne i słowniki](web/WEB-022-web-general-settings.md) | 6 | M | todo | BE-030, BE-043, WEB-014, WEB-009 | DEC-20 |
| WEB-023 | [Zadania w panelu i na TV](web/WEB-023-web-tasks.md) | 7 | S | todo | BE-050, WEB-004, WEB-016, WEB-020 | DEC-27 |
| WEB-029 | [Słowniki: zakładka Ujeżdżalnie](web/WEB-029-web-arenas.md) | 7 | S | todo | BE-048, WEB-022 | DEC-17 |
| WEB-024 | [PanelPlatnosci](web/WEB-024-web-billing.md) | 8 | M | todo | BE-052, WEB-004, WEB-020 | DEC-12 |
| WEB-025 | [Stajnia zawieszona w panelu i na TV](web/WEB-025-web-suspended.md) | 8 | S | todo | BE-054, WEB-018, WEB-024 |  |
| WEB-026 | [PanelOps (admin globalny)](web/WEB-026-web-ops.md) | 9 | L | todo | BE-026, BE-036, WEB-004 | DEC-10, DEC-07 |
| WEB-027 | [Historia zmian obiektu](web/WEB-027-web-history.md) | 9 | S | todo | BE-055, WEB-011, WEB-012, WEB-013, WEB-014 | DEC-24 |
| WEB-028 | [E2E panelu i TV w trzech przeglądarkach](web/WEB-028-web-e2e.md) | 9 | M | todo | WEB-012, WEB-013, WEB-018, WEB-021, WEB-022, WEB-023, WEB-024, WEB-025, SH-002 |  |

## Aplikacja mobilna (MOB, 25)

| ID | Zadanie | Etap | Rozmiar | Status | Zależności | Decyzje |
|---|---|--:|---|---|---|---|
| MOB-001 | [Szkielet apki mobilnej (Expo, katalog mobile/)](mobile/MOB-001-mob-skeleton.md) | 1 | M | todo | SH-004 | DEC-02, DEC-22 |
| MOB-002 | [Sesja apki i klient API (tokeny, ciche odświeżanie, GET /me)](mobile/MOB-002-mob-session.md) | 1 | M | todo | BE-019, MOB-001 | DEC-06 |
| MOB-003 | [Logowanie hasłem i krok MFA w apce](mobile/MOB-003-mob-login.md) | 1 | M | todo | MOB-002 |  |
| MOB-004 | [Rejestracja z potwierdzeniem kodem i reset hasła w apce](mobile/MOB-004-mob-signup-reset.md) | 1 | M | todo | BE-018, MOB-003 | DEC-27 |
| MOB-005 | [Start po zalogowaniu, nawigacja ról i przełącznik stajni](mobile/MOB-005-mob-start-nav.md) | 1 | M | todo | MOB-003 | DEC-15, DEC-16, DEC-23, DEC-27 |
| MOB-006 | [Profil i ProfilAdmin (język, kanał kodu, hasło, kontakt, wylogowanie, usunięcie konta)](mobile/MOB-006-mob-profile.md) | 1 | M | todo | BE-020, BE-023, MOB-005 | DEC-15 |
| MOB-007 | [Konfiguracja wybranej stajni, odpytywanie z ETag i etykiety boksów](mobile/MOB-007-mob-features-polling.md) | 2 | M | todo | BE-030, MOB-005 | DEC-27 |
| MOB-008 | [Kolejka zapisów offline w apce](mobile/MOB-008-mob-write-queue.md) | 2 | M | todo | MOB-007 | DEC-18, DEC-27 |
| MOB-009 | [BoksyAdmin i BoksSzczegoly w apce admina](mobile/MOB-009-mob-boxes-admin.md) | 2 | M | todo | BE-022, BE-024, BE-031, BE-033, MOB-007 |  |
| MOB-010 | [Admin w apce: zaproszenie osoby i przeniesienie konia](mobile/MOB-010-mob-invite-move.md) | 2 | M | todo | BE-022, BE-032, MOB-009 |  |
| MOB-011 | [LudzieAdmin w apce](mobile/MOB-011-mob-people.md) | 2 | S | todo | BE-022, BE-023, BE-024, MOB-005, MOB-010 | DEC-15 |
| MOB-012 | [Klient: Moje konie (Main, MainLuna, MainBrzozowa) i karta konia z flagami](mobile/MOB-012-mob-client-main.md) | 3 | M | todo | BE-038, MOB-007 |  |
| MOB-013 | [SzybkaFlaga (nowa flaga klienta z podpowiedzianymi godzinami)](mobile/MOB-013-mob-quick-flag.md) | 3 | M | todo | BE-034, BE-062, MOB-012 | DEC-21 |
| MOB-014 | [StatusFlagi, zmiana i odwołanie flagi, KlientFlagi](mobile/MOB-014-mob-flag-status.md) | 3 | M | todo | MOB-013 |  |
| MOB-015 | [Obsługa: konie, flaga w imieniu klienta i potwierdzanie flag](mobile/MOB-015-mob-staff-flags.md) | 3 | M | todo | BE-024, MOB-008, MOB-013 |  |
| MOB-016 | [ListaDnia obsługi (szybkie akcje, „Boks gotowy”, wymaga potwierdzenia)](mobile/MOB-016-mob-day-list.md) | 6 | L | todo | BE-044, BE-045, MOB-008, MOB-015 | DEC-18 |
| MOB-017 | [Klient: MojBoks (Ostatnio i Historia) i skrót z przycisków na Main](mobile/MOB-017-mob-my-box.md) | 6 | M | todo | BE-045, MOB-012 |  |
| MOB-018 | [KartaKonia (plan karmienia, Dziś, historia) dla klienta, obsługi i admina](mobile/MOB-018-mob-horse-card.md) | 6 | M | todo | BE-043, BE-045, MOB-012 |  |
| MOB-019 | [EdycjaPlanuKonia (plan karmienia i padoku)](mobile/MOB-019-mob-plan-edit.md) | 6 | M | todo | MOB-018 |  |
| MOB-020 | [AdminDzis, BoksSzczegoly z historią i „Woda”, rutyna w BoksyAdmin](mobile/MOB-020-mob-admin-today.md) | 6 | M | todo | BE-044, BE-045, MOB-008, MOB-009, MOB-010, MOB-016 | DEC-15, DEC-16, DEC-18 |
| MOB-021 | [Zadania (StajennyZadania, AdminZadania, AdminZadaniaNowe)](mobile/MOB-021-mob-tasks.md) | 7 | M | todo | BE-050, MOB-016 |  |
| MOB-022 | [InstruktorJazdy, jazdy i wizyty w karcie konia](mobile/MOB-022-mob-rides-health.md) | 7 | M | todo | BE-047, BE-048, MOB-018 | DEC-17 |
| MOB-023 | [Stajnia zawieszona, klient bez konia i „Zaktualizuj aplikację”](mobile/MOB-023-mob-suspended.md) | 8 | S | todo | BE-054, BE-061, BE-062, MOB-012 | DEC-23 |
| MOB-024 | [E2E apki na pełnym stosie (Maestro na Androidzie, Detox na iOS)](mobile/MOB-024-mob-e2e.md) | 9 | M | todo | MOB-004, MOB-006, MOB-011, MOB-014, MOB-016, MOB-017, MOB-019, MOB-020, MOB-021, MOB-022, MOB-023 |  |
| MOB-025 | [Publikacja apki (TestFlight, testy wewnętrzne Google Play, konto demo dla recenzentów)](mobile/MOB-025-mob-store.md) | 9 | M | todo | MOB-024, WEB-008 | DEC-19, DEC-22 |

## Tablet e-ink przy boksie (TAB, 21)

| ID | Zadanie | Etap | Rozmiar | Status | Zależności | Decyzje |
|---|---|--:|---|---|---|---|
| TAB-001 | [Szkielet apki tabletu (Expo, katalog tablet/)](tablet/TAB-001-tab-skeleton.md) | 0 | M | todo | SH-004 | DEC-02, DEC-22 |
| TAB-002 | [Moduł kiosku cz. 1: Device Owner, Lock Task, HOME, autostart](tablet/TAB-002-tab-kiosk-1.md) | 0 | L | todo | TAB-001 |  |
| TAB-003 | [Moduł kiosku cz. 2: blokada OTA, Wi-Fi przez DPC, limit ładowania, watchdog](tablet/TAB-003-tab-kiosk-2.md) | 0 | M | todo | TAB-002 |  |
| TAB-004 | [Cicha instalacja APK jako Device Owner](tablet/TAB-004-tab-silent-install.md) | 0 | M | todo | TAB-002 |  |
| TAB-005 | [epdRefresh: odświeżanie e-ink w czterech implementacjach](tablet/TAB-005-tab-epd.md) | 0 | L | todo | TAB-001 |  |
| TAB-006 | [tools/provision-tablet (provisioning przez ADB)](tablet/TAB-006-tab-provision.md) | 0 | M | todo | TAB-002 |  |
| TAB-007 | [Bramka sprzętowa B: prototyp tablicy, skrypty pomiarowe i raport](tablet/TAB-007-tab-gate-b.md) | 0 | M | todo | TAB-003, TAB-004, TAB-005, TAB-006 |  |
| TAB-008 | [Komponenty e-ink i testy zrzutów w obu profilach palety](tablet/TAB-008-tab-eink-ui.md) | 4 | M | todo | TAB-001, TAB-005 |  |
| TAB-009 | [Logowanie i sesja tabletu (konto techniczne, hasło i kod MFA)](tablet/TAB-009-tab-session.md) | 4 | L | todo | BE-018, BE-019, TAB-002, TAB-008 | DEC-06, DEC-27 |
| TAB-010 | [Wybór boksu: TabletPierwszyBoks, TabletZmianaBoksu, TabletBoksNiedostepny](tablet/TAB-010-tab-box-select.md) | 4 | M | todo | BE-041, TAB-009 |  |
| TAB-011 | [TabletBoks: tablica boksu (flagi, karmienie, ostatnie akcje)](tablet/TAB-011-tab-board.md) | 4 | L | todo | TAB-010 |  |
| TAB-012 | [Odpytywanie tablicy i stany ekranu (offline, nieaktualne, zawieszona, aktualizacja)](tablet/TAB-012-tab-polling.md) | 4 | M | todo | TAB-011 | DEC-13 |
| TAB-013 | [Kolejka zapisów tabletu w SQLite](tablet/TAB-013-tab-write-queue.md) | 4 | M | todo | BE-034, TAB-009 | DEC-13 |
| TAB-014 | [TabletPopup: nowa flaga do potwierdzenia i POTWIERDZAM](tablet/TAB-014-tab-popup.md) | 4 | M | todo | TAB-012, TAB-013 |  |
| TAB-015 | [Blokada ekranu na czas mycia (TabletEkranZablokowany)](tablet/TAB-015-tab-screen-lock.md) | 4 | M | todo | TAB-014 | DEC-18 |
| TAB-016 | [Ukryte ustawienia tabletu (konto, boks, język, sieć, diagnostyka, ekran)](tablet/TAB-016-tab-hidden-settings.md) | 4 | M | todo | TAB-003, TAB-011 | DEC-18 |
| TAB-017 | [Aktualizacje APK w aplikacji tabletu (bez dotykania urządzenia)](tablet/TAB-017-tab-updates.md) | 4 | M | todo | BE-040, TAB-004, TAB-012, TAB-013 |  |
| TAB-018 | [SZYBKIE AKCJE na tablecie: BOKS GOTOWY, posiłek, PADOK, WODA, Cofnij](tablet/TAB-018-tab-quick-actions.md) | 6 | M | todo | BE-044, BE-045, TAB-011, TAB-013 | DEC-18 |
| TAB-019 | [Testy tabletu na emulatorze i skrypty dla sztuk z ADB](tablet/TAB-019-tab-emulator-tests.md) | 9 | M | todo | SH-002, TAB-015, TAB-016, TAB-018 |  |
| TAB-020 | [Diagnostyka tabletu z buforem offline (TabletDiagnostyka)](tablet/TAB-020-tab-diagnostics.md) | 9 | S | todo | TAB-016 | DEC-25 |
| TAB-021 | [Narzędzia do testów ciągłych tabletu (T-11, T-14, T-17)](tablet/TAB-021-tab-soak-tools.md) | 9 | S | todo | TAB-019, TAB-020 |  |

## Wspólne: docs, środowisko, CI, akceptacja (SH, 6)

| ID | Zadanie | Etap | Rozmiar | Status | Zależności | Decyzje |
|---|---|--:|---|---|---|---|
| SH-001 | [Docs zgodne z decyzjami i kodem](shared/SH-001-docs-decyzje.md) | 0 | M | todo |  | DEC-01, DEC-02, DEC-05, DEC-10 |
| SH-002 | [Środowisko lokalne cz. 2: broker, S3, Mailpit, fake-sms, proxy z LAN, setup](shared/SH-002-local-env-2.md) | 0 | M | todo | BE-001 | DEC-01 |
| SH-003 | [CI dla wszystkich pakietów (kroki niezależne od systemu CI)](shared/SH-003-ci.md) | 0 | M | todo |  | DEC-02 |
| SH-004 | [Generowanie typów API i tokenów palety dla frontend, mobile i tablet](shared/SH-004-gen-api-theme.md) | 0 | S | todo |  | DEC-02 |
| SH-005 | [Scenariusze akceptacyjne A-01…A-25 w jednym harnessie](shared/SH-005-acceptance.md) | 9 | M | todo | BE-057, MOB-024, TAB-019, WEB-028 |  |
| SH-006 | [Runbooki i kryteria gotowości pilotażu](shared/SH-006-runbooks.md) | 9 | S | todo | BE-058 | DEC-05, DEC-10 |

## Decyzje właściciela (27)

| DEC | Temat | Status | Blokuje start | Zadań, których dotyczy |
|---|---|---|---|--:|
| DEC-01 | [Kolejki zdarzeń i kodów: SNS/SQS czy self-hosted](decisions.md#dec-01--kolejki-zdarzeń-i-kodów-snssqs-czy-self-hosted) | otwarta |  | 11 |
| DEC-02 | [Położenie kodu apki mobilnej i tabletu](decisions.md#dec-02--położenie-kodu-apki-mobilnej-i-tabletu) | otwarta |  | 5 |
| DEC-03 | [Macierz widoczności w tokenie](decisions.md#dec-03--macierz-widoczności-w-tokenie) | otwarta |  | 12 |
| DEC-04 | [businesses w auth czy w stables](decisions.md#dec-04--businesses-w-auth-czy-w-stables) | otwarta |  | 3 |
| DEC-05 | [Klucz podpisu jako sekret: rotacja i signing_keys](decisions.md#dec-05--klucz-podpisu-jako-sekret-rotacja-i-signing_keys) | otwarta |  | 6 |
| DEC-06 | [Okna refresh tokenu i DPoP](decisions.md#dec-06--okna-refresh-tokenu-i-dpop) | otwarta |  | 3 |
| DEC-07 | [Domeny panelu, API i [OPS]](decisions.md#dec-07--domeny-panelu-api-i-ops) | otwarta |  | 3 |
| DEC-08 | [ZITADEL: uwierzytelnienie auth i wartości polityk](decisions.md#dec-08--zitadel-uwierzytelnienie-auth-i-wartości-polityk) | otwarta |  | 4 |
| DEC-09 | [Warstwa bazy i migracje na PoC](decisions.md#dec-09--warstwa-bazy-i-migracje-na-poc) | otwarta |  | 2 |
| DEC-10 | [Panel zespołu [OPS], opctl i Wsparcie IT](decisions.md#dec-10--panel-zespołu-ops-opctl-i-wsparcie-it) | otwarta | BE-056 | 14 |
| DEC-11 | [Dostawcy SMS i e-maila](decisions.md#dec-11--dostawcy-sms-i-e-maila) | otwarta | BE-059 | 3 |
| DEC-12 | [Zakres billingu na PoC](decisions.md#dec-12--zakres-billingu-na-poc) | otwarta | BE-052 | 4 |
| DEC-13 | [Tablet offline i interwał odpytywania](decisions.md#dec-13--tablet-offline-i-interwał-odpytywania) | otwarta |  | 4 |
| DEC-14 | [Plan dnia na TV](decisions.md#dec-14--plan-dnia-na-tv) | otwarta |  | 3 |
| DEC-15 | [Nawigacja apki i panelu dla ról](decisions.md#dec-15--nawigacja-apki-i-panelu-dla-ról) | otwarta |  | 9 |
| DEC-16 | [Dzwonek i powiadomienia push w apce](decisions.md#dec-16--dzwonek-i-powiadomienia-push-w-apce) | otwarta |  | 3 |
| DEC-17 | [Jazdy: kto tworzy](decisions.md#dec-17--jazdy-kto-tworzy) | otwarta |  | 3 |
| DEC-18 | [Czasy „Cofnij” i blokady, ukryte ustawienia, Wi-Fi](decisions.md#dec-18--czasy-cofnij-i-blokady-ukryte-ustawienia-wi-fi) | otwarta |  | 8 |
| DEC-19 | [Kod MFA dla recenzentów sklepów](decisions.md#dec-19--kod-mfa-dla-recenzentów-sklepów) | otwarta | MOB-025 | 1 |
| DEC-20 | [Domyślne wartości nowej stajni i reguły health_due/payment_overdue](decisions.md#dec-20--domyślne-wartości-nowej-stajni-i-reguły-health_duepayment_overdue) | otwarta |  | 10 |
| DEC-21 | [Wyłączony szablon przy trwającej fladze](decisions.md#dec-21--wyłączony-szablon-przy-trwającej-fladze) | otwarta |  | 5 |
| DEC-22 | [Identyfikatory aplikacji](decisions.md#dec-22--identyfikatory-aplikacji) | otwarta | MOB-025 | 3 |
| DEC-23 | [Klient bez ważnego konia](decisions.md#dec-23--klient-bez-ważnego-konia) | otwarta |  | 4 |
| DEC-24 | [Okresy retencji](decisions.md#dec-24--okresy-retencji) | otwarta |  | 3 |
| DEC-25 | [Diagnostyka tabletu](decisions.md#dec-25--diagnostyka-tabletu) | otwarta |  | 1 |
| DEC-26 | [Autor akcji z tabletu w audycie](decisions.md#dec-26--autor-akcji-z-tabletu-w-audycie) | otwarta |  | 3 |
| DEC-27 | [Drobne wartości i zachowania z zadań (zbiorczo)](decisions.md#dec-27--drobne-wartości-i-zachowania-z-zadań-zbiorczo) | otwarta |  | 18 |
