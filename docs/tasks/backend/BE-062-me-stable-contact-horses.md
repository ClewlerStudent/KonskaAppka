---
id: BE-062
title: "auth: GET /me z telefonem stajni i końmi klienta"
area: backend
stage: 2
size: S
status: todo
depends_on: [BE-019, BE-032, BE-003]
decisions: [DEC-15]
owner:
branch:
trello: https://trello.com/c/Ei8QmwEX
---
# BE-062 · auth: GET /me z telefonem stajni i końmi klienta

## Cel
Apka ma numer do przycisku „Zadzwoń do stajni” (SzybkaFlagaNieWyslano, StatusFlagi, StajniaZawieszona) i nazwy koni klienta do przełącznika stajni („Klient · Kasztan, Bella”). Oba pola dochodzą addytywnie do `GET /auth/v1/me`, więc apka nie potrzebuje nowych wywołań.

## Kontekst
- **Stan kodu:** `GET /auth/v1/me` z `stables[]` (`id`, `name`, `businessId`, `role`, `features`, `status`) robi BE-019 (`backend/src/contracts/auth.ts`, `backend/src/services/auth/routes/me.ts`). Tabele: `business_admins`, `users.phone_e164` (prywatne `auth`, BE-001), `stables.business_id` i `horses.name` (tabele `stables`, widoczność `shared`, BE-003/BE-004), `horse_access` (prywatna `auth`), claim `m[].h` (BE-013). Dane demo koni i dostępów: BE-032.
- **Dokumenty:** docs/makiety-plan.md 5 pkt 25 („Numer dla »Zadzwoń do stajni«: `stables` nie ma telefonu; rekomendacja: numer pierwszego aktywnego admina na PoC”), A „StajniaZawieszona”, D „SzybkaFlagaNieWyslano” (`tel:`), docs/makiety-plan.md 5 pkt 21 (przełącznik stajni z rolą i końmi); docs/mikroserwisy.md 5.2 „Profil”, 8 (obsługa widzi same imiona, bez telefonów klientów; ten numer to kontakt do stajni, nie do klienta), 10.2 pkt 22 (luka „telefon stajni”).
- **Decyzje:** DEC-15 A („Zadzwoń do stajni” = telefon pierwszego aktywnego admina firmy, do której należy stajnia).
- **Dane demo:** Stajnia Pod Lipami i Brzozowa (firma Stajnie Lipowe, admin Damian z telefonem w seedzie); Anna (klientka Kasztana i Belli w Pod Lipami), Marek (zaproszony do Luny, bez przyjęcia), Ola (obsługa, bez koni).

## Zakres
- [ ] `MeResponse.stables[]` dostaje addytywnie:
  - `contactPhone: string | null` (E.164) dla ról `client`, `staff`, `instructor` i `admin`; dla `display` i `tablet` zawsze `null` (TV i tablet nie dzwonią, a ekran TV jest publiczny);
  - `horses: [{ id, name }]` tylko dla roli `client`: konie z ważnym `horse_access` (te same, które trafiają do `m[].h`), posortowane po nazwie; dla innych ról pusta lista.
- [ ] Numer: pierwszy aktywny admin firmy stajni (`business_admins` po `created_at`, potem `user_id`), konto nieusunięte i z `phone_e164`; gdy żaden admin nie ma telefonu, `null`. Jedno zapytanie dla wszystkich stajni odpowiedzi (bez N+1).
- [ ] Nazwy koni czytane z `horses` (tabela `stables`, `shared`) w tej samej chwili co `horse_access`; koń `left` nie wraca.
- [ ] Kontrakt i `npm run openapi`; opis pól w schemacie zod (`describe`), żeby `gen:api` dał komentarze w typach apki.

## Poza zakresem
- Kolumna `stables.phone` ani ustawienie „telefon stajni” w panelu (DEC-15, wariant na później).
- Ekrany apki (MOB-005 przełącznik, MOB-013 i MOB-014 „Zadzwoń do stajni”, MOB-023 StajniaZawieszona).

## Kryteria akceptacji
- [ ] Anna (`mobile`): w Pod Lipami `horses = [Bella, Kasztan]` i `contactPhone` = telefon Damiana; po odebraniu dostępu do Belli (`valid_to` w przeszłości) Bella znika z `horses`.
- [ ] Ola: `horses = []`, `contactPhone` ustawiony w obu stajniach.
- [ ] Konto „Telewizor korytarz” (`web`): `contactPhone = null`, `horses = []`.
- [ ] Usunięcie telefonu Damiana (albo usunięcie jego konta) daje numer kolejnego aktywnego admina albo `null`.

## Testy
- Vitest na harnessie bazy (BE-001/BE-010) z seedem: przypadki z kryteriów, test braku N+1 (liczba zapytań przy 2 stajniach i 5 koniach stała). `cd backend && npm test`.

## Definicja gotowości
- `cd backend && npm run check` i `npm run build` zielone; `npm run gen:api` we `frontend/` (i w `mobile/`, jeśli już istnieje) bez błędów typów; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Numer admina to dane osobowe: tylko w `GET /me` osoby, która jest członkiem stajni; nie loguj go (redakcja pino obejmuje `phone`).
- Nie dodawaj nazw koni do tokenu (budżet 4 KB, token bez danych osobowych i nazw).
- Zadanie dopisane przy domykaniu kolejki (luki zgłoszone w MOB-005, MOB-013, MOB-014, MOB-023).
