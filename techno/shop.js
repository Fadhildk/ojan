/* =========================================================
   TECHNOSPACE – SHOP SCRIPT
   ========================================================= */

"use strict";

/* =========================================================
   0. LOAD NAVBAR
   ========================================================= */

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

/* =========================================================
   NAVBAR FUNCTION
   ========================================================= */

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


/* ══════════════════════════════════════════════════════════
   1. CATEGORY SWITCHER
   ══════════════════════════════════════════════════════════ */

const catBtns   = document.querySelectorAll('.cat-btn');
const shopPages = document.querySelectorAll('.shop-page');

catBtns.forEach(btn => {

  btn.addEventListener('click', () => {

    const target = btn.dataset.category;

    /* Active button */
    catBtns.forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    /* Switch page */
    shopPages.forEach(page => {

      page.classList.remove('active');

      if (page.id === `page-${target}`) {
        page.classList.add('active');
      }
    });

    revealCards();
  });
});


/* ══════════════════════════════════════════════════════════
   2. FILTER TABS
   ══════════════════════════════════════════════════════════ */

document.querySelectorAll('.filter-bar').forEach(bar => {

  bar.querySelectorAll('.filter-btn').forEach(btn => {

    btn.addEventListener('click', () => {

      bar.querySelectorAll('.filter-btn')
        .forEach(b => b.classList.remove('active'));

      btn.classList.add('active');

      const filter = btn.dataset.filter;

      const group  = bar.dataset.filterGroup;

      const grid   = document.getElementById(
        group === 'keyboards' ? 'kbGrid' : 'miceGrid'
      );

      if (!grid) return;

      const cards = grid.querySelectorAll('.product-card');

      cards.forEach(card => {

        const tags = (
          card.dataset.tags || ''
        ).toLowerCase();

        if (filter === 'all') {

          card.removeAttribute('data-hidden');

        } else {

          if (tags.includes(filter)) {

            card.removeAttribute('data-hidden');

          } else {

            card.setAttribute('data-hidden', '');
          }
        }
      });

      if (group === 'mice') {
        updateInventoryCount();
      }
    });
  });
});


/* ══════════════════════════════════════════════════════════
   3. INVENTORY COUNT
   ══════════════════════════════════════════════════════════ */

function updateInventoryCount() {

  const el = document.getElementById('shownCount');

  if (!el) return;

  const activePage = document.querySelector('.shop-page.active');
  if (!activePage) return;

  const visible = activePage.querySelectorAll(
    '.product-card:not([data-hidden])'
  ).length;

  el.textContent =
    String(visible).padStart(2, '0');
}


/* ══════════════════════════════════════════════════════════
   4. SORT
   ══════════════════════════════════════════════════════════ */

const sortSelects =
  document.querySelectorAll('.sort-select');

function getSortGrid(select) {
  if (!select) return null;
  if (select.id === 'miceSort') return document.getElementById('miceGrid');
  if (select.id === 'keyboardSort') return document.getElementById('kbGrid');
  if (select.id === 'headsetSort') return document.getElementById('headsetGrid');
  if (select.id === 'monitorSort') return document.getElementById('monitorGrid');
  return null;
}

const getPrice = card => {
  const el = card.querySelector('.prod-price');
  return Number((el?.textContent || '').replace(/[^0-9]/g, '')) || 0;
};

const getName = card =>
  card.querySelector('.prod-name')
    ?.textContent.trim() || '';

sortSelects.forEach(select => {
  select.addEventListener('change', () => {
    const val = select.value;
    const grid = getSortGrid(select);

    if (!grid) return;

    const cards = Array.from(
      grid.querySelectorAll('.product-card')
    );

    cards.sort((a, b) => {
      if (val === 'price_asc') {
        return getPrice(a) - getPrice(b);
      }

      if (val === 'price_desc') {
        return getPrice(b) - getPrice(a);
      }

      if (val === 'name') {
        return getName(a).localeCompare(getName(b));
      }

      const aLatest =
        a.dataset.tags?.includes('latest') ? -1 : 0;
      const bLatest =
        b.dataset.tags?.includes('latest') ? -1 : 0;

      return aLatest - bLatest;
    });

    cards.forEach(card => grid.appendChild(card));
  });
});


/* ══════════════════════════════════════════════════════════
   5. SEARCH
   ══════════════════════════════════════════════════════════ */

function getSearchInput() {
  return document.querySelector('.ts-search-input');
}

function getSearchQueryFromUrl() {
  return new URLSearchParams(window.location.search).get('search')?.trim() || '';
}

function filterShopCards(query) {
  const q = query.toLowerCase().trim();
  const cards = document.querySelectorAll('.shop-page .product-card');

  cards.forEach(card => {
    const name = card.querySelector('.prod-name')?.textContent.toLowerCase() || '';
    const desc = card.querySelector('.prod-desc')?.textContent.toLowerCase() || '';
    const tags = Array.from(card.querySelectorAll('.tag'))
      .map(t => t.textContent.toLowerCase())
      .join(' ');

    const match = name.includes(q) || desc.includes(q) || tags.includes(q);
    if (match || q === '') {
      card.removeAttribute('data-hidden');
    } else {
      card.setAttribute('data-hidden', '');
    }
  });

  updateInventoryCount();
}

function initSearch() {
  const input = getSearchInput();
  if (!input) return;

  const applyUrlQuery = () => {
    const query = getSearchQueryFromUrl();
    if (!query) return;
    input.value = query;
    filterShopCards(query);
  };

  input.addEventListener('input', () => {
    filterShopCards(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const query = input.value.trim();
    filterShopCards(query);
    const url = query ? `shop.html?search=${encodeURIComponent(query)}` : 'shop.html';
    history.replaceState(null, '', url);
  });

  applyUrlQuery();
}


/* ══════════════════════════════════════════════════════════
   6. LOAD MORE
   ══════════════════════════════════════════════════ */

const btnLoad =
  document.querySelector('.btn-load');

const progressBar =
  document.querySelector('.progress-bar');

if (btnLoad) {

  btnLoad.addEventListener('click', () => {

    if (btnLoad.disabled) return;

    btnLoad.disabled = true;

    const text =
      btnLoad.querySelector('span');

    if (text) {
      text.textContent = 'SYNCING...';
    }

    if (progressBar) {

      setTimeout(() => {
        progressBar.style.width = '70%';
      }, 200);

      setTimeout(() => {
        progressBar.style.width = '100%';
      }, 800);
    }

    setTimeout(() => {

      appendKeyboardCards();

      ensureCartButtons();
      revealCards();

      btnLoad.disabled = false;

      if (text) {
        text.textContent = 'all are already open';
      }

      if (progressBar) {
        progressBar.style.width = '100%';
      }

      btnLoad.style.opacity = '.45';

      btnLoad.style.cursor = 'not-allowed';

      btnLoad.disabled = true;

    }, 1200);
  });
}


/* ══════════════════════════════════════════════════════════
   7. APPEND EXTRA KEYBOARD CARDS
   ══════════════════════════════════════════════════════════ */

function appendKeyboardCards() {

  const grid = document.getElementById('kbGrid');

  if (!grid) return;

  const extras = [

    {
      serial:'TH-80-ECHO',
      badge:'IN_STOCK',
      badgeCls:'badge--stock',
      img:'keyboard.png',
      name:'ThermalEcho 80',
      price:'Rp 175.000',
      desc:'Silicone dampened base with south-facing PCB.',
      tags:'75 pcb carbon',
      tagsHtml:`
        <span class="tag">80%_TRAY</span>
        <span class="tag">SOUTH_RGB</span>
        <span class="tag">SILICONE</span>
      `
    },

    {
      serial:'VM-60-GHOST',
      badge:'LIMITED',
      badgeCls:'badge--limited',
      img:'keyboard-01.png',
      name:'VoidMatrix 60',
      price:'Rp 320.000',
      desc:'Custom anodised aluminum top.',
      tags:'65 pcb',
      tagsHtml:`
        <span class="tag">60%_BASE</span>
        <span class="tag">LEAF_SPRING</span>
        <span class="tag">ANODISED</span>
      `
    },

    {
      serial:'AP-TKL-ZERO',
      badge:'IN_STOCK',
      badgeCls:'badge--stock',
      img:'keyboard-02.png',
      name:'AlphaProof TKL',
      price:'Rp 199.000',
      desc:'Gasket mount TKL with soft thocky output.',
      tags:'tkl hot-swap',
      tagsHtml:`
        <span class="tag">TKL_GASKET</span>
        <span class="tag">PC_PLATE</span>
        <span class="tag">HOT-SWAP</span>
      `
    }
  ];

  extras.forEach((d, i) => {

    const a = document.createElement('article');

    a.className = 'product-card';

    a.dataset.tags = d.tags;

    a.innerHTML = `
      <div class="card-header">

        <span class="serial">
          S/N: ${d.serial}
        </span>

        <span class="badge ${d.badgeCls}">
          ${d.badge}
        </span>

      </div>

      <div class="card-img-wrap">

        <div class="card-img">
          <img src="${d.img}" alt="${d.name}" />
        </div>

        <div class="img-overlay"></div>

      </div>

      <div class="card-body">

        <div class="name-price">

          <h2 class="prod-name">
            ${d.name}
          </h2>

          <span class="prod-price">
            ${d.price}
          </span>

        </div>

        <p class="prod-desc">
          ${d.desc}
        </p>

        <div class="tag-row">
          ${d.tagsHtml}
        </div>

      </div>
    `;

    a.dataset.delay = i * 100;

    grid.appendChild(a);
  });
}


/* ══════════════════════════════════════════════════════════
   8. PAGINATION
   ══════════════════════════════════════════════════════════ */

document.querySelectorAll('.page-btn').forEach(btn => {

  btn.addEventListener('click', () => {

    document.querySelectorAll('.page-btn')
      .forEach(b => b.classList.remove('active'));

    btn.classList.add('active');
  });
});


/* ══════════════════════════════════════════════════════════
   9. CARD REVEAL
   ══════════════════════════════════════════════════════════ */

function revealCards() {

  const cards =
    document.querySelectorAll(
      '.product-card:not(.visible)'
    );

  const observer =
    new IntersectionObserver((entries) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          const card  = entry.target;

          const delay =
            parseInt(card.dataset.delay || 0);

          setTimeout(() => {

            card.classList.add('visible');

          }, delay);

          observer.unobserve(card);
        }
      });

    }, {
      threshold: 0.08
    });

  cards.forEach((card, i) => {

    if (!card.dataset.delay) {
      card.dataset.delay = i * 60;
    }

    observer.observe(card);
  });
}


/* ══════════════════════════════════════════════════════════
   10. ADD TO CART TOAST
   ══════════════════════════════════════════════════════════ */

document.addEventListener('click', e => {

  const btn = e.target.closest('.btn-cart');

  if (!btn) return;

  const card =
    btn.closest('.product-card');

  const name =
    card?.querySelector('.prod-name')
      ?.textContent || 'ITEM';

  const price =
    card?.querySelector('.prod-price')
      ?.textContent || '';

  const image =
    card?.querySelector('.card-img img')
      ?.getAttribute('src') || '';

  const cartItem = {
    name,
    price,
    image,
  };

  addToCart(cartItem);
  showToast(`${name} added to cart`);
});

function getCartItems() {
  return JSON.parse(
    localStorage.getItem('cart') || '[]'
  );
}

function setCartItems(items) {
  localStorage.setItem('cart', JSON.stringify(items));
}

function addToCart(item) {
  const cart = getCartItems();
  cart.push(item);
  setCartItems(cart);
  updateCartBadge();
}

function updateCartBadge() {
  // delegate to global badge updater when available
  if (typeof window.updateCartBadge === 'function' && window.updateCartBadge !== updateCartBadge) {
    try { window.updateCartBadge(); return; } catch (e) {}
  }

  const badge = document.querySelector('.ts-cart-badge');
  if (!badge) return;
  const cart = getCartItems();
  const qty = (cart || []).reduce((s,i) => s + (Number(i.quantity) || 1), 0);
  if (qty <= 0) { badge.style.display = 'none'; badge.textContent = ''; }
  else { badge.style.display = 'inline-block'; badge.textContent = String(qty); }
}

function ensureCartButtons() {
  document.querySelectorAll('.product-card').forEach(card => {
    if (card.querySelector('.btn-cart')) return;
    const tagRow = card.querySelector('.tag-row');
    if (!tagRow) return;
    const button = document.createElement('button');
    button.className = 'btn-cart';
    button.textContent = '🛒 ADD TO CART';
    tagRow.insertAdjacentElement('afterend', button);
  });
}

function showToast(msg) {

  let toast =
    document.getElementById('ts-toast');

  if (!toast) {

    toast = document.createElement('div');

    toast.id = 'ts-toast';

    Object.assign(toast.style, {

      position: 'fixed',
      bottom: '32px',
      right: '32px',

      background: '#0d1520',

      border: '1px solid rgba(0,229,255,.5)',

      color: '#00e5ff',

      fontFamily:
        "'Share Tech Mono', monospace",

      fontSize: '.72rem',

      letterSpacing: '.14em',

      padding: '12px 24px',

      zIndex: '9999',

      boxShadow:
        '0 0 24px rgba(0,229,255,.25)',

      transition:
        'opacity .3s, transform .3s',

      pointerEvents: 'none',
    });

    document.body.appendChild(toast);
  }

  toast.textContent = `✓ ${msg}`;

  toast.style.opacity = '1';

  toast.style.transform = 'translateY(0)';

  clearTimeout(toast._timer);

  toast._timer = setTimeout(() => {

    toast.style.opacity = '0';

    toast.style.transform =
      'translateY(8px)';

  }, 2400);
}


/* =========================================================
   11. BOOT
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  await loadNavbar();

  // Update navbar based on auth state
  if (typeof updateNavbarAuthState === "function") {
    updateNavbarAuthState();
  }

  initSearch();
  updateCartBadge();
  ensureCartButtons();
  revealCards();

  updateInventoryCount();
});