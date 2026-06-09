import { CONFIG } from "../config/config.js";

const API = CONFIG.API_BASE_URL;
const CODE_EXPIRY_MS = 5 * 60 * 1000; // must match server (5 min)

const app = document.getElementById("app");
const statusEl = document.getElementById("status");

// ---------------------------------------------------------------------------
// Status helper
// ---------------------------------------------------------------------------
function setStatus(text, type = "") {
  statusEl.textContent = text;
  statusEl.className = type; // "ok" | "err" | ""
}

// ---------------------------------------------------------------------------
// ENTRY POINT — runs every time the popup opens.
// Decides which screen to show purely from storage (stateless popup).
// ---------------------------------------------------------------------------
async function init() {
  const { authToken, authStage, pendingEmail } = await chrome.storage.local.get(
    ["authToken", "authStage", "pendingEmail"],
  );

  if (authToken) {
    renderSaveScreen();
  } else if (authStage === "awaitingCode" && pendingEmail) {
    // We were mid-verification when the popup closed → resume here
    renderCodeScreen(pendingEmail);
  } else {
    renderEmailScreen();
  }
}

document.addEventListener("DOMContentLoaded", init);

// ---------------------------------------------------------------------------
// SCREEN 1 — enter email
// ---------------------------------------------------------------------------
function renderEmailScreen() {
  setStatus("");
  app.innerHTML = `
    <input id="email" type="email" placeholder="you@example.com" />
    <button id="sendBtn">Send Code</button>
  `;

  const emailInput = document.getElementById("email");
  emailInput.focus();

  document.getElementById("sendBtn").addEventListener("click", async () => {
    const email = emailInput.value.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setStatus("Enter a valid email", "err");
      return;
    }
    await sendCode(email);
  });
}

async function sendCode(email) {
  setStatus("Sending code…");
  try {
    const res = await fetch(`${API}${CONFIG.ENDPOINTS.SEND_CODE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      setStatus(data.message || "Could not send code", "err");
      return;
    }

    // 🔑 Persist the stage BEFORE the user leaves to read their email.
    // This is what defeats the deadlock.
    await chrome.storage.local.set({
      authStage: "awaitingCode",
      pendingEmail: email,
      codeSentAt: Date.now(),
    });

    renderCodeScreen(email);
  } catch {
    setStatus("Server unreachable", "err");
  }
}

// ---------------------------------------------------------------------------
// SCREEN 2 — enter the OTP (this is what reopens after closing the popup)
// ---------------------------------------------------------------------------
function renderCodeScreen(email) {
  setStatus("");
  app.innerHTML = `
    <p class="email-badge">Code sent to<br/><b>${email}</b></p>
    <input id="otp" placeholder="6-digit code" maxlength="6" inputmode="numeric" />
    <button id="verifyBtn">Verify</button>
    <button id="resendBtn" class="link" style="display:none">Resend code</button>
    <button id="changeBtn" class="link">Use a different email</button>
    <p id="timer"></p>
  `;

  const otpInput = document.getElementById("otp");
  otpInput.focus();

  document
    .getElementById("verifyBtn")
    .addEventListener("click", () => verifyCode(email, otpInput.value.trim()));

  // Allow pressing Enter to verify
  otpInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") verifyCode(email, otpInput.value.trim());
  });

  document
    .getElementById("resendBtn")
    .addEventListener("click", () => sendCode(email));

  document.getElementById("changeBtn").addEventListener("click", async () => {
    await chrome.storage.local.remove([
      "authStage",
      "pendingEmail",
      "codeSentAt",
    ]);
    renderEmailScreen();
  });

  startCountdown();
}

async function verifyCode(email, code) {
  if (!code || code.length < 6) {
    setStatus("Enter the 6-digit code", "err");
    return;
  }
  setStatus("Verifying…");

  try {
    const res = await fetch(`${API}${CONFIG.ENDPOINTS.VERIFY_CODE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      setStatus(data.message || "Invalid code", "err");
      return; // stay on this screen so they can retry
    }

    // 🔑 Store the session token, clear the temporary verification state.
    await chrome.storage.local.set({
      authToken: data.token,
      email: data.email || email,
    });
    await chrome.storage.local.remove([
      "authStage",
      "pendingEmail",
      "codeSentAt",
    ]);

    renderSaveScreen();
  } catch {
    setStatus("Server unreachable", "err");
  }
}

// Live countdown so the user knows if the code is still valid after reopening
async function startCountdown() {
  const { codeSentAt } = await chrome.storage.local.get("codeSentAt");
  const timerEl = document.getElementById("timer");
  const resendBtn = document.getElementById("resendBtn");

  const tick = () => {
    if (!document.getElementById("timer")) return; // screen changed
    const left = CODE_EXPIRY_MS - (Date.now() - codeSentAt);

    if (left <= 0) {
      timerEl.textContent = "Code expired.";
      resendBtn.style.display = "block";
      return;
    }
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    timerEl.textContent = `Expires in ${m}:${String(s).padStart(2, "0")}`;
    setTimeout(tick, 1000);
  };
  tick();
}

// ---------------------------------------------------------------------------
// SCREEN 3 — logged in: save current page
// ---------------------------------------------------------------------------
async function renderSaveScreen() {
  const { email } = await chrome.storage.local.get("email");
  setStatus("");
  app.innerHTML = `
    ${email ? `<p class="email-badge">Signed in as<br/><b>${email}</b></p>` : ""}
    <button id="saveBtn">📌 Save Current Page</button>
    <button id="logoutBtn" class="link">Log out</button>
  `;

  document.getElementById("saveBtn").addEventListener("click", () => {
    setStatus("Saving…");
    chrome.runtime.sendMessage({ action: "savePage" }, (response) => {
      if (chrome.runtime.lastError) {
        setStatus("Failed: " + chrome.runtime.lastError.message, "err");
        return;
      }

      if (response?.success) {
        setStatus("Saved!", "ok");
      } else {
        setStatus(response?.message || "Failed.", "err");
        // If the background cleared the token (401), bounce back to login
        if (response?.message === "Session expired. Please log in again.") {
          setTimeout(renderEmailScreen, 1200);
        }
      }
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    const { authToken } = await chrome.storage.local.get("authToken");

    try {
      if (authToken) {
        await fetch(`${API}/auth/extension/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      }
    } catch (err) {
      console.warn("Server unavailable during logout.");
    }

    // User explicitly wants to logout,
    // so clear local session regardless.
    await chrome.storage.local.remove([
      "authToken",
      "email",
      "authStage",
      "pendingEmail",
      "codeSentAt",
    ]);

    renderEmailScreen();
  });
}
