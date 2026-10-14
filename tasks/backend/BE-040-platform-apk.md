---
id: BE-040
title: "platform: wydania APK"
area: backend
stage: 4
size: M
status: todo
depends_on: [BE-039]
decisions: [DEC-10]
owner:
branch:
trello:
---
# BE-040 · platform: wydania APK

## Cel
Tablety aktualizują się same, bez dotykania urządzeń: zespół EQUENOR wgrywa wydanie APK, ustawia stopniowe wdrożenie, a tablet pyta, czy jest nowsza wersja, i dostaje link do pobrania w oknie serwisowym stajni. Powstaje serwis `platform` (później też audyt, BE-055).

## Kontekst
- **Stan kodu:** serwisu `platform` nie ma. Pliki i linki: `files` (BE-039, trasy `/files/v1/internal/*`, klient `backend/src/lib/files-client`). Polityka trasy (`clients`, `platform: ['admin','support']`, wyjątek „tylko tablet”): BE-006. Tabele `app_releases`, `app_release_targets`: BE-004. Okno instalacji: `stable_settings.maintenance_from`, `maintenance_to` (zapis w BE-030).
- **Dokumenty:** docs/mikroserwisy.md 5.9 (`GET /platform/v1/tablet/latest?versionCode=&installId=` tylko dla aplikacji `tablet`, stajnia z tokenu; `GET`, `POST /platform/v1/platform/releases`, `rollout`, `complete`, `halt`: `plt = admin`, odczyt też `support`), 3.6 (trasy wyłącznie tabletowe nie przepuszczają `ops`); docs/development-szczegoly.md 3.3 `platform` (statusy, procent z hasha `installId`, wymuszenie poniżej `min_required_version_code`, presigned URL z `Range`), 3.1.5 (bramka minimalnej wersji nie obejmuje tras wydań), 3.5.2 „Aktualizacja APK”; docs/erd.md tabele `app_releases`, `app_release_targets`; T-24…T-26 w 4.3.1.
- **Makiety:** TabletUstawienia.dc.html (wersja aplikacji w diagnostyce); stan „wymagana aktualizacja” tabletu (bez osobnej planszy).
- **Decyzje:** DEC-10 A (admin globalny na hoście `[OPS]` i w `opctl`; wydania z `opctl` w BE-056).
- **Dane demo:** „Tablety Pod Lipami” i „Tablety Brzozowa”; okno instalacji w seedzie np. 02:00–04:00 (wartość testowa).

## Zakres
- [ ] Serwis `backend/src/services/platform/` (`main.ts`, `app.ts`, `env.ts`), skrypty `start:platform`, `dev:platform`; kontrakt `backend/src/contracts/platform.ts`.
- [ ] Trasy platformowe (`plt = admin`; `GET` także `support`; audyt każdego zapisu):
  - `GET /platform/v1/platform/releases`;
  - `POST /platform/v1/platform/releases`: `{versionCode, versionName, sha256, signingCertSha256, minSdk, minRequiredVersionCode, sizeBytes}` → `draft`, plik przez `files` (`ownerService = platform`, `stableId = null`), w odpowiedzi link do wgrania;
  - `POST /platform/v1/platform/releases/{id}/upload-complete`: `files attach` (kontrola `sha256`), bez tego wydanie nie wyjdzie z `draft`;
  - `POST /platform/v1/platform/releases/{id}/rollout`: `{percent, stableIds?}` → `rolling`, `rollout_percent`, `app_release_targets` (brak celów = wszystkie stajnie);
  - `POST …/{id}/complete` (100%) i `POST …/{id}/halt` (`halted`, wydanie przestaje być proponowane).
- [ ] `GET /platform/v1/tablet/latest?versionCode=&installId=` (`clients: ['tablet']`, rola `tablet`; `ops` i inne aplikacje: `403 client_not_allowed`): stajnia z `m[0].s`; wybiera najwyższy `version_code` w stanie `rolling` albo `complete`, skierowany do stajni, w którym `installId` wpada w procent (`hash(installId + releaseId) mod 100 < rollout_percent`); odpowiedź: `available`, `versionCode`, `versionName`, `sha256`, `signingCertSha256`, `sizeBytes`, `downloadUrl` (presigned GET z `files`, obsługa `Range`), `mandatory` (`versionCode` tabletu < `min_required_version_code`), okno instalacji ze strefą stajni.
- [ ] Trasy wydań poza bramką minimalnej wersji klienta: `clientVersionGate: false` z powodem w deskryptorze (mechanizm z BE-061; jeśli BE-061 nie jest jeszcze `done`, zostaw w kodzie komentarz `TODO(BE-061)` przy trasach i dopisz to w PR).
- [ ] Cofnięcie wersji to wydanie z wyższym `versionCode`; `halted` nie jest proponowane nikomu.

## Poza zakresem
- pobieranie, weryfikacja podpisu i cicha instalacja na tablecie (TAB-004, TAB-017); CLI wydań (BE-056); audyt w `platform` (BE-055).

## Kryteria akceptacji
- [ ] Ten sam `installId` dostaje tę samą odpowiedź przy kolejnych zapytaniach; przy 10% około 10% z 1000 losowych `installId` (test statystyczny z tolerancją).
- [ ] Tablet z `versionCode` poniżej `min_required_version_code` dostaje `mandatory = true`; tablet z najnowszą wersją `available = false`.
- [ ] Wydanie skierowane do Pod Lipami nie trafia do „Tablety Brzozowa”.
- [ ] `GET /tablet/latest` z tokenem `mobile`, `web` albo `ops`: 403; trasy `/platform/releases` bez `plt`: 403 albo 404 według polityki; `support` czyta, nie zapisuje.
- [ ] T-24 (backend): link pobiera plik zgodny z `sha256`, przerwane pobieranie wznawia się zapytaniem z `Range`.

## Testy
- Jednostkowe: wybór wydania, procent wdrożenia, okno instalacji w strefie stajni.
- Integracyjne: Testcontainers PostgreSQL i MinIO, prawdziwy `files` w procesie testu albo atrapa jego portu wewnętrznego; tokeny `tablet`, `ops`, `mobile` z `mintToken`.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/platform.json` w repo.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Bez tabeli urządzeń: procent liczony z lokalnego `installId` tabletu, serwer niczego o tabletach nie zapisuje (W4).
- `platform` woła tylko `files /internal`; magazynu nie dotyka.
- Plik APK ma `stable_id = NULL`, więc trafia pod osobny prefiks (wyjątek opisany w README `files`).
