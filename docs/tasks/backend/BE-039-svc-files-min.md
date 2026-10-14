---
id: BE-039
title: "Serwis files: minimum"
area: backend
stage: 4
size: M
status: todo
depends_on: [BE-006, SH-002]
decisions: []
owner:
branch:
trello: https://trello.com/c/vVQre77z
---
# BE-039 · Serwis files: minimum

## Cel
Jedyny serwis z dostępem do magazynu plików zgodnego z S3. Daje innym serwisom krótkie linki do wgrania i pobrania plików (APK tabletu, załączniki zdrowia, zdjęcia koni, PDF faktur, surowe body webhooków) i trzyma ich metadane. Minimum na etap 4: tyle, ile potrzebują wydania APK (BE-040).

## Kontekst
- **Stan kodu:** serwisu nie ma. Kit ma porty wewnętrzne (`internalPorts` w `backend/src/kit/service.ts`, trasy `kind: 'internal'` z `internal.port` i `internal.callers` w `backend/src/kit/route.ts`). Polityka tras platformowych i log odczytów `plt`: BE-006. Tabela `files`: BE-004. Lokalny magazyn MinIO w trybie path-style z `S3_PUBLIC_ENDPOINT` dla LAN: SH-002 (`backend/docker-compose.yml`).
- **Dokumenty:** docs/mikroserwisy.md 5.9 (`files`: `/internal` `create`, `attach`, `download-url`, `delete`; `owner_service`; `GET /files/v1/platform/files`), 7.2 (kto woła `files`), 10.1 pkt 6 (ryzyko braku tożsamości wołającego); docs/development-szczegoly.md 3.3 `files`, 3.1.10 (klucze z prefiksem `stable_id/`), 4.2 „Presigned URL”; docs/erd.md tabela `files`, pkt 7.
- **Makiety:** brak (serwis bez UI).
- **Decyzje:** brak; magazyn zgodny z S3 bez wiązania z AWS (MinIO lokalnie, dostawca na klastrze według Dawida).
- **Dane demo:** brak plików w seedzie na tym etapie.

## Zakres
- [ ] Serwis `backend/src/services/files/` (`main.ts`, `app.ts`, `env.ts`), skrypty `start:files`, `dev:files`; kontrakt `backend/src/contracts/files.ts` w `backend/src/contracts/index.ts`.
- [ ] Lokalnie: port według tabeli „Porty serwisów” w tasks/README.md (wiersz w `backend/README.md` „Porty”).
- [ ] Adapter magazynu (`@aws-sdk/client-s3` i `@aws-sdk/s3-request-presigner`, dokładne wersje w `package.json`): env `S3_ENDPOINT`, `S3_PUBLIC_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_FORCE_PATH_STYLE`, poświadczenia z pliku (`S3_ACCESS_KEY_FILE`, `S3_SECRET_KEY_FILE`); linki podpisywane adresem publicznym.
- [ ] Trasy wewnętrzne na porcie `files` (`callers: ['operations', 'schedule', 'billing', 'stables', 'platform']`):
  - `POST /files/v1/internal/files`: `{ownerService, ownerId, stableId | null, originalName, contentType, sizeBytes, sha256}` → wiersz `pending` z kluczem `{stableId}/{ownerService}/{fileId}` (APK: `releases/{fileId}`), presigned PUT z wymuszonym `Content-Type` i `Content-Length`, ważny 15 min;
  - `POST /files/v1/internal/files/{fileId}/attach`: `HeadObject`, porównanie rozmiaru, typu i `sha256` (suma przekazana przy uploadzie jako `x-amz-checksum-sha256` albo policzona strumieniowo), `pending → attached`; niezgodność: 422;
  - `POST /files/v1/internal/files/{fileId}/download-url`: `{ownerService, ttlSeconds?}` → presigned GET (domyślnie 5 min, obsługa `Range` po stronie magazynu); tylko plik `attached`;
  - `POST /files/v1/internal/files/{fileId}/delete`: `status = deleted`, `deleted_at` (obiekt usuwa później `files-gc`, BE-051).
  - Każda trasa sprawdza `ownerService` z treści wobec `files.owner_service`; niezgodność albo brak pliku: 404.
- [ ] Trasa platformowa `GET /files/v1/platform/files?stableId=&ownerService=` (`plt = admin`): same metadane, bez linków, z wpisem w logu odczytów.
- [ ] `/readyz`: baza i JWKS (kit); błąd magazynu nie blokuje gotowości, tylko daje 503 na trasach.
- [ ] Biblioteka klienta dla serwisów wołających, np. `backend/src/lib/files-client` na bazie `backend/src/lib/internal-client/` (BE-029; adres z env `FILES_INTERNAL_URL`, typy z kontraktu, limit czasu, ponowienia tylko dla wywołań idempotentnych).

## Poza zakresem
- cron `files-gc`, zdjęcie konia i testy bezpieczeństwa pełnej wersji (BE-051); załączniki zdrowia (BE-047); PDF i webhooki (BE-052);
- NetworkPolicy i TLS między podami (manifest w BE-060, wdrożenie Dawid).

## Kryteria akceptacji
- [ ] Upload z innym `Content-Type` albo rozmiarem niż w `create` jest odrzucany przez magazyn (test na MinIO).
- [ ] `attach` z niezgodnym `sha256` daje 422 i plik zostaje `pending`.
- [ ] `download-url` dla innego `ownerService` daje 404; link wygasa po TTL (403 z magazynu).
- [ ] Trasy `/internal` nie istnieją na porcie zewnętrznym (404), a `GET /files/v1/platform/files` bez `plt` daje 403 albo 404 zgodnie z polityką.
- [ ] Klucz pliku stajni zaczyna się od `stable_id/`, a APK od `releases/` (`stable_id = NULL`).

## Testy
- Integracyjne: Testcontainers PostgreSQL i MinIO (ten sam obraz co w `backend/docker-compose.yml`), `app.inject` na instancji wewnętrznej (`service.internal.files.inject`) i zewnętrznej.
- Uruchomienie: `cd backend && npm run check`.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; `backend/openapi/files.json` (tylko trasa platformowa) w repo; README backendu: zmienne env serwisu i jak go uruchomić z MinIO z compose.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Uprawnienia użytkownika sprawdza serwis-właściciel przed wywołaniem `files`; `files` nie zna użytkownika i nie ma tokenu na `/internal`.
- Sekrety tylko z plików albo env, nigdy w repo; adaptery w pamięci tylko poza `APP_ENV=prod`.
- Bez wiązania z AWS: tylko API zgodne z S3, adres i styl ścieżek z konfiguracji.
