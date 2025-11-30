// Storage keys
const STORAGE_KEYS = {
  API_KEY: "portable_api_key",
  SERVER_URL: "portable_server_url",
};

const DEFAULT_SERVER_URL = "http://localhost:3000";

// Get elements
const settingsView = document.getElementById("settings-view")!;
const saveView = document.getElementById("save-view")!;
const successView = document.getElementById("success-view")!;
const errorView = document.getElementById("error-view")!;

const apiKeyInput = document.getElementById(
  "api-key-input"
) as HTMLInputElement;
const serverUrlInput = document.getElementById(
  "server-url-input"
) as HTMLInputElement;
const saveSettingsBtn = document.getElementById("save-settings")!;
const openSettingsBtn = document.getElementById("open-settings")!;

const pageTitleEl = document.getElementById("page-title")!;
const pageUrlEl = document.getElementById("page-url")!;
const saveBtn = document.getElementById("save-btn")!;
const saveBtnText = document.getElementById("save-btn-text")!;
const saveBtnLoading = document.getElementById("save-btn-loading")!;
const errorText = document.getElementById("error-text")!;
const retryBtn = document.getElementById("retry-btn")!;

// State
let currentUrl = "";
let currentTitle = "";

// View management
function showView(view: HTMLElement) {
  [settingsView, saveView, successView, errorView].forEach((v) => {
    v.classList.add("hidden");
  });
  view.classList.remove("hidden");
}

// Get stored settings
async function getSettings() {
  const result = await browser.storage.local.get([
    STORAGE_KEYS.API_KEY,
    STORAGE_KEYS.SERVER_URL,
  ]);
  return {
    apiKey: result[STORAGE_KEYS.API_KEY] as string | undefined,
    serverUrl:
      (result[STORAGE_KEYS.SERVER_URL] as string) || DEFAULT_SERVER_URL,
  };
}

// Save settings
async function saveSettings() {
  const apiKey = apiKeyInput.value.trim();
  const serverUrl = serverUrlInput.value.trim() || DEFAULT_SERVER_URL;

  if (!apiKey) {
    apiKeyInput.focus();
    return;
  }

  await browser.storage.local.set({
    [STORAGE_KEYS.API_KEY]: apiKey,
    [STORAGE_KEYS.SERVER_URL]: serverUrl,
  });

  init();
}

// Get current tab info
async function getCurrentTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  return {
    url: tab?.url || "",
    title: tab?.title || "Untitled",
  };
}

// Save bookmark
async function saveBookmark() {
  const settings = await getSettings();

  if (!settings.apiKey) {
    showView(settingsView);
    return;
  }

  // Update UI
  saveBtn.setAttribute("disabled", "true");
  saveBtnText.classList.add("hidden");
  saveBtnLoading.classList.remove("hidden");

  try {
    const response = await fetch(`${settings.serverUrl}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({ url: currentUrl }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showView(successView);
      // Auto-close after success
      setTimeout(() => window.close(), 1500);
    } else {
      errorText.textContent = data.error || "Failed to save";
      showView(errorView);
    }
  } catch (err) {
    console.error("Save error:", err);
    errorText.textContent = "Could not connect to server";
    showView(errorView);
  } finally {
    saveBtn.removeAttribute("disabled");
    saveBtnText.classList.remove("hidden");
    saveBtnLoading.classList.add("hidden");
  }
}

// Initialize
async function init() {
  const settings = await getSettings();

  // Get current tab info
  const tab = await getCurrentTab();
  currentUrl = tab.url;
  currentTitle = tab.title;

  if (!settings.apiKey) {
    // Show settings view
    serverUrlInput.value = settings.serverUrl;
    showView(settingsView);
  } else {
    // Show save view with page info
    pageTitleEl.textContent = currentTitle;
    pageUrlEl.textContent = currentUrl;
    showView(saveView);
  }
}

// Event listeners
saveSettingsBtn.addEventListener("click", saveSettings);
saveBtn.addEventListener("click", saveBookmark);
openSettingsBtn.addEventListener("click", () => {
  getSettings().then((s) => {
    apiKeyInput.value = s.apiKey || "";
    serverUrlInput.value = s.serverUrl;
    showView(settingsView);
  });
});
retryBtn.addEventListener("click", () => {
  showView(saveView);
});

// Allow Enter key in inputs
apiKeyInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveSettings();
});
serverUrlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveSettings();
});

// Start
init();
