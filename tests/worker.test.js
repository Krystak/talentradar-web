// The trial form end to end inside the Worker: what is refused, what is stored,
// and what the visitor's confirmation e-mail looks like. Brevo, Slack and DNS
// are faked at fetch(); run with `npm test` (Node 20+, no dependencies).

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import worker from "../worker.js";
import { checkAddress, confirmationEmail, escapeHtml, DISPOSABLE_DOMAINS } from "../email.js";

let sent;      // [{ url, body }] for every outbound fetch except DNS
let dns;       // domain -> DNS-over-HTTPS answer
let realFetch;

const MX_OK = { Status: 0, Answer: [{ type: 15, data: "10 mx.example.cz." }] };

beforeEach(() => {
  sent = [];
  dns = {};
  realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    if (u.startsWith("https://cloudflare-dns.com/dns-query")) {
      const name = new URL(u).searchParams.get("name");
      if (dns[name] === "down") throw new Error("network down");
      return new Response(JSON.stringify(dns[name] ?? MX_OK), { status: 200 });
    }
    sent.push({ url: u, body: init.body ? JSON.parse(init.body) : null });
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
  assert.equal(mail.sender.name, "Kryštof Pejša · TalentRadar");
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
