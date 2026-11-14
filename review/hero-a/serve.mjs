// Lokalni nahled webu: node review/hero-a/serve.mjs public 8831  ->  http://127.0.0.1:8831/  (napodobuje Workers Assets: /cesta -> cesta.html, Range pro video)
// Minimal static server for public/ that mimics Workers Assets html_handling (path -> .html / index.html), with Range for video.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(process.argv[2]);
const port = Number(process.argv[3] || 8831);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".webm": "video/webm", ".vtt": "text/vtt", ".txt": "text/plain", ".xml": "application/xml", ".ico": "image/x-icon", ".woff2": "font/woff2" };
function resolve(p) {
  const cands = [p, p + ".html", path.join(p, "index.html")];
  for (const c of cands) { try { if (fs.statSync(c).isFile()) return c; } catch {} }
  return null;
}
http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  let p = path.join(root, decodeURIComponent(u.pathname));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  let f = resolve(p);
  let status = 200;
  if (!f) { f = path.join(root, u.pathname.startsWith("/en/") ? "en/404.html" : "404.html"); status = 404; }
  const size = fs.statSync(f).size;
  const type = types[path.extname(f)] || "application/octet-stream";
  const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
  if (range && status === 200) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Number(range[2]) : size - 1;
    res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
    return fs.createReadStream(f, { start, end }).pipe(res);
  }
  res.writeHead(status, { "Content-Type": type, "Content-Length": size, "Accept-Ranges": "bytes", "Cache-Control": "no-store" });
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(f).pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`serving ${root} on http://127.0.0.1:${port}`));
