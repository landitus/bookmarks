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
};

// Get elements
const settingsView = document.getElementById("settings-view")!;
const saveView = document.getElementById("save-view")!;
const successView = document.getElementById("success-view")!;
const errorView = document.getElementById("error-view")!;

const envLocalBtn = document.getElementById("env-local")!;
const envProdBtn = document.getElementById("env-prod")!;
const apiKeyInput = document.getElementById("api-key-input") as HTMLInputElement;
const serverUrlInput = document.getElementById("server-url-input") as HTMLInputElement;
const saveSettingsBtn = document.getElementById("save-settings")!;
const openSettingsBtn = document.getElementById("open-settings")!;
const envIndicator = document.getElementById("env-indicator")!;

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
let selectedEnv: EnvKey = "local";

// View management
function showView(view: HTMLElement) {
  [settingsView, saveView, successView, errorView].forEach((v) => {
    v.classList.add("hidden");
  });
  view.classList.remove("hidden");
}

// Update environment button styles
function updateEnvButtons() {
  envLocalBtn.classList.toggle("active", selectedEnv === "local");
  envProdBtn.classList.toggle("active", selectedEnv === "prod");
}

// Get storage keys for current environment
function getEnvStorageKeys(env: EnvKey) {
  return {
    apiKey: env === "local" ? STORAGE_KEYS.API_KEY_LOCAL : STORAGE_KEYS.API_KEY_PROD,
    serverUrl: env === "local" ? STORAGE_KEYS.SERVER_URL_LOCAL : STORAGE_KEYS.SERVER_URL_PROD,
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
  ]);

  const env = (result[STORAGE_KEYS.CURRENT_ENV] as EnvKey) || "local";
  const keys = getEnvStorageKeys(env);

  return {
    env,
    apiKey: result[keys.apiKey] as string | undefined,
    serverUrl: (result[keys.serverUrl] as string) || ENVIRONMENTS[env].serverUrl,
  };
}

// Select environment
async function selectEnv(env: EnvKey) {
  selectedEnv = env;
  updateEnvButtons();

  // Load settings for this environment
  const result = await browser.storage.local.get([
    STORAGE_KEYS.API_KEY_LOCAL,
    STORAGE_KEYS.API_KEY_PROD,
    STORAGE_KEYS.SERVER_URL_LOCAL,
    STORAGE_KEYS.SERVER_URL_PROD,
  ]);

  const keys = getEnvStorageKeys(env);
  apiKeyInput.value = (result[keys.apiKey] as string) || "";
  serverUrlInput.value = (result[keys.serverUrl] as string) || ENVIRONMENTS[env].serverUrl;
}

// Save settings
async function saveSettings() {
  const apiKey = apiKeyInput.value.trim();
  const serverUrl = serverUrlInput.value.trim() || ENVIRONMENTS[selectedEnv].serverUrl;

  if (!apiKey) {
    apiKeyInput.focus();
    return;
  }

  const keys = getEnvStorageKeys(selectedEnv);

  await browser.storage.local.set({
    [STORAGE_KEYS.CURRENT_ENV]: selectedEnv,
    [keys.apiKey]: apiKey,
    [keys.serverUrl]: serverUrl,
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
  selectedEnv = settings.env;

  // Get current tab info
  const tab = await getCurrentTab();
  currentUrl = tab.url;
  currentTitle = tab.title;

  if (!settings.apiKey) {
    // Show settings view
    updateEnvButtons();
    serverUrlInput.value = settings.serverUrl;
    apiKeyInput.value = "";
    showView(settingsView);
  } else {
    // Show save view with page info
    pageTitleEl.textContent = currentTitle;
    pageUrlEl.textContent = currentUrl;
    envIndicator.textContent = ENVIRONMENTS[settings.env].name;
    envIndicator.className = `env-indicator env-${settings.env}`;
    showView(saveView);
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
  apiKeyInput.value = settings.apiKey || "";
  serverUrlInput.value = settings.serverUrl;
  showView(settingsView);
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
