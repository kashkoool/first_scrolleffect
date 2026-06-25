/* ============================================================
   VANTA AERO·9 — fixed shoe stage driven by whole-page scroll
   Pure vanilla JS. No dependencies. Strict-CSP friendly.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- product data ---------- */
  var COLORWAYS = [
    { id: "Infrared", filter: "none",                                               accent: "#FF5A1F", price: 185 },
    { id: "Volt",     filter: "hue-rotate(78deg) saturate(1.3) brightness(1.05)",   accent: "#C8F000", price: 185 },
    { id: "Phantom",  filter: "hue-rotate(205deg) saturate(0.78) brightness(0.96)", accent: "#7B8CFF", price: 195 },
    { id: "Arctic",   filter: "hue-rotate(158deg) saturate(1.18) brightness(1.02)", accent: "#2B6FFF", price: 185 }
  ];
  var SIZES = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12", "13"];
  var SOLD_OUT = { "7": true, "12": true };
  var state = { cw: 0, size: null, qty: 1, cart: 0 };

  /* shoe screen position per section (x,y as fraction of viewport; s = scale).
     The shoe sits opposite each panel so copy stays clear. */
  var POSES = [
    { x:  0.22, y: 0.00, s: 1.05 }, // hero    (panel left)
    { x: -0.26, y: 0.00, s: 0.90 }, // buy     (panel right)
    { x:  0.26, y: 0.00, s: 0.92 }, // tech    (panel left)
    { x: -0.26, y: 0.00, s: 0.88 }, // specs   (panel right)
    { x:  0.24, y: 0.00, s: 0.86 }, // reviews (panel left)
    { x:  0.00, y:-0.32, s: 0.60 }  // drop    (shoe lifts above the signup box)
  ];

  function lerp(a, b, f) { return a + (b - a) * f; }
  function smooth(x) { return x * x * (3 - 2 * x); }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function money(n) { return "$" + n; }
  function pad3(n) { return ("00" + n).slice(-3); }
  function inkFor(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#0A0B0D" : "#ECECE6";
  }
  function setText(id, t) { var el = $(id); if (el) el.textContent = t; }

  /* ============================================================
     IMAGE SEQUENCE
     ============================================================ */
  var N = 151;
  var canvas = $("seq");
  var ctx = canvas ? canvas.getContext("2d") : null;
  var frames = new Array(N);
  var loaded = 0, ready = false;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var vw = 0, vh = 0, sp = 0;        // sp = smoothed scroll progress 0..1
  var lastKey = "";

  function preload() {
    var bar = $("loaderBar"), pct = $("loaderPct"), loader = $("loader");
    for (var i = 0; i < N; i++) {
      (function (idx) {
        var im = new Image();
        im.decoding = "async";
        im.onload = im.onerror = function () {
          loaded++;
          var p = Math.round((loaded / N) * 100);
          if (bar) bar.style.width = p + "%";
          if (pct) pct.textContent = p + "%";
          if (loaded === N) {
            ready = true;
            if (loader) loader.classList.add("is-done");
            if (canvas) canvas.classList.add("is-ready");
            resize();
          }
        };
        im.src = "assets/frames/ezgif-frame-" + pad3(idx + 1) + ".jpg";
        frames[idx] = im;
      })(i);
    }
  }

  function resize() {
    if (!canvas) return;
    vw = window.innerWidth; vh = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lastKey = "";
  }

  function render(progress) {
    if (!ctx || !ready) return;
    var idx = Math.round(progress * (N - 1));
    idx = Math.max(0, Math.min(N - 1, idx));

    /* interpolate pose */
    var n = POSES.length, seg = progress * (n - 1);
    var i = Math.min(n - 2, Math.floor(seg)), f = smooth(clamp01(seg - i));
    var A = POSES[i], B = POSES[i + 1];
    var px = lerp(A.x, B.x, f), py = lerp(A.y, B.y, f), s = lerp(A.s, B.s, f);

    if (vw < 760) { px = 0; py = -0.16; s *= 0.8; }   // mobile: shoe up & centered

    var key = idx + "|" + px.toFixed(3) + "|" + py.toFixed(3) + "|" + s.toFixed(3);
    if (key === lastKey) return;                       // nothing changed → skip draw
    lastKey = key;

    var img = frames[idx];
    if (!img || !img.complete || !img.naturalWidth) return;
    var base = Math.min(vh * 0.72, vw * 0.6) / img.naturalHeight * s;
    var dw = img.naturalWidth * base, dh = img.naturalHeight * base;
    var cx = vw / 2 + px * vw, cy = vh / 2 + py * vh;
    ctx.clearRect(0, 0, vw, vh);
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
    setText("hudFrame", pad3(idx + 1) + "/" + N);
  }

  /* render loop */
  var raf = null, running = true;
  function loop() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var targetSp = max > 0 ? clamp01(window.scrollY / max) : 0;
    sp += (targetSp - sp) * (reduceMotion ? 1 : 0.12);
    if (Math.abs(targetSp - sp) < 0.0004) sp = targetSp;
    render(sp);
    if (running) raf = requestAnimationFrame(loop);
  }
  function start() { if (raf == null) { running = true; raf = requestAnimationFrame(loop); } }
  function stop() { running = false; if (raf != null) { cancelAnimationFrame(raf); raf = null; } }
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });

  /* ============================================================
     COLORWAY / TINT (user choice = global shoe color)
     ============================================================ */
  function applyColorway(i) {
    state.cw = i;
    var cw = COLORWAYS[i];
    if (canvas) canvas.style.filter = cw.filter;
    document.documentElement.style.setProperty("--accent", cw.accent);
    document.documentElement.style.setProperty("--accent-ink", inkFor(cw.accent));
    setText("cwName", cw.id);
    setText("buybarCw", cw.id);
    setText("priceVal", money(cw.price));
    setText("addPrice", money(cw.price));
    setText("buybarPrice", money(cw.price));
    document.querySelectorAll(".sw").forEach(function (s, idx) {
      s.setAttribute("aria-checked", idx === i ? "true" : "false");
    });
  }
  function buildSwatches() {
    var wrap = $("swatches"); if (!wrap) return;
    COLORWAYS.forEach(function (cw, i) {
      var b = document.createElement("button");
      b.className = "sw"; b.type = "button"; b.setAttribute("role", "radio");
      b.setAttribute("aria-label", cw.id);
      b.setAttribute("aria-checked", i === 0 ? "true" : "false");
      b.style.background = "linear-gradient(135deg," + cw.accent + " 0 58%, #15171C 58% 100%)";
      b.addEventListener("click", function () { applyColorway(i); });
      wrap.appendChild(b);
    });
  }

  /* ============================================================
     SIZE / QTY / CART
     ============================================================ */
  function buildSizes() {
    var wrap = $("sizes"); if (!wrap) return;
    SIZES.forEach(function (sz) {
      var b = document.createElement("button");
      b.className = "size"; b.type = "button"; b.setAttribute("role", "radio");
      b.textContent = sz; b.setAttribute("aria-checked", "false");
      if (SOLD_OUT[sz]) { b.disabled = true; b.setAttribute("aria-label", sz + " — sold out"); }
      b.addEventListener("click", function () {
        if (b.disabled) return;
        state.size = sz;
        wrap.querySelectorAll(".size").forEach(function (s) {
          s.setAttribute("aria-checked", s === b ? "true" : "false");
        });
      });
      wrap.appendChild(b);
    });
  }
  function setQty(n) { state.qty = Math.max(1, Math.min(9, n)); setText("qtyN", String(state.qty)); }
  function addToCart() {
    if (!state.size) {
      toast("Pick a size first");
      var buy = $("buy"); if (buy) buy.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      return;
    }
    state.cart += state.qty;
    setText("cartCount", String(state.cart));
    toast("Added " + state.qty + " · AERO·9 " + COLORWAYS[state.cw].id + " · US " + state.size);
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $("toast"); if (!t) return;
    t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 2600);
  }

  /* ============================================================
     OVERLAYS: nav elevation, scrollcue, sticky buy bar, form
     ============================================================ */
  function initScrollUI() {
    var nav = $("nav"), cue = $("scrollcue");
    function onScroll() {
      if (nav) nav.setAttribute("data-elevated", window.scrollY > 12 ? "true" : "false");
      if (cue) cue.setAttribute("data-hide", window.scrollY > 80 ? "true" : "false");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  function initBuyBar() {
    var addBtn = $("addBtn"), bar = $("buybar");
    if (!addBtn || !bar || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      var show = !e.isIntersecting && e.boundingClientRect.top < 0;
      bar.setAttribute("data-show", show ? "true" : "false");
      bar.setAttribute("aria-hidden", show ? "false" : "true");
    }, { threshold: 0 }).observe(addBtn);
  }
  function initForm() {
    var form = $("dropForm"), input = $("email"), msg = $("dropMsg");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!input || !input.checkValidity() || input.value.indexOf("@") < 1) {
        if (msg) msg.textContent = "Enter a valid email to join the list.";
        if (input) input.focus();
        return;
      }
      if (msg) msg.textContent = "You're on the list — we'll email your early-access window.";
      form.reset();
    });
  }

  function debounce(fn, ms) {
    var t; return function () { clearTimeout(t); var a = arguments, c = this; t = setTimeout(function () { fn.apply(c, a); }, ms); };
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    buildSwatches();
    buildSizes();
    applyColorway(0);
    setQty(1);

    var minus = $("qtyMinus"), plus = $("qtyPlus");
    if (minus) minus.addEventListener("click", function () { setQty(state.qty - 1); });
    if (plus) plus.addEventListener("click", function () { setQty(state.qty + 1); });
    var addBtn = $("addBtn"); if (addBtn) addBtn.addEventListener("click", addToCart);
    var barBtn = $("buybarBtn"); if (barBtn) barBtn.addEventListener("click", addToCart);
    var cartBtn = $("cartBtn");
    if (cartBtn) cartBtn.addEventListener("click", function () {
      toast(state.cart ? state.cart + " in your bag · checkout is demo-only" : "Your bag is empty");
    });

    initScrollUI();
    initBuyBar();
    initForm();

    if (canvas && ctx) {
      resize();
      window.addEventListener("resize", debounce(resize, 150), { passive: true });
      preload();
      start();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
