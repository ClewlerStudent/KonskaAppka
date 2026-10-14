---
id: MOB-010
title: "Admin w apce: zaproszenie osoby i przeniesienie konia"
area: mobile
stage: 2
size: M
status: todo
depends_on: [BE-022, BE-032, MOB-009]
decisions: []
needs: [emulator]
owner:
branch:
trello: https://trello.com/c/cWEi6L9X
---
# MOB-010 · Admin w apce: zaproszenie osoby i przeniesienie konia

## Cel
Admin z telefonu zaprasza klienta (z koniem), obsługę albo instruktora SMS-em lub e-mailem, widzi wysłane zaproszenia i ponawia wygasłe. Z listy boksów przypisuje konia do wolnego boksu, przenosi go albo zamienia z innym, a konflikty pokazują się jasno.

## Kontekst
- Stan kodu: BoksyAdmin, BoksSzczegoly i komponenty `BoxRow`, `HallSection` (MOB-009), `SegmentedControl` (MOB-003), `boxLabel` (MOB-007). Trasy `auth` (BE-022): `GET /auth/v1/stables/{stableId}/invitations` (status `pending | accepted | expired | revoked`, zamaskowany cel), `POST …/invitations` (`{ channel, target, displayName, locale, role, horseId?, expiresAt? }`, 201; `horseId` wymagany dla `client`), `POST …/invitations/{id}/resend` (nowe zaproszenie), `POST …/invitations/{id}/revoke`; błędy `422`, `429 rate_limited`. Trasy `stables` (BE-032): `POST /stables/v1/stables/{stableId}/horses/{horseId}/box` (`{ boxId }`; `409 box_occupied`, także przy wyścigu; koń `left` 409), `POST …/horses/swap` (`{ horseIdA, horseIdB }`). Lista koni z boksami: `GET /board/v1/stables/{stableId}/boxes-overview` (BE-033).
- Dokumenty: `docs/development-szczegoly.md` 3.5.1 („Zaproszenie: role Klient (z wyborem konia), Obsługa, Instruktor; bez Wsparcia IT; kanał „SMS | E-mail””), `docs/makiety-plan.md` A „ZaproszenieObsluga” (toast „Wysłano nowe zaproszenie SMS · ważne do wt 20.10”; „Wysłane zaproszenia”: „+48 512 *** 908 · Obsługa · czeka · ważne do 20.10” z „Odwołaj”, „wygasło 08.10 · wysłano nowe”, „Marek Nowak · Klient · Luna · wygasa za 2 dni”; stany: odwołane, „przyjęte 13.10 07:24 · Bartek”, błąd wysyłki), G „PrzeniesKonia” (mobilna wersja PanelPrzeniesKonia w arkuszu nad BoksyAdmin), B „PanelPrzeniesKonia” (wolne boksy z halą „Hala główna · boks 3”, „Hala nowa · boks 6”, „Zamień z…”; stany: 409 przy wyścigu, „Przypisz konia” do wolnego boksu, „Przypisz boks” Luny), docs/makiety-plan.md 5 pkt 6 (pole „Imię” zaproszonej osoby), docs/makiety-plan.md 5 pkt 8 (język wiadomości, domyślnie PL). A-04, A-06 (test słownika ról: bez Wsparcia IT). `docs/mikroserwisy.md` 9.2 pkt 8–10.
- Makiety: `docs/mockups/project/Zaproszenie.dc.html` („Kanał: SMS | E-mail”, „Numer telefonu”, „Rola: Klient | Obsługa | Instruktor”, „Koń”: „Luna · bez boksu”, „Kasztan · główna, boks 7”, „Ważne do”, „Wyślij zaproszenie”, „Wysłane zaproszenia”, „Wyślij ponownie”); rola „Wsparcie IT” i dopiski („Klient widzi konia…”, „Domyślnie 7 dni…”) znikają (docs/makiety-plan.md 5 pkt 19 i 38).
- Decyzje: brak nowych.
- Dane demo: Damian; Marek Nowak (zaproszenie do Luny, wygasa 15.10), +48 512 *** 908 (Bartek, zaproszenie obsługi wygasło 08.10), Luna bez boksu, wolne HG 3 i HN 6.

## Zakres
- [ ] `mobile/app/(app)/invite.tsx` (Zaproszenie): kanał, telefon (+48, normalizacja z MOB-003) albo e-mail, „Imię”, rola (Klient | Obsługa | Instruktor), „Koń” tylko dla Klienta (konie stajni z `boxLabel`, także „bez boksu”), „Ważne do” (domyślnie +7 dni, wybór daty do +30), „Język wiadomości” (Polski | Українська | English), „Wyślij zaproszenie” → `POST …/invitations`; toast „Wysłano zaproszenie SMS · ważne do wt 20.10”.
- [ ] `mobile/src/features/invitations/InvitationList.tsx` (używa też MOB-011 i MOB-020): wiersze „cel albo imię · rola · koń · status” („czeka · ważne do 20.10”, „wygasa za 2 dni”, „wygasło 08.10 · wysłano nowe”, „przyjęte 13.10 07:24 · Bartek”, „odwołane”), akcje „Odwołaj” (dialog bez dopisków → `revoke`) i „Wyślij ponownie” (→ `resend`).
- [ ] `mobile/app/(app)/move-horse.tsx` (PrzeniesKonia, arkusz nad BoksyAdmin) w trzech wejściach: „Przenieś” (koń w boksie → lista wolnych boksów z halą i „Zamień z…” → lista koni), „Przypisz konia” (wolny boks → lista koni bez boksu), „Przypisz boks” (koń bez boksu → wolne boksy); zapis po `boxId` / `horseId`; po sukcesie powrót i odświeżenie `boxes-overview`.
- [ ] Konflikty: `409 box_occupied` → „Boks jest już zajęty.” i odświeżenie listy wolnych boksów; koń `left` → „Koń wyjechał ze stajni.”; 404 → odświeżenie listy.
- [ ] Wejścia z MOB-009: „Przenieś”, „Przypisz konia”, „Przypisz boks”, „Przypisz konia” w BoksSzczegoly; wejście „+ Zaproś osobę” dla MOB-011.

## Poza zakresem
- Wyjazd konia ze stajni, dodanie konia, zaproszenia kont technicznych (Wyświetlacz, Tablet) — tylko panel (WEB-006, WEB-013).
- Lista członków i zmiana roli (MOB-011).

## Kryteria akceptacji
- [ ] Damian zaprasza Bartka (+48 512 000 908) jako Obsługę SMS-em: zaproszenie pojawia się na liście z „czeka · ważne do …”; po rejestracji i logowaniu Bartka status „przyjęte … · Bartek”.
- [ ] Zaproszenie Klienta bez wybranego konia jest niemożliwe (walidacja przed wysyłką); lista ról nie zawiera Wsparcia IT ani kont technicznych (A-06).
- [ ] „Wyślij ponownie” przy wygasłym zaproszeniu tworzy nowe, a stare ma „wygasło 08.10 · wysłano nowe”.
- [ ] Luna przypisana do „Hala nowa · boks 6” (A-04): zapis wysyła `boxId` boksu HN 6, Luna znika z „Koni bez boksu”; równoczesne przypisanie innego konia do tego boksu z panelu daje w apce „Boks jest już zajęty.” i odświeżoną listę.
- [ ] Zamiana dwóch koni kończy się jednym zapisem i nowymi boksami obu koni na liście.

## Testy
- Jest + RNTL: `invite.test.tsx` (walidacja, rola Klient z koniem, kanały, język), `InvitationList.test.tsx` (statusy, akcje), `move-horse.test.tsx` (trzy wejścia, 409) na atrapie API.
- [ręcznie] Maestro: `mobile/e2e/maestro/admin-invite-move.yaml` (zaproszenie obsługi, przypisanie Luny) na seedzie.

## Definicja gotowości
- `npm run check` w `mobile/` zielone; flow Maestro przechodzi [ręcznie]; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Bez tokenu w treści SMS-a i bez linku z danymi zaproszenia (dopasowanie po kontakcie przy logowaniu, docs/makiety-plan.md 5 pkt 4).
- Numer i e-mail w listach zawsze zamaskowane („+48 512 *** 908”, „t•••@stajnielipowe.pl”).
- Imię z zaproszenia widzi tylko admin; osoba wpisuje swoje imię przy rejestracji.
