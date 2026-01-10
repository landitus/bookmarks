"use client";

import { useEffect, useState } from "react";
import { getApiKey } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Key,
  QrCode,
  Chrome,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// Brand icons as SVG components
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-1.4-.59-2.94-.92-4.47-.92s-3.07.33-4.47.92L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
    </svg>
  );
}


export default function AppsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    getApiKey().then((key) => {
      setApiKey(key);
      setLoading(false);
    });
  }, []);

  const handleCopy = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apiUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/items`
      : "/api/items";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Apps & Integrations
        </h1>
        <p className="text-muted-foreground mt-1">
          Save links to Portable from anywhere
        </p>
      </div>

      {/* API Key Section */}
      <section className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <Key className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h2 className="font-medium">Your API Key</h2>
            <p className="text-sm text-muted-foreground">
              Used for iOS Shortcut and browser extension
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            value={loading ? "Loading..." : apiKey || "No API key found"}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            disabled={!apiKey}
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowQR(!showQR)}
            disabled={!apiKey}
            title="Show QR code"
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>

        {/* QR Code for mobile scanning */}
        {showQR && apiKey && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Scan this QR code with your phone to copy the API key:
            </p>
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCodeSVG
                value={apiKey}
                size={160}
                level="M"
                marginSize={0}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Use your camera app or a QR scanner to copy this key
            </p>
          </div>
        )}
      </section>

      {/* iOS Shortcut Section */}
      <section className="rounded-lg border bg-card overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <AppleIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h2 className="font-medium">iOS Share Sheet</h2>
              <p className="text-sm text-muted-foreground">
                Save links from any iOS app using Shortcuts
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground">
            Create an iOS Shortcut to save links directly from the Share Sheet
            in Safari, Twitter, YouTube, and any other app.
          </p>

          {/* Step by step instructions */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              Setup Instructions
            </h3>

            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <div>
                  <p className="font-medium">Open the Shortcuts app</p>
                  <p className="text-sm text-muted-foreground">
                    Tap the + button to create a new shortcut
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <div>
                  <p className="font-medium">Add &quot;Get URLs from Input&quot;</p>
                  <p className="text-sm text-muted-foreground">
                    Search for this action and add it first
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  3
                </span>
                <div>
                  <p className="font-medium">
                    Add &quot;Get Contents of URL&quot; action
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Configure it as follows:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <span>
                        URL:{" "}
                        <code className="bg-muted px-1 rounded text-xs">
                          {apiUrl}
                        </code>
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <span>
                        Method: <strong>POST</strong>
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <span>
                        Headers: Add <code className="bg-muted px-1 rounded text-xs">Authorization</code> with value{" "}
                        <code className="bg-muted px-1 rounded text-xs">
                          Bearer {apiKey ? apiKey.slice(0, 8) + "..." : "YOUR_API_KEY"}
                        </code>
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <span>
                        Request Body: JSON with{" "}
                        <code className="bg-muted px-1 rounded text-xs">
                          {`{"url": "URLs from Input"}`}
                        </code>
                      </span>
                    </li>
                  </ul>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  4
                </span>
                <div>
                  <p className="font-medium">Add &quot;Show Notification&quot;</p>
                  <p className="text-sm text-muted-foreground">
                    Set title to &quot;Saved to Portable&quot; for confirmation
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  5
                </span>
                <div>
                  <p className="font-medium">Enable Share Sheet</p>
                  <p className="text-sm text-muted-foreground">
                    Tap the shortcut name at top → Details → enable &quot;Show in
                    Share Sheet&quot; and select &quot;URLs&quot; as input type
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  6
                </span>
                <div>
                  <p className="font-medium">Name it &quot;Save to Portable&quot;</p>
                  <p className="text-sm text-muted-foreground">
                    This name will appear in your Share Sheet
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" asChild>
              <a
                href="https://support.apple.com/guide/shortcuts/welcome/ios"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Shortcuts User Guide
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Android PWA Section */}
      <section className="rounded-lg border bg-card overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <AndroidIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h2 className="font-medium">Android Share Sheet</h2>
              <p className="text-sm text-muted-foreground">
                Install as PWA for native share sheet support
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            On Android, you can install Portable as a Progressive Web App (PWA)
            to get native share sheet integration.
          </p>

          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                1
              </span>
              <p className="text-sm">
                Open Portable in Chrome on your Android device
              </p>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                2
              </span>
              <p className="text-sm">
                Tap the menu (⋮) → &quot;Add to Home screen&quot; or &quot;Install app&quot;
              </p>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                3
              </span>
              <p className="text-sm">
                Portable will now appear in your share sheet as &quot;Portable&quot;
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Browser Extension Section */}
      <section className="rounded-lg border bg-card overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <Chrome className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h2 className="font-medium">Browser Extension</h2>
              <p className="text-sm text-muted-foreground">
                One-click saving from Chrome, Firefox, Edge
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Save the current page with a single click. The extension uses your
            API key to authenticate.
          </p>

          <div className="flex gap-3">
            <Button variant="outline" disabled>
              Coming to Chrome Web Store
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            For now, you can load the extension manually from the{" "}
            <code className="bg-muted px-1 rounded">/extension</code> folder in
            developer mode.
          </p>
        </div>
      </section>
    </div>
  );
}
