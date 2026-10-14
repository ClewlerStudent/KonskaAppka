---
id: WEB-003
title: PanelRejestracjaFirmy
area: web
stage: 1
size: M
status: todo
depends_on: [BE-021, WEB-001]
decisions: [DEC-04]
owner:
branch:
trello:
---
# WEB-003 · PanelRejestracjaFirmy

## Cel
Właściciel stajni po pierwszym logowaniu zakłada konto firmy: NIP, nazwa, siedziba i e-mail do faktur. Zostaje adminem konta i przechodzi prosto do zakładania pierwszej stajni. NIP podaje się tylko tutaj.

## Kontekst
- **Stan kodu:** zaślepka `BusinessNewScreen` w `frontend/web/src/screens/PlaceholderScreens.tsx` (trasa `/business/new`), przycisk „Załóż konto firmy” w `screens/WelcomeScreen.tsx`; komponenty `AppLayout`, `TextField`, `Button`, `Notice`; `session.refreshNow()`, `createServiceClient`, `newId()` z WEB-001.
- **Dokumenty:** docs/mikroserwisy.md 5.2 „Konto firmy”, 9.2 pkt 5 (registry → `POST /businesses` z `Idempotency-Key` → 201 z `Equenor-Token-Refresh: required` → odświeżenie, token ma `biz`). BE-021: `GET /auth/v1/business-registry/{taxId}` (200 `{ name, address }` albo 404; podpowiedź, nie weryfikacja), `POST /auth/v1/businesses` (`422 invalid_tax_id`, `409 tax_id_taken`, `409 id_conflict`; `Idempotency-Key` = UUIDv7 = `businesses.id`), `GET`/`PATCH /auth/v1/businesses/{businessId}` (NIP niezmienny). docs/development-szczegoly.md 3.5.3 „Konto firmy i zakładanie stajni”, 5 pkt 52 (NIP bez weryfikacji w rejestrach).
- **Makiety:** mockups/project/PanelRejestracjaFirmy.dc.html: nagłówek „Konto firmy · EQUENOR · D Damian” bez menu; H1 „Załóż konto firmy”; „NIP *” z „Pobierz dane z rejestru”; komunikat „Nazwa i adres pobrane z rejestru”; „Nazwa firmy *”; „Adres siedziby”: „Ulica i numer *”, „Kod pocztowy *”, „Miejscowość *”; „E-mail do faktur *”; „Anuluj”, „Załóż konto firmy”. makiety-plan.md B „PanelRejestracjaFirmy” (stany: „Ten NIP ma już konto w EQUENOR” tylko jako błąd, zły NIP, „Zapisuję…”). PanelMenuKonta (pozycja „Konto firmy”: NIP i siedziba do odczytu).
- **Decyzje:** DEC-04 A (`businesses` i `business_admins` w `auth`, jedna transakcja).
- **Dane demo:** Damian, „Stajnie Lipowe sp. z o.o.”, NIP 123-456-32-18 (fikcyjny, z poprawną sumą kontrolną), ul. Lipowa 12, 05-520 Konstancin-Jeziorna. Fałszywy rejestr BE-021 zna NIP 1234563218.

## Zakres
- [ ] `web/src/features/business/BusinessSignUpScreen.tsx` na `/business/new` (tylko zalogowana osoba bez firmy; konto z firmą przekierowane na `homePath`).
- [ ] Walidacja NIP po stronie klienta (wspólna funkcja `frontend/src/lib/nip.ts`): usunięcie kresek i spacji, 10 cyfr, suma kontrolna (wagi 6, 5, 7, 2, 3, 4, 5, 6, 7, mod 11) → „Nieprawidłowy NIP” (propozycja); kod pocztowy `NN-NNN`; e-mail.
- [ ] „Pobierz dane z rejestru”: `GET …/business-registry/{taxId}`, wypełnia nazwę i adres, pokazuje „Nazwa i adres pobrane z rejestru”; 404 → „Nie znaleziono firmy w rejestrze” (propozycja), pola zostają do wpisania ręcznie.
- [ ] Zapis: `Idempotency-Key` nadany raz na formularz (`newId()`), przycisk „Zapisuję…”; ponowienie po błędzie sieci tym samym kluczem. `409 tax_id_taken` → błąd przy polu NIP „Ten NIP ma już konto w EQUENOR”; `422 invalid_tax_id` → „Nieprawidłowy NIP”; `403 forbidden_role` (konto techniczne) → komunikat ogólny.
- [ ] Po 201: `session.refreshNow()` (nagłówek z odpowiedzi obsługuje middleware WEB-001), nowe `GET /me`, przejście na `/stables/new` (PanelZalozStajnie, do czasu WEB-009 zaślepka).
- [ ] `/business` „Konto firmy” (do odczytu, `GET /auth/v1/businesses/{businessId}`): nazwa, NIP w formacie 123-456-32-18, siedziba, e-mail do faktur; cel pozycji „Konto firmy” w PanelMenuKonta (WEB-004). Edycja poza PoC.
- [ ] „Anuluj” wraca do PanelWitaj.

## Poza zakresem
- Zakładanie stajni (WEB-009); kolejny admin konta i przejęcie NIP-u (zespół EQUENOR, WEB-026); dane do faktury w płatnościach (WEB-024).

## Kryteria akceptacji
- [ ] A-22: Damian z PanelWitaj zakłada „Stajnie Lipowe sp. z o.o.” z NIP 123-456-32-18; po zapisie bez ponownego logowania trafia do zakładania stajni, a `GET /me` ma firmę.
- [ ] Ten sam NIP drugi raz (także „1234563218”): „Ten NIP ma już konto w EQUENOR”, nic się nie zapisuje.
- [ ] NIP z błędną cyfrą kontrolną blokuje zapis bez wywołania API.
- [ ] Podwójne kliknięcie „Załóż konto firmy” albo ponowienie po zerwanym połączeniu nie tworzy drugiej firmy (ten sam `Idempotency-Key`).
- [ ] Bez dopisków o NIP-ie i koncie (docs/makiety-plan.md 2.3 i 5 pkt 38); układ 1440 i 390 px bez poziomego przewijania.

## Testy
- Vitest: `nip.test.ts` (sumy kontrolne, normalizacja), testy ekranu przez `renderApp` z fałszywym API (rejestr 200/404, 409, 422, sukces → odświeżenie i nawigacja).
- Playwright: atrapa w `e2e/panel.spec.ts` (PanelWitaj → PanelRejestracjaFirmy → zaślepka stajni), z prawdziwym `auth` w `e2e/auth.spec.ts` po BE-021.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-021; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Napis przycisku z makiety („Załóż konto firmy”); makiety-plan wspomina „Dalej: załóż stajnię” — obowiązuje plik makiety.
- Jedyny tekst o NIP-ie w UI to błąd „Ten NIP ma już konto w EQUENOR” (makiety-plan.md 2.3).
- Kolory tylko ze zmiennych `--eq-*` (`src/theme`), test `no-color-literals`.
