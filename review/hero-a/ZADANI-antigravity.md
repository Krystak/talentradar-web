# Zadání pro Antigravity: hero video „Váš klient nabírá“ (scénář A, krátká verze)

Napsal Claude 14. 11. 2026, scénář schválil Kryštof (verze 3: jen přehled na Domově, pohled **7 dní**, bez odbočky do Databáze rolí; Kryštof: „at tam dá poslednich 7 dni … takze to muzeme natacet i ted“). Antigravity natáčí, Claude výstup zkontroluje a zapojí do webu. **Do gitu webu nic necommituj a nic nepushuj**: výstup odevzdej do složky (bod 7).

## 1. Proč se točí znovu

Současné hero (`public/video/hero.*.60.mp4`, V3 z 13. 11.) se seká. Za 15,8 s má jen **98 různých snímků (asi 6 za sekundu)**, přestože je kódované na 30 fps. Původní záběr z kitu z 12. 11. jich měl 374 v 60 fps. Při ořezu na 6:5 se video poskládalo ze statických snímků. **Tohle se nesmí opakovat:** nový klip musí vzniknout jako plynulý záběr v 60 fps z kitu, ne přestřihem ani skládáním hotových MP4 nebo PNG.

Navíc nemá příběh: tři nesouvisející scény (přehled, kontakty, e-mail). Nový klip vypráví jednu věc.

## 2. Jediná věc, kterou má majitel agentury pochopit

**Otevře TalentRadar a vidí: „můj klient vypsal novou roli, mám důvod mu zavolat. A tady je ten skutečný inzerát na webu firmy.“**

V klipu proto **není**: Databáze rolí (dlouhá tabulka), detail role s AI výcucem (ten ukazuje kapitola 1 níž na stránce), oslovení ani e-mail. Přepínač 24 h / 7 dní / 30 dní se nepřepíná: od začátku je **7 dní** (výchozí pohled Domova).

## 3. Scénář krok po kroku (CS, ukázka `https://app.talentradar.eu/?demo=showcase`)

Popisky jsou přesně z aplikace, ověřené Claudem v živém demu 14. 11.

| # | Čas (cíl) | Co se děje na obrazovce | Kamera | Titulek pod videem |
|---|---|---|---|---|
| 1 | 0,0–4,0 s | **Domov**, aktivní pohled **7 dní**, pás čísel (14. 11.: „160 nových rolí, z toho 23 u klientů“) a pod ním „Firmy s novými rolemi · posledních 7 dní“ se skupinou **Aktivní klienti** nahoře. Kurzor v klidu. Pozdrav („Dobré ráno / odpoledne“) může být v rámu jakýkoli, titulky denní dobu nezmiňují. | celek horní části Domova, pomalý nájezd na pás čísel | `cue_hero_1` |
| 2 | 4,0–9,5 s | Klik na filtr **„K Aktivní klienti“**. Tabulka se zúží na klienty. Klik na řádek vybraného klienta (bod 4), rozbalí se jeho nové role s odznakem CORE, lokalitou, **datem a časem, kdy role přibyla** (14. 11. u Productboardu „12.11. 06:01“) a řádek **„Zdroj: kariérní stránka“**. | nájezd na rozbalený řádek klienta, název role a datum musí jít přečíst | `cue_hero_2` |
| 3 | 9,5–15,0 s | Kurzor na **ikonu otevření inzerátu** (`open_in_new`) u nové role a klik. Otevře se skutečná stránka inzerátu na webu nebo ATS firmy. **Nahoře musí být vidět adresa** (proužek adresy z kitu, `rec.py` `_addr_strip`), jinak to vypadá jako maketa. Krátký nájezd na doménu a nadpis, který sedí s názvem role v aplikaci. | nájezd na adresu a nadpis | `cue_hero_3` |
| 4 | 15,0–16,0 s | Návrat do aplikace a plynulé prolnutí do prvního snímku (smyčka). | – | – |

Délka 15–17 s. Mezi kliky nech aspoň 0,8 s klidu, ať se to dá přečíst. Kurzor viditelný, pohyby jako v kitu (`MOVE = .65`, `ease_out`).

### Titulky (do `src/i18n/cs.json` a `en.json` je zapíše Claude)

| Klíč | CS | EN |
|---|---|---|
| `cue_hero_1` | Na první pohled: kdo z vašich firem nově nabírá. | At a glance: which of your companies are hiring. |
| `cue_hero_2` | Váš klient vypsal novou roli. Máte důvod zavolat. | Your client posted a new role. A reason to call. |
| `cue_hero_3` | A tady je ten inzerát, přímo na webu firmy. | And here's the posting, on the company's own site. |

Titulky schválil Kryštof ve verzi s „od včera“; po přechodu na 7 dní je Claude upravil tak, aby netvrdily „včera“ ani „ráno“. Kryštof je ještě uvidí.

Do obrazu žádný text nepřidávej (titulky dělá web). Odevzdej časy začátků scén 1–3 (pro `cues[].at` v `src/data/media.json`), zvlášť pro široký a telefonní řez.

## 4. Kterou firmu a roli vzít

Data jsou živá. Před natáčením projdi kandidáty a vezmi prvního, který splní **všechno**. U každého odmítnutého zapiš proč.

**Pořadí:** aktivní klienti v pohledu 7 dní. 14. 11. to byli **Productboard** (2 nové, kariérní web productboard.com, role „Head of Product, AI (London / Dublin / Prague)“, ověřeno Claudem, že odkaz vede na productboard.com/careers), **Ataccama** (Lever), **GoodData** (Ashby). Když neprojde žádný aktivní klient, zapiš proč a zastav se: Claude rozhodne s Kryštofem.

Pravidla:
1. Firma má v pohledu **7 dní** aspoň jednu novou roli s odznakem **CORE**, IT nebo produktovou (ukázka je IT agentura).
2. Ikona inzerátu vede na **kariérní web nebo ATS firmy**, **ne na Jobs.cz, Teamio ani jiný portál**. Řádek „Zdroj:“ v rozbalené firmě to napoví, ale rozhoduje adresa odkazu.
3. Stránka inzerátu: HTTP 200, nadpis sedí s názvem role v aplikaci, v rámu **žádný e-mail, telefon, jméno ani fotka náboráře**, **žádná lišta cookies v rámu**. Lištu cookies neodklikávej a ochranu proti botům neobcházej. Když se lišta ukáže, kandidát neprojde. Přesně tohle kontroluje kit `k3/inzerat.py`, použij ho.
4. Rozbalený řádek firmy se vejde do rámu i na telefonu (ne víc než 3–4 role, ať je řádek čitelný).

**Kdy:** klidně **hned** (Kryštof 14. 11.). Poslední sken byl 14. 11. ve 12:00, další je až 15. 11. v 6:00, takže data se do té doby nezmění a CS i EN budou mít stejná čísla. Kit má pojistku `zive_okno()` v `k3/k3.py`, která živý záběr (`--zive`) pustí jen 6:00–12:00 v den ranního skenu. Pro tenhle záběr ji **obejdi jen pro hero** (např. proměnnou prostředí, ne smazáním), protože důvod pojistky (všechny klipy ze stejných dat) tady neplatí: točí se jen hero. Živý záběr ulož jako HAR a všechny další zkoušky a EN dělej z něj, ať jsou data stejná. Kdyby záběr přešel přes 6:00 15. 11., začni znovu z jednoho HAR.

## 5. EN verze

Stejný scénář v anglickém rozhraní (přepínač **ENG** vlevo dole v aplikaci), stejný den, stejná firma a role jako CS. Anglické popisky (filtr, pozdrav, ikona) ověř sondou před záběrem, z hlavy je nepiš.

## 6. Technické požadavky na výstup

- **Natáčení:** kit v app repu `docs/audity/2026-10-31_web-redesign/podklady/kit/` (`rec.py`: 60 fps a virtuální kamera; `k3/k3.py`: přehrávání z HAR; `k3/inzerat.py`: kontrola inzerátu; `encode.py`: kódování). Meziprodukt bezztrátově (FFV1, 60 fps) jako dosud.
- **Řezy:**
  - široký 6:5: `hero.{cs,en}.2048.60.mp4` (2048 × 1706, limit 7 MB) a `hero.{cs,en}.1440.60.mp4` (1440 × 1200, limit 4,5 MB),
  - telefon 4:5: `hero-mobile.{cs,en}.1080.60.mp4` (1080 × 1350, limit 2,5 MB), **vlastní dráha kamery s větším přiblížením**, ne jen ořez širokého řezu,
  - plakáty: `hero.{cs,en}.1920.webp`, `hero-mobile.{cs,en}.1080.webp` (první snímek klipu).
- **Kódování:** H.264, **skutečných 60 fps** (`r_frame_rate=60/1`), CRF kolem 22, BT.709 jako dosud. Smyčka bez cuknutí (poslední snímek navazuje na první).
- **Bez osobních údajů:** jen data dema; vymyšlení lidé dema nesmí být v rámu ve velkém detailu. Na stránce inzerátu viz bod 4.3.

## 7. Odevzdání

Složka `C:\Users\Kryštof\tr-web-redesign-podklady\media\hero-a-<datum>\` s:
- 6 MP4 a 4 WebP podle bodu 6,
- `casy.json`: začátky scén 1–3 pro široký a telefonní řez, CS i EN,
- `zaber.md`: datum a čas záběru, vybraná firma a role, adresa inzerátu, výsledek `inzerat.py`, `ffprobe` všech MP4 (rozměr, fps, datový tok, velikost), proč neprošli předchozí kandidáti,
- kontaktní list (1 snímek za sekundu) pro každý řez.

## 8. Jak to Claude zkontroluje (ať víš předem)

1. `ffprobe`: rozměry, `60/1`, velikosti v limitech.
2. **Plynulost:** `ffmpeg -vf mpdecimate` spočítá různé snímky. V pohybu (přejezdy kamery, kliky) musí být prakticky každý snímek jiný, celkem čekám **řádově stovky různých snímků, ne desítky**. Zastavení delší než 1,5 s jen tam, kde je klid na čtení.
3. Prohlídka na webu ve 1920, 1440 a 390 px: spuštění, nic useknutého, titulky sedí na scény.
4. Pohled je 7 dní, v rámu je vidět doména firmy (ne portál) a nadpis inzerátu sedí s rolí v aplikaci.
