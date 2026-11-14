# Texty a zdroje — Srovnání na webu v2

Větev: `design/hero-a-2026-11` (`C:\Users\Kryštof\tr-web-hero-a`)  
Datum ověření ceníků a funkcí konkurence: **14. 11. 2026**  
Přepočty měn („asi“ / „approx.“): **ČNB kurzovní lístek #219 ze dne 13. 11. 2026** (`1 USD = 22,101 Kč`, `1 EUR = 24,425 Kč`, `1 GBP = 29,238 Kč`, `reserse.md`).

---

## 1. Úvodní stránka — kompaktní sekce srovnání (`src/pages/home.html`, `src/i18n/cs.json`, `src/i18n/en.json`)

Kotva sekce: `#srovnani-cest` (CS), `#comparison` (EN).  
Odkaz tlačítka: `{{url:post:ways-to-see-who-is-hiring-compared}}` → `/blog/srovnani-jak-zjistit-kdo-nabira` (CS), `/en/blog/ways-to-see-who-is-hiring-compared` (EN).

### Čeština (`home_cmp_*` v `src/i18n/cs.json`)
- **Kicker:** `Srovnání cest`
- **H2:** `Kdy stačí která cesta`
- **Podnadpis:** `Ruční kontrola, obecný hlídač i vlastní skript v AI mají své místo. Záleží na počtu firem a na tom, kdo se bude starat o údržbu.`
- **Sloupce tabulky:** `Cesta` | `Kdy stačí` | `Cena měsíčně` | `Kdo to udržuje`
- **Řádek 1 (`Ručně (Excel)`):** `Do 10–15 firem` | `0 Kč (jen váš čas)` | `Recruiter`
- **Řádek 2 (`Hlídač stránek (Visualping, Distill)`):** `5–20 jednoduchých webů` | `Zdarma až $140+/měs.` | `Vy (ladění upozornění)` *(zdroj: visualping.io/pricing — Free $0, Business $140–$350/měs., 14. 11. 2026)*
- **Řádek 3 (`Vlastní AI / automatizace (ChatGPT, n8n)`):** `10–30 firem, když máte čas ladit` | `cca 200–3 500 Kč/měs. + hodiny práce` | `Vy (u desítek firem každý týden)` *(zdroj: modelový rozpočet dle ceníků n8n, Apify, Hetzner Cloud v `reserse.md` §3.2 k 14. 11. 2026)*
- **Řádek 4 (`Databáze inzerátů`):** `Globální trh a vlastní skripty (v ČR částečně, ověřte si své firmy)` | `Zdarma až $5 500/měs.` | `Dodavatel` *(zdroj: theirstack.com/en/pricing a job-postings-data k 14. 11. 2026)*
- **Řádek 5 (`TalentRadar`, třída `.cmp-row--us`):** `Od 20–30 firem, bez starosti o techniku` | `{{price:solo}} / {{price:pro}} / {{price:scale}} bez DPH` (`1 990 Kč / 3 990 Kč / 7 990 Kč bez DPH`) | `Dodavatel`
- **Poznámka pod tabulkou:** `Pokud jste dva a hlídáte dvacet firem, postavte si to v ChatGPT nebo n8n, zvládnete to. Pokud jste deset a firem je sto padesát, budete potřebovat někoho, kdo to bude každý týden opravovat.`
- **Tlačítko:** `Celé srovnání s cenami a kdy co zvolit`

### Angličtina (`home_cmp_*` v `src/i18n/en.json`)
- **Kicker:** `Comparing options`
- **H2:** `Five ways to see who is hiring — when each is enough`
- **Podnadpis:** `Manual checks, generic monitors, and DIY AI scripts all have a place. The right choice depends on how many companies you track and who maintains what breaks.`
- **Sloupce tabulky:** `Approach` | `When it's enough` | `Monthly price` | `Who maintains it`
- **Řádek 1 (`Manually (Excel)`):** `Up to 10–15 firms` | `€0 (your time only)` | `Recruiter`
- **Řádek 2 (`Page monitor (Visualping, Distill)`):** `5–20 simple sites` | `Free to $140+/mo` | `You (tuning alerts)`
- **Řádek 3 (`DIY AI / automation (ChatGPT, n8n)`):** `10–30 firms when you have time to tune` | `approx. €8–€145/mo + hours of work` | `You (weekly at dozens of firms)`
- **Řádek 4 (`Job posting database`):** `Global market & custom scripts (partly in CZ, check your companies)` | `Free to $5,500/mo` | `Vendor`
- **Řádek 5 (`TalentRadar`, `.cmp-row--us`):** `From 20–30 firms, zero technical upkeep` | `{{price:solo}} / {{price:pro}} / {{price:scale}} excl. VAT` (`€119 / €289 / €529 excl. VAT`) | `Vendor`
- **Poznámka pod tabulkou:** `If there are two of you watching twenty companies, build it in ChatGPT or n8n—you'll manage fine. If there are ten of you watching a hundred and fifty, you'll need someone fixing broken scrapers every week.`
- **Tlačítko:** `Full comparison with pricing and when to pick each`

---

## 2. Nový článek blogu: celé srovnání (`src/blog/ways-to-see-who-is-hiring-compared.{cs,en}.html`)

- **ID:** `ways-to-see-who-is-hiring-compared`
- **CS URL:** `/blog/srovnani-jak-zjistit-kdo-nabira`
- **EN URL:** `/en/blog/ways-to-see-who-is-hiring-compared`
- **Datum publikace (`published`):** `2026-11-16T08:00:00+01:00` (pro schválení Kryštofem při plánování pořadí vydávání článků)
- **Čas čtení:** `11 min`

### Metadata CS
- **Title:** `Jak zjistit, kdo nabírá: srovnání pěti cest, cen a nástrojů pro personální agentury`
- **Description:** `Věcné srovnání pěti cest, jak v personální agentuře hlídat otevřené pozice klientů a cílových firem: ručně, obecným hlídačem, databází inzerátů, vlastním AI agentem a hotovým nástrojem. Skutečné náklady, kdy co zvolit a přehled konkrétních nástrojů.`
- **Crumb:** `Srovnání cest a nástrojů`
- **Lead:** `Když chcete v personální agentuře hlídat otevřené pozice klientů a cílových firem, máte pět možností: ruční kontrolu, obecný hlídač stránek, databázi inzerátů, vlastní AI automatizaci nebo hotový nástroj pro agentury. Tady je věcný přehled toho, co která cesta umí, kolik stojí v praxi a kdy dává smysl sáhnout jinam než po TalentRadaru.`

### Metadata EN
- **Title:** `How to see who is hiring: 5 approaches, real costs & tools for recruitment agencies`
- **Description:** `A factual comparison of five ways recruitment agencies track open roles at clients and target accounts: manually, page monitors, job databases, DIY AI workflows, and agency tools. Real costs, when to choose each, and six tools compared.`
- **Crumb:** `Comparing approaches & tools`
- **Lead:** `To keep track of open roles at your agency's clients and target companies, there are five common options: manual checks, generic page-change monitors, job databases, DIY AI workflows, or a specialised agency tool. Below is a factual guide to what each path covers, what it actually costs, and when another product fits better than TalentRadar.`

### Přehled sekcí článku (CS / EN) a zdroje tvrzení

1. **Pět cest, jak zjistit, kdo nabírá (`#pet-cest` / `#five-ways`)**
   - Srovnávací tabulka (desktop) + 5 mobilních karet (`.cmp-ways-cards`): řádky *Příklady*, *Cena měsíčně*, *Hlídá vaše firmy*, *Česko a Slovensko*, *Kdo to udržuje*, *Kdy stačí*.
   - Zdroje pro kategorie:
     - Obecné hlídače (`Visualping`, `Distill`): `https://visualping.io/pricing`, `https://distill.io/pricing` (14. 11. 2026) — rozsah `$0–$140+/měs.` (Business 20K `$140/měs.`, vyšší až `$350/měs.`).
     - Databáze inzerátů (`TheirStack`, `PredictLeads`): `https://theirstack.com/en/pricing`, `https://theirstack.com/en/job-postings-data`, `https://predictleads.com/pricing` (`reserse.md` k 14. 11. 2026) — rozsah `Zdarma až $5 500/měs.` (API od `$49/měs.`).
     - Hotové nástroje: `TalentRadar` (`{{price:solo}} / {{price:pro}} / {{price:scale}}`, `+50 firem za {{price:extra50}}`), `Saleskit`, `Recruit Signals`, `Vente AI`, `Paiger` (`reserse.md` + `nastroje.csv`).
     - Text dodržuje pravidlo bez absolutních tvrzení: formulace *„Nenašli jsme jiný nástroj, který by hlídání lokálních firem stavěl na kombinaci Teamia, Jobs.cz, světových ATS i běžných kariérních webů.“*

2. **Kolik to stojí doopravdy (včetně „postavit si to sám“) (`#kolik-to-stoji` / `#real-costs`)**
   - Desktop tabulka + mobilní karty `.cmp-ways-cards` pro dva scénáře z `reserse.md` §3.2:
     - **Malá agentura / solo headhunter (2 lidé, 20 jednoduchých webů):** přímé náklady `asi 150–775 Kč/měs.` (`€6–€32/měs.`, např. Hetzner VPS od €5,99 ≈ 146 Kč + API modelů, nebo n8n Cloud Starter €20 ≈ 489 Kč, Distill Starter $15 ≈ 332 Kč, Visualping Personal $14–$35 ≈ 309–774 Kč); čas výslovně jako **odhad**: `4–8 hodin` úvodní nastavení + `1–2 hodiny měsíčně` ladění; srovnání `TalentRadar Solo Scout ({{price:solo}}/měs. bez DPH)`.
     - **Střední agentura (10 lidí, 150 firem vč. Workday/Greenhouse/Teamio, JS a portálů):** přímé náklady `asi 960–3 550 Kč/měs.` (`€39–€145/měs.`, např. n8n Cloud Starter/Pro €20–€50 ≈ 489–1 221 Kč + Apify Starter od $19 ≈ 420 Kč + API modelů 2× denně; pro srovnání Visualping Business 20K $100–$140 ≈ 2 210–3 094 Kč jen pro 5 uživatelů); čas výslovně jako **odhad**: `25–60 hodin` stavba + `4–10 hodin měsíčně` opravy; srovnání `TalentRadar Agency Pro ({{price:pro}}/měs. bez DPH, +50 firem za {{price:extra50}}/měs.)`.
   - Zdroje ceníků infrastruktury k **14. 11. 2026**: `https://n8n.io/pricing/`, `https://apify.com/pricing`, `https://visualping.io/pricing`, `https://distill.io/pricing`, `https://www.hetzner.com/cloud/` (`reserse.md` §3.2).

3. **Kdy co zvolit: rozhodovací vodítko (`#kdy-co-zvolit` / `#when-to-choose-what`)**
   - Pět jasných situací podle velikosti týmu a počtu sledovaných firem (ruční Excel do 10–15 firem → Visualping/Distill nebo jednoduchý skript do 20 jednoduchých webů → API TheirStack/PredictLeads nebo n8n+Apify při vlastním vývojáři → Saleskit pro plošnou inzerci na portálech a Merk v ČR/SR → TalentRadar pro 20–400+ firem přímo na kariérních stránkách, ATS a Teamiu bez údržby).

4. **Postavím si to sám s AI: kdy to stačí a kde se to láme (`#ai-workflow`)**
   - Přeneseno a sladěno ze stávající `/srovnani` (vč. citátu pro 2/20 vs. 10/150 a 7řádkové tabulky `.ai-table` s `data-label`, kde jsou časové údaje označeny jako odhady).

5. **Šest konkrétních nástrojů vedle TalentRadaru (`#tools`)**
   - U každého nástroje: **Pro koho je / Built for**, **Co umí / What it does**, **Cena a datum ověření / Pricing & check date**, **Kdy je lepší než TalentRadar / When it beats TalentRadar** a přímé **Zdroje / Sources** (vše ověřeno v `reserse.md` a `nastroje.csv` k **14. 11. 2026**, s ohledem na doplnění ze zadání `PROMPT-antigravity-srovnani.md` §5b):
     1. **Saleskit (Merk)** — B2B + HR stránka (`saleskit.com/industry/hr-and-rectruitment`, public testimonial Grafton Recruitment), historie portálových inzerátů ČR/SR od r. 2020, HR změny, Merk, Leady, MCP; tarify Basic (5 už.), Standard (10 už.), Enterprise (15+ už.), cena na poptávku, „Start free trial“; lepší pro plošnou portálovou inzerci a Merk data v ČR/SR.
     2. **Recruit Signals** — personální agentury v UK a NL (`recruitsignals.com`, `/pricing`), pre-vacancy signály + Heat Score 0–100 + živé role s hiring manažerem + ověřené e-maily/telefony za kredity + CRM integrace na vyžádání; Solo €99 (~2 420 Kč) / Agency €299 (~7 305 Kč) / Scale €599 (~14 630 Kč) při roční platbě (100/350/1 000 kreditů, 1 / neomezeně uživatelů), měsíčně €124 / €374 / €749, 7 dní zdarma bez karty (ceník bez výslovně uvedeného DPH).
     3. **Vente AI** — britské personální agentury (`vente.ai/pricing`, `vente.ai`), na ceníku „Hiring Data Access“ (1 000 signálů/měs., neomezeně uživatelů, „Recruitment Agency listings excluded“, sémantické AI hledání, Claude/ChatGPT MCP), na homepage integrace Bullhorn, Vincere, JobAdder, Loxo; základ £59/měs. bez DPH (~1 725 Kč; 3/6/12m závazek −10/−25/−40 % od £35,40/měs.); add-ony Line Manager ID +£79, Contact Email +£99, Mobile Number +£499/měs.; **bez trialu**; lepší v UK pro levný feed s MCP nebo mobilní čísla v Bullhornu/Vincere.
     4. **Paiger** — britské personální agentury (`paiger.co/pricing`, `paiger.co`), 4 workflow (Job Signals, Contact Finder, Job Alert Matching, LinkedIn automatizace), 150–600 AI research kreditů/měs.; £199/měs. (1 už.) + £195 setup, £445/měs. (5 už.) + £350 setup, bez DPH, 12měsíční závazek (ročně −20 %).
     5. **TheirStack** — B2B / datové týmy (`theirstack.com/en/pricing`, `/en/job-postings-data`), 371 tis. zdrojů / 195 zemí na webu (344 tis. v docs), `job.closed` webhooky, Zapier/Make/n8n/REST API/MCP; Česko není mezi 10 hlavními zeměmi (stránka pro ČR vrací 404). V HTML je placeholder komentář `<!-- TODO po testu TheirStack: pokrytí CZ -->`, **čísla z 30členného testu nejsou v článku použita** (podle pokynů §4.1 a §5b.1). Free (50 company + 200 API kreditů), API od $49/měs. (~1 085 Kč) do $5 500/měs., App od $109 za 1 000 kreditů/12 měsíců.
     6. **Visualping (a Distill)** — obecné hlídače URL (`visualping.io/pricing`, `distill.io/pricing`); Visualping Free $0 (5 stránek, 150 kontrol), Personal $14–$70/měs. (~310–1 545 Kč), Business $140–$350/měs. (~3 095–7 735 Kč; ročně od $10/$100); Distill Free (5 cloud monitorů) / od $15/měs. Nemá ATS parsing ani historii věku rolí 45+ dní.

6. **Kdy TalentRadar není pro vás (`#not-for-you`)**
   - 4 karty (`.not-grid`): 1. ověřené přímé e-maily/telefony manažerů (→ Recruit Signals / Vente AI v UK/NL), 2. pre-vacancy signály (→ Recruit Signals / PredictLeads / Saleskit), 3. plošné prohledávání trhu nebo surové API mimo vlastní seznam firem (→ TheirStack / Saleskit), 4. okamžité webhooky/Slack na každou změnu URL (→ Visualping Business / TheirStack; TalentRadar běží 2× denně v 6:00 a 12:00 + týdenní e-mail + Excel/CSV/Bullhorn/Vincere + MCP).

7. **Časté otázky ke srovnání (`#cmp-faq`, shodné s JSON-LD `meta.faq`)**
   1. *Proč uvádíte Teamio zvlášť od běžných pracovních portálů?* / *Why do you treat Teamio separately from regular job boards?*
   2. *Proč TalentRadar nedodává databázi e-mailů a telefonů na manažery?* / *Why doesn't TalentRadar include a database of manager emails and phone numbers?*
   3. *Jak funguje nahrání seznamu firem a export do našeho CRM nebo ATS?* / *How do company list upload and CRM / ATS exports work?*
   4. *Když je pozice otevřená přes 45 dní, znamená to automaticky, že firma hledá agenturu?* / *If a role has been open for 45+ days, does that automatically mean the company wants an agency?* (zdroj SHRM: medián doby obsazení 39–45 dní)
   5. *Kdy se vyplatí přejít z vlastního AI skriptu nebo obecného hlídače na hotový nástroj?* / *When does it pay off to switch from a DIY AI script or page monitor to a purpose-built tool?*

---

## 3. Patička, `llms.txt` a odstranění samostatné stránky `/srovnani`

- Samostatná stránka `src/pages/compare.html` a záznam `"compare"` v `src/pages.json` byly odstraněny (včetně výstupů `public/srovnani.html` a `public/en/compare.html` a nepoužívaných `cmp_*` / `meta_compare_*` klíčů v `src/i18n/{cs,en}.json`).
- **Patička (`src/partials/footer.html` + `footer_compare`):** odkaz `Srovnání` (CS) / `Compare` (EN) nyní směřuje přímo na `{{url:post:ways-to-see-who-is-hiring-compared}}`.
- **`build.mjs`:** odstraněna logika FAQ pro samostatnou stránku `compare`, aktualizovány odkazy v `llmsBaseLines` (`public/llms.txt`) na `/blog/srovnani-jak-zjistit-kdo-nabira` a `/en/blog/ways-to-see-who-is-hiring-compared`.

---

## 4. Prolinkování stávajících článků blogu (bez změny jejich dat publikace)

1. **`src/blog/best-career-page-monitoring-tools.{cs,en}.html`** (publikováno 11. 11. 2026)
   - **CS:** `Podrobné srovnání všech pěti cest včetně rozpočtu vlastní stavby v AI/n8n a šesti konkrétních nástrojů s cenami k 14. listopadu 2026 najdete v článku <a href="{{url:post:ways-to-see-who-is-hiring-compared}}">Jak zjistit, kdo nabírá: srovnání pěti cest, cen a nástrojů</a>.` *(nahradil původní odkaz na `{{url:compare}}`)*
   - **EN:** `For a detailed breakdown of all five approaches, real DIY AI/n8n costs, and six specific tools with verified pricing as of 14 November 2026, see our guide <a href="{{url:post:ways-to-see-who-is-hiring-compared}}">How to see who is hiring: 5 approaches, real costs &amp; tools</a>.`
2. **`src/blog/how-to-monitor-client-career-pages.{cs,en}.html`** (publikováno 9. 11. 2026)
   - **CS (konec bodu 3):** `Kolik doopravdy stojí vlastní stavba v ChatGPT, n8n a Apify oproti hotovému nástroji pro 2 i 10 lidí, rozebírá naše <a href="{{url:post:ways-to-see-who-is-hiring-compared}}">srovnání pěti cest s cenami a konkrétními nástroji</a>.`
   - **EN (konec bodu 3):** `To see what building a DIY ChatGPT, n8n, and Apify workflow actually costs for 2-person versus 10-person agencies, read our <a href="{{url:post:ways-to-see-who-is-hiring-compared}}">full comparison with pricing and six specific tools</a>.`
3. **`src/blog/track-company-hiring-czechia-cee.{cs,en}.html`** (publikováno 18. 10. 2026)
   - **CS:** `Kompletní rozbor pěti cest včetně rozpočtů, Saleskitu, TheirStacku a případů, kdy je lepší jiný nástroj než TalentRadar, najdete ve článku <a href="{{url:post:ways-to-see-who-is-hiring-compared}}">Jak zjistit, kdo nabírá: srovnání cest, cen a nástrojů</a>.`
   - **EN:** `For real DIY costs and six specific tools compared (including Saleskit, TheirStack, Recruit Signals, Vente AI, Paiger, and Visualping), see our <a href="{{url:post:ways-to-see-who-is-hiring-compared}}">full comparison of five approaches and tools</a>.`
