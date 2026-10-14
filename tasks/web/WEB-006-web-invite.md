---
id: WEB-006
title: PanelZaprosOsobe i lista zaproszeń
area: web
stage: 1
size: M
status: todo
depends_on: [BE-022, WEB-004]
decisions: [DEC-27]
owner:
branch:
trello:
---
# WEB-006 · PanelZaprosOsobe i lista zaproszeń

## Cel
Admin zaprasza do stajni klienta (z koniem), obsługę, instruktora albo konto techniczne (wyświetlacz, tablet przy boksie) SMS-em albo e-mailem. Zaproszenie dopasowuje się samo po zalogowaniu osoby, bez „Przyjmij”. Admin widzi listę zaproszeń, ponawia wygasłe i odwołuje oczekujące.

## Kontekst
- **Stan kodu:** `SidePanel`, `SegmentedControl`, `RadioGroup`, `DateField`, `PhoneField`, `TextField`, `Toast`, `DataTable`, `newId()` z WEB-001/WEB-004; ekran Ludzie z WEB-005 (jeśli już jest; inaczej zakładka i przycisk trafiają na zaślepkę `/stables/$stableId/people`).
- **Dokumenty:** docs/mikroserwisy.md 5.2 „Zaproszenia”, 2 (konto techniczne tylko na świeży kontakt: `409 target_in_use`), 9.2 pkt 8–10, 9.3 pkt 1. BE-022: `GET /auth/v1/stables/{stableId}/invitations` (status `pending | accepted | expired | revoked`, cel zamaskowany), `POST …/invitations` (`{ channel, target, displayName, locale, role, horseId?, expiresAt? }`; `role`: `client | staff | instructor | display | tablet`; `horseId` wymagany dla `client`; `expiresAt` domyślnie +7 dni, najwyżej +30), `POST …/invitations/{id}/resend` (nowe zaproszenie, stare odwołane), `POST …/invitations/{id}/revoke`; `429 rate_limited` (200 na firmę na dobę). docs/development-szczegoly.md 4.1 „Panel web” (zaproszenie z kanałem i rolą, bez Wsparcia IT), A-06, A-24, A-25.
- **Makiety:** mockups/project/PanelZaprosOsobe.dc.html: „Zaproś osobę · Stajnia Brzozowa”, „Kanał SMS | E-mail”, „Język wiadomości PL | UA”, „Ważne do * · 7 dni”, „Numer telefonu * +48”, „Imię”, „Rola w Stajni Brzozowej *”: „Osoba: Klient | Obsługa | Instruktor”, „Konto techniczne: Wyświetlacz | Tablet przy boksie”, „Podgląd SMS”, „Anuluj”, „Wyślij zaproszenie”. makiety-plan.md B „PanelZaprosOsobe” (stany: Klient z polem „Koń”, konta techniczne e-mailem, toast „Wysłano zaproszenie SMS · ważne do 08.10”, „Nie wysłano, spróbuj ponownie”, walidacje) i „PanelLudzie” (zakładka „Zaproszenia”: „wygasa za 2 dni” z „Odwołaj”, „wygasło 08.10” z „Wyślij ponownie”, filtr przyjętych i odwołanych). WiadomosciSms.dc.html (treść SMS); mockups/STAN.md pkt 7 („zaloguj się tym numerem” → „załóż konto na ten numer”).
- **Decyzje:** brak (DEC-11 dotyczy wysyłki po stronie serwisów).
- **Dane demo:** zaproszenie Pawła (SMS, Obsługa, Brzozowa), Marek Nowak (SMS, Klient, Luna, ważne do 15.10), wygasłe +48 512 *** 908 (Obsługa, 08.10), „Telewizor korytarz” (e-mail tv.korytarz@stajnielipowe.pl), „Tablety Pod Lipami” (boksy@stajnielipowe.pl).

## Zakres
- [ ] `web/src/features/people/InviteForm.tsx` w `SidePanel`, używalny z PanelLudzie, PanelPulpitStart (WEB-010) i PanelDodajKonia (WEB-013) z presetem (`role`, `horseId`): kanał, kontakt (telefon z +48 albo e-mail), „Imię” (przy koncie technicznym etykieta „Nazwa”, np. „Telewizor korytarz”), język PL | UA, „Ważne do” (domyślnie +7 dni, „· 7 dni”), rola (dwie grupy radio), „Koń” (tylko Klient; komponent `HorsePicker` z listą koni stajni z `GET /board/v1/stables/{id}/horses-overview`, BE-033, z halą przy boksie i końmi bez boksu). Na etapie 1 tras koni jeszcze nie ma: `HorsePicker` testujesz na atrapie, a na pełnym stosie działa po BE-033 (bez obejść w kodzie).
- [ ] Walidacja: format numeru (9 cyfr, normalizacja „600…”, „+48 600…”, „0048…”), e-mail, „Ważne do” w przeszłości albo dalej niż 30 dni, Klient bez konia, na ten kontakt czeka już zaproszenie (porównanie z listą `pending`; wtedy przycisk „Wyślij ponownie” zamiast „Wyślij zaproszenie”).
- [ ] „Podgląd SMS” / „Podgląd e-maila” liczony w przeglądarce według szablonu z WiadomosciSms („Stajnia Pod Lipami zaprasza Cię do EQUENOR jako klienta (koń: Luna). Pobierz aplikację: [WWW]/app i załóż konto na ten numer. Ważne do 15.10.”; konto techniczne: „… Załóż konto tym adresem e-mail …”) z liczbą znaków i segmentów (polskie znaki: 70); tekst zgodny z szablonem `lib/i18n` (BE-014) — test porównuje z fixture'em.
- [ ] Wysyłka `POST …/invitations`; sukces → toast „Wysłano zaproszenie SMS · ważne do 08.10”; `409 target_in_use` → „Ten adres należy już do innego konta.” (propozycja); `429` → „Za dużo zaproszeń. Spróbuj jutro.” (propozycja); błąd sieci → „Nie wysłano, spróbuj ponownie”.
- [ ] Zakładka „Zaproszenia N” w PanelLudzie: kolumny Kontakt (zamaskowany) i imię, Rola (z koniem), Status („czeka · ważne do czw 15.10”, „wygasa za 2 dni”, „wygasło 08.10”, „przyjęte 13.10 07:24 · Bartek”, „odwołane”), Akcje („Odwołaj” przy `pending` z dialogiem, „Wyślij ponownie” przy `pending` i `expired`); filtr „Oczekujące | Przyjęte | Odwołane i wygasłe”.
- [ ] Przycisk „Zaproś osobę” w nagłówku PanelLudzie.

## Poza zakresem
- Stan doręczenia zaproszenia z `notifications …/deliveries` (WEB-015); zaproszenie w apce (MOB-010); treść i wysyłka po stronie serwerów (BE-036).

## Kryteria akceptacji
- [ ] A-24/A-25: „Konto techniczne: Wyświetlacz” e-mailem tv.korytarz@stajnielipowe.pl z nazwą „Telewizor korytarz” tworzy zaproszenie widoczne w zakładce; zajęty adres daje komunikat `target_in_use`.
- [ ] Klient bez wybranego konia nie wyśle formularza; Klient z koniem wysyła `horseId`.
- [ ] „Wyślij ponownie” przy wygasłym tworzy nowe zaproszenie (stare znika z oczekujących).
- [ ] Na liście ról nie ma Wsparcia IT ani Admina; bez opisów ról (dec. 19, 35, 38).
- [ ] 390 px bez poziomego przewijania; formularz obsługiwany klawiaturą.

## Testy
- Vitest: walidacja kontaktu i dat, licznik segmentów SMS (UCS-2), podgląd vs fixture szablonu, formularz na fałszywym API (409, 429).
- Playwright na atrapie: zaproszenie Pawła SMS-em, TV e-mailem, wygasłe → „Wyślij ponownie”; zrzuty 1440 i 390.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Kontakt zapraszanego tylko w żądaniu; nie zapisywać go w Web Storage ani logach.
- Podgląd jest przybliżeniem treści z serwera (luka 10.2 pkt 22); różnicę opisz w README, jeśli wystąpi.
