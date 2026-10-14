---
id: BE-021
title: "auth: konto firmy z NIP"
area: backend
stage: 1
size: M
status: todo
depends_on: [BE-005, BE-013]
decisions: [DEC-04, DEC-27]
owner:
branch:
trello: https://trello.com/c/nWMwX0aP
---
# BE-021 · auth: konto firmy z NIP

## Cel
Osoba po pierwszym logowaniu zakłada konto firmy (B2B, NIP podawany raz) i od razu zostaje jego adminem; potem zakłada stajnie bez ponownego pytania o NIP. Jeden NIP = jedno konto w EQUENOR.

## Kontekst
- Stan kodu: tabele `businesses` (`tax_id` UK) i `business_admins` (BE-001), `unitOfWork` z audytem (BE-005), claim `biz` z `business_admins` (BE-013). Panel ma zaślepkę `/business/new` (WEB-003). Brak tras.
- Dokumenty: `docs/mikroserwisy.md` 5.2 „Konto firmy” (`GET /business-registry/{taxId}` jako podpowiedź, nie weryfikacja; `POST /businesses` z `409 tax_id_taken` i `Equenor-Token-Refresh: required`; `GET`, `PATCH /businesses/{b}`, NIP-u nie da się zmienić; konto techniczne 403), 9.2 pkt 4–5 (przepływ Damiana); `docs/development-szczegoly.md` 3.3 auth „Konto firmy” (normalizacja do 10 cyfr, suma kontrolna, 409 także równolegle, nic nie zapisuje), 3.3 stables „Testy” (NIP z kreskami i bez to ten sam, zła suma 422); `docs/erd.md` pkt 15.
- Makiety: `docs/mockups/project/PanelRejestracjaFirmy.dc.html` (NIP *, „Pobierz dane z rejestru”, „Nazwa i adres pobrane z rejestru”, Nazwa firmy *, Ulica i numer *, Kod pocztowy *, Miejscowość *, E-mail do faktur *, „Załóż konto firmy”), komunikat „Ten NIP ma już konto w EQUENOR”.
- Scenariusz: A-22 (Stajnie Lipowe sp. z o.o., NIP 123-456-32-18, ul. Lipowa 12, 05-520 Konstancin-Jeziorna; druga osoba z „1234563218” dostaje 409, nic się nie zapisuje).
- Decyzje: DEC-04 wariant A (`businesses` i `business_admins` w `auth`, jedna transakcja).

## Zakres
- [ ] Kontrakty `contracts/auth.ts` z polityką (BE-006, jeśli jest): `GET /auth/v1/business-registry/{taxId}` (osoba; limit po użytkowniku; 200 `{ name, address }` albo 404), `POST /auth/v1/businesses` (osoba; 201 `{ business }` + nagłówek `Equenor-Token-Refresh: required`), `GET` i `PATCH /auth/v1/businesses/{businessId}` (admin firmy z `biz` albo `plt = admin`, `If-Match`).
- [ ] NIP: normalizacja (usunięcie kresek i spacji, 10 cyfr), suma kontrolna (wagi 6, 5, 7, 2, 3, 4, 5, 6, 7, mod 11) → 422 `invalid_tax_id`; zajęty NIP → 409 `tax_id_taken` (także przy wyścigu: błąd unikalności indeksu mapowany na 409, bez częściowego zapisu).
- [ ] Jedna transakcja: `businesses` (adres, `country_code = PL`, `invoice_email`), `business_admins` (`granted_via = business`, przy `plt`: `platform` + `granted_session_id = sid`), audyt (`action = business_created`).
- [ ] Idempotencja (propozycja, bez nowych tabel): nagłówek `Idempotency-Key` (UUIDv7 od klienta) staje się `businesses.id`; powtórzenie z tym samym kluczem i tymi samymi danymi daje 201 z tym samym wynikiem, z innymi danymi 409 `id_conflict`.
- [ ] Adapter rejestru `BusinessRegistry` z implementacją fałszywą (fixture: 1234563218 → Stajnie Lipowe sp. z o.o., ul. Lipowa 12, 05-520 Konstancin-Jeziorna); prawdziwy rejestr (np. REGON/biała lista VAT) poza zakresem.
- [ ] Konto techniczne i konto zespołu: `POST /businesses` → 403 `forbidden_role`. `PATCH` z polem `taxId` → 422 (NIP niezmienny).
- [ ] Kody błędów do `ERRORS`: `invalid_tax_id` (422), `tax_id_taken` (409), `id_conflict` (409).

## Poza zakresem
- Kolejny admin konta i przejęcie NIP-u przez admina globalnego (BE-026); zakładanie stajni (BE-029); ekran (WEB-003).

## Kryteria akceptacji
- [ ] A-22: Damian zakłada firmę z „123-456-32-18”; w bazie `tax_id = 1234563218`, Damian w `business_admins`, wpis audytu; odpowiedź ma `Equenor-Token-Refresh: required`, a odświeżony token ma `biz` z tą firmą.
- [ ] Druga osoba z „1234563218”: 409 `tax_id_taken`, nic się nie zapisuje; dwa równoległe żądania z tym samym NIP dają jedno konto i jedno 409.
- [ ] NIP z błędną sumą: 422 `invalid_tax_id`; „Tablety Pod Lipami”: 403.
- [ ] Admin Olszynki na `GET /businesses/{lipowe}`: 404; Kuba (`ops`): 200.

## Testy
- `backend/src/services/auth/businesses.test.ts` na harnessie: normalizacja i suma (tablica przypadków), równoległość (dwie transakcje), idempotencja, uprawnienia. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; `cd frontend && npm run gen:api`; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- NIP-u nie weryfikujemy w rejestrze (arkusz Q.4): rejestr tylko podpowiada nazwę i adres.
- Uprawnienie do `PATCH` sprawdzaj w bazie w tej samej transakcji (`business_admins`), nie tylko w tokenie (mikroserwisy.md 1.1).
- Kopia NIP-u do `billing_accounts` powstaje przy zakładaniu stajni w `billing` (BE-052), nie tutaj.
