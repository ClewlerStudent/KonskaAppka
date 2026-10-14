---
id: BE-043
title: "operations: karmienie, padoki, słowniki"
area: backend
stage: 6
size: M
status: todo
depends_on: [BE-028, BE-032, BE-030]
decisions: []
owner:
branch:
trello: https://trello.com/c/okQBMgF0
---
# BE-043 · operations: karmienie, padoki, słowniki

## Cel
Obsługa i admin prowadzą słowniki pasz i padoków oraz plan karmienia i padoku każdego konia (z „namoczyć” i ile, z towarzyszami na padoku). Z tych planów tablica tabletu pokazuje tabelę KARMIENIE, a reguły flag liczą wstrzymane posiłki i skrócony padok. Klient może edytować plan karmienia swojego konia tylko wtedy, gdy stajnia na to pozwala.

## Kontekst
- **Stan kodu:** serwis `operations` (BE-028: `backend/src/services/operations/`, pory posiłków `GET/PUT …/meal-slots`, domyślne słowniki w `POST /operations/v1/internal/stables/{id}/defaults`). Tabele `feeds`, `paddocks`, `feeding_plans`, `feeding_plan_items`, `paddock_plans`, `paddock_plan_companions`: BE-004. Konie z seedem: BE-032. Polityka tras i dostęp klienta do konia (`m[].h`): BE-006. Ustawienia `soak_enabled`, `owner_edits_feeding`, `paddock_out_enabled` w `stable_settings` (zapis BE-030). `backend/src/lib/rules` (BE-007): wystąpienia posiłków i padoku, `days_mask`.
- **Dokumenty:** docs/mikroserwisy.md 5.5 tabela „Opieka” (kto czyta i zapisuje słowniki i plany); docs/development-szczegoly.md 3.3 `operations` „Karmienie, padok i szybkie akcje” (`soak`, `soak_note`, `409 option_disabled` przy wyłączonym moczeniu, plan padoku z towarzyszami), 3.2 seed „Karmienie i padok”; docs/erd.md tabele `feeds`, `paddocks`, `feeding_plans`, `feeding_plan_items`, `paddock_plans`, `paddock_plan_companions`, pkt 3 i 16, „Otwarte kwestie” pkt 1 (model karmienia prosty).
- **Makiety:** KartaKonia.dc.html (plan karmienia: Śniadanie 06:30 owies 1,5 kg, siano bez ograniczeń, suplement X 1 miarka; Kolacja 18:00 wysłodki 0,5 kg „Namoczyć w 2 l wody”; „Padok B · z: Fala, Rumba · plan pn–pt 10:00–16:00”), TabletBoks.dc.html (tabela KARMIENIE), StajennyKonie.dc.html (przycisk „Plan”).
- **Decyzje:** brak nowych; wyłączona opcja daje `409 option_disabled` (docs/development-szczegoly.md 3.1.5).
- **Dane demo:** Kasztan, Hetman (Pod Lipami), Kometa (Brzozowa); padoki A i B; Ola (obsługa), Anna (klientka), Damian (admin). Pod Lipami `soak_enabled = true`, Brzozowa `false`.

## Zakres
- [ ] Kontrakty w `backend/src/contracts/operations.ts`:
  - `GET`, `PUT …/feeds` i `GET`, `PUT …/paddocks` (odczyt: role z `feeding_plan` albo `routine`; zapis: obsługa, admin): `PUT` przyjmuje pełną listę z `id` nadanym przez klienta i `If-Match`; nazwa unikalna w stajni (409 przy powtórzeniu); pasza używana w planie nie znika, tylko `active = false`; padok używany w planie: 409;
  - `GET`, `PUT …/horses/{horseId}/feeding-plan` (odczyt: role z `feeding_plan`, klient tylko swój koń; zapis: obsługa, admin, klient swojego konia tylko przy `owner_edits_feeding`, inaczej `409 option_disabled`): pory (`mealSlotId`) z pozycjami `{feedId, quantity | null, unit, soak, soakNote, sortOrder}`;
  - `GET`, `PUT …/horses/{horseId}/paddock-plan` (odczyt: role z `routine`; zapis: obsługa, admin): wpisy `{paddockId, daysMask, startLocal, endLocal, companionHorseIds[]}`.
- [ ] Zapis planu jako nowa wersja: bieżące wiersze dostają `valid_to` (wczoraj w strefie stajni), nowe `valid_from` = dziś; `If-Match` z wersją planu (412 `version_conflict`, 428 bez nagłówka); audyt.
- [ ] `soak = true` przy `soak_enabled = false`: `409 option_disabled`; odczyty przy wyłączonym moczeniu pomijają `soak` i `soakNote` (wpisy zostają w bazie). Zapis planu padoku przy `paddock_out_enabled = false`: `409 option_disabled`.
- [ ] Walidacja: pasza, padok i towarzysze z tej samej stajni (inaczej 404), towarzysz nie może być tym samym koniem, koń `left`: 404.
- [ ] Funkcje odczytu planów na dzień (np. `backend/src/services/operations/domain/feeding/read.ts`) zgodne z tym, co czyta `board` (BE-041, BE-045); obliczenia czasu tylko z `lib/rules`.
- [ ] Seed: moduł w `backend/scripts/seed/` (BE-011, stałe UUID z `backend/src/lib/testing/demo.ts`): pasze (Owies i Siano zakłada już `ensureStableDefaults` z BE-028, seed dopisuje suplement X, wysłodki, sieczkę, musli), padoki A i B; plan Kasztana (owies rano i wieczorem 1,5 kg; siano rano, w południe, wieczorem bez ograniczeń; suplement X rano 1 miarka; wysłodki wieczorem 0,5 kg, `soak`, „w 2 l wody”), Hetman (sieczka 1 kg rano, „namoczyć w 3 l wody”), Kometa (owies rano i wieczorem 1 kg, siano, musli wieczorem 0,5 kg); padok A 10:00–14:00 Dukat, Sonata, Grom, Bursztyn; padok B 10:00–16:00 Fala, Kasztan, Rumba (pn–pt).
- [ ] `npm run openapi`, `npm run gen:api`.

## Poza zakresem
- szybkie akcje (BE-044) i widoki `board` z planami (BE-041 tabela karmienia, BE-045 karta konia i padok);
- ekrany edycji (MOB-019, WEB-022); rozbudowa modelu karmienia (pudełka, czas moczenia: otwarta kwestia).

## Kryteria akceptacji
- [ ] A-07: Ola zmienia plan karmienia konia, dodając pozycję z „namoczyć” i ilością; zmiana widoczna w `GET` i (po BE-041) na tablicy.
- [ ] A-19: przy wyłączonym moczeniu zapis z `soak = true` daje `409 option_disabled`, a `GET` nie ma „namoczyć”; po włączeniu wraca.
- [ ] Anna bez `owner_edits_feeding` dostaje `409 option_disabled`; z włączonym zapisuje plan Kasztana, a plan konia spoza `h` (np. Iskry Karoliny W.) daje 404.
- [ ] A-21: klient bez `feeding_plan` w `m[].f` dostaje `403 feature_hidden` na `GET …/feeding-plan`.
- [ ] Brak `If-Match`: 428; stara wersja: 412.
- [ ] Towarzysz z innej stajni: 404, bez zapisu.

## Testy
- Jednostkowe: walidacja planu, wersjonowanie `valid_from`/`valid_to` w strefie stajni.
- Integracyjne (Testcontainers PostgreSQL, `app.inject`, tokeny Oli, Anny, Damiana, Pawła): kryteria wyżej, izolacja między stajniami.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/operations.json` zaktualizowany, `npm run gen:api` we `frontend/`.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Bez `DEFAULT`, `CHECK` i `jsonb`: pozycje planu i towarzysze to osobne wiersze; `days_mask` jako `smallint` (pn = 1 … nd = 64).
- Widoczność (`m[].f`) tylko zawęża: klient z `feeding_plan` widzi plan, ale zapis zależy od `owner_edits_feeding`.
- Plany zamykamy przez `valid_to`, nie usuwamy (historia zostaje).
