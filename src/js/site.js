/**
 * The site's only script (ES module, no dependencies): menu, the bars on a
 * phone, videos, chapters, charts, the billing switch and the trial form.
 * Every page works without it; this adds behaviour, never content.
 */
import { demoPayload, demoResult, MAX_FILE_BYTES } from "./demo-form.js";
import { clipFor, clipKey, cueNow, largestVideo, savesData } from "./media.js";

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

/* MediaQueryList "change" with the old addListener for Safari before 14. */
const onMediaChange = (mql, fn) => (mql.addEventListener ? mql.addEventListener("change", fn) : mql.addListener(fn));
/* The phone layout (≤ 767 px, components.css .m-only / .d-only) and the 4:5 cut of a clip. */
const phone = window.matchMedia("(max-width: 767px)");
/* Where the menu is a panel under the bar. */
const narrow = window.matchMedia("(max-width: 1000px)");
/* Where the top bar hides while scrolling down: a phone, upright or on its side. */
const slimBar = window.matchMedia("(max-width: 767px), (max-height: 500px) and (orientation: landscape)");

const header = document.querySelector("[data-header]");
const actionBar = document.querySelector("[data-action-bar]");
/* A link to the form is moving the page: the bar stays, or the heading would have nothing above it. */
let holdHeader = false;
/* Things that keep the bottom bar away; each part of the page that has a say sets its own reason. */
const barHold = new Set();
let updateBar = () => {};

/* ── Menu on narrow screens: a panel under the bar. Esc and a tap outside close
      it and give the focus back to the button; Tab stays inside; the page under
      it does not scroll. ── */
const menu = (() => {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!btn || !nav) return { isOpen: () => false };
  btn.hidden = false;
  const scrim = document.createElement("div");
  scrim.className = "nav-scrim";
  scrim.setAttribute("aria-hidden", "true");
  document.body.appendChild(scrim);
  const isOpen = () => nav.classList.contains("is-open");
  const focusables = () => [btn, ...nav.querySelectorAll("a[href], button:not([disabled])")].filter((el) => el.offsetParent !== null || el === btn);
  const set = (open, { focusButton = false } = {}) => {
    nav.classList.toggle("is-open", open);
    scrim.classList.toggle("is-open", open);
    document.documentElement.classList.toggle("is-locked", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? t("nav_menu_close", "Close menu") : t("nav_menu_open", "Open menu"));
    const use = btn.querySelector("use");
    if (use) use.setAttribute("href", open ? "#i-close" : "#i-menu");
    if (open && header) header.classList.remove("is-hidden");
    if (open) barHold.add("menu");
    else barHold.delete("menu");
    updateBar();
    if (!open && focusButton) btn.focus({ preventScroll: true });
  };
  btn.addEventListener("click", () => set(!isOpen()));
  scrim.addEventListener("click", () => set(false, { focusButton: true }));
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) set(false);
  });
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") {
      e.preventDefault();
      set(false, { focusButton: true });
    } else if (e.key === "Tab") {
      // the focus stays in the menu and its button while the menu is open
      const list = focusables();
      const i = list.indexOf(document.activeElement);
      const next = e.shiftKey ? (i <= 0 ? list.length - 1 : i - 1) : i === list.length - 1 || i < 0 ? 0 : i + 1;
      e.preventDefault();
      list[next].focus();
    }
  });
  // a tap anywhere else (the bar itself, a phone turned to a wide screen) closes it too
  document.addEventListener("pointerdown", (e) => {
    if (isOpen() && !nav.contains(e.target) && !btn.contains(e.target) && e.target !== scrim) set(false);
  });
  onMediaChange(narrow, () => { if (!narrow.matches && isOpen()) set(false); });
  return { isOpen };
})();

/* ── The top bar on a phone hides while scrolling down and comes back on the way up. ── */
(function hidingHeader() {
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;
  const check = () => {
    ticking = false;
    const y = window.scrollY;
    if (!slimBar.matches || menu.isOpen() || y < 80 || holdHeader) header.classList.remove("is-hidden");
    else if (y > lastY + 4) header.classList.add("is-hidden");
    else if (y < lastY - 4) header.classList.remove("is-hidden");
    lastY = y;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(check);
    }
  }, { passive: true });
  // a keyboard user who tabs into the bar gets it back
  header.addEventListener("focusin", () => header.classList.remove("is-hidden"));
  onMediaChange(slimBar, check);
})();

/* ── The bar at the bottom of a phone: shown only while no other main button,
      the trial form or the footer is on screen and the menu is closed, so a
      screen never has two main buttons (lead, etapa 4a). Hidden, it is inert. ── */
(function bottomBar() {
  if (!actionBar || !("IntersectionObserver" in window)) return;
  const form = document.getElementById("demo-form");
  const watched = [
    // the tour's play button on /demo looks like a main button (orange frame): it counts as one
    ...[...document.querySelectorAll(".btn-primary, .video__play")].filter((el) => !actionBar.contains(el) && !el.closest("#site-nav, dialog") && !el.classList.contains("btn--nav")),
    ...(form && form.closest("section") ? [form.closest("section")] : []),
    ...document.querySelectorAll("[data-footer]"),
  ];
  // the top bar's own main button (shown from 768 px): on a phone on its side it steps back
  // while another main button is on screen, so that one screen has one main button
  const navCta = document.querySelector(".btn--nav");
  const sideways = window.matchMedia("(min-width: 768px) and (max-height: 500px) and (orientation: landscape)");
  const inView = new Set();
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) inView.add(e.target);
      else inView.delete(e.target);
    }
    updateBar();
  });
  watched.forEach((el) => seen.observe(el));
  updateBar = () => {
    // only what is laid out counts (a .d-only button is display: none on a phone)
    const laidOut = [...inView].filter((el) => el.getClientRects().length > 0);
    const busy = laidOut.length > 0;
    if (navCta) navCta.classList.toggle("is-quiet", sideways.matches && laidOut.some((el) => el.matches(".btn-primary, .video__play")));
    const show = phone.matches && !busy && barHold.size === 0;
    actionBar.classList.toggle("is-shown", show);
    actionBar.inert = !show;
    if (show) actionBar.removeAttribute("aria-hidden");
    else actionBar.setAttribute("aria-hidden", "true");
  };
  // the keyboard is up while a field has the focus: no bar over it
  document.addEventListener("focusin", (e) => {
    if (e.target.matches("input, textarea, select")) barHold.add("field");
    updateBar();
  });
  document.addEventListener("focusout", () => {
    // the next element has the focus only after focusout
    setTimeout(() => {
      if (!document.activeElement || !document.activeElement.matches("input, textarea, select")) barHold.delete("field");
      updateBar();
    }, 0);
  });
  onMediaChange(phone, updateBar);
  onMediaChange(sideways, updateBar);
  updateBar();
})();

/* The video CSS shows in a figure: the desktop cut or the phone cut. The hidden one's file never loads or plays
   (nor does its poster: it is the background of the screen, see videoFigure in build.mjs). */
const shownVideo = (fig) => [...fig.querySelectorAll("video")].find((v) => v.offsetParent !== null) || fig.querySelector("video");
/* A loop that waits for a tap on a phone (every one but the hero) and has not had it yet. */
const waitsForTap = (fig) => fig.hasAttribute("data-tap-phone") && phone.matches && fig.dataset.tapped !== "1";
/* The line under a video says the sentence of this moment of the clip (times: media.json), the first one of a
   clip that does not play. Without this script and with reduced motion the first sentence stays. */
const showCue = (fig) => {
  const all = [...fig.querySelectorAll(".video__cue-line")];
  if (!all.length) return;
  const clip = fig.dataset.cueClip || all[0].dataset.cues;
  const v = shownVideo(fig);
  const phoneCut = !!v.closest(".video--mobile");
  const now = cueNow(all.filter((l) => l.dataset.cues === clip), v.currentTime, phoneCut);
  // the same sentence again (a loop that ends on the line it starts with): nothing changes, so nothing fades
  const on = all.find((l) => l.classList.contains("is-on"));
  if (on && on.dataset.cues === clip && on.textContent === now.textContent && on.getClientRects().length) return;
  for (const l of all) l.classList.toggle("is-on", l === now);
};
/* timeupdate comes about four times a second, so a line would change up to 250 ms after the cut it belongs to.
   Where the browser tells, each frame shown is the moment to look (nothing runs while the video stands). */
const followFrames = (v, look) => {
  if (!v.requestVideoFrameCallback) return;
  const frame = () => {
    look();
    v.requestVideoFrameCallback(frame);
  };
  v.requestVideoFrameCallback(frame);
};
/* What the video code offers the chapters further down: decide again who plays; this figure, it has just been asked for. */
let videosChanged = () => {};
let videoAskedFor = () => {};
/* Videos load only after the page itself has (lead, etapa 4a: the poster shows at once, the file waits). */
const pageLoaded = new Promise((resolve) => {
  if (document.readyState === "complete") resolve();
  else window.addEventListener("load", () => resolve(), { once: true });
});

/* ── Videos: load when near, play when seen, pause off screen; a pause button
      because a loop over 5 s that starts by itself must be stoppable (WCAG 2.2.2).
      At most one plays: the largest on screen, or the one somebody started by
      hand, while it is on screen; a pause by hand stays. On a phone only
      the hero plays by itself; the others wait for a tap on their play button.
      With reduced motion: poster and the native controls only. Saving data or on a
      slow network: the poster until somebody presses play, nothing loads before
      that. The choice of cut is made again when the width changes. ── */
(function videos() {
  const figures = [...document.querySelectorAll("[data-autoplay]")];
  if (!figures.length || !("IntersectionObserver" in window)) return;
  const label = (btn, paused) => {
    btn.querySelector("span").textContent = paused ? t("hero_video_play", "Play") : t("hero_video_pause", "Pause");
    const use = btn.querySelector("use");
    if (use) use.setAttribute("href", paused ? "#i-play_arrow" : "#i-pause");
  };
  let chosen = null;
  let asked = null;
  const area = (fig) => {
    const r = shownVideo(fig).getBoundingClientRect();
    return Math.max(0, Math.min(window.innerWidth, r.right) - Math.max(0, r.left)) * Math.max(0, Math.min(window.innerHeight, r.bottom) - Math.max(0, r.top));
  };
  const choose = () => {
    if (asked && !area(asked)) asked = null;
    return asked || largestVideo(live.filter((fig) => fig.dataset.inView === "1" && !waitsForTap(fig)), area, chosen);
  };
  const run = (fig) => {
    const v = shownVideo(fig);
    for (const other of fig.querySelectorAll("video")) if (other !== v) other.pause();
    const start = fig.querySelector(".video__start");
    const toggle = fig.querySelector(".video__toggle");
    const waiting = waitsForTap(fig);
    if (start) start.hidden = !waiting;
    if (toggle) toggle.hidden = waiting;
    if (fig === chosen && fig.dataset.user !== "paused") {
      pageLoaded.then(() => {
        if (fig !== chosen || fig.dataset.user === "paused") return;
        v.preload = "auto";
        v.play().catch(() => {});
      });
    } else {
      v.pause();
    }
  };
  const runAll = () => {
    chosen = choose();
    live.forEach(run);
  };
  const stays = savesData(navigator.connection);
  const near = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting || waitsForTap(e.target) || stays) continue;
      near.unobserve(e.target);
      pageLoaded.then(() => { shownVideo(e.target).preload = "auto"; });
    }
  }, { rootMargin: "400px 0px" });
  const watch = (threshold) => new IntersectionObserver((entries) => {
    for (const { target: fig, isIntersecting } of entries) {
      fig.dataset.inView = isIntersecting ? "1" : "";
      if (!isIntersecting && asked === fig) asked = null;
    }
    runAll();
  }, { threshold });
  const seen = watch(0.5);
  // the hero sits at the bottom of the first screen: at 390 × 844 the longer English heading leaves
  // 37 % of it showing (Czech 53 %), and at half it would stand still in one language only
  const seenHero = watch(0.25);
  // from here the script says which line shows: the first of this screen's cut, also where the clip stands still
  const firstLines = () => figures.forEach(showCue);
  for (const l of document.querySelectorAll(".video__cue-line.m-first")) l.classList.remove("m-first");
  firstLines();
  onMediaChange(phone, firstLines);
  const live = figures.filter((fig) => fig.querySelector(".video__toggle") && !stillPref.matches);
  for (const fig of live) {
    const btn = fig.querySelector(".video__toggle");
    if (stays) fig.dataset.user = "paused";
    for (const v of fig.querySelectorAll("video")) {
      v.removeAttribute("controls");
      // transparent until it has a frame, so the poster on the screen behind it shows (components.css)
      v.addEventListener("loadeddata", () => v.classList.add("has-frame"));
      v.addEventListener("emptied", () => v.classList.remove("has-frame"));
      const look = () => { if (v === shownVideo(fig)) showCue(fig); };
      v.addEventListener("timeupdate", look);
      followFrames(v, look);
      v.addEventListener("play", () => { if (v === shownVideo(fig)) label(btn, false); });
      v.addEventListener("pause", () => { if (v === shownVideo(fig)) label(btn, true); });
    }
    btn.hidden = false;
    btn.addEventListener("click", () => {
      const v = shownVideo(fig);
      const starting = v.paused;
      fig.dataset.user = starting ? "" : "paused";
      if (starting) asked = fig;
      else if (asked === fig) asked = null;
      runAll();
      if (starting) v.play().catch(() => {});
    });
    const start = fig.querySelector(".video__start");
    if (start) {
      start.addEventListener("click", () => {
        fig.dataset.tapped = "1";
        fig.dataset.user = "";
        asked = fig;
        runAll();
        start.hidden = true;
        const toggle = fig.querySelector(".video__toggle");
        if (toggle) {
          toggle.hidden = false;
          toggle.focus();
        }
        const v = shownVideo(fig);
        v.preload = "auto";
        v.play().catch(() => {});
      });
    }
    label(btn, true);
    near.observe(fig);
    (fig.classList.contains("video--hero") ? seenHero : seen).observe(fig);
  }
  runAll();
  onMediaChange(phone, runAll);
  videosChanged = runAll;
  videoAskedFor = (fig) => {
    if (live.includes(fig) && fig.dataset.inView === "1" && !waitsForTap(fig)) asked = fig;
    runAll();
  };
  // two can be on screen only in a tall window; the areas are read only then
  let frame = 0;
  const looked = () => {
    frame = 0;
    if (choose() !== chosen) runAll();
  };
  const look = () => { frame = frame || requestAnimationFrame(looked); };
  window.addEventListener("scroll", look, { passive: true });
  window.addEventListener("resize", look, { passive: true });
})();

/* ── The tour on /demo: no video loads before the click (preload none), only the
      subtitles of the page's language, which load as soon as their track is on
      (about 1.4 kB). One play button: the native controls come only once it plays.
      Chapter buttons (when the clip has chapter times) jump there and play, and the
      one the video is in has aria-current. ── */
(function tour() {
  document.querySelectorAll("[data-facade]").forEach((fig) => {
    const v = fig.querySelector("video");
    const btn = fig.querySelector(".video__play");
    if (!v || !btn) return;
    // the page's language: WebKit ignores <track default> and goes by the system's (English subtitles on the Czech page, etapa 4)
    for (const track of v.textTracks) track.mode = track.language === document.documentElement.lang ? "showing" : "disabled";
    btn.hidden = false;
    v.removeAttribute("controls");
    const started = () => {
      btn.hidden = true;
      v.setAttribute("controls", "");
    };
    btn.addEventListener("click", () => {
      started();
      v.play().catch(() => {
        btn.hidden = false;
      });
    });
    v.addEventListener("play", started);
  });
  const buttons = [...document.querySelectorAll(".tour-chapter[data-seek]")];
  const played = document.querySelector("[data-facade] video");
  if (played && buttons.length) {
    played.addEventListener("timeupdate", () => {
      const now = buttons.filter((b) => Number(b.dataset.seek) <= played.currentTime + 0.05).pop();
      for (const b of buttons) {
        if (b === now) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      }
    });
  }
  buttons.forEach((chapter) => {
    chapter.addEventListener("click", () => {
      const v = document.querySelector("[data-facade] video");
      if (!v) return;
      const at = Number(chapter.dataset.seek) || 0;
      const go = () => {
        v.currentTime = at;
        v.play().catch(() => {});
      };
      if (v.readyState >= 1) go();
      else {
        v.preload = "auto";
        v.addEventListener("loadedmetadata", go, { once: true });
        v.load();
      }
      v.setAttribute("controls", "");
      const play = document.querySelector("[data-facade] .video__play");
      if (play) play.hidden = true;
      v.scrollIntoView({ block: "center", behavior: stillPref.matches ? "auto" : "smooth" });
    });
  });
})();

/* ── Chapters over the "How it works" video (tabs) ── */
(function chapters() {
  document.querySelectorAll("[data-chapters]").forEach((root) => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const fig = root.querySelector("figure.video");
    root.querySelectorAll("[data-js-hidden]").forEach((p) => { p.hidden = true; });
    // the chapter's clip goes only into the video CSS shows: all its <source>s (WebM + MP4), then load().
    // The hidden cut stays as it is and loads nothing; it gets the clip when the width makes it the shown one
    let current = null;
    const showClip = () => {
      const v = shownVideo(fig);
      const cut = clipFor(current, !!v.closest(".video--mobile"));
      if (v.dataset.clip === clipKey(cut)) return;
      v.dataset.clip = clipKey(cut);
      v.pause();
      v.querySelectorAll("source").forEach((s) => s.remove());
      for (const s of cut.sources) {
        const el = document.createElement("source");
        el.src = s.src;
        el.type = s.type;
        if (s.media) el.media = s.media;
        v.appendChild(el);
      }
      v.closest(".frame__screen").style.setProperty("--poster", cut.poster ? `url(${cut.poster})` : "none");
      // a phone that has not tapped play yet loads nothing; the poster changes only
      if (waitsForTap(fig) || savesData(navigator.connection)) v.preload = "none";
      v.load();
    };
    const swap = (tab) => {
      if (!fig || !tab.dataset.clip) return;
      let clip;
      try { clip = JSON.parse(tab.dataset.clip); } catch { return; }
      if (tab.dataset.label) for (const v of fig.querySelectorAll("video")) v.setAttribute("aria-label", tab.dataset.label);
      current = clip;
      showClip();
      fig.dataset.cueClip = clip.id;
      showCue(fig);
      for (const l of fig.querySelectorAll(".video__caption-line")) l.classList.toggle("is-on", l.dataset.cues === clip.id);
      videoAskedFor(fig);
    };
    onMediaChange(phone, () => {
      if (!current) return;
      showClip();
      videosChanged();
    });
    const select = (tab, focus) => {
      for (const other of tabs) {
        const on = other === tab;
        other.setAttribute("aria-selected", String(on));
        other.tabIndex = on ? 0 : -1;
        document.getElementById(other.getAttribute("aria-controls")).hidden = !on;
      }
      if (focus) tab.focus();
      swap(tab);
      if (phone.matches) keepInView(document.getElementById(tab.getAttribute("aria-controls")));
    };
    // on a phone the chapter's text sits under the tiles: when its heading and first line
    // would be under the bottom bar (or past the screen), the page moves just enough
    const keepInView = (panel) => {
      const h3 = panel.querySelector("h3");
      const p = panel.querySelector("p");
      if (!h3 || !p) return;
      const line = parseFloat(getComputedStyle(p).lineHeight) || 27;
      // from the top of the first line's letters (not the paragraph's box, which starts half a leading higher),
      // so that 8 px really is 8 px between the letters and the bar
      const shown = [...p.children].find((c) => c.getClientRects().length) || p;
      const first = shown.getClientRects()[0] || p.getBoundingClientRect();
      const firstLineBottom = first.top + line;
      const bar = actionBar && actionBar.classList.contains("is-shown") ? actionBar.offsetHeight : 0;
      const room = window.innerHeight - bar - 8;
      if (firstLineBottom > room) window.scrollBy({ top: Math.ceil(firstLineBottom - room), behavior: stillPref.matches ? "auto" : "smooth" });
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

/* ── Folded parts that are simply open on a wide screen: charts 1 and 3 beside
      chart 2 from 768 px, the plans' other features, "what happens next" by the
      form. On a phone they wait in a closed <details>. is-synced hides the
      summary on a wide screen (components.css) only once this has opened them;
      without this script the summary stays as the way in. ── */
(function wideOpen() {
  const wide = window.matchMedia("(min-width: 768px)");
  const all = [...document.querySelectorAll("[data-charts-more], [data-wide-open]")];
  if (!all.length) return;
  const sync = () => {
    for (const d of all) {
      // a phone keeps what the visitor opened; a wide screen opens everything
      if (wide.matches) d.open = true;
      else if (d.classList.contains("is-synced") && d.dataset.byUser !== "1") d.open = false;
      d.classList.add("is-synced");
    }
  };
  for (const d of all) d.querySelector("summary").addEventListener("click", () => { d.dataset.byUser = "1"; });
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

/* ── Next to your ATS on a phone: one card at a time, "I have an ATS" first ── */
(function atsToggle() {
  const group = document.querySelector("[data-ats-toggle]");
  const cards = document.querySelector("[data-ats-cards]");
  if (!group || !cards) return;
  const buttons = [...group.querySelectorAll("[data-ats]")];
  const show = (which) => {
    cards.dataset.show = which;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ats === which)));
  };
  buttons.forEach((b) => b.addEventListener("click", () => show(b.dataset.ats)));
  group.hidden = false;
  show("have");
})();

/* ── FAQ on a phone: the first four questions, the rest behind one tap ── */
(function faqMore() {
  const more = document.querySelector("[data-faq-more]");
  const btn = document.querySelector("[data-faq-more-btn]");
  if (!more || !btn) return;
  let opened = false;
  const sync = () => {
    more.hidden = phone.matches && !opened;
    btn.hidden = !phone.matches || opened;
    btn.setAttribute("aria-expanded", String(!more.hidden));
  };
  btn.addEventListener("click", () => {
    opened = true;
    sync();
    const first = more.querySelector("summary");
    if (first) first.focus();
  });
  sync();
  onMediaChange(phone, sync);
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

/* ── Help dialog: what the company list should look like. Esc (native) and both
      close buttons close it; the focus goes back to the button that opened it. ── */
(function help() {
  const btn = document.getElementById("clients-help-btn");
  const dlg = document.getElementById("clients-help");
  if (!btn || !dlg || typeof dlg.showModal !== "function") return;
  btn.addEventListener("click", () => {
    dlg.showModal();
    document.documentElement.classList.add("is-locked");
  });
  dlg.querySelectorAll("[data-close-help]").forEach((b) => b.addEventListener("click", () => dlg.close()));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", () => {
    document.documentElement.classList.remove("is-locked");
    btn.focus();
  });
})();

/* ── A link to the trial (the main buttons, the bar, /cenik#zkusit) lands on the
      form's heading right under the top bar, the first field in view below it
      (lead, etapa 4 round 4; 4a landed on the field, and the heading was gone).
      The focus goes into that field, except where a keyboard would then cover
      the heading. Without this script the anchor is that heading all the same. ── */
(function toTheForm() {
  const form = document.getElementById("demo-form");
  if (!form) return;
  const first = document.getElementById("name");
  const title = form.closest("section") && form.closest("section").querySelector("h2");
  if (!first || !title || !title.id) return;
  const wanted = () => title.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0) - 8;
  let landing = 0;
  const land = (smooth) => {
    const id = ++landing;
    holdHeader = true;
    if (header) header.classList.remove("is-hidden");
    window.scrollTo({ top: wanted(), behavior: smooth && !stillPref.matches ? "smooth" : "auto" });
    if (!slimBar.matches) first.focus({ preventScroll: true });
    // when the page has stopped: the bar goes back to its own rules, and anything that moved meanwhile is put right
    let y = window.scrollY;
    let still = 0;
    const settle = () => {
      if (id !== landing) return;
      still = window.scrollY === y ? still + 1 : 0;
      y = window.scrollY;
      if (still < 12) {
        requestAnimationFrame(settle);
        return;
      }
      if (Math.abs(wanted() - y) > 2) window.scrollTo({ top: wanted(), behavior: "auto" });
      holdHeader = false;
    };
    requestAnimationFrame(settle);
  };
  // somebody scrolling or typing takes over
  for (const type of ["wheel", "touchstart", "keydown"]) {
    window.addEventListener(type, () => {
      if (!holdHeader) return;
      landing++;
      holdHeader = false;
    }, { passive: true });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.hash !== `#${title.id}` || url.pathname !== location.pathname) return;
    e.preventDefault();
    if (location.hash !== url.hash) history.pushState(null, "", url.hash);
    land(true);
  });
  if (location.hash === `#${title.id}`) {
    // arriving from another page: after the layout has settled
    pageLoaded.then(() => requestAnimationFrame(() => land(false)));
  }
  // the address changed by hand or by going back: the bar and the focus as after a click
  window.addEventListener("hashchange", () => {
    if (location.hash === `#${title.id}`) land(false);
  });
})();

/* ── The brief for the visitor's own AI: one press copies it. Where the browser
      refuses, the text is shown and selected, and "copied" is said only when it was. ── */
(function aiBrief() {
  const brief = document.getElementById("ai-brief-prompt");
  const copy = document.getElementById("ai-brief-copy");
  const show = document.getElementById("ai-brief-show");
  const status = document.getElementById("ai-brief-status");
  if (!brief || !copy || !show || !status) return;
  const showLabel = show.textContent;
  const open = (on) => {
    brief.classList.toggle("is-open", on);
    show.setAttribute("aria-expanded", String(on));
    show.textContent = on ? t("trial_ai_hide", showLabel) : showLabel;
  };
  show.addEventListener("click", () => open(!brief.classList.contains("is-open")));
  const label = copy.querySelector("span");
  const idle = label.textContent;
  let timer = 0;
  const copied = () => {
    label.textContent = t("trial_ai_copied", "Copied");
    status.textContent = label.textContent;
    copy.classList.add("is-copied");
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = idle;
      status.textContent = "";
      copy.classList.remove("is-copied");
    }, 4000);
  };
  const byHand = () => {
    open(true);
    brief.focus({ preventScroll: true });
    brief.setSelectionRange(0, brief.value.length);
    let done = false;
    try { done = document.execCommand("copy"); } catch { /* the text stays selected */ }
    if (done) copied();
    else brief.scrollIntoView({ block: "nearest" });
  };
  copy.addEventListener("click", () => {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(brief.value).then(copied, byHand);
    else byHand();
  });
})();

/* ── Trial form: POST /api/demo, same fields and states as before. Each problem
      is said next to its field (aria-invalid, aria-describedby), and the focus
      goes to the first field with one. ── */
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
  const fileError = document.getElementById("file-error");
  let file = null;
  let fileReady = Promise.resolve();

  const showError = (msg) => {
    error.textContent = msg;
    error.hidden = false;
  };
  /** A field's own message under it, or none; the input says it is invalid and points at the message. */
  const fieldError = (input, msg) => {
    const box = document.getElementById(`${input.id}-error`);
    if (!box) return;
    const ids = (input.getAttribute("aria-describedby") || "").split(/\s+/).filter((id) => id && id !== box.id);
    if (msg) {
      box.textContent = msg;
      box.hidden = false;
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", [box.id, ...ids].join(" "));
    } else {
      box.textContent = "";
      box.hidden = true;
      input.removeAttribute("aria-invalid");
      if (ids.length) input.setAttribute("aria-describedby", ids.join(" "));
      else input.removeAttribute("aria-describedby");
    }
  };
  const showFileError = (msg) => {
    fileError.textContent = msg;
    fileError.hidden = !msg;
    const acc = document.getElementById("clients-acc");
    if (msg && acc) acc.open = true;
  };

  const fields = {
    // empty: "fill it in"; one letter: "the whole of it" (the Worker refuses names and agencies under 2 characters)
    name: { el: document.getElementById("name"), check: (v) => (!v ? t("form_err_name", t("form_err_required")) : v.length < 2 ? t("form_err_name_short", t("form_err_name")) : "") },
    email: { el: document.getElementById("email"), check: (v) => (!v ? t("form_err_email_empty", t("form_err_required")) : looksLikeEmail(v) ? "" : t("form_err_email", "Please check the e-mail address.")) },
    company: { el: document.getElementById("company"), check: (v) => (!v ? t("form_err_company", t("form_err_required")) : v.length < 2 ? t("form_err_company_short", t("form_err_company")) : "") },
  };
  // once a field has said what is wrong, it says when it is right again
  for (const f of Object.values(fields)) {
    f.el.addEventListener("input", () => {
      if (f.el.getAttribute("aria-invalid") === "true") fieldError(f.el, f.check(f.el.value.trim()));
    });
  }

  fileInput.addEventListener("change", () => {
    const f = fileInput.files && fileInput.files[0];
    if (!f) return;
    if (!/\.(xlsx|xls|csv)$/i.test(f.name)) {
      showFileError(t("form_err_file_type", "Please upload Excel (.xlsx, .xls) or .csv."));
      fileInput.value = "";
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      showFileError(t("form_err_file_large", "The file is too large (5 MB at most)."));
      fileInput.value = "";
      return;
    }
    showFileError("");
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
    let firstBad = null;
    for (const f of Object.values(fields)) {
      const msg = f.check(f.el.value.trim());
      fieldError(f.el, msg);
      if (msg && !firstBad) firstBad = f.el;
    }
    if (firstBad) {
      firstBad.focus({ preventScroll: true });
      // the label above the field and the message under it both in view, clear of the top bar
      const box = firstBad.closest(".field") || firstBad;
      const r = box.getBoundingClientRect();
      const topRoom = (header ? header.offsetHeight : 0) + 16;
      if (r.top < topRoom || r.bottom > window.innerHeight - 16) window.scrollBy({ top: r.top - topRoom, behavior: "auto" });
      return;
    }
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
      // the focus goes to the message (role=alert reads it out too), never back to the page body
      error.focus({ preventScroll: true });
      error.scrollIntoView({ block: "center", behavior: "auto" });
      return;
    }
    const wrap = document.getElementById("form-wrapper");
    wrap.innerHTML = `<div class="success" tabindex="-1">
  <h3><svg class="ic" aria-hidden="true"><use href="#i-check"></use></svg>${esc(t("form_state_success_title"))}</h3>
  <ol><li>${esc(t("form_state_success_s1"))}</li><li>${esc(t("form_state_success_s2"))}</li><li>${esc(t("form_state_success_s3"))}</li></ol>
  <p class="note">${esc(t("form_state_success_foot"))}</p>
</div>`;
    // the card has the same steps: once is enough
    const next = document.querySelector(".trial__next");
    if (next) next.hidden = true;
    wrap.querySelector(".success").focus();
  });
})();
