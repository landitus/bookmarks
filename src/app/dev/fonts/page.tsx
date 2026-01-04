"use client";

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Copy, Check, RotateCcw } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

type DisplayMode = "light" | "amber" | "dark";

interface FontPairing {
  textFont: string;
  codeFont: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Colors matching the reader's CSS variables - dark mode uses white text
const DISPLAY_MODES: Record<DisplayMode, { bg: string; fg: string; codeBg: string; codeFg: string; border: string }> = {
  light: { bg: "#ffffff", fg: "#1a1a1a", codeBg: "#f3f4f6", codeFg: "#1f2937", border: "#e5e7eb" },
  amber: { bg: "#fbf7f0", fg: "#433422", codeBg: "#f5efe5", codeFg: "#5c4a35", border: "#e6dfd3" },
  dark: { bg: "#1a1a1a", fg: "#ffffff", codeBg: "#262626", codeFg: "#ffffff", border: "#333333" },
};

// Top 20 body fonts (mix of serif and sans-serif) - optimized for long-form reading
const BODY_FONTS = [
  // Serif fonts
  { name: "Libre Baskerville", category: "serif" },
  { name: "Merriweather", category: "serif" },
  { name: "Lora", category: "serif" },
  { name: "Playfair Display", category: "serif" },
  { name: "Source Serif 4", category: "serif" },
  { name: "Newsreader", category: "serif" },
  { name: "Crimson Pro", category: "serif" },
  { name: "EB Garamond", category: "serif" },
  { name: "PT Serif", category: "serif" },
  { name: "Literata", category: "serif" },
  // Sans-serif fonts
  { name: "Plus Jakarta Sans", category: "sans" },
  { name: "Inter", category: "sans" },
  { name: "Source Sans 3", category: "sans" },
  { name: "Open Sans", category: "sans" },
  { name: "Nunito", category: "sans" },
  { name: "Work Sans", category: "sans" },
  { name: "DM Sans", category: "sans" },
  { name: "Outfit", category: "sans" },
  { name: "Figtree", category: "sans" },
  { name: "Geist", category: "sans" },
];

// Top 10 code/monospace fonts
const CODE_FONTS = [
  { name: "JetBrains Mono" },
  { name: "Fira Code" },
  { name: "Source Code Pro" },
  { name: "IBM Plex Mono" },
  { name: "Roboto Mono" },
  { name: "Inconsolata" },
  { name: "Ubuntu Mono" },
  { name: "Space Mono" },
  { name: "Cascadia Code" },
  { name: "Geist Mono" },
];

const SAMPLE_CONTENT = `
## Why We Rebuilt Our API From Scratch

Last month, we shipped the biggest change to our platform in three years. What started as a simple refactoring project turned into a complete reimagining of how we handle data synchronization. Here's what we learned.

### The Problem With Our Old Approach

Our original API was built in 2019 when we had **fewer than 1,000 users**. It worked fine at that scale, but as we grew to over 50,000 active accounts, cracks began to show. Response times crept up. Error rates spiked during peak hours. Our on-call engineers were getting paged *constantly*.

The root cause? We'd designed for consistency over availability. Every request waited for full database synchronization before responding. This was fine when latency didn't matter, but modern users expect sub-100ms responses.

> "The best time to fix your architecture was three years ago. The second best time is now."

### Our New Architecture

We moved to an event-driven model using a combination of techniques:

1. **Optimistic updates** — Return success immediately, sync in background
2. **Event sourcing** — Store changes as immutable events, not mutable state
3. **CQRS** — Separate read and write paths for better scaling

Here's a simplified version of our event handler:

\`\`\`typescript
async function handleEvent(event: UserEvent) {
  // Persist event immediately
  await eventStore.append(event);
  
  // Update read model asynchronously
  await queue.publish('projections', {
    eventId: event.id,
    type: event.type,
    payload: event.data
  });
  
  return { success: true, eventId: event.id };
}
\`\`\`

### Results So Far

After two months in production, the numbers speak for themselves. P99 latency dropped from 850ms to 45ms. Our error rate during peak traffic went from 2.3% down to 0.04%. Most importantly, our engineers are sleeping through the night again.

The migration wasn't painless—we'll cover the challenges in a follow-up post—but the architectural investment has already paid dividends.
`;

// =============================================================================
// FONT LOADER HOOK
// =============================================================================

function useDynamicFont(fontName: string) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fontName.trim()) {
      setLoaded(false);
      setError(false);
      return;
    }

    // Check if font is already loaded
    const existingLink = document.querySelector(`link[data-font="${fontName}"]`);
    if (existingLink) {
      setLoaded(true);
      return;
    }

    setLoaded(false);
    setError(false);

    // Create link element for Google Fonts
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      fontName
    )}:wght@400;500;600;700&display=swap`;
    link.setAttribute("data-font", fontName);

    link.onload = () => setLoaded(true);
    link.onerror = () => setError(true);

    document.head.appendChild(link);

    // Cleanup is intentionally omitted to keep fonts loaded for comparison
  }, [fontName]);

  return { loaded, error };
}

// =============================================================================
// PREVIEW PANEL COMPONENT
// =============================================================================

interface PreviewPanelProps {
  pairing: FontPairing;
  display: DisplayMode;
  label: string;
}

function PreviewPanel({ pairing, display, label }: PreviewPanelProps) {
  const { loaded: textLoaded, error: textError } = useDynamicFont(pairing.textFont);
  const { loaded: codeLoaded, error: codeError } = useDynamicFont(pairing.codeFont);

  const colors = DISPLAY_MODES[display];

  const textFontFamily = pairing.textFont
    ? `"${pairing.textFont}", Georgia, serif`
    : "Georgia, serif";
  const codeFontFamily = pairing.codeFont
    ? `"${pairing.codeFont}", monospace`
    : "monospace";

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div 
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{
          backgroundColor: colors.bg,
          color: colors.fg,
          borderColor: colors.border,
        }}
      >
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2 text-xs" style={{ opacity: 0.7 }}>
          <span className={cn(textLoaded ? "text-green-500" : textError ? "text-red-500" : "text-amber-500")}>
            {pairing.textFont || "No text font"}
          </span>
          <span>/</span>
          <span className={cn(codeLoaded ? "text-green-600" : codeError ? "text-red-500" : "text-amber-500")}>
            {pairing.codeFont || "No code font"}
          </span>
        </div>
      </div>

      {/* Preview Content */}
      <div
        className="flex-1 overflow-y-auto p-8"
        style={{
          backgroundColor: colors.bg,
          color: colors.fg,
        }}
      >
        <div
          className="max-w-2xl mx-auto prose-reader"
          style={{ fontFamily: textFontFamily, color: colors.fg }}
        >
          {parseContent(SAMPLE_CONTENT, codeFontFamily, colors)}
        </div>
      </div>
    </div>
  );
}

// Parse content including code blocks
function parseContent(
  content: string,
  codeFontFamily: string,
  colors: { bg: string; fg: string; codeBg: string; codeFg: string; border: string }
): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0;
  let keyCounter = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block start
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++; // Skip opening fence
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing fence

      result.push(
        <pre
          key={keyCounter++}
          className="rounded-lg p-4 my-4 overflow-x-auto text-sm"
          style={{
            backgroundColor: colors.codeBg,
            color: colors.codeFg,
            fontFamily: codeFontFamily,
          }}
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Heading 2
    if (line.startsWith("## ")) {
      result.push(
        <h2 key={keyCounter++} className="text-2xl font-bold mt-8 mb-4 first:mt-0" style={{ color: colors.fg }}>
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // Heading 3
    if (line.startsWith("### ")) {
      result.push(
        <h3 key={keyCounter++} className="text-xl font-semibold mt-6 mb-3" style={{ color: colors.fg }}>
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      result.push(
        <blockquote
          key={keyCounter++}
          className="border-l-4 pl-4 italic my-4"
          style={{ borderColor: colors.fg + "40", opacity: 0.8, color: colors.fg }}
        >
          {line.slice(2)}
        </blockquote>
      );
      i++;
      continue;
    }

    // List item
    if (line.match(/^\d+\.\s/)) {
      result.push(
        <li key={keyCounter++} className="ml-6 my-1" style={{ listStyleType: "decimal", color: colors.fg }}>
          {parseInlineFormatting(line.slice(line.indexOf(" ") + 1), codeFontFamily, colors)}
        </li>
      );
      i++;
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph
    result.push(
      <p key={keyCounter++} className="my-4 leading-relaxed" style={{ color: colors.fg }}>
        {parseInlineFormatting(line, codeFontFamily, colors)}
      </p>
    );
    i++;
  }

  return result;
}

// Parse inline formatting (**bold**, *italic*, `code`)
function parseInlineFormatting(
  text: string,
  codeFontFamily: string,
  colors: { bg: string; fg: string; codeBg: string; codeFg: string; border: string }
): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let remaining = text;
  let keyCounter = 0;

  while (remaining.length > 0) {
    // Check for bold
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      result.push(<strong key={keyCounter++}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Check for italic
    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      result.push(<em key={keyCounter++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Check for inline code
    const codeMatch = remaining.match(/^`(.+?)`/);
    if (codeMatch) {
      result.push(
        <code
          key={keyCounter++}
          className="px-1.5 py-0.5 rounded text-sm"
          style={{
            fontFamily: codeFontFamily,
            backgroundColor: colors.codeBg,
            color: colors.codeFg,
          }}
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Regular text - take characters until next special char
    const nextSpecial = remaining.search(/[\*`]/);
    if (nextSpecial === -1) {
      result.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // Single special char, not part of formatting
      result.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      result.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return result;
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function FontPlaygroundPage() {
  const [display, setDisplay] = useState<DisplayMode>("light");
  const [pairingA, setPairingA] = useState<FontPairing>({
    textFont: "Libre Baskerville",
    codeFont: "JetBrains Mono",
  });
  const [pairingB, setPairingB] = useState<FontPairing>({
    textFont: "Plus Jakarta Sans",
    codeFont: "Fira Code",
  });
  const [copied, setCopied] = useState(false);

  const handleCopyConfig = useCallback(() => {
    const config = `// Typography theme configuration
const textFont = "${pairingA.textFont}";
const codeFont = "${pairingA.codeFont}";

// CSS variables
--font-text: "${pairingA.textFont}", Georgia, serif;
--font-code: "${pairingA.codeFont}", monospace;`;

    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pairingA]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Font Playground</h1>
              <p className="text-sm text-muted-foreground">
                Experiment with Google Font pairings for the reader
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Display Mode Toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                {(Object.keys(DISPLAY_MODES) as DisplayMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDisplay(mode)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-md transition-colors capitalize",
                      display === mode
                        ? "bg-background shadow-sm font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Copy Config */}
              <Button variant="outline" size="sm" onClick={handleCopyConfig}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Config
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Font Inputs */}
          <div className="grid grid-cols-2 gap-6">
            {/* Pairing A */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary">Pairing A</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => setPairingA({ textFont: BODY_FONTS[0].name, codeFont: CODE_FONTS[0].name })}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Text Font</Label>
                  <Select
                    value={pairingA.textFont}
                    onValueChange={(value) => setPairingA((p) => ({ ...p, textFont: value }))}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Serif</div>
                      {BODY_FONTS.filter(f => f.category === "serif").map((font) => (
                        <SelectItem key={font.name} value={font.name}>
                          {font.name}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-1">Sans-Serif</div>
                      {BODY_FONTS.filter(f => f.category === "sans").map((font) => (
                        <SelectItem key={font.name} value={font.name}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Code Font</Label>
                  <Select
                    value={pairingA.codeFont}
                    onValueChange={(value) => setPairingA((p) => ({ ...p, codeFont: value }))}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {CODE_FONTS.map((font) => (
                        <SelectItem key={font.name} value={font.name}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Pairing B */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Pairing B</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => setPairingB({ textFont: BODY_FONTS[10].name, codeFont: CODE_FONTS[1].name })}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Text Font</Label>
                  <Select
                    value={pairingB.textFont}
                    onValueChange={(value) => setPairingB((p) => ({ ...p, textFont: value }))}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Serif</div>
                      {BODY_FONTS.filter(f => f.category === "serif").map((font) => (
                        <SelectItem key={font.name} value={font.name}>
                          {font.name}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-1">Sans-Serif</div>
                      {BODY_FONTS.filter(f => f.category === "sans").map((font) => (
                        <SelectItem key={font.name} value={font.name}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Code Font</Label>
                  <Select
                    value={pairingB.codeFont}
                    onValueChange={(value) => setPairingB((p) => ({ ...p, codeFont: value }))}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {CODE_FONTS.map((font) => (
                        <SelectItem key={font.name} value={font.name}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Side-by-side Preview */}
      <div className="flex-1 grid grid-cols-2 divide-x">
        <PreviewPanel pairing={pairingA} display={display} label="Pairing A" />
        <PreviewPanel pairing={pairingB} display={display} label="Pairing B" />
      </div>
    </div>
  );
}

