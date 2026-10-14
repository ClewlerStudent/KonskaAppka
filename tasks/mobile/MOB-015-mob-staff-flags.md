---
id: MOB-015
title: "Obsługa: konie, flaga w imieniu klienta i potwierdzanie flag"
area: mobile
stage: 3
size: M
status: todo
depends_on: [BE-024, MOB-008, MOB-013, MOB-009]
decisions: []
needs: [emulator]
owner:
branch:
trello:
---
# MOB-015 · Obsługa: konie, flaga w imieniu klienta i potwierdzanie flag

## Cel
Obsługa (Ola, Piotr) widzi wszystkie konie stajni z flagami, ustawia flagę w imieniu klienta (np. po telefonie) i potwierdza flagi z telefonu, także bez zasięgu. Admin ma te same flagi i „Potwierdzam” w zakładce Boksy.

## Kontekst
- Stan kodu: kolejka zapisów i `enqueueAck` (MOB-008), ekran nowej flagi (MOB-013), `FlagCard` (MOB-012), BoksyAdmin (MOB-009), pasek obsługi z pozycją Konie (MOB-005, trasa `mobile/app/(app)/(staff)/horses.tsx`). Trasy: `GET /board/v1/stables/{stableId}/horses-overview` (obsługa i admin; konie z boksem i halą, bez boksu na końcu; flagi z godzinami i statusem po BE-038), `GET …/boxes-overview` z flagami i alertem niepotwierdzonej krytycznej (BE-038), `POST /operations/v1/stables/{stableId}/flags/{flagId}/acks` (`{ id, occurredAt, timeQuality }`; `method = app` z `client_id`; `409 ack_not_required` przy `requires_ack = false`; flaga odwołana: 200 z `conflict`) i `POST …/horses/{horseId}/flags` z `source: on_behalf_phone | on_behalf_sms | on_behalf_in_person` tylko dla obsługi i admina (BE-034), `GET /auth/v1/stables/{stableId}/horse-clients` (imiona klientów; telefon tylko admin) (BE-024).
- Dokumenty: `docs/development-szczegoly.md` 3.5.1 „Obsługa i admin” (StajennyKonie: kafelki szybkiej flagi włączonych w stajni, z Derką tylko tam, gdzie stajnia oferuje derki, godziny przy flagach; potwierdzenia przez lokalną kolejkę). `docs/makiety-plan.md` D „SzybkaFlagaObsluga” (Ola, „← Konie”; select „Dla konia: Iskra · Hala główna · boks 1”; 7 kafelków; „Klient prosił: telefon | SMS | osobiście”; „Klient: Karolina W.”; „Kiedy” z podpowiedzią; stany: Luna „bez boksu” (A-07), 07:25 po wyłączeniu potwierdzeń „obowiązuje od razu” (A-20), wejście admina), docs/makiety-plan.md 5 pkt 23 (potwierdzanie przez admina w apce), docs/makiety-plan.md 5 pkt 32 (flaga bez prośby klienta: `source = app` z `author_role` obsługi; do decyzji ekran pokazuje tylko `on_behalf_*`). `docs/mikroserwisy.md` 8 (potwierdzenie: obsługa w apce, admin w apce i panelu; klient i instruktor 403). A-07, A-18, A-20.
- Makiety: `mockups/project/StajennyKonie.dc.html` (H1 „Wszystkie konie”, wyszukiwarka „Szukaj konia, boksu lub klienta”, „Szybka flaga · Dla konia: Iskra · boks 1 · Hala główna …”, kafelki, „Konie w stajni · pokazano 5 z 13 · wg boksu”, wiersze „Główna 7 · Kasztan · Bez śniadania 06:00–10:00 · Nie na padok od 14:30 · obie potwierdzone 06:02 · Flaga · Plan”, Bella „Nie na padok · niepotwierdzona · Potwierdzam · dziś, cały dzień · ustawiona 01:20”, „Luna · Nowy koń · Bez boksu · brak flag”; zdanie „Możesz ustawiać flagi…” pomijamy, docs/makiety-plan.md 2.3 i 5 pkt 38), `SzybkaFlaga.dc.html`, `BoksyAdmin.dc.html` (flagi przy boksach: „Bez śniadania 06:00–10:00 · potwierdzona 06:02”, Bella „· dziś, cały dzień · niepotwierdzona”).
- Decyzje: brak nowych.
- Dane demo: Ola i Piotr (Pod Lipami), Ola i Paweł (Brzozowa, bez potwierdzeń), Damian (admin); flagi Kasztana, Belli, Hetmana, Sonaty; Iskra (Karolina W.), Grom (Tomasz L.), Luna.

## Zakres
- [ ] `mobile/app/(app)/(staff)/horses.tsx` (StajennyKonie): wyszukiwarka (koń, boks, klient), sekcja „Szybka flaga” z wyborem konia i kafelkami z konfiguracji, lista „Konie w stajni” (etykieta „Główna 7” z `boxLabel` w trybie wąskim, flagi z godzinami i statusem, akcje „Flaga” i „Plan”; „Plan” ukryty do MOB-019), „Potwierdzam” przy flagach `unacknowledged`.
- [ ] Tryb obsługi ekranu nowej flagi (SzybkaFlagaObsluga, rozszerzenie `mobile/app/(app)/flag/new.tsx` z MOB-013): select konia (wszystkie konie stajni, także bez boksu), „Klient prosił: telefon | SMS | osobiście” (→ `source`), „Klient: {imię}” z `horse-clients`; zapis tylko online jak w MOB-013.
- [ ] Potwierdzenie (`mobile/src/features/flags/acknowledge.ts`): „Potwierdzam” → `enqueueAck` (MOB-008) z optymistycznym „potwierdzona HH:MM · czeka na sieć”; `409 ack_not_required` → wpis znika z „Wymaga potwierdzenia” i odświeżenie; odpowiedź z `conflict = flag_cancelled | flag_ended` → komunikat „Flaga została odwołana” albo „Flaga już się skończyła”.
- [ ] Flagi w BoksyAdmin (MOB-009): przy boksach aktywne flagi z godzinami i statusem, alert niepotwierdzonej flagi krytycznej na górze listy, „Potwierdzam” dla admina (te same komponenty).
- [ ] Bez statusu i bez „Potwierdzam” w stajni bez potwierdzeń (Brzozowa); flagi `requiresAck = true` sprzed wyłączenia przełącznika nadal z „Potwierdzam” (A-20).

## Poza zakresem
- ListaDnia z sekcją „Wymaga potwierdzenia” (MOB-016), AdminDzis z „Pilne” (MOB-020), edycja planu (MOB-019), karta konia dla obsługi (MOB-018).

## Kryteria akceptacji
- [ ] A-07: Ola ustawia flagi dla Iskry (Hala główna · boks 1), Groma (Hala nowa · boks 1) i Luny (bez boksu), z godzinami; Karolina W. widzi flagę Iskry w swojej apce.
- [ ] Ola potwierdza flagę Belli w trybie samolotowym; po powrocie sieci flaga ma `method = app`, `user_id` Oli, a status „potwierdzona HH:MM” pojawia się u Anny.
- [ ] W Brzozowej Ola i Paweł nie widzą „Potwierdzam”, flagi mają „obowiązuje od razu” (A-18); po wyłączeniu potwierdzeń w Pod Lipami nowa flaga Iskry nie ma statusu, a Bella dalej ma „Potwierdzam” (A-20).
- [ ] Damian w BoksyAdmin widzi alert Belli i potwierdza ją z apki.

## Testy
- Jest + RNTL: `staff-horses.test.tsx` (wyszukiwanie, flagi, statusy, Brzozowa), `flag-new-staff.test.tsx` (select konia, `source`), `acknowledge.test.ts` (kolejka, `ack_not_required`, `conflict`).
- [ręcznie] Maestro: `mobile/e2e/maestro/staff-flags.yaml` (A-07, potwierdzenie offline) na seedzie.

## Definicja gotowości
- `npm run check` w `mobile/` zielone; flow Maestro przechodzi [ręcznie]; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Potwierdzenie idzie przez kolejkę (offline), flaga tylko online (docs/development-szczegoly.md 3.5.1 „Zapisy”).
- Obsługa widzi imiona klientów, ale nie telefony (docs/mikroserwisy.md 8); telefon tylko u admina.
- Zmiana względem listy: dodana zależność BE-024 (imię klienta przy fladze w imieniu klienta) i przejęte z MOB-009 wyświetlanie flag oraz „Potwierdzam” w BoksyAdmin.
