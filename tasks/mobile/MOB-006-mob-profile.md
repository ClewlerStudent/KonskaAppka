---
id: MOB-006
title: Profil i ProfilAdmin (język, kanał kodu, hasło, kontakt, wylogowanie, usunięcie konta)
area: mobile
stage: 1
size: M
status: todo
depends_on: [BE-020, BE-023, MOB-005]
decisions: [DEC-15]
owner:
branch:
trello:
---
# MOB-006 · Profil i ProfilAdmin

## Cel
Każda osoba w apce zmienia język, imię, kanał kodu, hasło, numer albo e-mail, wylogowuje się (także ze wszystkich urządzeń), opuszcza stajnię i usuwa konto (wymóg Apple i Google). Admin firmy ma w profilu skróty do panelu web.

## Kontekst
- Stan kodu: sesja i `GET /me` (MOB-002), pasek z pozycją Profil (MOB-005), `SegmentedControl` i `CodeInput` (MOB-003). Trasy w `auth`: `PATCH /auth/v1/me` (`{ displayName?, locale? }`) i `POST /auth/v1/me/sign-out-everywhere` (BE-019), `PUT /auth/v1/me/mfa-channel` (`{ password, channel }` → kod obecnym kanałem → potwierdzenie), `POST /auth/v1/me/contact` (`{ newContact, password }`) → `POST /me/contact/verify` (token logowania, kod MFA) → `POST /me/contact/confirm` (kod z nowego kontaktu), `POST /auth/v1/me/password` (`{ currentPassword }`) → `POST /me/password/verify` (token, kod MFA, `newPassword`; w odpowiedzi nowe tokeny tego urządzenia), `DELETE /auth/v1/me` (`409 sole_business_admin`) — BE-020; `DELETE /auth/v1/me/memberships/{stableId}` („Opuść stajnię”) — BE-023 (przeniesione z BE-019).
- Dokumenty: `docs/makiety-plan.md` A „Profil” (H1 „Profil”; „Ty”: imię ze „Zmień”, „+48 607 *** 218” ze „Zmień numer”, „Hasło” ze „Zmień hasło”, „Kod logowania: SMS | E-mail” tylko przy obu potwierdzonych kontaktach; „Język aplikacji”: Polski | Українська | English; „Moje stajnie”; „Sesja”: „Wyloguj”, „Wyloguj ze wszystkich urządzeń”, „Usuń konto”; polityka prywatności, wersja; ● ProfilAdmin: „Zarządzanie stajnią · w panelu web” (Pulpit, Konie, Ustawienia stajni, Płatności), „Usuń konto” zablokowane z „Jesteś jedynym adminem konta firmy”; dialog usunięcia „Twoje dane osobowe zostaną usunięte, a wpisy w historii stajni zostaną bez nazwiska.”), „ProfilZmianaNumeru” (nowy numer i hasło, „Dalej”; potem kod z nowego numeru i kod MFA; stany: złe hasło, zły kod, numer należy do innego konta; „Zmień hasło”: obecne hasło, kod MFA, nowe hasło). `docs/mikroserwisy.md` 5.2 „Zmiana kontaktu i hasła”, 3.8 (wylogowanie wszędzie i zmiana hasła podbijają `token_version`, tablety bez zmian).
- Decyzje: DEC-15 wariant A („Opuść stajnię” w Profilu; ProfilAdmin z linkami do panelu: Płatności i Ustawienia są w panelu).
- Makiety: brak plików (ekrany bez makiet, docs/development-szczegoly.md 3.5.1); opis w makiety-plan.
- Dane demo: Ola (profil obsługi, dwie stajnie), Anna (klient), Damian (ProfilAdmin, jedyny admin Stajni Lipowe), Damian ma telefon i e-mail (zmiana kanału kodu).

## Zakres
- [ ] `mobile/app/(app)/profile/index.tsx` (Profil; u admina wariant ProfilAdmin) we wszystkich grupach ról przez wspólny ekran; sekcje jak w makiety-plan.
- [ ] Imię: arkusz z polem i „Zapisz” → `PATCH /me`; język: zmiana od razu w i18n i `PATCH /me { locale }` (język kodów i wiadomości z `auth`).
- [ ] Kanał kodu (tylko gdy `me.contact` ma oba kontakty potwierdzone): hasło → kod obecnym kanałem → przełączenie; błędy `invalid_credentials`, `invalid_code`, `contact_not_verified`.
- [ ] `mobile/app/(app)/profile/change-contact.tsx` (ProfilZmianaNumeru; ten sam ekran dla e-maila): krok 1 nowy kontakt i hasło („Dalej”), krok 2 kod MFA dotychczasowym kanałem („Kod wysłaliśmy na …”), krok 3 kod z nowego kontaktu („Zmień numer”); `409 contact_taken` → „Ten numer należy do innego konta.”; po sukcesie `GET /me`.
- [ ] `mobile/app/(app)/profile/change-password.tsx`: obecne hasło → kod MFA i „Nowe hasło” → „Zapisz hasło”; nowe tokeny z odpowiedzi zapisane przez sesję (to urządzenie zostaje zalogowane, inne wracają do logowania).
- [ ] „Moje stajnie”: lista z `GET /me` (nazwa, rola, ✓ przy wybranej → przełącznik z MOB-005); przy stajniach z członkostwa (nie admina firmy) akcja „Opuść stajnię” z dialogiem skutków → `DELETE /me/memberships/{stableId}`, potem `POST /token` i `GET /me` (stajnia znika; brak stajni → BrakDostepu).
- [ ] „Wyloguj” (lokalnie, MOB-002); „Wyloguj ze wszystkich urządzeń” z dialogiem „Wyloguj ze wszystkich urządzeń?” → `POST /me/sign-out-everywhere`, potem wylogowanie lokalne (ten telefon też); „Usuń konto” z dialogiem jak w makiety-plan → `DELETE /me`; `409 sole_business_admin` → „Jesteś jedynym adminem konta firmy” (przycisk zostaje nieaktywny w tej sesji).
- [ ] ProfilAdmin (rola admin w wybranej stajni albo `businesses` niepuste): sekcja „Zarządzanie stajnią · w panelu web” z pozycjami Pulpit, Konie, Ustawienia stajni, Płatności otwieranymi w przeglądarce (`expo-web-browser`, adres z `EXPO_PUBLIC_PANEL_URL`); bez statusu subskrypcji do czasu billingu (WEB-024).
- [ ] Stopka: „Polityka prywatności” (`EXPO_PUBLIC_WWW_URL`), wersja apki (`expo-application`).

## Poza zakresem
- Licznik niewysłanych zapisów przy wylogowaniu (MOB-008); strona usuwania konta w www (WEB-008).
- Zmiana kanału kodu w panelu (WEB-007).

## Kryteria akceptacji
- [ ] Ola zmienia język na „Українська”: interfejs od razu po ukraińsku, a następny kod logowania przychodzi po ukraińsku.
- [ ] Damian zmienia kanał kodu na e-mail; kolejne logowanie wysyła kod e-mailem.
- [ ] Anna zmienia numer: kod MFA na stary numer, kod na nowy numer, potem `GET /me` pokazuje nowy zamaskowany numer; numer innego konta daje komunikat bez ujawniania czyje.
- [ ] Zmiana hasła na telefonie zostawia ten telefon zalogowany, a drugi telefon Anny po ≤ 5 min wraca do logowania.
- [ ] „Opuść stajnię” Oli w Brzozowej usuwa ją z przełącznika; Damian nie ma tej akcji przy stajniach swojej firmy; „Usuń konto” Damiana kończy się komunikatem o jedynym adminie.

## Testy
- Jest + RNTL: `profile.test.tsx` (warianty roli, widoczność „Kod logowania”, dialogi), `change-contact.test.tsx`, `change-password.test.tsx` na atrapie API z kodami błędów.
- Maestro: `mobile/e2e/maestro/profile.yaml` (język, kanał kodu, wylogowanie wszędzie) na lokalnym stosie.

## Definicja gotowości
- `npm run check` w `mobile/` zielone; flow Maestro przechodzi; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Usuwanie konta w apce jest wymogiem App Store (5.1.1(v)) i Google Play; nie chowaj go głębiej niż Profil.
- Hasło i kody tylko w stanie ekranu; nie loguj ich i nie zapisuj w cache.
- Konto techniczne nie loguje się w apce (`wrong_client`), więc ekran nie ma jego wariantu.
- Zmiana względem listy: dodana zależność BE-023, bo „Opuść stajnię” (`DELETE /me/memberships/{stableId}`) przeniesiono z BE-019 do BE-023.
