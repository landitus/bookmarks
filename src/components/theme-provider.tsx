"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";
import { getTheme } from "@/lib/actions/auth";
import type { Theme } from "@/lib/types";

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { setTheme: setNextTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load theme from user profile and sync with next-themes
    const loadTheme = async () => {
      try {
        const theme = await getTheme();
        if (theme) {
          setNextTheme(theme);
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      } finally {
        setMounted(true);
      }
    };

    loadTheme();
  }, [setNextTheme]);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
    >
      <ThemeSync>{children}</ThemeSync>
    </NextThemesProvider>
  );
}

