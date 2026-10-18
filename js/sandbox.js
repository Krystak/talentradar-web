/**
 * TalentRadar — interactive sandbox on talentradar.eu (#live-radar).
 *
 * A light, self-contained replica of the web app: Home, BD Master with the
 * role panel, Scanner, Market Analytics, Settings, the ATS (beta) and AI Hawk.
 * Everything runs in the browser on the sample workspace below; nothing is
 * sent anywhere. Each screen links to the same screen in the full demo.
 *
 * Mounts into <div id="trSandbox">, follows the site language (TRLang and the
 * `talentradar:langchange` event) and exposes window.TRSandbox.go(screen).
 */
(function () {
  'use strict';

  /* ── Full demo links ──
     The app opens its public demo for ?demo=showcase and keeps the path, so
     each screen can deep-link. When the Czech demo workspace exists, point
     DEMO_QUERY at it. */
  const DEMO_ORIGIN = 'https://app.talentradar.eu';
  const DEMO_QUERY = 'demo=showcase';
  const SCREEN_PATHS = { home: '/', bd: '/bd-master', scanner: '/scanner', analytics: '/analytics', settings: '/settings', ats: '/' };
  const demoLink = (screen) => `${DEMO_ORIGIN}${SCREEN_PATHS[screen] || '/'}?${DEMO_QUERY}`;

  /* ═══════════════════════ Strings ═══════════════════════ */
  const S = {
    en: {
      ws_name: 'Demo Agency s.r.o.', ws_user: 'You · Owner', tier: 'AGENCY PRO', sample: 'Sample data',
      nav_home: 'Home', nav_scanner: 'Scanner', nav_bd: 'BD Master', nav_analytics: 'Market Analytics', nav_ats: 'Mandates', nav_settings: 'Settings',
      beta: 'BETA', open_full: 'Open in full demo', open_full_short: 'Full demo',
      tour_title: 'Try it', tour_open_role: 'Open a role', tour_status: 'Change its status', tour_mandate: 'Turn it into a mandate', tour_hawk: 'Ask AI Hawk', tour_scan: 'Run a scan',
      tour_done_title: 'That is the daily loop of TalentRadar.', tour_done_text: 'The full demo has the same screens with a complete workspace. Or run it on your own client list.',
      tour_done_demo: 'Open the full demo', tour_done_pilot: 'Start 14-day free pilot',
      greet_morning: 'Good morning', greet_afternoon: 'Good afternoon', greet_evening: 'Good evening',
      home_meta: '{date} · last scan today {last} (Prague) · next scan {next}', tomorrow: 'tomorrow',
      w24: '24h', w7: '7 days', w30: '30 days',
      kpi_new: 'new roles', kpi_new_sub: '{n} of them at clients', kpi_core: 'of them', kpi_core_sub: '{n} at clients', kpi_hiring: 'companies hiring', kpi_closed: 'roles closed',
      cwn_title: 'Companies with new roles', cwn_sub: '{w} · {n} companies with new roles', filter_companies: 'Filter companies',
      all: 'All', clients: 'Clients', prospects: 'Prospects', client: 'CLIENT', prospect: 'PROSPECT',
      col_company: 'Company', col_new: 'New', col_core: 'Core', col_active: 'Active', col_top: 'Top new role', col_last: 'Last new',
      grp_clients: 'CLIENTS', grp_prospects: 'PROSPECTS', companies_n: '{n} companies', roles_n: '{n} roles',
      see_all_bd: 'See all in BD Master', no_companies: 'No company matches the filter.',
      pipe_title: 'Pipeline', pipe_clients: 'active roles at clients', pipe_prospects: 'active roles at prospects', pipe_total: '{n} active roles at {c} companies',
      att_title: 'Needs attention', att_stale: '{n} roles open 30+ days', att_stale_sub: 'The in-house team has not filled them. Warmest pitch you have.', att_show: 'Show in BD Master',
      spike_title: 'Hiring spike', spike_text: '{co}: {n} new roles this week', spike_sub: 'Usually about one a week. Pitch a multi-role engagement.',
      bd_sub: '{n} active roles at {c} companies · {t} new today', tab_roles: 'Active roles', tab_dir: 'Company directory', tab_archive: 'Role archive',
      q_starred: 'Starred', q_new: 'New today', q_contact: 'To contact', q_contacted: 'Contacted', q_talks: 'In talks', q_stale: 'Open 30+ days',
      search_roles: 'Search role, company or keyword', export_csv: 'Export CSV', exported: 'CSV with {n} roles downloaded.',
      col_ref: 'Ref', col_role: 'Role', col_location: 'Location', col_fit: 'Fit', col_status: 'Status', col_seen: 'First seen',
      g_today: 'TODAY', g_yesterday: 'YESTERDAY', g_week: 'EARLIER THIS WEEK', g_month: 'THIS MONTH', g_stale: 'OPEN 30+ DAYS',
      today: 'Today', yesterday: 'Yesterday', days_ago: '{n} d ago', open_days: 'open {n} d',
      no_roles: 'No role matches the filters.', clear_filters: 'Clear filters',
      dir_sub: 'Every company you track, with its careers page and the ATS it runs on.', col_type: 'Type', col_ats: 'ATS', col_new7: 'New (7 d)', show_roles: 'Show roles',
      arch_sub: 'Roles that disappeared from the careers page. Archived automatically after two scans without them.', col_closed: 'Closed', col_open_for: 'Was open',
      st_NEW: 'NEW', st_CONTACT_PENDING: 'TO CONTACT', st_CONTACTED: 'CONTACTED', st_IN_PROGRESS: 'IN TALKS', st_WON: 'WON', st_LOST: 'LOST',
      p_of: '{n} of {total}', p_status: 'Status', p_posting: 'Open posting', p_mandate: 'Create mandate', p_mandate_done: 'Mandate created', p_close: 'Close',
      pt_overview: 'Overview', pt_hm: 'Hiring manager', pt_notes: 'Notes', pt_history: 'History',
      ai_summary: 'AI summary', ai_generated: 'generated from the posting', key_req: 'Key requirements', bd_hook: 'BD hook', fit_reason: 'Why this fit',
      hm_title: 'Likely hiring manager', hm_sub: 'Estimated from the role title and department. The person with the final call, not the interview panel.',
      hm_linkedin: 'LinkedIn search', hm_xray: 'Google X-Ray', hm_save: 'In the full app the Chrome extension saves them as a contact.',
      notes_empty: 'No notes yet. Write the first one, @mention a colleague.', note_ph: 'Add a note… try @Petra', note_add: 'Add note', you: 'You',
      h_seen: 'First seen in the {t} scan', h_status: 'Status changed to {s}', h_mandate: 'Mandate {id} created in ATS', h_note: 'Note added',
      seen_meta: 'First seen {d} · {ats} · {loc}',
      sc_sub: '{n} companies · {n} in the automatic scan · plan limit up to 200', sc_tab_companies: 'Companies', sc_tab_schedule: 'Schedule',
      sc_next: 'Next automatic scan', sc_last: 'Last scan', sc_credits: 'Manual-scan credits this week',
      sc_next_v: '{when} {time}', sc_tz: 'Europe/Prague · {freq} · {n} companies', sc_change: 'Change schedule',
      sc_last_v: '{time} · {n} companies · {s} s', sc_all_ok: 'All career endpoints responded normally',
      sc_credit_note: '1 credit = 1 company · automatic scans are free', avail: 'AVAIL',
      sc_search: 'Search company, domain or careers URL…', sc_scan_all: 'Scan all ({n})', sc_scan: 'Scan', sc_scanning: 'Scanning…', sc_queued: 'Queued',
      col_careers: 'Careers page', col_roles: 'Active roles', col_auto: 'Auto-scan', col_lastscan: 'Last scan', col_action: '', on: 'On',
      sc_add_title: 'Add a company', sc_add_ph: 'Paste a careers URL, e.g. jobs.lever.co/yourclient', sc_add_btn: 'Add', sc_add_detect: 'Detected: {ats}. Scans from the next run.',
      sc_add_bad: 'Paste a careers page address.',
      sc_run_title: 'Scanning {n} companies', sc_run_now: 'Reading {co} ({ats})…',
      sc_done_title: 'Scan finished in {s} s', sc_done_text: '+{n} new roles · {a} archived · {c} companies', sc_done_view: 'See the new roles',
      sc_one_none: '{co}: no changes ({n} active roles).', sc_one_new: '{co}: 1 new role found.',
      sched_title: 'Automatic scans', sched_sub: 'Scans run in your workspace time zone. Manual scans use credits.',
      f1: '1× daily', f1_t: '06:00', f2: '2× daily', f2_t: '06:00 & 12:00', f4: '4× daily', f4_t: '06:00, 10:00, 14:00, 18:00', f4_tag: 'Enterprise',
      an_title: 'Market intelligence & analytics', an_sub: 'Hiring velocity, technology demand and where your companies hire.',
      an_total: 'Total monitored roles', an_total_sub: 'across {n} tech companies', an_progress: 'Roles in progress', an_progress_sub: 'to contact, contacted or in talks',
      an_ratio: 'Core fit ratio', an_ratio_sub: '{n} roles meet your core criteria', an_velocity: 'Hiring velocity', an_velocity_sub: 'new roles in the last {w}',
      an_stack: 'Technology stack demand', an_stack_sub: 'Open roles per technology domain', an_top: 'Top hiring companies', an_top_sub: 'Ranked by open roles',
      an_daily: 'New roles per day', an_daily_sub: 'Last 14 days, all tracked companies', roles_word: 'roles',
      set_tab_spec: 'Specialization', set_tab_modules: 'Modules', set_tab_schedule: 'Scan schedule',
      spec_title: 'Agency role profile', spec_sub: 'What you place decides what lands as CORE. Every new role is checked against this profile, then by AI.',
      spec_core: 'CORE · you place these', spec_sel: 'SELECTIVE · sometimes', spec_skip: 'SKIP · never',
      mk_title: 'Markets', mk_core: 'Core markets', mk_sel: 'Selective markets', mk_block: 'Blocked markets',
      test_title: 'Test a job title', test_ph: 'e.g. Senior Data Engineer', test_loc: 'Location', test_btn: 'Test',
      test_r_core: 'Matches your CORE profile ({k}).', test_r_sel: 'Matches a SELECTIVE family ({k}).', test_r_skip: 'In your SKIP list ({k}).',
      test_r_none: 'Not in your profile. AI decides from the posting; here it would land as SELECTIVE.',
      test_cap_sel: 'Location is a selective market, so the most it can be is SELECTIVE.', test_cap_block: 'Location is a blocked market, so it is SKIP.',
      mod_title: 'Modules', mod_sub: 'Switch the parts of TalentRadar your agency uses. A module that is off disappears from the menu.',
      mod_bd: 'BD radar', mod_bd_d: 'Home, Scanner, BD Master, Market Analytics, scheduled scans.',
      mod_ats: 'ATS & pipeline', mod_ats_d: 'Mandates, candidates, pipeline, placements. A role becomes a mandate in one click.',
      mod_fin: 'Finance', mod_fin_d: 'Invoices, commissions, P&L. Needs the ATS.',
      mode_a: 'Mode A · BD radar next to your existing ATS (Bullhorn, Datacruit, Recruitis…)', mode_b: 'Mode B · BD radar + ATS in one place',
      ats_title: 'Mandates & pipeline', ats_sub: 'Roles you won become mandates. Candidates move through the pipeline to placement.',
      ats_kpi_jobs: 'Open mandates', ats_kpi_cands: 'Candidates in process', ats_kpi_int: 'In interviews', ats_kpi_fee: 'Placed fees',
      ats_add: 'Add candidate', ats_advance: 'Move on', ats_empty: 'No candidates yet. Add one from your talent pool.',
      ats_fee: 'Fee {f}', ats_from_role: 'from BD Master role {r}',
      stage_SHORTLISTED: 'Shortlisted', stage_CV_SENT: 'CV sent', stage_INTERVIEW_1: 'Interview 1', stage_INTERVIEW_2: 'Interview 2', stage_FINAL: 'Final round', stage_OFFER: 'Offer', stage_PLACED: 'Placed',
      col_s_short: 'Shortlisted', col_s_cv: 'CV sent', col_s_int: 'Interviews', col_s_offer: 'Offer', col_s_placed: 'Placed',
      ats_placed_toast: '{c} placed at {co}. Fee {f} logged.', ats_moved: '{c} → {s}', ats_added: '{c} added to the shortlist.',
      ats_off: 'The ATS module is switched off for this workspace (Mode A).', ats_turn_on: 'Switch it on',
      hawk_title: 'AI Hawk', hawk_sub: 'Ask anything about your workspace', hawk_hello: 'Hi, I am AI Hawk. I know every role, company and status in this workspace. What do you need?',
      hawk_ph: 'Ask AI Hawk…', hawk_send: 'Send', hawk_kbd: 'Ctrl+K in the app',
      hq_core: 'How many CORE roles do my clients have open?', hq_stale: 'Which roles are open 30+ days?', hq_pitch: 'Who should I pitch today?', hq_draft: 'Draft an outreach for {co}',
      ha_core: 'Your clients have **{n} CORE roles** open right now ({t} new today). The newest:', ha_stale: '**{n} roles** have been open 30+ days. The in-house teams have not filled them:',
      ha_pitch: 'Three warm reasons to call today:', ha_pitch_stale: '{co} — {r} is open {d} days', ha_pitch_spike: '{co} — {n} new roles this week, a hiring push', ha_pitch_new: '{co} — fresh CORE role: {r}',
      ha_draft: 'Here is a first message to the likely hiring manager ({hm}) at {co}:', ha_draft_body: 'Hi {first},\n\nI saw you are hiring a {r} in {loc}. We place exactly this profile in the Czech market and I have two people in mind who could start the conversation this week.\n\nWould a 15-minute call on Thursday work?\n\nBest,\nYou',
      ha_fallback: 'In this sandbox I know a few questions. The full demo answers anything about the workspace: counts, lists, exports, status changes.', ha_show: 'Show in BD Master', ha_open_full: 'Ask it in the full demo',
      toast_status: 'Status: {s}', toast_star: 'Starred', toast_unstar: 'Removed from starred', toast_mandate: 'Mandate {id} created. Opening the pipeline.',
      fam_dev: 'Software Dev', fam_infra: 'Infrastructure', fam_data: 'Data & AI', fam_product: 'Product', fam_design: 'Design', fam_sales: 'B2B Sales', fam_sec: 'Security',
      mode_Hybrid: 'Hybrid', mode_Remote: 'Remote', mode_Onsite: 'On-site',
    },
    cs: {
      ws_name: 'Demo Agency s.r.o.', ws_user: 'Vy · Vlastník', tier: 'AGENCY PRO', sample: 'Ukázková data',
      nav_home: 'Domov', nav_scanner: 'Sken', nav_bd: 'BD Master', nav_analytics: 'Analytika trhu', nav_ats: 'Zakázky', nav_settings: 'Nastavení',
      beta: 'BETA', open_full: 'Otevřít v plném demu', open_full_short: 'Plné demo',
      tour_title: 'Vyzkoušejte', tour_open_role: 'Otevřít roli', tour_status: 'Změnit její stav', tour_mandate: 'Udělat z ní zakázku', tour_hawk: 'Zeptat se AI Hawka', tour_scan: 'Spustit sken',
      tour_done_title: 'Tohle je denní smyčka TalentRadaru.', tour_done_text: 'Plné demo má stejné obrazovky s kompletním workspace. Nebo si ho pusťte na vlastní seznam klientů.',
      tour_done_demo: 'Otevřít plné demo', tour_done_pilot: 'Spustit 14denní pilot zdarma',
      greet_morning: 'Dobré ráno', greet_afternoon: 'Dobré odpoledne', greet_evening: 'Dobrý večer',
      home_meta: '{date} · poslední sken dnes {last} (Praha) · další sken {next}', tomorrow: 'zítra',
      w24: '24 h', w7: '7 dní', w30: '30 dní',
      kpi_new: 'nových rolí', kpi_new_sub: 'z toho {n} u klientů', kpi_core: 'z nich', kpi_core_sub: '{n} u klientů', kpi_hiring: 'firem nabírá', kpi_closed: 'rolí uzavřeno',
      cwn_title: 'Firmy s novými rolemi', cwn_sub: '{w} · {n} firem s novými rolemi', filter_companies: 'Filtrovat firmy',
      all: 'Vše', clients: 'Klienti', prospects: 'Prospekty', client: 'KLIENT', prospect: 'PROSPEKT',
      col_company: 'Firma', col_new: 'Nové', col_core: 'Core', col_active: 'Aktivní', col_top: 'Nejvyšší nová role', col_last: 'Poslední nová',
      grp_clients: 'KLIENTI', grp_prospects: 'PROSPEKTY', companies_n: '{n} firem', roles_n: '{n} rolí',
      see_all_bd: 'Vše v BD Masteru', no_companies: 'Filtru neodpovídá žádná firma.',
      pipe_title: 'Pipeline', pipe_clients: 'aktivních rolí u klientů', pipe_prospects: 'aktivních rolí u prospektů', pipe_total: '{n} aktivních rolí u {c} firem',
      att_title: 'Vyžaduje pozornost', att_stale: '{n} rolí otevřených 30+ dní', att_stale_sub: 'Interní tým je neobsadil. Nejteplejší důvod k oslovení.', att_show: 'Ukázat v BD Masteru',
      spike_title: 'Skok náboru', spike_text: '{co}: {n} nové role za týden', spike_sub: 'Obvykle zhruba jedna týdně. Nabídněte spolupráci na více rolí.',
      bd_sub: '{n} aktivních rolí u {c} firem · {t} nových dnes', tab_roles: 'Aktivní role', tab_dir: 'Adresář firem', tab_archive: 'Archiv rolí',
      q_starred: 'S hvězdičkou', q_new: 'Nové dnes', q_contact: 'K oslovení', q_contacted: 'Osloveno', q_talks: 'V jednání', q_stale: 'Otevřené 30+ dní',
      search_roles: 'Hledat roli, firmu nebo klíčové slovo', export_csv: 'Export CSV', exported: 'Staženo CSV s {n} rolemi.',
      col_ref: 'Ref', col_role: 'Role', col_location: 'Lokalita', col_fit: 'Fit', col_status: 'Stav', col_seen: 'Poprvé',
      g_today: 'DNES', g_yesterday: 'VČERA', g_week: 'DŘÍVE TENTO TÝDEN', g_month: 'TENTO MĚSÍC', g_stale: 'OTEVŘENÉ 30+ DNÍ',
      today: 'Dnes', yesterday: 'Včera', days_ago: 'před {n} d', open_days: 'otevřeno {n} d',
      no_roles: 'Filtrům neodpovídá žádná role.', clear_filters: 'Zrušit filtry',
      dir_sub: 'Všechny sledované firmy s kariérní stránkou a ATS, na kterém běží.', col_type: 'Typ', col_ats: 'ATS', col_new7: 'Nové (7 d)', show_roles: 'Ukázat role',
      arch_sub: 'Role, které zmizely z kariérní stránky. Archivují se samy po dvou skenech bez nich.', col_closed: 'Uzavřeno', col_open_for: 'Bylo otevřeno',
      st_NEW: 'NOVÁ', st_CONTACT_PENDING: 'K OSLOVENÍ', st_CONTACTED: 'OSLOVENO', st_IN_PROGRESS: 'V JEDNÁNÍ', st_WON: 'ZÍSKÁNO', st_LOST: 'PROHRÁNO',
      p_of: '{n} z {total}', p_status: 'Stav', p_posting: 'Otevřít inzerát', p_mandate: 'Vytvořit zakázku', p_mandate_done: 'Zakázka vytvořena', p_close: 'Zavřít',
      pt_overview: 'Přehled', pt_hm: 'Hiring manager', pt_notes: 'Poznámky', pt_history: 'Historie',
      ai_summary: 'AI shrnutí', ai_generated: 'vygenerováno z inzerátu', key_req: 'Klíčové požadavky', bd_hook: 'BD háček', fit_reason: 'Proč tento fit',
      hm_title: 'Pravděpodobný hiring manager', hm_sub: 'Odhad z názvu role a oddělení. Člověk s finálním slovem, ne panel pohovoru.',
      hm_linkedin: 'Hledat na LinkedInu', hm_xray: 'Google X-Ray', hm_save: 'V plné aplikaci ho rozšíření pro Chrome uloží jako kontakt.',
      notes_empty: 'Zatím žádné poznámky. Napište první, @zmiňte kolegu.', note_ph: 'Přidat poznámku… zkuste @Petra', note_add: 'Přidat', you: 'Vy',
      h_seen: 'Poprvé nalezena ve skenu {t}', h_status: 'Stav změněn na {s}', h_mandate: 'V ATS vytvořena zakázka {id}', h_note: 'Přidána poznámka',
      seen_meta: 'Poprvé {d} · {ats} · {loc}',
      sc_sub: '{n} firem · {n} v automatickém skenu · limit tarifu až 200', sc_tab_companies: 'Firmy', sc_tab_schedule: 'Rozvrh',
      sc_next: 'Další automatický sken', sc_last: 'Poslední sken', sc_credits: 'Kredity na ruční sken tento týden',
      sc_next_v: '{when} {time}', sc_tz: 'Europe/Prague · {freq} · {n} firem', sc_change: 'Změnit rozvrh',
      sc_last_v: '{time} · {n} firem · {s} s', sc_all_ok: 'Všechny kariérní stránky odpověděly normálně',
      sc_credit_note: '1 kredit = 1 firma · automatické skeny jsou zdarma', avail: 'K DISPOZICI',
      sc_search: 'Hledat firmu, doménu nebo URL kariérní stránky…', sc_scan_all: 'Skenovat vše ({n})', sc_scan: 'Sken', sc_scanning: 'Skenuji…', sc_queued: 'Ve frontě',
      col_careers: 'Kariérní stránka', col_roles: 'Aktivní role', col_auto: 'Auto-sken', col_lastscan: 'Poslední sken', col_action: '', on: 'Zap.',
      sc_add_title: 'Přidat firmu', sc_add_ph: 'Vložte URL kariérní stránky, např. jobs.lever.co/vasklient', sc_add_btn: 'Přidat', sc_add_detect: 'Rozpoznáno: {ats}. Skenuje se od dalšího běhu.',
      sc_add_bad: 'Vložte adresu kariérní stránky.',
      sc_run_title: 'Skenuji {n} firem', sc_run_now: 'Čtu {co} ({ats})…',
      sc_done_title: 'Sken hotový za {s} s', sc_done_text: '+{n} nové role · {a} archivována · {c} firem', sc_done_view: 'Ukázat nové role',
      sc_one_none: '{co}: beze změn ({n} aktivních rolí).', sc_one_new: '{co}: nalezena 1 nová role.',
      sched_title: 'Automatické skeny', sched_sub: 'Skeny běží v časovém pásmu workspace. Ruční skeny čerpají kredity.',
      f1: '1× denně', f1_t: '06:00', f2: '2× denně', f2_t: '06:00 a 12:00', f4: '4× denně', f4_t: '06:00, 10:00, 14:00, 18:00', f4_tag: 'Enterprise',
      an_title: 'Analytika trhu', an_sub: 'Tempo náboru, poptávka po technologiích a kde sledované firmy nabírají.',
      an_total: 'Sledované role celkem', an_total_sub: 'u {n} technologických firem', an_progress: 'Role v procesu', an_progress_sub: 'k oslovení, osloveno nebo v jednání',
      an_ratio: 'Podíl CORE', an_ratio_sub: '{n} rolí splňuje vaše hlavní kritéria', an_velocity: 'Tempo náboru', an_velocity_sub: 'nových rolí za posledních {w}',
      an_stack: 'Poptávka po technologiích', an_stack_sub: 'Otevřené role podle technologické oblasti', an_top: 'Firmy, které nejvíc nabírají', an_top_sub: 'Podle počtu otevřených rolí',
      an_daily: 'Nové role po dnech', an_daily_sub: 'Posledních 14 dní, všechny sledované firmy', roles_word: 'rolí',
      set_tab_spec: 'Specializace', set_tab_modules: 'Moduly', set_tab_schedule: 'Rozvrh skenů',
      spec_title: 'Profil rolí agentury', spec_sub: 'Co obsazujete, rozhoduje, co přistane jako CORE. Každá nová role se porovná s profilem, pak ji posoudí AI.',
      spec_core: 'CORE · obsazujete', spec_sel: 'SELECTIVE · občas', spec_skip: 'SKIP · nikdy',
      mk_title: 'Trhy', mk_core: 'Hlavní trhy', mk_sel: 'Selektivní trhy', mk_block: 'Blokované trhy',
      test_title: 'Vyzkoušet název pozice', test_ph: 'např. Senior Data Engineer', test_loc: 'Lokalita', test_btn: 'Vyzkoušet',
      test_r_core: 'Odpovídá vašemu CORE profilu ({k}).', test_r_sel: 'Odpovídá SELECTIVE rodině ({k}).', test_r_skip: 'Je ve vašem seznamu SKIP ({k}).',
      test_r_none: 'V profilu není. Rozhodne AI podle inzerátu; tady by přistála jako SELECTIVE.',
      test_cap_sel: 'Lokalita je selektivní trh, takže nejvýš SELECTIVE.', test_cap_block: 'Lokalita je blokovaný trh, takže SKIP.',
      mod_title: 'Moduly', mod_sub: 'Zapněte části TalentRadaru, které agentura používá. Vypnutý modul zmizí z menu.',
      mod_bd: 'BD radar', mod_bd_d: 'Domov, Sken, BD Master, Analytika trhu, plánované skeny.',
      mod_ats: 'ATS & pipeline', mod_ats_d: 'Zakázky, kandidáti, pipeline, umístění. Z role je zakázka jedním klikem.',
      mod_fin: 'Finance', mod_fin_d: 'Faktury, provize, výsledovka. Vyžaduje ATS.',
      mode_a: 'Mode A · BD radar vedle vašeho ATS (Bullhorn, Datacruit, Recruitis…)', mode_b: 'Mode B · BD radar + ATS na jednom místě',
      ats_title: 'Zakázky & pipeline', ats_sub: 'Získané role se stanou zakázkami. Kandidáti jdou pipeline až k umístění.',
      ats_kpi_jobs: 'Otevřené zakázky', ats_kpi_cands: 'Kandidáti v procesu', ats_kpi_int: 'Na pohovorech', ats_kpi_fee: 'Fee za umístění',
      ats_add: 'Přidat kandidáta', ats_advance: 'Posunout', ats_empty: 'Zatím žádní kandidáti. Přidejte prvního z talent poolu.',
      ats_fee: 'Fee {f}', ats_from_role: 'z role {r} v BD Masteru',
      stage_SHORTLISTED: 'Shortlist', stage_CV_SENT: 'CV odesláno', stage_INTERVIEW_1: '1. kolo', stage_INTERVIEW_2: '2. kolo', stage_FINAL: 'Finále', stage_OFFER: 'Nabídka', stage_PLACED: 'Umístěn',
      col_s_short: 'Shortlist', col_s_cv: 'CV odesláno', col_s_int: 'Pohovory', col_s_offer: 'Nabídka', col_s_placed: 'Umístěn',
      ats_placed_toast: '{c} umístěn u {co}. Fee {f} zapsáno.', ats_moved: '{c} → {s}', ats_added: '{c} přidán na shortlist.',
      ats_off: 'Modul ATS je v tomto workspace vypnutý (Mode A).', ats_turn_on: 'Zapnout',
      hawk_title: 'AI Hawk', hawk_sub: 'Zeptejte se na cokoli o svém workspace', hawk_hello: 'Ahoj, jsem AI Hawk. Znám každou roli, firmu a stav v tomto workspace. Co potřebujete?',
      hawk_ph: 'Zeptejte se AI Hawka…', hawk_send: 'Odeslat', hawk_kbd: 'V aplikaci Ctrl+K',
      hq_core: 'Kolik CORE rolí mají klienti otevřených?', hq_stale: 'Které role jsou otevřené 30+ dní?', hq_pitch: 'Koho mám dnes oslovit?', hq_draft: 'Napiš oslovení pro {co}',
      ha_core: 'Vaši klienti mají právě otevřených **{n} CORE rolí** ({t} nových dnes). Nejnovější:', ha_stale: '**{n} rolí** je otevřených 30+ dní. Interní týmy je neobsadily:',
      ha_pitch: 'Tři teplé důvody, proč dnes volat:', ha_pitch_stale: '{co} — {r} je otevřená {d} dní', ha_pitch_spike: '{co} — {n} nové role za týden, nábor zrychluje', ha_pitch_new: '{co} — čerstvá CORE role: {r}',
      ha_draft: 'Tady je první zpráva pro pravděpodobného hiring managera ({hm}) ve firmě {co}:', ha_draft_body: 'Dobrý den, {first},\n\nviděl jsem, že hledáte {r} ({loc}). Přesně tenhle profil obsazujeme a mám v hlavě dva lidi, se kterými můžeme mluvit už tento týden.\n\nHodil by se vám ve čtvrtek 15minutový hovor?\n\nS pozdravem\nVy',
      ha_fallback: 'V sandboxu znám jen pár otázek. Plné demo odpoví na cokoli o workspace: počty, seznamy, exporty, změny stavů.', ha_show: 'Ukázat v BD Masteru', ha_open_full: 'Zeptat se v plném demu',
      toast_status: 'Stav: {s}', toast_star: 'Přidáno do hvězdiček', toast_unstar: 'Odebráno z hvězdiček', toast_mandate: 'Zakázka {id} vytvořena. Otevírám pipeline.',
      fam_dev: 'Vývoj', fam_infra: 'Infrastruktura', fam_data: 'Data & AI', fam_product: 'Produkt', fam_design: 'Design', fam_sales: 'B2B Sales', fam_sec: 'Bezpečnost',
      mode_Hybrid: 'Hybrid', mode_Remote: 'Remote', mode_Onsite: 'Na místě',
    },
  };

  /* ═══════════════════════ Sample workspace ═══════════════════════ */
  const COMPANIES = [
    { id: 'mews', name: 'Mews', domain: 'mews.com', careers: 'https://www.mews.com/en/careers', ats: 'Greenhouse', hq: 'Praha', client: true, active: 48, ctx: { en: 'hospitality cloud platform', cs: 'cloudová platforma pro hotely' } },
    { id: 'rohlik', name: 'Rohlik.cz', domain: 'rohlik.group', careers: 'https://career.rohlik.group/', ats: 'Greenhouse', hq: 'Praha', client: true, active: 64, ctx: { en: 'online grocery group', cs: 'online supermarket' } },
    { id: 'productboard', name: 'Productboard', domain: 'productboard.com', careers: 'https://www.productboard.com/careers/', ats: 'Greenhouse', hq: 'Praha', client: true, active: 27, ctx: { en: 'product management platform', cs: 'platforma pro produktové týmy' } },
    { id: 'ftmo', name: 'FTMO', domain: 'ftmo.com', careers: 'https://ftmo.com/cs/kariera/', ats: 'Teamio', hq: 'Praha', client: true, active: 22, ctx: { en: 'prop trading fintech', cs: 'fintech pro tradery' } },
    { id: 'keboola', name: 'Keboola', domain: 'keboola.com', careers: 'https://www.keboola.com/careers', ats: 'Ashby', hq: 'Praha', client: true, active: 14, ctx: { en: 'data platform', cs: 'datová platforma' } },
    { id: 'notino', name: 'Notino', domain: 'notino.cz', careers: 'https://www.notino.cz/kariera/', ats: 'Career page', hq: 'Brno', client: true, active: 39, ctx: { en: 'European beauty e-commerce', cs: 'evropský e-shop s kosmetikou' } },
    { id: 'livesport', name: 'Livesport', domain: 'livesport.eu', careers: 'https://www.livesport.eu/kariera/', ats: 'Career page', hq: 'Praha', client: true, active: 31, ctx: { en: 'sports data and apps', cs: 'sportovní data a aplikace' } },
    { id: 'kiwi', name: 'Kiwi.com', domain: 'kiwi.com', careers: 'https://jobs.kiwi.com/', ats: 'Greenhouse', hq: 'Brno', client: true, active: 42, ctx: { en: 'travel tech', cs: 'cestovní technologie' } },
    { id: 'strv', name: 'STRV', domain: 'strv.com', careers: 'https://www.strv.com/careers', ats: 'Lever', hq: 'Praha', client: false, active: 11, ctx: { en: 'digital product studio', cs: 'studio digitálních produktů' } },
    { id: 'shipmonk', name: 'ShipMonk', domain: 'shipmonk.com', careers: 'https://www.shipmonk.com/careers/', ats: 'Greenhouse', hq: 'Praha', client: false, active: 19, ctx: { en: 'e-commerce fulfilment', cs: 'fulfilment pro e-shopy' } },
    { id: 'heureka', name: 'Heureka Group', domain: 'heureka.group', careers: 'https://www.heurekadevs.cz/', ats: 'Recruitis', hq: 'Praha', client: false, active: 17, ctx: { en: 'e-commerce marketplace group', cs: 'skupina srovnávačů a marketplace' } },
    { id: 'packeta', name: 'Packeta', domain: 'packeta.com', careers: 'https://www.zasilkovna.cz/kariera', ats: 'Recruitis', hq: 'Praha', client: false, active: 26, ctx: { en: 'parcel delivery network', cs: 'síť výdejních míst' } },
    { id: 'cdn77', name: 'CDN77', domain: 'cdn77.com', careers: 'https://www.cdn77.com/careers', ats: 'Career page', hq: 'Praha', client: false, active: 9, ctx: { en: 'content delivery network', cs: 'síť pro doručování obsahu' } },
    { id: 'apify', name: 'Apify', domain: 'apify.com', careers: 'https://apify.com/jobs', ats: 'Ashby', hq: 'Praha', client: false, active: 12, ctx: { en: 'web scraping platform', cs: 'platforma pro web scraping' } },
    { id: 'twisto', name: 'Twisto', domain: 'twisto.cz', careers: 'https://www.twisto.cz/kariera/', ats: 'Teamio', hq: 'Praha', client: false, active: 8, ctx: { en: 'payments fintech', cs: 'platební fintech' } },
    { id: 'purestorage', name: 'Pure Storage', domain: 'purestorage.com', careers: 'https://www.purestorage.com/company/careers.html', ats: 'Greenhouse', hq: 'Praha', client: false, active: 33, ctx: { en: 'data storage, Prague R&D', cs: 'datová úložiště, pražský vývoj' } },
    { id: 'wolt', name: 'Wolt', domain: 'wolt.com', careers: 'https://careers.wolt.com/', ats: 'Lever', hq: 'Praha', client: false, active: 15, ctx: { en: 'delivery platform', cs: 'doručovací platforma' } },
    { id: 'daktela', name: 'Daktela', domain: 'daktela.com', careers: 'https://www.daktela.com/kariera/', ats: 'Recruitis', hq: 'Praha', client: false, active: 10, ctx: { en: 'contact-centre software', cs: 'software pro kontaktní centra' } },
    { id: 'seyfor', name: 'Seyfor', domain: 'seyfor.com', careers: 'https://www.seyfor.com/cs-cz/kariera', ats: 'Teamio', hq: 'Brno', client: false, active: 21, ctx: { en: 'business software group', cs: 'skupina podnikového softwaru' } },
  ];

  // age = days since the role was first seen (0 = today's scan).
  const ROLES_SEED = [
    ['C2401', 'mews', 'Principal Backend Engineer (.NET / Go)', 'dev', 'CORE', 'NEW', 0, 'Praha', 'Hybrid', 'Lead'],
    ['C2402', 'rohlik', 'Senior Kotlin Logistics Architect', 'dev', 'CORE', 'NEW', 0, 'Praha', 'Hybrid', 'Lead'],
    ['C2403', 'productboard', 'Staff AI / LLM Product Manager', 'product', 'CORE', 'NEW', 0, 'Praha', 'Hybrid', 'Lead'],
    ['C2404', 'keboola', 'Enterprise Account Executive (DACH & CEE)', 'sales', 'CORE', 'NEW', 0, 'Praha · Remote', 'Remote', 'Senior'],
    ['C2405', 'shipmonk', 'Staff Data Platform Engineer (Snowflake / dbt)', 'data', 'CORE', 'NEW', 0, 'Praha', 'Hybrid', 'Lead'],
    ['C2406', 'strv', 'Lead AI Solutions Engineer (Python)', 'data', 'CORE', 'NEW', 0, 'Praha · Brno', 'Hybrid', 'Lead'],
    ['C2407', 'rohlik', 'Head of Group Data Analytics & BI', 'data', 'CORE', 'CONTACT_PENDING', 1, 'Praha', 'Hybrid', 'Head'],
    ['C2408', 'ftmo', 'Head of Institutional B2B Partnerships', 'sales', 'CORE', 'NEW', 1, 'Praha', 'On-site', 'Head'],
    ['C2409', 'heureka', 'Head of Data Science & Search Relevance', 'data', 'CORE', 'NEW', 1, 'Praha', 'Hybrid', 'Head'],
    ['C2410', 'notino', 'Lead E-commerce Product Manager (Mobile)', 'product', 'CORE', 'NEW', 1, 'Brno', 'Hybrid', 'Lead'],
    ['C2411', 'mews', 'Director of Strategic Hospitality Accounts', 'sales', 'CORE', 'CONTACTED', 2, 'Praha · Remote', 'Remote', 'Director'],
    ['C2412', 'purestorage', 'Staff Systems Software Engineer (C++)', 'dev', 'CORE', 'NEW', 2, 'Praha', 'Hybrid', 'Lead'],
    ['C2413', 'packeta', 'Senior B2B Key Account Manager', 'sales', 'SELECTIVE', 'NEW', 3, 'Praha', 'On-site', 'Senior'],
    ['C2414', 'apify', 'Senior TypeScript Crawling Engineer', 'dev', 'CORE', 'NEW', 3, 'Praha · Remote', 'Remote', 'Senior'],
    ['C2415', 'rohlik', 'Senior Platform Engineer (Kubernetes)', 'infra', 'CORE', 'NEW', 4, 'Praha', 'Hybrid', 'Senior'],
    ['C2416', 'twisto', 'Credit Risk & Data Analytics Lead', 'data', 'SELECTIVE', 'NEW', 4, 'Praha', 'Hybrid', 'Lead'],
    ['C2417', 'ftmo', 'Senior Trading Platform Security Engineer', 'sec', 'CORE', 'IN_PROGRESS', 5, 'Praha', 'On-site', 'Senior'],
    ['C2418', 'livesport', 'Senior Product Designer (Design Systems)', 'design', 'SELECTIVE', 'NEW', 5, 'Praha', 'Hybrid', 'Senior'],
    ['C2419', 'wolt', 'Head of B2B Retail Partnerships', 'sales', 'CORE', 'NEW', 6, 'Praha', 'Hybrid', 'Head'],
    ['C2420', 'seyfor', 'Senior Solution Architect (ERP & Cloud)', 'infra', 'SELECTIVE', 'NEW', 12, 'Brno · Praha', 'Hybrid', 'Senior'],
    ['C2421', 'livesport', 'Lead Cloud Infrastructure Engineer', 'infra', 'CORE', 'CONTACT_PENDING', 42, 'Praha', 'Hybrid', 'Lead'],
    ['C2422', 'kiwi', 'Principal Distributed Systems Engineer', 'dev', 'CORE', 'NEW', 38, 'Brno · Praha', 'Hybrid', 'Lead'],
    ['C2423', 'productboard', 'Senior Distributed Systems Engineer (Kafka)', 'dev', 'CORE', 'NEW', 37, 'Praha', 'Hybrid', 'Senior'],
    ['C2424', 'notino', 'Principal .NET & Microservices Architect', 'dev', 'CORE', 'CONTACTED', 44, 'Brno · Remote', 'Remote', 'Lead'],
    ['C2425', 'cdn77', 'Senior Network & Linux Kernel Engineer', 'infra', 'CORE', 'NEW', 39, 'Praha', 'On-site', 'Senior'],
    ['C2426', 'daktela', 'Enterprise SaaS Sales Director (CEE)', 'sales', 'CORE', 'NEW', 41, 'Praha', 'Hybrid', 'Director'],
  ];
  // Found when the visitor runs a scan in the sandbox.
  const SCAN_FINDS = [
    ['C2427', 'kiwi', 'Engineering Manager, Payments', 'dev', 'CORE', 'NEW', 0, 'Brno', 'Hybrid', 'Manager'],
    ['C2428', 'mews', 'Senior Data Engineer (Spark)', 'data', 'CORE', 'NEW', 0, 'Praha · Remote', 'Remote', 'Senior'],
  ];
  const ARCHIVED = [
    ['Senior iOS Engineer', 'livesport', 2, 58], ['Head of Marketing CEE', 'wolt', 3, 34], ['Backend Engineer (PHP)', 'heureka', 4, 71],
    ['Customer Success Lead', 'daktela', 6, 29], ['Data Analyst', 'twisto', 8, 46],
  ];

  const FAM = {
    dev: { req: { en: ['8+ years building backend systems in production', 'Distributed systems, APIs and data modelling', 'Ownership of architecture decisions across teams', 'Mentoring senior engineers'], cs: ['8+ let vývoje backendu v produkci', 'Distribuované systémy, API a datové modely', 'Odpovědnost za architekturu napříč týmy', 'Mentoring seniorních vývojářů'] },
      sum: { en: 'Senior hands-on engineering role that owns a core platform area and its architecture.', cs: 'Seniorní vývojářská role s vlastní částí platformy a odpovědností za její architekturu.' }, hm: ['VP of Engineering', 'Head of Engineering', 'CTO'] },
    infra: { req: { en: ['Kubernetes and Terraform at scale', 'Cloud cost and reliability ownership', 'On-call and incident leadership', 'Linux and networking depth'], cs: ['Kubernetes a Terraform ve velkém', 'Odpovědnost za náklady a spolehlivost cloudu', 'Pohotovost a řízení incidentů', 'Hluboká znalost Linuxu a sítí'] },
      sum: { en: 'Infrastructure role responsible for the platform the product runs on: reliability, scale and cost.', cs: 'Infrastrukturní role zodpovědná za platformu, na které produkt běží: spolehlivost, škálování a náklady.' }, hm: ['Head of Infrastructure', 'VP of Engineering', 'CTO'] },
    data: { req: { en: ['Modern data stack (dbt, Snowflake or Spark)', 'Python and SQL at production level', 'Stakeholder management with business teams', 'Experience leading a data team'], cs: ['Moderní datový stack (dbt, Snowflake nebo Spark)', 'Python a SQL na produkční úrovni', 'Spolupráce s byznysovými týmy', 'Zkušenost s vedením datového týmu'] },
      sum: { en: 'Data role that turns company data into decisions and products, with team leadership in scope.', cs: 'Datová role, která mění data firmy v rozhodnutí a produkty, včetně vedení týmu.' }, hm: ['Head of Data', 'Chief Data Officer', 'CTO'] },
    product: { req: { en: ['5+ years as a product manager in B2B or e-commerce', 'Discovery, metrics and roadmap ownership', 'Working closely with engineering and design', 'AI / ML product experience is a plus'], cs: ['5+ let jako produktový manažer v B2B nebo e-commerce', 'Discovery, metriky a odpovědnost za roadmapu', 'Úzká spolupráce s vývojem a designem', 'Zkušenost s AI / ML produkty je plus'] },
      sum: { en: 'Product leadership role owning a product area end to end, from discovery to delivery.', cs: 'Produktová role s celou produktovou oblastí od discovery po dodání.' }, hm: ['VP of Product', 'Chief Product Officer', 'Head of Product'] },
    design: { req: { en: ['Design systems at scale', 'Mobile and web product design', 'Prototyping and user research', 'Portfolio with shipped products'], cs: ['Design systémy ve velkém', 'Produktový design pro mobil i web', 'Prototypování a uživatelský výzkum', 'Portfolio s dodanými produkty'] },
      sum: { en: 'Senior design role shaping the design system used across the product.', cs: 'Seniorní designérská role, která tvaruje design systém celého produktu.' }, hm: ['Head of Design', 'VP of Product'] },
    sales: { req: { en: ['Track record closing enterprise SaaS deals', 'Existing network in DACH and CEE', 'Full-cycle ownership from prospecting to close', 'English and German or Czech'], cs: ['Prokazatelné uzavírání enterprise SaaS obchodů', 'Kontakty v DACH a CEE', 'Celý obchodní cyklus od prospectingu po podpis', 'Angličtina a němčina nebo čeština'] },
      sum: { en: 'Commercial role carrying a revenue target with large accounts in the region.', cs: 'Obchodní role s obratovým cílem u velkých zákazníků v regionu.' }, hm: ['VP of Sales', 'Chief Revenue Officer', 'Chief Commercial Officer'] },
    sec: { req: { en: ['Application and cloud security', 'Threat modelling and incident response', 'Secure SDLC and code review', 'Trading or fintech environment'], cs: ['Bezpečnost aplikací a cloudu', 'Threat modelling a reakce na incidenty', 'Bezpečný vývojový cyklus a code review', 'Prostředí tradingu nebo fintechu'] },
      sum: { en: 'Security engineering role protecting a regulated trading platform.', cs: 'Bezpečnostní role, která chrání regulovanou obchodní platformu.' }, hm: ['CISO', 'Head of Security', 'CTO'] },
  };

  const TEAM = ['Petra', 'Tomáš'];
  const POOL = [
    { n: 'Lucie P.', cur: 'Staff Engineer, Avast' }, { n: 'Ondřej M.', cur: 'Data Lead, Alza' }, { n: 'Kateřina V.', cur: 'Senior PM, Kiwi.com' },
    { n: 'Jakub S.', cur: 'VP Sales, Daktela' }, { n: 'Marek D.', cur: 'Principal Engineer, Oracle' }, { n: 'Eva H.', cur: 'Engineering Manager, Mews' },
  ];
  const STAGES = ['SHORTLISTED', 'CV_SENT', 'INTERVIEW_1', 'INTERVIEW_2', 'FINAL', 'OFFER', 'PLACED'];
  const STAGE_COL = { SHORTLISTED: 'short', CV_SENT: 'cv', INTERVIEW_1: 'int', INTERVIEW_2: 'int', FINAL: 'int', OFFER: 'offer', PLACED: 'placed' };
  const ROLE_STATUSES = ['NEW', 'CONTACT_PENDING', 'CONTACTED', 'IN_PROGRESS', 'WON', 'LOST'];

  /* ═══════════════════════ State ═══════════════════════ */
  const mkRole = (r) => ({ id: r[0], co: r[1], title: r[2], fam: r[3], fit: r[4], status: r[5], age: r[6], loc: r[7], mode: r[8], sen: r[9], starred: false, history: [], notes: [], fresh: false });
  const state = {
    screen: 'home',
    roles: ROLES_SEED.map(mkRole),
    companies: COMPANIES.map((c) => ({ ...c, scan: 'idle' })),
    homeWindow: 7, homeSeg: 'all', homeQuery: '', homeOpen: { rohlik: true },
    bdTab: 'roles', bdSeg: 'all', bdQuick: '', bdFit: 'all', bdQuery: '', bdCompany: '',
    panel: null, panelTab: 'overview',
    credits: 500, scanRun: null, scanned: false, scanFreq: 2,
    scTab: 'companies', scQuery: '', addMsg: null,
    anWindow: 7, setTab: 'spec', testResult: null,
    modules: { ats: true, fin: false },
    jobs: [], jobSel: 0, poolIdx: 0, placedFees: 18500,
    hawkOpen: false, hawk: [], hawkBusy: false,
    tour: { open_role: false, status: false, mandate: false, hawk: false, scan: false }, tourHidden: false,
    toast: null,
  };
  state.roles.find((r) => r.id === 'C2401').starred = true;
  state.roles.find((r) => r.id === 'C2411').starred = true;
  state.roles.find((r) => r.id === 'C2401').notes.push({ by: 'Petra', at: { en: 'today 08:12', cs: 'dnes 8:12' }, text: { en: '@You I know their VP of Engineering from a meetup. Shall I make the intro?', cs: '@Vy jejich VP of Engineering znám z meetupu. Mám vás představit?' } });
  state.roles.find((r) => r.id === 'C2421').notes.push({ by: 'Tomáš', at: { en: 'Mon 14:40', cs: 'po 14:40' }, text: { en: 'Still open after 6 weeks. Their TA lead said they are open to an agency now.', cs: 'Po 6 týdnech pořád otevřené. Jejich TA lead říkal, že už agenturu zváží.' } });

  state.jobs = [
    { id: 'J-104', roleId: 'C2411', title: 'Director of Strategic Hospitality Accounts', co: 'mews', fee: 24000, cands: [
      { n: 'Jakub S.', cur: 'VP Sales, Daktela', stage: 'FINAL' }, { n: 'Hana K.', cur: 'Sales Director, Sabre', stage: 'INTERVIEW_1' }, { n: 'Petr B.', cur: 'Head of Sales, Previo', stage: 'CV_SENT' }] },
    { id: 'J-103', roleId: 'C2417', title: 'Senior Trading Platform Security Engineer', co: 'ftmo', fee: 16500, cands: [
      { n: 'Martin K.', cur: 'Security Engineer, Avast', stage: 'OFFER' }, { n: 'Filip R.', cur: 'AppSec Lead, Kiwi.com', stage: 'INTERVIEW_2' }, { n: 'Adam N.', cur: 'SecOps, CSOB', stage: 'SHORTLISTED' }] },
    { id: 'J-101', roleId: null, title: 'Head of Data Engineering', co: 'rohlik', fee: 21000, cands: [
      { n: 'Tereza L.', cur: 'Data Engineering Lead, Alza', stage: 'PLACED' }] },
  ];

  /* ═══════════════════════ Helpers ═══════════════════════ */
  const lang = () => (window.TRLang && window.TRLang.current && window.TRLang.current() === 'cs' ? 'cs' : 'en');
  function t(key, vars) {
    let s = (S[lang()] && S[lang()][key]) ?? S.en[key] ?? key;
    if (vars) for (const k in vars) s = s.split(`{${k}}`).join(vars[k]);
    return s;
  }
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const ic = (name, cls = 'text-[18px]') => `<span class="material-symbols-outlined tr-ic ${cls}" aria-hidden="true">${name}</span>`;
  const co = (id) => state.companies.find((c) => c.id === id) || { name: id, ats: '', client: false, ctx: { en: '', cs: '' } };
  const fmt = (n) => new Intl.NumberFormat(lang() === 'cs' ? 'cs-CZ' : 'en-GB').format(n);
  const eur = (n) => `€${fmt(n)}`;
  const isStale = (r) => r.age >= 30;
  const activeRoles = () => state.roles;
  const pragueHour = () => Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Europe/Prague' }).format(new Date()));
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>');

  const BTN_P = 'inline-flex items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-[#FF5500] bg-[#FF5500]/[0.12] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:border-[#FF7733] hover:bg-[#FF5500]/[0.22] cursor-pointer';
  const BTN_S = 'inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.12] bg-[#0F1117] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[#FF5500] hover:bg-[#FF5500]/[0.08] cursor-pointer';
  const CHIP = (on) => `inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${on ? 'border-[#FF5500] bg-[#FF5500]/[0.12] text-white' : 'border-[#1B1E26] bg-[#0F1117] text-[#8A90A2] hover:text-white'}`;
  const CARD = 'rounded-xl border border-[#1B1E26] bg-[#0F1117]';
  const LABEL = 'font-mono text-[10px] font-bold uppercase tracking-wider';

  function fitBadge(fit) {
    const c = fit === 'CORE' ? 'border-[#FF5500]/40 bg-[#FF5500]/[0.12] text-[#FF7733]' : fit === 'SELECTIVE' ? 'border-[#38BDF8]/35 bg-[#38BDF8]/10 text-[#38BDF8]' : 'border-white/10 bg-white/5 text-[#8A90A2]';
    return `<span class="inline-block rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-bold ${c}">${fit}</span>`;
  }
  function statusBadge(st) {
    const c = { NEW: 'border-[#10B981]/35 bg-[#10B981]/10 text-[#34D399]', CONTACT_PENDING: 'border-[#FBBF24]/35 bg-[#FBBF24]/10 text-[#FBBF24]', CONTACTED: 'border-[#38BDF8]/35 bg-[#38BDF8]/10 text-[#38BDF8]', IN_PROGRESS: 'border-[#FF5500]/40 bg-[#FF5500]/[0.12] text-[#FF7733]', WON: 'border-[#10B981]/50 bg-[#10B981]/20 text-[#34D399]', LOST: 'border-white/10 bg-white/5 text-[#8A90A2]' }[st];
    return `<span class="inline-block whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-bold ${c}">${esc(t('st_' + st))}</span>`;
  }
  function typeBadge(c) {
    return c.client
      ? `<span class="inline-flex h-4 w-4 items-center justify-center rounded border border-[#FF5500]/50 bg-[#FF5500]/[0.12] font-mono text-[9px] font-bold text-[#FF7733]" title="${esc(t('client'))}">C</span>`
      : `<span class="inline-flex h-4 w-4 items-center justify-center rounded border border-[#38BDF8]/40 bg-[#38BDF8]/10 font-mono text-[9px] font-bold text-[#38BDF8]" title="${esc(t('prospect'))}">P</span>`;
  }
  const atsName = (ats) => (ats === 'Career page' && lang() === 'cs' ? 'Kariérní stránka' : ats);
  const atsBadge = (ats) => `<span class="inline-block rounded border border-[#1B1E26] bg-[#0B0E14] px-1.5 py-0.5 font-mono text-[9px] uppercase text-[#8A90A2]">${esc(atsName(ats))}</span>`;
  function seenLabel(age) {
    if (age === 0) return t('today');
    if (age === 1) return t('yesterday');
    if (age >= 30) return t('open_days', { n: age });
    return t('days_ago', { n: age });
  }
  function openFull(screen, extra = '') {
    return `<a href="${demoLink(screen)}" target="_blank" rel="noopener noreferrer" class="${BTN_S} ${extra}">${ic('open_in_new', 'text-[15px]')}<span>${esc(t('open_full'))}</span></a>`;
  }
  function header(title, sub, right = '') {
    return `<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0"><h3 class="text-lg font-bold text-white sm:text-xl">${title}</h3>${sub ? `<p class="mt-0.5 text-xs text-[#8A90A2]">${sub}</p>` : ''}</div>
      <div class="flex flex-shrink-0 flex-wrap items-center gap-2">${right}</div></div>`;
  }

  /* ═══════════════════════ Shell ═══════════════════════ */
  const NAV = [
    { s: 'home', icon: 'home' }, { s: 'scanner', icon: 'radar' }, { s: 'bd', icon: 'table_chart' },
    { s: 'analytics', icon: 'monitoring' }, { s: 'ats', icon: 'work', beta: true }, { s: 'settings', icon: 'settings' },
  ];
  const navItems = () => NAV.filter((n) => n.s !== 'ats' || state.modules.ats);
  const navLabel = (s) => t({ home: 'nav_home', scanner: 'nav_scanner', bd: 'nav_bd', analytics: 'nav_analytics', ats: 'nav_ats', settings: 'nav_settings' }[s]);

  function renderShell() {
    const newToday = state.roles.filter((r) => r.age === 0).length;
    const side = navItems().map((n) => {
      const on = n.s === state.screen;
      const badge = n.s === 'home' ? `<span class="rounded bg-[#FF5500] px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-white">${newToday}</span>`
        : n.beta ? `<span class="rounded border border-[#FBBF24]/40 px-1 py-px font-mono text-[8.5px] font-bold text-[#FBBF24]">${t('beta')}</span>` : '';
      return `<button type="button" data-a="go" data-v="${n.s}" aria-current="${on ? 'page' : 'false'}" class="group flex w-full items-center gap-2.5 rounded-lg border-l-2 px-2.5 py-2 text-left text-[13px] transition-colors cursor-pointer ${on ? 'border-[#FF5500] bg-[#FF5500]/[0.12] font-semibold text-white' : 'border-transparent text-[#8A90A2] hover:bg-[#151720] hover:text-white'}">
        ${ic(n.icon, 'text-[19px]')}<span class="flex-1 truncate">${esc(navLabel(n.s))}</span>${badge}</button>`;
    }).join('');
    const top = navItems().map((n) => {
      const on = n.s === state.screen;
      return `<button type="button" data-a="go" data-v="${n.s}" class="flex flex-shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[12.5px] whitespace-nowrap transition-colors cursor-pointer ${on ? 'border-[#FF5500] bg-[#FF5500]/[0.12] font-semibold text-white' : 'border-transparent text-[#8A90A2] hover:text-white'}">${ic(n.icon, 'text-[17px]')}${esc(navLabel(n.s))}${n.beta ? ` <span class="font-mono text-[8.5px] font-bold text-[#FBBF24]">${t('beta')}</span>` : ''}</button>`;
    }).join('');
    const path = (SCREEN_PATHS[state.screen] || '/').replace(/^\/$/, '') || '';
    const urlText = `app.talentradar.eu${state.screen === 'ats' ? '/jobs' : path || '/'}`;

    return `
    <div class="tr-sb relative overflow-hidden rounded-2xl border border-[#1B1E26] bg-[#0B0E14] shadow-2xl orange-glow-lg">
      <div class="flex items-center gap-3 border-b border-[#1B1E26] bg-[#090C12] px-3 py-2.5 sm:px-4">
        <div class="flex flex-shrink-0 items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-[#FF5F56]"></span><span class="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]"></span><span class="h-2.5 w-2.5 rounded-full bg-[#27C93F]"></span></div>
        <div class="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-white/5 bg-[#0B0E14] px-2.5 py-1 font-mono text-[11px] text-[#8A90A2]">${ic('lock', 'text-[13px] text-[#5A6275]')}<span class="truncate">${esc(urlText)}</span>
          <span class="ml-auto hidden flex-shrink-0 rounded border border-[#FBBF24]/30 px-1.5 font-mono text-[9px] font-bold uppercase text-[#FBBF24] sm:inline">${esc(t('sample'))}</span></div>
        <a href="${demoLink(state.screen)}" target="_blank" rel="noopener noreferrer" class="flex flex-shrink-0 items-center gap-1.5 rounded-lg border-[1.5px] border-[#FF5500] bg-[#FF5500]/[0.15] px-2.5 py-1 text-[11.5px] font-bold text-white transition-colors hover:bg-[#FF5500]/[0.28]">
          <span class="hidden sm:inline">${esc(t('open_full'))}</span><span class="sm:hidden">${esc(t('open_full_short'))}</span>${ic('open_in_new', 'text-[14px]')}</a>
      </div>
      <nav class="tr-sb-scroll flex gap-0.5 overflow-x-auto border-b border-[#1B1E26] bg-[#090C12] px-1.5 lg:hidden" aria-label="Sandbox menu">${top}</nav>
      <div class="relative flex lg:h-[700px]">
        <aside class="hidden w-52 flex-shrink-0 flex-col border-r border-[#1B1E26] bg-[#090C12] lg:flex">
          <div class="flex items-center gap-2.5 px-4 pt-5 pb-5"><img src="falcon.svg" alt="" class="h-7 w-7 object-contain"><div><div class="text-[14px] font-extrabold leading-none tracking-tight text-white">TALENT<span class="text-[#FF5500]">RADAR</span></div><div class="mt-1 font-mono text-[8.5px] tracking-[0.18em] text-[#5A6275]">BD RECRUITMENT</div></div></div>
          <nav class="flex-1 space-y-0.5 px-2" aria-label="Sandbox menu">${side}</nav>
          <div class="p-2.5"><div class="rounded-xl border border-[#1B1E26] bg-[#0F1117] p-3">
            <span class="mb-1.5 inline-block rounded border border-[#FF5500]/40 bg-[#FF5500]/[0.12] px-1.5 py-0.5 font-mono text-[9px] text-[#FF5500]">${t('tier')}</span>
            <div class="text-[13px] font-bold leading-snug text-white">${esc(t('ws_name'))}</div><div class="mt-0.5 text-[11px] text-[#8A90A2]">${esc(t('ws_user'))}</div></div></div>
        </aside>
        <main id="trSbMain" class="tr-sb-scroll relative min-w-0 flex-1 overflow-y-auto bg-[#0B0E14] lg:h-full">
          ${renderTour()}
          <div class="p-3 pb-20 sm:p-5 sm:pb-20">${renderScreen()}</div>
        </main>
        ${renderPanel()}
        ${renderHawk()}
      </div>
      ${state.toast ? `<div class="pointer-events-none fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 lg:absolute lg:z-50 rounded-lg border border-[#10B981]/40 bg-[#0F1117] px-3.5 py-2 text-xs font-semibold text-white shadow-2xl"><span class="text-[#34D399]">✓</span> ${esc(state.toast)}</div>` : ''}
    </div>`;
  }

  /* ── Tour ── */
  function tourSteps() {
    const steps = [['open_role', 'tour_open_role'], ['status', 'tour_status']];
    if (state.modules.ats) steps.push(['mandate', 'tour_mandate']);
    steps.push(['hawk', 'tour_hawk'], ['scan', 'tour_scan']);
    return steps;
  }
  function renderTour() {
    if (state.tourHidden) return '';
    const steps = tourSteps();
    const done = steps.filter(([k]) => state.tour[k]).length;
    if (done === steps.length) {
      return `<div class="m-3 mb-0 flex flex-col gap-3 rounded-xl border-[1.5px] border-[#FF5500] bg-[#FF5500]/10 p-3.5 sm:m-5 sm:mb-0 sm:flex-row sm:items-center">
        <div class="flex-1"><div class="text-sm font-bold text-white">${esc(t('tour_done_title'))}</div><div class="mt-0.5 text-xs text-[#C9CDD6]">${esc(t('tour_done_text'))}</div></div>
        <div class="flex flex-wrap gap-2"><a href="${demoLink('home')}" target="_blank" rel="noopener noreferrer" class="${BTN_P}">${esc(t('tour_done_demo'))} ${ic('open_in_new', 'text-[14px]')}</a><a href="#trial" class="${BTN_S}">${esc(t('tour_done_pilot'))}</a>
        <button type="button" data-a="tour-hide" class="px-1 text-[#8A90A2] hover:text-white cursor-pointer" aria-label="${esc(t('p_close'))}">${ic('close', 'text-[16px]')}</button></div></div>`;
    }
    const items = steps.map(([k, label], i) => {
      const ok = state.tour[k];
      return `<span class="flex items-center gap-1.5 whitespace-nowrap text-[11.5px] ${ok ? 'text-[#34D399]' : 'text-[#C9CDD6]'}">
        <span class="flex h-4 w-4 items-center justify-center rounded-full border font-mono text-[9px] font-bold ${ok ? 'border-[#10B981] bg-[#10B981]/20 text-[#34D399]' : 'border-white/20 text-[#8A90A2]'}">${ok ? '✓' : i + 1}</span>${esc(t(label))}</span>`;
    }).join('<span class="hidden text-[#3A4050] sm:inline">›</span>');
    return `<div class="tr-sb-scroll flex items-center gap-3 overflow-x-auto border-b border-[#1B1E26] bg-[#0D1018] px-3 py-2 sm:px-5">
      <span class="flex-shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-[#FF7733]">${esc(t('tour_title'))} · ${done}/${steps.length}</span>${items}</div>`;
  }

  function renderScreen() {
    switch (state.screen) {
      case 'scanner': return renderScanner();
      case 'bd': return renderBd();
      case 'analytics': return renderAnalytics();
      case 'ats': return renderAts();
      case 'settings': return renderSettings();
      default: return renderHome();
    }
  }

  /* ═══════════════════════ Home ═══════════════════════ */
  function inWindow(r, w) { return w === 1 ? r.age === 0 : r.age < w; }
  function renderHome() {
    const L = lang();
    const h = pragueHour();
    const greet = h < 12 ? t('greet_morning') : h < 18 ? t('greet_afternoon') : t('greet_evening');
    const date = new Intl.DateTimeFormat(L === 'cs' ? 'cs-CZ' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Prague' }).format(new Date());
    const last = h >= 12 ? '12:00' : '06:00';
    const next = h >= 12 ? `${t('tomorrow')} 06:00` : '12:00';
    const w = state.homeWindow;
    const fresh = state.roles.filter((r) => inWindow(r, w));
    const freshClients = fresh.filter((r) => co(r.co).client);
    const core = fresh.filter((r) => r.fit === 'CORE');
    const hiring = new Set(fresh.map((r) => r.co));
    const closed = { 1: 3, 7: 9, 30: 24 }[w];

    const winBtns = [[1, 'w24'], [7, 'w7'], [30, 'w30']].map(([v, k]) => `<button type="button" data-a="home-win" data-v="${v}" class="rounded-md px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${w === v ? 'bg-[#1B1E26] text-white' : 'text-[#8A90A2] hover:text-white'}">${t(k)}</button>`).join('');
    const kpi = (n, label, sub, extra = '') => `<div class="min-w-0 p-3.5 sm:p-4"><div class="flex items-baseline gap-2"><span class="font-mono text-2xl font-bold text-white">${n}</span><span class="text-xs text-[#C9CDD6]">${label}</span>${extra}</div><div class="mt-0.5 text-[11px] text-[#5A6275]">${sub}</div></div>`;

    // Companies with new roles
    const q = state.homeQuery.toLowerCase();
    const groups = { clients: [], prospects: [] };
    hiring.forEach((id) => {
      const c = co(id);
      if (state.homeSeg === 'clients' && !c.client) return;
      if (state.homeSeg === 'prospects' && c.client) return;
      if (q && !c.name.toLowerCase().includes(q)) return;
      const rs = fresh.filter((r) => r.co === id).sort((a, b) => a.age - b.age);
      groups[c.client ? 'clients' : 'prospects'].push({ c, rs });
    });
    Object.values(groups).forEach((g) => g.sort((a, b) => b.rs.length - a.rs.length || a.c.name.localeCompare(b.c.name)));
    const rowsFor = (list) => list.map(({ c, rs }) => {
      const open = !!state.homeOpen[c.id];
      const sub = open ? rs.map((r) => `<button type="button" data-a="role" data-v="${r.id}" class="grid w-full grid-cols-[1fr_auto] items-center gap-2 border-t border-[#1B1E26]/60 bg-[#0B0E14] py-2 pr-3 pl-9 text-left hover:bg-[#151720] cursor-pointer">
          <span class="min-w-0 truncate text-xs text-[#C9CDD6]">${esc(r.title)}</span><span class="flex items-center gap-2">${fitBadge(r.fit)}<span class="hidden font-mono text-[10px] text-[#5A6275] sm:inline">${seenLabel(r.age)}</span></span></button>`).join('') : '';
      const top = rs[0];
      return `<div><button type="button" data-a="home-toggle" data-v="${c.id}" class="grid w-full grid-cols-[1fr_auto] items-center gap-2 px-3 py-2.5 text-left hover:bg-[#151720] sm:grid-cols-[170px_44px_44px_52px_1fr_64px] cursor-pointer">
        <span class="flex min-w-0 items-center gap-1.5">${ic(open ? 'expand_more' : 'chevron_right', 'text-[16px] text-[#5A6275]')}<span class="truncate text-[13px] font-semibold text-white">${esc(c.name)}</span>${c.client ? `<span class="hidden rounded border border-[#FF5500]/40 px-1 font-mono text-[8.5px] text-[#FF7733] sm:inline">${t('client')}</span>` : ''}</span>
        <span class="font-mono text-[13px] font-bold text-white sm:text-center">${rs.length}<span class="text-[11px] font-normal text-[#5A6275] sm:hidden"> ${esc(t('col_new').toLowerCase())}</span></span>
        <span class="hidden text-center font-mono text-[13px] font-bold text-[#FF7733] sm:block">${rs.filter((r) => r.fit === 'CORE').length}</span>
        <span class="hidden text-center font-mono text-xs text-[#8A90A2] sm:block">${c.active}</span>
        <span class="hidden min-w-0 truncate text-xs text-[#C9CDD6] sm:block">${esc(top.title)}</span>
        <span class="hidden text-right font-mono text-[10.5px] text-[#5A6275] sm:block">${seenLabel(top.age)}</span></button>${sub}</div>`;
    }).join('');
    const grp = (key, list) => list.length ? `<div class="border-t border-[#1B1E26] px-3 pt-2.5 pb-1 font-mono text-[9.5px] font-bold tracking-wider text-[#FF5500]">${t(key === 'clients' ? 'grp_clients' : 'grp_prospects')} <span class="text-[#5A6275]">· ${t('companies_n', { n: list.length })} · ${t('roles_n', { n: list.reduce((s, g) => s + g.rs.length, 0) })}</span></div>${rowsFor(list)}` : '';
    const segBtns = [['all', 'all'], ['clients', 'clients'], ['prospects', 'prospects']].map(([v, k]) => `<button type="button" data-a="home-seg" data-v="${v}" class="${CHIP(state.homeSeg === v)}">${t(k)}</button>`).join('');
    const nComp = groups.clients.length + groups.prospects.length;

    const clientsActive = state.companies.filter((c) => c.client).reduce((s, c) => s + c.active, 0);
    const prospActive = state.companies.filter((c) => !c.client).reduce((s, c) => s + c.active, 0);
    const stale = state.roles.filter(isStale);
    const pct = Math.round((clientsActive / (clientsActive + prospActive)) * 100);

    return `
    <div class="space-y-4">
      ${header(`${esc(greet)}, Demo Agency`, esc(t('home_meta', { date, last, next })), `<div class="flex rounded-lg border border-[#1B1E26] bg-[#0F1117] p-0.5">${winBtns}</div><button type="button" data-a="go" data-v="bd" class="${BTN_S}">${esc(t('nav_bd'))} ${ic('arrow_forward', 'text-[15px]')}</button>`)}
      <div class="${CARD} grid grid-cols-2 divide-[#1B1E26] lg:grid-cols-4 lg:divide-x">
        ${kpi(fresh.length, esc(t('kpi_new')), esc(t('kpi_new_sub', { n: freshClients.length })))}
        ${kpi(core.length, esc(t('kpi_core')), esc(t('kpi_core_sub', { n: core.filter((r) => co(r.co).client).length })), fitBadge('CORE'))}
        ${kpi(hiring.size, esc(t('kpi_hiring')), '&nbsp;')}
        ${kpi(closed, esc(t('kpi_closed')), '&nbsp;')}
      </div>
      <div class="grid gap-4 xl:grid-cols-[1fr_250px]">
        <div class="${CARD} min-w-0 overflow-hidden">
          <div class="space-y-2.5 p-3.5">
            <div><div class="${LABEL} text-[#FF5500]">${esc(t('cwn_title'))}</div><div class="mt-0.5 text-[11px] text-[#5A6275]">${esc(t('cwn_sub', { w: t(w === 1 ? 'w24' : w === 7 ? 'w7' : 'w30'), n: hiring.size }))}</div></div>
            <div class="flex flex-wrap items-center gap-1.5">
              <label class="relative"><span class="sr-only">${esc(t('filter_companies'))}</span>${ic('search', 'pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[15px] text-[#5A6275]')}
              <input data-input="home-q" value="${esc(state.homeQuery)}" placeholder="${esc(t('filter_companies'))}" class="w-40 rounded-md border border-[#1B1E26] bg-[#0B0E14] py-1 pr-2 pl-7 text-[11.5px] text-white placeholder:text-[#5A6275] focus:border-[#FF5500] focus:outline-none"></label>${segBtns}
            </div>
          </div>
          <div class="hidden grid-cols-[170px_44px_44px_52px_1fr_64px] gap-2 border-t border-[#1B1E26] px-3 py-2 font-mono text-[9.5px] uppercase tracking-wider text-[#5A6275] sm:grid"><span class="pl-5">${t('col_company')}</span><span class="text-center">${t('col_new')}</span><span class="text-center">${t('col_core')}</span><span class="text-center">${t('col_active')}</span><span>${t('col_top')}</span><span class="text-right">${t('col_last')}</span></div>
          ${nComp ? grp('clients', groups.clients) + grp('prospects', groups.prospects) : `<div class="border-t border-[#1B1E26] py-8 text-center text-xs text-[#8A90A2]">${esc(t('no_companies'))}</div>`}
          <div class="flex items-center justify-end border-t border-[#1B1E26] px-3 py-2.5"><button type="button" data-a="go" data-v="bd" class="flex items-center gap-1 text-xs font-semibold text-[#FF7733] hover:text-white cursor-pointer">${esc(t('see_all_bd'))} ${ic('arrow_forward', 'text-[15px]')}</button></div>
        </div>
        <div class="space-y-3">
          <div class="${CARD} p-3.5"><div class="${LABEL} text-[#8A90A2]">${esc(t('pipe_title'))}</div>
            <div class="mt-2.5 grid grid-cols-2 gap-2"><div class="border-l-2 border-[#FF5500] pl-2.5"><div class="font-mono text-lg font-bold text-white">${fmt(clientsActive)}</div><div class="text-[10.5px] leading-tight text-[#8A90A2]">${esc(t('pipe_clients'))}</div></div>
            <div class="border-l-2 border-[#38BDF8] pl-2.5"><div class="font-mono text-lg font-bold text-white">${fmt(prospActive)}</div><div class="text-[10.5px] leading-tight text-[#8A90A2]">${esc(t('pipe_prospects'))}</div></div></div>
            <div class="mt-3 flex h-1.5 gap-0.5 overflow-hidden rounded-full"><div class="rounded-l-full bg-[#FF5500]" style="width:${pct}%"></div><div class="flex-1 rounded-r-full bg-[#38BDF8]"></div></div>
            <div class="mt-1.5 text-[10.5px] text-[#5A6275]">${esc(t('pipe_total', { n: fmt(clientsActive + prospActive), c: state.companies.length }))}</div></div>
          <div class="${CARD} p-3.5"><div class="${LABEL} flex items-center gap-1.5 text-[#FBBF24]">${ic('warning', 'text-[15px]')}${esc(t('att_title'))}</div>
            <div class="mt-2 text-[13px] font-bold text-white">${esc(t('att_stale', { n: stale.length }))}</div><div class="mt-0.5 text-[11px] leading-relaxed text-[#8A90A2]">${esc(t('att_stale_sub'))}</div>
            <button type="button" data-a="bd-stale" class="mt-2.5 flex items-center gap-1 text-xs font-semibold text-[#FF7733] hover:text-white cursor-pointer">${esc(t('att_show'))} ${ic('arrow_forward', 'text-[15px]')}</button></div>
          <div class="${CARD} p-3.5"><div class="${LABEL} flex items-center gap-1.5 text-[#38BDF8]">${ic('trending_up', 'text-[15px]')}${esc(t('spike_title'))}</div>
            <div class="mt-2 text-[13px] font-bold text-white">${esc(t('spike_text', { co: 'Rohlik.cz', n: state.roles.filter((r) => r.co === 'rohlik' && r.age < 7).length }))}</div><div class="mt-0.5 text-[11px] leading-relaxed text-[#8A90A2]">${esc(t('spike_sub'))}</div></div>
          <div class="hidden xl:block">${openFull('home', 'w-full')}</div>
        </div>
      </div>
    </div>`;
  }

  /* ═══════════════════════ BD Master ═══════════════════════ */
  const QUICK = [['starred', 'q_starred', (r) => r.starred], ['new', 'q_new', (r) => r.age === 0], ['contact', 'q_contact', (r) => r.status === 'CONTACT_PENDING'], ['contacted', 'q_contacted', (r) => r.status === 'CONTACTED'], ['talks', 'q_talks', (r) => r.status === 'IN_PROGRESS'], ['stale', 'q_stale', isStale]];
  function bdFiltered() {
    const q = state.bdQuery.toLowerCase();
    const quick = QUICK.find((x) => x[0] === state.bdQuick);
    return activeRoles().filter((r) => {
      const c = co(r.co);
      if (state.bdSeg === 'clients' && !c.client) return false;
      if (state.bdSeg === 'prospects' && c.client) return false;
      if (state.bdFit !== 'all' && r.fit !== state.bdFit) return false;
      if (state.bdCompany && r.co !== state.bdCompany) return false;
      if (quick && !quick[2](r)) return false;
      if (q && !`${r.title} ${c.name} ${r.loc} ${r.id} ${t('fam_' + r.fam)}`.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => a.age - b.age || a.id.localeCompare(b.id));
  }
  function renderBd() {
    const roles = activeRoles();
    const tabs = [['roles', 'tab_roles', roles.length], ['dir', 'tab_dir', state.companies.length], ['archive', 'tab_archive', ARCHIVED.length]].map(([v, k, n]) => `<button type="button" data-a="bd-tab" data-v="${v}" class="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-1 pb-2 text-[13px] cursor-pointer ${state.bdTab === v ? 'border-[#FF5500] font-semibold text-white' : 'border-transparent text-[#8A90A2] hover:text-white'}">${t(k)}<span class="rounded bg-[#1B1E26] px-1.5 font-mono text-[10px] text-[#8A90A2]">${n}</span></button>`).join('');
    const head = header(esc(t('nav_bd')), `${esc(t('bd_sub', { n: roles.length, c: state.companies.length, t: roles.filter((r) => r.age === 0).length }))}`, openFull('bd'));
    let body = '';
    if (state.bdTab === 'dir') body = renderDirectory();
    else if (state.bdTab === 'archive') body = renderArchive();
    else body = renderRolesTab();
    return `<div class="space-y-3">${head}<div class="tr-sb-scroll flex gap-5 overflow-x-auto border-b border-[#1B1E26]">${tabs}</div>${body}</div>`;
  }
  function renderRolesTab() {
    const roles = activeRoles();
    const list = bdFiltered();
    const quick = QUICK.map(([v, k, fn]) => `<button type="button" data-a="bd-quick" data-v="${v}" class="${CHIP(state.bdQuick === v)}">${v === 'starred' ? ic('star', 'text-[13px]') : ''}${t(k)}<span class="font-mono text-[10px] opacity-70">${roles.filter(fn).length}</span></button>`).join('');
    const seg = [['all', 'all'], ['clients', 'clients'], ['prospects', 'prospects']].map(([v, k]) => `<button type="button" data-a="bd-seg" data-v="${v}" class="${CHIP(state.bdSeg === v)}">${t(k)}</button>`).join('');
    const fit = ['all', 'CORE', 'SELECTIVE'].map((v) => `<button type="button" data-a="bd-fit" data-v="${v}" class="${CHIP(state.bdFit === v)}">${v === 'all' ? `${t('col_fit')}: ${t('all')}` : v}</button>`).join('');
    const companyChip = state.bdCompany ? `<button type="button" data-a="bd-company-clear" class="${CHIP(true)}">${esc(co(state.bdCompany).name)} ${ic('close', 'text-[13px]')}</button>` : '';
    const anyFilter = state.bdQuick || state.bdSeg !== 'all' || state.bdFit !== 'all' || state.bdQuery || state.bdCompany;

    let lastGroup = '';
    const rows = list.map((r) => {
      const g = r.age === 0 ? 'g_today' : r.age === 1 ? 'g_yesterday' : r.age < 7 ? 'g_week' : r.age < 30 ? 'g_month' : 'g_stale';
      let gh = '';
      if (g !== lastGroup) {
        lastGroup = g;
        const n = list.filter((x) => (x.age === 0 ? 'g_today' : x.age === 1 ? 'g_yesterday' : x.age < 7 ? 'g_week' : x.age < 30 ? 'g_month' : 'g_stale') === g).length;
        gh = `<div class="border-t border-[#1B1E26] px-3 pt-2.5 pb-1 font-mono text-[9.5px] font-bold tracking-wider ${g === 'g_stale' ? 'text-[#FBBF24]' : 'text-[#FF5500]'}">${t(g)} · ${n}</div>`;
      }
      const c = co(r.co);
      const sel = state.panel === r.id;
      return `${gh}<div data-a="role" data-v="${r.id}" class="group grid cursor-pointer grid-cols-[22px_1fr_auto] items-center gap-x-2 gap-y-1 border-t border-[#1B1E26]/50 px-3 py-2 transition-colors hover:bg-[#151720] md:grid-cols-[22px_54px_minmax(0,1fr)_150px_120px_76px_86px_70px] ${sel ? 'bg-[#FF5500]/[0.06]' : ''}">
        <button type="button" data-a="star" data-v="${r.id}" class="text-[#5A6275] hover:text-[#FBBF24] cursor-pointer" aria-label="${esc(t('q_starred'))}"><span class="material-symbols-outlined tr-ic text-[17px] ${r.starred ? 'text-[#FBBF24]' : ''}" style="${r.starred ? "font-variation-settings:'FILL' 1" : ''}">star</span></button>
        <span class="hidden font-mono text-[10.5px] text-[#FF7733] md:block">${r.id}</span>
        <span class="min-w-0"><span class="flex items-center gap-1.5"><span class="truncate text-[12.5px] font-semibold text-white group-hover:text-[#FF7733]">${esc(r.title)}</span>${r.fresh ? `<span class="rounded bg-[#10B981]/20 px-1 font-mono text-[8.5px] font-bold text-[#34D399]">+1</span>` : ''}<span class="hidden flex-shrink-0 rounded bg-[#1B1E26] px-1.5 py-px text-[9.5px] text-[#8A90A2] xl:inline">${esc(t('fam_' + r.fam))}</span></span>
          <span class="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#8A90A2] md:hidden">${typeBadge(c)}${esc(c.name)} · ${esc(r.loc)}</span></span>
        <span class="hidden min-w-0 items-center gap-1.5 md:flex">${typeBadge(c)}<span class="truncate text-xs text-[#C9CDD6]">${esc(c.name)}</span></span>
        <span class="hidden truncate text-[11.5px] text-[#8A90A2] md:block">${esc(r.loc)}</span>
        <span class="hidden md:block">${fitBadge(r.fit)}</span>
        <span class="flex flex-col items-end gap-1 md:block">${statusBadge(r.status)}<span class="md:hidden">${fitBadge(r.fit)}</span></span>
        <span class="hidden text-right font-mono text-[10.5px] md:block ${isStale(r) ? 'text-[#FBBF24]' : 'text-[#8A90A2]'}">${seenLabel(r.age)}</span>
      </div>`;
    }).join('');

    return `<div class="space-y-2.5">
      <div class="tr-sb-scroll flex gap-1.5 overflow-x-auto pb-0.5">${quick}</div>
      <div class="flex flex-col gap-2 xl:flex-row xl:items-center">
        <label class="relative xl:w-64"><span class="sr-only">${esc(t('search_roles'))}</span>${ic('search', 'pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#5A6275]')}
          <input data-input="bd-q" value="${esc(state.bdQuery)}" placeholder="${esc(t('search_roles'))}" class="w-full rounded-lg border border-[#1B1E26] bg-[#0F1117] py-1.5 pr-2 pl-8 text-xs text-white placeholder:text-[#5A6275] focus:border-[#FF5500] focus:outline-none"></label>
        <div class="flex flex-1 flex-wrap items-center gap-1.5">${seg}<span class="mx-0.5 h-4 w-px bg-[#1B1E26]"></span>${fit}${companyChip}</div>
        <button type="button" data-a="export" class="${BTN_S} self-start">${ic('download', 'text-[15px]')}${esc(t('export_csv'))}</button>
      </div>
      <div class="${CARD} overflow-hidden">
        <div class="hidden grid-cols-[22px_54px_minmax(0,1fr)_150px_120px_76px_86px_70px] gap-x-2 px-3 py-2 font-mono text-[9.5px] uppercase tracking-wider text-[#5A6275] md:grid">
          <span>${ic('star', 'text-[14px]')}</span><span>${t('col_ref')}</span><span>${t('col_role')}</span><span>${t('col_company')} <span class="normal-case">C/P</span></span><span>${t('col_location')}</span><span>${t('col_fit')}</span><span>${t('col_status')}</span><span class="text-right">${t('col_seen')}</span></div>
        ${list.length ? rows : `<div class="border-t border-[#1B1E26] py-10 text-center text-xs text-[#8A90A2]">${esc(t('no_roles'))}${anyFilter ? ` <button type="button" data-a="bd-clear" class="ml-1 font-semibold text-[#FF7733] hover:text-white cursor-pointer">${esc(t('clear_filters'))}</button>` : ''}</div>`}
      </div></div>`;
  }
  function renderDirectory() {
    const rows = [...state.companies].sort((a, b) => Number(b.client) - Number(a.client) || b.active - a.active).map((c) => {
      const n7 = state.roles.filter((r) => r.co === c.id && r.age < 7).length;
      return `<div class="grid grid-cols-[1fr_auto] items-center gap-2 border-t border-[#1B1E26]/60 px-3 py-2.5 md:grid-cols-[minmax(0,1fr)_90px_110px_80px_80px_110px]">
        <span class="flex min-w-0 items-center gap-2">${typeBadge(c)}<span class="min-w-0"><span class="block truncate text-[13px] font-semibold text-white">${esc(c.name)}</span><span class="block truncate font-mono text-[10.5px] text-[#5A6275]">${esc(c.domain)}</span></span></span>
        <span class="hidden text-[11px] text-[#8A90A2] md:block">${esc(c.client ? t('client') : t('prospect'))}</span>
        <span class="hidden md:block">${atsBadge(c.ats)}</span>
        <span class="hidden text-center font-mono text-xs text-white md:block">${c.active}</span>
        <span class="hidden text-center font-mono text-xs md:block ${n7 ? 'text-[#34D399]' : 'text-[#5A6275]'}">${n7 ? '+' + n7 : '0'}</span>
        <button type="button" data-a="bd-company" data-v="${c.id}" class="justify-self-end text-xs font-semibold text-[#FF7733] hover:text-white cursor-pointer">${esc(t('show_roles'))} →</button></div>`;
    }).join('');
    return `<p class="text-xs text-[#8A90A2]">${esc(t('dir_sub'))}</p><div class="${CARD} overflow-hidden">
      <div class="hidden grid-cols-[minmax(0,1fr)_90px_110px_80px_80px_110px] gap-2 px-3 py-2 font-mono text-[9.5px] uppercase tracking-wider text-[#5A6275] md:grid"><span>${t('col_company')}</span><span>${t('col_type')}</span><span>${t('col_ats')}</span><span class="text-center">${t('col_active')}</span><span class="text-center">${t('col_new7')}</span><span></span></div>${rows}</div>`;
  }
  function renderArchive() {
    const rows = ARCHIVED.map(([title, cid, closedAgo, openFor]) => `<div class="grid grid-cols-[1fr_auto] items-center gap-2 border-t border-[#1B1E26]/60 px-3 py-2.5 md:grid-cols-[minmax(0,1fr)_150px_100px_100px]">
      <span class="min-w-0"><span class="block truncate text-[12.5px] text-[#C9CDD6] line-through decoration-[#5A6275]">${esc(title)}</span><span class="block text-[11px] text-[#5A6275] md:hidden">${esc(co(cid).name)}</span></span>
      <span class="hidden truncate text-xs text-[#8A90A2] md:block">${esc(co(cid).name)}</span>
      <span class="font-mono text-[10.5px] text-[#8A90A2]">${esc(t('days_ago', { n: closedAgo }))}</span>
      <span class="hidden font-mono text-[10.5px] text-[#5A6275] md:block">${openFor} d</span></div>`).join('');
    return `<p class="text-xs text-[#8A90A2]">${esc(t('arch_sub'))}</p><div class="${CARD} overflow-hidden">
      <div class="hidden grid-cols-[minmax(0,1fr)_150px_100px_100px] gap-2 px-3 py-2 font-mono text-[9.5px] uppercase tracking-wider text-[#5A6275] md:grid"><span>${t('col_role')}</span><span>${t('col_company')}</span><span>${t('col_closed')}</span><span>${t('col_open_for')}</span></div>${rows}</div>`;
  }

  /* ── Role panel ── */
  const panelList = () => (state.screen === 'bd' ? bdFiltered() : [...state.roles].sort((a, b) => a.age - b.age || a.id.localeCompare(b.id)));
  function roleText(r) {
    const L = lang();
    const c = co(r.co);
    const f = FAM[r.fam];
    const summary = L === 'cs'
      ? `${c.name} (${c.ctx.cs}) hledá na pozici ${r.title} do lokality ${r.loc}. ${f.sum.cs}`
      : `${c.name} (${c.ctx.en}) is hiring a ${r.title} in ${r.loc}. ${f.sum.en}`;
    const n7 = state.roles.filter((x) => x.co === r.co && x.age < 7).length;
    let hook;
    if (isStale(r)) hook = L === 'cs' ? `Role je otevřená ${r.age} dní a interní tým ${c.name} ji neobsadil. Nabídněte shortlist tří prověřených kandidátů do týdne.` : `Open ${r.age} days and ${c.name}'s in-house team has not filled it. Offer a shortlist of three pre-qualified candidates within a week.`;
    else if (n7 >= 3) hook = L === 'cs' ? `${c.name} otevřel za týden ${n7} role, nábor zrychluje. Nabídněte spolupráci na více pozic najednou.` : `${c.name} opened ${n7} roles this week, a hiring push. Pitch a multi-role engagement.`;
    else if (c.client) hook = L === 'cs' ? `Čerstvá role u stávajícího klienta. Zavolejte kontaktu dřív, než se dostane na pracovní portály; podmínky už máte podepsané.` : `A fresh role at an existing client. Call your contact before it reaches the job boards; your terms are already signed.`;
    else hook = L === 'cs' ? `${c.name} zatím není klient. Konkrétní a čerstvá role je teplý důvod oslovit hiring managera ještě tento týden.` : `${c.name} is not a client yet. A specific, fresh role is the warm reason to reach the hiring manager this week.`;
    const fitWhy = r.fit === 'CORE'
      ? (L === 'cs' ? `Rodina „${t('fam_' + r.fam)}“ je ve vašem CORE profilu a lokalita ${r.loc} je hlavní trh.` : `The ${t('fam_' + r.fam)} family is in your CORE profile and ${r.loc} is a core market.`)
      : (L === 'cs' ? `Rodina „${t('fam_' + r.fam)}“ je v profilu jako SELECTIVE, obsazujete ji jen občas.` : `The ${t('fam_' + r.fam)} family is SELECTIVE in your profile: you place it only sometimes.`);
    return { summary, hook, fitWhy, req: f.req[L], hm: f.hm };
  }
  function renderPanel() {
    if (!state.panel) return '';
    const r = state.roles.find((x) => x.id === state.panel);
    if (!r) return '';
    const c = co(r.co);
    const L = lang();
    const tx = roleText(r);
    const list = panelList();
    const idx = list.findIndex((x) => x.id === r.id);
    const job = state.jobs.find((j) => j.roleId === r.id);
    const tabs = [['overview', 'pt_overview'], ['hm', 'pt_hm'], ['notes', 'pt_notes'], ['history', 'pt_history']].map(([v, k]) => `<button type="button" data-a="ptab" data-v="${v}" class="border-b-2 pb-2 text-[12.5px] whitespace-nowrap cursor-pointer ${state.panelTab === v ? 'border-[#FF5500] font-semibold text-white' : 'border-transparent text-[#8A90A2] hover:text-white'}">${t(k)}${v === 'notes' && r.notes.length ? ` <span class="font-mono text-[10px] text-[#FF7733]">${r.notes.length}</span>` : ''}</button>`).join('');
    const statusOpts = ROLE_STATUSES.map((s) => `<option value="${s}" ${s === r.status ? 'selected' : ''}>${esc(t('st_' + s))}</option>`).join('');
    const seenAt = r.age === 0 ? (pragueHour() >= 12 ? '12:00' : '06:00') : '06:00';

    let body = '';
    if (state.panelTab === 'hm') {
      body = `<div class="${LABEL} text-[#FF5500]">${esc(t('hm_title'))}</div><p class="mt-1 text-[11.5px] leading-relaxed text-[#8A90A2]">${esc(t('hm_sub'))}</p>
        <div class="mt-3 space-y-2">${tx.hm.map((hm, i) => {
          const li = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${hm} ${c.name}`)}`;
          const xr = `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in "${hm}" "${c.name}"`)}`;
          return `<div class="${CARD} flex flex-col gap-2 p-3 sm:flex-row sm:items-center"><div class="flex-1"><div class="text-[13px] font-bold text-white">${esc(hm)}</div><div class="text-[11px] text-[#5A6275]">${esc(c.name)}${i === 0 ? ` · <span class="text-[#34D399]">${L === 'cs' ? 'nejpravděpodobnější' : 'most likely'}</span>` : ''}</div></div>
            <div class="flex gap-1.5"><a href="${li}" target="_blank" rel="noopener noreferrer" class="${i === 0 ? BTN_P : BTN_S}">${ic('person_search', 'text-[15px]')}${esc(t('hm_linkedin'))}</a><a href="${xr}" target="_blank" rel="noopener noreferrer" class="${BTN_S}">${ic('travel_explore', 'text-[15px]')}${esc(t('hm_xray'))}</a></div></div>`;
        }).join('')}</div><p class="mt-3 text-[11px] text-[#5A6275]">${esc(t('hm_save'))}</p>`;
    } else if (state.panelTab === 'notes') {
      const notes = r.notes.map((n) => `<div class="${CARD} p-3"><div class="flex items-center gap-2"><span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B1E26] font-mono text-[10px] font-bold text-[#FF7733]">${esc(n.by[0])}</span><span class="text-xs font-semibold text-white">${esc(n.by === 'you' ? t('you') : n.by)}</span><span class="font-mono text-[10px] text-[#5A6275]">${esc(n.at[L] || n.at)}</span></div>
        <p class="mt-1.5 text-[12.5px] leading-relaxed text-[#C9CDD6]">${esc(n.text[L] || n.text).replace(/(@\S+)/g, '<span class="font-semibold text-[#FF7733]">$1</span>')}</p></div>`).join('');
      body = `<div class="space-y-2">${notes || `<p class="text-xs text-[#8A90A2]">${esc(t('notes_empty'))}</p>`}</div>
        <form data-form="note" class="mt-3 flex gap-2"><input name="note" maxlength="300" autocomplete="off" placeholder="${esc(t('note_ph'))}" class="min-w-0 flex-1 rounded-lg border border-[#1B1E26] bg-[#0F1117] px-3 py-1.5 text-xs text-white placeholder:text-[#5A6275] focus:border-[#FF5500] focus:outline-none"><button type="submit" class="${BTN_P}">${esc(t('note_add'))}</button></form>`;
    } else if (state.panelTab === 'history') {
      const items = [{ text: t('h_seen', { t: seenAt }), at: seenLabel(r.age) }, ...r.history.map((h) => ({ text: h.text(), at: L === 'cs' ? 'právě teď' : 'just now' }))].reverse();
      body = `<ol class="relative space-y-3 border-l border-[#1B1E26] pl-4">${items.map((h) => `<li class="relative"><span class="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0B0E14] bg-[#FF5500]"></span><div class="text-[12.5px] text-white">${esc(h.text)}</div><div class="font-mono text-[10px] text-[#5A6275]">${esc(h.at)}</div></li>`).join('')}</ol>`;
    } else {
      body = `<div class="rounded-xl border border-[#1B1E26] bg-[#0F1117] p-3.5"><div class="flex items-center justify-between"><span class="${LABEL} text-[#FF5500]">${esc(t('ai_summary'))}</span><span class="font-mono text-[9.5px] text-[#5A6275]">${esc(t('ai_generated'))}</span></div><p class="mt-2 text-[12.5px] leading-relaxed text-[#E4E6EB]">${esc(tx.summary)}</p></div>
        <div class="mt-4"><div class="${LABEL} text-[#8A90A2]">${esc(t('key_req'))}</div><ul class="mt-2 space-y-1.5">${tx.req.map((q) => `<li class="flex gap-2 text-[12.5px] leading-snug text-[#C9CDD6]"><span class="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FF5500]"></span>${esc(q)}</li>`).join('')}</ul></div>
        <div class="mt-4 rounded-xl border-[1.5px] border-[#FF5500]/60 bg-[#FF5500]/[0.07] p-3.5"><div class="${LABEL} text-[#FF7733]">${esc(t('bd_hook'))}</div><p class="mt-1.5 text-[12.5px] leading-relaxed text-white">${esc(tx.hook)}</p></div>
        <div class="mt-4"><div class="${LABEL} text-[#8A90A2]">${esc(t('fit_reason'))}</div><p class="mt-1.5 flex items-start gap-2 text-[12.5px] leading-relaxed text-[#C9CDD6]">${fitBadge(r.fit)}<span>${esc(tx.fitWhy)}</span></p></div>`;
    }

    return `<div class="fixed inset-0 z-[60] flex justify-end bg-black/55 backdrop-blur-[1px] lg:absolute lg:z-30" data-a="panel-bg">
      <div class="tr-sb-scroll flex h-full w-full max-w-[460px] flex-col overflow-y-auto border-l border-[#1B1E26] bg-[#0B0E14] shadow-2xl" data-stop="1" role="dialog" aria-label="${esc(r.title)}">
        <div class="sticky top-0 z-10 flex items-center gap-2 border-b border-[#1B1E26] bg-[#0B0E14] px-4 py-2.5">
          <button type="button" data-a="pnav" data-v="-1" class="rounded-md border border-[#1B1E26] p-1 text-[#8A90A2] hover:text-white disabled:opacity-30 cursor-pointer" ${idx <= 0 ? 'disabled' : ''} aria-label="Previous">${ic('arrow_back', 'text-[16px]')}</button>
          <span class="font-mono text-[11px] text-[#8A90A2]">${esc(t('p_of', { n: idx + 1, total: list.length }))}</span>
          <button type="button" data-a="pnav" data-v="1" class="rounded-md border border-[#1B1E26] p-1 text-[#8A90A2] hover:text-white disabled:opacity-30 cursor-pointer" ${idx >= list.length - 1 ? 'disabled' : ''} aria-label="Next">${ic('arrow_forward', 'text-[16px]')}</button>
          <button type="button" data-a="pclose" class="ml-auto rounded-md p-1 text-[#8A90A2] hover:text-white cursor-pointer" aria-label="${esc(t('p_close'))}">${ic('close', 'text-[18px]')}</button></div>
        <div class="px-4 pt-3.5">
          <div class="flex flex-wrap items-center gap-1.5"><span class="font-mono text-[11px] text-[#FF7733]">${r.id}</span>${statusBadge(r.status)}${fitBadge(r.fit)}${isStale(r) ? `<span class="rounded border border-[#FBBF24]/40 bg-[#FBBF24]/10 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-[#FBBF24]">${esc(t('open_days', { n: r.age }))}</span>` : ''}</div>
          <h4 class="mt-1.5 text-lg font-bold leading-snug text-white">${esc(r.title)}</h4>
          <div class="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#C9CDD6]"><span class="font-semibold">${esc(c.name)}</span>${c.client ? `<span class="rounded border border-[#FF5500]/40 px-1 font-mono text-[8.5px] text-[#FF7733]">${t('client')}</span>` : `<span class="rounded border border-[#38BDF8]/40 px-1 font-mono text-[8.5px] text-[#38BDF8]">${t('prospect')}</span>`}<span class="text-[#8A90A2]">${esc(r.loc)} · ${esc(t('mode_' + r.mode.replace('-', '')))}</span></div>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <label class="flex items-center gap-1.5 rounded-lg border-[1.5px] border-[#FF5500] bg-[#FF5500]/[0.08] py-1 pr-1 pl-2.5 text-xs font-bold text-white"><span>${esc(t('p_status'))}</span>
              <select data-input="status" class="cursor-pointer rounded bg-transparent font-mono text-[11px] text-[#FF7733] focus:outline-none">${statusOpts}</select></label>
            <a href="${esc(c.careers)}" target="_blank" rel="noopener noreferrer" class="${BTN_S}">${ic('open_in_new', 'text-[15px]')}${esc(t('p_posting'))}</a>
            ${state.modules.ats ? (job ? `<button type="button" data-a="go-job" data-v="${job.id}" class="${BTN_S} border-[#10B981]/50 text-[#34D399]">${ic('check_circle', 'text-[15px]')}${esc(t('p_mandate_done'))} · ${job.id}</button>` : `<button type="button" data-a="mandate" data-v="${r.id}" class="${BTN_P}">${ic('work', 'text-[15px]')}${esc(t('p_mandate'))}<span class="rounded border border-[#FBBF24]/40 px-1 font-mono text-[8.5px] text-[#FBBF24]">${t('beta')}</span></button>`) : ''}
          </div>
          <div class="tr-sb-scroll mt-4 flex gap-4 overflow-x-auto border-b border-[#1B1E26]">${tabs}</div>
        </div>
        <div class="flex-1 px-4 py-4">${body}</div>
        <div class="border-t border-[#1B1E26] px-4 py-2.5 font-mono text-[10px] text-[#5A6275]">${esc(t('seen_meta', { d: r.age >= 30 ? t('days_ago', { n: r.age }) : seenLabel(r.age).toLowerCase(), ats: atsName(c.ats), loc: r.loc }))}</div>
      </div></div>`;
  }

  /* ═══════════════════════ Scanner ═══════════════════════ */
  function renderScanner() {
    const n = state.companies.length;
    const run = state.scanRun;
    const tabs = [['companies', 'sc_tab_companies'], ['schedule', 'sc_tab_schedule']].map(([v, k]) => `<button type="button" data-a="sc-tab" data-v="${v}" class="border-b-2 px-1 pb-2 text-[13px] cursor-pointer ${state.scTab === v ? 'border-[#FF5500] font-semibold text-white' : 'border-transparent text-[#8A90A2] hover:text-white'}">${t(k)}${v === 'companies' ? ` (${n})` : ''}</button>`).join('');
    const head = header(esc(t('nav_scanner')), esc(t('sc_sub', { n })), openFull('scanner'));
    if (state.scTab === 'schedule') return `<div class="space-y-3">${head}<div class="flex gap-5 border-b border-[#1B1E26]">${tabs}</div>${renderSchedule()}</div>`;

    const h = pragueHour();
    const times = { 1: ['06:00'], 2: ['06:00', '12:00'], 4: ['06:00', '10:00', '14:00', '18:00'] }[state.scanFreq];
    const nextT = times.find((x) => Number(x.slice(0, 2)) > h);
    const nextWhen = nextT ? (lang() === 'cs' ? 'Dnes' : 'Today') : (lang() === 'cs' ? 'Zítra' : 'Tomorrow');
    const lastT = [...times].reverse().find((x) => Number(x.slice(0, 2)) <= h) || times[times.length - 1];
    const freq = t(state.scanFreq === 1 ? 'f1' : state.scanFreq === 2 ? 'f2' : 'f4');
    const pctCredits = Math.round((state.credits / 500) * 100);
    const card = (label, icon, inner) => `<div class="${CARD} p-3.5"><div class="flex items-center justify-between"><span class="${LABEL} text-[#8A90A2]">${esc(label)}</span>${ic(icon, 'text-[17px] text-[#5A6275]')}</div>${inner}</div>`;

    let runBox = '';
    if (run && !run.done) {
      const cur = state.companies[Math.min(run.i, n - 1)];
      runBox = `<div class="rounded-xl border-[1.5px] border-[#FF5500] bg-[#FF5500]/[0.08] p-3.5"><div class="flex items-center gap-2 text-[13px] font-bold text-white"><span class="tr-spin inline-block h-3.5 w-3.5 rounded-full border-2 border-[#FF5500] border-t-transparent"></span>${esc(t('sc_run_title', { n }))}</div>
        <div class="mt-1 font-mono text-[11px] text-[#C9CDD6]">${esc(t('sc_run_now', { co: cur.name, ats: atsName(cur.ats) }))}</div>
        <div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#1B1E26]"><div class="h-full rounded-full bg-[#FF5500] transition-all duration-200" style="width:${Math.round((run.i / n) * 100)}%"></div></div></div>`;
    } else if (run && run.done) {
      runBox = `<div class="flex flex-col gap-3 rounded-xl border-[1.5px] border-[#10B981]/60 bg-[#10B981]/[0.08] p-3.5 sm:flex-row sm:items-center"><div class="flex-1"><div class="flex items-center gap-1.5 text-[13px] font-bold text-white">${ic('check_circle', 'text-[17px] text-[#34D399]')}${esc(t('sc_done_title', { s: run.secs }))}</div>
        <div class="mt-0.5 font-mono text-[11px] text-[#C9CDD6]">${esc(t('sc_done_text', { n: run.found, a: 1, c: n }))}</div></div>
        <button type="button" data-a="sc-view-new" class="${BTN_P}">${esc(t('sc_done_view'))} ${ic('arrow_forward', 'text-[15px]')}</button></div>`;
    }

    const q = state.scQuery.toLowerCase();
    const rows = state.companies.filter((c) => !q || `${c.name} ${c.domain} ${c.careers}`.toLowerCase().includes(q)).map((c) => {
      const busy = c.scan === 'busy';
      const action = c.scan === 'queued' ? `<span class="font-mono text-[10px] text-[#FBBF24]">${esc(t('sc_queued'))}</span>`
        : `<button type="button" data-a="sc-one" data-v="${c.id}" class="rounded-md border border-white/[0.12] px-2.5 py-1 text-[11px] font-semibold text-white hover:border-[#FF5500] disabled:opacity-50 cursor-pointer" ${busy || (run && !run.done) || state.credits <= 0 ? 'disabled' : ''}>${busy ? `<span class="tr-spin mr-1 inline-block h-2.5 w-2.5 rounded-full border-2 border-[#FF5500] border-t-transparent align-[-1px]"></span>${esc(t('sc_scanning'))}` : esc(t('sc_scan'))}</button>`;
      return `<div class="grid grid-cols-[1fr_auto] items-center gap-2 border-t border-[#1B1E26]/60 px-3 py-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_70px_70px_60px_96px_76px]">
        <span class="min-w-0"><span class="block truncate text-[12.5px] font-semibold text-white">${esc(c.name)}</span><span class="block truncate font-mono text-[10px] text-[#5A6275]">${esc(c.domain)}</span></span>
        <span class="hidden min-w-0 items-center gap-1.5 md:flex"><span class="truncate font-mono text-[10.5px] text-[#8A90A2]">${esc(c.careers.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</span>${atsBadge(c.ats)}</span>
        <span class="hidden text-right font-mono text-xs text-white md:block">${c.active}</span>
        <span class="hidden md:block">${typeBadge(c)}</span>
        <span class="hidden text-[11px] text-[#34D399] md:block">${esc(t('on'))}</span>
        <span class="hidden font-mono text-[10.5px] text-[#8A90A2] md:block">${c.scan === 'queued' ? '—' : (c.scannedNow ? (lang() === 'cs' ? 'právě teď' : 'just now') : `${lang() === 'cs' ? 'dnes' : 'today'} ${lastT}`)}</span>
        <span class="justify-self-end">${action}</span></div>`;
    }).join('');

    return `<div class="space-y-3">${head}<div class="flex gap-5 border-b border-[#1B1E26]">${tabs}</div>
      <div class="grid gap-3 md:grid-cols-3">
        ${card(t('sc_next'), 'schedule', `<div class="mt-2 text-lg font-bold text-white">${esc(t('sc_next_v', { when: nextWhen, time: nextT || times[0] }))}</div><div class="text-[11px] text-[#8A90A2]">${esc(t('sc_tz', { freq, n }))}</div><button type="button" data-a="sc-tab" data-v="schedule" class="mt-2 flex items-center gap-1 text-xs font-semibold text-[#FF7733] hover:text-white cursor-pointer">${esc(t('sc_change'))} ${ic('arrow_forward', 'text-[14px]')}</button>`)}
        ${card(t('sc_last'), 'history', `<div class="mt-2 text-lg font-bold text-white">${esc(state.scanned ? (lang() === 'cs' ? 'Právě teď' : 'Just now') : `${lang() === 'cs' ? 'Dnes' : 'Today'} ${lastT}`)}</div><div class="text-[11px] text-[#8A90A2]">${esc(t('sc_last_v', { time: '', n, s: state.scanned ? state.scanRun.secs : 38 }).replace(/^ · /, ''))}</div><div class="mt-2 text-[11px] text-[#34D399]">${esc(t('sc_all_ok'))}</div>`)}
        ${card(t('sc_credits'), 'bolt', `<div class="mt-2 flex items-baseline justify-between"><span class="font-mono text-lg font-bold text-white">${state.credits} / 500</span><span class="font-mono text-[10px] font-bold text-[#FF5500]">${pctCredits}% ${esc(t('avail'))}</span></div><div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1B1E26]"><div class="h-full rounded-full bg-[#FF5500]" style="width:${pctCredits}%"></div></div><div class="mt-1.5 text-[10.5px] text-[#5A6275]">${esc(t('sc_credit_note'))}</div>`)}
      </div>
      ${runBox}
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label class="relative flex-1 sm:max-w-xs"><span class="sr-only">${esc(t('sc_search'))}</span>${ic('search', 'pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#5A6275]')}
          <input data-input="sc-q" value="${esc(state.scQuery)}" placeholder="${esc(t('sc_search'))}" class="w-full rounded-lg border border-[#1B1E26] bg-[#0F1117] py-1.5 pr-2 pl-8 text-xs text-white placeholder:text-[#5A6275] focus:border-[#FF5500] focus:outline-none"></label>
        <button type="button" data-a="sc-all" class="${BTN_P} sm:ml-auto disabled:cursor-not-allowed disabled:opacity-50" ${(run && !run.done) || state.credits < n ? 'disabled' : ''}>${ic('refresh', 'text-[15px]')}${esc(t('sc_scan_all', { n }))}</button>
      </div>
      <div class="${CARD} overflow-hidden">
        <div class="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_70px_70px_60px_96px_76px] gap-2 px-3 py-2 font-mono text-[9.5px] uppercase tracking-wider text-[#5A6275] md:grid"><span>${t('col_company')}</span><span>${t('col_careers')}</span><span class="text-right">${t('col_roles')}</span><span>${t('col_type')}</span><span>${t('col_auto')}</span><span>${t('col_lastscan')}</span><span></span></div>${rows}
      </div>
      <form data-form="add-company" class="${CARD} p-3.5"><div class="${LABEL} text-[#8A90A2]">${esc(t('sc_add_title'))}</div>
        <div class="mt-2 flex flex-col gap-2 sm:flex-row"><input name="url" autocomplete="off" placeholder="${esc(t('sc_add_ph'))}" class="min-w-0 flex-1 rounded-lg border border-[#1B1E26] bg-[#0B0E14] px-3 py-1.5 text-xs text-white placeholder:text-[#5A6275] focus:border-[#FF5500] focus:outline-none"><button type="submit" class="${BTN_S}">${ic('add', 'text-[15px]')}${esc(t('sc_add_btn'))}</button></div>
        ${state.addMsg ? `<div class="mt-2 text-[11.5px] ${state.addMsg.ok ? 'text-[#34D399]' : 'text-[#FBBF24]'}">${esc(state.addMsg.text)}</div>` : ''}</form>
    </div>`;
  }
  function renderSchedule() {
    const opts = [[1, 'f1', 'f1_t'], [2, 'f2', 'f2_t'], [4, 'f4', 'f4_t']].map(([v, k, kt]) => `<button type="button" data-a="sc-freq" data-v="${v}" class="flex w-full items-center gap-3 rounded-xl border p-3 text-left cursor-pointer ${state.scanFreq === v ? 'border-[#FF5500] bg-[#FF5500]/[0.08]' : 'border-[#1B1E26] bg-[#0F1117] hover:border-white/20'}">
      <span class="flex h-4 w-4 items-center justify-center rounded-full border-2 ${state.scanFreq === v ? 'border-[#FF5500]' : 'border-[#5A6275]'}">${state.scanFreq === v ? '<span class="h-1.5 w-1.5 rounded-full bg-[#FF5500]"></span>' : ''}</span>
      <span class="flex-1"><span class="block text-[13px] font-bold text-white">${esc(t(k))}</span><span class="block font-mono text-[11px] text-[#8A90A2]">${esc(t(kt))} · Europe/Prague</span></span>
      ${v === 4 ? `<span class="rounded border border-white/15 px-1.5 py-0.5 font-mono text-[9.5px] text-[#C9CDD6]">${esc(t('f4_tag'))}</span>` : ''}</button>`).join('');
    return `<div class="${CARD} p-4"><div class="text-sm font-bold text-white">${esc(t('sched_title'))}</div><p class="mt-0.5 text-xs text-[#8A90A2]">${esc(t('sched_sub'))}</p><div class="mt-3 grid gap-2 sm:grid-cols-3">${opts}</div></div>`;
  }

  /* ═══════════════════════ Analytics ═══════════════════════ */
  function renderAnalytics() {
    const w = state.anWindow;
    const total = state.companies.reduce((s, c) => s + c.active, 0);
    const prog = state.roles.filter((r) => ['CONTACT_PENDING', 'CONTACTED', 'IN_PROGRESS'].includes(r.status)).length;
    const coreN = Math.round(total * 0.41);
    const velocity = w === 7 ? state.roles.filter((r) => r.age < 7).length + 38 : 167;
    const tile = (label, icon, big, sub) => `<div class="${CARD} p-3.5"><div class="flex items-center justify-between"><span class="${LABEL} text-[#8A90A2]">${esc(label)}</span>${ic(icon, 'text-[17px] text-[#5A6275]')}</div><div class="mt-2 font-mono text-2xl font-bold text-white">${big}</div><div class="text-[11px] text-[#5A6275]">${esc(sub)}</div></div>`;
    const stack = [['Python / Data / ML', 132], ['Java / Kotlin', 96], ['.NET / C#', 71], ['DevOps / Cloud / SRE', 64], ['React / TypeScript', 58], ['Go', 23], ['C++ / Systems', 19]].map(([k, v]) => [k, w === 7 ? v : Math.round(v * 1.8)]);
    const max = stack[0][1];
    const bars = stack.map(([k, v]) => `<div data-tip="${esc(k)}: ${v} ${esc(t('roles_word'))}" class="group cursor-default"><div class="flex items-center justify-between text-xs"><span class="text-[#C9CDD6]">${esc(k)}</span><span class="font-mono text-[11px] text-white">${v}</span></div>
      <div class="mt-1 h-2 rounded-full bg-[#1B1E26]"><div class="h-full rounded-[4px] bg-[#FF5500] transition-opacity group-hover:opacity-80" style="width:${Math.max(3, (v / max) * 100)}%"></div></div></div>`).join('');
    const top = [...state.companies].sort((a, b) => b.active - a.active).slice(0, 6);
    const topMax = top[0].active;
    const tops = top.map((c, i) => `<div data-tip="${esc(c.name)}: ${c.active} ${esc(t('roles_word'))}" class="group cursor-default"><div class="flex items-center gap-2 text-xs"><span class="w-6 font-mono text-[10px] text-[#5A6275]">#${String(i + 1).padStart(2, '0')}</span><span class="font-semibold text-white">${esc(c.name)}</span>${c.client ? `<span class="rounded border border-[#FF5500]/40 px-1 font-mono text-[8.5px] text-[#FF7733]">${t('client')}</span>` : ''}<span class="ml-auto font-mono text-[11px] text-white">${c.active}</span></div>
      <div class="mt-1 ml-8 h-1.5 rounded-full bg-[#1B1E26]"><div class="h-full rounded-[4px] bg-[#FF5500]/80 group-hover:bg-[#FF5500]" style="width:${(c.active / topMax) * 100}%"></div></div></div>`).join('');
    const daily = [9, 14, 6, 11, 17, 4, 3, 12, 19, 8, 13, 22, 5, 6];
    const dMax = Math.max(...daily);
    const L = lang();
    const dayLabel = (i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return new Intl.DateTimeFormat(L === 'cs' ? 'cs-CZ' : 'en-GB', { day: 'numeric', month: 'numeric' }).format(d); };
    const cols = daily.map((v, i) => `<div data-tip="${esc(dayLabel(i))}: ${v} ${esc(t('roles_word'))}" class="group flex h-full flex-1 cursor-default flex-col justify-end"><div class="rounded-t-[4px] bg-[#FF5500]/75 group-hover:bg-[#FF5500]" style="height:${(v / dMax) * 100}%"></div></div>`).join('');
    const winBtns = [[7, 'w7'], [30, 'w30']].map(([v, k]) => `<button type="button" data-a="an-win" data-v="${v}" class="rounded-md px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${w === v ? 'bg-[#1B1E26] text-white' : 'text-[#8A90A2] hover:text-white'}">${t(k)}</button>`).join('');
    return `<div class="space-y-3">${header(esc(t('an_title')), esc(t('an_sub')), `<div class="flex rounded-lg border border-[#1B1E26] bg-[#0F1117] p-0.5">${winBtns}</div>${openFull('analytics')}`)}
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        ${tile(t('an_total'), 'visibility', fmt(total), t('an_total_sub', { n: state.companies.length }))}
        ${tile(t('an_progress'), 'pending_actions', prog, t('an_progress_sub'))}
        ${tile(t('an_ratio'), 'verified', '41%', t('an_ratio_sub', { n: fmt(coreN) }))}
        ${tile(t('an_velocity'), 'trending_up', '+' + velocity, t('an_velocity_sub', { w: t(w === 7 ? 'w7' : 'w30') }))}
      </div>
      <div class="grid gap-3 lg:grid-cols-2">
        <div class="${CARD} p-4"><div class="${LABEL} text-white">${esc(t('an_stack'))}</div><div class="mb-3 text-[11px] text-[#5A6275]">${esc(t('an_stack_sub'))}</div><div class="space-y-2.5">${bars}</div></div>
        <div class="${CARD} p-4"><div class="${LABEL} text-white">${esc(t('an_top'))}</div><div class="mb-3 text-[11px] text-[#5A6275]">${esc(t('an_top_sub'))}</div><div class="space-y-2.5">${tops}</div></div>
      </div>
      <div class="${CARD} p-4"><div class="${LABEL} text-white">${esc(t('an_daily'))}</div><div class="mb-3 text-[11px] text-[#5A6275]">${esc(t('an_daily_sub'))}</div>
        <div class="flex h-28 items-end gap-[2px] border-b border-[#1B1E26]">${cols}</div>
        <div class="mt-1 flex justify-between font-mono text-[9.5px] text-[#5A6275]"><span>${esc(dayLabel(0))}</span><span>${esc(dayLabel(7))}</span><span>${esc(dayLabel(13))}</span></div></div>
    </div>`;
  }

  /* ═══════════════════════ ATS (beta) ═══════════════════════ */
  function renderAts() {
    if (!state.modules.ats) {
      return `<div class="${CARD} p-6 text-center"><p class="text-sm text-[#C9CDD6]">${esc(t('ats_off'))}</p><button type="button" data-a="mod" data-v="ats" class="${BTN_P} mt-3">${esc(t('ats_turn_on'))}</button></div>`;
    }
    const all = state.jobs.flatMap((j) => j.cands);
    const inProc = all.filter((c) => c.stage !== 'PLACED').length;
    const inInt = all.filter((c) => STAGE_COL[c.stage] === 'int').length;
    const job = state.jobs[state.jobSel] || state.jobs[0];
    const kpi = (label, v) => `<div class="${CARD} p-3"><div class="${LABEL} text-[#8A90A2]">${esc(label)}</div><div class="mt-1.5 font-mono text-xl font-bold text-white">${v}</div></div>`;
    const jobTabs = state.jobs.map((j, i) => `<button type="button" data-a="job" data-v="${i}" class="flex min-w-[180px] flex-col items-start rounded-lg border px-3 py-2 text-left cursor-pointer ${i === state.jobSel ? 'border-[#FF5500] bg-[#FF5500]/[0.08]' : 'border-[#1B1E26] bg-[#0F1117] hover:border-white/20'}">
      <span class="font-mono text-[10px] text-[#FF7733]">${j.id} · ${esc(co(j.co).name)}</span><span class="mt-0.5 line-clamp-1 text-xs font-semibold text-white">${esc(j.title)}</span><span class="mt-0.5 font-mono text-[10px] text-[#5A6275]">${j.cands.length} ${lang() === 'cs' ? 'kandidátů' : 'candidates'}</span></button>`).join('');
    const COLS = [['short', 'col_s_short', 'text-[#8A90A2]'], ['cv', 'col_s_cv', 'text-[#38BDF8]'], ['int', 'col_s_int', 'text-[#FF7733]'], ['offer', 'col_s_offer', 'text-[#FBBF24]'], ['placed', 'col_s_placed', 'text-[#34D399]']];
    const kanban = COLS.map(([k, label, color]) => {
      const cands = job.cands.map((c, i) => ({ c, i })).filter(({ c }) => STAGE_COL[c.stage] === k);
      return `<div class="min-w-[170px] flex-1 rounded-xl border border-[#1B1E26] bg-[#090C12] p-2.5"><div class="mb-2 flex items-center justify-between border-b border-[#1B1E26] pb-1.5"><span class="font-mono text-[10px] font-bold uppercase ${color}">${esc(t(label))}</span><span class="rounded bg-[#1B1E26] px-1.5 font-mono text-[10px] text-[#8A90A2]">${cands.length}</span></div>
        <div class="space-y-2">${cands.map(({ c, i }) => `<div class="rounded-lg border ${c.stage === 'PLACED' ? 'border-[#10B981]/40' : 'border-white/5'} bg-[#0F1117] p-2.5">
          <div class="flex items-center gap-2"><span class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#1B1E26] font-mono text-[9.5px] font-bold text-white">${esc(c.n.split(' ').map((p) => p[0]).join(''))}</span><span class="min-w-0"><span class="block truncate text-xs font-semibold text-white">${esc(c.n)}</span><span class="block truncate text-[10.5px] text-[#8A90A2]">${esc(c.cur)}</span></span></div>
          <div class="mt-2 flex items-center justify-between"><span class="font-mono text-[9.5px] ${c.stage === 'PLACED' ? 'text-[#34D399]' : 'text-[#5A6275]'}">${esc(t('stage_' + c.stage))}</span>
          ${c.stage !== 'PLACED' ? `<button type="button" data-a="advance" data-v="${i}" class="flex items-center gap-0.5 rounded border border-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#C9CDD6] hover:border-[#FF5500] hover:text-white cursor-pointer">${esc(t('ats_advance'))}${ic('arrow_forward', 'text-[12px]')}</button>` : ic('check_circle', 'text-[15px] text-[#34D399]')}</div></div>`).join('')}</div></div>`;
    }).join('');
    const role = job.roleId ? state.roles.find((r) => r.id === job.roleId) : null;
    return `<div class="space-y-3">${header(`${esc(t('ats_title'))} <span class="ml-1 rounded border border-[#FBBF24]/40 px-1.5 py-0.5 align-middle font-mono text-[10px] text-[#FBBF24]">${t('beta')}</span>`, esc(t('ats_sub')))}
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">${kpi(t('ats_kpi_jobs'), state.jobs.length)}${kpi(t('ats_kpi_cands'), inProc)}${kpi(t('ats_kpi_int'), inInt)}${kpi(t('ats_kpi_fee'), eur(state.placedFees))}</div>
      <div class="tr-sb-scroll flex gap-2 overflow-x-auto pb-1">${jobTabs}</div>
      <div class="${CARD} p-3.5"><div class="flex flex-col gap-2 sm:flex-row sm:items-center"><div class="min-w-0 flex-1"><div class="text-sm font-bold text-white">${esc(job.title)} — ${esc(co(job.co).name)}</div>
        <div class="mt-0.5 font-mono text-[10.5px] text-[#8A90A2]">${job.id} · ${esc(t('ats_fee', { f: eur(job.fee) }))}${role ? ` · <button type="button" data-a="role" data-v="${role.id}" class="text-[#FF7733] hover:text-white cursor-pointer">${esc(t('ats_from_role', { r: role.id }))}</button>` : ''}</div></div>
        <button type="button" data-a="add-cand" class="${BTN_P}">${ic('person_add', 'text-[15px]')}${esc(t('ats_add'))}</button></div>
        ${job.cands.length ? `<div class="tr-sb-scroll mt-3 flex gap-2 overflow-x-auto pb-1">${kanban}</div>` : `<div class="mt-3 rounded-lg border border-dashed border-[#1B1E26] py-8 text-center text-xs text-[#8A90A2]">${esc(t('ats_empty'))}</div>`}</div>
    </div>`;
  }

  /* ═══════════════════════ Settings ═══════════════════════ */
  const PROFILE = {
    core: { en: ['Software engineering', 'Data & AI', 'Product management', 'Infrastructure & cloud', 'Security', 'B2B sales leadership'], cs: ['Vývoj softwaru', 'Data & AI', 'Produktový management', 'Infrastruktura & cloud', 'Bezpečnost', 'Vedení B2B obchodu'] },
    sel: { en: ['Product design', 'Marketing leadership', 'Account management'], cs: ['Produktový design', 'Vedení marketingu', 'Account management'] },
    skip: { en: ['Internships', 'Warehouse & logistics ops', 'Customer support agents', 'Internal recruiters'], cs: ['Stáže', 'Sklad & logistika', 'Zákaznická podpora', 'Interní recruiteři'] },
  };
  const MARKETS = { core: { en: ['Czechia', 'Slovakia'], cs: ['Česko', 'Slovensko'] }, sel: { en: ['Germany', 'Austria', 'Poland', 'Remote EU'], cs: ['Německo', 'Rakousko', 'Polsko', 'Remote EU'] }, block: { en: ['Asia-Pacific', 'Americas'], cs: ['Asie a Pacifik', 'Amerika'] } };
  const LOCS = [['Praha', 'core'], ['Brno', 'core'], ['Bratislava', 'core'], ['Berlin', 'sel'], ['Remote EU', 'sel'], ['Singapore', 'block']];
  function classify(title, locKind) {
    const s = ` ${title.toLowerCase()} `;
    const has = (list) => list.find((k) => s.includes(k));
    let fit; let why;
    const skip = has(['intern', 'stáž', 'warehouse', 'sklad', 'driver', 'řidič', 'picker', 'support agent', 'call center', 'recruiter', 'brigád']);
    const core = has(['engineer', 'developer', 'vývojář', 'architect', 'data', ' ml ', ' ai ', 'devops', 'sre', 'security', 'product manager', 'account executive', 'sales director', 'head of sales', 'vp sales', 'cto', 'programátor']);
    const sel = has(['designer', 'marketing', 'account manager', 'analyst', 'analytik']);
    if (skip) { fit = 'SKIP'; why = t('test_r_skip', { k: skip.trim() }); }
    else if (core) { fit = 'CORE'; why = t('test_r_core', { k: core.trim() }); }
    else if (sel) { fit = 'SELECTIVE'; why = t('test_r_sel', { k: sel.trim() }); }
    else { fit = 'SELECTIVE'; why = t('test_r_none'); }
    if (fit !== 'SKIP' && locKind === 'block') { fit = 'SKIP'; why += ' ' + t('test_cap_block'); }
    else if (fit === 'CORE' && locKind === 'sel') { fit = 'SELECTIVE'; why += ' ' + t('test_cap_sel'); }
    return { fit, why };
  }
  function renderSettings() {
    const tabs = [['spec', 'set_tab_spec'], ['modules', 'set_tab_modules'], ['schedule', 'set_tab_schedule']].map(([v, k]) => `<button type="button" data-a="set-tab" data-v="${v}" class="border-b-2 px-1 pb-2 text-[13px] whitespace-nowrap cursor-pointer ${state.setTab === v ? 'border-[#FF5500] font-semibold text-white' : 'border-transparent text-[#8A90A2] hover:text-white'}">${t(k)}</button>`).join('');
    const L = lang();
    let body = '';
    if (state.setTab === 'modules') {
      const mod = (key, title, desc, on, locked, beta) => `<div class="flex items-start gap-3 rounded-xl border border-[#1B1E26] bg-[#0F1117] p-3.5">
        <div class="flex-1"><div class="flex items-center gap-2 text-[13px] font-bold text-white">${esc(title)}${beta ? `<span class="rounded border border-[#FBBF24]/40 px-1 font-mono text-[8.5px] text-[#FBBF24]">${t('beta')}</span>` : ''}</div><div class="mt-0.5 text-[11.5px] text-[#8A90A2]">${esc(desc)}</div></div>
        <button type="button" ${locked ? 'disabled' : `data-a="mod" data-v="${key}"`} role="switch" aria-checked="${on}" class="relative mt-0.5 h-5 w-9 flex-shrink-0 rounded-full transition-colors ${on ? 'bg-[#FF5500]' : 'bg-[#2A2F3B]'} ${locked ? 'opacity-60' : 'cursor-pointer'}"><span class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? 'left-[18px]' : 'left-0.5'}"></span></button></div>`;
      body = `<p class="text-xs text-[#8A90A2]">${esc(t('mod_sub'))}</p><div class="mt-3 space-y-2">
        ${mod('bd', t('mod_bd'), t('mod_bd_d'), true, true)}${mod('ats', t('mod_ats'), t('mod_ats_d'), state.modules.ats, false, true)}${mod('fin', t('mod_fin'), t('mod_fin_d'), state.modules.fin && state.modules.ats, !state.modules.ats, true)}</div>
        <div class="mt-3 rounded-lg border-[1.5px] border-[#FF5500]/60 bg-[#FF5500]/[0.07] px-3.5 py-2.5 text-xs font-bold text-white">${esc(state.modules.ats ? t('mode_b') : t('mode_a'))}</div>`;
    } else if (state.setTab === 'schedule') {
      body = renderSchedule();
    } else {
      const chips = (list, cls) => list[L].map((x) => `<span class="rounded-md border px-2 py-1 text-[11.5px] ${cls}">${esc(x)}</span>`).join('');
      const tr = state.testResult;
      body = `<div class="grid gap-3 lg:grid-cols-[1fr_300px]"><div class="space-y-3">
        <div class="${CARD} p-4"><div class="text-sm font-bold text-white">${esc(t('spec_title'))}</div><p class="mt-0.5 text-xs text-[#8A90A2]">${esc(t('spec_sub'))}</p>
          <div class="mt-3 space-y-3"><div><div class="${LABEL} text-[#FF7733]">${esc(t('spec_core'))}</div><div class="mt-1.5 flex flex-wrap gap-1.5">${chips(PROFILE.core, 'border-[#FF5500]/40 bg-[#FF5500]/[0.08] text-white')}</div></div>
          <div><div class="${LABEL} text-[#38BDF8]">${esc(t('spec_sel'))}</div><div class="mt-1.5 flex flex-wrap gap-1.5">${chips(PROFILE.sel, 'border-[#38BDF8]/35 bg-[#38BDF8]/[0.08] text-white')}</div></div>
          <div><div class="${LABEL} text-[#8A90A2]">${esc(t('spec_skip'))}</div><div class="mt-1.5 flex flex-wrap gap-1.5">${chips(PROFILE.skip, 'border-white/10 bg-white/[0.03] text-[#8A90A2]')}</div></div></div></div>
        <div class="${CARD} p-4"><div class="text-sm font-bold text-white">${esc(t('mk_title'))}</div><div class="mt-3 grid gap-3 sm:grid-cols-3">
          <div><div class="${LABEL} text-[#FF7733]">${esc(t('mk_core'))}</div><div class="mt-1.5 flex flex-wrap gap-1.5">${chips(MARKETS.core, 'border-[#FF5500]/40 text-white')}</div></div>
          <div><div class="${LABEL} text-[#38BDF8]">${esc(t('mk_sel'))}</div><div class="mt-1.5 flex flex-wrap gap-1.5">${chips(MARKETS.sel, 'border-[#38BDF8]/35 text-white')}</div></div>
          <div><div class="${LABEL} text-[#EF4444]">${esc(t('mk_block'))}</div><div class="mt-1.5 flex flex-wrap gap-1.5">${chips(MARKETS.block, 'border-[#EF4444]/35 text-[#C9CDD6]')}</div></div></div></div></div>
        <form data-form="test" class="${CARD} h-fit p-4"><div class="text-sm font-bold text-white">${esc(t('test_title'))}</div>
          <input name="title" maxlength="120" autocomplete="off" value="${esc(state.testTitle || '')}" placeholder="${esc(t('test_ph'))}" class="mt-3 w-full rounded-lg border border-[#1B1E26] bg-[#0B0E14] px-3 py-1.5 text-xs text-white placeholder:text-[#5A6275] focus:border-[#FF5500] focus:outline-none">
          <label class="mt-2 block text-[11px] text-[#8A90A2]">${esc(t('test_loc'))}<select name="loc" class="mt-1 w-full cursor-pointer rounded-lg border border-[#1B1E26] bg-[#0B0E14] px-2 py-1.5 text-xs text-white focus:border-[#FF5500] focus:outline-none">${LOCS.map(([l], i) => `<option value="${i}" ${String(state.testLoc || 0) === String(i) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
          <button type="submit" class="${BTN_P} mt-3 w-full">${esc(t('test_btn'))}</button>
          ${tr ? `<div class="mt-3 rounded-lg border border-[#1B1E26] bg-[#0B0E14] p-3"><div>${fitBadge(tr.fit)}</div><p class="mt-1.5 text-[11.5px] leading-relaxed text-[#C9CDD6]">${esc(tr.why)}</p></div>` : ''}</form></div>`;
    }
    return `<div class="space-y-3">${header(esc(t('nav_settings')), '', openFull('settings'))}<div class="tr-sb-scroll flex gap-5 overflow-x-auto border-b border-[#1B1E26]">${tabs}</div>${body}</div>`;
  }

  /* ═══════════════════════ AI Hawk ═══════════════════════ */
  function renderHawk() {
    const fab = `<button type="button" data-a="hawk" class="absolute right-4 bottom-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-[#FF5500] bg-[#0F1117] shadow-[0_0_24px_rgba(255,85,0,0.35)] transition-transform hover:scale-105 cursor-pointer ${state.hawkOpen ? 'hidden' : ''}" aria-label="${esc(t('hawk_title'))}">
      <img src="falcon.svg" alt="" class="h-6 w-6 object-contain"><span class="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B0E14] bg-[#10B981]"></span></button>`;
    if (!state.hawkOpen) return fab;
    const anchor = (state.panel && state.roles.find((r) => r.id === state.panel)) || state.roles[0];
    const chips = [['core', t('hq_core')], ['stale', t('hq_stale')], ['pitch', t('hq_pitch')], ['draft', t('hq_draft', { co: co(anchor.co).name })]];
    const msgs = state.hawk.map((m) => m.me
      ? `<div class="ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-[#FF5500]/[0.15] px-3 py-2 text-[12.5px] text-white">${esc(m.text)}</div>`
      : `<div class="max-w-[92%] rounded-xl rounded-bl-sm border border-[#1B1E26] bg-[#0F1117] px-3 py-2 text-[12.5px] leading-relaxed text-[#C9CDD6]">${m.html}</div>`).join('');
    return `<div class="fixed inset-0 z-[60] flex w-full flex-col border-l lg:absolute lg:inset-y-0 lg:left-auto lg:right-0 lg:z-40 lg:max-w-[380px] border-[#1B1E26] bg-[#0B0E14] shadow-2xl">
      <div class="flex items-center gap-2.5 border-b border-[#1B1E26] px-4 py-3"><img src="falcon.svg" alt="" class="h-6 w-6 object-contain"><div class="flex-1"><div class="text-sm font-bold text-white">${esc(t('hawk_title'))}</div><div class="text-[10.5px] text-[#8A90A2]">${esc(t('hawk_sub'))} · <span class="font-mono">${esc(t('hawk_kbd'))}</span></div></div>
        <button type="button" data-a="hawk-close" class="rounded-md p-1 text-[#8A90A2] hover:text-white cursor-pointer" aria-label="${esc(t('p_close'))}">${ic('close', 'text-[18px]')}</button></div>
      <div id="trSbHawkLog" class="tr-sb-scroll flex-1 space-y-2.5 overflow-y-auto p-4">
        <div class="max-w-[92%] rounded-xl rounded-bl-sm border border-[#1B1E26] bg-[#0F1117] px-3 py-2 text-[12.5px] leading-relaxed text-[#C9CDD6]">${esc(t('hawk_hello'))}</div>${msgs}
        ${state.hawkBusy ? '<div class="flex gap-1 px-1 py-2"><span class="tr-dot h-1.5 w-1.5 rounded-full bg-[#FF5500]"></span><span class="tr-dot h-1.5 w-1.5 rounded-full bg-[#FF5500]" style="animation-delay:.15s"></span><span class="tr-dot h-1.5 w-1.5 rounded-full bg-[#FF5500]" style="animation-delay:.3s"></span></div>' : ''}</div>
      <div class="border-t border-[#1B1E26] p-3"><div class="mb-2 flex flex-wrap gap-1.5">${chips.map(([k, l]) => `<button type="button" data-a="hq" data-v="${k}" class="rounded-full border border-[#1B1E26] bg-[#0F1117] px-2.5 py-1 text-left text-[11px] text-[#C9CDD6] hover:border-[#FF5500] hover:text-white cursor-pointer" ${state.hawkBusy ? 'disabled' : ''}>${esc(l)}</button>`).join('')}</div>
        <form data-form="hawk" class="flex gap-2"><input name="q" maxlength="200" autocomplete="off" placeholder="${esc(t('hawk_ph'))}" class="min-w-0 flex-1 rounded-lg border border-[#1B1E26] bg-[#0F1117] px-3 py-1.5 text-xs text-white placeholder:text-[#5A6275] focus:border-[#FF5500] focus:outline-none"><button type="submit" class="${BTN_P}" aria-label="${esc(t('hawk_send'))}">${ic('send', 'text-[15px]')}</button></form></div></div>`;
  }
  function hawkAnswer(kind) {
    const L = lang();
    const roleLink = (r) => `<button type="button" data-a="role" data-v="${r.id}" class="block w-full truncate rounded px-1.5 py-1 text-left text-[12px] hover:bg-[#151720] cursor-pointer"><span class="font-mono text-[10.5px] text-[#FF7733]">${r.id}</span> <span class="text-white">${esc(r.title)}</span> <span class="text-[#8A90A2]">· ${esc(co(r.co).name)}</span></button>`;
    if (kind === 'core') {
      const list = state.roles.filter((r) => r.fit === 'CORE' && co(r.co).client && !isStale(r)).sort((a, b) => a.age - b.age);
      const all = state.roles.filter((r) => r.fit === 'CORE' && co(r.co).client);
      return `${md(t('ha_core', { n: all.length, t: all.filter((r) => r.age === 0).length }))}<div class="mt-1.5">${list.slice(0, 3).map(roleLink).join('')}</div>`;
    }
    if (kind === 'stale') {
      const list = state.roles.filter(isStale).sort((a, b) => b.age - a.age);
      return `${md(t('ha_stale', { n: list.length }))}<div class="mt-1.5">${list.slice(0, 4).map(roleLink).join('')}</div><button type="button" data-a="bd-stale" class="mt-1.5 text-[11.5px] font-semibold text-[#FF7733] hover:text-white cursor-pointer">${esc(t('ha_show'))} →</button>`;
    }
    if (kind === 'pitch') {
      const stale = state.roles.filter((r) => isStale(r) && co(r.co).client).sort((a, b) => b.age - a.age)[0];
      const fresh = state.roles.filter((r) => r.age === 0 && r.fit === 'CORE' && !co(r.co).client)[0];
      const n = state.roles.filter((r) => r.co === 'rohlik' && r.age < 7).length;
      const items = [stale && [t('ha_pitch_stale', { co: co(stale.co).name, r: stale.title, d: stale.age }), stale], [t('ha_pitch_spike', { co: 'Rohlik.cz', n }), null], fresh && [t('ha_pitch_new', { co: co(fresh.co).name, r: fresh.title }), fresh]].filter(Boolean);
      return `${esc(t('ha_pitch'))}<ol class="mt-1.5 space-y-1">${items.map(([txt, r], i) => `<li class="flex gap-2"><span class="font-mono text-[11px] text-[#FF7733]">${i + 1}.</span>${r ? `<button type="button" data-a="role" data-v="${r.id}" class="text-left text-white hover:text-[#FF7733] cursor-pointer">${esc(txt)}</button>` : `<span class="text-white">${esc(txt)}</span>`}</li>`).join('')}</ol>`;
    }
    if (kind === 'draft') {
      const r = (state.panel && state.roles.find((x) => x.id === state.panel)) || state.roles[0];
      const c = co(r.co);
      const hm = FAM[r.fam].hm[0];
      const body = t('ha_draft_body', { first: L === 'cs' ? 'pane / paní' : 'there', r: r.title, loc: r.loc });
      return `${esc(t('ha_draft', { hm, co: c.name }))}<pre class="mt-2 whitespace-pre-wrap rounded-lg border border-[#1B1E26] bg-[#0B0E14] p-2.5 font-sans text-[12px] leading-relaxed text-white">${esc(body)}</pre>`;
    }
    return `${esc(t('ha_fallback'))}<a href="${demoLink(state.screen)}" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#FF7733] hover:text-white">${esc(t('ha_open_full'))} ${ic('open_in_new', 'text-[13px]')}</a>`;
  }
  function askHawk(kind, text) {
    if (state.hawkBusy) return;
    state.hawk.push({ me: true, text });
    state.hawkBusy = true;
    state.tour.hawk = true;
    render();
    setTimeout(() => {
      state.hawkBusy = false;
      state.hawk.push({ me: false, html: hawkAnswer(kind) });
      render();
    }, 700);
  }
  function hawkKind(q) {
    const s = q.toLowerCase();
    if (/(30|stale|old|dlouho|star[éá]|ležák|open.*day|otevřen)/.test(s)) return 'stale';
    if (/(draft|email|e-mail|outreach|message|oslov.*pro|napiš|zpráv)/.test(s)) return 'draft';
    if (/(pitch|today|who|call|koho|dnes|volat)/.test(s)) return 'pitch';
    if (/(core|client|klient|how many|kolik)/.test(s)) return 'core';
    return 'other';
  }

  /* ═══════════════════════ Rendering & events ═══════════════════════ */
  let root = null;
  let toastTimer = null;
  function toast(msg) {
    state.toast = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { state.toast = null; render(); }, 2600);
  }
  function render(keepFocus) {
    if (!root) return;
    const main = root.querySelector('#trSbMain');
    const scrollTop = main ? main.scrollTop : 0;
    const panelEl = root.querySelector('[data-stop]');
    const panelScroll = panelEl ? panelEl.scrollTop : 0;
    let focus = null;
    if (keepFocus && document.activeElement && root.contains(document.activeElement)) {
      const el = document.activeElement;
      focus = { key: el.getAttribute('data-input'), start: el.selectionStart, end: el.selectionEnd };
    }
    root.innerHTML = renderShell();
    const main2 = root.querySelector('#trSbMain');
    if (main2) main2.scrollTop = scrollTop;
    const panel2 = root.querySelector('[data-stop]');
    if (panel2) panel2.scrollTop = panelScroll;
    const log = root.querySelector('#trSbHawkLog');
    if (log) log.scrollTop = log.scrollHeight;
    if (focus && focus.key) {
      const el = root.querySelector(`[data-input="${focus.key}"]`);
      if (el) { el.focus(); try { el.setSelectionRange(focus.start, focus.end); } catch (e) { /* select */ } }
    }
  }
  function go(screen) {
    if (screen === 'ats' && !state.modules.ats) screen = 'settings';
    state.screen = screen;
    state.panel = null;
    render();
    const main = root && root.querySelector('#trSbMain');
    if (main) main.scrollTop = 0;
  }
  function openRole(id) {
    state.panel = id;
    state.panelTab = 'overview';
    state.tour.open_role = true;
    state.hawkOpen = false;
    render();
    const p = root.querySelector('[data-stop]');
    if (p) p.scrollTop = 0;
  }
  function exportCsv() {
    const list = bdFiltered();
    const rows = [['Ref', 'Role', 'Company', 'Type', 'Location', 'Fit', 'Status', 'First seen (days ago)', 'ATS']]
      .concat(list.map((r) => { const c = co(r.co); return [r.id, r.title, c.name, c.client ? 'Client' : 'Prospect', r.loc, r.fit, r.status, r.age, c.ats]; }));
    const csv = '﻿' + rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'talentradar-sandbox-roles.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(t('exported', { n: list.length }));
    render();
  }
  function detectAts(url) {
    const s = url.toLowerCase();
    const map = [['greenhouse', 'Greenhouse'], ['lever.co', 'Lever'], ['ashbyhq', 'Ashby'], ['workable', 'Workable'], ['smartrecruiters', 'SmartRecruiters'], ['personio', 'Personio'], ['teamtailor', 'Teamtailor'], ['recruitee', 'Recruitee'], ['teamio', 'Teamio'], ['jobs.cz', 'Teamio / Jobs.cz'], ['recruitis', 'Recruitis'], ['datacruit', 'Datacruit'], ['myworkdayjobs', 'Workday'], ['bamboohr', 'BambooHR'], ['pinpoint', 'Pinpoint']];
    const hit = map.find(([k]) => s.includes(k));
    return hit ? hit[1] : (lang() === 'cs' ? 'Kariérní stránka (obecný parser)' : 'Careers page (generic parser)');
  }
  function startScanAll() {
    if (state.scanRun && !state.scanRun.done) return;
    const n = state.companies.length;
    if (state.credits < n) return;
    state.credits -= n;
    state.scanRun = { i: 0, done: false, found: 0, secs: 0 };
    const t0 = Date.now();
    render();
    const tick = setInterval(() => {
      state.scanRun.i += 1;
      if (state.scanRun.i >= n) {
        clearInterval(tick);
        let found = 0;
        if (!state.scanned) {
          SCAN_FINDS.forEach((f) => { const r = mkRole(f); r.fresh = true; state.roles.unshift(r); found += 1; });
          state.companies.find((c) => c.id === 'kiwi').active += 1;
          state.companies.find((c) => c.id === 'mews').active += 1;
        }
        state.companies.forEach((c) => { c.scannedNow = true; if (c.scan === 'queued') c.scan = 'idle'; });
        state.scanned = true;
        state.scanRun = { i: n, done: true, found, secs: Math.max(3, Math.round((Date.now() - t0) / 1000)) };
        state.tour.scan = true;
      }
      if (state.screen === 'scanner') render();
    }, 160);
  }
  function scanOne(id) {
    const c = state.companies.find((x) => x.id === id);
    if (!c || c.scan === 'busy' || state.credits <= 0) return;
    c.scan = 'busy';
    state.credits -= 1;
    render();
    setTimeout(() => {
      c.scan = 'idle';
      c.scannedNow = true;
      state.tour.scan = true;
      const find = !state.scanned && SCAN_FINDS.find((f) => f[1] === id && !state.roles.some((r) => r.id === f[0]));
      if (find) { const r = mkRole(find); r.fresh = true; state.roles.unshift(r); c.active += 1; toast(t('sc_one_new', { co: c.name })); }
      else toast(t('sc_one_none', { co: c.name, n: c.active }));
      render();
    }, 1100);
  }

  function onClick(e) {
    const el = e.target.closest('[data-a]');
    if (!el || !root.contains(el)) return;
    const a = el.getAttribute('data-a');
    const v = el.getAttribute('data-v');
    if (a === 'panel-bg') { if (e.target.closest('[data-stop]')) return; state.panel = null; render(); return; }
    if (el.tagName === 'A') return;
    e.preventDefault();
    if (a === 'star') { e.stopPropagation(); const r = state.roles.find((x) => x.id === v); r.starred = !r.starred; toast(t(r.starred ? 'toast_star' : 'toast_unstar')); render(); return; }
    switch (a) {
      case 'go': go(v); break;
      case 'role': openRole(v); break;
      case 'pclose': state.panel = null; render(); break;
      case 'ptab': state.panelTab = v; render(); break;
      case 'pnav': {
        const list = panelList();
        const i = list.findIndex((x) => x.id === state.panel) + Number(v);
        if (list[i]) { state.panel = list[i].id; render(); }
        break;
      }
      case 'home-win': state.homeWindow = Number(v); render(); break;
      case 'home-seg': state.homeSeg = v; render(); break;
      case 'home-toggle': state.homeOpen[v] = !state.homeOpen[v]; render(); break;
      case 'bd-tab': state.bdTab = v; render(); break;
      case 'bd-quick': state.bdQuick = state.bdQuick === v ? '' : v; render(); break;
      case 'bd-seg': state.bdSeg = v; render(); break;
      case 'bd-fit': state.bdFit = v; render(); break;
      case 'bd-company': state.bdCompany = v; state.bdTab = 'roles'; render(); break;
      case 'bd-company-clear': state.bdCompany = ''; render(); break;
      case 'bd-clear': Object.assign(state, { bdQuick: '', bdSeg: 'all', bdFit: 'all', bdQuery: '', bdCompany: '' }); render(); break;
      case 'bd-stale': Object.assign(state, { bdQuick: 'stale', bdSeg: 'all', bdFit: 'all', bdQuery: '', bdCompany: '', bdTab: 'roles', hawkOpen: false }); go('bd'); break;
      case 'export': exportCsv(); break;
      case 'mandate': {
        const r = state.roles.find((x) => x.id === v);
        const id = `J-${105 + state.jobs.length - 3}`;
        state.jobs.unshift({ id, roleId: r.id, title: r.title, co: r.co, fee: { dev: 19500, infra: 18000, data: 21000, product: 20000, design: 14000, sales: 22000, sec: 17500 }[r.fam], cands: [] });
        r.history.push({ text: () => t('h_mandate', { id }) });
        if (r.status === 'NEW' || r.status === 'CONTACT_PENDING' || r.status === 'CONTACTED' || r.status === 'IN_PROGRESS') {
          r.status = 'WON';
          r.history.push({ text: () => t('h_status', { s: t('st_WON') }) });
        }
        state.jobSel = 0;
        state.tour.mandate = true;
        toast(t('toast_mandate', { id }));
        state.panel = null;
        state.screen = 'ats';
        render();
        break;
      }
      case 'go-job': state.jobSel = Math.max(0, state.jobs.findIndex((j) => j.id === v)); go('ats'); break;
      case 'job': state.jobSel = Number(v); render(); break;
      case 'advance': {
        const job = state.jobs[state.jobSel];
        const c = job.cands[Number(v)];
        const next = STAGES[STAGES.indexOf(c.stage) + 1];
        if (!next) break;
        c.stage = next;
        if (next === 'PLACED') { state.placedFees += job.fee; toast(t('ats_placed_toast', { c: c.n, co: co(job.co).name, f: eur(job.fee) })); }
        else toast(t('ats_moved', { c: c.n, s: t('stage_' + next) }));
        render();
        break;
      }
      case 'add-cand': {
        const job = state.jobs[state.jobSel];
        const p = POOL[state.poolIdx % POOL.length];
        state.poolIdx += 1;
        job.cands.push({ n: p.n, cur: p.cur, stage: 'SHORTLISTED' });
        toast(t('ats_added', { c: p.n }));
        render();
        break;
      }
      case 'sc-tab': state.scTab = v; if (state.screen !== 'scanner') state.screen = 'scanner'; render(); break;
      case 'sc-freq': state.scanFreq = Number(v); render(); break;
      case 'sc-all': startScanAll(); break;
      case 'sc-one': scanOne(v); break;
      case 'sc-view-new': Object.assign(state, { bdQuick: 'new', bdSeg: 'all', bdFit: 'all', bdQuery: '', bdCompany: '', bdTab: 'roles' }); go('bd'); break;
      case 'an-win': state.anWindow = Number(v); render(); break;
      case 'set-tab': state.setTab = v; render(); break;
      case 'mod':
        if (v === 'ats') { state.modules.ats = !state.modules.ats; if (!state.modules.ats) state.modules.fin = false; }
        if (v === 'fin' && state.modules.ats) state.modules.fin = !state.modules.fin;
        if (state.screen === 'ats' && !state.modules.ats) state.screen = 'settings';
        if (v === 'ats' && state.screen === 'ats') state.setTab = 'modules';
        render();
        break;
      case 'hawk': state.hawkOpen = true; render(); { const i = root.querySelector('[data-form="hawk"] input'); if (i) i.focus({ preventScroll: true }); } break;
      case 'hawk-close': state.hawkOpen = false; render(); break;
      case 'hq': {
        const anchor = (state.panel && state.roles.find((r) => r.id === state.panel)) || state.roles[0];
        const label = { core: t('hq_core'), stale: t('hq_stale'), pitch: t('hq_pitch'), draft: t('hq_draft', { co: co(anchor.co).name }) }[v];
        askHawk(v, label);
        break;
      }
      case 'tour-hide': state.tourHidden = true; render(); break;
      default: break;
    }
  }
  function onInput(e) {
    const key = e.target.getAttribute('data-input');
    if (!key) return;
    if (key === 'home-q') { state.homeQuery = e.target.value; render(true); }
    if (key === 'bd-q') { state.bdQuery = e.target.value; render(true); }
    if (key === 'sc-q') { state.scQuery = e.target.value; render(true); }
  }
  function onChange(e) {
    if (e.target.getAttribute('data-input') !== 'status') return;
    const r = state.roles.find((x) => x.id === state.panel);
    if (!r) return;
    r.status = e.target.value;
    r.history.push({ text: () => t('h_status', { s: t('st_' + r.status) }) });
    state.tour.status = true;
    toast(t('toast_status', { s: t('st_' + r.status) }));
    render();
  }
  function onSubmit(e) {
    const form = e.target.closest('[data-form]');
    if (!form) return;
    e.preventDefault();
    const kind = form.getAttribute('data-form');
    const data = new FormData(form);
    if (kind === 'note') {
      const text = String(data.get('note') || '').trim();
      const r = state.roles.find((x) => x.id === state.panel);
      if (!text || !r) return;
      r.notes.push({ by: 'you', at: { en: 'just now', cs: 'právě teď' }, text });
      r.history.push({ text: () => t('h_note') });
      render();
    } else if (kind === 'hawk') {
      const q = String(data.get('q') || '').trim();
      if (q) askHawk(hawkKind(q), q);
    } else if (kind === 'add-company') {
      const url = String(data.get('url') || '').trim();
      if (!/[a-z0-9-]+\.[a-z]{2,}/i.test(url)) { state.addMsg = { ok: false, text: t('sc_add_bad') }; render(); return; }
      const ats = detectAts(url);
      const clean = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
      const host = clean.split('/')[0];
      const slug = (clean.split('/')[1] && /greenhouse|lever|ashby|workable|recruitee|teamtailor|personio/.test(host)) ? clean.split('/')[1] : host.split('.').slice(-2, -1)[0] || host;
      const name = slug.charAt(0).toUpperCase() + slug.slice(1);
      state.companies.push({ id: 'new-' + state.companies.length, name, domain: host, careers: 'https://' + clean, ats, hq: '', client: false, active: 0, ctx: { en: '', cs: '' }, scan: 'queued' });
      state.addMsg = { ok: true, text: t('sc_add_detect', { ats }) };
      render();
    } else if (kind === 'test') {
      const title = String(data.get('title') || '').trim();
      const li = Number(data.get('loc') || 0);
      state.testTitle = title;
      state.testLoc = li;
      if (!title) return;
      state.testResult = classify(title, LOCS[li][1]);
      render();
    }
  }
  function onKey(e) {
    if (e.key === 'Escape' && root) {
      if (state.hawkOpen) { state.hawkOpen = false; render(); }
      else if (state.panel) { state.panel = null; render(); }
    }
  }

  /* Tooltip for chart marks (data-tip). */
  let tipEl = null;
  function onOver(e) {
    const el = e.target.closest('[data-tip]');
    if (!el || !root.contains(el)) { if (tipEl) tipEl.style.opacity = '0'; return; }
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'pointer-events-none fixed z-[60] rounded-md border border-[#1B1E26] bg-[#0F1117] px-2 py-1 font-mono text-[11px] text-white shadow-xl transition-opacity';
      document.body.appendChild(tipEl);
    }
    tipEl.textContent = el.getAttribute('data-tip');
    const r = el.getBoundingClientRect();
    tipEl.style.opacity = '1';
    tipEl.style.left = `${Math.min(window.innerWidth - tipEl.offsetWidth - 8, Math.max(8, r.left + r.width / 2 - tipEl.offsetWidth / 2))}px`;
    tipEl.style.top = `${r.top - tipEl.offsetHeight - 6}px`;
  }

  function mount() {
    root = document.getElementById('trSandbox');
    if (!root) return;
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onChange);
    root.addEventListener('submit', onSubmit);
    root.addEventListener('mouseover', onOver);
    root.addEventListener('mouseleave', () => { if (tipEl) tipEl.style.opacity = '0'; });
    document.addEventListener('keydown', onKey);
    window.addEventListener('talentradar:langchange', () => render());
    render();
  }

  window.TRSandbox = {
    go(screen) { go(screen); },
    openRole(id) { openRole(id); },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
