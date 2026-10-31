/**
 * TalentRadar Cloudflare Worker
 * The trial form (/api/demo), the feeds the app writes to KV, byte ranges for
 * /video/*, 301s from old addresses; everything else is a static file in public/.
 * Only the default export lives here (workerd refuses other named exports of the
 * main module); the rest is in worker-lib.js.
 */

import { ADDRESS_ERRORS, REPLY_TO, SENDER_NAME, checkAddress, confirmationEmail, countCompanies } from "./email.js";
import { CLIENTS_TEXT_MAX, MIN_FILL_MS, fillTime, heroStats, notFoundPath, outboundFetch, redirectFor, serveVideo } from "./worker-lib.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. API Route: /api/demo
    if (url.pathname === "/api/demo") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }

      return handleDemoSubmission(request, env);
    }

    // 2. Live Radar feed. The app writes it to KV after every scan of the
    //    showcase workspace; there is no static copy, so the web can only show
    //    what the last scan found, or nothing.
    if (url.pathname === "/api/live-roles") {
      return kvFeed(env, "live_roles_json");
    }

    // 2b. The sandbox (sandbox/sandbox.js, not on the new site yet): the demo's real
    //     roles and its made-up agency, written to KV by the app after every demo scan
    //     (talent-radar scripts/web_sandbox_feed.py).
    if (url.pathname === "/api/sandbox") {
      return kvFeed(env, "sandbox_json");
    }

    // 2c. Three numbers worked out here from the sandbox feed, so a visitor
    //     downloads a few bytes, not the feed.
    if (url.pathname === "/api/hero-stats") {
      return heroStatsFeed(request, env, ctx);
    }

    // 3. Videos: static files, but with byte ranges (wrangler.toml run_worker_first).
    if (url.pathname.startsWith("/video/")) {
      return serveVideo(request, env);
    }

    // 4. Old addresses (/cs, /blog/<slug>.html, /gdpr.html ...): 301 to the new page.
    const moved = redirectFor(url);
    if (moved) return moved;

    // 5. Static assets; an address without a file gets the 404 page of its language.
    const res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;
    return notFoundPage(request, env, res);
  },
};

/**
 * The 404 page of the address's language (public/404.html, public/en/404.html),
 * with status 404. Only for pages: a missing image or script keeps the assets'
 * plain 404.
 */
async function notFoundPage(request, env, plain) {
  const url = new URL(request.url);
  const page = notFoundPath(url.pathname);
  const isPage = !/\.(?!html?$)[a-z0-9]{2,5}$/i.test(url.pathname);
  if (!page || !isPage || (request.method !== "GET" && request.method !== "HEAD")) return plain;
  const html = await env.ASSETS.fetch(new Request(`${url.origin}${page}`, { method: "GET" }));
  if (!html.ok) return plain;
  const headers = new Headers(html.headers);
  headers.set("Cache-Control", "no-store");
  return new Response(request.method === "HEAD" ? null : html.body, { status: 404, headers });
}

const TOO_FAST_ERROR = {
  cs: "Formulář odešel příliš rychle po načtení stránky. Zkontrolujte prosím údaje a pošlete ho znovu.",
  en: "The form was sent too quickly after the page loaded. Please check your details and send it again.",
};

// The last stats worked out in this isolate, with a mark of the feed they came from
// (its length and opening bytes, where version and generated_at sit): later requests
// skip parsing the ~540 kB feed until the app writes a new one.
let heroMemo = null;

/**
 * /api/hero-stats. Parsing the whole sandbox feed costs CPU (the free Worker plan
 * allows 10 ms), so the answer is cached twice: in the colo's Cache API for
 * s-maxage, and in the isolate against the feed it was worked out from.
 */
async function heroStatsFeed(request, env, ctx) {
  const cache = typeof caches !== "undefined" && caches.default ? caches.default : null;
  if (cache) {
    try {
      const hit = await cache.match(request);
      if (hit) return hit;
    } catch (err) {
      console.warn("Cache lookup for hero stats failed:", err);
    }
  }

  let stats = null;
  try {
    const raw = env.TALENT_RADAR_KV ? await env.TALENT_RADAR_KV.get("sandbox_json") : null;
    if (raw) {
      const mark = `${raw.length}:${raw.slice(0, 160)}`;
      if (heroMemo && heroMemo.mark === mark) {
        stats = heroMemo.stats;
      } else {
        stats = heroStats(JSON.parse(raw));
        heroMemo = { mark, stats };
      }
    }
  } catch (err) {
    console.error("Hero stats from the sandbox feed failed:", err);
  }

  const res = new Response(JSON.stringify(stats || { error: "Feed unavailable" }), {
    status: stats ? 200 : 503,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": stats ? "public, max-age=60, s-maxage=300" : "no-store",
    },
  });
  if (stats && cache) {
    const put = cache.put(request, res.clone()).catch((err) => console.warn("Caching hero stats failed:", err));
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(put);
    else await put;
  }
  return res;
}

/**
 * A JSON feed the app keeps in KV, or 503 while there is none.
 */
async function kvFeed(env, key) {
  let kvData = null;
  try {
    kvData = env.TALENT_RADAR_KV ? await env.TALENT_RADAR_KV.get(key) : null;
  } catch (err) {
    console.error(`KV read error for ${key}:`, err);
  }
  return new Response(kvData || JSON.stringify({ error: "Feed unavailable" }), {
    status: kvData ? 200 : 503,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": kvData ? "public, max-age=60, s-maxage=300" : "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

/**
 * Handle POST /api/demo submission
 */
async function handleDemoSubmission(request, env) {
  let data;
  try {
    data = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Neplatný formát dat." }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const { name, email, company, clients, fileName, fileData, website, lang, timestamp, elapsedMs, timezone } = data;
  const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
  // Every call out of the Worker goes through send: offline (local run) it fails at once.
  const send = outboundFetch(env, request.url);
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Anti-spam 1: Honeypot check (field 'website' must be empty)
  if (website && website.trim().length > 0) {
    return new Response(JSON.stringify({ success: true, message: "Díky, zkušební verzi aktivujeme do 24 hodin." }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // Anti-spam 2: time from opening the page to sending the form. Unlike the
  // honeypot this is no silent trap: a person caught by it is told to send
  // again, because a fake success here would lose their sign-up.
  const fill = fillTime(elapsedMs, timestamp, Date.now());
  if (fill.ms === null || fill.ms < MIN_FILL_MS) {
    console.warn(`Trial form refused as too fast: ${fill.ms === null ? "no timing" : `${fill.ms} ms`} (${fill.source})`);
    const formLang = normaliseLang(lang, request.headers.get("accept-language"));
    return new Response(JSON.stringify({ error: TOO_FAST_ERROR[formLang], reason: "too_fast" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // Server-side Validation
  if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
    return new Response(JSON.stringify({ error: "Vyplňte prosím platné jméno a příjmení (2 až 100 znaků)." }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    return new Response(JSON.stringify({ error: "Zadejte prosím platný pracovní e-mail." }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // An address that cannot receive mail would bounce the confirmation, and
  // bounces decide whether talentradar.eu lands in spam for everyone else.
  const address = await checkAddress(email, send);
  if (!address.ok && ADDRESS_ERRORS[address.reason]) {
    const formLang = normaliseLang(lang, request.headers.get("accept-language"));
    return new Response(JSON.stringify({ error: ADDRESS_ERRORS[address.reason][formLang], reason: address.reason }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // Four columns per company (company, website, last contact, had placement:
  // the template of the trial form, read by the app's CRM import) make a line
  // about three times longer than a bare name, so 150 companies need room.
  if (clients && typeof clients === "string" && clients.length > CLIENTS_TEXT_MAX) {
    return new Response(JSON.stringify({ error: "Text se seznamem firem je příliš dlouhý (maximum je 30 000 znaků). Pošlete ho prosím jako soubor." }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  if (fileData && typeof fileData === "string" && fileData.length > 8 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: "Nahraný soubor je příliš velký (maximum je 5 MB)." }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // Rate Limiting (if KV bound)
  if (env.TALENT_RADAR_KV) {
    try {
      const rateLimitKey = `rate_limit:${clientIp}`;
      const currentSubmissions = await env.TALENT_RADAR_KV.get(rateLimitKey);
      const count = currentSubmissions ? parseInt(currentSubmissions, 10) : 0;
      if (count >= 5) {
        return new Response(JSON.stringify({ error: "Příliš mnoho požadavků. Zkuste to prosím za hodinu." }), {
          status: 429,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
      await env.TALENT_RADAR_KV.put(rateLimitKey, (count + 1).toString(), { expirationTtl: 3600 });
    } catch (kvErr) {
      console.warn("Rate limit KV check skipped:", kvErr);
    }
  }

  // ── Save the lead ────────────────────────────────────────────────────────
  const cleanFileName = fileName ? String(fileName).trim().slice(0, 150) : null;
  const leadRecord = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    name: name.trim(),
    email: email.trim(),
    company: (company || "").trim(),
    clients: (clients || "").trim(),
    fileName: cleanFileName,
    hasFile: !!fileData,
    // Preferred language: what the visitor had the page switched to,
    // falling back to what their browser asks for. Used to pick the
    // language of the welcome e-mail the app sends later.
    lang: normaliseLang(lang, request.headers.get("accept-language")),
    // The browser's time zone ("Europe/Dublin"). The app schedules the scans
    // and picks the fee currency from it; without it a free mailbox lands in Prague.
    timezone: normaliseTimezone(timezone),
    ip: clientIp,
    userAgent: userAgent,
  };

  // The uploaded client list is the whole point of onboarding, so it is stored
  // under its own key rather than only riding along as an e-mail attachment.
  let stored = false;
  if (env.TALENT_RADAR_KV) {
    try {
      await env.TALENT_RADAR_KV.put(`lead:${leadRecord.id}`, JSON.stringify(leadRecord));
      if (fileData && cleanFileName) {
        await env.TALENT_RADAR_KV.put(`leadfile:${leadRecord.id}`, String(fileData), {
          expirationTtl: 90 * 24 * 3600,
          metadata: { fileName: cleanFileName, email: leadRecord.email },
        });
      }
      stored = true;
    } catch (saveErr) {
      console.error("KV save error:", saveErr);
    }
  }

  if (env.DB) {
    try {
      await env.DB.prepare(
        "INSERT INTO leads (id, created_at, name, email, company, clients, ip) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(leadRecord.id, leadRecord.timestamp, leadRecord.name, leadRecord.email, leadRecord.company, leadRecord.clients || leadRecord.fileName || "", clientIp).run();
      stored = true;
    } catch (d1Err) {
      console.error("D1 save error:", d1Err);
    }
  }

  // ── Notify ───────────────────────────────────────────────────────────────
  // Every channel reports whether it actually delivered. A channel that is not
  // configured is skipped; one that fails is logged and counted as failed.
  const [results] = await Promise.all([
    Promise.all([
      notifyBrevo(env, leadRecord, fileData, cleanFileName, send),
      notifyLeadConfirmation(env, leadRecord, fileData, cleanFileName, send),
      notifySlack(env, leadRecord, cleanFileName, send),
      notifyTelegram(env, leadRecord, cleanFileName, send),
    ]),
    stored ? wakeApp(env, leadRecord, send) : null,
  ]);

  const configured = results.filter((r) => r.configured);
  const delivered = configured.filter((r) => r.ok);

  for (const r of configured) {
    if (!r.ok) console.error(`Notification failed [${r.channel}]:`, r.detail);
  }

  // Storage alone is not an alert: the lead would sit in KV unread. Say so.
  if (configured.length === 0) {
    console.error(
      `Lead ${leadRecord.id} stored but nobody was notified - no notification channel is configured. ` +
      `Set SLACK_WEBHOOK_URL, BREVO_API_KEY or TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.`
    );
  }

  // Nothing reached the inbox and nothing was written down — refuse rather than
  // hand the visitor a confirmation for a lead that no longer exists anywhere.
  if (delivered.length === 0 && !stored) {
    console.error("Lead dropped, no channel delivered and no storage bound:", leadRecord.email);
    return new Response(
      JSON.stringify({
        error: "We couldn't register your request automatically. Please e-mail krystof@talentradar.eu directly — we'll set up your trial by hand.",
      }),
      { status: 502, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  const isCs = (leadRecord.lang === "cs");
  return new Response(
    JSON.stringify({
      success: true,
      message: isCs
        ? "Díky, potvrzení je na cestě do vašeho e-mailu. Workspace právě zakládáme, e-mail s přihlášením obvykle přijde do pár minut."
        : "Thanks, a confirmation e-mail is on its way. We are setting up your workspace now; the sign-in e-mail usually follows within a few minutes.",
    }),
    { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
  );
}

// The app's API (Railway service talent-radar-web), the same origin the app's
// own Worker proxies /api to.
const APP_API_ORIGIN = "https://talent-radar-web-production.up.railway.app";

/**
 * Tells the app a sign-up is waiting, so it builds the workspace now instead
 * of at its next five-minute round. Best effort: the round is the fallback,
 * so a slow or failed call never holds up or fails the visitor's sign-up.
 */
async function wakeApp(env, lead, send) {
  const origin = String(env.APP_API_ORIGIN || APP_API_ORIGIN).replace(/\/+$/, "");
  try {
    const res = await send(`${origin}/api/public/leads/${encodeURIComponent(lead.id)}/wake`, {
      method: "POST",
      signal: AbortSignal.timeout(3000),
    });
    if (res.status !== 202) console.error(`App wake-up for lead ${lead.id} answered ${res.status}`);
    return res.status === 202;
  } catch (err) {
    console.error(`App wake-up for lead ${lead.id} failed:`, err);
    return false;
  }
}

/**
 * Resolves the language to address this person in: 'cs' or 'en'.
 */
/** An IANA zone name like "Europe/Dublin", or "". The app checks it again. */
function normaliseTimezone(zone) {
  const value = String(zone || "").trim().slice(0, 64);
  return /^[A-Za-z]+(?:\/[A-Za-z0-9_+\-]+){1,2}$/.test(value) ? value : "";
}

function normaliseLang(chosen, acceptLanguage) {
  const pick = String(chosen || "").trim().toLowerCase().slice(0, 2);
  if (pick === "cs" || pick === "en") return pick;
  if (String(acceptLanguage || "").toLowerCase().startsWith("cs")) return "cs";
  return "en";
}

/** Wrap a channel so one failure can never take the request down. */
async function runChannel(channel, enabled, fn) {
  if (!enabled) return { channel, configured: false, ok: false };
  try {
    const res = await fn();
    if (res && res.ok === false) {
      return { channel, configured: true, ok: false, detail: `HTTP ${res.status} ${await safeBody(res)}` };
    }
    return { channel, configured: true, ok: true };
  } catch (err) {
    return { channel, configured: true, ok: false, detail: String(err) };
  }
}

async function safeBody(res) {
  try {
    return (await res.text()).slice(0, 300);
  } catch (err) {
    return "(body unavailable)";
  }
}

function notifyBrevo(env, lead, fileData, cleanFileName, send) {
  return runChannel("brevo", !!env.BREVO_API_KEY, () => {
    const payload = {
      sender: { name: "TalentRadar", email: env.LEAD_FROM || "leads@talentradar.eu" },
      to: [{ email: env.LEAD_INBOX || "krystof@talentradar.eu" }],
      // Hitting reply in the inbox answers the person who signed up.
      replyTo: { email: lead.email, name: lead.name },
      subject: `New 14-day trial: ${lead.name} (${lead.company || "no agency given"})`,
      textContent: [
        "New trial sign-up",
        "",
        `Name:   ${lead.name}`,
        `E-mail: ${lead.email}`,
        `Agency: ${lead.company || "not given"}`,
        "",
        `Attached file: ${cleanFileName || "none"}`,
        "",
        "Companies pasted as text:",
        lead.clients || "(submitted as a file)",
        "",
        `Time:    ${lead.timestamp}`,
        `IP:      ${lead.ip}`,
        `Lead ID: ${lead.id}`,
      ].join("\n"),
    };

    if (fileData && cleanFileName) {
      // The browser sends a data: URL; Brevo wants the bare base64 payload.
      const rawBase64 = fileData.includes(",") ? fileData.split(",")[1] : fileData;
      payload.attachment = [{ name: cleanFileName, content: rawBase64 }];
    }

    return send("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  });
}

function notifyLeadConfirmation(env, lead, fileData, cleanFileName, send) {
  return runChannel("lead_confirmation", !!env.BREVO_API_KEY, () => {
    let companies = null;
    try {
      companies = countCompanies(lead.clients, fileData, cleanFileName);
    } catch (err) {
      console.error("Could not count the companies for the confirmation:", err);
    }
    const mail = confirmationEmail(lead.name, lead.lang === "cs" ? "cs" : "en", companies);
    const payload = {
      sender: { name: SENDER_NAME, email: env.LEAD_FROM || "leads@talentradar.eu" },
      to: [{ email: lead.email, name: lead.name }],
      replyTo: { email: REPLY_TO, name: "Kryštof Pejša" },
      subject: mail.subject,
      htmlContent: mail.html,
      textContent: mail.text,
      tags: ["trial-confirmation"],
    };

    return send("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
  });
}

function notifySlack(env, lead, cleanFileName, send) {
  return runChannel("slack", !!env.SLACK_WEBHOOK_URL, () => {
    const clientsPreview = lead.clients
      ? lead.clients.length > 800
        ? lead.clients.slice(0, 800) + "…"
        : lead.clients
      : "submitted as an attached file";

    // Slack mrkdwn: *bold*, `code`, ```block```
    const text = [
      "*New 14-day trial sign-up*",
      "",
      `*Name:* ${lead.name}`,
      `*E-mail:* ${lead.email}`,
      `*Agency:* ${lead.company || "not given"}`,
      `*File:* ${cleanFileName ? "`" + cleanFileName + "` (stored as `leadfile:" + lead.id + "`)" : "none"}`,
      "*Companies:*",
      "```",
      clientsPreview,
      "```",
      `*Time:* ${lead.timestamp}`,
    ].join("\n");

    return send(env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text, mrkdwn: true }),
    });
  });
}

function notifyTelegram(env, lead, cleanFileName, send) {
  return runChannel("telegram", !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID), () => {
    const text = [
      "New 14-day trial sign-up",
      "",
      `Name: ${lead.name}`,
      `E-mail: ${lead.email}`,
      `Agency: ${lead.company || "not given"}`,
      `File: ${cleanFileName || "none"}`,
      `Companies: ${lead.clients ? lead.clients.slice(0, 200) : "in the attached file"}`,
      `Lead ID: ${lead.id}`,
    ].join("\n");

    return send(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: text }),
    });
  });
}
