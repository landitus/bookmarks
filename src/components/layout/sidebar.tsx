"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, Clock, Folder, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/everything", label: "Everything", icon: BookMarked },
    { href: "/later", label: "Later", icon: Clock },
    { href: "/favorites", label: "Favorites", icon: Star },
  ];

  return (
    <div className="w-64 border-r border-zinc-200 dark:border-zinc-900 bg-muted/50 h-screen p-4 flex flex-col gap-4 fixed left-0 top-0">
      <div className="flex items-center justify-between px-2 py-1">
        <Link
          href="/everything"
          className="w-7 h-7 bg-neutral-900 rounded-lg flex items-center justify-center"
        >
          <span className="text-white font-bold text-sm">P</span>
        </Link>
        <UserMenu user={user} />
      </div>

      <nav className="flex flex-col gap-0.5 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              asChild
              className={cn(
                "justify-start hover:bg-accent",
                isActive && "font-medium"
              )}
            >
              <Link href={item.href}>
                <item.icon className="mr-0.5 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="mt-4">
        <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          Projects
        </h4>
        <nav className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="justify-start text-muted-foreground"
          >
            <Link href="/projects">
              <Folder className="mr-1 h-4 w-4" />
              All Projects
            </Link>
          </Button>
        </nav>
      </div>
    </div>
  );
}
