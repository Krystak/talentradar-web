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

| Soubor | Rozměr | FPS | Bitrate (bps) | Délka (s) | Velikost (MB) | CRF | Různých snímků (`mpdecimate`) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `hero.cs.2048.60.mp4` | 2048×1706 | `60/1` | 2185951 | 15.50 | 4.24 | 22 | 333 |
| `hero.en.2048.60.mp4` | 2048×1706 | `60/1` | 2184217 | 15.50 | 4.24 | 22 | 332 |
| `hero.cs.1440.60.mp4` | 1440×1200 | `60/1` | 1262822 | 15.50 | 2.45 | 22 | 321 |
| `hero.en.1440.60.mp4` | 1440×1200 | `60/1` | 1273212 | 15.50 | 2.47 | 22 | 320 |
| `hero-mobile.cs.1080.60.mp4` | 1080×1350 | `60/1` | 1045916 | 15.50 | 2.03 | 22 | 327 |
| `hero-mobile.en.1080.60.mp4` | 1080×1350 | `60/1` | 1046461 | 15.50 | 2.04 | 22 | 324 |

## WebP plakáty

| Soubor | Rozměr | Velikost (B) |
|---|---:|---:|
| `hero.cs.1920.webp` | 1920×1600 | 108690 |
| `hero.en.1920.webp` | 1920×1600 | 110032 |
| `hero-mobile.cs.1080.webp` | 1080×1350 | 86562 |
| `hero-mobile.en.1080.webp` | 1080×1350 | 87462 |

## Kontaktní listy (1 snímek / s)

- `kontakt-wide-cs.png`
- `kontakt-wide-en.png`
- `kontakt-mobile-cs.png`
- `kontakt-mobile-en.png`
