// The trial form end to end inside the Worker: what is refused, what is stored,
// and what the visitor's confirmation e-mail looks like. Brevo, Slack and DNS
// are faked at fetch(); run with `npm test` (Node 20+, no dependencies).

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import worker from "../worker.js";
import { fillTime, MIN_FILL_MS } from "../worker-lib.js";
import { checkAddress, confirmationEmail, countCompanies, escapeHtml, DISPOSABLE_DOMAINS } from "../email.js";

let sent;      // [{ url, body }] for every outbound fetch except DNS
let dns;       // domain -> DNS-over-HTTPS answer
let realFetch;
let wakeBehaviour; // "ok" | "down" | "throttled"

const MX_OK = { Status: 0, Answer: [{ type: 15, data: "10 mx.example.cz." }] };

beforeEach(() => {
  sent = [];
  dns = {};
  wakeBehaviour = "ok";
  realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (u.startsWith("https://cloudflare-dns.com/dns-query")) {
      const name = new URL(u).searchParams.get("name");
      if (dns[name] === "down") throw new Error("network down");
      return new Response(JSON.stringify(dns[name] ?? MX_OK), { status: 200 });
    }
    sent.push({ url: u, body: init.body ? JSON.parse(init.body) : null });
    if (u.includes("/wake")) {
      if (wakeBehaviour === "down") throw new Error("app unreachable");
      return new Response(JSON.stringify({ status: "accepted" }), { status: wakeBehaviour === "throttled" ? 429 : 202 });
    }
    return new Response(JSON.stringify({ messageId: "<m@brevo>" }), { status: 201 });
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

function kv() {
  const store = new Map();
  return {
    store,
    async get(k) { return store.has(k) ? store.get(k) : null; },
    async put(k, v) { store.set(k, v); },
  };
}

function env(extra = {}) {
  return { TALENT_RADAR_KV: kv(), BREVO_API_KEY: "xkeysib-test", SLACK_WEBHOOK_URL: "https://hooks.slack.test/x", ...extra };
}

function submit(e, fields = {}, headers = {}) {
  const body = {
    name: "Petra Svobodová", email: "petra@agentura.cz", company: "Agentura Svoboda",
    clients: "Tines, https://tines.com/careers", website: "", lang: "cs",
    timestamp: String(Date.now() - 10_000), elapsedMs: 10_000, ...fields,
  };
  const req = new Request("https://talentradar.eu/api/demo", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.7", ...headers },
    body: JSON.stringify(body),
  });
  return worker.fetch(req, e, {});
}

const brevoMails = () => sent.filter((s) => s.url === "https://api.brevo.com/v3/smtp/email").map((s) => s.body);
const toVisitor = () => brevoMails().find((m) => m.to[0].email === "petra@agentura.cz");

// ── The happy path ──────────────────────────────────────────────────────────

test("a sign-up is stored and the visitor gets the branded confirmation", async () => {
  const e = env();
  const res = await submit(e);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);

  const keys = [...e.TALENT_RADAR_KV.store.keys()].filter((k) => k.startsWith("lead:"));
  assert.equal(keys.length, 1);
  const lead = JSON.parse(e.TALENT_RADAR_KV.store.get(keys[0]));
  assert.equal(lead.email, "petra@agentura.cz");
  assert.equal(lead.lang, "cs");

  const mail = toVisitor();
  assert.ok(mail, "confirmation sent to the visitor");
  assert.equal(mail.sender.name, "TalentRadar");
  assert.equal(mail.replyTo.email, "krystof@talentradar.eu");
  assert.deepEqual(mail.tags, ["trial-confirmation"]);
  assert.equal(mail.subject, "Máme vaši registraci, TalentRadar připravujeme");
  assert.match(mail.htmlContent, /TALENT<span style="color:#FF5500;">RADAR<\/span>/);
  assert.match(mail.htmlContent, /img\/email\/logo-96\.png/);
  assert.match(mail.htmlContent, /img\/email\/krystof-96\.jpg/);
  assert.match(mail.textContent, /^Dobrý den,\n/);
  assert.match(mail.textContent, /„Není spam“/);
  assert.ok(!/[<>]/.test(mail.textContent), "the text twin has no markup");
});

test("Kryštof still gets the internal sign-up e-mail and the Slack post", async () => {
  await submit(env());
  const internal = brevoMails().find((m) => m.to[0].email === "krystof@talentradar.eu");
  assert.ok(internal && internal.subject.startsWith("New 14-day trial: Petra Svobodová"));
  assert.ok(sent.some((s) => s.url === "https://hooks.slack.test/x"));
});

test("an English visitor gets English", async () => {
  await submit(env(), { lang: "en" });
  const mail = toVisitor();
  assert.equal(mail.subject, "Got it: we're setting up your TalentRadar");
  assert.match(mail.textContent, /^Hi Petra,\n/);
  assert.match(mail.textContent, /Not spam/);
});

// ── The app is woken at once ────────────────────────────────────────────────

const wakes = () => sent.filter((s) => s.url.includes("/wake"));

test("the app is told about the sign-up the moment it is stored", async () => {
  const e = env();
  await submit(e);
  const id = [...e.TALENT_RADAR_KV.store.keys()].find((k) => k.startsWith("lead:")).slice(5);
  assert.deepEqual(wakes().map((w) => w.url),
    [`https://talent-radar-web-production.up.railway.app/api/public/leads/${id}/wake`]);
});

test("the app origin can be overridden", async () => {
  await submit(env({ APP_API_ORIGIN: "https://staging.example/" }));
  assert.match(wakes()[0].url, /^https:\/\/staging\.example\/api\/public\/leads\/[0-9a-f-]+\/wake$/);
});

for (const behaviour of ["down", "throttled"]) {
  test(`an app that is ${behaviour} never costs the visitor their sign-up`, async () => {
    wakeBehaviour = behaviour;
    const res = await submit(env());
    assert.equal(res.status, 200);
    assert.ok(toVisitor(), "confirmation still sent");
  });
}

test("nothing is woken when the sign-up could not be stored", async () => {
  const e = env();
  e.TALENT_RADAR_KV.put = async () => { throw new Error("KV down"); };
  await submit(e);
  assert.equal(wakes().length, 0);
});

// ── Addresses that would bounce are refused before anything is sent ─────────

for (const [label, email, setup, reason] of [
  ["a throwaway inbox", "petra@mailinator.com", () => {}, "disposable"],
  ["a domain that does not exist", "petra@agentura-neexistuje.cz", () => { dns["agentura-neexistuje.cz"] = { Status: 3 }; }, "no_domain"],
  ["a domain without mail servers", "petra@jen-web.cz", () => { dns["jen-web.cz"] = { Status: 0, Answer: [] }; }, "no_mx"],
]) {
  test(`${label} is refused, nothing stored, nothing sent`, async () => {
    setup();
    const e = env();
    const res = await submit(e, { email });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.reason, reason);
    assert.ok(body.error.length > 20);
    assert.equal([...e.TALENT_RADAR_KV.store.keys()].filter((k) => k.startsWith("lead:")).length, 0);
    assert.equal(sent.length, 0);
  });
}

test("the refusal speaks the visitor's language", async () => {
  const cs = await (await submit(env(), { email: "a@yopmail.com", lang: "cs" })).json();
  const en = await (await submit(env(), { email: "a@yopmail.com", lang: "en" })).json();
  assert.match(cs.error, /pracovní e-mail/);
  assert.match(en.error, /work e-mail/);
});

test("a DNS outage does not cost a real agency its trial", async () => {
  dns["agentura.cz"] = "down";
  const res = await submit(env());
  assert.equal(res.status, 200);
  assert.ok(toVisitor());
});

// ── Existing guards still hold ──────────────────────────────────────────────

const storedLeads = (e) => [...e.TALENT_RADAR_KV.store.keys()].filter((k) => k.startsWith("lead:"));

test("the honeypot answers success and sends nothing", async () => {
  const e = env();
  const res = await submit(e, { website: "http://spam.example" });
  assert.equal(res.status, 200);
  assert.equal(sent.length, 0);
  assert.deepEqual(storedLeads(e), []);
});

// ── How fast the form was sent ──────────────────────────────────────────────
// A fake success here once cost a person their sign-up, so the time check
// refuses out loud: the visitor is told to send again, and nothing is kept.

test("a form sent faster than a person can is refused out loud, nothing stored or sent", async () => {
  const e = env();
  const res = await submit(e, { elapsedMs: 500 });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.success, undefined);
  assert.equal(body.reason, "too_fast");
  assert.match(body.error, /příliš rychle.*pošlete ho znovu/);
  assert.equal(sent.length, 0);
  assert.deepEqual(storedLeads(e), []);
});

test("the too-fast refusal speaks English to an English visitor", async () => {
  const res = await submit(env(), { elapsedMs: 500, lang: "en" });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /too quickly.*send it again/);
});

test("two and a half seconds is a person with autofill, not a bot", async () => {
  const e = env();
  const res = await submit(e, { elapsedMs: 2500 });
  assert.equal(res.status, 200);
  assert.equal(storedLeads(e).length, 1);
});

test("a visitor whose clock runs five minutes ahead is stored", async () => {
  const ahead = String(Date.now() + 300_000);
  for (const fields of [{ timestamp: ahead, elapsedMs: 8000 }, { timestamp: ahead, elapsedMs: undefined }]) {
    sent = [];
    const e = env();
    const res = await submit(e, fields);
    assert.equal(res.status, 200, JSON.stringify(fields));
    assert.equal(storedLeads(e).length, 1);
    assert.ok(toVisitor(), "the confirmation goes out");
  }
});

test("a page from before elapsedMs is still judged by its clock time", async () => {
  const fast = env();
  assert.equal((await submit(fast, { elapsedMs: undefined, timestamp: String(Date.now() - 500) })).status, 400);
  assert.deepEqual(storedLeads(fast), []);
  const slow = env();
  assert.equal((await submit(slow, { elapsedMs: undefined, timestamp: String(Date.now() - 10_000) })).status, 200);
  assert.equal(storedLeads(slow).length, 1);
});

test("a form with no timing at all is refused, nothing stored", async () => {
  const e = env();
  const res = await submit(e, { elapsedMs: undefined, timestamp: undefined });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).reason, "too_fast");
  assert.equal(sent.length, 0);
  assert.deepEqual(storedLeads(e), []);
});

test("fill time: the page's own measure wins, junk falls back to the clock", () => {
  const now = 1_000_000;
  assert.deepEqual(fillTime(4321.6, String(now), now), { ms: 4322, source: "page" });
  assert.deepEqual(fillTime("abc", String(now - 5000), now), { ms: 5000, source: "clock" });
  assert.deepEqual(fillTime(-5, String(now - 5000), now), { ms: 5000, source: "clock" });
  assert.deepEqual(fillTime(undefined, String(now + 60_000), now), { ms: Infinity, source: "clock ahead" });
  assert.deepEqual(fillTime(undefined, undefined, now), { ms: null, source: "none" });
  assert.equal(MIN_FILL_MS, 2000);
});

test("the sixth sign-up from one IP within the hour is refused", async () => {
  const e = env();
  for (let i = 0; i < 5; i++) assert.equal((await submit(e, { email: `p${i}@agentura.cz` })).status, 200);
  assert.equal((await submit(e, { email: "p6@agentura.cz" })).status, 429);
});

// ── The e-mail and the check on their own ───────────────────────────────────

test("the confirmation never puts the name into HTML unescaped", () => {
  const { html } = confirmationEmail('<img src=x onerror=alert(1)> Novák', "en");
  assert.ok(!html.includes("<img src=x"));
  assert.ok(html.includes("Hi &lt;img,"));
  assert.equal(escapeHtml(`<a href="x">'`), "&lt;a href=&quot;x&quot;&gt;&#x27;");
});

test("a missing name still gets a greeting", () => {
  assert.match(confirmationEmail("", "en").text, /^Hi there,\n/);
  assert.match(confirmationEmail("", "cs").text, /^Dobrý den,\n/);
});

test("the confirmation stays far under Gmail's clipping limit", () => {
  for (const lang of ["cs", "en"]) {
    assert.ok(new TextEncoder().encode(confirmationEmail("Petra", lang).html).length < 60_000);
  }
});

test("a null MX means the domain takes no mail", async () => {
  const fake = async () => new Response(JSON.stringify({ Status: 0, Answer: [{ type: 15, data: "0 ." }] }));
  assert.deepEqual(await checkAddress("x@nomail.cz", fake), { ok: false, reason: "no_mx" });
});

test("SERVFAIL and HTTP errors let the address through", async () => {
  assert.deepEqual(await checkAddress("x@a.cz", async () => new Response("{}", { status: 503 })), { ok: true, reason: "unchecked" });
  assert.deepEqual(await checkAddress("x@a.cz", async () => new Response(JSON.stringify({ Status: 2 }))), { ok: true, reason: "unchecked" });
});

test("throwaway domains are matched case-insensitively", async () => {
  assert.equal(DISPOSABLE_DOMAINS.has("yopmail.com"), true);
  assert.deepEqual(await checkAddress("Someone@YOPMAIL.com", async () => { throw new Error("must not ask DNS"); }),
    { ok: false, reason: "disposable" });
});

// ── How many companies the confirmation names ───────────────────────────────

const csv = (text) => "data:text/csv;base64," + Buffer.from(text, "utf8").toString("base64");
const TEST_CSV = "firma,kariérní stránka\nMews,https://www.mews.com/en/careers\nKiwi.com,https://jobs.kiwi.com/\n" +
  "Apify,https://apify.com/jobs\nProductboard,https://www.productboard.com/careers/\nRohlik Group,https://www.rohlik.group/work-with-us\n";

test("the confirmation names the companies sent as text", async () => {
  await submit(env());   // "Tines, https://tines.com/careers": one company
  assert.match(toVisitor().textContent, /Máme vaši firmu a pracujeme na ní\./);
  assert.match(toVisitor().htmlContent, /Registrace a seznam firem \(1\)/);
});

test("the confirmation names the companies in an uploaded CSV, header row not counted", async () => {
  await submit(env(), { clients: "", fileName: "talentradar-test-firmy.csv", fileData: csv(TEST_CSV) });
  const mail = toVisitor();
  assert.match(mail.textContent, /Máme vašich 5 firem a pracujeme na nich\./);
  assert.match(mail.textContent, /1\. Registrace a seznam firem \(5\): hotovo\./);
});

test("an English visitor gets the count in English", async () => {
  await submit(env(), { lang: "en", clients: "Mews\nApify\nKiwi.com" });
  assert.match(toVisitor().textContent, /We have your 3 companies and are working on them\./);
});

test("an Excel file names no number rather than a wrong one", async () => {
  await submit(env(), { clients: "", fileName: "firmy.xlsx", fileData: "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBA==" });
  const text = toVisitor().textContent;
  assert.match(text, /Seznam vašich firem máme/);
  assert.ok(!/Máme vaš/.test(text));
});

test("company counts agree in Czech and match the app's reading", () => {
  assert.equal(countCompanies("Mews\nApify", null, ""), 2);
  assert.match(confirmationEmail("", "cs", 2).text, /Máme vaše 2 firmy a pracujeme na nich\./);
  assert.match(confirmationEmail("", "cs", 4).text, /Máme vaše 4 firmy/);
  assert.match(confirmationEmail("", "cs", 12).text, /Máme vašich 12 firem/);
  // Duplicates, blank lines and a bare domain, as the app de-duplicates them.
  assert.equal(countCompanies("Mews, https://mews.com\n\nmews\nhttps://www.apify.com/jobs\n", null, ""), 2);
  // Semicolons, quotes and a byte-order mark, as Excel exports CSV.
  assert.equal(countCompanies("", csv("\uFEFFnázev;web\n\"Novák, s.r.o.\";novak.cz\nAlza;alza.cz\n"), "x.csv"), 2);
  // A CSV without a header: every row is a company.
  assert.equal(countCompanies("", csv("Mews,https://mews.com\nApify,https://apify.com\n"), "x.csv"), 2);
  assert.equal(countCompanies("", null, ""), null);
});

test("a broken file never stops the confirmation", async () => {
  const res = await submit(env(), { clients: "", fileName: "x.csv", fileData: "data:text/csv;base64,%%%" });
  assert.equal(res.status, 200);
  assert.match(toVisitor().textContent, /Seznam vašich firem máme/);
});

// ── The four-column list (W12): company, website, last contact, had placement ─

const templateFile = async (name) => {
  const { readFileSync } = await import("node:fs");
  return readFileSync(new URL(`../public/files/${name}`, import.meta.url));
};
const leadOf = (e) => {
  const key = [...e.TALENT_RADAR_KV.store.keys()].find((k) => k.startsWith("lead:"));
  return { key, lead: JSON.parse(e.TALENT_RADAR_KV.store.get(key)) };
};

test("the four-column template, uploaded, is stored whole and its companies counted", async () => {
  for (const [name, lang, count] of [["klienti-sablona.csv", "cs", /Máme vaše 3 firmy/], ["clients-template.csv", "en", /We have your 3 companies/]]) {
    sent = [];
    const bytes = await templateFile(name);
    assert.match(bytes.toString("utf8"), /^﻿(Firma;Kariérní stránka;Poslední kontakt;Proběhla zakázka|Company,Careers page,Last contact,Had placement)\r?\n/);
    const e = env();
    const fileData = "data:text/csv;base64," + bytes.toString("base64");
    const res = await submit(e, { clients: "", lang, fileName: name, fileData });
    assert.equal(res.status, 200);
    const { key, lead } = leadOf(e);
    assert.equal(lead.hasFile, true);
    assert.equal(lead.fileName, name);
    // The app reads the file back from here (core/leads.py fetch_lead_file), all four columns intact.
    assert.equal(e.TALENT_RADAR_KV.store.get(key.replace("lead:", "leadfile:")), fileData);
    assert.match(toVisitor().textContent, count);
  }
});

test("a four-column list pasted as text stays whole in the lead", async () => {
  const clients = "Air Bank; airbank.cz; 15. 3. 2024; ano\nRohlik Group\nSeznam.cz; https://kariera.seznam.cz; 2. 11. 2023; ne";
  const e = env();
  const res = await submit(e, { clients });
  assert.equal(res.status, 200);
  assert.equal(leadOf(e).lead.clients, clients);
  assert.match(toVisitor().textContent, /Máme vaše 3 firmy/);
  const slack = sent.find((s) => s.url.startsWith("https://hooks.slack.test"));
  assert.match(slack.body.text, /Air Bank; airbank\.cz; 15\. 3\. 2024; ano/);
});

test("150 companies in four columns fit in the text box; a list over the limit is refused", async () => {
  const line = (i) => `Firma číslo ${i} s.r.o.; https://kariera.firma-cislo-${i}.cz/volna-mista; 15. 3. 2024; ano`;
  const clients = Array.from({ length: 150 }, (_, i) => line(i + 1)).join("\n");
  assert.ok(clients.length > 10000, "longer than the old limit");
  const ok = await submit(env(), { clients });
  assert.equal(ok.status, 200);

  const e = env();
  const tooLong = await submit(e, { clients: "x".repeat(30001) });
  assert.equal(tooLong.status, 400);
  assert.match((await tooLong.json()).error, /30 000 znaků/);
  assert.equal([...e.TALENT_RADAR_KV.store.keys()].filter((k) => k.startsWith("lead:")).length, 0);
});

// ── Feeds the app writes to KV ──────────────────────────────────────────────

test("the sandbox feed is served from KV, and 503 until the app has written it", async () => {
  const e = env();
  const get = () => worker.fetch(new Request("https://talentradar.eu/api/sandbox"), e, {});

  const none = await get();
  assert.equal(none.status, 503);
  assert.equal(none.headers.get("cache-control"), "no-store");

  await e.TALENT_RADAR_KV.put("sandbox_json", JSON.stringify({ version: 1, roles: [{ id: 1 }] }));
  const res = await get();
  assert.equal(res.status, 200);
  assert.match(res.headers.get("cache-control"), /max-age=60/);
  assert.deepEqual((await res.json()).roles, [{ id: 1 }]);
});

test("the hero's three numbers come from the sandbox feed as of its last scan, 503 without it", async () => {
  const e = env();
  const get = () => worker.fetch(new Request("https://talentradar.eu/api/hero-stats"), e, {});
  assert.equal((await get()).status, 503);

  await e.TALENT_RADAR_KV.put("sandbox_json", JSON.stringify({
    scan: { at: "2026-10-20T10:00:00+00:00" },
    daily_new: { "2026-10-18": 400, "2026-10-20": 3 },
    roles: [
      { co: 1, seen: "2026-10-20T10:00:00+00:00", posted: "" },            // new today
      { co: 1, seen: "2026-10-20T10:00:00+00:00", posted: "2026-08-01" },  // new today, posted 80 days ago
      { co: 2, seen: "2026-10-20T04:00:00+00:00", posted: "2026-10-19" },  // new today
      { co: 3, seen: "2026-09-01T04:00:00+00:00", posted: "" },            // first seen 49 days ago
      { co: 4, seen: "2026-10-18T04:00:00+00:00", posted: "2026-09-20" },  // 30 days, not yet 45
    ],
  }));
  const res = await get();
  assert.equal(res.status, 200);
  assert.match(res.headers.get("cache-control"), /max-age=60/);
  assert.deepEqual(await res.json(), {
    day: "2026-10-20", scan_at: "2026-10-20T10:00:00+00:00", new_roles: 3, companies_hiring: 2, open_45: 2,
  });
});

// A feed with a given number of new roles on its last day, for the cache tests below
const heroFeed = (n) => JSON.stringify({
  version: 1, generated_at: `2026-10-20T10:0${n}:00+00:00`,
  scan: { at: "2026-10-20T10:00:00+00:00" },
  daily_new: { "2026-10-20": n },
  roles: [{ co: 1, seen: "2026-10-20T10:00:00+00:00", posted: "" }],
});

// Counts JSON.parse calls on a sandbox feed while fn runs
async function feedParses(fn) {
  const real = JSON.parse;
  let n = 0;
  JSON.parse = (text, ...rest) => { if (typeof text === "string" && text.includes('"daily_new"')) n += 1; return real(text, ...rest); };
  try { await fn(); } finally { JSON.parse = real; }
  return n;
}

test("hero stats parse the feed once per feed version in an isolate", async () => {
  const e = env();
  const get = () => worker.fetch(new Request("https://talentradar.eu/api/hero-stats"), e, {});
  await e.TALENT_RADAR_KV.put("sandbox_json", heroFeed(4));
  const parses = await feedParses(async () => {
    assert.equal((await (await get()).json()).new_roles, 4);
    assert.equal((await (await get()).json()).new_roles, 4);
  });
  assert.equal(parses, 1, "the second request reuses the first parse");

  await e.TALENT_RADAR_KV.put("sandbox_json", heroFeed(7));
  const again = await feedParses(async () => {
    assert.equal((await (await get()).json()).new_roles, 7, "a new feed is worked out again");
  });
  assert.equal(again, 1);
});

test("hero stats are kept in the Cache API, and a cached answer skips KV", async () => {
  const store = new Map();
  globalThis.caches = { default: {
    async match(req) { const hit = store.get(req.url); return hit ? hit.clone() : undefined; },
    async put(req, res) { store.set(req.url, res); },
  } };
  try {
    const e = env();
    await e.TALENT_RADAR_KV.put("sandbox_json", heroFeed(5));
    let reads = 0;
    const realGet = e.TALENT_RADAR_KV.get.bind(e.TALENT_RADAR_KV);
    e.TALENT_RADAR_KV.get = async (k) => { reads += 1; return realGet(k); };
    const waits = [];
    const ctx = { waitUntil: (p) => waits.push(p) };
    const get = () => worker.fetch(new Request("https://talentradar.eu/api/hero-stats"), e, ctx);

    assert.equal((await (await get()).json()).new_roles, 5);
    await Promise.all(waits);
    assert.equal(store.size, 1, "the answer went into the cache");
    assert.equal((await (await get()).json()).new_roles, 5);
    assert.equal(reads, 1, "the second request came from the cache, not KV");

    // A missing feed is never cached
    store.clear();
    await e.TALENT_RADAR_KV.put("sandbox_json", "");
    assert.equal((await get()).status, 503);
    await Promise.all(waits);
    assert.equal(store.size, 0);
  } finally {
    delete globalThis.caches;
  }
});

test("the live roles feed still reads its own key", async () => {
  const e = env();
  await e.TALENT_RADAR_KV.put("live_roles_json", JSON.stringify({ roles: [] }));
  const res = await worker.fetch(new Request("https://talentradar.eu/api/live-roles"), e, {});
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { roles: [] });
});


// The Czech home page: since November 2026 Czech is at / as its own static page
// (public/index.html from build.mjs), so search engines read it without JavaScript,
// and the old /cs and /cs/ answer 301 to it.
test("/cs and /cs/ move to the Czech home page at /, which is Czech without JavaScript", async () => {
  const { readFileSync } = await import("node:fs");
  const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  assert.match(html, /<html lang="cs"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/talentradar\.eu\/">/);
  assert.match(html, /<meta name="description" content="TalentRadar hlídá/);
  assert.match(html, /hreflang="cs" href="https:\/\/talentradar\.eu\/"/);
  assert.doesNotMatch(html, /<meta name="description" content="TalentRadar watches/);

  const e = env({ ASSETS: { fetch: async () => { throw new Error("an old address must not reach the assets"); } } });
  for (const path of ["/cs", "/cs/"]) {
    const res = await worker.fetch(new Request(`https://talentradar.eu${path}?x=1`), e, {});
    assert.equal(res.status, 301, path);
    assert.equal(res.headers.get("Location"), "https://talentradar.eu/?x=1", path);
  }
});

// ── Offline: a local run never calls anything outside (lead, 31. 10. 2026) ──
// `npm run dev` sets OFFLINE_DEV=1, and a request to a local host name is offline
// even without it. Fake keys for every channel are set, so only the guard stands
// between the form and Brevo, Slack, Telegram, DNS and the app wake-up.

const allChannels = (extra = {}) => env({ TELEGRAM_BOT_TOKEN: "123:test", TELEGRAM_CHAT_ID: "42", APP_API_ORIGIN: "https://app.example.test", ...extra });

function countingFetch() {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return new Response("{}", { status: 200 });
  };
  return calls;
}

for (const [label, e, origin] of [
  ["OFFLINE_DEV=1", () => allChannels({ OFFLINE_DEV: "1" }), "https://talentradar.eu"],
  ["a request to 127.0.0.1", () => allChannels(), "http://127.0.0.1:8830"],
  ["a request to localhost", () => allChannels(), "http://localhost:8830"],
  ["a request to *.localhost", () => allChannels(), "http://web.localhost:8830"],
]) {
  test(`offline (${label}): the sign-up is stored and answered, and not one fetch leaves`, async () => {
    const calls = countingFetch();
    const store = e();
    const req = new Request(`${origin}/api/demo`, {
      method: "POST",
      headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.9" },
      body: JSON.stringify({ name: "Test Local", email: "test@agentura.cz", company: "Test s.r.o.", clients: "Tines", website: "", lang: "cs", elapsedMs: 10_000 }),
    });
    const res = await worker.fetch(req, store, {});
    assert.equal(res.status, 200);
    assert.equal((await res.json()).success, true);
    assert.deepEqual(calls, []);
    assert.ok([...store.TALENT_RADAR_KV.store.keys()].some((k) => k.startsWith("lead:")));
  });
}

test("online on talentradar.eu without OFFLINE_DEV, the channels are called as before", async () => {
  const calls = countingFetch();
  const res = await submit(allChannels());
  assert.equal(res.status, 200);
  assert.ok(calls.some((u) => u.startsWith("https://cloudflare-dns.com/")));
  assert.ok(calls.some((u) => u.startsWith("https://api.brevo.com/")));
  assert.ok(calls.some((u) => u.startsWith("https://api.telegram.org/")));
  assert.ok(calls.some((u) => u.includes("/wake")));
});
