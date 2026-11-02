// Etapa 4a (the phone layout, lead 1. 11. 2026): Czech no-break spaces, the "book a demo" address,
// the operator line, one main button per block, no placeholders anywhere in the output, the tour's
// chapter buttons once the clip has chapter times, and the phone charts.
// Run with `npm test` (Node 20+, no dependencies).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildSite, callHref, loadSite, nbspCs, nbspCsHtml } from "../build.mjs";

const NBSP = " ";
const built = (overrides) => buildSite(loadSite(overrides));
const css = () => readFileSync(new URL("../public/css/site.css", import.meta.url), "utf8");
/** The text of an HTML page as a reader sees it: no tags, no script or style content, entities as they are. */
const visibleText = (html) =>
  html
    .replace(/<(script|style|code|pre|textarea|title|desc)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, "\n");

// ── Czech: no line ends on a one-letter word ───────────────────────────────

test("nbspCs: a no-break space after v, k, s, z, o, u, a, i (either case), both in 'a v Praze', never inside a word", () => {
  assert.equal(nbspCs("Pozice v Praze a u klientů"), `Pozice v${NBSP}Praze a${NBSP}u${NBSP}klientů`);
  assert.equal(nbspCs("a v Praze"), `a${NBSP}v${NBSP}Praze`);
  assert.equal(nbspCs("V Dublinu (s kolegy) i jinde"), `V${NBSP}Dublinu (s${NBSP}kolegy) i${NBSP}jinde`);
  assert.equal(nbspCs("„A teď?“ K tomu"), `„A${NBSP}teď?“ K${NBSP}tomu`);
  // not in a word, not at the end, not before a line end
  assert.equal(nbspCs("vozík kolo sova"), "vozík kolo sova");
  assert.equal(nbspCs("jen a"), "jen a");
  assert.equal(nbspCs("Excel, CSV"), "Excel, CSV");
});

test("nbspCsHtml: only text nodes change, never attributes, URLs, comments, code, pre, script or style", () => {
  const src =
    '<p title="a v b" data-x="k s"><a href="/a b?q=v x">v Praze</a> a <code>a v b</code></p>' +
    "<pre>s z\n o u</pre><script>var a = 'v x';</script><style>.a v{}</style><!-- a v b --><textarea>i k</textarea><p>i k</p>";
  const out = nbspCsHtml(src);
  assert.match(out, /title="a v b" data-x="k s"/);
  assert.match(out, /href="\/a b\?q=v x"/);
  // a one-letter word right before an inline element binds to it too ("v <a>zásadách</a>")
  assert.match(out, new RegExp(`>v${NBSP}Praze</a> a${NBSP}<code>a v b</code>`));
  assert.equal(nbspCsHtml("najdete v <a href=\"/x\">zásadách</a>. Konec a</p><p>Nový"), `najdete v${NBSP}<a href="/x">zásadách</a>. Konec a</p><p>Nový`);
  assert.match(out, /<pre>s z\n o u<\/pre>/);
  assert.match(out, /<script>var a = 'v x';<\/script>/);
  assert.match(out, /<style>\.a v\{\}<\/style>/);
  assert.match(out, /<!-- a v b -->/);
  assert.match(out, /<textarea>i k<\/textarea>/);
  assert.match(out, new RegExp(`<p>i${NBSP}k</p>`));
});

test("no Czech page has a line that can end on a one-letter word; the English pages keep plain spaces", () => {
  const files = built();
  let czech = 0;
  for (const [path, content] of files) {
    if (!path.endsWith(".html")) continue;
    const html = String(content);
    const lang = html.match(/<html lang="([a-z]+)"/)[1];
    const text = visibleText(html.slice(html.indexOf("<body")));
    if (lang === "cs") {
      czech++;
      const bad = text.match(/(?:^|[\s(„])[vkszouiaVKSZOUIA] (?=\S)/gm);
      assert.equal(bad, null, `${path}: ${bad && bad.slice(0, 5).map((s) => JSON.stringify(s)).join(", ")}`);
    }
  }
  assert.ok(czech >= 9, "every Czech page was checked (home, pricing, demo, blog, 3 articles, GDPR, 404)");
  // English: "a" is an article, the rule is Czech only
  assert.match(visibleText(String(files.get("public/en/index.html"))), /in a while/);
  // the e-mail subject in a mailto: link keeps plain spaces (%20, not %C2%A0)
  const home = String(files.get("public/index.html"));
  assert.doesNotMatch(home, /mailto:[^"]*%C2%A0/);
});

test("Czech no-break spaces never reach an attribute, <title>, a meta tag or JSON-LD (lead, etapa 4a kolo 2)", () => {
  const ONE = /[vkszouiaVKSZOUIA] /;
  let checked = 0;
  for (const [path, content] of built()) {
    if (!path.endsWith(".html")) continue;
    const html = String(content);
    if (!/<html lang="cs"/.test(html)) continue;
    checked++;
    // every attribute value of every tag
    for (const tag of html.match(/<[a-z][^>]*>/gi)) {
      for (const [, value] of tag.matchAll(/=\s*"([^"]*)"/g)) assert.doesNotMatch(value, ONE, `${path}: attribute in ${tag.slice(0, 80)}`);
    }
    for (const m of html.matchAll(/<title>([\s\S]*?)<\/title>/g)) assert.doesNotMatch(m[1], ONE, `${path}: <title>${m[1]}`);
    for (const m of html.matchAll(/<desc\b[^>]*>([\s\S]*?)<\/desc>/g)) assert.doesNotMatch(m[1], ONE, `${path}: <desc>`);
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) assert.doesNotMatch(m[1], ONE, `${path}: JSON-LD`);
  }
  assert.ok(checked >= 9);
  // the text of the page still has them (the other test checks every line)
  assert.match(String(built().get("public/index.html")), /otevřených 45 a víc dní/);
  // nor does the page pass touch SVG names
  assert.equal(nbspCsHtml("<svg><title>a v b</title><desc>o u</desc></svg><p>a v</p>"), "<svg><title>a v b</title><desc>o u</desc></svg><p>a v</p>");
});

test("the Czech footer keeps the English slogan, as the English one does (Kryštof 22. 10., DESIGN_PRAVIDLA §2)", () => {
  for (const path of ["public/index.html", "public/en/index.html", "public/cenik.html"]) {
    assert.match(String(built().get(path)), /<p class="site-footer__slogan" lang="en">Spend time closing, <span>not searching\.<\/span><\/p>/, path);
  }
});

test("texts site.js writes into a Czech page carry the no-break spaces too (as characters in the JSON, not entities)", () => {
  const html = String(built().get("public/index.html"));
  const json = JSON.parse(html.match(/<script type="application\/json" id="i18n">([\s\S]*?)<\/script>/)[1]);
  assert.match(json.form_state_success_s2, /firem a spustíme/);
  assert.doesNotMatch(html.match(/<script type="application\/json" id="i18n">[\s\S]*?<\/script>/)[0], /&nbsp;|\\u00a0/);
  assert.equal(json.form_err_name_short, "Zadejte prosím celé jméno.");
  assert.equal(json.form_err_company_short, "Zadejte prosím celý název agentury.");
  const en = JSON.parse(String(built().get("public/en/index.html")).match(/<script type="application\/json" id="i18n">([\s\S]*?)<\/script>/)[1]);
  assert.doesNotMatch(Object.values(en).join(" "), / [a-z]/, "English keeps plain spaces");
});

test("wide screens: under the age chart the caption and the 'why' read as one paragraph, without saying 45 days twice", () => {
  const html = String(built().get("public/index.html")).split(" ").join(" ");
  const start = html.indexOf('id="ch-stari-pozic"');
  const fig = html.slice(start, html.indexOf("</figure>", start));
  const caption = fig.match(/<p class="chart__caption">([\s\S]*?)<\/p>/)[1];
  assert.match(caption, /visí 45 a víc dní, tedy na hranici[\s\S]*Někde jde o průběžný nábor, jinde firma místo nemůže obsadit\. V obou případech má smysl se ozvat\./);
  assert.equal((caption.match(/45 a víc dní/g) || []).length, 1, "the caption says it once");
  assert.doesNotMatch(fig, /Inzerát visí/);
  // the note under it counts from the data, never typed in
  assert.match(fig, /Počítáme jen 409 z 1 382 pozic, u kterých firma uvádí datum zveřejnění/);
  const site = loadSite();
  site.charts = JSON.parse(JSON.stringify(site.charts));
  site.charts["stari-pozic"].rows[0].roles += 10;
  assert.match(String(buildSite(site).get("public/index.html")).split(" ").join(" "), /Počítáme jen 419 z 1 382 pozic/);
});

// ── Placeholders, the call link, the operator ─────────────────────────────

test("nothing built carries a [Kryštof…] placeholder or a [TEXT] marker: pages, scripts, the sitemap, the Worker's routes", () => {
  for (const [path, content] of built()) {
    if (typeof content !== "string" && !(content instanceof String)) continue;
    assert.doesNotMatch(String(content), /\[Kryštof|\[TEXT/, path);
  }
  // FAQ q7 still makes sense without the operator's details (lead, etapa 4a)
  const cs = String(built().get("public/index.html"));
  assert.match(cs, /TalentRadar provozuje jeho zakladatel Kryštof Pejša/);
});

test("'book a demo' goes to config.callUrl; while it is empty, to an e-mail with the call's subject", () => {
  const empty = built({ callUrl: "" });
  const home = String(empty.get("public/index.html"));
  const subject = encodeURIComponent("Krátký hovor o TalentRadaru");
  const mail = `mailto:krystof@talentradar.eu?subject=${subject}`;
  assert.ok(home.includes(`href="${mail}">Domluvit 15minutovou ukázku</a>`), "hero, menu, story");
  assert.ok(home.includes(`href="${mail}">Ukázka 15${NBSP}min</a>`), "the bottom bar");
  const en = String(empty.get("public/en/index.html"));
  assert.ok(en.includes(`subject=${encodeURIComponent("A short call about TalentRadar")}">Book a 15-minute demo</a>`));

  const url = "https://calendar.app.google/abc123";
  const set = built({ callUrl: url });
  for (const path of ["public/index.html", "public/en/index.html", "public/cenik.html", "public/blog/index.html"]) {
    const page = String(set.get(path));
    assert.ok(page.includes(`href="${url}"`), path);
    assert.doesNotMatch(page, /subject=Kr%C3%A1tk%C3%BD|subject=A%20short%20call/, `${path}: no e-mail fallback left once callUrl is set`);
  }
  const site = loadSite({ callUrl: "  " });
  assert.match(callHref(site, { lang: "cs", where: "t", vars: {}, dict: site.i18n.cs }), /^mailto:/, "blank counts as empty");
});

test("the operator line shows only the filled items, and nothing at all while they are empty", () => {
  const none = String(built().get("public/index.html"));
  assert.doesNotMatch(none, /class="operator/);
  assert.doesNotMatch(none, /Provozovatel:/);
  const some = built({ operator: { name: "Kryštof Pejša", id: "12345678", address: "" } });
  const cs = String(some.get("public/index.html"));
  assert.match(cs, /<p class="operator operator--footer"><span>Provozovatel: Kryštof Pejša<\/span> · <span>IČO: 12345678<\/span><\/p>/);
  assert.match(cs, /<p class="operator operator--faq">/);
  assert.doesNotMatch(cs, /Sídlo:/);
  assert.match(String(some.get("public/en/index.html")), /<span>Operator: Kryštof Pejša<\/span> · <span>Company ID: 12345678<\/span>/);
});

// ── One main button per block (direction C 3.2, lead etapa 4a) ─────────────

test("every block of every page has at most one main button; the bar, the menu and dialogs are their own layers", () => {
  for (const [path, content] of built()) {
    if (!path.endsWith(".html")) continue;
    const main = String(content).match(/<main id="main">([\s\S]*)<\/main>/)[1].replace(/<dialog[\s\S]*?<\/dialog>/g, "");
    const blocks = main.split(/(?=<section\b|<div class="band)/).filter((b) => b.trim());
    for (const block of blocks) {
      const n = (block.match(/class="btn btn-primary\b/g) || []).length;
      const head = (block.match(/<(?:section|div)\b[^>]*>/) || [""])[0];
      assert.ok(n <= 1, `${path}: ${n} main buttons in ${head}`);
    }
    const bar = String(content).match(/<div class="action-bar[\s\S]*?<\/div>/)[0];
    assert.equal((bar.match(/btn-primary/g) || []).length, 1, `${path}: the bottom bar has one main button`);
  }
});

// ── The tour's chapters ─────────────────────────────────────────────────────

test("/demo: chapters are a plain list until the tour has chapter times, then buttons of at least 48 px that jump there", () => {
  const bare = loadSite();
  bare.media = JSON.parse(JSON.stringify(bare.media));
  bare.media.clips.tour.chapters = null;
  const plain = String(buildSite(bare).get("public/demo.html"));
  assert.match(plain, /<ol class="tour-chapters"><li>Ráno: co je nového<\/li>/);
  assert.doesNotMatch(plain, /tour-chapter"/);

  const site = loadSite();
  site.media = JSON.parse(JSON.stringify(site.media));
  // media's tour.chapters.json: per language, { start } in seconds
  site.media.clips.tour.chapters = {
    cs: [{ start: 0 }, { start: 20.73 }, { start: 35.66 }, { start: 67.6 }, { start: 90.19 }],
    en: [{ start: 0 }, { start: 20.74 }, { start: 35.69 }, { start: 67.68 }, { start: 90.2 }],
  };
  const files = buildSite(site);
  const cs = String(files.get("public/demo.html"));
  const buttons = cs.match(/<button class="tour-chapter" type="button" data-seek="[\d.]+">/g) || [];
  assert.equal(buttons.length, 5);
  assert.match(cs, /data-seek="35.66"><span class="tour-chapter__time">0:35<\/span><span>Komu zavolat<\/span>/);
  assert.match(cs, /data-seek="90.19"><span class="tour-chapter__time">1:30<\/span><span>Kandidáti a.pipeline \(Radar \+ ATS\)<\/span>/);
  assert.match(String(files.get("public/en/demo.html")), /data-seek="20.74"><span class="tour-chapter__time">0:20<\/span><span>Role detail<\/span>/);
  // a plain list of seconds works too
  site.media.clips.tour.chapters = [0, 12];
  assert.equal((String(buildSite(site).get("public/demo.html")).match(/class="tour-chapter"/g) || []).length, 2);
  // the button is a 48 px target
  assert.match(css(), /\.tour-chapter \{[^}]*min-height: 48px/);
});

// ── The phone's charts and layout ──────────────────────────────────────────

test("phone chart of the age of roles: one bar in the accent, 45+, the sum of every band from 45 days, with its text alternative and source", () => {
  const html = String(built().get("public/index.html"));
  // (no-break spaces read as plain ones here; the Czech rule has its own test)
  const start = html.indexOf('id="chm-stari-pozic"');
  const fig = html.slice(start, html.indexOf("</figure>", start)).split(NBSP).join(" ");
  const rows = fig.match(/<li class="hbars__row[^"]*">[\s\S]*?<\/li>/g);
  assert.equal(rows.length, 5);
  const hi = rows.filter((r) => r.includes("is-hi"));
  assert.equal(hi.length, 1);
  assert.match(hi[0], /45\+ dní<\/span>[\s\S]*<span class="hbars__value">99<\/span>/);
  assert.match(fig, /<ol class="hbars" role="list" aria-label="Z 409 pozic s datem zveřejnění je 99 \(24 %\) otevřených 45 a víc dní\.">/);
  assert.match(fig, /Inzerát visí 45 a víc dní\. Někde jde o průběžný nábor/);
  assert.match(fig, /Zdroj: veřejné demo TalentRadaru, stav k 31\. 10\. 2026/);
  assert.doesNotMatch(fig, /SHRM/);
});

test("phone and wide layouts: .m-only shows only up to 767 px and .d-only only from 768 px", () => {
  const c = css();
  assert.match(c, /@media \(min-width: 768px\) \{ \.m-only \{ display: none !important; \} \}/);
  assert.match(c, /@media \(max-width: 767px\) \{ \.d-only \{ display: none !important; \} \}/);
  const home = String(built().get("public/index.html"));
  // the phone's bottom bar starts inert (site.js lets it in only when it shows) and never without the script
  assert.match(home, /<div class="action-bar m-only" data-action-bar role="group" aria-label="Rychlé akce" inert>/);
  assert.match(c, /\.no-js \.action-bar \{ display: none; \}/);
  // the trial form says what is wrong itself
  assert.match(home, /<form class="form" id="demo-form" method="post" action="#zkusit" novalidate>/);
  for (const id of ["name", "email", "company", "file"]) assert.match(home, new RegExp(`<div class="field__error" id="${id}-error" hidden></div>`));
});

test("the founder's role reads lower case inside the signature and starts with a capital on its own line", () => {
  const files = built();
  const cs = String(files.get("public/index.html"));
  assert.match(cs, /<strong>Kryštof Pejša<\/strong>, zakladatel TalentRadaru ·/);
  assert.match(cs, /<strong>Kryštof Pejša<\/strong><span>zakladatel TalentRadaru<\/span>/);
  assert.match(String(files.get("public/en/index.html")), /<strong>Kryštof Pejša<\/strong>, founder of TalentRadar ·/);
  const css = String(files.get("public/css/site.css"));
  assert.match(css, /\.trial-story__who span \{ display: block;/);
  assert.match(css, /\.trial-story__who span::first-letter \{ text-transform: uppercase; \}/);
});
