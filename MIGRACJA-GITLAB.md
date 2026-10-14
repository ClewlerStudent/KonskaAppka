# Przeniesienie na GitLab

Cel: grupa [equinor-group](https://gitlab.com/groups/equinor-group) z repozytoriami `backend`, `frontend` i `docs`, każde z jednym commitem startowym (bez historii), gałąź `main`, prywatne. Pusty `EQUINOR-project` w grupie nie jest potrzebny.

## 1. Podział i push

Skrypt bierze ostatni commit tej gałęzi, robi z `backend/`, `frontend/` i `docs/` trzy repozytoria i wypycha je na GitLab. Projekty, których nie ma, GitLab zakłada przy pierwszym pushu. Jeśli projekt ma już coś na `main`, skrypt się zatrzymuje (bez force push).

U siebie, z własnymi danymi logowania do gitlab.com:

```sh
git clone -b claude/affectionate-bell-325org https://github.com/ClewlerStudent/KonskaAppka.git
cd KonskaAppka
scripts/split-to-gitlab.sh --push /tmp/equenor-split
```

Albo w sesji Claude: personal access token GitLab ze scope `write_repository` (krótka ważność) dodany w ustawieniach środowiska jako `GITLAB_TOKEN`; nowa sesja uruchamia ten sam skrypt.

Bez `--push` skrypt tylko składa repozytoria lokalnie, do obejrzenia.

## 2. Po pushu

- W projekcie `docs`: Settings → Repository → Protected branches, `main`: „Allowed to push and merge” dla Developers + Maintainers, bez force push. Agenci commitują tam statusy kolejki bez MR. W `backend` i `frontend` `main` zostaje chroniony (tylko MR).
- Karty na tablicy Trello EQUINOR linkują do plików zadań na GitHubie: podmiana na `https://gitlab.com/equinor-group/docs/-/blob/main/tasks/...` (Claude, przez Trello).
- Pola `trello:` w zadaniach się nie zmieniają.
- To repo na GitHubie można zarchiwizować.

## 3. Praca po przeniesieniu

```
equenor/
  backend/    git clone https://gitlab.com/equinor-group/backend.git
  frontend/   git clone https://gitlab.com/equinor-group/frontend.git
  docs/       git clone https://gitlab.com/equinor-group/docs.git
```

Protokół kolejki (status w repo `docs` na `main`, kod przez MR w repo kodu): `docs/tasks/README.md`.
