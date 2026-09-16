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

  const { name, email, company, clients, fileName, fileData, website, timestamp } = data;
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

  // Save Lead Record
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
      ).bind(leadRecord.id, leadRecord.timestamp, leadRecord.name, leadRecord.email, leadRecord.company, leadRecord.clients || leadRecord.fileName || "", clientIp).run();
    } catch (d1Err) {
      console.error("D1 save error:", d1Err);
    }
  }

  // 1. Email Notification via Resend API (if configured)
  if (env.RESEND_API_KEY) {
    try {
      const emailPayload = {
        from: "TalentRadar Web <onboarding@resend.dev>",
        to: ["krystof@talentradar.cz"],
        subject: `⚡ Nová 14denní zkušební verze: ${leadRecord.name} (${leadRecord.company || "Nezadáno"})`,
        text: `Nová registrace do 14denní zkušební verze:\n\nJméno: ${leadRecord.name}\nE-mail: ${leadRecord.email}\nFirma / Agentura: ${leadRecord.company || "Neuvedeno"}\n\nPřiložený soubor: ${cleanFileName || "Žádný"}\n\nFirmy zadané textem:\n${leadRecord.clients || "(Zadáno přes soubor)"}\n\nČas: ${leadRecord.timestamp}\nIP: ${leadRecord.ip}`,
      };

      if (fileData && cleanFileName) {
        const rawBase64 = fileData.includes(",") ? fileData.split(",")[1] : fileData;
        emailPayload.attachments = [
          {
            filename: cleanFileName,
            content: rawBase64,
          },
        ];
      }

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });
    } catch (emailErr) {
      console.error("Resend notification error:", emailErr);
    }
  }

  // 2. Instant Discord Webhook Notification (Free & instant to phone)
  if (env.DISCORD_WEBHOOK_URL) {
    try {
      const clientsPreview = leadRecord.clients
        ? (leadRecord.clients.length > 800 ? leadRecord.clients.slice(0, 800) + "…" : leadRecord.clients)
        : "Zadáno přes přiložený soubor";

      await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🚨 **Nová registrace 14DENNÍ ZKUŠEBNÍ VERZE!**\n\n👤 **Jméno:** ${leadRecord.name}\n✉️ **E-mail:** ${leadRecord.email}\n🏢 **Firma:** ${leadRecord.company || "Neuvedeno"}\n📁 **Soubor:** ${cleanFileName ? `\`${cleanFileName}\` (přiložen v e-mailu)` : "Žádný"}\n🔗 **Firmy:**\n\`\`\`\n${clientsPreview}\n\`\`\`\n🕒 **Čas:** ${leadRecord.timestamp}`
        }),
      });
    } catch (discordErr) {
      console.error("Discord webhook error:", discordErr);
    }
  }

  // 3. Instant Telegram Notification (if configured)
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    try {
      const tgText = `🚨 *Nová 14denní zkušební verze*\n\n*Jméno:* ${leadRecord.name}\n*E-mail:* ${leadRecord.email}\n*Firma:* ${leadRecord.company || "Neuvedeno"}\n*Soubor:* ${cleanFileName || "žádný"}\n*Firmy:* ${leadRecord.clients ? leadRecord.clients.slice(0, 200) : "V souboru"}`;
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
    JSON.stringify({ success: true, message: "Díky, login posíláme do 15 minut a firmy zprovozníme do 24 hodin." }),
    {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }
  );
}
