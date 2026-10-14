# Kolejka zadań: protokół dla agentów

Każde zadanie to jeden plik `tasks/<obszar>/<ID>-<slug>.md` z nagłówkiem (status, zależności, decyzje) i treścią, która wystarcza do pracy bez dodatkowych pytań: cel, kontekst (stan kodu, docs, makiety, decyzje, dane demo), zakres, poza zakresem, kryteria akceptacji, testy, definicja gotowości i uwagi. Źródłem prawdy o statusie jest repo, nie Trello.

| Plik | Co to |
|---|---|
| [QUEUE.md](QUEUE.md) | przegląd: liczby, „gotowe do wzięcia”, tabele per obszar, decyzje (generowany, nie edytuj) |
| [decisions.md](decisions.md) | otwarte decyzje właściciela DEC-xx z rekomendacją i tym, co robić do czasu decyzji |
| [queue.mjs](queue.mjs) | narzędzie kolejki (Node 22, bez zależności) |
| [_TEMPLATE.md](_TEMPLATE.md) | szablon nowego zadania |

| Obszar | Prefiks | Katalog zadań | Kod |
|---|---|---|---|
| backend | `BE` | [backend/](backend/) | `backend/` (serwisy, crony, `src/lib`, kontrakty, skrypty) |
| web | `WEB` | [web/](web/) | `frontend/` (panel admina, widok wyświetlacza TV, strona www), `tools/display-kiosk` |
| mobile | `MOB` | [mobile/](mobile/) | `mobile/` (Expo, DEC-02) |
| tablet | `TAB` | [tablet/](tablet/) | `tablet/` (Expo + moduł kiosku w Kotlinie, DEC-02), `tools/provision-tablet` |
| shared | `SH` | [shared/](shared/) | docs, `docker-compose.yml`, `ci/`, `tools/codegen`, testy akceptacyjne |

## Komendy

```sh
node tasks/queue.mjs next --area backend      # gotowe do wzięcia (domyślnie 10; --all, --json)
node tasks/queue.mjs show BE-013              # zależności (ze statusem), decyzje, zadania zależne
node tasks/queue.mjs list --area web --status in_progress
node tasks/queue.mjs claim BE-013 <owner> [gałąź]
node tasks/queue.mjs set BE-013 review        # todo | in_progress | review | done | blocked
node tasks/queue.mjs set BE-013 blocked --reason "czeka na DEC-01"
node tasks/queue.mjs check                    # spójność plików, zależności, decyzji i QUEUE.md (kod 1 przy błędach)
node tasks/queue.mjs index                    # przegenerowanie QUEUE.md i list „Zadania” w decisions.md
node --test tasks/queue.test.mjs              # testy narzędzia
```

`claim` i `set` same uruchamiają `index`. Po ręcznej zmianie nagłówka zadania uruchom `index`, inaczej `check` zgłosi nieaktualny QUEUE.md.

## 1. Wybór zadania

1. Zaktualizuj gałąź integracyjną (tę, na której leży kolejka: dziś `claude/affectionate-bell-325org`, po scaleniu `main`): `git pull`.
2. `node tasks/queue.mjs next --area <obszar>`. Bierz pierwsze z listy, chyba że masz powód (np. kontynuacja własnego poprzedniego zadania). „Gotowe” znaczy: status `todo`, wszystkie `depends_on` mają `done` i żadna otwarta decyzja go nie blokuje.
3. Jeden agent, jedno zadanie w toku. Rozmiar: `S` mały PR, `M` typowy PR, `L` duży PR (wolno kilka commitów i PR-ów na tej samej gałęzi zadania, ale zadanie kończy się jednym statusem `done`).

## 2. Przejęcie

1. `node tasks/queue.mjs claim <ID> <owner>`: ustawia `status: in_progress`, `owner` i `branch` (domyślnie `claude/<ID>-<slug>`; inna gałąź jako trzeci argument, jeśli tak ustalono z właścicielem). `owner` to identyfikator, po którym da się Cię znaleźć (np. nazwa sesji agenta).
2. Od razu commit samego `tasks/` na gałęzi integracyjnej (`kolejka: <ID> przejęte (<owner>)`) i `git push`. Push odrzucony: `git pull --rebase`, `node tasks/queue.mjs check`; jeśli ktoś przejął zadanie przed Tobą, weź inne.
3. Dopiero potem gałąź zadania od gałęzi integracyjnej i praca.

`claim` odmawia, gdy zadanie nie jest `todo`, ma niezakończone zależności albo czeka na decyzję. `--force` tylko na wyraźne polecenie właściciela.

## 3. Praca

- Przeczytaj cały plik zadania, potem wskazane fragmenty docs i kod z „Kontekstu”. Sprawdź `node tasks/queue.mjs show <ID>`: decyzje i stan zależności.
- **Pierwszeństwo źródeł:** decyzje już podjęte (niżej) → rozstrzygnięte DEC → rekomendacja otwartej DEC (z wierszem „Do czasu decyzji”) → plik zadania → docs/mikroserwisy.md → docs/erd.md → docs/development-szczegoly.md i development.md → makiety. Fragmenty docs sprzeczne z decyzjami są nieaktualne (porządkuje je SH-001); nie implementuj ich.
- **Zwykły npm.** Żadnego pnpm, Turborepo, workspaces ani `packages/*`. Każdy pakiet (`backend/`, `frontend/`, `mobile/`, `tablet/`) ma własny `package-lock.json` i dokładne wersje zależności. Pakiety niczego od siebie nie importują; typy API tylko z `backend/openapi/*.json` przez `npm run gen:api`.
- **Infrastruktura nie jest nasza.** Klaster, bazy, backupy, monitoring, DNS, sekrety produkcyjne i system CI robi Dawid. Dostarczamy kod, skrypty, manifesty i opisy (np. listę ról bazy, skrypt grantów, manifest kolejek, kroki CI w `ci/*.sh`). Nie dodawaj zadań infrastrukturalnych do kolejki.
- Zmiany kontraktów API tylko addytywne w `/v1`; po zmianie `npm run openapi` w `backend/` i `npm run gen:api` u konsumentów. Nowa trasa otwarta (bez tokenu) = wpis w `backend/open-routes.txt` z limitem.
- Bez sekretów w repo, bez danych osobowych i kodów w logach. Testy razem z kodem.
- Nie rozszerzaj po cichu cudzego zakresu. Gdy potrzebujesz zmiany w innym obszarze: mała addytywna zmiana w tym samym PR z opisem albo nowe zadanie (punkt 6) i zależność.
- Coś działa „na rekomendacji” otwartej DEC: trzymaj to w konfiguracji albo za interfejsem i napisz o tym w PR.

## 4. Definicja gotowości (wspólna dla wszystkich zadań)

- Kryteria akceptacji w pliku zadania odhaczone (`- [x]`); to, czego nie zrobiono, opisane w „Uwagach dla wykonawcy” z powodem (i, jeśli trzeba, nowe zadanie).
- W każdym dotkniętym pakiecie zielone `npm run check` i `npm run build` (w `backend/` `check` zawiera `openapi:check`); nowe zachowanie ma testy.
- README albo docs zaktualizowane, gdy zmieniają się komendy, env, porty albo zachowanie widoczne dla innych zadań.
- `node tasks/queue.mjs check` zielony.
- Opis PR (albo commita): co zrobione, które DEC na rekomendacji, odstępstwa od pliku zadania, nowe zadania.

## 5. Przegląd i zakończenie

- PR gotowy: `node tasks/queue.mjs set <ID> review` w gałęzi zadania (commit razem z PR).
- Po akceptacji, przed scaleniem: `node tasks/queue.mjs set <ID> done` w gałęzi zadania, żeby scalenie od razu odblokowało zadania zależne. Jeśli ktoś scalił bez tego: commit `set <ID> done` na gałęzi integracyjnej.
- Konflikt przy scalaniu w `QUEUE.md` albo w liniach „Zadania” w `decisions.md`: rozwiąż konflikty w plikach zadań, potem `node tasks/queue.mjs index` (te miejsca są generowane, nie scalaj ich ręcznie).
- Porzucenie zadania: `set <ID> todo` (czyści `owner` i `branch`); co zostało zrobione i co dalej, dopisz w „Uwagach dla wykonawcy”.

## 6. Blokada

1. `node tasks/queue.mjs set <ID> blocked --reason "…"`: dopisuje datę i powód do sekcji `## Blokada` w pliku zadania.
2. Powód nazywa konkretną przyczynę: decyzję (`DEC-xx`; brakującą dopisz do decisions.md jako nową, z pytaniem, opcjami i rekomendacją), zadanie (`BE-0xx`, dopisz je do `depends_on`) albo brak po stronie infrastruktury (co i od kogo).
3. Commit i push na gałęzi integracyjnej, żeby inni to widzieli; daj znać właścicielowi.
4. Po odblokowaniu: `set <ID> in_progress` (z tym samym wykonawcą) albo `set <ID> todo` (zwolnienie).

## 7. Nowe zadanie

1. Skopiuj [_TEMPLATE.md](_TEMPLATE.md) do `tasks/<obszar>/<PREFIKS>-<numer>-<slug>.md`. Numer: kolejny wolny w obszarze (`node tasks/queue.mjs list --area <obszar>`), trzy cyfry; slug krótki, po angielsku albo bez polskich znaków, z myślnikami.
2. Wypełnij wszystkie sekcje tak, żeby agent bez historii rozmowy mógł zacząć: konkretne ścieżki plików, trasy, tabele, nazwy makiet, dane demo, odwołania do docs z numerami punktów.
3. Ustaw `stage` (etap 0–9 jak niżej), `size`, `depends_on`, `decisions`; `status: todo`, `owner`, `branch`, `trello` puste.
4. Jeśli nowe zadanie zmienia zakres istniejącego, popraw też tamten plik („Zakres” albo „Poza zakresem”, z odwołaniem).
5. `node tasks/queue.mjs check` i `index`, commit na gałęzi integracyjnej.

Etapy (docs/development-szczegoly.md 3.6): 0 fundament (warstwy bazy, kit, środowisko, CI, szkielety apek, bramka sprzętowa tabletu); 1 logowanie i konto firmy; 2 stajnia, hale, boksy, konie; 3 flagi; 4 tablica i tablet; 5 wyświetlacz; 6 karmienie, padok i rutyna obsługi; 7 zdrowie, jazdy, zadania; 8 płatności; 9 przed stajnią pilotażową.

## 8. Trello

- Pole `trello:` w nagłówku to link do karty (`https://trello.com/c/…`); `check` ostrzega przy innym formacie.
- Karta odzwierciedla zadanie, nie odwrotnie: tytuł `<ID> · <tytuł>`, w opisie link do pliku zadania w repo i „Cel”; lista na tablicy odpowiada statusowi (`todo` Do zrobienia, `in_progress` W toku, `review` Przegląd, `done` Gotowe, `blocked` Zablokowane).
- Kto zmienia status w repo (`claim`, `set`), ten przesuwa kartę, jeśli ma dostęp do Trello; jeśli nie ma, zostawia to właścicielowi. Karta bez pliku zadania nie jest zadaniem dla agenta: najpierw powstaje plik (punkt 7).
- Zmiany zrobione tylko na tablicy (np. nowy priorytet) przenosi do repo właściciel albo agent na jego polecenie.

## Decyzje już podjęte

Przyjęte przez właściciela 13–14.10.2026; mają pierwszeństwo przed docs, które jeszcze ich nie uwzględniają (pnpm, Turborepo, `packages/*`, KMS, `signing_keys`, `identity_pool`, osobna pula kont zespołu to stan nieaktualny):

- Zwykły npm. `backend/` to jeden pakiet i jeden obraz Docker; serwis wybiera `npm run start:<serwis>` (`src/services/<serwis>/main.ts`); wspólny kod w `src/kit`, `src/lib/*`, kontrakty w `src/contracts` → `openapi/*.json`; crony w `src/jobs/<cron>`.
- `frontend/` osobno (www i panel: React, Vite, TanStack Router; typy z `backend/openapi`), własny Dockerfile, bez importów z `backend/`. Apka mobilna i tablet w Expo/React Native (tablet z modułem kiosku w Kotlinie, Device Owner); położenie katalogów: DEC-02.
- 11 serwisów: `auth` (jedyny autoryzacyjny, wydaje JWT ES256), `stables`, `operations`, `schedule`, `board` (tylko odczyt), `billing`, `files`, `platform`, `notifications`, `sms`, `email` (bez bazy). 9 cronów pisze wprost do bazy z rolą z manifestu, bez tokenów serwisowych. Pozostałe serwisy tylko weryfikują podpis JWT z JWKS.
- Logowanie: aplikacje rozmawiają tylko z `auth`; hasło i zawsze kod MFA e-mailem albo SMS-em; rejestracja z potwierdzeniem kodem. Dostawca tożsamości: ZITADEL self-hosted; kody wracają do `auth` (`return_code`), a `auth` wysyła je przez kolejki do `sms` i `email`.
- Refresh token to JWT bez sesji w bazie (`users.token_version`). Klucz podpisu JWT to sekret od właściciela (bez KMS). Konta zespołu EQUENOR (admin globalny) to uprawnienie platformowe w `auth` (`platform_roles` → claim `plt`), bez osobnej puli kont.
- Trasy: zewnętrzne (z tokenem), otwarte (bez tokenu, jawnie oznaczone, lista w teście, limity), wewnętrzne (osobny port).
- PoC tani. Infrastrukturę robi Dawid; zadania infrastrukturalne nie wchodzą do kolejki.
