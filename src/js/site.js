/**
 * The site's only script (ES module, no dependencies): menu, videos, chapters,
 * charts, the billing switch and the trial form. Every page works without it;
 * this adds behaviour, never content.
 */
import { demoPayload, missingRequired, MAX_FILE_BYTES } from "./demo-form.js";

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

/* ── Videos: load when near, play when seen, pause off screen; a pause button
      because a loop over 5 s that starts by itself must be stoppable (WCAG 2.2.2).
      With reduced motion: poster and the native controls only. ── */
(function videos() {
  const figures = document.querySelectorAll("[data-autoplay]");
  if (!figures.length || !("IntersectionObserver" in window)) return;
  const label = (btn, paused) => {
    btn.querySelector("span").textContent = paused ? t("hero_video_play", "Play") : t("hero_video_pause", "Pause");
    const use = btn.querySelector("use");
    if (use) use.setAttribute("href", paused ? "#i-play_arrow" : "#i-pause");
  };
  const near = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.preload = "auto";
        near.unobserve(e.target);
      }
    }
  }, { rootMargin: "400px 0px" });
  const seen = new IntersectionObserver((entries) => {
    for (const { target: v, isIntersecting } of entries) {
      if (!isIntersecting) {
        v.pause();
      } else if (!stillPref.matches && v.dataset.user !== "paused") {
        v.play().catch(() => {});
      }
    }
  }, { threshold: 0.5 });
  figures.forEach((fig) => {
    const v = fig.querySelector("video");
    const btn = fig.querySelector(".video__toggle");
    if (!v || !btn || stillPref.matches) return;
    v.removeAttribute("controls");
    btn.hidden = false;
    v.addEventListener("play", () => label(btn, false));
    v.addEventListener("pause", () => label(btn, true));
    btn.addEventListener("click", () => {
      if (v.paused) {
        v.dataset.user = "";
        v.play().catch(() => {});
      } else {
        v.dataset.user = "paused";
        v.pause();
      }
    });
    label(btn, true);
    near.observe(v);
    seen.observe(v);
  });
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
    const video = root.querySelector("video");
    root.querySelectorAll("[data-js-hidden]").forEach((p) => { p.hidden = true; });
    const select = (tab, focus) => {
      for (const other of tabs) {
        const on = other === tab;
        other.setAttribute("aria-selected", String(on));
        other.tabIndex = on ? 0 : -1;
        document.getElementById(other.getAttribute("aria-controls")).hidden = !on;
      }
      if (focus) tab.focus();
      if (video && tab.dataset.label) video.setAttribute("aria-label", tab.dataset.label);
      const src = tab.dataset.src;
      if (video && src && !video.currentSrc.endsWith(src)) {
        video.poster = tab.dataset.poster || "";
        video.querySelector("source").src = src;
        video.load();
        if (!stillPref.matches && video.dataset.user !== "paused") video.play().catch(() => {});
      }
    };
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

/* ── Charts grow in when they come into view (CSS does the motion; without JS
      or with reduced motion they are simply there) ── */
(function charts() {
  const all = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || stillPref.matches) {
    all.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.25 });
  all.forEach((el) => io.observe(el));
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
      showError(t("form_err_file_large", "The file is too large (8 MB at most)."));
      fileInput.value = "";
      return;
    }
    error.hidden = true;
    file = { name: f.name, data: null };
    fileName.textContent = `${f.name} (${Math.round(f.size / 1024)} KB)`;
    prompt.hidden = true;
    selected.hidden = false;
    const reader = new FileReader();
    reader.onload = (ev) => { if (file) file.data = ev.target.result; };
    reader.readAsDataURL(f);
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
    try {
      const res = await fetch("/api/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await res.json().catch(() => ({}));
      // The Worker's own refusals (400, 429) say what to fix; anything else gets the
      // page's message in the page's language (its 502 text is English only).
      if (!res.ok || !result.success) throw new Error((res.status === 400 || res.status === 429) && result.error ? result.error : t("form_err_generic"));
      const wrap = document.getElementById("form-wrapper");
      wrap.innerHTML = `<div class="success" tabindex="-1">
  <h3><svg class="ic" aria-hidden="true"><use href="#i-check"></use></svg>${esc(t("form_state_success_title"))}</h3>
  <ol><li>${esc(t("form_state_success_s1"))}</li><li>${esc(t("form_state_success_s2"))}</li><li>${esc(t("form_state_success_s3"))}</li></ol>
  <p class="note">${esc(t("form_state_success_foot"))}</p>
</div>`;
      wrap.querySelector(".success").focus();
    } catch (err) {
      showError((err && err.message) || t("form_err_generic", "Something went wrong."));
      submit.disabled = false;
      submit.innerHTML = original;
    }
  });
})();
