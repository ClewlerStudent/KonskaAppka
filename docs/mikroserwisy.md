# EQUENOR: rozpiska mikroserwisów

> Wersja robocza · 2026-10-13, po recenzji (bezpieczeństwo, pokrycie wymagań, czytelność). Uwzględnia dwa wymagania twarde z 13.10:
> - **W1:** admin globalny (zespół EQUENOR) ma wjazd wszędzie: do każdej firmy, stajni i serwisu;
> - **W2:** tylko jeden serwis jest autoryzacyjny. On decyduje o tożsamości i uprawnieniach i podpisuje tokeny. Reszta tylko weryfikuje podpis i czyta claimy.
>
> Model danych: [erd.md](erd.md). Development i testy: [development.md](development.md), [development-szczegoly.md](development-szczegoly.md). Gdy tamte dokumenty mówią inaczej o tożsamości, uprawnieniach albo podziale serwisów, obowiązuje ten dokument. Poprawki w tamtych plikach wprowadzono 13.10 (sekcja 11).

**Oznaczenia:**
- Całość od sekcji 1 to **propozycja architekta** do zatwierdzenia przez właściciela produktu. Wymagania użytkownika oznaczam **W1** i **W2**, a wcześniejsze decyzje z erd.md i arkusza decyzji: **(bez zmian)**.
- **[Ś]**: fakt o średniej pewności, do sprawdzenia w spike'u (11.4).
- `…` w ścieżce to zawsze `/stables/{stableId}`. Identyfikatory w przykładach są skrócone (`u-ola`, `st-podlipami`); w systemie to UUIDv7.
- **Aplikacja** to klient OAuth (`client_id`): `mobile`, `web`, `tablet`, `ops`, `opctl`, `svc`. Słowo „klient” oznacza w tym dokumencie wyłącznie rolę Klient.
- **admin** w tabelach endpointów: admin konta firmy, do której należy stajnia, albo admin globalny (`plt = admin`). Wsparcie IT (`plt = support`) wpisuję osobno tam, gdzie ma dostęp.
- `[PANEL]`, `[API]`: adresy panelu i API (domena nieustalona). `[OPS]`: osobny host panelu zespołu EQUENOR, np. `ops.<domena>`.

## W skrócie

Wymagania W1 i W2 są twarde. Sposób ich spełnienia (wszystko niżej) to propozycja.

1. **Jeden serwis autoryzacyjny: `auth` (W2).** Zastępuje `identity` i `access` i przejmuje ze `stable` konto firmy, adminów konta i macierz widoczności. Tylko `auth` wie, kto jest kim i co może, i tylko on podpisuje tokeny: jeden klucz, jeden JWKS. Cognito tylko uwierzytelnia (kod, passkey, hasło z TOTP).
2. **Admin globalny (W1):** rola platformowa `plt = admin` dla zespołu EQUENOR (w danych demo Kuba). Wchodzi do każdej firmy, stajni i serwisu z prawami admina konta i ma trasy `/platform/*`. Loguje się osobno: pula zespołu z MFA, osobny host `[OPS]`, powód wejścia; każdy zapis trafia do audytu, a każdy odczyt do logu odczytów.
3. **Reszta tylko czyta podpis (W2).** Pozostałe 12 serwisów weryfikuje token lokalnie (klucz publiczny z JWKS w cache). Decydują na podstawie claimów i danych zasobu, np. do której firmy należy stajnia. Nie wołają `auth` przy żądaniu i nie mają w bazie dostępu do tabel uprawnień.
4. **13 serwisów:** `auth` (nowy), `stable`, `board`, `flags`, `care`, `health`, `rides`, `tasks`, `billing`, `files`, `releases`, `notifications`, `audit`. 9 cronów bez zmian. Reszta zasad bez zmian (1.2–1.5).
5. **Token EQUENOR:** JWT ES256 podpisany kluczem w AWS KMS, ważny 5–15 min. Niesie firmy admina (`biz`), członkostwa w stajniach z rolą, widocznymi funkcjami i końmi klienta (`m`), rolę platformową (`plt`) i wersję uprawnień konta (`av`).
6. **Odebranie dostępu działa do 15 s** dzięki liście unieważnień, którą serwisy pobierają z `auth` co 10 s (3.8). Bez listy górną granicą jest czas życia tokenu.
7. **Crony i `/internal`** używają krótkich tokenów serwisowych od `auth`, bez sekretów statycznych.
8. **Makiety z drobnymi zmianami (11.4).** Dochodzi plansza PanelOps (admin globalny). Poprawki w makietach ustawień, zaproszeń i ZaproszeniePrzyjmij czekają w mockups/STAN.md.
9. **Do decyzji przed implementacją:** 10.2 pkt 1–10, zwłaszcza lista unieważnień (pkt 1), macierz w tokenie (2), `businesses` w `auth` (3) i KMS (6).

## Diagram

![Mikroserwisy EQUENOR: auth jako jedyny serwis autoryzacyjny](mikroserwisy/uslugi.png)

Wersja do powiększania: [mikroserwisy/uslugi.svg](mikroserwisy/uslugi.svg). Źródło: [mikroserwisy/uslugi.mmd](mikroserwisy/uslugi.mmd).

Jak czytać:
1. Aplikacja loguje użytkownika w Cognito (pula klientów albo pula zespołu).
2. Aplikacja wymienia ID token z Cognito w `auth` na token EQUENOR. Tak samo odświeża token. `auth` pobiera z Cognito tylko klucze publiczne i woła jego Admin API (wylogowanie, usuwanie kont).
3. Z tokenem EQUENOR aplikacja woła serwisy. Serwisy pobierają z `auth` w tle tylko JWKS, listę unieważnień i własne tokeny serwisowe; `notifications` pobiera też adresy odbiorców (`/internal/recipients`).
4. Crony biorą od `auth` token serwisowy, czytają bazę (tylko odczyt) i zlecają zmiany właścicielom przez `/internal`.

## 1. Zasady

### 1.1 Autoryzacja (W2)

- **Decyduje tylko `auth`.** Jest właścicielem wszystkich tabel tożsamości i uprawnień (5.2), wylicza z nich claimy i podpisuje token.
- **Każdy inny serwis przy każdym żądaniu:**
  1. weryfikuje podpis kluczem z JWKS oraz `alg = ES256`, `typ = at+jwt`, `iss` środowiska, `aud`, `exp`, `iat` (nie z przyszłości) i maksymalny czas życia dla aplikacji (3.5);
  2. sprawdza listę unieważnień w pamięci (3.8);
  3. wylicza dostęp do stajni z claimów i danych zasobu (`resolveStable`, 3.6);
  4. stosuje politykę trasy z deskryptora w `packages/contracts`.
- **Dane zasobu to nie autoryzacja.** Serwis może sprawdzić u siebie albo w czytanych tabelach, do której firmy należy stajnia (`stables.business_id`), do której stajni i hali należy boks (`boxes`), w którym boksie stoi koń i czy koń nie wyjechał (`horses.box_id`, `horses.status`) oraz co jest włączone w stajni (`stable_settings`, `flag_templates.active`). Kim jest użytkownik i jaką ma rolę, wie tylko z tokenu.
- **Zakazane:** wołanie `auth` przy żądaniu użytkownika (introspekcja) i czytanie tabel uprawnień (`business_admins`, `stable_members`, `horse_access`, `invitations`, `stable_role_features`, `platform_roles`, `platform_requests`). Pilnują tego granty bazy i meta-test w CI (1.2).
- **Sam `auth` sprawdza też bazę.** Zmiany uprawnień (Ludzie, zaproszenia, dostęp do koni, macierz, blokada, role platformowe) `auth` sprawdza w tej samej transakcji we własnych tabelach, a nie tylko w tokenie. Admin odebrany przed chwilą nic już nie zmieni, nawet jeśli jego token jeszcze żyje.
- **Obiekt bez dostępu daje 404**, także obiekt innej firmy (bez zmian). Admin globalny ma dostęp wszędzie (W1).

### 1.2 Dane

- Do tabeli pisze tylko serwis-właściciel (bez zmian, erd pkt 5).
- **Odczyt (zmiana erd pkt 5):**
  - tabele domenowe czytają wszyscy;
  - tabele prywatne `auth` (5.2) czyta tylko `auth`;
  - z `users` inni widzą tylko `id`, `display_name`, `locale`, `identity_pool` i `deleted_at` (grant kolumnowy); telefon i e-mail zna tylko `auth`. `identity_pool = team` pozwala pokazać autora jako „Zespół EQUENOR” (4.4);
  - `businesses` czytają `stable` (nazwa firmy) i `billing` (NIP, adres, e-mail do faktur).
- `packages/db/owners.ts` dostaje dla każdej tabeli pole `visibility: shared | private | columns([...])`. Z niego powstają granty i reguła lintu.
- Klucze obce do `users` z tabel innych serwisów zostają; baza sprawdza je bez grantu `SELECT`.
- **Meta-test w CI:** żadna rola poza `auth` nie ma `SELECT` na tabelach prywatnych `auth` ani na `users.phone_e164` i `users.email`.
- **Niezmienne dane zasobu:** `stables.business_id` i `boxes.stable_id`. Żadna trasa ich nie zmienia, a lint odrzuca `UPDATE` tych kolumn (triggera nie dodajemy, bo erd zakazuje triggerów). Przeniesienie stajni do innej firmy to nowa stajnia.
- **Stan w pamięci (wyjątek od szcz. 4.1, „Repliki”: żaden serwis nie trzyma stanu w pamięci):** wolno trzymać cache JWKS, cache listy unieważnień i niezmienne dane zasobu z punktu wyżej. Wszystkie trzy da się odtworzyć ze źródła.

### 1.3 Trasy

| Rodzaj | Ścieżka | Token | Dodatkowo |
|---|---|---|---|
| Publiczne | `/<serwis>/v1/{ścieżka}` | token EQUENOR, `aud = equenor-api` | role, funkcja i dozwolone aplikacje z deskryptora trasy |
| Platformowe | `/<serwis>/v1/platform/{ścieżka}` | token EQUENOR z `plt` | zapytania przekrojowe (`crossTenant()`), log odczytów (4.4) |
| Wewnętrzne | `/<serwis>/v1/internal/{ścieżka}` | token serwisowy, `aud = equenor-internal`, wymagany `scope` | tylko w klastrze: NetworkPolicy i TLS z CA klastra |
| Wymiana tokenu konta serwisowego | `/auth/v1/internal/token` | token konta serwisowego Kubernetes | jedyna trasa `/internal` bez tokenu serwisowego (7.1) |
| Webhook płatności | `/billing/v1/webhooks/{provider}` | bez tokenu | podpis dostawcy |
| Stan poda | `/livez`, `/readyz` | bez tokenu | `/readyz` czeka na JWKS i listę unieważnień |

- Token użytkownika na `/internal` daje 401. Token serwisowy na trasie publicznej też daje 401.
- Każdy serwis ma `POST /internal/prune` (bez zmian). Serwisy z danymi konia (`auth`, `flags`, `care`, `rides`, `tasks`) mają `POST /internal/horses/{id}/left`.
- **W1 w każdym serwisie:** meta-test sprawdza, że każdy serwis ma co najmniej jedną trasę dostępną dla `plt = admin`. Wyjątków nie ma: `files` i `notifications` mają trasy `/platform` (5.11).

### 1.4 Zdarzenia

- SNS + SQS, publikacja po COMMIT, bez outboxu i WebSocketów (bez zmian).
- Publikować na temat może tylko rola IAM serwisu-właściciela (IRSA albo EKS Pod Identity).
- Koperta zdarzenia niesie aktora do audytu, ale konsument niczego na jej podstawie nie autoryzuje.
- Unieważnień nie wysyłamy zdarzeniem: wiadomość z kolejki SQS odbiera jeden pod, a nie każdy (3.8).

### 1.5 Crony

- Każdy cron to osobny mikroserwis (CronJob), bez własnych tabel (bez zmian).
- Rola bazy tylko do odczytu, bez tabel prywatnych `auth`.
- Zmiany zleca właścicielom przez ich `/internal`, tokenem serwisowym ze `scope`. W audycie `actor_type = system`.

## 2. Role

| Rola | Poziom | Kto nadaje | Gdzie zapisana | Zakres |
|---|---|---|---|---|
| **Admin globalny** (`plt = admin`) | platforma | dwóch adminów globalnych: wniosek i zatwierdzenie w `opctl` (4.5) | `platform_roles` | każda firma, stajnia i serwis z prawami admina konta; trasy `/platform/*` (4.2) |
| Wsparcie IT (`plt = support`; na PoC nikt) | platforma | jw. | `platform_roles` | patrz 4.6 |
| **Admin konta** | konto firmy | pierwszy powstaje przy rejestracji firmy; kolejnych dodaje admin globalny we dwie osoby, z powiadomieniem adminów firmy (4.3) | `business_admins` | wszystkie stajnie firmy, także nowe; pełny dostęp, bez macierzy widoczności (bez zmian) |
| Obsługa (`staff`) | stajnia | admin: zaproszenie albo przypisanie osoby z firmy | `stable_members` | wszystkie konie stajni; funkcje według macierzy |
| Instruktor (`instructor`) | stajnia | admin | `stable_members` | jazdy, flagi do odczytu; funkcje według macierzy |
| Klient (`client`) | stajnia i koń | admin: zaproszenie z koniem | `stable_members`, `horse_access` | tylko swoje konie (w oknie `valid_from`–`valid_to`) i boks, w którym stoją |
| Wyświetlacz (`display`) | stajnia, konto techniczne | admin | `stable_members` | odczyt tablic stajni; każdy zapis 403 |
| Tablet (`tablet`) | stajnia, konto techniczne | admin | `stable_members` | tablica boksu, potwierdzenie flagi, akcje boksu i jego hali (`X-Box-Id`) |
| Serwis, cron | system | manifest w repo | — | tylko trasy `/internal` ze swoim `scope` |

- Osoba może być w kilku stajniach, w każdej z jedną rolą (bez zmian).
- **Konto techniczne** (`users.account_kind = technical`): rola `tablet` albo `display` w dokładnie jednej stajni; bez `biz` i `plt`. Nie zakłada firmy (`POST /businesses` daje 403), nie dostaje drugiej stajni, roli osoby ani admina konta (409). Rodzaj konta ustala pierwsze dopasowanie zaproszenia i potem się nie zmienia.
- **Zaproszenie konta technicznego** dopasowuje tylko świeże konto. Gdy telefon albo e-mail należy już do istniejącego konta, `auth` odrzuca zaproszenie przy tworzeniu (`409 target_in_use`), więc tablet nie dostanie konta Damiana.
- Konto z puli klientów nigdy nie dostanie `plt`. Konto z puli zespołu nie jest członkiem stajni ani adminem konta: `auth` odrzuca zaproszenie, którego cel to telefon albo e-mail konta z puli zespołu (`409 target_in_use`).
- Wsparcie IT nie jest rolą stajni: stajnia go nie zaprasza i nie konfiguruje (bez zmian).

**Dane demo:**

| Kto | Rola | Stajnie |
|---|---|---|
| Damian | admin konta Stajnie Lipowe sp. z o.o. | Pod Lipami, Brzozowa i każda kolejna stajnia firmy |
| Ola | obsługa | Pod Lipami, Brzozowa |
| Piotr | obsługa | Pod Lipami |
| Paweł | obsługa | Brzozowa |
| Marta | instruktor | Pod Lipami, Brzozowa |
| Anna | klientka: Kasztan i Bella (Pod Lipami), Kometa (Brzozowa) | Pod Lipami, Brzozowa |
| Marek Nowak | klient: Luna, bez boksu (zaproszenie czeka, makieta MainLuna) | Pod Lipami |
| Telewizor korytarz | wyświetlacz (konto techniczne) | Pod Lipami |
| Tablety Pod Lipami, Tablety Brzozowa | tablet (konta techniczne) | każde konto w swojej stajni |
| Kuba | admin globalny, zespół EQUENOR | wszystkie firmy i stajnie |

## 3. Token

### 3.1 Skąd się bierze

1. Aplikacja loguje użytkownika w Cognito. Pula klientów: kod SMS albo e-mail. Pula zespołu: passkey albo hasło z TOTP. Ekrany logowania bez zmian.
2. Aplikacja od razu wymienia ID token Cognito w `auth`: `POST /auth/v1/token` (RFC 8693, `grant_type=urn:ietf:params:oauth:grant-type:token-exchange`, `client_id = mobile | web | tablet`). Panel zespołu robi to na własnym hoście: `POST [OPS]/auth/v1/ops/token` (`client_id = ops`, wymagany `reason`); CLI: `client_id = opctl` (4.1).
3. `auth` sprawdza ID token: podpis puli, `token_use = id`, pula pasuje do aplikacji, `auth_time` nie starszy niż 5 min, `jti` jednorazowy.
4. W jednej transakcji `auth`:
   - zapisuje albo aktualizuje `users` z kopią telefonu i e-maila i blokuje ten wiersz do końca transakcji (3.8);
   - dopasowuje zaproszenia po zweryfikowanym telefonie albo e-mailu i zapisuje członkostwo (klientowi też `horse_access`); zaproszenie konta technicznego oznacza świeże konto jako `technical` (sekcja 2);
   - sprawdza zgodność konta z aplikacją;
   - wylicza claimy, zakłada sesję w `auth_sessions` i podpisuje token.
5. Odpowiedź: access token EQUENOR (5–15 min) i refresh token. Tokeny Cognito aplikacja wyrzuca.

Wymieniamy ID token, bo tylko on niesie zweryfikowany telefon i e-mail. Po nich `auth` dopasowuje zaproszenia.

**Zgodność konta z aplikacją** (inaczej `403 wrong_client`, ekran TabletBrakUprawnien albo BrakDostepu):
- konto techniczne `tablet` loguje się tylko aplikacją `tablet`, a osoba nigdy;
- konto techniczne `display` loguje się tylko aplikacją `web`;
- `ops` i `opctl` wymagają puli zespołu i aktywnej roli w `platform_roles`;
- konto z puli zespołu nie loguje się aplikacjami `mobile`, `web` ani `tablet`.

### 3.2 Claimy

Nagłówek: `{"alg":"ES256","typ":"at+jwt","kid":"<odcisk klucza publicznego, RFC 7638>"}`.

| Claim | Znaczenie | Kto ma |
|---|---|---|
| `iss` | `https://[API]/auth/v1`, inny host w każdym środowisku | wszyscy |
| `aud` | `equenor-api` (osoby, konta techniczne, admin globalny) albo `equenor-internal` (serwisy) | wszyscy |
| `sub` | `users.id` albo `svc:<nazwa>` | wszyscy |
| `sid` | `auth_sessions.id`; klucz unieważnienia sesji i pole audytu | osoby, konta techniczne, admin globalny |
| `client_id` | `mobile`, `web`, `tablet`, `ops`, `opctl`, `svc` | wszyscy |
| `iat`, `exp`, `jti` | wydanie, wygaśnięcie, identyfikator | wszyscy |
| `ver` | wersja schematu claimów (1) | wszyscy |
| `av` | wersja uprawnień konta (`users.authz_version`, 3.8) | osoby, konta techniczne, admin globalny |
| `biz` | firmy, w których osoba jest adminem konta | admini konta |
| `m` | członkostwa: `s` stajnia, `r` rola, `f` widoczne funkcje, `h` konie klienta | członkowie stajni |
| `plt` | `admin` albo `support` | admin globalny, Wsparcie IT |
| `amr`, `auth_time` | `["mfa"]` i czas logowania w Cognito (step-up, 4.1) | admin globalny, Wsparcie IT |
| `scope` | zakresy tras `/internal` | serwisy |

**Reguły wyliczania:**
- `m` pomija nieaktywne członkostwa i stajnie firm z `biz`, bo admin konta i tak ma tam pełny dostęp.
- `h` zawiera tylko dostępy ważne teraz: `valid_from ≤ teraz < valid_to` (albo `valid_to` puste), puste `revoked_at` i koń bez `status = left`.
- Klient bez żadnego ważnego konia w stajni nie ma tej stajni w `m` (dec. 24, 10.2 pkt 12). Bez żadnej stajni widzi BrakDostepu.
- `exp` nie wychodzi poza najbliższą granicę okna dostępu klienta. Koniec dzierżawy działa więc dokładnie w swojej chwili, bez zdarzeń i bez dat w tokenie.
- `f` to funkcje z `stable_role_features` dla roli w stajni. Stajnia bez wierszy ma macierz domyślną z `packages/rules`, równą macierzy Pod Lipami (10.2 pkt 17). Tablet nigdy nie ma `tasks` ani `box_history`.
- Admin konta i `plt` nie mają `f`: widzą wszystko.
- Konto techniczne ma zawsze dokładnie jedno `m` (swoją stajnię) i nigdy `biz` ani `plt`, bez względu na inne wiersze w bazie. Pilnuje tego test claimów względem wzorca.
- Token nie ma danych osobowych, nazw stajni ani ustawień. Te dane daje `GET /auth/v1/me`. Aplikacje nie dekodują tokenu.
- **Budżet rozmiaru:** 4 KB (Damian ok. 0,6 KB, Ola ok. 0,9 KB, Anna ok. 1,0 KB). Test w CI liczy wszystkie osoby z danych demo, klienta z 60 końmi i konto zaproszone przez 50 firm naraz.
- **Twarde limity w `auth`** (zaproszenia dopasowują się same, bez zgody, więc obce firmy mogłyby „nadmuchać” komuś token): najwyżej 20 członkostw na konto, 100 koni w `h` na stajnię, 200 zaproszeń na firmę na dobę, a na liście unieważnień najwyżej jeden wpis na konto (najwyższe `min_av`). Zaproszenie ponad limit zostaje niedopasowane, a `auth` wysyła alert. Gdyby token i tak przekroczył budżet, `auth` wydaje token zawężony do stajni wybranej w aplikacji (`resource=<stableId>`, RFC 8707) zamiast odmawiać.

### 3.3 Przykłady dla danych demo

Wtorek 13.10.2026, 07:15 czasu polskiego (`iat` = 1791868500). Funkcje według seedu:
- Pod Lipami: klient `flags, feeding_plan, routine, box_history, health, rides`; obsługa wszystko; tablet `flags, feeding_plan, routine, health`; wyświetlacz `flags, feeding_plan, routine, tasks`; instruktor `flags, rides`.
- Brzozowa: klient `flags, routine, box_history, health`; obsługa `flags, feeding_plan, routine, box_history, health`; tablet `flags, feeding_plan, routine, health`; instruktor `flags, rides`.

**Damian, admin konta, panel (pełny token).** Nie ma `m`: Pod Lipami, Brzozowa i każda kolejna stajnia wynikają z `stables.business_id = biz-lipowe`.
```json
{"iss":"https://[API]/auth/v1","aud":"equenor-api","sub":"u-damian","sid":"ses-d1","client_id":"web",
 "iat":1791868500,"exp":1791869100,"jti":"j-01","ver":1,"av":3,
 "biz":["biz-lipowe"]}
```

Pozostali mają te same `iss`, `iat`, `jti` i `ver`; różnią się tym:

| Kto | `client_id`, ważność | Pozostałe claimy |
|---|---|---|
| Ola | `mobile`, 10 min | `m`: `st-podlipami` `staff` (wszystkie funkcje); `st-brzozowa` `staff` (`flags, feeding_plan, routine, box_history, health`) |
| Piotr | `mobile`, 10 min | `m`: `st-podlipami` `staff` (wszystkie funkcje) |
| Paweł | `mobile`, 10 min | `m`: `st-brzozowa` `staff` (`flags, feeding_plan, routine, box_history, health`) |
| Marta | `mobile`, 10 min | `m`: `st-podlipami` i `st-brzozowa`, `instructor` (`flags, rides`) |
| Anna | `mobile`, 10 min | `m` niżej |
| Tablety Pod Lipami | `tablet`, 15 min | `m`: `st-podlipami` `tablet` (`flags, feeding_plan, routine, health`) |
| Tablety Brzozowa | `tablet`, 15 min | `m`: `st-brzozowa` `tablet` (`flags, feeding_plan, routine, health`) |
| Telewizor korytarz | `web`, 15 min | `m`: `st-podlipami` `display` (`flags, feeding_plan, routine, tasks`) |
| Kuba | `ops`, 5 min | `plt: "admin"`, `amr: ["mfa"]`, `auth_time`; bez `biz` i `m`. Powód wejścia leży w `auth_sessions.reason`; audyt wiąże go przez `sid` |
| cron `escalation-scheduler` | `svc`, 5 min | `aud: "equenor-internal"`, `sub: "svc:escalation-scheduler"`, `scope: "flags:escalations.write notifications:send"`; bez `sid` i `av` |

Członkostwa Anny:
```json
"m":[{"s":"st-podlipami","r":"client","f":["flags","feeding_plan","routine","box_history","health","rides"],
      "h":["h-kasztan","h-bella"]},
     {"s":"st-brzozowa","r":"client","f":["flags","routine","box_history","health"],"h":["h-kometa"]}]
```
Gdyby Bella miała dzierżawę do 31.12.2026 23:59:59, token wydany 31.12 o 23:55 miałby `exp` 1798757999 zamiast `iat + 600`.

Tablety: boksu nie ma w tokenie, bo wszystkie tablety stajni logują się tym samym kontem. Boks przychodzi w `X-Box-Id`. Każdy tablet ma własną sesję (`sid`).

### 3.4 Czas życia

Czas sesji zależy od aplikacji i od roli, a rolę zna `auth`. Telewizor w aplikacji `web` ma długą sesję, a admin w tym samym panelu krótką.

| Konto i aplikacja | Access token | Bezczynność sesji | Maksimum sesji |
|---|---|---|---|
| Osoba w apce (`mobile`) | 10 min | 30 dni | 180 dni |
| Osoba w panelu (`web`) | 10 min | 7 dni | 30 dni |
| Tablet (`tablet`) | 15 min | 30 dni | bez limitu (do blokady albo odłączenia) |
| Wyświetlacz (`web`, rola `display`) | 15 min | 30 dni | 365 dni |
| Admin globalny, Wsparcie IT (`ops`) | 5 min | 30 min | 10 h, bez „zapamiętaj mnie” |
| Admin globalny w CLI (`opctl`) | 5 min | 30 min | 1 h |
| Serwis, cron (`svc`) | 5 min | bez refresh tokenu | — |

Tokeny Cognito: ID i access 5 min, refresh 60 min. Aplikacja używa ID tokenu tylko raz, do wymiany.

### 3.5 Klucze i JWKS

- **Podpis:** ES256 kluczem AWS KMS `ECC_NIST_P256`. Klucz prywatny nie opuszcza KMS. `kms:Sign` ma tylko rola IAM `auth`.
- **`kid`:** odcisk klucza publicznego (RFC 7638), więc rotacja awaryjna i planowa w tym samym miesiącu nie dadzą duplikatu. Tabela `signing_keys` (klucz główny `kid`) wiąże `kid` z kluczem KMS i statusem `next`, `active`, `retiring` albo `retired`.
- **JWKS:** `GET /auth/v1/.well-known/jwks.json`, tylko w klastrze, z kluczami `next`, `active` i `retiring`, cache 10 min. JWKS i trasy `/internal` serwisy pobierają przez TLS z certyfikatem z CA klastra (cert-manager) i sprawdzeniem nazwy hosta, więc przejęty pod nie podsunie własnego JWKS ani pustej listy unieważnień.
- **Cache w serwisach:** `jose.createRemoteJWKSet`, 10 min, ponowne pobranie nie częściej niż co 30 s. Nieznany `kid` wymusza ponowne pobranie; nowy wpis `kid:<kid>` albo `all` na liście unieważnień też (3.8).
- **Twarde granice weryfikacji** (`packages/auth`): odrzuca `iat` późniejszy niż teraz + 60 s i `exp − iat` dłuższe niż maksimum dla aplikacji (15 min; `ops`, `opctl` i `svc`: 5 min).
- **Rotacja planowa co 90 dni** (`opctl keys rotate`; KMS nie rotuje sam kluczy asymetrycznych): nowy klucz trafia do JWKS jako `next` co najmniej 24 h przed użyciem; potem przełączenie (nowy `active`, stary `retiring`); po dobie stary jest `retired`.
- **Rotacja awaryjna przy wycieku:** nowy klucz od razu `active`, stary znika z JWKS, a na liście unieważnień pojawia się wpis `kid:<stary>`. W ciągu 15 s każdy serwis odrzuca wszystkie tokeny z tym `kid`, niezależnie od `iat`, i przeładowuje JWKS. Sesje przetrwają, bo refresh tokeny nie zależą od klucza; aplikacje po cichu odświeżają token. Test: token podpisany wycofanym kluczem jest odrzucany w ≤ 15 s.
- **Koszt:** ok. 1,5–2 mln podpisów miesięcznie, ok. 20–40 USD z kluczami [Ś]. Limit KMS: 1000 podpisów/s. Opóźnienie podpisu (dziesiątki do 300 ms) dotyczy tylko wydania tokenu, nie weryfikacji.

### 3.6 Jak serwis sprawdza dostęp do stajni

```ts
async function resolveStable(p: Principal, stableId: string, tx: Tx): Promise<StableAccess> {
  const st = await stables.meta(tx, stableId);  // business_id z cache (niezmienne), status z bazy
  if (!st) return { as: 'none' };                                                               // 404
  if (p.kind === 'operator') return p.plt === 'admin' ? { as: 'platform' } : { as: 'none' };    // support: 404
  if (p.kind !== 'account') return { as: 'none' };
  if (p.biz.has(st.businessId)) return { as: 'admin' };
  const m = p.members.get(stableId);
  return m ? { as: 'member', ...m } : { as: 'none' };                                           // none: 404
}
```

- **`platform` przechodzi wszędzie tam, gdzie `admin`, także sprawdzenie aplikacji:** trasa dostępna dla admina przyjmuje `client_id = ops`, nawet gdy deskryptor ogranicza ją do `mobile` (np. potwierdzenie flagi). Wyjątek to trasy wyłącznie tabletowe (`GET /releases/v1/tablet/latest`). Meta-test generowany z kontraktów: każda trasa, odczytu i zapisu, z `admin` na liście ról przechodzi dla Kuby z aplikacją `ops`.
- Deskryptor trasy w `packages/contracts`: `audience`, `clients` (np. tylko `tablet`), `stable: { roles, feature, write }`, `platform` (np. `['admin','support']`), `stepUp`, a dla `/internal` także `scope` i `callers`.
- Tablet z `X-Box-Id`: stajnia ze ścieżki musi być stajnią z tokenu, boks musi należeć do tej stajni (inaczej 404, bez zapisu), akcja hali musi dotyczyć hali tego boksu (inaczej `403 other_building`).
- Klient: koń spoza `h` daje 404. Koń z `horses.status = left` (dane zasobu) też daje 404 od razu, bez czekania na nowy token.
- Pakiety: `packages/auth` (weryfikacja, schemat claimów w zod, `RevocationCache`), `packages/tenancy` (`resolveStable`, `TenantScope`), `packages/authz` (polityki jako czyste funkcje), `packages/rules` (`stableFeatures` i macierz domyślna). Żaden nie czyta tabel uprawnień.

### 3.7 Odświeżanie i wylogowanie

- **Gdzie leży refresh token:**
  - apka w `expo-secure-store`, tablet w Android Keystore;
  - panel i TV: ciasteczko `__Secure-eq_rt` (`HttpOnly; Secure; SameSite=Strict; Path=/auth/v1/token`, bez `Domain`, czyli tylko host API); access token tylko w pamięci strony. Warunek: panel i API w jednej domenie (zamyka szcz. 5 pkt 15 bez BFF);
  - panel zespołu: osobny host `[OPS]` już na PoC (najlepiej inna domena), z własną trasą `POST [OPS]/auth/v1/ops/token` i ciasteczkiem `__Secure-eq_rt_ops` (`Path=/auth/v1/ops/token`, tylko ten host). XSS w panelu klientów nie dosięga sesji admina globalnego. Prefiksu `__Host-` nie używamy, bo wymaga `Path=/`.
- **Ochrona panelu i `[OPS]`:** ścisłe CSP z nonce, Trusted Types, bez skryptów inline. Każdy `POST /token` z ciasteczkiem wymaga nagłówka `Origin` z listy dozwolonych (dla `/ops/token` tylko `[OPS]`) i nagłówka `X-Equenor-Client`, który wymusza preflight CORS. To zamyka logowanie cudzym kontem z obcej strony (login CSRF).
- **Refresh token** to 256 losowych bitów; w bazie leży tylko hash. Rotacja przy każdym użyciu.
- **Przy odświeżeniu `auth` liczy claimy od nowa z bazy** (z blokadą wiersza `users`, 3.8), więc tu działają wszystkie zmiany uprawnień.
- **Zgubiona odpowiedź i kradzież:**
  - ponowne użycie poprzedniego refresh tokenu do 60 s od rotacji jest idempotentne: `auth` zwraca tego samego następcę (w `auth_sessions` hash następcy i jego kopia zaszyfrowana kluczem z KMS, kasowana po oknie), a nie zakłada nowej gałęzi;
  - każde inne użycie poprzedniego albo starszego tokenu unieważnia całą sesję (`reuse_detected`) i wysyła alert;
  - tablet i TV: refresh token powiązany z kluczem urządzenia, którego nie da się wyeksportować (DPoP, RFC 9449: Android Keystore, WebCrypto z `extractable: false`) [Ś]. Sam skopiowany token nic wtedy nie daje, więc dla takich sesji okno zgubionej odpowiedzi może trwać do 24 h, dopóki następca nie był użyty. Bez DPoP tablet, który po zerwanym Wi-Fi wróci po więcej niż 60 s, musi zalogować się ponownie (spike 11.4, 10.2 pkt 10).
- **Wylogowanie:** `POST /auth/v1/logout` unieważnia sesję i czyści ciasteczko.

| Odpowiedź | Co robi aplikacja |
|---|---|
| `401 token_stale` albo `401 token_expired` | jedno ciche odświeżenie, powtórzenie żądania, `GET /me` |
| `401 step_up_required` (panel `[OPS]`) | ponowne logowanie passkeyem, nowa wymiana, powtórzenie zapisu |
| `401 session_revoked` przy odświeżeniu | ekran logowania; tablet zachowuje boks i język |
| `403 access_revoked` (`blocked`) przy odświeżeniu | ekran blokady bez starych danych; ponawia co 5 min; po odblokowaniu dostaje `session_revoked`, czyli logowanie |
| nagłówek `Equenor-Token-Refresh: required` | natychmiastowe odświeżenie (np. po rejestracji firmy) |
| powrót apki na pierwszy plan | odświeżenie i `GET /me` |

Aplikacje odświeżają z losowym opóźnieniem 0–30 s, żeby wpis `all` nie wywołał fali podpisów naraz.

### 3.8 Odebranie dostępu

**Skutek: do 15 s** (pobieranie listy co 10 s plus odświeżenie tokenu). Limit w testach akceptacyjnych: 30 s. Bez listy: do końca ważności tokenu (3.4). Ten czas obowiązuje w całym dokumencie; wyjątki są w tabeli niżej.

Trzy warstwy, bez zapytań przy każdym żądaniu:
1. **Krótki TTL** (3.4) to górna granica.
2. **Lista unieważnień:**
   - `auth` dopisuje wpis do `auth_revocations` w tej samej transakcji co zmianę: `user:<sub>` z `min_av`, `session:<sid>`, `kid:<kid>` albo `all` z `not_before`;
   - każdy pod każdego serwisu pobiera `GET /auth/v1/internal/revocations?after=<kursor>` co 10 s (zwykle 304) i ładuje pełną listę przed `/readyz`;
   - serwis odrzuca token (`401 token_stale`), gdy: `av` jest mniejsze niż `min_av` wpisu `user`; `sid` ma wpis `session`; `kid` ma wpis `kid`; `iat ≤ not_before` wpisu `all`;
   - przy awarii pobierania serwis zostaje przy ostatniej liście, a po 60 s jest alert. Szkodę ogranicza TTL (10.2 pkt 1).
3. **Odświeżenie tokenu:** `auth` liczy claimy od nowa. Unieważniona sesja daje `401 session_revoked`, zablokowane konto techniczne `403 access_revoked`, a w pozostałych przypadkach aplikacja dostaje nowy token z aktualnymi claimami.

**Bez wyścigu między zmianą a odświeżeniem.** Samo porównanie czasów (`iat` z `not_before`) przepuściłoby token podpisany ze starego odczytu w trakcie zmiany. Dlatego:
- każda zmiana uprawnień podbija `users.authz_version` każdego dotkniętego konta w tej samej transakcji (zmiana macierzy: wszystkim członkom stajni z tą rolą), a wpis `user:<sub>` niesie nową wartość jako `min_av`;
- wymiana i odświeżenie czytają claimy i `authz_version` w jednej transakcji z `SELECT … FOR SHARE` na wierszu `users`, więc zmiana i wydanie tokenu się serializują: token ma albo stare `av` (i odpada na liście), albo nowe claimy;
- wpis `all`: `not_before = clock_timestamp()` po zmianie plus 2 s zapasu, a `iat` takiego porównania nadaje `auth` z zegara bazy;
- test współbieżny: odświeżenie równoległe z „Usuń ze stajni” nigdy nie daje tokenu z Brzozową, który przejdzie listę.

| Zdarzenie | Mechanizm (`auth`, jedna transakcja z audytem) | Co widzi użytkownik |
|---|---|---|
| Damian odbiera Oli Brzozową („Usuń ze stajni”) | usuwa członkostwo, `authz_version` Oli + 1, wpis `user:u-ola`, zdarzenie `member.removed` | nowy token ma tylko Pod Lipami; Brzozowa znika z przełącznika i daje 404 |
| Anna traci Kometę (`revoked_at`) | aktualizuje `horse_access`, wersja + 1, wpis `user:u-anna` | Kometa znika; Brzozowa znika z tokenu, bo Anna nie ma tam konia |
| Koniec dzierżawy (`valid_to`) | nic | `exp` tokenu wypada w chwili granicy (±30 s); po odświeżeniu konia nie ma w `h` |
| Koń wyjeżdża | `stable` po COMMIT woła synchronicznie `auth /internal/horses/{id}/left`, potem `horse.left`; `auth` zamyka `horse_access`, wpisy `user` klientów konia | **od razu:** serwisy widzą `horses.status = left` (3.6); token odświeża się w tle |
| Zmiana macierzy widoczności | zapis `stable_role_features`, wersja + 1 członkom stajni z tą rolą, wpisy `user` | członkowie, tablety i TV odświeżają token; sekcje znikają albo się pojawiają |
| Przypisanie Oli do Brzozowej, zaproszenie istniejącego konta | zapis członkostwa, wersja + 1, wpis `user:u-ola` | nowa stajnia w przełączniku bez ponownego logowania |
| Zmiana roli (`staff` na `instructor`) | aktualizacja roli, wersja + 1, wpis `user` | nowy widok startowy |
| Odłączenie jednego tabletu | sesja unieważniona, wpis `session:<sid>` | ten tablet pokazuje logowanie; pozostałe działają |
| Zablokowanie konta technicznego | `active = false`, wszystkie sesje konta unieważnione, wpis `user` | ekran blokady bez flag; tablica i zapisy przestają działać |
| „Wyloguj ze wszystkich urządzeń” | sesje osoby unieważnione, wpis `user` | inne urządzenia osoby pokazują logowanie; tablety i TV bez zmian |
| Usunięcie konta | jw. plus pseudonimizacja, usunięcie w Cognito, `user.deleted` | — |
| Odebranie roli admina globalnego | `platform_roles.revoked_at`, sesje unieważnione, wpis `user` | Kuba traci dostęp; bez listy do 5 min |
| Wyciek klucza podpisu | rotacja awaryjna, wpis `kid:<stary>` (3.5) | wszyscy po cichu odświeżają token; podrobione tokeny odpadają niezależnie od `iat` |
| Nowa stajnia admina konta | nic | **od razu:** dostęp przez `biz` |
| Zawieszenie stajni (`billing`) | nic; to `stables.status`, dane zasobu | **od razu:** `board` pokazuje stan „zawieszona” |

## 4. Admin globalny (W1)

### 4.1 Kto i jak się loguje

- **Kto:** zespół EQUENOR, w danych demo Kuba. Nie ma członkostwa w żadnej stajni i nie występuje w Ludziach.
- **Konto:**
  - osobna pula Cognito „zespół”, bez samodzielnej rejestracji; konta zakłada `opctl operators create`;
  - wiersz `users` z `identity_pool = team`;
  - `auth` wydaje `plt` tylko przy puli zespołu, aplikacji `ops` albo `opctl` i aktywnym wierszu `platform_roles` (zatwierdzonym, nieodwołanym, z `expires_at` w przyszłości);
  - przejęcie numeru telefonu klienta (SIM swap) nie daje dostępu wszędzie, bo pula klientów nigdy nie dostaje `plt`.
- **Logowanie:**
  - panel zespołu na osobnym hoście `[OPS]` (3.7); allowlista IP albo VPN później (10.2 pkt 5);
  - passkey albo hasło z TOTP (MFA zawsze), potem wymiana tokenu z wymaganym powodem wejścia, np. numerem zgłoszenia;
  - CLI `opctl`: osobna aplikacja `client_id = opctl` (kod autoryzacji z PKCE i przekierowaniem na localhost, RFC 8252). Tylko ona przechodzi trasy ról platformowych i kluczy (`clients: ['opctl']`), więc XSS w panelu zespołu nie nada roli;
  - bez apki mobilnej i bez tabletu.
- **Dowód MFA:** ID token z puli Cognito nie niesie `amr` [Ś]. `amr: ["mfa"]` to więc twierdzenie `auth` wynikające z konfiguracji puli zespołu. `auth` sprawdza ją przy starcie i co godzinę (`GetUserPoolMfaConfig`, `DescribeUserPool`: MFA włączone, pierwszy czynnik tylko hasło albo passkey, wymagana weryfikacja użytkownika, zakładanie kont tylko przez admina). Przy rozjeździe odrzuca wymiany `ops` i `opctl` i wysyła alert. Do tego test polityki Terraform w CI.
- **Step-up:** nadanie, zatwierdzenie i odebranie roli, dodanie albo usunięcie admina konta i rotacja kluczy wymagają `auth_time` nie starszego niż 5 min. Inaczej `401 step_up_required` i ponowne logowanie passkeyem.
- **Ekran:** po zalogowaniu wybór firmy i stajni, potem zwykłe ekrany admina. Stały pasek „EQUENOR · pełny dostęp · Stajnie Lipowe › Stajnia Pod Lipami · powód: …”. Nowa plansza PanelOps do makiet P2.

### 4.2 Co może

- Wszystko na każdej trasie, na której przechodzi admin konta, w każdej firmie i stajni, z danymi koni, klientów i kontaktami (telefon jak u admina konta). Zapisy, które admin konta robi w apce (np. potwierdzenie flagi, „Boks gotowy”), robi z panelu `[OPS]` (3.6).
- Trasy `/platform/*`: firmy i stajnie z NIP-em i statusem; użytkownicy i ich wylogowanie; sesje kont technicznych; kolejny admin konta i przejęcie NIP-u (we dwie osoby); wydania APK; plany billingu; audyt; historia i ponowienie powiadomień; metadane plików; diagnostyka (P3).
- Pliki: treść przez trasy serwisów-właścicieli (`stable`, `health`, `billing`, `releases`), metadane przez `files /platform` (5.11).
- Ręczne przebiegi cronów: `opctl cron run <nazwa>`. To uprawnienie infrastruktury (Job z CronJoba), a nie token. `/internal` nie przyjmuje tokenów użytkowników, także Kuby.

### 4.3 Czego nie może

- Podszyć się pod innych. „Zobacz jako” to P3: token z claimem `act`, tylko odczyt.
- Logować się w apce mobilnej ani na tablecie.
- Omijać reguł biznesowych: `409 option_disabled`, `If-Match`, `422` obowiązują go tak samo.
- Nadawać ról platformowych z panelu `[OPS]` (tylko `opctl`, we dwie osoby, 4.5).
- **Założyć sobie trwałego dostępu poza `plt`.** Każde nadanie dostępu tokenem z `plt` (zaproszenie, członek, dostęp do konia, admin konta) ma `granted_via = platform` i `granted_session_id`. PanelLudzie pokazuje je jako „nadane przez zespół EQUENOR”, a raport kwartalny je wylicza. Cel z puli zespołu `auth` odrzuca (sekcja 2). Dodanie albo usunięcie admina konta wymaga zatwierdzenia drugiej osoby i powiadamia obecnych adminów firmy SMS-em albo e-mailem.

### 4.4 Audyt i log odczytów

- Każdy zapis ma `actor_type = operator`, `actor_id` Kuby, `client = ops` i `session_id = sid`. Sesja prowadzi do powodu wejścia.
- `audit_log.client` z aplikacji: `mobile` → `app`, `web` → `web`, `tablet` → `tablet`, `ops` → `ops`, `opctl` → `opctl`, `svc` → brak (`actor_type = system`).
- W tabelach domenowych: `horse_flags.author_role = operator`; `flag_acknowledgements.method`, `box_care_events.source` i `building_routines.source` mają wartości `tablet | app | web | ops`.
- Apki i panel pokazują autora z puli zespołu (`users.identity_pool = team`) jako „Zespół EQUENOR”, bez imienia (10.2 pkt 5).
- `service-kit` zapisuje każde żądanie z `plt` (serwis, trasa, stajnia, obiekt, `sid`) do osobnego strumienia logów z retencją jak audyt. Audyt w bazie zapisuje tylko zmiany.

### 4.5 Zabezpieczenia

- Czasy sesji: 3.4. MFA, jego dowód i step-up: 4.1.
- **Role we dwie osoby:** `opctl platform grant` składa wniosek, `opctl platform approve` zatwierdza inny admin globalny (`approved_by ≠ requested_by`). Odebranie roli komuś innemu też we dwie osoby; własną rolę można oddać od razu. `auth` odmawia, gdy zostałoby mniej niż 2 aktywnych adminów globalnych.
- **Wygasanie:** rola wygasa po 90 dniach; wniosek o odnowienie powstaje sam 14 dni przed `expires_at`; przegląd co kwartał.
- **Pierwsi admini:** jednorazowy `opctl bootstrap` (Job Kubernetes) zakłada od razu dwóch imiennych adminów; każdy musi zalogować się z MFA w ciągu 24 h, inaczej jego rola wygasa. Bootstrap działa tylko wtedy, gdy nie ma żadnej aktywnej roli admina (np. wszystkie wygasły), i zawsze wysyła alert.
- **Konto awaryjne:** wiersz `platform_roles` z `kind = break_glass`, dane logowania w sejfie, alert przy każdym użyciu, rola wygasa sama 4 h po pierwszym użyciu.
- **Alerty** na kanał zespołu: każde logowanie z `plt`, każdy zapis w danych stajni, nietypowa liczba odczytów, każde nadanie dostępu z `granted_via = platform`.
- **Testy:** token z puli klientów nigdy nie ma `plt`; `ops` bez roli dostaje `403 wrong_client`; `plt` podpisany kluczem spoza JWKS jest odrzucany; trasy ról z aplikacji `ops` dają `403 client_not_allowed`; zapis wrażliwy z `auth_time` starszym niż 5 min daje `401 step_up_required`.

### 4.6 Wsparcie IT

- Rola `plt = support` w tym samym mechanizmie. Na PoC nikt jej nie dostaje (10.2 pkt 11).
- Trasy:
  - `GET /auth/v1/platform/businesses`: firmy i stajnie;
  - `GET /auth/v1/platform/stables/{s}/technical-accounts`: konta techniczne, ich status i sesje (założenie, ostatnie użycie, wersja aplikacji), bez kontaktów;
  - `GET /stable/v1/platform/stables/{s}/boxes`: numery boksów i hale, bez koni;
  - `GET /releases/v1/platform/releases`: wydania APK;
  - diagnostyka (P3).
- Na trasach danych stajni dostaje 404, więc nie widzi koni ani klientów.
- Ukryte ustawienia tabletu działają dalej bez logowania (przytrzymanie).

## 5. Serwisy

### 5.1 Tabela zbiorcza

| Serwis | Za co odpowiada | Tabele (pisze) | Publikuje | Konsumuje |
|---|---|---|---|---|
| **`auth`** (nowy) | tożsamość, tokeny, sesje, JWKS, konto firmy, ludzie, zaproszenia, dostęp do koni, macierz widoczności, role platformowe, unieważnienia | `users`, `businesses`, `business_admins`, `stable_members`, `horse_access`, `invitations`, `stable_role_features`, `platform_roles`, `platform_requests`, `auth_sessions`, `auth_revocations`, `signing_keys` | `invitation.created`, `invitation.accepted`, `invitation.expired`, `user.deleted`, `member.removed` | `horse.left` |
| `stable` | stajnie, ustawienia, reguły powiadomień, hale, boksy, konie | `stables`, `stable_settings`, `notification_rules`, `buildings`, `boxes`, `horses`, `horse_box_history` | `stable.created`, `horse.left` | `subscription.status_changed` |
| `board` | ekrany złożone: tablet, TV, lista dnia, widoki admina i klienta | brak | — | — |
| `flags` | flagi, szablony, potwierdzenia, eskalacje | 5 tabel (erd) | `flag.created` | `horse.left`, `stable.created` |
| `care` | pory posiłków, pasze, padoki, plany, rutyna hali, „Boks gotowy”, „Woda” | 10 tabel (erd) | — | `horse.left`, `stable.created` |
| `health` | wizyty i załączniki | `health_events`, `health_attachments` | — | — |
| `rides` | ujeżdżalnie i jazdy | `arenas`, `rides` | — | `horse.left` |
| `tasks` | zadania jednorazowe | `tasks` | — | `horse.left`, `member.removed` |
| `billing` | subskrypcje, zużycie, faktury, płatności | 9 tabel (erd) | `subscription.status_changed`, `invoice.issued`, `payment.failed` | `stable.created` |
| `files` | metadane plików, linki do S3 | `files` | — | — |
| `releases` | wydania APK tabletu | `app_releases`, `app_release_targets` | — | — |
| `notifications` | wysyłka SMS i e-maili, historia wysyłek | `notifications` | — | 7 zdarzeń (7.3) |
| `audit` | odczyt i retencja audytu | `audit_log`, `audit_log_changes` (schemat `audit`) | — | — |

Strona www (`apps/www`) jest statyczna, bez API.

### 5.2 `auth`

- **Tabele prywatne** (`SELECT` ma tylko rola `auth`): `business_admins`, `stable_members`, `horse_access`, `invitations`, `stable_role_features`, `platform_roles`, `platform_requests`, `auth_sessions`, `auth_revocations`, `signing_keys`. Do tego `users` (inni widzą 5 kolumn) i `businesses` (czytają `stable` i `billing`).
- **Dlaczego `businesses` w `auth`:** rejestracja firmy i pierwszy admin to jedna transakcja; claim `biz` powstaje z własnych tabel; odmowa usunięcia konta jedynemu adminowi i lista firm dla admina globalnego są lokalne. W `stable` potrzebne byłoby zdarzenie, a jego zgubienie (bez outboxu) zostawiłoby firmę bez admina (10.2 pkt 3).
- **Dlaczego `stable_role_features` w `auth`:** ukryta funkcja daje 403 na trasie, więc macierz decyduje o uprawnieniach. Gdyby czytały ją wszystkie serwisy, łamałoby to W2 (10.2 pkt 2).
- **Czyta jako dane zasobu:** `stables(id, name, business_id, status)`, `horses(id, stable_id, name, status)`.
- **AWS:** tylko rola IAM `auth` ma `kms:Sign` na kluczach podpisu, `cognito-idp:Admin*` na obu pulach oraz odczyt konfiguracji puli zespołu (4.1). Konfiguracja pul w Terraform w `services/auth/infra`.
- **Wdrożenie:** co najmniej 3 repliki w różnych strefach, PodDisruptionBudget, osobne SLO (99,95% dla `POST /token`), alerty.

| Obszar | Metoda i ścieżka (`/auth/v1`) | Kto | Uwagi |
|---|---|---|---|
| Tokeny | `POST /token` | bez Bearer | wymiana ID tokenu Cognito (`mobile`, `web`, `tablet`), `refresh_token`; token z issuerem klastra odrzuca; z ciasteczkiem wymaga `Origin` z listy i `X-Equenor-Client`; limit zapytań per IP i konto |
| | `POST /ops/token` | bez Bearer, tylko host `[OPS]` | to samo dla `ops`, z `reason`; `Origin` tylko `[OPS]` |
| | `POST /logout` | każde konto | unieważnia bieżącą sesję |
| | `GET /.well-known/jwks.json`, `GET /.well-known/oauth-authorization-server` | w klastrze, TLS | cache 10 min |
| Profil | `GET /me` | każde konto | profil, stajnie z nazwą, rolą, funkcjami i statusem, firmy admina, `plt`, widok startowy, świeżo dopasowane zaproszenia |
| | `PATCH /me` | osoby, admin globalny | imię, język |
| | `DELETE /me` | osoby | `409 sole_business_admin` dla jedynego admina firmy |
| | `POST /me/sign-out-everywhere` | osoby | wylogowanie ze wszystkich urządzeń |
| | `DELETE /me/memberships/{stableId}` | osoby | „Opuść stajnię”, np. po niechcianym zaproszeniu (bez makiety, 10.2 pkt 23) |
| Konto firmy | `GET /business-registry/{taxId}` | osoba | dane z rejestru po NIP-ie, adapter |
| | `POST /businesses` | osoba (konto techniczne: 403) | `409 tax_id_taken`; odpowiedź z `Equenor-Token-Refresh: required` |
| | `GET`, `PATCH /businesses/{b}` | admin | NIP-u nie da się zmienić |
| Ludzie | `GET …/members?role=&technical=` | admin | lista członków; nadane przez zespół EQUENOR oznaczone |
| | `POST …/members` | admin | przypisanie osoby z firmy bez zaproszenia; konto techniczne: 409 |
| | `PATCH …/members/{id}` | admin | rola w obrębie `staff`, `instructor`, `client`; `active` |
| | `POST …/members/{id}/block`, `POST …/members/{id}/unblock` | admin | konta techniczne |
| | `GET …/members/{id}/sessions`; `DELETE …/members/{id}/sessions/{sid}` | admin | sesje konta technicznego (każdy tablet i TV ma własną): założenie, ostatnie użycie, przybliżona sieć, wersja aplikacji; usunięcie dopisuje `session:<sid>`; alert, gdy sesja tabletu odświeża się z nowej sieci (ASN) |
| | `DELETE …/members/{id}` | admin | „Usuń ze stajni” |
| Dostęp do koni | `GET`, `POST …/horses/{horseId}/access`; `PATCH …/horse-access/{id}` | admin | `valid_to`, `revoked_at` |
| | `GET …/horse-clients` | admin, obsługa | imiona klientów przy koniach; telefon tylko dla admina |
| Zaproszenia | `GET`, `POST …/invitations`; `POST …/invitations/{id}/resend`, `POST …/invitations/{id}/revoke` | admin | „Wyślij ponownie” tworzy nowe zaproszenie; konto techniczne albo cel z puli zespołu na zajęty kontakt: `409 target_in_use`; limit na firmę (3.2) |
| Widoczność | `GET`, `PUT …/role-features` (z `If-Match`) | admin | macierz 5 ról × 7 funkcji; tablet bez `tasks` i `box_history` (taki wiersz: 422) |
| Platforma | `GET /platform/businesses` | `plt = admin`, `plt = support` | firmy i stajnie z NIP-em i statusem |
| | `GET /platform/stables/{s}/technical-accounts` | `plt = admin`, `plt = support` | konta techniczne, ich status i sesje, bez kontaktów |
| | `GET /platform/users?q=`, `POST /platform/users/{u}/sign-out` | `plt = admin` | |
| | `POST /platform/business-admin-requests` (dodanie albo usunięcie), `POST /platform/business-admin-requests/{id}/approve` | `plt = admin`, step-up | kolejny admin konta, przejęcie NIP-u; we dwie osoby; powiadomienie adminów firmy |
| | `POST /platform/role-requests` (nadanie albo odebranie), `POST /platform/role-requests/{id}/approve` | `plt = admin`, tylko `opctl`, step-up | role platformowe we dwie osoby (4.5) |
| | `POST /platform/team-accounts`, `POST /platform/keys/rotate` | `plt = admin`, tylko `opctl`, step-up | `opctl operators create`, `opctl keys rotate` |
| Wewnętrzne | `POST /internal/token` | token konta serwisowego Kubernetes | wymiana na token serwisowy (7.1) |
| | `GET /internal/revocations?after=` | `auth:revocations.read` | wszystkie serwisy |
| | `GET /internal/recipients?stableId=&roles=&channel=&horseId=` | `auth:recipients.read` | `notifications`: adresowanie, nie autoryzacja |
| | `POST /internal/invitations/expire` | `auth:invitations.expire` | cron |
| | `POST /internal/horses/{id}/left` | `auth:horse-left` | `stable` po wyjeździe, konsument `horse.left`, cron uzgadniający; zamyka dostęp tylko, gdy `horses.status = left` |
| | `POST /internal/prune` | `auth:prune` | sesje, wygasłe unieważnienia i wnioski |

### 5.3 `stable`

- **Czyta:** `businesses` (nazwa firmy), `flag_templates` (aktywne szablony do `features`).
- **W tokenie sprawdza:** dostęp do stajni (`biz` wobec `stables.business_id`, `m`) i rolę. Przy `POST /stables`: `businessId ∈ biz` albo `plt = admin`, inaczej 404.
- **Po COMMIT `POST /stables`** woła synchronicznie `flags` i `care` `/internal/stables/{id}/defaults` (`care` dostaje pory posiłków z kreatora; do 3 prób, idempotentnie), potem publikuje `stable.created` z porami posiłków.
- **Gdy wywołanie się nie uda,** odpowiedź ma `setupPending: ["care"]`, a PanelPulpitStart pokazuje pozycję „Dokończ zakładanie stajni”. `POST /stables/{id}/setup/retry` przyjmuje w body pory posiłków, bo panel trzyma jeszcze formularz kreatora. Bez formularza (np. zamknięta karta) panel ponawia bez pór: `care` zakłada pory domyślne z `packages/rules` (06:30, 12:00, 18:00), a pozycja w PanelPulpitStart prowadzi do `care PUT …/meal-slots`.
- **Po COMMIT wyjazdu konia** woła synchronicznie `auth /internal/horses/{id}/left` (do 3 prób), potem publikuje `horse.left`.

| Metoda i ścieżka (`/stable/v1`) | Kto | Uwagi |
|---|---|---|
| `GET /stables?businessId=` | admin | lista stajni firmy |
| `POST /stables` | admin | stajnia, strefa, hala, boksy z poidłem, reguły powiadomień, pory posiłków |
| `POST /stables/{id}/setup/retry` | admin | ponowienie domyślnych danych przy `setupPending`; pory posiłków w body opcjonalnie |
| `GET`, `PATCH /stables/{id}` | admin | nazwa, strefa |
| `GET`, `PATCH …/settings` (`If-Match`) | admin | przełączniki opcji stajni |
| `GET …/features` | każda rola w stajni | `rules.stableFeatures(settings, activeTemplates, f, rola)` |
| `GET`, `PUT …/notification-rules` | admin | reguły powiadomień |
| `POST …/buildings`; `PATCH`, `DELETE …/buildings/{id}` | admin | „Dodaj halę” z boksami; usunąć można tylko pustą (409) |
| `POST …/buildings/{id}/boxes`, `PATCH …/boxes/{id}` | admin | numer, poidło, hala w obrębie stajni |
| `POST …/horses`, `PATCH …/horses/{id}`, `POST …/horses/{id}/photo` | admin | koń, zdjęcie przez `files` |
| `POST …/horses/{id}/box`, `POST …/horses/swap`, `POST …/horses/{id}/leave` | admin | przypisz albo przenieś, zamień, wyjazd |
| `GET /platform/stables/{s}/boxes` | `plt = admin`, `plt = support` | numery boksów i hale, bez koni |

### 5.4 `board`

- **Bez tabel.** Składa ekrany z danych zasobu i konfiguracji: `stables`, `buildings`, `boxes`, `horses`, `horse_box_history`, `horse_flags`, `flag_templates`, plany i rutyny z `care`, `health_events` (dla tabletu i wyświetlacza tylko typ i termin), `rides`, `tasks`, `stable_settings`, `users.display_name` i `users.identity_pool`.
- **W tokenie sprawdza:** dostęp do stajni, rolę, `m[].f` (ukryta sekcja znika z odpowiedzi), u klienta konie z `m[].h`.
- **Plan dnia na wyświetlaczu** („Dziś w stajni” w WyswietlaczCentralny: posiłki, padoki oraz terminy wizyt i jazd z godziną, typem, koniem i miejscem, bez opisów) należy do funkcji `routine`. Dlatego TV z danych demo (bez `health` i `rides`) pokazuje wet, kowala i jazdę jak na makiecie. `health` i `rides` u wyświetlacza dotyczą szczegółów, których tablica i tak nie pokazuje (10.2 pkt 9).
- Wszystkie ścieżki mają prefiks stajni. Język to parametr zapytania. ETag to hash treści, odpowiedź może być 304.
- Dane o ludziach (imiona klientów przy koniach, zaproszenia, liczba osób) aplikacja dociąga równolegle z `auth`, a kafel subskrypcji z `billing`. `board` nie woła `auth`.

| Metoda i ścieżka (`/board/v1`) | Kto | Ekran |
|---|---|---|
| `GET …/boxes/{b}` | tablet, klient (boks swojego konia), obsługa, admin | TabletBoks, MojBoks |
| `GET …/boxes` | tablet, obsługa, admin | „Zmień boks”, TabletPierwszyBoks |
| `GET …/display?buildingId=` | wyświetlacz, admin | WyswietlaczCentralny, WyswietlaczHala |
| `GET …/day` | obsługa, admin | ListaDnia |
| `GET …/admin-today` | admin | AdminDzis, część PanelPulpit |
| `GET …/setup-checklist` | admin | PanelPulpitStart, „Pierwsze kroki 3 z 8” (stan „Pomiń”: 10.2 pkt 24) |
| `GET …/client-home` | klient | Main, MainLuna |
| `GET …/boxes-overview` | admin | BoksyAdmin, PanelBoksy, liczniki |
| `GET …/horses-overview` | obsługa, admin | StajennyKonie |
| `GET …/horses/{h}/card` | klient (swój koń), obsługa, admin | KartaKonia |
| `GET …/boxes/{b}/details` | obsługa, admin | BoksSzczegoly |
| `GET …/boxes/{b}/history` | klient (od dnia przypisania konia), obsługa, admin | historia boksu |

### 5.5 `flags`

- **Czyta:** `stable_settings`, `meal_slots` i plany padoku (`care`), `horses`, `boxes`.
- **W tokenie sprawdza:** rolę, funkcję `flags`, u klienta konia w `m[].h`. `author_role` bierze z tokenu (`client`, `staff`, `admin`, nowa wartość `operator` dla admina globalnego), `method` z aplikacji (4.4).

| Metoda i ścieżka (`/flags/v1`) | Kto | Uwagi |
|---|---|---|
| `GET …/flag-templates` | role z funkcją `flags` | kafelki |
| `PATCH …/flag-templates/{id}` | admin | włączenie, wyłączenie szablonu |
| `POST …/flag-preview` | klient, obsługa, admin | podpowiedź okna i skutków |
| `POST …/horses/{h}/flags` | klient (swój koń), obsługa i admin (każdy koń, także `on_behalf_*`) | nowa flaga, `flag.created` |
| `POST …/flags/{id}/replace`, `POST …/flags/{id}/cancel` | jw. | zmiana, odwołanie |
| `POST …/flags/{id}/acks` | tablet z `X-Box-Id` (koń flagi stoi w tym boksie), obsługa (apka), admin (apka, panel, `[OPS]`) | potwierdzenie |
| `GET …/flags?date=`, `GET …/flags/{id}` | role z funkcją `flags` | lista, status flagi z eskalacjami |
| `POST /internal/flags/{id}/escalations` | `escalation-scheduler` (`flags:escalations.write`) | |
| `POST /internal/stables/{id}/defaults` | `stable` (`flags:defaults.write`) | domyślne szablony |
| `POST /internal/horses/{id}/left`, `POST /internal/prune` | konsument `horse.left`, crony | |

### 5.6 `care`

- **Czyta:** `stable_settings`, `horse_flags` (pominięte konie), `boxes`, `buildings`, `horses`.
- **W tokenie sprawdza:** rolę, funkcje `feeding_plan` i `routine`, u klienta konia w `m[].h`; u tabletu dodatkowo `X-Box-Id`. `source` zapisu z aplikacji (4.4).

| Metoda i ścieżka (`/care/v1`) | Kto | Uwagi |
|---|---|---|
| `GET`, `PUT …/meal-slots` | odczyt: każda rola w stajni; zapis: admin | pory posiłków |
| `GET`, `PUT …/feeds`, `…/paddocks` | odczyt: role z `feeding_plan` albo `routine`; zapis: obsługa, admin | słowniki |
| `GET`, `PUT …/horses/{h}/feeding-plan` | odczyt: role z `feeding_plan` (klient: swój koń); zapis: obsługa, admin, klient (swój koń) tylko przy `owner_edits_feeding` | plan karmienia |
| `GET`, `PUT …/horses/{h}/paddock-plan` | odczyt: role z `routine` (klient: swój koń); zapis: obsługa, admin | plan padoku |
| `POST …/box-care-events` (`tidy` albo `water`, `boxIds[]`) | tablet (tylko boks z `X-Box-Id`), obsługa, admin | „Boks gotowy”, „Woda” |
| `POST …/building-routines` (`meal_served` albo `paddock_out`) | tablet (tylko hala swojego boksu), obsługa, admin | akcja dla całej hali |
| `POST …/box-care-events/{id}/undo`, `POST …/building-routines/{id}/undo` | jw. | „Cofnij” do godziny |
| `POST /internal/stables/{id}/defaults` | `stable` (`care:defaults.write`) | pory z kreatora albo domyślne, słowniki |
| `POST /internal/horses/{id}/left`, `POST /internal/prune` | konsument `horse.left`, crony | |

### 5.7 `health`

- **W tokenie sprawdza:** funkcję `health` w `f` (admin i `plt` mają wszystko), u klienta konia w `m[].h`. Wpis `owner_private` widzi tylko klient z koniem, admin i `plt`.
- Link do pliku zleca `files` tokenem serwisowym.

| Metoda i ścieżka (`/health/v1`) | Kto |
|---|---|
| `GET …/horses/{h}/health-events` | klient (swój koń), obsługa, admin |
| `POST …/horses/{h}/health-events` | obsługa, admin |
| `GET …/health-events?date=` | obsługa, admin, wyświetlacz z funkcją `health` (plan dnia na TV idzie przez `board`, 5.4) |
| `POST …/health-events/{id}/attachments` | obsługa, admin |
| `POST …/health-attachments/{id}/download-url` | jak odczyt wpisu |
| `POST /internal/prune` | `retention-pruner` |

### 5.8 `rides`

- Kolumny `rider_user_id` i `instructor_user_id` zastępują `*_member_id`, bo inne serwisy nie czytają `stable_members`.
- **W tokenie sprawdza:** rolę, funkcję `rides`; „moje jazdy” instruktora to `instructor_user_id = sub`.

| Metoda i ścieżka (`/rides/v1`) | Kto |
|---|---|
| `GET …/arenas`; `POST …/arenas` | odczyt: role z `rides`; zapis: admin |
| `GET …/rides?date=&mine=` | instruktor, admin, obsługa i wyświetlacz z funkcją `rides`, klient (swój koń) |
| `POST`, `PATCH …/rides` | admin, instruktor |
| `POST /internal/horses/{id}/left` (`rides:horse-left`), `POST /internal/prune` | konsument `horse.left`, `horse-left-reconciler`, `retention-pruner` |

### 5.9 `tasks`

- **W tokenie sprawdza:** rolę, funkcję `tasks`. Klient i tablet dostają 403.
- Konsumuje `member.removed`: zwalnia „Biorę” osoby usuniętej ze stajni.

| Metoda i ścieżka (`/tasks/v1`) | Kto |
|---|---|
| `GET …/tasks` | obsługa, admin, wyświetlacz (funkcja `tasks`) |
| `POST …/tasks`, `POST …/tasks/{id}/cancel` | admin |
| `POST …/tasks/{id}/take` | obsługa |
| `POST …/tasks/{id}/done` | ten, kto wziął (`taken_by = sub`), albo admin |
| `POST /internal/horses/{id}/left` (`tasks:horse-left`), `POST /internal/prune` | konsument `horse.left`, `horse-left-reconciler`, `retention-pruner` |

### 5.10 `billing`

- **Czyta:** `businesses`, `horses`, `stables`.
- **W tokenie sprawdza:** admin.
- **Surowe body webhooka** zapisuje przez `files /internal` (`files:write`), bo S3 obsługuje tylko `files`; `payment_provider_events` wskazuje plik (`payload_file_id`).

| Metoda i ścieżka (`/billing/v1`) | Kto | Uwagi |
|---|---|---|
| `GET …/subscription`, `PUT …/subscription/plan`, `GET …/usage` | admin | |
| `GET`, `PATCH …/account` | admin | NIP i nazwa idą z `businesses`, bez edycji |
| `GET …/invoices`, `POST …/invoices/{id}/pdf-url`, `POST …/payment-method-session` | admin | PDF przez `files` |
| `POST /webhooks/{provider}` | dostawca płatności | podpis dostawcy |
| `GET`, `PUT /platform/plans` | `plt = admin` | plany i ceny |
| `POST /internal/usage-snapshots`, `POST /internal/invoices/issue`, `POST /internal/dunning/run`, `POST /internal/prune` | crony | |

### 5.11 `files`, `releases`, `notifications`, `audit`

- **`files`:**
  - `/internal`: `create` (presigned upload), `attach`, `download-url`, `delete`, `gc`. Uprawnienia użytkownika sprawdza wcześniej serwis-właściciel. `files` sprawdza tylko, czy `sub` tokenu serwisowego (`svc:<nazwa>`) to `files.owner_service`, więc `health` nie wyciągnie PDF-u faktury z `billing`;
  - `GET /files/v1/platform/files?stableId=&ownerService=`: `plt = admin`, tylko metadane, z logiem odczytów.
- **`releases`:**
  - `GET /releases/v1/tablet/latest?versionCode=&installId=`: tylko aplikacja `tablet`. Stajnię bierze z tokenu (parametr `stableId` znika), okno instalacji ze `stable_settings`;
  - `GET`, `POST /releases/v1/platform/releases`; `POST /releases/v1/platform/releases/{id}/rollout` (oraz `/complete`, `/halt`): `plt = admin`; odczyt także `plt = support`.
- **`notifications`:**
  - `POST /notifications/v1/internal/notifications` od serwisów i cronów (`notifications:send`);
  - odbiorców i adresy bierze z `auth GET /internal/recipients` dla każdego powiadomienia, nie dla żądania użytkownika (to adresowanie, nie autoryzacja);
  - czyta `notification_rules` i `horse_flags` (anulowanie wysyłki o fladze już potwierdzonej);
  - `GET /notifications/v1/…/deliveries?flagId=&invitationId=`: admin; stan wysyłek eskalacji i zaproszeń w swojej stajni (baner „wysłano Ci SMS i e-mail” w PanelPulpit, zaproszenia w PanelZaprosOsobe);
  - `GET /notifications/v1/platform/notifications?stableId=&userId=&status=`, `POST /notifications/v1/platform/notifications/{id}/retry`: `plt = admin`, np. przy zgłoszeniu „nie dostałem kodu zaproszenia”.
- **`audit`:**
  - każdy serwis ma w schemacie `audit` tylko `INSERT`;
  - `GET /audit/v1/…/entities/{type}/{id}/history`: admin (zamyka szcz. 5 pkt 21);
  - `GET /audit/v1/platform/entries`: `plt = admin`.

## 6. Crony

Każdy cron ma własne konto serwisowe Kubernetes, rolę bazy tylko do odczytu (bez tabel prywatnych `auth`) i token serwisowy (7.1). Nowych cronów nie ma.

| Cron | Kiedy | Co robi | Woła (scope) |
|---|---|---|---|
| `escalation-scheduler` | co minutę | flagi z `requires_ack` po `warn_at` albo `notify_at`, bez potwierdzenia | `flags /internal/flags/{id}/escalations` (`flags:escalations.write`), `notifications` (`notifications:send`) |
| `invitation-expiry-notifier` | co godzinę | zleca wygaszenie zaproszeń; nie czyta `invitations` | `auth /internal/invitations/expire` (`auth:invitations.expire`); `auth` publikuje `invitation.expired` |
| `health-due-reminders` | co godzinę | przypomnienia o wizytach; odbiorców wyznacza `notifications` przez `auth` (luka w słowniku zdarzeń: 10.2 pkt 22) | `notifications` (`notifications:send`) |
| `files-gc` | co godzinę | pliki `pending` starsze niż 24 h i `deleted` po retencji | `files /internal/gc` (`files:gc`) |
| `billing-usage-snapshot` | koniec okresu | zużycie: boksy z koniem | `billing /internal/usage-snapshots` (`billing:usage`) |
| `billing-invoicing` | 1. dnia miesiąca | faktury, PDF | `billing /internal/invoices/issue` (`billing:invoice`), `files` (`files:write`) |
| `billing-dunning` | codziennie | zaległości, `past_due`, `suspended` | `billing /internal/dunning/run` (`billing:dunning`), `notifications` (`notifications:send`) |
| `horse-left-reconciler` | co godzinę | konie `left` z ostatnich 30 dni; czyta tylko `horses` | `/internal/horses/{id}/left` w `auth`, `flags`, `care`, `tasks`, `rides` (`<serwis>:horse-left`), idempotentnie |
| `retention-pruner` | co noc | sam niczego nie usuwa | `POST /internal/prune` każdego serwisu (`<serwis>:prune`); w `auth` sprząta też sesje, unieważnienia i wnioski |

## 7. Komunikacja

### 7.1 Tokeny serwisowe

1. Każdy Deployment i CronJob ma własne konto serwisowe Kubernetes. Domyślne konto ma `automountServiceAccountToken: false`, a `auth` odrzuca konto o nazwie `default`.
2. Pod dostaje token konta serwisowego, który Kubernetes montuje w podzie (`audience: equenor-auth`, ważny 10 min).
3. Wymienia go w `POST /auth/v1/internal/token` (tylko w klastrze). Publiczny `POST /auth/v1/token` odrzuca tokeny z issuerem klastra, więc token konta serwisowego wyniesiony z logu nie zadziała z internetu.
4. `auth` weryfikuje go przez OIDC klastra EKS i sprawdza przestrzeń nazw i nazwę konta serwisowego.
5. `auth` wydaje token `sub = svc:<nazwa>`, `aud = equenor-internal`, ważny 5 min, ze `scope` z manifestu.
6. Manifest (kto woła którą trasę `/internal`) generuje się z deskryptorów w `packages/contracts`. Z niego powstaje też NetworkPolicy.
7. `service-kit` trzyma token w pamięci do 60 s przed `exp`.
8. Wywołanie w imieniu użytkownika (np. `health` prosi `files` o link): serwis-właściciel najpierw sprawdza uprawnienia użytkownika, potem woła tokenem serwisowym.
9. Dostęp do AWS (SNS, SQS, S3, KMS) bez zmian: IRSA albo EKS Pod Identity. Sekretów statycznych nie ma.

### 7.2 Wywołania synchroniczne `/internal`

| Wywołujący | Cel | Scope |
|---|---|---|
| każdy serwis z ruchem użytkowników | `auth /internal/revocations` (co 10 s, w tle) | `auth:revocations.read` |
| `notifications` | `auth /internal/recipients` | `auth:recipients.read` |
| `stable` | `flags` i `care /internal/stables/{id}/defaults` | `flags:defaults.write`, `care:defaults.write` |
| `stable` | `auth /internal/horses/{id}/left` | `auth:horse-left` |
| `stable`, `health`, `billing`, `releases` | `files /internal/*` (tylko własne pliki; `billing` także surowe body webhooków) | `files:write`, `files:read` |
| `billing` | `notifications` | `notifications:send` |
| crony | według sekcji 6 | według sekcji 6 |

JWKS (co 10 min) serwisy pobierają bez tokenu, tylko w klastrze i przez TLS (3.5).

### 7.3 Zdarzenia SNS + SQS

| Zdarzenie | Publikuje | Konsumuje | Uwagi |
|---|---|---|---|
| `invitation.created` | auth | notifications | ładunek z kanałem, adresem, imieniem i językiem |
| `invitation.accepted` | auth | notifications | reguła `invitation_accepted` |
| `invitation.expired` | auth, na zlecenie crona | notifications | deduplikacja po `invitation_expired:{id}` |
| `user.deleted` | auth | notifications | anuluje oczekujące wysyłki |
| `member.removed` | auth | tasks | zwalnia „Biorę” w tej stajni |
| `stable.created` | stable | flags, care (zapas, gdy wywołanie synchroniczne się nie uda), billing (konto rozliczeniowe i subskrypcja) | ładunek z porami posiłków |
| `horse.left` | stable | auth, flags, care, tasks, rides | po synchronicznym wywołaniu `auth`; konsumenci domykają idempotentnie |
| `subscription.status_changed` | billing | stable | `stables.status` |
| `flag.created` | flags | notifications | reguła `flag_created_by_client` |
| `invoice.issued`, `payment.failed` | billing | notifications | |

## 8. Macierz uprawnień

**Oznaczenia:** W = zapis; R = odczyt; R* = odczyt według macierzy widoczności stajni (`f`); — = brak (403; obiekt innej stajni 404). Admin globalny ma wszystko, co admin konta, w każdej firmie (W1); Wsparcie IT na danych stajni dostaje 404. Opcja wyłączona w stajni daje 409 każdemu, także adminowi globalnemu.

| Operacja | Admin globalny | Wsparcie IT | Admin konta | Obsługa | Instruktor | Klient | Tablet | Wyświetlacz |
|---|---|---|---|---|---|---|---|---|
| **Konto i stajnie** | | | | | | | | |
| Rejestracja nowej firmy (osoba zostaje jej adminem) | — | — | W | W | W | W | — | — |
| Kolejny admin konta, przejęcie NIP-u | W (`/platform`, we dwie osoby) | — | — | — | — | — | — | — |
| Załóż stajnię | W | — | W | — | — | — | — | — |
| Ustawienia, macierz widoczności, reguły powiadomień | W | — | W | — | — | — | — | — |
| Hale, boksy, poidło, konie (dodaj, przenieś, wyjazd) | W | R (numery boksów i hale) | W | R (poidło 403) | — | R (boks swojego konia) | R (lista boksów) | R |
| **Ludzie** | | | | | | | | |
| Zaproszenia, członkowie, blokada kont technicznych, dostęp do koni | W | — | W | — | — | — | — | — |
| Konta techniczne: status i sesje, odłączenie urządzenia | W | R | W | — | — | — | — | — |
| Imiona klientów przy koniach | R (z telefonem) | — | R (z telefonem) | R | — | — | — | — |
| Role platformowe | W (`opctl`, we dwie osoby) | — | — | — | — | — | — | — |
| **Flagi** | | | | | | | | |
| Ustaw, zmień, odwołaj | W | — | W | W (każdy koń, w imieniu klienta) | R* | W (swoje konie) | R* | R* |
| Potwierdź flagę | W (panel `[OPS]`) | — | W (apka, panel) | W (apka) | — | — | W (boks z `X-Box-Id`) | — |
| Szablony flag | W | — | W | — | — | — | — | — |
| **Opieka** | | | | | | | | |
| „Boks gotowy”, „Woda” | W (panel `[OPS]`) | — | W | W | — | R* (stan) | W (swój boks) | R* |
| Posiłek, padok dla hali; „Cofnij” | W (panel `[OPS]`) | — | W | W | — | R* (stan) | W (hala swojego boksu) | R* |
| Plan karmienia i padoku | W | — | W | W | — | R*; W przy `owner_edits_feeding` | R* | R* |
| **Zadania** | | | | | | | | |
| Lista | R | — | R | R* | — | — | — | R* |
| Dodaj, odwołaj | W | — | W | — | — | — | — | — |
| „Biorę” | — | — | — | W | — | — | — | — |
| „Zrobione” | W | — | W | W (swoje) | — | — | — | — |
| **Zdrowie i jazdy** | | | | | | | | |
| Wizyty i wpisy zdrowia | W | — | W | W; R* bez `owner_private` | — | R* (swój koń) | R* (typ i termin) | R* (terminy w planie dnia, 5.4) |
| Jazdy | W | — | W | R* | W; R swoje | R* (swój koń) | — | R* (terminy w planie dnia, 5.4) |
| **Tablice i widoki** | | | | | | | | |
| Tablica boksu | R | — | R | R | — | R (boks swojego konia) | R | — |
| Tablica hal (TV) | R | — | R | — | — | — | — | R |
| Lista dnia | R | — | R | R | — | — | — | — |
| „Dziś” admina, pulpit, pierwsze kroki | R | — | R | — | — | — | — | — |
| **Płatności, audyt, platforma** | | | | | | | | |
| Subskrypcja, faktury, dane do faktury | W | — | W | — | — | — | — | — |
| Historia obiektu (audyt) | R | — | R | — | — | — | — | — |
| Wysyłki powiadomień | R, ponowienie W (wszystkie) | — | R (eskalacje i zaproszenia stajni) | — | — | — | — | — |
| Firmy i stajnie | R | R | — | — | — | — | — | — |
| Użytkownicy, plany, audyt platformy, metadane plików | W | — | — | — | — | — | — | — |
| Wydania APK | W | R | — | — | — | — | — | — |
| Sprawdzenie aktualizacji APK (`GET /tablet/latest`) | — | — | — | — | — | — | R | — |

**Kody odmowy:**

| Sytuacja | Kod | Skąd serwis to wie |
|---|---|---|
| Brak tokenu; zły podpis, `iss`, `aud`, `typ` albo `alg`; `iat` z przyszłości; za długi czas życia | 401 `invalid_token` | weryfikacja |
| Token wygasł | 401 `token_expired` | `exp` |
| Token sprzed zmiany uprawnień, blokady, wylogowania, odłączenia urządzenia albo podpisany wycofanym kluczem | 401 `token_stale` | lista unieważnień |
| Zapis wrażliwy admina globalnego bez świeżego logowania | 401 `step_up_required` | `auth_time` |
| Stajni nie ma w `m`, jej firmy nie ma w `biz`, brak `plt = admin`; stajnia innej firmy | 404 | token i `stables.business_id` |
| Obiekt z innej stajni niż ta w ścieżce | 404 | zapytanie z `stable_id` |
| Klient: koń spoza `h` albo po wyjeździe, boks bez jego konia | 404 | token, `horses.status`, `horses.box_id` |
| Tablet: `X-Box-Id` boksu innej stajni | 404, bez zapisu | `boxes.stable_id` |
| `plt = support` na danych stajni | 404 | `plt` |
| Rola bez prawa (też każdy zapis wyświetlacza) | 403 `forbidden_role` | `m[].r` |
| Funkcja ukryta w macierzy | 403 `feature_hidden`; w odpowiedziach złożonych brak sekcji | `m[].f` |
| Trasa niedozwolona dla aplikacji (np. tablet i zadania, trasy ról z `ops`) | 403 `client_not_allowed` | `client_id` |
| Tablet: akcja dla innej hali | 403 `other_building` | `boxes.building_id` |
| `plt = support` na trasie tylko dla admina | 403 `forbidden_platform` | `plt` |
| Token serwisowy bez scope | 403 `insufficient_scope` | `scope` |
| Konto na złej aplikacji (tablet, wyświetlacz, osoba na tablecie, pula zespołu w apce) | 403 `wrong_client` przy wymianie | `auth` |
| Zaproszenie konta technicznego na zajęty kontakt albo na kontakt konta z puli zespołu | 409 `target_in_use` | `auth` |
| Opcja wyłączona w stajni | 409 `option_disabled` | `stable_settings` |

## 9. Przepływy krok po kroku

### 9.1 Logowanie osoby i przełączenie stajni (Ola)

1. Ola w apce (LogowanieNumer) podaje telefon. Cognito wysyła kod SMS, Ola go wpisuje.
2. Apka wymienia ID token: `POST /auth/v1/token`, `client_id = mobile`. `auth` aktualizuje kopię telefonu i liczy claimy: dwie stajnie w `m`.
3. Apka trzyma refresh token w `expo-secure-store`, a access token w pamięci.
4. `GET /auth/v1/me` daje nazwy stajni, rolę, funkcje i `startView = staff_day`. Apka otwiera ListaDnia Stajni Pod Lipami (`GET /board/v1/stables/st-podlipami/day`).
5. Ola przełącza stajnię na Brzozową. Token się nie zmienia, bo ma już obie stajnie. Apka woła `GET /board/v1/stables/st-brzozowa/day`. Sekcje `tasks` i `rides` znikają, bo `f` Brzozowej ich nie ma.
6. Po 10 min token wygasa. Apka po cichu odświeża go refresh tokenem (rotacja) i ponawia żądanie.

### 9.2 Rejestracja firmy i założenie stajni (Damian)

1. PanelLogowanie: telefon i kod. Wymiana tokenu (`client_id = web`). `auth` tworzy wiersz `users` (`account_kind = person`) i nie znajduje zaproszeń. Token nie ma `biz`, `m` ani `plt`, więc `GET /me` daje `startView = welcome`: PanelWitaj.
2. PanelWitaj: `PATCH /auth/v1/me` z imieniem i językiem.
3. PanelRejestracjaFirmy:
   1. „Pobierz dane z rejestru”: `GET /auth/v1/business-registry/{nip}`;
   2. `POST /auth/v1/businesses` z `Idempotency-Key`;
   3. jedna transakcja `auth`: `businesses` (zajęty NIP daje `409 tax_id_taken`), `business_admins`, wersja uprawnień + 1, audyt, wpis `user:u-damian`;
   4. odpowiedź `201` z `Equenor-Token-Refresh: required`; panel odświeża token, który ma teraz `biz: ["biz-lipowe"]`.
4. PanelZalozStajnie i PanelZalozPowiadomienia, „Załóż stajnię”:
   1. `POST /stable/v1/stables` z `businessId`, stajnią, strefą, pierwszą halą, boksami z poidłem, regułami powiadomień i porami posiłków;
   2. `stable` sprawdza `businessId ∈ biz`;
   3. jedna transakcja `stable`: stajnia, domyślne ustawienia, hala, boksy, reguły, audyt;
   4. po COMMIT synchronicznie `flags` i `care` `/internal/stables/{id}/defaults` (`care` zapisuje pory posiłków), potem `stable.created`: `billing` zakłada subskrypcję, a `flags` i `care` powtarzają idempotentnie;
   5. gdy wywołanie się nie uda, odpowiedź ma `setupPending: ["care"]`, a PanelPulpitStart pokazuje „Dokończ zakładanie stajni”: ponowienie z porami z formularza albo z porami domyślnymi (5.3).
5. Token się nie zmienia: nowa stajnia należy do `biz-lipowe`, więc Damian od razu widzi PanelPulpitStart.
6. Zaproszenie Pawła (PanelZaprosOsobe): `POST /auth/v1/stables/st-brzozowa/invitations` z kanałem, numerem, imieniem, językiem, „ważne do” i rolą `staff`. `auth` publikuje `invitation.created`, `notifications` wysyła SMS.
7. Paweł się loguje. Przy wymianie tokenu `auth` dopasowuje numer, zapisuje członkostwo i publikuje `invitation.accepted`. Pierwszy token Pawła ma już Brzozową; apka otwiera ListaDnia.
8. Klient z koniem (Marek Nowak, Luna z danych demo): przy dopasowaniu `auth` zapisuje też `horse_access`. Pierwszy token ma `h: ["h-luna"]`, a MainLuna działa od razu. Ekran ZaproszeniePrzyjmij tylko zapisuje imię i język (`PATCH /me`, przycisk „Dalej”); dostęp jest już nadany.

### 9.3 Tablet przy boksie

1. Damian zaprasza „Tablety Pod Lipami” na boksy@stajnielipowe.pl jako „Konto techniczne: Tablet przy boksie”. Adres nie należy do żadnego konta, więc zaproszenie przechodzi (inaczej `409 target_in_use`).
2. Tablet: TabletLogowanie, e-mail, kod z e-maila. Wymiana tokenu z `client_id = tablet`. `auth` zakłada konto z `account_kind = technical` i rolą `tablet` i wydaje token na 15 min z jedną stajnią. Konto Oli na tablecie dostałoby `403 wrong_client` i ekran TabletBrakUprawnien.
3. TabletPierwszyBoks: `GET /board/v1/stables/st-podlipami/boxes`. Wybór boksu zapamiętuje tablet; serwer o nim nie wie.
4. Tablica: `GET …/boxes/{b}` z językiem, ETag i 304.
5. Zapisy (POTWIERDZAM, „BOKS GOTOWY”, „Woda”, posiłek i padok dla hali, „Cofnij”) idą z nagłówkiem `X-Box-Id`. Serwis sprawdza: stajnia ze ścieżki = stajnia z tokenu, boks należy do tej stajni, hala akcji = hala boksu. Zapis bez autora: `source = tablet`, `user_id = NULL`, boks i czas.
6. Refresh co 15 min. Gdy odpowiedź zginie przy zerwanym Wi-Fi, tablet w ciągu 60 s dostaje tego samego następcę (z DPoP także później, 3.7) i nie zostaje wylogowany.

### 9.4 Telewizor

1. TV otwiera zwykłą stronę logowania panelu. Konto „Telewizor korytarz” loguje się e-mailem i kodem.
2. Wymiana tokenu z `client_id = web`. Rola `display`, więc `auth` daje token na 15 min i sesję do 365 dni. `GET /me` daje widok tablicy: WyswietlaczCentralny.
3. Tablica: `GET /board/v1/stables/st-podlipami/display?buildingId=`. Sekcje według `f` wyświetlacza, plan dnia według `routine` (5.4). Wybór widoku zapamiętuje przeglądarka.
4. Każdy zapis kontem `display` daje 403.

### 9.5 Odebranie dostępu

**Ola traci Brzozową:**
1. Damian w PanelLudzie klika „Usuń ze stajni” przy Oli w Brzozowej: `DELETE /auth/v1/stables/st-brzozowa/members/{id}`.
2. `auth` w jednej transakcji: sprawdza w `business_admins`, że Damian nadal jest adminem; usuwa członkostwo; podbija wersję uprawnień Oli; dopisuje wpis `user:u-ola`; audyt. Po COMMIT `member.removed` (`tasks` zwalnia jej „Biorę” w Brzozowej).
3. Każdy pod pobiera nowy wpis przy najbliższym pobraniu listy. Następne żądanie Oli dostaje `401 token_stale` (3.8).
4. Apka po cichu odświeża token. Nowy token ma tylko Pod Lipami. Brzozowa znika z przełącznika, a jej obiekty dają 404.

**Kradzież tabletu:**
1. Damian odłącza skradziony tablet: w sesjach konta „Tablety Pod Lipami” wybiera sesję po ostatnim użyciu i sieci i usuwa ją (`DELETE …/members/{id}/sessions/{sid}`; ekran do decyzji, 10.2 pkt 8).
2. `auth` unieważnia tę sesję i dopisuje wpis `session:<sid>`. Pozostałe tablety działają dalej.
3. Skradziony tablet dostaje `token_stale`, a przy odświeżeniu `401 session_revoked`: ekran logowania bez flag. Bez kodu z e-maila nie wróci; skopiowany refresh token też nie zadziała.
4. Gdy nie wiadomo, która sesja to skradziony tablet, Damian blokuje całe konto („Zablokuj”): wypadają wszystkie tablety stajni, a po odblokowaniu loguje je ponownie kodem z e-maila.

### 9.6 Wejście admina globalnego (Kuba, przykład)

1. Anna zgłasza, że nie widzi Komety. Kuba otwiera `[OPS]` i loguje się passkeyem w puli zespołu.
2. Panel wymienia ID token w `POST [OPS]/auth/v1/ops/token`: `client_id = ops`, `reason = ZGL-123`. `auth` sprawdza pulę zespołu i aktywny wiersz `platform_roles`, zapisuje powód w `auth_sessions.reason` i wydaje token na 5 min z `plt = admin`. Alert na kanał zespołu: „Kuba zalogowany, powód ZGL-123”.
3. PanelOps: `GET /auth/v1/platform/businesses`. Kuba wybiera Stajnie Lipowe › Stajnia Brzozowa. Pasek „EQUENOR · pełny dostęp · … · powód: ZGL-123”.
4. Ekrany admina działają jak u Damiana: `resolveStable` daje stan `platform`. Każde żądanie trafia do logu odczytów z `sid`.
5. W `GET /auth/v1/stables/st-brzozowa/horses/h-kometa/access` Kuba widzi, że dostęp Anny wygasł wczoraj, i przedłuża go (`PATCH /auth/v1/stables/st-brzozowa/horse-access/{id}`). Audyt: `actor_type = operator`, `session_id = ses-k7`; dostęp dostaje `granted_via = platform`. Alert: zapis w danych stajni.
6. `auth` podbija wersję uprawnień Anny i dopisuje wpis `user:u-anna`. Apka Anny odświeża token i Kometa wraca. W PanelLudzie Damian widzi przy tym dostępie „nadane przez zespół EQUENOR”.
7. Po 30 min bezczynności albo po 10 h sesja Kuby wygasa.

## 10. Otwarte kwestie

### 10.1 Ryzyka

1. **`auth` to pojedynczy punkt krytyczny:** logowanie, odświeżanie, tokeny serwisowe i lista unieważnień. Ograniczamy to trzema replikami w różnych strefach, SLO i alertami. Awaria krótsza niż TTL (10–15 min) jest dla użytkowników niewidoczna.
2. **Własny kod sesji** (rotacja, wykrywanie kradzieży, ciasteczka, wersje uprawnień) to kod bezpieczeństwa. Ograniczamy to testami (także współbieżnymi), przeglądem bezpieczeństwa przed produkcją i biblioteką `jose` zamiast własnej kryptografii.
3. **Fala odświeżeń:** wpis `all` przy 5000 aktywnych kontach to ok. 5 s przy limicie KMS. Aplikacje odświeżają z losowym opóźnieniem 0–30 s; zaproszenia i wpisy na liście mają limity (3.2).
4. **Admin globalny może zapisywać wszędzie.** Ograniczamy to MFA ze step-up, nadaniem ról we dwie osoby, osobnym hostem, krótką sesją z powodem, alertami, logiem odczytów i oznaczeniem nadanych dostępów. Nadużycia przez osobę z zespołu nie da się wykluczyć całkowicie.
5. **`auth` jest duży.** Każda zmiana ekranu Ludzie to wdrożenie najbardziej krytycznego serwisu. Ograniczamy to przełącznikami funkcji i wdrożeniem stopniowym.
6. **Użytkownik może sam usunąć konto w Cognito** tokenem Cognito, zanim aplikacja go wyrzuci. Skutek: osierocony profil tylko tego użytkownika; jedynego admina firmy odtwarza zespół EQUENOR.

### 10.2 Do decyzji właściciela produktu

**Przed implementacją**
1. **Lista unieważnień co 10 s** (ten dokument) czy sam podpis i TTL? Przy samym TTL blokada i odebranie dostępu działają po 10–15 min, a erd pkt 14 i testy A-23…A-25, T-23 trzeba przepisać. Przy liście: czy przy jej awarii serwis zostaje przy ostatniej liście (ten dokument), czy odrzuca zapisy?
2. **Macierz widoczności w tokenie** (ten dokument) czy jako konfiguracja stajni czytana przez serwisy? Konfiguracja wymagałaby wyjątku od W2.
3. **`businesses` w `auth`** (ten dokument) czy w `stable`, z sagą i cronem uzgadniającym?
4. **Czasy sesji z 3.4**, zwłaszcza panel admina (7 i 30 dni) i TV (365 dni).
5. **Admin globalny:** passkey czy hasło z TOTP jako jedyna metoda; czy `[OPS]` dostaje VPN albo allowlistę IP; czy admin konta dostaje powiadomienie albo log wejść EQUENOR do swoich stajni (dziś: tylko przy dodaniu admina konta); autor w historii jako „Zespół EQUENOR” czy imię.
6. **Klucz w pamięci `auth` zamiast KMS:** szybszy i tańszy, ale klucz prywatny leży wtedy w pamięci podów. Czy to dopuszczalne?
7. **Domena:** ciasteczko z refresh tokenem wymaga panelu i API w jednej domenie, a panel zespołu osobnego hosta. Czy to możliwe? Jeśli nie, potrzebny BFF.
8. **Czy admin może odłączyć jeden tablet w panelu?** Mechanizm w `auth` jest (każdy tablet ma własną sesję, 5.2), ale lista sesji z przyciskiem „Odłącz to urządzenie” w PanelLudzieWyswietlacze kłóci się z erd pkt 2 („bez listy tabletów w panelu”). Ten dokument proponuje listę sesji, bez tabeli urządzeń.
9. **Plan dnia na TV:** wizyty i jazdy jako część `routine` (ten dokument, makiety bez zmian), funkcje `health` i `rides` dla wyświetlacza w danych demo (zmiana makiet ustawień i arkusza G) czy TV bez wizyt i jazd (zmiana makiety WyswietlaczCentralny)?
10. **DPoP dla tabletu i TV:** wymaga spike'u. Bez niego tablet, który po zgubionej odpowiedzi wróci po więcej niż 60 s, musi zalogować się ponownie kodem.

**Może poczekać**
11. **Wsparcie IT** (`plt = support`): teraz, później czy wcale?
12. **Czy klient bez ważnego konia traci stajnię w tokenie** (dec. 24)?
13. **`rides`:** przejście na `*_user_id`; kto tworzy jazdy; czy instruktor ustawia flagi.
14. **Ekrany złożone w `board`** i dane o ludziach dociągane przez aplikację z `auth` czy osobny BFF?
15. **Domyślne dane nowej stajni:** synchroniczne wywołanie i zdarzenie (ten dokument) czy cron uzgadniający?
16. **Ręczne zawieszenie stajni przez admina globalnego** niezależnie od billingu (nowa kolumna w `stables`?).
17. **Domyślna macierz widoczności nowej stajni:** czy jak Pod Lipami?
18. **Diagnostyka tabletu:** endpoint z tokenem tabletu czy SDK narzędzia obserwowalności?
19. **TOTP dla kont klientów** (bez zmian, otwarte).
20. **„Zobacz jako” dla admina globalnego:** P3 czy wcale?
21. **Token zawężony do jednej stajni:** tylko przy przekroczeniu budżetu (3.2) czy zawsze?
22. **Odbiorcy przypomnień `health-due-reminders` i `billing-dunning`:** słownik `notification_rules.event` nie ma takich zdarzeń. Propozycja: `health_due` (admin, obsługa) i `payment_overdue` (admin) w kroku 2 kreatora, co zmienia makietę PanelZalozPowiadomienia.
23. **„Opuść stajnię”** (`DELETE /auth/v1/me/memberships/{stableId}`): gdzie w apce, bo makiety tego nie mają.
24. **Luki poza autoryzacją, bez właściciela:** telefon stajni do „Zadzwoń do stajni”, dzwonek powiadomień w apce, podgląd SMS w PanelZaprosOsobe, stan „Pomiń” w pierwszych krokach (`board …/setup-checklist` nie ma gdzie go zapisać), szablon treści kodu logowania.

## 11. Załącznik: zmiany w innych dokumentach

Wprowadzone 13.10 w erd.md (z diagramem), development.md, development-szczegoly.md, makiety-plan.md i arkuszu decyzji (sekcja O). Makiet `.dc.html` nie zmieniano: lista poprawek jest w 11.4 i w mockups/STAN.md.

### 11.1 Model danych (erd.md)

| Zmiana | Tabela, kolumna | Szczegóły |
|---|---|---|
| Przeniesienie do `auth` | `users` | z `identity`; nowe kolumny `identity_pool` (`customer` albo `team`), `account_kind` (`person` albo `technical`), `authz_version`; unikalność (`identity_pool`, `cognito_sub`) |
| Przeniesienie do `auth` | `stable_members`, `horse_access`, `invitations` | z `access`; `invitations` dostaje `display_name` i `locale` (nazwa konta technicznego, język wiadomości) |
| Przeniesienie do `auth` | `businesses`, `business_admins`, `stable_role_features` | ze `stable`; brak wierszy w `stable_role_features` oznacza macierz domyślną |
| Zmiana | `stable_members`, `horse_access`, `invitations`, `business_admins` | `granted_via` (`business` albo `platform`) i `granted_session_id` (sesja admina globalnego) |
| Nowa | `platform_roles` | `id`, `user_id`, `role` (`admin` albo `support`), `kind` (`named` albo `break_glass`), `reason`, `requested_by`, `approved_by`, `approved_at`, `expires_at`, `first_used_at`, `revoked_by`, `revoked_at`; częściowy unikalny indeks `user_id` przy `revoked_at IS NULL` |
| Nowa | `platform_requests` | wnioski we dwie osoby: `id`, `kind` (`role_grant`, `role_revoke`, `business_admin_add`, `business_admin_remove`), `target_user_id`, `business_id`, `role`, `reason`, `requested_by`, `requested_at`, `approved_by`, `approved_at`, `rejected_at`, `expires_at` |
| Nowa | `auth_sessions` | `id` (= `sid`), `user_id`, `client`, `refresh_hash` UK, `prev_refresh_hash`, `successor_enc`, `rotated_at`, `dpop_jkt`, `idp_token_jti` UK, `created_at`, `last_used_at`, `last_network`, `app_version`, `idle_expires_at`, `expires_at`, `revoked_at`, `revoke_reason`, `reason` |
| Nowa | `auth_revocations` | `id` (UUIDv7, kursor), `kind` (`user`, `session`, `kid` albo `all`), `subject_id`, `min_av`, `not_before`, `reason`, `expires_at` |
| Nowa | `signing_keys` | `kid` (PK, odcisk RFC 7638), `kms_key_arn`, `status`, `public_x`, `public_y`, `created_at`, `activated_at`, `retired_at` |
| Zmiana | `rides` | `rider_member_id`, `instructor_member_id` → `rider_user_id`, `instructor_user_id` (FK `users`) |
| Zmiana | `horse_flags.author_role` | nowa wartość `operator` |
| Zmiana | `flag_acknowledgements.method`, `box_care_events.source`, `building_routines.source` | wartości `tablet`, `app`, `web`, `ops` |
| Zmiana | `payment_provider_events` | `payload_s3_key` → `payload_file_id` (FK `files`) |
| Zmiana | `audit.audit_log` | nowa kolumna `session_id`; `client`: `tablet`, `app`, `web`, `ops`, `opctl` (brak dla `system`); `actor_type = operator` to admin globalny albo Wsparcie IT |

Nowe tabele przestrzegają zasad erd: bez `jsonb`, tablic, enumów i `DEFAULT`, statusy jako `text`. Na diagramie ERD kolory `identity` i `access` zastępuje jeden kolor `auth`. Diagram ma teraz 52 tabele.

### 11.2 Tekst erd.md

Zmienione: nagłówek decyzji (Cognito tylko uwierzytelnia, tokeny i sesje w `auth`, admin globalny); pkt 2 i 4 (sesje i blokada w `auth`, odłączenie tabletu); pkt 5 (tabele prywatne `auth`, grant kolumnowy na `users`); pkt 6 (`auth` zamiast `identity` i `access`, dopasowanie zaproszeń przy wymianie tokenu, bez `409 profile_missing`); pkt 7 (dostęp do konia z tokenu); pkt 14 (admin konta jako claim `biz`, blokada przez listę unieważnień, konta techniczne, Wsparcie IT jako `plt = support`, admin globalny, `platform_roles`); pkt 15 (rejestrację firmy zapisuje `auth`); pkt 16 (macierz w `auth` i w tokenie); pkt 17 (pory posiłków zapisuje `care` po COMMIT, odpowiedź może mieć `setupPending`; odbiorców daje `auth /internal/recipients`); tabele serwisów i cronów; „Współpraca serwisów” (uprawnienia z tokenu); słowniki (`source`, `method`, `client`); sekcja „Zmiany względem modelu z analizy” (sesje w `auth`, punkt z 13.10); diagram i liczba tabel.

### 11.3 development.md, development-szczegoly.md, makiety-plan.md

- **development.md:** lista serwisów (13 i 9 cronów) i pakiety `auth`/`authz` (claimy z tokenu), Cognito (dwie pule, Cognito tylko uwierzytelnia), lokalny `auth` zamiast stuba tokenów, spike, seed (Kuba jako admin globalny, `signing_keys`), `author_role`, izolacja z wyjątkiem admina globalnego, testy bezpieczeństwa (żaden serwis poza `auth` nie czyta tabel uprawnień, tokeny), czasy odebrania dostępu, rozstrzygnięte pkt 4, 5, 6 i 11 sekcji 5.
- **development-szczegoly.md:** 2.4 (dwie pule, sesje w `auth`), 3.1.1 (układ katalogów), 3.1.4 (granty i meta-test), 3.1.5 (pola deskryptora, nowe kody), 3.1.6 (wtyczki: token serwisowy, lista unieważnień, log odczytów), 3.1.7 (token crona), 3.1.9–3.1.11 (według sekcji 3), 3.1.13, 3.2 (lokalny `auth`, `pnpm dev:token`, seed), 3.3 (`auth` zamiast `identity` i `access`), 3.4, 3.5.1 i 3.5.3 (wymiana tokenu, panel `[OPS]`), 4.1 (wyjątek dla stanu w pamięci), 4.2 (testy tokenów), T-23, scenariusze A-23…A-25, sekcja 5 (pkt 4, 5, 8, 15, 21 rozstrzygnięte).
- **makiety-plan.md:** Kuba jako admin globalny, PanelOps w P2, PanelDiagnostyka w panelu `[OPS]`.

### 11.4 Arkusz decyzji, makiety, spike

- decyzje-spec.md: sekcja O (W1, W2 i ustalenia z tej rozpiski, w tym Wsparcie IT jako `plt = support`, na PoC nienadawane).
- **Makiety do poprawy** (bez zmian w tej rundzie, zadanie w mockups/STAN.md):
  - Zaproszenie.dc.html: usunąć rolę „Wsparcie IT” i jej opis;
  - PanelUstawieniaStajni i PanelUstawieniaBezAkcji: w kolumnie Tablet „Zadania” i „Historia boksu” nieaktywne, bez zaznaczenia (erd pkt 16), „Jazdy” odznaczone (dane demo); PanelUstawieniaBrzozowa: u Tabletu „Historia boksu” nieaktywna;
  - ZaproszeniePrzyjmij: przycisk „Dalej” zamiast „Przyjmij zaproszenie” (dostęp jest już nadany);
  - PanelPulpitStart: stan z pozycją „Dokończ zakładanie stajni” (`setupPending`);
  - PanelLudzieWyswietlacze: stan konta zablokowanego z „Odblokuj”; „Odłącz to urządzenie” dopiero po decyzji 10.2 pkt 8;
  - PanelLudzie: oznaczenie „nadane przez zespół EQUENOR”.
- **Nowa plansza P2:** PanelOps (logowanie passkeyem na `[OPS]`, powód wejścia, wybór firmy i stajni, pasek EQUENOR, historia powiadomień).
- analiza.md bez zmian: jej model autoryzacji nie obowiązuje.
- **Spike przed implementacją:**
  1. ID token z `USER_AUTH` (SMS_OTP, EMAIL_OTP): obecność `phone_number_verified` i `email_verified`, `auth_time` przy odświeżeniu Cognito [Ś];
  2. passkey w puli zespołu: RP ID na hoście `[OPS]`, `MULTI_FACTOR_WITH_USER_VERIFICATION`, managed login; czy ID token niesie dowód MFA i czy da się odczytać konfigurację puli (4.1) [Ś];
  3. Expo i tablet z Amplify tylko do logowania i z własną sesją EQUENOR; ciasteczko httpOnly w panelu, na TV i na `[OPS]`;
  4. opóźnienie i koszt KMS Sign z EKS;
  5. weryfikacja tokenów kont serwisowych przez OIDC EKS;
  6. refresh tabletu i wyświetlacza przez tygodnie przy zrywanym Wi-Fi: okno 60 s i DPoP (Android Keystore w Expo, WebCrypto w Chromium na Pi).
