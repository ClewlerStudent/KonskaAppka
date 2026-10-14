---
id: MOB-023
title: Stajnia zawieszona w apce
area: mobile
stage: 6
size: S
status: todo
depends_on: [BE-054, BE-062, MOB-012, MOB-016, MOB-020]
decisions: [DEC-28]
needs: [emulator]
owner:
branch:
trello:
---
# MOB-023 · Stajnia zawieszona w apce

## Cel
Gdy stajnia jest zawieszona (np. brak płatności albo decyzja zespołu EQUENOR), apka nie pokazuje starych flag ani planów, tylko jasny stan i drogę wyjścia (admin: płatności w panelu), a przełącznik do innych stajni działa dalej.

## Kontekst
- Stan kodu: `GET /me` ze `stables[].status` (`active | suspended`) (MOB-002, BE-063/BE-019), start ról i przełącznik (MOB-005), Main i karta (MOB-012), ListaDnia (MOB-016), AdminDzis (MOB-020), numer „Zadzwoń do stajni” z `GET /me` (BE-062). `board` (BE-054): wspólny stan `suspended` w odpowiedziach klienta (`client-home`, `card`), listy dnia i widoków admina — bez flag, karmienia i rutyny, z kodem komunikatu; ETag zmienia się przy zmianie statusu; kształt w kontrakcie i przykładach z BE-064. Na stosie dev stajnię zawiesza `npm run stable:status` (BE-054).
- Dokumenty: `docs/makiety-plan.md` A „StajniaZawieszona” (Anna; karta krytyczna „Stajnia Pod Lipami jest nieaktywna” z „Zadzwoń do stajni”; bez koni i kafelków; przełącznik do Brzozowej działa; pasek tylko z Profilem; stany: admin „Płatność po terminie” z linkiem do Płatności w panelu web, obsługa bez szybkich akcji), 2.3 „Urządzenia i prywatność” (po zawieszeniu stajni nie pokazujemy starych flag). `docs/mikroserwisy.md` 3.8 (zawieszenie działa od razu przez `board`). `docs/development-szczegoly.md` 3.6 „Etap 8”.
- Decyzje: DEC-28 (kto ręcznie zawiesza stajnię): ekran nie zależy od przyczyny; tekst admina „Płatność po terminie” według makiety.
- Makiety: brak plików `.dc.html` (P2); opis w makiety-plan.
- Dane demo: Pod Lipami ustawiona jako `suspended` skryptem `npm run stable:status` (BE-054) albo fixture; Anna (dwie stajnie), Damian (admin), Ola (obsługa).

## Zakres
- [ ] `mobile/src/features/suspended/SuspendedStable.tsx`: ekran dla wybranej stajni ze `status = suspended` (z `GET /me` albo ze stanu `suspended` w odpowiedzi `board`): karta krytyczna „Stajnia Pod Lipami jest nieaktywna”; dla admina „Płatność po terminie” z „Płatności w panelu” (`EXPO_PUBLIC_PANEL_URL`); „Zadzwoń do stajni” tylko gdy `GET /me` podaje numer (BE-062); bez koni, kafelków, szybkich akcji i flag.
- [ ] Nawigacja w stanie zawieszenia: pasek tylko z Profilem; przełącznik stajni działa (Anna przechodzi do Brzozowej).
- [ ] Czyszczenie danych: przy przejściu stajni w `suspended` usunięcie z cache zapytań tej stajni (flagi, karta, lista dnia), żeby po restarcie offline nie wróciły stare flagi; kolejka zapisów tej stajni zostaje i wysyła się po odwieszeniu (odpowiedzi błędów jak w MOB-008).
- [ ] Teksty PL/UA/EN.

## Poza zakresem
- „Zaktualizuj aplikację” i klient bez ważnego konia (MOB-026).
- Płatności (panel: WEB-024); stan zawieszenia na tablecie i TV (TAB-012, WEB-025); zawieszanie przez billing (BE-065).

## Kryteria akceptacji
- [ ] Po zawieszeniu Pod Lipami (fixture `client-home` ze stanem `suspended`) Anna przy najbliższym odpytaniu widzi „Stajnia Pod Lipami jest nieaktywna” bez flag i koni; przełączenie na Brzozową pokazuje Kometę normalnie.
- [ ] Damian w zawieszonej stajni widzi „Płatność po terminie” z wejściem do płatności w panelu; Ola nie ma szybkich akcji.
- [ ] Restart apki offline po zawieszeniu nie pokazuje starych flag tej stajni (test na trwałym cache).
- [ ] [ręcznie] Na stosie dev `npm run stable:status -- --stable <Pod Lipami> --status suspended` daje ten stan w apce Anny na emulatorze, a `--status active` przywraca Main.

## Testy
- Jest + RNTL: `suspended.test.tsx` (klient, admin, obsługa, przełącznik, czyszczenie cache) na przykładach kontraktu z `src/api/examples/board/` (BE-064) i atrapie serwera z MOB-008.
- Maestro [ręcznie]: `mobile/e2e/maestro/suspended.yaml` (stajnia zawieszona skryptem z BE-054).

## Definicja gotowości
- `npm run check` i `npm run build` w `mobile/` zielone; flow Maestro [ręcznie]; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Po zawieszeniu nie pokazuj starych flag nigdzie (także z cache), bo mogły przestać obowiązywać.
- Zmiana względem pierwotnej wersji: „Zaktualizuj aplikację” i klient bez konia przeniesione do MOB-026 (potrzebne przed pierwszym wydaniem, niezależne od billingu); zadanie nie zależy już od billingu (BE-054 nie czeka na decyzję o billingu).
