# EQUENOR

**Equestrian Management, Refined**

Wcześniej produkt nosił roboczą nazwę eKoniuszy.

To repozytorium `docs`: dokumentacja, makiety i kolejka zadań dla agentów. EQUENOR to SaaS do zarządzania stajnią: aplikacja mobilna dla właścicieli koni, adminów stajni i obsługi oraz tablet e-ink
przy każdym boksie z aktualnymi instrukcjami (karmienie, padok, weterynarz) i potwierdzeniami obsługi.

## Repozytoria

Grupa GitLab [equinor-group](https://gitlab.com/groups/equinor-group), gałąź domyślna `main`, przegląd kodu przez merge requesty (MR).

| Repo | Co |
|---|---|
| [backend](https://gitlab.com/equinor-group/backend) | serwisy i crony (TypeScript, Fastify), kontrakty API (`openapi/*.json`), jeden obraz Docker, `docker-compose.yml` do dev |
| [frontend](https://gitlab.com/equinor-group/frontend) | panel web, widok wyświetlacza TV, strona www |
| [docs](https://gitlab.com/equinor-group/docs) (to repo) | dokumentacja, makiety (`mockups/`), kolejka zadań (`tasks/`) |
| `infra` | później; infrastruktura jest po stronie Dawida |
| `mobile`, `tablet` | apka mobilna i apka tabletu, jeszcze bez kodu; położenie: DEC-02 w [tasks/decisions.md](tasks/decisions.md) (rekomendacja: osobne repo w grupie) |

## Workspace

Repozytoria klonujesz obok siebie w jednym katalogu:

```
equenor/
  backend/    git clone https://gitlab.com/equinor-group/backend.git
  frontend/   git clone https://gitlab.com/equinor-group/frontend.git
  docs/       git clone https://gitlab.com/equinor-group/docs.git
```

Ścieżki w zadaniach i w komentarzach kodu liczymy od korzenia workspace: `backend/src/...`, `frontend/web/...`, `docs/mikroserwisy.md`, `docs/mockups/project/...`. W dokumentach tego repo `mockups/...` i `tasks/...` to też ścieżki w repo `docs`. Frontend czyta kontrakty z `../backend/openapi` (`npm run gen:api`), więc `backend/` musi leżeć obok. Wyjątek: kolejkę obsługujesz z korzenia tego repo, więc `tasks/...` to ścieżka w repo `docs` (z workspace `docs/tasks/`).

## Dokumentacja

- [Architektura i analiza techniczna](analiza.md)
- [Model danych (ERD) do zatwierdzenia](erd.md)
- [Rozpiska mikroserwisów: 11 serwisów, jeden serwis autoryzacyjny (jedyny z dostępem do ZITADEL, dostawcy tożsamości self-hosted na naszym klastrze), logowanie hasłem i zawsze kodem, admin globalny, crony, sesje w JWT, SMS i e-mail z kolejki](mikroserwisy.md)
- [Paleta kolorów](paleta.md)
- [Development, testy i zakupy](development.md) (pełna wersja ze źródłami: [szczegóły](development-szczegoly.md))
- [Makiety (kanwas)](https://claude.ai/artifact/SjdCnhTF5eqXy2vRaSMUtX); pliki `.dc.html` w [mockups/project/](mockups/project/), stan prac i narzędzia: [mockups/STAN.md](mockups/STAN.md)
- [Plan brakujących makiet: rejestracja, ekrany główne, urządzenia](makiety-plan.md)

Struktura kodu z development-szczegoly.md 3.1.1 (monorepo, pnpm, Turborepo, `packages/*`) jest nieaktualna: obowiązują osobne repozytoria powyżej, każde jako zwykły pakiet npm (porządkuje to SH-001).

## Kolejka zadań

Prace są rozpisane na zadania dla agentów w [`tasks/`](tasks/README.md): backend (`BE`), panel web i TV (`WEB`), apka mobilna (`MOB`), tablet (`TAB`) i wspólne (`SH`). Każdy plik zadania ma kontekst, zakres, kryteria akceptacji i testy. Przegląd: [tasks/QUEUE.md](tasks/QUEUE.md), decyzje do podjęcia: [tasks/decisions.md](tasks/decisions.md), protokół (przejęcie, blokada, nowe zadanie, Trello): [tasks/README.md](tasks/README.md).

Status zadań żyje w tym repo na `main`; kod powstaje na gałęzi zadania w repo kodu i wchodzi przez MR. Komendy uruchamiasz w korzeniu tego repo (z workspace: `cd docs`):

```sh
node tasks/queue.mjs next --area backend   # zadania gotowe do wzięcia (backend | web | mobile | tablet | shared)
node tasks/queue.mjs claim BE-001 <owner>  # przejęcie: status in_progress, gałąź claude/BE-001-<slug> (w repo kodu)
node tasks/queue.mjs set BE-001 review     # todo | in_progress | review | done | blocked (--reason)
node tasks/queue.mjs check                 # spójność kolejki; przed każdym pushem (CI dopiero po SH-003)
```

## Uruchomienie kodu

Wymagania, uruchomienie lokalne, konta demo, porty, sprawdzenia, obrazy Docker i `docker compose`: README repo [backend](https://gitlab.com/equinor-group/backend/-/blob/main/README.md) i [frontend](https://gitlab.com/equinor-group/frontend/-/blob/main/README.md) (w workspace `backend/README.md` i `frontend/README.md`).
