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
    nav_modes: "Workflows",
    nav_live_radar: "Live Signals",
    nav_comparison: "The Advantage",
    nav_pricing: "Pricing",
    nav_insights: "Research & Blog",
    nav_story: "Our Story",
    nav_faq: "FAQ",
    nav_signin: "Sign In",
    nav_cta: "Start 14-Day Free Pilot",
    nav_demo: "Live Demo ↗",

    /* ── Hero ── */
    hero_badge: "Autonomous BD Intelligence & Lightweight ATS for Recruitment Agencies",
    hero_headline_html: "Spot your clients’ open roles <span class=\"text-[#FF6B00]\">the hour they post them.</span> Days before LinkedIn.",
    hero_subheadline: "Stop wasting recruiter hours manually checking client career portals or waiting for crowded job boards. TalentRadar monitors enterprise career sites and ATS endpoints twice daily. Use it as an upstream BD radar alongside your existing ATS, or switch on our lightweight pipeline module to run your entire boutique agency.",
    hero_input_placeholder: "Enter your agency work email or client domain...",
    hero_cta_btn: "Start 14-Day Free Pilot",
    hero_trust_microcopy: "No credit card required • Track up to 200 companies • Async setup in 24h",

    /* ── Interactive Hero Switcher & Mockup ── */
    mockup_tab_a: "BD Signals (Have Bullhorn / Datacruit)",
    mockup_tab_b: "Full Workspace (Replacing Excel & Notion)",
    mockup_subtext_a: "Monitors client websites 2× daily and feeds new vacancies straight into your existing workflow or CRM.",
    mockup_subtext_b: "A lightweight, clutter-free mandate pipeline and candidate tracker built directly for boutique headhunters.",
    mockup_mode_a_badge: "BD SIGNALS",
    mockup_mode_b_badge: "FULL WORKSPACE",
    mockup_scan_status: "06:00 UTC Scan Complete • 180 Companies Monitored • 14 New Roles Today",
    mockup_xray_btn: "Hiring Manager Bridge",
    mockup_push_btn: "Push to External ATS / CSV",
    mockup_core_match: "CORE MATCH",
    mockup_kanban_title: "Active Mandate Pipeline: Senior Backend Architect (Go/Node) — Mews",
    mockup_kanban_fee: "Fee: 22% (€18,500 est.)",
    mockup_col_sourced: "Sourced",
    mockup_col_contacted: "Contacted",
    mockup_col_cv_sent: "CV Sent",
    mockup_col_interview: "Interview",
    mockup_col_placed: "Placed / Offer",

    /* ── Workflows Section ── */
    modes_badge: "Workflow Options",
    modes_headline: "Choose How TalentRadar Fits Your Agency Workflow",
    modes_subtext: "Whether you run an established 50-consultant firm with Bullhorn or a 3-person boutique on Notion, TalentRadar works without forced migrations or complex setup.",
    modes_a_title: "BD Signals (Keep Your Existing ATS)",
    modes_a_target: "For Established Agencies (5–50 consultants with Bullhorn, Datacruit, Recruitis, or Echo)",
    modes_a_fear: "Your concern: \"We don't want to migrate our database or replace our existing ATS.\"",
    modes_a_solution: "TalentRadar operates upstream of your ATS as an autonomous vacancy detection radar. It monitors client career portals twice daily, alerts you to new roles on Day Zero, and enables 1-click export directly into your existing CRM.",
    modes_a_f1: "Monitors primary ATS endpoints (Greenhouse, Lever, Workable, Ashby, etc.)",
    modes_a_f2: "2× daily automated scans (06:00 & 12:00 UTC) with immediate speed alerts",
    modes_a_f3: "Hiring Manager Bridge linking directly to engineering & sales decision-makers",
    modes_a_f4: "Instant CSV / Webhook push into Bullhorn, Datacruit, or Recruitis",
    modes_b_title: "Full Workspace (Replace Excel & Notion)",
    modes_b_target: "For Boutique & Micro-Agencies (1–10 consultants running on Excel, Notion, or Trello — ~72% of the market)",
    modes_b_fear: "Your pain: \"Spreadsheets are chaotic, we lose track of mandates, and enterprise ATS tools are bloated and expensive.\"",
    modes_b_solution: "A lean mandate pipeline and candidate tracker attached directly to discovered client openings. Everything you need to manage active searches without corporate overhead.",
    modes_b_f1: "Discovered client roles convert into active agency mandates in 1 click",
    modes_b_f2: "Lean candidate pipeline: Sourced -> Contacted -> CV Sent -> Interview -> Placed",
    modes_b_f3: "Shared recruiter notes, fee tracking, and candidate interaction logs",
    modes_b_f4: "Zero bloat, zero migration friction, completely spreadsheet-free",

    /* ── Live Radar Showcase ── */
    radar_badge: "Live Telemetry Feed",
    radar_headline: "Live Signals: Discovered at 06:00 UTC Today",
    radar_subtext: "Sample vacancies captured directly from enterprise career pages across Europe. In your workspace, this feed populates exclusively with your client accounts.",
    radar_tab_all: "All Signals",
    radar_tab_tech: "Tech & Cloud",
    radar_tab_sales: "B2B Sales",
    radar_tab_exec: "Executive & C-Level",
    radar_bridge_label: "Hiring Manager Bridge:",
    radar_monitored_title: "Enterprise employers monitored daily in this live demo:",
    radar_disclaimer: "(Live production sample — your client portfolio populates automatically within 24 hours of sign-up)",

    /* ── Comparison Table ── */
    compare_badge: "Operational Audit",
    compare_headline: "Manual Agency Workflow vs. TalentRadar Autonomous Advantage",
    compare_subtext: "A direct contrast of the daily business development routine.",
    compare_col_activity: "Operational Dimension",
    compare_col_manual: "Traditional Agency Workflow",
    compare_col_radar: "TalentRadar Autonomous Advantage",
    compare_row1_label: "Career Portal Monitoring",
    compare_row1_manual: "Manual randomized browsing; 4–6 recruiter hours wasted weekly per consultant.",
    compare_row1_radar: "Autonomous continuous monitoring 2× daily (06:00 & 12:00 UTC).",
    compare_row2_label: "Discovery Latency",
    compare_row2_manual: "3–6 day delay waiting for commercial job boards to scrape listings.",
    compare_row2_radar: "Day Zero discovery — hours after publication, days before LinkedIn.",
    compare_row3_label: "Ghost & Filled Roles",
    compare_row3_manual: "Recruiters waste time pitching candidates for roles silently filled weeks ago.",
    compare_row3_radar: "Auto-Archive Daemon wipes closed vacancies the moment they leave client portals.",
    compare_row4_label: "Candidate & Mandate Tracking",
    compare_row4_manual: "Fragmented notes scattered in personal spreadsheets, Notion, or paper pads.",
    compare_row4_radar: "Unified BD Master with optional 1-click lightweight candidate pipeline.",
    compare_row5_label: "Adding New Accounts",
    compare_row5_manual: "Manual spreadsheet data entry + constant manual reminder checking.",
    compare_row5_radar: "Paste any company career URL — automated tracking begins on the next scan.",
    compare_row6_label: "Weekly Management Cost",
    compare_row6_manual: "Hours of administrative overhead every single Monday morning.",
    compare_row6_radar: "3-minute morning pulse with AI sales pitch hooks and team audit trails.",

    /* ── Intelligence Lab / Blog Teasers ── */
    insights_badge: "TalentRadar Intelligence Lab",
    insights_headline: "Market Intelligence, Latency Telemetry & Research",
    insights_subtext: "Unbiased empirical data derived directly from monitoring hundreds of enterprise career pages and ATS platforms across Europe.",
    insights_card1_badge: "DATA REPORT · 5 MIN READ",
    insights_card1_title: "The 4-Day Latency Gap: Why Agencies Lose 40% of Client Roles Before Job Boards Even Index Them",
    insights_card1_desc: "Direct ATS monitoring vs. commercial aggregators. Why 72–96h syndication lag kills exclusive client pitches, and how Day Zero intelligence secures mandates.",
    insights_card2_badge: "BD STRATEGY · 4 MIN READ",
    insights_card2_title: "Anatomy of Stale Roles (>35 Days): The Highest-Probability Pitch in B2B Recruitment",
    insights_card2_desc: "When an in-house talent team leaves a role open past 35 days, internal sourcing has failed. How to structure warm inbound BD pitches around aged vacancy data.",
    insights_card3_badge: "PROCESS AUDIT · 4 MIN READ",
    insights_card3_title: "The Hidden Cost of Dead Vacancies: Why Chasing Ghost Roles Burns Consultant Morale",
    insights_card3_desc: "Up to 22% of listings on commercial job boards represent filled or cancelled roles. How automated reconciliation and auto-archiving saves 4+ recruiter hours weekly.",
    insights_explore_all: "Explore all research articles and guides →",

    /* ── Pricing ── */
    pricing_badge: "14-Day Free Pilot — up to 200 companies • No credit card",
    pricing_headline: "Transparent EUR Pricing Engineered for High Agency ROI",
    pricing_subtext: "Every plan includes a 14-day free pilot with full scanning capabilities. Monthly billing only — no forced annual lock-in.",
    pricing_monthly_note: "Strict monthly EUR billing — cancel anytime with one click",
    pricing_tier1_name: "Solo Scout",
    pricing_tier1_companies: "up to 50 companies",
    pricing_tier1_price: "€119",
    pricing_tier1_period: "/ month",
    pricing_tier1_desc: "Engineered for solo headhunters and specialized boutique recruiters.",
    pricing_tier1_f1: "Up to 50 monitored client companies",
    pricing_tier1_f2: "1× daily automated morning scan (06:00 UTC)",
    pricing_tier1_f3: "150 on-demand manual scan credits / month",
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
    pricing_tier2_speed_body: "Scans run at 06:00 & 12:00 UTC. Know about new roles within hours of posting, days before LinkedIn.",
    pricing_tier2_f1: "Up to 200 monitored client companies",
    pricing_tier2_f2: "2× daily automated scans (06:00 & 12:00 UTC speed advantage)",
    pricing_tier2_f3: "500 on-demand manual scan credits / month",
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
    pricing_footnote: "Natively supports Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Personio, BambooHR, Teamtailor, Teamio, Recruitis, and direct career portals.",

    /* ── Founder Story ── */
    story_badge: "Founder Authority",
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
    faq_a3: "Our Auto-Archive Daemon detects removed listings on the very next scheduled scan (06:00 or 12:00 UTC) and automatically archives them. Your active pipeline stays 100% clean with zero manual reconciliation.",
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
    trial_upload_note: "We locate ATS endpoints and career portals for you. You can also send the file after registration.",
    trial_submit: "Activate 14-Day Free Pilot →",
    trial_submitting: "Activating your pilot…",
    trial_speed_note: "Access sent within 15 minutes. Full portfolio scan live within 24 hours, guaranteed.",
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
    page_description: "Autonomní B2B recruitment intelligence a odlehčené ATS pro personální agentury. Zjistěte o nových pozicích klientů v hodinu jejich zveřejnění — dny před LinkedInem.",

    /* ── Navigation ── */
    nav_slogan: "Spend time closing, not searching.",
    nav_modes: "Pracovní postupy",
    nav_live_radar: "Živé signály",
    nav_comparison: "Náskok před trhem",
    nav_pricing: "Ceník",
    nav_insights: "Výzkum & Blog",
    nav_story: "Náš příběh",
    nav_faq: "Časté dotazy",
    nav_signin: "Přihlášení",
    nav_cta: "Vyzkoušet na 14 dní zdarma",
    nav_demo: "Živé demo ↗",

    /* ── Hero ── */
    hero_badge: "Autonomní BD Intelligence & Odlehčené ATS pro Personální Agentury",
    hero_headline_html: "Nové pozice u vašich klientů <span class=\"text-[#FF6B00]\">v hodinu, kdy je vypíšou.</span> Dny před LinkedInem.",
    hero_subheadline: "Přestaňte pálit hodiny konzultantů ručním proklikáváním kariérních webů nebo čekáním na přeplněné pracovní portály. TalentRadar monitoruje enterprise kariérní weby a ATS endpointy 2× denně. Využijte jej jako upstream BD radar vedle vašeho stávajícího ATS, nebo zapněte odlehčenou pipeline pro řízení celé boutique agentury.",
    hero_input_placeholder: "Zadejte pracovní e-mail nebo doménu klienta...",
    hero_cta_btn: "Vyzkoušet na 14 dní zdarma",
    hero_trust_microcopy: "Bez platební karty • Sledování až 200 firem • Nastavení do 24 hodin",

    /* ── Interactive Hero Switcher & Mockup ── */
    mockup_tab_a: "Hledání zakázek (Máme vlastní ATS)",
    mockup_tab_b: "Kompletní systém (Konec tabulek v Excelu)",
    mockup_subtext_a: "Sleduje kariérní stránky klientů 2× denně a nově otevřené pozice předává přímo do vašeho stávajícího CRM.",
    mockup_subtext_b: "Přehledná správa zakázek a kandidátů bez zbytečného balastu, navržená přímo pro boutique headhuntery.",
    mockup_mode_a_badge: "HLEDÁNÍ ZAKÁZEK",
    mockup_mode_b_badge: "KOMPLETNÍ SYSTÉM",
    mockup_scan_status: "Ranní sken 06:00 UTC dokončen • 180 firem monitorováno • 14 nových pozic dnes",
    mockup_xray_btn: "Hiring Manager Bridge",
    mockup_push_btn: "Odeslat do ATS / CSV export",
    mockup_core_match: "CORE SHODA",
    mockup_kanban_title: "Aktivní zakázka: Senior Backend Architect (Go/Node) — Mews",
    mockup_kanban_fee: "Provize: 22 % (odhad €18 500)",
    mockup_col_sourced: "Sourcing",
    mockup_col_contacted: "Osloveno",
    mockup_col_cv_sent: "CV odesláno",
    mockup_col_interview: "Pohovor",
    mockup_col_placed: "Umístěno / Nabídka",

    /* ── Workflows Section ── */
    modes_badge: "Možnosti nasazení",
    modes_headline: "Zvolte si, jak TalentRadar zapadne do vaší agentury",
    modes_subtext: "Ať už vedete zavedený tým s Bullhornem nebo boutique agenturu na Notionu, TalentRadar funguje bez nucených migrací a složitého nastavování.",
    modes_a_title: "Hledání zakázek (Zachovejte své stávající ATS)",
    modes_a_target: "Pro zavedené agentury (5–50 konzultantů s Bullhorn, Datacruit, Recruitis nebo Echo)",
    modes_a_fear: "Vaše obava: „Nechceme migrovat kandidátskou databázi ani nahrazovat stávající ATS.“",
    modes_a_solution: "TalentRadar funguje upstream nad vaším stávajícím ATS jako autonomní vyhledávač klientských pozic. Sleduje weby vašich klientů 2× denně, upozorní vás na pozice v Den Nula a umožňuje export jedním klikem.",
    modes_a_f1: "Monitoruje primární ATS endpointy (Greenhouse, Lever, Workable, Ashby atd.)",
    modes_a_f2: "2× denní automatické skeny (06:00 & 12:00 UTC) s rychlostním náskokem",
    modes_a_f3: "Hiring Manager Bridge pro okamžité nalezení decision-makerů na LinkedInu",
    modes_a_f4: "Okamžitý CSV / Webhook přenos do Bullhorn, Datacruit nebo Recruitis",
    modes_b_title: "Kompletní systém (Konec tabulek v Excelu & Notionu)",
    modes_b_target: "Pro boutique & mikro-agentury (1–10 konzultantů na Excelu, Notionu nebo Trellu — ~72 % trhu)",
    modes_b_fear: "Vaše bolest: „V tabulkách je chaos, zapomínáme na poptávky a enterprise ATS nástroje jsou drahé a překomplikované.“",
    modes_b_solution: "Přehledná správa zakázek a 5fázová kandidátská pipeline napojená přímo na zachycené mandáty klientů. Vše potřebné pro uzavírání bez korporátního balastu.",
    modes_b_f1: "Zachycená role se 1 klikem promění v aktivní klientskou zakázku",
    modes_b_f2: "Přehledná pipeline: Sourcing -> Osloveno -> CV odesláno -> Pohovor -> Umístěno",
    modes_b_f3: "Sdílené interní poznámky, sledování provizí a historie komunikace",
    modes_b_f4: "Nulový balast, žádné migrace, konec chaotických tabulek v Excelu",

    /* ── Live Radar Showcase ── */
    radar_badge: "Živý telemetrický feed",
    radar_headline: "Živé signály: Zachyceno dnes v 06:00 UTC",
    radar_subtext: "Ukázka pozic zachycených přímo z kariérních stránek evropských firem. Ve vašem účtu se tento přehled naplní výhradně vašimi klientskými firmami.",
    radar_tab_all: "Všechny signály",
    radar_tab_tech: "Tech & Cloud",
    radar_tab_sales: "B2B Sales",
    radar_tab_exec: "Executive & C-Level",
    radar_bridge_label: "Hiring Manager Bridge:",
    radar_monitored_title: "Evropští lídři sledovaní denně v této živé ukázce:",
    radar_disclaimer: "(Ukázka ostrého výstupu — vaše portfolio klientů se automaticky napojí do 24 hodin po registraci)",

    /* ── Comparison Table ── */
    compare_badge: "Provozní audit",
    compare_headline: "Běžný agenturní chaos vs. Autonomní náskok TalentRadar",
    compare_subtext: "Přímé srovnání každodenní práce recruitment konzultanta.",
    compare_col_activity: "Činnost",
    compare_col_manual: "Běžná praxe agentur",
    compare_col_radar: "Autonomní náskok TalentRadar",
    compare_row1_label: "Kontrola kariérních webů",
    compare_row1_manual: "Ruční nahodilé proklikávání; 4–6 hodin týdně ztracených na každého konzultanta.",
    compare_row1_radar: "Automatický autonomní monitoring 2× denně (06:00 & 12:00 UTC).",
    compare_row2_label: "Rychlost zjištění pozice",
    compare_row2_manual: "Zpoždění 3–6 dní, než se inzerát objeví na pracovních portálech a LinkedInu.",
    compare_row2_radar: "Zjištění v Den Nula — v řádu hodin po zveřejnění na webu klienta.",
    compare_row3_label: "Mrtvé a obsazené role",
    compare_row3_manual: "Konzultanti oslovují kandidáty na pozice, které klient před týdny v tichosti obsadil.",
    compare_row3_radar: "Auto-Archive démon smaže uzavřené pozice ihned, jakmile zmizí z webu klienta.",
    compare_row4_label: "Správa kandidátů a mandátů",
    compare_row4_manual: "Roztříštěné poznámky v osobních tabulkách, Notionu nebo papírových blocích.",
    compare_row4_radar: "Jednotný BD Master s volitelnou 1-click kandidátskou pipeline.",
    compare_row5_label: "Přidání nového klienta",
    compare_row5_manual: "Ruční zápis do Excelu a neustálé upomínky na ruční kontrolu.",
    compare_row5_radar: "Vložíte odkaz na kariérní stránku — monitoring běží od dalšího skenu.",
    compare_row6_label: "Časová náročnost",
    compare_row6_manual: "Několik hodin administrativního proklikávání každé pondělí dopoledne.",
    compare_row6_radar: "3minutový ranní přehled s připravenými prodejními argumenty a auditním logem.",

    /* ── Intelligence Lab / Blog Teasers ── */
    insights_badge: "TalentRadar Intelligence Lab",
    insights_headline: "Tržní telemetrie, analýzy latence a výzkum",
    insights_subtext: "Nezávislá data z každodenního monitoringu stovek enterprise kariérních webů a ATS systémů napříč Evropou.",
    insights_card1_badge: "DATOVÝ REPORT · 5 MIN ČTENÍ",
    insights_card1_title: "4denní zpoždění: Proč agentury přicházejí o 40 % klientských pozic dřív, než je zaindexují pracovní portály",
    insights_card1_desc: "Přímý monitoring ATS vs. pracovní agregátory. Proč zpoždění 72–96 hodin zabíjí šanci na exkluzivitu a jak náskok v Den Nula získává mandáty.",
    insights_card2_badge: "BD STRATEGIE · 4 MIN ČTENÍ",
    insights_card2_title: "Anatomie otevřených pozic (>35 dní): Nejefektivnější akviziční argument v headhuntingu",
    insights_card2_desc: "Když interní HR tým neobsadí roli ani po 35 dnech, interní sourcing vyčerpal možnosti. Jak postavit teplé oslovení na datech o stárnoucích pozicích.",
    insights_card3_badge: "PROVOZNÍ AUDIT · 4 MIN ČTENÍ",
    insights_card3_title: "Skrytá cena mrtvých inzerátů: Proč práce na neexistujících rolích ničí morálku recruiterů",
    insights_card3_desc: "Až 22 % inzerátů na komerčních portálech představuje již obsazené či zrušené pozice. Jak automatické čištění ušetří 4+ hodiny týdně.",
    insights_explore_all: "Prozkoumat všechny výzkumné články a návody →",

    /* ── Pricing ── */
    pricing_badge: "Vyzkoušet na 14 dní zdarma • Až 200 firem • Bez karty",
    pricing_headline: "Přehledné měsíční tarify v EUR s vysokou návratností",
    pricing_subtext: "Každý tarif zahrnuje 14denní bezplatný pilot s plnou kapacitou skenování. Pouze měsíční platby bez ročních závazků.",
    pricing_monthly_note: "Pouze měsíční fakturace v EUR — možnost zrušení kdykoliv jedním klikem",
    pricing_tier1_name: "Solo Scout",
    pricing_tier1_companies: "až 50 firem",
    pricing_tier1_price: "€119",
    pricing_tier1_period: "/ měsíc",
    pricing_tier1_desc: "Vhodné pro samostatné headhuntery a malé boutique agentury.",
    pricing_tier1_f1: "Až 50 sledovaných klientských firem",
    pricing_tier1_f2: "1× denní automatický ranní sken (06:00 UTC)",
    pricing_tier1_f3: "150 on-demand manuálních skenů / měsíc",
    pricing_tier1_f4: "1 uživatelský účet",
    pricing_tier1_f5: "Plná 2-fázová AI klasifikace (Gemini Flash napříč všemi 6 vertikálami)",
    pricing_tier1_f6: "Auto-archive démon & automatické čištění starých pozic",
    pricing_tier1_f7: "BD Master lead pipeline, sdílené poznámky & CSV export",
    pricing_tier1_f8: "Odlehčená kandidátská pipeline v ceně",
    pricing_tier1_cta: "Vyzkoušet na 14 dní zdarma",

    pricing_tier2_name: "Agency Pro",
    pricing_tier2_badge: "Nejoblíbenější",
    pricing_tier2_companies: "až 200 firem",
    pricing_tier2_price: "€289",
    pricing_tier2_period: "/ měsíc",
    pricing_tier2_desc: "Maximální rychlostní náskok a kapacita pro aktivní agenturní týmy.",
    pricing_tier2_speed_title: "Rychlostní náskok: 2× denní skenování",
    pricing_tier2_speed_body: "Skeny probíhají v 06:00 a 12:00 UTC. O nových pozicích víte v řádu hodin, dny před LinkedInem.",
    pricing_tier2_f1: "Až 200 sledovaných klientských firem",
    pricing_tier2_f2: "2× denní automatické skeny (06:00 & 12:00 UTC)",
    pricing_tier2_f3: "500 on-demand manuálních skenů / měsíc",
    pricing_tier2_f4: "Až 8 týmových účtů s přiřazením vlastníků a poznámkami",
    pricing_tier2_f5: "Plná 2-fázová AI klasifikace (všech 6 vertikál)",
    pricing_tier2_f6: "Týmový auditní log & multi-user přiřazení rolí",
    pricing_tier2_f7: "Prioritní Slack kanál přímo se zakladatelem",
    pricing_tier2_f8: "Kompletní správa zakázek a kandidátů v ceně",
    pricing_tier2_cta: "Vyzkoušet na 14 dní zdarma →",

    pricing_tier3_name: "Scale / Enterprise",
    pricing_tier3_companies: "400+ firem",
    pricing_tier3_price: "Na míru",
    pricing_tier3_price_from: "od €590 / měsíc",
    pricing_tier3_desc: "Pro velké personální agentury s rozsáhlým klientským portfoliem.",
    pricing_tier3_f1: "400+ sledovaných klientských firem",
    pricing_tier3_f2: "Až 4× denní automatické skeny / prioritní worker fronta",
    pricing_tier3_f3: "Neomezené on-demand skeny a neomezený počet uživatelů",
    pricing_tier3_f4: "Vlastní scrapovací adaptéry pro nestandardní kariérní weby",
    pricing_tier3_f5: "Vlastní AI scoring profily na konzultanta / praktiku",
    pricing_tier3_f6: "Dedikovaná Slack podpora & onboarding přímo se zakladatelem",
    pricing_tier3_cta: "Kontaktovat zakladatele",

    pricing_roi_html: "Jediné umístění v tech nebo executive search zaplatí <strong>4+ roky Agency Pro</strong>. Zachytit jeden mandát 48 hodin dříve generuje okamžitou <strong>ROI 4 000 %+</strong>.",
    pricing_footnote: "Nativně podporuje Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Personio, BambooHR, Teamtailor, Teamio/Jobs.cz, Recruitis a přímé weby.",

    /* ── Founder Story ── */
    story_badge: "Autorita zakladatele",
    story_headline: "Od ručního proklikávání tabulek k autonomní inteligenci",
    story_p1_html: "Během mého působení v Dublinu v agentuře <a href=\"https://www.linkedin.com/in/rob-magee-749891/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Ingenio Global</a> pod vedením Managing Directora <a href=\"https://www.linkedin.com/in/rob-magee-749891/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Roba Mageeho</a> jsem na vlastní oči viděl, jak zkušení headhunteři tráví každé pondělní dopoledne ručním obcházením kariérních portálů a přepisováním odkazů do tabulek.",
    story_p2: "Byla to pomalá práce náchylná k chybám, která pálila čas, v němž měli konzultanti jednat s kandidáty. Místo pokračování v manuální rutině jsem vyvinul autonomní systém pro přímý monitoring kariérních webů a ATS endpointů.",
    story_p3: "Během dalších dvou měsíců systém běžel v ostrém denním provozu: sledoval 180 enterprise firem a zachytil přes 3 400 otevřených pozic. Konzultanti věděli o nových rolích v den jejich vypsání — dny předtím, než se objevily na pracovních portálech.",
    story_p4: "Po návratu z Dublinu bylo jasné, že stovky recruitment týmů ve střední a západní Evropě stále bojují se stejným tabulkovým chaosem. TalentRadar vznikl proto, aby tuto zbytečnou práci odstranil.",
    story_p5: "Když se ozvete, jednáte přímo se mnou.",
    story_author_name: "Kryštof Pejša",
    story_author_title: "Zakladatel TalentRadar",
    story_linkedin: "Profil na LinkedIn",
    story_rob_linkedin: "Rob Magee (Ingenio Global)",

    /* ── FAQ & Asynchronous Onboarding ── */
    faq_badge: "Implementace bez tření",
    faq_headline: "Časté dotazy",
    faq_onboarding_title: "100% asynchronní onboarding bez zbytečných hovorů",
    faq_onboarding_body: "Při registraci jednoduše vložte domény klientů nebo nahrajte CSV/Excel soubor. Náš engine namapuje vaše účty a ATS endpointy do 24 hodin. Žádné zdlouhavé konfigurační hovory nejsou potřeba.",
    faq_q1: "Jak zjistíte pozice dříve než LinkedIn a pracovní portály?",
    faq_a1: "Firmy nejprve zveřejňují pozice zdarma na svých primárních ATS systémech (Greenhouse, Lever, Ashby atd.) nebo kariérních webech. Komerční job boardy účtují poplatky a spoléhají na vyhledávací roboty se zpožděním 24–96 hodin. TalentRadar kontroluje primární zdroje 2× denně a zachytí role v Den Nula.",
    faq_q2: "Které ATS platformy jsou nativně podporovány?",
    faq_a2: "Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Personio, BambooHR, Teamtailor, Teamio/Jobs.cz, Recruitis a vlastní enterprise portály. Pro nestandardní kariérní weby vytváříme scrapovací adaptéry na míru v rámci tarifu Scale/Enterprise.",
    faq_q3: "Co se stane, když firma pozici uzavře nebo obsadí?",
    faq_a3: "Náš Auto-Archive démon detekuje stažené inzeráty při nejbližším plánovaném skenu (06:00 nebo 12:00 UTC) a automaticky je archivuje. Váš pipeline zůstává 100% čistý bez nutnosti ručního promazávání.",
    faq_q4: "Jak funguje 14denní bezplatný pilot?",
    faq_a4: "Můžete sledovat až 200 klientských firem s plným přístupem ke skenování po dobu 14 dní. Není vyžadována platební karta. Pilot se automaticky nepřevádí na placený tarif — po vyzkoušení se sami rozhodnete, zda chcete pokračovat.",
    faq_q5: "Můžeme data exportovat nebo přenést do stávajícího CRM?",
    faq_a5: "Ano. V režimu Hledání zakázek můžete data jedním klikem exportovat do CSV nebo posílat přes webhook do Bullhornu, Datacruitu, Recruitisu či jiného CRM. Pokud externí ATS nepoužíváte, náš Kompletní systém vám poskytne vestavěnou pipeline.",

    /* ── Pilot / Trial Form ── */
    trial_badge: "Spend time closing, not searching • Vyzkoušet na 14 dní zdarma",
    trial_headline: "Vyzkoušejte TalentRadar na svém portfoliu klientů",
    trial_subtext: "Nahrajte seznam klientů v CSV/Excelu nebo vložte domény. Do 24 hodin namapujeme vaše firmy a spustíme první automatizovaný ranní sken.",
    trial_label_name: "Jméno a příjmení *",
    trial_placeholder_name: "Jan Novák",
    trial_label_email: "Pracovní e-mail agentury *",
    trial_placeholder_email: "jan@agentura.cz",
    trial_label_company: "Název agentury / firmy *",
    trial_placeholder_company: "Vaše agentura s.r.o.",
    trial_label_clients: "Domény klientů nebo portfolio k monitoringu (až 200 firem)",
    trial_placeholder_clients: "Vložte kariérní weby nebo domény klientů (např. tines.com, mews.com, stripe.com)...",
    trial_clients_tag: "Excel, CSV nebo domény",
    trial_upload_cta: "Klikněte pro nahrání souboru s klienty",
    trial_upload_types: "(Excel .xlsx, .xls nebo .csv)",
    trial_upload_note: "Kariérní weby a ATS portály dohledáme za vás. Soubor můžete zaslat i dodatečně po registraci.",
    trial_submit: "Vyzkoušet na 14 dní zdarma →",
    trial_submitting: "Aktivuji zkušební verzi…",
    trial_speed_note: "Přístup obdržíte do 15 minut. Plný sken portfolia garantujeme do 24 hodin.",
    trial_gdpr_html: "Odesláním souhlasíte se zpracováním kontaktních údajů pro vytvoření zkušebního účtu. Údaje jsou přísně důvěrné a nikomu je nepředáváme. (<a href=\"gdpr.html\" class=\"underline hover:text-[#FF8533]\">Zásady zpracování</a>)",
    trial_contact_prefix: "Přímý kontakt na zakladatele:",

    /* ── Footer ── */
    footer_tagline: "Spend time closing, not searching.",
    footer_author: "Kryštof Pejša",
    footer_gdpr: "Zásady ochrany osobních údajů (GDPR)",
    footer_copyright: "© 2026 TalentRadar. Built for European Recruitment Boutiques & Headhunters.",
  }
};

/* ─────────────────────────────────────────────
   Language Switcher Engine (Isomorphic & Robust)
───────────────────────────────────────────── */
(function () {
  const STORAGE_KEY = 'tr_lang';
  let currentLang = 'en';
  try {
    if (typeof localStorage !== 'undefined') {
      currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
    }
  } catch (e) {
    currentLang = 'en';
  }

  function applyLanguage(lang) {
    if (lang !== 'cs' && lang !== 'en') lang = 'en';
    currentLang = lang;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, lang);
      }
    } catch (e) {}

    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang;

    const dict = TRANSLATIONS[lang];
    if (!dict) return;

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

    // Swap page title and meta description
    if (dict.page_title) document.title = dict.page_title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict.page_description) {
      metaDesc.content = dict.page_description;
    }

    // Update switcher buttons UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      const isActive = btnLang === lang;
      btn.classList.toggle('lang-btn--active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

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
      current: () => currentLang,
      get: (key) => (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || ''
    };
  }
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TRANSLATIONS;
}
