---
id: WEB-019
title: tools/display-kiosk (Raspberry Pi)
area: web
stage: 5
size: M
status: todo
depends_on: [WEB-016, WEB-018]
decisions: [DEC-25]
needs: [device]
owner:
branch:
trello: https://trello.com/c/vUZSTpms
---
# WEB-019 · tools/display-kiosk (Raspberry Pi)

## Cel
Powtarzalny zestaw skryptów, który zamienia Raspberry Pi 5 z czystym Raspberry Pi OS w kiosk telewizora stajni: Chromium na pełnym ekranie z panelem EQUENOR, który wraca sam po awarii, nie gaśnie, nie pyta o przywracanie stron, budzi telewizor przez HDMI-CEC i przetrwa zanik prądu. Osoba wdrażająca stawia zestaw według README w kilkanaście minut.

## Kontekst
- **Stan kodu:** nie ma; widok TV z WEB-016…WEB-018 pod adresem panelu (`/display` po zalogowaniu kontem `display`). Skrypty kiosku to osobny katalog `frontend/tools/display-kiosk/` w repo frontend, poza pakietem npm (shell + pliki systemd).
- **Dokumenty:** docs/development-szczegoly.md 3.5.4 „`tools/display-kiosk`” (16 punktów: Imager, autologowanie, Chromium jako usługa `systemd --user` z `Restart=always`, flagi `--kiosk --noerrdialogs --disable-infobars --no-first-run --password-store=basic --user-data-dir=<stały katalog>` bez `--incognito`, poprawka `exit_type`/`exited_cleanly` w Preferences w `ExecStartPre`, bez wygaszania i z ukrytym kursorem, `HandlePowerKey=ignore`, `RuntimeWatchdogSec` ≤ 15 s, codzienny restart Chromium timerem, CEC przez `v4l-utils`, wymuszony tryb `video=HDMI-A-1:1920x1080@60D`, NTP i RTC, SSH tylko z kluczami, `apt-mark hold chromium` do testów kanarka, wykrywanie nazwy pakietu `chromium`/`chromium-browser`, overlay FS wyłączony), 1.3 (sprzęt TV), 4.3.2 W-01…W-29 (testy na sprzęcie).
- **Makiety:** nie dotyczy (widok z WEB-016).
- **Decyzje:** brak. Infrastruktura serwerowa nie wchodzi w zakres (robi ją Dawid); to konfiguracja urządzenia w stajni.
- **Dane demo:** konto „Telewizor korytarz” do pierwszego logowania na Pi (myszką albo klawiaturą przy instalacji).

## Zakres
- [ ] `frontend/tools/display-kiosk/install.sh` (idempotentny, `set -euo pipefail`, uruchamiany przez SSH jako zwykły użytkownik z `sudo`): wykrycie pakietu Chromium, instalacja `v4l-utils` i `jq`, katalog profilu `~/.local/share/equenor-kiosk`, plik konfiguracji `/etc/equenor-kiosk.conf` (`PANEL_URL`, godzina codziennego restartu, opcjonalny tryb HDMI).
- [ ] `systemd/user/equenor-kiosk.service` (`Restart=always`, `RestartSec=2`, `ExecStartPre=fix-preferences.sh`, flagi z 3.5.4, start po sesji graficznej labwc) i `equenor-kiosk-restart.timer` (codzienny restart Chromium).
- [ ] `fix-preferences.sh`: ustawia `exit_type = "Normal"` i `exited_cleanly = true` w `Default/Preferences` (jq, bez zmian przy braku pliku).
- [ ] Wygaszanie i kursor: konfiguracja labwc bez `swayidle`, ukryty kursor; `logind.conf.d/equenor.conf` z `HandlePowerKey=ignore`; `system.conf.d/watchdog.conf` z `RuntimeWatchdogSec=15` (sprawdzenie limitu `wdctl` w skrypcie).
- [ ] CEC: `equenor-cec.service` przy starcie (`cec-ctl --playback`, `--image-view-on`, aktywne źródło) i po restarcie przeglądarki.
- [ ] System: `systemd-timesyncd` aktywny, RTC (Pi 5), SSH tylko z kluczami (`sshd_config.d/equenor.conf`: `PasswordAuthentication no`), opcjonalny wpis `video=…` w `cmdline.txt`, kontrola, że overlay FS jest wyłączony, `apt-mark hold` dla Chromium (przełącznik `--hold-chromium`).
- [ ] `uninstall.sh` (przywraca stan sprzed instalacji) i `check.sh` (raport: usługa, watchdog, CEC, NTP, wersja Chromium, overlay).
- [ ] `frontend/tools/display-kiosk/README.md`: przygotowanie karty (Raspberry Pi Imager: host, użytkownik, klucz SSH, Wi-Fi, strefa Europe/Warsaw), instalacja, pierwsze logowanie kontem `display`, wybór hali (WEB-017), procedura odtworzenia W-18 z pomiarem czasu, lista testów W do wykonania na stanowisku.

## Poza zakresem
- Obraz systemu do klonowania i zarządzanie flotą; monitoring urządzeń (wysyłka diagnostyki Pi według DEC-25, po wyborze narzędzia); testy W na sprzęcie (stanowisko Dawida, wyniki do docs).

## Kryteria akceptacji
- [ ] [ręcznie] Na czystym Raspberry Pi OS Trixie 64-bit po `install.sh` i restarcie Pi otwiera się panel na pełnym ekranie; po zalogowaniu kontem `display` tablica.
- [ ] W-12: `kill -9` Chromium → przeglądarka wraca w ≤ 10 s bez „Przywrócić strony?”, infobaru i okna pęku kluczy.
- [ ] W-06, W-14: przycisk zasilania nie wyłącza Pi; ekran nie gaśnie, kursor niewidoczny.
- [ ] W-27: logowanie SSH hasłem odrzucone.
- [ ] Drugie uruchomienie `install.sh` niczego nie psuje (idempotencja); `uninstall.sh` usuwa usługi.

## Testy
- `shellcheck` dla wszystkich skryptów (krok CI z SH-003; lokalnie `shellcheck frontend/tools/display-kiosk/*.sh`).
- Testy `fix-preferences.sh` na plikach przykładowych (`frontend/tools/display-kiosk/test/*.json`, prosty `test/run.sh` porównujący wynik).
- Ręczna lista kontrolna na Pi (W-01, W-02, W-05, W-06, W-12, W-13, W-14, W-25, W-26, W-27, W-29) z wynikami w README.

## Definicja gotowości
- `shellcheck` i `test/run.sh` zielone; README kompletne; lista kontrolna wykonana na Pi (albo jawnie oznaczona jako do wykonania przez Dawida); status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Bez `--incognito` i `--temp-profile`: profil musi trzymać ciasteczko sesji i `localStorage` (wybór hali).
- Nie używać pakietu `watchdog` ani FullPageOS (3.5.4).
- Punkty oznaczone w docs jako [niepotwierdzone] (`HandlePowerKey`, tryb HDMI, `--hide-crash-restore-bubble`) zostaw jako opcje z opisem w README.
<!-- dep-ok: SH-003 (shellcheck jako krok CI; lokalnie wystarczy shellcheck) -->
