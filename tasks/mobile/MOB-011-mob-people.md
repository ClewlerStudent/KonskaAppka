---
id: MOB-011
title: LudzieAdmin w apce
area: mobile
stage: 2
size: S
status: todo
depends_on: [BE-022, BE-023, BE-024, MOB-005, MOB-010]
decisions: [DEC-15]
owner:
branch:
trello:
---
# MOB-011 · LudzieAdmin w apce

## Cel
Admin w zakładce Ludzie widzi członków wybranej stajni (obsługa, klienci z końmi, instruktorzy, konta techniczne) i zaproszenia, zmienia rolę osoby, usuwa ją ze stajni i zaprasza nową. Zarządzanie kontami technicznymi (blokada, „Wyloguj wszystkie tablety”) zostaje w panelu.

## Kontekst
- Stan kodu: pasek admina z pozycją Ludzie (MOB-005, trasa `mobile/app/(app)/(admin)/people.tsx`), `InvitationList` i ekran zaproszenia (MOB-010), komponenty `FilterChips`, `SearchField` (MOB-009). Trasy `auth`: `GET /auth/v1/stables/{stableId}/members?role=&technical=` (imię, rola, aktywność, konie klienta, telefon osoby dla admina, konta techniczne zamaskowane, `grantedVia`), `PATCH …/members/{memberId}` (`{ role?: staff | instructor | client, active? }`, `If-Match`, tylko osoby), `DELETE …/members/{memberId}` („Usuń ze stajni”, `member.removed`) — BE-023; `GET …/horse-clients` — BE-024; `GET …/invitations` — BE-022.
- Dokumenty: `docs/makiety-plan.md` A „LudzieAdmin” (H1 „Ludzie”, „+ Zaproś osobę”, chipy Wszyscy · Obsługa · Klienci · Inne; grupy jak PanelLudzie; konta techniczne „Telewizor korytarz · konto techniczne · Wyświetlacz”, „Tablety Pod Lipami · konto techniczne · Tablet” bez akcji, bo zarządza nimi panel; „Zaproszenia”), B „PanelLudzie” (wiersze: Damian · Admin konta (wszystkie stajnie); Ola, Piotr · Obsługa; Anna · Klient · Kasztan, Bella; Karolina W. · Iskra; Tomasz L. · Grom; Ewa K. · Sonata; Marta · Instruktor; akcje „Zmień rolę”, „Dezaktywuj”), dec. 33 („Zmień rolę” tylko w obrębie Obsługa, Instruktor, Klient; konta techniczne roli nie zmieniają; admin to rola konta firmy). `docs/mikroserwisy.md` 9.5 (Ola traci Brzozową: do 5 min), 9.6 (dostęp „nadane przez zespół EQUENOR”).
- Decyzje: DEC-15 wariant A (Ludzie w pasku admina apki).
- Makiety: brak pliku `.dc.html` (P2); układ jak `mockups/project/PanelLudzieWyswietlacze.dc.html` w wersji 390 px.
- Dane demo: Damian w Pod Lipami i Brzozowej; konta techniczne „Telewizor korytarz” i „Tablety Pod Lipami”; zaproszenia Marka Nowaka i +48 512 *** 908.

## Zakres
- [ ] `mobile/app/(app)/(admin)/people.tsx`: H1 „Ludzie”, „+ Zaproś osobę” (→ `/invite`, MOB-010), chipy Wszyscy · Obsługa · Klienci · Inne (Instruktor i konta techniczne w „Inne”), wyszukiwarka po imieniu; grupy: admin konta (tylko informacyjnie, „wszystkie stajnie”), Obsługa, Klienci (z końmi z `members` albo `horse-clients`), Instruktorzy, Konta techniczne (bez akcji).
- [ ] Wiersz osoby: imię, rola, konie klienta, telefon jako akcja `tel:` (tylko gdy API go podaje), oznaczenie „nadane przez zespół EQUENOR” przy `grantedVia = platform`, status nieaktywny.
- [ ] Akcje osoby (arkusz): „Zmień rolę” (Obsługa | Instruktor | Klient, `PATCH` z `If-Match`; 412 → odświeżenie), „Usuń ze stajni” (dialog ze skutkiem „Ola straci dostęp do Stajni Brzozowej.” → `DELETE`); bez akcji przy adminie konta i kontach technicznych.
- [ ] Sekcja „Zaproszenia” z `InvitationList` (MOB-010).
- [ ] Odświeżanie listy przy wejściu na ekran i przez `use-polled-query` (MOB-007).

## Poza zakresem
- Blokada i odblokowanie kont technicznych, „Wyloguj wszystkie tablety”, dostęp klienta do koni z `valid_to`, przypisanie osoby z firmy do kolejnej stajni (panel: WEB-005).
- Zaproszenie kont technicznych (WEB-006).

## Kryteria akceptacji
- [ ] Damian w Pod Lipami widzi grupy z danymi demo (Ola, Piotr; Anna z Kasztanem i Bellą; Karolina W., Tomasz L., Ewa K.; Marta; dwa konta techniczne bez akcji) i zaproszenia Marka i Bartka.
- [ ] Zmiana roli Marty na Obsługę zapisuje się i jest widoczna po odświeżeniu; jednoczesna zmiana z panelu daje komunikat i odświeżenie (412).
- [ ] „Usuń ze stajni” przy Oli w Brzozowej usuwa ją z listy; Ola po ≤ 5 min nie ma Brzozowej w przełączniku (MOB-005).
- [ ] Ekran nie ma akcji blokady ani wylogowania tabletów.

## Testy
- Jest + RNTL: `people.test.tsx` (grupy, filtry, akcje dostępne per typ konta, 412) na atrapie `auth`.
- Maestro: `mobile/e2e/maestro/admin-people.yaml` (zmiana roli i usunięcie ze stajni na seedzie).

## Definicja gotowości
- `npm run check` w `mobile/` zielone; flow Maestro przechodzi; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Kontakty zawsze zamaskowane poza telefonem osoby, który `auth` daje adminowi.
- Zmiana względem listy: zgodnie z docs/makiety-plan.md (LudzieAdmin: „konta techniczne bez akcji (zarządza nimi panel)”) blokada kont technicznych i „Wyloguj wszystkie tablety” zostają w panelu (WEB-005), a nie w apce; dodane zależności BE-022 (lista zaproszeń) i MOB-010 (wspólna lista zaproszeń i ekran „Zaproś osobę”). Jeśli właściciel chce tych akcji w apce, to osobne małe zadanie na trasach `…/members/{id}/block|unblock|sign-out` z BE-023.
