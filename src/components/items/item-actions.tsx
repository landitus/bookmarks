"use client";

import {
  toggleLater,
  toggleFavorite,
  archiveItem,
  deleteItem,
} from "@/lib/actions/items";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Archive, Clock, Copy, MoreVertical, Star, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

interface ItemActionsProps {
  itemId: string;
  url: string;
  isLater: boolean;
  isFavorite: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Always show the button (don't hide until hover) */
  alwaysVisible?: boolean;
}

export function ItemActions({
  itemId,
  url,
  isLater,
  isFavorite,
  onOpenChange,
  alwaysVisible = false,
}: ItemActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setOpen(false);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleToggleLater = () => {
    startTransition(async () => {
      await toggleLater(itemId);
      setOpen(false);
    });
  };

  const handleToggleFavorite = () => {
    startTransition(async () => {
      await toggleFavorite(itemId);
      setOpen(false);
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      await archiveItem(itemId);
      setOpen(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteItem(itemId);
      setOpen(false);
    });
  };

  return (
    <div
      className={cn(
        "shrink-0 transition-opacity",
        !alwaysVisible && "opacity-0 group-hover:opacity-100",
        open && "opacity-100"
      )}
    >
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              open && "bg-accent text-accent-foreground"
            )}
            disabled={isPending}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Copy Link */}
          <DropdownMenuItem onSelect={handleCopyLink}>
            <Copy className="h-4 w-4" />
            Copy link
          </DropdownMenuItem>

          {/* Toggle Later */}
          <DropdownMenuItem onSelect={handleToggleLater} disabled={isPending}>
            <Clock className={cn("h-4 w-4", isLater && "text-blue-500")} />
            {isLater ? "Remove from Later" : "Add to Later"}
          </DropdownMenuItem>

          {/* Toggle Favorite */}
          <DropdownMenuItem
            onSelect={handleToggleFavorite}
            disabled={isPending}
          >
            <Star
              className={cn(
                "h-4 w-4",
                isFavorite && "fill-yellow-400 text-yellow-400"
              )}
            />
            {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Archive */}
          <DropdownMenuItem onSelect={handleArchive} disabled={isPending}>
            <Archive className="h-4 w-4" />
            Archive
          </DropdownMenuItem>

          {/* Delete */}
          <DropdownMenuItem
            variant="destructive"
            onSelect={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
