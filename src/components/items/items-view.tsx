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

interface ItemsViewProps {
  items: Item[];
  emptyState?: React.ReactNode;
  addItemTargetStatus?: "inbox" | "library";
}

type ViewType = "gallery" | "list";

export function ItemsView({
  items,
  emptyState,
  addItemTargetStatus = "inbox",
}: ItemsViewProps) {
  const [view, setView] = useState<ViewType>("list");
  const [searchQuery, setSearchQuery] = useState("");

  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return "";
    }
  };

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: Item[] } = {};

    const filteredItems = items.filter((item) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(query) ||
        item.url?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    });

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

    // Sort items within groups by date desc
    Object.keys(groups).forEach((key) => {
      groups[key].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return groups;
  }, [items, searchQuery]);

  // Custom sort order for the groups
  const sortedGroupKeys = useMemo(() => {
    const keys = Object.keys(groupedItems);
    return keys.sort((a, b) => {
      if (a === "Today") return -1;
      if (b === "Today") return 1;
      if (a === "Yesterday") return -1;
      if (b === "Yesterday") return 1;

      // For days of week, we might want to sort by most recent date in the group
      const dateA = new Date(groupedItems[a][0].created_at).getTime();
      const dateB = new Date(groupedItems[b][0].created_at).getTime();
      return dateB - dateA;
    });
  }, [groupedItems]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <AddItemInput
              onSearch={setSearchQuery}
              targetStatus={addItemTargetStatus}
            />
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

        {items.length === 0 ? (
          emptyState || (
            <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed rounded-lg text-muted-foreground">
              <p>No items found.</p>
            </div>
          )
        ) : view === "gallery" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {sortedGroupKeys.map((groupKey) => (
              <div key={groupKey} className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground pl-2">
                  {groupKey}
                </h3>
                <div className="space-y-1">
                  {groupedItems[groupKey].map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between gap-4 p-1 rounded-lg hover:bg-accent/50 transition-colors pl-4"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Favicon */}
                        <Image
                          src={getFaviconUrl(item.url)}
                          alt=""
                          width={16}
                          height={16}
                          className="w-4 h-4 shrink-0"
                          unoptimized
                        />

                        {/* Title */}
                        <Link
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium truncate hover:underline"
                          title={item.title}
                        >
                          {item.title}
                        </Link>

                        {/* Domain */}
                        <span className="text-sm text-muted-foreground shrink-0">
                          {getDomain(item.url)}
                        </span>
                      </div>

                      <ItemActions
                        itemId={item.id}
                        currentStatus={item.status}
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
