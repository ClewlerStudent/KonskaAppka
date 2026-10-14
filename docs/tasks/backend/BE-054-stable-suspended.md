---
id: BE-054
title: "Zawieszenie stajni: stan suspended w board"
area: backend
stage: 6
size: S
status: todo
depends_on: [BE-045]
decisions: [DEC-28]
owner:
branch:
trello: https://trello.com/c/QenyK2Eu
---
# BE-054 · Zawieszenie stajni: stan suspended w board

## Cel
Gdy stajnia ma `stables.status = suspended`, tablety, telewizor, apka i panel dostają przy najbliższym odpytaniu jeden wspólny stan „zawieszona” zamiast flag, karmienia i rutyny. Stan zależy wyłącznie od kolumny w bazie, więc działa niezależnie od tego, kto zawiesza stajnię: billing (BE-065, po decyzji o billingu), admin globalny (po DEC-28) albo skrypt dev w testach i E2E.

## Kontekst
- **Stan kodu:** kolumna `stables.status` (`active | suspended`): BE-004; serwis `stables`: BE-029…BE-032. Kontrakty `board` mają już stan `state: 'suspended'` i przykłady `tablet-suspended`, `display-suspended` (BE-064). Widoki `board`: tablica tabletu i lista boksów (BE-041), TV (BE-042), `client-home` i `card` (BE-038), lista dnia, `admin-today` i szczegóły boksu (BE-045), widoki admina (BE-033). `GET /auth/v1/me` zwraca `stables[].status` (BE-019, dane zasobu). Zapisy z audytem: `unitOfWork` (BE-005).
- **Dokumenty:** docs/mikroserwisy.md 3.8 (zawieszenie działa od razu, bo to dane zasobu), 10.2 pkt 14 (ręczne zawieszenie przez admina globalnego: DEC-28); docs/development-szczegoly.md 3.3 `board` („dla stajni zawieszonej: odpowiedź bez flag, z komunikatem”), 5 pkt 20 (brak makiet stanu `suspended`); docs/makiety-plan.md A „StajniaZawieszona”, F „WyswietlaczZablokowany”.
- **Makiety:** brak planszy (docs/development-szczegoly.md 5 pkt 20); opisy stanów w docs/makiety-plan.md (MOB-023, WEB-025).
- **Decyzje:** DEC-28 (ręczne zawieszenie przez admina globalnego): do decyzji bez trasy, tylko skrypt dev. Decyzja o billingu nie dotyczy tego zadania: konsument zdarzenia subskrypcji to BE-065.
- **Dane demo:** Stajnia Pod Lipami przełączana skryptem na `suspended` i z powrotem; Brzozowa bez zmian.

## Zakres
- [ ] `board`: jeden wspólny stan `suspended` w odpowiedziach tabletu (`…/boxes/{b}`), TV (`…/display`), klienta (`…/client-home`, `…/card`), listy dnia, `admin-today` i widoków admina: bez flag, karmienia i rutyny, z kodem komunikatu (tekst po stronie aplikacji), zgodnie z kontraktem i przykładami z BE-064; lista boksów (`…/boxes`) zostaje, żeby tablet mógł pokazać numer.
- [ ] ETag zmienia się przy zmianie statusu; zawieszenie i odwieszenie widać przy najbliższym odpytaniu.
- [ ] Skrypt dev `backend/scripts/stable-status.ts` i `npm run stable:status -- --stable <stableId> --status suspended|active` (zabroniony przy `APP_ENV=prod`): zmiana `stables.status` w `unitOfWork` z audytem `actor_type = system`, `action = stable.status_changed`; używają go testy, E2E (WEB-028, MOB-024, TAB-019) i scenariusze akceptacyjne (SH-005).
- [ ] Zapis do `operations` w zawieszonej stajni: bez zmian na PoC (opis w `backend/README.md`).

## Poza zakresem
- Konsument `subscription.status_changed` z `billing` (BE-065, po DEC-12); ręczne zawieszenie przez admina globalnego jako trasa `platform` (po DEC-28).
- Ekrany stanu zawieszenia: apka (MOB-023), tablet (TAB-012), panel i TV (WEB-025).

## Kryteria akceptacji
- [ ] `npm run stable:status -- --stable <Pod Lipami> --status suspended`: tablet HG 7, TV, `client-home` Anny i lista dnia Oli w Pod Lipami dostają stan `suspended` bez flag; Brzozowa bez zmian.
- [ ] Powrót na `active` przywraca tablicę przy najbliższym odpytaniu (nowy ETag).
- [ ] Odpowiedzi `suspended` są zgodne ze schematami z BE-064 (`tablet-suspended`, `display-suspended`).
- [ ] Skrypt odmawia przy `APP_ENV=prod`.

## Testy
- Integracyjne (Testcontainers PostgreSQL z seedem): odczyty `board` w obu stanach dla każdego widoku, ETag przy zmianie statusu, audyt skryptu.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/README.md` (skrypt `stable:status`); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zmiana względem pierwotnej wersji: zadanie nie zależy od billingu (wcześniej BE-053 przez decyzję o billingu blokowało E2E apki i panelu oraz harness akceptacji); konsument zdarzenia subskrypcji przeniesiony do BE-065, stan w `board` liczony tylko ze `stables.status`.
- `stables.status` to dane zasobu: serwisy czytają je z bazy; token się nie zmienia.
<!-- dep-ok: BE-019 (GET /me tylko odczytuje stables.status; kontrakt z BE-063) -->
