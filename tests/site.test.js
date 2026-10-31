// The built site: public/ is up to date with src/, the build is deterministic,
// both language layouts (Czech at / or English at /) hold together, every old
// address lands on a page, and the trial form still speaks the Worker's contract.
// Run with `npm test` (Node 20+, no dependencies).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { brandify, buildSite, checkKeys, compareWithDisk, fillText, legacyRedirects, listItems, loadSite, plural, price, routes, siteVars } from "../build.mjs";
import { clipFor, clipKey } from "../src/js/media.js";
import { demoStats } from "../tools/demo-stats.mjs";
import { answer, checkSite, minPx, siteFiles, smallFonts, workerFirstPatterns } from "../tools/check-site.mjs";
import { REDIRECTS } from "../worker-routes.gen.js";
import worker from "../worker.js";
import { demoPayload, demoResult, MAX_FILE_BYTES } from "../src/js/demo-form.js";

const ORIGIN = "https://talentradar.eu";
const SLUGS = { "the-4-day-latency-gap": "prvni-dny-po-vypsani-pozice", "anatomy-of-stale-roles": "dlouho-otevrene-pozice", "hidden-cost-of-dead-vacancies": "kolik-stoji-mrtve-inzeraty" };

const built = (overrides) => buildSite(loadSite(overrides));
const html = (files, path) => String(files.get(path));

// ── Build ───────────────────────────────────────────────────────────────────

test("public/ is what node build.mjs makes from src/ (no forgotten build)", () => {
  const problems = compareWithDisk(built());
  assert.deepEqual(problems, [], `run node build.mjs: ${JSON.stringify(problems)}`);
});

test("two builds give the same bytes", () => {
  const a = built();
  const b = built();
  assert.deepEqual([...a.keys()], [...b.keys()]);
  for (const [k, v] of a) assert.equal(b.get(k), v, k);
});

test("an unknown i18n key or token fails the build instead of reaching the page", () => {
  const site = loadSite();
  site.templates["pages/404"] += "{{t.no.such.key}}";
  assert.throws(() => buildSite(site), /unknown i18n key/);
  const site2 = loadSite();
  site2.templates["pages/404"] += "{{nonsense:1}}";
  assert.throws(() => buildSite(site2), /unknown token/);
});

test("a key in one dictionary only fails the build", () => {
  assert.throws(() => checkKeys({ cs: { a: "x", nav: { extra: "jen česky" } }, en: { a: "x", nav: {} } }), /nav.extra is in cs.json but not in en.json/);
  assert.doesNotThrow(() => checkKeys(loadSite().i18n));
});

test("brandify: two-tone name in headings only, Czech forms included, attributes and running text untouched", () => {
  const out = brandify('<h2 title="TalentRadar">S TalentRadarem</h2><p>TalentRadar v textu</p><span data-brand>TalentRadar</span>');
  assert.match(out, /<h2 title="TalentRadar">S <span class="brand"><span class="brand__a">Talent<\/span><span class="brand__b">Radarem<\/span><\/span><\/h2>/);
  assert.match(out, /<p>TalentRadar v textu<\/p>/);
  assert.match(out, /<span data-brand><span class="brand">/);
  assert.equal(brandify(out), out, "running it twice changes nothing");
});

// ── Static checks of both language layouts ──────────────────────────────────

for (const defaultLang of ["cs", "en"]) {
  test(`defaultLang "${defaultLang}": links, canonicals, hreflang pairs, sitemap and fonts pass the site check`, () => {
    const site = loadSite({ defaultLang });
    const files = buildSite(site);
    const { errors, warnings } = checkSite(siteFiles(files), { redirects: legacyRedirects(site), workerFirst: workerFirstPatterns() });
    assert.deepEqual(errors, []);
    if (defaultLang === "cs" && warnings.length) console.log(`site check warnings:\n  ${warnings.join("\n  ")}`);
  });
}

test('defaultLang "cs": Czech at /, English at /en/, Czech article slugs', () => {
  const files = built();
  assert.match(html(files, "public/index.html"), /<html lang="cs"/);
  assert.match(html(files, "public/en/index.html"), /<html lang="en"/);
  assert.match(html(files, "public/cenik.html"), /<link rel="alternate" hreflang="en" href="https:\/\/talentradar\.eu\/en\/pricing">/);
  assert.match(html(files, "public/en/pricing.html"), /<link rel="alternate" hreflang="cs" href="https:\/\/talentradar\.eu\/cenik">/);
  for (const [en, cs] of Object.entries(SLUGS)) {
    assert.ok(files.has(`public/blog/${cs}.html`), cs);
    assert.ok(files.has(`public/en/blog/${en}.html`), en);
    assert.match(html(files, `public/blog/${cs}.html`), /<html lang="cs"/);
  }
  assert.ok(files.has("public/404.html") && files.has("public/en/404.html"));
  assert.match(html(files, "public/404.html"), /<meta name="robots" content="noindex">/);
});

test('defaultLang "en": English at /, Czech at /cs/, hreflang, sitemap and old addresses follow', () => {
  const site = loadSite({ defaultLang: "en" });
  const files = buildSite(site);
  assert.match(html(files, "public/index.html"), /<html lang="en"/);
  assert.match(html(files, "public/cs/index.html"), /<html lang="cs"/);
  assert.ok(files.has("public/cs/cenik.html") && files.has("public/pricing.html"));
  assert.ok(files.has("public/cs/blog/dlouho-otevrene-pozice.html") && files.has("public/blog/anatomy-of-stale-roles.html"));
  assert.ok(files.has("public/cs/404.html") && files.has("public/404.html"));
  assert.match(html(files, "public/index.html"), /<link rel="alternate" hreflang="cs" href="https:\/\/talentradar\.eu\/cs\/">/);
  assert.match(html(files, "public/sitemap.xml"), /<loc>https:\/\/talentradar\.eu\/cs\/cenik<\/loc>/);
  const map = legacyRedirects(site);
  assert.equal(map["/cs"], "/cs/");
  assert.equal(map["/blog/anatomy-of-stale-roles-cs.html"], "/cs/blog/dlouho-otevrene-pozice");
  assert.equal(map["/blog/anatomy-of-stale-roles.html"], "/blog/anatomy-of-stale-roles");
  assert.ok(!("/blog/anatomy-of-stale-roles" in map), "a live page is never redirected");
  assert.ok(!("/cs/" in map));
  assert.equal(map["/gdpr.html"], "/gdpr", "the English privacy policy in either layout");
  assert.match(String(files.get("worker-routes.gen.js")), /defaultLang "en"/);
});

test("the redirect map never points at another redirect or at a missing page, and never moves a live page", () => {
  for (const defaultLang of ["cs", "en"]) {
    const site = loadSite({ defaultLang });
    const files = siteFiles(buildSite(site));
    const map = legacyRedirects(site);
    const live = new Set(routes(site).map((r) => r.path));
    for (const [from, to] of Object.entries(map)) {
      assert.ok(!live.has(from), `${defaultLang}: ${from} is a page`);
      assert.ok(!(to in map), `${defaultLang}: ${from} -> ${to} chains`);
      assert.equal(answer(to, files, map, workerFirstPatterns()).status, 200, `${defaultLang}: ${from} -> ${to}`);
    }
  }
});

// ── Old addresses through the Worker (the committed map) ────────────────────

const OLD = {
  "/cs": "/",
  "/cs/": "/",
  "/index.html": "/",
  // English, as the old gdpr.html was by default; the app links it for connector directories
  "/gdpr.html": "/en/gdpr",
  "/blog/index.html": "/blog/",
};
for (const [en, cs] of Object.entries(SLUGS)) {
  OLD[`/blog/${en}`] = `/en/blog/${en}`;
  OLD[`/blog/${en}.html`] = `/en/blog/${en}`;
  OLD[`/blog/${en}-cs`] = `/blog/${cs}`;
  OLD[`/blog/${en}-cs.html`] = `/blog/${cs}`;
}

test("the committed redirect map is for Czech at / and covers every old address", () => {
  assert.deepEqual(REDIRECTS, OLD);
});

for (const [from, to] of Object.entries(OLD)) {
  test(`old address ${from} -> 301 ${to}, which answers 200`, async () => {
    const assets = { fetch: async () => { throw new Error("an old address must not reach the assets"); } };
    const res = await worker.fetch(new Request(`${ORIGIN}${from}?utm_source=x`), { ASSETS: assets }, {});
    assert.equal(res.status, 301);
    assert.equal(res.headers.get("Location"), `${ORIGIN}${to}?utm_source=x`);
    assert.equal(answer(to, siteFiles(), REDIRECTS, workerFirstPatterns()).status, 200);
  });
}

test("old addresses that are files again are in run_worker_first, so they answer 301 and not the assets' 307", () => {
  const first = workerFirstPatterns();
  for (const from of Object.keys(OLD)) {
    const r = answer(from, siteFiles(), {}, []);
    if (r.status === 200 || r.status === 307) assert.ok(first.includes(from), `${from} needs run_worker_first`);
  }
  assert.ok(first.includes("/video/*"));
});

test("addresses the app and e-mails link to keep answering", () => {
  const files = siteFiles();
  for (const path of ["/img/email/logo-96.png", "/img/email/krystof-96.jpg", "/files/clients-template.csv", "/files/klienti-sablona.csv", "/logo.png", "/logo.jpg", "/favicon.ico", "/favicon.svg", "/img/og-banner.jpg", "/robots.txt", "/sitemap.xml"]) {
    assert.equal(answer(path, files, REDIRECTS, workerFirstPatterns()).status, 200, path);
  }
  const toml = readFileSync(new URL("../wrangler.toml", import.meta.url), "utf8");
  assert.match(toml, /directory = "public"/);
  // with not_found_handling the assets answer 404 themselves and old addresses never reach the Worker
  assert.doesNotMatch(toml, /^not_found_handling/m);
});

test("a page that is not there gets the 404 page of its language, with status 404; a missing file stays a plain 404", async () => {
  const seen = [];
  const assets = {
    fetch: async (req) => {
      const path = new URL(req.url).pathname;
      seen.push(path);
      if (path === "/404" || path === "/en/404") return new Response(`page ${path}`, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
      return new Response("plain", { status: 404 });
    },
  };
  const en = await worker.fetch(new Request(`${ORIGIN}/en/no-such-page`), { ASSETS: assets }, {});
  assert.equal(en.status, 404);
  assert.equal(await en.text(), "page /en/404");
  const cs = await worker.fetch(new Request(`${ORIGIN}/neni-tu/nic`), { ASSETS: assets }, {});
  assert.equal(cs.status, 404);
  assert.equal(await cs.text(), "page /404");
  const img = await worker.fetch(new Request(`${ORIGIN}/img/missing.png`), { ASSETS: assets }, {});
  assert.equal(img.status, 404);
  assert.equal(await img.text(), "plain");
  assert.deepEqual(seen, ["/en/no-such-page", "/en/404", "/neni-tu/nic", "/404", "/img/missing.png"]);
});

// ── Pages without JavaScript ────────────────────────────────────────────────

test("the Czech home page is Czech in plain HTML; the English one English", () => {
  const cs = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  assert.match(cs, /<title>TalentRadar: všechny otevřené pozice vašich firem<\/title>/);
  assert.match(cs, /<h1[^>]*>.*ATS řídí zakázky, které máte\./);
  assert.match(cs, /Každá agentura má vlastní oddělenou databázi/);
  const en = readFileSync(new URL("../public/en/index.html", import.meta.url), "utf8");
  assert.match(en, /<html lang="en"/);
  assert.match(en, /<meta name="description" content="TalentRadar watches/);
  assert.match(en, /<h1[^>]*>.*Your ATS runs the jobs you already have\./);
});

// ── The text map: variables, Kryštof's placeholders, prices ─────────────────

test("a sentence waiting for Kryštof or for a media value is left out whole; other sentences stay", () => {
  assert.equal(fillText("Provozovatelem je [Kryštof: jméno, IČO]. Data jsou [Kryštof: kde]. Každá agentura má vlastní databázi.", {}, "t"), "Každá agentura má vlastní databázi.");
  assert.equal(fillText("Ano. Stačí mi napsat. [Kryštof: od kdy změna platí a do kdy je zaplaceno.]", {}, "t"), "Ano. Stačí mi napsat.");
  assert.equal(fillText("Provozovatel: [Kryštof: jméno], IČO [Kryštof]", {}, "t"), "");
  assert.equal(fillText("Veřejné demo. Natočeno {clip.date}.", {}, "t"), "Veřejné demo.");
  assert.equal(fillText("{t1} Ráno: co je nového", {}, "t"), "Ráno: co je nového");
  assert.equal(fillText("{demo.companies} firem", { "demo.companies": "100" }, "t"), "100 firem");
  assert.throws(() => fillText("{demo.nope}", {}, "t"), /unknown variable \{demo\.nope\}/);
});

test("no page carries a [Kryštof…] placeholder, an unfilled variable or a [TEXT] marker", () => {
  for (const [path, content] of built()) {
    if (!path.endsWith(".html")) continue;
    assert.doesNotMatch(String(content), /\[Kryštof|\[TEXT\]|\{(demo|c\d|clip)\.[a-z_]+\}/, path);
  }
  const files = siteFiles(built());
  files.set("public/x.html", '<html lang="cs"><title>x</title><meta name="description" content="x"><meta name="robots" content="noindex"><p>[Kryštof: IČO] {demo.companies}</p></html>');
  const { errors } = checkSite(files, { redirects: REDIRECTS, workerFirst: workerFirstPatterns() });
  assert.ok(errors.some((e) => e.includes("[Kryštof…] placeholder")));
  assert.ok(errors.some((e) => e.includes("unfilled variable {demo.companies}")));
});

test("the demo numbers come from src/data/demo-stats.json and the chart data, formatted per language", () => {
  const site = loadSite();
  const cs = siteVars(site, "cs");
  const en = siteVars(site, "en");
  assert.equal(cs["demo.open_positions"], "1 382");
  assert.equal(en["demo.open_positions"], "1,382");
  assert.equal(cs["demo.as_of"], "31. 10. 2026");
  assert.equal(en["demo.as_of"], "31 Oct 2026");
  assert.equal(cs["c1.avg"], "44");
  assert.equal(cs["c2.share_45"], "24");
  assert.equal(cs["c2.n_45"], "99");
  assert.equal(cs["c3.jobscz_companies"], "55");
  const html = String(built().get("public/index.html"));
  assert.match(html, /1 382/);
  assert.doesNotMatch(html, /1 444/);
  assert.match(html, /Víc než polovina/);
});

test("one base for every demo number: the proof strip = roles in chart 3 = the total under chart 2", () => {
  const site = loadSite();
  const roles = site.charts["zdroje-pozic"].rows.reduce((a, r) => a + r.roles, 0);
  assert.equal(site.demoStats.open_positions, roles, "a visitor who adds up chart 3 gets the proof strip's number");
  assert.equal(siteVars(site, "cs")["c2.total"], siteVars(site, "cs")["demo.open_positions"]);
  const html = String(built().get("public/index.html"));
  const strip = html.slice(html.indexOf('class="proof"'), html.indexOf("</ul>", html.indexOf('class="proof"')));
  assert.match(strip, /1 382/);
});

test('"more than half" is shown only while the lower bound is over half (text map, ID 17)', () => {
  const site = loadSite();
  site.demoStats = { ...site.demoStats, companies_new_7d: 50 };
  assert.doesNotMatch(String(buildSite(site).get("public/index.html")), /Víc než polovina/);
});

test("demo-stats.json follows the inventory rules on a small feed", () => {
  const feed = {
    generated_at: "2026-10-31T11:04:57Z",
    scan: { at: "2026-10-31T11:00:00Z" },
    totals: { open: 7, core: 3 },
    companies: [{ id: 1 }, { id: 2 }, { id: 3 }],
    roles: [
      { co: 1, seen: "2026-10-20T05:00:00Z" }, { co: 1, seen: "2026-10-30T05:00:00Z" }, // new role this week
      { co: 2, seen: "2026-10-29T05:00:00Z" }, // first day under watch: not counted
      { co: 3, seen: "2026-10-01T05:00:00Z" }, // nothing new
    ],
    archived: [],
  };
  const s = demoStats(feed);
  assert.equal(s.open_positions, 4, "the roles in the list, the base of the charts (not totals.open)");
  assert.equal(s.totals_open, 7);
  assert.equal(s.companies, 3);
  assert.equal(s.companies_new_7d, 1);
  assert.equal(s.as_of, "2026-10-31");
});

test("the prices in the text map match src/data/plans.json (core/plans.py): monthly, yearly = 10 months, 12-month list price", () => {
  const site = loadSite();
  for (const lang of ["cs", "en"]) {
    const d = site.i18n[lang];
    [["solo", 1], ["pro", 2], ["scale", 3]].forEach(([tier, n]) => {
      const norm = (s) => s.replace(/\s/g, " ");
      assert.equal(norm(d[`pricing_t${n}_price`]), norm(price(site, lang, tier)), `${lang} pricing_t${n}_price`);
      assert.equal(norm(d[`pp_t${n}_price`]), norm(price(site, lang, tier)), `${lang} pp_t${n}_price`);
      assert.equal(norm(d[`pp_t${n}_price_year`]), norm(price(site, lang, tier, "year")), `${lang} pp_t${n}_price_year`);
      assert.ok(norm(d[`pp_t${n}_year_note`]).endsWith(norm(price(site, lang, tier, "year_list"))), `${lang} pp_t${n}_year_note`);
    });
  }
});

test("no Tailwind CDN and no third-party script on any page", () => {
  for (const [path, content] of built()) {
    if (!path.endsWith(".html")) continue;
    assert.doesNotMatch(String(content), /cdn\.tailwindcss\.com/, path);
    for (const m of String(content).matchAll(/<script\b[^>]*\ssrc="([^"]+)"/g)) assert.match(m[1], /^\/[^/]/, `${path}: ${m[1]}`);
  }
});

test("no font size under 12 px in the CSS, tokens and clamp() minimums included", () => {
  const css = readFileSync(new URL("../public/css/site.css", import.meta.url), "utf8");
  assert.deepEqual(smallFonts(css, "site.css"), []);
  assert.equal(minPx("clamp(0.7rem, 1vw, 1rem)", {}), 11.2);
  assert.deepEqual(smallFonts(".x{font-size:11px}", "t").map((s) => s.px), [11]);
  assert.deepEqual(smallFonts(":root{--fs-tiny:0.625rem;}.x{font-size:var(--fs-tiny);}", "t").length, 2);
});

test("the site check catches a broken link, a missing hreflang pair and a redirecting canonical", () => {
  const files = siteFiles(built());
  files.set("public/cenik.html", html(files, "public/cenik.html").replace('href="/blog/"', 'href="/blogg/"').replace('hreflang="en" href="https://talentradar.eu/en/pricing"', 'hreflang="en" href="https://talentradar.eu/en/pricing.html"'));
  const { errors } = checkSite(files, { redirects: REDIRECTS, workerFirst: workerFirstPatterns() });
  assert.ok(errors.some((e) => e.includes("/blogg/")), errors.join("\n"));
  assert.ok(errors.some((e) => e.includes("pricing.html answers 307")), errors.join("\n"));
});

// ── The trial form against the Worker ───────────────────────────────────────

test("the form on both home pages has the same fields as before", () => {
  for (const path of ["../public/index.html", "../public/en/index.html"]) {
    const page = readFileSync(new URL(path, import.meta.url), "utf8");
    const form = page.slice(page.indexOf('<form class="form" id="demo-form"'), page.indexOf("</form>"));
    for (const name of ["name", "email", "company", "clients", "website", "timestamp"]) assert.match(form, new RegExp(`name="${name}"`), `${path}: ${name}`);
    assert.match(form, /type="file" id="file-upload" accept="\.xlsx,\.xls,\.csv"/);
    assert.match(form, /<div class="hp" aria-hidden="true">/);
    for (const name of ["name", "email", "company"]) assert.match(form, new RegExp(`id="${name}" name="${name}" required`), `${path}: ${name} required`);
  }
});

test("the page's request body is the Worker's contract, and a filled form is accepted", async () => {
  const body = demoPayload({
    name: " Petra Svobodová ", email: "petra@agentura.cz", company: "Agentura", clients: "Tines, https://tines.com/careers", website: "",
    file: { name: "klienti.csv", data: "data:text/csv;base64,RmlybWEKVGluZXM=" }, lang: "cs", timezone: "Europe/Prague", timestamp: String(Date.now() - 9000), elapsedMs: 9000.4,
  });
  assert.deepEqual(Object.keys(body).sort(), ["clients", "company", "elapsedMs", "email", "fileData", "fileName", "lang", "name", "timestamp", "timezone", "website"]);
  assert.equal(body.name, "Petra Svobodová");
  assert.equal(body.elapsedMs, 9000);

  const store = new Map();
  const env = { TALENT_RADAR_KV: { async get(k) { return store.get(k) ?? null; }, async put(k, v) { store.set(k, v); } }, OFFLINE_DEV: "1" };
  const req = new Request(`${ORIGIN}/api/demo`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 200);
  assert.equal((await res.json()).success, true);
  const lead = JSON.parse([...store].find(([k]) => k.startsWith("lead:"))[1]);
  assert.equal(lead.timezone, "Europe/Prague");
  assert.equal(lead.lang, "cs");
  assert.ok([...store.keys()].some((k) => k.startsWith("leadfile:")));
});

test("the public copy of demo-form.js is the one the tests import", () => {
  const src = readFileSync(new URL("../src/js/demo-form.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const pub = readFileSync(new URL("../public/js/demo-form.js", import.meta.url), "utf8").replace(/\r\n/g, "\n");
  assert.equal(pub, src);
});

// ── Verdict of etapa 1, points 1–10 ─────────────────────────────────────────

test("release mode: placeholder video, [TEXT], lorem and an empty alt are errors, while building only warnings", () => {
  const files = siteFiles(built());
  files.set("public/x.html", '<html lang="cs"><title>x</title><meta name="description" content="x"><meta name="robots" content="noindex"><p>[TEXT] Lorem ipsum</p><img src="/logo.png" alt="" width="1" height="1"><video poster="/video/ukazka-v0.webp"></video></html>');
  const loose = checkSite(files, { redirects: REDIRECTS, workerFirst: workerFirstPatterns() });
  const strict = checkSite(files, { redirects: REDIRECTS, workerFirst: workerFirstPatterns(), release: true });
  for (const what of ["ukazka-v0", "[TEXT]", "lorem", "empty alt"]) {
    assert.ok(loose.warnings.some((w) => w.startsWith("public/x.html") && w.includes(what)), `warning ${what}`);
    assert.ok(strict.errors.some((e) => e.startsWith("public/x.html") && e.includes(what)), `error ${what}`);
  }
  assert.ok(!strict.errors.some((e) => e.includes("falcon.svg")), "the logo next to its name is aria-hidden, not an error");
});

test(".gitkeep files are not published (public/.assetsignore)", () => {
  const ignore = readFileSync(new URL("../public/.assetsignore", import.meta.url), "utf8");
  assert.match(ignore, /^\*\*\/\.gitkeep$/m);
  assert.equal(answer("/video/.gitkeep", siteFiles(), REDIRECTS, workerFirstPatterns()).status, 404);
});

test("render runs once: a text that contains {{…}} stays text and cannot pull in a template", () => {
  const site = loadSite();
  site.i18n.cs.nf_h1 = "Pozor na {{t.trial_gdpr_html}} a {{";
  const html = String(buildSite(site).get("public/404.html"));
  assert.match(html, /Pozor na \{\{t\.trial_gdpr_html\}\} a \{\{/);
});

test("brandify: a quoted '>' in a heading's attribute and data-brand-like names", () => {
  const out = brandify('<h2 title="a > b">TalentRadar</h2><span data-branding>TalentRadar</span><p data-brand="x">TalentRadaru</p>');
  assert.match(out, /<h2 title="a > b"><span class="brand">/);
  assert.match(out, /<span data-branding>TalentRadar<\/span>/, "data-branding is not data-brand");
  assert.match(out, /<p data-brand="x"><span class="brand"><span class="brand__a">Talent<\/span><span class="brand__b">Radaru<\/span>/);
});

test("Czech plural of a chart unit: 1 / 2–4 / 5+ (English: 1 / more)", () => {
  const forms = "otevřená pozice|otevřené pozice|otevřených pozic";
  assert.equal(plural("cs", 1, forms), "otevřená pozice");
  assert.equal(plural("cs", 3, forms), "otevřené pozice");
  assert.equal(plural("cs", 17, forms), "otevřených pozic");
  assert.equal(plural("cs", 0, forms), "otevřených pozic");
  assert.equal(plural("en", 1, "open role|open roles|open roles"), "open role");
  assert.equal(plural("en", 41, "open role|open roles|open roles"), "open roles");
  assert.match(String(built().get("public/index.html")), /366\+: 1 otevřená pozice/);
});

test("the recording date fills the captions once media sets it; until then the sentence is left out", () => {
  const before = String(built().get("public/index.html"));
  assert.doesNotMatch(before, /Natočeno/);
  const site = loadSite();
  site.media = { ...site.media, clip_date: "2026-11-02" };
  assert.match(String(buildSite(site).get("public/index.html")), /Natočeno 2\.\u00a011\.\u00a02026\./);
});

test("the trial form takes files up to 5 MB, as the page says", () => {
  assert.equal(MAX_FILE_BYTES, 5 * 1024 * 1024);
  const site = loadSite();
  assert.match(site.i18n.cs.trial_upload_types, /5 MB/);
  assert.match(site.i18n.en.form_err_file_large, /5 MB/);
});

test("the form's answer: success, the Worker's own refusal, and anything else as the generic message", async () => {
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  assert.deepEqual(await demoResult(json(200, { success: true }), "G"), { ok: true });
  assert.deepEqual(await demoResult(json(400, { error: "Vyplňte prosím jméno." }), "G"), { ok: false, message: "Vyplňte prosím jméno." });
  assert.deepEqual(await demoResult(json(429, { error: "Příliš mnoho požadavků." }), "G"), { ok: false, message: "Příliš mnoho požadavků." });
  assert.deepEqual(await demoResult(new Response("<html>Payload Too Large</html>", { status: 413 }), "G"), { ok: false, message: "G" });
  assert.deepEqual(await demoResult(new Response("Internal Server Error", { status: 500 }), "G"), { ok: false, message: "G" });
  assert.deepEqual(await demoResult(json(502, { error: "We couldn't register your request automatically." }), "G"), { ok: false, message: "G" });
  assert.deepEqual(await demoResult(new Response("", { status: 200 }), "G"), { ok: false, message: "G" });
});

// ── Verdict of etapa 2, round 2 ─────────────────────────────────────────────

test("without site.js the extra charts stay reachable: the summary hides only after the script has synced them", () => {
  const css = readFileSync(new URL("../public/css/site.css", import.meta.url), "utf8");
  assert.match(css, /\.charts__more\.is-synced > summary \{ display: none; \}/);
  // no rule hides the summary on the strength of .js (set before the module loads) or for everyone
  assert.doesNotMatch(css, /\.js \.charts__more > summary/);
  for (const m of css.matchAll(/([^{}]*charts__more[^{}]*summary[^{}]*)\{([^}]*)\}/g)) {
    if (/display:\s*none/.test(m[2])) assert.match(m[1], /is-synced/, `hidden by: ${m[1].trim()}`);
  }
  const html = String(built().get("public/index.html"));
  assert.match(html, /<details class="charts__more" data-charts-more>\s*<summary>Další data z dema \(2 grafy\)<\/summary>/);
});

test("chart 2: the 45+ count is every band of 45 days and more, 366+ included, and a band of 1 still has a visible column", () => {
  const site = loadSite();
  const rows = site.charts["stari-pozic"].rows;
  const from = (r) => parseInt(r.days, 10);
  const hi = rows.filter((r) => r.highlight).reduce((a, r) => a + r.roles, 0);
  const over45 = rows.filter((r) => from(r) >= 45).reduce((a, r) => a + r.roles, 0);
  assert.equal(hi, over45);
  assert.equal(siteVars(site, "cs")["c2.n_45"], String(over45));
  const html = String(built().get("public/index.html"));
  const fig = html.slice(html.indexOf('id="ch-stari-pozic"'), html.indexOf("</figure>", html.indexOf('id="ch-stari-pozic"')));
  // base: the y of M; top: the y the rounded corner reaches (Q x top)
  const heights = [...fig.matchAll(/class="chart__bar" d="M[\d.]+ ([\d.]+)V[\d.]+Q[\d.]+ ([\d.]+) /g)].map((m) => Number(m[1]) - Number(m[2]));
  assert.equal(heights.length, rows.length);
  for (const h of heights) assert.ok(h >= 3, `column ${h} units high`);
  assert.match(fig, /<p class="chart__ref"><a href="https:\/\/www\.shrm\.org\/[^"]+" rel="noopener">Běžná doba obsazení/, "the SHRM source is visible under the chart");
});

test("list items: a new item only at '. ' before a capital, never inside 's.r.o.' or a date", () => {
  assert.deepEqual(listItems("14 dní zdarma, bez platební karty. Prvních 5 agentur má první měsíc zdarma."), ["14 dní zdarma, bez platební karty", "Prvních 5 agentur má první měsíc zdarma"]);
  assert.deepEqual(listItems("Firma Acme s.r.o. a spol. platí od 1. 11. 2026. Druhá věta."), ["Firma Acme s.r.o. a spol. platí od 1. 11. 2026", "Druhá věta"]);
});

test("a chapter tab carries its whole clip, and the phone video gets the phone cut with every source", () => {
  const site = loadSite();
  site.media = JSON.parse(JSON.stringify(site.media));
  site.media.clips.how2 = {
    mode: "loop", width: 1600, height: 900, poster: "/video/v3.{lang}.webp",
    sources: [{ src: "/video/v3.{lang}.webm", type: "video/webm" }, { src: "/video/v3.{lang}.mp4", type: "video/mp4" }],
    mobile: { poster: "/video/v3-mobile.{lang}.webp", sources: [{ src: "/video/v3-mobile.{lang}.webm", type: "video/webm" }, { src: "/video/v3-mobile.{lang}.mp4", type: "video/mp4" }] },
  };
  const html = String(buildSite(site).get("public/index.html"));
  const unq = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  const clip = JSON.parse(unq(html.match(/id="tab-2"[^>]*data-clip="([^"]+)"/)[1]));
  assert.deepEqual(clipFor(clip, false).sources.map((s) => s.src), ["/video/v3.cs.webm", "/video/v3.cs.mp4"]);
  assert.deepEqual(clipFor(clip, true).sources.map((s) => s.src), ["/video/v3-mobile.cs.webm", "/video/v3-mobile.cs.mp4"]);
  assert.equal(clipFor(clip, true).poster, "/video/v3-mobile.cs.webp");
  assert.notEqual(clipKey(clipFor(clip, false)), clipKey(clipFor(clip, true)));
  // a chapter without a phone cut gives the phone video the desktop sources
  const tab1 = JSON.parse(unq(html.match(/id="tab-1"[^>]*data-clip="([^"]+)"/)[1]));
  assert.deepEqual(clipFor(tab1, true).sources, clipFor(tab1, false).sources);
});

test("the recommended plan comes first in the page and is put in the middle only visually from 760 px", () => {
  const html = String(built().get("public/index.html"));
  const brief = html.slice(html.indexOf('class="plans plans--brief"'), html.indexOf("</ul>", html.indexOf('class="plans plans--brief"')));
  assert.ok(brief.indexOf("plan--pick") < brief.indexOf("Solo Scout"), "Agency Pro before Solo Scout in the DOM");
  const css = readFileSync(new URL("../public/css/site.css", import.meta.url), "utf8");
  assert.match(css, /@media \(min-width: 760px\) \{\s*\.plans--brief > li:nth-child\(1\) \{ order: 2; \}/);
});

test("the contrast check fails on a token pair it cannot read instead of skipping it", () => {
  const files = siteFiles(built());
  const css = String(built().get("public/css/site.css")).replace("--mist: #AEB8CB;", "--mist-renamed: #AEB8CB;");
  files.set("public/css/site.css", css);
  const { errors } = checkSite(files, { redirects: REDIRECTS, workerFirst: workerFirstPatterns() });
  assert.ok(errors.some((e) => e.includes("contrast pair --mist on")), errors.join("\n"));
});

// ── Etapa 3: share images ───────────────────────────────────────────────────

/** Width and height of a baseline/progressive JPEG from its SOF marker. */
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

test("every page shares the image of its language: an existing 1200x630 JPEG under 150 kB, with size and alt", () => {
  const files = built();
  for (const [path, content] of files) {
    if (!path.endsWith(".html")) continue;
    const html = String(content);
    const lang = html.match(/<html lang="([a-z]{2})"/)[1];
    const og = html.match(/<meta property="og:image" content="https:\/\/talentradar\.eu(\/img\/og-([a-z]{2})\.jpg)">/);
    assert.ok(og, `${path}: og:image`);
    assert.equal(og[2], lang, `${path}: og:image in the page's language`);
    assert.match(html, new RegExp(`<meta name="twitter:image" content="https://talentradar\\.eu${og[1].replace(/\./g, "\\.")}">`), `${path}: twitter:image`);
    assert.match(html, /<meta property="og:image:width" content="1200">/);
    assert.match(html, /<meta property="og:image:height" content="630">/);
    assert.match(html, /<meta property="og:image:alt" content="[^"]+">/);
    const img = readFileSync(new URL(`../public${og[1]}`, import.meta.url));
    assert.deepEqual(jpegSize(img), { width: 1200, height: 630 }, og[1]);
    assert.ok(img.length <= 150 * 1024, `${og[1]}: ${img.length} bytes`);
  }
});

test("the old share image stays: shared links and the app may still point at it", () => {
  assert.ok(readFileSync(new URL("../public/img/og-banner.jpg", import.meta.url)).length > 0);
});
