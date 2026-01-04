"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// =============================================================================
// TYPES
// =============================================================================

export type ReaderTheme = "literary" | "modern" | "editorial";
export type ReaderDisplay = "light" | "amber" | "dark";

export interface ReaderSettings {
  theme: ReaderTheme;
  display: ReaderDisplay;
}

interface ReaderSettingsContextValue {
  settings: ReaderSettings;
  setTheme: (theme: ReaderTheme) => void;
  setDisplay: (display: ReaderDisplay) => void;
  isLoaded: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = "portable:reader-settings";

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: "literary",
  display: "light",
};

// Theme display names and descriptions
export const THEME_OPTIONS: Record<
  ReaderTheme,
  { name: string; description: string; textFont: string; codeFont: string }
> = {
  literary: {
    name: "Literary",
    description: "Classic, book-like",
    textFont: "Libre Baskerville",
    codeFont: "JetBrains Mono",
  },
  modern: {
    name: "Modern",
    description: "Clean, contemporary",
    textFont: "Plus Jakarta Sans",
    codeFont: "Fira Code",
  },
  editorial: {
    name: "Editorial",
    description: "Warm, journalistic",
    textFont: "Newsreader",
    codeFont: "IBM Plex Mono",
  },
};

export const DISPLAY_OPTIONS: Record<
  ReaderDisplay,
  { name: string; bgColor: string; fgColor: string }
> = {
  light: {
    name: "Light",
    bgColor: "#ffffff",
    fgColor: "#1a1a1a",
  },
  amber: {
    name: "Amber",
    bgColor: "#FBF7F0",
    fgColor: "#433422",
  },
  dark: {
    name: "Dark",
    bgColor: "#1a1a1a",
    fgColor: "#e5e5e5",
  },
};

// =============================================================================
// CONTEXT
// =============================================================================

const ReaderSettingsContext = createContext<ReaderSettingsContextValue | null>(
  null
);

// =============================================================================
// PROVIDER
// =============================================================================

interface ReaderSettingsProviderProps {
  children: ReactNode;
}

export function ReaderSettingsProvider({
  children,
}: ReaderSettingsProviderProps) {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ReaderSettings>;
        setSettings({
          theme: parsed.theme ?? DEFAULT_SETTINGS.theme,
          display: parsed.display ?? DEFAULT_SETTINGS.display,
        });
      }
    } catch (error) {
      console.error("Failed to load reader settings:", error);
    }
    setIsLoaded(true);
  }, []);

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to save reader settings:", error);
      }
    }
  }, [settings, isLoaded]);

  const setTheme = useCallback((theme: ReaderTheme) => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const setDisplay = useCallback((display: ReaderDisplay) => {
    setSettings((prev) => ({ ...prev, display }));
  }, []);

  return (
    <ReaderSettingsContext.Provider
      value={{ settings, setTheme, setDisplay, isLoaded }}
    >
      {children}
    </ReaderSettingsContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useReaderSettings() {
  const context = useContext(ReaderSettingsContext);
  if (!context) {
    throw new Error(
      "useReaderSettings must be used within a ReaderSettingsProvider"
    );
  }
  return context;
}

