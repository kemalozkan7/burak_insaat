/* =========================================================
   BURAK İNŞAAT – Ortak bileşenler & etkileşimler
   ========================================================= */
(function () {
  "use strict";
  const C = BI.company;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const page = document.body.dataset.page || "";

  /* ---------- İkonlar (inline SVG) ---------- */
  const I = {
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.9 2z"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    arrowL: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
    area: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>',
    home: '<path d="m3 11 9-8 9 8v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/>',
    handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a2 2 0 0 0-2.8 0L12 10.5a2 2 0 0 1-2.8 0L7.3 8.6M3 7l4-4 4 4M21 7l-4-4-4 4"/>',
    refresh: '<path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.4-2.6L3 16"/><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.4 2.6L21 8"/><path d="M3 21v-5h5M21 3v5h-5"/>',
    brush: '<path d="m9.1 14.9 6-6M16 3l5 5-9.5 9.5a2 2 0 0 1-1.4.6H7v-3.1a2 2 0 0 1 .6-1.4z"/><path d="M3 21c2-2 2-4 4-4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    whatsapp: '<path d="M3 21l1.6-4.6A9 9 0 1 1 8 19.5z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.5-1.5-2-1-1 1a4 4 0 0 1-2.5-2.5l1-1-1-2z"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    crane: '<path d="M4 21h16M6 21V9M6 9h12l-2-4H8zM18 9v4M18 13l-2 2h4z"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    youtube: '<path d="M22.5 6.4a3 3 0 0 0-2.1-2.1C18.5 3.8 12 3.8 12 3.8s-6.5 0-8.4.5A3 3 0 0 0 1.5 6.4 31 31 0 0 0 1 12a31 31 0 0 0 .5 5.6 3 3 0 0 0 2.1 2.1c1.9.5 8.4.5 8.4.5s6.5 0 8.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23 12a31 31 0 0 0-.5-5.6z"/><path d="m9.8 15.5 5.4-3.5-5.4-3.5z"/>'
  };
  const icon = (n, cls = "") =>
    `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || ""}</svg>`;
  BI.icon = icon;

  /* ---------- Header ---------- */
  const nav = [
    ["index.html", "Ana Sayfa", "home"],
    ["projeler.html", "Projeler", "projects"],
    ["hizmetler.html", "Hizmetler", "services"],
    ["hakkimizda.html", "Hakkımızda", "about"],
    ["iletisim.html", "İletişim", "contact"]
  ];

  function renderHeader() {
    const el = $("#site-header");
    if (!el) return;
    el.innerHTML = `
      <div class="topbar">
        <div class="container topbar__in">
          <div class="topbar__contact">
            <a href="tel:${C.phoneRaw}">${icon("phone")}<span>${C.phone}</span></a>
            <a href="mailto:${C.email}">${icon("mail")}<span>${C.email}</span></a>
            <span class="topbar__hours">${icon("clock")}<span>${C.hours}</span></span>
          </div>
          <div class="topbar__right">
            <div class="socials">
              <a href="${C.social.instagram}" aria-label="Instagram">${icon("instagram")}</a>
              <a href="${C.social.facebook}" aria-label="Facebook">${icon("facebook")}</a>
              <a href="${C.social.linkedin}" aria-label="LinkedIn">${icon("linkedin")}</a>
            </div>
            <div class="lang" title="Taslakta yalnızca Türkçe aktif">
              <a class="active" href="#">TR</a><a href="#">EN</a><a href="#">DE</a><a href="#">RU</a>
            </div>
          </div>
        </div>
      </div>
      <div class="navbar" id="navbar">
        <div class="container navbar__in">
          <a class="brand" href="index.html" aria-label="${C.name}">
            <span class="brand__mark"><img src="assets/img/logo-mark.png" alt="${C.name} logo"></span>
            <span class="brand__text"><strong>BURAK</strong><small>İNŞAAT</small></span>
          </a>
          <nav class="nav" id="nav">
            ${nav.map(([h, l, k]) => `<a href="${h}" class="${page === k ? "active" : ""}">${l}</a>`).join("")}
            <a href="iletisim.html#teklif" class="btn btn--gold nav__cta">Teklif Al ${icon("arrow")}</a>
          </nav>
          <button class="burger" id="burger" aria-label="Menü" aria-expanded="false">${icon("menu")}</button>
        </div>
      </div>`;

    const burger = $("#burger"), navEl = $("#nav");
    burger.addEventListener("click", () => {
      const open = navEl.classList.toggle("open");
      burger.setAttribute("aria-expanded", open);
      burger.innerHTML = icon(open ? "close" : "menu");
      document.body.classList.toggle("no-scroll", open);
    });
    const onScroll = () => $("#navbar").classList.toggle("scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Footer ---------- */
  function renderFooter() {
    const el = $("#site-footer");
    if (!el) return;
    const locs = BI.locations.slice(0, 6);
    el.innerHTML = `
      <div class="footer__cta">
        <div class="container footer__cta-in">
          <div>
            <span class="eyebrow eyebrow--light">Ücretsiz Keşif</span>
            <h3>Hayalinizdeki projeyi birlikte planlayalım</h3>
          </div>
          <div class="footer__cta-actions">
            <a class="btn btn--gold" href="iletisim.html#teklif">Teklif Formu ${icon("arrow")}</a>
            <a class="btn btn--ghost-light" href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener">${icon("whatsapp")} WhatsApp</a>
          </div>
        </div>
      </div>
      <div class="container footer__grid">
        <div class="footer__brand">
          <div class="footer__logo"><img src="assets/img/logo-full.png" alt="${C.name}"></div>
          <p>${C.slogan} ${C.founded} yılından bu yana Kuzey Kıbrıs'ta güvenle inşa ediyoruz.</p>
          <ul class="footer__contact">
            <li>${icon("pin")}<span>${C.address}</span></li>
            <li>${icon("phone")}<a href="tel:${C.phoneRaw}">${C.phone}</a></li>
            <li>${icon("mail")}<a href="mailto:${C.email}">${C.email}</a></li>
          </ul>
        </div>
        <div>
          <h4>Hızlı Bağlantılar</h4>
          <ul class="footer__links">
            ${nav.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}
            <li><a href="projeler.html?status=ongoing">Devam Eden Projeler</a></li>
            <li><a href="projeler.html?status=sale">Satılık Konutlar</a></li>
          </ul>
        </div>
        <div>
          <h4>Lokasyonlar</h4>
          <ul class="footer__links">
            ${locs.map(l => `<li><a href="projeler.html?loc=${encodeURIComponent(l)}">${l}</a></li>`).join("")}
          </ul>
        </div>
        <div>
          <h4>Bülten</h4>
          <p class="muted-light">Yeni proje lansmanları ve ön talep fırsatlarından ilk siz haberdar olun.</p>
          <form class="newsletter" data-form="newsletter">
            <input type="email" required placeholder="E-posta adresiniz" aria-label="E-posta">
            <button class="btn btn--gold" type="submit">Abone Ol</button>
          </form>
          <div class="socials socials--footer">
            <a href="${C.social.instagram}" aria-label="Instagram">${icon("instagram")}</a>
            <a href="${C.social.facebook}" aria-label="Facebook">${icon("facebook")}</a>
            <a href="${C.social.linkedin}" aria-label="LinkedIn">${icon("linkedin")}</a>
            <a href="${C.social.youtube}" aria-label="YouTube">${icon("youtube")}</a>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <div class="container footer__bottom-in">
          <span>© ${new Date().getFullYear()} ${C.name}. Tüm hakları saklıdır.</span>
          <span class="footer__legal"><a href="#">KVKK Aydınlatma Metni</a><a href="#">Çerez Politikası</a></span>
        </div>
      </div>`;
  }

  /* ---------- Yüzen butonlar ---------- */
  function renderFloating() {
    const wrap = document.createElement("div");
    wrap.className = "floating";
    wrap.innerHTML = `
      <a class="fab fab--wa" href="https://wa.me/${C.whatsapp}?text=${encodeURIComponent("Merhaba, projeleriniz hakkında bilgi almak istiyorum.")}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon("whatsapp")}<span>WhatsApp</span></a>
      <button class="fab fab--top" id="toTop" aria-label="Yukarı çık">${icon("up")}</button>`;
    document.body.appendChild(wrap);
    const top = $("#toTop");
    top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => top.classList.toggle("show", window.scrollY > 500), { passive: true });
  }

  /* ---------- data-icon yer tutucuları ---------- */
  function hydrateIcons(root = document) {
    $$("[data-icon]", root).forEach(el => {
      el.innerHTML = icon(el.dataset.icon);
    });
  }

  /* ---------- Görsel yedeği ---------- */
  function imageFallback() {
    document.addEventListener("error", e => {
      const t = e.target;
      if (t.tagName === "IMG" && !t.dataset.fallback) {
        t.dataset.fallback = "1";
        t.src = "assets/img/placeholder.svg";
      }
    }, true);
  }

  /* ---------- Scroll reveal ---------- */
  function reveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) return els.forEach(e => e.classList.add("in"));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- Sayaçlar ---------- */
  function counters() {
    const els = $$("[data-count]");
    if (!els.length) return;
    const run = el => {
      const target = +el.dataset.count, suffix = el.dataset.suffix || "";
      const dur = 1600, start = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e).toLocaleString("tr-TR") + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } }), { threshold: 0.4 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- Favoriler (localStorage) ---------- */
  const FAV_KEY = "bi_favs";
  const getFavs = () => JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  const toggleFav = id => {
    const f = getFavs(); const i = f.indexOf(id);
    i > -1 ? f.splice(i, 1) : f.push(id);
    localStorage.setItem(FAV_KEY, JSON.stringify(f));
    return i === -1;
  };

  /* ---------- Proje kartı ---------- */
  BI.projectCard = function (p) {
    const fav = getFavs().includes(p.id);
    const badge = `<span class="badge badge--${p.status}">${BI.statusLabels[p.status]}</span>`;
    const progress = p.status === "ongoing"
      ? `<div class="progress" title="İnşaat ilerlemesi %${p.progress}"><span style="width:${p.progress}%"></span></div>
         <div class="progress__meta"><span>İnşaat ilerlemesi</span><strong>%${p.progress}</strong></div>`
      : `<div class="progress__meta"><span>${p.status === "soon" ? "Ön talep dönemi" : "Teslim"}</span><strong>${p.delivery}</strong></div>`;
    return `
      <article class="card reveal" data-id="${p.id}">
        <a class="card__media" href="proje-detay.html?id=${p.id}">
          <img src="${p.image}" alt="${p.title}" loading="lazy">
          ${badge}
          <span class="card__price">${BI.fmtPrice(p.price)}</span>
        </a>
        <button class="card__fav ${fav ? "on" : ""}" data-fav="${p.id}" aria-label="Favorilere ekle">${icon("heart")}</button>
        <div class="card__body">
          <span class="card__loc">${icon("pin")} ${p.location}</span>
          <h3><a href="proje-detay.html?id=${p.id}">${p.title}</a></h3>
          <ul class="specs">
            <li>${icon("bed")} ${p.rooms}</li>
            <li>${icon("area")} ${p.area.toLocaleString("tr-TR")} m²</li>
            <li>${icon("layers")} ${p.floors} kat</li>
            <li class="specs__code">${p.code}</li>
          </ul>
          ${progress}
        </div>
      </article>`;
  };

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-fav]");
    if (!b) return;
    e.preventDefault();
    b.classList.toggle("on", toggleFav(b.dataset.fav));
    b.classList.add("pop"); setTimeout(() => b.classList.remove("pop"), 300);
  });

  /* ---------- Hero slider ---------- */
  function heroSlider() {
    const hero = $("[data-hero]");
    if (!hero) return;
    const slides = $$(".hero__slide", hero), dots = $(".hero__dots", hero);
    let i = 0, timer;
    slides.forEach((_, k) => {
      const d = document.createElement("button");
      d.setAttribute("aria-label", `Slayt ${k + 1}`);
      d.addEventListener("click", () => go(k, true));
      dots.appendChild(d);
    });
    const go = (k, manual) => {
      slides[i].classList.remove("active"); dots.children[i].classList.remove("active");
      i = (k + slides.length) % slides.length;
      slides[i].classList.add("active"); dots.children[i].classList.add("active");
      if (manual) restart();
    };
    const restart = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 6000); };
    slides[0].classList.add("active"); dots.children[0].classList.add("active"); restart();
    $("[data-hero-prev]", hero)?.addEventListener("click", () => go(i - 1, true));
    $("[data-hero-next]", hero)?.addEventListener("click", () => go(i + 1, true));
  }

  /* ---------- Referans slider ---------- */
  function testimonials() {
    const el = $("[data-testimonials]");
    if (!el) return;
    const track = $(".testi__track", el);
    track.innerHTML = BI.testimonials.map(t => `
      <figure class="testi">
        <div class="testi__stars">${icon("star").repeat(5)}</div>
        <blockquote>“${t.text}”</blockquote>
        <figcaption><strong>${t.name}</strong><span>${t.role}</span></figcaption>
      </figure>`).join("");
    let i = 0; const n = BI.testimonials.length;
    const dots = $(".testi__dots", el);
    for (let k = 0; k < n; k++) { const b = document.createElement("button"); b.addEventListener("click", () => go(k)); dots.appendChild(b); }
    const go = k => { i = (k + n) % n; track.style.transform = `translateX(-${i * 100}%)`; $$("button", dots).forEach((b, j) => b.classList.toggle("active", j === i)); };
    go(0); setInterval(() => go(i + 1), 7000);
  }

  /* ---------- Formlar (taslak) ---------- */
  function forms() {
    $$("form[data-form]").forEach(f => {
      f.addEventListener("submit", e => {
        e.preventDefault();
        if (!f.checkValidity()) { f.reportValidity(); return; }
        const btn = f.querySelector("[type=submit]"); const old = btn.innerHTML;
        btn.disabled = true; btn.innerHTML = "Gönderiliyor…";
        setTimeout(() => {
          btn.disabled = false; btn.innerHTML = old; f.reset();
          toast(f.dataset.form === "newsletter" ? "Bültenimize abone oldunuz. Teşekkürler!" : "Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.");
        }, 900);
      });
    });
  }
  function toast(msg) {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.innerHTML = `${icon("check")}<span>${msg}</span>`; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 3800);
  }
  BI.toast = toast;

  /* ---------- Hero arama → projeler ---------- */
  function heroSearch() {
    const f = $("[data-hero-search]");
    if (!f) return;
    const loc = $("select[name=loc]", f);
    if (loc) BI.locations.forEach(l => loc.insertAdjacentHTML("beforeend", `<option value="${l}">${l}</option>`));
    f.addEventListener("submit", e => {
      e.preventDefault();
      const q = new URLSearchParams(new FormData(f));
      [...q.keys()].forEach(k => { if (!q.get(k)) q.delete(k); });
      location.href = "projeler.html" + (q.toString() ? "?" + q : "");
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    imageFallback();
    renderHeader(); renderFooter(); renderFloating();
    hydrateIcons();
    heroSlider(); heroSearch(); testimonials(); forms();
    if (typeof BI.onPage === "function") BI.onPage({ $, $$, icon, hydrateIcons });
    hydrateIcons();
    reveal(); counters();
  });
})();
