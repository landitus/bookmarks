"use client";

import {
  keepItem,
  discardItem,
  restoreItem,
  toggleFavorite,
  deleteItem,
  refreshContent,
} from "@/lib/actions/items";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  Check,
  Copy,
  MoreVertical,
  RefreshCw,
  RotateCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// =============================================================================
// TYPES
// =============================================================================

export type ItemContext = "inbox" | "library" | "archive";

interface ItemActionsProps {
  itemId: string;
  url: string;
  isFavorite: boolean;
  isKept: boolean;
  isArchived: boolean;
  /** Context determines which actions to show */
  context?: ItemContext;
  onOpenChange?: (open: boolean) => void;
  /** Always show the button (don't hide until hover) */
  alwaysVisible?: boolean;
  /** Show inline triage buttons (for reader view) */
  showTriageButtons?: boolean;
  /** Custom handler for refresh content (used in reader view for loading state) */
  onRefreshContent?: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ItemActions({
  itemId,
  url,
  isFavorite,
  isKept,
  isArchived,
  context: explicitContext,
  onOpenChange,
  alwaysVisible = false,
  showTriageButtons = false,
  onRefreshContent,
}: ItemActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // Infer context from item state if not explicitly provided
  const context: ItemContext =
    explicitContext ?? inferContext(isKept, isArchived);

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

  const handleKeep = () => {
    startTransition(async () => {
      await keepItem(itemId);
      toast.success("Added to Library");
      setOpen(false);
    });
  };

  const handleDiscard = () => {
    startTransition(async () => {
      await discardItem(itemId);
      toast.success("Moved to Archive");
      setOpen(false);
    });
  };

  const handleRestore = () => {
    startTransition(async () => {
      await restoreItem(itemId);
      toast.success("Restored");
      setOpen(false);
    });
  };

  const handleToggleFavorite = () => {
    startTransition(async () => {
      const result = await toggleFavorite(itemId);
      toast.success(
        result.is_favorite ? "Added to Favorites" : "Removed from Favorites"
      );
      setOpen(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteItem(itemId);
      toast.success("Deleted permanently");
      setOpen(false);
    });
  };

  const handleRefreshContent = () => {
    setOpen(false);
    // Use custom handler if provided (for reader view loading state)
    if (onRefreshContent) {
      onRefreshContent();
      return;
    }
    // Default behavior: just trigger refresh silently
    startTransition(async () => {
      await refreshContent(itemId);
    });
  };

  return (
    <div
      className={cn(
        "shrink-0 flex items-center gap-1 transition-opacity",
        !alwaysVisible && "opacity-0 group-hover:opacity-100",
        (open || isPending) && "opacity-100"
      )}
    >
      {/* Inline triage buttons for Inbox items (shown in reader view) */}
      {showTriageButtons && context === "inbox" && (
        <>
          <Button
            variant="default"
            size="sm"
            onClick={handleKeep}
            disabled={isPending}
            className="gap-1.5"
          >
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">Keep</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDiscard}
            disabled={isPending}
            className="gap-1.5 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Discard</span>
          </Button>
        </>
      )}

      {/* Inline restore button for Archive items (shown in reader view) */}
      {showTriageButtons && context === "archive" && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestore}
          disabled={isPending}
          className="gap-1.5"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Restore</span>
        </Button>
      )}

      {/* Inline favorite toggle for Library items (shown in reader view) */}
      {showTriageButtons && context === "library" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleFavorite}
          disabled={isPending}
          className="gap-1.5"
        >
          <Star
            className={cn(
              "h-4 w-4",
              isFavorite && "fill-yellow-400 text-yellow-400"
            )}
          />
          <span className="hidden sm:inline">
            {isFavorite ? "Unfavorite" : "Favorite"}
          </span>
        </Button>
      )}

      {/* More actions dropdown */}
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
          {/* Copy Link - always available */}
          <DropdownMenuItem onSelect={handleCopyLink}>
            <Copy className="h-4 w-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={handleRefreshContent}
            disabled={isPending}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh content
          </DropdownMenuItem>

          {/* INBOX CONTEXT */}
          {context === "inbox" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleKeep} disabled={isPending}>
                <Check className="h-4 w-4" />
                Keep to Library
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDiscard} disabled={isPending}>
                <Archive className="h-4 w-4" />
                Discard
              </DropdownMenuItem>
            </>
          )}

          {/* LIBRARY CONTEXT */}
          {context === "library" && (
            <>
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
              <DropdownMenuItem onSelect={handleDiscard} disabled={isPending}>
                <Archive className="h-4 w-4" />
                Archive
              </DropdownMenuItem>
            </>
          )}

          {/* ARCHIVE CONTEXT */}
          {context === "archive" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleRestore} disabled={isPending}>
                <RotateCcw className="h-4 w-4" />
                Restore
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
                Delete permanently
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function inferContext(isKept: boolean, isArchived: boolean): ItemContext {
  if (isArchived) return "archive";
  if (isKept) return "library";
  return "inbox";
}
