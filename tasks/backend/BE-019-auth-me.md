---
id: BE-019
title: "auth: GET /me, profil podstawowy i widok startowy"
area: backend
stage: 1
size: M
status: todo
depends_on: [BE-013]
decisions: [DEC-15]
owner:
branch:
trello:
---
# BE-019 · auth: GET /me, profil podstawowy i widok startowy

## Cel
Aplikacje po zalogowaniu wiedzą z jednego wywołania, kim jest osoba, w jakich stajniach i z jaką rolą, jakie funkcje widzi, czy jest adminem firmy i od którego ekranu zacząć. Osoba zmienia imię i język i może wylogować się ze wszystkich urządzeń.

## Kontekst
- Stan kodu: `GET /auth/v1/me` w `backend/src/contracts/auth.ts` (`MeResponse`: `id`, `displayName`, `locale`, `contact` z maskami, `businesses`, `startView` tylko `welcome`) i `backend/src/services/auth/routes/me.ts`; maski w `services/auth/contact.ts`. Claimy i dostęp z bazy: BE-013 (`pg-access.ts`). Panel wybiera ekran w `frontend/web/src/session/home.ts` (dziś zawsze `/welcome`).
- Dokumenty: `docs/mikroserwisy.md` 5.2 „Profil” (`GET /me`: stajnie z nazwą, rolą, funkcjami i statusem, firmy admina, `plt`, widok startowy, świeżo dopasowane zaproszenia; `PATCH /me` imię i język; `POST /me/sign-out-everywhere`), 3.7 (nagłówek `Equenor-Token-Refresh: required`; powrót apki na pierwszy plan = odświeżenie i `GET /me`), 9.1 (Ola: `startView = staff_day`), 9.2 (bez firmy i stajni: `welcome`), 9.4 (TV: widok tablicy).
- Decyzje: DEC-15 wariant A (admin w apce: Dziś | Boksy | Zadania | Ludzie | Profil; panel tylko dla admina i wyświetlacza, inni widzą PanelWitaj z linkiem do apki).
- Dane demo: Damian (admin, 2 stajnie z `biz`), Ola (staff w 2 stajniach), Anna (client), Marta (instructor), „Telewizor korytarz” (display), „Tablety Pod Lipami” (tablet), osoba bez stajni (po rejestracji).

## Zakres
- [ ] `MeResponse` rozszerzony addytywnie: `stables: [{ id, name, businessId, role: 'admin' | 'staff' | 'instructor' | 'client' | 'display' | 'tablet', features: Feature[] | null (admin: null = wszystko), status: 'active' | 'suspended' }]` (stajnie firm z `biz` + członkostwa), `businesses: [{ id, name }]`, `platformRole`, `accountKind`, `startView`, `matchedInvitations: [{ stableId, stableName, role, horseName? }]` (przyjęte w ostatnich 24 h; wypełni się po BE-022).
- [ ] `startView` według konta i `client_id` (DEC-15): `tablet` (konto tabletu), `display` (konto wyświetlacza, `web`), `admin_today` (admin firmy albo `plt`), `staff_day`, `client_home`, `instructor` (rola w ostatnio używanej albo pierwszej stajni), `welcome` (brak firmy i stajni). Na `web` osoba bez roli admina dostaje `welcome` (PanelWitaj z linkiem do apki).
- [ ] Nazwy stajni i firm czytane z `stables` i `businesses` (dane zasobu, nie autoryzacja); stajnie i role z bazy w tej samej chwili co claimy. Gdy wynik różni się od claimów tokenu (nowa stajnia, dopasowane zaproszenie, odebrany dostęp), odpowiedź ma nagłówek `Equenor-Token-Refresh: required`.
- [ ] `PATCH /auth/v1/me` (`{ displayName?, locale? }`, 200 z nowym profilem): osoby i admin globalny; konto techniczne 403 `forbidden_role`; `unitOfWork` z audytem; bez wołania ZITADEL.
- [ ] `POST /auth/v1/me/sign-out-everywhere` (204): `token_version + 1` z audytem; tablety i TV (inne konta) bez zmian; bieżący access token działa do `exp`.
- [ ] Kontrakty z polityką (BE-006, jeśli już jest: `audit`, bez `stable`), `npm run openapi`.

## Poza zakresem
- `DELETE /me/memberships/{stableId}` („Opuść stajnię”) przeniesione do BE-023 (wspólna logika usuwania członkostwa i zdarzenie `member.removed`).
- Kanał kodu, kontakt, hasło, usunięcie konta (BE-020); routing w aplikacjach (WEB-001, MOB-005).

## Kryteria akceptacji
- [ ] Damian (`web`): `startView = admin_today`, `stables` z Pod Lipami i Brzozową z rolą `admin`, `features = null`; Ola (`mobile`): `staff_day`, dwie stajnie, w Brzozowej bez `tasks` i `rides`; TV (`web`): `display`; tablet (`tablet`): `tablet`; nowa osoba: `welcome`.
- [ ] Ola na `web`: `welcome` (panel dla innych ról niż admin i wyświetlacz pokazuje PanelWitaj).
- [ ] Po dodaniu Oli do stajni w bazie `GET /me` starym tokenem zwraca nagłówek `Equenor-Token-Refresh: required`.
- [ ] `PATCH /me` z `locale: 'uk'` zmienia język kodów przy następnym logowaniu; `sign-out-everywhere` sprawia, że stary refresh token daje `401 session_revoked`.

## Testy
- `app.test.ts` (albo `routes/me.test.ts`) na harnessie bazy z fabrykami/seedem: widoki startowe dla każdej persony, nagłówek odświeżenia, PATCH z audytem, wylogowanie wszędzie. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; `cd frontend && npm run gen:api` i `npm run check` (nowe pola są addytywne); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Token nie niesie nazw ani danych osobowych; to robi `GET /me`. Aplikacje nie dekodują tokenu.
- Nowe wartości `startView` dochodzą addytywnie; klienci mapują nieznaną na `welcome` (komentarz w `home.ts`).
- Zmiana względem listy: „Opuść stajnię” przeniesione do BE-023.
