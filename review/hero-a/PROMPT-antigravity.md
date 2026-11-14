# Prompt pro Antigravity: nové hero video TalentRadaru (natočit, zapojit do webu, ukázat lokálně)

Komunikuj česky. Tenhle prompt je samostatný: nepředpokládá, že víš cokoli z dřívějška.

## 0. O co jde a jak spolupracujeme

**TalentRadar** je SaaS pro personální agentury v Česku a na Slovensku. Každé ráno hlídá kariérní stránky a ATS firem, se kterými agentura pracuje, a ukáže, kdo z nich nově nabírá a komu zavolat. Majitel je **Kryštof**. Web je **talentradar.eu** (statický web na Cloudflare Workers), aplikace je **app.talentradar.eu**, veřejná ukázka je `https://app.talentradar.eu/?demo=showcase`.

Na úvodní stránce webu je nahoře **hero video** (smyčka bez zvuku vpravo od nadpisu). Současné se seká a nemá příběh. Tvým úkolem je **natočit nové podle scénáře, zapojit ho do webu na vlastní větvi a ukázat ho lokálně**.

**Role:**
- **Ty (Antigravity)** děláš všechno: natočení, kódování, zapojení do webu, testy, lokální náhled, screenshoty, commit na své větvi.
- **Claude** (jiná AI session u Kryštofa) tvou práci zkontroluje: soubory, čísla, web na localhostu. Pak napíše zpětnou vazbu (co je v pořádku, co opravit a jak), kterou ti Kryštof předá.
- **Kryštof** rozhoduje o vydání.

**Tvrdá pravidla:**
- **Nic nepushuj**, nic neslučuj do `master` a nic nenasazuj. Commituj jen lokálně na svou větev (bod 2).
- V app repu (`C:\Users\Kryštof\Talent-radar`) **nic neměň** a nepřepínej větve: jen z něj čti (bod 2.2).
- Ochranu webů proti botům neobcházej a lišty cookies neodklikávej (bod 4.3 zadání).
- Když něco nesedí s tím, co v aplikaci uvidíš, nebo neprojde žádný kandidát, **zastav se a napiš proč**. Nic si nedomýšlej.

## 1. Co přesně natočit

Celý scénář, výběr firmy, titulky a technické požadavky jsou v **zadání**. Přečti ho celé, než začneš:

`C:\Users\Kryštof\talentradar-web\.claude\worktrees\web-hero-srovnani-a2117e\review\hero-a\ZADANI-antigravity.md`

(Po založení tvého worktree, bod 2.1, je stejný soubor i u tebe v `review\hero-a\ZADANI-antigravity.md`.)

Ve zkratce, asi 15 s: **Domov v pohledu 7 dní → filtr „K Aktivní klienti“ → rozbalit klienta (Productboard) → klik na ikonu inzerátu → skutečná stránka inzerátu na webu firmy s viditelnou adresou → zpět, smyčka.** Titulky přidá web, do obrazu nic nepiš.

**Proč se současné seká (neopakuj to):** `public/video/hero.cs.1440.60.mp4` má za 15,8 s jen **98 různých snímků** (asi 6 za sekundu), přestože je kódované na 30 fps. Vzniklo skládáním statických snímků. Původní záběr z kitu z 12. 11. měl 374 různých snímků v 60 fps. **Nástroje ve složce `C:\Users\Kryštof\tr-web-redesign-podklady\media\` (`compose.py`, `stills.py`, `body_frames.py` apod.) pro tohle video nepoužívej.** Natáčej kitem z bodu 3.

## 2. Příprava

### 2.1 Web: vlastní worktree a větev

Repo webu: `C:\Users\Kryštof\talentradar-web` (GitHub `Krystak/talentradar-web`, výchozí větev `master` = živý web). Základ pro tebe je **lokální** větev `claude/web-hero-srovnani-a2117e`. Na GitHubu není, existuje jen v tomhle repu. Obsahuje hero V3 sloučené se stránkou Srovnání, zadání a pomocné skripty. Založ si z ní vlastní worktree:

```
git -C C:\Users\Kryštof\talentradar-web worktree add C:\Users\Kryštof\tr-web-hero-a -b design/hero-a-2026-11 claude/web-hero-srovnani-a2117e
```

Dál pracuješ jen v `C:\Users\Kryštof\tr-web-hero-a`. Do worktree `...\.claude\worktrees\web-hero-srovnani-a2117e` nesahej (je Claudův).

Jak web funguje:
- Zdroj je `src/`, `public/` je vygenerovaný výstup přes `node build.mjs`. Ručně v `public/` nic neupravuj, kromě videí, která tam dá `media:use`.
- Videa a titulky popisuje `src/data/media.json`. Klip `hero` má široký řez (`sources`), telefonní řez (`mobile`) a titulky `cues` (`at` = sekunda začátku, `at_mobile` = totéž pro telefon, `key` = klíč textu).
- Texty jsou v `src/i18n/cs.json` a `src/i18n/en.json` (klíče `cue_hero_1` až `cue_hero_3`).
- Pod videem je věta „Natočeno … ve veřejném demu“ s datem z `clip_date` klipu.
- Testy: `npm test`. Kontrola před vydáním: `npm run check:release`. Žádné `npm install` není potřeba.

### 2.2 Natáčecí kit

Kit je v app repu na `origin/main` ve složce `docs/audity/2026-10-31_web-redesign/podklady/kit/`. Vznikl na jiném PC (cesty `C:\Users\Krystak\...`) a tady ještě rozbalený není. Vyndej ho bez přepínání větve app repa:

```
mkdir C:\Users\Kryštof\tr-web-redesign-podklady\kit
git -C C:\Users\Kryštof\Talent-radar fetch origin
git -C C:\Users\Kryštof\Talent-radar archive -o C:\Users\Kryštof\tr-web-redesign-podklady\kit.tar origin/main:docs/audity/2026-10-31_web-redesign/podklady/kit
tar -xf C:\Users\Kryštof\tr-web-redesign-podklady\kit.tar -C C:\Users\Kryštof\tr-web-redesign-podklady\kit
mkdir C:\Users\Kryštof\tr-web-redesign-podklady\pilot
```

(`env.py` počítá s `pilot\` vedle `kit\` a s `kit\build\`.)

Prostředí na tomhle PC (ověřeno 14. 11.):
- **Python:** `C:\Users\Kryštof\Talent-radar\.venv\Scripts\python.exe`, má Playwright i PIL.
- **Chromium:** `env.py` má natvrdo `ms-playwright\chromium-1243`, tady je jen **`chromium-1228`** (`%LOCALAPPDATA%\ms-playwright\chromium-1228\chrome-win64\chrome.exe`). Uprav cestu ve své kopii kitu, nejlépe přes proměnnou prostředí.
- **ffmpeg a ffprobe** jsou v PATH (winget, verze 9).
- Mezi skripty jsou staré cesty `C:\Users\Krystak\...` (např. `retez_*.sh`). Ty nepoužívej, pouštěj skripty přímo.

Než začneš upravovat, přečti v kitu: `predavka.md`, `k3/strih-2026-11-12.md`, hlavičky `rec.py`, `k3/k3.py`, `k3/inzerat.py`, `k3/v1d_k3_eo5.py` a `k3/v1_tel_k3.py`.

## 3. Natočení

**Základ:** hero z 12. 11. natočil skript **`k3/v1d_k3_eo5.py`** (široký řez) a **`k3/v1_tel_k3.py`** (telefon). Dělají skoro přesně náš scénář: klik na firmu na Domově, rozbalení, šipka na ikonu inzerátu, okno inzerátu roste, světlo na nadpis a logo, okno se zmenší, sbalení, smyčka. Natáčí v **60 fps s virtuální kamerou** (`rec.py`). Udělej z nich kopie (např. `k3/va_k3.py` a `k3/va_tel_k3.py`) a uprav je. Původní soubory nech být.

Co změnit (podrobně v zadání, body 3 a 4):
1. **Bez prospektů a bez druhého klienta.** Po celku klik na čip **„K Aktivní klienti“** (v EN „C“ + anglický popisek, ověř sondou), rozbalit **jednoho** klienta, ikona inzerátu, inzerát, zpět, sbalit, klik na čip „Vše“ (EN „All“), aby poslední snímek = první.
2. **Pohled 7 dní** (výchozí na Domově), žádné `--24h`.
3. **Výběr inzerátu** přes `inzerat.vyber` a jeho pravidla, ale „role nalezena dnes“ nahraď „role nová v pohledu 7 dní“. Navíc pravidlo: adresa inzerátu **nesmí být Jobs.cz, Teamio ani jiný portál**. Pořadí kandidátů: Productboard → Ataccama → GoodData.
4. **Živý záběr** (`--zive`) má pojistku `zive_okno()` (jen 6:00–12:00 v den ranního skenu). Pro tenhle záběr ji **obejdi jen ve své kopii** (proměnná prostředí, ne smazání), protože poslední sken byl 14. 11. ve 12:00 a další je 15. 11. v 6:00: data se do té doby nemění. Živý záběr uloží HAR. **Všechny další zkoušky a EN natáčej z toho jednoho HAR**, ať je všude stejné číslo. Kdyby záběr přešel přes 6:00 15. 11., začni znovu.
5. **Rám 6:5 (široký) a 4:5 (telefon).** Web dnes zobrazuje hero v poměru 6:5, původní kit dělal 16:10. Buď nastav výstup kitu rovnou na 6:5 (2048 × 1706), nebo ořízni **bezztrátový 60fps meziprodukt** ffmpegem (`crop` + `scale`). Kamera ale musí držet děj uvnitř 6:5 rámu. Telefon má vlastní dráhu kamery s větším přiblížením (`v1_tel_k3.py`).
6. **Kódování** jako v kitu (`encode.py`, `k3/kodovat_eo5.sh` jako vzor): H.264, **skutečných 60 fps**, CRF kolem 22, BT.709, limity velikosti ze zadání (bod 6).

**Vlastní kontrola před zapojením** (Claude udělá totéž):

```
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,bit_rate,duration -of default=nw=1 <soubor>
ffmpeg -i <soubor> -vf mpdecimate,showinfo -f null - 2>&1 | grep -c "pts_time:"
```

Druhý příkaz spočítá různé snímky. U 15s klipu v 60 fps čekám **stovky**. Když vyjdou desítky, je něco špatně a nezapojuj to.

Výstup dej do `C:\Users\Kryštof\tr-web-redesign-podklady\media\hero-a-<datum>\` podle bodu 7 zadání: MP4, WebP, `casy.json`, `zaber.md`, kontaktní listy.

## 4. Zapojení do webu (ve svém worktree `C:\Users\Kryštof\tr-web-hero-a`)

1. **`src/data/media.json`, klip `hero`:**
   - `cues` = 3 položky `cue_hero_1` až `cue_hero_3` s `at` a `at_mobile` z `casy.json`,
   - `clip_date` a `mobile.clip_date` = den záběru (`YYYY-MM-DD`),
   - názvy souborů a rozměry zůstávají (`hero.{lang}.2048.60.mp4` 2048 × 1706, `hero.{lang}.1440.60.mp4` 1440 × 1200, `hero-mobile.{lang}.1080.60.mp4` 1080 × 1350, plakáty `.webp`).
2. **Texty `cue_hero_1` až `cue_hero_3`** v `src/i18n/cs.json` a `en.json` přesně podle tabulky v zadání (bod 3).
3. **Videa na místo:** `npm run media:use -- C:\Users\Kryštof\tr-web-redesign-podklady\media\hero-a-<datum> --keep-rest`. Kopíruje jen soubory, které `media.json` jmenuje, zkontroluje rozměry, délky a limity, přestaví web a pustí kontrolu. Při chybě vrátí všechno zpět. Přečti si hlavičku `tools/media-use.mjs`.
4. **`npm test`** a **`npm run check:release`**. Zapiš přesné počty: testy (pass/fail/skip), soubory, chyby, varování. Pro srovnání: základní větev má 304 testů, 303 pass / 0 fail / 1 skip, `check:release` 38 souborů, 0 chyb, 0 varování.

## 5. Lokální náhled a screenshoty

`wrangler` tu není nainstalovaný. Ve větvi je jednoduchý server:

```
node review/hero-a/serve.mjs public 8831
```

Web pak běží na `http://127.0.0.1:8831/` (CS) a `http://127.0.0.1:8831/en/` (EN). Server nech běžet, Claude se na něj podívá.

Screenshoty a stav videa udělá `review/hero-a/shoot.mjs` (headless Chrome přes CDP, Chrome je v `C:\Program Files\Google\Chrome\Application\chrome.exe`). Spustíš ho `node review/hero-a/shoot.mjs review <jobs.json>`, kde `jobs.json` je pole `{path, w, h, out, wait, scrollTo?}`. Udělej CS i EN v **1920×1080, 1440×900 a 390×844**. U 390 i druhý snímek se `scrollTo: ".hero__media"`. Snímky ulož do `review/hero-a/shots/`. Výpis skriptu (u videí `paused`, `t`, poměr boxu vs. videa, `overflowX`, chyby JS) ulož jako `review/hero-a/shots/stav.json`.

Ověř: video na desktopu po načtení hraje (`paused: false`, `t` roste), poměr boxu = poměr videa, žádný horizontální přetok, žádné chyby JS, titulky odpovídají scénám.

## 6. Commit a hlášení

Commituj na `design/hero-a-2026-11` po logických krocích, **bez pushe**:
1. videa + `media.json` + texty titulků,
2. screenshoty a `review/hero-a/shots/stav.json`, kopie `zaber.md` do `review/hero-a/`.

Commity zakonči řádkem `Co-Authored-By:` podle svého nastavení (nebo bez něj).

Na konci napiš Kryštofovi krátké hlášení, které předá Claudovi:
- hash commitů a cesta k worktree,
- vybraná firma a role, adresa inzerátu, proč případně neprošli předchozí kandidáti,
- `ffprobe` všech MP4 a počet různých snímků (mpdecimate),
- výsledky `npm test` a `check:release` s čísly,
- že běží `http://127.0.0.1:8831/`,
- co nevyšlo nebo co jsi musel obejít, a proč.
