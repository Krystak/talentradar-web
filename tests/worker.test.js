// The trial form end to end inside the Worker: what is refused, what is stored,
// and what the visitor's confirmation e-mail looks like. Brevo, Slack and DNS
// are faked at fetch(); run with `npm test` (Node 20+, no dependencies).

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import worker from "../worker.js";
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
    timestamp: String(Date.now() - 10_000), ...fields,
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

test("the honeypot answers success and sends nothing", async () => {
  const res = await submit(env(), { website: "http://spam.example" });
  assert.equal(res.status, 200);
  assert.equal(sent.length, 0);
});

test("a form sent within three seconds of loading is treated as a bot", async () => {
  const res = await submit(env(), { timestamp: String(Date.now()) });
  assert.equal(res.status, 200);
  assert.equal(sent.length, 0);
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
