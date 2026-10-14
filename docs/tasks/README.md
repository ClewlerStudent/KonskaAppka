# Kolejka zadań: protokół dla agentów

Każde zadanie to jeden plik `tasks/<obszar>/<ID>-<slug>.md` z nagłówkiem (status, zależności, decyzje) i treścią, która wystarcza do pracy bez dodatkowych pytań: cel, kontekst (stan kodu, docs, makiety, decyzje, dane demo), zakres, poza zakresem, kryteria akceptacji, testy, definicja gotowości i uwagi. Źródłem prawdy o statusie jest repo `docs` (gałąź `main`), nie Trello.

| Plik | Co to |
|---|---|
| [QUEUE.md](QUEUE.md) | przegląd: liczby, „gotowe do wzięcia”, tabele per obszar, decyzje (generowany, nie edytuj) |
| [decisions.md](decisions.md) | otwarte decyzje właściciela DEC-xx z rekomendacją i tym, co robić do czasu decyzji |
| [queue.mjs](queue.mjs) | narzędzie kolejki (Node 22, bez zależności) |
| [_TEMPLATE.md](_TEMPLATE.md) | szablon nowego zadania |

| Obszar | Prefiks | Katalog zadań | Kod |
|---|---|---|---|
| backend | `BE` | [backend/](backend/) | repo `backend` (serwisy, crony, `src/lib`, kontrakty, skrypty) |
| web | `WEB` | [web/](web/) | repo `frontend` (panel admina, widok wyświetlacza TV, strona www), `frontend/tools/display-kiosk` |
| mobile | `MOB` | [mobile/](mobile/) | repo `mobile` (Expo, DEC-02) |
| tablet | `TAB` | [tablet/](tablet/) | repo `tablet` (Expo + moduł kiosku w Kotlinie, DEC-02), `tablet/tools/provision-tablet` |
| shared | `SH` | [shared/](shared/) | repo `docs` (dokumentacja, kolejka), `backend/docker-compose.yml`, `ci/` w każdym repo (także `docs`), testy akceptacyjne |

## Repozytoria i ścieżki

Kod i kolejka są na GitLabie w grupie [equinor-group](https://gitlab.com/groups/equinor-group): `backend`, `frontend`, `docs` (to repo: dokumentacja, makiety, kolejka), później `mobile` i `tablet` (DEC-02); `infra` jest Dawida. Gałąź domyślna `main`, przegląd kodu przez merge requesty (MR). Repozytoria klonujesz obok siebie:

```
equenor/
  backend/    git clone https://gitlab.com/equinor-group/backend.git
  frontend/   git clone https://gitlab.com/equinor-group/frontend.git
  docs/       git clone https://gitlab.com/equinor-group/docs.git
```

- Ścieżki w zadaniach i w komentarzach kodu liczymy od korzenia workspace: `backend/src/...`, `frontend/web/...`, `docs/mikroserwisy.md`, `docs/mockups/project/...`. W dokumentach repo `docs` `mockups/...` i `tasks/...` to też ścieżki w tym repo. Ścieżki między repo (`../backend/openapi` we `frontend/`) działają tylko w tym układzie.
- Wyjątek: kolejka. Komendy `node tasks/queue.mjs` uruchamiasz w korzeniu repo `docs` (z workspace: `cd docs`), więc `tasks/...` to ścieżka w tym repo (z workspace `docs/tasks/`).
- Status zadania (przejęcie, przegląd, blokada, `done`) commitujesz w repo `docs` na `main`; kod powstaje na gałęzi zadania w repo kodu i wchodzi przez MR (punkty 2 i 5). W `backend` i `frontend` `main` jest chroniony (tylko MR); w `docs` `main` przyjmuje push od Developerów, bez force push (ustawienie projektu na GitLabie).

## Komendy

W korzeniu repo `docs`:

```sh
node tasks/queue.mjs next --area backend      # gotowe do wzięcia (domyślnie 10; --all, --json); też: next backend
node tasks/queue.mjs next tablet --env none   # tylko zadania bez kryteriów [ręcznie] (albo --env emulator,macos,device,owner)
node tasks/queue.mjs show BE-013              # zależności (ze statusem), decyzje, zadania zależne, kryteria [ręcznie]
node tasks/queue.mjs list --area web --status in_progress   # też: list web
node tasks/queue.mjs claim BE-013 <owner> [gałąź]
node tasks/queue.mjs set BE-013 review        # todo | in_progress | review | done | blocked
node tasks/queue.mjs set BE-013 blocked --reason "czeka na DEC-01"
node tasks/queue.mjs check                    # spójność plików, zależności, decyzji i QUEUE.md (kod 1 przy błędach; uwagi:
                                               # zadania ze „Stan kodu”/„Testy” spoza depends_on, DEC z treści spoza decisions, needs)
node tasks/queue.mjs index                    # przegenerowanie QUEUE.md i list „Zadania” w decisions.md
node --test tasks/queue.test.mjs              # testy narzędzia
```

`claim` i `set` same uruchamiają `index`. Po ręcznej zmianie nagłówka zadania uruchom `index`, inaczej `check` zgłosi nieaktualny QUEUE.md.

## 1. Wybór zadania

1. Zaktualizuj kolejkę: w repo `docs` gałąź `main` (gałąź integracyjna kolejki), `git pull`.
2. `node tasks/queue.mjs next --area <obszar>`. Bierz pierwsze z listy, chyba że masz powód (np. kontynuacja własnego poprzedniego zadania). „Gotowe” znaczy: status `todo`, wszystkie `depends_on` mają `done` i żadna otwarta decyzja go nie blokuje. Pole `wymaga` (nagłówek `needs`) mówi, czego potrzeba do kryteriów `[ręcznie]` (punkt 4); część kodową robisz i bez tego.
   - `next` w Twoim obszarze nic nie zwraca: weź pierwsze z listy „Gotowe zadania, które odblokują obszar” (gotowe zadania z innych obszarów, od których zależy najwięcej zadań Twojego obszaru, najczęściej `shared` albo kontrakt w `backend`, np. SH-004, BE-063, BE-064), albo `node tasks/queue.mjs next` bez obszaru. Nie bierz zadania z niezakończonymi zależnościami (`claim` odmówi).
3. Jeden agent, jedno zadanie w toku. Rozmiar: `S` mały MR, `M` typowy MR, `L` duży MR (wolno kilka commitów i MR-ów na tej samej gałęzi zadania, ale zadanie kończy się jednym statusem `done`).

## 2. Przejęcie

1. `node tasks/queue.mjs claim <ID> <owner>`: ustawia `status: in_progress`, `owner` i `branch` (nazwa gałęzi zadania w repo kodu, domyślnie `claude/<ID>-<slug>`; inna gałąź jako trzeci argument, jeśli tak ustalono z właścicielem). `owner` to identyfikator, po którym da się Cię znaleźć (np. nazwa sesji agenta).
2. Od razu w repo `docs` commit samego `tasks/` na `main` (`kolejka: <ID> przejęte (<owner>)`, tylko status) i `git push`. Push odrzucony: `git pull --rebase`. Konflikt w czasie rebase: weź wersję zdalną katalogu (`git checkout --ours -- tasks/`; w rebase „ours” to gałąź zdalna, „theirs” Twój commit), ponów na niej swoje `claim`, potem `git add tasks && GIT_EDITOR=true git rebase --continue` i `node tasks/queue.mjs check`; `QUEUE.md` i linie „Zadania” w `decisions.md` są generowane, więc `claim` (albo `index`) je odtwarza. Jeśli ktoś przejął zadanie przed Tobą, `git rebase --abort`, `git reset --hard @{u}` i weź inne.
3. Dopiero potem gałąź zadania (`branch`) w repo kodu od jego aktualnego `main` (`git pull`) i praca. Zadanie, które dotyka kilku repo, ma w każdym gałąź o tej samej nazwie. Zmiany w repo `docs` poza statusem w `tasks/` (np. nowy dokument jak `docs/spike-zitadel.md`) też idą na gałęzi zadania i przez MR w `docs`; na `main` trafiają bezpośrednio tylko commity statusu.

`claim` odmawia, gdy zadanie nie jest `todo`, ma niezakończone zależności albo czeka na decyzję. `--force` tylko na wyraźne polecenie właściciela.

## 3. Praca

- Przeczytaj cały plik zadania, potem wskazane fragmenty docs i kod z „Kontekstu”. Sprawdź `node tasks/queue.mjs show <ID>`: decyzje i stan zależności.
- **Pierwszeństwo źródeł:** decyzje już podjęte (niżej) → rozstrzygnięte DEC → rekomendacja otwartej DEC (z wierszem „Do czasu decyzji”) → plik zadania → docs/mikroserwisy.md → docs/erd.md → docs/development-szczegoly.md i development.md → docs/makiety-plan.md → makiety `.dc.html`. Fragmenty docs sprzeczne z decyzjami są nieaktualne (porządkuje je SH-001); nie implementuj ich. Część plansz `.dc.html` jest sprzed decyzji (docs/mockups/STAN.md „Do zrobienia” pkt 5 i 7: logowanie bez hasła, „Wsparcie IT” w Zaproszeniu, kolumna Tablet): wtedy wygrywa opis w docs/makiety-plan.md i plik zadania. Odwołania do decyzji makiet piszemy jako „docs/makiety-plan.md 5 pkt N”, do DEC właściciela jako „DEC-NN”.
- **Zwykły npm.** Żadnego pnpm, Turborepo, workspaces ani `packages/*`. Każde repo kodu to osobny pakiet npm (`backend`, `frontend`, później `mobile`, `tablet`) z własnym `package-lock.json` i dokładnymi wersjami zależności. Pakiety niczego od siebie nie importują; typy API tylko z `backend/openapi/*.json` przez `npm run gen:api` (czyta `../backend`, więc repo `backend` musi leżeć obok w workspace).
- **Infrastruktura nie jest nasza.** Klaster, bazy, backupy, monitoring, DNS, sekrety produkcyjne i system CI robi Dawid. Dostarczamy kod, skrypty, manifesty i opisy (np. listę ról bazy, skrypt grantów, manifest kolejek, kroki CI w `ci/*.sh`). Nie dodawaj zadań infrastrukturalnych do kolejki.
- Zmiany kontraktów API tylko addytywne w `/v1` (nowe pole zamiast zmiany typu istniejącego); po zmianie `npm run openapi` w `backend/` i `npm run gen:api` u konsumentów. Nowa trasa otwarta (bez tokenu) = wpis w `backend/open-routes.txt` z limitem. Kontrakty widoków powstają przed implementacją (np. BE-063 `GET /me`, BE-064 `board`), żeby aplikacje mogły pracować na przykładach z kontraktu.
- **Porty serwisów** (propozycja do backend/README.md „Porty”; zadanie, które tworzy serwis, dopisuje swój wiersz tam): dev / E2E / wewnętrzny dev. `auth` 4010 / 4110 / 4011 (już jest), `stables` 4020 / 4120 / 4021, `operations` 4030 / 4130 / 4031, `board` 4040 / 4140 / —, `schedule` 4050 / 4150 / 4051, `files` 4060 / 4160 / 4061, `platform` 4070 / 4170 / 4071, `notifications` 4080 / 4180 / 4081, `billing` 4085 / 4185 / 4086, `sms` — / — / 4092 (tylko sondy), `email` — / — / 4093 (tylko sondy). Narzędzia z SH-002: proxy 8000, fake-sms 4090, Mailpit 8025, MinIO 9000/9001. W kontenerze zawsze 8080 (zewnętrzny) i 8081 (wewnętrzny), jak `auth`.
- Bez sekretów w repo, bez danych osobowych i kodów w logach. Testy razem z kodem.
- Nie rozszerzaj po cichu cudzego zakresu. Gdy potrzebujesz zmiany w innym obszarze: mała addytywna zmiana z opisem w MR (gdy leży w innym repo: osobny MR z gałęzi zadania w tamtym repo, oba MR podlinkowane nawzajem) albo nowe zadanie (punkt 7) i zależność.
- Coś działa „na rekomendacji” otwartej DEC: trzymaj to w konfiguracji albo za interfejsem i napisz o tym w MR.

## 4. Definicja gotowości (wspólna dla wszystkich zadań)

- Kryteria akceptacji w pliku zadania odhaczone (`- [x]`); to, czego nie zrobiono, opisane w „Uwagach dla wykonawcy” z powodem (i, jeśli trzeba, nowe zadanie).
- W każdym dotkniętym pakiecie zielone `npm run check` i `npm run build` (w `backend/` `check` zawiera `openapi:check`; we `frontend/`, `mobile/` i `tablet/` także `npm run gen:check`, czyli aktualne typy API i paleta, od SH-004; wcześniej we `frontend/` `npm run gen:api` i `git diff --exit-code src/api`); nowe zachowanie ma testy. W `mobile/` i `tablet/` `build` to `expo export` (pakiet JS, działa na Linuksie bez emulatora); natywny build to `npx expo prebuild` + `./gradlew assembleDebug` (mobile) albo `npm run apk` (tablet).
- **Kryteria `[ręcznie]`** (oznaczenie zaraz po `- [ ]`) wymagają środowiska, którego agent zwykle nie ma: emulatora Androida z KVM, Maestro/Detox, macOS z symulatorem iOS, sprzętu (tablet, telefon, Raspberry Pi) albo kont i środowisk Dawida. Nagłówek `needs` podsumowuje, czego zadanie wymaga (`emulator`, `macos`, `device`, `owner`). Bez takiego środowiska: zrób część kodową i całą weryfikację automatyczną (Jest/RNTL, Vitest, `expo export`, `prebuild`, `assembleDebug`, `node --test`, `shellcheck`), ustaw `review` i w „Uwagach dla wykonawcy” wypisz niesprawdzone kryteria `[ręcznie]`. Nie odhaczaj ich bez dowodu.
- **Fixture'y i zrzuty w testach aplikacji:** dane testowe to przykłady z kontraktu (`src/api/examples/`, kopiowane przez `gen:api` z `backend/openapi/examples/`, np. BE-064) albo fixture'y pisane ręcznie według docs/development-szczegoly.md 3.2 ze stałymi UUID skopiowanymi z `backend/src/lib/demo/ids.ts` (`frontend/web/src/test/fixtures/`, `mobile/src/test/fixtures/`, `tablet/src/test/fixtures/`); aplikacje nie czytają seedu. Zrzuty to wzorce `toHaveScreenshot` (albo `capture.sh` tabletu) tworzone w zadaniu; makieta `.dc.html` służy do ręcznego przeglądu w MR, nie do automatycznego porównania.
- README albo docs zaktualizowane, gdy zmieniają się komendy, env, porty albo zachowanie widoczne dla innych zadań.
- `node tasks/queue.mjs check` zielony (w repo `docs`).
- Opis MR (albo commita): co zrobione, które DEC na rekomendacji, odstępstwa od pliku zadania, nowe zadania.

## 5. Przegląd i zakończenie

- MR z gałęzi zadania do `main` w repo kodu (zadanie tylko w docs: w repo `docs`). Zadanie, które dotyka kilku repo, ma po jednym MR w każdym, podlinkowane nawzajem.
- Gotowe MR: w repo `docs` odhaczone kryteria i „Uwagi dla wykonawcy” w pliku zadania (punkt 4), `node tasks/queue.mjs set <ID> review`, osobny mały commit na `main` (`kolejka: <ID> do przeglądu`, linki do MR w opisie) i `git push`. Ten commit nie jest częścią MR kodu.
- Przegląd i scalenie robi właściciel (Dawid) albo wskazany przez niego recenzent, nigdy autor MR. Recenzent sprawdza kryteria, definicję gotowości i listę niesprawdzonych kryteriów `[ręcznie]`.
- Po akceptacji i scaleniu wszystkich MR zadania: `node tasks/queue.mjs set <ID> done` w repo `docs`, commit na `main` i `git push` (scalający albo wykonawca); dopiero to odblokowuje zadania zależne.
- Zadanie z niesprawdzonymi kryteriami `[ręcznie]`: kod można scalić ze statusem `review`; `done` ustawia właściciel (albo agent, który sprawdził te kryteria we właściwym środowisku) po ich sprawdzeniu. Gdy zadania zależne nie potrzebują części ręcznej (np. pomiary na sprzęcie), właściciel może ustawić `done` od razu i dopisać sprawdzenie ręczne jako osobne zadanie albo punkt DEC.
- Konflikt w `QUEUE.md` albo w liniach „Zadania” w `decisions.md` (przy `git pull --rebase` przed pushem statusu albo przy scalaniu MR w repo `docs`): rozwiąż konflikty w plikach zadań, potem `node tasks/queue.mjs index` (te miejsca są generowane, nie scalaj ich ręcznie).
- Porzucenie zadania: `set <ID> todo` (czyści `owner` i `branch`), commit w repo `docs` na `main`; co zostało zrobione i co dalej (także otwarte MR i gałęzie), dopisz w „Uwagach dla wykonawcy”.

## 6. Blokada

1. `node tasks/queue.mjs set <ID> blocked --reason "…"`: dopisuje datę i powód do sekcji `## Blokada` w pliku zadania.
2. Powód nazywa konkretną przyczynę: decyzję (`DEC-xx`; brakującą dopisz do decisions.md jako nową, z pytaniem, opcjami i rekomendacją), zadanie (`BE-0xx`, dopisz je do `depends_on`) albo brak po stronie infrastruktury (co i od kogo).
3. Commit i push w repo `docs` na `main`, żeby inni to widzieli; daj znać właścicielowi.
4. Po odblokowaniu: `set <ID> in_progress` (z tym samym wykonawcą) albo `set <ID> todo` (zwolnienie).

## 7. Nowe zadanie

1. Skopiuj [_TEMPLATE.md](_TEMPLATE.md) do `tasks/<obszar>/<PREFIKS>-<numer>-<slug>.md`. Numer: kolejny wolny w obszarze (`node tasks/queue.mjs list --area <obszar>`), trzy cyfry; slug krótki, po angielsku albo bez polskich znaków, z myślnikami.
2. Wypełnij wszystkie sekcje tak, żeby agent bez historii rozmowy mógł zacząć: konkretne ścieżki plików, trasy, tabele, nazwy makiet, dane demo, odwołania do docs z numerami punktów.
3. Ustaw `stage` (etap 0–9 jak niżej), `size`, `depends_on`, `decisions`, opcjonalnie `needs`; `status: todo`, `owner`, `branch`, `trello` puste. Każde zadanie, z którego kodu korzystasz w „Kontekście → Stan kodu” albo w „Testach”, musi być w `depends_on` (wprost albo przez inne zależności); `check` ostrzega o takich lukach (wyjątek uzasadnij komentarzem `<!-- dep-ok: ID -->`). Każda DEC cytowana w treści (poza „Poza zakresem”) musi być w `decisions`.
4. Jeśli nowe zadanie zmienia zakres istniejącego, popraw też tamten plik („Zakres” albo „Poza zakresem”, z odwołaniem).
5. `node tasks/queue.mjs check` i `index`, commit w repo `docs` na `main`.

Etapy (docs/development-szczegoly.md 3.6): 0 fundament (warstwy bazy, kit, środowisko, CI, szkielety apek, bramka sprzętowa tabletu); 1 logowanie i konto firmy; 2 stajnia, hale, boksy, konie; 3 flagi; 4 tablica i tablet; 5 wyświetlacz; 6 karmienie, padok i rutyna obsługi; 7 zdrowie, jazdy, zadania; 8 płatności; 9 przed stajnią pilotażową.

## 8. Trello

- Pole `trello:` w nagłówku to link do karty (`https://trello.com/c/…`); `check` ostrzega przy innym formacie.
- Tablica [EQUINOR](https://trello.com/b/GYtkn7bd/equinor). Listy według obszaru: Backend, Web portal, Aplikacja mobilna, Tablet, Wspólne (repo, docs, CI), Decyzje do podjęcia (DEC-xx). Karty stoją w kolejności etapów, jak w QUEUE.md. Listy dla ludzi, bez plików zadań: Zrobione, Makiety do poprawy, Sprzęt i zakupy, Konta i usługi, Infra (Dawid).
- Karta odzwierciedla zadanie, nie odwrotnie: tytuł `<ID> · <tytuł>`, w opisie link do pliku zadania w repo `docs` na GitLabie (`https://gitlab.com/equinor-group/docs/-/blob/main/tasks/<obszar>/<plik>.md`), „Cel” i kryteria akceptacji. Decyzja ma link do karty w linii „Trello” w decisions.md.
- Kto zmienia status w repo (`claim`, `set`), ten aktualizuje kartę, jeśli ma dostęp do Trello: `in_progress`, `review` i `blocked` jako komentarz (`W toku: <owner>, gałąź <branch>`, `Przegląd: <link do MR>`, `Zablokowane: <powód>`), `done` przez przeniesienie na listę Zrobione i oznaczenie karty jako wykonanej. Jeśli nie ma dostępu, zostawia to właścicielowi. Karta bez pliku zadania nie jest zadaniem dla agenta: najpierw powstaje plik (punkt 7).
- Zmiany zrobione tylko na tablicy (np. nowy priorytet) przenosi do repo właściciel albo agent na jego polecenie.

## Decyzje już podjęte

Przyjęte przez właściciela 13–14.10.2026; mają pierwszeństwo przed docs, które jeszcze ich nie uwzględniają (monorepo, pnpm, Turborepo, `packages/*`, KMS, `signing_keys`, `identity_pool`, osobna pula kont zespołu to stan nieaktualny):

- Zwykły npm. `backend/` to jeden pakiet i jeden obraz Docker; serwis wybiera `npm run start:<serwis>` (`src/services/<serwis>/main.ts`); wspólny kod w `src/kit`, `src/lib/*`, kontrakty w `src/contracts` → `openapi/*.json`; crony w `src/jobs/<cron>`.
- `frontend/` osobno (www i panel: React, Vite, TanStack Router; typy z `backend/openapi`), własny Dockerfile, bez importów z `backend/`. Apka mobilna i tablet w Expo/React Native (tablet z modułem kiosku w Kotlinie, Device Owner); położenie kodu: DEC-02.
- 11 serwisów: `auth` (jedyny autoryzacyjny, wydaje JWT ES256), `stables`, `operations`, `schedule`, `board` (tylko odczyt), `billing`, `files`, `platform`, `notifications`, `sms`, `email` (bez bazy). 9 cronów pisze wprost do bazy z rolą z manifestu, bez tokenów serwisowych. Pozostałe serwisy tylko weryfikują podpis JWT z JWKS.
- Logowanie: aplikacje rozmawiają tylko z `auth`; hasło i zawsze kod MFA e-mailem albo SMS-em; rejestracja z potwierdzeniem kodem. Dostawca tożsamości: ZITADEL self-hosted; kody wracają do `auth` (`return_code`), a `auth` wysyła je przez kolejki do `sms` i `email`.
- Refresh token to JWT bez sesji w bazie (`users.token_version`). Klucz podpisu JWT to sekret od właściciela (bez KMS). Konta zespołu EQUENOR (admin globalny) to uprawnienie platformowe w `auth` (`platform_roles` → claim `plt`), bez osobnej puli kont.
- Trasy: zewnętrzne (z tokenem), otwarte (bez tokenu, jawnie oznaczone, lista w teście, limity), wewnętrzne (osobny port).
- PoC tani. Infrastrukturę robi Dawid; zadania infrastrukturalne nie wchodzą do kolejki.
- Kod na GitLabie w grupie [equinor-group](https://gitlab.com/groups/equinor-group): osobne repo `backend`, `frontend` i `docs` (dokumentacja, makiety, kolejka), `infra` później (Dawid); bez historii z GitHuba (14.10.2026). Gałąź domyślna `main`, przegląd przez MR.
