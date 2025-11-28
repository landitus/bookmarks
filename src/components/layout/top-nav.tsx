"use client";

import { UserMenu } from "@/components/layout/user-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookMarked, ChevronsUpDown, Inbox, Layers2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TopNavProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export function TopNav({ user }: TopNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/inbox", label: "Inbox", icon: Inbox },
    { href: "/queue", label: "Queue", icon: Layers2 },
    { href: "/library", label: "Library", icon: BookMarked },
  ];

  const activeItem =
    navItems.find((item) => pathname === item.href) || navItems[0];
  const ActiveIcon = activeItem.icon;

  return (
    <header className="sticky top-0 z-50 w-full  bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="relative flex h-16 items-center px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className="flex items-center gap-2 font-bold text-xl"
          >
            <div className="h-6 w-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="hidden md:inline">Portable</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation Dropdown */}
        <div className="md:hidden absolute left-1/2 -translate-x-1/2">
          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "gap-1",
                  mobileMenuOpen && "bg-accent text-accent-foreground"
                )}
              >
                {ActiveIcon && <ActiveIcon className="h-4 w-4" />}
                <span className="text-sm font-medium">{activeItem.label}</span>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "w-full flex items-center gap-2",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
