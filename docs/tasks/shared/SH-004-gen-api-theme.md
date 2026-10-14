---
id: SH-004
title: Generowanie typów API i tokenów palety dla frontend, mobile i tablet
area: shared
stage: 0
size: M
status: todo
depends_on: []
decisions: [DEC-02, DEC-30]
owner:
branch:
trello: https://trello.com/c/WmDqGprx
---
# SH-004 · Generowanie typów API i tokenów palety dla frontend, mobile i tablet

## Cel
Panel, apka mobilna i tablet biorą typy API i kolory z jednego źródła w ten sam sposób, bez importów między pakietami: typy z `backend/openapi/*.json`, kolory z tabel `docs/paleta.md`. Wynik generatorów jest w repo, a CI zatrzymuje MR, w którym jest nieaktualny.

## Kontekst
- **Stan kodu:** `frontend/package.json` ma `gen:api` dla jednego pliku (`openapi-typescript ../backend/openapi/auth.json -o src/api/auth.d.ts`); `frontend/src/api/client.ts`, `auth-api.ts` (openapi-fetch). Tokeny są pisane ręcznie w `frontend/src/theme/tokens.ts` (`lcd`, `tablet`, `tabletGallery3`, `scrim`, `shadowCard`, `accentOptions`, `brand`, `cssVar`) i `frontend/src/theme/theme.css` (`--eq-*`); `frontend/src/theme/theme.node.test.ts` porównuje je z tabelami w `docs/paleta.md` i pomija test, gdy pliku nie ma (bez repo docs obok w workspace). `frontend/src/test/no-color-literals.node.test.ts` pilnuje braku literałów kolorów poza `src/theme`.
- **Dokumenty:** `docs/paleta.md` (tabela LCD: kolumny Token | Kolor | Do czego; tabela tabletu: Token | Kolor | Szarość | Do czego; profil Gallery 3, nakładka, cień i opcje akcentu w prozie pod tabelami), `docs/development-szczegoly.md` 3.1.12 `theme` (wyjścia: zmienne CSS dla panelu i obiekt TS dla React Native; testy: zgodność z paleta.md, kontrasty WCAG tekst ≥ 4,5:1, duże elementy i obrysy ≥ 3:1; tablet: neutralne achromatyczne R = G = B, drabina 255/204/146/66/0 z odstępem ≥ 3 poziomów na 16 w obu profilach, tekst na kolorze tylko czarny na `t-ok`/`t-warn` i biały na `t-crit`).
- **Decyzje:** DEC-02 A: osobne repo `mobile` i `tablet`, każde jako osobny pakiet npm; typy przez `openapi-typescript` (`gen:api`), tokeny przez `gen:theme`, test aktualności w CI.
- **Dane demo:** nie dotyczy.

## Zakres
- [ ] `backend/tools/codegen/gen-theme.mjs` (Node 22, bez zależności): parsuje tabele `docs/paleta.md` (jak `theme.node.test.ts`: tokeny w `…` z pierwszej kolumny, kolory `#RRGGBB` z drugiej, szarość z trzeciej w tabeli tabletu) oraz profil Gallery 3, nakładkę, cień i opcje akcentu. Jeśli parsowanie prozy jest kruche, przenieś te wartości do małych tabel w `docs/paleta.md` bez zmiany wartości. Argumenty: `--palette <plik>` (ścieżka do `paleta.md`; z pakietu aplikacji `../docs/paleta.md`), `--target web|native`, `--out <plik>`, `--css <plik>` (tylko web), `--check` (porównuje z plikiem na dysku, kod 1 przy różnicy).
- [ ] Wyjście TS (oba targety): `export const lcd`, `tablet` (z `gray` dla każdego `t-*`), `tabletProfiles = { kaleido3, gallery3 }` (Gallery 3 podmienia tylko `t-ok`, `t-warn`, `t-crit`), `scrim`, `shadowCard`, `accentOptions`; nagłówek „plik generowany, nie edytuj; źródło docs/paleta.md”. Wyjście CSS (web): `:root { --eq-<token>: … }` w tej samej kolejności co dziś w `theme.css`.
- [ ] Walidacja w generatorze (błąd = brak zapisu): kontrasty WCAG dla par z listy w `backend/tools/codegen/contrast-pairs.json` (np. `ink` na `bg`/`surface`, `on-accent` na `accent`, `ok-text` na `ok-tint`, `warn-text` na `warn-tint`/`warn-tint-weak`, `crit-text` na `crit-tint`, `on-crit` na `crit-solid`, `line-input` na `surface` jako obrys ≥ 3:1; `t-ink` na `t-ok`/`t-warn`, `t-paper` na `t-crit`); tablet: neutralne `t-paper`, `t-line`, `t-scrim`, `t-ink-2`, `t-ink` achromatyczne; jasność `t-paper` > `t-ok` > `t-warn` > `t-crit` > `t-ink`, sąsiednie szczeble różne o ≥ 3 poziomy z 16 (krok 17, czyli ≥ 51 w skali 0–255), w obu profilach. Kolumna „Szarość” w paleta.md to luma Rec. 709 liczona wprost z wartości sRGB (`0.2126 R + 0.7152 G + 0.0722 B`, zaokrąglona: `t-ok` 204, `t-warn` 146, `t-crit` 66); generator liczy ją sam i sprawdza zgodność z kolumną (±1), a dla profilu Gallery 3 liczy ją tym samym wzorem.
- [ ] `backend/tools/codegen/gen-api.mjs`: dla każdego `backend/openapi/*.json` uruchamia `openapi-typescript` z `node_modules/.bin` pakietu wołającego i zapisuje `src/api/<serwis>.d.ts`; usuwa pliki `.d.ts` serwisów, których JSON-a już nie ma; `--check` porównuje bez zapisu. Ścieżka do `backend/openapi` z argumentu (`--from ../backend/openapi`: repo backend obok w workspace).
- [ ] `frontend/`: skrypty `gen:api` → `node ../backend/tools/codegen/gen-api.mjs --from ../backend/openapi --out src/api`, `gen:theme` → `node ../backend/tools/codegen/gen-theme.mjs --palette ../docs/paleta.md --target web --out src/theme/palette.gen.ts --css src/theme/palette.gen.css`; `tokens.ts` re-eksportuje wartości z `palette.gen.ts` i zostawia helpery (`cssVar`, `brand`, typy `LcdToken`…); `theme.css` importuje `palette.gen.css` zamiast literałów; `theme.node.test.ts` sprawdza zgodność `palette.gen.css` z `palette.gen.ts` (test paleta.md przenosi się do `--check`). Publiczne API `src/theme` bez zmian (istniejące importy działają).
- [ ] Wzór dla `mobile/` i `tablet/` (opis w `backend/tools/codegen/README.md`, wykonanie w MOB-001 i TAB-001): `gen:api` jak wyżej, `gen:theme` z `--palette ../docs/paleta.md --target native --out src/theme/palette.gen.ts`; wszystkie pakiety dostają skrypt `gen:check` (`gen:api --check && gen:theme --check`), który woła SH-003.
- [ ] `backend/tools/codegen/README.md`: co generuje, skąd, jak dodać nowy serwis (nowy JSON w `backend/openapi` + `npm run gen:api` w każdej aplikacji), zasada „wynik w repo, ręcznie nie edytujemy”.

## Poza zakresem
- Szkielety `mobile/` i `tablet/` (MOB-001, TAB-001) i ich komponenty; klienci API per serwis we frontendzie (WEB-001).
- Zmiana wartości palety (decyzje właściciela, np. profil Gallery 3: development-szczegoly.md 5 pkt 40).
- Kroki CI jako takie (SH-003).

## Kryteria akceptacji
- [ ] `cd frontend && npm run gen:theme && npm run gen:api && git diff --exit-code` przechodzi zaraz po wygenerowaniu; `npm run check` i `npm run build` zielone, wygląd panelu bez zmian (E2E `npm run e2e` zielone).
- [ ] Zmiana jednego koloru w `docs/paleta.md` bez ponownego generowania: `gen:theme -- --check` kończy się kodem 1 z nazwą tokenu.
- [ ] Celowo zła wartość (np. `t-warn` jaśniejszy niż `t-ok` albo `on-accent` na `accent` < 4,5:1) zatrzymuje generator z komunikatem o parze i wartości.
- [ ] Dodanie pliku `backend/openapi/board.json` i `npm run gen:api` tworzy `frontend/src/api/board.d.ts`; usunięcie JSON-a usuwa `.d.ts`.
- [ ] Brak importów z `../backend` i między `frontend/`, `mobile/`, `tablet/` w kodzie źródłowym (generatory czytają pliki, nie importują modułów).

## Testy
- `cd backend && node --test tools/codegen` (testy bez zależności: parser tabel na fragmencie paleta.md, kontrast WCAG dla znanych par, drabina jasności, `--check`).
- Frontend: istniejące testy theme (zmienione jak w Zakresie) i `no-color-literals` (pliki `*.gen.*` w `src/theme` są w katalogu pomijanym).

## Definicja gotowości
- `cd backend && node --test tools/codegen` i `cd frontend && npm run check && npm run build && npm run e2e` zielone; `frontend/README.md` „Sprawdzenia” opisuje `gen:api`/`gen:theme`/`gen:check` (wymagają `../backend` i `../docs`); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zwykły npm; `backend/tools/codegen` nie ma własnego `package.json` ani zależności, tylko skrypty `.mjs` uruchamiane `node`; leży w repo backend, bo `gen-api` czyta `backend/openapi`, a BE-064 rozszerza go razem z kontraktami.
- Zmiana w dwóch repo: generatory w `backend` i skrypty, theme oraz pliki wynikowe we `frontend`, jako dwa MR podlinkowane nawzajem; MR frontendu scalany po MR backendu (jego skrypty wołają `../backend/tools/codegen`).
- Kolory wyłącznie z wygenerowanych plików; lint literałów kolorów zostaje w każdym pakiecie.
- `openapi-typescript` jest już zależnością dev frontendu (z `overrides` dla TypeScript); w mobile i tablet dodaje ją MOB-001/TAB-001.
- Wynik deterministyczny (kolejność kluczy jak w paleta.md, końce linii `\n`), inaczej `--check` będzie migać; przepuść wynik przez Prettier pakietu albo generuj od razu w jego stylu.
