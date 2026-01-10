"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  logout,
  getApiKey,
  regenerateApiKey,
  updateTheme,
} from "@/lib/actions/auth";
import {
  LogOut,
  Settings,
  User,
  Key,
  Copy,
  RefreshCw,
  Check,
  Sun,
  Moon,
  Monitor,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Theme } from "@/lib/types";

interface UserMenuProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const { theme, setTheme } = useTheme();

  // Load API key when dropdown opens and API key section is shown
  useEffect(() => {
    if (open && showApiKey && !apiKey) {
      getApiKey().then(setApiKey);
    }
  }, [open, showApiKey, apiKey]);

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      await updateTheme(newTheme);
    } catch {
      toast.error("Failed to save theme preference");
    }
  };

  const handleCopyApiKey = () => {
    if (!apiKey) return;

    // Use a textarea element for copying
    const textArea = document.createElement("textarea");
    textArea.value = apiKey;

    // Make it invisible but part of the document
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.setAttribute("readonly", "");

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const success = document.execCommand("copy");
      if (success) {
        setCopied(true);
        toast.success("API key copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error("Failed to copy");
      }
    } catch (err) {
      console.error("Copy failed:", err);
      toast.error("Failed to copy to clipboard");
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleRegenerateApiKey = async () => {
    setRegenerating(true);
    try {
      const newKey = await regenerateApiKey();
      setApiKey(newKey);
      toast.success("API key regenerated");
    } catch {
      toast.error("Failed to regenerate API key");
    } finally {
      setRegenerating(false);
    }
  };

  // Helper to format name like "Fernando Carrettoni"
  const getDisplayName = () => {
    if (user.user_metadata?.full_name) return user.user_metadata.full_name;

    // Fallback: Format email (e.g. fernando@ -> Fernando)
    const emailName = user.email?.split("@")[0] || "User";
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  };

  const displayName = getDisplayName();

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "group justify-start gap-3 h-7 w-7 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 ease-in-out rounded-full",
            open && "bg-zinc-100 dark:bg-zinc-800"
          )}
        >
          <Avatar className="h-7 w-7 transition-transform duration-200 group-hover:scale-105 ring-1 ring-zinc-200 dark:ring-zinc-700">
            <AvatarImage
              src={user.user_metadata?.avatar_url}
              alt={displayName}
            />
            <AvatarFallback className="bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-medium text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 p-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl rounded-lg"
        align="end"
        side="bottom"
        sideOffset={6}
        alignOffset={0}
      >
        <div className="px-2 py-2 mb-1">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 ring-1 ring-zinc-200 dark:ring-zinc-700">
              <AvatarImage
                src={user.user_metadata?.avatar_url}
                alt={displayName}
              />
              <AvatarFallback className="bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {displayName}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 mx-2" />

        <div className="p-1">
          <DropdownMenuItem>
            <User />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/apps">
              <Smartphone />
              Apps & Integrations
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setShowApiKey(!showApiKey);
            }}
          >
            <Key />
            API Key
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 mx-2" />

        {/* Theme Switcher */}
        <div className="px-3 py-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Theme</p>
          <div className="flex items-center gap-1">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {showApiKey && (
          <>
            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 mx-2" />
            <div className="px-3 py-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                Use this key to save links from the browser extension or mobile
                app.
              </p>
              <div className="flex items-center gap-1.5">
                <Input
                  readOnly
                  value={apiKey || "Loading..."}
                  className="h-8 text-xs font-mono bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyApiKey();
                  }}
                  disabled={!apiKey}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRegenerateApiKey();
                  }}
                  disabled={regenerating}
                  title="Regenerate API key"
                >
                  <RefreshCw
                    className={cn(
                      "h-3.5 w-3.5",
                      regenerating && "animate-spin"
                    )}
                  />
                </Button>
              </div>
            </div>
          </>
        )}

        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 mx-2" />

        <div className="p-1">
          <DropdownMenuItem
            variant="destructive"
            onSelect={async (e) => {
              e.preventDefault();
              await logout();
            }}
          >
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
