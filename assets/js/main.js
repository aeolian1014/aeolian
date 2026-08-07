/* =====================================================================
   SHARED RUNTIME
   ---------------------------------------------------------------------
   Every page loads data.js -> main.js. The header, menu overlay and
   footer are rendered from here so there is exactly one place to edit
   them; page-specific blocks boot only if their host element exists.
   ===================================================================== */
(function () {
  "use strict";

  /* Flag the document as JS-capable *before* anything else. Every
     "start hidden, reveal on scroll" rule is scoped to .js, so if this
     script never runs the page still renders fully visible. */
  document.documentElement.classList.add("js");

  const RS = (window.RS = window.RS || {});
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Escape anything that lands inside innerHTML. */
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  /* Media paths contain spaces; encode but keep the slashes. */
  const url = (p) => encodeURI(String(p)).replace(/#/g, "%23");

  const catLabel = (id) => (RS.categories.find((c) => c.id === id) || {}).label || id;

  const NAV = [
    { href: "index.html",   label: "Home",    n: "01" },
    { href: "work.html",    label: "Work",    n: "02" },
    { href: "about.html",   label: "About",   n: "03" },
    { href: "contact.html", label: "Contact", n: "04" },
  ];

  const here = (() => {
    const f = location.pathname.split("/").pop() || "index.html";
    return f === "" ? "index.html" : f;
  })();

  /* =================================================================
     SHELL — header, menu overlay, footer
     ================================================================= */
  function renderShell() {
    const c = RS.contact;

    /* ---- header ---- */
    const header = $("[data-header]");
    if (header) {
      header.className = "header";
      header.innerHTML = `
        <div class="wrap">
          <nav class="nav" aria-label="Primary">
            <button class="burger" type="button" data-menu-toggle
                    aria-expanded="false" aria-controls="menu">
              <span class="burger__lines" aria-hidden="true"><i></i><i></i><i></i></span>
              <span class="burger__text" data-menu-label>Menu</span>
            </button>

            <a href="index.html" class="nav__logo" aria-label="Sulaymon Ruziboev — home">
              <img src="${url("Media/Logos/SULAYMON PROFILE PIC PNG.png")}"
                   alt="Sulaymon Ruziboev" width="120" height="120">
            </a>

            <div class="nav__right">
              <div class="nav__links">
                ${NAV.filter((n) => n.href !== "contact.html")
                  .map((n) => `<a class="nav__link${n.href === here ? " is-active" : ""}" href="${n.href}">${esc(n.label)}</a>`)
                  .join("")}
              </div>
              <a href="contact.html" class="btn" data-magnetic>Let's talk</a>
            </div>
          </nav>
        </div>`;
    }

    /* ---- menu overlay ---- */
    const menu = $("[data-menu]");
    if (menu) {
      menu.id = "menu";
      menu.className = "menu";
      menu.setAttribute("aria-hidden", "true");
      menu.innerHTML = `
        <div class="menu__inner">
          <div></div>
          <div class="menu__body">
            <nav class="menu__nav" aria-label="Site">
              ${NAV.map(
                (n, i) => `
                <a class="menu__link${n.href === here ? " is-active" : ""}"
                   href="${n.href}" style="--i:${i}">
                  <i>${n.n}</i>${esc(n.label)}
                </a>`
              ).join("")}
            </nav>
            <div class="menu__aside">
              <div class="menu__block">
                <h4>Email</h4>
                <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>
              </div>
              <div class="menu__block">
                <h4>Phone</h4>
                <a href="tel:${esc(c.phoneHref)}">${esc(c.phone)}</a>
              </div>
              <div class="menu__block">
                <h4>Based in</h4>
                <p>${esc(c.location)}</p>
              </div>
              <div class="menu__block">
                <h4>Status</h4>
                <p class="avail"><i aria-hidden="true"></i>Available for work</p>
              </div>
            </div>
          </div>
          <div class="menu__foot">
            <p>&copy; ${new Date().getFullYear()} Sulaymon Ruziboev</p>
            <div class="menu__socials">
              ${c.socials.map((s) => `<a href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join("")}
            </div>
          </div>
        </div>`;
    }

    /* ---- footer ---- */
    const footer = $("[data-footer]");
    if (footer) {
      footer.className = "footer";
      footer.innerHTML = `
        <div class="wrap">
          <div class="footer__top">
            <div class="footer__brand">
              <img src="${url("Media/Logos/SULAYMON PROFILE PIC PNG.png")}"
                   alt="Sulaymon Ruziboev" width="120" height="120" loading="lazy">
              <p>Graphic &amp; motion designer building brand identities, content design and
                 animation for creators and small brands.</p>
              <p class="avail"><i aria-hidden="true"></i>Available for new projects</p>
            </div>
            <div class="footer__col">
              <h4>Navigate</h4>
              ${NAV.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join("")}
            </div>
            <div class="footer__col">
              <h4>Work</h4>
              ${RS.categories.filter((x) => x.id !== "all").slice(0, 5)
                .map((x) => `<a href="work.html#${x.id}">${esc(x.label)}</a>`).join("")}
            </div>
            <div class="footer__col">
              <h4>Contact</h4>
              <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>
              <a href="tel:${esc(c.phoneHref)}">${esc(c.phone)}</a>
              <p>${esc(c.location)}</p>
              <div class="social-row" style="margin-top:.6rem">
                ${c.socials.map((s) => `
                  <a class="social" href="${esc(s.href)}" target="_blank" rel="noopener">
                    <img src="${url(s.icon)}" alt="" aria-hidden="true" width="16" height="16" loading="lazy">
                    ${esc(s.name)}
                  </a>`).join("")}
              </div>
            </div>
          </div>
          <div class="footer__bot">
            <p>&copy; ${new Date().getFullYear()} Sulaymon Ruziboev. All rights reserved.</p>
            <button class="to-top" type="button" data-to-top>
              Back to top
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </button>
          </div>
        </div>`;
    }

  }

  /* =================================================================
     PAGE TRANSITION
     A curtain wipes up on the way out and away on the way in, so moving
     between pages reads as authored rather than as a hard cut.

     Deliberately conservative:
       • links are only intercepted when this script is running, so with
         JS off (or if it throws) navigation is completely untouched;
       • modifier / middle clicks, new tabs, downloads, hash links and
         external hosts all fall through to the browser;
       • the incoming half only plays when we know we arrived via a
         transition (sessionStorage flag), so a direct visit or a refresh
         never sits behind a curtain;
       • a watchdog navigates anyway if the animation stalls.
     ================================================================= */
  const PT_FLAG = "rs:pt";

  /* Read once at boot: both the transition and the preloader need to know
     whether this page was reached via a transition, and whoever reads it
     first would otherwise clear it for the other. */
  let ARRIVED_VIA_PT = false;
  function readArrivalFlag() {
    try {
      ARRIVED_VIA_PT = sessionStorage.getItem(PT_FLAG) === "1";
      if (ARRIVED_VIA_PT) sessionStorage.removeItem(PT_FLAG);
    } catch (e) { ARRIVED_VIA_PT = false; }
  }

  function initTransition() {
    if (REDUCED) return;

    const pt = document.createElement("div");
    pt.className = "pt";
    pt.setAttribute("aria-hidden", "true");
    pt.innerHTML = Array.from({ length: 5 },
      (_, i) => `<span class="pt__col" style="--i:${i}"></span>`).join("");
    document.body.appendChild(pt);

    /* ---- arriving ---- */
    if (ARRIVED_VIA_PT) {
      pt.classList.add("is-cover");

      // Idempotent: whichever trigger wins, the curtain lifts exactly once.
      const reveal = () => {
        if (!pt.classList.contains("is-cover")) return;
        pt.classList.remove("is-cover");
        pt.classList.add("is-in");
        setTimeout(() => pt.classList.remove("is-in"), 900);
      };

      // Two frames so the covered state paints before the transition starts.
      requestAnimationFrame(() => requestAnimationFrame(reveal));
      // rAF is throttled in a background tab; don't let the curtain linger.
      setTimeout(reveal, 250);
      // Last resort — the page must never stay covered.
      setTimeout(() => pt.classList.remove("is-cover", "is-in"), 1200);
    }

    /* ---- leaving ---- */
    let leaving = false;

    document.addEventListener("click", (e) => {
      if (leaving) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = e.target.closest("a");
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      if (/^(mailto:|tel:|javascript:)/i.test(href)) return;

      const dest = new URL(a.href, location.href);
      if (dest.origin !== location.origin) return;
      // Same page (or same page + hash): let the browser handle it.
      if (dest.pathname === location.pathname && dest.search === location.search) return;

      e.preventDefault();
      leaving = true;
      try { sessionStorage.setItem(PT_FLAG, "1"); } catch (err) {}
      pt.classList.add("is-out");

      let went = false;
      const go = () => { if (!went) { went = true; location.href = dest.href; } };
      setTimeout(go, 620);   // curtain duration + stagger
      setTimeout(go, 1200);  // watchdog if the transition stalls
    });

    /* Restoring from bfcache would otherwise show a stale curtain. */
    addEventListener("pageshow", (e) => {
      if (!e.persisted) return;
      leaving = false;
      pt.classList.remove("is-out", "is-in", "is-cover");
    });
  }

  /* =================================================================
     HEADER BEHAVIOUR — stick + hide on scroll down
     ================================================================= */
  function initHeader() {
    const header = $(".header");
    if (!header) return;

    const REVEAL_AT = 200; // px of travel before the state can flip
    const TOP_ZONE = 220;  // near the top the header is always shown
    let last = window.scrollY;
    let travel = 0;        // signed distance travelled since the last flip

    const onScroll = () => {
      const y = Math.max(window.scrollY, 0);
      const delta = y - last;
      last = y;

      header.classList.toggle("is-stuck", y > 40);

      // The menu overlay owns the close button — never hide it while open.
      if (document.body.classList.contains("menu-open")) {
        header.classList.remove("is-hidden");
        return;
      }
      if (y <= TOP_ZONE) {
        header.classList.remove("is-hidden");
        travel = 0;
        return;
      }
      if (delta === 0) return;

      // Accumulate travel per direction and only flip once it passes the
      // threshold. Comparing a single event's delta would re-show the
      // header on any tiny or zero-delta event — including simply
      // stopping at the bottom of the page.
      if (delta > 0 !== travel > 0) travel = 0;
      travel += delta;

      if (travel > REVEAL_AT / 4) header.classList.add("is-hidden");
      else if (travel < -REVEAL_AT / 4) header.classList.remove("is-hidden");
    };

    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* =================================================================
     MENU OVERLAY
     ================================================================= */
  function initMenu() {
    const menu = $(".menu");
    const toggle = $("[data-menu-toggle]");
    if (!menu || !toggle) return;
    const label = $("[data-menu-label]", toggle);
    let lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      document.body.classList.add("menu-open", "is-locked");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      if (label) label.textContent = "Close";
      const first = $(".menu__link", menu);
      if (first) setTimeout(() => first.focus({ preventScroll: true }), 340);
    }

    function close() {
      document.body.classList.remove("menu-open", "is-locked");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      if (label) label.textContent = "Menu";
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }

    toggle.addEventListener("click", () =>
      document.body.classList.contains("menu-open") ? close() : open()
    );

    // Same-page anchors should close the overlay rather than leave it up.
    $$(".menu__link", menu).forEach((a) => {
      a.addEventListener("click", () => {
        if (a.getAttribute("href") === here) { close(); }
      });
    });

    addEventListener("keydown", (e) => {
      if (!document.body.classList.contains("menu-open")) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      // trap focus inside the overlay
      const items = $$("a[href], button", menu).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    });

    RS.closeMenu = close;
  }

  /* =================================================================
     CURSOR + MAGNETIC ELEMENTS
     ================================================================= */
  /* Cursor trail — a spray of chunky, colour-shifting pixels that drift
     and fade out behind the pointer. Drawn on one canvas with additive
     blending so overlaps bloom instead of muddying. Particles are capped
     and the loop idles when nothing is alive. */
  function initCursor() {
    if (REDUCED || !matchMedia("(pointer: fine)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.className = "cursor-fx";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let w = 0, h = 0;
    function resize() {
      const dpr = Math.min(devicePixelRatio, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    addEventListener("resize", resize);

    /* Vivid violet/cyan/magenta from the WolfGang artwork, at full strength
       for maximum contrast against the near-black page. */
    const PALETTE = [
      "#ffffff", // white
      "#c084fc", // bright violet
      "#a855f7", // purple
      "#e879f9", // fuchsia
      "#22d3ee", // cyan
      "#818cf8", // indigo
    ];
    const GRID = 8;    // pixels snap to this lattice, which reads as "pixel"
    const MAX = 130;   // particle cap — lower is sparser
    const ALPHA = 1;   // overall trail opacity
    const parts = [];

    let px = -999, py = -999, seeded = false, boost = 1;

    addEventListener("pointermove", (e) => {
      const mx = e.clientX, my = e.clientY;
      if (!seeded) { px = mx; py = my; seeded = true; }

      // Emit along the segment travelled, so fast moves still read as a
      // trail rather than isolated dots. Sparse on purpose — at full
      // opacity a dense spray turns into a solid smear.
      const dist = Math.hypot(mx - px, my - py);
      const n = Math.min(1 + Math.round(dist / 16), 4);
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const x = px + (mx - px) * t;
        const y = py + (my - py) * t;
        parts.push({
          x: Math.round((x + (Math.random() - 0.5) * 16) / GRID) * GRID,
          y: Math.round((y + (Math.random() - 0.5) * 16) / GRID) * GRID,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7 - 0.2,
          life: 1,
          // ~0.2–0.35s of life: long enough to read as a trail, short
          // enough that it stays close to the pointer.
          decay: 0.05 + Math.random() * 0.04,
          size: GRID * (0.5 + Math.random() * 0.7) * boost,
          c: PALETTE[(Math.random() * PALETTE.length) | 0],
        });
      }
      px = mx; py = my;
      if (parts.length > MAX) parts.splice(0, parts.length - MAX);
    }, { passive: true });

    /* Click burst — a radial pop of the same pixels. Reads instantly, so
       it still registers even when the click navigates away a moment
       later; that's why this rather than a slow shatter animation. */
    addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      const cx = e.clientX, cy = e.clientY;
      for (let i = 0; i < 18; i++) {
        const ang = (Math.PI * 2 * i) / 18 + Math.random() * 0.35;
        const speed = 1.6 + Math.random() * 2.6;
        parts.push({
          x: Math.round(cx / GRID) * GRID,
          y: Math.round(cy / GRID) * GRID,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          life: 1,
          decay: 0.045 + Math.random() * 0.03,
          size: GRID * (0.55 + Math.random() * 0.6),
          c: PALETTE[(Math.random() * PALETTE.length) | 0],
        });
      }
      if (parts.length > MAX * 2) parts.splice(0, parts.length - MAX * 2);
    }, { passive: true });

    // Interactive elements make the spray bigger and busier.
    const HOT = "a, button, [data-cursor], input, textarea, select, .card";
    document.addEventListener("pointerover", (e) => {
      if (e.target.closest(HOT)) boost = 1.7;
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest(HOT)) boost = 1;
    });

    (function loop() {
      requestAnimationFrame(loop);
      ctx.clearRect(0, 0, w, h);
      if (!parts.length) return;

      // source-over, not additive: at full opacity `lighter` sums overlaps
      // to white and the palette disappears. Painting normally keeps each
      // pixel its actual colour, which is what carries the contrast.
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= p.decay;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.008;              // a touch of gravity so the trail settles
        ctx.globalAlpha = p.life * p.life * ALPHA;
        ctx.fillStyle = p.c;
        const s = Math.max(2, p.size * (0.35 + p.life * 0.65));
        ctx.fillRect(p.x | 0, p.y | 0, s, s);
      }
      ctx.globalAlpha = 1;
    })();

    addEventListener("blur", () => { parts.length = 0; });
  }

  function initMagnetic() {
    if (REDUCED || !matchMedia("(pointer: fine)").matches) return;
    $$("[data-magnetic]").forEach((el) => {
      const strength = Number(el.dataset.magnetic) || 0.28;
      el.style.transition = "transform .35s cubic-bezier(.22,1,.36,1)";
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* =================================================================
     REVEAL ON SCROLL
     ================================================================= */
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-shown");
        revealIO.unobserve(e.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
  );

  function observeReveals(root = document) {
    $$("[data-reveal], .lines, .skill", root).forEach((el) => {
      if (el.classList.contains("is-shown")) return;
      revealIO.observe(el);
    });
  }
  RS.observeReveals = observeReveals;

  /* Wrap each line of a .lines heading so it can slide up from a mask. */
  function prepLines() {
    $$(".lines").forEach((el) => {
      if (el.dataset.prepped) return;
      el.dataset.prepped = "1";
      $$("span", el).forEach((s, i) => {
        s.style.setProperty("--i", i);
        if (!s.querySelector("b")) s.innerHTML = `<b>${s.innerHTML}</b>`;
      });
    });
  }

  /* =================================================================
     PARALLAX
     ================================================================= */
  function initParallax() {
    const items = $$("[data-parallax]");
    if (!items.length || REDUCED) return;
    let ticking = false;

    const update = () => {
      const vh = innerHeight;
      items.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const speed = Number(el.dataset.parallax) || 0.12;
        const centre = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-centre * speed).toFixed(2)}px, 0)`;
      });
      ticking = false;
    };
    addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* =================================================================
     COUNTERS
     ================================================================= */
  function initCounters() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target;
        const to = Number(el.dataset.count) || 0;
        if (REDUCED) { el.textContent = to; return; }
        const dur = 1400, t0 = performance.now();
        (function step(now) {
          const p = Math.min((now - t0) / dur, 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.4 });
    $$("[data-count]").forEach((el) => io.observe(el));
  }

  /* =================================================================
     WORK GRID
     ================================================================= */
  /* ---------------------------------------------------------------
     JUSTIFIED LAYOUT

     A fixed-shape grid forces every card into the same box, so artwork
     has to be cropped to fill it (object-fit: cover) or letterboxed to
     avoid cropping (contain). Neither is acceptable for a portfolio.

     Instead each card takes its artwork's own aspect ratio, and a row's
     height is solved so the widths sum to exactly the container width:

         rowHeight = (containerWidth - gaps) / Σ aspectRatios

     Every row is then flush left and right with no empty space, and no
     image is cropped, because each card is exactly its picture's shape.

     Row breaks come from a DP that splits the sequence into a fixed
     number of contiguous rows minimising deviation from a target height.
     A greedy fill would leave a short final row (the classic ragged last
     line); solving for an exact row count means every row fills.
     --------------------------------------------------------------- */
  function justify(ratios, containerW, gap, targetH) {
    const n = ratios.length;
    if (!n || containerW <= 0) return [];

    const rowHeight = (i, j) => {
      let sum = 0;
      for (let x = i; x <= j; x++) sum += ratios[x];
      return (containerW - gap * (j - i)) / sum;
    };

    // Aim for the row count that lands closest to the target height.
    const totalAr = ratios.reduce((a, b) => a + b, 0);
    let k = Math.max(1, Math.round((totalAr * targetH) / containerW));
    k = Math.min(k, n);

    // best[r][i] = least cost to split items i..n-1 into exactly r rows
    const INF = Infinity;
    const best = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(INF));
    const cut = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(-1));
    best[0][n] = 0;

    for (let r = 1; r <= k; r++) {
      for (let i = n - 1; i >= 0; i--) {
        // leave at least one item for each remaining row
        const maxJ = n - (r - 1) - 1;
        for (let j = i; j <= maxJ; j++) {
          const rest = best[r - 1][j + 1];
          if (rest === INF) continue;
          const h = rowHeight(i, j);
          const cost = (h - targetH) * (h - targetH) + rest;
          if (cost < best[r][i]) { best[r][i] = cost; cut[r][i] = j; }
        }
      }
    }

    const rows = [];
    let i = 0;
    for (let r = k; r >= 1 && i < n; r--) {
      const j = cut[r][i];
      if (j < 0) { rows.push({ from: i, to: n - 1, h: rowHeight(i, n - 1) }); break; }
      rows.push({ from: i, to: j, h: rowHeight(i, j) });
      i = j + 1;
    }
    return rows;
  }

  function cardHTML(w, i) {
    const light = w.light ? " is-light" : "";
    const poster = w.type === "video" ? w.poster : w.thumb || w.src;
    const badge = w.type === "video"
      ? `<span class="card__badge"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M0 0l10 5-10 5z"/></svg>Motion</span>`
      : "";
    const vid = w.type === "video"
      ? `<video muted loop playsinline preload="none" poster="${url(poster)}"
                data-src="${url(w.src)}" aria-hidden="true"></video>`
      : "";

    return `
      <button type="button" class="card${light}" data-cat="${esc(w.cat)}"
              data-id="${esc(w.id)}" data-i="${i}" data-cursor="View"
              style="--d:${(i % 6) * 0.06}s"
              aria-label="${esc(w.title)} — open project">
        <span class="card__media">
          <img src="${url(poster)}" alt="${esc(w.title)}" loading="lazy" decoding="async">
          ${vid}
        </span>
        <span class="card__veil" aria-hidden="true"></span>
        ${badge}
        <span class="card__body">
          <span class="card__cat">${esc(catLabel(w.cat))}</span>
          <span class="card__title">${esc(w.title)}</span>
          <span class="card__meta">
            <span>${esc(w.client)}</span><i>/</i><span>${esc(w.year)}</span>
            <i>/</i><span>${esc(w.tools.join(", "))}</span>
          </span>
        </span>
      </button>`;
  }

  /* Reveal cards as they enter, and prime hover-video sources lazily. */
  const cardIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      cardIO.unobserve(e.target);
      const card = e.target;
      const delay = parseFloat(card.style.getPropertyValue("--d")) || 0;
      setTimeout(() => card.classList.add("is-shown"), delay * 1000);
      const img = $("img", card);
      if (img) {
        if (img.complete) card.classList.add("is-loaded");
        else img.addEventListener("load", () => card.classList.add("is-loaded"), { once: true });
        img.addEventListener("error", () => card.classList.add("is-loaded"), { once: true });
      }
    });
  }, { rootMargin: "120px" });

  function initGrid(root, works, opts = {}) {
    if (!root) return null;
    let list = works.slice();

    function paint(items) {
      if (!items.length) {
        root.innerHTML = `<p class="grid-empty">Nothing here yet — try another filter.</p>`;
        opts.onPaint?.(items);
        return;
      }
      root.innerHTML = `<div class="grid__rows">${items.map(cardHTML).join("")}</div>`;
      $$(".card", root).forEach((c) => cardIO.observe(c));
      wireCards(root, items);
      measure(items);
      opts.onPaint?.(items);
    }

    /* Size the cards. Re-run on resize because both the container width
       and the target row height are viewport-dependent. */
    function measure(items) {
      const host = $(".grid__rows", root);
      if (!host) return;
      const cards = $$(".card", host);
      if (!cards.length) return;

      const cs = getComputedStyle(host);
      const gap = parseFloat(cs.gap) || 0;
      const width = host.clientWidth;
      if (!width) return;

      // Narrow screens: one full-width card per row, natural height.
      if (width < 620) {
        cards.forEach((c, i) => {
          const ar = items[i].ar || 1.6;
          c.style.width = "100%";
          c.style.height = Math.round(width / ar) + "px";
        });
        return;
      }

      const targetH = width < 1000 ? width * 0.34 : Math.min(width * 0.26, 380);
      const ratios = items.map((w) => w.ar || 1.6);
      const rows = justify(ratios, width, gap, targetH);

      rows.forEach((row) => {
        for (let i = row.from; i <= row.to; i++) {
          const card = cards[i];
          if (!card) continue;
          card.style.height = Math.round(row.h) + "px";
          // flex-basis carries the width; grow/shrink off so the solved
          // widths are honoured exactly and the row stays flush.
          card.style.flex = `0 0 ${(ratios[i] * row.h).toFixed(2)}px`;
          card.style.width = "";
        }
      });
    }

    let resizeRaf = 0;
    addEventListener("resize", () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => measure(list));
    });

    function wireCards(scope, items) {
      $$(".card", scope).forEach((card) => {
        const i = Number(card.dataset.i);
        card.addEventListener("click", () => RS.lightbox.open(items, i));

        const video = $("video", card);
        if (!video) return;
        let started = false;   // src attached yet?
        let hovering = false;

        /* Only reveal the video once it genuinely has frames. Swapping on
           pointerenter hides the poster while the element is still empty,
           which shows as a grey box for as long as the file takes to
           buffer. `playing` fires after the first frame is presented. */
        video.addEventListener("playing", () => {
          if (hovering) card.classList.add("is-playing");
        });

        card.addEventListener("pointerenter", () => {
          if (REDUCED) return;
          hovering = true;
          if (!started) {
            video.src = video.dataset.src;
            started = true;
          }
          const p = video.play();
          if (p && p.catch) p.catch(() => {});   // autoplay refusal: keep poster
        });

        card.addEventListener("pointerleave", () => {
          hovering = false;
          video.pause();
          card.classList.remove("is-playing");
        });
      });
    }

    paint(list);

    return {
      filter(cat) {
        list = cat === "all" ? works.slice() : works.filter((w) => w.cat === cat);
        paint(list);
        return list.length;
      },
      get items() { return list; },
    };
  }

  /* =================================================================
     LIGHTBOX
     ================================================================= */
  function buildLightbox() {
    if ($(".lb")) return;
    const el = document.createElement("div");
    el.className = "lb";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Project viewer");
    el.innerHTML = `
      <div class="lb__bar">
        <span class="lb__idx" data-lb-idx></span>
        <button class="lb__close" type="button" data-lb-close aria-label="Close viewer">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="lb__stage">
        <button class="lb__nav lb__nav--prev" type="button" data-lb-prev aria-label="Previous project">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="lb__frame" data-lb-frame></div>
        <button class="lb__nav lb__nav--next" type="button" data-lb-next aria-label="Next project">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
      <div class="lb__info">
        <div>
          <p class="lb__cat" data-lb-cat></p>
          <h2 class="lb__title" data-lb-title></h2>
        </div>
        <p class="lb__blurb" data-lb-blurb></p>
        <div class="lb__tools" data-lb-tools></div>
      </div>`;
    document.body.appendChild(el);

    let items = [];
    let idx = 0;
    let opener = null;
    const frame = $("[data-lb-frame]", el);

    function show(i) {
      idx = ((i % items.length) + items.length) % items.length;
      const w = items[idx];
      el.classList.remove("is-ready");
      el.classList.toggle("is-light", !!w.light);

      frame.innerHTML = w.type === "video"
        ? `<video src="${url(w.src)}" poster="${url(w.poster)}" controls autoplay loop muted playsinline></video>`
        : `<img src="${url(w.src)}" alt="${esc(w.title)}">`;

      const media = frame.firstElementChild;
      const ready = () => el.classList.add("is-ready");
      if (w.type === "video") media.addEventListener("loadeddata", ready, { once: true });
      else if (media.complete) requestAnimationFrame(ready);
      else media.addEventListener("load", ready, { once: true });
      media.addEventListener("error", ready, { once: true });

      $("[data-lb-idx]", el).textContent =
        `${String(idx + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
      $("[data-lb-cat]", el).textContent = `${catLabel(w.cat)} — ${w.year}`;
      $("[data-lb-title]", el).textContent = w.title;
      $("[data-lb-blurb]", el).textContent = w.blurb;
      $("[data-lb-tools]", el).innerHTML =
        [w.client, ...w.tools].map((t) => `<span class="tag">${esc(t)}</span>`).join("");
    }

    function open(list, i) {
      items = list; opener = document.activeElement;
      document.body.classList.add("is-locked");
      el.classList.add("is-open");
      show(i);
      $("[data-lb-close]", el).focus({ preventScroll: true });
    }

    function close() {
      el.classList.remove("is-open", "is-ready");
      document.body.classList.remove("is-locked");
      setTimeout(() => { frame.innerHTML = ""; }, 450);
      if (opener) opener.focus({ preventScroll: true });
    }

    $("[data-lb-close]", el).addEventListener("click", close);
    $("[data-lb-prev]", el).addEventListener("click", () => show(idx - 1));
    $("[data-lb-next]", el).addEventListener("click", () => show(idx + 1));
    el.addEventListener("click", (e) => {
      if (e.target === el || e.target.classList.contains("lb__stage")) close();
    });
    addEventListener("keydown", (e) => {
      if (!el.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });

    RS.lightbox = { open, close };
  }

  /* =================================================================
     HERO
     ================================================================= */
  function initHero() {
    const hero = $("[data-hero]");
    if (!hero) return;

    const canvas = $(".hero__canvas", hero);
    const fallback = $(".hero__fallback", hero);
    const dots = $$(".hero__dot", hero);
    const toggle = $(".hero__toggle", hero);
    const kicker = $("[data-hero-kicker]", hero);
    const label = $("[data-hero-label]", hero);
    const slides = RS.hero;

    let i = 0, timer = null, paused = REDUCED;
    let gl = null;

    function paintMeta() {
      if (kicker) kicker.textContent = slides[i].kicker;
      if (label) label.textContent = slides[i].label;
      dots.forEach((d, n) => {
        d.classList.toggle("is-active", n === i);
        d.classList.toggle("is-paused", paused);
      });
      if (fallback) fallback.style.backgroundImage = `url("${url(slides[i].src)}")`;
    }

    function go(n) {
      i = ((n % slides.length) + slides.length) % slides.length;
      if (gl) gl.goTo(i);
      // Restart the dot progress bar: drop the class, force a synchronous
      // reflow, re-add. rAF would be throttled in a background tab.
      dots.forEach((d) => d.classList.remove("is-active"));
      void dots[0]?.offsetWidth;
      paintMeta();
    }

    function start() {
      stop();
      if (paused) return;
      timer = setInterval(() => go(i + 1), 5600);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach((d, n) =>
      d.addEventListener("click", () => { go(n); if (!paused) start(); })
    );

    if (toggle) {
      toggle.addEventListener("click", () => {
        paused = !paused;
        toggle.classList.toggle("is-paused", paused);
        toggle.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
        paused ? stop() : start();
        paintMeta();
      });
    }

    // Pause when the tab is hidden — no point burning GPU in the background.
    document.addEventListener("visibilitychange", () => {
      document.hidden ? stop() : (!paused && start());
    });

    paintMeta();
    // setTimeout, not rAF — a page opened in a background tab must still
    // arrive with its hero text in place rather than sitting invisible.
    setTimeout(() => hero.classList.add("is-in"), 80);

    /* WebGL layer boots when the module has registered its factory. */
    RS._bootHeroGL = () => {
      if (!RS.createHeroGL || !canvas) return;
      gl = RS.createHeroGL(canvas, slides.map((s) => url(s.src)), {
        onProgress: (p) => RS.preloader?.set(0.2 + p * 0.6),
        onReady: () => {
          hero.classList.add("gl-ready");
          RS.preloader?.set(0.9);
          start();
        },
      });
      if (!gl) start(); // WebGL refused — keep the CSS fallback slideshow
    };
    if (RS.createHeroGL) RS._bootHeroGL();

    // If the module never loads (offline CDN), still run the fallback show.
    setTimeout(() => { if (!gl && !timer && !paused) start(); }, 2500);
  }

  /* =================================================================
     PRELOADER
     ================================================================= */
  function initPreloader() {
    const el = $("[data-preloader]");
    if (!el) return;

    // Arriving from another page already has a curtain — running the
    // preloader on top of it would mean two intros back to back.
    if (ARRIVED_VIA_PT) { el.remove(); return; }
    const fill = $(".preloader__fill", el);
    const pct = $(".preloader__pct", el);
    let shown = 0, target = 0.12, done = false;

    RS.preloader = { set(v) { target = Math.max(target, Math.min(v, 1)); } };

    (function loop() {
      shown += (target - shown) * 0.12;
      if (fill) fill.style.right = `${(1 - shown) * 100}%`;
      if (pct) pct.textContent = `${Math.round(shown * 100)}%`;
      if (done && shown > 0.995) return;
      requestAnimationFrame(loop);
    })();

    function finish() {
      if (done) return;
      done = true;
      target = 1;
      setTimeout(() => {
        el.classList.add("is-done");
        document.body.classList.remove("is-locked");
        setTimeout(() => el.remove(), 800);
      }, 420);
    }

    document.body.classList.add("is-locked");
    if (document.readyState === "complete") setTimeout(finish, 250);
    else addEventListener("load", () => setTimeout(finish, 250));
    // Never hold the page hostage to a slow asset.
    setTimeout(finish, 5000);
  }

  /* =================================================================
     SMALL BITS — FAQ, forms, to-top, marquees
     ================================================================= */
  function initFaq() {
    $$(".faq__item").forEach((item) => {
      const q = $(".faq__q", item);
      if (!q) return;
      q.setAttribute("aria-expanded", "false");
      q.addEventListener("click", () => {
        const open = item.classList.toggle("is-open");
        q.setAttribute("aria-expanded", String(open));
      });
    });
  }

  function initToTop() {
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-to-top]");
      if (!b) return;
      scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
    });
  }

  /* Infinite logo strip.
     Two things break a CSS marquee, and both bit this one:
       1. lazy images — the off-screen copy never loads, so it keeps its
          placeholder width and the two halves stop matching;
       2. too few repetitions — the track animates by -50%, so ONE half
          must be at least as wide as the container or a gap scrolls in.
     Icons are therefore eager with a fixed box, and the set is repeated
     until a half covers the viewport, re-fitting on resize. */
  function initTools() {
    $$("[data-tools]").forEach((host) => {
      const set = (hidden) => RS.tools
        .map((t) => `<img src="${url(t.icon)}" alt="${hidden ? "" : esc(t.name)}"` +
                    `${hidden ? ' aria-hidden="true"' : ""} decoding="async" width="44" height="44">`)
        .join("");

      const build = (reps) => {
        let a = "", b = "";
        for (let i = 0; i < reps; i++) { a += set(i > 0); b += set(true); }
        // Keep the linear speed constant as the track grows.
        host.innerHTML =
          `<div class="tools" style="--tools-speed:${(reps * 11).toFixed(0)}s">${a}${b}</div>`;
        return host.firstElementChild;
      };

      let reps = 1;
      let track = build(1);

      /* Width of one full set of logos. Re-measured on every fit rather
         than cached: the icon margins are vw-based, so a cached value goes
         stale the moment the window is resized and would under-fill the
         strip. Icons have a fixed 44px box, so this is exact immediately —
         no need to wait for the SVGs to decode. */
      const setWidth = () => {
        const img = track.querySelector("img");
        if (!img) return 0;
        const cs = getComputedStyle(img);
        const per = img.getBoundingClientRect().width +
                    parseFloat(cs.marginLeft) + parseFloat(cs.marginRight);
        return per * RS.tools.length;
      };

      const fit = () => {
        const setW = setWidth();
        if (!setW) return;
        // One half must comfortably exceed the container, or a gap scrolls
        // in at the wrap point. The 1.25 is headroom, not superstition.
        const need = Math.max(2, Math.ceil((host.getBoundingClientRect().width * 1.25) / setW));
        if (need === reps) return;
        reps = need;
        track = build(reps);
      };
      fit();
      addEventListener("resize", fit);
    });
  }

  function initMarquee() {
    $$("[data-marquee]").forEach((host) => {
      const words = (host.dataset.marquee || "").split("|").map((s) => s.trim()).filter(Boolean);
      if (!words.length) return;
      const set = words
        .map((w, i) => `<span class="marquee__item${i % 2 ? " is-out" : ""}">${esc(w)}<span class="dot"></span></span>`)
        .join("");
      host.innerHTML = `<div class="marquee__track">${set}${set}</div>`;
    });
  }

  /* Contact form — validates locally, then hands off to the mail client.
     Swap the submit handler for a real endpoint (Formspree/Netlify) later. */
  function initContactForm() {
    const form = $("[data-contact-form]");
    if (!form) return;
    const status = $("[data-form-status]", form);

    const fail = (field, msg) => {
      field.closest(".field").classList.add("has-error");
      const e = $(".err", field.closest(".field"));
      if (e) e.textContent = msg;
    };
    const clear = (field) => {
      field.closest(".field").classList.remove("has-error");
      const e = $(".err", field.closest(".field"));
      if (e) e.textContent = "";
    };

    $$("input, textarea", form).forEach((f) =>
      f.addEventListener("input", () => clear(f))
    );

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.elements.name;
      const email = form.elements.email;
      const message = form.elements.message;
      const subject = form.elements.subject;

      // Re-validate from scratch: clear last attempt's errors first, or a
      // field the user has since fixed keeps showing as invalid.
      [name, email, message].forEach(clear);
      let ok = true;

      if (!name.value.trim()) { fail(name, "Please add your name."); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        fail(email, "That email doesn't look right."); ok = false;
      }
      if (message.value.trim().length < 12) {
        fail(message, "A few more words, please — at least 12 characters."); ok = false;
      }
      if (!ok) return;

      const body =
        `Name: ${name.value.trim()}\n` +
        `Email: ${email.value.trim()}\n` +
        `Project type: ${subject.value}\n\n` +
        `${message.value.trim()}\n`;

      location.href =
        `mailto:${RS.contact.email}` +
        `?subject=${encodeURIComponent(`New enquiry — ${subject.value}`)}` +
        `&body=${encodeURIComponent(body)}`;

      if (status) {
        status.textContent =
          "Your email app should be opening now. If it didn't, write to " +
          RS.contact.email + " directly.";
        status.classList.add("is-shown", "is-ok");
      }
      form.reset();
    });
  }

  /* =================================================================
     PAGE BOOT
     ================================================================= */
  function boot() {
    readArrivalFlag();   // must run before initTransition / initPreloader
    renderShell();
    buildLightbox();
    initTransition();
    initHeader();
    initMenu();
    initCursor();
    initMagnetic();
    initToTop();
    initTools();
    initMarquee();
    initFaq();
    initContactForm();
    initCounters();
    prepLines();
    observeReveals();
    initParallax();
    initPreloader();
    initHero();

    // Page-specific hooks defined inline in each HTML file.
    if (typeof RS.page === "function") RS.page({ $, $$, esc, url, initGrid, catLabel, observeReveals, prepLines });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
