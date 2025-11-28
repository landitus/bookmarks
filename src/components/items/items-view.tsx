"use client";

import { useState, useMemo } from "react";
import { Item } from "@/lib/types";
import { ItemCard } from "@/components/items/item-card";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ItemActions } from "@/components/items/item-actions";
import Link from "next/link";
import Image from "next/image";
import { AddItemInput } from "./add-item-input";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

// =============================================================================
// TYPES
// =============================================================================

interface ItemsViewProps {
  items: Item[]; // Array of bookmark items to display
  emptyState?: React.ReactNode; // Custom empty state component
  addItemTargetStatus?: "inbox" | "queue" | "library"; // Where new items should be added
}

type ViewType = "gallery" | "list"; // Toggle between card grid and list

// =============================================================================
// COMPONENT
// =============================================================================

export function ItemsView({
  items,
  emptyState,
  addItemTargetStatus,
}: ItemsViewProps) {
  const pathname = usePathname();

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const [view, setView] = useState<ViewType>("list"); // Current view mode
  const [searchQuery, setSearchQuery] = useState(""); // Search filter text
  const [openItemId, setOpenItemId] = useState<string | null>(null); // Track which item's menu is open (for hover state)

  // ---------------------------------------------------------------------------
  // DERIVED VALUES
  // ---------------------------------------------------------------------------

  // Auto-detect target status from URL path if not explicitly provided
  // e.g., /queue -> "queue", /library -> "library", default -> "inbox"
  const targetStatus =
    addItemTargetStatus ||
    (pathname === "/queue"
      ? "queue"
      : pathname === "/library"
      ? "library"
      : "inbox");

  // ---------------------------------------------------------------------------
  // HELPER FUNCTIONS
  // ---------------------------------------------------------------------------

  // Extract clean domain from URL (removes "www." prefix)
  // e.g., "https://www.example.com/page" -> "example.com"
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  // Get favicon URL using Google's favicon service
  // Returns a 32x32 favicon for any domain
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return "";
    }
  };

  // ---------------------------------------------------------------------------
  // GROUPED ITEMS (for list view)
  // ---------------------------------------------------------------------------

  // Group items by relative date: "Today", "Yesterday", or day name (e.g., "Monday")
  // Also applies search filter
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: Item[] } = {};

    // Filter items by search query (matches title, url, or description)
    const filteredItems = items.filter((item) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(query) ||
        item.url?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    });

    // Group each item into date buckets
    filteredItems.forEach((item) => {
      const date = new Date(item.created_at);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      let key = "";

      // Determine the group label
      if (date.toDateString() === now.toDateString()) {
        key = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
      } else {
        key = date.toLocaleDateString("en-US", { weekday: "long" }); // e.g., "Monday"
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
  }, [items, searchQuery]);

  // Sort group keys: Today first, then Yesterday, then by most recent item date
  const sortedGroupKeys = useMemo(() => {
    const keys = Object.keys(groupedItems);
    return keys.sort((a, b) => {
      if (a === "Today") return -1;
      if (b === "Today") return 1;
      if (a === "Yesterday") return -1;
      if (b === "Yesterday") return 1;

      // For other days, sort by the most recent item in each group
      const dateA = new Date(groupedItems[a][0].created_at).getTime();
      const dateB = new Date(groupedItems[b][0].created_at).getTime();
      return dateB - dateA;
    });
  }, [groupedItems]);

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-6">
        {/* ---------------------------------------------------------------------
            TOOLBAR: Search input + View toggle
        --------------------------------------------------------------------- */}
        <div className="flex items-center justify-between gap-4">
          {/* Search/Add input - takes remaining space */}
          <div className="flex-1">
            <AddItemInput
              onSearch={setSearchQuery}
              targetStatus={targetStatus}
            />
          </div>

          {/* View toggle buttons (List | Gallery) */}
          <div className="flex items-center gap-4">
            <ButtonGroup>
              <Button
                variant={view === "list" ? "secondary" : "outline"}
                size="icon"
                onClick={() => setView("list")}
                title="List view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "gallery" ? "secondary" : "outline"}
                size="icon"
                onClick={() => setView("gallery")}
                title="Gallery view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
            CONTENT: Empty state, Gallery view, or List view
        --------------------------------------------------------------------- */}

        {items.length === 0 ? (
          // EMPTY STATE
          // Show custom empty state or default placeholder
          emptyState || (
            <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
              <p>No items found.</p>
            </div>
          )
        ) : view === "gallery" ? (
          // GALLERY VIEW
          // Responsive grid of ItemCards (1-4 columns based on screen width)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          // LIST VIEW
          // Items grouped by date with compact row layout
          <div className="space-y-8">
            {sortedGroupKeys.map((groupKey) => (
              <div key={groupKey} className="space-y-2">
                {/* Date group header (e.g., "Today", "Yesterday", "Monday") */}
                <h3 className="text-sm font-medium text-muted-foreground pl-2">
                  {groupKey}
                </h3>

                {/* Items in this date group */}
                <div className="space-y-0">
                  {groupedItems[groupKey].map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        // Base styles: horizontal layout with hover effect
                        "group flex items-center justify-between gap-4 p-1 rounded-lg hover:bg-accent/50 transition-colors pl-4",
                        // Highlight row when its actions menu is open
                        openItemId === item.id && "bg-accent/50"
                      )}
                    >
                      {/* Left side: Favicon + Title + Domain */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Favicon (16x16, from Google's favicon service) */}
                        <Image
                          src={getFaviconUrl(item.url)}
                          alt=""
                          width={16}
                          height={16}
                          className="w-4 h-4 shrink-0"
                          unoptimized
                        />

                        {/* Title (clickable, opens URL in new tab) */}
                        <Link
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium truncate hover:underline"
                          title={item.title}
                        >
                          {item.title}
                        </Link>

                        {/* Domain (muted, e.g., "github.com") */}
                        <span className="text-sm text-muted-foreground shrink-0">
                          {getDomain(item.url)}
                        </span>
                      </div>

                      {/* Right side: Actions dropdown (move to queue, archive, delete, etc.) */}
                      <ItemActions
                        itemId={item.id}
                        currentStatus={item.status}
                        onOpenChange={(open) =>
                          setOpenItemId(open ? item.id : null)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
