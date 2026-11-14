# Prompt pro Antigravity: rešerše konkurence TalentRadaru (co umí, pro koho, za kolik)

Komunikuj česky. Tenhle prompt je samostatný: nepředpokládá, že víš cokoli z dřívějška.

## 0. O co jde

**TalentRadar** je SaaS pro malé a střední personální agentury v Česku a na Slovensku (výhledově Irsko). Každé ráno hlídá kariérní stránky a ATS firem, se kterými agentura pracuje (klienti, firmy, se kterými dlouho nejednala, prospekty). Ukáže, kdo nově nabírá, třídí role podle zaměření agentury (CORE / SELECTIVE / SKIP) a nabídne důvod zavolat a koncept oslovení. Čte i české zdroje (Teamio, Jobs.cz, Recruitis, vlastní kariérní weby). Ceny: **1 990 / 3 990 / 7 990 Kč měsíčně bez DPH** za 50 / 150 / 400 firem, 14 dní zdarma bez karty, bez závazku. Web: talentradar.eu, ceník talentradar.eu/cenik.

Majitel je **Kryštof**. Chce na web dát **malou srovnávací tabulku** na úvodní stránku a **podrobný článek**: kolik co stojí, co si zvolit a v jakých případech. Než to napíšeme, potřebujeme **ověřený a aktuální přehled konkurence**, abychom si s Kryštofem řekli, co dává a nedává smysl. Tvoje práce je ten přehled. Claude (jiná AI session) ho pak zkontroluje a s Kryštofem z něj udělá obsah webu.

**Důležité:** nejde o to dokázat, že jsme nejlepší. Kryštof nechce přehnaná tvrzení („zatím nemusíme tvrdit, že najdeme víc“). Kde je konkurent lepší nebo levnější, napiš to stejně jasně jako opak.

## 1. Pravidla

- **Jen veřejné stránky.** Žádné zakládání účtů, zkušební verze, žádosti o demo, kontaktní formuláře ani chaty, nic, co něco odešle. Když by to bylo potřeba (např. cena jen po registraci), zapiš to jako otevřenou otázku pro Kryštofa a nedělej to.
- **Ochranu proti botům neobcházej**, CAPTCHA neřeš. Když stránka nejde načíst, zapiš „nenačteno“ a proč.
- **U každého údaje adresa zdroje a datum, kdy jsi ho četl.** Rozlišuj tři druhy údajů:
  - **uvádí výrobce** (stojí na jeho webu),
  - **ověřeno** (sedí z více zdrojů nebo jsi to viděl přímo, např. v ceníku),
  - **odhad / úvaha** (tvoje, s předpoklady).
- Nic si nedomýšlej. „Nedoloženo“ je platná odpověď.
- Citace jen krátké (do 15 slov) a v uvozovkách, jinak vlastními slovy.
- **Měny:** uveď původní měnu i přepočet na Kč kurzem ČNB s datem kurzu. Vždy uveď, jestli je cena s DPH nebo bez, měsíčně nebo ročně (a měsíčně při roční platbě), a jestli je závazek.
- V repu webu ani v repu aplikace **nic neměň a necommituj**. Výstup jen do složky z bodu 5.

## 2. Z čeho vyjít (přečti nejdřív)

Hodně už je zjištěné. Tvoje práce je **ověřit, aktualizovat a doplnit**, ne začínat od nuly. Dokumenty jsou v app repu `C:\Users\Kryštof\Talent-radar` na větvi `origin/main`. Čti je bez přepínání větve, například:

```
git -C C:\Users\Kryštof\Talent-radar fetch origin
git -C C:\Users\Kryštof\Talent-radar show origin/main:docs/strategie/2026-11-13_konkurence-signara-theirstack-a-spol.md
```

- `docs/strategie/2026-11-13_konkurence-signara-theirstack-a-spol.md`: 9 nástrojů, ceny k 13. 11., chyby ChatGPT, **test pokrytí TheirStacku na 30 českých firmách** (kapitola 9).
- `docs/strategie/2026-11-13_srovnani-na-web-a-prispevky.md`: návrh srovnání „5 cest“ a kapitola „Postavím si to sám s AI“.
- `docs/strategie/2026-10-26_konkurence-a-smysl-talentradaru.md` a složka `docs/strategie/2026-10-26_konkurence-podklady/` (5 souborů: přímí konkurenti, data a sales intelligence, agenturní ATS a CRM v zahraničí, český a slovenský trh, UK a Irsko).
- `docs/strategie/2026-10-22_heyree-konkurence.md` (český AI ATS Heyree).

A co dnes tvrdí web (na větvi, ještě nevydáno):
- `C:\Users\Kryštof\talentradar-web\.claude\worktrees\web-hero-srovnani-a2117e\src\i18n\cs.json`: klíče začínající `cmp_` (stránka Srovnání) a `home_cmp_` (tabulka na úvodní stránce),
- `C:\Users\Kryštof\talentradar-web\.claude\worktrees\web-hero-srovnani-a2117e\src\pages\compare.html` (struktura stránky).

## 3. Co zjistit

### 3.1 Nástroje (u každého stejná pole)

Projdi aspoň tyhle. Když narazíš na další relevantní, přidej je a napiš, proč tam patří.

| Skupina | Nástroje |
|---|---|
| A. Signály náboru přímo pro agentury | Recruit Signals, RecruitmentSignals, Vente AI, Paiger, Vacancysoft, Bullhorn (Market IQ / Amplify), případně další, které najdeš |
| B. Databáze inzerátů a firemní data | TheirStack, PredictLeads, Signara, RoleDawn |
| C. Hlídače stránek | Visualping, Distill, JobBeacon |
| D. Stavebnice a vlastní AI | Apify (Job Board Monitor), n8n, Make, Zapier, ChatGPT (Plus / Business / agent), Claude (Pro / Team) |
| E. Česko a Slovensko | cokoli místního, co agentuře řekne, kdo nabírá: Alma Career (Jobs.cz, Teamio, Profesia), Recruitis, Datacruit, Heyree, Expanzo, Leadbase a další, které najdeš. **Hledej aktivně i nové, česky i slovensky**: absence je jen „nenašli jsme“. |

Pole pro každý nástroj:
1. **Pro koho je** (podle vlastního webu): agentury, firmy, které nabírají samy, obchodníci B2B, uchazeči o práci, vývojáři.
2. **Co dělá**, jen to, co je relevantní pro agenturu, která chce vědět, kdo nabírá:
   - hlídá seznam firem agentury, nebo trh podle filtrů,
   - odkud bere data (kariérní weby, ATS, portály, LinkedIn),
   - jak často,
   - jak doručuje (e-mail, aplikace, Slack, API),
   - třídění rolí nebo AI,
   - kontakty a hiring manažeři,
   - napojení na ATS / CRM (Bullhorn, Vincere a další),
   - historie a uzavřené role.
3. **Česko a Slovensko:** co přesně web říká (krátká citace), nebo „nedoloženo“. U skupiny B zkus, jestli jde bez účtu zjistit pokrytí země (veřejné stránky, dokumentace).
4. **Cena:** všechny tarify, co obsahují (limity firem, kreditů, uživatelů), měsíčně / ročně, závazek, zkušební verze, DPH. Když cena není veřejná, napiš „na poptávku“.
5. **Kdy je lepší než TalentRadar:** jedna věta, poctivě.
6. **Kdy je horší nebo se nehodí:** jedna věta, poctivě.
7. **Zdroje:** adresy a datum čtení.

### 3.2 Kolik stojí „postavit si to sám“

Na webu dnes stojí odhad „cca 1 000–4 000 Kč měsíčně (API, běh) + čas“, **bez zdroje**. Spočítej to doložitelně pro dva případy:
- **Malá agentura:** 2 lidé, 20 firem s jednoduchými kariérními weby.
- **Střední agentura:** 10 lidí, 150 firem, část na ATS (Workday, Greenhouse, Teamio), část na vlastních webech.

U každé položky (předplatné AI, n8n / Make / Zapier, Apify, hosting a další) uveď cenu ze zdroje s datem. Čas na stavbu a údržbu dej zvlášť jako **odhad** s předpoklady, nemusíš ho převádět na peníze. Výsledek: rozpětí v Kč měsíčně + co v něm není.

### 3.3 Kontrola tvrzení, která web dnes říká

Projdi všechny klíče `cmp_` a `home_cmp_` v `cs.json`, které tvrdí něco o konkurenci nebo o cenách (ceny, „pokrytí ČR/SR nedoloženo“, „hlídá vaše firmy: částečně“, „kdy stačí“ apod.). U každého:
- **sedí** (zdroj),
- **zastaralé** (co se změnilo),
- **nesedí** (proč),
- **nejde ověřit**.

Zvlášť se vyjádři k těmhle třem, o kterých už víme, že jsou sporné:
- `cmp_ways_r2_c4` „cca 1 000–4 000 Kč (API, běh) + čas“: nahradí ho výsledek bodu 3.2,
- `cmp_ways_r4_c3` / `home_cmp_r2_w3` „Většinou bez záruky (hlavně US/UK)“ (databáze inzerátů v ČR/SR),
- `pp_t2_f7` „Napojení na AI asistenty Claude a ChatGPT“. Tohle je o TalentRadaru: jen zjisti, co dnes Claude a ChatGPT veřejně uvádějí o vlastních konektorech (MCP), a v jakých tarifech. Funkčnost naší strany neověřuj.

## 4. Co z toho plyne (oddělit od faktů)

Na konec přidej **samostatnou** kapitolu „Návrhy (úvaha, rozhoduje Kryštof)“:
- které nástroje dát do **malé tabulky na úvodní stránce** (návrh: 4–5 sloupců jako „cesty“, ne značky, a 3–4 řádky) a jaké řádky,
- co patří do **podrobného článku** (osnova: kolik co stojí, kdy co zvolit, v jakých případech je TalentRadar zbytečný),
- které nástroje ze srovnání vypustit nebo přidat, a proč,
- co z našeho webu nebo ceníku vypadá ve srovnání slabě (cena, chybějící funkce, nejasná formulace).

## 5. Výstup

Složka `C:\Users\Kryštof\tr-web-redesign-podklady\konkurence-2026-11\`:
- `reserse.md`: shrnutí v 5–7 bodech nahoře, pak nástroj po nástroji (pole z 3.1), DIY náklady (3.2), návrhy (4),
- `nastroje.csv`: jeden řádek = jeden tarif jednoho nástroje (sloupce: skupina, nástroj, tarif, cena, měna, období, DPH, závazek, co obsahuje, cena v Kč, kurz a datum, ČR/SR, druh údaje, zdroj, datum čtení),
- `kontrola-webu.md`: výsledek 3.3 jako tabulka klíč → tvrzení → verdikt → zdroj → návrh znění,
- `otevrene-otazky.md`: co nešlo zjistit bez účtu, demo nebo kontaktu, a co by to stálo zjistit.

Na konci napiš Kryštofovi krátké hlášení (5–10 řádků) pro Clauda: co je hotové, co se oproti 13. 11. změnilo, co nešlo zjistit.
