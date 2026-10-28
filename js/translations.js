/**
 * TalentRadar — Official English (en) and Czech (cs) Translation Dictionary
 * 100% Mirrored keys across both languages.
 * Slogan remains strictly in English across both language modes.
 */

const TRANSLATIONS = {
  en: {
    /* ── SEO ── */
    page_title: "TalentRadar — Spend time closing, not searching.",
    page_description: "TalentRadar checks the career pages of every company your agency works with and shows their open roles in one place, next to your ATS. Scans at 6:00 and 12:00, with a reason to call next to each role.",

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
    nav_cta: "Send your company list",
    nav_cta_short: "Send list",
    nav_demo: "Full demo ↗",
    hero_badge: "Every open role at your companies, next to your ATS",

    /* ── Hero ── */
    hero_headline_html: "<span class=\"tr-h1-a\">Your ATS runs the jobs you have.</span>TalentRadar shows you <span class=\"text-[#FF6B00]\">the ones you could have.</span>",
    hero_subheadline: "Every open role at the companies you work with, in one place and next to your ATS. We check their career pages and ATS twice a day, so you hear about a new role within hours of it going up.",
    hero_cta_btn: "Send your company list",
    hero_cta_sub: "Within 48 hours we show you where they hire and which of your candidates they’d want.",
    hero_demo_btn: "Interactive demo",

    /* ── Interactive Hero Switcher & Mockup ── */

    /* ── Workflows Section ── */

    /* ── Live Radar Showcase (Mini-App Sandbox) ── */
    radar_badge: "Interactive demo",
    radar_headline: "Click through the whole platform. No sign-up.",
    radar_subtext: "Real roles from the Czech demo’s scans and a made-up agency working on them. Open a role, see why it is worth a call and find who decides there.",
    radar_footnote: "Companies and roles are real, from the demo's daily scans. The agency and its contacts are made up. Whatever you change stays in your browser.",
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
    compare_row2_label: "Prospects that are not clients yet",
    compare_row2_manual: "Nobody watches them. You find out once another agency has filled the role.",
    compare_row2_radar: "Their new roles <strong>next to your clients’ roles</strong>, with a reason to call.",
    compare_row3_label: "Filled and withdrawn roles",
    compare_row3_manual: "Consultants pitch candidates for roles the client quietly filled weeks ago.",
    compare_row3_radar: "When a role disappears from the client’s site, TalentRadar <strong>archives it by itself</strong>.",
    compare_row4_label: "Who decides there",
    compare_row4_manual: "The contact in your CRM is two years old.",
    compare_row4_radar: "Your contact, and <strong>a one-click search</strong> for who decides there now.",
    compare_row5_label: "A candidate in hand, and nobody to offer them to",
    compare_row5_manual: "From memory, by phone and on LinkedIn.",
    compare_row5_radar: "Paste the profile and see <strong>the open roles at your companies, best match first</strong>.",
    compare_row6_label: "Time it takes",
    compare_row6_manual: "Hours of clicking every Monday morning.",
    compare_row6_radar: "<strong>A short morning overview</strong>, with a reason to call the client next to each role.",

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
    pricing_badge: "No card · No commitment · Monthly",
    pricing_headline: "Simple pricing, monthly and with no commitment",
    pricing_subtext: "Try any plan in full and for free, with no credit card. Pay yearly and you get 2 months free.",
    pricing_monthly_note: "Prices excl. VAT • Invoiced in euros, monthly or yearly • No setup fees",
    pricing_toggle_monthly: "Monthly",
    pricing_toggle_annual: "Yearly",
    pricing_toggle_save: "2 months free",
    pricing_tier1_name: "Solo Scout",
    pricing_tier1_companies: "up to 50 companies",
    pricing_tier1_price: "€119",
    pricing_tier1_price_annual: "€1,190",
    pricing_tier1_billing: "billed monthly, no commitment",
    pricing_tier1_billing_annual: "billed yearly, 2 months free (instead of €1,428)",
    pricing_tier1_desc: "For solo headhunters.",
    pricing_tier1_f1: "1 user",
    pricing_tier1_f2: "Up to 50 companies: active clients and prospects",
    pricing_tier1_f3: "Automatic scans twice a day (at 6:00 and 12:00 your time)",
    pricing_tier1_f4: "A reason to call and who decides at the company",
    pricing_tier1_f5: "CSV export into your ATS",
    pricing_tier1_cta: "Try it free",

    pricing_tier2_name: "Agency Pro",
    pricing_tier2_badge: "Recommended",
    pricing_tier2_companies: "up to 150 companies",
    pricing_tier2_price: "€289",
    pricing_tier2_price_annual: "€2,890",
    pricing_tier2_billing: "billed monthly, no commitment",
    pricing_tier2_billing_annual: "billed yearly, 2 months free (instead of €3,468)",
    pricing_tier2_desc: "For agency teams who watch dozens of companies.",
    pricing_tier2_speed_title: "The whole team for one price",
    pricing_tier2_speed_body: "Unlimited users and up to 150 companies. Bring your companies and contacts in from a list or your CRM, and give every role its owner.",
    pricing_tier2_f1: "Unlimited users, and every role can have its owner",
    pricing_tier2_f2: "Up to 150 companies",
    pricing_tier2_f3: "Import of companies and contacts from a list or your CRM",
    pricing_tier2_f4: "Automatic scans twice a day",
    pricing_tier2_f5: "Connect Claude or ChatGPT through MCP",
    pricing_tier2_cta: "Try it free →",

    pricing_tier3_name: "Scale",
    pricing_tier3_companies: "up to 400 companies",
    pricing_tier3_price: "€529",
    pricing_tier3_price_annual: "€5,290",
    pricing_tier3_billing: "billed monthly, no commitment",
    pricing_tier3_billing_annual: "billed yearly, 2 months free (instead of €6,348)",
    pricing_tier3_desc: "For large agencies with many clients.",
    pricing_tier3_f1: "Up to 400 companies, more by arrangement",
    pricing_tier3_f2: "Everything in Agency Pro",
    pricing_tier3_f3: "More frequent scans: up to four times a day, and your scans go first",
    pricing_tier3_f4: "Custom connections for non-standard career pages",
    pricing_tier3_f6: "Set-up with the founder: we import your CRM for you, and support over Slack",
    pricing_tier3_cta: "Write to the founder",

    pricing_roi_html: "One placement you win through TalentRadar, and <strong>the plan pays for itself many times over</strong>.",
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
    faq_onboarding_body: "Send your company list in Excel or CSV, a CRM export is fine, or just paste the names. We find their career pages and ATS, run the first scan and within 48 hours send you a short overview of where they are hiring. No calls needed. If you like, we show you the search for a candidate too, in a short call.",
    faq_q1: "Do I have to move my CRM or ATS?",
    faq_a1: "No. A list of your companies with their websites is enough, from your CRM or a spreadsheet; other columns are optional. The new roles go back as a CSV export you import into your ATS. A direct connection to Bullhorn or another ATS isn’t available yet.",
    faq_q8: "We don’t have an ATS. Is that a problem?",
    faq_a8: "Not at all. TalentRadar watches companies and their roles, and needs no ATS for that. You export the roles to Excel or CSV, or work with them right in TalentRadar. If you want it, a simple record of candidates and jobs is included in the price.",
    faq_q2: "Which ATS does TalentRadar work with?",
    faq_a2: "Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Workday, Personio, BambooHR, Teamtailor, Recruitee, Pinpoint, HireHive, Teamio/Jobs.cz, Phenom and Jibe, as well as large companies’ own career pages. We connect non-standard pages on request in the Scale plan.",
    faq_q3: "What happens when a company closes or fills a role?",
    faq_a3: "When a listing disappears from the site, the next scan notices, the one after confirms it, and TalentRadar archives the role. If the company posts it again, it comes back with its full history. Nothing to delete by hand.",
    faq_q4: "How does the free trial work?",
    faq_a4: "The first 5 agencies get the first month free, then 3 months at half price. Once those places are taken, the trial is 14 days. Either way you can watch up to 150 companies and use everything in full, with no credit card. The trial does not turn into a paid plan by itself: you decide whether to carry on.",
    faq_q5: "How does the 48-hour preview work?",
    faq_a5: "Send your company list with the form below: active clients and prospects, the company name and its careers page are enough. We set up a trial workspace and go through their career pages. Within 48 hours Kryštof, the founder, personally sends you a short overview: how many of your companies are hiring in your niche and which roles are worth a call. In a call we then run a search for one of your candidates with you. No credit card.",

    /* ── Pilot / Trial Form ── */
    trial_badge: "Preview within 48 hours • No credit card",
    trial_headline: "Send your company list",
    trial_subtext: "Active clients and prospects: the company name and its careers page are enough. We set up a trial workspace, go through their career pages, and within 48 hours Kryštof, the founder, sends you a short overview: how many of your companies are hiring in your niche and which roles are worth a call.",
    trial_candidates_note: "Please don’t send us candidates. We show you the search for a specific candidate in a call, or you try it yourself in the app: you paste the profile and it is not stored.",
    trial_label_name: "Full name *",
    trial_placeholder_name: "Jane Smith",
    trial_label_email: "Agency work e-mail *",
    trial_placeholder_email: "jane@agency.com",
    trial_label_company: "Agency / company name *",
    trial_placeholder_company: "Acme Search Ltd.",
    trial_label_clients: "Companies to watch: the company name and its careers page are enough (up to 150)",
    trial_placeholder_clients: "One company per line: the name and its careers page, e.g. Air Bank, airbank.cz/volne-pozice. The name alone is fine too.",
    trial_clients_help: "What should the list look like?",
    help_kicker: "Company list",
    help_title: "How to prepare your company list",
    help_intro: "An Excel or CSV table, the same one the import in the app reads. The company name and its website are enough; the last contact and past placements are optional columns.",
    help_col_a: "Company",
    help_col_b: "Website",
    help_ex_empty: "(empty, we find it)",
    help_rule_a: "Column A, Company: the company name (required)",
    help_rule_b: "Column B, Website: the company’s website or its careers page (optional, we find the missing ones)",
    help_rule_c: "Column C, Last contact: when you last dealt with the company, e.g. 15/03/2024 (optional)",
    help_rule_d: "Column D, Had placement: yes or no (optional)",
    help_text_alt: "No file? Type into the field one company per line, for example “Air Bank, airbank.cz/volne-pozice” or just “Rohlik Group”.",
    help_close: "Close",
    trial_upload_cta: "Click to upload your company list or CRM export",
    trial_upload_types: "(Excel .xlsx, .xls or .csv)",
    trial_upload_note: "We find the career pages and ATS for you. No list at hand? Leave it empty and we will get in touch to collect it.",
    trial_submit: "Send my company list →",
    trial_submitting: "Sending your list…",
    trial_step1: "A confirmation e-mail arrives right away.",
    trial_step2: "We set up your workspace, find your clients' career pages and run the first scan.",
    trial_step3: "You get an e-mail to sign in and, within 48 hours, the founder’s overview: where they are hiring and which roles are worth a call.",
    trial_file_too_large: "File too large (max 8 MB).",
    trial_error_required: "Please enter your name, work e-mail and agency name.",
    trial_error_generic: "Something went wrong. Please write to us directly at krystof@talentradar.eu",
    trial_speed_note: "Sign-in often within the hour, the overview within 48 hours.",
    trial_gdpr_html: "By submitting you agree to the processing of your contact details to create a trial account. We never sell your details or pass them on for marketing. (<a href=\"gdpr.html\" class=\"underline hover:text-[#FF8533]\">Privacy Policy</a>)",
    trial_contact_prefix: "Write to the founder directly:",

    /* ── Footer ── */
    footer_tagline: "Spend time closing, not searching.",
    footer_author: "Kryštof Pejša",
    footer_gdpr: "Privacy Policy (GDPR)",
    footer_copyright: "© 2026 TalentRadar. Built for European recruitment agencies and headhunters.",

    /* ── v2: hero preview, ATS strip ── */
    hero_trust_1: "No credit card",
    hero_trust_2: "First 5 agencies: a month free",
    hero_trust_3: "Works next to your ATS",
    hero_mock_greeting: "Good morning",
    hero_mock_sub: "New roles since the last scan",
    hero_mock_scan: "SCAN 6:00 ✓",
    hero_mock_scan_at: "SCAN {time} ✓",
    hero_mock_kpi1: "new roles",
    hero_mock_kpi2: "companies hiring",
    hero_mock_kpi3: "open 45+ days",
    mock_tag_client: "C",
    mock_loc_prague_hybrid: "Prague / Hybrid",
    mock_loc_brno_hybrid: "Brno / Hybrid",
    hero_mock_hm_where: "Air Bank · Prague",
    hero_mock_old_label: "Open 45+ days",
    hero_mock_old_where: "Rohlik Group · active client, a reason to call",
    hero_mock_caption: "Illustration of the home screen: the roles are real, from the Czech demo’s scan; the numbers and the agency are made up.",
    hero_mock_caption_live: "Home screen with the numbers from the Czech demo’s last scan {date}; the roles are real, the agency is made up.",
    ats_strip_label: "Reads roles straight from",
    ats_strip_more: "+ 7 more and ordinary career pages",

    /* ── v2: features, block by block ── */
    feat_badge: "What it does",
    feat_headline: "Where they’re hiring, why to call and whom. Ready every morning.",
    feat_subtext: "Scans run at 6:00 and 12:00, so the new roles are ready before you sit down. Look whenever you like during the day.",
    feat1_kicker: "Home",
    feat1_title: "Every company’s new roles in one place",
    feat1_body: "Every day at 6:00 and 12:00 we check the career pages and ATS of your companies. The new roles wait for you sorted by company and by ring.",
    feat1_mock_title: "Companies with new roles",
    feat1_mock_all: "ALL",
    feat1_mock_col_company: "Company",
    feat1_mock_col_new: "New",
    feat2_kicker: "Your niche",
    feat2_title: "Only the roles you specialise in",
    feat2_body: "AI reads every new posting and compares it with your specialisation. You mostly see the roles you fill, each with one sentence on why it fits.",
    feat3_kicker: "Opportunities",
    feat3_title: "Why call right now",
    feat3_body: "<p>Every role comes with its reason:</p><ul class=\"list-disc pl-5 mt-2 space-y-1.5\"><li><strong class=\"text-white\">Fresh role:</strong> you can be the first agency to call.</li><li><strong class=\"text-white\">Open for over 45 days:</strong> the company is probably struggling to fill it.</li><li><strong class=\"text-white\">Sudden jump in hiring:</strong> several new roles at once.</li></ul>",
    feat3_mock_title: "Why call right now",
    feat3_mock_30: "roles open 30+ days",
    feat3_mock_45: "roles open 45+ days",
    feat3_mock_since: "published",
    feat4_kicker: "Role detail",
    feat4_title: "Who to call",
    feat4_body: "From the posting we work out who most likely decides on the hire, and you find them on LinkedIn or through Google X-Ray in one click. The contacts you save at the company show up first.",

    /* ── v2: client reference (placeholder, localhost only) ── */
    ref_badge: "From the agency where it started",
    ref_quote: "Rob Magee’s quote goes here, about what the radar changed for Ingenio’s consultants. Two or three sentences in his own words.",
    ref_photo: "photo",
    ref_role: "Ingenio Global, Dublin",
    ref_stat1: "companies watched",
    ref_stat2: "hours saved a week",

    /* ── v2: footer ── */
    footer_about: "Every open role at your companies, next to your ATS. Born at an agency in Dublin, built in Prague.",
    footer_col_product: "Product",
    footer_col_resources: "Resources",
    footer_col_contact: "Contact",
    footer_linkedin_company: "TalentRadar on LinkedIn",

    /* ── v3 (26. 10.): every company in one place, dormant clients, next to your ATS ── */
    faq_q6: "Does TalentRadar send e-mails for us?",
    faq_a6: "No. TalentRadar shows who to call and why, and drafts the message in your own style. You always send it yourself, from your own mailbox. No mass mailing, no automatic sequences, no open tracking.",
    mock_tag_dormant: "D",
    mock_tag_target: "P",
    hero_mock_hm_now: "Who decides there now",
    hero_mock_jump_label: "Hiring jump",
    hero_mock_jump_where: "ČEZ · 5 new roles at once",
    feat1_mock_active: "ACTIVE",
    feat1_mock_dormant: "DORMANT",
    feat1_mock_target: "PROSPECTS",
    feat2_mock_title: "New roles this morning",
    feat2_mock_sub: "sorted by your niche",
    feat2_mock_note: "Real roles from the demo’s scan.",
    feat3_mock_spike: "5 new roles at once",
    feat3_mock_spike_tag: "JUMP",
    feat4_mock_new: "NEW",
    feat4_mock_contacts: "Your saved contact at the company",
    feat4_mock_where: "Searched in: Prague",
    feat5_soon: "Coming soon",
    feat5_title: "What to say, and not forgetting it",
    feat5_body: "Each consultant pastes a few of their own messages, and TalentRadar drafts a LinkedIn message, an e-mail or the opening of a call in their style, with the reason from step 3. It keeps the rules for you: it drafts an e-mail only where you may send one, otherwise LinkedIn or a call. You send it yourself, log it in one click, and it reminds you a week later.",
    feat2_mock_why1: "Java backend in Prague: exactly your IT niche",
    feat2_mock_why2: "Product, not engineering: you fill these now and then",
    feat2_mock_why3: "Outside your niche, kept out of your list",
    feat3_tag_45: "45+ DAYS",
    feat3_r1: "published 23 Apr, they are unlikely to fill it alone",
    feat3_r4: "published today, you can be first",
    feat5_kicker: "Outreach",
    feat5_tab_email: "E-mail",
    feat5_tab_li: "LinkedIn",
    feat5_tab_call: "Call opener",
    feat5_mock_style: "Your style · first name, short",
    feat5_mock_text: "Hi Tomas, I see Air Bank is hiring a cloud engineer for AWS. Cloud and DevOps in Prague is what I do, and I have a few people who could fit right now. Worth a quick call this week?",
    feat5_mock_rule: "You send it yourself, from your own LinkedIn.",
    feat5_mock_copy: "Copy",
    feat5_mock_logged: "Sent · remind me in 7 days",

    /* ── v4 (27. 10.): the second way in, from the candidate to the roles (W13) ── */
    cand_title: "MPC: who wants this candidate?",
    cand_kicker: "Extra feature",
    cand_body: "Have an MPC, a candidate you want to offer to your companies? Paste a CV or a few lines: role, seniority, technologies, location, salary. You get the open roles at your companies, best match first, and for each one why it fits and what does not, the company’s ring, how long the role has been open, whom to call, and a short anonymous pitch.",
    cand_rule1: "The profile is not stored: once you have searched, it is gone.",
    cand_rule2: "Name, e-mail, phone and links come out before anything goes to the AI.",
    cand_rule3: "You send the pitch yourself, and only with the candidate’s consent.",
    cand_demo_label: "Example",
    cand_demo_note: "The profile is made up. The roles are real, from the Czech demo’s scan on 20 Oct; the agency’s contacts and their history are made up.",
    cand_profile_title: "Candidate profile",
    cand_profile_redacted: "We remove what is struck out before the search.",
    cand_profile_contacts_html: "<s class=\"text-[#94A3B8] decoration-[#FF6B00]\">Alex Dvořák</s> · <s class=\"text-[#94A3B8] decoration-[#FF6B00]\">alex.dvorak@example.com</s> · <s class=\"text-[#94A3B8] decoration-[#FF6B00]\">+420 600 000 000</s> · <s class=\"text-[#94A3B8] decoration-[#FF6B00]\">linkedin.com/in/alex-dvorak</s>",
    cand_profile_text: "Senior backend developer, 7 years. Kotlin and Java, Spring Boot, Kafka, PostgreSQL, AWS. The last 3 years on payment systems at a fintech. Prague, hybrid, 3 days in the office. Expects CZK 110,000 a month, can start within 2 months. Fluent English.",
    cand_profile_btn: "Find roles",
    cand_results_title: "Best matches",
    cand_results_sub: "out of 432 open roles at your 25 companies",
    cand_fit_strong: "Strong match",
    cand_fit_good: "Good match",
    cand_fit_partial: "Partial match",
    cand_ring_active: "Active client",
    cand_ring_target: "Prospect",
    cand_why: "Fits",
    cand_gap: "Doesn’t fit",
    cand_call: "Whom to call",
    cand_loc_remote: "Remote · Czech Republic",
    cand_r1_age: "open 25 days",
    cand_r1_why: "Kotlin backend, senior, Prague hybrid.",
    cand_r1_gap: "The posting gives no salary; check the budget.",
    cand_r1_call: "Matěj Modelový, VP Engineering · your contact",
    cand_r2_age: "45+ DAYS",
    cand_r2_why: "Java and Kotlin, Prague hybrid; open for 7 weeks, they are unlikely to fill it on their own.",
    cand_r2_gap: "Storage and resilience, while the candidate did payments.",
    cand_r2_call: "Lucie Příkladná, CTO · your contact",
    cand_r3_age: "open 29 days",
    cand_r3_why: "Kotlin, remote from the Czech Republic.",
    cand_r3_gap: "They want someone who leads a team and builds tooling; the candidate has not led one.",
    cand_r3_call: "Engineering Manager · estimated from the posting",
    cand_pitch_title: "Pitch without the name",
    cand_pitch_text: "Hello Matěj, I have a candidate who could be a good fit for your Sr. Backend Engineer (Kotlin) role: 7 years of Kotlin and Java, the last 3 on payments at a fintech, Prague hybrid, can start within 2 months. Shall I send you the anonymous profile?",
    cand_pitch_rule: "E-mail allowed: an active client. Send it once the candidate agrees.",
    ats_badge: "Into your ATS",
    ats_headline: "Works next to your ATS",
    ats_subtext: "Nothing to migrate and nothing to change. Send us your companies, and the new roles go out to your ATS.",
    ats_c1_title: "A list of companies with their websites is enough",
    ats_c1_body: "Excel, CSV or text pasted into the form. We recognise the columns by their names; any other columns are optional.",
    ats_c2_title: "Export to CSV",
    ats_c2_body: "Export the roles in one click, with the same filters you have on screen, and import the file into your ATS.",
    ats_c3_title: "Your candidates stay where they are",
    ats_c3_body: "TalentRadar watches companies and their roles, not your candidate database. When you search for a candidate, you only paste the profile. Datacruit, Recruitis, Teamio, Bullhorn, Vincere or Excel: you keep what you use.",

    /* ── v3 (26. 10.): price list per M8.8, offer for the first 5 ── */
    pricing_period_month: "/ month",
    pricing_period_year: "/ year",
    promo_label: "For the first 5 agencies",
    promo_text: "Our founding customers: the first month free, then 3 months at half price.",
    promo_perk1: "A direct line to the founder",
    promo_perk2: "Features built from your feedback",
    promo_note: "On any of the three plans. Once the places are taken, the trial is 14 days.",

    /* ── v3 (26. 10.): send us your list, the four-column template ── */
    trial_promo: "First 5 agencies: a month free, then 3 months at half price.",
    trial_promo_after: "Once the places are taken: 14 days free.",
    help_col_c: "Last contact",
    help_col_d: "Had placement",
    help_ex_date1: "15/03/2024",
    help_ex_date2: "02/11/2023",
    help_ex_yes: "yes",
    help_ex_no: "no",
    help_rule_e: "A whole CRM export is fine, we skip the other columns. Up to 150 companies, Excel (.xlsx, .xls) or .csv",
    faq_q7: "Do you store our candidates’ profiles?",
    faq_a7: "No. For a search you only paste the candidate’s profile, and once you have searched it is gone. Before anything goes to the AI we take out the name, e-mail, phone and links. Your candidates stay in your ATS.",
  },

  cs: {
    /* ── SEO ── */
    page_title: "TalentRadar — Spend time closing, not searching.",
    page_description: "TalentRadar hlídá kariérní weby všech firem vaší agentury a jejich otevřené pozice ukáže na jednom místě, vedle vašeho ATS. Skeny v 6:00 a ve 12:00, u každé pozice důvod zavolat.",

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
    nav_cta: "Poslat seznam firem",
    nav_cta_short: "Poslat seznam",
    nav_demo: "Plné demo ↗",
    hero_badge: "Všechny otevřené pozice vašich firem, vedle vašeho ATS",

    /* ── Hero ── */
    hero_headline_html: "<span class=\"tr-h1-a\">ATS řídí zakázky, které máte.</span>TalentRadar ukáže <span class=\"text-[#FF6B00]\">ty, které můžete mít.</span>",
    hero_subheadline: "Všechny otevřené pozice u firem, se kterými pracujete, na jednom místě a vedle vašeho ATS. Kariérní weby a ATS firem projdeme dvakrát denně, takže o nové pozici se dozvíte v řádu hodin od jejího vypsání.",
    hero_cta_btn: "Pošlete seznam firem",
    hero_cta_sub: "Do 48 hodin ukážeme, kde nabírají a koho z vašich kandidátů by hledali.",
    hero_demo_btn: "Interaktivní demo",

    /* ── Interactive Hero Switcher & Mockup ── */

    /* ── Workflows Section ── */

    /* ── Live Radar Showcase (Mini-App Sandbox) ── */
    radar_badge: "Interaktivní demo",
    radar_headline: "Proklikejte si celou platformu. Bez registrace.",
    radar_subtext: "Skutečné pozice ze skenů českého dema a vymyšlená agentura, která na nich pracuje. Otevřete si pozici, podívejte se, proč stojí za telefon, a najděte, kdo tam rozhoduje.",
    radar_footnote: "Firmy a pozice jsou skutečné, z denních skenů dema. Agentura a její kontakty jsou vymyšlené. Co změníte, zůstane jen ve vašem prohlížeči.",
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
    compare_row2_label: "Prospekty, které zatím nejsou klienty",
    compare_row2_manual: "Nehlídá je nikdo. Dozvíte se, až pozici obsadí jiná agentura.",
    compare_row2_radar: "Jejich nové pozice <strong>vedle pozic vašich klientů</strong>, s důvodem zavolat.",
    compare_row3_label: "Obsazené a stažené pozice",
    compare_row3_manual: "Konzultanti oslovují kandidáty na pozice, které klient už před týdny potichu obsadil.",
    compare_row3_radar: "Když pozice zmizí z webu klienta, TalentRadar ji <strong>sám archivuje</strong>.",
    compare_row4_label: "Kdo tam rozhoduje",
    compare_row4_manual: "Kontakt v CRM je dva roky starý.",
    compare_row4_radar: "Váš kontakt a <strong>jedním klikem hledání</strong>, kdo tam rozhoduje teď.",
    compare_row5_label: "Máte kandidáta a nevíte, komu ho nabídnout",
    compare_row5_manual: "Z paměti, telefonem a na LinkedInu.",
    compare_row5_radar: "Vložíte profil a uvidíte <strong>otevřené pozice u vašich firem seřazené podle shody</strong>.",
    compare_row6_label: "Kolik času to zabere",
    compare_row6_manual: "Několik hodin proklikávání každé pondělí dopoledne.",
    compare_row6_radar: "<strong>Krátký ranní přehled</strong>, u každé pozice s důvodem, proč klientovi zavolat.",

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
    pricing_badge: "Bez karty · Bez závazku · Měsíčně",
    pricing_headline: "Jednoduchý ceník, měsíčně a bez závazku",
    pricing_subtext: "Každý tarif si vyzkoušíte zdarma a naplno, bez platební karty. Při roční platbě máte 2 měsíce zdarma.",
    pricing_monthly_note: "Ceny jsou bez DPH • Fakturujeme v korunách, měsíčně nebo ročně • Žádné poplatky za zřízení",
    pricing_toggle_monthly: "Měsíčně",
    pricing_toggle_annual: "Ročně",
    pricing_toggle_save: "2 měsíce zdarma",
    pricing_tier1_name: "Solo Scout",
    pricing_tier1_companies: "až 50 firem",
    pricing_tier1_price: "1\u00a0990\u00a0Kč",
    pricing_tier1_price_annual: "19\u00a0900\u00a0Kč",
    pricing_tier1_billing: "platba měsíčně, bez závazku",
    pricing_tier1_billing_annual: "platba ročně, 2 měsíce zdarma (místo 23 880 Kč)",
    pricing_tier1_desc: "Pro samostatné headhuntery.",
    pricing_tier1_f1: "1 uživatel",
    pricing_tier1_f2: "Až 50 firem: aktivní klienti i prospekty",
    pricing_tier1_f3: "Automatické skeny dvakrát denně (v 6:00 a ve 12:00 vašeho času)",
    pricing_tier1_f4: "Důvod zavolat a kdo u firmy rozhoduje",
    pricing_tier1_f5: "Export do CSV pro vaše ATS",
    pricing_tier1_cta: "Vyzkoušet zdarma",

    pricing_tier2_name: "Agency Pro",
    pricing_tier2_badge: "Doporučujeme",
    pricing_tier2_companies: "až 150 firem",
    pricing_tier2_price: "3\u00a0990\u00a0Kč",
    pricing_tier2_price_annual: "39\u00a0900\u00a0Kč",
    pricing_tier2_billing: "platba měsíčně, bez závazku",
    pricing_tier2_billing_annual: "platba ročně, 2 měsíce zdarma (místo 47 880 Kč)",
    pricing_tier2_desc: "Pro agenturní týmy, které hlídají desítky firem.",
    pricing_tier2_speed_title: "Celý tým za jednu cenu",
    pricing_tier2_speed_body: "Neomezeně uživatelů a až 150 firem. Firmy i kontakty nahrajete ze seznamu nebo CRM a každá pozice může mít svého vlastníka.",
    pricing_tier2_f1: "Neomezeně uživatelů, každá pozice může mít svého vlastníka",
    pricing_tier2_f2: "Až 150 firem",
    pricing_tier2_f3: "Import firem a kontaktů ze seznamu nebo CRM",
    pricing_tier2_f4: "Automatické skeny dvakrát denně",
    pricing_tier2_f5: "Napojení na Claude nebo ChatGPT přes MCP",
    pricing_tier2_cta: "Vyzkoušet zdarma →",

    pricing_tier3_name: "Scale",
    pricing_tier3_companies: "až 400 firem",
    pricing_tier3_price: "7\u00a0990\u00a0Kč",
    pricing_tier3_price_annual: "79\u00a0900\u00a0Kč",
    pricing_tier3_billing: "platba měsíčně, bez závazku",
    pricing_tier3_billing_annual: "platba ročně, 2 měsíce zdarma (místo 95 880 Kč)",
    pricing_tier3_desc: "Pro velké agentury s mnoha klienty.",
    pricing_tier3_f1: "Až 400 firem, víc po domluvě",
    pricing_tier3_f2: "Vše z Agency Pro",
    pricing_tier3_f3: "Častější skeny: až čtyřikrát denně, vaše skeny mají přednost",
    pricing_tier3_f4: "Napojení nestandardních kariérních webů na míru",
    pricing_tier3_f6: "Zavedení se zakladatelem: import vašeho CRM uděláme za vás, podpora přes Slack",
    pricing_tier3_cta: "Napsat zakladateli",

    pricing_roi_html: "Stačí jedno umístění, které díky TalentRadaru získáte, a <strong>tarif se vám vrátí mnohokrát</strong>.",
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
    faq_onboarding_body: "Pošlete seznam firem v Excelu nebo CSV, klidně export z CRM, nebo jen vložte jejich názvy. Kariérní weby a ATS dohledáme za vás, spustíme první sken a do 48 hodin vám pošleme krátký přehled, kde se nabírá. Nikam volat nemusíte. Když budete chtít, na krátkém hovoru vám ukážeme i hledání pro kandidáta.",
    faq_q1: "Musím přenést svoje CRM nebo ATS?",
    faq_a1: "Ne. Stačí seznam firem s webem z CRM nebo z Excelu, další sloupce jsou nepovinné. Nové pozice pak jedním klikem vyexportujete do CSV a nahrajete zpátky do svého ATS. Přímé napojení na Bullhorn nebo jiné ATS zatím nemáme.",
    faq_q8: "Nemáme ATS, nevadí?",
    faq_a8: "Nevadí. TalentRadar hlídá firmy a jejich pozice a ATS k tomu nepotřebuje. Pozice si vyexportujete do Excelu nebo CSV, nebo s nimi pracujete rovnou v TalentRadaru. Kdo chce, má v ceně i jednoduchou evidenci kandidátů a zakázek.",
    faq_q2: "Se kterými ATS TalentRadar umí pracovat?",
    faq_a2: "Greenhouse, Lever, Workable, Ashby, SmartRecruiters, Workday, Personio, BambooHR, Teamtailor, Recruitee, Pinpoint, HireHive, Teamio/Jobs.cz, Phenom a Jibe a také vlastní kariérní weby velkých firem. Nestandardní weby napojíme na míru v tarifu Scale.",
    faq_q3: "Co se stane, když firma pozici uzavře nebo obsadí?",
    faq_a3: "Když inzerát z webu zmizí, nejbližší sken si toho všimne, další to potvrdí a TalentRadar pozici archivuje. Když ji firma vypíše znovu, vrátí se i s celou historií. Nic nemusíte mazat ručně.",
    faq_q4: "Jak funguje zkouška zdarma?",
    faq_a4: "Prvních 5 agentur má první měsíc zdarma a pak 3 měsíce za polovinu. Když jsou místa obsazená, trvá zkouška 14 dní. V obou případech můžete hlídat až 150 firem a používat všechno naplno, platební kartu nezadáváte. Po skončení se zkouška sama nezpoplatní, o pokračování rozhodnete vy.",
    faq_q5: "Jak funguje ukázka do 48 hodin?",
    faq_a5: "Formulářem dole pošlete seznam firem: aktivní klienty i prospekty, stačí název firmy a kariérní web. Založíme vám zkušební workspace a projdeme jejich kariérní weby. Do 48 hodin vám zakladatel Kryštof osobně pošle krátký přehled: kolik vašich firem nabírá ve vaší nice a které pozice stojí za telefon. Na schůzce pak spolu vyzkoušíme hledání pro některého z vašich kandidátů. Bez platební karty.",

    /* ── Pilot / Trial Form ── */
    trial_badge: "Ukázka do 48 hodin • Bez platební karty",
    trial_headline: "Pošlete seznam firem",
    trial_subtext: "Aktivní klienty i prospekty, stačí název firmy a kariérní web. Založíme vám zkušební workspace, projdeme jejich kariérní weby a do 48 hodin vám zakladatel Kryštof pošle krátký přehled: kolik vašich firem nabírá ve vaší nice a které pozice stojí za telefon.",
    trial_candidates_note: "Kandidáty nám neposílejte. Hledání pro konkrétního kandidáta vám ukážeme na schůzce, nebo si ho sami vyzkoušíte v aplikaci: profil jen vložíte a nikam se neukládá.",
    trial_label_name: "Jméno a příjmení *",
    trial_placeholder_name: "Jan Novák",
    trial_label_email: "Pracovní e-mail agentury *",
    trial_placeholder_email: "jan@agentura.cz",
    trial_label_company: "Název agentury / firmy *",
    trial_placeholder_company: "Vaše agentura s.r.o.",
    trial_label_clients: "Firmy, které chcete hlídat: stačí název firmy a kariérní web (až 150)",
    trial_placeholder_clients: "Jedna firma na řádek: název a kariérní web, např. Air Bank; airbank.cz/volne-pozice. Stačí i jen název.",
    trial_clients_help: "Jak má seznam vypadat?",
    help_kicker: "Seznam firem",
    help_title: "Jak připravit seznam firem",
    help_intro: "Tabulka v Excelu nebo CSV, stejná, jakou čte import v aplikaci. Stačí název firmy a web; poslední kontakt a proběhlá zakázka jsou nepovinné sloupce.",
    help_col_a: "Firma",
    help_col_b: "Web",
    help_ex_empty: "(prázdné, dohledáme)",
    help_rule_a: "Sloupec A, Firma: název firmy (povinné)",
    help_rule_b: "Sloupec B, Web: web firmy nebo odkaz na její kariérní stránku (nepovinné, chybějící dohledáme)",
    help_rule_c: "Sloupec C, Poslední kontakt: kdy jste s firmou naposledy jednali, např. 15. 3. 2024 (nepovinné)",
    help_rule_d: "Sloupec D, Proběhla zakázka: ano, nebo ne (nepovinné)",
    help_text_alt: "Soubor nemáte? Do pole napište jednu firmu na řádek, třeba „Air Bank; airbank.cz/volne-pozice“ nebo jen „Rohlik Group“.",
    help_close: "Zavřít",
    trial_upload_cta: "Klikněte a nahrajte seznam firem nebo export z CRM",
    trial_upload_types: "(Excel .xlsx, .xls nebo .csv)",
    trial_upload_note: "Kariérní weby a ATS dohledáme za vás. Seznam teď nemáte po ruce? Nechte pole prázdné a ozveme se vám pro něj.",
    trial_submit: "Poslat seznam firem →",
    trial_submitting: "Odesílám seznam…",
    trial_step1: "Hned vám přijde potvrzovací e-mail.",
    trial_step2: "Založíme workspace, dohledáme kariérní weby vašich klientů a spustíme první sken.",
    trial_step3: "Přijde vám e-mail s přihlášením a do 48 hodin přehled od zakladatele: kde se nabírá a které pozice stojí za telefon.",
    trial_file_too_large: "Soubor je příliš velký (max. 8 MB).",
    trial_error_required: "Vyplňte prosím jméno, pracovní e-mail a název agentury.",
    trial_error_generic: "Něco se pokazilo. Napište nám prosím přímo na krystof@talentradar.eu",
    trial_speed_note: "Přihlášení často do hodiny, přehled do 48 hodin.",
    trial_gdpr_html: "Odesláním souhlasíte se zpracováním kontaktních údajů pro vytvoření zkušebního účtu. Údaje nikomu neprodáváme ani je nepředáváme k marketingu. (<a href=\"gdpr.html\" class=\"underline hover:text-[#FF8533]\">Zásady zpracování</a>)",
    trial_contact_prefix: "Přímý kontakt na zakladatele:",

    /* ── Footer ── */
    footer_tagline: "Spend time closing, not searching.",
    footer_author: "Kryštof Pejša",
    footer_gdpr: "Zásady ochrany osobních údajů (GDPR)",
    footer_copyright: "© 2026 TalentRadar. Vytvořeno pro evropské personální agentury a headhuntery.",

    /* ── v2: náhled v úvodu, pruh s ATS ── */
    hero_trust_1: "Bez platební karty",
    hero_trust_2: "Prvních 5 agentur: měsíc zdarma",
    hero_trust_3: "Funguje vedle vašeho ATS",
    hero_mock_greeting: "Dobré ráno",
    hero_mock_sub: "Nové pozice od posledního skenu",
    hero_mock_scan: "SKEN 6:00 ✓",
    hero_mock_scan_at: "SKEN {time} ✓",
    hero_mock_kpi1: "nových pozic",
    hero_mock_kpi2: "firem nabírá",
    hero_mock_kpi3: "otevřených 45+ dní",
    mock_tag_client: "K",
    mock_loc_prague_hybrid: "Praha / hybrid",
    mock_loc_brno_hybrid: "Brno / hybrid",
    hero_mock_hm_where: "Air Bank · Praha",
    hero_mock_old_label: "Otevřeno přes 45 dní",
    hero_mock_old_where: "Rohlik Group · aktivní klient, důvod zavolat",
    hero_mock_caption: "Ilustrace úvodní obrazovky: pozice jsou skutečné ze skenu českého dema, čísla a agentura jsou vymyšlené.",
    hero_mock_caption_live: "Úvodní obrazovka s čísly z posledního skenu českého dema {date}, pozice jsou skutečné, agentura vymyšlená.",
    ats_strip_label: "Pozice čte přímo z",
    ats_strip_more: "+ 7 dalších a běžné kariérní weby",

    /* ── v2: funkce po blocích ── */
    feat_badge: "Co umí",
    feat_headline: "Kde nabírají, proč zavolat a komu. Připravené každé ráno.",
    feat_subtext: "Skeny běží v 6:00 a ve 12:00, takže nové pozice máte připravené, než si sednete k počítači. Dívat se můžete kdykoli během dne.",
    feat1_kicker: "Domov",
    feat1_title: "Nové pozice všech vašich firem na jednom místě",
    feat1_body: "Každý den v 6:00 a ve 12:00 projdeme kariérní weby a ATS vašich firem. Nové pozice na vás čekají seřazené podle firem a okruhů.",
    feat1_mock_title: "Firmy s novými pozicemi",
    feat1_mock_all: "VŠE",
    feat1_mock_col_company: "Firma",
    feat1_mock_col_new: "Nové",
    feat2_kicker: "Vaše nika",
    feat2_title: "Jen pozice, na které se specializujete",
    feat2_body: "AI přečte každý nový inzerát a porovná ho s vaší specializací. Uvidíte hlavně pozice, které obsazujete, a u každé jednou větou, proč sedí.",
    feat3_kicker: "Příležitosti",
    feat3_title: "Proč zavolat právě teď",
    feat3_body: "<p>U každé pozice vidíte důvod:</p><ul class=\"list-disc pl-5 mt-2 space-y-1.5\"><li><strong class=\"text-white\">Čerstvá pozice:</strong> můžete volat jako první agentura.</li><li><strong class=\"text-white\">Otevřená přes 45 dní:</strong> firma ji nejspíš nedokáže obsadit sama.</li><li><strong class=\"text-white\">Náhlý skok v náboru:</strong> několik nových pozic najednou.</li></ul>",
    feat3_mock_title: "Proč zavolat právě teď",
    feat3_mock_30: "pozic otevřených přes 30 dní",
    feat3_mock_45: "pozic otevřených přes 45 dní",
    feat3_mock_since: "zveřejněno",
    feat4_kicker: "Detail pozice",
    feat4_title: "Komu zavolat",
    feat4_body: "Z inzerátu odhadneme, kdo o náboru nejspíš rozhoduje, a jedním klikem ho najdete na LinkedInu nebo přes Google X-Ray. Kontakty, které si u firmy uložíte, uvidíte jako první.",

    /* ── v2: reference klienta (zástupný text, jen localhost) ── */
    ref_badge: "Z agentury, kde to celé začalo",
    ref_quote: "Sem přijde citát Roba Magee o tom, co radar změnil konzultantům v Ingeniu. Dvě až tři věty jeho slovy.",
    ref_photo: "fotka",
    ref_role: "Ingenio Global, Dublin",
    ref_stat1: "sledovaných firem",
    ref_stat2: "hodin ušetřených týdně",

    /* ── v2: patička ── */
    footer_about: "Všechny otevřené pozice vašich firem, vedle vašeho ATS. TalentRadar vznikl v agentuře v Dublinu, vyvíjí se v Praze.",
    footer_col_product: "Produkt",
    footer_col_resources: "Zdroje",
    footer_col_contact: "Kontakt",
    footer_linkedin_company: "TalentRadar na LinkedInu",

    /* ── v3 (26. 10.): every company in one place, dormant clients, next to your ATS ── */
    faq_q6: "Rozesílá TalentRadar e-maily za nás?",
    faq_a6: "Ne. TalentRadar ukáže, komu a proč zavolat, a navrhne text oslovení ve vašem stylu. Odesíláte ale vždy vy sami, ze své schránky. Žádné hromadné rozesílky, automatické sekvence ani sledování otevření.",
    mock_tag_dormant: "D",
    mock_tag_target: "P",
    hero_mock_hm_now: "Kdo tam teď rozhoduje",
    hero_mock_jump_label: "Skok náboru",
    hero_mock_jump_where: "ČEZ · 5 nových pozic najednou",
    feat1_mock_active: "AKTIVNÍ",
    feat1_mock_dormant: "BEZ KONTAKTU",
    feat1_mock_target: "PROSPEKTY",
    feat2_mock_title: "Nové pozice dnes ráno",
    feat2_mock_sub: "seřazené podle vaší niky",
    feat2_mock_note: "Pozice jsou skutečné ze skenu dema.",
    feat3_mock_spike: "5 nových pozic najednou",
    feat3_mock_spike_tag: "SKOK",
    feat4_mock_new: "NOVÁ",
    feat4_mock_contacts: "Váš uložený kontakt u firmy",
    feat4_mock_where: "Hledá se v: Praha",
    feat5_soon: "Brzy",
    feat5_title: "Co mu napsat, a nezapomenout na to",
    feat5_body: "Každý konzultant vloží pár svých zpráv a TalentRadar mu navrhne zprávu na LinkedIn, e-mail nebo úvod hovoru jeho stylem, s důvodem z kroku 3. Pravidla hlídá za vás: e-mail navrhne jen tam, kde ho smíte poslat, jinak LinkedIn nebo hovor. Odešlete sami, jedním klikem si to zapíšete a za týden vám to připomene.",
    feat2_mock_why1: "Backend v Javě v Praze: přesně vaše IT nika",
    feat2_mock_why2: "Produkt, ne vývoj: obsazujete jen občas",
    feat2_mock_why3: "Mimo vaši niku, v seznamu vám nepřekáží",
    feat3_tag_45: "45+ DNÍ",
    feat3_r1: "zveřejněno 23. 4., sami ji nejspíš neobsadí",
    feat3_r4: "zveřejněno dnes, můžete být první",
    feat5_kicker: "Oslovení",
    feat5_tab_email: "E-mail",
    feat5_tab_li: "LinkedIn",
    feat5_tab_call: "Úvod hovoru",
    feat5_mock_style: "Váš styl · tykání, krátce",
    feat5_mock_text: "Ahoj Tomáši, vidím, že v Air Bank hledáte cloud inženýra na AWS. Na cloud a DevOps v Praze se specializuji a pár vhodných lidí teď mám. Dáme tento týden krátký hovor?",
    feat5_mock_rule: "Odešlete sami ze svého LinkedInu.",
    feat5_mock_copy: "Kopírovat",
    feat5_mock_logged: "Odesláno · připomenout za 7 dní",

    /* ── v4 (27. 10.): druhá cesta, od kandidáta k pozicím (W13) ── */
    cand_title: "MPC: kdo hledá tohoto kandidáta?",
    cand_kicker: "Funkce navíc",
    cand_body: "Máte MPC, tedy kandidáta, kterého chcete nabídnout svým firmám? Vložte text CV nebo pár řádků: pozice, seniorita, technologie, lokalita, mzda. Uvidíte otevřené pozice u vašich firem seřazené podle shody a u každé, proč sedí a co nesedí, okruh firmy, jak dlouho je pozice otevřená, komu zavolat a návrh krátké nabídky bez jména.",
    cand_rule1: "Profil se neukládá: po hledání zmizí.",
    cand_rule2: "Jméno, e-mail, telefon a odkazy odstraníme dřív, než cokoli půjde do AI.",
    cand_rule3: "Nabídku odešlete sami, a jen se souhlasem kandidáta.",
    cand_demo_label: "Ukázka",
    cand_demo_note: "Profil je vymyšlený. Pozice jsou skutečné ze skenu českého dema 20. 10., kontakty agentury a jejich historie jsou vymyšlené.",
    cand_profile_title: "Profil kandidáta",
    cand_profile_redacted: "Přeškrtnuté před hledáním odstraníme.",
    cand_profile_contacts_html: "<s class=\"text-[#94A3B8] decoration-[#FF6B00]\">Alex Dvořák</s> · <s class=\"text-[#94A3B8] decoration-[#FF6B00]\">alex.dvorak@example.com</s> · <s class=\"text-[#94A3B8] decoration-[#FF6B00]\">+420 600 000 000</s> · <s class=\"text-[#94A3B8] decoration-[#FF6B00]\">linkedin.com/in/alex-dvorak</s>",
    cand_profile_text: "Senior backend vývojář, 7 let praxe. Kotlin a Java, Spring Boot, Kafka, PostgreSQL, AWS. Poslední 3 roky platební systémy ve fintechu. Praha, hybridně, 3 dny v kanceláři. Představa 110 000 Kč měsíčně, nástup do 2 měsíců. Angličtina plynně.",
    cand_profile_btn: "Najít pozice",
    cand_results_title: "Nejlepší shody",
    cand_results_sub: "ze 432 otevřených pozic u vašich 25 firem",
    cand_fit_strong: "Silná shoda",
    cand_fit_good: "Dobrá shoda",
    cand_fit_partial: "Částečná shoda",
    cand_ring_active: "Aktivní klient",
    cand_ring_target: "Prospekt",
    cand_why: "Sedí",
    cand_gap: "Nesedí",
    cand_call: "Komu zavolat",
    cand_loc_remote: "Na dálku · Česko",
    cand_r1_age: "otevřená 25 dní",
    cand_r1_why: "Backend v Kotlinu, senior, Praha hybridně.",
    cand_r1_gap: "Inzerát neuvádí mzdu, ověřte rozpočet.",
    cand_r1_call: "Matěj Modelový, VP Engineering · váš kontakt",
    cand_r2_age: "45+ DNÍ",
    cand_r2_why: "Java i Kotlin, Praha hybridně; otevřená 7 týdnů, sami ji nejspíš neobsadí.",
    cand_r2_gap: "Úložiště a odolnost systémů, kandidát dělal platby.",
    cand_r2_call: "Lucie Příkladná, CTO · váš kontakt",
    cand_r3_age: "otevřená 29 dní",
    cand_r3_why: "Kotlin, práce na dálku z Česka.",
    cand_r3_gap: "Chtějí vedoucího týmu pro vývojové nástroje, kandidát tým nevedl.",
    cand_r3_call: "Engineering Manager · odhad z inzerátu",
    cand_pitch_title: "Nabídka bez jména",
    cand_pitch_text: "Dobrý den, pane Modelový, mám kandidáta, který by k vám mohl sednout na pozici Sr. Backend Engineer (Kotlin): 7 let Kotlin a Java, poslední 3 roky platby ve fintechu, Praha hybridně, nástup do 2 měsíců. Mám vám poslat anonymní profil?",
    cand_pitch_rule: "E-mail můžete: aktivní klient. Odešlete, až kandidát souhlasí.",
    ats_badge: "Do vašeho ATS",
    ats_headline: "Funguje vedle vašeho ATS",
    ats_subtext: "Nic nestěhujete a nic neměníte. Pošlete seznam firem, nové pozice si vyexportujete do svého ATS.",
    ats_c1_title: "Stačí seznam firem s webem",
    ats_c1_body: "Excel, CSV nebo text vložený do formuláře. Sloupce poznáme podle názvu, další sloupce jsou nepovinné.",
    ats_c2_title: "Export do CSV",
    ats_c2_body: "Pozice jedním klikem vyexportujete se stejnými filtry, jaké máte na obrazovce, a soubor nahrajete do svého ATS.",
    ats_c3_title: "Kandidáti zůstanou, kde jsou",
    ats_c3_body: "TalentRadar hlídá firmy a jejich pozice, ne vaši kandidátskou databázi. Když hledáte pro kandidáta, profil jen vložíte. Datacruit, Recruitis, Teamio, Bullhorn, Vincere nebo Excel: necháte si, co používáte.",

    /* ── v3 (26. 10.): price list per M8.8, offer for the first 5 ── */
    pricing_period_month: "/ měsíc",
    pricing_period_year: "/ rok",
    promo_label: "Pro prvních 5 agentur",
    promo_text: "Zakládající zákazníci: první měsíc zdarma, pak 3 měsíce za polovinu.",
    promo_perk1: "Přímá linka na zakladatele",
    promo_perk2: "Funkce podle vaší zpětné vazby",
    promo_note: "U kteréhokoli ze tří tarifů. Po obsazení míst trvá zkouška zdarma 14 dní.",

    /* ── v3 (26. 10.): send us your list, the four-column template ── */
    trial_promo: "Prvních 5 agentur: měsíc zdarma, pak 3 měsíce za polovinu.",
    trial_promo_after: "Po obsazení míst: 14 dní zdarma.",
    help_col_c: "Poslední kontakt",
    help_col_d: "Proběhla zakázka",
    help_ex_date1: "15. 3. 2024",
    help_ex_date2: "2. 11. 2023",
    help_ex_yes: "ano",
    help_ex_no: "ne",
    help_rule_e: "Klidně pošlete celý export z CRM, ostatní sloupce přeskočíme. Až 150 firem, Excel (.xlsx, .xls) nebo .csv",
    faq_q7: "Ukládáte profily našich kandidátů?",
    faq_a7: "Ne. Profil kandidáta do hledání jen vložíte a po hledání zmizí. Než cokoli půjde do AI, odstraníme z něj jméno, e-mail, telefon a odkazy. Kandidáti zůstanou ve vašem ATS.",
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
