---
id: MOB-023
title: Stajnia zawieszona, klient bez konia i „Zaktualizuj aplikację”
area: mobile
stage: 8
size: S
status: todo
depends_on: [BE-054, BE-061, BE-062, MOB-012]
decisions: [DEC-23]
owner:
branch:
trello:
---
# MOB-023 · Stajnia zawieszona, klient bez konia i „Zaktualizuj aplikację”

## Cel
Gdy stajnia jest zawieszona (np. brak płatności), apka nie pokazuje starych flag ani planów, tylko jasny stan i drogę wyjścia (admin: płatności w panelu). Klient, któremu skończył się dostęp do konia, traci tę stajnię. Zbyt stara wersja apki prosi o aktualizację.

## Kontekst
- Stan kodu: `GET /me` ze `stables[].status` (`active | suspended`) (MOB-002, BE-019), start ról i przełącznik (MOB-005), Main i karta (MOB-012), globalny stan `upgradeRequired` przy `client_upgrade_required` (MOB-002). `board` (BE-054): wspólny stan `suspended` w odpowiedziach klienta (`client-home`, `card`), listy dnia i widoków admina — bez flag, karmienia i rutyny, z kodem komunikatu; ETag zmienia się przy zmianie statusu.
- Dokumenty: `docs/makiety-plan.md` A „StajniaZawieszona” (Anna; karta krytyczna „Stajnia Pod Lipami jest nieaktywna” z „Zadzwoń do stajni”; bez koni i kafelków; przełącznik do Brzozowej działa; pasek tylko z Profilem; stany: admin „Płatność po terminie” z linkiem do Płatności w panelu web, obsługa bez szybkich akcji, „Zaktualizuj aplikację” (`client_upgrade_required`)), A „MainBezKonia” (tylko przy DEC-23 B), 2.3 „Urządzenia i prywatność” (po zawieszeniu stajni nie pokazujemy starych flag). `docs/mikroserwisy.md` 3.2 (klient bez ważnego konia nie ma stajni w `m`; bez żadnej stajni BrakDostepu), 3.8 (zawieszenie działa od razu przez `board`). `docs/development-szczegoly.md` 3.1.5 (`X-Client-Version`, kod `client_upgrade_required`), 3.6 „Etap 8”.
- Decyzje: DEC-23 wariant A (klient bez ważnego konia traci stajnię w tokenie: znika z przełącznika, a bez innych stajni BrakDostepu; MainBezKonia nie powstaje).
- Makiety: brak plików `.dc.html` (P2); opis w makiety-plan.
- Dane demo: Pod Lipami ustawiona jako `suspended` przez fałszywy billing (BE-053/BE-054) albo fixture; Anna (dwie stajnie), Damian (admin), Ola (obsługa); Tomasz L. (dostęp do Groma zakończony).

## Zakres
- [ ] `mobile/src/features/suspended/SuspendedStable.tsx`: ekran dla wybranej stajni ze `status = suspended` (z `GET /me` albo ze stanu `suspended` w odpowiedzi `board`): karta krytyczna „Stajnia Pod Lipami jest nieaktywna”; dla admina „Płatność po terminie” z „Płatności w panelu” (`EXPO_PUBLIC_PANEL_URL`); „Zadzwoń do stajni” tylko gdy znany numer (patrz MOB-013); bez koni, kafelków, szybkich akcji i flag.
- [ ] Nawigacja w stanie zawieszenia: pasek tylko z Profilem; przełącznik stajni działa (Anna przechodzi do Brzozowej).
- [ ] Czyszczenie danych: przy przejściu stajni w `suspended` usunięcie z cache zapytań tej stajni (flagi, karta, lista dnia), żeby po restarcie offline nie wróciły stare flagi; kolejka zapisów tej stajni zostaje i wysyła się po odwieszeniu (odpowiedzi błędów jak w MOB-008).
- [ ] Klient bez ważnego konia (DEC-23 A): stajnia znika z `GET /me` po odświeżeniu tokenu; obsłużone przez reguły z MOB-005 (wybór innej stajni albo BrakDostepu), plus test tego przypadku.
- [ ] `mobile/app/(app)/upgrade.tsx`: przy `upgradeRequired` ekran „Zaktualizuj aplikację” z przyciskiem do sklepu (App Store / Google Play według platformy), blokujący pozostałe ekrany poza Profilem i wylogowaniem.
- [ ] Teksty PL/UA/EN.

## Poza zakresem
- Bramka minimalnej wersji w backendzie (BE-061, zależność; tu tylko ekran i test z `CLIENT_MIN_VERSIONS` na lokalnym stosie).
- Płatności (panel: WEB-024); stan zawieszenia na tablecie i TV (TAB-012, WEB-025).

## Kryteria akceptacji
- [ ] Po zawieszeniu Pod Lipami Anna przy najbliższym odpytaniu widzi „Stajnia Pod Lipami jest nieaktywna” bez flag i koni; przełączenie na Brzozową pokazuje Kometę normalnie.
- [ ] Damian w zawieszonej stajni widzi „Płatność po terminie” z wejściem do płatności w panelu; Ola nie ma szybkich akcji.
- [ ] Restart apki offline po zawieszeniu nie pokazuje starych flag tej stajni.
- [ ] Tomasz L. po końcu dostępu do Groma (jedyna stajnia) widzi BrakDostepu najpóźniej po 5 min.
- [ ] Odpowiedź `403 client_upgrade_required` z dowolnej trasy (atrapa) pokazuje „Zaktualizuj aplikację”.

## Testy
- Jest + RNTL: `suspended.test.tsx` (klient, admin, obsługa, przełącznik, czyszczenie cache), `upgrade.test.tsx`, test reguł wyboru stajni dla klienta bez konia.
- Maestro: `mobile/e2e/maestro/suspended.yaml` (stajnia zawieszona na seedzie albo fixture).

## Definicja gotowości
- `npm run check` w `mobile/` zielone; flow Maestro przechodzi; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Po zawieszeniu nie pokazuj starych flag nigdzie (także z cache), bo mogły przestać obowiązywać.
- Zmiana względem listy: dodany ekran „Zaktualizuj aplikację” (stan z makiety StajniaZawieszona); MainBezKonia nie powstaje (DEC-23 A).
