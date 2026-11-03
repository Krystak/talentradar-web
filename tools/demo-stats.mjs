#!/usr/bin/env node
/**
 * Derives the demo's numbers on the site (src/data/demo-stats.json: the proof strip) and the three
 * charts on the home page (src/data/charts/) from one moment of the public demo: a saved copy of the
 * feed (/api/sandbox, ~1.7 MB, never in the repo) and the HAR of a video take, so the page and the
 * clip under which it stands say the same. Rules as in the data inventory
 * (docs/strategie/2026-10-31_web-redesign-inventura-dat.md, IDs 11, 12, 14, 15, 17):
 *
 *   companies        ID 11: companies in the feed, the ones the radar watches
 *   companies_open   those with an open role (the app's pipeline.companies, 99 on 3. 11.)
 *   open_positions   the app's active roles (facets.active_total, 1 438 on 3. 11.): the first number
 *                    in the clip, and the base of chart 3 too, so a visitor who adds it up gets the
 *                    strip's number (lead, 3. 11.). The feed cannot give it: totals.open (1 394)
 *                    leaves out the roles outside the agency's niche, its list (1 333) also the
 *                    newest ones (B.L.1). Both stay in the file, unused.
 *   companies_new_7d ID 17: companies with a role first seen in the 7 days before the scan, a
 *                    company's first day under watch left out (B.L.5: a lower bound, the feed
 *                    misses the newest roles)
 *
 * Chart 1: daily_new from 26. 10. (all 100 companies under watch) up to the day before the data's
 * day, which has only had its morning scan (lead, 3. 11.); what a company's first day found stays
 * left out as it was worked out at the time, the feed no longer shows it.
 * Chart 2: the roles in the feed's list that have a posting date, age at the scan (core/role_age.py);
 * 45+ is every band from 45 days, 366+ included (lead, 31. 10.; the app stops at 365).
 * Chart 3: companies by companies[].ats, roles by facets.companies of the app.
 * pozice-podle-odvetvi is not on the site and is left alone.
 *
 * A company's first day under watch = the calendar day (UTC, the date part of `seen`) of the
 * earliest `seen` among all its roles in the feed, open and archived. Roles first seen that day
 * are what the first scan found already posted, not new hiring.
 *
 * Feed and HAR must come from the same scan, or nothing is written: the feed is replaced by every
 * scan, so it is saved right after the take, before the next one.
 *
 * usage: node tools/demo-stats.mjs <feed.json> <take.har>   (writes src/data/demo-stats.json and the charts)
 */
import { readFileSync, writeFileSync } from "node:fs";

/** What the feed cannot say, from the app's own answers in a take's HAR. Throws when they do not add up. */
export function appFromHar(har) {
  const answer = (test) => {
    for (const e of har.log.entries) {
      const body = e.response && e.response.content && e.response.content.text;
      if (body && e.response.status === 200 && test(e.request.url)) return JSON.parse(body);
    }
    throw new Error("the HAR has no answer from the app with these numbers");
  };
  const roles = answer((u) => /\/api\/bdm\/roles\?/.test(u) && /[?&]fit=active\b/.test(u) && /[?&]segment=all\b/.test(u));
  const home = answer((u) => /\/api\/home\b/.test(u));
  const { active_total: active, companies } = roles.facets;
  const sum = companies.reduce((a, c) => a + c.count, 0);
  if (sum !== active) throw new Error(`the app's companies add up to ${sum}, its active roles are ${active}`);
  return { scan_at: home.last_scan.at, active_total: active, companies_open: home.pipeline.companies, by_company: Object.fromEntries(companies.map((c) => [c.name, c.count])) };
}

export function demoStats(feed, app) {
  if (feed.scan.at !== app.scan_at) throw new Error(`the feed is from the scan of ${feed.scan.at}, the take from ${app.scan_at}: save the feed right after the take`);
  const scanAt = Date.parse(feed.scan.at);
  const day = (iso) => String(iso).slice(0, 10);
  const firstDay = new Map();
  for (const r of [...(feed.roles || []), ...(feed.archived || [])]) {
    if (!r.seen) continue;
    const d = day(r.seen);
    if (!firstDay.has(r.co) || d < firstDay.get(r.co)) firstDay.set(r.co, d);
  }
  const fresh = new Set();
  for (const r of feed.roles || []) {
    const seen = Date.parse(r.seen || "");
    if (Number.isNaN(seen) || scanAt - seen > 7 * 86400000) continue;
    if (day(r.seen) === firstDay.get(r.co)) continue;
    fresh.add(r.co);
  }
  return {
    _source: "tools/demo-stats.mjs from a saved /api/sandbox feed and the HAR of a take, one scan; rules: data inventory IDs 11, 13, 17",
    as_of: day(feed.generated_at),
    scan_at: feed.scan.at,
    companies: (feed.companies || []).length,
    companies_open: app.companies_open,
    open_positions: app.active_total,
    feed_roles: (feed.roles || []).length,
    totals_open: feed.totals.open,
    companies_new_7d: fresh.size,
  };
}

const CS_DATE = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${d}. ${m}. ${y}`; };
const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EN_DATE = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${EN_MONTHS[m - 1]} ${y}`; };
const CHART1_FROM = "2026-10-26";
const BANDS = [[0, 6], [7, 13], [14, 29], [30, 44], [45, 89], [90, 179], [180, 365], [366, Infinity]];

/** The three charts from the same moment as the numbers. old: today's files, for what the feed does not say and what stays (titles, units). */
export function chartsFrom(feed, app, old) {
  const asOf = feed.generated_at.slice(0, 10);
  const scanAt = Date.parse(feed.scan.at);
  const dated = (chart) => ({
    ...chart,
    as_of: asOf,
    source_cs: chart.source_cs.replace(/stav k .*\.$/, `stav k ${CS_DATE(asOf)}.`),
    source_en: chart.source_en.replace(/as of .*\.$/, `as of ${EN_DATE(asOf)}.`),
  });

  const leftOut = new Map(old["nove-pozice-po-dnech"].rows.map((r) => [r.date, r.left_out_first_scan]));
  const days = Object.keys(feed.daily_new).filter((d) => d >= CHART1_FROM && d < asOf).sort();
  const daily = days.map((date) => ({ date, new_roles: feed.daily_new[date] - (leftOut.get(date) || 0), all_found: feed.daily_new[date], left_out_first_scan: leftOut.get(date) || 0 }));
  const avg = Math.round(daily.reduce((a, r) => a + r.new_roles, 0) / daily.length);
  const least = daily.reduce((a, r) => (r.new_roles < a.new_roles ? r : a));
  const most = daily.reduce((a, r) => (r.new_roles > a.new_roles ? r : a));
  const short = (fmt, iso) => fmt(iso).replace(/ \d{4}$/, "");

  const withDate = feed.roles.filter((r) => r.posted);
  const age = (r) => Math.max(0, Math.floor((scanAt - Date.parse(r.posted.length <= 10 ? `${r.posted}T00:00:00Z` : r.posted)) / 86400000));
  const bands = BANDS.map(([lo, hi]) => ({
    days: hi === Infinity ? `${lo}+` : `${lo}–${hi}`,
    roles: withDate.filter((r) => lo <= age(r) && age(r) <= hi).length,
    highlight: lo >= 45,
  }));
  const over45 = bands.filter((b) => b.highlight).reduce((a, b) => a + b.roles, 0);
  const share = Math.round((over45 / withDate.length) * 100);

  const groupOf = (ats) => ({ "Jobs.cz": "Jobs.cz / Teamio", "Kariérní web": "Own careers site" })[ats] || "Company ATS";
  const sources = old["zdroje-pozic"].rows.map((row) => {
    const own = feed.companies.filter((c) => groupOf(c.ats) === row.group_en);
    return { ...row, companies: own.length, roles: own.reduce((a, c) => a + (app.by_company[c.name] || 0), 0), sources: [...new Set(own.map((c) => c.ats))].sort() };
  });
  const count = (group) => sources.find((r) => r.group_en === group).companies;
  const total = feed.companies.length;

  return {
    "nove-pozice-po-dnech": {
      ...dated(old["nove-pozice-po-dnech"]),
      rows: daily,
      alt_cs: `Za ${daily.length} dní od ${short(CS_DATE, days[0])} do ${short(CS_DATE, days[days.length - 1])} radar u ${total} českých firem našel v průměru ${avg} nových pozic denně, od ${least.new_roles} (${short(CS_DATE, least.date)}) do ${most.new_roles} (${short(CS_DATE, most.date)}).`,
      alt_en: `Over the ${daily.length} days from ${short(EN_DATE, days[0])} to ${short(EN_DATE, days[days.length - 1])} the radar found on average ${avg} new roles a day at ${total} Czech companies, from ${least.new_roles} (${short(EN_DATE, least.date)}) to ${most.new_roles} (${short(EN_DATE, most.date)}).`,
      method: `daily_new z /api/sandbox za dny od 26. 10. do dne před stavem dat (ten má jen ranní sken), bez pozic prvního dne hlídání firmy (26. 10.: 8). tools/demo-stats.mjs.`,
    },
    "stari-pozic": {
      ...dated(old["stari-pozic"]),
      rows: bands,
      note_cs: `Jen pozice, u kterých ATS firmy uvádí datum zveřejnění: ${withDate.length} z ${feed.roles.length} otevřených pozic ve feedu. Stáří se počítá od data zveřejnění ke skenu ${CS_DATE(asOf)}. Do pozic otevřených 45 a víc dní patří i ty nad 365 dní.`,
      note_en: `Only roles whose company ATS gives a posting date: ${withDate.length} of ${feed.roles.length} open roles in the feed. Age runs from the posting date to the scan on ${EN_DATE(asOf)}. Roles open 45 days or more include those over 365 days.`,
      alt_cs: `Z ${withDate.length} pozic s datem zveřejnění je ${over45} (${share} %) otevřených 45 a více dní.`,
      alt_en: `Of ${withDate.length} roles with a posting date, ${over45} (${share}%) have been open for 45 days or more.`,
      method: "core/role_age.py: stáří od posted_at. Na webu 45+ = všechna pásma od 45 dní včetně 366+ (lead 31. 10.; aplikace v counts_as_open_long(45) bere jen 45–365 dní). tools/demo-stats.mjs.",
    },
    "zdroje-pozic": {
      ...dated(old["zdroje-pozic"]),
      rows: sources,
      note_cs: "Skupina „ATS firmy“: Greenhouse, Workday, Ashby, Oracle Recruiting, Recruitee, Lever, SuccessFactors, Phenom, Eightfold. Pozice = všechny aktivní pozice v aplikaci dema, i mimo zaměření agentury.",
      note_en: "“Company ATS”: Greenhouse, Workday, Ashby, Oracle Recruiting, Recruitee, Lever, SuccessFactors, Phenom, Eightfold. Roles = all active roles in the demo app, including those outside the agency’s niche.",
      alt_cs: `${count("Jobs.cz / Teamio")} ze ${total} firem dema čteme z Jobs.cz a Teamia, ${count("Own careers site")} z vlastního kariérního webu a ${count("Company ATS")} z ATS firmy.`,
      alt_en: `For ${count("Jobs.cz / Teamio")} of the demo’s ${total} companies we read Jobs.cz and Teamio, for ${count("Own careers site")} their own careers site and for ${count("Company ATS")} the company’s ATS.`,
      method: "firmy: companies[].ats z /api/sandbox; pozice: facets.companies z /api/bdm/roles (HAR záběru), součet = facets.active_total. tools/demo-stats.mjs.",
    },
  };
}

if (process.argv[1] && process.argv[1].endsWith("demo-stats.mjs")) {
  const read = (path) => JSON.parse(readFileSync(path, "utf8"));
  if (process.argv.length !== 4) {
    console.error("usage: node tools/demo-stats.mjs <feed.json> <take.har>");
    process.exit(2);
  }
  const feed = read(process.argv[2]);
  const app = appFromHar(read(process.argv[3]));
  const stats = demoStats(feed, app);
  const chart = (id) => new URL(`../src/data/charts/${id}.json`, import.meta.url);
  const ids = ["nove-pozice-po-dnech", "stari-pozic", "zdroje-pozic"];
  const charts = chartsFrom(feed, app, Object.fromEntries(ids.map((id) => [id, read(chart(id))])));
  writeFileSync(new URL("../src/data/demo-stats.json", import.meta.url), `${JSON.stringify(stats, null, 2)}\n`);
  for (const id of ids) writeFileSync(chart(id), `${JSON.stringify(charts[id], null, 1)}\n`);
  console.log(stats);
}
