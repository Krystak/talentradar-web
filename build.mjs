#!/usr/bin/env node
/**
 * Builds the static site in public/ from src/: one layout, page templates and two
 * dictionaries (cs, en), so every page exists in both languages as real HTML that
 * a search engine reads without JavaScript. Node built-ins only, no dependencies.
 *
 *   node build.mjs           write public/ (and worker-routes.gen.js)
 *   node build.mjs --check   build in memory and compare; exit 1 when public/ is stale
 *
 * Template syntax (src/layouts, src/pages, src/partials, src/content, src/blog):
 *   {{t.key}}          text from src/i18n/<lang>.json, escaped; a key ending in _html is inserted as HTML
 *   {{> name}}         src/partials/name.html
 *   {{url:page}}       the page's address in the page's language (page ids in src/pages.json,
 *                      articles are post:<id>); {{url:page@en}} in another language
 *   {{icon:name}}      a Material Symbols icon from src/icons/name.svg (sprite on the page)
 *   {{chart:id}}       a chart from src/data/charts/id.json, inline SVG + data table
 *   {{price:tier}}     monthly list price in the page's currency; {{price:tier:year}}, {{price:tier:year_list}}
 *   {{asset:path}}     /path?v=<content hash> for CSS and JS
 *   {{content:name}}   src/content/name.<lang>.html
 *   {{blog:list}}      article list; {{blog:latest}} the three newest
 *   {{config.key}}     a value from src/site.config.json
 *   {{page.key}}       values the build works out per page (lang, title, canonical ...)
 * An unknown token fails the build, so a typo never reaches the site.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { clipIn } from "./tools/check-site.mjs";

export const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "src");
const MANIFEST = "build-manifest.json";

const read = (p) => readFileSync(join(SRC, p), "utf8").replace(/\r\n/g, "\n");
const readJson = (p) => JSON.parse(read(p));
const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 10);

export function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Inputs ──────────────────────────────────────────────────────────────────

/** Everything the build reads from src/, with optional config overrides (tests). */
export function loadSite(overrides = {}) {
  const config = { ...readJson("site.config.json"), ...overrides };
  if (!config.langs.includes(config.defaultLang)) throw new Error(`defaultLang ${config.defaultLang} is not one of ${config.langs}`);
  const i18n = Object.fromEntries(config.langs.map((l) => [l, readJson(`i18n/${l}.json`)]));
  checkKeys(i18n);

  const pages = readJson("pages.json");
  const posts = {};
  for (const file of readdirSync(join(SRC, "blog")).sort()) {
    const m = file.match(/^([a-z0-9-]+)\.([a-z]{2})\.html$/);
    if (!m) continue;
    const [, id, lang] = m;
    const raw = read(`blog/${file}`);
    const meta = raw.match(/^<!--meta\s*([\s\S]*?)-->\n/);
    if (!meta) throw new Error(`src/blog/${file}: no <!--meta {...} --> header`);
    posts[id] = posts[id] || { id, lang: {} };
    posts[id].lang[lang] = { ...JSON.parse(meta[1]), body: raw.slice(meta[0].length) };
  }
  for (const post of Object.values(posts)) {
    for (const l of config.langs) if (!post.lang[l]) throw new Error(`Article ${post.id} has no ${l} version`);
  }

  const charts = {};
  for (const file of readdirSync(join(SRC, "data/charts")).sort()) {
    if (file.endsWith(".json")) charts[file.slice(0, -5)] = readJson(`data/charts/${file}`);
  }
  const icons = {};
  for (const file of readdirSync(join(SRC, "icons")).sort()) {
    if (file.endsWith(".svg")) icons[file.slice(0, -4)] = read(`icons/${file}`);
  }
  const templates = {};
  for (const dir of ["layouts", "pages", "partials"]) {
    for (const file of readdirSync(join(SRC, dir)).sort()) {
      if (file.endsWith(".html")) templates[`${dir}/${file.slice(0, -5)}`] = read(`${dir}/${file}`);
    }
  }
  const content = {};
  for (const file of readdirSync(join(SRC, "content")).sort()) {
    if (file.endsWith(".html")) content[file.slice(0, -5)] = read(`content/${file}`);
  }
  const css = ["tokens.css", "base.css", "components.css"].map((f) => `/* ── src/css/${f} ── */\n${read(`css/${f}`)}`).join("\n");
  const js = {};
  for (const file of readdirSync(join(SRC, "js")).sort()) {
    if (file.endsWith(".js")) js[file] = read(`js/${file}`);
  }
  return {
    config, i18n, pages, posts, charts, icons, templates, content, css, js,
    plans: readJson("data/plans.json"),
    demoStats: readJson("data/demo-stats.json"),
    media: readJson("data/media.json"),
    headers: read("_headers"),
  };
}

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, `${prefix}${k}.`, out);
    else out[`${prefix}${k}`] = v;
  }
  return out;
}

export function checkKeys(i18n) {
  const langs = Object.keys(i18n);
  const sets = langs.map((l) => new Set(Object.keys(flatten(i18n[l]))));
  for (let i = 0; i < langs.length; i++) {
    for (const key of sets[i]) {
      for (let j = 0; j < langs.length; j++) {
        if (!sets[j].has(key)) throw new Error(`i18n key ${key} is in ${langs[i]}.json but not in ${langs[j]}.json`);
      }
    }
  }
}

// ── Addresses ───────────────────────────────────────────────────────────────

/** The address prefix of a language: "/" for the default one, "/en/" for the other. */
export function langRoot(config, lang) {
  return lang === config.defaultLang ? "/" : `/${lang}/`;
}

/**
 * All pages of the site: { key, id, lang, path (URL), file (under public/), template, post? }.
 * The path is the final address, the one that answers 200 without a redirect
 * (html_handling auto-trailing-slash: "x.html" is served at /x, "x/index.html" at /x/).
 */
export function routes(site) {
  const { config, pages, posts } = site;
  const out = [];
  const add = (id, lang, slug, extra) => {
    const root = langRoot(config, lang);
    const path = `${root}${slug}`;
    const file = (root.slice(1) + (slug === "" || slug.endsWith("/") ? `${slug}index.html` : `${slug}.html`));
    out.push({ key: `${id}@${lang}`, id, lang, path, file, ...extra });
  };
  for (const [id, page] of Object.entries(pages)) {
    for (const lang of config.langs) add(id, lang, page.path[lang], { template: page.template, noindex: !!page.noindex });
  }
  for (const post of Object.values(posts)) {
    for (const lang of config.langs) add(`post:${post.id}`, lang, `blog/${post.lang[lang].slug}`, { template: "article", post: post.lang[lang] });
  }
  const seen = new Set();
  for (const r of out) {
    if (seen.has(r.path)) throw new Error(`Two pages at ${r.path}`);
    seen.add(r.path);
  }
  return out;
}

/**
 * Old addresses of the site before November 2026 (English at /, Czech at /cs,
 * articles at /blog/<slug>.html and /blog/<slug>-cs.html) to their pages now.
 * An old address that is a page again is left out, so the map never loops.
 */
export function legacyRedirects(site, all = routes(site)) {
  const { config, posts } = site;
  const def = config.defaultLang;
  const url = (id, lang) => all.find((r) => r.id === id && r.lang === lang).path;
  const map = {
    "/cs": url("home", "cs"),
    "/cs/": url("home", "cs"),
    "/index.html": url("home", def),
    "/blog/index.html": url("blog", def),
    // gdpr.html was English by default, and the app lists it as the privacy
    // policy for connector directories (frontend/src/AiApps.tsx): English stays.
    "/gdpr.html": url("gdpr", "en"),
  };
  const legacyPostIds = ["anatomy-of-stale-roles", "hidden-cost-of-dead-vacancies", "the-4-day-latency-gap"];
  for (const id of legacyPostIds) {
    if (!posts[id]) continue;
    for (const suffix of ["", ".html"]) {
      map[`/blog/${id}${suffix}`] = url(`post:${id}`, "en");
      map[`/blog/${id}-cs${suffix}`] = url(`post:${id}`, "cs");
    }
  }
  const live = new Set(all.map((r) => r.path));
  return Object.fromEntries(Object.entries(map).filter(([from, to]) => from !== to && !live.has(from)).sort(([a], [b]) => a.localeCompare(b)));
}

// ── Rendering ───────────────────────────────────────────────────────────────

function lookup(dict, key) {
  const v = key.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), dict);
  return typeof v === "string" ? v : undefined;
}

const NUMBER = {
  cs: (n) => n.toLocaleString("cs-CZ").replace(/\s/g, " "),
  en: (n) => n.toLocaleString("en-GB"),
};
const MONEY = {
  CZK: { cs: (n) => `${NUMBER.cs(n)} Kč`, en: (n) => `CZK ${NUMBER.en(n)}` },
  EUR: { cs: (n) => `${NUMBER.cs(n)} €`, en: (n) => `€${NUMBER.en(n)}` },
};

/** A tier's price in a page's currency: monthly, "year" (10 months) or "year_list" (12). */
export function price(site, lang, tierId, kind) {
  const tier = site.plans.tiers.find((t) => t.id === tierId);
  if (!tier) throw new Error(`Unknown tier ${tierId}`);
  const currency = site.plans.currency[lang];
  const monthly = tier.price[currency];
  const amount = kind === "year" ? monthly * site.plans.yearly_paid_months : kind === "year_list" ? monthly * 12 : monthly;
  return MONEY[currency][lang](amount);
}

/** Dates as the text map writes them: CS "31. 10. 2026", EN "31 Oct 2026" (year optional). */
export function formatDate(iso, lang, withYear = true) {
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  if (lang === "cs") return `${d}. ${m}.${withYear ? ` ${y}` : ""}`;
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
  return `${d} ${mon}${withYear ? ` ${y}` : ""}`;
}

/**
 * The {variables} of the text map for one language (text map chapter 0.1):
 * demo.* from src/data/demo-stats.json, c1/c2/c3 from the chart JSONs.
 * Numbers and dates are already formatted for the language.
 */
export function siteVars(site, lang) {
  const n = NUMBER[lang];
  const d = (iso, year) => formatDate(iso, lang, year);
  const vars = {};
  const daily = site.charts["nove-pozice-po-dnech"];
  if (daily) {
    const rows = daily.rows;
    const sum = rows.reduce((a, r) => a + r.new_roles, 0);
    const min = rows.reduce((a, r) => (r.new_roles < a.new_roles ? r : a));
    const max = rows.reduce((a, r) => (r.new_roles > a.new_roles ? r : a));
    Object.assign(vars, {
      "c1.avg": n(Math.round(sum / rows.length)),
      "c1.min": n(min.new_roles),
      "c1.min_date": d(min.date, false),
      "c1.max": n(max.new_roles),
      "c1.max_date": d(max.date, false),
      "c1.from": d(rows[0].date, false),
      "c1.to": d(rows[rows.length - 1].date, false),
      "c1.days": n(rows.length),
    });
  }
  const age = site.charts["stari-pozic"];
  if (age) {
    const base = age.rows.reduce((a, r) => a + r.roles, 0);
    const n45 = age.rows.filter((r) => r.highlight).reduce((a, r) => a + r.roles, 0);
    Object.assign(vars, {
      "c2.base": n(base),
      "c2.n_45": n(n45),
      "c2.share_45": n(Math.round((n45 / base) * 100)),
    });
  }
  const sources = site.charts["zdroje-pozic"];
  if (sources) {
    for (const r of sources.rows) vars[`c3.${SOURCE_GROUP[r.group_en]}_companies`] = n(r.companies);
  }
  const s = site.demoStats;
  Object.assign(vars, {
    "demo.as_of": d(s.as_of, true),
    "demo.companies": n(s.companies),
    "demo.companies_open": n(s.companies_open),
    "demo.scan_time": new Date(s.scan_at).toLocaleTimeString("cs-CZ", { timeZone: "Europe/Prague", hour: "numeric", minute: "2-digit" }),
    "demo.open_positions": n(s.open_positions),
    "demo.avg_new_per_day": vars["c1.avg"],
    "demo.new_days": vars["c1.days"],
    "demo.companies_new_7d": n(s.companies_new_7d),
    // null until the media stream records the clips: sentences with it are left out
    "clip.date": site.media && site.media.clip_date ? d(site.media.clip_date, true) : null,
    // V6 is not retaken with the morning clips, so it keeps the date it was recorded on
    "clip.ats_date": site.media && site.media.clips && site.media.clips.ats && site.media.clips.ats.clip_date ? d(site.media.clips.ats.clip_date, true) : null,
  });
  // the hero is retaken a language and a screen at a time: each says the day it was recorded on, a clip without its own the set's
  const hero = site.media && site.media.clips && site.media.clips.hero && clipIn(site.media.clips.hero, lang);
  if (hero) {
    const day = (cut) => (cut.clip_date || site.media.clip_date ? d(cut.clip_date || site.media.clip_date, true) : null);
    vars["clip.hero_date"] = day(hero);
    vars["clip.hero_phone_date"] = day(hero.mobile || hero);
  }
  return vars;
}

const SOURCE_GROUP = { "Jobs.cz / Teamio": "jobscz", "Company ATS": "ats", "Own careers site": "web" };

/**
 * Fills {variables} into a text of the map. Places still waiting for Kryštof
 * ([Kryštof…]) and media values not there yet ({clip.date}) never reach the
 * page: the whole sentence that holds one is left out (lead, 31. 10. 2026).
 * Chapter times {t1}…{t5} without a value simply disappear. Any other unknown
 * variable fails the build.
 */
export function fillText(value, vars, where) {
  const HOLE = "\u0000";
  let s = value.replace(/\[Kryštof[^\]]*\]/g, HOLE);
  // {name} is a variable; {{…}} in a text is just text (render never reads it as a template)
  s = s.replace(/(?<!\{)\{([a-z0-9_.]+)\}(?!\})/gi, (all, name) => {
    if (vars[name] !== undefined && vars[name] !== null) return String(vars[name]);
    if (/^t\d$/.test(name)) return "";
    if (/^clip\./.test(name)) return HOLE;
    throw new Error(`${where}: unknown variable {${name}}`);
  });
  if (!s.includes(HOLE)) return s.trim();
  return s
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !sentence.includes(HOLE))
    .join(" ")
    .trim();
}

/**
 * Czech typography (lead, etapa 4a): a one-letter preposition or conjunction
 * (v, k, s, z, o, u, a, i) never ends a line, so the space after it is a
 * no-break space. "a v Praze" gets both.
 */
const CS_SINGLE = /(?<=^|[\s(„"\u00a0])([vkszouiaVKSZOUIA]) (?=\S)/gu;
export function nbspCs(str) {
  return str.replace(CS_SINGLE, "$1\u00a0");
}

/** Elements whose content is never prose (an SVG title and desc are names, read aloud): their text keeps its plain spaces. */
const RAW_ELEMENTS = /^(code|pre|script|style|textarea|title|desc)$/i;

/** Elements that sit inside a line of text: a one-letter word before one binds to it ("v <a>zásadách</a>"). */
const INLINE_ELEMENTS = /^(a|abbr|b|code|em|i|kbd|mark|q|s|small|span|strong|sub|sup|time|u)$/i;

/**
 * nbspCs over the text nodes of an HTML fragment only: never inside a tag
 * (attributes, URLs), a comment, or code, pre, script, style, textarea, title,
 * desc. The build runs it over the <body> of every Czech page (buildSite), so
 * texts of the map, templates, articles and the GDPR text all get it, while
 * <title>, meta, JSON-LD and every attribute (aria-label, data-label…) keep
 * plain spaces (lead, etapa 4a kolo 2).
 */
export function nbspCsHtml(html) {
  const parts = html.split(/(<!--[\s\S]*?-->|<(?:[^>"']|"[^"]*"|'[^']*')*>)/);
  let raw = null; // the raw element we are inside, if any
  return parts
    .map((part, i) => {
      if (part.startsWith("<!--")) return part;
      const tag = part.match(/^<(\/?)([a-z][a-z0-9-]*)/i);
      if (tag) {
        const [, close, name] = tag;
        if (!close && !raw && RAW_ELEMENTS.test(name) && !part.endsWith("/>")) raw = name.toLowerCase();
        else if (close && raw === name.toLowerCase()) raw = null;
        return part;
      }
      if (raw) return part;
      let out = nbspCs(part);
      // the text ends on "v " and an inline element follows: the line may not break there either
      const next = (parts[i + 1] || "").match(/^<([a-z][a-z0-9-]*)/i);
      if (next && INLINE_ELEMENTS.test(next[1])) out = out.replace(/(?<=^|[\s(„" ])([vkszouiaVKSZOUIA]) $/u, "$1 ");
      return out;
    })
    .join("");
}

/** A text of the map for this page, variables filled in (not escaped). */
function text(site, ctx, key, local = {}) {
  const raw = lookup(site.i18n[ctx.lang], key);
  if (raw === undefined) throw new Error(`${ctx.where} [${ctx.lang}]: unknown i18n key ${key}`);
  // "3 400" never breaks between its digits (Czech thousands separator), nor "5 MB", "1 990 Kč", "24 %" before the unit
  const out = fillText(raw, { ...ctx.vars, ...local }, `${ctx.where} [${ctx.lang}] ${key}`)
    .replace(/(\d) (\d{3})(?!\d)/g, "$1\u00a0$2")
    .replace(/(\d) (MB|kB|Kč|€|%|min)(?![\p{L}])/gu, "$1\u00a0$2");
  // (no Czech no-break spaces here: a text may end up in an attribute; the page pass adds them to text nodes only)
  return out;
}

/** A text going into a URL (an e-mail subject): plain spaces, the no-break ones are for the page only. */
const plainSpaces = (str) => str.replace(/[ ]/g, " ");

/** Where the "book a demo" buttons go: config.callUrl, or until it is set an e-mail with the call's subject. */
export function callHref(site, ctx) {
  const url = String(site.config.callUrl || "").trim();
  if (url) return url;
  return `mailto:${site.config.email}?subject=${encodeURIComponent(plainSpaces(text(site, ctx, "story_cta_subject")))}`;
}

/** The operator line (name, company ID, address): only the items filled in site.config.json, nothing while all are empty. */
function operatorLine(site, ctx, cls) {
  const op = site.config.operator || {};
  const items = [
    ["name", "operator_name_label"],
    ["id", "operator_id_label"],
    ["address", "operator_address_label"],
  ]
    .filter(([k]) => String(op[k] || "").trim())
    .map(([k, label]) => `<span>${escapeHtml(text(site, ctx, label))}: ${escapeHtml(String(op[k]).trim())}</span>`);
  return items.length ? `<p class="${cls}">${items.join(" · ")}</p>` : "";
}

function blogList(site, ctx, limit) {
  const posts = Object.values(site.posts)
    .map((p) => p.lang[ctx.lang])
    .sort((a, b) => b.published.localeCompare(a.published) || a.id.localeCompare(b.id))
    .slice(0, limit || undefined);
  const items = posts.map((p) => {
    const href = ctx.url(`post:${p.id}`);
    const meta = text(site, ctx, "blog_card_meta", { minutes: p.minutes, date: formatDate(p.published, ctx.lang, true) });
    return `<li class="post-card">
  <article>
    <h3 class="post-card__title"><a href="${href}">${escapeHtml(p.title)}</a></h3>
    <p class="post-card__meta">${escapeHtml(meta)}</p>
    ${limit ? "" : `<p class="post-card__desc">${escapeHtml(p.description)}</p>`}
  </article>
</li>`;
  });
  // the home page row (limit): title and meta only; the blog index adds the description
  return `<ul class="post-list${limit ? " post-list--compact" : ""}" role="list">\n${items.join("\n")}\n</ul>`;
}

/**
 * Renders a template string for one page: partials first, then every token in a
 * single pass. What a token puts in is final and never read as a template again,
 * so a text cannot smuggle in {{…}} and a literal "{{" in a text cannot break the
 * build. The only templates are our own files (src/layouts, pages, partials,
 * content, blog) and *_html texts, which are rendered explicitly where used.
 */
function render(site, tpl, ctx, where) {
  let out = tpl;
  for (let i = 0; i < 12 && /\{\{>/.test(out); i++) {
    out = out.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => {
      const p = site.templates[`partials/${name}`];
      if (p === undefined) throw new Error(`${where}: unknown partial ${name}`);
      return p;
    });
  }
  return out.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_, token) => resolve(site, token, ctx, where));
}

function resolve(site, token, ctx, where) {
  const fail = (msg) => {
    throw new Error(`${where} [${ctx.lang}]: ${msg} in {{${token}}}`);
  };
  if (token.startsWith("t.")) {
    const key = token.slice(2);
    if (lookup(site.i18n[ctx.lang], key) === undefined) fail("unknown i18n key");
    const v = text(site, ctx, key);
    // an *_html text is ours and may link ({{url:gdpr}}); any other text is plain
    return key.endsWith("_html") ? render(site, v, ctx, `${where} ${key}`) : escapeHtml(v);
  }
  if (token.startsWith("h1:")) {
    // two-line H1 of the map: the first sentence, then the rest in the accent
    const v = text(site, ctx, token.slice(3));
    const cut = v.search(/(?<=[.!?])\s/);
    if (cut < 0) return escapeHtml(v);
    return `<span class="h1-line">${escapeHtml(v.slice(0, cut))}</span> <span class="accent">${escapeHtml(v.slice(cut + 1))}</span>`;
  }
  if (token.startsWith("uri:")) return encodeURIComponent(plainSpaces(text(site, ctx, token.slice(4))));
  if (token === "call:href") return escapeHtml(callHref(site, ctx));
  if (token.startsWith("operator:")) return operatorLine(site, ctx, `operator operator--${token.slice(9)}`);
  if (token.startsWith("first:")) {
    // the first sentence of a text, the rest only from 768 px (a phone keeps the one line that says what it is)
    const v = text(site, ctx, token.slice(6));
    const cut = v.search(/(?<=[.!?])\s/);
    if (cut < 0) return escapeHtml(v);
    return `${escapeHtml(v.slice(0, cut))}<span class="d-only"> ${escapeHtml(v.slice(cut + 1))}</span>`;
  }
  if (token === "tour:chapters") return tourChapters(site, ctx);
  if (token.startsWith("list:")) {
    // a text of several sentences as a list with a check per sentence (hero_note, direction C 3.3)
    ctx.icons.add("check");
    // list items carry no closing full stop (lead, etapa 2 kolo 1); the text in the map keeps it
    return listItems(text(site, ctx, token.slice(5)))
      .map((s) => `<li><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-check"></use></svg><span>${escapeHtml(s)}</span></li>`)
      .join("");
  }
  if (token.startsWith("chapters:")) return chapters(site, ctx, token.slice(9), where);
  if (token.startsWith("video:")) {
    const [id, ariaKey, captionKey, others] = token.slice(6).split(":");
    return videoFigure(site, ctx, id, ariaKey, captionKey, where, others ? others.split(",") : []);
  }
  if (token.startsWith("media:")) {
    const [id, field] = token.slice(6).split(":");
    const clip = clipIn(site.media.clips[id] || fail("unknown clip"), ctx.lang);
    if (clip.off) fail("the clip is off in media.json");
    const lang = (p) => mediaUrl(site, p, ctx.lang);
    if (field === "json") {
      // a chapter tab's whole clip (all sources, the phone cut) for site.js (js/media.js clipFor)
      const cut = (c) => ({ poster: lang(c.poster), sources: c.sources.map((s) => ({ src: lang(s.src), type: s.type, ...(s.media ? { media: s.media } : {}) })) });
      return escapeHtml(JSON.stringify({ id, ...cut(clip), mobile: clip.mobile ? cut({ ...clip, ...clip.mobile }) : null }));
    }
    const v = field === "src" ? clip.sources[0].src : field === "poster" ? clip.poster : fail("unknown media field");
    return lang(v);
  }
  if (token.startsWith("url:")) {
    const [id, lang] = token.slice(4).split("@");
    return ctx.url(id, lang || ctx.lang) || fail("unknown page");
  }
  if (token.startsWith("icon:")) {
    const name = token.slice(5);
    if (!site.icons[name]) fail("unknown icon");
    ctx.icons.add(name);
    return `<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;
  }
  if (token.startsWith("chart:")) {
    const [id, variant] = token.slice(6).split(":");
    const chart = site.charts[id];
    if (!chart) fail("unknown chart");
    if (variant === "m") return renderPhoneChart(site, chart, ctx);
    if (variant) fail("unknown chart variant");
    return renderChart(site, chart, ctx);
  }
  if (token.startsWith("price:")) {
    const [tier, kind] = token.slice(6).split(":");
    return price(site, ctx.lang, tier, kind);
  }
  if (token.startsWith("asset:")) {
    const path = token.slice(6);
    const v = ctx.assetVersions[path];
    if (!v) fail("unknown asset");
    return `/${path}?v=${v}`;
  }
  if (token.startsWith("content:")) {
    const c = site.content[`${token.slice(8)}.${ctx.lang}`];
    if (c === undefined) fail("unknown content");
    return render(site, c, ctx, `${where} content`);
  }
  if (token === "blog:list") return blogList(site, ctx, 0);
  if (token === "blog:latest") return blogList(site, ctx, 3);
  if (token.startsWith("config.")) {
    const v = site.config[token.slice(7)];
    if (typeof v !== "string") fail("unknown config key");
    return escapeHtml(v);
  }
  if (token.startsWith("page.")) {
    const v = ctx.page[token.slice(5)];
    if (v === undefined) fail("unknown page value");
    return v;
  }
  return fail("unknown token");
}

/**
 * The brand name is two-tone in headings (h1–h4 and [data-brand]): "Talent" in
 * the text colour, "Radar…" in the accent, Czech forms included (TalentRadaru).
 * Only text between tags changes; attributes and running text stay plain.
 */
export function brandify(html) {
  // a tag, with ">" allowed inside quoted attribute values
  const TAG = String.raw`(?:[^>"']|"[^"]*"|'[^']*')*`;
  const word = (str) =>
    str.replace(/\b(Talent)(Radar[\p{L}]*)/gu, '<span class="brand"><span class="brand__a">$1</span><span class="brand__b">$2</span></span>');
  const inside = (chunk) => chunk.split(new RegExp(`(<${TAG}>)`)).map((part) => (part.startsWith("<") ? part : word(part))).join("");
  return html
    .replace(new RegExp(`<(h[1-4])\\b${TAG}>[\\s\\S]*?<\\/\\1>`, "g"), inside)
    .replace(new RegExp(`<([a-z0-9]+)\\b(?:[^>"']|"[^"]*"|'[^']*')*?\\sdata-brand(?=[\\s>=])${TAG}>[\\s\\S]*?<\\/\\1>`, "g"), inside);
}

/**
 * The address of a media file for one language. /video/* is cached for a year as
 * immutable and the clips keep their names when they are retaken, so the address
 * carries media.json's version (a hash of the set, written by tools/media-use.mjs).
 */
function mediaUrl(site, path, lang) {
  const p = path.replace("{lang}", lang);
  return site.media.version ? `${p}?v=${site.media.version}` : p;
}

/**
 * The hero's poster is what the first screen paints largest, and a poster is only
 * found once the video is laid out: without these two lines LCP on a phone was
 * ~0.9 s later (etapa 4, measured). One per cut, so only the poster of this screen gets
 * high priority. It does not keep the other one from loading: see videoFigure.
 */
function heroPosterPreloads(site, lang) {
  const clip = clipIn(site.media.clips.hero, lang);
  const link = (poster, media) => `<link rel="preload" as="image" href="${mediaUrl(site, poster, lang)}"${media ? ` media="${media}"` : ""} fetchpriority="high">`;
  if (!clip.mobile) return [link(clip.poster)];
  return [link(clip.mobile.poster, "(max-width: 767px)"), link(clip.poster, "(min-width: 768px)")];
}

/**
 * A clip of src/data/media.json: a window on a board (no board on a light band or a
 * phone), under the window a line that follows the clip (clips.*.cues: times there, words in
 * the text map) and the pause button. Every sentence is in the HTML in one and the same grid
 * cell, so the line is as high as its longest one at any width, and nothing moves when it
 * changes. others: the clips that may follow in this figure (the chapters' tabs).
 * Loops (hero, chapters, V6) are muted and lazy (preload none); the
 * tour plays only on a click. A clip with a 4:5 phone cut gets both videos, CSS
 * shows one, and only the shown one's files are ever loaded (site.js), its poster too:
 * it is the background of the screen (--poster), because a poster attribute under
 * display: none is still fetched (Chromium, 3. 11. 2026, / in CS: 220 of 504 kB at 390 px).
 * Works without the script; a poster of one clear pixel on a video is not verified on
 * an iPhone. On a phone only
 * the hero plays by itself; every other loop waits for a tap on its play
 * button (data-tap-phone, lead etapa 4a).
 */
const CLEAR_POSTER = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAIBAAA=";

function videoFigure(site, ctx, id, ariaKey, captionKey, where, others = []) {
  for (const clipId of [id, ...others]) {
    if (!site.media.clips[clipId]) throw new Error(`${where}: unknown clip ${clipId}`);
    if (site.media.clips[clipId].off) throw new Error(`${where}: clip ${clipId} is off in media.json`);
  }
  const clip = clipIn(site.media.clips[id], ctx.lang);
  // A clip without a phone cut in a figure whose other clips have one (V5, how0, for now): the phone's video plays
  // its wide cut, whole in the 4:5 window (video--phone-wide, components.css; site.js sets it for each chapter).
  const anyPhone = [id, ...others].some((clipId) => clipIn(site.media.clips[clipId], ctx.lang).mobile);
  const phone = clip.mobile ? { ...clip, ...clip.mobile } : anyPhone ? clip : null;
  const lang = (p) => mediaUrl(site, p, ctx.lang);
  const aria = escapeHtml(text(site, ctx, ariaKey));
  const loop = clip.mode === "loop";
  const video = (c, cls) => {
    const attrs = loop ? "muted loop playsinline controls" : "controls playsinline";
    const sources = c.sources.map((s) => `<source src="${lang(s.src)}" type="${escapeHtml(s.type)}"${s.media ? ` media="${escapeHtml(s.media)}"` : ""}>`).join("");
    const tracks = (c.tracks || [])
      .map((tr) => `<track kind="subtitles" srclang="${tr.srclang}" label="${escapeHtml(text(site, ctx, tr.label))}" src="${lang(tr.src)}"${tr.srclang === ctx.lang ? " default" : ""}>`)
      .join("");
    const play = !loop ? `<button class="video__play" type="button" hidden>${escapeHtml(text(site, ctx, "demo_play"))}</button>` : "";
    // a loop's poster is the background of its screen: a browser fetches the poster of a video under display: none, not the background of an element under it
    const paint = loop ? ` style="--poster:url(${lang(c.poster)})"` : "";
    // with controls and no poster at all Chromium paints the video grey over that background: a poster that shows nothing keeps it clear
    const poster = ` poster="${loop ? CLEAR_POSTER : lang(c.poster)}"`;
    return `<div class="frame__screen ${cls}"${paint}><video ${attrs} preload="none" width="${c.width || clip.width}" height="${c.height || clip.height}"${poster} aria-label="${aria}">${sources}${tracks}</video>${play}</div>`;
  };
  let toggle = "";
  if (loop) {
    ctx.icons.add("pause");
    toggle = `<button class="video__toggle" type="button" hidden><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-pause"></use></svg><span class="video__toggle-label">${escapeHtml(text(site, ctx, "hero_video_pause"))}</span></button>`;
  }
  const tap = loop && id !== "hero";
  const start = tap ? `\n    <button class="btn btn-secondary video__start" type="button" hidden>${escapeHtml(text(site, ctx, "hero_video_play"))}</button>` : "";
  const lines = [id, ...others].flatMap((clipId) => {
    if (!site.media.clips[clipId]) throw new Error(`${where}: unknown clip ${clipId}`);
    const of = clipIn(site.media.clips[clipId], ctx.lang);
    // at_mobile null: a line the phone cut does not have; at null: a line only the phone cut has (js/media.js cueNow).
    // Such a line takes no room on the other screen. m-first: the phone's first sentence, while the page's first is not for a phone
    const cues = of.cues || [];
    const phoneFirst = clipId === id && cues.length && cues[0].at_mobile === null ? cues.find((c) => c.at_mobile !== null) : null;
    return cues.map((cue) => {
      const only = cue.at_mobile === null ? " d-only" : cue.at === null ? " m-only" : "";
      const first = cue === phoneFirst ? " m-first" : "";
      const atMobile = cue.at_mobile === undefined ? "" : ` data-at-mobile="${cue.at_mobile === null ? "none" : cue.at_mobile}"`;
      return `<span class="video__cue-line${only}${first}" data-cues="${clipId}" data-at="${cue.at === null ? "none" : cue.at}"${atMobile}>${escapeHtml(text(site, ctx, cue.key))}</span>`;
    });
  });
  if (lines.length) lines[0] = lines[0].replace('class="video__cue-line', 'class="video__cue-line is-on');
  const foot = lines.length || toggle ? `\n    <div class="frame__foot"><p class="video__cue">${lines.join("")}</p>${toggle}</div>` : "";
  // {clip.date} under a video is the day that cut was recorded: its own clip_date, else the set's. Clips that share a figure
  // (the chapters) may differ, and then every sentence is in the HTML in one grid cell, as the line under the window:
  // one height, whichever is showing. The phone cut's date is its own too (its clip_date, not the wide cut's).
  const caption = (() => {
    if (!captionKey) return "";
    const said = (cut) => {
      const day = cut.clip_date || site.media.clip_date;
      return escapeHtml(text(site, ctx, captionKey, { "clip.date": day ? formatDate(day, ctx.lang, true) : null }));
    };
    const rows = [id, ...others].map((clipId) => {
      const of = clipIn(site.media.clips[clipId], ctx.lang);
      return { clipId, wide: said(of), phone: said(of.mobile || of) };
    });
    if (rows.every((r) => r.wide === rows[0].wide && r.phone === rows[0].wide)) return `\n  <figcaption>${rows[0].wide}</figcaption>`;
    const line = (r, i) => `<span class="video__caption-line${i ? "" : " is-on"}" data-cues="${r.clipId}">${r.wide === r.phone ? r.wide : `<span class="d-only">${r.wide}</span><span class="m-only">${r.phone}</span>`}</span>`;
    return `\n  <figcaption><span class="video__captions">${rows.map(line).join("")}</span></figcaption>`;
  })();
  return `<figure class="video video--${id}${phone ? " video--has-mobile" : ""}${phone === clip ? " video--phone-wide" : ""}" ${loop ? `data-autoplay${tap ? " data-tap-phone" : ""}` : "data-facade"}>
  <div class="frame">
    <div class="frame__window">
      ${video(clip, "video--desktop")}${phone ? `\n      ${video(phone, "video--mobile")}` : ""}${start}
    </div>${foot}
  </div>${caption}
</figure>`;
}

/**
 * The chapters over the "How it works" video (home.html). {{chapters:tabs:how0,how1,…}} are the tabs, then
 * {{chapters:video:<caption key>}} is the one figure and {{chapters:panels}} the texts, both of the clips the tabs
 * listed. A clip with off: true in media.json (or none there) is left out (how0, chapter 1, keeps the switch for a
 * release without it; how1, "Ráno", is gone for good since 12. 11. 2026: no row, not in the tabs). The first clip left is the one in the HTML and its tab the selected
 * one; the others load only on a click (site.js). Clip howN takes its words from how_chN_* and how_clipN_alt and
 * its ids are tab-N and chapter-N; how_chN_body_m (the phone's text) and how_chN_rule (a note) when the map has them.
 * Four tabs are chapters--4 (components.css: four in a row, 2 × 2 on a narrow screen).
 */
function chapters(site, ctx, token, where) {
  const fail = (msg) => {
    throw new Error(`${where} [${ctx.lang}]: ${msg} in {{chapters:${token}}}`);
  };
  const t = (key) => resolve(site, `t.${key}`, ctx, where);
  const [part, list] = token.split(":");
  if (part === "tabs") {
    const ids = list ? list.split(",") : fail("no clips");
    for (const id of ids) if (!/^how\d$/.test(id)) fail(`${id} is not a chapter clip (howN)`);
    // a chapter media.json does not have is off as well (a set from before V5)
    ctx.chapters = ids.filter((id) => site.media.clips[id] && !site.media.clips[id].off);
    if (!ctx.chapters.length) fail("every clip is off");
    const tabs = ctx.chapters.map((id, i) => {
      const n = id.slice(3);
      const state = i ? ' aria-selected="false" tabindex="-1"' : ' aria-selected="true"';
      return `<li role="presentation"><button class="chapter-tab" type="button" role="tab" id="tab-${n}" aria-controls="chapter-${n}"${state} data-clip="${resolve(site, `media:${id}:json`, ctx, where)}" data-label="${t(`how_clip${n}_alt`)}">${t(`how_ch${n}_tab`)}</button></li>`;
    });
    return `<ul class="chapters${tabs.length === 4 ? " chapters--4" : ""}" role="tablist" aria-label="${t("how_chapters_aria")}">\n        ${tabs.join("\n        ")}\n      </ul>`;
  }
  if (!ctx.chapters) fail("no {{chapters:tabs:…}} before it");
  if (part === "video") {
    const [first, ...rest] = ctx.chapters;
    return videoFigure(site, ctx, first, `how_clip${first.slice(3)}_alt`, list, where, rest);
  }
  if (part === "panels") {
    const has = (key) => lookup(site.i18n[ctx.lang], key) !== undefined;
    const panels = ctx.chapters.map((id, i) => {
      const n = id.slice(3);
      const k = (rest) => `how_ch${n}_${rest}`;
      const body = has(k("body_m")) ? `<span class="d-only">${t(k("body"))}</span><span class="m-only">${t(k("body_m"))}</span>` : t(k("body"));
      const rule = has(k("rule")) ? `\n        <p class="note">${t(k("rule"))}</p>` : "";
      return `<div class="chapter-panel" role="tabpanel" id="chapter-${n}" aria-labelledby="tab-${n}"${i ? " data-js-hidden" : ""}>\n        <h3>${t(k("title"))}</h3>\n        <p>${body}</p>${rule}\n      </div>`;
    });
    return panels.join("\n      ");
  }
  return fail("unknown part");
}

/**
 * A text of sentences as list items, without their closing full stop. A new item
 * starts only at ". " before a capital letter, so "s.r.o.", "1. 11." or "e.g."
 * inside a sentence never split it.
 */
export function listItems(str) {
  return str
    .split(/(?<=[.!?])\s+(?=\p{Lu})/u)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

/** Paragraphs, captions and list items left empty by a dropped sentence go too. */
function dropEmpty(html) {
  return html.replace(/\n?[ \t]*<(p|figcaption|li)\b[^>]*>\s*<\/\1>/g, "");
}

// ── Charts ──────────────────────────────────────────────────────────────────
// Texts from the text map (chartN_*), numbers from src/data/charts/*.json.

const svgText = (x, y, str, attrs = "") => `<text x="${x}" y="${y}"${attrs ? ` ${attrs}` : ""}>${escapeHtml(str)}</text>`;
const r1 = (n) => Math.round(n * 10) / 10;

/** Column ticks: 0 and round steps up to the maximum. */
function ticks(max) {
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw);
  const out = [];
  for (let v = 0; v <= max + step * 0.001; v += step) out.push(v);
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + step);
  return out;
}

/** A column with a 4 px rounded data end and a square foot on the baseline. */
function columnPath(x, y, w, h) {
  // a value above zero stays visible however small (1 role among 141): at least 3 units
  if (h > 0 && h < 3) {
    y -= 3 - h;
    h = 3;
  }
  const r = Math.min(4, w / 2, h);
  return `M${r1(x)} ${r1(y + h)}V${r1(y + r)}Q${r1(x)} ${r1(y)} ${r1(x + r)} ${r1(y)}H${r1(x + w - r)}Q${r1(x + w)} ${r1(y)} ${r1(x + w)} ${r1(y + r)}V${r1(y + h)}Z`;
}

/** A bar growing to the right: square at the baseline, rounded at its end. */
function barPath(x, y, w, h) {
  const r = Math.min(4, h / 2, w);
  return `M${r1(x)} ${r1(y)}H${r1(x + w - r)}Q${r1(x + w)} ${r1(y)} ${r1(x + w)} ${r1(y + r)}V${r1(y + h - r)}Q${r1(x + w)} ${r1(y + h)} ${r1(x + w - r)} ${r1(y + h)}H${r1(x)}Z`;
}

const SHRM_URL = "https://www.shrm.org/topics-tools/research/recruiting-benchmarking/full-data-brief";

function renderChart(site, chart, ctx) {
  const n = { "nove-pozice-po-dnech": 1, "stari-pozic": 2, "zdroje-pozic": 3 }[chart.id];
  if (!n) throw new Error(`Chart ${chart.id}: no renderer yet (etapa 2)`);
  const t = (k) => text(site, ctx, `chart${n}_${k}`);
  const source = text(site, ctx, n === 1 ? "chart_source" : "chart_source_short", { as_of: formatDate(chart.as_of, ctx.lang, true) });
  const body = n === 1 ? dailyChart(chart, ctx, t) : n === 2 ? ageChart(chart, ctx, t, site) : sourcesChart(chart, ctx, t);
  // chart 2 leans on SHRM's time to fill: its source is a visible line under the caption, linked as in the article
  const shrm = n === 2 ? `\n  <p class="chart__ref"><a href="${SHRM_URL}" rel="noopener">${escapeHtml(text(site, ctx, "chart2_note_source"))}</a></p>` : "";
  // what supports the chart (the method note, the table) waits behind one click
  return `<figure class="chart" id="ch-${chart.id}" data-reveal>
  <figcaption class="chart__head">
    <h3 class="chart__title">${escapeHtml(t("title"))}</h3>
    <p class="chart__lead">${escapeHtml(t("lead"))}</p>
  </figcaption>
${body.svg}
  <p class="chart__caption">${escapeHtml(t("caption"))}${n === 2 ? ` ${escapeHtml(whyAfterFirst(t("why")))}` : ""}</p>${shrm}
  <p class="chart__source">${escapeHtml(source)}</p>
  <details class="chart__data">
    <summary>${escapeHtml(text(site, ctx, "chart_table_toggle"))}</summary>
    <p class="chart__note">${escapeHtml(t("note"))}</p>
${body.table}
  </details>
</figure>`;
}

/**
 * A chart on a phone (lead, etapa 4a): plain HTML bars, one per row, label and
 * value as real 14 px text, so nothing shrinks with the screen the way SVG text
 * does. The age chart merges every band of 45 days and more into one "45+" bar,
 * the only one in the accent; the sentence under it says why it matters. The
 * list carries the chart's text alternative, and the note, source and date
 * stay under the chart.
 */
function renderPhoneChart(site, chart, ctx) {
  const n = { "nove-pozice-po-dnech": 1, "stari-pozic": 2, "zdroje-pozic": 3 }[chart.id];
  if (!n) throw new Error(`Chart ${chart.id}: no phone renderer`);
  const fmt = NUMBER[ctx.lang];
  const t = (k) => text(site, ctx, `chart${n}_${k}`);
  const source = text(site, ctx, n === 1 ? "chart_source" : "chart_source_short", { as_of: formatDate(chart.as_of, ctx.lang, true) });
  let rows;
  if (n === 1) {
    rows = chart.rows.map((r) => ({ label: formatDate(r.date, ctx.lang, false), value: r.new_roles, hi: false }));
  } else if (n === 2) {
    const days = text(site, ctx, "chart_days");
    rows = chart.rows.filter((r) => !r.highlight).map((r) => ({ label: `${r.days} ${days}`, value: r.roles, hi: false }));
    const long = chart.rows.filter((r) => r.highlight).reduce((a, r) => a + r.roles, 0);
    rows.push({ label: `${t("legend_hl_short")} ${days}`, value: long, hi: true });
  } else {
    rows = [...chart.rows]
      .sort((a, b) => b.companies - a.companies)
      .map((r) => ({ label: t(`group_${SOURCE_GROUP[r.group_en]}`), value: r.companies, hi: SOURCE_GROUP[r.group_en] === "jobscz" }));
  }
  const max = Math.max(...rows.map((r) => r.value));
  const bars = rows
    .map((r, i) => {
      const w = max ? Math.max(1, Math.round((r.value / max) * 1000) / 10) : 0;
      return `<li class="hbars__row${r.hi ? " is-hi" : ""}"><span class="hbars__label">${escapeHtml(r.label)}</span><span class="hbars__track" aria-hidden="true"><span class="hbars__bar" style="--w:${w}%;--i:${i}"></span></span><span class="hbars__value">${fmt(r.value)}</span></li>`;
    })
    .join("");
  // the age chart's sentence is why 45+ matters (chart2_why); the others keep their caption
  const caption = n === 2 ? t("why") : t("caption");
  return `<figure class="chart chart--m" id="chm-${chart.id}" data-reveal>
  <figcaption class="chart__head">
    <h3 class="chart__title">${escapeHtml(t("title"))}</h3>
    <p class="chart__lead">${escapeHtml(t("lead"))}</p>
  </figcaption>
  <ol class="hbars" role="list" aria-label="${escapeHtml(t("alt"))}">${bars}</ol>
  <p class="chart__caption">${escapeHtml(caption)}</p>
  <p class="chart__note">${escapeHtml(t("note"))}</p>
  <p class="chart__source">${escapeHtml(source)}</p>
</figure>`;
}

/** Seconds as m:ss for a chapter of the tour. */
const minutesSeconds = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * The tour's chapters on /demo. Once media.json gives the tour its chapter
 * times (clips.tour.chapters: per language [{ start }] as media's
 * tour.chapters.json, or a plain list of seconds), each chapter is a button
 * that jumps the video there. Until then a plain numbered list: a button that
 * does nothing would be worse than text (lead, etapa 4a).
 */
function tourChapters(site, ctx) {
  const clip = site.media.clips.tour;
  // the tour off (Kryštof 11. 11. 2026, until it is retaken): its chapters would point at a video that is not there
  if (clip && clip.off) throw new Error(`${ctx.where} [${ctx.lang}]: clip tour is off in media.json in {{tour:chapters}}`);
  const raw = clip && clip.chapters ? (Array.isArray(clip.chapters) ? clip.chapters : clip.chapters[ctx.lang]) : null;
  const times = (Array.isArray(raw) ? raw : [])
    .map((c) => (typeof c === "number" ? c : Number(c && c.start)))
    .filter((s) => Number.isFinite(s) && s >= 0);
  const keys = ["demo_ch1", "demo_ch2", "demo_ch3", "demo_ch4", "demo_ch5"];
  if (!times.length) {
    return `<ol class="tour-chapters">${keys.slice(0, 4).map((k) => `<li>${escapeHtml(text(site, ctx, k))}</li>`).join("")}</ol>`;
  }
  const items = times.slice(0, keys.length).map(
    (s, i) => `<li><button class="tour-chapter" type="button" data-seek="${s}"><span class="tour-chapter__time">${minutesSeconds(s)}</span><span>${escapeHtml(text(site, ctx, keys[i]))}</span></button></li>`
  );
  // without JavaScript the buttons would do nothing: the same chapters as text, the native controls can go to those times
  const plain = times.slice(0, keys.length).map((s, i) => `<li><span class="tour-chapter__time">${minutesSeconds(s)}</span> ${escapeHtml(text(site, ctx, keys[i]))}</li>`);
  return `<ol class="tour-chapters tour-chapters--text">${plain.join("")}</ol><ol class="tour-chapters tour-chapters--seek" role="list">${items.join("")}</ol>`;
}

/**
 * The age chart's "why" without its first sentence: on a wide screen the caption
 * above it already says the roles have been up 45 days or more, so the two read
 * as one paragraph without saying it twice (lead, etapa 4a kolo 3).
 */
function whyAfterFirst(why) {
  const cut = why.search(/(?<=[.!?])\s/);
  return cut < 0 ? why : why.slice(cut + 1);
}

/** Columns with an axis: shared by the daily chart and the age chart. */
function columns(chart, ctx, t, rows, { label, value, highlight, valueLabel, title }) {
  const fmt = NUMBER[ctx.lang];
  const W = 400, H = 264, left = 40, right = 8, top = 28, bottom = 64;
  const plotW = W - left - right, plotH = H - top - bottom;
  const max = Math.max(...rows.map(value));
  const tk = ticks(max);
  const yMax = tk[tk.length - 1];
  const slot = plotW / rows.length;
  const bw = Math.min(24, slot - 6);
  const y = (v) => top + plotH - (v / yMax) * plotH;
  const parts = [];
  for (const v of tk) parts.push(`<line class="chart__grid" x1="${left}" x2="${W - right}" y1="${r1(y(v))}" y2="${r1(y(v))}"></line>`, svgText(left - 6, r1(y(v) + 5), fmt(v), 'class="chart__tick" text-anchor="end"'));
  rows.forEach((r, i) => {
    const cx = left + slot * i + slot / 2;
    const h = (value(r) / yMax) * plotH;
    const name = title(r);
    parts.push(`<g class="chart__mark${highlight(r) ? " is-hi" : ""}" style="--i:${i}" tabindex="0" role="listitem" aria-label="${escapeHtml(name)}"><title>${escapeHtml(name)}</title><rect class="chart__hit" x="${r1(left + slot * i)}" y="${top}" width="${r1(slot)}" height="${plotH}"></rect><path class="chart__bar" d="${columnPath(cx - bw / 2, y(value(r)), bw, h)}"></path></g>`);
    if (valueLabel(r)) parts.push(svgText(r1(cx), r1(y(value(r)) - 6), fmt(value(r)), 'class="chart__value" text-anchor="middle"'));
    const l = label(r);
    // a range on two lines ("14–" over "29") so neighbouring labels never touch; a date too once there are more than six ("26." over "10.")
    const space = rows.length > 6 ? l.search(/\s/) : -1;
    const [a, b] = l.length > 3 && l.includes("–") ? [l.slice(0, l.indexOf("–") + 1), l.slice(l.indexOf("–") + 1)] : space > 0 ? [l.slice(0, space), l.slice(space + 1)] : [l, ""];
    parts.push(`<text class="chart__tick" x="${r1(cx)}" y="${H - bottom + 18}" text-anchor="middle"><tspan x="${r1(cx)}">${escapeHtml(a)}</tspan>${b ? `<tspan x="${r1(cx)}" dy="16">${escapeHtml(b)}</tspan>` : ""}</text>`);
  });
  parts.push(`<line class="chart__axis" x1="${left}" x2="${W - right}" y1="${top + plotH}" y2="${top + plotH}"></line>`);
  parts.push(svgText(left - 6, 14, t("axis_y"), 'class="chart__axis-title" text-anchor="start"'));
  parts.push(svgText(r1(left + plotW / 2), H - 6, t("axis_x"), 'class="chart__axis-title" text-anchor="middle"'));
  return `  <svg class="chart__svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${chart.id}-t ${chart.id}-d">
    <title id="${chart.id}-t">${escapeHtml(t("title"))}</title>
    <desc id="${chart.id}-d">${escapeHtml(t("alt"))}</desc>
    <g role="list">${parts.join("")}</g>
  </svg>\n`;
}

const tableOf = (head, rows) => `    <table>
      <thead><tr>${head.map((h) => `<th scope="col">${escapeHtml(h)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(([th, ...tds]) => `<tr><th scope="row">${escapeHtml(th)}</th>${tds.map((td) => `<td>${escapeHtml(td)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;

/** Chart 1: new roles per day, one neutral hue (nothing to stress), values only on the highest and lowest day. */
function dailyChart(chart, ctx, t) {
  const fmt = NUMBER[ctx.lang];
  const rows = chart.rows;
  const lo = Math.min(...rows.map((r) => r.new_roles));
  const hi = Math.max(...rows.map((r) => r.new_roles));
  const day = (r) => formatDate(r.date, ctx.lang, false);
  const svg = columns(chart, ctx, t, rows, {
    label: day,
    value: (r) => r.new_roles,
    highlight: () => false,
    valueLabel: (r) => r.new_roles === lo || r.new_roles === hi,
    title: (r) => `${day(r)}: ${fmt(r.new_roles)}`,
  });
  return { svg, table: tableOf([t("axis_x"), t("axis_y")], rows.map((r) => [day(r), fmt(r.new_roles)])) };
}

/**
 * A noun for a count: forms "1|2–4|0 and 5+" (Czech: 1 otevřená pozice, 3 otevřené
 * pozice, 17 otevřených pozic); English uses the first two (1 role, 2 roles).
 */
export function plural(lang, n, forms) {
  const [one, few, many] = forms.split("|");
  if (n === 1) return one;
  if (lang === "cs") return n >= 2 && n <= 4 ? few : many;
  return few;
}

/** Chart 2: open roles by days since posting, the 45–365 bands in the accent. */
function ageChart(chart, ctx, t) {
  const fmt = NUMBER[ctx.lang];
  const unit = (n) => plural(ctx.lang, n, t("unit_forms"));
  const svg = columns(chart, ctx, t, chart.rows, {
    label: (r) => r.days,
    value: (r) => r.roles,
    highlight: (r) => r.highlight,
    valueLabel: (r) => r.highlight,
    title: (r) => `${r.days}: ${fmt(r.roles)} ${unit(r.roles)}`,
  });
  const key = `  <p class="chart__key"><span class="chart__swatch" aria-hidden="true"></span><span class="long">${escapeHtml(t("legend_hl"))}</span><span class="short">${escapeHtml(t("legend_hl_short"))}</span></p>\n`;
  return { svg: key + svg, table: tableOf([t("axis_x"), t("axis_y")], chart.rows.map((r) => [r.days, fmt(r.roles)])) };
}

/**
 * Chart 3: companies by where their roles are read, sorted, one neutral hue with
 * only "Jobs.cz and Teamio" (what the lead sentence is about) in the accent. The
 * roles per source are in the data table.
 */
function sourcesChart(chart, ctx, t) {
  const fmt = NUMBER[ctx.lang];
  const rows = [...chart.rows].sort((a, b) => b.companies - a.companies);
  const key = (r) => SOURCE_GROUP[r.group_en];
  const group = (r) => t(`group_${key(r)}`);
  const W = 360, rowH = 44, top = 8, left = 152, right = 44;
  const H = top + rows.length * rowH;
  const max = Math.max(...rows.map((r) => r.companies));
  const plotW = W - left - right;
  const marks = rows.map((r, i) => {
    const y = top + i * rowH;
    const w = Math.max(2, (r.companies / max) * plotW);
    const label = `${group(r)}: ${fmt(r.companies)}`;
    const hi = key(r) === "jobscz";
    return `<g class="chart__mark${hi ? " is-hi" : ""}" style="--i:${i}" tabindex="0" role="listitem" aria-label="${escapeHtml(label)}"><title>${escapeHtml(label)}</title><rect class="chart__hit" x="0" y="${y}" width="${W}" height="${rowH}"></rect>${svgText(0, y + 27, group(r), 'class="chart__label"')}<path class="chart__bar chart__bar--h" d="${barPath(left, y + 10, w, 24)}"></path>${svgText(r1(left + w + 6), y + 27, fmt(r.companies), `class="chart__value${hi ? " chart__value--hi" : ""}"`)}</g>`;
  });
  const svg = `  <p class="chart__panel-title" id="${chart.id}-t">${escapeHtml(t("col_companies"))}</p>
  <svg class="chart__svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${chart.id}-t ${chart.id}-d">
    <desc id="${chart.id}-d">${escapeHtml(t("alt"))}</desc>
    <g role="list">${marks.join("")}</g>
  </svg>\n`;
  return { svg, table: tableOf([t("group"), t("col_companies"), t("col_positions")], rows.map((r) => [group(r), fmt(r.companies), fmt(r.roles)])) };
}

// ── Pages ───────────────────────────────────────────────────────────────────

const LOCALE = { cs: "cs_CZ", en: "en_IE" };

/** Texts site.js needs at run time; a page carries only its own language's. */
const JS_KEYS = [
  "hero_video_play", "hero_video_pause", "trial_submitting", "nav_menu_open", "nav_menu_close",
  "form_err_required", "form_err_name", "form_err_name_short", "form_err_email_empty", "form_err_company", "form_err_company_short", "form_err_email", "form_err_file_large", "form_err_file_type", "form_err_generic",
  "form_state_success_title", "form_state_success_s1", "form_state_success_s2", "form_state_success_s3", "form_state_success_foot",
  "trial_ai_copied", "trial_ai_hide",
];

const cleanLdText = (str) => plainSpaces(String(str).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());

const APP_FEATURES = {
  cs: [
    "Automatické sledování kariérních webů a ATS dvakrát denně (6:00 a 12:00)",
    "Podpora 18+ ATS platforem i vlastních kariérních stránek",
    "Skutečné stáří pozice s filtry 30+ a 45+ dní",
    "Ověřená automatická archivace zmizelých inzerátů",
    "Odhad hiring manažera a proklik na LinkedIn a Google X-Ray",
    "Export do Excelu, CSV, Bullhornu a Vincere",
    "Vestavěný lehký režim Radar + ATS v ceně tarifu",
    "Párování anonymizovaného kandidáta na otevřené role",
    "MCP propojení s Claude a ChatGPT (Agency Pro a Scale)",
  ],
  en: [
    "Twice-daily automated career-page and ATS monitoring (06:00 and 12:00)",
    "Supports 18+ ATS platforms alongside custom career websites",
    "True posting age tracking with 30+ and 45+ day filters",
    "Verified automatic archival of disappeared job listings",
    "Hiring-manager estimation with one-click LinkedIn and Google X-Ray search",
    "Excel, CSV, Bullhorn, and Vincere export",
    "Built-in lightweight Radar + ATS mode included in every plan",
    "Anonymous candidate-to-open-roles matching without storing CVs",
    "Claude and ChatGPT MCP integration (Agency Pro and Scale)",
  ],
};

function orgNode(site, description) {
  const origin = site.config.origin;
  return {
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name: "TalentRadar",
    url: `${origin}/`,
    logo: { "@type": "ImageObject", url: `${origin}/logo.png` },
    ...(description ? { description: cleanLdText(description) } : {}),
    founder: {
      "@type": "Person",
      name: "Kryštof Pejša",
      jobTitle: "Founder",
      ...(site.config.linkedinFounder ? { sameAs: site.config.linkedinFounder } : {}),
    },
    contactPoint: { "@type": "ContactPoint", contactType: "sales", email: site.config.email },
    sameAs: [site.config.linkedinCompany, site.config.linkedinFounder].filter(Boolean),
  };
}

function websiteNode(site, lang) {
  const origin = site.config.origin;
  return {
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: "TalentRadar",
    alternateName: "TalentRadar.eu",
    url: `${origin}/`,
    inLanguage: lang,
    publisher: { "@id": `${origin}/#organization` },
  };
}

function softwareAppJsonLd(site, r, page, ctx) {
  const origin = site.config.origin;
  const currency = site.plans.currency[r.lang];
  const monthly = site.plans.tiers.map((t) => t.price[currency]);
  return {
    "@type": "SoftwareApplication",
    "@id": `${origin}/#software`,
    name: "TalentRadar",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${origin}${ctx.url("home", r.lang)}`,
    inLanguage: r.lang,
    description: cleanLdText(page.description_raw),
    featureList: APP_FEATURES[r.lang] || APP_FEATURES.en,
    provider: { "@id": `${origin}/#organization` },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: currency,
      lowPrice: String(Math.min(...monthly)),
      highPrice: String(Math.max(...monthly)),
      offerCount: String(site.plans.tiers.length),
      offers: site.plans.tiers.map((tier, idx) => ({
        "@type": "Offer",
        name: `${tier.name} (${cleanLdText(text(site, ctx, `pricing_t${idx + 1}_limits`))})`,
        price: String(tier.price[currency]),
        priceCurrency: currency,
        url: `${origin}${ctx.url("pricing", r.lang)}`,
      })),
    },
  };
}

function faqPageJsonLd(lang, items) {
  return {
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: cleanLdText(q),
      acceptedAnswer: { "@type": "Answer", text: cleanLdText(a) },
    })),
  };
}

function breadcrumbJsonLd(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: cleanLdText(item.name),
      item: item.url,
    })),
  };
}

function faqItemsFor(site, ctx, kind) {
  if (kind === "home") {
    return [7, 2, 8, 1, 3, 4, 5, 6].map((n) => ({
      q: text(site, ctx, `faq_q${n}`),
      a: n === 7 ? render(site, text(site, ctx, "faq_a7_html"), ctx, ctx.where || "faq") : text(site, ctx, `faq_a${n}`),
    }));
  }
  return [1, 2, 3, 4, 5].map((n) => ({
    q: text(site, ctx, `pp_faq_q${n}`),
    a: text(site, ctx, `pp_faq_a${n}`),
  }));
}

function jsonLd(site, r, page, ctx) {
  if (r.noindex) return "";
  const origin = site.config.origin;
  const homeUrl = `${origin}${ctx.url("home", r.lang)}`;
  const homeName = r.lang === "cs" ? "Domů" : "Home";
  const org = orgNode(site, r.id === "home" ? page.description_raw : undefined);
  let graph;

  if (r.post) {
    const blogName = r.lang === "cs" ? "Výzkum" : "Research";
    const blogUrl = `${origin}${ctx.url("blog", r.lang)}`;
    const article = {
      "@type": "Article",
      headline: cleanLdText(r.post.title),
      description: cleanLdText(r.post.description),
      image: `${origin}/img/og-${r.lang}.jpg`,
      inLanguage: r.lang,
      author: {
        "@type": "Person",
        name: "Kryštof Pejša",
        jobTitle: "Founder",
        ...(site.config.linkedinFounder ? { sameAs: site.config.linkedinFounder } : {}),
        worksFor: { "@id": `${origin}/#organization` },
      },
      publisher: { "@id": `${origin}/#organization` },
      datePublished: r.post.published,
      dateModified: r.post.modified || r.post.published,
      mainEntityOfPage: page.canonical_url,
    };
    const crumbs = breadcrumbJsonLd([
      { name: homeName, url: homeUrl },
      { name: blogName, url: blogUrl },
      { name: r.post.crumb || r.post.title, url: page.canonical_url },
    ]);
    graph = [org, article, crumbs, ...(Array.isArray(r.post.faq) && r.post.faq.length ? [faqPageJsonLd(r.lang, r.post.faq)] : [])];
  } else if (r.id === "home") {
    graph = [org, websiteNode(site, r.lang), softwareAppJsonLd(site, r, page, ctx), faqPageJsonLd(r.lang, faqItemsFor(site, ctx, "home"))];
  } else if (r.id === "pricing") {
    const crumbs = breadcrumbJsonLd([
      { name: homeName, url: homeUrl },
      { name: text(site, ctx, "nav_pricing"), url: page.canonical_url },
    ]);
    graph = [org, softwareAppJsonLd(site, r, page, ctx), faqPageJsonLd(r.lang, faqItemsFor(site, ctx, "pricing")), crumbs];
  } else if (r.id === "blog") {
    const langPosts = Object.values(site.posts)
      .map((p) => p.lang[r.lang])
      .sort((a, b) => b.published.localeCompare(a.published) || a.id.localeCompare(b.id));
    const crumbs = breadcrumbJsonLd([
      { name: homeName, url: homeUrl },
      { name: text(site, ctx, "nav_blog"), url: page.canonical_url },
    ]);
    graph = [
      org,
      {
        "@type": "CollectionPage",
        name: cleanLdText(text(site, ctx, "blog_h2")),
        description: cleanLdText(page.description_raw),
        url: page.canonical_url,
        inLanguage: r.lang,
        publisher: { "@id": `${origin}/#organization` },
        hasPart: langPosts.map((p) => ({
          "@type": "Article",
          headline: cleanLdText(p.title),
          url: `${origin}${ctx.url(`post:${p.id}`, r.lang)}`,
        })),
      },
      crumbs,
    ];
  } else {
    const crumbs = breadcrumbJsonLd([
      { name: homeName, url: homeUrl },
      { name: cleanLdText(text(site, ctx, `meta_${r.id}_title`)), url: page.canonical_url },
    ]);
    const webPage = {
      "@type": "WebPage",
      name: cleanLdText(text(site, ctx, `meta_${r.id}_title`)),
      description: cleanLdText(page.description_raw),
      url: page.canonical_url,
      inLanguage: r.lang,
      ...(r.id === "demo" ? { about: { "@id": `${origin}/#software` } } : { publisher: { "@id": `${origin}/#organization` } }),
    };
    graph = r.id === "demo" ? [org, softwareAppJsonLd(site, r, page, ctx), webPage, crumbs] : [org, webPage, crumbs];
  }

  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;
}

function llmsBaseLines(site, all, urlOf) {
  const { config, plans, demoStats, charts } = site;
  const origin = config.origin;
  const enVars = siteVars(site, "en");
  const atsSources = site.i18n.en.ats_strip_list;
  const ageChart = charts["stari-pozic"];
  const ageBase = ageChart ? ageChart.rows.reduce((a, r) => a + r.roles, 0) : 0;
  const age45 = ageChart ? ageChart.rows.filter((r) => r.highlight).reduce((a, r) => a + r.roles, 0) : 0;
  const srcChart = charts["zdroje-pozic"];
  const srcMap = srcChart ? Object.fromEntries(srcChart.rows.map((r) => [r.group_en, r])) : {};
  const tierLines = plans.tiers.map((t) => {
    const czkMonth = t.price.CZK.toLocaleString("en-GB");
    const eurMonth = t.price.EUR.toLocaleString("en-GB");
    const czkYear = (t.price.CZK * plans.yearly_paid_months).toLocaleString("en-GB");
    const eurYear = (t.price.EUR * plans.yearly_paid_months).toLocaleString("en-GB");
    return `- **${t.name}**: up to ${t.companies} companies — CZK ${czkMonth}/month (CZK ${czkYear}/year) or EUR ${eurMonth}/month (EUR ${eurYear}/year), excl. VAT.`;
  });
  const postsEn = Object.values(site.posts)
    .map((p) => p.lang.en)
    .sort((a, b) => b.published.localeCompare(a.published) || a.id.localeCompare(b.id));
  const postsCs = Object.values(site.posts)
    .map((p) => p.lang.cs)
    .sort((a, b) => b.published.localeCompare(a.published) || a.id.localeCompare(b.id));
  const link = (id, lang) => `${origin}${urlOf(id, lang)}`;

  return {
    origin,
    postsEn,
    postsCs,
    lines: [
      "# TalentRadar",
      "",
      "> B2B SaaS platform for recruitment agencies and executive search teams that automatically monitors client and prospect career pages twice a day, surfaces new roles before they reach job boards, flags roles open 45+ days, archives closed listings, and matches candidates to open roles.",
      "",
      "## What Problem It Solves",
      "- Employers publish new roles on their own career page or ATS first; job boards and LinkedIn receive them hours or days later via feeds or paid promotion.",
      "- TalentRadar checks every tracked company's career page twice daily (06:00 and 12:00 in the agency's timezone), so consultants reach hiring managers during the golden window before inboxes fill up.",
      "- Works alongside any existing ATS (Radar-only mode with Excel, CSV, Bullhorn, and Vincere export) or as a lightweight built-in ATS (Radar + ATS mode included in every plan).",
      "- Tracks real posting dates (from the company ATS or first-seen timestamp) to highlight roles open 30+ and 45+ days, and automatically archives disappeared roles after verification to eliminate ghost-job waste.",
      "- Estimates likely hiring managers from the job posting, links directly to LinkedIn and Google X-Ray search, drafts outreach messages in each consultant's style, and connects to Claude and ChatGPT via MCP on Agency Pro and Scale plans.",
      "",
      "## Supported Career Pages & ATS Sources",
      `- Public career pages and ATS APIs read automatically: ${atsSources}, plus custom company career websites.`,
      "- Exports: Excel (.xlsx), generic CSV, and ready-to-import files for Bullhorn and Vincere.",
      "- Custom career-page connectors available on the Scale plan.",
      "",
      `## Public Demo Data Snapshot (as of ${demoStats.as_of})`,
      `- Tracked sample: ${demoStats.companies} Czech companies (${demoStats.companies_open} with open roles), ${demoStats.open_positions} open roles total, average ${enVars["c1.avg"]} new roles per day, ${demoStats.companies_new_7d} of ${demoStats.companies} companies with a new role in 7 days.`,
      ...(srcChart
        ? [`- Sources across the ${demoStats.companies} demo companies: ${srcMap["Jobs.cz / Teamio"]?.companies ?? 0} via Jobs.cz/Teamio (${srcMap["Jobs.cz / Teamio"]?.roles ?? 0} roles), ${srcMap["Company ATS"]?.companies ?? 0} via company ATS (${srcMap["Company ATS"]?.roles ?? 0} roles), and ${srcMap["Own careers site"]?.companies ?? 0} directly from custom careers sites (${srcMap["Own careers site"]?.roles ?? 0} roles).`]
        : []),
      ...(ageChart ? [`- Role age: ${age45} of ${ageBase} dated roles (${Math.round((age45 / ageBase) * 100)}%) have been open for 45+ days.`] : []),
      "",
      "## Pricing (Monthly, No Commitment; Yearly = 10 Months for 12)",
      ...tierLines,
      "- Free trial: 14 days free, no credit card, up to 150 companies (Agency Pro features). Launch offer for the first 5 agencies: first month free, then 3 months at 50% off.",
      "",
      "## Key Pages (English)",
      `- [Home](${link("home", "en")}): Overview, live demo statistics, supported ATS list, FAQ, and free trial sign-up.`,
      `- [Pricing](${link("pricing", "en")}): Solo Scout, Agency Pro, and Scale tiers in EUR/CZK with monthly and yearly billing.`,
      `- [App Preview](${link("demo", "en")}): Short captioned clips from the public TalentRadar demo.`,
      `- [Research & Blog](${link("blog", "en")}): Data-backed articles and agency BD playbooks.`,
      `- [Privacy Policy](${link("gdpr", "en")}): GDPR data processing details.`,
      `- [Full AI Context (llms-full.txt)](${origin}/llms-full.txt): Complete bilingual product specs, all FAQs, and article Q&As in Markdown.`,
      "",
      "## Key Pages (Czech)",
      `- [Domů](${link("home", "cs")}): Přehled funkce radaru, data z veřejného dema, časté dotazy a zkušební přístup zdarma.`,
      `- [Ceník](${link("pricing", "cs")}): Tarify Solo Scout, Agency Pro a Scale v CZK bez DPH.`,
      `- [Ukázky](${link("demo", "cs")}): Krátké ukázky z veřejného dema aplikace.`,
      `- [Blog a výzkum](${link("blog", "cs")}): Návody a data pro personální agentury.`,
      `- [Zásady ochrany osobních údajů](${link("gdpr", "cs")}): Zpracování údajů dle GDPR.`,
      "",
      "## Research Articles (English)",
      ...postsEn.map((p) => `- [${cleanLdText(p.title)}](${link(`post:${p.id}`, "en")}): ${cleanLdText(p.description)}`),
      "",
      "## Odborné články (Czech)",
      ...postsCs.map((p) => `- [${cleanLdText(p.title)}](${link(`post:${p.id}`, "cs")}): ${cleanLdText(p.description)}`),
      "",
      "## Contact",
      `- Founder: Kryštof Pejša (${config.email})`,
      ...(config.linkedinCompany ? [`- LinkedIn (Company): ${config.linkedinCompany}`] : []),
      ...(config.linkedinFounder ? [`- LinkedIn (Founder): ${config.linkedinFounder}`] : []),
      `- Live Public Demo: ${config.demoUrl}`,
      "",
    ],
  };
}

/** Structured Markdown summary for AI search engines and assistants (public/llms.txt). */
function llmsTxt(site, all, urlOf) {
  return llmsBaseLines(site, all, urlOf).lines.join("\n");
}

/** Extended bilingual knowledge base with full FAQs for AI assistants (public/llms-full.txt). */
function llmsFullTxt(site, all, urlOf) {
  const base = llmsBaseLines(site, all, urlOf);
  const varsByLang = Object.fromEntries(site.config.langs.map((l) => [l, siteVars(site, l)]));
  const faqBlock = (lang, heading) => {
    const ctx = { lang, dict: site.i18n[lang], vars: varsByLang[lang], icons: new Set(), assetVersions: {}, url: (id, l = lang) => urlOf(id, l), page: {} };
    const items = [...faqItemsFor(site, ctx, "home"), ...faqItemsFor(site, ctx, "pricing")];
    const postFaqs = (lang === "cs" ? base.postsCs : base.postsEn).flatMap((p) => p.faq || []);
    return [
      heading,
      ...[...items, ...postFaqs].flatMap(({ q, a }) => [`### ${cleanLdText(q)}`, cleanLdText(a), ""]),
    ];
  };
  return [
    ...base.lines,
    ...faqBlock("en", "## Frequently Asked Questions (English)"),
    ...faqBlock("cs", "## Časté dotazy (Czech)"),
  ].join("\n");
}

/** Builds the whole site: Map of repo-relative path -> content (string or Buffer). */
export function buildSite(site) {
  const files = new Map();
  const all = routes(site);
  const { config } = site;
  const origin = config.origin;

  // CSS and JS with content hashes in their addresses, imports included.
  const assetVersions = {};
  files.set("public/css/site.css", site.css);
  assetVersions["css/site.css"] = hash(site.css);
  const jsNames = Object.keys(site.js).sort((a, b) => (a === "site.js") - (b === "site.js"));
  for (const name of jsNames) {
    let code = site.js[name];
    code = code.replace(/from "\.\/([\w-]+\.js)"/g, (m, dep) => {
      if (!assetVersions[`js/${dep}`]) throw new Error(`js/${name} imports ${dep}, which is not built before it`);
      return `from "./${dep}?v=${assetVersions[`js/${dep}`]}"`;
    });
    files.set(`public/js/${name}`, code);
    assetVersions[`js/${name}`] = hash(code);
  }

  const varsByLang = Object.fromEntries(config.langs.map((l) => [l, siteVars(site, l)]));
  const urlOf = (id, lang) => {
    const r = all.find((x) => x.id === id && x.lang === lang);
    return r ? r.path : undefined;
  };

  for (const r of all) {
    const dict = site.i18n[r.lang];
    const other = config.langs.find((l) => l !== r.lang);
    const where = `${r.template} (${r.path})`;
    const ctx = { lang: r.lang, dict, where, vars: varsByLang[r.lang], icons: new Set(), assetVersions, url: (id, lang = r.lang) => urlOf(id, lang), page: {} };
    const title = r.post ? `${r.post.title} | TalentRadar` : text(site, ctx, `meta_${r.id}_title`);
    const description = r.post ? r.post.description : text(site, ctx, `meta_${r.id}_description`);
    // the home page is shared with its own line (text map 4.3), other pages with title and description
    const ogTitle = r.id === "home" ? text(site, ctx, "og_title") : title;
    const ogDescription = r.id === "home" ? text(site, ctx, "og_description") : description;
    const canonical = `${origin}${r.path}`;
    const links = [];
    if (r.noindex) {
      links.push('<meta name="robots" content="noindex">');
    } else {
      links.push(`<link rel="canonical" href="${canonical}">`);
      for (const l of config.langs) links.push(`<link rel="alternate" hreflang="${l}" href="${origin}${urlOf(r.id, l)}">`);
      links.push(`<link rel="alternate" hreflang="x-default" href="${origin}${urlOf(r.id, config.xDefault)}">`);
    }
    // Manrope too: the H1 is set in it, and a late swap moved the hero (CLS 0.03, mobile audit 17)
    const preloads = ["inter-latin", "manrope-latin", ...(r.lang === "cs" ? ["inter-latin-ext", "manrope-latin-ext"] : [])]
      .map((f) => `<link rel="preload" href="/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`);
    if (r.id === "home") preloads.push(...heroPosterPreloads(site, r.lang));
    ctx.page = {
      lang: r.lang,
      other_lang: other,
      title: escapeHtml(title),
      description: escapeHtml(description),
      description_raw: description,
      canonical_url: canonical,
      og_url: escapeHtml(canonical),
      og_title: escapeHtml(ogTitle),
      og_description: escapeHtml(ogDescription),
      og_image_alt: escapeHtml(text(site, ctx, "og_image_alt")),
      og_type: r.post ? "article" : "website",
      og_locale: LOCALE[r.lang],
      alt_url: urlOf(r.id, other),
      head_links: links.join("\n  "),
      preloads: preloads.join("\n  "),
      // texts site.js writes into the page: Czech ones with their no-break spaces already in (the page pass skips <script>)
      i18n_json: JSON.stringify(Object.fromEntries(JS_KEYS.map((k) => [k, r.lang === "cs" ? nbspCs(text(site, ctx, k)) : text(site, ctx, k)]))).replace(/</g, "\\u003c"),
      body_class: `page-${r.id.replace(/[^a-z0-9]+/g, "-")}`,
      post_body: "",
      crumb: r.post ? escapeHtml(r.post.crumb || r.post.title) : "",
      sprite: "",
    };
    ctx.page.jsonld = jsonLd(site, r, ctx.page, ctx);
    if (r.post) ctx.page.post_body = render(site, r.post.body, ctx, `${where} article`);
    const pageTpl = site.templates[`pages/${r.template}`];
    if (pageTpl === undefined) throw new Error(`${where}: no template src/pages/${r.template}.html`);
    ctx.page.content = render(site, pageTpl, ctx, where);
    let html = render(site, site.templates["layouts/base"], ctx, where);
    // icons that site.js swaps in at run time (pause <-> play on the video button)
    if (ctx.icons.has("pause")) ctx.icons.add("play_arrow");
    const sprite = [...ctx.icons].sort().map((name) => {
      const svg = site.icons[name];
      const viewBox = (svg.match(/viewBox="([^"]+)"/) || [])[1] || "0 -960 960 960";
      const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
      return `<symbol id="i-${name}" viewBox="${viewBox}">${inner}</symbol>`;
    });
    html = html.replace(
      "<!--sprite-->",
      sprite.length ? `<!-- Material Symbols (Apache License 2.0, src/icons/LICENSE-material-symbols.txt) -->\n<svg xmlns="http://www.w3.org/2000/svg" hidden>${sprite.join("")}</svg>` : ""
    );
    // Czech pages: no line ends on a one-letter word, in templates, articles and the GDPR text too (text nodes only)
    if (r.lang === "cs") html = html.replace(/(<body[^>]*>)([\s\S]*)(<\/body>)/, (m, open, body, close) => open + nbspCsHtml(body) + close);
    files.set(`public/${r.file}`, brandify(dropEmpty(html)));
  }

  // sitemap: every indexable page at its final address, with its language pairs
  const indexableRoutes = all
    .filter((r) => !r.noindex)
    .sort((a, b) => a.path.localeCompare(b.path));
  const entries = indexableRoutes.map((r) => {
    const alts = config.langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${origin}${urlOf(r.id, l)}"/>`);
    alts.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${urlOf(r.id, config.xDefault)}"/>`);
    const lastmod = r.post ? `\n    <lastmod>${r.post.published.slice(0, 10)}</lastmod>` : "";
    return `  <url>\n    <loc>${origin}${r.path}</loc>${lastmod}\n${alts.join("\n")}\n  </url>`;
  });
  files.set(
    "public/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`
  );
  files.set("public/sitemap.txt", indexableRoutes.map((r) => `${origin}${r.path}`).join("\n") + "\n");
  files.set("public/robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
  files.set("public/llms.txt", llmsTxt(site, all, urlOf));
  files.set("public/llms-full.txt", llmsFullTxt(site, all, urlOf));
  files.set("public/_headers", site.headers);

  const redirects = legacyRedirects(site, all);
  const notFound = all
    .filter((r) => r.id === "404")
    .map((r) => ({ prefix: langRoot(config, r.lang), page: r.path }))
    .sort((a, b) => b.prefix.length - a.prefix.length || a.prefix.localeCompare(b.prefix));
  files.set(
    "worker-routes.gen.js",
    `// Generated by build.mjs from src/ (defaultLang "${config.defaultLang}"). Do not edit; run node build.mjs.\n` +
      `// Old addresses of talentradar.eu -> the page's address now (301 in worker.js).\n` +
      `export const REDIRECTS = ${JSON.stringify(redirects, null, 2)};\n\n` +
      `// The 404 page of each language root (worker.js), longest prefix first.\n` +
      `export const NOT_FOUND = ${JSON.stringify(notFound, null, 2)};\n`
  );
  files.set(MANIFEST, `${JSON.stringify({ note: "Files written by build.mjs; it removes only these.", files: [...files.keys(), MANIFEST].sort() }, null, 2)}\n`);
  return files;
}

// ── CLI ─────────────────────────────────────────────────────────────────────

function previousManifest() {
  const p = join(ROOT, MANIFEST);
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")).files : [];
}

/** Differences between a build and the files on disk: [{ path, problem }]. */
export function compareWithDisk(files) {
  const problems = [];
  for (const [path, content] of files) {
    const p = join(ROOT, path);
    if (!existsSync(p)) problems.push({ path, problem: "missing" });
    else if (readFileSync(p, "utf8").replace(/\r\n/g, "\n") !== content) problems.push({ path, problem: "differs" });
  }
  for (const path of previousManifest()) {
    if (!files.has(path) && existsSync(join(ROOT, path))) problems.push({ path, problem: "no longer built" });
  }
  return problems;
}

function main() {
  const check = process.argv.includes("--check");
  const files = buildSite(loadSite());
  if (check) {
    const problems = compareWithDisk(files);
    for (const p of problems) console.error(`${p.problem}: ${p.path}`);
    if (problems.length) {
      console.error("public/ is out of date: run node build.mjs");
      process.exit(1);
    }
    console.log(`public/ is up to date (${files.size} files)`);
    return;
  }
  for (const path of previousManifest()) {
    if (!files.has(path)) rmSync(join(ROOT, path), { force: true });
  }
  for (const [path, content] of files) {
    mkdirSync(dirname(join(ROOT, path)), { recursive: true });
    writeFileSync(join(ROOT, path), content);
  }
  console.log(`Built ${files.size} files (defaultLang ${loadSite().config.defaultLang})`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
