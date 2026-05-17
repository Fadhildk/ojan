"use strict";

async function loadNavbar() {
  try {
    const res = await fetch("navbar/navbar.html");
    if (!res.ok) {
      throw new Error("Navbar fetch failed");
    }
    const html = await res.text();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    document.body.insertBefore(wrapper.firstElementChild, document.body.firstChild);
    initNavbar();
  } catch (e) {
    console.warn("[TechnoSpace] Navbar loader:", e.message);
    initNavbar();
  }
}

function initNavbar() {
  const nav = document.getElementById("ts-navbar");
  const hamburger = document.getElementById("ts-hamburger");
  const navLinks = document.getElementById("ts-nav-links");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const open = hamburger.classList.toggle("open");
      navLinks.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", open);
    });

    navLinks.querySelectorAll(".ts-nav-link").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        navLinks.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target) && navLinks.classList.contains("open")) {
        hamburger.classList.remove("open");
        navLinks.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  }

  const currentPage = location.pathname.split("/").pop() || "index.html";
  nav.querySelectorAll(".ts-nav-link").forEach(link => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === currentPage);
  });

  const cartLink = nav.querySelector('.ts-icon-btn[aria-label="Cart"]');
  if (cartLink) {
    cartLink.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  }
}

function getCartItems() {
  return (JSON.parse(localStorage.getItem("cart") || "[]") || []).map(item => ({
    ...item,
    quantity: item && item.quantity ? Number(item.quantity) : 1,
  }));
}

function setCartItems(items) {
  if (!items || items.length === 0) {
    localStorage.removeItem("cart");
  } else {
    localStorage.setItem("cart", JSON.stringify(items));
  }

  // notify navbar badge updater if present
  try { if (typeof window.updateCartBadge === 'function') window.updateCartBadge(); } catch (e) {}
}

function parsePrice(price) {
  return Number((price || "").replace(/[^0-9]/g, "")) || 0;
}

function formatPrice(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function getCartQuantity() {
  return getCartItems().reduce((sum, item) => sum + (item.quantity || 1), 0);
}

function updateCartBadge() {
  const badge = document.querySelector(".ts-cart-badge");
  if (!badge) return;
  badge.textContent = String(getCartQuantity() || 0);
}

function renderCart() {
  const items = getCartItems();
  const container = document.getElementById("cartItems");
  const countEl = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotal");
  const emptyMessage = document.getElementById("emptyCartMessage");
  const clearButton = document.getElementById("clearCartBtn");
  const cartActions = document.getElementById("cartActions");

  if (!container || !countEl || !totalEl || !emptyMessage || !clearButton || !cartActions) return;

  const totalPrice = items.reduce((sum, item) => sum + parsePrice(item.price) * (item.quantity || 1), 0);

  countEl.textContent = String(getCartQuantity()).padStart(2, "0");
  totalEl.textContent = formatPrice(totalPrice);

  if (!items.length) {
    // empty state
    container.innerHTML = "";
    container.style.display = "none";
    emptyMessage.style.display = "flex";
    cartActions.style.display = "none";
    clearButton.disabled = true;
    return;
  }

  // render items between summary and actions
  emptyMessage.style.display = "none";
  cartActions.style.display = "flex";
  clearButton.disabled = false;

  const html = items.map((item, idx) => {
    const price = item.price || '';
    return `
      <article class="product-card product-card--compact" data-index="${idx}" style="display:flex; gap:12px; align-items:center;">
        <div class="card-img-wrap card-img-wrap--sm" style="flex:0 0 84px;">
          <div class="card-img"><img src="${item.image || ''}" alt="${item.name || ''}" style="width:100%; height:auto;"></div>
          <div class="img-overlay"></div>
        </div>
        <div class="card-body" style="padding:8px 12px; flex:1;">
          <h2 class="prod-name prod-name--sm">${item.name || ''}</h2>
          <div class="tag-row" style="margin-top:6px; align-items:center;">
            <span class="prod-price">${price}</span>
            <button class="btn-cart btn-remove" data-index="${idx}" style="margin-left:auto">REMOVE</button>
          </div>
        </div>
      </article>`;
  }).join('');

  container.innerHTML = html;
  container.style.display = 'block';
}

function removeCartItem(index) {
  const cart = getCartItems();
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  setCartItems(cart);
  renderCart();
  updateCartBadge();
}

// delegate remove button clicks
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-remove');
  if (!btn) return;
  const index = Number(btn.dataset.index);
  if (Number.isFinite(index)) {
    removeCartItem(index);
    showToast('Item removed from cart');
  }
});

function clearCart() {
  setCartItems([]);
  renderCart();
  updateCartBadge();
}

function showToast(msg) {
  let toast = document.getElementById("ts-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "ts-toast";
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "32px",
      right: "32px",
      background: "#0d1520",
      border: "1px solid rgba(0,229,255,.5)",
      color: "#00e5ff",
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: ".72rem",
      letterSpacing: ".14em",
      padding: "12px 24px",
      zIndex: "9999",
      boxShadow: "0 0 24px rgba(0,229,255,.25)",
      transition: "opacity .3s, transform .3s",
      pointerEvents: "none",
    });
    document.body.appendChild(toast);
  }
  toast.textContent = `✓ ${msg}`;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
  }, 2400);
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadNavbar();
  
  // Update navbar based on auth state
  if (typeof updateNavbarAuthState === "function") {
    updateNavbarAuthState();
  }
  
  renderCart();
  updateCartBadge();
  const clearBtn = document.getElementById("clearCartBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearCart();
      showToast("Cart cleared");
    });
  }
});
