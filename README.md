# EQUENOR

**Equestrian Management, Refined**

Wcześniej produkt nosił roboczą nazwę eKoniuszy.

Repozytorium KonskaAppka. EQUENOR to SaaS do zarządzania stajnią: aplikacja mobilna dla właścicieli koni, adminów stajni i obsługi oraz tablet e-ink
przy każdym boksie z aktualnymi instrukcjami (karmienie, padok, weterynarz) i potwierdzeniami obsługi.

- [Architektura i analiza techniczna](docs/analiza.md)
- [Model danych (ERD) do zatwierdzenia](docs/erd.md)
- [Rozpiska mikroserwisów: 11 serwisów, jeden serwis autoryzacyjny (jedyny z dostępem do ZITADEL, dostawcy tożsamości self-hosted na naszym klastrze), logowanie hasłem i zawsze kodem, admin globalny, crony, sesje w JWT, SMS i e-mail z kolejki](docs/mikroserwisy.md)
- [Paleta kolorów](docs/paleta.md)
- [Development, testy i zakupy](docs/development.md) (pełna wersja ze źródłami: [szczegóły](docs/development-szczegoly.md))
- [Makiety (kanwas)](https://claude.ai/artifact/SjdCnhTF5eqXy2vRaSMUtX)
- [Plan brakujących makiet: rejestracja, ekrany główne, urządzenia](docs/makiety-plan.md)

## Kod

Dwa niezależne pakiety npm (bez pnpm, workspaces i Turborepo), każdy z własnym `package-lock.json` i Dockerfile:

| Katalog | Co | Obraz |
|---|---|---|
| `backend/` | TypeScript, Fastify: `src/kit` (szablon serwisu), `src/lib/auth` (weryfikacja tokenów EQUENOR), `src/contracts` (kontrakty tras w zod → `openapi/*.json`), `src/services/<serwis>` (na razie `auth`), później `src/jobs/<cron>` | jeden obraz dla wszystkich serwisów; serwis wybiera komenda, np. `npm run start:auth` |
| `frontend/` | panel web (`web/`, React, Vite, TanStack Router), strona www (`www/`, statyczny HTML), wspólne `src/theme` (tokeny z [palety](docs/paleta.md), fonty Figtree lokalnie) i `src/api` (typy wygenerowane z `backend/openapi`) | nginx bez roota: www na porcie 8080, panel na 8081 |

Frontend niczego nie importuje z `backend/`, więc da się go wydzielić do osobnego repo (zmienia się tylko ścieżka w `npm run gen:api`). Serwis nie importuje innego serwisu (reguła ESLint).

Struktura opisana w docs/development-szczegoly.md 3.1.1 (pnpm, Turborepo, `packages/*`) jest nieaktualna: obowiązuje układ powyżej.

### Wymagania

Node 22.22 (`.nvmrc`) i npm 10. Docker tylko do obrazów i `docker compose`.

### Uruchomienie lokalne (dev)

Trzy terminale. Najpierw backend (klucz podpisu i env dev są w `backend/.local/`, poza gitem):

```sh
cd backend
npm ci
npm run dev:setup         # raz: .local/signing-key.pem (ES256) i .local/dev.env; wypisuje hasło kont demo
npm run dev:auth          # auth: http://localhost:4010 (trasy /auth/v1/…), JWKS: http://localhost:4011
```

Potem panel i strona www:

```sh
cd frontend
npm ci
npm run dev:web           # panel: http://localhost:5173 (Vite przekazuje /auth do localhost:4010)
npm run dev:www           # strona www: http://localhost:5174 (przyciski prowadzą do panelu)
```

Auth bez trybu watch, tak jak w obrazie: `npm run build`, a potem `npm run start:auth` z env z `.local/dev.env` (np. `set -a; . .local/dev.env; set +a; npm run start:auth`).

### Logowanie w dev

1. Otwórz http://localhost:5173 (albo „Zaloguj się” na stronie www).
2. Wpisz telefon konta demo (np. Ola: `607 000 218`) i hasło `DEV_DEMO_PASSWORD` z `backend/.local/dev.env`.
3. Kod MFA odczytaj w `backend/`: `npm run dev:inbox` (ostatnie 5 wiadomości; `npm run dev:inbox -- 20` pokazuje więcej).
4. Po wpisaniu kodu panel pokazuje „Witaj w EQUENOR, Ola”. „Wyloguj” wraca do logowania.

W dev i testach auth używa fałszywego dostawcy tożsamości (`IDP=fake`, dane w pamięci) zamiast ZITADEL. Kody nie wychodzą jako SMS ani e-mail: auth dopisuje je do skrzynki `backend/.local/inbox.jsonl` (`DEV_INBOX_FILE`). Rejestracja („Załóż konto”) działa tak samo: kod potwierdzenia (8 cyfr) jest w tej skrzynce.

Logowanie hasłem i trasy rejestracji odpowiadają najwcześniej po 400 ms, także przy błędzie: nieznane konto, złe hasło i zajęty kontakt dają tę samą treść i ten sam czas odpowiedzi.

### Konta demo

Fikcyjne kontakty, hasło wszystkich kont to `DEV_DEMO_PASSWORD` z `backend/.local/dev.env`. Kontakty są już potwierdzone.

| Osoba | Telefon | E-mail | Kod MFA |
|---|---|---|---|
| Damian | +48 602 000 145 | damian@stajnielipowe.pl | SMS |
| Ola | +48 607 000 218 | — | SMS |
| Anna | +48 600 000 412 | — | SMS |
| Marta | — | marta@stajnielipowe.pl | e-mail |

### Porty

| Co | dev | E2E | kontener | compose (host) |
|---|---|---|---|---|
| auth (trasy zewnętrzne i otwarte) | 4010 | 4110 | 8080 | 127.0.0.1:4010 |
| auth JWKS (wewnętrzny) | 4011 | 4111 | 8081 | niepublikowany |
| panel web | 5173 | 5273 | 8081 (nginx) | 127.0.0.1:8081 |
| strona www | 5174 | 5274 | 8080 (nginx) | 127.0.0.1:8080 |
| panel web zbudowany (CSP w E2E) | — | 5275 | — | — |

### Sprawdzenia

W obu katalogach: `npm run check` (typecheck, ESLint, Prettier, Vitest; w backendzie także aktualność `openapi/*.json`) i `npm run build`. Po zmianie kontraktu: `npm run openapi` w `backend/` i `npm run gen:api` we `frontend/` (oba pliki wynikowe są w repo).

E2E (Playwright, Chromium z `PLAYWRIGHT_BROWSERS_PATH`): `npm run e2e` we `frontend/`, po `npm ci` w obu katalogach. Konfiguracja sama uruchamia auth (`npm --prefix ../backend run serve:auth`, klucz efemeryczny, skrzynka `frontend/e2e/.tmp/inbox.jsonl`), panel i stronę www na portach E2E. Testy:

- `e2e/auth.spec.ts`: panel z prawdziwym auth (logowanie Damiana, Oli i Marty, zły kod i hasło, ciasteczko, przeładowanie, wylogowanie, rejestracja);
- `e2e/panel.spec.ts`: panel na atrapie API (te same ekrany, 1440 i 390 px), a na końcu zbudowany panel (`dist/e2e-web`, `vite preview`) z CSP z `nginx/default.conf.template`, łącznie z Trusted Types: przepływ logowania nie może dać żadnego naruszenia CSP;
- `e2e/www.spec.ts`: strona www (treść, linki do panelu, układ 1440 i 390 px, brak żądań poza localhost).

E2E podnosi limity żądań auth (`RATE_LIMIT_FACTOR=10`, dozwolone tylko poza prod), bo loguje to samo konto kilkanaście razy w 15 minut.

### Obrazy Docker

**Backend: jeden obraz, serwis wybiera komenda z `package.json`.** `backend/Dockerfile` jest wieloetapowy: w obrazie są tylko zależności produkcyjne i `dist/`, proces działa jako `node`, a system plików może być tylko do odczytu (zapis w `/tmp`).

```sh
docker build -t equenor-backend backend
docker run --rm equenor-backend                          # bez komendy: lista skryptów (npm run)
docker run --rm -p 4010:8080 --read-only --tmpfs /tmp \
  -e APP_ENV=dev -e AUTH_ISSUER=http://localhost:4010/auth/v1 -e ALLOWED_ORIGINS=http://localhost:8081 \
  -e SIGNING_KEY_EPHEMERAL=true -e IDP=fake -e CODE_SENDER=dev-inbox -e DEV_INBOX_FILE=/tmp/inbox.jsonl \
  -e DEV_DEMO_PASSWORD=… equenor-backend npm run start:auth
```

Każdy serwis to `src/services/<serwis>/main.ts` i skrypt `start:<serwis>` (`exec node dist/services/<serwis>/main.js`); dziś jest `start:auth`, później `start:stables`, `start:operations` itd. W Kubernetes każdy Deployment używa tego samego obrazu z inną komendą, np. `command: ["npm", "run", "start:auth"]`. SIGTERM dochodzi przez `tini` i `npm` do procesu serwisu, który kończy się łagodnie (`/readyz` daje 503, potem zamknięcie połączeń).

Auth celowo nie wystartuje z `APP_ENV=prod`, dopóki nie ma adaptera ZITADEL i kolejek kodów: fałszywe adaptery, klucz efemeryczny, `LOG_PRETTY` i `RATE_LIMIT_FACTOR` ≠ 1 są w prod zabronione. Za Ingressem ustaw `TRUST_PROXY` na adresy albo podsieci proxy przed podem (np. CIDR podsieci ALB i ingress-nginx: `TRUST_PROXY=10.0.0.0/16`, po przecinku kilka), inaczej limity na IP liczą adres proxy. Adres klienta to pierwszy od prawej wpis `X-Forwarded-For` spoza tej listy. `TRUST_PROXY=true` jest odrzucane, bo lewe wpisy podaje klient i mógłby nimi obejść limity; liczby przeskoków Fastify nie obsługuje (nie ufa wtedy nikomu).

**Frontend: build panelu i strony www, potem `nginxinc/nginx-unprivileged`** (www na porcie 8080, panel na 8081). Adresy (`WWW_URL`, `PANEL_URL`, `API_BASE_URL`, `CONTACT_EMAIL`) podaje env kontenera, a nginx wstawia je do HTML przy serwowaniu, więc jeden obraz działa w każdym środowisku. W produkcji Ingress kieruje host www na port 8080, a host panelu na 8081.

```sh
docker build -t equenor-frontend frontend
docker run --rm -p 8080:8080 -p 8081:8081 \
  -e WWW_URL=http://localhost:8080 -e PANEL_URL=http://localhost:8081 -e API_BASE_URL=http://localhost:4010 \
  equenor-frontend
```

### docker compose (dev)

`docker-compose.yml` w korzeniu stawia lokalnie to, co dziś działa, z tych samych obrazów co produkcja:

| Usługa | Co | Adres |
|---|---|---|
| `auth` | obraz backendu z komendą `npm run start:auth`, fałszywy IdP, kody do `/tmp/inbox.jsonl` w kontenerze | http://localhost:4010 (JWKS tylko w sieci compose: `auth:8081`) |
| `frontend` | obraz frontendu: www i panel | www http://localhost:8080, panel http://localhost:8081 |
| `db` (profil `infra`) | PostgreSQL 17 dla aplikacji, pod bazę z ERD | `localhost:5433`, baza i użytkownik `equenor`, hasło `equenor-dev` |
| `zitadel-db`, `zitadel` (profil `infra`) | ZITADEL v4.19.4 z osobną bazą, bez własnego ekranu logowania; konto serwisowe dla `auth` (rola `IAM_LOGIN_CLIENT`) i jego token w wolumenie `zitadel-bootstrap` | konsola http://localhost:8082/ui/console (`admin` / `Admin-dev-1234!`) |

```sh
npm --prefix backend ci && npm --prefix backend run dev:setup   # raz: klucz podpisu, hasło demo, masterkey ZITADEL w backend/.local/
docker compose up --build                                       # auth + frontend
docker compose exec auth tail -n 5 /tmp/inbox.jsonl             # kody logowania
docker compose --profile infra up --build                       # + baza aplikacji i ZITADEL
docker compose --profile infra down -v                          # stop i usunięcie danych
```

- **Sekrety z plików, nie z env:** klucz podpisu (`backend/.local/signing-key.pem`) i masterkey ZITADEL (`backend/.local/zitadel-masterkey`) wchodzą jako `secrets` compose. Hasło kont demo bierze się z `backend/.local/dev.env`.
- **Uprawnienia:** pliki w `backend/.local/` mają tryb 600, a `auth` czyta je jako `EQ_UID:EQ_GID` (domyślnie 1000:1000). Przy innym uid: `EQ_UID=$(id -u) EQ_GID=$(id -g) docker compose up`.
- **Mirror obrazów:** przy limitach Docker Hub obrazy bazowe podmienia env: `NODE_IMAGE`, `NGINX_IMAGE`, `POSTGRES_IMAGE`, `ZITADEL_IMAGE` (np. `NODE_IMAGE=mirror.gcr.io/library/node:22.22.3-alpine3.24`).
- **ZITADEL czeka na adapter:** `auth` w compose dalej używa fałszywego IdP. Adapter ma wołać `http://zitadel:8080` z nagłówkiem `Host: localhost:8082`, bo ZITADEL rozpoznaje instancję po domenie zewnętrznej.

**Co sprawdziłem (14.10, Docker 29.8 w środowisku z ograniczonym dostępem do sieci):**
- zbudowały się oba obrazy: backend 258 MB, frontend 92 MB;
- `docker compose up` daje oba kontenery zdrowe, a JWKS jest osiągalny z innego kontenera na porcie wewnętrznym;
- pełne logowanie w Chromium na stosie z compose przechodzi: link z www do panelu, telefon Oli i hasło, kod ze skrzynki w kontenerze, Witaj, przeładowanie (sesja z ciasteczka), wylogowanie, bez błędów konsoli;
- profil `infra`: obie bazy PostgreSQL wstają zdrowe;
- frontend chodzi z `read_only` (tmpfs dla `/tmp` i `/etc/nginx/conf.d`).

**Czego nie sprawdziłem:**
- Kontener ZITADEL: w tym środowisku polityka sieci blokuje ghcr.io. Konfigurację wziąłem z oficjalnego compose ZITADEL, a flagi `--masterkeyFile` i `--tlsMode` sprawdziłem w źródłach.
- `apk add tini`: repozytorium Alpine też było zablokowane, więc test zrobiłem na obrazie bez `tini`, z `init: true`.

### Klucz podpisu tokenów

W dev `npm run dev:setup` generuje klucz ES256 do `backend/.local/signing-key.pem` (poza gitem; `.gitignore` pomija też `*.pem` i `.local/` w całym repo). W produkcji klucz to sekret z pliku (`SIGNING_KEY_FILE`) albo env (`SIGNING_KEY_PEM`); w repo nie ma żadnych sekretów.

### Znane ograniczenia dev

- Stan auth jest w pamięci: po restarcie auth trzeba zalogować się ponownie (stare ciasteczko dostaje `session_revoked`).
- Ciasteczko `__Secure-eq_rt` (`Secure`) Chromium przyjmuje na `http://localhost` (sprawdzone); Safari może go nie zapisać, wtedy po przeładowaniu panelu trzeba zalogować się ponownie.
- Przy otwarciu panelu bez sesji konsola przeglądarki pokazuje 401 z `POST /auth/v1/token`: to ciche sprawdzenie sesji z ciasteczka, po którym panel przechodzi do logowania.
- Po 5 złych kodach MFA konto jest zablokowane (403 `account_locked`) do restartu auth, a reset hasła jeszcze nie działa: „Nie pamiętam hasła” to na razie zaślepka (PanelResetHasla w kolejnym kroku).
