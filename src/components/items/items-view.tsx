"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { Item } from "@/lib/types";
import {
  Star,
  Loader2,
  Copy,
  Pencil,
  ExternalLink,
  BookmarkCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemContext } from "@/components/items/item-actions";
import Link from "next/link";
import Image from "next/image";
import { AddItemInput } from "./add-item-input";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { keepItem, deleteItem } from "@/lib/actions/items";
import { toast } from "sonner";

// =============================================================================
// TYPES
// =============================================================================

interface ItemsViewProps {
  items: Item[]; // Array of bookmark items to display
  emptyState?: React.ReactNode; // Custom empty state component
  /** Context for item actions (inbox, library, archive) */
  context?: ItemContext;
  /** Show favorites filter toggle (for Library view) */
  showFavoritesFilter?: boolean;
  /** Whether favorites filter is active */
  favoritesOnly?: boolean;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Format date as short string like "Jan 20" for current year, or "Jan 20, 2024" for previous years
 */
function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isCurrentYear = date.getFullYear() === now.getFullYear();

  if (isCurrentYear) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}

// =============================================================================
// LIST ITEM COMPONENT
// =============================================================================

interface ListItemProps {
  item: Item;
  context: ItemContext;
  getDomain: (url: string) => string;
  getFaviconUrl: (url: string) => string;
}

function ListItem({ item, context, getDomain, getFaviconUrl }: ListItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      toast.success("Link copied");
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link");
    }
  };

  const handleKeep = () => {
    startTransition(async () => {
      await keepItem(item.id);
      toast.success("Kept to Library");
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteItem(item.id);
      toast.success("Deleted");
    });
  };

  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-4 p-1 min-h-11 rounded-xl hover:bg-accent/50 transition-colors pl-4",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      {/* Left side: Favicon + Title + Domain + Badges */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Image
          src={getFaviconUrl(item.url)}
          alt=""
          width={16}
          height={16}
          className="w-4 h-4 shrink-0"
          unoptimized
        />

        <HoverCard openDelay={300} closeDelay={100}>
          <HoverCardTrigger asChild>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sm truncate"
            >
              {item.title}
            </a>
          </HoverCardTrigger>
          <HoverCardContent
            side="bottom"
            align="start"
            className="w-64 p-0 overflow-hidden rounded-lg shadow-xs"
          >
            {/* Preview image */}
            {item.image_url && (
              <div className="relative aspect-video bg-muted">
                <Image
                  src={item.image_url}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            {/* Content */}
            <div className="p-3 space-y-2">
              <h4 className="font-semibold leading-tight line-clamp-2">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {item.description}
                </p>
              )}
              {/* Source */}
              <div className="flex items-center gap-2 pt-1">
                <Image
                  src={getFaviconUrl(item.url)}
                  alt=""
                  width={14}
                  height={14}
                  className="w-3.5 h-3.5"
                  unoptimized
                />
                <span className="text-xs text-muted-foreground">
                  {getDomain(item.url)}
                </span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        <span className="hidden md:inline text-sm text-muted-foreground shrink-0">
          {getDomain(item.url)}
        </span>

        {/* Processing indicator */}
        {(item.processing_status === "pending" ||
          item.processing_status === "processing") && (
          <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0 bg-muted px-1.5 py-0.5 rounded">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="hidden sm:inline">Processing</span>
          </span>
        )}
      </div>

      {/* Right side: Date at rest, actions on hover */}
      <div className="shrink-0 flex items-center gap-0.5">
        {/* Date - visible at rest, hidden on hover */}
        <span
          className={cn(
            "text-sm text-muted-foreground pr-2",
            "group-hover:opacity-0 group-hover:hidden"
          )}
        >
          {formatShortDate(item.created_at)}
        </span>

        {/* Actions - hidden at rest, visible on hover */}
        <div className="hidden group-hover:flex items-center gap-0.5">
          {/* Edit (placeholder) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Edit"
            disabled
          >
            <Pencil className="h-4 w-4" />
          </Button>

          {/* Copy link */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopyLink}
            title="Copy link"
          >
            <Copy className="h-4 w-4" />
          </Button>

          {/* Open link */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            asChild
            title="Open link"
          >
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>

          {/* Keep (only for inbox items) */}
          {context === "inbox" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleKeep}
              title="Keep to Library"
            >
              <BookmarkCheck className="h-4 w-4" />
            </Button>
          )}

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ItemsView({
  items,
  emptyState,
  context = "inbox",
  showFavoritesFilter = false,
  favoritesOnly = false,
}: ItemsViewProps) {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState(""); // Search filter text
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // REALTIME SUBSCRIPTION - Auto-refresh when items change (e.g., from extension)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function setupRealtimeSubscription() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Subscribe to changes on the items table filtered by user_id
      channel = supabase
        .channel("items-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "items",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("[Realtime] Item change detected:", payload.eventType);
            router.refresh();
          }
        )
        .subscribe((status) => {
          console.log("[Realtime] Subscription status:", status);
        });
    }

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [router]);

  // ---------------------------------------------------------------------------
  // POLLING FALLBACK - When items are processing, poll every 3s as backup
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const hasProcessingItems = items.some(
      (i) =>
        i.processing_status === "pending" ||
        i.processing_status === "processing"
    );

    if (!hasProcessingItems) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [items, router]);

  // ---------------------------------------------------------------------------
  // HELPER FUNCTIONS
  // ---------------------------------------------------------------------------

  // Extract clean domain from URL (removes "www." prefix)
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  // Get favicon URL using Google's favicon service
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return "";
    }
  };

  // ---------------------------------------------------------------------------
  // FILTERED ITEMS (for search)
  // ---------------------------------------------------------------------------

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title?.toLowerCase().includes(query) ||
        item.url?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // ---------------------------------------------------------------------------
  // GROUPED ITEMS (for Inbox list view)
  // ---------------------------------------------------------------------------

  // Group items by relative date: Today, Yesterday, This week, This month, This year, or year
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: Item[] } = {};

    // Helper function to get the start of the week (Monday)
    const getStartOfWeek = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      return new Date(d.setDate(diff));
    };

    // Helper function to check if two dates are in the same week
    const isSameWeek = (date1: Date, date2: Date) => {
      const week1 = getStartOfWeek(date1);
      const week2 = getStartOfWeek(date2);
      return (
        week1.getFullYear() === week2.getFullYear() &&
        week1.getMonth() === week2.getMonth() &&
        week1.getDate() === week2.getDate()
      );
    };

    // Group each item into date buckets
    filteredItems.forEach((item) => {
      const date = new Date(item.created_at);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      let key = "";

      // Check Today
      if (date.toDateString() === now.toDateString()) {
        key = "Today";
      }
      // Check Yesterday
      else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
      }
      // Check This week (same week as today, but not today or yesterday)
      else if (
        isSameWeek(date, now) &&
        date.getFullYear() === now.getFullYear()
      ) {
        key = "This week";
      }
      // Check This month (same month and year as today, but not this week)
      else if (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      ) {
        key = "This month";
      }
      // Check This year (same year as today, but not this month)
      else if (date.getFullYear() === now.getFullYear()) {
        key = "This year";
      }
      // Otherwise, group by year
      else {
        key = date.getFullYear().toString();
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    // Sort items within each group by date (newest first)
    Object.keys(groups).forEach((key) => {
      groups[key].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return groups;
  }, [filteredItems]);

  // Sort group keys: Today first, then Yesterday, then This week, This month, This year, then years descending
  const sortedGroupKeys = useMemo(() => {
    const keys = Object.keys(groupedItems);
    const order = [
      "Today",
      "Yesterday",
      "This week",
      "This month",
      "This year",
    ];

    return keys.sort((a, b) => {
      // Check if either key is in the predefined order
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);

      // If both are in the order, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only A is in the order, it comes first
      if (indexA !== -1) return -1;

      // If only B is in the order, it comes first
      if (indexB !== -1) return 1;

      // Both are years (or other), sort descending (newer years first)
      const yearA = parseInt(a);
      const yearB = parseInt(b);

      // If both are valid years, sort descending
      if (!isNaN(yearA) && !isNaN(yearB)) {
        return yearB - yearA;
      }

      // Fallback: sort by most recent item in group
      const dateA = new Date(groupedItems[a][0].created_at).getTime();
      const dateB = new Date(groupedItems[b][0].created_at).getTime();
      return dateB - dateA;
    });
  }, [groupedItems]);

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {/* TOOLBAR: Search input + Filters */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex-1">
            <AddItemInput onSearch={setSearchQuery} />
          </div>

          {/* Favorites filter (Library only) */}
          {showFavoritesFilter && (
            <div className="flex items-center gap-4">
              <Button
                variant={favoritesOnly ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
                asChild
              >
                <Link
                  href={favoritesOnly ? "/library" : "/library?favorites=true"}
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      favoritesOnly && "fill-yellow-400 text-yellow-400"
                    )}
                  />
                  <span className="hidden sm:inline">Favorites</span>
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* CONTENT: Empty state or List view */}
        {items.length === 0 ? (
          emptyState || (
            <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
              <p>No items found.</p>
            </div>
          )
        ) : context === "inbox" ? (
          // LIST VIEW - GROUPED BY DATE (for Inbox)
          <div className="space-y-8">
            {sortedGroupKeys.map((groupKey) => (
              <div key={groupKey} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground pl-2">
                  {groupKey}
                </h3>
                <div className="space-y-0">
                  {groupedItems[groupKey].map((item) => (
                    <ListItem
                      key={item.id}
                      item={item}
                      context={context}
                      getDomain={getDomain}
                      getFaviconUrl={getFaviconUrl}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // LIST VIEW - FLAT (for Library and Archive, sorted by kept_at/archived_at)
          <div className="space-y-0">
            {filteredItems.map((item) => (
              <ListItem
                key={item.id}
                item={item}
                context={context}
                getDomain={getDomain}
                getFaviconUrl={getFaviconUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
