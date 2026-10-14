---
id: BE-000
title: "obszar: krótki tytuł zadania"
area: backend
stage: 0
size: M
status: todo
depends_on: []
decisions: []
owner:
branch:
trello:
---
# BE-000 · obszar: krótki tytuł zadania

<!--
Szablon nowego zadania (tasks/README.md, punkt 7). Skopiuj do tasks/<obszar>/<PREFIKS>-<numer>-<slug>.md.
Nagłówek:
  id         BE-001 | WEB-001 | MOB-001 | TAB-001 | SH-001 (prefiks zgodny z obszarem i katalogiem)
  title      ten sam tekst co w nagłówku „# <ID> · <tytuł>”; w cudzysłowie, jeśli zawiera dwukropek
  area       backend | web | mobile | tablet | shared
  stage      0–9 (etapy z tasks/README.md)
  size       S | M | L
  status     todo (zmieniają go komendy claim i set)
  depends_on [ID, ID]  zadania, które muszą być done przed startem; każde zadanie z „Stan kodu” i „Testy” (wprost albo przez inne zależności)
  decisions  [DEC-xx]  decyzje z tasks/decisions.md, od których zależy zakres (każda DEC cytowana w treści poza „Poza zakresem”)
  needs      opcjonalnie [emulator, macos, device, owner]: czego wymagają kryteria [ręcznie] (tasks/README.md punkt 4)
  owner, branch, trello  puste (wypełniają claim i właściciel)
Pisz tak, żeby agent bez historii rozmowy mógł od razu zacząć. Usuń ten komentarz.
-->

## Cel
Jedno, dwa zdania: co działa po zadaniu i dla kogo (rola, aplikacja). Bez szczegółów implementacji.

## Kontekst
- **Stan kodu:** co już jest i gdzie (ścieżki plików, funkcje, trasy, tabele); z których zadań to pochodzi (np. „`unitOfWork` z BE-005”).
- **Dokumenty:** konkretne punkty, np. docs/mikroserwisy.md 5.5 (tabela tras), docs/erd.md (tabele), docs/development-szczegoly.md 3.3 i scenariusze A-xx/T-xx.
- **Makiety:** pliki `mockups/project/<Plansza>.dc.html` i kluczowe teksty z nich (dokładne brzmienie przycisków i komunikatów).
- **Decyzje:** DEC-xx z wybraną albo rekomendowaną opcją i jej skutkiem dla tego zadania.
- **Dane demo:** osoby, stajnie, konie i godziny z seedu, na których sprawdza się kryteria (seed: wt 13.10.2026 07:15).

## Zakres
- [ ] Konkretne kroki z nazwami plików, tras, pól i kodów błędów.
- [ ] Testy i aktualizacja kontraktów (`npm run openapi`, `npm run gen:api`), jeśli dotyczy.

## Poza zakresem
- Co świadomie nie wchodzi i które zadanie to robi (ID).

## Kryteria akceptacji
- [ ] Sprawdzalne zdania na danych demo („Ola w Brzozowej dostaje 403 `feature_hidden`”).
- [ ] [ręcznie] Kryterium, które wymaga emulatora, macOS, sprzętu albo środowiska Dawida (agent bez niego zostawia je do sprawdzenia przy `review`).

## Testy
- Rodzaj testów (Vitest, Playwright, Jest/RNTL, Maestro, testy instrumentowane), pliki i komenda (`cd backend && npm test`).

## Definicja gotowości
- `npm run check` i `npm run build` zielone w dotkniętych pakietach; README/docs zaktualizowane, jeśli zmieniły się komendy, env albo zachowanie; status w tym pliku i w `tasks/QUEUE.md` (`node tasks/queue.mjs set <ID> review`).

## Uwagi dla wykonawcy
- Pułapki, ograniczenia, propozycje do potwierdzenia przez właściciela, odstępstwa od docs i ich powód.
