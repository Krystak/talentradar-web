#!/usr/bin/env node
/**
 * Derives src/data/demo-stats.json, the few numbers of the public demo the site
 * shows (proof strip), from a saved copy of the demo feed (/api/sandbox), so the
 * ~1.7 MB feed itself never goes into the repo. Rules as in the data inventory
 * (docs/strategie/2026-10-31_web-redesign-inventura-dat.md, IDs 11, 13, 17):
 *
 *   companies       ID 11: companies in the feed
 *   open_positions  open roles in the feed's list (1 382 on 31. 10.), the same base
 *                   as charts 2 and 3, so every number on the page adds up
 *                   (767 + 343 + 272 in chart 3 = the proof strip). totals.open
 *                   (1 444) is higher because the list misses the newest ~62 roles
 *                   (B.L.1); the smaller number is the conservative one (lead,
 *                   etapa 2 kolo 1: a visitor who adds up the chart must get it).
 *                   totals.open stays in the file as totals_open, unused.
 *   companies_new_7d ID 17: companies with a role first seen in the 7 days
 *                   before the scan, a company's first day under watch left out
 *                   (B.L.5: a lower bound, the feed misses the newest roles)
 *
 * A company's first day under watch = the calendar day (UTC, the date part of
 * `seen`) of the earliest `seen` among all its roles in the feed, open and
 * archived. Roles first seen that day are what the first scan found already
 * posted, not new hiring, so they don't count. The feed has no "added on" date
 * per company, which is why this differs by one from the inventory's 57
 * (analyza_zivy.py); the site shows only "more than half" (lead, 31. 10.).
 *
 * usage: node tools/demo-stats.mjs <feed.json>   (writes src/data/demo-stats.json)
 */
import { readFileSync, writeFileSync } from "node:fs";

export function demoStats(feed) {
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
    _source: "tools/demo-stats.mjs from a saved /api/sandbox feed; rules: data inventory IDs 11, 13, 17",
    as_of: day(feed.generated_at),
    scan_at: feed.scan.at,
    companies: (feed.companies || []).length,
    open_positions: (feed.roles || []).length,
    feed_roles: (feed.roles || []).length,
    totals_open: feed.totals.open,
    companies_new_7d: fresh.size,
  };
}

if (process.argv[1] && process.argv[1].endsWith("demo-stats.mjs")) {
  const feed = JSON.parse(readFileSync(process.argv[2], "utf8"));
  const stats = demoStats(feed);
  writeFileSync(new URL("../src/data/demo-stats.json", import.meta.url), `${JSON.stringify(stats, null, 2)}\n`);
  console.log(stats);
}
