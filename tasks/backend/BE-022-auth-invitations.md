---
id: BE-022
title: "auth: zaproszenia i dopasowanie po zalogowaniu"
area: backend
stage: 1
size: L
status: todo
depends_on: [BE-006, BE-008, BE-013, BE-019]
decisions: [DEC-10]
owner:
branch:
trello: https://trello.com/c/jxzWV7mn
---
# BE-022 · auth: zaproszenia i dopasowanie po zalogowaniu

## Cel
Admin zaprasza do stajni osobę (Klient z koniem, Obsługa, Instruktor) albo konto techniczne (Wyświetlacz, Tablet) SMS-em albo e-mailem. Zaproszenie dopasowuje się samo, gdy osoba zaloguje się zweryfikowanym kontaktem, bez ekranu „Przyjmij”: pierwszy token ma już stajnię (i konia klienta).

## Kontekst
- Stan kodu: tabela `invitations` (BE-004: `channel`, `target`, `display_name`, `locale`, `role`, `horse_id`, `expires_at`, `accepted_at`, `accepted_by`, `revoked_at`, `granted_via`, `granted_session_id`), polityka tras i `TenantScope` (BE-006), zdarzenia `invitation.created`/`invitation.accepted` (BE-008), repozytoria i claimy z bazy (BE-013). Krok MFA: `backend/src/services/auth/routes/login.ts` (`loginMfa`: upsert `users`, potem claimy), odświeżenie: `routes/session.ts`. Normalizacja kontaktu: `services/auth/contact.ts` (`normalizeLogin`: 9 cyfr → +48, e-mail małymi literami).
- Dokumenty: `docs/mikroserwisy.md` 2 (konto techniczne: rodzaj ustala pierwsze dopasowanie; zaproszenie technicznego tylko na świeże konto, inaczej `409 target_in_use`; cel będący kontem zespołu → 409), 3.1 krok MFA pkt 3 (dopasowanie w jednej transakcji), 3.2 (limity: 20 członkostw, 100 koni, 200 zaproszeń na firmę na dobę; nadmiar niedopasowany z alertem), 5.2 „Zaproszenia”, 9.2 pkt 8–10 (Paweł, Marek z Luną); `docs/development-szczegoly.md` 3.3 auth „Zaproszenia” i 4.2 „Zaproszenia” (formaty `+48 600…`, `600…`, `0048…`; e-mail bez wielkości liter; zaproszenie e-mailem nie daje dostępu osobie z tym samym numerem).
- Makiety: `PanelZaprosOsobe.dc.html` (Kanał SMS | E-mail, Język wiadomości PL | UA, Ważne do * · 7 dni, Imię, Rola: Klient, Obsługa, Instruktor, grupa „Konto techniczne”: Wyświetlacz, Tablet przy boksie), `Zaproszenie.dc.html` (apka: lista „Wysłane zaproszenia”, „wygasa za 2 dni”, „wygasło 08.10”, „Wyślij ponownie”; rola „Wsparcie IT” do usunięcia).
- Decyzje: DEC-10 (konto zespołu = konto z wierszem `platform_roles`).
- Dane demo: Marek Nowak (klient do Luny, zaproszenie SMS czeka; numer w seedzie, BE-032), wygasłe zaproszenie obsługi (+48 512 *** 908, wygasło 08.10; BE-011), Paweł (zaproszony SMS-em 01.10), „Tablety Pod Lipami” (boksy@stajnielipowe.pl).

## Zakres
- [ ] Kontrakty `contracts/auth.ts` (polityka: admin, `audit`): `GET /auth/v1/stables/{stableId}/invitations` (z `status`: `pending | accepted | expired | revoked`, zamaskowany cel), `POST …/invitations` (`{ channel, target, displayName, locale, role, horseId?, expiresAt? }`, 201), `POST …/invitations/{id}/resend` (nowe zaproszenie z nowym terminem, stare odwołane, 201), `POST …/invitations/{id}/revoke` (204).
- [ ] Walidacja: `target` znormalizowany (telefon E.164, e-mail małymi literami) i zgodny z `channel`; `horseId` wymagany dla `client` (koń tej stajni, nie `left`), zakazany dla innych ról; `expiresAt` domyślnie +7 dni, najwyżej +30 dni (propozycja); `role` tylko `client | staff | instructor | display | tablet` (np. `it_support` → 400).
- [ ] Konto techniczne: kontakt należący do istniejącego konta u dostawcy tożsamości albo w `users` → 409 `target_in_use`; cel będący kontem zespołu → 409 dla każdej roli. Limit 200 zaproszeń na firmę na dobę → 429 `rate_limited` z opisem.
- [ ] Zapis z audytem, `granted_via = platform` i `granted_session_id = sid` przy `plt`; po COMMIT `invitation.created` (kanał, adres, imię, język, rola, nazwa stajni, nazwa konia, termin).
- [ ] Dopasowanie (`invitations/match.ts`), wołane w kroku MFA (po upsercie `users`, w tej samej transakcji) i przy odświeżeniu: ważne zaproszenia na zweryfikowany telefon albo e-mail konta (kanał musi się zgadzać); osoba: nowe `stable_members` (rola z zaproszenia), klient: także `horse_access` (`valid_from = teraz`); konto techniczne: tylko świeże konto (pierwsze logowanie, brak członkostw) → `account_kind = technical`, `display_name` z zaproszenia; zaproszenie osoby nie pasuje do konta technicznego i odwrotnie; członkostwo z inną rolą w tej stajni → zaproszenie zostaje niedopasowane z logiem ostrzeżenia (propozycja); limity z 3.2. Zapis `accepted_at`, `accepted_by`; po COMMIT `invitation.accepted`.
- [ ] Ponowne dopasowanie tego samego zaproszenia nie tworzy drugiego członkostwa (warunek `accepted_at IS NULL` w `UPDATE`).
- [ ] Kod błędu `target_in_use` do `ERRORS`.
- [ ] `GET /me` (BE-019): `matchedInvitations` wypełnione zaproszeniami tej osoby z `accepted_at` w ostatnich 24 h (`stableId`, `stableName`, `role`, `horseName` dla klienta), z testem.

## Poza zakresem
- Treść i wysyłka zaproszenia (BE-036 przez `invitation.created`), wygasłe zaproszenia (BE-037), ekrany (WEB-006, MOB-010).

## Kryteria akceptacji
- [ ] Zaproszenie Marka (klient, Luna) i jego pierwsze logowanie hasłem i kodem: token ma Pod Lipami z `h` = Luna; `invitations.accepted_at` ustawione; `invitation.accepted` opublikowane.
- [ ] Formaty `+48 600 000 412`, `600000412`, `0048600000412` dopasowują to samo zaproszenie; e-mail wielkimi literami też.
- [ ] Zaproszenie e-mailem nie daje dostępu osobie, która ma ten sam numer, ale inny e-mail; wygasłe i odwołane się nie dopasowują.
- [ ] Zaproszenie „Tablety” na adres Damiana: 409 `target_in_use`; na świeże boksy@…: po pierwszym logowaniu konto `technical` z jednym `m` (`tablet`).
- [ ] Ola zaproszona do Brzozowej jako zalogowana: Brzozowa pojawia się w tokenie przy najbliższym odświeżeniu, bez ponownego logowania.
- [ ] Marek Nowak po pierwszym logowaniu z ważnym zaproszeniem do Luny: `GET /me` ma w `matchedInvitations` Stajnię Pod Lipami z rolą `client` i `horseName` „Luna”; po 24 h lista jest pusta.

## Testy
- `backend/src/services/auth/invitations.test.ts` na harnessie (FAKE IdP, fabryki): tworzenie i walidacja, `target_in_use`, dopasowanie w MFA i przy odświeżeniu, formaty numerów, limity, równoległe dopasowanie. `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` (z `openapi:check`) i `npm run build` zielone; `cd frontend && npm run gen:api`; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Dopasowanie tylko do kontaktu zweryfikowanego w ZITADEL (wartość z dostawcy, nie z żądania). Niepotwierdzone konto nie ma wiersza `users`, więc niczego nie dopasuje.
- Uprawnienia admina sprawdzaj w bazie w tej samej transakcji (`business_admins`), nie tylko w tokenie (1.1).
- `invitations.target` to dana prywatna `auth`: nie wychodzi w zdarzeniach poza `invitation.created` (adres do wysyłki).
