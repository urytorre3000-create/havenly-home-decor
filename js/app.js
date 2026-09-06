/* ============================================================
   HAVENLY HOME DECOR — Lógica compartida
   Carrito, idioma, header/footer, favoritos, WhatsApp
   ============================================================ */

const STORE_NAME = "HAVENLY HOME DECOR";
const WHATSAPP_NUMBER = "584146503348";
const TAX_RATE = 0.16;
const FREE_SHIPPING_MIN = 75;
const SHIPPING_COST = 8;
const PROMO_CODE = "BIENVENIDO15";
const PROMO_PCT = 0.15;

let LANG = localStorage.getItem("havenly-lang") || "es";
let CART = JSON.parse(localStorage.getItem("havenly-cart") || "[]");
let FAVS = JSON.parse(localStorage.getItem("havenly-favs") || "[]");
let PROMO_APPLIED = false;

/* ---------- utilidades ---------- */
const t = (key) => (I18N[LANG] && I18N[LANG][key]) || I18N.es[key] || key;

const money = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const getProduct = (id) => PRODUCTS.find((p) => p.id === id);

const catName = (key) => {
  const map = {
    es: { sala: "Sala", dormitorio: "Dormitorio", comedor: "Comedor", cocina: "Cocina", pared: "Decoración de Pared", iluminacion: "Iluminación", alfombras: "Alfombras", accesorios: "Accesorios", almacenamiento: "Almacenamiento", exterior: "Exterior" },
    en: { sala: "Living Room", dormitorio: "Bedroom", comedor: "Dining", cocina: "Kitchen", pared: "Wall Decor", iluminacion: "Lighting", alfombras: "Rugs", accesorios: "Accessories", almacenamiento: "Storage", exterior: "Outdoor" }
  };
  return map[LANG][key] || key;
};

const starsHTML = (rating) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let s = "";
  for (let i = 0; i < 5; i++) {
    if (i < full) s += "★";
    else if (i === full && half) s += '<span style="opacity:.45">★</span>';
    else s += "☆";
  }
  return `<span class="stars" aria-label="${rating}">${s}</span>`;
};

const toast = (msg) => {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span></span>';
    document.body.appendChild(el);
  }
  el.querySelector("span").textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2600);
};

/* ---------- carrito ---------- */
const saveCart = () => localStorage.setItem("havenly-cart", JSON.stringify(CART));
const saveFavs = () => localStorage.setItem("havenly-favs", JSON.stringify(FAVS));

const cartCount = () => CART.reduce((a, c) => a + c.qty, 0);

const cartSubtotal = () => CART.reduce((a, c) => {
  const p = getProduct(c.id);
  return a + (p ? p.price * c.qty : 0);
}, 0);

const cartDiscount = () => PROMO_APPLIED ? cartSubtotal() * PROMO_PCT : 0;

const cartShipping = () => {
  const sub = cartSubtotal() - cartDiscount();
  if (sub === 0) return 0;
  return sub >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
};

const cartTax = () => (cartSubtotal() - cartDiscount()) * TAX_RATE;

const cartGrand = () => cartSubtotal() - cartDiscount() + cartShipping() + cartTax();

function addToCart(id, qty = 1) {
  const item = CART.find((c) => c.id === id);
  if (item) item.qty += qty;
  else CART.push({ id, qty });
  saveCart();
  updateCartBadges();
  toast(t("product.added"));
}

function removeFromCart(id) {
  CART = CART.filter((c) => c.id !== id);
  saveCart();
  updateCartBadges();
}

function setCartQty(id, qty) {
  const item = CART.find((c) => c.id === id);
  if (!item) return;
  item.qty = Math.max(1, qty);
  saveCart();
  updateCartBadges();
}

function updateCartBadges() {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = cartCount();
    el.style.display = cartCount() > 0 ? "grid" : "none";
  });
}

/* ---------- favoritos ---------- */
const isFav = (id) => FAVS.includes(id);

function toggleFav(id) {
  if (isFav(id)) FAVS = FAVS.filter((f) => f !== id);
  else FAVS.push(id);
  saveFavs();
  document.querySelectorAll(`[data-fav="${id}"]`).forEach((btn) => {
    btn.classList.toggle("active", isFav(id));
  });
}

/* ---------- idioma ---------- */
function applyLang() {
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-ph"));
  });
  document.querySelectorAll("[data-lang-btn]").forEach((b) => {
    b.classList.toggle("active", b.getAttribute("data-lang-btn") === LANG);
  });
}

function setLang(lang) {
  LANG = lang;
  localStorage.setItem("havenly-lang", lang);
  if (typeof window.__renderPage === "function") window.__renderPage();
  applyLang();
}

/* ---------- plantillas ---------- */
function icon(name) {
  const icons = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 21C7 16.5 3 13 3 8.8 3 6 5.2 4 7.8 4c1.7 0 3.2.9 4.2 2.3C13 4.9 14.5 4 16.2 4 18.8 4 21 6 21 8.8c0 4.2-4 7.7-9 12.2z"/></svg>',
    heartFill: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21C7 16.5 3 13 3 8.8 3 6 5.2 4 7.8 4c1.7 0 3.2.9 4.2 2.3C13 4.9 14.5 4 16.2 4 18.8 4 21 6 21 8.8c0 4.2-4 7.7-9 12.2z"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4h13v12H1z"/><path d="M14 8h4l3 4v4h-7z"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-10-1 12-5 16-9 17z"/><path d="M4 21c2-4 6-7 12-9"/></svg>',
    headset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="2" y="14" width="4" height="6" rx="2"/><rect x="18" y="14" width="4" height="6" rx="2"/><path d="M20 20a4 4 0 0 1-4 3h-3"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.4 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2.1 1c.3.2.5.3.6.4.1.1.1.6-.1 1.2z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3l.5-4H14V3c0-1 .3-2 2-2h2V.2C17.6.1 16.4 0 15.2 0 12.5 0 11 1.7 11 4.6V5H7v4h4v11h3V9z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23.3 22h-6.9l-5.4-7-6.2 7H1.7l8.1-9.3L.7 2h7.1l4.9 6.4L18.9 2zm-1.2 18h1.9L6.9 3.9H4.8L17.7 20z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 2h-3.1v13.3a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.3a6.2 6.2 0 0 0-.9-.1 6.1 6.1 0 1 0 6.1 6.1V8.6a7.5 7.5 0 0 0 4.3 1.4V6.9a4.5 4.5 0 0 1-4.4-4.9z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.5s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.6 4 12 4 12 4s-4.6 0-7.8.2c-.4.1-1.4.1-2.3 1-.7.7-.9 2.3-.9 2.3S.8 9.4.8 11.3v1.4c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.2 7.6.2s4.6 0 7.8-.2c.4-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8v-1.4c0-1.9-.2-3.8-.2-3.8zM9.8 14.8V8.6l6.1 3.1-6.1 3.1z"/></svg>'
  };
  return icons[name] || "";
}

function renderTopbar() {
  const el = document.getElementById("site-topbar");
  if (!el) return;
  el.innerHTML = `
    <div class="topbar__inner">
      <div class="topbar__msg active" data-i18n="topbar.ship"></div>
      <div class="topbar__msg"><span data-i18n="topbar.discount"></span></div>
      <div class="topbar__msg" data-i18n="topbar.returns"></div>
    </div>`;
  applyLang();
  let i = 0;
  setInterval(() => {
    const msgs = el.querySelectorAll(".topbar__msg");
    msgs.forEach((m) => m.classList.remove("active"));
    i = (i + 1) % msgs.length;
    msgs[i].classList.add("active");
  }, 4000);
}

function renderHeader() {
  const el = document.getElementById("site-header");
  if (!el) return;
  const nav = [
    ["nav.home", "index.html"],
    ["nav.shop", "tienda.html"],
    ["nav.rooms", "tienda.html?cat=sala"],
    ["nav.collections", "tienda.html"],
    ["nav.news", "tienda.html?filtro=nuevo"],
    ["nav.offers", "tienda.html?filtro=oferta"],
    ["nav.about", "index.html#nosotros"]
  ];
  const path = location.pathname.split("/").pop() || "index.html";
  el.innerHTML = `
    <div class="container header__inner">
      <a href="index.html" class="logo" aria-label="${STORE_NAME}">
        <span class="logo__mark">H</span>
        <span class="logo__text">
          <span class="logo__name">HAVENLY</span><br>
          <span class="logo__tag">Home Decor</span>
        </span>
      </a>
      <nav class="nav">
        ${nav.map(([k, href]) => {
          const base = href.split("?")[0];
          return `<a href="${href}" class="${path === base ? "active" : ""}" data-i18n="${k}"></a>`;
        }).join("")}
      </nav>
      <form class="header__search" id="search-form">
        <input type="text" id="search-input" data-i18n-ph="search.placeholder" autocomplete="off">
        <button type="submit" aria-label="Buscar">${icon("search")}</button>
      </form>
      <div class="header__icons">
        <div class="lang-toggle">
          <button type="button" data-lang-btn="es" data-i18n="lang.es"></button>
          <button type="button" data-lang-btn="en" data-i18n="lang.en"></button>
        </div>
        <button class="icon-btn" aria-label="Cuenta">${icon("user")}</button>
        <button class="icon-btn" aria-label="Favoritos" onclick="location.href='tienda.html?filtro=favoritos'">${icon("heart")}</button>
        <a class="icon-btn" href="carrito.html" aria-label="Carrito">
          ${icon("cart")}
          <span class="badge" data-cart-count style="display:none">0</span>
        </a>
        <button class="icon-btn hamburger" id="hamburger" aria-label="Menú">${icon("menu")}</button>
      </div>
    </div>`;
  applyLang();
  updateCartBadges();
  bindHeaderEvents();
}

function bindHeaderEvents() {
  const sf = document.getElementById("search-form");
  if (sf) sf.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = document.getElementById("search-input").value.trim();
    location.href = "tienda.html?q=" + encodeURIComponent(q);
  });
  document.querySelectorAll("[data-lang-btn]").forEach((b) => {
    b.addEventListener("click", () => setLang(b.getAttribute("data-lang-btn")));
  });
  const hb = document.getElementById("hamburger");
  if (hb) hb.addEventListener("click", openMobileMenu);
}

function renderMobileMenu() {
  let el = document.getElementById("mobile-menu");
  if (!el) {
    el = document.createElement("div");
    el.id = "mobile-menu";
    el.className = "mobile-menu";
    document.body.appendChild(el);
  }
  const nav = [
    ["nav.home", "index.html"], ["nav.shop", "tienda.html"],
    ["nav.rooms", "tienda.html?cat=sala"], ["nav.collections", "tienda.html"],
    ["nav.news", "tienda.html?filtro=nuevo"], ["nav.offers", "tienda.html?filtro=oferta"],
    ["nav.about", "index.html#nosotros"]
  ];
  el.innerHTML = `
    <div class="mobile-menu__panel">
      <button class="mobile-menu__close" id="mm-close" aria-label="Cerrar">✕</button>
      <form class="mobile-menu__search" id="mm-search">
        <input type="text" id="mm-input" data-i18n-ph="search.placeholder">
        <button type="submit">${icon("search")}</button>
      </form>
      ${nav.map(([k, href]) => `<a class="mm-link" href="${href}" data-i18n="${k}"></a>`).join("")}
    </div>`;
  applyLang();
  el.querySelector("#mm-close").addEventListener("click", closeMobileMenu);
  el.addEventListener("click", (e) => { if (e.target === el) closeMobileMenu(); });
  el.querySelector("#mm-search").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = el.querySelector("#mm-input").value.trim();
    closeMobileMenu();
    location.href = "tienda.html?q=" + encodeURIComponent(q);
  });
}

function openMobileMenu() {
  renderMobileMenu();
  document.getElementById("mobile-menu").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeMobileMenu() {
  const el = document.getElementById("mobile-menu");
  if (el) el.classList.remove("open");
  document.body.style.overflow = "";
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  const shopLinks = [["nav.shop", "tienda.html"], ["nav.news", "tienda.html?filtro=nuevo"], ["nav.offers", "tienda.html?filtro=oferta"], ["nav.collections", "tienda.html"]];
  const helpLinks = [["Envíos", "#"], ["Devoluciones", "#"], ["Preguntas frecuentes", "#"], ["Guía de tallas", "#"]];
  const aboutLinks = [["Nuestra historia", "#"], ["Sostenibilidad", "#"], ["Contacto", "#"], ["Trabaja con nosotros", "#"]];
  el.innerHTML = `
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a href="index.html" class="logo">
            <span class="logo__mark">H</span>
            <span class="logo__text">
              <span class="logo__name">HAVENLY</span><br>
              <span class="logo__tag">Home Decor</span>
            </span>
          </a>
          <p class="footer__desc" data-i18n="footer.desc"></p>
          <div class="socials">
            <a href="#" aria-label="Instagram">${icon("instagram")}</a>
            <a href="#" aria-label="Facebook">${icon("facebook")}</a>
            <a href="#" aria-label="X">${icon("x")}</a>
            <a href="#" aria-label="TikTok">${icon("tiktok")}</a>
            <a href="#" aria-label="YouTube">${icon("youtube")}</a>
          </div>
        </div>
        <div>
          <h4 data-i18n="footer.shop"></h4>
          <ul class="footer__links">
            ${shopLinks.map(([l, h]) => `<li><a href="${h}" data-i18n="${l}"></a></li>`).join("")}
          </ul>
        </div>
        <div>
          <h4 data-i18n="footer.help"></h4>
          <ul class="footer__links">
            ${helpLinks.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join("")}
          </ul>
        </div>
        <div class="footer__news">
          <h4 data-i18n="footer.news"></h4>
          <p data-i18n="footer.news.d"></p>
          <form class="footer__form" id="newsletter-form">
            <input type="email" required data-i18n-ph="footer.email">
            <button type="submit" data-i18n="footer.subscribe"></button>
          </form>
        </div>
      </div>
      <div class="footer__bottom">
        <div class="footer__copy">© <span id="year"></span> ${STORE_NAME}. <span data-i18n="footer.rights"></span></div>
        <div class="payments">
          <span>${LANG === "es" ? "Aceptamos" : "We accept"}:</span>
          <span class="pay-chip">VISA</span>
          <span class="pay-chip">Mastercard</span>
          <span class="pay-chip">AMEX</span>
          <span class="pay-chip">PayPal</span>
        </div>
      </div>
    </div>`;
  document.getElementById("year").textContent = new Date().getFullYear();
  applyLang();
  const nf = document.getElementById("newsletter-form");
  if (nf) nf.addEventListener("submit", (e) => {
    e.preventDefault();
    toast(LANG === "es" ? "¡Gracias por suscribirte!" : "Thanks for subscribing!");
    nf.reset();
  });
}

function renderWhatsApp() {
  if (document.getElementById("wa-float")) return;
  const msg = encodeURIComponent(t("wa.msg"));
  const a = document.createElement("a");
  a.id = "wa-float";
  a.className = "wa-float";
  a.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", "WhatsApp");
  a.innerHTML = icon("wa");
  document.body.appendChild(a);
}

/* ---------- tarjeta de producto ---------- */
function productCardHTML(p, opts = {}) {
  const showFav = opts.showFav !== false;
  const badge = p.badge === "nuevo" ? `<span class="card__badge new" data-i18n="badge.new"></span>`
    : p.badge === "oferta" ? `<span class="card__badge sale" data-i18n="badge.sale"></span>` : "";
  const name = LANG === "es" ? p.name : p.nameEn;
  const old = p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span>` : "";
  return `
  <article class="card" data-id="${p.id}">
    <div class="card__media">
      <a href="producto.html?id=${p.id}" aria-label="${name}">
        <img src="${p.image}" alt="${name}" loading="lazy">
      </a>
      ${badge}
      ${showFav ? `<button class="card__fav ${isFav(p.id) ? "active" : ""}" data-fav="${p.id}" aria-label="Favorito">${icon("heart")}</button>` : ""}
    </div>
    <div class="card__body">
      <span class="card__cat">${catName(p.category)}</span>
      <a href="producto.html?id=${p.id}" class="card__name">${name}</a>
      <div class="card__rating">${starsHTML(p.rating)} <span>${p.rating} (${p.reviews})</span></div>
      <div class="card__price"><span class="price">${money(p.price)}</span>${old}</div>
      <div class="card__actions">
        <button class="btn btn-primary" data-add="${p.id}" data-i18n="product.add"></button>
      </div>
    </div>
  </article>`;
}

function bindProductCards(scope = document) {
  scope.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.getAttribute("data-add")));
  });
  scope.querySelectorAll("[data-fav]").forEach((btn) => {
    btn.addEventListener("click", () => toggleFav(btn.getAttribute("data-fav")));
  });
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderTopbar();
  renderHeader();
  renderFooter();
  renderWhatsApp();
  applyLang();
});
