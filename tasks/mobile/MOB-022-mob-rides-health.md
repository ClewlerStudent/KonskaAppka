---
id: MOB-022
title: InstruktorJazdy, jazdy i wizyty w karcie konia
area: mobile
stage: 7
size: M
status: todo
depends_on: [BE-047, BE-048, MOB-018]
decisions: [DEC-17, DEC-32]
needs: [emulator]
owner:
branch:
trello:
---
# MOB-022 · InstruktorJazdy, jazdy i wizyty w karcie konia

## Cel
Instruktor (Marta) widzi swoje jazdy w wybranej stajni i flagi koni (tylko do odczytu, np. zakaz jazdy). Klient, obsługa i admin widzą w karcie konia jazdy i wizyty (wet, kowal, dentysta), z prywatnymi wpisami właściciela tylko dla uprawnionych.

## Kontekst
- Stan kodu: start instruktora `mobile/app/(app)/(instructor)/index.tsx` i pasek Jazdy | Flagi | Profil (MOB-005), karta konia z sekcją „Dziś” i kotwicą „Zdrowie” (MOB-018), `FlagCard` (MOB-012). Trasy `schedule`: `GET /schedule/v1/stables/{stableId}/horses/{horseId}/health-events` (klient: swój koń, obsługa, admin; funkcja `health`; obsługa bez `owner_private`), `POST …/health-attachments/{id}/download-url` (link do załącznika po sprawdzeniu widoczności) — BE-047; `GET …/rides?date=&mine=&horseId=` (instruktor z `mine=true`; admin; obsługa z `rides`; klient tylko swoje konie), `GET …/arenas` — BE-048. Flagi do odczytu: `GET /operations/v1/stables/{stableId}/flags?date=` (role z `flags`, BE-034). Jazdy i wizyty dnia są też w `GET /board/v1/…/horses/{horseId}/card` (BE-045).
- Dokumenty: `docs/makiety-plan.md` C „InstruktorJazdy” (konto `instructor` Marta w obu stajniach; „Stajnia Pod Lipami ▾”; H1 „Jazdy · wt 13.10”; „Dziś”: „16:00 · Iskra · Hala główna · boks 1 · kryta ujeżdżalnia · jeździec: Karolina W. · bez flag”; „Jutro i dalej: brak jazd”; „Flagi koni dziś” tylko do odczytu; bez kontaktów do klientów; pasek Jazdy | Flagi | Profil; stany: koń z flagą o skutku `no_riding` (ostrzeżenie „uwaga” przy jeździe), pusty dzień, `rides_enabled = false` albo odznaczone `rides` → start na Flagach), G „KartaKoniaKometa” (stan: karta Iskry u Karoliny W. z „Jazda 16:00 · kryta ujeżdżalnia” w „Dziś”). `docs/mikroserwisy.md` 5.6 (wpis `owner_private` widzi tylko klient z koniem, admin i `plt`; „Moje jazdy” to `instructor_user_id = sub`), 8 (jazdy: instruktor W i R swoje; klient R* swój koń). A-17, A-21.
- Makiety: `mockups/project/InstruktorJazdy.dc.html` („Jazdy · wt 13.10”, „Dziś · 1 jazda”, „Iskra · Hala główna · boks 1 · 16:00 · Kryta ujeżdżalnia · Jeździec: Karolina W.”, „Iskra nie ma dziś flag”, „Jutro i dalej · Brak jazd”, „Flagi koni dziś · 5 flag”), `KartaKonia.dc.html` (sekcja „Zdrowie · Ostatnio · Wet · kontrola · pt 02.10”).
- Decyzje: DEC-17 wariant A (jazdy tworzą admin i instruktor w API; w apce na PoC tylko podgląd: InstruktorJazdy z flagami do odczytu, bez DodajJazde).
- Dane demo: Marta (instruktor w obu stajniach; jazda Iskry 16:00 w Pod Lipami, w Brzozowej brak jazd), Anna (wet 08:00 i kowal 15:00 Kasztana, wet kontrola 02.10), Karolina W. (Iskra), Ola (obsługa; w Brzozowej bez `rides`).

## Zakres
- [ ] `mobile/app/(app)/(instructor)/index.tsx` (InstruktorJazdy): `GET …/rides?date=dziś&mine=true` i kolejne dni (zakres 7 dni, propozycja) z areną i jeźdźcem; „Dziś” i „Jutro i dalej”; przy jeździe flagi konia z dnia; ostrzeżenie w rodzinie „uwaga”, gdy koń ma flagę ze skutkiem `no_riding` w czasie jazdy; „Brak jazd”.
- [ ] `mobile/app/(app)/(instructor)/flags.tsx`: „Flagi koni dziś” z `GET …/flags?date=` jako lista `FlagCard` bez akcji (bez „Potwierdzam” i bez nowej flagi); przy `rides_enabled = false` albo bez `rides` ten ekran jest startem (MOB-005).
- [ ] Karta konia (MOB-018): w „Dziś” jazdy konia (godzina, arena, jeździec dla admina, obsługi i instruktora; klient widzi jazdę swojego konia) i wizyty; sekcja „Zdrowie” z listą wpisów `health-events` (typ, data, opis, następny termin), oznaczenie wpisów prywatnych właściciela tylko u klienta z koniem i admina; załącznik otwierany przez `download-url` w przeglądarce systemowej.
- [ ] Main klienta (MOB-012): jazda albo wizyta dnia w skrócie konia, jeśli `client-home` ją podaje i rola ma `rides`/`health`.
- [ ] Wszystko według funkcji `health` i `rides` roli w wybranej stajni; Brzozowa: klient bez jazd, obsługa bez jazd.

## Poza zakresem
- Dodawanie jazd i wpisów zdrowia w apce (DodajJazde, ZdrowieWpis — P3, po decyzji); wgrywanie załączników (DEC-32 A: na PoC wpisy i załączniki tylko z seedu i przez API `schedule` z BE-047, bez ekranu w apce i panelu).

## Kryteria akceptacji
- [ ] Marta w Pod Lipami widzi „16:00 · Iskra · Hala główna · boks 1 · Kryta ujeżdżalnia · Jeździec: Karolina W.” i 5 flag koni bez akcji; w Brzozowej „Brak jazd”.
- [ ] Gdy Iskra dostanie flagę ze skutkiem `no_riding` na 16:00, przy jeździe pojawia się ostrzeżenie (A-21 dla instruktora: flagi i jazdy).
- [ ] Karolina W. widzi w karcie Iskry „Jazda 16:00 · kryta ujeżdżalnia”; Anna widzi w karcie Kasztana wet 08:00 i kowala 15:00 oraz sekcję „Zdrowie”; w Brzozowej karta Komety bez jazd (A-17).
- [ ] Wpis `owner_private` Anny jest widoczny u Anny i Damiana, a u Oli nie ma go wcale.
- [ ] Po odznaczeniu instruktorowi `rides` Marta startuje na Flagach.

## Testy
- Jest + RNTL: `instructor-rides.test.tsx` (dziś, kolejne dni, `no_riding`, pusty dzień), `instructor-flags.test.tsx` (bez akcji), `horse-card-health.test.tsx` (`owner_private`, role) na atrapach `schedule` i `board`.
- [ręcznie] Maestro: `mobile/e2e/maestro/instructor.yaml` (Marta w obu stajniach na seedzie).

## Definicja gotowości
- `npm run check` w `mobile/` zielone (`gen:api` z `schedule.json`); flow Maestro przechodzi [ręcznie]; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Instruktor nie ustawia i nie potwierdza flag w apce (DEC-17, docs/mikroserwisy.md 8: flagi R* dla instruktora).
- Bez kontaktów do klientów na ekranie instruktora; imię jeźdźca tylko gdy API je podaje.
