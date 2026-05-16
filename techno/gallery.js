/* =========================================================
   TECHNOSPACE — GALLERY SCRIPT
   ========================================================= */

"use strict";

/* ----------------------------------------------------------
   1. LOAD NAVBAR
   ---------------------------------------------------------- */
async function loadNavbar() {

  try {

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

    initNavbar();

  } catch (e) {

    console.warn("[TechnoSpace] Navbar loader:", e.message);

    initNavbar();
  }
}

/* ----------------------------------------------------------
   2. NAVBAR FUNCTION
   ---------------------------------------------------------- */
function initNavbar() {

  const nav       = document.getElementById("ts-navbar");
  const hamburger = document.getElementById("ts-hamburger");
  const navLinks  = document.getElementById("ts-nav-links");

  if (!nav) return;

  /* Scroll Effect */
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  };

  window.addEventListener("scroll", onScroll, {
    passive: true
  });

  onScroll();

  /* Mobile Menu */
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
  }

  /* Active Link */
  const currentPage =
    location.pathname.split("/").pop() || "index.html";

  nav.querySelectorAll(".ts-nav-link").forEach(link => {

    const href = link.getAttribute("href");

    link.classList.toggle("active", href === currentPage);
  });
}

/* ----------------------------------------------------------
   3. CARD REVEAL ANIMATION
   ---------------------------------------------------------- */
function initCardReveal() {

  const cards = document.querySelectorAll(".rig-card");

  const revealObserver = new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          const card = entry.target;

          const delay = Number(card.dataset.delay || 0);

          setTimeout(() => {

            card.classList.add("visible");

          }, delay);

          revealObserver.unobserve(card);
        }
      });
    },
    {
      threshold: 0.1
    }
  );

  cards.forEach((card, index) => {

    card.dataset.delay = index * 80;

    revealObserver.observe(card);
  });

  return revealObserver;
}

/* ----------------------------------------------------------
   4. LOAD MORE BUTTON
   ---------------------------------------------------------- */
function initLoadMore(revealObserver) {

  const btnLoadMore = document.getElementById("btnLoadMore");
  const btnLoader   = document.getElementById("btnLoader");
  const grid        = document.getElementById("galleryGrid");

  if (!btnLoadMore) return;

  const extraCards = [
    {
      serial: "0049_COL",
      size: "card--small",
      img: "cooling.png",
      title: "CRYO LOOP MK2",
      desc: "Closed-loop liquid cooling with predictive thermal management."
    },

    {
      serial: "0050_PWR",
      size: "card--small",
      img: "psu.png",
      title: "TITAN PSU 1600W",
      desc: "80+ Titanium certified modular power delivery system."
    },

    {
      serial: "0051_SSD",
      size: "card--small",
      img: "ssd.png",
      title: "PHANTOM NVMe 8TB",
      desc: "Ultra-high-speed Gen5 storage with thermal shield."
    }
  ];

  let loaded = false;

  btnLoadMore.addEventListener("click", () => {

    if (loaded) return;

    btnLoader.classList.add("active");

    btnLoadMore.disabled = true;

    setTimeout(() => {

      extraCards.forEach((data, i) => {

        const article = createCard(data);

        article.dataset.delay = i * 100;

        grid.appendChild(article);

        requestAnimationFrame(() => {

          setTimeout(() => {

            revealObserver.observe(article);

          }, 30);
        });
      });

      btnLoader.classList.remove("active");

      btnLoadMore.querySelector(".btn-label").textContent =
        "ALL DATA SYNCED";

      btnLoadMore.style.opacity = "0.45";

      btnLoadMore.style.cursor = "not-allowed";

      loaded = true;

    }, 1400);
  });
}

/* ----------------------------------------------------------
   5. CREATE CARD
   ---------------------------------------------------------- */
function createCard({ serial, size, img, title, desc }) {

  const article = document.createElement("article");

  article.className = `rig-card ${size}`;

  article.dataset.serial = serial;

  article.innerHTML = `
    <div class="card-serial">
      S/N: ${serial}
    </div>

    <div class="card-image-wrap">

      <img
        src="${img}"
        alt="${title}"
        class="card-image"
      >

      <div class="card-glow"></div>

      <div class="scan-line"></div>

    </div>

    <div class="card-body">

      <h2 class="card-title">
        ${title}
      </h2>

      <p class="card-desc">
        ${desc}
      </p>

    </div>
  `;

  return article;
}

/* ----------------------------------------------------------
   6. CARD CLICK
   ---------------------------------------------------------- */
function initCardClick() {

  document.addEventListener("click", (e) => {

    const card = e.target.closest(".rig-card");

    if (!card) return;

    console.log(
      `[TechnoSpace] Card selected: ${card.dataset.serial}`
    );
  });
}

/* ----------------------------------------------------------
   7. BOOT
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", async () => {

  await loadNavbar();

  const observer = initCardReveal();

  initLoadMore(observer);

  initCardClick();
});

/* ── Cart badge sync ───────────────────────────── */
function updateCartBadge() {

  const badge = document.querySelector(".ts-cart-badge");

  if (!badge) return;

  let cart = [];

  try {
    cart = JSON.parse(localStorage.getItem("ts_cart") || "[]");
  } catch {}

  const total = cart.reduce(
    (sum, item) => sum + (item.qty || 1),
    0
  );

  badge.textContent = total;

  badge.style.display = total > 0 ? "flex" : "none";
}

updateCartBadge();