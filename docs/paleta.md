# EQUENOR: paleta kolorów

> Wersja 2026-10-13 (znak słowny EQUENOR). Paleta „Len, koniak i cegła”: ciepła, stonowana, z mocnymi rolami kolorów. Tak wyglądają makiety: [kanwas](https://claude.ai/artifact/SjdCnhTF5eqXy2vRaSMUtX).
> Kontrasty liczone skryptem (WCAG): tekst ≥ 4,5:1, duże elementy i obrysy kontrolek ≥ 3:1. Statusy sprawdzone w symulacji deuteranopii i protanopii.

## Ekrany LCD: apka, panel web, wyświetlacz TV

| Token | Kolor | Do czego |
|---|---|---|
| `bg` | `#F3ECE2` | tło strony (len), tło wolnego boksu |
| `surface` | `#FFFCF7` | karty, kafle TV, pola formularzy |
| `sand` | `#EDE3D5` | wnęki ikon, awatary, plakietki numeru boksu, chipy neutralne i info |
| `accent-soft` | `#F3E2D0` | stan wybrany, miękka akcja |
| `line` | `#E0D3C2` | obramowania kart, separatory (1 px) |
| `line-strong` | `#B9A791` | tylko linie przerywane (wolny boks, posiłek „później”) |
| `line-input` | `#907D6A` | obrys pól, wyszukiwarki, selecta, przycisków drugorzędnych, filtrów, checkboxów |
| `ink` | `#2E241D` | tekst główny, zegar, liczby, tło plakietki numeru boksu |
| `ink-2` | `#5C4E43` | tekst drugorzędny, ikony dekoracyjne |
| `accent` | `#8A5230` | koniak: przycisk główny, linki, aktywna nawigacja, fokus |
| `accent-strong` | `#6B3A1E` | hover i wciśnięcie akcentu |
| `on-accent` | `#FFFCF7` | tekst na akcencie |
| `ok-text` / `ok-tint` / `ok-line` | `#2D523D` / `#D4EADC` / `#407658` | podane, potwierdzona |
| `warn-text` / `warn-tint` / `warn-tint-weak` / `warn-line` | `#664810` / `#F6E3B7` / `#FCF4E2` / `#8C6014` | niepotwierdzona, uwaga |
| `crit-text` / `crit-tint` / `crit-line` | `#71251A` / `#EFCBBF` / `#86301F` | krytyczna, wstrzymane |
| `crit-solid` + `on-crit` | `#86301F` + `#FFFCF7` | pełne pole flagi krytycznej (jedyne ciemne pole statusu) |

Nakładka pod modalem: `rgba(46,36,29,0.40)`. Cień karty (tylko apka i panel): `0 1px 2px rgba(46,36,29,.06), 0 4px 12px -6px rgba(46,36,29,.14)`.

Opcje akcentu (tweak), z kolorem hover: Koniak `#8A5230`/`#6B3A1E` (domyślny), Orzech `#665A40`/`#52462D`, Wrzos `#744A5A`/`#623949`, Porost `#5E5B40`/`#464329`.

### Zasady

- **Znak słowny „EQUENOR”:**
  - zawsze wersalikami, rozstrzelony 0,16 em (`letter-spacing: 0.16em`), waga 700;
  - cały w `ink`; na ciemnym tle w `#FFFCF7`; na tablecie w `t-ink` (czarny);
  - bez akcentu, bo znak nie jest elementem klikalnym;
  - w zdaniach marka to „EQUENOR”, nieodmienna („w EQUENOR”, „do EQUENOR”).
- **Hasło „Equestrian Management, Refined”:**
  - zawsze pod znakiem, nigdy obok; odstęp od znaku 2–6 px;
  - ok. 0,45–0,55 rozmiaru znaku, co najmniej 11 px na LCD i 16 px na tablecie; waga 500; zwykłe litery, bez wersalików i rozstrzelenia;
  - w `ink-2`; na tablecie w `t-ink-2` (gdy ma ≥ 20 px) albo w `t-ink`;
  - tylko tam, gdzie znak jest wizytówką: ekrany logowania (apka, panel web, wyświetlacz TV, tablet), nagłówek i stopka strony www;
  - w kompaktowych nagłówkach apki, panelu i TV sam znak, bez hasła.
- **Akcent tylko na elementach klikalnych:** jeden przycisk główny na widok, linki tekstowe (z podkreśleniem), aktywna nawigacja, fokus. Nigdy na nagłówkach, liczbach, statusach. Na TV bez pól w akcencie.
- **Kolor niosą tylko trzy statusy:** OK, uwaga, krytyczna. Info (leki, wet) jest neutralne: piasek i ikona typu.
- **Każdy status ma trzy sygnały naraz:** ikonę, słowo i jasność albo polaryzację pola. Kolor nigdy nie występuje sam.
- **Krytyczna:**
  - jako pełne ciemne pole z jasnym tekstem: kafel TV i pigułka w panelu;
  - w apce: jasny tint z lewym paskiem 4 px;
  - chip krytyczny zawsze ma obrys 1,5 px.
- **Gdzie stoją chipy statusów:** na karcie albo tle, nigdy na piasku, bo przy protanopii zlewają się z nim.
- **Kafle TV:**
  - krytyczny: ramka 3 px `crit-line`;
  - niepotwierdzony: ramka 3 px `warn-line` na `warn-tint-weak`;
  - wolny: 2 px przerywana `line-strong` na `bg`.
- **Liczby i zegar** mają `font-variant-numeric: tabular-nums`.

## Tablet e-ink: kolorowy (Kaleido 3, Gallery 3) albo czarno-biały

| Token | Kolor | Szarość (0–255) | Do czego |
|---|---|---|---|
| `t-paper` | `#FFFFFF` | 255 | tło, karty, popup, tekst na `t-crit` i `t-ink` |
| `t-ok` | `#ACDA9D` | 204 | pole OK / zrobione dziś, czarny tekst, ramka 2 px |
| `t-line` | `#ABABAB` | 171 | wewnętrzne linie tabel i list, nigdy wypełnienie |
| `t-warn` | `#D28A21` | 146 | pole niepotwierdzone / zaległe / OFFLINE, czarny tekst, ramka 4 px |
| `t-scrim` | `#6E6E6E` | 110 | nieprzezroczyste tło pod popupem |
| `t-crit` | `#9E2A1C` | 66 | pole krytyczne (baner flagi, WSTRZYMANE, pasek popupu), tylko biały pogrubiony tekst ≥ 19 px |
| `t-ink-2` | `#404040` | 64 | tekst drugorzędny ≥ 20 px, tylko na papierze |
| `t-ink` | `#000000` | 0 | tekst, ikony, ramki, przycisk główny, wybrany boks |

Profil Gallery 3, który podmienia apka tabletu: `t-ok` `#B4D6A9`, `t-warn` `#C5904E`, `t-crit` `#8F3C30` (mniej nasycone przy tej samej jasności).

### Zasady tabletu

- **Kolor tylko w dużych polach:** baner flagi, komórki tabeli, kafle (≥ 44 px), pasek popupu 16 px, lewy pasek ≥ 10 px. Bez kolorowego tekstu, ikon, cienkich linii i obrysów. Kaleido 3 ma kolor w 150 ppi, czyli dwa razy rzadziej niż czerń.
- **Tekst na kolorze:** na kolorze tylko czarny (na `t-ok` i `t-warn`) albo biały (na `t-crit`), zawsze pogrubiony. Szary tekst na kolorze jest zakazany.
- **Neutralne kolory tylko achromatyczne** (R = G = B). Ciepłe szarości Kaleido rozbija na kolorowe ziarno.
- **Ten sam ekran działa na czarno-białym e-inku:**
  - drabina jasności papier 255, OK 204, uwaga 146, krytyczna 66, atrament 0 daje co najmniej 3 poziomy odstępu na 16;
  - drugim sygnałem jest grubość obrysu: krytyczna to ciemne pole bez ramki, uwaga ramka 4 px, OK 2 px, do zrobienia 2 px przerywana.
- **Info (leki, wet) bez wypełnienia:** papier, ramka 2 px i ikona.
- **Bez szarych wypełnień w roli struktury:** nagłówki tabel i tło są białe, sekcje oddziela czarna linia. W trybie czarno-białym szare pole zawsze oznacza status.
- **Odświeżanie:**
  - pole koloru zmienia się tylko przy zmianie statusu, jednym pełnym odświeżeniem;
  - zegar, odliczanie i pasek ONLINE są czarno-białe i korzystają z szybkiego odświeżania, bo szybkie tryby gubią kolor;
  - bez animacji.
- **Do sprawdzenia na sprzęcie:** kolejność jasności i czytelność bieli na `t-crit` na prawdziwym Kaleido 3, Gallery 3 i panelu czarno-białym, bo sterownik ma własną krzywą i dithering.
