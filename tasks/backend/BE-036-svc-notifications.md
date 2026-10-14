---
id: BE-036
title: Serwis notifications (router)
area: backend
stage: 3
size: L
status: todo
depends_on: [BE-014, BE-025, BE-029]
decisions: [DEC-16, DEC-20, DEC-01]
owner:
branch:
trello:
---
# BE-036 · Serwis notifications (router)

## Cel
`notifications` zamienia zdarzenia domenowe (nowa flaga od klienta, niepotwierdzona flaga, zaproszenie, faktura, zaległa płatność, zmiana admina konta) w gotowe SMS-y i e-maile do właściwych osób, według reguł stajni, i prowadzi historię wysyłek. Sam niczego nie wysyła: wrzuca gotową wiadomość do kolejki serwisu `sms` albo `email` (W5).

## Kontekst
- **Stan kodu:** serwisu nie ma. Wzór serwisu: `backend/src/services/auth/` (`main.ts`, `app.ts`, `env.ts`, `deps.ts`, `routes/`), kit `backend/src/kit/service.ts` (porty wewnętrzne, trasy `external`/`internal`). Kolejki i konsumenci: `backend/src/lib/messaging` (BE-008: koperta, konsument z DLQ, kolejki FIFO `sms` i `email` z grupą `notifications.id` i deduplikacją `notifications.id` + `attempts`). Szablony treści PL/UA/EN i liczenie segmentów UCS-2: `backend/src/lib/i18n` (BE-014). Odbiorcy: `GET /auth/v1/internal/recipients?stableId=&businessId=&roles=&channel=&horseId=&feature=` na porcie `recipients` (BE-025). Reguły stajni `notification_rules` zapisuje `stables` (BE-029). Tabela `notifications`: BE-004; tabela prywatna (granty BE-003).
- **Dokumenty:** docs/mikroserwisy.md 5.8 (router, `dedupe_key`, konflikt z `pending`, sprawdzenie flagi przed wysyłką, trasy `deliveries` i `/platform`), 7.3 (zdarzenia i konsumenci), 1.5 (zdarzenie crona sprawdzane w bazie: `invoice.issued`, `payment.overdue` wymagają wiersza `invoices`), 4.3 (`business_admin.changed`: stała reguła); docs/development-szczegoly.md 3.3 `notifications`, `sms` i `email`; docs/erd.md tabela `notifications`, pkt 17, słownik `notification_rules.event`.
- **Makiety:** WiadomosciSms.dc.html (treści: zaproszenie klienta, „Flaga niepotwierdzona · do Damiana”, zaproszenie konta technicznego e-mailem), PanelPulpit.dc.html (baner „wysłano Ci SMS i e-mail”), PanelZaprosOsobe.dc.html (stan wysyłki zaproszenia), PanelZalozPowiadomienia.dc.html (zdarzenia × odbiorcy × kanał).
- **Decyzje:** DEC-16 A (bez dzwonka i push w apce: tylko SMS i e-mail). DEC-20 A (dodać `health_due` i `payment_overdue` do słownika reguł; obsługa `health.due` to BE-049). DEC-01 (broker za `lib/messaging`).
- **Dane demo:** Damian (admin konta, SMS i e-mail), Ola i Piotr (obsługa), zaproszenie Marka Nowaka (SMS, Luna), Bella z eskalacją `admin_notify` (seed: jeden wiersz `notifications` do Damiana o 01:21).

## Zakres
- [ ] Serwis `backend/src/services/notifications/` (`main.ts`, `app.ts`, `env.ts`), skrypty `start:notifications`, `dev:notifications` w `backend/package.json`; kontrakt `backend/src/contracts/notifications.ts` zarejestrowany w `backend/src/contracts/index.ts`; wywołanie `recipients` przez `backend/src/lib/internal-client/` z BE-029 (env `AUTH_RECIPIENTS_URL`, limit czasu, ponowienie; błąd = brak potwierdzenia wiadomości i ponowienie z brokera).
- [ ] Konsumenci (każdy idempotentny, potwierdza zdarzenie dopiero po wrzuceniu wiadomości do kolejki):
  - `flag.created` → reguła `flag_created_by_client`, `recipients` z `feature=flags`;
  - `flag.escalated` → reguła `flag_unacknowledged`; przed wysyłką sprawdza `horse_flags` (potwierdzona albo odwołana: wiersz `cancelled`);
  - `invitation.created` → wiadomość na adres z koperty, kanałem zaproszenia (`recipient_user_id = NULL`, `related_invitation_id`); `invitation.accepted` → reguła `invitation_accepted`; `invitation.expired` → reguła `invitation_expired`;
  - `user.deleted` → wiersze `pending` tego odbiorcy na `cancelled`;
  - `business_admin.changed` → stała reguła poza `notification_rules`: admini firmy (`recipients?businessId=`), SMS i e-mail, `stable_id = NULL`;
  - `invoice.issued` (`invoice_issued`), `payment.failed` (`payment_failed`), `payment.overdue` (`payment_overdue`): `invoice.issued` i `payment.overdue` tylko przy widocznym wierszu `invoices`, inaczej ponowienie, potem DLQ i alarm;
  - `sms.result`, `email.result` → `status`, `attempts`, `provider_message_id`, `sent_at`.
- [ ] Router: dla zdarzenia włączone wiersze `notification_rules` stajni → dla każdej pary (rola, kanał) `recipients` z `roles`, `channel`, `feature`; osoba bez adresu dla kanału jest pomijana; treść w języku odbiorcy z `lib/i18n` (e-mail z tematem); wiersz `notifications` (`pending`, `attempts = 0`) i wiadomość `{ id, to, subject?, body, notificationId, attempts }` do kolejki `sms.notifications` albo `email.notifications` (BE-008: grupa = `notifications.id`, `deduplicationId` = `notifications.id` + `attempts`).
- [ ] `dedupe_key` z klucza domenowego, np. `flag_created:{flagId}:{userId}:{channel}`, `flag_unacknowledged:{flagId}:{userId}:{channel}`, `invitation:{invitationId}:{channel}`, `invitation_accepted:{invitationId}:{userId}:{channel}`, `invitation_expired:{invitationId}:{userId}:{channel}`, `invoice_issued:{subscriptionId}:{periodStart}:{userId}:{channel}`, `payment_overdue:{invoiceId}:{etap}:{userId}:{channel}`; konflikt z wierszem `pending` wrzuca wiadomość ponownie, z innym statusem nic nie robi.
- [ ] DEC-20: słownik zdarzeń reguł (stała w `lib/rules`) ma już `health_due` i `payment_overdue` (BE-029); router obsługuje `payment_overdue`, a `health_due` dochodzi w BE-049. Gdy BE-029 tego nie zrobił, dopisać obie wartości tam, nie w `notifications`.
- [ ] Trasy: `GET /notifications/v1/stables/{stableId}/deliveries?flagId=&invitationId=` (admin; kanał, odbiorca jako `display_name`, status, `sentAt`, `attempts`, bez treści i bez adresu), `GET /notifications/v1/platform/notifications?stableId=&userId=&status=` i `POST /notifications/v1/platform/notifications/{id}/retry` (`plt = admin`; `attempts + 1`, ponowne wrzucenie, audyt).
- [ ] Seed: wiersz `notifications` dla eskalacji Belli (SMS do Damiana, `sent`, 01:21).

## Poza zakresem
- wysyłka przez dostawców (BE-016, BE-017, BE-059); kody logowania (idą z `auth` prosto do kolejek kodów, BE-015);
- konsument `health.due` i reguła `health_due` w routerze (BE-049); zdarzenia billingu publikują BE-052 i BE-053;
- dzwonek i push w apce (DEC-16: brak na PoC).

## Kryteria akceptacji
- [ ] A-02: eskalacja Belli daje dokładnie jeden wiersz na (Damian, kanał) z reguł stajni, także przy powtórzonym zdarzeniu i dwóch replikach; flaga potwierdzona przed wysyłką: `cancelled`.
- [ ] A-18: flagi Brzozowej nie dają żadnego powiadomienia.
- [ ] Zaproszenie Marka (SMS) ma treść jak na makiecie WiadomosciSms; zaproszenie e-mailem konta technicznego idzie na adres z koperty.
- [ ] `business_admin.changed` trafia SMS-em i e-mailem do obecnych adminów firmy; `user.deleted` anuluje `pending`.
- [ ] Rola bez funkcji `flags` w macierzy nie dostaje powiadomień o flagach.
- [ ] `deliveries`: admin stajni 200; obsługa 403; admin innej firmy 404. Kuba widzi `/platform/notifications` i ponawia wysyłkę.
- [ ] Rola bazy `notifications` jako jedyna czyta `recipient_address` i `body` (meta-test BE-003).

## Testy
- Jednostkowe: budowa `dedupe_key`, wybór odbiorców z reguł, render treści w PL/UA/EN.
- Integracyjne (Testcontainers PostgreSQL, adapter brokera w pamięci, atrapa `recipients` albo prawdziwy `auth` z BE-025): każdy konsument, duplikaty 2× i 10×, zamieniona kolejność zdarzeń, wiadomość trująca do DLQ, ponowienie po konflikcie `pending`.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/notifications.json` w repo; README backendu opisuje uruchomienie serwisu lokalnie.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- `recipients` to adresowanie, nie autoryzacja; `notifications` nie czyta tabel uprawnień ani `users.phone_e164` i `users.email`.
- Nie loguj treści wiadomości ani adresów (logger pino z redakcją z kit); w DTO tylko `display_name`.
- Nikt nie woła `notifications` synchronicznie: wszystko przychodzi zdarzeniami.
- Szablony treści tylko w `lib/i18n`, z testem kompletności tłumaczeń.
