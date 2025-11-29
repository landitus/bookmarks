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
    <div className="w-64 border-r bg-muted/10 h-screen p-4 flex flex-col gap-4 fixed left-0 top-0">
      <div className="font-semibold text-xl px-4 py-2 tracking-tight">
        Portable
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              asChild
              className={cn("justify-start", isActive && "font-medium")}
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="mt-4">
        <h4 className="px-4 text-xs font-semibold text-muted-foreground mb-2">
          PROJECTS
        </h4>
        <nav className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="justify-start text-muted-foreground"
          >
            <Link href="/projects">
              <Folder className="mr-2 h-4 w-4" />
              All Projects
            </Link>
          </Button>
        </nav>
      </div>

      <div className="mt-auto px-2">
        <UserMenu user={user} />
      </div>
    </div>
  );
}
