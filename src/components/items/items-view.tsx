"use client";

import { useState, useMemo } from "react";
import { Item } from "@/lib/types";
import { ItemCard } from "@/components/items/item-card";
import { LayoutGrid, List, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ItemActions } from "@/components/items/item-actions";
import Link from "next/link";
import Image from "next/image";
import { AddItemInput } from "./add-item-input";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

// =============================================================================
// TYPES
// =============================================================================

interface ItemsViewProps {
  items: Item[]; // Array of bookmark items to display
  emptyState?: React.ReactNode; // Custom empty state component
}

type ViewType = "gallery" | "list"; // Toggle between card grid and list

// =============================================================================
// COMPONENT
// =============================================================================

export function ItemsView({ items, emptyState }: ItemsViewProps) {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const [view, setView] = useState<ViewType>("list"); // Current view mode
  const [searchQuery, setSearchQuery] = useState(""); // Search filter text
  const [openItemId, setOpenItemId] = useState<string | null>(null); // Track which item's menu is open

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
  // GROUPED ITEMS (for list view)
  // ---------------------------------------------------------------------------

  // Group items by relative date: "Today", "Yesterday", or day name
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: Item[] } = {};

    // Filter items by search query
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

      if (date.toDateString() === now.toDateString()) {
        key = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
      } else {
        key = date.toLocaleDateString("en-US", { weekday: "long" });
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

  // Sort group keys: Today first, then Yesterday, then by most recent
  const sortedGroupKeys = useMemo(() => {
    const keys = Object.keys(groupedItems);
    return keys.sort((a, b) => {
      if (a === "Today") return -1;
      if (b === "Today") return 1;
      if (a === "Yesterday") return -1;
      if (b === "Yesterday") return 1;

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
        {/* TOOLBAR: Search input + View toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <AddItemInput onSearch={setSearchQuery} />
          </div>

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

        {/* CONTENT: Empty state, Gallery view, or List view */}
        {items.length === 0 ? (
          emptyState || (
            <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
              <p>No items found.</p>
            </div>
          )
        ) : view === "gallery" ? (
          // GALLERY VIEW
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          // LIST VIEW
          <div className="space-y-8">
            {sortedGroupKeys.map((groupKey) => (
              <div key={groupKey} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground pl-2">
                  {groupKey}
                </h3>

                <div className="space-y-0">
                  {groupedItems[groupKey].map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "group flex items-center justify-between gap-4 p-1 rounded-lg hover:bg-accent/50 transition-colors pl-4",
                        openItemId === item.id && "bg-accent/50"
                      )}
                    >
                      {/* Left side: Favicon + Title + Domain + Badges */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
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
                            <Link
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium truncate hover:underline"
                            >
                              {item.title}
                            </Link>
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
                              <h4 className="font-semibold text-sm leading-tight line-clamp-2">
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

                        <span className="text-sm text-muted-foreground shrink-0">
                          {getDomain(item.url)}
                        </span>

                        {/* Status badges */}
                        {(item.is_later || item.is_favorite) && (
                          <div className="flex items-center gap-1 shrink-0">
                            {item.is_later && (
                              <Clock className="h-3.5 w-3.5 text-blue-500" />
                            )}
                            {item.is_favorite && (
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right side: Actions dropdown */}
                      <ItemActions
                        itemId={item.id}
                        isLater={item.is_later}
                        isFavorite={item.is_favorite}
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
