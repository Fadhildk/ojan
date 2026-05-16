/* =============================================================
   TechnoSpace — register.js
   ============================================================= */

"use strict";

/* ─────────────────────────────────────────────────────────────
   1. LOAD NAVBAR
   Calls loadNavbar() from ../main.js then hands off to
   initNavbar() which is also defined there.
   ───────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {

  // main.js exposes loadNavbar() globally
  if (typeof loadNavbar === "function") {
    await loadNavbar();
  }

  initPage();
});

/* ─────────────────────────────────────────────────────────────
   2. PAGE INIT
   ───────────────────────────────────────────────────────────── */
function initPage() {
  populateDays();
  populateYears();
  initPasswordToggle();
  initPasswordStrength();
  initRealTimeValidation();
  initFormSubmit();
}

/* ─────────────────────────────────────────────────────────────
   3. POPULATE DATE SELECTS
   ───────────────────────────────────────────────────────────── */
function populateDays() {
  const sel = document.getElementById("dobDay");
  if (!sel) return;
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement("option");
    opt.value = String(d).padStart(2, "0");
    opt.textContent = String(d).padStart(2, "0");
    sel.appendChild(opt);
  }
}

function populateYears() {
  const sel = document.getElementById("dobYear");
  if (!sel) return;
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 10; y >= currentYear - 100; y--) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    sel.appendChild(opt);
  }
}

/* ─────────────────────────────────────────────────────────────
   4. PASSWORD TOGGLE (show / hide)
   ───────────────────────────────────────────────────────────── */
function initPasswordToggle() {
  const btn    = document.getElementById("togglePw");
  const input  = document.getElementById("password");
  const eyeIcon = document.getElementById("eyeIcon");
  if (!btn || !input) return;

  btn.addEventListener("click", () => {
    const isHidden = input.type === "password";
    input.type   = isHidden ? "text" : "password";
    eyeIcon.textContent = isHidden ? "🙈" : "👁";
  });
}

/* ─────────────────────────────────────────────────────────────
   5. PASSWORD STRENGTH
   ───────────────────────────────────────────────────────────── */
function initPasswordStrength() {
  const input = document.getElementById("password");
  const bar   = document.getElementById("pwBar");
  if (!input || !bar) return;

  input.addEventListener("input", () => {
    const val = input.value;
    const strength = getPasswordStrength(val);
    bar.dataset.strength = strength;
  });
}

function getPasswordStrength(pw) {
  if (!pw) return "";
  let score = 0;
  if (pw.length >= 8)                      score++;
  if (/[A-Z]/.test(pw))                    score++;
  if (/[0-9]/.test(pw))                    score++;
  if (/[^A-Za-z0-9]/.test(pw))            score++;
  if (pw.length >= 12)                     score++;
  if (score <= 1) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

/* ─────────────────────────────────────────────────────────────
   6. REAL-TIME FIELD VALIDATION
   ───────────────────────────────────────────────────────────── */
function initRealTimeValidation() {

  const nameInput  = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const pwInput    = document.getElementById("password");

  nameInput?.addEventListener("blur",  () => validateName(nameInput));
  emailInput?.addEventListener("blur", () => validateEmail(emailInput));
  pwInput?.addEventListener("blur",    () => validatePassword(pwInput));

  // Clear error on focus
  [nameInput, emailInput, pwInput].forEach(el => {
    el?.addEventListener("focus", () => clearState(el.closest(".field-group")));
  });
}

/* Helpers */
function setValid(group) {
  group.classList.remove("is-invalid");
  group.classList.add("is-valid");
  group.querySelector(".field-error").textContent = "";
}

function setInvalid(group, msg) {
  group.classList.remove("is-valid");
  group.classList.add("is-invalid");
  group.querySelector(".field-error").textContent = msg;
}

function clearState(group) {
  group?.classList.remove("is-valid", "is-invalid");
  const errEl = group?.querySelector(".field-error");
  if (errEl) errEl.textContent = "";
}

function validateName(input) {
  const group = input.closest(".field-group");
  const val   = input.value.trim();
  if (!val) {
    setInvalid(group, "FIELD_REQUIRED: Enter your full name");
    return false;
  }
  if (val.length < 2) {
    setInvalid(group, "MINIMUM 2 CHARACTERS REQUIRED");
    return false;
  }
  setValid(group);
  return true;
}

function validateEmail(input) {
  const group = input.closest(".field-group");
  const val   = input.value.trim();
  const re    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!val) {
    setInvalid(group, "FIELD_REQUIRED: Enter your email");
    return false;
  }
  if (!re.test(val)) {
    setInvalid(group, "INVALID_FORMAT: Use name@domain.com");
    return false;
  }
  setValid(group);
  return true;
}

function validatePassword(input) {
  const group = input.closest(".field-group");
  const val   = input.value;
  if (!val) {
    setInvalid(group, "FIELD_REQUIRED: Enter a password");
    return false;
  }
  if (val.length < 8) {
    setInvalid(group, "MINIMUM 8 CHARACTERS REQUIRED");
    return false;
  }
  if (!/[A-Za-z]/.test(val) || !/[0-9]/.test(val)) {
    setInvalid(group, "PASSWORD MUST INCLUDE LETTERS AND NUMBERS");
    return false;
  }
  setValid(group);
  return true;
}

function validateGender() {
  const group    = document.getElementById("fg-gender");
  const selected = document.querySelector('input[name="gender"]:checked');
  if (!selected) {
    setInvalid(group, "SELECTION_REQUIRED");
    return false;
  }
  clearState(group);
  return true;
}

function validateDOB() {
  const group = document.getElementById("fg-dob");
  const day   = document.getElementById("dobDay").value;
  const month = document.getElementById("dobMonth").value;
  const year  = document.getElementById("dobYear").value;

  if (!day || !month || !year) {
    setInvalid(group, "COMPLETE_DATE_REQUIRED");
    return false;
  }

  // Age must be >= 13
  const dob = new Date(`${year}-${month}-${day}`);
  const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (age < 13) {
    setInvalid(group, "MINIMUM_AGE: 13 YEARS REQUIRED");
    return false;
  }

  clearState(group);
  return true;
}

/* ─────────────────────────────────────────────────────────────
   7. FORM SUBMIT
   ───────────────────────────────────────────────────────────── */
function initFormSubmit() {
  const form   = document.getElementById("regForm");
  const btn    = document.getElementById("btnSubmit");
  const loader = document.getElementById("btnLoader");
  const label  = btn?.querySelector(".btn-text");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate all fields
    const nameInput  = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const pwInput    = document.getElementById("password");

    const valid = [
      validateName(nameInput),
      validateEmail(emailInput),
      validatePassword(pwInput),
      validateGender(),
      validateDOB(),
    ].every(Boolean);

    if (!valid) return;

    // Loading state
    btn.disabled = true;
    loader?.classList.add("active");
    if (label) label.textContent = "INITIALIZING...";

    // Simulate async request (replace with real fetch)
    await new Promise(r => setTimeout(r, 1800));

    loader?.classList.remove("active");

    // Show success toast (showToast is from main.js)
    if (typeof showToast === "function") {
      showToast("Identity initialized. Welcome to TechnoSpace.");
    }

    if (label) label.textContent = "IDENTITY_CREATED ✓";
    btn.style.borderColor = "var(--ok)";
    btn.style.color       = "var(--ok)";
    btn.type = "button";
    btn.disabled = false;

    btn.addEventListener("click", () => {
      location.href = "home.html";
    }, { once: true });

    // Redirect back to Home after successful registration
    setTimeout(() => {
      location.href = "home.html";
    }, 1500);
  });
}