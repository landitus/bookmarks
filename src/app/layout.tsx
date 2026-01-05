import type { Metadata, Viewport } from "next";
import {
  Inter,
  Literata,
  Fira_Code,
  IBM_Plex_Mono,
} from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// =============================================================================
// APP BASE FONTS
// =============================================================================

// Inter for app UI and Modern reader theme
const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Also expose Inter for reader Modern theme
const interReader = Inter({
  variable: "--font-literary-text",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// App mono font (also used for Modern reader theme code)
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Also expose for reader Modern theme
const ibmPlexMonoReader = IBM_Plex_Mono({
  variable: "--font-literary-code",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// =============================================================================
// READER TYPOGRAPHY FONTS
// =============================================================================

// Modern theme: Contemporary serif for text, ligature-friendly mono for code
const literata = Literata({
  variable: "--font-modern-text",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const firaCode = Fira_Code({
  variable: "--font-modern-code",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Terminal theme: Monospace throughout for code editor experience
const ibmPlexMonoTerminal = IBM_Plex_Mono({
  variable: "--font-editorial-text",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const ibmPlexMonoTerminalCode = IBM_Plex_Mono({
  variable: "--font-editorial-code",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Use different favicon for local development
function getFavicon() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const isLocalDev =
    supabaseUrl.includes("127.0.0.1") || supabaseUrl.includes("localhost");
  return isLocalDev ? "/favicon-local.svg" : "/favicon.svg";
}

export const metadata: Metadata = {
  title: "Portable",
  description: "A little pocket for the internet things you love",
  manifest: "/manifest.json",
  icons: {
    icon: getFavicon(),
    apple: "/icons/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Portable",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#F59E0B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${interReader.variable} ${ibmPlexMono.variable} ${ibmPlexMonoReader.variable} ${literata.variable} ${firaCode.variable} ${ibmPlexMonoTerminal.variable} ${ibmPlexMonoTerminalCode.variable} antialiased min-h-screen bg-muted/10`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
