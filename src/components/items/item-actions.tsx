"use client";

import { updateItemStatus } from "@/lib/actions/items";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  BookMarked,
  Layers2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { ItemStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ItemActionsProps {
  itemId: string;
  currentStatus: ItemStatus;
  onOpenChange?: (open: boolean) => void;
}

export function ItemActions({
  itemId,
  currentStatus,
  onOpenChange,
}: ItemActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleStatusChange = (newStatus: ItemStatus) => {
    startTransition(async () => {
      await updateItemStatus(itemId, newStatus);
      setOpen(false);
    });
  };

  return (
    <div
      className={cn(
        "shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
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
          <DropdownMenuLabel className="text-muted-foreground">
            Move to
          </DropdownMenuLabel>

          {currentStatus !== "queue" && (
            <DropdownMenuItem
              onSelect={() => handleStatusChange("queue")}
              disabled={isPending}
            >
              <Layers2 className="h-4 w-4" />
              Queue
            </DropdownMenuItem>
          )}

          {currentStatus !== "library" && (
            <DropdownMenuItem
              onSelect={() => handleStatusChange("library")}
              disabled={isPending}
            >
              <BookMarked className="h-4 w-4" />
              Library
            </DropdownMenuItem>
          )}

          {currentStatus !== "archive" && (
            <DropdownMenuItem
              onSelect={() => handleStatusChange("archive")}
              disabled={isPending}
            >
              <Archive className="h-4 w-4" />
              Archive
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              // TODO: Implement delete functionality
            }}
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
