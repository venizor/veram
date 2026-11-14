/* VERAM demo — vanilla JS. Each block maps to a future React component/hook. */
(() => {
  "use strict";
  document.documentElement.classList.add("js");

  const D = window.VERAM;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const money = (n) => D.currency + n.toLocaleString("en-IN");
  const byId = (id) => D.products.find((p) => p.id === id);
  const store = {
    get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } },
    set(k, v) { try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); } catch {} }
  };

  /* Hero title intro (no loader) */
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("is-ready")));

  /* ---------------- Theme toggle ---------------- */
  (function theme() {
    const root = document.documentElement, btn = $("[data-theme-toggle]"), meta = $('meta[name="theme-color"]');
    const apply = (t) => {
      root.dataset.theme = t;
      btn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
      meta.setAttribute("content", t === "dark" ? "#0c0a08" : "#f7f3ec");
    };
    apply(root.dataset.theme || "dark");
    btn.addEventListener("click", () => {
      const t = root.dataset.theme === "dark" ? "light" : "dark";
      apply(t);
      try { localStorage.setItem("veram-theme", t); } catch {}
    });
  })();

  /* ---------------- Header ---------------- */
  (function header() {
    const h = $("[data-header]");
    let last = scrollY;
    const run = () => {
      const y = scrollY;
      h.classList.toggle("is-scrolled", y > 40);
      h.classList.toggle("is-hidden", y > 400 && y > last && !document.body.classList.contains("is-locked"));
      last = y;
    };
    addEventListener("scroll", run, { passive: true }); run();
  })();

  /* ---------------- Overlays ---------------- */
  const scrim = $("[data-scrim]");
  const lock = (on) => document.body.classList.toggle("is-locked", on);
  const overlays = { menu: $("[data-menu]"), cart: $("[data-cart]"), sheet: $("[data-sheet]") };
  function open(name) {
    Object.keys(overlays).forEach((k) => k !== name && close(k, true));
    overlays[name].classList.add("is-open");
    overlays[name].setAttribute("aria-hidden", "false");
    if (name !== "menu") scrim.classList.add("is-on");
    lock(true);
  }
  function close(name, silent) {
    const el = overlays[name];
    if (!el.classList.contains("is-open")) return;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    if (!silent) { scrim.classList.remove("is-on"); lock(false); }
  }
  const closeAll = () => { Object.keys(overlays).forEach((k) => close(k, true)); scrim.classList.remove("is-on"); lock(false); };

  $("[data-menu-open]").addEventListener("click", () => open("menu"));
  $("[data-menu-close]").addEventListener("click", () => close("menu"));
  $$("[data-menu-link]").forEach((a) => a.addEventListener("click", () => close("menu")));
  $$("[data-cart-open]").forEach((b) => b.addEventListener("click", () => open("cart")));
  $$("[data-cart-close]").forEach((b) => b.addEventListener("click", () => close("cart")));
  $$("[data-sheet-close]").forEach((b) => b.addEventListener("click", () => close("sheet")));
  scrim.addEventListener("click", closeAll);
  addEventListener("keydown", (e) => e.key === "Escape" && closeAll());

  /* ---------------- Products grid ---------------- */
  const grid = $("[data-grid]");
  function cardHTML(p, i) {
    const no = String(i + 1).padStart(2, "0");
    const [title, sub] = p.name.split(" — ");
    return `
    <article class="card ${p.featured ? "card--feature" : ""}" data-id="${p.id}" data-cat="${p.cat}">
      <div class="card__media" data-open="${p.id}" role="button" tabindex="0" aria-label="Choose size for ${p.name}">
        <img src="${p.img}" alt="${p.name} oversized tee in ${p.colour}" loading="lazy" style="object-position:${p.pos}" />
        <span class="card__no mono">No. ${no}</span>
        <span class="card__tag">${p.tag}</span>
        ${p.featured ? `<div class="card__feature-badge">${title}<em>${sub}</em></div>` : ""}
        <div class="card__quick" aria-label="Quick add">
          ${D.sizes.map((s) => `<button data-qa="${p.id}" data-size="${s.size}" aria-label="Add size ${s.size}">${s.size}</button>`).join("")}
        </div>
        <button class="card__add" data-open="${p.id}" aria-label="Add ${p.name} to bag"><svg class="ico"><use href="#i-plus"/></svg></button>
      </div>
      <div class="card__info">
        <div>
          <h3 class="card__name">${p.name}</h3>
          <div class="card__col"><span class="swatch" style="background:${p.swatch}"></span>${p.colour}</div>
        </div>
        <span class="price">${money(p.price)}</span>
      </div>
    </article>`;
  }
  const promoHTML = `
    <a href="#fit" class="promo card" data-promo>
      <div class="promo__copy">
        <span class="mono dim">Oversized by design</span>
        <h3>Not sure<em>about size?</em></h3>
        <p>Pick your size and see the exact measurements — in inches or cm.</p>
      </div>
      <span class="link-arrow">Fit guide <svg class="ico"><use href="#i-arrow"/></svg></span>
    </a>`;
  grid.innerHTML = D.products.map(cardHTML).join("") + promoHTML;

  grid.addEventListener("click", (e) => {
    const qa = e.target.closest("[data-qa]");
    if (qa) { e.stopPropagation(); addToCart(qa.dataset.qa, qa.dataset.size); return; }
    const o = e.target.closest("[data-open]");
    if (o) openSheet(o.dataset.open);
  });
  grid.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches(".card__media")) openSheet(e.target.dataset.open);
  });

  function setFilter(f) {
    $$("[data-filter]").forEach((b) => { const on = b.dataset.filter === f; b.classList.toggle("is-active", on); b.setAttribute("aria-selected", on); });
    $$(".card[data-id]", grid).forEach((c) => {
      const show = f === "all" || c.dataset.cat === f;
      c.classList.toggle("is-hiding", !show);
      if (show) { c.classList.remove("in"); requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add("in"))); }
    });
    $("[data-promo]").classList.toggle("is-hiding", f !== "all");
  }
  $$("[data-filter]").forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)));
  $$("[data-filter-link]").forEach((a) => a.addEventListener("click", () => setFilter(a.dataset.filterLink)));
  $$("[data-price-for]").forEach((el) => (el.textContent = money(byId(el.dataset.priceFor).price)));

  /* ---------------- Quick-add sheet ---------------- */
  const addBtn = $("[data-sheet-add]");
  let sheetProduct = null, sheetSize = null;
  function openSheet(id) {
    const p = byId(id); if (!p) return;
    sheetProduct = p; sheetSize = null;
    const im = $("[data-sheet-img]");
    im.src = p.img; im.style.objectPosition = p.pos; im.alt = p.name;
    $("[data-sheet-cat]").textContent = `${p.cat} · ${p.colour}`;
    $("[data-sheet-name]").textContent = p.name;
    $("[data-sheet-desc]").textContent = p.desc;
    $("[data-sheet-price]").textContent = money(p.price);
    $("[data-sheet-sizes]").innerHTML = D.sizes.map((s) => `<button data-size="${s.size}">${s.size}</button>`).join("");
    addBtn.disabled = true; addBtn.innerHTML = "<span>Select a size</span>";
    open("sheet");
  }
  $("[data-sheet-sizes]").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    sheetSize = b.dataset.size;
    $$("button", e.currentTarget).forEach((x) => x.classList.toggle("is-active", x === b));
    addBtn.disabled = false;
    addBtn.innerHTML = `<span>Add to bag — ${money(sheetProduct.price)}</span><svg class="ico"><use href="#i-arrow"/></svg>`;
  });
  addBtn.addEventListener("click", () => { if (sheetProduct && sheetSize) { addToCart(sheetProduct.id, sheetSize); close("sheet"); } });
  $$("[data-quick]").forEach((b) => b.addEventListener("click", () => openSheet(b.dataset.quick)));

  /* ---------------- Cart ---------------- */
  let cart = store.get("veram-bag", []);
  const cartEl = overlays.cart;
  function addToCart(id, size) {
    const line = cart.find((l) => l.id === id && l.size === size);
    line ? line.qty++ : cart.push({ id, size, qty: 1 });
    renderCart(true);
    const p = byId(id);
    toast(`<img src="${p.img}" alt="">Added · ${p.name.split(" — ")[0]} (${size})<button data-toast-bag>View bag</button>`);
  }
  function renderCart(bump) {
    cart = cart.filter((l) => l.qty > 0 && byId(l.id));
    store.set("veram-bag", cart);
    const count = cart.reduce((a, l) => a + l.qty, 0);
    const total = cart.reduce((a, l) => a + l.qty * byId(l.id).price, 0);
    $$("[data-cart-count]").forEach((el) => { el.textContent = count; if (bump) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); } });
    $("[data-cart-count-label]").textContent = `(${count})`;
    $("[data-cart-total]").textContent = money(total);
    const left = D.freeShipAt - total;
    $("[data-ship-msg]").textContent = left > 0 ? `Add ${money(left)} more for free shipping` : "You've unlocked free shipping ✦";
    $("[data-ship-bar]").style.width = Math.min(100, (total / D.freeShipAt) * 100) + "%";
    cartEl.classList.toggle("is-empty", count === 0);
    $("[data-cart-items]").innerHTML = cart.map((l, i) => {
      const p = byId(l.id);
      return `<li class="line-item">
        <img src="${p.img}" alt="" style="object-position:${p.pos}">
        <div>
          <h4>${p.name}</h4>
          <div class="meta">${p.colour} · Size ${l.size}</div>
          <div class="qty">
            <button data-q="${i}" data-d="-1" aria-label="Decrease"><svg class="ico"><use href="#i-minus"/></svg></button>
            <span>${l.qty}</span>
            <button data-q="${i}" data-d="1" aria-label="Increase"><svg class="ico"><use href="#i-plus"/></svg></button>
          </div>
        </div>
        <div class="line-item__right"><span class="price">${money(p.price * l.qty)}</span><button class="remove" data-rm="${i}">Remove</button></div>
      </li>`;
    }).join("");
  }
  $("[data-cart-items]").addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]"), rm = e.target.closest("[data-rm]");
    if (q) cart[+q.dataset.q].qty += +q.dataset.d;
    if (rm) cart.splice(+rm.dataset.rm, 1);
    if (q || rm) renderCart();
  });
  renderCart();

  function orderText() {
    const lines = cart.map((l) => { const p = byId(l.id); return `• ${p.name} (${p.colour}) — Size ${l.size} × ${l.qty} = ${money(p.price * l.qty)}`; });
    const total = cart.reduce((a, l) => a + l.qty * byId(l.id).price, 0);
    return `Hi VERAM! I'd like to order:\n${lines.join("\n")}\n\nSubtotal: ${money(total)}\n\nName:\nAddress:\nPincode:`;
  }
  const wa = (text) => window.open(`https://wa.me/${D.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  $("[data-checkout-wa]").addEventListener("click", () => wa(orderText()));
  $("[data-checkout-ig]").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(orderText()); toast("Order copied — paste it in the DM"); } catch { toast("Opening Instagram DM…"); }
    setTimeout(() => window.open(`https://ig.me/m/${D.instagram}`, "_blank", "noopener"), 600);
  });
  $$("[data-wa]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); wa("Hi VERAM! I have a question about Drop 01."); }));

  /* ---------------- Toast ---------------- */
  const toastEl = $("[data-toast]");
  let tt;
  function toast(html) {
    toastEl.innerHTML = html;
    toastEl.classList.add("is-on");
    clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove("is-on"), 3200);
  }
  toastEl.addEventListener("click", (e) => { if (e.target.closest("[data-toast-bag]")) { toastEl.classList.remove("is-on"); open("cart"); } });

  /* ---------------- Fit guide ---------------- */
  (function fit() {
    let size = "M", unit = "in";
    const conv = (v) => (unit === "cm" ? +(v * 2.54).toFixed(1) : v);
    const tbody = $("[data-size-table]"), tee = $("[data-tee]");
    function animateNum(el, to) {
      const from = parseFloat(el.textContent) || 0, dec = Number.isInteger(to) ? 0 : 1, t0 = performance.now();
      if (reduce) { el.textContent = to.toFixed(dec); return; }
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 500), e = 1 - Math.pow(1 - k, 3);
        el.textContent = (from + (to - from) * e).toFixed(dec);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    function update() {
      const s = D.sizes.find((x) => x.size === size);
      const u = unit === "in" ? '"' : " cm";
      [["length", s.length], ["chest", s.chest], ["full", s.full], ["fits", s.fits]].forEach(([k, v]) => {
        const el = $(`[data-r="${k}"]`); el.dataset.unit = unit; animateNum(el, conv(v));
      });
      $("[data-dim-chest]").textContent = conv(s.chest) + u;
      $("[data-dim-len]").textContent = conv(s.length) + u;
      const sx = 0.86 + ((s.chest - 19.8) / (23.3 - 19.8)) * 0.14;
      const sy = 0.88 + ((s.length - 27) / (31 - 27)) * 0.12;
      tee.style.transform = `scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
      $$("[data-fit-sizes] button").forEach((b) => { const on = b.dataset.size === size; b.classList.toggle("is-active", on); b.setAttribute("aria-checked", on); });
      tbody.innerHTML = D.sizes.map((r) => `<tr data-size="${r.size}" class="${r.size === size ? "is-active" : ""}"><td>${r.size}</td><td>${conv(r.fits)}</td><td>${conv(r.length)}</td><td>${conv(r.chest)}</td><td>${conv(r.full)}</td></tr>`).join("");
    }
    $("[data-fit-sizes]").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { size = b.dataset.size; update(); } });
    tbody.addEventListener("click", (e) => { const r = e.target.closest("tr"); if (r) { size = r.dataset.size; update(); } });
    $$("[data-unit]").forEach((b) => b.addEventListener("click", () => {
      unit = b.dataset.unit; $$("[data-unit]").forEach((x) => x.classList.toggle("is-active", x === b)); update();
    }));
    update();
  })();

  /* ---------------- Reels ---------------- */
  (function reels() {
    const rail = $("[data-rail]");
    rail.innerHTML = D.reels.map((r, i) => `
      <a class="reel" href="${r.url}" target="_blank" rel="noopener" aria-label="Watch reel: ${r.title} on Instagram">
        <iframe src="${r.url}embed" loading="lazy" tabindex="-1" title="${r.title}" scrolling="no"></iframe>
        <div class="reel__top"><span class="mono">Reel ${String(i + 1).padStart(2, "0")}</span><svg class="ico"><use href="#i-ig"/></svg></div>
        <div class="reel__title">${r.title}<small>Watch on Instagram ↗</small></div>
      </a>`).join("");
    const by = (d) => rail.scrollBy({ left: d * (rail.firstElementChild.offsetWidth + 10), behavior: reduce ? "auto" : "smooth" });
    $("[data-rail-prev]").addEventListener("click", () => by(-1));
    $("[data-rail-next]").addEventListener("click", () => by(1));
  })();

  /* ---------------- Story: hotspots + panels ---------------- */
  (function story() {
    const tip = $("[data-tooltip]"), spots = $$(".hotspot");
    const hide = () => { tip.classList.remove("is-on"); spots.forEach((s) => s.classList.remove("is-active")); };
    function show(h) {
      spots.forEach((s) => s.classList.toggle("is-active", s === h));
      tip.textContent = h.dataset.tip;
      const fr = h.parentElement.getBoundingClientRect(), hr = h.getBoundingClientRect();
      let x = hr.left - fr.left + hr.width / 2 - 110, y = hr.top - fr.top + hr.height + 8;
      x = Math.max(8, Math.min(x, fr.width - 228));
      if (y > fr.height - 90) y = hr.top - fr.top - 90;
      tip.style.left = x + "px"; tip.style.top = y + "px";
      tip.classList.add("is-on");
    }
    spots.forEach((h) => {
      h.addEventListener("click", (e) => { e.stopPropagation(); h.classList.contains("is-active") && tip.classList.contains("is-on") ? hide() : show(h); });
      if (finePointer) h.addEventListener("mouseenter", () => show(h));
    });
    document.addEventListener("click", hide);
    const idx = $("[data-story-index]");
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) {
        $$(".panel").forEach((p) => p.classList.toggle("is-active", p === en.target));
        idx.textContent = `0${en.target.dataset.panel} / 03`;
      }
    }), { rootMargin: "-45% 0px -45% 0px" });
    $$(".panel").forEach((p) => io.observe(p));
  })();

  /* ---------------- Manifesto word reveal ---------------- */
  (function words() {
    const el = $("[data-words]");
    const serif = new Set(["Valour.", "courage", "archer,", "charioteer,", "flute", "player", "Maximum", "attitude."]);
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w ${serif.has(w) ? "serif" : ""}">${w}</span>`).join(" ");
    const ws = $$(".w", el);
    if (reduce) return ws.forEach((w) => w.classList.add("on"));
    const run = () => {
      const r = el.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.25)));
      const n = Math.round(p * ws.length);
      ws.forEach((w, i) => w.classList.toggle("on", i < n));
    };
    addEventListener("scroll", run, { passive: true }); run();
  })();

  /* ---------------- Reveal on scroll ---------------- */
  const rio = new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal, .reveal-img, .card").forEach((el, i) => {
    if (el.classList.contains("card")) el.style.transitionDelay = (i % 4) * 70 + "ms";
    rio.observe(el);
  });

  /* ---------------- Parallax (desktop) ---------------- */
  if (!reduce && finePointer) {
    const els = $$("[data-parallax]");
    let ticking = false;
    const run = () => {
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        const c = r.top + r.height / 2 - innerHeight / 2;
        el.style.transform = `translate3d(0, ${(-c * parseFloat(el.dataset.parallax)).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---------------- Cursor + magnetic (desktop) ---------------- */
  if (finePointer && !reduce && innerWidth >= 1024) {
    const cur = $(".cursor");
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; cur.classList.remove("is-hidden"); });
    document.addEventListener("mouseleave", () => cur.classList.add("is-hidden"));
    document.addEventListener("mouseover", (e) => cur.classList.toggle("is-hover", !!e.target.closest("a, button, .card__media, [role=button]")));
    const loop = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; requestAnimationFrame(loop); };
    loop();
    $$("[data-magnetic]").forEach((b) => {
      b.addEventListener("mousemove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      b.addEventListener("mouseleave", () => (b.style.transform = ""));
    });
  }

  /* ---------------- Waitlist ---------------- */
  $("[data-waitlist]").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#wl").value.trim(), msg = $("[data-waitlist-msg]");
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\+?\d[\d\s-]{8,}$/.test(v);
    msg.textContent = ok ? "You're on the list. We'll message you before Drop 02 goes live." : "Enter a valid email or WhatsApp number.";
    if (ok) e.target.reset();
  });
})();
