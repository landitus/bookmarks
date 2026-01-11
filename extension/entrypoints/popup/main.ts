// Environment configurations
const ENVIRONMENTS = {
  local: {
    name: "Local",
    serverUrl: "http://127.0.0.1:3000",
  },
  prod: {
    name: "Production",
    serverUrl: "https://bookmarks-eight-mu.vercel.app",
  },
} as const;

type EnvKey = keyof typeof ENVIRONMENTS;

// Storage keys
const STORAGE_KEYS = {
  CURRENT_ENV: "portable_current_env",
  API_KEY_LOCAL: "portable_api_key_local",
  API_KEY_PROD: "portable_api_key_prod",
  SERVER_URL_LOCAL: "portable_server_url_local",
  SERVER_URL_PROD: "portable_server_url_prod",
  AUTO_SAVE_X_BOOKMARKS: "portable_auto_save_x_bookmarks",
};

// Get elements
const settingsView = document.getElementById("settings-view")!;
const saveView = document.getElementById("save-view")!;
const successView = document.getElementById("success-view")!;
const errorView = document.getElementById("error-view")!;
const alreadySavedView = document.getElementById("already-saved-view")!;

const envLocalBtn = document.getElementById("env-local")!;
const envProdBtn = document.getElementById("env-prod")!;
const segmentBg = document.getElementById("segment-bg")!;
const statusDotLocal = document.getElementById("status-dot-local")!;
const statusDotProd = document.getElementById("status-dot-prod")!;
const apiKeyInput = document.getElementById(
  "api-key-input"
) as HTMLInputElement;
const serverUrlInput = document.getElementById(
  "server-url-input"
) as HTMLInputElement;
const saveSettingsBtn = document.getElementById("save-settings")!;
const openSettingsBtn = document.getElementById("open-settings")!;
const envIndicator = document.getElementById("env-indicator")!;
const autoSaveXBookmarksCheckbox = document.getElementById(
  "auto-save-x-bookmarks"
) as HTMLInputElement;

const pageTitleEl = document.getElementById("page-title")!;
const pageUrlEl = document.getElementById("page-url")!;
const saveBtn = document.getElementById("save-btn")!;
const saveBtnText = document.getElementById("save-btn-text")!;
const saveBtnLoading = document.getElementById("save-btn-loading")!;
const errorText = document.getElementById("error-text")!;
const retryBtn = document.getElementById("retry-btn")!;
const savedDateEl = document.getElementById("saved-date")!;
const openPortableBtn = document.getElementById("open-portable-btn")!;
const openSettingsFromSavedBtn = document.getElementById("open-settings-from-saved")!;
const versionText = document.getElementById("version-text")!;
const versionTextSaveView = document.getElementById("version-text-save-view")!;
const checkUpdatesBtn = document.getElementById("check-updates-btn")!;

// State
let currentUrl = "";
let currentTitle = "";
let selectedEnv: EnvKey = "local";
let currentVersion = "";

// Get extension version
function getExtensionVersion(): string {
  try {
    const manifest = browser.runtime.getManifest();
    return manifest.version || "unknown";
  } catch {
    return "unknown";
  }
}

// Check for updates
async function checkForUpdates(): Promise<{ isLatest: boolean; latestVersion?: string }> {
  const settings = await getSettings();
  
  try {
    // Try to fetch latest version from a simple endpoint
    // For now, we'll just compare with a static check
    // In the future, you could add an endpoint like: /api/extension/version
    const response = await fetch(`${settings.serverUrl}/api/extension/version`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      return {
        isLatest: data.version === currentVersion,
        latestVersion: data.version,
      };
    }
  } catch (err) {
    // Endpoint doesn't exist yet, that's okay
    console.log("Update check endpoint not available");
  }

  // Default: assume latest (since we can't check)
  return { isLatest: true };
}

// Update version display
function updateVersionDisplay() {
  const version = getExtensionVersion();
  currentVersion = version;
  
  if (versionText) {
    versionText.textContent = `v${version}`;
  }
  if (versionTextSaveView) {
    versionTextSaveView.textContent = `v${version}`;
  }
}

// View management
function showView(view: HTMLElement) {
  [settingsView, saveView, successView, errorView, alreadySavedView].forEach((v) => {
    v.classList.add("hidden");
  });
  view.classList.remove("hidden");
}

// Update environment button styles
function updateEnvButtons() {
  envLocalBtn.classList.toggle("active", selectedEnv === "local");
  envProdBtn.classList.toggle("active", selectedEnv === "prod");

  // Animate sliding background
  if (selectedEnv === "local") {
    segmentBg.classList.remove("prod");
  } else {
    segmentBg.classList.add("prod");
  }
}

// Update status dots based on whether credentials exist
async function updateStatusDots() {
  const result = await browser.storage.local.get([
    STORAGE_KEYS.API_KEY_LOCAL,
    STORAGE_KEYS.API_KEY_PROD,
  ]);

  const hasLocalKey = !!result[STORAGE_KEYS.API_KEY_LOCAL];
  const hasProdKey = !!result[STORAGE_KEYS.API_KEY_PROD];

  statusDotLocal.classList.toggle("configured", hasLocalKey);
  statusDotProd.classList.toggle("configured", hasProdKey);
}

// Get storage keys for current environment
function getEnvStorageKeys(env: EnvKey) {
  return {
    apiKey:
      env === "local" ? STORAGE_KEYS.API_KEY_LOCAL : STORAGE_KEYS.API_KEY_PROD,
    serverUrl:
      env === "local"
        ? STORAGE_KEYS.SERVER_URL_LOCAL
        : STORAGE_KEYS.SERVER_URL_PROD,
  };
}

// Get stored settings for current environment
async function getSettings() {
  const result = await browser.storage.local.get([
    STORAGE_KEYS.CURRENT_ENV,
    STORAGE_KEYS.API_KEY_LOCAL,
    STORAGE_KEYS.API_KEY_PROD,
    STORAGE_KEYS.SERVER_URL_LOCAL,
    STORAGE_KEYS.SERVER_URL_PROD,
    STORAGE_KEYS.AUTO_SAVE_X_BOOKMARKS,
  ]);

  const env = (result[STORAGE_KEYS.CURRENT_ENV] as EnvKey) || "local";
  const keys = getEnvStorageKeys(env);

  return {
    env,
    apiKey: result[keys.apiKey] as string | undefined,
    serverUrl:
      (result[keys.serverUrl] as string) || ENVIRONMENTS[env].serverUrl,
    autoSaveXBookmarks:
      (result[STORAGE_KEYS.AUTO_SAVE_X_BOOKMARKS] as boolean | undefined) ??
      true,
  };
}

// Select environment
async function selectEnv(env: EnvKey) {
  selectedEnv = env;
  updateEnvButtons();
  await updateStatusDots();

  // Update env indicator in header
  envIndicator.textContent = ENVIRONMENTS[env].name;
  envIndicator.className = `env-indicator env-${env}`;

  // Load settings for this environment
  const result = await browser.storage.local.get([
    STORAGE_KEYS.API_KEY_LOCAL,
    STORAGE_KEYS.API_KEY_PROD,
    STORAGE_KEYS.SERVER_URL_LOCAL,
    STORAGE_KEYS.SERVER_URL_PROD,
  ]);

  const keys = getEnvStorageKeys(env);
  apiKeyInput.value = (result[keys.apiKey] as string) || "";
  serverUrlInput.value =
    (result[keys.serverUrl] as string) || ENVIRONMENTS[env].serverUrl;
}

// Save settings
async function saveSettings() {
  const apiKey = apiKeyInput.value.trim();
  const serverUrl =
    serverUrlInput.value.trim() || ENVIRONMENTS[selectedEnv].serverUrl;

  if (!apiKey) {
    apiKeyInput.focus();
    return;
  }

  const keys = getEnvStorageKeys(selectedEnv);

  await browser.storage.local.set({
    [STORAGE_KEYS.CURRENT_ENV]: selectedEnv,
    [keys.apiKey]: apiKey,
    [keys.serverUrl]: serverUrl,
    [STORAGE_KEYS.AUTO_SAVE_X_BOOKMARKS]: autoSaveXBookmarksCheckbox.checked,
  });

  await updateStatusDots();
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

// Format relative date (e.g., "Saved 3 days ago")
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins === 0) {
        return "Saved just now";
      }
      return `Saved ${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    }
    return `Saved ${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffDays === 1) {
    return "Saved yesterday";
  } else if (diffDays < 7) {
    return `Saved ${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Saved ${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Saved ${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `Saved ${years} ${years === 1 ? "year" : "years"} ago`;
  }
}

// Check if bookmark already exists
async function checkBookmarkExists(url: string): Promise<{ exists: boolean; item?: { created_at: string } }> {
  const settings = await getSettings();

  if (!settings.apiKey) {
    console.log("No API key, skipping check");
    return { exists: false };
  }

  if (!url || url === "about:blank" || url.startsWith("chrome://") || url.startsWith("edge://")) {
    console.log("Invalid URL for check:", url);
    return { exists: false };
  }

  try {
    const encodedUrl = encodeURIComponent(url);
    const checkUrl = `${settings.serverUrl}/api/items?url=${encodedUrl}`;
    console.log("Checking bookmark exists:", checkUrl);
    
    const response = await fetch(checkUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${settings.apiKey}`,
      },
    });

    const data = await response.json();
    console.log("Check response:", { status: response.status, ok: response.ok, data });

    if (response.ok && data.exists === true && data.item) {
      console.log("Bookmark exists:", data.item);
      return { exists: true, item: data.item };
    }

    if (!response.ok) {
      console.warn("Check request failed:", response.status, data);
    }

    return { exists: false };
  } catch (err) {
    console.error("Check error:", err);
    // If check fails, assume it doesn't exist and let user try to save
    return { exists: false };
  }
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
      // If it's a duplicate error, show the "already saved" view instead
      if (response.status === 409 || data.error?.includes("already exists")) {
        // Re-check to get the item details
        const checkResult = await checkBookmarkExists(currentUrl);
        if (checkResult.exists && checkResult.item) {
          const savedDate = formatRelativeDate(checkResult.item.created_at);
          savedDateEl.textContent = savedDate;
          showView(alreadySavedView);
          return;
        }
      }
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
  // Update version display first
  updateVersionDisplay();

  const settings = await getSettings();
  selectedEnv = settings.env;
  autoSaveXBookmarksCheckbox.checked = settings.autoSaveXBookmarks;

  // Get current tab info
  const tab = await getCurrentTab();
  currentUrl = tab.url;
  currentTitle = tab.title;

  // Update status dots
  await updateStatusDots();

  // Update env indicator in header
  envIndicator.textContent = ENVIRONMENTS[settings.env].name;
  envIndicator.className = `env-indicator env-${settings.env}`;

  if (!settings.apiKey) {
    // Show settings view
    updateEnvButtons();
    serverUrlInput.value = settings.serverUrl;
    apiKeyInput.value = "";
    showView(settingsView);
  } else {
    // Check if bookmark already exists
    const checkResult = await checkBookmarkExists(currentUrl);
    
    if (checkResult.exists && checkResult.item) {
      // Show already saved view
      const savedDate = formatRelativeDate(checkResult.item.created_at);
      savedDateEl.textContent = savedDate;
      showView(alreadySavedView);
    } else {
      // Show save view with page info
      pageTitleEl.textContent = currentTitle;
      pageUrlEl.textContent = currentUrl;
      showView(saveView);
    }
  }
}

// Event listeners
envLocalBtn.addEventListener("click", () => selectEnv("local"));
envProdBtn.addEventListener("click", () => selectEnv("prod"));
saveSettingsBtn.addEventListener("click", saveSettings);
saveBtn.addEventListener("click", saveBookmark);
openSettingsBtn.addEventListener("click", async () => {
  const settings = await getSettings();
  selectedEnv = settings.env;
  updateEnvButtons();
  await updateStatusDots();
  envIndicator.textContent = ENVIRONMENTS[settings.env].name;
  envIndicator.className = `env-indicator env-${settings.env}`;
  apiKeyInput.value = settings.apiKey || "";
  serverUrlInput.value = settings.serverUrl;
  autoSaveXBookmarksCheckbox.checked = settings.autoSaveXBookmarks;
  showView(settingsView);
});
retryBtn.addEventListener("click", () => {
  showView(saveView);
});

// Open Portable app
openPortableBtn.addEventListener("click", async () => {
  const settings = await getSettings();
  await browser.tabs.create({ url: settings.serverUrl });
  window.close();
});

// Open settings from already saved view
openSettingsFromSavedBtn.addEventListener("click", async () => {
  const settings = await getSettings();
  selectedEnv = settings.env;
  updateEnvButtons();
  await updateStatusDots();
  envIndicator.textContent = ENVIRONMENTS[settings.env].name;
  envIndicator.className = `env-indicator env-${settings.env}`;
  apiKeyInput.value = settings.apiKey || "";
  serverUrlInput.value = settings.serverUrl;
  autoSaveXBookmarksCheckbox.checked = settings.autoSaveXBookmarks;
  updateVersionDisplay();
  showView(settingsView);
});

// Persist the X auto-save toggle immediately (no need to click "Save Settings")
autoSaveXBookmarksCheckbox.addEventListener("change", async () => {
  await browser.storage.local.set({
    [STORAGE_KEYS.AUTO_SAVE_X_BOOKMARKS]: autoSaveXBookmarksCheckbox.checked,
  });
});

// Check for updates button
checkUpdatesBtn.addEventListener("click", async () => {
  checkUpdatesBtn.textContent = "Checking...";
  checkUpdatesBtn.setAttribute("disabled", "true");
  
  const updateInfo = await checkForUpdates();
  
  if (updateInfo.isLatest) {
    checkUpdatesBtn.textContent = "✓ Up to date";
    checkUpdatesBtn.style.color = "#22c55e";
    setTimeout(() => {
      checkUpdatesBtn.textContent = "Check for updates";
      checkUpdatesBtn.removeAttribute("disabled");
      checkUpdatesBtn.style.color = "";
    }, 2000);
  } else if (updateInfo.latestVersion) {
    checkUpdatesBtn.textContent = `Update available: v${updateInfo.latestVersion}`;
    checkUpdatesBtn.style.color = "#f59e0b";
    // Could add a link to download page here
  } else {
    checkUpdatesBtn.textContent = "Check for updates";
    checkUpdatesBtn.removeAttribute("disabled");
  }
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
