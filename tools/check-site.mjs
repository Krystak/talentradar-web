#!/usr/bin/env node
/**
 * Static checks of the built site, no dependencies. Run by tests/site.test.js
 * (npm test) and on its own: `node tools/check-site.mjs` checks public/ on disk.
 *
 * It emulates how Cloudflare static assets answer (html_handling
 * "auto-trailing-slash") plus the Worker's 301 map, so "this address answers
 * 200 without a redirect" is checked for every canonical, hreflang, sitemap
 * entry and internal link.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** Names public/.assetsignore keeps from being published (plain names and **\/name). */
export function ignoredNames(dir = join(ROOT, "public")) {
  const p = join(dir, ".assetsignore");
  const names = new Set([".assetsignore"]);
  if (!existsSync(p)) return names;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const v = line.trim();
    if (v && !v.startsWith("#")) names.add(v.replace(/^\*\*\//, ""));
  }
  return names;
}

/** Every published file under public/ on disk, as "public/…" -> null (content read lazily). */
export function diskFiles(dir = join(ROOT, "public")) {
  const out = new Map();
  const ignored = ignoredNames(dir);
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      if (ignored.has(name)) continue;
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else out.set(relative(ROOT, p).replace(/\\/g, "/"), null);
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}

/**
 * A site to check: the static files on disk plus a build. Files the committed
 * build wrote (build-manifest.json) are left out first, so a build in the other
 * language layout is checked without the stale pages of this one.
 */
export function siteFiles(generated) {
  const files = diskFiles();
  if (generated) {
    const manifest = join(ROOT, "build-manifest.json");
    if (existsSync(manifest)) for (const p of JSON.parse(readFileSync(manifest, "utf8")).files) files.delete(p);
  }
  for (const [path, content] of generated || []) if (path.startsWith("public/")) files.set(path, content);
  return files;
}

function content(files, path) {
  const c = files.get(path);
  if (c !== null && c !== undefined) return String(c);
  return readFileSync(join(ROOT, path), "utf8").replace(/\r\n/g, "\n");
}

/** The address a page file is served at: public/x.html -> /x, public/x/index.html -> /x/. */
export function servedPath(file) {
  const p = file.replace(/^public/, "");
  if (p.endsWith("/index.html")) return p.slice(0, -"index.html".length);
  if (p.endsWith(".html")) return p.slice(0, -".html".length);
  return p;
}

/**
 * How the site answers a path: { status: 200, file } | { status: 301|307, location } | { status: 404 }.
 * Static assets first (auto-trailing-slash), then the Worker's redirect map.
 */
export function answer(path, files, redirects = {}, workerFirst = []) {
  const has = (p) => files.has(`public${p}`);
  const first = workerFirst.some((pattern) => (pattern.endsWith("*") ? path.startsWith(pattern.slice(0, -1)) : path === pattern));
  if (!first) {
    if (!path.endsWith("/") && !path.endsWith(".html") && has(path)) return { status: 200, file: `public${path}` };
    if (path.endsWith("/")) {
      if (has(`${path}index.html`)) return { status: 200, file: `public${path}index.html` };
      if (path !== "/" && has(`${path.slice(0, -1)}.html`)) return { status: 307, location: path.slice(0, -1) };
    } else if (path.endsWith(".html")) {
      if (has(path)) return { status: 307, location: servedPath(`public${path}`) };
    } else {
      if (has(`${path}.html`)) return { status: 200, file: `public${path}.html` };
      if (has(`${path}/index.html`)) return { status: 307, location: `${path}/` };
    }
  }
  if (Object.prototype.hasOwnProperty.call(redirects, path)) return { status: 301, location: redirects[path] };
  if (first && path.startsWith("/video/") && has(path)) return { status: 200, file: `public${path}` };
  return { status: 404 };
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
};

// ── CSS sizes ───────────────────────────────────────────────────────────────

function tokensOf(css) {
  const tokens = {};
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) tokens[m[1]] = m[2].replace(/\/\*.*?\*\//g, "").trim();
  return tokens;
}

/** Smallest px a font-size value can take (clamp -> its minimum), or null when unknown. */
export function minPx(value, tokens, depth = 0) {
  const v = value.replace(/!important/, "").trim();
  if (depth > 5) return null;
  const varM = v.match(/^var\((--[\w-]+)\)$/);
  if (varM) return tokens[varM[1]] ? minPx(tokens[varM[1]], tokens, depth + 1) : null;
  const clampM = v.match(/^clamp\(\s*([^,]+),/);
  if (clampM) return minPx(clampM[1], tokens, depth + 1);
  const n = v.match(/^([\d.]+)(px|rem|em)$/);
  if (n) return n[2] === "px" ? Number(n[1]) : Number(n[1]) * 16;
  if (/^(inherit|initial|unset|smaller|larger|100%)$/.test(v)) return null;
  const pct = v.match(/^([\d.]+)%$/);
  if (pct) return (Number(pct[1]) / 100) * 16;
  return null;
}

/** Every font-size below 12 px in CSS text: [{ where, value, px }]. */
export function smallFonts(css, where, tokens = tokensOf(css)) {
  const out = [];
  for (const m of css.matchAll(/font-size\s*:\s*([^;}"]+)/g)) {
    const px = minPx(m[1], tokens);
    if (px !== null && px < 12) out.push({ where, value: m[1].trim(), px });
  }
  for (const m of css.matchAll(/(--fs-[\w-]+)\s*:\s*([^;]+);/g)) {
    const px = minPx(m[2].replace(/\/\*.*?\*\//g, ""), tokens);
    if (px !== null && px < 12) out.push({ where: `${where} ${m[1]}`, value: m[2].trim(), px });
  }
  for (const m of css.matchAll(/font-size="([\d.]+)"/g)) {
    if (Number(m[1]) < 12) out.push({ where, value: m[1], px: Number(m[1]) });
  }
  return out;
}

// ── Contrast (WCAG 2.x) ─────────────────────────────────────────────────────

function luminance(hex) {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Text tokens on the surfaces they are used on; each must reach WCAG AA (4.5:1). */
export const CONTRAST_PAIRS = [
  // dark bands and panels
  ["--text-on-dark", "--navy-900"], ["--text-on-dark-2", "--navy-900"], ["--mist", "--navy-900"], ["--orange", "--navy-900"],
  ["--text-on-dark-2", "--navy-850"], ["--mist", "--navy-850"], ["--orange", "--navy-850"], ["--mist", "--navy-800"], ["--mist", "--navy-950"],
  // light bands and cards
  ["--ink", "--paper"], ["--ink-2", "--paper"], ["--orange-ink", "--paper"],
  ["--ink", "--card"], ["--ink-2", "--card"], ["--orange-ink", "--card"], ["--ok-ink", "--card"], ["--error-ink", "--card"],
];

// ── The check ───────────────────────────────────────────────────────────────

const ALLOWED_SCRIPT_HOSTS = []; // no third-party scripts at all

/** The size a video file may have in bytes (lead prompt B2), or null for anything that is not a video. */
export function videoBudget(path) {
  const name = path.split("/").pop();
  if (!/\.(mp4|webm)$/.test(name)) return null;
  const mb = name.startsWith("hero-mobile.") ? 0.8 : name.startsWith("hero.") ? 1.5 : name.startsWith("tour.") ? 10 : 2.5;
  return mb * 1e6;
}

/** Every file a chapter tab's data-clip names: site.js loads them later, so no src= shows them. */
export function dataClipFiles(html) {
  const out = [];
  for (const m of html.matchAll(/\sdata-clip="([^"]+)"/g)) {
    const clip = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
    for (const cut of [clip, clip.mobile]) {
      if (!cut) continue;
      out.push(cut.poster, ...cut.sources.map((s) => s.src));
    }
  }
  return out;
}

// ── The set of clips ────────────────────────────────────────────────────────

/** Every file media.json names, one row per language: { name, width?, height? } (a size for videos and posters). */
export function expectedFiles(media) {
  const rows = new Map();
  const add = (path, size) => {
    for (const lang of ["cs", "en"]) {
      const name = path.replace("{lang}", lang).replace(/^\/video\//, "");
      rows.set(name, { name, ...size });
    }
  };
  for (const clip of Object.values(media.clips)) {
    for (const cut of [clip, clip.mobile && { ...clip, ...clip.mobile }]) {
      if (!cut) continue;
      add(cut.poster, { width: cut.width, height: cut.height });
      for (const s of cut.sources) add(s.src, { width: cut.width, height: cut.height });
    }
    for (const track of clip.tracks || []) add(track.src);
  }
  return [...rows.values()];
}

/**
 * A clip file's bytes as the set's hash sees them. Text files with LF line ends: git on
 * Windows (core.autocrlf) checks them out with CRLF, and a version must not depend on the
 * machine (the same clips gave 1f8c0d8ce6 on a Mac and 9f4b197659 on a PC, 2. 11. 2026).
 * Latin-1 there and back keeps every other byte as it is.
 */
export function clipBytes(path) {
  const bytes = readFileSync(path);
  return /\.(vtt|json)$/.test(path) ? Buffer.from(bytes.toString("latin1").replace(/\r\n/g, "\n"), "latin1") : bytes;
}

/** A short hash of the set: a new cut of any file is a new address for all of them. Only the files media.json names count. */
export function setVersion(source, media) {
  const hash = createHash("sha256");
  for (const name of expectedFiles(media).map((f) => f.name).sort()) hash.update(name).update(clipBytes(join(source, name)));
  return hash.digest("hex").slice(0, 10);
}

/** The work folder of tools/media-use.mjs, while a run is going or after one was interrupted. */
export const MEDIA_WORK = ".media-use";

/** The other process that holds media:use's lock when it is still alive, else null. */
export function mediaUseOwner(root = ROOT) {
  let pid;
  try {
    pid = Number(readFileSync(join(root, MEDIA_WORK, "pid"), "utf8"));
  } catch {
    return null;
  }
  if (!pid || pid === process.pid) return null;
  try {
    process.kill(pid, 0);
    return pid;
  } catch (err) {
    return err.code === "EPERM" ? pid : null;
  }
}

/**
 * What is wrong with the clips on disk for a release. /video/* is cached as immutable, so a
 * clip changed without media:use keeps its address and returning visitors never get it.
 * duringMediaUse: the check media:use runs on itself, while its own work folder exists.
 */
export function videoSetProblems(media, { root = ROOT, duringMediaUse = false } = {}) {
  const problems = [];
  const video = join(root, "public/video");
  if (!duringMediaUse && existsSync(join(root, MEDIA_WORK))) {
    const owner = mediaUseOwner(root);
    problems.push(owner ? `${MEDIA_WORK}: a media:use is running (process ${owner}), wait for it and check again` : `${MEDIA_WORK}: left by an interrupted media:use, run npm run media:use -- --recover`);
  }
  if (existsSync(join(video, ".incoming"))) problems.push("public/video/.incoming: left by an interrupted media:use, run npm run media:use -- --recover");
  const missing = expectedFiles(media).filter((f) => !existsSync(join(video, f.name)));
  if (missing.length) return [...problems, `public/video: ${missing.length} files of the set are missing, for example ${missing[0].name}`];
  const version = setVersion(video, media);
  if (media.version !== version) problems.push(`public/video: the files hash to ${version}, media.json says version ${media.version}: a clip changed without npm run media:use`);
  return problems;
}

/**
 * Rules that hide a line carrying a recording date, which the HTML alone cannot show. The chapters' caption on a
 * phone may go: the hero's line says the same, with the date (lead, etapa 4), and the check above sees to that.
 */
export function hiddenDates(css) {
  const out = [];
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]*\b(?:hero__caption|figcaption)\b[^{}]*)\{[^}]*\bdisplay:\s*none/g)) {
    const selector = m[1].trim().replace(/\s+/g, " ");
    if (selector !== ".chapters-video .video figcaption") out.push(selector);
  }
  return out;
}

/**
 * Checks a site. files: Map "public/…" -> content|null; redirects: the Worker's
 * 301 map; workerFirst: wrangler.toml run_worker_first. Returns { errors, warnings }.
 */
export function checkSite(files, { redirects = {}, workerFirst = [], origin = "https://talentradar.eu", release = false } = {}) {
  const errors = [];
  const warnings = [];
  // --release: what may stay while building is a blocker before the merge
  const unfinished = (msg) => (release ? errors : warnings).push(msg);
  const pages = [...files.keys()].filter((p) => p.endsWith(".html")).sort();
  const at = (path) => answer(path, files, redirects, workerFirst);
  const ids = new Map();
  const htmlOf = new Map(pages.map((p) => [p, content(files, p)]));
  for (const [p, html] of htmlOf) ids.set(p, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));

  const mustBe200 = (url, where) => {
    if (!url.startsWith(origin)) return errors.push(`${where}: ${url} is not on ${origin}`);
    const r = at(url.slice(origin.length) || "/");
    if (r.status !== 200) errors.push(`${where}: ${url} answers ${r.status}${r.location ? ` -> ${r.location}` : ""}, not 200`);
  };

  const indexable = [];
  for (const [page, html] of htmlOf) {
    const noindex = /<meta name="robots" content="noindex">/.test(html);
    const lang = (html.match(/<html lang="([a-z]{2})"/) || [])[1];
    if (!lang) errors.push(`${page}: no <html lang>`);
    if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${page}: no <title>`);
    if (!/<meta name="description" content="[^"]+">/.test(html)) errors.push(`${page}: no description`);
    if (/cdn\.tailwindcss\.com/.test(html)) errors.push(`${page}: loads cdn.tailwindcss.com`);
    for (const m of html.matchAll(/<script\b[^>]*\ssrc="([^"]+)"/g)) {
      if (/^(https?:)?\/\//.test(m[1]) && !ALLOWED_SCRIPT_HOSTS.some((h) => m[1].includes(h))) errors.push(`${page}: third-party script ${m[1]}`);
    }
    for (const m of html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)) {
      const href = attr(m[0], "href");
      if (href && /^(https?:)?\/\//.test(href)) errors.push(`${page}: third-party stylesheet ${href}`);
    }
    for (const m of html.matchAll(/<img\b[^>]*>/g)) {
      for (const a of ["alt", "width", "height"]) if (attr(m[0], a) === null) errors.push(`${page}: <img> without ${a}: ${m[0].slice(0, 80)}`);
      // an empty alt is fine only for an image hidden from assistive tech on purpose (the logo next to its name)
      if (attr(m[0], "alt") === "" && attr(m[0], "aria-hidden") !== "true") unfinished(`${page}: <img> with an empty alt: ${m[0].slice(0, 80)}`);
    }
    for (const m of html.matchAll(/\sstyle="([^"]*)"/g)) {
      for (const s of smallFonts(m[1], `${page} style`, {})) errors.push(`${s.where}: font-size ${s.value} (${s.px}px) < 12px`);
    }
    // Places still waiting for Kryštof and unfilled {variables} of the text map never reach a page
    if (/\[Kryštof/.test(html)) errors.push(`${page}: contains a [Kryštof…] placeholder`);
    for (const m of html.matchAll(/\{(demo\.[a-z_0-9]+|c\d\.[a-z_0-9]+|clip\.[a-z_]+|t\d|as_of|minutes|date)\}/g)) errors.push(`${page}: unfilled variable {${m[1]}}`);
    for (const src of dataClipFiles(html)) {
      const r = at(src.split("?")[0]);
      if (r.status !== 200) errors.push(`${page}: data-clip file ${src} answers ${r.status}`);
    }
    // the captions that promise a recording date have it, and the tour's chapters are all there
    for (const m of html.matchAll(/<figure class="video video--(how\d|ats|tour)\b[\s\S]*?<\/figure>/g)) {
      // within this figure only: the next figure's date must not count for it
      const caption = (m[0].match(/<figcaption>([\s\S]*?)<\/figcaption>/) || [])[1] || "";
      if (!/20\d\d/.test(caption)) unfinished(`${page}: the caption of the ${m[1]} video has no recording date`);
    }
    // the hero's date is in the line under it, one version per screen, and each of them has to have it
    if (/video--hero\b/.test(html)) {
      const line = (html.match(/class="[^"]*\bhero__caption\b[^"]*">([\s\S]*?)<\/p>/) || [])[1] || "";
      const on = (cls) => (line.match(new RegExp(`<span class="${cls}">([\\s\\S]*?)</span>`)) || [])[1];
      const shared = line.replace(/<span class="(?:d-only|m-only)">[\s\S]*?<\/span>/g, "");
      for (const [cls, screen] of [["d-only", "wide screen"], ["m-only", "phone"]]) {
        if (!/20\d\d/.test(`${shared} ${on(cls) || ""}`)) unfinished(`${page}: the line under the hero video has no recording date on a ${screen}`);
      }
    }
    if (/video--tour\b/.test(html)) {
      const chapters = (html.match(/class="tour-chapter"/g) || []).length;
      if (chapters !== 5) unfinished(`${page}: the tour has ${chapters} chapter buttons, not 5`);
    }
    if (/ukazka-v0/.test(html)) unfinished(`${page}: uses the placeholder video ukazka-v0 (media replaces it before merging)`);
    if (/\[TEXT\]/.test(html)) unfinished(`${page}: contains [TEXT] placeholders`);
    if (/lorem/i.test(html)) unfinished(`${page}: contains lorem ipsum`);

    // internal links and assets answer 200 at exactly that address
    for (const m of html.matchAll(/\s(href|src|poster)="([^"]+)"/g)) {
      const raw = m[2];
      if (!raw.startsWith("/") || raw.startsWith("//")) continue;
      const [pathQ, hash] = raw.split("#");
      const path = pathQ.split("?")[0];
      if (path.startsWith("/api/")) continue;
      const r = at(path);
      if (r.status !== 200) {
        errors.push(`${page}: link ${raw} answers ${r.status}${r.location ? ` -> ${r.location}` : ""}`);
        continue;
      }
      if (hash && r.file && r.file.endsWith(".html") && !ids.get(r.file).has(hash)) errors.push(`${page}: link ${raw}: no id="${hash}" there`);
    }
    for (const m of html.matchAll(/\shref="#([^"]+)"/g)) {
      if (!ids.get(page).has(m[1])) errors.push(`${page}: anchor #${m[1]} has no target`);
    }

    if (noindex) continue;
    const canonical = (html.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
    if (!canonical) {
      errors.push(`${page}: no canonical`);
      continue;
    }
    mustBe200(canonical, `${page} canonical`);
    const self = at(canonical.slice(origin.length) || "/");
    if (self.file && self.file !== page) errors.push(`${page}: canonical ${canonical} serves ${self.file}`);
    indexable.push({ page, canonical, lang });
    const alts = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([a-z-]+)" href="([^"]+)">/g)].map((m) => [m[1], m[2]]));
    if (alts[lang] !== canonical) errors.push(`${page}: hreflang="${lang}" is not its own canonical`);
    if (!alts["x-default"]) errors.push(`${page}: no hreflang x-default`);
    for (const [l, url] of Object.entries(alts)) {
      mustBe200(url, `${page} hreflang ${l}`);
      if (l === "x-default") continue;
      const other = at(url.slice(origin.length) || "/");
      if (!other.file) continue;
      const back = htmlOf.get(other.file) || "";
      if (!back.includes(`<link rel="alternate" hreflang="${lang}" href="${canonical}">`)) errors.push(`${page}: ${other.file} does not link back with hreflang="${lang}"`);
      const otherLang = (back.match(/<html lang="([a-z]{2})"/) || [])[1];
      if (otherLang !== l) errors.push(`${page}: hreflang ${l} points at a page in lang="${otherLang}"`);
    }
  }

  // the videos stay inside their budgets (only files really on disk: a test's made-up page has none)
  for (const path of files.keys()) {
    const budget = videoBudget(path);
    const disk = join(ROOT, path);
    if (budget && existsSync(disk) && statSync(disk).size > budget) unfinished(`${path}: ${(statSync(disk).size / 1e6).toFixed(2)} MB is over its budget of ${budget / 1e6} MB`);
  }

  // sitemap: exactly the indexable pages, each at an address that answers 200
  if (files.has("public/sitemap.xml")) {
    const xml = content(files, "public/sitemap.xml");
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const loc of locs) mustBe200(loc, "sitemap.xml");
    for (const m of xml.matchAll(/hreflang="[^"]+" href="([^"]+)"/g)) mustBe200(m[1], "sitemap.xml alternate");
    const want = indexable.map((p) => p.canonical).sort();
    const got = [...locs].sort();
    for (const u of want) if (!got.includes(u)) errors.push(`sitemap.xml: missing ${u}`);
    for (const u of got) if (!want.includes(u)) errors.push(`sitemap.xml: ${u} is not an indexable page`);
  } else {
    errors.push("public/sitemap.xml missing");
  }

  // CSS: no font-size under 12 px; text tokens readable on their surfaces
  for (const path of [...files.keys()].filter((p) => p.endsWith(".css"))) {
    const css = content(files, path);
    for (const s of smallFonts(css, path)) errors.push(`${s.where}: font-size ${s.value} (${s.px}px) < 12px`);
    for (const selector of hiddenDates(css)) unfinished(`${path}: ${selector} hides a recording date from view`);
    const tokens = tokensOf(css);
    const hex = (name) => {
      let v = tokens[name];
      for (let i = 0; i < 5 && v; i++) {
        const m = /^var\((--[\w-]+)\)$/.exec(v);
        if (!m) break;
        v = tokens[m[1]];
      }
      return /^#[0-9a-f]{6}$/i.test(v || "") ? v : null;
    };
    for (const [fg, bg] of CONTRAST_PAIRS) {
      if (!hex(fg) || !hex(bg)) {
        // a pair this check cannot read (a renamed token) must not pass silently
        errors.push(`${path}: contrast pair ${fg} on ${bg}: token missing or not a #rrggbb value`);
        continue;
      }
      const ratio = contrast(hex(fg), hex(bg));
      if (ratio < 4.5) errors.push(`${path}: ${fg} on ${bg} contrast ${ratio.toFixed(2)} < 4.5`);
    }
  }
  return { errors, warnings };
}

/** run_worker_first from wrangler.toml. */
export function workerFirstPatterns() {
  const toml = readFileSync(join(ROOT, "wrangler.toml"), "utf8");
  const m = toml.match(/run_worker_first\s*=\s*\[([^\]]*)\]/);
  return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { REDIRECTS } = await import("../worker-routes.gen.js");
  // node tools/check-site.mjs --release (npm run check:release): unfinished things are errors
  const release = process.argv.includes("--release");
  const { errors, warnings } = checkSite(diskFiles(), { redirects: REDIRECTS, workerFirst: workerFirstPatterns(), release });
  if (release) {
    const media = JSON.parse(readFileSync(join(ROOT, "src/data/media.json"), "utf8"));
    errors.push(...videoSetProblems(media, { duringMediaUse: process.argv.includes("--during-media-use") }));
  }
  for (const w of warnings) console.warn(`warning: ${w}`);
  for (const e of errors) console.error(`error: ${e}`);
  console.log(`${errors.length} errors, ${warnings.length} warnings`);
  process.exit(errors.length ? 1 : 0);
}
