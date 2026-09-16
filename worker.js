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

    // 2. Rewrite /gdpr to /gdpr.html if requested
    if (url.pathname === "/gdpr") {
      url.pathname = "/gdpr.html";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    // 3. Static Assets fallback
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

  const { name, email, company, clients, website, timestamp } = data;
  const clientIp = request.headers.get("cf-connecting-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Anti-spam 1: Honeypot check (field 'website' must be empty)
  if (website && website.trim().length > 0) {
    return new Response(JSON.stringify({ success: true, message: "Díky, ozvu se do 24 hodin." }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  // Anti-spam 2: Timestamp check (at least 3 seconds from page load)
  const now = Date.now();
  const pageLoadTime = parseInt(timestamp, 10);
  if (!pageLoadTime || (now - pageLoadTime) < 3000) {
    return new Response(JSON.stringify({ success: true, message: "Díky, ozvu se do 24 hodin." }), {
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

  if (clients && typeof clients === "string" && clients.length > 5000) {
    return new Response(JSON.stringify({ error: "Text s odkazy na klienty je příliš dlouhý (maximum je 5 000 znaků)." }), {
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

  // Save Lead Record
  const leadRecord = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    name: name.trim(),
    email: email.trim(),
    company: (company || "").trim(),
    clients: (clients || "").trim(),
    ip: clientIp,
    userAgent: userAgent,
  };

  if (env.TALENT_RADAR_KV) {
    try {
      await env.TALENT_RADAR_KV.put(`lead:${leadRecord.id}`, JSON.stringify(leadRecord));
    } catch (saveErr) {
      console.error("KV save error:", saveErr);
    }
  }

  if (env.DB) {
    try {
      await env.DB.prepare(
        "INSERT INTO leads (id, created_at, name, email, company, clients, ip) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(leadRecord.id, leadRecord.timestamp, leadRecord.name, leadRecord.email, leadRecord.company, leadRecord.clients, clientIp).run();
    } catch (d1Err) {
      console.error("D1 save error:", d1Err);
    }
  }

  // 1. Email Notification via Resend API (if configured)
  if (env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TalentRadar Web <onboarding@resend.dev>",
          to: ["krystof@talentradar.cz"],
          subject: `⚡ Nová poptávka dema: ${leadRecord.name} (${leadRecord.company || "Nezadáno"})`,
          text: `Nová poptávka dema z webu TalentRadar:\n\nJméno: ${leadRecord.name}\nE-mail: ${leadRecord.email}\nFirma: ${leadRecord.company}\n\nOdkazy na klienty:\n${leadRecord.clients}\n\nČas: ${leadRecord.timestamp}\nIP: ${leadRecord.ip}`,
        }),
      });
    } catch (emailErr) {
      console.error("Resend notification error:", emailErr);
    }
  }

  // 2. Instant Discord Webhook Notification (Free & instant to phone)
  if (env.DISCORD_WEBHOOK_URL) {
    try {
      await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🚨 **Nová poptávka DEMO z webu TalentRadar!**\n\n👤 **Jméno:** ${leadRecord.name}\n✉️ **E-mail:** ${leadRecord.email}\n🏢 **Firma:** ${leadRecord.company || "Neuvedeno"}\n🔗 **Klienti ke sledování:**\n\`\`\`\n${leadRecord.clients || "Nevyplněno"}\n\`\`\`\n🕒 **Čas:** ${leadRecord.timestamp}`
        }),
      });
    } catch (discordErr) {
      console.error("Discord webhook error:", discordErr);
    }
  }

  // 3. Instant Telegram Notification (if configured)
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    try {
      const tgText = `🚨 *Nová poptávka DEMO TalentRadar*\n\n*Jméno:* ${leadRecord.name}\n*E-mail:* ${leadRecord.email}\n*Firma:* ${leadRecord.company || "Neuvedeno"}\n*Klienti:*\n${leadRecord.clients || "Nevyplněno"}`;
      await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: tgText,
          parse_mode: "Markdown"
        }),
      });
    } catch (tgErr) {
      console.error("Telegram notification error:", tgErr);
    }
  }

  return new Response(
    JSON.stringify({ success: true, message: "Díky, ozvu se do 24 hodin." }),
    {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }
  );
}
