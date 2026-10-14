# EQUENOR

Kod i dokumentacja przechodzą na GitLab, do grupy [equinor-group](https://gitlab.com/groups/equinor-group), jako trzy osobne repozytoria (bez historii z tego repo):

| Repo | Skąd | Co |
|---|---|---|
| [backend](https://gitlab.com/equinor-group/backend) | `backend/` | serwisy i crony (TypeScript, Fastify), jeden obraz Docker, `docker-compose.yml` do dev |
| [frontend](https://gitlab.com/equinor-group/frontend) | `frontend/` | panel web, widok TV, strona www |
| [docs](https://gitlab.com/equinor-group/docs) | `docs/` | dokumentacja, makiety (`mockups/`), kolejka zadań dla agentów (`tasks/`) |

Repo `infra` dojdzie później. Układ katalogów tutaj jest taki sam jak po sklonowaniu trzech repo obok siebie, więc ścieżki w zadaniach i skryptach (`docs/…`, `../backend`) działają w obu miejscach. Podział robi [`scripts/split-to-gitlab.sh`](scripts/split-to-gitlab.sh), kroki są w [MIGRACJA-GITLAB.md](MIGRACJA-GITLAB.md).

Wejście: [docs/README.md](docs/README.md), uruchomienie kodu: [backend/README.md](backend/README.md) i [frontend/README.md](frontend/README.md).
