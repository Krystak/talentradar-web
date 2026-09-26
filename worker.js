/**
 * TalentRadar Cloudflare Worker
 * Handles static assets and /api/demo endpoint.
 */

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

    // 2. Dynamic Live Radar roles: /data/live_roles.json or /api/live-roles
    if (url.pathname === "/data/live_roles.json" || url.pathname === "/api/live-roles") {
      let kvPayload = null;
      let kvTimestamp = 0;

      if (env.TALENT_RADAR_KV) {
        try {
          const kvData = await env.TALENT_RADAR_KV.get("live_roles_json");
          if (kvData) {
            const parsed = JSON.parse(kvData);
            kvTimestamp = (parsed.scan_info && parsed.scan_info.timestamp) || 0;
            kvPayload = kvData;
          }
        } catch (err) {
          console.error("KV read error for live_roles_json:", err);
        }
      }

      // Check static asset in repository
      try {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes && assetRes.ok) {
          const assetData = await assetRes.clone().json();
          const assetTimestamp = (assetData.scan_info && assetData.scan_info.timestamp) || 0;

          // If git static asset is newer than KV (or KV is missing/stale), serve the newer asset
          if (assetTimestamp > kvTimestamp) {
            return new Response(JSON.stringify(assetData), {
              status: 200,
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "public, max-age=60, s-maxage=300",
                "Access-Control-Allow-Origin": "*",
              },
            });
          }
        }
      } catch (assetErr) {
        console.error("Asset read error for live_roles_json:", assetErr);
      }

      // If KV is newer or available, serve KV
      if (kvPayload) {
        return new Response(kvPayload, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=60, s-maxage=300",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      return env.ASSETS.fetch(request);
    }

    // 3. Rewrite /gdpr to /gdpr.html if requested
    if (url.pathname === "/gdpr") {
      url.pathname = "/gdpr.html";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    // 4. Static Assets fallback
    return env.ASSETS.fetch(request);
  },
};

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

  const { name, email, company, clients, fileName, fileData, website, lang, timestamp } = data;
  const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Anti-spam 1: Honeypot check (field 'website' must be empty)
  if (website && website.trim().length > 0) {
    return new Response(JSON.stringify({ success: true, message: "Díky, zkušební verzi aktivujeme do 24 hodin." }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // Anti-spam 2: Timestamp check (at least 3 seconds from page load)
  const now = Date.now();
  const pageLoadTime = parseInt(timestamp, 10);
  if (!pageLoadTime || (now - pageLoadTime) < 3000) {
    return new Response(JSON.stringify({ success: true, message: "Díky, zkušební verzi aktivujeme do 24 hodin." }), {
      status: 200,
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

  if (clients && typeof clients === "string" && clients.length > 10000) {
    return new Response(JSON.stringify({ error: "Text se seznamem firem je příliš dlouhý (maximum je 10 000 znaků)." }), {
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
  const results = await Promise.all([
    notifyBrevo(env, leadRecord, fileData, cleanFileName),
    notifyLeadConfirmation(env, leadRecord),
    notifySlack(env, leadRecord, cleanFileName),
    notifyTelegram(env, leadRecord, cleanFileName),
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
        error: "We couldn't register your request automatically. Please e-mail krystof@talentradar.eu directly — we'll set the pilot up by hand.",
      }),
      { status: 502, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  const isCs = (leadRecord.lang === "cs");
  return new Response(
    JSON.stringify({
      success: true,
      message: isCs
        ? "Díky — potvrzení jsme vám odeslali e-mailem a robot právě zahájil první sken vašich firem."
        : "Thanks — a confirmation email has been sent to your inbox and our system has started the initial scan.",
    }),
    { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
  );
}

/**
 * Resolves the language to address this person in: 'cs' or 'en'.
 */
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

function notifyBrevo(env, lead, fileData, cleanFileName) {
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

    return fetch("https://api.brevo.com/v3/smtp/email", {
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

function notifyLeadConfirmation(env, lead) {
  return runChannel("lead_confirmation", !!env.BREVO_API_KEY, () => {
    const isCs = lead.lang === "cs";
    const rawFirst = (lead.name || "").trim().split(/\s+/)[0] || "";
    const greeting = isCs
      ? (rawFirst ? `Dobrý den, ${rawFirst},` : "Dobrý den,")
      : (rawFirst ? `Hi ${rawFirst},` : "Hi there,");

    const subject = isCs
      ? "Potvrzení registrace: připravujeme váš TalentRadar"
      : "Confirmation: Preparing your TalentRadar workspace";

    const textContent = isCs
      ? `${greeting}

děkuji za vyplnění formuláře pro 14denní zkušební verzi TalentRadaru. Váš požadavek i seznam firem v pořádku dorazil.

Náš systém teď pro vaši agenturu připravuje samostatný workspace a spouští první sken:
• Procházíme zadané firmy a napojujeme jejich kariérní stránky i ATS systémy (Greenhouse, Lever, Teamio a další).
• Vyhledáváme všechny aktuálně otevřené pozice.
• U menšího počtu firem to trvá několik minut, u většího portfolia (50 až 200 firem) může kompletní první sken zabrat 10 až 15 minut.

Jakmile první sken doběhne, zašlu vám druhý e-mail s jednorázovým odkazem pro nastavení hesla a přehledem prvních nalezených rolí.

Kdyby cokoliv vyžadovalo ruční napárování nebo jste měl/a jakýkoliv dotaz, stačí odpovědět přímo na tento e-mail — zpráva přijde přímo mně.

Kryštof Pejša
Zakladatel, TalentRadar
krystof@talentradar.eu
https://talentradar.eu
`
      : `${greeting}

thank you for submitting your details for the TalentRadar 14-day trial. We have received your request and your company list.

Our system is now setting up an isolated workspace for your agency and starting the first scan:
• Scanning your companies and connecting their career pages and ATS endpoints (Greenhouse, Lever, Teamio, etc.).
• Finding all currently open roles.
• For a few companies this takes just a couple of minutes; for larger portfolios (50 to 200 companies) the thorough initial scan takes about 10 to 15 minutes.

As soon as the initial scan completes, I will send you a follow-up email with your one-time password setup link and initial findings.

If any company requires custom ATS mapping or if you have any questions, just reply directly to this email — it comes straight to me.

Kryštof Pejša
Founder, TalentRadar
krystof@talentradar.eu
https://talentradar.eu
`;

    const payload = {
      sender: { name: "Kryštof Pejša (TalentRadar)", email: env.LEAD_FROM || "leads@talentradar.eu" },
      to: [{ email: lead.email, name: lead.name }],
      replyTo: { email: "krystof@talentradar.eu", name: "Kryštof Pejša" },
      subject: subject,
      textContent: textContent,
    };

    return fetch("https://api.brevo.com/v3/smtp/email", {
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

function notifySlack(env, lead, cleanFileName) {
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

    return fetch(env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text, mrkdwn: true }),
    });
  });
}

function notifyTelegram(env, lead, cleanFileName) {
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

    return fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: text }),
    });
  });
}
