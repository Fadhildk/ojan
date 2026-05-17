/* ==========================================================
   TECHNOSPACE — MAIN SCRIPT
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   1. NAVBAR LOADER
   ---------------------------------------------------------- */
async function loadNavbar() {
  try {

    // FIXED PATH
    const res = await fetch("navbar/navbar.html");

    if (!res.ok) {
      throw new Error("Navbar fetch failed");
    }

    const html = await res.text();

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    document.body.insertBefore(
      wrapper.firstElementChild,
      document.body.firstChild
    );

    // Boot navbar features
    initNavbar();

  } catch (e) {
    console.warn("[TechnoSpace] Navbar loader:", e.message);
    initNavbar();
  }
}

/* ----------------------------------------------------------
   2. NAVBAR BEHAVIOUR
   ---------------------------------------------------------- */
function initNavbar() {

  const nav       = document.getElementById("ts-navbar");
  const hamburger = document.getElementById("ts-hamburger");
  const navLinks  = document.getElementById("ts-nav-links");

  if (!nav) return;

  // Scroll effect
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  if (hamburger && navLinks) {

    hamburger.addEventListener("click", () => {

      const open = hamburger.classList.toggle("open");

      navLinks.classList.toggle("open", open);

      hamburger.setAttribute("aria-expanded", open);
    });

    // Close menu after click
    navLinks.querySelectorAll(".ts-nav-link").forEach(link => {

      link.addEventListener("click", () => {

        hamburger.classList.remove("open");

        navLinks.classList.remove("open");

        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Active page
  const currentPage =
    location.pathname.split("/").pop() || "index.html";

  nav.querySelectorAll(".ts-nav-link").forEach(link => {

    const href = link.getAttribute("href");

    link.classList.toggle("active", href === currentPage);
  });

  updateCartBadge();
}

/* ----------------------------------------------------------
   3. HERO CAROUSEL
   ---------------------------------------------------------- */
function initHeroCarousel() {

  const slides = document.querySelectorAll(".ts-hero-slide");
  const dots   = document.querySelectorAll(".ts-dot");

  if (!slides.length) return;

  let current = 0;
  let timer;

  const goTo = (idx) => {

    slides[current].classList.remove("active");
    dots[current]?.classList.remove("active");

    current = (idx + slides.length) % slides.length;

    slides[current].classList.add("active");
    dots[current]?.classList.add("active");
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const startAuto = () => {
    timer = setInterval(next, 5000);
  };

  const stopAuto = () => {
    clearInterval(timer);
  };

  // Arrows
  document
    .querySelector(".ts-hero__arrow--next")
    ?.addEventListener("click", () => {

      stopAuto();
      next();
      startAuto();
    });

  document
    .querySelector(".ts-hero__arrow--prev")
    ?.addEventListener("click", () => {

      stopAuto();
      prev();
      startAuto();
    });

  // Dots
  dots.forEach((dot, i) => {

    dot.addEventListener("click", () => {

      stopAuto();
      goTo(i);
      startAuto();
    });
  });

  goTo(0);
  startAuto();
}

/* ----------------------------------------------------------
   4. CART SYSTEM
   ---------------------------------------------------------- */
function getCart() {
  try {
    const primary = localStorage.getItem("cart");
    if (primary) return JSON.parse(primary);

    // migrate legacy key if present
    const legacy = localStorage.getItem("ts_cart");
    if (legacy) {
      const parsed = JSON.parse(legacy || "[]");
      try { localStorage.setItem("cart", JSON.stringify(parsed)); } catch (e) {}
      try { localStorage.removeItem("ts_cart"); } catch (e) {}
      return parsed;
    }

    return [];
  } catch {
    return [];
  }
}

function saveCart(cart) {

  try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) {}
  updateCartBadge();
}

function updateCartBadge() {
  // prefer global updater
  if (typeof window.updateCartBadge === 'function') {
    try { window.updateCartBadge(); return; } catch (e) {}
  }

  const badge = document.querySelector(".ts-cart-badge");
  if (!badge) return;
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  if (total <= 0) { badge.style.display = 'none'; badge.textContent = ''; }
  else { badge.style.display = 'inline-block'; badge.textContent = String(total); }

  badge.style.display = total > 0 ? "flex" : "none";
}

function addToCart(product) {

  const cart = getCart();

  const existing = cart.find(i => i.id === product.id);

  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({
      ...product,
      qty: 1
    });
  }

  saveCart(cart);

  showToast(`${product.name} added to cart`);
}

window.addToCart = addToCart;

/* ----------------------------------------------------------
   5. PRODUCT CARD HANDLERS
   ---------------------------------------------------------- */
function initProductCards() {

  document
    .querySelectorAll(".ts-product-card__btn")
    .forEach(btn => {

      btn.addEventListener("click", (e) => {

        const card =
          e.target.closest(".ts-product-card");

        if (!card) return;

        const product = {

          id:
            card.dataset.productId ||
            Math.random().toString(36).slice(2),

          name:
            card.querySelector(".ts-product-card__name")
              ?.textContent.trim() || "Product",

          price:
            card.querySelector(".ts-product-card__price")
              ?.textContent.trim() || ""
        };

        addToCart(product);
      });
    });
}

/* ----------------------------------------------------------
   6. NEWSLETTER
   ---------------------------------------------------------- */
function initNewsletter() {

  const input = document.querySelector(".ts-newsletter-input");
  const btn   = document.querySelector(".ts-newsletter-btn");

  if (!input) return;

  btn?.addEventListener("click", () => {

    const email = input.value.trim();

    if (!email || !email.includes("@")) {

      showToast(
        "Please enter a valid email address",
        "error"
      );

      return;
    }

    showToast("You're connected to the Tech Core!");

    input.value = "";
  });

  input.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
      btn?.click();
    }
  });
}

/* ----------------------------------------------------------
   7. TOAST
   ---------------------------------------------------------- */
function showToast(message, type = "success") {

  let container =
    document.getElementById("ts-toast-container");

  if (!container) {

    container = document.createElement("div");

    container.id = "ts-toast-container";

    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 99999;
    `;

    document.body.appendChild(container);
  }

  const toast = document.createElement("div");

  toast.style.cssText = `
    background: #0f1115;
    color: #fff;
    padding: 12px 18px;
    border-radius: 6px;
    border: 1px solid ${
      type === "error"
        ? "#ff003c"
        : "#00f0ff"
    };
    font-family: sans-serif;
    opacity: 0;
    transform: translateX(20px);
    transition: 0.3s;
  `;

  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {

    toast.style.opacity = "1";

    toast.style.transform = "translateX(0)";
  });

  setTimeout(() => {

    toast.style.opacity = "0";

    toast.style.transform = "translateX(20px)";

    setTimeout(() => {
      toast.remove();
    }, 300);

  }, 3000);
}

window.showToast = showToast;

/* ----------------------------------------------------------
   8. SEARCH
   ---------------------------------------------------------- */
function initSearch() {

  const input = document.querySelector(".ts-search-input");

  if (!input) return;

  input.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

      const q = input.value.trim();

      if (!q) return;

      window.location.href = `shop.html?search=${encodeURIComponent(q)}`;
    }
  });
}

/* ----------------------------------------------------------
   9. BOOT
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {

  loadNavbar().then(() => {

    // Update navbar based on auth state
    if (typeof updateNavbarAuthState === "function") {
      updateNavbarAuthState();
    }

    initHeroCarousel();

    initProductCards();

    initNewsletter();

    initSearch();

    updateCartBadge();
  });
});