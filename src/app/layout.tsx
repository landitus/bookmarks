import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Literata,
  Newsreader,
  Fira_Code,
  IBM_Plex_Mono,
  Source_Code_Pro,
} from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// =============================================================================
// READER TYPOGRAPHY FONTS
// =============================================================================

// Literary theme: Clean sans for text, humanist mono for code
const inter = Inter({
  variable: "--font-literary-text",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-literary-code",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

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

// Editorial theme: Warm transitional serif for text, classic mono for code
const newsreader = Newsreader({
  variable: "--font-editorial-text",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const sourceCodePro = Source_Code_Pro({
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
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${ibmPlexMono.variable} ${literata.variable} ${firaCode.variable} ${newsreader.variable} ${sourceCodePro.variable} antialiased min-h-screen bg-muted/10`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
