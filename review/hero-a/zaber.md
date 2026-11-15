# Záběr hero-a (2026-11-14)

- **Datum a čas v aplikaci:** `2026-11-14T09:30:00+01:00` (živá ukázka 14. 11. po skenu ve 12:00, HAR `build/va-zive`)
- **Vybraná firma:** Productboard
- **Vybraná role:** Head of Product, AI (London / Dublin / Prague)
- **URL inzerátu:** https://www.productboard.com/careers/open-positions/head-of-product-ai-london-dublin-prague/am9icG9zdDr4PF8LtUNbm83LqyESDmSx/
- **Konečná URL po přesměrování (`curl`):** https://www.productboard.com/careers/open-positions/head-of-product-ai-london-dublin-prague/am9icG9zdDr4PF8LtUNbm83LqyESDmSx/
- **HTTP status:** 200

## Výběr kandidátů a inzerátu (`inzerat.py`)

Pořadí kandidátů ze zadání (aktivní klienti v pohledu 7 dní): **Productboard → Ataccama → GoodData**.

1. **Productboard** (`Head of Product, AI (London / Dublin / Prague)`) — **vybrán hned jako 1. kandidát**:
   - odkaz vede přímo na kariérní web firmy (`www.productboard.com/careers/...`, ne na portál),
   - `vyber(..., sedm_dni=True, bez_portalu=True)` vrátil **projde**: HTTP 200, H1 = `Head of Product, AI (London / Dublin / Prague)`, PII hits = `[]`, CMP = `False`, velké obrázky = `[]`, rozbalený řádek má jen 2 role (čitelný i na telefonu).
2. **Ataccama** (`Senior Software Engineer, Data Processing`) — nebylo nutné použít jako fallback, protože prošel hned #1 Productboard (`predvyber`: `ok=True`, IT slovo `Software`, URL `https://jobs.lever.co/ataccama/f30f7669-69a1-4575-b522-fb6c1b51e444`).
3. **GoodData** (`Sr. Solution & Product Analyst`) — nebylo nutné použít jako fallback (`predvyber`: `ok=False`, v názvu role není IT klíčové slovo z filtru `inzerat.py`, URL `https://jobs.ashbyhq.com/gooddata/9a49d33f-fa33-47d3-acac-74a348761737`).

Další role v předvýběru u Productboardu:
- `Head of Product, Enterprise Platform (London / Dublin / Prague)` | `ok=True` (IT: `Platform`) | `https://www.productboard.com/careers/open-positions/head-of-product-enterprise-platform-london-dublin-prague/am9icG9zdDohUWYsTQZEDYoBxk2ORuDD/`

## Parametry zakódovaných MP4 (`ffprobe` + `mpdecimate`)

Pomalý nájezd kamery od `0 s` (`smooth`) na tabulku Aktivní klienti + Productboard (široké řezy `--crf=23`, mobilní řezy `--crf=25` kvůli rozpočtu `2,5 MB`).

| Soubor | Rozměr | FPS | Bitrate (bps) | Délka (s) | Velikost (MB) | CRF | Různých snímků (`mpdecimate`) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `hero.cs.2048.60.mp4` | 2048×1706 | `60/1` | 3105531 | 15.50 | 6.03 | 23 | 551 |
| `hero.en.2048.60.mp4` | 2048×1706 | `60/1` | 3095046 | 15.50 | 6.01 | 23 | 551 |
| `hero.cs.1440.60.mp4` | 1440×1200 | `60/1` | 2080848 | 15.50 | 4.04 | 23 | 538 |
| `hero.en.1440.60.mp4` | 1440×1200 | `60/1` | 2100817 | 15.50 | 4.08 | 23 | 542 |
| `hero-mobile.cs.1080.60.mp4` | 1080×1350 | `60/1` | 1219414 | 15.50 | 2.37 | 25 | 523 |
| `hero-mobile.en.1080.60.mp4` | 1080×1350 | `60/1` | 1235129 | 15.50 | 2.40 | 25 | 523 |

### Rozpad `mpdecimate` po sekundách (`s 0..15`)

| Soubor | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `hero.cs.2048.60.mp4` | 59 | 60 | 53 | 45 | 52 | 60 | 27 | 12 | 37 | 10 | 0 | 12 | 31 | 52 | 41 | 0 |
| `hero.en.2048.60.mp4` | 59 | 60 | 53 | 45 | 52 | 60 | 27 | 12 | 37 | 12 | 0 | 12 | 30 | 53 | 39 | 0 |
| `hero.cs.1440.60.mp4` | 59 | 60 | 53 | 43 | 50 | 60 | 26 | 10 | 37 | 9 | 0 | 12 | 29 | 51 | 39 | 0 |
| `hero.en.1440.60.mp4` | 59 | 60 | 53 | 44 | 49 | 60 | 26 | 11 | 37 | 12 | 0 | 12 | 29 | 51 | 39 | 0 |
| `hero-mobile.cs.1080.60.mp4` | 59 | 60 | 52 | 43 | 50 | 54 | 33 | 0 | 37 | 13 | 0 | 12 | 39 | 33 | 38 | 0 |
| `hero-mobile.en.1080.60.mp4` | 59 | 60 | 53 | 43 | 50 | 54 | 33 | 0 | 37 | 10 | 1 | 12 | 39 | 33 | 39 | 0 |

## WebP plakáty

| Soubor | Rozměr | Velikost (B) |
|---|---:|---:|
| `hero.cs.1920.webp` | 1920×1600 | 82656 |
| `hero.en.1920.webp` | 1920×1600 | 83708 |
| `hero-mobile.cs.1080.webp` | 1080×1350 | 66036 |
| `hero-mobile.en.1080.webp` | 1080×1350 | 66678 |

## Kontaktní listy (1 snímek / s)

- `kontakt-wide-cs.png`
- `kontakt-wide-en.png`
- `kontakt-mobile-cs.png`
- `kontakt-mobile-en.png`
