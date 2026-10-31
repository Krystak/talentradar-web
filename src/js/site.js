/**
 * The site's only script (ES module, no dependencies): menu, videos, chapters,
 * charts, the billing switch and the trial form. Every page works without it;
 * this adds behaviour, never content.
 */
import { demoPayload, demoResult, missingRequired, MAX_FILE_BYTES } from "./demo-form.js";
import { clipFor, clipKey } from "./media.js";

const T = (() => {
  try {
    return JSON.parse(document.getElementById("i18n").textContent);
  } catch {
    return {};
  }
})();
const t = (key, fallback = "") => T[key] || fallback;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const looksLikeEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const lang = document.documentElement.lang === "cs" ? "cs" : "en";
const stillPref = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ── Menu on narrow screens ── */
(function menu() {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!btn || !nav) return;
  btn.hidden = false;
  const set = (open) => {
    nav.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? t("nav_menu_close", "Close menu") : t("nav_menu_open", "Open menu"));
    const use = btn.querySelector("use");
    if (use) use.setAttribute("href", open ? "#i-close" : "#i-menu");
  };
  btn.addEventListener("click", () => set(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) set(false);
  });
})();

/* MediaQueryList "change" with the old addListener for Safari before 14. */
const onMediaChange = (mql, fn) => (mql.addEventListener ? mql.addEventListener("change", fn) : mql.addListener(fn));
/* The phone cut (4:5) shows under 640 px when a clip has one (components.css). */
const phone = window.matchMedia("(max-width: 640px)");
/* The video CSS shows in a figure: the desktop cut or the phone cut; the hidden one never loads or plays. */
const shownVideo = (fig) => [...fig.querySelectorAll("video")].find((v) => v.offsetParent !== null) || fig.querySelector("video");

/* ── Videos: load when near, play when seen, pause off screen; a pause button
      because a loop over 5 s that starts by itself must be stoppable (WCAG 2.2.2).
      With reduced motion: poster and the native controls only. The choice of
      cut is made again when the width changes (a phone turned on its side). ── */
(function videos() {
  const figures = [...document.querySelectorAll("[data-autoplay]")];
  if (!figures.length || !("IntersectionObserver" in window)) return;
  const label = (btn, paused) => {
    btn.querySelector("span").textContent = paused ? t("hero_video_play", "Play") : t("hero_video_pause", "Pause");
    const use = btn.querySelector("use");
    if (use) use.setAttribute("href", paused ? "#i-play_arrow" : "#i-pause");
  };
  const run = (fig) => {
    const v = shownVideo(fig);
    for (const other of fig.querySelectorAll("video")) if (other !== v) other.pause();
    if (fig.dataset.inView === "1" && fig.dataset.user !== "paused") {
      v.preload = "auto";
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };
  const near = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      near.unobserve(e.target);
      shownVideo(e.target).preload = "auto";
    }
  }, { rootMargin: "400px 0px" });
  const seen = new IntersectionObserver((entries) => {
    for (const { target: fig, isIntersecting } of entries) {
      fig.dataset.inView = isIntersecting ? "1" : "";
      run(fig);
    }
  }, { threshold: 0.5 });
  const live = figures.filter((fig) => fig.querySelector(".video__toggle") && !stillPref.matches);
  for (const fig of live) {
    const btn = fig.querySelector(".video__toggle");
    for (const v of fig.querySelectorAll("video")) {
      v.removeAttribute("controls");
      v.addEventListener("play", () => { if (v === shownVideo(fig)) label(btn, false); });
      v.addEventListener("pause", () => { if (v === shownVideo(fig)) label(btn, true); });
    }
    btn.hidden = false;
    btn.addEventListener("click", () => {
      const v = shownVideo(fig);
      fig.dataset.user = v.paused ? "" : "paused";
      if (v.paused) v.play().catch(() => {});
      else v.pause();
    });
    label(btn, true);
    near.observe(fig);
    seen.observe(fig);
  }
  onMediaChange(phone, () => live.forEach(run));
})();

/* ── The tour on /demo: nothing loads before the click (preload none); the
      button only starts it, the native controls stay. ── */
(function tourFacade() {
  document.querySelectorAll("[data-facade]").forEach((fig) => {
    const v = fig.querySelector("video");
    const btn = fig.querySelector(".video__play");
    if (!v || !btn) return;
    btn.hidden = false;
    btn.addEventListener("click", () => {
      btn.hidden = true;
      v.play().catch(() => { btn.hidden = false; });
    });
    v.addEventListener("play", () => { btn.hidden = true; });
  });
})();

/* ── Chapters over the "How it works" video (tabs) ── */
(function chapters() {
  document.querySelectorAll("[data-chapters]").forEach((root) => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const fig = root.querySelector("figure.video");
    root.querySelectorAll("[data-js-hidden]").forEach((p) => { p.hidden = true; });
    // every cut of the chapter's clip: all <source>s (WebM + MP4) for the desktop
    // video and for the phone video, then load(); only the shown one plays
    const swap = (tab) => {
      if (!fig || !tab.dataset.clip) return;
      let clip;
      try { clip = JSON.parse(tab.dataset.clip); } catch { return; }
      for (const v of fig.querySelectorAll("video")) {
        if (tab.dataset.label) v.setAttribute("aria-label", tab.dataset.label);
        const cut = clipFor(clip, !!v.closest(".video--mobile"));
        if (v.dataset.clip === clipKey(cut)) continue;
        v.dataset.clip = clipKey(cut);
        v.pause();
        v.querySelectorAll("source").forEach((s) => s.remove());
        for (const s of cut.sources) {
          const el = document.createElement("source");
          el.src = s.src;
          el.type = s.type;
          v.appendChild(el);
        }
        v.poster = cut.poster || "";
        v.load();
      }
      const v = shownVideo(fig);
      if (!stillPref.matches && fig.dataset.inView === "1" && fig.dataset.user !== "paused") v.play().catch(() => {});
    };
    const select = (tab, focus) => {
      for (const other of tabs) {
        const on = other === tab;
        other.setAttribute("aria-selected", String(on));
        other.tabIndex = on ? 0 : -1;
        document.getElementById(other.getAttribute("aria-controls")).hidden = !on;
      }
      if (focus) tab.focus();
      swap(tab);
    };
    // the first chapter's clip is in the HTML already; mark it so it isn't loaded twice
    if (fig && tabs[0] && tabs[0].dataset.clip) {
      try {
        const clip = JSON.parse(tabs[0].dataset.clip);
        for (const v of fig.querySelectorAll("video")) v.dataset.clip = clipKey(clipFor(clip, !!v.closest(".video--mobile")));
      } catch { /* the HTML clip stays */ }
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab, false));
      tab.addEventListener("keydown", (e) => {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === "Home") select(tabs[0], true);
        else if (e.key === "End") select(tabs[tabs.length - 1], true);
        else if (step) select(tabs[(i + step + tabs.length) % tabs.length], true);
        else return;
        e.preventDefault();
      });
    });
  });
})();

/* ── Charts 1 and 3: open beside chart 2 from 760 px; on a phone they wait in a
      closed <details> (a click, or a screen reader, opens it). ── */
(function moreCharts() {
  const more = document.querySelector("[data-charts-more]");
  if (!more) return;
  const wide = window.matchMedia("(min-width: 760px)");
  // is-synced hides the summary on a wide screen (components.css) only once this
  // has opened the charts; without this script the summary stays as the way in
  const sync = () => {
    more.open = wide.matches;
    more.classList.add("is-synced");
  };
  sync();
  onMediaChange(wide, sync);
})();

/* ── Charts grow in as they scroll into view. The finished chart is the default:
      without JS, with reduced motion, for a chart already on screen at load and
      in a full-page picture nothing is ever hidden. Only a chart about to enter
      the screen is set to zero (is-pre), and it grows once it is in (is-run). ── */
(function charts() {
  const all = [...document.querySelectorAll("[data-reveal]")];
  if (!("IntersectionObserver" in window) || stillPref.matches || !all.length) return;
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      seen.unobserve(e.target);
      requestAnimationFrame(() => {
        e.target.classList.add("is-run");
        e.target.classList.remove("is-pre");
      });
    }
  }, { threshold: 0.3 });
  // prime a chart when it comes within a quarter screen below the viewport;
  // one that is already on screen by then (a fast scroll, a jump) stays finished
  const watch = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      watch.unobserve(e.target);
      if (e.boundingClientRect.top < window.innerHeight) continue;
      e.target.classList.add("is-pre");
      seen.observe(e.target);
    }
  }, { rootMargin: "0px 0px 25% 0px" });
  // at load, charts already within reach of the screen stay finished
  requestAnimationFrame(() => {
    for (const el of all) {
      if (el.getBoundingClientRect().top >= window.innerHeight * 1.25) watch.observe(el);
    }
  });
})();

/* ── Pricing: monthly / yearly ── */
(function billing() {
  const toggle = document.querySelector("[data-billing-toggle]");
  const box = document.querySelector("[data-billing]");
  if (!toggle || !box) return;
  toggle.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-billing-set]");
    if (!btn) return;
    box.dataset.billing = btn.dataset.billingSet;
    toggle.querySelectorAll("[data-billing-set]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  });
})();

/* ── Help dialog: what the company list should look like ── */
(function help() {
  const btn = document.getElementById("clients-help-btn");
  const dlg = document.getElementById("clients-help");
  if (!btn || !dlg || typeof dlg.showModal !== "function") return;
  btn.addEventListener("click", () => dlg.showModal());
  dlg.querySelectorAll("[data-close-help]").forEach((b) => b.addEventListener("click", () => dlg.close()));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
})();

/* ── Trial form: POST /api/demo, same fields and states as before ── */
(function trialForm() {
  const form = document.getElementById("demo-form");
  if (!form) return;
  const stamp = document.getElementById("form-timestamp");
  stamp.value = Date.now().toString();
  const error = document.getElementById("form-error");
  const submit = document.getElementById("submit-btn");
  const fileInput = document.getElementById("file-upload");
  const prompt = document.getElementById("file-prompt");
  const selected = document.getElementById("file-selected");
  const fileName = document.getElementById("file-name");
  let file = null;
  let fileReady = Promise.resolve();

  const showError = (msg) => {
    error.textContent = msg;
    error.hidden = false;
  };

  fileInput.addEventListener("change", () => {
    const f = fileInput.files && fileInput.files[0];
    if (!f) return;
    if (!/\.(xlsx|xls|csv)$/i.test(f.name)) {
      showError(t("form_err_file_type", "Please upload Excel (.xlsx, .xls) or .csv."));
      fileInput.value = "";
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      showError(t("form_err_file_large", "The file is too large (5 MB at most)."));
      fileInput.value = "";
      return;
    }
    error.hidden = true;
    file = { name: f.name, data: null };
    fileName.textContent = `${f.name} (${Math.round(f.size / 1024)} KB)`;
    prompt.hidden = true;
    selected.hidden = false;
    // sending waits for this (fileReady), so a file still being read is never left out
    const current = file;
    fileReady = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => { current.data = ev.target.result; resolve(); };
      reader.onerror = () => resolve();
      reader.readAsDataURL(f);
    });
  });

  document.getElementById("file-remove").addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    file = null;
    fileInput.value = "";
    selected.hidden = true;
    prompt.hidden = false;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.hidden = true;
    error.textContent = "";
    if (file && !file.data) {
      submit.disabled = true;
      await fileReady; // the file is still being read: send it, don't drop it
      submit.disabled = false;
    }
    const value = (id) => document.getElementById(id).value;
    let timezone = "";
    try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch { /* old browser */ }
    const body = demoPayload({
      name: value("name"), email: value("email"), company: value("company"), clients: value("clients"),
      website: value("website_hp"), file: file && file.data ? file : null, lang, timezone,
      timestamp: stamp.value, elapsedMs: performance.now(),
    });
    if (missingRequired(body)) {
      showError(t("form_err_required", "Please fill in your name, work e-mail and agency name."));
      return;
    }
    if (!looksLikeEmail(body.email)) {
      showError(t("form_err_email", "Please check the e-mail address."));
      document.getElementById("email").focus();
      return;
    }

    const original = submit.innerHTML;
    submit.disabled = true;
    submit.textContent = t("trial_submitting", "Sending…");
    const generic = t("form_err_generic", "Something went wrong.");
    let result;
    try {
      const res = await fetch("/api/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      result = await demoResult(res, generic);
    } catch {
      result = { ok: false, message: generic }; // no connection: the browser's own text is English only
    }
    if (!result.ok) {
      showError(result.message);
      submit.disabled = false;
      submit.innerHTML = original;
      return;
    }
    const wrap = document.getElementById("form-wrapper");
    wrap.innerHTML = `<div class="success" tabindex="-1">
  <h3><svg class="ic" aria-hidden="true"><use href="#i-check"></use></svg>${esc(t("form_state_success_title"))}</h3>
  <ol><li>${esc(t("form_state_success_s1"))}</li><li>${esc(t("form_state_success_s2"))}</li><li>${esc(t("form_state_success_s3"))}</li></ol>
  <p class="note">${esc(t("form_state_success_foot"))}</p>
</div>`;
    wrap.querySelector(".success").focus();
  });
})();
