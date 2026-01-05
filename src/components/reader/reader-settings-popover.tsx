"use client";

import { Settings2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useReaderSettings,
  THEME_OPTIONS,
  DISPLAY_OPTIONS,
  type ReaderTheme,
  type ReaderDisplay,
} from "./reader-settings-provider";
import { cn } from "@/lib/utils";

// =============================================================================
// DISPLAY MODE ICONS
// =============================================================================

function LightIcon({ className }: { className?: string }) {
  return <Sun className={className} />;
}

function AmberIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function DarkIcon({ className }: { className?: string }) {
  return <Moon className={className} />;
}

// =============================================================================
// THEME OPTION COMPONENT
// =============================================================================

interface ThemeOptionProps {
  theme: ReaderTheme;
  isSelected: boolean;
  onClick: () => void;
}

// Map theme to CSS font variable for preview
const FONT_FAMILY_MAP: Record<ReaderTheme, string> = {
  literary: "var(--font-literary-text), system-ui, sans-serif",
  modern: "var(--font-modern-text), Georgia, serif",
  editorial: "var(--font-editorial-text), Georgia, serif",
};

function ThemeOption({ theme, isSelected, onClick }: ThemeOptionProps) {
  const option = THEME_OPTIONS[theme];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all flex-1",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <span
        className="text-xl font-medium leading-none"
        style={{ fontFamily: FONT_FAMILY_MAP[theme] }}
      >
        Abc
      </span>
      <span className="text-xs font-medium">{option.name}</span>
    </button>
  );
}

// =============================================================================
// DISPLAY MODE OPTION COMPONENT
// =============================================================================

interface DisplayOptionProps {
  display: ReaderDisplay;
  isSelected: boolean;
  onClick: () => void;
}

function DisplayOption({ display, isSelected, onClick }: DisplayOptionProps) {
  const option = DISPLAY_OPTIONS[display];

  const IconComponent =
    display === "light" ? LightIcon : display === "amber" ? AmberIcon : DarkIcon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all flex-1",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: option.bgColor, color: option.fgColor }}
      >
        <IconComponent className="h-4 w-4" />
      </div>
      <span className="text-xs font-medium">{option.name}</span>
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ReaderSettingsPopover() {
  const { settings, setTheme, setDisplay } = useReaderSettings();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Reader settings"
          className="hidden sm:flex"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end" sideOffset={8}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Reader Settings</h3>
          </div>

          {/* Display Mode */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Display
            </label>
            <div className="flex gap-2">
              {(Object.keys(DISPLAY_OPTIONS) as ReaderDisplay[]).map(
                (display) => (
                  <DisplayOption
                    key={display}
                    display={display}
                    isSelected={settings.display === display}
                    onClick={() => setDisplay(display)}
                  />
                )
              )}
            </div>
          </div>

          {/* Typography Theme */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Typography
            </label>
            <div className="flex gap-2">
              {(Object.keys(THEME_OPTIONS) as ReaderTheme[]).map((theme) => (
                <ThemeOption
                  key={theme}
                  theme={theme}
                  isSelected={settings.theme === theme}
                  onClick={() => setTheme(theme)}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

