# Decyzje właściciela produktu (DEC-xx)

Pytania, które musi rozstrzygnąć Dawid. Zadania w kolejce odwołują się do nich polem `decisions` w nagłówku.

Zasady dla agentów:
- **Status `otwarta`:** pracujesz według **rekomendacji** i wiersza „Do czasu decyzji”. Kod, który zależy od wyboru, trzymasz za interfejsem albo w konfiguracji, żeby zmiana decyzji nie wymagała przepisywania. W PR wypisujesz, co zrobiłeś „na rekomendacji”.
- **Pole „Blokuje”:** zadania, których nie zaczynasz przed rozstrzygnięciem (`next` ich nie pokazuje, `claim` odmawia bez `--force`).
- **Rozstrzygnięcie:** wpisuje je właściciel albo agent na jego wyraźne polecenie: status `rozstrzygnięta`, data, wybrana opcja i ewentualne zmiany w zadaniach. Potem `node tasks/queue.mjs index`.
- Nowa decyzja: kolejny numer, ten sam układ punktów. Linia „Zadania” jest generowana przez `node tasks/queue.mjs index` z nagłówków zadań, nie edytuj jej ręcznie.
- Decyzje użytkownika z 13–14.10 (zwykły npm, jeden obraz backendu, ZITADEL, klucz jako sekret, `platform_roles`, infrastruktura po stronie Dawida) są już przyjęte i nie mają tu numerów. Spis: [README.md](README.md#decyzje-już-podjęte).

## DEC-01 · Kolejki zdarzeń i kodów: SNS/SQS czy self-hosted
- **Status:** otwarta
- **Pytanie:** Na czym działają zdarzenia (publish/subscribe), kolejki FIFO `sms` i `email` z DLQ oraz kolejki kodów z retencją do 5 min?
- **Kontekst:** docs opisują AWS SNS + SQS (lokalnie LocalStack). Decyzja „nie wiązać się z chmurą” i tani PoC na własnym klastrze przemawiają za brokerem self-hosted. Od wyboru zależą adapter `lib/messaging`, manifest kolejek dla Dawida i usługa w `docker-compose.yml`.
- **Opcje:**
  - A: AWS SNS + SQS (lokalnie LocalStack), jak w docs.
  - B: RabbitMQ na klastrze (quorum queues, DLX, TTL kolejki kodów, single active consumer dla FIFO).
  - C: NATS JetStream na klastrze.
  - D: kolejka w PostgreSQL.
- **Rekomendacja:** B za interfejsem `lib/messaging` z adapterem w pamięci do testów.
- **Do czasu decyzji:** zadania ruszają na adapterze w pamięci (BE-008); adapter brokera powstaje jako wymienny moduł, a `docker-compose.yml` dostaje RabbitMQ w profilu `infra`. Żadnych typów ani nazw specyficznych dla brokera poza adapterem.
- **Blokuje:** brak
- **Zadania:** [BE-008](backend/BE-008-messaging.md), [SH-001](shared/SH-001-docs-decyzje.md), [SH-002](shared/SH-002-local-env-2.md), [BE-015](backend/BE-015-auth-code-queues.md), [BE-016](backend/BE-016-svc-sms.md), [BE-017](backend/BE-017-svc-email.md), [BE-035](backend/BE-035-cron-escalation.md), [BE-036](backend/BE-036-svc-notifications.md), [BE-046](backend/BE-046-horse-left.md), [BE-058](backend/BE-058-observability-k6.md), [BE-060](backend/BE-060-platform-manifests.md)
- **Odwołania:** docs/mikroserwisy.md 1.4, 5.2 „Kody”, 5.8; docs/development-szczegoly.md 3.1.8.
- **Rozstrzygnięcie:** —

## DEC-02 · Położenie kodu apki mobilnej i tabletu
- **Status:** otwarta
- **Pytanie:** Gdzie leżą apka mobilna i apka tabletu i jak dostają typy API oraz tokeny palety bez importów z `backend/` i `frontend/`?
- **Kontekst:** README ustala dwa niezależne pakiety npm (`backend/`, `frontend/`) bez workspaces. Apka i tablet to Expo/React Native; tablet ma moduł kiosku w Kotlinie (Device Owner).
- **Opcje:**
  - A: katalogi `mobile/` i `tablet/` w tym repo, osobne pakiety npm jak `frontend/`.
  - B: osobne repozytoria.
  - C: jeden pakiet Expo z dwoma wariantami.
- **Rekomendacja:** A; typy z `backend/openapi/*.json` przez openapi-typescript (`gen:api`), tokeny przez `gen:theme` z tabel docs/paleta.md, z testem zgodności w CI.
- **Do czasu decyzji:** MOB-001 i TAB-001 zakładają `mobile/` i `tablet/` w tym repo; nic nie importuje z innych pakietów, więc przeniesienie do osobnego repo to zmiana ścieżek w `gen:api` i `gen:theme`.
- **Blokuje:** brak
- **Zadania:** [SH-001](shared/SH-001-docs-decyzje.md), [SH-003](shared/SH-003-ci.md), [SH-004](shared/SH-004-gen-api-theme.md), [TAB-001](tablet/TAB-001-tab-skeleton.md), [MOB-001](mobile/MOB-001-mob-skeleton.md)
- **Odwołania:** README.md „Kod”; docs/development-szczegoly.md 3.1.1, 3.1.12.
- **Rozstrzygnięcie:** —

## DEC-03 · Macierz widoczności w tokenie
- **Status:** otwarta
- **Pytanie:** Czy widoczne funkcje roli (`stable_role_features`) idą w claimie `m[].f`, czy serwisy czytają konfigurację stajni?
- **Kontekst:** reguła W2: serwis autoryzuje z tokenu, bez zapytań do cudzych tabel. Konfiguracja czytana przez serwisy wymagałaby wyjątku od W2.
- **Opcje:**
  - A: w tokenie `m[].f`; zmiana macierzy działa najpóźniej po 5 min (TTL access tokenu) albo od razu po `Equenor-Token-Refresh`.
  - B: konfiguracja stajni czytana przez serwisy (wyjątek od W2).
- **Rekomendacja:** A, zgodnie z docs/mikroserwisy.md.
- **Do czasu decyzji:** `m[].f` w tokenie; sprawdzanie funkcji w jednym miejscu (`lib/authz`, polityka `stable.feature` w deskryptorze trasy).
- **Blokuje:** brak
- **Zadania:** [BE-006](backend/BE-006-tenancy-authz.md), [BE-013](backend/BE-013-auth-db-repos.md), [BE-024](backend/BE-024-auth-horse-access-matrix.md), [WEB-014](web/WEB-014-web-stable-settings.md), [BE-034](backend/BE-034-ops-flags.md), [BE-038](backend/BE-038-board-client.md), [BE-041](backend/BE-041-board-tablet.md), [BE-042](backend/BE-042-board-display.md), [BE-047](backend/BE-047-schedule-health.md), [BE-048](backend/BE-048-schedule-rides.md), [BE-050](backend/BE-050-ops-tasks.md), [BE-057](backend/BE-057-isolation-matrix.md)
- **Odwołania:** docs/mikroserwisy.md 3.2, 10.2 pkt 1.
- **Rozstrzygnięcie:** —

## DEC-04 · businesses w auth czy w stables
- **Status:** otwarta
- **Pytanie:** Który serwis jest właścicielem `businesses` i `business_admins`?
- **Kontekst:** claim `biz` (firmy, których osoba jest adminem) wydaje `auth`. Rejestracja konta firmy zakłada firmę i admina naraz.
- **Opcje:**
  - A: `auth` (jedna transakcja rejestracji firmy i admina, claim `biz` z własnych tabel).
  - B: `stables`, z sagą i cronem uzgadniającym.
- **Rekomendacja:** A.
- **Do czasu decyzji:** tabele w `auth` (BE-001), trasy `/businesses` w `auth` (BE-021).
- **Blokuje:** brak
- **Zadania:** [BE-001](backend/BE-001-db-migrator.md), [BE-021](backend/BE-021-auth-businesses.md), [WEB-003](web/WEB-003-web-business-signup.md)
- **Odwołania:** docs/mikroserwisy.md 5.2, 10.2 pkt 2.
- **Rozstrzygnięcie:** —

## DEC-05 · Klucz podpisu jako sekret: rotacja i signing_keys
- **Status:** otwarta
- **Pytanie:** Jak rotować klucz ES256 dostarczany jako sekret (bez KMS) i czy tabela `signing_keys` zostaje?
- **Kontekst:** przyjęte: klucz podpisu JWT to sekret od właściciela, bez KMS. docs/erd.md i mikroserwisy.md 3.5 nadal opisują `signing_keys` ze statusami.
- **Opcje:**
  - A: jeden klucz; wymiana = wszyscy logują się ponownie.
  - B: dwa klucze z sekretów (aktywny i następny/wycofywany) publikowane w JWKS, bez tabeli `signing_keys`.
  - C: tabela `signing_keys` ze statusami jak w docs.
- **Rekomendacja:** B: `SIGNING_KEY_FILE` i opcjonalny `SIGNING_KEY_NEXT_FILE`, `kid` = odcisk RFC 7638, refresh token przyjmowany tylko kluczami z konfiguracji; rotacja awaryjna = usunięcie starego klucza z sekretu. Bez `signing_keys` w ERD i bez trasy `/platform/keys/rotate`.
- **Do czasu decyzji:** wariant B (BE-013); bez tabeli `signing_keys` (BE-001).
- **Blokuje:** brak
- **Zadania:** [BE-001](backend/BE-001-db-migrator.md), [SH-001](shared/SH-001-docs-decyzje.md), [BE-013](backend/BE-013-auth-db-repos.md), [BE-026](backend/BE-026-auth-platform-admin.md), [BE-056](backend/BE-056-opctl.md), [SH-006](shared/SH-006-runbooks.md)
- **Odwołania:** docs/mikroserwisy.md 3.5, 10.2 pkt 5; docs/erd.md pkt 6.
- **Rozstrzygnięcie:** —

## DEC-06 · Okna refresh tokenu i DPoP
- **Status:** otwarta
- **Pytanie:** Czy zostają okna z 3.4 (panel 7/30 dni, tablet bez limitu, TV 365 dni) i czy tablet i TV dostają DPoP na PoC?
- **Kontekst:** bez DPoP skopiowany refresh token tabletu działa do 30 dni bezczynności albo do „Wyloguj wszystkie tablety”. DPoP wymaga spike'u.
- **Opcje:**
  - A: okna z 3.4, bez DPoP na PoC.
  - B: okna z 3.4 i DPoP od razu (spike).
  - C: krótsze okna.
- **Rekomendacja:** A; DPoP po pilotażu.
- **Do czasu decyzji:** okna jako konfiguracja `auth` (nie stałe w kodzie); klienci (MOB-002, TAB-009, WEB-001) nie zakładają konkretnej długości sesji.
- **Blokuje:** brak
- **Zadania:** [BE-013](backend/BE-013-auth-db-repos.md), [MOB-002](mobile/MOB-002-mob-session.md), [TAB-009](tablet/TAB-009-tab-session.md)
- **Odwołania:** docs/mikroserwisy.md 3.4, 3.7, 10.2 pkt 3 i 8.
- **Rozstrzygnięcie:** —

## DEC-07 · Domeny panelu, API i [OPS]
- **Status:** otwarta
- **Pytanie:** Czy panel i API mogą być w jednej domenie rejestrowalnej (ciasteczko `__Secure-eq_rt` z `SameSite=Strict`), a panel zespołu `[OPS]` na osobnym hoście?
- **Kontekst:** refresh token panelu żyje w ciasteczku. Gdy panel i API są w różnych domenach rejestrowalnych, potrzebny jest BFF.
- **Opcje:**
  - A: tak (np. `panel.<domena>`, `api.<domena>`, `ops.<domena>`).
  - B: nie, potrzebny BFF.
- **Rekomendacja:** A.
- **Do czasu decyzji:** ciasteczko jak dziś w `auth`; CORS z listą originów z env (`ALLOWED_ORIGINS`, `OPS_ORIGINS`); w dev wszystko na `localhost`.
- **Blokuje:** brak
- **Zadania:** [BE-026](backend/BE-026-auth-platform-admin.md), [WEB-001](web/WEB-001-web-session.md), [WEB-026](web/WEB-026-web-ops.md)
- **Odwołania:** docs/mikroserwisy.md 3.7, 10.2 pkt 6.
- **Rozstrzygnięcie:** —

## DEC-08 · ZITADEL: uwierzytelnienie auth i wartości polityk
- **Status:** otwarta
- **Pytanie:** Jak `auth` uwierzytelnia się w ZITADEL i jakie wartości polityk przyjmujemy?
- **Kontekst:** dziś `docker-compose.yml` używa PAT. Ustawienia polityk ZITADEL da się zmienić w działającej instalacji, więc wartości mogą ruszyć z propozycjami. Przed produkcją: licencja AGPL-3.0 ZITADEL u prawnika.
- **Opcje:**
  - A: klucz prywatny konta serwisowego (private key JWT) wszędzie.
  - B: PAT (jak dziś w compose).
  - C: PAT w dev, private key JWT w test i prod.
- **Rekomendacja:** C; jedna instancja na środowisko, jedna organizacja klientów; hasło min. 10 znaków, kod MFA 6 cyfr i 5 min, kody weryfikacji i resetu 8 cyfr i 15 min, blokada po 5 złych kodach, bez blokady hasłem.
- **Do czasu decyzji:** BE-012 obsługuje oba sposoby uwierzytelnienia (PAT z pliku, klucz JSON konta serwisowego); wartości polityk w skrypcie `zitadel:configure`, nie w kodzie.
- **Blokuje:** brak
- **Zadania:** [BE-012](backend/BE-012-zitadel-adapter.md), [BE-018](backend/BE-018-auth-password-reset.md), [BE-020](backend/BE-020-auth-profile-changes.md), [BE-056](backend/BE-056-opctl.md)
- **Odwołania:** docs/mikroserwisy.md 5.2, 5.10, 10.2 pkt 17; `docker-compose.yml` (usługa `zitadel`).
- **Rozstrzygnięcie:** —

## DEC-09 · Warstwa bazy i migracje na PoC
- **Status:** otwarta
- **Pytanie:** Ile z zestawu Drizzle + własny migrator + bramka (lint schematu, sql-gate, test katalogu, squawk) robimy od razu?
- **Kontekst:** model danych zakazuje `DEFAULT`, sekwencji, enumów, `jsonb`, triggerów, RLS i akcji FK (docs/erd.md „Zasady wspólne”). Bramka pilnuje tego automatycznie.
- **Opcje:**
  - A: pełny zestaw od początku.
  - B: Drizzle, migrator, lint schematu i test katalogu od razu; sql-gate i squawk przed etapem 2.
- **Rekomendacja:** B.
- **Do czasu decyzji:** BE-001 robi Drizzle, migrator i szybki test katalogu; BE-002 resztę bramki przed pierwszymi migracjami etapu 2.
- **Blokuje:** brak
- **Zadania:** [BE-001](backend/BE-001-db-migrator.md), [BE-002](backend/BE-002-db-gate.md)
- **Odwołania:** docs/development-szczegoly.md 3.1.3, 3.1.4.
- **Rozstrzygnięcie:** —

## DEC-10 · Panel zespołu [OPS], opctl i Wsparcie IT
- **Status:** otwarta
- **Pytanie:** Gdzie pracuje admin globalny, czy zostaje CLI `opctl`, czy role platformowe nadajemy we dwie osoby, czy `[OPS]` dostaje VPN albo allowlistę IP i czy powstaje rola `plt = support`?
- **Kontekst:** przyjęte: konta zespołu EQUENOR to wiersz `platform_roles` (claim `plt`) w tej samej organizacji ZITADEL, bez `users.identity_pool`.
- **Opcje:**
  - A: osobny host `[OPS]` (tryb buildu panelu), `opctl`, role we dwie osoby.
  - B: admin globalny w zwykłym panelu, z audytem.
  - C: A bez `opctl` (bootstrap skryptem).
- **Rekomendacja:** A; `support` później; allowlista IP po PoC.
- **Do czasu decyzji:** trasy `/ops/*` i `/platform/*` w `auth` (BE-026) i build `[OPS]` panelu (WEB-026) według A. CLI `opctl` (BE-056) czeka na rozstrzygnięcie, bo w wariancie C go nie ma.
- **Blokuje:** BE-056
- **Zadania:** [BE-001](backend/BE-001-db-migrator.md), [BE-004](backend/BE-004-db-domain-tables.md), [BE-011](backend/BE-011-seed.md), [BE-012](backend/BE-012-zitadel-adapter.md), [SH-001](shared/SH-001-docs-decyzje.md), [BE-013](backend/BE-013-auth-db-repos.md), [BE-022](backend/BE-022-auth-invitations.md), [BE-026](backend/BE-026-auth-platform-admin.md), [BE-040](backend/BE-040-platform-apk.md), [BE-055](backend/BE-055-audit-retention.md), [BE-056](backend/BE-056-opctl.md), [BE-057](backend/BE-057-isolation-matrix.md), [SH-006](shared/SH-006-runbooks.md), [WEB-026](web/WEB-026-web-ops.md)
- **Odwołania:** docs/mikroserwisy.md 4.1–4.6, 10.2 pkt 4 i 9.
- **Rozstrzygnięcie:** —

## DEC-11 · Dostawcy SMS i e-maila
- **Status:** otwarta
- **Pytanie:** Przez kogo wysyłamy SMS i e-mail (adaptery serwisów `sms` i `email`)?
- **Kontekst:** kody MFA i zaproszenia muszą dochodzić; Sender ID „EQUENOR”; numery spoza PL zablokowane. Lokalnie działają fake-sms i Mailpit.
- **Opcje:**
  - A: AWS SMS + SES.
  - B: polski dostawca SMS (np. SMSAPI) + SMTP.
  - C: AWS SMS + SMTP.
- **Rekomendacja:** B na PoC (bez wiązania z chmurą).
- **Do czasu decyzji:** `sms` i `email` działają z adapterami `console`, fake-sms i SMTP do Mailpit (BE-016, BE-017). Prawdziwe adaptery (BE-059) czekają na wybór dostawcy i konta założone przez Dawida.
- **Blokuje:** BE-059
- **Zadania:** [BE-016](backend/BE-016-svc-sms.md), [BE-017](backend/BE-017-svc-email.md), [BE-059](backend/BE-059-real-senders.md)
- **Odwołania:** docs/development-szczegoly.md 2.5, 2.6, 5 pkt 24.
- **Rozstrzygnięcie:** —

## DEC-12 · Zakres billingu na PoC
- **Status:** otwarta
- **Pytanie:** Czy billing powstaje na PoC i kto płaci: stajnia czy konto firmy?
- **Kontekst:** billing to osobny serwis, 3 crony, zawieszanie stajni i ekran Płatności. Bez decyzji łatwo zbudować coś, czego PoC nie potrzebuje.
- **Opcje:**
  - A: fałszywe adaptery (płatności, faktury, PDF), subskrypcja per stajnia, 3 crony.
  - B: billing poza PoC.
  - C: subskrypcja per konto firmy.
- **Rekomendacja:** A; KSeF i prawdziwy dostawca płatności po pilotażu.
- **Do czasu decyzji:** nie zaczynamy serwisu `billing` (BE-052); zadania zależne czekają przez zależności. Tabele billingu w BE-004 powstają, bo są w ERD.
- **Blokuje:** BE-052
- **Zadania:** [BE-052](backend/BE-052-svc-billing.md), [BE-053](backend/BE-053-cron-billing.md), [BE-054](backend/BE-054-stable-suspended.md), [WEB-024](web/WEB-024-web-billing.md)
- **Odwołania:** docs/erd.md „Otwarte kwestie” pkt 3; docs/development-szczegoly.md 5 pkt 28, 47.
- **Rozstrzygnięcie:** —

## DEC-13 · Tablet offline i interwał odpytywania
- **Status:** otwarta
- **Pytanie:** Kolejka zapisów czy blokada akcji bez sieci; jaki interwał odpytywania i próg „dane nieaktualne”?
- **Kontekst:** stajnie mają słabe Wi-Fi. Potwierdzenie flagi bez sieci musi albo trafić do kolejki, albo jawnie się nie udać.
- **Opcje:**
  - A: kolejka zapisów w SQLite z licznikiem niewysłanych.
  - B: blokada akcji z komunikatem.
- **Rekomendacja:** A; odpytywanie co 5 s z jitterem, p95 opóźnienia flagi do 15 s, „dane nieaktualne” po 2 min bez udanego odpytania.
- **Do czasu decyzji:** TAB-012 i TAB-013 według A, wartości w konfiguracji apki.
- **Blokuje:** brak
- **Zadania:** [BE-041](backend/BE-041-board-tablet.md), [TAB-012](tablet/TAB-012-tab-polling.md), [TAB-013](tablet/TAB-013-tab-write-queue.md), [BE-058](backend/BE-058-observability-k6.md)
- **Odwołania:** docs/development-szczegoly.md 5 pkt 19, 33; docs/makiety-plan.md dec. 16.
- **Rozstrzygnięcie:** —

## DEC-14 · Plan dnia na TV
- **Status:** otwarta
- **Pytanie:** Czy wizyty i jazdy w „Dziś w stajni” na wyświetlaczu są częścią funkcji `routine`?
- **Opcje:**
  - A: część `routine` (makiety bez zmian).
  - B: funkcje `health` i `rides` dla wyświetlacza (zmiana makiet ustawień i danych demo).
  - C: TV bez wizyt i jazd (zmiana makiety WyswietlaczCentralny).
- **Rekomendacja:** A.
- **Do czasu decyzji:** BE-042 i WEB-016 według A.
- **Blokuje:** brak
- **Zadania:** [BE-042](backend/BE-042-board-display.md), [WEB-016](web/WEB-016-tv-central.md), [BE-045](backend/BE-045-board-day.md)
- **Odwołania:** docs/mikroserwisy.md 5.4, 10.2 pkt 7.
- **Rozstrzygnięcie:** —

## DEC-15 · Nawigacja apki i panelu dla ról
- **Status:** otwarta
- **Pytanie:** Pasek admina w apce, panel dla ról innych niż admin, miejsce „Opuść stajnię” i numer „Zadzwoń do stajni”.
- **Opcje:**
  - A: rekomendacje z docs/makiety-plan.md (dec. 17a, 18a, 25b).
  - B: inne.
- **Rekomendacja:** A: admin w apce Dziś | Boksy | Zadania | Ludzie | Profil; panel tylko dla admina i wyświetlacza (inni widzą PanelWitaj z linkiem do apki); „Opuść stajnię” w Profilu; „Zadzwoń do stajni” dzwoni na telefon pierwszego aktywnego admina.
- **Do czasu decyzji:** według A; numer stajni daje `GET /me` (BE-062).
- **Blokuje:** brak
- **Zadania:** [BE-019](backend/BE-019-auth-me.md), [BE-023](backend/BE-023-auth-members.md), [MOB-005](mobile/MOB-005-mob-start-nav.md), [MOB-006](mobile/MOB-006-mob-profile.md), [WEB-001](web/WEB-001-web-session.md), [WEB-004](web/WEB-004-web-admin-layout.md), [BE-062](backend/BE-062-me-stable-contact-horses.md), [MOB-011](mobile/MOB-011-mob-people.md), [MOB-020](mobile/MOB-020-mob-admin-today.md)
- **Odwołania:** docs/makiety-plan.md 5 dec. 17, 18, 25; docs/mikroserwisy.md 10.2 pkt 21, 22.
- **Rozstrzygnięcie:** —

## DEC-16 · Dzwonek i powiadomienia push w apce
- **Status:** otwarta
- **Pytanie:** Czy apka ma dzwonek z listą powiadomień albo push?
- **Opcje:**
  - A: bez dzwonka i push na PoC.
  - B: lista z istniejących danych.
  - C: skrzynka z nową tabelą i push.
- **Rekomendacja:** A: eskalacje idą SMS-em i e-mailem według reguł stajni, w apce jest sekcja „Pilne”.
- **Do czasu decyzji:** brak ikony dzwonka i rejestracji tokenów push.
- **Blokuje:** brak
- **Zadania:** [MOB-005](mobile/MOB-005-mob-start-nav.md), [BE-036](backend/BE-036-svc-notifications.md), [MOB-020](mobile/MOB-020-mob-admin-today.md)
- **Odwołania:** docs/makiety-plan.md dec. 22; docs/mikroserwisy.md 10.2 pkt 22.
- **Rozstrzygnięcie:** —

## DEC-17 · Jazdy: kto tworzy
- **Status:** otwarta
- **Pytanie:** Kto tworzy jazdy i czy instruktor ustawia flagi?
- **Opcje:**
  - A: admin i instruktor.
  - B: tylko admin.
  - C: także klient.
- **Rekomendacja:** A w API; w apce na PoC tylko podgląd (InstruktorJazdy, flagi do odczytu), ekran DodajJazde później. Instruktor nie ustawia flag.
- **Do czasu decyzji:** BE-048 i MOB-022 według A.
- **Blokuje:** brak
- **Zadania:** [BE-048](backend/BE-048-schedule-rides.md), [MOB-022](mobile/MOB-022-mob-rides-health.md), [WEB-029](web/WEB-029-web-arenas.md)
- **Odwołania:** docs/makiety-plan.md dec. 20; docs/mikroserwisy.md 10.2 pkt 11.
- **Rozstrzygnięcie:** —

## DEC-18 · Czasy „Cofnij” i blokady, ukryte ustawienia, Wi-Fi
- **Status:** otwarta
- **Pytanie:** Jak długo działa „Cofnij”, po jakim czasie schodzi blokada ekranu tabletu, jak wejść w ukryte ustawienia i kto zmienia Wi-Fi?
- **Opcje:**
  - A: wartości proponowane (niżej).
  - B: inne.
- **Rekomendacja:** A: „Cofnij” przez 1 h, blokada ekranu schodzi po 10 min, ukryte ustawienia przytrzymaniem stopki „ONLINE” przez 5 s, Wi-Fi zmienia każdy na PoC.
- **Do czasu decyzji:** wartości w konfiguracji (backend: okno „Cofnij”; tablet: czasy i gest), nie w kodzie.
- **Blokuje:** brak
- **Zadania:** [MOB-008](mobile/MOB-008-mob-write-queue.md), [TAB-015](tablet/TAB-015-tab-screen-lock.md), [TAB-016](tablet/TAB-016-tab-hidden-settings.md), [BE-044](backend/BE-044-ops-quick-actions.md), [BE-045](backend/BE-045-board-day.md), [MOB-016](mobile/MOB-016-mob-day-list.md), [MOB-020](mobile/MOB-020-mob-admin-today.md), [TAB-018](tablet/TAB-018-tab-quick-actions.md)
- **Odwołania:** docs/development-szczegoly.md 5 pkt 17, 30; docs/makiety-plan.md dec. 13, 14.
- **Rozstrzygnięcie:** —

## DEC-19 · Kod MFA dla recenzentów sklepów
- **Status:** otwarta
- **Pytanie:** Jak recenzent Apple i Google dostanie kod MFA konta demo (bez wyjątku od MFA)?
- **Opcje:**
  - A: kod e-mailem na skrzynkę konta demo, do której dostęp podajemy w notatce do recenzji.
  - B: tryb demo uzgodniony z Apple.
- **Rekomendacja:** A (do sprawdzenia, czy Apple i Google to przyjmą).
- **Do czasu decyzji:** publikacja w sklepach (MOB-025) czeka.
- **Blokuje:** MOB-025
- **Zadania:** [MOB-025](mobile/MOB-025-mob-store.md)
- **Odwołania:** docs/mikroserwisy.md 10.2 pkt 25.
- **Rozstrzygnięcie:** —

## DEC-20 · Domyślne wartości nowej stajni i reguły health_due/payment_overdue
- **Status:** otwarta
- **Pytanie:** Domyślna macierz widoczności, słowniki i szablony flag nowej stajni; odbiorcy `health.due` i `payment.overdue`.
- **Kontekst:** słownik `notification_rules.event` nie ma `health_due` ani `payment_overdue`; dodanie zmienia krok 2 kreatora (PanelZalozPowiadomienia).
- **Opcje:**
  - A: macierz jak w Stajni Pod Lipami, pory 06:30/12:00/18:00, szablony flag z makiet; `health_due` (admin; obsługa tylko z funkcją `health`; wpis `owner_private` tylko admin) i `payment_overdue` (admin) w słowniku reguł.
  - B: inne.
- **Rekomendacja:** A.
- **Do czasu decyzji:** wartości domyślne w jednym module (`lib/rules`, BE-007) i w danych domyślnych `operations` (BE-028).
- **Blokuje:** brak
- **Zadania:** [BE-007](backend/BE-007-rules.md), [BE-011](backend/BE-011-seed.md), [BE-028](backend/BE-028-ops-defaults.md), [BE-029](backend/BE-029-stables-create.md), [BE-030](backend/BE-030-stables-settings.md), [WEB-009](web/WEB-009-web-create-stable.md), [BE-036](backend/BE-036-svc-notifications.md), [WEB-022](web/WEB-022-web-general-settings.md), [BE-049](backend/BE-049-cron-health-due.md), [BE-053](backend/BE-053-cron-billing.md)
- **Odwołania:** docs/mikroserwisy.md 10.2 pkt 15, 20; docs/development-szczegoly.md 5 pkt 27, 49.
- **Rozstrzygnięcie:** —

## DEC-21 · Wyłączony szablon przy trwającej fladze
- **Status:** otwarta
- **Pytanie:** Co z trwającymi flagami po wyłączeniu szablonu (np. Derka)?
- **Opcje:**
  - A: obowiązują i są widoczne do końca okna; znika tylko kafelek do ustawiania nowych.
  - B: ukryte razem z szablonem.
- **Rekomendacja:** A.
- **Do czasu decyzji:** BE-034 i WEB-014 według A.
- **Blokuje:** brak
- **Zadania:** [BE-028](backend/BE-028-ops-defaults.md), [WEB-014](web/WEB-014-web-stable-settings.md), [BE-034](backend/BE-034-ops-flags.md), [MOB-013](mobile/MOB-013-mob-quick-flag.md), [WEB-015](web/WEB-015-web-flags.md)
- **Odwołania:** docs/development-szczegoly.md 5 pkt 48.
- **Rozstrzygnięcie:** —

## DEC-22 · Identyfikatory aplikacji
- **Status:** otwarta
- **Pytanie:** Bundle ID, `applicationId`, scope pakietów i nazwy w sklepach (nieodwracalne po założeniu rekordów).
- **Opcje:**
  - A: `pl.equenor.app` i `pl.equenor.tablet`.
  - B: inne.
- **Rekomendacja:** A; do zatwierdzenia przed założeniem rekordów w sklepach i EAS.
- **Do czasu decyzji:** buildy deweloperskie z sufiksem `.dev` (`pl.equenor.app.dev`, `pl.equenor.tablet.dev`); żadnych rekordów w sklepach ani projektów EAS na docelowe identyfikatory.
- **Blokuje:** MOB-025
- **Zadania:** [TAB-001](tablet/TAB-001-tab-skeleton.md), [MOB-001](mobile/MOB-001-mob-skeleton.md), [MOB-025](mobile/MOB-025-mob-store.md)
- **Odwołania:** docs/development-szczegoly.md 5 pkt 29.
- **Rozstrzygnięcie:** —

## DEC-23 · Klient bez ważnego konia
- **Status:** otwarta
- **Pytanie:** Czy klient bez ważnego dostępu do konia traci stajnię w tokenie?
- **Opcje:**
  - A: traci (ekran BrakDostepu), jak docs/mikroserwisy.md 3.2.
  - B: członkostwo zostaje (ekran MainBezKonia).
- **Rekomendacja:** A (docs/mikroserwisy.md ma pierwszeństwo); MainBezKonia powstaje tylko przy B.
- **Do czasu decyzji:** BE-013 i apka według A.
- **Blokuje:** brak
- **Zadania:** [BE-013](backend/BE-013-auth-db-repos.md), [MOB-005](mobile/MOB-005-mob-start-nav.md), [BE-038](backend/BE-038-board-client.md), [MOB-023](mobile/MOB-023-mob-suspended.md)
- **Odwołania:** docs/mikroserwisy.md 3.2, 10.2 pkt 10; docs/makiety-plan.md dec. 24.
- **Rozstrzygnięcie:** —

## DEC-24 · Okresy retencji
- **Status:** otwarta
- **Pytanie:** Jak długo trzymamy audyt, `notifications`, pliki `deleted`, `payment_provider_events` i `platform_requests`?
- **Opcje:**
  - A: audyt 2 lata, `notifications` 180 dni, pliki `deleted` 30 dni, `payment_provider_events` 1 rok, `platform_requests` 1 rok.
  - B: inne.
- **Rekomendacja:** A, jako konfiguracja crona `retention-pruner` i `files-gc`.
- **Do czasu decyzji:** wartości A w konfiguracji cronów.
- **Blokuje:** brak
- **Zadania:** [BE-051](backend/BE-051-files-full.md), [BE-055](backend/BE-055-audit-retention.md), [WEB-027](web/WEB-027-web-history.md)
- **Odwołania:** docs/development-szczegoly.md 5 pkt 26.
- **Rozstrzygnięcie:** —

## DEC-25 · Diagnostyka tabletu
- **Status:** otwarta
- **Pytanie:** Jak diagnostyka tabletu i Raspberry Pi trafia do zespołu?
- **Opcje:**
  - A: SDK narzędzia błędów z buforem offline (narzędzie wybiera Dawid).
  - B: trasa w `platform` z tokenem tabletu.
- **Rekomendacja:** A; na PoC lokalny ekran TabletDiagnostyka i bufor logów.
- **Do czasu decyzji:** TAB-020 robi ekran i bufor lokalny za interfejsem wysyłki; sama wysyłka czeka na wybór narzędzia.
- **Blokuje:** brak
- **Zadania:** [TAB-020](tablet/TAB-020-tab-diagnostics.md)
- **Odwołania:** docs/mikroserwisy.md 10.2 pkt 16; docs/development-szczegoly.md 5 pkt 11.
- **Rozstrzygnięcie:** —

## DEC-26 · Autor akcji z tabletu w audycie
- **Status:** otwarta
- **Pytanie:** Co wpisujemy jako `actor_id` w `audit.audit_log` dla akcji z tabletu (`actor_type = tablet`)?
- **Kontekst:** akcje z tabletu nie mają autora (`source = tablet`, docs/erd.md), a docs/development-szczegoly.md 5 pkt 21 mówi „nie id konta tabletów”. Wcześniejszy szkic BE-005 wpisywał id konta technicznego. Trzeba jednej wersji we wszystkich serwisach.
- **Opcje:**
  - A: `actor_id = NULL`, boks tylko w zmianach wpisu.
  - B: `actor_id = box_id` z nagłówka `X-Box-Id` (przy `actor_type = tablet` jednoznaczne), `session_id` = `sid` tokenu tabletu.
  - C: `actor_id` = id konta technicznego.
- **Rekomendacja:** B: wiadomo, z którego tabletu (boksu) przyszła akcja, a `sid` pozwala powiązać wpisy z jedną sesją przy podejrzeniu skopiowanego tokenu.
- **Do czasu decyzji:** `actorFromPrincipal` w BE-005 według B, w jednym miejscu, żeby zmiana na A była jedną linią.
- **Blokuje:** brak
- **Zadania:** [BE-005](backend/BE-005-uow-audit.md), [BE-034](backend/BE-034-ops-flags.md), [BE-044](backend/BE-044-ops-quick-actions.md)
- **Odwołania:** docs/development-szczegoly.md 5 pkt 21; docs/erd.md (`source`, audyt).
- **Rozstrzygnięcie:** —

## DEC-27 · Drobne wartości i zachowania z zadań (zbiorczo)
- **Status:** otwarta
- **Pytanie:** Czy właściciel potwierdza propozycje, które wykonawcy zadań przyjęli tam, gdzie docs milczą? Każdy punkt można zmienić osobno; do tego czasu obowiązuje propozycja.
- **Opcje:**
  - A: wszystkie propozycje jak niżej.
  - B: zmiany w wybranych punktach (wpisać w „Rozstrzygnięcie”).
- **Propozycje:**
  - a. Przypomnienia `health_due`: rodzaje „wizyta jutro” i „termin za 7 dni”, stała godzina lokalna stajni, w konfiguracji crona (BE-049).
  - b. Windykacja: `past_due` po 7 dniach od terminu faktury, `suspended` po 21 dniach (BE-053).
  - c. Eskalacja pomija flagi już zakończone (`valid_to` w przeszłości) (BE-035).
  - d. Wyświetlacz pokazuje przy zadaniu tylko pierwsze słowo imienia biorącego („bierze Piotr”) (BE-050, WEB-023).
  - e. `schedule` nie sprawdza członkostwa jeźdźca i instruktora w stajni (W2); na PoC instruktor wpisuje tylko siebie, admin wybiera z listy z `auth` (BE-048).
  - f. `POST /password/forgot` zwraca 202 bez kanału i maski kontaktu; ekrany resetu mają neutralny tekst zamiast „Kod wysłaliśmy na …” (BE-018, MOB-004, WEB-002, TAB-009).
  - g. Etykieta zalogowanej osoby w apce „Ola · Obsługa” zamiast „Zalogowana: Ola” (rodzaj gramatyczny nieznany) (MOB-005).
  - h. Apka odpytuje co 15 s ± 2 s i tylko na widocznym ekranie (MOB-007).
  - i. `timeQuality` w kolejce zapisów apki liczona z różnicy zegara telefonu wobec nagłówka `Date` serwera (MOB-008).
  - j. Stan „Pomiń” w „Pierwszych krokach” panelu trzymany w `localStorage` (WEB-010).
  - k. Podgląd SMS zaproszenia liczony w przeglądarce na kopii szablonu treści (WEB-006).
  - l. `Idempotency-Key` przy rejestracji firmy jest jednocześnie `businesses.id`; identyfikator nowej stajni nadaje klient (BE-021, BE-029).
  - m. Filtr „Odeszły” w PanelKonie poza PoC (brak trasy listy koni, które opuściły stajnię) (WEB-013).
- **Rekomendacja:** A.
- **Do czasu decyzji:** propozycje obowiązują; wartości liczbowe w konfiguracji, nie w kodzie.
- **Blokuje:** brak
- **Zadania:** [BE-018](backend/BE-018-auth-password-reset.md), [BE-021](backend/BE-021-auth-businesses.md), [MOB-004](mobile/MOB-004-mob-signup-reset.md), [MOB-005](mobile/MOB-005-mob-start-nav.md), [WEB-002](web/WEB-002-web-reset-password.md), [WEB-006](web/WEB-006-web-invite.md), [BE-029](backend/BE-029-stables-create.md), [MOB-007](mobile/MOB-007-mob-features-polling.md), [MOB-008](mobile/MOB-008-mob-write-queue.md), [WEB-010](web/WEB-010-web-pulpit-start.md), [WEB-013](web/WEB-013-web-horses.md), [BE-035](backend/BE-035-cron-escalation.md), [TAB-009](tablet/TAB-009-tab-session.md), [BE-048](backend/BE-048-schedule-rides.md), [BE-049](backend/BE-049-cron-health-due.md), [BE-050](backend/BE-050-ops-tasks.md), [WEB-023](web/WEB-023-web-tasks.md), [BE-053](backend/BE-053-cron-billing.md)
- **Odwołania:** uwagi w plikach zadań wymienionych przy punktach.
- **Rozstrzygnięcie:** —
