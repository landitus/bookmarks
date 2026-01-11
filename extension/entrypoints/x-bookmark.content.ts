const STORAGE_KEYS = {
  AUTO_SAVE_X_BOOKMARKS: "portable_auto_save_x_bookmarks",
} as const;

type SaveUrlMessage = {
  type: "portable_save_url";
  url: string;
  source: "x_bookmark";
};

function extractTweetUrlFromArticle(article: Element): string | null {
  const anchors = Array.from(article.querySelectorAll<HTMLAnchorElement>('a[href*="/status/"]'));
  for (const a of anchors) {
    const href = a.getAttribute("href");
    if (!href) continue;
    if (!/\/status\/\d+/.test(href)) continue;

    try {
      const url = new URL(href, "https://x.com");
      url.search = "";
      url.hash = "";
      return url.toString();
    } catch {
      continue;
    }
  }
  return null;
}

async function isAutoSaveEnabled(): Promise<boolean> {
  try {
    const result = await browser.storage.local.get([STORAGE_KEYS.AUTO_SAVE_X_BOOKMARKS]);
    const value = result[STORAGE_KEYS.AUTO_SAVE_X_BOOKMARKS] as boolean | undefined;
    return value ?? true; // default ON
  } catch {
    return true;
  }
}

export default defineContentScript({
  matches: ["*://x.com/*", "*://twitter.com/*"],
  runAt: "document_idle",
  main() {
    const onClickCapture = async (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      // Only trigger on the actual "bookmark" button (not "removeBookmark")
      const bookmarkBtn = target.closest?.('[data-testid="bookmark"]');
      if (!bookmarkBtn) return;

      const enabled = await isAutoSaveEnabled();
      if (!enabled) return;

      const article = bookmarkBtn.closest("article");
      if (!article) return;

      const tweetUrl = extractTweetUrlFromArticle(article);
      if (!tweetUrl) return;

      const message: SaveUrlMessage = {
        type: "portable_save_url",
        url: tweetUrl,
        source: "x_bookmark",
      };

      try {
        // Fire-and-forget: background will dedupe and handle 409s.
        void browser.runtime.sendMessage(message);
      } catch {
        // ignore
      }
    };

    document.addEventListener("click", onClickCapture, true);
  },
});

