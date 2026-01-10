"use client";

import { Header } from "@/components/layout/header";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Archive, BookMarked, Check, ChevronsUpDown, Inbox } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

const navItems = [
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/library", label: "Library", icon: BookMarked },
  { href: "/archive", label: "Archive", icon: Archive },
];

function NavigationCenter() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeItem =
    navItems.find((item) => pathname.startsWith(item.href)) || navItems[0];
  const ActiveIcon = activeItem.icon;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
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
      <div className="md:hidden">
        <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
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
              const isActive = pathname.startsWith(item.href);
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
                    {isActive && <Check className="h-4 w-4 ml-auto" />}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

export function Nav({ user }: NavProps) {
  return <Header user={user} center={<NavigationCenter />} />;
}
