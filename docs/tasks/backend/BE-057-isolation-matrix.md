---
id: BE-057
title: Pełna macierz izolacji i meta-testy
area: backend
stage: 9
size: M
status: todo
depends_on: [BE-045, BE-048, BE-050, BE-002, BE-027]
decisions: [DEC-03, DEC-10]
owner:
branch:
trello: https://trello.com/c/611kkZvz
---
# BE-057 · Pełna macierz izolacji i meta-testy

## Cel
Przed stajnią pilotażową mamy dowód, że dane stajni i firm się nie mieszają, a każda rola i aplikacja może dokładnie to, co powinna. Testy powstają z kontraktów tras, więc każda nowa trasa automatycznie trafia do macierzy i nie przejdzie CI bez polityki.

## Kontekst
- **Stan kodu:** kontrakty wszystkich serwisów w `backend/src/contracts/` zebrane w `backend/src/contracts/index.ts` (`services`), polityki w deskryptorach (`clients`, `stable {roles, feature, write}`, `platform`, `stepUp`; BE-006), czyste funkcje polityk w `backend/src/lib/authz`, harmonogram testów i `mintToken` w `backend/src/lib/testing` (BE-010), seed z dwiema firmami (Stajnie Lipowe i Olszynka, BE-011), parser SQL `libpg-query` z bramki (BE-002), `owners.ts` z listą tabel stajni (BE-003). Pierwsza część macierzy (trasy etapu 1): BE-027.
- **Dokumenty:** docs/mikroserwisy.md 1.1 (obiekt bez dostępu: 404), 1.3 (W1 w każdym serwisie, trasy otwarte), 3.6 (`plt = admin` przechodzi jak admin, z wyjątkiem tras tylko tabletowych), 8 (macierz i kody odmowy); docs/development-szczegoly.md 4.2 „Izolacja stajni”, „Role, macierz rola × akcja”, „Jeden serwis autoryzacyjny”, „Trasy otwarte”, 3.1.10 (strażnik predykatu `stable_id`), 3.6 „Etap 9”.
- **Makiety:** brak.
- **Decyzje:** DEC-03 A (funkcje w `m[].f`), DEC-10 A (Kuba z aplikacją `ops` przechodzi każdą trasę admina; trasy ról tylko z `opctl`).
- **Dane demo:** Damian (admin Stajnie Lipowe), admin Olszynki, Ola (obsługa w obu stajniach), Piotr (tylko Pod Lipami), Paweł (tylko Brzozowa), Anna (klientka), Marta (instruktor), konta „Tablety Pod Lipami”, „Tablety Brzozowa”, „Telewizor korytarz”, Kuba (`ops`). Boksy 1–6 w trzech stajniach o tych samych numerach.

## Zakres
- [ ] Generator przypadków z kontraktów (`backend/src/contracts/isolation.test.ts` albo osobny katalog testów): dla każdej trasy zewnętrznej z `{stableId}` wywołanie tokenem stajni A z identyfikatorami obiektów stajni B (mapa parametr → id z seedu: `horseId`, `boxId`, `flagId`, `taskId`, `buildingId`, `invoiceId` itd.) oczekuje 404 i braku zmian w bazie (liczniki wierszy przed i po).
- [ ] Macierz rola × akcja × aplikacja: dla każdej trasy i każdej pary (rola, `client_id`) oczekiwany wynik z czystej funkcji polityki (`lib/authz`), porównany z odpowiedzią serwisu; wyświetlacz: każda trasa inna niż `GET` daje 403; tablet: trasy zadań `403 client_not_allowed`, akcja innej hali `403 other_building`; `X-Box-Id` boksu innej stajni: 404 bez zapisu.
- [ ] Meta-testy: każda trasa ma politykę i deklarację audytu (dla zapisu); każdy serwis z API ma trasę dostępną dla `plt = admin`; każda trasa z rolą `admin` przechodzi dla Kuby z `ops` (poza trasami tylko tabletowymi i `opctl`); trasa zewnętrzna bez tokenu daje 401; lista tras otwartych równa `backend/open-routes.txt`.
- [ ] Strażnik SQL w testach integracyjnych: opakowanie klienta bazy parsuje każde zapytanie (`libpg-query`) i odrzuca zapytanie do tabeli stajni (lista z `owners.ts`) bez predykatu `stable_id`, poza jawnym `crossTenant()`; tabele podrzędne tylko przez rodzica.
- [ ] Zdarzenia: konsument odrzuca zdarzenie, którego `stableId` nie zgadza się z danymi zasobu (np. `horse.left` z cudzym `stableId`), test dla każdego konsumenta.
- [ ] Raport z przebiegu (lista tras i wynik) jako artefakt testu, bez zapisu do repo.

## Poza zakresem
- testy sieci (NetworkPolicy, porty `/internal`) na klastrze: manifesty BE-060, wykonanie po stronie Dawida; testy UI ról (WEB-028, MOB-024).

## Kryteria akceptacji
- [ ] Każda trasa z `{stableId}` (wszystkie serwisy) jest w macierzy; nowa trasa bez polityki zatrzymuje CI.
- [ ] A-23 i 4.2: Piotr dostaje 404 na każdym obiekcie Brzozowej, Paweł na każdym obiekcie Pod Lipami, admin Olszynki na obiektach Damiana i odwrotnie.
- [ ] Widoczność tylko zawęża: klient z zaznaczonym `tasks` czyta listę zadań, ale każdy zapis zadań daje 403.
- [ ] Strażnik SQL nie zgłasza naruszeń w całym zestawie testów integracyjnych.

## Testy
- Generowane testy integracyjne (Testcontainers PostgreSQL z seedem, serwisy w procesie testu przez `app.inject`).
- Uruchomienie: `cd backend && npm run check`; osobno `npx vitest run src/contracts/isolation.test.ts` (dłuższy przebieg może iść w nocnym CI, SH-003).

## Definicja gotowości
- `npm run check` w `backend/` zielone, czas przebiegu macierzy opisany w `backend/README.md` (gdy długi: osobny skrypt `npm run test:isolation`).
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Zmiana zależności: bez BE-052 (billing czeka na decyzję właściciela, a to zadanie blokowało SH-005). Trasy `billing` wchodzą do macierzy automatycznie, bo meta-test obejmuje każdą trasę z `{stableId}`; jeśli BE-052 powstanie po tym zadaniu, dopisuje swoje identyfikatory (`invoiceId` itd.) do mapy parametrów (zakres BE-052).
- Test jest generyczny: trasy dodane po tym zadaniu (np. BE-055, BE-056) wchodzą do macierzy same; mapa parametrów musi wtedy dostać id z seedu.
- Oczekiwane 404, nie 403, dla obiektów spoza dostępu (także obiektów innej firmy).
<!-- dep-ok: SH-003 (dłuższy przebieg w nocnym CI, uruchamianie poza zakresem) -->
