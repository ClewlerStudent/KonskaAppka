---
id: SH-006
title: Runbooki i kryteria gotowości pilotażu
area: shared
stage: 9
size: S
status: todo
depends_on: [BE-058, SH-005, BE-055, BE-060, TAB-006, TAB-020, TAB-021, WEB-019, BE-026]
decisions: [DEC-05, DEC-10]
needs: [owner]
owner:
branch:
trello:
---
# SH-006 · Runbooki i kryteria gotowości pilotażu

## Cel
Przed wejściem do stajni pilotażowej zespół ma krótkie, sprawdzone instrukcje na typowe awarie i operacje (zgubiony tablet, awaria ZITADEL, pełna DLQ, rotacja klucza, cofnięcie wydania APK) oraz jedną listę kryteriów gotowości uzgodnioną z Dawidem. Instrukcje opisują stan kodu, a nie plany.

## Kontekst
- **Stan kodu (na etapie 9):** skrypty i narzędzia z wcześniejszych zadań: `backend` `npm run events -- dlq list|show|redrive` (BE-008), `npm run cron <nazwa>` (BE-009), `opctl` (BE-056: login, `cron run`, wydania APK, role we dwie osoby), trasy `/platform/*` (BE-026, BE-040, BE-055), „Wyloguj wszystkie tablety” i blokada kont technicznych w panelu (BE-023, WEB-005), klucz podpisu z `SIGNING_KEY_FILE` i `SIGNING_KEY_NEXT_FILE` (DEC-05 B, BE-013), `tools/provision-tablet` (TAB-006), diagnostyka i eksport z tabletu (TAB-020), `tools/display-kiosk` (WEB-019), obserwowalność i linia bazowa k6 (BE-058), manifesty dla platformy (BE-060), raport scenariuszy (SH-005).
- **Dokumenty:** `docs/development-szczegoly.md` 4.5 „Kryteria gotowości do wdrożenia” (CI zielone, test obciążenia z linią bazową, A-01…A-25 automatycznie i na stanowisku, kryteria tabletu, wyświetlacza, kodów SMS i e-mail, eskalacja przy martwym tablecie, zmiana czasu, przećwiczone runbooki: wymiana i provisioning tabletu, odzyskanie zablokowanego, zgubiony tablet, rotacja awaryjna klucza, zmiana Wi-Fi, ponowne logowanie tabletu i TV, awaria ZITADEL albo kolejki kodów, odtworzenie ZITADEL z backupu, cofnięcie wydania APK, redrive z DLQ, odtworzenie bazy; alerty: niepusta DLQ, nieudany cron, opóźniona eskalacja, 5xx w `board`; zatwierdzona para model + firmware i profil `t-*`), `docs/mikroserwisy.md` 3.5 (rotacja awaryjna: wszyscy logują się ponownie), 3.7, 3.8 (odebranie dostępu do 5 min; zgubiony tablet), 4.1–4.5 (admin globalny, step-up, role we dwie osoby), 5.10 (ZITADEL: backup, masterkey, test odtworzenia, aktualizacje), 10.1 (ryzyka).
- **Decyzje:** DEC-05 B (rotacja przez dwa klucze z sekretów), DEC-10 A (`[OPS]`, `opctl`, role we dwie osoby). Infrastruktura (klaster, bazy, backupy, monitoring) jest po stronie Dawida: runbooki infrastrukturalne piszemy jako „co robi aplikacja i co sprawdzić”, a kroki platformy zostawiamy Dawidowi z odnośnikiem.
- **Dane demo:** środowisko testowe z seedem (ćwiczenie runbooków bez danych produkcyjnych).

## Zakres
- [ ] Katalog `docs/runbooki/` z plikami według wzoru (objawy → szybka diagnoza → kroki → sprawdzenie, że działa → kto i kiedy; komendy w blokach kodu, bez sekretów):
  - `tablet-wymiana-provisioning.md` (TAB-006, logowanie kontem tabletów, wybór boksu, zapis modelu i firmware);
  - `tablet-odzyskanie.md` (zablokowany kiosk, reset z recovery, ponowny provisioning, FRP);
  - `tablet-zgubiony.md` („Wyloguj wszystkie tablety” albo blokada konta w Ludziach, ponowne logowanie pozostałych hasłem i kodem; w ≤ 5 min bez dostępu);
  - `tablet-tv-ponowne-logowanie.md` (kod na skrzynkę konta technicznego, kto ma do niej dostęp);
  - `wifi-zmiana.md` (ukryte ustawienia → SIEĆ, kolejność przy zmianie routera, czas przywrócenia z T-15);
  - `apk-cofniecie.md` (`halted`, nowe wydanie z wyższym `versionCode`, rollout procentowy; kroki przez trasy `/platform/*` z BE-040, wariant `opctl` dopisany dopiero po BE-056, które czeka na DEC-10);
  - `klucz-podpisu-rotacja.md` (planowa: `SIGNING_KEY_NEXT_FILE` → przełączenie → usunięcie starego; awaryjna: usunięcie starego klucza z konfiguracji i restart `auth`, wszyscy logują się ponownie, sprawdzenie JWKS i odrzucenia starych tokenów ≤ 5 min);
  - `zitadel-awaria.md` (co stoi: nowe logowania, rejestracje, resety, zmiany profilu; co działa: odświeżanie; jak to rozpoznać w metrykach `auth`; komunikat dla stajni) i `zitadel-backup-aktualizacja.md` (kroki po stronie Dawida z odnośnikiem; po stronie aplikacji: test logowania i konto bez pary w ZITADEL);
  - `kolejki-kodow-awaria.md` (wiek najstarszej wiadomości, kody nie dochodzą, sprawdzenie `sms`/`email` i dostawców);
  - `dlq-redrive.md` (`npm run events -- dlq …`, kiedy wolno ponowić, idempotencja);
  - `cron-reczny-przebieg.md` (`npm run cron` z BE-009, bezpieczeństwo powtórzenia, blokada advisory; `opctl cron run` dopiero po BE-056 i DEC-10);
  - `admin-globalny-wejscie.md` (`[OPS]`, powód wejścia, step-up, role we dwie osoby);
  - `wyswietlacz-pi-odtworzenie.md` (obraz z `tools/display-kiosk`, zapamiętany widok);
  - `baza-odtworzenie.md` (po stronie Dawida; po stronie aplikacji: migracje, `/readyz`, sprawdzenie spójności z ZITADEL).
- [ ] `docs/gotowosc-pilotazu.md`: lista kryteriów z 4.5 jako tabela (kryterium, jak sprawdzić: komenda, raport albo test T-/A-, właściciel, status, data), z linkami do raportów: CI, k6 (BE-058), SH-005, bramka i stanowisko tabletu (TAB-007, TAB-021), runbooki z datą przećwiczenia; sekcja „Do uzgodnienia z Dawidem” (alerty i ich progi, RPO/RTO baz, kto ma dyżur).
- [ ] Ćwiczenie na środowisku testowym co najmniej trzech runbooków (zgubiony tablet, redrive z DLQ, rotacja awaryjna klucza) z zapisem wyniku i poprawkami w treści.
- [ ] Link do `docs/runbooki/` i `docs/gotowosc-pilotazu.md` w README.md.

## Poza zakresem
- Konfiguracja alertów, backupów i klastra (Dawid); same testy obciążenia i obserwowalność (BE-058).
- Rozstrzyganie progów testów (właściciel z Dawidem; development-szczegoly.md 5 pkt 33–37).

## Kryteria akceptacji
- [ ] Każdy runbook z listy 4.5 istnieje, ma sekcję „sprawdzenie, że działa” i odwołuje się tylko do istniejących komend i ekranów (sprawdzone na środowisku testowym albo oznaczone „do przećwiczenia” z datą).
- [ ] [ręcznie] Trzy runbooki przećwiczone na środowisku testowym Dawida; wynik i czas wykonania wpisane w `docs/gotowosc-pilotazu.md`.
- [ ] Lista kryteriów zawiera każdy punkt z 4.5 z właścicielem i sposobem sprawdzenia.
- [ ] [ręcznie] Dawid potwierdził sekcję infrastrukturalną (komentarz albo podpis w pliku).

## Testy
- Ćwiczenia runbooków na środowisku testowym; brak testów automatycznych.

## Definicja gotowości
- Pliki w `docs/`, linki w README działają, ćwiczenia zapisane; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Zależności obejmują zadania, które dają komendy i ekrany opisywane w runbookach (SH-005, BE-055, BE-060, TAB-006, TAB-020, TAB-021, WEB-019); BE-056 (`opctl`) nie jest zależnością, bo czeka na DEC-10: runbooki z `opctl` uzupełnia BE-056.
- Bez sekretów, haseł i prawdziwych adresów w runbookach; nazwy zmiennych i miejsc w sejfie, nie wartości.
- Piszesz dla osoby pod presją: krótkie kroki, jedna komenda na krok, jasne „jeśli X, to Y”.
- Gdy kod różni się od docs, opisz stan kodu i zgłoś różnicę jako nowe zadanie według `tasks/README.md` („Nowe zadanie”).
<!-- dep-ok: BE-056 (runbooki z opctl uzupełnia BE-056 po DEC-10) -->
