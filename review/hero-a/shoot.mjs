// Screenshoty a stav <video> v headless Chrome: node review/hero-a/shoot.mjs review <jobs.json>  (server z serve.mjs musi bezet na 8831; jobs = [{path,w,h,out,wait,scrollTo?,full?}])
// Headless Chrome via CDP: for each job, set viewport, load page, wait, report <video> state, save screenshot.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const outRoot = process.argv[2];
const base = "http://127.0.0.1:8831";
const jobs = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));

const udd = fs.mkdtempSync(path.join(os.tmpdir(), "cdp-"));
const proc = spawn(CHROME, ["--headless=new", "--remote-debugging-port=9333", `--user-data-dir=${udd}`, "--autoplay-policy=no-user-gesture-required", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
let ver;
for (let i = 0; i < 50; i++) { try { ver = await (await fetch("http://127.0.0.1:9333/json/version")).json(); break; } catch { await new Promise(r => setTimeout(r, 200)); } }
const targets = await (await fetch("http://127.0.0.1:9333/json")).json();
const page = targets.find(t => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener("open", r));
let id = 0; const pending = new Map(); const events = [];
ws.addEventListener("message", ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) events.push(m); });
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async expr => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
await send("Page.enable"); await send("Runtime.enable");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];
for (const j of jobs) {
  const mobile = j.w < 768;
  await send("Emulation.setDeviceMetricsOverride", { width: j.w, height: j.h, deviceScaleFactor: 1, mobile });
  await send("Emulation.setTouchEmulationEnabled", { enabled: mobile });
  await send("Page.navigate", { url: base + j.path });
  await sleep(j.wait ?? 4000);
  if (j.scrollTo) { await evalJs(`(document.querySelector(${JSON.stringify(j.scrollTo)})||document.body).scrollIntoView({block:'start'})`); await sleep(1500); }
  const info = await evalJs(`(${(() => {
    const vids = [...document.querySelectorAll('video')].filter(v => v.getBoundingClientRect().width > 0 && v.getBoundingClientRect().top < innerHeight && v.getBoundingClientRect().bottom > 0);
    return {
      overflowX: document.documentElement.scrollWidth > innerWidth ? document.documentElement.scrollWidth : false,
      videos: vids.map(v => { const r = v.getBoundingClientRect(); return { src: v.currentSrc.split('/').pop().split('?')[0], paused: v.paused, t: +v.currentTime.toFixed(2), box: `${r.width|0}x${r.height|0}`, boxRatio: +(r.width / r.height).toFixed(3), vidRatio: v.videoWidth ? +(v.videoWidth / v.videoHeight).toFixed(3) : null, fit: getComputedStyle(v).objectFit }; })
    };
  }).toString()})()`);
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: !!j.full, ...(j.full ? { clip: await (async () => { const h = await evalJs("document.documentElement.scrollHeight"); return { x: 0, y: 0, width: j.w, height: Math.min(h, 16000), scale: 1 }; })() } : {}) });
  const out = path.join(outRoot, j.out);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(shot.result.data, "base64"));
  results.push({ out: j.out, ...info });
}
const errs = events.filter(e => e.method === "Runtime.exceptionThrown").map(e => e.params.exceptionDetails?.exception?.description || e.params.exceptionDetails?.text);
console.log(JSON.stringify({ results, jsErrors: errs }, null, 1));
ws.close(); proc.kill();
