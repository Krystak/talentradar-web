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
  for (const id of Object.keys(posts)) {
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
      "c2.total": n(site.demoStats.feed_roles),
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
    "demo.open_positions": n(s.open_positions),
    "demo.avg_new_per_day": vars["c1.avg"],
    "demo.new_days": vars["c1.days"],
    "demo.companies_new_7d": n(s.companies_new_7d),
    // null until the media stream records the clips: sentences with it are left out
    "clip.date": site.media && site.media.clip_date ? d(site.media.clip_date, true) : null,
  });
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

/** A text of the map for this page, variables filled in (not escaped). */
function text(site, ctx, key, local = {}) {
  const raw = lookup(site.i18n[ctx.lang], key);
  if (raw === undefined) throw new Error(`${ctx.where} [${ctx.lang}]: unknown i18n key ${key}`);
  // "3 400" never breaks between its digits (Czech thousands separator), nor "5 MB", "1 990 Kč", "24 %" before the unit
  return fillText(raw, { ...ctx.vars, ...local }, `${ctx.where} [${ctx.lang}] ${key}`)
    .replace(/(\d) (\d{3})(?!\d)/g, "$1\u00a0$2")
    .replace(/(\d) (MB|kB|Kč|€|%|min)(?![\p{L}])/gu, "$1\u00a0$2");
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
  if (token === "proof:stat3") {
    // "more than half": only while the lower bound really is over half (text map, ID 17)
    if (site.demoStats.companies_new_7d * 2 <= site.demoStats.companies) return "";
    return `<li><strong class="proof__n proof__n--text">${escapeHtml(text(site, ctx, "proof_stat3_value"))}</strong><span class="proof__l">${escapeHtml(text(site, ctx, "proof_stat3_label"))}</span></li>`;
  }
  if (token.startsWith("uri:")) return encodeURIComponent(text(site, ctx, token.slice(4)));
  if (token.startsWith("list:")) {
    // a text of several sentences as a list with a check per sentence (hero_note, direction C 3.3)
    ctx.icons.add("check");
    // list items carry no closing full stop (lead, etapa 2 kolo 1); the text in the map keeps it
    return listItems(text(site, ctx, token.slice(5)))
      .map((s) => `<li><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-check"></use></svg><span>${escapeHtml(s)}</span></li>`)
      .join("");
  }
  if (token.startsWith("video:")) {
    const [id, ariaKey, captionKey] = token.slice(6).split(":");
    return videoFigure(site, ctx, id, ariaKey, captionKey, where);
  }
  if (token.startsWith("media:")) {
    const [id, field] = token.slice(6).split(":");
    const clip = site.media.clips[id] || fail("unknown clip");
    const lang = (p) => p.replace("{lang}", ctx.lang);
    if (field === "json") {
      // a chapter tab's whole clip (all sources, the phone cut) for site.js (js/media.js clipFor)
      const cut = (c) => ({ poster: lang(c.poster), sources: c.sources.map((s) => ({ src: lang(s.src), type: s.type })) });
      return escapeHtml(JSON.stringify({ ...cut(clip), mobile: clip.mobile ? cut({ ...clip, ...clip.mobile }) : null }));
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
    const chart = site.charts[token.slice(6)];
    if (!chart) fail("unknown chart");
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
 * A clip of src/data/media.json in a browser frame. Loops (hero, chapters, V6)
 * are muted, lazy (preload none) and get a pause button in the frame bar; the
 * tour plays only on a click. A clip with a 4:5 phone cut gets both videos, CSS
 * shows one, and only the shown one is ever loaded (site.js).
 */
function videoFigure(site, ctx, id, ariaKey, captionKey, where) {
  const clip = site.media.clips[id];
  if (!clip) throw new Error(`${where}: unknown clip ${id}`);
  const lang = (p) => p.replace("{lang}", ctx.lang);
  const aria = escapeHtml(text(site, ctx, ariaKey));
  const loop = clip.mode === "loop";
  const video = (c, cls) => {
    const attrs = loop ? "muted loop playsinline controls" : "controls playsinline";
    const sources = c.sources.map((s) => `<source src="${lang(s.src)}" type="${s.type}">`).join("");
    const tracks = (c.tracks || [])
      .map((tr) => `<track kind="subtitles" srclang="${tr.srclang}" label="${escapeHtml(text(site, ctx, tr.label))}" src="${lang(tr.src)}"${tr.srclang === ctx.lang ? " default" : ""}>`)
      .join("");
    const play = !loop ? `<button class="video__play" type="button" hidden>${escapeHtml(text(site, ctx, "demo_play"))}</button>` : "";
    return `<div class="frame__screen ${cls}"><video ${attrs} preload="none" width="${c.width || clip.width}" height="${c.height || clip.height}" poster="${lang(c.poster)}" aria-label="${aria}">${sources}${tracks}</video>${play}</div>`;
  };
  let toggle = "";
  if (loop) {
    ctx.icons.add("pause");
    toggle = `<button class="video__toggle" type="button" hidden><svg class="ic" aria-hidden="true" focusable="false"><use href="#i-pause"></use></svg><span>${escapeHtml(text(site, ctx, "hero_video_pause"))}</span></button>`;
  }
  const caption = captionKey ? escapeHtml(text(site, ctx, captionKey)) : "";
  return `<figure class="video video--${id}${clip.mobile ? " video--has-mobile" : ""}" ${loop ? "data-autoplay" : "data-facade"}>
  <div class="frame">
    <div class="frame__bar"><span class="frame__dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="frame__url" aria-hidden="true">${escapeHtml(text(site, ctx, "video_frame_url"))}</span>${toggle}</div>
    ${video(clip, "video--desktop")}${clip.mobile ? `\n    ${video({ ...clip, ...clip.mobile }, "video--mobile")}` : ""}
  </div>
  <figcaption>${caption}</figcaption>
</figure>`;
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
  <p class="chart__caption">${escapeHtml(t("caption"))}</p>${shrm}
  <p class="chart__source">${escapeHtml(source)}</p>
  <details class="chart__data">
    <summary>${escapeHtml(text(site, ctx, "chart_table_toggle"))}</summary>
    <p class="chart__note">${escapeHtml(t("note"))}</p>
${body.table}
  </details>
</figure>`;
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
    // a range on two lines ("14–" over "29") so neighbouring labels never touch
    const [a, b] = l.length > 3 && l.includes("–") ? [l.slice(0, l.indexOf("–") + 1), l.slice(l.indexOf("–") + 1)] : [l, ""];
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
  "form_err_required", "form_err_email", "form_err_file_large", "form_err_file_type", "form_err_generic",
  "form_state_success_title", "form_state_success_s1", "form_state_success_s2", "form_state_success_s3", "form_state_success_foot",
];

function jsonLd(site, r, page) {
  const origin = site.config.origin;
  const org = { "@type": "Organization", name: "TalentRadar", url: `${origin}/`, logo: `${origin}/logo.png` };
  let data;
  if (r.post) {
    data = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: r.post.title,
      description: r.post.description,
      inLanguage: r.lang,
      author: { "@type": "Person", name: "Kryštof Pejša", jobTitle: "Founder", worksFor: org },
      publisher: { "@type": "Organization", name: "TalentRadar", logo: { "@type": "ImageObject", url: `${origin}/logo.png` } },
      datePublished: r.post.published,
      mainEntityOfPage: page.canonical_url,
    };
  } else if (r.id === "home") {
    data = { "@context": "https://schema.org", ...org, description: page.description_raw, sameAs: ["https://www.linkedin.com/company/talent-radareu"] };
  } else {
    return "";
  }
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
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
    const preloads = ["inter-latin", ...(r.lang === "cs" ? ["inter-latin-ext"] : [])]
      .map((f) => `<link rel="preload" href="/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`);
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
      i18n_json: JSON.stringify(Object.fromEntries(JS_KEYS.map((k) => [k, text(site, ctx, k)]))).replace(/</g, "\\u003c"),
      body_class: `page-${r.id.replace(/[^a-z0-9]+/g, "-")}`,
      post_body: "",
      crumb: r.post ? escapeHtml(r.post.crumb || r.post.title) : "",
      sprite: "",
    };
    ctx.page.jsonld = jsonLd(site, r, ctx.page);
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
    files.set(`public/${r.file}`, brandify(dropEmpty(html)));
  }

  // sitemap: every indexable page at its final address, with its language pairs
  const entries = all
    .filter((r) => !r.noindex)
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((r) => {
      const alts = config.langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${origin}${urlOf(r.id, l)}"/>`);
      alts.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${urlOf(r.id, config.xDefault)}"/>`);
      const lastmod = r.post ? `\n    <lastmod>${r.post.published.slice(0, 10)}</lastmod>` : "";
      return `  <url>\n    <loc>${origin}${r.path}</loc>${lastmod}\n${alts.join("\n")}\n  </url>`;
    });
  files.set(
    "public/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`
  );
  files.set("public/robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
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
