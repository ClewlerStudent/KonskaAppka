---
id: SH-001
title: Docs zgodne z decyzjami i kodem
area: shared
stage: 0
size: M
status: todo
depends_on: []
decisions: [DEC-01, DEC-02, DEC-05, DEC-10, DEC-11]
owner:
branch:
trello:
---
# SH-001 · Docs zgodne z decyzjami i kodem

## Cel
Dokumentacja przestaje opisywać stan sprzed decyzji z 13–14.10 (pnpm, Turborepo, `packages/*`, KMS, `signing_keys`, osobna pula kont zespołu, stare nazwy env). Agent, który czyta docs przed zadaniem, nie dostaje sprzecznych wskazówek względem README i kodu.

## Kontekst
- **Stan kodu (prawda, do której równamy docs):** README.md „Kod” (dwa niezależne pakiety npm `backend/` i `frontend/`, bez workspaces; jeden obraz backendu, serwis wybiera `npm run start:<serwis>`), `backend/src/kit` (szablon serwisu), `backend/src/lib/auth` (weryfikacja JWT z JWKS), `backend/src/contracts` → `backend/openapi/*.json`, `backend/open-routes.txt`, `backend/src/services/auth` (fałszywy IdP, szkielet `identity/zitadel-idp.ts`), `frontend/{web,www,src/theme,src/api}`. Nazwy env w kodzie: `APP_ENV` (`dev|test|prod`), `SIGNING_KEY_FILE`, `SIGNING_KEY_PEM`, `SIGNING_KEY_EPHEMERAL`, `AUTH_ISSUER`, `ALLOWED_ORIGINS`, `IDP`, `CODE_SENDER`, `DEV_INBOX_FILE`, `ZITADEL_API_URL`, `ZITADEL_SERVICE_KEY_FILE`, `TRUST_PROXY`, `RATE_LIMIT_FACTOR` (`backend/src/services/auth/env.ts`, `backend/src/kit/env.ts`).
- **Nieaktualne miejsca (liczby trafień `grep`):** `pnpm` (development.md 2, development-szczegoly.md 9), Turborepo/`turbo` (1 i 3), `packages/` (development-szczegoly.md 34, mikroserwisy.md 10, erd.md 5, mockups/decyzje-spec.md 2), `apps/` (development-szczegoly.md 30, mikroserwisy.md 3), KMS (mikroserwisy.md 11, development-szczegoly.md 9, development.md 4, erd.md 2, `docs/mikroserwisy/uslugi.mmd` 3), `signing_keys` (erd.md 7, mikroserwisy.md 5, development-szczegoly.md 6, development.md 4), `identity_pool` i „organizacja zespołu” (mikroserwisy.md 1.2, 2, 3.1, 4.1, 5.10; erd.md; seed w development*.md), `TOKEN_SIGNER=file` i `ENV=prod` (development.md 3.2, development-szczegoly.md 3.2), `pnpm dev:token`, `pnpm db:seed`, `pnpm setup`.
- **Decyzje użytkownika (wpisać jako fakt):** zwykły npm; `backend/` = jeden pakiet i jeden obraz (`src/kit`, `src/lib/*`, `src/contracts`, `src/services/<serwis>/main.ts`, crony w `src/jobs/<cron>`, skrypty w `backend/scripts/`); `frontend/` osobno (www + panel, typy z `backend/openapi`); ZITADEL self-hosted jako jedyny dostawca tożsamości, rozmawia z nim tylko `auth`; klucz podpisu JWT to sekret od właściciela (bez KMS); konta zespołu EQUENOR to wiersz `platform_roles` (claim `plt`) w tej samej organizacji ZITADEL, bez `users.identity_pool` i bez osobnej organizacji; infrastrukturę (klaster, bazy, backupy, monitoring, system CI) robi Dawid.
- **Rekomendacje do wpisania jako „propozycja (DEC-xx)”:** DEC-01 B (broker za `lib/messaging`, np. RabbitMQ; SNS/SQS/LocalStack tylko jako wariant A), DEC-02 A (`mobile/` i `tablet/` jako osobne pakiety npm), DEC-05 B (`SIGNING_KEY_FILE` + opcjonalny `SIGNING_KEY_NEXT_FILE`, `kid` = odcisk RFC 7638, bez tabeli `signing_keys`), DEC-10 A (host `[OPS]`, `opctl`, role we dwie osoby; bez `identity_pool`). Pełna treść decyzji: `tasks/decisions.md` (wszystkie DEC) albo arkusz `mockups/decyzje-spec.md`.
- **Makiety:** brak.
- **Dane demo:** w opisie seedu Kuba (admin globalny) to zwykłe konto z wierszem `platform_roles`, bez `identity_pool = team`.

## Zakres
- [ ] `docs/development-szczegoly.md` 3.1.1–3.1.13 i 3.2: zamienić układ monorepo na układ z README (tabela: `packages/db` → `backend/src/lib/db`, `packages/contracts` → `backend/src/contracts`, `service-kit` → `backend/src/kit`, `cron-kit` → `backend/src/jobs` + `kit`, `messaging|auth|authz|tenancy|audit|rules|i18n|testing` → `backend/src/lib/<nazwa>`, `theme` → `gen:theme` z `docs/paleta.md` w każdym pakiecie aplikacji, `api-client` → `gen:api` + openapi-fetch w każdym pakiecie; `apps/{mobile,tablet,web}` → `mobile/`, `tablet/`, `frontend/`; `tools/*` → `backend/scripts/*` albo `tools/<narzędzie>/` dla rzeczy spoza npm, np. `tools/provision-tablet`, `tools/display-kiosk`, `tools/fake-sms`). Komendy `pnpm …` → `npm run …` w odpowiednim katalogu; usunąć generatory `turbo gen`.
- [ ] `docs/development.md` 3.1, 3.2, 3.5: to samo w wersji skróconej; `TOKEN_SIGNER=file` → `SIGNING_KEY_FILE`, `ENV=prod` → `APP_ENV=prod`.
- [ ] `docs/mikroserwisy.md`: „W skrócie” pkt 8, 3.5 (klucz z sekretu, dwa klucze w JWKS wg DEC-05 B, rotacja awaryjna = usunięcie starego klucza z konfiguracji i restart `auth`), 1.2 i 5.2 (bez `signing_keys`, bez kolumny `identity_pool`), 2, 3.1, 4.1, 5.10 (konta zespołu w tej samej organizacji ZITADEL, wyróżnia je `platform_roles`; autor „Zespół EQUENOR” rozpoznawany po `author_role = operator` / `actor_type = operator`), 10.2 pkt 4 i 5 (zaznaczyć, że rozstrzygnięte przez właściciela), uprawnienia IAM do KMS usunąć. Diagram `docs/mikroserwisy/uslugi.mmd`: KMS → „klucz podpisu (sekret)”; PNG/SVG wygenerować ponownie (`npx -y @mermaid-js/mermaid-cli@<wersja> -i uslugi.mmd -o uslugi.svg`), a jeśli render się nie uda, zostawić nowy `.mmd` i dopisać pod diagramem, że obraz jest starszy.
- [ ] `docs/erd.md`: usunąć `signing_keys` i `users.identity_pool` z listy tabel, opisu i „Zasad” (liczba tabel w nagłówkach), zostawić notę o decyzji; diagramy `docs/erd/app.svg|png` tylko notą „do odświeżenia”, jeśli nie da się ich wygenerować.
- [ ] SNS/SQS/LocalStack/SES/AWS SMS: nie przepisywać całych sekcji; przy pierwszym wystąpieniu w każdej sekcji dopisać „(broker i dostawcy wg DEC-01 i DEC-11; nazwy AWS to wariant A)”.
- [ ] `docs/analiza.md`: na górze ramka „Dokument historyczny (v3), nieaktualny: obowiązują mikroserwisy.md, erd.md i README”; link w README.md opisany jako „historyczny”.
- [ ] `mockups/decyzje-spec.md`: tytuł z EQUENOR (jeśli jeszcze nie ma), odwołania do `packages/*` zamienione jak wyżej. `mockups/STAN.md`: punkt 6 „Do zrobienia” odsyła do DEC-xx z `tasks/decisions.md`.
- [ ] README.md: usunąć zdanie „Struktura opisana w docs/development-szczegoly.md 3.1.1 … jest nieaktualna” (po poprawce już nie jest); sekcja „Kolejka zadań” (link do `tasks/README.md`) już jest; dopilnować, żeby linki do `tasks/QUEUE.md` i `tasks/decisions.md` działały.

## Poza zakresem
- Zmiany w kodzie (np. `identityPool` w `backend/src/services/auth/users/user-repository.ts`; usuwa je BE-013 i BE-026).
- Rozstrzyganie decyzji DEC-xx (robi właściciel); zmiany makiet `.dc.html`.
- Opis infrastruktury Dawida (klaster, sejf, CI) ponad to, co już jest.

## Kryteria akceptacji
- [ ] `grep -rn "pnpm\|turbo \|Turborepo\|TOKEN_SIGNER\|ENV=prod" docs README.md` nie zwraca trafień poza cytatem w notach historycznych.
- [ ] `grep -rn "packages/\|apps/" docs` zwraca tylko `docs/analiza.md` (historyczny).
- [ ] `grep -rn "signing_keys\|identity_pool" docs` zwraca tylko noty „usunięte decyzją DEC-05 / użytkownika” i `docs/analiza.md`.
- [ ] KMS występuje tylko jako wariant odrzucony w 10.2 pkt 5.
- [ ] Każda ścieżka kodu podana w docs istnieje w repo albo jest oznaczona jako przyszła z ID zadania (np. „`backend/src/lib/db` (BE-001)”).

## Testy
- Brak testów automatycznych; sprawdzenie komendami `grep` z kryteriów i ręczne przejście linków (`npx -y markdown-link-check@<wersja> docs/*.md` albo ręcznie).

## Definicja gotowości
- Kryteria spełnione, linki w README i docs działają; diagram odświeżony albo oznaczony; status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- Zmieniaj opis struktury i nazw, nie merytorykę (reguły domeny, scenariusze A-xx, testy T-xx zostają).
- Nie wpisuj rekomendacji DEC jako rozstrzygniętych: „propozycja (DEC-05 B)”.
- docs są po polsku; nazwy plików, env i identyfikatory po angielsku, w backtickach.
- Duże pliki (development-szczegoly.md ma ok. 2600 linii): edytuj sekcjami, po każdej sekcji sprawdzaj `grep`.
