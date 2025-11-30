"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout, updateTheme } from "@/lib/actions/auth";
import { LogOut, Settings, User, Sun, Moon, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
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

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only showing theme selection after mount
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    await updateTheme(newTheme);
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

        <div className="px-2 py-2">
          <ButtonGroup orientation="horizontal" className="w-full">
            <Button
              variant={mounted && theme === "light" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => handleThemeChange("light")}
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              variant={mounted && theme === "dark" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => handleThemeChange("dark")}
            >
              <Moon className="h-4 w-4" />
            </Button>
            <Button
              variant={mounted && theme === "system" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => handleThemeChange("system")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </ButtonGroup>
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
        </div>

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
