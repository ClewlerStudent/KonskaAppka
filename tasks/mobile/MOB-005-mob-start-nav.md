---
id: MOB-005
title: Start po zalogowaniu, nawigacja ról i przełącznik stajni
area: mobile
stage: 1
size: M
status: todo
depends_on: [MOB-003]
decisions: [DEC-15, DEC-16, DEC-23, DEC-27]
owner:
branch:
trello:
---
# MOB-005 · Start po zalogowaniu, nawigacja ról i przełącznik stajni

## Cel
Po zalogowaniu każda rola od razu trafia na swój ekran startowy z własnym paskiem, bez ekranu „Przyjmij zaproszenie”. Osoba w kilku stajniach przełącza je w nagłówku; osoba bez dostępu widzi tylko „Brak dostępu do stajni”.

## Kontekst
- Stan kodu: sesja i `GET /me` z `stables[]`, `startView`, `matchedInvitations[]` (MOB-002, kontrakt z BE-019); ekrany logowania (MOB-003). W panelu routing po `startView` jest w `frontend/web/src/session/home.ts` (wzorzec: nieznana wartość → `welcome`).
- Dokumenty: `mockups/project/MapaNawigacjiRol.dc.html` i `docs/makiety-plan.md` C „MapaNawigacjiRol” (jedyny opis nawigacji): Klient: start Main, pasek Konie | Flagi [flags] | Historia [box_history] | Profil; Obsługa: ListaDnia, pasek Dziś | Konie | Zadania [tasks] | Profil; Admin w apce: AdminDzis, pasek Dziś | Boksy | Zadania | Ludzie | Profil (DEC-15); Instruktor: InstruktorJazdy [rides i `rides_enabled`], pasek Jazdy | Flagi [flags] | Profil; jedna stajnia → start roli, kilka → ostatnio używana, przy pierwszym logowaniu PrzelacznikStajni. `docs/makiety-plan.md` A „BrakDostepu”, „ZaproszenieNoweStajnia” (toast „Masz teraz dostęp do Stajni Brzozowej” i „▾”, bez „Przyjmij”), „PrzelacznikStajni” (arkusz nad Main, nakładka `rgba(46,36,29,.40)`, wiersze 64 px „Stajnia Pod Lipami · Klient · Kasztan, Bella” z ✓, „Zamknij”; stan pierwszego logowania bez ✓ i „Zamknij”), 2.3 „Nagłówki” (przełącznik „▾” tylko przy kilku stajniach, bez dzwonka) i „Widoczność” (funkcja odznaczona dla roli znika razem z pozycją paska; admin widzi wszystko). `docs/mikroserwisy.md` 3.2 (klient bez ważnego konia nie ma stajni w `m`), 3.8 (odebrana stajnia znika z przełącznika do 5 min), 9.1 (Ola: `startView = staff_day`).
- Decyzje: DEC-15 wariant A (pasek admina jak wyżej; „Opuść stajnię” w Profilu — MOB-006). DEC-16 wariant A (bez dzwonka i push). DEC-23 wariant A (klient bez ważnego konia traci stajnię: BrakDostepu, bez MainBezKonia).
- Makiety: `BrakDostepu.dc.html` (bez linku „Wyloguj”: jeden przycisk), `MapaNawigacjiRol.dc.html`, nagłówki z `Main.dc.html`, `ListaDnia.dc.html`, `AdminDzis.dc.html`, `InstruktorJazdy.dc.html`.
- Dane demo: Damian (admin obu stajni, „▾”), Ola i Anna i Marta (dwie stajnie, „▾”), Piotr i Paweł (jedna stajnia, sama nazwa), konto bez stajni (nowa rejestracja), Marek Nowak (zaproszenie do Luny).

## Zakres
- [ ] `mobile/src/stable/selected-stable.ts`: wybrana stajnia per użytkownik (AsyncStorage, klucz z `me.id`), reguły: jedna stajnia → ta; kilka → ostatnio używana, a przy pierwszym logowaniu arkusz wyboru; zapamiętana stajnia znikła z `GET /me` → pierwsza dostępna z toastem bez dopisków; brak stajni → BrakDostepu.
- [ ] `mobile/src/navigation/tabs.ts`: jedna deklaratywna tabela rola → zakładki (nazwa, trasa, wymagana funkcja z `features` albo warunek, np. `rides_enabled`); admin (`features = null`) widzi wszystko. Kolejne zadania tylko podmieniają ekrany, nie logikę paska.
- [ ] Trasy Expo Router: `mobile/app/(app)/_layout.tsx` (strażnik sesji i wybranej stajni), grupy `(client)`, `(staff)`, `(admin)`, `(instructor)` z `_layout.tsx` (paski jak wyżej) i ekranami startowymi jako szkielety z nagłówkiem, H1 i pustą treścią: `(client)/index.tsx` (Main, MOB-012), `(staff)/index.tsx` (ListaDnia, MOB-016), `(admin)/index.tsx` (AdminDzis, MOB-020), `(instructor)/index.tsx` (InstruktorJazdy, MOB-022); pozycje paska bez gotowego ekranu ukryte do czasu ich zadań. Instruktor bez `rides` albo przy `rides_enabled = false` startuje na Flagach.
- [ ] Wybór grupy po `startView` i roli w wybranej stajni (rola może się różnić między stajniami, więc po przełączeniu nawigacja się przebudowuje); `welcome` i nieznane wartości → BrakDostepu; admin firmy bez żadnej stajni → ProfilAdmin z linkiem do panelu (propozycja).
- [ ] Nagłówek `mobile/src/components/StableHeader.tsx`: znak „EQUENOR”, nazwa stajni z „▾” tylko przy kilku stajniach (otwiera arkusz), linia „Ola · Obsługa” (bez form „Zalogowana/Zalogowany”, bo nie znamy rodzaju gramatycznego; propozycja), bez dzwonka.
- [ ] `mobile/app/(app)/stable-switcher.tsx` (PrzelacznikStajni, modal-arkusz): „Twoje stajnie”, wiersze „nazwa · rola” (z imionami koni klienta, jeśli `GET /me` je poda), ✓ przy bieżącej, „Zamknij”; wybór zapisuje stajnię i przechodzi na start roli w tej stajni; stan „Wczytuję ustawienia Stajni Brzozowej…”.
- [ ] `mobile/app/(app)/no-access.tsx` (BrakDostepu): logo, H1 „Brak dostępu do stajni”, jeden przycisk „Zaloguj się innym kontem” (wylogowanie lokalne i `login`); używany też przy `403 wrong_client` i `access_revoked` (MOB-002, MOB-003).
- [ ] Nowa stajnia (ZaproszenieNoweStajnia): po każdym `GET /me` porównanie listy stajni z ostatnio znaną (AsyncStorage per użytkownik); nowa stajnia → toast „Masz teraz dostęp do Stajni Brzozowej” (bez arkusza i „Przyjmij”), także gdy admin przypisał osobę bez zaproszenia.
- [ ] Teksty PL/UA/EN (nazwy ról: Klient, Obsługa, Admin, Instruktor).

## Poza zakresem
- Treść ekranów startowych (MOB-012, MOB-016, MOB-020, MOB-022), konfiguracja stajni i odpytywanie (MOB-007), profil (MOB-006), licznik niewysłanych zapisów w przełączniku (MOB-008), stan zawieszonej stajni (MOB-023).

## Kryteria akceptacji
- [ ] Ola po zalogowaniu (kilka stajni, pierwsze logowanie) widzi arkusz wyboru bez ✓ i „Zamknij”; po wyborze Pod Lipami pasek Dziś | Konie | Zadania | Profil; po przełączeniu na Brzozową pasek bez „Zadania” (brak `tasks`), bez ponownego logowania.
- [ ] Anna: pasek Konie | Flagi | Historia | Profil w obu stajniach; Damian: Dziś | Boksy | Zadania | Ludzie | Profil i „▾”; Piotr: sama nazwa stajni, bez „▾”; Marta: Jazdy | Flagi | Profil.
- [ ] Konto bez stajni i bez zaproszenia widzi tylko BrakDostepu z „Zaloguj się innym kontem”; Marek Nowak po pierwszym logowaniu z ważnym zaproszeniem trafia od razu na start klienta (A-06).
- [ ] Odebranie Oli Brzozowej (BE-023) → po najbliższym odświeżeniu (≤ 5 min albo powrót na pierwszy plan) Brzozowa znika z przełącznika; jeśli była wybrana, apka przechodzi do Pod Lipami.
- [ ] Przypisanie nowej stajni → toast „Masz teraz dostęp do …” i „▾” w nagłówku.

## Testy
- Jest: `selected-stable.test.ts` (reguły wyboru, znikająca stajnia), `tabs.test.ts` (macierz rola × funkcje → pozycje paska dla Ani, Oli, Damiana, Marty w obu stajniach, z danymi z docs/mikroserwisy.md 3.3), testy renderu nagłówka i BrakDostepu.
- Maestro: `mobile/e2e/maestro/start-roles.yaml` (logowanie Oli, Anny, Damiana i przełączenie stajni) na lokalnym stosie albo z tokenami `npm run dev:token`.

## Definicja gotowości
- `npm run check` w `mobile/` zielone; flow Maestro przechodzi; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Apka nie dekoduje tokenu: role i funkcje tylko z `GET /me`. Funkcje: `flags`, `feeding_plan`, `routine`, `box_history`, `health`, `rides`, `tasks`.
- Bez próśb do admina, numeru i telefonu stajni na BrakDostepu (dec. 38).
- Nazwy koni w wierszach przełącznika daje `GET /me` w `stables[].horses` (BE-062, etap 2; celowo nie jest zależnością, żeby nie opóźniać etapu 1); dopóki pola nie ma, wiersz pokazuje „nazwa · rola”, a po `gen:api` z BE-062 imiona koni pojawiają się bez zmian w logice.
