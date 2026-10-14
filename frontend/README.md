# EQUENOR: frontend

Panel web i strona www EQUENOR, SaaS do zarządzania stajnią. Repo w grupie [equinor-group](https://gitlab.com/groups/equinor-group), obok:

- [backend](https://gitlab.com/equinor-group/backend): serwisy (na razie auth), kontrakty API (`openapi/*.json`), `docker-compose.yml` do dev;
- [docs](https://gitlab.com/equinor-group/docs): dokumentacja, makiety (`mockups/`) i kolejka zadań dla agentów (`tasks/`, zadania panelu web i TV to obszar `web`).

## Workspace

Repozytoria klonuje się obok siebie:

```
equenor/
  backend/    git clone https://gitlab.com/equinor-group/backend.git
  frontend/   git clone https://gitlab.com/equinor-group/frontend.git
  docs/       git clone https://gitlab.com/equinor-group/docs.git
```

Ścieżki w zadaniach i komentarzach są pisane od korzenia workspace: `frontend/web/…`, `docs/paleta.md`, `docs/mockups/…`. Pliki z sąsiednich repo frontend czyta tylko w trzech miejscach: `npm run gen:api` (`../backend/openapi`), E2E (`../backend`, auth) i test palety (`../docs/paleta.md`). `npm ci`, `npm run check` i `npm run build` działają bez nich.

## Kod

Pakiet npm z własnym `package-lock.json` i Dockerfile (bez pnpm, workspaces i Turborepo):

| Katalog     | Co                                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| `web/`      | panel web: React, Vite, TanStack Router                                                                                |
| `www/`      | strona www: statyczny HTML                                                                                             |
| `src/theme` | tokeny z [palety](https://gitlab.com/equinor-group/docs/-/blob/main/paleta.md), ikony z makiet, fonty Figtree lokalnie |
| `src/api`   | klient tras auth i typy wygenerowane z `../backend/openapi` (`src/api/auth.d.ts` jest w repo)                          |
| `e2e/`      | testy Playwright                                                                                                       |
| `nginx/`    | szablon nginx obrazu (CSP, podmiana adresów)                                                                           |

Frontend niczego nie importuje z backendu (reguła ESLint): z repo backend bierze tylko `openapi/*.json` przy `npm run gen:api`.

## Wymagania

Node 22.22 (`.nvmrc`) i npm 10. Docker tylko do obrazu i `docker compose`.

## Uruchomienie lokalne (dev)

Panel potrzebuje działającego auth z repo backend: w `../backend` `npm ci`, raz `npm run dev:setup`, potem `npm run dev:auth` (auth na http://localhost:4010). Szczegóły: [README backendu](https://gitlab.com/equinor-group/backend/-/blob/main/README.md).

Potem tutaj, w osobnych terminalach:

```sh
npm ci
npm run dev:web           # panel: http://localhost:5173 (Vite przekazuje /auth do localhost:4010)
npm run dev:www           # strona www: http://localhost:5174 (przyciski prowadzą do panelu)
```

Adresy dev są w `.env` (bez sekretów, w repo); nadpisania lokalne w `.env.local` (poza gitem). Inny adres auth dla proxy: `AUTH_PROXY_TARGET`.

## Logowanie w dev

1. Otwórz http://localhost:5173 (albo „Zaloguj się” na stronie www).
2. Wpisz telefon konta demo (np. Ola: `607 000 218`) i hasło `DEV_DEMO_PASSWORD` z `../backend/.local/dev.env`. Lista kont: [Konta demo w README backendu](https://gitlab.com/equinor-group/backend/-/blob/main/README.md#konta-demo).
3. Kod MFA odczytaj w repo backend: `npm run dev:inbox`. Tam też jest kod potwierdzenia przy rejestracji („Załóż konto”).
4. Po wpisaniu kodu panel pokazuje „Witaj w EQUENOR, Ola”. „Wyloguj” wraca do logowania.

## Porty

| Co                              | dev  | E2E  | kontener     | compose (host) |
| ------------------------------- | ---- | ---- | ------------ | -------------- |
| panel web                       | 5173 | 5273 | 8081 (nginx) | 127.0.0.1:8081 |
| strona www                      | 5174 | 5274 | 8080 (nginx) | 127.0.0.1:8080 |
| panel web zbudowany (CSP w E2E) | —    | 5275 | —            | —              |

Auth: 4010 w dev, 4110 w E2E. Pełna tabela: [Porty w README backendu](https://gitlab.com/equinor-group/backend/-/blob/main/README.md#porty).

## Sprawdzenia

`npm run check` (typecheck, ESLint, Prettier, Vitest) i `npm run build`. Test zgodności tokenów z paletą czyta `paleta.md` z repo docs obok (`../docs`); bez niego jest pomijany.

Po zmianie kontraktu: `npm run openapi` w repo backend, potem `npm run gen:api` tutaj (czyta `../backend/openapi/auth.json`, zapisuje `src/api/auth.d.ts`; oba pliki wynikowe są w repo).

E2E (Playwright, Chromium z `PLAYWRIGHT_BROWSERS_PATH`): `npm run e2e`. Wymaga repo backend obok (`../backend`) i `npm ci` w nim i tutaj. Konfiguracja sama uruchamia auth (`npm --prefix ../backend run serve:auth`, klucz efemeryczny, skrzynka `e2e/.tmp/inbox.jsonl`), panel i stronę www na portach E2E. Testy:

- `e2e/auth.spec.ts`: panel z prawdziwym auth (logowanie Damiana, Oli i Marty, zły kod i hasło, ciasteczko, przeładowanie, wylogowanie, rejestracja);
- `e2e/panel.spec.ts`: panel na atrapie API (te same ekrany, 1440 i 390 px), a na końcu zbudowany panel (`dist/e2e-web`, `vite preview`) z CSP z `nginx/default.conf.template`, łącznie z Trusted Types: przepływ logowania nie może dać żadnego naruszenia CSP;
- `e2e/www.spec.ts`: strona www (treść, linki do panelu, układ 1440 i 390 px, brak żądań poza localhost).

E2E podnosi limity żądań auth (`RATE_LIMIT_FACTOR=10`, dozwolone tylko poza prod), bo loguje to samo konto kilkanaście razy w 15 minut.

## Obraz Docker

Build panelu i strony www, potem `nginxinc/nginx-unprivileged` (www na porcie 8080, panel na 8081). Adresy (`WWW_URL`, `PANEL_URL`, `API_BASE_URL`, `CONTACT_EMAIL`) podaje env kontenera, a nginx wstawia je do HTML przy serwowaniu, więc jeden obraz działa w każdym środowisku. W produkcji Ingress kieruje host www na port 8080, a host panelu na 8081. Obraz bazowy podmienia `--build-arg NODE_IMAGE=…` i `NGINX_IMAGE=…` (np. mirror przy limitach Docker Hub).

```sh
docker build -t equenor-frontend .
docker run --rm -p 8080:8080 -p 8081:8081 \
  -e WWW_URL=http://localhost:8080 -e PANEL_URL=http://localhost:8081 -e API_BASE_URL=http://localhost:4010 \
  equenor-frontend
```

## docker compose (dev)

`docker-compose.yml` jest w repo backend: stawia auth i ten frontend z tych samych obrazów co produkcja (www http://localhost:8080, panel http://localhost:8081). Frontend buduje z `../frontend`, czyli z tego repo sklonowanego obok, albo z `FRONTEND_DIR`. Opis: [README backendu](https://gitlab.com/equinor-group/backend/-/blob/main/README.md).

## Znane ograniczenia dev

- Stan auth jest w pamięci: po restarcie auth trzeba zalogować się ponownie.
- Ciasteczko `__Secure-eq_rt` (`Secure`) Chromium przyjmuje na `http://localhost` (sprawdzone); Safari może go nie zapisać, wtedy po przeładowaniu panelu trzeba zalogować się ponownie.
- Przy otwarciu panelu bez sesji konsola przeglądarki pokazuje 401 z `POST /auth/v1/token`: to ciche sprawdzenie sesji z ciasteczka, po którym panel przechodzi do logowania.
- „Nie pamiętam hasła” to na razie zaślepka (PanelResetHasla w kolejnym kroku).
