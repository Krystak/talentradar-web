/**
 * TalentRadar — Official English (en) and Czech (cs) Translation Dictionary
 * 100% Mirrored keys across both languages.
 * Slogan remains strictly in English across both language modes.
 */

const TRANSLATIONS = {
  en: {
    /* ── SEO ── */
    page_title: "TalentRadar — Spend Time Closing, Not Searching",
    page_description: "Autonomous B2B recruitment intelligence and lightweight ATS for agencies across Europe. Spot your clients' open roles the hour they post them, days before LinkedIn.",

    /* ── Navigation ── */
    nav_slogan: "Spend time closing, not searching.",
    nav_modes: "Features",
    nav_live_radar: "Interactive Demo",
    nav_comparison: "The Advantage",
    nav_pricing: "Pricing",
    nav_insights: "Research & Blog",
    nav_story: "Our Story",
    nav_faq: "FAQ",
    nav_signin: "Sign In",
    nav_cta: "Start 14-Day Free Pilot",
    nav_demo: "Live Demo ↗",

    /* ── Hero ── */
    hero_badge: "Autonomous BD Intelligence & Lightweight ATS for Recruitment Teams",
    hero_headline_html: "Spot your clients’ open roles the hour they post them.<br><span class=\"text-[#FF6B00]\">Days before LinkedIn.</span>",
    hero_subheadline: "Stop wasting recruiter hours manually checking client career portals or waiting for crowded job boards. TalentRadar monitors enterprise career sites and ATS endpoints twice daily. Use it as an upstream BD radar alongside your existing ATS, or switch on our lightweight pipeline module to run your entire boutique agency.",
    hero_cta_btn: "Start 14-Day Free Pilot",
    hero_demo_btn: "Try the interactive demo",
    hero_trust_microcopy: "✓ No credit card required  •  ✓ Track up to 200 companies  •  ✓ Set up within 24 hours",

    /* ── Interactive Hero Switcher & Mockup ── */

    /* ── Workflows Section ── */
    modes_badge: "Workflow Options",
    modes_headline: "Choose How TalentRadar Fits Your Agency Workflow",
    modes_subtext: "Whether you run an established 50-consultant firm with Bullhorn or a 3-person boutique on Notion, TalentRadar works without forced migrations or complex setup.",
    modes_a_badge: "BD SIGNALS",
    modes_b_badge: "FULL WORKSPACE",
    modes_a_title: "BD Signals (Keep Your Existing ATS)",
    modes_a_badge_sub: "Bullhorn • Datacruit • Recruitis",
    modes_a_target: "For Established Agencies (5–50 consultants with Bullhorn, Datacruit, Recruitis, or Echo)",
    modes_a_fear: "Your concern: \"We don't want to migrate our database or replace our existing ATS.\"",
    modes_a_solution: "TalentRadar operates upstream of your ATS as an autonomous vacancy detection radar. It monitors client career portals twice daily, alerts you to new roles on Day Zero, and enables 1-click export directly into your existing CRM.",
    modes_a_f1: "Monitors primary ATS endpoints (Greenhouse, Lever, Workable, Ashby, etc.)",
    modes_a_f2: "2× daily automated scans (06:00 & 12:00 in your time zone)",
    modes_a_f3: "Likely hiring manager with 1-click LinkedIn and Google X-Ray search",
    modes_a_f4: "Instant CSV / Webhook push into Bullhorn, Datacruit, or Recruitis",
    modes_a_cta: "Deploy Upstream Radar →",
    modes_b_title: "Full Workspace (Replace Excel & Notion)",
    modes_b_badge_sub: "Excel / Notion Replacement",
    modes_b_target: "For Boutique & Micro-Agencies (1–10 consultants running on Excel, Notion, or Trello)",
    modes_b_fear: "Your pain: \"Spreadsheets are chaotic, we lose track of mandates, and enterprise ATS tools are bloated and expensive.\"",
    modes_b_solution: "A lean mandate pipeline and candidate tracker attached directly to discovered client openings. Everything you need to manage active searches without corporate overhead.",
    modes_b_f1: "Discovered client roles convert into active agency mandates in 1 click",
    modes_b_f2: "Candidate pipeline: Shortlisted → CV sent → Interviews → Offer → Placed",
    modes_b_f3: "Shared recruiter notes, fee tracking, and candidate interaction logs",
    modes_b_f4: "Zero bloat, zero migration friction, completely spreadsheet-free",
    modes_b_cta: "Activate Full Workspace →",

    /* ── Live Radar Showcase (Mini-App Sandbox) ── */
    radar_badge: "Interactive demo",
    radar_headline: "Click through the whole platform. No sign-up.",
    radar_subtext: "A light version of the TalentRadar workspace, tracking 19 Czech tech companies. Open a role, find the hiring manager, turn it into a mandate, run a scan or ask AI Hawk. Then carry on in the full demo.",
    radar_footnote: "The sandbox runs entirely in your browser on sample data. The full demo is the real app on a live workspace.",

    /* ── Comparison Table ── */
    compare_badge: "Operational Audit",
    compare_headline: "Manual Agency Workflow vs. TalentRadar Autonomous Advantage",
    compare_subtext: "A direct contrast of the daily business development routine.",
    compare_col_activity: "Operational Dimension",
    compare_col_manual: "Traditional Agency Workflow",
    compare_col_radar: "TalentRadar Autonomous Advantage",
    compare_row1_label: "Career Portal Monitoring",
    compare_row1_manual: "Manual, random browsing that eats hours of every consultant's week.",
    compare_row1_radar: "Autonomous monitoring <strong>2× daily</strong> (06:00 & 12:00 in your time zone).",
    compare_row2_label: "Discovery Latency",
    compare_row2_manual: "Days of waiting before a role shows up on job boards or LinkedIn.",
    compare_row2_radar: "<strong>Day Zero discovery</strong> — hours after publication, days before LinkedIn.",
    compare_row3_label: "Ghost & Filled Roles",
    compare_row3_manual: "Recruiters waste time pitching candidates for roles silently filled weeks ago.",
    compare_row3_radar: "<strong>Auto-Archive</strong> removes closed vacancies once they are gone from the client's careers page.",
    compare_row4_label: "Candidate & Mandate Tracking",
    compare_row4_manual: "Fragmented notes scattered in personal spreadsheets, Notion, or paper pads.",
    compare_row4_radar: "<strong>Unified BD Master</strong> with optional 1-click lightweight candidate pipeline.",
    compare_row5_label: "Adding New Accounts",
    compare_row5_manual: "Manual spreadsheet data entry + constant manual reminder checking.",
    compare_row5_radar: "Paste any company career URL — <strong>automated tracking</strong> begins on the next scan.",
    compare_row6_label: "Weekly Management Cost",
    compare_row6_manual: "Hours of administrative overhead every single Monday morning.",
    compare_row6_radar: "<strong>3-minute morning pulse</strong> with AI sales pitch hooks and team audit trails.",

    /* ── Intelligence Lab / Blog Teasers ── */
    insights_badge: "Research & BD Playbooks",
    insights_headline: "Research & BD Playbooks for Recruitment Agencies",
    insights_subtext: "Practical business development playbooks built on public hiring research, with every number linked to its source.",
    insights_card1_badge: "MARKET ANALYSIS · 5 MIN READ",
    insights_card1_title: "The Latency Gap: Why the First Days of a Vacancy Decide Who Wins the Mandate",
    insights_card1_desc: "Companies publish new roles on their own careers page first, and applications peak in the first week. Why the agency that sees the role first gets the conversation.",
    insights_card1_cta: "Read the analysis",
    insights_card2_badge: "BD STRATEGY · 4 MIN READ",
    insights_card2_title: "Anatomy of Stale Roles (>35 Days): A High-Probability Pitch in B2B Recruitment",
    insights_card2_desc: "A role still open after five weeks has run past a typical time-to-fill. How to build a warm pitch around it.",
    insights_card2_cta: "Read the BD playbook",
    insights_card3_badge: "PROCESS AUDIT · 4 MIN READ",
    insights_card3_title: "The Hidden Cost of Dead Vacancies: Why Chasing Ghost Roles Burns Consultant Morale",
    insights_card3_desc: "Greenhouse classifies 18–22% of jobs posted on its platform as ghost jobs. How automatic archiving keeps your list of open roles honest.",
    insights_card3_cta: "Read the process audit",
    insights_explore_all: "Explore all research articles and guides →",

    /* ── Pricing ── */
    pricing_badge: "14-Day Free Pilot — up to 200 companies • No credit card",
    pricing_headline: "Transparent EUR Pricing Engineered for High Agency ROI",
    pricing_subtext: "Every plan includes a 14-day free pilot with full scanning capabilities. Zero commitment — cancel anytime with one click.",
    pricing_monthly_note: "Transparent monthly EUR invoicing • No hidden setup fees",
    pricing_tier1_name: "Solo Scout",
    pricing_tier1_companies: "up to 50 companies",
    pricing_tier1_price: "€119",
    pricing_tier1_period: "/ month",
    pricing_tier1_desc: "Engineered for solo headhunters and specialized boutique recruiters.",
    pricing_tier1_f1: "Up to 50 monitored client companies",
    pricing_tier1_f2: "1× daily automated morning scan (06:00 in your time zone)",
    pricing_tier1_f3: "150 on-demand manual scan credits / week",
    pricing_tier1_f4: "1 user seat",
    pricing_tier1_f5: "Full 2-stage AI classification (Gemini Flash across all 6 verticals)",
    pricing_tier1_f6: "Auto-archive daemon & stale role reconciliation",
    pricing_tier1_f7: "BD Master lead pipeline, shared notes & CSV export",
    pricing_tier1_f8: "Lightweight candidate pipeline module included",
    pricing_tier1_cta: "Start 14-Day Free Pilot",

    pricing_tier2_name: "Agency Pro",
    pricing_tier2_badge: "Most Popular",
    pricing_tier2_companies: "up to 200 companies",
    pricing_tier2_price: "€289",
    pricing_tier2_period: "/ month",
    pricing_tier2_desc: "Maximum speed advantage and capacity for active recruitment teams.",
    pricing_tier2_speed_title: "Speed Advantage: 2× Daily Scanning",
    pricing_tier2_speed_body: "Scans run at 06:00 & 12:00 in your agency's time zone. Know about new roles within hours of posting, days before LinkedIn.",
    pricing_tier2_f1: "Up to 200 monitored client companies",
    pricing_tier2_f2: "2× daily automated scans (06:00 & 12:00)",
    pricing_tier2_f3: "500 on-demand manual scan credits / week",
    pricing_tier2_f4: "Up to 8 team accounts with owner assignments & shared notes",
    pricing_tier2_f5: "Full 2-stage AI classification (all 6 verticals)",
    pricing_tier2_f6: "Team audit trail & multi-user role assignment",
    pricing_tier2_f7: "Priority founder Slack channel for custom company requests",
    pricing_tier2_f8: "Full candidate pipeline & team workspace included",
    pricing_tier2_cta: "Start 14-Day Free Pilot →",

    pricing_tier3_name: "Scale / Enterprise",
    pricing_tier3_companies: "400+ companies",
    pricing_tier3_price: "Custom",
    pricing_tier3_price_from: "From €590 / month",
    pricing_tier3_desc: "For regional and national recruitment firms with extensive client portfolios.",
    pricing_tier3_f1: "400+ monitored client companies",
    pricing_tier3_f2: "Up to 4× daily automated scans / priority worker queue",
    pricing_tier3_f3: "Unlimited on-demand scans & unlimited team seats",
    pricing_tier3_f4: "Custom scraping adapters for non-standard enterprise career portals",
    pricing_tier3_f5: "Custom AI scoring profiles per practice group / partner",
    pricing_tier3_f6: "Dedicated Slack support & custom onboarding with founder",
    pricing_tier3_cta: "Contact Founder",

    pricing_roi_html: "A single tech or executive search placement pays for <strong>4+ years of Agency Pro</strong>. Spotting just one mandate 48 hours early generates an immediate <strong>4,000%+ ROI</strong>.",
    pricing_footnote: "Natively supports Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Personio, BambooHR, Teamtailor, Teamio/Jobs.cz, Recruitis, and direct career portals.",

    /* ── Founder Story ── */
    story_badge: "Why we built it",
    story_headline: "From Manual Spreadsheet Grunt Work to Autonomous Intelligence",
    story_p1_html: "During my residency in Dublin at <a href=\"https://www.linkedin.com/in/rob-magee-749891/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Ingenio Global</a> under Managing Director <a href=\"https://www.linkedin.com/in/rob-magee-749891/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Rob Magee</a>, I saw senior headhunters spending every Monday morning manually checking enterprise career portals and copying vacancy links into spreadsheets one by one.",
    story_p2: "It was slow, error-prone, and burned hours that should have been spent closing candidates. Instead of continuing the manual grunt work, I built an autonomous engine to monitor client career portals and ATS endpoints directly.",
    story_p3: "Over the next two months, that engine ran in daily production across 180 enterprise companies and captured 3,400+ open roles. Consultants were notified the day clients published them — capturing mandates days before external job boards even knew they existed.",
    story_p4: "Returning from Dublin, it was clear that hundreds of recruitment boutiques in Central and Western Europe are still trapped in spreadsheet chaos. TalentRadar is engineered to eliminate that waste.",
    story_p5: "When you get in touch, you talk directly with me.",
    story_author_name: "Kryštof Pejša",
    story_author_title: "Founder, TalentRadar",
    story_linkedin: "LinkedIn Profile",
    story_rob_linkedin: "Rob Magee (Ingenio Global)",

    /* ── FAQ & Asynchronous Onboarding ── */
    faq_badge: "Zero-Friction Implementation",
    faq_headline: "Frequently Asked Questions",
    faq_onboarding_title: "Zero-Friction Asynchronous Setup",
    faq_onboarding_body: "Paste your target client domains or upload a CSV/Excel file during registration. Our engine maps your accounts and ATS endpoints within 24 hours. Zero configuration calls required.",
    faq_q1: "How do you discover roles before LinkedIn and job boards?",
    faq_a1: "Companies post directly to their ATS endpoints (Greenhouse, Lever, Ashby, etc.) or career portals first — it is immediate and free. Commercial job boards charge posting fees and rely on spiders with 24–96 hour indexing latency. TalentRadar monitors primary endpoints twice daily, discovering vacancies on Day Zero.",
    faq_q2: "Which ATS platforms are natively supported?",
    faq_a2: "Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Personio, BambooHR, Teamtailor, Teamio/Jobs.cz, Recruitis, and custom enterprise portals. For non-standard career pages, custom scraping adapters are included in the Scale/Enterprise plan.",
    faq_q3: "What happens when a company closes or fills a vacancy?",
    faq_a3: "When a listing disappears, the next scheduled scan (06:00 or 12:00 in your time zone) notices it and the following one confirms it, then Auto-Archive archives the role automatically. If the employer republishes it, the role comes back with its history. No manual clean-up.",
    faq_q4: "How does the 14-day free pilot work?",
    faq_a4: "You track up to 200 client companies with full scanning capabilities for 14 days. No credit card is required. There is no automated commitment or surprise charge — you decide whether to subscribe once you have seen the results.",
    faq_q5: "Can we push roles to our existing CRM or export data?",
    faq_a5: "Yes. BD Signals supports 1-click CSV exports and webhook integration for Bullhorn, Datacruit, Recruitis, or any external ATS. If you run a boutique agency without an external ATS, our built-in candidate pipeline provides complete mandate tracking.",

    /* ── Pilot / Trial Form ── */
    trial_badge: "Spend time closing, not searching • 14-Day Free Pilot",
    trial_headline: "Activate Your 14-Day Free Pilot on Your Client Portfolio",
    trial_subtext: "Upload your client list in CSV or Excel, or paste company domains. We will map your accounts and have your automated scan running within 24 hours.",
    trial_label_name: "Full Name *",
    trial_placeholder_name: "Jane Smith",
    trial_label_email: "Agency Work Email *",
    trial_placeholder_email: "jane@agency.com",
    trial_label_company: "Recruitment Agency / Company *",
    trial_placeholder_company: "Acme Search Ltd.",
    trial_label_clients: "Client domains or portfolio to monitor (up to 200 companies)",
    trial_placeholder_clients: "Paste client career URLs or company domains here (e.g. tines.com, mews.com, stripe.com)...",
    trial_clients_tag: "Excel, CSV or Domains",
    trial_upload_cta: "Click to upload client spreadsheet",
    trial_upload_types: "(Excel .xlsx, .xls or .csv)",
    trial_upload_note: "We find the career pages and ATS for you. No list at hand? Leave it empty and we will get in touch to collect it.",
    trial_submit: "Activate 14-Day Free Pilot →",
    trial_submitting: "Activating your pilot…",
    trial_step1: "A confirmation e-mail arrives right away.",
    trial_step2: "We set up your workspace, find your clients' career pages and run the first scan.",
    trial_step3: "You get an e-mail with a link to set your password and sign in.",
    trial_file_too_large: "File too large (max 8 MB).",
    trial_error_required: "Please enter your name, work email, and agency name.",
    trial_error_generic: "Something went wrong. Please write to us directly at krystof@talentradar.eu",
    trial_speed_note: "Often ready within the hour, always within 24 hours.",
    trial_gdpr_html: "By submitting you agree to processing of your contact details to create a trial account. Your data is strictly confidential and never shared. (<a href=\"gdpr.html\" class=\"underline hover:text-[#FF8533]\">Privacy Policy</a>)",
    trial_contact_prefix: "Direct Founder Contact:",

    /* ── Footer ── */
    footer_tagline: "Spend time closing, not searching.",
    footer_author: "Kryštof Pejša",
    footer_gdpr: "Privacy Policy (GDPR)",
    footer_copyright: "© 2026 TalentRadar. Built for European Recruitment Boutiques & Headhunters.",
  },

  cs: {
    /* ── SEO ── */
    page_title: "TalentRadar — Spend time closing, not searching.",
    page_description: "TalentRadar hlídá kariérní weby vašich klientů a o nových pozicích vám dá vědět dny předtím, než se objeví na LinkedInu. Pro personální agentury, volitelně i s jednoduchým ATS.",

    /* ── Navigation ── */
    nav_slogan: "Spend time closing, not searching.",
    nav_modes: "Funkce",
    nav_live_radar: "Interaktivní demo",
    nav_comparison: "Srovnání",
    nav_pricing: "Ceník",
    nav_insights: "Blog",
    nav_story: "Náš příběh",
    nav_faq: "Časté dotazy",
    nav_signin: "Přihlášení",
    nav_cta: "Vyzkoušet na 14 dní zdarma",
    nav_demo: "Plné demo ↗",

    /* ── Hero ── */
    hero_badge: "Radar nových zakázek a jednoduché ATS pro personální agentury",
    hero_headline_html: "Nové pozice vašich klientů uvidíte jako první.<br><span class=\"text-[#FF6B00]\">Dny předtím, než se objeví na&nbsp;LinkedInu a&nbsp;Jobs.cz.</span>",
    hero_subheadline: "Vaši konzultanti už nemusí hodiny proklikávat kariérní weby ani čekat, až se pozice objeví na portálech. TalentRadar dvakrát denně projde weby a ATS vašich klientů a nové pozice vám ukáže na jednom místě. Můžete ho mít jen jako radar vedle svého ATS, nebo v něm vést celou agenturu.",
    hero_cta_btn: "Vyzkoušet na 14 dní zdarma",
    hero_demo_btn: "Vyzkoušet interaktivní demo",
    hero_trust_microcopy: "✓ Bez platební karty  •  ✓ Až 200 firem  •  ✓ Spuštění do 24 hodin",

    /* ── Interactive Hero Switcher & Mockup ── */

    /* ── Workflows Section ── */
    modes_badge: "Dva způsoby použití",
    modes_headline: "Zvolte si, jak TalentRadar zapadne do vaší agentury",
    modes_subtext: "Ať máte zavedený tým s Bullhornem, nebo menší agenturu, která jede v Notionu, nic nemusíte stěhovat ani složitě nastavovat.",
    modes_a_badge: "JEN RADAR",
    modes_b_badge: "RADAR + ATS",
    modes_a_title: "Vaše ATS zůstane, přibude radar",
    modes_a_badge_sub: "Bullhorn • Datacruit • Recruitis",
    modes_a_target: "Pro zavedené agentury s 5–50 konzultanty, které pracují v Bullhornu, Datacruitu, Recruitisu nebo Echu",
    modes_a_fear: "„Nechceme stěhovat kandidátskou databázi ani měnit ATS.“",
    modes_a_solution: "TalentRadar funguje jako radar vedle vašeho ATS: dvakrát denně projde weby klientů a upozorní vás na nové pozice, které pak jedním klikem pošlete do svého systému.",
    modes_a_f1: "Čte pozice přímo z ATS klientů (Greenhouse, Lever, Workable, Ashby a další)",
    modes_a_f2: "Automatické skeny dvakrát denně (v 6:00 a ve 12:00 vašeho času)",
    modes_a_f3: "Odhadne, kdo je hiring manager, a jedním klikem ho najdete na LinkedInu nebo přes Google X-Ray",
    modes_a_f4: "Export do CSV jedním klikem nebo přenos přes webhook do Bullhornu, Datacruitu či Recruitisu",
    modes_a_cta: "Vyzkoušet radar →",
    modes_b_title: "Konec tabulek v Excelu a Notionu",
    modes_b_badge_sub: "Excel • Notion • Trello",
    modes_b_target: "Pro menší agentury a samostatné headhuntery (1–10 lidí), kteří dnes jedou v Excelu, Notionu nebo Trellu",
    modes_b_fear: "„V tabulkách se nevyznáme, poptávky nám propadají a velká ATS jsou drahá a zbytečně složitá.“",
    modes_b_solution: "Zakázky a kandidáty vedete přímo u pozic, které radar našel. Máte všechno, co k obsazení zakázky potřebujete, a nic navíc.",
    modes_b_f1: "Z nalezené pozice uděláte zakázku jedním klikem",
    modes_b_f2: "Kandidátská pipeline: Shortlist → CV odesláno → Pohovory → Nabídka → Umístěn",
    modes_b_f3: "Sdílené interní poznámky, sledování provizí a historie komunikace",
    modes_b_f4: "Běží v prohlížeči, nic neinstalujete",
    modes_b_cta: "Vyzkoušet radar s ATS →",

    /* ── Live Radar Showcase (Mini-App Sandbox) ── */
    radar_badge: "Interaktivní demo",
    radar_headline: "Proklikejte si celou platformu. Bez registrace.",
    radar_subtext: "Zjednodušená verze TalentRadaru, která sleduje 19 českých technologických firem. Otevřete si pozici, najděte hiring managera, udělejte z ní zakázku, spusťte sken nebo se zeptejte AI Hawka. Pak můžete pokračovat v plném demu.",
    radar_footnote: "Tahle ukázka běží jen ve vašem prohlížeči na ukázkových datech. Plné demo je skutečná aplikace se živými daty.",

    /* ── Comparison Table ── */
    compare_badge: "Srovnání",
    compare_headline: "Jak se to dělá dnes a jak s TalentRadarem",
    compare_subtext: "Běžný den konzultanta, bod po bodu.",
    compare_col_activity: "Činnost",
    compare_col_manual: "Dnes",
    compare_col_radar: "S TalentRadarem",
    compare_row1_label: "Kontrola kariérních webů",
    compare_row1_manual: "Konzultanti weby proklikávají ručně a nepravidelně, každý tím ztratí hodiny týdně.",
    compare_row1_radar: "Weby se kontrolují automaticky <strong>dvakrát denně</strong> (v 6:00 a ve 12:00 vašeho času).",
    compare_row2_label: "Kdy se o pozici dozvíte",
    compare_row2_manual: "Až po několika dnech, když se objeví na portálech nebo na LinkedInu.",
    compare_row2_radar: "<strong>Při nejbližším skenu</strong>, obvykle pár hodin po zveřejnění na webu klienta.",
    compare_row3_label: "Obsazené a stažené pozice",
    compare_row3_manual: "Konzultanti oslovují kandidáty na pozice, které klient už před týdny potichu obsadil.",
    compare_row3_radar: "Když pozice zmizí z webu klienta, TalentRadar ji <strong>sám archivuje</strong>.",
    compare_row4_label: "Kandidáti a zakázky",
    compare_row4_manual: "Poznámky rozházené po vlastních tabulkách, v Notionu nebo v bločku.",
    compare_row4_radar: "Všechny pozice na jednom místě v <strong>BD Masteru</strong>, kandidáty k nim přidáte jedním klikem.",
    compare_row5_label: "Přidání nového klienta",
    compare_row5_manual: "Zapsat do Excelu a pak si pořád připomínat, že ho máte zkontrolovat.",
    compare_row5_radar: "Vložíte odkaz na kariérní stránku a od dalšího skenu ji <strong>hlídá TalentRadar</strong>.",
    compare_row6_label: "Kolik času to zabere",
    compare_row6_manual: "Několik hodin proklikávání každé pondělí dopoledne.",
    compare_row6_radar: "<strong>Ranní přehled na tři minuty</strong>, u každé pozice s argumentem pro oslovení klienta.",

    /* ── Intelligence Lab / Blog Teasers ── */
    insights_badge: "Blog",
    insights_headline: "Jak získávat nové zakázky: data a návody pro agentury",
    insights_subtext: "Praktické návody na získávání zakázek, postavené na veřejně dostupných výzkumech náboru. U každého čísla najdete zdroj.",
    insights_card1_badge: "ANALÝZA TRHU · 5 MIN ČTENÍ",
    insights_card1_title: "Kdo dřív přijde, ten dřív mele: proč o zakázce rozhodují první dny po vypsání pozice",
    insights_card1_desc: "Firmy zveřejňují nové pozice nejdřív na vlastním kariérním webu a reakce uchazečů vrcholí v prvním týdnu. Proto schůzku s klientem obvykle dostane agentura, která pozici uvidí jako první.",
    insights_card1_cta: "Přečíst článek",
    insights_card2_badge: "BD STRATEGIE · 4 MIN ČTENÍ",
    insights_card2_title: "Pozice otevřené déle než 35 dní: nejlepší důvod klienta oslovit",
    insights_card2_desc: "Pozice otevřená přes pět týdnů je už za běžnou dobou obsazení. Jak toho využít, když klienta oslovujete.",
    insights_card2_cta: "Přečíst článek",
    insights_card3_badge: "Z PRAXE · 4 MIN ČTENÍ",
    insights_card3_title: "Kolik stojí mrtvé inzeráty: proč práce na neexistujících pozicích ubíjí recruitery",
    insights_card3_desc: "Podle Greenhouse je 18–22 % pozic na jeho platformě takzvaných ghost jobs, tedy inzerátů, za kterými žádné místo není. Jak automatická archivace udrží váš seznam pozic aktuální.",
    insights_card3_cta: "Přečíst článek",
    insights_explore_all: "Všechny články →",

    /* ── Pricing ── */
    pricing_badge: "Vyzkoušet na 14 dní zdarma • Až 200 firem • Bez karty",
    pricing_headline: "Jednoduchý ceník, platíte měsíčně",
    pricing_subtext: "Každý tarif si můžete 14 dní zdarma vyzkoušet naplno. Bez závazků, zrušit můžete kdykoli.",
    pricing_monthly_note: "Fakturujeme měsíčně v eurech • Žádné poplatky za zřízení",
    pricing_tier1_name: "Solo Scout",
    pricing_tier1_companies: "až 50 firem",
    pricing_tier1_price: "119 €",
    pricing_tier1_period: "/ měsíc",
    pricing_tier1_desc: "Pro samostatné headhuntery a malé agentury.",
    pricing_tier1_f1: "Až 50 sledovaných klientských firem",
    pricing_tier1_f2: "Automatický sken jednou denně ráno (v 6:00 vašeho času)",
    pricing_tier1_f3: "150 ručních skenů týdně",
    pricing_tier1_f4: "1 uživatelský účet",
    pricing_tier1_f5: "AI roztřídí pozice do všech 6 oborů",
    pricing_tier1_f6: "Automatická archivace obsazených a stažených pozic",
    pricing_tier1_f7: "Všechny pozice v BD Masteru, sdílené poznámky a export do CSV",
    pricing_tier1_f8: "Jednoduché ATS v ceně",
    pricing_tier1_cta: "Vyzkoušet na 14 dní zdarma",

    pricing_tier2_name: "Agency Pro",
    pricing_tier2_badge: "Doporučujeme",
    pricing_tier2_companies: "až 200 firem",
    pricing_tier2_price: "289 €",
    pricing_tier2_period: "/ měsíc",
    pricing_tier2_desc: "Pro agenturní týmy, které chtějí o nových pozicích vědět dvakrát denně.",
    pricing_tier2_speed_title: "Dvakrát denně místo jednou",
    pricing_tier2_speed_body: "Skeny běží v 6:00 a ve 12:00 vašeho času, takže o pozicích vypsaných dopoledne víte už po obědě.",
    pricing_tier2_f1: "Až 200 sledovaných klientských firem",
    pricing_tier2_f2: "Automatické skeny dvakrát denně (v 6:00 a ve 12:00)",
    pricing_tier2_f3: "500 ručních skenů týdně",
    pricing_tier2_f4: "Až 8 uživatelů, každá pozice může mít svého vlastníka",
    pricing_tier2_f5: "AI roztřídí pozice do všech 6 oborů",
    pricing_tier2_f6: "Historie změn v týmu a přidělování pozic kolegům",
    pricing_tier2_f7: "Vlastní Slack kanál přímo se zakladatelem",
    pricing_tier2_f8: "Jednoduché ATS v ceně",
    pricing_tier2_cta: "Vyzkoušet na 14 dní zdarma →",

    pricing_tier3_name: "Scale / Enterprise",
    pricing_tier3_companies: "více než 200 firem",
    pricing_tier3_price: "Na míru",
    pricing_tier3_price_from: "od 590 € měsíčně",
    pricing_tier3_desc: "Pro velké agentury s mnoha klienty.",
    pricing_tier3_f1: "Více než 200 sledovaných klientských firem",
    pricing_tier3_f2: "Automatické skeny až čtyřikrát denně, vaše skeny mají přednost",
    pricing_tier3_f3: "Neomezeně ručních skenů i uživatelů",
    pricing_tier3_f4: "Napojení nestandardních kariérních webů na míru",
    pricing_tier3_f5: "AI hodnocení pozic nastavené podle konzultanta nebo specializace",
    pricing_tier3_f6: "Podpora přes Slack a zaškolení přímo se zakladatelem",
    pricing_tier3_cta: "Napsat zakladateli",

    pricing_roi_html: "Jedno umístění v IT nebo executive search vám <strong>Agency Pro zaplatí na rok i déle</strong>.",
    pricing_footnote: "Umí Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Personio, BambooHR, Teamtailor, Teamio/Jobs.cz, Recruitis i běžné kariérní weby.",

    /* ── Founder Story ── */
    story_badge: "Jak TalentRadar vznikl",
    story_headline: "Od pondělního proklikávání webů k radaru, který to dělá sám",
    story_p1_html: "V Dublinu jsem pracoval v agentuře <a href=\"https://www.linkedin.com/in/rob-magee-749891/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Ingenio Global</a>, kterou vede <a href=\"https://www.linkedin.com/in/rob-magee-749891/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Rob Magee</a>, a viděl jsem, jak zkušení headhunteři tráví každé pondělní dopoledne obcházením kariérních webů a přepisováním odkazů do tabulek.",
    story_p2: "Byla to pomalá práce, při které se snadno něco přehlédlo, a brala čas, který měli konzultanti věnovat kandidátům. Tak jsem napsal systém, který kariérní weby a ATS firem kontroluje sám.",
    story_p3: "Další dva měsíce systém běžel každý den naostro: sledoval 180 velkých firem a zachytil přes 3 400 otevřených pozic. Konzultanti se o nových pozicích dozvídali v den vypsání, dny předtím, než se objevily na portálech.",
    story_p4: "Po návratu domů mi bylo jasné, že se stejnými tabulkami se trápí stovky agentur ve střední i západní Evropě. TalentRadar je tu proto, aby tuhle zbytečnou práci dělat nemusely.",
    story_p5: "Když se ozvete, jednáte přímo se mnou.",
    story_author_name: "Kryštof Pejša",
    story_author_title: "Zakladatel TalentRadaru",
    story_linkedin: "Profil na LinkedInu",
    story_rob_linkedin: "Rob Magee (Ingenio Global)",

    /* ── FAQ & Asynchronous Onboarding ── */
    faq_badge: "Než začnete",
    faq_headline: "Časté dotazy",
    faq_onboarding_title: "Spuštění bez jediného hovoru",
    faq_onboarding_body: "Při registraci vložíte domény klientů nebo nahrajete jejich seznam v Excelu či CSV. Do 24 hodin k nim dohledáme kariérní weby a ATS a spustíme první sken. Nikam volat nemusíte.",
    faq_q1: "Jak to, že o pozicích víte dřív než LinkedIn a portály?",
    faq_a1: "Firmy vypisují pozice nejdřív ve svém ATS (Greenhouse, Lever, Ashby a další) nebo na kariérním webu, protože je to nic nestojí. Na placené portály se pozice dostávají později, často až po několika dnech. TalentRadar kontroluje přímo weby a ATS firem dvakrát denně, takže novou pozici zachytí při nejbližším skenu.",
    faq_q2: "Se kterými ATS TalentRadar umí pracovat?",
    faq_a2: "Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Personio, BambooHR, Teamtailor, Teamio/Jobs.cz, Recruitis a také vlastní kariérní weby velkých firem. Nestandardní weby napojíme na míru v tarifu Scale / Enterprise.",
    faq_q3: "Co se stane, když firma pozici uzavře nebo obsadí?",
    faq_a3: "Když inzerát z webu zmizí, nejbližší sken (v 6:00 nebo ve 12:00 vašeho času) si toho všimne, další to potvrdí a TalentRadar pozici archivuje. Když ji firma vypíše znovu, vrátí se i s celou historií. Nic nemusíte mazat ručně.",
    faq_q4: "Jak funguje 14 dní zdarma?",
    faq_a4: "Po 14 dní můžete sledovat až 200 firem a používat všechno naplno. Platební kartu nezadáváte. Po skončení se zkušební verze sama nezpoplatní, o pokračování rozhodnete vy.",
    faq_q5: "Můžeme data přenést do svého CRM?",
    faq_a5: "Ano. V režimu Jen radar můžete data jedním klikem exportovat do CSV nebo posílat přes webhook do Bullhornu, Datacruitu, Recruitisu či jiného CRM. Pokud vlastní ATS nemáte, v režimu Radar + ATS máte pipeline přímo v TalentRadaru.",

    /* ── Pilot / Trial Form ── */
    trial_badge: "Spend time closing, not searching • Vyzkoušet na 14 dní zdarma",
    trial_headline: "Vyzkoušejte TalentRadar na svém portfoliu klientů",
    trial_subtext: "Nahrajte seznam klientů v Excelu nebo CSV, případně jen vložte jejich domény. Do 24 hodin k nim dohledáme kariérní weby a spustíme první sken.",
    trial_label_name: "Jméno a příjmení *",
    trial_placeholder_name: "Jan Novák",
    trial_label_email: "Pracovní e-mail agentury *",
    trial_placeholder_email: "jan@agentura.cz",
    trial_label_company: "Název agentury / firmy *",
    trial_placeholder_company: "Vaše agentura s.r.o.",
    trial_label_clients: "Klienti, které chcete sledovat (až 200 firem)",
    trial_placeholder_clients: "Vložte domény nebo kariérní weby klientů, např. mews.com, productboard.com, rohlik.cz…",
    trial_clients_tag: "Excel, CSV nebo domény",
    trial_upload_cta: "Klikněte a nahrajte soubor s klienty",
    trial_upload_types: "(Excel .xlsx, .xls nebo .csv)",
    trial_upload_note: "Kariérní weby a ATS dohledáme za vás. Seznam teď nemáte po ruce? Nechte pole prázdné a ozveme se vám pro něj.",
    trial_submit: "Vyzkoušet na 14 dní zdarma →",
    trial_submitting: "Zakládám zkušební účet…",
    trial_step1: "Hned vám přijde potvrzovací e-mail.",
    trial_step2: "Založíme workspace, dohledáme kariérní weby vašich klientů a spustíme první sken.",
    trial_step3: "Přijde vám e-mail s odkazem, kde si nastavíte heslo a přihlásíte se.",
    trial_file_too_large: "Soubor je příliš velký (max. 8 MB).",
    trial_error_required: "Vyplňte prosím jméno, pracovní e-mail a název agentury.",
    trial_error_generic: "Něco se pokazilo. Napište nám prosím přímo na krystof@talentradar.eu",
    trial_speed_note: "Často hotovo do hodiny, vždy do 24 hodin.",
    trial_gdpr_html: "Odesláním souhlasíte se zpracováním kontaktních údajů pro vytvoření zkušebního účtu. Údaje nikomu neprodáváme ani je nepředáváme k marketingu. (<a href=\"gdpr.html\" class=\"underline hover:text-[#FF8533]\">Zásady zpracování</a>)",
    trial_contact_prefix: "Přímý kontakt na zakladatele:",

    /* ── Footer ── */
    footer_tagline: "Spend time closing, not searching.",
    footer_author: "Kryštof Pejša",
    footer_gdpr: "Zásady ochrany osobních údajů (GDPR)",
    footer_copyright: "© 2026 TalentRadar. Vytvořeno pro evropské personální agentury a headhuntery.",
  }
};

/* ─────────────────────────────────────────────
   Language Switcher Engine (Isomorphic & Robust)
───────────────────────────────────────────── */
(function () {
  const PRIMARY_STORAGE_KEY = 'talentradar_lang';
  const LEGACY_STORAGE_KEY = 'tr_lang';
  let currentLang = 'en';

  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      const defLang = document.documentElement.getAttribute('data-default-lang');
      if (defLang === 'cs' || defLang === 'en') {
        currentLang = defLang;
      }
    }
    if (typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.endsWith('-cs.html')) {
      currentLang = 'cs';
    }
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(PRIMARY_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved === 'cs' || saved === 'en') {
        if (!window.location || !window.location.pathname.endsWith('-cs.html')) {
          currentLang = saved;
        }
      }
    }
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const qLang = params.get('lang');
      if (qLang === 'cs' || qLang === 'en') {
        currentLang = qLang;
      }
    }
  } catch (e) {
    currentLang = 'en';
  }

  // In headings the brand name is two-tone: "Talent" white, "Radar" orange,
  // including Czech declined forms (TalentRadaru). Running text stays plain.
  const BRAND_RE = /\b(Talent)(Radar\w*)/gi;
  const BRAND_ONLY = 'h1,h2,h3,h4,[data-brand]';
  const BRAND_SKIP = 'script,style,title,textarea,input,select,option,code,pre,[data-no-brand],.tr-brandword';
  function brandify(root) {
    if (typeof document === 'undefined') return;
    root = root || document.body;
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!BRAND_RE.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        BRAND_RE.lastIndex = 0;
        const parent = node.parentElement;
        return parent && parent.closest(BRAND_ONLY) && !parent.closest(BRAND_SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const frag = document.createDocumentFragment();
      let last = 0;
      const text = node.nodeValue;
      text.replace(BRAND_RE, (match, talent, radar, offset) => {
        if (offset > last) frag.appendChild(document.createTextNode(text.slice(last, offset)));
        const word = document.createElement('span');
        word.className = 'tr-brandword';
        word.style.whiteSpace = 'nowrap';
        const a = document.createElement('span');
        a.style.color = '#FFFFFF';
        a.textContent = talent;
        const b = document.createElement('span');
        b.style.color = '#FF6B00';
        b.textContent = radar;
        word.appendChild(a);
        word.appendChild(b);
        frag.appendChild(word);
        last = offset + match.length;
        return match;
      });
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function applyLanguage(lang) {
    if (lang !== 'cs' && lang !== 'en') lang = 'en';
    currentLang = lang;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(PRIMARY_STORAGE_KEY, lang);
        localStorage.setItem(LEGACY_STORAGE_KEY, lang);
      }
    } catch (e) {}

    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang;

    // Toggle bilingual block containers (e.g. blog articles and research cards)
    document.querySelectorAll('[data-lang-block]').forEach(el => {
      const blockLang = el.getAttribute('data-lang-block');
      el.classList.toggle('hidden', blockLang !== lang);
    });

    // Update localized blog article links if data-blog-slug is present
    document.querySelectorAll('a[data-blog-slug]').forEach(a => {
      const slug = a.getAttribute('data-blog-slug');
      const prefix = a.getAttribute('data-blog-prefix') || '';
      const hash = a.getAttribute('data-blog-hash') || '';
      if (slug) {
        a.setAttribute('href', prefix + slug + (lang === 'cs' ? '-cs.html' : '.html') + hash);
      }
    });

    // If currently viewing a blog article page, keep URL in sync (.html <-> -cs.html)
    try {
      if (typeof window !== 'undefined' && window.location && window.history && window.history.replaceState) {
        const path = window.location.pathname;
        const match = path.match(/\/(the-4-day-latency-gap|anatomy-of-stale-roles|hidden-cost-of-dead-vacancies)(-cs)?\.html$/);
        if (match) {
          const targetFile = match[1] + (lang === 'cs' ? '-cs.html' : '.html');
          const newPath = path.replace(/\/(the-4-day-latency-gap|anatomy-of-stale-roles|hidden-cost-of-dead-vacancies)(-cs)?\.html$/, '/' + targetFile);
          if (newPath !== path) {
            window.history.replaceState(null, '', newPath + window.location.search + window.location.hash);
          }
        }
      }
    } catch (e) {}

    const dict = TRANSLATIONS[lang];
    if (dict) {
      // Translate standard elements
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key] !== undefined) {
          if (el.getAttribute('data-i18n-html') === 'true') {
            el.innerHTML = dict[key];
          } else {
            el.textContent = dict[key];
          }
        }
      });

      // Translate input placeholders
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key] !== undefined) {
          el.placeholder = dict[key];
        }
      });

      // Swap page title and meta description (respecting custom per-page titles if present)
      const customTitle = document.documentElement.getAttribute('data-page-title-' + lang);
      if (customTitle) {
        document.title = customTitle;
      } else if (dict.page_title) {
        document.title = dict.page_title;
      }

      const customDesc = document.documentElement.getAttribute('data-page-desc-' + lang);
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        if (customDesc) {
          metaDesc.content = customDesc;
        } else if (dict.page_description) {
          metaDesc.content = dict.page_description;
        }
      }
    }

    // Update switcher buttons UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      const isActive = btnLang === lang;
      btn.classList.toggle('lang-btn--active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    brandify(document.body);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('talentradar:langchange', { detail: { lang } }));
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          applyLanguage(btn.getAttribute('data-lang'));
        });
      });

      // Apply saved or default language
      applyLanguage(currentLang);
    });
  }

  if (typeof window !== 'undefined') {
    window.TRLang = {
      apply: applyLanguage,
      brand: brandify,
      current: () => currentLang,
      get: (key) => (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || ''
    };
    window.TRBrand = brandify;
  }
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TRANSLATIONS;
}
