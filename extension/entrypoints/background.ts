type SaveUrlMessage = {
  type: "portable_save_url";
  url: string;
  source?: "x_bookmark" | "manual" | string;
};

const STORAGE_KEYS = {
  CURRENT_ENV: "portable_current_env",
  API_KEY_LOCAL: "portable_api_key_local",
  API_KEY_PROD: "portable_api_key_prod",
  SERVER_URL_LOCAL: "portable_server_url_local",
  SERVER_URL_PROD: "portable_server_url_prod",
  AUTO_SAVE_X_BOOKMARKS: "portable_auto_save_x_bookmarks",
} as const;

type EnvKey = "local" | "prod";

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
    serverUrl: result[keys.serverUrl] as string | undefined,
    autoSaveXBookmarks:
      (result[STORAGE_KEYS.AUTO_SAVE_X_BOOKMARKS] as boolean | undefined) ??
      true,
  };
}

function normalizeTweetUrl(input: string): string | null {
  try {
    const url = new URL(input);
    // Canonicalize twitter.com -> x.com, strip query/hash
    url.host = "x.com";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function isLikelyTweetUrl(input: string): boolean {
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();
    if (host !== "x.com" && host !== "twitter.com") return false;
    return /\/status\/\d+/.test(url.pathname);
  } catch {
    return false;
  }
}

// Simple in-memory dedupe for rapid double-clicks / replays
const lastSavedAtByUrl = new Map<string, number>();
const DEDUPE_MS = 10_000;

export default defineBackground(() => {
  console.log("Portable extension loaded");

  browser.runtime.onMessage.addListener((message: unknown) => {
    const msg = message as Partial<SaveUrlMessage> | null;
    if (!msg || msg.type !== "portable_save_url" || !msg.url) return;

    return (async () => {
      const settings = await getSettings();

      if (msg.source === "x_bookmark" && !settings.autoSaveXBookmarks) {
        return { ok: true, skipped: true, reason: "disabled" as const };
      }

      const normalizedUrl = normalizeTweetUrl(msg.url) ?? msg.url;

      const now = Date.now();
      const lastSavedAt = lastSavedAtByUrl.get(normalizedUrl);
      if (lastSavedAt && now - lastSavedAt < DEDUPE_MS) {
        return { ok: true, skipped: true, reason: "deduped" as const };
      }

      if (!settings.apiKey) {
        return { ok: false, error: "Portable API key not configured" };
      }
      if (!settings.serverUrl) {
        return { ok: false, error: "Portable server URL not configured" };
      }

      // Guardrail: only auto-save actual tweet URLs from X/Twitter.
      if (msg.source === "x_bookmark" && !isLikelyTweetUrl(normalizedUrl)) {
        return { ok: true, skipped: true, reason: "not_a_tweet" as const };
      }

      lastSavedAtByUrl.set(normalizedUrl, now);

      const res = await fetch(`${settings.serverUrl}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (res.ok) return { ok: true };

      // Duplicates are expected; treat as success.
      if (res.status === 409) return { ok: true, deduped: true };

      let body: unknown = null;
      try {
        body = await res.json();
      } catch {
        // ignore
      }
      return { ok: false, error: "Save failed", status: res.status, body };
    })();
  });
});

