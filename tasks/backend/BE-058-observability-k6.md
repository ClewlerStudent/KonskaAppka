---
id: BE-058
title: Obserwowalność i test obciążenia
area: backend
stage: 9
size: M
status: todo
depends_on: [BE-045, BE-009]
decisions: [DEC-13, DEC-01]
owner:
branch:
trello:
---
# BE-058 · Obserwowalność i test obciążenia

## Cel
Przed pilotażem wiemy, jak system zachowuje się pod obciążeniem tabletów i telewizorów odpytujących co kilka sekund, i mamy telemetrię, z której Dawid zrobi alerty: ślady żądań przez serwisy i kolejki, metryki, osobny log odczytów admina globalnego. Wynik to linia bazowa wydajności do pilnowania regresji.

## Kontekst
- **Stan kodu:** kit `backend/src/kit/service.ts` (Fastify, porty wewnętrzne, `/livez`, `/readyz`), logger pino z redakcją `backend/src/kit/logger.ts`, kolejki `backend/src/lib/messaging` (BE-008), crony (BE-009), `board` z ETag (BE-041…BE-045), `npm run dev:token` (BE-010) do tokenów testowych.
- **Dokumenty:** docs/development-szczegoly.md 3.1.6 („Obserwowalność”: logi z `request_id`, `trace_id`, `stable_id`, `user_id`; OpenTelemetry dla HTTP, pg i kolejek z `traceparent`; metryki Prometheus), 4.1 „Wydajność” (model obciążenia, scenariusze k6, co mierzymy), „Repliki”, 2.12 (narzędzie błędów i logów wybiera Dawid), 3.1.13 (miejsce na generator k6); docs/mikroserwisy.md 4.4 (log odczytów `plt`), 10.1.
- **Makiety:** brak.
- **Decyzje:** DEC-13 A (tablet co 5 s z jitterem, p95 opóźnienia flagi ≤ 15 s; TV co 10 s). DEC-01 (broker za `lib/messaging`; propagacja `traceparent` w nagłówkach wiadomości niezależnie od brokera).
- **Dane demo:** seed plus dane syntetyczne w skali (wiele stajni, setki boksów).

## Zakres
- [ ] OpenTelemetry w `backend/src/kit/telemetry.ts`: instrumentacja Fastify (HTTP), sterownika PostgreSQL i `lib/messaging` (`traceparent` w nagłówkach wiadomości, kontekst w konsumencie); eksport OTLP przez env (`OTEL_EXPORTER_OTLP_ENDPOINT`), domyślnie wyłączony; `trace_id` w logach.
- [ ] Metryki Prometheus na osobnym porcie wewnętrznym `metrics` (`GET /metrics`, bez Ingressu): czas odpowiedzi per trasa i status (osobno 200 i 304), udział 304 w `board`, liczba zapytań SQL na odpytanie `board`, pula połączeń, `events_publish_failed_total`, wiek najstarszej wiadomości i liczba w DLQ, wiek wiadomości w kolejkach kodów, czas i wynik przebiegu każdego crona, liczba usuniętych wierszy `retention-pruner`.
- [ ] Log odczytów `plt`: każde żądanie z `plt` (serwis, trasa, stajnia, obiekt, `sid`) do osobnego strumienia `stream: 'platform-access'` (nazwa z BE-006), jeśli BE-006 tego nie domknął; w dokumentacji dla Dawida: retencja tego strumienia jak audyt.
- [ ] Generator danych syntetycznych `backend/scripts/synth-data.ts` (`npm run synth-data -- --stables 50 --boxes 60`), przez funkcje domeny z audytem.
- [ ] Scenariusze k6 w `backend/load/` (uruchamiane obrazem `grafana/k6` z przypiętą wersją, bez zależności npm): stan ustalony (prawie same 304), pora posiłku (zapisy rutyny i odczyty), powrót wszystkich tabletów w tej samej sekundzie z odświeżeniem tokenów (`POST /auth/v1/token`), rolling deploy (instrukcja ręczna), 24 h bez przerwy; parametry modelu (S stajni, H hal, B boksów, D wyświetlaczy, P s) w pliku konfiguracji.
- [ ] Linia bazowa: pierwszy pomiar (p50, p95, p99 `board` dla 200 i 304, zapytania SQL na odpytanie, CPU bazy, pamięć replik) zapisany w `docs/wydajnosc.md` z opisem środowiska; progi dla przebiegu nocnego.

## Poza zakresem
- dashboardy, alerty, zbieranie logów i wybór narzędzi (Dawid, 2.12); diagnostyka tabletu (TAB-020); runbooki (SH-006).

## Kryteria akceptacji
- [ ] Ślad jednego żądania flagi z apki pokazuje `operations` → publikację zdarzenia → konsumenta w `notifications` z tym samym `trace_id`.
- [ ] `/metrics` każdego serwisu działa na porcie wewnętrznym i nie jest dostępny na porcie zewnętrznym.
- [ ] k6 w stanie ustalonym ma udział 304 bliski 100% (wyraźnie niższy oznacza niedeterministyczny ETag i jest błędem do poprawy).
- [ ] Linia bazowa zapisana w `docs/wydajnosc.md`.

## Testy
- Jednostkowe: propagacja kontekstu w kopercie zdarzenia, rejestr metryk.
- Integracyjne: `/metrics` na porcie wewnętrznym, `trace_id` w logach.
- Obciążenie: `docker run --rm -v $PWD/backend/load:/scripts grafana/k6:<wersja> run /scripts/steady.js` na środowisku z seedem syntetycznym.

## Definicja gotowości
- `npm run check` i `npm run build` w `backend/` zielone; README opisuje uruchomienie k6 i zmienne OTEL.
- Status w tym pliku i w `tasks/QUEUE.md` zaktualizowany.

## Uwagi dla wykonawcy
- W logach i śladach bez tokenów, haseł, kodów, telefonów i e-maili (redakcja pino; atrybuty spanów też bez tych danych).
- Telemetria nie może blokować startu serwisu: brak kolektora to tylko ostrzeżenie w logu.
