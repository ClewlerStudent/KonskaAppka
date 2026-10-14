---
id: SH-002
title: "Środowisko lokalne cz. 2: broker, S3, Mailpit, fake-sms, proxy z LAN, setup"
area: shared
stage: 0
size: M
status: todo
depends_on: [BE-001]
decisions: [DEC-01]
owner:
branch:
trello: https://trello.com/c/KODHl0TQ
---
# SH-002 · Środowisko lokalne cz. 2: broker, S3, Mailpit, fake-sms, proxy z LAN, setup

## Cel
Jedno polecenie stawia lokalnie wszystko, czego potrzebują serwisy, apka, tablet i TV: bazę, broker kolejek, magazyn zgodny z S3, skrzynkę e-mail, podgląd SMS-ów i reverse proxy osiągalne z telefonu i tabletu w tej samej sieci Wi-Fi. Drugie polecenie przygotowuje dane (migracje, granty, kolejki, seed), trzecie je zeruje.

## Kontekst
- **Stan kodu:** `docker-compose.yml` w korzeniu: `auth` i `frontend` z obrazów oraz profil `infra` (`db` PostgreSQL 17 na `127.0.0.1:5433`, `zitadel-db`, `zitadel` v4.19.4 z kontem `equenor-auth`). Porty publikowane tylko na `127.0.0.1`. Sekrety z `backend/.local/` (tworzy `npm run dev:setup`, `backend/scripts/dev-setup.ts`). Migrator i `DATABASE_URL`: BE-001 (`npm run migrate` w `backend/`). Zegar: `backend/src/kit/clock.ts` (tylko zegar testowy w kodzie, bez sterowania z env).
- **Dokumenty:** `docs/development-szczegoly.md` 3.2 (compose: PostgreSQL, kolejki, S3 path-style z `S3_PUBLIC_ENDPOINT` dla LAN, reverse proxy z prefiksami `/<serwis>/` z LAN, `fake-sms` ze stroną i `GET /messages?to=`, lokalna skrzynka np. Mailpit, `setup`/`reset`, `.env.example`, opis podłączenia telefonu i tabletu), 1.3 w `docs/mikroserwisy.md` (prefiksy `/<serwis>/v1/`, porty wewnętrzne niewystawione), 5.8 (kody: `sms`/`email` z kolejki).
- **Decyzje:** DEC-01 rekomendacja B: RabbitMQ (quorum queues, DLX, TTL kolejek kodów). Kolejki zakłada `npm run messaging:setup` z BE-008; tu tylko broker i użytkownik dev. Jeśli Dawid wybierze inny broker, zmienia się usługa w compose.
- **Dane demo:** konta z README (Damian `+48 602 000 145`, Ola `+48 607 000 218`, Marta `marta@stajnielipowe.pl`); seed: BE-011.

## Zakres
- [ ] Compose (profil `infra`, bez zmiany usług `auth` i `frontend` poza env):
  - `broker`: RabbitMQ z panelem (`rabbitmq:<dokładny tag 4.x>-management-alpine`), AMQP na `127.0.0.1:5672`, UI `127.0.0.1:15672`, użytkownik `equenor`/`equenor-dev`, vhost `equenor`; plik `tools/local/rabbitmq/definitions.json` (tylko vhost i użytkownik);
  - `s3`: MinIO (albo inny serwer zgodny z S3, jeśli obraz MinIO community jest niedostępny w dniu wdrożenia; sprawdź licencję i dostępność), path-style, port API `9000`, konsola `9001`; jednorazowy kontener `s3-init` tworzy bucket `equenor-dev` (prefiksy `stables/` i `apk/` zakłada `files`, BE-039);
  - `mailpit`: SMTP `1025`, UI i API `127.0.0.1:8025` (`/api/v1/messages`, `/api/v1/search?query=to:…` dla E2E);
  - `fake-sms`: `tools/fake-sms/server.mjs` (Node bez zależności, obraz `node:22.22.x-alpine` z montowanym plikiem): `POST /messages {to, body, from}`, `GET /messages?to=+48…` (JSON, najnowsze pierwsze), `DELETE /messages`, `GET /` (HTML: wiadomości pogrupowane według numeru, liczba segmentów GSM-7/UCS-2, ostrzeżenie przy > 1 segmencie), opcjonalny zapis do JSONL; port `127.0.0.1:4090`;
  - `proxy`: Caddy (`caddy:<dokładny tag 2.x>-alpine`) z `tools/local/Caddyfile`, ścieżka przekazywana bez zmian (`handle`, nie `handle_path`): `/auth/*` → `auth:8080`, `/stables/*` → `stables:8080` i tak dla wszystkich 11 serwisów z mikroserwisy.md 5.1 (upstream, którego jeszcze nie ma, daje 502), reszta → `frontend:8081` (panel); nasłuch `${LAN_BIND:-0.0.0.0}:8000`. Trasy wewnętrzne przez proxy nie przechodzą: `*/internal/*` i `*/.well-known/*` dają 404.
- [ ] Env usług dla LAN: `LAN_HOST` (IP komputera) w `backend/.local/dev.env` uzupełnia `dev:setup` (wykrycie pierwszego adresu IPv4 spoza loopbacka, z możliwością nadpisania); `ALLOWED_ORIGINS` dostaje `http://${LAN_HOST}:8000`; `S3_ENDPOINT=http://s3:9000`, `S3_PUBLIC_ENDPOINT=http://${LAN_HOST}:9000`, `S3_FORCE_PATH_STYLE=true`, `S3_BUCKET=equenor-dev`; `MESSAGING=rabbitmq`, `MESSAGING_URL=amqp://equenor:equenor-dev@broker:5672/equenor`; `SMTP_URL=smtp://mailpit:1025`; `FAKE_SMS_URL=http://fake-sms:4090`; `DATABASE_URL` dla kontenerów (`db:5432`) i dla procesu na hoście (`localhost:5433`). Plik `backend/.env.example` z opisem każdej zmiennej (bez wartości sekretów).
- [ ] Zegar środowiska dev (dla E2E i scenariuszy A-xx na stałej dacie): `backend/src/kit/clock.ts` dostaje `clockFromEnv(env)`: `CLOCK_OFFSET_SEC` przesuwa `systemClock` o stałą liczbę sekund (czas płynie dalej); `forbidInProd`. `kit/service.ts` ustawia nagłówek `Date` z tego zegara (tablet i TV biorą czas z `Date`). Skrypt `npm run clock -- set 2026-10-13T07:15:00+02:00 | reset | show` w `backend/` zapisuje `CLOCK_OFFSET_SEC` do `backend/.local/clock.env` (czytany przez compose jako `env_file`, `required: false`) i wypisuje, które usługi zrestartować.
- [ ] Skrypty w `backend/package.json`: `setup` (`backend/scripts/setup.ts`) wykonuje po kolei kroki z rejestru: `migrate` (BE-001) → `db:grants` (BE-003) → `messaging:setup` (BE-008) → `zitadel:configure` (BE-012, tylko przy `IDP=zitadel`) → `db:seed` (BE-011, opcja `--fixed-date` ustawia też zegar); krok, którego skryptu jeszcze nie ma w `package.json`, jest pomijany z komunikatem „pominięto: brak skryptu <nazwa> (zadanie BE-xxx)”. `reset`: odmawia, gdy `APP_ENV` ≠ `dev` albo host bazy nie jest `localhost`/`db`; usuwa schematy `app` i `audit`, czyści kolejki (`rabbitmqctl purge_queue` przez API zarządzania), bucket, Mailpit (`DELETE /api/v1/messages`) i fake-sms, potem `setup`.
- [ ] Dokumentacja `tools/local/README.md` (i skrót w README.md „docker compose (dev)”): kolejność (`dev:setup`, `docker compose --profile infra up -d`, `npm run setup`), adresy usług, jak czytać kody (fake-sms `http://localhost:4090`, Mailpit `http://localhost:8025`), podłączenie telefonu i tabletu: ta sama sieć Wi-Fi, `http://<LAN_HOST>:8000` jako `EXPO_PUBLIC_API_BASE_URL`, emulator Androida `http://10.0.2.2:8000`, ruch HTTP bez TLS tylko w buildach dev (`usesCleartextTraffic` / wyjątek ATS), zapora systemu na porcie 8000 i 9000, `npm run dev:token` (BE-010) do pracy bez logowania; jak dopisać nowy serwis (usługa w compose z `command: ['npm','run','start:<serwis>']`, trasa w Caddyfile już jest).

## Poza zakresem
- Kolejki, wymiany i DLQ (BE-008), granty (BE-003), seed (BE-011), konfiguracja ZITADEL (BE-012), serwisy `sms`/`email` i ich adaptery do fake-sms i Mailpit (BE-016, BE-017).
- Usługi compose dla serwisów, których jeszcze nie ma (dodaje je zadanie danego serwisu).
- Środowiska poza laptopem (Dawid).

## Kryteria akceptacji
- [ ] `docker compose --profile infra up -d` na czystym klonie (po `dev:setup`) daje zdrowe `db`, `zitadel`, `broker`, `s3`, `mailpit`, `fake-sms`, `proxy`, `auth`, `frontend`.
- [ ] Z telefonu w tej samej sieci `http://<LAN_HOST>:8000/auth/v1/me` zwraca 401 problem+json, a `http://<LAN_HOST>:8000/` panel; `…/auth/v1/.well-known/jwks.json` przez proxy daje 404.
- [ ] `curl -X POST localhost:4090/messages -d '{"to":"+48607000218","body":"Kod 123456"}'` i `curl 'localhost:4090/messages?to=%2B48607000218'` zwracają tę wiadomość; strona `/` pokazuje ją z liczbą segmentów.
- [ ] Presigned URL wygenerowany z `S3_PUBLIC_ENDPOINT` (test skryptem `aws s3 presign` albo SDK) otwiera się z telefonu.
- [ ] `npm run setup` na pustej bazie przechodzi (kroki BE-xxx, których nie ma, są pominięte z komunikatem); drugi przebieg nic nie psuje; `npm run reset` przy `APP_ENV=prod` odmawia.
- [ ] Po `npm run clock -- set 2026-10-13T07:15:00+02:00` i restarcie `auth` nagłówek `Date` odpowiedzi to 13.10.2026 ok. 05:15 GMT; przy `APP_ENV=prod` z `CLOCK_OFFSET_SEC` auth nie startuje.

## Testy
- Vitest w `backend/`: `clockFromEnv` (offset, prod zabroniony), nagłówek `Date` z wstrzykniętego zegara (`app.inject`), `setup.ts` (pomijanie brakujących kroków, odmowa `reset`).
- Test `tools/fake-sms/server.test.mjs` uruchamiany `node --test tools/fake-sms` (bez zależności): zapis, filtr `to`, segmenty UCS-2 („ż” wymusza UCS-2, 70/67 znaków).
- Ręcznie: kryteria wyżej; `docker compose config` bez ostrzeżeń.

## Definicja gotowości
- `cd backend && npm run check` zielone; `node --test tools/fake-sms` zielone; README i `tools/local/README.md` zaktualizowane; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zwykły npm; `tools/` to nie pakiet npm: tylko pliki konfiguracyjne i skrypty bez zależności.
- Obrazy z dokładnym tagiem (jak `postgres:17.10-alpine`) i nadpisywalne z env (`RABBITMQ_IMAGE`, `S3_IMAGE`, `MAILPIT_IMAGE`, `CADDY_IMAGE`) jak istniejące `NODE_IMAGE`.
- `LAN_BIND=0.0.0.0` wystawia proxy w sieci lokalnej: tylko dev, opisz to w README; reszta portów zostaje na `127.0.0.1`.
- fake-sms nie loguje treści na stdout (kody), tylko liczbę wiadomości.
- Zegar z offsetem nie może trafić do prod: `forbidInProd` i test.
