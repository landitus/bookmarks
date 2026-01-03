"use client";

import { UserMenu } from "@/components/layout/user-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// =============================================================================
// TYPES
// =============================================================================

interface AppHeaderProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  /** Content to render in the center of the header */
  center?: ReactNode;
  /** Additional actions to render before the user menu */
  actions?: ReactNode;
  /** Whether to show a bottom border */
  bordered?: boolean;
  /** Additional className for the header */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Shared app header with consistent logo and user menu positioning.
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  [P] Portable  │      [center]           │  [actions]  👤   │
 * └─────────────────────────────────────────────────────────────┘
 */
export function AppHeader({
  user,
  center,
  actions,
  bordered = false,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        bordered && "border-b",
        className
      )}
    >
      <div className="relative flex h-14 items-center px-4 md:px-4">
        {/* Left: Logo - Always the same */}
        <div className="flex items-center">
          <Link
            href="/everything"
            className="flex items-center gap-2 font-bold text-xl"
          >
            <div className="h-6 w-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="hidden sm:inline">Portable</span>
          </Link>
        </div>

        {/* Center: Custom content (nav, source domain, etc.) */}
        {center && (
          <div className="absolute left-1/2 -translate-x-1/2">{center}</div>
        )}

        {/* Right: Actions + User Menu - Always the same position */}
        <div className="ml-auto flex items-center gap-2">
          {actions}
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}






