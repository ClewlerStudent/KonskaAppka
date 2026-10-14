---
id: WEB-026
title: PanelOps (admin globalny)
area: web
stage: 9
size: L
status: todo
depends_on: [BE-026, BE-036, WEB-004, WEB-002]
decisions: [DEC-10, DEC-07, DEC-31]
owner:
branch:
trello: https://trello.com/c/xbF47WTs
---
# WEB-026 · PanelOps (admin globalny)

## Cel
Zespół EQUENOR (admin globalny, np. Kuba) wchodzi na osobny host `[OPS]`: loguje się hasłem i kodem z podaniem powodu wejścia (np. numer zgłoszenia), wybiera firmę i stajnię i pracuje na zwykłych ekranach admina ze stałym paskiem „EQUENOR · pełny dostęp · … · powód: …”. Ma też narzędzia platformy: użytkownicy (wylogowanie, odblokowanie), historia powiadomień z ponowieniem i wnioski o admina konta we dwie osoby.

## Kontekst
- **Stan kodu:** panel admina (od WEB-004) na trasach `/stables/$stableId/*`; sesja i ekrany logowania panelu (WEB-001, WEB-002); `vite.web.config.ts`, `nginx/default.conf.template` (serwery 8080 www i 8081 panel, CSP z Trusted Types), `frontend/Dockerfile`.
- **Dokumenty:** docs/mikroserwisy.md 4.1 (osobny host `[OPS]`, trasy `/auth/v1/ops/login`, `/ops/login/mfa` z powodem, `/ops/password/*`, `/ops/token`, `/ops/logout`; ciasteczko `__Secure-eq_rt_ops` z `Path=/auth/v1/ops/token`; step-up: `auth_time` ≤ 5 min; ekran: wybór firmy i stajni, pasek), 4.2–4.4 (zapis jak admin konta; autor „Zespół EQUENOR”), 3.4 (sesja `ops`: 30 min bezczynności, 10 h maksimum), 3.6 (`platform` przechodzi tam, gdzie `admin`, także z `client_id = ops`), 3.7 (tabela: `401 step_up_required` → ponowne logowanie i powtórzenie zapisu), 9.6 (przykład Kuby). BE-026: trasy `ops`, `GET /auth/v1/platform/businesses`, `GET …/platform/stables/{s}/technical-accounts`, `GET /platform/users?q=`, `POST /platform/users/{u}/sign-out|unlock`, `POST /platform/business-admin-requests` i `…/{id}/approve` (step-up, druga osoba). BE-036: `GET /notifications/v1/platform/notifications?stableId=&userId=&status=`, `POST …/{id}/retry`.
- **Makiety:** brak planszy (PanelOps P2 do narysowania, docs/mockups/STAN.md pkt 5); układ jak panel admina z paskiem nad nagłówkiem, logowanie jak PanelLogowanie z polem „Powód wejścia” w kroku kodu.
- **Decyzje:** DEC-10 A (osobny host `[OPS]`, opctl, role we dwie osoby; konta zespołu = wiersz `platform_roles` w tej samej organizacji ZITADEL, bez `identity_pool`; support później; allowlista IP po PoC). DEC-07 A (`ops.<domena>`).
- **Dane demo:** Kuba (admin globalny, `platform_roles`), drugi admin globalny z seedu dev (zatwierdzanie we dwie osoby), Anna z wygasłym dostępem do Komety (scenariusz 9.6).

## Zakres
- [ ] Tryb buildu `ops`: `vite build --mode ops` (albo osobny `vite.ops.config.ts`) → `dist/ops`; ten sam kod z flagą trybu w konfiguracji `<meta>` (`eq-mode=ops`); serwer nginx na porcie 8082 z CSP jak panel; `Dockerfile` kopiuje `dist/ops`; `frontend/README.md` (host `[OPS]`, port, env `OPS_API_BASE_URL`). API wołane przez host `[OPS]` (ciasteczko tylko tego hosta).
- [ ] `OpsAuthApi`: `X-Equenor-Client: ops`, `clientId: 'ops'`, trasy `/auth/v1/ops/*`; ekrany: logowanie (telefon albo e-mail i hasło, „Nie pamiętam hasła” → reset `ops`), krok kodu z polem „Powód wejścia” (3–200 znaków, wymagane); bez rejestracji. `403 wrong_client` → „To konto nie ma dostępu do panelu zespołu.”.
- [ ] Sesja `ops`: odświeżenie `POST /auth/v1/ops/token`, wylogowanie `POST /auth/v1/ops/logout`; powód zapamiętany w pamięci i `sessionStorage` (try/catch) tylko do paska; `401 step_up_required` → dialog ponownego logowania (hasło i kod), potem powtórzenie zapisu.
- [ ] Start: lista firm i stajni z `GET /platform/businesses` (wyszukiwarka po nazwie i NIP, status stajni) → wybór → zwykłe trasy `/stables/$stableId/*`; stały pasek „EQUENOR · pełny dostęp · Stajnie Lipowe › Stajnia Pod Lipami · powód: ZGL-123” na każdym ekranie, z „Zmień stajnię” i „Wyloguj”.
- [ ] Narzędzia platformy (osobna sekcja nawigacji w trybie `ops`): „Użytkownicy” (`GET /platform/users?q=`, „Wyloguj wszędzie”, „Odblokuj” z dialogami), „Powiadomienia” (filtr stajnia, osoba, status; „Ponów” → `retry`), „Konta techniczne” stajni (status), „Admini kont” (wniosek o dodanie albo usunięcie z powodem, lista oczekujących, „Zatwierdź” niedostępne dla autora wniosku; step-up).
- [ ] W Ludziach i historii autor z zespołu jako „Zespół EQUENOR”, nadania z `grantedVia = platform` oznaczone (WEB-005).

## Poza zakresem
- Role platformowe i konta zespołu (tylko `opctl`, BE-056); rotacja klucza podpisu to wymiana sekretu przez Dawida (DEC-05 B), bez trasy i komendy; PanelDiagnostyka (P3); Wsparcie IT (`plt = support`, po PoC); allowlista IP i VPN (infrastruktura Dawida).

## Kryteria akceptacji
- [ ] 9.6: Kuba loguje się na `[OPS]` z powodem „ZGL-123”, wybiera Brzozową, przedłuża dostęp Anny do Komety (WEB-005) — zapis działa, pasek pokazuje powód.
- [ ] Zapis wrażliwy 6 min po logowaniu (mimo odświeżeń) daje dialog step-up, a po ponownym logowaniu zapis się powtarza.
- [ ] Konto bez roli platformowej na `[OPS]`: komunikat `wrong_client`; konto Kuby w zwykłym panelu: `wrong_client`.
- [ ] Wniosek o kolejnego admina konta złożony przez Kubę może zatwierdzić tylko drugi admin globalny.
- [ ] Ponowienie powiadomienia z historii zmienia jego stan (atrapa: `attempts + 1`).
- [ ] Build `ops` przechodzi test CSP na zbudowanych plikach (wzór `e2e/panel.spec.ts`).

## Testy
- Vitest: `OpsAuthApi`, sesja `ops` (step-up, powtórzenie), pasek z powodem, wybór stajni.
- Playwright: osobny projekt `ops` na atrapie (logowanie z powodem, wybór stajni, step-up, narzędzia), test CSP na `dist/ops` przez `vite preview`.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build` (z trybem `ops`), `npm run e2e` we `frontend/` zielone; obraz Docker z serwerem `[OPS]`; `frontend/README.md` zaktualizowane; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Konta zespołu to wiersz `platform_roles` w tej samej organizacji ZITADEL (bez `identity_pool`, DEC-10); docs/mikroserwisy.md 4.1 w tym punkcie jest nieaktualne.
- XSS w panelu klientów nie może dosięgnąć sesji `[OPS]`: osobny host i osobne ciasteczko; żadnych linków z panelu klientów do `[OPS]`.
- Zmiana zależności względem listy: dodane BE-036 (historia i ponowienie powiadomień).
