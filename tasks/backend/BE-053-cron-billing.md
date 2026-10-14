---
id: BE-053
title: Crony billingu
area: backend
stage: 8
size: M
status: todo
depends_on: [BE-009, BE-052, BE-036]
decisions: [DEC-12, DEC-20, DEC-27]
owner:
branch:
trello:
---
# BE-053 · Crony billingu

## Cel
Rozliczenia dzieją się same: na koniec okresu zapisuje się zużycie (boksy z koniem), 1. dnia miesiąca powstaje faktura, a niezapłacona faktura przechodzi przez przypomnienia, potem `past_due` i w końcu zawieszenie stajni. Trzy crony piszą wprost do bazy kodem domeny `billing` i ogłaszają skutki zdarzeniami.

## Kontekst
- **Stan kodu:** serwis `billing` z domeną, adapterami i konsumentem `invoice.issued` (PDF): BE-052 (`backend/src/services/billing/`). Szablon crona: BE-009 (`backend/src/jobs/<cron>/`, `publishBeforeCommit`, `pg_try_advisory_xact_lock`, `--now`). Router powiadomień z regułami `invoice_issued`, `payment_overdue` (DEC-20): BE-036. Konsument `subscription.status_changed` w `stables`: BE-065 (stan w `board`: BE-054). Manifest zapisu: BE-003.
- **Dokumenty:** docs/mikroserwisy.md 6 (`billing-usage-snapshot`, `billing-invoicing`, `billing-dunning`: co czytają, co piszą, co publikują), 1.5 (konsument zdarzenia crona sprawdza bazę: `invoices`, `subscriptions.status`); docs/development-szczegoly.md 3.4 (te trzy crony, numer faktury bez sekwencji, ponowienie zdarzenia przy rozjeździe statusów), 4.1 „Crony” (nieudany COMMIT po publikacji nie daje drugiej wiadomości, PDF-u ani zawieszenia; ręczny przebieg w trakcie fakturowania nie daje drugiej faktury); docs/erd.md tabele `usage_snapshots`, `invoices`, `invoice_lines`, `subscriptions`, manifest cronów.
- **Makiety:** PanelPlatnosci.dc.html (statusy „Do zapłaty”, „Opłacona”, „Po terminie”, „Faktura za okres wystawiana 1. dnia kolejnego miesiąca”).
- **Decyzje:** DEC-12 A (fałszywe adaptery, subskrypcja per stajnia, 3 crony). DEC-20 A (`payment_overdue` do admina).
- **Dane demo:** subskrypcje obu stajni z BE-052; Pod Lipami 12 boksów z koniem; faktura FV/2026/09/0147 „Do zapłaty” z terminem 15.10.2026.

## Zakres
- [ ] `backend/src/jobs/billing-usage-snapshot/`: subskrypcje, których okres się skończył, a nie mają migawki; `usage_snapshots` (`metric = boxes_with_horse`, ilość = boksy z koniem na koniec okresu, propozycja z BE-052) z `ON CONFLICT (subscription_id, period_start, metric) DO NOTHING`; bez zdarzeń.
- [ ] `backend/src/jobs/billing-invoicing/` (1. dnia miesiąca w strefie stajni): dla subskrypcji z migawką poprzedniego okresu i bez faktury: `invoices` (`INSERT … ON CONFLICT DO NOTHING` na unikalności subskrypcja + okres poza `void`), `invoice_lines` z cen planu, kwoty w groszach z VAT, numer `FV/RRRR/MM/NNNN` liczony w kodzie pod blokadą doradczą (unikalne `invoices.number`, przy konflikcie ponowienie), `status = issued`, `due_at` = wystawienie + 14 dni (konfiguracja); jedna transakcja na fakturę, `publishBeforeCommit` `invoice.issued`.
- [ ] `backend/src/jobs/billing-dunning/` (codziennie): faktury `issued` po `due_at` bez płatności → `overdue` i `payment.overdue` z etapem; subskrypcja `past_due` po 7 dniach od terminu, `suspended` po 21 dniach (wartości w konfiguracji, propozycja do potwierdzenia z Dawidem) z `subscription.status_changed`; przy rozjeździe `subscriptions.status` i `stables.status` ponowna publikacja; jedna transakcja na fakturę albo subskrypcję.
- [ ] Wszystkie zapisy przez funkcje domeny `billing` z `version`, `updated_at` i audytem `actor_type = system`; wpisy cronów w manifeście `owners.ts` zgodne z docs/erd.md (snapshot: `usage_snapshots`; invoicing: `invoices`, `invoice_lines`; dunning: `invoices.status`, `subscriptions.status`).
- [ ] Skrypty `start:cron:billing-usage-snapshot`, `start:cron:billing-invoicing`, `start:cron:billing-dunning`; wpisy w rejestrze `backend/src/jobs/index.ts` (harmonogramy, `timeZone` Europe/Warsaw).

## Poza zakresem
- zmiana `stables.status` (konsument zdarzenia: BE-065) i stan „zawieszona” w `board` (BE-054); treść powiadomień o fakturze i zaległości (BE-036); KSeF i prawdziwy dostawca (po DEC-12).

## Kryteria akceptacji
- [ ] Przebieg fakturowania 01.11.2026 tworzy po jednej fakturze na subskrypcję; powtórzony, równoległy i ręczny w trakcie przebieg nie daje drugiej faktury ani drugiego numeru.
- [ ] Nieudany COMMIT po publikacji `invoice.issued`: brak PDF-u i powiadomienia o nieistniejącej fakturze, a następny przebieg wystawia fakturę i jedno powiadomienie (`dedupe_key` w BE-036).
- [ ] Nieudana publikacja wycofuje transakcję.
- [ ] Brak płatności po terminie daje kolejno `overdue` z `payment.overdue`, `past_due`, `suspended` z `subscription.status_changed`; przy nieudanym COMMIT po publikacji stajnia nie zostaje zawieszona (konsument czyta `subscriptions.status`).
- [ ] Rola bazy każdego crona pisze tylko swoje tabele i kolumny (meta-test BE-003).

## Testy
- Integracyjne (Testcontainers PostgreSQL, adapter brokera w pamięci, fałszywy zegar, `notifications` w procesie testu): cztery przypadki szablonu crona dla każdego z trzech, scenariusze kryteriów.
- Uruchomienie: `cd backend && npm run check`; lokalnie np. `npm run cron -- billing-invoicing --now=2026-11-01T06:00:00Z`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Zmiana zależności względem pierwotnej listy: dodane BE-036, bo kryteria sprawdzają, że powtórzona publikacja nie daje drugiego powiadomienia.
- Bez sekwencji w bazie (zakaz): numer faktury liczy kod.
- Crony nie wołają serwisów i nie mają tokenów (W3); przesunięcie okresu subskrypcji robi serwis `billing` w konsumencie `invoice.issued` (BE-052), nie cron.
<!-- dep-ok: BE-054 (stan zawieszenia w board; konsument zdarzenia to BE-065, które zależy od tego zadania) -->
