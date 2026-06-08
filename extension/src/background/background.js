import { CONFIG } from "../config/config.js";

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-page-pin",
    title: "Pin this page",
    contexts: ["page"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-page-pin") {
    const result = await savePage(tab);
    notify(result.success ? "✓" : "✗");
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "savePage") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const result = await savePage(tabs[0]);
      sendResponse(result);
    });
    return true;
  }
});

// ---------------------------------------------------------------------------
// 🔹 ADDED: Auth helpers
// ---------------------------------------------------------------------------

// Read the saved auth token from chrome.storage.local
async function getAuthToken() {
  const { authToken } = await chrome.storage.local.get("authToken");
  return authToken || null;
}

// Clear token (called when server says it's invalid/expired)
async function clearAuth() {
  await chrome.storage.local.remove(["authToken", "email"]);
}

// ---------------------------------------------------------------------------
// Core: capture, compress, send
// ---------------------------------------------------------------------------

async function savePage(tab) {
  try {
    // 🔹 ADDED: block early if not logged in (saves a wasted screenshot)
    const token = await getAuthToken();
    if (!token) {
      return { success: false, message: "Please log in first" };
    }

    const rawShot = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "png",
    });

    const screenshot = await compressScreenshot(rawShot, {
      maxWidth: 640,
      maxHeight: 360,
      maxSizeKB: 80,
    });

    const pageData = {
      url: tab.url,
      title: tab.title,
      screenshot: screenshot,
      savedAt: new Date().toISOString(),
    };

    const serverResult = await sendToServer(pageData, token); // 🔹 CHANGED: pass token

    return {
      success: true,
      message: "Page pinned successfully",
      data: serverResult,
    };
  } catch (err) {
    console.error("Failed to pin page:", err);
    return {
      success: false,
      message: err.message || "Failed to pin page",
    };
  }
}

// ---------------------------------------------------------------------------
// Image compression  (unchanged)
// ---------------------------------------------------------------------------

async function compressScreenshot(
  dataUrl,
  { maxWidth = 640, maxHeight = 360, maxSizeKB = 80 } = {},
) {
  const blob = await (await fetch(dataUrl)).blob();
  const bitmap = await createImageBitmap(blob);

  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const targetW = Math.round(bitmap.width * scale);
  const targetH = Math.round(bitmap.height * scale);

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const preferWebP = await supportsWebP(canvas);
  const mimeType = preferWebP ? "image/webp" : "image/jpeg";

  let quality = 0.7;
  let outBlob;

  for (let attempt = 1; attempt <= 6; attempt++) {
    outBlob = await canvas.convertToBlob({ type: mimeType, quality });
    const sizeKB = outBlob.size / 1024;
    console.log(
      `Compress attempt ${attempt}: ${mimeType}, quality=${quality.toFixed(2)}, size=${sizeKB.toFixed(1)} KB`,
    );
    if (sizeKB <= maxSizeKB || quality <= 0.2) break;
    quality -= 0.1;
  }

  return await blobToDataURL(outBlob);
}

async function supportsWebP(canvas) {
  try {
    const testBlob = await canvas.convertToBlob({
      type: "image/webp",
      quality: 0.5,
    });
    return testBlob.type === "image/webp";
  } catch (_) {
    return false;
  }
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ---------------------------------------------------------------------------
// Networking
// ---------------------------------------------------------------------------

// 🔹 CHANGED: now accepts a token and sends it as a Bearer header
async function sendToServer(pageData, token) {
  const url = CONFIG.API_BASE_URL + CONFIG.ENDPOINTS.SAVE_PAGE;

  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pageData),
    });
  } catch (networkError) {
    // SERVER OFFLINE
    throw new Error("Server not responding");
  }

  // SESSION EXPIRED
  if (response.status === 401) {
    await clearAuth();

    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    let serverMsg = `Server error: ${response.status}`;

    try {
      const errBody = await response.json();

      if (errBody.message) {
        serverMsg = errBody.message;
      }
    } catch {}

    throw new Error(serverMsg);
  }

  const data = await response.json();

  if (data.success !== true) {
    throw new Error(data.message || "Server did not confirm save");
  }

  return data;
}

// ---------------------------------------------------------------------------
// UI feedback  (unchanged)
// ---------------------------------------------------------------------------

function notify(text) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({
    color: text === "✓" ? "#16a34a" : "#dc2626",
  });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2500);
}
