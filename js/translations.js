/**
 * TalentRadar — Official English (en) and Czech (cs) Translation Dictionary
 * 100% Mirrored keys across both languages.
 * Slogan remains strictly in English across both language modes.
 */

const TRANSLATIONS = {
  en: {
    /* ── SEO ── */
    page_title: "TalentRadar — Spend time closing, not searching.",
    page_description: "TalentRadar checks the career pages of every company your agency works with, including the ones you have not spoken to in years, and shows their new roles in one place. For recruitment agencies, next to your own ATS.",

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
    hero_badge: "New-role radar for recruitment agencies",
    hero_headline_html: "All your clients’ new roles <span class=\"text-[#FF6B00]\">in one place.</span>",
    hero_subheadline: "Twice a day we check the career pages and ATS of every company you work with, including the ones you have not spoken to in years. In the morning you know where a role in your niche opened, and why to call.",
    hero_cta_btn: "Try free for 14 days",
    hero_demo_btn: "Interactive demo",

    /* ── Interactive Hero Switcher & Mockup ── */

    /* ── Workflows Section ── */

    /* ── Live Radar Showcase (Mini-App Sandbox) ── */
    radar_badge: "Interactive demo",
    radar_headline: "Click through the whole platform. No sign-up.",
    radar_subtext: "Real roles from the Czech demo’s scans and a made-up agency working on them. Open a role, find the hiring manager, turn it into a job or move a candidate through the pipeline.",
    radar_footnote: "Companies and roles are real, from the demo's daily scans. The agency, its candidates, contacts and placements are made up. Whatever you change stays in your browser.",
    radar_expand: "Show the whole demo",

    /* ── Comparison Table ── */
    compare_badge: "Comparison",
    compare_headline: "How it’s done today, and with TalentRadar",
    compare_subtext: "Your companies, point by point.",
    compare_col_activity: "Task",
    compare_col_manual: "Today",
    compare_col_radar: "With TalentRadar",
    compare_row1_label: "Active clients",
    compare_row1_manual: "You know them, but someone clicks through their career pages by hand, when they get round to it.",
    compare_row1_radar: "Their new roles <strong>in one place</strong>, checked twice a day.",
    compare_row2_label: "Companies you have not spoken to in a year",
    compare_row2_manual: "Nobody watches them. You find out once another agency has filled the role.",
    compare_row2_radar: "<strong>In the morning you know they are hiring</strong>, and you have a reason to call.",
    compare_row3_label: "Filled and withdrawn roles",
    compare_row3_manual: "Consultants pitch candidates for roles the client quietly filled weeks ago.",
    compare_row3_radar: "When a role disappears from the client’s site, TalentRadar <strong>archives it by itself</strong>.",
    compare_row4_label: "Who decides there",
    compare_row4_manual: "The contact in your CRM is two years old.",
    compare_row4_radar: "Your contact, and <strong>a one-click search</strong> for who decides there now.",
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
    pricing_headline: "Simple pricing, 25% less when you pay yearly",
    pricing_subtext: "Try any plan in full, free for 14 days. No commitment, cancel any time.",
    pricing_monthly_note: "Prices excl. VAT • Invoiced in euros, monthly or yearly • No setup fees",
    pricing_toggle_monthly: "Monthly",
    pricing_toggle_annual: "Yearly",
    pricing_toggle_save: "−25%",
    pricing_tier1_name: "Solo Scout",
    pricing_tier1_companies: "up to 50 companies",
    pricing_tier1_price: "€119",
    pricing_tier1_price_annual: "€89",
    pricing_tier1_billing: "billed monthly",
    pricing_tier1_billing_annual: "billed yearly, €1,068 a year",
    pricing_tier1_period: "/ month",
    pricing_tier1_desc: "For solo headhunters and small agencies.",
    pricing_tier1_f1: "Up to 50 client companies monitored",
    pricing_tier1_f2: "Automatic scans twice a day (at 6:00 and 12:00 your time)",
    pricing_tier1_f3: "150 manual scans a week",
    pricing_tier1_f4: "Unlimited users",
    pricing_tier1_f5: "AI sorts roles into all 6 practice areas",
    pricing_tier1_f6: "Filled and withdrawn roles archived automatically",
    pricing_tier1_f7: "Every role in BD Master, shared notes and CSV export",
    pricing_tier1_f8: "Simple ATS included",
    pricing_tier1_addon: "Need more companies? 25 more for €39 a month.",
    pricing_tier1_cta: "Try free for 14 days",

    pricing_tier2_name: "Agency Pro",
    pricing_tier2_badge: "Recommended",
    pricing_tier2_companies: "up to 200 companies",
    pricing_tier2_price: "€289",
    pricing_tier2_price_annual: "€217",
    pricing_tier2_billing: "billed monthly",
    pricing_tier2_billing_annual: "billed yearly, €2,604 a year",
    pricing_tier2_period: "/ month",
    pricing_tier2_desc: "For agency teams who follow dozens of clients.",
    pricing_tier2_speed_title: "40% less per company than Solo Scout",
    pricing_tier2_speed_body: "Each company you monitor costs 40% less than on Solo Scout, with the same team features as larger agencies.",
    pricing_tier2_f1: "Up to 200 client companies monitored",
    pricing_tier2_f2: "Automatic scans twice a day",
    pricing_tier2_f3: "500 manual scans a week",
    pricing_tier2_f4: "Unlimited users, and every role can have its owner",
    pricing_tier2_f5: "AI sorts roles into all 6 practice areas",
    pricing_tier2_f6: "Team change history and handing roles to colleagues",
    pricing_tier2_f7: "Your own Slack channel with the founder",
    pricing_tier2_f8: "Simple ATS included",
    pricing_tier2_cta: "Try free for 14 days →",

    pricing_tier3_name: "Scale",
    pricing_tier3_companies: "up to 500 companies",
    pricing_tier3_price: "€529",
    pricing_tier3_price_annual: "€399",
    pricing_tier3_period: "/ month",
    pricing_tier3_billing: "billed monthly",
    pricing_tier3_billing_annual: "billed yearly, €4,788 a year",
    pricing_tier3_desc: "For large agencies with many clients.",
    pricing_tier3_f1: "Up to 500 client companies monitored, more by arrangement",
    pricing_tier3_f2: "Automatic scans up to four times a day, and your scans go first",
    pricing_tier3_f3: "Unlimited users",
    pricing_tier3_f4: "Custom connections for non-standard career pages",
    pricing_tier3_f5: "AI role scoring tuned per consultant or practice area",
    pricing_tier3_f6: "Slack support and onboarding with the founder",
    pricing_tier3_f8: "Simple ATS included",
    pricing_tier3_cta: "Write to the founder",

    pricing_roi_html: "A single tech or executive search placement <strong>pays for Agency Pro for a year or more</strong>.",
    pricing_footnote: "Works with Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Workday, Personio, BambooHR, Teamtailor, Recruitee, Pinpoint, HireHive, Teamio/Jobs.cz, Phenom and Jibe, and with ordinary career pages.",

    /* ── Founder Story ── */
    story_badge: "How TalentRadar started",
    story_headline: "From Monday-morning clicking to a radar that does it for you",
    story_p1_html: "In Dublin I worked at <a href=\"https://www.linkedin.com/company/ingenio-global/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Ingenio Global</a>, the agency run by <a href=\"https://www.linkedin.com/in/rob-magee-749891/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Rob Magee</a>, and watched experienced headhunters spend every Monday morning going through career pages and copying links into spreadsheets.",
    story_p2: "It was slow work where things were easy to miss, and it took time the consultants should have spent with candidates. So I wrote a system that checks companies’ career pages and ATS by itself.",
    story_p3: "For the next two months it ran every day in production: it watched 180 large companies and caught more than 3,400 open roles. Consultants heard about new roles on the day they were posted.",
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
    faq_q1: "Do I have to move my CRM or ATS?",
    faq_a1: "No. An export of your companies from your CRM or a spreadsheet is enough: company, website and, if you have them, the date of your last contact and whether you ever placed someone there. The new roles go back as a CSV export you import into your ATS. A direct connection to Bullhorn or another ATS isn’t available yet.",
    faq_q2: "Which ATS does TalentRadar work with?",
    faq_a2: "Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Workday, Personio, BambooHR, Teamtailor, Recruitee, Pinpoint, HireHive, Teamio/Jobs.cz, Phenom and Jibe, as well as large companies’ own career pages. We connect non-standard pages on request in the Scale plan.",
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
    hero_trust_2: "Free for 14 days",
    hero_trust_3: "Works next to your ATS",
    hero_mock_greeting: "Good morning",
    hero_mock_sub: "New roles since the last scan",
    hero_mock_scan: "SCAN 6:00 ✓",
    hero_mock_kpi1: "active clients",
    hero_mock_kpi2: "dormant clients",
    hero_mock_kpi3: "target companies",
    mock_tag_client: "C",
    mock_loc_prague_hybrid: "Prague / Hybrid",
    mock_loc_brno_hybrid: "Brno / Hybrid",
    hero_mock_hm_where: "Air Bank · Prague",
    hero_mock_old_label: "Open 45+ days",
    hero_mock_old_where: "Rohlik Group · active client, a reason to call",
    hero_mock_caption: "Illustration of the home screen: the roles are real, from the Czech demo’s scan; the agency and its contact history are made up.",
    ats_strip_label: "Reads roles straight from",
    ats_strip_more: "+ 7 more and ordinary career pages",

    /* ── v2: features, block by block ── */
    feat_badge: "What it does",
    feat_headline: "Every morning, the work your consultants used to do by hand",
    feat_subtext: "From the first sign that a company is hiring to the call: what TalentRadar does for you, and what it looks like.",
    feat1_kicker: "Home",
    feat1_title: "Every company you work with, in one place",
    feat1_body: "Upload your companies from your CRM or a spreadsheet. TalentRadar checks their career pages and ATS at 6:00 and 12:00 your time, and in the morning the new roles wait for you by company: active clients, dormant clients and target companies.",
    feat1_mock_title: "Companies with new roles",
    feat1_mock_all: "ALL",
    feat1_mock_col_company: "Company",
    feat1_mock_col_new: "New",
    feat2_kicker: "Dormant clients",
    feat2_title: "Including the companies you have not spoken to in a long time",
    feat2_body: "Your CRM is full of companies that are hiring right now. Nobody watches them, and when they open a role, it goes to another agency. Bring them in with the date of your last contact: a company you have not dealt with for six months moves to dormant clients by itself, and in the morning you see which of them are hiring again.",
    feat3_kicker: "Opportunities",
    feat3_title: "A reason to call, not a cold call or email",
    feat3_body: "Next to each role, TalentRadar tells you why to call: a fresh role while you can be first, a role open for over 45 days that the client cannot fill alone, a sudden jump in hiring, or a company you have not spoken to in a long time.",
    feat3_mock_title: "Opportunities",
    feat3_mock_30: "roles open 30+ days",
    feat3_mock_45: "roles open 45+ days",
    feat3_mock_since: "published",
    feat4_kicker: "Role detail",
    feat4_title: "Who decides there now",
    feat4_body: "Next to each role you first see your own contacts at the company, from your CRM import or the ATS, with the date you last spoke. When the contact is old, TalentRadar works out from the posting who most likely decides on the hire now, and you search for them on LinkedIn or through Google X-Ray in one click.",

    /* ── v2: client reference (placeholder, localhost only) ── */
    ref_badge: "From the agency where it started",
    ref_quote: "Rob Magee’s quote goes here, about what the radar changed for Ingenio’s consultants. Two or three sentences in his own words.",
    ref_photo: "photo",
    ref_role: "Ingenio Global, Dublin",
    ref_stat1: "companies watched",
    ref_stat2: "hours saved a week",

    /* ── v2: footer ── */
    footer_about: "New-role radar for recruitment agencies. Born at an agency in Dublin, built in Prague.",
    footer_col_product: "Product",
    footer_col_resources: "Resources",
    footer_col_contact: "Contact",
    footer_linkedin_company: "TalentRadar on LinkedIn",

    /* ── v3 (26. 10.): every company in one place, dormant clients, next to your ATS ── */
    faq_q6: "Does TalentRadar send e-mails for us?",
    faq_a6: "No. TalentRadar shows you whom to call and why, and soon it will draft the message in your own style too. You always send it yourself, from your own mailbox. No mass mailing, no automatic sequences, no open tracking.",
    mock_tag_dormant: "D",
    mock_tag_target: "T",
    hero_mock_cold_label: "Dormant client, hiring",
    hero_mock_cold_where: "Pure Storage · last spoke 14 months ago",
    hero_mock_hm_now: "Who decides there now",
    feat1_mock_active: "ACTIVE",
    feat1_mock_dormant: "DORMANT",
    feat1_mock_target: "TARGET",
    feat2_mock_title: "Clients you have not spoken to in months are hiring",
    feat2_mock_sub: "3 roles in your niche at 3 companies",
    feat2_mock_r1: "last contact 14 months ago · placement 2023",
    feat2_mock_r2: "last contact 9 months ago",
    feat2_mock_r3: "last contact 2 years ago · placement 2022",
    feat2_mock_note: "Real roles from the demo’s scan; the contact history is made up.",
    feat3_mock_spike: "5 new roles at once",
    feat3_mock_spike_tag: "JUMP",
    feat4_mock_new: "NEW",
    feat4_mock_contacts: "Your contacts at the company",
    feat4_mock_old: "last contact 20 months ago",
    feat4_mock_where: "Searched in: Prague",
    feat5_soon: "Coming soon",
    feat5_title: "Outreach drafts in your own style",
    feat5_body: "Each consultant pastes a few of their own e-mails and TalentRadar learns how they write. For a role it then drafts an e-mail, a LinkedIn message or the opening of a call. You send it yourself, from your own mailbox: no mass mailing, no automatic sequences, no open tracking.",
    ats_badge: "Into your ATS",
    ats_headline: "Works next to your ATS",
    ats_subtext: "Nothing to migrate and nothing to change. Your companies come in from your CRM, the new roles go back out to your ATS.",
    ats_c1_title: "Import from your CRM or Excel",
    ats_c1_body: "Companies, website, last contact, past placements and contact people, from a Vincere, Bullhorn, Recruitis or Datacruit export or your own spreadsheet. We recognise the columns by their names.",
    ats_c2_title: "Export to CSV",
    ats_c2_body: "Export the roles in one click, with the same filters you have on screen, and import the file into your ATS.",
    ats_c3_title: "Your candidates stay where they are",
    ats_c3_body: "TalentRadar watches companies and their roles, not your candidate database. Datacruit, Recruitis, Teamio, Bullhorn, Vincere or Excel: you keep what you use.",
    ats_light_label: "No ATS?",
    ats_light_title: "A simple ATS is included in the price.",
    ats_light_body: "Candidates, contacts, jobs, pipeline and placements right next to the roles the radar found. Switch it on in Settings when you want it.",
  },

  cs: {
    /* ── SEO ── */
    page_title: "TalentRadar — Spend time closing, not searching.",
    page_description: "TalentRadar hlídá kariérní weby všech firem vaší agentury, i těch, se kterými jste roky nejednali, a nové pozice ukáže na jednom místě. Pro personální agentury, vedle vašeho ATS.",

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
    hero_badge: "Radar zakázek pro personální agentury",
    hero_headline_html: "Nové pozice všech vašich klientů <span class=\"text-[#FF6B00]\">na&nbsp;jednom místě.</span>",
    hero_subheadline: "Dvakrát denně projdeme kariérní weby a ATS všech firem, se kterými pracujete, i těch, se kterými jste roky nejednali. Ráno víte, kde se otevřela pozice ve vaší nice a proč zavolat.",
    hero_cta_btn: "Vyzkoušet na 14 dní zdarma",
    hero_demo_btn: "Interaktivní demo",

    /* ── Interactive Hero Switcher & Mockup ── */

    /* ── Workflows Section ── */

    /* ── Live Radar Showcase (Mini-App Sandbox) ── */
    radar_badge: "Interaktivní demo",
    radar_headline: "Proklikejte si celou platformu. Bez registrace.",
    radar_subtext: "Skutečné pozice ze skenů českého dema a vymyšlená agentura, která na nich pracuje. Otevřete si pozici, najděte hiring managera, udělejte z ní zakázku nebo posuňte kandidáta v pipeline.",
    radar_footnote: "Firmy a pozice jsou skutečné, z denních skenů dema. Agentura, její kandidáti, kontakty a umístění jsou vymyšlené. Co změníte, zůstane jen ve vašem prohlížeči.",
    radar_expand: "Zobrazit celé demo",

    /* ── Comparison Table ── */
    compare_badge: "Srovnání",
    compare_headline: "Jak se to dělá dnes a jak s TalentRadarem",
    compare_subtext: "Vaše firmy, bod po bodu.",
    compare_col_activity: "Činnost",
    compare_col_manual: "Dnes",
    compare_col_radar: "S TalentRadarem",
    compare_row1_label: "Aktivní klienti",
    compare_row1_manual: "Znáte je, ale jejich weby někdo proklikává ručně a nepravidelně.",
    compare_row1_radar: "Jejich nové pozice <strong>na jednom místě</strong>, kontrolované dvakrát denně.",
    compare_row2_label: "Firmy, se kterými jste rok nemluvili",
    compare_row2_manual: "Nehlídá je nikdo. Dozvíte se, až pozici obsadí jiná agentura.",
    compare_row2_radar: "<strong>Ráno víte, že nabírají</strong>, a máte důvod zavolat.",
    compare_row3_label: "Obsazené a stažené pozice",
    compare_row3_manual: "Konzultanti oslovují kandidáty na pozice, které klient už před týdny potichu obsadil.",
    compare_row3_radar: "Když pozice zmizí z webu klienta, TalentRadar ji <strong>sám archivuje</strong>.",
    compare_row4_label: "Kdo tam rozhoduje",
    compare_row4_manual: "Kontakt v CRM je dva roky starý.",
    compare_row4_radar: "Váš kontakt a <strong>jedním klikem hledání</strong>, kdo tam rozhoduje teď.",
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
    pricing_headline: "Jednoduchý ceník, při roční platbě o 25 % levněji",
    pricing_subtext: "Každý tarif si můžete 14 dní zdarma vyzkoušet naplno. Bez závazků, zrušit můžete kdykoli.",
    pricing_monthly_note: "Ceny jsou bez DPH • Fakturujeme v korunách, měsíčně nebo ročně • Žádné poplatky za zřízení",
    pricing_toggle_monthly: "Měsíčně",
    pricing_toggle_annual: "Ročně",
    pricing_toggle_save: "−25 %",
    pricing_tier1_name: "Solo Scout",
    pricing_tier1_companies: "až 50 firem",
    pricing_tier1_price: "2 990 Kč",
    pricing_tier1_price_annual: "2 240 Kč",
    pricing_tier1_billing: "platba měsíčně",
    pricing_tier1_billing_annual: "při roční platbě, 26 880 Kč ročně",
    pricing_tier1_period: "/ měsíc",
    pricing_tier1_desc: "Pro samostatné headhuntery a malé agentury.",
    pricing_tier1_f1: "Až 50 sledovaných klientských firem",
    pricing_tier1_f2: "Automatické skeny dvakrát denně (v 6:00 a ve 12:00 vašeho času)",
    pricing_tier1_f3: "150 ručních skenů týdně",
    pricing_tier1_f4: "Neomezeně uživatelů",
    pricing_tier1_f5: "AI roztřídí pozice do všech 6 oborů",
    pricing_tier1_f6: "Automatická archivace obsazených a stažených pozic",
    pricing_tier1_f7: "Všechny pozice v BD Masteru, sdílené poznámky a export do CSV",
    pricing_tier1_f8: "Jednoduché ATS v ceně",
    pricing_tier1_addon: "Potřebujete víc firem? Dalších 25 firem za 990 Kč měsíčně.",
    pricing_tier1_cta: "Vyzkoušet na 14 dní zdarma",

    pricing_tier2_name: "Agency Pro",
    pricing_tier2_badge: "Doporučujeme",
    pricing_tier2_companies: "až 200 firem",
    pricing_tier2_price: "6 990 Kč",
    pricing_tier2_price_annual: "5 240 Kč",
    pricing_tier2_billing: "platba měsíčně",
    pricing_tier2_billing_annual: "při roční platbě, 62 880 Kč ročně",
    pricing_tier2_period: "/ měsíc",
    pricing_tier2_desc: "Pro agenturní týmy, které sledují desítky klientů.",
    pricing_tier2_speed_title: "O 40 % levnější za firmu než Solo Scout",
    pricing_tier2_speed_body: "Každá sledovaná firma vás tu stojí o 40 % méně než v Solo Scoutu a máte stejné týmové funkce jako velké agentury.",
    pricing_tier2_f1: "Až 200 sledovaných klientských firem",
    pricing_tier2_f2: "Automatické skeny dvakrát denně",
    pricing_tier2_f3: "500 ručních skenů týdně",
    pricing_tier2_f4: "Neomezeně uživatelů, každá pozice může mít svého vlastníka",
    pricing_tier2_f5: "AI roztřídí pozice do všech 6 oborů",
    pricing_tier2_f6: "Historie změn v týmu a přidělování pozic kolegům",
    pricing_tier2_f7: "Vlastní Slack kanál přímo se zakladatelem",
    pricing_tier2_f8: "Jednoduché ATS v ceně",
    pricing_tier2_cta: "Vyzkoušet na 14 dní zdarma →",

    pricing_tier3_name: "Scale",
    pricing_tier3_companies: "až 500 firem",
    pricing_tier3_price: "13 290 Kč",
    pricing_tier3_price_annual: "9 990 Kč",
    pricing_tier3_period: "/ měsíc",
    pricing_tier3_billing: "platba měsíčně",
    pricing_tier3_billing_annual: "při roční platbě, 119 880 Kč ročně",
    pricing_tier3_desc: "Pro velké agentury s mnoha klienty.",
    pricing_tier3_f1: "Až 500 sledovaných klientských firem, víc po domluvě",
    pricing_tier3_f2: "Automatické skeny až čtyřikrát denně, vaše skeny mají přednost",
    pricing_tier3_f3: "Neomezeně uživatelů",
    pricing_tier3_f4: "Napojení nestandardních kariérních webů na míru",
    pricing_tier3_f5: "AI hodnocení pozic nastavené podle konzultanta nebo specializace",
    pricing_tier3_f6: "Podpora přes Slack a zaškolení přímo se zakladatelem",
    pricing_tier3_f8: "Jednoduché ATS v ceně",
    pricing_tier3_cta: "Napsat zakladateli",

    pricing_roi_html: "Jedno umístění v IT nebo executive search vám <strong>Agency Pro zaplatí na rok i déle</strong>.",
    pricing_footnote: "Umí Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Workday, Personio, BambooHR, Teamtailor, Recruitee, Pinpoint, HireHive, Teamio/Jobs.cz, Phenom a Jibe i běžné kariérní weby.",

    /* ── Founder Story ── */
    story_badge: "Jak TalentRadar vznikl",
    story_headline: "Od pondělního proklikávání webů k radaru, který to dělá sám",
    story_p1_html: "V Dublinu jsem pracoval v agentuře <a href=\"https://www.linkedin.com/company/ingenio-global/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Ingenio Global</a>, kterou vede <a href=\"https://www.linkedin.com/in/rob-magee-749891/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-[#FF8533] underline hover:text-white font-semibold\">Rob Magee</a>, a viděl jsem, jak zkušení headhunteři tráví každé pondělní dopoledne obcházením kariérních webů a přepisováním odkazů do tabulek.",
    story_p2: "Byla to pomalá práce, při které se snadno něco přehlédlo, a brala čas, který měli konzultanti věnovat kandidátům. Tak jsem napsal systém, který kariérní weby a ATS firem kontroluje sám.",
    story_p3: "Další dva měsíce systém běžel každý den naostro: sledoval 180 velkých firem a zachytil přes 3 400 otevřených pozic. Konzultanti se o nových pozicích dozvídali v den vypsání.",
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
    faq_q1: "Musím přenést svoje CRM nebo ATS?",
    faq_a1: "Ne. Stačí export firem z CRM nebo tabulka v Excelu: firma, web, a když je máte, datum posledního kontaktu a jestli u firmy proběhla zakázka. Nové pozice pak jedním klikem vyexportujete do CSV a nahrajete zpátky do svého ATS. Přímé napojení na Bullhorn nebo jiné ATS zatím nemáme.",
    faq_q2: "Se kterými ATS TalentRadar umí pracovat?",
    faq_a2: "Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Workday, Personio, BambooHR, Teamtailor, Recruitee, Pinpoint, HireHive, Teamio/Jobs.cz, Phenom a Jibe a také vlastní kariérní weby velkých firem. Nestandardní weby napojíme na míru v tarifu Scale.",
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
    hero_trust_2: "14 dní zdarma",
    hero_trust_3: "Funguje vedle vašeho ATS",
    hero_mock_greeting: "Dobré ráno",
    hero_mock_sub: "Nové pozice od posledního skenu",
    hero_mock_scan: "SKEN 6:00 ✓",
    hero_mock_kpi1: "aktivní klienti",
    hero_mock_kpi2: "dlouho bez kontaktu",
    hero_mock_kpi3: "cílové firmy",
    mock_tag_client: "K",
    mock_loc_prague_hybrid: "Praha / hybrid",
    mock_loc_brno_hybrid: "Brno / hybrid",
    hero_mock_hm_where: "Air Bank · Praha",
    hero_mock_old_label: "Otevřeno přes 45 dní",
    hero_mock_old_where: "Rohlik Group · aktivní klient, důvod zavolat",
    hero_mock_caption: "Ilustrace úvodní obrazovky: pozice jsou skutečné ze skenu českého dema, agentura a historie kontaktů jsou vymyšlené.",
    ats_strip_label: "Pozice čte přímo z",
    ats_strip_more: "+ 7 dalších a běžné kariérní weby",

    /* ── v2: funkce po blocích ── */
    feat_badge: "Co umí",
    feat_headline: "Každé ráno udělá práci, kterou konzultanti dělali ručně",
    feat_subtext: "Od prvního signálu, že firma nabírá, až po telefonát: co za vás TalentRadar udělá a jak to vypadá.",
    feat1_kicker: "Domov",
    feat1_title: "Všechny vaše firmy na jednom místě",
    feat1_body: "Firmy nahrajete z CRM nebo z Excelu. TalentRadar v 6:00 a ve 12:00 vašeho času projde jejich kariérní weby a ATS a ráno na vás nové pozice čekají seřazené podle firem: aktivní klienti, firmy dlouho bez kontaktu a cílové firmy.",
    feat1_mock_title: "Firmy s novými pozicemi",
    feat1_mock_all: "VŠE",
    feat1_mock_col_company: "Firma",
    feat1_mock_col_new: "Nové",
    feat2_kicker: "Dlouho bez kontaktu",
    feat2_title: "I firmy, se kterými jste dlouho nemluvili",
    feat2_body: "Vaše CRM je plné firem, které právě nabírají. Nikdo je nehlídá, a když otevřou pozici, dostane ji jiná agentura. Nahrajte je s datem posledního kontaktu: firma, se kterou jste půl roku nejednali, se sama přesune mezi „dlouho bez kontaktu“ a ráno uvidíte, které z nich znovu nabírají.",
    feat3_kicker: "Příležitosti",
    feat3_title: "Důvod zavolat, žádný studený hovor ani e-mail",
    feat3_body: "U každé pozice TalentRadar řekne, proč zavolat: čerstvá pozice, dokud můžete být první, pozice otevřená přes 45 dní, kterou klient sám neobsadí, náhlý skok v náboru, nebo firma, se kterou jste dlouho nemluvili.",
    feat3_mock_title: "Příležitosti",
    feat3_mock_30: "pozic otevřených přes 30 dní",
    feat3_mock_45: "pozic otevřených přes 45 dní",
    feat3_mock_since: "zveřejněno",
    feat4_kicker: "Detail pozice",
    feat4_title: "Kdo tam teď rozhoduje",
    feat4_body: "U pozice nejdřív uvidíte své kontakty u firmy, z importu z CRM nebo z ATS, s datem, kdy jste spolu naposledy mluvili. Když je kontakt starý, TalentRadar z inzerátu odhadne, kdo o náboru nejspíš rozhoduje teď, a jedním klikem ho hledáte na LinkedInu nebo přes Google X-Ray.",

    /* ── v2: reference klienta (zástupný text, jen localhost) ── */
    ref_badge: "Z agentury, kde to celé začalo",
    ref_quote: "Sem přijde citát Roba Magee o tom, co radar změnil konzultantům v Ingeniu. Dvě až tři věty jeho slovy.",
    ref_photo: "fotka",
    ref_role: "Ingenio Global, Dublin",
    ref_stat1: "sledovaných firem",
    ref_stat2: "hodin ušetřených týdně",

    /* ── v2: patička ── */
    footer_about: "Radar zakázek pro personální agentury. Vznikl v agentuře v Dublinu, vyvíjí se v Praze.",
    footer_col_product: "Produkt",
    footer_col_resources: "Zdroje",
    footer_col_contact: "Kontakt",
    footer_linkedin_company: "TalentRadar na LinkedInu",

    /* ── v3 (26. 10.): every company in one place, dormant clients, next to your ATS ── */
    faq_q6: "Rozesílá TalentRadar e-maily za nás?",
    faq_a6: "Ne. TalentRadar ukáže, komu a proč zavolat, a brzy vám navrhne i text oslovení ve vašem stylu. Odesíláte ale vždy vy sami, ze své schránky. Žádné hromadné rozesílky, automatické sekvence ani sledování otevření.",
    mock_tag_dormant: "D",
    mock_tag_target: "C",
    hero_mock_cold_label: "Dlouho bez kontaktu, nabírá",
    hero_mock_cold_where: "Pure Storage · naposledy před 14 měsíci",
    hero_mock_hm_now: "Kdo tam teď rozhoduje",
    feat1_mock_active: "AKTIVNÍ",
    feat1_mock_dormant: "BEZ KONTAKTU",
    feat1_mock_target: "CÍLOVÉ",
    feat2_mock_title: "Firmy, se kterými jste dlouho nejednali, nabírají",
    feat2_mock_sub: "3 pozice ve vaší nice u 3 firem",
    feat2_mock_r1: "naposledy před 14 měsíci · zakázka 2023",
    feat2_mock_r2: "naposledy před 9 měsíci",
    feat2_mock_r3: "naposledy před 2 lety · zakázka 2022",
    feat2_mock_note: "Pozice jsou skutečné ze skenu dema, historie kontaktů je vymyšlená.",
    feat3_mock_spike: "5 nových pozic najednou",
    feat3_mock_spike_tag: "SKOK",
    feat4_mock_new: "NOVÁ",
    feat4_mock_contacts: "Vaše kontakty u firmy",
    feat4_mock_old: "naposledy před 20 měsíci",
    feat4_mock_where: "Hledá se v: Praha",
    feat5_soon: "Brzy",
    feat5_title: "Návrhy oslovení ve vašem stylu",
    feat5_body: "Každý konzultant vloží pár svých e-mailů a TalentRadar se naučí, jak píše. K pozici pak navrhne e-mail, zprávu na LinkedIn nebo úvod hovoru. Odešlete je sami ze své schránky: žádné hromadné rozesílky, automatické sekvence ani sledování otevření.",
    ats_badge: "Do vašeho ATS",
    ats_headline: "Funguje vedle vašeho ATS",
    ats_subtext: "Nic nestěhujete a nic neměníte. Firmy nahrajete z CRM, nové pozice pošlete zpátky do ATS.",
    ats_c1_title: "Import z CRM nebo Excelu",
    ats_c1_body: "Firmy, web, poslední kontakt, proběhlé zakázky i kontaktní osoby z exportu Vincere, Bullhornu, Recruitisu, Datacruitu nebo z vlastní tabulky. Sloupce poznáme podle názvu.",
    ats_c2_title: "Export do CSV",
    ats_c2_body: "Pozice jedním klikem vyexportujete se stejnými filtry, jaké máte na obrazovce, a soubor nahrajete do svého ATS.",
    ats_c3_title: "Kandidáti zůstanou, kde jsou",
    ats_c3_body: "TalentRadar hlídá firmy a jejich pozice, ne vaši kandidátskou databázi. Datacruit, Recruitis, Teamio, Bullhorn, Vincere nebo Excel: necháte si, co používáte.",
    ats_light_label: "Nemáte ATS?",
    ats_light_title: "Jednoduché ATS máte v ceně.",
    ats_light_body: "Kandidáti, kontakty, zakázky, pipeline a umístění přímo u pozic, které radar našel. Zapnete ho v Nastavení, až ho budete chtít.",
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
