# KonskaAppka: model danych (ERD) do zatwierdzenia

> Wersja robocza v1 · 2026-10-12. Uwzględnia decyzje: osobne mikroserwisy w monorepo (także crony), Cognito jako serwer autoryzacji
> (OTP przez SMS i TOTP z RFC 6238), pliki w S3, koń powiązany 1:1 z boksem, bez WebSocketów, użytkownik logowany na tabletach
> i blokujący na nich boks.

## Do zatwierdzenia

1. **Koń ↔ boks 1:1.**
   - `horses.box_id` ma unikalny indeks, więc jeden boks ma najwyżej jednego konia, a koń jest w najwyżej jednym boksie.
   - Koń aktywny (`status = active`) zawsze ma boks; pilnuje tego kod.
   - Boks może stać pusty.
   - Koń, który opuścił stajnię (`status = left`), zwalnia boks (`box_id = NULL`). Zostaje w bazie razem z historią flag i zdrowia.
   - Przeniesienie albo zamiana dwóch koni to jedna transakcja z wpisami w `horse_box_history`.
   - Boksy i konie należą do jednego serwisu (`stable`), więc relację 1:1 pilnuje baza: klucz obcy i unikalność, bez żadnej logiki w bazie.
2. **Tablet: logowanie użytkownika i blokada boksu.**
   - Tablet nie ma własnego konta. Loguje się na nim użytkownik tym samym kontem co w apce.
   - Jeden użytkownik może być zalogowany na kilku tabletach naraz i wszędzie widzi te same dane, bo decydują jego uprawnienia, a nie tablet.
   - Na danym tablecie użytkownik wybiera boks i go blokuje (`device_box_locks`). Tablet pokazuje wtedy tylko ten boks.
   - Na tablecie jest najwyżej jedna aktywna blokada, a jeden boks może być zablokowany na kilku tabletach.
   - Założenia do potwierdzenia:
     - na tablecie jest zalogowany jeden użytkownik naraz;
     - zablokować można tylko boks, który użytkownik ma prawo widzieć;
     - odblokować może ten, kto zablokował, albo admin stajni.
3. **Schemat per mikroserwis** w jednej bazie PostgreSQL. Klucze obce są tylko wewnątrz schematu. Między serwisami są same identyfikatory: na diagramach linia przerywana, a spójności pilnuje kod. To założenie robocze; jeśli wolisz osobne bazy, diagram się nie zmienia.
4. **Tożsamość w Cognito.**
   - `users.cognito_sub` wiąże nasz profil z kontem w puli Cognito.
   - Hasła, kody OTP (SMS, TOTP), sesje i tokeny trzyma Cognito, więc nie ma ich w naszej bazie.
   - Tablety nie mają kont w Cognito. `devices` to rejestr fizycznych tabletów, identyfikowanych identyfikatorem instalacji nadawanym przez apkę.
   - `device_sessions` zapisuje, który użytkownik jest zalogowany na którym tablecie. Służy do wylogowania zdalnego, audytu i pokazywania na tablecie, kto jest zalogowany.
5. **Pliki w S3.** Tabela `files` trzyma tylko metadane i `s3_key`. Treść jest w S3.
6. **Bez WebSocketów.** `board_states` to gotowy stan tablicy dla każdego boksu. Tablet odpytuje go przez REST z `ETag`. Między serwisami: kolejki albo REST (decyzja otwarta). Przy kolejkach każdy serwis dostaje tabele techniczne `outbox` i `inbox`, których nie ma na diagramach.

Zasady wspólne: identyfikatory UUIDv7 z kodu, czas w `timestamptz` (UTC), statusy jako `text` walidowany w kodzie. Każda tabela danych stajni ma `stable_id`. Bez triggerów, funkcji, `CHECK`, `DEFAULT` i sekwencji.

## Mikroserwisy i ich schematy

| Mikroserwis | Schemat | Tabele |
|---|---|---|
| `identity` | `identity` | `users` |
| `access` | `access` | `stable_members`, `horse_access`, `invitations` |
| `stable` | `stable` | `stables`, `boxes`, `horses`, `horse_box_history`, `meal_slots`, `paddocks`, `arenas` |
| `devices` | `devices` | `devices`, `device_sessions`, `device_box_locks`, `device_commands`, `device_alerts` |
| `flags` | `flags` | `flag_templates`, `horse_flags`, `flag_acknowledgements`, `flag_displays`, `flag_escalations` |
| `care` | `care` | `feeding_plans`, `feeding_checks`, `paddock_plans` |
| `health` | `health` | `health_events`, `health_attachments` |
| `rides` | `rides` | `rides` |
| `tasks` | `tasks` | `tasks`, `task_occurrences` |
| `board` | `board` | `board_states` |
| `files` | `files` | `files` (metadane; treść w S3) |
| `releases` | `releases` | `app_releases` |
| `notifications` | `notifications` | `notifications` |
| `audit` | `audit` | `audit_log` |

**Crony to osobne mikroserwisy bez własnych tabel domenowych.** Działają przez API albo kolejki serwisów, do których należą dane:

| Cron | Serwis danych |
|---|---|
| `escalation-scheduler` | `flags` |
| `device-offline-detector` | `devices` |
| `board-display-check` | `board`, `flags` |
| `task-occurrence-generator` | `tasks` |
| `health-due-reminders` | `health`, `notifications` |
| `retention-pruner` | czyści dane w każdym serwisie |

Względem v3 znikają:
- `otp_challenges`, `auth_sessions`, `access_tokens`, `refresh_tokens`, `device_auth_challenges` i `rate_limit_buckets`: przejmuje je Cognito;
- `device_pairing_requests`: nie ma parowania, bo tablet rejestruje się przy pierwszym logowaniu użytkownika;
- `stored_files` i `stored_file_chunks`: przejmuje je S3;
- `outbox_seq`, `outbox_events` i `device_presence`: odpadają razem z WebSocketami;
- `device_boxes`: zastępuje je `device_box_locks` (blokada boksu ustawiana przez użytkownika);
- `jobs`: zastępują je crony jako serwisy.

## Legenda

- Linia ciągła oznacza klucz obcy wewnątrz jednego serwisu.
- Linia przerywana oznacza sam identyfikator z innego serwisu, bez klucza obcego.
- Oznaczenia krotności przy każdym końcu linii:
  - `||` dokładnie jeden;
  - `o|` zero albo jeden;
  - `o{` zero lub wiele.

## 1. Rdzeń: stajnia, boksy, konie, tablety, użytkownicy i dostęp

```mermaid
erDiagram
    stables {
        uuid id PK
        text name
        text timezone "IANA, np. Europe/Warsaw"
        text status "active | suspended"
        jsonb settings
    }
    boxes {
        uuid id PK
        uuid stable_id FK
        text label "unikalny w stajni"
        text building
        boolean active
    }
    horses {
        uuid id PK
        uuid stable_id FK
        uuid box_id FK, UK "1:1 z boksem, NULL tylko gdy left"
        text status "active | left"
        text name
        text breed
        date birth_date
        uuid photo_file_id "files"
        timestamptz left_at
    }
    horse_box_history {
        uuid id PK
        uuid horse_id FK
        uuid box_id FK
        timestamptz from_at
        timestamptz to_at "NULL = obecnie"
    }
    devices {
        uuid id PK "identyfikator instalacji z apki"
        uuid stable_id "stables, gdzie wisi tablet"
        text name
        text status "active | retired"
    }
    device_sessions {
        uuid id PK
        uuid device_id FK "jedna aktywna sesja na tablet"
        uuid user_id "users"
        timestamptz signed_in_at
        timestamptz last_seen_at
        timestamptz signed_out_at "NULL = zalogowany"
    }
    device_box_locks {
        uuid id PK
        uuid device_id FK "jedna aktywna blokada na tablet"
        uuid box_id "boxes"
        uuid stable_id "stables"
        uuid locked_by "users"
        timestamptz locked_at
        timestamptz unlocked_at "NULL = aktywna"
        uuid unlocked_by "users"
    }
    users {
        uuid id PK
        text cognito_sub UK
        text display_name
        text phone_e164
        text email
        text locale
    }
    stable_members {
        uuid id PK
        uuid stable_id "stables"
        uuid user_id "users"
        text role "admin | staff | instructor | member"
        boolean active
    }
    horse_access {
        uuid id PK
        uuid stable_id "stables"
        uuid horse_id "horses"
        uuid user_id "users"
        text role "owner | co_owner | lessee | viewer"
        timestamptz valid_from
        timestamptz valid_to
        timestamptz revoked_at
    }
    invitations {
        uuid id PK
        uuid stable_id "stables"
        text channel "sms | email"
        text target
        text role
        uuid horse_id "horses, opcjonalnie"
        text access_role
        text token_hash UK
        timestamptz expires_at
        uuid accepted_by "users"
    }
    stables ||--o{ boxes : "ma"
    stables ||--o{ horses : "ma"
    boxes ||--o| horses : "1:1 zajmuje"
    horses ||--o{ horse_box_history : "historia"
    boxes ||--o{ horse_box_history : "historia"
    devices ||--o{ device_sessions : "sesje"
    users ||..o{ device_sessions : "zalogowany na"
    devices ||--o{ device_box_locks : "blokady"
    boxes ||..o{ device_box_locks : "zablokowany na"
    users ||..o{ device_box_locks : "blokuje"
    stables |o..o{ devices : "tablety"
    users ||..o{ stable_members : "jest członkiem"
    stables ||..o{ stable_members : "członkowie"
    users ||..o{ horse_access : "ma dostęp"
    horses ||..o{ horse_access : "dostęp"
    stables ||..o{ invitations : "zaprasza"
    horses |o..o{ invitations : "do konia"
```

## 2. Flagi i potwierdzenia

```mermaid
erDiagram
    flag_templates {
        uuid id PK
        uuid stable_id "stables"
        text code "unikalny w stajni"
        jsonb labels "pl, uk, en"
        text severity "info | warning | critical"
        text effect "suspend_meal | cancel_paddock | no_riding | none"
        text meal_slot_code
        boolean requires_ack
        boolean active
    }
    horse_flags {
        uuid id PK "z klienta"
        uuid stable_id "stables"
        uuid horse_id "horses"
        uuid template_id FK "opcjonalnie"
        text custom_text
        text severity
        text effect
        text note
        text note_visibility "board | app_only"
        timestamptz valid_from
        timestamptz valid_to "NULL = do odwołania"
        uuid meal_slot_id "meal_slots"
        date service_date
        timestamptz ack_deadline_at
        text source "app | on_behalf_phone | on_behalf_sms | on_behalf_in_person"
        uuid replaces_flag_id FK
        uuid created_by "users"
        timestamptz created_at
        timestamptz cancelled_at
        timestamptz acknowledged_at
    }
    flag_acknowledgements {
        uuid id PK "id zdarzenia z klienta"
        uuid stable_id "stables"
        uuid flag_id FK
        uuid device_id "devices, NULL gdy z apki"
        uuid user_id "users, zalogowany użytkownik"
        text method "tablet | app"
        timestamptz occurred_at
        timestamptz received_at
        text conflict "none | flag_ended | flag_cancelled"
    }
    flag_displays {
        uuid id PK
        uuid stable_id "stables"
        uuid flag_id FK "unikalne z device_id"
        uuid device_id "devices"
        bigint board_version
        timestamptz displayed_at
    }
    flag_escalations {
        uuid id PK
        uuid stable_id "stables"
        uuid flag_id FK "unikalne z level"
        text level "board_warning | admin_notify"
        timestamptz escalated_at
    }
    horses
    meal_slots
    devices
    users
    flag_templates |o--o{ horse_flags : "szablon"
    horse_flags |o--o| horse_flags : "zastępuje"
    horse_flags ||--o{ flag_acknowledgements : "potwierdzenia"
    horse_flags ||--o{ flag_displays : "wyświetlenia"
    horse_flags ||--o{ flag_escalations : "eskalacje"
    horses ||..o{ horse_flags : "flagi"
    meal_slots |o..o{ horse_flags : "cel: posiłek"
    devices |o..o{ flag_acknowledgements : "z tabletu"
    users ||..o{ flag_acknowledgements : "kto"
    devices ||..o{ flag_displays : "na tablecie"
```

## 3. Opieka, zdrowie, jazdy i zadania

```mermaid
erDiagram
    meal_slots {
        uuid id PK
        uuid stable_id FK
        text code "np. breakfast"
        jsonb labels
        time local_time
        jsonb days_of_week
        date valid_from
        date valid_to
    }
    paddocks {
        uuid id PK
        uuid stable_id FK
        text name
    }
    arenas {
        uuid id PK
        uuid stable_id FK
        text name
        int capacity
    }
    feeding_plans {
        uuid id PK
        uuid stable_id "stables"
        uuid horse_id "horses"
        uuid meal_slot_id "meal_slots"
        jsonb items "pasza, ilość, jednostka, suplementy"
        date valid_from
        date valid_to
    }
    feeding_checks {
        uuid id PK "z klienta"
        uuid stable_id "stables"
        uuid horse_id "horses"
        uuid meal_slot_id "meal_slots"
        date service_date "unikalne z horse_id i meal_slot_id"
        uuid device_id "devices, NULL gdy z apki"
        uuid user_id "users"
        timestamptz occurred_at
        text conflict "none | meal_suspended"
    }
    paddock_plans {
        uuid id PK
        uuid stable_id "stables"
        uuid horse_id "horses"
        uuid paddock_id "paddocks"
        jsonb days_of_week
        time start_local
        time end_local
        jsonb companions "horses"
    }
    health_events {
        uuid id PK
        uuid stable_id "stables"
        uuid horse_id "horses"
        text type "vet | farrier | dentist | deworming | vaccination"
        date occurred_on
        timestamptz scheduled_at
        timestamptz next_due_at
        text description
        text visibility "stable | owner_private"
        uuid created_by "users"
    }
    health_attachments {
        uuid id PK
        uuid stable_id "stables"
        uuid health_event_id FK
        uuid file_id UK "files"
    }
    rides {
        uuid id PK
        uuid stable_id "stables"
        uuid horse_id "horses"
        uuid rider_member_id "stable_members, opcjonalnie"
        text rider_name
        uuid instructor_member_id "stable_members"
        uuid arena_id "arenas"
        timestamptz starts_at
        timestamptz ends_at
        text status
    }
    tasks {
        uuid id PK
        uuid stable_id "stables"
        text title
        uuid horse_id "horses, opcjonalnie"
        uuid box_id "boxes, opcjonalnie"
        timestamptz due_at "zadanie jednorazowe"
        jsonb days_of_week "zadanie cykliczne"
        time local_time
        text assignee_role
        boolean active
    }
    task_occurrences {
        uuid id PK
        uuid stable_id "stables"
        uuid task_id FK
        timestamptz due_at "unikalne z task_id"
        text status
        uuid done_by_user_id "users"
        uuid done_by_device_id "devices, NULL gdy z apki"
        timestamptz occurred_at
    }
    stables
    horses
    boxes
    files
    stables ||--o{ meal_slots : "ma"
    stables ||--o{ paddocks : "ma"
    stables ||--o{ arenas : "ma"
    horses ||..o{ feeding_plans : "plan"
    meal_slots ||..o{ feeding_plans : "posiłek"
    horses ||..o{ feeding_checks : "odhaczenia"
    meal_slots ||..o{ feeding_checks : "posiłek"
    horses ||..o{ paddock_plans : "padok"
    paddocks ||..o{ paddock_plans : "gdzie"
    horses ||..o{ health_events : "zdrowie"
    health_events ||--o{ health_attachments : "załączniki"
    files ||..o| health_attachments : "plik w S3"
    horses ||..o{ rides : "jazdy"
    arenas |o..o{ rides : "miejsce"
    tasks ||--o{ task_occurrences : "wystąpienia"
    horses |o..o{ tasks : "dotyczy"
    boxes |o..o{ tasks : "dotyczy"
```

## 4. Urządzenia, stan tablicy, pliki, wydania, powiadomienia i audit

```mermaid
erDiagram
    devices {
        uuid id PK "identyfikator instalacji z apki"
        uuid stable_id "stables, gdzie wisi tablet"
        text name
        text status "active | retired"
        text model
        text firmware
        text app_version
        text connectivity "online | offline"
        timestamptz last_seen_at
        jsonb last_telemetry "Wi-Fi, bateria, zasilanie, zegar"
        timestamptz registered_at
        timestamptz retired_at
    }
    device_commands {
        uuid id PK
        uuid stable_id "stables"
        uuid device_id FK
        text type "refresh | restart | sign_out | unlock_box | wipe | add_wifi"
        jsonb payload
        text status "pending | delivered | succeeded | failed | expired"
        timestamptz expires_at
    }
    device_alerts {
        uuid id PK
        uuid stable_id "stables"
        uuid device_id FK
        text kind "offline | power_lost | clock_drift | board_stale"
        timestamptz opened_at
        timestamptz closed_at
    }
    board_states {
        uuid box_id PK "boxes"
        uuid stable_id "stables"
        uuid horse_id "horses"
        bigint version
        text etag
        jsonb payload "gotowy stan tablicy"
        timestamptz updated_at
    }
    files {
        uuid id PK
        uuid stable_id "stables, NULL dla APK"
        text s3_key UK
        text content_type
        bigint size_bytes
        text sha256
        text status "pending | uploaded"
        uuid uploaded_by "users"
    }
    app_releases {
        uuid id PK
        int version_code UK
        text version_name
        uuid file_id "files"
        text sha256
        text status "draft | rolling | complete | halted"
        int rollout_percent
    }
    notifications {
        uuid id PK
        uuid stable_id "stables"
        text channel "sms | email"
        uuid recipient_user_id "users"
        text template
        jsonb params
        uuid related_flag_id "horse_flags"
        text status "pending | sent | failed | cancelled"
        timestamptz sent_at
    }
    audit_log {
        uuid id PK
        uuid stable_id "stables"
        text service
        text actor_type "user | device | operator | system"
        uuid actor_id
        text action
        text entity_type
        uuid entity_id
        jsonb changes "przed i po"
        timestamptz created_at
    }
    boxes
    users
    horse_flags
    devices ||--o{ device_commands : "komendy"
    devices ||--o{ device_alerts : "alerty"
    boxes ||..o| board_states : "stan tablicy"
    files ||..o| app_releases : "APK w S3"
    users ||..o{ notifications : "odbiorca"
    horse_flags |o..o{ notifications : "dotyczy"
```
