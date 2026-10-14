/**
 * TalentRadar — Czech (cs) translation dictionary
 * Usage: every translatable element in index.html carries a data-i18n="key"
 * attribute. The switcher replaces textContent for simple keys,
 * and innerHTML for keys ending in "_html" (may contain safe inline tags).
 *
 * Keys follow a flat namespace: section_element_descriptor
 */

const TRANSLATIONS = {
  cs: {
    /* ── SEO (swapped via JS on <title> and <meta> description) ── */
    page_title: "TalentRadar — Věnujte čas uzavírání, ne hledání",
    page_description: "Autonomní monitoring kariérních stránek pro personální agentury. Věnujte čas uzavírání, ne hledání. Zjistěte o nových pozicích klientů v den, kdy se objeví.",

    /* ── Navigation ── */
    nav_slogan: "Věnujte čas uzavírání, ne hledání",
    nav_how_it_works: "Jak to funguje",
    nav_live_radar: "Živý radar",
    nav_pricing: "Ceník",
    nav_whats_new: "Co je nového ↗",
    nav_story: "Náš příběh",
    nav_faq: "Časté dotazy",
    nav_demo: "Živé demo ↗",
    nav_cta: "Zahájit 14denní pilot",
    nav_cta_short: "Pilot zdarma",

    /* ── Hero ── */
    hero_badge: "Věnujte čas uzavírání, ne hledání",
    hero_headline_html: "Nové pozice u vašich klientů <span class=\"text-[#FF6B00]\">v den, kdy se objeví</span>",
    hero_body: "Konec ručního proklikávání kariérních stránek a přepisování do Excelu. TalentRadar hlídá každé ATS a kariérní web na vašem seznamu — abyste věnovali čas uzavírání zakázek, ne hledání pozic.",
    hero_cta_full: "Zahájit 14denní bezplatný pilot — až 200 firem",
    hero_cta_short: "Zahájit 14denní bezplatný pilot",
    hero_demo_btn: "Otevřít živé demo ↗",
    hero_microcopy: "Bez platební karty a bez závazků. Až 200 sledovaných firem a 8 týmových účtů.",

    /* ── Live Radar section ── */
    radar_label: "Živý radar",
    radar_disclaimer: "(Ukázka živého monitoringu — po registraci nastavíme váš vlastní seznam firem)",
    radar_demo_banner_title: "Chcete si projít tyto pozice přímo v aplikaci?",
    radar_demo_banner_desc: "Otevřete si interaktivní živé demo bez registrace se všemi 10 firmami.",
    radar_demo_banner_btn: "Otevřít živý dashboard →",
    radar_card_cta: "Sledovat firmu →",
    radar_monitored_title: "10 evropských tech lídrů sledovaných denně v této živé ukázce:",
    radar_footer_left: "Ukázka živého výstupu monitoringu — vaše klientské firmy po registraci",
    radar_footer_right: "Vyzkoušet na svých firmách — 14 dní zdarma →",

    /* ── What You See Every Morning (Product Tour) ── */
    how_badge: "Prohlídka produktu",
    how_headline: "Co uvidíte každý den ráno",
    how_subtext: "Načte se okamžitě, i když sledujete stovky firem.",
    how_open_demo: "Otevřít živé demo ↗",

    how_step1_badge: "1. HOME",
    how_step1_title: "1. Ranní přehled (Homepage)",
    how_step1_body: "Otevřete si homepage a během pár vteřin víte, u kterých vašich klientů se od posledního skenu něco pohnulo. Prioritní firmy, nově otevřené pozice i zmizelé role vidíte přehledně hned nahoře.",

    how_step2_badge: "2. BD MASTER",
    how_step2_title: "2. BD Master (Kompletní přehled rolí)",
    how_step2_body: "Kompletní tabulka všech zachycených rolí s filtry podle firem, lokalit nebo seniority. Před firmou vidíte označení C (klient) nebo P (prospekt), klíčové role si označíte hvězdičkou a filtrovaná data exportujete do CSV jedním klikem.",

    how_step3_badge: "3. DETAIL ROLE",
    how_step3_title: "3. Detail role (AI shrnutí & pipeline stepper)",
    how_step3_body: "Rozklikněte jakoukoli roli pro okamžité AI shrnutí: o čem pozice skutečně je, jaké jsou klíčové požadavky a připravený háček pro první zprávu hiring managerovi. Stav oslovení posouváte přímo v pipeline stepperu.",

    how_step4_badge: "4. SKENER",
    how_step4_title: "4. Skener (Správa firem & automatické běhy)",
    how_step4_body: "Výběr firem ke skenování, detekce kariérních systémů, rozvrh automatických skenů v místním čase vašeho workspace i kompletní historie běhů. V případě potřeby spustíte manuální sken jedné nebo všech firem.",

    how_step5_badge: "5. AI HAWK",
    how_step5_title: "5. AI Hawk (Asistent na Ctrl+K)",
    how_step5_body: "Kdykoli stiskněte Ctrl+K pro chat nad živými daty vašeho workspace. Ptejte se běžnou řečí — třeba kolik máte aktivních CORE rolí nebo které firmy vypsaly nové seniorní pozice.",

    how_onboarding_title: "Jednoduché asynchronní nastavení",
    how_onboarding_body: "Při registraci nám nahrajte seznam vašich klientů v CSV nebo Excelu. My vaše firmy nastavíme a propojíme s jejich kariérními weby. Žádné zdlouhavé konfigurační hovory.",

    /* ── Specialization Profile (Pro koho a jak to rozhoduje) ── */
    spec_badge: "Profil specializace",
    spec_headline: "Nastaveno podle specializace vaší agentury",
    spec_body: "V Nastavení → Specializace si určíte profil pozic, které vaše agentura skutečně obsazuje: CORE pro prioritní role, SELECTIVE pro okrajové příležitosti a SKIP pro zbytek. Stejně tak nastavíte klíčové, selektivní nebo blokované trhy. Radar podle toho okamžitě zařadí každou novou roli. A když pozice z webu klienta zmizí, systém ji po dvou vynechaných skenech sám archivuje.",
    spec_f1_title: "CORE / SELECTIVE / SKIP",
    spec_f1_desc: "Každá nová pozice je automaticky vyhodnocena podle profilu rolí vaší agentury.",
    spec_f2_title: "Klíčové a blokované trhy",
    spec_f2_desc: "Jasné rozlišení preferovaných a irelevantních lokalit na úrovni zemí i měst.",
    spec_f3_title: "Automatická archivace",
    spec_f3_desc: "Obsazené pozice zmizí z pipeline samy, jakmile je klient stáhne z kariérního webu.",

    /* ── Comparison table ── */
    compare_headline: "Tabulky a chaos vs. TalentRadar",
    compare_subtext: "Přímé srovnání každodenní práce při hledání nových zakázek.",
    compare_col_activity: "Činnost",
    compare_col_manual: "Starý způsob (Excel)",
    compare_col_radar: "TalentRadar",
    compare_row1_label: "Seznam klientských firem",
    compare_row1_manual: "Excel, který někdo kdysi založil",
    compare_row1_radar: "V aplikaci — přidání firmy vložením odkazu",
    compare_row2_label: "Kontrola kariérních stránek",
    compare_row2_manual: "Někdo je jednou za čas ručně obejde",
    compare_row2_radar: "Proběhne automaticky každý den",
    compare_row3_label: "Kdy víte o nové pozici",
    compare_row3_manual: "Až se k tomu někdo dostane",
    compare_row3_radar: "V den, kdy se objeví na webu",
    compare_row4_label: "Dovolená nebo vytížení",
    compare_row4_manual: "Týden se nekontroluje nic",
    compare_row4_radar: "Běží dál bez přerušení",
    compare_row5_label: "Staré, obsazené pozice",
    compare_row5_manual: "V tabulce zůstanou napořád",
    compare_row5_radar: "Archivují se samy, jakmile pozice zmizí",
    compare_row6_label: "Přidání nové firmy",
    compare_row6_manual: "Nový řádek v Excelu a ruční hlídání",
    compare_row6_radar: "Vložíte odkaz — sledována od dalšího skenu",
    compare_row7_label: "Čas na správu",
    compare_row7_manual: "Několik hodin týdně",
    compare_row7_radar: "Ráno pár minut",

    /* ── Pricing ── */
    pricing_badge: "14denní bezplatný pilot pro až 200 firem • Bez platební karty",
    pricing_headline: "Přehledné tarify",
    pricing_subtext: "Každý tarif si můžete nejdříve na 14 dní zdarma vyzkoušet. Bez závazků, bez platební karty — skončit můžete kdykoliv.",
    pricing_monthly_note: "Pouze měsíční fakturace — žádné roční závazky",

    pricing_tier1_name: "Starter",
    pricing_tier1_companies: "až 50 firem",
    pricing_tier1_price: "€119",
    pricing_tier1_period: "/ měsíc",
    pricing_tier1_desc: "Ideální pro sólo headhuntery a menší agentury.",
    pricing_tier1_f1: "Až 50 sledovaných firem",
    pricing_tier1_f2: "1× denní automatický sken (06:00 v místním čase)",
    pricing_tier1_f3: "150 manuálních kreditů na skeny / týden",
    pricing_tier1_f4: "1 uživatelský účet",
    pricing_tier1_f5: "AI shoda rolí (CORE / SELECTIVE / SKIP) podle profilu agentury",
    pricing_tier1_f6: "Automatická archivace rolí, jakmile zmizí z webu",
    pricing_tier1_f7: "BD Master — přehled rolí, filtry a export do CSV",
    pricing_tier1_f8: "Přímá e-mailová podpora",
    pricing_tier1_cta: "Zahájit 14denní bezplatný pilot",

    pricing_tier2_name: "Agency Pro",
    pricing_tier2_badge: "Nejoblíbenější",
    pricing_tier2_companies: "až 200 firem",
    pricing_tier2_price: "€289",
    pricing_tier2_period: "/ měsíc",
    pricing_tier2_desc: "Maximální rychlost a kapacita pro aktivní agenturní týmy.",
    pricing_tier2_speed_title: "Rychlostní náskok: 2× denně",
    pricing_tier2_speed_body: "Automatické skeny běží v 06:00 a 12:00 v časovém pásmu vašeho workspace.",
    pricing_tier2_f1: "Až 200 sledovaných firem",
    pricing_tier2_f2: "2× denní automatické skeny (06:00 a 12:00 v místním čase)",
    pricing_tier2_f3: "500 manuálních kreditů na skeny / týden",
    pricing_tier2_f4: "Až 8 týmových účtů",
    pricing_tier2_f5: "AI shoda rolí (CORE / SELECTIVE / SKIP) podle profilu agentury",
    pricing_tier2_f6: "Automatická archivace rolí, jakmile zmizí z webu",
    pricing_tier2_f7: "BD Master — správa pipeline, poznámky týmu a CSV export",
    pricing_tier2_f8: "Přímá podpora se zakladatelem",
    pricing_tier2_cta: "Zahájit 14denní bezplatný pilot →",

    pricing_tier3_name: "Enterprise",
    pricing_tier3_companies: "Větší seznamy firem",
    pricing_tier3_price: "Na míru",
    pricing_tier3_desc: "Pro velké agenturní týmy a specifické integrační požadavky.",
    pricing_tier3_f1: "Větší seznamy sledovaných firem na míru",
    pricing_tier3_f3: "Kapacita manuálních skenů přizpůsobená týmu",
    pricing_tier3_f4: "Přístup pro celý váš agenturní tým",
    pricing_tier3_f5: "Vlastní profil rolí a specializace pro agenturu",
    pricing_tier3_f6: "Adaptéry pro nestandardní kariérní weby po ověření proveditelnosti",
    pricing_tier3_f7: "Přímý kontakt se zakladatelem a prioritní onboarding",
    pricing_tier3_cta: "Kontaktovat zakladatele",

    pricing_footnote: "Podporované ATS: Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Recruitee, Workday, BambooHR, Personio, Teamtailor, Pinpoint, Teamio, Jobs.cz a běžné kariérní stránky. U atypických vlastních webů si dopředu řekneme proveditelnost.",

    /* ── Story / About ── */
    story_label: "Kdo za tím stojí",
    story_headline: "Od ručního proklikávání webů k automatickému radaru",
    story_p1_html: "Když jsem nastoupil na stáž do dublinské agentury Ingenio Global pod vedením <a href=\"https://www.linkedin.com/in/rob-magee-749891/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Roba Mageeho</a>, jedním z mých prvních úkolů bylo ručně obcházet weby klientů a nově vypsané pozice řádek po řádku přepisovat do tabulek.",
    story_p2: "Byla to neuvěřitelně pomalá práce, snadno se v ní dělaly chyby a byl to čistý žrout času. Místo ručního doplňování tabulek jsem přímo během stáže začal psát systém, který kariérní stránky klientů hlídal sám.",
    story_p3: "Během dalších měsíců systém běžel v ostrém provozu na skoro 300 firmách. Konzultanti se o nových rolích dozvěděli v den, kdy je klient vypsal na web — aniž by museli hnout prstem.",
    story_p4: "Po návratu z Dublinu mi bylo jasné, že stejným ručním procházením webů pálí desítky hodin týdně většina headhunterů v celé Evropě. TalentRadar je nástroj, který tenhle problém řeší.",
    story_p5: "Systém vyvíjím i provozuji sám. Když se ozvete, odpovídám vám přímo já.",
    story_author_name: "Kryštof Pejša",
    story_author_title: "Zakladatel TalentRadar",
    story_linkedin: "Můj LinkedIn",

    /* ── FAQ ── */
    faq_label: "Odpovědi na rovinu",
    faq_headline: "Časté dotazy",
    faq_q1: "Jak zjistíte pozice dříve než na job boardech?",
    faq_a1: "Firmy zveřejňují inzeráty nejdříve na vlastní kariérní stránce nebo v ATS. TalentRadar čte přímo tyto primární zdroje u firem z vašeho seznamu, takže novou roli uvidíte hned po dalším skenu, bez čekání na job boardy.",
    faq_q2: "Jak TalentRadar pozná, které pozice jsou pro nás relevantní?",
    faq_a2: "Podle profilu rolí vaší agentury v Nastavení → Specializace. Určíte si role, které obsazujete, jako CORE, SELECTIVE nebo SKIP (z hotových předloh nebo z vlastního CSV) a trhy jako klíčové, selektivní či blokované. Před uložením přesně vidíte, kterých rolí se změna dotkne, a nové pozice se podle toho samy třídí.",
    faq_q3: "Které ATS platformy a kariérní weby jsou podporovány?",
    faq_a3: "Skener podporuje Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Recruitee, Workday, BambooHR, Personio, Teamtailor, Pinpoint, Teamio, Jobs.cz i běžné kariérní stránky. U atypických kariérních webů předem ověříme technickou proveditelnost.",
    faq_q4: "Stahujete data z LinkedInu nebo job boardů?",
    faq_a4: "Ne. Radar čte výhradně veřejné kariérní stránky a ATS portály firem, které sami sledujete. LinkedIn slouží pouze jako přímý odkaz pro vaše konzultanty (např. pro dohledání decision-makerů ve firmě), nic z něj nestahujeme.",
    faq_q5: "Co když kariérní stránka není podporovaná nebo přestane fungovat?",
    faq_a5: "Firmy s nefunkční nebo nedostupnou kariérní stránkou systém přehledně ukazuje na Domově v sekci „Vyžaduje pozornost“ a umí je vypsat i AI Hawk. U nestandardních portálů ověřujeme proveditelnost předem.",
    faq_q6: "Co se stane, když klient obsadí pozici?",
    faq_a6: "Jakmile pozice zmizí z kariérního webu, TalentRadar ji po dvou vynechaných skenech automaticky archivuje, takže váš pipeline zůstává čistý bez ruční práce.",
    faq_q7: "Může v aplikaci pracovat celý náš tým?",
    faq_a7: "Ano, podle zvoleného tarifu (Starter obsahuje 1 uživatele, Agency Pro až 8). Každá role má sdílené vlákno poznámek týmu a stav v pipeline. Hvězdička u role je osobní pro každého konzultanta.",
    faq_q8: "Jak funguje 14denní bezplatný pilot?",
    faq_a8: "Vyzkoušíte si limity tarifu Agency Pro — až 200 klientských firem, 8 uživatelů a 2 automatické skeny denně po dobu 14 dní. Bez platební karty. Po skončení pilotu se zastaví automatické skeny a nepůjdou přidávat nové firmy ani uživatelé. Přihlásit se ale můžete dál, vaše data zůstávají zachována, nic se nemaže a nic se nestrhává automaticky.",
    faq_q9: "Můžeme exportovat zachycená data?",
    faq_a9: "Ano. V BD Masteru můžete jedním klikem vyexportovat právě vyfiltrované role včetně metadat do CSV souboru. Export plně respektuje vaše aktivní filtry.",
    faq_q10: "Integruje se TalentRadar s naším CRM nebo ATS (Bullhorn, Vincere…)?",
    faq_a10: "Role lze z BD Masteru jedním klikem vyexportovat do CSV souboru a seznam firem z Nastavení → Export a audit, připravené k importu do libovolného CRM nebo ATS. Přímé integrace systém nenabízí.",
    faq_q11: "Kde jsou uložena naše data?",
    faq_a11_html: "Vaše data jsou hostována v EU. TalentRadar ukládá pouze veřejné inzeráty a údaje vašeho týmu (uživatelé, poznámky, stavy v pipeline a nastavení) — žádná data kandidátů. Podrobnosti najdete v <a href=\"gdpr.html\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Zásadách zpracování osobních údajů</a>.",

    /* ── Trial / CTA section ── */
    trial_badge: "14denní bezplatný pilot • Bez platební karty",
    trial_headline: "Vyzkoušejte TalentRadar na svých klientech",
    trial_subtext: "Nahrajte seznam vašich klientů v CSV nebo Excel souboru. Nastavíme váš workspace a pošleme vám přihlašovací údaje na e-mail.",
    trial_label_name: "Jméno a příjmení *",
    trial_placeholder_name: "Jan Novák",
    trial_label_email: "Pracovní e-mail *",
    trial_placeholder_email: "jan@agentura.cz",
    trial_label_company: "Název agentury / firmy *",
    trial_placeholder_company: "Vaše agentura s.r.o.",
    trial_label_clients: "Seznam klientů k monitoringu",
    trial_clients_limit: "(až 200 firem)",
    trial_clients_tag: "Excel nebo CSV",
    trial_upload_cta: "Klikněte pro nahrání souboru",
    trial_upload_types: "(Excel .xlsx, .xls nebo .csv)",
    trial_example_title: "Jak má soubor vypadat",
    trial_example_hint: "Záhlaví není povinné",
    trial_example_col_a: "Firma",
    trial_example_col_b: "Kariérní stránka",
    trial_example_col_c: "LinkedIn firmy (volitelné)",
    trial_example_note: "Máte jen názvy firem? Sloupce B a C můžete nechat prázdné — kariérní weby dohledáme sami.",
    trial_upload_note: "Kariérní weby a ATS portály dohledáme za vás. Soubor můžete poslat i dodatečně.",
    trial_pill1: "Až 200 firem",
    trial_pill2: "2× denní sken",
    trial_pill3: "Bez platební karty",
    trial_pill4: "14 dní zdarma",
    trial_submit: "Aktivovat 14denní bezplatný pilot →",
    trial_submitting: "Aktivuji pilotní verzi…",
    trial_speed_note: "Nastavíme váš workspace a přihlašovací údaje vám zašleme e-mailem.",
    trial_gdpr_html: "Odesláním souhlasíte se zpracováním kontaktních údajů pro vytvoření zkušebního účtu. Údaje nikomu nepředávám. (<a href=\"gdpr.html\" class=\"underline hover:text-[#FF8533]\">Zásady zpracování</a>)",
    trial_contact_prefix: "Nebo napište přímo:",
    trial_success_headline: "Váš pilot je na cestě!",
    trial_success_step1_html: "<strong>Přihlašovací údaje</strong> vám pošleme na e-mail po nastavení workspace.",
    trial_success_step2_html: "<strong>Vaše firmy</strong> propojíme a spustíme první automatický sken.",
    trial_success_note: "Žádné poplatky, žádná platební karta. Po 14 dnech se sami rozhodnete.",

    /* ── Footer ── */
    footer_tagline: "Věnujte čas uzavírání, ne hledání",
    footer_author: "Kryštof Pejša",
    footer_whats_new: "Co je nového ↗",
    footer_gdpr: "Zásady zpracování osobních údajů",
    footer_copyright: "© 2026 TalentRadar",

    /* ── Language switcher ── */
    lang_switcher_label: "",
  }
};

/* ─────────────────────────────────────────────
   Language Switcher Engine
───────────────────────────────────────────── */
(function () {
  const STORAGE_KEY = 'tr_lang';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    if (lang === 'en') {
      // Restore all original English content from data-i18n-en attributes
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const original = el.getAttribute('data-i18n-en');
        if (original !== null) {
          if (el.getAttribute('data-i18n-html') === 'true') {
            el.innerHTML = original;
          } else {
            el.textContent = original;
          }
        }
      });

      // Restore input placeholders
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const original = el.getAttribute('data-i18n-placeholder-en');
        if (original !== null) {
          el.placeholder = original;
        }
      });

      // Restore page title and meta description
      document.title = document.querySelector('meta[name="tr-title-en"]')?.content || document.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        const enDesc = document.querySelector('meta[name="tr-desc-en"]');
        if (enDesc) metaDesc.content = enDesc.content;
      }
    } else {
      const dict = TRANSLATIONS[lang];
      if (!dict) return;

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!dict[key]) return;

        // Save English original on first switch
        if (el.getAttribute('data-i18n-en') === null) {
          el.setAttribute('data-i18n-en',
            el.getAttribute('data-i18n-html') === 'true' ? el.innerHTML : el.textContent
          );
        }

        if (el.getAttribute('data-i18n-html') === 'true') {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      });

      // Translate input placeholders
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (!dict[key]) return;
        if (el.getAttribute('data-i18n-placeholder-en') === null) {
          el.setAttribute('data-i18n-placeholder-en', el.placeholder);
        }
        el.placeholder = dict[key];
      });

      // Swap page title & meta description
      const titleEl = document.querySelector('meta[name="tr-title-en"]');
      if (!titleEl) {
        // Save current EN title first time
        const saveMeta = document.createElement('meta');
        saveMeta.name = 'tr-title-en';
        saveMeta.content = document.title;
        document.head.appendChild(saveMeta);
      }
      if (dict.page_title) document.title = dict.page_title;

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        const saveDesc = document.querySelector('meta[name="tr-desc-en"]');
        if (!saveDesc) {
          const sd = document.createElement('meta');
          sd.name = 'tr-desc-en';
          sd.content = metaDesc.content;
          document.head.appendChild(sd);
        }
        if (dict.page_description) metaDesc.content = dict.page_description;
      }
    }

    // Update switcher UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('lang-btn--active', btnLang === lang);
    });

    window.dispatchEvent(new CustomEvent('talentradar:langchange', { detail: { lang } }));
  }

  // Wire up buttons after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyLanguage(btn.getAttribute('data-lang'));
      });
    });

    // Apply saved or default language on load
    if (currentLang !== 'en') {
      applyLanguage(currentLang);
    }
  });

  // Expose for inline use
  window.TRLang = { apply: applyLanguage, current: () => currentLang };
})();
