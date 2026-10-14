---
id: BE-052
title: Serwis billing na fałszywych adapterach
area: backend
stage: 8
size: L
status: todo
depends_on: [BE-008, BE-029, BE-039]
decisions: [DEC-12]
owner:
branch:
trello:
---
# BE-052 · Serwis billing na fałszywych adapterach

## Cel
Każda stajnia ma konto rozliczeniowe i subskrypcję planu liczonego od boksów z koniem. Admin widzi w panelu subskrypcję, zużycie, faktury z PDF i może podpiąć metodę płatności. Na PoC dostawca płatności, system faktur i generator PDF są fałszywe, ale cały przepływ (webhook, płatność, nieudana płatność) działa.

## Kontekst
- **Stan kodu:** serwisu nie ma. Zakładanie stajni i `stable.created` z porami posiłków: BE-029. Zdarzenia i konsumenci: `backend/src/lib/messaging` (BE-008). Pliki (PDF, surowe body webhooka): `files /internal` i `backend/src/lib/files-client` (BE-039). Tabele `billing_accounts`, `billing_plans`, `billing_plan_prices`, `subscriptions`, `usage_snapshots`, `invoices`, `invoice_lines`, `payments`, `payment_provider_events`: BE-004. `billing` czyta `businesses` (NIP, nazwa, adres, e-mail do faktur), `stables`, `boxes`, `horses`. Trasy otwarte: `backend/open-routes.txt` i test w `backend/src/contracts/contracts.test.ts`.
- **Dokumenty:** docs/mikroserwisy.md 5.7 (tabela tras, webhook z podpisem, body przez `files`, konsumenci `stable.created` i `invoice.issued`), 1.3 (otwarta trasa webhooka), 1.5 (PDF tylko dla widocznego wiersza `invoices`); docs/development-szczegoly.md 3.3 `billing`, 2.11, 3.2 (fałszywe adaptery i `dev:webhook`); docs/erd.md tabele billingu, pkt 10, „Otwarte kwestie” pkt 3.
- **Makiety:** PanelPlatnosci.dc.html (subskrypcja „Aktywna”, plan „Stajnia”, okres 01.10–31.10.2026, „Boksy z koniem 12 × [CENA ZA BOKS]”, puste boksy i konie bez boksu niewliczane, dane do faktury, metoda płatności, faktury FV/2026/09/0147 itd.).
- **Decyzje:** DEC-12 A (fałszywe adaptery, subskrypcja per stajnia, 3 crony w BE-053; KSeF i prawdziwy dostawca po pilotażu).
- **Dane demo:** Damian (admin), Stajnia Pod Lipami (12 boksów z koniem), Brzozowa; kwoty testowe w groszach.

## Zakres
- [ ] Serwis `backend/src/services/billing/` (`main.ts`, `app.ts`, `env.ts`), skrypty `start:billing`, `dev:billing`, `dev:webhook` (ręczne wywołanie webhooka z podpisem); kontrakt `backend/src/contracts/billing.ts`.
- [ ] Trasy `billing` w macierzy izolacji z BE-057: meta-test wymaga każdej trasy z `{stableId}`, więc jeśli BE-057 jest już `done`, dopisz identyfikatory (`invoiceId`, `paymentId`) do mapy parametrów i obiekty drugiej firmy do danych testu.
- [ ] Lokalnie: port według tabeli „Porty serwisów” w tasks/README.md (wiersz w README.md „Porty”); usługa `billing` w `docker-compose.yml` (obraz backendu, `command: ['npm', 'run', 'start:billing']`, env jak w `backend/.env.example`, profil `infra`), trasa `/billing/*` w `tools/local/Caddyfile` już jest (SH-002).
- [ ] Adaptery z implementacją fałszywą (wybór przez env, fałszywe zabronione w `APP_ENV=prod`): `PaymentProvider` (sesja metody płatności, weryfikacja podpisu, mapowanie zdarzeń), `InvoiceSystem` (`external_ref`), `PdfRenderer` (prosty PDF faktury).
- [ ] Konsument `stable.created`: `billing_accounts` z kopią danych firmy (`legal_name`, `tax_id`, adres, `invoice_email`) i subskrypcja planu domyślnego (okres = miesiąc kalendarzowy w strefie stajni); idempotentnie (unikalne `billing_accounts.stable_id`).
- [ ] Trasy (`/billing/v1/stables/{stableId}`, tylko admin i `plt`): `GET …/subscription`, `PUT …/subscription/plan` (`If-Match`), `GET …/usage` (bieżące boksy z koniem i migawki), `GET`, `PATCH …/account` (e-mail do faktur i adres; NIP i nazwa z `businesses` bez edycji), `GET …/invoices`, `POST …/invoices/{id}/pdf-url`, `POST …/payment-method-session`.
- [ ] `POST /billing/v1/webhooks/{provider}` (trasa otwarta, wpis w `backend/open-routes.txt`, limit po IP): weryfikacja podpisu (bez podpisu 401), surowe body przez `files` (`ownerService = billing`), `payment_provider_events` (unikalne `provider_event_id`, `processed_at`), płatność udana → `payments` i `invoices.status = paid`, nieudana → `payment.failed`; powtórzony webhook nic nie dubluje.
- [ ] Konsument `invoice.issued`: PDF tylko dla widocznego wiersza `invoices` (inaczej ponowienie, potem DLQ), zapis przez `files`, `invoices.file_id`; po fakturze przesunięcie `subscriptions.current_period_*` na następny miesiąc (zapis właściciela, nie crona).
- [ ] `GET`, `PUT /billing/v1/platform/plans` (`plt = admin`, audyt).
- [ ] Zdarzenia `subscription.status_changed` (przy zmianie planu albo statusu przez serwis) i `payment.failed` w katalogu (BE-008).
- [ ] Seed: moduł w `backend/scripts/seed/` (BE-011, stałe UUID z `backend/src/lib/testing/demo.ts`): plan „Stajnia” z ceną za boks z koniem, konta i subskrypcje obu stajni, cztery faktury z makiety PanelPlatnosci (kwoty testowe).

## Poza zakresem
- crony zużycia, faktur i windykacji (BE-053); zawieszenie stajni (stan w `board`: BE-054, konsument zdarzenia subskrypcji: BE-065); ekran PanelPlatnosci (WEB-024); prawdziwy dostawca i KSeF (po DEC-12).

## Kryteria akceptacji
- [ ] Nowa stajnia dostaje konto rozliczeniowe z NIP z konta firmy i subskrypcję; drugie `stable.created` nic nie dubluje.
- [ ] A-04: przypisanie Luny do boksu podnosi bieżące zużycie o 1 (`GET …/usage`).
- [ ] Podwójny webhook daje jedną płatność; webhook z błędnym podpisem: 401, bez zapisu; body webhooka leży w magazynie, a `payment_provider_events.payload_file_id` na nie wskazuje.
- [ ] Obsługa, klient i konta techniczne: 403; admin innej firmy: 404; Kuba zmienia plany w `/platform/plans`.
- [ ] Kwoty wyłącznie w groszach (`bigint`), test zaokrągleń VAT.

## Testy
- Jednostkowe: wyliczanie kwot (netto, VAT, brutto), weryfikacja podpisu fałszywego dostawcy.
- Integracyjne (Testcontainers PostgreSQL i MinIO, adapter brokera w pamięci): kryteria wyżej, konsumenci 2× i 10×.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/billing.json` w repo, `backend/open-routes.txt` zaktualizowany, `npm run gen:api` we `frontend/`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- `billing` nie woła `notifications`: powiadomienia idą zdarzeniami.
- Sekrety dostawcy tylko z plików albo env; w repo nic.
- Metryka zużycia na koniec okresu albo maksimum w okresie to otwarta kwestia (docs/development-szczegoly.md 5 pkt 28): na PoC stan na koniec okresu, w konfiguracji.
