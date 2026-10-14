---
id: WEB-030
title: "E2E pełnego stosu: płatności i zawieszenie przez billing"
area: web
stage: 9
size: S
status: todo
depends_on: [WEB-024, WEB-028, BE-065]
decisions: [DEC-12, DEC-27]
owner:
branch:
trello:
---
# WEB-030 · E2E pełnego stosu: płatności i zawieszenie przez billing

## Cel
Ścieżki płatności przechodzą automatycznie na pełnym stosie: podwójny webhook daje jedną płatność, a brak płatności po windykacji zawiesza stajnię w panelu i na TV. Wydzielone z WEB-028, żeby E2E panelu nie czekało na decyzję o billingu (DEC-12).

## Kontekst
- **Stan kodu:** pełny stos Playwright `frontend/playwright.full.config.ts`, `npm run e2e:full`, helpery kodów i reset danych (WEB-028; lista serwisów w `E2E_SERVICES`); ekran Płatności i baner `past_due` (WEB-024); stan zawieszenia w panelu i na TV (WEB-025); `billing` z fałszywymi adapterami i `dev:webhook` (BE-052), crony `billing-dunning` i pozostałe (BE-053, `npm run cron <nazwa> -- --now` z BE-009), konsument `subscription.status_changed` → `stables.status` (BE-065).
- **Dokumenty:** docs/development-szczegoly.md 4.1 „Panel web” (płatności: podwójny webhook daje jedną płatność, brak płatności daje `suspended`), 3.6 „Etap 8”.
- **Makiety:** PanelPlatnosci (docs/makiety-plan.md B), WyswietlaczZablokowany (F), PanelPulpit (baner).
- **Decyzje:** DEC-12 A (fałszywe adaptery, subskrypcja per stajnia). Przy B zadanie odpada razem z billingiem.
- **Dane demo:** Pod Lipami z subskrypcją i fakturami z seedu BE-052; seed ze stałą datą wt 13.10.2026 07:15.

## Zakres
- [ ] `frontend/e2e/full/billing.spec.ts` (projekty `chromium` i `tv-chromium`, `E2E_SERVICES` z `billing`):
  - podwójny webhook (`npm --prefix ../backend run dev:webhook` dwa razy z tym samym zdarzeniem) daje jedną płatność w PanelPlatnosci i jeden wiersz w API;
  - brak płatności + `npm run cron billing-dunning -- --now` (zegar przesunięty o 21 dni według DEC-27 b) → `past_due`, potem `suspended`: baner „Płatność po terminie”, potem „Stajnia zawieszona” w panelu i „System nieaktywny w tej stajni” na TV w ≤ 10 s;
  - opłacenie faktury przez `dev:webhook` → stajnia wraca do `active`, TV pokazuje tablicę.
- [ ] Wpis w `frontend/e2e/full/COVERAGE.md` (płatności) i w README frontendu.

## Poza zakresem
- Pozostałe scenariusze pełnego stosu (WEB-028); prawdziwy dostawca płatności i KSeF (po pilotażu).

## Kryteria akceptacji
- [ ] `npm run e2e:full -- billing.spec.ts` przechodzi dwa razy pod rząd na świeżym seedzie (bez ręcznego sprzątania).
- [ ] Asercje na tekstach z makiet i na skutkach w API (liczba płatności, stan subskrypcji, `stables.status`).

## Testy
- Playwright na pełnym stosie: `cd frontend && npm run e2e:full -- billing.spec.ts`.

## Definicja gotowości
- `npm run check` i `npm run build` we `frontend/` zielone; spec zielony lokalnie z Dockerem; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zegar serwerów przez `npm run clock` (SH-002) z restartem usług; w przeglądarce `page.clock` na ten sam moment.
