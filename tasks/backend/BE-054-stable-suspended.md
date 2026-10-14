---
id: BE-054
title: Zawieszenie stajni
area: backend
stage: 8
size: S
status: todo
depends_on: [BE-041, BE-053, BE-042, BE-038]
decisions: [DEC-12]
owner:
branch:
trello:
---
# BE-054 · Zawieszenie stajni

## Cel
Gdy subskrypcja stajni zostanie zawieszona za brak płatności, stajnia przechodzi w stan „zawieszona”: tablety, telewizor i apka pokazują komunikat zamiast flag. Po opłaceniu stan wraca do aktywnego bez ręcznych kroków.

## Kontekst
- **Stan kodu:** `subscription.status_changed` publikują `billing` (BE-052) i cron `billing-dunning` (BE-053). Kolumna `stables.status` (`active | suspended`): BE-004; serwis `stables`: BE-029…BE-032. Widoki `board`: tablica tabletu z prostym stanem `suspended` (BE-041), TV (BE-042), `client-home` i `card` (BE-038), lista dnia (BE-045). `GET /auth/v1/me` zwraca status stajni (BE-019, dane zasobu).
- **Dokumenty:** docs/mikroserwisy.md 1.5 (konsument zdarzenia crona czyta bieżące `subscriptions.status`, nie kopertę), 3.8 (zawieszenie działa od razu, bo to dane zasobu), 7.3; docs/development-szczegoly.md 3.3 `stables` (konsument `subscription.status_changed`), `board` („dla stajni zawieszonej: odpowiedź bez flag, z komunikatem”), 3.6 „Etap 8”, 5 pkt 20 (brak makiet stanu `suspended`).
- **Makiety:** brak planszy (docs/development-szczegoly.md 5 pkt 20); w planie makiet StajniaZawieszona (MOB-023) i stan na TV (WEB-025).
- **Decyzje:** DEC-12 A.
- **Dane demo:** Stajnia Pod Lipami z subskrypcją przełączaną w teście na `suspended` i z powrotem na `active`.

## Zakres
- [ ] Konsument `subscription.status_changed` w `stables` (`backend/src/services/stables/consumers/subscription-status.ts`): czyta bieżące `subscriptions.status` stajni (koperta to tylko sygnał); `suspended` → `stables.status = suspended`, `active`, `trial` i `past_due` → `active` (mapowanie w jednym miejscu, `canceled` do decyzji: na PoC też `suspended`); idempotentnie, z audytem `actor_type = system`.
- [ ] `board`: jeden wspólny stan `suspended` w odpowiedziach tabletu (`…/boxes/{b}`), TV (`…/display`), klienta (`…/client-home`, `…/card`), listy dnia i widoków admina: bez flag, karmienia i rutyny, z kodem komunikatu (tekst po stronie aplikacji); lista boksów (`…/boxes`) zostaje, żeby tablet mógł pokazać numer.
- [ ] ETag zmienia się przy zmianie statusu; zawieszenie widać przy najbliższym odpytaniu.
- [ ] Zapis do `operations` w zawieszonej stajni: bez zmian na PoC (decyzja o blokadzie zapisów poza zakresem, opisana w README).

## Poza zakresem
- ekrany stanu zawieszenia: apka (MOB-023), tablet (TAB-012), panel i TV (WEB-025); ręczne zawieszenie przez admina globalnego (mikroserwisy.md 10.2 pkt 14, nierozstrzygnięte).

## Kryteria akceptacji
- [ ] `billing-dunning` ustawia `suspended` → po obsłużeniu zdarzenia `stables.status = suspended`, a tablet, TV i apka klienta dostają stan `suspended` bez flag.
- [ ] Zdarzenie z `suspended`, gdy w bazie subskrypcja jest już `active` (np. nieudany COMMIT crona), nie zawiesza stajni.
- [ ] Opłacona faktura i powrót subskrypcji do `active` przywracają tablicę przy najbliższym odpytaniu.
- [ ] Zawieszenie jednej stajni firmy nie zmienia drugiej stajni.

## Testy
- Integracyjne (Testcontainers PostgreSQL, adapter brokera w pamięci): konsument, odczyty `board` w obu stanach, zdarzenia w zamienionej kolejności.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/board.json` zaktualizowany (pole stanu), `npm run gen:api` we `frontend/`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Zmiana zależności względem pierwotnej listy: dodane BE-042 i BE-038, bo stan dotyczy też widoku TV i apki klienta.
- `stables.status` to dane zasobu: serwisy czytają je z bazy; token się nie zmienia.
