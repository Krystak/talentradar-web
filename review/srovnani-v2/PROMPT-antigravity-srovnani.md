# Navazující prompt pro Antigravity: srovnání na webu v2 (malá tabulka + celý článek)

Komunikuj česky. Tohle je **další úkol pro session, která točí nové hero video** ve worktree `C:\Users\Kryštof\tr-web-hero-a` (větev `design/hero-a-2026-11`). Kryštof je pryč. Postupuj sám a rozhodnutí, která patří jemu, si zapiš jako otevřené otázky.

## 0. Kdy začít

Začni, **až splníš obě podmínky**:
1. **Hero video je hotové:** zapojené do webu, testy prošly a je commitnuté na `design/hero-a-2026-11` (úkol z `review/hero-a/PROMPT-antigravity.md`). Hlášení k videu napiš zvlášť, ještě než začneš tohle.
2. **Rešerše konkurence je hotová.** Dělá ji jiná session do `C:\Users\Kryštof\tr-web-redesign-podklady\konkurence-2026-11\`. Musí tam být `reserse.md`, `nastroje.csv` a `kontrola-webu.md`. Když tam nejsou, nečekej ve smyčce: napiš do hlášení „čekám na rešerši“ a skonči.

Pravidla jako dosud: **nic nepushuj**, nic neslučuj do `master` a nic nenasazuj. Commituj jen lokálně na `design/hero-a-2026-11`. V repu aplikace nic neměň.

## 1. Nejdřív dotáhni základní větev

Claude po založení tvého worktree přidal na `claude/web-hero-srovnani-a2117e` další commity:
- `8cfb624`: posunutá data dvou článků (Kryštof to schválil),
- `0fe7228`: prompt na rešerši,
- tenhle prompt.

Slouč je k sobě:

```
git -C C:\Users\Kryštof\tr-web-hero-a merge claude/web-hero-srovnani-a2117e
```

Konflikty ve vygenerovaném `public/` neřeš ručně. Vezmi jednu stranu a pusť `node build.mjs`. Ostatní konflikty vyřeš tak, aby zůstalo tvoje video i Claudovy změny. Pak `npm test` a `npm run check:release`.

## 2. Co Kryštof chce (jeho slovy, zkráceně)

> „My to máme jen tu malou srovnací tabulku a možná udělat i o tom celý ten článek … tam by mohlo být tohle srovnání a pak další tlačítko na celý blog o tomhle. A v tom blogu popíšeme třeba kolik co stojí, jakou si zvolit, podrobněji, v jakých případech.“

Tedy:
- **na úvodní stránce malá tabulka**,
- **pod ní tlačítko na celý článek**,
- **v článku podrobně**: kolik co stojí, co zvolit, v jakých případech.

Kryštof nechce přehnaná tvrzení („zatím nemusíme tvrdit, že najdeme víc“).

## 3. Dnešní stav (co měníš)

Srovnání přišlo z větve `design/srovnani-2026-11`. Ještě nikdy nebylo na živém webu.
- **Úvodní stránka:** sekce `id_compare` v `src/pages/home.html`, texty `home_cmp_*` v `src/i18n/cs.json` a `en.json`. Je to velká tabulka 5 cest × 4 řádky, na mobilu 5 vysokých karet. **Moc velká.**
- **Samostatná stránka `/srovnani` (EN `/en/compare`):** `src/pages/compare.html`, záznam `compare` v `src/pages.json`, texty `cmp_*`, styly v `src/css/components.css` (`cmp-*`, `tool-card*`), odkaz v patičce `src/partials/footer.html` (`footer_compare`), test „home comparison section and /srovnani…“ v `tests/site.test.js`. Kromě toho `llms.txt` a `sitemap` (generuje `build.mjs`).
- **Článek `best-career-page-monitoring-tools`** (CS „Nejlepší nástroje na sledování kariérních stránek…“, datum 11. 11.) srovnává **kategorie** nástrojů a odkazuje na `/srovnani`.

Téma se dnes opakuje na třech místech. **Cíl: jedno podrobné místo (článek), na které vede tlačítko z úvodní stránky i ostatní odkazy.**

## 4. Co udělat

### 4.1 Nový článek „celé srovnání“ (CS + EN)

- Nový příspěvek blogu v `src/blog/` (podívej se, jak jsou udělané ostatní: blok `<!--meta {…} -->`, `id`, `slug`, `title`, `description`, `published`, `minutes`, `crumb`, `faq`).
- **Návrh slugů:** CS `srovnani-jak-zjistit-kdo-nabira`, EN `ways-to-see-who-is-hiring-compared`. Můžeš navrhnout lepší, ale stručné.
- **`published`:** `2026-11-16T08:00:00+01:00`. Konečné datum určí Kryštof při vydání: blog má vycházet postupně (18. 10., 9. 11., 11. 11., 13. 11. …).
- **Obsah:** vezmi stávající stránku `/srovnani` (texty `cmp_*`, struktura `compare.html`) a **aktualizuj ji podle rešerše**. Osnova:
  1. **Pět cest, jak zjistit, kdo nabírá**: tabulka (ručně, hlídač stránek, databáze inzerátů, vlastní AI / automatizace, hotový nástroj pro agentury) s řádky příklady, cena měsíčně, hlídá vaše firmy, Česko a Slovensko, kdo to udržuje, kdy stačí.
  2. **Kolik to stojí doopravdy**, včetně „postavit si to sám“ pro malou (2 lidé, 20 firem) a střední agenturu (10 lidí, 150 firem). Čísla z `reserse.md` (bod 3.2 rešerše), se zdroji a datem.
  3. **Kdy co zvolit**: rozhodovací vodítko podle počtu lidí a firem.
  4. **Postavím si to sám s AI**: kdy to stačí a kde se to láme (je na stávající stránce).
  5. **Konkrétní nástroje**: jen ty, které rešerše doporučí ponechat. U každého pro koho je, co umí, cena k datu a **kdy je lepší než TalentRadar**.
  6. **Kdy TalentRadar není pro vás.**
  7. **Časté otázky** do `faq` v meta (ze stávajících `cmp_faq_*`, aktualizované).
- **Pravidla obsahu:**
  - Každé číslo a tvrzení o konkurenci musí mít zdroj v rešerši. U cen „podle ceníku výrobce k <datum>“ a odkaz.
  - Nepiš „najdeme víc“, „jediní v Česku“ ani „dřív než portály“. Smí být „nenašli jsme jiný nástroj, který…“.
  - **Výsledek testu pokrytí proti TheirStacku** (6 z 30 českých firem bez jediné role) **nepoužívej**, o té větě rozhoduje Kryštof. Na místo karty TheirStacku dej komentář `<!-- TODO po testu TheirStack: pokrytí CZ -->`, stejně jako je teď v `compare.html`.
  - Tabulky a karty můžou použít stávající styly `cmp-*` a `tool-card*`. Na telefonu žádný horizontální přetok stránky (tabulka se může posouvat uvnitř svého rámečku, jako jinde na webu).

### 4.2 Malá tabulka na úvodní stránce

Sekci `id_compare` v `home.html` zmenši na **malou tabulku „Kdy stačí co“**:
- **řádky = cesty** (ručně, hlídač stránek, vlastní AI / automatizace, databáze inzerátů, TalentRadar),
- **3 sloupce**: kdy stačí, cena měsíčně, kdo to udržuje.

Na telefonu ať je to pořád čitelná tabulka (nebo nízké řádky), ne 5 vysokých karet. Nad tabulkou krátký nadpis a jedna věta, pod tabulkou věta o vlastním AI (stávající `home_cmp_note` můžeš zkrátit). Pak **tlačítko „Celé srovnání s cenami a kdy co zvolit“** na nový článek. Hodnoty musí sedět s článkem a s rešerší.

### 4.3 Samostatnou stránku `/srovnani` zruš

Nikdy nebyla venku, takže přesměrování není potřeba. Odeber:
- `src/pages/compare.html`,
- záznam `compare` v `pages.json`,
- texty `cmp_*`, které už nic nepoužívá (`build.mjs` hlídá klíče, `checkKeys`).

Odkaz v patičce (`footer_compare`) přesměruj na nový článek. Přepiš test v `tests/site.test.js` tak, aby hlídal novou podobu:
- úvodní stránka CS i EN odkazuje na článek,
- článek má tabulku a FAQ,
- článek je v `sitemap` a `llms.txt`.

### 4.4 Tři sporná tvrzení (z kontroly Clauda 14. 11.)

1. **Cena vlastního AI agenta „cca 1 000–4 000 Kč (API, běh) + čas“:** nahraď výsledkem rešerše (rozpětí se zdrojem). Když rešerše číslo nedoloží, napiš „předplatné AI a nástrojů + čas na údržbu“, bez čísla.
2. **Databáze inzerátů v ČR/SR „Většinou bez záruky (hlavně US/UK)“:** „US/UK“ nemá zdroj a vlastní test ukázal, že TheirStack Česko má. Napiš podle rešerše. Výchozí návrh: CS „Částečně (pokrytí vašich firem si ověřte)“, EN „Partly (check coverage for your companies)“.
3. **Ceník `pp_t2_f7` „Napojení na AI asistenty Claude a ChatGPT“: neměň.** Jen do otevřených otázek napiš, co o konektorech zjistila rešerše. Rozhoduje Kryštof.

### 4.5 Odkazy z ostatních článků

Do článků `how-to-monitor-client-career-pages`, `track-company-hiring-czechia-cee` a `best-career-page-monitoring-tools` (CS i EN) dej jednu větu s odkazem na nový článek. V `best-career-page-monitoring-tools` místo dnešního odkazu na `/srovnani`. Data publikace stávajících článků neměň.

## 5. Kontrola a náhled

1. `node build.mjs`, `npm test`, `npm run check:release`. Zapiš přesná čísla.
2. Náhled `node review/hero-a/serve.mjs public 8831`. Screenshoty `review/hero-a/shoot.mjs` do `review/srovnani-v2/shots/`:
   - úvodní stránka se `scrollTo` na sekci srovnání: CS a EN, 1440 a 390,
   - celý článek (`full: true`): CS a EN, 1440 a 390,
   - u všech `overflowX: false` a žádné chyby JS.
3. **`review/srovnani-v2/texty.md`: všechny nové a změněné texty CS i EN pod sebou** (tabulka na úvodní stránce, článek, patička, odkazy v článcích). U každého tvrzení o konkurenci zdroj. Kryštof chce každou změnu textu vidět před vydáním, tohle je pro něj.

## 6. Commit a hlášení

Commituj na `design/hero-a-2026-11` po logických krocích (sloučení základní větve; článek; úvodní stránka; zrušení `/srovnani` a test; odkazy v článcích; screenshoty a `texty.md`). **Bez pushe.**

Hlášení pro Kryštofa (předá ho Claudovi):
- hashe commitů,
- co jsi z rešerše použil a co vynechal a proč,
- čísla testů a kontroly,
- že běží `http://127.0.0.1:8831/`,
- otevřené otázky pro Kryštofa (minimálně: konečné datum článku, věta z testu TheirStacku, „Claude a ChatGPT“ v ceníku).
