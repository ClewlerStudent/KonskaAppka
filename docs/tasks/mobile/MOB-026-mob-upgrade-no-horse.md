---
id: MOB-026
title: "„Zaktualizuj aplikację” i klient bez ważnego konia"
area: mobile
stage: 2
size: S
status: todo
depends_on: [BE-061, BE-062, MOB-005]
decisions: [DEC-23]
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/lGpn8IPG
---
# MOB-026 · „Zaktualizuj aplikację” i klient bez ważnego konia

## Cel
Zbyt stara wersja apki prosi o aktualizację zamiast pokazywać błędy, a klient, któremu skończył się dostęp do konia, traci tę stajnię bez martwych ekranów. Oba stany są potrzebne przed pierwszym wydaniem apki, niezależnie od billingu.

## Kontekst
- Stan kodu: globalny stan `upgradeRequired` przy `403 client_upgrade_required` i nagłówek `X-Client-Version` (MOB-002), start ról, przełącznik stajni i BrakDostepu (MOB-005), sesja i `GET /me` (MOB-002, kontrakt BE-063). Backend: bramka minimalnej wersji `CLIENT_MIN_VERSIONS` w `kit` (BE-061, odpowiedź 403 z `minVersion`); `GET /me` z numerem „Zadzwoń do stajni” i imionami koni klienta (BE-062).
- Dokumenty: `docs/makiety-plan.md` A „StajniaZawieszona” (stan „Zaktualizuj aplikację” przy `client_upgrade_required`), A „MainBezKonia” (tylko przy DEC-23 B), `docs/mikroserwisy.md` 3.2 (klient bez ważnego konia nie ma stajni w `m`; bez żadnej stajni BrakDostepu), `docs/development-szczegoly.md` 3.1.5 (`X-Client-Version`, kod `client_upgrade_required`).
- Decyzje: DEC-23 wariant A (klient bez ważnego konia traci stajnię w tokenie: znika z przełącznika, a bez innych stajni BrakDostepu; MainBezKonia nie powstaje).
- Makiety: brak osobnych plików `.dc.html`; opis w makiety-plan.
- Dane demo: Tomasz L. (dostęp do Groma zakończony; jedyna stajnia), Anna (dwie stajnie).

## Zakres
- [ ] `mobile/app/(app)/upgrade.tsx`: przy `upgradeRequired` ekran „Zaktualizuj aplikację” z przyciskiem do sklepu (App Store / Google Play według platformy; adresy z `app.config.ts`), blokujący pozostałe ekrany poza Profilem i wylogowaniem; kolejka zapisów (MOB-008) wstrzymana, nie kasowana.
- [ ] Klient bez ważnego konia (DEC-23 A): stajnia znika z `GET /me` po odświeżeniu tokenu; obsłużone przez reguły z MOB-005 (wybór innej stajni albo BrakDostepu), plus testy tego przypadku (jedna stajnia → BrakDostepu, dwie → zostaje druga bez komunikatu).
- [ ] Teksty PL/UA/EN.

## Poza zakresem
- Bramka minimalnej wersji w backendzie (BE-061); stan zawieszonej stajni (MOB-023); pasek „WYMAGANA AKTUALIZACJA” na tablecie (TAB-012).

## Kryteria akceptacji
- [ ] Odpowiedź `403 client_upgrade_required` z dowolnej trasy (atrapa serwera z MOB-008) pokazuje „Zaktualizuj aplikację”; Profil i „Wyloguj” działają; po aktualizacji (nowa wersja w nagłówku) apka wraca do startu.
- [ ] Tomasz L. po końcu dostępu do Groma (jedyna stajnia) widzi BrakDostepu najpóźniej po odświeżeniu tokenu (≤ 5 min; test z fałszywym zegarem i atrapą `GET /me`).
- [ ] [ręcznie] Na stosie dev z `CLIENT_MIN_VERSIONS={"mobile":"99.0.0"}` apka na emulatorze pokazuje „Zaktualizuj aplikację”.

## Testy
- Jest + RNTL: `upgrade.test.tsx`, test reguł wyboru stajni dla klienta bez konia (`selected-stable.test.ts` z MOB-005 rozszerzony).

## Definicja gotowości
- `npm run check` i `npm run build` w `mobile/` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Wydzielone z MOB-023, żeby ekran aktualizacji nie czekał na zawieszenie stajni (wcześniej przez billing).
- Nie pokazuj klientowi bez konia żadnych danych stajni z cache po zniknięciu jej z `GET /me`.
