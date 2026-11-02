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
    clients: cleanAiList(clients).trim(),
    fileName: file && file.name ? file.name : null,
    fileData: file && file.data ? file.data : null,
    website: String(website || "").trim(),
    lang: lang === "cs" ? "cs" : "en",
    timezone: timezone || "",
    timestamp: String(timestamp || ""),
    elapsedMs: Math.round(Number(elapsedMs) || 0),
  };
}

/** The first row of the table the brief for an AI asks for (trial_ai_brief), one per language. */
export const AI_LIST_HEADERS = ["Firma;Kariérní stránka;Poslední kontakt;Proběhla zakázka", "Company;Careers page;Last contact;Had placement"];

const unquoted = (cell) => cell.trim().replace(/^["„“”](.*)["“”]$/, "$1").trim();
const listRow = (line) => {
  const whole = line.trim().match(/^"([^"]*;[^"]*)"$/);
  return (whole ? whole[1] : line).split(";").map(unquoted).join(";");
};

/**
 * A table from the visitor's AI, as the form sends it. An AI often adds an introduction, a code
 * block, quotes and a closing line, and the app would read each of them as a company. With a
 * recognised first row: everything before it goes, so do lines with ``` and the outer quotes of cells.
 * After an empty line or a code block's end the table goes on only with rows of as many separators
 * as the first row: the first other line ends it, and all that follows goes ("Dejte vědět; rád pomůžu"
 * is no company). Inside the table a row with fewer stays. Without a recognised first row the
 * text stays exactly as it is: a list typed by hand is not touched.
 */
export function cleanAiList(text) {
  const raw = String(text ?? "");
  const lines = raw.split(/\r?\n/);
  const known = AI_LIST_HEADERS.map((h) => h.toLowerCase());
  const start = lines.findIndex((line) => known.includes(listRow(line.replace(/^\uFEFF/, "")).toLowerCase()));
  if (start < 0) return raw;
  const separators = (row) => row.split(";").length - 1;
  const width = separators(lines[start]);
  const out = [];
  let gap = false;
  for (const line of lines.slice(start)) {
    if (line.includes("```") || !line.trim()) {
      gap = true;
      continue;
    }
    const row = listRow(line.replace(/^\uFEFF/, ""));
    if (gap && separators(row) !== width) break;
    gap = false;
    out.push(row);
  }
  return out.join("\n");
}

/** The fields the form must have filled before it is sent: name, e-mail, agency. */
export function missingRequired(payload) {
  return !payload.name || !payload.email || !payload.company;
}

/**
 * Largest file the form accepts: 5 MB, as the page and the Worker's message say.
 * Base64 makes it ~6.7 MB, under the Worker's 8 MB cap on fileData.
 */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

/**
 * What the visitor sees after POST /api/demo: { ok: true } or { ok: false, message }.
 * The Worker's own refusals (400 and 429, JSON with `error`) say what to fix, in the
 * visitor's language. Anything else, a 413 or 500 from the platform, a non-JSON body
 * or a dropped connection, gets the page's generic message, never a SyntaxError.
 */
export async function demoResult(res, genericMessage) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (res.ok && data && data.success) return { ok: true };
  if ((res.status === 400 || res.status === 429) && data && typeof data.error === "string" && data.error) {
    return { ok: false, message: data.error };
  }
  return { ok: false, message: genericMessage };
}
