"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/auth";
import { LogOut, Settings, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
            Account
          </p>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-1 ring-zinc-200 dark:ring-zinc-700">
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
          <DropdownMenuItem className="group flex items-center gap-2 px-2 py-2 text-sm text-zinc-600 dark:text-zinc-300 rounded-lg cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 transition-colors">
            <User className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="group flex items-center gap-2 px-2 py-2 text-sm text-zinc-600 dark:text-zinc-300 rounded-lg cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 transition-colors">
            <Settings className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="group flex items-center gap-2 px-2 py-2 text-sm text-zinc-600 dark:text-zinc-300 rounded-lg cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 transition-colors">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Upgrade Plan
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 mx-2" />

        <div className="p-1">
          <DropdownMenuItem
            className="group flex items-center gap-2 px-2 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700 dark:focus:text-red-300 transition-colors"
            onSelect={async (e) => {
              e.preventDefault();
              await logout();
            }}
          >
            <LogOut className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
