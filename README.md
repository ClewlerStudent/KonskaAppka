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

### Uruchomienie (dev)

```sh
# backend: klucz podpisu i .local/dev.env (poza gitem; wypisuje hasło kont demo)
cd backend
npm ci
npm run dev:setup
npm run dev:auth          # auth na http://localhost:4010 (JWKS: 4011)
npm run dev:inbox         # ostatnie kody, które auth „wysłał” SMS-em albo e-mailem

# frontend (drugi terminal)
cd frontend
npm ci
npm run dev:web           # panel: http://localhost:5173 (proxy /auth → localhost:4010)
npm run dev:www           # strona www: http://localhost:5174
```

W dev i testach auth używa fałszywego dostawcy tożsamości (`IDP=fake`, dane w pamięci) zamiast ZITADEL, a kody zapisuje do skrzynki `backend/.local/inbox.jsonl` zamiast wysyłać. Restart auth czyści konta i sesje: trzeba zalogować się ponownie.

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

### Sprawdzenia

W obu katalogach: `npm run check` (typecheck, ESLint, Prettier, Vitest; w backendzie także aktualność `openapi/*.json`). Po zmianie kontraktu: `npm run openapi` w `backend/` i `npm run gen:api` we `frontend/` (oba pliki wynikowe są w repo).

E2E (Playwright, Chromium z `PLAYWRIGHT_BROWSERS_PATH`): `npm run e2e` we `frontend/`, po `npm ci` w obu katalogach. Konfiguracja sama uruchamia auth (`npm --prefix ../backend run serve:auth`), panel i stronę www na portach E2E.

### Obrazy Docker

- `backend/Dockerfile`: wieloetapowy, w obrazie tylko zależności produkcyjne i `dist/`, użytkownik `node`, system plików może być tylko do odczytu (zapis w `/tmp`). Ten sam obraz uruchamia każdy serwis inną komendą: `npm run start:auth` (później `start:stables` itd.); bez komendy wypisuje listę skryptów.
- `frontend/Dockerfile`: build panelu i strony www, potem `nginxinc/nginx-unprivileged`. Adresy (`WWW_URL`, `PANEL_URL`, `API_BASE_URL`, `CONTACT_EMAIL`) podaje env kontenera, a nginx wstawia je do HTML przy serwowaniu, więc jeden obraz działa w każdym środowisku. W produkcji Ingress kieruje host www na port 8080, a host panelu na 8081.
- `docker-compose.yml` (dev): auth z obrazu backendu (klucz efemeryczny, kody w `/tmp/inbox.jsonl` kontenera) i frontend. Start: `DEV_DEMO_PASSWORD=… docker compose up --build`, kody: `docker compose exec auth tail -n 5 /tmp/inbox.jsonl`. PostgreSQL dojdzie razem z bazą danych.

Obrazy i compose są **nieprzetestowane**: środowisko, w którym powstały, nie ma demona Dockera. Sprawdzone są tylko kroki budowania (npm ci, build) poza Dockerem, `docker compose config` i konfiguracja nginx (`nginx -t` i odpowiedzi na wyrenderowanym szablonie).

### Klucz podpisu tokenów

W dev `npm run dev:setup` generuje klucz ES256 do `backend/.local/` (poza gitem). W produkcji klucz to sekret z pliku (`SIGNING_KEY_FILE`) albo env (`SIGNING_KEY_PEM`); w repo nie ma żadnych sekretów.

### Znane ograniczenia dev

- Stan auth jest w pamięci: po restarcie trzeba zalogować się ponownie.
- Ciasteczko `__Secure-eq_rt` (`Secure`) Chromium przyjmuje na `http://localhost` (sprawdzone); Safari może go nie zapisać, wtedy po przeładowaniu panelu trzeba zalogować się ponownie.
