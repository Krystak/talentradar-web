import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import * as media from "../src/js/media.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const SITE_JS = fs.readFileSync(path.join(ROOT, "src/js/site.js"), "utf8").replace(/^import\s+[^;]+;\r?\n/gm, "");

function makeTarget() {
  const listeners = new Map();
  return {
    _listeners: listeners,
    addEventListener(type, fn, opts) {
      const list = listeners.get(type) || [];
      list.push({ fn, opts });
      listeners.set(type, list);
    },
    removeEventListener(type, fn, opts) {
      const cap = typeof opts === "boolean" ? opts : !!opts?.capture;
      const list = listeners.get(type) || [];
      listeners.set(
        type,
        list.filter((entry) => {
          const eCap = typeof entry.opts === "boolean" ? entry.opts : !!entry.opts?.capture;
          return !(entry.fn === fn && eCap === cap);
        }),
      );
    },
    dispatch(type, event = {}) {
      const ev = { type, ...event };
      for (const { fn } of [...(listeners.get(type) || [])]) fn(ev);
    },
  };
}

function makeClassList(initial = []) {
  const set = new Set(initial);
  return {
    contains: (c) => set.has(c),
    add: (c) => set.add(c),
    remove: (c) => set.delete(c),
  };
}

function makeVideo({ playImpl, width = 800, height = 500, rect } = {}) {
  const t = makeTarget();
  const v = {
    ...t,
    classList: makeClassList(["video__wide"]),
    preload: "none",
    paused: true,
    currentTime: 0,
    duration: 10,
    dataset: {},
    removeAttribute() {},
    pause() {
      this.pauseCalls += 1;
      this.paused = true;
      this.dispatch("pause");
    },
    play() {
      this.playCalls += 1;
      return playImpl ? playImpl.call(this) : Promise.resolve();
    },
    getBoundingClientRect() {
      return rect || { left: 0, top: 0, right: width, bottom: height, width, height };
    },
    playCalls: 0,
    pauseCalls: 0,
  };
  return v;
}

function makeFigure({ hero = false, tapPhone = false, video, rect } = {}) {
  const t = makeTarget();
  const labelSpan = { textContent: "" };
  const useEl = { setAttribute() {} };
  const toggleBtn = {
    ...makeTarget(),
    hidden: true,
    focus() {},
    closest: (sel) => (sel.includes(".video__toggle") ? toggleBtn : null),
    querySelector: (sel) => (sel === "span" ? labelSpan : sel === "use" ? useEl : null),
  };
  const v = video || makeVideo({ rect });
  const fig = {
    ...t,
    classList: makeClassList(hero ? ["video", "video--hero"] : ["video"]),
    dataset: {},
    hasAttribute: (name) => (name === "data-tap-phone" ? tapPhone : false),
    querySelector(sel) {
      if (sel === ".video__toggle") return toggleBtn;
      if (sel === ".video__wide") return v;
      return null;
    },
    querySelectorAll(sel) {
      if (sel === "video") return [v];
      return [];
    },
  };
  fig.toggleBtn = toggleBtn;
  fig.video = v;
  return fig;
}

function bootVideos({ figures, readyState = "loading", reducedMotion = false, saveData = false } = {}) {
  const winTarget = makeTarget();
  const docTarget = makeTarget();
  const observers = [];

  class MockIntersectionObserver {
    constructor(cb, options) {
      this.cb = cb;
      this.options = options || {};
      this.targets = new Set();
      observers.push(this);
    }
    observe(el) {
      this.targets.add(el);
    }
    unobserve(el) {
      this.targets.delete(el);
    }
    trigger(entries) {
      this.cb(entries);
    }
  }

  const document = {
    ...docTarget,
    readyState,
    documentElement: { lang: "cs", classList: makeClassList(), dataset: {} },
    body: { ...makeTarget(), classList: makeClassList() },
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll(sel) {
      if (sel === "[data-autoplay]") return figures;
      return [];
    },
  };

  const window = {
    ...winTarget,
    document,
    innerWidth: 1280,
    innerHeight: 800,
    IntersectionObserver: MockIntersectionObserver,
    matchMedia: (q) => ({
      matches: q.includes("prefers-reduced-motion") ? reducedMotion : false,
      addEventListener() {},
      addListener() {},
    }),
    navigator: {
      connection: saveData ? { saveData: true } : { saveData: false },
    },
    location: { pathname: "/", search: "", hash: "" },
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    cancelAnimationFrame: (id) => clearTimeout(id),
    pageYOffset: 0,
    scrollY: 0,
  };
  window.window = window;

  const sandbox = {
    ...media,
    window,
    document,
    navigator: window.navigator,
    location: window.location,
    IntersectionObserver: MockIntersectionObserver,
    matchMedia: window.matchMedia,
    requestAnimationFrame: window.requestAnimationFrame,
    cancelAnimationFrame: window.cancelAnimationFrame,
    URL,
    Promise,
    Error,
    Math,
    Number,
    Object,
    Array,
    Map,
    Set,
    JSON,
    setTimeout,
    clearTimeout,
    getComputedStyle: () => ({}),
  };

  vm.runInNewContext(SITE_JS, sandbox, { filename: "site.js" });

  // Observers created by videos(): [0] near (rootMargin), [1] seen (0.5), [2] seenHero (0.25)
  const nearObs = observers.find((o) => o.options.rootMargin === "400px 0px");
  const seenObs = observers.find((o) => o.options.threshold === 0.5);
  const seenHeroObs = observers.find((o) => o.options.threshold === 0.25);

  return { window, document, nearObs, seenObs, seenHeroObs };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

test("hero video starts loading and calls play() before window load while other videos wait", async () => {
  const heroFig = makeFigure({ hero: true });
  const clipFig = makeFigure({ hero: false });

  const { window, nearObs, seenObs, seenHeroObs } = bootVideos({
    figures: [heroFig, clipFig],
    readyState: "loading",
  });

  nearObs.trigger([
    { target: heroFig, isIntersecting: true },
    { target: clipFig, isIntersecting: true },
  ]);
  assert.equal(heroFig.video.preload, "auto", "hero video preloads before window.load");
  assert.equal(clipFig.video.preload, "none", "non-hero video waits for window.load to preload");

  seenHeroObs.trigger([{ target: heroFig, isIntersecting: true }]);
  await flush();
  assert.equal(heroFig.video.playCalls, 1, "hero calls play() immediately without waiting for window.load");

  seenHeroObs.trigger([{ target: heroFig, isIntersecting: false }]);
  seenObs.trigger([{ target: clipFig, isIntersecting: true }]);
  await flush();
  assert.equal(clipFig.video.playCalls, 0, "non-hero video does not call play() before window.load");

  window.dispatch("load");
  await flush();
  assert.equal(clipFig.video.preload, "auto", "non-hero video preloads after window.load");
  assert.equal(clipFig.video.playCalls, 1, "non-hero video plays after window.load");
});

test("when play() rejects, first user interaction retries once and succeeds", async () => {
  let rejectFirst = true;
  const heroVideo = makeVideo({
    playImpl() {
      if (rejectFirst) {
        rejectFirst = false;
        return Promise.reject(new Error("NotAllowedError"));
      }
      this.paused = false;
      this.dispatch("play");
      return Promise.resolve();
    },
  });
  const heroFig = makeFigure({ hero: true, video: heroVideo });

  const { window, seenHeroObs } = bootVideos({
    figures: [heroFig],
    readyState: "complete",
  });

  const baseCounts = Object.fromEntries(
    ["pointerdown", "keydown", "scroll", "touchstart"].map((ev) => [ev, (window._listeners.get(ev) || []).length]),
  );

  seenHeroObs.trigger([{ target: heroFig, isIntersecting: true }]);
  await flush();
  assert.equal(heroVideo.playCalls, 1);
  assert.equal(heroVideo.paused, true);

  for (const ev of ["pointerdown", "keydown", "scroll", "touchstart"]) {
    assert.equal((window._listeners.get(ev) || []).length, baseCounts[ev] + 1, `registers ${ev} retry listener`);
  }

  // First user interaction retries play() once
  window.dispatch("pointerdown", { target: { closest: () => null } });
  await flush();
  assert.equal(heroVideo.playCalls, 2);
  assert.equal(heroVideo.paused, false);

  for (const ev of ["pointerdown", "keydown", "scroll", "touchstart"]) {
    assert.equal((window._listeners.get(ev) || []).length, baseCounts[ev], `cleans up ${ev} retry listener`);
  }

  // Subsequent interaction does not re-trigger play()
  window.dispatch("keydown", {});
  await flush();
  assert.equal(heroVideo.playCalls, 2);
});

test("retry skips manual pause and non-chosen videos, and reduced motion / saveData start nothing", async () => {
  const heroVideo = makeVideo({
    playImpl() {
      return Promise.reject(new Error("NotAllowedError"));
    },
  });
  const heroFig = makeFigure({ hero: true, video: heroVideo });
  const env1 = bootVideos({ figures: [heroFig], readyState: "complete" });

  env1.seenHeroObs.trigger([{ target: heroFig, isIntersecting: true }]);
  await flush();
  assert.equal(heroVideo.playCalls, 1);

  // pointerdown on .video__toggle does not trigger retry before click pauses
  env1.window.dispatch("pointerdown", { target: heroFig.toggleBtn });
  await flush();
  assert.equal(heroVideo.playCalls, 1);

  // Manual pause sets user=paused and clears retry listener
  heroVideo.paused = false;
  heroFig.toggleBtn.dispatch("click");
  await flush();
  assert.equal(heroFig.dataset.user, "paused");

  env1.window.dispatch("scroll", {});
  await flush();
  assert.equal(heroVideo.playCalls, 1, "does not play on scroll after manual pause");

  // prefers-reduced-motion: nothing auto-starts
  const rmFig = makeFigure({ hero: true });
  const env2 = bootVideos({ figures: [rmFig], readyState: "complete", reducedMotion: true });
  assert.equal(env2.seenHeroObs.targets.size, 0, "no video observed for autoplay with reduced motion");
  assert.equal(rmFig.video.playCalls, 0);

  // saveData: nothing preloads or plays automatically
  const sdFig = makeFigure({ hero: true });
  const env3 = bootVideos({ figures: [sdFig], readyState: "complete", saveData: true });
  env3.nearObs.trigger([{ target: sdFig, isIntersecting: true }]);
  env3.seenHeroObs.trigger([{ target: sdFig, isIntersecting: true }]);
  await flush();
  assert.equal(sdFig.video.preload, "none");
  assert.equal(sdFig.video.playCalls, 0);
});
