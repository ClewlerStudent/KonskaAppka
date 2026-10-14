---
id: WEB-024
title: PanelPlatnosci
area: web
stage: 8
size: M
status: todo
depends_on: [BE-052, WEB-004, WEB-020]
decisions: [DEC-12]
owner:
branch:
trello: https://trello.com/c/oC8B9NnO
---
# WEB-024 · PanelPlatnosci

## Cel
Admin konta widzi subskrypcję stajni (plan, okres, następna faktura), zużycie w bieżącym okresie (boksy z koniem), dane do faktury, metodę płatności i listę faktur z PDF. Na PoC wszystko działa na fałszywych adapterach płatności i faktur.

## Kontekst
- **Stan kodu:** zaślepka `/stables/$stableId/billing` (WEB-004), `DataTable`, `StatCard`, `useEditable`, `SidePanel`; PanelPulpit (WEB-020) z miejscem na kafel subskrypcji.
- **Dokumenty:** docs/mikroserwisy.md 5.7 (tylko admin; NIP i nazwa z `businesses` bez edycji; PDF przez `files`). BE-052: `GET /billing/v1/stables/{stableId}/subscription`, `PUT …/subscription/plan` (`If-Match`), `GET …/usage` (boksy z koniem, migawki), `GET`/`PATCH …/account` (e-mail do faktur i adres), `GET …/invoices`, `POST …/invoices/{id}/pdf-url`, `POST …/payment-method-session`; kwoty w groszach; fałszywe adaptery `PaymentProvider`, `InvoiceSystem`, `PdfRenderer`. docs/development-szczegoly.md 5 pkt 47 (bez rozbudowy na PoC).
- **Makiety:** docs/mockups/project/PanelPlatnosci.dc.html: H1 „Płatności”, „Konto rozliczeniowe: Stajnia Pod Lipami · stan na wt 13.10.2026”; „Subskrypcja · Aktywna · Plan Stajnia · Okres rozliczeniowy 01.10–31.10.2026 · Następna faktura 01.11.2026 · Zmień plan”; „Zużycie w tym okresie · 01.10–13.10.2026 · Boksy z koniem 12 × [CENA ZA BOKS] · Szacunkowo za okres: [KWOTA] · Zobacz boksy”; „Dane do faktury · Edytuj · Nazwa firmy · NIP · Adres · E-mail do faktur”; „Metoda płatności · [DOSTAWCA PŁATNOŚCI] · Automatyczne pobranie w dniu terminu faktury · Zmień · Następne pobranie · Ostatnia płatność”; „Faktury”: kolumny „Numer | Okres | Kwota brutto | Status | Termin | PDF”, wiersze „FV/2026/09/0147 · Do zapłaty · 15.10.2026 · Pobierz”, „Opłacona”, „Po terminie · wpłata do wyjaśnienia”. PanelPulpit.dc.html: kafel „Subskrypcja · Aktywna · Płatności · Plan Stajnia · następna faktura 01.11.2026”.
- **Decyzje:** DEC-12 A (fałszywe adaptery, subskrypcja per stajnia).
- **Dane demo:** plan „Stajnia”, subskrypcje obu stajni, cztery faktury z makiety (kwoty testowe z seedu BE-052).

## Zakres
- [ ] `web/src/features/billing/BillingScreen.tsx` na `/stables/$stableId/billing`: karty „Subskrypcja” (status: Aktywna, Po terminie, Zawieszona), „Zużycie” (liczba boksów z koniem, cena za boks, szacunek; „Zobacz boksy” → PanelBoksy), „Dane do faktury” (nazwa i NIP z konta firmy tylko do odczytu; „Edytuj” w `SidePanel`: adres i e-mail do faktur → `PATCH …/account` z `If-Match`), „Metoda płatności” („Zmień” → `POST …/payment-method-session` → przejście na adres sesji zwrócony przez adapter; po powrocie odświeżenie), „Faktury” (tabela; „Pobierz” → `POST …/invoices/{id}/pdf-url` → otwarcie adresu w nowej karcie).
- [ ] Kwoty z groszy formatowane `Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })`; daty w strefie stajni; status faktury jako plakietka (Do zapłaty — uwaga, Opłacona — OK, Po terminie — krytyczna).
- [ ] Kafel „Subskrypcja” na PanelPulpit (WEB-020): status, plan, następna faktura, link „Płatności”.
- [ ] Baner „uwaga” „Płatność po terminie” z „Płatności” w `AdminLayout`, gdy subskrypcja ma `past_due` (odczyt przy wejściu na pulpit); przeniesione z WEB-025.
- [ ] Brak konta rozliczeniowego (stajnia świeżo założona, zdarzenie jeszcze nie dotarło): „Konto rozliczeniowe jest w przygotowaniu.” i ponowienie przy następnym wejściu.

## Poza zakresem
- „Zmień plan” i pełna zmiana planu (P3 PanelPlatnosciZmiana; przycisk ukryty); prawdziwy dostawca płatności i KSeF (po pilotażu); banery zawieszenia (WEB-025); plany dla zespołu EQUENOR (`/platform/plans`, opctl BE-056).

## Kryteria akceptacji
- [ ] Pod Lipami: subskrypcja „Aktywna · Stajnia · 01.10–31.10.2026”, zużycie 12 boksów z koniem, cztery faktury ze statusami jak na makiecie; NIP 123-456-32-18 bez możliwości edycji.
- [ ] Subskrypcja `past_due` (fixture atrapy) daje w panelu baner „Płatność po terminie” z przejściem do Płatności.
- [ ] „Pobierz” otwiera PDF faktury z fałszywego adaptera (presigned URL z MinIO w pełnym stosie).
- [ ] „Zmień” metodę płatności przechodzi na stronę fałszywego dostawcy i z powrotem.
- [ ] Obsługa i klient nie mają ekranu (WEB-004), API 403.
- [ ] 1440 i 390 px bez poziomego przewijania.

## Testy
- Vitest: formatowanie kwot w groszach, mapowanie statusów, formularz danych do faktury (412).
- Playwright na atrapie: ekran Pod Lipami, „Pobierz” (sprawdzenie wywołania i otwarcia karty), kafel na pulpicie. Podwójny webhook i zawieszenie przez billing na pełnym stosie: WEB-030.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-052; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- CSP panelu: przejście na stronę dostawcy to nawigacja (nie `connect-src`); otwarcie PDF przez `window.open` z `noopener`.
- Zdania objaśniające z makiety („Liczymy tylko boksy, w których stoi koń…”) pomijamy (docs/makiety-plan.md 2.3 i 5 pkt 38).
- Zmiana zależności względem listy: dodane WEB-020 (kafel „Subskrypcja” na pulpicie).
