---
id: BE-028
title: "operations: szkielet serwisu, domyślne dane stajni, szablony flag, pory posiłków"
area: backend
stage: 2
size: M
status: todo
depends_on: [BE-006, BE-007, BE-008]
decisions: [DEC-20, DEC-21]
owner:
branch:
trello:
---
# BE-028 · operations: szkielet serwisu, domyślne dane stajni, szablony flag, pory posiłków

## Cel
Powstaje serwis `operations` (codzienna obsługa stajni). Na start umie założyć domyślne dane nowej stajni (szablony flag, pory posiłków, słowniki) na wywołanie `stables` albo po zdarzeniu `stable.created`, pokazać szablony flag jako kafelki, włączać i wyłączać szablony w „Ustawieniach stajni” i zarządzać porami posiłków.

## Kontekst
- Stan kodu: wzór serwisu to `auth` (`backend/src/services/auth/{main,app,env,deps}.ts`, kontrakty w `backend/src/contracts/auth.ts` zarejestrowane w `contracts/index.ts` → `openapi/auth.json`, skrypt `start:auth`). Tabele `flag_templates`, `flag_template_labels`, `meal_slots`, `meal_slot_labels`, `feeds`, `paddocks` (BE-004, unikalności `(stable_id, code)`, aktywna pora `(stable_id, code)` przy `valid_to IS NULL`, `(stable_id, name)`); polityka tras (BE-006); domyślne szablony i pory w `lib/rules/defaults.ts` (BE-007); konsument zdarzeń (BE-008); `unitOfWork` z audytem (BE-005).
- Dokumenty: `docs/mikroserwisy.md` 5.5 (tabela tras: `GET …/flag-templates` dla ról z `flags`, `PATCH …/flag-templates/{id}` admin, `GET`/`PUT …/meal-slots`, `POST /internal/stables/{id}/defaults` dla `stables` z `INSERT … ON CONFLICT DO NOTHING`; konsumuje `stable.created`), 5.3 (ponowienie bez pór: pory domyślne 06:30, 12:00, 18:00), 7.2; `docs/development-szczegoly.md` 3.3 operations (wstęp i „Flagi”: szablony z `default_window`, włączanie z `If-Match` i audytem), 3.2 seed „Słowniki”; `docs/erd.md` „Słowniki wartości” (szablony `bez_sniadania`, `bez_kolacji`, `nie_na_padok`, `derka` z wariantami, `leki`, `wet`).
- Makiety: `SzybkaFlaga.dc.html` (kafelki: Bez śniadania, Bez kolacji, Nie na padok, Derka, Wet, Leki, Inna flaga), `PanelZalozStajnie.dc.html` (pory posiłków: nazwa, godzina, codziennie / wybrane dni, „Nazwy w innych językach”), `PanelUstawieniaStajni.dc.html` i `PanelUstawieniaBrzozowa.dc.html` (sekcje Opieka: Derki; Flagi: przełącznik na szablon).
- Decyzje: DEC-20 A (domyślne szablony z makiet, pory 06:30/12:00/18:00), DEC-21 A (wyłączenie szablonu nie rusza trwających flag; znika tylko kafelek).
- Dane demo: Pod Lipami (wszystkie szablony aktywne), Brzozowa (`derka` nieaktywna), pory obu stajni 06:30, 12:00, 18:00.

## Zakres
- [ ] Serwis: `backend/src/services/operations/{main,app,env,deps}.ts`, skrypty `dev:operations`, `serve:operations`, `start:operations`; env: `DATABASE_URL`, `AUTH_ISSUER`, `AUTH_JWKS_URL`, `MESSAGING*`, `PORT`, `DEFAULTS_PORT` (wewnętrzny); `/readyz`: JWKS i migracje. Kontrakty `backend/src/contracts/operations.ts` → `openapi/operations.json`. Port dev (propozycja): 4030, wewnętrzny 4031; README „Porty”.
- [ ] Domena `services/operations/domain/defaults.ts`: `ensureStableDefaults(tx, stableId, mealSlots?)` → szablony z `lib/rules` z etykietami PL/UA/EN, pory z kreatora albo domyślne (z etykietami), słowniki domyślne (propozycja: pasze „Siano”, „Owies”; bez padoków), wszystko `ON CONFLICT DO NOTHING`, audyt `actor_type = system`.
- [ ] `POST /operations/v1/internal/stables/{stableId}/defaults` (`kind: 'internal'`, `port: 'defaults'`, `callers: ['stables']`, body `{ mealSlots?: [{ code, label, localTime, daysMask, labels? }] }`, 204). Konsument `stable.created` (zapas) woła tę samą funkcję z porami z koperty.
- [ ] `GET /operations/v1/stables/{stableId}/flag-templates?locale=` (role z `flags`; nieaktywne tylko dla admina), `PATCH …/flag-templates/{templateId}` (`{ active }`, admin, `If-Match`, audyt; trwające flagi bez zmian).
- [ ] `GET …/meal-slots` (każda rola w stajni), `PUT …/meal-slots` (admin, `If-Match` na skrócie zestawu): zmiana pory = zamknięcie starej (`valid_to`) i nowa (`valid_from`), kod pory stały; walidacja `HH:MM`, `days_mask` 1–127.
- [ ] Moduł seedu `operations-defaults` (BE-011): szablony i pory obu stajni, Derka nieaktywna w Brzozowej.

## Poza zakresem
- Flagi i potwierdzenia (BE-034), karmienie, padoki i edycja słowników (BE-043), zadania (BE-050), konsumenci `horse.left` i `member.removed` (BE-046, BE-050).

## Kryteria akceptacji
- [ ] `defaults` dla nowej stajni zakłada 6 szablonów i 3 pory; drugie wywołanie i zdarzenie `stable.created` niczego nie dublują.
- [ ] `defaults` z porami z kreatora (np. 06:00, 13:00, 19:30) zapisuje te pory; bez pór: 06:30, 12:00, 18:00.
- [ ] `GET …/flag-templates` w Brzozowej: Ola nie widzi Derki; Damian widzi ją jako nieaktywną; `PATCH` przez Olę → 403, przez admina Olszynki → 404.
- [ ] Ścieżka `/operations/v1/internal/...` na porcie zewnętrznym → 404; brak jej w `openapi/operations.json`.

## Testy
- `backend/src/services/operations/*.test.ts` na harnessie (`lib/testing`): idempotencja `defaults`, konsument zdarzenia (adapter w pamięci), uprawnienia, `If-Match`. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`; `npm run openapi`) i `npm run build` zielone; README (uruchomienie `operations`, porty); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Serwis nie importuje innych serwisów (ESLint); wspólne rzeczy w `kit`, `lib`, `contracts`.
- Ustawienia stajni (`stable_settings`) czyta jako dane zasobu; o roli i funkcjach wie tylko z tokenu (W2).
- Typy API dla frontendu: `frontend` generuje typy z `backend/openapi/*.json` (SH-004 rozszerza `gen:api` o nowe pliki).
