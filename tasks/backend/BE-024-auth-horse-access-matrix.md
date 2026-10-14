---
id: BE-024
title: "auth: dostęp do koni i macierz widoczności"
area: backend
stage: 1
size: M
status: todo
depends_on: [BE-023]
decisions: [DEC-03]
owner:
branch:
trello:
---
# BE-024 · auth: dostęp do koni i macierz widoczności

## Cel
Admin nadaje klientowi dostęp do konia (z końcem dzierżawy), przedłuża go albo odbiera, a w „Ustawieniach stajni” zaznacza, które funkcje widzi każda rola. Obsługa i admin widzą imiona klientów przy koniach. Zmiany trafiają do tokenu przy najbliższym odświeżeniu.

## Kontekst
- Stan kodu: tabele `horse_access` (`valid_from`, `valid_to`, `revoked_at`, `granted_by`, `granted_via`, `granted_session_id`, `version`) i `stable_role_features` (PK `stable_id`, `role`, `feature`; `visible`) z BE-004; claimy `h` i `f` liczone w `pg-access.ts` (BE-013) z macierzą domyślną z `lib/rules/features.ts` (BE-007); członkowie i sprawdzenie admina w bazie (BE-023); `If-Match` z kit (BE-006).
- Dokumenty: `docs/mikroserwisy.md` 5.2 „Dostęp do koni” (`GET`, `POST …/horses/{horseId}/access`, `PATCH …/horse-access/{id}` z `valid_to`, `revoked_at`; `GET …/horse-clients` admin i obsługa, telefon tylko admin) i „Widoczność” (`GET`, `PUT …/role-features` z `If-Match`, 5 ról × 7 funkcji, tablet bez `tasks` i `box_history` → 422), 3.2 (`h` tylko ważne dostępy), 3.8, 9.6 (Kuba przedłuża dostęp Anny do Komety, `granted_via = platform`); `docs/development-szczegoly.md` 3.3 auth „Dostęp klienta do konia” i „Widoczność per rola”; `docs/erd.md` pkt 16.
- Makiety: `PanelUstawieniaStajni.dc.html` i `PanelUstawieniaBrzozowa.dc.html` (sekcja „Widoczność per rola”: wiersze Flagi, Plan karmienia, Szybkie akcje i ich stan, Historia boksu, Zadania, Zdrowie i wizyty, Jazdy; kolumny Klient, Obsługa, Instruktor, Tablet, Wyświetlacz; u Tabletu Zadania i Historia boksu nieaktywne).
- Scenariusz: A-21 (Damian odznacza klientowi „Plan karmienia” → przy odświeżeniu trasa planu daje Annie 403; ustawienia Pod Lipami nie zmieniają Brzozowej).
- Decyzje: DEC-03 wariant A (macierz w tokenie, `m[].f`).
- Dane demo: Anna (Kasztan, Bella w Pod Lipami; Kometa w Brzozowej), Karolina W. (Iskra), macierze obu stajni z seedu.

## Zakres
- [ ] Kontrakty (`contracts/auth.ts`, polityka i audyt): `GET /auth/v1/stables/{stableId}/horses/{horseId}/access` (admin), `POST …/horses/{horseId}/access` (`{ userId, validFrom?, validTo? }`; tworzy członkostwo `client`, jeśli osoba go nie ma; koń tej stajni i nie `left`), `PATCH …/horse-access/{accessId}` (`{ validTo?, revoke? }`, `If-Match`), `GET …/horse-clients` (admin i obsługa; `[{ horseId, clients: [{ userId, displayName, phone? }] }]`, telefon tylko dla admina, tylko ważne dostępy).
- [ ] `GET` i `PUT /auth/v1/stables/{stableId}/role-features` (admin): pełna macierz (brak wierszy = domyślna z `lib/rules`), `ETag` = skrót macierzy (tabela nie ma jednej wersji), `PUT` z `If-Match` zapisuje wszystkie wiersze w jednej transakcji z audytem zmian; `tablet` z `tasks` albo `box_history`, nieznana rola albo funkcja → 422 `feature_not_applicable`.
- [ ] Przy `plt`: `granted_via = platform`, `granted_session_id = sid` w `horse_access`; uprawnienie admina sprawdzane w bazie w tej samej transakcji.
- [ ] Kod błędu `feature_not_applicable` (422) do `ERRORS`.

## Poza zakresem
- Zamknięcie dostępów po wyjeździe konia (`/internal/horses/{id}/left`, BE-025); ustawienia stajni w `stables` (BE-030); ekrany (WEB-005, WEB-014, MOB-011).

## Kryteria akceptacji
- [ ] A-21: po `PUT` z odznaczonym „Plan karmienia” dla klienta w Pod Lipami token Anny (po odświeżeniu) nie ma `feeding_plan` w Pod Lipami, a w Brzozowej bez zmian.
- [ ] `PUT` ze starym `If-Match` daje 412 `version_conflict`; bez nagłówka 428.
- [ ] Odebrany dostęp Anny do Komety (`revoke`): przy odświeżeniu znika Kometa i cała Brzozowa (Anna nie ma tam innego konia).
- [ ] `horse-clients`: Ola widzi imiona klientów bez telefonów, Damian z telefonami, Anna 403.
- [ ] Kuba (`ops`) przedłuża dostęp: wiersz ma `granted_via = platform`, audyt `actor_type = operator`.

## Testy
- `backend/src/services/auth/horse-access.test.ts` i `role-features.test.ts` na harnessie: walidacja macierzy, ETag i `If-Match`, claimy po odświeżeniu (fałszywy zegar), uprawnienia ról. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; `cd frontend && npm run gen:api`; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Widoczność tylko zawęża: zaznaczona funkcja nie daje prawa zapisu (A-21: klient z „Zadaniami” dalej dostaje 403 na „Biorę”).
- Macierz należy do `auth` (W2): inne serwisy jej nie czytają, mają ją w tokenie.
- Admin konta nie występuje w macierzy (widzi wszystko).
