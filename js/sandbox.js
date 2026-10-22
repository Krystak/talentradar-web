/**
 * TalentRadar — interactive sandbox on talentradar.eu (#live-radar).
 *
 * A light, self-contained replica of the web app with the same menu: BD
 * (Home, Scanner, BD Master, Market Analytics) and Recruitment (Pipeline,
 * Jobs, Companies, Candidates, Contacts, Placements, To-do), Settings and
 * AI Hawk.
 *
 * It shows what a visitor of the full demo sees (talent-radar
 * scripts/web_sandbox_feed.py, served at /api/sandbox after every scan of the
 * demo): the real companies and roles of the Czech demo, found by the regular
 * scan, and a made-up agency at work around them — hiring managers, jobs,
 * candidates, notes, tasks and placements, all plainly invented and marked
 * "demo". Whatever the visitor does stays in this browser tab; nothing is sent
 * anywhere. Each screen links to the same screen in the full demo.
 *
 * Mounts into <div id="trSandbox">, follows the site language (TRLang and the
 * `talentradar:langchange` event) and exposes window.TRSandbox.go(screen).
 */
(function () {
  'use strict';

  /* ── Full demo links ──
     The app opens its public demo for ?demo=showcase and keeps the path, so
     each screen can deep-link. */
  const DEMO_ORIGIN = 'https://app.talentradar.eu';
  const DEMO_QUERY = 'demo=showcase';
  const SCREEN_PATHS = {
    home: '/', bd: '/bd-master', scanner: '/scanner', analytics: '/analytics', settings: '/settings',
    pipeline: '/pipeline', jobs: '/jobs', companies: '/companies', candidates: '/candidates', contacts: '/contacts',
    placements: '/placements', todo: '/todo',
  };
  const demoLink = (screen) => `${DEMO_ORIGIN}${SCREEN_PATHS[screen] || '/'}?${DEMO_QUERY}`;
  // The feed first, then the copy that ships with the site.
  const FEED_URLS = ['/api/sandbox', 'js/sandbox-data.json'];

  /* ═══════════════════════ Strings ═══════════════════════ */
  const S = {
    en: {
      ws_name: 'Demo Agency s.r.o.', ws_user: 'You · Owner', tier: 'AGENCY PRO', sample: 'Real roles · made-up agency', you: 'You', mock: 'demo',
      nav_section_bd: 'BD', nav_section_recruit: 'RECRUITMENT',
      nav_home: 'Home', nav_scanner: 'Scanner', nav_bd: 'BD Master', nav_analytics: 'Market Analytics', nav_settings: 'Settings',
      nav_pipeline: 'Pipeline', nav_jobs: 'Jobs', nav_companies: 'Companies', nav_candidates: 'Candidates', nav_contacts: 'Contacts', nav_placements: 'Placements', nav_todo: 'To-do',
      open_full: 'Open in full demo', open_full_short: 'Full demo',
      loading: 'Loading the demo workspace…', load_failed: 'The sandbox could not load its data right now.', load_failed_sub: 'The full demo has the same workspace.',
      tour_title: 'Try it', tour_open_role: 'Open a role', tour_status: 'Change its status', tour_job: 'Turn it into a job', tour_move: 'Move a candidate', tour_hawk: 'Ask AI Hawk',
      tour_done_title: 'That is the daily loop of TalentRadar: find the role, win the job, fill it.', tour_done_text: 'The full demo has the same workspace in the real app. Or run it on your own client list.',
      tour_done_demo: 'Open the full demo', tour_done_pilot: 'Try free for 14 days',
      greet_morning: 'Good morning', greet_afternoon: 'Good afternoon', greet_evening: 'Good evening',
      home_meta: '{date} · last scan {last} (Prague) · next scan {next}', tomorrow: 'tomorrow', today_at: 'today {t}',
      w24: '24h', w7: '7 days', w30: '30 days',
      kpi_new: 'new roles', kpi_new_sub: '{n} of them at clients', kpi_core: 'of them', kpi_core_sub: '{n} at clients', kpi_hiring: 'companies hiring', kpi_closed: 'roles closed',
      cwn_title: 'Companies with new roles', cwn_sub: '{w} · {n} companies with new roles', filter_companies: 'Filter companies',
      all: 'All', clients: 'Clients', prospects: 'Prospects', client: 'CLIENT', prospect: 'PROSPECT',
      col_company: 'Company', col_new: 'New', col_core: 'Core', col_active: 'Active', col_top: 'Top new role', col_last: 'Last new',
      grp_clients: 'CLIENTS', grp_prospects: 'PROSPECTS', companies_n: '{n} {n:company|companies}', roles_n: '{n} {n:role|roles}',
      see_all_bd: 'See all in BD Master', no_companies: 'No company matches the filter.',
      pipe_title: 'Radar', pipe_clients: 'active roles at clients', pipe_prospects: 'active roles at prospects', pipe_total: '{n} active roles at {c} companies',
      rec_title: 'Recruitment today', rec_line: '{i} in interviews · {o} with an offer', rec_tasks: '{n} {n:task|tasks} for you today', rec_open: 'Open the pipeline',
      att_title: 'Needs attention', att_stale: '{n} {n:role|roles} open 30+ days', att_stale_sub: 'The in-house team has not filled them. Warmest pitch you have.', att_show: 'Show in BD Master',
      att_none: 'No role is open 30+ days yet', att_none_sub: 'The demo started on 18 Oct. Posting dates fill in with every scan.',
      spike_title: 'Hiring spike', spike_text: '{co}: {n} new roles this week', spike_sub: 'More than usual for them. Pitch a multi-role engagement.',
      bd_sub: '{n} active roles at {c} companies · {t} new today', tab_roles: 'Active roles', tab_dir: 'Company directory', tab_archive: 'Role archive',
      q_starred: 'Starred', q_new: 'New today', q_contact: 'To contact', q_contacted: 'Contacted', q_talks: 'In talks', q_stale: 'Open 30+ days',
      search_roles: 'Search role, company or ref', export_csv: 'Export CSV', exported: 'CSV with {n} roles downloaded.',
      col_ref: 'Ref', col_role: 'Role', col_location: 'Location', col_fit: 'Fit', col_status: 'Status', col_seen: 'First seen',
      g_today: 'TODAY', g_yesterday: 'YESTERDAY', g_week: 'EARLIER THIS WEEK', g_month: 'THIS MONTH', g_older: 'EARLIER',
      today: 'Today', yesterday: 'Yesterday', days_ago: '{n} d ago', open_days: 'open {n} d', just_now: 'just now',
      no_roles: 'No role matches the filters.', clear_filters: 'Clear filters',
      dir_sub: 'Every company the demo tracks, with its careers page and the ATS it runs on.', col_type: 'Type', col_ats: 'ATS', col_new7: 'New (7 d)', show_roles: 'Show roles',
      arch_sub: 'Roles that disappeared from the careers page. Archived automatically after two scans without them.', col_closed: 'Closed', col_open_for: 'Was open',
      st_NEW: 'NEW', st_ACTIVE: 'ACTIVE', st_CONTACT_PENDING: 'TO CONTACT', st_CONTACTED: 'CONTACTED', st_IN_PROGRESS: 'IN TALKS', st_ON_HOLD: 'ON HOLD', st_WON: 'WON', st_LOST: 'LOST',
      p_of: '{n} of {total}', p_status: 'Status', p_posting: 'Open posting', p_job: 'Create job', p_job_open: 'Job {id}', p_close: 'Close',
      pt_overview: 'Overview', pt_hm: 'Hiring manager', pt_notes: 'Notes', pt_history: 'History',
      ai_summary: 'AI summary', ai_generated: 'generated from the posting', ai_none: 'The AI digest is generated for CORE roles during the scan. Open the posting for the full text.',
      key_req: 'Key requirements', bd_hook: 'BD hook', fit_reason: 'Why this fit', scope: 'Scope', work_model: 'Work model',
      hm_title: 'Likely hiring manager', hm_src_interview: 'From the posting: the last interview round is with this person.', hm_src_reports_to: 'From the posting: the role reports to this person.',
      hm_src_estimate: 'Estimated from the role title and department. The person with the final call, not the interview panel.',
      hm_likely: 'most likely', hm_linkedin: 'LinkedIn search', hm_xray: 'Google X-Ray', hm_save: 'In the full app the Chrome extension saves them as a contact.', hm_known: 'Already in your contacts',
      notes_empty: 'No notes yet. Write the first one, @mention a colleague.', note_ph: 'Add a note… try @Tereza', note_add: 'Add note',
      h_seen: 'First seen by the scan', h_status: '{by}: status → {s}', h_job: 'Job {id} created', h_note: 'Note added',
      seen_meta: 'First seen {d} · {ats} · {loc}', posted_meta: 'posted {d}',
      sc_sub: '{n} companies · all in the automatic scan · plan limit up to 200', sc_tab_companies: 'Companies', sc_tab_schedule: 'Schedule',
      sc_next: 'Next automatic scan', sc_last: 'Last scan', sc_credits: 'Manual-scan credits this week',
      sc_tz: 'Europe/Prague · {freq} · {n} companies', sc_change: 'Change schedule',
      sc_last_v: '{n} companies · {s} s · {f} new roles', sc_all_ok: 'All career endpoints responded normally',
      sc_credit_note: '1 credit = 1 company · automatic scans are free', avail: 'AVAIL',
      sc_search: 'Search company or careers URL…', sc_scan_all: 'Scan all ({n})', sc_scan: 'Scan', sc_scanning: 'Scanning…', sc_queued: 'Queued',
      col_careers: 'Careers page', col_roles: 'Active roles', col_auto: 'Auto-scan', col_lastscan: 'Last scan', on: 'On',
      sc_add_title: 'Add a company', sc_add_ph: 'Paste a careers URL, e.g. jobs.lever.co/yourclient', sc_add_btn: 'Add', sc_add_detect: 'Detected: {ats}. Scans from the next run.',
      sc_add_bad: 'Paste a careers page address.',
      sc_run_title: 'Scanning {n} companies', sc_run_now: 'Reading {co} ({ats})…',
      sc_done_title: 'Scan finished in {s} s', sc_done_text: '{c} companies read · no change since the automatic scan at {t}', sc_done_view: 'See today’s new roles',
      sc_one_none: '{co}: no change since the last scan ({n} active roles).',
      sched_title: 'Automatic scans', sched_sub: 'Scans run in your workspace time zone. Manual scans use credits.',
      f1: '1× daily', f1_t: '06:00', f2: '2× daily', f2_t: '06:00 & 12:00', f4: '4× daily', f4_t: '06:00, 10:00, 14:00, 18:00', f4_tag: 'Enterprise',
      an_title: 'Market intelligence & analytics', an_sub: 'Hiring velocity, technology demand and where the tracked companies hire.',
      an_total: 'Monitored roles', an_total_sub: 'open at {n} companies', an_progress: 'Roles in progress', an_progress_sub: 'to contact, contacted or in talks',
      an_ratio: 'Core fit ratio', an_ratio_sub: '{n} roles meet your core criteria', an_velocity: 'Hiring velocity', an_velocity_sub: 'new roles in the last {w}',
      an_stack: 'Technology & function demand', an_stack_sub: 'Open roles by area, from their titles', an_top: 'Top hiring companies', an_top_sub: 'Ranked by open roles',
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
      mod_ats: 'Light ATS', mod_ats_d: 'Pipeline, jobs, companies, candidates, contacts, placements and to-dos. A role becomes a job in one click.',
      mode_a: 'Radar only · radar next to your existing ATS (Bullhorn, Datacruit, Recruitis…)', mode_b: 'Radar + ATS · radar and ATS in one place',
      ats_off: 'Recruitment is switched off for this workspace (Radar only).', ats_turn_on: 'Switch it on',
      // Recruitment
      search: 'Search…', mine: 'Mine', everyone: 'Everyone', owner: 'Owner',
      ps_SHORTLISTED: 'Shortlisted', ps_INTERESTED: 'Interested', ps_CV_READY: 'CV ready', ps_CV_SENT: 'CV sent', ps_SENDOUT: 'Sendout',
      ps_INTERVIEW_1: '1st interview', ps_INTERVIEW_2: '2nd interview', ps_FINAL: 'Final stage', ps_OFFER: 'Offer', ps_PLACED: 'Placement',
      ps_REJECTED_CANDIDATE: 'Candidate rejected', ps_REJECTED_CLIENT: 'Client rejected', ps_OFFER_DECLINED: 'Offer declined', ps_REJECTED_CONSULTANT: 'Consultant rejected',
      grp_short: 'Shortlist', grp_cv: 'CV', grp_int: 'Interviews', grp_offer: 'Offer', grp_placed: 'Placed', grp_rejected: 'Rejected',
      cs_TARGET: 'Target', cs_CALLBACK: 'Callback', cs_ENGAGED: 'Engaged', cs_LIVE: 'Live', cs_PLACED: 'Placed', cs_ARCHIVED: 'Archive',
      js_OPEN: 'Open', js_ON_HOLD: 'On hold', js_FILLED: 'Filled', js_CLOSED: 'Closed', jt_PERMANENT: 'Permanent', jt_CONTRACT: 'Contract',
      pipeline_sub: '{n} {n:candidate|candidates} across {jobs} open {jobs:job|jobs}', any_job: 'Job: all', show_rejected: 'Show rejected',
      in_stage: 'In stage {n} d', advance: 'Move on', move_to: 'Move to…', board_empty: 'Nobody in this pipeline yet. Add candidates to the job.',
      jobs_sub: '{open} open · {hold} on hold', col_title: 'Job', col_pipeline: 'Pipeline', col_owner: 'Consultant', col_opened: 'Opened',
      pl_a: '{n} active', pl_i: '{n} {n:interview|interviews}', pl_o: '{n} {n:offer|offers}', pl_p: '{n} placed', pl_none: 'nobody yet',
      job_from_role: 'From role {ref}', back_to_jobs: 'Jobs', hiring_manager: 'Hiring manager', no_contact: 'No contact', fee: 'Fee', salary: 'Salary',
      job_pipeline_empty: 'No candidates in this job yet.', add_candidate: 'Add candidate', pick_candidate: 'Pick a candidate…', job_notes: 'Notes on the job',
      companies_sub: '{n} {n:company|companies}', scope_recruit: 'In recruitment', scope_all: 'All',
      col_contacts: 'Contacts', col_open_jobs: 'Jobs', col_placements: 'Placements', col_radar_roles: 'Radar roles', col_last_touch: 'Last touch',
      last_touch_never: 'not contacted yet', open_in_bdm: 'Open in BD Master', tab_people: 'Contacts', tab_jobs: 'Jobs', tab_company_notes: 'Company notes', tab_radar_roles: 'Radar roles',
      company_no_contacts: 'Nobody at this company yet.', crm_none: 'Nothing yet.',
      candidates_sub: '{n} {n:person|people} in the database', any_status: 'Active (no archive)', col_name: 'Name', col_current: 'Current role', col_process: 'In process', col_updated: 'Updated',
      search_cand: 'Name or title…', current_title: 'Current role', salary_expectation: 'Salary expectation', notice_period: 'Notice period', source: 'Source', summary: 'Summary',
      tab_overview: 'Overview', tab_notes: 'Notes', tab_history: 'History', add_to_job: 'Add to job', pick_job: 'Pick a job…', no_applications: 'Not in any job yet.', no_history: 'No moves yet.',
      history_added: 'added to “{job}” as {stage}', history_moved: '“{job}”: {from} → {to}',
      contacts_sub: '{n} {n:person|people} at companies', only_hm: 'Hiring managers only', col_contact: 'Contact', hm_badge: 'HM', contact_jobs: 'Jobs at the company', no_jobs: 'No jobs at this company yet.',
      placements_title: 'Placements and fees', placements_sub: '{n} {n:placement|placements} in the period', period_month: 'This month', period_quarter: 'Quarter', period_year: 'This year', period_all: 'All time',
      total_fee: 'Total fees', total_invoiced: 'Invoiced', total_paid: 'Paid', total_count: 'Placements',
      inv_NOT_INVOICED: 'Not invoiced', inv_INVOICED: 'Invoiced', inv_PAID: 'Paid', inv_CANCELLED: 'Cancelled', fallen_off: 'Fell off',
      col_placed: 'Placement', col_date: 'Date', col_start: 'Start', col_fee: 'Fee', col_invoice: 'Invoice', consultant: 'Consultant', placements_empty: 'No placements in this period.',
      todo_sub_mine: 'Your follow-ups and callbacks', todo_sub_all: 'The whole team’s follow-ups',
      gt_overdue: 'OVERDUE', gt_today: 'TODAY', gt_upcoming: 'UPCOMING', gt_no_date: 'NO DATE', gt_done: 'DONE', show_done: 'Show done',
      task_placeholder: 'What needs doing?', task_add: 'Add task', todo_empty: 'Nothing waiting.', due: 'Due', for_whom: 'For',
      et_candidate: 'Candidate', et_contact: 'Contact', et_job: 'Job', et_company: 'Company',
      kind_note: 'Note', kind_call: 'Call', kind_email: 'E-mail', kind_meeting: 'Meeting', kind_linkedin: 'LinkedIn',
      toast_status: 'Status: {s}', toast_star: 'Starred', toast_unstar: 'Removed from starred', toast_job: 'Job {id} created. Opening it.',
      toast_moved: '{c} → {s}', toast_placed: '{c} placed at {co}. Fee {f} logged in Placements.', toast_added: '{c} added to the shortlist.', toast_task: 'Task added.', toast_note: 'Note added.',
      hawk_title: 'AI Hawk', hawk_sub: 'Ask anything about your workspace', hawk_hello: 'Hi, I am AI Hawk. I know every role, company, job and candidate in this workspace. What do you need?',
      hawk_ph: 'Ask AI Hawk…', hawk_send: 'Send', hawk_kbd: 'Ctrl+K in the app',
      hq_core: 'How many CORE roles do my clients have open?', hq_pipe: 'Who is close to an offer?', hq_pitch: 'Who should I pitch today?', hq_draft: 'Draft an outreach for {co}',
      ha_core: 'Your clients have **{n} CORE roles** open right now ({t} new today). The newest:',
      ha_pipe: '**{n} candidates** are in the final round or have an offer:', ha_pipe_none: 'Nobody is in the final round right now.',
      ha_pitch: 'Three warm reasons to call today:', ha_pitch_stale: '{co} — {r} is open {d} days', ha_pitch_spike: '{co} — {n} new roles this week, a hiring push', ha_pitch_new: '{co} — fresh CORE role: {r}',
      ha_draft: 'Here is a first message to the likely hiring manager ({hm}) at {co}:', ha_draft_body: 'Hi,\n\nI saw you are hiring a {r} ({loc}). We place exactly this profile in the Czech market and I have two people in mind who could start the conversation this week.\n\nWould a 15-minute call on Thursday work?\n\nBest,\nYou',
      ha_fallback: 'In this sandbox I know a few questions. The full demo answers anything about the workspace: counts, lists, exports, status changes.', ha_show: 'Show in BD Master', ha_open_full: 'Ask it in the full demo',
    },
    cs: {
      ws_name: 'Demo Agency s.r.o.', ws_user: 'Vy · Vlastník', tier: 'AGENCY PRO', sample: 'Skutečné pozice · vymyšlená agentura', you: 'Vy', mock: 'ukázka',
      nav_section_bd: 'BD', nav_section_recruit: 'NÁBOR',
      nav_home: 'Domov', nav_scanner: 'Sken', nav_bd: 'BD Master', nav_analytics: 'Analytika trhu', nav_settings: 'Nastavení',
      nav_pipeline: 'Pipeline', nav_jobs: 'Zakázky', nav_companies: 'Firmy', nav_candidates: 'Kandidáti', nav_contacts: 'Kontakty', nav_placements: 'Umístění', nav_todo: 'Úkoly',
      open_full: 'Otevřít v plném demu', open_full_short: 'Plné demo',
      loading: 'Načítám ukázkový workspace…', load_failed: 'Ukázka teď nemohla načíst svá data.', load_failed_sub: 'Plné demo má stejný workspace.',
      tour_title: 'Vyzkoušejte', tour_open_role: 'Otevřít pozici', tour_status: 'Změnit její stav', tour_job: 'Udělat z ní zakázku', tour_move: 'Posunout kandidáta', tour_hawk: 'Zeptat se AI Hawka',
      tour_done_title: 'Tohle je denní smyčka TalentRadaru: najít pozici, získat zakázku, obsadit ji.', tour_done_text: 'Plné demo má stejný workspace ve skutečné aplikaci. Nebo si ho pusťte na vlastní seznam klientů.',
      tour_done_demo: 'Otevřít plné demo', tour_done_pilot: 'Vyzkoušet na 14 dní zdarma',
      greet_morning: 'Dobré ráno', greet_afternoon: 'Dobré odpoledne', greet_evening: 'Dobrý večer',
      home_meta: '{date} · poslední sken {last} (Praha) · další sken {next}', tomorrow: 'zítra', today_at: 'dnes {t}',
      w24: '24 h', w7: '7 dní', w30: '30 dní',
      kpi_new: 'nových pozic', kpi_new_sub: 'z toho {n} u klientů', kpi_core: 'z nich', kpi_core_sub: '{n} u klientů', kpi_hiring: 'firem nabírá', kpi_closed: 'pozic uzavřeno',
      cwn_title: 'Firmy s novými pozicemi', cwn_sub: '{w} · {n} firem s novými pozicemi', filter_companies: 'Filtrovat firmy',
      all: 'Vše', clients: 'Klienti', prospects: 'Prospekty', client: 'KLIENT', prospect: 'PROSPEKT',
      col_company: 'Firma', col_new: 'Nové', col_core: 'Core', col_active: 'Aktivní', col_top: 'Nejvyšší nová pozice', col_last: 'Poslední nová',
      grp_clients: 'KLIENTI', grp_prospects: 'PROSPEKTY', companies_n: '{n} {n:firma|firmy|firem}', roles_n: '{n} {n:pozice|pozice|pozic}',
      see_all_bd: 'Vše v BD Masteru', no_companies: 'Filtru neodpovídá žádná firma.',
      pipe_title: 'Radar', pipe_clients: 'aktivních pozic u klientů', pipe_prospects: 'aktivních pozic u prospektů', pipe_total: '{n} aktivních pozic u {c} firem',
      rec_title: 'Nábor dnes', rec_line: '{i} na pohovorech · {o} s nabídkou', rec_tasks: '{n} {n:úkol|úkoly|úkolů} pro vás na dnes', rec_open: 'Otevřít pipeline',
      att_title: 'Vyžaduje pozornost', att_stale: '{n} {n:pozice otevřená|pozice otevřené|pozic otevřených} 30+ dní', att_stale_sub: 'Interní tým je neobsadil. Nejteplejší důvod k oslovení.', att_show: 'Ukázat v BD Masteru',
      att_none: 'Zatím žádná pozice není otevřená 30+ dní', att_none_sub: 'Demo běží od 18. 10. Data zveřejnění inzerátů se doplňují s každým skenem.',
      spike_title: 'Skok náboru', spike_text: '{co}: {n} nových pozic za týden', spike_sub: 'Víc než obvykle. Nabídněte spolupráci na více pozic.',
      bd_sub: '{n} aktivních pozic u {c} firem · {t} nových dnes', tab_roles: 'Aktivní pozice', tab_dir: 'Adresář firem', tab_archive: 'Archiv pozic',
      q_starred: 'S hvězdičkou', q_new: 'Nové dnes', q_contact: 'K oslovení', q_contacted: 'Osloveno', q_talks: 'V jednání', q_stale: 'Otevřené 30+ dní',
      search_roles: 'Hledat pozici, firmu nebo ref', export_csv: 'Export CSV', exported: 'Staženo CSV s {n} pozicemi.',
      col_ref: 'Ref', col_role: 'Pozice', col_location: 'Lokalita', col_fit: 'Fit', col_status: 'Stav', col_seen: 'Poprvé',
      g_today: 'DNES', g_yesterday: 'VČERA', g_week: 'DŘÍVE TENTO TÝDEN', g_month: 'TENTO MĚSÍC', g_older: 'DŘÍVE',
      today: 'Dnes', yesterday: 'Včera', days_ago: 'před {n} d', open_days: 'otevřeno {n} d', just_now: 'právě teď',
      no_roles: 'Filtrům neodpovídá žádná pozice.', clear_filters: 'Zrušit filtry',
      dir_sub: 'Všechny firmy, které demo sleduje, s kariérní stránkou a ATS, na kterém běží.', col_type: 'Typ', col_ats: 'ATS', col_new7: 'Nové (7 d)', show_roles: 'Ukázat pozice',
      arch_sub: 'Pozice, které zmizely z kariérní stránky. Archivují se samy po dvou skenech bez nich.', col_closed: 'Uzavřeno', col_open_for: 'Bylo otevřeno',
      st_NEW: 'NOVÁ', st_ACTIVE: 'AKTIVNÍ', st_CONTACT_PENDING: 'K OSLOVENÍ', st_CONTACTED: 'OSLOVENO', st_IN_PROGRESS: 'V JEDNÁNÍ', st_ON_HOLD: 'ODLOŽENO', st_WON: 'ZÍSKÁNO', st_LOST: 'PROHRÁNO',
      p_of: '{n} z {total}', p_status: 'Stav', p_posting: 'Otevřít inzerát', p_job: 'Vytvořit zakázku', p_job_open: 'Zakázka {id}', p_close: 'Zavřít',
      pt_overview: 'Přehled', pt_hm: 'Hiring manager', pt_notes: 'Poznámky', pt_history: 'Historie',
      ai_summary: 'AI shrnutí', ai_generated: 'vygenerováno z inzerátu', ai_none: 'AI shrnutí se při skenu tvoří pro CORE pozice. Celý text najdete v inzerátu.',
      key_req: 'Klíčové požadavky', bd_hook: 'BD háček', fit_reason: 'Proč tento fit', scope: 'Rozsah pozice', work_model: 'Forma práce',
      hm_title: 'Pravděpodobný hiring manager', hm_src_interview: 'Z inzerátu: poslední kolo pohovoru je s tímto člověkem.', hm_src_reports_to: 'Z inzerátu: nadřízený této pozice.',
      hm_src_estimate: 'Odhad z názvu pozice a oddělení. Člověk s finálním slovem, ne panel pohovoru.',
      hm_likely: 'nejpravděpodobnější', hm_linkedin: 'Hledat na LinkedInu', hm_xray: 'Google X-Ray', hm_save: 'V plné aplikaci ho rozšíření pro Chrome uloží jako kontakt.', hm_known: 'Už ho máte v kontaktech',
      notes_empty: 'Zatím žádné poznámky. Napište první, @zmiňte kolegu.', note_ph: 'Přidat poznámku… zkuste @Tereza', note_add: 'Přidat',
      h_seen: 'Poprvé nalezena skenem', h_status: '{by}: stav → {s}', h_job: 'Vytvořena zakázka {id}', h_note: 'Přidána poznámka',
      seen_meta: 'Poprvé {d} · {ats} · {loc}', posted_meta: 'zveřejněno {d}',
      sc_sub: '{n} firem · všechny v automatickém skenu · limit tarifu až 200', sc_tab_companies: 'Firmy', sc_tab_schedule: 'Rozvrh',
      sc_next: 'Další automatický sken', sc_last: 'Poslední sken', sc_credits: 'Kredity na ruční sken tento týden',
      sc_tz: 'Europe/Prague · {freq} · {n} firem', sc_change: 'Změnit rozvrh',
      sc_last_v: '{n} firem · {s} s · {f} nových pozic', sc_all_ok: 'Všechny kariérní stránky odpověděly normálně',
      sc_credit_note: '1 kredit = 1 firma · automatické skeny jsou zdarma', avail: 'K DISPOZICI',
      sc_search: 'Hledat firmu nebo URL kariérní stránky…', sc_scan_all: 'Skenovat vše ({n})', sc_scan: 'Sken', sc_scanning: 'Skenuji…', sc_queued: 'Ve frontě',
      col_careers: 'Kariérní stránka', col_roles: 'Aktivní pozice', col_auto: 'Auto-sken', col_lastscan: 'Poslední sken', on: 'Zap.',
      sc_add_title: 'Přidat firmu', sc_add_ph: 'Vložte URL kariérní stránky, např. jobs.lever.co/vasklient', sc_add_btn: 'Přidat', sc_add_detect: 'Rozpoznáno: {ats}. Skenuje se od dalšího běhu.',
      sc_add_bad: 'Vložte adresu kariérní stránky.',
      sc_run_title: 'Skenuji {n} firem', sc_run_now: 'Čtu {co} ({ats})…',
      sc_done_title: 'Sken hotový za {s} s', sc_done_text: 'Přečteno {c} firem · beze změn od automatického skenu v {t}', sc_done_view: 'Ukázat dnešní nové pozice',
      sc_one_none: '{co}: beze změn od posledního skenu ({n} aktivních pozic).',
      sched_title: 'Automatické skeny', sched_sub: 'Skeny běží v časovém pásmu workspace. Ruční skeny čerpají kredity.',
      f1: '1× denně', f1_t: '06:00', f2: '2× denně', f2_t: '06:00 a 12:00', f4: '4× denně', f4_t: '06:00, 10:00, 14:00, 18:00', f4_tag: 'Enterprise',
      an_title: 'Analytika trhu', an_sub: 'Tempo náboru, poptávka po technologiích a kde sledované firmy nabírají.',
      an_total: 'Sledované pozice', an_total_sub: 'otevřené u {n} firem', an_progress: 'Pozice v procesu', an_progress_sub: 'k oslovení, osloveno nebo v jednání',
      an_ratio: 'Podíl CORE', an_ratio_sub: '{n} pozic splňuje vaše hlavní kritéria', an_velocity: 'Tempo náboru', an_velocity_sub: 'nových pozic za posledních {w}',
      an_stack: 'Poptávka po technologiích a funkcích', an_stack_sub: 'Otevřené pozice podle oblasti, z jejich názvů', an_top: 'Firmy, které nejvíc nabírají', an_top_sub: 'Podle počtu otevřených pozic',
      an_daily: 'Nové pozice po dnech', an_daily_sub: 'Posledních 14 dní, všechny sledované firmy', roles_word: 'pozic',
      set_tab_spec: 'Specializace', set_tab_modules: 'Moduly', set_tab_schedule: 'Rozvrh skenů',
      spec_title: 'Profil pozic agentury', spec_sub: 'Co obsazujete, rozhoduje, co přistane jako CORE. Každá nová pozice se porovná s profilem, pak ji posoudí AI.',
      spec_core: 'CORE · obsazujete', spec_sel: 'SELECTIVE · občas', spec_skip: 'SKIP · nikdy',
      mk_title: 'Trhy', mk_core: 'Hlavní trhy', mk_sel: 'Selektivní trhy', mk_block: 'Blokované trhy',
      test_title: 'Vyzkoušet název pozice', test_ph: 'např. Senior Data Engineer', test_loc: 'Lokalita', test_btn: 'Vyzkoušet',
      test_r_core: 'Odpovídá vašemu CORE profilu ({k}).', test_r_sel: 'Odpovídá SELECTIVE rodině ({k}).', test_r_skip: 'Je ve vašem seznamu SKIP ({k}).',
      test_r_none: 'V profilu není. Rozhodne AI podle inzerátu; tady by přistála jako SELECTIVE.',
      test_cap_sel: 'Lokalita je selektivní trh, takže nejvýš SELECTIVE.', test_cap_block: 'Lokalita je blokovaný trh, takže SKIP.',
      mod_title: 'Moduly', mod_sub: 'Zapněte části TalentRadaru, které agentura používá. Vypnutý modul zmizí z menu.',
      mod_bd: 'BD radar', mod_bd_d: 'Domov, Sken, BD Master, Analytika trhu, plánované skeny.',
      mod_ats: 'Light ATS (Nábor)', mod_ats_d: 'Pipeline, zakázky, firmy, kandidáti, kontakty, umístění a úkoly. Z pozice je zakázka jedním klikem.',
      mode_a: 'Jen radar · radar vedle vašeho ATS (Bullhorn, Datacruit, Recruitis…)', mode_b: 'Radar + ATS · radar i ATS na jednom místě',
      ats_off: 'Nábor je v tomto workspace vypnutý (režim Jen radar).', ats_turn_on: 'Zapnout',
      search: 'Hledat…', mine: 'Moje', everyone: 'Všichni', owner: 'Vlastník',
      ps_SHORTLISTED: 'Shortlist', ps_INTERESTED: 'Má zájem', ps_CV_READY: 'CV připraveno', ps_CV_SENT: 'CV odesláno', ps_SENDOUT: 'Sendout',
      ps_INTERVIEW_1: '1. kolo', ps_INTERVIEW_2: '2. kolo', ps_FINAL: 'Finále', ps_OFFER: 'Nabídka', ps_PLACED: 'Umístěn',
      ps_REJECTED_CANDIDATE: 'Odmítl kandidát', ps_REJECTED_CLIENT: 'Odmítl klient', ps_OFFER_DECLINED: 'Nabídka odmítnuta', ps_REJECTED_CONSULTANT: 'Vyřadil konzultant',
      grp_short: 'Shortlist', grp_cv: 'CV', grp_int: 'Pohovory', grp_offer: 'Nabídka', grp_placed: 'Umístěn', grp_rejected: 'Vyřazení',
      cs_TARGET: 'Cíl', cs_CALLBACK: 'Zavolat', cs_ENGAGED: 'V kontaktu', cs_LIVE: 'V procesu', cs_PLACED: 'Umístěn', cs_ARCHIVED: 'Archiv',
      js_OPEN: 'Otevřená', js_ON_HOLD: 'Pozastavená', js_FILLED: 'Obsazená', js_CLOSED: 'Uzavřená', jt_PERMANENT: 'HPP', jt_CONTRACT: 'Kontrakt',
      pipeline_sub: '{n} {n:kandidát|kandidáti|kandidátů} v {jobs} {jobs:otevřené zakázce|otevřených zakázkách|otevřených zakázkách}', any_job: 'Zakázka: všechny', show_rejected: 'Ukázat vyřazené',
      in_stage: 'Ve fázi {n} d', advance: 'Posunout', move_to: 'Přesunout do…', board_empty: 'V této pipeline zatím nikdo není. Přidejte kandidáty do zakázky.',
      jobs_sub: '{open} {open:otevřená|otevřené|otevřených} · {hold} {hold:pozastavená|pozastavené|pozastavených}', col_title: 'Zakázka', col_pipeline: 'Pipeline', col_owner: 'Konzultant', col_opened: 'Otevřeno',
      pl_a: '{n} v procesu', pl_i: '{n} {n:pohovor|pohovory|pohovorů}', pl_o: '{n} {n:nabídka|nabídky|nabídek}', pl_p: '{n} umístěno', pl_none: 'zatím nikdo',
      job_from_role: 'Z pozice {ref}', back_to_jobs: 'Zakázky', hiring_manager: 'Hiring manager', no_contact: 'Bez kontaktu', fee: 'Fee', salary: 'Mzda',
      job_pipeline_empty: 'V této zakázce zatím nejsou žádní kandidáti.', add_candidate: 'Přidat kandidáta', pick_candidate: 'Vyberte kandidáta…', job_notes: 'Poznámky k zakázce',
      companies_sub: '{n} {n:firma|firmy|firem}', scope_recruit: 'V Náboru', scope_all: 'Všechny',
      col_contacts: 'Kontakty', col_open_jobs: 'Zakázky', col_placements: 'Umístění', col_radar_roles: 'Pozice z radaru', col_last_touch: 'Poslední kontakt',
      last_touch_never: 'zatím bez kontaktu', open_in_bdm: 'Otevřít v BD Masteru', tab_people: 'Kontakty', tab_jobs: 'Zakázky', tab_company_notes: 'Poznámky k firmě', tab_radar_roles: 'Pozice z radaru',
      company_no_contacts: 'U firmy zatím nikoho nemáte.', crm_none: 'Zatím nic.',
      candidates_sub: '{n} {n:člověk|lidé|lidí} v databázi', any_status: 'Aktivní (bez archivu)', col_name: 'Jméno', col_current: 'Současná pozice', col_process: 'V procesu', col_updated: 'Upraveno',
      search_cand: 'Jméno nebo pozice…', current_title: 'Současná pozice', salary_expectation: 'Očekávaná mzda', notice_period: 'Výpovědní lhůta', source: 'Zdroj', summary: 'Shrnutí',
      tab_overview: 'Přehled', tab_notes: 'Poznámky', tab_history: 'Historie', add_to_job: 'Přidat do zakázky', pick_job: 'Vyberte zakázku…', no_applications: 'Kandidát zatím není v žádné zakázce.', no_history: 'Zatím žádné posuny.',
      history_added: 'přidán do „{job}“ jako {stage}', history_moved: '„{job}“: {from} → {to}',
      contacts_sub: '{n} {n:člověk|lidé|lidí} u firem', only_hm: 'Jen hiring manageři', col_contact: 'Kontakt', hm_badge: 'HM', contact_jobs: 'Zakázky u firmy', no_jobs: 'U firmy zatím nejsou zakázky.',
      placements_title: 'Umístění a fee', placements_sub: '{n} {n:umístění|umístění|umístění} v období', period_month: 'Tento měsíc', period_quarter: 'Čtvrtletí', period_year: 'Tento rok', period_all: 'Vše',
      total_fee: 'Fee celkem', total_invoiced: 'Fakturováno', total_paid: 'Zaplaceno', total_count: 'Umístění',
      inv_NOT_INVOICED: 'Nefakturováno', inv_INVOICED: 'Fakturováno', inv_PAID: 'Zaplaceno', inv_CANCELLED: 'Storno', fallen_off: 'Odpadl',
      col_placed: 'Umístění', col_date: 'Datum', col_start: 'Nástup', col_fee: 'Fee', col_invoice: 'Faktura', consultant: 'Konzultant', placements_empty: 'V tomto období žádná umístění.',
      todo_sub_mine: 'Vaše úkoly a domluvené hovory', todo_sub_all: 'Úkoly celého týmu',
      gt_overdue: 'PO TERMÍNU', gt_today: 'DNES', gt_upcoming: 'PŘIPRAVENÉ', gt_no_date: 'BEZ TERMÍNU', gt_done: 'HOTOVO', show_done: 'Ukázat hotové',
      task_placeholder: 'Co je potřeba udělat?', task_add: 'Přidat úkol', todo_empty: 'Nic nečeká.', due: 'Termín', for_whom: 'Pro koho',
      et_candidate: 'Kandidát', et_contact: 'Kontakt', et_job: 'Zakázka', et_company: 'Firma',
      kind_note: 'Poznámka', kind_call: 'Hovor', kind_email: 'E-mail', kind_meeting: 'Schůzka', kind_linkedin: 'LinkedIn',
      toast_status: 'Stav: {s}', toast_star: 'Přidáno do hvězdiček', toast_unstar: 'Odebráno z hvězdiček', toast_job: 'Zakázka {id} vytvořena. Otevírám ji.',
      toast_moved: '{c} → {s}', toast_placed: '{c} umístěn u {co}. Fee {f} je v Umístěních.', toast_added: '{c} přidán na shortlist.', toast_task: 'Úkol přidán.', toast_note: 'Poznámka přidána.',
      hawk_title: 'AI Hawk', hawk_sub: 'Zeptejte se na cokoli o svém workspace', hawk_hello: 'Ahoj, jsem AI Hawk. Znám každou pozici, firmu, zakázku a kandidáta v tomto workspace. Co potřebujete?',
      hawk_ph: 'Zeptejte se AI Hawka…', hawk_send: 'Odeslat', hawk_kbd: 'V aplikaci Ctrl+K',
      hq_core: 'Kolik CORE pozic mají klienti otevřených?', hq_pipe: 'Kdo je blízko nabídky?', hq_pitch: 'Koho mám dnes oslovit?', hq_draft: 'Napiš oslovení pro {co}',
      ha_core: 'Vaši klienti mají právě otevřených **{n} CORE pozic** ({t} nových dnes). Nejnovější:',
      ha_pipe: '**{n} kandidátů** je ve finále nebo má nabídku:', ha_pipe_none: 'Ve finále teď nikdo není.',
      ha_pitch: 'Tři teplé důvody, proč dnes volat:', ha_pitch_stale: '{co} — {r} je otevřená {d} dní', ha_pitch_spike: '{co} — {n} nových pozic za týden, nábor zrychluje', ha_pitch_new: '{co} — čerstvá CORE pozice: {r}',
      ha_draft: 'Tady je první zpráva pro pravděpodobného hiring managera ({hm}) ve firmě {co}:', ha_draft_body: 'Dobrý den,\n\nviděl jsem, že hledáte {r} ({loc}). Přesně tenhle profil obsazujeme a mám v hlavě dva lidi, se kterými můžeme mluvit už tento týden.\n\nHodil by se vám ve čtvrtek 15minutový hovor?\n\nS pozdravem\nVy',
      ha_fallback: 'V sandboxu znám jen pár otázek. Plné demo odpoví na cokoli o workspace: počty, seznamy, exporty, změny stavů.', ha_show: 'Ukázat v BD Masteru', ha_open_full: 'Zeptat se v plném demu',
    },
  };

  /* ═══════════════════════ Constants ═══════════════════════ */
  const ROLE_STATUSES = ['NEW', 'ACTIVE', 'CONTACT_PENDING', 'CONTACTED', 'IN_PROGRESS', 'ON_HOLD', 'WON', 'LOST'];
  const KEPT_BY_JOB = ['WON', 'LOST'];
  const FLOW = ['SHORTLISTED', 'INTERESTED', 'CV_READY', 'CV_SENT', 'SENDOUT', 'INTERVIEW_1', 'INTERVIEW_2', 'FINAL', 'OFFER', 'PLACED'];
  const REJECTED = ['REJECTED_CANDIDATE', 'REJECTED_CLIENT', 'OFFER_DECLINED', 'REJECTED_CONSULTANT'];
  const BOARD = [
    ['short', ['SHORTLISTED', 'INTERESTED'], 'text-[#8A90A2]'], ['cv', ['CV_READY', 'CV_SENT', 'SENDOUT'], 'text-[#38BDF8]'],
    ['int', ['INTERVIEW_1', 'INTERVIEW_2', 'FINAL'], 'text-[#FF7733]'], ['offer', ['OFFER'], 'text-[#FBBF24]'], ['placed', ['PLACED'], 'text-[#34D399]'],
  ];
  const INTERVIEWS = ['INTERVIEW_1', 'INTERVIEW_2', 'FINAL'];
  const DEFAULT_BASE_SALARY = 1560000;   // what scripts/demo_ats.py gives a fresh placement
  const SCAN_TIMES = { 1: ['06:00'], 2: ['06:00', '12:00'], 4: ['06:00', '10:00', '14:00', '18:00'] };
  const DAY = 86400000;

  /* ═══════════════════════ State ═══════════════════════ */
  const state = {
    loaded: false, failed: false, now: Date.now(),
    screen: 'home',
    users: {}, companies: [], roles: [], archived: [], dailyNew: {}, scan: {},
    contacts: [], jobs: [], candidates: [], apps: [], events: [], notes: [], tasks: [], placements: [],
    homeWindow: 7, homeSeg: 'all', homeQuery: '', homeOpen: {},
    bdTab: 'roles', bdSeg: 'all', bdQuick: '', bdFit: 'all', bdQuery: '', bdCompany: null,
    panel: null, panelTab: 'overview',
    rec: null, recTab: 'overview',
    credits: 500, scanRun: null, scanned: false, scanFreq: 2,
    scTab: 'companies', scQuery: '', addMsg: null,
    anWindow: 7, setTab: 'spec', testResult: null,
    atsOn: true,
    pipeJob: 'all', pipeRejected: false,
    jobOpen: null, jobsStatus: 'active',
    coScope: 'recruit', coQuery: '',
    candQuery: '', candArchive: false,
    contactQuery: '', contactHm: false,
    plPeriod: 'year',
    todoMine: true, todoDone: false,
    hawkOpen: false, hawk: [], hawkBusy: false,
    tour: { open_role: false, status: false, job: false, move: false, hawk: false }, tourHidden: false,
    toast: null,
  };

  /* ═══════════════════════ Helpers ═══════════════════════ */
  const lang = () => (window.TRLang && window.TRLang.current && window.TRLang.current() === 'cs' ? 'cs' : 'en');
  const locale = () => (lang() === 'cs' ? 'cs-CZ' : 'en-GB');
  // "{n:kandidát|kandidáti|kandidátů}" is the word for the number in {n}, as in the app.
  function plural(n, forms) {
    if (lang() === 'cs') return forms[n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2] ?? forms[forms.length - 1];
    return forms[n === 1 ? 0 : 1] ?? forms[forms.length - 1];
  }
  function t(key, vars) {
    let s = (S[lang()] && S[lang()][key]) ?? S.en[key] ?? key;
    s = s.replace(/\{(\w+):([^}]*)\}/g, (_, name, forms) => plural(Number(vars && vars[name]) || 0, forms.split('|')));
    if (vars) for (const k in vars) s = s.split(`{${k}}`).join(vars[k]);
    return s;
  }
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const ic = (name, cls = 'text-[18px]') => `<span class="material-symbols-outlined tr-ic ${cls}" aria-hidden="true">${name}</span>`;
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>');
  const fmt = (n) => new Intl.NumberFormat(locale()).format(Math.round(n || 0));
  const money = (n, cur = 'CZK') => new Intl.NumberFormat(locale(), { style: 'currency', currency: cur || 'CZK', maximumFractionDigits: 0 }).format(n || 0);
  const parse = (iso) => { const ms = iso ? Date.parse(iso) : NaN; return Number.isFinite(ms) ? ms : null; };
  const daysSince = (ms) => (ms == null ? 0 : Math.max(0, Math.floor((state.now - ms) / DAY)));
  const pragueDay = (ms) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Prague' }).format(new Date(ms));
  const pragueTime = (ms) => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Prague' }).format(new Date(ms));
  const pragueHour = () => Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Europe/Prague' }).format(new Date()));
  const fmtDate = (ms) => (ms == null ? '—' : new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'short', timeZone: 'Europe/Prague' }).format(new Date(ms)));
  const todayStr = () => pragueDay(Date.now());
  function seenLabel(days) {
    if (days === 0) return t('today');
    if (days === 1) return t('yesterday');
    return t('days_ago', { n: days });
  }
  function agoLabel(ms) {
    const d = daysSince(ms);
    if (ms != null && state.now - ms < 3600000) return t('just_now');
    return d === 0 ? `${t('today').toLowerCase()} ${pragueTime(ms)}` : seenLabel(d).toLowerCase();
  }
  const co = (id) => state.companies.find((c) => c.id === id) || { id, name: '—', client: false, ats: '', careers: '', active: 0 };
  const userName = (id) => (id === 1 ? t('you') : (state.users[id] || '—'));
  const byName = (name) => (name === state.users[1] ? t('you') : name);
  const initials = (name) => String(name || '?').split(/\s+/).map((p) => p[0] || '').join('').slice(0, 2).toUpperCase();
  const isStale = (r) => r.open >= 30;
  const jobRef = (id) => `J-${id}`;
  const candOf = (id) => state.candidates.find((c) => c.id === id);
  const jobOf = (id) => state.jobs.find((j) => j.id === id);
  const contactOf = (id) => state.contacts.find((c) => c.id === id);
  const roleOf = (id) => state.roles.find((r) => r.id === id);

  const BTN_P = 'inline-flex items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-[#FF5500] bg-[#FF5500]/[0.12] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:border-[#FF7733] hover:bg-[#FF5500]/[0.22] cursor-pointer';
  const BTN_S = 'inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.12] bg-[#0F1117] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[#FF5500] hover:bg-[#FF5500]/[0.08] cursor-pointer';
  const CHIP = (on) => `inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${on ? 'border-[#FF5500] bg-[#FF5500]/[0.12] text-white' : 'border-[#1B1E26] bg-[#0F1117] text-[#8A90A2] hover:text-white'}`;
  const CARD = 'rounded-xl border border-[#1B1E26] bg-[#0F1117]';
  const LABEL = 'font-mono text-[10px] font-bold uppercase tracking-wider';
  const INPUT = 'rounded-lg border border-[#1B1E26] bg-[#0F1117] text-xs text-white placeholder:text-[#5A6275] focus:border-[#FF5500] focus:outline-none';
  const TH = 'font-mono text-[9.5px] uppercase tracking-wider text-[#5A6275]';
  const ROW = 'border-t border-[#1B1E26]/60 px-3 py-2.5 transition-colors hover:bg-[#151720] cursor-pointer';

  function fitBadge(fit) {
    const c = fit === 'CORE' ? 'border-[#FF5500]/40 bg-[#FF5500]/[0.12] text-[#FF7733]' : fit === 'SELECTIVE' ? 'border-[#38BDF8]/35 bg-[#38BDF8]/10 text-[#38BDF8]' : 'border-white/10 bg-white/5 text-[#8A90A2]';
    return `<span class="inline-block rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-bold ${c}">${esc(fit)}</span>`;
  }
  function statusBadge(st) {
    // Same looks as the app (frontend/src/bdm/ui.tsx, STATUS_TONE): every status its own.
    const c = { NEW: 'border-white/50 bg-white/10 text-white', ACTIVE: 'border-[#8A90A2]/50 bg-transparent text-[#8A90A2]', CONTACT_PENDING: 'border-[#FBBF24]/40 bg-[#FBBF24]/[0.12] text-[#FBBF24]', CONTACTED: 'border-[#38BDF8]/40 bg-[#38BDF8]/[0.12] text-[#38BDF8]', IN_PROGRESS: 'border-[#FF5500]/50 bg-[#FF5500]/[0.12] text-[#FF5500]', ON_HOLD: 'border-[#A78BFA]/40 bg-[#A78BFA]/[0.12] text-[#A78BFA]', WON: 'border-[#10B981]/50 bg-[#10B981]/15 text-[#10B981]', LOST: 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]' }[st] || 'border-transparent bg-white/5 text-[#5A6275]';
    return `<span class="inline-block whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-bold ${c}">${esc(t('st_' + st))}</span>`;
  }
  function pill(text, tone) {
    const c = { green: 'border-[#10B981]/40 bg-[#10B981]/10 text-[#34D399]', orange: 'border-[#FF5500]/40 bg-[#FF5500]/[0.12] text-[#FF7733]', blue: 'border-[#38BDF8]/35 bg-[#38BDF8]/10 text-[#38BDF8]', amber: 'border-[#FBBF24]/40 bg-[#FBBF24]/10 text-[#FBBF24]', red: 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#F87171]' }[tone] || 'border-white/10 bg-white/5 text-[#8A90A2]';
    return `<span class="inline-block whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase ${c}">${esc(text)}</span>`;
  }
  const mockTag = () => `<span class="ml-1 inline-block rounded border border-white/10 px-1 font-mono text-[8.5px] uppercase text-[#5A6275]">${esc(t('mock'))}</span>`;
  function typeBadge(c) {
    return c.client
      ? `<span class="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-[#FF5500]/50 bg-[#FF5500]/[0.12] font-mono text-[9px] font-bold text-[#FF7733]" title="${esc(t('client'))}">${lang() === 'cs' ? 'K' : 'C'}</span>`
      : `<span class="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-[#38BDF8]/40 bg-[#38BDF8]/10 font-mono text-[9px] font-bold text-[#38BDF8]" title="${esc(t('prospect'))}">P</span>`;
  }
  const atsBadge = (ats) => (ats ? `<span class="inline-block rounded border border-[#1B1E26] bg-[#0B0E14] px-1.5 py-0.5 font-mono text-[9px] uppercase text-[#8A90A2]">${esc(lang() === 'en' && ats === 'Kariérní web' ? 'Careers site' : ats)}</span>` : '');
  const avatar = (name, cls = 'h-6 w-6 text-[9.5px]') => `<span class="flex flex-shrink-0 items-center justify-center rounded-full bg-[#1B1E26] font-mono font-bold text-[#FF7733] ${cls}">${esc(initials(name))}</span>`;
  function openFull(screen, extra = '') {
    return `<a href="${demoLink(screen)}" target="_blank" rel="noopener noreferrer" class="${BTN_S} ${extra}">${ic('open_in_new', 'text-[15px]')}<span>${esc(t('open_full'))}</span></a>`;
  }
  function header(title, sub, right = '') {
    return `<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0"><h3 class="text-lg font-bold text-white sm:text-xl">${title}</h3>${sub ? `<p class="mt-0.5 text-xs text-[#8A90A2]">${sub}</p>` : ''}</div>
      <div class="flex flex-shrink-0 flex-wrap items-center gap-2">${right}</div></div>`;
  }
  const searchBox = (key, value, ph, cls = 'sm:w-64') => `<label class="relative block ${cls}"><span class="sr-only">${esc(ph)}</span>${ic('search', 'pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#5A6275]')}
    <input data-input="${key}" value="${esc(value)}" placeholder="${esc(ph)}" class="w-full ${INPUT} py-1.5 pr-2 pl-8"></label>`;
  const tabsBar = (items, cur, action) => `<div class="tr-sb-scroll flex gap-5 overflow-x-auto border-b border-[#1B1E26]">${items.map(([v, label, n]) => `<button type="button" data-a="${action}" data-v="${v}" class="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-1 pb-2 text-[13px] cursor-pointer ${cur === v ? 'border-[#FF5500] font-semibold text-white' : 'border-transparent text-[#8A90A2] hover:text-white'}">${esc(label)}${n != null ? `<span class="rounded bg-[#1B1E26] px-1.5 font-mono text-[10px] text-[#8A90A2]">${n}</span>` : ''}</button>`).join('')}</div>`;
  const empty = (text) => `<div class="border-t border-[#1B1E26] py-8 text-center text-xs text-[#8A90A2]">${esc(text)}</div>`;

  /* ═══════════════════════ Data ═══════════════════════ */
  function hydrate(feed) {
    const now = Date.now();
    state.now = now;
    state.users = {};
    (feed.users || []).forEach((u) => { state.users[u.id] = u.name; });
    state.scan = feed.scan || {};
    state.dailyNew = feed.daily_new || {};
    state.roles = (feed.roles || []).map((r) => {
      const seen = parse(r.seen);
      const posted = parse(r.posted);
      return {
        id: r.id, ref: `C${r.id + 2100}`, co: r.co, title: r.title, loc: r.loc || '', fit: r.fit || 'CORE', status: r.status || 'NEW', url: r.url,
        dept: r.dept || '', why: r.why || '', summary: r.summary || '', specs: r.specs || {}, hm: r.hm || { source: 'estimate', targets: [] },
        seen, posted, age: daysSince(seen), open: daysSince(posted != null && posted < (seen ?? now) ? posted : seen),
        starred: !!r.star, notes: [], history: [],
      };
    });
    const roleIds = new Set(state.roles.map((r) => r.id));
    (feed.role_notes || []).forEach((n) => { if (roleIds.has(n.role)) roleOf(n.role).notes.push({ by: byName(n.by), text: n.body, at: parse(n.at) }); });
    (feed.role_history || []).forEach((h) => { if (roleIds.has(h.role)) roleOf(h.role).history.push({ kind: 'status', to: h.to, by: byName(h.by), at: parse(h.at) }); });
    state.companies = (feed.companies || []).map((c) => {
      let domain = '';
      try { domain = new URL(c.careers).hostname.replace(/^www\./, ''); } catch (e) { domain = ''; }
      return { ...c, domain, scan: 'idle', active: state.roles.filter((r) => r.co === c.id).length };
    });
    state.archived = (feed.archived || []).map((a) => ({ ...a, seen: parse(a.seen), closed: parse(a.closed) }));
    state.contacts = (feed.contacts || []).map((c) => ({ ...c }));
    state.jobs = (feed.jobs || []).map((j) => ({ ...j, created: parse(j.created) }));
    state.candidates = (feed.candidates || []).map((c) => ({ ...c, created: parse(c.created), updated: parse(c.updated) }));
    state.apps = (feed.applications || []).map((a) => ({ ...a, since: parse(a.since), created: parse(a.created) }));
    state.events = (feed.pipeline_events || []).map((e) => ({ ...e, by: byName(e.by), at: parse(e.at) }));
    state.notes = (feed.notes || []).map((n) => ({ ...n, by: byName(n.by), at: parse(n.at) }));
    state.tasks = (feed.tasks || []).map((x) => ({ ...x }));
    state.placements = (feed.placements || []).map((p) => ({ ...p, placed: parse(p.placed) }));
    // The busiest client opens on Home, like a morning in the app.
    const top = homeGroups(7).clients[0];
    if (top) state.homeOpen[top.c.id] = true;
    state.loaded = true;
  }

  async function load() {
    for (const url of FEED_URLS) {
      try {
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) continue;
        const feed = await res.json();
        if (!feed || !Array.isArray(feed.roles) || !feed.roles.length) continue;
        hydrate(feed);
        render();
        return;
      } catch (e) { /* the next source */ }
    }
    state.failed = true;
    render();
  }

  /* ═══════════════════════ Shell ═══════════════════════ */
  const NAV = [
    { section: 'nav_section_bd', items: [['home', 'home'], ['scanner', 'radar'], ['bd', 'table_chart'], ['analytics', 'monitoring']] },
    { section: 'nav_section_recruit', ats: true, items: [['pipeline', 'view_kanban'], ['jobs', 'work'], ['companies', 'apartment'], ['candidates', 'person_search'], ['contacts', 'contacts'], ['placements', 'paid'], ['todo', 'task_alt']] },
    { section: null, items: [['settings', 'settings']] },
  ];
  const RECRUIT = NAV[1].items.map(([s]) => s);
  const navLabel = (s) => t({ home: 'nav_home', scanner: 'nav_scanner', bd: 'nav_bd', analytics: 'nav_analytics', settings: 'nav_settings', pipeline: 'nav_pipeline', jobs: 'nav_jobs', companies: 'nav_companies', candidates: 'nav_candidates', contacts: 'nav_contacts', placements: 'nav_placements', todo: 'nav_todo' }[s]);
  const myTasksDue = () => state.tasks.filter((x) => x.for === 1 && !x.done && x.due && x.due <= todayStr()).length;

  function renderShell() {
    const sections = NAV.filter((n) => !n.ats || state.atsOn);
    const newToday = state.roles.filter((r) => r.age === 0).length;
    const badge = (s) => {
      if (s === 'home' && newToday) return `<span class="rounded bg-[#FF5500]/[0.18] border border-[#FF5500]/50 px-1.5 py-px font-mono text-[9px] font-extrabold text-white">${newToday}</span>`;
      if (s === 'todo' && myTasksDue()) return `<span class="rounded border border-[#FBBF24]/40 px-1.5 py-px font-mono text-[9px] font-bold text-[#FBBF24]">${myTasksDue()}</span>`;
      return '';
    };
    const side = sections.map((sec) => `${sec.section ? `<div class="px-2.5 pt-3 pb-1 font-mono text-[9px] font-bold tracking-[0.16em] text-[#5A6275]">${esc(t(sec.section))}</div>` : '<div class="my-2 border-t border-[#1B1E26]"></div>'}
      ${sec.items.map(([s, icon]) => {
        const on = s === state.screen;
        return `<button type="button" data-a="go" data-v="${s}" aria-current="${on ? 'page' : 'false'}" class="flex w-full items-center gap-2.5 rounded-lg border-l-2 px-2.5 py-[6px] text-left text-[12.5px] transition-colors cursor-pointer ${on ? 'border-[#FF5500] bg-[#FF5500]/[0.12] font-semibold text-white' : 'border-transparent text-[#8A90A2] hover:bg-[#151720] hover:text-white'}">
          ${ic(icon, 'text-[18px]')}<span class="flex-1 truncate">${esc(navLabel(s))}</span>${badge(s)}</button>`;
      }).join('')}`).join('');
    const top = sections.flatMap((sec) => sec.items).map(([s, icon]) => {
      const on = s === state.screen;
      return `<button type="button" data-a="go" data-v="${s}" class="flex flex-shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[12.5px] whitespace-nowrap transition-colors cursor-pointer ${on ? 'border-[#FF5500] bg-[#FF5500]/[0.12] font-semibold text-white' : 'border-transparent text-[#8A90A2] hover:text-white'}">${ic(icon, 'text-[17px]')}${esc(navLabel(s))}</button>`;
    }).join('');
    let path = SCREEN_PATHS[state.screen] || '/';
    if (state.screen === 'jobs' && state.jobOpen) path = `/jobs/${state.jobOpen}`;
    const urlText = `app.talentradar.eu${path}`;

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
      <div class="relative flex lg:h-[720px]">
        <aside class="hidden w-52 flex-shrink-0 flex-col border-r border-[#1B1E26] bg-[#090C12] lg:flex">
          <div class="flex items-center gap-2.5 px-4 pt-4 pb-2"><img src="falcon.svg" alt="" class="h-7 w-7 object-contain"><div><div class="text-[14px] font-extrabold leading-none tracking-tight text-white">TALENT<span class="text-[#FF5500]">RADAR</span></div><div class="mt-1 font-mono text-[8.5px] tracking-[0.18em] text-[#5A6275]">BD RECRUITMENT</div></div></div>
          <nav class="tr-sb-scroll flex-1 overflow-y-auto px-2" aria-label="Sandbox menu">${side}</nav>
          <div class="p-2.5"><div class="rounded-xl border border-[#1B1E26] bg-[#0F1117] p-2.5">
            <span class="mb-1 inline-block rounded border border-[#FF5500]/40 bg-[#FF5500]/[0.12] px-1.5 py-0.5 font-mono text-[9px] text-[#FF5500]">${t('tier')}</span>
            <div class="text-[12.5px] font-bold leading-snug text-white">${esc(t('ws_name'))}</div><div class="mt-0.5 text-[11px] text-[#8A90A2]">${esc(t('ws_user'))}</div></div></div>
        </aside>
        <main id="trSbMain" class="tr-sb-scroll relative min-w-0 flex-1 overflow-y-auto bg-[#0B0E14] lg:h-full">
          ${renderTour()}
          <div class="p-3 pb-20 sm:p-5 sm:pb-20">${renderScreen()}</div>
        </main>
        ${renderPanel()}
        ${renderRec()}
        ${renderHawk()}
      </div>
      ${state.toast ? `<div class="pointer-events-none fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 lg:absolute lg:z-50 rounded-lg border border-[#10B981]/40 bg-[#0F1117] px-3.5 py-2 text-xs font-semibold text-white shadow-2xl">${ic('check_circle', 'text-[15px] align-[-3px] text-[#34D399]')} ${esc(state.toast)}</div>` : ''}
    </div>`;
  }
  function renderPlaceholder() {
    const inner = state.failed
      ? `<div class="max-w-sm text-center"><p class="text-sm font-semibold text-white">${esc(t('load_failed'))}</p><p class="mt-1 text-xs text-[#8A90A2]">${esc(t('load_failed_sub'))}</p><a href="${demoLink('home')}" target="_blank" rel="noopener noreferrer" class="${BTN_P} mt-3">${esc(t('tour_done_demo'))} ${ic('open_in_new', 'text-[14px]')}</a></div>`
      : `<span class="flex items-center gap-2"><span class="tr-spin inline-block h-3.5 w-3.5 rounded-full border-2 border-[#FF5500] border-t-transparent"></span>${esc(t('loading'))}</span>`;
    return `<div class="flex h-[480px] items-center justify-center rounded-2xl border border-[#1B1E26] bg-[#0B0E14] px-4 font-mono text-xs text-[#8A90A2]">${inner}</div>`;
  }

  /* ── Tour ── */
  function tourSteps() {
    const steps = [['open_role', 'tour_open_role'], ['status', 'tour_status']];
    if (state.atsOn) steps.push(['job', 'tour_job'], ['move', 'tour_move']);
    steps.push(['hawk', 'tour_hawk']);
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
        <span class="flex h-4 w-4 items-center justify-center rounded-full border font-mono text-[9px] font-bold ${ok ? 'border-[#10B981] bg-[#10B981]/20 text-[#34D399]' : 'border-white/20 text-[#8A90A2]'}">${ok ? ic('check', 'text-[11px]') : i + 1}</span>${esc(t(label))}</span>`;
    }).join('<span class="hidden text-[#3A4050] sm:inline">›</span>');
    return `<div class="tr-sb-scroll flex items-center gap-3 overflow-x-auto border-b border-[#1B1E26] bg-[#0D1018] px-3 py-2 sm:px-5">
      <span class="flex-shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-[#FF7733]">${esc(t('tour_title'))} · ${done}/${steps.length}</span>${items}</div>`;
  }

  function renderScreen() {
    if (RECRUIT.includes(state.screen) && !state.atsOn) {
      return `<div class="${CARD} p-6 text-center"><p class="text-sm text-[#C9CDD6]">${esc(t('ats_off'))}</p><button type="button" data-a="mod" data-v="ats" class="${BTN_P} mt-3">${esc(t('ats_turn_on'))}</button></div>`;
    }
    switch (state.screen) {
      case 'scanner': return renderScanner();
      case 'bd': return renderBd();
      case 'analytics': return renderAnalytics();
      case 'settings': return renderSettings();
      case 'pipeline': return renderPipeline();
      case 'jobs': return state.jobOpen ? renderJob(jobOf(state.jobOpen)) : renderJobs();
      case 'companies': return renderCompanies();
      case 'candidates': return renderCandidates();
      case 'contacts': return renderContacts();
      case 'placements': return renderPlacements();
      case 'todo': return renderTodo();
      default: return renderHome();
    }
  }

  /* ═══════════════════════ Home ═══════════════════════ */
  const inWindow = (r, w) => (w === 1 ? state.now - (r.seen ?? 0) < DAY : r.age < w);
  function homeGroups(w) {
    const fresh = state.roles.filter((r) => inWindow(r, w));
    const q = state.homeQuery.toLowerCase();
    const groups = { clients: [], prospects: [] };
    new Set(fresh.map((r) => r.co)).forEach((id) => {
      const c = co(id);
      if (state.homeSeg === 'clients' && !c.client) return;
      if (state.homeSeg === 'prospects' && c.client) return;
      if (q && !c.name.toLowerCase().includes(q)) return;
      const rs = fresh.filter((r) => r.co === id).sort((a, b) => (b.seen ?? 0) - (a.seen ?? 0));
      groups[c.client ? 'clients' : 'prospects'].push({ c, rs });
    });
    Object.values(groups).forEach((g) => g.sort((a, b) => b.rs.length - a.rs.length || a.c.name.localeCompare(b.c.name)));
    return groups;
  }
  function lastScanText() {
    const at = parse(state.scan.at);
    if (at == null) return '—';
    return pragueDay(at) === todayStr() ? t('today_at', { t: pragueTime(at) }) : `${fmtDate(at)} ${pragueTime(at)}`;
  }
  // Like the app (M2.3): from the postings of the last 7 days, so a company's first scan is no spike.
  function spike() {
    const counts = {};
    state.roles.filter((r) => r.posted != null && state.now - r.posted < 7 * DAY).forEach((r) => { counts[r.co] = (counts[r.co] || 0) + 1; });
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return best && best[1] >= 3 ? { c: co(Number(best[0])), n: best[1] } : null;
  }
  function renderHome() {
    const L = lang();
    const h = pragueHour();
    const greet = h < 12 ? t('greet_morning') : h < 18 ? t('greet_afternoon') : t('greet_evening');
    const date = new Intl.DateTimeFormat(locale(), { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Prague' }).format(new Date());
    const next = h >= 12 ? `${t('tomorrow')} 06:00` : '12:00';
    const w = state.homeWindow;
    const fresh = state.roles.filter((r) => inWindow(r, w));
    const core = fresh.filter((r) => r.fit === 'CORE');
    const hiring = new Set(fresh.map((r) => r.co));
    const closed = state.archived.filter((a) => a.closed != null && state.now - a.closed < w * DAY).length;

    const winBtns = [[1, 'w24'], [7, 'w7'], [30, 'w30']].map(([v, k]) => `<button type="button" data-a="home-win" data-v="${v}" class="rounded-md px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${w === v ? 'bg-[#1B1E26] text-white' : 'text-[#8A90A2] hover:text-white'}">${t(k)}</button>`).join('');
    const kpi = (n, label, sub, extra = '') => `<div class="min-w-0 p-3.5 sm:p-4"><div class="flex items-baseline gap-2"><span class="font-mono text-2xl font-bold text-white">${n}</span><span class="text-xs text-[#C9CDD6]">${label}</span>${extra}</div><div class="mt-0.5 text-[11px] text-[#5A6275]">${sub}</div></div>`;

    const groups = homeGroups(w);
    const rowsFor = (list) => list.map(({ c, rs }) => {
      const open = !!state.homeOpen[c.id];
      const sub = open ? rs.slice(0, 8).map((r) => `<button type="button" data-a="role" data-v="${r.id}" class="grid w-full grid-cols-[1fr_auto] items-center gap-2 border-t border-[#1B1E26]/60 bg-[#0B0E14] py-2 pr-3 pl-9 text-left hover:bg-[#151720] cursor-pointer">
          <span class="min-w-0 truncate text-xs text-[#C9CDD6]">${esc(r.title)}</span><span class="flex items-center gap-2">${fitBadge(r.fit)}<span class="hidden font-mono text-[10px] text-[#5A6275] sm:inline">${seenLabel(r.age)}</span></span></button>`).join('')
        + (rs.length > 8 ? `<button type="button" data-a="bd-company" data-v="${c.id}" class="block w-full border-t border-[#1B1E26]/60 bg-[#0B0E14] py-2 pl-9 text-left text-[11.5px] font-semibold text-[#FF7733] hover:text-white cursor-pointer">+${rs.length - 8} · ${esc(t('show_roles'))} →</button>` : '') : '';
      const top = rs[0];
      return `<div><button type="button" data-a="home-toggle" data-v="${c.id}" class="grid w-full grid-cols-[1fr_auto] items-center gap-2 px-3 py-2.5 text-left hover:bg-[#151720] sm:grid-cols-[170px_44px_44px_52px_1fr_64px] cursor-pointer">
        <span class="flex min-w-0 items-center gap-1.5">${ic(open ? 'expand_more' : 'chevron_right', 'text-[16px] text-[#5A6275]')}<span class="truncate text-[13px] font-semibold text-white">${esc(c.name)}</span></span>
        <span class="font-mono text-[13px] font-bold text-white sm:text-center">${rs.length}<span class="text-[11px] font-normal text-[#5A6275] sm:hidden"> ${esc(t('col_new').toLowerCase())}</span></span>
        <span class="hidden text-center font-mono text-[13px] font-bold text-[#FF7733] sm:block">${rs.filter((r) => r.fit === 'CORE').length}</span>
        <span class="hidden text-center font-mono text-xs text-[#8A90A2] sm:block">${c.active}</span>
        <span class="hidden min-w-0 truncate text-xs text-[#C9CDD6] sm:block">${esc(top.title)}</span>
        <span class="hidden text-right font-mono text-[10.5px] text-[#5A6275] sm:block">${seenLabel(top.age)}</span></button>${sub}</div>`;
    }).join('');
    const grp = (key, list) => (list.length ? `<div class="border-t border-[#1B1E26] px-3 pt-2.5 pb-1 font-mono text-[9.5px] font-bold tracking-wider text-[#FF5500]">${t(key === 'clients' ? 'grp_clients' : 'grp_prospects')} <span class="text-[#5A6275]">· ${t('companies_n', { n: list.length })} · ${t('roles_n', { n: list.reduce((s, g) => s + g.rs.length, 0) })}</span></div>${rowsFor(list)}` : '');
    const segBtns = [['all', 'all'], ['clients', 'clients'], ['prospects', 'prospects']].map(([v, k]) => `<button type="button" data-a="home-seg" data-v="${v}" class="${CHIP(state.homeSeg === v)}">${t(k)}</button>`).join('');
    const nComp = groups.clients.length + groups.prospects.length;

    const clientsActive = state.roles.filter((r) => co(r.co).client).length;
    const prospActive = state.roles.length - clientsActive;
    const stale = state.roles.filter(isStale);
    const pct = state.roles.length ? Math.round((clientsActive / state.roles.length) * 100) : 0;
    const sp = spike();
    const openJobs = new Set(state.jobs.filter((j) => j.status === 'OPEN').map((j) => j.id));
    const live = state.apps.filter((a) => openJobs.has(a.job));

    return `
    <div class="space-y-4">
      ${header(`${esc(greet)}, Demo Agency`, esc(t('home_meta', { date, last: lastScanText(), next })), `<div class="flex rounded-lg border border-[#1B1E26] bg-[#0F1117] p-0.5">${winBtns}</div><button type="button" data-a="go" data-v="bd" class="${BTN_S}">${esc(t('nav_bd'))} ${ic('arrow_forward', 'text-[15px]')}</button>`)}
      <div class="${CARD} grid grid-cols-2 divide-[#1B1E26] lg:grid-cols-4 lg:divide-x">
        ${kpi(fresh.length, esc(t('kpi_new')), esc(t('kpi_new_sub', { n: fresh.filter((r) => co(r.co).client).length })))}
        ${kpi(core.length, esc(t('kpi_core')), esc(t('kpi_core_sub', { n: core.filter((r) => co(r.co).client).length })), fitBadge('CORE'))}
        ${kpi(hiring.size, esc(t('kpi_hiring')), '&nbsp;')}
        ${kpi(closed, esc(t('kpi_closed')), '&nbsp;')}
      </div>
      <div class="grid gap-4 xl:grid-cols-[1fr_250px]">
        <div class="${CARD} min-w-0 overflow-hidden">
          <div class="space-y-2.5 p-3.5">
            <div><div class="${LABEL} text-[#FF5500]">${esc(t('cwn_title'))}</div><div class="mt-0.5 text-[11px] text-[#5A6275]">${esc(t('cwn_sub', { w: t(w === 1 ? 'w24' : w === 7 ? 'w7' : 'w30'), n: hiring.size }))}</div></div>
            <div class="flex flex-wrap items-center gap-1.5">${searchBox('home-q', state.homeQuery, t('filter_companies'), 'w-40')}${segBtns}</div>
          </div>
          <div class="hidden grid-cols-[170px_44px_44px_52px_1fr_64px] gap-2 border-t border-[#1B1E26] px-3 py-2 ${TH} sm:grid"><span class="pl-5">${t('col_company')}</span><span class="text-center">${t('col_new')}</span><span class="text-center">${t('col_core')}</span><span class="text-center">${t('col_active')}</span><span>${t('col_top')}</span><span class="text-right">${t('col_last')}</span></div>
          ${nComp ? grp('clients', groups.clients) + grp('prospects', groups.prospects) : empty(t('no_companies'))}
          <div class="flex items-center justify-end border-t border-[#1B1E26] px-3 py-2.5"><button type="button" data-a="go" data-v="bd" class="flex items-center gap-1 text-xs font-semibold text-[#FF7733] hover:text-white cursor-pointer">${esc(t('see_all_bd'))} ${ic('arrow_forward', 'text-[15px]')}</button></div>
        </div>
        <div class="space-y-3">
          <div class="${CARD} p-3.5"><div class="${LABEL} text-[#8A90A2]">${esc(t('pipe_title'))}</div>
            <div class="mt-2.5 grid grid-cols-2 gap-2"><div class="border-l-2 border-[#FF5500] pl-2.5"><div class="font-mono text-lg font-bold text-white">${fmt(clientsActive)}</div><div class="text-[10.5px] leading-tight text-[#8A90A2]">${esc(t('pipe_clients'))}</div></div>
            <div class="border-l-2 border-[#38BDF8] pl-2.5"><div class="font-mono text-lg font-bold text-white">${fmt(prospActive)}</div><div class="text-[10.5px] leading-tight text-[#8A90A2]">${esc(t('pipe_prospects'))}</div></div></div>
            <div class="mt-3 flex h-1.5 gap-0.5 overflow-hidden rounded-full"><div class="rounded-l-full bg-[#FF5500]" style="width:${pct}%"></div><div class="flex-1 rounded-r-full bg-[#38BDF8]"></div></div>
            <div class="mt-1.5 text-[10.5px] text-[#5A6275]">${esc(t('pipe_total', { n: fmt(state.roles.length), c: state.companies.length }))}</div></div>
          ${state.atsOn ? `<div class="${CARD} p-3.5"><div class="${LABEL} flex items-center gap-1.5 text-[#34D399]">${ic('view_kanban', 'text-[15px]')}${esc(t('rec_title'))}</div>
            <div class="mt-2 text-[13px] font-bold text-white">${esc(t('rec_line', { i: live.filter((a) => INTERVIEWS.includes(a.stage)).length, o: live.filter((a) => a.stage === 'OFFER').length }))}</div>
            <div class="mt-0.5 text-[11px] text-[#8A90A2]">${esc(t('rec_tasks', { n: myTasksDue() }))}</div>
            <button type="button" data-a="go" data-v="pipeline" class="mt-2.5 flex items-center gap-1 text-xs font-semibold text-[#FF7733] hover:text-white cursor-pointer">${esc(t('rec_open'))} ${ic('arrow_forward', 'text-[15px]')}</button></div>` : ''}
          <div class="${CARD} p-3.5"><div class="${LABEL} flex items-center gap-1.5 text-[#FBBF24]">${ic('warning', 'text-[15px]')}${esc(t('att_title'))}</div>
            ${stale.length ? `<div class="mt-2 text-[13px] font-bold text-white">${esc(t('att_stale', { n: stale.length }))}</div><div class="mt-0.5 text-[11px] leading-relaxed text-[#8A90A2]">${esc(t('att_stale_sub'))}</div>
            <button type="button" data-a="bd-stale" class="mt-2.5 flex items-center gap-1 text-xs font-semibold text-[#FF7733] hover:text-white cursor-pointer">${esc(t('att_show'))} ${ic('arrow_forward', 'text-[15px]')}</button>`
            : `<div class="mt-2 text-[13px] font-bold text-white">${esc(t('att_none'))}</div><div class="mt-0.5 text-[11px] leading-relaxed text-[#8A90A2]">${esc(t('att_none_sub'))}</div>`}</div>
          ${sp ? `<div class="${CARD} p-3.5"><div class="${LABEL} flex items-center gap-1.5 text-[#38BDF8]">${ic('trending_up', 'text-[15px]')}${esc(t('spike_title'))}</div>
            <button type="button" data-a="bd-company" data-v="${sp.c.id}" class="mt-2 text-left text-[13px] font-bold text-white hover:text-[#FF7733] cursor-pointer">${esc(t('spike_text', { co: sp.c.name, n: sp.n }))}</button><div class="mt-0.5 text-[11px] leading-relaxed text-[#8A90A2]">${esc(t('spike_sub'))}</div></div>` : ''}
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
    return state.roles.filter((r) => {
      const c = co(r.co);
      if (state.bdSeg === 'clients' && !c.client) return false;
      if (state.bdSeg === 'prospects' && c.client) return false;
      if (state.bdFit !== 'all' && r.fit !== state.bdFit) return false;
      if (state.bdCompany && r.co !== state.bdCompany) return false;
      if (quick && !quick[2](r)) return false;
      if (q && !`${r.title} ${c.name} ${r.loc} ${r.ref}`.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => Number(b.starred) - Number(a.starred) || (b.seen ?? 0) - (a.seen ?? 0) || b.id - a.id);
  }
  function renderBd() {
    const head = header(esc(t('nav_bd')), esc(t('bd_sub', { n: fmt(state.roles.length), c: state.companies.length, t: state.roles.filter((r) => r.age === 0).length })), openFull('bd'));
    const tabs = tabsBar([['roles', t('tab_roles'), state.roles.length], ['dir', t('tab_dir'), state.companies.length], ['archive', t('tab_archive'), state.archived.length]], state.bdTab, 'bd-tab');
    const body = state.bdTab === 'dir' ? renderDirectory() : state.bdTab === 'archive' ? renderArchive() : renderRolesTab();
    return `<div class="space-y-3">${head}${tabs}${body}</div>`;
  }
  const ageGroup = (r) => (r.age === 0 ? 'g_today' : r.age === 1 ? 'g_yesterday' : r.age < 7 ? 'g_week' : r.age < 30 ? 'g_month' : 'g_older');
  function renderRolesTab() {
    const list = bdFiltered();
    const shown = list.slice(0, 120);
    const quick = QUICK.map(([v, k, fn]) => `<button type="button" data-a="bd-quick" data-v="${v}" class="${CHIP(state.bdQuick === v)}">${v === 'starred' ? ic('star', 'text-[13px]') : ''}${t(k)}<span class="font-mono text-[10px] opacity-70">${state.roles.filter(fn).length}</span></button>`).join('');
    const seg = [['all', 'all'], ['clients', 'clients'], ['prospects', 'prospects']].map(([v, k]) => `<button type="button" data-a="bd-seg" data-v="${v}" class="${CHIP(state.bdSeg === v)}">${t(k)}</button>`).join('');
    const fit = ['all', 'CORE', 'SELECTIVE'].map((v) => `<button type="button" data-a="bd-fit" data-v="${v}" class="${CHIP(state.bdFit === v)}">${v === 'all' ? `${t('col_fit')}: ${t('all')}` : v}</button>`).join('');
    const companyChip = state.bdCompany ? `<button type="button" data-a="bd-company-clear" class="${CHIP(true)}">${esc(co(state.bdCompany).name)} ${ic('close', 'text-[13px]')}</button>` : '';
    const anyFilter = state.bdQuick || state.bdSeg !== 'all' || state.bdFit !== 'all' || state.bdQuery || state.bdCompany;

    let lastGroup = '';
    const rows = shown.map((r) => {
      const g = r.starred && !state.bdQuick ? 'q_starred' : ageGroup(r);
      let gh = '';
      if (g !== lastGroup) {
        lastGroup = g;
        const n = list.filter((x) => (x.starred && !state.bdQuick ? 'q_starred' : ageGroup(x)) === g).length;
        gh = `<div class="border-t border-[#1B1E26] px-3 pt-2.5 pb-1 font-mono text-[9.5px] font-bold tracking-wider ${g === 'q_starred' ? 'text-[#FBBF24]' : 'text-[#FF5500]'}">${esc(t(g).toUpperCase())} · ${n}</div>`;
      }
      const c = co(r.co);
      const sel = state.panel === r.id;
      return `${gh}<div data-a="role" data-v="${r.id}" class="group grid cursor-pointer grid-cols-[22px_1fr_auto] items-center gap-x-2 gap-y-1 border-t border-[#1B1E26]/50 px-3 py-2 transition-colors hover:bg-[#151720] md:grid-cols-[22px_54px_minmax(0,1fr)_150px_120px_76px_92px_70px] ${sel ? 'bg-[#FF5500]/[0.06]' : ''}">
        <button type="button" data-a="star" data-v="${r.id}" class="text-[#5A6275] hover:text-[#FBBF24] cursor-pointer" aria-label="${esc(t('q_starred'))}"><span class="material-symbols-outlined tr-ic text-[17px] ${r.starred ? 'text-[#FBBF24]' : ''}" style="${r.starred ? "font-variation-settings:'FILL' 1" : ''}">star</span></button>
        <span class="hidden font-mono text-[10.5px] text-[#FF7733] md:block">${r.ref}</span>
        <span class="min-w-0"><span class="flex items-center gap-1.5"><span class="truncate text-[12.5px] font-semibold text-white group-hover:text-[#FF7733]">${esc(r.title)}</span>${r.notes.length ? ic('chat_bubble', 'flex-shrink-0 text-[13px] text-[#5A6275]') : ''}</span>
          <span class="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#8A90A2] md:hidden">${typeBadge(c)}${esc(c.name)} · ${esc(r.loc)}</span></span>
        <span class="hidden min-w-0 items-center gap-1.5 md:flex">${typeBadge(c)}<span class="truncate text-xs text-[#C9CDD6]">${esc(c.name)}</span></span>
        <span class="hidden truncate text-[11.5px] text-[#8A90A2] md:block">${esc(r.loc)}</span>
        <span class="hidden md:block">${fitBadge(r.fit)}</span>
        <span class="flex flex-col items-end gap-1 md:block">${statusBadge(r.status)}<span class="md:hidden">${fitBadge(r.fit)}</span></span>
        <span class="hidden text-right font-mono text-[10.5px] md:block ${isStale(r) ? 'text-[#FBBF24]' : 'text-[#8A90A2]'}">${isStale(r) ? t('open_days', { n: r.open }) : seenLabel(r.age)}</span>
      </div>`;
    }).join('');

    return `<div class="space-y-2.5">
      <div class="tr-sb-scroll flex gap-1.5 overflow-x-auto pb-0.5">${quick}</div>
      <div class="flex flex-col gap-2 xl:flex-row xl:items-center">
        ${searchBox('bd-q', state.bdQuery, t('search_roles'), 'xl:w-64')}
        <div class="flex flex-1 flex-wrap items-center gap-1.5">${seg}<span class="mx-0.5 h-4 w-px bg-[#1B1E26]"></span>${fit}${companyChip}</div>
        <button type="button" data-a="export" class="${BTN_S} self-start">${ic('download', 'text-[15px]')}${esc(t('export_csv'))}</button>
      </div>
      <div class="${CARD} overflow-hidden">
        <div class="hidden grid-cols-[22px_54px_minmax(0,1fr)_150px_120px_76px_92px_70px] gap-x-2 px-3 py-2 ${TH} md:grid">
          <span>${ic('star', 'text-[14px]')}</span><span>${t('col_ref')}</span><span>${t('col_role')}</span><span>${t('col_company')} <span class="normal-case">${lang() === 'cs' ? 'K/P' : 'C/P'}</span></span><span>${t('col_location')}</span><span>${t('col_fit')}</span><span>${t('col_status')}</span><span class="text-right">${t('col_seen')}</span></div>
        ${list.length ? rows + (list.length > shown.length ? `<div class="border-t border-[#1B1E26] px-3 py-2.5 text-center font-mono text-[10.5px] text-[#5A6275]">${esc(t('p_of', { n: shown.length, total: list.length }))} · <a href="${demoLink('bd')}" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#FF7733] hover:text-white">${esc(t('open_full'))}</a></div>` : '')
          : `<div class="border-t border-[#1B1E26] py-10 text-center text-xs text-[#8A90A2]">${esc(t('no_roles'))}${anyFilter ? ` <button type="button" data-a="bd-clear" class="ml-1 font-semibold text-[#FF7733] hover:text-white cursor-pointer">${esc(t('clear_filters'))}</button>` : ''}</div>`}
      </div></div>`;
  }
  function renderDirectory() {
    const rows = [...state.companies].sort((a, b) => Number(b.client) - Number(a.client) || b.active - a.active).map((c) => {
      const n7 = state.roles.filter((r) => r.co === c.id && r.age < 7).length;
      return `<div class="grid grid-cols-[1fr_auto] items-center gap-2 border-t border-[#1B1E26]/60 px-3 py-2.5 md:grid-cols-[minmax(0,1fr)_90px_110px_80px_80px_110px]">
        <span class="flex min-w-0 items-center gap-2">${typeBadge(c)}<span class="min-w-0"><span class="block truncate text-[13px] font-semibold text-white">${esc(c.name)}</span><span class="block truncate font-mono text-[10.5px] text-[#5A6275]">${esc(c.domain)}${c.hq ? ` · ${esc(c.hq)}` : ''}</span></span></span>
        <span class="hidden text-[11px] text-[#8A90A2] md:block">${esc(c.client ? t('client') : t('prospect'))}</span>
        <span class="hidden md:block">${atsBadge(c.ats)}</span>
        <span class="hidden text-center font-mono text-xs text-white md:block">${c.active}</span>
        <span class="hidden text-center font-mono text-xs md:block ${n7 ? 'text-[#34D399]' : 'text-[#5A6275]'}">${n7 ? '+' + n7 : '0'}</span>
        <button type="button" data-a="bd-company" data-v="${c.id}" class="justify-self-end text-xs font-semibold text-[#FF7733] hover:text-white cursor-pointer">${esc(t('show_roles'))} →</button></div>`;
    }).join('');
    return `<p class="text-xs text-[#8A90A2]">${esc(t('dir_sub'))}</p><div class="${CARD} overflow-hidden">
      <div class="hidden grid-cols-[minmax(0,1fr)_90px_110px_80px_80px_110px] gap-2 px-3 py-2 ${TH} md:grid"><span>${t('col_company')}</span><span>${t('col_type')}</span><span>${t('col_ats')}</span><span class="text-center">${t('col_active')}</span><span class="text-center">${t('col_new7')}</span><span></span></div>${rows}</div>`;
  }
  function renderArchive() {
    const rows = state.archived.map((a) => `<div class="grid grid-cols-[1fr_auto] items-center gap-2 border-t border-[#1B1E26]/60 px-3 py-2.5 md:grid-cols-[minmax(0,1fr)_150px_100px_100px]">
      <span class="min-w-0"><span class="block truncate text-[12.5px] text-[#C9CDD6] line-through decoration-[#5A6275]">${esc(a.title)}</span><span class="block text-[11px] text-[#5A6275] md:hidden">${esc(co(a.co).name)}</span></span>
      <span class="hidden truncate text-xs text-[#8A90A2] md:block">${esc(co(a.co).name)}</span>
      <span class="font-mono text-[10.5px] text-[#8A90A2]">${esc(fmtDate(a.closed))}</span>
      <span class="hidden font-mono text-[10.5px] text-[#5A6275] md:block">${a.seen != null && a.closed != null ? Math.max(1, Math.round((a.closed - a.seen) / DAY)) : '—'} d</span></div>`).join('');
    return `<p class="text-xs text-[#8A90A2]">${esc(t('arch_sub'))}</p><div class="${CARD} overflow-hidden">
      <div class="hidden grid-cols-[minmax(0,1fr)_150px_100px_100px] gap-2 px-3 py-2 ${TH} md:grid"><span>${t('col_role')}</span><span>${t('col_company')}</span><span>${t('col_closed')}</span><span>${t('col_open_for')}</span></div>${rows || empty(t('crm_none'))}</div>`;
  }

  /* ── Drawer (role panel and records) ── */
  function drawer(label, inner, extraTop = '') {
    return `<div class="fixed inset-0 z-[60] flex justify-end bg-black/55 backdrop-blur-[1px] lg:absolute lg:z-30" data-a="drawer-bg">
      <div class="tr-sb-scroll flex h-full w-full max-w-[470px] flex-col overflow-y-auto border-l border-[#1B1E26] bg-[#0B0E14] shadow-2xl" data-stop="1" role="dialog" aria-label="${esc(label)}">
        <div class="sticky top-0 z-10 flex items-center gap-2 border-b border-[#1B1E26] bg-[#0B0E14] px-4 py-2.5">${extraTop}
          <button type="button" data-a="drawer-close" class="ml-auto rounded-md p-1 text-[#8A90A2] hover:text-white cursor-pointer" aria-label="${esc(t('p_close'))}">${ic('close', 'text-[18px]')}</button></div>
        ${inner}</div></div>`;
  }
  const drawerTabs = (items, cur, action) => `<div class="tr-sb-scroll mt-4 flex gap-4 overflow-x-auto border-b border-[#1B1E26]">${items.map(([v, label, n]) => `<button type="button" data-a="${action}" data-v="${v}" class="border-b-2 pb-2 text-[12.5px] whitespace-nowrap cursor-pointer ${cur === v ? 'border-[#FF5500] font-semibold text-white' : 'border-transparent text-[#8A90A2] hover:text-white'}">${esc(label)}${n ? ` <span class="font-mono text-[10px] text-[#FF7733]">${n}</span>` : ''}</button>`).join('')}</div>`;
  function noteCard(n) {
    const kind = n.kind && n.kind !== 'note' ? `<span class="rounded border border-white/10 px-1 font-mono text-[9px] uppercase text-[#8A90A2]">${esc(t('kind_' + n.kind))}</span>` : '';
    return `<div class="${CARD} p-3"><div class="flex items-center gap-2">${avatar(n.by)}<span class="text-xs font-semibold text-white">${esc(n.by)}</span>${kind}<span class="ml-auto font-mono text-[10px] text-[#5A6275]">${esc(agoLabel(n.at))}</span></div>
      <p class="mt-1.5 text-[12.5px] leading-relaxed text-[#C9CDD6]">${esc(n.text ?? n.body).replace(/(@[\p{L}]+(?: [\p{L}]+)?)/gu, '<span class="font-semibold text-[#FF7733]">$1</span>')}</p></div>`;
  }
  const noteForm = (form, ph) => `<form data-form="${form}" class="mt-3 flex gap-2"><input name="note" maxlength="300" autocomplete="off" placeholder="${esc(ph)}" class="min-w-0 flex-1 ${INPUT} px-3 py-1.5"><button type="submit" class="${BTN_P}">${esc(t('note_add'))}</button></form>`;
  const timeline = (items) => (items.length ? `<ol class="relative space-y-3 border-l border-[#1B1E26] pl-4">${items.map((h) => `<li class="relative"><span class="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0B0E14] bg-[#FF5500]"></span><div class="text-[12.5px] text-white">${esc(h.text)}</div><div class="font-mono text-[10px] text-[#5A6275]">${esc(h.at != null ? agoLabel(h.at) : '')}</div></li>`).join('')}</ol>` : `<p class="text-xs text-[#8A90A2]">${esc(t('no_history'))}</p>`);

  /* ── Role panel ── */
  const panelList = () => (state.screen === 'bd' ? bdFiltered() : [...state.roles].sort((a, b) => (b.seen ?? 0) - (a.seen ?? 0)));
  function roleHook(r) {
    const L = lang();
    const c = co(r.co);
    const n7 = state.roles.filter((x) => x.co === r.co && x.age < 7).length;
    if (isStale(r)) return L === 'cs' ? `Role je otevřená ${r.open} dní a interní tým ${c.name} ji neobsadil. Nabídněte shortlist tří prověřených kandidátů do týdne.` : `Open ${r.open} days and ${c.name}'s in-house team has not filled it. Offer a shortlist of three pre-qualified candidates within a week.`;
    if (n7 >= 3) return L === 'cs' ? `${c.name} otevřel za týden ${n7} rolí, nábor zrychluje. Nabídněte spolupráci na více pozic najednou.` : `${c.name} opened ${n7} roles this week, a hiring push. Pitch a multi-role engagement.`;
    if (c.client) return L === 'cs' ? 'Čerstvá role u stávajícího klienta. Zavolejte kontaktu dřív, než se dostane na pracovní portály; podmínky už máte podepsané.' : 'A fresh role at an existing client. Call your contact before it reaches the job boards; your terms are already signed.';
    return L === 'cs' ? `${c.name} zatím není klient. Konkrétní a čerstvá role je teplý důvod oslovit hiring managera ještě tento týden.` : `${c.name} is not a client yet. A specific, fresh role is the warm reason to reach the hiring manager this week.`;
  }
  function renderPanel() {
    if (!state.panel) return '';
    const r = roleOf(state.panel);
    if (!r) return '';
    const c = co(r.co);
    const list = panelList();
    const idx = list.findIndex((x) => x.id === r.id);
    const job = state.jobs.find((j) => j.role === r.id);
    const tabs = drawerTabs([['overview', t('pt_overview')], ['hm', t('pt_hm')], ['notes', t('pt_notes'), r.notes.length], ['history', t('pt_history')]], state.panelTab, 'ptab');
    const statusOpts = ROLE_STATUSES.map((s) => `<option value="${s}" ${s === r.status ? 'selected' : ''}>${esc(t('st_' + s))}</option>`).join('');

    let body = '';
    if (state.panelTab === 'hm') {
      const targets = r.hm.targets && r.hm.targets.length ? r.hm.targets : ['Head of Engineering'];
      const known = state.contacts.filter((x) => x.co === r.co && x.hm);
      body = `<div class="${LABEL} text-[#FF5500]">${esc(t('hm_title'))}</div><p class="mt-1 text-[11.5px] leading-relaxed text-[#8A90A2]">${esc(t('hm_src_' + (r.hm.source || 'estimate')))}</p>
        <div class="mt-3 space-y-2">${targets.map((hm, i) => {
          const li = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${hm} ${c.name}`)}`;
          const xr = `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in "${hm}" "${c.name}"`)}`;
          return `<div class="${CARD} flex flex-col gap-2 p-3 sm:flex-row sm:items-center"><div class="flex-1"><div class="text-[13px] font-bold text-white">${esc(hm)}</div><div class="text-[11px] text-[#5A6275]">${esc(c.name)}${i === 0 ? ` · <span class="text-[#34D399]">${esc(t('hm_likely'))}</span>` : ''}</div></div>
            <div class="flex gap-1.5"><a href="${li}" target="_blank" rel="noopener noreferrer" class="${i === 0 ? BTN_P : BTN_S}">${ic('person_search', 'text-[15px]')}${esc(t('hm_linkedin'))}</a><a href="${xr}" target="_blank" rel="noopener noreferrer" class="${BTN_S}">${ic('travel_explore', 'text-[15px]')}${esc(t('hm_xray'))}</a></div></div>`;
        }).join('')}</div>
        ${known.length && state.atsOn ? `<div class="mt-4 ${LABEL} text-[#8A90A2]">${esc(t('hm_known'))}</div><div class="mt-2 space-y-1.5">${known.map((k) => `<button type="button" data-a="rec" data-v="contact:${k.id}" class="${CARD} flex w-full items-center gap-2 p-2.5 text-left hover:border-[#FF5500]/50 cursor-pointer">${avatar(k.name)}<span class="min-w-0 flex-1"><span class="block truncate text-xs font-semibold text-white">${esc(k.name)}${mockTag()}</span><span class="block truncate text-[11px] text-[#8A90A2]">${esc(k.title)}</span></span>${ic('chevron_right', 'text-[16px] text-[#5A6275]')}</button>`).join('')}</div>` : ''}
        <p class="mt-3 text-[11px] text-[#5A6275]">${esc(t('hm_save'))}</p>`;
    } else if (state.panelTab === 'notes') {
      body = `<div class="space-y-2">${r.notes.map(noteCard).join('') || `<p class="text-xs text-[#8A90A2]">${esc(t('notes_empty'))}</p>`}</div>${noteForm('role-note', t('note_ph'))}`;
    } else if (state.panelTab === 'history') {
      const items = [{ text: t('h_seen'), at: r.seen }, ...r.history.map((h) => ({ at: h.at, text: h.kind === 'status' ? t('h_status', { by: h.by, s: t('st_' + h.to) }) : h.kind === 'job' ? t('h_job', { id: jobRef(h.id) }) : t('h_note') }))]
        .sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
      body = timeline(items);
    } else {
      const sp = r.specs || {};
      body = `<div class="rounded-xl border border-[#1B1E26] bg-[#0F1117] p-3.5"><div class="flex items-center justify-between gap-2"><span class="${LABEL} text-[#FF5500]">${esc(t('ai_summary'))}</span>${r.summary ? `<span class="text-right font-mono text-[9.5px] text-[#5A6275]">${esc(t('ai_generated'))}</span>` : ''}</div>
          <p class="mt-2 text-[12.5px] leading-relaxed ${r.summary ? 'text-[#E4E6EB]' : 'text-[#8A90A2]'}">${esc(r.summary || t('ai_none'))}</p></div>
        ${sp.must && sp.must.length ? `<div class="mt-4"><div class="${LABEL} text-[#8A90A2]">${esc(t('key_req'))}</div><ul class="mt-2 space-y-1.5">${sp.must.map((q) => `<li class="flex gap-2 text-[12.5px] leading-snug text-[#C9CDD6]"><span class="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FF5500]"></span>${esc(q)}</li>`).join('')}</ul></div>` : ''}
        ${sp.scope || sp.work ? `<div class="mt-4 grid gap-2 sm:grid-cols-2">${sp.scope ? `<div><div class="${LABEL} text-[#8A90A2]">${esc(t('scope'))}</div><p class="mt-1 text-[12px] leading-snug text-[#C9CDD6]">${esc(sp.scope)}</p></div>` : ''}${sp.work ? `<div><div class="${LABEL} text-[#8A90A2]">${esc(t('work_model'))}</div><p class="mt-1 text-[12px] leading-snug text-[#C9CDD6]">${esc(sp.work)}</p></div>` : ''}</div>` : ''}
        <div class="mt-4 rounded-xl border-[1.5px] border-[#FF5500]/60 bg-[#FF5500]/[0.07] p-3.5"><div class="${LABEL} text-[#FF7733]">${esc(t('bd_hook'))}</div><p class="mt-1.5 text-[12.5px] leading-relaxed text-white">${esc(sp.hook || roleHook(r))}</p></div>
        ${r.why ? `<div class="mt-4"><div class="${LABEL} text-[#8A90A2]">${esc(t('fit_reason'))}</div><p class="mt-1.5 flex items-start gap-2 text-[12.5px] leading-relaxed text-[#C9CDD6]">${fitBadge(r.fit)}<span>${esc(r.why)}</span></p></div>` : ''}`;
    }

    const nav = `<button type="button" data-a="pnav" data-v="-1" class="rounded-md border border-[#1B1E26] p-1 text-[#8A90A2] hover:text-white disabled:opacity-30 cursor-pointer" ${idx <= 0 ? 'disabled' : ''} aria-label="${esc(t('p_of', { n: idx, total: list.length }))}">${ic('arrow_back', 'text-[16px]')}</button>
      <span class="font-mono text-[11px] text-[#8A90A2]">${esc(t('p_of', { n: idx + 1, total: list.length }))}</span>
      <button type="button" data-a="pnav" data-v="1" class="rounded-md border border-[#1B1E26] p-1 text-[#8A90A2] hover:text-white disabled:opacity-30 cursor-pointer" ${idx >= list.length - 1 ? 'disabled' : ''} aria-label="${esc(t('p_of', { n: idx + 2, total: list.length }))}">${ic('arrow_forward', 'text-[16px]')}</button>`;
    const posted = r.posted != null && r.posted < (r.seen ?? 0) ? ` · ${t('posted_meta', { d: fmtDate(r.posted) })}` : '';
    const inner = `<div class="px-4 pt-3.5">
          <div class="flex flex-wrap items-center gap-1.5"><span class="font-mono text-[11px] text-[#FF7733]">${r.ref}</span>${statusBadge(r.status)}${fitBadge(r.fit)}${isStale(r) ? pill(t('open_days', { n: r.open }), 'amber') : ''}</div>
          <h4 class="mt-1.5 text-lg font-bold leading-snug text-white">${esc(r.title)}</h4>
          <div class="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#C9CDD6]"><span class="font-semibold">${esc(c.name)}</span>${c.client ? pill(t('client'), 'orange') : pill(t('prospect'), 'blue')}<span class="text-[#8A90A2]">${esc(r.loc)}</span></div>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <label class="flex items-center gap-1.5 rounded-lg border-[1.5px] border-[#FF5500] bg-[#FF5500]/[0.08] py-1 pr-1 pl-2.5 text-xs font-bold text-white"><span>${esc(t('p_status'))}</span>
              <select data-input="status" class="cursor-pointer rounded bg-[#0B0E14] font-mono text-[11px] text-[#FF7733] focus:outline-none">${statusOpts}</select></label>
            <a href="${esc(r.url || c.careers)}" target="_blank" rel="noopener noreferrer" class="${BTN_S}">${ic('open_in_new', 'text-[15px]')}${esc(t('p_posting'))}</a>
            ${state.atsOn ? (job ? `<button type="button" data-a="open-job" data-v="${job.id}" class="${BTN_S} border-[#10B981]/50 text-[#34D399]">${ic('check_circle', 'text-[15px]')}${esc(t('p_job_open', { id: jobRef(job.id) }))}</button>` : `<button type="button" data-a="make-job" data-v="${r.id}" class="${BTN_P}">${ic('work', 'text-[15px]')}${esc(t('p_job'))}</button>`) : ''}
          </div>
          ${tabs}
        </div>
        <div class="flex-1 px-4 py-4">${body}</div>
        <div class="border-t border-[#1B1E26] px-4 py-2.5 font-mono text-[10px] text-[#5A6275]">${esc(t('seen_meta', { d: fmtDate(r.seen), ats: c.ats || '—', loc: r.loc }) + posted)}</div>`;
    return drawer(r.title, inner, nav);
  }

  /* ── Records: candidate, contact, company ── */
  function renderRec() {
    if (!state.rec || state.panel) return '';
    const { type, id } = state.rec;
    if (type === 'cand') return renderCandRec(candOf(id));
    if (type === 'contact') return renderContactRec(contactOf(id));
    if (type === 'company') return renderCompanyRec(co(id));
    return '';
  }
  const notesOf = (type, id) => state.notes.filter((n) => n.type === type && n.eid === id).sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
  function appLine(a, withCand) {
    const j = jobOf(a.job);
    const cand = candOf(a.cand);
    const tone = a.stage === 'PLACED' ? 'green' : REJECTED.includes(a.stage) ? '' : a.stage === 'OFFER' ? 'amber' : INTERVIEWS.includes(a.stage) ? 'orange' : 'blue';
    return `<div class="${CARD} flex items-center gap-2 p-2.5">
      <button type="button" data-a="${withCand ? 'rec' : 'open-job'}" data-v="${withCand ? `cand:${a.cand}` : a.job}" class="min-w-0 flex-1 text-left cursor-pointer"><span class="block truncate text-xs font-semibold text-white hover:text-[#FF7733]">${esc(withCand ? cand.name : j.title)}${withCand ? mockTag() : ''}</span>
        <span class="block truncate text-[11px] text-[#8A90A2]">${esc(withCand ? cand.title : co(j.co).name)} · ${esc(t('in_stage', { n: daysSince(a.since) }))}</span></button>
      ${pill(t('ps_' + a.stage), tone)}</div>`;
  }
  function renderCandRec(c) {
    if (!c) return '';
    const apps = state.apps.filter((a) => a.cand === c.id);
    const notes = notesOf('candidate', c.id);
    const tabs = drawerTabs([['overview', t('tab_overview')], ['jobs', t('tab_jobs'), apps.length], ['notes', t('tab_notes'), notes.length], ['history', t('tab_history')]], state.recTab, 'rtab');
    let body = '';
    if (state.recTab === 'jobs') {
      const free = state.jobs.filter((j) => j.status === 'OPEN' && !apps.some((a) => a.job === j.id));
      body = `<div class="space-y-2">${apps.map((a) => appLine(a, false)).join('') || `<p class="text-xs text-[#8A90A2]">${esc(t('no_applications'))}</p>`}</div>
        <form data-form="cand-to-job" class="mt-3 flex gap-2"><select name="job" class="min-w-0 flex-1 cursor-pointer ${INPUT} px-2 py-1.5"><option value="">${esc(t('pick_job'))}</option>${free.map((j) => `<option value="${j.id}">${esc(`${j.title} · ${co(j.co).name}`)}</option>`).join('')}</select><button type="submit" class="${BTN_P}">${esc(t('add_to_job'))}</button></form>`;
    } else if (state.recTab === 'notes') {
      body = `<div class="space-y-2">${notes.map(noteCard).join('') || `<p class="text-xs text-[#8A90A2]">${esc(t('notes_empty'))}</p>`}</div>${noteForm('rec-note', t('note_ph'))}`;
    } else if (state.recTab === 'history') {
      const ids = new Set(apps.map((a) => a.id));
      const items = state.events.filter((e) => ids.has(e.app)).map((e) => {
        const a = state.apps.find((x) => x.id === e.app);
        const job = (jobOf(a.job) || {}).title || '';
        return { at: e.at, text: `${e.by}: ${e.from ? t('history_moved', { job, from: t('ps_' + e.from), to: t('ps_' + e.to) }) : t('history_added', { job, stage: t('ps_' + e.to) })}` };
      }).sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
      body = timeline(items);
    } else {
      const field = (k, v) => (v ? `<div><div class="${LABEL} text-[#5A6275]">${esc(t(k))}</div><div class="mt-0.5 text-[12.5px] text-[#E4E6EB]">${esc(v)}</div></div>` : '');
      body = `<div class="grid grid-cols-2 gap-3">${field('current_title', [c.title, c.company].filter(Boolean).join(' · '))}${field('col_location', c.loc)}${field('salary_expectation', c.salary)}${field('notice_period', c.notice)}${field('source', c.source)}${field('owner', userName(c.owner))}</div>
        ${c.summary ? `<div class="mt-4 rounded-xl border border-[#1B1E26] bg-[#0F1117] p-3"><div class="${LABEL} text-[#8A90A2]">${esc(t('summary'))}</div><p class="mt-1.5 text-[12.5px] leading-relaxed text-[#C9CDD6]">${esc(c.summary)}</p></div>` : ''}
        ${apps.length ? `<div class="mt-4 space-y-2">${apps.map((a) => appLine(a, false)).join('')}</div>` : ''}`;
    }
    const inner = `<div class="px-4 pt-3.5"><div class="flex items-center gap-3">${avatar(c.name, 'h-10 w-10 text-[13px]')}<div class="min-w-0"><h4 class="truncate text-lg font-bold leading-snug text-white">${esc(c.name)}${mockTag()}</h4>
        <div class="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#8A90A2]">${pill(t('cs_' + c.status), c.status === 'LIVE' ? 'orange' : c.status === 'PLACED' ? 'green' : 'blue')}<span class="truncate">${esc(c.title)}</span></div></div></div>${tabs}</div>
      <div class="flex-1 px-4 py-4">${body}</div>`;
    return drawer(c.name, inner, `<span class="${LABEL} text-[#8A90A2]">${esc(t('nav_candidates'))}</span>`);
  }
  function renderContactRec(k) {
    if (!k) return '';
    const c = co(k.co);
    const notes = notesOf('contact', k.id);
    const jobs = state.jobs.filter((j) => j.co === k.co);
    const tabs = drawerTabs([['overview', t('tab_overview')], ['notes', t('tab_notes'), notes.length]], state.recTab, 'rtab');
    const body = state.recTab === 'notes'
      ? `<div class="space-y-2">${notes.map(noteCard).join('') || `<p class="text-xs text-[#8A90A2]">${esc(t('notes_empty'))}</p>`}</div>${noteForm('rec-note', t('note_ph'))}`
      : `<div class="${LABEL} text-[#8A90A2]">${esc(t('contact_jobs'))}</div><div class="mt-2 space-y-2">${jobs.map((j) => jobLine(j)).join('') || `<p class="text-xs text-[#8A90A2]">${esc(t('no_jobs'))}</p>`}</div>
        ${notes[0] ? `<div class="mt-4 ${LABEL} text-[#8A90A2]">${esc(t('col_last_touch'))}</div><div class="mt-2">${noteCard(notes[0])}</div>` : ''}`;
    const inner = `<div class="px-4 pt-3.5"><div class="flex items-center gap-3">${avatar(k.name, 'h-10 w-10 text-[13px]')}<div class="min-w-0"><h4 class="truncate text-lg font-bold leading-snug text-white">${esc(k.name)}${mockTag()}</h4>
        <div class="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#8A90A2]">${k.hm ? pill(t('hm_badge'), 'orange') : ''}<span>${esc(k.title)}</span> · <button type="button" data-a="rec" data-v="company:${c.id}" class="font-semibold text-[#C9CDD6] hover:text-[#FF7733] cursor-pointer">${esc(c.name)}</button></div></div></div>${tabs}</div>
      <div class="flex-1 px-4 py-4">${body}</div>`;
    return drawer(k.name, inner, `<span class="${LABEL} text-[#8A90A2]">${esc(t('nav_contacts'))}</span>`);
  }
  function jobCounts(jobId) {
    const apps = state.apps.filter((a) => a.job === jobId);
    return {
      a: apps.filter((a) => !REJECTED.includes(a.stage) && a.stage !== 'PLACED').length,
      i: apps.filter((a) => INTERVIEWS.includes(a.stage)).length,
      o: apps.filter((a) => a.stage === 'OFFER').length,
      p: apps.filter((a) => a.stage === 'PLACED').length,
    };
  }
  function plLine(n) {
    const parts = [['pl_a', n.a], ['pl_i', n.i], ['pl_o', n.o], ['pl_p', n.p]].filter(([, v]) => v).map(([k, v]) => t(k, { n: v }));
    return parts.join(' · ') || t('pl_none');
  }
  function jobStatusPill(s) { return pill(t('js_' + s), s === 'OPEN' ? 'green' : s === 'ON_HOLD' ? 'amber' : ''); }
  function jobLine(j) {
    return `<button type="button" data-a="open-job" data-v="${j.id}" class="${CARD} flex w-full items-center gap-2 p-2.5 text-left hover:border-[#FF5500]/50 cursor-pointer"><span class="min-w-0 flex-1"><span class="block truncate text-xs font-semibold text-white">${esc(j.title)}</span>
      <span class="block truncate text-[11px] text-[#8A90A2]">${esc(plLine(jobCounts(j.id)))}</span></span>${jobStatusPill(j.status)}</button>`;
  }
  function renderCompanyRec(c) {
    const contacts = state.contacts.filter((k) => k.co === c.id);
    const jobs = state.jobs.filter((j) => j.co === c.id);
    const roles = state.roles.filter((r) => r.co === c.id);
    const notes = notesOf('company', c.id);
    const tabs = drawerTabs([['overview', t('tab_people'), contacts.length], ['jobs', t('tab_jobs'), jobs.length], ['roles', t('tab_radar_roles'), roles.length], ['notes', t('tab_company_notes'), notes.length]], state.recTab, 'rtab');
    let body = '';
    if (state.recTab === 'jobs') body = `<div class="space-y-2">${jobs.map(jobLine).join('') || `<p class="text-xs text-[#8A90A2]">${esc(t('no_jobs'))}</p>`}</div>`;
    else if (state.recTab === 'roles') {
      body = `<div class="space-y-1.5">${roles.slice(0, 25).map((r) => `<button type="button" data-a="role" data-v="${r.id}" class="${CARD} flex w-full items-center gap-2 p-2.5 text-left hover:border-[#FF5500]/50 cursor-pointer"><span class="font-mono text-[10px] text-[#FF7733]">${r.ref}</span><span class="min-w-0 flex-1 truncate text-xs text-white">${esc(r.title)}</span>${fitBadge(r.fit)}</button>`).join('') || `<p class="text-xs text-[#8A90A2]">${esc(t('crm_none'))}</p>`}</div>
        <button type="button" data-a="bd-company" data-v="${c.id}" class="${BTN_S} mt-3">${ic('table_chart', 'text-[15px]')}${esc(t('open_in_bdm'))}</button>`;
    } else if (state.recTab === 'notes') body = `<div class="space-y-2">${notes.map(noteCard).join('') || `<p class="text-xs text-[#8A90A2]">${esc(t('notes_empty'))}</p>`}</div>${noteForm('rec-note', t('note_ph'))}`;
    else {
      body = `<div class="space-y-1.5">${contacts.map((k) => `<button type="button" data-a="rec" data-v="contact:${k.id}" class="${CARD} flex w-full items-center gap-2 p-2.5 text-left hover:border-[#FF5500]/50 cursor-pointer">${avatar(k.name)}<span class="min-w-0 flex-1"><span class="block truncate text-xs font-semibold text-white">${esc(k.name)}${mockTag()}</span><span class="block truncate text-[11px] text-[#8A90A2]">${esc(k.title)}</span></span>${k.hm ? pill(t('hm_badge'), 'orange') : ''}</button>`).join('') || `<p class="text-xs text-[#8A90A2]">${esc(t('company_no_contacts'))}</p>`}</div>`;
    }
    const inner = `<div class="px-4 pt-3.5"><div class="flex flex-wrap items-center gap-1.5">${c.client ? pill(t('client'), 'orange') : pill(t('prospect'), 'blue')}${atsBadge(c.ats)}</div>
        <h4 class="mt-1.5 text-lg font-bold leading-snug text-white">${esc(c.name)}</h4>
        <div class="mt-0.5 font-mono text-[11px] text-[#8A90A2]">${esc(c.domain)}${c.hq ? ` · ${esc(c.hq)}` : ''} · ${esc(t('roles_n', { n: c.active }))}</div>
        <div class="mt-3"><a href="${esc(c.careers)}" target="_blank" rel="noopener noreferrer" class="${BTN_S}">${ic('open_in_new', 'text-[15px]')}${esc(t('col_careers'))}</a></div>${tabs}</div>
      <div class="flex-1 px-4 py-4">${body}</div>`;
    return drawer(c.name, inner, `<span class="${LABEL} text-[#8A90A2]">${esc(t('nav_companies'))}</span>`);
  }

  /* ═══════════════════════ Recruitment: Pipeline ═══════════════════════ */
  function kanbanCard(a, showJob) {
    const c = candOf(a.cand);
    const j = jobOf(a.job);
    if (!c || !j) return '';
    const next = FLOW[FLOW.indexOf(a.stage) + 1];
    const opts = [...FLOW, ...REJECTED].map((s) => `<option value="${s}" ${s === a.stage ? 'selected' : ''}>${esc(t('ps_' + s))}</option>`).join('');
    return `<div class="rounded-lg border ${a.stage === 'PLACED' ? 'border-[#10B981]/40' : 'border-white/5'} bg-[#0F1117] p-2.5">
      <button type="button" data-a="rec" data-v="cand:${c.id}" class="flex w-full items-center gap-2 text-left cursor-pointer">${avatar(c.name)}<span class="min-w-0"><span class="block truncate text-xs font-semibold text-white hover:text-[#FF7733]">${esc(c.name)}</span><span class="block truncate text-[10.5px] text-[#8A90A2]">${esc(showJob ? `${j.title} · ${co(j.co).name}` : c.title)}</span></span></button>
      <div class="mt-2 flex items-center justify-between gap-1.5"><span class="font-mono text-[9.5px] ${a.stage === 'PLACED' ? 'text-[#34D399]' : 'text-[#5A6275]'}">${esc(t('in_stage', { n: daysSince(a.since) }))}</span>
        ${next && !REJECTED.includes(a.stage) ? `<button type="button" data-a="advance" data-v="${a.id}" class="flex flex-shrink-0 items-center gap-0.5 rounded border border-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#C9CDD6] hover:border-[#FF5500] hover:text-white cursor-pointer">${esc(t('advance'))}${ic('arrow_forward', 'text-[12px]')}</button>` : a.stage === 'PLACED' ? ic('check_circle', 'text-[15px] text-[#34D399]') : ''}</div>
      <label class="mt-1.5 block"><span class="sr-only">${esc(t('move_to'))}</span><select data-input="stage" data-v="${a.id}" class="w-full cursor-pointer rounded border border-[#1B1E26] bg-[#0B0E14] px-1.5 py-0.5 text-[10.5px] text-[#8A90A2] focus:border-[#FF5500] focus:outline-none"><option value="" disabled>${esc(t('move_to'))}</option>${opts}</select></label></div>`;
  }
  function board(apps, showJob) {
    const cols = BOARD.map(([k, stages, color]) => [k, apps.filter((a) => stages.includes(a.stage)), color]);
    if (state.pipeRejected) cols.push(['rejected', apps.filter((a) => REJECTED.includes(a.stage)), 'text-[#8A90A2]']);
    return `<div class="tr-sb-scroll flex gap-2 overflow-x-auto pb-1">${cols.map(([k, list, color]) => `<div class="min-w-[190px] flex-1 rounded-xl border border-[#1B1E26] bg-[#090C12] p-2.5">
      <div class="mb-2 flex items-center justify-between border-b border-[#1B1E26] pb-1.5"><span class="font-mono text-[10px] font-bold uppercase ${color}">${esc(t('grp_' + k))}</span><span class="rounded bg-[#1B1E26] px-1.5 font-mono text-[10px] text-[#8A90A2]">${list.length}</span></div>
      <div class="space-y-2">${list.sort((a, b) => (a.since ?? 0) - (b.since ?? 0)).map((a) => kanbanCard(a, showJob)).join('')}</div></div>`).join('')}</div>`;
  }
  function renderPipeline() {
    const open = state.jobs.filter((j) => j.status === 'OPEN');
    const ids = new Set(open.map((j) => j.id));
    let apps = state.apps.filter((a) => ids.has(a.job));
    const active = apps.filter((a) => !REJECTED.includes(a.stage));
    if (state.pipeJob !== 'all') apps = apps.filter((a) => a.job === Number(state.pipeJob));
    const jobSel = `<select data-input="pipe-job" class="cursor-pointer ${INPUT} px-2 py-1.5"><option value="all">${esc(t('any_job'))}</option>${open.map((j) => `<option value="${j.id}" ${String(j.id) === String(state.pipeJob) ? 'selected' : ''}>${esc(`${j.title} · ${co(j.co).name}`)}</option>`).join('')}</select>`;
    return `<div class="space-y-3">${header(esc(t('nav_pipeline')), esc(t('pipeline_sub', { n: active.length, jobs: open.length })), openFull('pipeline'))}
      <div class="flex flex-wrap items-center gap-2">${jobSel}<button type="button" data-a="pipe-rejected" class="${CHIP(state.pipeRejected)}">${esc(t('show_rejected'))}</button></div>
      ${apps.length ? board(apps, state.pipeJob === 'all') : `<div class="${CARD}">${empty(t('board_empty'))}</div>`}</div>`;
  }

  /* ═══════════════════════ Recruitment: Jobs ═══════════════════════ */
  function renderJobs() {
    const nOpen = state.jobs.filter((j) => j.status === 'OPEN').length;
    const nHold = state.jobs.filter((j) => j.status === 'ON_HOLD').length;
    const list = state.jobs.filter((j) => state.jobsStatus === 'all' || (state.jobsStatus === 'active' ? ['OPEN', 'ON_HOLD'].includes(j.status) : j.status === state.jobsStatus))
      .sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
    const filt = [['active', lang() === 'cs' ? 'Aktivní' : 'Active'], ['OPEN', t('js_OPEN')], ['ON_HOLD', t('js_ON_HOLD')], ['all', t('all')]].map(([v, l]) => `<button type="button" data-a="jobs-status" data-v="${v}" class="${CHIP(state.jobsStatus === v)}">${esc(l)}</button>`).join('');
    const rows = list.map((j) => {
      const c = co(j.co);
      const n = jobCounts(j.id);
      return `<div data-a="open-job" data-v="${j.id}" class="grid grid-cols-[1fr_auto] items-center gap-2 ${ROW} md:grid-cols-[minmax(0,1fr)_150px_90px_170px_120px_70px]">
        <span class="min-w-0"><span class="block truncate text-[12.5px] font-semibold text-white">${esc(j.title)}</span><span class="block truncate font-mono text-[10px] text-[#5A6275]">${jobRef(j.id)}${j.role ? ` · ${esc(t('job_from_role', { ref: `C${j.role + 2100}` }))}` : ''}${j.type === 'CONTRACT' ? ` · ${esc(t('jt_CONTRACT'))}` : ''}</span></span>
        <span class="hidden min-w-0 items-center gap-1.5 md:flex">${typeBadge(c)}<span class="truncate text-xs text-[#C9CDD6]">${esc(c.name)}</span></span>
        <span>${jobStatusPill(j.status)}</span>
        <span class="hidden truncate text-[11px] text-[#8A90A2] md:block">${esc(plLine(n))}</span>
        <span class="hidden truncate text-[11.5px] text-[#8A90A2] md:block">${esc(userName(j.owner))}</span>
        <span class="hidden text-right font-mono text-[10.5px] text-[#5A6275] md:block">${esc(fmtDate(j.created))}</span></div>`;
    }).join('');
    return `<div class="space-y-3">${header(esc(t('nav_jobs')), esc(t('jobs_sub', { open: nOpen, hold: nHold })), openFull('jobs'))}
      <div class="flex flex-wrap gap-1.5">${filt}</div>
      <div class="${CARD} overflow-hidden"><div class="hidden grid-cols-[minmax(0,1fr)_150px_90px_170px_120px_70px] gap-2 px-3 py-2 ${TH} md:grid"><span>${t('col_title')}</span><span>${t('col_company')}</span><span>${t('col_status')}</span><span>${t('col_pipeline')}</span><span>${t('col_owner')}</span><span class="text-right">${t('col_opened')}</span></div>${rows || empty(t('crm_none'))}</div></div>`;
  }
  function renderJob(j) {
    if (!j) { state.jobOpen = null; return renderJobs(); }
    const c = co(j.co);
    const contact = contactOf(j.contact);
    const apps = state.apps.filter((a) => a.job === j.id);
    const inJob = new Set(apps.map((a) => a.cand));
    const free = state.candidates.filter((x) => !inJob.has(x.id) && x.status !== 'ARCHIVED');
    const notes = notesOf('job', j.id);
    const n = jobCounts(j.id);
    const fact = (label, v) => `<div><div class="${LABEL} text-[#5A6275]">${esc(label)}</div><div class="mt-0.5 text-[12.5px] text-[#E4E6EB]">${v}</div></div>`;
    return `<div class="space-y-3">
      <button type="button" data-a="jobs-back" class="flex items-center gap-1 text-xs font-semibold text-[#8A90A2] hover:text-white cursor-pointer">${ic('arrow_back', 'text-[15px]')}${esc(t('back_to_jobs'))}</button>
      ${header(`${esc(j.title)} <span class="ml-1 align-middle">${jobStatusPill(j.status)}</span>`, `${esc(jobRef(j.id))} · <button type="button" data-a="rec" data-v="company:${c.id}" class="font-semibold text-[#C9CDD6] hover:text-[#FF7733] cursor-pointer">${esc(c.name)}</button>${j.role ? ` · <button type="button" data-a="role" data-v="${j.role}" class="text-[#FF7733] hover:text-white cursor-pointer">${esc(t('job_from_role', { ref: `C${j.role + 2100}` }))}</button>` : ''}`, openFull('jobs'))}
      <div class="${CARD} grid grid-cols-2 gap-3 p-3.5 sm:grid-cols-4">
        ${fact(t('hiring_manager'), contact ? `<button type="button" data-a="rec" data-v="contact:${contact.id}" class="text-left font-semibold text-white hover:text-[#FF7733] cursor-pointer">${esc(contact.name)}</button>${mockTag()}<div class="text-[11px] text-[#8A90A2]">${esc(contact.title)}</div>` : esc(t('no_contact')))}
        ${fact(t('fee'), j.fee_pct != null ? `${fmt(j.fee_pct)} %` : '—')}
        ${fact(t('salary'), esc(j.salary || '—'))}
        ${fact(t('col_owner'), esc(userName(j.owner)))}
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center"><div class="flex-1 text-[11.5px] text-[#8A90A2]">${esc(plLine(n))}</div>
        <form data-form="add-cand" class="flex gap-2"><select name="cand" class="min-w-0 cursor-pointer ${INPUT} px-2 py-1.5 sm:w-56"><option value="">${esc(t('pick_candidate'))}</option>${free.map((x) => `<option value="${x.id}">${esc(`${x.name} · ${x.title}`)}</option>`).join('')}</select><button type="submit" class="${BTN_P}">${ic('person_add', 'text-[15px]')}${esc(t('add_candidate'))}</button></form></div>
      ${apps.length ? board(apps, false) : `<div class="${CARD}">${empty(t('job_pipeline_empty'))}</div>`}
      <div class="${CARD} p-3.5"><div class="${LABEL} text-[#8A90A2]">${esc(t('job_notes'))}</div><div class="mt-2 space-y-2">${notes.map(noteCard).join('') || `<p class="text-xs text-[#8A90A2]">${esc(t('notes_empty'))}</p>`}</div>${noteForm('job-note', t('note_ph'))}</div>
    </div>`;
  }

  /* ═══════════════════════ Recruitment: Companies ═══════════════════════ */
  function lastTouch(companyId) {
    const contactIds = new Set(state.contacts.filter((k) => k.co === companyId).map((k) => k.id));
    const jobIds = new Set(state.jobs.filter((j) => j.co === companyId).map((j) => j.id));
    const notes = state.notes.filter((n) => (n.type === 'contact' && contactIds.has(n.eid)) || (n.type === 'job' && jobIds.has(n.eid)) || (n.type === 'company' && n.eid === companyId));
    return notes.sort((a, b) => (b.at ?? 0) - (a.at ?? 0))[0];
  }
  function renderCompanies() {
    const q = state.coQuery.toLowerCase();
    const list = state.companies.filter((c) => {
      if (state.coScope === 'recruit' && !state.contacts.some((k) => k.co === c.id) && !state.jobs.some((j) => j.co === c.id)) return false;
      if (state.coScope === 'clients' && !c.client) return false;
      return !q || `${c.name} ${c.domain}`.toLowerCase().includes(q);
    }).sort((a, b) => Number(b.client) - Number(a.client) || a.name.localeCompare(b.name));
    const scopes = [['recruit', t('scope_recruit')], ['clients', t('clients')], ['all', t('scope_all')]].map(([v, l]) => `<button type="button" data-a="co-scope" data-v="${v}" class="${CHIP(state.coScope === v)}">${esc(l)}</button>`).join('');
    const rows = list.map((c) => {
      const touch = lastTouch(c.id);
      return `<div data-a="rec" data-v="company:${c.id}" class="grid grid-cols-[1fr_auto] items-center gap-2 ${ROW} md:grid-cols-[minmax(0,1fr)_80px_70px_90px_90px_130px]">
        <span class="flex min-w-0 items-center gap-2">${typeBadge(c)}<span class="min-w-0"><span class="block truncate text-[12.5px] font-semibold text-white">${esc(c.name)}</span><span class="block truncate font-mono text-[10px] text-[#5A6275]">${esc(c.domain)}</span></span></span>
        <span class="text-center font-mono text-xs text-white">${state.contacts.filter((k) => k.co === c.id).length}<span class="text-[10px] text-[#5A6275] md:hidden"> · ${state.jobs.filter((j) => j.co === c.id).length}</span></span>
        <span class="hidden text-center font-mono text-xs text-white md:block">${state.jobs.filter((j) => j.co === c.id && j.status === 'OPEN').length}</span>
        <span class="hidden text-center font-mono text-xs text-[#34D399] md:block">${state.placements.filter((p) => p.co === c.id).length}</span>
        <span class="hidden text-center font-mono text-xs text-[#8A90A2] md:block">${c.active}</span>
        <span class="hidden truncate text-right text-[11px] md:block ${touch ? 'text-[#C9CDD6]' : 'text-[#5A6275]'}">${touch ? `${esc(t('kind_' + (touch.kind || 'note')))} · ${esc(agoLabel(touch.at))}` : esc(t('last_touch_never'))}</span></div>`;
    }).join('');
    return `<div class="space-y-3">${header(esc(t('nav_companies')), esc(t('companies_sub', { n: list.length })), openFull('companies'))}
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">${searchBox('co-q', state.coQuery, t('search'))}<div class="flex flex-wrap gap-1.5">${scopes}</div></div>
      <div class="${CARD} overflow-hidden"><div class="hidden grid-cols-[minmax(0,1fr)_80px_70px_90px_90px_130px] gap-2 px-3 py-2 ${TH} md:grid"><span>${t('col_company')}</span><span class="text-center">${t('col_contacts')}</span><span class="text-center">${t('col_open_jobs')}</span><span class="text-center">${t('col_placements')}</span><span class="text-center">${t('col_radar_roles')}</span><span class="text-right">${t('col_last_touch')}</span></div>${rows || empty(t('crm_none'))}</div></div>`;
  }

  /* ═══════════════════════ Recruitment: Candidates ═══════════════════════ */
  function renderCandidates() {
    const q = state.candQuery.toLowerCase();
    const list = state.candidates.filter((c) => (state.candArchive || c.status !== 'ARCHIVED') && (!q || `${c.name} ${c.title} ${c.company}`.toLowerCase().includes(q)))
      .sort((a, b) => (b.updated ?? 0) - (a.updated ?? 0));
    const rows = list.map((c) => {
      const apps = state.apps.filter((a) => a.cand === c.id && !REJECTED.includes(a.stage));
      return `<div data-a="rec" data-v="cand:${c.id}" class="grid grid-cols-[1fr_auto] items-center gap-2 ${ROW} md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_90px_90px_80px]">
        <span class="flex min-w-0 items-center gap-2">${avatar(c.name)}<span class="min-w-0"><span class="block truncate text-[12.5px] font-semibold text-white">${esc(c.name)}${mockTag()}</span><span class="block truncate text-[11px] text-[#8A90A2] md:hidden">${esc(c.title)}</span></span></span>
        <span class="hidden min-w-0 truncate text-xs text-[#C9CDD6] md:block">${esc(c.title)}<span class="text-[#5A6275]"> · ${esc(c.company)}</span></span>
        <span class="hidden truncate text-[11.5px] text-[#8A90A2] md:block">${esc(c.loc)}</span>
        <span>${pill(t('cs_' + c.status), c.status === 'LIVE' ? 'orange' : c.status === 'PLACED' ? 'green' : 'blue')}</span>
        <span class="hidden text-center font-mono text-xs text-white md:block">${apps.length || '—'}</span>
        <span class="hidden text-right font-mono text-[10.5px] text-[#5A6275] md:block">${esc(agoLabel(c.updated))}</span></div>`;
    }).join('');
    return `<div class="space-y-3">${header(esc(t('nav_candidates')), esc(t('candidates_sub', { n: list.length })), openFull('candidates'))}
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">${searchBox('cand-q', state.candQuery, t('search_cand'))}</div>
      <div class="${CARD} overflow-hidden"><div class="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_90px_90px_80px] gap-2 px-3 py-2 ${TH} md:grid"><span>${t('col_name')}</span><span>${t('col_current')}</span><span>${t('col_location')}</span><span>${t('col_status')}</span><span class="text-center">${t('col_process')}</span><span class="text-right">${t('col_updated')}</span></div>${rows || empty(t('crm_none'))}</div></div>`;
  }

  /* ═══════════════════════ Recruitment: Contacts ═══════════════════════ */
  function renderContacts() {
    const q = state.contactQuery.toLowerCase();
    const list = state.contacts.filter((k) => (!state.contactHm || k.hm) && (!q || `${k.name} ${k.title} ${co(k.co).name}`.toLowerCase().includes(q)))
      .sort((a, b) => co(a.co).name.localeCompare(co(b.co).name) || Number(b.hm) - Number(a.hm));
    const rows = list.map((k) => {
      const c = co(k.co);
      const touch = notesOf('contact', k.id)[0];
      return `<div data-a="rec" data-v="contact:${k.id}" class="grid grid-cols-[1fr_auto] items-center gap-2 ${ROW} md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_150px_130px]">
        <span class="flex min-w-0 items-center gap-2">${avatar(k.name)}<span class="min-w-0"><span class="block truncate text-[12.5px] font-semibold text-white">${esc(k.name)}${mockTag()}</span><span class="block truncate text-[11px] text-[#8A90A2] md:hidden">${esc(k.title)} · ${esc(c.name)}</span></span></span>
        <span class="hidden min-w-0 items-center gap-1.5 md:flex">${k.hm ? pill(t('hm_badge'), 'orange') : ''}<span class="truncate text-xs text-[#C9CDD6]">${esc(k.title)}</span></span>
        <span class="flex min-w-0 items-center gap-1.5">${typeBadge(c)}<span class="hidden truncate text-xs text-[#C9CDD6] md:inline">${esc(c.name)}</span></span>
        <span class="hidden truncate text-right text-[11px] md:block ${touch ? 'text-[#C9CDD6]' : 'text-[#5A6275]'}">${touch ? `${esc(t('kind_' + (touch.kind || 'note')))} · ${esc(agoLabel(touch.at))}` : esc(t('last_touch_never'))}</span></div>`;
    }).join('');
    return `<div class="space-y-3">${header(esc(t('nav_contacts')), esc(t('contacts_sub', { n: list.length })), openFull('contacts'))}
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">${searchBox('contact-q', state.contactQuery, t('search'))}<button type="button" data-a="contact-hm" class="${CHIP(state.contactHm)} self-start">${esc(t('only_hm'))}</button></div>
      <div class="${CARD} overflow-hidden"><div class="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_150px_130px] gap-2 px-3 py-2 ${TH} md:grid"><span>${t('col_contact')}</span><span>${t('current_title')}</span><span>${t('col_company')}</span><span class="text-right">${t('col_last_touch')}</span></div>${rows || empty(t('crm_none'))}</div></div>`;
  }

  /* ═══════════════════════ Recruitment: Placements ═══════════════════════ */
  function inPeriod(ms) {
    if (ms == null) return false;
    const d = new Date(ms);
    const now = new Date();
    if (state.plPeriod === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    if (state.plPeriod === 'quarter') return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === Math.floor(now.getMonth() / 3);
    if (state.plPeriod === 'year') return d.getFullYear() === now.getFullYear();
    return true;
  }
  function renderPlacements() {
    const list = state.placements.filter((p) => inPeriod(p.placed)).sort((a, b) => (b.placed ?? 0) - (a.placed ?? 0));
    const live = list.filter((p) => p.status !== 'FALLEN_OFF');
    const sum = (arr) => arr.reduce((s, p) => s + (p.fee || 0), 0);
    const cur = (list[0] && list[0].currency) || 'CZK';
    const periods = [['month', t('period_month')], ['quarter', t('period_quarter')], ['year', t('period_year')], ['all', t('period_all')]].map(([v, l]) => `<button type="button" data-a="pl-period" data-v="${v}" class="${CHIP(state.plPeriod === v)}">${esc(l)}</button>`).join('');
    const kpi = (label, v, tone = 'text-white') => `<div class="${CARD} p-3"><div class="${LABEL} text-[#8A90A2]">${esc(label)}</div><div class="mt-1.5 font-mono text-lg font-bold ${tone}">${v}</div></div>`;
    const invTone = { NOT_INVOICED: 'amber', INVOICED: 'blue', PAID: 'green' };
    const rows = list.map((p) => `<div class="grid grid-cols-[1fr_auto] items-center gap-2 border-t border-[#1B1E26]/60 px-3 py-2.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_80px_110px_100px]">
      <span class="min-w-0"><span class="block truncate text-[12.5px] font-semibold ${p.status === 'FALLEN_OFF' ? 'text-[#8A90A2] line-through' : 'text-white'}">${esc(p.cand)}${mockTag()}</span><span class="block truncate text-[11px] text-[#8A90A2]">${esc(p.title)}<span class="md:hidden"> · ${esc(p.company)}</span></span></span>
      <span class="hidden min-w-0 items-center gap-1.5 md:flex">${typeBadge(co(p.co))}<span class="truncate text-xs text-[#C9CDD6]">${esc(p.company)}</span></span>
      <span class="hidden truncate text-[11.5px] text-[#8A90A2] md:block">${esc(userName(p.by))}</span>
      <span class="hidden font-mono text-[10.5px] text-[#8A90A2] md:block">${esc(fmtDate(p.placed))}</span>
      <span class="text-right font-mono text-xs text-white md:text-left">${esc(money(p.fee, p.currency))}</span>
      <span class="hidden md:block">${p.status === 'FALLEN_OFF' ? pill(t('fallen_off'), 'red') : pill(t('inv_' + p.invoice), invTone[p.invoice])}</span></div>`).join('');
    return `<div class="space-y-3">${header(esc(t('placements_title')), esc(t('placements_sub', { n: list.length })), openFull('placements'))}
      <div class="flex flex-wrap gap-1.5">${periods}</div>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">${kpi(t('total_fee'), esc(money(sum(live), cur)))}${kpi(t('total_invoiced'), esc(money(sum(live.filter((p) => p.invoice !== 'NOT_INVOICED')), cur)))}${kpi(t('total_paid'), esc(money(sum(live.filter((p) => p.invoice === 'PAID')), cur)), 'text-[#34D399]')}${kpi(t('total_count'), live.length)}</div>
      <div class="${CARD} overflow-hidden"><div class="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_80px_110px_100px] gap-2 px-3 py-2 ${TH} md:grid"><span>${t('col_placed')}</span><span>${t('col_company')}</span><span>${t('consultant')}</span><span>${t('col_date')}</span><span>${t('col_fee')}</span><span>${t('col_invoice')}</span></div>${rows || empty(t('placements_empty'))}</div></div>`;
  }

  /* ═══════════════════════ Recruitment: To-do ═══════════════════════ */
  function taskTarget(x) {
    if (!x.type || x.eid == null) return '';
    const name = x.type === 'candidate' ? (candOf(x.eid) || {}).name : x.type === 'contact' ? (contactOf(x.eid) || {}).name : x.type === 'job' ? (jobOf(x.eid) || {}).title : co(x.eid).name;
    if (!name) return '';
    const v = x.type === 'candidate' ? `rec" data-v="cand:${x.eid}` : x.type === 'contact' ? `rec" data-v="contact:${x.eid}` : x.type === 'job' ? `open-job" data-v="${x.eid}` : `rec" data-v="company:${x.eid}`;
    return `<button type="button" data-a="${v}" class="truncate text-[11px] text-[#8A90A2] hover:text-[#FF7733] cursor-pointer">${esc(t('et_' + x.type))}: ${esc(name)}</button>`;
  }
  function renderTodo() {
    const today = todayStr();
    const list = state.tasks.filter((x) => !state.todoMine || x.for === 1);
    const groups = [
      ['gt_overdue', list.filter((x) => !x.done && x.due && x.due < today), 'text-[#F87171]'],
      ['gt_today', list.filter((x) => !x.done && x.due === today), 'text-[#FF5500]'],
      ['gt_upcoming', list.filter((x) => !x.done && x.due > today).sort((a, b) => a.due.localeCompare(b.due)), 'text-[#38BDF8]'],
      ['gt_no_date', list.filter((x) => !x.done && !x.due), 'text-[#8A90A2]'],
    ];
    if (state.todoDone) groups.push(['gt_done', list.filter((x) => x.done), 'text-[#34D399]']);
    const dueLabel = (d) => { if (!d) return ''; const ms = Date.parse(`${d}T12:00:00`); return fmtDate(ms); };
    const row = (x) => `<div class="flex items-center gap-2.5 border-t border-[#1B1E26]/60 px-3 py-2.5">
      <button type="button" data-a="task-done" data-v="${x.id}" role="checkbox" aria-checked="${x.done}" class="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border cursor-pointer ${x.done ? 'border-[#10B981] bg-[#10B981]/20 text-[#34D399]' : 'border-white/25 hover:border-[#FF5500]'}">${x.done ? ic('check', 'text-[12px]') : ''}</button>
      <span class="min-w-0 flex-1"><span class="block truncate text-[12.5px] ${x.done ? 'text-[#5A6275] line-through' : 'text-white'}">${esc(x.title)}</span><span class="flex min-w-0 items-center gap-2">${taskTarget(x)}${!state.todoMine ? `<span class="truncate text-[11px] text-[#5A6275]">${esc(t('for_whom'))}: ${esc(userName(x.for))}</span>` : ''}</span></span>
      <span class="flex-shrink-0 font-mono text-[10.5px] text-[#8A90A2]">${esc(dueLabel(x.due))}</span></div>`;
    const body = groups.filter(([, items]) => items.length).map(([k, items, color]) => `<div class="border-t border-[#1B1E26] px-3 pt-2.5 pb-1 font-mono text-[9.5px] font-bold tracking-wider ${color}">${esc(t(k))} · ${items.length}</div>${items.map(row).join('')}`).join('');
    return `<div class="space-y-3">${header(esc(t('nav_todo')), esc(t(state.todoMine ? 'todo_sub_mine' : 'todo_sub_all')), openFull('todo'))}
      <div class="flex flex-wrap items-center gap-1.5"><button type="button" data-a="todo-mine" data-v="1" class="${CHIP(state.todoMine)}">${esc(t('mine'))}</button><button type="button" data-a="todo-mine" data-v="0" class="${CHIP(!state.todoMine)}">${esc(t('everyone'))}</button><span class="mx-0.5 h-4 w-px bg-[#1B1E26]"></span><button type="button" data-a="todo-done" class="${CHIP(state.todoDone)}">${esc(t('show_done'))}</button></div>
      <form data-form="task" class="${CARD} flex flex-col gap-2 p-3 sm:flex-row"><input name="title" maxlength="160" autocomplete="off" placeholder="${esc(t('task_placeholder'))}" class="min-w-0 flex-1 ${INPUT} px-3 py-1.5"><input name="due" type="date" value="${today}" aria-label="${esc(t('due'))}" class="${INPUT} px-2 py-1.5 [color-scheme:dark]"><button type="submit" class="${BTN_P}">${ic('add', 'text-[15px]')}${esc(t('task_add'))}</button></form>
      <div class="${CARD} overflow-hidden">${body || empty(t('todo_empty'))}</div></div>`;
  }

  /* ═══════════════════════ Scanner ═══════════════════════ */
  function renderScanner() {
    const n = state.companies.length;
    const run = state.scanRun;
    const head = header(esc(t('nav_scanner')), esc(t('sc_sub', { n })), openFull('scanner'));
    const tabs = tabsBar([['companies', t('sc_tab_companies'), n], ['schedule', t('sc_tab_schedule')]], state.scTab, 'sc-tab');
    if (state.scTab === 'schedule') return `<div class="space-y-3">${head}${tabs}${renderSchedule()}</div>`;

    const h = pragueHour();
    const times = SCAN_TIMES[state.scanFreq];
    const nextT = times.find((x) => Number(x.slice(0, 2)) > h);
    const nextWhen = nextT ? t('today') : (lang() === 'cs' ? 'Zítra' : 'Tomorrow');
    const freq = t(state.scanFreq === 1 ? 'f1' : state.scanFreq === 2 ? 'f2' : 'f4');
    const pctCredits = Math.round((state.credits / 500) * 100);
    const scanAt = parse(state.scan.at);
    const card = (label, icon, inner) => `<div class="${CARD} p-3.5"><div class="flex items-center justify-between"><span class="${LABEL} text-[#8A90A2]">${esc(label)}</span>${ic(icon, 'text-[17px] text-[#5A6275]')}</div>${inner}</div>`;

    let runBox = '';
    if (run && !run.done) {
      const cur = state.companies[Math.min(run.i, n - 1)];
      runBox = `<div class="rounded-xl border-[1.5px] border-[#FF5500] bg-[#FF5500]/[0.08] p-3.5"><div class="flex items-center gap-2 text-[13px] font-bold text-white"><span class="tr-spin inline-block h-3.5 w-3.5 rounded-full border-2 border-[#FF5500] border-t-transparent"></span>${esc(t('sc_run_title', { n }))}</div>
        <div class="mt-1 font-mono text-[11px] text-[#C9CDD6]">${esc(t('sc_run_now', { co: cur.name, ats: cur.ats || '—' }))}</div>
        <div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#1B1E26]"><div class="h-full rounded-full bg-[#FF5500] transition-all duration-200" style="width:${Math.round((run.i / n) * 100)}%"></div></div></div>`;
    } else if (run && run.done) {
      runBox = `<div class="flex flex-col gap-3 rounded-xl border-[1.5px] border-[#10B981]/60 bg-[#10B981]/[0.08] p-3.5 sm:flex-row sm:items-center"><div class="flex-1"><div class="flex items-center gap-1.5 text-[13px] font-bold text-white">${ic('check_circle', 'text-[17px] text-[#34D399]')}${esc(t('sc_done_title', { s: run.secs }))}</div>
        <div class="mt-0.5 font-mono text-[11px] text-[#C9CDD6]">${esc(t('sc_done_text', { c: n, t: scanAt != null ? pragueTime(scanAt) : '—' }))}</div></div>
        <button type="button" data-a="sc-view-new" class="${BTN_P}">${esc(t('sc_done_view'))} ${ic('arrow_forward', 'text-[15px]')}</button></div>`;
    }

    const q = state.scQuery.toLowerCase();
    const rows = state.companies.filter((c) => !q || `${c.name} ${c.domain} ${c.careers}`.toLowerCase().includes(q)).map((c) => {
      const busy = c.scan === 'busy';
      const action = c.scan === 'queued' ? `<span class="font-mono text-[10px] text-[#FBBF24]">${esc(t('sc_queued'))}</span>`
        : `<button type="button" data-a="sc-one" data-v="${c.id}" class="rounded-md border border-white/[0.12] px-2.5 py-1 text-[11px] font-semibold text-white hover:border-[#FF5500] disabled:opacity-50 cursor-pointer" ${busy || (run && !run.done) || state.credits <= 0 ? 'disabled' : ''}>${busy ? `<span class="tr-spin mr-1 inline-block h-2.5 w-2.5 rounded-full border-2 border-[#FF5500] border-t-transparent align-[-1px]"></span>${esc(t('sc_scanning'))}` : esc(t('sc_scan'))}</button>`;
      const last = c.scan === 'queued' ? '—' : c.scannedNow ? t('just_now') : (parse(c.scanned) != null ? agoLabel(parse(c.scanned)) : '—');
      return `<div class="grid grid-cols-[1fr_auto] items-center gap-2 border-t border-[#1B1E26]/60 px-3 py-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_70px_40px_60px_96px_76px]">
        <span class="min-w-0"><span class="block truncate text-[12.5px] font-semibold text-white">${esc(c.name)}</span><span class="block truncate font-mono text-[10px] text-[#5A6275]">${esc(c.domain)}</span></span>
        <span class="hidden min-w-0 items-center gap-1.5 md:flex"><a href="${esc(c.careers)}" target="_blank" rel="noopener noreferrer" class="truncate font-mono text-[10.5px] text-[#8A90A2] hover:text-[#FF7733]">${esc(String(c.careers).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>${atsBadge(c.ats)}</span>
        <span class="hidden text-right font-mono text-xs text-white md:block">${c.active}</span>
        <span class="hidden md:block">${typeBadge(c)}</span>
        <span class="hidden text-[11px] text-[#34D399] md:block">${esc(t('on'))}</span>
        <span class="hidden font-mono text-[10.5px] text-[#8A90A2] md:block">${esc(last)}</span>
        <span class="justify-self-end">${action}</span></div>`;
    }).join('');

    return `<div class="space-y-3">${head}${tabs}
      <div class="grid gap-3 md:grid-cols-3">
        ${card(t('sc_next'), 'schedule', `<div class="mt-2 text-lg font-bold text-white">${esc(`${nextWhen} ${nextT || times[0]}`)}</div><div class="text-[11px] text-[#8A90A2]">${esc(t('sc_tz', { freq, n }))}</div><button type="button" data-a="sc-tab" data-v="schedule" class="mt-2 flex items-center gap-1 text-xs font-semibold text-[#FF7733] hover:text-white cursor-pointer">${esc(t('sc_change'))} ${ic('arrow_forward', 'text-[14px]')}</button>`)}
        ${card(t('sc_last'), 'history', `<div class="mt-2 text-lg font-bold text-white">${esc(state.scanned ? t('just_now') : lastScanText())}</div><div class="text-[11px] text-[#8A90A2]">${esc(t('sc_last_v', { n: state.scan.companies || n, s: state.scanned ? state.scanRun.secs : (state.scan.seconds || '—'), f: state.scan.found ?? 0 }))}</div><div class="mt-2 text-[11px] text-[#34D399]">${esc(t('sc_all_ok'))}</div>`)}
        ${card(t('sc_credits'), 'bolt', `<div class="mt-2 flex items-baseline justify-between"><span class="font-mono text-lg font-bold text-white">${state.credits} / 500</span><span class="font-mono text-[10px] font-bold text-[#FF5500]">${pctCredits}% ${esc(t('avail'))}</span></div><div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1B1E26]"><div class="h-full rounded-full bg-[#FF5500]" style="width:${pctCredits}%"></div></div><div class="mt-1.5 text-[10.5px] text-[#5A6275]">${esc(t('sc_credit_note'))}</div>`)}
      </div>
      ${runBox}
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        ${searchBox('sc-q', state.scQuery, t('sc_search'), 'flex-1 sm:max-w-xs')}
        <button type="button" data-a="sc-all" class="${BTN_P} sm:ml-auto disabled:cursor-not-allowed disabled:opacity-50" ${(run && !run.done) || state.credits < n ? 'disabled' : ''}>${ic('refresh', 'text-[15px]')}${esc(t('sc_scan_all', { n }))}</button>
      </div>
      <div class="${CARD} overflow-hidden">
        <div class="hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_70px_40px_60px_96px_76px] gap-2 px-3 py-2 ${TH} md:grid"><span>${t('col_company')}</span><span>${t('col_careers')}</span><span class="text-right">${t('col_roles')}</span><span>${t('col_type')}</span><span>${t('col_auto')}</span><span>${t('col_lastscan')}</span><span></span></div>${rows}
      </div>
      <form data-form="add-company" class="${CARD} p-3.5"><div class="${LABEL} text-[#8A90A2]">${esc(t('sc_add_title'))}</div>
        <div class="mt-2 flex flex-col gap-2 sm:flex-row"><input name="url" autocomplete="off" placeholder="${esc(t('sc_add_ph'))}" class="min-w-0 flex-1 ${INPUT} bg-[#0B0E14] px-3 py-1.5"><button type="submit" class="${BTN_S}">${ic('add', 'text-[15px]')}${esc(t('sc_add_btn'))}</button></div>
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
  const AREAS = [
    ['Data / AI / ML', /\b(data|ai|ml|machine learning|llm|analytic|analyst|bi\b|scien)/i],
    ['DevOps / Cloud / SRE', /\b(devops|cloud|sre|platform|infra|kubernetes|site reliability|network|linux|sysadmin)/i],
    ['Java / Kotlin', /\b(java|kotlin|scala)\b/i],
    ['.NET / C#', /(\.net|c#|dotnet)/i],
    ['Frontend / Mobile', /\b(front|react|angular|vue|ios|android|mobile|javascript|typescript)/i],
    ['Python / Go / Backend', /\b(python|golang|go\b|backend|back-end|php|node|ruby|rust|c\+\+)/i],
    ['QA / Test', /\b(qa|test|quality)/i],
    ['Security', /\b(security|secops|appsec|cyber|bezpečnost)/i],
    ['Product / Design', /\b(product|ux|ui\b|design)/i],
    ['Sales / BD', /\b(sales|account|business development|obchod|partnership|revenue)/i],
    ['Engineering leadership', /\b(head|director|vp|chief|cto|manager|lead)\b/i],
  ];
  function renderAnalytics() {
    const w = state.anWindow;
    const total = state.roles.length;
    const prog = state.roles.filter((r) => ['CONTACT_PENDING', 'CONTACTED', 'IN_PROGRESS'].includes(r.status)).length;
    const coreN = state.roles.filter((r) => r.fit === 'CORE').length;
    const velocity = state.roles.filter((r) => r.age < w).length;
    const tile = (label, icon, big, sub) => `<div class="${CARD} p-3.5"><div class="flex items-center justify-between"><span class="${LABEL} text-[#8A90A2]">${esc(label)}</span>${ic(icon, 'text-[17px] text-[#5A6275]')}</div><div class="mt-2 font-mono text-2xl font-bold text-white">${big}</div><div class="text-[11px] text-[#5A6275]">${esc(sub)}</div></div>`;
    const areaCounts = AREAS.map(([k, re]) => [k, state.roles.filter((r) => re.test(r.title)).length]).filter(([, v]) => v).sort((a, b) => b[1] - a[1]).slice(0, 7);
    const max = (areaCounts[0] || [0, 1])[1];
    const bars = areaCounts.map(([k, v]) => `<div data-tip="${esc(k)}: ${v} ${esc(t('roles_word'))}" class="group cursor-default"><div class="flex items-center justify-between text-xs"><span class="text-[#C9CDD6]">${esc(k)}</span><span class="font-mono text-[11px] text-white">${v}</span></div>
      <div class="mt-1 h-2 rounded-full bg-[#1B1E26]"><div class="h-full rounded-[4px] bg-[#FF5500] transition-opacity group-hover:opacity-80" style="width:${Math.max(3, (v / max) * 100)}%"></div></div></div>`).join('');
    const top = [...state.companies].sort((a, b) => b.active - a.active).slice(0, 6);
    const topMax = (top[0] || { active: 1 }).active || 1;
    const tops = top.map((c, i) => `<div data-tip="${esc(c.name)}: ${c.active} ${esc(t('roles_word'))}" class="group cursor-default"><div class="flex items-center gap-2 text-xs"><span class="w-6 font-mono text-[10px] text-[#5A6275]">#${String(i + 1).padStart(2, '0')}</span><span class="font-semibold text-white">${esc(c.name)}</span>${c.client ? pill(t('client'), 'orange') : ''}<span class="ml-auto font-mono text-[11px] text-white">${c.active}</span></div>
      <div class="mt-1 ml-8 h-1.5 rounded-full bg-[#1B1E26]"><div class="h-full rounded-[4px] bg-[#FF5500]/80 group-hover:bg-[#FF5500]" style="width:${(c.active / topMax) * 100}%"></div></div></div>`).join('');
    const days = Array.from({ length: 14 }, (_, i) => pragueDay(Date.now() - (13 - i) * DAY));
    const daily = days.map((d) => state.dailyNew[d] || 0);
    const dMax = Math.max(1, ...daily);
    const dayLabel = (d) => new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'numeric' }).format(new Date(`${d}T12:00:00`));
    const cols = daily.map((v, i) => `<div data-tip="${esc(dayLabel(days[i]))}: ${v} ${esc(t('roles_word'))}" class="group flex h-full flex-1 cursor-default flex-col justify-end"><div class="rounded-t-[4px] bg-[#FF5500]/75 group-hover:bg-[#FF5500]" style="height:${v ? Math.max(3, (v / dMax) * 100) : 0}%"></div></div>`).join('');
    const winBtns = [[7, 'w7'], [30, 'w30']].map(([v, k]) => `<button type="button" data-a="an-win" data-v="${v}" class="rounded-md px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${w === v ? 'bg-[#1B1E26] text-white' : 'text-[#8A90A2] hover:text-white'}">${t(k)}</button>`).join('');
    return `<div class="space-y-3">${header(esc(t('an_title')), esc(t('an_sub')), `<div class="flex rounded-lg border border-[#1B1E26] bg-[#0F1117] p-0.5">${winBtns}</div>${openFull('analytics')}`)}
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        ${tile(t('an_total'), 'visibility', fmt(total), t('an_total_sub', { n: state.companies.length }))}
        ${tile(t('an_progress'), 'pending_actions', prog, t('an_progress_sub'))}
        ${tile(t('an_ratio'), 'verified', `${total ? Math.round((coreN / total) * 100) : 0}%`, t('an_ratio_sub', { n: fmt(coreN) }))}
        ${tile(t('an_velocity'), 'trending_up', '+' + velocity, t('an_velocity_sub', { w: t(w === 7 ? 'w7' : 'w30') }))}
      </div>
      <div class="grid gap-3 lg:grid-cols-2">
        <div class="${CARD} p-4"><div class="${LABEL} text-white">${esc(t('an_stack'))}</div><div class="mb-3 text-[11px] text-[#5A6275]">${esc(t('an_stack_sub'))}</div><div class="space-y-2.5">${bars}</div></div>
        <div class="${CARD} p-4"><div class="${LABEL} text-white">${esc(t('an_top'))}</div><div class="mb-3 text-[11px] text-[#5A6275]">${esc(t('an_top_sub'))}</div><div class="space-y-2.5">${tops}</div></div>
      </div>
      <div class="${CARD} p-4"><div class="${LABEL} text-white">${esc(t('an_daily'))}</div><div class="mb-3 text-[11px] text-[#5A6275]">${esc(t('an_daily_sub'))}</div>
        <div class="flex h-28 items-end gap-[2px] border-b border-[#1B1E26]">${cols}</div>
        <div class="mt-1 flex justify-between font-mono text-[9.5px] text-[#5A6275]"><span>${esc(dayLabel(days[0]))}</span><span>${esc(dayLabel(days[7]))}</span><span>${esc(dayLabel(days[13]))}</span></div></div>
    </div>`;
  }

  /* ═══════════════════════ Settings ═══════════════════════ */
  const PROFILE = {
    core: { en: ['Software engineering', 'Data & AI', 'Product management', 'Infrastructure & cloud', 'Security', 'Engineering leadership'], cs: ['Vývoj softwaru', 'Data & AI', 'Produktový management', 'Infrastruktura & cloud', 'Bezpečnost', 'Vedení vývoje'] },
    sel: { en: ['Product design', 'B2B sales', 'IT business analysis'], cs: ['Produktový design', 'B2B obchod', 'IT business analýza'] },
    skip: { en: ['Internships', 'Warehouse & logistics ops', 'Customer support agents', 'Internal recruiters'], cs: ['Stáže', 'Sklad & logistika', 'Zákaznická podpora', 'Interní recruiteři'] },
  };
  const MARKETS = { core: { en: ['Czechia'], cs: ['Česko'] }, sel: { en: ['Slovakia', 'Remote EU'], cs: ['Slovensko', 'Remote EU'] }, block: { en: ['Everything else'], cs: ['Všechno ostatní'] } };
  const LOCS = [['Praha', 'core'], ['Brno', 'core'], ['Ostrava', 'core'], ['Bratislava', 'sel'], ['Remote EU', 'sel'], ['Berlin', 'block']];
  function classify(title, locKind) {
    const s = ` ${title.toLowerCase()} `;
    const has = (list) => list.find((k) => s.includes(k));
    let fit; let why;
    const skip = has(['intern', 'stáž', 'warehouse', 'sklad', 'driver', 'řidič', 'picker', 'support agent', 'call center', 'recruiter', 'brigád']);
    const core = has(['engineer', 'developer', 'vývojář', 'architect', 'data', ' ml ', ' ai ', 'devops', 'sre', 'security', 'product manager', 'cto', 'programátor', 'head of engineering']);
    const sel = has(['designer', 'sales', 'account', 'analyst', 'analytik', 'obchod']);
    if (skip) { fit = 'SKIP'; why = t('test_r_skip', { k: skip.trim() }); }
    else if (core) { fit = 'CORE'; why = t('test_r_core', { k: core.trim() }); }
    else if (sel) { fit = 'SELECTIVE'; why = t('test_r_sel', { k: sel.trim() }); }
    else { fit = 'SELECTIVE'; why = t('test_r_none'); }
    if (fit !== 'SKIP' && locKind === 'block') { fit = 'SKIP'; why += ' ' + t('test_cap_block'); }
    else if (fit === 'CORE' && locKind === 'sel') { fit = 'SELECTIVE'; why += ' ' + t('test_cap_sel'); }
    return { fit, why };
  }
  function renderSettings() {
    const tabs = tabsBar([['spec', t('set_tab_spec')], ['modules', t('set_tab_modules')], ['schedule', t('set_tab_schedule')]], state.setTab, 'set-tab');
    const L = lang();
    let body = '';
    if (state.setTab === 'modules') {
      const mod = (key, title, desc, on, locked) => `<div class="flex items-start gap-3 rounded-xl border border-[#1B1E26] bg-[#0F1117] p-3.5">
        <div class="flex-1"><div class="text-[13px] font-bold text-white">${esc(title)}</div><div class="mt-0.5 text-[11.5px] text-[#8A90A2]">${esc(desc)}</div></div>
        <button type="button" ${locked ? 'disabled' : `data-a="mod" data-v="${key}"`} role="switch" aria-checked="${on}" aria-label="${esc(title)}" class="relative mt-0.5 h-5 w-9 flex-shrink-0 rounded-full transition-colors ${on ? 'bg-[#FF5500]' : 'bg-[#2A2F3B]'} ${locked ? 'opacity-60' : 'cursor-pointer'}"><span class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? 'left-[18px]' : 'left-0.5'}"></span></button></div>`;
      body = `<p class="text-xs text-[#8A90A2]">${esc(t('mod_sub'))}</p><div class="mt-3 space-y-2">${mod('bd', t('mod_bd'), t('mod_bd_d'), true, true)}${mod('ats', t('mod_ats'), t('mod_ats_d'), state.atsOn, false)}</div>
        <div class="mt-3 rounded-lg border-[1.5px] border-[#FF5500]/60 bg-[#FF5500]/[0.07] px-3.5 py-2.5 text-xs font-bold text-white">${esc(state.atsOn ? t('mode_b') : t('mode_a'))}</div>`;
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
          <input name="title" maxlength="120" autocomplete="off" value="${esc(state.testTitle || '')}" placeholder="${esc(t('test_ph'))}" class="mt-3 w-full ${INPUT} bg-[#0B0E14] px-3 py-1.5">
          <label class="mt-2 block text-[11px] text-[#8A90A2]">${esc(t('test_loc'))}<select name="loc" class="mt-1 w-full cursor-pointer ${INPUT} bg-[#0B0E14] px-2 py-1.5">${LOCS.map(([l], i) => `<option value="${i}" ${String(state.testLoc || 0) === String(i) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
          <button type="submit" class="${BTN_P} mt-3 w-full">${esc(t('test_btn'))}</button>
          ${tr ? `<div class="mt-3 rounded-lg border border-[#1B1E26] bg-[#0B0E14] p-3"><div>${fitBadge(tr.fit)}</div><p class="mt-1.5 text-[11.5px] leading-relaxed text-[#C9CDD6]">${esc(tr.why)}</p></div>` : ''}</form></div>`;
    }
    return `<div class="space-y-3">${header(esc(t('nav_settings')), '', openFull('settings'))}${tabs}${body}</div>`;
  }

  /* ═══════════════════════ AI Hawk ═══════════════════════ */
  const hawkAnchor = () => (state.panel && roleOf(state.panel)) || state.roles.find((r) => r.fit === 'CORE' && !co(r.co).client) || state.roles[0];
  function renderHawk() {
    const fab = `<button type="button" data-a="hawk" class="absolute right-4 bottom-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-[#FF5500] bg-[#0F1117] shadow-[0_0_24px_rgba(255,85,0,0.35)] transition-transform hover:scale-105 cursor-pointer ${state.hawkOpen ? 'hidden' : ''}" aria-label="${esc(t('hawk_title'))}">
      <img src="falcon.svg" alt="" class="h-6 w-6 object-contain"><span class="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B0E14] bg-[#10B981]"></span></button>`;
    if (!state.hawkOpen) return fab;
    const anchor = hawkAnchor();
    const chips = [['core', t('hq_core')], ...(state.atsOn ? [['pipe', t('hq_pipe')]] : []), ['pitch', t('hq_pitch')], ['draft', t('hq_draft', { co: co(anchor.co).name })]];
    const msgs = state.hawk.map((m) => (m.me
      ? `<div class="ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-[#FF5500]/[0.15] px-3 py-2 text-[12.5px] text-white">${esc(m.text)}</div>`
      : `<div class="max-w-[92%] rounded-xl rounded-bl-sm border border-[#1B1E26] bg-[#0F1117] px-3 py-2 text-[12.5px] leading-relaxed text-[#C9CDD6]">${m.html}</div>`)).join('');
    return `<div class="fixed inset-0 z-[60] flex w-full flex-col border-l lg:absolute lg:inset-y-0 lg:left-auto lg:right-0 lg:z-40 lg:max-w-[380px] border-[#1B1E26] bg-[#0B0E14] shadow-2xl">
      <div class="flex items-center gap-2.5 border-b border-[#1B1E26] px-4 py-3"><img src="falcon.svg" alt="" class="h-6 w-6 object-contain"><div class="flex-1"><div class="text-sm font-bold text-white">${esc(t('hawk_title'))}</div><div class="text-[10.5px] text-[#8A90A2]">${esc(t('hawk_sub'))} · <span class="font-mono">${esc(t('hawk_kbd'))}</span></div></div>
        <button type="button" data-a="hawk-close" class="rounded-md p-1 text-[#8A90A2] hover:text-white cursor-pointer" aria-label="${esc(t('p_close'))}">${ic('close', 'text-[18px]')}</button></div>
      <div id="trSbHawkLog" class="tr-sb-scroll flex-1 space-y-2.5 overflow-y-auto p-4">
        <div class="max-w-[92%] rounded-xl rounded-bl-sm border border-[#1B1E26] bg-[#0F1117] px-3 py-2 text-[12.5px] leading-relaxed text-[#C9CDD6]">${esc(t('hawk_hello'))}</div>${msgs}
        ${state.hawkBusy ? '<div class="flex gap-1 px-1 py-2"><span class="tr-dot h-1.5 w-1.5 rounded-full bg-[#FF5500]"></span><span class="tr-dot h-1.5 w-1.5 rounded-full bg-[#FF5500]" style="animation-delay:.15s"></span><span class="tr-dot h-1.5 w-1.5 rounded-full bg-[#FF5500]" style="animation-delay:.3s"></span></div>' : ''}</div>
      <div class="border-t border-[#1B1E26] p-3"><div class="mb-2 flex flex-wrap gap-1.5">${chips.map(([k, l]) => `<button type="button" data-a="hq" data-v="${k}" class="rounded-full border border-[#1B1E26] bg-[#0F1117] px-2.5 py-1 text-left text-[11px] text-[#C9CDD6] hover:border-[#FF5500] hover:text-white cursor-pointer" ${state.hawkBusy ? 'disabled' : ''}>${esc(l)}</button>`).join('')}</div>
        <form data-form="hawk" class="flex gap-2"><input name="q" maxlength="200" autocomplete="off" placeholder="${esc(t('hawk_ph'))}" class="min-w-0 flex-1 ${INPUT} px-3 py-1.5"><button type="submit" class="${BTN_P}" aria-label="${esc(t('hawk_send'))}">${ic('send', 'text-[15px]')}</button></form></div></div>`;
  }
  function hawkAnswer(kind) {
    const roleLink = (r) => `<button type="button" data-a="role" data-v="${r.id}" class="block w-full truncate rounded px-1.5 py-1 text-left text-[12px] hover:bg-[#151720] cursor-pointer"><span class="font-mono text-[10.5px] text-[#FF7733]">${r.ref}</span> <span class="text-white">${esc(r.title)}</span> <span class="text-[#8A90A2]">· ${esc(co(r.co).name)}</span></button>`;
    if (kind === 'core') {
      const all = state.roles.filter((r) => r.fit === 'CORE' && co(r.co).client).sort((a, b) => (b.seen ?? 0) - (a.seen ?? 0));
      return `${md(t('ha_core', { n: all.length, t: all.filter((r) => r.age === 0).length }))}<div class="mt-1.5">${all.slice(0, 3).map(roleLink).join('')}</div>`;
    }
    if (kind === 'pipe') {
      const open = new Set(state.jobs.filter((j) => j.status === 'OPEN').map((j) => j.id));
      const close = state.apps.filter((a) => open.has(a.job) && ['FINAL', 'OFFER'].includes(a.stage));
      if (!close.length) return esc(t('ha_pipe_none'));
      return `${md(t('ha_pipe', { n: close.length }))}<div class="mt-1.5">${close.slice(0, 5).map((a) => { const c = candOf(a.cand); const j = jobOf(a.job); return `<button type="button" data-a="rec" data-v="cand:${c.id}" class="block w-full truncate rounded px-1.5 py-1 text-left text-[12px] hover:bg-[#151720] cursor-pointer"><span class="text-white">${esc(c.name)}</span> <span class="text-[#8A90A2]">· ${esc(t('ps_' + a.stage))} · ${esc(j.title)}, ${esc(co(j.co).name)}</span></button>`; }).join('')}</div>`;
    }
    if (kind === 'pitch') {
      const stale = state.roles.filter((r) => isStale(r)).sort((a, b) => b.open - a.open)[0];
      const sp = spike();
      const fresh = state.roles.filter((r) => r.age <= 1 && r.fit === 'CORE' && !co(r.co).client)[0];
      const items = [stale && [t('ha_pitch_stale', { co: co(stale.co).name, r: stale.title, d: stale.open }), stale], sp && [t('ha_pitch_spike', { co: sp.c.name, n: sp.n }), null], fresh && [t('ha_pitch_new', { co: co(fresh.co).name, r: fresh.title }), fresh]].filter(Boolean);
      return `${esc(t('ha_pitch'))}<ol class="mt-1.5 space-y-1">${items.map(([txt, r], i) => `<li class="flex gap-2"><span class="font-mono text-[11px] text-[#FF7733]">${i + 1}.</span>${r ? `<button type="button" data-a="role" data-v="${r.id}" class="text-left text-white hover:text-[#FF7733] cursor-pointer">${esc(txt)}</button>` : `<span class="text-white">${esc(txt)}</span>`}</li>`).join('')}</ol>`;
    }
    if (kind === 'draft') {
      const r = hawkAnchor();
      const c = co(r.co);
      const hm = (r.hm.targets && r.hm.targets[0]) || 'Head of Engineering';
      return `${esc(t('ha_draft', { hm, co: c.name }))}<pre class="mt-2 whitespace-pre-wrap rounded-lg border border-[#1B1E26] bg-[#0B0E14] p-2.5 font-sans text-[12px] leading-relaxed text-white">${esc(t('ha_draft_body', { r: r.title, loc: r.loc }))}</pre>`;
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
    if (/(draft|email|e-mail|outreach|message|oslov.*pro|napiš|zpráv)/.test(s)) return 'draft';
    if (/(offer|final|nabíd|finál|pipeline|kandidát|candidate|pohovor|interview)/.test(s)) return 'pipe';
    if (/(pitch|today|who|call|koho|dnes|volat)/.test(s)) return 'pitch';
    if (/(core|client|klient|how many|kolik)/.test(s)) return 'core';
    return 'other';
  }

  /* ═══════════════════════ Actions ═══════════════════════ */
  function makeJob(roleId) {
    const r = roleOf(roleId);
    if (!r || state.jobs.some((j) => j.role === r.id)) return;
    const id = Math.max(0, ...state.jobs.map((j) => j.id)) + 1;
    const hm = state.contacts.find((k) => k.co === r.co && k.hm);
    state.jobs.unshift({ id, co: r.co, role: r.id, contact: hm ? hm.id : null, title: r.title, loc: r.loc, salary: '', fee_pct: 20, type: 'PERMANENT', status: 'OPEN', owner: 1, created: Date.now() });
    r.history.push({ kind: 'job', id, at: Date.now() });
    if (!KEPT_BY_JOB.includes(r.status)) { r.status = 'WON'; r.history.push({ kind: 'status', to: 'WON', by: t('you'), at: Date.now() }); }
    state.tour.job = true;
    toast(t('toast_job', { id: jobRef(id) }));
    openJob(id);
  }
  function moveApp(appId, stage) {
    const a = state.apps.find((x) => x.id === appId);
    if (!a || !stage || a.stage === stage) return;
    const from = a.stage;
    a.stage = stage;
    a.since = Date.now();
    state.events.push({ app: a.id, from, to: stage, by: t('you'), at: Date.now() });
    state.tour.move = true;
    const c = candOf(a.cand);
    const j = jobOf(a.job);
    if (stage === 'PLACED' && !state.placements.some((p) => p.app === a.id)) {
      const fee = Math.round(DEFAULT_BASE_SALARY * ((j.fee_pct ?? 20) / 100));
      state.placements.unshift({ id: `new-${a.id}`, app: a.id, cand: c.name, title: j.title, co: j.co, company: co(j.co).name, by: 1, placed: Date.now(), fee, fee_pct: j.fee_pct ?? 20, currency: 'CZK', status: 'ACTIVE', invoice: 'NOT_INVOICED' });
      c.status = 'PLACED';
      toast(t('toast_placed', { c: c.name, co: co(j.co).name, f: money(fee) }));
    } else {
      if (!REJECTED.includes(stage)) c.status = 'LIVE';
      toast(t('toast_moved', { c: c.name, s: t('ps_' + stage) }));
    }
    c.updated = Date.now();
    render();
  }
  function addToJob(jobId, candId) {
    const j = jobOf(jobId);
    const c = candOf(candId);
    if (!j || !c || state.apps.some((a) => a.job === jobId && a.cand === candId)) return;
    const id = Math.max(0, ...state.apps.map((a) => a.id)) + 1;
    state.apps.push({ id, job: jobId, cand: candId, stage: 'SHORTLISTED', since: Date.now(), created: Date.now() });
    state.events.push({ app: id, from: '', to: 'SHORTLISTED', by: t('you'), at: Date.now() });
    c.status = 'LIVE';
    c.updated = Date.now();
    toast(t('toast_added', { c: c.name }));
    render();
  }
  function openJob(id) {
    state.screen = 'jobs';
    state.jobOpen = id;
    state.panel = null;
    state.rec = null;
    render();
    const main = root && root.querySelector('#trSbMain');
    if (main) main.scrollTop = 0;
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
    if (!state.loaded) { root.innerHTML = renderPlaceholder(); return; }
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
    if (window.TRBrand) window.TRBrand(root);
    const main2 = root.querySelector('#trSbMain');
    if (main2) main2.scrollTop = scrollTop;
    const panel2 = root.querySelector('[data-stop]');
    if (panel2) panel2.scrollTop = panelScroll;
    const log = root.querySelector('#trSbHawkLog');
    if (log) log.scrollTop = log.scrollHeight;
    if (focus && focus.key) {
      const el = root.querySelector(`[data-input="${focus.key}"]`);
      if (el) { el.focus(); try { el.setSelectionRange(focus.start, focus.end); } catch (e) { /* not a text field */ } }
    }
  }
  function go(screen) {
    if (RECRUIT.includes(screen) && !state.atsOn) screen = 'settings';
    state.screen = screen;
    state.panel = null;
    state.rec = null;
    if (screen === 'jobs') state.jobOpen = null;
    render();
    const main = root && root.querySelector('#trSbMain');
    if (main) main.scrollTop = 0;
  }
  function openRole(id) {
    if (!roleOf(id)) return;
    state.panel = id;
    state.panelTab = 'overview';
    state.tour.open_role = true;
    state.hawkOpen = false;
    render();
    const p = root.querySelector('[data-stop]');
    if (p) p.scrollTop = 0;
  }
  function openRec(spec) {
    const [type, id] = spec.split(':');
    state.panel = null;
    state.hawkOpen = false;
    state.rec = { type, id: Number(id) };
    state.recTab = 'overview';
    render();
    const p = root.querySelector('[data-stop]');
    if (p) p.scrollTop = 0;
  }
  function exportCsv() {
    const list = bdFiltered();
    const rows = [['Ref', 'Role', 'Company', 'Type', 'Location', 'Fit', 'Status', 'First seen', 'Posting']]
      .concat(list.map((r) => { const c = co(r.co); return [r.ref, r.title, c.name, c.client ? 'Client' : 'Prospect', r.loc, r.fit, r.status, r.seen != null ? pragueDay(r.seen) : '', r.url]; }));
    const csv = '﻿' + rows.map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
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
    state.scanRun = { i: 0, done: false, secs: 0 };
    const t0 = Date.now();
    render();
    const tick = setInterval(() => {
      state.scanRun.i += 1;
      if (state.scanRun.i >= n) {
        clearInterval(tick);
        state.companies.forEach((c) => { c.scannedNow = true; if (c.scan === 'queued') c.scan = 'idle'; });
        state.scanned = true;
        state.scanRun = { i: n, done: true, secs: Math.max(3, Math.round((Date.now() - t0) / 1000)) };
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
      toast(t('sc_one_none', { co: c.name, n: c.active }));
      render();
    }, 1100);
  }
  const closeDrawers = () => { state.panel = null; state.rec = null; };

  function onClick(e) {
    const el = e.target.closest('[data-a]');
    if (!el || !root.contains(el)) return;
    const a = el.getAttribute('data-a');
    const v = el.getAttribute('data-v');
    if (a === 'drawer-bg') { if (e.target.closest('[data-stop]')) return; closeDrawers(); render(); return; }
    if (el.tagName === 'A') return;
    if (el.tagName === 'SELECT' || e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') return;
    e.preventDefault();
    e.stopPropagation();
    switch (a) {
      case 'star': { const r = roleOf(Number(v)); r.starred = !r.starred; toast(t(r.starred ? 'toast_star' : 'toast_unstar')); render(); break; }
      case 'go': go(v); break;
      case 'role': state.rec = null; openRole(Number(v)); break;
      case 'rec': openRec(v); break;
      case 'drawer-close': closeDrawers(); render(); break;
      case 'ptab': state.panelTab = v; render(); break;
      case 'rtab': state.recTab = v; render(); break;
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
      case 'bd-company': Object.assign(state, { bdCompany: Number(v), bdTab: 'roles', bdQuick: '', bdQuery: '' }); go('bd'); break;
      case 'bd-company-clear': state.bdCompany = null; render(); break;
      case 'bd-clear': Object.assign(state, { bdQuick: '', bdSeg: 'all', bdFit: 'all', bdQuery: '', bdCompany: null }); render(); break;
      case 'bd-stale': Object.assign(state, { bdQuick: 'stale', bdSeg: 'all', bdFit: 'all', bdQuery: '', bdCompany: null, bdTab: 'roles', hawkOpen: false }); go('bd'); break;
      case 'export': exportCsv(); break;
      case 'make-job': makeJob(Number(v)); break;
      case 'open-job': openJob(Number(v)); break;
      case 'jobs-back': state.jobOpen = null; render(); break;
      case 'jobs-status': state.jobsStatus = v; render(); break;
      case 'advance': { const app = state.apps.find((x) => x.id === Number(v)); if (app) moveApp(app.id, FLOW[FLOW.indexOf(app.stage) + 1]); break; }
      case 'pipe-rejected': state.pipeRejected = !state.pipeRejected; render(); break;
      case 'co-scope': state.coScope = v; render(); break;
      case 'contact-hm': state.contactHm = !state.contactHm; render(); break;
      case 'pl-period': state.plPeriod = v; render(); break;
      case 'todo-mine': state.todoMine = v === '1'; render(); break;
      case 'todo-done': state.todoDone = !state.todoDone; render(); break;
      case 'task-done': { const x = state.tasks.find((k) => String(k.id) === v); if (x) { x.done = !x.done; render(); } break; }
      case 'sc-tab': state.scTab = v; if (state.screen !== 'scanner') state.screen = 'scanner'; render(); break;
      case 'sc-freq': state.scanFreq = Number(v); render(); break;
      case 'sc-all': startScanAll(); break;
      case 'sc-one': scanOne(Number(v)); break;
      case 'sc-view-new': Object.assign(state, { bdQuick: 'new', bdSeg: 'all', bdFit: 'all', bdQuery: '', bdCompany: null, bdTab: 'roles' }); go('bd'); break;
      case 'an-win': state.anWindow = Number(v); render(); break;
      case 'set-tab': state.setTab = v; render(); break;
      case 'mod':
        if (v === 'ats') state.atsOn = !state.atsOn;
        if (RECRUIT.includes(state.screen) && !state.atsOn) { state.screen = 'settings'; state.setTab = 'modules'; }
        render();
        break;
      case 'hawk': state.hawkOpen = true; closeDrawers(); render(); { const i = root.querySelector('[data-form="hawk"] input'); if (i) i.focus({ preventScroll: true }); } break;
      case 'hawk-close': state.hawkOpen = false; render(); break;
      case 'hq': {
        const label = { core: t('hq_core'), pipe: t('hq_pipe'), pitch: t('hq_pitch'), draft: t('hq_draft', { co: co(hawkAnchor().co).name }) }[v];
        askHawk(v, label);
        break;
      }
      case 'tour-hide': state.tourHidden = true; render(); break;
      default: break;
    }
  }
  function onInput(e) {
    const key = e.target.getAttribute('data-input');
    const fields = { 'home-q': 'homeQuery', 'bd-q': 'bdQuery', 'sc-q': 'scQuery', 'co-q': 'coQuery', 'cand-q': 'candQuery', 'contact-q': 'contactQuery' };
    if (!fields[key]) return;
    state[fields[key]] = e.target.value;
    render(true);
  }
  function onChange(e) {
    const key = e.target.getAttribute('data-input');
    if (key === 'stage') { moveApp(Number(e.target.getAttribute('data-v')), e.target.value); return; }
    if (key === 'pipe-job') { state.pipeJob = e.target.value; render(); return; }
    if (key !== 'status') return;
    const r = roleOf(state.panel);
    if (!r) return;
    r.status = e.target.value;
    r.history.push({ kind: 'status', to: r.status, by: t('you'), at: Date.now() });
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
    const note = String(data.get('note') || '').trim();
    if (kind === 'role-note') {
      const r = roleOf(state.panel);
      if (!note || !r) return;
      r.notes.push({ by: t('you'), at: Date.now(), text: note });
      r.history.push({ kind: 'note', at: Date.now() });
      render();
    } else if (kind === 'rec-note' || kind === 'job-note') {
      if (!note) return;
      const type = kind === 'job-note' ? 'job' : { cand: 'candidate', contact: 'contact', company: 'company' }[state.rec.type];
      const eid = kind === 'job-note' ? state.jobOpen : state.rec.id;
      state.notes.push({ type, eid, by: t('you'), kind: 'note', body: note, at: Date.now() });
      toast(t('toast_note'));
      render();
    } else if (kind === 'add-cand') {
      const cand = Number(data.get('cand'));
      if (cand) addToJob(state.jobOpen, cand);
    } else if (kind === 'cand-to-job') {
      const job = Number(data.get('job'));
      if (job && state.rec) addToJob(job, state.rec.id);
    } else if (kind === 'task') {
      const title = String(data.get('title') || '').trim();
      if (!title) return;
      state.tasks.unshift({ id: `new-${state.tasks.length}`, title, due: String(data.get('due') || ''), type: '', eid: null, for: 1, by: t('you'), done: false });
      toast(t('toast_task'));
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
      state.companies.push({ id: -(state.companies.length + 1), name, domain: host, careers: 'https://' + clean, ats, hq: '', client: false, active: 0, scan: 'queued' });
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
      else if (state.panel || state.rec) { closeDrawers(); render(); }
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
    load();
  }

  window.TRSandbox = {
    go(screen) { if (state.loaded) go(screen); else state.screen = screen; },
    openRole(id) { if (state.loaded) openRole(id); },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
