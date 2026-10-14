#!/usr/bin/env bash
# Podział tego repo na trzy repozytoria GitLab, bez historii (jeden commit startowy w każdym):
#   backend  <- zawartość backend/ (jako korzeń)
#   frontend <- zawartość frontend/ (jako korzeń)
#   docs     <- zawartość docs/ (jako korzeń: dokumentacja, mockups/, tasks/)
# Układ katalogów tu jest taki sam jak po sklonowaniu trzech repo obok siebie, więc ścieżki
# w zadaniach i skryptach (docs/…, ../backend) działają w obu miejscach.
# README.md w korzeniu, .gitignore w korzeniu i scripts/ zostają tylko tutaj.
# Pliki bierze z ostatniego commita (git archive), więc niezacommitowane zmiany i pliki spoza gita
# (node_modules, .local) nie przechodzą.
#
# Użycie:
#   scripts/split-to-gitlab.sh [katalog_wyjściowy]          # tylko lokalnie (domyślnie ./split-out)
#   scripts/split-to-gitlab.sh --push [katalog_wyjściowy]   # i push gałęzi main na GitLab
#
# Push: GITLAB_GROUP (domyślnie equinor-group), GITLAB_HOST (domyślnie gitlab.com).
# Uwierzytelnienie: GITLAB_TOKEN (personal access token ze scope write_repository) albo
# zwykłe dane logowania gita na Twojej maszynie. Projekty, których jeszcze nie ma, GitLab
# zakłada przy pierwszym pushu jako prywatne. Bez force push: jeśli projekt ma już coś na main,
# skrypt się zatrzymuje.
set -euo pipefail

push=false
if [[ "${1:-}" == "--push" ]]; then
  push=true
  shift
fi

src="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
out="${1:-$src/split-out}"
group="${GITLAB_GROUP:-equinor-group}"
host="${GITLAB_HOST:-gitlab.com}"
rev="$(git -C "$src" rev-parse --short HEAD)"

if [[ -e "$out" ]]; then
  echo "$out już istnieje; usuń go albo podaj inny katalog." >&2
  exit 1
fi

# make_repo <katalog>: zawartość katalogu jako korzeń nowego repo o tej samej nazwie.
make_repo() {
  local name="$1"
  local dir="$out/$name"
  mkdir -p "$dir"
  git -C "$src" archive --format=tar HEAD "$name" | tar -x -C "$dir" --strip-components=1
  git -C "$dir" init --quiet -b main
  git -C "$dir" add -A
  git -C "$dir" commit --quiet -m "EQUENOR $name: stan startowy (z KonskaAppka $rev)"
  echo "$name: $(git -C "$dir" ls-files | wc -l) plików"
}

for name in backend frontend docs; do
  make_repo "$name"
done

$push || { echo "Gotowe (bez pushu): $out"; exit 0; }

git_remote() {
  if [[ -n "${GITLAB_TOKEN:-}" ]]; then
    # Token tylko w nagłówku tego wywołania: nie trafia do .git/config ani do adresu.
    local basic
    basic="$(printf 'oauth2:%s' "$GITLAB_TOKEN" | base64 | tr -d '\n')"
    git -c http.extraHeader="Authorization: Basic $basic" "$@"
  else
    git "$@"
  fi
}

for name in backend frontend docs; do
  dir="$out/$name"
  url="https://$host/$group/$name.git"
  if remote_sha="$(git_remote -C "$dir" ls-remote "$url" refs/heads/main 2>/dev/null | cut -f1)" && [[ -n "$remote_sha" ]]; then
    echo "$name: $url ma już gałąź main ($remote_sha); nie nadpisuję." >&2
    exit 1
  fi
  git_remote -C "$dir" push --quiet "$url" main:main
  echo "$name: wypchnięte na $url"
done
