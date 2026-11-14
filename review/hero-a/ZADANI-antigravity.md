# Zadání pro Antigravity: hero video „Váš klient nabírá“ (scénář A)

Napsal Claude 14. 11. 2026 (scénář vybral Kryštof). Antigravity natáčí, Claude zkontroluje výstup a zapojí ho do webu. **Do gitu webu nic necommituj a nic nepushuj**: výstup odevzdej do složky (viz bod 7).

## 1. Proč se točí znovu

Současné hero (`public/video/hero.*.60.mp4`, V3 z 13. 11.) se seká. Za 15,8 s má jen **98 různých snímků (asi 6 za sekundu)**, přestože je kódované na 30 fps. Původní záběr z kitu z 12. 11. jich měl 374 v 60 fps. Při ořezu na 6:5 se video poskládalo ze statických snímků. **Tohle se nesmí opakovat:** nový klip musí vzniknout jako plynulý záběr v 60 fps, ne přestřihem ani skládáním hotových MP4 nebo PNG.

Navíc nemá příběh: tři nesouvisející scény (přehled, kontakty, e-mail). Nový klip vypráví jednu věc.

## 2. Co má divák (majitel agentury) pochopit za 20 s

1. Týká se to **jeho** firem (klientů), ne obecného trhu.
2. Je to **skutečné**: role vede na opravdový inzerát na webu firmy.
3. Ví, **odkud a od kdy** ta role je.

Oslovení a e-mail v tomhle klipu **nejsou** (patří do kapitoly níž na stránce).

## 3. Scénář krok po kroku (CS, ukázka `https://app.talentradar.eu/?demo=showcase`)

Ověřeno Claudem v živém demu 14. 11. odpoledne. Popisky jsou přesně z aplikace.

| # | Čas (cíl) | Co se děje na obrazovce | Kamera | Titulek pod videem |
|---|---|---|---|---|
| 1 | 0,0–3,5 s | **Domov**: pozdrav „Dobré ráno“, pás čísel (nových rolí, z toho u klientů, CORE, firem nabírá) a tabulka „Firmy s novými rolemi“. Kurzor v klidu. | celek horní poloviny Domova, pomalý nájezd na pás čísel | `cue_hero_1` |
| 2 | 3,5–7,5 s | Klik na filtr **„K Aktivní klienti“**. Tabulka se zúží na klienty. Klik na řádek **Productboard**, rozbalí se jeho nové role (2 role s odznakem CORE) a řádek **„Zdroj: kariérní stránka · 13 aktivních rolí celkem“**. | nájezd na tabulku, rozbalený řádek Productboard čitelně | `cue_hero_2` |
| 3 | 7,5–9,5 s | Klik na **„Otevřít Productboard v databázi rolí“**. Otevře se Databáze rolí s filtrem „Firma: Productboard“, nahoře 2 role se stavem **NOVÁ**. | plynulý přechod, celek seznamu | (drží `cue_hero_2`) |
| 4 | 9,5–14 s | Klik na roli **C4328 „Head of Product, AI (London / Dublin / Prague)“**. Zprava vyjede detail: odznaky NOVÁ a CORE, „Productboard · Aktivní klient · Praha, Česká republika · Hybrid“, vpravo nahoře **„Poprvé viděna 12.11.“**, záložka Přehled s **AI výcucem** a klíčovými požadavky. | nájezd na hlavičku detailu (název, „Poprvé viděna“, AI výcuc) | `cue_hero_3` |
| 5 | 14–19 s | Klik na **„Otevřít inzerát“**. Otevře se skutečná stránka `productboard.com/careers/open-positions/head-of-product-ai-…` s nadpisem „Head of Product, AI (London / Dublin / Prague)“ a logem Productboardu. **Nahoře musí být vidět adresa** (proužek adresy z kitu, `rec.py` `_addr_strip`), jinak to vypadá jako maketa. Krátké zvýraznění adresy a nadpisu (ten sedí s názvem v aplikaci). | nájezd na adresu a nadpis | `cue_hero_4` |
| 6 | 19–20 s | Návrat do aplikace a plynulé prolnutí do prvního snímku (smyčka). | – | – |

Celková délka 18–22 s. Mezi kliky nech aspoň 0,8 s klidu, ať se to dá přečíst. Kurzor viditelný, pohyby jako v kitu (`MOVE = .65`, `ease_out`).

### Titulky (do `src/i18n/cs.json` a `en.json` je zapíše Claude)

| Klíč | CS | EN |
|---|---|---|
| `cue_hero_1` | Každé ráno: kdo z vašich firem nabírá. | Every morning: which of your companies are hiring. |
| `cue_hero_2` | Nejdřív nové role u vašich klientů. | New roles at your clients first. |
| `cue_hero_3` | U každé role vidíte, co firma hledá a od kdy. | Every role shows what they need and since when. |
| `cue_hero_4` | Jedním klikem na skutečný inzerát na webu firmy. | One click to the real posting on the company's site. |

Do obrazu žádný text nepřidávej (titulky dělá web). Na konci dej Claudovi časy začátků scén 1, 2, 4 a 5 (pro `cues[].at` v `src/data/media.json`), zvlášť pro široký a telefonní řez.

## 4. Kterou firmu a roli vzít (pravidla, ne jen Productboard)

Data jsou živá a mění se. Productboard / C4328 je doporučená volba z 14. 11. Před natáčením ověř, že pořád platí všechno níže. Když ne, vezmi dalšího aktivního klienta v pořadí **Productboard → Ataccama (Lever) → GoodData (Ashby)** a zapiš, proč předchozí neprošel:

1. Firma je v okruhu **Aktivní klienti** a má aspoň jednu roli se stavem **NOVÁ** a CORE.
2. Odkaz „Otevřít inzerát“ vede na **kariérní web nebo ATS firmy**, **ne na Jobs.cz ani jiný portál**.
3. Stránka inzerátu: HTTP 200, nadpis sedí s názvem role v aplikaci, v rámu **žádný e-mail, telefon, jméno ani fotka náboráře**, **žádná lišta cookies v rámu**. Lištu cookies neodklikávej a ochranu proti botům neobcházej. Když se lišta ukáže, kandidát neprojde. Přesně tohle kontroluje kit `k3/inzerat.py`, použij ho.
4. Role je IT nebo produktová (ukázka je IT agentura).

**Den a čas:** v sobotu 14. 11. neměl za 24 h žádný aktivní klient novou roli. Natáčej proto ve **všední den v okně 6:00–12:00** (kit: `zive_okno()` v `k3/k3.py`, živý záběr přes `--zive`, pak zkoušky z uloženého HAR), aby byl pozdrav „Dobré ráno“ a data z ranního skenu. Na Domově použij přepínač **24 h**, pokud v něm má vybraný klient novou roli, jinak **7 dní**. Titulky období nezmiňují, sedí na obojí.

## 5. EN verze

Stejný scénář v anglickém rozhraní (přepínač **ENG** vlevo dole v aplikaci). Anglické popisky ověř sondou před záběrem, z hlavy je nepiš (např. kapitola 1 má „Role database“). Stejná firma a role jako CS, pokud projde pravidly.

## 6. Technické požadavky na výstup

- **Natáčení:** kit v app repu `docs/audity/2026-10-31_web-redesign/podklady/kit/` (`rec.py` 60 fps a virtuální kamera, `k3/k3.py` přehrávání z HAR, `k3/inzerat.py` kontrola inzerátu, `encode.py` kódování). Meziprodukt bezztrátově (FFV1, 60 fps) jako dosud.
- **Řezy:**
  - široký 6:5: `hero.{cs,en}.2048.60.mp4` (2048 × 1706, limit 7 MB) a `hero.{cs,en}.1440.60.mp4` (1440 × 1200, limit 4,5 MB),
  - telefon 4:5: `hero-mobile.{cs,en}.1080.60.mp4` (1080 × 1350, limit 2,5 MB), **vlastní dráha kamery s větším přiblížením**, ne jen ořez širokého řezu,
  - plakáty: `hero.{cs,en}.1920.webp`, `hero-mobile.{cs,en}.1080.webp` (první snímek klipu).
- **Kódování:** H.264, **skutečných 60 fps** (`r_frame_rate=60/1`), CRF kolem 22, BT.709 jako dosud. Smyčka bez cuknutí (poslední snímek navazuje na první).
- **Bez osobních údajů:** jen data dema; vymyšlení lidé (např. „Jakub Pokusný“ v historii s firmou) nesmí být v rámu ve velkém detailu. Na stránce inzerátu viz bod 4.3.

## 7. Odevzdání

Složka `C:\Users\Kryštof\tr-web-redesign-podklady\media\hero-a-<datum>\` s:
- 6 MP4 a 4 WebP podle bodu 6,
- `casy.json`: začátky scén 1, 2, 4, 5 pro široký a telefonní řez, CS i EN,
- `zaber.md`: datum a čas záběru, vybraná firma a role, adresa inzerátu, výsledek `inzerat.py`, `ffprobe` všech MP4 (rozměr, fps, datový tok, velikost), proč případně neprošli předchozí kandidáti,
- kontaktní list (např. 1 snímek za sekundu) pro každý řez.

## 8. Jak to Claude zkontroluje (ať víš předem)

1. `ffprobe`: rozměry, `60/1`, velikosti v limitech.
2. **Plynulost:** `ffmpeg -vf mpdecimate` spočítá různé snímky. V pohybu (přejezdy kamery, kliky) musí být prakticky každý snímek jiný, celkem čekám **řádově stovky různých snímků, ne desítky**. Zastavení delší než 1,5 s jen tam, kde je v tabulce klid na čtení.
3. Prohlídka na webu ve 1920, 1440 a 390 px (spuštění, nic useknutého, titulky sedí na scény).
4. Adresa inzerátu: v rámu je vidět doména firmy a nadpis sedí s rolí v aplikaci.
