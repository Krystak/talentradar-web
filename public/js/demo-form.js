/**
 * The trial form's request body for POST /api/demo. The same fields as the
 * form on the site before November 2026 (worker.js reads exactly these);
 * tests/site.test.js sends this body through the Worker.
 *
 * elapsedMs is performance.now() at sending: the Worker judges "too fast" by it,
 * so a wrong clock never makes a person look like a bot. timestamp (clock time
 * at load) stays for pages still open from before.
 */
export function demoPayload({ name, email, company, clients, website, file, lang, timezone, timestamp, elapsedMs }) {
  return {
    name: String(name || "").trim(),
    email: String(email || "").trim(),
    company: String(company || "").trim(),
    clients: String(clients || "").trim(),
    fileName: file && file.name ? file.name : null,
    fileData: file && file.data ? file.data : null,
    website: String(website || "").trim(),
    lang: lang === "cs" ? "cs" : "en",
    timezone: timezone || "",
    timestamp: String(timestamp || ""),
    elapsedMs: Math.round(Number(elapsedMs) || 0),
  };
}

/** The fields the form must have filled before it is sent: name, e-mail, agency. */
export function missingRequired(payload) {
  return !payload.name || !payload.email || !payload.company;
}

/** Largest file the form accepts (the Worker refuses base64 over 8 MB). */
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
