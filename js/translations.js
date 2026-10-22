/**
 * TalentRadar — Official English (en) and Czech (cs) Translation Dictionary
 * 100% Mirrored keys across both languages.
 * Slogan remains strictly in English across both language modes.
 */

const TRANSLATIONS = {
  en: {
    /* ── SEO ── */
    page_title: "TalentRadar — Spend time closing, not searching.",
    page_description: "TalentRadar checks your clients' career pages twice a day and shows you their new roles in one place, straight from the source, before the job boards. For recruitment agencies, with an optional simple ATS.",

    /* ── Navigation ── */
    nav_slogan: "Spend time closing, not searching.",
    nav_modes: "Features",
    nav_live_radar: "Interactive demo",
    nav_comparison: "Comparison",
    nav_pricing: "Pricing",
    nav_insights: "Blog",
    nav_story: "Our story",
    nav_faq: "FAQ",
    nav_signin: "Sign in",
    nav_cta: "Try free for 14 days",
    nav_cta_short: "Try free",
    nav_demo: "Full demo ↗",

    /* ── Hero ── */
    hero_badge: "New-role radar and simple ATS for recruitment agencies",
    hero_headline_html: "See your clients’ new roles first.<br><span class=\"text-[#FF6B00]\">Straight from their career pages, before the job boards.</span>",
    hero_subheadline: "Twice a day TalentRadar checks your clients’ career pages and ATS and shows the new roles in one place. Your consultants no longer hunt for them by hand.",
    hero_cta_btn: "Try free for 14 days",
    hero_demo_btn: "Try the interactive demo",
    hero_trust_microcopy: "✓ No credit card  •  ✓ Up to 200 companies  •  ✓ Up and running within 24 hours",

    /* ── Interactive Hero Switcher & Mockup ── */

    /* ── Workflows Section ── */
    modes_badge: "Two ways to use it",
    modes_headline: "Choose how TalentRadar fits your agency",
    modes_subtext: "Whether your established team works in Bullhorn or Vincere, or you are a small agency running on spreadsheets, there is nothing to migrate and nothing complicated to set up.",
    modes_a_badge: "RADAR ONLY",
    modes_b_badge: "RADAR + ATS",
    modes_a_title: "Keep your ATS, add the radar",
    modes_a_badge_sub: "Next to Datacruit, Recruitis, Teamio…",
    modes_a_target: "For established agencies with 5–50 consultants working in Datacruit, Recruitis, Teamio, TRAFFIT, Bullhorn or another ATS",
    modes_a_fear: "“We don’t want to move our candidate database or change our ATS.”",
    modes_a_solution: "TalentRadar works as a radar next to your ATS: twice a day it checks your clients’ career pages, flags the new roles and exports them to CSV in one click.",
    modes_a_f1: "Reads roles straight from your clients’ ATS (Greenhouse, Lever, Workable, Ashby, Workday and more)",
    modes_a_f2: "Automatic scans twice a day",
    modes_a_f3: "Suggests the likely hiring manager and finds them on LinkedIn or via Google X-Ray in one click",
    modes_a_f4: "One-click CSV export of the roles, with the same filters you have on screen",
    modes_a_cta: "Try the radar →",
    modes_b_title: "No more Excel and Notion spreadsheets",
    modes_b_badge_sub: "Excel • Notion • Trello",
    modes_b_target: "For smaller agencies and solo headhunters (1–10 people) who run on Excel, Notion or Trello today",
    modes_b_fear: "“We get lost in spreadsheets, briefs slip through the cracks, and the big ATS tools are expensive and overcomplicated.”",
    modes_b_solution: "Run your jobs and candidates right next to the roles the radar found. Everything you need to fill a job, and nothing more.",
    modes_b_f1: "Turn a role you found into a job in one click",
    modes_b_f2: "Candidate pipeline: Shortlist → CV sent → Interviews → Offer → Placed",
    modes_b_f3: "Shared internal notes, fee tracking and the history of every stage",
    modes_b_f4: "Runs in the browser, nothing to install",
    modes_b_cta: "Try the radar with ATS →",

    /* ── Live Radar Showcase (Mini-App Sandbox) ── */
    radar_badge: "Interactive demo",
    radar_headline: "Click through the whole platform. No sign-up.",
    radar_subtext: "Real roles from the Czech demo’s scans and a made-up agency working on them. Open a role, find the hiring manager, turn it into a job or move a candidate through the pipeline.",
    radar_footnote: "Companies and roles are real, from the demo's daily scans. The agency, its candidates, contacts and placements are made up. Whatever you change stays in your browser.",
    radar_expand: "Show the whole demo",

    /* ── Comparison Table ── */
    compare_badge: "Comparison",
    compare_headline: "How it’s done today, and with TalentRadar",
    compare_subtext: "A consultant’s ordinary day, point by point.",
    compare_col_activity: "Task",
    compare_col_manual: "Today",
    compare_col_radar: "With TalentRadar",
    compare_row1_label: "Checking career pages",
    compare_row1_manual: "Consultants click through the pages by hand, when they get round to it, and lose hours every week.",
    compare_row1_radar: "The pages are checked automatically <strong>twice a day</strong>.",
    compare_row2_label: "When you hear about a role",
    compare_row2_manual: "Days later, once it shows up on job boards or LinkedIn.",
    compare_row2_radar: "<strong>At the next scan</strong>, usually a few hours after it goes live on the client’s site.",
    compare_row3_label: "Filled and withdrawn roles",
    compare_row3_manual: "Consultants pitch candidates for roles the client quietly filled weeks ago.",
    compare_row3_radar: "When a role disappears from the client’s site, TalentRadar <strong>archives it by itself</strong>.",
    compare_row4_label: "Candidates and jobs",
    compare_row4_manual: "Notes scattered across personal spreadsheets, Notion or a notepad.",
    compare_row4_radar: "<strong>Every role in one place</strong> in BD Master, with candidates added to it in one click.",
    compare_row5_label: "Adding a new client",
    compare_row5_manual: "Type it into Excel, then keep reminding yourself to check it.",
    compare_row5_radar: "Paste the link to their careers page and TalentRadar <strong>watches it from the next scan</strong>.",
    compare_row6_label: "Time it takes",
    compare_row6_manual: "Hours of clicking every Monday morning.",
    compare_row6_radar: "<strong>A three-minute morning overview</strong>, with a reason to call the client next to each role.",

    /* ── Intelligence Lab / Blog Teasers ── */
    insights_badge: "Blog",
    insights_headline: "Research and BD playbooks for recruitment agencies",
    insights_subtext: "Practical business development playbooks built on public hiring research, with every number linked to its source.",
    insights_card1_badge: "MARKET ANALYSIS · 5 MIN READ",
    insights_card1_title: "The Latency Gap: Why the First Days of a Vacancy Decide Who Wins the Mandate",
    insights_card1_desc: "Companies publish new roles on their own careers page first, and applications peak in the first week. Why the agency that sees the role first gets the conversation.",
    insights_card1_cta: "Read the analysis",
    insights_card2_badge: "BD STRATEGY · 4 MIN READ",
    insights_card2_title: "Anatomy of Stale Roles (>35 Days): A High-Probability Pitch in B2B Recruitment",
    insights_card2_desc: "A role still open after five weeks is at or past a typical time-to-fill. How to build a warm pitch around it.",
    insights_card2_cta: "Read the BD playbook",
    insights_card3_badge: "PROCESS AUDIT · 4 MIN READ",
    insights_card3_title: "The Hidden Cost of Dead Vacancies: Why Chasing Ghost Roles Burns Consultant Morale",
    insights_card3_desc: "Greenhouse classifies 18–22% of jobs posted on its platform as ghost jobs. How automatic archiving keeps your list of open roles honest.",
    insights_card3_cta: "Read the process audit",
    insights_explore_all: "Explore all research articles and guides →",

    /* ── Pricing ── */
    pricing_badge: "Free for 14 days • Up to 200 companies • No card",
    pricing_headline: "Simple pricing, paid monthly",
    pricing_subtext: "Try any plan in full, free for 14 days. No commitment, cancel any time.",
    pricing_monthly_note: "Prices excl. VAT • Invoiced monthly in euros • No setup fees",
    pricing_tier1_name: "Solo Scout",
    pricing_tier1_companies: "up to 50 companies",
    pricing_tier1_price: "€119",
    pricing_tier1_period: "/ month",
    pricing_tier1_desc: "For solo headhunters and small agencies.",
    pricing_tier1_f1: "Up to 50 client companies monitored",
    pricing_tier1_f2: "One automatic scan a day, in the morning (at 6:00 your time)",
    pricing_tier1_f3: "150 manual scans a week",
    pricing_tier1_f4: "1 user",
    pricing_tier1_f5: "AI sorts roles into all 6 practice areas",
    pricing_tier1_f6: "Filled and withdrawn roles archived automatically",
    pricing_tier1_f7: "Every role in BD Master, shared notes and CSV export",
    pricing_tier1_f8: "Simple ATS included",
    pricing_tier1_cta: "Try free for 14 days",

    pricing_tier2_name: "Agency Pro",
    pricing_tier2_badge: "Recommended",
    pricing_tier2_companies: "up to 200 companies",
    pricing_tier2_price: "€289",
    pricing_tier2_period: "/ month",
    pricing_tier2_desc: "For agency teams who want to hear about new roles twice a day.",
    pricing_tier2_speed_title: "Twice a day instead of once",
    pricing_tier2_speed_body: "Scans run at 6:00 and 12:00 your time, so roles posted in the morning are on your list after lunch.",
    pricing_tier2_f1: "Up to 200 client companies monitored",
    pricing_tier2_f2: "Automatic scans twice a day",
    pricing_tier2_f3: "500 manual scans a week",
    pricing_tier2_f4: "Up to 8 users, and every role can have its owner",
    pricing_tier2_f5: "AI sorts roles into all 6 practice areas",
    pricing_tier2_f6: "Team change history and handing roles to colleagues",
    pricing_tier2_f7: "Your own Slack channel with the founder",
    pricing_tier2_f8: "Simple ATS included",
    pricing_tier2_cta: "Try free for 14 days →",

    pricing_tier3_name: "Scale / Enterprise",
    pricing_tier3_companies: "200+ companies",
    pricing_tier3_price: "Custom",
    pricing_tier3_price_from: "From €590 a month",
    pricing_tier3_desc: "For large agencies with many clients.",
    pricing_tier3_f1: "More than 200 client companies monitored",
    pricing_tier3_f2: "Automatic scans up to four times a day, and your scans go first",
    pricing_tier3_f3: "Unlimited manual scans and users",
    pricing_tier3_f4: "Custom connections for non-standard career pages",
    pricing_tier3_f5: "AI role scoring tuned per consultant or practice area",
    pricing_tier3_f6: "Slack support and onboarding with the founder",
    pricing_tier3_cta: "Write to the founder",

    pricing_roi_html: "A single tech or executive search placement <strong>pays for Agency Pro for a year or more</strong>.",
    pricing_footnote: "Works with Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Workday, Personio, BambooHR, Teamtailor, Recruitee, Pinpoint, HireHive, Teamio/Jobs.cz, Phenom and Jibe, and with ordinary career pages.",

    /* ── Founder Story ── */
    story_badge: "How TalentRadar started",
    story_headline: "From Monday-morning clicking to a radar that does it for you",
    story_p1_html: "In Dublin I worked at <a href=\"https://www.linkedin.com/company/ingenio-global/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Ingenio Global</a>, the agency run by <a href=\"https://www.linkedin.com/in/rob-magee-749891/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Rob Magee</a>, and watched experienced headhunters spend every Monday morning going through career pages and copying links into spreadsheets.",
    story_p2: "It was slow work where things were easy to miss, and it took time the consultants should have spent with candidates. So I wrote a system that checks companies’ career pages and ATS by itself.",
    story_p3: "For the next two months it ran every day in production: it watched 180 large companies and caught more than 3,400 open roles. Consultants heard about new roles on the day they were posted, days before they showed up on job boards.",
    story_p4: "Back home it was clear that hundreds of agencies across Central and Western Europe struggle with the same spreadsheets. TalentRadar is here so they don’t have to do that work.",
    story_p5: "When you get in touch, you deal with me directly.",
    story_author_name: "Kryštof Pejša",
    story_author_title: "Founder of TalentRadar",
    story_linkedin: "LinkedIn profile",
    story_rob_linkedin: "Rob Magee (Ingenio Global)",

    /* ── FAQ & Asynchronous Onboarding ── */
    faq_badge: "Before you start",
    faq_headline: "Frequently Asked Questions",
    faq_onboarding_title: "Set up without a single call",
    faq_onboarding_body: "When you sign up, paste your clients’ domains or upload their list in Excel or CSV. Within 24 hours we find their career pages and ATS and run the first scan. No calls needed.",
    faq_q1: "How do you know about roles before LinkedIn and job boards?",
    faq_a1: "Companies post roles first in their own ATS (Greenhouse, Lever, Ashby and others) or on their careers page, because it costs them nothing. Roles reach paid job boards later, often several days later. TalentRadar checks the companies’ own pages and ATS twice a day, so it picks up a new role at the next scan.",
    faq_q2: "Which ATS does TalentRadar work with?",
    faq_a2: "Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Workday, Personio, BambooHR, Teamtailor, Recruitee, Pinpoint, HireHive, Teamio/Jobs.cz, Phenom and Jibe, as well as large companies’ own career pages. We connect non-standard pages on request in the Scale / Enterprise plan.",
    faq_q3: "What happens when a company closes or fills a role?",
    faq_a3: "When a listing disappears from the site, the next scan notices, the one after confirms it, and TalentRadar archives the role. If the company posts it again, it comes back with its full history. Nothing to delete by hand.",
    faq_q4: "How do the 14 free days work?",
    faq_a4: "For 14 days you can monitor up to 200 companies and use everything in full. No credit card. The trial does not turn into a paid plan by itself: you decide whether to carry on.",
    faq_q5: "Can we get the roles into our own ATS or CRM?",
    faq_a5: "Yes, as a CSV file. In BD Master you export the roles in one click, with the same filters you have on screen, and import the file into your ATS. A direct connection to Bullhorn or another ATS isn’t available yet. If you don’t have an ATS, Radar + ATS runs the pipeline inside TalentRadar, and you can bring in candidates and contacts from Vincere, Loxo, Bullhorn or LinkedIn exports.",

    /* ── Pilot / Trial Form ── */
    trial_badge: "Spend time closing, not searching • Free for 14 days",
    trial_headline: "Try TalentRadar on your own client list",
    trial_subtext: "Upload your client list in Excel or CSV, or just paste their domains. Within 24 hours we find their career pages and run the first scan.",
    trial_label_name: "Full name *",
    trial_placeholder_name: "Jane Smith",
    trial_label_email: "Agency work e-mail *",
    trial_placeholder_email: "jane@agency.com",
    trial_label_company: "Agency / company name *",
    trial_placeholder_company: "Acme Search Ltd.",
    trial_label_clients: "Clients you want to monitor (up to 200 companies)",
    trial_placeholder_clients: "Paste your clients’ careers page links or domains (e.g. tines.com, mews.com, stripe.com)…",
    trial_clients_tag: "Excel, CSV or Domains",
    trial_clients_help: "What should the list look like?",
    help_kicker: "Client list",
    help_title: "How to prepare your client list",
    help_intro: "An Excel or CSV table with two columns is all we need: the company and the link to its careers page. The first row can hold headings.",
    help_col_a: "Company",
    help_col_b: "Careers page",
    help_ex_empty: "(empty, we find it)",
    help_rule_a: "Column A: the company name (required)",
    help_rule_b: "Column B: the link to the page where the company lists its open roles (optional, we find the missing ones)",
    help_rule_c: "Other columns are fine, we just skip them",
    help_rule_d: "Up to 200 companies, Excel (.xlsx, .xls) or .csv",
    help_text_alt: "No file? Type into the field one company per line, for example “Air Bank, kariera.airbank.cz/prehled-pozic” or just “Rohlik Group”.",
    help_close: "Close",
    trial_upload_cta: "Click to upload your client list",
    trial_upload_types: "(Excel .xlsx, .xls or .csv)",
    trial_upload_note: "We find the career pages and ATS for you. No list at hand? Leave it empty and we will get in touch to collect it.",
    trial_submit: "Start my 14 free days →",
    trial_submitting: "Setting up your trial…",
    trial_step1: "A confirmation e-mail arrives right away.",
    trial_step2: "We set up your workspace, find your clients' career pages and run the first scan.",
    trial_step3: "You get an e-mail with a link to set your password and sign in.",
    trial_file_too_large: "File too large (max 8 MB).",
    trial_error_required: "Please enter your name, work e-mail and agency name.",
    trial_error_generic: "Something went wrong. Please write to us directly at krystof@talentradar.eu",
    trial_speed_note: "Often ready within the hour, always within 24 hours.",
    trial_gdpr_html: "By submitting you agree to the processing of your contact details to create a trial account. We never sell your details or pass them on for marketing. (<a href=\"gdpr.html\" class=\"underline hover:text-[#FF8533]\">Privacy Policy</a>)",
    trial_contact_prefix: "Write to the founder directly:",

    /* ── Footer ── */
    footer_tagline: "Spend time closing, not searching.",
    footer_author: "Kryštof Pejša",
    footer_gdpr: "Privacy Policy (GDPR)",
    footer_copyright: "© 2026 TalentRadar. Built for European recruitment agencies and headhunters.",

    /* ── v2: hero preview, ATS strip ── */
    hero_trust_1: "No credit card",
    hero_trust_2: "Up to 200 companies",
    hero_trust_3: "Up and running within 24 hours",
    hero_mock_greeting: "Good morning",
    hero_mock_sub: "New roles since the last scan",
    hero_mock_scan: "SCAN 6:00 ✓",
    hero_mock_kpi1: "new roles",
    hero_mock_kpi2: "CORE roles open",
    hero_mock_kpi3: "companies watched",
    mock_tag_client: "C",
    mock_loc_prague_hybrid: "Prague / Hybrid",
    mock_loc_brno_hybrid: "Brno / Hybrid",
    hero_mock_hm_label: "Likely hiring manager",
    hero_mock_hm_where: "Air Bank · Prague",
    hero_mock_old_label: "Open 45+ days",
    hero_mock_old_where: "Rohlik Group · client, a reason to call",
    hero_mock_spike_sub: "Prospect · hiring right now",
    hero_mock_spike_label: "5 new roles at once",
    hero_mock_caption: "Illustration of the home screen with real roles from the Czech demo’s scan.",
    ats_strip_label: "Reads roles straight from",
    ats_strip_more: "+ 7 more and ordinary career pages",

    /* ── v2: features, block by block ── */
    feat_badge: "What it does",
    feat_headline: "Every morning, the work your consultants used to do by hand",
    feat_subtext: "From the first sign that a client is hiring to the placement: what TalentRadar does for you, and what it looks like.",
    feat1_kicker: "Home",
    feat1_title: "In the morning you know where new roles opened",
    feat1_body: "TalentRadar checks your clients’ and prospects’ career pages and ATS at 6:00 and 12:00 your time. New roles wait for you sorted by company, clients first, and AI marks the ones that match your practice areas.",
    feat1_p1: "Clients and prospects apart, so you know whom to call first",
    feat1_p2: "CORE roles fit your agency, SELECTIVE ones are worth a look",
    feat1_p3: "Filled and withdrawn roles disappear by themselves",
    feat1_mock_title: "Companies with new roles",
    feat1_mock_all: "ALL",
    feat1_mock_clients: "CLIENTS",
    feat1_mock_prospects: "PROSPECTS",
    feat1_mock_col_company: "Company",
    feat1_mock_col_new: "New",
    feat2_kicker: "Role detail",
    feat2_title: "You know whom to call about the role",
    feat2_body: "TalentRadar works out from the posting who most likely decides on the hire and finds them on LinkedIn or through Google X-Ray. It saves you a lot of searching.",
    feat2_p1: "A likely hiring manager for every role",
    feat2_p2: "LinkedIn and Google X-Ray search in one click",
    feat2_p3: "An AI summary of the role for the first call",
    feat2_mock_new: "NEW",
    feat2_mock_where: "Searched in: Prague",
    feat2_mock_up: "If they don’t reply, one level up: VP of Engineering / CTO",
    feat3_kicker: "Opportunities",
    feat3_title: "A reason to call, not a cold call or email",
    feat3_body: "You call with a reason: right after the company posts a role, while it is fresh and you are first, or when it has been open for over a month and the client can’t fill it alone.",
    feat3_p1: "A new role: you are the first to call, while it is current",
    feat3_p2: "Open 30+ or 45+ days: the client needs help",
    feat3_p3: "Many more roles than usual: the company is growing",
    feat3_mock_title: "Opportunities",
    feat3_mock_30: "roles open 30+ days",
    feat3_mock_45: "roles open 45+ days",
    feat3_mock_since: "published",
    feat4_kicker: "Radar + ATS",
    feat4_title: "From a role to a placement, in one place",
    feat4_body: "When the client gives you the job, one click turns the role into a job with the hiring manager filled in. Candidates move through the pipeline, and the placement records the start date and your fee. Or keep your own ATS and export the roles into it.",
    feat4_p1: "Candidates, contacts, jobs, pipeline, tasks and placements",
    feat4_p2: "Import candidates and contacts from Excel or another ATS",
    feat4_p3: "Not ready to switch? Radar only, next to your ATS",
    feat4_mock_title: "Pipeline",
    feat4_mock_cv: "CV sent",
    feat4_mock_int: "Interview",
    feat4_mock_placed: "Placed",
    feat4_mock_note: "Made-up candidates, as in the demo.",

    /* ── v2: client reference (placeholder, localhost only) ── */
    ref_badge: "From the agency where it started",
    ref_quote: "Rob Magee’s quote goes here, about what the radar changed for Ingenio’s consultants. Two or three sentences in his own words.",
    ref_photo: "photo",
    ref_role: "Ingenio Global, Dublin",
    ref_stat1: "companies watched",
    ref_stat2: "hours saved a week",

    /* ── v2: footer ── */
    footer_about: "New-role radar and simple ATS for recruitment agencies. Born at an agency in Dublin, built in Prague.",
    footer_col_product: "Product",
    footer_col_resources: "Resources",
    footer_col_contact: "Contact",
    footer_linkedin_company: "TalentRadar on LinkedIn",
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
    nav_cta_short: "Vyzkoušet",
    nav_demo: "Plné demo ↗",

    /* ── Hero ── */
    hero_badge: "Radar nových zakázek a jednoduché ATS pro personální agentury",
    hero_headline_html: "Nové pozice vašich klientů uvidíte jako první.<br><span class=\"text-[#FF6B00]\">Dny předtím, než se objeví na&nbsp;LinkedInu a&nbsp;Jobs.cz.</span>",
    hero_subheadline: "TalentRadar dvakrát denně projde kariérní weby a ATS vašich klientů a nové pozice vám ukáže na jednom místě. Konzultanti je už nemusí hledat ručně.",
    hero_cta_btn: "Vyzkoušet na 14 dní zdarma",
    hero_demo_btn: "Vyzkoušet interaktivní demo",
    hero_trust_microcopy: "✓ Bez platební karty  •  ✓ Až 200 firem  •  ✓ Spuštění do 24 hodin",

    /* ── Interactive Hero Switcher & Mockup ── */

    /* ── Workflows Section ── */
    modes_badge: "Dva způsoby použití",
    modes_headline: "Zvolte si, jak TalentRadar zapadne do vaší agentury",
    modes_subtext: "Ať máte zavedený tým v Datacruitu, Recruitisu nebo Bullhornu, nebo menší agenturu, která jede v Excelu, nic nemusíte stěhovat ani složitě nastavovat.",
    modes_a_badge: "JEN RADAR",
    modes_b_badge: "RADAR + ATS",
    modes_a_title: "Vaše ATS zůstane, přibude radar",
    modes_a_badge_sub: "Vedle Datacruitu, Recruitisu, Teamia…",
    modes_a_target: "Pro zavedené agentury s 5–50 konzultanty, které pracují v Datacruitu, Recruitisu, Teamiu, TRAFFITu, Bullhornu nebo jiném ATS",
    modes_a_fear: "„Nechceme stěhovat kandidátskou databázi ani měnit ATS.“",
    modes_a_solution: "TalentRadar funguje jako radar vedle vašeho ATS: dvakrát denně projde weby klientů, upozorní vás na nové pozice a jedním klikem je vyexportujete do CSV.",
    modes_a_f1: "Čte pozice přímo z ATS klientů (Greenhouse, Lever, Workable, Ashby a další)",
    modes_a_f2: "Automatické skeny dvakrát denně",
    modes_a_f3: "Odhadne, kdo je hiring manager, a jedním klikem ho najdete na LinkedInu nebo přes Google X-Ray",
    modes_a_f4: "Export pozic do CSV jedním klikem, se stejnými filtry, jaké máte na obrazovce",
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
    radar_subtext: "Skutečné pozice ze skenů českého dema a vymyšlená agentura, která na nich pracuje. Otevřete si pozici, najděte hiring managera, udělejte z ní zakázku nebo posuňte kandidáta v pipeline.",
    radar_footnote: "Firmy a pozice jsou skutečné, z denních skenů dema. Agentura, její kandidáti, kontakty a umístění jsou vymyšlené. Co změníte, zůstane jen ve vašem prohlížeči.",
    radar_expand: "Zobrazit celé demo",

    /* ── Comparison Table ── */
    compare_badge: "Srovnání",
    compare_headline: "Jak se to dělá dnes a jak s TalentRadarem",
    compare_subtext: "Běžný den konzultanta, bod po bodu.",
    compare_col_activity: "Činnost",
    compare_col_manual: "Dnes",
    compare_col_radar: "S TalentRadarem",
    compare_row1_label: "Kontrola kariérních webů",
    compare_row1_manual: "Konzultanti weby proklikávají ručně a nepravidelně, každý tím ztratí hodiny týdně.",
    compare_row1_radar: "Weby se kontrolují automaticky <strong>dvakrát denně</strong>.",
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
    insights_card2_desc: "Pozice otevřená přes pět týdnů je na hranici běžné doby obsazení, nebo už za ní. Jak toho využít, když klienta oslovujete.",
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
    pricing_monthly_note: "Ceny jsou bez DPH • Fakturujeme měsíčně v korunách • Žádné poplatky za zřízení",
    pricing_tier1_name: "Solo Scout",
    pricing_tier1_companies: "až 50 firem",
    pricing_tier1_price: "2 990 Kč",
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
    pricing_tier2_price: "6 990 Kč",
    pricing_tier2_period: "/ měsíc",
    pricing_tier2_desc: "Pro agenturní týmy, které chtějí o nových pozicích vědět dvakrát denně.",
    pricing_tier2_speed_title: "Dvakrát denně místo jednou",
    pricing_tier2_speed_body: "Skeny běží v 6:00 a ve 12:00 vašeho času, takže o pozicích vypsaných dopoledne víte už po obědě.",
    pricing_tier2_f1: "Až 200 sledovaných klientských firem",
    pricing_tier2_f2: "Automatické skeny dvakrát denně",
    pricing_tier2_f3: "500 ručních skenů týdně",
    pricing_tier2_f4: "Až 8 uživatelů, každá pozice může mít svého vlastníka",
    pricing_tier2_f5: "AI roztřídí pozice do všech 6 oborů",
    pricing_tier2_f6: "Historie změn v týmu a přidělování pozic kolegům",
    pricing_tier2_f7: "Vlastní Slack kanál přímo se zakladatelem",
    pricing_tier2_f8: "Jednoduché ATS v ceně",
    pricing_tier2_cta: "Vyzkoušet na 14 dní zdarma →",

    pricing_tier3_name: "Scale / Enterprise",
    pricing_tier3_companies: "200+ firem",
    pricing_tier3_price: "Na míru",
    pricing_tier3_price_from: "od 14 900 Kč měsíčně",
    pricing_tier3_desc: "Pro velké agentury s mnoha klienty.",
    pricing_tier3_f1: "Více než 200 sledovaných klientských firem",
    pricing_tier3_f2: "Automatické skeny až čtyřikrát denně, vaše skeny mají přednost",
    pricing_tier3_f3: "Neomezeně ručních skenů i uživatelů",
    pricing_tier3_f4: "Napojení nestandardních kariérních webů na míru",
    pricing_tier3_f5: "AI hodnocení pozic nastavené podle konzultanta nebo specializace",
    pricing_tier3_f6: "Podpora přes Slack a zaškolení přímo se zakladatelem",
    pricing_tier3_cta: "Napsat zakladateli",

    pricing_roi_html: "Jedno umístění v IT nebo executive search vám <strong>Agency Pro zaplatí na rok i déle</strong>.",
    pricing_footnote: "Umí Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Workday, Personio, BambooHR, Teamtailor, Recruitee, Pinpoint, HireHive, Teamio/Jobs.cz, Phenom a Jibe i běžné kariérní weby.",

    /* ── Founder Story ── */
    story_badge: "Jak TalentRadar vznikl",
    story_headline: "Od pondělního proklikávání webů k radaru, který to dělá sám",
    story_p1_html: "V Dublinu jsem pracoval v agentuře <a href=\"https://www.linkedin.com/company/ingenio-global/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Ingenio Global</a>, kterou vede <a href=\"https://www.linkedin.com/in/rob-magee-749891/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Rob Magee</a>, a viděl jsem, jak zkušení headhunteři tráví každé pondělní dopoledne obcházením kariérních webů a přepisováním odkazů do tabulek.",
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
    faq_a2: "Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Workday, Personio, BambooHR, Teamtailor, Recruitee, Pinpoint, HireHive, Teamio/Jobs.cz, Phenom a Jibe a také vlastní kariérní weby velkých firem. Nestandardní weby napojíme na míru v tarifu Scale / Enterprise.",
    faq_q3: "Co se stane, když firma pozici uzavře nebo obsadí?",
    faq_a3: "Když inzerát z webu zmizí, nejbližší sken si toho všimne, další to potvrdí a TalentRadar pozici archivuje. Když ji firma vypíše znovu, vrátí se i s celou historií. Nic nemusíte mazat ručně.",
    faq_q4: "Jak funguje 14 dní zdarma?",
    faq_a4: "Po 14 dní můžete sledovat až 200 firem a používat všechno naplno. Platební kartu nezadáváte. Po skončení se zkušební verze sama nezpoplatní, o pokračování rozhodnete vy.",
    faq_q5: "Můžeme data přenést do svého CRM?",
    faq_a5: "Ano, jako soubor CSV. V BD Masteru pozice jedním klikem vyexportujete se stejnými filtry, jaké máte na obrazovce, a soubor nahrajete do svého ATS. Přímé napojení na Bullhorn nebo jiné ATS zatím nemáme. Pokud vlastní ATS nemáte, v režimu Radar + ATS máte pipeline přímo v TalentRadaru a kandidáty i kontakty do něj nahrajete z exportu Vincere, Loxo, Bullhornu nebo LinkedInu.",

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
    trial_clients_help: "Jak má seznam vypadat?",
    help_kicker: "Seznam klientů",
    help_title: "Jak připravit seznam klientů",
    help_intro: "Stačí tabulka v Excelu nebo CSV se dvěma sloupci: firma a odkaz na její kariérní stránku. V prvním řádku můžou být nadpisy.",
    help_col_a: "Firma",
    help_col_b: "Kariérní stránka",
    help_ex_empty: "(prázdné, dohledáme)",
    help_rule_a: "Sloupec A: název firmy (povinné)",
    help_rule_b: "Sloupec B: odkaz na stránku, kde firma vypisuje volné pozice (nepovinné, chybějící dohledáme)",
    help_rule_c: "Další sloupce nevadí, jen je přeskočíme",
    help_rule_d: "Až 200 firem, Excel (.xlsx, .xls) nebo .csv",
    help_text_alt: "Soubor nemáte? Do pole napište jednu firmu na řádek, třeba „Air Bank, kariera.airbank.cz/prehled-pozic“ nebo jen „Rohlik Group“.",
    help_close: "Zavřít",
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

    /* ── v2: náhled v úvodu, pruh s ATS ── */
    hero_trust_1: "Bez platební karty",
    hero_trust_2: "Až 200 firem",
    hero_trust_3: "Spuštění do 24 hodin",
    hero_mock_greeting: "Dobré ráno",
    hero_mock_sub: "Nové pozice od posledního skenu",
    hero_mock_scan: "SKEN 6:00 ✓",
    hero_mock_kpi1: "nových pozic",
    hero_mock_kpi2: "otevřených CORE pozic",
    hero_mock_kpi3: "sledovaných firem",
    mock_tag_client: "K",
    mock_loc_prague_hybrid: "Praha / hybrid",
    mock_loc_brno_hybrid: "Brno / hybrid",
    hero_mock_hm_label: "Pravděpodobný hiring manager",
    hero_mock_hm_where: "Air Bank · Praha",
    hero_mock_old_label: "Otevřeno přes 45 dní",
    hero_mock_old_where: "Rohlik Group · klient, důvod zavolat",
    hero_mock_spike_sub: "Prospekt · právě nabírá",
    hero_mock_spike_label: "5 nových pozic najednou",
    hero_mock_caption: "Ukázka úvodní obrazovky se skutečnými pozicemi ze skenu českého dema.",
    ats_strip_label: "Pozice čte přímo z",
    ats_strip_more: "+ 7 dalších a běžné kariérní weby",

    /* ── v2: funkce po blocích ── */
    feat_badge: "Co umí",
    feat_headline: "Každé ráno udělá práci, kterou konzultanti dělali ručně",
    feat_subtext: "Od prvního signálu, že klient nabírá, až po umístění: co za vás TalentRadar udělá a jak to vypadá.",
    feat1_kicker: "Domov",
    feat1_title: "Ráno víte, kde se otevřely nové pozice",
    feat1_body: "TalentRadar v 6:00 a ve 12:00 vašeho času projde kariérní weby a ATS vašich klientů i prospektů. Nové pozice na vás čekají seřazené podle firem, klienti nahoře, a AI označí ty, které sedí na vaše obory.",
    feat1_p1: "Klienti a prospekti zvlášť, ať víte, komu volat dřív",
    feat1_p2: "CORE pozice sedí na vaši agenturu, SELECTIVE stojí za pohled",
    feat1_p3: "Obsazené a stažené pozice zmizí samy",
    feat1_mock_title: "Firmy s novými pozicemi",
    feat1_mock_all: "VŠE",
    feat1_mock_clients: "KLIENTI",
    feat1_mock_prospects: "PROSPEKTI",
    feat1_mock_col_company: "Firma",
    feat1_mock_col_new: "Nové",
    feat2_kicker: "Detail pozice",
    feat2_title: "Víte, komu kvůli pozici zavolat",
    feat2_body: "TalentRadar z inzerátu odhadne, kdo o náboru nejspíš rozhoduje, a najde ho na LinkedInu nebo přes Google X-Ray. Ušetří vám to spoustu hledání.",
    feat2_p1: "U každé pozice odhad hiring managera",
    feat2_p2: "Hledání na LinkedInu a přes Google X-Ray jedním klikem",
    feat2_p3: "Shrnutí pozice od AI pro první hovor",
    feat2_mock_new: "NOVÁ",
    feat2_mock_where: "Hledá se v: Praha",
    feat2_mock_up: "Když neodpoví, o úroveň výš: VP of Engineering / CTO",
    feat3_kicker: "Příležitosti",
    feat3_title: "Důvod zavolat, žádný studený hovor ani e-mail",
    feat3_body: "Voláte s důvodem: hned, jak firma pozici vypíše, dokud je čerstvá a jste první, nebo když pozice visí přes měsíc a klient ji sám neobsadí.",
    feat3_p1: "Nová pozice: ozvete se jako první, dokud je aktuální",
    feat3_p2: "Otevřená přes 30 nebo 45 dní: klient potřebuje pomoc",
    feat3_p3: "Mnohem víc pozic než obvykle: firma roste",
    feat3_mock_title: "Příležitosti",
    feat3_mock_30: "pozic otevřených přes 30 dní",
    feat3_mock_45: "pozic otevřených přes 45 dní",
    feat3_mock_since: "zveřejněno",
    feat4_kicker: "Radar + ATS",
    feat4_title: "Od pozice k umístění na jednom místě",
    feat4_body: "Když vám klient dá zakázku, jedním klikem z pozice uděláte zakázku i s hiring managerem. Kandidáty posouváte v pipeline a u umístění zapíšete nástup a provizi. Nebo si nechte své ATS a pozice do něj vyexportujte.",
    feat4_p1: "Kandidáti, kontakty, zakázky, pipeline, úkoly a umístění",
    feat4_p2: "Kandidáty a kontakty nahrajete z Excelu nebo z jiného ATS",
    feat4_p3: "Nechcete měnit ATS? Jen radar vedle toho vašeho",
    feat4_mock_title: "Pipeline",
    feat4_mock_cv: "CV odesláno",
    feat4_mock_int: "Pohovor",
    feat4_mock_placed: "Umístěn",
    feat4_mock_note: "Vymyšlení kandidáti, stejně jako v demu.",

    /* ── v2: reference klienta (zástupný text, jen localhost) ── */
    ref_badge: "Z agentury, kde to celé začalo",
    ref_quote: "Sem přijde citát Roba Magee o tom, co radar změnil konzultantům v Ingeniu. Dvě až tři věty jeho slovy.",
    ref_photo: "fotka",
    ref_role: "Ingenio Global, Dublin",
    ref_stat1: "sledovaných firem",
    ref_stat2: "hodin ušetřených týdně",

    /* ── v2: patička ── */
    footer_about: "Radar nových zakázek a jednoduché ATS pro personální agentury. Vznikl v agentuře v Dublinu, vyvíjí se v Praze.",
    footer_col_product: "Produkt",
    footer_col_resources: "Zdroje",
    footer_col_contact: "Kontakt",
    footer_linkedin_company: "TalentRadar na LinkedInu",
  }
};

/* ─────────────────────────────────────────────
   Language Switcher Engine (Isomorphic & Robust)
───────────────────────────────────────────── */
(function () {
  const PRIMARY_STORAGE_KEY = 'talentradar_lang';
  const LEGACY_STORAGE_KEY = 'tr_lang';
  let currentLang = 'en';
  // Set once the URL or an earlier click picked the language; otherwise the
  // browser decides: Czech or Slovak among its languages, or a Czech or
  // Slovak time zone, means Czech.
  let chosen = false;

  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      const defLang = document.documentElement.getAttribute('data-default-lang');
      if (defLang === 'cs' || defLang === 'en') {
        currentLang = defLang;
      }
    }
    const czechPath = typeof window !== 'undefined' && window.location && window.location.pathname &&
      (window.location.pathname.endsWith('-cs.html') || /^\/cs\/?$/.test(window.location.pathname));
    if (czechPath) {
      currentLang = 'cs';
      chosen = true;
    }
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(PRIMARY_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved === 'cs' || saved === 'en') {
        if (!czechPath) {
          currentLang = saved;
          chosen = true;
        }
      }
    }
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const qLang = params.get('lang');
      if (qLang === 'cs' || qLang === 'en') {
        currentLang = qLang;
        chosen = true;
      }
    }
    if (!chosen && typeof navigator !== 'undefined') {
      const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
      let zone = '';
      try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
      if (langs.some(l => /^(cs|sk)\b/i.test(l || '')) || zone === 'Europe/Prague' || zone === 'Europe/Bratislava') {
        currentLang = 'cs';
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

  // persist=false keeps a language guessed from the browser out of storage,
  // so only a click or the URL makes it stick.
  function applyLanguage(lang, persist) {
    if (lang !== 'cs' && lang !== 'en') lang = 'en';
    currentLang = lang;
    try {
      if (persist !== false && typeof localStorage !== 'undefined') {
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
      applyLanguage(currentLang, chosen);
      document.documentElement.classList.remove('tr-i18n-wait');
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
