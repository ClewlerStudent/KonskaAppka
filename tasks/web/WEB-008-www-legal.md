---
id: WEB-008
title: "Strona www: dokumenty i strony sklepowe"
area: web
stage: 1
size: S
status: todo
depends_on: []
decisions: [DEC-22]
owner:
branch:
trello:
---
# WEB-008 · Strona www: dokumenty i strony sklepowe

## Cel
Statyczna strona www ma strony, których wymagają Apple i Google oraz link z SMS-a zaproszenia: politykę prywatności i regulamin (szkielet pod treść od właściciela), stronę wsparcia, stronę usuwania konta i stronę pobrania apki („[WWW]/app”).

## Kontekst
- **Stan kodu:** `frontend/www/` (statyczny HTML bez JS): `index.html`, `regulamin.html` i `polityka-prywatnosci.html` z treścią „Dokument w przygotowaniu.”, style `www/src/main.css`, `site.css`, `art.css`; wejścia buildu w `frontend/vite.www.config.ts` (`rolldownOptions.input`); test `www/pages.node.test.ts` (jedno `h1`, bez skryptów, stylów inline i zewnętrznych URL; lista stron); E2E `e2e/www.spec.ts` (1440 i 390 px, brak żądań poza localhost); adresy przez `%VITE_*%` (dev, `frontend/.env`) i `__EQ_*__` podmieniane przez nginx (`frontend/Dockerfile`, `nginx/default.conf.template`, CSP `form-action 'none'`).
- **Dokumenty:** docs/development-szczegoly.md 3.5.5 (strona www, propozycja stron wymaganych przez Apple i Google), 2.7, 2.8 (sklepy: polityka prywatności, wsparcie, usuwanie konta). docs/mikroserwisy.md 3.8 (usunięcie konta: pseudonimizacja, wpisy w historii stajni bez nazwiska).
- **Makiety:** makiety-plan.md A „ZaproszenieStrona” (390×844: znak z hasłem, H1 „Pobierz EQUENOR”, App Store, Google Play, link „Panel web”; bez kroków, tokenu i danych zaproszenia; na komputerze QR do sklepów — propozycja) i „StronaUsunKonto” („Usuń konto EQUENOR”: co usuwamy, co zostaje, kroki apka → Profil → Usuń konto, kontakt). Wygląd stron dokumentów jak `regulamin.html`. WiadomosciSms.dc.html (link „[WWW]/app” w SMS).
- **Decyzje:** brak (identyfikatory i adresy sklepów zależą od DEC-22; do czasu publikacji adresy przychodzą z env).
- **Dane demo:** nie dotyczy.

## Zakres
- [ ] `www/app.html` (ZaproszenieStrona): H1 „Pobierz EQUENOR”, przyciski „App Store” i „Google Play” (`%VITE_APP_STORE_URL%`, `%VITE_PLAY_STORE_URL%`), link „Panel web” (`%VITE_PANEL_URL%/login`); na szerokim ekranie obok przycisków miejsce na kody QR jako statyczne SVG generowane w buildzie z adresów (propozycja; bez zewnętrznych usług, bez JS) albo bez QR, jeśli adresy są puste.
- [ ] `www/wsparcie.html`: kontakt e-mail (`mailto:%VITE_CONTACT_EMAIL%`), link do panelu i do strony usuwania konta.
- [ ] `www/usun-konto.html` (StronaUsunKonto): co usuwamy (dane osobowe, konto logowania), co zostaje (wpisy w historii stajni bez nazwiska), jak usunąć: w apce Profil → Usuń konto albo w panelu (`%VITE_PANEL_URL%/account`, WEB-007); kontakt e-mail. Bez formularza (strona statyczna, CSP `form-action 'none'`).
- [ ] `regulamin.html` i `polityka-prywatnosci.html`: szkielet sekcji pod treść od właściciela (polityka: administrator, jakie dane, cel, odbiorcy, okres przechowywania, prawa, kontakt; regulamin: strony, usługa, konto, płatności, odpowiedzialność, kontakt) ze znacznikiem `[TREŚĆ OD WŁAŚCICIELA]` w każdej sekcji; bez wymyślonych zapisów prawnych.
- [ ] Stopka wszystkich stron: dodać „Wsparcie” obok „Regulamin” i „Polityka prywatności”.
- [ ] Build: nowe wejścia w `vite.www.config.ts`; env `VITE_APP_STORE_URL`, `VITE_PLAY_STORE_URL` w `frontend/.env` (puste albo `#`), znaczniki `__EQ_APP_STORE_URL__`, `__EQ_PLAY_STORE_URL__` w `Dockerfile` i `sub_filter` w `nginx/default.conf.template` (env `APP_STORE_URL`, `PLAY_STORE_URL`); README frontendu (lista env).
- [ ] `nginx`: `/app` serwuje `app.html` (już działa przez `try_files $uri $uri.html`), test na obrazie w README.

## Poza zakresem
- Treść prawna (dostarcza Dawid); usuwanie konta przez formularz na www (wymagałoby API i JS); panel `/account` (WEB-007); strona główna (zrobiona).

## Kryteria akceptacji
- [ ] `pages.node.test.ts` obejmuje 6 stron (`index`, `regulamin`, `polityka-prywatnosci`, `wsparcie`, `usun-konto`, `app`): każda ma jedno `h1`, brak skryptów, stylów inline i zewnętrznych URL, linki tylko do istniejących stron, panelu, sklepów (`%VITE_APP_STORE_URL%`, `%VITE_PLAY_STORE_URL%`) i adresu kontaktu.
- [ ] `[WWW]/app` z telefonu (390 px) pokazuje „Pobierz EQUENOR” i oba przyciski bez poziomego przewijania; bez danych zaproszenia.
- [ ] W obrazie Docker adresy sklepów i kontaktu podmienia env kontenera.
- [ ] Bez bloga, CMS i treści instruktażowych poza stroną usuwania konta (wyjątek z makiety).

## Testy
- Vitest: rozszerzony `www/pages.node.test.ts` (lista stron, dozwolone linki).
- Playwright `e2e/www.spec.ts`: nowe strony w 1440 i 390 px, brak żądań poza localhost, stopka z „Wsparcie”.
- `cd frontend && npm run check && npm run build && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; README (env obrazu) zaktualizowane; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Kolory tylko ze zmiennych z `src/theme` (test `no-color-literals` skanuje też HTML i CSS www).
- „EQUENOR” zawsze wersalikami, hasło „Equestrian Management, Refined” tylko pod znakiem (docs/paleta.md).
- Linki „Panel web” w SMS-ach prowadzą tu, a nie bezpośrednio do panelu (makiety-plan.md 3.H, grupa A).
