/* =============================================================
   TECHNOSPACE — MAIN.JS
   Shared utilities and functions used across all pages
   ============================================================= */

"use strict";

/* ----------------------------------------------------------
   NAVBAR LOADER
   ---------------------------------------------------------- */
async function loadNavbar() {
  try {
    const res = await fetch("navbar/navbar.html");
    if (!res.ok) throw new Error("Navbar fetch failed");
    
    const html = await res.text();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    document.body.insertBefore(wrapper.firstElementChild, document.body.firstChild);
    
    // Give navbar script a moment to initialize, then update auth state
    setTimeout(() => {
      if (typeof updateNavbarAuthState === "function") {
        updateNavbarAuthState();
      }
    }, 100);
    
    initNavbar();
  } catch (e) {
    console.warn("[TechnoSpace] Navbar loader:", e.message);
    initNavbar();
  }
}

/* ----------------------------------------------------------
   NAVBAR BEHAVIOUR
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
}

/* ----------------------------------------------------------
   TOAST NOTIFICATIONS
   ---------------------------------------------------------- */
function showToast(message, type = "success") {
  let container = document.getElementById("ts-toast-container");

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
    border: 1px solid ${type === "error" ? "#ff003c" : "#00f0ff"};
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

// Expose globally
window.loadNavbar = loadNavbar;
window.initNavbar = initNavbar;
window.showToast = showToast;
