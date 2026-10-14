---
id: BE-065
title: "stables: zawieszenie stajni ze zdarzenia subskrypcji"
area: backend
stage: 8
size: S
status: todo
depends_on: [BE-053, BE-054]
decisions: [DEC-12]
owner:
branch:
trello: https://trello.com/c/nvlXSyKq
---
# BE-065 · stables: zawieszenie stajni ze zdarzenia subskrypcji

## Cel
Gdy subskrypcja stajni zostanie zawieszona za brak płatności, stajnia sama przechodzi w stan „zawieszona” (stan w `board` z BE-054), a po opłaceniu wraca do aktywnej bez ręcznych kroków.

## Kontekst
- **Stan kodu:** `subscription.status_changed` publikują `billing` (BE-052) i cron `billing-dunning` (BE-053); katalog zdarzeń i konsumenci z adapterem w pamięci: `lib/messaging` (BE-008). Stan `suspended` w `board` liczony ze `stables.status` i skrypt `npm run stable:status`: BE-054. Serwis `stables`: BE-029…BE-032. Zapisy z audytem: `unitOfWork` (BE-005).
- **Dokumenty:** docs/mikroserwisy.md 1.5 (konsument zdarzenia crona czyta bieżące `subscriptions.status`, nie kopertę), 3.8, 7.3; docs/development-szczegoly.md 3.3 `stables` (konsument `subscription.status_changed`), 3.6 „Etap 8”.
- **Makiety:** brak (stan zawieszenia: BE-054, MOB-023, WEB-025).
- **Decyzje:** DEC-12 A (billing na fałszywych adapterach, subskrypcja per stajnia). Przy wariancie B (billing poza PoC) zadanie odpada razem z BE-052 i BE-053.
- **Dane demo:** Stajnia Pod Lipami z subskrypcją przełączaną w teście na `suspended` i z powrotem na `active`.

## Zakres
- [ ] Konsument `subscription.status_changed` w `stables` (`backend/src/services/stables/consumers/subscription-status.ts`): czyta bieżące `subscriptions.status` stajni (koperta to tylko sygnał); `suspended` → `stables.status = suspended`, `active`, `trial` i `past_due` → `active` (mapowanie w jednym miejscu, `canceled` na PoC też `suspended`); idempotentnie, z audytem `actor_type = system`, tą samą funkcją domeny co skrypt `stable:status` z BE-054.
- [ ] Zdarzenia w zamienionej kolejności i powtórzone nie zmieniają wyniku (stan zawsze z bieżącej subskrypcji).

## Poza zakresem
- Stan `suspended` w `board` i skrypt dev (BE-054); ręczne zawieszenie przez admina globalnego (DEC-28); ekrany (MOB-023, WEB-025); E2E płatności (WEB-030).

## Kryteria akceptacji
- [ ] `billing-dunning` ustawia `suspended` → po obsłużeniu zdarzenia `stables.status = suspended`, a tablet, TV i apka klienta dostają stan `suspended` bez flag (BE-054).
- [ ] Zdarzenie z `suspended`, gdy w bazie subskrypcja jest już `active` (np. nieudany COMMIT crona), nie zawiesza stajni.
- [ ] Opłacona faktura i powrót subskrypcji do `active` przywracają tablicę przy najbliższym odpytaniu.
- [ ] Zawieszenie jednej stajni firmy nie zmienia drugiej stajni.

## Testy
- Integracyjne (Testcontainers PostgreSQL, adapter brokera w pamięci): konsument, zdarzenia w zamienionej kolejności, powtórki.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Wydzielone z BE-054, żeby stan zawieszenia, ekrany i E2E nie czekały na decyzję o billingu (DEC-12).
- `stables.status` to dane zasobu: serwisy czytają je z bazy; token się nie zmienia.
