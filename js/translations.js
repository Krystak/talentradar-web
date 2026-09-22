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
    page_title: "TalentRadar — nové pozice u vašich klientů v den, kdy se objeví",
    page_description: "Automatické sledování kariérních stránek firem pro personální agentury. Zjistěte o nových pozicích klientů v den, kdy se objeví na jejich webu.",

    /* ── Navigation ── */
    nav_how_it_works: "Jak to funguje",
    nav_live_radar: "Živý radar",
    nav_pricing: "Cena",
    nav_story: "Můj příběh",
    nav_faq: "Časté dotazy",
    nav_cta: "Vyzkoušet na 14 dní zdarma",

    /* ── Hero ── */
    hero_badge: "Vyvinuto na míru pro personální agentury v Evropě",
    hero_headline_html: "Know about new client mandates <span class=\"text-[#FF6B00]\">the day they go live</span>",
    hero_body: "Konec ručního proklikávání kariérních stránek a přepisování do Excelu. O nových rolích víte hned, jakmile je klient zveřejní — bez zpoždění a bez ruční práce.",
    hero_cta_full: "Zahájit 14denní bezplatný pilot — až 200 firem",
    hero_cta_short: "Zahájit 14denní bezplatný pilot",
    hero_microcopy: "Bez platební karty a bez závazků. Přístup do 15 minut, plné spuštění do 24 hodin.",

    /* ── Live Radar section ── */
    radar_label: "Živý radar",
    radar_headline: "Tohle se objevilo na kariérních stránkách firem za posledních 24 hodin",
    radar_subtext: "Seznam se aktualizuje sám, nikdo do něj ručně nesahá.",
    radar_updated: "Poslední aktualizace: dnes 06:22",
    radar_disclaimer: "(Ukázka toho, jak výstup vypadá — živá data vašich klientů po registraci)",
    radar_filter_all: "Všechny signály",
    radar_filter_tech: "Tech & Cloud",
    radar_filter_sales: "B2B Obchod",
    radar_filter_exec: "Executive & C-Level",
    radar_card_cta: "Sledovat firmu →",
    radar_footer_left: "Ukázka živého výstupu monitoringu — vaše firmy po registraci",
    radar_footer_right: "Vyzkoušet na svých firmách zdarma →",

    /* ── How It Works ── */
    how_headline: "Co uvidíte každý den ráno",
    how_subtext: "Načte se okamžitě, i když sledujete stovky firem.",
    how_step1_badge: "KROK 1",
    how_step1_title: "1. Ranní přehled (Sledované firmy)",
    how_step1_body: "Otevřete si homepage a během pár vteřin víte, u kterých vašich klientů a cílových firem se za noc něco pohnulo. Prioritní firmy a nově otevřené pozice vidíte přehledně hned nahoře.",
    how_step2_badge: "KROK 2",
    how_step2_title: "2. BD Master (Přehled rolí)",
    how_step2_body: "Kompletní přehled všech zachycených rolí na jednom místě, přesně tak, jak to v praxi potřebujete. Filtrujte podle firem, lokalit, technologií nebo seniority. Export do CSV zvládnete jedním klikem.",
    how_step3_badge: "KROK 3",
    how_step3_title: "3. Detail role & poznámky (Plná náhrada Excelu)",
    how_step3_body: "Rozklikněte si jakoukoliv roli pro zobrazení detailu a originálního inzerátu. Přímo u pozice si můžete psát interní poznámky, evidovat stav oslovení a synchronizovat práci s kolegy.",
    how_step3_tip: "Plně nahradí Excel: žádné zdlouhavé přepisování do tabulek, žádné duplicity — vše si evidujete přímo u konkrétní role.",
    how_onboarding_title: "Nulové tření — 100% asynchronní onboarding",
    how_onboarding_body: "Vložte domény vašich klientů nebo nahrajte CSV/Excel soubor při registraci. Náš engine indexuje cílové účty a ATS kariérní stránky do 24 hodin. Žádné konfigurační hovory nejsou nutné.",

    /* ── Comparison table ── */
    compare_headline: "Manuální chaos agentury vs. TalentRadar",
    compare_subtext: "Přímé porovnání každodenní práce headhuntera.",
    compare_col_activity: "Činnost",
    compare_col_manual: "Manuální chaos agentury",
    compare_col_radar: "TalentRadar",
    compare_row1_label: "Seznam klientských firem",
    compare_row1_manual: "Excel, který někdo kdysi založil",
    compare_row1_radar: "V aplikaci — přidání firmy = vložení odkazu",
    compare_row2_label: "Kontrola kariérních stránek",
    compare_row2_manual: "Někdo je jednou za čas obejde",
    compare_row2_radar: "Proběhne automaticky každý den",
    compare_row3_label: "Kdy víte o nové pozici",
    compare_row3_manual: "Až se k tomu někdo dostane",
    compare_row3_radar: "Ten den, kdy se objeví",
    compare_row4_label: "Dovolená nebo vytížení",
    compare_row4_manual: "Týden se nekontroluje nic",
    compare_row4_radar: "Běží to dál",
    compare_row5_label: "Staré, obsazené pozice",
    compare_row5_manual: "V Excelu zůstanou napořád",
    compare_row5_radar: "Zmizí samy (auto-archivace)",
    compare_row6_label: "Přidání nové firmy",
    compare_row6_manual: "Nový řádek v Excelu + ruční monitoring",
    compare_row6_radar: "Vložíte odkaz — od dalšího dne sledována",
    compare_row7_label: "Čas na správu",
    compare_row7_manual: "Pár hodin týdně",
    compare_row7_radar: "Ráno pár minut",

    /* ── Pricing ── */
    pricing_badge: "14denní bezplatný pilot pro až 200 firem • Bez platební karty",
    pricing_headline: "Přehledné tarify",
    pricing_subtext: "Každý tarif si můžete nejdříve na 14 dní zdarma vyzkoušet. Bez závazků, bez platební karty — skončit můžete kdykoliv.",
    pricing_monthly_note: "Pouze měsíční fakturace — žádné roční závazky",
    pricing_tier1_name: "Solo Scout",
    pricing_tier1_companies: "až 50 firem",
    pricing_tier1_price: "€119",
    pricing_tier1_period: "/ měsíc",
    pricing_tier1_desc: "Ideální pro sólo headhuntery a malé agentury.",
    pricing_tier1_f1: "Až 50 sledovaných firem",
    pricing_tier1_f2: "1× denní automatický ranní sken (06:00 UTC)",
    pricing_tier1_f3: "150 on-demand manuálních skenů / měsíc",
    pricing_tier1_f4: "1 uživatelský účet",
    pricing_tier1_f5: "Plná 2-fázová AI klasifikace (Gemini Flash: CORE / SELECTIVE / SKIP)",
    pricing_tier1_f6: "Automatická archivace zastaralých rolí",
    pricing_tier1_f7: "BD Master — pipeline, poznámky, CSV export",
    pricing_tier1_f8: "Přímá e-mailová podpora (< 24 h)",
    pricing_tier1_cta: "Zahájit 14denní bezplatný pilot",
    pricing_tier2_name: "Agency Pro",
    pricing_tier2_badge: "Nejoblíbenější",
    pricing_tier2_companies: "až 200 firem",
    pricing_tier2_price: "€289",
    pricing_tier2_period: "/ měsíc",
    pricing_tier2_desc: "Maximální rychlost a kapacita pro aktivní agenturní týmy.",
    pricing_tier2_speed_title: "Rychlostní náskok: 2× denně",
    pricing_tier2_speed_body: "Systém monitoruje klienty ráno i odpoledne. O nových pozicích víte v řádu hodin od jejich vypsání.",
    pricing_tier2_f1: "Až 200 sledovaných firem",
    pricing_tier2_f2: "2× denní automatické skeny (06:00 & 12:00 UTC)",
    pricing_tier2_f3: "500 on-demand manuálních skenů / měsíc",
    pricing_tier2_f4: "Až 8 týmových účtů",
    pricing_tier2_f5: "Plná 2-fázová AI klasifikace (všechny vertikály)",
    pricing_tier2_f6: "Automatická archivace + týmový auditní log",
    pricing_tier2_f7: "Multi-user přiřazení a sdílené poznámky",
    pricing_tier2_f8: "Prioritní kanál se zakladatelem (Slack)",
    pricing_tier2_cta: "Zahájit 14denní bezplatný pilot",
    pricing_tier3_name: "Scale / Enterprise",
    pricing_tier3_companies: "400+ firem",
    pricing_tier3_price: "Na míru",
    pricing_tier3_price_from: "od €590 / měsíc",
    pricing_tier3_desc: "Pro velké agenturní týmy a specifické integrační požadavky.",
    pricing_tier3_f1: "400+ sledovaných firem",
    pricing_tier3_f2: "Až 4× denní skeny / prioritní worker queue",
    pricing_tier3_f3: "Neomezené on-demand skeny",
    pricing_tier3_f4: "Neomezené týmové účty",
    pricing_tier3_f5: "Vlastní AI scoring profily na konzultanta / praktiku",
    pricing_tier3_f6: "Dedikované scrapovací adaptéry pro nestandardní kariérní weby",
    pricing_tier3_f7: "Dedikovaný Slack kanál & account management",
    pricing_tier3_cta: "Kontaktovat zakladatele",
    pricing_roi_html: "Jediné umístění v tech nebo executive search zaplatí <strong>4+ roky Agency Pro</strong>. Zachytit jeden mandát 48 hodin dříve generuje okamžitou <strong>ROI 4 000 %+</strong>.",
    pricing_footnote: "Standardní ATS (Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Teamio, Recruitis) naběhnou ihned. U atypických vlastních webů si dopředu řekneme proveditelnost.",

    /* ── Story / About ── */
    story_label: "Kdo za tím stojí",
    story_headline: "Od ručního proklikávání webů k automatickému radaru",
    story_p1_html: "Když jsem nastoupil na stáž do dublinské agentury Ingenio Global pod vedením <a href=\"https://www.linkedin.com/in/rob-magee-749891/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Roba Mageeho</a>, jedním z mých prvních úkolů bylo ručně obcházet weby klientů a nově vypsané pozice řádek po řádku přepisovat do tabulek.",
    story_p2: "Byla to neuvěřitelně pomalá práce, snadno se v ní dělaly chyby a byl to čistý žrout času. Místo ručního doplňování tabulek jsem přímo během stáže začal psát systém, který kariérní stránky klientů hlídal sám.",
    story_p3: "Během dalších dvou měsíců systém běžel v ostrém provozu: hlídal 180 firem a zachytil přes 3 400 otevřených pozic. Konzultanti se o nových rolích dozvěděli v den, kdy je klient vypsal na web — aniž by museli hnout prstem.",
    story_p4: "Po návratu z Dublinu mi bylo jasné, že stejným ručním procházením webů pálí desítky hodin týdně většina headhunterů v celé Evropě. TalentRadar je nástroj, který tenhle problém řeší.",
    story_p5: "Systém vyvíjím i provozuji sám. Když se ozvete, odpovídám vám přímo já.",
    story_author_name: "Kryštof Pejša",
    story_author_title: "Zakladatel TalentRadar",
    story_linkedin: "Můj LinkedIn",

    /* ── FAQ ── */
    faq_label: "Odpovědi na rovinu",
    faq_headline: "Časté dotazy",
    faq_q1: "Jak zjistíte pozice dříve než LinkedIn?",
    faq_a1: "Firmy nejprve zveřejňují pozice zdarma na vlastních kariérních stránkách nebo ATS systémech — pracovní agregátory jako LinkedIn mají zpoždění a účtují poplatky za zveřejnění. TalentRadar sleduje tyto primární zdroje přímo, takže zachytíte pozici v okamžiku jejího zveřejnění — typicky 24–72 hodin dříve než se objeví na job boardech.",
    faq_q2: "Které ATS platformy jsou podporovány?",
    faq_a2: "Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Teamio, Recruitis a vlastní kariérní stránky. U atypických enterprise kariérních webů vyvíjíme dedikované adaptéry (součást tarifu Scale/Enterprise).",
    faq_q3: "Co se stane, když klient obsadí pozici?",
    faq_a3: "Náš auto-archive démon detekuje odstraněné inzeráty při dalším skenu a automaticky je archivuje. Váš pipeline zůstane aktuální bez jakéhokoli manuálního čištění.",
    faq_q4: "Jak funguje 14denní bezplatný pilot?",
    faq_a4: "Sledujte až 200 klientských firem s plným přístupem ke skenování po dobu 14 dní. Není vyžadována platební karta a pilot se automaticky nepřevede na placený tarif — sami se rozhodnete, zda chcete pokračovat.",
    faq_q5: "Můžeme exportovat naše poznámky a data?",
    faq_a5: "Ano. Jedním klikem exportujte kompletní BD pipeline, poznámky a metadata rolí do CSV kdykoli — vaše data jsou vždy vaše.",

    /* ── Trial / CTA section ── */
    trial_badge: "14denní bezplatný pilot • Bez platební karty",
    trial_headline: "Vyzkoušejte TalentRadar na svých klientech",
    trial_subtext: "Nahrajte seznam vašich klientů nebo vložte jejich domény. Do 15 minut vám pošleme přihlašovací údaje a do 24 hodin garantujeme plné napojení vašich firem a spuštění ranního skenu.",
    trial_label_name: "Jméno a příjmení *",
    trial_placeholder_name: "Jan Novák",
    trial_label_email: "Pracovní e-mail *",
    trial_placeholder_email: "jan@agentura.cz",
    trial_label_company: "Název agentury / firmy *",
    trial_placeholder_company: "Vaše agentura s.r.o.",
    trial_label_clients: "Seznam klientů k monitoringu",
    trial_clients_limit: "(až 200 firem)",
    trial_clients_tag: "Excel, CSV nebo text",
    trial_upload_cta: "Klikněte pro nahrání souboru",
    trial_upload_types: "(Excel .xlsx, .csv nebo .txt)",
    trial_textarea_placeholder: "Nebo sem vložte seznam firem textem (stačí domény nebo názvy, každý na nový řádek)",
    trial_upload_note: "Kariérní weby a ATS portály dohledáme za vás. Soubor můžete poslat i dodatečně.",
    trial_pill1: "Až 200 firem",
    trial_pill2: "Denní ranní sken",
    trial_pill3: "Bez platební karty",
    trial_pill4: "Start do 24 hod",
    trial_submit: "Aktivovat 14denní bezplatný pilot →",
    trial_submitting: "Aktivuji pilotní verzi…",
    trial_speed_note: "Login do aplikace pošleme do 15 minut. Plnou funkčnost vašich firem garantujeme do 24 hodin.",
    trial_gdpr_html: "Odesláním souhlasíte se zpracováním kontaktních údajů pro vytvoření zkušebního účtu. Údaje nikomu nepředávám. (<a href=\"gdpr.html\" class=\"underline hover:text-[#FF8533]\">Zásady zpracování</a>)",
    trial_contact_prefix: "Nebo napište přímo:",
    trial_success_headline: "Váš pilot je na cestě!",
    trial_success_step1_html: "<strong>Přihlašovací údaje</strong> vám pošleme na e-mail do <strong>15 minut</strong>.",
    trial_success_step2_html: "<strong>Vaše firmy</strong> zvalidujeme a <strong>do 24 hodin garantujeme spuštění prvního skenu</strong>.",
    trial_success_note: "Žádné poplatky, žádná platební karta. Po 14 dnech se sami rozhodnete.",

    /* ── Footer ── */
    footer_tagline: "Autonomní monitoring kariérních stránek pro personální agentury",
    footer_author: "Kryštof Pejša",
    footer_gdpr: "Zásady zpracování osobních údajů",
    footer_copyright: "© 2026 TalentRadar",

    /* ── Language switcher ── */
    lang_switcher_label: "🌐",
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
