---
id: WEB-009
title: PanelZalozStajnie i PanelZalozPowiadomienia
area: web
stage: 2
size: L
status: todo
depends_on: [BE-029, BE-030, WEB-004]
decisions: [DEC-20]
owner:
branch:
trello: https://trello.com/c/TU7t047x
---
# WEB-009 · PanelZalozStajnie i PanelZalozPowiadomienia

## Cel
Admin konta zakłada stajnię w dwóch krokach: (1) nazwa, strefa, pierwsza hala z adresem, boksy od–do z poidłem i pory posiłków; (2) reguły powiadomień (zdarzenie × odbiorca × kanał). Jedno „Załóż stajnię” zapisuje wszystko naraz; ta sama ścieżka służy pierwszej i kolejnej stajni (bez NIP-u).

## Kontekst
- **Stan kodu:** zaślepka `/stables/new` (WEB-001), komponenty `TextField`, `Select`, `RadioGroup`, `Switch`, `Checkbox`, `TimeField`, `DataTable`, `Toast`, `newId()` z WEB-001/WEB-004; firma z `GET /me` (`businesses[]`).
- **Dokumenty:** docs/mikroserwisy.md 5.3 (`POST /stables` po COMMIT woła `operations …/defaults`; przy błędzie `setupPending: ["operations"]` i „Dokończ zakładanie stajni”), 9.2 pkt 6–7. BE-029: `POST /stables/v1/stables` z `{ id, businessId, name, timezone, building: { name, addressLine1, addressLine2?, postalCode, city, countryCode }, boxes: [{ label, autoWaterer? }], mealSlots: [{ code?, label, localTime, daysMask, labels? }], notificationRules: [{ event, recipientRole, channel, enabled }] }` → 201 `{ stable, setupPending }`; powtórka z tym samym `id` → 200, z inną treścią `409 id_conflict`; słownik zdarzeń: `flag_unacknowledged`, `flag_created_by_client`, `invitation_accepted`, `invitation_expired`, `invoice_issued`, `payment_failed`, `health_due`, `payment_overdue` (płatności tylko dla `admin`). docs/erd.md pkt 16, 17; docs/development-szczegoly.md 3.5.3 „Konto firmy i zakładanie stajni”, 5 pkt 53.
- **Makiety:** mockups/project/PanelZalozStajnie.dc.html (nagłówek „Zakładasz stajnię · Stajnie Lipowe sp. z o.o. · D Damian”, kroki „1 Stajnia · 2 Powiadomienia”, H1 „Załóż stajnię”; „Nazwa stajni *”, „Strefa czasowa” Europa/Warszawa | Europa/Kijów | Europa/Berlin; „Hala”: „Nazwa hali *”, „Ulica i numer *”, „Kod pocztowy *”, „Miejscowość *”; „Boksy”: „Dodaj boksy”, „Od numeru *”, „Do numeru *”, „6 boksów: 1–6”, wiersze „Numer | Poidło: Automatyczne | Ręczne | Więcej ustawień”, „Ustaw dla wszystkich”, „Bez boksów na razie”; „Pory posiłków”: Nazwa, Godzina, Dni „codziennie | wybrane dni”, „Dodaj porę”, „Nazwy w innych językach”; „Anuluj”, „Dalej: powiadomienia”; panel „Podsumowanie”) i PanelZalozPowiadomienia.dc.html (tabela: grupy Flagi „Flaga niepotwierdzona po 15 min”, „Nowa flaga od klienta”; Zaproszenia „Zaproszenie przyjęte”, „Zaproszenie wygasło”; Płatności „Nowa faktura”, „Nieudana płatność” z „—” u obsługi; kolumny „Admin konta · Damian” i „Obsługa tej stajni · jeszcze bez osób”, po SMS i E-mail; „Wstecz”, „Załóż stajnię”; podsumowanie „Powiadomienia 6 włączonych · SMS i e-mail”). makiety-plan.md B (stany: walidacja, „Ustaw dla wszystkich”, „Zakładamy stajnię…”, „Nie udało się. Spróbuj ponownie.” bez drugiej stajni).
- **Decyzje:** DEC-20 A (pory 06:30/12:00/18:00 domyślnie; reguły `health_due` i `payment_overdue` dochodzą do tabeli kroku 2).
- **Dane demo:** A-22 (Pod Lipami, Hala główna 1–8 po rejestracji firmy), A-23 (Brzozowa, ul. Brzozowa 5, 05-500 Piaseczno, boksy 1–6 z poidłem automatycznym).

## Zakres
- [ ] `web/src/features/create-stable/`: trasy `/stables/new` (krok 1) i `/stables/new/notifications` (krok 2) z układem kreatora (bez nawigacji panelu, z menu konta); szkic w pamięci (`Services`), utrata po przeładowaniu akceptowalna; `id` stajni nadany raz na szkic (`newId()`).
- [ ] Krok 1: pola jak na makiecie; zakres boksów generuje wiersze od razu (numer edytowalny w „Więcej ustawień”, poidło per wiersz, „Ustaw dla wszystkich”), „Bez boksów na razie” → `boxes: []`; pory domyślne 06:30 Śniadanie, 12:00 Obiad, 18:00 Kolacja „codziennie”, „Dodaj porę”, dni tygodnia → `daysMask` (pn = 1 … nd = 64, „codziennie” = 127; docs/erd.md „Zasady wspólne”), etykiety UA i EN zwinięte. Walidacja: wymagane pola, kod `NN-NNN`, „od” ≤ „do”, najwyżej 200 boksów (propozycja), unikalne godziny i nazwy pór.
- [ ] Panel „Podsumowanie” aktualizowany na żywo (stajnia, firma, hala z adresem, boksy z poidłem, posiłki, „Usługi: wszystkie włączone · także potwierdzenia flag”, w kroku 2 liczba włączonych powiadomień).
- [ ] Krok 2: komponent `NotificationRulesTable` (użyje go WEB-022 do edycji) z grupami Flagi, Zaproszenia, Wizyty (`health_due`, „Przypomnienie o wizycie”, propozycja nazwy), Płatności (`invoice_issued`, `payment_failed`, `payment_overdue` „Płatność po terminie”, propozycja nazwy; u obsługi „—”); domyślne zaznaczenia jak na makiecie: flagi SMS, zaproszenia i płatności e-mail (propozycja z dev 5 pkt 53).
- [ ] „Załóż stajnię”: stan „Zakładamy stajnię…”, `POST /stables` z `businessId` (jedyna firma z `GET /me`; przy kilku firmach wybór w kroku 1); błąd sieci albo 5xx → „Nie udało się. Spróbuj ponownie.” i ponowienie z tym samym `id`. Po 201/200: zapamiętać `mealSlots` z szkicu w `Services` pod `pendingSetup[stableId]` (dla „Dokończ zakładanie stajni” w WEB-010), unieważnić `GET /me`, przejść na `/stables/{id}` z banerem „Stajnia Brzozowa założona.”.
- [ ] Wejścia: po PanelRejestracjaFirmy (WEB-003) i „Załóż stajnię” w PanelMenuKonta; „Anuluj” wraca do poprzedniej stajni albo PanelWitaj.

## Poza zakresem
- PanelPulpitStart i ponowienie `setup/retry` (WEB-010); edycja reguł i pór po założeniu (WEB-022); dodawanie hal (WEB-012); ustawienia usług (WEB-014).

## Kryteria akceptacji
- [ ] A-22: Pod Lipami z Halą główną 1–8 i „Ustaw dla wszystkich: Automatyczne”; w bazie stajnia, hala, 8 boksów i `notification_rules` zapisane jednym żądaniem.
- [ ] A-23: druga stajnia (Brzozowa) bez pytania o NIP, działalność, języki tabletów i potwierdzenia; po założeniu Damian od razu ma „▾” z obiema stajniami.
- [ ] Wstrzyknięty błąd sieci po wysłaniu i ponowienie nie tworzą drugiej stajni (ten sam `id`).
- [ ] Odpowiedź z `setupPending: ["operations"]` przechodzi na pulpit, a `pendingSetup` ma pory z formularza.
- [ ] Bez dopisków (o adresie hali, ustawieniach, „Co dalej”); 1440 i 390 px bez poziomego przewijania.

## Testy
- Vitest: generator boksów i `daysMask`, walidacja, budowa body (snapshot zgodny z kontraktem BE-029), `NotificationRulesTable` (zablokowane komórki obsługi dla płatności).
- Playwright na atrapie: pełny kreator Brzozowej, błąd i ponowienie z tym samym `id`, zrzuty obu kroków.
- `cd frontend && npm run check && npm run e2e`.

## Definicja gotowości
- `npm run check`, `npm run build`, `npm run e2e` we `frontend/` zielone; `npm run gen:api` po BE-029; status w tym pliku i w `tasks/QUEUE.md`.

## Uwagi dla wykonawcy
- Boksy rozpoznaje się po `id`; numery mogą się powtarzać między halami (bez walidacji unikalności między halami).
- Nowa stajnia ma wszystkie usługi i potwierdzenia włączone (erd pkt 16): kreator o nie nie pyta.
- Strefa jako identyfikator IANA (`Europe/Warsaw`), etykieta po polsku.
