---
id: WEB-025
title: Stajnia zawieszona w panelu i na TV
area: web
stage: 8
size: S
status: todo
depends_on: [BE-054, WEB-018, WEB-024]
decisions: []
owner:
branch:
trello:
---
# WEB-025 · Stajnia zawieszona w panelu i na TV

## Cel
Gdy stajnia zostaje zawieszona za brak płatności, telewizor przestaje pokazywać flagi i wyświetla neutralny komunikat, a admin w panelu widzi baner z przejściem do płatności. Przy płatności po terminie (jeszcze bez zawieszenia) admin dostaje ostrzeżenie.

## Kontekst
- **Stan kodu:** TV: `DisplayScreen` i ekran blokady (WEB-016, WEB-018); panel: `AdminLayout` (WEB-004), PanelPulpit (WEB-020), PanelPlatnosci i dane subskrypcji (WEB-024); `GET /me` ze `stables[].status` (`active | suspended`, BE-019).
- **Dokumenty:** docs/mikroserwisy.md 3.8 (zawieszenie działa od razu przez `stables.status`), 1.5. BE-054: `board` zwraca stan `suspended` (bez flag, karmienia i rutyny, z kodem komunikatu) w `…/display`, `…/admin-today` i innych widokach; ETag zmienia się przy zmianie statusu; zapisy do `operations` bez zmian na PoC. BE-052: `GET …/subscription` (`past_due`, `suspended`). docs/development-szczegoly.md 3.6 „Etap 8”, 5 pkt 20 (brak makiet stanów).
- **Makiety:** makiety-plan.md F „WyswietlaczZablokowany” (stan „System nieaktywny w tej stajni”), B „PanelPulpit” (stan „płatność po terminie albo zawieszenie (baner)”), A „StajniaZawieszona” (apka: karta krytyczna „Stajnia Pod Lipami jest nieaktywna”, wariant admina „Płatność po terminie” z linkiem do Płatności).
- **Decyzje:** brak (DEC-12 A: billing na fałszywych adapterach).
- **Dane demo:** Pod Lipami przełączona w `suspended` (fałszywy adapter bez płatności, cron `billing-dunning`) albo fixture atrapy.

## Zakres
- [ ] TV: odpowiedź `display` ze stanem `suspended` → ekran w stylu WyswietlaczZablokowany: znak, nazwa stajni, zegar, kłódka i „System nieaktywny w tej stajni”; bez flag, kafli i planu dnia; odpytywanie trwa (co 10 s), powrót do tablicy po zmianie statusu (zmiana ETag).
- [ ] Panel: baner krytyczny „Stajnia zawieszona” z przyciskiem „Płatności” na wszystkich ekranach stajni (`AdminLayout`), gdy `GET /me` albo odpowiedź `board` ma `suspended`; dane boksów i ustawień dalej dostępne do odczytu.
- [ ] Panel: baner „uwaga” „Płatność po terminie” z „Płatności”, gdy subskrypcja ma `past_due` (dane z WEB-024, odczyt przy wejściu na pulpit).
- [ ] Przy zawieszeniu nie pokazujemy starych flag z pamięci TV (czyszczenie stanu tablicy).

## Poza zakresem
- Blokada zapisów w zawieszonej stajni (decyzja poza PoC, BE-054); stan w apce (MOB-023) i na tablecie (TAB-012).

## Kryteria akceptacji
- [ ] Atrapa przełącza `display` na `suspended`: TV w ≤ 10 s pokazuje „System nieaktywny w tej stajni” bez flag; po powrocie `active` tablica wraca.
- [ ] Panel Damiana pokazuje baner „Stajnia zawieszona” z przejściem do Płatności tylko w zawieszonej stajni (Brzozowa bez banera).
- [ ] `past_due` daje baner „Płatność po terminie”.
- [ ] Ekran TV bez danych osobowych (skan PII z WEB-018).

## Testy
- Vitest: wybór banera z `GET /me` i subskrypcji; ekran TV dla `suspended`.
- Playwright na atrapie: przełączenie statusu w trakcie odpytywania (`page.clock`), banery w panelu; zrzut stanu TV do zrzutów wzorcowych WEB-018.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Teksty bez objaśnień i instrukcji odblokowania (makiety-plan.md F).
- Zmiana zależności względem listy: dodane WEB-024 (baner prowadzi do Płatności i korzysta z danych subskrypcji).
