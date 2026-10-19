/**
 * TalentRadar - the confirmation e-mail and the address check for the trial form.
 *
 * The layout is the application's core/email_layout.py drawn in JavaScript:
 * a dark band with the hawk and the TALENTRADAR wordmark, a white card,
 * Kryštof's signature, a short footer. Table-based with inline styles so
 * Gmail, Outlook and Apple Mail render it alike. Change both together.
 *
 * DISPOSABLE_DOMAINS is kept in step with core/email_check.py.
 */

export const SENDER_NAME = "Kryštof Pejša · TalentRadar";
export const REPLY_TO = "krystof@talentradar.eu";
export const LOGO_URL = "https://talentradar.eu/img/email/logo-96.png";
export const PHOTO_URL = "https://talentradar.eu/img/email/krystof-96.jpg";

const INK = "#1B1916";
const MUTED = "#6B645C";
const LINE = "#ECE7E1";
const ORANGE = "#FF5500";
const ORANGE_TEXT = "#B33F00";
const ORANGE_SOFT = "#FFF1E8";
const NIGHT = "#0F1117";
const PAGE = "#F3F1EE";
const FONT = "Arial, Helvetica, sans-serif";

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" }[c]));
}

const p = (html, { size = 15, color = INK, bottom = 14 } = {}) =>
  `<p style="margin:0 0 ${bottom}px 0;font-family:${FONT};font-size:${size}px;line-height:1.6;color:${color};">${html}</p>`;

const heading = (text) =>
  `<h1 style="margin:0 0 16px 0;font-family:${FONT};font-size:24px;line-height:1.25;color:${INK};font-weight:700;">${escapeHtml(text)}</h1>`;

function steps(items) {
  const rows = items.map(([state, label, note], i) => {
    const n = i + 1;
    let dot;
    let color = MUTED;
    if (state === "done") {
      dot = `<td width="26" height="26" align="center" bgcolor="${INK}" style="border-radius:13px;font-family:${FONT};font-size:13px;font-weight:700;color:#FFFFFF;">&#10003;</td>`;
    } else if (state === "now") {
      dot = `<td width="22" height="22" align="center" bgcolor="${ORANGE_SOFT}" style="border:2px solid ${ORANGE};border-radius:13px;font-family:${FONT};font-size:13px;font-weight:700;color:${ORANGE_TEXT};">${n}</td>`;
      color = INK;
    } else {
      dot = `<td width="24" height="24" align="center" style="border:1px solid ${LINE};border-radius:13px;font-family:${FONT};font-size:13px;color:${MUTED};">${n}</td>`;
    }
    return `<tr><td width="38" valign="top" style="padding:0 0 12px 0;">`
      + `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${dot}</tr></table></td>`
      + `<td valign="top" style="padding:3px 0 12px 0;font-family:${FONT};">`
      + `<div style="font-size:15px;line-height:1.35;color:${color};font-weight:${state === "now" ? 700 : 400};">${escapeHtml(label)}</div>`
      + (note ? `<div style="font-size:13px;line-height:1.45;color:${MUTED};padding-top:2px;">${escapeHtml(note)}</div>` : "")
      + `</td></tr>`;
  });
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:2px 0 14px 0;">${rows.join("")}</table>`;
}

const FOOTER = {
  cs: { role: "zakladatel TalentRadaru", footer: "Tenhle e-mail vám přišel, protože jste si na talentradar.eu zažádali o zkušební verzi." },
  en: { role: "founder, TalentRadar", footer: "You are getting this e-mail because you asked for a trial on talentradar.eu." },
};

export function render(lang, preheader, blocks) {
  const t = FOOTER[lang];
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><title>TalentRadar</title></head>
<body style="margin:0;padding:0;background:${PAGE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${PAGE};">${escapeHtml(preheader)}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAGE}" style="background:${PAGE};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td bgcolor="${NIGHT}" style="background:${NIGHT};border-radius:12px 12px 0 0;padding:16px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="40" valign="middle"><img src="${LOGO_URL}" width="36" height="36" alt="" style="display:block;border:0;"></td>
<td valign="middle" style="padding-left:10px;font-family:${FONT};font-size:17px;font-weight:700;letter-spacing:1px;color:#FFFFFF;">TALENT<span style="color:${ORANGE};">RADAR</span></td>
</tr></table></td></tr>
<tr><td bgcolor="#FFFFFF" style="background:#FFFFFF;padding:28px 24px 8px 24px;">
${blocks.join("\n")}
</td></tr>
<tr><td bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:0 0 12px 12px;padding:0 24px 24px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${LINE};"><tr>
<td width="56" valign="middle" style="padding-top:16px;"><img src="${PHOTO_URL}" width="48" height="48" alt="Kryštof Pejša" style="display:block;border:0;border-radius:24px;"></td>
<td valign="middle" style="padding:16px 0 0 4px;font-family:${FONT};font-size:13px;line-height:1.45;color:${MUTED};">
<span style="font-size:15px;font-weight:700;color:${INK};">Kryštof Pejša</span><br>${t.role}<br>
<a href="mailto:${REPLY_TO}" style="color:${MUTED};">${REPLY_TO}</a></td>
</tr></table></td></tr>
<tr><td align="center" style="padding:16px 12px 0 12px;font-family:${FONT};font-size:12px;line-height:1.5;color:#8A837B;">
${t.footer}<br><a href="https://talentradar.eu" style="color:#8A837B;">talentradar.eu</a></td></tr>
</table></td></tr></table>
</body></html>`;
}

function greeting(name, lang) {
  // A first name in the Czech nominative ("Dobrý den, Petra,") reads like a
  // mail merge, and the vocative cannot be derived reliably.
  if (lang === "cs") return "Dobrý den,";
  const first = String(name || "").trim().split(/\s+/)[0] || "";
  return first ? `Hi ${first},` : "Hi there,";
}

/** The e-mail the visitor gets the moment the trial form is sent: {subject, preheader, html, text}. */
export function confirmationEmail(name, lang) {
  const g = greeting(name, lang);
  if (lang === "cs") {
    const subject = "Máme vaši registraci, TalentRadar připravujeme";
    const preheader = "Do pár minut založíme workspace a spustíme první sken vašich firem.";
    const stepsCs = [
      ["done", "Registrace a seznam firem", ""],
      ["now", "Workspace a první sken", "Dohledáme kariérní stránky vašich firem a projdeme otevřené pozice. U menšího seznamu pár minut, u 100 a více firem déle."],
      ["next", "Přihlášení", "Pošlu vám druhý e-mail s odkazem na nastavení hesla a s prvními nalezenými rolemi."],
    ];
    const reply = "Kdyby se u některých firem nedaly kariérní stránky najít automaticky, napíšu vám, co dodělám ručně. Na tenhle e-mail stačí odpovědět, chodí přímo mně.";
    const spam = "Kdyby tenhle e-mail skončil ve spamu, označte ho prosím jako „Není spam“, ať vám dorazí i odkaz na přihlášení.";
    const html = render("cs", preheader, [
      p(escapeHtml(g)), heading("Registrace dorazila"),
      p("Díky za zájem o TalentRadar. Seznam vašich firem máme a teď pro vaši agenturu chystáme samostatný workspace."),
      steps(stepsCs), p(escapeHtml(reply)), p(escapeHtml(spam), { size: 13, color: MUTED, bottom: 18 }),
    ]);
    const text = `${g}

díky za zájem o TalentRadar. Seznam vašich firem máme a teď pro vaši agenturu chystáme samostatný workspace.

Co bude dál:
1. Registrace a seznam firem: hotovo.
2. Workspace a první sken: ${stepsCs[1][2]}
3. Přihlášení: ${stepsCs[2][2]}

${reply}

${spam}

Kryštof Pejša
zakladatel TalentRadaru
${REPLY_TO}
`;
    return { subject, preheader, html, text };
  }

  const subject = "Got it: we're setting up your TalentRadar";
  const preheader = "Within a few minutes we create your workspace and run the first scan of your companies.";
  const stepsEn = [
    ["done", "Sign-up and company list", ""],
    ["now", "Workspace and first scan", "We find your companies' careers pages and go through their open roles. A few minutes for a short list, longer for 100+ companies."],
    ["next", "Sign in", "I send you a second e-mail with a link to set your password and the first roles we found."],
  ];
  const reply = "If some careers pages cannot be found automatically, I will tell you what I am finishing by hand. Just reply to this e-mail, it comes straight to me.";
  const spam = "If this e-mail landed in spam, please mark it as “Not spam” so your sign-in link reaches you too.";
  const html = render("en", preheader, [
    p(escapeHtml(g)), heading("Your sign-up is in"),
    p("Thanks for trying TalentRadar. We have your company list and are now setting up a workspace of your own."),
    steps(stepsEn), p(escapeHtml(reply)), p(escapeHtml(spam), { size: 13, color: MUTED, bottom: 18 }),
  ]);
  const text = `${g}

thanks for trying TalentRadar. We have your company list and are now setting up a workspace of your own.

What happens next:
1. Sign-up and company list: done.
2. Workspace and first scan: ${stepsEn[1][2]}
3. Sign in: ${stepsEn[2][2]}

${reply}

${spam}

Kryštof Pejša
founder, TalentRadar
${REPLY_TO}
`;
  return { subject, preheader, html, text };
}

// ── Is the address worth sending to? ─────────────────────────────────────────
// A bounce costs talentradar.eu reputation with spam filters, so the form
// refuses addresses that cannot receive mail before anything is sent.

export const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "sharklasers.com",
  "grr.la", "10minutemail.com", "10minutemail.net", "temp-mail.org", "temp-mail.io", "tempmail.com",
  "tempmail.net", "tempmailo.com", "tempr.email", "tempail.com", "tempinbox.com", "yopmail.com",
  "yopmail.fr", "trashmail.com", "trashmail.de", "getnada.com", "nada.email", "dispostable.com",
  "maildrop.cc", "throwawaymail.com", "fakeinbox.com", "mintemail.com", "mohmal.com", "emailondeck.com",
  "burnermail.io", "moakt.com", "mail.tm", "spamgourmet.com", "mytemp.email", "1secmail.com",
  "tmpmail.org", "discard.email", "mailnesia.com", "mailcatch.com", "inboxkitten.com", "emailfake.com",
  "crazymailing.com", "mailpoof.com", "33mail.com", "spambox.us", "mailsac.com", "harakirimail.com",
  "byom.de", "einrot.com", "jetable.org", "trbvm.com", "dropmail.me",
]);

/**
 * { ok, reason }: reason is "" when fine, "disposable", "no_domain" or
 * "no_mx" when refused, "unchecked" when DNS could not be asked (let through:
 * a DNS hiccup must not cost a real agency its trial).
 */
export async function checkAddress(email, fetchImpl = fetch) {
  const match = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(String(email || "").trim().toLowerCase());
  if (!match) return { ok: false, reason: "syntax" };
  const domain = match[1].replace(/\.$/, "");
  if (DISPOSABLE_DOMAINS.has(domain)) return { ok: false, reason: "disposable" };
  let answer;
  try {
    const res = await fetchImpl(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`, {
      headers: { accept: "application/dns-json" },
    });
    if (!res.ok) return { ok: true, reason: "unchecked" };
    answer = await res.json();
  } catch (err) {
    return { ok: true, reason: "unchecked" };
  }
  if (answer.Status === 3) return { ok: false, reason: "no_domain" };
  if (answer.Status !== 0) return { ok: true, reason: "unchecked" };
  const hosts = (answer.Answer || []).filter((a) => a.type === 15).map((a) => String(a.data || ""));
  // "0 ." is a null MX: the domain says outright that it takes no mail.
  if (!hosts.some((h) => h.trim().split(/\s+/).pop() !== ".")) return { ok: false, reason: "no_mx" };
  return { ok: true, reason: "" };
}

export const ADDRESS_ERRORS = {
  disposable: {
    cs: "Použijte prosím pracovní e-mail. Na dočasnou schránku zkušební verzi založit nemůžeme.",
    en: "Please use your work e-mail. We cannot set up a trial on a temporary inbox.",
  },
  no_domain: {
    cs: "Doména v e-mailu neexistuje. Zkontrolujte prosím adresu, nebo napište na krystof@talentradar.eu.",
    en: "The domain in this e-mail address does not exist. Please check it, or write to krystof@talentradar.eu.",
  },
  no_mx: {
    cs: "Na tuhle adresu nejde doručit e-mail (doména nemá poštovní server). Zkontrolujte ji prosím, nebo napište na krystof@talentradar.eu.",
    en: "This address cannot receive e-mail (its domain has no mail server). Please check it, or write to krystof@talentradar.eu.",
  },
};
